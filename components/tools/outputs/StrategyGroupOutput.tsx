'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/StrategyGroupOutput.tsx
//
// Handles all 9 Group 6 (strategic plan) tools.
// Every tool gets a purpose-built visual that matches its output type.
//
// Tool → Visual Mode:
//   strategy-brain           → SprintBlueprintView  (phased action command centre)
//   launch-pad               → LaunchPadView         (countdown timeline T-30 to T+7)
//   campaign-clock           → CampaignClockView     (week-by-week campaign calendar)
//   budget-optimizer         → BudgetOptimizerView   (channel allocation bars)
//   retarget-engine          → RetargetEngineView    (warm/cool/cold audience cards)
//   funnel-builder           → FunnelBuilderView     (visual narrowing funnel)
//   influencer-brief-writer  → InfluencerBriefView   (professional brief document)
//   referral-program-builder → ReferralProgramView   (referrer / referee reward card)
//   ad-pilot                 → AdPilotView           (per-ad-set campaign cards)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from 'react'
import {
  Copy, Check, RefreshCw, Bookmark, BookmarkCheck, FileText, Zap,
} from 'lucide-react'
import type { StrategyOutput, StrategyAction } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:'#060C1A', navy:'#0B1F3A', card:'#0D2040',
  gold:'#E09818', gl:'#F5B830',   teal:'#12D4B4',
  red:'#E55252',  green:'#22C55E', purple:'#8B7FFF',
  amber:'#F97316', blue:'#3B82F6', w:'#EBF2FC',
  dim:'rgba(205,217,236,.72)', muted:'rgba(205,217,236,.38)',
  faint:'rgba(255,255,255,.04)', bdr:'rgba(255,255,255,.08)',
}

const EFFORT_STYLE: Record<string, { bg: string; color: string }> = {
  Low:    { bg:'rgba(34,197,94,.12)',   color:'#22C55E' },
  Medium: { bg:'rgba(245,184,48,.12)',  color:'#F5B830' },
  High:   { bg:'rgba(229,82,82,.12)',   color:'#E55252' },
}

// ── useCopy ────────────────────────────────────────────────────
function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Shared: Quick Win card ─────────────────────────────────────
function QuickWinCard({ text }: { text: string }) {
  const { done, copy } = useCopy(text)
  return (
    <div style={{
      padding:'12px 14px', borderRadius:10, marginBottom:14,
      background:`linear-gradient(135deg,rgba(224,152,24,.12),rgba(245,184,48,.06))`,
      border:`1.5px solid rgba(224,152,24,.35)`,
      display:'flex', alignItems:'flex-start', gap:10,
    }}>
      <Zap size={16} style={{ color:D.gl, flexShrink:0, marginTop:2 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:10.5, fontWeight:700, color:D.gl, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>
          Do this first — highest leverage action
        </p>
        <p style={{ fontSize:13.5, color:D.w, lineHeight:1.65, margin:0, fontWeight:600 }}>{text}</p>
      </div>
      <button onClick={copy} style={{ padding:'4px 9px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':'rgba(224,152,24,.3)'}`, background:done?'rgba(18,212,180,.1)':'rgba(224,152,24,.08)', color:done?D.teal:D.gl, flexShrink:0, display:'flex', alignItems:'center', gap:3 }}>
        {done?<><Check size={10}/>Copied</>:<><Copy size={10}/>Copy</>}
      </button>
    </div>
  )
}

// ── Shared: Action card ────────────────────────────────────────
function ActionCard({ action, index }: { action: StrategyAction; index: number }) {
  const { done, copy } = useCopy(action.action)
  const effort = EFFORT_STYLE[action.effort] ?? EFFORT_STYLE.Medium
  return (
    <div style={{
      display:'flex', gap:10, alignItems:'flex-start',
      padding:'10px 0', borderTop:`1px solid ${D.bdr}`,
    }}>
      <div style={{
        minWidth:24, height:24, borderRadius:'50%', flexShrink:0, marginTop:1,
        background:`rgba(18,212,180,.12)`, border:`1.5px solid rgba(18,212,180,.3)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:11, fontWeight:800, color:D.teal,
      }}>{action.priority ?? index + 1}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.65, margin:'0 0 6px', fontWeight:600 }}>{action.action}</p>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
          {action.timeframe && (
            <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,.06)', border:`1px solid ${D.bdr}`, color:D.muted }}>
              {action.timeframe}
            </span>
          )}
          {action.effort && (
            <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:20, background:effort.bg, color:effort.color }}>
              {action.effort} effort
            </span>
          )}
          {action.expected_result && (
            <span style={{ fontSize:11, color:D.muted }}>→ {action.expected_result}</span>
          )}
        </div>
      </div>
      <button onClick={copy} style={{ padding:'4px 8px', borderRadius:5, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted, flexShrink:0, display:'flex', alignItems:'center', gap:3, minHeight:28 }}>
        {done?<Check size={10}/>:<Copy size={10}/>}
      </button>
    </div>
  )
}

