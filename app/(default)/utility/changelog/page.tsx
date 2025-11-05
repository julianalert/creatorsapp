export const metadata = {
  title: 'Roadmap - Mosaic',
  description: 'Page description',
}

import Image from 'next/image'
import PaginationClassic from '@/components/pagination-classic'
import User01 from '@/public/images/user-32-01.jpg'
import User02 from '@/public/images/user-32-02.jpg'
import User07 from '@/public/images/user-32-07.jpg'

export default function Roadmap() {
  return (
    <div className="relative bg-white dark:bg-gray-900 h-full">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center px-4 sm:px-6 py-8 border-b border-gray-200 dark:border-gray-700/60">

        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Changelog</h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">

          {/* Add entry button */}
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">Add Entry</button>

        </div>

      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="max-w-4xl">

          {/* Filters */}
          <div className="xl:pl-32 xl:-translate-x-16 mb-2">
            <ul className="flex flex-wrap -m-1">
              <li className="m-1">
                <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-transparent shadow-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 transition">View All</button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition">Announcements</button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition">Bug Fix</button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition">Product</button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition">Exciting News</button>
              </li>
            </ul>
          </div>

          {/* Posts */}
          <div className="xl:-translate-x-16">
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 xl:leading-8">December 15, 2024</div>
                </div>
                <div className="grow pb-6 border-b border-gray-200 dark:border-gray-700/60">
                  <header>
                    <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-3">Multi-Account Management Released 🎉</h2>
                    <div className="flex flex-nowrap items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        <a className="block mr-2 shrink-0" href="#0">
                          <Image className="rounded-full border-2 border-white dark:border-gray-800 box-content" src={User07} width={32} height={32} alt="User 04" />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Alex Thompson
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="text-xs inline-flex font-medium bg-green-500/20 text-green-700 rounded-full text-center px-2.5 py-1">Product</div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>We're excited to announce the launch of multi-account management! You can now connect and manage multiple social media accounts (Instagram, TikTok, YouTube) from a single dashboard.</p>
                    <p>This release includes seamless account switching, unified account overview, and the ability to manage all your social media accounts in one place.</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Connect multiple accounts across different platforms</li>
                      <li>Quick account switcher in the navigation bar</li>
                      <li>View all connected accounts in Settings → My accounts</li>
                      <li>Easy account removal with confirmation dialogs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 xl:leading-8">December 10, 2024</div>
                </div>
                <div className="grow pb-6 border-b border-gray-200 dark:border-gray-700/60">
                  <header>
                    <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-3">Enhanced Account Settings & Security 🔒</h2>
                    <div className="flex flex-nowrap items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        <a className="block mr-2 shrink-0" href="#0">
                          <Image className="rounded-full border-2 border-white dark:border-gray-800 box-content" src={User02} width={32} height={32} alt="User 04" />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Sarah Chen
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="text-xs inline-flex font-medium bg-blue-500/20 text-blue-700 rounded-full text-center px-2.5 py-1">Security</div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>We've completely redesigned the account settings section to provide better security and a more streamlined user experience.</p>
                    <p>New features include improved profile picture display, better account management, and enhanced security measures for your connected accounts.</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Streamlined General settings with email and password management</li>
                      <li>Secure account removal with confirmation dialogs</li>
                      <li>Improved profile picture rendering from connected accounts</li>
                      <li>Better error handling throughout the settings pages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 xl:leading-8">December 5, 2024</div>
                </div>
                <div className="grow pb-6 border-b border-gray-200 dark:border-gray-700/60">
                  <header>
                    <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-3">New Feedback System & Bug Fixes 🐛</h2>
                    <div className="flex flex-nowrap items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        <a className="block mr-2 shrink-0" href="#0">
                          <Image className="rounded-full border-2 border-white dark:border-gray-800 box-content" src={User01} width={32} height={32} alt="User 04" />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Marcus Johnson
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="text-xs inline-flex font-medium bg-red-500/20 text-red-700 rounded-full text-center px-2.5 py-1">Bug Fix</div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>We've introduced a new feedback system and fixed several bugs reported by our users.</p>
                    <p>You can now easily share your feedback and help us improve the platform. All feedback is securely stored and helps us prioritize future improvements.</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>New feedback form with rating system (1-5 scale)</li>
                      <li>Fixed account profile picture display issues</li>
                      <li>Improved sidebar navigation responsiveness</li>
                      <li>Enhanced FAQ section with better readability</li>
                      <li>Fixed logout functionality in sidebar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 xl:leading-8">November 20, 2024</div>
                </div>
                <div className="grow pb-6 border-b border-gray-200 dark:border-gray-700/60">
                  <header>
                    <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-3">Instagram Integration Launched! 🚀</h2>
                    <div className="flex flex-nowrap items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        <a className="block mr-2 shrink-0" href="#0">
                          <Image className="rounded-full border-2 border-white dark:border-gray-800 box-content" src={User02} width={32} height={32} alt="User 04" />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Emma Rodriguez
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="text-xs inline-flex font-medium bg-sky-500/20 text-sky-700 rounded-full text-center px-2.5 py-1">Exciting News</div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>We're thrilled to announce Instagram integration! You can now connect your Instagram account and manage it alongside your other social media accounts.</p>
                    <p>This integration allows you to view your Instagram profile information, account details, and manage your Instagram account from our unified dashboard.</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Seamless Instagram account connection</li>
                      <li>Display profile pictures and bios</li>
                      <li>Secure authentication with Instagram API</li>
                      <li>Account switching between platforms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Pagination */}
          <div className="xl:pl-32 xl:-translate-x-16 mt-6">
            <PaginationClassic />
          </div>

        </div>
      </div>
    </div>
  )
}
