// ═══════════════════════════════════════════════════════════════
// /lib/tools/output-schemas.ts
// TypeScript interfaces for all 10 output schema groups.
// These are the CONTRACTS between the generation API and the UI.
// Any change here requires a coordinated update to:
//   1. The prompt suffix (output-prompt-utils.ts)
//   2. The output component that reads these fields
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// OUTPUT GROUP ENUM
// Every tool in the registry is assigned one of these groups.
// ─────────────────────────────────────────────────────────────

export type OutputGroup =
  | 'caption'        // Group 1: CaptionCraft, AdScribe, CopyBrain AI, etc.
  | 'document'       // Group 2: BlogBrain, PressRelease AI, ProposalWriter, etc.
  | 'script'         // Group 3: VideoScriptForge, SalesScriptWriter, etc.
  | 'whatsapp'       // Group 4: WhatsApp Campaign Builder, FollowUpSequencer, etc.
  | 'email'          // Group 5: EmailScribe, NewsletterAI
  | 'strategy'       // Group 6: Sprint Blueprint, LaunchPad, FunnelBuilder, etc.
  | 'intelligence'   // Group 7: AudienceProfiler, BrandPositioner, KeywordHunter, etc.
  | 'calendar'       // Group 8: Content Calendar, Visual Content Calendar
  | 'competitor'     // Group 9: CI modules
  | 'design'         // Group 10: All 11 Design Studio tools

// ─────────────────────────────────────────────────────────────
// BASE TYPES
// ─────────────────────────────────────────────────────────────

/** The three-layer base that every schema must include */
export interface BaseOutput {
  headline:    string          // ≤15 words, includes business name
  output_group: OutputGroup
  schema_version: 2
}

// ─────────────────────────────────────────────────────────────
// GROUP 1 — CAPTION & SHORT COPY
// Tools: CaptionCraft, AdScribe, CopyBrain AI, PromoBlast,
//        BioBuilder, ProductDescriber, ReviewRequestor, PricingNarrator
// ─────────────────────────────────────────────────────────────

export interface CaptionVariant {
  label:      string      // "Hook" | "Social proof" | "Urgency" | "Question" | "Story"
  text:       string      // ≤100 words — the actual caption
  char_count: number      // character count
  hashtags:   string[]    // 5–8 tags WITHOUT the # symbol
}

export interface CaptionEssentials {
  variants:     CaptionVariant[]
  posting_time: string            // e.g. "Thursday 7–9pm — post-salary week, Lagos fashion"
  cta_label:    string            // "DM us" | "Visit link in bio" | etc.
}

export interface CaptionDeepDive {
  strategy_notes:      string    // Why these captions work for this business
  why_this_works:      string    // Platform psychology + Nigerian buyer context
  alternative_angles:  string[]  // 2–3 other angles to try
  brand_voice_analysis: string   // How well the output reflects their brand voice
  ab_test_suggestion:  string    // Which two variants to A/B test and why
}

