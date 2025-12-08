'use client'

import { useState, useEffect } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import CustomHeader from '@/components/ui/custom-header'
import AgentResultsTable from './agent-results-table'
import type { AgentResult } from './agent-results-table'

function AgentResultsContent() {
  const [results, setResults] = useState<AgentResult[]>([])
  const [allResults, setAllResults] = useState<AgentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 2

  useEffect(() => {
    fetchAllResults()
  }, [])

  useEffect(() => {
    if (filter === 'all') {
      setResults(allResults)
    } else {
      setResults(allResults.filter((r) => r.agent_slug === filter))
    }
    // Reset to page 1 when filter changes
    setCurrentPage(1)
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

  const uniqueAgentSlugs = Array.from(new Set(allResults.map((r) => r.agent_slug))).filter(Boolean)

  // Calculate pagination
  const totalItems = results.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedResults = results.slice(startIndex, endIndex)
  const startItem = totalItems > 0 ? startIndex + 1 : 0
  const endItem = Math.min(endIndex, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
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
            Your previous runs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all your previous agent runs</p>
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

        {/* Results Table */}
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
          <>
            {/* Table */}
            <AgentResultsTable results={paginatedResults} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <nav className="mb-4 sm:mb-0 sm:order-1" role="navigation" aria-label="Navigation">
                    <ul className="flex justify-center">
                      <li className="ml-3 first:ml-0">
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className={`btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 ${
                            currentPage === 1
                              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                          }`}
                        >
                          &lt;- Previous
                        </button>
                      </li>
                      <li className="ml-3 first:ml-0">
                        <button
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          className={`btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 ${
                            currentPage === totalPages
                              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                          }`}
                        >
                          Next -&gt;
                        </button>
                      </li>
                    </ul>
                  </nav>
                  <div className="text-sm text-gray-500 text-center sm:text-left">
                    Showing <span className="font-medium text-gray-600 dark:text-gray-300">{startItem}</span> to{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">{endItem}</span> of{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">{totalItems}</span> results
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function AgentResultsPage() {
  return <AgentResultsContent />
}

