'use client'
// ═══════════════════════════════════════════════════════════════
// /components/competitor/CIGroupOutput.tsx
//
// Competitor Intelligence results dashboard.
// Replaces the basic ModuleResultCard accordion in the CI session
// results page with a richer tabbed dashboard showing:
//   • Module tabs (Social / Ads / Website / Gap)
//   • Competitor score cards with visual score bar
//   • Cross-competitor synthesis
//   • Key findings per competitor
//   • Gap & Opportunity map with tool-link CTAs
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import {
  Copy, Check, ExternalLink, TrendingUp, TrendingDown, Minus,
} from 'lucide-react'
import type {
  ModuleId, CompetitorSession, ModuleResult,
  CompetitorInsight, UpsellRecommendation,
} from '@/lib/competitor/types'
import { MODULES, MODULE_LIST, TIER_CONFIG } from '@/lib/competitor/types'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:  '#060C1A', navy: '#0B1F3A', card: '#0D2040',
  gold:  '#E09818', gl:  '#F5B830', teal: '#12D4B4',
  red:   '#E55252', green: '#22C55E', purple: '#8B7FFF', amber: '#F97316',
  blue:  '#3B82F6', w: '#EBF2FC',
  dim:   'rgba(205,217,236,.72)', muted: 'rgba(205,217,236,.38)',
  faint: 'rgba(255,255,255,.04)', bdr:   'rgba(255,255,255,.08)',
}

const TOOL_URLS: Record<string, string> = {
  'content-calendar':    '/tools/content-calendar',
  'caption-craft':       '/tools/caption-craft',
  'story-reel-designer': '/design/story-reel-designer',
  'ad-scribe':           '/tools/ad-scribe',
  'promo-card-designer': '/design/promo-card-designer',
  'blog-brain':          '/tools/blog-brain',
  'local-seo-kit':       '/tools/local-seo-kit',
  'brand-positioner':    '/tools/brand-positioner',
  'copy-brain':          '/tools/copy-brain',
  'audience-profiler':   '/tools/audience-profiler',
  'strategy-brain':      '/tools/strategy-brain',
  'launch-pad':          '/tools/launch-pad',
  'keyword-hunter':      '/tools/keyword-hunter',
  'ad-pilot':            '/tools/ad-pilot',
}

function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Score bar ──────────────────────────────────────────────────
function ScoreBar({ label, score, color, max = 100 }: {
  label: string; score: number; color: string; max?: number
}) {
  const pct = Math.min(100, Math.round((score / max) * 100))
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11.5, color: D.muted }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: D.bdr, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .5s ease' }}/>
      </div>
    </div>
  )
}

// ── Competitor card ────────────────────────────────────────────
type CompetitorInsightWithScores = CompetitorInsight & { overallScore?: number; yourScore?: number }

interface CompetitorCardProps {
  insight: CompetitorInsightWithScores
}

