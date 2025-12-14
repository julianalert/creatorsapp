-- ============================================
-- BRANDS SYSTEM: Simplified, Scalable Architecture
-- ============================================
-- Two tables:
-- 1. brands: The canonical brand profile (Agent Context Pack) - stored as JSONB
-- 2. scrape_runs: Lightweight tracking/audit trail (metadata only, no full HTML storage)

-- ============================================
-- SCRAPE_RUNS TABLE (Lightweight tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.scrape_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  base_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scraping', 'completed', 'failed')),
  error_message TEXT,
  pages_scraped JSONB DEFAULT '[]'::jsonb, -- Array of {url, page_type, status_code} - just metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for user queries
CREATE INDEX IF NOT EXISTS scrape_runs_user_id_idx ON public.scrape_runs(user_id);
CREATE INDEX IF NOT EXISTS scrape_runs_domain_idx ON public.scrape_runs(domain);
CREATE INDEX IF NOT EXISTS scrape_runs_status_idx ON public.scrape_runs(status);

-- ============================================
-- BRANDS TABLE (Canonical Brand Profile - Agent Context Pack)
-- ============================================
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT,
  
  -- Brand Profile JSONB (the complete structured object - Agent Context Pack)
  -- This is what all agents will consume
  brand_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  version INTEGER DEFAULT 1 NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  derived_from_scrape_run_id UUID REFERENCES public.scrape_runs(id),
  
  -- Source trace (lightweight - just URLs and timestamps)
  source_trace JSONB DEFAULT '{}'::jsonb, -- {page_urls: [], timestamps: {}, version: 1}
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_updated_by TEXT DEFAULT 'system' CHECK (last_updated_by IN ('user', 'system')),
  
  -- Ensure one active brand per domain per user
  CONSTRAINT unique_active_brand_per_user_domain UNIQUE (user_id, domain, active) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes
CREATE INDEX IF NOT EXISTS brands_user_id_idx ON public.brands(user_id);
CREATE INDEX IF NOT EXISTS brands_domain_idx ON public.brands(domain);
CREATE INDEX IF NOT EXISTS brands_active_idx ON public.brands(active);

-- GIN index for JSONB queries (allows efficient querying of brand_profile)
-- This single index supports queries on any JSONB path in brand_profile
CREATE INDEX IF NOT EXISTS brands_brand_profile_idx ON public.brands USING gin(brand_profile);

-- B-tree indexes for common text queries (faster for exact matches)
-- These use the text extraction operator (->>) which returns TEXT
CREATE INDEX IF NOT EXISTS brands_niche_idx ON public.brands ((brand_profile->>'niche'));
CREATE INDEX IF NOT EXISTS brands_category_idx ON public.brands ((brand_profile->'company'->>'category'));

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Scrape Runs Policies
CREATE POLICY "Users can view their own scrape runs"
  ON public.scrape_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scrape runs"
  ON public.scrape_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrape runs"
  ON public.scrape_runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrape runs"
  ON public.scrape_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Brands Policies
CREATE POLICY "Users can view their own brands"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brands"
  ON public.brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brands"
  ON public.brands FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brands"
  ON public.brands FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for brands.updated_at
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to deactivate old brands when a new one is created
CREATE OR REPLACE FUNCTION public.deactivate_old_brands()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new active brand, deactivate other active brands for the same user+domain
  IF NEW.active = true THEN
    UPDATE public.brands
    SET active = false, last_updated_by = 'system'
    WHERE user_id = NEW.user_id
      AND domain = NEW.domain
      AND id != NEW.id
      AND active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to deactivate old brands
CREATE TRIGGER deactivate_old_brands_trigger
  BEFORE INSERT OR UPDATE ON public.brands
  FOR EACH ROW
  WHEN (NEW.active = true)
  EXECUTE FUNCTION public.deactivate_old_brands();
