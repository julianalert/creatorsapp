-- Create the agent_requests table
CREATE TABLE IF NOT EXISTS public.agent_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'in_progress', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS agent_requests_user_id_idx ON public.agent_requests(user_id);
CREATE INDEX IF NOT EXISTS agent_requests_status_idx ON public.agent_requests(status);
CREATE INDEX IF NOT EXISTS agent_requests_created_at_idx ON public.agent_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.agent_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own agent requests
CREATE POLICY "Users can view their own agent requests"
  ON public.agent_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own agent requests
CREATE POLICY "Users can insert their own agent requests"
  ON public.agent_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own agent requests (but status updates typically need admin)
CREATE POLICY "Users can update their own agent requests"
  ON public.agent_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own agent requests
CREATE POLICY "Users can delete their own agent requests"
  ON public.agent_requests
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_agent_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_agent_requests_updated_at
  BEFORE UPDATE ON public.agent_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_requests_updated_at();

