'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/brand/page.tsx
// Brand Vault — the user's living brand playbook.
// Auto-generates brand copy from profile. Editable in-place.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter }   from 'next/navigation'
import { motion }      from 'framer-motion'
import {
  Copy, Check, RefreshCw, Edit3, Save, X,
  Image, Palette, Calendar, Star, Zap,
  ExternalLink, ChevronRight,
} from 'lucide-react'
import { useUser }  from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'
// import { Profile } from '@/types'
// 
const NAVY = '#0B1F3A'
const GOLD = '#E09818'

// ─────────────────────────────────────────────────────────────
// BRAND COPY GENERATORS (from profile — all run client-side)
// ─────────────────────────────────────────────────────────────

function generateInstagramBio(p: Record<string, any>): string {
  const lines = [
    p.unique_advantage ? `${p.unique_advantage.slice(0, 50)}` : `${p.industry} experts`,
    p.social_proof ? `${p.social_proof.slice(0, 40)}` : p.years_in_business ? `${p.years_in_business} years in business` : '',
    p.city ? `📍 ${p.city}` : '',
    p.whatsapp ? `💬 wa.me/234${p.whatsapp.replace(/^0/, '').replace(/\D/g, '')}` : '',
  ].filter(Boolean)
  return lines.join('\n').slice(0, 150)
}

function generateWhatsAppDesc(p: Record<string, any>): string {
  return `${p.business_name || 'Our business'} | ${p.industry || 'Professional services'} | ${p.city || 'Nigeria'}\n${p.description?.slice(0, 100) || p.unique_advantage || ''}\n📞 ${p.whatsapp || 'Contact us'}`.slice(0, 200)
}

function generateEmailSig(p: Record<string, any>): string {
  return [
    p.business_name,
    p.industry,
    p.city ? `${p.city}, Nigeria` : 'Nigeria',
    p.phone ? `📞 ${p.phone}` : '',
    p.whatsapp ? `💬 ${p.whatsapp}` : '',
    p.email_contact ? `✉️ ${p.email_contact}` : '',
  ].filter(Boolean).join(' | ')
}

function generateElevatorPitch(p: Record<string, any>): string {
  const parts = [
    `I run ${p.business_name || 'a business'}`,
    p.industry ? `in the ${p.industry} industry` : '',
    p.city ? `based in ${p.city}` : 'in Nigeria',
    p.unique_advantage ? `— ${p.unique_advantage.slice(0, 60)}` : '',
    p.target_customer ? `We serve ${p.target_customer.slice(0, 40)}` : '',
  ].filter(Boolean)
  return parts.join(' ').slice(0, 200)
}

function generateWebsiteHeadline(p: Record<string, any>): string {
  if (p.unique_advantage) return p.unique_advantage.slice(0, 80)
  if (p.description) return p.description.split('.')[0]?.slice(0, 80) || ''
  return `${p.industry || 'Professional'} Services You Can Trust in ${p.city || 'Nigeria'}`
}

function generateAboutUs(p: Record<string, any>): string {
  return [
    `${p.business_name || 'We'} is a ${p.industry || 'professional services'} business based in ${p.city || 'Nigeria'}.`,
    p.description ? p.description.slice(0, 150) : '',
    p.years_in_business ? `We have been in business for ${p.years_in_business} year${p.years_in_business > 1 ? 's' : ''}.` : '',
    p.social_proof ? `${p.social_proof}.` : '',
    p.whatsapp ? `Get in touch on WhatsApp: ${p.whatsapp}` : '',
  ].filter(Boolean).join(' ')
}

// ─────────────────────────────────────────────────────────────
// COPY ITEM (single piece of brand copy)
// ─────────────────────────────────────────────────────────────

