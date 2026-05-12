// ═══════════════════════════════════════════════════════════════
// /lib/validations/tool-schemas-21-30.ts
// Zod validation schemas for Tools 21–30
// ═══════════════════════════════════════════════════════════════

import { z } from 'zod'

const shortText = z.string().min(2).max(200).trim()
const medText   = z.string().min(2).max(500).trim()
const longText  = z.string().min(10).max(2000).trim()
const optText   = z.string().max(500).trim().optional()
const optLong   = z.string().max(2000).trim().optional()

// ── Tool 21: BrandPositioner ─────────────────────────────────
export const brandPositionerSchema = z.object({
  positioning_challenge: z.enum([
    'differentiate_from_competition',
    'justify_premium_price',
    'enter_new_market',
    'rebrand_reposition',
    'niche_down_specialise',
    'build_from_scratch',
    'recover_from_reputation_damage',
    'expand_to_new_audience',
  ], { required_error: 'Select the positioning challenge you need to solve' }),

  competition_description: longText,

  your_differentiators: longText,

  target_positioning: z.enum([
    'premium_luxury',
    'best_value_quality_balance',
    'fastest_most_convenient',
    'most_trustworthy_credible',
    'most_specialised_expert',
    'most_personal_relationship',
    'most_innovative_modern',
    'most_community_focused',
  ]).optional(),

  current_perception: optText,
  desired_perception: optText,

  positioning_geography: z.enum([
    'local_one_city',
    'national_nigeria',
    'west_africa',
    'pan_african',
    'diaspora_focused',
    'international',
  ]).default('national_nigeria'),

  include_tagline_options: z.boolean().default(true),
  include_brand_story:     z.boolean().default(true),
  include_competitive_map: z.boolean().default(true),
  include_messaging_hierarchy: z.boolean().default(true),
})

export type BrandPositionerInput = z.infer<typeof brandPositionerSchema>

// ── Tool 22: PricingNarrator ─────────────────────────────────
export const pricingNarratorSchema = z.object({
  your_price: shortText,

  what_is_included: longText,

  alternative_cost: optText,

  result_delivered: medText,

  pricing_context: z.enum([
    'website_pricing_page',
    'whatsapp_when_asked',
    'proposal_quote',
    'sales_call_script',
    'social_media_pricing_reveal',
    'invoice_payment_request',
    'full_pricing_page',
  ], { required_error: 'Select where this pricing communication will be used' }),

  price_point_positioning: z.enum([
    'premium_above_market',
    'mid_market_fair',
    'value_below_market',
    'freemium_base_upsell',
  ]).default('mid_market_fair'),

  main_price_objection: z.enum([
    'too_expensive',
    'i_can_get_it_cheaper',
    'not_sure_its_worth_it',
    'let_me_think_about_it',
    'i_dont_have_budget_now',
    'competitor_charges_less',
  ]).default('too_expensive'),

  payment_options_available: optText,
  guarantee_offered:         optText,
  payment_plan_available:    z.boolean().default(false),
  include_faqs:              z.boolean().default(true),
  include_objection_scripts: z.boolean().default(true),
})

export type PricingNarratorInput = z.infer<typeof pricingNarratorSchema>

// ── Tool 23: BudgetOptimizer ──────────────────────────────────
export const budgetOptimizerSchema = z.object({
  total_monthly_budget: shortText,

  business_goal: z.enum([
    'awareness',
    'generate_leads',
    'drive_sales',
    'increase_engagement',
    'build_trust_credibility',
    'get_referrals',
    'retention_repeat_customers',
    'launch_new_product',
  ], { required_error: 'Select the primary goal for this budget' }),

  current_channels: z.array(z.enum([
    'instagram',
    'facebook_ads',
    'google_ads',
    'tiktok_ads',
    'whatsapp',
    'influencer',
    'seo_content',
    'email_marketing',
    'offline_ooh',
    'radio_tv',
    'events',
    'referral',
  ])).optional(),

  past_ad_performance: optLong,

  business_stage: z.enum([
    'pre_launch',
    'early_stage_0_1yr',
    'growing_1_3yr',
    'established_3plus',
    'scaling_aggressively',
  ]).default('early_stage_0_1yr'),

  target_customer_online_behaviour: z.enum([
    'very_online_always_scrolling',
    'moderate_online_daily_use',
    'limited_online_calls_whatsapp',
    'mixed_depends_on_product',
  ]).default('moderate_online_daily_use'),

  seasonal_factor:    optText,
  competitor_spend:   optText,
  cost_per_lead_target: optText,
})

