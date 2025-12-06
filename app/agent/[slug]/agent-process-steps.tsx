type AgentProcessStepsProps = {
  slug: string
}

export default function AgentProcessSteps({ slug }: AgentProcessStepsProps) {
  const renderStep = (stepNumber: number, title: string, description: string) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold">
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
          {renderStep(1, 'Input', 'Enter your topic, industry, or competitor URL along with target audience demographics, geographic focus, and content type.')}
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

  // Paid Ads Campaign Optimizer
  if (slug === 'paid-ads-campaign-optimizer') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Campaign Data', 'Connect ad accounts or upload performance data including ad platform, campaign metrics, target ROAS/CPA goals, budget constraints, audience segments, and time period.')}
          {renderStep(2, 'Performance Analysis', 'Agent analyzes ad performance across all dimensions including creative performance, keyword efficiency, audience targeting, landing page conversions, bid strategy, day/time patterns, and device/location performance.')}
          {renderStep(3, 'Action Plan', 'Receive prioritized recommendations with pause/promote suggestions, bid adjustments, audience expansion opportunities, creative refresh recommendations, budget reallocation plan, A/B test hypotheses, and expected improvements.')}
        </div>
      </div>
    )
  }

  // Creator Outreach Assistant
  if (slug === 'creator-outreach-assistant') {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700/40">
        <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold mb-4">How it works</div>
        <div className="space-y-4">
          {renderStep(1, 'Creator Criteria', 'Define your ideal creator profile including niche/topics, follower range, engagement rate minimum, audience demographics, content style preferences, and platform focus.')}
          {renderStep(2, 'Discovery & Analysis', 'Agent finds and analyzes potential creators by searching and filtering by criteria, analyzing engagement rates and authenticity, reviewing content quality and brand fit, checking demographics, and scoring creators by fit.')}
          {renderStep(3, 'Outreach Campaign', 'Receive personalized messages and campaign plan including ranked creator list with scores, personalized outreach messages, follow-up sequence templates, campaign tracking spreadsheet, response rate predictions, and partnership proposal templates.')}
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

