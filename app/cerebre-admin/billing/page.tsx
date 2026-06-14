'use client'
// /app/cerebre-admin/billing/page.tsx
// Revenue overview — MRR, ARR, plan breakdown, recent transactions.

import React, { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react'

const GOLD='#E09818';const GL='#F5B830';const TEAL='#12D4B4'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

function fmt(n?: number) { return n === undefined ? '—' : `₦${n.toLocaleString()}` }

export default function BillingPage() {
  const [stats, setStats] = useState<any>(null)
  const [monthly, setMonthly] = useState<any[]>([])
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/billing')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setStats(d.stats); setMonthly(d.monthly_revenue || []); setTxns(d.recent_transactions || []) } })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
          <CreditCard size={22} style={{ color: GOLD }}/> Billing
        </h1>
        <p style={{ fontSize:13.5, color:MUTED, marginTop:4 }}>Revenue overview and payment history</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:28 }}>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>MRR</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color:GL, lineHeight:1 }}>{stats ? fmt(stats.mrr) : '—'}</div>
          <p style={{ fontSize:12, color:MUTED, marginTop:6 }}>Monthly recurring revenue</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>ARR</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color:TEAL, lineHeight:1 }}>{stats ? fmt(stats.arr) : '—'}</div>
          <p style={{ fontSize:12, color:MUTED, marginTop:6 }}>Annual run rate</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>Subscribers</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color:'#8BA8C8', lineHeight:1 }}>{stats?.total_subscribers ?? '—'}</div>
          <p style={{ fontSize:12, color:MUTED, marginTop:6 }}>{stats?.starter_count ?? 0} Starter · {stats?.growth_count ?? 0} Growth</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>Revenue YTD</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color:'#22C55E', lineHeight:1 }}>{stats ? fmt(stats.total_revenue_ytd) : '—'}</div>
          <p style={{ fontSize:12, color:MUTED, marginTop:6 }}>Year to date</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, padding:20 }}>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:16, fontWeight:700, color:'#EBF2FC', marginBottom:16 }}>Monthly revenue</h2>
          {monthly.length === 0 ? (
            <p style={{ fontSize:13, color:MUTED, textAlign:'center', padding:20 }}>No revenue data yet.</p>
          ) : (
            monthly.map((m: any, i: number) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop: i>0?`1px solid ${B}`:'none' }}>
                <span style={{ fontSize:13, color:DIM }}>{m.month}</span>
                <span style={{ fontSize:13, fontWeight:700, color:GL }}>{fmt(m.amount)}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, padding:20 }}>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:16, fontWeight:700, color:'#EBF2FC', marginBottom:16 }}>Recent transactions</h2>
          {txns.length === 0 ? (
            <p style={{ fontSize:13, color:MUTED, textAlign:'center', padding:20 }}>No transactions yet.</p>
          ) : (
            txns.map((t: any, i: number) => (
              <div key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop: i>0?`1px solid ${B}`:'none' }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#EBF2FC', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name || t.email}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:'2px 0 0' }}>{new Date(t.date).toLocaleDateString('en-NG')}</p>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color: t.type==='payment' ? '#22C55E' : DIM, flexShrink:0 }}>{fmt(t.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
