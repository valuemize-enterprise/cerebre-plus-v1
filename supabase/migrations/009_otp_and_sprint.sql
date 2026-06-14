-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/009_otp_and_sprint.sql
-- OTP email verification, free tool tracking, sprint blueprint.
-- Run AFTER 001–008 migrations.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Email OTP table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_otps (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  code         TEXT        NOT NULL,                  -- 6-digit numeric string
  expires_at   TIMESTAMPTZ NOT NULL,                  -- 10 minutes from creation
  verified     BOOLEAN     NOT NULL DEFAULT false,
  attempts     SMALLINT    NOT NULL DEFAULT 0,        -- max 5 attempts
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_email   ON public.email_otps (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.email_otps (expires_at);

-- Clean up expired OTPs (call from cron or after verification)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE deleted INTEGER;
BEGIN
  DELETE FROM public.email_otps WHERE expires_at < NOW() - INTERVAL '1 hour';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;

-- ── 2. Extend profiles table ──────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS free_tool_used      BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_tool_id        TEXT,       -- which free tool they ran
  ADD COLUMN IF NOT EXISTS primary_goal        TEXT,       -- onboarding: what they want most
  ADD COLUMN IF NOT EXISTS primary_challenge   TEXT,       -- onboarding: biggest obstacle
  ADD COLUMN IF NOT EXISTS target_customers    TEXT,       -- onboarding: who they serve
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN     NOT NULL DEFAULT false;

-- ── 3. Rate-limit OTP sends ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.otp_sends_in_last_hour(p_email TEXT)
RETURNS INTEGER LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INTEGER
  FROM   public.email_otps
  WHERE  email      = p_email
    AND  created_at > NOW() - INTERVAL '1 hour';
$$;

-- ── 4. Free tool whitelist ────────────────────────────────────
-- Tools eligible for the free-first-run offer
CREATE TABLE IF NOT EXISTS public.free_tool_eligibility (
  tool_id     TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  description TEXT,
  emoji       TEXT,
  coin_value  INTEGER NOT NULL DEFAULT 15  -- coins this would normally cost
);

INSERT INTO public.free_tool_eligibility (tool_id, label, description, emoji, coin_value) VALUES
  ('caption-craft',          'CaptionCraft',            'Generate a week of Instagram captions tailored to your brand voice.',              '📝', 15),
  ('whatsapp-campaign-builder','WhatsApp Campaign',     'Write a complete WhatsApp broadcast campaign that converts — ready to send.',       '💬', 20),
  ('brand-positioner',       'Brand Positioner',        'Define your unique market position in a paragraph your customers will remember.',   '🎯', 15),
  ('ad-scribe',              'Ad Scribe',               'Write a Facebook or Instagram ad that stops the scroll.',                          '📢', 15),
  ('content-calendar',       'Content Calendar',        'Plan 30 days of social media content in one session.',                             '📅', 25),
  ('competitor-intelligence','Competitor Intel',        'Discover what your top competitor is doing in ads and social media right now.',     '🔍', 30),
  ('sprint-blueprint',       '60-Day Sprint Blueprint', 'Build your 60-day revenue execution plan based on your goals and resources.',      '🚀', 50)
ON CONFLICT (tool_id) DO NOTHING;
