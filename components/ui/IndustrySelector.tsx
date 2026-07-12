'use client'
// ═══════════════════════════════════════════════════════════════
// /components/ui/IndustrySelector.tsx
//
// Searchable industry picker used in onboarding and profile.
// Features:
//   • Real-time search across industry labels AND keywords
//   • Industries grouped by category with emoji category headers
//   • Selected state with checkmark and gold highlight
//   • "Suggestions now personalised" confirmation strip
//   • Keyboard accessible (Enter to select, Escape to close)
//   • Mobile-first: works in a scrollable inline panel
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { INDUSTRY_CATEGORIES, INDUSTRY_LABEL_MAP, type Industry } from '@/lib/tools/industries'

// ── Tokens ─────────────────────────────────────────────────────
const T = {
  navy:   '#0B1F3A',
  card:   '#0D2040',
  gold:   '#E09818',
  gl:     '#F5B830',
  teal:   '#12D4B4',
  w:      '#EBF2FC',
  dim:    'rgba(205,217,236,.72)',
  muted:  'rgba(205,217,236,.38)',
  faint:  'rgba(255,255,255,.04)',
  bdr:    'rgba(255,255,255,.08)',
  bdrFocus: 'rgba(18,212,180,.5)',
}

interface IndustrySelectorProps {
  value:        string
  onChange:     (value: string) => void
  onBlur?:      () => void
  placeholder?: string
  required?:    boolean
  error?:       string
}

