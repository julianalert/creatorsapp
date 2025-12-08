import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch all active agents
export async function GET(request: Request) {
  const supabase = await createClient()
  
  // SECURITY: Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const slug = searchParams.get('slug')
  const includeInactive = searchParams.get('include_inactive') === 'true'

  let query = supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (slug) {
    query = query.eq('slug', slug)
  }

  const queryResult = slug ? query.maybeSingle() : query
  const { data, error } = await queryResult

  if (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