function CompetitorCard({ insight }: CompetitorCardProps) {
  const [open, setOpen] = useState(false)
  const tc     = TIER_CONFIG[insight.tier as keyof typeof TIER_CONFIG]
  const score  = insight.overallScore ?? 65
  const myScore = insight.yourScore ?? 70
  const diff   = myScore - score
  const isAhead  = insight.scoreVsYou === 'ahead'
  const isBehind = insight.scoreVsYou === 'behind'
  const { done, copy } = useCopy(insight.summary + '\n\n' + insight.findings.join('\n'))

  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${isAhead ? D.red + '35' : isBehind ? D.green + '35' : D.bdr}`,
      overflow: 'hidden', marginBottom: 10, background: D.faint, transition: 'border-color .18s',
    }}>
      {/* Header */}
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
        background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      }}>
        {/* Tier badge */}
        <span style={{ fontSize: 16, flexShrink: 0 }}>{tc.badge}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: D.w, margin: '0 0 2px' }}>{insight.competitorName}</p>
          <p style={{ fontSize: 12, color: tc.color, margin: 0, fontStyle: 'italic', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {insight.summary?.slice(0, 60)}
          </p>
        </div>
        {/* Score comparison */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Georgia',serif", fontSize: 18, fontWeight: 900, color: isAhead ? D.red : isBehind ? D.green : D.muted }}>
              {score}
            </span>
            {isAhead  ? <TrendingUp   size={13} style={{ color: D.red }}/>
            : isBehind ? <TrendingDown size={13} style={{ color: D.green }}/>
            : <Minus size={11} style={{ color: D.muted }}/>}
          </div>
          <p style={{ fontSize: 9.5, color: D.muted, margin: 0, whiteSpace: 'nowrap' }}>
            {isAhead ? 'Ahead of you' : isBehind ? 'Behind you' : 'Similar level'}
          </p>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${D.bdr}` }}>
          {/* Score bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '12px 0' }}>
            <div style={{ padding: '12px', borderRadius: 9, background: D.faint, border: `1px solid ${D.bdr}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
                {insight.competitorName}
              </p>
              <ScoreBar label="Overall score" score={score} color={isAhead ? D.red : D.amber}/>
            </div>
            <div style={{ padding: '12px', borderRadius: 9, background: 'rgba(18,212,180,.04)', border: `1px solid rgba(18,212,180,.2)` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
                You
              </p>
              <ScoreBar label="Your score" score={myScore} color={D.teal}/>
            </div>
          </div>

          {/* Summary */}
          <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: '0 0 12px' }}>{insight.summary}</p>

          {/* Findings */}
          {insight.findings.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {insight.findings.slice(0, 5).map((f, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderTop: i > 0 ? `1px solid ${D.bdr}` : 'none' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: tc.color, marginTop: 6, flexShrink: 0 }}/>
                  <p style={{ fontSize: 12.5, color: D.dim, lineHeight: 1.6, margin: 0 }}>{
                    typeof f === 'string' ? f : ('text' in f ? (f as any).text : JSON.stringify(f))
                  }</p>
                </div>
              ))}
            </div>
          )}

          {/* Copy */}
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`, background: done ? 'rgba(18,212,180,.1)' : D.faint, color: done ? D.teal : D.muted }}>
            {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy findings</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Gap & Opportunity map ──────────────────────────────────────
function GapOpportunityMap({ recs }: { recs: any[] }) {
  if (!recs.length) return null

  const URGENCY_COLOR: Record<string, string> = { high: D.red, medium: D.amber, low: D.teal }

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: D.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 12 }}>
        Gap & opportunity map — {recs.length} actions identified
      </p>
      {recs.map((rec, i: number) => {
        const toolUrl   = TOOL_URLS[rec.toolId] || `/tools/${rec.toolId}`
        const urgColor  = URGENCY_COLOR[rec.urgency] ?? D.muted
        return (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px',
            borderRadius: 11, background: D.faint, border: `1px solid ${D.bdr}`,
            marginBottom: 8, transition: 'border-color .15s',
          }}>
            {/* Urgency dot */}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgColor, marginTop: 5, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${urgColor}14`, color: urgColor }}>
                  {rec.urgency === 'high' ? '🔴 High priority' : rec.urgency === 'medium' ? '🟡 Medium' : '🟢 Low'}
                </span>
                {rec.gap && <span style={{ fontSize: 12, color: D.muted }}>{rec.gap}</span>}
              </div>
              <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.65, margin: '0 0 8px' }}>{rec.reason}</p>
            </div>
            {/* Tool CTA */}
            <a href={toolUrl} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px',
              borderRadius: 8, textDecoration: 'none', flexShrink: 0,
              fontSize: 12, fontWeight: 700,
              background: `rgba(18,212,180,.1)`, border: `1px solid rgba(18,212,180,.3)`, color: D.teal,
              whiteSpace: 'nowrap',
            }}>
              {rec.toolName || rec.toolId} <ExternalLink size={10}/>
            </a>
          </div>
        )
      })}
    </div>
  )
}

