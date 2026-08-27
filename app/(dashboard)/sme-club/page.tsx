'use client'
// /app/(dashboard)/sme-club/page.tsx — SME Club Member Hub
// Phase 2: Full community hub replacing the old session grid.
// Shows: points/rank, weekly schedule, active challenge, quick links, recent wins.

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Trophy, Star, Zap, FileText, Award, MessageCircle,
  ChevronRight, CheckCircle, Clock, TrendingUp, Users,
  BookOpen, Sparkles,
} from 'lucide-react'

const NAVY  = '#0B1F3A'
const N2    = '#0D2040'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const W     = '#EBF2FC'
const DIM   = 'rgba(205,217,236,0.65)'
const MUTED = 'rgba(205,217,236,0.35)'
const B     = 'rgba(255,255,255,0.08)'
const GREEN = '#22C55E'

const WHATSAPP_LINK = process.env.NEXT_PUBLIC_SME_CLUB_WHATSAPP_LINK ?? 'https://chat.whatsapp.com/placeholder'

// Weekly content schedule
const WEEKLY = [
  { day: 1, short: 'Mon', title: 'Monday Money Move',    desc: '3-min voice note — one action for your week', icon: '💰', color: GOLD  },
  { day: 2, short: 'Tue', title: 'Tool Tuesday',         desc: 'Live demo: real business problem → Cerebre tool', icon: '🛠️', color: TEAL  },
  { day: 3, short: 'Wed', title: 'Hot Seat Wednesday',   desc: 'One member\'s business diagnosed publicly', icon: '🔥', color: '#E84830' },
  { day: 4, short: 'Thu', title: 'Template Thursday',    desc: 'Swipe-worthy template drops on the site', icon: '📄', color: '#8B5CF6' },
  { day: 5, short: 'Fri', title: 'Win Friday',           desc: 'Post your results — coins earned, proof created', icon: '🏆', color: GREEN },
]

const RANK_COLOR: Record<string, string> = {
  'Rookie':         '#6B7280',
  'Builder':        '#8B5CF6',
  'Operator':       TEAL,
  'Growth Partner': GOLD,
}

