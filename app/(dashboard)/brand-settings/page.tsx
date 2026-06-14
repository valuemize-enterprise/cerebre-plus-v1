'use client'
// /app/(dashboard)/brand-settings/page.tsx
// Brand DNA setup — colors, font style, design voice, logo upload

import React, { useState, useEffect, useRef } from 'react'
import { Palette, Type, Sparkles, Upload, Check, RefreshCw, Eye } from 'lucide-react'

const NAVY='#0B1F3A';const NAVY2='#0D2040';const GOLD='#E09818';const GL='#F5B830'
const TEAL='#12D4B4';const DIM='rgba(205,217,236,0.65)';const MUTED='rgba(205,217,236,0.35)'
const B='rgba(255,255,255,0.08)';const W='#EBF2FC'

const FONT_STYLES = [
  { value:'modern',   label:'Modern',   desc:'Clean geometric sans-serif' },
  { value:'classic',  label:'Classic',  desc:'Elegant serif, authoritative' },
  { value:'bold',     label:'Bold',     desc:'Heavy display fonts, commanding' },
  { value:'elegant',  label:'Elegant',  desc:'Refined thin serif, luxury feel' },
  { value:'playful',  label:'Playful',  desc:'Rounded friendly fonts' },
]
const DESIGN_VOICES = [
  { value:'professional', label:'Professional', desc:'Polished, corporate, credible' },
  { value:'vibrant',      label:'Vibrant',      desc:'Energetic, colourful, Lagos energy' },
  { value:'warm',         label:'Warm',         desc:'Inviting, human, community-focused' },
  { value:'minimal',      label:'Minimal',      desc:'Clean, spacious, premium' },
  { value:'bold',         label:'Bold',         desc:'Strong, confident, market-leading' },
]
const PATTERNS = [
  { value:'none',      label:'None'      },
  { value:'geometric', label:'Geometric' },
  { value:'ankara',    label:'Ankara'    },
  { value:'dots',      label:'Dots'      },
  { value:'lines',     label:'Lines'     },
]

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <input type="color" value={value || '#E09818'} onChange={e => onChange(e.target.value)}
          style={{ width:44, height:44, border:'none', borderRadius:10, cursor:'pointer', background:'transparent' }}/>
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#E09818"
          style={{ flex:1, background:'rgba(255,255,255,0.06)', border:`1px solid ${B}`, borderRadius:10, padding:'10px 14px', color:W, fontFamily:'monospace', fontSize:13.5, outline:'none' }}/>
        <div style={{ width:44, height:44, borderRadius:10, background: value || '#555', border:`1px solid ${B}`, flexShrink:0 }}/>
      </div>
    </div>
  )
}

