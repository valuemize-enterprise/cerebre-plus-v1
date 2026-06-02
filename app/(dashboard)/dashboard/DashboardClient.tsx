'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/dashboard/DashboardClient.tsx
// Interactive dashboard with all 8 sections.
// All state-driven logic lives here — server page is pure data.
// ═══════════════════════════════════════════════════════════════

import React, { useCallback } from 'react'
import { useRouter }           from 'next/navigation'
import { motion, } from 'framer-motion'
import {
  Coins, MessageCircle, ChevronRight, Copy, ExternalLink,
  AlertTriangle, Sparkles, Flame,  Circle, Award, Target,
} from 'lucide-react'
// canvas-confetti loaded dynamically on milestone events
// import confetti from 'canvas-confetti'

import { getTool } from '@/lib/tools/registry'
import { useToast } from '@/components/ui/ModalToastSelect'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface DashboardClientProps {
  user:               { id: string; email: string; joinedAt: string }
  profile:            Record<string, any> | null
  subscription:       { planTier: string; renewalDate: string | null; daysToRenewal: number | null; status: string }
  coins:              { balance: number; updatedAt: string | null }
  recentGenerations:  Array<{ id: string; tool_id: string; tool_name: string; output: string; created_at: string; coin_cost: number }>
  notifications:      Array<{ id: string; type: string; payload: any }>
  daysSinceJoin:      number
  isEarlyMember:      boolean
  isFoundingMember:   boolean
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const NAVY  = '#0B1F3A'
const GOLD  = '#E09818'

const PLAN_COIN_LIMITS: Record<string, number> = {
  free:       70,
  starter:    200,
  growth:     600,
  premium:    1500,
  enterprise: Infinity,
}

const PLAN_LABELS: Record<string, string> = {
  free:       'Free',
  starter:    'Starter',
  growth:     'Growth',
  premium:    'Premium',
  enterprise: 'Enterprise',
}

// Nigerian cultural calendar — simplified for dashboard
const NIGERIAN_MOMENTS = [
  { month: 0,  day: 1,  name: 'New Year',        type: 'holiday',  offset: 7  },
  { month: 1,  day: 14, name: "Valentine's Day",  type: 'holiday',  offset: 7  },
  { month: 3,  day: 18, name: 'Easter',           type: 'holiday',  offset: 14 },
  { month: 4,  day: 1,  name: "Workers' Day",     type: 'holiday',  offset: 3  },
  { month: 4,  day: 27, name: "Children's Day",   type: 'holiday',  offset: 7  },
  { month: 9,  day: 1,  name: 'Independence Day', type: 'holiday',  offset: 7  },
  { month: 10, day: 29, name: 'Black Friday',      type: 'commerce', offset: 14 },
  { month: 11, day: 25, name: 'Christmas',         type: 'holiday',  offset: 21 },
]

// Starter tool suggestions for new users
const STARTER_TOOLS = ['copy-brain', 'caption-craft', 'whatsapp-campaign-builder', 'strategy-brain']

// ─────────────────────────────────────────────────────────────
// GREETING (WAT time-aware)
// ─────────────────────────────────────────────────────────────

function getGreeting(name: string): { text: string; emoji: string } {
  const hour = new Date().toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos',
    hour:     'numeric',
    hour12:   false,
  })
  const h = parseInt(hour, 10)
  if (h < 12) return { text: `Good morning, ${name}`,   emoji: '☀️' }
  if (h < 17) return { text: `Good afternoon, ${name}`, emoji: '🌤️' }
  return             { text: `Good evening, ${name}`,   emoji: '🌙' }
}

// ─────────────────────────────────────────────────────────────
// NEXT NIGERIAN MOMENT
// ─────────────────────────────────────────────────────────────

function getNextMoment() {
  const now    = new Date()
  const year   = now.getFullYear()

  for (const m of NIGERIAN_MOMENTS) {
    const date = new Date(year, m.month, m.day)
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff <= m.offset) {
      return { name: m.name, daysAway: diff, type: m.type }
    }
  }

  // Check if salary week
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()
  if (dayOfMonth >= daysInMonth - 6) {
    return { name: 'Salary Week', daysAway: daysInMonth - dayOfMonth, type: 'salary' }
  }

  const nextSalaryIn = daysInMonth - dayOfMonth
  if (nextSalaryIn <= 10) {
    return { name: 'Salary Week', daysAway: nextSalaryIn, type: 'upcoming_salary' }
  }

  return null
}