export interface CaptionOutput extends BaseOutput {
  output_group: 'caption'
  platform:     string           // "Instagram" | "Facebook" | "All"
  essentials:   CaptionEssentials
  deep_dive:    CaptionDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 2 — LONG-FORM DOCUMENTS
// Tools: BlogBrain, PressRelease AI, ProposalWriter, NewsletterAI,
//        CrisisResponder, LeadMagnetForge
// ─────────────────────────────────────────────────────────────

export interface DocumentEssentials {
  summary:          string      // ≤60 words — what this document achieves
  key_points:       string[]    // 3–5 items, ≤20 words each
  word_count:       number      // estimated word count of full document
  recommended_use:  string      // "Publish on your website blog this Thursday"
}

export interface DocumentDeepDive {
  full_document:        string   // The complete document text
  editing_notes:        string   // What to personalise or verify before publishing
  seo_tips:             string   // SEO recommendations (for blog content)
  publishing_checklist: string[] // 3–5 steps before publishing
}

export interface DocumentOutput extends BaseOutput {
  output_group:    'document'
  document_type:   string       // "Blog post" | "Press release" | "Proposal" etc.
  essentials:      DocumentEssentials
  deep_dive:       DocumentDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 3 — SCRIPTS
// Tools: VideoScriptForge, SalesScriptWriter, CarouselScriptBuilder, StoryPlanner
// ─────────────────────────────────────────────────────────────

export interface ScriptScene {
  scene:     number
  label:     string   // "Hook" | "Problem" | "Solution" | "Proof" | "CTA"
  direction: string   // ≤20 words — what to do/show/say
  spoken?:   string   // the actual words to speak (populated in Deep Dive)
  duration:  string   // "0:00–0:08"
}

export interface ScriptEssentials {
  hook:      string         // ≤30 words — the opening line
  structure: ScriptScene[]  // 4–6 scenes
}

export interface ScriptDeepDive {
  full_script:     string          // Complete word-for-word script
  delivery_notes:  string          // Tone, pace, body language notes
  scene_breakdown: ScriptScene[]   // Scenes with full spoken text
  production_tips: string          // Camera angles, B-roll suggestions
}

export interface ScriptOutput extends BaseOutput {
  output_group:      'script'
  script_type:       string    // "Video" | "Sales call" | "Carousel" | "Story"
  duration_estimate: string    // "45–60 seconds"
  essentials:        ScriptEssentials
  deep_dive:         ScriptDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 4 — WHATSAPP SEQUENCES
// Tools: WhatsApp Campaign Builder, FollowUpSequencer,
//        WelcomeMessageCraft, WinBackCampaign
// ─────────────────────────────────────────────────────────────

export interface WhatsAppMessage {
  number:   number
  type:     'Hook' | 'Fear' | 'Proof' | 'Awoof' | 'CTA' | 'Welcome' | 'Follow-up' | 'Win-back'
  timing:   string   // "Day 0 · Send immediately on opt-in"
  text:     string   // ≤300 characters — the full message
  send_tip: string   // ≤20 words — when/how to send
}

export interface WhatsAppEssentials {
  messages: WhatsAppMessage[]
}

export interface WhatsAppDeepDive {
  campaign_strategy: string
  tone_guide:        string
  conversion_tips:   string
  follow_up_notes:   string
  timing_rationale:  string   // Why each message is timed the way it is
}

export interface WhatsAppOutput extends BaseOutput {
  output_group:   'whatsapp'
  total_messages: number
  formula:        string    // "Hook · Fear · Proof · Awoof · CTA"
  campaign_span:  string    // "7 days"
  essentials:     WhatsAppEssentials
  deep_dive:      WhatsAppDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 5 — EMAIL SEQUENCES
// Tools: EmailScribe
// ─────────────────────────────────────────────────────────────

export interface EmailPreview {
  number:        number
  subject_line:  string   // ≤50 chars
  preview_text:  string   // ≤90 chars
  send_timing:   string   // "Day 1 · Send immediately"
  core_message:  string   // ≤40 words — what this email achieves
}

export interface EmailFull extends EmailPreview {
  body: string            // Full email body
}

export interface EmailEssentials {
  emails: EmailPreview[]
}

export interface EmailDeepDive {
  full_emails:       EmailFull[]
  sequence_strategy: string
  subject_line_tips: string
  unsubscribe_notes: string
}

export interface EmailOutput extends BaseOutput {
  output_group:   'email'
  total_emails:   number
  sequence_type:  string   // "Welcome" | "Nurture" | "Sales" | "Re-engagement"
  essentials:     EmailEssentials
  deep_dive:      EmailDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 6 — STRATEGIC PLANS
// Tools: Sprint Blueprint, LaunchPad, CampaignClock, BudgetOptimizer,
//        RetargetEngine, FunnelBuilder, InfluencerBriefWriter,
//        ReferralProgramBuilder, AdPilot
// ─────────────────────────────────────────────────────────────

export interface StrategyAction {
  priority:        number          // 1–5 (1 = most important)
  action:          string          // ≤25 words — specific, immediately actionable
  timeframe:       string          // "This week" | "Week 2" | "Month 2"
  expected_result: string          // ≤15 words
  effort:          'Low' | 'Medium' | 'High'
}

export interface StrategyPhase {
  phase_name:   string
  week_range:   string          // "Week 1–2"
  tasks:        string[]        // 3–5 specific tasks
  milestone:    string          // What success looks like at end of this phase
}

export interface StrategyEssentials {
  quick_win: string             // ≤30 words — the ONE thing to do TODAY
  actions:   StrategyAction[]   // 3–5 priority actions
}

export interface StrategyDeepDive {
  full_strategy:   string
  phases:          StrategyPhase[]
  budget_guidance: string
  risk_factors:    string
  success_metrics: string[]
}

export interface StrategyOutput extends BaseOutput {
  output_group: 'strategy'
  timeframe:    string          // "60 days"
  key_metric:   string          // "₦500,000 revenue — 18 clients at ₦28K avg"
  essentials:   StrategyEssentials
  deep_dive:    StrategyDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 7 — INTELLIGENCE & PROFILES
// Tools: AudienceProfiler, BrandPositioner, KeywordHunter,
//        LocalSEOKit, GoogleAdCraft, SalesScriptWriter, ProposalWriter
// ─────────────────────────────────────────────────────────────

export interface IntelFinding {
  label:       string
  value:       string          // ≤30 words
  importance:  'High' | 'Medium' | 'Low'
}

export interface IntelEssentials {
  core_insight:     string     // ≤50 words — the single most important finding
  findings:         IntelFinding[]  // 3–5 findings
  immediate_action: string     // ≤30 words — what to do with this insight NOW
}

export interface IntelDeepDive {
  full_analysis:          string
  methodology:            string
  detailed_recommendations: string
  implementation_guide:   string
}

export interface IntelligenceOutput extends BaseOutput {
  output_group: 'intelligence'
  subject:      string        // what was profiled/analysed
  essentials:   IntelEssentials
  deep_dive:    IntelDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 8 — CONTENT CALENDAR
// Tools: Content Calendar, Visual Content Calendar
// ─────────────────────────────────────────────────────────────

export interface CalendarPost {
  day:          string   // "Monday 7 July"
  date:         number   // day of month
  platform:     string
  post_type:    'Reel' | 'Carousel' | 'Story' | 'Static' | 'WhatsApp'
  theme:        string   // ≤20 words
  caption_hint: string   // ≤30 words — the hook or angle
}

export interface CalendarWeek {
  week:  number
  posts: CalendarPost[]
}

export interface CalendarEssentials {
  this_week:  CalendarPost[]  // 5–7 posts for the current/next week
  top_theme:  string          // "This month's anchor theme: end-of-season clearance"
}

export interface CalendarDeepDive {
  full_month:       CalendarWeek[]    // All 4 weeks with all posts
  content_strategy: string
  posting_rhythm:   string
  theme_rationale:  string
}

export interface CalendarOutput extends BaseOutput {
  output_group:  'calendar'
  month:         string          // "July 2026"
  total_posts:   number
  essentials:    CalendarEssentials
  deep_dive:     CalendarDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 9 — COMPETITOR INTELLIGENCE
// Tools: Social Media Audit, Ad Intelligence, Website & Content Audit,
//        Gap & Opportunity Map
// ─────────────────────────────────────────────────────────────

export type CIModule = 'Social' | 'Ads' | 'Website' | 'Gap'

export interface CIOpportunity {
  gap:        string    // ≤30 words
  urgency:    'High' | 'Medium' | 'Low'
  tool_link:  string    // tool ID to address this gap (e.g. 'whatsapp-campaign-builder')
}

export interface CIEssentials {
  top_finding:   string        // ≤50 words — the single most important discovery
  your_score:    number        // 0–100
  leader_score:  number        // 0–100
  opportunities: CIOpportunity[]
}

export interface CIDeepDive {
  full_audit:                string
  competitor_profiles:       Record<string, unknown>[]
  detailed_recommendations:  string
  implementation_roadmap:    string
}

export interface CIOutput extends BaseOutput {
  output_group: 'competitor'
  module:       CIModule
  competitors:  string[]
  essentials:   CIEssentials
  deep_dive:    CIDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// GROUP 10 — DESIGN STUDIO
// Tools: All 11 visual design tools
// ─────────────────────────────────────────────────────────────

export interface DesignEssentials {
  primary_url:        string    // R2 URL of generated image
  variations:         string[]  // 3 additional variation URLs
  dimensions:         string    // "1080×1080"
  tier:               'Standard' | 'Premium'
  caption_suggestion: string    // ≤30 words
}

export interface DesignDeepDive {
  design_notes:           string
  brand_guidelines_used:  string
  usage_tips:             string[]
  caption_expanded:       string   // Full caption suggestion (≤100 words)
}

export interface DesignOutput extends BaseOutput {
  output_group:       'design'
  design_brief:       string    // What was sent to the image model
  brand_dna_applied:  boolean
  essentials:         DesignEssentials
  deep_dive:          DesignDeepDive | null
}

// ─────────────────────────────────────────────────────────────
// UNION TYPE — all possible output shapes
// ─────────────────────────────────────────────────────────────

export type CerebreOutput =
  | CaptionOutput
  | DocumentOutput
  | ScriptOutput
  | WhatsAppOutput
  | EmailOutput
  | StrategyOutput
  | IntelligenceOutput
  | CalendarOutput
  | CIOutput
  | DesignOutput

// ─────────────────────────────────────────────────────────────
// TYPE GUARDS — narrow the union safely
// ─────────────────────────────────────────────────────────────

export const isCaption    = (o: CerebreOutput): o is CaptionOutput     => o.output_group === 'caption'
export const isDocument   = (o: CerebreOutput): o is DocumentOutput    => o.output_group === 'document'
export const isScript     = (o: CerebreOutput): o is ScriptOutput      => o.output_group === 'script'
export const isWhatsApp   = (o: CerebreOutput): o is WhatsAppOutput    => o.output_group === 'whatsapp'
export const isEmail      = (o: CerebreOutput): o is EmailOutput       => o.output_group === 'email'
export const isStrategy   = (o: CerebreOutput): o is StrategyOutput    => o.output_group === 'strategy'
export const isIntelligence=(o: CerebreOutput): o is IntelligenceOutput=> o.output_group === 'intelligence'
export const isCalendar   = (o: CerebreOutput): o is CalendarOutput    => o.output_group === 'calendar'
export const isCI         = (o: CerebreOutput): o is CIOutput          => o.output_group === 'competitor'
export const isDesign     = (o: CerebreOutput): o is DesignOutput      => o.output_group === 'design'

// ─────────────────────────────────────────────────────────────
// SCHEMA VALIDATOR — validates that an API response matches the expected schema
// Returns the typed output or throws with a descriptive error.
// ─────────────────────────────────────────────────────────────

export function validateOutputSchema(raw: unknown, expectedGroup: OutputGroup): CerebreOutput {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Output is not an object. Received: ${typeof raw}`)
  }

  const obj = raw as Record<string, unknown>

  // Mandatory fields present on every schema
  if (typeof obj.headline !== 'string' || !obj.headline.trim()) {
    throw new Error('Missing required field: headline')
  }
  if (!obj.essentials || typeof obj.essentials !== 'object') {
    throw new Error('Missing required field: essentials')
  }

  // Group-specific validation
  switch (expectedGroup) {
    case 'caption': {
      const ess = obj.essentials as Record<string, unknown>
      if (!Array.isArray(ess.variants) || ess.variants.length === 0) {
        throw new Error('caption: essentials.variants must be a non-empty array')
      }
      break
    }
    case 'whatsapp': {
      const ess = obj.essentials as Record<string, unknown>
      if (!Array.isArray(ess.messages) || ess.messages.length === 0) {
        throw new Error('whatsapp: essentials.messages must be a non-empty array')
      }
      break
    }
    case 'strategy': {
      const ess = obj.essentials as Record<string, unknown>
      if (!Array.isArray(ess.actions) || ess.actions.length === 0) {
        throw new Error('strategy: essentials.actions must be a non-empty array')
      }
      if (typeof ess.quick_win !== 'string') {
        throw new Error('strategy: essentials.quick_win is required')
      }
      break
    }
    case 'email': {
      const ess = obj.essentials as Record<string, unknown>
      if (!Array.isArray(ess.emails) || ess.emails.length === 0) {
        throw new Error('email: essentials.emails must be a non-empty array')
      }
      break
    }
    case 'document': {
      const ess = obj.essentials as Record<string, unknown>
      if (typeof ess.summary !== 'string') {
        throw new Error('document: essentials.summary is required')
      }
      break
    }
  }

  // Inject schema metadata
  return {
    ...obj,
    output_group:   expectedGroup,
    schema_version: 2,
  } as CerebreOutput
}
