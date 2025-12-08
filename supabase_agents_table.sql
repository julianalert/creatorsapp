-- Create the agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  use_case TEXT NOT NULL,
  persona TEXT NOT NULL,
  thumbnail_url TEXT,
  hero_image_url TEXT,
  stats JSONB,
  sequence JSONB,
  samples JSONB,
  insights JSONB,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS agents_slug_idx ON public.agents(slug);
CREATE INDEX IF NOT EXISTS agents_category_idx ON public.agents(category);
CREATE INDEX IF NOT EXISTS agents_is_active_idx ON public.agents(is_active);
CREATE INDEX IF NOT EXISTS agents_created_at_idx ON public.agents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active agents (public read)
CREATE POLICY "Anyone can view active agents"
  ON public.agents
  FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can view all agents (including inactive)
CREATE POLICY "Authenticated users can view all agents"
  ON public.agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: INSERT, UPDATE, DELETE policies should be set up for admin users only
-- For now, we'll allow service role to manage agents
-- You can add more restrictive policies based on your admin system

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agents_updated_at();

