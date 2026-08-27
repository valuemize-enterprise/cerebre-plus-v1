'use client'
// /app/(dashboard)/sme-club/challenges/page.tsx
// Monthly challenges + points leaderboard.

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Zap, ArrowLeft, Trophy, Send } from 'lucide-react'

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

const RANK_COLOR: Record<string, string> = {
  'Rookie':         '#6B7280',
  'Builder':        '#8B5CF6',
  'Operator':       TEAL,
  'Growth Partner': GOLD,
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function ChallengesPage() {
  const [challenges,   setChallenges]   = useState<any[]>([])
  const [leaderboard,  setLeaderboard]  = useState<any[]>([])
  const [myPosition,   setMyPosition]   = useState<any>(null)
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState<'challenges' | 'leaderboard'>('challenges')
  const [submitting,   setSubmitting]   = useState<string | null>(null)
  const [submitted,    setSubmitted]    = useState<string | null>(null)
  const [error,        setError]        = useState('')
  const [entries,      setEntries]      = useState<Record<string, { text: string; url: string }>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/club/challenges').then(r => r.json()),
      fetch('/api/club/leaderboard').then(r => r.json()),
    ]).then(([c, l]) => {
      setChallenges(c.challenges ?? [])
      setLeaderboard(l.leaderboard ?? [])
      setMyPosition(l.myPosition ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (challengeId: string) => {
    const e = entries[challengeId]
    if (!e?.text?.trim()) { setError('Please write your submission first'); return }
    setSubmitting(challengeId)
    setError('')
    const res = await fetch('/api/club/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, submissionText: e.text, submissionUrl: e.url }),
    })
    const data = await res.json()
    if (res.ok) {
      setSubmitted(challengeId)
      setChallenges(prev => prev.map(c => c.id === challengeId
        ? { ...c, myEntry: { status: 'pending', created_at: new Date().toISOString() } }
        : c))
    } else {
      setError(data.error ?? 'Submission failed')
    }
    setSubmitting(null)
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/sme-club" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTED, textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft size={14} /> SME Club
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: W, margin: 0 }}>Challenges & Leaderboard</h1>
        </div>
        <p style={{ fontSize: 14, color: MUTED, maxWidth: 560 }}>
          Monthly challenges that push your business forward. Complete them to earn coins, points, and your spot on the board.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {([['challenges', '⚡ Challenges'], ['leaderboard', '🏆 Leaderboard']] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '9px 18px', borderRadius: 20, border: `1px solid ${tab === t ? GOLD + '40' : B}`,
              background: tab === t ? `${GOLD}12` : 'transparent',
              color: tab === t ? GL : MUTED,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>{l}</button>
        ))}
      </div>

      {error && (
        <p style={{ fontSize: 12.5, color: CORAL, marginBottom: 12 }}>{error}</p>
      )}

      {/* ── CHALLENGES TAB ─────────────────────────────────── */}
      {tab === 'challenges' && (
        loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[1, 2].map(i => <div key={i} style={{ background: N2, borderRadius: 16, height: 240, border: `1px solid ${B}`, opacity: 0.4 }} />)}
          </div>
        ) : challenges.length === 0 ? (
          <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 60, textAlign: 'center' }}>
            <Zap size={40} style={{ color: MUTED, marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: MUTED }}>No active challenges right now. Check back next month!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(420px,1fr))', gap: 16 }}>
            {challenges.map((c: any) => {
              const isOpen = c.isActive
              const myEntry = c.myEntry
              const entry = entries[c.id] ?? { text: '', url: '' }

              return (
                <div key={c.id} style={{ background: N2, border: `1px solid ${isOpen ? GOLD + '25' : B}`, borderRadius: 16, padding: 22 }}>
                  {/* Status badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
                      background: isOpen ? `${GREEN}15` : 'rgba(255,255,255,0.06)',
                      color: isOpen ? GREEN : MUTED, textTransform: 'uppercase',
                    }}>
                      {isOpen ? '● Open' : 'Closed'}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: GL }}>⊙ {c.coin_reward}c</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: TEAL }}>+{c.point_reward}pts</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 16, fontWeight: 800, color: W, margin: '0 0 6px' }}>{c.title}</p>
                  {c.description && (
                    <p style={{ fontSize: 13, color: DIM, margin: '0 0 14px', lineHeight: 1.6 }}>{c.description}</p>
                  )}
                  <p style={{ fontSize: 11, color: MUTED, margin: '0 0 14px' }}>
                    Ends {new Date(c.ends_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long' })}
                  </p>

                  {/* Submitted */}
                  {myEntry ? (
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}25` }}>
                      <p style={{ fontSize: 13, color: GREEN, fontWeight: 700, margin: 0 }}>
                        ✓ Submitted · {myEntry.status === 'approved' ? `Approved! +${c.coin_reward} coins earned` : 'Under review'}
                      </p>
                    </div>
                  ) : isOpen ? (
                    <div>
                      <textarea
                        value={entry.text}
                        onChange={e => setEntries(prev => ({ ...prev, [c.id]: { ...entry, text: e.target.value } }))}
                        placeholder="Describe what you did and the result you got…"
                        rows={3}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 10, resize: 'none', marginBottom: 8,
                          background: 'rgba(255,255,255,0.04)', border: `1px solid ${B}`,
                          color: W, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                      <input
                        value={entry.url}
                        onChange={e => setEntries(prev => ({ ...prev, [c.id]: { ...entry, url: e.target.value } }))}
                        placeholder="Optional: link to proof (post, photo, screenshot)"
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 10, marginBottom: 10,
                          background: 'rgba(255,255,255,0.04)', border: `1px solid ${B}`,
                          color: W, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                      <button
                        onClick={() => handleSubmit(c.id)}
                        disabled={submitting === c.id}
                        style={{
                          width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: `linear-gradient(135deg,${GOLD},${GL})`,
                          color: '#071528', fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          opacity: submitting === c.id ? 0.7 : 1,
                        }}>
                        <Send size={13} />
                        {submitting === c.id ? 'Submitting…' : 'Submit Entry'}
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: MUTED, fontStyle: 'italic' }}>This challenge is no longer accepting entries.</p>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── LEADERBOARD TAB ────────────────────────────────── */}
      {tab === 'leaderboard' && (
        <div>
          {myPosition && (
            <div style={{
              background: `${GOLD}08`, border: `1px solid ${GOLD}30`,
              borderRadius: 14, padding: '14px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: 12, color: MUTED, margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Position</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: W, margin: 0 }}>
                  #{myPosition.position} · <span style={{ color: GL }}>{myPosition.totalPoints} pts</span>
                </p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12,
                background: `${RANK_COLOR[myPosition.rank] ?? TEAL}15`,
                color: RANK_COLOR[myPosition.rank] ?? TEAL,
              }}>
                {myPosition.rank}
              </span>
            </div>
          )}

          {loading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ background: N2, borderRadius: 10, height: 52, border: `1px solid ${B}`, opacity: 0.4, marginBottom: 8 }} />
            ))
          ) : leaderboard.length === 0 ? (
            <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 60, textAlign: 'center' }}>
              <Trophy size={40} style={{ color: MUTED, marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: MUTED }}>No one on the board yet. Be the first to earn points!</p>
            </div>
          ) : (
            <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, overflow: 'hidden' }}>
              {leaderboard.map((member: any, i: number) => (
                <div key={member.userId} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                  borderTop: i > 0 ? `1px solid ${B}` : 'none',
                  background: member.isMe ? `${GOLD}06` : 'transparent',
                }}>
                  <span style={{ fontSize: member.position <= 3 ? 20 : 13, fontWeight: 700, color: member.position <= 3 ? 'inherit' : MUTED, width: 28, textAlign: 'center', flexShrink: 0 }}>
                    {MEDAL[member.position] ?? `#${member.position}`}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: member.isMe ? GL : W, margin: '0 0 1px' }}>
                      {member.name}{member.isMe ? ' (you)' : ''}
                    </p>
                    {member.industry && <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{member.industry}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: GL, margin: '0 0 2px' }}>{member.totalPoints}</p>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                      background: `${RANK_COLOR[member.rank] ?? TEAL}15`,
                      color: RANK_COLOR[member.rank] ?? TEAL,
                    }}>
                      {member.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
