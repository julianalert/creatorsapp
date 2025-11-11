import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SCRAPING_BEE_ENDPOINT = 'https://app.scrapingbee.com/api/v1/'
const OPENAI_RESPONSES_ENDPOINT =
  process.env.OPENAI_RESPONSES_ENDPOINT ?? 'https://api.openai.com/v1/responses'
const DEFAULT_BRAND_PROFILE_MODEL = 'gpt-5-nano'

type BrandProfileHeuristics = {
  currency_regions?: Array<{
    symbol: string
    region: string
    reasoning?: string
  }>
  niche_tags?: string[]
  notes?: string
}

type BrandProfile = {
  industry: string
  niche: string
  tone: string
  audience: string
  regions: string[]
  price_positioning: string
  keywords: string[]
  heuristics?: BrandProfileHeuristics
}

type BrandProfileResult = {
  profile: BrandProfile | null
  error: string | null
}

function sanitizeContext(input: string, maxLength = 15000) {
  return input.replace(/\0/g, '').slice(0, maxLength)
}

async function generateBrandProfile(params: {
  url: string
  context: string
}): Promise<BrandProfileResult> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return { profile: null, error: 'OpenAI API key missing.' }
  }

  const trimmedContext = sanitizeContext(params.context ?? '')

  if (!trimmedContext) {
    return { profile: null, error: 'No website content available for profiling.' }
  }

  const model = process.env.BRAND_PROFILE_MODEL ?? DEFAULT_BRAND_PROFILE_MODEL

  try {
    const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: [
                  'You are a senior brand strategist. Given website content, produce a concise but complete brand profile.',
                  'Respond with strictly valid JSON only (no markdown, no code fences, no commentary).',
                  'The JSON must match this TypeScript type: {"industry": string, "niche": string, "tone": string, "audience": string, "regions": string[], "price_positioning": string, "keywords": string[], "heuristics"?: {"currency_regions"?: Array<{"symbol": string, "region": string, "reasoning"?: string}>, "niche_tags"?: string[], "notes"?: string}}.',
                  'Use heuristics to infer region from currency symbols (€, £, $, etc.) and language clues.',
                  'Tag notable attributes such as “vegan”, “cruelty-free”, “SaaS”, “B2B”, etc. under heuristics.niche_tags when present.',
                  'When information is missing, infer the most reasonable answer and explain reasoning briefly in heuristics.notes.',
                ].join(' '),
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Website URL: ${params.url}\n\nScraped Website Content:\n${trimmedContext}`,
              },
            ],
          },
        ],
        metadata: {
          instructions: 'Return strictly valid JSON matching the provided schema with no additional commentary.',
        },
      }),
    })
    const responseText = await response.text()

    if (!response.ok) {
      let detailedMessage = `Failed to generate brand profile (status ${response.status}).`

      try {
        const errorJson = JSON.parse(responseText)
        const extractedMessage =
          errorJson?.error?.message ??
          errorJson?.message ??
          (typeof errorJson === 'string' ? errorJson : null)

        if (extractedMessage) {
          detailedMessage = `${detailedMessage} ${extractedMessage}`
        }
      } catch {
        if (responseText) {
          detailedMessage = `${detailedMessage} ${responseText.slice(0, 400)}`
        }
      }

      console.error('Failed to generate brand profile', response.status, responseText)
      return { profile: null, error: detailedMessage.trim() }
    }

    let responseJson: any
    try {
      responseJson = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Unable to parse OpenAI response JSON', parseError, responseText)
      return { profile: null, error: 'Unexpected response format from model.' }
    }

    let rawText: string | null = null

    if (typeof responseJson?.output_text === 'string') {
      rawText = responseJson.output_text
    }

    if (!rawText && Array.isArray(responseJson?.output)) {
      rawText = responseJson.output
        .flatMap((item: any) => {
          if (Array.isArray(item?.content)) {
            return item.content
          }
          return []
        })
        .filter((contentItem: any) => contentItem?.type === 'output_text' && typeof contentItem?.text === 'string')
        .map((contentItem: any) => contentItem.text)
        .join('')
        .trim()
    }

    if (
      !rawText &&
      Array.isArray(responseJson?.output) &&
      responseJson.output.some((item: any) => typeof item?.content === 'string')
    ) {
      rawText = responseJson.output
        .map((item: any) => (typeof item?.content === 'string' ? item.content : ''))
        .join('')
        .trim()
    }

    if (!rawText && Array.isArray(responseJson?.choices)) {
      rawText = responseJson.choices
        .map((choice: any) => choice?.message?.content ?? choice?.text ?? '')
        .join('')
        .trim()
    }

    if (!rawText) {
      console.error('Unexpected OpenAI response format', responseJson)
      return { profile: null, error: 'Received empty brand profile from model.' }
    }

    try {
      const parsedProfile = JSON.parse(rawText) as BrandProfile
      return { profile: parsedProfile, error: null }
    } catch (parseError) {
      console.error('Unable to parse brand profile JSON', parseError, rawText)
      return { profile: null, error: 'Brand profile was not valid JSON.' }
    }
  } catch (error) {
    console.error('OpenAI request for brand profile failed', error)
    return { profile: null, error: 'Unexpected error while generating brand profile.' }
  }
}

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

  let brandProfile: BrandProfile | null = null
  let brandProfileError: string | null = null

  const contextForBranding = markdown ?? body ?? ''

  if (websiteRow?.id && contextForBranding) {
    const brandProfileResult = await generateBrandProfile({
      url,
      context: contextForBranding,
    })

    brandProfile = brandProfileResult.profile
    brandProfileError = brandProfileResult.error

    if (brandProfile) {
      const { error: updateError } = await supabase
        .from('website')
        .update({ brand_profile: brandProfile })
        .eq('id', websiteRow.id)

      if (updateError) {
        console.error('Failed to persist brand profile', updateError)
        brandProfileError = 'Failed to store brand profile.'
      }
    }
  }

  return NextResponse.json({
    contentType,
    body,
    markdown,
    status: statusCode,
    finalUrl: url,
    websiteId: websiteRow?.id ?? null,
    brandProfile,
    brandProfileError,
  })
}
