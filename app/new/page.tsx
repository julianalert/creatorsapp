'use client'

import { useState, type FormEvent } from 'react'
import NewHeader from './new-header'
import NewProgress from './new-progress'

type BrandProfile = {
  industry: string
  niche: string
  tone: string
  audience: string
  regions: string[]
  price_positioning: string
  keywords: string[]
  heuristics?: {
    currency_regions?: Array<{
      symbol: string
      region: string
      reasoning?: string
    }>
    niche_tags?: string[]
    notes?: string
  }
}

type ScrapeResult = {
  status: number
  finalUrl: string
  contentType: string
  body: string
  websiteId: string | null
  markdown: string | null
  brandProfile: BrandProfile | null
  brandProfileError: string | null
}

export default function NewPage() {
  const [submitted, setSubmitted] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScrapeResult | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!url) {
      setError('Please provide a valid URL.')
      return
    }

    setSubmitted(true)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to fetch the website.')
      }

      setResult({
        status: data?.status ?? response.status,
        finalUrl: data?.finalUrl ?? url,
        contentType: data?.contentType ?? 'text/plain',
        body: data?.body ?? '',
        websiteId: data?.websiteId ?? null,
        markdown: data?.markdown ?? null,
        brandProfile: data?.brandProfile ?? null,
        brandProfileError: data?.brandProfileError ?? null,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error while scraping the website.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setLoading(false)
    setError(null)
    setResult(null)
  }

  return (
    <main className="bg-white dark:bg-gray-900">

      <div className="relative flex justify-center">

        {/* Content */}
        <div className="w-full max-w-2xl">

          <div className="min-h-[100dvh] h-full flex flex-col">

            <div className="w-full px-4 py-8">
              <NewHeader />
            </div>

            <div className="flex-1 flex flex-col items-center px-4 py-8 w-full">
              {submitted ? (
                <div className="flex-1 flex flex-col items-center px-4 py-8 w-full">
                  <div className="max-w-2xl w-full mx-auto">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center w-full gap-4 py-16">
                        <svg
                          className="h-10 w-10 text-violet-500 dark:text-violet-300 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"
                          ></path>
                        </svg>
                        <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                          Scraping website content...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          {error ? (
                            <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-red-700 dark:text-red-300">
                              {error}
                            </div>
                          ) : result ? (
                            <>
                              <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                  Scraped content
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Status: {result.status} · Type: {result.contentType} · URL:{' '}
                                  {result.finalUrl}
                                </p>
                                {result.websiteId && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Saved to website record: {result.websiteId}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-4">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 p-4 text-sm text-gray-600 dark:text-gray-300">
                                  Creator recommendations are coming soon.
                                </div>

                                {result.brandProfileError && (
                                  <div className="rounded-lg border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-3 text-yellow-800 dark:text-yellow-200">
                                    {result.brandProfileError}
                                  </div>
                                )}

                                {result.brandProfile && (
                                  <div className="rounded-lg border border-violet-200 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-900/20 p-4 space-y-4">
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                        Brand profile
                                      </h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Generated automatically from the scraped website content.
                                      </p>
                                    </div>
                                    <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                                      <div>
                                        <dt className="font-medium text-gray-700 dark:text-gray-300">
                                          Industry
                                        </dt>
                                        <dd className="text-gray-800 dark:text-gray-100">
                                          {result.brandProfile.industry}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium text-gray-700 dark:text-gray-300">
                                          Niche
                                        </dt>
                                        <dd className="text-gray-800 dark:text-gray-100">
                                          {result.brandProfile.niche}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium text-gray-700 dark:text-gray-300">
                                          Tone
                                        </dt>
                                        <dd className="text-gray-800 dark:text-gray-100">
                                          {result.brandProfile.tone}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium text-gray-700 dark:text-gray-300">
                                          Audience
                                        </dt>
                                        <dd className="text-gray-800 dark:text-gray-100">
                                          {result.brandProfile.audience}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium text-gray-700 dark:text-gray-300">
                                          Regions
                                        </dt>
                                        <dd className="text-gray-800 dark:text-gray-100">
                                          {Array.isArray(result.brandProfile.regions) &&
                                          result.brandProfile.regions.length > 0
                                            ? result.brandProfile.regions.join(', ')
                                            : '—'}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium text-gray-700 dark:text-gray-300">
                                          Price positioning
                                        </dt>
                                        <dd className="text-gray-800 dark:text-gray-100">
                                          {result.brandProfile.price_positioning}
                                        </dd>
                                      </div>
                                    </dl>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                        Keywords
                                      </h4>
                                      {Array.isArray(result.brandProfile.keywords) &&
                                      result.brandProfile.keywords.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                          {result.brandProfile.keywords.map((keyword) => (
                                            <span
                                              key={keyword}
                                              className="inline-flex items-center rounded-full bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300"
                                            >
                                              {keyword}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-700 dark:text-gray-200">—</p>
                                      )}
                                    </div>
                                    {result.brandProfile.heuristics && (
                                      <div className="space-y-3">
                                        <h4 className="text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                          Heuristics
                                        </h4>
                                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                          {Array.isArray(result.brandProfile.heuristics.currency_regions) &&
                                            result.brandProfile.heuristics.currency_regions.length > 0 && (
                                              <div>
                                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                                  Currency regions
                                                </p>
                                                <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-200">
                                                  {result.brandProfile.heuristics.currency_regions.map(
                                                    (entry, index) => (
                                                      <li key={`${entry.symbol}-${entry.region}-${index}`}>
                                                        <span className="font-semibold">{entry.symbol}</span>{' '}
                                                        &rarr; {entry.region}
                                                        {entry.reasoning ? ` — ${entry.reasoning}` : ''}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}
                                          {Array.isArray(result.brandProfile.heuristics.niche_tags) &&
                                            result.brandProfile.heuristics.niche_tags.length > 0 && (
                                              <div>
                                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                                  Niche tags
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                  {result.brandProfile.heuristics.niche_tags.map((tag) => (
                                                    <span
                                                      key={tag}
                                                      className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                                                    >
                                                      {tag}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          {result.brandProfile.heuristics.notes && (
                                            <div>
                                              <p className="font-medium text-gray-700 dark:text-gray-300">Notes</p>
                                              <p className="mt-1 text-gray-700 dark:text-gray-200">
                                                {result.brandProfile.heuristics.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                  {result.markdown ? (
                                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                                      {result.markdown}
                                    </pre>
                                  ) : (
                                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                                      {result.body || 'No content returned.'}
                                    </pre>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="rounded-lg border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-3 text-yellow-800 dark:text-yellow-200">
                              No content available.
                            </div>
                          )}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleReset}
                              className="btn border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              New search
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center px-4 py-8 w-full">
                  <div className="max-w-md w-full mx-auto mb-8">
                    <NewProgress step={1} />
                  </div>
                  <div className="max-w-md w-full mx-auto">
                    <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6 text-center">
                      Set up your project
                    </h1>
                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-8">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 text-center" htmlFor="instagram-url">
                          Enter your website URL, <br />our engine will create a brand profile for your project
                        </label>
                        <input 
                          id="instagram-url"
                          type="url"
                          placeholder="https://www.yuzuu.co"
                          value={url}
                          onChange={(event) => setUrl(event.target.value)}
                          className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button 
                          type="submit"
                          className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer"
                        >
                          Set up my project
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </main>
  )
}
