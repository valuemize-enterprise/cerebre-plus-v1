// ═══════════════════════════════════════════════════════════════
// /lib/coins/economy.ts  — Cerebre Plus Coin Economy v2
//
// Single source of truth for plans, top-up packs, and all
// pricing rules. Import this wherever plan logic is needed.
//
// PLANS:
//   free    — ₦0      · 70 coins  · 30-day trial (hard expiry)
//   starter — ₦20,000 · 150 coins · Annual
//   growth  — ₦80,000 · 700 coins · Annual + SME Club
//
// TOP-UP RULES:
//   • Free plan users CANNOT top up
//   • Starter/Growth: min 10 coins = ₦5,000 (₦500/coin)
//   • Bulk packs: 50c=₦20K · 100c=₦35K · 200c=₦65K · 500c=₦150K
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// PLANS
// ─────────────────────────────────────────────────────────────

export const PLANS = {
  free: {
    id:           'free',
    name:         'Free Trial',
    price:        0,
    priceLabel:   '₦0',
    billingCycle: 'one-time' as const,
    coins:        70,
    rolloverCap:  0,
    validDays:    30,         // Hard expiry — app locked after 30 days
    canTopUp:     false,
    badge:        null,
    monthlyEq:    null,
    headline:     'Discover what AI can do for your business — at zero cost.',
    description:  'No credit card. No obligation. Just 70 coins, 30 days, and a real taste of what Cerebre Plus can do for your marketing.',
  },
  starter: {
    id:           'starter',
    name:         'Starter',
    price:        20_000,
    priceLabel:   '₦20,000',
    billingCycle: 'annual' as const,
    coins:        150,
    rolloverCap:  0,
    validDays:    365,
    canTopUp:     true,
    badge:        null,
    monthlyEq:    '₦1,667/mo',
    headline:     'Your first real marketing system — for less than a meal out per week.',
    description:  '150 coins gives you consistent, professional marketing output all year long. Every tool. No agency. No salary. Just results.',
  },
  growth: {
    id:           'growth',
    name:         'Growth',
    price:        80_000,
    priceLabel:   '₦80,000',
    billingCycle: 'annual' as const,
    coins:        700,
    rolloverCap:  200,        // Unused coins roll over to next year (max 200)
    validDays:    365,
    canTopUp:     true,
    badge:        '⚡ Best Value',
    monthlyEq:    '₦6,667/mo',
    headline:     'More than tools — a full marketing community fighting for your growth.',
    description:  '700 coins plus the exclusive SME Club, priority support, and every tool we build this year. This is the plan that compounds.',
  },
} as const

export type PlanId = keyof typeof PLANS
export type Plan   = (typeof PLANS)[PlanId]

// ─────────────────────────────────────────────────────────────
// PLAN FEATURES
// Full benefit list for billing page + landing page.
// Copy is deliberately benefit-led, not feature-led.
// ─────────────────────────────────────────────────────────────

export const PLAN_FEATURES: Record<PlanId, {
  tagline:     string          // One-line pitch shown under plan name
  forWho:      string          // "This plan is for..."
  included:    string[]        // Green tick list
  highlighted: string[]        // Bold/gold highlighted features (2–3 max)
  notIncluded: string[]        // Greyed-out "not on this plan"
}> = {

  // ── FREE ───────────────────────────────────────────────────
  free: {
    tagline: 'Zero risk. Zero card. Just results.',
    forWho:  'Anyone who wants to see what AI marketing can do before committing a single naira.',
    highlighted: [
      '70 Cerebre Coins — free, forever',
      'Access 15 essential tools immediately',
      'No credit card ever asked',
    ],
    included: [
      '70 Cerebre Coins (30-day validity)',
      'CaptionCraft AI — write Instagram & Facebook captions',
      'WhatsApp Message Drafter',
      'Product Description Generator',
      'Basic Brand Profile Setup',
      'Content Idea Spark (10 ideas in 10 seconds)',
      'Headline Generator',
      'Call-to-Action Builder',
      'Community support forum',
    ],
    notIncluded: [
      'Trial ends permanently after 30 days',
      'Coins cannot be topped up',
      'No access to the 40-tool library',
      'No SME Club membership',
      'No priority support',
    ],
  },

  // ── STARTER ────────────────────────────────────────────────
  starter: {
    tagline: 'The full system. ₦1,667/month. For an entire year.',
    forWho:  'Business owners who are ready to market consistently and professionally — without paying agency fees.',
    highlighted: [
      '150 coins to use across all 40 tools',
      'One payment covers the full year',
      'Top up any time you need more',
    ],
    included: [
      '150 Cerebre Coins — valid for 365 days',
      'Full access to all 40 marketing tools',
      '90-Day Marketing Strategy Builder',
      '30-Day Content Calendar Generator',
      'WhatsApp Campaign Builder',
      'Nigerian Copywriter AI (captions, ads, emails)',
      'Meta & Google Ads Brief Generator',
      'Competitor Intelligence Module',
      'Budget Allocation Engine',
      'Brand Vault — save your brand profile forever',
      'History & Library — revisit every output you\'ve created',
      'Analytics Dashboard',
      'Top-up eligible — buy more coins any time',
      'Email support (48-hour response)',
    ],
    notIncluded: [
      'SME Club not included',
      'Standard support only (email, 48hr)',
      'Coins do not roll over to the next year',
    ],
  },

  // ── GROWTH ─────────────────────────────────────────────────
  growth: {
    tagline: 'A marketing team, a community, and 700 coins — for ₦80,000/year.',
    forWho:  'Business owners who want the maximum output AND the community and support to make it count.',
    highlighted: [
      '🌟 Exclusive SME Club Membership',
      '🚀 Priority WhatsApp Support (< 4 hours)',
      '700 coins — run something every single week',
    ],
    included: [
      // Coins
      '700 Cerebre Coins — valid for 365 days',
      'Coin rollover — carry up to 200 unused coins into next year',
      '50 bonus coins auto-credited every quarter',
      // Tools
      'Full access to all 40 tools',
      'First access to every new tool before public launch',
      // SME Club — the core differentiator
      '🌟 SME Club — Weekly WhatsApp Marketing Masterclass',
      '🌟 SME Club — Private Nigerian Business Owners Community',
      '🌟 SME Club — Monthly Marketing Insider Newsletter',
      '🌟 SME Club — Member-only templates & swipe files',
      // Support
      '🚀 Priority WhatsApp Support — response in under 4 hours (Mon–Sat)',
      // Reports
      'Weekly Pulse Performance Report',
      'Advanced Analytics + ROI Tracking',
      // Plus everything in Starter
      'Everything included in the Starter plan',
      'Top-up eligible — same bulk rates apply',
    ],
    notIncluded: [],
  },
}