export type BudgetOptimizerInput = z.infer<typeof budgetOptimizerSchema>

// ── Tool 24: AdPilot ─────────────────────────────────────────
export const adPilotSchema = z.object({
  campaign_platform: z.enum([
    'meta_facebook_instagram',
    'google_search',
    'google_display',
    'tiktok_ads',
    'youtube_ads',
    'twitter_ads',
    'meta_plus_google',
  ], { required_error: 'Select the advertising platform' }),

  campaign_budget: shortText,

  campaign_objective: z.enum([
    'awareness_reach',
    'traffic_website_whatsapp',
    'lead_generation',
    'sales_conversions',
    'retargeting_warm',
    'app_installs',
    'video_views',
  ], { required_error: 'Select the campaign objective' }),

  product_offer: longText,

  target_audience_detail: medText,

  campaign_duration_days: z.enum(['7', '14', '30', '60', 'ongoing']).default('30'),

  ab_test_plan: z.boolean().default(true),
  include_retargeting_sequence: z.boolean().default(true),
  include_audience_targeting:   z.boolean().default(true),
  include_creative_brief:       z.boolean().default(true),

  current_cpl_benchmark: optText,
  guarantee_or_risk_reversal: optText,
  competitor_to_reference:    optText,
})

export type AdPilotInput = z.infer<typeof adPilotSchema>

// ── Tool 25: RetargetEngine ───────────────────────────────────
export const retargetEngineSchema = z.object({
  retarget_audience: z.enum([
    'website_visitors_no_purchase',
    'instagram_engagers',
    'video_viewers_50pct',
    'whatsapp_enquirers_no_buy',
    'cart_abandoners',
    'past_customers_upsell',
    'lookalike_existing_customers',
    'email_openers_no_click',
    'landing_page_visitors',
  ], { required_error: 'Select who you are retargeting' }),

  time_since_interaction: z.enum([
    '1_3_days',
    '4_7_days',
    '8_14_days',
    '15_30_days',
    '30_90_days',
    '90_plus_days',
  ], { required_error: 'Select how long ago they interacted' }),

  retarget_offer: optText,

  retarget_platforms: z.enum([
    'meta',
    'google',
    'both_meta_google',
    'whatsapp_only',
    'email_only',
    'multi_channel',
  ]).default('meta'),

  sequence_length: z.enum(['3', '5', '7']).default('5'),
  primary_objection_to_address: z.enum([
    'price_too_high',
    'not_sure_if_trustworthy',
    'not_ready_yet',
    'comparing_options',
    'forgot_about_us',
    'bad_first_impression',
    'need_more_info',
  ]).default('forgot_about_us'),

  retarget_offer_type: z.enum([
    'same_offer_urgency',
    'reduced_price_offer',
    'bonus_added',
    'risk_reversal_guarantee',
    'free_trial_first_step',
    'social_proof_flood',
  ]).default('same_offer_urgency'),

  include_whatsapp_escalation: z.boolean().default(true),
})

export type RetargetEngineInput = z.infer<typeof retargetEngineSchema>

