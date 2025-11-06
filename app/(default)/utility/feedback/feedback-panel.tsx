'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function FeedbackPanel() {
  const router = useRouter()
  const [rating, setRating] = useState<number | null>(3)
  const [feedbackText, setFeedbackText] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRatingClick = (value: number) => {
    setRating(value)
    setError(null)
  }

  const handleCancel = () => {
    setRating(3)
    setFeedbackText('')
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to submit feedback')
        setSubmitting(false)
        return
      }

      // Server-side validation: ensure feedback text doesn't exceed max length
      const sanitizedFeedbackText = feedbackText.trim().slice(0, 5000) || null

      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          rating: rating,
          feedback_text: sanitizedFeedbackText,
        })

      if (insertError) {
        console.error('Error submitting feedback:', insertError)
        setError('Failed to submit feedback. Please try again.')
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setSubmitting(false)
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setRating(3)
        setFeedbackText('')
        setSuccess(false)
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-4">Give Feedback</h2>
          <div className="text-sm">Our product depends on customer feedback to improve the overall experience!</div>
        </div>

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-sm text-green-800 dark:text-green-200">Thank you for your feedback! It has been submitted successfully.</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
          </div>
        )}

        {/* Rate */}
        <section>
          <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-6">How likely would you recommend us to a friend or colleague?</h3>
          <div className="w-full max-w-xl">
            <div className="relative">
              <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200 dark:bg-gray-700/60" aria-hidden="true"></div>
              <ul className="relative flex justify-between w-full">
                {[1, 2, 3, 4, 5].map((value) => (
                  <li key={value} className="flex">
                    <button
                      onClick={() => handleRatingClick(value)}
                      className={`w-3 h-3 rounded-full border-2 transition-all cursor-pointer ${
                        rating === value
                          ? 'bg-violet-500 border-violet-500'
                          : 'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 hover:border-violet-400 dark:hover:border-violet-400'
                      }`}
                      aria-label={`Rating ${value}`}
                    >
                      <span className="sr-only">{value}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full flex justify-between text-sm text-gray-500 dark:text-gray-400 italic mt-3">
              <div>Not at all</div>
              <div>Extremely likely</div>
            </div>
          </div>
        </section>

        {/* Tell us in words */}
        <section>
          <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-5">Tell us in words</h3>
          {/* Form */}
          <label className="sr-only" htmlFor="feedback">Leave a feedback</label>
          <textarea
            id="feedback"
            className="form-textarea w-full focus:border-gray-300"
            rows={4}
            placeholder="I really enjoy…"
            value={feedbackText}
            onChange={(e) => {
              // Limit input to 5000 characters
              const value = e.target.value
              if (value.length <= 5000) {
                setFeedbackText(value)
              }
            }}
            maxLength={5000}
          />
          {feedbackText.length > 4500 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {feedbackText.length}/5000 characters
            </div>
          )}
        </section>
      </div>

      {/* Panel footer */}
      <footer>
        <div className="flex flex-col px-6 py-5 border-t border-gray-200 dark:border-gray-700/60">
          <div className="flex self-end">
            <button
              onClick={handleSubmit}
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white cursor-pointer"
              disabled={submitting || success || !rating}
            >
              {submitting ? 'Submitting...' : success ? 'Submitted!' : 'Send feedback'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
