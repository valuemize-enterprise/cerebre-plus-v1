'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/DeepDiveDrawer.tsx  (v2 — with confirmation)
//
// Changes from v1:
//   • Tapping "Tell me more" now shows a CONFIRMATION modal first
//   • Modal displays coin cost + current balance
//   • User must explicitly confirm before the API call fires
//   • If Deep Dive is already loaded, the drawer opens directly (no confirmation)
// ═══════════════════════════════════════════════════════════════

import React, {
  useState, useEffect, useRef, useCallback, createContext, useContext,
} from 'react'
import { X, Copy, Check, Loader2, ChevronDown, Lock, AlertCircle } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const D = {
  dark:  '#060C1A', navy: '#0B1F3A', card: '#0D2040',
  gold:  '#E09818', gl:  '#F5B830', teal: '#12D4B4',
  red:   '#E55252', w:   '#EBF2FC',
  dim:   'rgba(205,217,236,.7)',  muted: 'rgba(205,217,236,.38)',
  faint: 'rgba(255,255,255,.04)', bdr:   'rgba(255,255,255,.08)',
}

// ── Context ───────────────────────────────────────────────────
interface DeepDiveCtx {
  isOpen:           boolean
  isPendingConfirm: boolean   // ← NEW: confirmation modal visible
  isLoading:        boolean
  deepDiveJson:     Record<string, unknown> | null
  error:            string | null
  coinCost:         number
  coinBalance:      number
  open:             () => void     // tapping trigger → show confirmation (or drawer if already loaded)
  confirm:          () => void     // ← NEW: user taps "Yes, generate"
  cancel:           () => void     // ← NEW: user taps "Cancel"
  close:            () => void
}

const DeepDiveContext = createContext<DeepDiveCtx | null>(null)
export function useDeepDive() {
  const ctx = useContext(DeepDiveContext)
  if (!ctx) throw new Error('useDeepDive must be used inside DeepDiveProvider')
  return ctx
}

// ── Provider ──────────────────────────────────────────────────
interface ProviderProps {
  children:          React.ReactNode
  generationId:      string
  toolId:            string
  deepDiveCost:      number
  coinBalance?:      number          // current user balance (for confirmation display)
  initialDeepDive?:  Record<string, unknown> | null
  onDeepDiveLoaded?: (data: Record<string, unknown>) => void
}

