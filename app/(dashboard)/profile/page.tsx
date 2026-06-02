'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/profile/page.tsx
// Business profile — the brain of every Cerebre Plus tool output.
// Completeness directly determines output quality.
// Mobile-first, section-by-section, auto-save on blur.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, AlertCircle, Upload,
  Save, Sparkles, ChevronRight, Info,
  Building2, Target, Palette, Globe, Phone,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'
import { INDUSTRY_CATEGORIES } from '@/lib/onboarding/business-intelligence'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

// ─────────────────────────────────────────────────────────────
// FIELD DEFINITIONS
// ─────────────────────────────────────────────────────────────

const BRAND_VOICES = [
  { value: 'professional', label: 'Professional & authoritative' },
  { value: 'warm_friendly', label: 'Warm & friendly' },
  { value: 'bold_direct', label: 'Bold & direct' },
  { value: 'educational', label: 'Educational & informative' },
  { value: 'playful_energetic', label: 'Playful & energetic' },
  { value: 'luxury_premium', label: 'Luxury & premium' },
  { value: 'community_local', label: 'Community-focused & local' },
]

const NIGERIAN_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu',
  'Benin City', 'Kaduna', 'Warri', 'Aba', 'Onitsha', 'Ilorin',
  'Abeokuta', 'Calabar', 'Jos', 'Maiduguri', 'Zaria', 'Uyo',
  'Owerri', 'Asaba', 'Akure', 'Sokoto', 'Other',
]

const CHALLENGE_OPTIONS = [
  'Not generating enough leads',
  'Converting enquiries to sales',
  'Standing out from competitors',
  'Social media not working',
  'Low ad ROI / wasted spend',
  'Google visibility / SEO',
  'Customer retention & repeat business',
  'Building brand trust and credibility',
  'Creating consistent content',
  'WhatsApp marketing effectiveness',
]

// ─────────────────────────────────────────────────────────────
// FIELD COMPONENTS
// ─────────────────────────────────────────────────────────────

