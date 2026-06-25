'use client'
// /app/cerebre-admin/users/page.tsx
// Full user management table — search, filter, paginate, inline actions.

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, RefreshCw, Download, Filter, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

const GL='#F5B830';const TEAL='#12D4B4';const CORAL='#E84830';const GOLD='#E09818'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

const PLAN_TABS = ['all','free','starter','growth']

function PlanBadge({ plan }: { plan: string }) {
  const m: any = { free:{bg:'rgba(139,168,200,0.1)',c:'#8BA8C8'}, starter:{bg:'rgba(18,212,180,0.1)',c:'#12D4B4'}, growth:{bg:'rgba(245,184,48,0.12)',c:'#F5B830'} }
  const s = m[plan] ?? m.free
  return <span  className='text-center' style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.c, textTransform:'capitalize' }}>{plan}</span>
}

function StatusBadge({ status }: { status: string }) {
  const m: any = { active:{bg:'rgba(34,197,94,0.1)',c:'#22C55E'}, suspended:{bg:'rgba(232,72,48,0.1)',c:'#E84830'}, expired:{bg:'rgba(139,168,200,0.08)',c:'#8BA8C8'} }
  const s = m[status] ?? m.active
  return <span className='text-center'  style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.c, textTransform:'capitalize' }}>{status}</span>
}

export default function UsersPage() {
  const [users,    setUsers]    = useState<any[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [planTab,  setPlanTab]  = useState('all')
  const [loading,  setLoading]  = useState(true)
  const PAGE_SIZE = 20

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page), limit: String(PAGE_SIZE),
      ...(search   ? { search }        : {}),
      ...(planTab !== 'all' ? { plan: planTab } : {}),
    })
    const res = await fetch(`/api/admin/users?${params}`)
    if (res.ok) {
      const d = await res.json()
      setUsers(d.users || [])
      setTotal(d.total || 0)
    }
    setLoading(false)
  }, [page, search, planTab])

  useEffect(() => { setPage(1) }, [search, planTab])
  useEffect(() => { load() }, [load])

  const pages = Math.ceil(total / PAGE_SIZE)

  const exportCSV = async () => {
    const res = await fetch('/api/admin/users?export=csv')
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `users-${Date.now()}.csv`; a.click()
  }


  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff' }}>Users</h1>
          <p style={{ fontSize:13.5, color:MUTED, marginTop:3 }}>
            {total.toLocaleString()} total registered users
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.05)', border:`1px solid ${B}`, color:DIM, fontSize:13, fontWeight:600, padding:'9px 16px', borderRadius:10, cursor:'pointer', fontFamily:'inherit' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.05)', border:`1px solid ${B}`, color:DIM, fontSize:13, fontWeight:600, padding:'9px 16px', borderRadius:10, cursor:'pointer', fontFamily:'inherit' }}>
            <RefreshCw size={14} style={{ animation: loading ? 'admin-spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </div>

      {/* Search + plan filter */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:18 }}>
        <div style={{ flex:1, minWidth:220, display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.06)', border:`1px solid ${B}`, borderRadius:10, padding:'9px 14px' }}>
          <Search size={16} style={{ color:MUTED, flexShrink:0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ background:'none', border:'none', outline:'none', color:'#EBF2FC', fontSize:13.5, fontFamily:'inherit', flex:1 }}
          />
        </div>
        <div style={{ display:'flex', gap:6, background:'rgba(255,255,255,0.04)', border:`1px solid ${B}`, borderRadius:10, padding:4 }}>
          {PLAN_TABS.map(t => (
            <button key={t} onClick={() => setPlanTab(t)} style={{ padding:'6px 16px', borderRadius:8, border:'none', background: planTab===t ? `${GOLD}18` : 'transparent', color: planTab===t ? GL : MUTED, fontWeight: planTab===t ? 700 : 500, fontSize:12.5, cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize' as const }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:16, overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 80px 80px 80px 36px', gap:8, padding:'10px 18px', borderBottom:`1px solid ${B}`, background:'rgba(255,255,255,0.02)' }}>
          {['User','Email','Plan','Coins','Status',''].map(h => (
            <span key={h} style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:60, display:'flex', alignItems:'center', justifyContent:'center', gap:12, color:MUTED, fontSize:13 }}>
            <RefreshCw size={18} style={{ animation:'admin-spin 1s linear infinite' }} /> Loading users…
          </div>
        ) : users.length === 0 ? (
          <p style={{ padding:40, textAlign:'center', fontSize:13, color:MUTED }}>No users match this filter.</p>
        ) : (
          users.map((u: any, i: number) => (
            <div key={u.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 80px 80px 80px 36px', gap:8, alignItems:'center', padding:'12px 18px', borderTop: i > 0 ? `1px solid ${B}` : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:`${GOLD}18`, border:`1px solid ${GOLD}25`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:GL, fontSize:12, flexShrink:0 }}>
                  {(u.first_name || u.email)?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:13.5, fontWeight:600, color:'#EBF2FC', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.full_name ? `${u.full_name}`.trim() : '—'}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:0 }}>{new Date(u.created_at).toLocaleDateString('en-NG')}</p>
                </div>
              </div>
              <p style={{ fontSize:12.5, color:DIM, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</p>
              <PlanBadge plan={u.subscription_tier || 'free'} />
              <span className='text-center'  style={{ fontSize:13, fontWeight:700, color:GL, fontFamily:'monospace' }}>{(u.coin_balance ?? 0).toLocaleString()}</span>
              <StatusBadge status={u.account_status || 'active'} />
              <Link href={`/cerebre-admin/users/${u.id}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', color:MUTED }}>
                <ArrowRight size={15} />
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginTop:14 }}>
          <span style={{ fontSize:12, color:MUTED }}>{((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE,total)} of {total.toLocaleString()}</span>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:`1px solid ${B}`, color: page===1 ? MUTED : DIM, fontSize:13, cursor: page===1 ? 'default' : 'pointer', fontFamily:'inherit' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ padding:'7px 14px', fontSize:13, color:DIM }}>{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:`1px solid ${B}`, color: page===pages ? MUTED : DIM, fontSize:13, cursor: page===pages ? 'default' : 'pointer', fontFamily:'inherit' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
