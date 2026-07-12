'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/CalendarGroupOutput.tsx
//
// Group 8 — Content Calendar
// Tools: content-calendar (visual-content-calendar shares this)
//
// Layer 2: This Week strip — 7 day cards, today highlighted,
//           tap to expand day detail + caption hint.
// Layer 3: Full month grid in Deep Dive drawer (4 weeks × 7 days)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Check, RefreshCw, Bookmark, BookmarkCheck } from 'lucide-react'
import type { CalendarOutput, CalendarPost } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:'#060C1A', navy:'#0B1F3A', card:'#0D2040',
  gold:'#E09818', gl:'#F5B830',   teal:'#12D4B4',
  green:'#22C55E', red:'#E55252', purple:'#8B7FFF', amber:'#F97316',
  w:'#EBF2FC', dim:'rgba(205,217,236,.72)',
  muted:'rgba(205,217,236,.38)', faint:'rgba(255,255,255,.04)', bdr:'rgba(255,255,255,.08)',
}

const PLATFORM_DOT: Record<string, string> = {
  Instagram:'#E1306C', Facebook:'#1877F2', LinkedIn:'#0A66C2',
  TikTok:'#69C9D0', Twitter:'#1DA1F2', WhatsApp:'#25D366', YouTube:'#FF0000',
}

const POST_TYPE_COLOR: Record<string, string> = {
  Reel:'#E1306C', Carousel:'#8B7FFF', Story:'#F97316',
  Static:'#3B82F6', WhatsApp:'#25D366',
}

const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Platform dot badge ─────────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
  const color = PLATFORM_DOT[platform] ?? D.muted
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:20, background:`${color}18`, border:`1px solid ${color}35`, color, whiteSpace:'nowrap' }}>
      {platform}
    </span>
  )
}

// ── Post type chip ─────────────────────────────────────────────
function PostTypeChip({ type }: { type: string }) {
  const color = POST_TYPE_COLOR[type] ?? D.muted
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:4, background:`${color}14`, color }}>
      {type}
    </span>
  )
}

// ── Single day card (compact) ──────────────────────────────────
function DayCard({ post, isToday, isSelected, onClick }: {
  post: CalendarPost; isToday: boolean; isSelected: boolean; onClick: () => void
}) {
  const platColor = PLATFORM_DOT[post.platform] ?? D.teal
  return (
    <button onClick={onClick} style={{
      flex:'1 1 0', minWidth:0, padding:'8px 6px', borderRadius:10,
      border:`1.5px solid ${isSelected ? D.teal + '55' : isToday ? D.gl + '40' : D.bdr}`,
      background: isSelected ? 'rgba(18,212,180,.08)' : isToday ? 'rgba(245,184,48,.06)' : D.faint,
      cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
      transition:'all .15s', fontFamily:'inherit',
    }}>
      {/* Day abbr */}
      <span style={{ fontSize:10, fontWeight:700, color: isToday ? D.gl : D.muted, letterSpacing:'.5px', textTransform:'uppercase' }}>
        {post.day ? post.day.split(' ')[0]?.slice(0,3) ?? '' : ''}
      </span>
      {/* Date number */}
      <span style={{ fontSize:16, fontWeight:800, color: isToday ? D.gl : isSelected ? D.teal : D.w, lineHeight:1 }}>
        {post.date}
      </span>
      {/* Platform dot */}
      <div style={{ width:6, height:6, borderRadius:'50%', background: platColor }}/>
      {/* Post type micro */}
      <span style={{ fontSize:9, fontWeight:700, color: platColor, letterSpacing:'.3px' }}>
        {post.post_type?.slice(0,4)}
      </span>
    </button>
  )
}

