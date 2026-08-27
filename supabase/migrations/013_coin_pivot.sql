-- ═══════════════════════════════════════════════════════════════
-- Migration 013 — Coin Economy Pivot (Phase 1)
-- Applied: August 2026
-- FIXED: subscriptions table wrapped in existence check
--        (some schemas never had this table)
--
-- Changes:
--   1. Disable free plan expiry — coins don't expire
--   2. Fix handle_new_user — 70 signup coins, no subscription row
--   3. Un-expire existing free plans (if subscriptions table exists)
--   4. Open SME Club to all users
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. Disable expire_free_plans (make it a no-op)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.expire_free_plans()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- PHASE 1: Free plan expiry is disabled. Coins don't expire.
  RETURN 0;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 2. Fix handle_new_user — 70 signup coins, no subscription row
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_full_name TEXT;
  v_email     TEXT;
BEGIN
  v_email     := NEW.email;
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (NEW.id, v_email, v_full_name, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Initialise coin balance
  INSERT INTO public.coin_balances (user_id, balance, lifetime_earned)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Credit 70 signup coins (no expiry — Phase 1 model)
  PERFORM public.credit_coins(
    NEW.id,
    70,
    'signup_bonus',
    '70 free Cerebre Coins — welcome gift'
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. Un-expire existing free plans (only if subscriptions exists)
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'subscriptions'
  ) THEN
    UPDATE public.subscriptions
    SET
      free_expires_at = '2099-12-31 23:59:59+00',
      status          = 'active'
    WHERE plan_tier = 'free'
      AND free_expires_at IS NOT NULL
      AND free_expires_at < NOW();

    COMMENT ON TABLE public.subscriptions IS
      'SOFT DEPRECATED (Phase 1 — August 2026). '
      'Coin economy pivot removed plan-tier gating. '
      'Do not add new gating logic based on plan_tier.';

    RAISE NOTICE 'subscriptions table found — free plans un-expired.';
  ELSE
    RAISE NOTICE 'No subscriptions table found — skipping (this is fine).';
  END IF;
END
$$;

-- ─────────────────────────────────────────────────────────────
-- 4. SME Club RLS — open access to all authenticated users
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'sme_club_sessions'
  ) THEN
    -- Drop any Growth-only policies
    DROP POLICY IF EXISTS "Growth members can view sessions"
      ON public.sme_club_sessions;
    DROP POLICY IF EXISTS "growth_only_sessions"
      ON public.sme_club_sessions;

    -- Ensure all authenticated users can read published sessions
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename  = 'sme_club_sessions'
        AND policyname = 'Authenticated users can view published sessions'
    ) THEN
      EXECUTE '
        CREATE POLICY "Authenticated users can view published sessions"
          ON public.sme_club_sessions
          FOR SELECT
          TO authenticated
          USING (is_published = true)
      ';
    END IF;

    RAISE NOTICE 'sme_club_sessions RLS updated.';
  ELSE
    RAISE NOTICE 'No sme_club_sessions table found — skipping RLS update.';
  END IF;
END
$$;

