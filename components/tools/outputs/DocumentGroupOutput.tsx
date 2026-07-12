'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/DocumentGroupOutput.tsx
//
// Group 2 — Long-form Documents
// Tools: blog-brain, press-release-ai, proposal-writer,
//        newsletter-ai, crisis-responder, lead-magnet-forge
//
// Layer 2: Summary + key points + metadata — fits one screen.
// Layer 3: Full document in Deep Dive drawer (ready to copy/edit).
//
// Visual modes:
//   blog-brain         → BlogPostView      (article editorial header)
//   press-release-ai   → PressReleaseView  (FOR IMMEDIATE RELEASE format)
//   proposal-writer    → ProposalView      (executive summary + value)
//   crisis-responder   → CrisisView        (alert banner + response)
//   lead-magnet-forge  → LeadMagnetView    (ebook cover + chapter list)
//   newsletter-ai      → NewsletterView    (newsletter email template)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import {
  Copy, Check, RefreshCw, Bookmark, BookmarkCheck, FileText, Download, AlertTriangle,
} from 'lucide-react'
import type { DocumentOutput } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:'#060C1A', navy:'#0B1F3A', card:'#0D2040',
  gold:'#E09818', gl:'#F5B830',   teal:'#12D4B4',
  red:'#E55252',  green:'#22C55E', purple:'#8B7FFF', amber:'#F97316',
  blue:'#3B82F6', w:'#EBF2FC',
  dim:'rgba(205,217,236,.72)', muted:'rgba(205,217,236,.38)',
  faint:'rgba(255,255,255,.04)', bdr:'rgba(255,255,255,.08)',
}

function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Shared: Key Points list ────────────────────────────────────
function KeyPoints({ points, color = D.teal }: { points: string[]; color?: string }) {
  return (
    <div>
      {points.map((pt, i) => (
        <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderTop:i>0?`1px solid ${D.bdr}`:'none' }}>
          <div style={{ minWidth:20, height:20, borderRadius:'50%', background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10.5, fontWeight:800, color, flexShrink:0, marginTop:1 }}>{i+1}</div>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.65, margin:0 }}>{pt}</p>
        </div>
      ))}
    </div>
  )
}

