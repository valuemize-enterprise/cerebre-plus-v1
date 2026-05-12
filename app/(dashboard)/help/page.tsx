'use client'
// /app/(dashboard)/help/page.tsx

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, ChevronDown, BookOpen, Zap, Coins,
  Sparkles, Play, ExternalLink, Copy, Check, Search,
  HelpCircle, Users, Shield, ArrowRight, Star,
} from 'lucide-react'

const NAVY = '#0B1F3A'
// const GOLD = '#E09818'
const SUPPORT_WA = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '2348012345678'

const QUICK_START_STEPS = [
  {
    number: '01', icon: '👤', colour: '#E09818',
    title: 'Complete your business profile',
    desc: 'Go to Profile and fill in your business name, city, WhatsApp number, and what makes you different. This is what the AI uses to personalise every output.',
    action: 'Go to Profile', href: '/profile',
  },
  {
    number: '02', icon: '🔮', colour: '#8B5CF6',
    title: 'Pick a tool and run it',
    desc: 'Go to the Tools page, choose a tool that matches what you need — a caption, a WhatsApp message, a strategy. Fill in the brief and click Generate.',
    action: 'Browse Tools', href: '/tools',
  },
  {
    number: '03', icon: '📋', colour: '#10B881',
    title: 'Copy, publish, or share',
    desc: 'Your output appears in seconds. Copy it directly to Instagram, WhatsApp, or your ads manager. One tap to share on WhatsApp. Ready to use immediately.',
    action: 'View History', href: '/history',
  },
  {
    number: '04', icon: '💡', colour: '#3B82F6',
    title: 'Check your daily ideas',
    desc: 'Every morning at 6AM, Cerebre Plus generates 5 fresh content ideas personalised to your business and the date. Each idea tells you which tool to use and why.',
    action: "See Today's Ideas", href: '/ideas',
  },
]

