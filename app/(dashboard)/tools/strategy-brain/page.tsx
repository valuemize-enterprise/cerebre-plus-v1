'use client'
// /app/(dashboard)/tools/strategy-brain/page.tsx
// StrategyBrain — powered by the Sprint Blueprint engine.
// 5-step form → AI generation → complete execution document.

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, Sparkles, RefreshCw,
  Target, Zap, TrendingUp, Map, PenTool, BarChart3,
} from 'lucide-react'
import { OutputRenderer }                      from '@/components/tools/OutputRenderer'
import { SPRINT_BLUEPRINT_OUTPUT_SECTIONS }    from '@/lib/tools/blueprints/sprint-blueprint-prompt'
import { AISuggestionStrip, AI_ELIGIBLE_SEMANTICS } from '@/components/tools/AISuggestionStrip'
import { detectFieldSemantic }                 from '@/lib/tools/form-suggestions'

// ── Tokens ─────────────────────────────────────────────────────
const N2  = '#0D2040'
const GOLD= '#E09818'
const GL  = '#F5B830'
const TEAL= '#12D4B4'
const W   = '#EBF2FC'
const MUTED='rgba(205,217,236,0.35)'
const B   = 'rgba(255,255,255,0.08)'
const FAINT='rgba(255,255,255,0.05)'

// ── Section icons (output roadmap) ────────────────────────────
const SECTION_ICONS = [
  { icon: Target,     label: 'The Goal',       accent: GL        },
  { icon: Zap,        label: 'The Hook',        accent: GOLD      },
  { icon: TrendingUp, label: 'The Engine',      accent: TEAL      },
  { icon: Map,        label: 'The Storefront',  accent: '#8B5CF6' },
  { icon: PenTool,    label: 'The Authority',   accent: '#E1306C' },
  { icon: BarChart3,  label: 'The Scorecard',   accent: '#22C55E' },
]

