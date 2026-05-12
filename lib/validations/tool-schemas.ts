// ═══════════════════════════════════════════════════════════════
// /lib/validations/tool-schemas.ts
// Zod validation schemas for all 40 tools.
// Used on both client (form validation) and server (input sanitisation).
// ═══════════════════════════════════════════════════════════════

import { z } from 'zod'
import { TOOL_SCHEMAS_11_20 } from './tool-schemas-11-20'
import { TOOL_SCHEMAS_21_30 } from './tool-schemas-21-30'
import { TOOL_SCHEMAS_31_40 } from './tool-schemas-31-40'

// ─────────────────────────────────────────────────────────────
// SHARED FIELD VALIDATORS
// ─────────────────────────────────────────────────────────────

const shortText  = z.string().min(2).max(200).trim()
const medText    = z.string().min(2).max(500).trim()
const longText   = z.string().min(10).max(2000).trim()
const optText    = z.string().max(500).trim().optional()
const optLong    = z.string().max(2000).trim().optional()
const requiredId = z.string().min(1, 'Please select an option')

// ─────────────────────────────────────────────────────────────
// TOOL SCHEMAS
// ─────────────────────────────────────────────────────────────

// ── Tool 01: CopyBrain AI ────────────────────────────────────
export const copyBrainSchema = z.object({
  copy_purpose: z.enum([
    'social_media_post',
    'facebook_instagram_ad',
    'website_homepage_copy',
    'whatsapp_broadcast',
    'product_service_description',
    'promotional_flyer_copy',
    'sales_pitch_message',
    'other',
  ], { required_error: 'Select the purpose of this copy' }),

  content_type: z.enum([
    'caption_only',
    'headline_body_cta',
    'full_ad_copy',
    'full_landing_page',
  ], { required_error: 'Select the content type you need' }),

  copy_goal: z.enum([
    'get_whatsapp_enquiries',
    'sell_specific_product',
    'build_brand_awareness',
    'get_more_followers',
    'promote_special_offer',
    'get_website_visits',
  ], { required_error: 'Select your primary goal' }),

  platform: z.enum([
    'instagram',
    'facebook',
    'whatsapp',
    'website',
    'linkedin',
    'flyer_print',
    'multiple_platforms',
  ], { required_error: 'Select the target platform' }),

  emotional_hook: z.enum([
    'fear_angle',
    'desire_angle',
    'story_angle',
    'awoof_angle',
    'authority_angle',
  ], { required_error: 'Choose the emotional hook approach' }),

  specific_product: optText,       // Auto-fills from profile if blank
  key_benefit:      optText,       // The main transformation delivered
  price_and_offer:  optText,       // Optional offer/pricing details
  trust_signal:     optText,       // Optional — overrides profile social proof
})

export type CopyBrainInput = z.infer<typeof copyBrainSchema>

// ── Tool 02: CaptionCraft ────────────────────────────────────
export const captionCraftSchema = z.object({
  platform: z.array(z.enum([
    'instagram',
    'facebook',
    'linkedin',
    'tiktok',
    'twitter',
    'threads',
  ])).min(1, 'Select at least one platform'),

  post_topic: longText,  // What this post is about — required

  post_type: z.enum([
    'educational_value',
    'promotional_offer',
    'behind_the_scenes',
    'testimonial_social_proof',
    'announcement',
    'engagement_question',
    'product_service_showcase',
    'viral_hook',
  ], { required_error: 'Select the type of post' }),

  tone_override: z.enum([
    'use_brand_voice',
    'more_urgent_promotional',
    'more_warm_personal',
    'more_professional_formal',
    'youthful_energetic',
  ]).default('use_brand_voice'),

  hashtag_strategy: z.enum([
    'include_full_set',
    'no_hashtags',
    'nigerian_reach_only',
    'niche_only',
  ]).default('include_full_set'),

  cta_preference: z.enum([
    'whatsapp_cta',
    'follow_us',
    'visit_website',
    'comment_below',
    'share_with_friend',
    'no_explicit_cta',
  ]).default('whatsapp_cta'),

  num_variations: z.enum(['1', '3', '5']).default('3'),

  caption_length: z.enum([
    'short',   // under 100 words
    'medium',  // 100-200 words
    'long',    // 200+ words
  ]).default('medium'),

  target_emotion: optText,  // Optional: what emotion should the caption trigger?
})

