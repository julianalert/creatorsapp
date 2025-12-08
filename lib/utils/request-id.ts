/**
 * Request ID Generation and Tracking
 * 
 * Provides unique request IDs for tracing requests across services.
 */

import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

/**
 * Generates a unique request ID
 */
export function generateRequestId(): string {
  return randomBytes(16).toString('hex')
}

/**
 * Gets request ID from headers or generates a new one
 */
export function getRequestId(request: Request): string {
  const headerId = request.headers.get('x-request-id')
  return headerId || generateRequestId()
}

/**
 * Adds request ID to response headers
 */
export function addRequestIdHeader(response: NextResponse, requestId: string): void {
  response.headers.set('X-Request-ID', requestId)
}

