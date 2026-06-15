'use client'
// /app/(auth)/onboarding/page.tsx
// Redesigned onboarding — collects 100% of business profile data.
// 3 steps + done screen. Suggestions on every field. Mobile-first.
// Data saved to all profile columns so the profile page is pre-filled.

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { RefreshCw, Check, Sparkles, ChevronRight } from 'lucide-react'
import { SuggestionStrip, CitySuggestions } from '@/components/tools/SuggestionStrip'
import { getFieldSuggestions } from '@/lib/tools/form-suggestions'


// ── Tokens ─────────────────────────────────────────────────────
const N = '#0B1F3A'
const N2 = '#0D2040'
const GOLD = '#E09818'
const GL = '#F5B830'
const TEAL = '#12D4B4'
const W = '#EBF2FC'
const DIM = 'rgba(205,217,236,0.65)'
const MUTED = 'rgba(205,217,236,0.38)'
const B = 'rgba(255,255,255,0.08)'
const FAINT = 'rgba(255,255,255,0.04)'

// ── Static data ─────────────────────────────────────────────────
const INDUSTRIES = [
  { value: 'fashion_clothing', label: 'Fashion / Clothing' },
  { value: 'food_restaurants', label: 'Food & Restaurants' },
  { value: 'beauty_cosmetics', label: 'Beauty & Cosmetics' },
  { value: 'technology_software', label: 'Technology / Software' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'education_training', label: 'Education & Training' },
  { value: 'logistics_delivery', label: 'Logistics & Delivery' },
  { value: 'healthcare_wellness', label: 'Healthcare & Wellness' },
  { value: 'events_entertainment', label: 'Events & Entertainment' },
  { value: 'ecommerce_retail', label: 'E-commerce / Retail' },
  { value: 'finance_fintech', label: 'Finance / Fintech' },
  { value: 'other', label: 'Other' },
]

const BRAND_VOICES = [
  { value: 'professional', label: 'Professional', sub: 'Authoritative, clear, credible' },
  { value: 'warm_friendly', label: 'Warm & Friendly', sub: 'Approachable, caring, relatable' },
  { value: 'bold_direct', label: 'Bold & Direct', sub: 'Confident, no-nonsense, powerful' },
  { value: 'educational', label: 'Educational', sub: 'Informative, expert, helpful' },
  { value: 'playful_energetic', label: 'Playful', sub: 'Fun, energetic, youthful' },
  { value: 'luxury_premium', label: 'Luxury', sub: 'Exclusive, sophisticated, premium' },
  { value: 'community_local', label: 'Community', sub: 'Local, grounded, people-first' },
]

const CHALLENGES = [
  'Not generating enough leads',
  'Converting enquiries to sales',
  'Standing out from competitors',
  'Social media content not working',
  'Low ad ROI / wasted spend',
  'Building brand trust',
  'Creating consistent content',
  'WhatsApp marketing effectiveness',
  'Customer retention & repeat business',
  'No clear marketing strategy',
]

// ── Text input component ────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, required, hint, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; hint?: string; type?: string
}) {
  const [focused, setFocused] = useState(false)
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px', fontSize: 14, fontFamily: 'inherit',
    background: focused ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
    border: `1.5px solid ${focused ? TEAL + '55' : B}`,
    borderRadius: 11, color: W, outline: 'none', transition: 'all .18s',
    boxSizing: 'border-box',
  }
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}{required && <span style={{ color: GOLD, marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle}
      />
      {hint && <p style={{ fontSize: 11.5, color: MUTED, marginTop: 5, fontStyle: 'italic' }}>{hint}</p>}
    </div>
  )
}

