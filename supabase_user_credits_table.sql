-- Create user_credits table to track user credit balance
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS user_credits_user_id_idx ON public.user_credits(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own credits
CREATE POLICY "Users can view their own credits"
  ON public.user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own credits (though this will typically be done via functions)
CREATE POLICY "Users can update their own credits"
  ON public.user_credits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user_credits entry when a user signs up
-- This will be called via a trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 10) -- Give new users 10 credits by default
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_credits entry when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_credits_updated_at();

-- Function to atomically check and deduct credits
-- Returns the new balance if successful, or NULL if insufficient credits
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_credits_to_deduct INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Get current credits with row lock to prevent race conditions
  SELECT credits INTO v_current_credits
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If user doesn't have a credits record, create one with 0 credits
  IF v_current_credits IS NULL THEN
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO UPDATE SET credits = 0
    RETURNING credits INTO v_current_credits;
  END IF;

  -- Check if user has enough credits
  IF v_current_credits < p_credits_to_deduct THEN
    RETURN NULL; -- Insufficient credits
  END IF;

  -- Calculate new balance
  v_new_credits := v_current_credits - p_credits_to_deduct;

  -- Update credits
  UPDATE public.user_credits
  SET credits = v_new_credits
  WHERE user_id = p_user_id;

  RETURN v_new_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credits (with default if not exists)
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;

  -- If user doesn't have a credits record, return 0
  IF v_credits IS NULL THEN
    RETURN 0;
  END IF;

  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (for refunds or manual additions)
CREATE OR REPLACE FUNCTION public.add_user_credits(
  p_user_id UUID,
  p_credits_to_add INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;

  -- If user doesn't have a credits record, create one
  IF v_current_credits IS NULL THEN
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (p_user_id, p_credits_to_add)
    ON CONFLICT (user_id) DO UPDATE SET credits = user_credits.credits + p_credits_to_add
    RETURNING credits INTO v_new_credits;
    RETURN v_new_credits;
  END IF;

  -- Calculate new balance
  v_new_credits := v_current_credits + p_credits_to_add;

  -- Update credits
  UPDATE public.user_credits
  SET credits = v_new_credits
  WHERE user_id = p_user_id;

  RETURN v_new_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.deduct_user_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_credits(UUID, INTEGER) TO authenticated;