export type CaptionCraftInput = z.infer<typeof captionCraftSchema>

// ── Tool 03: AdScribe ────────────────────────────────────────
export const adScribeSchema = z.object({
  ad_platform: z.enum([
    'facebook_instagram',
    'google_search',
    'google_display',
    'tiktok_ads',
    'youtube_preroll',
    'twitter_ads',
  ], { required_error: 'Select the ad platform' }),

  ad_objective: z.enum([
    'awareness',
    'traffic_whatsapp_website',
    'lead_generation',
    'sales_conversions',
    'retargeting_warm_audience',
    'app_installs',
  ], { required_error: 'Select the campaign objective' }),

  product_or_service: medText,     // What is being advertised

  target_audience_description: medText,  // Who the ad targets

  ad_variations: z.enum(['1', '3', '5']).default('3'),

  campaign_duration_days: z.enum([
    '7',
    '14',
    '30',
    '60',
    'ongoing',
  ]).optional(),

  monthly_budget_naira: optText,   // Optional budget context

  unique_selling_point: optText,   // USP if different from profile
  special_offer:        optText,   // Any promo/discount to feature
  competitor_to_contrast: optText, // Optional competitor reference (not named)
})

export type AdScribeInput = z.infer<typeof adScribeSchema>

// ── Tool 04: EmailScribe ─────────────────────────────────────
export const emailScribeSchema = z.object({
  sequence_type: z.enum([
    'welcome_onboarding',
    'sales_campaign_launch',
    'nurture_relationship',
    'abandoned_cart_follow_up',
    'reengagement_winback',
    'promotional_campaign',
    'event_invitation',
    'post_purchase_onboarding',
  ], { required_error: 'Select the email sequence type' }),

  num_emails: z.enum(['3', '5', '7', '10']).default('5'),

  product_or_offer: longText,  // What the sequence is about

  subscriber_context: medText,  // Who these emails go to — their situation

  cta_action: shortText.describe('What action you want them to take — e.g. "Book a free call via WhatsApp"'),

  story_protagonist: optText,    // Customer persona/story to open the sequence
  deadline:          optText,    // Optional campaign close date
  from_name:         optText,    // Sender name override
  subject_line_style: z.enum([
    'curiosity_gap',
    'bold_promise',
    'personal_direct',
    'news_announcement',
    'question_hook',
  ]).optional(),
})

export type EmailScribeInput = z.infer<typeof emailScribeSchema>

// ── Tool 05: VideoScriptForge ─────────────────────────────────
export const videoScriptForgeSchema = z.object({
  video_platform: z.enum([
    'instagram_reel',
    'tiktok',
    'youtube_short',
    'youtube_long',
    'facebook_video',
    'whatsapp_status',
    'paid_ad_video',
    'testimonial',
    'explainer',
    'pitch_video',
  ], { required_error: 'Select the video platform' }),

  video_goal: z.enum([
    'awareness',
    'generate_leads',
    'drive_sales',
    'increase_engagement',
    'build_trust_credibility',
    'get_referrals',
    'educate_audience',
  ], { required_error: 'Select what this video should achieve' }),

  video_topic: longText,

  video_length: z.enum([
    '15sec',
    '30sec',
    '60sec',
    '3min',
    '5min',
    '10min',
    '15min',
  ]).default('60sec'),

  presenter_style: z.enum([
    'talking_head',
    'voiceover_visuals',
    'screen_recording',
    'interview_testimonial',
    'animation_explainer',
  ]).optional(),

  key_hook: optText,           // Their hook idea (or we generate)
  scene_direction: z.boolean().default(true),  // Include scene directions?
  include_b_roll_notes: z.boolean().default(true),
  include_thumbnail_suggestion: z.boolean().default(true),
})

