'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import { createClient } from '@/lib/supabase/client'

function getInitials(email: string | null | undefined): string {
  if (!email) return 'U'
  
  // Extract the part before @
  const localPart = email.split('@')[0]
  
  // If it's a single word, use first two characters
  if (!localPart.includes('.')) {
    return localPart.substring(0, 2).toUpperCase()
  }
  
  // If it has dots, use first letter of first and last part
  const parts = localPart.split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  
  // Fallback: first two characters
  return localPart.substring(0, 2).toUpperCase()
}

function Avatar({ email, size = 32 }: { email: string | null | undefined; size?: number }) {
  const initials = getInitials(email)
  const sizeClass = size === 32 ? 'w-8 h-8' : size === 40 ? 'w-10 h-10' : 'w-8 h-8'
  const textSizeClass = size === 32 ? 'text-sm' : size === 40 ? 'text-base' : 'text-sm'
  
  return (
    <div className={`${sizeClass} rounded-full bg-violet-500 flex items-center justify-center text-white font-semibold ${textSizeClass}`}>
      {initials}
    </div>
  )
}

export default function DropdownProfile({ align, credits: creditsProp }: {
  align?: 'left' | 'right'
  credits?: number | null
}) {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(creditsProp ?? null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/user/credits')
      const data = await response.json()
      if (data.success && data.data) {
        setCredits(data.data.credits)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  // Update credits when prop changes
  useEffect(() => {
    if (creditsProp !== undefined) {
      setCredits(creditsProp)
    }
  }, [creditsProp])

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
      // Only fetch credits if not provided as prop
      if (user && creditsProp === undefined) {
        await fetchCredits()
      }
      setLoading(false)
    }

    fetchUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email || null)
      if (session?.user) {
        // Only fetch credits if not provided as prop
        if (creditsProp === undefined) {
          fetchCredits()
        }
      } else {
        setCredits(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [creditsProp])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/signin')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    )
  }

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group cursor-pointer">
        <Avatar email={userEmail} size={32} />
      </MenuButton>
      <Transition
        as="div"
        className={`origin-top-right z-10 absolute top-full min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'
          }`}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
          <div className="font-medium text-gray-800 dark:text-gray-100 truncate">{userEmail || 'User'}</div>
          {credits !== null && (
            <div className="flex items-center space-x-1 mt-1.5">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {credits} credit{credits !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <MenuItems as="ul" className="focus:outline-hidden">
          <MenuItem as="li">
              <Link className="font-medium text-sm flex items-center py-1 px-3 text-violet-500 cursor-pointer" href="/settings/account">
                Settings
              </Link>
          </MenuItem>
          <MenuItem as="li">
            <button 
              onClick={handleSignOut}
              className="font-medium text-sm flex items-center py-1 px-3 text-violet-500 w-full text-left cursor-pointer"
            >
              Sign Out
            </button>
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  )
}
