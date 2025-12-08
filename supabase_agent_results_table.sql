-- Create the agent_results table
CREATE TABLE IF NOT EXISTS public.agent_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_slug TEXT NOT NULL,
  input_params JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS agent_results_user_id_idx ON public.agent_results(user_id);
CREATE INDEX IF NOT EXISTS agent_results_agent_slug_idx ON public.agent_results(agent_slug);
CREATE INDEX IF NOT EXISTS agent_results_created_at_idx ON public.agent_results(created_at DESC);
CREATE INDEX IF NOT EXISTS agent_results_user_agent_idx ON public.agent_results(user_id, agent_slug);

-- Enable Row Level Security
ALTER TABLE public.agent_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own agent results
CREATE POLICY "Users can view their own agent results"
  ON public.agent_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own agent results
CREATE POLICY "Users can insert their own agent results"
  ON public.agent_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own agent results
CREATE POLICY "Users can update their own agent results"
  ON public.agent_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own agent results
CREATE POLICY "Users can delete their own agent results"
  ON public.agent_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_agent_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_agent_results_updated_at
  BEFORE UPDATE ON public.agent_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_results_updated_at();

