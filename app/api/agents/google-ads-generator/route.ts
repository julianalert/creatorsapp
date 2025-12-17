import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const OPENAI_RESPONSES_ENDPOINT =
  process.env.OPENAI_RESPONSES_ENDPOINT ?? 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = 'gpt-5-nano'

async function callOpenAI(prompt: string, systemPrompt?: string): Promise<{ result: string | null; error: string | null }> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return { result: null, error: 'OpenAI API key missing.' }
  }

  const model = process.env.BRAND_PROFILE_MODEL ?? DEFAULT_MODEL

  // SECURITY: Add timeout to prevent hanging requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 240000) // 240 second timeout for AI calls

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
    brandId,
  } = body

  if (!brandId || typeof brandId !== 'string') {
    return NextResponse.json({ error: 'A valid brandId is required.' }, { status: 400 })
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
    .eq('slug', 'google-ads-generator')
    .eq('is_active', true)
    .maybeSingle()

  if (agentError || !agent) {
    return NextResponse.json(
      { error: 'Agent not found or inactive' },
      { status: 404 }
    )
  }

  const creditCost = agent.credits || 3

  // Track start time
  const startedAt = new Date().toISOString()

  // Fetch brand profile
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('id, brand_profile, domain, name')
    .eq('id', brandId)
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle()

  if (brandError || !brand) {
    return NextResponse.json(
      { error: 'Brand profile not found or you do not have access to it.' },
      { status: 404 }
    )
  }

  if (!brand.brand_profile || typeof brand.brand_profile !== 'object') {
    return NextResponse.json(
      { error: 'Brand profile data is missing or invalid.' },
      { status: 400 }
    )
  }

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

  // Prepare brand profile context for the AI
  const brandProfile = brand.brand_profile as any
  const brandContext = JSON.stringify(brandProfile, null, 2)

  // Generate Google Ads
  const systemPrompt = `You are a senior Google Ads copywriting expert specializing in high-converting search ads with proven track records.

You write Google Ads that:
- Capture attention immediately with specific, benefit-driven headlines
- Communicate clear, concrete value propositions (not vague promises)
- Drive clicks through emotional triggers and pain point addressing
- Use power words, numbers, and specificity to stand out
- Follow Google Ads character limits precisely

CRITICAL RULES FOR EFFECTIVE ADS:

HEADLINES (30 chars max):
- Lead with the biggest benefit or outcome
- Use power words: "Free", "Save", "Get", "Start", "Boost", "Stop", "Transform", "Discover"
- Include numbers when possible: "10x", "50%", "3 Steps", "24/7"
- Address pain points directly: "Stop [problem]", "Fix [issue]", "End [frustration]"
- Be specific, not generic: "Save 10 Hours/Week" beats "Save Time"
- Use action verbs and urgency when appropriate

DESCRIPTIONS (90 chars max):
- Expand on the headline with concrete details
- Include a clear call to action: "Start Free Trial", "Get Started Today", "Try Free Now"
- Add social proof when available: "Join 10K+ Users", "Trusted by 500+ Companies"
- Address objections: "No Credit Card", "Cancel Anytime", "Setup in 5 Minutes"
- Use specific outcomes: "Increase Sales by 30%", "Save 5 Hours Per Week"
- Create urgency when appropriate: "Limited Time", "Start Today", "Get Started Now"

AD VARIATION STRATEGIES:
1. Benefit-focused: Lead with the primary outcome (e.g., "Save 10 Hours Per Week")
2. Problem-solving: Address the main pain point (e.g., "Stop Missing Deadlines")
3. Feature-highlight: Showcase key differentiator (e.g., "AI-Powered Automation")
4. Social proof: Use credibility markers (e.g., "Trusted by 10K+ Teams")
5. Urgency/scarcity: Create time-sensitive appeal (e.g., "Start Free Trial Today")
6. Question-based: Engage with audience question (e.g., "Tired of Manual Work?")
7. Comparison: Position against alternative (e.g., "Better Than [Competitor]")
8. Outcome-focused: Emphasize end result (e.g., "Double Your Revenue")
9. Use case specific: Target specific scenario (e.g., "Perfect for Remote Teams")
10. Value proposition: Lead with unique selling point (e.g., "The Only Tool That...")

You always:
- Base your copy strictly on the product & audience info provided
- Use simple, clear language (no fluff, no buzzword salad)
- Focus on SPECIFIC benefits with concrete outcomes
- Write like a human, not a corporate robot
- Respect the requested brand voice
- Avoid making up fake features, pricing, or testimonials
- STRICTLY respect character limits (Headline: 30 characters max, Description: 90 characters max)
- Make every word count - no filler words

BAD EXAMPLES (avoid these):
- Generic: "Best Solution for Your Business" (vague, no value)
- Feature-only: "Cloud-Based Platform" (doesn't explain benefit)
- Corporate speak: "Leverage Our Innovative Solutions" (buzzword salad)
- No specificity: "Save Time and Money" (too generic)

GOOD EXAMPLES:
- Specific benefit: "Save 10 Hours Per Week" (concrete outcome)
- Problem-solving: "Stop Missing Deadlines Forever" (addresses pain)
- With numbers: "Join 50K+ Teams Using Our Tool" (social proof + scale)
- Action-oriented: "Start Free Trial - No Credit Card" (clear CTA + objection handling)

Return your answer in clean Markdown, using this structure:

# GOOGLE ADS GENERATOR RESULTS

## AD 1
**Headline:** [30 characters or less - specific, benefit-driven headline]
**Description:** [90 characters or less - concrete value proposition with CTA]

---

[Continue for all 10 ads with different angles...]

## AD 10
**Headline:** [30 characters or less - final compelling variation]
**Description:** [90 characters or less - final value proposition]

---

## NOTES
- Each ad tests a different messaging angle or value proposition
- All copy aligns with the brand voice and tone from the brand profile
- Character counts are verified and accurate`

  const adsPrompt = `You are helping me create 10 high-converting Google Ads for Google AdWords.

Below is the complete brand profile for this business and product. 

Use this information as your single source of truth.

================================================

BRAND PROFILE

================================================

${brandContext}

================================================

YOUR TASK

================================================

1. DEEP ANALYSIS of the BRAND PROFILE:

   STEP 1: Extract Core Information
   - Core value proposition: What is the main problem this solves?
   - Primary benefits: What are the top 3-5 concrete outcomes users get?
   - Key differentiators: What makes this unique vs competitors?
   - Target audience: Who are they? What are their biggest pain points?
   - Use cases: What are the main scenarios people use this for?
   - Brand voice: What tone should the ads match?

   STEP 2: Identify Emotional Triggers
   - What pain points does the audience have? (frustration, time waste, cost, complexity, etc.)
   - What outcomes do they desperately want? (save time, make money, reduce stress, etc.)
   - What objections might they have? (too expensive, too complex, not sure it works, etc.)

   STEP 3: Find Specific Details
   - Are there numbers/statistics in the brand profile? (users, time saved, revenue, etc.)
   - Are there specific features that translate to clear benefits?
   - Are there use cases that can be highlighted?
   - Is there pricing information that can address cost objections?

2. Create EXACTLY 10 distinct Google Ads using these strategies:

   AD 1 - PRIMARY BENEFIT: Lead with the #1 most compelling benefit with specificity
   AD 2 - PROBLEM-SOLVING: Address the biggest pain point directly
   AD 3 - SOCIAL PROOF: Use credibility markers (user count, company count, etc.)
   AD 4 - FEATURE-BENEFIT: Highlight key differentiator with clear benefit
   AD 5 - URGENCY/CTA: Create action-oriented ad with clear next step
   AD 6 - USE CASE: Target specific scenario or persona
   AD 7 - OUTCOME-FOCUSED: Emphasize concrete end result with numbers
   AD 8 - QUESTION-BASED: Engage with audience question or pain point
   AD 9 - COMPARISON: Position against alternative or status quo
   AD 10 - VALUE PROPOSITION: Lead with unique selling point

3. For EACH ad:
   - Headline (30 chars max): Must be specific, benefit-driven, and attention-grabbing
   - Description (90 chars max): Must expand on headline, include concrete details, and have clear CTA
   - Use power words, numbers, and specificity
   - Address objections when relevant (free trial, no credit card, easy setup, etc.)
   - Count characters carefully - these limits are CRITICAL

4. Follow the structure EXACTLY as specified in the system prompt:
   - Use the exact format: ## AD 1, ## AD 2, etc.
   - Use **Headline:** and **Description:** labels
   - Separate each ad with ---
   - Verify character counts before finalizing

================================================

WRITING GUIDELINES

================================================

HEADLINE BEST PRACTICES:
- Start with the benefit or outcome, not the product name
- Use numbers when possible: "Save 10 Hours", "Join 50K Users", "3X Your Revenue"
- Include power words: "Free", "Get", "Start", "Stop", "Boost", "Transform"
- Be specific: "Save 10 Hours/Week" not "Save Time"
- Address pain directly: "Stop Missing Deadlines" not "Better Project Management"
- Make it scannable and punchy

DESCRIPTION BEST PRACTICES:
- First sentence: Expand on headline with concrete detail
- Second sentence: Add CTA or address objection
- Include specific outcomes: "Increase sales by 30%" not "improve results"
- Add social proof when available: "Trusted by 10K+ teams"
- Address objections: "No credit card", "Cancel anytime", "Setup in 5 min"
- End with clear CTA: "Start Free Trial", "Get Started Today", "Try Free Now"

QUALITY CHECKLIST FOR EACH AD:
✓ Is the headline specific (not generic)?
✓ Does it lead with a clear benefit or outcome?
✓ Does the description expand with concrete details?
✓ Is there a clear call to action?
✓ Does it address a pain point or objection?
✓ Would this stand out in search results?
✓ Does it match the brand voice?
✓ Are character limits respected?

AVOID:
- Generic phrases: "best solution", "leading platform", "innovative tool"
- Feature-only copy without benefit: "Cloud-based" (so what?)
- Corporate jargon: "leverage", "synergy", "optimize your workflow"
- Vague promises: "save time" (how much?), "increase revenue" (by how much?)
- Making up fake numbers or testimonials

DO:
- Use specific numbers from brand profile or reasonable estimates
- Focus on concrete outcomes: "Save 10 hours per week"
- Address real pain points from the audience section
- Use the brand's actual voice and tone
- Make every word count - no filler

If some info is missing, make reasonable assumptions based on the brand profile, but prioritize specificity and concreteness over generic claims.`

  const { result: ads, error: adsError } = await callOpenAI(adsPrompt, systemPrompt)

  if (adsError) {
    // If ads generation fails, refund the credits
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }

    return NextResponse.json(
      { error: `Google Ads generation failed: ${adsError}` },
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
      agent_slug: 'google-ads-generator',
      input_params: {
        brandId,
      },
      result_data: {
        result: ads,
        brandId,
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
    result: ads,
    brandId,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

