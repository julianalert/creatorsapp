-- Create the account table
CREATE TABLE IF NOT EXISTS public.account (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),
  url TEXT,
  profileData JSONB,
  postsData JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS account_user_id_idx ON public.account(user_id);

-- Enable Row Level Security
ALTER TABLE public.account ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own accounts
CREATE POLICY "Users can view their own accounts"
  ON public.account
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own accounts
CREATE POLICY "Users can insert their own accounts"
  ON public.account
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own accounts
CREATE POLICY "Users can update their own accounts"
  ON public.account
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own accounts
CREATE POLICY "Users can delete their own accounts"
  ON public.account
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_account_updated_at
  BEFORE UPDATE ON public.account
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

