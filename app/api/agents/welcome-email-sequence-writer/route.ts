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
    numberOfEmails = '3',
    timeframe = 'within the first 7 days after signup',
    primaryCta = '',
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
    .eq('slug', 'welcome-email-sequence-writer')
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

  // Step 3: Generate the email sequence
  const systemPrompt = `You are a senior SaaS lifecycle & copywriting expert. 

You write high-performing onboarding email sequences that:
- Welcome new users
- Communicate the product's core value quickly
- Help users reach their first "aha moment"
- Drive activation, not just opens

You always:
- Base your copy strictly on the product & audience info provided
- Use simple, clear language (no fluff, no buzzword salad)
- Focus on benefits, not just features
- Write like a human, not a corporate robot
- Respect the requested brand voice
- Avoid making up fake features or fake testimonials

Return your answer in clean Markdown, using this structure:

[EMAIL 1]
- Internal goal: (what this email is trying to achieve in the onboarding journey)
- Best send time after signup: (e.g. "Immediately", "+1 day", "+3 days", etc.)
- Subject line options (3 variants):
  1) ...
  2) ...
  3) ...
- Preview text (max 80 characters):
  - ...
- Email body (ready to send):
  [Write the full email body, using personalization tokens like {{first_name}} where appropriate. Use short paragraphs, scannable formatting, and clear calls to action.]
- Primary CTA for this email:
  - Button / link label text: "..."
  - Target action (what happens when they click): "..."
- Optional PS:
  [Use PS to handle an objection, share a tip, or offer a quick reply question.]

[EMAIL 2]
...

[SEQUENCE STRATEGY]
- Briefly explain the role of each email in the overall journey (1–2 sentences per email).
- Show how the sequence moves users from "just signed up" to "activated and seeing value".

[ASSUMPTIONS]
- List any important assumptions you had to make due to missing information.`

  const emailSequencePrompt = `You are helping me create a complete onboarding **welcome email sequence** for a digital product.

Below is the complete brand profile for this business and product. 

Use this information as your single source of truth.

================================================

BRAND PROFILE

================================================

${brandContext}

================================================

SEQUENCE SETTINGS

================================================

- Number of emails in the sequence: ${numberOfEmails}   (e.g. 3–6)

- Timeframe: ${timeframe}  (e.g. "within the first 7 days after signup")

- Primary CTA: ${primaryCta || 'Not specified - infer from brand profile'}   (e.g. "create first project", "book a demo", "install the script")

================================================

YOUR TASK

================================================

1. Analyze the BRAND PROFILE above.

   - Extract: core value proposition, positioning, main benefits, key use cases, and typical user journey.

   - Infer a reasonable "first activation moment" if not explicitly stated (e.g. first report created, first campaign launched, first document uploaded).

2. Create a complete onboarding **welcome email sequence** designed to:

   - Make new users feel welcomed and understood.

   - Restate the product promise in clear, concrete terms.

   - Help them experience value as fast as possible (reach the first "aha moment").

   - Overcome common objections or friction points inferred from the brand profile.

   - Encourage replies (where relevant) to collect feedback and deepen engagement.

3. For each email, follow the structure EXACTLY as specified in the system prompt.

4. After writing all emails, add the [SEQUENCE STRATEGY] and [ASSUMPTIONS] sections.

================================================

WRITING GUIDELINES

================================================

- Write like a human, not a marketing robot.

- Prefer simple words over jargon.

- Be specific about the value and outcomes the user will get.

- Avoid generic lines like "we're excited to have you on board" unless you add something concrete.

- Do NOT invent features, pricing, or promises that do not exist in the brand profile.

- Use the brand voice and tone specified in the brand profile.

- Include appropriate personalization tokens like {{first_name}}, {{company_name}} where natural.

- If some info is missing, make reasonable assumptions and clearly state them in the [ASSUMPTIONS] section at the very end.`

  const { result: emailSequence, error: sequenceError } = await callOpenAI(emailSequencePrompt, systemPrompt)

  if (sequenceError) {
    // If sequence generation fails, refund the credits
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }

    return NextResponse.json(
      { error: `Email sequence generation failed: ${sequenceError}` },
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
      agent_slug: 'welcome-email-sequence-writer', // Keep for backward compatibility
      input_params: {
        brandId,
        numberOfEmails,
        timeframe,
        primaryCta,
      },
      result_data: {
        result: emailSequence,
        brandId,
        numberOfEmails,
        timeframe,
        primaryCta,
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
    result: emailSequence,
    brandId,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

