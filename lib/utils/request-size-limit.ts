/**
 * Request Size Limit Utilities
 * 
 * Provides request size validation for API routes.
 * Note: Next.js 16 doesn't support api.bodyParser in next.config.js,
 * so we handle size limits in route handlers instead.
 */

const MAX_BODY_SIZE = 1 * 1024 * 1024 // 1MB
const MAX_RESPONSE_SIZE = 8 * 1024 * 1024 // 8MB

/**
 * Validates request body size
 * 
 * @param request - The incoming request
 * @returns Error response if size exceeds limit, null otherwise
 */
export async function validateRequestSize(request: Request): Promise<Response | null> {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (size > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Request body too large. Maximum size is ${MAX_BODY_SIZE / 1024 / 1024}MB`,
          },
        }),
        {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
  
  return null
}

/**
 * Gets the maximum body size in bytes
 */
export function getMaxBodySize(): number {
  return MAX_BODY_SIZE
}

/**
 * Gets the maximum response size in bytes
 */
export function getMaxResponseSize(): number {
  return MAX_RESPONSE_SIZE
}

