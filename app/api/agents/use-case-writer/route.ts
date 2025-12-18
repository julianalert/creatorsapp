import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const OPENAI_RESPONSES_ENDPOINT =
  process.env.OPENAI_RESPONSES_ENDPOINT ?? 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = 'gpt-5-nano'

function sanitizeContext(input: string, maxLength = 100000) {
  return input.replace(/\0/g, '').slice(0, maxLength)
}

async function callOpenAI(prompt: string, systemPrompt?: string): Promise<{ result: string | null; error: string | null }> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return { result: null, error: 'OpenAI API key missing.' }
  }

  const model = process.env.BRAND_PROFILE_MODEL ?? DEFAULT_MODEL

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout

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
    interviewText,
    brandId,
    targetAudience = '',
    primaryCta = '',
    tone = 'clear, practical, confident (no hype)',
  } = body

  if (!interviewText || typeof interviewText !== 'string' || interviewText.trim().length === 0) {
    return NextResponse.json({ error: 'Interview text is required.' }, { status: 400 })
  }

  if (!brandId || typeof brandId !== 'string' || brandId.trim().length === 0) {
    return NextResponse.json({ error: 'Brand profile is required.' }, { status: 400 })
  }

  // Validate interview text length
  if (interviewText.length > 50000) {
    return NextResponse.json(
      { error: 'Interview text must be 50,000 characters or less.' },
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

  // Fetch brand profile
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('id, name, domain, brand_profile')
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

  const productName = brand.name || brand.domain

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
    .eq('slug', 'use-case-writer')
    .eq('is_active', true)
    .maybeSingle()

  if (agentError || !agent) {
    return NextResponse.json(
      { error: 'Agent not found or inactive' },
      { status: 404 }
    )
  }

  const creditCost = agent.credits || 1

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

  const sanitizedInterview = sanitizeContext(interviewText)

  // Generate the use case page
  const systemPrompt = `You are an expert product marketer and B2B SaaS storyteller.

Goal: Write a high-quality, conversion-focused Use Case page based ONLY on a real user interview provided as input. The page must feel concrete, credible, and highly relatable to the target reader.

Hard rules:
1) Do NOT invent metrics, features, integrations, pricing, or results.
2) If something is not explicitly stated or strongly implied in the interview, omit it.
3) Prefer concrete actions and workflows over abstract benefits.
4) Use the interview's wording whenever possible.
5) Output must be ready-to-publish Markdown.

Process:

STEP 1 — Extract structured insights from the interview:
Produce a structured summary with:
- Company profile (industry, size, role)
- Trigger event
- Core problem before using the product
- Prior tools or alternatives mentioned
- Job-to-be-done
- Key constraints (time, skills, budget, team)
- How the product is actually used (step by step)
- Most-used features (only those mentioned)
- Results (metrics, time saved, qualitative outcomes)
- Objections or doubts before adopting
- Why they chose this product
- Strong quotes or phrases from the interview

STEP 2 — Decide the primary use case angle:
Choose ONE angle (role, job, industry, constraint, or maturity level).
Explain your choice in 2–3 bullets using interview evidence.

STEP 3 — Write the Use Case page in Markdown using this structure:
- H1: How a {ROLE} uses {PRODUCT_NAME} to {PRIMARY OUTCOME}
- Short intro (2–3 paragraphs)
- Company snapshot (bullet list)
- The problem (Before)
- The turning point
- The solution: how they use {PRODUCT_NAME} (step-by-step)
- The results (After)
- Why this use case works (and when it doesn't)
- Highlight quote
- CTA aligned with the use case

STEP 4 — Quality checklist (at the end):
- List missing information that would strengthen this use case
- List assumptions you intentionally avoided
- List follow-up interview questions that would improve clarity

Output:
Return ONLY:
1) Extracted structured insights
2) Final Markdown use case page
3) Quality checklist`

  const useCasePrompt = `Create a Use Case page based on the following user interview.

Inputs:
- Product name: ${productName}
- Raw user interview:
${sanitizedInterview}

- Optional audience focus: ${targetAudience || 'Not specified'}
- Optional CTA type: ${primaryCta || 'Not specified (infer from interview)'}
- Tone: ${tone}

Follow the process exactly as described in the system prompt. Extract structured insights, decide the use case angle, write the complete page, and provide the quality checklist.`

  const { result: useCasePage, error: pageError } = await callOpenAI(useCasePrompt, systemPrompt)

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
      { error: `Use case page generation failed: ${pageError}` },
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
      agent_slug: 'use-case-writer',
      input_params: {
        interviewText: sanitizedInterview.substring(0, 1000), // Store truncated version
        brandId,
        targetAudience,
        primaryCta,
        tone,
      },
      result_data: {
        result: useCasePage,
        brandId,
        productName,
        targetAudience,
        primaryCta,
        tone,
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
    result: useCasePage,
    brandId,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

