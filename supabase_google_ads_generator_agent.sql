-- Insert the Google Ads Generator agent
INSERT INTO public.agents (slug, title, summary, category, use_case, persona, thumbnail_url, hero_image_url, stats, sequence, samples, insights, tags, is_active, credits, tools)
VALUES
  (
    'google-ads-generator',
    'Google Ads Generator',
    'Generates 10 optimized Google Ads for AdWords with headlines (30 chars max) and descriptions (90 chars max). Each ad tests different messaging angles and value propositions aligned with your brand profile.',
    'Paid Ads',
    'Use when creating Google Ads campaigns or need multiple ad variations for A/B testing. Perfect for launching new campaigns, refreshing existing ads, or testing different messaging approaches.',
    'Paid Ads Manager · PPC Specialist · Growth Marketer · Digital Marketer',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Ads generated", "value": "10 per run"},
      {"label": "Time saved", "value": "3-5 hours per campaign"},
      {"label": "Character compliance", "value": "100%"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Brand Profile Selection",
        "channel": "Agent Interface",
        "timing": "Select your brand profile from the dropdown.",
        "objective": "Provide brand context for ad generation.",
        "copy": "Input:\n• Select brand profile from dropdown\n• Agent uses brand profile to understand:\n  - Product and value proposition\n  - Target audience and pain points\n  - Key benefits and differentiators\n  - Brand voice and tone"
      },
      {
        "step": "Step 2 · Ad Generation",
        "channel": "AI Processing",
        "timing": "Agent generates 10 distinct Google Ads.",
        "objective": "Create optimized Google Ads for AdWords.",
        "copy": "The agent will:\n• Analyze brand profile and extract key insights\n• Identify compelling value propositions\n• Generate 10 distinct ads with different angles\n• Ensure headlines are 30 characters or less\n• Ensure descriptions are 90 characters or less\n• Test different messaging approaches (benefits, features, urgency, problem-solving)\n• Align all copy with brand voice"
      },
      {
        "step": "Step 3 · Final Output",
        "channel": "Results Dashboard",
        "timing": "Receive 10 ready-to-use Google Ads.",
        "objective": "Get Google Ads ready for AdWords.",
        "copy": "You''ll receive:\n• 10 complete Google Ads\n• Each with headline (30 chars max) and description (90 chars max)\n• Different messaging angles and value propositions\n• All ads aligned with your brand voice\n• Character counts verified\n• Ready to import into Google Ads account"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Google Ads Generator Results",
        "body": "## AD 1\n\n**Headline:** Boost Sales with AI Tools\n**Description:** Transform your business with AI-powered solutions. Start your free trial today and see results fast.\n\n---\n\n## AD 2\n\n**Headline:** Stop Wasting Time on Manual Tasks\n**Description:** Automate your workflow with our intelligent platform. Save hours every week. Try it free now.\n\n---\n\n## AD 3\n\n**Headline:** The #1 AI Platform for Teams\n**Description:** Join thousands of teams using our platform to increase productivity. Get started in minutes."
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Generates 10 distinct ad variations so you can test different messaging approaches and find what resonates best with your audience. Each ad tests a different angle or value proposition."
      },
      {
        "label": "Character compliance",
        "description": "Strictly adheres to Google Ads character limits (30 chars for headlines, 90 chars for descriptions), ensuring all ads are ready to use without manual editing."
      },
      {
        "label": "Brand-aligned",
        "description": "Uses your complete brand profile to ensure all ads match your voice, tone, and positioning—no generic copy."
      }
    ]'::jsonb,
    ARRAY['Paid Ads', 'Google Ads', 'PPC', 'AdWords', 'Advertising'],
    true,
    3,
    ARRAY['OpenAI', 'Google']
  )
ON CONFLICT (slug) DO NOTHING;