// ── Shared: Metric chip ────────────────────────────────────────
function MetricChip({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ textAlign:'center', padding:'10px 16px', background:D.faint, borderRadius:10, border:`1px solid ${D.bdr}`, flex:'1 1 0', minWidth:80 }}>
      <p style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color, margin:'0 0 2px', lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:10.5, color:D.muted, margin:0, lineHeight:1.3 }}>{label}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VISUAL MODES
// ═══════════════════════════════════════════════════════════════

// ── 1. SPRINT BLUEPRINT — strategy-brain ──────────────────────
function SprintBlueprintView({ output }: { output: StrategyOutput }) {
  const { key_metric, timeframe, essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}

  // Parse key metric into chips — look for ₦, % and client/days numbers
  const metricChips: Array<{ value: string; label: string; color: string }> = useMemo(() => {
    const chips: typeof metricChips = []
    const naira = key_metric?.match(/₦[\d,]+(?:K|M|B)?/)
    const pct   = key_metric?.match(/(\d+(?:\.\d+)?)\s*(?:clients?|customers?|leads?)/i)
    const days  = timeframe?.match(/\d+/)
    if (naira) chips.push({ value: naira[0], label: 'Revenue target', color: D.green })
    if (pct)   chips.push({ value: pct[1],   label: 'clients needed', color: D.teal })
    if (days)  chips.push({ value: days[0] + ' days', label: 'Timeframe', color: D.gl })
    if (chips.length === 0 && key_metric) chips.push({ value: key_metric.slice(0,12), label: 'Key metric', color: D.gl })
    return chips
  }, [key_metric, timeframe])

  return (
    <div>
      {/* Metrics bar */}
      {metricChips.length > 0 && (
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          {metricChips.map(c => <MetricChip key={c.label} {...c}/>)}
        </div>
      )}

      {/* Quick win */}
      {quick_win && <QuickWinCard text={quick_win}/>}

      {/* Priority actions */}
      <div style={{ background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}`, overflow:'hidden' }}>
        <div style={{ padding:'10px 14px', borderBottom:`1px solid ${D.bdr}`, display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase' }}>
            {actions.length} priority action{actions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ padding:'0 14px' }}>
          {actions.map((a, i) => <ActionCard key={i} action={a} index={i}/>)}
        </div>
      </div>
    </div>
  )
}

// ── 2. LAUNCH PAD — launch-pad ────────────────────────────────
const LAUNCH_PHASES = [
  { label:'T-30 days', emoji:'📋', desc:'Planning & preparation', color:D.blue    },
  { label:'T-14 days', emoji:'🔨', desc:'Build & set up',         color:D.purple  },
  { label:'T-7 days',  emoji:'📣', desc:'Warm-up & buzz',         color:D.amber   },
  { label:'LAUNCH DAY',emoji:'🚀', desc:'Go live moment',         color:D.gl,     highlight:true },
  { label:'T+7 days',  emoji:'📈', desc:'Optimise & scale',       color:D.green   },
]

function LaunchPadView({ output }: { output: StrategyOutput }) {
  const { essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}
  const [openPhase, setOpenPhase] = useState<number | null>(3) // Launch day open by default

  // Distribute actions across phases
  const perPhase = Math.ceil(actions.length / 5)

  return (
    <div>
      {quick_win && <QuickWinCard text={quick_win}/>}
      {LAUNCH_PHASES.map((phase, pi) => {
        const phaseActions = actions.slice(pi * perPhase, (pi + 1) * perPhase)
        const isOpen = openPhase === pi
        return (
          <div key={pi} style={{ marginBottom:8, borderRadius:10, border:`1.5px solid ${phase.highlight?`${phase.color}50`:`${D.bdr}`}`, overflow:'hidden', background:phase.highlight?`${phase.color}08`:D.faint }}>
            <button onClick={() => setOpenPhase(isOpen ? null : pi)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{phase.emoji}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:800, color:phase.color, margin:'0 0 1px', letterSpacing:phase.highlight?'.5px':'normal', textTransform:phase.highlight?'uppercase':'none' }}>{phase.label}</p>
                <p style={{ fontSize:11, color:D.muted, margin:0 }}>{phase.desc}</p>
              </div>
              {phaseActions.length > 0 && <span style={{ fontSize:11, color:D.muted, background:D.faint, border:`1px solid ${D.bdr}`, borderRadius:20, padding:'2px 9px', flexShrink:0 }}>{phaseActions.length} tasks</span>}
              <span style={{ fontSize:13, color:D.muted, transform:isOpen?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0 }}>▾</span>
            </button>
            {isOpen && (
              <div style={{ borderTop:`1px solid ${phase.highlight?`${phase.color}25`:D.bdr}`, padding:'0 14px' }}>
                {phaseActions.length > 0
                  ? phaseActions.map((a, i) => <ActionCard key={i} action={a} index={i}/>)
                  : <p style={{ fontSize:13, color:D.muted, padding:'12px 0' }}>See Deep Dive for phase-specific tasks</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── 3. CAMPAIGN CLOCK — campaign-clock ────────────────────────
function CampaignClockView({ output }: { output: StrategyOutput }) {
  const { essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}
  const weekColors = [D.blue, D.purple, D.amber, D.green, D.teal]

  // Group actions by timeframe
  const byWeek: Record<string, StrategyAction[]> = {}
  actions.forEach(a => {
    const key = a.timeframe || 'This week'
    if (!byWeek[key]) byWeek[key] = []
    byWeek[key].push(a)
  })

  return (
    <div>
      {quick_win && <QuickWinCard text={quick_win}/>}
      {Object.entries(byWeek).map(([week, weekActions], wi) => (
        <div key={week} style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <div style={{ width:3, height:18, borderRadius:2, background:weekColors[wi % weekColors.length], flexShrink:0 }}/>
            <span style={{ fontSize:12.5, fontWeight:700, color:weekColors[wi % weekColors.length], textTransform:'uppercase', letterSpacing:'.8px' }}>{week}</span>
          </div>
          <div style={{ background:D.faint, borderRadius:10, border:`1px solid ${D.bdr}`, padding:'0 14px' }}>
            {weekActions.map((a, i) => <ActionCard key={i} action={a} index={i}/>)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 4. BUDGET OPTIMIZER — budget-optimizer ────────────────────
function BudgetOptimizerView({ output }: { output: StrategyOutput }) {
  const { key_metric, essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}

  // Extract total budget from key_metric
  const totalMatch = key_metric?.match(/₦([\d,]+(?:K|M)?)/)
  const totalBudget = totalMatch ? `₦${totalMatch[1]}` : null

  // Each action becomes a channel allocation
  const barColors = [D.teal, D.blue, D.purple, D.amber, D.green, D.gl]
  const totalActions = actions.length || 1
  return (
    <div>
      {/* Total budget */}
      {totalBudget && (
        <div style={{ textAlign:'center', padding:'14px', marginBottom:14, background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}` }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>Total budget to allocate</p>
          <p style={{ fontFamily:"'Georgia',serif", fontSize:32, fontWeight:900, color:D.gl, margin:0 }}>{totalBudget}</p>
        </div>
      )}

      {quick_win && <QuickWinCard text={quick_win}/>}

      {/* Channel bars */}
      <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>Channel allocation</p>
      {actions.map((a, i) => {
        const barPct = Math.max(15, Math.round((totalActions - i) / totalActions * 85) + 15)
        const color  = barColors[i % barColors.length]
        const nairaM = a.action.match(/₦[\d,]+(?:K|M)?/)
        const pctM   = a.action.match(/(\d+)%/)
        const amount = nairaM?.[0] || pctM?.[0] || ''
        return (
          <div key={i} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:12.5, fontWeight:600, color:D.dim }}>{a.action.split(/[—–:]/)[0]?.trim() || a.action.slice(0,40)}</span>
              <span style={{ fontSize:12, fontWeight:700, color, flexShrink:0, marginLeft:8 }}>{amount || a.timeframe || ''}</span>
            </div>
            <div style={{ height:6, borderRadius:3, background:D.bdr, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${barPct}%`, background:`linear-gradient(90deg,${color},${color}88)`, borderRadius:3, transition:'width .5s ease' }}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── 5. RETARGET ENGINE — retarget-engine ──────────────────────
const AUDIENCE_TEMPS = [
  { label:'🔥 Warm audience',  color:D.gl,    desc:'Visited recently or almost bought' },
  { label:'🌤 Cool audience',  color:D.blue,  desc:'Aware but not engaged in 14+ days' },
  { label:'❄️ Cold audience',   color:D.muted, desc:'No recent interaction — 30+ days' },
]

function RetargetEngineView({ output }: { output: StrategyOutput }) {
  const { essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}
  const [openIdx, setOpenIdx] = useState<number>(0)

  return (
    <div>
      {quick_win && <QuickWinCard text={quick_win}/>}
      {AUDIENCE_TEMPS.map((temp, ti) => {
        const a    = actions[ti]
        const isOpen = openIdx === ti
        const color  = temp.color
        return (
          <div key={ti} style={{ marginBottom:10, borderRadius:11, border:`1.5px solid ${color}30`, overflow:'hidden' }}>
            <button onClick={() => setOpenIdx(isOpen ? -1 : ti)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:`${color}06`, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
              <div style={{ flex:1, textAlign:'left' }}>
                <p style={{ fontSize:13, fontWeight:700, color, margin:'0 0 2px' }}>{temp.label}</p>
                <p style={{ fontSize:11.5, color:D.muted, margin:0 }}>{temp.desc}</p>
              </div>
              <span style={{ fontSize:13, color:D.muted, transform:isOpen?'rotate(180deg)':'none', transition:'transform .2s' }}>▾</span>
            </button>
            {isOpen && (
              <div style={{ padding:'12px 14px', borderTop:`1px solid ${color}18` }}>
                {a ? (
                  <>
                    <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.7, margin:'0 0 10px' }}>{a.action}</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:11, color:D.muted }}>{a.timeframe} · {a.expected_result}</span>
                      <button onClick={() => navigator.clipboard?.writeText(a.action)} style={{ padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11.5, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, display:'flex', alignItems:'center', gap:3 }}>
                        <Copy size={11}/> Copy
                      </button>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize:13, color:D.muted }}>See Deep Dive for {temp.label.split(' ').slice(1).join(' ')} strategy</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── 6. FUNNEL BUILDER — funnel-builder ────────────────────────
const FUNNEL_STAGES = [
  { name:'Awareness',     pct:'100%', color:'#3B82F6', icon:'👁' },
  { name:'Interest',      pct:'60%',  color:'#8B7FFF', icon:'💡' },
  { name:'Consideration', pct:'35%',  color:'#F5B830', icon:'🤔' },
  { name:'Decision',      pct:'18%',  color:'#22C55E', icon:'✅' },
  { name:'Purchase',      pct:'8%',   color:'#12D4B4', icon:'💰' },
]

function FunnelBuilderView({ output }: { output: StrategyOutput }) {
  const { essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div>
      {quick_win && <QuickWinCard text={quick_win}/>}
      <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:12 }}>Your marketing funnel</p>

      {FUNNEL_STAGES.map((stage, si) => {
        const action = actions[si]
        const isOpen = selected === si
        const stageWidth = parseInt(stage.pct)
        return (
          <div key={si} style={{ marginBottom:6 }}>
            {/* Funnel stage — narrows as we go down */}
            <div onClick={() => setSelected(isOpen ? null : si)} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:0 }}>
              {/* Left margin for tapering effect */}
              <div style={{ width:`${(100 - stageWidth) / 2}%`, flexShrink:0 }}/>
              {/* Stage bar */}
              <div style={{
                flex:1, padding:'10px 14px', borderRadius:8,
                background:`${stage.color}12`, border:`1.5px solid ${stage.color}35`,
                display:'flex', alignItems:'center', gap:10,
                transition:'all .2s',
              }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{stage.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:stage.color, margin:'0 0 1px' }}>{stage.name}</p>
                  <p style={{ fontSize:10.5, color:D.muted, margin:0 }}>
                    {action ? action.action.slice(0,60) + (action.action.length > 60 ? '…' : '') : 'Tap to see strategy'}
                  </p>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:`${stage.color}`, opacity:.65, flexShrink:0 }}>{stage.pct}</span>
                <span style={{ fontSize:12, color:D.muted, transform:isOpen?'rotate(180deg)':'none', transition:'transform .2s' }}>▾</span>
              </div>
            </div>

            {/* Expanded detail */}
            {isOpen && action && (
              <div style={{ margin:'6px 0 6px', padding:'12px 14px', borderRadius:8, background:D.faint, border:`1px solid ${stage.color}25` }}>
                <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.7, margin:'0 0 10px' }}>{action.action}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {action.timeframe && <span style={{ fontSize:10.5, padding:'2px 8px', borderRadius:20, background:`${stage.color}15`, color:stage.color, fontWeight:700 }}>{action.timeframe}</span>}
                    {action.expected_result && <span style={{ fontSize:11, color:D.muted }}>{action.expected_result}</span>}
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(action.action)} style={{ padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11.5, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, display:'flex', alignItems:'center', gap:3 }}>
                    <Copy size={11}/> Copy
                  </button>
                </div>
              </div>
            )}

            {/* Connector arrow */}
            {si < FUNNEL_STAGES.length - 1 && (
              <div style={{ display:'flex', justifyContent:'center', height:10, color:D.muted, fontSize:12, lineHeight:'10px' }}>▾</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── 7. INFLUENCER BRIEF — influencer-brief-writer ─────────────
function InfluencerBriefView({ output }: { output: StrategyOutput }) {
  const { essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}
  const { done, copy } = useCopy(actions.map(a => `• ${a.action}`).join('\n'))

  const deliverables  = actions.filter(a => /deliverable|post|reel|story|video|content/i.test(a.action + (a.timeframe||'')))
  const requirements  = actions.filter(a => !deliverables.includes(a))

  return (
    <div>
      {/* Brief header card */}
      <div style={{ padding:'14px', borderRadius:12, background:D.faint, border:`1px solid ${D.bdr}`, marginBottom:14 }}>
        <p style={{ fontSize:10.5, fontWeight:700, color:D.purple, letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 6px' }}>Influencer campaign brief</p>
        {quick_win && <p style={{ fontSize:14, fontWeight:700, color:D.w, lineHeight:1.5, margin:0 }}>{quick_win}</p>}
      </div>

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Expected deliverables</p>
          {deliverables.map((a, i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'7px 0', borderTop:i>0?`1px solid ${D.bdr}`:'none' }}>
              <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>📌</span>
              <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{a.action}</p>
              {a.timeframe && <span style={{ fontSize:10.5, color:D.purple, background:'rgba(139,127,255,.12)', borderRadius:20, padding:'2px 8px', flexShrink:0, whiteSpace:'nowrap' }}>{a.timeframe}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Requirements */}
      {requirements.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Requirements & guidelines</p>
          {requirements.map((a, i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'7px 0', borderTop:i>0?`1px solid ${D.bdr}`:'none' }}>
              <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>✓</span>
              <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{a.action}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={copy} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, minHeight:40 }}>
        <FileText size={14}/> Export brief as text
      </button>
    </div>
  )
}

// ── 8. REFERRAL PROGRAM — referral-program-builder ────────────
function ReferralProgramView({ output }: { output: StrategyOutput }) {
  const { essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}
  const half = Math.ceil(actions.length / 2)
  const referrerActions = actions.slice(0, half)
  const refereeActions  = actions.slice(half)

  return (
    <div>
      {quick_win && <QuickWinCard text={quick_win}/>}

      {/* Two-column reward cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {/* Referrer side */}
        <div style={{ borderRadius:12, border:`1.5px solid rgba(245,184,48,.3)`, overflow:'hidden' }}>
          <div style={{ padding:'9px 12px', background:'rgba(245,184,48,.08)', borderBottom:`1px solid rgba(245,184,48,.18)` }}>
            <p style={{ fontSize:10, fontWeight:800, color:D.gl, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 2px' }}>For the referrer</p>
            <p style={{ fontSize:11, color:D.muted, margin:0 }}>Who sends the referral</p>
          </div>
          <div style={{ padding:'10px 12px' }}>
            {referrerActions.length > 0
              ? referrerActions.map((a, i) => (
                  <p key={i} style={{ fontSize:12.5, color:D.dim, lineHeight:1.6, margin:'0 0 6px' }}>• {a.action}</p>
                ))
              : <p style={{ fontSize:12, color:D.muted }}>Referrer reward in Deep Dive</p>}
          </div>
        </div>
        {/* Referee side */}
        <div style={{ borderRadius:12, border:`1.5px solid rgba(18,212,180,.3)`, overflow:'hidden' }}>
          <div style={{ padding:'9px 12px', background:'rgba(18,212,180,.06)', borderBottom:`1px solid rgba(18,212,180,.14)` }}>
            <p style={{ fontSize:10, fontWeight:800, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 2px' }}>For the new customer</p>
            <p style={{ fontSize:11, color:D.muted, margin:0 }}>Who gets referred</p>
          </div>
          <div style={{ padding:'10px 12px' }}>
            {refereeActions.length > 0
              ? refereeActions.map((a, i) => (
                  <p key={i} style={{ fontSize:12.5, color:D.dim, lineHeight:1.6, margin:'0 0 6px' }}>• {a.action}</p>
                ))
              : <p style={{ fontSize:12, color:D.muted }}>Referee reward in Deep Dive</p>}
          </div>
        </div>
      </div>

      {/* How to share row */}
      {actions.some(a => /share|send|WhatsApp|instagram|link/i.test(a.action)) && (
        <div style={{ padding:'12px 14px', borderRadius:10, background:D.faint, border:`1px solid ${D.bdr}` }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>How to share</p>
          {actions.filter(a => /share|send|WhatsApp|instagram|link/i.test(a.action)).map((a, i) => (
            <p key={i} style={{ fontSize:13, color:D.dim, lineHeight:1.65, margin:'0 0 6px' }}>{i+1}. {a.action}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 9. AD PILOT — ad-pilot ────────────────────────────────────
const AD_PLATFORMS: Record<string, string> = {
  facebook:'#1877F2', instagram:'#E1306C', google:'#EA4335', tiktok:'#69C9D0',
}

function AdPilotView({ output }: { output: StrategyOutput }) {
  const { essentials } = output
  const { quick_win = '', actions = [] } = essentials ?? {}
  const [openAd, setOpenAd] = useState<number | null>(0)

  // Each action = one ad set / campaign angle
  return (
    <div>
      {quick_win && <QuickWinCard text={quick_win}/>}
      <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Campaign ad sets</p>

      {actions.map((a, i) => {
        const isOpen = openAd === i
        const platM  = a.action.toLowerCase().match(/facebook|instagram|google|tiktok/)
        const platColor = platM ? (AD_PLATFORMS[platM[0]] ?? D.blue) : D.blue
        const budgetM = a.action.match(/₦[\d,]+(?:K|M)?(?:\/day|\/week|\/month)?/)
        return (
          <div key={i} style={{ marginBottom:9, borderRadius:11, border:`1.5px solid ${platColor}30`, overflow:'hidden' }}>
            <button onClick={() => setOpenAd(isOpen ? null : i)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:`${platColor}06`, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
              <div style={{ width:22, height:22, borderRadius:6, background:`${platColor}18`, border:`1px solid ${platColor}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:platColor, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
                <p style={{ fontSize:13, fontWeight:700, color:platColor, margin:'0 0 2px' }}>
                  Ad Set {i+1}{platM ? ` · ${platM[0].charAt(0).toUpperCase() + platM[0].slice(1)}` : ''}
                </p>
                <p style={{ fontSize:11.5, color:D.muted, margin:0, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                  {a.action.slice(0,60)}{a.action.length > 60 ? '…' : ''}
                </p>
              </div>
              {budgetM && <span style={{ fontSize:11, fontWeight:700, color:platColor, flexShrink:0 }}>{budgetM[0]}</span>}
              {a.effort && <span style={{ fontSize:10.5, padding:'2px 7px', borderRadius:20, background:`${platColor}12`, color:platColor, fontWeight:700, flexShrink:0 }}>{a.effort}</span>}
              <span style={{ fontSize:13, color:D.muted, transform:isOpen?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0 }}>▾</span>
            </button>
            {isOpen && (
              <div style={{ padding:'12px 14px', borderTop:`1px solid ${platColor}18` }}>
                <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:'0 0 10px', whiteSpace:'pre-wrap' }}>{a.action}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {a.timeframe && <span style={{ fontSize:10.5, padding:'2px 8px', borderRadius:20, background:`${platColor}15`, color:platColor, fontWeight:700 }}>{a.timeframe}</span>}
                    {a.expected_result && <span style={{ fontSize:11, color:D.muted }}>{a.expected_result}</span>}
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(a.action)} style={{ padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11.5, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, display:'flex', alignItems:'center', gap:3 }}>
                    <Copy size={11}/> Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Visual mode router ─────────────────────────────────────────
function renderMode(toolId: string, output: StrategyOutput) {
  switch (toolId) {
    case 'launch-pad':               return <LaunchPadView       output={output}/>
    case 'campaign-clock':           return <CampaignClockView   output={output}/>
    case 'budget-optimizer':         return <BudgetOptimizerView output={output}/>
    case 'retarget-engine':          return <RetargetEngineView  output={output}/>
    case 'funnel-builder':           return <FunnelBuilderView   output={output}/>
    case 'influencer-brief-writer':  return <InfluencerBriefView output={output}/>
    case 'referral-program-builder': return <ReferralProgramView output={output}/>
    case 'ad-pilot':                 return <AdPilotView         output={output}/>
    default:                         return <SprintBlueprintView output={output}/>
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface StrategyGroupOutputProps {
  outputJson:    StrategyOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
}

export function StrategyGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave,
}: StrategyGroupOutputProps) {
  const headline  = outputJson.headline  ?? 'Strategy generated'
  const timeframe = outputJson.timeframe ?? ''
  const keyMetric = outputJson.key_metric ?? ''

  const allText = [
    headline, keyMetric,
    outputJson.essentials?.quick_win ?? '',
    ...(outputJson.essentials?.actions ?? []).map((a, i) =>
      `${i+1}. ${a.action}${a.timeframe ? ' [' + a.timeframe + ']' : ''}${a.expected_result ? ' → ' + a.expected_result : ''}`
    ),
  ].filter(Boolean).join('\n\n')

  const { done: allDone, copy: copyAll } = useCopy(allText)

  const toolLabels: Record<string, string> = {
    'strategy-brain':           '🧠 Sprint Blueprint',
    'launch-pad':               '🚀 LaunchPad',
    'campaign-clock':           '📅 Campaign Clock',
    'budget-optimizer':         '💰 Budget Optimizer',
    'retarget-engine':          '🎯 Retarget Engine',
    'funnel-builder':           '📊 Funnel Builder',
    'influencer-brief-writer':  '✍️ Influencer Brief',
    'referral-program-builder': '🔗 Referral Program',
    'ad-pilot':                 '📢 AdPilot',
  }

  const exportAsText = () => {
    const blob = new Blob([allText], { type:'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${toolId}-strategy.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`
        @media(max-width:600px){
          .sgo-actions{flex-direction:column!important}
          .sgo-actions>button{width:100%!important}
          .sgo-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:`1px solid ${D.bdr}`, flexWrap:'wrap', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(224,152,24,.1)', border:'1px solid rgba(224,152,24,.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🧠</div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:D.w, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>{headline}</p>
              <p style={{ fontSize:11, color:D.muted, margin:0 }}>{toolLabels[toolId] || toolId} · {coinsSpent}⊙{timeframe ? ' · ' + timeframe : ''}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            {onSave && (
              <button onClick={onSave} style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isSaved?'rgba(224,152,24,.4)':D.bdr}`, background:isSaved?'rgba(224,152,24,.1)':D.faint, color:isSaved?D.gl:D.muted, cursor:'pointer' }}>
                {isSaved ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600, minHeight:34 }}>
                <RefreshCw size={12}/>Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Key metric strip (when present) */}
        {keyMetric && (
          <div style={{ padding:'9px 14px', borderBottom:`1px solid ${D.bdr}`, flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1px', textTransform:'uppercase', flexShrink:0 }}>Target</span>
            <p style={{ fontSize:13, fontWeight:700, color:D.gl, margin:0, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{keyMetric}</p>
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
          {renderMode(toolId, outputJson)}
          <div style={{ marginTop:18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="sgo-actions" style={{ padding:'10px 14px', borderTop:`1px solid ${D.bdr}`, display:'flex', gap:8, flexShrink:0, background:'rgba(6,12,26,.97)', backdropFilter:'blur(14px)' }}>
          <button onClick={exportAsText} style={{ display:'flex', alignItems:'center', gap:5, padding:'10px 14px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, minHeight:44 }}>
            <FileText size={14}/> Export
          </button>
          <button onClick={copyAll} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13.5, fontWeight:800, border:`1px solid ${allDone?'rgba(18,212,180,.4)':'rgba(224,152,24,.35)'}`, background:allDone?'rgba(18,212,180,.14)':'rgba(224,152,24,.14)', color:allDone?D.teal:D.gl, transition:'all .18s', minHeight:44 }}>
            {allDone ? <><Check size={14}/>Copied!</> : <><Copy size={14}/>Copy full strategy</>}
          </button>
        </div>

        <DeepDiveDrawer headline={headline}/>
      </div>
    </DeepDiveProvider>
  )
}
