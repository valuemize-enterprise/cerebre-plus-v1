'use client'
// /app/cerebre-admin/coins/page.tsx
// Coin economy overview and grant coins to users.

import React, { useState, useEffect } from 'react'
import { Coins, Users, TrendingUp, Search, Send, RefreshCw, CheckCircle } from 'lucide-react'

const GOLD='#E09818';const GL='#F5B830';const TEAL='#12D4B4';const CORAL='#E84830'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

export default function CoinsPage() {
  const [stats, setStats] = useState<any>(null)
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [grantEmail, setGrantEmail] = useState('')
  const [grantAmount, setGrantAmount] = useState('')
  const [grantReason, setGrantReason] = useState('')
  const [granting, setGranting] = useState(false)
  const [grantResult, setGrantResult] = useState<{ok:boolean;message:string} | null>(null)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/admin/coins')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setStats(d.stats); setTxns(d.recent_transactions || []) } })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const grantCoins = async () => {
    // if (!grantEmail.trim() || !grantAmount.trim()) return
    setGranting(true); setGrantResult(null)
    try {
      const res = await fetch('/api/admin/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: grantEmail, amount: parseInt(grantAmount), reason: grantReason }),
      })
      const d = await res.json()
      setGrantResult({ ok: res.ok, message: d.message || d.error || 'Failed' })
      if (res.ok) { setGrantAmount(''); setGrantReason(''); fetchData() }
    } catch { setGrantResult({ ok: false, message: 'Network error' }) }
    finally { setGranting(false) }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
          <Coins size={22} style={{ color: GOLD }}/> Coins
        </h1>
        <p style={{ fontSize:13.5, color:MUTED, marginTop:4 }}>Coin economy management</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>In circulation</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color:GL, lineHeight:1 }}>{stats?.total_coins_in_circulation?.toLocaleString() ?? '—'}</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>Active users</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color:'#8BA8C8', lineHeight:1 }}>{stats?.active_users ?? '—'}</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:'20px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:14 }}>Avg per user</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:36, fontWeight:900, color:TEAL, lineHeight:1 }}>{stats?.avg_coins_per_user ?? '—'}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, padding:20 }}>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:16, fontWeight:700, color:'#EBF2FC', marginBottom:16 }}>Recent transactions</h2>
          {txns.length === 0 ? (
            <p style={{ fontSize:13, color:MUTED, textAlign:'center', padding:20 }}>No transactions yet.</p>
          ) : (
            txns.map((t: any, i: number) => (
              <div key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop: i>0?`1px solid ${B}`:'none' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#EBF2FC', margin:0 }}>{t.user || 'Unknown'}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:'2px 0 0' }}>{new Date(t.date).toLocaleDateString('en-NG')}</p>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color: t.type==='grant'||t.type==='payment' ? '#22C55E' : CORAL }}>
                  {t.type === 'deduction' ? '-' : '+'}{t.amount}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, padding:20 }}>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:16, fontWeight:700, color:'#EBF2FC', marginBottom:16 }}>Grant coins</h2>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:6 }}>User email</label>
            <input value={grantEmail} onChange={e => setGrantEmail(e.target.value)} placeholder="user@example.com" style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:10, padding:'10px 14px', color:'#EBF2FC', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:6 }}>Amount</label>
            <input type="number" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} placeholder="e.g. 50" min="1" style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:10, padding:'10px 14px', color:'#EBF2FC', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:6 }}>Reason (optional)</label>
            <input value={grantReason} onChange={e => setGrantReason(e.target.value)} placeholder="e.g. Compensation for bug" style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:10, padding:'10px 14px', color:'#EBF2FC', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
          </div>
          {grantResult && (
            <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:14, background: grantResult.ok ? 'rgba(34,197,94,0.08)' : 'rgba(232,72,48,0.08)', border:`1px solid ${grantResult.ok ? '22C55E':'E84830'}30`, display:'flex', gap:8 }}>
              {grantResult.ok && <CheckCircle size={15} style={{ color:'#22C55E', flexShrink:0, marginTop:1 }}/>}
              <p style={{ fontSize:13, color: grantResult.ok ? '#22C55E' : CORAL, margin:0 }}>{grantResult.message}</p>
            </div>
          )}
          <button onClick={grantCoins} disabled={granting || !grantEmail.trim() || !grantAmount.trim()} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px', borderRadius:10, background:`linear-gradient(135deg,${GOLD},${GL})`, border:'none', color:'#071528', fontWeight:800, fontSize:13.5, cursor: granting||!grantEmail.trim()||!grantAmount.trim() ? 'not-allowed':'pointer', fontFamily:'inherit', opacity: granting||!grantEmail.trim()||!grantAmount.trim() ? .5 : 1 }}>
            {granting ? <RefreshCw size={14} style={{ animation:'admin-spin 1s linear infinite' }}/> : <Send size={14}/>}
            {granting ? 'Granting…' : 'Grant coins'}
          </button>
        </div>
      </div>
    </div>
  )
}
