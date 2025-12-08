-- Fix and recalculate agent rating statistics
-- Run this to update all agents with correct rating_count and rating_average

-- First, ensure the trigger function exists and is correct
CREATE OR REPLACE FUNCTION public.update_agent_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Recalculate stats after deletion
    UPDATE public.agents
    SET 
      rating_count = (
        SELECT COUNT(*) FROM public.agent_ratings WHERE agent_id = OLD.agent_id
      ),
      rating_average = (
        SELECT COALESCE(AVG(rating), 0.00)::DECIMAL(3, 2)
        FROM public.agent_ratings 
        WHERE agent_id = OLD.agent_id
      )
    WHERE id = OLD.agent_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Recalculate stats after update (both count and average)
    UPDATE public.agents
    SET 
      rating_count = (
        SELECT COUNT(*) FROM public.agent_ratings WHERE agent_id = NEW.agent_id
      ),
      rating_average = (
        SELECT COALESCE(AVG(rating), 0.00)::DECIMAL(3, 2)
        FROM public.agent_ratings 
        WHERE agent_id = NEW.agent_id
      )
    WHERE id = NEW.agent_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    -- Update stats after insert
    UPDATE public.agents
    SET 
      rating_count = (
        SELECT COUNT(*) FROM public.agent_ratings WHERE agent_id = NEW.agent_id
      ),
      rating_average = (
        SELECT COALESCE(AVG(rating), 0.00)::DECIMAL(3, 2)
        FROM public.agent_ratings 
        WHERE agent_id = NEW.agent_id
      )
    WHERE id = NEW.agent_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_agent_rating_stats_trigger ON public.agent_ratings;

CREATE TRIGGER update_agent_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_rating_stats();

-- Recalculate all agent stats from existing ratings
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

