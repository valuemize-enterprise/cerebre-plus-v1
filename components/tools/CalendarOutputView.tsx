'use client'

import React, { useState, useMemo } from 'react'

const GL  = '#F5B830'
const GOLD= '#E09818'
const TEAL= '#12D4B4'
const W   = '#EBF2FC'
const DIM = 'rgba(205,217,236,.72)'
const MUTED='rgba(205,217,236,.38)'
const FAINT='rgba(255,255,255,.055)'
const BDR ='rgba(255,255,255,.09)'

interface CalendarPost {
  day:   string
  platform: string
  topic: string
  type:  string
}

interface CalendarWeek {
  title: string
  posts: CalendarPost[]
}

function parseCalendarText(raw: string): CalendarWeek[] {
  const weeks: CalendarWeek[] = []
  let currentWeek: CalendarWeek | null = null

  for (const line of raw.split('\n')) {
    const weekMatch = line.match(/^\*\*(Week\s+\d+|Salary\s+Week|Strategy\s+Overview)\*\*/i)
    if (weekMatch) {
      if (currentWeek) weeks.push(currentWeek)
      currentWeek = { title: weekMatch[1], posts: [] }
      continue
    }

    const postMatch = line.match(
      /^[•\-→]\s*(?:(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*[:\-–—])?\s*(.+)/i
    )
    if (postMatch && currentWeek) {
      let day = postMatch[1] || ''
      if (day) {
        const dayMap: Record<string, string> = {
          Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday',
          Thu:'Thursday', Fri:'Friday', Sat:'Saturday', Sun:'Sunday',
        }
        day = dayMap[day] || day
      }
      currentWeek.posts.push({ day, platform: '', topic: postMatch[2].trim(), type: '' })
    }
  }

  if (currentWeek) weeks.push(currentWeek)
  return weeks
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram:'#E1306C', Facebook:'#1877F2', LinkedIn:'#0A66C2',
  TikTok:'#69C9D0', Twitter:'#1DA1F2', YouTube:'#FF0000',
  WhatsApp:'#25D366', Website:'#7C3AED',
}

export default function CalendarOutputView({ rawText }: { rawText: string }) {
  const weeks = useMemo(() => parseCalendarText(rawText), [rawText])
  const [openWeek, setOpenWeek] = useState<number>(0)

  if (weeks.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{
          borderRadius: 12, border: `1px solid ${BDR}`,
          background: FAINT, padding: '24px 16px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>📅</span>
          <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
            Your content calendar will appear here once generated.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 14px' }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', border: `1px solid ${openWeek === wi ? GOLD + '30' : BDR}` }}>
          <button
            onClick={() => setOpenWeek(openWeek === wi ? -1 : wi)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: openWeek === wi ? `${GOLD}07` : 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              color: openWeek === wi ? GL : DIM, fontSize: 13.5, fontWeight: 700,
            }}
          >
            <span>📅 {week.title}</span>
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 400 }}>
              {week.posts.length} post{week.posts.length !== 1 ? 's' : ''}
            </span>
          </button>

          {openWeek === wi && (
            <div style={{ borderTop: `1px solid ${BDR}` }}>
              {week.posts.map((post, pi) => {
                const pc = PLATFORM_COLORS[post.platform] || GOLD
                return (
                  <div key={pi} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 14px', borderBottom: pi < week.posts.length - 1 ? `1px solid ${BDR}` : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: `${pc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: pc,
                    }}>
                      {post.day ? post.day.slice(0, 2) : '📌'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: DIM, margin: 0, lineHeight: 1.5 }}>
                        {post.topic}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
