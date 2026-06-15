'use client'
// /app/(dashboard)/tools/sprint-blueprint/page.tsx
// The 60-Day Sprint Blueprint tool. Multi-step form → AI generation → document output.

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, Copy, Check, ChevronDown, ChevronUp, Target, Zap, TrendingUp, Map, PenTool, BarChart3 } from 'lucide-react'
import { OutputRenderer } from '@/components/tools/OutputRenderer'
import { SPRINT_BLUEPRINT_OUTPUT_SECTIONS } from '@/lib/tools/blueprints/sprint-blueprint-prompt'

const N='#0B1F3A', N2='#0D2040', GOLD='#E09818', GL='#F5B830'
const TEAL='#12D4B4', W='#EBF2FC', DIM='rgba(205,217,236,0.65)'
const MUTED='rgba(205,217,236,0.35)', B='rgba(255,255,255,0.08)', FAINT='rgba(255,255,255,0.05)'

// ── Section icons ─────────────────────────────────────────────
const SECTION_ICONS = [
  { icon: Target,    label:'The Goal',       accent:GL       },
  { icon: Zap,       label:'The Hook',       accent:GOLD     },
  { icon: TrendingUp,label:'The Engine',     accent:TEAL     },
  { icon: Map,       label:'The Storefront', accent:'#8B5CF6'},
  { icon: PenTool,   label:'The Authority',  accent:'#E1306C'},
  { icon: BarChart3, label:'The Scorecard',  accent:'#22C55E'},
]

// ── Step configuration ────────────────────────────────────────
const STEPS = [
  {
    id: 'goal',
    title: 'The Revenue Goal',
    subtitle: 'Be precise. Vague goals produce vague plans.',
    fields: [
      { key:'currentMonthlyRevenue', label:'Current monthly revenue (₦)', type:'text', placeholder:'e.g. ₦150,000 — be honest, this is just for your plan', required:true },
      { key:'revenueTarget60d',      label:'Revenue target for the next 60 days (₦)', type:'text', placeholder:'e.g. ₦500,000 — what does winning look like?', required:true },
      { key:'whatWinningLooksLike',  label:'Describe exactly what success looks like in 60 days', type:'textarea', rows:3, placeholder:'e.g. 20 new clients paying ₦25,000 each. Sell out all 50 units of my product. Fully book my July slots.', required:true },
    ],
  },
  {
    id: 'offer',
    title: 'The Irresistible Offer',
    subtitle: 'We will focus on ONE offer. Clarity of offer = clarity of action.',
    fields: [
      { key:'mainProduct',        label:'Your main product or service for this 60-day sprint', type:'text', placeholder:'e.g. Hair extension installation service | Premium ankara fabric bundles', required:true },
      { key:'pricePoint',         label:'Price of this product/service', type:'text', placeholder:'e.g. ₦45,000 per client | ₦8,500 per bundle', required:true },
      { key:'whyBuyNow',          label:'Why should someone buy THIS in the NEXT 60 days? What creates urgency?', type:'textarea', rows:3, placeholder:'e.g. Price increases in August. Only 20 slots available. Seasonal product. First 10 customers get a free add-on.', required:true },
      { key:'currentObjDescript', label:"What's the biggest reason customers hesitate or don't buy?", type:'textarea', rows:2, placeholder:'e.g. "It\'s too expensive." "Let me think about it." "I\'ll check my husband first." "I\'m comparing prices."', required:true },
    ],
  },
  {
    id: 'traffic',
    title: 'Traffic & Audience',
    subtitle: "We're finding where your customers actually are — not where you wish they were.",
    fields: [
      { key:'whereCustomersAre', label:'Where are your customers spending their time online?', type:'multicheck', options:['Instagram','Facebook','WhatsApp','TikTok','LinkedIn','Google Search','Twitter/X','YouTube'], required:true },
      { key:'currentMarketing',  label:"What marketing are you currently doing? (tick all that apply)", type:'multicheck', options:['Organic Instagram posts','Facebook/Instagram ads','WhatsApp broadcast','Word of mouth referrals','Google ads','Influencer partnerships','LinkedIn posts','Nothing consistent yet'] },
      { key:'whatWorking',       label:"What's currently working, even just a little?", type:'textarea', rows:2, placeholder:'e.g. WhatsApp referrals bring 2-3 clients a month. Instagram stories get more views than posts. A post I boosted once got 15 enquiries.' },
    ],
  },
  {
    id: 'conversion',
    title: 'Conversion Path',
    subtitle: 'This is where most businesses lose money. We will find your leak and fix it.',
    fields: [
      { key:'currentSalesProcess', label:'How does someone go from finding you to paying you? Walk through every step.', type:'textarea', rows:4, placeholder:'e.g. They see my Instagram post → DM me asking for price → I tell them the price → silence for 3-4 days → if they follow up I explain more → some book', required:true },
      { key:'avgLeadsPerMonth',    label:'How many enquiries / leads do you get per month on average?', type:'text', placeholder:'e.g. 30 DMs, 15 WhatsApp messages, 10 serious ones', required:true },
      { key:'closeRate',           label:'Out of those leads, roughly how many actually become paying customers?', type:'text', placeholder:'e.g. 3 out of 10 | About 30% | Usually 5 per month', required:true },
    ],
  },
  {
    id: 'resources',
    title: 'Your Resources',
    subtitle: 'A plan only works if it fits your reality. No padding here.',
    fields: [
      { key:'monthlyAdBudget', label:'Monthly budget available for paid advertising (₦)', type:'text', placeholder:'e.g. ₦30,000 | ₦0 — going organic only | ₦100,000' },
      { key:'teamSize',        label:'Who is running the business day-to-day?', type:'select', options:['Just me — I handle everything','Me + 1 or 2 part-time helpers','Small team of 3-5 people','Bigger team (5+ people)'], required:true },
      { key:'hoursPerWeek',    label:'Hours you can genuinely dedicate to marketing per week', type:'select', options:['Less than 2 hours','2–5 hours','5–10 hours','10+ hours'], required:true },
    ],
  },
]

