'use client'
/**
 * CopywritingOutput.tsx
 * Handles: carousel + sequence layouts
 * Tools: CaptionCraft, CopyBrain AI, AdScribe, PromoBlast, BioBuilder,
 *        VideoScriptForge, EmailScribe, BlogBrain, PressRelease AI, etc.
 *
 * UX: Platform tabs → variant cards with inline copy → hashtag pills → posting time
 */

import React, { useState, useCallback } from 'react'
import { Copy, Check, RefreshCw, Clock, Hash, Bookmark, BookmarkCheck, Share2 } from 'lucide-react'
import type { ParsedSection } from '@/lib/tools/output-parsers'
import type { ActProps }       from '@/components/tools/OutputRenderer'

// ── Tokens ─────────────────────────────────────────────────────
const GOLD  = '#E09818', GL = '#F5B830', TEAL = '#12D4B4'
const WA_G  = '#25D366', W  = '#EBF2FC'
const DIM   = 'rgba(205,217,236,.72)', MUTED = 'rgba(205,217,236,.38)'
const FAINT = 'rgba(255,255,255,.05)', BDR = 'rgba(255,255,255,.09)'
const N2    = '#0D2040'

const PLAT: Record<string, string> = {
  Instagram:'#E1306C', Facebook:'#1877F2', LinkedIn:'#0A66C2',
  TikTok:'#69C9D0', Twitter:'#1DA1F2', WhatsApp:WA_G, YouTube:'#FF0000',
}

// ── Hook ───────────────────────────────────────────────────────
function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const run = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, run }
}

// ── Inline CopyButton ──────────────────────────────────────────
function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const { done, run } = useCopy(text)
  return (
    <button onClick={run} style={{
      display:'flex', alignItems:'center', gap:5,
      padding:'6px 13px', borderRadius:7, cursor:'pointer',
      fontFamily:'inherit', fontSize:12.5, fontWeight:700,
      border:`1px solid ${done ? 'rgba(18,212,180,.45)' : BDR}`,
      background: done ? 'rgba(18,212,180,.12)' : FAINT,
      color: done ? TEAL : MUTED, transition:'all .18s',
    }}>
      {done ? <Check size={12}/> : <Copy size={12}/>}
      {done ? 'Copied!' : label}
    </button>
  )
}

