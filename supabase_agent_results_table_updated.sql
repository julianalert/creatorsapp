-- Update the agent_results table to use agent_id instead of agent_slug
-- Run this AFTER creating the agents table and populating it

-- First, add the agent_id column
ALTER TABLE public.agent_results
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Create index for agent_id
CREATE INDEX IF NOT EXISTS agent_results_agent_id_idx ON public.agent_results(agent_id);

-- Migrate existing data: Update agent_id based on agent_slug
-- This assumes agents table is already populated
UPDATE public.agent_results ar
SET agent_id = a.id
FROM public.agents a
WHERE ar.agent_slug = a.slug
AND ar.agent_id IS NULL;

-- After migration is complete, you can make agent_id NOT NULL and remove agent_slug
-- For now, we'll keep both for backward compatibility during migration

-- Update the composite index
DROP INDEX IF EXISTS agent_results_user_agent_idx;
CREATE INDEX IF NOT EXISTS agent_results_user_agent_idx ON public.agent_results(user_id, agent_id);

