'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CustomHeader from '@/components/ui/custom-header'

export default function RequestAgentPage() {
  const router = useRouter()
  const [requestText, setRequestText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/agent-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setSuccess(true)
      setRequestText('')
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Custom Header */}
      <CustomHeader />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[128rem] mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">
            Request an Agent
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tell us about the agent you'd like us to build for you. Describe its purpose, functionality, and how it would help you.
          </p>
        </div>

        {/* Request Form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm p-6 max-w-3xl">
          {success && (
            <div className="mb-6 bg-green-500/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              Your agent request has been submitted successfully! We'll review it and get back to you soon.
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="request-text"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Agent Request Details
              </label>
              <textarea
                id="request-text"
                rows={12}
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Describe the agent you'd like us to build. Include details such as:
- What should the agent do?
- What problems does it solve?
- What inputs does it need?
- What outputs should it provide?
- Any specific features or requirements?"
                className="form-textarea w-full px-3 py-2 border border-gray-200 dark:border-gray-700/60 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                required
                minLength={10}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {requestText.length} characters (minimum 10)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || requestText.trim().length < 10}
                className={`btn bg-violet-500 text-white hover:bg-violet-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 rounded-xl p-6 max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            What happens next?
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>We review your request and assess feasibility</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>If approved, we'll add it to our development queue</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You'll be notified when your requested agent is available</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Complex agents may take longer to develop, but we'll keep you updated</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

