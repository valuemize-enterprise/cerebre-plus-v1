'use client'
// /app/cerebre-admin/messages/page.tsx
// Compose and send messages to user segments.

import React, { useState } from 'react'
import { MessageSquare, Send, Users, RefreshCw, CheckCircle } from 'lucide-react'

const GL='#F5B830';const TEAL='#12D4B4';const CORAL='#E84830';const GOLD='#E09818'
const DIM='rgba(205,217,236,0.6)';const MUTED='rgba(205,217,236,0.35)';const B='rgba(255,255,255,0.07)'

const SEGMENTS = [
  { value:'all',         label:'All users',            icon:'👥', desc:'Everyone registered on the platform' },
  { value:'free',        label:'Free trial users',     icon:'🆓', desc:'Currently on the free 30-day trial' },
  { value:'starter',     label:'Starter subscribers',  icon:'⭐', desc:'Active Starter plan (₦20,000/yr)' },
  { value:'growth',      label:'Growth subscribers',   icon:'🌟', desc:'Active Growth plan + SME Club members' },
  { value:'expiring',    label:'Trials expiring soon', icon:'⏰', desc:'Free trials expiring in the next 7 days' },
  { value:'inactive',    label:'Inactive (30+ days)',  icon:'💤', desc:'Haven\'t generated any output in 30+ days' },
]

const TEMPLATES = [
  { label:'New feature announcement', subject:'New in Cerebre Plus: [Feature Name]', body:'Hi [first_name],\n\nGreat news! We just launched [feature] — and it\'s available on your plan right now.\n\nHere\'s what it does: [description]\n\nTry it at cerebreplus.com\n\nThe Cerebre Plus Team' },
  { label:'Founding member price closing', subject:'Last chance — founding price closes this week', body:'Hi [first_name],\n\nQuick heads up: the founding member price (₦20,000/yr for Starter) closes when we reach 1,000 subscribers.\n\nWe\'re getting close.\n\nIf you\'ve been thinking about upgrading, now is the time.\n\ncerebreplus.com/billing\n\nWale\nCerebre Plus' },
  { label:'Re-engagement nudge', subject:'We noticed you haven\'t been back', body:'Hi [first_name],\n\nI noticed you haven\'t used Cerebre Plus in a while — and I wanted to check in personally.\n\nIs there something we can improve? A feature that\'s not working for your business?\n\nReply to this message directly. I read every response.\n\nWale\nCerebre Plus' },
  { label:'SME Club masterclass', subject:'This week\'s SME Club masterclass — [Topic]', body:'Hi [first_name],\n\nYour weekly SME Club masterclass is ready.\n\nThis week: [Topic]\n\n[Summary of key insights]\n\nFull recording in your dashboard under SME Club.\n\nThe Cerebre Plus Team' },
]

