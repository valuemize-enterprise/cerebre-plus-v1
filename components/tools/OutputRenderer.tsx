'use client'
/**
 * /components/tools/OutputRenderer.tsx  v4
 *
 * The only rule: users must INSTANTLY know what to copy.
 *
 * Two zones, always:
 *   USE THIS   — gold accent, big copy button, always visible
 *   STRATEGY   — teal accent, collapsed by default, tap to expand
 *
 * Layout types:
 *   carousel  · whatsapp  · strategy  · sequence  · calendar  · document  · report  · plain
 */
'use client'
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  Copy, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Lightbulb, Bookmark, BookmarkCheck, RefreshCw, Sparkles, Hash,
  Clock, Target, Share2, DownloadCloud,
} from 'lucide-react'
import { parseToolOutput, type ParsedSection, type LayoutType } from '@/lib/tools/output-parsers'
import { RatingWidget } from '@/components/tools/RatingWidget'

// ─── Design tokens ──────────────────────────────────────────
const N1    = '#0B1F3A'   // navy
const N2    = '#0D2040'   // deeper navy
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const WA_G  = '#25D366'
const WA_D  = '#075E54'
const CORAL = '#E84830'
const W     = '#EBF2FC'
const DIM   = 'rgba(205,217,236,.72)'
const MUTED = 'rgba(205,217,236,.38)'
const FAINT = 'rgba(255,255,255,.055)'
const BDR   = 'rgba(255,255,255,.09)'

const PLAT_COLOR: Record<string,string> = {
  Instagram:'#E1306C', Facebook:'#1877F2', LinkedIn:'#0A66C2',
  TikTok:'#69C9D0', Twitter:'#1DA1F2', X:'#1DA1F2',
  WhatsApp:WA_G, YouTube:'#FF0000', Website:'#7C3AED',
}

// ─── Primitives ─────────────────────────────────────────────

function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const run = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2200)
  }, [text])
  return { copied, run }
}

