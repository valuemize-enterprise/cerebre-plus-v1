-- ═══════════════════════════════════════════════════════════════
-- 012 — Unique email constraint on profiles
-- Prevents duplicate accounts when a user signs up via email
-- and later authenticates with Google OAuth (same email).
-- ═══════════════════════════════════════════════════════════════

-- 1. Deduplicate: keep the oldest profile per email, delete the rest
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn
  FROM public.profiles
)
DELETE FROM public.profiles
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2. Add unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles (email);
