'use client'
// /app/cerebre-admin/club/page.tsx — Admin SME Club Management
// Approve wins, approve challenge entries, manage hot seat, see templates.

import React, { useState, useEffect } from 'react'
import { Crown, CheckCircle, XCircle, RefreshCw, Star, Trophy, Zap, FileText, Sparkles } from 'lucide-react'

const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const GREEN = '#22C55E'
const CORAL = '#E84830'
const DIM   = 'rgba(205,217,236,0.6)'
const MUTED = 'rgba(205,217,236,0.35)'
const B     = 'rgba(255,255,255,0.07)'

function action(a: string, id: string, extra?: Record<string, any>) {
  return fetch(`/api/admin/club?action=${a}&id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(extra ?? {}),
  })
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 17, fontWeight: 700, color: '#EBF2FC', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {icon} {title}
      </h2>
      {children}
    </div>
  )
}

export default function AdminClubPage() {
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/club').then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const act = async (a: string, id: string, extra?: Record<string, any>) => {
    setActing(id)
    await action(a, id, extra)
    setActing(null)
    load()
  }

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <RefreshCw size={24} style={{ color: MUTED, animation: 'admin-spin 1s linear infinite' }} />
    </div>
  )

  const pendingWins    = data?.pendingWins    ?? []
  const pendingEntries = data?.pendingEntries ?? []
  const pendingHotSeat = data?.pendingHotSeat ?? []
  const templates      = data?.templates      ?? []
  const total = pendingWins.length + pendingEntries.length + pendingHotSeat.length

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Crown size={22} style={{ color: GOLD }} /> SME Club
        </h1>
        <p style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>
          {total > 0 ? `${total} item${total !== 1 ? 's' : ''} need review` : 'All up to date'}
        </p>
      </div>

      {/* ── Pending Wins ─────────────────────────────────────── */}
      <Section title={`Pending Wins (${pendingWins.length})`} icon={<Trophy size={17} style={{ color: GL }} />}>
        {pendingWins.length === 0 ? (
          <p style={{ fontSize: 13, color: MUTED }}>No pending wins.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingWins.map((w: any) => (
              <div key={w.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${B}`, borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#EBF2FC', margin: '0 0 4px' }}>{w.title}</p>
                    {w.result_metric && <p style={{ fontSize: 12.5, color: GREEN, margin: '0 0 4px', fontWeight: 600 }}>{w.result_metric}</p>}
                    <p style={{ fontSize: 12.5, color: DIM, margin: '0 0 6px', lineHeight: 1.5 }}>{w.description}</p>
                    <p style={{ fontSize: 11, color: MUTED }}>
                      {(w.profiles as any)?.business_name || (w.profiles as any)?.full_name} · {(w.profiles as any)?.email}
                      {w.tool_used && ` · via ${w.tool_used}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => act('approve_win', w.id, { featured: true })} disabled={acting === w.id}
                      style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${GL}20`, color: GL, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Star size={12} /> Feature
                    </button>
                    <button onClick={() => act('approve_win', w.id)} disabled={acting === w.id}
                      style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${GREEN}20`, color: GREEN, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => act('reject_win', w.id)} disabled={acting === w.id}
                      style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${CORAL}15`, color: CORAL, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Pending Challenge Entries ─────────────────────────── */}
      <Section title={`Pending Challenge Entries (${pendingEntries.length})`} icon={<Zap size={17} style={{ color: GOLD }} />}>
        {pendingEntries.length === 0 ? (
          <p style={{ fontSize: 13, color: MUTED }}>No pending entries.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingEntries.map((e: any) => (
              <div key={e.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${B}`, borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, margin: '0 0 4px' }}>
                      {(e.club_challenges as any)?.title}
                    </p>
                    <p style={{ fontSize: 13.5, color: '#EBF2FC', margin: '0 0 6px', lineHeight: 1.5 }}>{e.submission_text}</p>
                    {e.submission_url && (
                      <a href={e.submission_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11.5, color: TEAL, textDecoration: 'none' }}>
                        View proof →
                      </a>
                    )}
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
                      {(e.profiles as any)?.full_name} · {(e.profiles as any)?.email}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => act('approve_entry', e.id)} disabled={acting === e.id}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${GREEN}20`, color: GREEN, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CheckCircle size={12} /> Approve (+coins)
                    </button>
                    <button onClick={() => act('reject_win', e.id)} disabled={acting === e.id}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${CORAL}15`, color: CORAL, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Hot Seat Applications ─────────────────────────────── */}
      <Section title={`Hot Seat Applications (${pendingHotSeat.length})`} icon={<Sparkles size={17} style={{ color: CORAL }} />}>
        {pendingHotSeat.length === 0 ? (
          <p style={{ fontSize: 13, color: MUTED }}>No pending applications.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingHotSeat.map((h: any) => (
              <div key={h.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${B}`, borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#EBF2FC', margin: '0 0 4px' }}>
                      {h.business_name || (h.profiles as any)?.full_name}
                    </p>
                    <p style={{ fontSize: 13, color: DIM, margin: '0 0 6px', lineHeight: 1.5 }}>{h.biggest_challenge}</p>
                    {h.desired_outcome && <p style={{ fontSize: 12, color: MUTED, margin: '0 0 4px' }}>Goal: {h.desired_outcome}</p>}
                    {h.available_dates && <p style={{ fontSize: 12, color: MUTED, margin: '0 0 4px' }}>Available: {h.available_dates}</p>}
                    <p style={{ fontSize: 11, color: MUTED }}>
                      {(h.profiles as any)?.email} · {new Date(h.created_at).toLocaleDateString('en-NG')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => act('update_hot_seat', h.id, { status: 'scheduled' })} disabled={acting === h.id}
                      style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${GREEN}20`, color: GREEN, fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
                      Schedule (+100c)
                    </button>
                    <button onClick={() => act('update_hot_seat', h.id, { status: 'declined' })} disabled={acting === h.id}
                      style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${CORAL}15`, color: CORAL, fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Templates ────────────────────────────────────────── */}
      <Section title={`Templates (${templates.length})`} icon={<FileText size={17} style={{ color: '#8B5CF6' }} />}>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>
          Template management via Supabase dashboard (insert/update club_templates table). Toggle publish here.
        </p>
        {templates.map((t: any) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${B}`, borderRadius: 10, marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#EBF2FC' }}>{t.title}</span>
              <span style={{ fontSize: 11, color: MUTED, marginLeft: 12 }}>{t.download_count} downloads</span>
            </div>
            <button onClick={() => act('toggle_template', t.id)} disabled={acting === t.id}
              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit',
                background: t.is_published ? `${GREEN}15` : 'rgba(255,255,255,0.06)',
                color: t.is_published ? GREEN : MUTED }}>
              {t.is_published ? '● Published' : '○ Unpublished'}
            </button>
          </div>
        ))}
      </Section>
    </div>
  )
}
