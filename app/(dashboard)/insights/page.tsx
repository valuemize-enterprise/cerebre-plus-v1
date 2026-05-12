'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/insights/page.tsx
// Personalised marketing insights for Nigerian business owners.
// Tabs: Today · This Week · Cerebre Laws · Benchmarks
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react'
import { useRouter }  from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb, BookOpen, TrendingUp, BarChart2,
  Bookmark, ArrowRight, Star, Zap, RefreshCw,
  ChevronRight, Clock, Users, Target, MessageCircle,
} from 'lucide-react'
import { useUser }  from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

type Tab = 'today' | 'week' | 'laws' | 'benchmarks'

// ─────────────────────────────────────────────────────────────
// INSIGHT DATA
// ─────────────────────────────────────────────────────────────

const AKIN_LAWS = [
  {
    number: 1, name: 'The Awoof Law', emoji: '💰',
    principle: 'Nigerian customers will pay MORE when they feel they\'re getting an outrageously good deal. The comparison IS the sale.',
    application: 'Never show your price without showing what it would cost elsewhere. "A Lagos agency charges ₦350,000 for this. You just built it in 60 seconds with Cerebre Plus."',
    example: '"Our 90-day marketing strategy: What an agency charges ₦800,000 for. What Cerebre Plus builds in 60 seconds."',
    toolId: 'copy-brain',
    toolName: 'CopyBrain AI',
    colour: '#E09818',
  },
  {
    number: 2, name: 'The List Law', emoji: '📋',
    principle: 'Nigerians don\'t buy from strangers. Build the relationship first. Collect the WhatsApp number before you try to sell anything.',
    application: 'Every piece of content should end with a low-commitment action: "Send me your WhatsApp number and I\'ll send you this free guide." The list is the business.',
    example: '"Reply with your WhatsApp number and I\'ll send you [free resource] right now."',
    toolId: 'lead-magnet-forge',
    toolName: 'LeadMagnetForge',
    colour: '#10B881',
  },
  {
    number: 3, name: 'The Trust Law', emoji: '🛡️',
    principle: 'FOBE — Fear Of Being Cheated — is real in Nigeria. Generic claims kill conversions. Specific facts build trust instantly.',
    application: 'Replace "many clients" with "2,400 clients". Replace "years of experience" with "since 2018 — 7 years". Every claim needs a number, a city, or a verifiable detail.',
    example: '"Over 2,400 businesses in Lagos, Abuja, and Port Harcourt trust us" vs "thousands of businesses trust us"',
    toolId: 'testimonial-collector',
    toolName: 'TestimonialCollector',
    colour: '#3B82F6',
  },
  {
    number: 4, name: 'The Fear Law', emoji: '⚠️',
    principle: 'Fear of loss outperforms promise of gain by 3-to-1 in the Nigerian market. Show what happens if they DON\'T act.',
    application: 'Every promotional message needs a fear angle: "While you\'re figuring this out, your competitor is running ads and getting your customers. Every week without a system is money going to someone else."',
    example: '"Your competitors in Lagos are already running campaigns like this. How long can you watch them take your customers?"',
    toolId: 'ad-scribe',
    toolName: 'AdScribe',
    colour: '#EF4444',
  },
  {
    number: 5, name: 'The Giant Promise Law', emoji: '🚀',
    principle: 'Nigerians prefer someone who promises 100 and delivers 80 over someone who promises 80 and delivers 80. Be bold. Be specific.',
    application: 'Make the biggest honest promise you can back up. "Get 14 WhatsApp enquiries from one broadcast." "Your 90-day strategy in 60 seconds." Specific numbers convert. Vague promises don\'t.',
    example: '"Stop spending ₦500,000/month on an agency that delivers ₦35,000 worth of results."',
    toolId: 'promo-blast',
    toolName: 'PromoBlast',
    colour: '#8B5CF6',
  },
  {
    number: 6, name: 'The Story Law', emoji: '📖',
    principle: 'Nigerian buyers are moved by stories before they\'re moved by features. Lead with a relatable story, close with the offer.',
    application: 'Every long-form output must begin with a story: a Nigerian business owner, their specific problem, the turning point, the result. The story creates emotional investment before the product is mentioned.',
    example: '"Adaeze runs a catering business in Port Harcourt. She spent ₦120,000 on a social media manager who ghosted her after 3 weeks…"',
    toolId: 'email-scribe',
    toolName: 'EmailScribe',
    colour: '#F59E0B',
  },
  {
    number: 7, name: 'The Sales Letter Formula', emoji: '📝',
    principle: 'Hook → Story/Fear → Credibility → Solution → Benefits → Bonus → Guarantee → Urgency → Price → CTA → Close → P.S.',
    application: 'This structure works for every Nigerian promotional message — WhatsApp broadcasts, email campaigns, landing pages, sales scripts. Apply it in adapted form to any sales communication.',
    example: 'Hook → "While you\'re reading this, your competitor is running ads." → Story → Trust → Benefits → Offer → "This closes Friday midnight."',
    toolId: 'funnel-builder',
    toolName: 'FunnelBuilder',
    colour: '#EC4899',
  },
  {
    number: 8, name: 'The Customer Behaviour Law', emoji: '⚡',
    principle: 'Nigerian buyers are impatient, want things delivered to them, want to deal with a person not a company. Give them exactly that.',
    application: 'Use "I" not "we". Include the WhatsApp number directly in the message — never "contact us via our website". Make the CTA require zero thinking. One tap, one action.',
    example: '"Send me a WhatsApp message right now: 08012345678" not "contact our team for more information"',
    toolId: 'whatsapp-campaign-builder',
    toolName: 'WhatsApp Campaign Builder',
    colour: '#25D366',
  },
  {
    number: 9, name: 'The Community Validation Law', emoji: '👥',
    principle: 'Nigerians buy what their community buys. Community proof from their specific city converts far better than generic social proof.',
    application: 'Use specific city names + specific numbers: "Over 2,400 Lagos businesses" not "thousands of businesses". "Used by companies in Lekki, Maitama, and Port Harcourt" makes the proof real and local.',
    example: '"Join 2,400+ Lagos business owners who already use this" vs "join thousands of businesses"',
    toolId: 'audience-profiler',
    toolName: 'AudienceProfiler',
    colour: '#06B6D4',
  },
  {
    number: 10, name: 'The Urgency/Scarcity Law', emoji: '⏰',
    principle: 'Without a real deadline, even the best Nigerian sales copy gets deferred. Create genuine urgency or they\'ll procrastinate forever.',
    application: 'Every promotional output needs a real urgency mechanism: a specific date, a quantity limit, or a price increase warning. "This offer closes this Friday at midnight" — specific. Real. Honest.',
    example: '"This offer closes Friday 28 June at midnight. After that, the price goes back to ₦75,000."',
    toolId: 'campaign-clock',
    toolName: 'CampaignClock',
    colour: '#F97316',
  },
]

