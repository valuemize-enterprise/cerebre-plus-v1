-- ═══════════════════════════════════════════════════════════════
-- CEREBRE PLUS — Complete Database Schema
-- Migration: 001_complete_schema.sql
-- Platform: Supabase (PostgreSQL 15)
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy search on generations

-- ═══════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE plan_tier AS ENUM (
  'free',
  'starter',
  'growth',
  'premium'
);

CREATE TYPE billing_period AS ENUM (
  'monthly',
  'annual'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'cancelled',
  'past_due',
  'paused',
  'trialing',
  'expired'
);

CREATE TYPE coin_transaction_type AS ENUM (
  'deduction',        -- Tool usage
  'allocation',       -- Monthly subscription allocation
  'topup',            -- Purchased top-up pack
  'referral_bonus',   -- Earned from referral conversion
  'signup_bonus',     -- Welcome coins
  'refund',           -- Generation failed refund
  'admin_grant',      -- Manual admin credit
  'rollover',         -- Premium plan rollover
  'expiry'            -- Expired coins removed
);

CREATE TYPE generation_status AS ENUM (
  'pending',
  'streaming',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE notification_type AS ENUM (
  'coin_low',
  'coin_topup',
  'generation_complete',
  'milestone',
  'referral_earned',
  'subscription_renewed',
  'subscription_expiring',
  'plan_upgraded',
  'welcome',
  'system'
);

CREATE TYPE referral_status AS ENUM (
  'pending',
  'signed_up',
  'converted',        -- Referred user became paying subscriber
  'rewarded'
);

CREATE TYPE onboarding_step AS ENUM (
  'account_created',
  'step1_business_basics',
  'step2_industry_audience',
  'step3_social_contact',
  'step4_brand_voice',
  'magic_moment_completed',
  'complete'
);

CREATE TYPE brand_voice_type AS ENUM (
  'professional',
  'friendly',
  'bold_direct',
  'storytelling',
  'luxury',
  'educational',
  'youthful_energetic'
);

CREATE TYPE content_type AS ENUM (
  'social_caption',
  'ad_copy',
  'email_sequence',
  'whatsapp_message',
  'blog_post',
  'video_script',
  'strategy',
  'sales_script',
  'press_release',
  'product_description',
  'bio',
  'content_calendar',
  'carousel_script',
  'story_plan',
  'whatsapp_campaign',
  'follow_up_sequence',
  'welcome_message',
  'promo_blast',
  'campaign_plan',
  'audience_profile',
  'launch_plan',
  'brand_positioning',
  'pricing_narrative',
  'budget_plan',
  'ad_plan',
  'retargeting_plan',
  'influencer_brief',
  'google_ads',
  'sales_funnel',
  'lead_magnet',
  'proposal',
  'testimonial_request',
  'review_request',
  'crisis_response',
  'seo_kit',
  'keyword_research',
  'website_audit',
  'referral_program',
  'newsletter',
  'winback_campaign',
  'general'
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: users (extends Supabase auth.users)
-- ═══════════════════════════════════════════════════════════════

-- Note: auth.users is managed by Supabase Auth.
-- We extend it via the profiles table.

-- ═══════════════════════════════════════════════════════════════
-- TABLE: profiles
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.profiles (
  -- Identity
  user_id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                       TEXT NOT NULL,
  full_name                   TEXT,
  avatar_url                  TEXT,

  -- Business core
  business_name               TEXT,
  industry                    TEXT,
  industry_custom             TEXT,
  city                        TEXT,
  state                       TEXT,
  country                     TEXT NOT NULL DEFAULT 'Nigeria',
  years_in_business           INTEGER CHECK (years_in_business >= 0 AND years_in_business <= 100),
  description                 TEXT,                        -- What the business does
  unique_advantage            TEXT,                        -- What makes it different
  target_customer             TEXT,                        -- Who they sell to

  -- Brand voice & personality
  brand_voice                 brand_voice_type DEFAULT 'professional',
  language_preference         TEXT DEFAULT 'Nigerian English',
  primary_cta                 TEXT,                        -- Main call-to-action phrase

  -- Pricing
  price_range                 TEXT,                        -- e.g. "₦5,000 – ₦25,000"
  price_low                   INTEGER,                     -- Numeric for awoof math
  price_high                  INTEGER,

  -- Social proof
  social_proof                TEXT,                        -- "Over 2,400 clients served"
  client_count                INTEGER,
  years_combined              INTEGER,

  -- Media
  logo_url                    TEXT,
  brand_colour                TEXT DEFAULT '#E09818',
  brand_colour_secondary      TEXT,

  -- Contact
  whatsapp                    TEXT,
  phone                       TEXT,
  email_contact               TEXT,
  address                     TEXT,
  business_hours              TEXT,
  website_url                 TEXT,

  -- Social handles
  instagram                   TEXT,
  facebook                    TEXT,
  linkedin                    TEXT,
  tiktok                      TEXT,
  twitter                     TEXT,
  youtube                     TEXT,

  -- Marketing intelligence
  marketing_challenges        JSONB DEFAULT '[]'::JSONB,  -- Array of challenge strings
  top_products                JSONB DEFAULT '[]'::JSONB,  -- Top products/services
  competitors                 JSONB DEFAULT '[]'::JSONB,  -- Known competitors
  target_locations            JSONB DEFAULT '[]'::JSONB,  -- Cities/regions targeted

  -- Profile quality
  profile_completeness_score  INTEGER DEFAULT 0 CHECK (profile_completeness_score >= 0 AND profile_completeness_score <= 100),

  -- Onboarding
  onboarding_complete         BOOLEAN DEFAULT FALSE,
  onboarding_step             onboarding_step DEFAULT 'account_created',
  magic_moment_completed      BOOLEAN DEFAULT FALSE,
  magic_moment_tool_id        TEXT,

  -- Plan & billing
  plan_tier                   plan_tier DEFAULT 'free',
  referred_by                 UUID REFERENCES public.profiles(id),

  -- Metadata
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: subscriptions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Plan details
  plan_tier               plan_tier NOT NULL,
  billing_period          billing_period NOT NULL DEFAULT 'monthly',
  coins_per_period        INTEGER NOT NULL,
  price_naira             INTEGER NOT NULL,
  price_usd               INTEGER,

  -- Status
  status                  subscription_status NOT NULL DEFAULT 'active',

  -- Paystack
  paystack_subscription_code  TEXT UNIQUE,
  paystack_plan_code          TEXT,
  paystack_customer_code      TEXT,
  paystack_email_token        TEXT,

  -- Dates
  current_period_start    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end      TIMESTAMPTZ NOT NULL,
  trial_end               TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata                JSONB DEFAULT '{}'::JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: coin_balances
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.coin_balances (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Balance breakdown
  balance                 INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned         INTEGER NOT NULL DEFAULT 0,  -- All coins ever credited
  lifetime_spent          INTEGER NOT NULL DEFAULT 0,  -- All coins ever deducted
  rollover_coins          INTEGER NOT NULL DEFAULT 0,  -- Unused coins carried from last period (premium only)

  -- Lock for atomic updates
  version                 INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  last_allocated_at       TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: coin_transactions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.coin_transactions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Transaction details
  type                    coin_transaction_type NOT NULL,
  amount                  INTEGER NOT NULL,              -- Positive = credit, negative = debit
  balance_after           INTEGER NOT NULL,              -- Balance after transaction

  -- Context
  tool_id                 TEXT,
  generation_id           UUID,
  description             TEXT NOT NULL,
  reference               TEXT,                          -- External reference (Paystack txn ID, etc.)

  -- Metadata
  metadata                JSONB DEFAULT '{}'::JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: generations
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.generations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Tool context
  tool_id                 TEXT NOT NULL,
  tool_name               TEXT NOT NULL,
  tool_category           TEXT NOT NULL,

  -- Content
  input_data              JSONB NOT NULL DEFAULT '{}'::JSONB,
  output_content          TEXT,
  output_metadata         JSONB DEFAULT '{}'::JSONB,

  -- Cost
  coins_deducted          INTEGER NOT NULL DEFAULT 0,

  -- Status
  status                  generation_status NOT NULL DEFAULT 'pending',
  error_message           TEXT,

  -- Akin Alabi intelligence applied
  laws_applied            JSONB DEFAULT '[]'::JSONB,     -- Which of the 10 laws were applied

  -- Save/share
  is_saved                BOOLEAN DEFAULT FALSE,
  saved_title             TEXT,
  saved_at                TIMESTAMPTZ,
  share_token             TEXT UNIQUE,
  shared_at               TIMESTAMPTZ,

  -- Performance tracking
  generation_time_ms      INTEGER,                       -- How long it took to generate
  token_count             INTEGER,                       -- Anthropic token usage

  -- Metadata
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: saved_library
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.saved_library (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id           UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,

  -- Organisation
  title                   TEXT NOT NULL,
  tags                    JSONB DEFAULT '[]'::JSONB,
  folder                  TEXT,
  is_favourite            BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, generation_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: share_tokens
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.share_tokens (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token                   TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'base64url'),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id           UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,

  -- Access control
  is_active               BOOLEAN DEFAULT TRUE,
  view_count              INTEGER DEFAULT 0,
  max_views               INTEGER,                       -- NULL = unlimited

  -- Expiry
  expires_at              TIMESTAMPTZ,

  -- Metadata
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: referrals
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.referrals (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referrer
  referrer_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code           TEXT NOT NULL,

  -- Referred user
  referred_email          TEXT,
  referred_user_id        UUID REFERENCES public.profiles(id),

  -- Status
  status                  referral_status NOT NULL DEFAULT 'pending',

  -- Rewards
  coins_awarded           INTEGER DEFAULT 0,
  awarded_at              TIMESTAMPTZ,

  -- Tracking
  clicked_at              TIMESTAMPTZ,
  signed_up_at            TIMESTAMPTZ,
  converted_at            TIMESTAMPTZ,                   -- First paid subscription

  -- Metadata
  metadata                JSONB DEFAULT '{}'::JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: notifications
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.notifications (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Content
  type                    notification_type NOT NULL,
  title                   TEXT NOT NULL,
  message                 TEXT NOT NULL,
  icon                    TEXT,
  action_url              TEXT,
  action_label            TEXT,

  -- State
  is_read                 BOOLEAN DEFAULT FALSE,
  read_at                 TIMESTAMPTZ,

  -- Metadata
  metadata                JSONB DEFAULT '{}'::JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: waitlist
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.waitlist (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                   TEXT NOT NULL UNIQUE,
  full_name               TEXT,
  business_name           TEXT,
  city                    TEXT,
  industry                TEXT,
  referral_source         TEXT,
  position                INTEGER,                       -- Queue position
  invited_at              TIMESTAMPTZ,                   -- When we sent their invite
  joined_at               TIMESTAMPTZ,                   -- When they actually signed up
  user_id                 UUID REFERENCES public.profiles(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: team_members
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.team_members (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role                    TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(owner_id, member_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: onboarding_progress
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.onboarding_progress (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Steps completed (JSONB for flexibility)
  steps_completed         JSONB DEFAULT '[]'::JSONB,
  current_step            INTEGER DEFAULT 1,
  total_steps             INTEGER DEFAULT 5,

  -- Partial data saved between steps
  step1_data              JSONB DEFAULT '{}'::JSONB,
  step2_data              JSONB DEFAULT '{}'::JSONB,
  step3_data              JSONB DEFAULT '{}'::JSONB,
  step4_data              JSONB DEFAULT '{}'::JSONB,

  -- Completion
  completed_at            TIMESTAMPTZ,
  skipped                 BOOLEAN DEFAULT FALSE,
  skipped_at              TIMESTAMPTZ,

  -- Metadata
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: content_ideas_cache
-- (AI-generated content ideas shown on dashboard)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.content_ideas_cache (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Ideas
  ideas                   JSONB NOT NULL DEFAULT '[]'::JSONB,
  generated_for_week      INTEGER,                       -- ISO week number
  generated_for_year      INTEGER,

  -- Freshness
  generated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: insights_cache
-- (AI-generated business insights)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.insights_cache (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Insight
  insight_text            TEXT NOT NULL,
  insight_type            TEXT NOT NULL DEFAULT 'general',
  action_suggestion       TEXT,

  -- Freshness
  generated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '3 days')
);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: milestones
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.milestones (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_key           TEXT NOT NULL,                 -- e.g. 'first_generation', '10_generations'
  milestone_label         TEXT NOT NULL,
  celebration_shown       BOOLEAN DEFAULT FALSE,
  celebrated_at           TIMESTAMPTZ,

  -- Metadata
  achieved_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, milestone_key)
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

-- profiles
CREATE INDEX idx_profiles_plan_tier        ON public.profiles(plan_tier);
CREATE INDEX idx_profiles_onboarding       ON public.profiles(onboarding_complete);
CREATE INDEX idx_profiles_referred_by      ON public.profiles(referred_by);
CREATE INDEX idx_profiles_created_at       ON public.profiles(created_at DESC);
CREATE INDEX idx_profiles_email            ON public.profiles(email);

-- subscriptions
CREATE INDEX idx_subscriptions_user_id     ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status      ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_period_end  ON public.subscriptions(current_period_end);
CREATE INDEX idx_subscriptions_paystack    ON public.subscriptions(paystack_subscription_code);

-- coin_balances
CREATE INDEX idx_coin_balances_user_id     ON public.coin_balances(user_id);

-- coin_transactions
CREATE INDEX idx_coin_txn_user_id          ON public.coin_transactions(user_id);
CREATE INDEX idx_coin_txn_type             ON public.coin_transactions(type);
CREATE INDEX idx_coin_txn_created_at       ON public.coin_transactions(created_at DESC);
CREATE INDEX idx_coin_txn_generation_id    ON public.coin_transactions(generation_id);

-- generations
CREATE INDEX idx_generations_user_id       ON public.generations(user_id);
CREATE INDEX idx_generations_tool_id       ON public.generations(tool_id);
CREATE INDEX idx_generations_status        ON public.generations(status);
CREATE INDEX idx_generations_is_saved      ON public.generations(is_saved) WHERE is_saved = TRUE;
CREATE INDEX idx_generations_created_at    ON public.generations(created_at DESC);
CREATE INDEX idx_generations_share_token   ON public.generations(share_token) WHERE share_token IS NOT NULL;
-- Full text search on output
CREATE INDEX idx_generations_output_fts    ON public.generations USING gin(to_tsvector('english', COALESCE(output_content, '')));

-- saved_library
CREATE INDEX idx_saved_library_user_id     ON public.saved_library(user_id);
CREATE INDEX idx_saved_library_gen_id      ON public.saved_library(generation_id);
CREATE INDEX idx_saved_library_folder      ON public.saved_library(folder);

-- referrals
CREATE INDEX idx_referrals_referrer_id     ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user   ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_code            ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status          ON public.referrals(status);

-- notifications
CREATE INDEX idx_notifications_user_id     ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read     ON public.notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at  ON public.notifications(created_at DESC);

-- share_tokens
CREATE INDEX idx_share_tokens_token        ON public.share_tokens(token);
CREATE INDEX idx_share_tokens_user_id      ON public.share_tokens(user_id);
CREATE INDEX idx_share_tokens_expires_at   ON public.share_tokens(expires_at);

-- milestones
CREATE INDEX idx_milestones_user_id        ON public.milestones(user_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — Enable on all tables
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_balances         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_library         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_tokens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas_cache   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights_cache        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones            ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- ── profiles ────────────────────────────────────────────────

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can insert (via trigger)
CREATE POLICY "Service role can insert profile"
  ON public.profiles FOR INSERT
  WITH CHECK (TRUE);

-- ── subscriptions ────────────────────────────────────────────

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── coin_balances ────────────────────────────────────────────

CREATE POLICY "Users can view own coin balance"
  ON public.coin_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages coin balances"
  ON public.coin_balances FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── coin_transactions ────────────────────────────────────────

CREATE POLICY "Users can view own coin transactions"
  ON public.coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages coin transactions"
  ON public.coin_transactions FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── generations ──────────────────────────────────────────────

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can view a generation with a valid share token (no auth needed)
CREATE POLICY "Public can view shared generations"
  ON public.generations FOR SELECT
  USING (share_token IS NOT NULL);

-- ── saved_library ────────────────────────────────────────────

CREATE POLICY "Users can manage own saved library"
  ON public.saved_library FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── share_tokens ─────────────────────────────────────────────

CREATE POLICY "Users can manage own share tokens"
  ON public.share_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read active share tokens"
  ON public.share_tokens FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- ── referrals ────────────────────────────────────────────────

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Service role manages referrals"
  ON public.referrals FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── notifications ────────────────────────────────────────────

CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert notifications for any user
CREATE POLICY "Service role can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (TRUE);

-- ── waitlist ─────────────────────────────────────────────────

CREATE POLICY "Public can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service role manages waitlist"
  ON public.waitlist FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── team_members ─────────────────────────────────────────────

CREATE POLICY "Owners can manage their team"
  ON public.team_members FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Members can view teams they are in"
  ON public.team_members FOR SELECT
  USING (auth.uid() = member_id);

-- ── onboarding_progress ──────────────────────────────────────

CREATE POLICY "Users can manage own onboarding progress"
  ON public.onboarding_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── content_ideas_cache ──────────────────────────────────────

CREATE POLICY "Users can manage own content ideas"
  ON public.content_ideas_cache FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── insights_cache ───────────────────────────────────────────

CREATE POLICY "Users can manage own insights"
  ON public.insights_cache FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── milestones ───────────────────────────────────────────────

CREATE POLICY "Users can view own milestones"
  ON public.milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages milestones"
  ON public.milestones FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- ── handle_new_user() ────────────────────────────────────────
-- Triggered on auth.users INSERT
-- Creates profile + coin_balance + onboarding_progress + referral entry

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code    TEXT;
  v_referred_by      UUID;
  v_signup_coins     INTEGER := 30;  -- Free plan signup bonus
BEGIN
  -- 1. Create profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    plan_tier
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free'
  );

  -- 2. Create coin balance with signup bonus
  INSERT INTO public.coin_balances (
    user_id,
    balance,
    lifetime_earned
  ) VALUES (
    NEW.id,
    v_signup_coins,
    v_signup_coins
  );

  -- 3. Record signup bonus transaction
  INSERT INTO public.coin_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description
  ) VALUES (
    NEW.id,
    'signup_bonus',
    v_signup_coins,
    v_signup_coins,
    'Welcome to Cerebre Plus! Your starter coins are ready.'
  );

  -- 4. Create onboarding progress
  INSERT INTO public.onboarding_progress (
    user_id,
    current_step,
    steps_completed
  ) VALUES (
    NEW.id,
    1,
    '["account_created"]'::JSONB
  );

  -- 5. Create welcome notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    icon,
    action_url,
    action_label
  ) VALUES (
    NEW.id,
    'welcome',
    'Welcome to Cerebre Plus! 🎉',
    'Your ' || v_signup_coins || ' starter coins are ready. Complete your business profile to get personalised AI marketing built for your business.',
    '🪙',
    '/onboarding',
    'Complete Profile'
  );

  -- 6. Handle referral if present in metadata
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  IF v_referral_code IS NOT NULL THEN
    -- Find referrer
    SELECT referrer_id INTO v_referred_by
    FROM public.referrals
    WHERE referral_code = v_referral_code
      AND status = 'pending'
    LIMIT 1;

    IF v_referred_by IS NOT NULL THEN
      -- Update referral record
      UPDATE public.referrals
      SET
        referred_user_id = NEW.id,
        referred_email   = NEW.email,
        status           = 'signed_up',
        signed_up_at     = NOW()
      WHERE referral_code = v_referral_code AND status = 'pending';

      -- Update referred user's profile
      UPDATE public.profiles
      SET referred_by = v_referred_by
      WHERE id = NEW.id;
    END IF;
  END IF;

  -- 7. Create unique referral code for the new user
  INSERT INTO public.referrals (
    referrer_id,
    referral_code
  ) VALUES (
    NEW.id,
    upper(encode(gen_random_bytes(4), 'hex'))
  );

  RETURN NEW;
END;
$$;

-- Attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── deduct_coins() ───────────────────────────────────────────
-- Atomically deducts coins from a user's balance.
-- Returns the new balance or raises an exception if insufficient.

CREATE OR REPLACE FUNCTION public.deduct_coins(
  p_user_id       UUID,
  p_amount        INTEGER,
  p_tool_id       TEXT,
  p_generation_id UUID,
  p_description   TEXT DEFAULT NULL
)
RETURNS TABLE (
  success         BOOLEAN,
  new_balance     INTEGER,
  error_message   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance   INTEGER;
  v_new_balance       INTEGER;
  v_description       TEXT;
BEGIN
  -- Lock the row for update
  SELECT balance INTO v_current_balance
  FROM public.coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Coin balance record not found';
    RETURN;
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient coins. Please top up to continue.';
    RETURN;
  END IF;

  v_new_balance := v_current_balance - p_amount;
  v_description := COALESCE(p_description, 'Used ' || p_amount || ' coins for ' || p_tool_id);

  -- Deduct balance
  UPDATE public.coin_balances
  SET
    balance        = v_new_balance,
    lifetime_spent = lifetime_spent + p_amount,
    version        = version + 1,
    updated_at     = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO public.coin_transactions (
    user_id,
    type,
    amount,
    balance_after,
    tool_id,
    generation_id,
    description
  ) VALUES (
    p_user_id,
    'deduction',
    -p_amount,
    v_new_balance,
    p_tool_id,
    p_generation_id,
    v_description
  );

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;


-- ── credit_coins() ───────────────────────────────────────────
-- Credits coins to a user's balance with a reason.

CREATE OR REPLACE FUNCTION public.credit_coins(
  p_user_id       UUID,
  p_amount        INTEGER,
  p_type          coin_transaction_type,
  p_description   TEXT,
  p_reference     TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance   INTEGER;
BEGIN
  -- Lock and update
  UPDATE public.coin_balances
  SET
    balance         = balance + p_amount,
    lifetime_earned = lifetime_earned + p_amount,
    version         = version + 1,
    updated_at      = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Coin balance not found for user %', p_user_id;
  END IF;

  -- Record transaction
  INSERT INTO public.coin_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    reference
  ) VALUES (
    p_user_id,
    p_type,
    p_amount,
    v_new_balance,
    p_description,
    p_reference
  );
END;
$$;


-- ── refund_coins() ───────────────────────────────────────────
-- Refunds coins when a generation fails after deduction.

CREATE OR REPLACE FUNCTION public.refund_coins(
  p_user_id       UUID,
  p_amount        INTEGER,
  p_generation_id UUID,
  p_tool_id       TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.credit_coins(
    p_user_id,
    p_amount,
    'refund'::coin_transaction_type,
    'Refund: Generation failed for ' || p_tool_id || '. Your coins have been returned.',
    p_generation_id::TEXT
  );
END;
$$;


-- ── get_profile_completeness() ───────────────────────────────
-- Calculates and returns profile completeness as a 0-100 integer.

CREATE OR REPLACE FUNCTION public.get_profile_completeness(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile          RECORD;
  v_score            INTEGER := 0;
  v_max_score        INTEGER := 100;
  -- Weight map: field => points
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Business basics (40 points total)
  IF v_profile.business_name IS NOT NULL AND length(trim(v_profile.business_name)) > 0   THEN v_score := v_score + 10; END IF;
  IF v_profile.industry IS NOT NULL AND length(trim(v_profile.industry)) > 0             THEN v_score := v_score + 5;  END IF;
  IF v_profile.city IS NOT NULL AND length(trim(v_profile.city)) > 0                     THEN v_score := v_score + 5;  END IF;
  IF v_profile.description IS NOT NULL AND length(trim(v_profile.description)) > 20      THEN v_score := v_score + 10; END IF;
  IF v_profile.target_customer IS NOT NULL AND length(trim(v_profile.target_customer)) > 10 THEN v_score := v_score + 10; END IF;

  -- Contact (20 points)
  IF v_profile.whatsapp IS NOT NULL AND length(trim(v_profile.whatsapp)) > 0             THEN v_score := v_score + 10; END IF;
  IF v_profile.phone IS NOT NULL AND length(trim(v_profile.phone)) > 0                   THEN v_score := v_score + 5;  END IF;
  IF v_profile.email_contact IS NOT NULL AND length(trim(v_profile.email_contact)) > 0   THEN v_score := v_score + 5;  END IF;

  -- Brand (15 points)
  IF v_profile.brand_voice IS NOT NULL                                                    THEN v_score := v_score + 5;  END IF;
  IF v_profile.unique_advantage IS NOT NULL AND length(trim(v_profile.unique_advantage)) > 10 THEN v_score := v_score + 5; END IF;
  IF v_profile.primary_cta IS NOT NULL AND length(trim(v_profile.primary_cta)) > 0       THEN v_score := v_score + 5;  END IF;

  -- Social proof (10 points)
  IF v_profile.social_proof IS NOT NULL AND length(trim(v_profile.social_proof)) > 5     THEN v_score := v_score + 10; END IF;

  -- Social media (15 points)
  IF v_profile.instagram IS NOT NULL AND length(trim(v_profile.instagram)) > 0           THEN v_score := v_score + 5;  END IF;
  IF v_profile.facebook IS NOT NULL AND length(trim(v_profile.facebook)) > 0             THEN v_score := v_score + 5;  END IF;
  IF v_profile.whatsapp IS NOT NULL AND length(trim(v_profile.whatsapp)) > 0             THEN v_score := v_score + 0;  END IF; -- Already counted above
  IF v_profile.logo_url IS NOT NULL AND length(trim(v_profile.logo_url)) > 0             THEN v_score := v_score + 5;  END IF;

  -- Cap at 100
  v_score := LEAST(v_score, v_max_score);

  -- Update the profile record
  UPDATE public.profiles
  SET profile_completeness_score = v_score,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_score;
END;
$$;


-- ── check_and_award_milestone() ──────────────────────────────
-- Checks if a user has reached a milestone and awards it.
-- Returns the milestone_key if newly awarded, NULL otherwise.

CREATE OR REPLACE FUNCTION public.check_and_award_milestone(
  p_user_id          UUID,
  p_milestone_key    TEXT,
  p_milestone_label  TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_awarded BOOLEAN;
BEGIN
  -- Check if already awarded
  SELECT EXISTS(
    SELECT 1 FROM public.milestones
    WHERE user_id = p_user_id AND milestone_key = p_milestone_key
  ) INTO v_already_awarded;

  IF v_already_awarded THEN
    RETURN NULL;
  END IF;

  -- Insert milestone
  INSERT INTO public.milestones (
    user_id,
    milestone_key,
    milestone_label
  ) VALUES (
    p_user_id,
    p_milestone_key,
    p_milestone_label
  )
  ON CONFLICT (user_id, milestone_key) DO NOTHING;

  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    icon
  ) VALUES (
    p_user_id,
    'milestone',
    'Milestone unlocked! 🏆',
    'You just unlocked: ' || p_milestone_label || '. Keep going!',
    '🏆'
  );

  RETURN p_milestone_key;
END;
$$;


-- ── allocate_monthly_coins() ─────────────────────────────────
-- Called by cron job at start of each billing period.
-- Allocates coins based on subscription tier.

CREATE OR REPLACE FUNCTION public.allocate_monthly_coins(
  p_user_id       UUID,
  p_plan_tier     plan_tier,
  p_coins         INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance   INTEGER;
  v_rollover_coins    INTEGER := 0;
  v_rollover_cap      INTEGER := 0;
BEGIN
  SELECT balance INTO v_current_balance
  FROM public.coin_balances
  WHERE user_id = p_user_id;

  -- Premium plan: rollover up to 80 unused coins
  IF p_plan_tier = 'premium' THEN
    v_rollover_cap := 80;
    v_rollover_coins := LEAST(v_current_balance, v_rollover_cap);
  END IF;

  -- Growth plan: rollover up to 30 unused coins
  IF p_plan_tier = 'growth' THEN
    v_rollover_cap := 30;
    v_rollover_coins := LEAST(v_current_balance, v_rollover_cap);
  END IF;

  -- Set new balance to allocated coins + rollover
  UPDATE public.coin_balances
  SET
    balance             = p_coins + v_rollover_coins,
    rollover_coins      = v_rollover_coins,
    lifetime_earned     = lifetime_earned + p_coins,
    last_allocated_at   = NOW(),
    version             = version + 1,
    updated_at          = NOW()
  WHERE user_id = p_user_id;

  -- Record allocation transaction
  INSERT INTO public.coin_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description
  ) VALUES (
    p_user_id,
    'allocation',
    p_coins + v_rollover_coins,
    p_coins + v_rollover_coins,
    'Monthly coin allocation: ' || p_coins || ' new coins' ||
    CASE WHEN v_rollover_coins > 0 THEN ' + ' || v_rollover_coins || ' rolled over' ELSE '' END
  );

  -- Send notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    icon,
    action_url,
    action_label
  ) VALUES (
    p_user_id,
    'subscription_renewed',
    'Your Cerebre coins are refreshed! 🪙',
    'Your ' || (p_coins + v_rollover_coins) || ' coins for this month are ready. Time to create something great.',
    '🪙',
    '/dashboard',
    'Start Creating'
  );
END;
$$;


-- ── get_user_referral_code() ─────────────────────────────────
-- Returns the user's referral code (creates one if missing)

CREATE OR REPLACE FUNCTION public.get_user_referral_code(
  p_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  SELECT referral_code INTO v_code
  FROM public.referrals
  WHERE referrer_id = p_user_id
  LIMIT 1;

  IF v_code IS NULL THEN
    v_code := upper(encode(gen_random_bytes(4), 'hex'));
    INSERT INTO public.referrals (referrer_id, referral_code)
    VALUES (p_user_id, v_code)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_code;
END;
$$;


-- ── process_referral_conversion() ────────────────────────────
-- Called when a referred user makes their first payment.

CREATE OR REPLACE FUNCTION public.process_referral_conversion(
  p_referred_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id       UUID;
  v_referral_id       UUID;
  v_referral_coins    INTEGER := 20;
BEGIN
  -- Find the referrer
  SELECT p.referred_by INTO v_referrer_id
  FROM public.profiles p
  WHERE p.id = p_referred_user_id;

  IF v_referrer_id IS NULL THEN
    RETURN;
  END IF;

  -- Find the referral record
  SELECT id INTO v_referral_id
  FROM public.referrals
  WHERE referrer_id = v_referrer_id
    AND referred_user_id = p_referred_user_id
    AND status = 'signed_up';

  IF v_referral_id IS NULL THEN
    RETURN;
  END IF;

  -- Update referral status
  UPDATE public.referrals
  SET
    status          = 'rewarded',
    coins_awarded   = v_referral_coins,
    awarded_at      = NOW(),
    converted_at    = NOW()
  WHERE id = v_referral_id;

  -- Credit referrer with coins
  PERFORM public.credit_coins(
    v_referrer_id,
    v_referral_coins,
    'referral_bonus'::coin_transaction_type,
    'Referral reward! A business you referred just subscribed to Cerebre Plus.',
    p_referred_user_id::TEXT
  );

  -- Notify referrer
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    icon
  ) VALUES (
    v_referrer_id,
    'referral_earned',
    'You earned ' || v_referral_coins || ' referral coins! 🎉',
    'A business you referred just subscribed to Cerebre Plus. Your ' || v_referral_coins || ' bonus coins have been added.',
    '🎁'
  );
END;
$$;


-- ── updated_at trigger function ───────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_coin_balances_updated_at
  BEFORE UPDATE ON public.coin_balances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_saved_library_updated_at
  BEFORE UPDATE ON public.saved_library
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_onboarding_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ═══════════════════════════════════════════════════════════════
-- VIEWS (convenient read-only aggregates, no RLS needed on views
--        as they inherit from underlying table policies)
-- ═══════════════════════════════════════════════════════════════

-- ── User dashboard summary
CREATE OR REPLACE VIEW public.user_dashboard_summary AS
SELECT
  p.id                       AS user_id,
  p.business_name,
  p.plan_tier,
  p.profile_completeness_score,
  p.onboarding_complete,
  p.magic_moment_completed,
  cb.balance                 AS coin_balance,
  cb.lifetime_spent          AS total_coins_spent,
  cb.lifetime_earned         AS total_coins_earned,
  COUNT(DISTINCT g.id)       AS total_generations,
  COUNT(DISTINCT CASE WHEN g.is_saved THEN g.id END) AS saved_count,
  MAX(g.created_at)          AS last_generation_at,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'rewarded') AS successful_referrals
FROM public.profiles p
LEFT JOIN public.coin_balances cb ON cb.user_id = p.id
LEFT JOIN public.generations g    ON g.user_id  = p.id AND g.status = 'completed'
LEFT JOIN public.referrals r      ON r.referrer_id = p.id
GROUP BY p.id, p.business_name, p.plan_tier, p.profile_completeness_score,
         p.onboarding_complete, p.magic_moment_completed,
         cb.balance, cb.lifetime_spent, cb.lifetime_earned;

-- ── Tool usage stats (last 30 days)
CREATE OR REPLACE VIEW public.tool_usage_stats AS
SELECT
  tool_id,
  tool_name,
  tool_category,
  COUNT(*) AS total_uses,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(coins_deducted) AS avg_coins,
  AVG(generation_time_ms) AS avg_generation_ms,
  DATE_TRUNC('day', created_at) AS usage_date
FROM public.generations
WHERE status = 'completed'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY tool_id, tool_name, tool_category, DATE_TRUNC('day', created_at);

-- ═══════════════════════════════════════════════════════════════
-- GRANTS (for service role and anon)
-- ═══════════════════════════════════════════════════════════════

-- Grant usage to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Anon can only access waitlist and shared tokens
GRANT SELECT ON public.share_tokens TO anon;
GRANT INSERT ON public.waitlist TO anon;
GRANT SELECT ON public.generations TO anon;

-- Service role gets everything
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════

-- ── Additional columns for features added post-initial-schema ───────────────
-- Run these if upgrading from an older version of the schema

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "weekly_pulse_email": true,
    "weekly_pulse_whatsapp": false,
    "low_coins_notification": true,
    "milestone_notification": true,
    "marketing_emails": true
  }'::JSONB,
  ADD COLUMN IF NOT EXISTS founding_member BOOLEAN DEFAULT FALSE;

-- credit_coins RPC: accepts TEXT type, coerces to enum safely
CREATE OR REPLACE FUNCTION public.credit_coins(
  p_user_id       UUID,
  p_amount        INT,
  p_type          TEXT DEFAULT 'admin_grant',
  p_description   TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_type coin_transaction_type;
  v_balance_after INTEGER;
BEGIN
  BEGIN
    v_type := p_type::coin_transaction_type;
  EXCEPTION WHEN invalid_text_representation THEN
    v_type := 'admin_grant'::coin_transaction_type;
  END;
  INSERT INTO public.coin_balances (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE
    SET balance = coin_balances.balance + p_amount, updated_at = NOW()
  RETURNING balance INTO v_balance_after;
  INSERT INTO public.coin_transactions (user_id, amount, type, balance_after, description, created_at)
  VALUES (p_user_id, p_amount, v_type, COALESCE(v_balance_after, p_amount), p_description, NOW());
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;
