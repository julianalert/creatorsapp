import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUrl } from '@/lib/utils/url-validation'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const SCRAPING_BEE_ENDPOINT = 'https://app.scrapingbee.com/api/v1/'
const OPENAI_RESPONSES_ENDPOINT =
  process.env.OPENAI_RESPONSES_ENDPOINT ?? 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = 'gpt-5-nano'

function sanitizeContext(input: string, maxLength = 50000) {
  return input.replace(/\0/g, '').slice(0, maxLength)
}

async function scrapeUrl(url: string): Promise<{ html: string | null; error: string | null }> {
  const apiKey = process.env.SCRAPING_BEE_API_KEY

  if (!apiKey) {
    return { html: null, error: 'ScrapingBee API key missing.' }
  }

  const scrapingBeeUrl = new URL(SCRAPING_BEE_ENDPOINT)
  scrapingBeeUrl.searchParams.set('api_key', apiKey)
  scrapingBeeUrl.searchParams.set('url', url)
  // Request HTML source code
  scrapingBeeUrl.searchParams.set('render_js', 'false')
  scrapingBeeUrl.searchParams.set('premium_proxy', 'false')

  try {
    // SECURITY: Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(scrapingBeeUrl, {
      headers: {
        Accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { html: null, error: `ScrapingBee request failed with status ${response.status}.` }
    }

    const contentType = response.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const json = await response.json()
      // Try multiple possible fields for HTML content
      const html = json?.html ?? 
                   json?.page_source ?? 
                   json?.body ?? 
                   json?.data?.html ?? 
                   json?.data?.page_source ?? 
                   json?.data?.body ?? 
                   null
      return { html, error: html ? null : 'No HTML content found in response.' }
    } else if (contentType.includes('text/html')) {
      const html = await response.text()
      return { html, error: null }
    } else {
      // Fallback: try to get text anyway
      const html = await response.text()
      return { html: html || null, error: html ? null : 'Unexpected content type from ScrapingBee.' }
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return { html: null, error: 'Request timeout while scraping the URL.' }
    }
    console.error('ScrapingBee request error', error)
    return { html: null, error: 'Unexpected error while scraping the URL.' }
  }
}

async function callOpenAI(prompt: string): Promise<{ result: string | null; error: string | null }> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return { result: null, error: 'OpenAI API key missing.' }
  }

  const model = process.env.BRAND_PROFILE_MODEL ?? DEFAULT_MODEL

  try {
    // SECURITY: Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for AI calls

    const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    clearTimeout(timeoutId)
    const responseText = await response.text()

    if (!response.ok) {
      let detailedMessage = `Failed to call OpenAI (status ${response.status}).`
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
      return { result: null, error: detailedMessage.trim() }
    }

    let responseJson: any
    try {
      responseJson = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Unable to parse OpenAI response JSON', parseError, responseText)
      return { result: null, error: 'Unexpected response format from model.' }
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
      return { result: null, error: 'Received empty response from model.' }
    }

    return { result: rawText, error: null }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return { result: null, error: 'Request timeout while calling OpenAI.' }
    }
    console.error('OpenAI request failed', error)
    return { result: null, error: 'Unexpected error while calling OpenAI.' }
  }
}

