// ═══════════════════════════════════════════════════════════════
// /lib/validations/tool-schemas-11-20.ts
// Zod validation schemas for Tools 11–20
// ═══════════════════════════════════════════════════════════════

import { z } from 'zod'

const shortText = z.string().min(2).max(200).trim()
const medText   = z.string().min(2).max(500).trim()
const longText  = z.string().min(10).max(2000).trim()
const optText   = z.string().max(500).trim().optional()
const optLong   = z.string().max(2000).trim().optional()

// ── Tool 11: StoryPlanner ────────────────────────────────────
export const storyPlannerSchema = z.object({
  story_goal: z.enum([
    'awareness',
    'generate_leads',
    'drive_sales',
    'increase_engagement',
    'build_trust_credibility',
    'get_referrals',
    'educate_audience',
    'promote_event',
  ], { required_error: 'Select the goal for this story sequence' }),

  story_topic: longText,

  story_count: z.enum(['5', '7', '10', '12']).default('7'),

  include_polls: z.boolean().default(true),
  include_questions: z.boolean().default(true),
  include_countdowns: z.boolean().default(false),
  include_link_stickers: z.boolean().default(true),

  target_platform: z.enum([
    'instagram_stories',
    'facebook_stories',
    'both',
    'whatsapp_status',
  ]).default('instagram_stories'),

  story_style: z.enum([
    'behind_the_scenes',
    'educational_tips',
    'promotional_offer',
    'testimonial_feature',
    'product_reveal',
    'day_in_the_life',
    'challenge_solution',
    'community_spotlight',
  ]).default('educational_tips'),

  duration_days: z.enum(['1', '2', '3']).default('1'),
  urgency_element: optText,
  highlight_cover_name: optText,
})

export type StoryPlannerInput = z.infer<typeof storyPlannerSchema>

// ── Tool 12: WhatsApp Campaign Builder ───────────────────────
export const whatsappCampaignSchema = z.object({
  campaign_goal: z.enum([
    'product_launch',
    'promo_offer',
    'event_invite',
    'restock_new_arrival',
    'referral_drive',
    'appointment_booking',
    'win_back_inactive',
    'general_engagement',
    'flash_sale',
    'holiday_seasonal',
  ], { required_error: 'Select the campaign goal' }),

  offer_details: longText,

  message_count: z.enum(['1', '2', '3', '5']).default('3'),

  deadline: optText,

  tone_formality: z.enum([
    'very_personal',
    'warm_casual',
    'professional_friendly',
    'urgent_direct',
  ]).default('warm_casual'),

  target_list_segment: z.enum([
    'all_contacts',
    'past_customers',
    'recent_enquiries',
    'cold_contacts',
    'vip_customers',
  ]).default('all_contacts'),

  include_media_description: z.boolean().default(true),
  include_reply_instructions: z.boolean().default(true),

  awoof_comparison: optText,
  social_proof_to_include: optText,
  bonus_offer: optText,
})

export type WhatsAppCampaignInput = z.infer<typeof whatsappCampaignSchema>

// ── Tool 13: FollowUpSequencer ────────────────────────────────
export const followUpSequencerSchema = z.object({
  lead_context: longText,

  objection: z.enum([
    'price_too_high',
    'think_about_it',
    'talk_to_someone_first',
    'not_right_now',
    'no_response_at_all',
    'comparing_prices',
    'budget_tight',
    'bad_past_experience',
    'dont_see_value',
    'other',
  ], { required_error: 'Select the primary objection or situation' }),

  objection_custom: optText,

  num_follow_ups: z.enum(['3', '5', '7']).default('5'),

  channel: z.enum([
    'whatsapp_only',
    'email_only',
    'phone_call',
    'whatsapp_and_email',
    'whatsapp_and_call',
    'all_channels',
  ]).default('whatsapp_only'),

  value_add: optText,
  product_service: optText,
  lead_temperature: z.enum(['hot', 'warm', 'cold']).default('warm'),

  days_since_last_contact: z.enum([
    '1',
    '2_3',
    '4_7',
    '8_14',
    '15_30',
    '30_plus',
  ]).default('2_3'),
})

export type FollowUpSequencerInput = z.infer<typeof followUpSequencerSchema>