// ── Shared: Deep Dive document renderer ────────────────────────
function FullDocumentContent({ data }: { data: Record<string, unknown> }) {
  const deepDive = data.deep_dive as any ?? data
  const fullDoc  = deepDive?.full_document as string | undefined
  const editing  = deepDive?.editing_notes as string | undefined
  const seo      = deepDive?.seo_tips as string | undefined
  const checklist = deepDive?.publishing_checklist as string[] | undefined
  const { done: docDone, copy: copyDoc } = useCopy(fullDoc ?? '')

  return (
    <div>
      {/* Full document */}
      {fullDoc && (
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <p style={{ fontSize:11, fontWeight:700, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', margin:0 }}>Full document</p>
            <button onClick={copyDoc} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${docDone?'rgba(18,212,180,.4)':D.bdr}`, background:docDone?'rgba(18,212,180,.1)':D.faint, color:docDone?D.teal:D.muted }}>
              {docDone?<><Check size={11}/>Copied</>:<><Copy size={11}/>Copy</>}
            </button>
          </div>
          <div style={{ padding:'16px 18px', background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}` }}>
            <div style={{ fontSize:14, color:D.dim, lineHeight:1.85, whiteSpace:'pre-wrap', fontFamily:"'Georgia',Georgia,serif" }}>
              {fullDoc}
            </div>
          </div>
        </div>
      )}
      {/* Editing notes */}
      {editing && (
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.gl, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>Before you publish — editing notes</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:0 }}>{editing}</p>
        </div>
      )}
      {/* SEO tips */}
      {seo && (
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.purple, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>SEO tips</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:0 }}>{seo}</p>
        </div>
      )}
      {/* Publishing checklist */}
      {checklist?.length && (
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:D.green, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>Publishing checklist</p>
          {checklist.map((item, i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'6px 0', borderTop:i>0?`1px solid ${D.bdr}`:'none' }}>
              <span style={{ fontSize:14, flexShrink:0 }}>□</span>
              <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.6, margin:0 }}>{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VISUAL MODES
// ═══════════════════════════════════════════════════════════════

// ── 1. BLOG POST VIEW — blog-brain ────────────────────────────
function BlogPostView({ output }: { output: DocumentOutput }) {
  const { summary, key_points, word_count, recommended_use } = output.essentials ?? {}
  const headline = output.headline ?? ''
  const readTime = word_count ? `${Math.ceil(word_count / 200)} min read` : null
  const { done, copy } = useCopy(summary ?? '')

  return (
    <div>
      {/* Article editorial header */}
      <div style={{ borderRadius:12, border:`1px solid ${D.bdr}`, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'14px 16px', background:`linear-gradient(135deg,rgba(139,127,255,.06),${D.card})`, borderBottom:`1px solid ${D.bdr}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(139,127,255,.14)', border:'1px solid rgba(139,127,255,.3)', color:D.purple, letterSpacing:'.5px' }}>BLOG POST</span>
            {readTime && <span style={{ fontSize:11, color:D.muted }}>{readTime}</span>}
            {word_count && <span style={{ fontSize:11, color:D.muted }}>· {word_count.toLocaleString()} words</span>}
          </div>
          <p style={{ fontSize:16, fontWeight:800, color:D.w, lineHeight:1.4, margin:0 }}>{headline}</p>
        </div>
        <div style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>Article summary</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:'0 0 12px' }}>{summary}</p>
          <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted }}>
            {done?<><Check size={11}/>Copied</>:<><Copy size={11}/>Copy summary</>}
          </button>
        </div>
      </div>
      {/* Key points */}
      {key_points?.length > 0 && (
        <div style={{ background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}`, padding:'14px', marginBottom:14 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Key insights covered</p>
          <KeyPoints points={key_points} color={D.purple}/>
        </div>
      )}
      {/* Recommended use */}
      {recommended_use && (
        <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(18,212,180,.06)', border:'1px solid rgba(18,212,180,.2)', display:'flex', gap:8, alignItems:'flex-start' }}>
          <span style={{ fontSize:14, flexShrink:0 }}>📌</span>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{recommended_use}</p>
        </div>
      )}
    </div>
  )
}

// ── 2. PRESS RELEASE — press-release-ai ───────────────────────
function PressReleaseView({ output }: { output: DocumentOutput }) {
  const { summary, key_points, recommended_use } = output.essentials ?? {}
  const headline = output.headline ?? ''
  const today = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })

  return (
    <div>
      <div style={{ borderRadius:12, border:`1.5px solid ${D.bdr}`, overflow:'hidden', marginBottom:14 }}>
        {/* PR header */}
        <div style={{ padding:'10px 16px', background:D.faint, borderBottom:`1px solid ${D.bdr}` }}>
          <p style={{ fontSize:10, fontWeight:800, color:D.red, letterSpacing:'3px', textTransform:'uppercase', margin:'0 0 4px' }}>FOR IMMEDIATE RELEASE</p>
          <p style={{ fontSize:11, color:D.muted, margin:0 }}>Lagos, Nigeria · {today}</p>
        </div>
        {/* Headline */}
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${D.bdr}` }}>
          <p style={{ fontSize:16, fontWeight:800, color:D.w, lineHeight:1.4, margin:0, fontFamily:"'Georgia',serif" }}>{headline}</p>
        </div>
        {/* Lead / summary */}
        <div style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.8, margin:'0 0 10px', fontStyle:'italic' }}>
            {summary}
          </p>
          {key_points?.length > 0 && (
            <>
              <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>Key announcements</p>
              <KeyPoints points={key_points} color={D.red}/>
            </>
          )}
        </div>
      </div>
      {recommended_use && (
        <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(229,82,82,.06)', border:'1px solid rgba(229,82,82,.2)', display:'flex', gap:8 }}>
          <span style={{ fontSize:14, flexShrink:0 }}>📮</span>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{recommended_use}</p>
        </div>
      )}
    </div>
  )
}

// ── 3. PROPOSAL — proposal-writer ─────────────────────────────
function ProposalView({ output }: { output: DocumentOutput }) {
  const { summary, key_points, word_count, recommended_use } = output.essentials ?? {}
  const headline = output.headline ?? ''

  return (
    <div>
      {/* Proposal cover card */}
      <div style={{ borderRadius:14, border:`1.5px solid rgba(224,152,24,.35)`, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'16px', background:`linear-gradient(135deg,rgba(224,152,24,.08),${D.card})`, borderBottom:`1px solid rgba(224,152,24,.18)`, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(224,152,24,.14)', border:'1px solid rgba(224,152,24,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📋</div>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:D.gl, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 3px' }}>Proposal</p>
            <p style={{ fontSize:14, fontWeight:800, color:D.w, margin:0, lineHeight:1.3 }}>{headline}</p>
          </div>
        </div>
        <div style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>Executive summary</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:'0 0 12px' }}>{summary}</p>
          {word_count && <p style={{ fontSize:11, color:D.muted }}>Estimated length: {word_count.toLocaleString()} words</p>}
        </div>
      </div>
      {key_points?.length > 0 && (
        <div style={{ background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}`, padding:'14px', marginBottom:14 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Value proposition highlights</p>
          <KeyPoints points={key_points} color={D.gl}/>
        </div>
      )}
      {recommended_use && (
        <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(224,152,24,.06)', border:'1px solid rgba(224,152,24,.2)', display:'flex', gap:8 }}>
          <span style={{ fontSize:14, flexShrink:0 }}>📤</span>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{recommended_use}</p>
        </div>
      )}
    </div>
  )
}

