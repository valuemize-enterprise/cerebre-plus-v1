-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/006_ratings.sql
-- User feedback and rating system for all Cerebre Plus outputs.
-- Run AFTER 001–005 migrations.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Core ratings table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.output_ratings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who & what was rated
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id         TEXT        NOT NULL,               -- e.g. 'caption-craft'
  tool_category   TEXT        NOT NULL DEFAULT 'text', -- 'text' | 'design' | 'whatsapp' | 'strategy'
  generation_id   TEXT,                               -- links to a specific generation record

  -- The actual rating
  thumbs          TEXT        CHECK (thumbs IN ('up','down')),
  stars           SMALLINT    CHECK (stars BETWEEN 1 AND 5),

  -- Quick-tag feedback
  feedback_tags   TEXT[]      NOT NULL DEFAULT '{}',  -- see tag lists below

  -- Free-text feedback
  feedback_text   TEXT,                               -- optional typed comment

  -- Variant preference (for design tools with 2–3 variants)
  preferred_variant  SMALLINT,                        -- 1, 2, or 3

  -- Context captured at rating time
  plan_tier       TEXT,                               -- free | starter | growth
  engine          TEXT,                               -- standard | premium (design tools)
  coins_spent     INTEGER,                            -- how many coins this generation cost
  had_brand_profile BOOLEAN DEFAULT false,            -- was brand DNA set? (design tools)

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for admin analytics queries
CREATE INDEX IF NOT EXISTS idx_ratings_tool      ON public.output_ratings (tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_user      ON public.output_ratings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_thumbs    ON public.output_ratings (thumbs, tool_id);
CREATE INDEX IF NOT EXISTS idx_ratings_stars     ON public.output_ratings (stars, tool_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created   ON public.output_ratings (created_at DESC);

-- RLS — users can create their own ratings and read their own
ALTER TABLE public.output_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_create_own_ratings"
  ON public.output_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_read_own_ratings"
  ON public.output_ratings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins read all (via service role key)

-- ── 2. Rating aggregates (materialized view) ──────────────────
-- Used by admin dashboard for fast tool-level stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.tool_rating_stats AS
SELECT
  tool_id,
  tool_category,
  COUNT(*)                                          AS total_ratings,
  COUNT(*) FILTER (WHERE thumbs = 'up')             AS thumbs_up,
  COUNT(*) FILTER (WHERE thumbs = 'down')           AS thumbs_down,
  ROUND(
    COUNT(*) FILTER (WHERE thumbs = 'up')::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                 AS satisfaction_pct,
  ROUND(AVG(stars) FILTER (WHERE stars IS NOT NULL), 2) AS avg_stars,
  COUNT(*) FILTER (WHERE feedback_text IS NOT NULL AND length(feedback_text) > 5) AS has_text_feedback
FROM public.output_ratings
GROUP BY tool_id, tool_category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_rating_stats_tool
  ON public.tool_rating_stats (tool_id);

-- Refresh function (call this periodically or via cron)
CREATE OR REPLACE FUNCTION public.refresh_rating_stats()
RETURNS VOID LANGUAGE sql AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.tool_rating_stats;
$$;

-- ── 3. Helper: get_platform_satisfaction ─────────────────────
-- Used on admin dashboard for overall NPS-style score
CREATE OR REPLACE FUNCTION public.get_platform_satisfaction(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_ratings     BIGINT,
  thumbs_up_pct     NUMERIC,
  avg_stars         NUMERIC,
  most_loved_tool   TEXT,
  needs_work_tool   TEXT
) LANGUAGE sql SECURITY DEFINER AS $$
  WITH recent AS (
    SELECT * FROM public.output_ratings
    WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
  ),
  tool_up AS (
    SELECT tool_id,
           ROUND(COUNT(*) FILTER (WHERE thumbs='up')::NUMERIC / NULLIF(COUNT(*),0)*100,1) AS pct
    FROM recent GROUP BY tool_id HAVING COUNT(*) >= 5
  )
  SELECT
    COUNT(*)::BIGINT,
    ROUND(COUNT(*) FILTER (WHERE thumbs='up')::NUMERIC / NULLIF(COUNT(*),0)*100, 1),
    ROUND(AVG(stars) FILTER (WHERE stars IS NOT NULL), 2),
    (SELECT tool_id FROM tool_up ORDER BY pct DESC  LIMIT 1),
    (SELECT tool_id FROM tool_up ORDER BY pct ASC   LIMIT 1)
  FROM recent;
$$;
