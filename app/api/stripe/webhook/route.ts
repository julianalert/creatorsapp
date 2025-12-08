import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Disable body parsing for webhook route
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.user_id
    const credits = session.metadata?.credits

    if (!userId || !credits) {
      console.error('Missing metadata in checkout session:', session.id)
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      )
    }

    try {
      // Add credits to user account using the database function
      const { data, error } = await supabaseAdmin.rpc('add_user_credits', {
        p_user_id: userId,
        p_credits_to_add: parseInt(credits, 10),
      })

      if (error) {
        console.error('Error adding credits:', error)
        return NextResponse.json(
          { error: 'Failed to add credits' },
          { status: 500 }
        )
      }

      console.log(`Added ${credits} credits to user ${userId}. New balance: ${data}`)

      // Optionally, you could create a payment record here
      // For now, we'll just add the credits

      return NextResponse.json({ received: true, creditsAdded: credits })
    } catch (error: any) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to process webhook' },
        { status: 500 }
      )
    }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error in webhook handler:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

