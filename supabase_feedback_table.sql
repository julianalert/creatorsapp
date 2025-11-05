-- Create the feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only INSERT their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only SELECT their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.uid() = user_id);

