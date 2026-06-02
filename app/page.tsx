'use client'
/**
 * app/page.tsx — Cerebre Plus Landing Page v2
 * Updated plans: Free (₦0/70c/30d) · Starter (₦20K/yr) · Growth (₦80K/yr)
 * New sections: ROI Calculator · Coin Value · SME Club · Annual pricing reframe
 * Design: Dark luxury editorial · $10,000 quality · Nigerian market
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link   from 'next/link'
import Image  from 'next/image'

// ─── Tokens ──────────────────────────────────────────────────
const VOID   = '#06080E'
const INK    = '#090C16'
const S1     = '#0C1020'
const S2     = '#111929'
const NAVY   = '#0B1F3A'
const GOLD   = '#C8880A'
const GM     = '#E09C12'
const GL     = '#F5B830'
const TEAL   = '#0BA890'
const TL     = '#12D4B4'
const CORAL  = '#E84830'
const WA     = '#25D366'
const WAD    = '#128C7E'
const W      = '#FFFFFF'
const BRIGHT = '#EBF2FC'
const TEXT   = '#CDD9EC'
const MUTED  = '#4A6280'

const WA_NUM = '2348124266524'
const waHref = (t: string) => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(t)}`

// ─── Plan data ────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free', name: 'Free Trial', price: 0, yearLabel: '₦0',
    monthEq: null, coins: 70, validity: '30 days',
    badge: null, featured: false,
    tagline: 'Zero risk. Zero card. Just results.',
    forWho: 'Anyone who wants to see AI marketing in action before spending a naira.',
    desc: 'Discover what Cerebre Plus can do for your business — completely free, for 30 days.',
    features: [
      '70 Cerebre Coins (30-day validity)',
      'CaptionCraft AI — Instagram & Facebook captions',
      'WhatsApp Message Drafter',
      'Product Description Generator',
      'Headline & CTA Builder',
      'Content Idea Spark (10 ideas in 10 seconds)',
      'Basic Brand Profile Setup',
      'Community support forum',
      'No credit card — ever',
    ],
    notIncluded: [
      'Trial ends permanently after 30 days',
      'Coins cannot be topped up',
      'No access to the full 40-tool library',
      'No SME Club',
      'No priority support',
    ],
    cta: 'Start Free — No Card Needed', href: '/signup',
  },
  {
    id: 'starter', name: 'Starter', price: 20000, yearLabel: '₦20,000',
    monthEq: '₦1,667/mo', coins: 150, validity: 'Full year',
    badge: null, featured: false,
    tagline: 'Your first real marketing system. ₦1,667/month. For a full year.',
    forWho: 'Business owners ready to market consistently — without agency fees or a social media manager salary.',
    desc: 'One payment. 365 days. 150 coins across all 40 tools. This is what professional marketing looks like for a Nigerian SME.',
    features: [
      '150 Cerebre Coins — valid for 365 days',
      'Full access to all 40 marketing tools',
      '90-Day Marketing Strategy Builder',
      '30-Day Content Calendar Generator',
      'WhatsApp Campaign Builder',
      'Nigerian Copywriter AI (captions, ads, emails)',
      'Meta & Google Ads Brief Generator',
      'Competitor Intelligence Module',
      'Budget Allocation Engine',
      'Brand Vault — save your profile once, use forever',
      'History & Library — revisit every output you create',
      'Analytics Dashboard',
      'Top-up anytime (from ₦5,000 / 10 coins)',
      'Email support (48-hour response)',
    ],
    notIncluded: [
      'SME Club not included',
      'Standard email support only (not priority)',
      'Coins do not roll over to the next year',
    ],
    cta: 'Start with Starter — ₦20,000/yr →', href: '/signup?plan=starter',
  },
  {
    id: 'growth', name: 'Growth', price: 80000, yearLabel: '₦80,000',
    monthEq: '₦6,667/mo', coins: 700, validity: 'Full year',
    badge: '⚡ Best Value', featured: true,
    tagline: 'More than tools — a community fighting for your growth.',
    forWho: 'Business owners who want maximum output AND a weekly edge through community, learning, and direct support.',
    desc: '700 coins. Exclusive SME Club. Priority support. First access to every new tool. This is the plan that compounds.',
    features: [
      '700 Cerebre Coins — valid for 365 days',
      'Coin rollover — carry up to 200 unused coins to next year',
      '50 bonus coins auto-credited every quarter',
      'Full access to all 40 tools',
      'First access to every new tool before public launch',
      '🌟 SME Club — Weekly WhatsApp Marketing Masterclass',
      '🌟 SME Club — Private Nigerian Business Owners Community',
      '🌟 SME Club — Monthly Marketing Insider Newsletter',
      '🌟 SME Club — Member-only templates & swipe files',
      '🚀 Priority WhatsApp Support (< 4-hour response, Mon–Sat)',
      'Weekly Pulse Performance Report',
      'Advanced Analytics + ROI Tracking',
      'Top-up anytime (same bulk rates)',
      'Everything included in Starter',
    ],
    notIncluded: [],
    cta: 'Join Growth + SME Club →', href: '/signup?plan=growth',
  },
]

// ─── Demo data ────────────────────────────────────────────────
const DEMOS = [
  {
    id: 'caption', name: 'CaptionCraft AI', cat: 'CONTENT', coins: 15,
    brief: {
      Business: 'Adunni Fabrics — Ankara fashion, Yaba Lagos',
      Product:  'New midi skirts, ₦8,500 each',
      Audience: 'Nigerian women 25–45 who love quality ankara',
      Tone:     'Warm, aspirational, premium',
    },
    output: `✨ Ankara that moves with YOU 🌺

New Midi Skirt Collection — and yes, it's giving everything it's supposed to give.

Every yard hand-selected. Every stitch deliberate. Because a woman who carries herself like royalty deserves fabric that knows it.

💛 ₦8,500 per skirt
📍 In-store now — Yaba, Lagos
📲 DM "MIDI" to place your order

Link in bio 💛

#AnkaraMidi #AdunniFabrics #LagosStyle #NigerianFashion`,
  },
  {
    id: 'strategy', name: '90-Day Strategy AI', cat: 'STRATEGY', coins: 100,
    brief: {
      Business: 'GlowLab — natural skincare, Port Harcourt',
      Goal:     'Double sales: ₦800K → ₦1.6M in 90 days',
      Channels: 'Instagram only, 2,100 followers',
      Budget:   '₦80,000/month marketing budget',
    },
    output: `GLOWLAB SKINCARE — 90-DAY GROWTH STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MONTH 1: BUILD YOUR BROADCAST LIST
Goal: 200 WhatsApp subscribers

→ Post "Drop your number for exclusive deals" on IG daily
→ Collect 150+ numbers — your most valuable asset
→ Week 3: First broadcast "Glow Starter Pack" — ₦12,500
→ Target: ₦120,000 in 72 hours from your first broadcast

MONTH 2: TURN THE ENGINE ON
Goal: ₦400K/week

→ 2x weekly IG Reels (Before/After skin content)
→ Facebook retargeting ads — ₦25,000 budget
→ Launch referral: Share code, earn ₦500 credit

MONTH 3: SCALE TO TARGET
Goal: ₦1.6M/month — ACHIEVED ✓

→ Partner with 3 PH micro-influencers (10K–50K)
→ "GlowLab Inner Circle" loyalty programme
→ Pre-orders open for December Christmas sets

KEY METRICS:
• WhatsApp open rate target: 85%+
• Cost per new customer: below ₦2,500
• Repeat purchase rate: 40%+`,
  },
  {
    id: 'whatsapp', name: 'WhatsApp Campaign Builder', cat: 'WHATSAPP', coins: 25,
    brief: {
      Business: 'QuickBite — homemade meals, Abuja',
      Offer:    'Free delivery on orders above ₦3,500',
      Audience: 'Customers who ordered in the last 30 days',
      Urgency:  'This weekend only — Friday to Sunday',
    },
    output: `Hi [Name] 👋

You haven't eaten QuickBite this week and honestly, that's a crime 😄

This weekend only — FREE DELIVERY on every order above ₦3,500.

No code. No stress. Just choose and we deliver.

🍱 This weekend's specials:
→ Jollof Rice + Chicken — ₦2,800
→ Egusi Soup + Swallow — ₦3,200
→ Fried Rice + Fish — ₦3,000

⏰ Offer expires SUNDAY MIDNIGHT.

Reply "ORDER" right now and I'll send you the full menu.

— The QuickBite Team 🍽️`,
  },
]

// ─── Tiny helpers ─────────────────────────────────────────────
function WaIcon({ s = 24, c = 'white' }: { s?: number; c?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.533 5.851L.057 23.526a.5.5 0 0 0 .617.608l5.87-1.539A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.587-.5-5.084-1.374l-.36-.214-3.736.979.997-3.648-.235-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}

function Ey({ t, c = GM }: { t: string; c?: string }) {
  return <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' as const, color: c, marginBottom: 12 }}>{t}</span>
}

function Tick({ t, sm }: { t: string; sm?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: sm ? 12 : 13, color: 'rgba(205,217,236,0.62)' }}>
      <span style={{ width: 17, height: 17, borderRadius: '50%', background: `${TEAL}18`, border: `1px solid ${TEAL}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: TL, flexShrink: 0 }}>✓</span>
      {t}
    </div>
  )
}

function PlanCard({ plan, onCta }: { plan: typeof PLANS[0]; onCta: () => void }) {
  const [hover, setHover] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const visibleFeatures = showAll ? plan.features : plan.features.slice(0, 6)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: plan.featured ? 'linear-gradient(160deg,#130E00,#1C1600,#090F1E)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${plan.featured ? GM + '55' : hover ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20, padding: '30px 24px', position: 'relative', overflow: 'hidden',
        transition: 'all .25s', transform: plan.featured && hover ? 'translateY(-4px)' : 'none',
        boxShadow: plan.featured ? `0 0 80px ${GOLD}0D` : hover ? '0 8px 40px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {plan.featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${GM},transparent)` }} />}

      {/* Badge */}
      {plan.badge && (
        <div style={{ display: 'inline-block', marginBottom: 16, background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontSize: 10, fontWeight: 700, padding: '4px 14px', borderRadius: 20, letterSpacing: '1px' }}>
          {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <div style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 700, color: BRIGHT, marginBottom: 6 }}>{plan.name}</div>

      {/* Tagline */}
      <p style={{ fontSize: 13, color: 'rgba(205,217,236,0.55)', lineHeight: 1.5, marginBottom: 16, fontStyle: 'italic' }}>{plan.tagline}</p>

      {/* Price */}
      <div style={{ marginBottom: plan.monthEq ? 4 : 14 }}>
        <span style={{ fontFamily: "'Georgia',serif", fontSize: plan.id === 'free' ? 42 : 48, fontWeight: 900, color: plan.id === 'free' ? TL : GL, lineHeight: 1 }}>{plan.yearLabel}</span>
        {plan.price > 0 && <span style={{ fontSize: 13, color: MUTED, marginLeft: 5 }}>/year</span>}
      </div>
      {plan.monthEq && <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11.5, color: MUTED, fontFamily: 'monospace' }}>{plan.monthEq} equivalent</span>
        <span style={{ fontSize: 10, background: `${TL}15`, border: `1px solid ${TL}28`, color: TL, padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>vs ₦300K+ agencies</span>
      </div>}
      {plan.id === 'free' && <div style={{ fontSize: 12, color: `${CORAL}AA`, marginBottom: 14, fontWeight: 600 }}>⚠ Trial expires after 30 days — no renewal</div>}

      {/* Coin badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: `${GL}10`, borderRadius: 10 }}>
        <span style={{ fontSize: 20 }}>🪙</span>
        <div>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: GL, lineHeight: 1 }}>{plan.coins}</div>
          <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Coins · {plan.validity}</div>
        </div>
      </div>

      {/* For who */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 13px', marginBottom: 18 }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 4 }}>This plan is for</p>
        <p style={{ fontSize: 12.5, color: 'rgba(205,217,236,0.7)', lineHeight: 1.55 }}>{plan.forWho}</p>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {visibleFeatures.map((f, i) => {
          const isSME = f.startsWith('🌟')
          const isSup = f.startsWith('🚀')
          return (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: isSME ? GL : isSup ? TL : 'rgba(205,217,236,0.72)', alignItems: 'flex-start' }}>
              {!isSME && !isSup && <span style={{ color: TL, fontSize: 10, marginTop: 3, flexShrink: 0 }}>✓</span>}
              {isSME && <span style={{ fontSize: 10, marginTop: 3, flexShrink: 0 }}>🌟</span>}
              {isSup && <span style={{ fontSize: 10, marginTop: 3, flexShrink: 0 }}>🚀</span>}
              <span>{f.replace(/^(🌟|🚀)\s*/, '')}</span>
            </div>
          )
        })}
        {plan.notIncluded.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'rgba(205,217,236,0.3)', alignItems: 'flex-start' }}>
            <span style={{ color: 'rgba(205,217,236,0.2)', fontSize: 10, marginTop: 3, flexShrink: 0 }}>✕</span><span>{f}</span>
          </div>
        ))}
        {plan.features.length > 6 && (
          <button
            onClick={() => setShowAll(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: GM, fontSize: 12, fontWeight: 700, textAlign: 'left', fontFamily: 'inherit', paddingTop: 2 }}
          >
            {showAll ? '− Show less' : `+ ${plan.features.length - 6} more features`}
          </button>
        )}
      </div>

      {/* CTA */}
      <Link href={plan.href} style={{
        display: 'block', textAlign: 'center', padding: '14px',
        borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none',
        background: plan.featured ? `linear-gradient(135deg,${GM},${GL})` : plan.id === 'free' ? `${TL}18` : 'rgba(255,255,255,0.07)',
        color: plan.featured ? VOID : plan.id === 'free' ? TL : BRIGHT,
        border: plan.id === 'free' ? `1px solid ${TL}30` : plan.featured ? 'none' : '1px solid rgba(255,255,255,0.1)',
      }}>
        {plan.cta}
      </Link>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${open ? GM + '40' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10, transition: 'border-color .2s' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: open ? `${GM}06` : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', textAlign: 'left', fontFamily: 'inherit' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: BRIGHT, lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: GM, fontSize: 22, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .25s' }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 500 : 0, overflow: 'hidden', transition: 'max-height .35s ease' }}>
        <p style={{ padding: '0 22px 20px', fontSize: 14, color: 'rgba(205,217,236,0.65)', lineHeight: 1.85, margin: 0 }}>{a}</p>
      </div>
    </div>
  )
}

