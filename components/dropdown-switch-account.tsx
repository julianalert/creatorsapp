'use client'

import { useState, useEffect } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import { createClient } from '@/lib/supabase/client'

interface Account {
  id: string
  platform: string
  url: string | null
  profiledata: any
}

export default function DropdownSwitchAccount({ align }: {
  align?: 'left' | 'right'
}) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('account')
        .select('id, platform, url, profiledata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching accounts:', error)
        setLoading(false)
        return
      }

      const fetchedAccounts = data || []
      setAccounts(fetchedAccounts)
      
      // If no account is selected, select the first one
      if (fetchedAccounts.length > 0) {
        const savedAccountId = localStorage.getItem('selectedAccountId')
        const accountToSelect = savedAccountId 
          ? fetchedAccounts.find(acc => acc.id === savedAccountId) || fetchedAccounts[0]
          : fetchedAccounts[0]
        setSelectedAccount(accountToSelect)
        localStorage.setItem('selectedAccountId', accountToSelect.id)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account)
    localStorage.setItem('selectedAccountId', account.id)
    // Trigger a custom event so other components can react to account changes
    window.dispatchEvent(new CustomEvent('accountChanged', { detail: account }))
  }

  const getAccountDisplayName = (account: Account): string => {
    if (account.profiledata?.user?.username) {
      return `@${account.profiledata.user.username}`
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

  const getAccountAvatar = (account: Account): string | null => {
    const avatarUrl = account.profiledata?.user?.profile_pic_url || account.profiledata?.user?.profile_pic_url_hd || null
    if (avatarUrl) {
      // Use image proxy to bypass CORS issues
      return `/api/image-proxy?url=${encodeURIComponent(avatarUrl)}`
    }
    return null
  }

  if (loading || accounts.length === 0) {
    return null
  }

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group">
        <div className="flex items-center truncate">
          {selectedAccount && (
            <>
              {getAccountAvatar(selectedAccount) ? (
                <img 
                  src={getAccountAvatar(selectedAccount)!} 
                  alt={getAccountDisplayName(selectedAccount)}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-semibold">
                    {selectedAccount.platform.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="truncate text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
                {getAccountDisplayName(selectedAccount)}
              </span>
              <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
              </svg>
            </>
          )}
        </div>
      </MenuButton>
      <Transition
        as="div"
        className={`origin-top-left z-10 absolute top-full min-w-[14rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-4">Switch Account</div>
        <MenuItems as="ul" className="focus:outline-hidden max-h-64 overflow-y-auto">
          {accounts.map((account) => (
            <MenuItem key={account.id} as="li">
              {({ active }) => (
                <button
                  onClick={() => handleSelectAccount(account)}
                  className={`w-full flex items-center py-2 px-4 ${
                    active && 'bg-gray-50 dark:bg-gray-700/20'
                  } ${selectedAccount?.id === account.id ? 'bg-violet-50 dark:bg-violet-900/20' : ''}`}
                >
                  {getAccountAvatar(account) ? (
                    <img 
                      src={getAccountAvatar(account)!} 
                      alt={getAccountDisplayName(account)}
                      className="w-8 h-8 rounded-full mr-3 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-semibold">
                        {account.platform.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {getAccountDisplayName(account)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {account.platform}
                    </div>
                  </div>
                  {selectedAccount?.id === account.id && (
                    <svg className="w-4 h-4 fill-current text-violet-500" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  )
}

