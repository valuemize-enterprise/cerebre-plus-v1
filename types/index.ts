// ═══════════════════════════════════════════════════════════════
// CEREBRE PLUS — Complete TypeScript Type Definitions
// types/index.ts
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// ENUMS & LITERAL TYPES
// ─────────────────────────────────────────────────────────────

export type PlanTier = 'free' | 'starter' | 'growth' | 'premium'

export type BillingPeriod = 'monthly' | 'annual'

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'expired'

export type CoinTransactionType =
  | 'deduction'
  | 'allocation'
  | 'topup'
  | 'referral_bonus'
  | 'signup_bonus'
  | 'refund'
  | 'admin_grant'
  | 'rollover'
  | 'expiry'

export type GenerationStatus =
  | 'pending'
  | 'streaming'
  | 'completed'
  | 'failed'
  | 'refunded'

export type NotificationType =
  | 'coin_low'
  | 'coin_topup'
  | 'generation_complete'
  | 'milestone'
  | 'referral_earned'
  | 'subscription_renewed'
  | 'subscription_expiring'
  | 'plan_upgraded'
  | 'welcome'
  | 'system'

export type ReferralStatus =
  | 'pending'
  | 'signed_up'
  | 'converted'
  | 'rewarded'

export type OnboardingStep =
  | 'account_created'
  | 'step1_business_basics'
  | 'step2_industry_audience'
  | 'step3_social_contact'
  | 'step4_brand_voice'
  | 'magic_moment_completed'
  | 'complete'

export type BrandVoice =
  | 'professional'
  | 'friendly'
  | 'bold_direct'
  | 'storytelling'
  | 'luxury'
  | 'educational'
  | 'youthful_energetic'

export enum ToolCategory {
  COPYWRITING  = 'Copywriting & Content',
  PLANNING     = 'Content Planning',
  WHATSAPP     = 'WhatsApp Marketing',
  STRATEGY     = 'AI Strategy & CMO Brain',
  ADVERTISING  = 'Paid Advertising',
  SALES        = 'Sales & Lead Conversion',
  REPUTATION   = 'Reputation & Trust',
  SEO          = 'SEO & Discoverability',
  GROWTH       = 'Growth & Retention',
}

export type OutputFormat =
  | 'markdown'
  | 'copy-button'
  | 'whatsapp-share'
  | 'pdf-export'
  | 'docx-export'
  | 'save-library'
  | 'public-share'
  | 'calendar-view'
  | 'sections'

export type InputFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'number'
  | 'url'
  | 'tel'
  | 'radio'
  | 'toggle'
  | 'slider'

export type TeamMemberRole = 'admin' | 'member' | 'viewer'

// ─────────────────────────────────────────────────────────────
// CORE DOMAIN TYPES
// ─────────────────────────────────────────────────────────────

// ── User (from Supabase Auth) ─────────────────────────────────

export interface User {
  id:             string           // UUID — matches auth.users.id
  email:          string
  emailConfirmed: boolean
  createdAt:      string           // ISO timestamp
  updatedAt:      string
  lastSignInAt?:  string
  appMetadata:    Record<string, unknown>
  userMetadata:   Record<string, unknown>
}

// ── Profile ───────────────────────────────────────────────────

export interface MarketingChallenge {
  id:          string
  label:       string
  description: string
}

export interface Profile {
  // Identity
  id:                         string    // UUID — matches auth.users.id
  email:                      string
  fullName?:                  string
  avatarUrl?:                 string

  // Business core
  businessName?:              string
  industry?:                  string
  industryCustom?:            string
  city?:                      string
  state?:                     string
  country:                    string
  yearsInBusiness?:           number
  description?:               string
  uniqueAdvantage?:           string
  targetCustomer?:            string

  // Brand voice & personality
  brandVoice?:                BrandVoice
  languagePreference:         string
  primaryCta?:                string

  // Pricing
  priceRange?:                string
  priceLow?:                  number
  priceHigh?:                 number

  // Social proof
  socialProof?:               string
  clientCount?:               number
  yearsCombined?:             number

