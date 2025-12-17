import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import TemplateCards from '@/app/(default)/outreach/templates/template-cards'
import AgentInterface from './agent-interface'
import AgentProcessSteps from './agent-process-steps'
import AgentActivityLog from './agent-activity-log'
import AgentRating from './agent-rating'
import AgentFeedback from './agent-feedback'
import CategoryBadge from '@/components/category-badge'
import { createClient } from '@/lib/supabase/server'

type TemplateDetailPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    resultId?: string
  }>
}

export const dynamicParams = true

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: agent } = await supabase
    .from('agents')
    .select('title, summary')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!agent) {
    return {
      title: 'Agent not found',
    }
  }

  return {
    title: `${agent.title} · AI Agent`,
    description: agent.summary,
    openGraph: {
      title: agent.title,
      description: agent.summary,
    },
  }
}

export default async function TemplateDetailPage({ params, searchParams }: TemplateDetailPageProps) {
  const { slug } = await params
  const { resultId } = await searchParams
  const supabase = await createClient()
  
  // Fetch the agent
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!agent || error) {
    notFound()
  }

  // Transform agent to template format
  const template = {
    slug: agent.slug,
    title: agent.title,
    summary: agent.summary,
    category: agent.category,
    useCase: agent.use_case,
    persona: agent.persona,
    thumbnail: agent.thumbnail_url,
    heroImage: agent.hero_image_url,
    stats: agent.stats || [],
    sequence: agent.sequence || [],
    samples: agent.samples || [],
    insights: agent.insights || [],
    tags: agent.tags || [],
  }

  // Fetch related agents (same category, different slug)
  const { data: relatedAgents } = await supabase
    .from('agents')
    .select('*')
    .eq('category', agent.category)
    .neq('slug', slug)
    .eq('is_active', true)
    .limit(2)

  // Agents that have working API routes
  const WORKING_AGENTS = [
    'on-page-seo-audit',
    'conversion-rate-optimizer',
    'welcome-email-sequence-writer',
    'image-generator',
    'alternatives-to-page-writer',
    'use-case-writer',
    'headline-generator',
  ]

  const relatedTemplates = (relatedAgents || []).map((a) => ({
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    category: a.category,
    useCase: a.use_case,
    persona: a.persona,
    thumbnail: a.thumbnail_url,
    heroImage: a.hero_image_url,
    stats: a.stats || [],
    sequence: a.sequence || [],
    samples: a.samples || [],
    insights: a.insights || [],
    tags: a.tags || [],
    credits: a.credits || 1,
    ratingAverage: Number(a.rating_average) || 0,
    ratingCount: a.rating_count || 0,
    tools: a.tools || [],
    hasInterface: WORKING_AGENTS.includes(a.slug),
  }))

  // Get total count of active agents
  const { count: totalCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="max-w-[128rem] mx-auto flex flex-col lg:flex-row lg:space-x-8 xl:space-x-16">
        <div className="flex-1">
          <div className="mb-6">
            <Link
              className="btn-sm px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
              href="/"
            >
              <svg className="fill-current text-gray-400 dark:text-gray-500 mr-2" width="7" height="12" viewBox="0 0 7 12">
                <path d="M5.4.6 6.8 2l-4 4 4 4-1.4 1.4L0 6z" />
              </svg>
              <span>Back to Agents</span>
            </Link>
          </div>

          <div className="mb-2">
            <CategoryBadge category={template.category} />
          </div>
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-3">{template.title}</h1>
            <p className="text-base text-gray-600 dark:text-gray-300">{template.summary}</p>
          </header>

          {/* Stats section - hidden
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
          */}

          {/* Agent Interface */}
          <AgentInterface slug={template.slug} resultId={resultId} />


          {/* Multi-touch sequence section - hidden
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
          */}

          {/* Plug-and-play snippets section - hidden
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
          */}

          {/* Operator notes section - hidden
          <section className="mb-10">
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-4">Operator notes</h2>
            <ul className="space-y-3">
              {template.insights.map((insight) => (
                <li
                  key={`${template.slug}-${insight.label}`}
                  className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/40 rounded-xl p-4"
                >
                  <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
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
          */}

          {relatedTemplates.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">Related agents</h2>
                <Link
                  className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  href="/"
                >
                  View all {totalCount || 0}
                </Link>
              </div>
              <TemplateCards templates={relatedTemplates} columns={2} />
            </section>
          )}
        </div>

        <aside className="space-y-4 mt-8 lg:mt-0 lg:w-[18rem] xl:w-[20rem]">
          {/* Rating Card - First */}
          <AgentRating agentId={agent.id} />

          {/* Process Steps Card */}
          <AgentProcessSteps slug={template.slug} />

          {/* Where this agent shines */}
          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
            <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">Where this agent shines</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">{template.useCase}</p>
          </div>

          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
              <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">Activity log</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          }>
            <AgentActivityLog agentSlug={template.slug} />
          </Suspense>

          {/* Built for */}
          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
            <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">Built for</div>
            <div className="flex flex-wrap gap-2">
              {template.persona.split(' · ').map((persona: string, index: number) => (
                <span
                  key={`${template.slug}-persona-${index}`}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-xs font-medium text-blue-600 dark:text-blue-400"
                >
                  {persona}
                </span>
              ))}
            </div>
          </div>

          {/* Buttons Card - Hidden
          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
            <div className="space-y-3">
              <button className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                Use this agent
              </button>
              <button className="btn w-full border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300">
                Share with team
              </button>
            </div>
          </div>
          */}

          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
            <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-3">Tags</div>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag: string) => (
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
      
      {/* Sticky Feedback Component */}
      <AgentFeedback agentId={agent.id} />
    </div>
  )
}

