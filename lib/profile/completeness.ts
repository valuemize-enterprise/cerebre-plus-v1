// ═══════════════════════════════════════════════════════════════
// /lib/profile/completeness.ts
// Weighted profile completeness scoring and CTA generation.
// Mirrors the SQL get_profile_completeness() function but
// runs client-side for instant dashboard feedback.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// FIELD WEIGHTS (total = 100)
// ─────────────────────────────────────────────────────────────

export interface CompletenessField {
  key:         string          // Profile field name (snake_case)
  label:       string          // Display name
  weight:      number          // Points contributed when filled
  category:    FieldCategory
  helpText:    string          // Tooltip / CTA text
  minLength?:  number          // Minimum characters for "filled"
  href:        string          // Where to go to fill it
}

export type FieldCategory =
  | 'business_basics'
  | 'audience'
  | 'brand'
  | 'contact'
  | 'social_proof'
  | 'media'

export const COMPLETENESS_FIELDS: CompletenessField[] = [
  // ── Business Basics (38 points) ───────────────────────────
  { key: 'business_name',   label: 'Business name',    weight: 10, category: 'business_basics', href: '/profile', helpText: 'Your business name powers all AI output personalisation', minLength: 2 },
  { key: 'industry',        label: 'Industry',          weight: 10, category: 'business_basics', href: '/profile', helpText: 'Industry determines which templates and examples are used' },
  { key: 'city',            label: 'City',              weight:  8, category: 'business_basics', href: '/profile', helpText: 'Nigerian city names appear in all your marketing content' },
  { key: 'description',     label: 'Business description', weight: 12, category: 'business_basics', href: '/profile', helpText: 'This is the single most important field — fill it for 12 points', minLength: 20 },
  { key: 'years_in_business', label: 'Years in business', weight: 3, category: 'business_basics', href: '/profile', helpText: 'Used as a trust signal in all your marketing' },

  // ── Audience (18 points) ──────────────────────────────────
  { key: 'target_customer', label: 'Target customer',  weight: 10, category: 'audience', href: '/profile', helpText: 'Defines who every piece of content is written for', minLength: 10 },
  { key: 'unique_advantage', label: 'Unique advantage', weight:  8, category: 'audience', href: '/profile', helpText: 'What makes you different becomes your competitive edge in all copy', minLength: 10 },

  // ── Brand (13 points) ─────────────────────────────────────
  { key: 'brand_voice',     label: 'Brand voice',      weight:  8, category: 'brand', href: '/profile', helpText: 'Determines the tone of every tool output' },
  { key: 'primary_cta',     label: 'Primary CTA',      weight:  5, category: 'brand', href: '/profile', helpText: 'Your main call-to-action used in all marketing content' },

  // ── Contact (15 points) ───────────────────────────────────
  { key: 'whatsapp',        label: 'WhatsApp number',  weight: 10, category: 'contact', href: '/profile', helpText: 'Appears on every piece of content — mandatory for deal closing' },
  { key: 'phone',           label: 'Phone number',     weight:  3, category: 'contact', href: '/profile', helpText: 'Backup contact for trust signals' },
  { key: 'email_contact',   label: 'Business email',   weight:  2, category: 'contact', href: '/profile', helpText: 'Used in formal documents and email marketing' },

  // ── Social Proof (2 points) ───────────────────────────────
  { key: 'social_proof',    label: 'Social proof',     weight:  2, category: 'social_proof', href: '/profile', helpText: 'e.g. "Over 2,000 clients served" — appears in trust sections' },

  // ── Media (14 points) ─────────────────────────────────────
  { key: 'logo_url',        label: 'Business logo',    weight:  8, category: 'media', href: '/profile/brand', helpText: 'Makes all exported documents look professional' },
  { key: 'brand_colour',    label: 'Brand colour',     weight:  5, category: 'media', href: '/profile/brand', helpText: 'Applied to headers and design elements in exports' },
  { key: 'instagram',       label: 'Instagram handle', weight:  2, category: 'media', href: '/profile', helpText: 'Included in content CTAs for social following' },
  { key: 'facebook',        label: 'Facebook page',    weight:  2, category: 'media', href: '/profile', helpText: 'Included in content CTAs for social following' },
]

