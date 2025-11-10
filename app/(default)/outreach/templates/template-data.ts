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
    slug: 'warm-partnership-intro',
    title: 'Warm Partnership Introduction Sequence',
    summary:
      'Leverage a mutual connection to open a partnership conversation with a mid-market brand manager. Includes email, LinkedIn DM, and follow-up checklist.',
    category: 'Warm outreach',
    useCase: 'Use when a partner intro is offered or you already engage with their content.',
    persona: 'Brand Marketing Manager · Mid-market SaaS',
    thumbnail: TemplateThumb1,
    heroImage: TemplateHero1,
    stats: [
      { label: 'Avg. reply rate', value: '48%' },
      { label: 'Time to complete', value: '3 days' },
      { label: 'Channels', value: 'Email + LinkedIn' },
    ],
    sequence: [
      {
        step: 'Step 1 · Day 0',
        channel: 'Email',
        timing: 'Send immediately after warm intro lands in inbox.',
        objective: 'Anchor your credibility and articulate the win-win.',
        copy:
          'Hi {{first_name}},\n\nAppreciate {{connector_name}} looping us in—{{connector_pronoun}} knows how obsessed we are with building creator partnerships that feel co-owned.\n\nIn 2024 we helped {{example_partner}} activate 37 creators without adding headcount. Could we trade notes on what your Q1 pipeline looks like?\n\nIf next Tuesday afternoon works, I’ll send a calendar hold.\n\n– {{sender_name}}',
      },
      {
        step: 'Step 2 · Day 2',
        channel: 'LinkedIn DM',
        timing: 'Use once the email has been opened but not answered.',
        objective: 'Keep momentum with a low-friction ask.',
        copy:
          'Hey {{first_name}} — just dropped you a note via email after {{connector_name}}’s intro. TL;DR we can stand up curated creator campaigns fast (example attached in the email). Worth a quick sync?',
      },
      {
        step: 'Step 3 · Day 4',
        channel: 'Email follow-up',
        timing: 'Reply to original thread with resource.',
        objective: 'Reinforce value with a tangible next step.',
        copy:
          'Quick follow-up in case the timing is tight.\n\nSharing a dashboard preview that shows how we score-match creators (1-min loom). Would a 20-min audit of your current brief help?\n\nIf not, happy to circle back when your next launch is closer.',
      },
    ],
    samples: [
      {
        label: 'Calendar hold blurb',
        subject: 'Creator pipeline audit — {{brand_name}}',
        body:
          'Agenda:\n• Review current creator mix and upcoming pushes\n• See how we qualify and score-match creators\n• Outline pilot in <30 days\n\nLet me know if you’d like anyone else looped in.',
      },
    ],
    insights: [
      {
        label: 'Why it works',
        description:
          'Warm intros collapse trust-building time. Pair them with a concrete outcome (audit, preview, playbook) so the next step feels obvious.',
      },
      {
        label: 'Proof to mention',
        description: 'Reference a recent activation that mirrors their ICP—number of creators, timeline, and headline result.',
      },
    ],
    tags: ['Partnerships', 'Email', 'LinkedIn', 'B2B'],
  },
  {
    slug: 'cold-creator-activation',
    title: 'Cold Creator Activation Sprint',
    summary:
      'Three-touch cold sequence to recruit emerging creators for product trials. Works well for marketplaces and consumer apps with social proof assets.',
    category: 'Cold outreach',
    useCase: 'Use when you have zero relationship but can offer early access or meaningful perks.',
    persona: 'Lifestyle Creator · 10K-50K followers',
    thumbnail: TemplateThumb2,
    heroImage: TemplateHero2,
    stats: [
      { label: 'Avg. opt-in rate', value: '32%' },
      { label: 'Time to complete', value: '5 days' },
      { label: 'Channels', value: 'Email-first + IG DM' },
    ],
    sequence: [
      {
        step: 'Step 1 · Day 0',
        channel: 'Email',
        timing: 'Send in the morning mid-week.',
        objective: 'Spark curiosity with personalized proof point.',
        copy:
          'Subject: {{creator_handle}} × {{brand_name}}\n\nHey {{first_name}}, saw your recent series on {{topic}}—our team is curating 15 creators for a beta of {{product}} that pays in both $$ and exclusive collabs.\n\nYou’d get:\n• $750 creator stipend\n• Early access before public launch\n• Studio support for your first drop\n\nWorth sending the 2-min brief?',
      },
      {
        step: 'Step 2 · Day 2',
        channel: 'Instagram DM',
        timing: 'Nudge once email goes unopened.',
        objective: 'Surface in creator’s daily workflow.',
        copy:
          '👋 {{first_name}}! Sent details via email about the {{brand_name}} beta collab—slots are going fast but I think your audience would vibe. Want me to resend here?',
      },
      {
        step: 'Step 3 · Day 5',
        channel: 'Email follow-up',
        timing: 'Reply-all with social proof.',
        objective: 'Handle common objections (time, trust, compensation).',
        copy:
          'Looping back with a quick snapshot of the first creators live in the beta (attached). We handle product shipping, briefing, and posting timeline—it’s a low lift.\n\nIf timing is off, would love to keep you posted on the next cohort.',
      },
    ],
    samples: [
      {
        label: 'Creator brief teaser',
        subject: 'The 2-min beta rundown',
        body:
          'Inside:\n• Compensation structure\n• Timeline + creative guardrails\n• How we measure success (+ what we promote)\n\nLet me know if you want the full doc here or via email.',
      },
    ],
    insights: [
      {
        label: 'Lead with value',
        description: 'Explicitly list compensation and perks to overcome cold outreach friction.',
      },
      {
        label: 'Keep the ask tiny',
        description: 'First decision should only be “yes, send me the brief”—not signing a contract.',
      },
    ],
    tags: ['Creator recruitment', 'Email', 'Instagram DM', 'Consumer'],
  },
  {
    slug: 'product-launch-nurture',
    title: 'Product Launch Nurture Playbook',
    summary:
      'Four-part drip that turns waitlist subscribers into launch advocates. Includes announcements, education touchpoints, and conversion booster.',
    category: 'Drip sequence',
    useCase: 'Use for major feature or product launches with at least two weeks runway.',
    persona: 'Waitlist Subscriber · SaaS power user',
    thumbnail: TemplateThumb3,
    heroImage: TemplateHero3,
    stats: [
      { label: 'Avg. open rate', value: '62%' },
      { label: 'Time to complete', value: '10 days' },
      { label: 'Channels', value: 'Email-only' },
    ],
    sequence: [
      {
        step: 'Step 1 · Day 0',
        channel: 'Email',
        timing: 'Immediately after launch teaser goes live.',
        objective: 'Announce availability and set expectations.',
        copy:
          'Subject: It’s live — {{product_name}} is ready for you 🎉\n\n{{first_name}}, the wait is over.\n\nInside your dashboard:\n1. Activate the new {{feature}}\n2. Join the private walkthrough (spots limited)\n3. Earn 25% off annual when you launch this week\n\nHit reply with questions, or grab a spot in the live session here → {{meeting_link}}',
      },
      {
        step: 'Step 2 · Day 3',
        channel: 'Email',
        timing: 'After first cohort attends the walkthrough.',
        objective: 'Share proof and overcome objections.',
        copy:
          'Subject: How teams shipped in 48 hours\n\nQuick recap of what early users built:\n• {{customer_1}} automated creator sourcing in a day\n• {{customer_2}} cut outreach prep time by 68%\n\nWe recorded the workflow—watch here. If you’re debating priority, reply with your current stack and we’ll send a tailored setup plan.',
      },
      {
        step: 'Step 3 · Day 7',
        channel: 'Email',
        timing: 'Send to subscribers who clicked but didn’t activate.',
        objective: 'Introduce incentive and urgency.',
        copy:
          'Subject: Last call for the launch bonus 🚀\n\nReminder: activate {{product_name}} before {{deadline}} to unlock:\n• Concierge onboarding\n• First campaign strategy session\n• 25% annual credit\n\nNeed more time? Tap the button below so we can hold the bonus for you.',
      },
      {
        step: 'Step 4 · Day 10',
        channel: 'Email',
        timing: 'Final touch to remaining waitlist.',
        objective: 'Provide alternative action for non-converters.',
        copy:
          'Subject: Keep me posted instead\n\nIf now’s not ideal, pick an update cadence that works:\n• Monthly changelog\n• Launch recap + replay\n• Creator marketplace drops\n\nYou can always activate later—no hard feelings!',
      },
    ],
    samples: [
      {
        label: 'Launch landing CTA',
        subject: '{{product_name}} is live — secure your bonus',
        body:
          'Primary CTA: “Start activation”\nSecondary CTA: “Save my spot” (for those who need more time)\nFooter: direct line to PM or success lead for credibility.',
      },
    ],
    insights: [
      {
        label: 'Use narrative arcs',
        description: 'Each email tells a progression story: announcement → social proof → incentive → graceful exit.',
      },
      {
        label: 'Segment by intent',
        description: 'Trigger steps 3-4 only for subscribers who clicked but didn’t activate to avoid fatigue.',
      },
    ],
    tags: ['Lifecycle', 'Email', 'Product launch', 'Retention'],
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

