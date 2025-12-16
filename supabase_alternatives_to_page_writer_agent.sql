-- Insert the Alternatives to X Page Writer agent
INSERT INTO public.agents (slug, title, summary, category, use_case, persona, thumbnail_url, hero_image_url, stats, sequence, samples, insights, tags, is_active, credits)
VALUES
  (
    'alternatives-to-page-writer',
    'Alternatives to X Page Writer',
    'Scrapes your website and competitor sites, extracts structured data, and generates high-converting SEO-optimized "Alternatives to X" comparison pages.',
    'SEO',
    'Use when creating comparison pages, competitor landing pages, or SEO content that positions your product against alternatives. Perfect for capturing high-intent search traffic.',
    'SEO Specialist · Content Marketer · Product Marketer · Growth Marketer',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Pages generated", "value": "Unlimited"},
      {"label": "Time saved", "value": "8-12 hours per page"},
      {"label": "Evidence-backed", "value": "100%"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Website Input",
        "channel": "Agent Interface",
        "timing": "Enter your domain and competitor domain.",
        "objective": "Define the comparison scope.",
        "copy": "Input:\n• Your website domain\n• Competitor website domain\n• Target persona (optional)\n• Pricing model (optional)\n• Primary CTA (optional)\n• Tone preference (optional)"
      },
      {
        "step": "Step 2 · Evidence Collection",
        "channel": "AI Processing",
        "timing": "Agent scrapes both websites comprehensively.",
        "objective": "Gather structured evidence from both sites.",
        "copy": "The agent will:\n• Scrape homepage, features, pricing, use cases\n• Extract integrations, security, compliance info\n• Collect testimonials, case studies, docs\n• Build structured evidence pack with citations\n• Extract positioning, ICP, and differentiators"
      },
      {
        "step": "Step 3 · Comparison Analysis",
        "channel": "AI Processing",
        "timing": "Agent builds comparison matrix and decides page angle.",
        "objective": "Create data-driven comparison framework.",
        "copy": "The agent will:\n• Build normalized feature comparison matrix\n• Identify key differentiators and strengths\n• Decide optimal page positioning angle\n• Prepare objection rebuttals with evidence\n• Structure messaging hierarchy"
      },
      {
        "step": "Step 4 · Page Generation",
        "channel": "AI Processing",
        "timing": "Agent writes complete SEO-optimized page.",
        "objective": "Generate publication-ready comparison page.",
        "copy": "The agent will:\n• Write complete markdown page following best practices\n• Include comparison table with evidence citations\n• Add FAQ section with schema-ready Q/A\n• Create use-case recommendations\n• Ensure all claims are evidence-backed"
      },
      {
        "step": "Step 5 · Final Output",
        "channel": "Results Dashboard",
        "timing": "Receive ready-to-publish comparison page.",
        "objective": "Get SEO-optimized alternatives page.",
        "copy": "You''ll receive:\n• Complete markdown page ready to publish\n• Comparison matrix with evidence URLs\n• Quality checklist of missing information\n• All claims backed by scraped evidence\n• SEO-optimized structure and content"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Alternatives to CompetitorX (2025)",
        "body": "# Best Alternatives to CompetitorX (2025)\n\n[Complete SEO-optimized comparison page with evidence-backed claims, comparison table, FAQ, and recommendations...]"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Creates evidence-backed comparison pages that rank well and convert by using real data from both sites, ensuring credibility and accuracy."
      },
      {
        "label": "SEO focus",
        "description": "Optimized structure and content specifically designed to capture high-intent search traffic from users evaluating alternatives."
      }
    ]'::jsonb,
    ARRAY['SEO', 'Content Marketing', 'Competitor Analysis', 'Comparison Pages'],
    true,
    5
  )
ON CONFLICT (slug) DO NOTHING;

