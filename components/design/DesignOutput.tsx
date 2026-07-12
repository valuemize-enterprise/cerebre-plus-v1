'use client'
// ═══════════════════════════════════════════════════════════════
// /components/design/DesignOutput.tsx
//
// Output component for all Design Studio tools.
// Handles both the PREVIEW phase (single low-quality image + coin CTA)
// and the SAVED phase (4 variations grid + download buttons + brand DNA badge).
//
// Special handling per tool:
//   logo-generator         → SVG/PNG tabs, 3-variant display (icon/wordmark/combo)
//   festive-banner-designer → date chip overlay
//   carousel-slide-maker    → slide sequence navigator
//   All others             → 2-4 variations grid
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import {
  Download, RefreshCw, Maximize2, X, Check, Zap, Star,
  Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Copy,
} from 'lucide-react'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:'#060C1A', navy:'#0B1F3A', card:'#0D2040',
  gold:'#E09818', gl:'#F5B830',   teal:'#12D4B4',
  green:'#22C55E', purple:'#8B7FFF', red:'#E55252',
  w:'#EBF2FC', dim:'rgba(205,217,236,.72)',
  muted:'rgba(205,217,236,.38)', faint:'rgba(255,255,255,.04)',
  bdr:'rgba(255,255,255,.08)',
}

// ── Types ───────────────────────────────────────────────────────
export interface DesignPreviewResult {
  previewDataUrl:  string
  coinCost:        number
  engine:          'standard' | 'premium'
  brandApplied?:   { primaryColor: string; logoOverlaid: boolean }
}

export interface DesignSavedResult {
  imageUrls:       string[]
  coinCost:        number
  engine:          'standard' | 'premium'
  generationId:    string | null
  brandApplied:    { primaryColor: string; logoOverlaid: boolean; footerApplied: boolean }
  // Logo Generator extras
  urls?:           Record<string, string>
  svgs?:           { icon: boolean; wordmark: boolean; combination: boolean }
}

interface Props {
  toolId:          string
  toolName:        string
  preview?:        DesignPreviewResult | null
  saved?:          DesignSavedResult   | null
  isGenerating?:   boolean
  isSaving?:       boolean
  loadingMessage?: string
  engine:          'standard' | 'premium'
  onEngineChange?: (e: 'standard' | 'premium') => void
  onPreview?:      () => void
  onSave?:         () => void
  onRegenerate?:   () => void
  coinBalance?:    number
}

// ── Standard/Premium toggle ────────────────────────────────────
function EnginePicker({ value, onChange, standardCost, premiumCost, balance }: {
  value: 'standard' | 'premium'
  onChange: (e: 'standard' | 'premium') => void
  standardCost: number
  premiumCost:  number
  balance:      number
}) {
  return (
    <div style={{ display:'flex', gap:8 }}>
      {(['standard','premium'] as const).map(eng => {
        const cost = eng === 'standard' ? standardCost : premiumCost
        const canAfford = balance >= cost
        const isActive  = value === eng
        const color     = eng === 'premium' ? D.gl : D.teal
        return (
          <button key={eng} onClick={() => onChange(eng)} style={{
            flex:1, padding:'10px 12px', borderRadius:10, cursor:'pointer',
            fontFamily:'inherit', textAlign:'left',
            border:`1.5px solid ${isActive ? color+'50' : D.bdr}`,
            background: isActive ? `${color}10` : D.faint,
            transition:'all .18s',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              {eng === 'premium'
                ? <Star size={12} style={{ color:D.gl, fill:D.gl }}/>
                : <Zap size={12} style={{ color:D.teal }}/>
              }
              <span style={{ fontSize:12.5, fontWeight:700, color: isActive ? color : D.muted, textTransform:'capitalize' }}>{eng}</span>
              {isActive && <span style={{ marginLeft:'auto', width:14, height:14, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Check size={9} style={{ color:'#000' }}/>
              </span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:14, fontWeight:800, color: isActive ? color : D.dim }}>⊙ {cost}</span>
              <span style={{ fontSize:10.5, color:D.muted }}>coins</span>
              {!canAfford && <span style={{ fontSize:10, color:D.red, marginLeft:4 }}>· Low balance</span>}
            </div>
            <p style={{ fontSize:10, color:D.muted, margin:'3px 0 0', lineHeight:1.4 }}>
              {eng === 'standard' ? 'gpt-image-2 · medium quality' : 'Gemini Imagen 3 · high detail'}
            </p>
          </button>
        )
      })}
    </div>
  )
}

// ── Brand DNA badge ────────────────────────────────────────────
function BrandDNABadge({ brandApplied }: {
  brandApplied: { primaryColor: string; logoOverlaid: boolean; footerApplied?: boolean }
}) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
      borderRadius:9, background:'rgba(18,212,180,.06)', border:'1px solid rgba(18,212,180,.2)',
    }}>
      <div style={{ width:14, height:14, borderRadius:3, background: brandApplied.primaryColor, border:`1.5px solid rgba(255,255,255,.2)`, flexShrink:0 }}/>
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:D.teal, margin:0, letterSpacing:'.3px' }}>Brand DNA applied</p>
        <p style={{ fontSize:10.5, color:D.muted, margin:0 }}>
          {brandApplied.primaryColor}
          {brandApplied.logoOverlaid ? ' · Logo overlaid' : ''}
          {brandApplied.footerApplied ? ' · Footer strip' : ''}
        </p>
      </div>
    </div>
  )
}

