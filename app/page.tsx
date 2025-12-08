import CustomHeader from '@/components/ui/custom-header'
import TemplatesBrowser from '@/app/(default)/outreach/templates/templates-browser'
import { createClient } from '@/lib/supabase/server'

const agentCategories = [
  'SEO',
  'Sales',
  'Content Marketing',
  'Paid Ads',
  'Creator Marketing',
  'Business/Strategy',
  'Miscellaneous'
]

export const metadata = {
  title: 'AI Agents for Marketing - Mosaic',
  description: 'Page description',
}

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch agents from Supabase
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // Transform agents to match the template format
  const templates = (agents || []).map((agent) => ({
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
  }))

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