export default function BrandSettingsPage() {
  const [profile,  setProfile]  = useState<Record<string, string>>({})
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [uploading,setUploading]= useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/tools/brand-profile').then(r => r.json()).then(d => {
      if (d.profile) setProfile(d.profile)
    })
  }, [])

  const set = (key: string, val: string) => setProfile(p => ({ ...p, [key]: val }))

  const save = async () => {
    setSaving(true); setSaved(false)
    await fetch('/api/tools/brand-profile', {
      method: 'PUT', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        brand_primary_color:   profile.brand_primary_color,
        brand_secondary_color: profile.brand_secondary_color,
        brand_accent_color:    profile.brand_accent_color,
        brand_background_color:profile.brand_background_color,
        brand_font_style:      profile.brand_font_style,
        brand_design_voice:    profile.brand_design_voice,
        brand_logo_url:        profile.brand_logo_url,
        brand_pattern_pref:    profile.brand_pattern_pref,
      }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const uploadLogo = async (file: File) => {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('type', 'logo')
    const res = await fetch('/api/upload', { method:'POST', body:fd }).then(r => r.json())
    if (res.url) set('brand_logo_url', res.url)
    setUploading(false)
  }

  const pc = profile.brand_primary_color || '#E09818'
  const sc = profile.brand_secondary_color || '#0B1F3A'

  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:W, marginBottom:6 }}>Brand Settings</h1>
      <p style={{ fontSize:13.5, color:MUTED, marginBottom:28 }}>These settings are applied to every design you generate. Set them once — all tools use them automatically.</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Left column */}
        <div>
          {/* Colors */}
          <div style={{ background:NAVY2, border:`1px solid ${B}`, borderRadius:14, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
              <Palette size={15} style={{ color:GOLD }}/><h3 style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>Brand Colors</h3>
            </div>
            <ColorInput label="Primary Color" value={profile.brand_primary_color || ''} onChange={v => set('brand_primary_color', v)}/>
            <ColorInput label="Secondary Color" value={profile.brand_secondary_color || ''} onChange={v => set('brand_secondary_color', v)}/>
            <ColorInput label="Accent Color" value={profile.brand_accent_color || ''} onChange={v => set('brand_accent_color', v)}/>
            <ColorInput label="Background Color" value={profile.brand_background_color || ''} onChange={v => set('brand_background_color', v)}/>
          </div>

          {/* Logo */}
          <div style={{ background:NAVY2, border:`1px solid ${B}`, borderRadius:14, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Upload size={15} style={{ color:GOLD }}/><h3 style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>Brand Logo</h3>
            </div>
            <p style={{ fontSize:12.5, color:MUTED, marginBottom:14 }}>Upload your logo (PNG or SVG). It will be overlaid on every design automatically.</p>
            <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} style={{ display:'none' }}/>
            {profile.brand_logo_url
              ? (
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <img src={profile.brand_logo_url} alt="Brand logo" style={{ width:60, height:60, objectFit:'contain', background:'white', borderRadius:8, padding:4 }}/>
                  <button onClick={() => fileRef.current?.click()} style={{ flex:1, padding:'9px 14px', background:'rgba(255,255,255,0.06)', border:`1px solid ${B}`, borderRadius:10, color:DIM, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                    Replace logo
                  </button>
                </div>
              )
              : (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  style={{ width:'100%', padding:'16px', border:`2px dashed ${B}`, borderRadius:12, background:'rgba(255,255,255,0.03)', color:MUTED, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {uploading ? <><RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }}/>Uploading…</> : <><Upload size={14}/>Upload logo</>}
                </button>
              )
            }
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Font style */}
          <div style={{ background:NAVY2, border:`1px solid ${B}`, borderRadius:14, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Type size={15} style={{ color:GOLD }}/><h3 style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>Font Style</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {FONT_STYLES.map(f => (
                <button key={f.value} onClick={() => set('brand_font_style', f.value)} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, fontFamily:'inherit', cursor:'pointer',
                  background: profile.brand_font_style===f.value ? 'rgba(224,152,24,0.12)' : 'rgba(255,255,255,0.04)',
                  border:`1.5px solid ${profile.brand_font_style===f.value ? GOLD+'45' : B}`,
                  transition:'all .15s',
                }}>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontSize:13, fontWeight:700, color: profile.brand_font_style===f.value ? GL : DIM, margin:0 }}>{f.label}</p>
                    <p style={{ fontSize:11, color:MUTED, margin:0 }}>{f.desc}</p>
                  </div>
                  {profile.brand_font_style===f.value && <Check size={14} style={{ color:GL, flexShrink:0 }}/>}
                </button>
              ))}
            </div>
          </div>

          {/* Design voice */}
          <div style={{ background:NAVY2, border:`1px solid ${B}`, borderRadius:14, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Sparkles size={15} style={{ color:GOLD }}/><h3 style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>Design Voice</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {DESIGN_VOICES.map(v => (
                <button key={v.value} onClick={() => set('brand_design_voice', v.value)} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, fontFamily:'inherit', cursor:'pointer',
                  background: profile.brand_design_voice===v.value ? 'rgba(18,212,180,0.1)' : 'rgba(255,255,255,0.04)',
                  border:`1.5px solid ${profile.brand_design_voice===v.value ? TEAL+'45' : B}`, transition:'all .15s',
                }}>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontSize:13, fontWeight:700, color: profile.brand_design_voice===v.value ? TEAL : DIM, margin:0 }}>{v.label}</p>
                    <p style={{ fontSize:11, color:MUTED, margin:0 }}>{v.desc}</p>
                  </div>
                  {profile.brand_design_voice===v.value && <Check size={14} style={{ color:TEAL, flexShrink:0 }}/>}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern pref */}
          <div style={{ background:NAVY2, border:`1px solid ${B}`, borderRadius:14, padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:W, marginBottom:14 }}>Background Pattern</h3>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {PATTERNS.map(p => (
                <button key={p.value} onClick={() => set('brand_pattern_pref', p.value)} style={{
                  padding:'7px 14px', borderRadius:20, fontFamily:'inherit', fontSize:12.5, fontWeight:600, cursor:'pointer',
                  background: profile.brand_pattern_pref===p.value ? `${GL}20` : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${profile.brand_pattern_pref===p.value ? GL+'40' : B}`,
                  color: profile.brand_pattern_pref===p.value ? GL : MUTED, transition:'all .15s',
                }}>{p.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview + Save */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:24 }}>
        {/* Brand preview strip */}
        <div style={{ flex:1, height:44, borderRadius:12, background:`linear-gradient(90deg, ${pc} 0%, ${pc} 50%, ${sc} 50%, ${sc} 100%)`, border:`1px solid ${B}`, display:'flex', alignItems:'center', paddingLeft:14 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'white', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>Brand preview</span>
        </div>
        <button onClick={save} disabled={saving} style={{
          display:'flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:12,
          background: saved ? 'rgba(18,212,180,0.18)' : `linear-gradient(135deg,${GOLD},${GL})`,
          border:`1px solid ${saved ? TEAL+'50' : GOLD+'50'}`, fontFamily:'inherit',
          color: saved ? TEAL : '#071528', fontWeight:800, fontSize:14, cursor:'pointer', transition:'all .2s',
        }}>
          {saving ? <><RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }}/>Saving…</>
           : saved  ? <><Check size={14}/>Saved!</>
           :           'Save Brand Settings'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
