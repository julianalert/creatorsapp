-- Create the agent_feedback table
CREATE TABLE IF NOT EXISTS public.agent_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS agent_feedback_user_id_idx ON public.agent_feedback(user_id);
CREATE INDEX IF NOT EXISTS agent_feedback_agent_id_idx ON public.agent_feedback(agent_id);
CREATE INDEX IF NOT EXISTS agent_feedback_created_at_idx ON public.agent_feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.agent_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view feedback (for displaying feedback on agent pages)
CREATE POLICY "Anyone can view agent feedback"
  ON public.agent_feedback
  FOR SELECT
  USING (true);

-- Policy: Users can only INSERT their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.agent_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own feedback
CREATE POLICY "Users can update their own feedback"
  ON public.agent_feedback
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own feedback
CREATE POLICY "Users can delete their own feedback"
  ON public.agent_feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_agent_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_agent_feedback_updated_at
  BEFORE UPDATE ON public.agent_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_feedback_updated_at();

