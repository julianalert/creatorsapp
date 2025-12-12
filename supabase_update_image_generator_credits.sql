-- Update image-generator agent credits to 12
UPDATE public.agents
SET credits = 12
WHERE slug = 'image-generator';

