'use client'
// /app/(dashboard)/sme-club/wins/page.tsx
// Win Friday — submit a win and browse the community wins board.

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Trophy, Send, ArrowLeft, CheckCircle, Clock, Star } from 'lucide-react'

const N2    = '#0D2040'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const W     = '#EBF2FC'
const DIM   = 'rgba(205,217,236,0.65)'
const MUTED = 'rgba(205,217,236,0.35)'
const B     = 'rgba(255,255,255,0.08)'
const GREEN = '#22C55E'
const CORAL = '#E84830'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Under review',  color: GOLD  },
  approved: { label: 'Approved ✓',    color: GREEN },
  featured: { label: '⭐ Featured',   color: GL    },
  rejected: { label: 'Not approved',  color: CORAL },
}

export default function WinsPage() {
  const [communityWins, setCommunityWins] = useState<any[]>([])
  const [myWins,        setMyWins]        = useState<any[]>([])
  const [loading,       setLoading]       = useState(true)
  const [submitting,    setSubmitting]    = useState(false)
  const [submitted,     setSubmitted]     = useState(false)
  const [error,         setError]         = useState('')
  const [tab,           setTab]           = useState<'community' | 'mine'>('community')
  const [form, setForm] = useState({ title: '', description: '', toolUsed: '', resultMetric: '' })

  const fetchWins = useCallback(() => {
    fetch('/api/club/wins').then(r => r.json()).then(d => {
      setCommunityWins(d.communityWins ?? [])
      setMyWins(d.myWins ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchWins() }, [fetchWins])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required')
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/club/wins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setSubmitted(true)
      setForm({ title: '', description: '', toolUsed: '', resultMetric: '' })
      fetchWins()
      setTimeout(() => setSubmitted(false), 5000)
    } else {
      setError(data.error ?? 'Submission failed')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/sme-club" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTED, textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft size={14} /> SME Club
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: W, margin: 0 }}>Wins Board</h1>
        </div>
        <p style={{ fontSize: 14, color: MUTED, maxWidth: 520 }}>
          Share a business win — big or small. Approved wins earn you <strong style={{ color: GL }}>10 coins + 20 points</strong> and inspire everyone in the community.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── Submit Form ─────────────────────────────────── */}
        <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 22 }}>
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 17, fontWeight: 700, color: W, margin: '0 0 16px' }}>
            Share Your Win 🎉
          </h2>

          {submitted && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}25`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: GREEN, fontWeight: 700, margin: 0 }}>
                ✓ Submitted! We'll review it and credit your coins within 24 hours.
              </p>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 12.5, color: CORAL, marginBottom: 12 }}>{error}</p>
          )}

          {[
            { key: 'title', label: 'Win title *', placeholder: 'e.g. Got 3 new clients from one WhatsApp post', type: 'text' },
            { key: 'resultMetric', label: 'The result (numbers preferred)', placeholder: 'e.g. ₦150,000 in new revenue, 5 leads in 24 hours', type: 'text' },
            { key: 'toolUsed', label: 'Cerebre tool that helped (optional)', placeholder: 'e.g. Caption Craft, WhatsApp Drafter', type: 'text' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                value={(form as any)[field.key]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${B}`,
                  color: W, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>
              Tell the story *
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What happened? What did you do differently? What was the outcome? Be specific — the more detail, the more it inspires others."
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10, resize: 'none',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${B}`,
                color: W, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                lineHeight: 1.6,
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg,${GOLD},${GL})`,
              color: '#071528', fontWeight: 800, fontSize: 14, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: submitting ? 0.7 : 1,
            }}>
            <Send size={14} />
            {submitting ? 'Submitting…' : 'Submit Win'}
          </button>

          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${B}` }}>
            <p style={{ fontSize: 11.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
              💡 Wins are reviewed within 24 hours. Approved wins earn <strong style={{ color: GL }}>10 coins</strong> and get shared with the community. Featured wins may appear on our social media.
            </p>
          </div>
        </div>

        {/* ── Wins Board ───────────────────────────────────── */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {([['community', '🌍 Community'], ['mine', '👤 My Wins']] as const).map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: `1px solid ${tab === t ? TEAL + '40' : B}`,
                  background: tab === t ? `${TEAL}12` : 'transparent',
                  color: tab === t ? TEAL : MUTED,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ background: N2, borderRadius: 12, height: 80, border: `1px solid ${B}`, opacity: 0.4 }} />
              ))
            ) : tab === 'community' ? (
              communityWins.length === 0 ? (
                <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
                  <Trophy size={36} style={{ color: MUTED, marginBottom: 10 }} />
                  <p style={{ fontSize: 13, color: MUTED }}>No wins yet. Be the first to share!</p>
                </div>
              ) : (
                communityWins.map((win: any) => (
                  <div key={win.id} style={{
                    background: N2, border: win.isFeatured ? `1px solid ${GL}30` : `1px solid ${B}`,
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    {win.isFeatured && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: GL, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 4 }}>
                        ⭐ Featured Win
                      </span>
                    )}
                    <p style={{ fontSize: 14, fontWeight: 700, color: W, margin: '0 0 3px' }}>{win.title}</p>
                    {win.resultMetric && (
                      <p style={{ fontSize: 12.5, color: GREEN, fontWeight: 700, margin: '0 0 4px' }}>{win.resultMetric}</p>
                    )}
                    <p style={{ fontSize: 12.5, color: DIM, margin: '0 0 6px', lineHeight: 1.5 }}>{win.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: MUTED }}>{win.authorName}</span>
                      {win.toolUsed && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: `${TEAL}10`, color: TEAL }}>via {win.toolUsed}</span>}
                    </div>
                  </div>
                ))
              )
            ) : (
              myWins.length === 0 ? (
                <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: MUTED }}>You haven't submitted any wins yet.</p>
                </div>
              ) : (
                myWins.map((win: any) => {
                  const sc = STATUS_CONFIG[win.status] ?? STATUS_CONFIG.pending
                  return (
                    <div key={win.id} style={{ background: N2, border: `1px solid ${B}`, borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: W, margin: '0 0 4px' }}>{win.title}</p>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, whiteSpace: 'nowrap', flexShrink: 0 }}>{sc.label}</span>
                      </div>
                      {win.result_metric && (
                        <p style={{ fontSize: 12, color: GREEN, margin: '0 0 4px', fontWeight: 600 }}>{win.result_metric}</p>
                      )}
                      {win.status === 'approved' || win.status === 'featured' ? (
                        <p style={{ fontSize: 11.5, color: GL, margin: 0, fontWeight: 600 }}>
                          ⊙ +{win.coins_awarded} coins earned!
                        </p>
                      ) : (
                        <p style={{ fontSize: 11.5, color: MUTED, margin: 0 }}>
                          {new Date(win.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  )
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
