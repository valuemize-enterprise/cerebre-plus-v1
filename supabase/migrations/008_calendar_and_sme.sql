-- ═══════════════════════════════════════════════════════════════
-- /supabase/migrations/008_calendar_and_sme.sql
-- Visual Content Calendar, SME Club delivery, email notification logs.
-- Run AFTER 001–007 migrations.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Content Calendar Events ────────────────────────────────
-- Stores structured calendar events parsed from the content calendar tool output.
CREATE TABLE IF NOT EXISTS public.content_calendar_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id   TEXT,                               -- links to tool_generations record
  month_year      TEXT        NOT NULL,               -- e.g. '2025-06'
  scheduled_date  DATE        NOT NULL,
  platform        TEXT        NOT NULL                -- instagram | facebook | whatsapp | tiktok | linkedin | youtube | twitter
                  CHECK (platform IN ('instagram','facebook','whatsapp','tiktok','linkedin','youtube','twitter')),
  content_type    TEXT        NOT NULL                -- image | video | carousel | reel | story | text | broadcast
                  CHECK (content_type IN ('image','video','carousel','reel','story','text','broadcast')),
  caption         TEXT,
  hashtags        TEXT,
  visual_note     TEXT,                               -- creative direction / what the image should show
  best_time       TEXT,                               -- e.g. "7–9pm"
  status          TEXT        NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','published','skipped')),
  sort_order      SMALLINT    NOT NULL DEFAULT 0,     -- order within the day
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cal_user_month   ON public.content_calendar_events (user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_cal_user_date    ON public.content_calendar_events (user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cal_status       ON public.content_calendar_events (user_id, status);

ALTER TABLE public.content_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_calendar" ON public.content_calendar_events
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER cal_events_updated_at
  BEFORE UPDATE ON public.content_calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 2. SME Club Sessions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sme_club_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_number   SMALLINT    NOT NULL,
  title            TEXT        NOT NULL,
  description      TEXT,
  category         TEXT        NOT NULL DEFAULT 'strategy'
                   CHECK (category IN ('strategy','social-media','brand','sales','finance','operations','digital','content')),
  video_url        TEXT,                              -- YouTube/Vimeo/Loom embed URL
  thumbnail_url    TEXT,
  duration_minutes SMALLINT    DEFAULT 45,
  resources        JSONB       NOT NULL DEFAULT '[]', -- [{title, url, type:'pdf'|'template'|'link'}]
  key_takeaways    TEXT[],                            -- 3–5 bullet point takeaways
  is_published     BOOLEAN     NOT NULL DEFAULT false,
  is_free_preview  BOOLEAN     NOT NULL DEFAULT false, -- Growth-plan normally, but this one is free
  scheduled_for    DATE,                              -- when it becomes available
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sme_session_number ON public.sme_club_sessions (session_number);
CREATE INDEX IF NOT EXISTS idx_sme_published ON public.sme_club_sessions (is_published, scheduled_for);

CREATE TRIGGER sme_sessions_updated_at
  BEFORE UPDATE ON public.sme_club_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 3. SME Club Progress ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sme_club_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id   UUID        NOT NULL REFERENCES public.sme_club_sessions(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'not_started'
               CHECK (status IN ('not_started','in_progress','completed')),
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes        TEXT,                              -- user's own notes on the session
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_sme_progress_user ON public.sme_club_progress (user_id, session_id);

ALTER TABLE public.sme_club_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_progress" ON public.sme_club_progress
  FOR ALL USING (auth.uid() = user_id);

-- ── 4. Email Notifications Log ────────────────────────────────
-- Tracks every sent email to prevent duplicate sends and enable analytics.
CREATE TABLE IF NOT EXISTS public.email_notifications_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  email_address TEXT        NOT NULL,
  email_type    TEXT        NOT NULL,   -- welcome | weekly_digest | coin_alert | sme_new_session | competitor_complete | plan_upgrade | referral_reward
  subject       TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'sent'
                CHECK (status IN ('sent','failed','bounced')),
  resend_id     TEXT,                  -- Resend message ID for tracking
  metadata      JSONB       NOT NULL DEFAULT '{}',
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_user   ON public.email_notifications_log (user_id, email_type, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_type   ON public.email_notifications_log (email_type, sent_at DESC);

-- ── 5. User Notification Preferences ─────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id           UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_digest     BOOLEAN NOT NULL DEFAULT true,
  coin_alerts       BOOLEAN NOT NULL DEFAULT true,
  sme_new_sessions  BOOLEAN NOT NULL DEFAULT true,
  product_updates   BOOLEAN NOT NULL DEFAULT true,
  marketing_tips    BOOLEAN NOT NULL DEFAULT false,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_prefs" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ── 6. Helper: check if email was sent recently ───────────────
CREATE OR REPLACE FUNCTION public.was_email_sent_recently(
  p_user_id   UUID,
  p_type      TEXT,
  p_hours     INTEGER DEFAULT 168  -- 7 days default
)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.email_notifications_log
    WHERE user_id   = p_user_id
      AND email_type= p_type
      AND status    = 'sent'
      AND sent_at   > NOW() - (p_hours || ' hours')::INTERVAL
  );
$$;

-- ── 7. Seed: 3 sample SME Club sessions ──────────────────────
INSERT INTO public.sme_club_sessions (session_number, title, description, category, duration_minutes, key_takeaways, is_published, is_free_preview, scheduled_for)
VALUES
  (1, 'The Nigerian Marketing Bible — Principles That Actually Convert', 'Master the core principles from Akin Alabi''s marketing framework adapted for the current Nigerian market. Why fear, awoof, and social proof outperform Western frameworks in Lagos.', 'strategy', 48, ARRAY['Fear-based copy converts 3× better than benefit-based copy in Nigeria''s market','The "awoof" (value) hook must come before the price — always','Social proof from relatable local figures beats celebrity endorsements'], true, true, CURRENT_DATE - 7),
  (2, 'WhatsApp as a Business Engine — The Complete Playbook', 'Turn your WhatsApp into a 24/7 sales machine. Broadcast lists, status marketing, catalogue setup, and the exact message sequences that Nigerian buyers respond to.', 'social-media', 55, ARRAY['A 200-contact broadcast list properly nurtured generates more revenue than 10,000 Instagram followers','Status posts between 7–9pm get 3× more views than morning posts','The 3-message nurture sequence: value → social proof → CTA'], true, false, CURRENT_DATE),
  (3, 'Building Your Brand on a Budget — Visual Identity for SMEs', 'Create a professional brand identity without hiring an agency. Color psychology for Nigerian consumers, font psychology, and how to make ₦5,000 designs look like ₦500,000 ones.', 'brand', 42, ARRAY['Gold and navy signal premium to Nigerian consumers; avoid blue-and-white for food brands','Consistency beats quality — post mediocre content consistently rather than great content occasionally','Your logo is the last thing that sells — your story is the first'], false, false, CURRENT_DATE + 7)
ON CONFLICT (session_number) DO NOTHING;
