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

  // SECURITY: Add timeout to prevent hanging requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

  try {
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

  // SECURITY: Add timeout to prevent hanging requests
  // Increased to 240 seconds to allow for complex OpenAI responses
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 240000) // 240 second timeout for AI calls

  try {
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
  const { url, conversionGoal } = await request.json().catch(() => ({ url: null, conversionGoal: null }))

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'A valid url is required.' }, { status: 400 })
  }

  if (!conversionGoal || typeof conversionGoal !== 'string') {
    return NextResponse.json({ error: 'A conversion goal is required.' }, { status: 400 })
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
    .eq('slug', 'conversion-rate-optimizer')
    .eq('is_active', true)
    .maybeSingle()

  if (agentError || !agent) {
    return NextResponse.json(
      { error: 'Agent not found or inactive' },
      { status: 404 }
    )
  }

  const creditCost = agent.credits || 2

  // Track start time
  const startedAt = new Date().toISOString()

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
    // Refund credits if scraping fails
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits after scrape failure:', refundError)
    }

    return NextResponse.json(
      { error: scrapeError ?? 'Failed to scrape the URL.' },
      { status: 500 }
    )
  }

  const sanitizedHtml = sanitizeContext(html)

  // Step 2: Conversion Rate Optimization Analysis
  const croPrompt = `You are a professional expert in Conversion Rate Optimization who helps business founders & CMOs improve their landing pages. You are a world-class expert in analysing landing pages, roasting them, and providing valuable Conversion Rate Optimization Ideas to help businesses increase conversions.  

GOAL

I want you to roast my landing page and deliver recommendations to improve the Conversion Rate. The conversion goal is: ${conversionGoal}

I will use this roast to understand what's wrong with my landing page and make improvements based on your recommendations. 

ROAST STRUCTURE

This framework consists of 2 blocks of insights: 

Roast: a detailed roast of my landing page.

Recommendations: 10 conversion rate optimization ideas based on your roast and analysis.

ROAST & RECOMMENDATIONS CRITERIA

For the Roast: Be friendly & casual. Talk like a human to another human. 

For the Roast: Be unconventional & fun. I don't want to be bored. A roast must agitate the reader's feelings. 

For the Roast: You will make a full landing page analysis, and explain what's wrong. You will use this analysis to make recommendations for The Recommendations.  

For the Recommendations: Be specific. Write exactly what I need to do. Your detailed description for each Conversion Rate Optimization Idea should be self-explanatory. For example, instead of saying "Rewrite your headline", give me improved ideas for the headline. Your job is to return advanced insights personalised only for my specific landing page. This is a critical law for you.

For the Recommendations: Be creative. Don't return trivial and outdated Conversion Rate Optimization ideas that the average marketer would recommend. Prioritise unconventional CRO tactics so I get real value from you here. Think like the top 0.1% conversion rate optimization expert.

For the Recommendations: Prioritise Conversion Rate Optimization Ideas that are relevant in the 2024 digital marketing space. 

For the Recommendations: Your Conversion Rate Optimization ideas must be impactful. Prioritise Conversion Rate Optimization Ideas that adds a wow effect.

For the Recommendations: Your Conversion Rate Optimization ideas must be easy to implement.

For the Recommendations: Personalise your ideas with references to the Roast you made. I don't want to read 10 generic ideas that can work for anyone (for example, "add a live chat" or "offer a free trial"). I need a 100% personalised response.

Here is the content of my landing page: ${sanitizedHtml}`

  const { result, error } = await callOpenAI(croPrompt)

  if (error) {
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
      { error: `Conversion rate optimization analysis failed: ${error}` },
      { status: 500 }
    )
  }

  // Track end time and calculate run time
  const endedAt = new Date().toISOString()
  const startedAtDate = new Date(startedAt)
  const endedAtDate = new Date(endedAt)
  const runTimeSeconds = Math.floor((endedAtDate.getTime() - startedAtDate.getTime()) / 1000)

  // Save result to Supabase
  const { data: savedResult, error: saveError } = await supabase
    .from('agent_results')
    .insert({
      user_id: user.id,
      agent_id: agent.id,
      agent_slug: 'conversion-rate-optimizer', // Keep for backward compatibility
      input_params: {
        url,
        conversionGoal,
      },
      result_data: {
        result,
        url,
        conversionGoal,
      },
      started_at: startedAt,
      ended_at: endedAt,
      run_time_seconds: runTimeSeconds,
    })
    .select()
    .single()

  if (saveError) {
    console.error('Error saving agent result:', saveError)
    // Still return the result even if saving fails
  }

  return NextResponse.json({
    success: true,
    result: result,
    url,
    conversionGoal,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

