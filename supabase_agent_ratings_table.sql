-- Create the agent_ratings table
CREATE TABLE IF NOT EXISTS public.agent_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, agent_id) -- Ensure users can only rate each agent once
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS agent_ratings_user_id_idx ON public.agent_ratings(user_id);
CREATE INDEX IF NOT EXISTS agent_ratings_agent_id_idx ON public.agent_ratings(agent_id);
CREATE INDEX IF NOT EXISTS agent_ratings_created_at_idx ON public.agent_ratings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.agent_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all ratings (for displaying ratings on agent pages)
CREATE POLICY "Anyone can view agent ratings"
  ON public.agent_ratings
  FOR SELECT
  USING (true);

-- Policy: Users can only INSERT their own ratings
CREATE POLICY "Users can insert their own ratings"
  ON public.agent_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own ratings
CREATE POLICY "Users can update their own ratings"
  ON public.agent_ratings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON public.agent_ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_agent_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_agent_ratings_updated_at
  BEFORE UPDATE ON public.agent_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_ratings_updated_at();

-- Function to update agent rating statistics when a rating is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_agent_rating_stats()
RETURNS TRIGGER
SECURITY DEFINER -- This allows the function to run with the privileges of the function owner
SET search_path = public
AS $$
DECLARE
  agent_uuid UUID;
BEGIN
  -- Determine which agent_id to update
  IF TG_OP = 'DELETE' THEN
    agent_uuid := OLD.agent_id;
  ELSE
    agent_uuid := NEW.agent_id;
  END IF;

  -- Update agent stats
  UPDATE public.agents
  SET 
    rating_count = (
      SELECT COUNT(*) 
      FROM public.agent_ratings 
      WHERE agent_id = agent_uuid
    ),
    rating_average = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0.00)
      FROM public.agent_ratings 
      WHERE agent_id = agent_uuid
    )
  WHERE id = agent_uuid;

  -- Return appropriate value based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update agent stats when ratings change
CREATE TRIGGER update_agent_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_rating_stats();

