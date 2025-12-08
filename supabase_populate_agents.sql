-- Populate agents table with existing agents
-- This script inserts all the agents from the template-data.ts file

-- Note: You'll need to update the thumbnail_url and hero_image_url with actual image URLs
-- For now, we'll use placeholder values

INSERT INTO public.agents (slug, title, summary, category, use_case, persona, thumbnail_url, hero_image_url, stats, sequence, samples, insights, tags, is_active, credits)
VALUES
  (
    'keyword-research',
    'Keyword Research',
    'Identifies high-value keywords, analyzes search intent, and provides competitive insights for SEO.',
    'SEO',
    'Use when starting a new content campaign, optimizing existing pages, or expanding into new topic areas.',
    'SEO Specialist · Content Marketer · Marketing Manager',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Keywords analyzed", "value": "500+ per run"},
      {"label": "Time saved", "value": "4-6 hours"},
      {"label": "Output format", "value": "CSV + Report"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Input",
        "channel": "Agent Interface",
        "timing": "Enter your topic, industry, or competitor URL.",
        "objective": "Define the research scope and target audience.",
        "copy": "Input your research parameters:\n• Primary topic or niche\n• Target audience demographics\n• Competitor URLs (optional)\n• Geographic focus\n• Content type (blog, product page, etc.)"
      },
      {
        "step": "Step 2 · Analysis",
        "channel": "AI Processing",
        "timing": "Agent analyzes search volume, competition, and intent.",
        "objective": "Generate comprehensive keyword insights.",
        "copy": "The agent will:\n• Extract seed keywords from your input\n• Analyze search volume and difficulty\n• Identify long-tail opportunities\n• Map search intent (informational, commercial, transactional)\n• Compare with competitor keywords"
      },
      {
        "step": "Step 3 · Output",
        "channel": "Results Dashboard",
        "timing": "Receive organized keyword clusters and recommendations.",
        "objective": "Get actionable keyword strategy.",
        "copy": "You''ll receive:\n• Top 50-100 keyword recommendations\n• Keyword clusters by topic\n• Search intent classification\n• Competition analysis\n• Content gap opportunities\n• Priority scoring (high/medium/low)"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Keyword Research Report: SaaS Project Management",
        "body": "Primary Keywords:\n• project management software (12K/mo, Medium difficulty)\n• team collaboration tools (8K/mo, Low difficulty)\n• task management app (6K/mo, Medium difficulty)\n\nLong-tail Opportunities:\n• best project management software for small teams (1.2K/mo, Low difficulty)\n• free project management tools comparison (800/mo, Low difficulty)"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Automates the time-consuming process of keyword research while providing data-driven insights that align with search intent and business goals."
      },
      {
        "label": "Best practices",
        "description": "Focus on keywords with medium competition and clear search intent. Prioritize long-tail keywords for faster wins."
      }
    ]'::jsonb,
    ARRAY['SEO', 'Keyword Research', 'Content Strategy', 'Automation'],
    true,
    1
  ),
  (
    'on-page-seo-audit',
    'On-Page SEO Audit',
    'Analyzes technical SEO and content optimization, providing actionable recommendations to improve rankings.',
    'SEO',
    'Use before launching new pages, optimizing existing content, or conducting regular SEO health checks.',
    'SEO Manager · Web Developer · Content Manager',
    '/images/meetups-thumb-02.jpg',
    '/images/meetup-photo-01.jpg',
    '[
      {"label": "Pages audited", "value": "Unlimited"},
      {"label": "Checks performed", "value": "50+ factors"},
      {"label": "Report time", "value": "2-5 minutes"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · URL Input",
        "channel": "Agent Interface",
        "timing": "Enter the URL(s) you want to audit.",
        "objective": "Define the audit scope.",
        "copy": "Provide:\n• Single URL or bulk list\n• Target keywords (optional)\n• Competitor URLs (optional)\n• Focus areas (technical, content, links)"
      },
      {
        "step": "Step 2 · Deep Analysis",
        "channel": "AI Processing",
        "timing": "Agent crawls and analyzes all on-page elements.",
        "objective": "Identify SEO issues and opportunities.",
        "copy": "The agent checks:\n• Title tags and meta descriptions\n• Header structure (H1-H6)\n• Image alt text and optimization\n• Internal linking structure\n• Page speed and Core Web Vitals\n• Mobile responsiveness\n• Schema markup\n• Content quality and keyword usage"
      },
      {
        "step": "Step 3 · Action Plan",
        "channel": "Audit Report",
        "timing": "Receive prioritized recommendations.",
        "objective": "Get clear next steps to improve SEO.",
        "copy": "Your report includes:\n• Critical issues (fix immediately)\n• Important improvements (high priority)\n• Nice-to-have optimizations\n• Before/after comparisons\n• Estimated impact scores\n• Implementation checklist"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Finding",
        "subject": "Critical Issue: Missing H1 Tag",
        "body": "Issue: Page lacks a primary H1 heading.\nImpact: High - Search engines rely on H1 for page topic understanding.\nFix: Add an H1 tag with your primary keyword within the first 100 words.\nExample: <h1>Best Project Management Software for Teams</h1>"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Systematically identifies SEO issues that are easy to miss, providing a comprehensive view of on-page optimization opportunities."
      },
      {
        "label": "ROI focus",
        "description": "Prioritizes fixes by potential impact, helping you focus on changes that will move the needle fastest."
      }
    ]'::jsonb,
    ARRAY['SEO', 'Technical SEO', 'Content Optimization', 'Audit'],
    true,
    1
  ),
  (
    'conversion-rate-optimizer',
    'Conversion Rate Optimizer',
    'Analyzes user behavior and identifies conversion barriers to improve conversion rates across your funnel.',
    'Business/Strategy',
    'Use when conversion rates are below industry benchmarks, launching new landing pages, or optimizing existing funnels.',
    'Growth Marketer · Product Manager · CRO Specialist',
    '/images/meetups-thumb-03.jpg',
    '/images/meetup-photo-02.jpg',
    '[
      {"label": "Funnel analyzed", "value": "End-to-end"},
      {"label": "Optimization areas", "value": "20+ factors"},
      {"label": "Expected lift", "value": "15-30%"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Funnel Mapping",
        "channel": "Agent Interface",
        "timing": "Define your conversion funnel and goals.",
        "objective": "Establish the optimization framework.",
        "copy": "Input:\n• Conversion goal (signup, purchase, download)\n• Funnel steps (awareness → consideration → decision)\n• Current conversion rates per step\n• Traffic sources\n• User segments"
      },
      {
        "step": "Step 2 · Behavior Analysis",
        "channel": "AI Processing",
        "timing": "Agent analyzes user paths and drop-off points.",
        "objective": "Identify conversion barriers.",
        "copy": "The agent examines:\n• Drop-off rates at each funnel stage\n• Time spent on key pages\n• Click patterns and heatmaps\n• Form abandonment points\n• Mobile vs desktop behavior\n• A/B test results (if available)"
      },
      {
        "step": "Step 3 · Optimization Plan",
        "channel": "CRO Report",
        "timing": "Receive prioritized optimization recommendations.",
        "objective": "Get actionable steps to improve conversions.",
        "copy": "Your plan includes:\n• High-impact quick wins\n• UX improvements\n• Copy and messaging optimizations\n• Trust signals and social proof\n• Form simplification suggestions\n• Mobile optimization fixes\n• A/B test hypotheses"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Recommendation",
        "subject": "Quick Win: Add Trust Badge",
        "body": "Issue: Checkout page lacks trust signals.\nImpact: Medium-High - 23% of users abandon at checkout.\nRecommendation: Add security badges, customer count, and money-back guarantee.\nExpected Lift: +8-12% conversion rate.\nImplementation: 15 minutes"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Takes a holistic view of the conversion funnel, identifying both obvious and subtle barriers that impact user decision-making."
      },
      {
        "label": "Data-driven approach",
        "description": "Prioritizes recommendations based on potential impact and implementation effort, maximizing ROI on optimization work."
      }
    ]'::jsonb,
    ARRAY['CRO', 'Conversion Optimization', 'UX', 'Growth'],
    true,
    1
  ),
  (
    'blog-content-plan-generator',
    'Blog Content Plan Generator',
    'Generates content plans, topic clusters, and editorial calendars to drive organic traffic.',
    'Content Marketing',
    'Use when planning quarterly content strategy, launching a new blog, or expanding content production.',
    'Content Manager · Marketing Director · SEO Specialist',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Topics generated", "value": "50-100 per plan"},
      {"label": "Planning time", "value": "30-60 minutes"},
      {"label": "Calendar format", "value": "Quarterly"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Strategy Input",
        "channel": "Agent Interface",
        "timing": "Define your content goals and audience.",
        "objective": "Set the foundation for content planning.",
        "copy": "Provide:\n• Target audience personas\n• Content goals (traffic, leads, engagement)\n• Industry/niche focus\n• Competitor blogs to analyze\n• Existing content inventory\n• Publishing frequency"
      },
      {
        "step": "Step 2 · Topic Generation",
        "channel": "AI Processing",
        "timing": "Agent generates topic clusters and content ideas.",
        "objective": "Create a comprehensive content roadmap.",
        "copy": "The agent will:\n• Generate pillar topics and supporting content\n• Identify content gaps vs competitors\n• Map topics to buyer journey stages\n• Suggest seasonal and trending topics\n• Calculate SEO potential for each topic\n• Create topic clusters for authority building"
      },
      {
        "step": "Step 3 · Editorial Calendar",
        "channel": "Content Plan",
        "timing": "Receive organized content calendar and briefs.",
        "objective": "Get ready-to-execute content plan.",
        "copy": "Your plan includes:\n• 3-month editorial calendar\n• Topic priorities and SEO scores\n• Content briefs with key points\n• Suggested publishing dates\n• Internal linking opportunities\n• Content repurposing ideas"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Content Brief",
        "subject": "Topic: \"10 Project Management Tools for Remote Teams\"",
        "body": "Target Keyword: project management tools remote teams (2.4K/mo)\nSEO Score: 8/10\nBuyer Stage: Consideration\n\nKey Points:\n• Compare top 10 tools with pros/cons\n• Include pricing comparison table\n• Add use case recommendations\n• Link to free trial pages\n\nInternal Links:\n• Link to \"Remote Team Collaboration Guide\"\n• Link to \"Productivity Tips for Remote Work\""
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Creates a strategic content plan that balances SEO opportunities with audience needs, ensuring every piece serves a purpose."
      },
      {
        "label": "Cluster approach",
        "description": "Organizes content into topic clusters to build topical authority and improve overall domain ranking."
      }
    ]'::jsonb,
    ARRAY['Content Marketing', 'Editorial Planning', 'SEO', 'Strategy'],
    true,
    1
  ),
  (
    'blog-post-writer',
    'Blog Post Writer',
    'Generates high-quality, SEO-optimized blog posts ready to publish.',
    'Content Marketing',
    'Use when you need to create blog content quickly, maintain consistent quality, or scale content production without sacrificing quality.',
    'Content Writer · Blog Manager · Marketing Manager',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Posts generated", "value": "Unlimited"},
      {"label": "Time saved", "value": "2-4 hours per post"},
      {"label": "Word count", "value": "500-3000 words"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Content Brief",
        "channel": "Agent Interface",
        "timing": "Provide topic, audience, and requirements.",
        "objective": "Define the blog post parameters.",
        "copy": "Input:\n• Blog post topic or title\n• Target audience\n• Tone and style preferences\n• Desired word count\n• Key points to cover\n• SEO keywords (optional)"
      },
      {
        "step": "Step 2 · Content Generation",
        "channel": "AI Processing",
        "timing": "Agent writes the blog post with SEO optimization.",
        "objective": "Generate high-quality, engaging content.",
        "copy": "The agent will:\n• Research the topic and gather information\n• Create an engaging introduction\n• Structure content with headings and subheadings\n• Write SEO-optimized content\n• Include relevant examples and data\n• Add a compelling conclusion\n• Optimize for readability and engagement"
      },
      {
        "step": "Step 3 · Final Output",
        "channel": "Blog Post",
        "timing": "Receive complete blog post ready to publish.",
        "objective": "Get publication-ready content.",
        "copy": "You''ll receive:\n• Complete blog post with proper formatting\n• SEO-optimized title and meta description\n• Headings and subheadings (H2, H3)\n• Engaging introduction and conclusion\n• Internal linking suggestions\n• Call-to-action recommendations\n• Ready-to-publish format"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Blog Post: \"10 Project Management Tools for Remote Teams\"",
        "body": "# 10 Project Management Tools for Remote Teams\n\nRemote work has become the new normal, and having the right project management tools is crucial for team success...\n\n## 1. Asana\n\nAsana is a powerful project management platform that helps teams organize and track their work...\n\n[Full blog post content continues...]"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Combines AI-powered writing with SEO best practices to create content that both engages readers and ranks well in search engines."
      },
      {
        "label": "Quality focus",
        "description": "Generates well-researched, structured content that maintains your brand voice while saving hours of writing time."
      }
    ]'::jsonb,
    ARRAY['Content Marketing', 'Blog Writing', 'SEO', 'Content Creation'],
    true,
    1
  ),
  (
    'image-generator',
    'Image Generator',
    'Generates high-quality custom images based on your descriptions for marketing and design projects.',
    'Miscellaneous',
    'Use when you need custom images for blog posts, social media, marketing materials, or any visual content without relying on stock photos.',
    'Content Creator · Marketing Manager · Designer',
    '/images/meetups-thumb-02.jpg',
    '/images/meetup-photo-01.jpg',
    '[
      {"label": "Images generated", "value": "Unlimited"},
      {"label": "Time saved", "value": "30-60 minutes per image"},
      {"label": "Resolution", "value": "High quality"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Image Description",
        "channel": "Agent Interface",
        "timing": "Provide image description and requirements.",
        "objective": "Define the image parameters.",
        "copy": "Input:\n• Image description or prompt\n• Style preferences (realistic, artistic, minimalist, etc.)\n• Dimensions or aspect ratio\n• Number of images\n• Additional requirements (colors, mood, etc.)"
      },
      {
        "step": "Step 2 · Image Generation",
        "channel": "AI Processing",
        "timing": "Agent generates the image based on your description.",
        "objective": "Create high-quality custom images.",
        "copy": "The agent will:\n• Analyze your description and requirements\n• Apply style preferences\n• Generate image with specified dimensions\n• Optimize for quality and clarity\n• Ensure brand consistency (if applicable)\n• Create multiple variations (if requested)"
      },
      {
        "step": "Step 3 · Final Output",
        "channel": "Generated Images",
        "timing": "Receive your custom images ready to use.",
        "objective": "Get publication-ready images.",
        "copy": "You''ll receive:\n• High-quality generated images\n• Multiple variations (if requested)\n• Images in requested dimensions\n• Download-ready format\n• Usage recommendations\n• Alternative suggestions"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Generated Image: \"Modern workspace with laptop and plants\"",
        "body": "Image Description: A clean, modern workspace setup with a laptop, plants, and natural lighting.\n\nGenerated: High-quality image showing a minimalist desk setup with a MacBook, potted plants, and warm natural light streaming through a window. Style: Realistic, professional.\n\nDimensions: 1920x1080px\nFormat: PNG"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Creates custom images tailored to your exact needs, eliminating the need for stock photos and ensuring unique visuals for your brand."
      },
      {
        "label": "Time efficient",
        "description": "Generates professional-quality images in minutes, saving hours of searching for the right stock photo or hiring a designer."
      }
    ]'::jsonb,
    ARRAY['Content Marketing', 'Image Generation', 'Design', 'Visual Content'],
    true,
    1
  ),
  (
    'contact-researcher',
    'Contact Researcher',
    'Finds and researches contact information including email addresses, phone numbers, and social profiles.',
    'Sales',
    'Use when you need to find contact information for outreach, sales prospecting, partnership opportunities, or networking.',
    'Sales Rep · Business Developer · Outreach Manager',
    '/images/meetups-thumb-03.jpg',
    '/images/meetup-photo-02.jpg',
    '[
      {"label": "Contacts found", "value": "Unlimited"},
      {"label": "Accuracy rate", "value": "85-95%"},
      {"label": "Time saved", "value": "15-30 min per contact"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Research Parameters",
        "channel": "Agent Interface",
        "timing": "Provide company or person details.",
        "objective": "Define what contact information to find.",
        "copy": "Input:\n• Company name or website\n• Person name and title\n• Industry or niche\n• Location (optional)\n• Contact type needed (email, phone, LinkedIn, etc.)"
      },
      {
        "step": "Step 2 · Contact Research",
        "channel": "AI Processing",
        "timing": "Agent searches and verifies contact information.",
        "objective": "Find accurate contact details.",
        "copy": "The agent will:\n• Search company websites and directories\n• Find email addresses and phone numbers\n• Locate LinkedIn and social profiles\n• Verify contact information accuracy\n• Check for multiple contact methods\n• Identify decision-makers and key contacts"
      },
      {
        "step": "Step 3 · Contact Report",
        "channel": "Results Dashboard",
        "timing": "Receive verified contact information.",
        "objective": "Get ready-to-use contact details.",
        "copy": "You''ll receive:\n• Verified email addresses\n• Phone numbers\n• LinkedIn profiles\n• Social media links\n• Company information\n• Contact verification status\n• Alternative contacts (if available)"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Contact Research: \"Marketing Director at TechCorp\"",
        "body": "Company: TechCorp Inc.\nWebsite: techcorp.com\n\nContact Found:\nName: Sarah Johnson\nTitle: Director of Marketing\nEmail: sarah.johnson@techcorp.com (Verified)\nPhone: +1 (555) 123-4567\nLinkedIn: linkedin.com/in/sarahjohnson\nTwitter: @sarahj_marketing\n\nVerification Status: ✅ Verified\nLast Updated: 2024-01-15"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Automates the time-consuming process of finding and verifying contact information, ensuring you have accurate details for outreach."
      },
      {
        "label": "Accuracy focus",
        "description": "Verifies contact information through multiple sources to ensure high accuracy and reduce bounce rates."
      }
    ]'::jsonb,
    ARRAY['Research', 'Contact Finding', 'Outreach', 'Sales'],
    true,
    1
  ),
  (
    'company-researcher',
    'Company Researcher',
    'Researches companies providing insights on funding, team size, technologies, and market positioning.',
    'Sales',
    'Use when you need to research prospects, understand competitors, evaluate partnerships, or gather intelligence on companies before outreach.',
    'Sales Rep · Business Developer · Market Researcher',
    '/images/meetups-thumb-01.jpg',
    '/images/meetup-image.jpg',
    '[
      {"label": "Companies researched", "value": "Unlimited"},
      {"label": "Data points", "value": "50+ per company"},
      {"label": "Time saved", "value": "20-40 min per company"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Company Input",
        "channel": "Agent Interface",
        "timing": "Provide company name or website.",
        "objective": "Define what company to research.",
        "copy": "Input:\n• Company name\n• Website URL (optional)\n• Industry focus (optional)\n• Research depth (basic, detailed, comprehensive)\n• Specific information needed"
      },
      {
        "step": "Step 2 · Company Research",
        "channel": "AI Processing",
        "timing": "Agent gathers and analyzes company data.",
        "objective": "Collect comprehensive company information.",
        "copy": "The agent will:\n• Find company website and basic info\n• Research funding and financial data\n• Identify team size and key employees\n• Discover technologies and tools used\n• Analyze market position and competitors\n• Find recent news and updates\n• Gather social media presence"
      },
      {
        "step": "Step 3 · Company Report",
        "channel": "Results Dashboard",
        "timing": "Receive comprehensive company profile.",
        "objective": "Get detailed company intelligence.",
        "copy": "You''ll receive:\n• Company overview and description\n• Funding and financial information\n• Team size and key personnel\n• Technology stack\n• Market position and competitors\n• Recent news and updates\n• Social media profiles\n• Contact information"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Company Research: \"TechCorp Inc.\"",
        "body": "Company: TechCorp Inc.\nWebsite: techcorp.com\nIndustry: SaaS, Project Management\nFounded: 2018\n\nOverview:\nTechCorp is a leading provider of project management software for remote teams...\n\nFunding:\nSeries B: $25M (2023)\nTotal Funding: $45M\n\nTeam:\nEmployees: 150-200\nHeadquarters: San Francisco, CA\n\nTechnologies:\n- React, Node.js\n- AWS, PostgreSQL\n- Stripe, SendGrid\n\nKey Personnel:\nCEO: John Smith\nCTO: Jane Doe\nVP Sales: Bob Johnson"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Automates the time-consuming process of company research, providing comprehensive intelligence in minutes instead of hours."
      },
      {
        "label": "Comprehensive data",
        "description": "Gathers information from multiple sources to provide a complete picture of the company, its market position, and opportunities."
      }
    ]'::jsonb,
    ARRAY['Research', 'Company Intelligence', 'Sales', 'Market Research'],
    true,
    1
  ),
  (
    'competitor-analyst',
    'Competitor Analyst',
    'Analyzes competitors providing insights on strategies, positioning, strengths, and opportunities.',
    'Business/Strategy',
    'Use when entering new markets, launching products, or developing competitive strategies. Understand your competitive landscape and identify opportunities.',
    'Strategy Manager · Product Manager · Business Analyst',
    '/images/meetups-thumb-02.jpg',
    '/images/meetup-photo-01.jpg',
    '[
      {"label": "Competitors analyzed", "value": "Unlimited"},
      {"label": "Analysis depth", "value": "Comprehensive"},
      {"label": "Time saved", "value": "2-4 hours per analysis"}
    ]'::jsonb,
    '[
      {
        "step": "Step 1 · Competitor Input",
        "channel": "Agent Interface",
        "timing": "Provide competitor information and analysis scope.",
        "objective": "Define what competitors to analyze.",
        "copy": "Input:\n• Competitor company names or websites\n• Your company/product for context\n• Analysis focus (pricing, features, marketing, etc.)\n• Market segment\n• Geographic scope"
      },
      {
        "step": "Step 2 · Competitive Analysis",
        "channel": "AI Processing",
        "timing": "Agent analyzes competitors across multiple dimensions.",
        "objective": "Generate comprehensive competitive insights.",
        "copy": "The agent will:\n• Research competitor products and services\n• Analyze pricing strategies\n• Compare features and capabilities\n• Review marketing and positioning\n• Examine market share and growth\n• Identify strengths and weaknesses\n• Find differentiation opportunities"
      },
      {
        "step": "Step 3 · Competitive Report",
        "channel": "Analysis Dashboard",
        "timing": "Receive detailed competitive analysis.",
        "objective": "Get actionable competitive intelligence.",
        "copy": "You''ll receive:\n• Competitive landscape overview\n• Feature comparison matrix\n• Pricing analysis\n• Positioning map\n• Strengths and weaknesses assessment\n• Market opportunities\n• Strategic recommendations"
      }
    ]'::jsonb,
    '[
      {
        "label": "Sample Output",
        "subject": "Competitive Analysis: \"Project Management Tools Market\"",
        "body": "Competitors Analyzed:\n1. Asana\n2. Monday.com\n3. Trello\n\nKey Findings:\n\nPricing Comparison:\n- Asana: $10.99/user/month (Premium)\n- Monday.com: $8/user/month (Standard)\n- Trello: $5/user/month (Standard)\n\nFeature Comparison:\n- Timeline/Gantt: Asana ✓, Monday.com ✓, Trello ✗\n- Automation: All three support\n- Integrations: Asana (200+), Monday.com (40+), Trello (100+)\n\nPositioning:\n- Asana: Team collaboration focus\n- Monday.com: Visual workflow management\n- Trello: Simple, card-based approach\n\nOpportunities:\n- Gap in mid-market pricing tier\n- Need for better mobile experience\n- Integration with emerging tools"
      }
    ]'::jsonb,
    '[
      {
        "label": "Why it works",
        "description": "Provides comprehensive competitive intelligence that helps you understand your market position and identify strategic opportunities."
      },
      {
        "label": "Strategic insights",
        "description": "Goes beyond surface-level comparison to provide actionable insights for product development, pricing, and marketing strategies."
      }
    ]'::jsonb,
    ARRAY['Competitive Analysis', 'Strategy', 'Market Research', 'Business Intelligence'],
    true,
    1
  )
ON CONFLICT (slug) DO NOTHING;

