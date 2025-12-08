import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch agent results for the current user
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
  const agentSlug = searchParams.get('agent_slug')
  const agentId = searchParams.get('agent_id')
  const resultId = searchParams.get('id')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('agent_results')
    .select('*, agents(*)')
    .eq('user_id', user.id)

  if (resultId) {
    // Single result query
    query = query.eq('id', resultId).maybeSingle()
  } else {
    // Multiple results query
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (agentId) {
      query = query.eq('agent_id', agentId)
    } else if (agentSlug) {
      // Fallback to slug if agent_id not provided
      query = query.eq('agent_slug', agentSlug)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching agent results:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

