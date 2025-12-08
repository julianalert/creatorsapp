import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { requestText } = await request.json()

    if (!requestText || typeof requestText !== 'string' || requestText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Request text is required' },
        { status: 400 }
      )
    }

    if (requestText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide more details about the agent you want (minimum 10 characters)' },
        { status: 400 }
      )
    }

    // Save request to Supabase
    const { data: savedRequest, error: saveError } = await supabase
      .from('agent_requests')
      .insert({
        user_id: user.id,
        request_text: requestText.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving agent request:', saveError)
      return NextResponse.json(
        { error: 'Failed to submit request. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: savedRequest,
      message: 'Your agent request has been submitted successfully!',
    })
  } catch (error) {
    console.error('Error processing agent request:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