  // Media
  logoUrl?:                   string
  brandColour:                string
  brandColourSecondary?:      string

  // Contact
  whatsapp?:                  string
  phone?:                     string
  emailContact?:              string
  address?:                   string
  businessHours?:             string
  websiteUrl?:                string

  // Social handles
  instagram?:                 string
  facebook?:                  string
  linkedin?:                  string
  tiktok?:                    string
  twitter?:                   string
  youtube?:                   string

  // Marketing intelligence
  marketingChallenges:        string[]
  topProducts:                string[]
  competitors:                string[]
  targetLocations:            string[]

  // Profile quality
  profileCompletenessScore:   number    // 0-100

  // Onboarding
  onboardingComplete:         boolean
  onboardingStep:             OnboardingStep
  magicMomentCompleted:       boolean
  magicMomentToolId?:         string

  // Plan & billing
  planTier:                   PlanTier
  referredBy?:                string    // UUID of referrer

  // Timestamps
  createdAt:                  string
  updatedAt:                  string
}

export type ProfileUpdatePayload = Partial<Omit<Profile,
  'id' | 'email' | 'planTier' | 'createdAt' | 'updatedAt' |
  'profileCompletenessScore' | 'onboardingComplete'
>>

// ── Subscription ──────────────────────────────────────────────

export interface Subscription {
  id:                         string
  userId:                     string

  // Plan details
  planTier:                   PlanTier
  billingPeriod:              BillingPeriod
  coinsPerPeriod:             number
  priceNaira:                 number
  priceUsd?:                  number

  // Status
  status:                     SubscriptionStatus

  // Paystack identifiers
  paystackSubscriptionCode?:  string
  paystackPlanCode?:          string
  paystackCustomerCode?:      string
  paystackEmailToken?:        string

  // Dates
  currentPeriodStart:         string
  currentPeriodEnd:           string
  trialEnd?:                  string
  cancelledAt?:               string
  cancelAtPeriodEnd:          boolean

  // Metadata
  metadata:                   Record<string, unknown>
  createdAt:                  string
  updatedAt:                  string
}

// ── Coin Balance ──────────────────────────────────────────────

export interface CoinBalance {
  id:             string
  userId:         string
  balance:        number
  lifetimeEarned: number
  lifetimeSpent:  number
  rolloverCoins:  number
  version:        number
  lastAllocatedAt?: string
  createdAt:      string
  updatedAt:      string
}

// ── Coin Transaction ──────────────────────────────────────────

export interface CoinTransaction {
  id:             string
  userId:         string
  type:           CoinTransactionType
  amount:         number           // Positive = credit, negative = debit
  balanceAfter:   number
  toolId?:        string
  generationId?:  string
  description:    string
  reference?:     string           // External reference
  metadata:       Record<string, unknown>
  createdAt:      string
}

// ── Generation ────────────────────────────────────────────────

export interface Generation {
  id:               string
  userId:           string

  // Tool context
  toolId:           string
  toolName:         string
  toolCategory:     string

  // Content
  inputData:        Record<string, unknown>
  outputContent?:   string
  outputMetadata:   Record<string, unknown>

  // Cost
  coinsDeducted:    number

  // Status
  status:           GenerationStatus
  errorMessage?:    string

  // AI intelligence
  lawsApplied:      string[]

  // Save/share
  isSaved:          boolean
  savedTitle?:      string
  savedAt?:         string
  shareToken?:      string
  sharedAt?:        string

  // Performance
  generationTimeMs?: number
  tokenCount?:      number

  // Timestamps
  createdAt:        string
  updatedAt:        string
}

// ── Saved Library Item ────────────────────────────────────────

export interface SavedItem {
  id:           string
  userId:       string
  generationId: string
  generation?:  Generation     // Populated via join

  // Organisation
  title:        string
  tags:         string[]
  folder?:      string
  isFavourite:  boolean

  // Timestamps
  createdAt:    string
  updatedAt:    string
}

// ── Share Token ───────────────────────────────────────────────

export interface ShareToken {
  id:           string
  token:        string
  userId:       string
  generationId: string
  generation?:  Generation     // Populated via join

