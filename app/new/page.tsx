'use client'

import { useState, useEffect, type FormEvent } from 'react'
import NewHeader from './new-header'
import NewProgress from './new-progress'
import { createClient } from '@/lib/supabase/client'

// Comprehensive Brand Profile Type
type BrandProfile = {
  company: {
    name: string
    domain: string
    product: string
    category: string
    one_liner: string
    elevator_pitch: string
  }
  audience: {
    icp_primary: string
    icp_secondary?: string
    pains: string[]
    desires: string[]
    objections: string[]
  }
  positioning: {
    value_props: Array<{ text: string; rank: number }>
    differentiators: string[]
    competitors_mentioned: string[]
    why_now_angle: string
  }
  voice_and_tone: {
    tone_sliders: {
      playful?: number
      authoritative?: number
      friendly?: number
      professional?: number
      casual?: number
      formal?: number
    }
    writing_style_rules: {
      sentence_length: string
      punctuation: string
      emoji_usage: 'yes' | 'no' | 'sparingly'
    }
    vocabulary_preferences: {
      preferred_terms: string[]
      banned_terms: string[]
    }
  }
  style_guide: {
    capitalization_rules: string
    formatting_rules: {
      bullets: string
      headings: string
      cta_style: string
    }
    do_dont_examples: {
      do: string[]
      dont: string[]
    }
  }
  messaging_assets: {
    ctas: {
      primary: string[]
      secondary: string[]
    }
    proof_points: {
      numbers: string[]
      logos: string[]
      quotes: string[]
    }
    key_features: string[]
  }
  compliance: {
    claims_to_avoid: string[]
    regulated_wording: string[]
    disclaimers: string[]
  }
  source_trace: {
    page_urls: string[]
    timestamps: Record<string, string>
    version: number
  }
  keywords: string[]
  niche: string
}

type ScrapeResult = {
  success?: boolean
  brandId: string | null
  brandProfile: BrandProfile | null
  scrapedPagesCount?: number
  error?: string | null
}