// ── 4. CRISIS RESPONDER ───────────────────────────────────────
function CrisisView({ output }: { output: DocumentOutput }) {
  const { summary, key_points, recommended_use } = output.essentials ?? {}
  const headline = output.headline ?? ''
  const { done, copy } = useCopy(summary ?? '')

  return (
    <div>
      {/* Alert banner */}
      <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(229,82,82,.08)', border:'1.5px solid rgba(229,82,82,.3)', marginBottom:14, display:'flex', gap:10, alignItems:'flex-start' }}>
        <AlertTriangle size={16} style={{ color:D.red, flexShrink:0, marginTop:2 }}/>
        <div>
          <p style={{ fontSize:12, fontWeight:700, color:D.red, margin:'0 0 3px' }}>Crisis Response Ready</p>
          <p style={{ fontSize:12, color:'rgba(229,82,82,.8)', margin:0, lineHeight:1.5 }}>Review this response carefully before publishing. Personalise any [PLACEHOLDER] fields.</p>
        </div>
      </div>
      {/* Response card */}
      <div style={{ borderRadius:12, border:`1.5px solid rgba(229,82,82,.25)`, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'10px 14px', background:'rgba(229,82,82,.05)', borderBottom:`1px solid rgba(229,82,82,.15)`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.red, letterSpacing:'1px', textTransform:'uppercase', margin:0 }}>Official response statement</p>
          <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 9px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':'rgba(229,82,82,.3)'}`, background:done?'rgba(18,212,180,.1)':'rgba(229,82,82,.08)', color:done?D.teal:D.red }}>
            {done?<><Check size={10}/>Copied</>:<><Copy size={10}/>Copy</>}
          </button>
        </div>
        <div style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:14, color:D.w, lineHeight:1.8, margin:0, fontStyle:'italic' }}>"{summary}"</p>
        </div>
      </div>
      {key_points?.length > 0 && (
        <div style={{ background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}`, padding:'14px', marginBottom:14 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Immediate action steps</p>
          <KeyPoints points={key_points} color={D.amber}/>
        </div>
      )}
      {recommended_use && (
        <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(245,184,48,.06)', border:'1px solid rgba(245,184,48,.22)', display:'flex', gap:8 }}>
          <span style={{ fontSize:14, flexShrink:0 }}>⚠️</span>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{recommended_use}</p>
        </div>
      )}
    </div>
  )
}

// ── 5. LEAD MAGNET ────────────────────────────────────────────
function LeadMagnetView({ output }: { output: DocumentOutput }) {
  const { summary, key_points, word_count, recommended_use } = output.essentials ?? {}
  const headline = output.headline ?? ''

  return (
    <div>
      {/* Ebook cover mockup */}
      <div style={{ borderRadius:14, border:`1.5px solid ${D.teal}35`, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'20px 18px', background:`linear-gradient(135deg,rgba(18,212,180,.08),${D.card})`, borderBottom:`1px solid rgba(18,212,180,.2)`, display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:52, height:68, borderRadius:6, background:`linear-gradient(135deg,rgba(18,212,180,.2),rgba(18,212,180,.08))`, border:'1px solid rgba(18,212,180,.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:24 }}>📖</div>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>FREE LEAD MAGNET</p>
            <p style={{ fontSize:15, fontWeight:800, color:D.w, margin:'0 0 4px', lineHeight:1.35 }}>{headline}</p>
            {word_count && <p style={{ fontSize:11, color:D.muted, margin:0 }}>{word_count.toLocaleString()} words · PDF format</p>}
          </div>
        </div>
        <div style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:0 }}>{summary}</p>
        </div>
      </div>
      {key_points?.length > 0 && (
        <div style={{ background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}`, padding:'14px', marginBottom:14 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>What's inside — chapter overview</p>
          <KeyPoints points={key_points} color={D.teal}/>
        </div>
      )}
      {recommended_use && (
        <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(18,212,180,.06)', border:'1px solid rgba(18,212,180,.2)', display:'flex', gap:8 }}>
          <span style={{ fontSize:14, flexShrink:0 }}>🎯</span>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{recommended_use}</p>
        </div>
      )}
    </div>
  )
}

