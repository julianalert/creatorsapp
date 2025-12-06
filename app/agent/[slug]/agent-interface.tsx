'use client'

import { useState } from 'react'
import { SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

type AgentInterfaceProps = {
  slug: string
}

export default function AgentInterface({ slug }: AgentInterfaceProps) {
  const [url, setUrl] = useState('')
  const [conversionGoal, setConversionGoal] = useState('')
  const [currentRate, setCurrentRate] = useState('')
  const [funnelSteps, setFunnelSteps] = useState('')
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
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResult(null)

    // Dispatch agent start event
    window.dispatchEvent(new CustomEvent('agent:start', { detail: { slug } }))

    try {
      // TODO: Replace with actual API call
      // For now, simulate a delay and show placeholder result
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Placeholder result - will be replaced with actual API response
      if (slug === 'on-page-seo-audit') {
        setResult('SEO Audit results will appear here...')
      } else if (slug === 'conversion-rate-optimizer') {
        setResult('Conversion Rate Optimization results will appear here...')
      } else if (slug === 'keyword-research') {
        setResult('Keyword Research results will appear here...')
      } else if (slug === 'blog-content-plan-generator') {
        setResult('Blog Content Plan results will appear here...')
      } else if (slug === 'blog-post-writer') {
        setResult('Blog Post results will appear here...')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
            {result ? (
              <div className="w-full text-gray-800 dark:text-gray-100">
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="current-rate">
              Current Conversion Rate (%)
            </label>
            <input
              id="current-rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="e.g., 2.5"
              value={currentRate}
              onChange={(e) => setCurrentRate(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="funnel-steps">
              Funnel Steps (optional)
            </label>
            <textarea
              id="funnel-steps"
              rows={4}
              placeholder="Describe your conversion funnel steps, e.g., Landing Page → Product Page → Checkout → Thank You"
              value={funnelSteps}
              onChange={(e) => setFunnelSteps(e.target.value)}
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
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
                  Optimize Conversion Rate
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
            {result ? (
              <div className="w-full text-gray-800 dark:text-gray-100">
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your conversion optimization results will appear here</p>
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
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
            {result ? (
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
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
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
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
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
            {result ? (
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
                className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
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
              className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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
            {result ? (
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

  // Default interface for other agents (can be customized per agent)
  return (
    <div className="mb-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">Agent interface coming soon...</p>
    </div>
  )
}