// Social media fields share the 6-point "social media" bucket — we count if ≥1 is filled
const SOCIAL_FIELDS = ['instagram', 'facebook', 'linkedin', 'tiktok', 'twitter']

// ─────────────────────────────────────────────────────────────
// SCORING FUNCTION
// ─────────────────────────────────────────────────────────────

export interface CompletenessResult {
  score:         number          // 0-100
  filledFields:  string[]        // Field keys that are filled
  emptyFields:   CompletenessField[]  // Fields that still need filling
  topCta:        CompletenessField | null  // Highest-value next action
  byCategory:    Record<FieldCategory, { score: number; max: number }>
}

/**
 * Calculates client-side profile completeness score.
 * Profile object uses snake_case keys (as returned from Supabase).
 */
export function calculateCompleteness(profile: Record<string, any>): CompletenessResult {
  let score = 0
  const filledFields: string[] = []
  const emptyFields: CompletenessField[] = []
  const byCategory = {} as Record<FieldCategory, { score: number; max: number }>

  // Initialise category buckets
  for (const field of COMPLETENESS_FIELDS) {
    if (!byCategory[field.category]) {
      byCategory[field.category] = { score: 0, max: 0 }
    }
    byCategory[field.category].max += field.weight
  }

  // Score social media as a group (cap at 6 points)
  const hasSocial = SOCIAL_FIELDS.some((f) => {
    const val = profile[f]
    return val && typeof val === 'string' && val.trim().length > 0
  })

  for (const field of COMPLETENESS_FIELDS) {
    // Skip individual social fields — handled as a group below
    if (SOCIAL_FIELDS.includes(field.key)) continue

    const value = profile[field.key]
    const isFilled =
      value !== null &&
      value !== undefined &&
      (typeof value !== 'string' || value.trim().length >= (field.minLength ?? 1))

    byCategory[field.category].max += 0  // Already set above

    if (isFilled) {
      score += field.weight
      byCategory[field.category].score += field.weight
      filledFields.push(field.key)
    } else {
      emptyFields.push(field)
    }
  }

  // Social media group bonus
  if (hasSocial) {
    score += 6
  }

  // Determine top CTA (highest-weight empty field)
  const topCta = emptyFields.length > 0
    ? emptyFields.reduce((a, b) => a.weight >= b.weight ? a : b)
    : null

  return {
    score:        Math.min(100, score),
    filledFields,
    emptyFields,
    topCta,
    byCategory,
  }
}

/**
 * Returns a friendly label for the completeness score.
 */
export function getCompletenessLabel(score: number): {
  label: string
  colour: string
  emoji: string
} {
  if (score >= 90) return { label: 'Excellent',      colour: '#10B880', emoji: '🌟' }
  if (score >= 75) return { label: 'Strong',         colour: '#0CC4A0', emoji: '✅' }
  if (score >= 60) return { label: 'Good',           colour: '#E09818', emoji: '💪' }
  if (score >= 40) return { label: 'Getting there',  colour: '#F5A623', emoji: '🔨' }
  if (score >= 20) return { label: 'Just starting',  colour: '#FF4830', emoji: '⚡' }
  return                  { label: 'Needs work',     colour: '#FF4830', emoji: '⚠️' }
}

/**
 * Returns the CTA text for improving completeness.
 */
export function getCompletnessCta(result: CompletenessResult): string {
  if (!result.topCta) return 'Your profile is complete!'
  return `Add your ${result.topCta.label.toLowerCase()} to unlock better outputs (+${result.topCta.weight} points)`
}

/**
 * Returns the impact statement for the completeness widget.
 */
export function getCompletenessImpact(score: number): string {
  if (score >= 90) return 'Your AI outputs are maximally personalised for your business.'
  if (score >= 75) return 'Strong profile — your tools are generating highly relevant content.'
  if (score >= 60) return 'Good profile. A few more fields will significantly improve your outputs.'
  if (score >= 40) return 'Your tools work — but completing your profile will make them 3x better.'
  return 'Complete your profile to unlock the full power of your 40 tools.'
}
