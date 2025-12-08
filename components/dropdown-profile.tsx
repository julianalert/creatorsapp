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

export default function DropdownProfile({ align }: {
  align?: 'left' | 'right'
}) {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
      setLoading(false)
    }

    fetchUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email || null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

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
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">Account</div>
        </div>
        <MenuItems as="ul" className="focus:outline-hidden">
          <MenuItem as="li">
              <Link className="font-medium text-sm flex items-center py-1 px-3 text-violet-500 cursor-pointer" href="/settings/account">
                Settings
              </Link>
          </MenuItem>
          <MenuItem as="li">
              <Link className="font-medium text-sm flex items-center py-1 px-3 text-violet-500 cursor-pointer" href="/settings/websites">
                My brands
              </Link>
          </MenuItem>
          <MenuItem as="li">
              <Link className="font-medium text-sm flex items-center py-1 px-3 text-violet-500 cursor-pointer" href="/new">
                Add a brand
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
