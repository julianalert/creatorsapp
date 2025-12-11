'use client'

import { useState, useEffect } from 'react'
import { SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import EmailSequenceDisplay from './email-sequence-display'

type AgentInterfaceProps = {
  slug: string
  resultId?: string
}

export default function AgentInterface({ slug, resultId }: AgentInterfaceProps) {
  const [url, setUrl] = useState('')
  const [conversionGoal, setConversionGoal] = useState('')
  // Keyword Research state
  const [topic, setTopic] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [geographicFocus, setGeographicFocus] = useState('')
  const [contentType, setContentType] = useState('')
  const [competitorUrls, setCompetitorUrls] = useState('')
  // Blog Content Plan Generator state
  const [audiencePersonas, setAudiencePersonas] = useState('')
  const [contentGoals, setContentGoals] = useState('')
  const [industryFocus, setIndustryFocus] = useState('')
  const [competitorBlogs, setCompetitorBlogs] = useState('')
  const [existingContent, setExistingContent] = useState('')
  const [publishingFrequency, setPublishingFrequency] = useState('')
  // Blog Post Writer state
  const [postTopic, setPostTopic] = useState('')
  const [postAudience, setPostAudience] = useState('')
  const [tone, setTone] = useState('')
  const [wordCount, setWordCount] = useState('')
  const [keyPoints, setKeyPoints] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  // Image Generator state
  const [imageDescription, setImageDescription] = useState('')
  const [imageStyle, setImageStyle] = useState('')
  const [aspectRatio, setAspectRatio] = useState('')
  const [numberOfImages, setNumberOfImages] = useState('1')
  const [additionalRequirements, setAdditionalRequirements] = useState('')
  // Contact Researcher state
  const [companyName, setCompanyName] = useState('')
  const [personName, setPersonName] = useState('')
  const [personTitle, setPersonTitle] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [contactTypes, setContactTypes] = useState<string[]>([])
  // Company Researcher state
  const [researchCompanyName, setResearchCompanyName] = useState('')
  const [researchCompanyWebsite, setResearchCompanyWebsite] = useState('')
  const [researchIndustry, setResearchIndustry] = useState('')
  const [researchDepth, setResearchDepth] = useState('detailed')
  const [specificInfo, setSpecificInfo] = useState('')
  // Competitor Analyst state
  const [competitorNames, setCompetitorNames] = useState('')
  const [yourCompany, setYourCompany] = useState('')
  const [analysisFocus, setAnalysisFocus] = useState('')
  const [marketSegment, setMarketSegment] = useState('')
  const [geographicScope, setGeographicScope] = useState('')
  // Welcome Email Sequence Writer state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [numberOfEmails, setNumberOfEmails] = useState('3')
  const [timeframe, setTimeframe] = useState('within the first 7 days after signup')
  const [primaryCta, setPrimaryCta] = useState('')
  const [secondaryCtas, setSecondaryCtas] = useState('')
  const [emailFormat, setEmailFormat] = useState('HTML-friendly but simple')
  const [personalizationTokens, setPersonalizationTokens] = useState('{{first_name}}, {{company_name}}')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingSavedResult, setIsLoadingSavedResult] = useState(false)

  // Fetch saved result if resultId is provided
  useEffect(() => {
    if (resultId) {
      setIsLoadingSavedResult(true)
      fetch(`/api/agents/results?id=${resultId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const savedResult = data.data
            // Extract result from result_data based on agent type
            if (savedResult.result_data?.result) {
              setResult(savedResult.result_data.result)
            }
            // Populate form fields from input_params if available
            if (savedResult.input_params) {
              if (savedResult.input_params.url) setUrl(savedResult.input_params.url)
              if (savedResult.input_params.conversionGoal) setConversionGoal(savedResult.input_params.conversionGoal)
              // Welcome Email Sequence Writer fields
              if (savedResult.input_params.url) setWebsiteUrl(savedResult.input_params.url)
              if (savedResult.input_params.numberOfEmails) setNumberOfEmails(savedResult.input_params.numberOfEmails)
              if (savedResult.input_params.timeframe) setTimeframe(savedResult.input_params.timeframe)
              if (savedResult.input_params.primaryCta) setPrimaryCta(savedResult.input_params.primaryCta)
              if (savedResult.input_params.secondaryCtas) setSecondaryCtas(savedResult.input_params.secondaryCtas)
              if (savedResult.input_params.emailFormat) setEmailFormat(savedResult.input_params.emailFormat)
              if (savedResult.input_params.personalizationTokens) setPersonalizationTokens(savedResult.input_params.personalizationTokens)
            }
          } else {
            setError('Failed to load saved result')
          }
        })
        .catch((err) => {
          console.error('Error loading saved result:', err)
          setError('Failed to load saved result')
        })
        .finally(() => {
          setIsLoadingSavedResult(false)
        })
    }
  }, [resultId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResult(null)
    setCurrentStep(null)

    // Dispatch agent start event
    window.dispatchEvent(new CustomEvent('agent:start', { detail: { slug } }))

    try {
      if (slug === 'on-page-seo-audit') {
        setCurrentStep('Scraping URL...')
        // Show scraping step for at least 1.5 seconds
        await new Promise(resolve => setTimeout(resolve, 1500))

        setCurrentStep('Analyzing Technical SEO...')
        // Start the API call
        const fetchPromise = fetch('/api/agents/seo-audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        // Show technical SEO step for at least 2.5 seconds (even if fetch completes faster)
        const technicalSEODelay = new Promise(resolve => setTimeout(resolve, 2500))
        await technicalSEODelay

        setCurrentStep('Analyzing Content SEO...')
        // Show content SEO step for at least 1 second
        await new Promise(resolve => setTimeout(resolve, 1000))

        setCurrentStep('Finalizing results...')
        // Wait for the response while showing finalizing step
        const response = await fetchPromise

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate SEO audit')
        }

        if (data.success && data.result) {
          // Wait for both a delay and ensure processing is complete
          await Promise.all([
            new Promise(resolve => setTimeout(resolve, 1500))
          ])
          setResult(data.result)
          setCurrentStep(null)
          // Update URL to include resultId if available
          if (data.resultId) {
            const url = new URL(window.location.href)
            url.searchParams.set('resultId', data.resultId)
            window.history.replaceState({}, '', url.toString())
          }
          // Dispatch event to update credits in navbar
          if (data.creditsRemaining !== undefined) {
            window.dispatchEvent(new CustomEvent('agent:credits-updated'))
          }
        } else {
          throw new Error('Invalid response from SEO audit API')
        }
      } else if (slug === 'conversion-rate-optimizer') {
        setCurrentStep('Scraping URL...')
        // Show scraping step for at least 1.5 seconds
        await new Promise(resolve => setTimeout(resolve, 1500))

        setCurrentStep('Analyzing Conversion Rate...')
        // Start the API call
        const fetchPromise = fetch('/api/agents/conversion-rate-optimizer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, conversionGoal }),
        })

        // Show analyzing step for at least 2 seconds
        const analyzingDelay = new Promise(resolve => setTimeout(resolve, 2000))
        await analyzingDelay

        setCurrentStep('Finalizing results...')
        // Wait for the response while showing finalizing step
        const response = await fetchPromise

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate conversion rate optimization analysis')
        }

        if (data.success && data.result) {
          // Wait for both a delay and ensure processing is complete
          await Promise.all([
            new Promise(resolve => setTimeout(resolve, 1500))
          ])
          setResult(data.result)
          setCurrentStep(null)
          // Update URL to include resultId if available
          if (data.resultId) {
            const url = new URL(window.location.href)
            url.searchParams.set('resultId', data.resultId)
            window.history.replaceState({}, '', url.toString())
          }
          // Dispatch event to update credits in navbar
          if (data.creditsRemaining !== undefined) {
            window.dispatchEvent(new CustomEvent('agent:credits-updated'))
          }
        } else {
          throw new Error('Invalid response from conversion rate optimizer API')
        }
      } else if (slug === 'keyword-research') {
        setResult('Keyword Research results will appear here...')
      } else if (slug === 'blog-content-plan-generator') {
        setResult('Blog Content Plan results will appear here...')
      } else if (slug === 'blog-post-writer') {
        setResult('Blog Post results will appear here...')
      } else if (slug === 'image-generator') {
        setResult('Generated images will appear here...')
      } else if (slug === 'contact-researcher') {
        setResult('Contact research results will appear here...')
      } else if (slug === 'company-researcher') {
        setResult('Company research results will appear here...')
      } else if (slug === 'competitor-analyst') {
        setResult('Competitive analysis results will appear here...')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setCurrentStep(null)
    } finally {
      setLoading(false)
      // Dispatch agent stop event
      window.dispatchEvent(new CustomEvent('agent:stop', { detail: { slug } }))
    }
  }

  // On-Page SEO Audit specific interface
  if (slug === 'on-page-seo-audit') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="url-input">
              Website URL
            </label>
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
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
                  Generate SEO Audit
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
                <p className="text-gray-500 dark:text-gray-400">Your SEO audit results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Conversion Rate Optimizer specific interface
  if (slug === 'conversion-rate-optimizer') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="url-input">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="conversion-goal">
              Conversion Goal <span className="text-red-500">*</span>
            </label>
            <input
              id="conversion-goal"
              type="text"
              placeholder="e.g., Sign up, Purchase, Download"
              value={conversionGoal}
              onChange={(e) => setConversionGoal(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
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
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Analyze Conversion Rate
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
                <p className="text-gray-500 dark:text-gray-400">Your conversion rate optimization analysis will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Keyword Research specific interface
  if (slug === 'keyword-research') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="topic">
              Topic or Industry <span className="text-red-500">*</span>
            </label>
            <input
              id="topic"
              type="text"
              placeholder="e.g., Project management software, SaaS tools"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="target-audience">
              Target Audience
            </label>
            <input
              id="target-audience"
              type="text"
              placeholder="e.g., Small business owners, Marketing teams"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="geographic-focus">
                Geographic Focus
              </label>
              <input
                id="geographic-focus"
                type="text"
                placeholder="e.g., US, Global, Europe"
                value={geographicFocus}
                onChange={(e) => setGeographicFocus(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="content-type">
                Content Type
              </label>
              <input
                id="content-type"
                type="text"
                placeholder="e.g., Blog post, Product page"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="competitor-urls">
              Competitor URLs (optional)
            </label>
            <textarea
              id="competitor-urls"
              rows={3}
              placeholder="Enter competitor URLs, one per line"
              value={competitorUrls}
              onChange={(e) => setCompetitorUrls(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>
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
                  Researching...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Generate Keyword Research
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your keyword research results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Blog Content Plan Generator specific interface
  if (slug === 'blog-content-plan-generator') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="audience-personas">
              Target Audience Personas <span className="text-red-500">*</span>
            </label>
            <textarea
              id="audience-personas"
              rows={3}
              placeholder="Describe your target audience personas, e.g., Marketing managers at SaaS companies, Small business owners"
              value={audiencePersonas}
              onChange={(e) => setAudiencePersonas(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="content-goals">
              Content Goals <span className="text-red-500">*</span>
            </label>
            <input
              id="content-goals"
              type="text"
              placeholder="e.g., Drive organic traffic, Generate leads, Build brand awareness"
              value={contentGoals}
              onChange={(e) => setContentGoals(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="industry-focus">
              Industry/Niche Focus <span className="text-red-500">*</span>
            </label>
            <input
              id="industry-focus"
              type="text"
              placeholder="e.g., SaaS, E-commerce, B2B Marketing"
              value={industryFocus}
              onChange={(e) => setIndustryFocus(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="competitor-blogs">
              Competitor Blogs (optional)
            </label>
            <textarea
              id="competitor-blogs"
              rows={2}
              placeholder="Enter competitor blog URLs, one per line"
              value={competitorBlogs}
              onChange={(e) => setCompetitorBlogs(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="existing-content">
                Existing Content Inventory (optional)
              </label>
              <textarea
                id="existing-content"
                rows={3}
                placeholder="List your existing blog posts or topics"
                value={existingContent}
                onChange={(e) => setExistingContent(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="publishing-frequency">
                Publishing Frequency (optional)
              </label>
              <input
                id="publishing-frequency"
                type="text"
                placeholder="e.g., 2 posts/week, Monthly"
                value={publishingFrequency}
                onChange={(e) => setPublishingFrequency(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
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
                  Generate Content Plan
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your content plan results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Blog Post Writer specific interface
  if (slug === 'blog-post-writer') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="post-topic">
              Blog Post Topic or Title <span className="text-red-500">*</span>
            </label>
            <input
              id="post-topic"
              type="text"
              placeholder="e.g., 10 Best Project Management Tools for Remote Teams"
              value={postTopic}
              onChange={(e) => setPostTopic(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="post-audience">
              Target Audience
            </label>
            <input
              id="post-audience"
              type="text"
              placeholder="e.g., Marketing managers, Small business owners"
              value={postAudience}
              onChange={(e) => setPostAudience(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="tone">
                Tone and Style
              </label>
              <input
                id="tone"
                type="text"
                placeholder="e.g., Professional, Conversational, Friendly"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="word-count">
                Desired Word Count
              </label>
              <input
                id="word-count"
                type="number"
                min="500"
                max="5000"
                placeholder="e.g., 1500"
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="key-points">
              Key Points to Cover (optional)
            </label>
            <textarea
              id="key-points"
              rows={4}
              placeholder="List the main points or sections you want covered in the blog post, one per line"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="seo-keywords">
              SEO Keywords (optional)
            </label>
            <input
              id="seo-keywords"
              type="text"
              placeholder="e.g., project management, remote teams, collaboration tools"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
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
                  Writing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Generate Blog Post
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your blog post will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Image Generator specific interface
  if (slug === 'image-generator') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="image-description">
              Image Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="image-description"
              rows={4}
              placeholder="Describe the image you want to generate in detail, e.g., A modern workspace with a laptop, plants, and natural lighting"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="image-style">
                Style Preferences
              </label>
              <select
                id="image-style"
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select style...</option>
                <option value="realistic">Realistic</option>
                <option value="artistic">Artistic</option>
                <option value="minimalist">Minimalist</option>
                <option value="photographic">Photographic</option>
                <option value="illustration">Illustration</option>
                <option value="3d">3D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="aspect-ratio">
                Aspect Ratio
              </label>
              <select
                id="aspect-ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select aspect ratio...</option>
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
                <option value="4:3">Standard (4:3)</option>
                <option value="3:4">Vertical (3:4)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="number-of-images">
                Number of Images
              </label>
              <input
                id="number-of-images"
                type="number"
                min="1"
                max="4"
                placeholder="1"
                value={numberOfImages}
                onChange={(e) => setNumberOfImages(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="additional-requirements">
                Additional Requirements (optional)
              </label>
              <input
                id="additional-requirements"
                type="text"
                placeholder="e.g., Bright colors, Professional mood"
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
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
                  Generate Image
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your generated images will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Contact Researcher specific interface
  if (slug === 'contact-researcher') {
    const handleContactTypeChange = (type: string) => {
      setContactTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      )
    }

    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="company-name">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                placeholder="e.g., TechCorp Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="company-website">
                Company Website
              </label>
              <input
                id="company-website"
                type="url"
                placeholder="https://example.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="person-name">
                Person Name
              </label>
              <input
                id="person-name"
                type="text"
                placeholder="e.g., John Smith"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="person-title">
                Person Title
              </label>
              <input
                id="person-title"
                type="text"
                placeholder="e.g., Marketing Director"
                value={personTitle}
                onChange={(e) => setPersonTitle(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="industry">
                Industry
              </label>
              <input
                id="industry"
                type="text"
                placeholder="e.g., SaaS, E-commerce"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Contact Types Needed
            </label>
            <div className="flex flex-wrap gap-3">
              {['Email', 'Phone', 'LinkedIn', 'Twitter', 'Other Social'].map((type) => (
                <label
                  key={type}
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={contactTypes.includes(type)}
                    onChange={() => handleContactTypeChange(type)}
                    disabled={loading}
                    className="form-checkbox w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>
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
                  Researching...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Find Contacts
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your contact research results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Company Researcher specific interface
  if (slug === 'company-researcher') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="research-company-name">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="research-company-name"
                type="text"
                placeholder="e.g., TechCorp Inc."
                value={researchCompanyName}
                onChange={(e) => setResearchCompanyName(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="research-company-website">
                Company Website
              </label>
              <input
                id="research-company-website"
                type="url"
                placeholder="https://example.com"
                value={researchCompanyWebsite}
                onChange={(e) => setResearchCompanyWebsite(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="research-industry">
                Industry Focus
              </label>
              <input
                id="research-industry"
                type="text"
                placeholder="e.g., SaaS, E-commerce, Healthcare"
                value={researchIndustry}
                onChange={(e) => setResearchIndustry(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="research-depth">
                Research Depth
              </label>
              <select
                id="research-depth"
                value={researchDepth}
                onChange={(e) => setResearchDepth(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="specific-info">
              Specific Information Needed (optional)
            </label>
            <textarea
              id="specific-info"
              rows={3}
              placeholder="e.g., Focus on funding history, technology stack, or recent news"
              value={specificInfo}
              onChange={(e) => setSpecificInfo(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>
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
                  Researching...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Research Company
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your company research results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Competitor Analyst specific interface
  if (slug === 'competitor-analyst') {
    return (
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="competitor-names">
              Competitor Names <span className="text-red-500">*</span>
            </label>
            <textarea
              id="competitor-names"
              rows={3}
              placeholder="Enter competitor company names or websites, one per line"
              value={competitorNames}
              onChange={(e) => setCompetitorNames(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="your-company">
              Your Company/Product (for context)
            </label>
            <input
              id="your-company"
              type="text"
              placeholder="e.g., MyCompany - Project Management Tool"
              value={yourCompany}
              onChange={(e) => setYourCompany(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="analysis-focus">
                Analysis Focus
              </label>
              <select
                id="analysis-focus"
                value={analysisFocus}
                onChange={(e) => setAnalysisFocus(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select focus...</option>
                <option value="pricing">Pricing</option>
                <option value="features">Features</option>
                <option value="marketing">Marketing</option>
                <option value="positioning">Positioning</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="market-segment">
                Market Segment
              </label>
              <input
                id="market-segment"
                type="text"
                placeholder="e.g., B2B SaaS, Enterprise, SMB"
                value={marketSegment}
                onChange={(e) => setMarketSegment(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="geographic-scope">
              Geographic Scope (optional)
            </label>
            <input
              id="geographic-scope"
              type="text"
              placeholder="e.g., North America, Global, Europe"
              value={geographicScope}
              onChange={(e) => setGeographicScope(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
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
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Analyze Competitors
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
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your competitive analysis results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Welcome Email Sequence Writer specific interface
  if (slug === 'welcome-email-sequence-writer') {
    return (
      <div className="mb-8">
        <form onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setLoading(true)
          setResult(null)
          setCurrentStep(null)

          window.dispatchEvent(new CustomEvent('agent:start', { detail: { slug } }))

          try {
            setCurrentStep('Scraping website...')
            await new Promise(resolve => setTimeout(resolve, 1500))

            setCurrentStep('Analyzing website content...')
            const analyzingDelay = new Promise(resolve => setTimeout(resolve, 2000))
            await analyzingDelay

            setCurrentStep('Generating email sequence...')
            const fetchPromise = fetch('/api/agents/welcome-email-sequence-writer', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: websiteUrl,
                numberOfEmails,
                timeframe,
                primaryCta,
                secondaryCtas,
                emailFormat,
                personalizationTokens,
              }),
            })

            await new Promise(resolve => setTimeout(resolve, 2000))
            setCurrentStep('Finalizing results...')

            const response = await fetchPromise
            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.error || 'Failed to generate email sequence')
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
              throw new Error('Invalid response from email sequence API')
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setCurrentStep(null)
          } finally {
            setLoading(false)
            window.dispatchEvent(new CustomEvent('agent:stop', { detail: { slug } }))
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="website-url">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              id="website-url"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">We'll scrape and analyze your website to understand your product and brand</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="number-of-emails">
                Number of Emails <span className="text-red-500">*</span>
              </label>
              <select
                id="number-of-emails"
                value={numberOfEmails}
                onChange={(e) => setNumberOfEmails(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="3">3 emails</option>
                <option value="4">4 emails</option>
                <option value="5">5 emails</option>
                <option value="6">6 emails</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="timeframe">
                Timeframe <span className="text-red-500">*</span>
              </label>
              <input
                id="timeframe"
                type="text"
                placeholder="e.g., within the first 7 days after signup"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="primary-cta">
              Primary CTA
            </label>
            <input
              id="primary-cta"
              type="text"
              placeholder="e.g., create first project, book a demo, install the script"
              value={primaryCta}
              onChange={(e) => setPrimaryCta(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave empty to let the AI infer from your website</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="secondary-ctas">
              Secondary CTAs (optional)
            </label>
            <input
              id="secondary-ctas"
              type="text"
              placeholder="e.g., watch tutorial, join community, read docs"
              value={secondaryCtas}
              onChange={(e) => setSecondaryCtas(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="email-format">
                Email Format
              </label>
              <select
                id="email-format"
                value={emailFormat}
                onChange={(e) => setEmailFormat(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="plain text style">Plain text style</option>
                <option value="HTML-friendly but simple">HTML-friendly but simple</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="personalization-tokens">
                Personalization Tokens
              </label>
              <input
                id="personalization-tokens"
                type="text"
                placeholder="e.g., {{first_name}}, {{company_name}}"
                value={personalizationTokens}
                onChange={(e) => setPersonalizationTokens(e.target.value)}
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
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
                  Generate Email Sequence
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
          <div className={`bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-8 min-h-[400px] ${result && slug === 'welcome-email-sequence-writer' ? '' : 'flex items-center justify-center'}`}>
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
                {slug === 'welcome-email-sequence-writer' ? (
                  <EmailSequenceDisplay markdown={result} />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                )}
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
                <p className="text-gray-500 dark:text-gray-400">Your email sequence will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default interface for other agents (can be customized per agent)
  return (
    <div className="mb-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">Agent interface coming soon...</p>
    </div>
  )
}