const FAQS = [
  {
    category: 'Getting Started', icon: <Play className="h-3.5 w-3.5" />,
    questions: [
      {
        q: 'How do I get better results from the tools?',
        a: 'The single biggest factor is your profile completeness. Go to Profile and fill in your business description, unique advantage, target customer, social proof, and WhatsApp number. A complete profile produces outputs with your city, your niche, your actual WhatsApp number, and your real competitive advantage — instead of generic placeholders.',
      },
      {
        q: 'What is a Cerebre Coin and how do I spend them?',
        a: 'Every time you run a tool, coins are deducted from your balance. Simple tools like CaptionCraft cost 12–15 coins. Complex tools like StrategyBrain cost 100 coins. You receive coins when you subscribe each month. If you run low, top up from the Billing page — starting from ₦500 for 50 coins.',
      },
      {
        q: "What happens if I don't use all my coins in a month?",
        a: 'Free and Starter plans do not roll over coins — unused coins expire at the end of each billing month. Growth plan rolls over up to 30 coins. Premium rolls over up to 80 coins. Enterprise is unlimited.',
      },
      {
        q: 'Can I undo a coin deduction if I am not happy with the output?',
        a: 'Coins are only deducted when a generation completes successfully. If the generation fails or times out, no coins are taken. If you are unhappy with a completed output, run the tool again with more detail in the brief — additional context almost always produces a significantly better result.',
      },
    ],
  },
  {
    category: 'Tools & Outputs', icon: <Zap className="h-3.5 w-3.5" />,
    questions: [
      {
        q: 'Why does the output say "example business" instead of my business name?',
        a: 'Your business profile is not complete. Go to Profile → Business section and fill in your business name, city, and WhatsApp number. After saving, run the tool again — the output will use your actual business details.',
      },
      {
        q: 'The output is in English but I wanted it in Pidgin or Yoruba.',
        a: 'Go to Profile → Brand section and change your Language Preference. Every tool output will then be generated in that language. You can also specify the language in the tool brief itself for a one-off change.',
      },
      {
        q: 'What does the ♻️ Repurpose button do?',
        a: 'It transforms a past output into a different format — for example, an Instagram caption becomes a LinkedIn post, a blog post becomes 7 carousel slides, or a WhatsApp broadcast becomes an email sequence. It costs 8 coins per repurpose. Find this on any generation in your History.',
      },
      {
        q: 'How do I share an output publicly?',
        a: 'On any output, click the Share button. This creates a public link anyone can view without logging in. Each shared link is valid for 30 days. You can also share directly to WhatsApp with a pre-written message that promotes your business.',
      },
    ],
  },
  {
    category: 'Billing & Coins', icon: <Coins className="h-3.5 w-3.5" />,
    questions: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to the Billing page, choose the plan you want, and click Upgrade. A Paystack payment popup will open. Complete the payment and your new plan activates immediately with coins credited to your account.',
      },
      {
        q: 'My payment went through but my coins were not added.',
        a: 'This is usually resolved within 5 minutes as the payment processes. If it has been more than 10 minutes, contact support on WhatsApp with your payment reference number and we will credit your coins manually within 1 hour.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Yes — we offer a 30-day full refund on subscription payments, no questions asked. If you subscribed in the last 30 days and do not believe Cerebre Plus is worth every naira, contact us on WhatsApp and we will refund your payment completely.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes. Go to Billing and click Cancel. Your access and existing coins continue until the end of your current billing period. There is no penalty and no awkward conversations — just a clean cancellation.',
      },
    ],
  },
  {
    category: 'Account & Profile', icon: <Users className="h-3.5 w-3.5" />,
    questions: [
      {
        q: 'How do I change my email address?',
        a: 'Email changes are handled through support. Send a WhatsApp message to our support line with your current email and new email. We will update it and send a verification to the new address within 24 hours.',
      },
      {
        q: 'I forgot my password.',
        a: 'Go to the login page and click "Forgot password". Enter your email address and we will send a reset link. The link expires in 1 hour. If you do not receive the email, check your spam folder.',
      },
      {
        q: 'How do I earn coins from referrals?',
        a: 'Go to the Referral page. Copy your unique referral link. When someone signs up through your link and subscribes to a paid plan, you automatically receive 100 coins. There is no limit — refer 10 people and earn 1,000 coins.',
      },
    ],
  },
]

