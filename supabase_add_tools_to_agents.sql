-- Add tools column to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment to explain the column
COMMENT ON COLUMN public.agents.tools IS 'Array of tool names used by the agent (e.g., openai, google, mail)';

-- Update all agents to include OpenAI by default
UPDATE public.agents 
SET tools = ARRAY['openai']::TEXT[]
WHERE tools IS NULL OR array_length(tools, 1) IS NULL;

-- Update On-Page SEO Audit to include Google + OpenAI
UPDATE public.agents 
SET tools = ARRAY['openai', 'google']::TEXT[]
WHERE slug = 'on-page-seo-audit';

-- Update Welcome Email Sequence Writer to include Mail + OpenAI
UPDATE public.agents 
SET tools = ARRAY['openai', 'mail']::TEXT[]
WHERE slug = 'welcome-email-sequence-writer';

