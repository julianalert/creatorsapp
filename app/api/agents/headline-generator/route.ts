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
    .eq('slug', 'headline-generator')
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

  // Generate the headlines
  const systemPrompt = `You are a senior landing page copywriting expert specializing in hero sections.

You write high-performing hero headlines that:
- Capture attention immediately
- Communicate value clearly
- Address customer objections
- Position the brand as the solution

You always:
- Base your copy strictly on the product & audience info provided
- Use simple, clear language (no fluff, no buzzword salad)
- Focus on benefits, not just features
- Write like a human, not a corporate robot
- Respect the requested brand voice
- Avoid making up fake features or fake testimonials

Return your answer in clean Markdown, using this structure:

# HEADLINE GENERATOR RESULTS

## VERSION 1: STRAIGHTFORWARD
**Goal:** Explain what the product does in a clear, nice way.

**Title:**
[Write a clear, straightforward headline that explains what the product does]

**Subtitle:**
[Write a subtitle that introduces the product and explains how it creates the value promised in the title. Be specific here.]

**CTA:**
[Write a call-to-action button text. Focus on "call to value" - emphasize the value your title promises rather than just action. Examples: "Get [Value]", "Start [Outcome]", "Create [Result]".]

---

## VERSION 2: HOOK
**Goal:** Address the customer's biggest objection. Formula: Value + Objection = Hook

**Title:**
[Write a headline that addresses the customer's biggest objection while promising value. The easiest way to write hooks is to address the customer's biggest objection.]

**Subtitle:**
[Write a subtitle that introduces the product and explains how it creates the value in your title. Be specific about how it solves the objection.]

**CTA:**
[Write a call-to-action button text. Use "objection handling" - add a few words to handle the user's biggest objection to clicking. Examples: "Try Free (No Credit Card)", "Start Now (Takes 2 Minutes)", "Get Started (Cancel Anytime)".]

---

## VERSION 3: OWN YOUR NICHE
**Goal:** Position the brand as THE Solution in their niche

**Title:**
[Write a headline that positions the brand as THE definitive solution in their niche. Make it clear this is THE tool/product for this specific use case.]

**Subtitle:**
[Write a subtitle that introduces the product and explains how it creates the value in your title. Emphasize why this is THE solution for this niche.]

**CTA:**
[Write a call-to-action button text. Focus on "call to value" - emphasize the value your title promises. Examples: "Get [Value]", "Start [Outcome]", "Create [Result]".]

---

## NOTES
- Each version must be distinct and serve a different purpose
- Subtitles are where you get specific - introduce the product and explain how it creates value
- CTAs should make taking the next step easy
- All copy must align with the brand voice and tone from the brand profile`

  const headlinePrompt = `You are helping me create hero section headlines for a landing page.

Below is the complete brand profile for this business and product. 

Use this information as your single source of truth.

================================================

BRAND PROFILE

================================================

${brandContext}

================================================

YOUR TASK

================================================

1. Analyze the BRAND PROFILE above.

   - Extract: core value proposition, positioning, main benefits, key use cases, target audience, and their biggest objections.

   - Identify the customer's biggest objection from the audience.pains and audience.objections sections.

   - Understand the niche and positioning from the brand profile.

2. Create THREE distinct hero section versions, each with:
   - Title (headline)
   - Subtitle (short description/subheadline)
   - CTA (call-to-action button text)

3. Follow the structure EXACTLY as specified in the system prompt:
   - Version 1: Straightforward - explains what it does
   - Version 2: Hook - addresses customer's biggest objection (Value + Objection = Hook)
   - Version 3: Own your niche - brand appears as THE Solution

4. For each version:
   - Title: Should be compelling and aligned with the version's goal
   - Subtitle: Should be specific, introduce the product, and explain how it creates value
   - CTA: Should emphasize value or handle objections as specified

================================================

WRITING GUIDELINES

================================================

- Write like a human, not a marketing robot.

- Prefer simple words over jargon.

- Be specific about the value and outcomes the user will get.

- Avoid generic lines unless you add something concrete.

- Do NOT invent features, pricing, or promises that do not exist in the brand profile.

- Use the brand voice and tone specified in the brand profile.

- For Version 2 (Hook), identify the biggest objection from audience.pains or audience.objections and address it directly.

- For Version 3 (Own your niche), use the niche information to position the brand as THE solution.

- CTAs should be action-oriented but value-focused (e.g., "Get [Value]" rather than just "Sign Up").

- If some info is missing, make reasonable assumptions based on the brand profile.`

  const { result: headlines, error: headlineError } = await callOpenAI(headlinePrompt, systemPrompt)

  if (headlineError) {
    // If headline generation fails, refund the credits
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }

    return NextResponse.json(
      { error: `Headline generation failed: ${headlineError}` },
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
      agent_slug: 'headline-generator', // Keep for backward compatibility
      input_params: {
        brandId,
      },
      result_data: {
        result: headlines,
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
    result: headlines,
    brandId,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