// ─────────────────────────────────────────────────────────────
// SME CLUB DETAIL  (Growth-plan exclusive, used in billing UI)
// ─────────────────────────────────────────────────────────────

export const SME_CLUB = {
  headline:    'The SME Club — Your Weekly Unfair Advantage',
  subheadline: 'Exclusive to Growth Plan members.',
  description: 'When you join Growth, you don\'t just get more coins — you get a community of serious Nigerian business owners and direct access to the Cerebre team every single week.',
  benefits: [
    {
      icon: '📱',
      title: 'Weekly WhatsApp Masterclass',
      desc:  'Every week, one sharp, practical marketing lesson delivered directly to your WhatsApp. Written by practitioners who have generated real revenue for Nigerian brands — not generic AI advice.',
    },
    {
      icon: '👥',
      title: 'Private SME Community',
      desc:  'A private group of Nigerian business owners who share wins, ask for feedback, and hold each other accountable. The kind of community that costs ₦500,000 to join elsewhere.',
    },
    {
      icon: '📰',
      title: 'Monthly Insider Newsletter',
      desc:  'A curated, monthly marketing playbook with Nigerian case studies, campaign breakdowns, and platform-specific strategies your competitors aren\'t reading.',
    },
    {
      icon: '🚀',
      title: 'Priority Support (< 4 Hours)',
      desc:  'A direct line to the Cerebre team. Monday to Saturday, your questions are answered in under 4 hours. Not a ticket queue — a real conversation with people who understand your market.',
    },
  ],
}

// ─────────────────────────────────────────────────────────────
// TOP-UP SYSTEM
// Base rate: ₦500/coin. Min 10 coins = ₦5,000.
// Bulk packs offer progressive discounts.
// Top-up is LOCKED for Free plan users.
// ─────────────────────────────────────────────────────────────

export const COIN_BASE_RATE  = 500   // ₦ per coin for custom amounts
export const COIN_MIN_CUSTOM = 10    // minimum coins for custom top-up

/** Bulk packs — better value than base rate */
export const BULK_PACKS = [
  {
    id:         'bulk_50',
    coins:      50,
    price:      20_000,
    priceLabel: '₦20,000',
    basePrice:  25_000,   // what 50 coins costs at base rate
    saving:     5_000,
    savingPct:  20,
    badge:      null,
    perCoin:    400,
  },
  {
    id:         'bulk_100',
    coins:      100,
    price:      35_000,
    priceLabel: '₦35,000',
    basePrice:  50_000,
    saving:     15_000,
    savingPct:  30,
    badge:      null,
    perCoin:    350,
  },
  {
    id:         'bulk_200',
    coins:      200,
    price:      65_000,
    priceLabel: '₦65,000',
    basePrice:  100_000,
    saving:     35_000,
    savingPct:  35,
    badge:      '🔥 Popular',
    perCoin:    325,
  },
  {
    id:         'bulk_500',
    coins:      500,
    price:      150_000,
    priceLabel: '₦150,000',
    basePrice:  250_000,
    saving:     100_000,
    savingPct:  40,
    badge:      '💎 Best Rate',
    perCoin:    300,
  },
] as const

export type BulkPackId = typeof BULK_PACKS[number]['id']

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export function getPlan(planId: string): Plan {
  return PLANS[planId as PlanId] ?? PLANS.free
}

export function canTopUp(planId: string): boolean {
  return getPlan(planId).canTopUp
}

export function isFreePlan(planId: string): boolean {
  return planId === 'free'
}

/** Returns price and bulk-pack suggestion for a custom coin qty */
export function calcCustomTopUp(coins: number): {
  coins:            number
  price:            number
  priceLabel:       string
  bulkAlternative:  typeof BULK_PACKS[number] | null
} {
  const qty   = Math.max(COIN_MIN_CUSTOM, Math.round(coins))
  const price = qty * COIN_BASE_RATE
  // Find the best bulk pack that covers the same or more coins more cheaply
  const alt   = [...BULK_PACKS]
    .reverse()
    .find(p => p.coins >= qty && p.price < price) ?? null

  return { coins: qty, price, priceLabel: `₦${price.toLocaleString()}`, bulkAlternative: alt }
}

/** true if a free plan's 30-day window has closed */
export function isFreePlanExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

/** Calendar days remaining until expiry (0 if expired) */
export function getDaysRemaining(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000))
}

/** Remaining coins as 0-100 percentage of plan allocation */
export function getCoinRemainingPct(balance: number, planId: string): number {
  const total = getPlan(planId).coins
  return Math.min(100, Math.max(0, Math.round((balance / total) * 100)))
}
