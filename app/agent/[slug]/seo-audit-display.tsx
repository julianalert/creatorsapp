'use client'

import ReactMarkdown from 'react-markdown'

interface SeoAuditDisplayProps {
  markdown: string
}

export default function SeoAuditDisplay({ markdown }: SeoAuditDisplayProps) {
  return (
    <div className="w-full max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-8 first:mt-0 border-b border-gray-200 dark:border-gray-700/60 pb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-5 mt-7">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-6 mb-6 space-y-3">
              {children}
            </ul>
          ),
          li: ({ children }) => {
            // Convert children to string to check content
            const getText = (node: any): string => {
              if (typeof node === 'string') return node
              if (Array.isArray(node)) return node.map(getText).join(' ')
              if (node?.props?.children) return getText(node.props.children)
              return ''
            }
            
            const text = getText(children)
            const isIssueDetail = /^(Issue|Why it matters|How to fix|Evidence):/i.test(text.trim())
            
            if (isIssueDetail) {
              const match = text.match(/^([^:]+):\s*([\s\S]*)/)
              if (match) {
                const label = match[1].trim()
                const value = match[2].trim()
                return (
                  <li className="mb-4">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{label}:</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">{value}</span>
                  </li>
                )
              }
            }
            
            return (
              <li className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {children}
              </li>
            )
          },
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          code: ({ children }) => (
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200 font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-lg p-4 overflow-x-auto mb-4">
              {children}
            </pre>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
