import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to submit feedback.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { agentId, feedbackText } = body

    // Validate input
    if (!agentId || !feedbackText || feedbackText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Agent ID and feedback text are required.' },
        { status: 400 }
      )
    }

    // Validate feedback length
    if (feedbackText.trim().length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Feedback text must be 5000 characters or less.' },
        { status: 400 }
      )
    }

    // Verify agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('is_active', true)
      .maybeSingle()

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found.' },
        { status: 404 }
      )
    }

    // Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from('agent_feedback')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        feedback_text: feedbackText.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit feedback. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Thank you for your feedback!',
    })
  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

