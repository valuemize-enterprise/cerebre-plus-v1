-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/003_referrals_and_prefs.sql
--
-- Adds:
--   1. notification_preferences JSONB column to profiles
--   2. referrals table (tracks referrer → referred user)
--
-- Safe to re-run (IF NOT EXISTS throughout).
-- Run AFTER 001_complete_schema.sql and 002_billing_updates.sql.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. notification_preferences on profiles ───────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB
    NOT NULL DEFAULT '{
      "weekly_pulse_email":      true,
      "weekly_pulse_whatsapp":   false,
      "low_coins_warning":       true,
      "milestone_notifications": true,
      "referral_updates":        true,
      "sme_club_updates":        true,
      "marketing_emails":        true
    }'::jsonb;

-- Index for querying users who have a specific preference on
CREATE INDEX IF NOT EXISTS idx_profiles_notif_prefs
  ON public.profiles USING gin (notification_preferences);

-- ── 2. referrals table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email    TEXT,                              -- stored at signup before user exists
  referred_plan     TEXT,                              -- 'starter' | 'growth'
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','converted','expired')),
  coins_earned      INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at      TIMESTAMPTZ,
  CONSTRAINT unique_referred_user UNIQUE (referred_user_id)  -- one referral per user
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id
  ON public.referrals (referrer_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id
  ON public.referrals (referred_user_id);

CREATE INDEX IF NOT EXISTS idx_referrals_status
  ON public.referrals (status);

-- ── 3. Row Level Security ─────────────────────────────────────

-- Referrals: users can only read their own rows as referrer
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrer_read_own" ON public.referrals;
CREATE POLICY "referrer_read_own"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Service role can do everything (for webhook + server calls)
DROP POLICY IF EXISTS "service_all" ON public.referrals;
CREATE POLICY "service_all"
  ON public.referrals FOR ALL
  USING (auth.role() = 'service_role');

-- ── 4. Function: record_referral ─────────────────────────────
-- Called during signup when ?ref=XXXXXXXX is present in the URL.
-- Looks up the referrer by their code (first 8 chars of UUID without dashes).
CREATE OR REPLACE FUNCTION public.record_referral(
  p_referred_user_id UUID,
  p_referred_email   TEXT,
  p_referral_code    TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Find the referrer whose stripped UUID starts with the code
  SELECT id INTO v_referrer_id
  FROM auth.users
  WHERE UPPER(REPLACE(id::text, '-', '')) LIKE (UPPER(p_referral_code) || '%')
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN;  -- Invalid referral code — silently skip
  END IF;

  -- Don't let users refer themselves
  IF v_referrer_id = p_referred_user_id THEN
    RETURN;
  END IF;

  INSERT INTO public.referrals (
    referrer_id, referred_user_id, referred_email, status
  )
  VALUES (v_referrer_id, p_referred_user_id, p_referred_email, 'pending')
  ON CONFLICT (referred_user_id) DO NOTHING;  -- idempotent
END;
$$;

-- ── 5. Expire old pending referrals (cron) ────────────────────
-- Referrals that haven't converted within 90 days are expired.
CREATE OR REPLACE FUNCTION public.expire_old_referrals()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.referrals
  SET status = 'expired'
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ── 6. Cron: expire referrals weekly ─────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'expire-old-referrals',
      '0 2 * * 1',  -- Every Monday at 2AM UTC
      $$SELECT public.expire_old_referrals()$$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
