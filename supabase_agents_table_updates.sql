-- Add credits, rating, and usage tracking columns to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3, 2) DEFAULT 0.00 NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.agents.credits IS 'Number of credits required to use this agent';
COMMENT ON COLUMN public.agents.use_count IS 'Total number of times this agent has been used';
COMMENT ON COLUMN public.agents.rating_count IS 'Total number of users who have rated this agent';
COMMENT ON COLUMN public.agents.rating_average IS 'Average rating (1-5 stars)';

