-- Fix the agent rating stats trigger to work properly
-- This uses SECURITY DEFINER to ensure the trigger can update agents table

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.update_agent_rating_stats() CASCADE;

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

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_agent_rating_stats_trigger ON public.agent_ratings;

CREATE TRIGGER update_agent_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_rating_stats();

-- Recalculate all existing agent stats
UPDATE public.agents a
SET 
  rating_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.agent_ratings ar 
    WHERE ar.agent_id = a.id
  ), 0),
  rating_average = COALESCE((
    SELECT AVG(rating)::DECIMAL(3, 2)
    FROM public.agent_ratings ar 
    WHERE ar.agent_id = a.id
  ), 0.00);

