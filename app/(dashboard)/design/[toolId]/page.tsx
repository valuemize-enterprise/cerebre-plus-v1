'use client'
// /app/(dashboard)/design/[toolId]/page.tsx
// Design tool page with two-phase flow:
//   1. Preview  — generates at low quality, free, not stored
//   2. Save     — generates full quality, deducts coins, stored in R2

import React, { useState, use, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Sparkles, Zap, RefreshCw, Download,
  Check, Shield, X, Maximize2, RotateCcw,
} from 'lucide-react'
import { getDesignTool }   from '@/lib/tools/design-registry'
import { RatingWidget }    from '@/components/tools/RatingWidget'
import { useUser }         from '@/lib/hooks/useUser'
import { SuggestionStrip } from '@/components/tools/SuggestionStrip'
import {
  getFieldSuggestions,
  fieldIsEligibleForSuggestions,
  type ProfileContext,
} from '@/lib/tools/form-suggestions'

// ── Tokens ────────────────────────────────────────────────────
const N2   = '#0D2040'
const GOLD = '#E09818'
const GL   = '#F5B830'
const TEAL = '#12D4B4'
const W    = '#EBF2FC'
const DIM  = 'rgba(205,217,236,0.65)'
const MUTED= 'rgba(205,217,236,0.35)'
const B    = 'rgba(255,255,255,0.08)'
const FAINT= 'rgba(255,255,255,0.04)'
const GREEN= '#22C55E'
const RED  = '#EF4444'

// ── Page states ───────────────────────────────────────────────
type PageState = 'idle' | 'previewing' | 'preview' | 'saving' | 'saved'

// ── Result types ──────────────────────────────────────────────
interface PreviewResult {
  previewDataUrl: string
  coinCost:       number
  engine:         string
  brandApplied?:  { primaryColor: string; logoOverlaid: boolean }
}

interface SavedResult {
  imageUrls:    string[]
  coinCost:     number
  engine:       string
  generationId: string | null
  brandApplied: { primaryColor: string; logoOverlaid: boolean; footerApplied: boolean }
}

