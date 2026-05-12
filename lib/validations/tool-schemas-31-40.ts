// ═══════════════════════════════════════════════════════════════
// /lib/validations/tool-schemas-31-40.ts
// Zod validation schemas for Tools 31–40 (final batch)
// ═══════════════════════════════════════════════════════════════

import { z } from 'zod'

const shortText = z.string().min(2).max(200).trim()
const medText   = z.string().min(2).max(500).trim()
const longText  = z.string().min(10).max(2000).trim()
const optText   = z.string().max(500).trim().optional()
const optLong   = z.string().max(2000).trim().optional()

// ── Tool 31: SalesScriptWriter ───────────────────────────────
export const salesScriptWriterSchema = z.object({
  script_type: z.enum([
    'whatsapp_conversation',
    'phone_call',
    'in_person_meeting',
    'discovery_call',
    'presentation_pitch',
    'closing_call',
    'demo_walkthrough',
    'follow_up_call',
  ], { required_error: 'Select the type of sales conversation' }),

  product_service: medText,

  lead_temperature: z.enum([
    'hot',
    'warm',
    'cold',
  ]).default('warm'),

  top_objection: z.enum([
    'price_too_high',
    'think_about_it',
    'comparing_options',
    'not_sure_of_quality_fobe',
    'budget_tight_now',
    'talk_to_partner',
    'already_using_competitor',
    'not_right_time',
  ]).default('price_too_high'),

  desired_outcome: z.enum([
    'book_appointment',
    'get_payment_deposit',
    'get_verbal_commitment',
    'qualify_the_lead',
    'close_sale_immediately',
    'schedule_follow_up',
  ]).default('get_payment_deposit'),

  typical_sale_value: optText,
  awoof_comparison:   optText,
  previous_interaction: optText,

  include_all_five_objections: z.boolean().default(true),
  include_all_four_closes:     z.boolean().default(true),
  include_voice_note_script:   z.boolean().default(false),
})

export type SalesScriptWriterInput = z.infer<typeof salesScriptWriterSchema>

// ── Tool 32: TestimonialCollector ────────────────────────────
export const testimonialCollectorSchema = z.object({
  collection_method: z.enum([
    'whatsapp_message',
    'in_person_after_service',
    'google_review_request',
    'email_request',
    'voice_note_request',
    'video_testimonial_request',
    'all_channels',
  ], { required_error: 'Select how you will collect testimonials' }),

  relationship_stage: z.enum([
    'immediately_after_delivery',
    '3_7_days_after',
    '30_days_after_results',
    'ongoing_long_term',
  ]).default('3_7_days_after'),

  product_or_service_delivered: medText,

  result_achieved: optText,

  testimonial_goal: z.enum([
    'social_proof_for_ads',
    'website_trust_section',
    'whatsapp_broadcast_proof',
    'overcome_price_objection',
    'build_general_credibility',
    'all_purposes',
  ]).default('all_purposes'),

  incentive: optText,

  include_five_questions:         z.boolean().default(true),
  include_nonresponder_followup:  z.boolean().default(true),
  include_social_media_templates: z.boolean().default(true),
  include_fobe_busting_question:  z.boolean().default(true),
})

export type TestimonialCollectorInput = z.infer<typeof testimonialCollectorSchema>

// ── Tool 33: ReviewRequestor ─────────────────────────────────
export const reviewRequestorSchema = z.object({
  review_platform: z.enum([
    'google_maps_business',
    'instagram_dms_highlights',
    'facebook_page',
    'whatsapp_group_community',
    'nairaland_forum',
    'all_platforms',
  ], { required_error: 'Select where you want reviews' }),

  what_they_experienced: medText,

  timing: z.enum([
    'same_day',
    '2_3_days_after',
    '1_week_after',
    '2_weeks_after',
    'after_result_delivered',
  ]).default('2_3_days_after'),

  request_channel: z.enum([
    'whatsapp',
    'sms',
    'in_person',
    'email',
    'voice_note',
  ]).default('whatsapp'),

  current_review_count:  optText,
  current_rating:        optText,
  competitor_advantage:  optText,

  include_positive_response_scripts: z.boolean().default(true),
  include_negative_response_scripts: z.boolean().default(true),
  include_velocity_strategy:         z.boolean().default(true),
  include_nonresponder_sequence:     z.boolean().default(true),
})

export type ReviewRequestorInput = z.infer<typeof reviewRequestorSchema>

