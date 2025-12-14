import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUrl } from '@/lib/utils/url-validation'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const SCRAPING_BEE_ENDPOINT = 'https://app.scrapingbee.com/api/v1/'
const OPENAI_RESPONSES_ENDPOINT =
  process.env.OPENAI_RESPONSES_ENDPOINT ?? 'https://api.openai.com/v1/responses'
const DEFAULT_BRAND_PROFILE_MODEL = 'gpt-5-nano'

// Comprehensive Brand Profile Schema
type BrandProfile = {
  company: {
    name: string
    domain: string
    product: string
    category: string
    one_liner: string
    elevator_pitch: string
  }
  audience: {
    icp_primary: string
    icp_secondary?: string
    pains: string[]
    desires: string[]
    objections: string[]
  }
  positioning: {
    value_props: Array<{ text: string; rank: number }>
    differentiators: string[]
    competitors_mentioned: string[]
    why_now_angle: string
  }
  voice_and_tone: {
    tone_sliders: {
      playful?: number // 0-5
      authoritative?: number
      friendly?: number
      professional?: number
      casual?: number
      formal?: number
    }
    writing_style_rules: {
      sentence_length: string // e.g., "short", "medium", "long", "varied"
      punctuation: string // e.g., "minimal", "standard", "liberal"
      emoji_usage: 'yes' | 'no' | 'sparingly'
    }
    vocabulary_preferences: {
      preferred_terms: string[]
      banned_terms: string[]
    }
  }
  style_guide: {
    capitalization_rules: string
    formatting_rules: {
      bullets: string
      headings: string
      cta_style: string
    }
    do_dont_examples: {
      do: string[]
      dont: string[]
    }
  }
  messaging_assets: {
    ctas: {
      primary: string[]
      secondary: string[]
    }
    proof_points: {
      numbers: string[]
      logos: string[]
      quotes: string[]
    }
    key_features: string[]
  }
  compliance: {
    claims_to_avoid: string[]
    regulated_wording: string[]
    disclaimers: string[]
  }
  source_trace: {
    page_urls: string[]
    timestamps: Record<string, string>
    version: number
  }
  keywords: string[]
  niche: string
}

type ScrapedPage = {
  url: string
  pageType: 'home' | 'about' | 'pricing' | 'features' | 'product' | 'blog_index' | 'blog_post' | 'case_study' | 'testimonial' | 'faq' | 'terms' | 'privacy' | 'other'
  markdown: string | null
  html: string | null
  statusCode: number
  contentType: string
  headings: Array<{ level: number; text: string }>
  ctas: Array<{ text: string; type: string; location: string }>
  meta: Record<string, any>
}

// Helper to extract domain from URL
function getDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// Helper to discover page URLs from base URL
// OPTIMIZED: Only scrape essential pages to reduce API credits
// Priority order: home (required) > about, pricing (high signal) > features, product (medium) > others (low)
async function discoverPageUrls(baseUrl: string): Promise<Array<{ url: string; pageType: ScrapedPage['pageType']; priority: number }>> {
  const parsed = new URL(baseUrl)
  const base = `${parsed.protocol}//${parsed.host}`
  
  // Prioritized list - only essential pages to reduce credits
  // Priority 1 = must scrape, 2 = high value, 3 = medium value, 4 = low value
  const commonPaths = [
    { path: '/', pageType: 'home' as const, priority: 1 }, // Always scrape home
    { path: '/about', pageType: 'about' as const, priority: 2 },
    { path: '/about-us', pageType: 'about' as const, priority: 2 },
    { path: '/pricing', pageType: 'pricing' as const, priority: 2 },
    { path: '/features', pageType: 'features' as const, priority: 3 },
    { path: '/product', pageType: 'product' as const, priority: 3 },
    { path: '/products', pageType: 'product' as const, priority: 3 },
    // Skip blog, case studies, testimonials, FAQ, terms, privacy to save credits
    // These are lower signal and can be inferred from other pages
  ]

  return commonPaths.map(({ path, pageType, priority }) => ({
    url: `${base}${path}`,
    pageType,
    priority,
  }))
}

