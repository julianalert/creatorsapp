/**
 * Standardized Error Handling
 * 
 * Provides consistent error response format across all API routes.
 */

import { NextResponse } from 'next/server'
import { Logger } from './logger'

export interface ApiError {
  code: string
  message: string
  details?: unknown
  requestId?: string
}

/**
 * Standard error response format
 */
export class ApiErrorResponse {
  static success<T>(data: T, requestId?: string, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status }
    )
  }

  static error(
    message: string,
    code: string = 'INTERNAL_ERROR',
    status: number = 500,
    details?: unknown,
    requestId?: string
  ) {
    const error: ApiError = {
      code,
      message,
      requestId,
    }

    if (details && process.env.NODE_ENV === 'development') {
      error.details = details
    }

    // Log error
    Logger.error(message, undefined, {
      code,
      status,
      requestId,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error,
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status }
    )
  }

  static unauthorized(message = 'Unauthorized', requestId?: string) {
    return this.error(message, 'UNAUTHORIZED', 401, undefined, requestId)
  }

  static forbidden(message = 'Forbidden', requestId?: string) {
    return this.error(message, 'FORBIDDEN', 403, undefined, requestId)
  }

  static notFound(message = 'Resource not found', requestId?: string) {
    return this.error(message, 'NOT_FOUND', 404, undefined, requestId)
  }

  static badRequest(message: string, details?: unknown, requestId?: string) {
    return this.error(message, 'BAD_REQUEST', 400, details, requestId)
  }

  static rateLimited(message = 'Rate limit exceeded', retryAfter?: number, requestId?: string) {
    const response = this.error(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter }, requestId)
    
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }
    
    return response
  }

  static internalError(message = 'Internal server error', requestId?: string) {
    return this.error(message, 'INTERNAL_ERROR', 500, undefined, requestId)
  }
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
} as const