// ── 6. NEWSLETTER — newsletter-ai ─────────────────────────────
function NewsletterView({ output }: { output: DocumentOutput }) {
  const { summary, key_points, recommended_use } = output.essentials ?? {}
  const headline = output.headline ?? ''

  return (
    <div>
      {/* Newsletter header mockup */}
      <div style={{ borderRadius:12, border:`1px solid ${D.bdr}`, overflow:'hidden', marginBottom:14 }}>
        {/* Email banner */}
        <div style={{ padding:'12px 16px', background:`linear-gradient(90deg,rgba(59,130,246,.08),${D.card})`, borderBottom:`1px solid ${D.bdr}`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:10, fontWeight:700, color:D.blue, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 3px' }}>Newsletter Issue</p>
            <p style={{ fontSize:14, fontWeight:700, color:D.w, margin:0, lineHeight:1.3 }}>{headline}</p>
          </div>
          <div style={{ padding:'6px 12px', borderRadius:7, background:'rgba(59,130,246,.14)', border:'1px solid rgba(59,130,246,.3)', fontSize:12, fontWeight:700, color:D.blue, flexShrink:0 }}>
            Send preview
          </div>
        </div>
        <div style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:0 }}>{summary}</p>
        </div>
      </div>
      {key_points?.length > 0 && (
        <div style={{ background:D.faint, borderRadius:12, border:`1px solid ${D.bdr}`, padding:'14px', marginBottom:14 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>This issue covers</p>
          <KeyPoints points={key_points} color={D.blue}/>
        </div>
      )}
      {recommended_use && (
        <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.2)', display:'flex', gap:8 }}>
          <span style={{ fontSize:14, flexShrink:0 }}>📨</span>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.6, margin:0 }}>{recommended_use}</p>
        </div>
      )}
    </div>
  )
}