export default function MessagesPage() {
  const [segment,   setSegment]   = useState('all')
  const [subject,   setSubject]   = useState('')
  const [body,      setBody]      = useState('')
  const [preview,   setPreview]   = useState(false)
  const [sending,   setSending]   = useState(false)
  const [result,    setResult]    = useState<{ ok:boolean; message:string; count?:number } | null>(null)
  const [history,   setHistory]   = useState<any[]>([])

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setSubject(t.subject); setBody(t.body)
  }

  const send = async () => {
    if (!subject.trim() || !body.trim()) return
    setSending(true); setResult(null)
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ segment, subject, body }),
      })
      const d = await res.json()
      setResult({ ok: res.ok, message: d.message || (res.ok ? 'Sent!' : 'Failed'), count: d.count })
      if (res.ok) {
        setHistory(h => [{ segment, subject, count: d.count, sentAt: new Date().toISOString() }, ...h])
        setSubject(''); setBody(''); setPreview(false)
      }
    } catch { setResult({ ok:false, message:'Network error — please try again' }) }
    finally { setSending(false) }
  }

  const selectedSeg = SEGMENTS.find(s => s.value === segment)

  return (
    <div style={{ maxWidth:900 }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Georgia',serif", fontSize:24, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
          <MessageSquare size={22} style={{ color:GOLD }}/> Messages
        </h1>
        <p style={{ fontSize:13.5, color:MUTED, marginTop:4 }}>
          Compose and send messages to specific user segments
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>
        {/* Compose */}
        <div>
          {/* Segment selector */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:20, marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>Who to send to</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {SEGMENTS.map(s => (
                <button key={s.value} onClick={() => setSegment(s.value)} style={{
                  display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:10, fontFamily:'inherit', textAlign:'left',
                  background: segment===s.value ? `${GOLD}12` : 'rgba(255,255,255,0.03)',
                  border:`1.5px solid ${segment===s.value ? GOLD+'40' : B}`,
                  cursor:'pointer', transition:'all .18s',
                }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color: segment===s.value ? GL : '#EBF2FC', margin:0 }}>{s.label}</p>
                    <p style={{ fontSize:11, color:MUTED, margin:'2px 0 0', lineHeight:1.4 }}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:20, marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>Compose</h3>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:7 }}>Subject line</label>
              <input
                value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="e.g. New feature just launched for your business"
                style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:10, padding:'10px 14px', color:'#EBF2FC', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:7 }}>Message body</label>
              <p style={{ fontSize:11, color:MUTED, marginBottom:6 }}>Use [first_name] as a personalisation token — it's replaced with each user's name.</p>
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                rows={9}
                placeholder="Type your message here…"
                style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${B}`, borderRadius:10, padding:'10px 14px', color:'#EBF2FC', fontSize:13.5, fontFamily:'inherit', resize:'vertical', outline:'none', boxSizing:'border-box', lineHeight:1.65 }}
              />
            </div>

            {/* Result */}
            {result && (
              <div style={{ padding:'12px 14px', borderRadius:10, marginBottom:14, background: result.ok ? 'rgba(34,197,94,0.08)' : 'rgba(232,72,48,0.08)', border:`1px solid ${result.ok ? '22C55E':'E84830'}30`, display:'flex', gap:10 }}>
                {result.ok ? <CheckCircle size={15} style={{ color:'#22C55E', flexShrink:0, marginTop:1 }}/> : null}
                <p style={{ fontSize:13, color: result.ok ? '#22C55E' : CORAL, margin:0 }}>
                  {result.message}{result.count ? ` (${result.count} recipients)` : ''}
                </p>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setPreview(v=>!v)} style={{ flex:1, padding:'11px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:`1px solid ${B}`, color:DIM, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                {preview ? 'Hide preview' : 'Preview'}
              </button>
              <button
                onClick={send}
                disabled={sending || !subject.trim() || !body.trim()}
                style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px', borderRadius:10, background:`linear-gradient(135deg,${GOLD},${GL})`, border:'none', color:'#071528', fontWeight:800, fontSize:13.5, cursor: sending||!subject.trim()||!body.trim() ? 'not-allowed':'pointer', fontFamily:'inherit', opacity: sending||!subject.trim()||!body.trim() ? .5 : 1 }}
              >
                {sending ? <RefreshCw size={14} style={{ animation:'admin-spin 1s linear infinite' }}/> : <Send size={14}/>}
                {sending ? 'Sending…' : `Send to ${selectedSeg?.label}`}
              </button>
            </div>
          </div>

          {/* Preview */}
          {preview && subject && body && (
            <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}25`, borderRadius:14, padding:20, marginBottom:14 }}>
              <p style={{ fontSize:11, fontWeight:700, color:GOLD, textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Email preview</p>
              <p style={{ fontSize:13, fontWeight:700, color:'#EBF2FC', marginBottom:8 }}>Subject: {subject}</p>
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:16 }}>
                <pre style={{ fontSize:13, color:DIM, lineHeight:1.7, margin:0, whiteSpace:'pre-wrap', fontFamily:'-apple-system,sans-serif' }}>
                  {body.replace(/\[first_name\]/g, 'Amara')}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: templates + history */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Templates */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:18 }}>
            <h3 style={{ fontFamily:"'Georgia',serif", fontSize:14, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>Message templates</h3>
            {TEMPLATES.map((t,i) => (
              <button key={i} onClick={() => applyTemplate(t)} style={{ width:'100%', textAlign:'left', background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:9, padding:'10px 12px', marginBottom:8, cursor:'pointer', fontFamily:'inherit', transition:'border-color .18s' }}>
                <p style={{ fontSize:12.5, fontWeight:700, color:DIM, margin:'0 0 2px' }}>{t.label}</p>
                <p style={{ fontSize:11, color:MUTED, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.subject}</p>
              </button>
            ))}
          </div>

          {/* Recent sends */}
          {history.length > 0 && (
            <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${B}`, borderRadius:14, padding:18 }}>
              <h3 style={{ fontFamily:"'Georgia',serif", fontSize:14, fontWeight:700, color:'#EBF2FC', marginBottom:14 }}>Sent this session</h3>
              {history.map((h,i) => (
                <div key={i} style={{ borderTop: i>0?`1px solid ${B}`:'none', paddingTop: i>0?10:0, marginBottom:8 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:DIM, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.subject}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:0 }}>{h.segment} · {h.count} sent · {new Date(h.sentAt).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