// ── Tool 26: InfluencerBriefWriter ───────────────────────────
export const influencerBriefSchema = z.object({
  influencer_tier: z.enum([
    'nano_1k_10k',
    'micro_10k_100k',
    'mid_100k_500k',
    'macro_500k_1m',
    'mega_1m_plus',
    'celebrity',
  ], { required_error: 'Select the influencer tier you are targeting' }),

  campaign_goal: z.enum([
    'brand_awareness',
    'product_review',
    'promo_code_discount',
    'event_promotion',
    'giveaway_competition',
    'brand_ambassador_longterm',
    'content_creation_only',
    'direct_sales_affiliate',
  ], { required_error: 'Select the campaign goal' }),

  content_deliverables: z.array(z.enum([
    'instagram_reel',
    'instagram_static_post',
    'instagram_stories_3',
    'tiktok_video',
    'youtube_integration',
    'youtube_dedicated',
    'twitter_thread',
    'facebook_post',
    'blog_post',
    'podcast_mention',
  ])).min(1, 'Select at least one deliverable'),

  compensation: optText,

  key_messages: longText,

  things_to_avoid: optText,
  competitor_brands_to_avoid: optText,

  approval_process: z.enum([
    'pre_approval_required',
    'guidelines_only_no_approval',
    'post_approval_24hrs',
  ]).default('pre_approval_required'),

  campaign_duration_weeks: z.enum(['1', '2', '4', '8', 'ongoing']).default('2'),

  include_legal_clauses:     z.boolean().default(true),
  include_tracking_setup:    z.boolean().default(true),
  include_content_examples:  z.boolean().default(true),
  include_payment_structure: z.boolean().default(true),
})

export type InfluencerBriefInput = z.infer<typeof influencerBriefSchema>

// ── Tool 27: GoogleAdCraft ────────────────────────────────────
export const googleAdCraftSchema = z.object({
  ad_type: z.enum([
    'search_responsive',
    'performance_max',
    'display_banner',
    'local_google_maps',
    'shopping_product',
    'youtube_preroll',
    'youtube_bumper',
  ], { required_error: 'Select the Google ad type' }),

  product_service: medText,

  primary_keywords: optText,

  target_location: shortText,

  unique_offer: optText,

  search_intent: z.enum([
    'buying_transactional',
    'informational_research',
    'local_near_me',
    'comparison_best',
    'problem_solution',
  ]).default('buying_transactional'),

  bidding_strategy: z.enum([
    'target_cpa',
    'target_roas',
    'maximize_clicks',
    'maximize_conversions',
    'manual_cpc',
  ]).default('maximize_conversions'),

  include_extensions:     z.boolean().default(true),
  include_negative_keywords: z.boolean().default(true),
  include_audience_signals:  z.boolean().default(true),
  include_landing_page_rec:  z.boolean().default(true),

  monthly_budget_naira: optText,
  num_ad_variations:    z.enum(['1', '3']).default('3'),
})

export type GoogleAdCraftInput = z.infer<typeof googleAdCraftSchema>

// ── Tool 28: FunnelBuilder ────────────────────────────────────
export const funnelBuilderSchema = z.object({
  funnel_type: z.enum([
    'lead_gen_whatsapp_optin',
    'product_launch_funnel',
    'webinar_workshop_funnel',
    'ecommerce_product_funnel',
    'service_booking_funnel',
    'high_ticket_consulting_funnel',
    'membership_subscription_funnel',
    'event_registration_funnel',
  ], { required_error: 'Select the funnel type' }),

  funnel_offer: longText,

  lead_magnet: optText,

  average_sale_value: optText,

  current_conversion_problem: z.enum([
    'not_generating_leads',
    'leads_not_converting',
    'high_no_show_rate',
    'price_objections',
    'no_repeat_buyers',
    'building_from_scratch',
    'replacing_existing_funnel',
  ]).default('building_from_scratch'),

  funnel_stages_count: z.enum(['3', '5', '7']).default('5'),

  whatsapp_as_crm: z.boolean().default(true),
  include_email_sequence: z.boolean().default(true),
  include_page_copy: z.boolean().default(true),
  include_conversion_benchmarks: z.boolean().default(true),

  target_conversion_rate: optText,
  traffic_source: z.enum([
    'paid_ads',
    'organic_social',
    'referral_word_of_mouth',
    'seo_google',
    'influencer',
    'mixed_all_sources',
  ]).default('mixed_all_sources'),
})

