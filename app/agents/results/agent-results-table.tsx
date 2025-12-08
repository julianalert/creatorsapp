'use client'

import { useStringItemSelection } from '@/components/utils/use-string-item-selection'
import AgentResultsTableItem from './agent-results-table-item'

export interface AgentResult {
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

export default function AgentResultsTable({ results }: { results: AgentResult[]}) {
  const {
    selectedItems,
    isAllSelected,
    handleCheckboxChange,
    handleSelectAllChange,
  } = useStringItemSelection(results)  

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl relative">
      <header className="px-5 py-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Results <span className="text-gray-400 dark:text-gray-500 font-medium">{results.length}</span></h2>
      </header>
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
              <tr>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                  <div className="flex items-center">
                    <label className="inline-flex">
                      <span className="sr-only">Select all</span>
                      <input className="form-checkbox" type="checkbox" onChange={handleSelectAllChange} checked={isAllSelected} />
                    </label>
                  </div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Agent</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Input</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Preview</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Created</div>
                </th>
                <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Actions</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {results.map(result => (
                <AgentResultsTableItem
                  key={result.id}
                  result={result}
                  onCheckboxChange={handleCheckboxChange}
                  isSelected={selectedItems.includes(result.id)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

