import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SCRAPING_BEE_ENDPOINT = 'https://app.scrapingbee.com/api/v1/'

export async function POST(request: Request) {
  const { url } = await request.json().catch(() => ({ url: null }))

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'A valid url is required.' }, { status: 400 })
  }

  try {
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are supported.' },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ error: 'Malformed URL provided.' }, { status: 400 })
  }

  const apiKey = process.env.SCRAPING_BEE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'ScrapingBee API key missing.' }, { status: 500 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('Supabase auth error while scraping website', authError)
  }

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const scrapingBeeUrl = new URL(SCRAPING_BEE_ENDPOINT)
  scrapingBeeUrl.searchParams.set('api_key', apiKey)
  scrapingBeeUrl.searchParams.set('url', url)
  scrapingBeeUrl.searchParams.set('return_page_markdown', 'true')

  let statusCode = 200
  let contentType = 'text/plain'
  let body = ''
  let markdown: string | null = null
  let statusValue: 'completed' | 'failed' = 'completed'
  let errorMessage: string | null = null

  try {
    const response = await fetch(scrapingBeeUrl, {
      headers: {
        Accept: 'application/json,text/markdown;q=0.9,text/plain;q=0.8,*/*;q=0.7',
      },
    })

    statusCode = response.status
    contentType = response.headers.get('content-type') ?? 'text/plain'

    const rawText = await response.text()
    body = rawText

    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(rawText)
        markdown =
          json?.markdown ??
          json?.page_markdown ??
          json?.data?.markdown ??
          json?.data?.page_markdown ??
          null
        body = JSON.stringify(json)
      } catch (parseError) {
        console.warn('Failed to parse ScrapingBee JSON response', parseError)
      }
    } else if (contentType.includes('text/markdown')) {
      markdown = rawText
    }

    if (!response.ok) {
      statusValue = 'failed'
      errorMessage = `ScrapingBee request failed with status ${response.status}.`
    }
  } catch (error) {
    console.error('ScrapingBee request error', error)
    statusValue = 'failed'
    errorMessage = 'Unexpected error while scraping the URL.'
    statusCode = 500
  }

  const scrapeResult = {
    contentType,
    body,
    markdown,
    status: statusCode,
    finalUrl: url,
    scrapedAt: new Date().toISOString(),
  }

  const {
    data: websiteRow,
    error: insertError,
  } = await supabase
    .from('website')
    .insert({
      user_id: user.id,
      url,
      status: statusValue,
      last_scraped_at: scrapeResult.scrapedAt,
      scrape_result: scrapeResult,
      error_message: errorMessage,
    })
    .select('id, status, url')
    .single()

  if (insertError) {
    console.error('Failed to store website scrape result', insertError)
    return NextResponse.json(
      { error: 'Failed to store scrape result.' },
      { status: 500 }
    )
  }

  if (statusValue === 'failed') {
    return NextResponse.json(
      {
        error: errorMessage ?? 'Failed to scrape the URL.',
        contentType,
        body,
        markdown,
        status: statusCode,
        finalUrl: url,
        websiteId: websiteRow?.id ?? null,
      },
      { status: statusCode }
    )
  }

  return NextResponse.json({
    contentType,
    body,
    markdown,
    status: statusCode,
    finalUrl: url,
    websiteId: websiteRow?.id ?? null,
  })
}
