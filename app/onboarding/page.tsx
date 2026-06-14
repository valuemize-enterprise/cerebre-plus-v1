'use client'
// /app/(auth)/onboarding/page.tsx
// Onboarding with contextual suggestion system.
// Suggestions appear below text fields, pulsing gently to signal they exist.
// Industry-aware: suggestions update the moment the user picks their industry.
// Client-side only — no new API routes, no migrations, no new dependencies.

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { RefreshCw, Check, Sparkles } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const N = '#0B1F3A'
const GOLD = '#E09818'
const GL = '#F5B830'
const TEAL = '#12D4B4'
const W = '#EBF2FC'
const MUTED = 'rgba(205,217,236,0.4)'
const B = 'rgba(255,255,255,0.08)'
const DIM = 'rgba(205,217,236,0.65)'

// ── Constant lists ─────────────────────────────────────────────
const INDUSTRIES = [
  'fashion_clothing', 'food_restaurants', 'beauty_cosmetics', 'technology_software',
  'real_estate', 'education_training', 'logistics_delivery', 'healthcare_wellness',
  'events_entertainment', 'ecommerce_retail', 'finance_fintech', 'other',
]
const INDUSTRY_LABELS: Record<string, string> = {
  fashion_clothing: 'Fashion / Clothing',
  food_restaurants: 'Food & Restaurants',
  beauty_cosmetics: 'Beauty & Cosmetics',
  technology_software: 'Technology / Software',
  real_estate: 'Real Estate',
  education_training: 'Education & Training',
  logistics_delivery: 'Logistics & Delivery',
  healthcare_wellness: 'Healthcare & Wellness',
  events_entertainment: 'Events & Entertainment',
  ecommerce_retail: 'E-commerce / Retail',
  finance_fintech: 'Finance / Fintech',
  other: 'Other',
}
const GOALS = [
  'Get more customers',
  'Improve my content quality',
  'Understand my competitors',
  'Build a stronger brand',
  'Increase revenue / sales',
  'Launch a new product or service',
]
const CHALLENGES = [
  "I don't have time for marketing",
  "I don't know where to start",
  "I can't afford a marketing team",
  "I post but get no engagement",
  "I don't know what my competitors are doing",
  "My branding is inconsistent",
]
const CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu',
  'Owerri', 'Benin City', 'Calabar', 'Warri', 'Akure', 'Asaba',
]

