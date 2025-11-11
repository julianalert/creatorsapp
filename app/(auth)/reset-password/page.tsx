'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthHeader from '../auth-header'
import AuthImage from '../auth-image'
import Model1 from '@/public/images/model1.jpg'
import { createClient } from '@/lib/supabase/client'
import { getRedirectUrl } from '@/lib/supabase/redirect-helpers'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/reset-password'),
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <main className="bg-white dark:bg-gray-900">

      <div className="relative md:flex">

        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">

            <AuthHeader />

            <div className="max-w-sm mx-auto w-full px-4 py-8">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">Reset your Password</h1>
              {/* Form */}
              <form onSubmit={handleResetPassword}>
                {error && (
                  <div className="mb-4 bg-red-500/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm">
                    Password reset email sent! Please check your inbox.
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address <span className="text-red-500">*</span></label>
                    <input 
                      id="email" 
                      className="form-input w-full" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading || success}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button 
                    type="submit"
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white whitespace-nowrap cursor-pointer"
                    disabled={loading || success}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
                <div className="mt-4 text-sm">
                  <Link className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="/signin">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </div>

          </div>
        </div>

        <AuthImage imageSrc={Model1} />

      </div>

    </main>
  )
}
