export const metadata = {
  title: 'Templates - Mosaic',
  description: 'Page description',
}

import SearchForm from '@/components/search-form'
import PaginationNumeric from '@/components/pagination-numeric'
import TemplatesBrowser from './templates-browser'
import { outreachTemplateCategories, outreachTemplates } from './template-data'

export default function Templates() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">

        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Outreach Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Reuse high-performing outreach flows to launch new campaigns in minutes.</p>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">

          {/* Search form 
          <SearchForm placeholder="Search templates…" /> */}

          {/* Add template button
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">New template</span>
          </button>*/}

        </div>

      </div>

      <TemplatesBrowser templates={outreachTemplates} categories={outreachTemplateCategories} />

      {/* Pagination (kept for future use, hidden by default) */}
      <div className="mt-8 hidden">
        <PaginationNumeric />
      </div>
    </div>
  )
}