// ── Hashtag pill ───────────────────────────────────────────────
function HashPill({ tag }: { tag: string }) {
  const { done, run } = useCopy(tag)
  return (
    <button onClick={run} style={{
      padding:'4px 11px', borderRadius:20, cursor:'pointer', fontFamily:'inherit',
      fontSize:12, fontWeight:600, border:`1px solid ${done ? 'rgba(18,212,180,.4)' : 'rgba(18,212,180,.22)'}`,
      background: done ? 'rgba(18,212,180,.14)' : 'rgba(18,212,180,.07)',
      color: done ? TEAL : 'rgba(18,212,180,.85)', transition:'all .18s',
    }}>
      {done ? '✓' : '#'}{tag.replace(/^#/, '')}
    </button>
  )
}

// ── Variant card ───────────────────────────────────────────────
function VariantCard({ section, index, isActive, onClick }: {
  section: ParsedSection; index: number; isActive: boolean; onClick: () => void
}) {
  const [expanded, setExpanded] = useState(isActive)
  const platformColor = section.platform ? (PLAT[section.platform] ?? GOLD) : GOLD

  // Clean text — strip markdown
  const text = section.text
    .replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '').trim()

  const charCount = text.length

  return (
    <div style={{
      background: isActive ? 'rgba(224,152,24,.07)' : FAINT,
      border: `1px solid ${isActive ? 'rgba(224,152,24,.35)' : BDR}`,
      borderRadius:12, marginBottom:10, overflow:'hidden',
      transition:'all .2s',
    }}>
      {/* Card header */}
      <div
        onClick={() => { onClick(); setExpanded(true) }}
        style={{ padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{
            fontSize:10.5, fontWeight:700, padding:'2px 9px', borderRadius:20,
            background: isActive ? `${platformColor}20` : FAINT,
            border:`1px solid ${isActive ? platformColor + '40' : BDR}`,
            color: isActive ? platformColor : MUTED, letterSpacing:'.3px',
          }}>
            Variant {index + 1}{section.label ? ` · ${section.label}` : ''}
          </span>
        </div>
        <CopyBtn text={text}/>
      </div>

      {/* Expanded content */}
      {(isActive || expanded) && (
        <div style={{ padding:'0 14px 14px' }}>
          <p style={{ fontSize:14, color: isActive ? W : DIM, lineHeight:1.75, margin:'0 0 10px', whiteSpace:'pre-wrap' }}>
            {text}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <span style={{ fontSize:11, color:MUTED, display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:charCount < 150 ? TEAL : charCount < 220 ? GL : MUTED, display:'inline-block' }}/>
              {charCount} chars · {charCount < 150 ? 'Short — ideal' : charCount < 280 ? 'Good length' : 'Consider trimming'}
            </span>
            <CopyBtn text={text} label="Copy caption"/>
          </div>
        </div>
      )}

      {/* Collapsed preview */}
      {!isActive && !expanded && (
        <div style={{ padding:'0 14px 12px' }}>
          <p style={{ fontSize:12.5, color:MUTED, margin:0, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {text}
          </p>
          <button onClick={() => setExpanded(!expanded)} style={{ fontSize:11.5, color:TEAL, background:'none', border:'none', cursor:'pointer', padding:'4px 0 0', fontFamily:'inherit' }}>
            {expanded ? 'Collapse' : 'Tap to expand'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Platform tab ───────────────────────────────────────────────
function PlatformTab({ platform, active, onClick }: { platform: string; active: boolean; onClick: () => void }) {
  const color = PLAT[platform] ?? GOLD
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:6,
      padding:'9px 14px', cursor:'pointer', fontFamily:'inherit',
      fontSize:13, fontWeight: active ? 700 : 500,
      color: active ? color : MUTED,
      background:'none', border:'none',
      borderBottom: `2px solid ${active ? color : 'transparent'}`,
      transition:'all .15s', whiteSpace:'nowrap', flexShrink:0,
    }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background: active ? color : MUTED }}/>
      {platform}
    </button>
  )
}

// ── Main ───────────────────────────────────────────────────────
interface Props {
  copy:        ParsedSection[]
  guidance:    ParsedSection[]
  allText:     string
  isStreaming?: boolean
  toolName?:   string
  coinsSpent?: number
  onRegenerate?: () => void
  isSaved?:    boolean
  onSave?:     () => void
  toolId?:     string
  toolCategory?: ActProps['toolCategory']
  generationId?: string
}

export function CopywritingOutput({
  copy, guidance, allText, isStreaming, toolName, coinsSpent,
  onRegenerate, isSaved, onSave,
}: Props) {
  const { done: allCopied, run: copyAll } = useCopy(allText)

  // Detect platforms from sections
  const platforms = [...new Set(copy.map(s => s.platform).filter(Boolean))] as string[]
  const hasMultiplePlatforms = platforms.length > 1
  const [activePlatform, setActivePlatform] = useState(platforms[0] ?? '')

  // Filter copy sections by active platform (or show all if single platform)
  const visibleSections = hasMultiplePlatforms && activePlatform
    ? copy.filter(s => s.platform === activePlatform || !s.platform)
    : copy

  // Active variant index
  const [activeVariant, setActiveVariant] = useState(0)

  // Aggregate hashtags from all copy sections
  const allHashtags = [...new Set(copy.flatMap(s => s.hashtags ?? []))]

  // Find timing hints from guidance or section timing fields
  const timingHint = copy.find(s => s.timing)?.timing
    ?? guidance.find(s => s.text.toLowerCase().includes('time') || s.text.toLowerCase().includes('when'))?.text.split('\n')[0]

  // Copy all copy text
  const { done: copiedAll, run: runCopyAll } = useCopy(copy.map(s => s.text.replace(/\*\*(.+?)\*\*/g,'$1')).join('\n\n---\n\n'))

  return (
    <>
      <style>{`
        @keyframes co-spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){
          .co-platform-tabs{flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}
          .co-actions{flex-direction:column!important}
          .co-actions button{width:100%!important}
        }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>
        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:`1px solid ${BDR}`, flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:W }}>{toolName || 'Output'}</span>
            {coinsSpent && (
              <span style={{ fontSize:11, color:MUTED, background:FAINT, border:`1px solid ${BDR}`, borderRadius:20, padding:'2px 9px' }}>
                {coinsSpent} coins used
              </span>
            )}
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {onSave && (
              <button onClick={onSave} style={{ padding:'6px 10px', borderRadius:7, border:`1px solid ${isSaved ? 'rgba(224,152,24,.4)' : BDR}`, background:isSaved ? 'rgba(224,152,24,.12)' : FAINT, color:isSaved ? GL : MUTED, cursor:'pointer', lineHeight:0 }}>
                {isSaved ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} disabled={isStreaming} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, border:`1px solid ${BDR}`, background:FAINT, color:MUTED, cursor:isStreaming ? 'not-allowed' : 'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600 }}>
                <RefreshCw size={12} style={{ animation: isStreaming ? 'co-spin 1s linear infinite' : 'none' }}/>
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Platform tabs (if multiple platforms) */}
        {hasMultiplePlatforms && (
          <div className="co-platform-tabs" style={{ display:'flex', borderBottom:`1px solid ${BDR}`, overflowX:'auto', scrollbarWidth:'none' }}>
            {platforms.map(p => (
              <PlatformTab key={p} platform={p} active={activePlatform === p} onClick={() => setActivePlatform(p)}/>
            ))}
          </div>
        )}

        {/* Scrollable content area */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>

          {/* Streaming skeleton */}
          {isStreaming && copy.length === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[90, 75, 85].map((w, i) => (
                <div key={i} style={{ height:80, borderRadius:12, background:FAINT, animation:`or-pulse 1.4s ${i*.15}s ease infinite` }}/>
              ))}
            </div>
          )}

          {/* Variant count label */}
          {visibleSections.length > 1 && !isStreaming && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>
                {visibleSections.length} variants
              </span>
              <div style={{ display:'flex', gap:5 }}>
                {visibleSections.map((_, i) => (
                  <button key={i} onClick={() => setActiveVariant(i)} style={{
                    width:8, height:8, borderRadius:'50%', border:'none', cursor:'pointer', padding:0,
                    background: activeVariant === i ? GL : BDR, transition:'background .15s',
                  }}/>
                ))}
              </div>
            </div>
          )}

          {/* Variant cards */}
          {visibleSections.map((section, i) => (
            <VariantCard
              key={section.id}
              section={section}
              index={i}
              isActive={i === activeVariant}
              onClick={() => setActiveVariant(i)}
            />
          ))}

          {/* Hashtags */}
          {allHashtags.length > 0 && (
            <div style={{ marginTop:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:9 }}>
                <Hash size={13} style={{ color:TEAL }}/>
                <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>Hashtags</span>
                <CopyBtn text={allHashtags.join(' ')} label="Copy all"/>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {allHashtags.map(tag => <HashPill key={tag} tag={tag}/>)}
              </div>
            </div>
          )}

          {/* Posting time */}
          {timingHint && (
            <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(224,152,24,.07)', border:'1px solid rgba(224,152,24,.22)', display:'flex', alignItems:'flex-start', gap:10 }}>
              <Clock size={14} style={{ color:GL, marginTop:2, flexShrink:0 }}/>
              <div>
                <p style={{ fontSize:12.5, fontWeight:700, color:GL, margin:'0 0 2px' }}>Best posting time</p>
                <p style={{ fontSize:12.5, color:DIM, margin:0, lineHeight:1.55 }}>{timingHint}</p>
              </div>
            </div>
          )}

          {/* Guidance sections (collapsed) */}
          {guidance.map(g => (
            <GuidanceBlock key={g.id} section={g}/>
          ))}
        </div>

        {/* Sticky action bar */}
        <div className="co-actions" style={{ padding:'10px 14px', borderTop:`1px solid ${BDR}`, display:'flex', gap:8, background:'rgba(9,12,22,.96)', backdropFilter:'blur(14px)' }}>
          <button onClick={runCopyAll} style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            padding:'11px', borderRadius:9, cursor:'pointer', fontFamily:'inherit',
            fontSize:13.5, fontWeight:800,
            background: copiedAll ? 'rgba(18,212,180,.18)' : 'rgba(224,152,24,.18)',
            border:`1px solid ${copiedAll ? 'rgba(18,212,180,.4)' : 'rgba(224,152,24,.35)'}`,
            color: copiedAll ? TEAL : GL, transition:'all .18s',
          }}>
            {copiedAll ? <Check size={14}/> : <Copy size={14}/>}
            {copiedAll ? 'All copied!' : `Copy all ${copy.length} variants`}
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(copy[activeVariant]?.text || allText)}`, '_blank')} style={{ display:'flex', alignItems:'center', gap:5, padding:'11px 14px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', background:'rgba(37,211,102,.12)', border:'1px solid rgba(37,211,102,.3)', color:WA_G, fontSize:13.5, fontWeight:700 }}>
            <Share2 size={14}/> Share
          </button>
        </div>
      </div>
    </>
  )
}

// ── Guidance block (collapsed strategy notes) ──────────────────
function GuidanceBlock({ section }: { section: ParsedSection }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop:12, border:`1px solid rgba(18,212,180,.18)`, borderRadius:10, overflow:'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'rgba(18,212,180,.05)', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
        <span style={{ fontSize:12, fontWeight:700, color:TEAL, letterSpacing:'1px', textTransform:'uppercase' }}>
          {section.label || 'Strategy Notes'}
        </span>
        <span style={{ fontSize:14, color:TEAL, transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:'10px 14px', borderTop:`1px solid rgba(18,212,180,.14)` }}>
          <p style={{ fontSize:13, color:DIM, lineHeight:1.75, margin:0, whiteSpace:'pre-wrap' }}>
            {section.text.replace(/\*\*(.+?)\*\*/g,'$1')}
          </p>
        </div>
      )}
    </div>
  )
}
