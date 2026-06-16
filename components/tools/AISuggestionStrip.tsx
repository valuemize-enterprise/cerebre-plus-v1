'use client'
// /components/tools/AISuggestionStrip.tsx
// AI-powered suggestion strip — generates hyper-personalised field suggestions
// by calling /api/tools/ai-suggestions with the user's profile and current form state.
// Feels like a senior marketing expert finishing the user's sentence.

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Sparkles, RefreshCw, Check, Brain } from 'lucide-react'

const TEAL = '#12D4B4'
const GL   = '#F5B830'
const MUTED= 'rgba(205,217,236,0.38)'
const B    = 'rgba(255,255,255,0.08)'
const FAINT= 'rgba(255,255,255,0.04)'

// Which field semantics get AI suggestions (vs static)
export const AI_ELIGIBLE_SEMANTICS = new Set([
  'content_topic',
  'product_service',
  'usp_differentiator',
  'business_situation',
  'offer_deal',
  'social_proof',
  'competitor',
  'brand_perception',
  'key_message',
  'objection',
  'winning',
])

interface AISuggestionStripProps {
  fieldId:        string
  fieldLabel:     string
  fieldSemantic:  string
  toolId:         string
  toolName:       string
  existingInputs: Record<string, string>  // other fields already filled in the form
  onSelect:       (value: string) => void
  visible:        boolean                 // hide when field has substantial content
  autoLoad?:      boolean                 // load suggestions on mount (default true)
}

export function AISuggestionStrip({
  fieldId, fieldLabel, fieldSemantic, toolId, toolName,
  existingInputs, onSelect, visible, autoLoad = true,
}: AISuggestionStripProps) {
  const [suggestions, setSuggestions]  = useState<string[]>([])
  const [loading,     setLoading]      = useState(false)
  const [error,       setError]        = useState(false)
  const [appliedIdx,  setAppliedIdx]   = useState<number | null>(null)
  const [businessName,setBusinessName] = useState('')
  const hasFetched = useRef(false)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const res = await fetch('/api/tools/ai-suggestions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId, fieldLabel, fieldSemantic, toolId, toolName, existingInputs,
        }),
      })
      const data = await res.json()
      if (data.suggestions?.length) {
        setSuggestions(data.suggestions)
        if (data.businessName) setBusinessName(data.businessName)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [fieldId, fieldLabel, fieldSemantic, toolId, toolName, JSON.stringify(existingInputs)])

  useEffect(() => {
    if (autoLoad && visible && !hasFetched.current) {
      hasFetched.current = true
      fetchSuggestions()
    }
  }, [visible, autoLoad, fetchSuggestions])

  const handleSelect = (s: string, i: number) => {
    onSelect(s)
    setAppliedIdx(i)
    setTimeout(() => setAppliedIdx(null), 1800)
  }

  const handleRefresh = () => {
    hasFetched.current = false
    setSuggestions([])
    fetchSuggestions()
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes aiPulse {
          0%,100% { border-color:rgba(18,212,180,0.18); box-shadow:0 0 0 0 rgba(18,212,180,0); }
          50%      { border-color:rgba(18,212,180,0.42); box-shadow:0 0 0 4px rgba(18,212,180,0.05); }
        }
        @keyframes aiShimmer {
          0%,100% { opacity:.35; }
          50%      { opacity:.7; }
        }
        @keyframes aiSpin { to { transform:rotate(360deg) } }
        .ai-chip {
          display:inline-flex; align-items:flex-start; gap:6px;
          padding:7px 13px; border-radius:10px;
          font-size:12.5px; line-height:1.5;
          cursor:pointer; transition:all .15s;
          background:rgba(18,212,180,0.07);
          border:1px solid rgba(18,212,180,0.22);
          color:rgba(205,217,236,0.8);
          font-family:inherit; text-align:left;
          white-space:normal; word-break:break-word;
        }
        .ai-chip:hover { background:rgba(18,212,180,0.15); border-color:rgba(18,212,180,0.45); color:#EBF2FC; }
        .ai-chip.applied { background:rgba(34,197,94,0.12); border-color:rgba(34,197,94,0.35); color:#22C55E; }
        .ai-chip-shimmer {
          height:38px; border-radius:10px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.07);
          animation:aiShimmer 1.4s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        marginTop:9, padding:'11px 13px',
        borderRadius:12, border:'1px solid rgba(18,212,180,0.18)',
        background:'rgba(18,212,180,0.025)',
        animation:'aiPulse 3.5s ease-in-out infinite',
      }}>
        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Brain size={11} style={{ color:TEAL, flexShrink:0 }}/>
            <span style={{ fontSize:10, fontWeight:700, color:TEAL, letterSpacing:'0.7px', textTransform:'uppercase' }}>
              {loading
                ? 'Generating ideas for your brand…'
                : error
                  ? 'Suggestions unavailable'
                  : businessName
                    ? `Ideas for ${businessName}`
                    : 'AI-powered for your brand'
              }
            </span>
          </div>

          {!loading && (suggestions.length > 0 || error) && (
            <button
              onClick={handleRefresh}
              title="Generate different ideas"
              style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, padding:'2px 4px', lineHeight:0, display:'flex', alignItems:'center', gap:4 }}
            >
              <RefreshCw size={11} style={{ color:MUTED }}/>
              <span style={{ fontSize:10, color:MUTED }}>Refresh</span>
            </button>
          )}
        </div>

        {/* Loading state — shimmer chips */}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[85, 70, 90].map((w, i) => (
              <div key={i} className="ai-chip-shimmer" style={{ width:`${w}%`, animationDelay:`${i*0.18}s` }}/>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <p style={{ fontSize:12, color:MUTED, margin:0, fontStyle:'italic' }}>
            Could not generate suggestions right now. Complete your profile for better ideas.
          </p>
        )}

        {/* Suggestions */}
        {!loading && !error && suggestions.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {suggestions.map((s, i) => {
              const isApplied = appliedIdx === i
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(s, i)}
                  className={`ai-chip${isApplied ? ' applied' : ''}`}
                >
                  {isApplied
                    ? <><Check size={11} style={{ marginTop:2, flexShrink:0, color:'#22C55E' }}/> Applied to field</>
                    : <><Sparkles size={11} style={{ marginTop:3, flexShrink:0, color:TEAL }}/>{s}</>
                  }
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