// ── Tool 34: CrisisResponder ─────────────────────────────────
export const crisisResponderSchema = z.object({
  crisis_type: z.enum([
    'customer_complaint_public',
    'bad_reviews_surge',
    'service_failure',
    'social_media_backlash_viral',
    'data_security_breach',
    'staff_misconduct',
    'competitor_attack_false_claim',
    'product_quality_issue',
    'payment_dispute',
    'delivery_failure',
  ], { required_error: 'Select the type of crisis' }),

  what_happened: longText,

  is_complaint_valid: z.enum([
    'yes_fully_valid',
    'partially_valid',
    'no_false_claim',
    'not_sure_investigating',
  ], { required_error: 'Select validity of the complaint' }),

  response_platform: z.array(z.enum([
    'instagram',
    'facebook',
    'twitter_x',
    'whatsapp_direct',
    'google_review_response',
    'tiktok',
    'public_statement',
    'press_release',
  ])).min(1, 'Select at least one response platform'),

  crisis_severity: z.enum([
    'minor_one_complaint',
    'moderate_few_customers',
    'serious_going_viral',
    'severe_business_threatening',
  ]).default('moderate_few_customers'),

  recovery_offer: optText,
  spokesperson:   optText,
  timeline_hours_since_crisis: z.enum(['0_6hrs', '6_24hrs', '1_3days', '3plus_days']).default('6_24hrs'),
  include_48hr_action_plan:   z.boolean().default(true),
  include_recovery_sequence:  z.boolean().default(true),
})

export type CrisisResponderInput = z.infer<typeof crisisResponderSchema>

// ── Tool 35: LocalSEOKit ─────────────────────────────────────
export const localSEOKitSchema = z.object({
  business_location: shortText,

  primary_service: medText,

  service_areas: optText,

  seo_priority: z.enum([
    'google_maps_ranking',
    'appear_in_near_me',
    'get_more_reviews',
    'fix_complete_google_listing',
    'outrank_specific_competitor',
    'complete_local_seo_overhaul',
  ], { required_error: 'Select your primary SEO goal' }),

  current_google_rating:       optText,
  current_review_count:        optText,
  top_competitors_listed:      optText,
  target_search_queries:       optText,

  include_gbp_checklist:       z.boolean().default(true),
  include_keyword_list:        z.boolean().default(true),
  include_citation_guide:      z.boolean().default(true),
  include_review_strategy:     z.boolean().default(true),
  include_nigerian_directories: z.boolean().default(true),
})

export type LocalSEOKitInput = z.infer<typeof localSEOKitSchema>

// ── Tool 36: KeywordHunter ───────────────────────────────────
export const keywordHunterSchema = z.object({
  seed_topic: medText,

  keyword_intent: z.enum([
    'buying_transactional',
    'local_services_near_me',
    'problem_solution',
    'comparison_best',
    'informational_research',
    'mixed_all_intents',
  ], { required_error: 'Select the primary search intent' }),

  target_cities: optText,

  content_type_for_keywords: z.enum([
    'blog_articles_seo',
    'paid_ads_google',
    'website_service_pages',
    'youtube_video_titles',
    'all_content_types',
  ]).default('all_content_types'),

  competitor_url:    optText,
  language_variants: z.boolean().default(true),
  include_pidgin:    z.boolean().default(true),
  include_voice_search: z.boolean().default(true),
  include_negative_keywords: z.boolean().default(true),

  output_format: z.enum([
    'grouped_by_intent',
    'grouped_by_content_type',
    'flat_list_with_data',
  ]).default('grouped_by_intent'),
})

export type KeywordHunterInput = z.infer<typeof keywordHunterSchema>

// ── Tool 37: WebsiteCopyAudit ────────────────────────────────
export const websiteCopyAuditSchema = z.object({
  website_url: shortText,

  pages_to_audit: z.array(z.enum([
    'homepage',
    'about_page',
    'services_page',
    'contact_page',
    'pricing_page',
    'landing_page',
    'product_page',
  ])).min(1, 'Select at least one page to audit'),

  current_copy_or_headline: longText,

  main_conversion_goal: z.enum([
    'whatsapp_enquiry',
    'form_submission',
    'phone_call',
    'purchase_online',
    'booking_appointment',
    'email_signup',
  ], { required_error: 'Select what you want visitors to do' }),

  biggest_conversion_problem: z.enum([
    'people_visit_dont_contact',
    'bounce_rate_high',
    'copy_sounds_generic',
    'not_enough_trust_signals',
    'cta_not_converting',
    'not_showing_on_google',
    'mobile_experience_poor',
    'not_sure',
  ]).default('people_visit_dont_contact'),

  industry_context:     optText,
  competitor_websites:  optText,

  include_full_rewrite: z.boolean().default(true),
  include_cta_rewrites: z.boolean().default(true),
  include_trust_section_additions: z.boolean().default(true),
  include_mobile_notes: z.boolean().default(true),
  include_seo_notes:    z.boolean().default(false),
})

export type WebsiteCopyAuditInput = z.infer<typeof websiteCopyAuditSchema>