// ─────────────────────────────────────────────────────────────
// COIN WIDGET
// ─────────────────────────────────────────────────────────────

function CoinWidget({
  balance,
  planTier,
  daysToRenewal,
  onTopUp,
}: {
  balance:       number
  planTier:      string
  daysToRenewal: number | null
  onTopUp:       () => void
}) {
  const limit     = PLAN_COIN_LIMITS[planTier] || 70
  const isUnlimited = planTier === 'enterprise'
  const pct       = isUnlimited ? 100 : Math.min(100, Math.round((balance / limit) * 100))
  const isCritical = !isUnlimited && balance <= 20
  const isLow      = !isUnlimited && balance <= 50 && balance > 20

  const TOP_UP_PACKS = [
    { label: '50 coins', price: '₦500',   coins: 50  },
    { label: '300 coins', price: '₦2,500', coins: 300 },
    { label: '800 coins', price: '₦6,000', coins: 800 },
    { label: '2K coins',  price: '₦13,000', coins: 2000 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-2xl p-5
        ${isCritical
          ? 'border-2 border-red-400/60 bg-red-950/30'
          : isLow
            ? 'border-2 border-amber-400/40 bg-amber-950/20 animate-pulse-slow'
            : 'border border-white/10 bg-white/5'}
      `}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{ background: isCritical ? '#ef4444' : GOLD }}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Coins className={`h-5 w-5 ${isCritical ? 'text-red-400' : 'text-[#E09818]'}`} />
            <span className="text-sm font-medium text-white/60">Cerebre Coins</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-4xl font-black ${isCritical ? 'text-red-300' : 'text-white'}`}>
              {isUnlimited ? '∞' : balance.toLocaleString()}
            </span>
            {!isUnlimited && (
              <span className="text-sm text-white/30">/ {limit.toLocaleString()}</span>
            )}
          </div>
          {daysToRenewal !== null && (
            <p className="mt-1 text-xs text-white/40">
              {daysToRenewal === 0 ? 'Renews today' : `Renews in ${daysToRenewal} day${daysToRenewal === 1 ? '' : 's'}`}
            </p>
          )}
        </div>

        <button
          onClick={onTopUp}
          className="rounded-xl bg-[#E09818]/15 border border-[#E09818]/30 px-3 py-1.5 text-xs font-bold text-[#E09818] hover:bg-[#E09818]/25 transition-colors"
        >
          Top up
        </button>
      </div>

      {/* Progress bar */}
      {!isUnlimited && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isCritical ? 'bg-red-400' : 'bg-[#E09818]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <p className="mt-1 text-xs text-white/30 text-right">{pct}% remaining</p>
        </div>
      )}

      {/* Urgent messages */}
      {isCritical && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span className="text-xs text-red-300">Only {balance} coins left — don't let your marketing stop.</span>
        </div>
      )}
      {isLow && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300">Running low! Top up to keep your marketing going.</span>
        </div>
      )}

      {/* Quick top-up packs — show when low */}
      {(isCritical || isLow) && (
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {TOP_UP_PACKS.map((pack) => (
            <button
              key={pack.coins}
              onClick={onTopUp}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-center hover:border-[#E09818]/40 hover:bg-[#E09818]/10 transition-all"
            >
              <div className="text-xs font-bold text-white">{pack.label}</div>
              <div className="text-[10px] text-white/40">{pack.price}</div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// MARKETING MOMENT BANNER
// ─────────────────────────────────────────────────────────────

function MarketingMomentBanner({
  challenges,
  router,
}: {
  challenges: string[]
  router:     ReturnType<typeof useRouter>
}) {
  const moment = getNextMoment()
  const dayOfMonth = new Date().getDate()
  const isSalaryWeek = dayOfMonth >= 25

  if (isSalaryWeek && (!moment || moment.type === 'upcoming_salary')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3"
      >
        <span className="text-2xl">💰</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-300">Salary week is here</p>
          <p className="text-xs text-amber-300/70">Nigerians have cash and buying intent. Best time to push promotional content.</p>
        </div>
        <button
          onClick={() => router.push('/tools/promo-blast')}
          className="shrink-0 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
        >
          Create blast →
        </button>
      </motion.div>
    )
  }

  if (moment && moment.type !== 'upcoming_salary') {
    const toolMap: Record<string, string> = {
      holiday:  'whatsapp-campaign-builder',
      commerce: 'promo-blast',
      salary:   'promo-blast',
    }
    const tool = toolMap[moment.type] || 'campaign-clock'

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 rounded-xl border border-[#E09818]/30 bg-[#E09818]/10 px-4 py-3"
      >
        <span className="text-2xl">🗓️</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#E09818]">
            {moment.daysAway === 0 ? `${moment.name} is today!` : `${moment.name} in ${moment.daysAway} day${moment.daysAway === 1 ? '' : 's'}`}
          </p>
          <p className="text-xs text-[#E09818]/70">Perfect time for a campaign targeting this moment.</p>
        </div>
        <button
          onClick={() => router.push(`/tools/${tool}`)}
          className="shrink-0 rounded-lg bg-[#E09818]/20 px-3 py-1.5 text-xs font-bold text-[#E09818] hover:bg-[#E09818]/30"
        >
          Create campaign →
        </button>
      </motion.div>
    )
  }

  // Default: show top marketing challenge recommendation
  const challenge = challenges?.[0]
  if (challenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
      >
        <Target className="h-5 w-5 text-[#E09818] shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Your top marketing challenge</p>
          <p className="text-xs text-white/50">{challenge}</p>
        </div>
        <button
          onClick={() => router.push('/tools/strategy-brain')}
          className="shrink-0 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
        >
          Fix it →
        </button>
      </motion.div>
    )
  }

  return null
}

// ─────────────────────────────────────────────────────────────
// QUICK ACTIONS (Mobile FAB / Desktop bar)
// ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: 'caption',   icon: '✍️', label: 'Write a caption',     toolId: 'caption-craft',           color: '#A855F7' },
  { id: 'today',     icon: '📅', label: "Today's content",     toolId: 'campaign-clock',           color: '#3B82F6' },
  { id: 'whatsapp',  icon: '💬', label: 'WhatsApp message',    toolId: 'whatsapp-campaign-builder', color: '#25D366' },
  { id: 'repurpose', icon: '♻️', label: 'Repurpose last',      toolId: 'content-calendar',         color: '#F59E0B' },
]

function QuickActions({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-white/50 uppercase tracking-wider">Quick actions</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(`/tools/${action.toolId}`)}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center transition-all hover:border-white/20 hover:bg-white/8 active:scale-[0.97]"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-xs font-medium text-white/70">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TOOL RECOMMENDATION CARDS
// ─────────────────────────────────────────────────────────────

function ToolRecommendations({
  profile,
  recentGenerations,
  coinBalance,
  router,
}: {
  profile:            Record<string, any> | null
  recentGenerations:  DashboardClientProps['recentGenerations']
  coinBalance:        number
  router:             ReturnType<typeof useRouter>
}) {
  // Determine recommended tools based on: unused tools + challenges
  const usedToolIds = new Set(recentGenerations.map((g) => g.tool_id))
  const challenges  = profile?.marketing_challenges as string[] || []

  const challengeToolMap: Record<string, string[]> = {
    'not enough leads':           ['lead-magnet-forge', 'funnel-builder', 'whatsapp-campaign-builder'],
    'social media':               ['caption-craft', 'content-calendar', 'carousel-script-builder'],
    'sales conversion':           ['sales-script-writer', 'follow-up-sequencer', 'pricing-narrator'],
    'brand awareness':            ['brand-positioner', 'bio-builder', 'copy-brain'],
    'google visibility':          ['local-seo-kit', 'keyword-hunter', 'website-copy-audit'],
    'customer retention':         ['win-back-campaign', 'newsletter-ai', 'referral-program-builder'],
    'advertising roi':            ['ad-pilot', 'budget-optimizer', 'retarget-engine'],
    'content creation':           ['copy-brain', 'video-script-forge', 'blog-brain'],
  }

  // Build recommendation list
  let recommended: string[] = []
  for (const challenge of challenges) {
    const lower = challenge.toLowerCase()
    for (const [key, tools] of Object.entries(challengeToolMap)) {
      if (lower.includes(key) || key.includes(lower)) {
        recommended.push(...tools)
      }
    }
  }

  // Dedupe + filter already used + take 3
  const seen = new Set<string>()
  recommended = recommended
    .filter((id) => !usedToolIds.has(id) && !seen.has(id) && seen.add(id) !== undefined)
    .slice(0, 3)

  // Fallback: show popular tools the user hasn't used
  if (recommended.length < 3) {
    const fallbacks = ['strategy-brain', 'copy-brain', 'whatsapp-campaign-builder', 'caption-craft', 'ad-pilot']
    for (const id of fallbacks) {
      if (!usedToolIds.has(id) && !seen.has(id)) {
        recommended.push(id)
        seen.add(id)
        if (recommended.length >= 3) break
      }
    }
  }

  const tools = recommended.map((id) => getTool(id)).filter(Boolean) as NonNullable<ReturnType<typeof getTool>>[]
  const challengeLabel = challenges[0] || 'growing your business'

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recommended for you</h2>
        <button
          onClick={() => router.push('/tools')}
          className="text-xs text-[#E09818] hover:opacity-80"
        >
          View all 40 →
        </button>
      </div>
      <p className="mb-3 text-xs text-white/30">
        Based on your challenge: <span className="text-white/50">{challengeLabel}</span>
      </p>
      <div className="space-y-2">
        {tools.map((tool, i) => {
          const canAfford = coinBalance >= tool.coinCost
          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => router.push(`/tools/${tool.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/8 active:scale-[0.98]"
            >
              <span className="text-2xl shrink-0">{tool.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{tool.name}</p>
                <p className="text-xs text-white/40 truncate">{tool.tagline}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className={`flex items-center gap-1 text-xs font-bold ${canAfford ? 'text-[#E09818]' : 'text-red-400'}`}>
                  <Coins className="h-3 w-3" />{tool.coinCost}
                </div>
                <span className="text-[10px] font-semibold text-[#E09818]/80">Run now →</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// RECENT GENERATIONS
// ─────────────────────────────────────────────────────────────

function RecentGenerations({
  generations,
  router,
}: {
  generations: DashboardClientProps['recentGenerations']
  router:      ReturnType<typeof useRouter>
}) {
  const { toast } = useToast()

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({ id: 'text', type: 'success', title: 'Copied!', description: 'Output copied to clipboard.' })
  }, [toast])

  const shareWhatsApp = useCallback((text: string) => {
    const encoded = encodeURIComponent(text.slice(0, 2000))
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }, [])

  if (generations.length === 0) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/50 uppercase tracking-wider">Recent generations</h2>
        <div className="rounded-xl border border-dashed border-white/10 px-6 py-8 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm font-medium text-white/40">No generations yet</p>
          <p className="mt-1 text-xs text-white/25">Run any tool to see your outputs here</p>
          <button
            onClick={() => router.push('/tools')}
            className="mt-4 rounded-lg bg-[#E09818]/15 border border-[#E09818]/30 px-4 py-2 text-xs font-bold text-[#E09818] hover:bg-[#E09818]/25"
          >
            Browse tools →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recent outputs</h2>
        <button
          onClick={() => router.push('/history')}
          className="text-xs text-[#E09818] hover:opacity-80"
        >
          View all →
        </button>
      </div>
      <div className="space-y-2">
        {generations.map((gen, i) => {
          const tool = getTool(gen.tool_id)
          const preview = gen.output.replace(/#{1,6}\s/g, '').replace(/\*+/g, '').slice(0, 80)
          const date = new Date(gen.created_at).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short',
          })

          return (
            <motion.div
              key={gen.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{tool?.icon || '✨'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/60">{gen.tool_name}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/30">{date}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/70 leading-relaxed line-clamp-2">
                    {preview}…
                  </p>
                </div>
              </div>

              {/* Action buttons (visible on hover/tap) */}
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyToClipboard(gen.output)}
                  className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
                <button
                  onClick={() => router.push(`/history?id=${gen.id}`)}
                  className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10"
                >
                  <ExternalLink className="h-3 w-3" /> View full
                </button>
                <button
                  onClick={() => shareWhatsApp(gen.output)}
                  className="flex items-center gap-1 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 px-2.5 py-1 text-xs text-[#25D366] hover:bg-[#25D366]/20"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DAILY INSIGHTS
// ─────────────────────────────────────────────────────────────

const INSIGHT_BANK = [
  {
    icon: '📱',
    title: 'WhatsApp Status is underused by Nigerian businesses',
    body: 'Fewer than 8% of Nigerian SMEs post to WhatsApp Status daily. Businesses that post 3x/day see 4x more direct enquiries than those who only use Stories.',
    toolId: 'story-planner',
    toolName: 'StoryPlanner',
  },
  {
    icon: '⏰',
    title: 'The salary week window most businesses miss',
    body: 'Nigerian buyers have 3x higher purchase intent on the 26th–31st of every month. Most businesses run their promotions at the start of the month — the worst time.',
    toolId: 'campaign-clock',
    toolName: 'CampaignClock',
  },
  {
    icon: '💡',
    title: 'Why "Contact us" CTAs fail in Nigeria',
    body: 'Nigerian buyers want a direct WhatsApp number — not a form, not an email, not a website. Businesses that put their WhatsApp number directly in captions convert 4x more enquiries.',
    toolId: 'copy-brain',
    toolName: 'CopyBrain AI',
  },
  {
    icon: '🌟',
    title: 'The review trust threshold for Nigerian buyers',
    body: 'Nigerian consumers trust businesses with 20+ reviews significantly more than those with fewer — regardless of rating. Getting to 25 Google reviews is a conversion tipping point.',
    toolId: 'review-requestor',
    toolName: 'ReviewRequestor',
  },
  {
    icon: '📊',
    title: 'FOBE: why Nigerian buyers ghost',
    body: '"Fear Of Being Cheated" is the silent conversion killer. 67% of Nigerian buyers who don\'t purchase cite trust as the reason — not price. A single specific trust signal (exact client count, city, year) can double conversion.',
    toolId: 'testimonial-collector',
    toolName: 'TestimonialCollector',
  },
  {
    icon: '🔄',
    title: 'Old customers convert 4x better than new leads',
    body: 'Cerebre Plus\'s most underused insight: your inactive customers already trust you. The cost of winning them back is near zero. Yet most Nigerian businesses spend 90% of their marketing budget chasing strangers.',
    toolId: 'win-back-campaign',
    toolName: 'WinBackCampaign',
  },
]

function DailyInsights({ industry, router }: { industry: string; router: ReturnType<typeof useRouter> }) {
  // Pick 3 insights (rotate daily based on date)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const insights  = [0, 1, 2].map((i) => INSIGHT_BANK[(dayOfYear + i) % INSIGHT_BANK.length])

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Today's market insights</h2>
        <button
          onClick={() => router.push('/insights')}
          className="text-xs text-[#E09818] hover:opacity-80"
        >
          See all →
        </button>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-snug">{insight.title}</p>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">{insight.body}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/tools/${insight.toolId}`)}
              className="mt-3 text-xs font-semibold text-[#E09818] hover:opacity-80"
            >
              Apply this with {insight.toolName} →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PROFILE COMPLETENESS
// ─────────────────────────────────────────────────────────────

const PROFILE_FIELDS = [
  { key: 'business_name',   label: 'Business name',    path: '/profile?focus=business_name'   },
  { key: 'industry',        label: 'Industry',          path: '/profile?focus=industry'         },
  { key: 'city',            label: 'City',              path: '/profile?focus=city'             },
  { key: 'description',     label: 'Business description', path: '/profile?focus=description'  },
  { key: 'unique_advantage', label: 'Unique advantage', path: '/profile?focus=unique_advantage' },
  { key: 'target_customer', label: 'Target customer',   path: '/profile?focus=target_customer' },
  { key: 'whatsapp',        label: 'WhatsApp number',   path: '/profile?focus=whatsapp'        },
  { key: 'social_proof',    label: 'Social proof',      path: '/profile?focus=social_proof'    },
  { key: 'brand_voice',     label: 'Brand voice',       path: '/profile?focus=brand_voice'     },
  { key: 'logo_url',        label: 'Logo',              path: '/profile?focus=logo_url'        },
]

function ProfileCompleteness({
  profile,
  router,
}: {
  profile: Record<string, any> | null
  router:  ReturnType<typeof useRouter>
}) {
  const filled  = PROFILE_FIELDS.filter((f) => Boolean(profile?.[f.key]))
  const pct     = Math.round((filled.length / PROFILE_FIELDS.length) * 100)
  const missing = PROFILE_FIELDS.filter((f) => !Boolean(profile?.[f.key])).slice(0, 3)

  if (pct >= 80) return null

  const qualityLabel =
    pct < 40 ? 'basic (fill more fields for much better results)'
    : pct < 60 ? 'decent — but incomplete profile means generic outputs'
    : 'good — completing the remaining fields will noticeably improve results'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/10 bg-white/5 p-5"
    >
      <div className="flex items-center gap-3">
        {/* Ring */}
        <div className="relative h-14 w-14 shrink-0">
          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke={GOLD}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
            {pct}%
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Profile completeness</p>
          <p className="mt-0.5 text-xs text-white/40">
            Tool outputs are {qualityLabel}
          </p>
          <p className="mt-1 text-xs text-[#E09818]/80">
            A complete profile produces 3x better results
          </p>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {missing.map((field) => (
            <button
              key={field.key}
              onClick={() => router.push(field.path)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-left hover:border-[#E09818]/30 hover:bg-[#E09818]/5"
            >
              <Circle className="h-3.5 w-3.5 text-white/20 shrink-0" />
              <span className="text-xs text-white/50">Add {field.label}</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/20" />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push('/profile')}
        className="mt-3 w-full rounded-lg bg-[#E09818]/10 border border-[#E09818]/20 py-2 text-xs font-semibold text-[#E09818] hover:bg-[#E09818]/20"
      >
        Complete your profile →
      </button>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// FOUNDING MEMBER BADGE
// ─────────────────────────────────────────────────────────────

function FoundingMemberBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#E09818]/40 bg-[#E09818]/10 px-3 py-1"
      style={{ boxShadow: `0 0 12px ${GOLD}30` }}
    >
      <Award className="h-3.5 w-3.5 text-[#E09818]" />
      <span className="text-xs font-bold text-[#E09818]">Founding Member</span>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// STREAK INDICATOR
// ─────────────────────────────────────────────────────────────

function JourneyStreak({ daysSinceJoin }: { daysSinceJoin: number }) {
  const day = Math.min(daysSinceJoin + 1, 7)
  return (
    <div className="flex items-center gap-2">
      <Flame className="h-4 w-4 text-[#E09818]" />
      <span className="text-xs text-white/60">
        Day {day} of your Cerebre Plus journey
      </span>
      <div className="flex gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-4 rounded-full ${i < day ? 'bg-[#E09818]' : 'bg-white/10'}`}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD CLIENT
// ─────────────────────────────────────────────────────────────

export function DashboardClient({
  user,
  profile,
  subscription,
  coins,
  recentGenerations,
  notifications,
  daysSinceJoin,
  isEarlyMember,
  isFoundingMember,
}: DashboardClientProps) {
  const router  = useRouter()
  const { toast } = useToast()

  const firstName = profile?.business_name?.split(' ')[0] || user.email.split('@')[0]
  const greeting  = getGreeting(firstName)
  const challenges = profile?.marketing_challenges as string[] || []

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #071528 100%)` }}
    >
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6 pb-28 md:pb-8">

        {/* ── SECTION 1: Welcome header ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-white">
              {greeting.text} {greeting.emoji}
            </h1>
            {isFoundingMember && <FoundingMemberBadge />}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
            <span>{profile?.business_name || 'Your Business'}</span>
            <span className="text-white/20">·</span>
            <span className="capitalize">{PLAN_LABELS[subscription.planTier] || 'Free'} Member</span>
            {subscription.daysToRenewal !== null && (
              <>
                <span className="text-white/20">·</span>
                <span>{subscription.daysToRenewal} days to renewal</span>
              </>
            )}
          </div>

          {isEarlyMember && (
            <JourneyStreak daysSinceJoin={daysSinceJoin} />
          )}
        </motion.div>

        {/* ── SECTION 2: Coin widget ────────────────────────── */}
        <CoinWidget
          balance={coins.balance}
          planTier={subscription.planTier}
          daysToRenewal={subscription.daysToRenewal}
          onTopUp={() => router.push('/billing')}
        />

        {/* ── SECTION 3: Today's marketing moment ───────────── */}
        <MarketingMomentBanner challenges={challenges} router={router} />

        {/* ── SECTION 4: Tool recommendations ──────────────── */}
        <ToolRecommendations
          profile={profile}
          recentGenerations={recentGenerations}
          coinBalance={coins.balance}
          router={router}
        />

        {/* ── SECTION 5: Quick actions ──────────────────────── */}
        <QuickActions router={router} />

        {/* ── SECTION 6: Recent generations ────────────────── */}
        <RecentGenerations generations={recentGenerations} router={router} />

        {/* ── SECTION 7: Daily insights ─────────────────────── */}
        <DailyInsights industry={profile?.industry || ''} router={router} />

        {/* ── SECTION 8: Profile completeness ──────────────── */}
        <ProfileCompleteness profile={profile} router={router} />

      </div>
    </div>
  )
}