  // Access control
  isActive:     boolean
  viewCount:    number
  maxViews?:    number
  expiresAt?:   string

  // Timestamps
  createdAt:    string
}

// ── Referral ──────────────────────────────────────────────────

export interface ReferralInfo {
  id:             string

  // Referrer
  referrerId:     string
  referralCode:   string

  // Referred user
  referredEmail?: string
  referredUserId?: string

  // Status
  status:         ReferralStatus

  // Rewards
  coinsAwarded:   number
  awardedAt?:     string

  // Tracking
  clickedAt?:     string
  signedUpAt?:    string
  convertedAt?:   string

  // Metadata
  metadata:       Record<string, unknown>
  createdAt:      string
}

// ── Notification ──────────────────────────────────────────────

export interface Notification {
  id:           string
  userId:       string

  // Content
  type:         NotificationType
  title:        string
  message:      string
  icon?:        string
  actionUrl?:   string
  actionLabel?: string

  // State
  isRead:       boolean
  readAt?:      string

  // Metadata
  metadata:     Record<string, unknown>
  createdAt:    string
}

// ── Team Member ───────────────────────────────────────────────

export interface TeamMember {
  id:          string
  ownerId:     string
  memberId:    string
  member?:     Profile    // Populated via join
  role:        TeamMemberRole
  invitedAt:   string
  acceptedAt?: string
  createdAt:   string
}

// ── Onboarding Progress ───────────────────────────────────────

export interface OnboardingProgress {
  id:             string
  userId:         string

  // Progress
  stepsCompleted: string[]
  currentStep:    number
  totalSteps:     number

  // Partial data between steps
  step1Data:      Record<string, unknown>
  step2Data:      Record<string, unknown>
  step3Data:      Record<string, unknown>
  step4Data:      Record<string, unknown>

  // Completion
  completedAt?:   string
  skipped:        boolean
  skippedAt?:     string

  // Timestamps
  createdAt:      string
  updatedAt:      string
}

// ── Content Idea ──────────────────────────────────────────────

export interface ContentIdea {
  id:          string
  title:       string
  description: string
  platform:    string
  contentType: string
  coinCost:    number    // Estimated coins to produce this content
  toolId:      string   // The tool to use to produce it
}

export interface ContentIdeasCache {
  id:                 string
  userId:             string
  ideas:              ContentIdea[]
  generatedForWeek:   number
  generatedForYear:   number
  generatedAt:        string
  expiresAt:          string
}

// ── Business Insight ──────────────────────────────────────────

export interface BusinessInsight {
  id:                string
  userId:            string
  insightText:       string
  insightType:       string
  actionSuggestion?: string
  generatedAt:       string
  expiresAt:         string
}

// ── Milestone ─────────────────────────────────────────────────

export interface Milestone {
  id:                 string
  userId:             string
  milestoneKey:       string
  milestoneLabel:     string
  celebrationShown:   boolean
  celebratedAt?:      string
  achievedAt:         string
}

export type MilestoneKey =
  | 'first_generation'
  | '5_generations'
  | '10_generations'
  | '25_generations'
  | '50_generations'
  | '100_generations'
  | 'first_save'
  | 'first_share'
  | 'first_referral'
  | '5_referrals'
  | 'profile_complete'
  | 'magic_moment'
  | 'first_topup'
  | 'first_subscription'
  | 'strategy_brain_first'
  | 'all_categories_used'

// ─────────────────────────────────────────────────────────────
// TOOL SYSTEM TYPES
// ─────────────────────────────────────────────────────────────

export interface SelectOption {
  value:  string
  label:  string
}

export interface FormBlock {
  id:             string
  label:          string
  type:           InputFieldType
  placeholder?:   string
  helpText?:      string
  required:       boolean
  characterLimit?: number
  minLength?:     number
  options?:       SelectOption[]
  min?:           number
  max?:           number
  step?:          number
  defaultValue?:  string | number | boolean
  advanced?:      boolean   // Hidden behind "More context" toggle
}

