'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'
import DropdownProfile from '@/components/dropdown-profile'
import ThemeToggle from '@/components/theme-toggle'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CustomHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      checkAuth()
    })

    return () => {
      subscription?.unsubscribe()
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
                <Link
                  href="/new"
                  className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Add account
                </Link>
                <DropdownProfile align="right" />
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

