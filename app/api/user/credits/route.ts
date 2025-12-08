import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiErrorResponse } from '@/lib/utils/error-handler'
import { getRequestId, addRequestIdHeader } from '@/lib/utils/request-id'

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request)
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    const response = ApiErrorResponse.unauthorized('Authentication required', requestId)
    addRequestIdHeader(response, requestId)
    return response
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
      const response = ApiErrorResponse.internalError('Failed to fetch credits', requestId)
      addRequestIdHeader(response, requestId)
      return response
    }

    const response = ApiErrorResponse.success({ credits: creditsData?.credits ?? 0 }, requestId)
    addRequestIdHeader(response, requestId)
    return response
  }

  const response = ApiErrorResponse.success({ credits: data ?? 0 }, requestId)
  addRequestIdHeader(response, requestId)
  return response
}

