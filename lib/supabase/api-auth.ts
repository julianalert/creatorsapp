import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Middleware to verify user authentication for API routes
 * Returns the authenticated user or null if not authenticated
 */
export async function requireAuth(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}
