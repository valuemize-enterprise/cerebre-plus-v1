'use client'
// /components/tools/SuggestionStrip.tsx
// Reusable pulsating suggestion strip for form fields.
// Drop this below any text/textarea input to show contextual suggestions.

import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'

const TEAL = '#12D4B4'

export interface SuggestionStripProps {
  /** Array of suggestion strings to display as chips */
  suggestions: string[]
  /** Optional label shown above the chips */
  label?: string
  /** Called when a chip is clicked — use this to fill the input */
  onSelect: (value: string) => void
  /** Control visibility from parent (e.g., hide when field has content) */
  visible?: boolean
}

export function SuggestionStrip({
  suggestions,
  label,
  onSelect,
  visible = true,
}: SuggestionStripProps) {
  const [appliedValue, setAppliedValue] = useState<string | null>(null)

  if (!visible || !suggestions || suggestions.length === 0) return null

  const handleClick = (s: string) => {
    onSelect(s)
    setAppliedValue(s)
    setTimeout(() => setAppliedValue(null), 1600)
  }

  return (
    <>
      <style>{`
        @keyframes stripPulse {
          0%, 100% {
            border-color: rgba(18, 212, 180, 0.18);
            box-shadow: 0 0 0 0 rgba(18, 212, 180, 0);
          }
          50% {
            border-color: rgba(18, 212, 180, 0.42);
            box-shadow: 0 0 0 4px rgba(18, 212, 180, 0.05);
          }
        }
        @keyframes stripFadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .suggestion-chip {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          background: rgba(18,212,180,0.08);
          border: 1px solid rgba(18,212,180,0.25);
          color: #12D4B4;
          font-family: inherit;
          line-height: 1.4;
          white-space: normal;
          text-align: left;
          max-width: 100%;
          word-break: break-word;
        }
        .suggestion-chip:hover {
          background: rgba(18,212,180,0.18);
          border-color: rgba(18,212,180,0.5);
        }
        .suggestion-chip.applied {
          background: rgba(34,197,94,0.14);
          border-color: rgba(34,197,94,0.4);
          color: #22C55E;
        }
      `}</style>

      <div style={{
        marginTop: 8,
        padding: '11px 13px',
        borderRadius: 11,
        border: '1px solid rgba(18,212,180,0.18)',
        background: 'rgba(18,212,180,0.03)',
        animation: 'stripPulse 3.2s ease-in-out infinite, stripFadeIn 0.3s ease',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginBottom: 9,
        }}>
          <Sparkles size={10} style={{ color: TEAL, flexShrink: 0 }} />
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: TEAL,
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
          }}>
            {label || 'Suggestions — tap to fill'}
          </span>
        </div>

        {/* Chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
        }}>
          {suggestions.map((s, i) => {
            const isApplied = appliedValue === s
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleClick(s)}
                className={`suggestion-chip${isApplied ? ' applied' : ''}`}
              >
                {isApplied ? '✓ Applied' : s}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── City quick-select (a distinct variant for location fields) ─
const NIGERIA_CITIES = [
  'Lagos','Abuja','Port Harcourt','Kano','Ibadan','Enugu',
  'Owerri','Benin City','Calabar','Warri','Akure','Asaba',
  'Uyo','Abeokuta','Ilorin','Jos','Kaduna','Zaria',
]

interface CitySuggestionsProps {
  currentValue: string
  onSelect: (city: string) => void
  visible?: boolean
}

export function CitySuggestions({ currentValue, onSelect, visible = true }: CitySuggestionsProps) {
  if (!visible) return null
  return (
    <>
      <style>{`
        @keyframes cityPulse {
          0%, 100% { border-color: rgba(245,184,48,0.18); }
          50%       { border-color: rgba(245,184,48,0.42); box-shadow: 0 0 0 4px rgba(245,184,48,0.04); }
        }
        .city-chip {
          padding: 4px 11px;
          border-radius: 16px;
          font-size: 11.5px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.14s;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(205,217,236,0.45);
          font-weight: 400;
        }
        .city-chip:hover, .city-chip.selected {
          background: rgba(245,184,48,0.15);
          border-color: rgba(245,184,48,0.45);
          color: #F5B830;
          font-weight: 700;
        }
      `}</style>
      <div style={{
        marginTop: 8,
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid rgba(245,184,48,0.18)',
        background: 'rgba(245,184,48,0.03)',
        animation: 'cityPulse 3.2s ease-in-out infinite',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:7 }}>
          <span style={{ fontSize:11 }}>📍</span>
          <span style={{ fontSize:10, fontWeight:700, color:'#F5B830', letterSpacing:'0.7px', textTransform:'uppercase' }}>
            Quick select a city
          </span>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
          {NIGERIA_CITIES.map(city => (
            <button
              key={city}
              type="button"
              onClick={() => onSelect(city)}
              className={`city-chip${currentValue === city ? ' selected' : ''}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
