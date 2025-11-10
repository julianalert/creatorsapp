import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import TemplateCards from '../template-cards'
import {
  getRelatedTemplates,
  getTemplateBySlug,
  outreachTemplateCount,
  outreachTemplates,
} from '../template-data'

type TemplateDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return outreachTemplates.map((template) => ({
    slug: template.slug,
  }))
}

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const template = getTemplateBySlug(slug)

  if (!template) {
    return {
      title: 'Template not found',
    }
  }

  return {
    title: `${template.title} · Outreach Template`,
    description: template.summary,
    openGraph: {
      title: template.title,
      description: template.summary,
    },
  }
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { slug } = await params
  const template = getTemplateBySlug(slug)

  if (!template) {
    notFound()
  }

  const relatedTemplates = getRelatedTemplates(template.slug, 2)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:space-x-8 xl:space-x-16">
        <div className="flex-1">
          <div className="mb-6">
            <Link
              className="btn-sm px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              href="/outreach/templates"
            >
              <svg className="fill-current text-gray-400 dark:text-gray-500 mr-2" width="7" height="12" viewBox="0 0 7 12">
                <path d="M5.4.6 6.8 2l-4 4 4 4-1.4 1.4L0 6z" />
              </svg>
              <span>Back to Templates</span>
            </Link>
          </div>

          <div className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-2">{template.category}</div>
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-3">{template.title}</h1>
            <p className="text-base text-gray-600 dark:text-gray-300">{template.summary}</p>
          </header>

          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            {template.stats.map((stat) => (
              <div
                key={`${template.slug}-${stat.label}`}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 shadow-sm"
              >
                <div className="text-xs uppercase font-semibold text-gray-400 dark:text-gray-500">{stat.label}</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          <figure className="mb-8">
            <Image className="w-full rounded-xl border border-gray-100 dark:border-gray-700/60" src={template.heroImage} alt={template.title} />
          </figure>

          <section className="mb-10">
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-3">Where this template shines</h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{template.useCase}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 text-sm text-violet-600 dark:text-violet-400">
              <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 16 16">
                <path d="M9 0a1 1 0 0 1 1 1v1h4v2h-1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H2V2h4V1a1 1 0 0 1 1-1h2Zm2 4H5v10h6V4ZM7 6h2v6H7V6Z" />
              </svg>
              Built for: {template.persona}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-4">Multi-touch sequence</h2>
            <div className="space-y-5">
              {template.sequence.map((step) => (
                <article
                  key={`${template.slug}-${step.step}`}
                  className="border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{step.step}</div>
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {step.channel}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{step.timing}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{step.objective}</div>
                  <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/40 rounded-lg p-4">
                    {step.copy}
                  </pre>
                </article>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-4">Plug-and-play snippets</h2>
            <div className="space-y-4">
              {template.samples.map((sample) => (
                <div
                  key={`${template.slug}-${sample.label}`}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 shadow-sm"
                >
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">{sample.label}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{sample.subject}</div>
                  <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{sample.body}</pre>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-4">Operator notes</h2>
            <ul className="space-y-3">
              {template.insights.map((insight) => (
                <li
                  key={`${template.slug}-${insight.label}`}
                  className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/40 rounded-xl p-4"
                >
                  <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold">
                    →
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{insight.label}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {relatedTemplates.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">Related templates</h2>
                <Link
                  className="text-sm font-semibold text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
                  href="/outreach/templates"
                >
                  View all {outreachTemplateCount}
                </Link>
              </div>
              <TemplateCards templates={relatedTemplates} />
            </section>
          )}
        </div>

        <aside className="space-y-4 mt-8 lg:mt-0 lg:w-[18rem] xl:w-[20rem]">
          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
            <div className="space-y-3">
              <button className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                Use this template
              </button>
              <button className="btn w-full border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300">
                Share with team
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
            <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">Snapshot</div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Persona</dt>
                <dd className="text-gray-800 dark:text-gray-100 text-right">{template.persona}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Primary channel</dt>
                <dd className="text-gray-800 dark:text-gray-100 text-right">{template.stats[2]?.value ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Touches</dt>
                <dd className="text-gray-800 dark:text-gray-100 text-right">{template.sequence.length}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
            <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">Tags</div>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={`${template.slug}-${tag}`}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900/60 text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

