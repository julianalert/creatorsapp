-- Update agent credits
-- Conversion Rate Optimizer: 2 credits
-- On-Page SEO Audit: 2 credits
-- Welcome Email Sequence Writer: 3 credits

UPDATE public.agents
SET credits = 2
WHERE slug = 'conversion-rate-optimizer';

UPDATE public.agents
SET credits = 2
WHERE slug = 'on-page-seo-audit';

UPDATE public.agents
SET credits = 3
WHERE slug = 'welcome-email-sequence-writer';

