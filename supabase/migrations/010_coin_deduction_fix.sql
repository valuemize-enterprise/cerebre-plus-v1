-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/010_coin_deduction_fix.sql
-- Creates or replaces the deduct_design_coins RPC function.
-- This function is called by the design generation API to deduct coins.
-- If this function is missing, the API falls back to direct table updates,
-- but having this RPC ensures atomicity (coin balance + transaction log
-- update together in a single database transaction).
-- Run in Supabase SQL Editor AFTER migrations 001–009.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.deduct_design_coins(
  p_user_id  UUID,
  p_amount   INTEGER,
  p_tool_id  TEXT,
  p_engine   TEXT DEFAULT 'standard'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance     INTEGER;
BEGIN
  -- Lock the balance row to prevent race conditions
  SELECT balance INTO v_current_balance
  FROM   public.coin_balances
  WHERE  user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coin balance record not found for user %', p_user_id;
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient coins: have %, need %', v_current_balance, p_amount;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Update balance
  UPDATE public.coin_balances
  SET    balance    = v_new_balance,
         updated_at = NOW()
  WHERE  user_id = p_user_id;

  -- Log the transaction
  INSERT INTO public.coin_transactions (
    user_id, amount, type, tool_id, description, created_at
  ) VALUES (
    p_user_id,
    -p_amount,
    'deduction',
    p_tool_id,
    p_tool_id || ' design generation (' || p_engine || ')',
    NOW()
  );
END;
$$;

-- Also ensure deduct_design_coins is accessible via service role
GRANT EXECUTE ON FUNCTION public.deduct_design_coins(UUID, INTEGER, TEXT, TEXT)
  TO service_role;

-- ── Verify the function exists (run this after to confirm) ────
-- SELECT proname, prosrc IS NOT NULL AS has_body
-- FROM pg_proc
-- WHERE proname = 'deduct_design_coins';
