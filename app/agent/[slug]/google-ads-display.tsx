'use client'

import { useState } from 'react'
import { DocumentDuplicateIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface GoogleAd {
  adNumber: number
  headline: string
  description: string
}

interface ParsedAds {
  ads: GoogleAd[]
  notes?: string
}

function parseAds(markdown: string): ParsedAds | null {
  try {
    const ads: GoogleAd[] = []

    // Find all AD sections using a more flexible regex
    const adSectionRegex = /##\s*AD\s+(\d+)\s*\n([\s\S]*?)(?=##\s*AD\s+\d+|##\s*NOTES|$)/gi
    let match
    
    while ((match = adSectionRegex.exec(markdown)) !== null) {
      const adNumber = parseInt(match[1])
      const adContent = match[2] || ''

      // Extract Headline - try multiple patterns in order of specificity
      let headline = ''
      
      // Pattern 1: **Headline:** followed by newline and text (most common)
      let headlineMatch = adContent.match(/\*\*Headline:\*\*\s*\n\s*([^\n]+)/i)
      if (headlineMatch) {
        headline = headlineMatch[1].trim()
      } else {
        // Pattern 2: **Headline:** followed by space and text on same line
        headlineMatch = adContent.match(/\*\*Headline:\*\*\s+([^\n]+)/i)
        if (headlineMatch) {
          headline = headlineMatch[1].trim()
        } else {
          // Pattern 3: **Headline:** with any content until Description or separator
          headlineMatch = adContent.match(/\*\*Headline:\*\*\s*([\s\S]*?)(?=\*\*Description:|\*\*|---|$)/i)
          if (headlineMatch) {
            // Take first line only, clean it up
            headline = headlineMatch[1].trim().split('\n')[0].trim()
          }
        }
      }

      // Extract Description - try multiple patterns
      let description = ''
      
      // Pattern 1: **Description:** followed by newline and text (most common)
      let descMatch = adContent.match(/\*\*Description:\*\*\s*\n\s*([^\n]+)/i)
      if (descMatch) {
        description = descMatch[1].trim()
      } else {
        // Pattern 2: **Description:** followed by space and text on same line
        descMatch = adContent.match(/\*\*Description:\*\*\s+([^\n]+)/i)
        if (descMatch) {
          description = descMatch[1].trim()
        } else {
          // Pattern 3: **Description:** with any content until separator or end
          descMatch = adContent.match(/\*\*Description:\*\*\s*([\s\S]*?)(?=---|##|$)/i)
          if (descMatch) {
            // Take first line only, clean it up
            description = descMatch[1].trim().split('\n')[0].trim()
          }
        }
      }

      // Clean up headline and description (remove markdown formatting)
      headline = headline
        .replace(/\*\*/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/^\[|\]$/g, '')
        .trim()
      
      description = description
        .replace(/\*\*/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/^\[|\]$/g, '')
        .trim()

      // Only add if we have both headline and description
      if (adNumber && headline && description) {
        ads.push({
          adNumber,
          headline,
          description,
        })
      }
    }

    // Extract Notes if present
    const notesMatch = markdown.match(/##\s*NOTES\s*\n([\s\S]+?)$/i)
    const notes = notesMatch?.[1]?.trim()

    if (ads.length === 0) {
      return null
    }

    return { ads, notes }
  } catch (error) {
    console.error('Error parsing Google Ads:', error)
    return null
  }
}

// Alternative parser for edge cases
function parseAdsAlternative(markdown: string): ParsedAds | null {
  try {
    const ads: GoogleAd[] = []
    
    // Try to find numbered list pattern or any pattern with Headline/Description
    const lines = markdown.split('\n')
    let currentAd: Partial<GoogleAd> | null = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Look for AD number in various formats
      const adMatch = line.match(/AD\s+(\d+)|^(\d+)\./i)
      if (adMatch) {
        // Save previous ad if exists
        if (currentAd && currentAd.headline && currentAd.description) {
          ads.push({
            adNumber: currentAd.adNumber!,
            headline: currentAd.headline,
            description: currentAd.description,
          })
        }
        // Start new ad
        currentAd = {
          adNumber: parseInt(adMatch[1] || adMatch[2]),
          headline: '',
          description: '',
        }
        continue
      }
      
      // Look for Headline
      if (currentAd && /headline/i.test(line)) {
        const headlineMatch = line.match(/headline[:\s]+(.+)/i)
        if (headlineMatch) {
          currentAd.headline = headlineMatch[1].replace(/\*\*/g, '').trim()
        } else if (i + 1 < lines.length && !/description/i.test(lines[i + 1])) {
          // Headline might be on next line
          currentAd.headline = lines[i + 1].replace(/\*\*/g, '').trim()
          i++
        }
        continue
      }
      
      // Look for Description
      if (currentAd && /description/i.test(line)) {
        const descMatch = line.match(/description[:\s]+(.+)/i)
        if (descMatch) {
          currentAd.description = descMatch[1].replace(/\*\*/g, '').trim()
        } else if (i + 1 < lines.length) {
          // Description might be on next line
          currentAd.description = lines[i + 1].replace(/\*\*/g, '').trim()
          i++
        }
        continue
      }
    }
    
    // Save last ad
    if (currentAd && currentAd.headline && currentAd.description) {
      ads.push({
        adNumber: currentAd.adNumber!,
        headline: currentAd.headline,
        description: currentAd.description,
      })
    }
    
    if (ads.length === 0) {
      return null
    }
    
    return { ads, notes: undefined }
  } catch (error) {
    console.error('Error in alternative parsing:', error)
    return null
  }
}

function getCharacterCount(text: string): number {
  return text.length
}

function getCharacterStatus(count: number, max: number): { color: string; status: string } {
  if (count <= max) {
    return { color: 'text-green-600 dark:text-green-400', status: 'OK' }
  }
  return { color: 'text-red-600 dark:text-red-400', status: 'OVER' }
}

function AdCard({ ad, isExpanded, onToggle }: { ad: GoogleAd; isExpanded: boolean; onToggle: () => void }) {
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

  const headlineCount = getCharacterCount(ad.headline)
  const descriptionCount = getCharacterCount(ad.description)
  const headlineStatus = getCharacterStatus(headlineCount, 30)
  const descriptionStatus = getCharacterStatus(descriptionCount, 90)

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
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-purple-200 dark:border-purple-800">
                {ad.adNumber}
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Ad {ad.adNumber}
                </div>
                {!isExpanded && ad.headline && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {ad.headline}
                  </div>
                )}
              </div>
            </div>
            {!isExpanded && (
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className={`font-medium ${headlineStatus.color}`}>
                  Headline: {headlineCount}/30
                </span>
                <span className={`font-medium ${descriptionStatus.color}`}>
                  Description: {descriptionCount}/90
                </span>
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
          {/* Google Ad Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800/40 p-5">
            <div className="mb-2">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                {ad.headline}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {ad.description}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              example.com
            </div>
          </div>

          {/* Headline */}
          {ad.headline && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Headline
                  </div>
                  <span className={`text-xs font-medium ${headlineStatus.color}`}>
                    ({headlineCount}/30 {headlineStatus.status})
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(ad.headline, 'headline')
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  {copied === 'headline' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700/40">
                <div className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {ad.headline}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {ad.description && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Description
                  </div>
                  <span className={`text-xs font-medium ${descriptionStatus.color}`}>
                    ({descriptionCount}/90 {descriptionStatus.status})
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(ad.description, 'description')
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  {copied === 'description' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/40">
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {ad.description}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default function GoogleAdsDisplay({ markdown }: { markdown: string }) {
  const [expandedAds, setExpandedAds] = useState<Set<number>>(new Set([1])) // Expand first ad by default
  const [showNotes, setShowNotes] = useState(false)

  // Try primary parsing method
  let parsed = parseAds(markdown)

  // If primary parsing fails, try alternative method
  if (!parsed || parsed.ads.length === 0) {
    console.log('Primary parsing failed, trying alternative parser...')
    parsed = parseAdsAlternative(markdown)
  }

  if (!parsed || parsed.ads.length === 0) {
    // Log for debugging
    console.log('Failed to parse Google Ads. Raw markdown:', markdown.substring(0, 500))
    
    // Fallback to raw markdown if all parsing fails
    return (
      <div className="w-full">
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Could not parse Google Ads. Showing raw output.
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
            Please check the browser console for debugging information.
          </p>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700/60">
          {markdown}
        </pre>
      </div>
    )
  }

  const toggleAd = (adNumber: number) => {
    setExpandedAds((prev) => {
      const next = new Set(prev)
      if (next.has(adNumber)) {
        next.delete(adNumber)
      } else {
        next.add(adNumber)
      }
      return next
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700/60">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Google Ads for AdWords
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {parsed.ads.length} ready-to-use Google Ads with optimized headlines and descriptions
        </p>
      </div>

      {/* Ad Cards */}
      <div className="space-y-4">
        {parsed.ads.map((ad) => (
          <AdCard
            key={ad.adNumber}
            ad={ad}
            isExpanded={expandedAds.has(ad.adNumber)}
            onToggle={() => toggleAd(ad.adNumber)}
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