// ── Suggestion data ────────────────────────────────────────────
// All text is Nigerian-market specific. targetCustomers are one-line descriptions
// a user can click to instantly fill that field on their onboarding form.
const INDUSTRY_SUGGESTIONS: Record<string, {
  targetCustomers: string[]
  businessNameHints: string[]
}> = {
  fashion_clothing: {
    targetCustomers: [
      'Lagos women 25–40 seeking premium, locally-made fashion and bespoke styles',
      'Corporate women who need stylish ready-to-wear pieces for work and events',
      'Young professionals who prefer unique handcrafted designs over fast fashion',
      'Brides and bridal parties seeking custom made-in-Nigeria aso-ebi and gowns',
    ],
    businessNameHints: [
      "Amara's Stitch House",
      'Lagos Thread Room',
      'The Style Collective',
      'Chic by Chi Couture',
    ],
  },
  food_restaurants: {
    targetCustomers: [
      'Lagos office workers wanting quality hot lunch delivered within 30 minutes',
      'Families in Abuja seeking authentic Nigerian cuisine for celebrations and events',
      'Young professionals who want healthy, home-cooked meal alternatives on weekdays',
      'Corporate clients who need reliable catering for meetings and company events',
    ],
    businessNameHints: [
      "Mama Ada's Kitchen",
      'The Pepper Spot Abuja',
      'Lagos Bites & Co.',
      'Naija Flavours Catering',
    ],
  },
  beauty_cosmetics: {
    targetCustomers: [
      'Nigerian women 20–40 seeking premium skincare formulated for melanin-rich skin',
      'Working Lagos women who want salon-quality services with shorter wait times',
      'Brides and bridal parties needing complete beauty packages for their big day',
      'Naturalists seeking organic, locally-sourced hair and skin products',
    ],
    businessNameHints: [
      'GlowUp by Chi',
      'The Beauty Bar Lagos',
      'Flawless Skin Studio',
      'Radiance Beauty Abuja',
    ],
  },
  technology_software: {
    targetCustomers: [
      'Nigerian SMEs needing affordable software solutions with local support',
      'Startups in Lagos and Abuja who need solid tech infrastructure from day one',
      'Traditional businesses ready to digitise their operations and go online',
      'Companies needing custom software built specifically for the African market',
    ],
    businessNameHints: [
      'TechBridge Nigeria',
      'Naija Dev Studio',
      'Digital Gate NG',
      'SoftCraft Solutions',
    ],
  },
  real_estate: {
    targetCustomers: [
      'Lagos professionals earning ₦500K+/month looking for their first home purchase',
      'Diaspora Nigerians investing in Lagos and Abuja real estate from abroad',
      'Young couples seeking affordable land plots in emerging satellite towns',
      'Investors seeking short-let property opportunities in Lagos Island or Lekki',
    ],
    businessNameHints: [
      'Lagos Homes Collective',
      'PrimeSpace Properties',
      'Abuja Realty Partners',
      'Capital Land NG',
    ],
  },
  education_training: {
    targetCustomers: [
      'Nigerian youth 18–30 seeking practical, career-ready vocational skills',
      'Working professionals who want to upskill without leaving their day jobs',
      'Business owners wanting industry certifications and structured business training',
      'Parents seeking quality STEM tutoring and after-school programmes for children',
    ],
    businessNameHints: [
      'Naija Skills Academy',
      'The Learning Hub Lagos',
      'Future Builders Institute',
      'Growth Mind School',
    ],
  },
  logistics_delivery: {
    targetCustomers: [
      'Lagos SMEs needing reliable same-day delivery across the island and mainland',
      'E-commerce sellers looking for affordable last-mile delivery partners',
      'Restaurants and food businesses needing fast, professional delivery riders',
      'Businesses needing cargo clearing, forwarding, and warehousing in Nigeria',
    ],
    businessNameHints: [
      'SwiftMove Logistics',
      'Lagos Dispatch Co.',
      'FastLink Delivery NG',
      'Haul Pro Nigeria',
    ],
  },
  healthcare_wellness: {
    targetCustomers: [
      'Lagos residents 30–55 wanting accessible, affordable primary healthcare nearby',
      'Corporate clients seeking HMO packages and employee wellness programmes',
      'Pregnant women and new mothers needing quality maternal health support',
      'Fitness-conscious Nigerians looking for personalised nutrition and wellness coaching',
    ],
    businessNameHints: [
      'WellCare Nigeria',
      'Lagos Health Plus',
      'Vitalis Wellness Centre',
      'Healing Springs Clinic',
    ],
  },
  events_entertainment: {
    targetCustomers: [
      'Lagos professionals planning weddings with budgets from ₦5M upwards',
      'Corporate clients needing professional event management for conferences',
      'Families planning birthday, naming ceremony, and graduation celebrations',
      'Brands seeking creative event activations and experiential marketing',
    ],
    businessNameHints: [
      'Luxe Events Lagos',
      'The Event Studio NG',
      'Grand Occasions Abuja',
      'Prestige Affairs Events',
    ],
  },
  ecommerce_retail: {
    targetCustomers: [
      'Nigerian online shoppers 20–40 who value convenience and fast delivery',
      'Budget-conscious buyers looking for genuine quality at competitive prices',
      'Gift buyers searching for unique, locally-made Nigerian products and crafts',
      'Bulk buyers and resellers sourcing products to sell through their own channels',
    ],
    businessNameHints: [
      'ShopNaija Direct',
      'Quality Finds NG',
      'The Lagos Marketplace',
      'DealsHub Nigeria',
    ],
  },
  finance_fintech: {
    targetCustomers: [
      'Nigerian SMEs needing accessible business loans without traditional collateral',
      'Salary earners wanting investment tools built for the Nigerian economic reality',
      'Students and young professionals building their first savings and investment habits',
      'Businesses needing faster, cheaper cross-border payment and FX solutions',
    ],
    businessNameHints: [
      'MoneyBridge Nigeria',
      'Lagos Capital Finance',
      'WealthNaija Solutions',
      'SmartSave NG',
    ],
  },
  other: {
    targetCustomers: [
      'Nigerian business owners seeking reliable, affordable professional services',
      'Lagos professionals who value quality work and excellent customer care',
      'SMEs across Nigeria looking for solutions that understand the local market',
      'Anyone who has been underserved or overcharged by existing market options',
    ],
    businessNameHints: [
      '[Your Name] & Co.',
      'The [Service] Hub Lagos',
      '[Name] Professional Services',
      'Quality [Service] Nigeria',
    ],
  },
}

// ── SuggestionStrip component ──────────────────────────────────
// Renders below a field when there are relevant suggestions to show.
// The container has a gentle pulsating glow animation — subtle enough
// not to distract, but visible enough to signal the feature exists.
interface SuggestionStripProps {
  suggestions: string[]
  label?: string
  onSelect: (value: string) => void
  visible: boolean
}

