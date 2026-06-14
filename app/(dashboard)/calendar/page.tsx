'use client'
// /app/(dashboard)/calendar/page.tsx
// Visual Content Calendar Grid — monthly view with event cards per day.

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, Copy, Check, X, Clock, Edit3, Trash2, RefreshCw, Calendar } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const N='#0B1F3A',N2='#0D2040',GOLD='#E09818',GL='#F5B830'
const TEAL='#12D4B4',W='#EBF2FC',DIM='rgba(205,217,236,0.65)'
const MUTED='rgba(205,217,236,0.35)',B='rgba(255,255,255,0.08)',FAINT='rgba(255,255,255,0.05)'

// ── Platform config ───────────────────────────────────────────
const PLATFORM_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  instagram: { label:'Instagram', color:'#E1306C', emoji:'📷' },
  facebook:  { label:'Facebook',  color:'#1877F2', emoji:'📘' },
  whatsapp:  { label:'WhatsApp',  color:'#25D366', emoji:'💬' },
  tiktok:    { label:'TikTok',    color:'#FF0050', emoji:'🎵' },
  linkedin:  { label:'LinkedIn',  color:'#0A66C2', emoji:'💼' },
  youtube:   { label:'YouTube',   color:'#FF0000', emoji:'▶️' },
  twitter:   { label:'X/Twitter', color:'#1DA1F2', emoji:'🐦' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label:'Draft',     color:'#8FA5BE', bg:'rgba(143,165,190,0.12)' },
  scheduled: { label:'Scheduled', color:'#F5B830', bg:'rgba(245,184,48,0.12)' },
  published: { label:'Published', color:'#22C55E', bg:'rgba(34,197,94,0.12)'  },
  skipped:   { label:'Skipped',   color:'#EF4444', bg:'rgba(239,68,68,0.12)'  },
}