// ── Module panel ───────────────────────────────────────────────
function ModulePanel({ moduleId, result }: { moduleId: ModuleId; result: ModuleResult }) {
  const mod = MODULES[moduleId]
  const synthesisCopy = useCopy(result.synthesis)

  return (
    <div style={{ paddingTop: 16 }}>
      {/* Cross-competitor synthesis */}
      <div style={{
        padding: '14px 16px', borderRadius: 12,
        background: 'rgba(18,212,180,.05)', border: '1px solid rgba(18,212,180,.2)',
        borderLeft: '3px solid rgba(18,212,180,.6)', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '1.2px', margin: 0 }}>
            Cross-competitor insight
          </p>
          <button onClick={synthesisCopy.copy} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 10.5, fontWeight: 700, border: `1px solid ${D.bdr}`, background: D.faint, color: synthesisCopy.done ? D.teal : D.muted }}>
            {synthesisCopy.done ? <><Check size={10}/>Copied</> : <><Copy size={10}/>Copy</>}
          </button>
        </div>
        <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: 0 }}>{result.synthesis}</p>
      </div>

      {/* Competitor cards */}
      {result.insights.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: D.muted, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 12 }}>
            {result.insights.length} competitor{result.insights.length !== 1 ? 's' : ''} analysed
          </p>
          {result.insights.map(insight => (
            <CompetitorCard key={insight.competitorId} insight={insight}/>
          ))}
        </div>
      )}

      {/* Gap & Opportunity Map */}
      {result.upsellRecs?.length > 0 && (
        <GapOpportunityMap recs={result.upsellRecs}/>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface CIGroupOutputProps {
  session:       CompetitorSession
  moduleResults: Partial<Record<ModuleId, ModuleResult>>
}

export function CIGroupOutput({ session, moduleResults }: CIGroupOutputProps) {
  const completedModules = session.modulesCompleted as ModuleId[]
  const [activeModule, setActiveModule] = useState<ModuleId>(
    completedModules[0] ?? session.modulesSelected[0] as ModuleId
  )

  if (completedModules.length === 0) return null

  const activeResult = moduleResults[activeModule]

  // Export full report as text
  const exportReport = () => {
    const lines: string[] = [`COMPETITOR INTELLIGENCE REPORT\n${'─'.repeat(50)}\n`]
    for (const modId of completedModules) {
      const mod = MODULES[modId as ModuleId]
      const res = moduleResults[modId as ModuleId]
      if (!res || !mod) continue
      lines.push(`\n${mod.icon} ${mod.name.toUpperCase()}\n${'─'.repeat(30)}`)
      lines.push(res.synthesis)
      for (const insight of res.insights) {
        lines.push(`\n  ${insight.competitorName} (${insight.scoreVsYou})`)
        lines.push(`  ${insight.summary}`)
        insight.findings.forEach(f => lines.push(`  • ${f}`))
      }
      if (res.upsellRecs?.length) {
        lines.push('\nGAP & OPPORTUNITY MAP:')
        res.upsellRecs.forEach(r => lines.push(`  [${r.priority.toUpperCase()}] ${r.reason} → Use: ${r.toolName || r.toolId}`))
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'competitor-intelligence-report.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Module tabs */}
      <div style={{
        display: 'flex', gap: 4, padding: '4px', marginBottom: 4,
        background: D.faint, borderRadius: 12, border: `1px solid ${D.bdr}`,
        flexWrap: 'wrap',
      }}>
        {completedModules.map(modId => {
          const mod      = MODULES[modId]
          const isActive = activeModule === modId
          if (!mod) return null
          return (
            <button key={modId} onClick={() => setActiveModule(modId)} style={{
              flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 12px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: isActive ? 700 : 500,
              border: 'none',
              background: isActive ? D.card : 'transparent',
              color: isActive ? D.w : D.muted,
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
              transition: 'all .15s', whiteSpace: 'nowrap',
            }}>
              <span>{mod.icon}</span> {mod.name}
            </button>
          )
        })}
      </div>

      {/* Score summary bar */}
      {activeResult && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
          marginBottom: 16, marginTop: 12,
        }}>
          {[
            { label: 'Competitors analysed', value: activeResult.insights.length, color: D.teal },
            { label: 'Gaps identified',       value: activeResult.upsellRecs?.length ?? 0, color: D.amber },
            { label: 'Coins spent',           value: activeResult.coinsSpent ?? 0, color: D.muted },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '10px', borderRadius: 9, background: D.faint, border: `1px solid ${D.bdr}`, textAlign: 'center' }}>
              <p style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color, margin: '0 0 2px' }}>{value}</p>
              <p style={{ fontSize: 10.5, color: D.muted, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active module panel */}
      {activeResult
        ? <ModulePanel moduleId={activeModule} result={activeResult}/>
        : (
          <div style={{ padding: '32px', textAlign: 'center', color: D.muted, fontSize: 13 }}>
            This module has not been run yet. Start a new CI session to include it.
          </div>
        )
      }

      {/* Export button */}
      {completedModules.length > 0 && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.bdr}` }}>
          <button onClick={exportReport} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 700,
            border: `1px solid rgba(224,152,24,.3)`, background: 'rgba(224,152,24,.08)', color: D.gl,
          }}>
            ⬇ Export full intelligence report (.txt)
          </button>
        </div>
      )}
    </div>
  )
}