// ── Expanded day detail panel ──────────────────────────────────
function DayDetail({ post }: { post: CalendarPost }) {
  const platColor = PLATFORM_DOT[post.platform] ?? D.teal
  const copyText  = `${post.day}\n${post.theme}\n\n${post.caption_hint}`
  const { done, copy } = useCopy(copyText)

  return (
    <div style={{ borderRadius:12, border:`1px solid ${platColor}30`, background:`${platColor}06`, padding:'14px', marginTop:10 }}>
      {/* Day header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, fontWeight:700, color:D.w }}>{post.day}</span>
        <PlatformBadge platform={post.platform}/>
        <PostTypeChip type={post.post_type}/>
      </div>
      {/* Theme */}
      <div style={{ marginBottom:10 }}>
        <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>Content theme</p>
        <p style={{ fontSize:14, fontWeight:700, color:D.w, margin:0, lineHeight:1.5 }}>{post.theme}</p>
      </div>
      {/* Caption hint */}
      {post.caption_hint && (
        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 4px' }}>Caption hook</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.7, margin:0, fontStyle:'italic' }}>"{post.caption_hint}"</p>
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted, minHeight:32 }}>
          {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy brief</>}
        </button>
      </div>
    </div>
  )
}

// ── Month grid (Deep Dive content) ────────────────────────────
function MonthGrid({ data }: { data: Record<string, unknown> }) {
  const deepDive = data.deep_dive as any
  const weeks    = deepDive?.full_month as Array<{ week: number; posts: CalendarPost[] }> | undefined
  const strategy = deepDive?.content_strategy as string | undefined
  const rhythm   = deepDive?.posting_rhythm   as string | undefined

  if (!weeks?.length) {
    return (
      <div style={{ padding:'20px', textAlign:'center', color:D.muted, fontSize:13 }}>
        Full month content will appear here after Deep Dive is generated.
      </div>
    )
  }

  return (
    <div>
      {strategy && (
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:8 }}>Content strategy</p>
          <p style={{ fontSize:13.5, color:D.dim, lineHeight:1.75, margin:0 }}>{strategy}</p>
        </div>
      )}
      {weeks.map(week => (
        <div key={week.week} style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Week {week.week}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {(week.posts ?? []).map((post, pi) => (
              <div key={pi} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, background:D.faint, border:`1px solid ${D.bdr}` }}>
                <span style={{ fontSize:11, fontWeight:700, color:D.muted, minWidth:90, flexShrink:0 }}>{post.day}</span>
                <PlatformBadge platform={post.platform}/>
                <PostTypeChip type={post.post_type}/>
                <p style={{ fontSize:12.5, color:D.dim, margin:0, flex:1, lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{post.theme}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      {rhythm && (
        <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(18,212,180,.06)', border:'1px solid rgba(18,212,180,.2)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:D.teal, letterSpacing:'1px', textTransform:'uppercase', marginBottom:6 }}>Posting rhythm</p>
          <p style={{ fontSize:13, color:D.dim, lineHeight:1.7, margin:0 }}>{rhythm}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface CalendarGroupOutputProps {
  outputJson:    CalendarOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
}

export function CalendarGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave,
}: CalendarGroupOutputProps) {
  const thisWeek   = outputJson.essentials?.this_week ?? []
  const topTheme   = outputJson.essentials?.top_theme ?? ''
  const month      = outputJson.month ?? ''
  const totalPosts = outputJson.total_posts ?? 0
  const headline   = outputJson.headline ?? 'Content calendar generated'

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const allText = useMemo(() =>
    thisWeek.map(p => `${p.day} · ${p.platform} ${p.post_type}\nTheme: ${p.theme}\nHook: ${p.caption_hint}`).join('\n\n'),
  [thisWeek])
  const { done: allDone, copy: copyAll } = useCopy(allText)

  // Determine today's date to highlight it
  const today = new Date().getDate()

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`
        @media(max-width:600px){
          .cal-actions{flex-direction:column!important}
          .cal-actions>button{width:100%!important}
          .cal-week-strip{gap:4px!important}
        }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:`1px solid ${D.bdr}`, flexWrap:'wrap', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(18,212,180,.1)', border:'1px solid rgba(18,212,180,.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>📅</div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:D.w, margin:0 }}>{headline}</p>
              <p style={{ fontSize:11, color:D.muted, margin:0 }}>{month} · {totalPosts} posts · {coinsSpent}⊙</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {onSave && (
              <button onClick={onSave} style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isSaved?'rgba(224,152,24,.4)':D.bdr}`, background:isSaved?'rgba(224,152,24,.1)':D.faint, color:isSaved?D.gl:D.muted, cursor:'pointer' }}>
                {isSaved ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
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

          {/* Month theme banner */}
          {topTheme && (
            <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(18,212,180,.06)', border:'1px solid rgba(18,212,180,.2)', marginBottom:14, display:'flex', alignItems:'flex-start', gap:8 }}>
              <span style={{ fontSize:15, flexShrink:0 }}>🎯</span>
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 3px' }}>Month anchor theme</p>
                <p style={{ fontSize:13.5, fontWeight:600, color:D.w, margin:0, lineHeight:1.5 }}>{topTheme}</p>
              </div>
            </div>
          )}

          {/* This week label */}
          <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>
            This week — {thisWeek.length} posts scheduled
          </p>

          {/* 7-day horizontal strip */}
          {thisWeek.length > 0 && (
            <div className="cal-week-strip" style={{ display:'flex', gap:6, marginBottom:14 }}>
              {thisWeek.map((post, i) => (
                <DayCard
                  key={i} post={post}
                  isToday={post.date === today}
                  isSelected={selectedDay === i}
                  onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                />
              ))}
            </div>
          )}

          {/* Expanded day detail */}
          {selectedDay !== null && thisWeek[selectedDay] && (
            <DayDetail post={thisWeek[selectedDay]}/>
          )}

          {/* Post list below the strip (full this-week schedule) */}
          <div style={{ marginTop:16 }}>
            <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Full week schedule</p>
            {thisWeek.map((post, i) => {
              const platColor = PLATFORM_DOT[post.platform] ?? D.teal
              const { done, copy } = useCopyStatic(`${post.day}\n${post.theme}\n\n${post.caption_hint}`)
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px',
                  borderRadius:10, background: selectedDay === i ? `${platColor}08` : D.faint,
                  border:`1px solid ${selectedDay === i ? platColor + '30' : D.bdr}`,
                  marginBottom:7, cursor:'pointer', transition:'all .15s',
                }} onClick={() => setSelectedDay(selectedDay === i ? null : i)}>
                  <div style={{ width:3, height:'auto', alignSelf:'stretch', borderRadius:2, background:platColor, flexShrink:0, minHeight:40 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, fontWeight:700, color:D.w }}>{post.day}</span>
                      <PlatformBadge platform={post.platform}/>
                      <PostTypeChip type={post.post_type}/>
                    </div>
                    <p style={{ fontSize:12.5, color:D.dim, margin:0, lineHeight:1.55 }}>{post.theme}</p>
                    {post.caption_hint && (
                      <p style={{ fontSize:11.5, color:D.muted, margin:'3px 0 0', lineHeight:1.5, fontStyle:'italic' }}>"{post.caption_hint}"</p>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); copy() }} style={{ padding:'4px 9px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted, flexShrink:0, display:'flex', alignItems:'center', gap:3, minHeight:28 }}>
                    {done?<Check size={10}/>:<Copy size={10}/>}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop:18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="cal-actions" style={{ padding:'10px 14px', borderTop:`1px solid ${D.bdr}`, display:'flex', gap:8, flexShrink:0, background:'rgba(6,12,26,.97)', backdropFilter:'blur(14px)' }}>
          <button onClick={copyAll} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13.5, fontWeight:800, border:`1px solid ${allDone?'rgba(18,212,180,.4)':'rgba(18,212,180,.3)'}`, background:allDone?'rgba(18,212,180,.14)':'rgba(18,212,180,.08)', color:D.teal, transition:'all .18s', minHeight:46 }}>
            {allDone ? <><Check size={14}/> Copied!</> : <><Copy size={14}/> Copy this week's briefs</>}
          </button>
        </div>

        <DeepDiveDrawer headline={headline} renderContent={data => <MonthGrid data={data}/>}/>
      </div>
    </DeepDiveProvider>
  )
}

// Stable copy hook for mapped components
function useCopyStatic(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}
