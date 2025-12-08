import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Manual credit addition endpoint for testing
 * This allows you to manually add credits after a successful payment
 * when webhooks aren't set up yet.
 * 
 * ⚠️ SECURITY: This endpoint is DISABLED in production for security reasons.
 * Only use webhooks for production credit additions.
 * 
 * Usage: POST /api/stripe/manual-credit
 * Body: { sessionId: "cs_test_..." }
 */
export async function POST(request: NextRequest) {
  // SECURITY: Disable this endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production. Use webhooks instead.' },
      { status: 403 }
    )
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Session does not belong to this user' },
        { status: 403 }
      )
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      )
    }

    const credits = session.metadata?.credits
    if (!credits) {
      return NextResponse.json(
        { error: 'No credits found in session metadata' },
        { status: 400 }
      )
    }

    // Add credits using Supabase admin client (service role)
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data, error } = await supabaseAdmin.rpc('add_user_credits', {
      p_user_id: user.id,
      p_credits_to_add: parseInt(credits, 10),
    })

    if (error) {
      console.error('Error adding credits:', error)
      // Don't expose internal error details in response
      return NextResponse.json(
        { error: 'Failed to add credits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      creditsAdded: parseInt(credits, 10),
      newBalance: data,
      message: `Successfully added ${credits} credits. New balance: ${data}`,
    })
  } catch (error: any) {
    console.error('Error in manual credit addition:', error)
    // Don't expose internal error details in response
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    )
  }
}