export interface ToolDefinition {
  id:               string
  name:             string
  tagline:          string
  description:      string
  category:         ToolCategory
  coinCost:         number
  icon:             string
  accentColour:     string
  estimatedSeconds: number
  formBlocks:       FormBlock[]
  loadingMessages:  string[]
  akinAlabiHook:    string
  outputFormats:    OutputFormat[]
  isPremium?:       boolean
  isNew?:           boolean
  isFeatured?:      boolean
}

// Tool form submission
export interface ToolFormData {
  toolId:   string
  inputs:   Record<string, string | string[] | number | boolean>
}

// AI generation request (server-side)
export interface GenerateRequest {
  toolId:     string
  toolName:   string
  inputs:     Record<string, unknown>
  profile:    Profile
  userId:     string
}

// Streaming generation state (client-side)
export interface StreamingState {
  isStreaming:    boolean
  content:        string
  stage:          string    // Current loading stage message
  stageIndex:     number
  error?:         string
  generationId?:  string
  coinsDeducted?: number
}

// ─────────────────────────────────────────────────────────────
// BILLING & PAYMENTS
// ─────────────────────────────────────────────────────────────

export interface PlanConfig {
  tier:           PlanTier
  name:           string
  tagline:        string
  priceMonthly:   number    // In Naira
  priceAnnual:    number    // In Naira (yearly total)
  coinsPerMonth:  number
  rolloverCoins:  number    // 0 = no rollover
  features:       string[]
  isPopular?:     boolean
  ctaLabel:       string
}

export interface TopUpPack {
  id:          string
  name:        string
  priceNaira:  number
  priceUsd:    number
  coins:       number
  perCoin:     number   // Naira per coin
  badge?:      string   // e.g. "Best Value"
  isBestValue: boolean
}

export interface WebhookEvent {
  id:        string
  event:     string
  data:      Record<string, unknown>
  createdAt: string
}

// Paystack webhook payload
export interface PaystackWebhookPayload {
  event:  string
  data: {
    id:            number
    domain:        string
    status:        string
    reference:     string
    amount:        number    // In kobo
    currency:      string
    customer: {
      id:          number
      email:       string
      customer_code: string
    }
    metadata?: {
      user_id?:     string
      plan_tier?:   PlanTier
      topup_pack?:  string
      coins?:       number
    }
    subscription?: {
      status:              string
      subscription_code:   string
      plan: {
        plan_code:         string
        name:              string
        interval:          string
        amount:            number
      }
    }
    paid_at?:    string
    created_at:  string
  }
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD & ANALYTICS
// ─────────────────────────────────────────────────────────────

export interface DashboardSummary {
  userId:              string
  businessName?:       string
  planTier:            PlanTier
  profileCompleteScore: number
  onboardingComplete:  boolean
  magicMomentComplete: boolean
  coinBalance:         number
  totalCoinsSpent:     number
  totalCoinsEarned:    number
  totalGenerations:    number
  savedCount:          number
  lastGenerationAt?:   string
  successfulReferrals: number
}

export interface UsageStat {
  toolId:          string
  toolName:        string
  toolCategory:    string
  usageCount:      number
  lastUsedAt:      string
}

export interface CoinUsageByDay {
  date:         string
  coinsSpent:   number
  generations:  number
}

// ─────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success:  true
  data:     T
  message?: string
}

