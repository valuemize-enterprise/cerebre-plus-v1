'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/EmailGroupOutput.tsx
//
// Group 5 — Email Sequences
// Tools: email-scribe
//
// Visual: Email client inbox simulation — each email as an unread
// row. Tap to expand and read the full email. Copy per email.
// Deep Dive: full email bodies for all emails in the sequence.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Check, RefreshCw, Bookmark, BookmarkCheck, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import type { EmailOutput, EmailFull } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:'#060C1A', navy:'#0B1F3A', card:'#0D2040',
  gold:'#E09818', gl:'#F5B830',   teal:'#12D4B4',
  blue:'#3B82F6', w:'#EBF2FC',   dim:'rgba(205,217,236,.72)',
  muted:'rgba(205,217,236,.38)', faint:'rgba(255,255,255,.04)', bdr:'rgba(255,255,255,.08)',
}

function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Single email row in inbox view ────────────────────────────
interface EmailRowProps {
  email: EmailOutput['essentials']['emails'][number]
  fullEmail?: EmailFull
  index: number
  isOpen: boolean
  onToggle: () => void
}

function EmailRow({ email, fullEmail, index, isOpen, onToggle }: EmailRowProps) {
  const copyText = fullEmail?.body || `${email.subject_line}\n\n${email.preview_text}\n\nSend timing: ${email.send_timing}`
  const { done, copy } = useCopy(copyText)

  return (
    <div style={{
      borderRadius:11, overflow:'hidden', marginBottom:8,
      border:`1.5px solid ${isOpen ? 'rgba(59,130,246,.35)' : D.bdr}`,
      background: isOpen ? 'rgba(59,130,246,.04)' : D.faint,
      transition:'all .18s',
    }}>
      {/* Email row header — inbox list item */}
      <button onClick={onToggle} style={{
        width:'100%', display:'flex', alignItems:'center', gap:10,
        padding:'11px 14px', background:'transparent', border:'none',
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        {/* Unread dot */}
        <div style={{
          width:8, height:8, borderRadius:'50%', flexShrink:0,
          background: isOpen ? 'transparent' : D.blue,
          border: isOpen ? `1.5px solid ${D.bdr}` : 'none',
        }}/>
        {/* Email number badge */}
        <div style={{
          minWidth:22, height:22, borderRadius:6, flexShrink:0,
          background:'rgba(59,130,246,.14)', border:'1px solid rgba(59,130,246,.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11, fontWeight:800, color:D.blue,
        }}>{index + 1}</div>
        {/* Subject + preview */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{
            fontSize:13.5, fontWeight: isOpen ? 700 : 700, color: isOpen ? D.blue : D.w,
            margin:'0 0 2px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
          }}>{email.subject_line}</p>
          <p style={{
            fontSize:11.5, color:D.muted, margin:0,
            overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
          }}>{email.preview_text}</p>
        </div>
        {/* Send timing */}
        {email.send_timing && (
          <span style={{ fontSize:10.5, color:D.muted, flexShrink:0, whiteSpace:'nowrap', marginLeft:8 }}>
            {email.send_timing}
          </span>
        )}
        {isOpen ? <ChevronUp size={14} style={{ color:D.blue, flexShrink:0 }}/> : <ChevronDown size={14} style={{ color:D.muted, flexShrink:0 }}/>}
      </button>

      {/* Expanded email reading view */}
      {isOpen && (
        <div style={{ borderTop:`1px solid rgba(59,130,246,.18)` }}>
          {/* Email header (from/to mimic) */}
          <div style={{ padding:'10px 14px', background:'rgba(59,130,246,.04)', borderBottom:`1px solid rgba(59,130,246,.1)`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(59,130,246,.18)', border:'1.5px solid rgba(59,130,246,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Mail size={14} style={{ color:D.blue }}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:12, fontWeight:700, color:D.blue, margin:'0 0 1px' }}>Your Business Name</p>
              <p style={{ fontSize:11, color:D.muted, margin:0 }}>to: [Customer Name] · {email.send_timing}</p>
            </div>
          </div>

          {/* Subject as email heading */}
          <div style={{ padding:'14px 16px 8px' }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:D.w, margin:'0 0 8px', lineHeight:1.35 }}>{email.subject_line}</h3>
          </div>

          {/* Body — full email or core message */}
          <div style={{ padding:'0 16px 14px' }}>
            {fullEmail?.body ? (
              <div style={{ fontSize:13.5, color:D.dim, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{fullEmail.body}</div>
            ) : (
              <div>
                <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:'0 0 14px' }}>{email.core_message}</p>
                <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.18)', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:13 }}>💡</span>
                  <p style={{ fontSize:12, color:'rgba(59,130,246,.8)', margin:0, lineHeight:1.5 }}>
                    Tap "Tell me more" below to generate the full email body (costs {'{deepDiveCost}'} coins)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Email footer actions */}
          <div style={{ padding:'10px 14px', borderTop:`1px solid rgba(59,130,246,.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
            <div style={{ display:'flex', gap:6 }}>
              {email.subject_line && (
                <SubjectCopyBtn text={email.subject_line}/>
              )}
            </div>
            <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 13px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':'rgba(59,130,246,.3)'}`, background:done?'rgba(18,212,180,.1)':'rgba(59,130,246,.08)', color:done?D.teal:D.blue, minHeight:32 }}>
              {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> {fullEmail?.body ? 'Copy email' : 'Copy brief'}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SubjectCopyBtn({ text }: { text: string }) {
  const { done, copy } = useCopy(text)
  return (
    <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 9px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted }}>
      {done ? <Check size={10}/> : <Copy size={10}/>} {done ? 'Copied' : 'Copy subject'}
    </button>
  )
}

// ── Deep Dive content — full email bodies ─────────────────────
function EmailDeepDiveContent({ data }: { data: Record<string, unknown> }) {
  const deepDive   = data.deep_dive as any ?? data
  const fullEmails = deepDive?.full_emails as EmailFull[] | undefined
  const strategy   = deepDive?.sequence_strategy as string | undefined

  return (
    <div>
      {strategy && (
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>Sequence strategy</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:0 }}>{strategy}</p>
        </div>
      )}
      {fullEmails?.map((email, i) => (
        <EmailBodyCard key={i} email={email} index={i}/>
      ))}
    </div>
  )
}

function EmailBodyCard({ email, index }: { email: EmailFull; index: number }) {
  const { done, copy } = useCopy(email.body || '')
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ minWidth:22, height:22, borderRadius:6, background:'rgba(59,130,246,.14)', border:'1px solid rgba(59,130,246,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:D.blue }}>{index+1}</div>
        <p style={{ fontSize:13, fontWeight:700, color:D.blue, margin:0, flex:1 }}>{email.subject_line}</p>
        <button onClick={copy} style={{ padding:'4px 9px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted, display:'flex', alignItems:'center', gap:3 }}>
          {done?<><Check size={10}/>Copied</>:<><Copy size={10}/>Copy</>}
        </button>
      </div>
      {email.body && (
        <div style={{ padding:'14px 16px', background:D.faint, borderRadius:10, border:`1px solid ${D.bdr}` }}>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.8, margin:0, whiteSpace:'pre-wrap' }}>{email.body}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface EmailGroupOutputProps {
  outputJson:    EmailOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
}

export function EmailGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave,
}: EmailGroupOutputProps) {
  const emails       = outputJson.essentials?.emails ?? []
  const seqType      = outputJson.sequence_type ?? ''
  const headline     = outputJson.headline ?? 'Email sequence generated'
  const totalEmails  = outputJson.total_emails ?? emails.length

  const [openEmail, setOpenEmail] = useState<number | null>(0)

  // Extract full emails from deep_dive if already loaded
  const fullEmails = useMemo(() => {
    const dd = outputJson.deep_dive as any
    return (dd?.full_emails ?? []) as EmailFull[]
  }, [outputJson.deep_dive])

  const allSubjects = emails.map(e => e.subject_line).join('\n')
  const { done: subsDone, copy: copyAllSubjects } = useCopy(allSubjects)

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`@media(max-width:600px){.em-actions{flex-direction:column!important}.em-actions>button{width:100%!important}}`}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:`1px solid ${D.bdr}`, flexWrap:'wrap', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Mail size={14} style={{ color:D.blue }}/>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:D.w, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>{headline}</p>
              <p style={{ fontSize:11, color:D.muted, margin:0 }}>EmailScribe · {totalEmails} emails · {seqType} · {coinsSpent}⊙</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {onSave && (
              <button onClick={onSave} style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isSaved?'rgba(224,152,24,.4)':D.bdr}`, background:isSaved?'rgba(224,152,24,.1)':D.faint, color:isSaved?D.gl:D.muted, cursor:'pointer' }}>
                {isSaved?<BookmarkCheck size={14}/>:<Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600, minHeight:34 }}>
                <RefreshCw size={12}/>Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Inbox label strip */}
        <div style={{ padding:'8px 14px', borderBottom:`1px solid ${D.bdr}`, flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
          <Mail size={12} style={{ color:D.blue }}/>
          <span style={{ fontSize:11, fontWeight:700, color:D.blue, letterSpacing:'1px', textTransform:'uppercase' }}>
            {seqType || 'Email'} Sequence
          </span>
          <span style={{ fontSize:11, color:D.muted }}>{totalEmails} emails · tap any to read</span>
        </div>

        {/* Scrollable inbox */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
          {emails.map((email, i) => (
            <EmailRow
              key={i} email={email}
              fullEmail={fullEmails[i]}
              index={i}
              isOpen={openEmail === i}
              onToggle={() => setOpenEmail(openEmail === i ? null : i)}
            />
          ))}

          <div style={{ marginTop:18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="em-actions" style={{ padding:'10px 14px', borderTop:`1px solid ${D.bdr}`, display:'flex', gap:8, flexShrink:0, background:'rgba(6,12,26,.97)', backdropFilter:'blur(14px)' }}>
          <button onClick={copyAllSubjects} style={{ display:'flex', alignItems:'center', gap:5, padding:'10px 14px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:700, border:`1px solid ${subsDone?'rgba(18,212,180,.4)':D.bdr}`, background:subsDone?'rgba(18,212,180,.1)':D.faint, color:subsDone?D.teal:D.muted, minHeight:44 }}>
            {subsDone?<><Check size={13}/>Subjects copied</>:<><Copy size={13}/>Copy all subject lines</>}
          </button>
          <button
            onClick={() => {
              const txt = emails.map((e,i) => `Email ${i+1}: ${e.subject_line}\n${e.preview_text}\n${e.send_timing}`).join('\n\n---\n\n')
              navigator.clipboard?.writeText(txt).catch(()=>{})
            }}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13.5, fontWeight:800, border:'1px solid rgba(59,130,246,.35)', background:'rgba(59,130,246,.1)', color:D.blue, minHeight:44 }}
          >
            <Copy size={14}/> Copy all {totalEmails} emails
          </button>
        </div>

        <DeepDiveDrawer headline={headline} renderContent={data => <EmailDeepDiveContent data={data}/>}/>
      </div>
    </DeepDiveProvider>
  )
}
