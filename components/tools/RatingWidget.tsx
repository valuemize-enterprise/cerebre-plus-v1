'use client'
/**
 * /components/tools/RatingWidget.tsx
 *
 * Universal feedback widget used on ALL tools — text, design, WhatsApp, strategy.
 *
 * Flow:
 *   IDLE  → shows "Rate this output" prompt
 *   QUICK → thumbs up / thumbs down
 *   TAGS  → quick-select feedback tags
 *   TEXT  → optional typed comment (shown after thumbs down)
 *   DONE  → thank-you state
 *
 * Usage:
 *   <RatingWidget toolId="caption-craft" toolCategory="text" coinsSpent={15}/>
 *   <RatingWidget toolId="social-post-designer" toolCategory="design" engine="premium" coinsSpent={15} variantCount={2}/>
 */

import React, { useState, useCallback } from 'react'
import { ThumbsUp, ThumbsDown, Star, Send, X, ChevronDown } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const NAVY  = '#0B1F3A'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const GREEN = '#22C55E'
const RED   = '#EF4444'
const DIM   = 'rgba(205,217,236,0.65)'
const MUTED = 'rgba(205,217,236,0.35)'
const BDR   = 'rgba(255,255,255,0.09)'
const FAINT = 'rgba(255,255,255,0.055)'

// ── Feedback tags ─────────────────────────────────────────────
const POSITIVE_TAGS: Array<{ key: string; label: string; emoji: string }> = [
  { key: 'used_as_is',          label: 'Used it as-is',        emoji: '✅' },
  { key: 'nailed_voice',        label: 'Nailed my brand voice', emoji: '🗣️' },
  { key: 'saved_time',          label: 'Saved me time',         emoji: '⏱️' },
  { key: 'exactly_what_needed', label: 'Exactly what I needed', emoji: '🎯' },
  { key: 'better_than_expected',label: 'Better than expected',  emoji: '🚀' },
  { key: 'gave_new_ideas',      label: 'Gave me new ideas',     emoji: '💡' },
]

const NEGATIVE_TAGS: Array<{ key: string; label: string; emoji: string }> = [
  { key: 'too_generic',         label: 'Too generic',           emoji: '📋' },
  { key: 'wrong_tone',          label: 'Wrong tone',            emoji: '📢' },
  { key: 'wrong_industry_feel', label: 'Wrong industry feel',   emoji: '🏭' },
  { key: 'too_much_editing',    label: 'Too much editing needed',emoji: '✏️' },
  { key: 'too_long',            label: 'Too long',              emoji: '📏' },
  { key: 'too_short',           label: 'Too short',             emoji: '📏' },
  { key: 'missed_brief',        label: 'Missed the brief',      emoji: '🔄' },
  { key: 'not_worth_coins',     label: 'Not worth the coins',   emoji: '💰' },
]

const DESIGN_NEGATIVE_TAGS: Array<{ key: string; label: string; emoji: string }> = [
  { key: 'poor_visual',         label: 'Poor visual quality',   emoji: '🎨' },
  { key: 'colors_off',          label: 'Colors not on-brand',   emoji: '🎨' },
  ...NEGATIVE_TAGS,
]

// ── Types ──────────────────────────────────────────────────────
type RatingState = 'idle' | 'quick' | 'tags' | 'text' | 'done'

export interface RatingWidgetProps {
  toolId:          string
  toolCategory?:   'text' | 'design' | 'whatsapp' | 'strategy' | 'calendar' | 'sequence'
  generationId?:   string
  coinsSpent?:     number
  engine?:         'standard' | 'premium'
  variantCount?:   number   // for design tools — enables "which did you prefer?"
  hadBrandProfile?:boolean
  compact?:        boolean  // smaller layout for inline use
  onRated?:        (thumbs: 'up' | 'down', stars?: number) => void
}

