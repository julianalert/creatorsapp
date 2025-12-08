import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/api-auth'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

/**
 * Validates Instagram handle format
 * Instagram handles: 1-30 characters, alphanumeric, underscores, periods
 */
function isValidInstagramHandle(handle: string): boolean {
  if (!handle || handle.length < 1 || handle.length > 30) {
    return false
  }
  // Instagram handles can contain letters, numbers, underscores, and periods
  return /^[a-zA-Z0-9._]+$/.test(handle)
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request)
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const handle = searchParams.get('handle')

    if (!handle) {
      return NextResponse.json(
        { error: 'Instagram handle is required' },
        { status: 400 }
      )
    }

    // Validate handle format
    if (!isValidInstagramHandle(handle)) {
      return NextResponse.json(
        { error: 'Invalid Instagram handle format' },
        { status: 400 }
      )
    }

    // SECURITY: Rate limiting to prevent abuse
    const rateLimit = checkRateLimit(user.id, RATE_LIMITS.EXTERNAL_API)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
        }
      )
    }

    const apiKey = process.env.SCRAPE_CREATORS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const apiUrl = new URL('https://api.scrapecreators.com/v1/instagram/profile')
    apiUrl.searchParams.append('handle', handle)
    apiUrl.searchParams.append('trim', 'true')

    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    })

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || `API request failed: ${apiResponse.statusText}` },
        { status: apiResponse.status }
      )
    }

    const data = await apiResponse.json()

    if (!data.success || !data.data) {
      return NextResponse.json(
        { error: 'Failed to retrieve Instagram profile data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data.data })
  } catch (error) {
    console.error('Instagram API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching Instagram data' },
      { status: 500 }
    )
  }
}

