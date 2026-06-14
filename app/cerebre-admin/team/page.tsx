'use client'
// /app/cerebre-admin/team/page.tsx
// Admin team management — list and change roles.

import React, { useState, useEffect } from 'react'
import { ShieldCheck, RefreshCw, CheckCircle } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS, type AdminRole } from '@/lib/admin/permissions'

const GOLD='#E09818';const GL='#F5B830'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [result, setResult] = useState<{ok:boolean;message:string} | null>(null)

  const fetchTeam = () => {
    setLoading(true)
    fetch('/api/admin/team')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTeam(d.team) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTeam() }, [])

  const changeRole = async (userId: string, role: string) => {
    setUpdating(userId); setResult(null)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      const d = await res.json()
      setResult({ ok: res.ok, message: d.message || d.error || 'Failed' })
      if (res.ok) fetchTeam()
    } catch { setResult({ ok: false, message: 'Network error' }) }
    finally { setUpdating(null) }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
          <ShieldCheck size={22} style={{ color: GOLD }}/> Admin Team
        </h1>
        <p style={{ fontSize:13.5, color:MUTED, marginTop:4 }}>{team.length} member{team.length!==1?'s':''}</p>
      </div>

      {result && (
        <div style={{ padding:'10px 16px', borderRadius:10, marginBottom:16, background: result.ok ? 'rgba(34,197,94,0.08)' : 'rgba(232,72,48,0.08)', border:`1px solid ${result.ok ? '22C55E':'E84830'}30`, display:'flex', gap:8 }}>
          {result.ok && <CheckCircle size={15} style={{ color:'#22C55E', flexShrink:0, marginTop:1 }}/>}
          <p style={{ fontSize:13, color: result.ok ? '#22C55E' : '#E84830', margin:0 }}>{result.message}</p>
        </div>
      )}

      {loading ? (
        <div style={{ padding:60, textAlign:'center' }}><RefreshCw size={24} style={{ color:MUTED, animation:'admin-spin 1s linear infinite' }}/></div>
      ) : (
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${B}` }}>
                {['Name', 'Email', 'Role', 'Last login', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'14px 18px', fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.map((m: any, i: number) => (
                <tr key={m.id} style={{ borderTop: i>0?`1px solid ${B}`:'none' }}>
                  <td style={{ padding:'14px 18px', fontWeight:600, color:'#EBF2FC', fontSize:13.5 }}>{m.name || '—'}</td>
                  <td style={{ padding:'14px 18px', fontSize:13, color:DIM }}>{m.email}</td>
                  <td style={{ padding:'14px 18px' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${ROLE_COLORS[m.role as AdminRole] || '#8BA8C8'}18`, color: ROLE_COLORS[m.role as AdminRole] || '#8BA8C8' }}>{ROLE_LABELS[m.role as AdminRole] || m.role}</span>
                  </td>
                  <td style={{ padding:'14px 18px', fontSize:12, color:MUTED }}>{m.last_login ? new Date(m.last_login).toLocaleDateString('en-NG') : 'Never'}</td>
                  <td style={{ padding:'14px 18px' }}>
                    <span style={{ fontSize:11, fontWeight:700, color: m.is_active ? '#22C55E' : '#E84830' }}>{m.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding:'14px 18px' }}>
                    <select
                      defaultValue=""
                      onChange={e => { if (e.target.value) changeRole(m.id, e.target.value) }}
                      disabled={updating === m.id}
                      className='bg-black'
                      style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:8, padding:'6px 10px', color:DIM, fontSize:12, fontFamily:'inherit', outline:'none', cursor:'pointer' }}
                    >
                      <option value="" disabled>Change role</option>
                      {Object.entries(ROLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k} className='bg-black' disabled={k===m.role}>{v}</option>
                      ))}
                    </select>
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