export function DeepDiveProvider({
  children, generationId, toolId, deepDiveCost, coinBalance = 0,
  initialDeepDive, onDeepDiveLoaded,
}: ProviderProps) {
  const [isOpen,           setIsOpen]           = useState(false)
  const [isPendingConfirm, setIsPendingConfirm] = useState(false)
  const [isLoading,        setIsLoading]        = useState(false)
  const [deepDiveJson,     setDeepDiveJson]     = useState<Record<string, unknown> | null>(initialDeepDive ?? null)
  const [error,            setError]            = useState<string | null>(null)

  // open: called when trigger is tapped
  const open = useCallback(() => {
    // Already loaded — skip confirmation and open drawer directly
    if (deepDiveJson) {
      setIsOpen(true)
      return
    }
    // Show confirmation modal first
    setIsPendingConfirm(true)
  }, [deepDiveJson])

  // confirm: user explicitly agrees to spend coins
  const confirm = useCallback(async () => {
    setIsPendingConfirm(false)
    setIsOpen(true)
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/generate/${toolId}/deep-dive`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ generation_id: generationId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Deep Dive generation failed. Please retry.')
        return
      }

      const dj = data.deep_dive_json as Record<string, unknown>
      setDeepDiveJson(dj)
      onDeepDiveLoaded?.(dj)
    } catch {
      setError('Network error — please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [generationId, toolId, onDeepDiveLoaded])

  const cancel = useCallback(() => setIsPendingConfirm(false), [])
  const close  = useCallback(() => setIsOpen(false), [])

  return (
    <DeepDiveContext.Provider value={{
      isOpen, isPendingConfirm, isLoading, deepDiveJson, error,
      coinCost: deepDiveCost, coinBalance, open, confirm, cancel, close,
    }}>
      {children}
    </DeepDiveContext.Provider>
  )
}

// ── Trigger Button ─────────────────────────────────────────────
export function DeepDiveTrigger({ className }: { className?: string }) {
  const { open, coinCost, deepDiveJson, isLoading } = useDeepDive()
  const alreadyLoaded = Boolean(deepDiveJson)

  return (
    <button
      onClick={open}
      disabled={isLoading}
      className={className}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '12px 16px', borderRadius: 10,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
        border: `1px solid rgba(18,212,180,.3)`,
        background: alreadyLoaded ? 'rgba(18,212,180,.14)' : 'rgba(18,212,180,.07)',
        color: D.teal, transition: 'all .2s',
      }}
    >
      {isLoading ? (
        <><Loader2 size={15} style={{ animation: 'dd-spin 1s linear infinite' }}/> Generating Deep Dive…</>
      ) : alreadyLoaded ? (
        <>▼ Show Deep Dive</>
      ) : (
        <>
          <Lock size={13}/>
          Tell me more
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: 'rgba(18,212,180,.15)', border: '1px solid rgba(18,212,180,.3)',
          }}>
            ⊙ {coinCost} coins
          </span>
        </>
      )}
    </button>
  )
}

// ── Confirmation Modal ─────────────────────────────────────────
function ConfirmModal() {
  const { isPendingConfirm, coinCost, coinBalance, confirm, cancel } = useDeepDive()
  const canAfford = coinBalance === 0 || coinBalance >= coinCost  // 0 = unknown balance, allow

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel() }
    if (isPendingConfirm) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isPendingConfirm, cancel])

  if (!isPendingConfirm) return null

  return (
    <div
      onClick={cancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(4,8,20,.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'dd-fade-in .15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380, background: D.card,
          border: `1px solid rgba(18,212,180,.3)`, borderRadius: 18,
          padding: 24, animation: 'dd-scale-in .18s cubic-bezier(.34,1.26,.64,1)',
        }}
      >
        {/* Icon */}
        <div style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 16,
          background: 'rgba(18,212,180,.1)', border: '1px solid rgba(18,212,180,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          🔍
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: D.w, margin: '0 0 8px', lineHeight: 1.3 }}>
          Generate Deep Dive?
        </h3>
        <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.7, margin: '0 0 20px' }}>
          This will run a full analysis using the context from your generation — strategy notes, why it works, and actionable next steps.
        </p>

        {/* Cost breakdown */}
        <div style={{
          padding: '12px 14px', borderRadius: 10, marginBottom: 20,
          background: 'rgba(18,212,180,.06)', border: '1px solid rgba(18,212,180,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: D.teal, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>Cost</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: D.teal, margin: 0, fontFamily: "'Georgia',serif" }}>⊙ {coinCost}</p>
          </div>
          {coinBalance > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: D.muted, margin: '0 0 2px' }}>Your balance</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: coinBalance >= coinCost ? D.gl : D.red, margin: 0 }}>
                ⊙ {coinBalance}
              </p>
            </div>
          )}
        </div>

        {/* Insufficient balance warning */}
        {coinBalance > 0 && coinBalance < coinCost && (
          <div style={{
            padding: '10px 12px', borderRadius: 8, marginBottom: 16,
            background: 'rgba(229,82,82,.08)', border: '1px solid rgba(229,82,82,.25)',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <AlertCircle size={14} style={{ color: D.red, flexShrink: 0, marginTop: 1 }}/>
            <p style={{ fontSize: 12.5, color: D.red, margin: 0, lineHeight: 1.5 }}>
              Not enough coins. You need ⊙ {coinCost} but have ⊙ {coinBalance}.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={cancel} style={{
            flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
            border: `1px solid ${D.bdr}`, background: D.faint, color: D.muted,
          }}>
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={coinBalance > 0 && coinBalance < coinCost}
            style={{
              flex: 2, padding: '11px', borderRadius: 10, fontFamily: 'inherit',
              fontSize: 13.5, fontWeight: 800,
              cursor: (coinBalance > 0 && coinBalance < coinCost) ? 'not-allowed' : 'pointer',
              border: `1px solid rgba(18,212,180,.45)`,
              background: (coinBalance > 0 && coinBalance < coinCost)
                ? D.faint
                : 'linear-gradient(135deg,rgba(18,212,180,.22),rgba(18,212,180,.14))',
              color: (coinBalance > 0 && coinBalance < coinCost) ? D.muted : D.teal,
              opacity: (coinBalance > 0 && coinBalance < coinCost) ? .45 : 1,
              transition: 'all .15s',
            }}
          >
            Yes, generate — ⊙ {coinCost}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Drawer ─────────────────────────────────────────────────────
interface DrawerProps {
  headline:        string
  renderContent?:  (data: Record<string, unknown>) => React.ReactNode
}

export function DeepDiveDrawer({ headline, renderContent }: DrawerProps) {
  const { isOpen, isLoading, deepDiveJson, error, close, isPendingConfirm } = useDeepDive()
  const drawerRef  = useRef<HTMLDivElement>(null)
  const [copyDone, setCopyDone] = useState(false)

  useEffect(() => { if (isOpen && drawerRef.current) drawerRef.current.focus() }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isPendingConfirm) close() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close, isPendingConfirm])

  useEffect(() => {
    document.body.style.overflow = (isOpen || isPendingConfirm) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen, isPendingConfirm])

  const copyAll = () => {
    if (!deepDiveJson) return
    navigator.clipboard?.writeText(flattenToText(deepDiveJson)).catch(() => {})
    setCopyDone(true); setTimeout(() => setCopyDone(false), 2200)
  }

  return (
    <>
      <style>{`
        @keyframes dd-slide-up  { from { transform:translateY(100%);opacity:.85 } to { transform:translateY(0);opacity:1 } }
        @keyframes dd-fade-in   { from { opacity:0 } to { opacity:1 } }
        @keyframes dd-scale-in  { from { transform:scale(.93);opacity:0 } to { transform:scale(1);opacity:1 } }
        @keyframes dd-spin      { to { transform:rotate(360deg) } }
        .dd-drawer-body::-webkit-scrollbar { width:3px }
        .dd-drawer-body::-webkit-scrollbar-track { background:transparent }
        .dd-drawer-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12);border-radius:10px }
        .dd-section { margin-bottom:24px }
        .dd-section-title { font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${D.teal};margin-bottom:10px;display:flex;align-items:center;gap:6px }
        .dd-copy-field { background:rgba(18,212,180,.06);border:1px solid rgba(18,212,180,.2);border-radius:10px;padding:14px 16px;position:relative;margin-bottom:10px }
        .dd-copy-field p { font-size:13.5px;color:${D.w};line-height:1.7;margin:0 }
        .dd-copy-btn { position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11.5px;font-weight:700;font-family:inherit;border:1px solid ${D.bdr};background:${D.faint};color:${D.muted};transition:all .15s }
        .dd-bullet { display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-top:1px solid ${D.bdr} }
        .dd-bullet:first-child { border-top:none }
        .dd-bullet-dot { width:7px;height:7px;border-radius:50%;background:${D.teal};flex-shrink:0;margin-top:6px }
        @media(max-width:600px){.dd-inner{border-radius:20px 20px 0 0!important;max-height:92vh!important}}
      `}</style>

      {/* Confirmation modal — rendered outside the drawer */}
      <ConfirmModal/>

      {/* Backdrop + Drawer */}
      {isOpen && (
        <div
          className="dd-overlay"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Deep Dive details"
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(4,8,20,.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'dd-fade-in .2s ease',
          }}
        >
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="dd-inner"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 780, margin: '0 auto',
              height: '85vh', maxHeight: '85vh', background: D.dark,
              border: `1px solid ${D.bdr}`, borderRadius: '20px 20px 0 0',
              display: 'flex', flexDirection: 'column', outline: 'none', overflow: 'hidden',
              animation: 'dd-slide-up .28s cubic-bezier(.34,1.26,.64,1)',
            }}
          >
            {/* Drag handle */}
            <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', cursor: 'pointer' }} onClick={close}/>
            </div>

            {/* Compressed headline strip */}
            <div style={{ padding: '10px 20px 12px', borderBottom: `1px solid ${D.bdr}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: D.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {headline}
              </div>
              <button onClick={close} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: D.faint, border: `1px solid ${D.bdr}`, cursor: 'pointer', color: D.muted, flexShrink: 0 }}>
                <X size={14}/>
              </button>
            </div>

            {/* Drawer header */}
            <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${D.bdr}`, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: 'rgba(18,212,180,.1)', border: `1px solid rgba(18,212,180,.25)`, color: D.teal }}>
                Deep Dive
              </span>
              <span style={{ fontSize: 13, color: D.muted, marginLeft: 8 }}>Full analysis and strategy</span>
            </div>

            {/* Scrollable body */}
            <div className="dd-drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {isLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
                  {[100,80,95,75,88].map((w,i) => (
                    <div key={i} style={{ height: 16, borderRadius: 6, background: D.faint, width: `${w}%`, opacity: 1 - i * 0.1 }}/>
                  ))}
                  <div style={{ textAlign: 'center', paddingTop: 16 }}>
                    <Loader2 size={22} style={{ color: D.teal, animation: 'dd-spin 1s linear infinite' }}/>
                    <p style={{ fontSize: 13, color: D.muted, marginTop: 8 }}>Generating your Deep Dive…</p>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(229,82,82,.08)', border: `1px solid rgba(229,82,82,.25)`, color: D.red, fontSize: 13, lineHeight: 1.65 }}>
                  <strong>Something went wrong:</strong> {error}
                </div>
              )}

              {deepDiveJson && !isLoading && !error && (
                renderContent ? renderContent(deepDiveJson) : <DefaultDeepDiveContent data={deepDiveJson}/>
              )}
            </div>

            {/* Sticky footer */}
            {deepDiveJson && !isLoading && (
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${D.bdr}`, display: 'flex', gap: 10, background: 'rgba(6,12,26,.97)', backdropFilter: 'blur(14px)', flexShrink: 0 }}>
                <button onClick={close} style={{ padding: '10px 18px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, border: `1px solid ${D.bdr}`, background: D.faint, color: D.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ChevronDown size={14}/> Close
                </button>
                <button onClick={copyAll} style={{ flex: 1, padding: '10px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, border: `1px solid ${copyDone ? 'rgba(18,212,180,.4)' : 'rgba(224,152,24,.35)'}`, background: copyDone ? 'rgba(18,212,180,.14)' : 'rgba(224,152,24,.12)', color: copyDone ? D.teal : D.gl, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .18s' }}>
                  {copyDone ? <><Check size={14}/> Copied!</> : <><Copy size={14}/> Copy Deep Dive</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Default content renderer ───────────────────────────────────
function DefaultDeepDiveContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div>
      {Object.entries(data).map(([key, value]) => {
        if (key === 'deep_dive' && typeof value === 'object' && value !== null) {
          return <DefaultDeepDiveContent key={key} data={value as Record<string, unknown>}/>
        }
        if (value === null || value === undefined) return null
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        return <DeepDiveSection key={key} title={label} content={value}/>
      })}
    </div>
  )
}

function DeepDiveSection({ title, content }: { title: string; content: unknown }) {
  const [copyDone, setCopyDone] = useState(false)
  const textContent = Array.isArray(content) ? content.join('\n') : typeof content === 'string' ? content : JSON.stringify(content, null, 2)
  const copy = () => { navigator.clipboard?.writeText(textContent).catch(() => {}); setCopyDone(true); setTimeout(() => setCopyDone(false), 1800) }

  return (
    <div className="dd-section">
      <div className="dd-section-title">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: D.teal, display: 'inline-block' }}/>
        {title}
      </div>
      {Array.isArray(content) ? (
        <div>
          {(content as unknown[]).map((item, i) => (
            <div key={i} className="dd-bullet">
              <div className="dd-bullet-dot"/>
              <span style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.7 }}>
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </span>
            </div>
          ))}
        </div>
      ) : typeof content === 'object' && content !== null ? (
        <DefaultDeepDiveContent data={content as Record<string, unknown>}/>
      ) : (
        <div className="dd-copy-field">
          <p>{String(content)}</p>
          <button className="dd-copy-btn" onClick={copy}>
            {copyDone ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
          </button>
        </div>
      )}
    </div>
  )
}

function flattenToText(data: Record<string, unknown>, depth = 0): string {
  const lines: string[] = []
  for (const [key, value] of Object.entries(data)) {
    const label = key.replace(/_/g, ' ').toUpperCase()
    if (typeof value === 'string') lines.push(depth === 0 ? `── ${label} ──\n${value}` : value)
    else if (Array.isArray(value)) { lines.push(`── ${label} ──`); value.forEach((v,i) => lines.push(`${i+1}. ${typeof v==='string'?v:JSON.stringify(v)}`)) }
    else if (typeof value === 'object' && value !== null) { lines.push(`── ${label} ──`); lines.push(flattenToText(value as Record<string, unknown>, depth+1)) }
  }
  return lines.join('\n\n')
}
