'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CustomHeader from '@/components/ui/custom-header'
import Link from 'next/link'

function CreditsSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams?.get('session_id')
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    // Fetch updated credits and add credits if webhook hasn't processed yet
    const processPayment = async () => {
      try {
        // First, try to manually add credits (in case webhook hasn't processed)
        if (sessionId) {
          try {
            const addResponse = await fetch('/api/stripe/manual-credit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId }),
            })
            
            const addData = await addResponse.json()
            if (addData.success) {
              console.log('Credits added manually:', addData)
            }
          } catch (error) {
            // If manual add fails, webhook might have already processed it
            console.log('Manual credit add failed (may already be processed):', error)
          }
        }

        // Fetch updated credits
        const response = await fetch('/api/user/credits')
        const data = await response.json()
        if (data.success && data.data) {
          setCredits(data.data.credits)
          // Trigger credit update event for header
          window.dispatchEvent(new Event('agent:credits-updated'))
        }
      } catch (error) {
        console.error('Error processing payment:', error)
      }
    }

    processPayment()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Custom Header */}
      <CustomHeader />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[128rem] mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Your credits have been added to your account.
          </p>

          {/* Credits Balance */}
          {credits !== null && (
            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your new credit balance:</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {credits} {credits === 1 ? 'credit' : 'credits'}
              </p>
            </div>
          )}

          {/* Session ID (for debugging) */}
          {sessionId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-8">
              Session ID: {sessionId}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            >
              Browse AI Agents
            </Link>
            <Link
              href="/credits"
              className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
            >
              Buy More Credits
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CreditsSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <CustomHeader />
        <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[128rem] mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Loading...</h1>
          </div>
        </main>
      </div>
    }>
      <CreditsSuccessContent />
    </Suspense>
  )
}