export type VideoScriptForgeInput = z.infer<typeof videoScriptForgeSchema>

// ── Tool 06: BlogBrain ────────────────────────────────────────
export const blogBrainSchema = z.object({
  article_topic: medText,

  article_goal: z.enum([
    'seo_ranking',
    'lead_magnet',
    'brand_authority',
    'sales_support',
    'educate_audience',
    'thought_leadership',
  ], { required_error: 'Select the article goal' }),

  target_keyword: optText,

  article_length: z.enum([
    '500',
    '800',
    '1200',
    '2000',
    '3000',
  ]).default('1200'),

  audience_profile: medText,

  include_stats:  z.boolean().default(true),
  include_examples: z.boolean().default(true),

  cta_offer: optText,    // What to offer readers at the end
  tone_style: z.enum([
    'conversational_expert',
    'formal_professional',
    'storytelling_narrative',
    'list_based_practical',
    'investigative_journalism',
  ]).default('conversational_expert'),

  competitor_keyword_to_outrank: optText,
  internal_links_topic: optText,  // Topics to suggest for internal links
})

export type BlogBrainInput = z.infer<typeof blogBrainSchema>

// ── Tool 07: BioBuilder ───────────────────────────────────────
export const bioBuilderSchema = z.object({
  bio_type: z.enum([
    'instagram_bio',
    'linkedin_summary',
    'website_about_page',
    'speaker_intro',
    'press_media_kit_bio',
    'twitter_x_bio',
    'business_brand_bio',
    'full_set_all',
  ], { required_error: 'Select which bio you need' }),

  who_you_are: medText,        // Who the business is — context

  credentials: optText,        // Specific achievements, awards, numbers

  target_who_reads: medText,   // Who should be attracted by this bio

  include_cta:  z.boolean().default(true),
  include_social_proof: z.boolean().default(true),

  tone_modifier: z.enum([
    'use_brand_voice',
    'more_authority',
    'more_approachable',
    'more_story_driven',
    'more_results_focused',
  ]).default('use_brand_voice'),

  key_transformation: optText, // The outcome clients get from working with them
  avoid_phrases: optText,      // Phrases to avoid (optional)
})

export type BioBuilderInput = z.infer<typeof bioBuilderSchema>

// ── Tool 08: ProductDescriber ─────────────────────────────────
export const productDescriberSchema = z.object({
  product_name: shortText,

  product_details: longText,   // Full product/service details

  price: optText,              // ₦ price

  platform_for_description: z.enum([
    'website_online_store',
    'jumia_konga',
    'instagram_shop',
    'whatsapp_catalogue',
    'flyer_brochure',
    'email_newsletter',
    'facebook_marketplace',
    'all_platforms',
  ], { required_error: 'Select where this will be used' }),

  description_length: z.enum([
    'short',   // 50-100 words
    'medium',  // 100-200 words
    'long',    // 200-400 words
  ]).default('medium'),

  target_customer: optText,    // If different from profile

  include_bullet_features: z.boolean().default(true),
  include_seo_keywords: z.boolean().default(true),
  include_awoof_stack: z.boolean().default(true),  // Always compare to alternatives

  competitor_product: optText, // What are customers comparing this to?
  main_objection:     optText, // The #1 reason people hesitate to buy
})

export type ProductDescriberInput = z.infer<typeof productDescriberSchema>

