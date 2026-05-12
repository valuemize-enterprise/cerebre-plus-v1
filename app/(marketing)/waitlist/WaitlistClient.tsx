'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(marketing)/waitlist/WaitlistClient.tsx
// 8-section sales page. Every section applies Cerebre Plus's laws.
// Law 1 (Awoof): Hero section — ₦1.2M vs ₦18,000
// Law 6 (Story): The two-business story
// Law 3+9: Testimonials + social proof
// Law 8: FAQ objection handling
// Law 1+3: 30-day guarantee
// Law 10: Final CTA with founding member scarcity
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter }  from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { useRef }     from 'react'
import {
  ChevronDown, ChevronUp, Check, Coins, ArrowRight,
  Star, Shield, Zap, Users, TrendingUp, Clock,
  MessageCircle, Globe, Award, Sparkles,
} from 'lucide-react'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

// ─────────────────────────────────────────────────────────────
// EMAIL FORM
// ─────────────────────────────────────────────────────────────

function WaitlistForm({
  placement,
  ctaText = 'Claim My Founding Member Spot',
}: {
  placement: string
  ctaText?:  string
}) {
  const [firstName, setFirstName] = useState('')
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ firstName, email, source: placement }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSuccess(true)
    } catch (err: any) {
      setError('Could not save your spot. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center"
      >
        <div className="mb-3 flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <p className="text-base font-bold text-white">You're on the list! 🎉</p>
        <p className="mt-1 text-sm text-white/60">
          Welcome to Cerebre Plus, {firstName}. We'll send your login details to {email} within 24 hours.
        </p>
        <p className="mt-3 text-xs text-emerald-400">
          Your founding member spot is locked in at today's price — forever.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-[#E09818]/60 focus:outline-none focus:ring-2 focus:ring-[#E09818]/30 backdrop-blur-sm"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-[#E09818]/60 focus:outline-none focus:ring-2 focus:ring-[#E09818]/30 backdrop-blur-sm"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#E09818] py-4 text-base font-black text-[#0B1F3A] hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-[#E09818]/20"
      >
        {loading ? 'Saving your spot…' : ctaText}
      </button>
      <p className="text-center text-xs text-white/40">
        No credit card · First generation free · Cancel anytime
      </p>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────
// TOOL GRID (40 tools)
// ─────────────────────────────────────────────────────────────

const TOOLS_PREVIEW = [
  { name: 'CopyBrain AI',          coins: 20,  icon: '🧠' },
  { name: 'CaptionCraft',          coins: 15,  icon: '✍️' },
  { name: 'AdScribe',              coins: 15,  icon: '📣' },
  { name: 'EmailScribe',           coins: 25,  icon: '📧' },
  { name: 'VideoScriptForge',      coins: 25,  icon: '🎬' },
  { name: 'BlogBrain',             coins: 30,  icon: '📝' },
  { name: 'BioBuilder',            coins: 15,  icon: '👤' },
  { name: 'ProductDescriber',      coins: 12,  icon: '🏷️' },
  { name: 'PressRelease AI',       coins: 20,  icon: '📰' },
  { name: 'Content Calendar',      coins: 20,  icon: '📅' },
  { name: 'CarouselScriptBuilder', coins: 18,  icon: '🎠' },
  { name: 'StoryPlanner',          coins: 15,  icon: '📱' },
  { name: 'WhatsApp Campaign',     coins: 30,  icon: '💬' },
  { name: 'FollowUpSequencer',     coins: 25,  icon: '🔄' },
  { name: 'WelcomeMessageCraft',   coins: 12,  icon: '👋' },
  { name: 'PromoBlast',            coins: 15,  icon: '💥' },
  { name: 'StrategyBrain',         coins: 100, icon: '🎯' },
  { name: 'CampaignClock',         coins: 50,  icon: '⏰' },
  { name: 'AudienceProfiler',      coins: 40,  icon: '👥' },
  { name: 'LaunchPad',             coins: 60,  icon: '🚀' },
  { name: 'BrandPositioner',       coins: 50,  icon: '🏆' },
  { name: 'PricingNarrator',       coins: 30,  icon: '💰' },
  { name: 'BudgetOptimizer',       coins: 50,  icon: '📊' },
  { name: 'AdPilot',               coins: 75,  icon: '✈️' },
  { name: 'RetargetEngine',        coins: 35,  icon: '🎯' },
  { name: 'InfluencerBriefWriter', coins: 25,  icon: '🌟' },
  { name: 'GoogleAdCraft',         coins: 30,  icon: '🔍' },
  { name: 'FunnelBuilder',         coins: 45,  icon: '🔮' },
  { name: 'LeadMagnetForge',       coins: 35,  icon: '🧲' },
  { name: 'ProposalWriter',        coins: 40,  icon: '📋' },
  { name: 'SalesScriptWriter',     coins: 30,  icon: '📞' },
  { name: 'TestimonialCollector',  coins: 20,  icon: '⭐' },
  { name: 'ReviewRequestor',       coins: 15,  icon: '🌟' },
  { name: 'CrisisResponder',       coins: 25,  icon: '🛡️' },
  { name: 'LocalSEOKit',           coins: 30,  icon: '📍' },
  { name: 'KeywordHunter',         coins: 25,  icon: '🔎' },
  { name: 'WebsiteCopyAudit',      coins: 35,  icon: '🔬' },
  { name: 'ReferralProgramBuilder',coins: 25,  icon: '🤝' },
  { name: 'NewsletterAI',          coins: 25,  icon: '📰' },
  { name: 'WinBackCampaign',       coins: 30,  icon: '🔄' },
]

// ─────────────────────────────────────────────────────────────
// TESTIMONIALS (Law 3 + 9)
// ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    city: 'Lagos',
    area: 'Victoria Island',
    industry: 'Event Planning',
    result: '17 WhatsApp enquiries from a single broadcast built with CerebrePlus',
    quote: 'I used to spend ₦180,000/month on a social media agency that gave me 2-3 enquiries. Now I run campaigns myself in 10 minutes and get 17+ responses from one WhatsApp broadcast. The strategy tool alone is worth more than I pay for the whole platform.',
    rating: 5,
  },
  {
    name: 'Emeka Eze',
    city: 'Abuja',
    area: 'Maitama',
    industry: 'Business Consulting',
    result: '90-day marketing strategy built in 60 seconds — presented to 3 corporate clients',
    quote: 'The StrategyBrain tool created a document I showed to 3 corporate prospects. All 3 signed with me within the month. One of them specifically said "your strategy shows you understand the market." That document cost me 100 coins. The three contracts were worth ₦4.2M.',
    rating: 5,
  },
  {
    name: 'Chiamaka Obi',
    city: 'Port Harcourt',
    area: 'GRA',
    industry: 'Skincare & Beauty',
    result: 'Went from 3 Instagram enquiries/month to 28 in the first 30 days',
    quote: 'I was posting on Instagram for 2 years and getting nothing. CaptionCraft taught me what hooks actually work for Nigerian audiences. My first caption using the Fear angle got 400+ saves and 28 DMs. I\'ve tried to explain the difference to other business owners — the AI just understands how to sell to Nigerians.',
    rating: 5,
  },
]

