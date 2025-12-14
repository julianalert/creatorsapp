'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthHeader from '../auth-header'
import AuthImage from '../auth-image'
import { createClient } from '@/lib/supabase/client'
import Model1 from '@/public/images/yuzuuBg2.png'
import { getRedirectUrl } from '@/lib/supabase/redirect-helpers'
import { validatePassword, getPasswordStrengthColor } from '@/lib/utils/password-validation'
import { FcGoogle } from 'react-icons/fc'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<ReturnType<typeof validatePassword> | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    if (newPassword.length > 0) {
      setPasswordValidation(validatePassword(newPassword))
    } else {
      setPasswordValidation(null)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate password before submission
    const validation = validatePassword(password)
    if (!validation.isValid) {
      setError(validation.errors[0] || 'Password does not meet requirements')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl('/auth/callback?next=/new'),
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Add contact to Loops.so and trigger signedUp event
      // Do this asynchronously so it doesn't block the signup flow
      if (data.user) {
        fetch('/api/loops/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.user.email || email,
            userId: data.user.id,
          }),
        }).catch((err) => {
          // Silently fail - don't interrupt user flow if Loops.so is down
          console.error('Failed to add contact to Loops.so:', err)
        })
      } else {
        // User might not be created yet if email confirmation is required
        // Still try to add the email to Loops
        fetch('/api/loops/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        }).catch((err) => {
          console.error('Failed to add contact to Loops.so:', err)
        })
      }

      setSuccess(true)
      setLoading(false)
      
      // Redirect to /new page after successful signup so users can add their brand
      // For email confirmation, you might want to show a message instead
      setTimeout(() => {
        router.push('/new')
        router.refresh()
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setGoogleLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/auth/callback?next=/new'),
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
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Create your Account</h1>
              <div className="text-sm mb-6">
                  Sign up to put your marketing on steroids.
                </div>
              
              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {googleLoading ? 'Connecting...' : 'Sign up with Google'}
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
              <form onSubmit={handleSignUp}>
                {error && (
                  <div className="mb-4 bg-red-500/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm">
                    Account created successfully! Redirecting...
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
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">Password <span className="text-red-500">*</span></label>
                    <input 
                      id="password" 
                      className="form-input w-full" 
                      type="password" 
                      autoComplete="on" 
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                    />
                    {passwordValidation && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                          <span className={getPasswordStrengthColor(passwordValidation.strength)}>
                            {passwordValidation.strength.toUpperCase()}
                          </span>
                        </div>
                        {passwordValidation.errors.length > 0 && (
                          <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                            {passwordValidation.errors.map((err, idx) => (
                              <li key={idx}>• {err}</li>
                            ))}
                          </ul>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Requirements: 8+ characters, uppercase, lowercase, number, special character
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="mr-1">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="form-checkbox cursor-pointer" disabled={loading} defaultChecked />
                      <span className="text-sm ml-2">I accept terms & conditions.</span>
                    </label>
                  </div>
                  <button 
                    type="submit"
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3 whitespace-nowrap cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700/60">
                <div className="text-sm">
                  Have an account? <Link className="font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400" href="/signin">Sign In</Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        <AuthImage imageSrc={Model1} />

      </div>

    </main>
  )
}
