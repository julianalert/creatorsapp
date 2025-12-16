'use client'

import { useState } from 'react'
import { DocumentDuplicateIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface HeadlineVersion {
  versionNumber: number
  goal: string
  title: string
  subtitle: string
  cta: string
}

interface ParsedHeadlines {
  versions: HeadlineVersion[]
  notes?: string
}

function parseHeadlines(markdown: string): ParsedHeadlines | null {
  try {
    const versions: HeadlineVersion[] = []

    // Extract each version section
    const versionPattern = /##\s*VERSION\s+(\d+):\s*([\s\S]+?)(?=##\s*VERSION|\n##\s*NOTES|$)/gi
    
    let match
    while ((match = versionPattern.exec(markdown)) !== null) {
      const versionNumber = parseInt(match[1])
      const versionContent = match[2]
      const goal = match[2].split('\n')[0]?.trim() || ''

      // Extract Title
      const titleMatch = versionContent.match(/\*\*Title:\*\*\s*\n([\s\S]+?)(?=\n\*\*Subtitle:|\n\*\*CTA:|$)/i)
      const title = titleMatch?.[1]?.trim() || ''

      // Extract Subtitle
      const subtitleMatch = versionContent.match(/\*\*Subtitle:\*\*\s*\n([\s\S]+?)(?=\n\*\*CTA:|$)/i)
      const subtitle = subtitleMatch?.[1]?.trim() || ''

      // Extract CTA
      const ctaMatch = versionContent.match(/\*\*CTA:\*\*\s*\n([\s\S]+?)(?=\n---|\n##|$)/i)
      const cta = ctaMatch?.[1]?.trim() || ''

      if (versionNumber && title) {
        versions.push({
          versionNumber,
          goal,
          title,
          subtitle,
          cta,
        })
      }
    }

    // Extract Notes if present
    const notesMatch = markdown.match(/##\s*NOTES\s*\n([\s\S]+?)$/i)
    const notes = notesMatch?.[1]?.trim()

    if (versions.length === 0) {
      return null
    }

    return { versions, notes }
  } catch (error) {
    console.error('Error parsing headlines:', error)
    return null
  }
}

function HeadlineCard({ version, isExpanded, onToggle }: { version: HeadlineVersion; isExpanded: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getVersionLabel = (num: number) => {
    switch (num) {
      case 1:
        return 'Straightforward'
      case 2:
        return 'Hook'
      case 3:
        return 'Own Your Niche'
      default:
        return `Version ${num}`
    }
  }

  const getVersionColor = (num: number) => {
    switch (num) {
      case 1:
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 2:
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
      case 3:
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/60 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border ${getVersionColor(version.versionNumber)}`}>
                {version.versionNumber}
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {getVersionLabel(version.versionNumber)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {version.goal}
                </div>
              </div>
            </div>
            {!isExpanded && version.title && (
              <div className="mt-2">
                <div className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                  {version.title}
                </div>
              </div>
            )}
          </div>
          <button className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Card Content (Expanded) */}
      {isExpanded && (
        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          {version.title && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Title
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(version.title, 'title')
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  {copied === 'title' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700/40">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {version.title}
                </div>
              </div>
            </div>
          )}

          {/* Subtitle */}
          {version.subtitle && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Subtitle
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(version.subtitle, 'subtitle')
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  {copied === 'subtitle' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/40">
                <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {version.subtitle}
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {version.cta && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Call to Action
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(version.cta, 'cta')
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  {copied === 'cta' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {version.cta}
                  </div>
                  <div className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm">
                    Button
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copy All Button */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60">
            <button
              onClick={(e) => {
                e.stopPropagation()
                const fullText = `Title: ${version.title}\n\nSubtitle: ${version.subtitle}\n\nCTA: ${version.cta}`
                copyToClipboard(fullText, 'all')
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              {copied === 'all' ? 'Copied All!' : 'Copy All (Title + Subtitle + CTA)'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HeadlineDisplay({ markdown }: { markdown: string }) {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set([1])) // Expand first version by default
  const [showNotes, setShowNotes] = useState(false)

  const parsed = parseHeadlines(markdown)

  if (!parsed || parsed.versions.length === 0) {
    // Fallback to raw markdown if parsing fails
    return (
      <div className="w-full">
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Could not parse headlines. Showing raw output.
          </p>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700/60">
          {markdown}
        </pre>
      </div>
    )
  }

  const toggleVersion = (versionNumber: number) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev)
      if (next.has(versionNumber)) {
        next.delete(versionNumber)
      } else {
        next.add(versionNumber)
      }
      return next
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700/60">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Hero Section Headlines
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Three distinct headline versions for your landing page hero section
        </p>
      </div>

      {/* Version Cards */}
      <div className="space-y-4">
        {parsed.versions.map((version) => (
          <HeadlineCard
            key={version.versionNumber}
            version={version}
            isExpanded={expandedVersions.has(version.versionNumber)}
            onToggle={() => toggleVersion(version.versionNumber)}
          />
        ))}
      </div>

      {/* Notes */}
      {parsed.notes && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
          >
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Notes
            </div>
            {showNotes ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {showNotes && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700/60">
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {parsed.notes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raw Markdown Toggle (Optional - for debugging) */}
      <details className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-lg p-4">
        <summary className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
          View Raw Markdown
        </summary>
        <pre className="mt-3 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto">
          {markdown}
        </pre>
      </details>
    </div>
  )
}

