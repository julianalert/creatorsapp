import Image from 'next/image'
import Link from 'next/link'

import type { OutreachTemplate } from './template-data'

type TemplateCardsProps = {
  templates: OutreachTemplate[]
}

export default function TemplateCards({ templates }: TemplateCardsProps) {
  return (
    <div className="grid xl:grid-cols-2 gap-6">
      {templates.map((template) => (
        <article
          key={template.slug}
          className="flex bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/40"
        >
          <Link
            className="relative block w-24 sm:w-[14rem] xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] shrink-0"
            href={`/outreach/templates/${template.slug}`}
          >
            <Image
              className="absolute object-cover object-center w-full h-full"
              src={template.thumbnail}
              width={220}
              height={236}
              alt={`${template.title} thumbnail`}
            />
          </Link>
          <div className="grow p-5 flex flex-col">
            <div className="grow">
              <div className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-2">
                {template.category}
              </div>
              <Link className="inline-flex mb-2" href={`/outreach/templates/${template.slug}`}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{template.title}</h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{template.summary}</p>
              
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400"></div>
              <Link
                className="text-sm font-semibold text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
                href={`/outreach/templates/${template.slug}`}
              >
                View template →
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