// ── Tool 14: WelcomeMessageCraft ─────────────────────────────
export const welcomeMessageSchema = z.object({
  message_type: z.enum([
    'greeting_welcome',
    'away_out_of_hours',
    'first_reply_after_save',
    'catalogue_prompt',
    'booking_confirmation',
    'post_enquiry_follow_up',
    'full_set_all',
  ], { required_error: 'Select the message type' }),

  business_hours: optText,
  response_time_promise: optText,

  what_to_offer_immediately: medText,

  tone: z.enum([
    'very_warm_personal',
    'friendly_professional',
    'formal_corporate',
    'energetic_exciting',
  ]).default('friendly_professional'),

  include_catalogue_link: z.boolean().default(false),
  include_quick_replies: z.boolean().default(true),
  languages: z.enum([
    'english_only',
    'english_and_pidgin',
    'english_and_yoruba_greeting',
    'english_and_igbo_greeting',
    'english_and_hausa_greeting',
  ]).default('english_only'),
})

export type WelcomeMessageInput = z.infer<typeof welcomeMessageSchema>

// ── Tool 15: PromoBlast ───────────────────────────────────────
export const promoBlastSchema = z.object({
  promo_type: z.enum([
    'flash_sale',
    'weekly_promo',
    'clearance_stock',
    'seasonal_holiday',
    'birthday_anniversary',
    'new_arrival_drop',
    'bundle_deal',
    'referral_incentive',
    'limited_slots',
    'price_increase_warning',
  ], { required_error: 'Select the promotion type' }),

  offer: longText,

  channels: z.array(z.enum([
    'whatsapp',
    'instagram_post',
    'instagram_story',
    'facebook_post',
    'sms',
    'email',
  ])).min(1, 'Select at least one channel'),

  deadline_hours: medText,

  normal_price: optText,
  promo_price: optText,
  slots_available: optText,

  awoof_comparison: optText,
  social_proof: optText,
  bonus_included: optText,
  guarantee: optText,
})

export type PromoBlastInput = z.infer<typeof promoBlastSchema>

// ── Tool 16: StrategyBrain ────────────────────────────────────
export const strategyBrainSchema = z.object({
  strategy_goal: z.enum([
    'get_first_100_customers',
    'double_monthly_revenue',
    'launch_new_product',
    'build_online_presence',
    'reduce_ad_spend_grow_organic',
    'enter_new_city_market',
    'increase_repeat_purchases',
    'build_whatsapp_email_list',
    'recover_from_slow_period',
    'dominate_local_market',
  ], { required_error: 'Select the primary strategic goal' }),

  current_situation: longText,

  monthly_budget: z.enum([
    '0_50k',
    '50_150k',
    '150_500k',
    '500k_1m',
    '1m_plus',
  ], { required_error: 'Select your monthly marketing budget' }),

  biggest_challenge: longText,

  team_size: z.enum([
    'solo_founder',
    '2_5_people',
    '6_20_people',
    '20_plus_people',
  ]).default('solo_founder'),

  time_available_per_week: z.enum([
    'less_than_2hrs',
    '2_5hrs',
    '5_10hrs',
    '10_plus_hrs',
  ]).default('5_10hrs'),

  competitors: optText,

  preferred_channels: z.array(z.enum([
    'instagram',
    'facebook',
    'whatsapp',
    'tiktok',
    'linkedin',
    'google_ads',
    'seo_blogging',
    'influencer',
    'referral_word_of_mouth',
    'email_marketing',
    'offline_events',
  ])).optional(),

  current_monthly_revenue: optText,
  target_monthly_revenue:  optText,
  current_customer_count:  optText,
})

export type StrategyBrainInput = z.infer<typeof strategyBrainSchema>

// ── Tool 17: CampaignClock ────────────────────────────────────
export const campaignClockSchema = z.object({
  campaign_month: z.enum([
    'january','february','march','april','may','june',
    'july','august','september','october','november','december',
  ], { required_error: 'Select the month you are planning for' }),

  campaign_year: z.string().regex(/^\d{4}$/).default(String(new Date().getFullYear())),

  target_audience_religion: z.enum([
    'mixed_balanced',
    'predominantly_christian',
    'predominantly_muslim',
    'secular_not_relevant',
  ]).default('mixed_balanced'),

  campaign_goals: z.array(z.enum([
    'awareness',
    'leads',
    'sales',
    'engagement',
    'trust_credibility',
    'referrals',
    'retention',
  ])).min(1, 'Select at least one goal'),

  budget_monthly: z.enum([
    'under_50k',
    '50k_200k',
    '200k_1m',
    '1m_plus',
    'not_specified',
  ]).default('not_specified'),

  platforms_in_use: z.array(z.enum([
    'instagram','facebook','whatsapp','tiktok',
    'linkedin','google_ads','email',
  ])).optional(),

  products_to_promote: optText,
  special_events_in_month: optText,
})

export type CampaignClockInput = z.infer<typeof campaignClockSchema>

