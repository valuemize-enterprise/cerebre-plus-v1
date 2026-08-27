// /app/(marketing)/club/page.tsx — Public SME Club Landing Page
// URL: /club — no auth required
// Drives WhatsApp joins with source tracking. SEO-friendly.

import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SME Club — Free Community for Nigerian Business Owners | Cerebre Plus',
  description: 'Join hundreds of Nigerian business owners growing together. Weekly WhatsApp masterclasses, templates, wins, and the tools to make it happen.',
  openGraph: {
    title: 'SME Club — Nigerian Business Owners Community',
    description: 'Free weekly marketing education for Nigerian SMEs. Join on WhatsApp.',
    type: 'website',
  },
}

const WHATSAPP_LINK = process.env.NEXT_PUBLIC_SME_CLUB_WHATSAPP_LINK ?? 'https://chat.whatsapp.com/placeholder'

// ── Inline styles (no CSS files needed for marketing pages) ──
const S = {
  navy:  '#060C1A',
  navy2: '#0B1F3A',
  gold:  '#E09818',
  gl:    '#F5B830',
  teal:  '#12D4B4',
  w:     '#EBF2FC',
  dim:   'rgba(235,242,252,0.65)',
  muted: 'rgba(235,242,252,0.38)',
  b:     'rgba(255,255,255,0.08)',
  green: '#22C55E',
}

const WEEK = [
  { day: 'Monday',    icon: '💰', title: 'Monday Money Move',  desc: 'One action to grow your revenue — delivered as a 3-minute voice note on WhatsApp.' },
  { day: 'Tuesday',   icon: '🛠️', title: 'Tool Tuesday',       desc: 'We solve a real business problem live — showing exactly how to use a Cerebre tool.' },
  { day: 'Wednesday', icon: '🔥', title: 'Hot Seat',           desc: 'One member\'s business diagnosed publicly by the Cerebre team. Apply to be featured.' },
  { day: 'Thursday',  icon: '📄', title: 'Template Thursday',  desc: 'A professional template drops on the website — caption swipes, email frameworks, ad scripts.' },
  { day: 'Friday',    icon: '🏆', title: 'Win Friday',         desc: 'Members post their results. The wins pile up. Proof that this stuff works — publicly.' },
]

const BENEFITS = [
  { icon: '📱', title: 'Weekly WhatsApp Masterclasses', desc: 'Practical, Nigerian-market marketing education — not theory, not generic AI advice. Every week, one lesson that moves the needle.' },
  { icon: '👥', title: 'A Community That Actually Helps', desc: 'Business owners sharing wins, giving feedback, and holding each other accountable. The kind of network people pay ₦500K to join.' },
  { icon: '📄', title: 'Templates That Do the Work', desc: 'Every Thursday, a new swipe-worthy asset lands on the platform — ready to use, built for Nigerian audiences.' },
  { icon: '⊙', title: 'Coins for Participating', desc: 'Share a win, complete a challenge, or take the Hot Seat — earn Cerebre Coins automatically. Community participation that pays.' },
  { icon: '🎓', title: 'Session Library', desc: 'Every masterclass is recorded and uploaded. Miss a session? Catch up anytime. Your marketing education, on your schedule.' },
]

