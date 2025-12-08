'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CustomHeader from '@/components/ui/custom-header'

export default function CreditsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const canceled = searchParams?.get('canceled')

  const handleBuyCredits = async (packageId: string) => {
    setLoading(packageId)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error)
      alert(error.message || 'Failed to start checkout. Please try again.')
      setLoading(null)
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
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Pay as you go</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">No subscription or monthly fees. You buy the credits you need, when you need them.</p>
          {canceled && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Payment was canceled. You can try again anytime.</p>
            </div>
          )}
        </div>

        {/* Plans Section */}
        <section className="mb-12">
          

          {/* Pricing */}
          <div className="grid grid-cols-12 gap-6">
            {/* Basic Plan */}
            <div className="relative col-span-full xl:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm rounded-b-lg">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500" aria-hidden="true"></div>
              <div className="px-5 pt-5 pb-6 border-b border-gray-200 dark:border-gray-700/60">
                <header className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full shrink-0 bg-green-500 mr-3">
                    <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 17a.833.833 0 01-.833-.833 3.333 3.333 0 00-3.334-3.334.833.833 0 110-1.666 3.333 3.333 0 003.334-3.334.833.833 0 111.666 0 3.333 3.333 0 003.334 3.334.833.833 0 110 1.666 3.333 3.333 0 00-3.334 3.334c0 .46-.373.833-.833.833z" />
                    </svg>
                  </div>
                  <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">100 credits</h3>
                </header>
                <div className="text-sm mb-2">One-time payment.</div>
                {/* Price */}
                <div className="text-gray-800 dark:text-gray-100 font-bold mb-4">
                  <span className="text-2xl">$</span><span className="text-3xl">17</span>
                </div>
                {/* CTA */}
                <button 
                  onClick={() => handleBuyCredits('100')}
                  disabled={loading === '100'}
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === '100' ? 'Loading...' : 'Buy 100 Credits'}
                </button>
              </div>
              <div className="px-5 pt-4 pb-5">
                <div className="text-xs text-gray-800 dark:text-gray-100 font-semibold uppercase mb-4">What's included</div>
                {/* List */}
                <ul>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">Instant access to all ai agents</div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">No monthly fee</div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">No subscription required</div>
                  </li>
                  
                </ul>
              </div>
            </div>

            {/* Standard Plan */}
            <div className="relative col-span-full xl:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm rounded-b-lg">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500" aria-hidden="true"></div>
              <div className="px-5 pt-5 pb-6 border-b border-gray-200 dark:border-gray-700/60">
                <header className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full shrink-0 bg-sky-500 mr-3">
                    <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 17a.833.833 0 01-.833-.833 3.333 3.333 0 00-3.334-3.334.833.833 0 110-1.666 3.333 3.333 0 003.334-3.334.833.833 0 111.666 0 3.333 3.333 0 003.334 3.334.833.833 0 110 1.666 3.333 3.333 0 00-3.334 3.334c0 .46-.373.833-.833.833z" />
                    </svg>
                  </div>
                  <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">500 credits</h3>
                </header>
                <div className="text-sm mb-2">One-time payment.</div>
                {/* Price */}
                <div className="text-gray-800 dark:text-gray-100 font-bold mb-4">
                  <span className="text-2xl">$</span><span className="text-3xl">85</span>
                </div>
                {/* CTA */}
                <button 
                  onClick={() => handleBuyCredits('500')}
                  disabled={loading === '500'}
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === '500' ? 'Loading...' : 'Buy 500 Credits'}
                </button>
              </div>
              <div className="px-5 pt-4 pb-5">
                <div className="text-xs text-gray-800 dark:text-gray-100 font-semibold uppercase mb-4">What's included</div>
                {/* List */}
                <ul>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">Instant access to all ai agents</div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">No monthly fee</div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">No subscription required
                    </div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">Priority support</div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plus Plan */}
            <div className="relative col-span-full xl:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm rounded-b-lg">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-violet-500" aria-hidden="true"></div>
              <div className="px-5 pt-5 pb-6 border-b border-gray-200 dark:border-gray-700/60">
                <header className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full shrink-0 bg-violet-500 mr-3">
                    <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 17a.833.833 0 01-.833-.833 3.333 3.333 0 00-3.334-3.334.833.833 0 110-1.666 3.333 3.333 0 003.334-3.334.833.833 0 111.666 0 3.333 3.333 0 003.334 3.334.833.833 0 110 1.666 3.333 3.333 0 00-3.334 3.334c0 .46-.373.833-.833.833z" />
                    </svg>
                  </div>
                  <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">1,000 credits</h3>
                </header>
                <div className="text-sm mb-2">One-time payment.</div>
                {/* Price */}
                <div className="text-gray-800 dark:text-gray-100 font-bold mb-4">
                  <span className="text-2xl">$</span><span className="text-3xl">97</span>
                </div>
                {/* CTA */}
                <button 
                  onClick={() => handleBuyCredits('1000')}
                  disabled={loading === '1000'}
                  className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === '1000' ? 'Loading...' : 'Buy 1,000 Credits'}
                </button>
              </div>
              <div className="px-5 pt-4 pb-5">
                <div className="text-xs text-gray-800 dark:text-gray-100 font-semibold uppercase mb-4">What's included</div>
                {/* List */}
                <ul>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">Instant access to all ai agents</div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">No monthly fee</div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">No subscription required
                    </div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">Priority support</div>
                  </li>
                  <li className="flex items-center py-1">
                    <svg className="w-3 h-3 shrink-0 fill-current text-green-500 mr-2" viewBox="0 0 12 12">
                      <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                    </svg>
                    <div className="text-sm">40%+ discount</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold">FAQs</h2>
          </div>
          <ul className="space-y-5">
            <li>
              <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                What are credits and how do they work?
              </div>
              <div className="text-sm">
                Credits are the currency used to run AI agents on our platform. Each agent has a credit cost, and credits are deducted from your balance when you execute an agent. New users receive 10 free credits upon signup to get started.
              </div>
            </li>
            <li>
              <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                What happens if I run out of credits?
              </div>
              <div className="text-sm">
                If you run out of credits, you won't be able to run additional agents until you purchase more. You'll see a clear message indicating insufficient credits when trying to run an agent. You can purchase additional credits at any time through the Buy Credits button on your plan.
              </div>
            </li>
            <li>
              <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                How do I check my credit balance?
              </div>
              <div className="text-sm">
                Your current credit balance is displayed in the header notification and in your profile dropdown. The balance updates automatically after each agent run, so you always know how many credits you have remaining.
              </div>
            </li>
            <li>
              <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                Do credits expire?
              </div>
              <div className="text-sm">
                Never.
              </div>
            </li>
            <li>
              <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                Got more questions?
              </div>
              <div className="text-sm">
                If you have additional questions about credits, plans, or our AI agents, please contact us and we'll be happy to help.
              </div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}

