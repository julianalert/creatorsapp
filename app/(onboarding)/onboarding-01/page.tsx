'use client'

import { useState } from 'react'
import Link from 'next/link'
import OnboardingHeader from '../onboarding-header'
import OnboardingProgress from '../onboarding-progress'

export default function Onboarding01() {
  const [profileUrl, setProfileUrl] = useState('')
  return (
    <main className="bg-white dark:bg-gray-900">

      <div className="relative flex justify-center">

        {/* Content */}
        <div className="w-full max-w-2xl">

          <div className="min-h-[100dvh] h-full flex flex-col">

            <div className="w-full px-4 py-8">
              <OnboardingHeader />
            </div>

            <div className="flex-1 flex flex-col items-center px-4 py-8 w-full">
              <div className="max-w-md w-full mx-auto mb-8">
                <OnboardingProgress step={1} />
              </div>
              <div className="max-w-md w-full mx-auto">

              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6 text-center">You're one step away 👀</h1>
                {/* Form */}
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="instagram-url">
                      Enter your Instagram Profile URL
                    </label>
                    <input 
                      id="instagram-url"
                      type="url"
                      placeholder="https://instagram.com/yourusername"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      className="form-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <Link 
                      className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white" 
                      href="/onboarding-02"
                    >
                      Next Step -&gt;
                    </Link>
                  </div>
                </form>

              </div>
            </div>

          </div>

        </div>

      </div>

    </main>
  )
}
