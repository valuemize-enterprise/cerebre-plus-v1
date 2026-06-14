'use client'
// /app/(dashboard)/competitor-intelligence/page.tsx
// Full multi-step competitor intelligence setup: mode → discovery → modules → launch

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap, Sparkles, Search, Plus, X, ChevronRight, ChevronDown,
  ChevronUp, Info, AlertTriangle, Clock, Coins, Check, RefreshCw,
  ArrowRight, Trophy, Cpu, Target,
} from 'lucide-react'
import {
  MODULES, MODULE_LIST, PRESETS, TIER_CONFIG, SIZE_TIER_CONFIG,
  calculateTotalCost, calculateModuleCost, isHeavyAnalysis, COMPETITOR_MULTIPLIERS,
  type ModuleId, type AnalysisMode, type CompetitorProfile, type CompetitorTier,
} from '@/lib/competitor/types'

// ── Design tokens ────────────────────────────────────────────
const N = '#0B1F3A', N2 = '#0D2040', GOLD = '#E09818', GL = '#F5B830'
const TEAL = '#12D4B4', W = '#EBF2FC', DIM = 'rgba(205,217,236,0.65)'
const MUTED = 'rgba(205,217,236,0.35)', B = 'rgba(255,255,255,0.08)'
const FAINT = 'rgba(255,255,255,0.05)', RED = '#EF4444', AMBER = '#F59E0B'

type Step = 'mode' | 'discovery' | 'modules' | 'confirm'