// ─── Demo component ────────────────────────────────────────────
function DemoSection() {
  const [active, setActive]   = useState(0)
  const [running, setRunning] = useState(false)
  const [output, setOutput]   = useState('')
  const [done, setDone]       = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const run = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    setOutput(''); setDone(false); setRunning(true)
    setTimeout(() => {
      const text = DEMOS[active].output
      let i = 0
      timer.current = setInterval(() => {
        if (i >= text.length) { clearInterval(timer.current!); setDone(true); setRunning(false); return }
        setOutput(text.slice(0, i + 1)); i++
      }, 5)
    }, 1600)
  }, [active])

  useEffect(() => { setOutput(''); setDone(false); setRunning(false) }, [active])
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const demo = DEMOS[active]
  return (
    <section id="demo" style={{ padding: 'clamp(80px,10vw,120px) 0', background: INK }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(18px,5%,48px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Ey t="Live Demo" c={TL} />
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
            See it work.<br /><span style={{ color: GL, fontStyle: 'italic' }}>Right now. No signup.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(205,217,236,0.62)', maxWidth: 540, margin: '0 auto' }}>
            Pick a tool. Watch the AI generate real Nigerian marketing content in seconds.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {DEMOS.map((d, i) => (
            <button key={d.id} onClick={() => setActive(i)} style={{ padding: '10px 22px', borderRadius: 30, border: `1px solid ${active === i ? 'transparent' : 'rgba(255,255,255,0.12)'}`, background: active === i ? `linear-gradient(135deg,${GM},${GL})` : 'rgba(255,255,255,0.05)', color: active === i ? VOID : TEXT, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
              {d.name} <span style={{ marginLeft: 6, fontSize: 10, opacity: .7 }}>·{d.coins}c</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="demo-grid">
          {/* Input */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: GL, display: 'inline-block' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: GL, letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>{demo.cat}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED }}>🪙 {demo.coins} coins</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 17, fontWeight: 700, color: BRIGHT, marginBottom: 18 }}>{demo.name}</div>
              {Object.entries(demo.brief).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 5 }}>{k}</div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, color: TEXT, lineHeight: 1.5 }}>{v}</div>
                </div>
              ))}
              <button onClick={run} disabled={running} style={{ marginTop: 8, width: '100%', padding: '14px', borderRadius: 10, background: running ? `${GM}55` : `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 15, border: 'none', cursor: running ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {running ? <><span style={{ animation: 'cp-spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Generating…</> : output ? '↺ Generate Again' : '⚡ Generate Now'}
              </button>
            </div>
          </div>
          {/* Output */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: output ? TL : MUTED, display: 'inline-block', ...(running ? { animation: 'cp-blink 0.8s ease infinite' } : {}) }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: output ? TL : MUTED }}>
                {running ? 'AI Writing…' : output ? 'Output Ready' : 'Awaiting Input'}
              </span>
              {done && <button onClick={() => navigator.clipboard?.writeText(demo.output)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: TEXT, fontSize: 11, padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>}
            </div>
            <div style={{ padding: 20, flex: 1, minHeight: 320, position: 'relative' }}>
              {!output && !running && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <div style={{ fontSize: 38 }}>⚡</div>
                  <p style={{ fontSize: 13, color: MUTED, textAlign: 'center' }}>Click Generate Now<br />to see the AI in action</p>
                </div>
              )}
              {running && !output && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0,1,2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: GL, animation: `cp-bounce 1s ease ${i*.2}s infinite`, display: 'inline-block' }} />)}
                  </div>
                  <p style={{ fontSize: 12, color: MUTED }}>Reading your brief…</p>
                </div>
              )}
              {output && (
                <pre style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.75, fontFamily: "'Courier New',monospace", margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {output}
                  {!done && <span style={{ display: 'inline-block', width: 2, height: 14, background: GL, verticalAlign: 'middle', marginLeft: 1, animation: 'cp-blink .7s ease infinite' }} />}
                </pre>
              )}
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: MUTED }}>
          Every output is personalised to your business profile — industry, city, customers, and brand voice.{' '}
          <Link href="/signup" style={{ color: GL, fontWeight: 700 }}>Create your free account →</Link>
        </p>
      </div>
    </section>
  )
}

// ─── ROI Calculator ───────────────────────────────────────────
function ROICalc() {
  const [spend, setSpend] = useState(150000)
  const annual = spend * 12
  const saving = Math.max(0, annual - 80000)
  const savingFmt = (n: number) => n >= 1000000 ? `₦${(n/1000000).toFixed(1)}M` : `₦${(n/1000).toFixed(0)}K`

  return (
    <section style={{ padding: 'clamp(80px,10vw,120px) 0', background: VOID }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(18px,5%,48px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Ey t="ROI Calculator" c={TL} />
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
            How much are you<br /><span style={{ color: GL, fontStyle: 'italic' }}>leaving on the table?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(205,217,236,0.62)', maxWidth: 500, margin: '0 auto' }}>
            Drag the slider to your current monthly marketing spend. See exactly what you could save.
          </p>
        </div>

        <div style={{ background: `linear-gradient(135deg,${S1},${S2})`, border: `1px solid ${GM}28`, borderRadius: 20, padding: 'clamp(28px,5vw,48px)' }}>
          {/* Slider */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: MUTED }}>Current monthly marketing spend</span>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 700, color: GL }}>₦{spend.toLocaleString()}/mo</span>
            </div>
            <input
              type="range" min={10000} max={2000000} step={5000} value={spend}
              onChange={e => setSpend(Number(e.target.value))}
              style={{ width: '100%', accentColor: GL, height: 6, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: MUTED }}>₦10K/mo</span>
              <span style={{ fontSize: 10, color: MUTED }}>₦2M/mo</span>
            </div>
          </div>

          {/* Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 14, alignItems: 'center', marginBottom: 32 }}>
            {/* Current */}
            <div style={{ background: 'rgba(232,72,48,0.06)', border: '1px solid rgba(232,72,48,0.18)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: CORAL, textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: 10 }}>What you pay now (per year)</div>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: 'rgba(232,72,48,0.9)', lineHeight: 1 }}>
                {savingFmt(annual)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(205,217,236,0.4)', marginTop: 6 }}>₦{spend.toLocaleString()}/month</div>
            </div>

            <span style={{ fontFamily: "'Georgia',serif", fontSize: 28, color: GL, fontWeight: 900, textAlign: 'center' }}>→</span>

            {/* Cerebre */}
            <div style={{ background: `${GL}10`, border: `1px solid ${GL}28`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: GL, textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: 10 }}>Cerebre Plus Growth (per year)</div>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: GL, lineHeight: 1 }}>₦80,000</div>
              <div style={{ fontSize: 12, color: 'rgba(205,217,236,0.4)', marginTop: 6 }}>₦6,667/month equivalent</div>
            </div>
          </div>

          {/* Saving highlight */}
          {saving > 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: `${TL}0D`, border: `1px solid ${TL}25`, borderRadius: 14 }}>
              <div style={{ fontSize: 13, color: TL, marginBottom: 6, fontWeight: 700 }}>You could save every year</div>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, color: TL, lineHeight: 1 }}>{savingFmt(saving)}</div>
              <div style={{ fontSize: 13, color: 'rgba(205,217,236,0.5)', marginTop: 8 }}>
                That's {savingFmt(saving)} you could reinvest into stock, staff, or expansion.
              </div>
              <Link href="/signup?plan=growth" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 14, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}>
                Save {savingFmt(saving)}/year — Start Growth Plan →
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', background: `${GL}0A`, border: `1px solid ${GL}20`, borderRadius: 14 }}>
              <div style={{ fontSize: 14, color: GL, fontWeight: 700, marginBottom: 6 }}>Even at this budget, you get 700 coins + SME Club for ₦80,000/year</div>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>And as you grow, Cerebre Plus grows with you — at the same price.</p>
              <Link href="/signup?plan=growth" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 14, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}>
                Start Growth Plan →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [mOpen, setMOpen]       = useState(false)
  const [typeIdx, setTypeIdx]   = useState(0)
  const [typeText, setTypeText] = useState('')
  const [typeDone, setTypeDone] = useState(false)

  const BUSINESSES = [
    'fashion brands in Lagos',
    'food businesses in Abuja',
    'skincare brands in Port Harcourt',
    'real estate agencies across Nigeria',
    'clinics in Ibadan',
    'schools in Enugu',
    'logistics companies in Kano',
  ]

  // Typewriter for hero
  useEffect(() => {
    const word = BUSINESSES[typeIdx]
    let i = 0; setTypeText(''); setTypeDone(false)
    const type = setInterval(() => {
      if (i >= word.length) { setTypeDone(true); clearInterval(type); return }
      setTypeText(word.slice(0, i + 1)); i++
    }, 50)
    return () => clearInterval(type)
  }, [typeIdx])

  useEffect(() => {
    if (!typeDone) return
    const t = setTimeout(() => setTypeIdx(p => (p + 1) % BUSINESSES.length), 2400)
    return () => clearTimeout(t)
  }, [typeDone, typeIdx])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { document.body.style.overflow = mOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [mOpen])

  const goto = useCallback((id: string) => { setMOpen(false); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80) }, [])

  const wrap:  React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 clamp(18px,5%,48px)' }
  const sec  = (bg = VOID): React.CSSProperties => ({ padding: 'clamp(80px,10vw,120px) 0', background: bg })

  const TOOLS_GRID = [
    { cat: 'Strategy',    tools: ['90-Day Marketing Strategy','Campaign Planner','Budget Allocator','Market Entry Brief','Competitor Intelligence','Audience Persona Builder'] },
    { cat: 'Content',     tools: ['30-Day Content Calendar','CaptionCraft AI','LinkedIn Post Builder','Blog Article Writer','Carousel Script AI','Content Repurposer'] },
    { cat: 'WhatsApp',    tools: ['Broadcast Campaign Builder','Win-Back Sequence','Customer Follow-Up','Flash Sale Announcement','WA Sales Script','Re-engagement Sequence'] },
    { cat: 'Copywriting', tools: ['Nigerian Copywriter AI','Ad Headline Generator','Sales Page Builder','Email Sequence Writer','Product Description AI','Cold Outreach Script'] },
    { cat: 'Paid Ads',    tools: ['Meta Campaign Brief','Google Ads Script','TikTok Ad Concept','Audience Targeting Brief','Creative Direction AI','Ad Copy Variations'] },
    { cat: 'Analytics',   tools: ['Weekly Pulse Report','ROI Calculator','Performance Audit','Growth Forecast','Budget Allocation Engine','Seasonal Campaign Planner'] },
  ]

  const TESTIMONIALS = [
    { name: 'Chidinma A.', role: 'Skincare brand', city: 'Lagos', q: 'Three people DMed me in one week asking if I hired a new copywriter. I didn\'t. I used Cerebre Plus for the first time.', stars: 5 },
    { name: 'Tunde O.',    role: 'Restaurant owner', city: 'Abuja', q: 'The 90-Day Strategy gave me a plan I\'d been guessing at for two years. Done in 4 minutes. I finally know what I\'m doing.', stars: 5 },
    { name: 'Amaka E.',    role: 'Fashion designer', city: 'Enugu', q: 'My WhatsApp campaign built in Cerebre Plus got 14 orders in one evening. My agency spent ₦80,000 and got 9 likes.', stars: 5 },
    { name: 'Segun B.',    role: 'Tech accessories', city: 'Ibadan', q: 'I cancelled my ₦120,000/month social media manager. Cerebre Plus Growth at ₦80,000/YEAR produces better content.', stars: 5 },
  ]
  
   const STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Syne',system-ui,sans-serif;background:${VOID};color:${TEXT};-webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.7}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${GM}66;border-radius:4px}
        a{text-decoration:none} input,button,select{font-family:inherit}
        @keyframes cp-blink{0%,100%{opacity:1}50%{opacity:.1}}
        @keyframes cp-spin{to{transform:rotate(360deg)}}
        @keyframes cp-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
        @keyframes cp-wa{0%,100%{box-shadow:0 6px 24px rgba(37,211,102,.35)}50%{box-shadow:0 6px 24px rgba(37,211,102,.35),0 0 0 10px rgba(37,211,102,.07)}}
        @keyframes cp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes cp-slide-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        .nav-link:hover{color:${GL}!important}
        .ghost-btn:hover{border-color:${GM}50!important;color:${GL}!important}
        .tool-card:hover{border-color:${GM}40!important;background:rgba(200,136,10,0.04)!important;transform:translateY(-2px)}
        .testi-card:hover{border-color:${GM}35!important;transform:translateY(-3px)}
        /* Responsive */
        @media(max-width:900px){
          .d-nav{display:none!important} .m-ham{display:flex!important}
          .demo-grid{grid-template-columns:1fr!important}
          .price-grid{grid-template-columns:1fr!important}
          .tools-grid{grid-template-columns:1fr 1fr!important}
          .testi-grid{grid-template-columns:1fr!important}
          .proof-grid{grid-template-columns:1fr 1fr!important}
          .how-grid{grid-template-columns:1fr 1fr!important}
          .footer-grid{grid-template-columns:1fr 1fr!important}
          .footer-brand{grid-column:1/-1!important}
          .hero-btns{flex-direction:column!important}
          .hero-btns>a,hero-btns>button{width:100%!important;text-align:center!important;justify-content:center!important}
          .compare-grid{grid-template-columns:1fr!important}
          .coin-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:540px){
          .tools-grid{grid-template-columns:1fr!important}
          .proof-grid{grid-template-columns:1fr 1fr!important}
          .how-grid{grid-template-columns:1fr!important}
          .footer-grid{grid-template-columns:1fr!important}
        }
      `
  return (
    <>
     <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ═══ ANNOUNCE STRIP ═══ */}
      <div style={{ background: `linear-gradient(90deg,${GM}1C,${TEAL}18,${GM}1C)`, borderBottom: `1px solid ${GM}2E`, padding: '10px 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: TL, display: 'inline-block', animation: 'cp-blink 2s ease infinite', flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(205,217,236,0.84)' }}>Founding member pricing — <strong style={{ color: GL }}>₦80,000/year</strong> locks in forever</span>
        <span style={{ background: `${GM}22`, border: `1px solid ${GM}44`, color: GL, fontSize: 11, fontWeight: 700, padding: '2px 12px', borderRadius: 20 }}>🔥 Closes at 1,000 members</span>
      </div>

      {/* ═══ NAV ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,5%,48px)', background: scrolled ? 'rgba(6,8,14,0.97)' : 'rgba(6,8,14,0.88)', backdropFilter: 'blur(24px) saturate(160%)', borderBottom: scrolled ? `1px solid ${GM}28` : '1px solid rgba(255,255,255,0.04)', boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none', transition: 'all .3s' }}>
        <Link href="/" style={{ flexShrink: 0 }}>
          <Image src="/Cerebre_Plus_2.png" alt="Cerebre Plus" width={120} height={58} style={{ objectFit: 'contain', mixBlendMode: 'screen', display: 'block' }} priority />
        </Link>
        <div className="d-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['demo','Live Demo'],['tools','40 Tools'],['pricing','Pricing'],['faq','FAQs']].map(([id, lbl]) => (
            <button key={id} onClick={() => goto(id)} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'rgba(205,217,236,0.62)', fontFamily: 'inherit', transition: 'color .2s' }}>{lbl}</button>
          ))}
        </div>
        <div className="d-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/login" className="ghost-btn" style={{ border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: BRIGHT, fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 8, transition: 'all .2s' }}>Log In</Link>
          <Link href="/signup" style={{ background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 13, padding: '9px 22px', borderRadius: 8 }}>Start Free →</Link>
        </div>
        <button className="m-ham" onClick={() => setMOpen(true)} aria-label="Menu" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
          <span style={{ display: 'block', width: 24, height: 2, background: BRIGHT, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: BRIGHT, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: BRIGHT, borderRadius: 2 }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 950, background: 'rgba(6,8,14,0.99)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, opacity: mOpen ? 1 : 0, pointerEvents: mOpen ? 'auto' : 'none', transition: 'opacity .25s' }}>
        <button onClick={() => setMOpen(false)} style={{ position: 'absolute', top: 24, right: 20, background: 'none', border: 'none', color: BRIGHT, fontSize: 28, cursor: 'pointer' }}>✕</button>
        {[['demo','Live Demo'],['tools','40 Tools'],['pricing','Pricing'],['faq','FAQs']].map(([id, lbl]) => (
          <button key={id} onClick={() => goto(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Georgia',serif", fontSize: 28, fontWeight: 700, color: 'rgba(205,217,236,0.88)' }}>{lbl}</button>
        ))}
        <Link href="/login" onClick={() => setMOpen(false)} style={{ fontSize: 18, color: TEXT }}>Log In</Link>
        <Link href="/signup" onClick={() => setMOpen(false)} style={{ background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 16, padding: '14px 36px', borderRadius: 10 }}>Start Free →</Link>
      </div>

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(120px,14vw,160px) clamp(18px,5%,48px) clamp(64px,8vw,96px)', position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse 130% 80% at 110% -10%,${GOLD}14 0%,transparent 50%),radial-gradient(ellipse 80% 70% at -15% 100%,${TEAL}0D 0%,transparent 50%),linear-gradient(180deg,${VOID} 0%,${INK} 100%)` }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(19,30,56,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(19,30,56,.2) 1px,transparent 1px)`, backgroundSize: '56px 56px' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000 }}>

          {/* Eyebrow */}
          <div style={{ marginBottom: 28 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${TL}0F`, border: `1px solid ${TL}2E`, color: `${TL}EE`, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, padding: '7px 20px', borderRadius: 30 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: TL, animation: 'cp-blink 1.6s ease infinite', display: 'inline-block', flexShrink: 0 }} />
              Africa's AI marketing platform — 40 tools live now
            </span>
          </div>

          {/* Big question hook */}
          <div style={{ marginBottom: 20, fontFamily: "'Georgia',serif", fontSize: 'clamp(14px,2vw,18px)', fontWeight: 400, color: MUTED, fontStyle: 'italic', letterSpacing: '.3px' }}>
            What if everything your competitors pay ₦2,000,000/month for…
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(44px,8.5vw,92px)', fontWeight: 900, lineHeight: .91, color: W, marginBottom: 28 }}>
            …cost you<br />
            <span style={{ color: GL, fontStyle: 'italic' }}>₦80,000</span><br />
            for the whole year.
          </h1>

          {/* Typewriter line */}
          <p style={{ fontSize: 'clamp(16px,2.2vw,20px)', color: 'rgba(205,217,236,0.7)', maxWidth: 640, lineHeight: 1.78, marginBottom: 12 }}>
            Cerebre Plus is the AI marketing system built for{' '}
            <span style={{ color: W, fontWeight: 700, borderBottom: `2px solid ${GM}` }}>
              {typeText}
              {!typeDone && <span style={{ animation: 'cp-blink .7s ease infinite', display: 'inline-block', width: 2, height: '1em', background: GL, verticalAlign: 'middle', marginLeft: 2 }} />}
            </span>
            {typeDone && <span style={{ animation: 'cp-blink .7s ease infinite', display: 'inline-block', width: 2, height: '1em', background: GM, verticalAlign: 'middle', marginLeft: 2 }} />}
          </p>

          {/* Comparison pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: CORAL }}>❌</span>
              <span style={{ color: 'rgba(205,217,236,0.55)' }}>Agency: <strong style={{ color: 'rgba(205,217,236,0.82)' }}>₦300K–₦2M/month</strong></span>
            </div>
            <span style={{ color: GM, fontWeight: 800 }}>→</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: TL }}>✓</span>
              <span style={{ color: 'rgba(205,217,236,0.55)' }}>Cerebre Plus Growth: <strong style={{ color: GL }}>₦80,000/year</strong></span>
            </div>
          </div>

          {/* CTAs */}
          <div className="hero-btns" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 15, padding: '16px 36px', borderRadius: 11 }}>
              Start Free — First Tool On Us →
            </Link>
            <button onClick={() => goto('demo')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: BRIGHT, fontWeight: 700, fontSize: 15, padding: '16px 32px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
              ▶ Watch Live Demo
            </button>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginBottom: 48 }}>
            {['First tool completely free','No credit card required','Cancel anytime','247+ businesses on waitlist'].map(t => <Tick key={t} t={t} />)}
          </div>

          {/* Annual value callout */}
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 14, background: `linear-gradient(135deg,${S1},${S2})`, border: `1px solid ${GM}28`, borderRadius: 16, padding: '18px 24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 28, fontWeight: 900, color: GL }}>₦1,667</div>
              <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginTop: 2 }}>Per month<br />(Starter)</div>
            </div>
            <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 28, fontWeight: 900, color: GL }}>₦6,667</div>
              <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginTop: 2 }}>Per month<br />(Growth)</div>
            </div>
            <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 28, fontWeight: 900, color: CORAL }}>₦300K+</div>
              <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginTop: 2 }}>Per month<br />(Agency)</div>
            </div>
            <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ maxWidth: 200 }}>
              <p style={{ fontSize: 12, color: 'rgba(205,217,236,0.5)', lineHeight: 1.5 }}>The same marketing intelligence, for a fraction of what agencies charge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NUMBERS STRIP ═══ */}
      <section style={{ padding: '40px 0', background: S1, borderTop: `1px solid rgba(255,255,255,0.05)`, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <div style={wrap}>
          <div className="proof-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {[
              { v: '40',     l: 'AI Tools Live',           s: '20+ more launching in 2026' },
              { v: '60s',    l: 'To Your First Output',    s: 'Strategy, caption, ad copy — done' },
              { v: '₦6,667', l: 'Per Month (Growth)',      s: 'vs ₦2M+/month at a top agency' },
              { v: '700',    l: 'Coins (Growth Plan)',      s: '7 full strategies per year or more' },
            ].map((s, i) => (
              <div key={s.l} style={{ padding: '18px 14px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 30, fontWeight: 700, color: GL }}>{s.v}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: BRIGHT, marginTop: 4 }}>{s.l}</div>
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 3 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section id="features" style={sec()}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Ey t="The Real Problem" c={CORAL} />
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
              Every month without a system,<br /><span style={{ color: GL, fontStyle: 'italic' }}>you pay for it twice.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(205,217,236,0.62)', maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>Once in money wasted on marketing that doesn't work. Once in the customers your competitors collect while you're guessing.</p>
          </div>
          <div className="compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { e:'😩', t:'The blank screen every Sunday night',        b:'You know you need to post. You stare at your phone. Nothing comes. An hour passes. You have nothing.',                         c:'Cost: consistency, credibility, customers' },
              { e:'💸', t:'Paying people who disappear with your money', b:'₦80,000 for Facebook ads. 9 likes. 2 comments. No enquiries. A social media manager great month one — then gone.',        c:'Cost: ₦80,000–₦500,000 per month' },
              { e:'🎯', t:'Marketing by instinct, not by system',       b:'You post when you remember. Nothing is connected. Nothing compounds. Every month starts from zero.',                         c:'Cost: growth, scale, and your future' },
              { e:'🌍', t:'Tools built for the wrong market',           b:"Canva, Hootsuite, HubSpot — none of them understand WhatsApp culture, naira pricing, or how Nigerians actually buy.",        c:'Cost: conversion, relevance, trust' },
            ].map(p => (
              <div key={p.t} style={{ background: 'rgba(232,72,48,0.04)', border: '1px solid rgba(232,72,48,0.14)', borderRadius: 14, padding: 24, display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(232,72,48,0.1)', border: '1px solid rgba(232,72,48,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, marginTop: 2 }}>{p.e}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: BRIGHT, marginBottom: 6 }}>{p.t}</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(205,217,236,0.62)', lineHeight: 1.7 }}>{p.b}</div>
                  <span style={{ display: 'inline-block', marginTop: 10, background: 'rgba(232,72,48,0.1)', border: '1px solid rgba(232,72,48,0.2)', color: 'rgba(255,110,90,0.9)', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>{p.c}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tunde / Emeka story */}
          <div style={{ marginTop: 48, background: `linear-gradient(135deg,${S1},${S2})`, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 20, padding: 'clamp(28px,5vw,48px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: 28, fontFamily: "'Georgia',serif", fontSize: 200, color: `${GM}06`, lineHeight: 1, userSelect: 'none' }}>"</div>
            <Ey t="📖 A True Story — Lagos, 2024" />
            <p style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(18px,2.8vw,26px)', fontStyle: 'italic', color: W, lineHeight: 1.55, marginBottom: 22 }}>
              Tunde and Emeka launched their fashion brands the same year, in the same market, with the same quality. Three years later,{' '}
              <span style={{ color: GL, fontStyle: 'normal', fontWeight: 700 }}>Emeka has 38,000 followers and a 3-week waiting list.</span> Tunde has 1,100 followers and is wondering if he should close.
            </p>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', margin: '22px 0' }} />
            <p style={{ fontSize: 15, color: 'rgba(205,217,236,0.72)', lineHeight: 1.85 }}>
              The product was never the difference. <strong style={{ color: W }}>The system was.</strong> Emeka had a content plan. His captions converted. His WhatsApp campaigns went out every Friday. His strategy was connected. Every naira worked.{' '}
              <strong style={{ color: GL }}>Cerebre Plus gives every business Emeka's system — for ₦80,000 a year.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ═══ DEMO ═══ */}
      <DemoSection />

      {/* ═══ TOOLS ═══ */}
      <section id="tools" style={sec()}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Ey t="The Platform" c={TEAL} />
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
              40 tools live.<br /><span style={{ color: GL, fontStyle: 'italic' }}>Zero agency fees.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(205,217,236,0.62)', maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
              Every tool is personalised to your business, industry, and city. Not templates — real marketing built for Nigerian buyers.
            </p>
          </div>
          <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {TOOLS_GRID.map(cat => (
              <div key={cat.cat} className="tool-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 22, transition: 'all .25s', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: TL, display: 'inline-block', animation: 'cp-blink 1.8s ease infinite' }} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: TEAL }}>{cat.cat}</span>
                </div>
                {cat.tools.map(t => (
                  <div key={t} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12.5, color: 'rgba(205,217,236,0.72)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: GL, fontSize: 9 }}>→</span>{t}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, background: `${TEAL}07`, border: `1px dashed ${TEAL}28`, borderRadius: 14, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <span style={{ fontWeight: 700, color: BRIGHT, fontSize: 15 }}>20+ more tools launching in 2026 </span>
              <span style={{ fontSize: 13, color: 'rgba(205,217,236,0.5)' }}>— included in your plan, no extra cost.</span>
            </div>
            <Link href="/signup" style={{ background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 13, padding: '10px 24px', borderRadius: 8 }}>
              Access All 40 Tools Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={sec(INK)}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Ey t="How It Works" c={TEAL} />
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
              First result in<br /><span style={{ color: GL, fontStyle: 'italic' }}>under 5 minutes.</span>
            </h2>
          </div>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { n:'01', e:'📝', t:'Create your free account',    d:'Takes 90 seconds. Your name and email. No card. No obligation.' },
              { n:'02', e:'🏢', t:'Set up your business profile', d:'Tell us your business, industry, and city. The AI personalises every output to your specific context.' },
              { n:'03', e:'⚡', t:'Run your first tool free',     d:'Your first generation is on us. Get a real 90-day strategy for your real business. Spend nothing.' },
              { n:'04', e:'🚀', t:'Publish. Grow. Repeat.',       d:'Copy to Instagram, WhatsApp, or your ads manager. Do it again tomorrow. Build the system your business deserves.' },
            ].map((s, i) => (
              <div key={s.n} style={{ padding: '26px 18px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: 'rgba(255,255,255,0.015)' }}>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 40, color: `${GM}1A`, lineHeight: 1, marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{s.e}</div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: BRIGHT, marginBottom: 8 }}>{s.t}</div>
                <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.7 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ROI CALCULATOR ═══ */}
      <ROICalc />

      {/* ═══ COIN VALUE ═══ */}
      <section style={sec(INK)}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Ey t="How Far Do Your Coins Go?" c={GL} />
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
              700 coins.<br /><span style={{ color: GL, fontStyle: 'italic' }}>A full year of marketing.</span>
            </h2>
          </div>
          <div className="coin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { plan: 'Starter — 150 Coins', c: TL, coins: 150, examples: [
                { label: '1× 90-Day Strategy', coins: 100, desc: 'Complete marketing plan for the year' },
                { label: '3× Caption Packs (15c ea)', coins: 45, desc: 'Creates Instagram content for the month' },
                { label: 'OR 6× WhatsApp Campaigns', coins: 150, desc: 'One full campaign per 2 months' },
                { label: 'OR 10× Content Calendars', coins: 150, desc: 'Never run out of post ideas again' },
              ]},
              { plan: 'Growth — 700 Coins', c: GL, coins: 700, examples: [
                { label: '7× Full 90-Day Strategies', coins: 700, desc: 'A fresh plan every 7 weeks if you want one' },
                { label: '28× WhatsApp Campaigns', coins: 700, desc: 'A new campaign every 2 weeks for a year' },
                { label: '40+ captions or posts/week', coins: 600, desc: 'Full social media coverage, all year' },
                { label: 'Mix and match freely', coins: null, desc: 'Use across all 40 tools however you need' },
              ]},
            ].map(p => (
              <div key={p.plan} style={{ background: `linear-gradient(135deg,${S1},${S2})`, border: `1px solid ${p.c}28`, borderRadius: 18, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 28 }}>🪙</span>
                  <div>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 32, fontWeight: 900, color: p.c, lineHeight: 1 }}>{p.coins}</div>
                    <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1.5px' }}>{p.plan}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {p.examples.map((ex, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      {ex.coins !== null && (
                        <span style={{ background: `${p.c}18`, border: `1px solid ${p.c}30`, color: p.c, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginTop: 2 }}>{ex.coins}c</span>
                      )}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: BRIGHT, marginBottom: 3 }}>{ex.label}</div>
                        <div style={{ fontSize: 12, color: MUTED }}>{ex.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  <Link href={`/signup?plan=${p.plan.toLowerCase().includes('growth') ? 'growth' : 'starter'}`} style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: `${p.c}18`, border: `1px solid ${p.c}30`, color: p.c }}>
                    Start {p.plan.split('—')[0].trim()} Plan →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={sec()}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Ey t="Real Nigerian Businesses · Real Results" />
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
              What happens when<br /><span style={{ color: GL, fontStyle: 'italic' }}>SMEs stop guessing.</span>
            </h2>
          </div>
          <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testi-card" style={{ background: `linear-gradient(135deg,${S1},${S2})`, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, transition: 'all .25s' }}>
                <div style={{ fontSize: 20, color: `${GL}44`, marginBottom: 14, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 15, color: 'rgba(205,217,236,0.84)', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.q}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${GM},${GL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: VOID, flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: BRIGHT }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{t.role} · {t.city}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 13, color: GL }}>{'★'.repeat(t.stars)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={sec(INK)}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Ey t="Simple Annual Pricing · No Hidden Costs" />
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
              One year. One payment.<br /><span style={{ color: GL, fontStyle: 'italic' }}>Every tool unlocked.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(205,217,236,0.62)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
              Pay once per year. Access all 40 tools. No monthly bills, no surprises. The founding member price is locked in for as long as you stay.
            </p>
          </div>
          <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {PLANS.map(plan => (
              <PlanCard key={plan.id} plan={plan} onCta={() => {}} />
            ))}
          </div>
          <div style={{ marginTop: 22, background: `${TEAL}07`, border: `1px solid ${TEAL}18`, borderRadius: 14, padding: '18px 24px', display: 'flex', flexWrap: 'wrap', gap: '8px 24px', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'rgba(205,217,236,0.5)' }}>Compare your alternatives:</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(232,72,48,0.84)' }}>❌ Lagos marketing agency: ₦300,000–₦2,000,000/month</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(232,72,48,0.84)' }}>❌ Marketing manager salary: ₦250,000–₦500,000/month</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: TL }}>✓ Cerebre Plus Growth: ₦80,000/year (₦6,667/month equivalent)</span>
          </div>
        </div>
      </section>

      {/* ═══ SME CLUB SPOTLIGHT ═══ */}
      <section style={sec()}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(18px,5%,48px)' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(200,136,10,0.1),rgba(11,168,144,0.06))', border: `1px solid ${GOLD}30`, borderRadius: 20, padding: 'clamp(32px,5vw,52px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `${GL}06`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 48, flexShrink: 0 }}>🌟</div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <Ey t="Exclusive to Growth Plan" />
                <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: W, lineHeight: 1.05, marginBottom: 16 }}>
                  The SME Club.<br /><span style={{ color: GL, fontStyle: 'italic' }}>Your unfair advantage.</span>
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(205,217,236,0.7)', lineHeight: 1.8, marginBottom: 24, maxWidth: 540 }}>
                  When you join the Growth plan, you don't just get tools. You get a private community of Nigerian business owners who are serious about growth — and direct access to the Cerebre team every single week.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }} className="coin-grid">
                  {[
                    { e: '📱', t: 'Weekly WhatsApp Masterclass', d: 'Every week: one sharp marketing lesson from practitioners who\'ve built revenue for Nigerian brands.' },
                    { e: '👥', t: 'Private SME Community', d: 'A WhatsApp group of Nigerian business owners who share wins, feedback, and hold each other accountable.' },
                    { e: '📰', t: 'Monthly Insider Newsletter', d: 'The marketing playbook your competitors aren\'t reading. Curated strategies, Nigerian case studies, tools.' },
                    { e: '🚀', t: 'Priority Support < 4hrs', d: 'Direct line to the Cerebre team. Monday to Saturday, response in under 4 hours. Not a ticket queue.' },
                  ].map(f => (
                    <div key={f.t} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px' }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{f.e}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: BRIGHT, marginBottom: 6 }}>{f.t}</div>
                      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{f.d}</div>
                    </div>
                  ))}
                </div>
                <Link href="/signup?plan=growth" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 15, padding: '15px 32px', borderRadius: 11 }}>
                  Join the SME Club — ₦80,000/year →
                </Link>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 12 }}>Annual payment. Includes 700 coins, all 40 tools, and every SME Club benefit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GUARANTEE ═══ */}
      <section style={sec(INK)}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(18px,5%,48px)' }}>
          <div style={{ background: 'linear-gradient(160deg,#040800,#0A0C02,#020508)', border: `1px solid ${GM}30`, borderRadius: 20, padding: 'clamp(30px,5vw,52px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${GM},${GL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: `0 0 36px ${GM}44` }}>🛡️</div>
              <div>
                <Ey t="Our Promise To You" />
                <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(22px,3.5vw,34px)', color: W, lineHeight: 1.1 }}>
                  The 30-Day <span style={{ color: GL, fontStyle: 'italic' }}>Money-Back Guarantee</span>
                </h2>
              </div>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(205,217,236,0.7)', lineHeight: 1.85, marginBottom: 22 }}>
              If you subscribe, use the tools for 30 days, and genuinely don't believe it was worth every naira — message us on WhatsApp and we will refund you in full.{' '}
              <strong style={{ color: W }}>No forms. No arguments. No questions.</strong>
            </p>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(15px,2vw,19px)', fontStyle: 'italic', color: 'rgba(205,217,236,0.82)', borderLeft: `3px solid ${GM}`, paddingLeft: 20, lineHeight: 1.6 }}>
              "We built this because we know what good marketing does for a business. If it doesn't work for you, you shouldn't pay for it."
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={sec()}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 clamp(18px,5%,48px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Ey t="Common Questions" />
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: .93, marginBottom: 14 }}>
              You probably want to know<br /><span style={{ color: GL, fontStyle: 'italic' }}>these first.</span>
            </h2>
          </div>
          {[
            { q:'Why is it billed annually, not monthly?', a:'Annual billing lets us offer you a dramatically lower price. The Growth plan at ₦80,000/year works out to ₦6,667/month — a fraction of what any agency charges. Monthly billing would require a much higher price to cover operating costs. This way, you get the best value and we build a sustainable product. Win-win.' },
            { q:'What happens when my 30-day free trial ends?', a:'When your 30-day trial expires, you\'ll no longer be able to access the dashboard or run tools. You\'ll be redirected to the billing page to upgrade to Starter or Growth. Your profile data is saved — the moment you upgrade, you can pick up exactly where you left off.' },
            { q:'Can I top up coins if I run out?', a:'Top-ups are available on the Starter and Growth plans only — not on the free trial. The minimum top-up is 10 coins for ₦5,000 (₦500/coin). Bulk packs offer better rates: 50 coins for ₦20,000 (save 20%), up to 500 coins for ₦150,000 (save 40%). Growth plan users also receive 50 bonus coins every quarter.' },
            { q:'Does the AI know anything about Nigerian business?', a:'This is the whole point of Cerebre Plus. It\'s not a general AI — it\'s calibrated specifically for the African market. It understands WhatsApp culture, naira pricing, how Nigerians research before they buy, which platforms your customers use, and the specific challenges of running an SME in Lagos, Abuja, or Port Harcourt. You set up your business profile once and every tool uses that context.' },
            { q:'What exactly is the SME Club?', a:'The SME Club is an exclusive benefit for Growth plan subscribers. Every week, you receive a WhatsApp marketing masterclass — a practical, actionable lesson from practitioners who have generated real revenue for Nigerian businesses. You also get access to a private community of Nigerian SME owners who share wins, get feedback, and hold each other accountable. Plus a monthly Marketing Insider Newsletter and priority WhatsApp support (under 4-hour response, Monday to Saturday).' },
            { q:'What if I want to cancel?', a:'You can cancel any time from your Billing page. No penalty. No awkward conversation. You keep access until the end of your current annual period. If you cancel within the first 30 days, we\'ll refund you in full. After that, the year continues until the end of your billing cycle.' },
          ].map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: 'clamp(80px,10vw,120px) 0', background: `radial-gradient(ellipse 90% 70% at 50% 110%,${GM}12 0%,transparent 55%),${INK}`, textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(18px,5%,48px)' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${GM}18`, border: `1px solid ${GM}35`, color: GL, fontSize: 11, fontWeight: 700, padding: '6px 18px', borderRadius: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GL, animation: 'cp-blink 1.6s ease infinite', display: 'inline-block' }} />
              Founding member pricing closes at 1,000 subscribers
            </span>
          </div>
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(36px,7vw,76px)', fontWeight: 900, lineHeight: .91, color: W, marginBottom: 18 }}>
            You already have<br />a great business.<br /><em style={{ color: GL }}>Show the world.</em>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(205,217,236,0.65)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 36px' }}>
            Your first tool is completely free. No card required. Run a full 90-day marketing strategy for your real business and see what Cerebre Plus produces — before you spend a single naira.
          </p>
          <div className="hero-btns" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${GM},${GL})`, color: VOID, fontWeight: 800, fontSize: 16, padding: '16px 40px', borderRadius: 11 }}>
              Start Free — First Tool On Us →
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', color: BRIGHT, fontWeight: 700, fontSize: 16, padding: '16px 32px', borderRadius: 11 }}>
              Already a member? Log In
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 22px', marginBottom: 40 }}>
            {['Free to start','No credit card','Founding price locked forever','30-day money-back guarantee'].map(t => <Tick key={t} t={t} sm />)}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '24px 28px', textAlign: 'left', maxWidth: 580, margin: '0 auto' }}>
            <p style={{ fontSize: 13, color: 'rgba(205,217,236,0.48)', fontStyle: 'italic', lineHeight: 1.75, marginBottom: 10 }}>
              <strong style={{ color: 'rgba(205,217,236,0.62)', fontStyle: 'normal' }}>P.S.</strong>{' '}
              The founding member price closes at 1,000 members. If you're still reading this page, you already know this is what your business needs. The only question is whether you act today or wait until the price goes up.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(205,217,236,0.38)', fontStyle: 'italic', lineHeight: 1.75 }}>
              <strong style={{ color: 'rgba(205,217,236,0.48)', fontStyle: 'normal' }}>P.P.S.</strong>{' '}
              Your first tool is free. What do you have to lose?
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: S1, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 60 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(18px,5%,48px)', paddingBottom: 48 }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
            <div className="footer-brand">
              <Image src="/Cerebre_Plus_2.png" alt="Cerebre Plus" width={140} height={68} style={{ objectFit: 'contain', mixBlendMode: 'screen', display: 'block', marginBottom: 8 }} />
              <span style={{ display: 'block', fontSize: 10, color: `${GM}55`, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 14 }}>A product of Cerebre Media Africa</span>
              <p style={{ fontSize: 13.5, color: 'rgba(205,217,236,0.42)', lineHeight: 1.75, maxWidth: 280 }}>Africa's AI-powered marketing platform. 40 tools. Annual pricing. Built for every Nigerian business owner who deserves better.</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {[['#','📸'],['#','🎵'],['#','💼'],['#','✕'],[waHref('Hi! I want to know more about Cerebre Plus.'),'💬']].map(([href, e], i) => (
                  <a key={i} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{e}</a>
                ))}
              </div>
            </div>
            {[
              { t: 'Platform', links: [['/#tools','40 Tools'],['/#pricing','Pricing'],['/#demo','Live Demo'],['/#faq','FAQs'],['/signup','Start Free']] },
              { t: 'Plans',    links: [['/signup','Free Trial'],[ '/signup?plan=starter','Starter — ₦20K/yr'],['/signup?plan=growth','Growth — ₦80K/yr'],['/billing','Billing & Coins'],['/billing','Top-Up Coins']] },
              { t: 'Support',  links: [[ '/login','Log In'],['/signup','Sign Up'],['/#','Help Centre'],[waHref('Hi!'),'WhatsApp Us'],['/#','Privacy Policy']] },
            ].map(col => (
              <div key={col.t}>
                <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' as const, color: 'rgba(205,217,236,0.35)', marginBottom: 18 }}>{col.t}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {col.links.map(([href, lbl]) => (
                    <li key={lbl}><Link href={href} style={{ fontSize: 13.5, color: 'rgba(205,217,236,0.52)' }}>{lbl}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px clamp(18px,5%,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 12, color: 'rgba(205,217,236,0.28)' }}>© 2026 Cerebre Media Africa. All Rights Reserved. Lagos, Nigeria.</span>
          <span style={{ fontSize: 12, color: 'rgba(205,217,236,0.28)' }}>Built with intention for Africa's builders.</span>
        </div>
      </footer>

      {/* WA Float */}
      <a href={waHref("Hi! I want to know more about Cerebre Plus.")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, width: 58, height: 58, borderRadius: '50%', background: `linear-gradient(135deg,${WAD},${WA})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(37,211,102,0.35)', animation: 'cp-wa 3s ease infinite', textDecoration: 'none' }}>
        <WaIcon s={26} />
      </a>
    </>
  )
}