// ── Lightbox ───────────────────────────────────────────────────
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,.9)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <button onClick={onClose} style={{
        position:'absolute', top:16, right:16, width:36, height:36, borderRadius:8,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
        cursor:'pointer', color:D.w,
      }}>
        <X size={16}/>
      </button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()}
        style={{ maxWidth:'95vw', maxHeight:'90vh', objectFit:'contain', borderRadius:10 }}/>
    </div>
  )
}

// ── Festive Banner — event date chip overlay ───────────────────
function FestiveDateChip({ headline }: { headline: string }) {
  // Extract date/event from headline: "Christmas banner for..." → "Christmas"
  const eventMatch = headline.match(/^([A-Za-z\s]+(?:banner|card|design|post)?)/i)
  const event = eventMatch?.[1]?.replace(/(banner|card|design|post)/gi, '').trim() || 'Festive Event'
  const today = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderRadius: 10, marginBottom: 12,
      background: 'linear-gradient(135deg,rgba(224,152,24,.12),rgba(245,184,48,.06))',
      border: '1.5px solid rgba(224,152,24,.35)',
    }}>
      <span style={{ fontSize: 20 }}>🎉</span>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: D.gl, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>Festive Banner</p>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: D.w, margin: 0 }}>{event}</p>
      </div>
      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
        <p style={{ fontSize: 10.5, color: D.muted, margin: '0 0 2px' }}>Generated</p>
        <p style={{ fontSize: 12, fontWeight: 600, color: D.dim, margin: 0 }}>{today}</p>
      </div>
    </div>
  )
}

// ── LinkedIn Banner — profile preview mockup ───────────────────
function LinkedInBannerPreview({ imageUrl, businessName }: { imageUrl: string; businessName?: string }) {
  const name    = businessName || 'Your Business Name'
  const initial = name[0]?.toUpperCase() || 'B'
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden', marginBottom: 12,
      border: `1px solid rgba(10,102,194,.3)`,
      background: '#1B1F23',
    }}>
      {/* LinkedIn profile header label */}
      <div style={{ padding: '8px 12px', background: 'rgba(10,102,194,.1)', borderBottom: '1px solid rgba(10,102,194,.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#0A66C2', letterSpacing: '.5px' }}>LinkedIn profile preview</span>
      </div>
      {/* Banner image */}
      <div style={{ position: 'relative', height: 100, overflow: 'hidden' }}>
        <img src={imageUrl} alt="LinkedIn banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        {/* Profile avatar overlapping the banner */}
        <div style={{
          position: 'absolute', bottom: -20, left: 16,
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0A66C2,#004182)',
          border: '3px solid #1B1F23',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: '#fff',
        }}>{initial}</div>
      </div>
      {/* Name area */}
      <div style={{ padding: '28px 16px 14px' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{name}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: 0 }}>Your headline · Your City, Nigeria</p>
      </div>
    </div>
  )
}