function FieldInput({
  label, value, onChange, onBlur,
  placeholder, type = 'text', maxLength, helpText, required, autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  type?: string
  maxLength?: number
  helpText?: string
  required?: boolean
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-white/70">
        {label}
        {required && <span className="text-[#E09818] text-xs">*</span>}
        {helpText && (
          <span className="group relative">
            <Info className="h-3.5 w-3.5 text-white/30 cursor-help" />
            <span className="pointer-events-none absolute left-5 top-0 z-10 hidden w-48 rounded-lg bg-[#0B1F3A] border border-white/10 p-2 text-xs text-white/60 group-hover:block">
              {helpText}
            </span>
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#E09818]/50 focus:outline-none focus:ring-2 focus:ring-[#E09818]/20 transition-all"
      />
      {maxLength && value.length > maxLength * 0.8 && (
        <p className="text-right text-xs text-white/30">{value.length}/{maxLength}</p>
      )}
    </div>
  )
}

function FieldTextarea({
  label, value, onChange, onBlur, placeholder, rows = 3, maxLength, helpText, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  rows?: number
  maxLength?: number
  helpText?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-white/70">
        {label}
        {required && <span className="text-[#E09818] text-xs">*</span>}
      </label>
      {helpText && <p className="text-xs text-white/30">{helpText}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#E09818]/50 focus:outline-none focus:ring-2 focus:ring-[#E09818]/20 transition-all"
      />
      {maxLength && <p className="text-right text-xs text-white/30">{value.length}/{maxLength}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPLETENESS CALCULATOR
// ─────────────────────────────────────────────────────────────

type ProfileForm = Record<string, any>

const SCORED_FIELDS: Array<{ key: keyof ProfileForm; weight: number; label: string }> = [
  { key: 'business_name', weight: 10, label: 'Business name' },
  { key: 'industry', weight: 10, label: 'Industry' },
  { key: 'city', weight: 8, label: 'City' },
  { key: 'description', weight: 12, label: 'Business description' },
  { key: 'unique_advantage', weight: 12, label: 'Unique advantage' },
  { key: 'target_customer', weight: 10, label: 'Target customer' },
  { key: 'whatsapp', weight: 10, label: 'WhatsApp number' },
  { key: 'social_proof', weight: 8, label: 'Social proof' },
  { key: 'brand_voice', weight: 5, label: 'Brand voice' },
  { key: 'price_range', weight: 5, label: 'Price range' },
  { key: 'years_in_business', weight: 5, label: 'Years in business' },
  { key: 'marketing_challenges', weight: 5, label: 'Marketing challenges' },
]

function calcCompleteness(form: ProfileForm): { score: number; missing: string[] } {
  let total = 0
  const missing: string[] = []
  for (const field of SCORED_FIELDS) {
    const v = form[field.key]
    const filled = Array.isArray(v) ? v.length > 0 : Boolean(v)
    if (filled) total += field.weight
    else missing.push(field.label)
  }
  return { score: Math.min(100, total), missing: missing.slice(0, 4) }
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const params = useSearchParams()
  const focusField = params.get('focus')
  const { profile: initialProfile } = useUser()

  const { toast } = useToast()
  const supabase = createBrowserClient()

  const [form, setForm] = useState<ProfileForm>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Initialise form from profile
  useEffect(() => {
    if (initialProfile) {
      setForm({
        business_name: initialProfile.business_name || '',
        industry: initialProfile.industry || '',
        city: initialProfile.city || '',
        country: initialProfile.country || 'Nigeria',
        years_in_business: initialProfile.years_in_business?.toString() || '',
        description: initialProfile.description || '',
        unique_advantage: initialProfile.unique_advantage || '',
        target_customer: initialProfile.target_customer || '',
        brand_voice: initialProfile.brand_voice || '',
        language_preference: initialProfile.language_preference || 'en-NG',
        price_range: initialProfile.price_range || '',
        social_proof: initialProfile.social_proof || '',
        logo_url: initialProfile.logo_url || '',
        brand_colour: initialProfile.brand_colour || '#E09818',
        whatsapp: initialProfile.whatsapp || '',
        phone: initialProfile.phone || '',
        email_contact: initialProfile.email_contact || '',
        address: initialProfile.address || '',
        business_hours: initialProfile.business_hours || '',
        instagram: initialProfile.instagram || '',
        facebook: initialProfile.facebook || '',
        linkedin: initialProfile.linkedin || '',
        tiktok: initialProfile.tiktok || '',
        marketing_challenges: (initialProfile.marketing_challenges as string[]) || [],
        primary_cta: initialProfile.primary_cta || '',
      })
    }
  }, [initialProfile])



  const setField = useCallback((key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

 const saveProfile = useCallback(async (partial?: Partial<ProfileForm>) => {
  // console.log('saveProfile called', { form, initialProfile, supabase: !!supabase }) // ← add this
  setSaving(true)
  try {
    const toSave = { ...(partial || form) }

    if (toSave.years_in_business) {
      toSave.years_in_business = parseInt(toSave.years_in_business as string, 10) || null
    }

    if (!toSave.brand_voice) toSave.brand_voice = null
    if (!toSave.price_range) toSave.price_range = null
    if (!toSave.language_preference) toSave.language_preference = null
    toSave.years_in_business = toSave.years_in_business
      ? parseInt(toSave.years_in_business as string, 10) || null
      : null

    const { score } = calcCompleteness(form)
    toSave.profile_completeness_score = score

    const { error } = await supabase
      .from('profiles')
      .update(toSave)
      .eq('id', (initialProfile as any)?.id || '')

      // console.log('save result:', { error, id: (initialProfile as any)?.id, toSave })


    if (error) {
      toast({ type: 'error', title: 'Save failed', description: error.message })
      console.log('Error saving profile:', error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  } catch (err) {
    console.error('saveProfile threw:', err)
    toast({ type: 'error', title: 'Save failed', description: 'Unexpected error' })
  } finally {
    setSaving(false) // ✅ always runs
  }
}, [form, supabase, initialProfile, toast])

  const autoSave = useCallback(async () => {
    if (!(initialProfile as any)?.id) return
    await saveProfile()
  }, [saveProfile, initialProfile])

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast({ type: 'warning', title: 'File too large', description: 'Logo must be under 2MB' })
      return
    }
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/profile/upload-logo', { method: 'POST', body: formData })
      if (!res.ok) throw new Error(await res.text())
      const { url } = await res.json()
      setField('logo_url', url)
      await saveProfile({ logo_url: url })
      toast({ type: 'success', title: 'Logo uploaded!', description: 'Your logo is now saved.' })
    } catch (err: any) {
      toast({ type: 'error', title: 'Upload failed', description: err.message })
    }
    setLogoUploading(false)
  }



  const { score, missing } = calcCompleteness(form)

  const SECTIONS = [
    { icon: <Building2 className="h-4 w-4" />, label: 'Business' },
    { icon: <Target className="h-4 w-4" />, label: 'Marketing' },
    { icon: <Palette className="h-4 w-4" />, label: 'Brand' },
    { icon: <Globe className="h-4 w-4" />, label: 'Online' },
    { icon: <Phone className="h-4 w-4" />, label: 'Contact' },
  ]

  const qualityLabel =
    score < 40 ? { text: 'Basic', colour: '#EF4444' } :
      score < 70 ? { text: 'Good', colour: '#F59E0B' } :
        score < 90 ? { text: 'Great', colour: '#10B881' } :
          { text: 'Expert', colour: '#E09818' }

  const INDUSTRIES = [
    'Fashion & Clothing', 'Food & Beverages', 'Beauty & Personal Care',
    'Health & Wellness', 'Real Estate & Property', 'Education & Training',
    'Technology & Software', 'Retail & E-commerce', 'Professional Services',
    'Events & Entertainment', 'Logistics & Delivery', 'Finance & Fintech',
    'Agriculture', 'Media & Content Creation', 'Hospitality & Travel',
    'Manufacturing', 'Other'
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: NAVY }}>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Business Profile</h1>
            <p className="mt-1 text-sm text-white/40">
              The AI uses this to personalise every output. More detail = better results.
            </p>
          </div>
          <button
            onClick={() => saveProfile()}
            disabled={saving}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${saved
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-[#E09818] text-[#0B1F3A] hover:opacity-90'
              } disabled:opacity-60`}
          >
            {saved
              ? <><CheckCircle2 className="h-4 w-4" /> Saved</>
              : saving
                ? <><span className="animate-spin">⏳</span> Saving…</>
                : <><Save className="h-4 w-4" /> Save</>}
          </button>
        </div>

        {/* ── Completeness ring ──────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-5">
            {/* Ring */}
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke={qualityLabel.colour}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white">{score}%</span>
                <span className="text-[10px] font-semibold" style={{ color: qualityLabel.colour }}>
                  {qualityLabel.text}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                Profile quality: <span style={{ color: qualityLabel.colour }}>{qualityLabel.text}</span>
              </p>
              <p className="text-xs text-white/40 mt-1">
                {score >= 90
                  ? 'Your profile is fully optimised — every tool output is personalised to the maximum.'
                  : `Complete these fields for significantly better outputs:`}
              </p>
              {missing.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {missing.map((f) => (
                    <span key={f} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      + {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section tabs ───────────────────────── */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {SECTIONS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setActiveSection(i)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all ${activeSection === i
                ? 'bg-[#E09818] text-[#0B1F3A]'
                : 'text-white/40 hover:text-white/60'
                }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── SECTION 0: Business ────────────────── */}
        {activeSection === 0 && (
          <motion.div key="business" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {form.logo_url
                  ? <img src={form.logo_url as string} alt="Logo" className="h-full w-full object-contain p-1" />
                  : logoUploading
                    ? <span className="text-xs text-white/30 animate-pulse">Uploading…</span>
                    : <Upload className="h-6 w-6 text-white/20" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Business Logo</p>
                <p className="text-xs text-white/40 mt-0.5">PNG, JPG or SVG · Max 2MB</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  {form.logo_url ? 'Change logo' : 'Upload logo'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>

            <FieldInput
              label="Business name" required
              value={form.business_name as string || ''}
              onChange={(v) => setField('business_name', v)}
              onBlur={autoSave}
              placeholder="e.g. Luxe Interiors Lagos"
              autoFocus={focusField === 'business_name'}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">
                Industry / sector <span className="text-[#E09818] text-xs">*</span>
              </label>
              <select
                value={form.industry as string || ''}
                onChange={(e) => setField('industry', e.target.value)}
                onBlur={autoSave}
                className="w-full rounded-xl border border-white/10 bg-[#0B1F3A] px-4 py-3 text-sm text-white focus:border-[#E09818]/50 focus:outline-none"
              >
                <option value="">Select industry</option>
                {INDUSTRY_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">City <span className="text-[#E09818] text-xs">*</span></label>
                <select
                  value={form.city as string || ''}
                  onChange={(e) => setField('city', e.target.value)}
                  onBlur={autoSave}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1F3A] px-4 py-3 text-sm text-white focus:border-[#E09818]/50 focus:outline-none"
                >
                  <option value="">Select city</option>
                  {NIGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <FieldInput
                label="Years in business"
                value={form.years_in_business as string || ''}
                onChange={(v) => setField('years_in_business', v)}
                onBlur={autoSave}
                type="number"
                placeholder="e.g. 3"
              />
            </div>

            <FieldTextarea
              label="Business description" required
              value={form.description as string || ''}
              onChange={(v) => setField('description', v)}
              onBlur={autoSave}
              placeholder="What does your business do? Who do you serve? What makes you different? Write 2-3 sentences."
              rows={4}
              maxLength={500}
              helpText="This is the most used field — the AI reads this for every output."
            />

            <FieldTextarea
              label="Your unique advantage" required
              value={form.unique_advantage as string || ''}
              onChange={(v) => setField('unique_advantage', v)}
              onBlur={autoSave}
              placeholder="What can you do that your competitors can't? e.g. '5-year warranty, same-day delivery in Lagos, 400+ satisfied clients'"
              rows={3}
              maxLength={300}
            />

            <FieldTextarea
              label="Your social proof / track record"
              value={form.social_proof as string || ''}
              onChange={(v) => setField('social_proof', v)}
              onBlur={autoSave}
              placeholder="e.g. 'Over 400 homes transformed in Lagos since 2019' or '₦1.2B in client revenue generated'"
              rows={2}
              maxLength={200}
              helpText="Used in trust signals throughout your outputs — be specific."
            />

            <FieldTextarea
              label="Target customer"
              value={form.target_customer as string || ''}
              onChange={(v) => setField('target_customer', v)}
              onBlur={autoSave}
              placeholder="e.g. 'Lagos homeowners aged 30-50 who want luxury interiors but are too busy to manage it themselves'"
              rows={2}
              maxLength={300}
            />
          </motion.div>
        )}

        {/* ── SECTION 1: Marketing ───────────────── */}
        {activeSection === 1 && (
          <motion.div key="marketing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Your top marketing challenges (select all that apply)
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CHALLENGE_OPTIONS.map((c) => {
                  const challenges = (form.marketing_challenges as string[]) || []
                  const isOn = challenges.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        const next = isOn ? challenges.filter((x) => x !== c) : [...challenges, c]
                        setField('marketing_challenges', next)
                      }}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all ${isOn
                        ? 'border-[#E09818]/50 bg-[#E09818]/10 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                        }`}
                    >
                      {isOn
                        ? <CheckCircle2 className="h-4 w-4 text-[#E09818] shrink-0" />
                        : <Circle className="h-4 w-4 shrink-0 text-white/20" />}
                      {c}
                    </button>
                  )
                })}
              </div>
              {((form.marketing_challenges as string[]) || []).length > 0 && (
                <button onClick={autoSave} className="mt-3 text-xs text-[#E09818] hover:opacity-80">
                  Save challenges →
                </button>
              )}
            </div>

            <FieldInput
              label="Your price range"
              value={form.price_range as string || ''}
              onChange={(v) => setField('price_range', v)}
              onBlur={autoSave}
              placeholder="e.g. '₦50,000–₦500,000 per project' or 'From ₦15,000/month'"
              helpText="Used in pricing communications and ad copy to anchor value correctly."
            />

            <FieldTextarea
              label="Primary CTA / main offer"
              value={form.primary_cta as string || ''}
              onChange={(v) => setField('primary_cta', v)}
              onBlur={autoSave}
              placeholder="e.g. 'Book a free 30-minute design consultation' or 'Order via WhatsApp for same-day delivery'"
              rows={2}
              maxLength={200}
              helpText="This appears at the end of most tool outputs."
            />
          </motion.div>
        )}

        {/* ── SECTION 2: Brand ───────────────────── */}
        {activeSection === 2 && (
          <motion.div key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Brand voice</label>
              <div className="grid grid-cols-1 gap-2">
                {BRAND_VOICES.map((bv) => (
                  <button
                    key={bv.value}
                    onClick={() => { setField('brand_voice', bv.value); setTimeout(autoSave, 100) }}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm transition-all ${form.brand_voice === bv.value
                      ? 'border-[#E09818]/50 bg-[#E09818]/10 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/20'
                      }`}
                  >
                    {bv.label}
                    {form.brand_voice === bv.value && <CheckCircle2 className="h-4 w-4 text-[#E09818]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Brand colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.brand_colour as string || '#E09818'}
                  onChange={(e) => setField('brand_colour', e.target.value)}
                  onBlur={autoSave}
                  className="h-12 w-12 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                />
                <input
                  type="text"
                  value={form.brand_colour as string || ''}
                  onChange={(e) => setField('brand_colour', e.target.value)}
                  onBlur={autoSave}
                  placeholder="#E09818"
                  maxLength={7}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Language preference</label>
              <select
                value={form.language_preference as string || 'en-NG'}
                onChange={(e) => { setField('language_preference', e.target.value); setTimeout(autoSave, 100) }}
                className="w-full rounded-xl border border-white/10 bg-[#0B1F3A] px-4 py-3 text-sm text-white focus:outline-none"
              >
                <option value="en-NG">Nigerian English (recommended)</option>
                <option value="en-formal">Formal English</option>
                <option value="pidgin">Nigerian Pidgin (casual)</option>
                <option value="yoruba">Yoruba</option>
                <option value="igbo">Igbo</option>
                <option value="hausa">Hausa</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* ── SECTION 3: Online ──────────────────── */}
        {activeSection === 3 && (
          <motion.div key="online" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {[
              { key: 'instagram', label: 'Instagram handle', placeholder: '@yourbusiness' },
              { key: 'facebook', label: 'Facebook page URL', placeholder: 'facebook.com/yourbusiness' },
              { key: 'tiktok', label: 'TikTok handle', placeholder: '@yourtiktok' },
              { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/company/yourbusiness' },
            ].map((f) => (
              <FieldInput
                key={f.key}
                label={f.label}
                value={form[f.key] as string || ''}
                onChange={(v) => setField(f.key, v)}
                onBlur={autoSave}
                placeholder={f.placeholder}
              />
            ))}

            <div className="rounded-xl border border-white/5 bg-white/3 p-4">
              <p className="text-xs text-white/40">
                Social handles appear in bio generators and brand vault outputs.
                Your WhatsApp is the most important — add it in the Contact section.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── SECTION 4: Contact ─────────────────── */}
        {activeSection === 4 && (
          <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <FieldInput
              label="WhatsApp number" required
              value={form.whatsapp as string || ''}
              onChange={(v) => setField('whatsapp', v)}
              onBlur={autoSave}
              type="tel"
              placeholder="e.g. 08091234567"
              helpText="This appears in EVERY tool output. The most important field."
              autoFocus={focusField === 'whatsapp'}
            />
            <FieldInput
              label="Phone number"
              value={form.phone as string || ''}
              onChange={(v) => setField('phone', v)}
              onBlur={autoSave}
              type="tel"
              placeholder="e.g. 08091234567"
            />
            <FieldInput
              label="Business email"
              value={form.email_contact as string || ''}
              onChange={(v) => setField('email_contact', v)}
              onBlur={autoSave}
              type="email"
              placeholder="e.g. hello@yourbusiness.com"
            />
            <FieldInput
              label="Business address"
              value={form.address as string || ''}
              onChange={(v) => setField('address', v)}
              onBlur={autoSave}
              placeholder="e.g. 12 Adeola Hopewell Street, Victoria Island, Lagos"
            />
            <FieldInput
              label="Business hours"
              value={form.business_hours as string || ''}
              onChange={(v) => setField('business_hours', v)}
              onBlur={autoSave}
              placeholder="e.g. Monday–Saturday, 8am–6pm WAT"
            />
          </motion.div>
        )}

        {/* ── Section navigation ─────────────────── */}
        <div className="flex justify-between pt-2">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/40 hover:text-white disabled:opacity-20"
          >
            ← Previous
          </button>
          {activeSection < SECTIONS.length - 1 ? (
            <button
              onClick={() => { autoSave(); setActiveSection(activeSection + 1) }}
              className="flex items-center gap-1.5 rounded-xl bg-[#E09818] px-4 py-2 text-sm font-bold text-[#0B1F3A] hover:opacity-90"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => { saveProfile(); router.push('/dashboard') }}
              className="flex items-center gap-1.5 rounded-xl bg-[#E09818] px-4 py-2 text-sm font-bold text-[#0B1F3A] hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> Done — go to dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