function TextArea({
  label, value, onChange, placeholder, required, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}{required && <span style={{ color: GOLD, marginLeft: 3 }}>*</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '13px 14px', fontSize: 14, fontFamily: 'inherit',
          background: focused ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${focused ? TEAL + '55' : B}`,
          borderRadius: 11, color: W, outline: 'none', resize: 'vertical',
          lineHeight: 1.65, transition: 'all .18s', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ── Step header pill ────────────────────────────────────────────
function StepHeader({ step, total, label, icon }: { step: number; total: number; label: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 10.5, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
          Step {step} of {total}
        </p>
        <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 18, fontWeight: 900, color: W, margin: 0 }}>{label}</h2>
      </div>
    </div>
  )
}

// ── Progress dots ───────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 24 : 8, height: 8, borderRadius: 4,
          background: i < current ? TEAL : i === current ? GOLD : 'rgba(255,255,255,0.15)',
          transition: 'all .3s',
        }} />
      ))}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────
interface FormData {
  business_name: string
  industry: string
  city: string
  years_in_business: string
  whatsapp: string
  description: string
  target_customer: string
  unique_advantage: string
  social_proof: string
  price_range: string
  call_to_action: string
  brand_voice: string
  marketing_challenges: string[]
}

const EMPTY: FormData = {
  business_name: '', industry: '', city: '', years_in_business: '', whatsapp: '',
  description: '', target_customer: '', unique_advantage: '', social_proof: '',
  price_range: '', call_to_action: '', brand_voice: '', marketing_challenges: [],
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [step, setStep] = useState(0)   // 0,1,2 = 3 form steps; 3 = done
  const [form, setForm] = useState<FormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  // Pre-fill business name from signup session storage
  useEffect(() => {
    const biz = sessionStorage.getItem('signup_bizname')
    if (biz) setForm(p => ({ ...p, business_name: biz }))
  }, [])

  const set = useCallback((k: keyof FormData, v: any) =>
    setForm(p => ({ ...p, [k]: v })), [])

  // Scroll card to top on step change (mobile UX)
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  // Profile context for suggestion engine
  const profileCtx = {
    businessName: form.business_name,
    industry: form.industry,
    city: form.city,
    targetCustomer: form.target_customer,
    description: form.description,
    uniqueAdvantage: form.unique_advantage,
  }

  // Smart suggestion helper — returns 3 chips relevant to the field
  const sug = (fieldId: string, fieldLabel: string) =>
    getFieldSuggestions(fieldId, fieldLabel, profileCtx)

  // ── Validation per step ──────────────────────────────────────
  const stepValid = () => {
    if (step === 0) return form.business_name.trim() && form.industry && form.city.trim()
    if (step === 1) return form.description.trim() && form.target_customer.trim()
    if (step === 2) return form.brand_voice && form.marketing_challenges.length > 0
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


  async function sendWelcomeEmail(firstName: string) {
    try {
      const res = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName }),
      });

      const data = await res.json()
    } catch (err) {
      console.error('[onboarding reward] failed:', err)
    }
  }


  // ── Toggle marketing challenge ───────────────────────────────
  const toggleChallenge = (c: string) =>
    set('marketing_challenges', form.marketing_challenges.includes(c)
      ? form.marketing_challenges.filter(x => x !== c)
      : [...form.marketing_challenges, c])

  // ── Save all data to Supabase profiles table ─────────────────
  const saveAndFinish = async () => {
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const firstName = form.business_name.trim()

      const { error: e } = await supabase.from('profiles').update({
        business_name: form.business_name.trim(),
        industry: form.industry,
        city: form.city.trim(),
        years_in_business: form.years_in_business ? parseInt(form.years_in_business) : null,
        whatsapp: form.whatsapp.trim(),
        description: form.description.trim(),
        target_customer: form.target_customer.trim(),
        unique_advantage: form.unique_advantage.trim(),
        social_proof: form.social_proof.trim(),
        price_range: form.price_range.trim(),
        primary_cta: form.call_to_action.trim(),
        brand_voice: form.brand_voice,
        marketing_challenges: form.marketing_challenges,
        primary_goal: null,    // captured via challenges
        primary_challenge: form.marketing_challenges[0] || null,
        target_customers: form.target_customer.trim(),
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)

      if (e) throw new Error(e.message)
      setStep(3)
      handleGetReward()
      sendWelcomeEmail(firstName)
      setTimeout(() => router.push('/dashboard'), 2200)
    } catch (err: any) {
      setError(err.message || 'Save failed. Please try again.')
      setSaving(false)
    }
  }

  const next = () => {
    if (step === 2) saveAndFinish()
    else setStep(s => s + 1)
  }
  const back = () => setStep(s => s - 1)

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#080F1F',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 48px',
    }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:translateY(0) } }
        @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @media(max-width:480px){ .onb-inner{ padding:20px 16px !important } }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: W, letterSpacing: 2 }}>CEREBRE</span>
        <span style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: GL, letterSpacing: 2 }}> PLUS</span>
      </div>

      {/* Progress dots (only on form steps) */}
      {step < 3 && <ProgressDots current={step} total={3} />}

      {/* Main card */}
      <div
        ref={cardRef}
        className="onb-inner"
        style={{
          width: '100%', maxWidth: 520, background: N,
          border: `1px solid ${B}`, borderRadius: 20,
          padding: '28px 26px',
          animation: 'fadeUp .4s ease',
        }}
      >

        {/* ── DONE SCREEN ────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'checkPop .5s cubic-bezier(.17,.67,.83,.67)',
            }}>
              <Check size={30} style={{ color: '#22C55E' }} />
            </div>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: W, marginBottom: 10 }}>
              You're all set!
            </h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 20 }}>
              Your business profile is saved. Every tool on Cerebre Plus will now produce output tailored specifically to{' '}
              <strong style={{ color: DIM }}>{form.business_name || 'your business'}</strong>.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: TEAL, fontSize: 13 }}>
              <RefreshCw size={13} style={{ animation: 'spin .8s linear infinite' }} />
              Taking you to your dashboard…
            </div>
          </div>
        )}

        {/* ── STEP 0: Your Business ───────────────────────────── */}
        {step === 0 && (
          <>
            <StepHeader step={1} total={3} icon="🏢" label="Your Business" />

            <Field
              label="Business name" required
              value={form.business_name}
              onChange={v => set('business_name', v)}
              placeholder="e.g. Amara's Fashion House"
            />
            <SuggestionStrip
              suggestions={sug('businessNameHints', 'Business name examples')}
              label={form.industry ? `Names for ${INDUSTRIES.find(i => i.value === form.industry)?.label} businesses` : 'Example business names'}
              onSelect={v => set('business_name', v)}
              visible={form.business_name.length < 4 && !!form.industry}
            />

            <div style={{ height: 14 }} />

            <div style={{ marginBottom: 6 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
                Industry <span style={{ color: GOLD }}>*</span>
              </label>
              <select
                value={form.industry}
                onChange={e => set('industry', e.target.value)}
                style={{
                  width: '100%', padding: '13px 14px', fontSize: 14, fontFamily: 'inherit',
                  background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${B}`,
                  borderRadius: 11, color: form.industry ? W : MUTED, outline: 'none',
                  cursor: 'pointer', boxSizing: 'border-box', transition: 'all .18s',
                }}
              >
                <option value="">Select your industry…</option>
                {INDUSTRIES.map(i => <option className='bg-black' key={i.value} value={i.value}>{i.label}</option>)}
              </select>
              {form.industry && (
                <p style={{ fontSize: 11.5, color: TEAL, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={11} />
                  Suggestions are now personalised for {INDUSTRIES.find(i => i.value === form.industry)?.label} businesses
                </p>
              )}
            </div>

            <div style={{ height: 14 }} />

            <Field
              label="City / Location" required
              value={form.city}
              onChange={v => set('city', v)}
              placeholder="e.g. Lagos"
            />
            <CitySuggestions
              currentValue={form.city}
              onSelect={v => set('city', v)}
              visible={form.city.length < 3}
            />

            <div style={{ height: 14 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                label="Years in business"
                value={form.years_in_business}
                onChange={v => set('years_in_business', v)}
                placeholder="e.g. 3"
                type="number"
                hint="Optional"
              />
              <Field
                label="WhatsApp number"
                value={form.whatsapp}
                onChange={v => set('whatsapp', v)}
                placeholder="e.g. 08091234567"
                hint="Optional"
              />
            </div>
          </>
        )}

        {/* ── STEP 1: Your Brand Story ─────────────────────────── */}
        {step === 1 && (
          <>
            <StepHeader step={2} total={3} icon="✍" label={`Tell us about ${form.business_name || 'your business'}`} />

            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.6, fontStyle: 'italic' }}>
              Tap any suggestion to fill the field instantly. These will make every tool output sound like it was written just for {form.business_name || 'you'}.
            </p>

            {/* Description */}
            <TextArea
              label="What does your business do?" required rows={3}
              value={form.description}
              onChange={v => set('description', v)}
              placeholder="Describe what you do, who you serve, and what makes your service stand out. 2–3 sentences is perfect."
            />
            <SuggestionStrip
              suggestions={sug('description', 'What does your business do?')}
              label="Tap to fill — edit to make it yours"
              onSelect={v => set('description', v)}
              visible={form.description.length < 30}
            />

            <div style={{ height: 16 }} />

            {/* Target customer */}
            <TextArea
              label="Who are your customers?" required rows={2}
              value={form.target_customer}
              onChange={v => set('target_customer', v)}
              placeholder="Describe your ideal customer — age, location, what they need, what they value."
            />
            <SuggestionStrip
              suggestions={sug('target_customer', 'Who are your customers?')}
              label="Customer profiles for your industry"
              onSelect={v => set('target_customer', v)}
              visible={form.target_customer.length < 25}
            />

            <div style={{ height: 16 }} />

            {/* Unique advantage */}
            <TextArea
              label="What makes you different?" required rows={2}
              value={form.unique_advantage}
              onChange={v => set('unique_advantage', v)}
              placeholder="Your competitive edge — what can you do that others can't? Speed, price, quality, expertise?"
            />
            <SuggestionStrip
              suggestions={sug('unique_advantage', 'What makes you different?')}
              label="Differentiators that work for your industry"
              onSelect={v => set('unique_advantage', v)}
              visible={form.unique_advantage.length < 25}
            />

            <div style={{ height: 16 }} />

            {/* Social proof */}
            <Field
              label="Your key achievement or social proof"
              value={form.social_proof}
              onChange={v => set('social_proof', v)}
              placeholder="e.g. '500+ clients served since 2021' or '4.9/5 rating from 300 reviews'"
              hint="Optional — used in copy and ad tools for maximum credibility"
            />
            <SuggestionStrip
              suggestions={sug('social_proof', 'Key achievement or social proof')}
              label="Achievement examples for your industry"
              onSelect={v => set('social_proof', v)}
              visible={form.social_proof.length < 15}
            />

            <div style={{ height: 16 }} />

            {/* Price range */}
            <Field
              label="Your typical price range"
              value={form.price_range}
              onChange={v => set('price_range', v)}
              placeholder="e.g. 'Services from ₦15,000 · Premium from ₦80,000'"
              hint="Optional — prevents ad tools from attracting the wrong audience"
            />
            <SuggestionStrip
              suggestions={sug('price_range', 'Your typical price range')}
              label="Pricing examples for your industry"
              onSelect={v => set('price_range', v)}
              visible={form.price_range.length < 10}
            />

            <div style={{ height: 16 }} />

            {/* Call to action */}
            <Field
              label="How do customers take action?"
              value={form.call_to_action}
              onChange={v => set('call_to_action', v)}
              placeholder="e.g. 'Send us a WhatsApp message' or 'Book a free consultation'"
              hint="Optional — used as the CTA in every ad, post, and email"
            />
            <SuggestionStrip
              suggestions={sug('call_to_action', 'How do customers take action?')}
              label="CTAs that work for your industry"
              onSelect={v => set('call_to_action', v)}
              visible={form.call_to_action.length < 10}
            />
          </>
        )}

        {/* ── STEP 2: Voice & Challenges ───────────────────────── */}
        {step === 2 && (
          <>
            <StepHeader step={3} total={3} icon="🎯" label="Your voice and goals" />

            {/* Brand voice */}
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>
              How does your brand speak? <span style={{ color: GOLD }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
              {BRAND_VOICES.map(v => {
                const selected = form.brand_voice === v.value
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => set('brand_voice', v.value)}
                    style={{
                      padding: '12px 14px', borderRadius: 12, fontFamily: 'inherit',
                      textAlign: 'left', cursor: 'pointer', transition: 'all .15s',
                      background: selected ? `${TEAL}15` : FAINT,
                      border: `1.5px solid ${selected ? TEAL + '50' : B}`,
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: selected ? TEAL : DIM, margin: '0 0 3px' }}>
                      {selected && '✓ '}{v.label}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{v.sub}</p>
                  </button>
                )
              })}
            </div>

            {/* Marketing challenges */}
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
              Biggest marketing challenges <span style={{ color: GOLD }}>*</span>
            </label>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, fontStyle: 'italic' }}>
              Select all that apply — these help us prioritise the right tools for you.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CHALLENGES.map(c => {
                const sel = form.marketing_challenges.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChallenge(c)}
                    style={{
                      padding: '8px 14px', borderRadius: 20, fontFamily: 'inherit',
                      fontSize: 12.5, fontWeight: sel ? 700 : 500, cursor: 'pointer', transition: 'all .15s',
                      background: sel ? `${GOLD}18` : FAINT,
                      border: `1.5px solid ${sel ? GOLD + '50' : B}`,
                      color: sel ? GL : MUTED,
                    }}
                  >
                    {sel && '✓ '}{c}
                  </button>
                )
              })}
            </div>
            {form.marketing_challenges.length > 0 && (
              <p style={{ fontSize: 11.5, color: TEAL, marginTop: 10 }}>
                ✦ {form.marketing_challenges.length} challenge{form.marketing_challenges.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </>
        )}

        {/* ── Error ───────────────────────────────────────────── */}
        {error && step < 3 && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginTop: 14, fontSize: 13, color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────── */}
        {step < 3 && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={next}
              disabled={!stepValid() || saving}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, fontFamily: 'inherit',
                fontWeight: 800, fontSize: 15, cursor: !stepValid() || saving ? 'not-allowed' : 'pointer',
                background: !stepValid() || saving ? FAINT : `linear-gradient(135deg,${GOLD},${GL})`,
                border: `1px solid ${!stepValid() || saving ? B : GOLD + '50'}`,
                color: !stepValid() || saving ? MUTED : '#071528',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .2s',
              }}
            >
              {saving
                ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Saving your profile…</>
                : step === 2
                  ? <><Check size={14} />Finish & open dashboard →</>
                  : <>Continue <ChevronRight size={14} /></>
              }
            </button>

            {step > 0 && (
              <button
                onClick={back}
                disabled={saving}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: MUTED, fontFamily: 'inherit', padding: '4px' }}
              >
                ← Back
              </button>
            )}

            {step === 0 && (
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(107,132,160,0.45)', margin: 0 }}>
                Takes about 3 minutes · All details can be updated later
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
