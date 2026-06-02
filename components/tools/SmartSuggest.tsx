'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/SmartSuggest.tsx
//
// Drop-in AI suggestion component for any text or textarea field
// across all 40 Cerebre Plus tools.
//
// USAGE (in any tool form):
//   <SmartSuggest
//     toolId="caption-craft"
//     toolName="CaptionCraft AI"
//     fieldKey="product_service"
//     fieldLabel="Product / Service"
//     formState={currentFormValues}
//     onSelect={(value) => setFormValue('product_service', value)}
//   />
//
// FEATURES:
//   • Fetches 3–4 AI suggestions from /api/suggest
//   • Free — no coin deduction
//   • Cached 30 min: same context = instant second load
//   • Rate limited server-side: 30 calls/user/hour
//   • Suggestions shown as clickable chips
//   • "↺ New ideas" to refresh
//   • Graceful error handling
//   • Matches Cerebre Plus dark navy + gold design system
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef } from 'react'
import { Lightbulb, RefreshCw, X } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface SmartSuggestProps {
  /** Tool ID from the registry, e.g. 'caption-craft' */
  toolId:       string
  /** Human-readable tool name, e.g. 'CaptionCraft AI' */
  toolName:     string
  /** The form field key, e.g. 'product_service' */
  fieldKey:     string
  /** Human-readable field label shown to user */
  fieldLabel:   string
  /** Current state of the entire form (used for context) */
  formState:    Record<string, any>
  /** Called with the chosen suggestion text */
  onSelect:     (value: string) => void
  /** Override default trigger label */
  triggerLabel?: string
}

// ─────────────────────────────────────────────────────────────
// COLOURS  (matches Cerebre Plus design tokens)
// ─────────────────────────────────────────────────────────────

const GOLD     = '#E09818'
const GOLD_L   = '#F5B830'
const GOLD_DIM = 'rgba(224,152,24,0.12)'
const GOLD_BDR = 'rgba(224,152,24,0.28)'
const TEAL     = '#12D4B4'
const NAVY     = '#0B1F3A'
const TEXT     = 'rgba(205,217,236,0.72)'
const MUTED    = 'rgba(205,217,236,0.45)'
const BG_CHIP  = 'rgba(255,255,255,0.05)'
const BDR_CHIP = 'rgba(255,255,255,0.1)'

