'use client'
// /app/cerebre-admin/ai-insights/page.tsx
// AI-powered platform analysis using Claude.
// Pre-built analysis prompts + custom "ask the AI" input.

import React, { useState } from 'react'
import { Brain, Send, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const GOLD='#E09818';const GL='#F5B830';const TEAL='#12D4B4';const CORAL='#E84830'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

const PRESET_QUERIES = [
  { label:'Platform health snapshot',         icon:'📊', query:'Give me a comprehensive health snapshot of the Cerebre Plus platform right now. Cover: user growth trend, conversion rate from free to paid, churn risk, and top 3 actions I should take this week.' },
  { label:'Conversion & churn analysis',      icon:'📉', query:'Analyse our conversion funnel: free → starter → growth. Where are users dropping off? What percentage convert within 30 days? Which user segments churn most and why, based on the data you have?' },
  { label:'Tool usage patterns',              icon:'🔧', query:'Which Cerebre Plus tools are used most frequently? Which have the lowest engagement relative to their coin cost? Are there tools that consistently drive upgrades from free to paid?' },
  { label:'Revenue optimisation ideas',       icon:'💰', query:'Based on current plan distribution and coin economy, what are the top 3 pricing or feature changes that could meaningfully increase annual revenue in the next 90 days?' },
  { label:'SME Club member engagement',       icon:'🌟', query:'How are Growth plan (SME Club) members behaving differently from Starter members? Are they more active? Do they retain longer? What can we learn to improve the SME Club offering?' },
  { label:'User onboarding bottlenecks',      icon:'🚪', query:'Where in the onboarding flow do new users drop off or fail to complete their first generation? What does the data suggest about fixing these bottlenecks?' },
  { label:'Email campaign effectiveness',     icon:'📧', query:'How effective are our nudge emails (Day 1, Day 3)? What percentage of nudged users go on to generate their first output? What is the optimal time to send these?' },
  { label:'30-day growth opportunities',      icon:'🚀', query:'If I could only focus on 3 things in the next 30 days to grow Cerebre Plus, what would the data say they should be? Be specific, actionable, and honest about uncertainty.' },
]

interface InsightResult {
  query:     string
  insight:   string
  timestamp: string
  label?:    string
}

function InsightCard({ result, onExpand }: { result: InsightResult; onExpand?: () => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <button onClick={() => setOpen(!open)} style={{ width:'100%', background:'rgba(255,255,255,0.02)', border:'none', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, cursor:'pointer', fontFamily:'inherit' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, textAlign:'left' }}>
          <Brain size={16} style={{ color:GOLD, flexShrink:0 }} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'#EBF2FC', margin:0 }}>{result.label || 'Custom query'}</p>
            <p style={{ fontSize:11, color:MUTED, margin:'2px 0 0' }}>{result.timestamp}</p>
          </div>
        </div>
        {open ? <ChevronUp size={14} style={{ color:MUTED }} /> : <ChevronDown size={14} style={{ color:MUTED }} />}
      </button>
      {open && (
        <div style={{ padding:'0 18px 18px' }}>
          <div style={{ fontSize:11.5, color:MUTED, background:'rgba(255,255,255,0.02)', borderRadius:8, padding:'8px 12px', marginBottom:14, fontStyle:'italic' }}>
            "{result.query.slice(0, 120)}{result.query.length > 120 ? '…' : ''}"
          </div>
          <div style={{ fontSize:14, color:DIM, lineHeight:1.85, whiteSpace:'pre-wrap' }}>{result.insight}</div>
        </div>
      )}
    </div>
  )
}

export default function AIInsightsPage() {
  const [results,  setResults]  = useState<InsightResult[]>([])
  const [loading,  setLoading]  = useState<string | null>(null)
  const [custom,   setCustom]   = useState('')
  const [error,    setError]    = useState('')

  const ask = async (query: string, label?: string) => {
    setLoading(label || query)
    setError('')
    try {
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResults(prev => [{
        query, insight: data.insight,
        timestamp: new Date().toLocaleString('en-NG', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
        label,
      }, ...prev])
    } catch (e: any) {
      setError(e.message || 'Failed to get insight')
    } finally { setLoading(null) }
  }

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
          <Brain size={22} style={{ color:GOLD }} /> AI Insights
        </h1>
        <p style={{ fontSize:13.5, color:MUTED, marginTop:4 }}>
          Ask Claude to analyse your platform data. Pre-built queries or custom questions.
        </p>
      </div>

      {/* Custom ask */}
      <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}25`, borderRadius:16, padding:22, marginBottom:28 }}>
        <p style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>Ask a custom question</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <textarea
            value={custom} onChange={e => setCustom(e.target.value)}
            placeholder="e.g. Which users signed up in the last 7 days and haven't generated anything yet?"
            rows={3}
            style={{ flex:1, minWidth:200, background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:10, padding:'11px 14px', color:'#EBF2FC', fontSize:13.5, fontFamily:'inherit', resize:'vertical' }}
          />
          <button
            onClick={() => { if (custom.trim()) { ask(custom.trim()); setCustom('') } }}
            disabled={!custom.trim() || loading !== null}
            style={{ display:'flex', alignItems:'center', gap:7, background: custom.trim() ? `linear-gradient(135deg,${GOLD},${GL})` : 'rgba(255,255,255,0.05)', color: custom.trim() ? '#071528' : MUTED, fontWeight:800, fontSize:13, padding:'12px 20px', borderRadius:10, border:'none', cursor: custom.trim() ? 'pointer' : 'not-allowed', fontFamily:'inherit', alignSelf:'flex-start' }}
          >
            {loading === custom.trim() ? <RefreshCw size={14} style={{ animation:'admin-spin 1s linear infinite' }} /> : <Send size={14} />}
            Ask AI
          </button>
        </div>
        {error && <p style={{ fontSize:13, color:CORAL, marginTop:10 }}>⚠ {error}</p>}
      </div>

      {/* Preset buttons */}
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>Pre-built analysis</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
          {PRESET_QUERIES.map(q => (
            <button key={q.label} onClick={() => ask(q.query, q.label)} disabled={loading !== null} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.04)', border:`1px solid ${B}`, borderRadius:12, padding:'13px 16px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .18s', opacity: loading && loading !== q.label ? .5 : 1 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{q.icon}</span>
              <span style={{ fontSize:12.5, fontWeight:600, color:DIM, lineHeight:1.4 }}>
                {loading === q.label ? <RefreshCw size={13} style={{ animation:'admin-spin 1s linear infinite', verticalAlign:'middle' }} /> : q.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>Results ({results.length})</p>
          {results.map((r, i) => <InsightCard key={i} result={r} />)}
        </div>
      )}
      {results.length === 0 && !loading && (
        <div style={{ padding:'40px 24px', textAlign:'center', background:'rgba(255,255,255,0.02)', border:`1px solid ${B}`, borderRadius:14 }}>
          <Brain size={32} style={{ color:MUTED, margin:'0 auto 12px', display:'block' }} />
          <p style={{ fontSize:14, color:MUTED }}>Run a preset query or ask a custom question above to see Claude's analysis here.</p>
        </div>
      )}
    </div>
  )
}