export async function POST(request: Request) {
  const { url } = await request.json().catch(() => ({ url: null }))

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'A valid url is required.' }, { status: 400 })
  }

  // SECURITY: Validate URL to prevent SSRF attacks
  const parsedUrl = validateUrl(url, process.env.NODE_ENV === 'development')
  if (!parsedUrl) {
    return NextResponse.json(
      { error: 'Invalid or unsafe URL provided. Only public HTTPS URLs are allowed.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('Supabase auth error', authError)
  }

  if (!user) {
    return NextResponse.json({ error: 'You must signup or log in to use this ai agent' }, { status: 401 })
  }

  // SECURITY: Rate limiting to prevent abuse
  const rateLimit = checkRateLimit(user.id, RATE_LIMITS.EXPENSIVE)
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

  // Get agent to check credit cost
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, credits')
    .eq('slug', 'on-page-seo-audit')
    .eq('is_active', true)
    .maybeSingle()

  if (agentError || !agent) {
    return NextResponse.json(
      { error: 'Agent not found or inactive' },
      { status: 404 }
    )
  }

  const creditCost = agent.credits || 1

  // Check and deduct credits atomically
  const { data: newBalance, error: creditError } = await supabase.rpc('deduct_user_credits', {
    p_user_id: user.id,
    p_credits_to_deduct: creditCost,
  })

  if (creditError) {
    console.error('Error deducting credits:', creditError)
    return NextResponse.json(
      { error: 'Failed to process credits. Please try again.' },
      { status: 500 }
    )
  }

  if (newBalance === null) {
    return NextResponse.json(
      { 
        error: `Insufficient credits. This agent costs ${creditCost} credit${creditCost !== 1 ? 's' : ''}. Please purchase more credits.`,
        insufficientCredits: true,
      },
      { status: 402 } // 402 Payment Required
    )
  }

  // Step 1: Scrape the URL
  const { html, error: scrapeError } = await scrapeUrl(url)

  if (scrapeError || !html) {
    return NextResponse.json(
      { error: scrapeError ?? 'Failed to scrape the URL.' },
      { status: 500 }
    )
  }

  const sanitizedHtml = sanitizeContext(html)

  // Step 2: Technical SEO Audit
  const technicalSEOPrompt = `You are the best SEO Manager in the country—a world-class expert in optimizing websites to rank on Google.

In this task, you will analyze the HTML code of a webpage and perform a detailed and structured On-Page Technical SEO Audit.

Audit Structure

You will review all technical SEO aspects of the page. Once completed, you will present your findings and recommendations in clear, organized bullet points, categorized into three sections:

- Critical Issues – Must be fixed immediately.

- Quick Wins – Easy fixes with a big impact.

- Opportunities for Improvement – Require more effort but offer potential benefits.

Ensure the output is properly formatted, clean, and highly readable. Do not include any introductory or explanatory text—only the audit findings.

When you explain what to do, use examples you found in the source code to illustrate your point and make it personalized. You don't want to sound generic. The reader must understand the advices are made for his website.

Here is the content of my landing page: ${sanitizedHtml}`

  const { result: technicalResult, error: technicalError } = await callOpenAI(technicalSEOPrompt)

  if (technicalError) {
    // If agent execution fails, refund the credits
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }

    return NextResponse.json(
      { error: `Technical SEO audit failed: ${technicalError}` },
      { status: 500 }
    )
  }

  // Step 3: Content SEO Audit
  const contentSEOPrompt = `You are the best SEO Manager in the country—a world-class expert in optimizing websites to rank on Google.

In this task, you will analyze the content of the webpage and perform a detailed and structured SEO Content Audit.

Audit Structure

You will divide your audit in 2 parts:

- The first part is the Analysis

- The second is the Recommendations

In the Analysis, you will include:

- Content Quality Assessment – Evaluate the content's overall quality, accuracy, and relevance to the target audience.

- Keyword Research and Analysis – Identify primary and secondary keywords, keyword density, and keyword placement strategies.

- Readability Analysis – Assess the content's readability score using metrics such as Flesch-Kincaid Grade Level, Flesch Reading Ease, and Gunning-Fog Index.

In the Recommendations, you will present your recommendations and actionable suggestions in clear, organized bullet points. Recommendations must improve the rankings in Google but also the user engagement. 

Ensure the output is properly formatted, clean, and highly readable. Do not include any introductory or explanatory text—only the audit findings.

When you explain what to do, use examples you found in the source code to illustrate your point and make it personalized. You don't want to sound generic. The reader must understand the advices are made for his website.

Here is the content of my landing page: ${sanitizedHtml}`

  const { result: contentResult, error: contentError } = await callOpenAI(contentSEOPrompt)

  if (contentError) {
    // If agent execution fails, refund the credits
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }

    return NextResponse.json(
      { error: `Content SEO audit failed: ${contentError}` },
      { status: 500 }
    )
  }

  // Step 4: Merge results
  const mergedResult = `# Technical SEO Audit\n\n${technicalResult}\n\n---\n\n# Content SEO Audit\n\n${contentResult}`

  // Save result to Supabase
  const { data: savedResult, error: saveError } = await supabase
    .from('agent_results')
    .insert({
      user_id: user.id,
      agent_id: agent.id,
      agent_slug: 'on-page-seo-audit', // Keep for backward compatibility
      input_params: {
        url,
      },
      result_data: {
        result: mergedResult,
        technicalResult,
        contentResult,
        url,
      },
    })
    .select()
    .single()

  if (saveError) {
    console.error('Error saving agent result:', saveError)
    // Still return the result even if saving fails
  }

  return NextResponse.json({
    success: true,
    result: mergedResult,
    url,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

