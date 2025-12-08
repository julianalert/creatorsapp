-- Create the website table with RLS enabled
-- This table stores scraped website data

CREATE TABLE IF NOT EXISTS public.website (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed')),
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  scrape_result JSONB,
  brand_profile JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS website_user_id_idx ON public.website(user_id);
CREATE INDEX IF NOT EXISTS website_url_idx ON public.website(url);
CREATE INDEX IF NOT EXISTS website_status_idx ON public.website(status);
CREATE INDEX IF NOT EXISTS website_created_at_idx ON public.website(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.website ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own websites
CREATE POLICY "Users can view their own websites"
  ON public.website
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own websites
CREATE POLICY "Users can insert their own websites"
  ON public.website
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own websites
CREATE POLICY "Users can update their own websites"
  ON public.website
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own websites
CREATE POLICY "Users can delete their own websites"
  ON public.website
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_website_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_website_updated_at
  BEFORE UPDATE ON public.website
  FOR EACH ROW
  EXECUTE FUNCTION public.update_website_updated_at();

