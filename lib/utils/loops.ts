/**
 * Loops.so API Integration
 * 
 * Utility functions for interacting with Loops.so API to manage contacts and events
 */

const LOOPS_API_KEY = process.env.LOOPS_API_KEY || ''
const LOOPS_API_URL = 'https://app.loops.so/api/v1'

interface LoopsAddContactResponse {
  success: boolean
  id?: string
  message?: string
}

interface LoopsSendEventResponse {
  success: boolean
  message?: string
}

/**
 * Add a contact to Loops.so audience
 */
export async function addContactToLoops(email: string, userId?: string): Promise<LoopsAddContactResponse> {
  if (!LOOPS_API_KEY) {
    console.error('LOOPS_API_KEY is not configured')
    return { success: false, message: 'Loops API key not configured' }
  }

  try {
    const response = await fetch(`${LOOPS_API_URL}/contacts/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        userId, // Optional user ID for tracking
        source: 'signup',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Loops.so returns 400 if contact already exists, which is fine
      if (response.status === 400 && data.message?.includes('already exists')) {
        return { success: true, message: 'Contact already exists in Loops' }
      }
      
      console.error('Loops.so API error:', data)
      return { success: false, message: data.message || 'Failed to add contact to Loops' }
    }

    return { success: true, id: data.id, message: 'Contact added successfully' }
  } catch (error) {
    console.error('Error adding contact to Loops.so:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

/**
 * Trigger an event in Loops.so
 */
export async function triggerLoopsEvent(email: string, eventName: string, data?: Record<string, unknown>): Promise<LoopsSendEventResponse> {
  if (!LOOPS_API_KEY) {
    console.error('LOOPS_API_KEY is not configured')
    return { success: false, message: 'Loops API key not configured' }
  }

  try {
    const response = await fetch(`${LOOPS_API_URL}/events/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        eventName,
        ...data,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Loops.so event API error:', result)
      return { success: false, message: result.message || 'Failed to trigger event in Loops' }
    }

    return { success: true, message: 'Event triggered successfully' }
  } catch (error) {
    console.error('Error triggering Loops.so event:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

/**
 * Add contact and trigger signedUp event in one call
 */
export async function addContactAndTriggerSignup(email: string, userId?: string): Promise<{ success: boolean; message: string }> {
  // Add contact first
  const addContactResult = await addContactToLoops(email, userId)
  
  if (!addContactResult.success && !addContactResult.message?.includes('already exists')) {
    return {
      success: false,
      message: `Failed to add contact: ${addContactResult.message}`,
    }
  }

  // Trigger the signedUp event
  const eventResult = await triggerLoopsEvent(email, 'signedUp', {
    userId,
    timestamp: new Date().toISOString(),
  })

  if (!eventResult.success) {
    // Contact was added but event failed - log but don't fail completely
    console.warn('Contact added but event trigger failed:', eventResult.message)
    return {
      success: true, // Still consider it successful since contact was added
      message: `Contact added but event trigger failed: ${eventResult.message}`,
    }
  }

  return {
    success: true,
    message: 'Contact added and event triggered successfully',
  }
}