function SuggestionStrip({ suggestions, label, onSelect, visible }: SuggestionStripProps) {
  const [justApplied, setJustApplied] = useState<string | null>(null)

  const handleSelect = (s: string) => {
    onSelect(s)
    setJustApplied(s)
    setTimeout(() => setJustApplied(null), 1500)
  }

  if (!visible || suggestions.length === 0) return null

  return (
    <div style={{
      marginTop: 8,
      padding: '12px 14px',
      borderRadius: 12,
      border: '1px solid rgba(18,212,180,0.22)',
      background: 'rgba(18,212,180,0.04)',
      // Pulsating animation applied to the container
      animation: 'suggestionPulse 3s ease-in-out infinite',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 9 }}>
        <Sparkles size={11} style={{ color: TEAL, flexShrink: 0 }} />
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: TEAL,
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>
          {label || 'Suggestions — tap to fill'}
        </span>
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {suggestions.map((s, i) => {
          const applied = justApplied === s
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.18s',
                background: applied ? 'rgba(34,197,94,0.14)' : 'rgba(18,212,180,0.1)',
                border: `1px solid ${applied ? 'rgba(34,197,94,0.4)' : 'rgba(18,212,180,0.28)'}`,
                color: applied ? '#22C55E' : TEAL,
              }}
              onMouseEnter={e => {
                if (!applied) {
                  ; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(18,212,180,0.18)'
                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(18,212,180,0.5)'
                }
              }}
              onMouseLeave={e => {
                if (!applied) {
                  ; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(18,212,180,0.1)'
                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(18,212,180,0.28)'
                }
              }}
            >
              {applied ? '✓ Applied' : s}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── City quick-select strip (distinct visual — amber accent) ───
interface CityStripProps {
  onSelect: (city: string) => void
  visible: boolean
  currentValue: string
}

function CityStrip({ onSelect, visible, currentValue }: CityStripProps) {
  if (!visible) return null
  return (
    <div style={{
      marginTop: 8,
      padding: '10px 12px',
      borderRadius: 10,
      border: '1px solid rgba(245,184,48,0.2)',
      background: 'rgba(245,184,48,0.04)',
      animation: 'suggestionPulse 3s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
        <span style={{ fontSize: 11 }}>📍</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: GL, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Quick select
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {CITIES.map(city => (
          <button
            key={city}
            type="button"
            onClick={() => onSelect(city)}
            style={{
              padding: '4px 11px', borderRadius: 16, fontSize: 12,
              fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s',
              background: currentValue === city ? 'rgba(245,184,48,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${currentValue === city ? 'rgba(245,184,48,0.5)' : B}`,
              color: currentValue === city ? GL : MUTED,
              fontWeight: currentValue === city ? 700 : 400,
            }}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main onboarding page ───────────────────────────────────────
interface FormState {
  businessName: string
  industry: string
  city: string
  targetCustomers: string
  primaryGoal: string
  primaryChallenge: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [step, setStep] = useState(0)
  const [d, setD] = useState<FormState>({
    businessName: '', industry: '', city: '',
    targetCustomers: '', primaryGoal: '', primaryChallenge: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Pre-fill business name from signup session storage
  useEffect(() => {
    const biz = sessionStorage.getItem('signup_bizname')
    if (biz) setD(p => ({ ...p, businessName: biz }))
  }, [])

  const set = useCallback((k: keyof FormState, v: string) =>
    setD(p => ({ ...p, [k]: v })), [])

  // ── Suggestion visibility logic ──
  const sug = INDUSTRY_SUGGESTIONS[d.industry] || null

  // Show name hints: industry is selected AND field is empty or very short
  const showNameHints = !!sug && d.businessName.length < 4 && (focusedField === 'businessName' || d.businessName === '')

  // Show target customer suggestions: industry selected AND field under 25 chars
  const showTargetSugs = !!sug && d.targetCustomers.length < 25 &&
    (focusedField === 'targetCustomers' || d.targetCustomers.length === 0)

  // Show cities: field has < 3 chars or is focused
  const showCities = d.city.length < 3 || focusedField === 'city'

  // ── Validation ──
  const isValid = () => {
    if (step === 0) return d.businessName.trim() && d.industry && d.city.trim()
    if (step === 1) return d.primaryGoal && d.primaryChallenge
    return true
  }

  const handleGetReward = async () => {
    try {
      const res = await fetch('/api/coins/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'onboarding_complete' }),
      })// check this first

      if (!res.ok) {
        const errorText = await res.text()
        console.error('[onboarding reward] error response:', errorText)
        return
      }

      const data = await res.json()
    } catch (err) {
      console.error('[onboarding reward] failed:', err)
    }
  }

  // ── Save + complete ──
  const saveAndFinish = async () => {
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error: e } = await supabase.from('profiles').update({
        business_name: d.businessName.trim(),
        industry: d.industry,
        city: d.city.trim(),
        target_customers: d.targetCustomers.trim(),
        primary_goal: d.primaryGoal,
        primary_challenge: d.primaryChallenge,
        onboarding_complete: true,
      }).eq('id', user.id)
      if (e) throw new Error(e.message)
      setStep(2)
      handleGetReward()
      setTimeout(() => router.push('/dashboard'), 2200)
    } catch (err: any) {
      setError(err.message || 'Save failed. Please try again.')
      setSaving(false)
    }
  }

  const next = () => {
    if (step === 1) saveAndFinish()
    else setStep(s => s + 1)
  }

  // ── Shared input style ──
  const inputStyle = (focused = false): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: `1.5px solid ${focused ? TEAL + '55' : B}`,
    borderRadius: 10,
    color: W,
    fontFamily: 'inherit',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .18s',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: MUTED,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: 7,
  }

  // ── Render ──
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080F1F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
    }}>
      {/* Global animation keyframes */}
      <style>{`
        @keyframes suggestionPulse {
          0%, 100% {
            border-color: rgba(18,212,180,0.15);
            box-shadow: 0 0 0 0 rgba(18,212,180,0);
          }
          50% {
            border-color: rgba(18,212,180,0.38);
            box-shadow: 0 0 0 5px rgba(18,212,180,0.04);
          }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: W, letterSpacing: 2 }}>CEREBRE</span>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: GL, letterSpacing: 2 }}> PLUS</span>
        </div>

        {/* Step progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 24 }}>
          {['Business', 'Your Goals', 'Done!'].map((label, i) => (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i < step ? TEAL : i === step ? `linear-gradient(135deg,${GOLD},${GL})` : B,
                  border: `2px solid ${i < step ? TEAL : i === step ? GL : B}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900,
                  color: i < step ? '#fff' : i === step ? '#071528' : MUTED,
                  transition: 'all .3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === step ? GL : i < step ? TEAL : MUTED, fontWeight: i === step ? 700 : 400 }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 1.5, background: i < step ? TEAL + '50' : B, margin: '0 6px 14px', transition: 'background .3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: N, border: `1px solid ${B}`, borderRadius: 18, padding: '28px 26px' }}>

          {/* ─────── STEP 2: Done ─────── */}
          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeIn .4s ease' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.14)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={26} style={{ color: '#22C55E' }} />
              </div>
              <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: W, marginBottom: 8 }}>Welcome to Cerebre Plus!</h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>
                Your account is ready. Taking you to your dashboard — your first free tool is waiting there for you.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, color: TEAL, fontSize: 13 }}>
                <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                Going to dashboard…
              </div>
            </div>
          )}

          {/* ─────── STEP 0: Business Details ─────── */}
          {step === 0 && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color: W, marginBottom: 6 }}>
                Set up your business
              </h2>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 22, fontStyle: 'italic' }}>
                Takes under 2 minutes. Every Cerebre Plus tool uses this to personalise your results.
              </p>


              {/* Industry */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Industry <span style={{ color: GOLD }}>*</span></label>
                <select
                  value={d.industry}
                  onChange={e => set('industry', e.target.value)}
                  style={{ ...inputStyle(), color: d.industry ? W : MUTED, cursor: 'pointer' }}
                >
                  <option value="">Select your industry…</option>
                  {INDUSTRIES.map(id => (
                    <option key={id} className='bg-black' value={id}>{INDUSTRY_LABELS[id]}</option>
                  ))}
                </select>
                {/* Inline industry hint appears right after selecting */}
                {d.industry && (
                  <p style={{ fontSize: 11.5, color: TEAL, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>✦</span>
                    Suggestions for {INDUSTRY_LABELS[d.industry]} businesses are now active below.
                  </p>
                )}
              </div>

              {/* Business name */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Business name <span style={{ color: GOLD }}>*</span></label>
                <input
                  type="text"
                  value={d.businessName}
                  onChange={e => set('businessName', e.target.value)}
                  onFocus={() => setFocusedField('businessName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Amara's Fashion House"
                  style={inputStyle(focusedField === 'businessName')}
                />
                {/* Business name hints — only shown when industry is selected */}
                {showNameHints && sug && (
                  <SuggestionStrip
                    suggestions={sug.businessNameHints}
                    label="Example business names for your industry"
                    onSelect={v => set('businessName', v)}
                    visible
                  />
                )}
              </div>



              {/* City */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>City / Location <span style={{ color: GOLD }}>*</span></label>
                <input
                  type="text"
                  value={d.city}
                  onChange={e => set('city', e.target.value)}
                  onFocus={() => setFocusedField('city')}
                  onBlur={() => setTimeout(() => setFocusedField(f => f === 'city' ? null : f), 200)}
                  placeholder="e.g. Lagos"
                  style={inputStyle(focusedField === 'city')}
                />
                <CityStrip
                  visible={showCities}
                  currentValue={d.city}
                  onSelect={v => { set('city', v); setFocusedField(null) }}
                />
              </div>

              {/* Target customers */}
              <div style={{ marginBottom: 4 }}>
                <label style={labelStyle}>
                  Who are your customers?
                  <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>(optional — improves every tool)</span>
                </label>
                <textarea
                  value={d.targetCustomers}
                  onChange={e => set('targetCustomers', e.target.value)}
                  onFocus={() => setFocusedField('targetCustomers')}
                  onBlur={() => setTimeout(() => setFocusedField(f => f === 'targetCustomers' ? null : f), 200)}
                  rows={2}
                  placeholder={
                    d.industry
                      ? 'Tap a suggestion below, or describe in your own words…'
                      : 'e.g. Nigerian women 25–40 who value premium quality fashion'
                  }
                  style={{ ...inputStyle(focusedField === 'targetCustomers'), resize: 'vertical' as const, lineHeight: 1.6 }}
                />
                {/* Customer suggestions — the most impactful suggestions in the whole form */}
                {showTargetSugs && sug && (
                  <SuggestionStrip
                    suggestions={sug.targetCustomers}
                    label={d.industry ? `Ideas for ${INDUSTRY_LABELS[d.industry]} businesses` : 'Suggestions'}
                    onSelect={v => set('targetCustomers', v)}
                    visible
                  />
                )}
              </div>
            </div>
          )}

          {/* ─────── STEP 1: Goals & Challenges ─────── */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color: W, marginBottom: 6 }}>
                What are you trying to achieve?
              </h2>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, fontStyle: 'italic' }}>
                We use this to prioritise the tools that matter most for your situation.
              </p>

              {/* Primary goal */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Primary goal <span style={{ color: GOLD }}>*</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {GOALS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set('primaryGoal', g)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: d.primaryGoal === g ? 700 : 500,
                        cursor: 'pointer',
                        background: d.primaryGoal === g ? `${GL}15` : B,
                        border: `1.5px solid ${d.primaryGoal === g ? GL + '50' : B}`,
                        color: d.primaryGoal === g ? GL : MUTED,
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all .15s',
                      }}
                    >
                      {d.primaryGoal === g && <Check size={13} style={{ color: GL, flexShrink: 0 }} />}
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary challenge */}
              <div>
                <label style={labelStyle}>Biggest marketing challenge <span style={{ color: GOLD }}>*</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {CHALLENGES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('primaryChallenge', c)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: d.primaryChallenge === c ? 700 : 500,
                        cursor: 'pointer',
                        background: d.primaryChallenge === c ? 'rgba(18,212,180,0.1)' : B,
                        border: `1.5px solid ${d.primaryChallenge === c ? TEAL + '40' : B}`,
                        color: d.primaryChallenge === c ? TEAL : MUTED,
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all .15s',
                      }}
                    >
                      {d.primaryChallenge === c && <Check size={13} style={{ color: TEAL, flexShrink: 0 }} />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginTop: 14, fontSize: 13, color: '#FCA5A5' }}>
              {error}
            </div>
          )}

          {/* Navigation button */}
          {step < 2 && (
            <button
              onClick={next}
              disabled={!isValid() || saving}
              style={{
                width: '100%',
                marginTop: step === 0 ? 20 : 20,
                padding: '14px',
                borderRadius: 12,
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: 15,
                background: !isValid() || saving
                  ? B
                  : `linear-gradient(135deg,${GOLD},${GL})`,
                border: `1px solid ${!isValid() || saving ? B : GOLD + '50'}`,
                color: !isValid() || saving ? MUTED : '#071528',
                cursor: !isValid() || saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all .2s',
              }}
            >
              {saving
                ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />Saving…</>
                : step === 1
                  ? 'Finish & go to dashboard →'
                  : 'Continue →'
              }
            </button>
          )}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(107,132,160,0.4)', marginTop: 14 }}>
          No tool runs during setup · All details can be updated later in your profile
        </p>

      </div>
    </div>
  )
}