function CopyItem({
  label,
  value,
  onRegenerate,
  coinCost = 3,
}: {
  label:        string
  value:        string
  onRegenerate: () => void
  coinCost?:    number
}) {
  const { toast }   = useToast()
  const [copied,    setCopied]    = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [editVal,   setEditVal]   = useState(value)
  const [savedVal,  setSavedVal]  = useState(value)

  useEffect(() => { setEditVal(value); setSavedVal(value) }, [value])

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(savedVal)
    setCopied(true)
    toast({ type: 'success', title: 'Copied!', description: `${label} copied to clipboard` })
    setTimeout(() => setCopied(false), 2000)
  }, [savedVal, label, toast])

  const save = () => {
    setSavedVal(editVal)
    setEditing(false)
    // Persist to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('cerebre_brand_overrides') || '{}')
      stored[label] = editVal
      localStorage.setItem('cerebre_brand_overrides', JSON.stringify(stored))
    } catch {}
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRegenerate}
            title={`Regenerate (${coinCost} coins)`}
            className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs text-white/40 hover:text-[#E09818] hover:border-[#E09818]/30 transition-all"
          >
            <RefreshCw className="h-3 w-3" /> {coinCost}🪙
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-white/40 hover:text-white/70 transition-all"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            onClick={copy}
            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition-all ${
              copied
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {copied ? <><Check className="inline h-3 w-3 mr-1" />Copied</> : <><Copy className="inline h-3 w-3 mr-1" />Copy</>}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[#E09818]/40 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1 rounded-lg bg-[#E09818] px-3 py-1.5 text-xs font-bold text-[#0B1F3A] hover:opacity-90">
              <Save className="h-3 w-3" /> Save
            </button>
            <button onClick={() => { setEditing(false); setEditVal(savedVal) }} className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white/70">
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{savedVal || <span className="text-white/25 italic">Complete your profile to generate this</span>}</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function BrandVaultPage() {
  const router      = useRouter()
  const { profile } = useUser()
  const { toast }   = useToast()

  const p = (profile ?? {}) as {
  logo_url?:          string
  brand_colour?:      string
  years_in_business?: string
  brand_voice?:       string
  unique_advantage?:  string
}

  const copies = [
    { label: 'Instagram Bio (150 chars)',     value: generateInstagramBio(p)     },
    { label: 'WhatsApp Business Description', value: generateWhatsAppDesc(p)     },
    { label: 'Email Signature',               value: generateEmailSig(p)         },
    { label: '30-Word Elevator Pitch',        value: generateElevatorPitch(p)    },
    { label: 'Website Headline',              value: generateWebsiteHeadline(p)  },
    { label: 'About Us Paragraph',            value: generateAboutUs(p)          },
  ]

  const handleRegenerate = (label: string) => {
    toast({ type: 'info', title: 'Coming soon', description: `AI-powered regeneration for ${label} — 3 coins` })
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: NAVY }}>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Brand Vault</h1>
            <p className="mt-1 text-sm text-white/40">Your living brand playbook — auto-generated from your profile</p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            Edit profile <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Brand Identity Card ───────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/50 uppercase tracking-wider">Brand Identity</h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              {p.logo_url ? (
                <img src={p.logo_url} alt="Logo" className="h-16 w-16 rounded-xl object-contain border border-white/10" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5">
                  <Image className="h-6 w-6 text-white/20" />
                </div>
              )}
              <span className="text-xs text-white/30">Logo</span>
            </div>

            {/* Brand colour */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 rounded-xl border border-white/10"
                style={{ background: p.brand_colour || GOLD }}
              />
              <span className="text-xs text-white/30">{p.brand_colour || GOLD}</span>
            </div>

            {/* Years */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <div>
                  <div className="text-2xl font-black text-white">{p.years_in_business || '—'}</div>
                  <div className="text-[10px] text-white/30">years</div>
                </div>
              </div>
              <span className="text-xs text-white/30">In business</span>
            </div>

            {/* Brand voice */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Star className="h-6 w-6 text-[#E09818]" />
              </div>
              <span className="text-xs text-white/30 capitalize">{p.brand_voice || 'Not set'}</span>
            </div>
          </div>

          {/* Unique advantage */}
          {p.unique_advantage && (
            <div className="mt-4 rounded-xl border border-[#E09818]/20 bg-[#E09818]/5 p-3">
              <p className="text-xs text-[#E09818]/70 font-semibold uppercase tracking-wider mb-1">Your unique advantage</p>
              <p className="text-sm text-white/80">{p.unique_advantage}</p>
            </div>
          )}
        </div>

        {/* ── Quick Copy Bank ──────────────────────── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Quick Copy Bank</h2>
            <span className="text-xs text-white/30">Click to copy — edit any item — regenerate with AI</span>
          </div>
          <div className="space-y-3">
            {copies.map((item) => (
              <CopyItem
                key={item.label}
                label={item.label}
                value={item.value}
                onRegenerate={() => handleRegenerate(item.label)}
              />
            ))}
          </div>
        </div>

        {/* ── Go deeper CTA ───────────────────────── */}
        <div className="rounded-2xl border border-[#E09818]/20 bg-[#E09818]/5 p-5">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-[#E09818] shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Want a full brand strategy?</p>
              <p className="text-xs text-white/50 mt-0.5">BrandPositioner creates your complete positioning statement, competitive map, messaging hierarchy, and tagline options.</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/tools/brand-positioner')}
            className="mt-4 w-full rounded-xl bg-[#E09818] py-2.5 text-sm font-bold text-[#0B1F3A] hover:opacity-90"
          >
            Run BrandPositioner — 50 coins
          </button>
        </div>

      </div>
    </div>
  )
}
