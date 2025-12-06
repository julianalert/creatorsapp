'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingHeader from '../onboarding-header'
import OnboardingProgress from '../onboarding-progress'
import { createClient } from '@/lib/supabase/client'

export default function Onboarding01() {
  const router = useRouter()
  const [profileUrl, setProfileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract Instagram handle from URL
  const extractInstagramHandle = (url: string): string | null => {
    try {
      // Remove trailing slash and extract handle
      const cleanUrl = url.trim().replace(/\/$/, '')
      // Match patterns like: instagram.com/username, www.instagram.com/username, @username
      const match = cleanUrl.match(/(?:instagram\.com\/|@)([a-zA-Z0-9._]+)/i)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setError('You must be logged in to continue')
        setLoading(false)
        return
      }

      // Extract Instagram handle from URL
      const handle = extractInstagramHandle(profileUrl)
      if (!handle) {
        setError('Invalid Instagram URL. Please enter a valid Instagram profile URL.')
        setLoading(false)
        return
      }

      // Call our API route to get Instagram profile data
      const profileResponse = await fetch(`/api/instagram/profile?handle=${encodeURIComponent(handle)}`)

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}))
        setError(errorData.error || `Failed to fetch Instagram profile data: ${profileResponse.statusText}`)
        setLoading(false)
        return
      }

      const profileData = await profileResponse.json()

      if (!profileData.success || !profileData.data) {
        setError('Failed to retrieve Instagram profile data')
        setLoading(false)
        return
      }

      // Call our API route to get Instagram posts data
      const postsResponse = await fetch(`/api/instagram/posts?handle=${encodeURIComponent(handle)}`)

      if (!postsResponse.ok) {
        const errorData = await postsResponse.json().catch(() => ({}))
        setError(errorData.error || `Failed to fetch Instagram posts data: ${postsResponse.statusText}`)
        setLoading(false)
        return
      }

      const postsData = await postsResponse.json()

      if (!postsData.success || !postsData.data) {
        setError('Failed to retrieve Instagram posts data')
        setLoading(false)
        return
      }

      // Insert account record with profile data and posts data
      const { error: insertError } = await supabase
        .from('account')
        .insert({
          user_id: user.id,
          platform: 'instagram',
          url: profileUrl,
          profiledata: profileData.data,
          postsdata: postsData.data,
        })

      if (insertError) {
        setError(insertError.message || 'Failed to save account information')
        setLoading(false)
        return
      }

      // Redirect to home on success
      router.push('/')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setLoading(false)
    }
  }

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
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-4 bg-red-500/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
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
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <button 
                      type="submit"
                      className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? 'Fetching Instagram data...' : 'Go to my dashboard'}
                    </button>
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
