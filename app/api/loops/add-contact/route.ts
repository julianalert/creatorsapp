import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiErrorResponse } from '@/lib/utils/error-handler'
import { getRequestId, addRequestIdHeader } from '@/lib/utils/request-id'
import { addContactAndTriggerSignup } from '@/lib/utils/loops'

/**
 * POST /api/loops/add-contact
 * 
 * Adds a contact to Loops.so and triggers the signedUp event
 * Requires authentication to ensure only authenticated users can trigger this
 */
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  
  try {
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

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      const response = ApiErrorResponse.badRequest('Email is required', undefined, requestId)
      addRequestIdHeader(response, requestId)
      return response
    }

    // Verify the email matches the authenticated user's email
    if (email !== user.email) {
      const response = ApiErrorResponse.forbidden('Email does not match authenticated user', requestId)
      addRequestIdHeader(response, requestId)
      return response
    }

    // Add contact to Loops.so and trigger signedUp event
    const result = await addContactAndTriggerSignup(email, user.id)

    if (!result.success) {
      console.error('Failed to add contact to Loops.so:', result.message)
      // Don't fail the request if Loops.so fails - log it but return success
      // This ensures user signup still succeeds even if Loops.so is down
    }

    const response = ApiErrorResponse.success(
      {
        success: result.success,
        message: result.message,
      },
      requestId
    )
    addRequestIdHeader(response, requestId)
    return response
  } catch (error) {
    console.error('Error in /api/loops/add-contact:', error)
    const response = ApiErrorResponse.internalError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      requestId
    )
    addRequestIdHeader(response, requestId)
    return response
  }
}

