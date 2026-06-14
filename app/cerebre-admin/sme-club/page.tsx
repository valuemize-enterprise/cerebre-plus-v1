'use client'
// /app/cerebre-admin/sme-club/page.tsx
// SME Club member list and management.

import React, { useState, useEffect } from 'react'
import { Crown, UserCheck, UserX, RefreshCw } from 'lucide-react'

const GOLD='#E09818';const GL='#F5B830';const TEAL='#12D4B4'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

export default function SMEClubPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchMembers = () => {
    setLoading(true)
    fetch('/api/admin/sme-club')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMembers(d.sessions) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMembers() }, [])

  const toggleOverride = async (userId: string, current: boolean) => {
    setToggling(userId)
    await fetch('/api/admin/sme-club', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, override: !current }),
    })
    setToggling(null)
    fetchMembers()
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
          <Crown size={22} style={{ color: GOLD }}/> SME Club
        </h1>
        <p style={{ fontSize:13.5, color:MUTED, marginTop:4 }}>{members.length} member{members.length!==1?'s':''}</p>
      </div>

      {loading ? (
        <div style={{ padding:60, textAlign:'center' }}><RefreshCw size={24} style={{ color:MUTED, animation:'admin-spin 1s linear infinite' }}/></div>
      ) : members.length === 0 ? (
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, padding:60, textAlign:'center' }}>
          <Crown size={40} style={{ color:MUTED, marginBottom:12 }}/>
          <p style={{ fontSize:14, color:MUTED }}>No SME Club members yet.</p>
        </div>
      ) : (
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${B}` }}>
                {['Member', 'Email', 'Plan', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'14px 18px', fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m: any, i: number) => (
                <tr key={m.id} style={{ borderTop: i>0?`1px solid ${B}`:'none' }}>
                  <td style={{ padding:'14px 18px' }}>
                    <span style={{ fontWeight:600, color:'#EBF2FC', fontSize:13.5 }}>{[m.first_name, m.last_name].filter(Boolean).join(' ') || '—'}</span>
                  </td>
                  <td style={{ padding:'14px 18px', fontSize:13, color:DIM }}>{m.email}</td>
                  <td style={{ padding:'14px 18px' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:m.plan==='growth'?`${GOLD}15`:'rgba(205,217,236,0.08)', color:m.plan==='growth'?GL:'#8BA8C8', textTransform:'capitalize' }}>{m.plan}</span>
                  </td>
                  <td style={{ padding:'14px 18px' }}>
                    {m.sme_club_override ? (
                      <span style={{ fontSize:11, fontWeight:700, color:TEAL }}>Override active</span>
                    ) : m.plan === 'growth' ? (
                      <span style={{ fontSize:11, fontWeight:700, color:GL }}>Active</span>
                    ) : (
                      <span style={{ fontSize:11, fontWeight:700, color:MUTED }}>—</span>
                    )}
                  </td>
                  <td style={{ padding:'14px 18px' }}>
                    <button
                      onClick={() => toggleOverride(m.id, m.sme_club_override)}
                      disabled={toggling === m.id}
                      style={{ fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:8, background:m.sme_club_override?'rgba(232,72,48,0.1)':`${GOLD}15`, border:`1px solid ${m.sme_club_override?'#E84830':'#E09818'}30`, color:m.sme_club_override?'#E84830':GL, cursor:'pointer', fontFamily:'inherit' }}
                    >
                      {toggling === m.id ? '…' : m.sme_club_override ? 'Remove' : 'Add override'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
