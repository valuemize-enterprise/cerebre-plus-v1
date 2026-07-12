'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/IntelligenceGroupOutput.tsx
//
// Group 7 — Intelligence & Profiles
// Tools: audience-profiler, brand-positioner, keyword-hunter,
//        local-seo-kit, google-ad-craft
//
// Visual modes:
//   audience-profiler  → ProfileCardView   (customer profile card)
//   brand-positioner   → ManifestoView     (positioning statement + 3 pillars)
//   keyword-hunter     → KeywordGridView   (keyword cards with volume + competition)
//   local-seo-kit      → LocalSEOView      (city dashboard + Google Business checklist)
//   google-ad-craft    → GoogleAdView      (exact Google search result preview)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import {
  Copy, Check, RefreshCw, Bookmark, BookmarkCheck, Search, MapPin,
} from 'lucide-react'
import type { IntelligenceOutput, IntelFinding } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:'#060C1A', navy:'#0B1F3A', card:'#0D2040',
  gold:'#E09818', gl:'#F5B830',   teal:'#12D4B4',
  red:'#E55252',  green:'#22C55E', purple:'#8B7FFF', amber:'#F97316',
  blue:'#3B82F6', w:'#EBF2FC',
  dim:'rgba(205,217,236,.72)', muted:'rgba(205,217,236,.38)',
  faint:'rgba(255,255,255,.04)', bdr:'rgba(255,255,255,.08)',
}

const IMPORTANCE_COLOR: Record<string,string> = {
  High:D.red, Medium:D.amber, Low:D.muted,
}

function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

function CopyBtn({ text, label='Copy', color=D.muted }: { text:string; label?:string; color?:string }) {
  const { done, copy } = useCopy(text)
  return (
    <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:color, transition:'all .18s', minHeight:30 }}>
      {done?<Check size={11}/>:<Copy size={11}/>} {done?'Copied!':label}
    </button>
  )
}

// ── Shared: Immediate Action card ─────────────────────────────
function ActionCard({ text }: { text: string }) {
  const { done, copy } = useCopy(text)
  return (
    <div style={{ padding:'11px 14px', borderRadius:10, background:'rgba(18,212,180,.06)', border:'1px solid rgba(18,212,180,.2)', display:'flex', alignItems:'flex-start', gap:9 }}>
      <span style={{ fontSize:15, flexShrink:0 }}>⚡</span>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:10, fontWeight:700, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>Do this immediately</p>
        <p style={{ fontSize:13.5, fontWeight:600, color:D.w, lineHeight:1.6, margin:'0 0 8px' }}>{text}</p>
        <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 9px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted }}>
          {done?<><Check size={10}/>Copied</>:<><Copy size={10}/>Copy</>}
        </button>
      </div>
    </div>
  )
}

// ── Shared: Finding rows ───────────────────────────────────────
function FindingRow({ finding, index }: { finding: IntelFinding; index: number }) {
  const impColor = IMPORTANCE_COLOR[finding.importance] ?? D.muted
  const { done, copy } = useCopy(finding.value)
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderTop:index>0?`1px solid ${D.bdr}`:'none' }}>
      <span style={{ minWidth:8, height:8, borderRadius:'50%', background:impColor, marginTop:5, flexShrink:0 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:11, fontWeight:700, color:impColor, margin:'0 0 2px', letterSpacing:'.3px' }}>{finding.label}</p>
        <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{finding.value}</p>
      </div>
      <button onClick={copy} style={{ padding:'3px 8px', borderRadius:5, cursor:'pointer', fontFamily:'inherit', fontSize:10.5, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted, flexShrink:0 }}>
        {done?<Check size={10}/>:<Copy size={10}/>}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 1. PROFILE CARD VIEW — AudienceProfiler
