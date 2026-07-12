'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/CaptionGroupOutput.tsx
//
// Handles all 8 Group 1 (caption/short copy) tools.
// Each tool gets a UNIQUE visual frame that matches how the content
// will actually be used — the schema is identical across all tools,
// only the presentation changes.
//
// Tool → Visual Mode mapping:
//   caption-craft       → InstagramFrame  (social post preview)
//   ad-scribe           → AdUnitFrame     (Facebook/Google ad anatomy)
//   copy-brain          → CopyBriefFrame  (copywriter's document)
//   promo-blast         → UrgencyFrame    (limited offer card)
//   bio-builder         → PlatformBioFrame(platform profile preview)
//   product-describer   → ProductFrame    (e-commerce listing)
//   review-requestor    → ReviewFrame     (WhatsApp-style request)
//   pricing-narrator    → PricingFrame    (value narrative card)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from 'react'
import {
  Copy, Check, Clock, Hash, RefreshCw,
  Bookmark, BookmarkCheck, Share2,
} from 'lucide-react'
import type { CaptionOutput, CaptionVariant } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:  '#060C1A', navy: '#0B1F3A', card: '#0D2040',
  gold:  '#E09818', gl:  '#F5B830', teal: '#12D4B4',
  red:   '#E55252', green: '#22C55E', purple: '#8B7FFF',
  w:     '#EBF2FC', dim: 'rgba(205,217,236,.72)',
  muted: 'rgba(205,217,236,.38)', faint: 'rgba(255,255,255,.04)',
  bdr:   'rgba(255,255,255,.08)',
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C', Facebook: '#1877F2', LinkedIn: '#0A66C2',
  TikTok: '#69C9D0', Twitter: '#1DA1F2', WhatsApp: '#25D366', All: D.gold,
}

