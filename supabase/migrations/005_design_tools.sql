-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/005_design_tools.sql
-- Design Tools infrastructure for Cerebre Plus Option 2.
-- Run AFTER 001–004 migrations.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Brand DNA fields on existing profiles table ───────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS brand_primary_color     TEXT,
  ADD COLUMN IF NOT EXISTS brand_secondary_color   TEXT,
  ADD COLUMN IF NOT EXISTS brand_accent_color      TEXT,
  ADD COLUMN IF NOT EXISTS brand_background_color  TEXT DEFAULT '#0B1F3A',
  ADD COLUMN IF NOT EXISTS brand_font_style        TEXT DEFAULT 'modern'
                           CHECK (brand_font_style IN ('modern','classic','bold','elegant','playful')),
  ADD COLUMN IF NOT EXISTS brand_design_voice      TEXT DEFAULT 'professional'
                           CHECK (brand_design_voice IN ('professional','vibrant','warm','minimal','bold')),
  ADD COLUMN IF NOT EXISTS brand_logo_url          TEXT,
  ADD COLUMN IF NOT EXISTS brand_pattern_pref      TEXT DEFAULT 'none'
                           CHECK (brand_pattern_pref IN ('none','geometric','ankara','dots','lines')),
  ADD COLUMN IF NOT EXISTS brand_design_engine     TEXT DEFAULT 'standard'
                           CHECK (brand_design_engine IN ('standard','premium'));

-- ── 2. Design generations history ────────────────────────────
CREATE TABLE IF NOT EXISTS public.design_generations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id         TEXT        NOT NULL,
  tool_name       TEXT        NOT NULL,
  format          TEXT        NOT NULL,   -- 'square','portrait','landscape','story','thumbnail'
  engine          TEXT        NOT NULL CHECK (engine IN ('standard','premium')),
  prompt_summary  TEXT,                   -- short description of what was requested
  image_urls      TEXT[]      NOT NULL DEFAULT '{}',  -- 2 variant URLs on R2
  svg_content     TEXT,                   -- for logo generator: raw SVG code
  coins_spent     INTEGER     NOT NULL DEFAULT 0,
  brand_snapshot  JSONB       NOT NULL DEFAULT '{}',  -- brand DNA at time of generation
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_design_gen_user    ON public.design_generations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_design_gen_tool    ON public.design_generations (tool_id);

-- RLS
ALTER TABLE public.design_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_designs"
  ON public.design_generations
  FOR ALL
  USING (auth.uid() = user_id);

-- ── 3. Allowed credit_coins types: add 'design_generation' ───
-- If you have a CHECK constraint on coin_transactions.type, add 'design_generation' to it.
-- ALTER TYPE coin_transaction_type ADD VALUE 'design_generation';
-- Or if using a TEXT CHECK: run the ALTER TABLE below.
-- Uncomment if needed:
-- ALTER TABLE public.coin_transactions
--   DROP CONSTRAINT IF EXISTS coin_transactions_type_check;
-- ALTER TABLE public.coin_transactions
--   ADD CONSTRAINT coin_transactions_type_check
--   CHECK (type IN ('allocation','topup','deduction','admin_grant','referral','signup_bonus','design_generation'));

-- ── 4. Helper: credit_coins wrapper used by design routes ────
-- Uses the existing credit_coins / deduct_coins RPC if available.
-- If not, define a simple deduction function:
CREATE OR REPLACE FUNCTION public.deduct_design_coins(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_tool_id    TEXT,
  p_engine     TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Deduct from coin_balances
  UPDATE public.coin_balances
  SET    balance = balance - p_amount
  WHERE  user_id = p_user_id
    AND  balance >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient coin balance';
  END IF;

  -- Record transaction
  INSERT INTO public.coin_transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'deduction', -p_amount,
          'Design generation: ' || p_tool_id || ' (' || p_engine || ')');
END;
$$;

-- ── 5. Function: get_design_history ──────────────────────────
CREATE OR REPLACE FUNCTION public.get_design_history(
  p_user_id UUID,
  p_limit   INTEGER DEFAULT 20,
  p_offset  INTEGER DEFAULT 0
)
RETURNS TABLE (
  id          UUID,
  tool_id     TEXT,
  tool_name   TEXT,
  format      TEXT,
  engine      TEXT,
  image_urls  TEXT[],
  coins_spent INTEGER,
  created_at  TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, tool_id, tool_name, format, engine, image_urls, coins_spent, created_at
  FROM   public.design_generations
  WHERE  user_id = p_user_id
  ORDER  BY created_at DESC
  LIMIT  p_limit OFFSET p_offset;
$$;