// ─────────────────────────────────────────────────────────────
// STEP 1: MODE SELECTOR
// ─────────────────────────────────────────────────────────────
function ModeSelector({ value, onChange }: { value: AnalysisMode; onChange: (m: AnalysisMode) => void }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color: W, marginBottom: 6 }}>
        Choose your analysis type
      </h2>
      <p style={{ fontSize: 13.5, color: MUTED, marginBottom: 20 }}>
        Enhanced uses live web data for real, current intelligence. Base uses AI knowledge — fast and still valuable.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Base Mode */}
        <button onClick={() => onChange('base')} style={{
          background: value === 'base' ? 'rgba(255,255,255,0.08)' : FAINT,
          border: `2px solid ${value === 'base' ? 'rgba(255,255,255,0.25)' : B}`,
          borderRadius: 16, padding: '20px 18px', cursor: 'pointer', fontFamily: 'inherit',
          textAlign: 'left', transition: 'all .2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} style={{ color: DIM }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: value === 'base' ? W : DIM, margin: 0 }}>Base Mode</p>
              <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Claude-only analysis</p>
            </div>
            {value === 'base' && <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} style={{ color: W }} /></div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['Based on AI market knowledge', 'Fast — results in under 30s', 'Good for initial research', 'Lower coin cost'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: MUTED, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: MUTED }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${B}` }}>
            <p style={{ fontSize: 11, color: MUTED, margin: '0 0 2px' }}>Starting from</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: DIM, margin: 0 }}>10 <span style={{ fontSize: 11, fontWeight: 400 }}>coins / module</span></p>
          </div>
        </button>

        {/* Enhanced Mode — recommended */}
        <button onClick={() => onChange('enhanced')} style={{
          background: value === 'enhanced' ? `linear-gradient(135deg, rgba(18,212,180,0.12), rgba(224,152,24,0.08))` : FAINT,
          border: `2px solid ${value === 'enhanced' ? TEAL + '60' : B}`,
          borderRadius: 16, padding: '20px 18px', cursor: 'pointer', fontFamily: 'inherit',
          textAlign: 'left', transition: 'all .2s', position: 'relative',
        }}>
          {/* Recommended badge */}
          <div style={{ position: 'absolute', top: -1, right: 12, background: `linear-gradient(135deg,${GOLD},${GL})`, color: '#071528', fontSize: 9.5, fontWeight: 900, padding: '3px 10px', borderRadius: '0 0 10px 10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ✦ Recommended
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(18,212,180,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} style={{ color: TEAL }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: value === 'enhanced' ? W : DIM, margin: 0 }}>Enhanced Mode</p>
              <p style={{ fontSize: 11, color: TEAL, margin: 0 }}>Live web intelligence</p>
            </div>
            {value === 'enhanced' && <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: TEAL + '30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} style={{ color: TEAL }} /></div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['Real-time social media data', 'Meta Ad Library scanned', 'Website content analysed', 'Current, verifiable intelligence'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: value === 'enhanced' ? DIM : MUTED }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 10, background: 'rgba(18,212,180,0.08)', border: `1px solid rgba(18,212,180,0.2)` }}>
            <p style={{ fontSize: 11, color: TEAL, margin: '0 0 2px' }}>Starting from</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: value === 'enhanced' ? TEAL : DIM, margin: 0 }}>20 <span style={{ fontSize: 11, fontWeight: 400 }}>coins / module</span></p>
          </div>
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STEP 2: COMPETITOR DISCOVERY
// ─────────────────────────────────────────────────────────────
function CompetitorDiscovery({
  profile, competitors, selected, onCompetitorsUpdate, onSelectionUpdate,
}: {
  profile: { name: string; industry: string; city: string }
  competitors: CompetitorProfile[]
  selected: string[]
  onCompetitorsUpdate: (c: CompetitorProfile[]) => void
  onSelectionUpdate: (s: string[]) => void
}) {
  const [discovering, setDiscovering] = useState(false)
  const [discovered, setDiscovered] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [manualHandle, setManualHandle] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [expandedTier, setExpandedTier] = useState<string | null>(null)
  const [error, setError] = useState('')

  const discover = async () => {
    setDiscovering(true); setError('')
    try {
      const res = await fetch('/api/competitor/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: profile.industry, city: profile.city, businessName: profile.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onCompetitorsUpdate(data.competitors || [])
      // Auto-select recommended 3
      const recommended = autoSelectThree(data.competitors || [])
      onSelectionUpdate(recommended)
      setDiscovered(true)
    } catch (err: any) {
      setError(err.message || 'Discovery failed. You can add competitors manually.')
    } finally { setDiscovering(false) }
  }

  const autoSelectThree = (list: CompetitorProfile[]): string[] => {
    const a = list.find(c => c.tier === 'aspirational')
    const p = list.find(c => c.tier === 'peer_ahead')
    const c = list.find(c => c.tier === 'current_peer')
    const result: string[] = []
    if (a) result.push(a.id)
    if (p) result.push(p.id)
    if (c) result.push(c.id)
    if (result.length < 3) list.forEach(c => { if (!result.includes(c.id) && result.length < 3) result.push(c.id) })
    return result
  }

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      onSelectionUpdate(selected.filter(s => s !== id))
    } else if (selected.length < 7) {
      onSelectionUpdate([...selected, id])
    }
  }

  const addManual = () => {
    if (!manualInput.trim()) return
    const newComp: CompetitorProfile = {
      id: `manual-${Date.now()}`,
      name: manualInput.trim(),
      instagramHandle: manualHandle.trim() ? (manualHandle.startsWith('@') ? manualHandle : `@${manualHandle}`) : '',
      industry: profile.industry,
      city: profile.city,
      sizeTier: 'small',
      tier: 'custom',
      description: 'Manually added competitor',
      source: 'manual',
    }
    onCompetitorsUpdate([...competitors, newComp])
    onSelectionUpdate([...selected, newComp.id].slice(0, 7))
    setManualInput(''); setManualHandle(''); setShowManual(false)
  }

  // Group by tier for display
  const byTier: Record<string, CompetitorProfile[]> = {}
  competitors.forEach(c => {
    if (!byTier[c.tier]) byTier[c.tier] = []
    byTier[c.tier].push(c)
  })
  const tierOrder = ['aspirational', 'peer_ahead', 'current_peer', 'custom']

  return (
    <div>
      <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color: W, marginBottom: 6 }}>
        Find your competitors
      </h2>
      <p style={{ fontSize: 13.5, color: MUTED, marginBottom: 20 }}>
        We'll search for real {profile.industry} businesses in {profile.city}. Select up to 7 — we recommend starting with 3.
      </p>

      {!discovered && !discovering && (
        <button onClick={discover} disabled={!profile} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '18px', borderRadius: 14, fontFamily: 'inherit', fontWeight: 800, fontSize: 15,
          background: `linear-gradient(135deg,${TEAL}30,${TEAL}15)`,
          border: `2px solid ${TEAL}50`, color: TEAL, cursor: 'pointer', marginBottom: 16, transition: 'all .2s',
        }}>
          <Search size={18} /> Discover competitors in {profile.industry}
        </button>
      )}

      {discovering && (
        <div style={{ padding: '24px', background: `${TEAL}08`, border: `1px solid ${TEAL}25`, borderRadius: 14, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, border: `2.5px solid ${TEAL}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'ci-spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: TEAL, margin: '0 0 6px' }}>Searching {profile.city} {profile.industry} market…</p>
          <p style={{ fontSize: 12.5, color: MUTED, margin: 0 }}>Finding businesses in your space and classifying them by size</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.25)`, borderRadius: 10, marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: RED, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Competitor cards grouped by tier */}
      {competitors.length > 0 && tierOrder.map(tier => {
        const group = byTier[tier] || []
        if (!group.length) return null
        const tc = TIER_CONFIG[tier as CompetitorTier]
        const isExpanded = expandedTier === tier || competitors.length <= 6
        return (
          <div key={tier} style={{ marginBottom: 14 }}>
            <button onClick={() => setExpandedTier(isExpanded ? null : tier)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 16 }}>{tc.badge}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: tc.color }}>{tc.label}</span>
              <span style={{ fontSize: 11.5, color: MUTED }}>— {tc.sizeRelationship}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED }}>{group.length} found</span>
              {isExpanded ? <ChevronUp size={13} style={{ color: MUTED }} /> : <ChevronDown size={13} style={{ color: MUTED }} />}
            </button>
            {isExpanded && group.map(comp => {
              const isSel = selected.includes(comp.id)
              const isMax = !isSel && selected.length >= 7
              return (
                <button key={comp.id} onClick={() => !isMax && toggleSelect(comp.id)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', padding: '12px 14px',
                  background: isSel ? tc.bgColor : FAINT,
                  border: `1.5px solid ${isSel ? tc.color + '50' : B}`,
                  borderRadius: 12, marginBottom: 8, cursor: isMax ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', textAlign: 'left', opacity: isMax ? 0.5 : 1, transition: 'all .18s',
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, background: isSel ? tc.color : 'rgba(255,255,255,0.08)', border: `1.5px solid ${isSel ? tc.color : B}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s' }}>
                    {isSel && <Check size={12} style={{ color: '#fff' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: isSel ? W : DIM }}>{comp.name}</span>
                      {comp.instagramHandle && <span style={{ fontSize: 11, color: MUTED }}>{comp.instagramHandle}</span>}
                      {comp.estimatedFollowers && <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 12, background: tc.bgColor, color: tc.color, fontWeight: 700 }}>{comp.estimatedFollowers}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: MUTED, margin: '3px 0 0', lineHeight: 1.45 }}>{comp.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })}

      {/* Selection counter + framework note */}
      {selected.length > 0 && (
        <div style={{ padding: '12px 16px', background: selected.length === 3 ? 'rgba(18,212,180,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${selected.length === 3 ? TEAL + '25' : AMBER + '25'}`, borderRadius: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: selected.length === 3 ? TEAL : AMBER }}>{selected.length}</span>
            <span style={{ fontSize: 13, color: selected.length === 3 ? TEAL : DIM }}>competitor{selected.length !== 1 ? 's' : ''} selected</span>
            {selected.length === 3 && <span style={{ fontSize: 11.5, color: TEAL, marginLeft: 'auto' }}>✓ Recommended count</span>}
            {selected.length > 3 && selected.length < 6 && <span style={{ fontSize: 11.5, color: AMBER, marginLeft: 'auto' }}>{selected.length - 3} extra beyond recommended</span>}
            {selected.length >= 6 && <span style={{ fontSize: 11.5, color: RED, marginLeft: 'auto' }}>⚠ Heavy Analysis — background processing</span>}
          </div>
          {selected.length >= 6 && (
            <p style={{ fontSize: 12, color: MUTED, margin: '6px 0 0' }}>
              6–7 competitors triggers background processing. You can leave and come back when it's done (2–5 minutes).
            </p>
          )}
        </div>
      )}

      {/* Manual add */}
      {!showManual ? (
        <button onClick={() => setShowManual(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: FAINT, border: `1px dashed ${B}`, borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', color: MUTED, fontSize: 13, fontWeight: 600, width: '100%', justifyContent: 'center' }}>
          <Plus size={14} /> Add a competitor manually
        </button>
      ) : (
        <div style={{ background: FAINT, border: `1px solid ${B}`, borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: DIM, marginBottom: 12 }}>Add competitor manually</p>
          <input value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder="Business name *"
            style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: `1px solid ${B}`, borderRadius: 9, padding: '9px 12px', color: W, fontFamily: 'inherit', fontSize: 13.5, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <input value={manualHandle} onChange={e => setManualHandle(e.target.value)} placeholder="Instagram handle (optional)"
            style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: `1px solid ${B}`, borderRadius: 9, padding: '9px 12px', color: W, fontFamily: 'inherit', fontSize: 13.5, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addManual} disabled={!manualInput.trim()} style={{ flex: 1, padding: '9px', borderRadius: 9, background: `${GL}20`, border: `1px solid ${GL}40`, color: GL, fontWeight: 700, fontSize: 13, cursor: !manualInput.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: !manualInput.trim() ? .5 : 1 }}>Add</button>
            <button onClick={() => setShowManual(false)} style={{ padding: '9px 14px', borderRadius: 9, background: FAINT, border: `1px solid ${B}`, color: MUTED, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Re-discover */}
      {discovered && (
        <button onClick={discover} disabled={discovering} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 12.5, fontFamily: 'inherit', marginTop: 10 }}>
          <RefreshCw size={12} /> Re-run discovery
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STEP 3: MODULE GRID
// ─────────────────────────────────────────────────────────────
function ModuleGrid({
  mode, competitorCount, selectedModules, onModulesUpdate,
}: {
  mode: AnalysisMode
  competitorCount: number
  selectedModules: ModuleId[]
  onModulesUpdate: (m: ModuleId[]) => void
}) {
  const toggleModule = (id: ModuleId) => {
    onModulesUpdate(
      selectedModules.includes(id)
        ? selectedModules.filter(m => m !== id)
        : [...selectedModules, id]
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color: W, margin: 0 }}>Select analysis modules</h2>
          <p style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>Choose which intelligence areas to analyse. Each module costs coins independently.</p>
        </div>
        {/* Presets */}
        <div style={{ display: 'flex', gap: 7 }}>
          {Object.values(PRESETS).map(preset => (
            <button key={preset.id} onClick={() => onModulesUpdate(preset.modules)} style={{
              padding: '6px 14px', borderRadius: 20, fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              background: JSON.stringify(selectedModules.sort()) === JSON.stringify([...preset.modules].sort()) ? `${GL}20` : FAINT,
              border: `1px solid ${JSON.stringify(selectedModules.sort()) === JSON.stringify([...preset.modules].sort()) ? GL + '40' : B}`,
              color: JSON.stringify(selectedModules.sort()) === JSON.stringify([...preset.modules].sort()) ? GL : MUTED,
            }}>{preset.name}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
        {MODULE_LIST.map(mod => {
          const isSel = selectedModules.includes(mod.id)
          const coins = calculateModuleCost(mod.id, mode, competitorCount)
          return (
            <button key={mod.id} onClick={() => toggleModule(mod.id)} style={{
              background: isSel ? 'rgba(224,152,24,0.08)' : FAINT,
              border: `1.5px solid ${isSel ? GOLD + '45' : B}`,
              borderRadius: 14, padding: '16px 15px', cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left', transition: 'all .18s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{mod.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: isSel ? W : DIM }}>{mod.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, margin: '3px 0 0', lineHeight: 1.45 }}>{mod.description}</p>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: isSel ? GOLD : 'rgba(255,255,255,0.07)', border: `1.5px solid ${isSel ? GOLD : B}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s' }}>
                  {isSel && <Check size={11} style={{ color: '#071528' }} />}
                </div>
              </div>
              {/* Data sources */}
              {mode === 'enhanced' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {mod.dataSources.map((ds, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(18,212,180,0.1)', color: TEAL }}>{ds}</span>
                  ))}
                </div>
              )}
              {/* Cost */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: isSel ? GOLD : MUTED }}>
                  {coins} coins
                  {competitorCount !== 3 && <span style={{ fontWeight: 400, color: MUTED }}> ({competitorCount} competitors)</span>}
                </span>
                <span style={{ fontSize: 11, color: MUTED }}>{mode === 'enhanced' ? mod.estimatedTime.enhanced : mod.estimatedTime.base}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COIN ESTIMATOR — sticky bottom bar
// ─────────────────────────────────────────────────────────────
function CoinEstimator({
  mode, competitorCount, selectedModules, coinBalance, onLaunch, launching,
}: {
  mode: AnalysisMode
  competitorCount: number
  selectedModules: ModuleId[]
  coinBalance: number
  onLaunch: () => void
  launching: boolean
}) {
  const total = calculateTotalCost(selectedModules, mode, competitorCount)
  const canAfford = coinBalance >= total
  const heavy = isHeavyAnalysis(competitorCount)
  const mult = COMPETITOR_MULTIPLIERS[competitorCount] ?? 1

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(9,12,22,0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: `1px solid ${B}`, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      zIndex: 100,
    }}>
      {/* Breakdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 10, color: MUTED, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Competitors</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: W, margin: 0 }}>
            {competitorCount} <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>×{mult.toFixed(1)} multiplier</span>
          </p>
        </div>
        <div style={{ width: 1, height: 36, background: B }} />
        <div>
          <p style={{ fontSize: 10, color: MUTED, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Modules</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: W, margin: 0 }}>
            {selectedModules.length} <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>selected</span>
          </p>
        </div>
        <div style={{ width: 1, height: 36, background: B }} />
        <div>
          <p style={{ fontSize: 10, color: MUTED, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Cost</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: canAfford ? GL : RED, margin: 0 }}>
            {total} <span style={{ fontSize: 12, fontWeight: 400 }}>coins</span>
          </p>
        </div>
        {!canAfford && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8 }}>
            <AlertTriangle size={13} style={{ color: RED }} />
            <span style={{ fontSize: 12, color: RED }}>Need {total - coinBalance} more coins — <a href="/billing" style={{ color: RED, fontWeight: 700 }}>Top up</a></span>
          </div>
        )}
        {heavy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: `rgba(245,158,11,0.1)`, border: `1px solid rgba(245,158,11,0.25)`, borderRadius: 8 }}>
            <Clock size={13} style={{ color: AMBER }} />
            <span style={{ fontSize: 12, color: AMBER }}>Heavy Analysis — 2–5 min in background</span>
          </div>
        )}
      </div>

      {/* Launch CTA */}
      <button onClick={onLaunch} disabled={!canAfford || !selectedModules.length || !competitorCount || launching} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 12,
        background: canAfford && selectedModules.length && !launching
          ? `linear-gradient(135deg,${GOLD},${GL})`
          : 'rgba(255,255,255,0.06)',
        border: `1px solid ${canAfford && selectedModules.length ? GOLD + '50' : B}`,
        color: canAfford && selectedModules.length && !launching ? '#071528' : MUTED,
        fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: canAfford && selectedModules.length && !launching ? 'pointer' : 'not-allowed',
        transition: 'all .2s',
      }}>
        {launching ? <><RefreshCw size={15} style={{ animation: 'ci-spin 1s linear infinite' }} />Starting…</> : <>
          <Sparkles size={15} /> {heavy ? 'Start Heavy Analysis' : 'Start Analysis'} →
        </>}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CompetitorIntelligencePage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('mode')
  const [mode, setMode] = useState<AnalysisMode>('enhanced')
  const [profile, setProfile] = useState({ name:'My Business', industry:'', city:'Lagos' })
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>(['social_media_audit', 'ad_intelligence', 'gap_opportunity_map'])
  const [coinBalance, setCoinBalance] = useState(0)
  const [launching, setLaunching] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  // Load user profile + coin balance
  useEffect(() => {
    Promise.all([
      fetch('/api/tools/brand-profile').then(r => r.json()),
      fetch('/api/coins/balance').then(r => r.json()).catch(() => ({ balance: 0 })),
      fetch('/api/competitor/history').then(r => r.json()).catch(() => ({ sessions: [] })),
    ]).then(([profileData, balanceData, histData]) => {
      if (profileData.profile) {

        setProfile({
          name: profileData.profile.business_name,
          industry: profileData.profile.industry,
          city: profileData.profile.city
        })
      }
      setCoinBalance(balanceData.balance || 0)
      setHistory(histData.sessions || [])
    })
  }, [])

  const selectedCompetitors = competitors.filter(c => selected.includes(c.id))

  const launch = async () => {
    if (!selectedCompetitors.length || !selectedModules.length) return
    setLaunching(true)
    try {
      const res = await fetch('/api/competitor/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, competitors: selectedCompetitors, modulesSelected: selectedModules }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/competitor-intelligence/${data.session.id}`)
    } catch (err: any) {
      alert(err.message || 'Failed to start analysis')
      setLaunching(false)
    }
  }

  const steps = [
    { id: 'mode', label: 'Mode' },
    { id: 'discovery', label: 'Competitors' },
    { id: 'modules', label: 'Modules' },
  ]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 120 }}>
      <style>{`@keyframes ci-spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Target size={22} style={{ color: GOLD }} />
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: W, margin: 0 }}>
            Competitor Intelligence
          </h1>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${TEAL}18`, color: TEAL }}>2.0</span>
        </div>
        <p style={{ fontSize: 14, color: MUTED, maxWidth: 600 }}>
          Live marketing intelligence on your competitors — social media, ads, website, content strategy. Strictly marketing-focused. Directly informs your next campaign.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {steps.map((s, i) => {
          const done = steps.indexOf(steps.find(x => x.id === step)!) > i
          const active = step === s.id
          return (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? TEAL : active ? `linear-gradient(135deg,${GOLD},${GL})` : FAINT,
                  border: `2px solid ${done ? TEAL : active ? GL : B}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, color: done ? '#fff' : active ? '#071528' : MUTED,
                  transition: 'all .2s',
                }}>
                  {done ? <Check size={13} /> : i + 1}
                </div>
                <span style={{ fontSize: 10.5, color: active ? GL : done ? TEAL : MUTED, fontWeight: active ? 700 : 400 }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1.5, background: done ? TEAL + '50' : B, margin: '0 8px 16px' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step content */}
      <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: '24px 22px', marginBottom: 14 }}>
        {step === 'mode' && (
          <ModeSelector value={mode} onChange={v => { setMode(v); setStep('discovery') }} />
        )}
        {step === 'discovery' && (
          <CompetitorDiscovery
            profile={profile}
            competitors={competitors}
            selected={selected}
            onCompetitorsUpdate={setCompetitors}
            onSelectionUpdate={setSelected}
          />
        )}
        {step === 'modules' && (
          <ModuleGrid
            mode={mode}
            competitorCount={selectedCompetitors.length || 3}
            selectedModules={selectedModules}
            onModulesUpdate={setSelectedModules}
          />
        )}
      </div>

      {/* Step navigation */}
      <div style={{ display: 'flex', gap: 10 }}>
        {step !== 'mode' && (
          <button onClick={() => setStep(step === 'modules' ? 'discovery' : 'mode')} style={{
            padding: '11px 20px', borderRadius: 10, background: FAINT, border: `1px solid ${B}`,
            color: MUTED, fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            ← Back
          </button>
        )}
        {step !== 'modules' && (
          <button
            onClick={() => setStep(step === 'mode' ? 'discovery' : 'modules')}
            disabled={step === 'discovery' && selected.length === 0}
            style={{
              flex: 1, padding: '11px 20px', borderRadius: 10,
              background: (step === 'discovery' && !selected.length) ? FAINT : `${GL}18`,
              border: `1px solid ${(step === 'discovery' && !selected.length) ? B : GL + '40'}`,
              color: (step === 'discovery' && !selected.length) ? MUTED : GL,
              fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
              cursor: (step === 'discovery' && !selected.length) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {step === 'discovery' ? `Continue with ${selected.length} competitor${selected.length !== 1 ? 's' : ''} →` : 'Choose modules →'}
          </button>
        )}
      </div>

      {/* Past analyses */}
      {history.length > 0 && step === 'mode' && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>Past analyses</p>
          {history.slice(0, 3).map(s => (
            <button key={s.id} onClick={() => router.push(`/competitor-intelligence/${s.id}`)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px',
              background: FAINT, border: `1px solid ${B}`, borderRadius: 10, fontFamily: 'inherit',
              cursor: 'pointer', marginBottom: 8, textAlign: 'left',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: s.mode === 'enhanced' ? `${TEAL}18` : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.mode === 'enhanced' ? <Sparkles size={15} style={{ color: TEAL }} /> : <Zap size={15} style={{ color: MUTED }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: DIM, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.competitorNames.join(', ')}</p>
                <p style={{ fontSize: 11.5, color: MUTED, margin: '2px 0 0' }}>{s.modulesComplete}/{s.modulesTotal} modules · {s.coinsSpent} coins · {new Date(s.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 12, background: s.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: s.status === 'completed' ? '#22C55E' : AMBER }}>{s.status}</span>
                <ChevronRight size={13} style={{ color: MUTED }} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sticky coin estimator */}
      {step === 'modules' && (
        <CoinEstimator
          mode={mode}
          competitorCount={selectedCompetitors.length || 3}
          selectedModules={selectedModules}
          coinBalance={coinBalance}
          onLaunch={launch}
          launching={launching}
        />
      )}
    </div>
  )
}
