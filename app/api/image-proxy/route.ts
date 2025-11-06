import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates that a URL is a safe Instagram CDN URL
 * Uses URL parsing instead of regex for better security
 */
function isValidInstagramUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    
    // Must be HTTPS
    if (url.protocol !== 'https:') {
      return false
    }
    
    // Whitelist of allowed Instagram CDN domains
    const allowedDomains = [
      'instagram.com',
      'cdninstagram.com',
      'fbcdn.net',
    ]
    
    // Check if hostname matches allowed domains
    const hostname = url.hostname.toLowerCase()
    
    // Exact match or subdomain match
    for (const domain of allowedDomains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        // Additional check: ensure no private IP ranges (SSRF protection)
        // This is handled by fetch, but we validate anyway
        if (hostname.includes('localhost') || 
            hostname.includes('127.') ||
            hostname.includes('192.168.') ||
            hostname.includes('10.') ||
            hostname.includes('172.')) {
          return false
        }
        return true
      }
    }
    
    return false
  } catch {
    // Invalid URL format
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Validate that it's a safe Instagram CDN URL using URL parsing
    if (!isValidInstagramUrl(imageUrl)) {
      return NextResponse.json(
        { error: 'Invalid image URL. Only Instagram CDN URLs are allowed.' },
        { status: 400 }
      )
    }

    // Fetch the image with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'Referer': 'https://www.instagram.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!imageResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch image' },
          { status: imageResponse.status }
        )
      }

      // Validate content type is an image
      const contentType = imageResponse.headers.get('content-type') || ''
      if (!contentType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        )
      }

      // Limit response size to prevent DoS (10MB max)
      const contentLength = imageResponse.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image too large' },
          { status: 400 }
        )
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      
      // Double-check size after download
      if (imageBuffer.byteLength > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image too large' },
          { status: 400 }
        )
      }

      // Return the image with appropriate headers
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        )
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
}