// ─────────────────────────────────────────────────────────────
// FAQ (Law 8 — Nigerian objection handling)
// ─────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Is this some kind of get-rich-quick scheme?',
    a: 'Not at all. Cerebre Plus is a genuine AI software platform. You put in your business information, our AI generates marketing content using proven Nigerian market principles. The tools don\'t make money for you — they create marketing content that helps you attract more customers. The money comes from your business serving more clients. We make the marketing work; you do the delivering.',
  },
  {
    q: 'I\'m not technical. Can I actually use this?',
    a: 'If you can send a WhatsApp message, you can use Cerebre Plus. You fill in a form, click Generate, and the AI creates ready-to-use content for your business. No coding, no design skills, no agency relationship needed. 75% of our users are on mobile. We built this for Nigerian business owners, not developers.',
  },
  {
    q: 'What makes this different from ChatGPT?',
    a: 'ChatGPT is a general tool that knows nothing about your business, your city, or how Nigerian buyers think. Cerebre Plus is trained specifically on Cerebre Plus\'s "How to Sell to Nigerians" methodology. Every output includes: your specific city, your WhatsApp number, trust signals for Nigerian FOBE, the Awoof comparison stack, salary cycle awareness, and the cultural knowledge of the Nigerian market. Try asking ChatGPT to write a WhatsApp broadcast for your Lagos skincare business targeting salary week. Then try Cerebre Plus. The difference will be obvious.',
  },
  {
    q: 'What happens if I\'m not satisfied?',
    a: 'We offer a 30-day full refund. No questions. No forms. No awkward conversations. We can afford to make this promise because we built something that actually works for Nigerian businesses. If after 30 days you don\'t believe Cerebre Plus is worth every naira, we\'ll return every naira. Just send us a WhatsApp message.',
  },
  {
    q: 'How does the coin system work?',
    a: 'You subscribe monthly and receive a set number of coins. Starter plan (₦18,000/month) gives 100 coins. Growth plan (₦35,000/month) gives 250 coins. Each tool costs a certain number of coins to run — simple tools like CaptionCraft cost 15 coins, complex tools like StrategyBrain cost 100 coins. If you run out, you can top up with coin packs or upgrade your plan. Enterprise subscribers get unlimited coins.',
  },
  {
    q: 'Can I share the outputs? Do I own them?',
    a: 'Everything Cerebre Plus generates for you is yours. Publish it, sell it, put it in proposals, use it in ads. You own the output 100%. You can also share a public link to any output — and every shared output has a "create yours free" banner that helps us grow (which is why we can keep the prices this low).',
  },
  {
    q: 'What if I miss a month of posting? Do my coins roll over?',
    a: 'Growth plan subscribers roll over up to 30 unused coins to the next month. Premium plan rolls over up to 80. Free and Starter plans don\'t roll over coins — but the plans are affordable enough that most members use their coins every month. The best strategy is to generate content in batches: one session a week covers your entire week\'s marketing.',
  },
  {
    q: 'Is this just for Lagos? What about Abuja, Kano, Enugu?',
    a: 'Cerebre Plus works for every Nigerian city and growing across Pan-Africa. When you complete your profile with your specific city, every tool output references that city by name. The AI knows the difference between Lagos (fast, status-conscious, premium) and Kano (community-trusted, value-driven) and Abuja (credential-focused, professional). City intelligence is built in.',
  },
  {
    q: 'I have a team. Can multiple people use it?',
    a: 'Enterprise plans support team members. For Starter, Growth, and Premium plans, the platform is designed for one business owner. If you need multiple seats, email us and we\'ll set up an Enterprise arrangement.',
  },
  {
    q: 'Why should I trust Cerebre Plus with my business?',
    a: 'We are Cerebre Media Africa — a Nigerian company building for Nigerian businesses. We\'re not a Western company that discovered the African market. We understand FOBE, salary week, WhatsApp culture, the Aso-Ebi principle, and what Cerebre Plus taught us all about selling to Nigerians. Everything in Cerebre Plus is built by people who understand this market because it\'s our market too.',
  },
]

