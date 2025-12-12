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
  scrapingBeeUrl.searchParams.set('render_js', 'false')
  scrapingBeeUrl.searchParams.set('premium_proxy', 'false')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

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

async function scrapeMultiplePages(baseUrl: string, paths: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {}
  
  for (const path of paths) {
    try {
      const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
      const { html, error } = await scrapeUrl(fullUrl)
      if (html && !error) {
        results[path] = sanitizeContext(html, 30000)
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      console.error(`Error scraping ${path}:`, err)
    }
  }
  
  return results
}

async function callOpenAI(prompt: string, systemPrompt?: string): Promise<{ result: string | null; error: string | null }> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return { result: null, error: 'OpenAI API key missing.' }
  }

  const model = process.env.BRAND_PROFILE_MODEL ?? DEFAULT_MODEL

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout for complex pages

  try {
    const inputMessages: any[] = []
    
    if (systemPrompt) {
      inputMessages.push({
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: systemPrompt,
          },
        ],
      })
    }

    inputMessages.push({
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: prompt,
        },
      ],
    })

    const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input: inputMessages,
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
  const body = await request.json().catch(() => ({}))
  const {
    yourDomain,
    competitorDomain,
    targetPersona = '',
    pricingModel = '',
    primaryCta = '',
    tone = 'confident, direct, not salesy',
  } = body

  if (!yourDomain || typeof yourDomain !== 'string') {
    return NextResponse.json({ error: 'Your domain is required.' }, { status: 400 })
  }

  if (!competitorDomain || typeof competitorDomain !== 'string') {
    return NextResponse.json({ error: 'Competitor domain is required.' }, { status: 400 })
  }

  // SECURITY: Validate URLs
  const yourUrl = validateUrl(yourDomain.startsWith('http') ? yourDomain : `https://${yourDomain}`, process.env.NODE_ENV === 'development')
  const competitorUrl = validateUrl(competitorDomain.startsWith('http') ? competitorDomain : `https://${competitorDomain}`, process.env.NODE_ENV === 'development')

  if (!yourUrl || !competitorUrl) {
    return NextResponse.json(
      { error: 'Invalid or unsafe URLs provided. Only public HTTPS URLs are allowed.' },
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

  // SECURITY: Rate limiting
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
    .eq('slug', 'alternatives-to-page-writer')
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
      { status: 402 }
    )
  }

  // Step 1: Scrape key pages from both sites
  const keyPages = [
    '', // Homepage
    '/features',
    '/pricing',
    '/integrations',
    '/security',
    '/about',
    '/case-studies',
    '/testimonials',
  ]

  // Scrape your site
  const yourSiteContent: Record<string, string> = {}
  for (const page of keyPages.slice(0, 5)) { // Limit to 5 pages per site for performance
    const fullUrl = page ? `${yourUrl}${page}` : yourUrl.toString()
    const { html, error } = await scrapeUrl(fullUrl)
    if (html && !error) {
      yourSiteContent[page || 'homepage'] = sanitizeContext(html, 30000)
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Scrape competitor site
  const competitorSiteContent: Record<string, string> = {}
  for (const page of keyPages.slice(0, 5)) {
    const fullUrl = page ? `${competitorUrl}${page}` : competitorUrl.toString()
    const { html, error } = await scrapeUrl(fullUrl)
    if (html && !error) {
      competitorSiteContent[page || 'homepage'] = sanitizeContext(html, 30000)
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Step 2: Extract structured data from both sites
  const extractionSystemPrompt = `You are an expert product analyst. Extract structured information from website content and return it as JSON.

Extract the following for each company:
- one_liner_positioning: One-line description of what the product does
- icp: Ideal customer profile / target audience
- key_features: Array of main features (grouped by category if possible)
- differentiators: Unique selling points or differentiators
- proof_points: Customer logos, testimonials, metrics (if visible)
- pricing_plans: Pricing information with constraints/limits
- onboarding_complexity: Setup time or complexity mentioned
- integrations: List of integrations mentioned
- security_compliance: Security certifications, compliance info
- support: Support channels mentioned (email, chat, SLAs)
- missing_features: Only if explicitly stated as limitations
- primary_cta: Main call-to-action on the site

For each extracted fact, include the source_url (which page it came from).

Return valid JSON only, no markdown, no code fences.`

  const extractionPrompt = `Extract structured data from the following website content.

YOUR SITE (${yourUrl.toString()}):
${JSON.stringify(yourSiteContent, null, 2)}

COMPETITOR SITE (${competitorUrl.toString()}):
${JSON.stringify(competitorSiteContent, null, 2)}

Return a JSON object with this structure:
{
  "your_site": { ...extracted fields... },
  "competitor_site": { ...extracted fields... }
}

Include source_url for each fact where possible.`

  const { result: extractedData, error: extractionError } = await callOpenAI(extractionPrompt, extractionSystemPrompt)

  if (extractionError) {
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }
    return NextResponse.json(
      { error: `Data extraction failed: ${extractionError}` },
      { status: 500 }
    )
  }

  // Step 3: Generate the comparison page
  const pageGenerationSystemPrompt = `You are an expert product marketer + SEO copywriter.

Goal: Write a high-converting, SEO-optimized "Alternatives to {COMPETITOR_NAME}" landing page for {MY_PRODUCT_NAME}, using ONLY the information provided in the Evidence Pack. Do not invent features, pricing, customers, metrics, or integrations.

Hard rules:
1) Every non-trivial claim must be supported by the Evidence Pack. If not supported, write "Not publicly stated" or omit.
2) Be fair: include 2–4 areas where the competitor is strong (if supported).
3) Prioritize clarity: short sentences, concrete benefits, avoid jargon.
4) Optimize for search intent: the reader is evaluating switching from competitor to us.
5) Output must be ready to publish in Markdown.

Process:
Step 1 — Build a Comparison Matrix:
- Create a table with 10–15 rows max, grouped by category (Core, Integrations, Security, Support, Pricing).
- Columns: Feature/Concern | {MY_PRODUCT_NAME} (Yes/Partial/No + short note) | {COMPETITOR_NAME} (Yes/Partial/No + short note) | Evidence URLs
- Use only evidence-backed rows.

Step 2 — Decide the Page Angle:
- Choose ONE primary positioning angle (e.g., "best for agencies", "simpler setup", "more flexible workflows", "better pricing clarity", "enterprise security").
- Justify the choice in 3 bullets, each citing evidence_url.

Step 3 — Write the Page (Markdown):
Use this exact structure:
- H1: Best Alternatives to {COMPETITOR_NAME} (2025)
- Intro (2 short paragraphs)
- TL;DR verdict (Who should choose us vs them)
- Comparison table (from Step 1)
- Why people look for alternatives to {COMPETITOR_NAME} (4–8 bullets, evidence-backed)
- {MY_PRODUCT_NAME} vs {COMPETITOR_NAME}: 5 section deep dive
  (Ease of use, Core capabilities, Integrations, Security/Compliance, Pricing/Packaging)
- Top alternatives to {COMPETITOR_NAME} (include {MY_PRODUCT_NAME} + 4–9 others)
  For each: Best for, Strengths, Tradeoffs, Starting price (if known), Source
  If other tools are not in Evidence Pack, mark them as "Not evaluated in this scrape" and keep it brief.
- Switching guide (3–6 steps) ONLY if evidence supports migration/export/import; otherwise omit.
- FAQ (5–8 questions)
- Final CTA

Step 4 — Quality checklist (at end):
- List any missing information that would improve accuracy
- List any statements you intentionally avoided because evidence was insufficient.

Output:
Return ONLY:
1) Comparison Matrix table
2) The final Markdown page
3) The Quality checklist`

  const pageGenerationPrompt = `Create an "Alternatives to {COMPETITOR_NAME}" page for {MY_PRODUCT_NAME}.

Inputs:
- My product: ${yourUrl.hostname}
- Competitor: ${competitorUrl.hostname}
- Target audience: ${targetPersona || 'Not specified'}
- Desired CTA: ${primaryCta || 'Not specified (infer from evidence)'}
- Tone: ${tone}

Evidence Pack (Extracted Data):
${extractedData}

Scraped Content Summary:
Your Site Pages Scraped: ${Object.keys(yourSiteContent).join(', ')}
Competitor Site Pages Scraped: ${Object.keys(competitorSiteContent).join(', ')}

Follow the process exactly as described in the system prompt. Generate the complete page with comparison matrix and quality checklist.`

  const { result: comparisonPage, error: pageError } = await callOpenAI(pageGenerationPrompt, pageGenerationSystemPrompt)

  if (pageError) {
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }
    return NextResponse.json(
      { error: `Page generation failed: ${pageError}` },
      { status: 500 }
    )
  }

  // Track end time
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
      agent_slug: 'alternatives-to-page-writer',
      input_params: {
        yourDomain: yourUrl.toString(),
        competitorDomain: competitorUrl.toString(),
        targetPersona,
        pricingModel,
        primaryCta,
        tone,
      },
      result_data: {
        result: comparisonPage,
        extractedData,
        yourSiteContent: Object.keys(yourSiteContent),
        competitorSiteContent: Object.keys(competitorSiteContent),
        yourDomain: yourUrl.toString(),
        competitorDomain: competitorUrl.toString(),
      },
      started_at: startedAt,
      ended_at: endedAt,
      run_time_seconds: runTimeSeconds,
    })
    .select()
    .single()

  if (saveError) {
    console.error('Error saving agent result:', saveError)
  }

  return NextResponse.json({
    success: true,
    result: comparisonPage,
    yourDomain: yourUrl.toString(),
    competitorDomain: competitorUrl.toString(),
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

