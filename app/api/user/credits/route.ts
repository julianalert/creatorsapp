import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user credits using the function
  const { data, error } = await supabase.rpc('get_user_credits', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('Error fetching user credits:', error)
    // If function fails, try direct query
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .maybeSingle()

    if (creditsError) {
      return NextResponse.json(
        { error: 'Failed to fetch credits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      credits: creditsData?.credits ?? 0,
    })
  }

  return NextResponse.json({
    success: true,
    credits: data ?? 0,
  })
}