// ── Router ─────────────────────────────────────────────────────
function renderMode(toolId: string, output: DocumentOutput) {
  switch (toolId) {
    case 'press-release-ai':  return <PressReleaseView output={output}/>
    case 'proposal-writer':   return <ProposalView     output={output}/>
    case 'crisis-responder':  return <CrisisView       output={output}/>
    case 'lead-magnet-forge': return <LeadMagnetView   output={output}/>
    case 'newsletter-ai':     return <NewsletterView   output={output}/>
    default:                  return <BlogPostView      output={output}/>
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const TOOL_LABELS: Record<string, string> = {
  'blog-brain':'✍️ BlogBrain', 'press-release-ai':'📰 Press Release AI',
  'proposal-writer':'📋 ProposalWriter', 'crisis-responder':'🚨 CrisisResponder',
  'lead-magnet-forge':'📖 LeadMagnetForge', 'newsletter-ai':'📧 NewsletterAI',
}

export interface DocumentGroupOutputProps {
  outputJson:    DocumentOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
}

export function DocumentGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave,
}: DocumentGroupOutputProps) {
  const headline   = outputJson.headline ?? 'Document generated'
  const docType    = outputJson.document_type ?? ''
  const wordCount  = outputJson.essentials?.word_count ?? 0

  const allText = [
    headline,
    outputJson.essentials?.summary ?? '',
    ...(outputJson.essentials?.key_points ?? []).map((p, i) => `${i+1}. ${p}`),
    outputJson.essentials?.recommended_use ?? '',
  ].filter(Boolean).join('\n\n')

  const { done: allDone, copy: copyAll } = useCopy(allText)

  const exportAsText = () => {
    const blob = new Blob([allText], { type:'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${toolId}-summary.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`@media(max-width:600px){.doc-actions{flex-direction:column!important}.doc-actions>button{width:100%!important}}`}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:`1px solid ${D.bdr}`, flexWrap:'wrap', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:D.faint, border:`1px solid ${D.bdr}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <FileText size={14} style={{ color:D.muted }}/>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:D.w, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>{headline}</p>
              <p style={{ fontSize:11, color:D.muted, margin:0 }}>
                {TOOL_LABELS[toolId] || toolId} · {docType} · {wordCount ? wordCount.toLocaleString() + ' words · ' : ''}{coinsSpent}⊙
              </p>
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

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
          {renderMode(toolId, outputJson)}
          <div style={{ marginTop:18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="doc-actions" style={{ padding:'10px 14px', borderTop:`1px solid ${D.bdr}`, display:'flex', gap:8, flexShrink:0, background:'rgba(6,12,26,.97)', backdropFilter:'blur(14px)' }}>
          <button onClick={exportAsText} style={{ display:'flex', alignItems:'center', gap:5, padding:'10px 14px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, minHeight:44 }}>
            <Download size={14}/> Export
          </button>
          <button onClick={copyAll} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13.5, fontWeight:800, border:`1px solid ${allDone?'rgba(18,212,180,.4)':'rgba(224,152,24,.35)'}`, background:allDone?'rgba(18,212,180,.14)':'rgba(224,152,24,.14)', color:allDone?D.teal:D.gl, transition:'all .18s', minHeight:44 }}>
            {allDone?<><Check size={14}/>Copied!</>:<><Copy size={14}/>Copy summary</>}
          </button>
        </div>

        {/* Deep Dive drawer — shows full document */}
        <DeepDiveDrawer headline={headline} renderContent={data => <FullDocumentContent data={data}/>}/>
      </div>
    </DeepDiveProvider>
  )
}
