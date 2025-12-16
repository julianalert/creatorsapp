-- Insert the Headline Generator agent
INSERT INTO public.agents (slug, title, summary, category, use_case, persona, thumbnail_url, hero_image_url, stats, sequence, samples, insights, tags, is_active, credits)
VALUES
  (
    'headline-generator',
    'Headline Generator',
    'Generates three distinct hero section headlines for landing pages: straightforward explanation, objection-handling hook, and niche ownership positioning. Each version includes title, subtitle, and optimized CTA.',
    'Content Marketing',
    'Use when creating or optimizing landing page hero sections. Perfect for A/B testing different headline approaches or finding the right messaging angle for your target audience.',
    'Content Marketer · Growth Marketer · Landing Page Designer · Product Marketer',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Versions generated", "value": "3 per run"},
      {"label": "Time saved", "value": "2-4 hours per page"},
      {"label": "On-brand", "value": "100%"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Brand Profile Selection",
        "channel": "Agent Interface",
        "timing": "Select your brand profile from the dropdown.",
        "objective": "Provide brand context for headline generation.",
        "copy": "Input:\n• Select brand profile from dropdown\n• Agent uses brand profile to understand:\n  - Product and value proposition\n  - Target audience and their objections\n  - Brand voice and tone\n  - Positioning and niche"
      },
      {
        "step": "Step 2 · Headline Generation",
        "channel": "AI Processing",
        "timing": "Agent generates three distinct headline versions.",
        "objective": "Create optimized hero section headlines.",
        "copy": "The agent will:\n• Analyze brand profile and extract key insights\n• Identify customer's biggest objection\n• Generate Version 1: Straightforward (explains what it does)\n• Generate Version 2: Hook (addresses objection + value)\n• Generate Version 3: Own your niche (positions as THE solution)\n• Create optimized subtitles for each version\n• Generate value-focused or objection-handling CTAs"
      },
      {
        "step": "Step 3 · Final Output",
        "channel": "Results Dashboard",
        "timing": "Receive three complete headline versions.",
        "objective": "Get ready-to-use hero section headlines.",
        "copy": "You''ll receive:\n• Version 1: Straightforward headline with subtitle and CTA\n• Version 2: Hook headline with subtitle and CTA\n• Version 3: Niche ownership headline with subtitle and CTA\n• All versions aligned with your brand voice\n• CTAs optimized for value or objection handling\n• Ready to implement format"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Headline Generator Results",
        "body": "## VERSION 1: STRAIGHTFORWARD\n\n**Title:**\nThe Project Management Tool Built for Remote Teams\n\n**Subtitle:**\nOrganize tasks, collaborate in real-time, and hit deadlines—all in one place. Built specifically for distributed teams.\n\n**CTA:**\nStart Your Free Trial\n\n---\n\n## VERSION 2: HOOK\n\n**Title:**\nStop Missing Deadlines. Start Hitting Them.\n\n**Subtitle:**\nThe project management tool that finally makes remote team collaboration simple. No more scattered spreadsheets or endless Slack threads.\n\n**CTA:**\nTry Free (No Credit Card)\n\n---\n\n## VERSION 3: OWN YOUR NICHE\n\n**Title:**\nThe Remote Team Project Manager\n\n**Subtitle:**\nBuilt from the ground up for distributed teams. The only project management tool designed specifically for remote work.\n\n**CTA:**\nGet Started Today"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Generates three distinct headline strategies so you can test different approaches and find what resonates best with your audience. Each version serves a different purpose in the conversion funnel."
      },
      {
        "label": "Brand-aligned",
        "description": "Uses your complete brand profile to ensure all headlines match your voice, tone, and positioning—no generic copy."
      }
    ]'::jsonb,
    ARRAY['Content Marketing', 'Landing Pages', 'Headlines', 'Conversion Optimization', 'A/B Testing'],
    true,
    2
  )
ON CONFLICT (slug) DO NOTHING;

