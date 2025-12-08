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
    const nextMaxId = searchParams.get('next_max_id')

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

    // Validate nextMaxId if provided (should be alphanumeric string)
    if (nextMaxId && !/^[a-zA-Z0-9_-]+$/.test(nextMaxId)) {
      return NextResponse.json(
        { error: 'Invalid next_max_id format' },
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

    const apiUrl = new URL('https://api.scrapecreators.com/v2/instagram/user/posts')
    apiUrl.searchParams.append('handle', handle)
    apiUrl.searchParams.append('trim', 'true')
    if (nextMaxId) {
      apiUrl.searchParams.append('next_max_id', nextMaxId)
    }

    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    })

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      console.error('Posts API error response:', errorData)
      return NextResponse.json(
        { error: errorData.message || errorData.error || `API request failed: ${apiResponse.statusText}` },
        { status: apiResponse.status }
      )
    }

    const data = await apiResponse.json()
    console.log('Posts API response received, status:', data.status, 'has items:', !!data.items)

    // Check if response has status field (the API returns status: "ok" when successful)
    if (data.status && data.status !== 'ok') {
      console.error('Posts API status error:', data.status)
      return NextResponse.json(
        { error: `API returned status: ${data.status}` },
        { status: 500 }
      )
    }

    // Accept response if status is "ok" OR if it has items array (some API versions might not include status)
    if (data.status === 'ok' || (data.items && Array.isArray(data.items))) {
      return NextResponse.json({ success: true, data })
    }

    // If we get here, the response format is unexpected
    console.error('Posts API unexpected response format:', JSON.stringify(data).substring(0, 500))
    return NextResponse.json(
      { error: 'Unexpected response format from Instagram posts API' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Instagram Posts API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching Instagram posts data' },
      { status: 500 }
    )
  }
}

