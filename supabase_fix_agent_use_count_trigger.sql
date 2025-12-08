-- Fix the increment_agent_use_count function to use SECURITY DEFINER
-- This allows the trigger to bypass RLS when updating the agents table

-- Recreate the function with SECURITY DEFINER
-- SECURITY DEFINER allows the function to run with the privileges of the function creator,
-- which bypasses RLS restrictions when updating the agents table
CREATE OR REPLACE FUNCTION public.increment_agent_use_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if agent_id is set
  IF NEW.agent_id IS NOT NULL THEN
    UPDATE public.agents
    SET use_count = use_count + 1
    WHERE id = NEW.agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the trigger exists (it should already exist from the initial setup)
-- If it doesn't exist, uncomment the following lines:
-- DROP TRIGGER IF EXISTS increment_agent_use_count_trigger ON public.agent_results;
-- CREATE TRIGGER increment_agent_use_count_trigger
--   AFTER INSERT ON public.agent_results
--   FOR EACH ROW
--   EXECUTE FUNCTION public.increment_agent_use_count();

