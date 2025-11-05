'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ModalBasic from '@/components/modal-basic'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  url: string | null
  profiledata: {
    user?: {
      username?: string
      full_name?: string
      profile_pic_url?: string
      profile_pic_url_hd?: string
      biography?: string
      [key: string]: any
    }
    [key: string]: any
  } | null
  created_at: string
}

export default function AppsPanel() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('account')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching accounts:', error)
        } else {
          setAccounts(data || [])
        }
      }
      setLoading(false)
    }
    fetchAccounts()
  }, [])

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return

    setDeleting(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('account')
      .delete()
      .eq('id', accountToDelete.id)

    if (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    } else {
      // Remove the account from the list
      setAccounts(accounts.filter(acc => acc.id !== accountToDelete.id))
      setDeleteModalOpen(false)
      setAccountToDelete(null)
      router.refresh()
    }
    setDeleting(false)
  }

  const getAccountName = (account: Account): string => {
    if (account.profiledata?.user?.username) {
      return `@${account.profiledata.user.username}`
    }
    if (account.profiledata?.user?.full_name) {
      return account.profiledata.user.full_name
    }
    if (account.url) {
      try {
        const url = new URL(account.url)
        const pathParts = url.pathname.split('/').filter(Boolean)
        return pathParts[pathParts.length - 1] || account.platform
      } catch {
        return account.platform
      }
    }
    return account.platform
  }

  const getAccountBio = (account: Account): string => {
    if (account.profiledata?.user?.biography) {
      return account.profiledata.user.biography
    }
    return 'No bio available'
  }

  const getAccountProfilePicture = (account: Account): string => {
    const avatarUrl = account.profiledata?.user?.profile_pic_url_hd || account.profiledata?.user?.profile_pic_url
    if (avatarUrl) {
      // Use image proxy to bypass CORS issues (same as dropdown)
      return `/api/image-proxy?url=${encodeURIComponent(avatarUrl)}`
    }
    // Default placeholder
    return '/images/user-avatar-80.png'
  }


  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6">
        <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-5">My accounts</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading accounts...</div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">No accounts found</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">Add an account to get started</div>
          </div>
        ) : (
          <section className="pb-6">
            <div className="grid grid-cols-12 gap-6">
              {accounts.map((account) => {
                const profilePicture = getAccountProfilePicture(account)
                
                return (
                  <div
                    key={account.id}
                    className="col-span-full xl:col-span-6 2xl:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm rounded-lg"
                  >
                    {/* Card content */}
                    <div className="flex flex-col h-full p-5">
                      <div className="grow">
                        <header className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full shrink-0 mr-3 overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <img
                              className="w-10 h-10 rounded-full object-cover"
                              src={profilePicture}
                              alt={getAccountName(account)}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = '/images/user-avatar-80.png'
                              }}
                            />
                          </div>
                          <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">
                            {getAccountName(account)}
                          </h3>
                        </header>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getAccountBio(account)}
                        </div>
                      </div>
                      {/* Card footer */}
                      <footer className="mt-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteClick(account)}
                            className="btn-sm bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </footer>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ModalBasic
        title="Remove Account"
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
      >
        <div className="px-5 py-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to remove this account? This action cannot be undone.
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setDeleteModalOpen(false)
                setAccountToDelete(null)
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