// ── Step definitions ──────────────────────────────────────────
const STEPS = [
  {
    id: 'goal',
    title: 'The Revenue Goal',
    subtitle: 'Be precise. Vague goals produce vague strategies.',
    fields: [
      { key:'currentMonthlyRevenue', label:'Current monthly revenue (₦)', type:'text',     required:true, placeholder:'e.g. ₦150,000 — be honest, this is just for your plan' },
      { key:'revenueTarget60d',      label:'Revenue target for the next 60 days (₦)', type:'text',  required:true, placeholder:'e.g. ₦500,000 — what does winning look like?' },
      { key:'whatWinningLooksLike',  label:'Describe exactly what success looks like in 60 days', type:'textarea', rows:3, required:true, placeholder:'e.g. 20 new clients at ₦25,000 each. Sell out 50 product units. Fully book my next two months.' },
    ],
  },
  {
    id: 'offer',
    title: 'The Irresistible Offer',
    subtitle: 'One offer. Total clarity. More offers = slower growth.',
    fields: [
      { key:'mainProduct',        label:'Your main product or service for this sprint', type:'text', required:true, placeholder:'e.g. Hair extension installation | Premium ankara fabric bundles' },
      { key:'pricePoint',         label:'Price of this product or service', type:'text', required:true, placeholder:'e.g. ₦45,000 per client | ₦8,500 per bundle' },
      { key:'whyBuyNow',          label:'Why should someone buy in the next 60 days? What creates urgency?', type:'textarea', rows:3, required:true, placeholder:'e.g. Price increases in August. Only 20 slots left. Seasonal product. First 10 customers get a free add-on.' },
      { key:'currentObjDescript', label:"What's the biggest reason customers hesitate or don't buy?", type:'textarea', rows:2, required:true, placeholder:'e.g. "It\'s too expensive." "Let me think about it." "I\'ll check my husband first." "I\'m comparing prices."' },
    ],
  },
  {
    id: 'traffic',
    title: 'Traffic & Audience',
    subtitle: "Finding where your customers actually are — not where you wish they were.",
    fields: [
      { key:'whereCustomersAre', label:'Where are your customers spending time online?', type:'multicheck', required:true, options:['Instagram','Facebook','WhatsApp','TikTok','LinkedIn','Google Search','Twitter/X','YouTube'] },
      { key:'currentMarketing',  label:'What marketing are you currently doing?', type:'multicheck', options:['Organic Instagram posts','Facebook/Instagram ads','WhatsApp broadcast','Word of mouth referrals','Google ads','Influencer partnerships','LinkedIn posts','Nothing consistent yet'] },
      { key:'whatWorking',       label:"What's currently working, even just a little?", type:'textarea', rows:2, placeholder:'e.g. WhatsApp referrals bring 2–3 clients a month. Instagram stories outperform posts. A boosted post got 15 enquiries.' },
    ],
  },
  {
    id: 'conversion',
    title: 'Conversion Path',
    subtitle: 'This is where most businesses leak money. We will find the hole and fix it.',
    fields: [
      { key:'currentSalesProcess', label:'How does someone go from finding you to paying you? Walk through every step.', type:'textarea', rows:4, required:true, placeholder:'e.g. They see my Instagram post → DM me for price → I tell them → silence for days → if they follow up I explain more → some book.' },
      { key:'avgLeadsPerMonth',    label:'How many enquiries/leads do you get per month on average?', type:'text', required:true, placeholder:'e.g. 30 DMs, 15 WhatsApp messages, 10 serious ones' },
      { key:'closeRate',           label:'Out of those leads, roughly how many become paying customers?', type:'text', required:true, placeholder:'e.g. 3 out of 10 | About 30% | Usually 5 per month' },
    ],
  },
  {
    id: 'resources',
    title: 'Your Resources',
    subtitle: 'A strategy only works if it fits your actual reality.',
    fields: [
      { key:'monthlyAdBudget', label:'Monthly budget for paid advertising (₦)', type:'text', placeholder:'e.g. ₦30,000 | ₦0 — going organic only | ₦100,000' },
      { key:'teamSize',        label:'Who is running the business day-to-day?', type:'select', required:true, options:['Just me — I handle everything','Me + 1 or 2 part-time helpers','Small team of 3–5 people','Bigger team (5+ people)'] },
      { key:'hoursPerWeek',    label:'Hours you can genuinely dedicate to marketing per week', type:'select', required:true, options:['Less than 2 hours','2–5 hours','5–10 hours','10+ hours'] },
    ],
  },
]

// ── Form field renderer ───────────────────────────────────────
// ── Field renderer (input only) ──────────────────────────────
function FieldInput({ field, value, onChange }: { field: any; value: any; onChange: (v: any) => void }) {
  const base = {
    background:'rgba(255,255,255,0.07)', border:`1.5px solid ${B}`, borderRadius:10,
    color:W, fontFamily:'inherit', fontSize:13.5, outline:'none', width:'100%',
    boxSizing:'border-box' as const, transition:'border-color .15s',
  }
  if (field.type === 'textarea') return (
    <textarea value={value||''} onChange={e=>onChange(e.target.value)}
      rows={field.rows||3} placeholder={field.placeholder}
      style={{...base,padding:'10px 14px',resize:'vertical' as const,lineHeight:1.65}}/>
  )
  if (field.type === 'select') return (
    <select value={value||''} onChange={e=>onChange(e.target.value)}
      style={{...base,padding:'10px 14px',cursor:'pointer'}}>
      <option value="" className='bg-black' >Select…</option>
      {(field.options||[]).map((o:string)=><option key={o} value={o} className='bg-black' >{o}</option>)}
    </select>
  )
  if (field.type === 'multicheck') {
    const sel: string[] = Array.isArray(value)?value:[]
    return (
      <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
        {(field.options||[]).map((o:string)=>{
          const s=sel.includes(o)
          return (
            <button key={o} type="button" onClick={()=>onChange(s?sel.filter(x=>x!==o):[...sel,o])}
              style={{padding:'6px 14px',borderRadius:20,fontFamily:'inherit',fontSize:12.5,
                fontWeight:600,cursor:'pointer',transition:'all .15s',
                background:s?`${TEAL}18`:FAINT,border:`1.5px solid ${s?TEAL+'50':B}`,color:s?TEAL:MUTED}}>
              {s?'✓ ':''}{o}
            </button>
          )
        })}
      </div>
    )
  }
  return (
    <input type="text" value={value||''} onChange={e=>onChange(e.target.value)}
      placeholder={field.placeholder} style={{...base,padding:'10px 14px'}}/>
  )
}

