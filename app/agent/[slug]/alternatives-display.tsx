'use client'

import { useState } from 'react'
import { DocumentDuplicateIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, XMarkIcon, MinusIcon } from '@heroicons/react/24/outline'

interface ComparisonRow {
  feature: string
  yourProduct: string
  competitor: string
  evidence?: string
}

interface Alternative {
  name: string
  bestFor: string
  strengths: string[]
  tradeoffs: string[]
  startingPrice?: string
  source?: string
}

interface ParsedAlternatives {
  title: string
  intro: string
  verdict: string
  comparisonTable: ComparisonRow[]
  whyAlternatives: string[]
  deepDive: {
    section: string
    content: string
  }[]
  topAlternatives: Alternative[]
  switchingGuide?: string[]
  faq: {
    question: string
    answer: string
  }[]
  qualityChecklist?: string[]
  rawContent: string
}

function parseAlternatives(markdown: string): ParsedAlternatives | null {
  try {
    const parsed: Partial<ParsedAlternatives> = {
      rawContent: markdown,
      comparisonTable: [],
      whyAlternatives: [],
      deepDive: [],
      topAlternatives: [],
      faq: [],
    }

    // Extract title (H1)
    const titleMatch = markdown.match(/^#\s+(.+)$/m)
    parsed.title = titleMatch?.[1]?.trim() || 'Comparison Page'

    // Extract intro (content between H1 and first H2)
    const introMatch = markdown.match(/^#.+\n\n([\s\S]+?)(?=\n##)/m)
    if (introMatch) {
      parsed.intro = introMatch[1]
        .split(/\n\n/)
        .filter(p => p.trim() && !p.trim().startsWith('##'))
        .slice(0, 3)
        .join('\n\n')
        .trim()
    }

    // Extract TL;DR verdict
    const verdictMatch = markdown.match(/##\s*TL;DR Verdict[\s\S]*?\n([\s\S]+?)(?=\n##|$)/i)
    if (!verdictMatch) {
      // Try alternative patterns
      const altVerdictMatch = markdown.match(/(?:TL;DR|Verdict)[\s\S]*?\n([\s\S]+?)(?=\n##|$)/i)
      parsed.verdict = altVerdictMatch?.[1]?.trim() || ''
    } else {
      parsed.verdict = verdictMatch[1].trim()
    }

    // Extract comparison table
    const tableMatch = markdown.match(/##\s*Feature Comparison[\s\S]*?\n([\s\S]+?)(?=\n##|$)/i)
    if (tableMatch) {
      const tableText = tableMatch[1]
      // Try to parse markdown table - look for rows with pipes
      const lines = tableText.split('\n').filter(line => line.trim().includes('|'))
      if (lines.length > 2) {
        // Skip header (first line) and separator (second line with dashes)
        for (let i = 2; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line.startsWith('|') && line.endsWith('|')) {
            const cells = line.split('|').map(c => c.trim()).filter(c => c && !c.match(/^[-:]+$/))
            if (cells.length >= 3) {
              parsed.comparisonTable!.push({
                feature: cells[0] || '',
                yourProduct: cells[1] || '',
                competitor: cells[2] || '',
                evidence: cells[3] || undefined,
              })
            }
          }
        }
      }
    }

    // Extract "Why alternatives" section
    const whyMatch = markdown.match(/(?:Why people look for alternatives|Why alternatives)[\s\S]*?\n([\s\S]+?)(?=\n##|$)/i)
    if (whyMatch) {
      const whyText = whyMatch[1]
      // Extract bullet points
      const bullets = whyText.match(/[-*•]\s+(.+)/g)
      if (bullets) {
        parsed.whyAlternatives = bullets.map(b => b.replace(/^[-*•]\s+/, '').trim())
      }
    }

    // Extract deep dive sections
    const deepDiveMatch = markdown.match(/(?:vs\.|versus|Deep Dive)[\s\S]*?\n([\s\S]+?)(?=\n##\s+Top alternatives|$)/i)
    if (deepDiveMatch) {
      const deepDiveText = deepDiveMatch[1]
      // Extract subsections (H3 or H4)
      const sections = deepDiveText.match(/###\s+(.+?)\n([\s\S]+?)(?=\n###|$)/g)
      if (sections) {
        sections.forEach(section => {
          const sectionMatch = section.match(/###\s+(.+?)\n([\s\S]+)/)
          if (sectionMatch) {
            parsed.deepDive!.push({
              section: sectionMatch[1].trim(),
              content: sectionMatch[2].trim(),
            })
          }
        })
      }
    }

    // Extract top alternatives
    const alternativesMatch = markdown.match(/(?:Top alternatives|Alternatives)[\s\S]*?\n([\s\S]+?)(?=\n##\s+(?:Switching|FAQ|Quality)|$)/i)
    if (alternativesMatch) {
      const altText = alternativesMatch[1]
      // Try to extract structured alternatives
      const altSections = altText.split(/###\s+/).filter(s => s.trim())
      altSections.forEach(altSection => {
        const nameMatch = altSection.match(/^(.+?)\n/)
        if (nameMatch) {
          const name = nameMatch[1].trim()
          const bestForMatch = altSection.match(/\*\*Best for:\*\*\s*(.+?)(?:\n|$)/i)
          const strengthsMatch = altSection.match(/\*\*Strengths:\*\*\s*([\s\S]+?)(?:\*\*|$)/i)
          const tradeoffsMatch = altSection.match(/\*\*Tradeoffs:\*\*\s*([\s\S]+?)(?:\*\*|$)/i)
          const priceMatch = altSection.match(/\*\*Starting price:\*\*\s*(.+?)(?:\n|$)/i)

          parsed.topAlternatives!.push({
            name,
            bestFor: bestForMatch?.[1]?.trim() || '',
            strengths: strengthsMatch?.[1]?.split(/[-*•]/).map(s => s.trim()).filter(s => s) || [],
            tradeoffs: tradeoffsMatch?.[1]?.split(/[-*•]/).map(s => s.trim()).filter(s => s) || [],
            startingPrice: priceMatch?.[1]?.trim(),
          })
        }
      })
    }

    // Extract FAQ
    const faqMatch = markdown.match(/##\s*FAQ[\s\S]*?\n([\s\S]+?)(?=\n##\s+(?:Quality|Final|CTA)|$)/i)
    if (faqMatch) {
      const faqText = faqMatch[1]
      // Extract Q&A pairs - handle both ### Q: and ### Question: formats
      const qaSections = faqText.split(/(?:^|\n)###\s+(?:Q:|Question:)\s*/m).filter(q => q.trim())
      qaSections.forEach(qa => {
        // Extract question (first line or until newline)
        const questionMatch = qa.match(/^(.+?)(?:\n|$)/)
        if (questionMatch) {
          const question = questionMatch[1].trim()
          // Extract answer (everything after the question line)
          const answerMatch = qa.match(/\n([\s\S]+?)(?=\n###\s+(?:Q:|Question:)|$)/)
          const answer = answerMatch?.[1]?.trim() || qa.split('\n').slice(1).join('\n').trim()
          
          if (question && answer) {
            parsed.faq!.push({
              question: question.replace(/^[Q:]\s*/i, '').trim(),
              answer: answer,
            })
          }
        }
      })
    }

    // Extract quality checklist
    const checklistMatch = markdown.match(/(?:Quality checklist|Missing information)[\s\S]*?\n([\s\S]+?)$/i)
    if (checklistMatch) {
      const checklistText = checklistMatch[1]
      const items = checklistText.match(/[-*•]\s+(.+)/g)
      if (items) {
        parsed.qualityChecklist = items.map(i => i.replace(/^[-*•]\s+/, '').trim())
      }
    }

    return parsed as ParsedAlternatives
  } catch (error) {
    console.error('Error parsing alternatives:', error)
    return null
  }
}

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  const getStatusIcon = (value: string) => {
    const lower = value.toLowerCase()
    if (lower.includes('yes') || lower.includes('✓') || lower.includes('check')) {
      return <CheckIcon className="w-5 h-5 text-green-500" />
    }
    if (lower.includes('no') || lower.includes('✗') || lower.includes('x')) {
      return <XMarkIcon className="w-5 h-5 text-red-500" />
    }
    if (lower.includes('partial') || lower.includes('limited')) {
      return <MinusIcon className="w-5 h-5 text-yellow-500" />
    }
    return null
  }

  if (rows.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300 dark:border-gray-600">
            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Feature</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Your Product</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Competitor</th>
            {rows.some(r => r.evidence) && (
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Evidence</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40">
              <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{row.feature}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  {getStatusIcon(row.yourProduct)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">{row.yourProduct}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  {getStatusIcon(row.competitor)}
                  <span className="text-sm text-gray-700 dark:text-gray-300">{row.competitor}</span>
                </div>
              </td>
              {rows.some(r => r.evidence) && (
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                  {row.evidence && (
                    <a href={row.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline">
                      Source
                    </a>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AlternativeCard({ alt }: { alt: Alternative }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-5 shadow-sm">
      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{alt.name}</h4>
      {alt.bestFor && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="font-semibold">Best for:</span> {alt.bestFor}
        </p>
      )}
      {alt.strengths.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">Strengths</div>
          <ul className="space-y-1">
            {alt.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}
      {alt.tradeoffs.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-2">Tradeoffs</div>
          <ul className="space-y-1">
            {alt.tradeoffs.map((tradeoff, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <MinusIcon className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                {tradeoff}
              </li>
            ))}
          </ul>
        </div>
      )}
      {alt.startingPrice && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Starting price:</span> {alt.startingPrice}
        </div>
      )}
    </div>
  )
}

export default function AlternativesDisplay({ markdown }: { markdown: string }) {
  const [showRaw, setShowRaw] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<Set<number>>(new Set())

  const parsed = parseAlternatives(markdown)

  if (!parsed) {
    // Fallback to raw markdown if parsing fails
    return (
      <div className="w-full">
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Could not parse comparison page. Showing raw output.
          </p>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700/60">
          {markdown}
        </pre>
      </div>
    )
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700/60">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {parsed.title}
        </h1>
        {parsed.intro && (
          <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            {parsed.intro.split('\n\n').map((para, idx) => (
              <p key={idx} className="mb-4">{para}</p>
            ))}
          </div>
        )}
      </div>

      {/* Verdict */}
      {parsed.verdict && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-6">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">TL;DR Verdict</h2>
          <div className="text-base text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">
            {parsed.verdict}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {parsed.comparisonTable.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Feature Comparison</h2>
          <ComparisonTable rows={parsed.comparisonTable} />
        </div>
      )}

      {/* Why Alternatives */}
      {parsed.whyAlternatives.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why People Look for Alternatives</h2>
          <ul className="space-y-3">
            {parsed.whyAlternatives.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deep Dive */}
      {parsed.deepDive.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Detailed Comparison</h2>
          <div className="space-y-6">
            {parsed.deepDive.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.section}</h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Alternatives */}
      {parsed.topAlternatives.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Top Alternatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsed.topAlternatives.map((alt, idx) => (
              <AlternativeCard key={idx} alt={alt} />
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {parsed.faq.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/60">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700/60">
            {parsed.faq.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-start justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100 pr-4">{item.question}</span>
                  {expandedFaq.has(idx) ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedFaq.has(idx) && (
                  <div className="px-6 pb-4">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Checklist */}
      {parsed.qualityChecklist && parsed.qualityChecklist.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl p-6">
          <h2 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-3">Quality Checklist</h2>
          <ul className="space-y-2">
            {parsed.qualityChecklist.map((item, idx) => (
              <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700/60">
        <button
          onClick={() => copyToClipboard(markdown)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
          Copy Full Markdown
        </button>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {showRaw ? 'Hide' : 'Show'} Raw Markdown
        </button>
      </div>

      {/* Raw Markdown */}
      {showRaw && (
        <details open className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-lg p-4">
          <summary className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 mb-2">
            Raw Markdown
          </summary>
          <pre className="mt-3 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto">
            {markdown}
          </pre>
        </details>
      )}
    </div>
  )
}

