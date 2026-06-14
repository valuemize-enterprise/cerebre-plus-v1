'use client'
// /app/(dashboard)/design/page.tsx
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Zap, Settings, Clock, ChevronRight } from 'lucide-react'
import { DESIGN_TOOLS } from '@/lib/tools/design-registry'

const NAVY='#0B1F3A';const NAVY2='#0D2040';const GOLD='#E09818';const GL='#F5B830'
const TEAL='#12D4B4';const DIM='rgba(205,217,236,0.65)';const MUTED='rgba(205,217,236,0.35)'
const B='rgba(255,255,255,0.08)';const W='#EBF2FC'

const CATS = [
  { label:'Social Media',    tools:['social-post-designer','story-reel-designer','youtube-thumbnail-maker','quote-card-creator','carousel-slide-maker'] },
  { label:'Business',        tools:['linkedin-banner-designer','email-header-designer','flyer-designer','promo-card-designer','festive-banner-designer'] },
  { label:'Brand Assets',    tools:['logo-generator'] },
]

export default function DesignPage() {
  const [engine, setEngine]   = useState<'standard'|'premium'>('standard')
  const [hasBrand, setHasBrand] = useState(false)

  useEffect(() => {
    fetch('/api/tools/brand-profile')
      .then(r => r.json())
      .then(d => { if (d.profile?.brand_primary_color) setHasBrand(true) })
      .catch(() => {})
  }, [])

  return (
    <div style={{ maxWidth:1080, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:26, fontWeight:900, color:W, margin:0 }}>Design Tools</h1>
          <p style={{ fontSize:14, color:MUTED, marginTop:6 }}>AI-powered designs that automatically match your brand colors and logo</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Engine selector */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', border:`1px solid ${B}`, borderRadius:12, padding:4, gap:4 }}>
            {(['standard','premium'] as const).map(e => (
              <button key={e} onClick={() => setEngine(e)} style={{
                padding:'7px 16px', borderRadius:9, fontFamily:'inherit', fontWeight:700, fontSize:12.5,
                background: engine===e ? (e==='premium' ? `linear-gradient(135deg,${GOLD},${GL})` : 'rgba(255,255,255,0.12)') : 'transparent',
                border:'none', color: engine===e ? (e==='premium' ? '#071528' : W) : MUTED,
                cursor:'pointer', display:'flex', alignItems:'center', gap:5, transition:'all .18s',
              }}>
                {e==='premium' ? <Sparkles size={12}/> : <Zap size={12}/>}
                {e==='standard' ? 'Standard (DALL-E 3)' : 'Premium (Gemini)'}
              </button>
            ))}
          </div>
          <Link href="/brand-settings" style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, background: hasBrand ? 'rgba(18,212,180,0.12)' : 'rgba(224,152,24,0.15)', border:`1px solid ${hasBrand ? 'rgba(18,212,180,0.35)' : 'rgba(224,152,24,0.35)'}`, color: hasBrand ? TEAL : GL, fontSize:12.5, fontWeight:700, textDecoration:'none' }}>
            <Settings size={13}/>{hasBrand ? 'Brand set ✓' : 'Set brand colors'}
          </Link>
        </div>
      </div>

      {/* Brand prompt if not set */}
      {!hasBrand && (
        <div style={{ background:'rgba(224,152,24,0.08)', border:`1px solid rgba(224,152,24,0.3)`, borderLeft:`3px solid ${GOLD}`, borderRadius:12, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <p style={{ fontSize:13.5, fontWeight:700, color:GL, margin:'0 0 4px' }}>Set your brand colors for on-brand designs</p>
            <p style={{ fontSize:12.5, color:MUTED, margin:0 }}>Your primary color, secondary color, logo, and style preferences are applied to every design automatically.</p>
          </div>
          <Link href="/brand-settings" style={{ flexShrink:0, padding:'9px 18px', borderRadius:10, background:`linear-gradient(135deg,${GOLD},${GL})`, color:'#071528', fontWeight:800, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
            Set brand →
          </Link>
        </div>
      )}

      {/* Tool categories */}
      {CATS.map(cat => {
        const catTools = cat.tools.map(id => DESIGN_TOOLS.find(t => t.id === id)).filter(Boolean)
        return (
          <div key={cat.label} style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:'1.5px', textTransform:'uppercase', color:MUTED, marginBottom:14 }}>{cat.label}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
              {catTools.map(tool => {
                if (!tool) return null
                const coinCost = engine==='premium' ? tool.coinCostPremium : tool.coinCostStandard
                const isPremiumTool = tool.id === 'logo-generator' || tool.id === 'festive-banner-designer' || tool.id === 'carousel-slide-maker'
                return (
                  <Link key={tool.id} href={`/design/${tool.id}?engine=${engine}`} style={{ textDecoration:'none' }}>
                    <div style={{
                      background:NAVY2, border:`1px solid ${B}`, borderRadius:14, padding:'18px 16px',
                      cursor:'pointer', transition:'all .18s', height:'100%', display:'flex', flexDirection:'column',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border=`1px solid ${tool.accentColor}40`; (e.currentTarget as HTMLElement).style.background='rgba(13,32,64,0.95)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border=`1px solid ${B}`; (e.currentTarget as HTMLElement).style.background=NAVY2 }}
                    >
                      <div style={{ fontSize:26, marginBottom:10 }}>{tool.icon}</div>
                      <h3 style={{ fontFamily:"'Georgia',serif", fontSize:14.5, fontWeight:700, color:W, margin:'0 0 6px' }}>{tool.name}</h3>
                      <p style={{ fontSize:12, color:MUTED, margin:'0 0 12px', lineHeight:1.5, flex:1 }}>{tool.tagline}</p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${tool.accentColor}18`, color:tool.accentColor }}>
                          {coinCost} coins
                        </span>
                        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:MUTED }}>
                          {tool.variants > 1 && `${tool.id === 'carousel-slide-maker' ? '5–8 slides' : `${tool.variants} variants`}`}
                          <ChevronRight size={11}/>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Recent designs */}
      <DesignHistoryPreview />
    </div>
  )
}

function DesignHistoryPreview() {
  const [recent, setRecent] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/tools/design-history?limit=6')
      .then(r => r.json())
      .then(d => setRecent(d.designs || []))
      .catch(() => {})
  }, [])
  if (!recent.length) return null
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <Clock size={14} style={{ color:MUTED }}/>
        <h2 style={{ fontSize:13, fontWeight:800, letterSpacing:'1.5px', textTransform:'uppercase', color:MUTED, margin:0 }}>Recent Designs</h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10 }}>
        {recent.map(d => (
          <div key={d.id} style={{ background:NAVY2, border:`1px solid ${B}`, borderRadius:10, overflow:'hidden' }}>
            {d.image_urls?.[0] && <img src={d.image_urls[0]} alt={d.tool_name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }}/>}
            <div style={{ padding:'8px 10px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:DIM, margin:0 }}>{d.tool_name}</p>
              <p style={{ fontSize:10, color:MUTED, margin:'2px 0 0' }}>{d.engine} · {d.coins_spent}c</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
