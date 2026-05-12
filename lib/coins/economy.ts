// ═══════════════════════════════════════════════════════════════
// /lib/coins/economy.ts
// Single source of truth for Cerebre Plus coin economy.
// Import this wherever pricing, limits, or plan logic is needed.
// ═══════════════════════════════════════════════════════════════

export const PLANS = {
  free: {
    id:         'free',
    name:       'Free',
    price:      0,
    priceLabel: '₦0',
    coins:      30,
    rollover:   0,
    description: 'Try Cerebre Plus — 2-3 lightweight tools included',
  },
  starter: {
    id:         'starter',
    name:       'Starter',
    price:      18_000,
    priceLabel: '₦18,000',
    coins:      100,
    rollover:   0,
    description: 'For founders getting started with AI marketing',
  },
  growth: {
    id:         'growth',
    name:       'Growth',
    price:      35_000,
    priceLabel: '₦35,000',
    coins:      250,
    rollover:   30,
    description: 'For growing businesses running campaigns every week',
  },
  premium: {
    id:         'premium',
    name:       'Premium',
    price:      75_000,
    priceLabel: '₦75,000',
    coins:      650,
    rollover:   80,
    description: 'For serious marketers running 40 tools regularly',
  },
  enterprise: {
    id:         'enterprise',
    name:       'Enterprise',
    price:      180_000,
    priceLabel: '₦180,000',
    coins:      Infinity,
    rollover:   Infinity,
    description: 'Unlimited access — for teams and agencies',
  },
} as const

export type PlanId = keyof typeof PLANS

// ─────────────────────────────────────────────────────────────
// TOP-UP PACKS
// ─────────────────────────────────────────────────────────────

export const TOPUP_PACKS = [
  { id: 'pack_50',   coins: 50,   price: 500,    priceLabel: '₦500',    perCoin: 10 },
  { id: 'pack_300',  coins: 300,  price: 2_500,  priceLabel: '₦2,500',  perCoin: 8.33 },
  { id: 'pack_800',  coins: 800,  price: 6_000,  priceLabel: '₦6,000',  perCoin: 7.5 },
  { id: 'pack_2000', coins: 2_000, price: 13_000, priceLabel: '₦13,000', perCoin: 6.5 },
] as const

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export function getPlan(planId: string) {
  return PLANS[planId as PlanId] ?? PLANS.free
}

export function getPlanCoins(planId: string): number {
  return getPlan(planId).coins
}

export function isUnlimitedPlan(planId: string): boolean {
  return planId === 'enterprise'
}

export function getRollover(planId: string): number {
  return getPlan(planId).rollover
}

/** Returns 0–100 percentage of coins used this period */
export function getCoinUsagePct(balance: number, planId: string): number {
  const total = getPlanCoins(planId)
  if (total === Infinity || total === 0) return 0
  return Math.min(100, Math.round(((total - balance) / total) * 100))
}

/** Remaining coins as a percentage */
export function getCoinRemainingPct(balance: number, planId: string): number {
  const total = getPlanCoins(planId)
  if (total === Infinity) return 100
  return Math.min(100, Math.max(0, Math.round((balance / total) * 100)))
}

/** Suggest upgrade plan */
export function suggestUpgrade(planId: string): typeof PLANS[PlanId] | null {
  const order: PlanId[] = ['free','starter','growth','premium','enterprise']
  const idx = order.indexOf(planId as PlanId)
  if (idx < 0 || idx >= order.length - 1) return null
  return PLANS[order[idx + 1]]
}
