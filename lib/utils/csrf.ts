/**
 * CSRF Protection Utilities
 * 
 * Provides CSRF token generation and validation to prevent Cross-Site Request Forgery attacks.
 */

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_TOKEN_MAX_AGE = 60 * 60 * 24 // 24 hours

/**
 * Generates a secure CSRF token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Gets or creates a CSRF token for the current session
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (!token) {
    token = generateToken()
    cookieStore.set(CSRF_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_MAX_AGE,
      path: '/',
    })
  }

  return token
}

/**
 * Validates a CSRF token
 */
export async function validateCsrfToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false
  }

  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (!storedToken) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return constantTimeEqual(token, storedToken)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Validates Origin header for CSRF protection
 * This is a simpler alternative to CSRF tokens for API routes
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow same-origin requests (no origin header)
  if (!origin) {
    return true
  }

  // Get expected origin from environment or request
  const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || 
    (referer ? new URL(referer).origin : null)

  if (!expectedOrigin) {
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    return false
  }

  try {
    const originUrl = new URL(origin)
    const expectedUrl = new URL(expectedOrigin)

    return originUrl.origin === expectedUrl.origin
  } catch {
    return false
  }
}