// ─────────────────────────────────────────────────────────────
// LOADING DOTS
// ─────────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display:     'inline-block',
            width:       5,
            height:      5,
            borderRadius: '50%',
            background:  GOLD_L,
            animation:   `ss-bounce 1s ease ${i * 0.18}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ss-bounce {
          0%,60%,100% { transform: translateY(0); opacity:.4; }
          30%          { transform: translateY(-5px); opacity:1; }
        }
        @keyframes ss-fade-in {
          from { opacity:0; transform: translateY(6px); }
          to   { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// SUGGESTION CHIP
// ─────────────────────────────────────────────────────────────

function Chip({ text, onClick }: { text: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={text}
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           6,
        background:    hovered ? GOLD_DIM : BG_CHIP,
        border:        `1px solid ${hovered ? GOLD_BDR : BDR_CHIP}`,
        borderRadius:  30,
        padding:       '7px 14px',
        fontSize:      12.5,
        fontWeight:    500,
        color:         hovered ? GOLD_L : TEXT,
        cursor:        'pointer',
        textAlign:     'left',
        lineHeight:    1.4,
        transition:    'all .18s',
        fontFamily:    'inherit',
        maxWidth:      '100%',
        wordBreak:     'break-word',
      }}
    >
      {hovered && (
        <span style={{ fontSize: 11, color: GOLD, flexShrink: 0 }}>✓</span>
      )}
      <span style={{
        display:          '-webkit-box',
        WebkitLineClamp:  2,
        WebkitBoxOrient:  'vertical',
        overflow:         'hidden',
      }}>
        {text}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function SmartSuggest({
  toolId, toolName, fieldKey, fieldLabel,
  formState, onSelect, triggerLabel,
}: SmartSuggestProps) {

  const [state,        setState]        = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [suggestions,  setSuggestions]  = useState<string[]>([])
  const [errorMsg,     setErrorMsg]     = useState('')
  const [dismissedIdx, setDismissedIdx] = useState<Set<number>>(new Set())
  const abortRef = useRef<AbortController | null>(null)

  const fetch_ = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState('loading')
    setSuggestions([])
    setDismissedIdx(new Set())
    setErrorMsg('')

    try {
      const res = await fetch('/api/suggest', {
        method:  'POST',
        signal:  ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          toolId, toolName, fieldKey, fieldLabel,
          formState: Object.fromEntries(
            // Pass other form fields as context, excluding the current field
            Object.entries(formState).filter(([k, v]) => k !== fieldKey && v)
          ),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Could not generate suggestions')
      }

      const { suggestions: suggs } = await res.json()
      setSuggestions(suggs)
      setState('ready')
    } catch (e: any) {
      if (e.name === 'AbortError') return
      setErrorMsg(e.message || 'Something went wrong. Please try again.')
      setState('error')
    }
  }, [toolId, toolName, fieldKey, fieldLabel, formState])

  const handleSelect = (text: string) => {
    onSelect(text)
    setState('idle')
    setSuggestions([])
  }

  const handleDismiss = (idx: number) => {
    setDismissedIdx(prev => new Set([...prev, idx]))
  }

  const visibleSuggestions = suggestions.filter((_, i) => !dismissedIdx.has(i))

  // ── Trigger button ───────────────────────────────────────
  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={fetch_}
        style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          6,
          background:   'none',
          border:       'none',
          cursor:       'pointer',
          color:        MUTED,
          fontSize:     12,
          fontWeight:   600,
          fontFamily:   'inherit',
          padding:      '4px 0',
          marginTop:    5,
          transition:   'color .18s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
        title={`Get AI suggestions for ${fieldLabel}`}
      >
        <Lightbulb size={13} />
        {triggerLabel ?? 'Suggest ideas'}
      </button>
    )
  }

  // ── Loading ──────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, color: MUTED, fontSize: 12 }}>
        <LoadingDots />
        <span style={{ fontSize: 11, color: MUTED }}>Thinking about your {fieldLabel.toLowerCase()}…</span>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: 'rgba(232,72,48,0.8)' }}>⚠ {errorMsg}</span>
        <button
          type="button"
          onClick={fetch_}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    )
  }

  // ── Ready — show chips ───────────────────────────────────
  return (
    <div
      style={{
        marginTop:  8,
        padding:    '12px 14px',
        background: GOLD_DIM,
        border:     `1px solid ${GOLD_BDR}`,
        borderRadius: 12,
        animation:  'ss-fade-in .22s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '1px', textTransform: 'uppercase' }}>
          <Lightbulb size={11} /> AI suggestions
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={fetch_}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 11, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
            title="Get different suggestions"
          >
            <RefreshCw size={10} /> New ideas
          </button>
          <button
            type="button"
            onClick={() => { setState('idle'); setSuggestions([]) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontFamily: 'inherit', display: 'flex', alignItems: 'center', lineHeight: 1 }}
            title="Close suggestions"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Chips */}
      {visibleSuggestions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {suggestions.map((text, i) =>
            dismissedIdx.has(i) ? null : (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <Chip text={text} onClick={() => handleSelect(text)} />
                <button
                  type="button"
                  onClick={() => handleDismiss(i)}
                  title="Remove this suggestion"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, opacity: .5, padding: '4px 0', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                >
                  <X size={11} />
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        // All dismissed
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: MUTED }}>No more suggestions.</span>
          <button
            type="button"
            onClick={fetch_}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={11} /> Generate more
          </button>
        </div>
      )}

      {/* Footer hint */}
      <p style={{ fontSize: 10.5, color: MUTED, marginTop: 10 }}>
        Click any suggestion to fill the field · <span style={{ color: `${GOLD}88` }}>Free — no coins used</span>
      </p>
    </div>
  )
}

export default SmartSuggest
