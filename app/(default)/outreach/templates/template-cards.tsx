import Link from 'next/link'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import CategoryBadge from '@/components/category-badge'

import type { OutreachTemplate } from './template-data'

type TemplateCardsProps = {
  templates: (OutreachTemplate & {
    credits?: number
    ratingAverage?: number
    ratingCount?: number
    hasInterface?: boolean
  })[]
  columns?: 2 | 3 | 4
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-3 h-3 ${filled ? 'fill-current text-yellow-500' : 'fill-current text-gray-300 dark:text-gray-600'}`}
      viewBox="0 0 16 16"
    >
      <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
    </svg>
  )
}

export default function TemplateCards({ templates, columns = 4 }: TemplateCardsProps) {
  const gridClass = columns === 2 
    ? 'grid sm:grid-cols-1 lg:grid-cols-2 gap-6'
    : columns === 3
    ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
  
  return (
    <div className={gridClass}>
      {templates.map((template) => {
        const hasInterface = template.hasInterface !== false // Default to true if not specified
        const cardClassName = `flex flex-col bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/40 relative ${
          hasInterface 
            ? 'transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer' 
            : 'cursor-not-allowed opacity-75'
        }`
        
        const cardContent = (
          <>
            {/* Coming Soon Badge */}
            {!hasInterface && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800">
                  Coming Soon
                </span>
              </div>
            )}

            <div className="grow p-5 flex flex-col">
              {/* Category Badge - Above Title */}
              <div className="mb-2">
                <CategoryBadge category={template.category} />
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                {template.title}
              </h2>

              {/* Summary */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 grow">{template.summary}</p>
              
              {/* Bottom Section: Cost (left) and Rating (right) */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/40">
                {/* Cost - Bottom Left */}
                <div className="flex items-center space-x-1.5">
                  <CurrencyDollarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {template.credits || 1} credit{(template.credits || 1) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Rating - Bottom Right */}
                {template.ratingAverage && template.ratingAverage > 0 ? (
                  <div className="flex items-center space-x-1.5">
                    <StarIcon filled={true} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {template.ratingAverage.toFixed(1)}
                    </span>
                    {template.ratingCount && template.ratingCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({template.ratingCount})
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )
        
        return hasInterface ? (
          <Link
            key={template.slug}
            href={`/agent/${template.slug}`}
            className={cardClassName}
          >
            {cardContent}
          </Link>
        ) : (
          <div
            key={template.slug}
            className={cardClassName}
          >
            {cardContent}
          </div>
        )
      })}
    </div>
  )
}

