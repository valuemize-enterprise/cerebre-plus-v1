'use client'
// /app/(dashboard)/sme-club/[sessionId]/page.tsx

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, Download, ExternalLink, Star, ChevronRight } from 'lucide-react'

const N2='#0D2040',GOLD='#E09818',GL='#F5B830'
const TEAL='#12D4B4',W='#EBF2FC',DIM='rgba(205,217,236,0.65)'
const MUTED='rgba(205,217,236,0.35)',B='rgba(255,255,255,0.08)',FAINT='rgba(255,255,255,0.05)'
const GREEN='#22C55E'

function getEmbedUrl(url: string): string {
  if (!url) return ''
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  // Loom
  if (url.includes('loom.com/share/')) {
    const id = url.split('loom.com/share/')[1]?.split('?')[0]
    if (id) return `https://www.loom.com/embed/${id}`
  }
  return url
}

const RESOURCE_ICONS: Record<string,string> = { pdf:'📄', template:'📋', link:'🔗' }

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [session,   setSession]   = useState<any>(null)
  const [progress,  setProgress]  = useState<string>('not_started')
  const [loading,   setLoading]   = useState(true)
  const [marking,   setMarking]   = useState(false)
  const [nextSession, setNextSession] = useState<any>(null)

  useEffect(() => {
    // Fetch all sessions to find this one + the next
    fetch('/api/sme-club/sessions').then(r => r.json()).then(d => {
      const all = d.sessions || []
      const found = all.find((s: any) => s.id === sessionId)
      if (found) {
        setSession(found)
        setProgress(found.progress?.status || 'not_started')
        const idx = all.indexOf(found)
        setNextSession(all[idx+1] || null)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [sessionId])

  const markProgress = async (status: string) => {
    setMarking(true)
    await fetch('/api/sme-club/progress', {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify({ sessionId, status }),
    })
    setProgress(status)
    setMarking(false)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
      <div style={{ width:32, height:32, border:`2.5px solid ${GOLD}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!session) return (
    <div style={{ textAlign:'center', padding:60 }}>
      <p style={{ color:MUTED }}>Session not found.</p>
      <Link href="/sme-club" style={{ color:GL }}>← Back to SME Club</Link>
    </div>
  )

  const embedUrl = session.video_url ? getEmbedUrl(session.video_url) : null
  const resources: any[] = session.resources || []

  return (
    <div style={{ maxWidth:900, margin:'0 auto', paddingBottom:40 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Back link */}
      <Link href="/sme-club" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:MUTED, textDecoration:'none', marginBottom:20 }}>
        <ArrowLeft size={13}/> Back to SME Club
      </Link>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:700, color:MUTED }}>Session {session.session_number}</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:MUTED, display:'inline-block' }}/>
          <span style={{ fontSize:12, fontWeight:700, color:TEAL, textTransform:'capitalize' }}>{(session.category||'').replace('-',' ')}</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:MUTED, display:'inline-block' }}/>
          <span style={{ fontSize:12, color:MUTED, display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>{session.duration_minutes || 45} min</span>
        </div>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:W, margin:'0 0 8px' }}>{session.title}</h1>
        <p style={{ fontSize:14, color:MUTED, margin:0, lineHeight:1.65 }}>{session.description}</p>
      </div>

      {/* Video player */}
      {embedUrl ? (
        <div style={{ position:'relative', paddingBottom:'56.25%', height:0, borderRadius:14, overflow:'hidden', marginBottom:20, background:'#000', border:`1px solid ${B}` }}>
          <iframe
            src={embedUrl}
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={session.title}
          />
        </div>
      ) : (
        <div style={{ background:N2, border:`1px dashed ${B}`, borderRadius:14, padding:'48px 24px', textAlign:'center', marginBottom:20 }}>
          <p style={{ fontSize:28, marginBottom:10 }}>🎬</p>
          <p style={{ fontSize:14, color:MUTED }}>Video coming soon — check back when this session goes live.</p>
        </div>
      )}

      {/* Progress action */}
      <div style={{ display:'flex', gap:10, marginBottom:24 }}>
        {progress !== 'completed' && (
          <button onClick={() => markProgress('completed')} disabled={marking} style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'13px', borderRadius:12, fontFamily:'inherit', fontWeight:800, fontSize:14,
            background: progress === 'completed' ? 'rgba(34,197,94,0.15)' : `linear-gradient(135deg,${GOLD},${GL})`,
            border:`1px solid ${progress === 'completed' ? GREEN+'50' : GOLD+'50'}`,
            color: progress === 'completed' ? GREEN : '#071528', cursor:'pointer', transition:'all .2s',
          }}>
            {marking ? '⏳ Marking…' : <><CheckCircle size={15}/>Mark as complete</>}
          </button>
        )}
        {progress === 'completed' && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:'rgba(34,197,94,0.1)', border:`1px solid rgba(34,197,94,0.3)` }}>
            <CheckCircle size={15} style={{ color:GREEN }}/><span style={{ fontSize:14, fontWeight:700, color:GREEN }}>Session completed ✓</span>
          </div>
        )}
        {progress === 'not_started' && (
          <button onClick={() => markProgress('in_progress')} style={{
            padding:'13px 20px', borderRadius:12, fontFamily:'inherit', fontWeight:700, fontSize:13,
            background:FAINT, border:`1px solid ${B}`, color:MUTED, cursor:'pointer',
          }}>Mark in progress</button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        {/* Left: Key takeaways */}
        <div>
          {session.key_takeaways?.length > 0 && (
            <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:14, padding:'18px 20px', marginBottom:16 }}>
              <h2 style={{ fontFamily:"'Georgia',serif", fontSize:16, fontWeight:700, color:W, marginBottom:14 }}>Key Takeaways</h2>
              {session.key_takeaways.map((t: string, i: number) => (
                <div key={i} style={{ display:'flex', gap:10, paddingBottom:10, borderBottom: i < session.key_takeaways.length-1 ? `1px solid ${B}` : 'none', marginBottom: i < session.key_takeaways.length-1 ? 10 : 0 }}>
                  <span style={{ fontSize:14, color:TEAL, fontWeight:900, flexShrink:0, width:20, textAlign:'center' }}>{i+1}</span>
                  <p style={{ fontSize:13.5, color:DIM, margin:0, lineHeight:1.6 }}>{t}</p>
                </div>
              ))}
            </div>
          )}

          {/* Apply in Cerebre Plus */}
          <div style={{ background:`${GOLD}06`, border:`1px solid ${GOLD}20`, borderLeft:`3px solid ${GOLD}`, borderRadius:12, padding:'14px 16px' }}>
            <p style={{ fontSize:11.5, fontWeight:800, color:GOLD, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Apply this in Cerebre Plus</p>
            <p style={{ fontSize:12.5, color:DIM, margin:'0 0 10px', lineHeight:1.5 }}>
              Use what you've learned here directly in your tools — all the strategies taught in SME Club are built into the platform.
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[['Content Calendar', '/calendar'], ['Caption Craft', '/tools/caption-craft'], ['Competitor Intel', '/competitor-intelligence']].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:8, background:`${GL}15`, border:`1px solid ${GL}35`, color:GL, textDecoration:'none' }}>
                  {label} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Resources + next session */}
        <div>
          {resources.length > 0 && (
            <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:14, padding:'16px 18px', marginBottom:14 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:W, marginBottom:12 }}>Resources</h3>
              {resources.map((r: any, i: number) => (
                <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{
                  display:'flex', alignItems:'center', gap:8, padding:'9px 0',
                  borderBottom: i < resources.length-1 ? `1px solid ${B}` : 'none',
                  textDecoration:'none',
                }}>
                  <span style={{ fontSize:16 }}>{RESOURCE_ICONS[r.type] || '🔗'}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:13, color:DIM, fontWeight:600 }}>{r.title}</span>
                  </div>
                  <Download size={12} style={{ color:MUTED, flexShrink:0 }}/>
                </a>
              ))}
            </div>
          )}

          {nextSession && nextSession.accessible && (
            <Link href={`/sme-club/${nextSession.id}`} style={{ textDecoration:'none' }}>
              <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:14, padding:'16px', cursor:'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor=`${TEAL}40`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor=B}
              >
                <p style={{ fontSize:10.5, fontWeight:700, color:TEAL, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Up Next</p>
                <p style={{ fontSize:13, fontWeight:700, color:W, margin:'0 0 4px' }}>Session {nextSession.session_number}</p>
                <p style={{ fontSize:12.5, color:MUTED, margin:'0 0 8px', lineHeight:1.45 }}>{nextSession.title}</p>
                <span style={{ fontSize:12, color:TEAL, fontWeight:700 }}>Watch →</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
