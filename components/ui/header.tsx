'use client'

import { useState } from 'react'
import Link from 'next/link'

import { useAppProvider } from '@/app/app-provider'
import ThemeToggle from '@/components/theme-toggle'
import DropdownSwitchAccount from '@/components/dropdown-switch-account'

function SearchCreatorsModal({
  open,
  onClose,
  selectedWebsiteLabel,
}: {
  open: boolean
  onClose: () => void
  selectedWebsiteLabel: string | null
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Creator search</h3>
        </div>
        <div className="px-6 py-5 space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <p>This feature is coming soon.</p>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
            <p className="font-medium text-gray-700 dark:text-gray-200">Current website</p>
            <p className="truncate text-gray-600 dark:text-gray-300">
              {selectedWebsiteLabel ?? 'No website selected'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Header({
  variant = 'default',
}: {
  variant?: 'default' | 'v2' | 'v3'
}) {
  const { sidebarOpen, setSidebarOpen, selectedWebsite } = useAppProvider()
  const [searchOpen, setSearchOpen] = useState(false)

  const selectedWebsiteLabel = (() => {
    if (!selectedWebsite) return null
    try {
      const parsed = new URL(selectedWebsite.url)
      return parsed.hostname
    } catch {
      return selectedWebsite.url
    }
  })()

  return (
    <header
      className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${
        variant === 'v2' || variant === 'v3'
          ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10'
          : 'max-lg:shadow-sm lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'
      } ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${
        variant === 'v3' ? 'dark:before:bg-gray-900' : ''
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between h-16 ${
            variant === 'v2' || variant === 'v3'
              ? ''
              : 'lg:border-b border-gray-200 dark:border-gray-700/60'
          }`}
        >
          {/* Header: Left side */}
          <div className="flex items-center space-x-3">
            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => {
                setSidebarOpen(!sidebarOpen)
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>

            {/* Switch Account */}
            <DropdownSwitchAccount align="left" />
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true)
              }}
              className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
            >
              Search creators
            </button>
            {/* Add Account button */}
            <Link
              href="/new"
              className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer"
            >
              Add account
            </Link>
          </div>
        </div>
      </div>

      <SearchCreatorsModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        selectedWebsiteLabel={selectedWebsiteLabel}
      />
    </header>
  )
}
