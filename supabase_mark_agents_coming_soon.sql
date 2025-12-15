-- Mark all agents as coming_soon = true EXCEPT the 3 active ones:
-- 1. on-page-seo-audit (On-Page SEO Audit)
-- 2. conversion-rate-optimizer (Conversion Rate Optimizer)
-- 3. welcome-email-sequence-writer (Onboarding Welcome Sequence Writer)

-- First, set all agents to coming_soon = true
UPDATE public.agents 
SET coming_soon = true;

-- Then, mark the 3 active agents as coming_soon = false
UPDATE public.agents 
SET coming_soon = false 
WHERE slug IN ('on-page-seo-audit', 'conversion-rate-optimizer', 'welcome-email-sequence-writer');

