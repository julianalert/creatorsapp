/**
 * Rate Limiting Utilities
 * 
 * Provides rate limiting functionality to prevent API abuse and DoS attacks.
 * 
 * NOTE: This is a simple in-memory implementation. For production at scale,
 * consider using Redis or a dedicated rate limiting service.
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (clears on server restart)
// For production, use Redis or similar
const store: RateLimitStore = {}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}, 60000) // Clean up every minute

/**
 * Checks if a request should be rate limited
 * 
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `${identifier}:${config.windowMs}`
  
  const entry = store[key]
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }
  
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }
  
  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Expensive operations (scraping, AI calls)
  EXPENSIVE: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Credit operations
  CREDITS: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // External API calls
  EXTERNAL_API: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // General API
  GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Authentication endpoints
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
} as const

/**
 * Creates rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': remaining.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  }
}

