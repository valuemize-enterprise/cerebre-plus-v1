-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/004_admin_system.sql
-- Admin console infrastructure.
-- Run AFTER 001, 002, 003 migrations.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Admin profiles (role + invite chain) ───────────────────
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        UNIQUE NOT NULL,
  name         TEXT        NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'support'
                           CHECK (role IN ('super_admin','admin','support','analyst')),
  invited_by   UUID        REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  last_login   TIMESTAMPTZ,
  permissions  JSONB       NOT NULL DEFAULT '{}'::jsonb,  -- extra grants/revokes
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Admin sessions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id       UUID        NOT NULL REFERENCES public.admin_profiles(id) ON DELETE CASCADE,
  ip_address     TEXT,
  user_agent     TEXT,
  logged_in_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logged_out_at  TIMESTAMPTZ,
  is_active      BOOLEAN     NOT NULL DEFAULT true
);

-- ── 3. Audit log (immutable — no UPDATE, no DELETE) ───────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID        REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  admin_email TEXT,        -- denormalized in case admin is later deleted
  action      TEXT        NOT NULL,  -- e.g. 'upgrade_plan', 'grant_coins'
  resource    TEXT,                   -- 'user', 'subscription', etc.
  resource_id TEXT,                   -- ID of the affected row
  details     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id   ON public.admin_audit_log (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action      ON public.admin_audit_log (action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created     ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_resource_id ON public.admin_audit_log (resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin    ON public.admin_sessions (admin_id);

-- Prevent mutation of audit log (security: immutable history)
CREATE OR REPLACE RULE no_update_audit AS ON UPDATE TO public.admin_audit_log DO INSTEAD NOTHING;
CREATE OR REPLACE RULE no_delete_audit AS ON DELETE TO public.admin_audit_log DO INSTEAD NOTHING;

-- ── 4. RLS ────────────────────────────────────────────────────
ALTER TABLE public.admin_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- All admin tables: service role only (all admin API routes use service role client)
CREATE POLICY "service_all_admin_profiles"  ON public.admin_profiles  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_admin_sessions"  ON public.admin_sessions  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_admin_audit_log" ON public.admin_audit_log FOR ALL USING (auth.role() = 'service_role');

-- ── 5. Function: create_super_admin (run once to bootstrap) ──
-- Call this once via SQL Editor to create the first super admin:
-- SELECT public.create_super_admin('wale@cerebreplus.com', 'Wale Ekundayo');
CREATE OR REPLACE FUNCTION public.create_super_admin(
  p_email TEXT,
  p_name  TEXT
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id UUID; v_admin_id UUID;
BEGIN
  -- Check if already exists
  SELECT id INTO v_admin_id FROM public.admin_profiles WHERE email = p_email;
  IF v_admin_id IS NOT NULL THEN RETURN 'Admin already exists: ' || p_email; END IF;
  -- Get or create auth user
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RETURN 'No auth.users row for ' || p_email || '. Ask them to sign up first, then run this.';
  END IF;
  INSERT INTO public.admin_profiles (user_id, email, name, role)
  VALUES (v_user_id, p_email, p_name, 'super_admin');
  RETURN 'Super admin created: ' || p_email;
END;
$$;

-- ── 6. Function: write_audit_log ─────────────────────────────
CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_admin_id    UUID,
  p_admin_email TEXT,
  p_action      TEXT,
  p_resource    TEXT,
  p_resource_id TEXT,
  p_details     JSONB,
  p_ip_address  TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.admin_audit_log
    (admin_id, admin_email, action, resource, resource_id, details, ip_address)
  VALUES
    (p_admin_id, p_admin_email, p_action, p_resource, p_resource_id, p_details, p_ip_address);
END;
$$;

-- ── 7. Function: expire_admin_sessions (cron daily) ──────────
CREATE OR REPLACE FUNCTION public.expire_admin_sessions()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.admin_sessions
  SET is_active = false, logged_out_at = NOW()
  WHERE is_active = true
    AND last_active_at < NOW() - INTERVAL '2 hours';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