// ── Variation card ─────────────────────────────────────────────
function VariationCard({ url, index, toolId, onLightbox }: {
  url: string; index: number; toolId: string; onLightbox: (url: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const download = useCallback(() => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${toolId}-variation-${index + 1}.png`
    a.click()
  }, [url, toolId, index])

  const copyUrl = useCallback(async () => {
    await navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }, [url])

  return (
    <div style={{
      borderRadius:12, overflow:'hidden', border:`1px solid ${D.bdr}`,
      background:D.faint, position:'relative',
      transition:'all .18s',
    }}>
      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'1', cursor:'zoom-in' }} onClick={() => onLightbox(url)}>
        <img src={url} alt={`Variation ${index + 1}`}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          loading="lazy"/>
        <div style={{
          position:'absolute', inset:0, background:'rgba(0,0,0,0)',
          display:'flex', alignItems:'center', justifyContent:'center',
          opacity:0, transition:'all .2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.3)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)' }}
        >
          <Maximize2 size={22} style={{ color:'#fff' }}/>
        </div>
      </div>
      {/* Footer */}
      <div style={{ padding:'8px 10px', display:'flex', alignItems:'center', gap:6, borderTop:`1px solid ${D.bdr}` }}>
        <span style={{ fontSize:10.5, fontWeight:700, color:D.muted }}>V{index + 1}</span>
        <div style={{ flex:1 }}/>
        <button onClick={copyUrl} style={{ padding:'4px 8px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:10.5, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color: copied ? D.teal : D.muted, display:'flex', alignItems:'center', gap:3 }}>
          {copied ? <><Check size={10}/>Copied</> : <><Copy size={10}/>URL</>}
        </button>
        <button onClick={download} style={{ padding:'4px 8px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:10.5, fontWeight:700, border:`1px solid rgba(18,212,180,.3)`, background:'rgba(18,212,180,.07)', color:D.teal, display:'flex', alignItems:'center', gap:3 }}>
          <Download size={10}/> PNG
        </button>
      </div>
    </div>
  )
}

// ── Logo-specific output ───────────────────────────────────────
function LogoOutput({ saved }: { saved: DesignSavedResult }) {
  const [activeTab, setActiveTab] = useState<'png'|'svg'>('png')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const pngs    = saved.imageUrls ?? []
  const svgUrls = Object.entries(saved.urls ?? {}).filter(([k]) => k.endsWith('_svg'))

  const downloadSVG = (url: string, label: string) => {
    const a = document.createElement('a')
    a.href = url; a.download = `logo-${label}.svg`; a.click()
  }

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {(['png','svg'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex:1, padding:'9px', borderRadius:9, cursor:'pointer', fontFamily:'inherit',
            fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px',
            border:`1.5px solid ${activeTab===tab?D.gl+'50':D.bdr}`,
            background: activeTab===tab?`rgba(245,184,48,.1)`:D.faint,
            color: activeTab===tab?D.gl:D.muted,
          }}>
            {tab === 'png' ? '🖼 PNG Files' : '✦ SVG Vector'}
          </button>
        ))}
      </div>

      {activeTab === 'png' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:12 }}>
            {pngs.map((url, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${D.bdr}`, marginBottom:5, cursor:'zoom-in' }} onClick={() => setLightboxUrl(url)}>
                  <img src={url} alt={`Logo ${i+1}`} style={{ width:'100%', aspectRatio:'1', objectFit:'contain', background:'rgba(255,255,255,.05)', display:'block' }}/>
                </div>
                <p style={{ fontSize:10.5, color:D.muted, margin:'0 0 4px' }}>
                  {url.includes('_32') ? '32px' : url.includes('_512') ? '512px' : '1500px'}
                </p>
                <button onClick={() => { const a = document.createElement('a'); a.href = url; a.download = `logo-${i+1}.png`; a.click() }}
                  style={{ width:'100%', padding:'5px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid rgba(18,212,180,.3)`, background:'rgba(18,212,180,.07)', color:D.teal, display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>
                  <Download size={10}/> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'svg' && (
        <div>
          {svgUrls.length === 0
            ? <p style={{ fontSize:13, color:D.muted, textAlign:'center', padding:20 }}>SVG files will appear here after generation.</p>
            : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {svgUrls.map(([key, url]) => {
                  const label = key.replace('_svg','').replace('_',' ')
                  return (
                    <div key={key} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, background:D.faint, border:`1px solid ${D.bdr}` }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:'rgba(245,184,48,.1)', border:'1px solid rgba(245,184,48,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>✦</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:D.w, margin:'0 0 2px', textTransform:'capitalize' }}>{label}</p>
                        <p style={{ fontSize:10.5, color:D.muted, margin:0 }}>SVG vector · scalable to any size</p>
                      </div>
                      <button onClick={() => downloadSVG(url, label)} style={{ padding:'7px 14px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${D.gl}35`, background:`rgba(245,184,48,.1)`, color:D.gl, display:'flex', alignItems:'center', gap:5 }}>
                        <Download size={12}/> SVG
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      )}

      {lightboxUrl && <Lightbox src={lightboxUrl} alt="Logo" onClose={() => setLightboxUrl(null)}/>}
    </div>
  )
}

// ── Carousel slide navigator ───────────────────────────────────
function CarouselOutput({ saved }: { saved: DesignSavedResult }) {
  const [current, setCurrent] = useState(0)
  const urls = saved.imageUrls ?? []
  const url  = urls[current]
  const [lb, setLb] = useState<string | null>(null)

  return (
    <div>
      {/* Current slide */}
      {url && (
        <div style={{ borderRadius:14, overflow:'hidden', marginBottom:14, border:`1px solid ${D.bdr}`, cursor:'zoom-in' }} onClick={() => setLb(url)}>
          <img src={url} alt={`Slide ${current + 1}`} style={{ width:'100%', display:'block', aspectRatio:'1', objectFit:'cover' }}/>
        </div>
      )}
      {/* Slide nav */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <button onClick={() => setCurrent(Math.max(0, current-1))} disabled={current===0}
          style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${D.bdr}`, background:D.faint, cursor:current===0?'not-allowed':'pointer', color:current===0?D.bdr:D.muted, opacity:current===0?.4:1 }}>
          <ChevronLeft size={16}/>
        </button>
        <div style={{ flex:1, display:'flex', gap:5, justifyContent:'center', flexWrap:'wrap' }}>
          {urls.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width:8, height:8, borderRadius:'50%', border:'none', padding:0, cursor:'pointer', background: i===current?D.teal:D.bdr, transition:'background .15s' }}/>
          ))}
        </div>
        <button onClick={() => setCurrent(Math.min(urls.length-1, current+1))} disabled={current===urls.length-1}
          style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${D.bdr}`, background:D.faint, cursor:current===urls.length-1?'not-allowed':'pointer', color:current===urls.length-1?D.bdr:D.muted, opacity:current===urls.length-1?.4:1 }}>
          <ChevronRight size={16}/>
        </button>
      </div>
      <p style={{ textAlign:'center', fontSize:12, color:D.muted, marginBottom:12 }}>
        Slide {current + 1} of {urls.length}
      </p>
      {/* Download all */}
      <button onClick={() => urls.forEach((u, i) => { const a = document.createElement('a'); a.href = u; a.download = `slide-${i+1}.png`; a.click() })}
        style={{ width:'100%', padding:'10px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, border:`1px solid rgba(18,212,180,.3)`, background:'rgba(18,212,180,.08)', color:D.teal, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        <Download size={14}/> Download all {urls.length} slides
      </button>
      {lb && <Lightbox src={lb} alt="Slide" onClose={() => setLb(null)}/>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function DesignOutput({
  toolId, toolName, preview, saved, isGenerating, isSaving,
  loadingMessage, engine, onEngineChange, onPreview, onSave, onRegenerate,
  coinBalance = 0,
}: Props) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Per-tool coin costs from design registry (passed in via props or hardcoded fallback)
  const STANDARD_COSTS: Record<string, number> = {
    'social-post-designer':17, 'story-reel-designer':17, 'youtube-thumbnail-maker':14,
    'quote-card-creator':10, 'promo-card-designer':17, 'linkedin-banner-designer':17,
    'email-header-designer':10, 'flyer-designer':24, 'festive-banner-designer':17,
    'logo-generator':35, 'carousel-slide-maker':50,
  }
  const PREMIUM_COSTS: Record<string, number> = {
    'social-post-designer':28, 'story-reel-designer':28, 'youtube-thumbnail-maker':21,
    'quote-card-creator':17, 'promo-card-designer':28, 'linkedin-banner-designer':28,
    'email-header-designer':17, 'flyer-designer':42, 'festive-banner-designer':28,
    'logo-generator':56, 'carousel-slide-maker':84,
  }

  const standardCost = STANDARD_COSTS[toolId] ?? 20
  const premiumCost  = PREMIUM_COSTS[toolId]  ?? 35

  // ── Loading ─────────────────────────────────────────────────
  if (isGenerating || isSaving) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', gap:16, minHeight:300 }}>
        <style>{`@keyframes ds-spin{to{transform:rotate(360deg)}}@keyframes ds-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        <div style={{ width:52, height:52, borderRadius:'50%', border:`3px solid rgba(224,152,24,.2)`, borderTopColor:D.gold, animation:'ds-spin 1s linear infinite' }}/>
        <p style={{ fontSize:14, fontWeight:600, color:D.dim, textAlign:'center', lineHeight:1.6 }}>
          {loadingMessage || (isSaving ? 'Saving at full quality…' : 'Generating preview…')}
        </p>
        {engine === 'premium' && (
          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(245,184,48,.1)', border:'1px solid rgba(245,184,48,.25)', color:D.gl }}>
            ✦ Premium quality · Gemini Imagen 3
          </span>
        )}
      </div>
    )
  }

  // ── IDLE / engine picker ────────────────────────────────────
  if (!preview && !saved) {
    return (
      <div style={{ padding:'14px' }}>
        <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:12 }}>
          Choose quality tier
        </p>
        {onEngineChange && (
          <EnginePicker
            value={engine}
            onChange={onEngineChange}
            standardCost={standardCost}
            premiumCost={premiumCost}
            balance={coinBalance}
          />
        )}
        <div style={{ marginTop:14, padding:'10px 14px', borderRadius:9, background:'rgba(18,212,180,.05)', border:'1px solid rgba(18,212,180,.15)' }}>
          <p style={{ fontSize:12, color:D.muted, margin:0, lineHeight:1.6 }}>
            💡 <strong style={{ color:D.teal }}>Preview is free</strong> — see a low-quality version before committing coins. Save to get full-quality with brand DNA applied.
          </p>
        </div>
      </div>
    )
  }

  // ── PREVIEW ─────────────────────────────────────────────────
  if (preview && !saved) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {/* Preview image */}
        <div style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${D.bdr}`, cursor:'zoom-in', position:'relative' }} onClick={() => setLightboxUrl(preview.previewDataUrl)}>
          <img src={preview.previewDataUrl} alt="Preview" style={{ width:'100%', display:'block' }}/>
          <div style={{ position:'absolute', top:8, left:8, padding:'3px 9px', borderRadius:20, background:'rgba(0,0,0,.7)', fontSize:10, fontWeight:700, color:'rgba(255,255,255,.7)', letterSpacing:'.5px' }}>
            PREVIEW · Low quality
          </div>
        </div>

        {/* Engine picker */}
        {onEngineChange && (
          <EnginePicker
            value={engine}
            onChange={onEngineChange}
            standardCost={standardCost}
            premiumCost={premiumCost}
            balance={coinBalance}
          />
        )}

        {/* Save CTA */}
        <button onClick={onSave} disabled={coinBalance < (engine === 'premium' ? premiumCost : standardCost)}
          style={{
            width:'100%', padding:'14px', borderRadius:12, cursor: coinBalance < (engine === 'premium' ? premiumCost : standardCost) ? 'not-allowed' : 'pointer',
            fontFamily:'inherit', fontSize:14, fontWeight:800,
            border:`1.5px solid rgba(224,152,24,.4)`,
            background: coinBalance < (engine === 'premium' ? premiumCost : standardCost) ? 'rgba(255,255,255,.04)' : 'rgba(224,152,24,.14)',
            color: coinBalance < (engine === 'premium' ? premiumCost : standardCost) ? D.muted : D.gl,
            opacity: coinBalance < (engine === 'premium' ? premiumCost : standardCost) ? .5 : 1,
          }}>
          Save at full quality · {engine === 'premium' ? premiumCost : standardCost} ⊙ coins
        </button>

        {onRegenerate && (
          <button onClick={onRegenerate} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted }}>
            <RefreshCw size={13}/> Try again (free)
          </button>
        )}

        {lightboxUrl && <Lightbox src={lightboxUrl} alt="Preview" onClose={() => setLightboxUrl(null)}/>}
      </div>
    )
  }

  // ── SAVED ───────────────────────────────────────────────────
  if (!saved) return null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Brand DNA badge */}
      {saved.brandApplied?.primaryColor && (
        <BrandDNABadge brandApplied={saved.brandApplied}/>
      )}

      {/* Tool-specific header elements */}
      {toolId === 'festive-banner-designer' && (
        <FestiveDateChip headline={toolName}/>
      )}
      {toolId === 'linkedin-banner-designer' && saved.imageUrls[0] && (
        <LinkedInBannerPreview imageUrl={saved.imageUrls[0]}/>
      )}

      {/* Image output — tool-specific rendering */}
      {toolId === 'logo-generator' ? (
        <LogoOutput saved={saved}/>
      ) : toolId === 'carousel-slide-maker' ? (
        <CarouselOutput saved={saved}/>
      ) : (
        /* Standard 2-4 grid */
        <div style={{ display:'grid', gridTemplateColumns: saved.imageUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap:10 }}>
          {saved.imageUrls.map((url, i) => (
            <VariationCard key={i} url={url} index={i} toolId={toolId} onLightbox={setLightboxUrl}/>
          ))}
        </div>
      )}

      {/* Regenerate */}
      {onRegenerate && (
        <button onClick={onRegenerate} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, marginTop:4 }}>
          <RefreshCw size={13}/> Generate new variations
        </button>
      )}

      {/* Lightbox */}
      {lightboxUrl && <Lightbox src={lightboxUrl} alt="Design" onClose={() => setLightboxUrl(null)}/>}
    </div>
  )
}

export default DesignOutput
