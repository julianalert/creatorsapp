type AgentProcessStepsProps = {
  slug: string
}

export default function AgentProcessSteps({ slug }: AgentProcessStepsProps) {
  const renderStep = (stepNumber: number, title: string, description: string) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          {stepNumber}
        </span>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )

  // Keyword Research
  if (slug === 'keyword-research') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Input', 'Enter your topic, industry, or competitor URL along with target audience demographics, geographic focus, and content type')}
          {renderStep(2, 'Analysis', 'Agent analyzes search volume, competition, and intent to generate comprehensive keyword insights including long-tail opportunities and competitor comparisons.')}
          {renderStep(3, 'Output', 'Receive organized keyword clusters with top 50-100 recommendations, search intent classification, competition analysis, content gap opportunities, and priority scoring.')}
        </div>
      </div>
    )
  }

  // On-Page SEO Audit
  if (slug === 'on-page-seo-audit') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'URL Input', 'Enter the URL(s) you want to audit')}
          {renderStep(2, 'Deep Analysis', 'Agent crawls and analyzes all on-page elements including title tags, headers, images, links, page speed, mobile responsiveness, schema markup, and content quality.')}
          {renderStep(3, 'Action Plan', 'Receive prioritized recommendations with critical issues, important improvements, nice-to-have optimizations, before/after comparisons, impact scores, and an implementation checklist.')}
        </div>
      </div>
    )
  }

  // Conversion Rate Optimizer
  if (slug === 'conversion-rate-optimizer') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Funnel Mapping', 'Define your conversion funnel and goals including conversion type, funnel steps, current conversion rates, traffic sources, and user segments.')}
          {renderStep(2, 'Behavior Analysis', 'Agent analyzes user paths and drop-off points including time spent, click patterns, form abandonment, mobile vs desktop behavior, and A/B test results.')}
          {renderStep(3, 'Optimization Plan', 'Receive prioritized recommendations with high-impact quick wins, UX improvements, copy optimizations, trust signals, form simplifications, mobile fixes, and A/B test hypotheses.')}
        </div>
      </div>
    )
  }

  // Blog Content Plan Generator
  if (slug === 'blog-content-plan-generator') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Strategy Input', 'Define your content goals and audience including target personas, content objectives, industry focus, competitor blogs, existing content inventory, and publishing frequency.')}
          {renderStep(2, 'Topic Generation', 'Agent generates topic clusters and content ideas including pillar topics, content gaps, buyer journey mapping, seasonal topics, SEO potential, and authority-building clusters.')}
          {renderStep(3, 'Editorial Calendar', 'Receive organized content calendar with 3-month plan, topic priorities and SEO scores, content briefs with key points, suggested publishing dates, internal linking opportunities, and repurposing ideas.')}
        </div>
      </div>
    )
  }

  // Blog Post Writer
  if (slug === 'blog-post-writer') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Content Brief', 'Provide topic, audience, and requirements including blog post topic or title, target audience, tone and style preferences, desired word count, key points to cover, and SEO keywords.')}
          {renderStep(2, 'Content Generation', 'Agent writes the blog post with SEO optimization, creating engaging introduction, structured content with headings, relevant examples and data, and compelling conclusion.')}
          {renderStep(3, 'Final Output', 'Receive complete blog post ready to publish including SEO-optimized title and meta description, proper formatting with headings, internal linking suggestions, call-to-action recommendations, and ready-to-publish format.')}
        </div>
      </div>
    )
  }

  // Image Generator
  if (slug === 'image-generator') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Image Description', 'Provide image description and requirements including detailed prompt, style preferences, dimensions or aspect ratio, number of images, and additional requirements like colors or mood.')}
          {renderStep(2, 'Image Generation', 'Agent generates high-quality custom images by analyzing your description, applying style preferences, optimizing for quality and clarity, and creating variations if requested.')}
          {renderStep(3, 'Final Output', 'Receive your custom images ready to use including high-quality generated images, multiple variations, images in requested dimensions, download-ready format, and usage recommendations.')}
        </div>
      </div>
    )
  }

  // Contact Researcher
  if (slug === 'contact-researcher') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Research Parameters', 'Provide company or person details including company name or website, person name and title, industry or niche, location, and contact type needed.')}
          {renderStep(2, 'Contact Research', 'Agent searches and verifies contact information by searching company websites and directories, finding email addresses and phone numbers, locating LinkedIn and social profiles, and verifying accuracy.')}
          {renderStep(3, 'Contact Report', 'Receive verified contact information including email addresses, phone numbers, LinkedIn profiles, social media links, company information, verification status, and alternative contacts.')}
        </div>
      </div>
    )
  }

  // Company Researcher
  if (slug === 'company-researcher') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Company Input', 'Provide company name or website including company name, website URL, industry focus, research depth level, and specific information needed.')}
          {renderStep(2, 'Company Research', 'Agent gathers and analyzes company data by finding company website and basic info, researching funding and financial data, identifying team size and key employees, discovering technologies used, analyzing market position, and gathering recent news.')}
          {renderStep(3, 'Company Report', 'Receive comprehensive company profile including company overview, funding information, team size and key personnel, technology stack, market position and competitors, recent news, social media profiles, and contact information.')}
        </div>
      </div>
    )
  }

  // Competitor Analyst
  if (slug === 'competitor-analyst') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Competitor Input', 'Provide competitor information and analysis scope including competitor company names or websites, your company/product for context, analysis focus areas, market segment, and geographic scope.')}
          {renderStep(2, 'Competitive Analysis', 'Agent analyzes competitors across multiple dimensions by researching products and services, analyzing pricing strategies, comparing features and capabilities, reviewing marketing and positioning, examining market share, and identifying strengths and weaknesses.')}
          {renderStep(3, 'Competitive Report', 'Receive detailed competitive analysis including competitive landscape overview, feature comparison matrix, pricing analysis, positioning map, strengths and weaknesses assessment, market opportunities, and strategic recommendations.')}
        </div>
      </div>
    )
  }

  // Welcome Email Sequence Writer
  if (slug === 'welcome-email-sequence-writer') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Website Analysis', 'Enter your website URL and sequence settings including number of emails, timeframe, primary and secondary CTAs, email format preference, and personalization tokens needed.')}
          {renderStep(2, 'Content Analysis', 'Agent scrapes and analyzes your website content to extract product positioning, value proposition, target audience information, key features and benefits, brand voice and tone, and onboarding goals.')}
          {renderStep(3, 'Sequence Generation', 'Agent generates complete email sequence with subject lines, preview text, email body content, clear CTAs, personalization tokens, and sequence strategy explanation.')}
          {renderStep(4, 'Final Output', 'Receive ready-to-use email sequence with complete emails (3-6), subject line options for each, preview text, full email body with CTAs, sequence strategy explanation, and ready to import into your email platform.')}
        </div>
      </div>
    )
  }

  // Default for other agents
  return (
    <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
      <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Process steps coming soon...</p>
    </div>
  )
}

