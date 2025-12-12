-- Insert the Use Case Writer agent
INSERT INTO public.agents (slug, title, summary, category, use_case, persona, thumbnail_url, hero_image_url, stats, sequence, samples, insights, tags, is_active, credits)
VALUES
  (
    'use-case-writer',
    'Use Case Writer',
    'Transforms user interviews into high-converting use case pages. Extracts structured insights and writes evidence-backed stories that resonate with your target audience.',
    'Content Marketing',
    'Use when you have customer interviews, case study calls, or user testimonials that you want to turn into compelling use case pages for SEO and conversion.',
    'Content Marketer · Product Marketer · Growth Marketer · Customer Success',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Pages generated", "value": "Unlimited"},
      {"label": "Time saved", "value": "6-10 hours per page"},
      {"label": "Evidence-backed", "value": "100%"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Interview Input",
        "channel": "Agent Interface",
        "timing": "Paste your user interview or case study notes.",
        "objective": "Provide the raw interview content.",
        "copy": "Input:\n• Raw interview text (transcript, notes, summary)\n• Product name\n• Target audience (optional)\n• Desired CTA (optional)\n• Tone preference (optional)"
      },
      {
        "step": "Step 2 · Insight Extraction",
        "channel": "AI Processing",
        "timing": "Agent extracts structured insights from interview.",
        "objective": "Normalize and structure the interview data.",
        "copy": "The agent will:\n• Extract company profile, trigger event, problems\n• Identify failed alternatives and prior tools\n• Map core job-to-be-done and constraints\n• Document exact workflows and features used\n• Capture outcomes, metrics, and magic moments\n• Note objections and why they chose you"
      },
      {
        "step": "Step 3 · Angle Selection",
        "channel": "AI Processing",
        "timing": "Agent decides optimal use case positioning.",
        "objective": "Choose the most relatable angle.",
        "copy": "The agent will:\n• Analyze extracted insights\n• Choose ONE primary angle (role/job/industry/maturity/constraint)\n• Justify the choice with interview evidence\n• Ensure maximum relatability for target readers"
      },
      {
        "step": "Step 4 · Page Generation",
        "channel": "AI Processing",
        "timing": "Agent writes complete use case page.",
        "objective": "Create conversion-focused use case page.",
        "copy": "The agent will:\n• Write narrative-first storytelling\n• Structure workflows and steps clearly\n• Include before/after snapshots\n• Add proof points and quotes\n• Align CTA with use case\n• Ensure all claims map to interview"
      },
      {
        "step": "Step 5 · Final Output",
        "channel": "Results Dashboard",
        "timing": "Receive ready-to-publish use case page.",
        "objective": "Get SEO-optimized use case page.",
        "copy": "You''ll receive:\n• Complete markdown use case page\n• Extracted structured insights\n• Quality checklist of missing information\n• All claims backed by interview content\n• Ready to publish format"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "How a Head of Growth uses ProductX to scale content",
        "body": "# How a Head of Growth at a SaaS Company uses ProductX to Scale Content Production\n\n[Complete use case page with before/after, workflows, results, and quotes...]"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Transforms raw interviews into structured, compelling stories that readers can immediately relate to, using only evidence from the actual interview."
      },
      {
        "label": "Relatability focus",
        "description": "Chooses the most relatable angle so readers think 'this is literally me', making the use case highly conversion-focused."
      }
    ]'::jsonb,
    ARRAY['Content Marketing', 'Use Cases', 'Case Studies', 'Storytelling'],
    true,
    1
  )
ON CONFLICT (slug) DO NOTHING;