/** Clean text for display — strips markdown */
function clean(t: string) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Render clean text with bullet detection */
function Text({ t, size = 14.5 }: { t: string; size?: number }) {
  if (!t) return null
  return (
    <div style={{ fontSize: size, color: DIM, lineHeight: 1.82 }}>
      {t.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />
        const isBullet = /^[•→·–\-]\s/.test(line)
        const text     = line.replace(/^[•→·–\-]\s*/, '').replace(/\*\*(.+?)\*\*/g, '$1')
        return (
          <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom: isBullet ? 4 : 0 }}>
            {isBullet && <span style={{ color:GL, flexShrink:0, fontSize:size-2, marginTop:3 }}>›</span>}
            <span style={{ fontWeight: /^(?:\*\*)?[A-Z\s]{8,}(?:\*\*)?:/.test(line) ? 700 : 400 }}>{text}</span>
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// USE-THIS BLOCK  —  THE primary copy zone
// Gold border, always-visible copy button, "USE THIS" badge
// ════════════════════════════════════════════════════════════
function UseCopyBlock({
  text, badge = 'USE THIS', hint, isWA = false, isSubject = false, isHeadline = false,
}: {
  text: string; badge?: string; hint?: string; isWA?: boolean; isSubject?: boolean; isHeadline?: boolean
}) {
  const { copied, run } = useCopy(text)
  if (!text.trim()) return null
  const isBig = !isSubject && !isHeadline

  return (
    <div style={{
      borderRadius: 12, overflow:'hidden',
      border:`1px solid rgba(224,152,24,${copied ? '.55' : '.22'})`,
      borderLeft:`3px solid ${copied ? TEAL : GOLD}`,
      background: copied ? 'rgba(18,212,180,.06)' : 'rgba(224,152,24,.055)',
      transition:'all .25s',
      marginBottom: 0,
    }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', borderBottom:`1px solid rgba(224,152,24,.14)` }}>
        <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:'1.8px', textTransform:'uppercase' as const, color: copied ? TEAL : GOLD }}>
          {copied ? '✓ Copied to clipboard' : badge}
        </span>
        {hint && <span style={{ fontSize:10.5, color:MUTED, marginLeft:'auto', marginRight:10 }}>{hint}</span>}
        <button
          onClick={run}
          style={{
            display:'flex', alignItems:'center', gap:5,
            background: copied ? 'rgba(18,212,180,.2)' : 'rgba(224,152,24,.18)',
            border:`1px solid ${copied ? 'rgba(18,212,180,.45)' : 'rgba(224,152,24,.40)'}`,
            color: copied ? TEAL : GL,
            fontSize:11.5, fontWeight:700, padding:'5px 14px',
            borderRadius:20, cursor:'pointer', fontFamily:'inherit', transition:'all .2s',
          }}
        >
          {copied ? <Check size={12}/> : <Copy size={12}/>}
          {copied ? 'Done' : 'Copy'}
        </button>
      </div>
      {/* Content */}
      <div style={{ padding: isBig ? '15px 16px 16px' : '10px 14px' }}>
        {isSubject || isHeadline
          ? <p style={{ fontSize: isSubject ? 15 : 18, fontWeight: isSubject ? 600 : 800, color:W, margin:0, lineHeight:1.4 }}>{text}</p>
          : isWA
            ? <p style={{ fontSize:14, fontFamily:'-apple-system,sans-serif', color:'#111', lineHeight:1.72, margin:0, whiteSpace:'pre-wrap' as const }}>{text}</p>
            : <Text t={text} />
        }
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// STRATEGY PANEL  —  the guidance zone (collapsed by default)
// ════════════════════════════════════════════════════════════
function StrategyPanel({ text, label = 'STRATEGY NOTE', open: defaultOpen = false }: {
  text: string; label?: string; open?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (!text.trim()) return null
  return (
    <div style={{
      borderRadius:10, overflow:'hidden',
      border:`1px solid rgba(18,212,180,${open ? '.22' : '.12'})`,
      borderLeft:`3px solid ${TEAL}`,
      background:'rgba(18,212,180,.045)',
      transition:'border-color .2s',
      marginTop:8,
    }}>
      <button onClick={() => setOpen(v=>!v)} style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'9px 14px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <Lightbulb size={12} style={{ color:TEAL }}/>
          <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:'1.8px', textTransform:'uppercase' as const, color:TEAL }}>{label}</span>
        </div>
        {open ? <ChevronUp size={13} style={{color:MUTED}}/> : <ChevronDown size={13} style={{color:MUTED}}/>}
      </button>
      <div style={{ maxHeight: open ? 2400 : 0, overflow:'hidden', transition:'max-height .32s ease' }}>
        <div style={{ padding:'4px 16px 14px' }}>
          <Text t={clean(text)} size={13}/>
        </div>
      </div>
    </div>
  )
}

// ─── Metadata chips (timing, targeting, etc.) ───────────────
function Chips({ items }: { items: Array<{icon:React.ReactNode; text:string; color?:string}> }) {
  if (!items.length) return null
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
      {items.map((c,i) => (
        <span key={i} style={{
          display:'inline-flex', alignItems:'center', gap:5,
          fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:20,
          background:`${c.color ?? TEAL}14`,
          border:`1px solid ${c.color ?? TEAL}28`,
          color: c.color ?? TEAL,
        }}>
          {c.icon}{c.text}
        </span>
      ))}
    </div>
  )
}

// ─── Hashtag pills ───────────────────────────────────────────
function HashtagRow({ tags }: { tags: string[] }) {
  const { copied, run } = useCopy(tags.join(' '))
  if (!tags.length) return null
  return (
    <div style={{ marginTop:10, padding:'10px 14px', background:FAINT, borderRadius:10, border:`1px solid ${BDR}` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <Hash size={11} style={{color:MUTED}}/>
          <span style={{ fontSize:9.5, fontWeight:700, color:MUTED, letterSpacing:'1.5px', textTransform:'uppercase' as const }}>Hashtags</span>
        </div>
        <button onClick={run} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color: copied ? TEAL : MUTED, fontFamily:'inherit', fontSize:11, fontWeight:700 }}>
          {copied ? <Check size={11}/> : <Copy size={11}/>} {copied ? 'Copied!' : 'Copy all'}
        </button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {tags.slice(0,20).map((t,i) => (
          <span key={i} style={{ fontSize:11.5, padding:'3px 10px', borderRadius:20, background:'rgba(139,168,200,.08)', color:'#8BA8C8' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Action checklist ────────────────────────────────────────
function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set())
  if (!items.length) return null
  const toggle = (i:number) => setDone(p => { const n=new Set(p); n.has(i)?n.delete(i):n.add(i); return n })
  return (
    <div style={{ background:FAINT, border:`1px solid ${BDR}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
        <span style={{ fontSize:9.5, fontWeight:800, color:GL, letterSpacing:'1.5px', textTransform:'uppercase' as const }}>Action Plan</span>
        <span style={{ marginLeft:'auto', fontSize:10, color:MUTED }}>{done.size}/{items.length} done</span>
      </div>
      {items.map((item,i)=>(
        <button key={i} onClick={()=>toggle(i)} style={{ display:'flex', alignItems:'flex-start', gap:10, width:'100%', background:'none', border:'none', cursor:'pointer', padding:'5px 0', fontFamily:'inherit', textAlign:'left' }}>
          <div style={{
            width:18, height:18, borderRadius:4, flexShrink:0, marginTop:2,
            background:  done.has(i) ? TEAL : FAINT,
            border:`1.5px solid ${done.has(i) ? TEAL : BDR}`,
            display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s',
          }}>
            {done.has(i) && <Check size={11} style={{color:'#fff'}}/>}
          </div>
          <span style={{ fontSize:13, color: done.has(i) ? MUTED : DIM, textDecoration: done.has(i) ? 'line-through':'none', lineHeight:1.5 }}>{item}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Full-width copy button ───────────────────────────────────
function BigCopyBtn({ text, label = 'Copy', secondary = false }: { text:string; label?:string; secondary?:boolean }) {
  const { copied, run } = useCopy(text)
  return (
    <button onClick={run} style={{
      width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
      background: copied
        ? 'rgba(18,212,180,.2)'
        : secondary ? FAINT : `linear-gradient(135deg,${GOLD}33,${GL}22)`,
      border:`1px solid ${copied ? 'rgba(18,212,180,.5)' : secondary ? BDR : 'rgba(224,152,24,.42)'}`,
      color: copied ? TEAL : secondary ? DIM : GL,
      fontWeight:800, fontSize:13.5, padding:'13px',
      borderRadius:12, cursor:'pointer', fontFamily:'inherit', transition:'all .2s',
    }}>
      {copied ? <Check size={15}/> : <Copy size={15}/>}
      {copied ? 'Copied to clipboard!' : label}
    </button>
  )
}

// ─── Bottom action bar ───────────────────────────────────────
type ActProps = {
  onRegenerate?:  () => void
  isSaved?:       boolean
  onSave?:        () => void
  isStreaming?:   boolean
  // Rating context — passed from OutputRenderer down to OutputFooter
  toolId?:        string
  toolCategory?:  'text' | 'design' | 'whatsapp' | 'strategy' | 'calendar' | 'sequence'
  coinsSpent?:    number
  generationId?:  string
  variantCount?:  number
}

function ActionBar({ allText, isStreaming, onRegenerate, isSaved, onSave }: { allText:string } & ActProps) {
  const { copied, run } = useCopy(allText)
  const waShare = () => {
    const msg = `Here's what Cerebre Plus created for me:\n\n${allText.slice(0,1000)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank')
  }
  return (
    <div style={{
      position:'sticky', bottom:0,
      background:'rgba(9,12,22,.96)',
      backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
      borderTop:`1px solid ${BDR}`,
      padding:'10px 14px',
      display:'flex', gap:8, flexWrap:'wrap',
      zIndex:20,
    }}>
      <button onClick={run} disabled={!!isStreaming} style={{
        flex:'1 0 auto', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
        background: copied ? 'rgba(18,212,180,.2)' : 'rgba(224,152,24,.18)',
        border:`1px solid ${copied ? 'rgba(18,212,180,.45)':'rgba(224,152,24,.40)'}`,
        color: copied ? TEAL : GL,
        fontWeight:800, fontSize:13, padding:'12px 0', borderRadius:10,
        cursor: isStreaming?'not-allowed':'pointer', fontFamily:'inherit', transition:'all .2s',
        opacity: isStreaming ? .5 : 1,
      }}>
        {copied ? <Check size={14}/> : <Copy size={14}/>}{copied?'Copied!':'Copy All'}
      </button>
      <button onClick={waShare} style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(37,211,102,.14)', border:'1px solid rgba(37,211,102,.32)', color:WA_G, fontWeight:700, fontSize:13, padding:'12px 14px', borderRadius:10, cursor:'pointer', fontFamily:'inherit' }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill={WA_G}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.533 5.851L.057 23.526a.5.5 0 0 0 .617.608l5.87-1.539A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
        Share
      </button>
      {onSave && (
        <button onClick={onSave} style={{ display:'flex', alignItems:'center', gap:5, background:isSaved?'rgba(224,152,24,.18)':FAINT, border:`1px solid ${isSaved?'rgba(224,152,24,.40)':BDR}`, color:isSaved?GL:MUTED, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'inherit' }}>
          {isSaved?<BookmarkCheck size={14}/>:<Bookmark size={14}/>}
        </button>
      )}
      {onRegenerate && (
        <button onClick={onRegenerate} disabled={!!isStreaming} style={{ display:'flex', alignItems:'center', gap:5, background:FAINT, border:`1px solid ${BDR}`, color:MUTED, padding:'12px', borderRadius:10, cursor:isStreaming?'not-allowed':'pointer', fontFamily:'inherit', opacity:isStreaming?.5:1 }}>
          <RefreshCw size={14} style={{animation:isStreaming?'or-spin 1s linear infinite':'none'}}/>
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// OUTPUT FOOTER — ActionBar + RatingWidget combined
// Every layout renders this at the bottom.
// ─────────────────────────────────────────────────────────────
function OutputFooter({
  allText, isStreaming, onRegenerate, isSaved, onSave,
  toolId, toolCategory, coinsSpent, generationId, variantCount,
}: { allText: string } & ActProps) {
  const [rated, setRated] = useState(false)

  return (
    <div>
      {/* Rating widget — appears above the sticky action bar, only when output exists */}
      {allText && !isStreaming && !rated && toolId && (
        <div style={{ padding:'10px 14px 0' }}>
          <RatingWidget
            toolId={toolId}
            toolCategory={toolCategory ?? 'text'}
            generationId={generationId}
            coinsSpent={coinsSpent}
            variantCount={variantCount}
            compact={false}
            onRated={(thumbs) => {
              // After thumbs tap, allow the full widget to show but mark as initiated
              if (thumbs === 'up') setTimeout(() => setRated(true), 4000)
            }}
          />
        </div>
      )}
      <ActionBar
        allText={allText} isStreaming={isStreaming}
        onRegenerate={onRegenerate} isSaved={isSaved} onSave={onSave}
      />
    </div>
  )
}

// ─── Streaming skeleton ──────────────────────────────────────
function StreamSkeleton({ toolName, partial }: { toolName?:string; partial?:string }) {
  return (
    <div style={{ padding:'20px 16px', flex:1, overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18, padding:'9px 14px', background:`${GL}10`, borderRadius:10 }}>
        <Sparkles size={14} style={{color:GL, animation:'or-blink 1.1s ease infinite'}}/>
        <span style={{ fontSize:12.5, color:GL, fontWeight:700 }}>
          Writing your {toolName||'output'}…
        </span>
      </div>
      {partial
        ? (
          <div style={{ borderRadius:12, border:`1px solid rgba(224,152,24,.22)`, borderLeft:`3px solid ${GOLD}`, background:'rgba(224,152,24,.055)', padding:'15px 16px' }}>
            <Text t={partial}/><span style={{ display:'inline-block', width:2, height:'1em', background:GL, verticalAlign:'middle', marginLeft:2, animation:'or-blink .7s ease infinite' }}/>
          </div>
        )
        : [1,.72,.85,.5,.9,.6].map((w,i)=>(
          <div key={i} style={{ height:13, borderRadius:5, background:`rgba(255,255,255,${.04+i*.008})`, width:`${w*100}%`, marginBottom:10, animation:`or-pulse 1.4s ease ${i*.12}s infinite` }}/>
        ))
      }
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// SINGLE-SECTION RENDERER
// Used by all layouts to render one parsed section
// ════════════════════════════════════════════════════════════
function SectionContent({ s, forceIntelOpen = false }: { s: ParsedSection; forceIntelOpen?: boolean }) {
  const chips = [
    s.timing  && { icon:<Clock  size={11}/>, text:s.timing,  color:TEAL  },
    s.targets && { icon:<Target size={11}/>, text:s.targets, color:'#8B7FFF' },
  ].filter(Boolean) as Array<{icon:React.ReactNode;text:string;color:string}>

  if (s.kind === 'guidance') {
    // Guidance section: labelled intel panel, open by default in this context
    return <StrategyPanel text={s.text} label={s.label.toUpperCase()} open={forceIntelOpen}/>
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {/* Metadata chips */}
      {chips.length > 0 && <><Chips items={chips}/></>}

      {/* Action items checklist */}
      {s.bullets && s.bullets.length > 0 && <Checklist items={s.bullets}/>}

      {/* Subject line: its own copy block */}
      {s.subject && (
        <><UseCopyBlock text={s.subject} badge="SUBJECT LINE" isSubject/><div style={{height:8}}/></>
      )}

      {/* Main copy */}
      <UseCopyBlock
        text={s.text}
        badge={s.subject ? 'EMAIL BODY' : s.platform ? `${s.platform.toUpperCase()} COPY` : 'USE THIS'}
        hint={s.subject ? 'Body text' : s.platform ? `Post to ${s.platform}` : undefined}
        isWA={s.platform === 'WhatsApp'}
      />

      {/* Hashtags */}
      {s.hashtags && s.hashtags.length > 0 && <HashtagRow tags={s.hashtags}/>}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 1 — CAROUSEL  (variants / platform tabs)
// carousel → copy-brain, caption-craft, ad-scribe, bio-builder, promo-blast
// ════════════════════════════════════════════════════════════
function CarouselLayout({ copy, guidance, allText, isStreaming, toolName, ...ap }: {
  copy: ParsedSection[]; guidance: ParsedSection[]; allText:string; isStreaming?:boolean; toolName?:string
} & ActProps) {
  const [idx, setIdx] = useState(0)
  const startX = useRef(0)
  const total   = copy.length
  const section = copy[idx]
  if (!section) return null

  const pc = PLAT_COLOR[section.platform ?? ''] ?? GOLD
  const prev = () => setIdx(i=>(i-1+total)%total)
  const next = () => setIdx(i=>(i+1)%total)
  const onTouchStart = (e:React.TouchEvent) => { startX.current = e.changedTouches[0].clientX }
  const onTouchEnd   = (e:React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 44) dx < 0 ? next() : prev()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Dot nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px 9px', borderBottom:`1px solid ${BDR}` }}>
        <div style={{ display:'flex', gap:4 }}>
          {copy.map((_,i)=>(
            <button key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?20:7, height:7, borderRadius:4, background:i===idx?GL:BDR, border:'none', cursor:'pointer', padding:0, transition:'all .2s' }}/>
          ))}
        </div>
        <span style={{ fontSize:11.5, color:MUTED }}>{idx+1} / {total}</span>
        <div style={{ display:'flex', gap:5 }}>
          <button onClick={prev} disabled={total===1} style={{ background:FAINT, border:`1px solid ${BDR}`, color:MUTED, width:30, height:30, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:total===1?.35:1 }}><ChevronLeft size={13}/></button>
          <button onClick={next} disabled={total===1} style={{ background:FAINT, border:`1px solid ${BDR}`, color:MUTED, width:30, height:30, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:total===1?.35:1 }}><ChevronRight size={13}/></button>
        </div>
      </div>

      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ flex:1, overflowY:'auto', padding:'14px 14px 6px' }}>
        {/* Section header badge */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <span style={{ fontSize:16 }}>{section.icon}</span>
          {section.platform && (
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${pc}18`, color:pc }}>
              {section.platform}
            </span>
          )}
          <span style={{ fontSize:14, fontWeight:700, color:W }}>{section.label}</span>
        </div>

        {/* Main section content (copy + hashtags) */}
        <SectionContent s={section}/>

        {/* Guidance sections (from the tool) */}
        {guidance.map(g=>(
          <StrategyPanel key={g.id} text={g.text} label={g.label}/>
        ))}
      </div>

      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 2 — WHATSAPP  (WA bubble preview)
// whatsapp-campaign-builder, follow-up-*, welcome-*, win-back-*
// ════════════════════════════════════════════════════════════
function WhatsAppLayout({ copy, guidance, allText, isStreaming, ...ap }: {
  copy:ParsedSection[]; guidance:ParsedSection[]; allText:string; isStreaming?:boolean
} & ActProps) {
  const [idx, setIdx] = useState(0)
  const msg = copy[idx]
  if (!msg) return null
  const waOpen = () => window.open(`https://wa.me/?text=${encodeURIComponent(msg.text)}`,'_blank')

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Message selector tabs */}
      {copy.length > 1 && (
        <div style={{ display:'flex', gap:5, overflowX:'auto', padding:'10px 14px', borderBottom:`1px solid ${BDR}`, scrollbarWidth:'none' }}>
          {copy.map((m,i)=>(
            <button key={i} onClick={()=>setIdx(i)} style={{
              flexShrink:0, padding:'5px 14px', borderRadius:20, fontFamily:'inherit',
              background: idx===i?'rgba(37,211,102,.18)':FAINT,
              border:`1px solid ${idx===i?'rgba(37,211,102,.38)':BDR}`,
              color: idx===i?WA_G:MUTED,
              fontWeight:idx===i?700:500, fontSize:12.5, cursor:'pointer', whiteSpace:'nowrap' as const,
            }}>{m.label}</button>
          ))}
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
        {/* Phone mockup */}
        <div style={{ maxWidth:360, margin:'0 auto 14px', background:'#ECE5DD', borderRadius:16, overflow:'hidden', boxShadow:'0 4px 22px rgba(0,0,0,.38)' }}>
          <div style={{ background:WA_D, padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(37,211,102,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👤</div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:0 }}>Your Customers</p>
              <p style={{ fontSize:10.5, color:'rgba(255,255,255,.65)', margin:0 }}>WhatsApp Broadcast</p>
            </div>
            {/* Quick copy in WA header */}
            <button onClick={()=>navigator.clipboard?.writeText(msg.text)} style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
              <Copy size={11}/> Copy
            </button>
          </div>
          <div style={{ padding:'14px 12px' }}>
            <div style={{ textAlign:'center', marginBottom:10 }}>
              <span style={{ fontSize:11, background:'rgba(0,0,0,.1)', color:'#555', padding:'2px 10px', borderRadius:10 }}>Today</span>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <div style={{ background:'#DCF8C6', borderRadius:'12px 2px 12px 12px', padding:'10px 14px', maxWidth:'90%' }}>
                <p style={{ fontSize:13.5, color:'#111', lineHeight:1.65, margin:0, whiteSpace:'pre-wrap' as const, fontFamily:'-apple-system,sans-serif' }}>
                  {msg.text}
                  {isStreaming && <span style={{ display:'inline-block', width:2, height:'1em', background:WA_D, verticalAlign:'middle', marginLeft:2, animation:'or-blink .7s ease infinite' }}/>}
                </p>
                <p style={{ fontSize:10.5, color:'#888', margin:'4px 0 0', textAlign:'right' }}>Now ✓✓</p>
              </div>
            </div>
          </div>
        </div>

        {/* "USE THIS" explainer label */}
        <p style={{ fontSize:10.5, color:GOLD, fontWeight:700, textAlign:'center', letterSpacing:'1.5px', textTransform:'uppercase' as const, marginBottom:10 }}>
          The above is your exact message — copy and send
        </p>

        {/* Metadata chips */}
        {(msg.timing || msg.targets) && (
          <Chips items={[
            msg.timing  && { icon:<Clock  size={11}/>, text:msg.timing,  color:TEAL  },
            msg.targets && { icon:<Target size={11}/>, text:msg.targets, color:'#8B7FFF' },
          ].filter(Boolean) as any}/>
        )}

        {/* Inline copy block (for easy copy on mobile) */}
        <BigCopyBtn text={msg.text} label="Copy Message"/>

        {/* Test on WA */}
        <button onClick={waOpen} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'rgba(37,211,102,.12)', border:'1px solid rgba(37,211,102,.28)', color:WA_G, fontWeight:700, fontSize:13, padding:'11px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', marginTop:8 }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill={WA_G}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.533 5.851L.057 23.526a.5.5 0 0 0 .617.608l5.87-1.539A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          Send test to your WhatsApp
        </button>

        {/* Guidance */}
        {guidance.map(g=><StrategyPanel key={g.id} text={g.text} label={g.label}/>)}
      </div>

      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 3 — STRATEGY TABS
// strategy-brain, launch-pad, campaign-clock, audience-profiler, brand-positioner
// ════════════════════════════════════════════════════════════
function StrategyLayout({ copy, guidance, allText, isStreaming, ...ap }: {
  copy:ParsedSection[]; guidance:ParsedSection[]; allText:string; isStreaming?:boolean
} & ActProps) {
  const [active, setActive] = useState(0)
  const tabsRef = useRef<HTMLDivElement>(null)
  const phase   = copy[active]
  if (!phase) return null
  const scrollTab = (i:number) => setTimeout(()=>(tabsRef.current?.children[i] as HTMLElement)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}), 50)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Tab bar */}
      <div ref={tabsRef} style={{ display:'flex', overflowX:'auto', gap:4, padding:'10px 12px 0', borderBottom:`1px solid ${BDR}`, scrollbarWidth:'none' }}>
        {copy.map((p,i)=>(
          <button key={i} onClick={()=>{setActive(i);scrollTab(i)}} style={{
            flexShrink:0, display:'flex', alignItems:'center', gap:5,
            padding:'8px 14px', borderRadius:'8px 8px 0 0',
            background:   active===i ? N2 : 'transparent',
            border:       `1px solid ${active===i ? BDR : 'transparent'}`,
            borderBottom: active===i ? `2px solid ${GL}` : '2px solid transparent',
            color:        active===i ? GL : MUTED,
            fontWeight:   active===i ? 700 : 500, fontSize:12.5,
            cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' as const, transition:'all .18s',
          }}>
            <span style={{fontSize:13}}>{p.icon}</span>{p.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 6px' }}>
        <SectionContent s={phase}/>
        {/* Guidance tabs */}
        {guidance.map(g=><StrategyPanel key={g.id} text={g.text} label={g.label}/>)}
      </div>

      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 4 — SEQUENCE  (numbered steps)
// email-scribe, video-script-forge, sales-script-writer, funnel-builder
// ════════════════════════════════════════════════════════════
function SequenceLayout({ copy, guidance, allText, isStreaming, ...ap }: {
  copy:ParsedSection[]; guidance:ParsedSection[]; allText:string; isStreaming?:boolean
} & ActProps) {
  const [active, setActive] = useState(0)
  const step = copy[active]
  if (!step) return null
  const startX = useRef(0)
  const prev = () => setActive(i=>Math.max(0,i-1))
  const next = () => setActive(i=>Math.min(copy.length-1,i+1))
  const onTouchStart = (e:React.TouchEvent) => { startX.current = e.changedTouches[0].clientX }
  const onTouchEnd   = (e:React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 44) dx < 0 ? next() : prev()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Timeline */}
      <div style={{ overflowX:'auto', scrollbarWidth:'none', padding:'12px 14px', borderBottom:`1px solid ${BDR}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:0, minWidth:'max-content' }}>
          {copy.map((s,i)=>(
            <React.Fragment key={i}>
              <button onClick={()=>setActive(i)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'0 4px', background:'transparent', border:'none', cursor:'pointer' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:active===i?`linear-gradient(135deg,${GOLD},${GL})`:FAINT, border:`2px solid ${active===i?GL:BDR}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:active===i?'#071528':MUTED, transition:'all .2s' }}>{i+1}</div>
                <span style={{ fontSize:9, color:active===i?GL:MUTED, fontWeight:active===i?700:400, maxWidth:54, textAlign:'center', lineHeight:1.2 }}>{s.label.length>10?s.label.slice(0,10)+'…':s.label}</span>
              </button>
              {i<copy.length-1&&<div style={{ width:22, height:1.5, background:i<active?GL+'60':BDR, flexShrink:0, marginBottom:14 }}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ flex:1, overflowY:'auto', padding:'14px 14px 6px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:W, margin:0 }}>{step.label}</h3>
          {step.timing && <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${TEAL}18`, color:TEAL }}>{step.timing}</span>}
        </div>
        <SectionContent s={step}/>
        {guidance.map(g=><StrategyPanel key={g.id} text={g.text} label={g.label}/>)}
      </div>

      {/* Step prev/next */}
      <div style={{ display:'flex', gap:8, padding:'8px 14px 0' }}>
        <button onClick={prev} disabled={active===0} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'10px', borderRadius:10, background:FAINT, border:`1px solid ${BDR}`, color:active===0?'rgba(205,217,236,.15)':MUTED, cursor:active===0?'default':'pointer', fontFamily:'inherit', fontSize:13 }}>
          <ChevronLeft size={13}/>{active>0?copy[active-1].label:'Previous'}
        </button>
        <button onClick={next} disabled={active===copy.length-1} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'10px', borderRadius:10, background:active<copy.length-1?`${GL}18`:FAINT, border:`1px solid ${active<copy.length-1?GL+'35':BDR}`, color:active===copy.length-1?'rgba(205,217,236,.15)':GL, cursor:active===copy.length-1?'default':'pointer', fontFamily:'inherit', fontSize:13, fontWeight:active<copy.length-1?700:400 }}>
          {active<copy.length-1?copy[active+1].label:'Finished'}{active<copy.length-1&&<ChevronRight size={13}/>}
        </button>
      </div>

      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 5 — CALENDAR  (content-calendar)
// ════════════════════════════════════════════════════════════
function CalendarLayout({ copy, guidance, allText, isStreaming, ...ap }: {
  copy:ParsedSection[]; guidance:ParsedSection[]; allText:string; isStreaming?:boolean
} & ActProps) {
  // copy sections = Week 1, Week 2, etc.  Each week's text has Mon/Tue... days embedded
  const [weekIdx, setWeekIdx]   = useState(0)
  const [activeDay, setActiveDay] = useState<{label:string;text:string;platform:string}|null>(null)
  const week = copy[weekIdx]
  if (!week) return null

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const SHORT= ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  // Parse days from the week's text
  const days = useMemo(()=>{
    if (!week) return []
    const result: Array<{label:string;text:string;platform:string;emoji:string}> = []
    DAYS.forEach((day,di)=>{
      const re = new RegExp(`\\*\\*${day}[:\\s]*\\*\\*([\\s\\S]*?)(?=\\*\\*(?:${DAYS.join('|')})|$)`,'i')
      const m  = week.text.match(re)
      if (!m) return
      const raw      = m[1].trim()
      const platMatch= raw.match(/Platform:\s*([^\n]+)/i)
      const platform = platMatch?.[1]?.trim() ?? 'Instagram'
      const pc       = PLAT_COLOR[platform] ?? GOLD
      const cleaned  = raw.replace(/Platform:[^\n]*/gi,'').trim()
      result.push({ label:SHORT[di], text:cleaned, platform, emoji:(Object.entries(PLAT_COLOR).find(([k])=>platform.toLowerCase().includes(k))?.[0]?.[0]??'📅') })
    })
    return result
  }, [week, weekIdx])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Week selector */}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 12px', borderBottom:`1px solid ${BDR}` }}>
        <button onClick={()=>setWeekIdx(i=>Math.max(0,i-1))} disabled={weekIdx===0} style={{ background:FAINT, border:`1px solid ${BDR}`, color:MUTED, width:28, height:28, borderRadius:7, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:weekIdx===0?.4:1 }}><ChevronLeft size={13}/></button>
        <div style={{ flex:1, display:'flex', gap:5, overflowX:'auto', scrollbarWidth:'none' }}>
          {copy.map((w,i)=>(
            <button key={i} onClick={()=>{setWeekIdx(i);setActiveDay(null)}} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, fontFamily:'inherit', background:weekIdx===i?`${GL}20`:FAINT, border:`1px solid ${weekIdx===i?GL+'40':BDR}`, color:weekIdx===i?GL:MUTED, fontWeight:weekIdx===i?700:500, fontSize:12, cursor:'pointer', whiteSpace:'nowrap' as const }}>{w.label}</button>
          ))}
        </div>
        <button onClick={()=>setWeekIdx(i=>Math.min(copy.length-1,i+1))} disabled={weekIdx===copy.length-1} style={{ background:FAINT, border:`1px solid ${BDR}`, color:MUTED, width:28, height:28, borderRadius:7, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:weekIdx===copy.length-1?.4:1 }}><ChevronRight size={13}/></button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 6px' }}>
        {/* Day cells */}
        {days.length > 0 ? (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:12 }}>
              {SHORT.map((d,i)=><div key={i} style={{ textAlign:'center', fontSize:9.5, fontWeight:700, color:MUTED, paddingBottom:4 }}>{d}</div>)}
              {days.map((day,i)=>{
                const pc  = PLAT_COLOR[day.platform] ?? GOLD
                const on  = activeDay?.label === day.label
                return (
                  <button key={i} onClick={()=>setActiveDay(on?null:day)} style={{ padding:'7px 3px', borderRadius:10, fontFamily:'inherit', border:`1.5px solid ${on?pc:BDR}`, background:on?`${pc}22`:FAINT, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all .18s' }}>
                    <span style={{ fontSize:14 }}>📅</span>
                    <span style={{ fontSize:8.5, fontWeight:700, color:on?pc:MUTED, textTransform:'uppercase' as const }}>{day.label}</span>
                    <span style={{ fontSize:7.5, fontWeight:700, padding:'0 3px', borderRadius:3, background:`${pc}22`, color:pc }}>{day.platform.slice(0,2).toUpperCase()}</span>
                  </button>
                )
              })}
            </div>
            {activeDay ? (
              <div style={{ animation:'or-slide-up .2s ease' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>{DAYS[SHORT.indexOf(activeDay.label)]}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:10, background:`${PLAT_COLOR[activeDay.platform]??GOLD}18`, color:PLAT_COLOR[activeDay.platform]??GOLD }}>{activeDay.platform}</span>
                  </div>
                </div>
                <UseCopyBlock text={activeDay.text} badge="POST THIS CAPTION"/>
              </div>
            ) : (
              <p style={{ textAlign:'center', fontSize:13, color:MUTED, padding:'12px 0' }}>Tap any day to see the full caption</p>
            )}
          </>
        ) : (
          // Fallback: show week text as copy block
          <UseCopyBlock text={week.text} badge="WEEK CONTENT"/>
        )}
        {guidance.map(g=><StrategyPanel key={g.id} text={g.text} label={g.label}/>)}
      </div>

      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 6 — DOCUMENT  (accordion sections)
// blog-brain, press-release-ai, proposal-writer, product-describer
// ════════════════════════════════════════════════════════════
function DocumentLayout({ copy, guidance, allText, isStreaming, ...ap }: {
  copy:ParsedSection[]; guidance:ParsedSection[]; allText:string; isStreaming?:boolean
} & ActProps) {
  const [open, setOpen] = useState<Record<number,boolean>>(()=>{
    const init:Record<number,boolean>={}; if(copy[0]) init[copy[0].id]=true; return init
  })
  const toggle = (id:number) => setOpen(p=>({...p,[id]:!p[id]}))

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'12px' }}>
        {copy.map((s,i)=>(
          <div key={s.id} style={{ marginBottom:8, border:`1px solid ${open[s.id]?GOLD+'30':BDR}`, borderRadius:12, overflow:'hidden', transition:'border-color .2s' }}>
            <button onClick={()=>toggle(s.id)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'12px 14px', background:open[s.id]?`${GOLD}07`:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'background .18s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                <span style={{ fontSize:14 }}>{s.icon}</span>
                <span style={{ fontSize:13.5, fontWeight:700, color:open[s.id]?W:DIM, lineHeight:1.3 }}>{s.label}</span>
              </div>
              <ChevronDown size={13} style={{ color:MUTED, transform:open[s.id]?'rotate(180deg)':'none', transition:'transform .25s', flexShrink:0 }}/>
            </button>
            <div style={{ maxHeight:open[s.id]?3000:0, overflow:'hidden', transition:'max-height .35s ease' }}>
              <div style={{ padding:'4px 12px 14px' }}>
                <SectionContent s={s}/>
                {isStreaming && i===copy.length-1 && <span style={{ display:'inline-block', width:2, height:'1em', background:GL, verticalAlign:'middle', animation:'or-blink .7s ease infinite' }}/>}
              </div>
            </div>
          </div>
        ))}
        {guidance.map(g=><StrategyPanel key={g.id} text={g.text} label={g.label}/>)}
        {copy.length > 2 && <div style={{ marginTop:8 }}><BigCopyBtn text={allText} label="Copy full document" secondary/></div>}
      </div>
      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 7 — REPORT  (budget-optimizer, retarget-engine)
// ════════════════════════════════════════════════════════════
function ReportLayout({ copy, guidance, allText, isStreaming, ...ap }: {
  copy:ParsedSection[]; guidance:ParsedSection[]; allText:string; isStreaming?:boolean
} & ActProps) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
        {copy.map(s=>(
          <div key={s.id} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <span style={{ fontSize:14 }}>{s.icon}</span>
              <h3 style={{ fontFamily:"'Georgia',serif", fontSize:15, fontWeight:700, color:W, margin:0 }}>{s.label}</h3>
            </div>
            <SectionContent s={s}/>
          </div>
        ))}
        {guidance.map(g=><StrategyPanel key={g.id} text={g.text} label={g.label}/>)}
      </div>
      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LAYOUT 8 — PLAIN fallback
// ════════════════════════════════════════════════════════════
function PlainLayout({ copy, guidance, allText, isStreaming, ...ap }: {
  copy:ParsedSection[]; guidance:ParsedSection[]; allText:string; isStreaming?:boolean
} & ActProps) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
        {copy.map(s=>(
          <div key={s.id} style={{ marginBottom:12 }}>
            <SectionContent s={s}/>
          </div>
        ))}
        {guidance.map(g=><StrategyPanel key={g.id} text={g.text} label={g.label}/>)}
      </div>
      <OutputFooter allText={allText} isStreaming={isStreaming} {...ap}/>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════
export interface OutputRendererProps {
  content?:       string
  text?:          string
  isStreaming?:   boolean
  toolId?:        string
  toolName?:      string
  outputSections?: string[]   // ← pass from tool definition (tool.outputSections)
  toolCategory?:  'text' | 'design' | 'whatsapp' | 'strategy' | 'calendar' | 'sequence'
  generationId?:  string
  coinsSpent?:    number
  isSaved?:       boolean
  onSave?:        () => void
  onRegenerate?:  () => void
  whatsappEnabled?: boolean
}

export function OutputRenderer({
  content, text, isStreaming, toolId, toolName,
  outputSections = [], toolCategory = 'text', coinsSpent, generationId,
  isSaved, onSave, onRegenerate,
}: OutputRendererProps) {
  const raw = content ?? text ?? ''

  const parsed = useMemo(()=>{
    if (!raw.trim()) return null
    return parseToolOutput(toolId ?? '', outputSections, raw)
  }, [raw, toolId, outputSections])

  const copy     = parsed?.sections.filter(s => s.kind !== 'guidance') ?? []
  const guidance = parsed?.sections.filter(s => s.kind === 'guidance' ) ?? []
  const allText  = parsed?.allCopyText ?? raw
  const layout   = parsed?.layout ?? 'plain'

  const ap: ActProps = {
    onRegenerate, isSaved, onSave, isStreaming,
    toolId, toolCategory, coinsSpent, generationId,
  }
  const lp = { copy, guidance, allText, isStreaming, toolName }

  return (
    <>
      <style>{`
        @keyframes or-blink{0%,100%{opacity:1}50%{opacity:.1}}
        @keyframes or-spin{to{transform:rotate(360deg)}}
        @keyframes or-pulse{0%,100%{opacity:.35}50%{opacity:.68}}
        @keyframes or-slide-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:N1 }}>
        {/* Streaming */}
        {isStreaming && <StreamSkeleton toolName={toolName} partial={raw||undefined}/>}

        {/* Rendered output */}
        {!isStreaming && raw && (() => {
          if (!parsed || copy.length === 0) {
            // No sections parsed — show whole text as single copy block
            return (
              <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
                <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
                  <UseCopyBlock text={clean(raw)} badge="YOUR OUTPUT"/>
                </div>
                <OutputFooter allText={raw} {...ap}/>
              </div>
            )
          }
          switch (layout) {
            case 'carousel':  return <CarouselLayout  {...lp} {...ap}/>
            case 'whatsapp':  return <WhatsAppLayout  {...lp} {...ap}/>
            case 'strategy':  return <StrategyLayout  {...lp} {...ap}/>
            case 'sequence':  return <SequenceLayout  {...lp} {...ap}/>
            case 'calendar':  return <CalendarLayout  {...lp} {...ap}/>
            case 'document':  return <DocumentLayout  {...lp} {...ap}/>
            case 'report':    return <ReportLayout    {...lp} {...ap}/>
            default:          return <PlainLayout     {...lp} {...ap}/>
          }
        })()}
      </div>
    </>
  )
}

export default OutputRenderer
