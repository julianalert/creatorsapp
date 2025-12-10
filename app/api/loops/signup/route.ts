import { NextRequest } from 'next/server'
import { ApiErrorResponse } from '@/lib/utils/error-handler'
import { getRequestId, addRequestIdHeader } from '@/lib/utils/request-id'
import { addContactAndTriggerSignup } from '@/lib/utils/loops'

/**
 * POST /api/loops/signup
 * 
 * Adds a contact to Loops.so and triggers the signedUp event
 * This is an unauthenticated endpoint specifically for signup flows
 * (email and OAuth signups before user session is fully established)
 */
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  
  try {
    const body = await request.json()
    const { email, userId } = body

    if (!email || typeof email !== 'string') {
      const response = ApiErrorResponse.badRequest('Email is required', undefined, requestId)
      addRequestIdHeader(response, requestId)
      return response
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const response = ApiErrorResponse.badRequest('Invalid email format', undefined, requestId)
      addRequestIdHeader(response, requestId)
      return response
    }

    // Add contact to Loops.so and trigger signedUp event
    const result = await addContactAndTriggerSignup(email, userId)

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
    console.error('Error in /api/loops/signup:', error)
    const response = ApiErrorResponse.internalError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      requestId
    )
    addRequestIdHeader(response, requestId)
    return response
  }
}