export function IndustrySelector({
  value, onChange, onBlur, placeholder = 'Select your industry…',
  required, error,
}: IndustrySelectorProps) {
  const [isOpen,  setIsOpen]  = useState(false)
  const [query,   setQuery]   = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)

  const selectedLabel = value ? INDUSTRY_LABEL_MAP[value] : null
  const selectedEmoji = value
    ? INDUSTRY_CATEGORIES.flatMap(c => c.industries).find(i => i.value === value)?.emoji
    : null

  // Filter industries by search query
  const filteredCategories = useMemo(() => {
    if (!query.trim()) return INDUSTRY_CATEGORIES

    const q = query.toLowerCase().trim()
    return INDUSTRY_CATEGORIES
      .map(cat => ({
        ...cat,
        industries: cat.industries.filter(ind =>
          ind.label.toLowerCase().includes(q) ||
          ind.keywords.some(k => k.toLowerCase().includes(q)) ||
          cat.label.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.industries.length > 0)
  }, [query])

  const totalVisible = filteredCategories.reduce((a, c) => a + c.industries.length, 0)

  // Focus search when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 80)
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onBlur])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) { setIsOpen(false); onBlur?.() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onBlur])

  const select = useCallback((industryValue: string) => {
    onChange(industryValue)
    setIsOpen(false)
    setQuery('')
    onBlur?.()
  }, [onChange, onBlur])

  const clear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }, [onChange])

  return (
    <div ref={panelRef} style={{ position: 'relative', width: '100%' }}>
      <style>{`
        .ind-item:hover { background: rgba(255,255,255,.07) !important; }
        .ind-item:focus { outline: none; background: rgba(18,212,180,.08) !important; }
        .ind-panel::-webkit-scrollbar { width: 3px }
        .ind-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 10px }
        .ind-panel::-webkit-scrollbar-track { background: transparent }
        @keyframes ind-fade { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 14px', fontSize: 14, fontFamily: 'inherit',
          background: isOpen ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.06)',
          border: `1.5px solid ${error ? '#E55252' : isOpen ? T.bdrFocus : T.bdr}`,
          borderRadius: 11, color: selectedLabel ? T.w : T.muted,
          cursor: 'pointer', textAlign: 'left', transition: 'all .18s',
          boxSizing: 'border-box',
        }}
      >
        {selectedEmoji && <span style={{ fontSize: 16, flexShrink: 0 }}>{selectedEmoji}</span>}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel || placeholder}
        </span>
        {value && (
          <span onClick={clear} style={{ padding: '2px 4px', cursor: 'pointer', color: T.muted, flexShrink: 0 }} title="Clear">
            <X size={13}/>
          </span>
        )}
        {isOpen
          ? <ChevronUp  size={16} style={{ color: T.muted, flexShrink: 0 }}/>
          : <ChevronDown size={16} style={{ color: T.muted, flexShrink: 0 }}/>
        }
      </button>

      {/* Validation error */}
      {error && (
        <p style={{ fontSize: 11.5, color: '#E55252', margin: '4px 0 0', paddingLeft: 4 }}>{error}</p>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          zIndex: 200, background: T.card,
          border: `1.5px solid ${T.bdrFocus}`,
          borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,.5)',
          animation: 'ind-fade .18s ease',
          overflow: 'hidden',
        }}>
          {/* Search input */}
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${T.bdr}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={14} style={{ color: T.muted, flexShrink: 0 }}/>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search industries… (e.g. fashion, food, tech, farm)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13.5, color: T.w, fontFamily: 'inherit',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: '2px' }}>
                <X size={12}/>
              </button>
            )}
          </div>

          {/* Count */}
          {query && (
            <div style={{ padding: '5px 14px', background: 'rgba(18,212,180,.04)', borderBottom: `1px solid ${T.bdr}` }}>
              <span style={{ fontSize: 11, color: T.teal }}>
                {totalVisible === 0 ? 'No industries match your search' : `${totalVisible} industr${totalVisible === 1 ? 'y' : 'ies'} found`}
              </span>
            </div>
          )}

          {/* Industry list */}
          <div className="ind-panel" style={{ maxHeight: 340, overflowY: 'auto', padding: '6px 0' }}>
            {filteredCategories.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
                No results for "{query}" — try different words
              </div>
            ) : (
              filteredCategories.map(cat => (
                <div key={cat.id}>
                  {/* Category header */}
                  <div style={{
                    padding: '8px 14px 4px',
                    fontSize: 10.5, fontWeight: 700, color: T.muted,
                    letterSpacing: '1.2px', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 5,
                    borderTop: `1px solid ${T.bdr}`,
                    marginTop: 4,
                  }}>
                    <span>{cat.emoji}</span> {cat.label}
                  </div>
                  {/* Industry options */}
                  {cat.industries.map(ind => {
                    const isSelected = value === ind.value
                    return (
                      <button
                        key={ind.value}
                        type="button"
                        className="ind-item"
                        onClick={() => select(ind.value)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 14px', background: isSelected ? 'rgba(18,212,180,.1)' : 'transparent',
                          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          textAlign: 'left', transition: 'background .12s',
                        }}
                      >
                        <span style={{ fontSize: 15, flexShrink: 0, width: 22, textAlign: 'center' }}>{ind.emoji}</span>
                        <span style={{
                          fontSize: 13.5, color: isSelected ? T.teal : T.dim,
                          fontWeight: isSelected ? 700 : 400, flex: 1, lineHeight: 1.4,
                        }}>
                          {ind.label}
                        </span>
                        {isSelected && <Check size={14} style={{ color: T.teal, flexShrink: 0 }}/>}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div style={{ padding: '8px 14px', borderTop: `1px solid ${T.bdr}`, background: 'rgba(255,255,255,.02)' }}>
            <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
              {INDUSTRY_CATEGORIES.flatMap(c => c.industries).length} industries across 17 categories · Can't find yours? Pick the closest match
            </p>
          </div>
        </div>
      )}

      {/* Personalisation confirmation */}
      {value && !isOpen && (
        <div style={{
          marginTop: 8, padding: '7px 12px',
          background: 'rgba(18,212,180,.07)', border: '1px solid rgba(18,212,180,.22)',
          borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Check size={12} style={{ color: T.teal, flexShrink: 0 }}/>
          <p style={{ fontSize: 12, color: T.teal, margin: 0 }}>
            Suggestions now personalised for <strong>{selectedLabel}</strong> businesses
          </p>
        </div>
      )}
    </div>
  )
}
