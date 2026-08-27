-- ═══════════════════════════════════════════════════════════════
-- Migration 014 — SME Club Hub (Phase 2)
-- Applied: August 2026
--
-- Creates the database layer for the SME Club community features:
--   club_challenges, club_challenge_entries, club_points_ledger,
--   club_templates, club_wins, club_hot_seat_applications,
--   club_whatsapp_joins
--
-- Rank thresholds:
--   Rookie        0–99 points
--   Builder     100–399 points
--   Operator    400–999 points
--   Growth Partner 1000+ points
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────

-- Monthly challenges
CREATE TABLE IF NOT EXISTS public.club_challenges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT DEFAULT 'general',
  month           TEXT NOT NULL,        -- '2026-08'
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  coin_reward     INTEGER NOT NULL DEFAULT 50,
  point_reward    INTEGER NOT NULL DEFAULT 100,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User submissions for a challenge
CREATE TABLE IF NOT EXISTS public.club_challenge_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id     UUID NOT NULL REFERENCES public.club_challenges(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL,
  submission_text  TEXT,
  submission_url   TEXT,
  status           TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  coins_awarded    INTEGER NOT NULL DEFAULT 0,
  points_awarded   INTEGER NOT NULL DEFAULT 0,
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Cumulative points ledger per user
CREATE TABLE IF NOT EXISTS public.club_points_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  points      INTEGER NOT NULL,
  action      TEXT NOT NULL,  -- win_approved | challenge_complete | hot_seat | template_download | session_complete | whatsapp_join
  reference   TEXT,           -- ID of the thing that triggered the award
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template Thursday drops
CREATE TABLE IF NOT EXISTS public.club_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,             -- captions | strategy | email | whatsapp | sales | ads
  file_url        TEXT,             -- Supabase Storage URL
  thumbnail_url   TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  download_count  INTEGER NOT NULL DEFAULT 0,
  week_label      TEXT,             -- 'Week 1 — Template Thursday'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Member win submissions
CREATE TABLE IF NOT EXISTS public.club_wins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  tool_used       TEXT,
  result_metric   TEXT,             -- '3 new clients', '₦50k extra revenue'
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | featured
  coins_awarded   INTEGER NOT NULL DEFAULT 10,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hot Seat applications
CREATE TABLE IF NOT EXISTS public.club_hot_seat_applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  business_name       TEXT NOT NULL,
  biggest_challenge   TEXT NOT NULL,
  desired_outcome     TEXT,
  available_dates     TEXT,
  status              TEXT NOT NULL DEFAULT 'pending', -- pending | scheduled | done | declined
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WhatsApp join source tracking
CREATE TABLE IF NOT EXISTS public.club_whatsapp_joins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,             -- null = anonymous
  source      TEXT,             -- utm_source or page slug
  medium      TEXT,
  campaign    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_club_points_user   ON public.club_points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_club_points_action ON public.club_points_ledger(action);
CREATE INDEX IF NOT EXISTS idx_club_wins_user     ON public.club_wins(user_id);
CREATE INDEX IF NOT EXISTS idx_club_wins_status   ON public.club_wins(status);
CREATE INDEX IF NOT EXISTS idx_club_entries_user  ON public.club_challenge_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_club_entries_chal  ON public.club_challenge_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_club_joins_user    ON public.club_whatsapp_joins(user_id);

-- ─────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────────────────────

-- Returns rank label from a point total
CREATE OR REPLACE FUNCTION public.get_club_rank(p_points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF p_points >= 1000 THEN RETURN 'Growth Partner';
  ELSIF p_points >= 400 THEN RETURN 'Operator';
  ELSIF p_points >= 100 THEN RETURN 'Builder';
  ELSE RETURN 'Rookie';
  END IF;
END;
$$;

-- Awards club points and optionally coins in one atomic call
CREATE OR REPLACE FUNCTION public.award_club_points(
  p_user_id   UUID,
  p_points    INTEGER,
  p_action    TEXT,
  p_reference TEXT DEFAULT NULL,
  p_notes     TEXT DEFAULT NULL,
  p_coins     INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Insert points entry
  INSERT INTO public.club_points_ledger(user_id, points, action, reference, notes)
  VALUES (p_user_id, p_points, p_action, p_reference, p_notes);

  -- Credit coins if applicable
  IF p_coins > 0 THEN
    PERFORM public.credit_coins(
      p_user_id,
      p_coins,
      'club_reward',
      COALESCE(p_notes, 'Club: ' || p_action)
    );
  END IF;
END;
$$;

-- Aggregate points for a user (used in leaderboard queries)
CREATE OR REPLACE VIEW public.club_member_totals AS
SELECT
  user_id,
  SUM(points) AS total_points,
  COUNT(*) AS actions_count,
  public.get_club_rank(SUM(points)::INTEGER) AS rank
FROM public.club_points_ledger
GROUP BY user_id;

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.club_challenges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_challenge_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_points_ledger      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_templates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_wins               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_hot_seat_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_whatsapp_joins     ENABLE ROW LEVEL SECURITY;

-- Challenges: everyone can read active ones
CREATE POLICY "Anyone can read challenges"
  ON public.club_challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role manages challenges"
  ON public.club_challenges FOR ALL
  TO service_role
  USING (true);

-- Challenge entries: users own their entries
CREATE POLICY "Users can view own entries"
  ON public.club_challenge_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can submit entries"
  ON public.club_challenge_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages entries"
  ON public.club_challenge_entries FOR ALL
  TO service_role
  USING (true);

-- Points: users can see their own
CREATE POLICY "Users can see own points"
  ON public.club_points_ledger FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages points"
  ON public.club_points_ledger FOR ALL
  TO service_role
  USING (true);

-- Templates: anyone authenticated can read published ones
CREATE POLICY "Authenticated users read published templates"
  ON public.club_templates FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Service role manages templates"
  ON public.club_templates FOR ALL
  TO service_role
  USING (true);

-- Wins: users own their wins; anyone can see approved ones
CREATE POLICY "Users can see own wins"
  ON public.club_wins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR status IN ('approved', 'featured'));

CREATE POLICY "Users can submit wins"
  ON public.club_wins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages wins"
  ON public.club_wins FOR ALL
  TO service_role
  USING (true);

-- Hot seat: users own their applications
CREATE POLICY "Users can see own hot seat apps"
  ON public.club_hot_seat_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can submit hot seat"
  ON public.club_hot_seat_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages hot seat"
  ON public.club_hot_seat_applications FOR ALL
  TO service_role
  USING (true);

-- WhatsApp joins: users track own
CREATE POLICY "Users can insert own joins"
  ON public.club_whatsapp_joins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service role manages joins"
  ON public.club_whatsapp_joins FOR ALL
  TO service_role
  USING (true);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_club_rank TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_club_points TO service_role;
GRANT SELECT ON public.club_member_totals TO authenticated, service_role;

