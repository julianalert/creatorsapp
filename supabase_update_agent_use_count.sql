-- Function to increment agent use_count when a result is saved
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
$$ LANGUAGE plpgsql;

-- Trigger to increment use_count when agent_result is inserted
CREATE TRIGGER increment_agent_use_count_trigger
  AFTER INSERT ON public.agent_results
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_agent_use_count();