// ── Tool 38: ReferralProgramBuilder ─────────────────────────
export const referralProgramBuilderSchema = z.object({
  referral_incentive: shortText,

  new_customer_incentive: optText,

  referral_goal: z.enum([
    'acquire_new_customers',
    'increase_revenue',
    'build_ambassador_community',
    'drive_specific_campaign',
    'reduce_ad_spend',
  ], { required_error: 'Select the primary referral goal' }),

  referral_method: z.enum([
    'whatsapp_share_message',
    'unique_code_per_person',
    'referral_link',
    'word_of_mouth_tracked',
    'hybrid_code_and_message',
  ]).default('whatsapp_share_message'),

  existing_customer_relationship: z.enum([
    'strong_loyal_base',
    'moderate_occasional',
    'new_building_base',
  ]).default('moderate_occasional'),

  referral_tracking_method: z.enum([
    'mention_your_name',
    'unique_code',
    'whatsapp_screenshot',
    'google_form',
    'simple_spreadsheet',
  ]).default('mention_your_name'),

  include_launch_broadcast:     z.boolean().default(true),
  include_ambassador_brief:     z.boolean().default(true),
  include_share_message_template: z.boolean().default(true),
  include_tracking_system:      z.boolean().default(true),
  include_gamification:         z.boolean().default(false),
})

export type ReferralProgramBuilderInput = z.infer<typeof referralProgramBuilderSchema>

// ── Tool 39: NewsletterAI ────────────────────────────────────
export const newsletterAISchema = z.object({
  newsletter_theme: medText,

  reader_description: medText,

  newsletter_length: z.enum([
    'short',
    'medium',
    'long',
  ]).default('medium'),

  featured_offer: optText,
  story_angle: z.enum([
    'customer_success_story',
    'own_business_lesson',
    'industry_observation',
    'surprising_data_point',
    'myth_busting',
    'behind_the_scenes',
  ]).default('own_business_lesson'),

  include_industry_insight:    z.boolean().default(true),
  include_featured_offer:      z.boolean().default(true),
  include_quick_tip_section:   z.boolean().default(true),
  include_community_shoutout:  z.boolean().default(false),

  newsletter_frequency: z.enum([
    'weekly',
    'biweekly',
    'monthly',
  ]).default('weekly'),

  tone_for_newsletter: z.enum([
    'expert_friend',
    'industry_authority',
    'personal_storyteller',
    'value_packed_practical',
  ]).default('expert_friend'),

  previous_issue_topic: optText,
})

export type NewsletterAIInput = z.infer<typeof newsletterAISchema>

// ── Tool 40: WinBackCampaign ─────────────────────────────────
export const winBackCampaignSchema = z.object({
  inactive_period: z.enum([
    '30_days',
    '60_days',
    '90_days',
    '6_months',
    '12_months_plus',
  ], { required_error: 'Select how long they have been inactive' }),

  reason_for_inactivity: z.enum([
    'life_happened_drifted',
    'price_concern',
    'had_bad_experience',
    'competitor_won_them',
    'may_no_longer_need_it',
    'forgot_about_us',
    'unknown',
  ]).default('unknown'),

  win_back_offer: optText,

  win_back_channel: z.enum([
    'whatsapp',
    'email',
    'sms',
    'whatsapp_and_email',
    'phone_call_then_whatsapp',
  ]).default('whatsapp'),

  messages_in_sequence: z.enum(['3', '5']).default('3'),

  what_changed_or_improved: optText,

  customer_segment: z.enum([
    'high_value_customers',
    'frequent_past_buyers',
    'one_time_purchasers',
    'all_inactive_customers',
  ]).default('all_inactive_customers'),

  win_back_deadline: optText,

  include_akin_winback_formula: z.boolean().default(true),
  include_reactivation_offer:   z.boolean().default(true),
  include_final_goodbye_message: z.boolean().default(true),
})

export type WinBackCampaignInput = z.infer<typeof winBackCampaignSchema>

// ─────────────────────────────────────────────────────────────
// SCHEMA MAP
// ─────────────────────────────────────────────────────────────
export const TOOL_SCHEMAS_31_40: Record<string, any> = {
  'sales-script-writer':    salesScriptWriterSchema,
  'testimonial-collector':  testimonialCollectorSchema,
  'review-requestor':       reviewRequestorSchema,
  'crisis-responder':       crisisResponderSchema,
  'local-seo-kit':          localSEOKitSchema,
  'keyword-hunter':         keywordHunterSchema,
  'website-copy-audit':     websiteCopyAuditSchema,
  'referral-program-builder': referralProgramBuilderSchema,
  'newsletter-ai':          newsletterAISchema,
  'win-back-campaign':      winBackCampaignSchema,
}
