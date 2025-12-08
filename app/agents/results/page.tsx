'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'
import CustomHeader from '@/components/ui/custom-header'

type AgentResult = {
  id: string
  agent_id: string | null
  agent_slug: string
  agents?: {
    id: string
    slug: string
    title: string
  } | null
  input_params: Record<string, any>
  result_data: Record<string, any>
  created_at: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

export default function AgentResultsPage() {
  const [results, setResults] = useState<AgentResult[]>([])
  const [allResults, setAllResults] = useState<AgentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchAllResults()
  }, [])

  useEffect(() => {
    if (filter === 'all') {
      setResults(allResults)
    } else {
      setResults(allResults.filter((r) => r.agent_slug === filter))
    }
  }, [filter, allResults])

  const fetchAllResults = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/agents/results')
      const data = await response.json()

      if (data.success) {
        const fetchedResults = data.data || []
        setAllResults(fetchedResults)
        setResults(fetchedResults)
      } else {
        setError('Failed to load results')
      }
    } catch (err) {
      console.error('Error fetching results:', err)
      setError('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const getAgentName = (result: AgentResult): string => {
    if (result.agents?.title) {
      return result.agents.title
    }
    // Fallback to slug-based name
    return result.agent_slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getPreviewText = (resultData: Record<string, any>): string => {
    if (resultData?.result) {
      return resultData.result.substring(0, 200) + (resultData.result.length > 200 ? '...' : '')
    }
    return 'No preview available'
  }

  const getInputSummary = (inputParams: Record<string, any>): string => {
    if (inputParams?.url) {
      return `URL: ${inputParams.url}`
    }
    if (inputParams?.conversionGoal) {
      return `Goal: ${inputParams.conversionGoal}`
    }
    if (inputParams?.topic) {
      return `Topic: ${inputParams.topic}`
    }
    return 'View details'
  }

  const uniqueAgentSlugs = Array.from(new Set(allResults.map((r) => r.agent_slug))).filter(Boolean)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Custom Header */}
      <CustomHeader />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[128rem] mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">
            Your previous runs
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage all your previous agent runs
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-violet-500 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            All Agents
          </button>
          {uniqueAgentSlugs.map((slug) => {
            // Find a result with this slug to get the agent name
            const sampleResult = allResults.find((r) => r.agent_slug === slug)
            const agentName = sampleResult ? getAgentName(sampleResult) : slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
            return (
              <button
                key={slug}
                onClick={() => setFilter(slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filter === slug
                    ? 'bg-violet-500 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {agentName}
              </button>
            )
          })}
        </div>

        {/* Results List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-violet-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-12 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">No results found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all'
                ? 'Run an agent to see your results here'
                : `No results found for ${filter.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/agent/${result.agent_slug}?resultId=${result.id}`}
                className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-6 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {getAgentName(result)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getInputSummary(result.input_params)}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatDate(result.created_at)}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {getPreviewText(result.result_data)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

