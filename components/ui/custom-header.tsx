'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'
import DropdownHelp from '@/components/dropdown-help'
import DropdownSwitchBrand from '@/components/dropdown-switch-brand'
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
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 border-b border-gray-200 dark:border-gray-700/60">
          {/* Header: Left side */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Logo />
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 min-w-0">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {credits !== null && (
                  <>
                    {/* Desktop credits toast */}
                    <div className="hidden sm:block">
                  <Toast02 
                    open={toastOpen} 
                    setOpen={setToastOpen} 
                    type="" 
                    className="min-w-0"
                    closeButton={
                          <Link href="/credits" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap">
                        Buy credits
                      </Link>
                    }
                  >
                        <span className="whitespace-nowrap">{credits} credit{credits !== 1 ? 's' : ''} left</span>
                  </Toast02>
                    </div>
                    {/* Mobile compact credits indicator */}
                    <Link
                      href="/credits"
                      className="sm:hidden flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 whitespace-nowrap"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      {credits}
                    </Link>
                  </>
                )}
                <Link
                  href="/agents/results"
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Previous runs</span>
                  <span className="sm:hidden">Runs</span>
                </Link>
                <DropdownHelp align="right" credits={credits} />
                <DropdownSwitchBrand align="right" />
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                >
                  Sign up
                </Link>
                <Link
                  href="/signin"
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
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

