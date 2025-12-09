'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ModalBasic from '@/components/modal-basic'
import { useRouter } from 'next/navigation'

type WebsiteStatus = 'idle' | 'processing' | 'processed' | 'failed' | string | null

interface Website {
  id: string
  url: string
  status: WebsiteStatus
  last_scraped_at: string | null
  created_at?: string | null
}

export default function WebsitesPanel() {
  const router = useRouter()
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [websiteToDelete, setWebsiteToDelete] = useState<Website | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchWebsites = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('website')
          .select('id, url, status, last_scraped_at, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching websites:', error)
        } else {
          setWebsites(data || [])
        }
      }
      setLoading(false)
    }
    fetchWebsites()
  }, [])

  const handleDeleteClick = (website: Website) => {
    setWebsiteToDelete(website)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!websiteToDelete) return

    setDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('website')
      .delete()
      .eq('id', websiteToDelete.id)

    if (error) {
      console.error('Error deleting website:', error)
      alert('Failed to delete website. Please try again.')
    } else {
      setWebsites(websites.filter((site) => site.id !== websiteToDelete.id))
      setDeleteModalOpen(false)
      setWebsiteToDelete(null)
      router.refresh()
    }
    setDeleting(false)
  }

  const getWebsiteDisplayName = (website: Website): string => {
    try {
      const hostname = new URL(website.url).hostname
      return hostname
    } catch {
      return website.url
    }
  }

  const getWebsiteStatusLabel = (status: WebsiteStatus): string => {
    if (!status) return 'Unknown'
    const normalized = status.toLowerCase()
    switch (normalized) {
      case 'processed':
        return 'Ready'
      case 'processing':
        return 'Processing'
      case 'failed':
        return 'Failed'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6">
        <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-5">My websites</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading websites...</div>
          </div>
        ) : websites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">No websites connected</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">Import a website from the Matches page to get started.</div>
          </div>
        ) : (
          <section className="pb-6">
            <div className="grid grid-cols-12 gap-6">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="col-span-full xl:col-span-6 2xl:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm rounded-lg"
                >
                  {/* Card content */}
                  <div className="flex flex-col h-full p-5">
                    <div className="grow">
                      <header className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">
                            {getWebsiteDisplayName(website)}
                          </h3>
                          <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                          >
                            {website.url}
                          </a>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          website.status === 'processed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : website.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300'
                        }`}>
                          {getWebsiteStatusLabel(website.status)}
                        </span>
                      </header>
                      <dl className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <div className="flex justify-between">
                          <dt className="font-medium">Last scraped</dt>
                          <dd>{formatDateTime(website.last_scraped_at)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Added on</dt>
                          <dd>{formatDateTime(website.created_at)}</dd>
                        </div>
                      </dl>
                    </div>
                    {/* Card footer */}
                    <footer className="mt-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteClick(website)}
                          className="btn-sm bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </footer>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ModalBasic
        title="Remove Website"
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
      >
        <div className="px-5 py-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to remove this website? This action cannot be undone.
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setDeleteModalOpen(false)
                setWebsiteToDelete(null)
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