// ── useCopy hook ───────────────────────────────────────────────
function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Shared CopyBtn ─────────────────────────────────────────────
function CopyBtn({ text, label = 'Copy', size = 'sm' }: { text: string; label?: string; size?: 'sm' | 'lg' }) {
  const { done, copy } = useCopy(text)
  const isLg = size === 'lg'
  return (
    <button onClick={copy} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: isLg ? '9px 18px' : '5px 11px',
      borderRadius: isLg ? 9 : 6, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: isLg ? 13 : 12, fontWeight: 700,
      border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`,
      background: done ? 'rgba(18,212,180,.1)' : D.faint,
      color: done ? D.teal : D.muted, transition: 'all .18s',
      minHeight: isLg ? 42 : undefined,
    }}>
      {done ? <Check size={isLg ? 14 : 11}/> : <Copy size={isLg ? 14 : 11}/>}
      {done ? 'Copied!' : label}
    </button>
  )
}

// ── HashPill ───────────────────────────────────────────────────
function HashPill({ tag }: { tag: string }) {
  const { done, copy } = useCopy(`#${tag}`)
  return (
    <button onClick={copy} style={{
      padding: '4px 11px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 12, fontWeight: 600,
      border: `1px solid ${done ? 'rgba(18,212,180,.45)' : 'rgba(18,212,180,.22)'}`,
      background: done ? 'rgba(18,212,180,.14)' : 'rgba(18,212,180,.07)',
      color: done ? D.teal : 'rgba(18,212,180,.8)', transition: 'all .18s',
    }}>
      {done ? '✓ ' : '#'}{tag}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// VISUAL FRAME COMPONENTS — one per tool
// ═══════════════════════════════════════════════════════════════

// ── 1. INSTAGRAM FRAME — CaptionCraft ─────────────────────────
function InstagramFrame({ variant, businessName, platform }: {
  variant: CaptionVariant; businessName: string; platform: string
}) {
  const { done, copy } = useCopy(variant.text)
  const pColor = PLATFORM_COLORS[platform] ?? D.gold
  const initial = (businessName || 'B')[0].toUpperCase()
  const handle = '@' + businessName.toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,'_').slice(0,20)

  return (
    <div style={{ borderRadius: 14, border: `1.5px solid ${pColor}50`, background: D.card, overflow: 'hidden', boxShadow: `0 6px 28px ${pColor}12` }}>
      {/* Post header */}
      <div style={{ padding: '11px 14px', background: `linear-gradient(135deg,${D.navy},${D.card})`, borderBottom: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${pColor},${pColor}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', border: `2px solid ${pColor}55`, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: D.w }}>{businessName}</div>
          <div style={{ fontSize: 11, color: D.muted }}>{handle}</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${pColor}18`, border: `1px solid ${pColor}35`, color: pColor }}>{variant.label}</span>
      </div>
      {/* Color strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${pColor}60,${D.teal}40,${pColor}30)` }}/>
      {/* Caption */}
      <div style={{ padding: '13px 14px 10px' }}>
        <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>{variant.text}</p>
        {variant.hashtags.slice(0,5).map(t => (
          <span key={t} style={{ fontSize: 12, color: pColor, fontWeight: 600, marginRight: 5 }}>#{t}</span>
        ))}
      </div>
      {/* Footer */}
      <div style={{ padding: '9px 14px', borderTop: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: D.muted }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: variant.char_count <= 150 ? D.teal : D.gl, display: 'inline-block', marginRight: 5 }}/>
          {variant.char_count} chars
        </span>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`, background: done ? 'rgba(18,212,180,.1)' : D.faint, color: done ? D.teal : D.muted, transition: 'all .18s', minHeight: 34 }}>
          {done ? <><Check size={12}/> Copied!</> : <><Copy size={12}/> Copy</>}
        </button>
      </div>
    </div>
  )
}

// ── 2. AD UNIT FRAME — AdScribe ───────────────────────────────
function AdUnitFrame({ variant }: { variant: CaptionVariant }) {
  const lines = variant.text.split(/\n+/).filter(Boolean)
  const headline = lines[0] ?? ''
  const body     = lines.slice(1, -1).join('\n') || lines[1] || ''
  const cta      = lines[lines.length - 1] ?? 'Learn more'
  const { done: dH, copy: cH } = useCopy(headline)
  const { done: dB, copy: cB } = useCopy(body)
  const { done: dA, copy: cA } = useCopy(variant.text)

  return (
    <div style={{ borderRadius: 14, border: `1.5px solid rgba(24,119,242,.35)`, background: D.card, overflow: 'hidden' }}>
      {/* Ad label */}
      <div style={{ padding: '8px 14px', background: 'rgba(24,119,242,.08)', borderBottom: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#1877F2', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Ad unit · {variant.label}</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(24,119,242,.15)', color: '#1877F2', fontWeight: 700 }}>Sponsored</span>
      </div>
      {/* Image placeholder strip */}
      <div style={{ height: 48, background: `linear-gradient(90deg,${D.navy},rgba(24,119,242,.2),${D.navy})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: D.muted, letterSpacing: '.5px' }}>[ Ad Creative / Image ]</span>
      </div>
      {/* Ad anatomy */}
      <div style={{ padding: '13px 14px' }}>
        {/* Headline */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#1877F2', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Headline</span>
            <button onClick={cH} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${D.bdr}`, background: D.faint, color: dH ? D.teal : D.muted }}>{dH ? '✓ Copied' : '⎘ Copy'}</button>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: D.w, margin: 0, lineHeight: 1.3 }}>{headline}</p>
        </div>
        {/* Body */}
        {body && (
          <div style={{ marginBottom: 10, paddingTop: 10, borderTop: `1px solid ${D.bdr}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: D.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Body copy</span>
              <button onClick={cB} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${D.bdr}`, background: D.faint, color: dB ? D.teal : D.muted }}>{dB ? '✓ Copied' : '⎘ Copy'}</button>
            </div>
            <p style={{ fontSize: 13.5, color: D.dim, margin: 0, lineHeight: 1.75 }}>{body}</p>
          </div>
        )}
        {/* CTA button */}
        <div style={{ paddingTop: 10, borderTop: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ padding: '9px 20px', borderRadius: 8, background: '#1877F2', color: '#fff', fontSize: 13.5, fontWeight: 700, display: 'inline-block' }}>
            {cta}
          </div>
          <button onClick={cA} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, border: `1px solid ${D.bdr}`, background: D.faint, color: D.muted, minHeight: 34 }}>
            <Copy size={11}/> Copy all
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 3. COPYWRITER BRIEF FRAME — CopyBrain AI ──────────────────
function CopyBriefFrame({ variant }: { variant: CaptionVariant }) {
  const text  = variant.text
  const lines = text.split(/\n+/).filter(Boolean)
  const { done, copy } = useCopy(text)

  // Try to identify Hook/Body/Proof/CTA sections
  const sections: Array<{ label: string; color: string; content: string }> = []
  let remaining = lines

  const hookLine = remaining.find(l => /hook|headline|opening/i.test(l))
  if (hookLine) {
    sections.push({ label: 'HOOK', color: D.gold, content: hookLine.replace(/^(hook|headline|opening)[:\-–\s]*/i, '') })
    remaining = remaining.filter(l => l !== hookLine)
  }

  const proofLine = remaining.find(l => /proof|testimonial|social|trust/i.test(l))
  if (proofLine) {
    sections.push({ label: 'PROOF', color: D.teal, content: proofLine.replace(/^(proof|testimonial|social|trust)[:\-–\s]*/i, '') })
    remaining = remaining.filter(l => l !== proofLine)
  }

  const ctaLine = remaining[remaining.length - 1]
  if (ctaLine && remaining.length > 1) {
    remaining = remaining.slice(0, -1)
    sections.unshift({ label: 'BODY', color: D.purple, content: remaining.join('\n') })
    sections.push({ label: 'CTA', color: D.green, content: ctaLine })
  } else {
    sections.unshift({ label: 'COPY', color: D.dim, content: remaining.join('\n') })
  }

  return (
    <div style={{ borderRadius: 14, border: `1.5px solid rgba(139,127,255,.3)`, background: D.card, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', background: 'rgba(139,127,255,.06)', borderBottom: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: D.purple, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Copy brief · {variant.label}</span>
        <span style={{ fontSize: 10, color: D.muted }}>{variant.char_count} chars</span>
      </div>
      <div style={{ padding: '14px' }}>
        {sections.map(({ label, color, content }) => (
          <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ minWidth: 44, paddingTop: 2 }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color, display: 'block', lineHeight: 1 }}>{label}</span>
              <div style={{ width: 24, height: 2, background: color, borderRadius: 1, marginTop: 4 }}/>
            </div>
            <p style={{ flex: 1, fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: 0 }}>{content}</p>
          </div>
        ))}
        <div style={{ paddingTop: 12, borderTop: `1px solid ${D.bdr}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`, background: done ? 'rgba(18,212,180,.1)' : D.faint, color: done ? D.teal : D.muted, minHeight: 34 }}>
            {done ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy brief</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 4. URGENCY FRAME — PromoBlast ─────────────────────────────
function UrgencyFrame({ variant }: { variant: CaptionVariant }) {
  const { done, copy } = useCopy(variant.text)
  const urgencyBadge = /flash|limited|today only|ends|deadline/i.test(variant.text) ? '⚡ FLASH PROMO' : '🔥 LIMITED OFFER'

  return (
    <div style={{ borderRadius: 14, border: `2px solid ${D.gold}55`, background: D.card, overflow: 'hidden', boxShadow: `0 4px 24px ${D.gold}12` }}>
      {/* Urgency banner */}
      <div style={{ padding: '8px 14px', background: `linear-gradient(90deg,${D.gold}20,${D.gl}14)`, borderBottom: `1px solid ${D.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: D.gl, letterSpacing: '1px' }}>{urgencyBadge}</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: `${D.gold}22`, border: `1px solid ${D.gold}40`, color: D.gl }}>
          {variant.label}
        </span>
      </div>
      {/* Content */}
      <div style={{ padding: '14px' }}>
        <p style={{ fontSize: 14, color: D.dim, lineHeight: 1.78, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{variant.text}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: D.muted }}>{variant.char_count} chars</span>
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.gold + '40'}`, background: done ? 'rgba(18,212,180,.1)' : `${D.gold}0d`, color: done ? D.teal : D.gl, transition: 'all .18s', minHeight: 34 }}>
            {done ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy promo</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 5. PLATFORM BIO FRAME — BioBuilder ────────────────────────
function PlatformBioFrame({ variant, platform }: { variant: CaptionVariant; platform: string }) {
  const { done, copy } = useCopy(variant.text)
  const pColor = PLATFORM_COLORS[platform] ?? D.gold
  const charLimits: Record<string, number> = { Instagram: 150, LinkedIn: 2600, Twitter: 160, Website: 500 }
  const limit = charLimits[platform] ?? 200
  const pct = Math.min(100, Math.round((variant.char_count / limit) * 100))

  return (
    <div style={{ borderRadius: 14, border: `1.5px solid ${pColor}35`, background: D.card, overflow: 'hidden' }}>
      {/* Platform header */}
      <div style={{ padding: '10px 14px', background: `${pColor}0a`, borderBottom: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: pColor }}>
          {platform} Profile Bio
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: `${pColor}15`, border: `1px solid ${pColor}30`, color: pColor }}>
          {variant.label}
        </span>
      </div>
      {/* Bio text */}
      <div style={{ padding: '14px' }}>
        <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{variant.text}</p>
        {/* Char progress */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10.5, color: D.muted }}>{variant.char_count} / {limit} characters</span>
            <span style={{ fontSize: 10.5, color: pct > 90 ? D.red : pct > 75 ? D.gl : D.teal, fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: D.bdr, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? D.red : pct > 75 ? D.gl : D.teal, borderRadius: 2, transition: 'width .4s' }}/>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`, background: done ? 'rgba(18,212,180,.1)' : D.faint, color: done ? D.teal : D.muted, minHeight: 34 }}>
            {done ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy bio</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 6. PRODUCT LISTING FRAME — ProductDescriber ───────────────
function ProductFrame({ variant, businessName }: { variant: CaptionVariant; businessName: string }) {
  const { done, copy } = useCopy(variant.text)
  const lines = variant.text.split(/\n+/).filter(Boolean)
  const productName = lines[0] ?? businessName
  const description = lines.slice(1).join('\n')

  return (
    <div style={{ borderRadius: 14, border: `1.5px solid rgba(34,197,94,.3)`, background: D.card, overflow: 'hidden' }}>
      {/* Product image placeholder */}
      <div style={{ height: 60, background: `linear-gradient(135deg,${D.navy},rgba(34,197,94,.12))`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📦</div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: D.green, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>Product · {variant.label}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: D.w }}>{productName}</div>
        </div>
      </div>
      <div style={{ padding: '14px' }}>
        {description && <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{description}</p>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${D.bdr}` }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '6px 14px', borderRadius: 7, background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.25)', fontSize: 12, fontWeight: 700, color: D.green }}>
              Add to cart
            </div>
          </div>
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`, background: done ? 'rgba(18,212,180,.1)' : D.faint, color: done ? D.teal : D.muted, minHeight: 34 }}>
            {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 7. REVIEW REQUEST FRAME — ReviewRequestor ─────────────────
function ReviewFrame({ variant }: { variant: CaptionVariant }) {
  const { done, copy } = useCopy(variant.text)
  return (
    <div style={{ borderRadius: 14, border: `1.5px solid rgba(37,211,102,.28)`, background: D.card, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', background: 'rgba(37,211,102,.06)', borderBottom: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#25D366', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Review Request · {variant.label}</span>
        <span style={{ fontSize: 10, color: D.muted }}>Send via WhatsApp</span>
      </div>
      {/* WhatsApp-style sent bubble */}
      <div style={{ padding: '14px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '85%', background: 'rgba(37,211,102,.18)', border: '1px solid rgba(37,211,102,.28)', borderRadius: '14px 14px 4px 14px', padding: '12px 14px', position: 'relative' }}>
          <p style={{ fontSize: 13.5, color: D.w, lineHeight: 1.72, margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>{variant.text}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: 10.5, color: 'rgba(37,211,102,.6)' }}>{variant.char_count} chars</span>
            <span style={{ fontSize: 11, color: 'rgba(37,211,102,.8)' }}>✓✓</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 14px 12px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`, background: done ? 'rgba(18,212,180,.1)' : D.faint, color: done ? D.teal : D.muted, minHeight: 34 }}>
          {done ? <><Check size={12}/> Copied!</> : <><Copy size={12}/> Copy message</>}
        </button>
      </div>
    </div>
  )
}

// ── 8. PRICING CARD FRAME — PricingNarrator ───────────────────
function PricingFrame({ variant }: { variant: CaptionVariant }) {
  const { done, copy } = useCopy(variant.text)
  const lines = variant.text.split(/\n+/).filter(Boolean)
  const priceMatch = variant.text.match(/₦[\d,]+(?:K|M)?/g)

  return (
    <div style={{ borderRadius: 14, border: `1.5px solid ${D.gl}35`, background: D.card, overflow: 'hidden', boxShadow: `0 4px 20px ${D.gold}0d` }}>
      {/* Price header */}
      <div style={{ padding: '12px 16px', background: `linear-gradient(135deg,rgba(224,152,24,.1),${D.card})`, borderBottom: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: D.gl, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Pricing narrative · {variant.label}</div>
          {priceMatch && <div style={{ fontSize: 22, fontWeight: 900, color: D.gl, fontFamily: "'Georgia',serif", lineHeight: 1 }}>{priceMatch[0]}</div>}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${D.gold}18`, border: `1px solid ${D.gold}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💰</div>
      </div>
      <div style={{ padding: '14px' }}>
        <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.78, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{variant.text}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`, background: done ? 'rgba(18,212,180,.1)' : D.faint, color: done ? D.teal : D.muted, minHeight: 34 }}>
            {done ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Frame router — picks the right visual per tool ─────────────
function VariantFrame({ toolId, variant, businessName, platform, isActive }: {
  toolId: string; variant: CaptionVariant; businessName: string;
  platform: string; isActive: boolean
}) {
  switch (toolId) {
    case 'ad-scribe':          return <AdUnitFrame variant={variant}/>
    case 'copy-brain':         return <CopyBriefFrame variant={variant}/>
    case 'promo-blast':        return <UrgencyFrame variant={variant}/>
    case 'bio-builder':        return <PlatformBioFrame variant={variant} platform={platform}/>
    case 'product-describer':  return <ProductFrame variant={variant} businessName={businessName}/>
    case 'review-requestor':   return <ReviewFrame variant={variant}/>
    case 'pricing-narrator':   return <PricingFrame variant={variant}/>
    default:                   return <InstagramFrame variant={variant} businessName={businessName} platform={platform}/>
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface CaptionGroupOutputProps {
  outputJson:    CaptionOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
  businessName:  string
}

export function CaptionGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave, businessName,
}: CaptionGroupOutputProps) {
  const [activeVariant, setActiveVariant] = useState(0)

  const variants    = outputJson.essentials?.variants ?? []
  const allHashtags = useMemo(() => [...new Set(variants.flatMap(v => v.hashtags ?? []))], [variants])
  const postingTime = outputJson.essentials?.posting_time ?? ''
  const platform    = outputJson.platform || 'Instagram'
  const headline    = outputJson.headline || 'Output generated'
  const pColor      = PLATFORM_COLORS[platform] ?? D.gold

  const allText = variants.map((v, i) =>
    `Variant ${i + 1} — ${v.label}\n${v.text}${v.hashtags.length ? '\n\n' + v.hashtags.map(h => `#${h}`).join(' ') : ''}`
  ).join('\n\n───\n\n')
  const { done: allDone, copy: copyAll } = useCopy(allText)

  // Tool label for display
  const toolLabels: Record<string, string> = {
    'caption-craft': '✍️ CaptionCraft', 'ad-scribe': '📢 AdScribe',
    'copy-brain': '🧠 CopyBrain AI', 'promo-blast': '🔥 PromoBlast',
    'bio-builder': '👤 BioBuilder', 'product-describer': '📦 ProductDescriber',
    'review-requestor': '⭐ ReviewRequestor', 'pricing-narrator': '💰 PricingNarrator',
  }

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`
        @media(max-width:600px){
          .cgo-actions{flex-direction:column!important}
          .cgo-actions>button{width:100%!important}
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${D.bdr}`, flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: D.w, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{headline}</span>
            <span style={{ fontSize: 11, color: D.muted, background: D.faint, border: `1px solid ${D.bdr}`, borderRadius: 20, padding: '2px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {toolLabels[toolId] || toolId} · {coinsSpent}⊙
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {onSave && (
              <button onClick={onSave} style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isSaved ? 'rgba(224,152,24,.4)' : D.bdr}`, background: isSaved ? 'rgba(224,152,24,.1)' : D.faint, color: isSaved ? D.gl : D.muted, cursor: 'pointer' }}>
                {isSaved ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${D.bdr}`, background: D.faint, color: D.muted, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, minHeight: 34 }}>
                <RefreshCw size={12}/>Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

          {/* Variant dot nav */}
          {variants.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {variants.length} variants
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {variants.map((_, i) => (
                  <button key={i} onClick={() => setActiveVariant(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer', background: activeVariant === i ? D.gl : D.bdr, transition: 'background .15s' }}/>
                ))}
              </div>
            </div>
          )}

          {/* Active variant frame */}
          {variants[activeVariant] && (
            <div style={{ marginBottom: 10 }}>
              <VariantFrame toolId={toolId} variant={variants[activeVariant]} businessName={businessName} platform={platform} isActive={true}/>
            </div>
          )}

          {/* Collapsed other variants */}
          {variants.length > 1 && variants.map((variant, i) => {
            if (i === activeVariant) return null
            return (
              <CollapsedVariant key={i} variant={variant} index={i} pColor={pColor} onSelect={() => setActiveVariant(i)}/>
            )
          })}

          {/* Hashtags */}
          {allHashtags.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <Hash size={13} style={{ color: D.teal }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Hashtags</span>
                <CopyBtn text={allHashtags.map(t => `#${t}`).join(' ')} label="Copy all"/>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allHashtags.map(tag => <HashPill key={tag} tag={tag}/>)}
              </div>
            </div>
          )}

          {/* Posting time */}
          {postingTime && (
            <div style={{ marginTop: 14, padding: '11px 14px', borderRadius: 10, background: 'rgba(224,152,24,.06)', border: '1px solid rgba(224,152,24,.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Clock size={14} style={{ color: D.gl, marginTop: 2, flexShrink: 0 }}/>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: D.gl, margin: '0 0 2px' }}>Best time to use this</p>
                <p style={{ fontSize: 12.5, color: D.dim, margin: 0, lineHeight: 1.55 }}>{postingTime}</p>
              </div>
            </div>
          )}

          {/* Deep Dive trigger */}
          <div style={{ marginTop: 18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="cgo-actions" style={{ padding: '10px 14px', borderTop: `1px solid ${D.bdr}`, display: 'flex', gap: 8, flexShrink: 0, background: 'rgba(6,12,26,.97)', backdropFilter: 'blur(14px)' }}>
          <button onClick={copyAll} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, border: `1px solid ${allDone ? 'rgba(18,212,180,.4)' : 'rgba(224,152,24,.35)'}`, background: allDone ? 'rgba(18,212,180,.14)' : 'rgba(224,152,24,.14)', color: allDone ? D.teal : D.gl, transition: 'all .18s', minHeight: 46 }}>
            {allDone ? <><Check size={14}/>All copied!</> : <><Copy size={14}/>Copy all {variants.length} variant{variants.length !== 1 ? 's' : ''}</>}
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(variants[activeVariant]?.text || '')}`, '_blank')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.25)', color: '#25D366', fontSize: 13.5, fontWeight: 700, minHeight: 46 }}>
            <Share2 size={14}/>
          </button>
        </div>

        {/* Deep Dive drawer */}
        <DeepDiveDrawer headline={headline}/>
      </div>
    </DeepDiveProvider>
  )
}

// Collapsed variant row
function CollapsedVariant({ variant, index, pColor, onSelect }: { variant: CaptionVariant; index: number; pColor: string; onSelect: () => void }) {
  const { done, copy } = useCopy(variant.text)
  return (
    <div onClick={onSelect} style={{ background: D.faint, border: `1px solid ${D.bdr}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', transition: 'border-color .15s' }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: `${pColor}14`, border: `1px solid ${pColor}28`, color: pColor, flexShrink: 0, marginTop: 2 }}>{variant.label}</span>
      <p style={{ fontSize: 12.5, color: D.muted, flex: 1, margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{variant.text}</p>
      <button onClick={e => { e.stopPropagation(); copy() }} style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, border: `1px solid ${D.bdr}`, background: D.faint, color: done ? D.teal : D.muted, display: 'flex', alignItems: 'center', gap: 3, minHeight: 30 }}>
        {done ? <><Check size={11}/>Copied</> : <><Copy size={11}/>Copy</>}
      </button>
    </div>
  )
}
