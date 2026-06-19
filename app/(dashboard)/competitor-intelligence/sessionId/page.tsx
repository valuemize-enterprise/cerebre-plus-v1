'use client'
// /app/(dashboard)/competitor-intelligence/[sessionId]/page.tsx
// Runs the analysis and displays results as each module completes.

import React, { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle, Clock, Sparkles, Zap, ChevronDown, ChevronUp,
  Copy, Check, ExternalLink, AlertTriangle, RefreshCw, Target,
} from 'lucide-react'
import {
  MODULES, MODULE_LIST, TIER_CONFIG,
  type ModuleId, type AnalysisMode, type CompetitorSession,
  type ModuleResult, type CompetitorInsight, type UpsellRecommendation,
} from '@/lib/competitor/types'
import { RatingWidget } from '@/components/tools/RatingWidget'

const N='#0B1F3A', N2='#0D2040', GOLD='#E09818', GL='#F5B830'
const TEAL='#12D4B4', W='#EBF2FC', DIM='rgba(205,217,236,0.65)'
const MUTED='rgba(205,217,236,0.35)', B='rgba(255,255,255,0.08)'
const FAINT='rgba(255,255,255,0.05)', GREEN='#22C55E', RED='#EF4444'
const AMBER='#F59E0B', PURPLE='#8B5CF6'

// ─── While-you-wait tips ──────────────────────────────────────
const WAIT_TIPS = [
  'Instagram Reels now get 3× the organic reach of static posts for Nigerian audiences — the algorithm rewards video first.',
  'The best time to post for Nigerian SMEs on Instagram is between 7pm–9pm Monday to Friday — when commute times end.',
  'Nigerian WhatsApp broadcast lists convert 4× better than cold Instagram DMs for promotional offers.',
  'The Meta Ad Library is fully public — you can see exactly which ads your competitors are running right now.',
  'Businesses that post consistently (4+ times/week) see 3× more profile visits than those who post sporadically.',
  'Carousel posts on Instagram get 3× more saves than single images — saves are the strongest signal to the algorithm.',
  'Short-form video (under 30 seconds) generates 85% of total video engagement for Nigerian brand accounts.',
  'The "Hook → Value → CTA" formula works for 90% of Nigerian Instagram captions — Lead with a question or bold statement.',
]

// ─── Upsell tool link map ─────────────────────────────────────
const TOOL_URLS: Record<string, string> = {
  'content-calendar':       '/tools/content-calendar',
  'caption-craft':          '/tools/caption-craft',
  'story-reel-designer':    '/design/story-reel-designer',
  'ad-scribe':              '/tools/ad-scribe',
  'promo-card-designer':    '/design/promo-card-designer',
  'carousel-slide-maker':   '/design/carousel-slide-maker',
  'blog-brain':             '/tools/blog-brain',
  'local-seo-kit':          '/tools/local-seo-kit',
  'brand-positioner':       '/tools/brand-positioner',
  'copy-brain':             '/tools/copy-brain',
  'audience-profiler':      '/tools/audience-profiler',
  'strategy-brain':         '/tools/strategy-brain',
  'launch-pad':             '/tools/launch-pad',
}