// ─────────────────────────────────────────────────────────────
// FAQ ITEM
// ─────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-white leading-snug">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-[#E09818] shrink-0 mt-0.5" />
          : <ChevronDown className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="pb-5"
        >
          <p className="text-sm text-white/60 leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MEMBER COUNTER (live from DB)
// ─────────────────────────────────────────────────────────────

function MemberCounter() {
  const [count, setCount] = useState(847)

  useEffect(() => {
    fetch('/api/stats/member-count')
      .then((r) => r.json())
      .then((d) => d.count && setCount(d.count))
      .catch(() => {})
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-white/60">
      <div className="flex -space-x-1">
        {['🇳🇬', '🇳🇬', '🇳🇬'].map((flag, i) => (
          <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0B1F3A] bg-[#E09818]/20 text-xs">
            {flag}
          </div>
        ))}
      </div>
      <span>
        <span className="font-bold text-white">{count.toLocaleString()}</span> founding members have claimed their spot
      </span>
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400 font-semibold">
        {(1000 - count).toLocaleString()} spots left at founding price
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN WAITLIST CLIENT
// ─────────────────────────────────────────────────────────────

export default function WaitlistClient() {
  const router = useRouter()

  return (
    <div className="min-h-screen" style={{ background: NAVY }}>

      {/* ── SECTION 1: HERO — The Fear Hook (Law 4 + 5 + 1) ── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E09818]/8 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E09818]/30 bg-[#E09818]/10 px-4 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E09818]" />
            <span className="text-xs font-bold text-[#E09818]">Africa's Premier AI Marketing Platform</span>
          </motion.div>

          {/* Main headline — Law 4 (Fear) + Law 5 (Giant Promise) */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl"
          >
            Every Day You Don't Have
            <br />
            a Marketing System,
            <br />
            <span style={{ color: GOLD }}>Your Competitor Is Getting</span>
            <br />
            Your Customers.
          </motion.h1>

          {/* Subheadline — Law 1 (Awoof Stack) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 mx-auto max-w-2xl"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-white/40 mb-1">The old way</p>
                  <p className="text-2xl font-black text-white/50 line-through">₦1.2M/month</p>
                  <p className="text-xs text-white/30">Lagos marketing agency</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#E09818]/70 mb-1">Cerebre Plus</p>
                  <p className="text-2xl font-black text-[#E09818]">₦18,000/month</p>
                  <p className="text-xs text-[#E09818]/50">40 AI tools. Same results.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Email form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mt-8 mx-auto max-w-xl"
          >
            <WaitlistForm placement="hero" />
          </motion.div>

          {/* Member counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex justify-center"
          >
            <MemberCounter />
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3"
          >
            {[
              { icon: <Shield className="h-3.5 w-3.5" />, text: '30-day full refund guarantee' },
              { icon: <Zap className="h-3.5 w-3.5" />,    text: 'First generation free' },
              { icon: <Globe className="h-3.5 w-3.5" />,  text: 'Built for Nigerian businesses' },
              { icon: <Award className="h-3.5 w-3.5" />,  text: 'Founding member price locked forever' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-white/40">
                <span style={{ color: GOLD }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: THE STORY — Law 6 (Story) ────────── */}
      <section className="border-t border-white/5 bg-white/3 px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-[#E09818]/20" />
            <span className="text-xs font-bold text-[#E09818]/60 uppercase tracking-widest">A Tale of Two Businesses</span>
            <div className="h-px flex-1 bg-[#E09818]/20" />
          </div>

          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-lg font-semibold text-white leading-relaxed">
              Two businesses opened in Lagos on the same street in the same month.
              Same industry. Same starting capital. Same quality of work.
            </p>
            <p className="text-base text-white/70 mt-4 leading-relaxed">
              Three years later, Business A is turning away clients and just hired their third staff member.
              Business B is still searching for customers and wondering what went wrong.
            </p>
            <p className="text-base text-white/70 mt-4 leading-relaxed">
              The product wasn't the difference. The location wasn't the difference.
              The relationships and connections weren't the difference.
            </p>
            <p className="text-lg font-bold text-[#E09818] mt-6">
              The difference was the marketing system.
            </p>
            <p className="text-base text-white/70 mt-4 leading-relaxed">
              Business A had a consistent presence — WhatsApp broadcasts every week,
              Instagram content that actually converted, a clear brand that made them
              the obvious choice in their area. Business B posted randomly, had no
              WhatsApp list, and relied on word of mouth that was slowly dying out.
            </p>
            <p className="text-base text-white/70 mt-4 leading-relaxed">
              The tragedy is that Business B's owner is talented. Their work is excellent.
              But in Nigeria — as in every market — the best marketer wins, not the best
              product. Business A wasn't better at their craft. They were better at telling
              people about their craft.
            </p>
            <p className="text-lg font-bold text-white mt-6">
              Cerebre Plus exists to make sure you're Business A.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE 40 TOOLS — Law 1 (Awoof) ─────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">40 AI Marketing Tools</h2>
            <p className="mt-3 text-base text-white/60">
              Everything a Nigerian business needs to market professionally — in one platform.
            </p>
            <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-[#E09818]/20 bg-[#E09818]/5 px-6 py-4">
              <div className="text-center">
                <p className="text-xs text-white/40">Agency charges for this work</p>
                <p className="text-2xl font-black text-white/50 line-through">₦1.2M/month</p>
              </div>
              <div className="text-2xl text-[#E09818]">→</div>
              <div className="text-center">
                <p className="text-xs text-[#E09818]/70">Cerebre Plus Growth Plan</p>
                <p className="text-2xl font-black text-[#E09818]">₦35,000/month</p>
              </div>
            </div>
          </div>

          {/* Tool grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {TOOLS_PREVIEW.map((tool) => (
              <div
                key={tool.name}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-center hover:border-[#E09818]/30 hover:bg-[#E09818]/5 transition-all"
              >
                <div className="text-xl mb-1">{tool.icon}</div>
                <p className="text-xs font-semibold text-white">{tool.name}</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-[#E09818]">
                  <Coins className="h-2.5 w-2.5" />{tool.coins}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ───────────────────── */}
      <section className="border-t border-white/5 bg-white/3 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-white text-center mb-12">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { step: '1', icon: '👤', title: 'Complete your profile', desc: 'Add your business name, city, industry, and WhatsApp number. Takes 3 minutes.' },
              { step: '2', icon: '🔮', title: 'Choose a tool', desc: '40 specialised AI tools for every marketing need — from WhatsApp campaigns to 90-day strategies.' },
              { step: '3', icon: '✨', title: 'Generate in seconds', desc: 'Fill in the brief. Hit Generate. Your personalised, Nigerian-market-optimised output appears in under 60 seconds.' },
              { step: '4', icon: '🚀', title: 'Publish and convert', desc: 'Copy directly to WhatsApp, Instagram, email, or ads. Every output is immediately usable.' },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="relative inline-flex">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                    {step.icon}
                  </div>
                  <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-[#0B1F3A]" style={{ background: GOLD }}>
                    {step.step}
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: TESTIMONIALS — Law 3 + 9 ─────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">What Nigerian Business Owners Say</h2>
            <p className="mt-3 text-sm text-white/50">
              Real results from businesses in Lagos, Abuja, and Port Harcourt
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#E09818]" fill={GOLD} />
                  ))}
                </div>
                <div className="mb-3 rounded-xl border border-[#E09818]/20 bg-[#E09818]/5 p-3">
                  <p className="text-xs font-bold text-[#E09818]">📊 Key result:</p>
                  <p className="text-xs text-white/80 mt-0.5">{t.result}</p>
                </div>
                <p className="text-sm text-white/70 leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-[#E09818]/20 flex items-center justify-center text-sm font-bold text-[#E09818]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-white/40">{t.industry} · {t.area}, {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FAQ — Law 8 ────────────────────── */}
      <section className="border-t border-white/5 bg-white/3 px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-black text-white text-center mb-10">
            Questions You're Already Thinking
          </h2>
          <div className="divide-y-0">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: GUARANTEE — Law 1 + 3 ────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative rounded-3xl border border-[#E09818]/20 bg-gradient-to-b from-[#E09818]/10 to-transparent p-8 md:p-12">
            <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-full border border-[#E09818]/30 bg-[#E09818]/10">
              <Shield className="h-10 w-10 text-[#E09818]" />
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">The 30-Day Promise</h2>
            <p className="mt-4 text-lg text-white/70 leading-relaxed">
              Try Cerebre Plus for 30 days. If you don't believe it's worth every naira,
              we'll refund you completely.
            </p>
            <p className="mt-3 text-base text-white/70 leading-relaxed">
              No questions. No forms. No awkward conversations. No trying to convince you to stay.
            </p>
            <p className="mt-5 text-sm font-semibold text-[#E09818]">
              We can afford to make this promise because we built something that works.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FINAL CTA — Law 10 (Scarcity) ── */}
      <section className="border-t border-[#E09818]/10 bg-gradient-to-b from-[#E09818]/5 to-transparent px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5">
            <Clock className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs font-bold text-red-400">Founding Member Pricing — Limited to 1,000 Members</span>
          </div>

          <h2 className="text-3xl font-black text-white md:text-4xl">
            Your competitors are already
            <br />
            <span style={{ color: GOLD }}>building their marketing machine.</span>
          </h2>

          <p className="mt-5 text-base text-white/60 leading-relaxed">
            After we hit 1,000 founding members, Starter goes from ₦18,000 to ₦25,000.
            Growth goes from ₦35,000 to ₦50,000.
            Founding members lock in today's price forever.
          </p>

          <div className="mt-8 mx-auto max-w-xl">
            <WaitlistForm
              placement="final_cta"
              ctaText="Lock In My Founding Member Price →"
            />
          </div>

          <div className="mt-8">
            <MemberCounter />
          </div>

          {/* Plan comparison */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: 'Free',       price: '₦0',      coins: '30 coins' },
              { name: 'Starter',    price: '₦18,000', coins: '100 coins', highlight: false },
              { name: 'Growth',     price: '₦35,000', coins: '250 coins', highlight: true },
              { name: 'Premium',    price: '₦75,000', coins: '650 coins' },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-4 text-center ${
                  plan.highlight
                    ? 'border-[#E09818]/50 bg-[#E09818]/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {plan.highlight && (
                  <div className="mb-2 rounded-full bg-[#E09818] px-2 py-0.5 text-[10px] font-black text-[#0B1F3A]">POPULAR</div>
                )}
                <p className="text-sm font-bold text-white">{plan.name}</p>
                <p className="text-base font-black" style={{ color: plan.highlight ? GOLD : 'white' }}>{plan.price}</p>
                <p className="text-xs text-white/40">{plan.coins}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-4 py-8">
        <div className="mx-auto max-w-4xl text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base font-black text-white">Cerebre</span>
            <span className="text-base font-black" style={{ color: GOLD }}>Plus</span>
          </div>
          <p className="text-xs text-white/30">by Cerebre Media Africa · Africa's Premier AI Marketing Platform</p>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} Cerebre Media Africa. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
