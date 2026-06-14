'use client'
// /app/cerebre-admin/ratings/page.tsx
// Platform-wide satisfaction analytics — shows how well every tool is performing.
// Handles gracefully when migration 006 hasn't run yet (shows empty state, not an error).

import React, { useState, useEffect } from 'react'
import {
  ThumbsUp, ThumbsDown, Star, AlertTriangle,
  Award, MessageSquare, RefreshCw, BarChart3,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const N2   = '#0D2040'
const GOLD = '#E09818'
const GL   = '#F5B830'
const TEAL = '#12D4B4'
const GREEN= '#22C55E'
const RED  = '#EF4444'
const W    = '#EBF2FC'
const DIM  = 'rgba(205,217,236,0.65)'
const MUTED= 'rgba(205,217,236,0.35)'
const B    = 'rgba(255,255,255,0.08)'
const FAINT= 'rgba(255,255,255,0.04)'

// Human-readable labels for all rating tags
const TAG_LABELS: Record<string, string> = {
  too_generic:          'Too generic',
  wrong_tone:           'Wrong tone',
  wrong_industry_feel:  'Wrong industry feel',
  too_much_editing:     'Too much editing needed',
  too_long:             'Too long',
  too_short:            'Too short',
  missed_brief:         'Missed the brief',
  not_worth_coins:      'Not worth the coins',
  poor_visual:          'Poor visual quality',
  used_as_is:           'Used as-is',
  nailed_voice:         'Nailed brand voice',
  saved_time:           'Saved me time',
  exactly_what_needed:  'Exactly what I needed',
  better_than_expected: 'Better than expected',
  gave_new_ideas:       'Gave me new ideas',
  colors_off:           'Colours off-brand',
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = GL }: {
  icon: React.ReactElement; label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div style={{
      background: N2, border: `1px solid ${B}`, borderRadius: 14,
      padding: '18px 20px',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        {React.cloneElement(icon, { size: 14, style: { color } } as any)}
        <span style={{
          fontSize: 10, fontWeight: 700, color: MUTED,
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          {label}
        </span>
      </div>
      <p style={{
        fontFamily: "'Georgia',serif", fontSize: 28,
        fontWeight: 900, color: W, margin: '0 0 4px',
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11.5, color: MUTED, margin: 0 }}>{sub}</p>}
    </div>
  )
}

// ── Satisfaction bar ──────────────────────────────────────────
function SatBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? GREEN : pct >= 60 ? GL : RED
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{
        flex: 1, height: 6, background: 'rgba(255,255,255,0.07)',
        borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: 3,
          transition: 'width .4s',
        }}/>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, width: 36, textAlign:'right' }}>
        {pct}%
      </span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ migrationMissing }: { migrationMissing: boolean }) {
  return (
    <div style={{
      background: N2, border: `1px dashed ${B}`, borderRadius: 14,
      padding: '48px 24px', textAlign: 'center',
    }}>
      <BarChart3 size={36} style={{ color: MUTED, margin: '0 auto 16px' }}/>
      <p style={{ fontSize: 15, fontWeight: 700, color: DIM, marginBottom: 8 }}>
        {migrationMissing ? 'Database setup incomplete' : 'No ratings yet'}
      </p>
      {migrationMissing ? (
        <>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 16px' }}>
            The ratings database tables haven't been created yet. Run migration
            <strong style={{ color: GL, fontFamily:'monospace' }}> 006_ratings.sql </strong>
            in your Supabase SQL Editor to enable this feature.
          </p>
          <div style={{
            background: 'rgba(224,152,24,0.08)', border: `1px solid ${GOLD}30`,
            borderRadius: 10, padding: '12px 16px', maxWidth: 480, margin: '0 auto',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: GL, marginBottom: 6 }}>
              After running the migration, also run this to initialise the stats view:
            </p>
            <code style={{ fontSize: 11, color: TEAL, fontFamily: 'monospace', display: 'block' }}>
              SELECT public.refresh_rating_stats();
            </code>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13, color: MUTED, maxWidth: 440, margin: '0 auto' }}>
          Ratings will appear here once users start rating their tool outputs.
          The RatingWidget appears below every generated output.
        </p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function RatingsPage() {
  const [data,             setData]          = useState<any>(null)
  const [days,             setDays]          = useState(30)
  const [loading,          setLoading]       = useState(true)
  const [refreshing,       setRefreshing]    = useState(false)
  const [error,            setError]         = useState<string | null>(null)
  const [migrationMissing, setMigMissing]    = useState(false)
  const [selectedTool,     setSelectedTool]  = useState<string | null>(null)
  const [toolDetail,       setToolDetail]    = useState<any>(null)
  const [toolLoading,      setToolLoading]   = useState(false)

  const fetchData = async (d = days) => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch(`/api/admin/ratings?view=overview&days=${d}`)
      const json = await res.json()

      if (!res.ok) {
        // Detect migration-missing vs other errors
        const msg = json?.error || json?.message || ''
        if (msg.includes('tool_rating_stats') || msg.includes('get_platform_satisfaction') || msg.includes('does not exist')) {
          setMigMissing(true)
        } else {
          setError(msg || 'Failed to load ratings data')
        }
        setData(null)
      } else {
        setMigMissing(false)
        setData(json)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(days) }, [days])

  const refreshStats = async () => {
    setRefreshing(true)
    try {
      await fetch('/api/admin/ratings?action=refresh', { method: 'POST' })
      await fetchData(days)
    } finally {
      setRefreshing(false)
    }
  }

  const drillDown = async (toolId: string) => {
    if (selectedTool === toolId) { setSelectedTool(null); setToolDetail(null); return }
    setSelectedTool(toolId); setToolLoading(true)
    try {
      const res  = await fetch(`/api/admin/ratings?view=tool&tool_id=${toolId}&days=${days}`)
      const json = await res.json()
      setToolDetail(res.ok ? json : null)
    } finally {
      setToolLoading(false)
    }
  }

  const p = data?.platform || {}
  const byTool: any[] = data?.by_tool || []
  const recentText: any[] = data?.recent_text || []

  const toolName = (id: string) =>
    id.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1100 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 22,
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Georgia',serif", fontSize: 22,
            fontWeight: 900, color: W, margin: '0 0 4px',
          }}>
            User Ratings & Feedback
          </h1>
          <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
            How well are your tools serving your users?
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Day filter */}
          <div style={{ display:'flex', gap:5 }}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)} style={{
                padding: '6px 12px', borderRadius: 20, fontFamily: 'inherit',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                background: days === d ? `${GL}18` : FAINT,
                border: `1px solid ${days === d ? GL+'40' : B}`,
                color: days === d ? GL : MUTED, transition: 'all .15s',
              }}>
                {d}d
              </button>
            ))}
          </div>

          {/* Refresh stats button */}
          <button onClick={refreshStats} disabled={refreshing} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 10, fontFamily: 'inherit',
            fontSize: 12, fontWeight: 700, cursor: refreshing ? 'not-allowed' : 'pointer',
            background: FAINT, border: `1px solid ${B}`, color: MUTED,
          }}>
            <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}/>
            {refreshing ? 'Refreshing…' : 'Refresh stats'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding: 60 }}>
          <div style={{
            width: 30, height: 30,
            border: `2px solid ${GOLD}`, borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }}/>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{
          padding: '16px 18px', background: 'rgba(239,68,68,0.08)',
          border: `1px solid ${RED}30`, borderRadius: 12, marginBottom: 16,
          color: '#FCA5A5', fontSize: 13,
        }}>
          <strong>Error loading ratings:</strong> {error}
        </div>
      )}

      {/* Migration missing or no data */}
      {!loading && !error && (migrationMissing || byTool.length === 0) && (
        <EmptyState migrationMissing={migrationMissing}/>
      )}

      {/* Main content */}
      {!loading && !error && !migrationMissing && byTool.length > 0 && (
        <>
          {/* KPI row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12, marginBottom: 22,
          }}>
            <StatCard
              icon={<ThumbsUp/>}
              label="Satisfaction"
              value={`${p.thumbs_up_pct ?? 0}%`}
              sub={`${p.total_ratings ?? 0} total ratings`}
              color={GREEN}
            />
            <StatCard
              icon={<Star/>}
              label="Avg Stars"
              value={p.avg_stars ? Number(p.avg_stars).toFixed(1) : '—'}
              sub="Across all rated outputs"
              color={GL}
            />
            <StatCard
              icon={<Award/>}
              label="Most Loved"
              value={p.most_loved_tool ? toolName(p.most_loved_tool) : '—'}
              sub="Highest satisfaction rate"
              color={TEAL}
            />
            <StatCard
              icon={<AlertTriangle/>}
              label="Needs Work"
              value={p.needs_work_tool ? toolName(p.needs_work_tool) : '—'}
              sub="Lowest satisfaction rate"
              color={RED}
            />
          </div>

          {/* Two-column layout */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>

            {/* Tool breakdown */}
            <div style={{
              background: N2, border: `1px solid ${B}`,
              borderRadius: 14, padding: '18px 20px',
            }}>
              <h2 style={{
                fontFamily: "'Georgia',serif", fontSize: 15,
                fontWeight: 700, color: W, marginBottom: 14,
              }}>
                Satisfaction by Tool
              </h2>

              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 1.4fr 60px',
                gap: 0, marginBottom: 6,
              }}>
                {['Tool', 'Ratings', 'Satisfaction', '⭐ Avg'].map(h => (
                  <span key={h} style={{
                    fontSize: 10, fontWeight: 700, color: MUTED,
                    letterSpacing: '1px', textTransform: 'uppercase',
                    paddingBottom: 8, borderBottom: `1px solid ${B}`,
                  }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {byTool.map((tool: any) => (
                <div
                  key={tool.tool_id}
                  onClick={() => drillDown(tool.tool_id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 1.4fr 60px',
                    gap: 0, padding: '10px 0',
                    borderBottom: `1px solid ${B}`, cursor: 'pointer',
                    background: selectedTool === tool.tool_id
                      ? `${GOLD}08` : 'transparent',
                    transition: 'background .12s',
                  }}
                >
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: selectedTool === tool.tool_id ? GL : DIM,
                    paddingRight: 8,
                  }}>
                    {toolName(tool.tool_id)}
                  </span>
                  <span style={{ fontSize: 13, color: MUTED }}>
                    {tool.total_ratings}
                  </span>
                  <SatBar pct={Number(tool.satisfaction_pct ?? 0)}/>
                  <span style={{ fontSize: 13, color: MUTED, textAlign:'right' }}>
                    {tool.avg_stars ? Number(tool.avg_stars).toFixed(1) : '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Tool drill-down */}
              {selectedTool && (
                <div style={{
                  background: N2, border: `1px solid ${GOLD}30`,
                  borderLeft: `3px solid ${GOLD}`, borderRadius: 14, padding: 18,
                }}>
                  {toolLoading ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
                      <div style={{ width:20, height:20, border:`2px solid ${GOLD}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                    </div>
                  ) : toolDetail ? (
                    <>
                      <h3 style={{ fontSize:14, fontWeight:700, color:W, marginBottom:14 }}>
                        {toolName(selectedTool)}
                      </h3>

                      {/* Thumbs row */}
                      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                        {[
                          { icon:'👍', val:toolDetail.thumbs_up,        label:'Up',       color:GREEN  },
                          { icon:'👎', val:toolDetail.thumbs_down,       label:'Down',     color:RED    },
                          { icon:'%',  val:`${toolDetail.satisfaction_pct}%`, label:'Happy', color:GL },
                        ].map(({ icon, val, label, color }) => (
                          <div key={label} style={{
                            flex:1, textAlign:'center', background: FAINT,
                            borderRadius:10, padding:'10px 6px',
                          }}>
                            <p style={{ fontSize:20, fontWeight:900, color, margin:'0 0 3px' }}>
                              {val}
                            </p>
                            <p style={{ fontSize:10, color:MUTED, margin:0 }}>{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Top tags */}
                      {toolDetail.top_tags?.length > 0 && (
                        <>
                          <p style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>
                            Top feedback tags
                          </p>
                          {toolDetail.top_tags.slice(0, 7).map(([tag, count]: [string, number]) => (
                            <div key={tag} style={{
                              display:'flex', alignItems:'center', justifyContent:'space-between',
                              padding:'5px 0', borderBottom:`1px solid ${B}`,
                            }}>
                              <span style={{ fontSize:12, color:DIM }}>
                                {TAG_LABELS[tag] || tag.replace(/_/g,' ')}
                              </span>
                              <span style={{ fontSize:12, fontWeight:700, color:MUTED }}>
                                {count}×
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize:13, color:MUTED }}>No data for this tool in the selected period.</p>
                  )}
                </div>
              )}

              {/* Recent text feedback */}
              <div style={{
                background: N2, border: `1px solid ${B}`,
                borderRadius: 14, padding: 18, flex: 1,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
                  <MessageSquare size={14} style={{ color:TEAL }}/>
                  <h3 style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>
                    Recent Comments
                  </h3>
                </div>

                {recentText.length === 0 ? (
                  <p style={{ fontSize:13, color:MUTED, textAlign:'center', padding:'20px 0' }}>
                    No written feedback yet.
                  </p>
                ) : recentText.slice(0, 6).map((r: any, i: number) => (
                  <div key={i} style={{ padding:'10px 0', borderBottom:`1px solid ${B}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:14 }}>{r.thumbs === 'up' ? '👍' : '👎'}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:MUTED }}>
                        {toolName(r.tool_id)}
                      </span>
                      <span style={{ fontSize:10, color:MUTED, marginLeft:'auto' }}>
                        {new Date(r.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize:12.5, color:DIM, margin:0, lineHeight:1.55 }}>
                      "{r.feedback_text.slice(0, 120)}{r.feedback_text.length > 120 ? '…' : ''}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
