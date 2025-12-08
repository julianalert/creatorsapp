import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST: Rate an agent (1-5 stars)
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
    const { agentId, rating } = await request.json()

    if (!agentId || typeof agentId !== 'string') {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('is_active', true)
      .maybeSingle()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Insert or update rating (using upsert with ON CONFLICT)
    const { data: ratingData, error: ratingError } = await supabase
      .from('agent_ratings')
      .upsert(
        {
          user_id: user.id,
          agent_id: agentId,
          rating: Math.round(rating), // Ensure it's an integer
        },
        {
          onConflict: 'user_id,agent_id',
        }
      )
      .select()
      .single()

    if (ratingError) {
      console.error('Error saving rating:', ratingError)
      return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
    }

    // Note: The trigger should automatically update agent stats
    // If stats are not updating, run the fix SQL script: supabase_agent_ratings_trigger_fix.sql

    // Fetch updated agent stats
    const { data: updatedAgent } = await supabase
      .from('agents')
      .select('rating_count, rating_average')
      .eq('id', agentId)
      .single()

    return NextResponse.json({
      success: true,
      rating: ratingData,
      agentStats: updatedAgent,
    })
  } catch (error) {
    console.error('Error in rate endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Get user's rating for an agent
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agent_id')

  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
  }

  const { data: rating, error } = await supabase
    .from('agent_ratings')
    .select('*')
    .eq('user_id', user.id)
    .eq('agent_id', agentId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching rating:', error)
    return NextResponse.json({ error: 'Failed to fetch rating' }, { status: 500 })
  }

  return NextResponse.json({ success: true, rating: rating || null })
}

