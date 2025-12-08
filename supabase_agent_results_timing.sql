-- Add timing fields to agent_results table
ALTER TABLE public.agent_results
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS run_time_seconds INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN public.agent_results.started_at IS 'Timestamp when the agent execution started';
COMMENT ON COLUMN public.agent_results.ended_at IS 'Timestamp when the agent execution completed';
COMMENT ON COLUMN public.agent_results.run_time_seconds IS 'Total execution time in seconds (calculated as ended_at - started_at)';

-- Create index on started_at for querying by start time
CREATE INDEX IF NOT EXISTS agent_results_started_at_idx ON public.agent_results(started_at DESC);

-- Create index on ended_at for querying by end time
CREATE INDEX IF NOT EXISTS agent_results_ended_at_idx ON public.agent_results(ended_at DESC);

