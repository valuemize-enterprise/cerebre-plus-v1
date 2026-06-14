'use client'
// /app/(dashboard)/sme-club/page.tsx

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, PlayCircle, Lock, Clock, Star, ChevronRight } from 'lucide-react'

const N='#0B1F3A',N2='#0D2040',GOLD='#E09818',GL='#F5B830'
const TEAL='#12D4B4',W='#EBF2FC',DIM='rgba(205,217,236,0.65)'
const MUTED='rgba(205,217,236,0.35)',B='rgba(255,255,255,0.08)',FAINT='rgba(255,255,255,0.05)'
const GREEN='#22C55E'

const CATEGORY_COLORS: Record<string,string> = {
  'strategy':'#8B5CF6','social-media':'#E1306C','brand':'#F59E0B','sales':'#22C55E',
  'finance':'#3B82F6','operations':'#6B7280','digital':'#12D4B4','content':'#E09818',
}

export default function SmeClubPage() {
  const [sessions,  setSessions]  = useState<any[]>([])
  const [isGrowth,  setIsGrowth]  = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all') // all | in-progress | completed

  useEffect(() => {
    fetch('/api/sme-club/sessions').then(r => r.json()).then(d => {
      setSessions(d.sessions || [])
      setIsGrowth(d.isGrowth || false)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const completed   = sessions.filter(s => s.progress?.status === 'completed').length
  const inProgress  = sessions.filter(s => s.progress?.status === 'in_progress').length
  const totalAccessible = sessions.filter(s => s.accessible).length

  const filtered = sessions.filter(s => {
    if (filter === 'completed') return s.progress?.status === 'completed'
    if (filter === 'in-progress') return s.progress?.status === 'in_progress'
    return true
  })

  return (
    <div style={{ maxWidth:960, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{ fontSize:22 }}>🎓</span>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:W, margin:0 }}>SME Club</h1>
          {isGrowth
            ? <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${TEAL}18`, color:TEAL, letterSpacing:'1px', textTransform:'uppercase' }}>✦ Growth Member</span>
            : <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(255,255,255,0.06)', color:MUTED }}>Free Preview</span>
          }
        </div>
        <p style={{ fontSize:14, color:MUTED, maxWidth:580 }}>
          Weekly masterclasses on marketing, brand, social media, and sales — built specifically for Nigerian businesses. Learn what works here.
        </p>
      </div>

      {/* Progress bar */}
      {totalAccessible > 0 && (
        <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:14, padding:'16px 20px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:13, fontWeight:700, color:DIM }}>Your progress</span>
            <span style={{ fontSize:13, color:MUTED }}>{completed} / {totalAccessible} sessions completed</span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:20, height:6, overflow:'hidden' }}>
            <div style={{ width:`${totalAccessible > 0 ? (completed/totalAccessible)*100 : 0}%`, height:'100%', background:`linear-gradient(90deg,${TEAL},${GOLD})`, borderRadius:20, transition:'width .4s' }}/>
          </div>
          <div style={{ display:'flex', gap:16, marginTop:10 }}>
            <span style={{ fontSize:11, color:GREEN }}>✓ {completed} complete</span>
            {inProgress > 0 && <span style={{ fontSize:11, color:GOLD }}>▷ {inProgress} in progress</span>}
          </div>
        </div>
      )}

      {/* Upsell for non-Growth */}
      {!isGrowth && sessions.some(s => !s.accessible) && (
        <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}25`, borderLeft:`3px solid ${GOLD}`, borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <p style={{ fontSize:13.5, fontWeight:700, color:GL, margin:'0 0 4px' }}>Unlock all {sessions.length} sessions with Growth plan</p>
            <p style={{ fontSize:12.5, color:MUTED, margin:0 }}>Free preview gives you access to selected sessions. Growth plan unlocks the full library and all future sessions.</p>
          </div>
          <Link href="/billing" style={{ flexShrink:0, padding:'9px 18px', borderRadius:10, background:`linear-gradient(135deg,${GOLD},${GL})`, color:'#071528', fontWeight:800, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
            Upgrade →
          </Link>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        {[['all','All sessions'],['in-progress','In Progress'],['completed','Completed']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding:'7px 16px', borderRadius:20, fontFamily:'inherit', fontSize:12.5, fontWeight:700, cursor:'pointer',
            background: filter===val ? `${GL}18` : FAINT,
            border:`1px solid ${filter===val ? GL+'40' : B}`,
            color: filter===val ? GL : MUTED, transition:'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Session grid */}
      {loading
        ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
            {[1,2,3].map(i=><div key={i} style={{ background:N2, borderRadius:14, height:280, border:`1px solid ${B}`, opacity:0.4 }}/>)}
          </div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
            {filtered.map(session => {
              const catColor = CATEGORY_COLORS[session.category] || TEAL
              const prog     = session.progress?.status || 'not_started'
              const locked   = !session.accessible
              return (
                <Link
                  key={session.id}
                  href={locked ? '/billing' : `/sme-club/${session.id}`}
                  style={{ textDecoration:'none' }}
                >
                  <div style={{
                    background:N2, border:`1px solid ${B}`, borderRadius:14,
                    overflow:'hidden', opacity: locked ? 0.6 : 1, transition:'all .18s',
                    cursor: locked ? 'default' : 'pointer',
                  }}
                    onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLElement).style.border=`1px solid ${catColor}40` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border=`1px solid ${B}` }}
                  >
                    {/* Thumbnail / placeholder */}
                    <div style={{ height:140, background:`${catColor}12`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                      {session.thumbnail_url
                        ? <img src={session.thumbnail_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <span style={{ fontSize:40 }}>🎓</span>
                      }
                      {/* Play / lock overlay */}
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.35)' }}>
                        {locked
                          ? <Lock size={28} style={{ color:'rgba(255,255,255,0.7)' }}/>
                          : prog==='completed'
                            ? <CheckCircle size={32} style={{ color:GREEN }}/>
                            : <PlayCircle size={32} style={{ color:'rgba(255,255,255,0.9)' }}/>
                        }
                      </div>
                      {/* Session number badge */}
                      <div style={{ position:'absolute', top:10, left:10, padding:'3px 10px', borderRadius:12, background:'rgba(0,0,0,0.65)', fontSize:11, fontWeight:700, color:'white' }}>
                        Session {session.session_number}
                      </div>
                      {/* Free preview badge */}
                      {session.is_free_preview && !isGrowth && (
                        <div style={{ position:'absolute', top:10, right:10, padding:'3px 10px', borderRadius:12, background:`${GREEN}CC`, fontSize:10, fontWeight:700, color:'white' }}>FREE</div>
                      )}
                      {/* Progress badge */}
                      {prog === 'completed' && (
                        <div style={{ position:'absolute', bottom:8, right:8, padding:'2px 8px', borderRadius:10, background:`${GREEN}CC`, fontSize:10, fontWeight:700, color:'white' }}>✓ Done</div>
                      )}
                      {prog === 'in_progress' && (
                        <div style={{ position:'absolute', bottom:8, right:8, padding:'2px 8px', borderRadius:10, background:`${GOLD}CC`, fontSize:10, fontWeight:700, color:'#071528' }}>In progress</div>
                      )}
                    </div>

                    <div style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:10, background:`${catColor}18`, color:catColor, textTransform:'capitalize' }}>
                          {session.category.replace('-',' ')}
                        </span>
                        <span style={{ fontSize:11, color:MUTED, display:'flex', alignItems:'center', gap:3 }}>
                          <Clock size={10}/>{session.duration_minutes || 45} min
                        </span>
                      </div>
                      <h3 style={{ fontFamily:"'Georgia',serif", fontSize:14.5, fontWeight:700, color:W, margin:'0 0 6px', lineHeight:1.4 }}>{session.title}</h3>
                      <p style={{ fontSize:12, color:MUTED, margin:0, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {session.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
      }

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 20px', color:MUTED }}>
          <p style={{ fontSize:14 }}>No sessions match this filter.</p>
        </div>
      )}
    </div>
  )
}