// Check if URL exists before scraping (saves credits)
async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for HEAD
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandProfileBot/1.0)',
      },
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false // If check fails, try scraping anyway
  }
}

// Scrape a single page
async function scrapePage(
  url: string,
  pageType: ScrapedPage['pageType'],
  apiKey: string
): Promise<ScrapedPage | null> {
  const scrapingBeeUrl = new URL(SCRAPING_BEE_ENDPOINT)
  scrapingBeeUrl.searchParams.set('api_key', apiKey)
  scrapingBeeUrl.searchParams.set('url', url)
  scrapingBeeUrl.searchParams.set('return_page_markdown', 'true')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(scrapingBeeUrl, {
      headers: {
        Accept: 'application/json,text/markdown;q=0.9,text/plain;q=0.8,*/*;q=0.7',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Failed to scrape ${url}: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') ?? 'text/plain'
    const rawText = await response.text()

    let markdown: string | null = null
    let html: string | null = null

    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(rawText)
        markdown = json?.markdown ?? json?.page_markdown ?? json?.data?.markdown ?? null
        html = json?.html ?? json?.data?.html ?? null
      } catch {
        // Not JSON, continue
      }
    } else if (contentType.includes('text/markdown')) {
      markdown = rawText
    }

    // Extract headings and CTAs (simplified - could be enhanced)
    const headings: Array<{ level: number; text: string }> = []
    const ctas: Array<{ text: string; type: string; location: string }> = []

    if (markdown) {
      // Extract headings (h1-h6)
      const headingRegex = /^(#{1,6})\s+(.+)$/gm
      let match
      while ((match = headingRegex.exec(markdown)) !== null) {
        headings.push({
          level: match[1].length,
          text: match[2].trim(),
        })
      }

      // Extract CTAs (buttons, links with action words)
      const ctaRegex = /\[([^\]]+)\]\([^\)]+\)|(?:button|cta|get started|sign up|try now|learn more)/gi
      while ((match = ctaRegex.exec(markdown)) !== null) {
        const text = match[1] || match[0]
        if (text.length > 3 && text.length < 50) {
          ctas.push({
            text: text.trim(),
            type: 'link',
            location: 'body',
          })
        }
      }
    }

    return {
      url,
      pageType,
      markdown,
      html,
      statusCode: response.status,
      contentType,
      headings,
      ctas,
      meta: {},
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.warn(`Timeout scraping ${url}`)
    } else {
      console.error(`Error scraping ${url}:`, error)
    }
    return null
  }
}

