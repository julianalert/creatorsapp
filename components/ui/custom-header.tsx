'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'
import DropdownProfile from '@/components/dropdown-profile'
import ThemeToggle from '@/components/theme-toggle'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Toast02 from '@/components/toast-02'

export default function CustomHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [toastOpen, setToastOpen] = useState<boolean>(true)

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

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const authenticated = !!user
      setIsAuthenticated(authenticated)
      if (authenticated) {
        await fetchCredits()
      } else {
        setCredits(null)
      }
    }

    checkAuth()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      checkAuth()
    })

    // Listen for credit updates (when agents are run)
    const handleCreditUpdate = () => {
      fetchCredits()
    }
    window.addEventListener('agent:credits-updated', handleCreditUpdate)

    return () => {
      subscription?.unsubscribe()
      window.removeEventListener('agent:credits-updated', handleCreditUpdate)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700/60">
          {/* Header: Left side */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {credits !== null && (
                  <Toast02 
                    open={toastOpen} 
                    setOpen={setToastOpen} 
                    type="" 
                    className="min-w-0"
                    closeButton={
                      <Link href="/credits" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">
                        Buy credits
                      </Link>
                    }
                  >
                    {credits} credit{credits !== 1 ? 's' : ''} left
                  </Toast02>
                )}
                <Link
                  href="/agents/results"
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Previous runs
                </Link>
                <DropdownProfile align="right" credits={credits} />
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Sign up
                </Link>
                <Link
                  href="/signin"
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

