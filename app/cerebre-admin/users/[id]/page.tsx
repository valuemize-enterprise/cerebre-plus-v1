'use client'
// /app/cerebre-admin/users/[id]/page.tsx
// Individual user profile — view + all management actions.

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Coins, CreditCard, Shield, Trash2, UserX, UserCheck, Crown, RefreshCw } from 'lucide-react'

const GOLD='#E09818';const GL='#F5B830';const TEAL='#12D4B4';const CORAL='#E84830'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'
const PLANS = ['free','starter','growth']

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [user,    setUser]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState<string | null>(null)
  const [toast,   setToast]   = useState('')
  const [coinAmt, setCoinAmt] = useState('')
  const [emailMsg,setEmailMsg]= useState('')
  const [reason,  setReason]  = useState('')
  const [newPlan, setNewPlan] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/users/${id}`)
    if (res.ok) setUser(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  const action = async (act: string, body: any) => {
    setSaving(act)
    const res = await fetch(`/api/admin/users/${id}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: act, ...body }) })
    const d = await res.json()
    if (res.ok) { showToast(d.message || 'Done'); load() }
    else        { showToast('Error: ' + (d.error || 'Unknown')) }
    setSaving(null)
  }

  if (loading) return <div style={{ padding:60, textAlign:'center', color:MUTED }}><RefreshCw size={20} style={{ animation:'admin-spin 1s linear infinite' }} /></div>
  if (!user)   return <div style={{ padding:40 }}><p style={{ color:CORAL }}>User not found.</p></div>

  const sub   = user.subscription
  const plan  = (sub?.plan_tier || 'free') as keyof typeof planColorMap
  const coins = user.coin_balance || 0
  const planColorMap = { free:'#8BA8C8', starter:TEAL, growth:GL }
  const planColor = planColorMap[plan] || MUTED

  return (
    <div style={{ maxWidth:860 }}>
      {/* Toast */}
      {toast && <div style={{ position:'fixed', top:72, right:20, zIndex:9999, background:'#0B1F3A', border:`1px solid ${GOLD}40`, borderRadius:12, padding:'12px 20px', fontSize:13, color:'#EBF2FC', boxShadow:'0 8px 30px rgba(0,0,0,.5)' }}>{toast}</div>}

      {/* Back */}
      <button onClick={() => router.push('/cerebre-admin/users')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:MUTED, fontSize:13, fontFamily:'inherit', marginBottom:20 }}>
        <ArrowLeft size={14} /> Back to users
      </button>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:18, marginBottom:28, flexWrap:'wrap' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:`${GOLD}18`, border:`1px solid ${GOLD}30`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:GL, flexShrink:0 }}>
          {(user.first_name || user.email)?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:'#fff', marginBottom:4 }}>
            {user.full_name ? `${user.full_name}`.trim() : 'No name set'}
          </h1>
          <p style={{ fontSize:14, color:DIM, marginBottom:8 }}>{user.email}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20, background:`${planColor}18`, color:planColor, textTransform:'capitalize' }}>{plan}</span>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20, background: user.account_status==='suspended' ? `${CORAL}10` : 'rgba(34,197,94,0.1)', color: user.account_status==='suspended' ? CORAL : '#22C55E' }}>{user.account_status || 'Active'}</span>
            {sub?.plan_tier === 'growth' && <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20, background:`${GL}12`, color:GL }}>🌟 SME Club</span>}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:30, fontWeight:900, color:GL }}>{coins.toLocaleString()}</div>
          <div style={{ fontSize:11, color:MUTED }}>Cerebre Coins</div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
        {[
          { label:'Joined',         val: new Date(user.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) },
          { label:'Last active',    val: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-NG') : 'Never' },
          { label:'Industry',       val: user.industry     || '—' },
          { label:'City',           val: user.city         || '—' },
          { label:'Plan started',   val: sub?.started_at   ? new Date(sub.started_at).toLocaleDateString('en-NG') : '—' },
          { label:'Plan expires',   val: sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('en-NG') : '—' },
        ].map(r => (
          <div key={r.label} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:10, padding:'12px 14px' }}>
            <p style={{ fontSize:10.5, color:MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:4 }}>{r.label}</p>
            <p style={{ fontSize:13.5, color:'#EBF2FC', fontWeight:600 }}>{r.val}</p>
          </div>
        ))}
      </div>

      {/* Action sections */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Change plan */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>
            <CreditCard size={14} style={{ marginRight:7, verticalAlign:'middle' }} />Change plan
          </h3>
          <select value={newPlan || plan} onChange={e => setNewPlan(e.target.value)} style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:8, padding:'9px 12px', color:'#EBF2FC', fontSize:13, fontFamily:'inherit', marginBottom:10 }}>
            {PLANS.map(p => <option key={p} value={p} className='bg-black' >{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
          <button onClick={() => action('change_plan', { plan: newPlan || plan })} disabled={saving==='change_plan' || (newPlan||plan) === plan} style={{ width:'100%', padding:'10px', background:`${GOLD}18`, border:`1px solid ${GOLD}30`, color:GL, fontWeight:700, fontSize:13, borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
            {saving==='change_plan' ? 'Updating…' : `Set to ${(newPlan||plan)}`}
          </button>
        </div>

        {/* Grant coins */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>
            <Coins size={14} style={{ marginRight:7, verticalAlign:'middle' }} />Grant coins
          </h3>
          <input type="number" min={1} value={coinAmt} onChange={e => setCoinAmt(e.target.value)} placeholder="Number of coins" style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:8, padding:'9px 12px', color:'#EBF2FC', fontSize:13, fontFamily:'inherit', marginBottom:10, boxSizing:'border-box' }} />
          <button onClick={() => { action('grant_coins', { coins: Number(coinAmt) }); setCoinAmt('') }} disabled={!coinAmt || saving==='grant_coins'} style={{ width:'100%', padding:'10px', background:`${TEAL}18`, border:`1px solid ${TEAL}30`, color:TEAL, fontWeight:700, fontSize:13, borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
            {saving==='grant_coins' ? 'Granting…' : `Grant ${coinAmt || 0} coins`}
          </button>
        </div>

        {/* Send email */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>
            <Send size={14} style={{ marginRight:7, verticalAlign:'middle' }} />Send email
          </h3>
          <textarea value={emailMsg} onChange={e => setEmailMsg(e.target.value)} placeholder="Type a personal message to this user…" rows={3} style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:8, padding:'9px 12px', color:'#EBF2FC', fontSize:13, fontFamily:'inherit', resize:'vertical', marginBottom:10, boxSizing:'border-box' }} />
          <button onClick={() => { action('send_email', { message: emailMsg }); setEmailMsg('') }} disabled={!emailMsg || saving==='send_email'} style={{ width:'100%', padding:'10px', background:'rgba(255,255,255,0.06)', border:`1px solid ${B}`, color:'#EBF2FC', fontWeight:700, fontSize:13, borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
            {saving==='send_email' ? 'Sending…' : 'Send message'}
          </button>
        </div>

        {/* SME Club toggle */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>
            <Crown size={14} style={{ marginRight:7, verticalAlign:'middle' }} />SME Club
          </h3>
          <p style={{ fontSize:13, color:MUTED, marginBottom:14, lineHeight:1.5 }}>
            {user.sme_club_member ? 'This user is an SME Club member.' : 'This user is not in the SME Club.'}
          </p>
          <button onClick={async () => {
            setSaving(user.sme_club_member ? 'remove_sme_club' : 'add_sme_club')
            const res = await fetch('/api/admin/sme-club/members', {
              method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ user_id: id, action: user.sme_club_member ? 'remove' : 'add' }),
            })
            const d = await res.json()
            if (res.ok) { showToast(d.message || 'Done'); load() }
            else        { showToast('Error: ' + (d.error || 'Unknown')) }
            setSaving(null)
          }} disabled={saving==='add_sme_club'||saving==='remove_sme_club'} style={{ width:'100%', padding:'10px', background: user.sme_club_member ? `${CORAL}10` : `${GL}10`, border:`1px solid ${user.sme_club_member ? CORAL : GL}28`, color: user.sme_club_member ? CORAL : GL, fontWeight:700, fontSize:13, borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
            {user.sme_club_member ? 'Remove from SME Club' : 'Add to SME Club'}
          </button>
        </div>

        {/* Danger zone */}
        <div style={{ background:'rgba(232,72,48,0.03)', border:'1px solid rgba(232,72,48,0.15)', borderRadius:14, padding:20, gridColumn:'1/-1' }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:CORAL, marginBottom:14 }}>Danger zone</h3>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={() => action(user.account_status==='suspended' ? 'unsuspend' : 'suspend', {})} disabled={saving==='suspend'||saving==='unsuspend'} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:`1px solid ${B}`, color:DIM, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {user.account_status==='suspended' ? <><UserCheck size={14} /> Unsuspend account</> : <><UserX size={14} /> Suspend account</>}
            </button>
            <button onClick={() => { if(confirm(`Permanently delete ${user.email}? This cannot be undone.`)) action('delete_user', {}) }} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:10, background:`${CORAL}10`, border:`1px solid ${CORAL}25`, color:CORAL, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              <Trash2 size={14} /> Delete account permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
