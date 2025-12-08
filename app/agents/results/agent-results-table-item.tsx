import Link from 'next/link'
import { AgentResult } from './agent-results-table'

interface AgentResultsTableItemProps {
  result: AgentResult
  onCheckboxChange: (id: string, checked: boolean) => void
  isSelected: boolean
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

function getAgentName(result: AgentResult): string {
  if (result.agents?.title) {
    return result.agents.title
  }
  // Fallback to slug-based name
  return result.agent_slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function getInputSummary(inputParams: Record<string, any>): string {
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

function getPreviewText(resultData: Record<string, any>): string {
  if (resultData?.result) {
    const text = resultData.result
    return text.substring(0, 100) + (text.length > 100 ? '...' : '')
  }
  return 'No preview available'
}

export default function AgentResultsTableItem({ result, onCheckboxChange, isSelected }: AgentResultsTableItemProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {        
    onCheckboxChange(result.id, e.target.checked)
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
        <div className="flex items-center">
          <label className="inline-flex">
            <span className="sr-only">Select</span>
            <input className="form-checkbox" type="checkbox" onChange={handleCheckboxChange} checked={isSelected} />
          </label>
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="font-medium text-gray-800 dark:text-gray-100">{getAgentName(result)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-gray-600 dark:text-gray-400">{getInputSummary(result.input_params)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3">
        <div className="text-gray-600 dark:text-gray-400 max-w-md truncate">{getPreviewText(result.result_data)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-gray-600 dark:text-gray-400">{formatDate(result.created_at)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
        <div className="space-x-1">
          <Link
            href={`/agent/${result.agent_slug}?resultId=${result.id}`}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full"
          >
            <span className="sr-only">View</span>
            <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
              <path d="M19.7 8.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM12.6 22H10v-2.6l6-6 2.6 2.6-6 6zm7.4-7.4L17.4 12l1.6-1.6 2.6 2.6-1.6 1.6z" />
            </svg>
          </Link>
        </div>
      </td>
    </tr>
  )
}