const TODAY_INSIGHTS = [
  {
    icon: '📱', title: 'WhatsApp Status is your most underused channel',
    body: 'Fewer than 8% of Nigerian SMEs post to WhatsApp Status daily — yet businesses that post 3x/day see 4x more direct enquiries than those who only use feed posts. It\'s free, personal, and your warmest contacts see it first.',
    toolId: 'story-planner', toolName: 'StoryPlanner', category: 'WhatsApp',
  },
  {
    icon: '⏰', title: 'The salary week window most businesses miss',
    body: 'Nigerian buyers have 3x higher purchase intent on the 26th–31st of every month. Most businesses run their promotions at the start of the month — the worst time. Shift 60% of your promo budget to salary week.',
    toolId: 'campaign-clock', toolName: 'CampaignClock', category: 'Strategy',
  },
  {
    icon: '💡', title: 'Why "Contact us" CTAs fail in Nigeria',
    body: 'Nigerian buyers want a direct WhatsApp number — not a form, not a website link. Businesses that put their WhatsApp number directly in captions convert 4x more enquiries. Make it one tap, not three clicks.',
    toolId: 'copy-brain', toolName: 'CopyBrain AI', category: 'Copywriting',
  },
  {
    icon: '🔍', title: 'Nigerians search differently from Western markets',
    body: 'Nigerians type "[service] in Lagos" not "[service] near me". They include the city explicitly. "Best event planner Lagos Island" outranks "event planner near me" for Nigerian search intent. Update your Google listing accordingly.',
    toolId: 'local-seo-kit', toolName: 'LocalSEOKit', category: 'SEO',
  },
  {
    icon: '🔄', title: 'Win-back campaigns cost ₦0 per converted customer',
    body: 'Cerebre Plus\'s most underused insight: your inactive customers already trust you. The cost of winning them back is near zero vs. ₦[X] cost-per-lead from advertising. Yet 90% of Nigerian businesses spend 90% of their budget chasing strangers.',
    toolId: 'win-back-campaign', toolName: 'WinBackCampaign', category: 'Growth',
  },
  {
    icon: '📊', title: 'FOBE is costing you more than any other factor',
    body: '"Fear Of Being Cheated" is the silent conversion killer. 67% of Nigerian buyers who don\'t purchase cite trust as the reason — not price. A single specific trust signal (exact client count + city + year) can double your conversion rate.',
    toolId: 'testimonial-collector', toolName: 'TestimonialCollector', category: 'Trust',
  },
]

