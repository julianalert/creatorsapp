import type { StaticImageData } from 'next/image'

import TemplateHero1 from '@/public/images/meetup-image.jpg'
import TemplateHero2 from '@/public/images/meetup-photo-01.jpg'
import TemplateHero3 from '@/public/images/meetup-photo-02.jpg'
import TemplateThumb1 from '@/public/images/meetups-thumb-01.jpg'
import TemplateThumb2 from '@/public/images/meetups-thumb-02.jpg'
import TemplateThumb3 from '@/public/images/meetups-thumb-03.jpg'

export type TemplateStat = {
  label: string
  value: string
}

export type TemplateSequenceStep = {
  step: string
  channel: string
  timing: string
  objective: string
  copy: string
}

export type TemplateSample = {
  label: string
  subject: string
  body: string
}

export type TemplateInsight = {
  label: string
  description: string
}

export type OutreachTemplate = {
  slug: string
  title: string
  summary: string
  category: string
  useCase: string
  persona: string
  thumbnail: StaticImageData
  heroImage: StaticImageData
  stats: TemplateStat[]
  sequence: TemplateSequenceStep[]
  samples: TemplateSample[]
  insights: TemplateInsight[]
  tags: string[]
}

export const outreachTemplates: OutreachTemplate[] = [
  {
    slug: 'keyword-research',
    title: 'Keyword Research',
    summary:
      'AI-powered keyword research agent that identifies high-value keywords, analyzes search intent, and provides competitive insights to boost your SEO strategy.',
    category: 'SEO',
    useCase: 'Use when starting a new content campaign, optimizing existing pages, or expanding into new topic areas.',
    persona: 'SEO Specialist · Content Marketer · Marketing Manager',
    thumbnail: TemplateThumb1,
    heroImage: TemplateHero1,
    stats: [
      { label: 'Keywords analyzed', value: '500+ per run' },
      { label: 'Time saved', value: '4-6 hours' },
      { label: 'Output format', value: 'CSV + Report' },
    ],
    sequence: [
      {
        step: 'Step 1 · Input',
        channel: 'Agent Interface',
        timing: 'Enter your topic, industry, or competitor URL.',
        objective: 'Define the research scope and target audience.',
        copy:
          'Input your research parameters:\n• Primary topic or niche\n• Target audience demographics\n• Competitor URLs (optional)\n• Geographic focus\n• Content type (blog, product page, etc.)',
      },
      {
        step: 'Step 2 · Analysis',
        channel: 'AI Processing',
        timing: 'Agent analyzes search volume, competition, and intent.',
        objective: 'Generate comprehensive keyword insights.',
        copy:
          'The agent will:\n• Extract seed keywords from your input\n• Analyze search volume and difficulty\n• Identify long-tail opportunities\n• Map search intent (informational, commercial, transactional)\n• Compare with competitor keywords',
      },
      {
        step: 'Step 3 · Output',
        channel: 'Results Dashboard',
        timing: 'Receive organized keyword clusters and recommendations.',
        objective: 'Get actionable keyword strategy.',
        copy:
          'You\'ll receive:\n• Top 50-100 keyword recommendations\n• Keyword clusters by topic\n• Search intent classification\n• Competition analysis\n• Content gap opportunities\n• Priority scoring (high/medium/low)',
      },
    ],
    samples: [
      {
        label: 'Sample Output',
        subject: 'Keyword Research Report: SaaS Project Management',
        body:
          'Primary Keywords:\n• project management software (12K/mo, Medium difficulty)\n• team collaboration tools (8K/mo, Low difficulty)\n• task management app (6K/mo, Medium difficulty)\n\nLong-tail Opportunities:\n• best project management software for small teams (1.2K/mo, Low difficulty)\n• free project management tools comparison (800/mo, Low difficulty)',
      },
    ],
    insights: [
      {
        label: 'Why it works',
        description:
          'Automates the time-consuming process of keyword research while providing data-driven insights that align with search intent and business goals.',
      },
      {
        label: 'Best practices',
        description: 'Focus on keywords with medium competition and clear search intent. Prioritize long-tail keywords for faster wins.',
      },
    ],
    tags: ['SEO', 'Keyword Research', 'Content Strategy', 'Automation'],
  },
  {
    slug: 'on-page-seo-audit',
    title: 'On-Page SEO Audit',
    summary:
      'Comprehensive on-page SEO audit agent that analyzes technical SEO, content optimization, and provides actionable recommendations to improve search rankings.',
    category: 'SEO',
    useCase: 'Use before launching new pages, optimizing existing content, or conducting regular SEO health checks.',
    persona: 'SEO Manager · Web Developer · Content Manager',
    thumbnail: TemplateThumb2,
    heroImage: TemplateHero2,
    stats: [
      { label: 'Pages audited', value: 'Unlimited' },
      { label: 'Checks performed', value: '50+ factors' },
      { label: 'Report time', value: '2-5 minutes' },
    ],
    sequence: [
      {
        step: 'Step 1 · URL Input',
        channel: 'Agent Interface',
        timing: 'Enter the URL(s) you want to audit.',
        objective: 'Define the audit scope.',
        copy:
          'Provide:\n• Single URL or bulk list\n• Target keywords (optional)\n• Competitor URLs (optional)\n• Focus areas (technical, content, links)',
      },
      {
        step: 'Step 2 · Deep Analysis',
        channel: 'AI Processing',
        timing: 'Agent crawls and analyzes all on-page elements.',
        objective: 'Identify SEO issues and opportunities.',
        copy:
          'The agent checks:\n• Title tags and meta descriptions\n• Header structure (H1-H6)\n• Image alt text and optimization\n• Internal linking structure\n• Page speed and Core Web Vitals\n• Mobile responsiveness\n• Schema markup\n• Content quality and keyword usage',
      },
      {
        step: 'Step 3 · Action Plan',
        channel: 'Audit Report',
        timing: 'Receive prioritized recommendations.',
        objective: 'Get clear next steps to improve SEO.',
        copy:
          'Your report includes:\n• Critical issues (fix immediately)\n• Important improvements (high priority)\n• Nice-to-have optimizations\n• Before/after comparisons\n• Estimated impact scores\n• Implementation checklist',
      },
    ],
    samples: [
      {
        label: 'Sample Finding',
        subject: 'Critical Issue: Missing H1 Tag',
        body:
          'Issue: Page lacks a primary H1 heading.\nImpact: High - Search engines rely on H1 for page topic understanding.\nFix: Add an H1 tag with your primary keyword within the first 100 words.\nExample: <h1>Best Project Management Software for Teams</h1>',
      },
    ],
    insights: [
      {
        label: 'Why it works',
        description:
          'Systematically identifies SEO issues that are easy to miss, providing a comprehensive view of on-page optimization opportunities.',
      },
      {
        label: 'ROI focus',
        description: 'Prioritizes fixes by potential impact, helping you focus on changes that will move the needle fastest.',
      },
    ],
    tags: ['SEO', 'Technical SEO', 'Content Optimization', 'Audit'],
  },
  {
    slug: 'conversion-rate-optimizer',
    title: 'Conversion Rate Optimizer',
    summary:
      'AI agent that analyzes user behavior, identifies conversion barriers, and provides data-driven recommendations to improve conversion rates across your funnel.',
    category: 'Business/Strategy',
    useCase: 'Use when conversion rates are below industry benchmarks, launching new landing pages, or optimizing existing funnels.',
    persona: 'Growth Marketer · Product Manager · CRO Specialist',
    thumbnail: TemplateThumb3,
    heroImage: TemplateHero3,
    stats: [
      { label: 'Funnel analyzed', value: 'End-to-end' },
      { label: 'Optimization areas', value: '20+ factors' },
      { label: 'Expected lift', value: '15-30%' },
    ],
    sequence: [
      {
        step: 'Step 1 · Funnel Mapping',
        channel: 'Agent Interface',
        timing: 'Define your conversion funnel and goals.',
        objective: 'Establish the optimization framework.',
        copy:
          'Input:\n• Conversion goal (signup, purchase, download)\n• Funnel steps (awareness → consideration → decision)\n• Current conversion rates per step\n• Traffic sources\n• User segments',
      },
      {
        step: 'Step 2 · Behavior Analysis',
        channel: 'AI Processing',
        timing: 'Agent analyzes user paths and drop-off points.',
        objective: 'Identify conversion barriers.',
        copy:
          'The agent examines:\n• Drop-off rates at each funnel stage\n• Time spent on key pages\n• Click patterns and heatmaps\n• Form abandonment points\n• Mobile vs desktop behavior\n• A/B test results (if available)',
      },
      {
        step: 'Step 3 · Optimization Plan',
        channel: 'CRO Report',
        timing: 'Receive prioritized optimization recommendations.',
        objective: 'Get actionable steps to improve conversions.',
        copy:
          'Your plan includes:\n• High-impact quick wins\n• UX improvements\n• Copy and messaging optimizations\n• Trust signals and social proof\n• Form simplification suggestions\n• Mobile optimization fixes\n• A/B test hypotheses',
      },
    ],
    samples: [
      {
        label: 'Sample Recommendation',
        subject: 'Quick Win: Add Trust Badge',
        body:
          'Issue: Checkout page lacks trust signals.\nImpact: Medium-High - 23% of users abandon at checkout.\nRecommendation: Add security badges, customer count, and money-back guarantee.\nExpected Lift: +8-12% conversion rate.\nImplementation: 15 minutes',
      },
    ],
    insights: [
      {
        label: 'Why it works',
        description:
          'Takes a holistic view of the conversion funnel, identifying both obvious and subtle barriers that impact user decision-making.',
      },
      {
        label: 'Data-driven approach',
        description: 'Prioritizes recommendations based on potential impact and implementation effort, maximizing ROI on optimization work.',
      },
    ],
    tags: ['CRO', 'Conversion Optimization', 'UX', 'Growth'],
  },
  {
    slug: 'blog-content-plan-generator',
    title: 'Blog Content Plan Generator',
    summary:
      'AI agent that generates comprehensive content plans, topic clusters, and editorial calendars to drive organic traffic and engage your target audience.',
    category: 'Content Marketing',
    useCase: 'Use when planning quarterly content strategy, launching a new blog, or expanding content production.',
    persona: 'Content Manager · Marketing Director · SEO Specialist',
    thumbnail: TemplateThumb1,
    heroImage: TemplateHero1,
    stats: [
      { label: 'Topics generated', value: '50-100 per plan' },
      { label: 'Planning time', value: '30-60 minutes' },
      { label: 'Calendar format', value: 'Quarterly' },
    ],
    sequence: [
      {
        step: 'Step 1 · Strategy Input',
        channel: 'Agent Interface',
        timing: 'Define your content goals and audience.',
        objective: 'Set the foundation for content planning.',
        copy:
          'Provide:\n• Target audience personas\n• Content goals (traffic, leads, engagement)\n• Industry/niche focus\n• Competitor blogs to analyze\n• Existing content inventory\n• Publishing frequency',
      },
      {
        step: 'Step 2 · Topic Generation',
        channel: 'AI Processing',
        timing: 'Agent generates topic clusters and content ideas.',
        objective: 'Create a comprehensive content roadmap.',
        copy:
          'The agent will:\n• Generate pillar topics and supporting content\n• Identify content gaps vs competitors\n• Map topics to buyer journey stages\n• Suggest seasonal and trending topics\n• Calculate SEO potential for each topic\n• Create topic clusters for authority building',
      },
      {
        step: 'Step 3 · Editorial Calendar',
        channel: 'Content Plan',
        timing: 'Receive organized content calendar and briefs.',
        objective: 'Get ready-to-execute content plan.',
        copy:
          'Your plan includes:\n• 3-month editorial calendar\n• Topic priorities and SEO scores\n• Content briefs with key points\n• Suggested publishing dates\n• Internal linking opportunities\n• Content repurposing ideas',
      },
    ],
    samples: [
      {
        label: 'Sample Content Brief',
        subject: 'Topic: "10 Project Management Tools for Remote Teams"',
        body:
          'Target Keyword: project management tools remote teams (2.4K/mo)\nSEO Score: 8/10\nBuyer Stage: Consideration\n\nKey Points:\n• Compare top 10 tools with pros/cons\n• Include pricing comparison table\n• Add use case recommendations\n• Link to free trial pages\n\nInternal Links:\n• Link to "Remote Team Collaboration Guide"\n• Link to "Productivity Tips for Remote Work"',
      },
    ],
    insights: [
      {
        label: 'Why it works',
        description:
          'Creates a strategic content plan that balances SEO opportunities with audience needs, ensuring every piece serves a purpose.',
      },
      {
        label: 'Cluster approach',
        description: 'Organizes content into topic clusters to build topical authority and improve overall domain ranking.',
      },
    ],
    tags: ['Content Marketing', 'Editorial Planning', 'SEO', 'Strategy'],
  },
  {
    slug: 'paid-ads-campaign-optimizer',
    title: 'Paid Ads Campaign Optimizer',
    summary:
      'AI agent that analyzes ad performance, identifies optimization opportunities, and provides recommendations to improve ROAS and lower acquisition costs.',
    category: 'Paid Ads',
    useCase: 'Use when campaigns are underperforming, scaling successful campaigns, or optimizing ad spend allocation.',
    persona: 'PPC Manager · Performance Marketer · Growth Hacker',
    thumbnail: TemplateThumb2,
    heroImage: TemplateHero2,
    stats: [
      { label: 'Campaigns analyzed', value: 'Unlimited' },
      { label: 'Metrics tracked', value: '15+ KPIs' },
      { label: 'Optimization areas', value: '10+ factors' },
    ],
    sequence: [
      {
        step: 'Step 1 · Campaign Data',
        channel: 'Agent Interface',
        timing: 'Connect ad accounts or upload performance data.',
        objective: 'Provide campaign context for analysis.',
        copy:
          'Input:\n• Ad platform (Google Ads, Meta, LinkedIn, etc.)\n• Campaign performance data\n• Target ROAS/CPA goals\n• Budget constraints\n• Audience segments\n• Time period for analysis',
      },
      {
        step: 'Step 2 · Performance Analysis',
        channel: 'AI Processing',
        timing: 'Agent analyzes ad performance across all dimensions.',
        objective: 'Identify optimization opportunities.',
        copy:
          'The agent examines:\n• Ad creative performance (CTR, engagement)\n• Keyword/ad group efficiency\n• Audience targeting effectiveness\n• Landing page conversion rates\n• Bid strategy optimization\n• Day/time performance patterns\n• Device and location performance',
      },
      {
        step: 'Step 3 · Action Plan',
        channel: 'Optimization Report',
        timing: 'Receive prioritized recommendations.',
        objective: 'Get clear steps to improve campaign performance.',
        copy:
          'Your report includes:\n• Pause/promote recommendations\n• Bid adjustment suggestions\n• Audience expansion opportunities\n• Creative refresh recommendations\n• Budget reallocation plan\n• A/B test hypotheses\n• Expected performance improvements',
      },
    ],
    samples: [
      {
        label: 'Sample Recommendation',
        subject: 'High-Impact: Pause Underperforming Ad Groups',
        body:
          'Finding: 3 ad groups have 0 conversions in last 30 days.\nImpact: High - Freeing up $2,400/month budget.\nAction: Pause these ad groups and reallocate budget to top performers.\nExpected Result: +18% overall ROAS improvement.\nRisk: Low - These ad groups show no signs of improvement.',
      },
    ],
    insights: [
      {
        label: 'Why it works',
        description:
          'Systematically identifies underperforming elements and optimization opportunities that can significantly impact ROAS with minimal effort.',
      },
      {
        label: 'Data-driven decisions',
        description: 'Removes guesswork from campaign optimization by providing clear, prioritized recommendations based on performance data.',
      },
    ],
    tags: ['Paid Ads', 'PPC', 'ROAS Optimization', 'Performance Marketing'],
  },
  {
    slug: 'creator-outreach-assistant',
    title: 'Creator Outreach Assistant',
    summary:
      'AI agent that identifies ideal creators, personalizes outreach messages, and manages follow-ups to build authentic creator partnerships at scale.',
    category: 'Creator Marketing',
    useCase: 'Use when launching creator campaigns, building brand awareness, or scaling influencer partnerships.',
    persona: 'Creator Manager · Brand Marketer · Partnership Lead',
    thumbnail: TemplateThumb3,
    heroImage: TemplateHero3,
    stats: [
      { label: 'Creators identified', value: '100+ per search' },
      { label: 'Outreach personalized', value: '100%' },
      { label: 'Response rate', value: '35-45%' },
    ],
    sequence: [
      {
        step: 'Step 1 · Creator Criteria',
        channel: 'Agent Interface',
        timing: 'Define your ideal creator profile.',
        objective: 'Set parameters for creator discovery.',
        copy:
          'Input:\n• Niche/topics of interest\n• Follower range (micro, macro, mega)\n• Engagement rate minimum\n• Audience demographics\n• Content style preferences\n• Platform focus (Instagram, TikTok, YouTube)',
      },
      {
        step: 'Step 2 · Discovery & Analysis',
        channel: 'AI Processing',
        timing: 'Agent finds and analyzes potential creators.',
        objective: 'Generate qualified creator list.',
        copy:
          'The agent will:\n• Search and filter creators by criteria\n• Analyze engagement rates and authenticity\n• Review content quality and brand fit\n• Check audience demographics\n• Identify contact information\n• Score creators by fit (1-10)',
      },
      {
        step: 'Step 3 · Outreach Campaign',
        channel: 'Outreach Dashboard',
        timing: 'Receive personalized messages and campaign plan.',
        objective: 'Launch effective creator outreach.',
        copy:
          'You\'ll receive:\n• Ranked creator list with scores\n• Personalized outreach messages\n• Follow-up sequence templates\n• Campaign tracking spreadsheet\n• Response rate predictions\n• Partnership proposal templates',
      },
    ],
    samples: [
      {
        label: 'Sample Outreach Message',
        subject: 'Personalized Creator Outreach',
        body:
          'Hi {{creator_name}},\n\nLoved your recent post about {{topic}} - your take on {{specific_point}} really resonated with our team.\n\nWe\'re {{brand_name}}, and we help {{target_audience}} with {{value_prop}}. We think your audience would love what we\'re building.\n\nWould you be open to a quick 15-min call to explore a potential partnership? We\'d love to share what we\'re working on and see if there\'s a fit.\n\nBest,\n{{sender_name}}',
      },
    ],
    insights: [
      {
        label: 'Why it works',
        description:
          'Combines data-driven creator discovery with personalized outreach, ensuring you connect with the right creators in an authentic way.',
      },
      {
        label: 'Scale with quality',
        description: 'Enables you to reach out to many creators while maintaining personalization that drives higher response rates.',
      },
    ],
    tags: ['Creator Marketing', 'Influencer Outreach', 'Partnerships', 'Automation'],
  },
]

export const outreachTemplateCount = outreachTemplates.length

export const outreachTemplateMap = outreachTemplates.reduce<Record<string, OutreachTemplate>>((acc, template) => {
  acc[template.slug] = template
  return acc
}, {})

export const getTemplateBySlug = (slug: string) => outreachTemplateMap[slug]

export const getRelatedTemplates = (slug: string, limit = 2) =>
  outreachTemplates.filter((template) => template.slug !== slug).slice(0, limit)

export const outreachTemplateCategories = Array.from(
  new Set(outreachTemplates.map((template) => template.category))
)