const CEREBRE_LAWS = [
  { number: 1,  name: 'The Awoof Law',               emoji: '💰', summary: 'Show the comparison. ₦1.2M (agency) vs ₦35,000 (Cerebre Plus). The comparison IS the sale.' },
  { number: 2,  name: 'The List Law',                emoji: '📋', summary: 'Build the relationship before the sale. Collect WhatsApp numbers first. The list is the business.' },
  { number: 3,  name: 'The Trust Law',               emoji: '🛡️', summary: '"2,400 clients in Lagos" converts. "Many clients" does not. Specificity destroys FOBE.' },
  { number: 4,  name: 'The Fear Law',                emoji: '⚠️', summary: 'Show the cost of NOT acting. Fear of loss beats promise of gain 3-to-1 in Nigeria.' },
  { number: 5,  name: 'The Giant Promise Law',       emoji: '🚀', summary: 'Be bold and specific. "90-day strategy in 60 seconds." Cautious promises do not convert.' },
  { number: 6,  name: 'The Story Law',               emoji: '📖', summary: 'Lead with a Nigerian business owner story. The offer only appears after emotional investment.' },
  { number: 7,  name: 'The Sales Letter Formula',   emoji: '📝', summary: 'Hook → Story → Trust → Offer → Urgency → Close → P.S. In that exact order. Every time.' },
  { number: 8,  name: 'The Customer Behaviour Law', emoji: '⚡', summary: 'Use "I" not "we". Put the WhatsApp number IN the message. One tap, zero thinking required.' },
  { number: 9,  name: 'The Community Validation Law',emoji: '👥', summary: '"2,400 businesses in Lagos, Abuja, PH" vs "thousands of businesses." Named cities convert.' },
  { number: 10, name: 'The Urgency Law',             emoji: '⏰', summary: 'Real deadline or real limit. "Offer closes this Friday midnight." No fake countdowns.' },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-white leading-snug">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-0.5">
          <ChevronDown className="h-4 w-4 text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-white/55 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'start' | 'faq' | 'laws' | 'contact'>('start')
  const [search,    setSearch]    = useState('')
  const [copied,    setCopied]    = useState(false)

  const copyWA = async () => {
    await navigator.clipboard.writeText(`+${SUPPORT_WA}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredFAQs = FAQS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.questions.length > 0)

  const tabs = [
    { id: 'start',   label: 'Quick Start', icon: <Play className="h-3.5 w-3.5" /> },
    { id: 'faq',     label: 'FAQs',        icon: <HelpCircle className="h-3.5 w-3.5" /> },
    { id: 'laws',    label: 'The 10 Laws', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'contact', label: 'Contact Us',  icon: <MessageCircle className="h-3.5 w-3.5" /> },
  ] as const

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: NAVY }}>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="h-5 w-5 text-[#E09818]" />
            <h1 className="text-2xl font-black text-white">Help & Support</h1>
          </div>
          <p className="text-sm text-white/40">Everything you need to get the most out of Cerebre Plus.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                activeTab === tab.id ? 'bg-[#E09818] text-[#0B1F3A]' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Quick Start ──────────────────────────── */}
        {activeTab === 'start' && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-2xl border border-[#E09818]/20 bg-[#E09818]/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[#E09818]" />
                <p className="text-sm font-bold text-white">New to Cerebre Plus?</p>
              </div>
              <p className="text-sm text-white/55">
                Follow these 4 steps and you will have your first AI-generated marketing content live within 10 minutes.
              </p>
            </div>

            <div className="space-y-3">
              {QUICK_START_STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                        style={{ background: `${step.colour}15`, border: `1px solid ${step.colour}30` }}
                      >
                        {step.icon}
                      </div>
                      <div
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-[#0B1F3A]"
                        style={{ background: step.colour }}
                      >
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white mb-1">{step.title}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
                      <button
                        onClick={() => router.push(step.href)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity"
                        style={{ color: step.colour }}
                      >
                        {step.action} <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Video CTA */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="mb-3 flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-[#E09818]/15">
                <Play className="h-6 w-6 text-[#E09818]" />
              </div>
              <p className="text-sm font-bold text-white">Watch: Getting Started in 5 Minutes</p>
              <p className="mt-1 text-xs text-white/40">A walkthrough of your first tool generation, start to finish.</p>
              <a
                href="https://youtube.com/@cerebreplus"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#E09818]/15 border border-[#E09818]/30 px-4 py-2 text-xs font-bold text-[#E09818] hover:bg-[#E09818]/25"
              >
                Watch on YouTube <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}

        {/* ── FAQs ────────────────────────────────── */}
        {activeTab === 'faq' && (
          <motion.div key="faq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40"
              />
            </div>

            {filteredFAQs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                <p className="text-sm text-white/40">No results for "{search}"</p>
                <button onClick={() => setSearch('')} className="mt-2 text-xs text-[#E09818]">Clear search</button>
              </div>
            ) : (
              filteredFAQs.map((cat) => (
                <div key={cat.category} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
                    <span className="text-white/30">{cat.icon}</span>
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{cat.category}</span>
                  </div>
                  <div className="px-5">
                    {cat.questions.map((item) => (
                      <FAQItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </div>
              ))
            )}

            <div className="rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 p-5 text-center">
              <MessageCircle className="mx-auto mb-2 h-6 w-6 text-[#25D366]" />
              <p className="text-sm font-bold text-white">Still have a question?</p>
              <p className="mt-1 text-xs text-white/40">Our support team responds on WhatsApp within 2 hours.</p>
              <a
                href={`https://wa.me/${SUPPORT_WA}?text=Hi, I need help with Cerebre Plus`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 px-5 py-2.5 text-sm font-bold text-[#25D366] hover:bg-[#25D366]/25"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}

        {/* ── The 10 Laws ─────────────────────────── */}
        {activeTab === 'laws' && (
          <motion.div key="laws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-[#E09818] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Why these laws are in every output</p>
                  <p className="mt-1 text-xs text-white/50 leading-relaxed">
                    Every output Cerebre Plus generates is built on these 10 principles of Nigerian market psychology.
                    Understanding them helps you write better briefs and recognise why your outputs are structured the way they are.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {CEREBRE_LAWS.map((law, i) => (
                <motion.div
                  key={law.number}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="text-2xl">{law.emoji}</span>
                    <span className="text-[10px] font-black text-white/20">{String(law.number).padStart(2, '0')}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{law.name}</p>
                    <p className="mt-0.5 text-xs text-white/50 leading-relaxed">{law.summary}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#E09818]/20 bg-[#E09818]/5 p-5 text-center">
              <Star className="mx-auto mb-2 h-6 w-6 text-[#E09818]" />
              <p className="text-sm font-bold text-white">See the laws applied with real Nigerian examples</p>
              <p className="mt-1 text-xs text-white/40">The Insights page breaks down each law with examples and the best tool to apply it.</p>
              <button
                onClick={() => router.push('/insights')}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#E09818] px-5 py-2.5 text-sm font-bold text-[#0B1F3A] hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" /> Go to Insights
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Contact Us ──────────────────────────── */}
        {activeTab === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* WhatsApp — primary */}
            <div className="rounded-2xl border border-[#25D366]/30 bg-[#25D366]/8 p-6 text-center">
              <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[#25D366]/20">
                <MessageCircle className="h-8 w-8 text-[#25D366]" />
              </div>
              <h2 className="text-base font-black text-white">WhatsApp Support</h2>
              <p className="mt-1 text-sm text-white/50">Fastest way to reach us. Response within 2 hours on business days.</p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 mx-auto max-w-xs">
                <p className="text-sm font-mono font-bold text-white">+{SUPPORT_WA}</p>
                <button onClick={copyWA} className={`ml-auto shrink-0 transition-colors ${copied ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'}`}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <a
                href={`https://wa.me/${SUPPORT_WA}?text=Hi! I need help with Cerebre Plus.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-black text-white hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <MessageCircle className="h-4 w-4" /> Open WhatsApp Chat
              </a>
              <p className="mt-3 text-xs text-white/25">Mon – Fri · 8AM – 8PM WAT · Sat 9AM – 5PM WAT</p>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-lg">✉️</div>
                <div>
                  <p className="text-sm font-bold text-white">Email Support</p>
                  <p className="text-xs text-white/40">For billing issues, account security, and formal requests</p>
                </div>
              </div>
              <a
                href="mailto:support@cerebreplus.com"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                support@cerebreplus.com
              </a>
              <p className="mt-2 text-xs text-white/30 text-center">Response within 24 hours</p>
            </div>

            {/* Common topics */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">
                Common support topics — tap one to message us directly
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '🪙', label: 'Coins not credited' },
                  { icon: '💳', label: 'Payment issue' },
                  { icon: '🔐', label: 'Account access' },
                  { icon: '🤖', label: 'AI output quality' },
                  { icon: '📱', label: 'Mobile display bug' },
                  { icon: '🔄', label: 'Subscription change' },
                  { icon: '👥', label: 'Referral coins' },
                  { icon: '💡', label: 'Feature request' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={`https://wa.me/${SUPPORT_WA}?text=Hi, I need help with: ${item.label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-xs text-white/60 hover:border-white/20 hover:text-white hover:bg-white/8 transition-all"
                  >
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Refund guarantee */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-[#E09818] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">30-Day Refund Guarantee</p>
                  <p className="mt-0.5 text-xs text-white/50 leading-relaxed">
                    Not satisfied within 30 days? Send us a WhatsApp message and we will refund your subscription completely.
                    No forms. No questions. No awkward conversations.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  )
}