const BENCHMARKS = [
  { metric: 'WhatsApp broadcast reply rate', industry: '12-18%', topPerformers: '35-45%', tip: 'Top performers use the Awoof Stack + personal opener' },
  { metric: 'Instagram caption engagement',  industry: '2-4%',   topPerformers: '8-12%',  tip: 'First line passes the Lagos Bus Test' },
  { metric: 'Lead-to-sale conversion rate',  industry: '15-25%', topPerformers: '40-55%', tip: 'Top performers follow up 5+ times with new value each time' },
  { metric: 'Google Maps reviews (avg)',      industry: '8 reviews', topPerformers: '50+ reviews', tip: 'Review request sent within 24hrs of service delivery' },
  { metric: 'Email open rate (Nigerian)',     industry: '18-25%', topPerformers: '38-48%', tip: 'City + number in subject line. "7 Lagos businesses that…"' },
  { metric: 'Referral rate (from customers)', industry: '8-12%',  topPerformers: '25-35%', tip: 'WhatsApp share message makes referral frictionless' },
]

// ─────────────────────────────────────────────────────────────
// INSIGHT CARD
// ─────────────────────────────────────────────────────────────

function InsightCard({ insight, router }: {
  insight: typeof TODAY_INSIGHTS[0]
  router:  ReturnType<typeof useRouter>
}) {
  const [saved, setSaved] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/5 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{insight.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white leading-snug">{insight.title}</p>
            <button
              onClick={() => setSaved(!saved)}
              className={`shrink-0 transition-colors ${saved ? 'text-[#E09818]' : 'text-white/20 hover:text-white/40'}`}
            >
              <Bookmark className="h-4 w-4" fill={saved ? GOLD : 'none'} />
            </button>
          </div>
          <span className="mt-0.5 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30 uppercase tracking-wider">
            {insight.category}
          </span>
          <p className="mt-2 text-xs text-white/50 leading-relaxed">{insight.body}</p>
        </div>
      </div>
      <button
        onClick={() => router.push(`/tools/${insight.toolId}`)}
        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#E09818] hover:opacity-80"
      >
        Apply this with {insight.toolName} <ArrowRight className="h-3 w-3" />
      </button>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// AKIN'S LAW CARD
// ─────────────────────────────────────────────────────────────

function LawCard({ law, router }: {
  law:    typeof AKIN_LAWS[0]
  router: ReturnType<typeof useRouter>
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      layout
      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: `${law.colour}20`, border: `1px solid ${law.colour}40` }}
        >
          {law.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/30">LAW {law.number}</span>
          </div>
          <p className="text-sm font-bold text-white">{law.name}</p>
        </div>
        <ChevronRight className={`h-4 w-4 text-white/30 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">The Principle</p>
                <p className="text-sm text-white/80">{law.principle}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">How to Apply It</p>
                <p className="text-sm text-white/70">{law.application}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Example</p>
                <p className="text-xs text-white/60 italic">"{law.example}"</p>
              </div>
              <button
                onClick={() => router.push(`/tools/${law.toolId}`)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all hover:opacity-80"
                style={{ background: `${law.colour}15`, color: law.colour, border: `1px solid ${law.colour}30` }}
              >
                Apply Law {law.number} with {law.toolName} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const router      = useRouter()
  const { profile } = useUser()
  const { toast }   = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('today')

  // Weekly law: rotates each week
  const weekOfYear = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const weeklyLaw  = AKIN_LAWS[weekOfYear % AKIN_LAWS.length]

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'today',      label: 'Today',        icon: <Lightbulb className="h-3.5 w-3.5" /> },
    { id: 'week',       label: 'This Week',    icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: 'laws',       label: "Cerebre Laws",  icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'benchmarks', label: 'Benchmarks',   icon: <BarChart2 className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: NAVY }}>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">

        {/* ── Header ─────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-black text-white">Marketing Insights</h1>
          <p className="mt-1 text-sm text-white/40">
            Nigerian market intelligence — personalised for{' '}
            {profile?.industry ? `${profile.industry} businesses` : 'your business'} in{' '}
            {profile?.city || 'Nigeria'}
          </p>
        </div>

        {/* ── Tabs ────────────────────────────────── */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#E09818] text-[#0B1F3A]'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: Today ──────────────────────────── */}
        {activeTab === 'today' && (
          <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/40">6 insights for today</p>
              <button
                onClick={() => toast({ type: 'info', title: 'Refreshing insights', description: 'Costs 5 coins — coming soon' })}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/40 hover:text-white/60"
              >
                <RefreshCw className="h-3 w-3" /> Refresh (5 🪙)
              </button>
            </div>
            {TODAY_INSIGHTS.map((insight) => (
              <InsightCard key={insight.title} insight={insight} router={router} />
            ))}
          </motion.div>
        )}

        {/* ── TAB: This Week ──────────────────────── */}
        {activeTab === 'week' && (
          <motion.div key="week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Law of the week */}
            <div className="rounded-2xl border border-[#E09818]/30 bg-[#E09818]/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-[#E09818]" />
                <span className="text-xs font-bold text-[#E09818] uppercase tracking-wider">Law of the Week</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{weeklyLaw.emoji}</span>
                <div>
                  <p className="text-xs text-white/40">Law {weeklyLaw.number}</p>
                  <p className="text-base font-bold text-white">{weeklyLaw.name}</p>
                </div>
              </div>
              <p className="text-sm text-white/70">{weeklyLaw.principle}</p>
              <button
                onClick={() => setActiveTab('laws')}
                className="mt-3 text-xs font-semibold text-[#E09818] hover:opacity-80"
              >
                See all 10 laws →
              </button>
            </div>

            {/* Weekly insights (subset) */}
            {TODAY_INSIGHTS.slice(0, 4).map((insight) => (
              <InsightCard key={insight.title} insight={insight} router={router} />
            ))}
          </motion.div>
        )}

        {/* ── TAB: Cerebre Laws ────────────────────── */}
        {activeTab === 'laws' && (
          <motion.div key="laws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="rounded-xl border border-white/5 bg-white/3 p-4">
              <p className="text-sm text-white/60 leading-relaxed">
                The 10 laws from <em className="text-white/80">"How to Sell to Nigerians"</em> by Cerebre Plus —
                hardcoded into every Cerebre Plus tool output. Click any law to see how to apply it today.
              </p>
            </div>
            {AKIN_LAWS.map((law) => (
              <LawCard key={law.number} law={law} router={router} />
            ))}
          </motion.div>
        )}

        {/* ── TAB: Benchmarks ─────────────────────── */}
        {activeTab === 'benchmarks' && (
          <motion.div key="benchmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/3 p-4">
              <p className="text-sm text-white/60">
                How top-performing Nigerian businesses on Cerebre Plus compare to industry averages.
                {profile?.industry ? ` Based on ${profile.industry} industry data.` : ''}
              </p>
            </div>

            <div className="space-y-3">
              {BENCHMARKS.map((bm, i) => (
                <motion.div
                  key={bm.metric}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm font-semibold text-white mb-2">{bm.metric}</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-lg bg-white/5 p-2.5 text-center">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Industry avg</p>
                      <p className="text-base font-bold text-white/70">{bm.industry}</p>
                    </div>
                    <div className="rounded-lg bg-[#E09818]/10 border border-[#E09818]/20 p-2.5 text-center">
                      <p className="text-[10px] text-[#E09818]/60 uppercase tracking-wider mb-0.5">Top performers</p>
                      <p className="text-base font-bold text-[#E09818]">{bm.topPerformers}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Zap className="h-3 w-3 text-[#E09818] shrink-0 mt-0.5" />
                    <p className="text-xs text-white/40">{bm.tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-xl border border-[#E09818]/20 bg-[#E09818]/5 p-4 text-center">
              <p className="text-sm font-semibold text-white mb-1">Want a strategy to hit the top performer benchmarks?</p>
              <p className="text-xs text-white/50 mb-3">StrategyBrain builds your complete 90-day plan in 60 seconds</p>
              <button
                onClick={() => router.push('/tools/strategy-brain')}
                className="rounded-xl bg-[#E09818] px-5 py-2.5 text-sm font-bold text-[#0B1F3A] hover:opacity-90"
              >
                Run StrategyBrain — 100 coins
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