// ═══════════════════════════════════════════════════════════════
function ProfileCardView({ output }: { output: IntelligenceOutput }) {
  const { core_insight, findings, immediate_action } = output.essentials ?? {}

  // Map findings into profile sections
  const psycho    = findings?.find(f => /psycho|mind|value|belief|attitude/i.test(f.label))
  const triggers  = findings?.find(f => /trigger|buy|purchas|motivat/i.test(f.label))
  const objection = findings?.find(f => /object|hesit|worry|concern|fear/i.test(f.label))
  const language  = findings?.find(f => /language|word|phrase|say|speak/i.test(f.label))
  const other     = findings?.filter(f => f !== psycho && f !== triggers && f !== objection && f !== language) ?? []

  const panels: Array<{ label:string; icon:string; finding:IntelFinding|undefined; color:string }> = [
    { label:'Mindset & values',   icon:'🧠', finding:psycho,    color:D.purple },
    { label:'Buying triggers',    icon:'🎯', finding:triggers,  color:D.green  },
    { label:'Objections',         icon:'🤔', finding:objection, color:D.red    },
    { label:'Language patterns',  icon:'💬', finding:language,  color:D.teal   },
  ]

  return (
    <div>
      {/* Core insight */}
      {core_insight && (
        <div style={{ padding:'14px 16px', borderRadius:12, background:`linear-gradient(135deg,rgba(139,127,255,.06),${D.card})`, border:`1.5px solid rgba(139,127,255,.25)`, marginBottom:14, display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(139,127,255,.18)', border:'2px solid rgba(139,127,255,.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>👤</div>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:D.purple, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>Ideal customer profile</p>
            <p style={{ fontSize:14, color:D.w, lineHeight:1.6, margin:0, fontWeight:600 }}>{core_insight}</p>
          </div>
        </div>
      )}

      {/* 4 profile panels */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {panels.map(({ label, icon, finding, color }) => (
          <div key={label} style={{ padding:'12px', borderRadius:10, background:D.faint, border:`1px solid ${D.bdr}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <span style={{ fontSize:14 }}>{icon}</span>
              <span style={{ fontSize:10.5, fontWeight:700, color, letterSpacing:'.5px', textTransform:'uppercase' }}>{label}</span>
            </div>
            {finding
              ? <p style={{ fontSize:12.5, color:D.dim, lineHeight:1.6, margin:0 }}>{finding.value}</p>
              : <p style={{ fontSize:12, color:D.muted, margin:0 }}>See Deep Dive for details</p>}
          </div>
        ))}
      </div>

      {/* Additional findings */}
      {other.length > 0 && (
        <div style={{ background:D.faint, borderRadius:10, border:`1px solid ${D.bdr}`, padding:'0 14px', marginBottom:14 }}>
          {other.map((f,i) => <FindingRow key={i} finding={f} index={i}/>)}
        </div>
      )}

      {immediate_action && <ActionCard text={immediate_action}/>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 2. BRAND MANIFESTO — BrandPositioner
// ═══════════════════════════════════════════════════════════════
function ManifestoView({ output }: { output: IntelligenceOutput }) {
  const { core_insight, findings, immediate_action } = output.essentials ?? {}
  const { done, copy } = useCopy(core_insight ?? '')

  // Extract the 3 differentiator pillars from findings
  const pillars = (findings ?? []).slice(0, 3)

  return (
    <div>
      {/* Positioning statement — hero card */}
      <div style={{ borderRadius:16, border:`2px solid rgba(224,152,24,.35)`, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'6px 0', background:`linear-gradient(90deg,rgba(224,152,24,.12),rgba(245,184,48,.06),rgba(224,152,24,.12))`, display:'flex', justifyContent:'center' }}>
          <span style={{ fontSize:9, fontWeight:800, color:D.gl, letterSpacing:'3px', textTransform:'uppercase' }}>Brand Positioning Statement</span>
        </div>
        <div style={{ padding:'24px 20px', background:`linear-gradient(135deg,rgba(224,152,24,.04),${D.card})`, textAlign:'center' }}>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:18, fontWeight:700, color:D.w, lineHeight:1.65, margin:'0 0 16px', fontStyle:'italic' }}>
            "{core_insight}"
          </p>
          <button onClick={copy} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 16px', borderRadius:20, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':'rgba(224,152,24,.4)'}`, background:done?'rgba(18,212,180,.1)':'rgba(224,152,24,.1)', color:done?D.teal:D.gl }}>
            {done?<><Check size={11}/>Copied!</>:<><Copy size={11}/>Copy statement</>}
          </button>
        </div>
      </div>

      {/* 3 differentiator pillars */}
      {pillars.length > 0 && (
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:10 }}>Differentiator pillars</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
            {pillars.map((p, i) => {
              const colors = [D.teal, D.gl, D.purple]
              const c      = colors[i] ?? D.teal
              return (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'12px 14px', borderRadius:10, background:D.faint, border:`1px solid ${D.bdr}` }}>
                  <div style={{ minWidth:28, height:28, borderRadius:8, background:`${c}18`, border:`1px solid ${c}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:c, flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:c, margin:'0 0 3px' }}>{p.label}</p>
                    <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{p.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {immediate_action && <ActionCard text={immediate_action}/>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 3. KEYWORD GRID — KeywordHunter
// ═══════════════════════════════════════════════════════════════
const COMP_LABEL: Record<string,string> = { High:'High competition', Medium:'Medium competition', Low:'Low — opportunity' }
const COMP_COLOR: Record<string,string> = { High:D.red, Medium:D.amber, Low:D.green }

function KeywordGridView({ output }: { output: IntelligenceOutput }) {
  const { core_insight, findings, immediate_action } = output.essentials ?? {}

  return (
    <div>
      {core_insight && (
        <div style={{ padding:'10px 14px', borderRadius:10, background:D.faint, border:`1px solid ${D.bdr}`, marginBottom:14 }}>
          <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>Core insight</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.65, margin:0 }}>{core_insight}</p>
        </div>
      )}

      {/* Keyword cards */}
      {(findings ?? []).length > 0 && (
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Top keywords</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
            {(findings ?? []).map((kw, i) => {
              const compColor = COMP_COLOR[kw.importance] ?? D.muted
              const { done, copy } = useCopy(kw.label)
              return (
                <div key={i} style={{ borderRadius:10, border:`1px solid ${D.bdr}`, overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 13px', background:D.faint }}>
                    <Search size={13} style={{ color:D.blue, flexShrink:0 }}/>
                    <p style={{ fontSize:14, fontWeight:700, color:D.w, margin:0, flex:1 }}>{kw.label}</p>
                    <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${compColor}14`, color:compColor, flexShrink:0 }}>
                      {COMP_LABEL[kw.importance] ?? kw.importance}
                    </span>
                    <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 8px', borderRadius:5, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted }}>
                      {done?<Check size={10}/>:<Copy size={10}/>}
                    </button>
                  </div>
                  <div style={{ padding:'8px 13px', borderTop:`1px solid ${D.bdr}` }}>
                    <p style={{ fontSize:12.5, color:D.muted, margin:0, lineHeight:1.55 }}>{kw.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {immediate_action && <ActionCard text={immediate_action}/>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 4. LOCAL SEO DASHBOARD — LocalSEOKit
// ═══════════════════════════════════════════════════════════════
const GBP_CHECKLIST = [
  'Google Business Profile claimed and verified',
  'Business category set correctly',
  'Address and phone number accurate',
  'Business hours updated',
  'Photos added (minimum 10)',
  'Products/services listed',
  'Respond to all reviews',
]

function LocalSEOView({ output }: { output: IntelligenceOutput }) {
  const { core_insight, findings, immediate_action } = output.essentials ?? {}
  const [checked, setChecked] = useState<Record<number,boolean>>({})
  const city = output.subject?.split(/[,·]/)[0]?.trim() ?? 'your city'

  return (
    <div>
      {/* City + core insight header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', borderRadius:12, background:`linear-gradient(135deg,rgba(34,197,94,.06),${D.card})`, border:`1.5px solid rgba(34,197,94,.25)`, marginBottom:14 }}>
        <MapPin size={16} style={{ color:D.green, flexShrink:0, marginTop:2 }}/>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:D.green, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 3px' }}>Local SEO · {city}</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.65, margin:0 }}>{core_insight}</p>
        </div>
      </div>

      {/* Google Business Profile checklist */}
      <div style={{ background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}`, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'9px 14px', borderBottom:`1px solid ${D.bdr}`, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:16, height:16, borderRadius:3, background:'#4285F4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#fff', flexShrink:0 }}>G</div>
          <span style={{ fontSize:11, fontWeight:700, color:D.w, letterSpacing:'.5px' }}>Google Business Profile checklist</span>
          <span style={{ fontSize:10.5, color:D.muted, marginLeft:'auto' }}>{Object.values(checked).filter(Boolean).length}/{GBP_CHECKLIST.length} done</span>
        </div>
        {GBP_CHECKLIST.map((item, i) => (
          <div key={i} onClick={() => setChecked(p => ({...p,[i]:!p[i]}))} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderTop:i>0?`1px solid ${D.bdr}`:'none', cursor:'pointer', background:checked[i]?'rgba(34,197,94,.04)':'transparent', transition:'background .15s' }}>
            <div style={{ width:16, height:16, borderRadius:4, border:`1.5px solid ${checked[i]?D.green:D.bdr}`, background:checked[i]?D.green:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
              {checked[i] && <Check size={10} style={{ color:'#fff' }}/>}
            </div>
            <span style={{ fontSize:12.5, color:checked[i]?D.muted:D.dim, textDecoration:checked[i]?'line-through':'none' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Local keyword findings */}
      {(findings ?? []).length > 0 && (
        <div style={{ background:D.faint, borderRadius:10, border:`1px solid ${D.bdr}`, padding:'0 14px', marginBottom:14 }}>
          <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', padding:'10px 0 0' }}>Local keywords to target</p>
          {(findings ?? []).map((f,i) => <FindingRow key={i} finding={f} index={i}/>)}
        </div>
      )}

      {immediate_action && <ActionCard text={immediate_action}/>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 5. GOOGLE AD PREVIEW — GoogleAdCraft
// ═══════════════════════════════════════════════════════════════
function GoogleAdView({ output }: { output: IntelligenceOutput }) {
  const { core_insight, findings, immediate_action } = output.essentials ?? {}

  // Parse ad components from findings
  const headline1 = findings?.find(f => /headline\s*1|h1/i.test(f.label))?.value ?? (findings?.[0]?.label ?? 'Main Headline')
  const headline2 = findings?.find(f => /headline\s*2|h2/i.test(f.label))?.value ?? (findings?.[1]?.label ?? 'Secondary Benefit')
  const headline3 = findings?.find(f => /headline\s*3|h3/i.test(f.label))?.value ?? (findings?.[2]?.label ?? 'Call to Action')
  const desc1     = findings?.find(f => /description|desc\s*1/i.test(f.label))?.value ?? (findings?.[3]?.value ?? core_insight ?? '')
  const desc2     = findings?.find(f => /desc\s*2/i.test(f.label))?.value ?? (findings?.[4]?.value ?? '')
  const displayUrl= output.subject ?? 'yourwebsite.com'

  const allAdCopy = `${headline1} | ${headline2} | ${headline3}\n${displayUrl}\n${desc1}\n${desc2}`
  const { done, copy } = useCopy(allAdCopy)

  return (
    <div>
      {core_insight && (
        <div style={{ padding:'10px 14px', borderRadius:10, background:D.faint, border:`1px solid ${D.bdr}`, marginBottom:14 }}>
          <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>Ad strategy</p>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.65, margin:0 }}>{core_insight}</p>
        </div>
      )}

      {/* Exact Google search result preview */}
      <div style={{ borderRadius:12, border:`1px solid ${D.bdr}`, overflow:'hidden', marginBottom:14, background:'rgba(255,255,255,.02)' }}>
        {/* Search bar mockup */}
        <div style={{ padding:'10px 14px', background:D.faint, borderBottom:`1px solid ${D.bdr}`, display:'flex', alignItems:'center', gap:8 }}>
          <Search size={13} style={{ color:D.muted }}/>
          <span style={{ fontSize:12, color:D.muted, fontStyle:'italic' }}>Search results preview</span>
          <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:'rgba(234,67,53,.12)', border:'1px solid rgba(234,67,53,.25)', color:'#EA4335' }}>Ad</span>
        </div>
        {/* Ad content in exact Google format */}
        <div style={{ padding:'14px 16px' }}>
          {/* Sponsored label */}
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, margin:'0 0 4px' }}>Sponsored</p>
          {/* Headline — blue hyperlink style */}
          <p style={{ fontSize:18, color:'#8AB4F8', fontWeight:400, margin:'0 0 2px', lineHeight:1.35, cursor:'pointer' }}>
            {headline1} | {headline2} | {headline3}
          </p>
          {/* Display URL — green */}
          <p style={{ fontSize:12.5, color:'#81C995', margin:'0 0 4px' }}>
            {displayUrl} › {headline1.toLowerCase().replace(/\s+/g,'-').slice(0,20)}
          </p>
          {/* Descriptions */}
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.65, margin:0 }}>
            {desc1}
            {desc2 ? ` ${desc2}` : ''}
          </p>
        </div>
        {/* Copy row */}
        <div style={{ padding:'10px 14px', borderTop:`1px solid ${D.bdr}`, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 13px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted, minHeight:32 }}>
            {done?<><Check size={12}/>Ad copied!</>:<><Copy size={12}/>Copy ad copy</>}
          </button>
        </div>
      </div>

      {/* Individual field breakdown for editing */}
      <div style={{ background:D.faint, borderRadius:10, border:`1px solid ${D.bdr}`, padding:'14px', marginBottom:14 }}>
        <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Field breakdown (for Google Ads editor)</p>
        {[
          { label:'Headline 1', value:headline1, limit:30 },
          { label:'Headline 2', value:headline2, limit:30 },
          { label:'Headline 3', value:headline3, limit:30 },
          { label:'Description 1', value:desc1, limit:90 },
          ...(desc2 ? [{ label:'Description 2', value:desc2, limit:90 }] : []),
        ].map(({ label, value, limit }) => (
          <AdField key={label} label={label} value={value} limit={limit}/>
        ))}
      </div>

      {immediate_action && <ActionCard text={immediate_action}/>}
    </div>
  )
}

function AdField({ label, value, limit }: { label:string; value:string; limit:number }) {
  const over  = value.length > limit
  const { done, copy } = useCopy(value)
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderTop:`1px solid ${D.bdr}` }}>
      <div style={{ minWidth:110, flexShrink:0 }}>
        <p style={{ fontSize:11, fontWeight:700, color:D.muted, margin:'0 0 2px' }}>{label}</p>
        <p style={{ fontSize:10.5, color:over?D.red:D.muted }}>{value.length}/{limit} chars</p>
      </div>
      <p style={{ fontSize:13, color:over?D.red:D.dim, lineHeight:1.6, margin:0, flex:1 }}>{value}</p>
      <button onClick={copy} style={{ padding:'3px 8px', borderRadius:5, cursor:'pointer', fontFamily:'inherit', fontSize:10.5, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted, flexShrink:0 }}>
        {done?<Check size={10}/>:<Copy size={10}/>}
      </button>
    </div>
  )
}

// ── Router ─────────────────────────────────────────────────────
function renderMode(toolId: string, output: IntelligenceOutput) {
  switch (toolId) {
    case 'brand-positioner':  return <ManifestoView    output={output}/>
    case 'keyword-hunter':    return <KeywordGridView  output={output}/>
    case 'local-seo-kit':     return <LocalSEOView     output={output}/>
    case 'google-ad-craft':   return <GoogleAdView     output={output}/>
    default:                  return <ProfileCardView  output={output}/>
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const TOOL_LABELS: Record<string,string> = {
  'audience-profiler':'👤 AudienceProfiler',
  'brand-positioner':'🎯 BrandPositioner',
  'keyword-hunter':'🔑 KeywordHunter',
  'local-seo-kit':'📍 LocalSEOKit',
  'google-ad-craft':'📢 GoogleAdCraft',
}

export interface IntelligenceGroupOutputProps {
  outputJson:    IntelligenceOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
}

export function IntelligenceGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave,
}: IntelligenceGroupOutputProps) {
  const headline = outputJson.headline ?? 'Intelligence report generated'
  const subject  = outputJson.subject  ?? ''

  const allText = [
    headline,
    outputJson.essentials?.core_insight ?? '',
    ...(outputJson.essentials?.findings ?? []).map(f => `${f.label}: ${f.value}`),
    outputJson.essentials?.immediate_action ?? '',
  ].filter(Boolean).join('\n\n')

  const { done: allDone, copy: copyAll } = useCopy(allText)

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`@media(max-width:600px){.ig-actions{flex-direction:column!important}.ig-actions>button{width:100%!important}}`}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:`1px solid ${D.bdr}`, flexWrap:'wrap', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🎯</div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:D.w, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>{headline}</p>
              <p style={{ fontSize:11, color:D.muted, margin:0 }}>{TOOL_LABELS[toolId]||toolId}{subject?' · '+subject:''} · {coinsSpent}⊙</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            {onSave && (
              <button onClick={onSave} style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isSaved?'rgba(224,152,24,.4)':D.bdr}`, background:isSaved?'rgba(224,152,24,.1)':D.faint, color:isSaved?D.gl:D.muted, cursor:'pointer' }}>
                {isSaved?<BookmarkCheck size={14}/>:<Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600, minHeight:34 }}>
                <RefreshCw size={12}/>Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
          {renderMode(toolId, outputJson)}
          <div style={{ marginTop:18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Footer */}
        <div className="ig-actions" style={{ padding:'10px 14px', borderTop:`1px solid ${D.bdr}`, display:'flex', gap:8, flexShrink:0, background:'rgba(6,12,26,.97)', backdropFilter:'blur(14px)' }}>
          <button onClick={copyAll} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13.5, fontWeight:800, border:`1px solid ${allDone?'rgba(18,212,180,.4)':'rgba(59,130,246,.35)'}`, background:allDone?'rgba(18,212,180,.14)':'rgba(59,130,246,.1)', color:allDone?D.teal:D.blue, transition:'all .18s', minHeight:44 }}>
            {allDone?<><Check size={14}/>Copied!</>:<><Copy size={14}/>Copy intelligence report</>}
          </button>
        </div>

        <DeepDiveDrawer headline={headline}/>
      </div>
    </DeepDiveProvider>
  )
}