// ── Form field renderer ───────────────────────────────────────
function FormField({
  field, value, onChange,
}: {
  field:    any
  value:    string
  onChange: (v: string) => void
}) {
  const base: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: `1px solid ${B}`,
    borderRadius: 10, color: W, fontFamily: 'inherit', fontSize: 13.5,
    outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color .15s',
  }

  if (field.type === 'textarea') return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      rows={field.rows || 3} placeholder={field.placeholder} maxLength={field.maxLength}
      style={{ ...base, padding: '10px 14px', resize: 'vertical', lineHeight: 1.65 }}
    />
  )
  if (field.type === 'select') return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{ ...base, padding: '10px 14px', cursor: 'pointer' }}
    >
      <option value="">Select…</option>
      {(field.options || []).map((o: any) => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
  )
  return (
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder} maxLength={field.maxLength}
      style={{ ...base, padding: '10px 14px' }}
    />
  )
}

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
        <img
          src={src} alt={label}
          style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, display: 'block' }}
        />
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -14, right: -14,
            width: 32, height: 32, borderRadius: '50%',
            background: '#1C1C1C', border: `1px solid ${B}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: W,
          }}
        >
          <X size={16}/>
        </button>
        <a
          href={src} download={`${label}.png`} target="_blank" rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: 14, right: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            background: `${GL}18`, border: `1px solid ${GL}40`,
            color: GL, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          <Download size={13}/> Download
        </a>
      </div>
    </div>
  )
}

// ── Loading overlay ───────────────────────────────────────────
function LoadingPanel({ message, sub }: { message: string; sub?: string }) {
  return (
    <div style={{
      background: N2, border: `1px solid ${B}`, borderRadius: 14,
      padding: 40, textAlign: 'center', minHeight: 320,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        border: `3px solid ${GOLD}`, borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite', marginBottom: 20,
      }}/>
      <p style={{ fontSize: 14, color: GL, fontWeight: 700, marginBottom: 6 }}>{message}</p>
      {sub && <p style={{ fontSize: 12, color: MUTED }}>{sub}</p>}
    </div>
  )
}

// ── Image card (used for both preview and saved images) ───────
function ImageCard({
  src, label, isPreview = false, onExpand,
}: {
  src: string; label: string; isPreview?: boolean; onExpand: () => void
}) {
  return (
    <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: `1px solid ${B}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: DIM }}>{label}</span>
          {isPreview && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: `${GOLD}15`, border: `1px solid ${GOLD}30`, color: GOLD, fontWeight: 700,
            }}>
              PREVIEW
            </span>
          )}
        </div>
        <button
          onClick={onExpand}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
            borderRadius: 8, background: FAINT, border: `1px solid ${B}`,
            color: MUTED, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Maximize2 size={11}/> Full size
        </button>
      </div>
      <div onClick={onExpand} style={{ cursor: 'zoom-in', position: 'relative' }}>
        <img src={src} alt={label} style={{ width: '100%', display: 'block' }}/>
        {isPreview && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
          }}>
            <p style={{
              position: 'absolute', bottom: 12, left: 0, right: 0,
              textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.75)',
            }}>
              Preview quality — save for full resolution
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function DesignToolPage({
  params,
}: {
  params: Promise<{ toolId: string }>
}) {
  const { toolId }   = use(params)
  const tool         = getDesignTool(toolId)
  const { profile }  = useUser()

  const profileCtx = useMemo((): ProfileContext => ({
    businessName:     profile?.business_name,
    industry:         profile?.industry,
    city:             profile?.city,
    targetCustomer:   profile?.target_customer,
    description:      profile?.description,
    uniqueAdvantage:  profile?.unique_advantage,
    primaryGoal:      (profile as any)?.primaryGoal     as string | undefined,
    primaryChallenge: (profile as any)?.primaryChallenge as string | undefined,
  }), [profile])

  const [engine,      setEngine]     = useState<'standard' | 'premium'>('standard')
  const [formData,    setFormData]   = useState<Record<string, string>>({})
  const [pageState,   setPageState]  = useState<PageState>('idle')
  const [loadingMsg,  setLoadingMsg] = useState('')
  const [error,       setError]      = useState('')
  const [preview,     setPreview]    = useState<PreviewResult | null>(null)
  const [saved,       setSaved]      = useState<SavedResult | null>(null)
  const [lightboxSrc, setLightboxSrc]= useState<string | null>(null)
  const [lightboxLbl, setLightboxLbl]= useState('')

  if (!tool) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ color: MUTED, marginBottom: 12 }}>Tool not found.</p>
      <Link href="/design" style={{ color: GL, textDecoration: 'none' }}>← Back to Design Tools</Link>
    </div>
  )

  const coinCost       = engine === 'premium' ? tool.coinCostPremium : tool.coinCostStandard
  const setField       = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }))
  const requiredFields = tool.formBlocks.filter(f => f.required && !formData[f.key]).map(f => f.label)

  // ── Loading message cycling ───────────────────────────────
  const startLoadingCycle = useCallback(() => {
    const msgs = tool.loadingMessages || ['Generating your design…', 'Applying brand DNA…', 'Almost done…']
    setLoadingMsg(msgs[0])
    let i = 0
    return setInterval(() => {
      i = Math.min(i + 1, msgs.length - 1)
      setLoadingMsg(msgs[i])
    }, 2800)
  }, [tool.loadingMessages])

  // ── PREVIEW ───────────────────────────────────────────────
  const generatePreview = async () => {
    if (requiredFields.length) { setError(`Please fill in: ${requiredFields.join(', ')}`); return }
    setError(''); setPageState('previewing'); setSaved(null)
    const interval = startLoadingCycle()

    try {
      const res  = await fetch('/api/tools/generate-design', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ toolId, formData, engine, format: formData.format, preview: true }),
      })
      const data = await res.json()
      clearInterval(interval)

      if (!res.ok) {
        setError(data.error || 'Preview failed. Please try again.')
        setPageState('idle')
        return
      }

      setPreview(data as PreviewResult)
      setPageState('preview')
    } catch {
      clearInterval(interval)
      setError('Network error — please check your connection.')
      setPageState('idle')
    }
  }

  // ── SAVE (full quality, deducts coins) ────────────────────
  const saveDesign = async () => {
    setError(''); setPageState('saving')
    const interval = startLoadingCycle()

    try {
      const res  = await fetch('/api/tools/generate-design', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ toolId, formData, engine, format: formData.format, preview: false }),
      })
      const data = await res.json()
      clearInterval(interval)

      if (!res.ok) {
        setError(data.error || 'Save failed. Please try again.')
        setPageState('preview')  // go back to preview state, not idle
        return
      }

      setSaved(data as SavedResult)
      setPageState('saved')
    } catch {
      clearInterval(interval)
      setError('Network error — please check your connection.')
      setPageState('preview')
    }
  }

  // ── Reset to try again ────────────────────────────────────
  const tryAgain = () => {
    setPreview(null); setSaved(null); setError(''); setPageState('idle')
  }

  // ── Open lightbox ─────────────────────────────────────────
  const openLightbox = (src: string, label: string) => {
    setLightboxSrc(src); setLightboxLbl(label)
  }

  const isLogo       = toolId === 'logo-generator'
  const isLoading    = pageState === 'previewing' || pageState === 'saving'
  const showForm     = pageState === 'idle' || pageState === 'previewing'
  const showPreview  = pageState === 'preview'
  const showSaving   = pageState === 'saving'
  const showSaved    = pageState === 'saved'

  const savedImages  = saved?.imageUrls || []

  return (
    <div style={{ maxWidth: 940, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} label={lightboxLbl} onClose={() => setLightboxSrc(null)}/>
      )}

      {/* Back */}
      <Link href="/design" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: MUTED, textDecoration: 'none', marginBottom: 20,
      }}>
        <ArrowLeft size={13}/> Back to Design Tools
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <span style={{ fontSize: 32 }}>{tool.icon}</span>
        <div>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: W, margin: 0 }}>
            {tool.name}
          </h1>
          <p style={{ fontSize: 13.5, color: MUTED, margin: '4px 0 0' }}>{tool.description}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Form ──────────────────────────────────── */}
        <div>
          {/* Engine selector */}
          <div style={{
            background: N2, border: `1px solid ${B}`, borderRadius: 14,
            padding: 16, marginBottom: 14,
          }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: MUTED, margin: '0 0 10px' }}>
              AI Engine
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['standard', 'premium'] as const).map(e => (
                <button key={e} onClick={() => setEngine(e)} disabled={isLoading} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 10, fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12.5, cursor: isLoading ? 'not-allowed' : 'pointer',
                  background: engine === e
                    ? (e === 'premium' ? `linear-gradient(135deg,${GOLD},${GL})` : 'rgba(255,255,255,0.12)')
                    : FAINT,
                  border: `1px solid ${engine === e ? (e === 'premium' ? GOLD + '50' : B) : B}`,
                  color: engine === e ? (e === 'premium' ? '#071528' : W) : MUTED,
                  transition: 'all .18s',
                }}>
                  {e === 'premium' ? <Sparkles size={12}/> : <Zap size={12}/>}
                  {e === 'standard'
                    ? `Standard · ${tool.coinCostStandard} coins`
                    : `Premium · ${tool.coinCostPremium} coins`}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 14, padding: 18 }}>
            {tool.formBlocks.map(field => {
              const sugs = fieldIsEligibleForSuggestions(field.type)
                ? getFieldSuggestions(field.key, field.label || '', profileCtx)
                : []
              const fieldVal = formData[field.key] || ''
              return (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block', fontSize: 12, fontWeight: 700, color: MUTED,
                    letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7,
                  }}>
                    {field.label}
                    {field.required && <span style={{ color: GOLD }}> *</span>}
                  </label>
                  <FormField field={field} value={fieldVal} onChange={v => setField(field.key, v)}/>
                  {field.maxLength && fieldVal && (
                    <p style={{ fontSize: 10, color: MUTED, margin: '4px 0 0', textAlign: 'right' }}>
                      {fieldVal.length}/{field.maxLength}
                    </p>
                  )}
                  {sugs.length > 0 && (
                    <SuggestionStrip
                      suggestions={sugs}
                      onSelect={v => setField(field.key, v)}
                      visible={fieldVal.length < 25}
                    />
                  )}
                </div>
              )
            })}

            {error && (
              <div style={{
                padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
                border: `1px solid ${RED}40`, borderRadius: 10,
                fontSize: 13, color: '#FCA5A5', marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            {/* CTA buttons — change based on state */}
            {(pageState === 'idle') && (
              <button onClick={generatePreview} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
                background: `linear-gradient(135deg,${GOLD},${GL})`,
                border: `1px solid ${GOLD}50`, color: '#071528', cursor: 'pointer', transition: 'all .2s',
              }}>
                <Sparkles size={15}/> Preview Design — free
              </button>
            )}

            {(pageState === 'previewing') && (
              <button disabled style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
                background: FAINT, border: `1px solid ${B}`, color: MUTED, cursor: 'not-allowed',
              }}>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }}/>
                Generating preview…
              </button>
            )}

            {(pageState === 'preview' || pageState === 'saving' || pageState === 'saved') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pageState !== 'saving' && (
                  <button onClick={saveDesign} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px', borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
                    background: `linear-gradient(135deg,${GREEN},#16A34A)`,
                    border: '1px solid rgba(34,197,94,0.4)', color: '#fff', cursor: 'pointer',
                  }}>
                    <Check size={15}/>
                    {pageState === 'saved' ? 'Save another variant' : `Save Design · ${coinCost} coins`}
                  </button>
                )}
                {pageState === 'saving' && (
                  <button disabled style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px', borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
                    background: FAINT, border: `1px solid ${B}`, color: MUTED, cursor: 'not-allowed',
                  }}>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }}/>{loadingMsg}
                  </button>
                )}
                <button onClick={generatePreview} disabled={pageState === 'saving'} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px', borderRadius: 12, fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5,
                  background: FAINT, border: `1px solid ${B}`, color: MUTED,
                  cursor: pageState === 'saving' ? 'not-allowed' : 'pointer',
                }}>
                  <RotateCcw size={13}/> Regenerate preview (free)
                </button>
                <button onClick={tryAgain} disabled={pageState === 'saving'} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: MUTED, fontFamily: 'inherit', padding: '4px',
                  textDecoration: 'underline', textDecorationColor: 'rgba(205,217,236,0.2)',
                }}>
                  Start over with different inputs
                </button>
              </div>
            )}
          </div>

          {/* Brand DNA notice */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
            padding: '10px 14px', background: 'rgba(18,212,180,0.06)',
            border: '1px solid rgba(18,212,180,0.18)', borderRadius: 10,
          }}>
            <Shield size={13} style={{ color: TEAL, flexShrink: 0 }}/>
            <p style={{ fontSize: 11.5, color: TEAL, margin: 0 }}>
              Brand DNA applied — your colours, font style, and logo on every saved design.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Output ────────────────────────────────── */}
        <div style={{ position: 'sticky', top: 20 }}>

          {/* Idle placeholder */}
          {pageState === 'idle' && (
            <div style={{
              background: N2, border: `1px dashed ${B}`, borderRadius: 14,
              padding: 48, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minHeight: 300,
            }}>
              <span style={{ fontSize: 44, marginBottom: 14 }}>{tool.icon}</span>
              <p style={{ fontSize: 13.5, color: MUTED, maxWidth: 240 }}>
                Fill in the form and click <strong style={{ color: DIM }}>Preview Design</strong> to see your design for free before spending any coins.
              </p>
            </div>
          )}

          {/* Previewing loading */}
          {pageState === 'previewing' && (
            <LoadingPanel
              message={loadingMsg || 'Generating preview…'}
              sub="Fast preview — no coins spent"
            />
          )}

          {/* Preview image */}
          {pageState === 'preview' && preview?.previewDataUrl && (
            <>
              <div style={{
                padding: '10px 14px', background: `${GOLD}08`,
                border: `1px solid ${GOLD}25`, borderRadius: '12px 12px 0 0',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Sparkles size={13} style={{ color: GOLD }}/>
                <p style={{ fontSize: 12.5, color: GL, fontWeight: 700, margin: 0 }}>
                  Looking good? Save it for {coinCost} coins — or regenerate for free.
                </p>
              </div>
              <ImageCard
                src={preview.previewDataUrl}
                label="Preview"
                isPreview
                onExpand={() => openLightbox(preview.previewDataUrl, 'Preview')}
              />
            </>
          )}

          {/* Saving loading */}
          {pageState === 'saving' && (
            <LoadingPanel
              message={loadingMsg || 'Saving your design…'}
              sub={`Generating full quality · deducting ${coinCost} coins`}
            />
          )}

          {/* Saved result */}
          {pageState === 'saved' && savedImages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Success banner */}
              <div style={{
                padding: '10px 14px', background: 'rgba(34,197,94,0.1)',
                border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Check size={14} style={{ color: GREEN }}/>
                <p style={{ fontSize: 12.5, color: GREEN, fontWeight: 700, margin: 0 }}>
                  Saved! {coinCost} coins deducted · {savedImages.length} variant{savedImages.length !== 1 ? 's' : ''} ready to download.
                </p>
              </div>

              {savedImages.map((url, i) => (
                <div key={i}>
                  <ImageCard
                    src={url}
                    label={`Variant ${i + 1}`}
                    isPreview={false}
                    onExpand={() => openLightbox(url, `Variant ${i + 1}`)}
                  />
                  {/* Download row */}
                  <div style={{ padding: '8px 14px', background: N2, borderRadius: '0 0 14px 14px', display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${B}` }}>
                    <a
                      href={url} download={`${toolId}-v${i+1}.png`}
                      target="_blank" rel="noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 14px', borderRadius: 8,
                        background: `${GL}15`, border: `1px solid ${GL}35`,
                        color: GL, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}
                    >
                      <Download size={11}/> Download
                    </a>
                  </div>
                </div>
              ))}

              {/* Brand applied */}
              {saved?.brandApplied && (
                <div style={{
                  padding: '10px 14px', background: 'rgba(18,212,180,0.06)',
                  border: '1px solid rgba(18,212,180,0.18)', borderRadius: 10,
                }}>
                  <p style={{ fontSize: 11.5, color: TEAL, margin: 0 }}>
                    ✓ Brand color {saved.brandApplied.primaryColor} applied
                    {saved.brandApplied.logoOverlaid ? ' · ✓ Logo overlaid' : ''}
                    {saved.brandApplied.footerApplied ? ' · ✓ Footer strip applied' : ''}
                  </p>
                </div>
              )}

              {/* Rating widget */}
              <div style={{ marginTop: 4 }}>
                <RatingWidget
                  toolId={toolId}
                  toolCategory="design"
                  engine={engine}
                  coinsSpent={saved?.coinCost}
                  generationId={saved?.generationId ?? undefined}
                  variantCount={savedImages.length}
                  hadBrandProfile={!!saved?.brandApplied?.primaryColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
