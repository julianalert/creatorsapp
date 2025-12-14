'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ModalBasic from '@/components/modal-basic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Brand Profile Type (matching the one from new/page.tsx)
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

interface Brand {
  id: string
  domain: string
  name: string | null
  brand_profile: BrandProfile
  active: boolean
  created_at: string
  updated_at: string
}

export default function WebsitesPanel() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  useEffect(() => {
    const fetchBrands = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('brands')
          .select('id, domain, name, brand_profile, active, created_at, updated_at')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching brands:', error)
        } else {
          setBrands(data || [])
        }
      }
      setLoading(false)
    }
    fetchBrands()
  }, [])

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return

    setDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('brands')
      .update({ active: false })
      .eq('id', brandToDelete.id)

    if (error) {
      console.error('Error deleting brand:', error)
      alert('Failed to delete brand. Please try again.')
    } else {
      setBrands(brands.filter((brand) => brand.id !== brandToDelete.id))
      setDeleteModalOpen(false)
      setBrandToDelete(null)
      router.refresh()
    }
    setDeleting(false)
  }

  const handleViewBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setViewModalOpen(true)
  }

  const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleDateString()
    } catch {
      return value
    }
  }

  const displayProfile = selectedBrand?.brand_profile

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold">My brands</h2>
          <Link
            href="/new"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          >
            Add Brand
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading brands...</div>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">No brands added yet</div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Add your first brand to get started with personalized agent outputs.
            </div>
            <Link
              href="/new"
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            >
              Add Your First Brand
            </Link>
          </div>
        ) : (
          <section className="pb-6">
            <div className="grid grid-cols-12 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="col-span-full xl:col-span-6 2xl:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewBrand(brand)}
                >
                  {/* Card content */}
                  <div className="flex flex-col h-full p-5">
                    <div className="grow">
                      <header className="mb-4">
                        <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold mb-1">
                          {brand.name || brand.domain}
                        </h3>
                        <a
                          href={`https://${brand.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                        >
                          {brand.domain}
                        </a>
                      </header>
                      <dl className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        {brand.brand_profile?.company?.category && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Category</dt>
                            <dd>{brand.brand_profile.company.category}</dd>
                          </div>
                        )}
                        {brand.brand_profile?.niche && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Niche</dt>
                            <dd>{brand.brand_profile.niche}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="font-medium">Added on</dt>
                          <dd>{formatDateTime(brand.created_at)}</dd>
                        </div>
                      </dl>
                      {brand.brand_profile?.company?.one_liner && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                          {brand.brand_profile.company.one_liner}
                        </p>
                      )}
                    </div>
                    {/* Card footer */}
                    <footer className="mt-4 flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewBrand(brand)
                        }}
                        className="btn-sm bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(brand)
                        }}
                        className="btn-sm bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                      >
                        Remove
                      </button>
                    </footer>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Brand Details Modal */}
      <ModalBasic
        title={selectedBrand ? `${selectedBrand.name || selectedBrand.domain} - Brand Profile` : 'Brand Profile'}
        isOpen={viewModalOpen}
        setIsOpen={setViewModalOpen}
      >
        <div className="px-5 py-4 max-h-[80vh] overflow-y-auto">
          {displayProfile ? (
            <div className="space-y-6">
              {/* Company Section */}
              <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/20 p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Company</h3>
                <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Name</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.company?.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Domain</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.company?.domain || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Product</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.company?.product || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Category</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.company?.category || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-gray-700 dark:text-gray-300">One-liner</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.company?.one_liner || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Elevator Pitch</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.company?.elevator_pitch || 'N/A'}</dd>
                  </div>
                </dl>
              </div>

              {/* Audience Section */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Audience</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Primary ICP</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.audience?.icp_primary || 'N/A'}</dd>
                  </div>
                  {displayProfile.audience?.icp_secondary && (
                    <div>
                      <dt className="font-medium text-gray-700 dark:text-gray-300">Secondary ICP</dt>
                      <dd className="text-gray-800 dark:text-gray-100">{displayProfile.audience.icp_secondary}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Pains</dt>
                    <dd>
                      <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-100">
                        {(displayProfile.audience?.pains || []).map((pain, idx) => (
                          <li key={idx}>{pain}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Desires</dt>
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Positioning</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Value Props (Ranked)</dt>
                    <dd>
                      <ol className="list-decimal list-inside space-y-1 text-gray-800 dark:text-gray-100">
                        {(displayProfile.positioning?.value_props || [])
                          .sort((a, b) => (a?.rank || 0) - (b?.rank || 0))
                          .map((vp, idx) => (
                            <li key={idx}>{vp?.text || ''}</li>
                          ))}
                      </ol>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Differentiators</dt>
                    <dd>
                      <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-100">
                        {(displayProfile.positioning?.differentiators || []).map((diff, idx) => (
                          <li key={idx}>{diff}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Why Now Angle</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.positioning?.why_now_angle || 'N/A'}</dd>
                  </div>
                </div>
              </div>

              {/* Voice & Tone Section */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Voice & Tone</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tone Sliders</dt>
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
                              <span className="w-32 text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(numValue / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-gray-800 dark:text-gray-100">{numValue}/5</span>
                            </div>
                          )
                        })
                      })()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Writing Style</dt>
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Messaging Assets</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Primary CTAs</dt>
                    <dd>
                      <div className="flex flex-wrap gap-2">
                        {(displayProfile.messaging_assets?.ctas?.primary || []).map((cta, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                          >
                            {cta}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Key Features</dt>
                    <dd>
                      <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-100">
                        {(displayProfile.messaging_assets?.key_features || []).map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </div>
              </div>

              {/* Keywords & Niche */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Keywords & Niche</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300">Niche</dt>
                    <dd className="text-gray-800 dark:text-gray-100">{displayProfile.niche || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords</dt>
                    <dd>
                      <div className="flex flex-wrap gap-2">
                        {(displayProfile.keywords || []).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">No brand profile data available.</div>
          )}
        </div>
      </ModalBasic>

      {/* Delete Confirmation Modal */}
      <ModalBasic
        title="Remove Brand"
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
      >
        <div className="px-5 py-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to remove this brand? This action cannot be undone.
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setDeleteModalOpen(false)
                setBrandToDelete(null)
              }}
              className="btn dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="btn bg-red-500 hover:bg-red-600 text-white"
              disabled={deleting}
            >
              {deleting ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </ModalBasic>
    </div>
  )
}