export function RatingWidget({
  toolId, toolCategory = 'text', generationId,
  coinsSpent, engine, variantCount, hadBrandProfile = false,
  compact = false, onRated,
}: RatingWidgetProps) {
  const [state,           setState]           = useState<RatingState>('idle')
  const [thumbs,          setThumbs]          = useState<'up' | 'down' | null>(null)
  const [stars,           setStars]           = useState<number>(0)
  const [hoveredStar,     setHoveredStar]     = useState<number>(0)
  const [selectedTags,    setSelectedTags]    = useState<string[]>([])
  const [feedbackText,    setFeedbackText]    = useState('')
  const [preferredVariant,setPreferredVariant]= useState<number | null>(null)
  const [submitting,      setSubmitting]      = useState(false)
  const [showFull,        setShowFull]        = useState(false)

  const isDesign = toolCategory === 'design'
  const tags     = isDesign
    ? (thumbs === 'up' ? POSITIVE_TAGS : DESIGN_NEGATIVE_TAGS)
    : (thumbs === 'up' ? POSITIVE_TAGS : NEGATIVE_TAGS)

  const toggleTag = (key: string) => {
    setSelectedTags(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    )
  }

  const handleThumb = (t: 'up' | 'down') => {
    setThumbs(t)
    setState('tags')
    onRated?.(t)
  }

  const submit = useCallback(async () => {
    setSubmitting(true)
    try {
      await fetch('/api/ratings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId, toolCategory, generationId,
          thumbs,
          stars:            stars || undefined,
          feedbackTags:     selectedTags,
          feedbackText:     feedbackText.trim() || undefined,
          preferredVariant: preferredVariant || undefined,
          engine, coinsSpent, hadBrandProfile,
        }),
      })
    } catch { /* silent — don't break UX on rating failure */ }
    setSubmitting(false)
    setState('done')
  }, [toolId, toolCategory, generationId, thumbs, stars, selectedTags, feedbackText, preferredVariant, engine, coinsSpent, hadBrandProfile])

  // ── DONE state ───────────────────────────────────────────────
  if (state === 'done') {
    return (
      <div style={{ padding: compact ? '8px 14px' : '12px 16px', background: thumbs === 'up' ? 'rgba(34,197,94,0.08)' : 'rgba(18,212,180,0.06)', border: `1px solid ${thumbs === 'up' ? 'rgba(34,197,94,0.25)' : 'rgba(18,212,180,0.2)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15 }}>{thumbs === 'up' ? '🙏' : '💪'}</span>
        <div>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: thumbs === 'up' ? GREEN : TEAL, margin: 0 }}>
            {thumbs === 'up' ? 'Thank you! We\'re glad it worked.' : 'Thanks for the feedback — we\'ll use it to improve.'}
          </p>
          {selectedTags.length > 0 && (
            <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0' }}>
              {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} submitted
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── IDLE state ───────────────────────────────────────────────
  if (state === 'idle') {
    if (compact) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: MUTED }}>Rate output:</span>
          <button onClick={() => handleThumb('up')} style={thumbBtn(false)}>👍</button>
          <button onClick={() => handleThumb('down')} style={thumbBtn(false)}>👎</button>
        </div>
      )
    }
    return (
      <div style={{ padding: '10px 16px', background: FAINT, border: `1px solid ${BDR}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 12.5, color: MUTED, margin: 0 }}>Was this output useful for your business?</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => handleThumb('up')} style={{ ...thumbBtn(false), display: 'flex', alignItems: 'center', gap: 5 }}>
            <ThumbsUp size={13}/> Yes
          </button>
          <button onClick={() => handleThumb('down')} style={{ ...thumbBtn(false), background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ThumbsDown size={13}/> Needs work
          </button>
        </div>
      </div>
    )
  }

  // ── QUICK → already handled inline above ─────────────────────

  // ── TAGS + TEXT + VARIANT state ───────────────────────────────
  return (
    <div style={{
      background: thumbs === 'up' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
      border:     `1px solid ${thumbs === 'up' ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}`,
      borderLeft: `3px solid ${thumbs === 'up' ? GREEN : RED}`,
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{thumbs === 'up' ? '👍' : '👎'}</span>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: thumbs === 'up' ? GREEN : '#FCA5A5', margin: 0 }}>
            {thumbs === 'up' ? 'Great! What made it work?' : 'Thanks — what went wrong?'}
          </p>
        </div>
        <button onClick={submit} disabled={submitting} style={{ fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Skip
        </button>
      </div>

      {/* Variant preference (design tools only) */}
      {isDesign && variantCount && variantCount > 1 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
            Which variant did you prefer?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: variantCount }, (_, i) => (
              <button key={i} onClick={() => setPreferredVariant(i + 1)} style={{
                padding: '6px 16px', borderRadius: 20, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                background: preferredVariant === i + 1 ? `${GL}20` : FAINT,
                border: `1.5px solid ${preferredVariant === i + 1 ? GL + '50' : BDR}`,
                color: preferredVariant === i + 1 ? GL : MUTED,
              }}>
                Variant {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick tags */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
          Select all that apply
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {tags.map(tag => (
            <button key={tag.key} onClick={() => toggleTag(tag.key)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 20, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
              background: selectedTags.includes(tag.key)
                ? (thumbs === 'up' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)')
                : FAINT,
              border: `1.5px solid ${selectedTags.includes(tag.key)
                ? (thumbs === 'up' ? 'rgba(34,197,94,0.45)' : 'rgba(239,68,68,0.45)')
                : BDR}`,
              color: selectedTags.includes(tag.key)
                ? (thumbs === 'up' ? GREEN : '#FCA5A5')
                : MUTED,
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 13 }}>{tag.emoji}</span>{tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Star rating (thumbs down only) */}
      {thumbs === 'down' && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
            Overall rating
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n}
                onClick={() => setStars(n)}
                onMouseEnter={() => setHoveredStar(n)}
                onMouseLeave={() => setHoveredStar(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: n <= (hoveredStar || stars) ? GL : BDR, transition: 'color .1s' }}
              >
                <Star size={22} fill={n <= (hoveredStar || stars) ? GL : 'none'} strokeWidth={1.5}/>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional text */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
          Tell us more <span style={{ fontWeight: 400 }}>(optional)</span>
        </p>
        <textarea
          value={feedbackText}
          onChange={e => setFeedbackText(e.target.value)}
          placeholder={thumbs === 'up'
            ? 'What worked particularly well for your business?'
            : 'What would have made this output better for your industry?'
          }
          rows={2}
          maxLength={500}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${BDR}`, borderRadius: 10,
            padding: '9px 12px', color: DIM, fontSize: 13,
            fontFamily: 'inherit', resize: 'none', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {feedbackText.length > 0 && (
          <p style={{ fontSize: 10, color: MUTED, margin: '3px 0 0', textAlign: 'right' }}>{feedbackText.length}/500</p>
        )}
      </div>

      {/* Submit */}
      <button onClick={submit} disabled={submitting} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '11px', borderRadius: 10, fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
        background: thumbs === 'up' ? 'rgba(34,197,94,0.18)' : 'rgba(18,212,180,0.18)',
        border: `1px solid ${thumbs === 'up' ? 'rgba(34,197,94,0.4)' : 'rgba(18,212,180,0.4)'}`,
        color: thumbs === 'up' ? GREEN : TEAL,
        cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all .2s',
        opacity: submitting ? 0.6 : 1,
      }}>
        <Send size={13}/>
        {submitting ? 'Submitting…' : 'Submit feedback'}
      </button>
    </div>
  )
}

// ── Thumb button style ────────────────────────────────────────
function thumbBtn(active: boolean): React.CSSProperties {
  return {
    padding: '5px 14px', borderRadius: 20, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
    background: active ? `${GL}20` : 'rgba(255,255,255,0.06)',
    border: `1px solid ${active ? GL + '40' : 'rgba(255,255,255,0.09)'}`,
    color: active ? GL : 'rgba(205,217,236,0.5)',
    cursor: 'pointer', transition: 'all .15s',
  }
}