export default function ClubLandingPage() {
  return (
    <main style={{ background: S.navy, minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', color: S.w }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{ padding: '18px clamp(16px,5%,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.b}`, background: `${S.navy2}CC`, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 18, letterSpacing: '2px', color: S.w, textDecoration: 'none' }}>
          CEREBRE<span style={{ color: S.gl }}> +</span>
        </Link>
        <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: S.gl, textDecoration: 'none', padding: '8px 18px', borderRadius: 8, border: `1px solid ${S.gl}30`, background: `${S.gl}08` }}>
          Sign In →
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: 'clamp(48px,8vw,96px) clamp(16px,5%,48px)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: `${S.teal}15`, border: `1px solid ${S.teal}30`, marginBottom: 24, fontSize: 12.5, fontWeight: 700, color: S.teal, letterSpacing: '1px', textTransform: 'uppercase' as const }}>
          ✦ Free · No Credit Card · Always
        </div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(32px,5vw,58px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', maxWidth: 740, marginLeft: 'auto', marginRight: 'auto' }}>
          The community where Nigerian business owners{' '}
          <span style={{ color: S.gl }}>stop guessing and start growing.</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: S.dim, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 36px' }}>
          Weekly WhatsApp education, real wins from real businesses, and tools that actually work — all free, all for Nigerian SMEs.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`/api/club/join?source=hero&redirect=${encodeURIComponent(WHATSAPP_LINK)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 30px', borderRadius: 12,
              background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 16, textDecoration: 'none',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Join Free on WhatsApp
          </a>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 12,
            background: `${S.gl}10`, border: `1px solid ${S.gl}30`, color: S.gl, fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}>
            Sign Up for Cerebre Plus →
          </Link>
        </div>
        <p style={{ fontSize: 12, color: S.muted, marginTop: 16 }}>
          Already a member? <Link href="/sme-club" style={{ color: S.teal, fontWeight: 600, textDecoration: 'none' }}>Go to the club hub →</Link>
        </p>
      </section>

      {/* ── Weekly schedule ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,5%,48px)', borderTop: `1px solid ${S.b}`, background: S.navy2 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: S.teal, textTransform: 'uppercase' as const, letterSpacing: '2px', textAlign: 'center', marginBottom: 12 }}>THE WEEKLY RHYTHM</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, textAlign: 'center', margin: '0 0 12px' }}>
            Five days. Five drops. Every week.
          </h2>
          <p style={{ textAlign: 'center', fontSize: 15, color: S.dim, marginBottom: 40, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Predictability is the engine. You know what to expect every single day — and it's always worth showing up for.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {WEEK.map((w, i) => (
              <div key={w.day} style={{ background: S.navy, border: `1px solid ${S.b}`, borderRadius: 14, padding: '18px 16px' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{w.icon}</span>
                <p style={{ fontSize: 10, fontWeight: 700, color: S.muted, textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 4px' }}>{w.day}</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: S.w, margin: '0 0 6px' }}>{w.title}</p>
                <p style={{ fontSize: 12, color: S.dim, margin: 0, lineHeight: 1.5 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,5%,48px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: S.gold, textTransform: 'uppercase' as const, letterSpacing: '2px', textAlign: 'center', marginBottom: 12 }}>WHAT YOU GET</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, textAlign: 'center', margin: '0 0 40px' }}>
            Everything. Free. For every member.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {BENEFITS.map(b => (
              <div key={b.title} style={{ background: S.navy2, border: `1px solid ${S.b}`, borderRadius: 14, padding: '20px 20px' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{b.icon}</span>
                <p style={{ fontSize: 15, fontWeight: 700, color: S.w, margin: '0 0 8px' }}>{b.title}</p>
                <p style={{ fontSize: 13, color: S.dim, margin: 0, lineHeight: 1.65 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px,8vw,96px) clamp(16px,5%,48px)', textAlign: 'center', background: S.navy2, borderTop: `1px solid ${S.b}` }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, margin: '0 0 16px' }}>
          Ready to grow with the community?
        </h2>
        <p style={{ fontSize: 16, color: S.dim, margin: '0 auto 32px', maxWidth: 500, lineHeight: 1.7 }}>
          It's free. Always has been. Always will be for founding members.
        </p>
        <a
          href={`/api/club/join?source=footer&redirect=${encodeURIComponent(WHATSAPP_LINK)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 12,
            background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 17, textDecoration: 'none',
          }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Join the SME Club — Free
        </a>
        <p style={{ fontSize: 12.5, color: S.muted, marginTop: 16 }}>
          Already signed up? <Link href="/sme-club" style={{ color: S.teal, textDecoration: 'none', fontWeight: 600 }}>Go to your club hub →</Link>
        </p>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ padding: '20px clamp(16px,5%,48px)', borderTop: `1px solid ${S.b}`, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
          © 2026 Cerebre Media Africa · Lagos, Nigeria ·{' '}
          <Link href="/privacy" style={{ color: S.muted, textDecoration: 'none' }}>Privacy</Link>
          {' '}·{' '}
          <Link href="/terms" style={{ color: S.muted, textDecoration: 'none' }}>Terms</Link>
        </p>
      </footer>
    </main>
  )
}
