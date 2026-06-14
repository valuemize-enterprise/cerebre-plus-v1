'use client'
// /app/cerebre-admin/logs/page.tsx
// Immutable audit log viewer with pagination.

import React, { useState, useEffect } from 'react'
import { ClipboardList, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

const GOLD='#E09818';const GL='#F5B830'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

const ACTION_LABELS: Record<string, string> = {
  admin_login: 'Login', admin_logout: 'Logout', view_user: 'View user',
  upgrade_plan: 'Upgrade plan', downgrade_plan: 'Downgrade plan',
  grant_coins: 'Grant coins', suspend_user: 'Suspend user',
  unsuspend_user: 'Unsuspend user', delete_user: 'Delete user',
  send_email: 'Send email', add_sme_club: 'Add SME Club',
  remove_sme_club: 'Remove SME Club', add_admin: 'Add admin',
  remove_admin: 'Remove admin', change_admin_role: 'Change role',
  ai_insights_query: 'AI query', send_bulk_message: 'Bulk message',
}

function actionColor(action: string): string {
  if (action.includes('login') || action.includes('logout')) return '#8BA8C8'
  if (action.includes('delete') || action.includes('suspend')) return '#E84830'
  if (action.includes('grant') || action.includes('add')) return '#22C55E'
  if (action.includes('upgrade') || action.includes('downgrade') || action.includes('change')) return GL
  return DIM
}

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')

  const fetchLogs = (p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), per_page: '30' })
    if (actionFilter) params.set('action', actionFilter)
    fetch(`/api/admin/logs?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setLogs(d.logs); setTotal(d.total); setTotalPages(d.total_pages) } })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs(page) }, [page, actionFilter])

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
            <ClipboardList size={22} style={{ color: GOLD }}/> Audit Log
          </h1>
          <p style={{ fontSize:13.5, color:MUTED, marginTop:4 }}>{total} entries</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Filter size={14} style={{ color:MUTED }}/>
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }} style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:8, padding:'7px 10px', color:DIM, fontSize:12, fontFamily:'inherit', outline:'none' }}>
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding:60, textAlign:'center' }}><RefreshCw size={24} style={{ color:MUTED, animation:'admin-spin 1s linear infinite' }}/></div>
      ) : logs.length === 0 ? (
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, padding:60, textAlign:'center' }}>
          <p style={{ fontSize:14, color:MUTED }}>No audit entries yet.</p>
          <p style={{ fontSize:12, color:MUTED, marginTop:6 }}>Admin actions will appear here as they happen.</p>
        </div>
      ) : (
        <>
          <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${B}` }}>
                  {['Time', 'Admin', 'Action', 'Resource', 'Details'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any, i: number) => (
                  <tr key={l.id} style={{ borderTop: i>0?`1px solid ${B}`:'none' }}>
                    <td style={{ padding:'12px 16px', fontSize:12, color:MUTED, whiteSpace:'nowrap' }}>{new Date(l.created_at).toLocaleString('en-NG')}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'#EBF2FC', fontWeight:600 }}>{l.admin_email}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${actionColor(l.action)}15`, color:actionColor(l.action) }}>{ACTION_LABELS[l.action] || l.action}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:DIM }}>{l.resource}:{l.resource_id?.slice(0,8) || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:MUTED, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.details ? JSON.stringify(l.details).slice(0,60) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:20 }}>
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:`1px solid ${B}`, color: page<=1?MUTED:DIM, cursor: page<=1?'not-allowed':'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
              <ChevronLeft size={14}/> Previous
            </button>
            <span style={{ fontSize:12, color:MUTED }}>Page {page} of {totalPages}</span>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:`1px solid ${B}`, color: page>=totalPages?MUTED:DIM, cursor: page>=totalPages?'not-allowed':'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
              Next <ChevronRight size={14}/>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