export default function NewPage() {
  const [submitted, setSubmitted] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null)

  // Fetch brand profile from Supabase if brandId is provided
  useEffect(() => {
    const fetchBrandProfile = async () => {
      if (result?.brandId) {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('brands')
          .select('brand_profile')
          .eq('id', result.brandId)
          .single()

        if (!fetchError && data?.brand_profile) {
          setBrandProfile(data.brand_profile as BrandProfile)
        } else if (result.brandProfile) {
          // Fallback to result brandProfile
          setBrandProfile(result.brandProfile)
        }
      } else if (result?.brandProfile) {
        setBrandProfile(result.brandProfile)
      }
    }

    fetchBrandProfile()
  }, [result])

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
    setBrandProfile(null)

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
        throw new Error(data?.error ?? 'Failed to create brand profile.')
      }

      setResult({
        success: data.success,
        brandId: data.brandId ?? null,
        brandProfile: data.brandProfile ?? null,
        scrapedPagesCount: data.scrapedPagesCount ?? 0,
        error: data.error ?? null,
      })

      // Trigger event to refresh brands dropdown in navbar
      if (data.success && data.brandId) {
        window.dispatchEvent(new CustomEvent('brandAdded'))
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error while creating brand profile.'
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
    setBrandProfile(null)
  }

  const displayProfile = brandProfile || result?.brandProfile

  return (
    <main className="bg-white dark:bg-gray-900">
      <div className="relative flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="min-h-[100dvh] h-full flex flex-col">
            <div className="w-full px-4 py-8">
              <NewHeader />
            </div>

            <div className="flex-1 flex flex-col items-center px-4 py-8 w-full">
              {submitted ? (
                <div className="flex-1 flex flex-col items-center px-4 py-8 w-full">
                  <div className="max-w-4xl w-full mx-auto">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center w-full gap-4 py-16">
                        <svg
                          className="h-10 w-10 text-blue-500 dark:text-blue-300 animate-spin"
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
                          Scraping website and creating brand profile...
                        </p>
                        {result?.scrapedPagesCount && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Scraped {result.scrapedPagesCount} pages
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {error ? (
                          <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-red-700 dark:text-red-300">
                            {error}
                          </div>
                        ) : displayProfile ? (
                          <div className="space-y-6">
                            {/* Success Header */}
                            <div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 px-4 py-3">
                              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                Brand Profile Created Successfully!
                              </h2>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {result?.scrapedPagesCount
                                  ? `Analyzed ${result.scrapedPagesCount} pages from ${displayProfile.company?.domain || 'website'}`
                                  : `Brand profile for ${displayProfile.company?.name || 'your brand'}`}
                              </p>
                            </div>

                            {/* Company Section */}
                            <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/20 p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Company
                              </h3>
                              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    Name
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.company?.name || 'N/A'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    Domain
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.company?.domain || 'N/A'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    Product
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.company?.product || 'N/A'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    Category
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.company?.category || 'N/A'}
                                  </dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    One-liner
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.company?.one_liner || 'N/A'}
                                  </dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    Elevator Pitch
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.company?.elevator_pitch || 'N/A'}
                                  </dd>
                                </div>
                              </dl>
                            </div>

                            {/* Audience Section */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Audience
                              </h3>
                              <dl className="space-y-3 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    Primary ICP
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.audience?.icp_primary || 'N/A'}
                                  </dd>
                                </div>
                                {displayProfile.audience.icp_secondary && (
                                  <div>
                                    <dt className="font-medium text-gray-700 dark:text-gray-300">
                                      Secondary ICP
                                    </dt>
                                    <dd className="text-gray-800 dark:text-gray-100">
                                      {displayProfile.audience.icp_secondary}
                                    </dd>
                                  </div>
                                )}
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pains
                                  </dt>
                                  <dd>
                                    <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-100">
                                      {(displayProfile.audience?.pains || []).map((pain, idx) => (
                                        <li key={idx}>{pain}</li>
                                      ))}
                                    </ul>
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Desires
                                  </dt>
                                  <dd>
                                    <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-100">
                                      {(displayProfile.audience?.desires || []).map((desire, idx) => (
                                        <li key={idx}>{desire}</li>
                                      ))}
                                    </ul>
                                  </dd>
                                </div>
                              </dl>
                            </div>

                            {/* Positioning Section */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Positioning
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Value Props (Ranked)
                                  </dt>
                                  <dd>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-800 dark:text-gray-100">
                                      {(displayProfile.positioning?.value_props || [])
                                        .sort((a, b) => (a?.rank || 0) - (b?.rank || 0))
                                        .map((vp, idx) => (
                                          <li key={idx}>{vp?.text || ''}</li>
                                        ))}
                                    </ol>
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Differentiators
                                  </dt>
                                  <dd>
                                    <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-100">
                                      {(displayProfile.positioning?.differentiators || []).map(
                                        (diff, idx) => (
                                          <li key={idx}>{diff}</li>
                                        )
                                      )}
                                    </ul>
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300">
                                    Why Now Angle
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.positioning?.why_now_angle || 'N/A'}
                                  </dd>
                                </div>
                              </div>
                            </div>

                            {/* Voice & Tone Section */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Voice & Tone
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tone Sliders
                                  </dt>
                                  <dd className="space-y-2">
                                    {(() => {
                                      // Ensure tone_sliders is an object, not a string
                                      let toneSliders = displayProfile.voice_and_tone?.tone_sliders
                                      if (typeof toneSliders === 'string') {
                                        try {
                                          toneSliders = JSON.parse(toneSliders)
                                        } catch {
                                          toneSliders = {}
                                        }
                                      }
                                      if (!toneSliders || typeof toneSliders !== 'object' || Array.isArray(toneSliders)) {
                                        return <span className="text-sm text-gray-500 dark:text-gray-400">No tone sliders available</span>
                                      }
                                      return Object.entries(toneSliders).map(([key, value]) => {
                                        const numValue = typeof value === 'number' ? value : 0
                                        return (
                                          <div key={key} className="flex items-center gap-3">
                                            <span className="w-32 text-gray-600 dark:text-gray-400 capitalize">
                                              {key}:
                                            </span>
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                              <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${(numValue / 5) * 100}%` }}
                                              ></div>
                                            </div>
                                            <span className="w-8 text-gray-800 dark:text-gray-100">
                                              {numValue}/5
                                            </span>
                                          </div>
                                        )
                                      })
                                    })()}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Writing Style
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    Sentence length: {displayProfile.voice_and_tone?.writing_style_rules?.sentence_length || 'N/A'}
                                    <br />
                                    Punctuation: {displayProfile.voice_and_tone?.writing_style_rules?.punctuation || 'N/A'}
                                    <br />
                                    Emoji usage: {displayProfile.voice_and_tone?.writing_style_rules?.emoji_usage || 'N/A'}
                                  </dd>
                                </div>
                              </div>
                            </div>

                            {/* Messaging Assets Section */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Messaging Assets
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Primary CTAs
                                  </dt>
                                  <dd>
                                    <div className="flex flex-wrap gap-2">
                                      {(displayProfile.messaging_assets?.ctas?.primary || []).map(
                                        (cta, idx) => (
                                          <span
                                            key={idx}
                                            className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                                          >
                                            {cta}
                                          </span>
                                        )
                                      )}
                                      {(!displayProfile.messaging_assets?.ctas?.primary || displayProfile.messaging_assets.ctas.primary.length === 0) && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">No primary CTAs found</span>
                                      )}
                                    </div>
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Key Features
                                  </dt>
                                  <dd>
                                    <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-100">
                                      {(displayProfile.messaging_assets?.key_features || []).map(
                                        (feature, idx) => (
                                          <li key={idx}>{feature}</li>
                                        )
                                      )}
                                      {(!displayProfile.messaging_assets?.key_features || displayProfile.messaging_assets.key_features.length === 0) && (
                                        <li className="text-gray-500 dark:text-gray-400">No key features found</li>
                                      )}
                                    </ul>
                                  </dd>
                                </div>
                              </div>
                            </div>

                            {/* Keywords & Niche */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Keywords & Niche
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Niche
                                  </dt>
                                  <dd className="text-gray-800 dark:text-gray-100">
                                    {displayProfile.niche || 'N/A'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Keywords
                                  </dt>
                                  <dd>
                                    <div className="flex flex-wrap gap-2">
                                      {(displayProfile.keywords || []).map((keyword, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                                        >
                                          {keyword}
                                        </span>
                                      ))}
                                      {(!displayProfile.keywords || displayProfile.keywords.length === 0) && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">No keywords found</span>
                                      )}
                                    </div>
                                  </dd>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={handleReset}
                                className="btn border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                Add Another Brand
                              </button>
                              <a
                                href="/settings/websites"
                                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                              >
                                View My Brands
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-3 text-yellow-800 dark:text-yellow-200">
                            No brand profile available.
                          </div>
                        )}
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
                      Add your brand
                    </h1>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-8">
                        <label
                          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 text-center"
                          htmlFor="website-url"
                        >
                          Enter your website URL, <br />
                          our engine will create a complete brand profile for you
                        </label>
                        <input
                          id="website-url"
                          type="url"
                          placeholder="https://www.yuzuu.co"
                          value={url}
                          onChange={(event) => setUrl(event.target.value)}
                          className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="submit"
                          className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer"
                        >
                          Create my brand profile
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