// Generate comprehensive brand profile
async function generateBrandProfile(pages: ScrapedPage[], baseUrl: string): Promise<{ profile: BrandProfile | null; error: string | null }> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return { profile: null, error: 'OpenAI API key missing.' }
  }

  // Combine all page content, prioritizing important pages
  // Sort by page type importance (home first, then about, pricing, etc.)
  const pagePriority: Record<ScrapedPage['pageType'], number> = {
    home: 1,
    about: 2,
    pricing: 3,
    features: 4,
    product: 4,
    blog_index: 5,
    blog_post: 5,
    case_study: 5,
    testimonial: 5,
    faq: 5,
    terms: 6,
    privacy: 6,
    other: 7,
  }

  const sortedPages = [...pages].sort((a, b) => {
    const priorityA = pagePriority[a.pageType] || 99
    const priorityB = pagePriority[b.pageType] || 99
    return priorityA - priorityB
  })

  const pageContents = sortedPages
    .map((page) => {
      const content = page.markdown || ''
      // Limit each page's content to prevent one huge page from dominating
      const maxPageLength = 15000 // ~15k chars per page
      const truncatedContent = content.slice(0, maxPageLength)
      return `=== ${page.pageType.toUpperCase()}: ${page.url} ===\n${truncatedContent}\n`
    })
    .join('\n\n')

  if (!pageContents.trim()) {
    return { profile: null, error: 'No website content available for profiling.' }
  }

  // OPTIMIZED: Reduce content sent to OpenAI to save tokens/credits
  // Keep only first 60k chars (most important pages)
  const sanitizedContent = pageContents.slice(0, 60000) // ~60k chars (reduced from 100k)

  const model = process.env.BRAND_PROFILE_MODEL ?? DEFAULT_BRAND_PROFILE_MODEL
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout

  const brandProfileSchema = {
    company: {
      name: 'string',
      domain: 'string',
      product: 'string',
      category: 'string',
      one_liner: 'string',
      elevator_pitch: 'string',
    },
    audience: {
      icp_primary: 'string',
      icp_secondary: 'string (optional)',
      pains: 'string[]',
      desires: 'string[]',
      objections: 'string[]',
    },
    positioning: {
      value_props: 'Array<{text: string, rank: number}>',
      differentiators: 'string[]',
      competitors_mentioned: 'string[]',
      why_now_angle: 'string',
    },
    voice_and_tone: {
      tone_sliders: {
        playful: 'number (0-5, REQUIRED - analyze writing style)',
        authoritative: 'number (0-5, REQUIRED - analyze writing style)',
        friendly: 'number (0-5, REQUIRED - analyze writing style)',
        professional: 'number (0-5, REQUIRED - analyze writing style)',
        casual: 'number (0-5, REQUIRED - analyze writing style)',
        formal: 'number (0-5, REQUIRED - analyze writing style)',
      },
      writing_style_rules: {
        sentence_length: 'string (REQUIRED - e.g., "short", "medium", "long", "varied")',
        punctuation: 'string (REQUIRED - e.g., "minimal", "standard", "liberal")',
        emoji_usage: 'string (REQUIRED - one of: "yes", "no", "sparingly")',
      },
      vocabulary_preferences: {
        preferred_terms: 'string[] (REQUIRED - extract commonly used terms)',
        banned_terms: 'string[] (REQUIRED - extract terms to avoid)',
      },
    },
    style_guide: {
      capitalization_rules: 'string',
      formatting_rules: '{bullets: string, headings: string, cta_style: string}',
      do_dont_examples: '{do: string[], dont: string[]}',
    },
    messaging_assets: {
      ctas: '{primary: string[], secondary: string[]}',
      proof_points: '{numbers: string[], logos: string[], quotes: string[]}',
      key_features: 'string[]',
    },
    compliance: {
      claims_to_avoid: 'string[]',
      regulated_wording: 'string[]',
      disclaimers: 'string[]',
    },
    source_trace: {
      page_urls: 'string[]',
      timestamps: 'Record<string, string>',
      version: 'number',
    },
    keywords: 'string[]',
    niche: 'string',
  }

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
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: [
                  'You are a senior brand strategist and copywriter. Analyze the provided website content from multiple pages and create a comprehensive brand profile.',
                  'Respond with strictly valid JSON only (no markdown, no code fences, no commentary).',
                  `The JSON must match this exact schema: ${JSON.stringify(brandProfileSchema, null, 2)}`,
                  'Extract real information from the content. For missing information, make reasonable inferences based on context.',
                  'IMPORTANT: voice_and_tone is REQUIRED. You MUST analyze the writing style and provide:',
                  '  - tone_sliders: Rate ALL 6 dimensions (playful, authoritative, friendly, professional, casual, formal) from 0-5 based on actual writing observed. Include all 6 values.',
                  '  - writing_style_rules: Analyze sentence length, punctuation style, and emoji usage. Provide specific values, not "N/A".',
                  '  - vocabulary_preferences: Extract preferred terms and banned terms from the content.',
                  'For messaging_assets.ctas, extract actual CTAs found on the pages.',
                  'For messaging_assets.proof_points, extract numbers, company logos mentioned, and customer quotes/testimonials.',
                  'For compliance, identify any regulated claims, disclaimers, or legal language.',
                  'Include all page URLs in source_trace.page_urls and add timestamps for when each was scraped.',
                ].join('\n'),
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Base URL: ${baseUrl}\n\nScraped Website Content from Multiple Pages:\n\n${sanitizedContent}`,
              },
            ],
          },
        ],
        metadata: {
          instructions: 'Return strictly valid JSON matching the provided schema with no additional commentary.',
        },
      }),
    })

    clearTimeout(timeoutId)
    const responseText = await response.text()

    if (!response.ok) {
      console.error('Failed to generate brand profile', response.status, responseText)
      return { profile: null, error: `Failed to generate brand profile (status ${response.status}).` }
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
    } else if (Array.isArray(responseJson?.output)) {
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
    } else if (Array.isArray(responseJson?.choices)) {
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
      
      // Validate and ensure voice_and_tone is properly populated
      if (!parsedProfile.voice_and_tone) {
        parsedProfile.voice_and_tone = {
          tone_sliders: {},
          writing_style_rules: {
            sentence_length: 'medium',
            punctuation: 'standard',
            emoji_usage: 'no',
          },
          vocabulary_preferences: {
            preferred_terms: [],
            banned_terms: [],
          },
        }
      } else {
        // Ensure tone_sliders is an object with at least some values
        if (!parsedProfile.voice_and_tone.tone_sliders || typeof parsedProfile.voice_and_tone.tone_sliders !== 'object') {
          parsedProfile.voice_and_tone.tone_sliders = {}
        }
        
        // Ensure writing_style_rules has all required fields
        if (!parsedProfile.voice_and_tone.writing_style_rules) {
          parsedProfile.voice_and_tone.writing_style_rules = {
            sentence_length: 'medium',
            punctuation: 'standard',
            emoji_usage: 'no',
          }
        } else {
          // Set defaults for missing fields
          if (!parsedProfile.voice_and_tone.writing_style_rules.sentence_length) {
            parsedProfile.voice_and_tone.writing_style_rules.sentence_length = 'medium'
          }
          if (!parsedProfile.voice_and_tone.writing_style_rules.punctuation) {
            parsedProfile.voice_and_tone.writing_style_rules.punctuation = 'standard'
          }
          if (!parsedProfile.voice_and_tone.writing_style_rules.emoji_usage) {
            parsedProfile.voice_and_tone.writing_style_rules.emoji_usage = 'no'
          }
        }
        
        // Ensure vocabulary_preferences exists
        if (!parsedProfile.voice_and_tone.vocabulary_preferences) {
          parsedProfile.voice_and_tone.vocabulary_preferences = {
            preferred_terms: [],
            banned_terms: [],
          }
        }
      }
      
      // Add source trace
      parsedProfile.source_trace = {
        page_urls: pages.map((p) => p.url),
        timestamps: Object.fromEntries(
          pages.map((p) => [p.url, new Date().toISOString()])
        ),
        version: 1,
      }

      return { profile: parsedProfile, error: null }
    } catch (parseError) {
      console.error('Unable to parse brand profile JSON', parseError, rawText)
      return { profile: null, error: 'Brand profile was not valid JSON.' }
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return { profile: null, error: 'Request timeout while generating brand profile.' }
    }
    console.error('OpenAI request for brand profile failed', error)
    return { profile: null, error: 'Unexpected error while generating brand profile.' }
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

  const domain = getDomain(url)
  const baseUrl = parsedUrl.toString()

  // Create scrape run
  const { data: scrapeRun, error: scrapeRunError } = await supabase
    .from('scrape_runs')
    .insert({
      user_id: user.id,
      domain,
      base_url: baseUrl,
      status: 'scraping',
    })
    .select('id')
    .single()

  if (scrapeRunError || !scrapeRun) {
    console.error('Failed to create scrape run', scrapeRunError)
    return NextResponse.json(
      { error: 'Failed to initialize scrape run.' },
      { status: 500 }
    )
  }

  try {
    // Check if brand already exists for this domain (cache to save credits)
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id, brand_profile, created_at')
      .eq('user_id', user.id)
      .eq('domain', domain)
      .eq('active', true)
      .single()

    // If brand exists and was created recently (within 30 days), reuse it
    if (existingBrand) {
      const createdAt = new Date(existingBrand.created_at)
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceCreation < 30) {
        console.log(`Reusing existing brand profile for ${domain} (created ${Math.round(daysSinceCreation)} days ago)`)
        return NextResponse.json({
          success: true,
          brandId: existingBrand.id,
          brandProfile: existingBrand.brand_profile,
          scrapedPagesCount: 0,
          cached: true,
        })
      }
    }

    // Discover pages to scrape (prioritized)
    const pagesToScrape = await discoverPageUrls(baseUrl)
    console.log(`Checking ${pagesToScrape.length} potential pages for ${baseUrl}`)

    // OPTIMIZED: Check if pages exist before scraping (saves credits on 404s)
    // Check pages in priority order and only scrape those that exist
    const pagesToActuallyScrape: Array<{ url: string; pageType: ScrapedPage['pageType']; priority: number }> = []
    
    // Always scrape home page (priority 1)
    const homePage = pagesToScrape.find(p => p.priority === 1)
    if (homePage) {
      pagesToActuallyScrape.push(homePage)
    }

    // Check other pages (priority 2+) before scraping
    const otherPages = pagesToScrape.filter(p => p.priority > 1)
    for (const page of otherPages) {
      const exists = await checkUrlExists(page.url)
      if (exists) {
        pagesToActuallyScrape.push(page)
      }
    }

    console.log(`Found ${pagesToActuallyScrape.length} existing pages to scrape (checked ${pagesToScrape.length} total)`)

    // Scrape pages (limit to max 5 pages to save credits)
    const maxPages = 5
    const pagesToScrapeLimited = pagesToActuallyScrape
      .sort((a, b) => a.priority - b.priority) // Sort by priority
      .slice(0, maxPages) // Limit to max pages

    const scrapePromises = pagesToScrapeLimited.map(({ url: pageUrl, pageType }) =>
      scrapePage(pageUrl, pageType, apiKey)
    )

    const scrapedPages = (await Promise.all(scrapePromises)).filter(
      (page): page is ScrapedPage => page !== null
    )

    // Store page metadata in scrape_run (lightweight - no full HTML)
    const pagesMetadata = scrapedPages.map((page) => ({
      url: page.url,
      page_type: page.pageType,
      status_code: page.statusCode,
      content_type: page.contentType,
      scraped_at: new Date().toISOString(),
    }))

    // Update scrape run status with page metadata
    await supabase
      .from('scrape_runs')
      .update({
        status: scrapedPages.length > 0 ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        error_message: scrapedPages.length === 0 ? 'No pages successfully scraped' : null,
        pages_scraped: pagesMetadata,
      })
      .eq('id', scrapeRun.id)

    if (scrapedPages.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to scrape any pages from the website.',
          brandId: null,
        },
        { status: 500 }
      )
    }

    // Generate brand profile
    const { profile: brandProfile, error: profileError } = await generateBrandProfile(
      scrapedPages,
      baseUrl
    )

    if (!brandProfile || profileError) {
      return NextResponse.json(
        {
          error: profileError || 'Failed to generate brand profile.',
          brandId: null,
          scrapedPagesCount: scrapedPages.length,
        },
        { status: 500 }
      )
    }

    // Store brand profile
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .insert({
        user_id: user.id,
        domain,
        name: brandProfile.company.name,
        brand_profile: brandProfile,
        version: 1,
        active: true,
        derived_from_scrape_run_id: scrapeRun.id,
        source_trace: brandProfile.source_trace,
        last_updated_by: 'system',
      })
      .select('id')
      .single()

    if (brandError || !brand) {
      console.error('Failed to store brand profile', brandError)
      return NextResponse.json(
        {
          error: 'Failed to store brand profile.',
          brandId: null,
        },
        { status: 500 }
      )
    }

    // Brand profile is stored in brands.brand_profile JSONB
    // All facts (value props, features, CTAs, keywords) are already in brand_profile
    // No need for separate brand_facts table - JSONB is queryable with GIN indexes

    return NextResponse.json({
      success: true,
      brandId: brand.id,
      brandProfile,
      scrapedPagesCount: scrapedPages.length,
    })
  } catch (error: any) {
    console.error('Error during scraping process', error)

    // Update scrape run to failed
    await supabase
      .from('scrape_runs')
      .update({
        status: 'failed',
        error_message: error.message || 'Unexpected error during scraping',
      })
      .eq('id', scrapeRun.id)

    return NextResponse.json(
      {
        error: error.message || 'Unexpected error during scraping process.',
        brandId: null,
      },
      { status: 500 }
    )
  }
}