// ─────────────────────────────────────────────────────────────
// PROGRESS SCREEN
// ─────────────────────────────────────────────────────────────
function ProgressScreen({ session, currentModule }: { session: CompetitorSession; currentModule?: string }) {
  const [tipIdx, setTipIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i+1) % WAIT_TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const total    = session.modulesSelected.length
  const done     = session.modulesCompleted.length
  const progress = session.progressPct

  return (
    <div style={{ maxWidth:560, margin:'0 auto', padding:'40px 20px', textAlign:'center' }}>
      {/* Animated progress ring */}
      <div style={{ position:'relative', width:100, height:100, margin:'0 auto 24px' }}>
        <svg width={100} height={100} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={50} cy={50} r={42} fill="none" stroke={B} strokeWidth={6}/>
          <circle cx={50} cy={50} r={42} fill="none" stroke={GOLD} strokeWidth={6}
            strokeDasharray={`${2*Math.PI*42}`}
            strokeDashoffset={`${2*Math.PI*42*(1-progress/100)}`}
            strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:20, fontWeight:900, color:GL }}>{progress}%</span>
        </div>
      </div>

      <h2 style={{ fontFamily:"'Georgia',serif", fontSize:20, fontWeight:900, color:W, marginBottom:8 }}>
        {session.isHeavyAnalysis ? 'Heavy Analysis Running' : 'Analysing your competitors…'}
      </h2>
      <p style={{ fontSize:14, color:TEAL, marginBottom:4, fontWeight:600 }}>
        {session.currentTask || `${done} of ${total} modules complete`}
      </p>
      <p style={{ fontSize:12.5, color:MUTED, marginBottom:24 }}>
        {session.isHeavyAnalysis
          ? 'This is running in the background. You can leave and come back — we\'ll show results as each module completes.'
          : 'Stay here — results appear as each module completes.'
        }
      </p>

      {/* Module progress pills */}
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, marginBottom:28 }}>
        {session.modulesSelected.map(moduleId => {
          const mod  = MODULES[moduleId]
          const done = session.modulesCompleted.includes(moduleId)
          const curr = currentModule === moduleId
          return (
            <div key={moduleId} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'5px 12px', borderRadius:20,
              background: done ? 'rgba(34,197,94,0.12)' : curr ? `${GOLD}12` : FAINT,
              border:`1px solid ${done?GREEN+'30':curr?GOLD+'30':B}`,
            }}>
              {done
                ? <CheckCircle size={12} style={{color:GREEN}}/>
                : curr
                  ? <div style={{ width:10, height:10, border:`1.5px solid ${GOLD}`, borderTopColor:'transparent', borderRadius:'50%', animation:'ci-spin 0.8s linear infinite' }}/>
                  : <Clock size={11} style={{color:MUTED}}/>
              }
              <span style={{ fontSize:11.5, fontWeight:600, color: done?GREEN:curr?GL:MUTED }}>{mod.icon} {mod.name}</span>
            </div>
          )
        })}
      </div>

      {/* While you wait */}
      <div style={{ background:`${TEAL}06`, border:`1px solid ${TEAL}20`, borderRadius:14, padding:'16px 20px', textAlign:'left' }}>
        <p style={{ fontSize:10.5, fontWeight:700, color:TEAL, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>
          💡 While you wait
        </p>
        <p style={{ fontSize:13.5, color:DIM, lineHeight:1.7, margin:0, minHeight:60, transition:'all 0.4s' }}>
          {WAIT_TIPS[tipIdx]}
        </p>
        <div style={{ display:'flex', gap:4, marginTop:10 }}>
          {WAIT_TIPS.map((_,i) => (
            <div key={i} style={{ width: i===tipIdx?16:5, height:5, borderRadius:3, background: i===tipIdx?TEAL:B, transition:'all .3s' }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MODULE RESULT CARD
// ─────────────────────────────────────────────────────────────
function ModuleResultCard({ result, moduleId }: { result: ModuleResult; moduleId: ModuleId }) {
  const [open, setOpen] = useState(false)
  const mod  = MODULES[moduleId]
  if (!mod) return null

  return (
    <div style={{
      background:N2, border:`1px solid ${open?GOLD+'30':B}`, borderRadius:14,
      overflow:'hidden', transition:'border-color .2s', marginBottom:10,
    }}>
      {/* Header */}
      <button onClick={() => setOpen(v=>!v)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12, padding:'16px 18px',
        background: open?`${GOLD}06`:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <span style={{ fontSize:22, flexShrink:0 }}>{mod.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>{mod.name}</p>
          <p style={{ fontSize:12.5, color:TEAL, margin:'2px 0 0', fontStyle:'italic' }}>{result.teaserLine}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <span style={{ fontSize:11, padding:'3px 9px', borderRadius:12, background:'rgba(34,197,94,0.1)', color:GREEN }}>Complete</span>
          <span style={{ fontSize:11, color:MUTED }}>{result.coinsSpent} coins</span>
          {open ? <ChevronUp size={14} style={{color:MUTED}}/> : <ChevronDown size={14} style={{color:MUTED}}/>}
        </div>
      </button>

      {/* Body */}
      <div style={{ maxHeight: open?8000:0, overflow:'hidden', transition:'max-height .4s ease' }}>
        <div style={{ padding:'0 18px 20px' }}>
          {/* Synthesis */}
          <div style={{ padding:'14px 16px', background:'rgba(18,212,180,0.06)', border:`1px solid rgba(18,212,180,0.15)`, borderLeft:`3px solid ${TEAL}`, borderRadius:10, marginBottom:16 }}>
            <p style={{ fontSize:11.5, fontWeight:700, color:TEAL, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Cross-competitor insight</p>
            <p style={{ fontSize:13.5, color:DIM, lineHeight:1.75, margin:0 }}>{result.synthesis}</p>
          </div>

          {/* Per-competitor findings */}
          {result.insights.map((insight: CompetitorInsight) => {
            const tc = TIER_CONFIG[insight.tier]
            return (
              <div key={insight.competitorId} style={{ marginBottom:12, padding:'14px 14px', background:FAINT, border:`1px solid ${B}`, borderLeft:`3px solid ${tc.color}`, borderRadius:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:13 }}>{tc.badge}</span>
                  <span style={{ fontSize:13.5, fontWeight:700, color:W }}>{insight.competitorName}</span>
                  <span style={{ fontSize:10.5, padding:'2px 8px', borderRadius:10, background:tc.bgColor, color:tc.color }}>{tc.label}</span>
                  <span style={{ marginLeft:'auto', fontSize:11, padding:'2px 8px', borderRadius:10,
                    background: insight.scoreVsYou==='ahead'?'rgba(239,68,68,0.1)':insight.scoreVsYou==='behind'?'rgba(34,197,94,0.1)':'rgba(255,255,255,0.06)',
                    color: insight.scoreVsYou==='ahead'?RED:insight.scoreVsYou==='behind'?GREEN:MUTED,
                  }}>
                    {insight.scoreVsYou==='ahead'?'Ahead of you':insight.scoreVsYou==='behind'?'Behind you':'Similar level'}
                  </span>
                </div>
                <p style={{ fontSize:12.5, color:DIM, margin:'0 0 10px', lineHeight:1.6, fontStyle:'italic' }}>{insight.summary}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {insight.findings.slice(0,4).map((f, fi) => (
                    <div key={fi} style={{
                      padding:'6px 12px', borderRadius:8,
                      background: f.sentiment==='negative'?'rgba(239,68,68,0.08)':f.sentiment==='positive'?'rgba(34,197,94,0.08)':'rgba(255,255,255,0.04)',
                      border:`1px solid ${f.sentiment==='negative'?'rgba(239,68,68,0.2)':f.sentiment==='positive'?'rgba(34,197,94,0.2)':B}`,
                    }}>
                      <p style={{ fontSize:10, fontWeight:700, color:MUTED, margin:0 }}>{f.category}</p>
                      <p style={{ fontSize:12.5, fontWeight:700, color: f.sentiment==='negative'?RED:f.sentiment==='positive'?GREEN:W, margin:'1px 0 0' }}>{f.value}</p>
                      {f.context && <p style={{ fontSize:10.5, color:MUTED, margin:'1px 0 0' }}>{f.context}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Upsell recommendations */}
          {result.upsellRecs.length > 0 && (
            <div style={{ marginTop:14, padding:'14px 16px', background:`${GOLD}06`, border:`1px solid ${GOLD}20`, borderLeft:`3px solid ${GOLD}`, borderRadius:10 }}>
              <p style={{ fontSize:11.5, fontWeight:800, color:GOLD, textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>🛠 Now use these tools</p>
              {result.upsellRecs.map((rec: UpsellRecommendation, ri) => {
                const url = TOOL_URLS[rec.toolId]
                return (
                  <div key={ri} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom: ri<result.upsellRecs.length-1?10:0 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:10,
                      background: rec.priority==='high'?`${GL}20`:'rgba(255,255,255,0.06)',
                      color: rec.priority==='high'?GL:MUTED, flexShrink:0, marginTop:2,
                    }}>{rec.priority==='high'?'↑ HIGH':rec.priority.toUpperCase()}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:W, margin:0 }}>{rec.toolName}</p>
                      <p style={{ fontSize:12.5, color:DIM, margin:'2px 0 6px', lineHeight:1.5 }}>{rec.reason}</p>
                      {url && (
                        <a href={url} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:700, color:GL, textDecoration:'none' }}>
                          {rec.actionCta} <ExternalLink size={11}/>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN SESSION PAGE
// ─────────────────────────────────────────────────────────────
export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()

  const [session,  setSession]  = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [running,  setRunning]  = useState(false)
  const [error,    setError]    = useState('')
  const [currMod,  setCurrMod]  = useState<string|null>(null)
  const [rated,    setRated]    = useState(false)

  // Fetch session
  const fetchSession = useCallback(async () => {
    const res  = await fetch(`/api/competitor/session?id=${sessionId}`)
    const data = await res.json()
    if (data.session) setSession(data.session)
    setLoading(false)
    return data.session
  }, [sessionId])

  // Run next module
  const runNextModule = useCallback(async (sess: any) => {
    const pending = (sess.modules_selected || []).filter(
      (m: string) => !(sess.modules_completed || []).includes(m)
    )
    if (!pending.length) return

    const nextModule = pending[0]
    setCurrMod(nextModule)
    setRunning(true)

    const res  = await fetch('/api/competitor/run-module', {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify({ sessionId, moduleId: nextModule }),
    })
    const data = await res.json()
    setRunning(false)
    setCurrMod(null)

    if (!res.ok) {
      setError(data.error || 'Module failed')
      return
    }

    const updated = await fetchSession()

    // Continue running if more modules
    if (!data.isComplete && updated) {
      await runNextModule(updated)
    }
  }, [sessionId, fetchSession])

  useEffect(() => {
    fetchSession().then(sess => {
      if (!sess) return
      // Start running if draft
      if (sess.status === 'draft' || (sess.status === 'running' && sess.progress_pct === 0)) {
        runNextModule(sess)
      }
      // If already running (heavy analysis — resumed), poll for updates
      if (sess.status === 'running' && sess.progress_pct > 0) {
        const poll = setInterval(async () => {
          const s = await fetchSession()
          if (s?.status === 'completed' || s?.status === 'failed') clearInterval(poll)
        }, 4000)
      }
    })
  }, [sessionId])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
      <div style={{ width:32, height:32, border:`2.5px solid ${GOLD}`, borderTopColor:'transparent', borderRadius:'50%', animation:'ci-spin 0.8s linear infinite' }}/>
      <style>{`@keyframes ci-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!session) return (
    <div style={{ textAlign:'center', padding:60 }}>
      <p style={{ color:MUTED }}>Session not found.</p>
      <Link href="/competitor-intelligence" style={{ color:GL }}>← Back to Competitor Intelligence</Link>
    </div>
  )

  const isComplete  = session.status === 'completed' || session.status === 'partial'
  const isRunning   = session.status === 'running' || running
  const moduleResults: Record<string, ModuleResult> = session.module_results || {}
  const completedIds: string[] = session.modules_completed || []

  const castSession: CompetitorSession = {
    id:               session.id,
    mode:             session.mode,
    competitorCount:  session.competitor_count,
    isHeavyAnalysis:  session.is_heavy_analysis,
    competitors:      session.competitors || [],
    modulesSelected:  session.modules_selected || [],
    modulesCompleted: completedIds as unknown as ModuleId[],
    moduleResults:    moduleResults as any,
    status:           session.status,
    progressPct:      session.progress_pct || 0,
    currentTask:      session.current_task,
    coinsEstimated:   session.coins_estimated,
    coinsSpent:       session.coins_spent,
    businessSnapshot: session.business_snapshot || {},
    startedAt:        session.started_at,
    completedAt:      session.completed_at,
    createdAt:        session.created_at,
  }

  return (
    <div style={{ maxWidth:860, margin:'0 auto', paddingBottom:40 }}>
      <style>{`@keyframes ci-spin{to{transform:rotate(360deg)}}@keyframes ci-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link href="/competitor-intelligence" style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:MUTED, textDecoration:'none' }}>
            <ArrowLeft size={13}/> Back
          </Link>
          <div style={{ width:1, height:18, background:B }}/>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Target size={16} style={{color:GOLD}}/>
            <h1 style={{ fontFamily:"'Georgia',serif", fontSize:17, fontWeight:900, color:W, margin:0 }}>
              Competitor Intelligence
            </h1>
            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background: session.mode==='enhanced'?`${TEAL}18`:FAINT, color: session.mode==='enhanced'?TEAL:MUTED }}>
              {session.mode==='enhanced' ? '✦ Enhanced' : 'Base'}
            </span>
          </div>
        </div>
        {isComplete && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:GREEN }}>✓ {completedIds.length}/{(session.modules_selected||[]).length} modules</span>
            <span style={{ fontSize:12, color:MUTED }}>·</span>
            <span style={{ fontSize:12, color:MUTED }}>{session.coins_spent} coins spent</span>
          </div>
        )}
      </div>

      {/* Competitors summary bar */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {castSession.competitors.map(comp => {
          const tc = TIER_CONFIG[comp.tier]
          return (
            <div key={comp.id} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', background:tc.bgColor, border:`1px solid ${tc.color}25`, borderRadius:20 }}>
              <span style={{ fontSize:13 }}>{tc.badge}</span>
              <span style={{ fontSize:12.5, fontWeight:700, color:tc.color }}>{comp.name}</span>
              <span style={{ fontSize:10.5, color:MUTED }}>{comp.instagramHandle}</span>
            </div>
          )
        })}
      </div>

      {/* Running: show progress + completed results so far */}
      {isRunning && (
        <ProgressScreen session={castSession} currentModule={currMod || undefined}/>
      )}

      {/* Completed module results (show as they complete) */}
      {completedIds.length > 0 && (
        <div>
          {!isRunning && isComplete && (
            <div style={{ padding:'14px 18px', background:'rgba(34,197,94,0.08)', border:`1px solid rgba(34,197,94,0.22)`, borderRadius:12, marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
              <CheckCircle size={16} style={{color:GREEN}}/>
              <div>
                <p style={{ fontSize:13.5, fontWeight:700, color:GREEN, margin:0 }}>Analysis complete</p>
                <p style={{ fontSize:12, color:MUTED, margin:0 }}>{completedIds.length} modules analysed · {session.coins_spent} coins spent</p>
              </div>
            </div>
          )}

          {completedIds.map(moduleId => {
            const result = moduleResults[moduleId]
            if (!result) return null
            return (
              <div key={moduleId} style={{ animation:'ci-fade 0.3s ease' }}>
                <ModuleResultCard result={result} moduleId={moduleId as ModuleId}/>
              </div>
            )
          })}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ padding:'14px 18px', background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, borderRadius:12, marginBottom:16, display:'flex', gap:10 }}>
          <AlertTriangle size={15} style={{color:RED, flexShrink:0, marginTop:2}}/>
          <div>
            <p style={{ fontSize:13.5, fontWeight:700, color:RED, margin:0 }}>Some modules encountered issues</p>
            <p style={{ fontSize:12.5, color:MUTED, margin:'4px 0 0' }}>{error}</p>
            <button onClick={() => { setError(''); fetchSession().then(s => s && runNextModule(s)) }} style={{ marginTop:10, padding:'7px 14px', borderRadius:8, background:FAINT, border:`1px solid ${B}`, color:MUTED, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
              <RefreshCw size={12}/> Retry remaining modules
            </button>
          </div>
        </div>
      )}

      {/* Rating widget */}
      {isComplete && !rated && (
        <div style={{ marginTop:16 }}>
          <RatingWidget
            toolId="competitor-intelligence"
            toolCategory="text"
            coinsSpent={session.coins_spent}
            generationId={session.id}
            // onRated={() => setTimeout(() => setRated(true), 5000)}
          />
        </div>
      )}

      {/* Run more modules CTA */}
      {isComplete && completedIds.length < (session.modules_selected||[]).length && (
        <div style={{ marginTop:16, textAlign:'center' }}>
          <Link href="/competitor-intelligence" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 24px', borderRadius:12, background:`${GL}18`, border:`1px solid ${GL}35`, color:GL, fontWeight:700, fontSize:13.5, textDecoration:'none' }}>
            Run more modules →
          </Link>
        </div>
      )}
    </div>
  )
}