const CONTENT_TYPE_ICONS: Record<string, string> = {
  image:'🖼', video:'🎬', carousel:'🎠', reel:'📸', story:'✨', text:'✍', broadcast:'📢',
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

type CalEvent = {
  id: string
  scheduled_date: string
  platform: string
  content_type: string
  caption: string
  hashtags: string
  visual_note: string
  best_time: string
  status: string
  sort_order: number
}

// ─────────────────────────────────────────────────────────────
// EVENT CHIP — small pill shown inside a day cell
// ─────────────────────────────────────────────────────────────
function EventChip({ event, onClick }: { event: CalEvent; onClick: () => void }) {
  const p = PLATFORM_CONFIG[event.platform] || { color: MUTED, emoji: '📌', label: event.platform }
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:5, padding:'3px 7px',
      background:`${p.color}18`, border:`1px solid ${p.color}35`,
      borderRadius:6, cursor:'pointer', marginBottom:3, transition:'all .15s',
    }}>
      <span style={{ fontSize:10 }}>{CONTENT_TYPE_ICONS[event.content_type] || '📌'}</span>
      <span style={{ fontSize:10, fontWeight:600, color:p.color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
        {event.platform.charAt(0).toUpperCase() + event.platform.slice(1)}
      </span>
      <div style={{ width:5, height:5, borderRadius:'50%', background:STATUS_CONFIG[event.status]?.color || MUTED, flexShrink:0 }}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DAY CELL — one cell in the calendar grid
// ─────────────────────────────────────────────────────────────
function DayCell({ day, date, events, isToday, isCurrentMonth, onEventClick, onAddClick }: {
  day:            number | null
  date:           string | null
  events:         CalEvent[]
  isToday:        boolean
  isCurrentMonth: boolean
  onEventClick:   (e: CalEvent) => void
  onAddClick:     (date: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  if (!day || !date) {
    return <div style={{ background:FAINT, borderRadius:10, minHeight:100, border:`1px solid ${B}`, opacity:0.4 }}/>
  }

  const MAX_SHOWN = 3
  const shown  = events.slice(0, MAX_SHOWN)
  const extras = events.length - MAX_SHOWN

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isToday ? `${GOLD}10` : N2,
        border:`1px solid ${isToday ? GOLD+'40' : hovered ? B : 'rgba(255,255,255,0.04)'}`,
        borderRadius:10, minHeight:100, padding:'8px 8px 6px',
        transition:'border-color .15s', cursor:'default',
        opacity: isCurrentMonth ? 1 : 0.45,
      }}
    >
      {/* Day number */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{
          fontSize:12.5, fontWeight: isToday ? 900 : 600,
          color: isToday ? GOLD : events.length > 0 ? DIM : MUTED,
          minWidth:22, height:22, borderRadius:'50%',
          background: isToday ? `${GOLD}20` : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>{day}</span>
        {(hovered || events.length > 0) && (
          <button onClick={() => onAddClick(date)} style={{
            width:18, height:18, border:`1px solid ${B}`, borderRadius:5,
            background:'rgba(255,255,255,0.06)', cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center', opacity: hovered ? 1 : 0, transition:'opacity .15s',
          }}>
            <Plus size={10} style={{ color:MUTED }}/>
          </button>
        )}
      </div>

      {/* Events */}
      {shown.map(ev => <EventChip key={ev.id} event={ev} onClick={() => onEventClick(ev)}/>)}
      {extras > 0 && (
        <div style={{ fontSize:10, color:MUTED, paddingLeft:2 }}>+{extras} more</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EVENT DETAIL PANEL (slide-out)
// ─────────────────────────────────────────────────────────────
function EventPanel({ event, onClose, onStatusChange, onDelete }: {
  event:          CalEvent
  onClose:        () => void
  onStatusChange: (id: string, status: string) => void
  onDelete:       (id: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const p   = PLATFORM_CONFIG[event.platform] || { color:MUTED, emoji:'📌', label:event.platform }
  const st  = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft

  const copy = () => {
    const text = [event.caption, event.hashtags].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false), 2000) })
  }

  return (
    <div style={{
      position:'fixed', right:0, top:0, bottom:0, width:400, maxWidth:'100vw',
      background:'#0A1628', borderLeft:`1px solid ${B}`, zIndex:200,
      display:'flex', flexDirection:'column', overflowY:'auto',
    }}>
      {/* Header */}
      <div style={{ padding:'16px 18px', borderBottom:`1px solid ${B}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>{p.emoji}</span>
          <span style={{ fontSize:14, fontWeight:700, color:p.color }}>{p.label}</span>
          <span style={{ fontSize:11, color:MUTED }}>{CONTENT_TYPE_ICONS[event.content_type]} {event.content_type}</span>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED }}>
          <X size={16}/>
        </button>
      </div>

      <div style={{ padding:'18px', flex:1, display:'flex', flexDirection:'column', gap:16 }}>
        {/* Date + time */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ padding:'6px 12px', background:FAINT, borderRadius:8, fontSize:12, color:DIM, fontWeight:600 }}>
            📅 {new Date(event.scheduled_date + 'T12:00:00').toLocaleDateString('en-NG', { weekday:'short', day:'numeric', month:'long' })}
          </div>
          {event.best_time && (
            <div style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:FAINT, borderRadius:8, fontSize:12, color:DIM }}>
              <Clock size={11}/>{event.best_time}
            </div>
          )}
        </div>

        {/* Status selector */}
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Status</p>
          <div style={{ display:'flex', gap:6 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => onStatusChange(event.id, key)} style={{
                padding:'5px 12px', borderRadius:20, fontFamily:'inherit', fontSize:11.5, fontWeight:700, cursor:'pointer',
                background: event.status===key ? cfg.bg : FAINT,
                border:`1px solid ${event.status===key ? cfg.color+'50' : B}`,
                color: event.status===key ? cfg.color : MUTED, transition:'all .15s',
              }}>{cfg.label}</button>
            ))}
          </div>
        </div>

        {/* Caption */}
        {event.caption && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', margin:0 }}>Caption</p>
              <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:5, background:FAINT, border:`1px solid ${B}`, borderRadius:7, padding:'4px 10px', cursor:'pointer', fontSize:11, color:copied?TEAL:MUTED, fontFamily:'inherit', fontWeight:600 }}>
                {copied ? <Check size={11}/> : <Copy size={11}/>}{copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ background:FAINT, border:`1px solid ${B}`, borderRadius:10, padding:'12px 14px', fontSize:13, color:DIM, lineHeight:1.7, whiteSpace:'pre-wrap' }}>
              {event.caption}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {event.hashtags && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Hashtags</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {event.hashtags.split(/\s+/).filter(t=>t.startsWith('#')).map((tag, i) => (
                <span key={i} style={{ fontSize:11, padding:'3px 9px', borderRadius:12, background:`${p.color}15`, color:p.color, fontWeight:600 }}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Visual note */}
        {event.visual_note && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Visual Direction</p>
            <div style={{ background:`${TEAL}08`, border:`1px solid ${TEAL}20`, borderRadius:10, padding:'12px 14px', fontSize:13, color:TEAL, lineHeight:1.6 }}>
              🎨 {event.visual_note}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ padding:'14px 18px', borderTop:`1px solid ${B}`, display:'flex', gap:8 }}>
        <button onClick={copy} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:10, background:`${GL}18`, border:`1px solid ${GL}35`, color:GL, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          {copied?<Check size={13}/>:<Copy size={13}/>}{copied?'Copied!':'Copy Caption'}
        </button>
        <button onClick={() => { if (confirm('Delete this post?')) onDelete(event.id) }} style={{ padding:'10px 14px', borderRadius:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#EF4444', cursor:'pointer', fontFamily:'inherit' }}>
          <Trash2 size={13}/>
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const now    = new Date()
  const [year,  setYear]   = useState(now.getFullYear())
  const [month, setMonth]  = useState(now.getMonth()) // 0-indexed
  const [events,setEvents] = useState<CalEvent[]>([])
  const [loading,setLoading]= useState(true)
  const [selected,setSelected] = useState<CalEvent | null>(null)
  const [importing, setImporting] = useState(false)

  const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/calendar/events?month=${monthYear}`)
    const data= await res.json()
    setEvents(data.events || [])
    setLoading(false)
  }, [monthYear])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const prevMonth = () => { if (month === 0) { setYear(y=>y-1); setMonth(11) } else setMonth(m=>m-1) }
  const nextMonth = () => { if (month === 11) { setYear(y=>y+1); setMonth(0) } else setMonth(m=>m+1) }

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  // Adjust: Monday=0 (JS: Sunday=0, so shift)
  const startDow = (firstDay.getDay() + 6) % 7  // 0=Mon
  const daysInMonth = lastDay.getDate()
  const totalCells  = Math.ceil((startDow + daysInMonth) / 7) * 7
  const cells: (number|null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(totalCells - startDow - daysInMonth).fill(null),
  ]

  const eventsByDate: Record<string, CalEvent[]> = {}
  events.forEach(ev => {
    if (!eventsByDate[ev.scheduled_date]) eventsByDate[ev.scheduled_date] = []
    eventsByDate[ev.scheduled_date].push(ev)
  })

  const today     = now.toISOString().slice(0,10)
  const totalPub  = events.filter(e=>e.status==='published').length
  const totalSched= events.filter(e=>e.status==='scheduled').length

  const handleStatusChange = async (id: string, status: string) => {
    await fetch('/api/calendar/events', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, status }) })
    setEvents(prev => prev.map(e => e.id===id ? {...e, status} : e))
    setSelected(prev => prev?.id===id ? {...prev, status} : prev)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/calendar/events?id=${id}`, { method:'DELETE' })
    setEvents(prev => prev.filter(e => e.id!==id))
    setSelected(null)
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', paddingBottom:40 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Calendar size={20} style={{ color:GOLD }}/>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:W, margin:0 }}>Content Calendar</h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Mini stats */}
          {events.length > 0 && (
            <>
              <span style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:'rgba(34,197,94,0.1)', color:'#22C55E' }}>{totalPub} published</span>
              <span style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:'rgba(245,184,48,0.1)', color:GL }}>{totalSched} scheduled</span>
            </>
          )}
          <a href="/tools/content-calendar" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, background:`${GL}18`, border:`1px solid ${GL}35`, color:GL, fontSize:12.5, fontWeight:700, textDecoration:'none' }}>
            <Plus size={13}/> Generate calendar
          </a>
        </div>
      </div>

      {/* Month nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button onClick={prevMonth} style={{ background:FAINT, border:`1px solid ${B}`, borderRadius:9, padding:'7px 12px', cursor:'pointer', color:DIM, fontFamily:'inherit' }}>
          <ChevronLeft size={16}/>
        </button>
        <h2 style={{ fontFamily:"'Georgia',serif", fontSize:20, fontWeight:700, color:W, margin:0 }}>
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth} style={{ background:FAINT, border:`1px solid ${B}`, borderRadius:9, padding:'7px 12px', cursor:'pointer', color:DIM, fontFamily:'inherit' }}>
          <ChevronRight size={16}/>
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', padding:'6px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading
        ? <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
            {Array(35).fill(0).map((_,i) => <div key={i} style={{ background:FAINT, borderRadius:10, height:100, border:`1px solid ${B}`, opacity:0.4 }}/>)}
          </div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
            {cells.map((day, i) => {
              const dateStr = day ? `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null
              const dayEvents = dateStr ? (eventsByDate[dateStr] || []) : []
              return (
                <DayCell
                  key={i}
                  day={day}
                  date={dateStr}
                  events={dayEvents}
                  isToday={dateStr === today}
                  isCurrentMonth={!!day}
                  onEventClick={setSelected}
                  onAddClick={(d) => {
                    // Quick add — could open a modal; for now link to tools
                    alert(`Quick add for ${d} — feature coming. Use the Generate calendar tool to bulk-create posts.`)
                  }}
                />
              )
            })}
          </div>
      }

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 20px', background:N2, border:`1px dashed ${B}`, borderRadius:16, marginTop:12 }}>
          <p style={{ fontSize:28, marginBottom:14 }}>📅</p>
          <p style={{ fontSize:15, fontWeight:700, color:DIM, marginBottom:8 }}>No content planned for {MONTHS[month]}</p>
          <p style={{ fontSize:13, color:MUTED, marginBottom:20 }}>Use the Content Calendar tool to generate a month of posts, then import them here automatically.</p>
          <a href="/tools/content-calendar" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 24px', borderRadius:12, background:`linear-gradient(135deg,${GOLD},${GL})`, color:'#071528', fontWeight:800, fontSize:13.5, textDecoration:'none' }}>
            <Plus size={14}/> Generate this month's calendar
          </a>
        </div>
      )}

      {/* Platform legend */}
      {events.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:16 }}>
          {Object.entries(PLATFORM_CONFIG).filter(([k]) => events.some(e=>e.platform===k)).map(([k,cfg]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:cfg.color }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.color }}/>{cfg.label}
            </div>
          ))}
        </div>
      )}

      {/* Slide-out event panel */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:199 }}/>
          <EventPanel
            event={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  )
}