// ── Profile auto-populate hint ────────────────────────────────
// BusinessName, industry, city, targetCustomers pulled from profile on mount

// ── Form components ───────────────────────────────────────────
function FormField({ field, value, onChange }: { field: any; value: any; onChange: (v: any) => void }) {
  const base = {
    background:'rgba(255,255,255,0.07)', border:`1.5px solid ${B}`, borderRadius:10,
    color:W, fontFamily:'inherit', fontSize:13.5, outline:'none', width:'100%', boxSizing:'border-box' as const,
  }

  if (field.type === 'textarea') return (
    <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={field.rows||3} placeholder={field.placeholder}
      style={{ ...base, padding:'10px 14px', resize:'vertical' as const, lineHeight:1.65 }}/>
  )

  if (field.type === 'select') return (
    <select value={value||''} onChange={e=>onChange(e.target.value)} style={{ ...base, padding:'10px 14px', cursor:'pointer' }}>
      <option value="">Select…</option>
      {(field.options||[]).map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  if (field.type === 'multicheck') {
    const selected: string[] = Array.isArray(value) ? value : []
    return (
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {(field.options||[]).map((o: string) => {
          const isSel = selected.includes(o)
          return (
            <button key={o} type="button" onClick={() => onChange(isSel ? selected.filter(x=>x!==o) : [...selected, o])} style={{
              padding:'6px 14px', borderRadius:20, fontFamily:'inherit', fontSize:12.5, fontWeight:600, cursor:'pointer',
              background: isSel ? `${TEAL}18` : FAINT,
              border:`1.5px solid ${isSel ? TEAL+'50' : B}`,
              color: isSel ? TEAL : MUTED, transition:'all .15s',
            }}>{isSel ? '✓ ' : ''}{o}</button>
          )
        })}
      </div>
    )
  }

  return (
    <input type="text" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={field.placeholder}
      style={{ ...base, padding:'10px 14px' }}/>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function SprintBlueprintPage() {
  const [step,       setStep]       = useState(0)
  const [formData,   setFormData]   = useState<Record<string,any>>({})
  const [profile,    setProfile]    = useState({ businessName:'', industry:'', city:'', targetCustomers:'', primaryGoal:'' })
  const [generating, setGenerating] = useState(false)
  const [completion, setCompletion] = useState('')
  const [genId,      setGenId]      = useState<string|null>(null)
  const [error,      setError]      = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  // Load profile
  useEffect(() => {
    fetch('/api/tools/brand-profile').then(r=>r.json()).then(d => {
      if (d.profile) setProfile({
        businessName:   d.profile.business_name   || '',
        industry:       d.profile.industry         || '',
        city:           d.profile.city             || '',
        targetCustomers:d.profile.target_customers || '',
        primaryGoal:    d.profile.primary_goal     || '',
      })
    }).catch(()=>{})
  }, [])

  const setField = (key: string, val: any) => setFormData(p => ({ ...p, [key]: val }))
  const currentStep = STEPS[step]

  // Validate current step
  const stepValid = () => {
    return (currentStep.fields || []).filter(f => f.required).every(f => {
      const v = formData[f.key]
      if (Array.isArray(v)) return v.length > 0
      return v && String(v).trim().length > 0
    })
  }

  const generate = async () => {
    setGenerating(true); setError(''); setCompletion('')

    const inputs = {
      ...profile,
      currentMonthlyRevenue: formData.currentMonthlyRevenue || '₦0',
      revenueTarget60d:      formData.revenueTarget60d || '',
      whatWinningLooksLike:  formData.whatWinningLooksLike || '',
      mainProduct:           formData.mainProduct || '',
      pricePoint:            formData.pricePoint || '',
      whyBuyNow:             formData.whyBuyNow || '',
      currentObjDescript:    formData.currentObjDescript || '',
      whereCustomersAre:     Array.isArray(formData.whereCustomersAre) ? formData.whereCustomersAre.join(', ') : (formData.whereCustomersAre || ''),
      currentMarketing:      Array.isArray(formData.currentMarketing) ? formData.currentMarketing.join(', ') : (formData.currentMarketing || 'Not specified'),
      whatWorking:           formData.whatWorking || 'Nothing consistent yet',
      currentSalesProcess:   formData.currentSalesProcess || '',
      avgLeadsPerMonth:      formData.avgLeadsPerMonth || '',
      closeRate:             formData.closeRate || '',
      monthlyAdBudget:       formData.monthlyAdBudget || '₦0',
      teamSize:              formData.teamSize || 'Just me',
      hoursPerWeek:          formData.hoursPerWeek || '5–10 hours',
    }

    try {
      const res = await fetch('/api/generate/sprint-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      })

      if (!res.ok || !res.body) throw new Error('Generation failed')

      const reader = res.body.getReader()
      const decoder= new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)

        // Parse SSE data: "data: ..."
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6))
              if (parsed.text) { full += parsed.text; setCompletion(full) }
              if (parsed.generationId) setGenId(parsed.generationId)
            } catch {}
          }
        }
      }

      // Scroll to output
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Step complete → go to next
  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s+1)
    else generate()
  }

  // If output exists, show it
  if (completion || generating) {
    return (
      <div ref={outputRef} style={{ maxWidth:860, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          {!generating && (
            <button onClick={() => { setCompletion(''); setGenerating(false); setStep(0) }} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5, color:MUTED, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
              <ArrowLeft size={13}/> Start over
            </button>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20 }}>🚀</span>
            <span style={{ fontFamily:"'Georgia',serif", fontSize:17, fontWeight:900, color:W }}>
              60-Day Sprint Blueprint — {profile.businessName || 'Your Business'}
            </span>
          </div>
          {!generating && (
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:10, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E' }}/>
              <span style={{ fontSize:11.5, color:'#22C55E', fontWeight:700 }}>Blueprint complete</span>
            </div>
          )}
        </div>

        {/* Section roadmap */}
        {!generating && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
            {SECTION_ICONS.map(({ icon: Icon, label, accent }, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, background:`${accent}12`, border:`1px solid ${accent}30` }}>
                <Icon size={12} style={{ color:accent }}/>
                <span style={{ fontSize:11, fontWeight:700, color:accent }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Output renderer */}
        <OutputRenderer
          text={completion}
          isStreaming={generating}
          toolId="sprint-blueprint"
          toolName="60-Day Sprint Blueprint"
          toolCategory="strategy"
          outputSections={SPRINT_BLUEPRINT_OUTPUT_SECTIONS}
          coinsSpent={50}
          generationId={genId ?? undefined}
          onRegenerate={() => { setCompletion(''); setGenerating(false); setStep(STEPS.length - 1) }}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto', paddingBottom:60 }}>
      {/* Header */}
      <Link href="/tools" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, color:MUTED, textDecoration:'none', marginBottom:20 }}>
        <ArrowLeft size={13}/>Back to tools
      </Link>

      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <span style={{ fontSize:26 }}>🚀</span>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:W, margin:0 }}>60-Day Sprint Blueprint</h1>
          <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${TEAL}15`, color:TEAL }}>NEW</span>
        </div>
        <p style={{ fontSize:13.5, color:MUTED, maxWidth:520 }}>
          A precise, tailored execution document — not a generic strategy guide. Based entirely on your real numbers and actual situation.
          Takes 3–4 minutes to set up. The result will be the clearest 60-day marketing plan you've ever had.
        </p>
      </div>

      {/* Progress steps */}
      <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:24 }}>
        {STEPS.map((s, i) => {
          const done   = i < step
          const active = i === step
          return (
            <React.Fragment key={s.id}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background: done ? TEAL : active ? `linear-gradient(135deg,${GOLD},${GL})` : FAINT,
                  border:`2px solid ${done?TEAL:active?GL:B}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:900, color: done?'#fff':active?'#071528':MUTED, transition:'all .2s',
                }}>
                  {done ? '✓' : i+1}
                </div>
                <span style={{ fontSize:9.5, color: active?GL:done?TEAL:MUTED, fontWeight: active?700:400, textAlign:'center', maxWidth:52 }}>
                  {s.id.charAt(0).toUpperCase()+s.id.slice(1)}
                </span>
              </div>
              {i < STEPS.length-1 && <div style={{ flex:1, height:1.5, background: done?TEAL+'50':B, margin:'0 4px 14px' }}/>}
            </React.Fragment>
          )
        })}
      </div>

      {/* Profile preview (auto-populated) */}
      {profile.businessName && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:`${TEAL}06`, border:`1px solid ${TEAL}20`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:13 }}>✓</span>
          <span style={{ fontSize:12.5, color:TEAL }}>
            Building blueprint for <strong>{profile.businessName}</strong>{profile.industry ? ` (${profile.industry}` : ''}{profile.city ? `, ${profile.city}` : ''}{profile.industry||profile.city ? ')' : ''}
          </span>
        </div>
      )}

      {/* Current step form */}
      <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:16, padding:'24px 22px', marginBottom:14 }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:18, fontWeight:700, color:W, margin:'0 0 6px' }}>
            Step {step+1} of {STEPS.length}: {currentStep.title}
          </h2>
          <p style={{ fontSize:13, color:MUTED, margin:0, fontStyle:'italic' }}>{currentStep.subtitle}</p>
        </div>

        {(currentStep.fields||[]).map(field => (
          <div key={field.key} style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>
              {field.label}{(field as any).required && <span style={{ color:GOLD }}> *</span>}
            </label>
            <FormField field={field} value={formData[field.key]} onChange={v => setField(field.key, v)}/>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'12px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, marginBottom:14, fontSize:13, color:'#FCA5A5' }}>{error}</div>
      )}

      {/* Navigation */}
      <div style={{ display:'flex', gap:10 }}>
        {step > 0 && (
          <button onClick={() => setStep(s=>s-1)} style={{ padding:'12px 20px', borderRadius:10, background:FAINT, border:`1px solid ${B}`, color:MUTED, fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <ArrowLeft size={13}/> Back
          </button>
        )}
        <button
          onClick={next}
          disabled={!stepValid()}
          style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'13px', borderRadius:12, fontFamily:'inherit', fontWeight:800, fontSize:14,
            background: !stepValid() ? FAINT : step === STEPS.length-1 ? `linear-gradient(135deg,${GOLD},${GL})` : `${GL}18`,
            border:`1px solid ${!stepValid() ? B : step === STEPS.length-1 ? GOLD+'50' : GL+'40'}`,
            color: !stepValid() ? MUTED : step === STEPS.length-1 ? '#071528' : GL,
            cursor: !stepValid() ? 'not-allowed' : 'pointer', transition:'all .2s',
          }}
        >
          {step === STEPS.length-1
            ? <><Sparkles size={15}/>Generate my 60-Day Sprint Blueprint</>
            : <>Continue <ArrowRight size={14}/></>
          }
        </button>
      </div>

      {/* Coin notice */}
      {step === STEPS.length-1 && (
        <p style={{ textAlign:'center', fontSize:12, color:MUTED, marginTop:12 }}>
          This tool costs <strong style={{ color:GL }}>50 coins</strong>. The output is a complete execution document — tailored to {profile.businessName || 'your business'}.
        </p>
      )}
    </div>
  )
}
