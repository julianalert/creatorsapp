-- Add coming_soon column to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS agents_coming_soon_idx ON public.agents(coming_soon);

-- Update all agents to coming_soon = false by default (we'll mark specific ones as coming soon in the next script)
UPDATE public.agents 
SET coming_soon = false 
WHERE coming_soon IS NULL;

