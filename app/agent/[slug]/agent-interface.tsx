'use client'

import { useState } from 'react'

type AgentInterfaceProps = {
  slug: string
}

export default function AgentInterface({ slug }: AgentInterfaceProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResult(null)

    // Dispatch agent start event
    window.dispatchEvent(new CustomEvent('agent:start'))

    try {
      // TODO: Replace with actual API call
      // For now, simulate a delay and show placeholder result
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Placeholder result - will be replaced with actual API response
      setResult('SEO Audit results will appear here...')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      // Dispatch agent stop event
      window.dispatchEvent(new CustomEvent('agent:stop'))
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
                  <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0a1 1 0 0 1 .857.514l1.5 3 3.343.486a1 1 0 0 1 .554 1.706l-2.42 2.36.571 3.329a1 1 0 0 1-1.451 1.055L8 11.5l-2.988 1.57a1 1 0 0 1-1.45-1.055l.57-3.33-2.42-2.36a1 1 0 0 1 .554-1.705l3.343-.486 1.5-3A1 1 0 0 1 8 0Z" />
                  </svg>
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
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a1 1 0 0 1 .857.514l1.5 3 3.343.486a1 1 0 0 1 .554 1.706l-2.42 2.36.571 3.329a1 1 0 0 1-1.451 1.055L8 11.5l-2.988 1.57a1 1 0 0 1-1.45-1.055l.57-3.33-2.42-2.36a1 1 0 0 1 .554-1.705l3.343-.486 1.5-3A1 1 0 0 1 8 0Z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Your SEO audit results will appear here</p>
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

