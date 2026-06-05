'use client'
// /app/cerebre-admin/dashboard/page.tsx
// Admin overview — KPIs, recent signups, AI quick insight, alerts.

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, CreditCard, Coins, TrendingUp, AlertCircle, ArrowRight, RefreshCw, Brain } from 'lucide-react'

const GOLD  = '#E09818'; const GL   = '#F5B830'; const TEAL = '#12D4B4'
const CORAL = '#E84830'; const DIM  = 'rgba(205,217,236,0.6)'; const MUTED = 'rgba(205,217,236,0.35)'
const B  = 'rgba(255,255,255,0.07)'; const NAVY = '#0B1F3A'

function KPI({ icon: Icon, label, value, sub, color = GL, href }: any) {
  return (
    <Link href={href || '#'} style={{ textDecoration:'none' }}>
      <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px', transition:'all .2s', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={18} style={{ color }} />
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px' }}>{label}</span>
        </div>
        <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color, lineHeight:1 }}>{value}</div>
        {sub && <p style={{ fontSize:12, color:MUTED, marginTop:6 }}>{sub}</p>}
      </div>
    </Link>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string,{bg:string;c:string}> = {
    free:    { bg:'rgba(205,217,236,0.08)', c:'#8BA8C8' },
    starter: { bg:'rgba(18,212,180,0.1)',   c:'#12D4B4' },
    growth:  { bg:'rgba(224,152,24,0.12)',  c:'#F5B830' },
  }
  const s = map[plan] ?? map.free
  return <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.c, textTransform:'capitalize' }}>{plan}</span>
}

export default function AdminDashboard() {
  const [stats,     setStats]     = useState<any>(null)
  const [recents,   setRecents]   = useState<any[]>([])
  const [aiInsight, setAiInsight] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setStats(d.stats); setRecents(d.recent_users || []) } })
      .finally(() => setLoading(false))
  }, [])

  const getQuickInsight = async () => {
    setLoadingAI(true); setAiInsight('')
    try {
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Give me a 3-sentence executive summary of the platform health right now, and highlight the single most important thing I should focus on today.' }),
      })
      const data = await res.json()
      setAiInsight(data.insight || 'No insight generated.')
    } catch { setAiInsight('Failed to load insight. Check AI Insights page.') }
    finally { setLoadingAI(false) }
  }

  const fmt = (n?: number) => n === undefined ? '—' : n.toLocaleString()

  return (
    <div style={{ maxWidth:1100 }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff' }}>Dashboard</h1>
        <p style={{ fontSize:13.5, color:MUTED, marginTop:3 }}>
          Platform overview — {new Date().toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:12, marginBottom:28 }}>
        <KPI icon={Users}     label="Total users"     value={fmt(stats?.total_users)}   sub={`+${fmt(stats?.new_today)} today`}           color='#8BA8C8'   href="/cerebre-admin/users" />
        <KPI icon={TrendingUp}label="Paid subscribers"value={fmt(stats?.paid_users)}    sub={`${fmt(stats?.growth_users)} on Growth`}      color={TEAL}      href="/cerebre-admin/billing" />
        <KPI icon={CreditCard}label="MRR equivalent"  value={stats?.mrr ? `₦${(stats.mrr/1000).toFixed(0)}K` : '—'} sub="Annual revenue ÷ 12" color={GL} href="/cerebre-admin/billing" />
        <KPI icon={AlertCircle}label="Trials expiring" value={fmt(stats?.expiring_soon)} sub="Next 7 days"              color={CORAL}     href="/cerebre-admin/users?filter=expiring" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:16 }}>
        {/* Recent signups */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${B}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={{ fontFamily:"'Georgia',serif", fontSize:16, fontWeight:700, color:'#EBF2FC' }}>Recent signups</h2>
            <Link href="/cerebre-admin/users" style={{ fontSize:12, fontWeight:700, color:GL, display:'flex', alignItems:'center', gap:4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ padding:40, textAlign:'center' }}><RefreshCw size={20} style={{ color:MUTED, animation:'admin-spin 1s linear infinite' }} /></div>
          ) : recents.length === 0 ? (
            <p style={{ padding:30, textAlign:'center', fontSize:13, color:MUTED }}>No recent signups.</p>
          ) : (
            recents.map((u: any, i: number) => (
              <Link key={u.id} href={`/cerebre-admin/users/${u.id}`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'13px 20px', borderTop: i > 0 ? `1px solid ${B}` : 'none', textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:`${GOLD}18`, border:`1px solid ${GOLD}25`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:GL, fontSize:13, flexShrink:0 }}>
                    {(u.first_name || u.email)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:13.5, fontWeight:600, color:'#EBF2FC', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email}</p>
                    <p style={{ fontSize:11.5, color:MUTED, margin:0 }}>{new Date(u.created_at).toLocaleDateString('en-NG')}</p>
                  </div>
                </div>
                <PlanBadge plan={u.subscription_tier || 'free'} />
              </Link>
            ))
          )}
        </div>

        {/* Right panel: AI insight + plan breakdown */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* AI Quick Insight */}
          <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}22`, borderRadius:16, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Brain size={18} style={{ color:GOLD }} />
              <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', flex:1 }}>AI Quick Insight</h3>
              <button onClick={getQuickInsight} disabled={loadingAI} style={{ background:'none', border:'none', cursor:'pointer', color:GL, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
                <RefreshCw size={11} style={{ animation: loadingAI ? 'admin-spin 1s linear infinite' : 'none' }} />
                {loadingAI ? 'Thinking…' : 'Ask AI'}
              </button>
            </div>
            {aiInsight ? (
              <p style={{ fontSize:13, color:DIM, lineHeight:1.7 }}>{aiInsight}</p>
            ) : (
              <p style={{ fontSize:13, color:MUTED, lineHeight:1.65 }}>Click "Ask AI" for a real-time analysis of platform health and your top priority today.</p>
            )}
            <Link href="/cerebre-admin/ai-insights" style={{ display:'flex', alignItems:'center', gap:4, marginTop:12, fontSize:12, fontWeight:700, color:GL }}>
              Full AI analysis <ArrowRight size={11} />
            </Link>
          </div>

          {/* Plan breakdown */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, padding:20 }}>
            <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', marginBottom:16 }}>Plan breakdown</h3>
            {[
              { plan:'Free',    key:'free_users',    color:'#8BA8C8' },
              { plan:'Starter', key:'starter_users', color:TEAL      },
              { plan:'Growth',  key:'growth_users',  color:GL        },
            ].map(p => {
              const count = stats?.[p.key] ?? 0
              const total = stats?.total_users || 1
              const pct   = Math.round((count / total) * 100)
              return (
                <div key={p.key} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12.5, color:DIM, fontWeight:600 }}>{p.plan}</span>
                    <span style={{ fontSize:12.5, fontFamily:'monospace', color:p.color, fontWeight:700 }}>{fmt(count)} ({pct}%)</span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.07)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:p.color, borderRadius:2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
