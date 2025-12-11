'use client'

import { useState } from 'react'
import { DocumentDuplicateIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface EmailData {
  emailNumber: number
  internalGoal: string
  sendTime: string
  subjectLines: string[]
  previewText: string
  body: string
  primaryCta: {
    label: string
    action: string
  }
  ps?: string
}

interface ParsedSequence {
  emails: EmailData[]
  strategy: string
  assumptions: string
}

function parseEmailSequence(markdown: string): ParsedSequence | null {
  try {
    const emails: EmailData[] = []
    let strategy = ''
    let assumptions = ''

    // Split by email sections
    const emailSections = markdown.split(/\[EMAIL\s+(\d+)\]/i)
    
    // Process each email (skip first empty element)
    for (let i = 1; i < emailSections.length; i += 2) {
      const emailNumber = parseInt(emailSections[i])
      const emailContent = emailSections[i + 1] || ''

      // Extract fields using regex
      const internalGoalMatch = emailContent.match(/- Internal goal:\s*(.+?)(?:\n|$)/i)
      const sendTimeMatch = emailContent.match(/- Best send time after signup:\s*(.+?)(?:\n|$)/i)
      const previewTextMatch = emailContent.match(/- Preview text[^:]*:\s*(.+?)(?:\n|$)/i)
      const bodyMatch = emailContent.match(/- Email body[^:]*:\s*([\s\S]+?)(?=- Primary CTA|$)/i)
      const ctaLabelMatch = emailContent.match(/- Button \/ link label text:\s*["']?(.+?)["']?(?:\n|$)/i)
      const ctaActionMatch = emailContent.match(/- Target action[^:]*:\s*["']?(.+?)["']?(?:\n|$)/i)
      const psMatch = emailContent.match(/- Optional PS[^:]*:\s*([\s\S]+?)(?=\[EMAIL|\[SEQUENCE|$)/i)

      // Extract subject lines (multiple variants)
      const subjectLines: string[] = []
      const subjectSection = emailContent.match(/- Subject line options[^:]*:\s*([\s\S]+?)(?=- Preview text|$)/i)
      if (subjectSection) {
        const subjectMatches = Array.from(subjectSection[1].matchAll(/\d+\)\s*(.+?)(?:\n|$)/g))
        for (const match of subjectMatches) {
          if (match[1]) {
            subjectLines.push(match[1].trim())
          }
        }
      }

      if (emailNumber) {
        emails.push({
          emailNumber,
          internalGoal: internalGoalMatch?.[1]?.trim() || '',
          sendTime: sendTimeMatch?.[1]?.trim() || '',
          subjectLines: subjectLines.length > 0 ? subjectLines : ['Subject line not found'],
          previewText: previewTextMatch?.[1]?.trim() || '',
          body: bodyMatch?.[1]?.trim() || '',
          primaryCta: {
            label: ctaLabelMatch?.[1]?.trim() || '',
            action: ctaActionMatch?.[1]?.trim() || '',
          },
          ps: psMatch?.[1]?.trim(),
        })
      }
    }

    // Extract sequence strategy
    const strategyMatch = markdown.match(/\[SEQUENCE STRATEGY\]\s*([\s\S]+?)(?=\[ASSUMPTIONS\]|$)/i)
    if (strategyMatch) {
      strategy = strategyMatch[1].trim()
    }

    // Extract assumptions
    const assumptionsMatch = markdown.match(/\[ASSUMPTIONS\]\s*([\s\S]+?)$/i)
    if (assumptionsMatch) {
      assumptions = assumptionsMatch[1].trim()
    }

    return { emails, strategy, assumptions }
  } catch (error) {
    console.error('Error parsing email sequence:', error)
    return null
  }
}

function EmailCard({ email, isExpanded, onToggle }: { email: EmailData; isExpanded: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm overflow-hidden">
      {/* Email Header */}
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/60 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                {email.emailNumber}
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Email {email.emailNumber}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {email.sendTime || 'Send time not specified'}
                </div>
              </div>
            </div>
            {!isExpanded && email.subjectLines.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {email.subjectLines[0]}
                </div>
                {email.previewText && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {email.previewText}
                  </div>
                )}
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

      {/* Email Content (Expanded) */}
      {isExpanded && (
        <div className="px-6 py-5 space-y-5">
          {/* Internal Goal */}
          {email.internalGoal && (
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Internal Goal
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{email.internalGoal}</div>
            </div>
          )}

          {/* Subject Lines */}
          {email.subjectLines.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Subject Line Options
              </div>
              <div className="space-y-2">
                {email.subjectLines.map((subject, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/40"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                        {idx + 1}.
                      </span>
                      <span className="text-sm text-gray-800 dark:text-gray-100 flex-1">{subject}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(subject)}
                      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      title="Copy subject line"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Text */}
          {email.previewText && (
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Preview Text
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 italic p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/40">
                {email.previewText}
              </div>
            </div>
          )}

          {/* Email Body */}
          {email.body && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Email Body
                </div>
                <button
                  onClick={() => copyToClipboard(email.body)}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/40">
                <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {email.body}
                </div>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          {email.primaryCta.label && (
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Primary Call to Action
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {email.primaryCta.label}
                    </div>
                    {email.primaryCta.action && (
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        {email.primaryCta.action}
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg">
                    Button
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PS */}
          {email.ps && (
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                P.S.
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 italic p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/40">
                {email.ps}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function EmailSequenceDisplay({ markdown }: { markdown: string }) {
  const [expandedEmails, setExpandedEmails] = useState<Set<number>>(new Set([1])) // Expand first email by default
  const [showStrategy, setShowStrategy] = useState(false)
  const [showAssumptions, setShowAssumptions] = useState(false)

  const parsed = parseEmailSequence(markdown)

  if (!parsed || parsed.emails.length === 0) {
    // Fallback to raw markdown if parsing fails
    return (
      <div className="w-full">
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Could not parse email sequence. Showing raw output.
          </p>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700/60">
          {markdown}
        </pre>
      </div>
    )
  }

  const toggleEmail = (emailNumber: number) => {
    setExpandedEmails((prev) => {
      const next = new Set(prev)
      if (next.has(emailNumber)) {
        next.delete(emailNumber)
      } else {
        next.add(emailNumber)
      }
      return next
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Email Cards */}
      <div className="space-y-4">
        {parsed.emails.map((email) => (
          <EmailCard
            key={email.emailNumber}
            email={email}
            isExpanded={expandedEmails.has(email.emailNumber)}
            onToggle={() => toggleEmail(email.emailNumber)}
          />
        ))}
      </div>

      {/* Sequence Strategy */}
      {parsed.strategy && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowStrategy(!showStrategy)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
          >
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Sequence Strategy
            </div>
            {showStrategy ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {showStrategy && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700/60">
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {parsed.strategy}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assumptions */}
      {parsed.assumptions && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
          >
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Assumptions
            </div>
            {showAssumptions ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {showAssumptions && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700/60">
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {parsed.assumptions}
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