export interface ApiError {
  success:  false
  error:    string
  code?:    string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// Coin deduction response
export interface CoinDeductionResult {
  success:      boolean
  newBalance:   number
  errorMessage?: string
}

// Generation start response
export interface GenerationStartResult {
  generationId: string
  coinsDeducted: number
  remainingBalance: number
}

// Share link response
export interface ShareLinkResult {
  token:     string
  url:       string
  expiresAt?: string
}

// ─────────────────────────────────────────────────────────────
// UI / COMPONENT TYPES
// ─────────────────────────────────────────────────────────────

export interface NavItem {
  label:    string
  href:     string
  icon:     string     // Lucide icon name
  badge?:   string | number
  isActive?: boolean
}

export interface ToastConfig {
  title:       string
  description?: string
  variant:     'default' | 'success' | 'error' | 'warning' | 'coin'
  duration?:   number
  action?:     {
    label:  string
    onClick: () => void
  }
}

export interface ConfirmDialogConfig {
  title:       string
  description: string
  confirmLabel: string
  cancelLabel?: string
  variant?:    'default' | 'destructive'
  onConfirm:   () => void | Promise<void>
}

export interface LoadingStage {
  message:   string
  isActive:  boolean
  isComplete: boolean
}

// Tool output action
export type ToolOutputAction =
  | { type: 'copy';          label: 'Copy all' }
  | { type: 'whatsapp';      label: 'Share on WhatsApp' }
  | { type: 'save';          label: 'Save to library' }
  | { type: 'export-pdf';    label: 'Export as PDF' }
  | { type: 'export-docx';   label: 'Export as Word' }
  | { type: 'share-link';    label: 'Create share link' }
  | { type: 'regenerate';    label: 'Regenerate' }
  | { type: 'edit-inputs';   label: 'Edit inputs' }

// Onboarding step definition
export interface OnboardingStepDef {
  step:         number
  title:        string
  subtitle:     string
  key:          OnboardingStep
  fields:       FormBlock[]
  isOptional?:  boolean
}

// ─────────────────────────────────────────────────────────────
// WAITLIST
// ─────────────────────────────────────────────────────────────

export interface WaitlistEntry {
  id:              string
  email:           string
  fullName?:       string
  businessName?:   string
  city?:           string
  industry?:       string
  referralSource?: string
  position?:       number
  invitedAt?:      string
  joinedAt?:       string
  userId?:         string
  createdAt:       string
}

export interface WaitlistJoinPayload {
  email:           string
  fullName?:       string
  businessName?:   string
  city?:           string
  industry?:       string
  referralSource?: string
}

// ─────────────────────────────────────────────────────────────
// ZUSTAND STORE TYPES
// ─────────────────────────────────────────────────────────────

export interface UserStore {
  user:           User | null
  profile:        Profile | null
  coinBalance:    CoinBalance | null
  subscription:   Subscription | null
  isLoading:      boolean
  error:          string | null

  // Actions
  setUser:        (user: User | null) => void
  setProfile:     (profile: Profile | null) => void
  updateProfile:  (updates: ProfileUpdatePayload) => void
  setCoinBalance: (balance: CoinBalance | null) => void
  deductCoins:    (amount: number) => void
  creditCoins:    (amount: number) => void
  setSubscription: (sub: Subscription | null) => void
  reset:          () => void
}

export interface ToolStore {
  activeToolId:     string | null
  formData:         Record<string, Record<string, unknown>>
  streamingState:   StreamingState
  lastGeneration:   Generation | null
  history:          Generation[]

  // Actions
  setActiveTool:    (toolId: string | null) => void
  updateFormData:   (toolId: string, data: Record<string, unknown>) => void
  clearFormData:    (toolId: string) => void
  setStreaming:     (state: Partial<StreamingState>) => void
  appendContent:    (chunk: string) => void
  resetStreaming:   () => void
  addToHistory:     (generation: Generation) => void
  setLastGeneration: (generation: Generation | null) => void
}

export interface UIStore {
  sidebarOpen:      boolean
  commandPaletteOpen: boolean
  activeModal:      string | null
  toasts:           ToastConfig[]
  milestoneToShow:  Milestone | null

  // Actions
  setSidebarOpen:   (open: boolean) => void
  toggleSidebar:    () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openModal:        (modalId: string) => void
  closeModal:       () => void
  addToast:         (toast: Omit<ToastConfig, 'id'>) => void
  removeToast:      (index: number) => void
  showMilestone:    (milestone: Milestone) => void
  dismissMilestone: () => void
}

// ─────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────

// Makes all properties optional at top level and nested
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Extract the resolved type of a Promise
export type Awaited<T> = T extends Promise<infer U> ? U : T

// Supabase row type helper
export type DbRow<T> = T & {
  created_at: string
  updated_at: string
}

// Pagination
export interface PaginationParams {
  page:     number
  pageSize: number
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data:      T[]
  total:     number
  page:      number
  pageSize:  number
  totalPages: number
  hasMore:   boolean
}
