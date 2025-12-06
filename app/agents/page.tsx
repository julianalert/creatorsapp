import CustomHeader from '@/components/ui/custom-header'
import TemplatesBrowser from '@/app/(default)/outreach/templates/templates-browser'
import { outreachTemplates } from '@/app/(default)/outreach/templates/template-data'

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

export default function AgentsPage() {
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
        <TemplatesBrowser templates={outreachTemplates} categories={agentCategories} />
      </main>
    </div>
  )
}

