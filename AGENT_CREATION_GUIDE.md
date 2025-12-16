# Complete Guide: Creating a New AI Agent

This guide provides step-by-step instructions for creating a new AI agent in the system. Follow these steps in order to ensure all components are properly integrated.

## Table of Contents

1. [Overview](#overview)
2. [Step 1: Create API Route](#step-1-create-api-route)
3. [Step 2: Add UI Interface](#step-2-add-ui-interface)
4. [Step 3: Add Process Steps](#step-3-add-process-steps)
5. [Step 4: Create SQL Database Entry](#step-4-create-sql-database-entry)
6. [Step 5: Register Agent in Code](#step-5-register-agent-in-code)
7. [Step 6: Testing Checklist](#step-6-testing-checklist)
8. [Common Patterns](#common-patterns)
9. [Best Practices](#best-practices)

---

## Overview

Each agent requires 5 main components:

1. **API Route** (`/app/api/agents/[slug]/route.ts`) - Handles the agent logic
2. **UI Interface** (`/app/agent/[slug]/agent-interface.tsx`) - User-facing form and results
3. **Process Steps** (`/app/agent/[slug]/agent-process-steps.tsx`) - "How it works" section
4. **SQL Entry** (`supabase_[slug]_agent.sql`) - Database record
5. **Code Registration** (`/app/page.tsx`) - Add to WORKING_AGENTS list

---

## Step 1: Create API Route

**File:** `/app/api/agents/[your-slug]/route.ts`

### Template Structure

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const OPENAI_RESPONSES_ENDPOINT =
  process.env.OPENAI_RESPONSES_ENDPOINT ?? 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = 'gpt-5-nano'

// Copy the callOpenAI function from an existing agent (e.g., welcome-email-sequence-writer)

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const {
    // Extract your input parameters here
    brandId, // if using brand profile
    // ... other params
  } = body

  // Validation
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

  // Rate limiting
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
    .eq('slug', 'your-slug') // ⚠️ Update this
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

  // Fetch brand profile (if needed)
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
      { status: 402 }
    )
  }

  // Prepare brand profile context (if needed)
  const brandProfile = brand.brand_profile as any
  const brandContext = JSON.stringify(brandProfile, null, 2)

  // Create system prompt
  const systemPrompt = `You are a [role/expertise description].

You [what the agent does].

You always:
- Base your work strictly on the information provided
- Use simple, clear language
- Focus on benefits, not just features
- Write like a human, not a corporate robot
- Respect the requested brand voice
- Avoid making up fake features or fake testimonials

Return your answer in clean Markdown, using this structure:

[Define your output structure here]`

  // Create user prompt
  const userPrompt = `[Your detailed prompt with instructions]`

  // Call OpenAI
  const { result, error } = await callOpenAI(userPrompt, systemPrompt)

  if (error) {
    // Refund credits on error
    try {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditCost,
      })
    } catch (refundError) {
      console.error('Error refunding credits:', refundError)
    }

    return NextResponse.json(
      { error: `Generation failed: ${error}` },
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
      agent_slug: 'your-slug', // ⚠️ Update this
      input_params: {
        // Store all input parameters
        brandId,
        // ... other params
      },
      result_data: {
        result: result,
        brandId,
        // ... other params
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
    result: result,
    brandId,
    resultId: savedResult?.id || null,
    creditsRemaining: newBalance,
  })
}
```

### Key Points:
- ✅ Always include authentication check
- ✅ Always include rate limiting
- ✅ Always check and deduct credits before processing
- ✅ Always refund credits if generation fails
- ✅ Always save results to `agent_results` table
- ✅ Use consistent error handling
- ✅ Track timing for analytics

---

## Step 2: Add UI Interface

**File:** `/app/agent/[slug]/agent-interface.tsx`

### 2.1 Add State Variables

Add state variables at the top of the component (around line 60-80):

```typescript
// Your Agent state
const [yourParam, setYourParam] = useState('')
const [anotherParam, setAnotherParam] = useState('')
```

### 2.2 Add Brand Fetching (if using brand profile)

Update the `useEffect` hook (around line 150):

```typescript
// Fetch brands for Your Agent and other agents
useEffect(() => {
  if (slug === 'your-slug' || slug === 'welcome-email-sequence-writer' || slug === 'headline-generator') {
    // ... existing brand fetching logic
  }
}, [slug, brandId])
```

### 2.3 Add to handleSubmit

Add your agent case in the `handleSubmit` function (around line 430):

```typescript
} else if (slug === 'your-slug') {
  setCurrentStep('Analyzing brand profile...')
  await new Promise(resolve => setTimeout(resolve, 1500))

  setCurrentStep('Generating [output type]...')
  const fetchPromise = fetch('/api/agents/your-slug', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brandId,
      // ... other params
    }),
  })

  await new Promise(resolve => setTimeout(resolve, 2000))
  setCurrentStep('Finalizing results...')

  const response = await fetchPromise
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate [output]')
  }

  if (data.success && data.result) {
    await Promise.all([
      new Promise(resolve => setTimeout(resolve, 1500))
    ])
    setResult(data.result)
    setCurrentStep(null)
    if (data.resultId) {
      const url = new URL(window.location.href)
      url.searchParams.set('resultId', data.resultId)
      window.history.replaceState({}, '', url.toString())
    }
    if (data.creditsRemaining !== undefined) {
      window.dispatchEvent(new CustomEvent('agent:credits-updated'))
    }
  } else {
    throw new Error('Invalid response from [agent] API')
  }
}
```

### 2.4 Add Saved Result Loading

Add to the saved result loading section (around line 113):

```typescript
// Your Agent fields
if (savedResult.input_params.yourParam) setYourParam(savedResult.input_params.yourParam)
if (savedResult.input_params.anotherParam) setAnotherParam(savedResult.input_params.anotherParam)
```

### 2.5 Add Interface Component

Add your interface component before the "Alternatives to Page Writer" section (around line 1930):

```typescript
// Your Agent specific interface
if (slug === 'your-slug') {
  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand Profile Selector (if needed) */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="brand-select-your-agent">
            Brand Profile <span className="text-red-500">*</span>
          </label>
          {brands.length === 0 ? (
            <div className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">No brand profiles found.</p>
              <a href="/new" className="text-blue-500 hover:text-blue-600 text-sm font-medium">Create a brand profile →</a>
            </div>
          ) : (
            <select
              id="brand-select-your-agent"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select a brand profile...</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name || brand.domain}
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">We'll use your brand profile to [purpose]</p>
        </div>

        {/* Add other form fields as needed */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="your-param">
            Your Parameter <span className="text-red-500">*</span>
          </label>
          <input
            id="your-param"
            type="text"
            placeholder="Enter value..."
            value={yourParam}
            onChange={(e) => setYourParam(e.target.value)}
            className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4 mr-2" />
                Generate [Output Type]
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Area */}
      <div className="mt-8">
        {error && (
          <div className="mb-4 bg-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className={`bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] ${result ? '' : 'flex items-center justify-center'}`}>
          {isLoadingSavedResult ? (
            <div className="flex flex-col items-center justify-center text-center">
              <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"></path>
              </svg>
              <p className="text-gray-800 dark:text-gray-100 font-medium mb-2">Loading saved result...</p>
            </div>
          ) : result ? (
            <div className="w-full text-gray-800 dark:text-gray-100">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          ) : loading && currentStep ? (
            <div className="flex flex-col items-center justify-center text-center">
              <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"></path>
              </svg>
              <p className="text-gray-800 dark:text-gray-100 font-medium mb-2">{currentStep}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This may take a while, do not close this tab</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Your [output type] will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Key Points:
- ✅ Use consistent form styling
- ✅ Include proper loading states
- ✅ Handle errors gracefully
- ✅ Support saved result loading
- ✅ Use appropriate input types and validation

---

## Step 3: Add Process Steps

**File:** `/app/agent/[slug]/agent-process-steps.tsx`

Add your agent case before the "Default for other agents" section (around line 190):

```typescript
// Your Agent
if (slug === 'your-slug') {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
      <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
      <div className="space-y-4">
        {renderStep(1, 'Step 1 Name', 'Detailed description of what happens in step 1, including what the user inputs and what the agent does.')}
        {renderStep(2, 'Step 2 Name', 'Detailed description of what happens in step 2, including the processing and analysis.')}
        {renderStep(3, 'Step 3 Name', 'Detailed description of what happens in step 3, including the final output and what the user receives.')}
        {/* Add more steps as needed */}
      </div>
    </div>
  )
}
```

### Key Points:
- ✅ Match the steps to your SQL `sequence` field
- ✅ Be specific about what happens in each step
- ✅ Use clear, user-friendly language
- ✅ Typically 3-5 steps

---

## Step 4: Create SQL Database Entry

**File:** `supabase_[your-slug]_agent.sql`

### Template

```sql
-- Insert the [Your Agent Name] agent
INSERT INTO public.agents (slug, title, summary, category, use_case, persona, thumbnail_url, hero_image_url, stats, sequence, samples, insights, tags, is_active, credits)
VALUES
  (
    'your-slug',
    'Your Agent Title',
    'Brief summary (1-2 sentences) describing what the agent does and its key value proposition.',
    'Category Name', -- SEO, Sales, Content Marketing, Email Marketing, Paid Ads, Creator Marketing, Business/Strategy, Miscellaneous
    'Use when [specific use case]. Perfect for [target scenario].',
    'Persona 1 · Persona 2 · Persona 3',
    '/images/meetups-thumb-01.jpg', -- Update with actual image path
    '/images/meetup-image.jpg', -- Update with actual image path
    '[
      {"label": "Metric 1", "value": "Value 1"},
      {"label": "Metric 2", "value": "Value 2"},
      {"label": "Metric 3", "value": "Value 3"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Step Name",
        "channel": "Agent Interface",
        "timing": "When this step happens",
        "objective": "What this step achieves",
        "copy": "Detailed description:\n• Bullet point 1\n• Bullet point 2\n• Bullet point 3"
      },
      {
        "step": "Step 2 · Step Name",
        "channel": "AI Processing",
        "timing": "When this step happens",
        "objective": "What this step achieves",
        "copy": "Detailed description:\n• Bullet point 1\n• Bullet point 2"
      },
      {
        "step": "Step 3 · Final Output",
        "channel": "Results Dashboard",
        "timing": "When this step happens",
        "objective": "What this step achieves",
        "copy": "Detailed description:\n• Bullet point 1\n• Bullet point 2"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Sample Output Title",
        "body": "Sample output content showing what the agent produces..."
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Explanation of why this agent is effective and what makes it valuable."
      },
      {
        "label": "Key benefit",
        "description": "Another key benefit or differentiator of this agent."
      }
    ]'::jsonb,
    ARRAY['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4'],
    true, -- is_active
    3 -- credits (adjust based on complexity)
  )
ON CONFLICT (slug) DO NOTHING;
```

### Field Descriptions:

- **slug**: URL-friendly identifier (lowercase, hyphens)
- **title**: Display name (sentence case)
- **summary**: 1-2 sentence description
- **category**: One of the predefined categories
- **use_case**: When to use this agent
- **persona**: Target users (separated by ·)
- **thumbnail_url**: Image path for card view
- **hero_image_url**: Image path for detail view
- **stats**: Array of 3 metrics with label/value pairs
- **sequence**: Array of step objects matching process steps
- **samples**: Example outputs
- **insights**: Why it works and key benefits
- **tags**: Array of relevant tags
- **is_active**: true to show, false to hide
- **credits**: Cost in credits (1-5 typically)

### Key Points:
- ✅ Use `ON CONFLICT (slug) DO NOTHING` for safety
- ✅ Match `sequence` steps to process steps in code
- ✅ Keep summaries concise and value-focused
- ✅ Use appropriate category from the list
- ✅ Set realistic credit costs

---

## Step 5: Register Agent in Code

**File:** `/app/page.tsx`

Add your agent slug to the `WORKING_AGENTS` array (around line 17):

```typescript
// Agents that have working API routes
const WORKING_AGENTS = [
  'on-page-seo-audit',
  'conversion-rate-optimizer',
  'welcome-email-sequence-writer',
  'image-generator',
  'alternatives-to-page-writer',
  'use-case-writer',
  'headline-generator',
  'your-slug', // ⚠️ Add your agent here
]
```

### Key Points:
- ✅ Only add agents with fully working API routes
- ✅ Keep the list in a logical order
- ✅ This determines which agents show as "working" vs "coming soon"

---

## Step 6: Testing Checklist

Before considering an agent complete, verify:

### Functionality
- [ ] API route responds correctly
- [ ] Authentication works (redirects if not logged in)
- [ ] Rate limiting works
- [ ] Credit deduction works
- [ ] Credit refund on error works
- [ ] Results are saved to database
- [ ] Saved results can be reloaded

### UI/UX
- [ ] Form displays correctly
- [ ] Form validation works
- [ ] Loading states show properly
- [ ] Error messages display correctly
- [ ] Results display correctly
- [ ] Brand selector works (if applicable)
- [ ] All form fields work as expected

### Integration
- [ ] Agent appears in agents list
- [ ] Agent page loads correctly
- [ ] "How it works" section displays
- [ ] Process steps match SQL sequence
- [ ] Agent shows correct credits cost
- [ ] Agent shows correct category badge

### Database
- [ ] SQL file runs without errors
- [ ] Agent record created in database
- [ ] All fields populated correctly
- [ ] Agent appears as active

---

## Common Patterns

### Pattern 1: Brand Profile Only Agent

**Use when:** Agent only needs brand profile, no other inputs

**API Route:**
- Only requires `brandId`
- Fetches brand profile
- Uses brand context in prompt

**UI:**
- Only brand profile selector
- No additional form fields

**Examples:** `headline-generator`, `welcome-email-sequence-writer`

### Pattern 2: Brand Profile + Additional Inputs

**Use when:** Agent needs brand profile plus user-provided parameters

**API Route:**
- Requires `brandId` + other params
- Validates all inputs
- Combines brand context with user inputs

**UI:**
- Brand profile selector
- Additional form fields (text inputs, selects, etc.)

**Examples:** `welcome-email-sequence-writer` (has numberOfEmails, timeframe, primaryCta)

### Pattern 3: No Brand Profile Agent

**Use when:** Agent doesn't need brand profile

**API Route:**
- No brand profile fetching
- Only user-provided inputs
- Simpler validation

**UI:**
- No brand selector
- Only relevant form fields

**Examples:** `image-generator`, `use-case-writer`

### Pattern 4: URL Scraping Agent

**Use when:** Agent needs to scrape/analyze a URL

**API Route:**
- Requires `url` parameter
- Validates URL format
- May include scraping logic

**UI:**
- URL input field
- Optional additional parameters

**Examples:** `on-page-seo-audit`, `conversion-rate-optimizer`

---

## Best Practices

### Code Quality
- ✅ **Consistent naming**: Use kebab-case for slugs, PascalCase for components
- ✅ **Error handling**: Always handle errors gracefully with user-friendly messages
- ✅ **Type safety**: Use TypeScript types for all inputs/outputs
- ✅ **Code reuse**: Copy and adapt from similar existing agents
- ✅ **Comments**: Add comments for complex logic

### User Experience
- ✅ **Clear labels**: Use descriptive labels for all form fields
- ✅ **Helpful hints**: Add helper text below inputs when needed
- ✅ **Loading feedback**: Show clear loading states with step descriptions
- ✅ **Error recovery**: Provide actionable error messages
- ✅ **Result formatting**: Format results for easy reading (Markdown, structured)

### Performance
- ✅ **Timeouts**: Set appropriate timeouts for AI calls (240s default)
- ✅ **Rate limiting**: Always include rate limiting
- ✅ **Credit checks**: Check credits before processing
- ✅ **Result caching**: Save results for reload capability

### Security
- ✅ **Authentication**: Always verify user authentication
- ✅ **Authorization**: Verify user owns brand profile (if applicable)
- ✅ **Input validation**: Validate all inputs server-side
- ✅ **SQL injection**: Use parameterized queries (Supabase handles this)
- ✅ **XSS prevention**: Sanitize outputs (Supabase/Next.js handles this)

### AI Prompts
- ✅ **Clear instructions**: Be specific about desired output format
- ✅ **Brand alignment**: Always reference brand profile when available
- ✅ **Structured output**: Request Markdown or structured format
- ✅ **Examples**: Include examples in prompts when helpful
- ✅ **Constraints**: Specify what NOT to do (no fake features, etc.)

### Database
- ✅ **Consistent slugs**: Use same slug everywhere (API, SQL, code)
- ✅ **Complete data**: Fill all required fields in SQL
- ✅ **Realistic credits**: Set appropriate credit costs
- ✅ **Active status**: Set `is_active: true` for working agents

---

## Quick Reference: File Locations

| Component | File Path |
|-----------|-----------|
| API Route | `/app/api/agents/[slug]/route.ts` |
| UI Interface | `/app/agent/[slug]/agent-interface.tsx` |
| Process Steps | `/app/agent/[slug]/agent-process-steps.tsx` |
| SQL Entry | `/supabase_[slug]_agent.sql` |
| Agent Registration | `/app/page.tsx` (WORKING_AGENTS array) |

---

## Quick Reference: Common Categories

- `SEO`
- `Sales`
- `Content Marketing`
- `Email Marketing`
- `Paid Ads`
- `Creator Marketing`
- `Business/Strategy`
- `Miscellaneous`

---

## Quick Reference: Credit Costs

- **1 credit**: Simple, fast agents (keyword research, basic generators)
- **2 credits**: Medium complexity (alternatives page, use case writer)
- **3 credits**: Complex agents (headline generator, email sequences)
- **4-5 credits**: Very complex or resource-intensive agents

---

## Troubleshooting

### Agent doesn't appear in list
- ✅ Check SQL file was run successfully
- ✅ Verify `is_active: true` in database
- ✅ Check `coming_soon: false` (if field exists)
- ✅ Verify slug matches everywhere

### API route returns 404
- ✅ Check file path matches slug exactly
- ✅ Verify route exports `POST` function
- ✅ Check slug in agent lookup matches

### UI doesn't show
- ✅ Verify agent case added to `agent-interface.tsx`
- ✅ Check slug matches exactly (case-sensitive)
- ✅ Verify form component is before default return

### Process steps don't show
- ✅ Verify case added to `agent-process-steps.tsx`
- ✅ Check slug matches exactly
- ✅ Ensure it's before default return

### Credits not deducted
- ✅ Verify credit cost set in SQL
- ✅ Check `deduct_user_credits` RPC exists
- ✅ Verify user has sufficient credits
- ✅ Check error handling for credit errors

---

## Example: Complete Agent Creation

See the `headline-generator` agent for a complete reference implementation:

1. **API Route**: `/app/api/agents/headline-generator/route.ts`
2. **UI Interface**: `/app/agent/[slug]/agent-interface.tsx` (search for `headline-generator`)
3. **Process Steps**: `/app/agent/[slug]/agent-process-steps.tsx` (search for `headline-generator`)
4. **SQL Entry**: `/supabase_headline_generator_agent.sql`
5. **Registration**: `/app/page.tsx` (in WORKING_AGENTS array)

---

## Next Steps After Creation

1. **Test thoroughly** using the checklist above
2. **Update documentation** if needed
3. **Add to changelog** if you maintain one
4. **Monitor usage** via agent_results table
5. **Gather feedback** from users
6. **Iterate** based on feedback

---

**Last Updated:** Based on headline-generator agent implementation
**Maintained by:** Development Team