// ── Full FormField — input + AI suggestion strip ──────────────
function FormField({ field, value, onChange, profile, existingInputs }: {
  field: any; value: any; onChange: (v: any) => void
  profile: Record<string,string>; existingInputs: Record<string,string>
}) {
  const isText = field.type === 'text' || field.type === 'textarea'
  const fieldVal = isText ? String(value||'') : ''
  const show = isText && fieldVal.length < 30
  const semantic = isText ? detectFieldSemantic(field.key, field.label||'') : ''
  const isAI = show && AI_ELIGIBLE_SEMANTICS.has(semantic)

  return (
    <div>
      <FieldInput field={field} value={value} onChange={onChange}/>
      {isAI && (
        <AISuggestionStrip
          fieldId={field.key}
          fieldLabel={field.label||''}
          fieldSemantic={semantic}
          toolId="strategy-brain"
          toolName="StrategyBrain"
          existingInputs={existingInputs}
          onSelect={onChange}
          visible={show}
        />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function StrategyBrainPage() {
  const [step,       setStep]       = useState(0)
  const [formData,   setFormData]   = useState<Record<string, any>>({})
  const [profile,    setProfile]    = useState({ businessName:'', industry:'', city:'', targetCustomers:'', primaryGoal:'', description:'', priceRange:'' })
  const [generating, setGenerating] = useState(false)
  const [completion, setCompletion] = useState('')
  const [genId,      setGenId]      = useState<string | null>(null)
  const [error,      setError]      = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  // Load business profile
  useEffect(() => {
    fetch('/api/tools/brand-profile')
      .then(r => r.json())
      .then(d => {
        if (d.profile) setProfile({
          businessName:    d.profile.business_name   || '',
          industry:        d.profile.industry         || '',
          city:            d.profile.city             || '',
          targetCustomers: d.profile.target_customers || '',
          primaryGoal:     d.profile.primary_goal     || '',
          description:     d.profile.description     || '',
          priceRange:      d.profile.price_range     || '',
        })
      })
      .catch(() => {})
  }, [])

  const setField = (key: string, val: any) =>
    setFormData(p => ({ ...p, [key]: val }))

  const currentStep = STEPS[step]

  const stepValid = () =>
    (currentStep.fields || []).filter(f => f.required).every(f => {
      const v = formData[f.key]
      return Array.isArray(v) ? v.length > 0 : v && String(v).trim().length > 0
    })

  // ── Generate ────────────────────────────────────────────────
  const generate = async () => {
    setGenerating(true); setError(''); setCompletion('')

    const inputs = {
      ...profile,
      currentMonthlyRevenue: formData.currentMonthlyRevenue || '₦0',
      revenueTarget60d:      formData.revenueTarget60d      || '',
      whatWinningLooksLike:  formData.whatWinningLooksLike  || '',
      // Auto-fill from profile if the user skipped these fields
      mainProduct:           formData.mainProduct           || profile.description || '',
      pricePoint:            formData.pricePoint            || profile.priceRange  || '',
      whyBuyNow:             formData.whyBuyNow             || '',
      currentObjDescript:    formData.currentObjDescript    || '',
      whereCustomersAre:     Array.isArray(formData.whereCustomersAre)
        ? formData.whereCustomersAre.join(', ')
        : (formData.whereCustomersAre || ''),
      currentMarketing:      Array.isArray(formData.currentMarketing)
        ? formData.currentMarketing.join(', ')
        : (formData.currentMarketing || 'Not specified'),
      whatWorking:           formData.whatWorking           || 'Nothing consistent yet',
      currentSalesProcess:   formData.currentSalesProcess   || '',
      avgLeadsPerMonth:      formData.avgLeadsPerMonth       || '',
      closeRate:             formData.closeRate              || '',
      monthlyAdBudget:       formData.monthlyAdBudget        || '₦0',
      teamSize:              formData.teamSize               || 'Just me',
      hoursPerWeek:          formData.hoursPerWeek           || '5–10 hours',
    }

    try {
      const res = await fetch('/api/generate/strategy-brain', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ inputs }),
      })

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}))
        throw new Error(
          json.error === 'Insufficient coins'
            ? `Not enough coins. You need 50 coins — you have ${json.current || 0}.`
            : json.error || 'Generation failed. Please try again.'
        )
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6))
              if (parsed.text) { full += parsed.text; setCompletion(full) }
              if (parsed.generationId) setGenId(parsed.generationId)
            } catch { /* ignore malformed SSE */ }
          }
        }
      }

      setTimeout(() => outputRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.')
      setGenerating(false)
    }
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else generate()
  }

  // ── OUTPUT VIEW ───────────────────────────────────────────────
  if (completion || generating) {
    return (
      <div ref={outputRef} style={{ maxWidth:860, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          {!generating && (
            <button
              onClick={() => { setCompletion(''); setGenerating(false); setStep(0) }}
              style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5, color:MUTED, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
            >
              <ArrowLeft size={13}/> Start over
            </button>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22 }}>🧠</span>
            <span style={{ fontFamily:"'Georgia',serif", fontSize:17, fontWeight:900, color:W }}>
              StrategyBrain — {profile.businessName || 'Your Business'}
            </span>
          </div>
          {generating && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', background:'rgba(224,152,24,0.1)', border:`1px solid ${GOLD}30`, borderRadius:10 }}>
              <RefreshCw size={11} style={{ color:GOLD, animation:'spin .8s linear infinite' }}/>
              <span style={{ fontSize:11.5, color:GOLD, fontWeight:700 }}>Building your strategy…</span>
            </div>
          )}
          {!generating && (
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:10, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E' }}/>
              <span style={{ fontSize:11.5, color:'#22C55E', fontWeight:700 }}>Strategy complete</span>
            </div>
          )}
        </div>

        {/* Section roadmap chips */}
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

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

        <OutputRenderer
          text={completion}
          isStreaming={generating}
          toolId="strategy-brain"
          toolName="StrategyBrain"
          toolCategory="strategy"
          outputSections={SPRINT_BLUEPRINT_OUTPUT_SECTIONS}
          coinsSpent={50}
          generationId={genId ?? undefined}
          onRegenerate={() => { setCompletion(''); setGenerating(false); setStep(STEPS.length - 1) }}
        />
      </div>
    )
  }

  // ── FORM VIEW ─────────────────────────────────────────────────
  return (
    <div style={{ maxWidth:680, margin:'0 auto', paddingBottom:60 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Back link */}
      <Link
        href="/tools"
        style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, color:MUTED, textDecoration:'none', marginBottom:20 }}
      >
        <ArrowLeft size={13}/> Back to tools
      </Link>

      {/* Tool header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <span style={{ fontSize:28 }}>🧠</span>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:W, margin:0 }}>
            StrategyBrain
          </h1>
        </div>
        <p style={{ fontSize:13.5, color:MUTED, maxWidth:520, lineHeight:1.7 }}>
          The flagship tool. A complete, tailored 60-day execution strategy — with all 10 Cerebre Plus laws applied, calculated client math, and a channel-by-channel action plan. Based entirely on your real numbers and your actual situation.
        </p>
      </div>

      {/* Step progress */}
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
                  border: `2px solid ${done ? TEAL : active ? GL : B}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:900,
                  color: done ? '#fff' : active ? '#071528' : MUTED,
                  transition:'all .2s',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize:9.5, color: active ? GL : done ? TEAL : MUTED,
                  fontWeight: active ? 700 : 400, textAlign:'center', maxWidth:52,
                }}>
                  {s.id.charAt(0).toUpperCase() + s.id.slice(1)}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex:1, height:1.5, background: done ? TEAL + '50' : B, margin:'0 4px 14px' }}/>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Profile preview */}
      {profile.businessName && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:`${TEAL}06`, border:`1px solid ${TEAL}20`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:13 }}>✓</span>
          <span style={{ fontSize:12.5, color:TEAL }}>
            Building strategy for <strong>{profile.businessName}</strong>
            {profile.industry ? ` · ${profile.industry}` : ''}
            {profile.city ? ` · ${profile.city}` : ''}
          </span>
        </div>
      )}

      {/* Current step form */}
      <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:16, padding:'24px 22px', marginBottom:14 }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:18, fontWeight:700, color:W, margin:'0 0 6px' }}>
            Step {step + 1} of {STEPS.length}: {currentStep.title}
          </h2>
          <p style={{ fontSize:13, color:MUTED, margin:0, fontStyle:'italic' }}>{currentStep.subtitle}</p>
        </div>

        {(currentStep.fields || []).map(field => (
          <div key={field.key} style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>
              {field.label}
              {(field as any).required && <span style={{ color:GOLD }}> *</span>}
            </label>
            <FormField
              field={field}
              value={formData[field.key]}
              onChange={v => setField(field.key, v)}
              profile={{
                businessName:    profile.businessName,
                industry:        profile.industry,
                city:            profile.city,
                targetCustomer:  profile.targetCustomers,
                description:     profile.description,
                priceRange:      profile.priceRange,
              }}
              existingInputs={Object.fromEntries(
                Object.entries(formData)
                  .filter(([k, v]) => k !== field.key && typeof v === 'string' && String(v).length > 0)
              ) as Record<string, string>}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'12px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, marginBottom:14, fontSize:13, color:'#FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display:'flex', gap:10 }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ padding:'12px 20px', borderRadius:10, background:FAINT, border:`1px solid ${B}`, color:MUTED, fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
          >
            <ArrowLeft size={13}/> Back
          </button>
        )}
        <button
          onClick={next}
          disabled={!stepValid() || generating}
          style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'13px', borderRadius:12, fontFamily:'inherit', fontWeight:800, fontSize:14,
            cursor: !stepValid() || generating ? 'not-allowed' : 'pointer',
            background: !stepValid() || generating
              ? FAINT
              : step === STEPS.length - 1
                ? `linear-gradient(135deg,${GOLD},${GL})`
                : `${GL}18`,
            border: `1px solid ${!stepValid() || generating ? B : step === STEPS.length - 1 ? GOLD + '50' : GL + '40'}`,
            color: !stepValid() || generating ? MUTED : step === STEPS.length - 1 ? '#071528' : GL,
            transition:'all .2s',
          }}
        >
          {generating
            ? <><RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }}/>Building strategy…</>
            : step === STEPS.length - 1
              ? <><Sparkles size={15}/>Generate my StrategyBrain plan</>
              : <>Continue <ArrowRight size={14}/></>
          }
        </button>
      </div>

      {/* Coin notice on last step */}
      {step === STEPS.length - 1 && !generating && (
        <p style={{ textAlign:'center', fontSize:12, color:MUTED, marginTop:12 }}>
          Costs <strong style={{ color:GL }}>50 coins</strong> — the output is a complete 60-day execution document, not a generic guide.
        </p>
      )}
    </div>
  )
}