export type FunnelBuilderInput = z.infer<typeof funnelBuilderSchema>

// ── Tool 29: LeadMagnetForge ──────────────────────────────────
export const leadMagnetForgeSchema = z.object({
  magnet_type: z.enum([
    'pdf_guide_report',
    'checklist_cheatsheet',
    'template_toolkit',
    'mini_video_course',
    'quiz_scorecard',
    'swipe_file',
    'calculator_tool',
    'email_masterclass_series',
    'free_consultation',
    'webinar_recording',
  ], { required_error: 'Select the lead magnet format' }),

  magnet_topic: medText,

  target_reader: medText,

  what_they_get: shortText,

  promotion_channels: z.array(z.enum([
    'instagram',
    'facebook',
    'whatsapp',
    'website_popup',
    'paid_ads',
    'linkedin',
    'email_signature',
  ])).optional(),

  collection_method: z.enum([
    'whatsapp_number',
    'email_only',
    'whatsapp_and_email',
    'phone_number',
  ]).default('whatsapp_number'),

  delivery_method: z.enum([
    'instant_whatsapp',
    'email_delivery',
    'download_link',
    'whatsapp_group_invite',
  ]).default('instant_whatsapp'),

  include_full_outline:   z.boolean().default(true),
  include_optin_copy:     z.boolean().default(true),
  include_follow_up_sequence: z.boolean().default(true),
  include_promotion_scripts:  z.boolean().default(true),

  awoof_comparison: optText,
})

export type LeadMagnetForgeInput = z.infer<typeof leadMagnetForgeSchema>

// ── Tool 30: ProposalWriter ───────────────────────────────────
export const proposalWriterSchema = z.object({
  client_name: shortText,

  client_problem: longText,

  your_solution: longText,

  timeline: shortText,

  pricing_structure: longText,

  guarantee_or_risk_reversal: optText,

  your_credentials: optText,

  proposal_format: z.enum([
    'concise_2_page',
    'comprehensive_full',
    'pitch_deck_style',
    'email_proposal',
    'whatsapp_voice_note_script',
  ]).default('comprehensive_full'),

  client_industry: optText,
  decision_maker: optText,
  proposal_deadline: optText,

  awoof_comparison: optText,
  previous_agency_experience: z.enum([
    'they_had_bad_experience',
    'first_time_outsourcing',
    'comparing_multiple_vendors',
    'returning_client',
    'referral',
    'unknown',
  ]).default('unknown'),

  include_case_studies: z.boolean().default(true),
  include_payment_terms: z.boolean().default(true),
  include_next_steps:    z.boolean().default(true),
  include_faq:           z.boolean().default(false),
})

export type ProposalWriterInput = z.infer<typeof proposalWriterSchema>

// ─────────────────────────────────────────────────────────────
// SCHEMA MAP
// ─────────────────────────────────────────────────────────────
export const TOOL_SCHEMAS_21_30: Record<string, any> = {
  'brand-positioner':       brandPositionerSchema,
  'pricing-narrator':       pricingNarratorSchema,
  'budget-optimizer':       budgetOptimizerSchema,
  'ad-pilot':               adPilotSchema,
  'retarget-engine':        retargetEngineSchema,
  'influencer-brief-writer': influencerBriefSchema,
  'google-ad-craft':        googleAdCraftSchema,
  'funnel-builder':         funnelBuilderSchema,
  'lead-magnet-forge':      leadMagnetForgeSchema,
  'proposal-writer':        proposalWriterSchema,
}
