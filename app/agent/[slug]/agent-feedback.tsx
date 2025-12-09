'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'

type AgentFeedbackProps = {
  agentId: string
}

export default function AgentFeedback({ agentId }: AgentFeedbackProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitSuccess(false)

    if (!isAuthenticated) {
      setError('Please sign in to submit feedback.')
      return
    }

    if (!feedbackText.trim()) {
      setError('Please enter your feedback.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/agents/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          feedbackText: feedbackText.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setFeedbackText('')
        setSubmitSuccess(true)
        // Auto-collapse after 2 seconds
        setTimeout(() => {
          setIsExpanded(false)
          setSubmitSuccess(false)
        }, 2000)
      } else {
        setError(data.error || 'Failed to submit feedback. Please try again.')
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div className="max-w-[128rem] mx-auto flex justify-end">
          <button
            onClick={() => setIsExpanded(true)}
            className="pointer-events-auto btn bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 cursor-pointer"
            aria-label="Open feedback form"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Share Feedback</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-[128rem] mx-auto flex justify-end">
        <div className="pointer-events-auto w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-2xl">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Share Your Feedback
            </h3>
            <button
              onClick={() => {
                setIsExpanded(false)
                setFeedbackText('')
                setError(null)
                setSubmitSuccess(false)
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              aria-label="Close feedback form"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {!isAuthenticated && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Please sign in to submit feedback.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {submitSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-xs text-green-800 dark:text-green-200">
                  Thank you for your feedback! 🙌
                </p>
              </div>
            )}

            <div>
              <label htmlFor="feedback-text" className="sr-only">
                Your feedback
              </label>
              <textarea
                id="feedback-text"
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about this agent... What worked well? What could be improved?"
                className="form-textarea w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                disabled={isSubmitting || !isAuthenticated}
                maxLength={5000}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {feedbackText.length}/5000
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false)
                  setFeedbackText('')
                  setError(null)
                  setSubmitSuccess(false)
                }}
                className="btn-sm px-3 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isAuthenticated || !feedbackText.trim()}
                className="btn-sm px-3 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

