'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthHeader from '../auth-header'
import AuthImage from '../auth-image'
import { createClient } from '@/lib/supabase/client'
import Img2 from '@/public/images/yuzuuBg.png'
import { recordFailedAttempt, clearFailedAttempts, isAccountLocked, getRemainingLockoutTime } from '@/lib/utils/account-lockout'
import { getRedirectUrl } from '@/lib/supabase/redirect-helpers'
import { FcGoogle } from 'react-icons/fc'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Check for error from OAuth callback
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
      // Clean up URL
      router.replace('/signin')
    }
  }, [searchParams, router])

  // Check lockout status on mount and periodically
  useEffect(() => {
    const checkLockout = () => {
      if (isAccountLocked()) {
        const remaining = getRemainingLockoutTime()
        setLockoutTime(remaining)
        setError(`Account locked due to too many failed attempts. Please try again in ${Math.ceil(remaining / 60)} minutes.`)
      } else {
        setLockoutTime(null)
      }
    }

    checkLockout()
    const interval = setInterval(checkLockout, 1000) // Check every second

    return () => clearInterval(interval)
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check if account is locked
    if (isAccountLocked()) {
      const remaining = getRemainingLockoutTime()
      setError(`Account is locked. Please try again in ${Math.ceil(remaining / 60)} minutes.`)
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Record failed attempt
        const lockoutInfo = recordFailedAttempt()
        
        if (lockoutInfo.isLocked) {
          setError(`Too many failed attempts. Account locked for ${Math.ceil((lockoutInfo.lockoutUntil! - Date.now()) / 60000)} minutes.`)
          setLockoutTime(getRemainingLockoutTime())
        } else {
          setError(error.message + (lockoutInfo.remainingAttempts > 0 ? ` (${lockoutInfo.remainingAttempts} attempts remaining)` : ''))
        }
        setLoading(false)
        return
      }

      // Clear failed attempts on successful login
      clearFailedAttempts()
      router.push('/')
      router.refresh()
    } catch (err) {
      const lockoutInfo = recordFailedAttempt()
      setError('An unexpected error occurred' + (lockoutInfo.remainingAttempts > 0 ? ` (${lockoutInfo.remainingAttempts} attempts remaining)` : ''))
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/auth/callback?next=/'),
        },
      })

      if (error) {
        setError(error.message)
        setGoogleLoading(false)
      }
      // Note: If successful, the user will be redirected to Google, so we don't need to handle success here
    } catch (err) {
      setError('An unexpected error occurred')
      setGoogleLoading(false)
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
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Welcome back!</h1>
              <div className="text-sm mb-6">
                  Sign in to your account to continue
                </div>
              
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {googleLoading ? 'Connecting...' : 'Sign in with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn}>
                {error && (
                  <div className="mb-4 bg-red-500/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address</label>
                    <input 
                      id="email" 
                      className="form-input w-full" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                    <input 
                      id="password" 
                      className="form-input w-full" 
                      type="password" 
                      autoComplete="on" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="mr-1">
                    <Link className="text-sm underline hover:no-underline" href="/reset-password">Forgot Password?</Link>
                  </div>
                  <button 
                    type="submit"
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700/60">
                <div className="text-sm">
                  Don't you have an account? <Link className="font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400" href="/signup">Sign Up</Link>
                </div>
                
              </div>
            </div>

          </div>
        </div>

        <AuthImage imageSrc={Img2} />

      </div>

    </main>
  )
}
