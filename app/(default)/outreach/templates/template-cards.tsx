import Link from 'next/link'
import CategoryBadge from '@/components/category-badge'

import type { OutreachTemplate } from './template-data'

type TemplateCardsProps = {
  templates: OutreachTemplate[]
  columns?: 2 | 3 | 4
}

export default function TemplateCards({ templates, columns = 4 }: TemplateCardsProps) {
  const gridClass = columns === 2 
    ? 'grid sm:grid-cols-1 lg:grid-cols-2 gap-6'
    : columns === 3
    ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
  
  return (
    <div className={gridClass}>
      {templates.map((template) => (
        <article
          key={template.slug}
          className="flex flex-col bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/40"
        >
          <div className="grow p-5 flex flex-col">
            <div className="grow">
              <Link className="inline-flex mb-2" href={`/agent/${template.slug}`}>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{template.title}</h2>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{template.summary}</p>
              
            </div>
            <div className="flex items-center justify-between mt-4">
              <CategoryBadge category={template.category} />
              <Link
                className="text-sm font-semibold text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
                href={`/agent/${template.slug}`}
              >
                Use agent →
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

