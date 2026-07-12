-- ═══════════════════════════════════════════════════════════════
-- V2 OUTPUT SYSTEM — RUN THIS IN SUPABASE SQL EDITOR
-- Adds structured JSON columns to generations table + coin RPCs.
-- Safe to run multiple times (all use IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════

-- 1. ADD V2 COLUMNS TO generations TABLE
ALTER TABLE generations ADD COLUMN IF NOT EXISTS output_json JSONB;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS deep_dive_json JSONB;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS schema_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS output_group TEXT;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS initial_coin_cost INTEGER;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS deep_dive_coin_cost INTEGER;

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_generations_output_json ON generations USING GIN (output_json);
CREATE INDEX IF NOT EXISTS idx_generations_schema_version ON generations (schema_version, user_id);
CREATE INDEX IF NOT EXISTS idx_generations_output_group ON generations (output_group, user_id);

-- 3. BACKFILL existing rows
UPDATE generations SET schema_version = 1 WHERE schema_version IS NULL;

-- 4. RPC: deduct_coins_initial (V2 70% upfront)
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
  SELECT balance INTO v_current_balance
    FROM coin_balances WHERE user_id = p_user_id FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('error', 'NO_BALANCE_ROW', 'success', false);
  END IF;

  IF v_current_balance < p_initial_cost THEN
    RETURN jsonb_build_object('error', 'INSUFFICIENT_COINS', 'success', false,
      'balance', v_current_balance, 'required', p_initial_cost);
  END IF;

  v_new_balance := v_current_balance - p_initial_cost;

  UPDATE coin_balances SET balance = v_new_balance, updated_at = NOW() WHERE user_id = p_user_id;

  INSERT INTO coin_transactions (user_id, amount, type, tool_id, generation_id, balance_after, description)
  VALUES (p_user_id, -p_initial_cost, 'deduction', p_tool_id, p_generation_id, v_new_balance,
    format('Initial generation (70%% of %s coins)', p_full_cost));

  UPDATE generations SET initial_coin_cost = p_initial_cost, coins_deducted = p_initial_cost WHERE id = p_generation_id;

  RETURN jsonb_build_object(
    'success', true, 'balance_before', v_current_balance,
    'balance_after', v_new_balance, 'deducted', p_initial_cost
  );
END;
$$;

-- 5. RPC: deduct_coins_deep_dive (V2 remaining 30%)
CREATE OR REPLACE FUNCTION public.deduct_coins_deep_dive(
  p_user_id        UUID,
  p_deep_dive_cost INTEGER,
  p_tool_id        TEXT,
  p_generation_id  UUID
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
    FROM coin_balances WHERE user_id = p_user_id FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('error', 'NO_BALANCE_ROW', 'success', false);
  END IF;

  IF v_current_balance < p_deep_dive_cost THEN
    RETURN jsonb_build_object('error', 'INSUFFICIENT_COINS', 'success', false,
      'balance', v_current_balance, 'required', p_deep_dive_cost);
  END IF;

  v_new_balance := v_current_balance - p_deep_dive_cost;

  UPDATE coin_balances SET balance = v_new_balance, updated_at = NOW() WHERE user_id = p_user_id;

  INSERT INTO coin_transactions (user_id, amount, type, tool_id, generation_id, balance_after, description)
  VALUES (p_user_id, -p_deep_dive_cost, 'deduction', p_tool_id, p_generation_id, v_new_balance,
    'Deep Dive generation (full coin cost)');

  UPDATE generations
    SET deep_dive_coin_cost = p_deep_dive_cost,
        coins_deducted = COALESCE(initial_coin_cost, 0) + p_deep_dive_cost
    WHERE id = p_generation_id;

  RETURN jsonb_build_object(
    'success', true, 'balance_before', v_current_balance,
    'balance_after', v_new_balance, 'deducted', p_deep_dive_cost
  );
END;
$$;

-- 6. GRANT permissions
GRANT EXECUTE ON FUNCTION public.deduct_coins_initial TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_coins_deep_dive TO authenticated;

-- 7. VERIFY (run after to confirm)
SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'generations'
  AND column_name IN ('output_json','deep_dive_json','schema_version','output_group','initial_coin_cost','deep_dive_coin_cost')
  ORDER BY column_name;