export default function SmeClubHubPage() {
  const [hub,     setHub]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const todayDOW = new Date().getDay() // 0=Sun…6=Sat

  useEffect(() => {
    fetch('/api/club/hub')
      .then(r => r.json())
      .then(d => { setHub(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleJoinWhatsApp = useCallback(async () => {
    setJoining(true)
    await fetch('/api/club/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'dashboard_hub' }),
    }).catch(() => {})
    setJoining(false)
    window.open(WHATSAPP_LINK, '_blank')
  }, [])

  const pts   = hub?.points ?? {}
  const stats = hub?.stats  ?? {}

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>🌟</span>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: W, margin: 0 }}>
            SME Club
          </h1>
          {!loading && pts.rank && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: `${RANK_COLOR[pts.rank] ?? TEAL}18`,
              color: RANK_COLOR[pts.rank] ?? TEAL,
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              ✦ {pts.rank}
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: MUTED, maxWidth: 560 }}>
          A community of Nigerian business owners growing together — weekly content,
          real wins, and tools that actually work.
        </p>
      </div>

      {/* ── Points & Rank card ──────────────────────────────── */}
      {!loading && (
        <div style={{
          background: `linear-gradient(135deg, rgba(224,152,24,0.10) 0%, rgba(18,212,180,0.06) 100%)`,
          border: `1px solid ${GOLD}25`,
          borderRadius: 16, padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
              Your Points
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: "'Georgia',serif", fontSize: 40, fontWeight: 900, color: GL, lineHeight: 1 }}>
                {pts.total ?? 0}
              </span>
              <span style={{ fontSize: 13, color: MUTED }}>pts</span>
            </div>
            {pts.nextRank && (
              <p style={{ fontSize: 12, color: DIM, margin: '6px 0 0' }}>
                {pts.pointsToNext} more to <strong style={{ color: GL }}>{pts.nextRank}</strong>
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ flex: 2, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: RANK_COLOR[pts.rank] ?? TEAL }}>
                {pts.rank}
              </span>
              {pts.nextRank && (
                <span style={{ fontSize: 12, color: MUTED }}>{pts.nextRank} →</span>
              )}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${pts.pctToNext ?? 0}%`, height: '100%', borderRadius: 20, transition: 'width .6s',
                background: `linear-gradient(90deg, ${RANK_COLOR[pts.rank] ?? TEAL}, ${GL})`,
              }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: GREEN }}>✓ {stats.myWinCount ?? 0} wins</span>
              <span style={{ fontSize: 11, color: TEAL }}>⊙ {stats.sessionsCompleted ?? 0}/{stats.sessionCount ?? 0} sessions</span>
              <span style={{ fontSize: 11, color: MUTED }}>{stats.templateCount ?? 0} templates</span>
            </div>
          </div>
        </div>
      )}

      {/* ── WhatsApp CTA ────────────────────────────────────── */}
      {!loading && !stats.hasJoinedWhatsApp && (
        <div style={{
          background: `#25D36608`, border: `1px solid #25D36640`,
          borderLeft: `3px solid #25D366`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: W, margin: '0 0 3px' }}>
              📱 Join the SME Club WhatsApp Community
            </p>
            <p style={{ fontSize: 12.5, color: MUTED, margin: 0 }}>
              Get the Monday Money Move, Tool Tuesday demos, and Win Friday drops directly on WhatsApp. +5 coins when you join.
            </p>
          </div>
          <button
            onClick={handleJoinWhatsApp}
            disabled={joining}
            style={{
              flexShrink: 0, padding: '10px 20px', borderRadius: 10,
              background: '#25D366', color: '#fff',
              fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              opacity: joining ? 0.7 : 1,
            }}
          >
            Join WhatsApp →
          </button>
        </div>
      )}

      {/* ── Quick links ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { href: '/sme-club/sessions',   icon: <BookOpen size={18} />,    label: 'Sessions',  sub: `${stats.sessionCount ?? 0} masterclasses`,   color: TEAL  },
          { href: '/sme-club/templates',  icon: <FileText size={18} />,    label: 'Templates', sub: `${stats.templateCount ?? 0} ready to use`,    color: '#8B5CF6' },
          { href: '/sme-club/wins',       icon: <Trophy size={18} />,      label: 'Wins',      sub: 'Share & earn coins',                           color: GREEN },
          { href: '/sme-club/challenges', icon: <Zap size={18} />,         label: 'Challenges', sub: 'Monthly challenges',                          color: GOLD  },
          { href: '/sme-club/hot-seat',   icon: <Sparkles size={18} />,    label: 'Hot Seat',  sub: '100 coins + 200 pts',                          color: '#E84830' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: N2, border: `1px solid ${B}`, borderRadius: 14, padding: '16px 18px',
              cursor: 'pointer', transition: 'all .15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${item.color}40` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${B}` }}
            >
              <div style={{ color: item.color, marginBottom: 8 }}>{item.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: W, margin: '0 0 2px' }}>{item.label}</p>
              <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Weekly Schedule ────────────────────────────────── */}
        <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 20 }}>
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 16, fontWeight: 700, color: W, margin: '0 0 14px' }}>
            📅 This Week's Schedule
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WEEKLY.map(item => {
              const isToday = item.day === todayDOW
              return (
                <div key={item.day} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px',
                  borderRadius: 10,
                  background: isToday ? `${item.color}10` : 'transparent',
                  border: isToday ? `1px solid ${item.color}30` : '1px solid transparent',
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.short}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 8, background: `${item.color}20`, color: item.color }}>
                          TODAY
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: W, margin: '0 0 1px' }}>{item.title}</p>
                    <p style={{ fontSize: 11.5, color: MUTED, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Active Challenge ─────────────────────────────── */}
          {!loading && hub?.challenge ? (
            <div style={{ background: N2, border: `1px solid ${GOLD}25`, borderRadius: 16, padding: 20 }}>
              <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 16, fontWeight: 700, color: W, margin: '0 0 8px' }}>
                🏆 This Month's Challenge
              </h2>
              <p style={{ fontSize: 15, fontWeight: 700, color: GL, margin: '0 0 6px' }}>{hub.challenge.title}</p>
              <p style={{ fontSize: 13, color: DIM, margin: '0 0 14px', lineHeight: 1.6 }}>{hub.challenge.description}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: `${GOLD}15`, color: GL, fontWeight: 700 }}>
                  ⊙ {hub.challenge.coin_reward} coins
                </span>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: `${TEAL}15`, color: TEAL, fontWeight: 700 }}>
                  +{hub.challenge.point_reward} pts
                </span>
              </div>
              {hub.myEntry ? (
                <div style={{ padding: '10px 12px', borderRadius: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}25` }}>
                  <p style={{ fontSize: 12.5, color: GREEN, fontWeight: 700, margin: 0 }}>
                    ✓ Submitted · {hub.myEntry.status === 'approved' ? 'Approved!' : 'Under review'}
                  </p>
                </div>
              ) : (
                <Link href="/sme-club/challenges" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg,${GOLD},${GL})`,
                    color: '#071528', fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
                  }}>
                    Submit Entry →
                  </button>
                </Link>
              )}
            </div>
          ) : !loading ? (
            <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 20 }}>
              <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 16, fontWeight: 700, color: W, margin: '0 0 8px' }}>
                🏆 Challenges
              </h2>
              <p style={{ fontSize: 13, color: MUTED }}>No active challenge right now — check back soon.</p>
              <Link href="/sme-club/challenges" style={{ fontSize: 13, color: TEAL, textDecoration: 'none', fontWeight: 600 }}>
                View all challenges →
              </Link>
            </div>
          ) : (
            <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 20, height: 180, opacity: 0.4 }} />
          )}

          {/* ── Recent Wins ──────────────────────────────────── */}
          <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 16, fontWeight: 700, color: W, margin: 0 }}>
                🎉 Recent Wins
              </h2>
              <Link href="/sme-club/wins" style={{ fontSize: 12, color: TEAL, textDecoration: 'none', fontWeight: 600 }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div style={{ opacity: 0.3 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 48, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8 }} />
                ))}
              </div>
            ) : hub?.recentWins?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {hub.recentWins.slice(0, 3).map((win: any) => (
                  <div key={win.id} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${B}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: W, margin: '0 0 2px' }}>{win.title}</p>
                    {win.resultMetric && (
                      <p style={{ fontSize: 11.5, color: GREEN, margin: '0 0 2px', fontWeight: 600 }}>{win.resultMetric}</p>
                    )}
                    <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{win.authorName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>No wins yet — be the first!</p>
                <Link href="/sme-club/wins" style={{
                  fontSize: 12, padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                  background: `${GREEN}15`, color: GREEN, fontWeight: 700,
                }}>
                  Share a Win →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
