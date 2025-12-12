import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const OPENAI_IMAGE_GENERATION_ENDPOINT = 'https://api.openai.com/v1/images/generations'

async function generateImage(params: {
  prompt: string
  style?: string
  aspectRatio?: string
}): Promise<{ imageUrl: string | null; error: string | null }> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return { imageUrl: null, error: 'OpenAI API key missing.' }
  }

  // Build the prompt with style if provided
  let fullPrompt = params.prompt
  if (params.style) {
    fullPrompt = `${fullPrompt}, ${params.style} style`
  }

  // Map aspect ratio to OpenAI format
  // OpenAI supports: "1024x1024", "1792x1024", "1024x1792"
  let size = '1024x1024' // Default square
  if (params.aspectRatio) {
    switch (params.aspectRatio) {
      case '1:1':
        size = '1024x1024'
        break
      case '16:9':
        size = '1792x1024'
        break
      case '9:16':
        size = '1024x1792'
        break
      case '4:3':
        size = '1024x768' // Approximate
        break
      case '3:4':
        size = '768x1024' // Approximate
        break
      default:
        size = '1024x1024'
    }
  }

  // SECURITY: Add timeout to prevent hanging requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

  try {
    const response = await fetch(OPENAI_IMAGE_GENERATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1, // Always generate 1 image
        size: size,
        quality: 'hd', // High quality rendering
        response_format: 'url', // Return URL instead of base64
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to generate image (status ${response.status}).`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson?.error?.message || errorMessage
      } catch {
        if (errorText) {
          errorMessage = `${errorMessage} ${errorText.slice(0, 200)}`
        }
      }
      return { imageUrl: null, error: errorMessage }
    }

    const data = await response.json()
    const imageUrl = data?.data?.[0]?.url || null

    if (!imageUrl) {
      return { imageUrl: null, error: 'No image URL returned from OpenAI.' }
    }

    return { imageUrl, error: null }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      return { imageUrl: null, error: 'Request timeout while generating image.' }
    }
    console.error('OpenAI image generation failed', error)
    return { imageUrl: null, error: 'Unexpected error while generating image.' }
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { imageDescription, imageStyle, aspectRatio } = body

  if (!imageDescription || typeof imageDescription !== 'string' || imageDescription.trim().length === 0) {
    return NextResponse.json({ error: 'Image description is required.' }, { status: 400 })
  }

  // Validate description length (OpenAI has limits)
  if (imageDescription.length > 1000) {
    return NextResponse.json(
      { error: 'Image description must be 1000 characters or less.' },
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
    .eq('slug', 'image-generator')
    .eq('is_active', true)
    .maybeSingle()

  if (agentError || !agent) {
    return NextResponse.json(
      { error: 'Agent not found or inactive' },
      { status: 404 }
    )
  }

  const creditCost = agent.credits || 12

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

  // Generate the image
  const { imageUrl, error: imageError } = await generateImage({
    prompt: imageDescription.trim(),
    style: imageStyle || undefined,
    aspectRatio: aspectRatio || undefined,
  })

  if (imageError || !imageUrl) {
    // Refund credits if image generation fails
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits after image generation failure:', refundError)
    }

    return NextResponse.json(
      { error: imageError ?? 'Failed to generate image.' },
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
      agent_slug: 'image-generator', // Keep for backward compatibility
      input_params: {
        imageDescription,
        imageStyle: imageStyle || null,
        aspectRatio: aspectRatio || null,
      },
      result_data: {
        imageUrl,
        imageDescription,
        imageStyle: imageStyle || null,
        aspectRatio: aspectRatio || null,
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
    imageUrl,
    imageDescription,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}

