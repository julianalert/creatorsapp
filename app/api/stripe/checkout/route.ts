import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Credit packages configuration
const CREDIT_PACKAGES: Record<string, { credits: number; price: number }> = {
  '100': { credits: 100, price: 1700 }, // $17.00 in cents
  '500': { credits: 500, price: 8500 }, // $85.00 in cents
  '1000': { credits: 1000, price: 9700 }, // $97.00 in cents
}

export async function POST(request: NextRequest) {
  try {
    // Check if using test mode keys
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not configured' },
        { status: 500 }
      )
    }

    if (secretKey.startsWith('sk_live_')) {
      console.warn('⚠️  Using production Stripe keys. For testing, use test keys (sk_test_...)')
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY: Rate limiting to prevent abuse
    const rateLimit = checkRateLimit(user.id, RATE_LIMITS.CREDITS)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
        }
      )
    }

    const body = await request.json()
    const { packageId } = body

    if (!packageId || !CREDIT_PACKAGES[packageId]) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      )
    }

    const packageData = CREDIT_PACKAGES[packageId]
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${packageData.credits} Credits`,
              description: 'AI Agent Credits - One-time payment',
            },
            unit_amount: packageData.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/credits?canceled=true`,
      customer_email: user.email || undefined,
      metadata: {
        user_id: user.id,
        credits: packageData.credits.toString(),
        package_id: packageId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

