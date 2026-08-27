'use client'
// /app/(dashboard)/sme-club/hot-seat/page.tsx
// Hot Seat Wednesday — apply to have your business diagnosed live.

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, CheckCircle, Clock } from 'lucide-react'

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

const STATUS_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  pending:   { label: 'Application received',    color: GOLD,  desc: 'We\'ll review your application and be in touch via WhatsApp.' },
  scheduled: { label: 'You\'re on the Hot Seat!', color: GREEN, desc: 'Check WhatsApp for the date and time. 100 coins + 200 points will be credited.' },
  done:      { label: 'Hot Seat completed',       color: TEAL,  desc: 'Thank you for being on the Hot Seat!' },
  declined:  { label: 'Not selected this time',   color: MUTED, desc: 'We\'ll keep your application on file. You can reapply next month.' },
}

export default function HotSeatPage() {
  const [application, setApplication] = useState<any>(null)
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')
  const [form, setForm] = useState({
    businessName:      '',
    biggestChallenge:  '',
    desiredOutcome:    '',
    availableDates:    '',
  })

  useEffect(() => {
    fetch('/api/club/hot-seat').then(r => r.json()).then(d => {
      setApplication(d.application)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!form.biggestChallenge.trim()) {
      setError('Please describe your biggest challenge')
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/club/hot-seat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setSubmitted(true)
      setApplication({ status: 'pending', biggest_challenge: form.biggestChallenge, created_at: new Date().toISOString() })
    } else {
      setError(data.error ?? 'Submission failed')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/sme-club" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTED, textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft size={14} /> SME Club
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: W, margin: 0 }}>The Hot Seat</h1>
        </div>
        <p style={{ fontSize: 14, color: DIM, maxWidth: 560, lineHeight: 1.7 }}>
          Every Wednesday, one business gets publicly diagnosed — strategy, marketing, messaging, pricing, all of it.
          You get sharp, unfiltered feedback from the Cerebre team and the whole community. Apply below.
        </p>
      </div>

      {/* What you get */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { icon: '🎯', label: '45-min live session', sub: 'Via Google Meet, recorded for the community' },
          { icon: '⊙', label: '100 free coins',       sub: 'Credited when you\'re scheduled' },
          { icon: '⭐', label: '200 points',          sub: 'Instant rank boost' },
        ].map(item => (
          <div key={item.label} style={{ background: N2, border: `1px solid ${B}`, borderRadius: 14, padding: '16px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>{item.icon}</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: W, margin: '0 0 3px' }}>{item.label}</p>
            <p style={{ fontSize: 11.5, color: MUTED, margin: 0 }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Existing application status */}
      {!loading && application ? (
        <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 28 }}>
          {(() => {
            const sc = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.pending
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <CheckCircle size={20} style={{ color: sc.color }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: sc.color }}>{sc.label}</span>
                </div>
                <p style={{ fontSize: 13.5, color: DIM, marginBottom: 16, lineHeight: 1.6 }}>{sc.desc}</p>
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${B}` }}>
                  <p style={{ fontSize: 12, color: MUTED, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Your challenge</p>
                  <p style={{ fontSize: 13.5, color: DIM, margin: 0, lineHeight: 1.6 }}>{application.biggest_challenge}</p>
                </div>
                {application.status === 'declined' && (
                  <p style={{ fontSize: 12.5, color: MUTED, marginTop: 14 }}>
                    You can{' '}
                    <button
                      onClick={() => { setApplication(null); setSubmitted(false) }}
                      style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, padding: 0 }}>
                      reapply
                    </button>
                    {' '}with an updated challenge.
                  </p>
                )}
              </>
            )
          })()}
        </div>
      ) : !loading ? (
        /* Application form */
        <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 28 }}>
          {submitted && (
            <div style={{ padding: '14px 16px', borderRadius: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}25`, marginBottom: 20 }}>
              <p style={{ fontSize: 13.5, color: GREEN, fontWeight: 700, margin: 0 }}>
                ✓ Application submitted! We'll be in touch via WhatsApp within a few days.
              </p>
            </div>
          )}

          {error && <p style={{ fontSize: 13, color: CORAL, marginBottom: 16 }}>{error}</p>}

          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 17, fontWeight: 700, color: W, margin: '0 0 20px' }}>
            Apply for the Hot Seat
          </h2>

          {[
            { key: 'businessName', label: 'Business name', placeholder: 'Your business name', required: false },
            { key: 'biggestChallenge', label: 'Your biggest business challenge *', placeholder: 'Be specific — e.g. "I get enquiries on WhatsApp but very few convert to paying customers. I think it\'s my pricing but I\'m not sure."', required: true, textarea: true },
            { key: 'desiredOutcome', label: 'What outcome do you want from the session?', placeholder: 'e.g. A clear messaging strategy that makes my pricing feel obvious, not expensive.', textarea: true },
            { key: 'availableDates', label: 'Available dates / times (optional)', placeholder: 'e.g. Weekday mornings, any Saturday afternoon' },
          ].map((field: any) => (
            <div key={field.key} style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>
                {field.label}
              </label>
              {field.textarea ? (
                <textarea
                  value={(form as any)[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, resize: 'none',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${B}`,
                    color: W, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                  }}
                />
              ) : (
                <input
                  value={(form as any)[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${B}`,
                    color: W, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg,#E84830,#FF6A4D)`,
              color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: submitting ? 0.7 : 1,
            }}>
            <Sparkles size={16} />
            {submitting ? 'Submitting…' : 'Apply for the Hot Seat 🔥'}
          </button>
        </div>
      ) : (
        <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 60, textAlign: 'center', opacity: 0.4 }} />
      )}
    </div>
  )
}
