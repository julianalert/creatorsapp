import CustomHeader from '@/components/ui/custom-header'
import TemplatesBrowser from '@/app/(default)/outreach/templates/templates-browser'
import { createClient } from '@/lib/supabase/server'

const agentCategories = [
  'SEO',
  'Sales',
  'Content Marketing',
  'Email Marketing',
  'Paid Ads',
  'Creator Marketing',
  'Business/Strategy',
  'Miscellaneous'
]

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

export const metadata = {
  title: 'AI Agents for Marketing',
  description: 'Discover powerful AI agents for SEO, sales, content marketing, paid ads, and creator marketing. Pre-made, ready-to-use and fully customizable agents to supercharge your marketing efforts.',
  openGraph: {
    title: 'AI Agents for Marketing | Yuzuu',
    description: 'Discover powerful AI agents for SEO, sales, content marketing, paid ads, and creator marketing. Pre-made, ready-to-use and fully customizable agents to supercharge your marketing efforts.',
    url: '/',
    siteName: 'Yuzuu',
    images: [
      {
        url: '/images/thubmnail.png',
        width: 1200,
        height: 630,
        alt: 'Yuzuu - AI Agents for Marketing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agents for Marketing | Yuzuu',
    description: 'Discover powerful AI agents for SEO, sales, content marketing, paid ads, and creator marketing. Pre-made, ready-to-use and fully customizable agents to supercharge your marketing efforts.',
    images: ['/images/thubmnail.png'],
  },
}

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch agents from Supabase
  // Only show active agents that are not coming soon
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true)
    .eq('coming_soon', false)
    .order('created_at', { ascending: true })

  // Transform agents to match the template format
  const templates = (agents || [])
    .map((agent) => ({
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
      credits: agent.credits || 1,
      ratingAverage: Number(agent.rating_average) || 0,
      ratingCount: agent.rating_count || 0,
      hasInterface: WORKING_AGENTS.includes(agent.slug),
    }))
    // Sort: working agents first, then by created_at
    .sort((a, b) => {
      // First, sort by hasInterface (working ones first)
      if (a.hasInterface !== b.hasInterface) {
        return a.hasInterface ? -1 : 1
      }
      // Then sort by created_at (older first, maintaining original order)
      return 0
    })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Custom Header */}
      <CustomHeader />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[128rem] mx-auto">
        {/* Page header */}
        <div className="sm:flex sm:justify-between sm:items-center mb-5">
          {/* Left: Title */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">AI Agents for Marketing</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pre-made, ready-to-use and fully customizable ai agents for marketing. No fluff. Just laser focused agents helping you every day.             </p>
          </div>
        </div>

        {/* Templates Browser */}
        <TemplatesBrowser templates={templates} categories={agentCategories} />
      </main>
    </div>
  )
}
