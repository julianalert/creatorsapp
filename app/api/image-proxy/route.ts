import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  // SECURITY: Validate URL to prevent SSRF attacks
  try {
    const url = new URL(imageUrl)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
    }
    // Only allow OpenAI CDN URLs for security
    if (!url.hostname.includes('oaidalleapiprodscus')) {
      return NextResponse.json({ error: 'Invalid image source' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      )
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="generated-image.png"',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}
