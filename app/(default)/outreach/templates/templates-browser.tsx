'use client'

import { useEffect, useMemo, useState } from 'react'

import TemplateCards from './template-cards'
import type { OutreachTemplate } from './template-data'

type TemplatesBrowserProps = {
  templates: OutreachTemplate[]
  categories: string[]
}

const VIEW_ALL = 'View All'
const PAGE_SIZE = 9

export default function TemplatesBrowser({ templates, categories }: TemplatesBrowserProps) {
  const categoryOptions = useMemo(() => [VIEW_ALL, ...categories], [categories])
  const [activeCategory, setActiveCategory] = useState<string>(VIEW_ALL)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Count templates per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    templates.forEach((template) => {
      counts[template.category] = (counts[template.category] || 0) + 1
    })
    return counts
  }, [templates])

  const filteredTemplates = useMemo(() => {
    if (activeCategory === VIEW_ALL) {
      return templates
    }
    return templates.filter((template) => template.category === activeCategory)
  }, [activeCategory, templates])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE)), [filteredTemplates.length])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTemplates.slice(start, start + PAGE_SIZE)
  }, [currentPage, filteredTemplates])

  return (
    <>
      {/* Filters */}
      <div className="mb-5">
        <ul className="flex flex-wrap -m-1">
          {categoryOptions.map((category) => {
            const isActive = category === activeCategory
            const count = category === VIEW_ALL ? templates.length : categoryCounts[category] || 0

            return (
              <li key={category} className="m-1">
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border shadow-sm transition cursor-pointer ${
                    isActive
                      ? 'border-transparent bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-800'
                      : 'border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                  type="button"
                >
                  {category}
                  {count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-white/20 dark:bg-gray-800/20'
                        : 'bg-gray-100 dark:bg-gray-700/60'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
        {filteredTemplates.length} Template{filteredTemplates.length === 1 ? '' : 's'}
      </div>

      {/* Content */}
      <TemplateCards templates={paginatedTemplates} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex" role="navigation" aria-label="Template pagination">
            <div className="mr-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center justify-center rounded-lg leading-5 px-2.5 py-2 border border-gray-200 dark:border-gray-700/60 ${
                  currentPage === 1
                    ? 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-violet-500 cursor-pointer'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z" />
                </svg>
              </button>
            </div>
            <ul className="inline-flex text-sm font-medium -space-x-px rounded-lg shadow-sm">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
                const isActive = pageNumber === currentPage
                return (
                  <li key={pageNumber}>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`inline-flex items-center justify-center leading-5 px-3.5 py-2 border border-gray-200 dark:border-gray-700/60 ${
                        isActive
                          ? 'rounded-lg bg-white dark:bg-gray-800 text-violet-500 cursor-default'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 cursor-pointer'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="ml-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center justify-center rounded-lg leading-5 px-2.5 py-2 border border-gray-200 dark:border-gray-700/60 ${
                  currentPage === totalPages
                    ? 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-violet-500 cursor-pointer'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