// ── Tool 09: PressRelease AI ──────────────────────────────────
export const pressReleaseSchema = z.object({
  announcement_type: z.enum([
    'product_service_launch',
    'new_business_branch_opening',
    'partnership_collaboration',
    'award_recognition',
    'business_expansion_milestone',
    'event_announcement',
    'csr_community_initiative',
    'funding_investment',
    'new_hire_executive',
    'rebrand_relaunch',
  ], { required_error: 'Select the type of announcement' }),

  announcement_details: longText,  // Full details of the announcement

  spokesperson_name:  optText,     // e.g. "Kingsley Nwosu, CEO"
  spokesperson_quote: optText,     // Optional pre-written quote

  target_media: z.enum([
    'general_nigerian_media',
    'business_media',
    'tech_media',
    'lifestyle_media',
    'international_media',
    'social_media_blogs',
    'all_media',
  ]).default('general_nigerian_media'),

  release_date:     optText,       // "For Immediate Release" or specific date
  embargo_date:     optText,       // If embargoed
  media_contact_email: optText,

  include_boilerplate: z.boolean().default(true),
  include_media_list:  z.boolean().default(true),  // Suggest target outlets
  include_social_hook: z.boolean().default(true),  // Tweet-sized version
})

export type PressReleaseInput = z.infer<typeof pressReleaseSchema>

// ── Tool 10: Content Calendar ─────────────────────────────────
export const contentCalendarSchema = z.object({
  calendar_duration: z.enum(['7', '14', '30']).default('30'),

  platforms: z.array(z.enum([
    'instagram',
    'facebook',
    'tiktok',
    'linkedin',
    'twitter',
    'whatsapp',
    'youtube',
    'threads',
  ])).min(1, 'Select at least one platform'),

  posts_per_week: z.enum(['3', '5', '7', '14']).default('5'),

  content_goals: z.array(z.enum([
    'awareness',
    'leads',
    'sales',
    'engagement',
    'trust_credibility',
    'referrals',
    'retention',
  ])).min(1, 'Select at least one goal'),

  upcoming_promotions: optText,
  upcoming_events:     optText,
  products_to_feature: optText,

  salary_cycle_awareness: z.boolean().default(true),
  include_content_ideas:  z.boolean().default(true),
  include_caption_hooks:  z.boolean().default(true),
  include_repurpose_guide: z.boolean().default(false),

  month_and_year: optText,     // e.g. "July 2025" — defaults to current month
  special_dates:  optText,     // Nigerian holidays to plan around
})

export type ContentCalendarInput = z.infer<typeof contentCalendarSchema>

// ─────────────────────────────────────────────────────────────
// MASTER SCHEMA MAP — used by the API route
// ─────────────────────────────────────────────────────────────

export const TOOL_SCHEMAS: Record<string, z.ZodSchema<any>> = {
  'copy-brain':          copyBrainSchema,
  'caption-craft':       captionCraftSchema,
  'ad-scribe':           adScribeSchema,
  'email-scribe':        emailScribeSchema,
  'video-script-forge':  videoScriptForgeSchema,
  'blog-brain':          blogBrainSchema,
  'bio-builder':         bioBuilderSchema,
  'product-describer':   productDescriberSchema,
  'press-release-ai':    pressReleaseSchema,
  'content-calendar':    contentCalendarSchema,
}

// Combine all schemas into one lookup table
const ALL_TOOL_SCHEMAS: Record<string, z.ZodSchema<any>> = {
  ...TOOL_SCHEMAS,
  ...TOOL_SCHEMAS_11_20,
  ...TOOL_SCHEMAS_21_30,
  ...TOOL_SCHEMAS_31_40,
}

export function validateToolInputs(
  toolId: string,
  raw:    Record<string, unknown>,
): { success: true; data: Record<string, any> } | { success: false; errors: string[] } {
  const schema = ALL_TOOL_SCHEMAS[toolId]
  if (!schema) return { success: true, data: raw } // Unknown tools: pass raw through

  const result = schema.safeParse(raw)
  if (result.success) return { success: true, data: result.data }

  const errors = result.error.errors.map(
    (e) => `${e.path.join('.')}: ${e.message}`,
  )
  return { success: false, errors }
}
