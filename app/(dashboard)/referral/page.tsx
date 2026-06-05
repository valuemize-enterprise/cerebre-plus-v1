'use client'
// /app/(dashboard)/referral/page.tsx
// Referral programme — earn coins every time someone you refer subscribes.
// Starter referral: 50 coins · Growth referral: 100 coins
// Referral code = first 8 characters of user.id (no extra DB column needed).

import React, { useState, useEffect, useCallback } from 'react'
import { Copy, Check, Users, Coins, Trophy, Share2, Clock, ExternalLink } from 'lucide-react'
import { useUser }  from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

// ── Design tokens ─────────────────────────────────────────────
const NAVY  = '#0B1F3A'
const NAVY2 = '#0D2040'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const CORAL = '#E84830'
const DIM   = 'rgba(205,217,236,0.6)'
const MUTED = 'rgba(205,217,236,0.35)'

const REWARDS = { starter: 50, growth: 100 } as const

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
function Badge({ status }: { status: 'pending' | 'converted' | 'expired' }) {
  const map = {
    pending:   { bg: 'rgba(200,136,10,0.12)', border: 'rgba(200,136,10,0.28)', color: GL,    label: 'Pending' },
    converted: { bg: 'rgba(18,212,180,0.1)',  border: 'rgba(18,212,180,0.25)', color: TEAL,  label: 'Converted ✓' },
    expired:   { bg: 'rgba(232,72,48,0.08)',  border: 'rgba(232,72,48,0.2)',   color: CORAL, label: 'Expired' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ReferralPage() {
  const { user } = useUser()
  const { toast } = useToast()

  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)

  const referralCode = user?.id?.replace(/-/g, '').slice(0, 8).toUpperCase() ?? '…'
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL || 'https://cerebreplus.com'
  const referralLink = `${appUrl}/signup?ref=${referralCode}`

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast({ type: 'success', title: 'Link copied!', description: 'Share it and earn coins when they subscribe.' })
    setTimeout(() => setCopied(false), 2500)
  }, [referralLink, toast])

  const shareWA = useCallback(() => {
    // Reads as a genuine personal recommendation — NOT a cold promo
    const msg =
      `Hey, I've been using this tool called Cerebre Plus and honestly it's changed how I run my marketing.\n\n` +
      `It writes my Instagram captions, builds WhatsApp campaigns, creates full marketing strategies — all in seconds. ` +
      `It costs way less than a social media manager.\n\n` +
      `You can try it completely free for 30 days (no card needed). ` +
      `Here's my link: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }, [referralLink])

  // Derived stats
  const totalSent      = data?.total     ?? 0
  const totalConverted = data?.converted ?? 0
  const coinsEarned    = data?.coins_earned ?? 0
  const referrals      = data?.referrals ?? []

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 96, background: NAVY }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px clamp(16px,4%,32px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: '#fff' }}>
            Referral Programme
          </h1>
          <p style={{ fontSize: 13.5, color: MUTED, marginTop: 4, lineHeight: 1.6 }}>
            Share your personal link. When someone you refer subscribes, you both win — they get Cerebre Plus and you earn coins.
          </p>
        </div>

        {/* Reward banner */}
        <div style={{ marginBottom: 24, background: `${GOLD}10`, border: `1px solid ${GOLD}28`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 32 }}>🎁</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#EBF2FC', marginBottom: 4 }}>How the rewards work</p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: DIM }}>
                <strong style={{ color: GL }}>+{REWARDS.starter} coins</strong> when your referral joins Starter
              </span>
              <span style={{ fontSize: 13, color: DIM }}>
                <strong style={{ color: GL }}>+{REWARDS.growth} coins</strong> when your referral joins Growth
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: <Share2 className="h-4 w-4" />, label: 'Referrals sent',  value: totalSent,      c: DIM  },
            { icon: <Trophy className="h-4 w-4" />, label: 'Converted',        value: totalConverted, c: TEAL },
            { icon: <Coins  className="h-4 w-4" />, label: 'Coins earned',     value: coinsEarned,    c: GL   },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: s.c, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: 28, fontWeight: 900, color: s.c, lineHeight: 1 }}>
                {loading ? '—' : s.value.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
            Your personal referral link
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '11px 16px', minWidth: 200, overflow: 'hidden' }}>
              <span style={{ fontSize: 13, color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, fontFamily: 'monospace' }}>
                {loading ? '…' : referralLink}
              </span>
            </div>
            <button
              onClick={copy}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: copied ? `${TEAL}18` : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? TEAL + '30' : 'rgba(255,255,255,0.12)'}`, color: copied ? TEAL : '#EBF2FC', fontWeight: 700, fontSize: 13, padding: '11px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', whiteSpace: 'nowrap' }}
            >
              {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy link</>}
            </button>
            <button
              onClick={shareWA}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.28)', color: '#25D366', fontWeight: 700, fontSize: 13, padding: '11px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.533 5.851L.057 23.526a.5.5 0 0 0 .617.608l5.87-1.539A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.587-.5-5.084-1.374l-.36-.214-3.736.979.997-3.648-.235-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Share on WhatsApp
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: MUTED }}>
            Your code: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: GL }}>{referralCode}</span>
          </p>
        </div>

        {/* How it works */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>How it works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '01', t: 'Share your personal link',   d: 'Copy the link above or use the WhatsApp share button. It includes your unique referral code.' },
              { n: '02', t: 'They sign up and subscribe', d: `When they join and subscribe to Starter or Growth, you earn ${REWARDS.starter}–${REWARDS.growth} Cerebre Coins automatically.` },
              { n: '03', t: 'Coins land in your account', d: 'Your coins are credited within minutes of their payment clearing. Use them on any tool.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${GOLD}18`, border: `1px solid ${GOLD}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: GL, flexShrink: 0 }}>{s.n}</div>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EBF2FC', marginBottom: 3 }}>{s.t}</p>
                  <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral history */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#EBF2FC', marginBottom: 12 }}>Referral history</p>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: MUTED, fontSize: 13 }}>Loading…</div>
          ) : referrals.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
              <Users className="h-8 w-8 mx-auto mb-3" style={{ color: MUTED }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#EBF2FC', marginBottom: 6 }}>No referrals yet</p>
              <p style={{ fontSize: 13, color: MUTED }}>Share your link to get started. Your first referral earns you {REWARDS.starter}–{REWARDS.growth} coins.</p>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {['Date', 'Plan', 'Status'].map(h => (
                  <p key={h} style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{h}</p>
                ))}
              </div>
              {referrals.map((r: any, i: number) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', padding: '14px 18px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 13, color: '#EBF2FC', fontWeight: 600, marginBottom: 2 }}>
                      {r.email ? r.email.replace(/(.{3}).+(@.+)/, '$1…$2') : 'Anonymous'}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED }}>
                      {new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <p style={{ fontSize: 12.5, color: DIM, textTransform: 'capitalize' }}>{r.referred_plan || '—'}</p>
                  <Badge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
