'use client'

import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import { useAppProvider } from '@/app/app-provider'

interface Website {
  id: string
  url: string
}

export default function DropdownSwitchAccount({ align }: {
  align?: 'left' | 'right'
}) {
  const { websites, selectedWebsite, setSelectedWebsite } = useAppProvider()

  const handleSelectWebsite = (website: Website) => {
    setSelectedWebsite(website)
    localStorage.setItem('selectedWebsiteId', website.id)
    // Trigger a custom event so other components can react to website changes
    window.dispatchEvent(new CustomEvent('websiteChanged', { detail: website }))
  }

  const getWebsiteDisplayName = (website: Website): string => {
    try {
      const parsedUrl = new URL(website.url)
      return parsedUrl.hostname
    } catch {
      return website.url
    }
  }

  const getWebsiteInitial = (website: Website): string => {
    const display = getWebsiteDisplayName(website)
    return display.charAt(0).toUpperCase()
  }

  if (websites.length === 0) {
    return null
  }

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group cursor-pointer">
        <div className="flex items-center truncate">
          {selectedWebsite && (
            <>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                <span className="text-white text-xs font-semibold">
                  {getWebsiteInitial(selectedWebsite)}
                </span>
              </div>
              <span className="truncate text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
                {getWebsiteDisplayName(selectedWebsite)}
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
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-4">Switch Website</div>
        <MenuItems as="ul" className="focus:outline-hidden max-h-64 overflow-y-auto">
          {websites.map((website) => (
            <MenuItem key={website.id} as="li">
              {({ active }) => (
                <button
                  onClick={() => handleSelectWebsite(website)}
                  className={`w-full flex items-center py-2 px-4 cursor-pointer ${
                    active && 'bg-gray-50 dark:bg-gray-700/20'
                  } ${selectedWebsite?.id === website.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-semibold">
                      {getWebsiteInitial(website)}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {getWebsiteDisplayName(website)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      {website.url}
                    </div>
                  </div>
                  {selectedWebsite?.id === website.id && (
                    <svg className="w-4 h-4 fill-current text-blue-500" viewBox="0 0 12 12">
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

