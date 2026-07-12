-- ═══════════════════════════════════════════════════════════════
-- migrations/001_output_system_v2.sql
-- Output System v2.0 — adds structured JSON storage to generations table.
-- Run ONCE on production database before any code deployment.
-- Safe to run multiple times (all statements use IF NOT EXISTS / IF EXISTS).
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. ADD NEW COLUMNS TO generations TABLE
-- ─────────────────────────────────────────────────────────────

-- Structured JSON output from the initial (Layer 1 + 2) generation call
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS output_json JSONB;

-- Structured JSON output from the Deep Dive (Layer 3) generation call
-- Null until the user explicitly requests "Tell me more"
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS deep_dive_json JSONB;

-- Schema version — identifies which output system produced this row.
-- 1 = legacy text-only (existing rows)
-- 2 = structured JSON (new rows from output system v2.0)
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS schema_version INTEGER NOT NULL DEFAULT 1;

-- Output group — mirrors the tool's outputGroup field in the registry
-- Allows the history page to know which component to render without
-- re-fetching tool registry data.
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS output_group TEXT;

-- Initial coin cost stored separately from total coin_cost
-- so we have a record of what was paid for Layer 2 vs Layer 3
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS initial_coin_cost INTEGER;

-- Deep dive coin cost (appended when Deep Dive is generated)
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS deep_dive_coin_cost INTEGER;

-- ─────────────────────────────────────────────────────────────
-- 2. PERFORMANCE INDEXES
-- ─────────────────────────────────────────────────────────────

-- GIN index for fast JSON querying on history page
CREATE INDEX IF NOT EXISTS idx_generations_output_json
  ON generations USING GIN (output_json);

-- Index for schema_version filter (history page differentiates old vs new)
CREATE INDEX IF NOT EXISTS idx_generations_schema_version
  ON generations (schema_version, user_id);

-- Index for output_group filter (history page filters by tool category)
CREATE INDEX IF NOT EXISTS idx_generations_output_group
  ON generations (output_group, user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. BACKFILL schema_version on existing rows
-- ─────────────────────────────────────────────────────────────
-- All existing rows are schema_version = 1 (legacy text output)
-- The DEFAULT 1 handles new rows; this ensures existing rows are marked too.

UPDATE generations
  SET schema_version = 1
  WHERE schema_version IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 4. RPC: deduct_coins_initial
-- New version of deduct_coins that uses the pre-calculated initial cost
-- rather than the full tool coin cost.
-- The existing deduct_coins RPC remains unchanged for backward compat.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.deduct_coins_initial(
  p_user_id       UUID,
  p_initial_cost  INTEGER,
  p_full_cost     INTEGER,
  p_tool_id       TEXT,
  p_generation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance     INTEGER;
BEGIN
  -- Lock the user's coin balance row for this transaction
  SELECT balance INTO v_current_balance
    FROM coin_balances
    WHERE user_id = p_user_id
    FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('error', 'NO_BALANCE_ROW', 'success', false);
  END IF;

  IF v_current_balance < p_initial_cost THEN
    RETURN jsonb_build_object('error', 'INSUFFICIENT_COINS', 'success', false,
      'balance', v_current_balance, 'required', p_initial_cost);
  END IF;

  v_new_balance := v_current_balance - p_initial_cost;

  -- Deduct from balance
  UPDATE coin_balances
    SET balance     = v_new_balance,
        updated_at  = NOW()
    WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO coin_transactions (
    user_id, amount, type, tool_id, generation_id, balance_after, description
  ) VALUES (
    p_user_id, -p_initial_cost, 'deduction', p_tool_id, p_generation_id,
    v_new_balance,
    format('Initial generation (70%% of %s coins)', p_full_cost)
  );

  -- Update the generation row with coin cost info
  UPDATE generations
    SET initial_coin_cost = p_initial_cost,
        coins_deducted   = p_initial_cost
    WHERE id = p_generation_id;

  RETURN jsonb_build_object(
    'success',       true,
    'balance_before', v_current_balance,
    'balance_after',  v_new_balance,
    'deducted',      p_initial_cost
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. RPC: deduct_coins_deep_dive
-- Called when the user taps "Tell me more" and the Deep Dive is generated.
-- Appends the Deep Dive cost to the existing generation row.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.deduct_coins_deep_dive(
  p_user_id       UUID,
  p_deep_dive_cost INTEGER,
  p_tool_id       TEXT,
  p_generation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance     INTEGER;
BEGIN
  SELECT balance INTO v_current_balance
    FROM coin_balances
    WHERE user_id = p_user_id
    FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('error', 'NO_BALANCE_ROW', 'success', false);
  END IF;

  IF v_current_balance < p_deep_dive_cost THEN
    RETURN jsonb_build_object('error', 'INSUFFICIENT_COINS', 'success', false,
      'balance', v_current_balance, 'required', p_deep_dive_cost);
  END IF;

  v_new_balance := v_current_balance - p_deep_dive_cost;

  UPDATE coin_balances
    SET balance    = v_new_balance,
        updated_at = NOW()
    WHERE user_id = p_user_id;

  INSERT INTO coin_transactions (
    user_id, amount, type, tool_id, generation_id, balance_after, description
  ) VALUES (
    p_user_id, -p_deep_dive_cost, 'deduction', p_tool_id, p_generation_id,
    v_new_balance, 'Deep Dive generation (full coin cost)'
  );

  -- Append the Deep Dive cost to the generation row's total
  UPDATE generations
    SET deep_dive_coin_cost = p_deep_dive_cost,
        coins_deducted     = COALESCE(initial_coin_cost, 0) + p_deep_dive_cost
    WHERE id = p_generation_id;

  RETURN jsonb_build_object(
    'success',       true,
    'balance_before', v_current_balance,
    'balance_after',  v_new_balance,
    'deducted',      p_deep_dive_cost
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 6. GRANT permissions
-- ─────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION public.deduct_coins_initial TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_coins_deep_dive TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES (run after migration to confirm success)
-- ─────────────────────────────────────────────────────────────

-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'generations'
--   AND column_name IN ('output_json','deep_dive_json','schema_version','output_group','initial_coin_cost','deep_dive_coin_cost')
--   ORDER BY column_name;

-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--   AND routine_name IN ('deduct_coins_initial', 'deduct_coins_deep_dive');
