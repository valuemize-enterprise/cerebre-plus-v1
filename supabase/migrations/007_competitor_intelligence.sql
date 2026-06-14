-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/007_competitor_intelligence.sql
-- Competitor Intelligence 2.0 — all tables, functions, and indexes.
-- Run AFTER 001–006 migrations.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Competitor sessions ────────────────────────────────────
-- One session = one competitor analysis run
CREATE TABLE IF NOT EXISTS public.competitor_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Mode and configuration
  mode              TEXT        NOT NULL CHECK (mode IN ('base','enhanced')),
  competitor_count  SMALLINT    NOT NULL DEFAULT 3 CHECK (competitor_count BETWEEN 1 AND 7),
  is_heavy_analysis BOOLEAN     NOT NULL DEFAULT false,  -- true when count >= 6

  -- Competitors selected (JSON array of CompetitorProfile objects)
  competitors       JSONB       NOT NULL DEFAULT '[]',

  -- Modules selected and their results
  modules_selected  TEXT[]      NOT NULL DEFAULT '{}',
  modules_completed TEXT[]      NOT NULL DEFAULT '{}',
  module_results    JSONB       NOT NULL DEFAULT '{}',   -- keyed by module_id

  -- Status tracking
  status            TEXT        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','discovering','running','completed','failed','partial')),
  progress_pct      SMALLINT    NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  current_task      TEXT,                                 -- e.g. "Analysing @competitor_x social media"
  error_message     TEXT,

  -- Coins
  coins_estimated   INTEGER     NOT NULL DEFAULT 0,
  coins_spent       INTEGER     NOT NULL DEFAULT 0,

  -- Business context at time of session (snapshot)
  business_snapshot JSONB       NOT NULL DEFAULT '{}',

  -- Timestamps
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ci_sessions_user    ON public.competitor_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ci_sessions_status  ON public.competitor_sessions (status);

ALTER TABLE public.competitor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_ci_sessions"
  ON public.competitor_sessions FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER competitor_sessions_updated_at
  BEFORE UPDATE ON public.competitor_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 2. Competitor profile cache ───────────────────────────────
-- Stores scraped data for individual competitors — reusable across sessions
CREATE TABLE IF NOT EXISTS public.competitor_cache (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_or_url   TEXT        NOT NULL,                  -- Instagram handle or website URL
  business_name   TEXT        NOT NULL,
  industry        TEXT,
  city            TEXT,
  size_tier       TEXT        CHECK (size_tier IN ('micro','small','medium','large')),

  -- Scraped data blobs (raw, before Claude analysis)
  instagram_data  JSONB       NOT NULL DEFAULT '{}',
  website_data    JSONB       NOT NULL DEFAULT '{}',
  ad_library_data JSONB       NOT NULL DEFAULT '{}',
  youtube_data    JSONB       NOT NULL DEFAULT '{}',
  facebook_data   JSONB       NOT NULL DEFAULT '{}',

  -- Metadata
  scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),

  CONSTRAINT unique_competitor_handle UNIQUE (handle_or_url)
);

CREATE INDEX IF NOT EXISTS idx_ci_cache_handle ON public.competitor_cache (handle_or_url);
CREATE INDEX IF NOT EXISTS idx_ci_cache_expires ON public.competitor_cache (expires_at);

-- ── 3. Discovery suggestions cache ───────────────────────────
-- Caches competitor discovery results per industry+city combination
CREATE TABLE IF NOT EXISTS public.competitor_discovery_cache (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key   TEXT        NOT NULL UNIQUE,  -- hash of industry+city+mode
  suggestions JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ── 4. Helper: get session with progress ─────────────────────
CREATE OR REPLACE FUNCTION public.get_session_progress(p_session_id UUID, p_user_id UUID)
RETURNS TABLE (
  id              UUID,
  status          TEXT,
  progress_pct    SMALLINT,
  current_task    TEXT,
  modules_completed TEXT[],
  module_results  JSONB,
  coins_spent     INTEGER,
  completed_at    TIMESTAMPTZ
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, status, progress_pct, current_task,
         modules_completed, module_results, coins_spent, completed_at
  FROM   public.competitor_sessions
  WHERE  id = p_session_id AND user_id = p_user_id;
$$;

-- ── 5. Cleanup job (run via cron or manually) ─────────────────
CREATE OR REPLACE FUNCTION public.cleanup_competitor_cache()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE deleted INTEGER;
BEGIN
  DELETE FROM public.competitor_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted = ROW_COUNT;
  DELETE FROM public.competitor_discovery_cache WHERE expires_at < NOW();
  RETURN deleted;
END;
$$;