// ── Tool 18: AudienceProfiler ─────────────────────────────────
export const audienceProfilerSchema = z.object({
  current_customer_description: longText,

  product_being_sold: medText,

  problems_you_solve: longText,

  target_city: z.enum([
    'lagos',
    'abuja',
    'port_harcourt',
    'kano',
    'ibadan',
    'enugu',
    'benin_city',
    'owerri',
    'warri',
    'nationwide',
    'west_africa',
    'diaspora_uk_usa',
    'other',
  ]).default('lagos'),

  income_bracket: z.enum([
    'low_under_100k_monthly',
    'lower_mid_100_300k',
    'mid_300_700k',
    'upper_mid_700k_2m',
    'high_2m_plus',
    'business_owner_variable',
    'not_sure',
  ]).default('not_sure'),

  age_range: z.enum([
    '18_25',
    '25_35',
    '35_45',
    '45_55',
    '55_plus',
    'mixed',
  ]).default('25_35'),

  gender_focus: z.enum([
    'predominantly_female',
    'predominantly_male',
    'balanced_mixed',
  ]).default('balanced_mixed'),

  depth: z.enum([
    'standard',
    'deep_dive',
  ]).default('standard'),

  include_anti_profile: z.boolean().default(true),
  include_messaging_matrix: z.boolean().default(true),
  include_trust_touchpoints: z.boolean().default(true),
})

export type AudienceProfilerInput = z.infer<typeof audienceProfilerSchema>

// ── Tool 19: LaunchPad ────────────────────────────────────────
export const launchPadSchema = z.object({
  what_are_you_launching: longText,

  launch_date: shortText,

  weeks_before_launch: z.enum([
    '1',
    '2',
    '4',
    '6',
    '8',
    '12',
  ], { required_error: 'Select how many weeks before launch you are' }),

  launch_budget: z.enum([
    'bootstrap_under_50k',
    '50k_200k',
    '200k_500k',
    '500k_1m',
    '1m_plus',
  ], { required_error: 'Select the launch budget' }),

  launch_type: z.enum([
    'brand_new_business',
    'new_product_service',
    'new_location_branch',
    'relaunch_rebrand',
    'digital_product_course',
    'physical_product',
    'event_programme',
    'membership_subscription',
  ], { required_error: 'Select the launch type' }),

  early_access_offer: optText,
  waitlist_goal:      optText,
  influencer_seeding: z.boolean().default(false),
  paid_ads_budget:    optText,

  target_first_week_sales: optText,
  unique_launch_angle:     optText,
  risk_reversal:           optText,
})

export type LaunchPadInput = z.infer<typeof launchPadSchema>

// ── Tool 20: CarouselScriptBuilder ───────────────────────────
export const carouselScriptSchema = z.object({
  carousel_topic: medText,

  carousel_type: z.enum([
    'educational_tips',
    'listicle_top_mistakes',
    'case_study_before_after',
    'product_showcase_features',
    'myth_vs_fact',
    'step_by_step_process',
    'comparison_old_vs_new',
    'industry_insights',
    'customer_journey_story',
    'faq_answers',
  ], { required_error: 'Select the carousel format' }),

  num_slides: z.enum(['5', '7', '10', '12']).default('7'),

  target_audience: medText,

  platform: z.enum([
    'instagram',
    'facebook',
    'linkedin',
  ]).default('instagram'),

  carousel_goal: z.enum([
    'awareness',
    'leads',
    'sales',
    'engagement',
    'trust',
    'education',
  ]).default('awareness'),

  include_cover_slide_brief: z.boolean().default(true),
  include_caption_for_post: z.boolean().default(true),
  include_design_direction: z.boolean().default(true),
  include_cta_slide: z.boolean().default(true),

  hook_style: z.enum([
    'fear_of_missing_out',
    'bold_statement',
    'question_hook',
    'number_promise',
    'story_open',
    'shocking_fact',
  ]).default('number_promise'),
})

export type CarouselScriptInput = z.infer<typeof carouselScriptSchema>

// ─────────────────────────────────────────────────────────────
// EXTENDED SCHEMA MAP
// ─────────────────────────────────────────────────────────────
export const TOOL_SCHEMAS_11_20: Record<string, any> = {
  'story-planner':              storyPlannerSchema,
  'whatsapp-campaign-builder':  whatsappCampaignSchema,
  'follow-up-sequencer':        followUpSequencerSchema,
  'welcome-message-craft':      welcomeMessageSchema,
  'promo-blast':                promoBlastSchema,
  'strategy-brain':             strategyBrainSchema,
  'campaign-clock':             campaignClockSchema,
  'audience-profiler':          audienceProfilerSchema,
  'launch-pad':                 launchPadSchema,
  'carousel-script-builder':    carouselScriptSchema,
}
