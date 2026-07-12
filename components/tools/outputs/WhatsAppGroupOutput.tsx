'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/WhatsAppGroupOutput.tsx
//
// Handles all 4 Group 4 (WhatsApp sequence) tools.
// Each tool gets a unique visual framing for its message output.
//
// Tool → Visual Mode:
//   whatsapp-campaign-builder → CampaignThread  (full sequence, formula badge)
//   follow-up-sequencer       → TimelineView    (vertical timeline with nodes)
//   welcome-message-craft     → WelcomeView     (single oversized bubble)
//   win-back-campaign         → WinBackView     (3-message urgency escalation)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from 'react'
import {
  Copy, Check, RefreshCw, Bookmark, BookmarkCheck, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { WhatsAppOutput, WhatsAppMessage } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:   '#060C1A', navy: '#0B1F3A', card: '#0D2040',
  gold:   '#E09818', gl:  '#F5B830', teal: '#12D4B4',
  red:    '#E55252', green: '#22C55E', purple: '#8B7FFF',
  amber:  '#F97316', w: '#EBF2FC',
  dim:    'rgba(205,217,236,.72)', muted: 'rgba(205,217,236,.38)',
  faint:  'rgba(255,255,255,.04)', bdr:   'rgba(255,255,255,.08)',
  wa:     '#25D366',
}

// Message type → colour
const MSG_TYPE_COLOR: Record<string, string> = {
  'Hook':       D.gl,
  'Fear':       D.red,
  'Proof':      D.teal,
  'Awoof':      D.green,
  'CTA':        D.purple,
  'Welcome':    D.teal,
  'Follow-up':  D.gl,
  'Win-back':   D.amber,
  'default':    D.muted,
}
function msgColor(type: string) {
  return MSG_TYPE_COLOR[type] ?? MSG_TYPE_COLOR.default
}

// Urgency level colour for WinBack
function urgencyColor(index: number): string {
  if (index === 0) return D.gl     // warm
  if (index === 1) return D.amber  // pressing
  return D.red                     // final
}

// ── useCopy ────────────────────────────────────────────────────
function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Per-message copy btn ────────────────────────────────────────
function MsgCopyBtn({ text }: { text: string }) {
  const { done, copy } = useCopy(text)
  return (
    <button onClick={copy} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '5px 11px', borderRadius: 6, cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
      border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`,
      background: done ? 'rgba(18,212,180,.1)' : D.faint,
      color: done ? D.teal : D.muted, transition: 'all .18s', minHeight: 30,
    }}>
      {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// VISUAL MODES
// ═══════════════════════════════════════════════════════════════

// ── 1. CAMPAIGN THREAD — WhatsApp Campaign Builder ─────────────
// Full sequence as WhatsApp-style message bubbles with formula badge
function CampaignThread({ messages, formula }: {
  messages: WhatsAppMessage[]; formula: string
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const toggle = (i: number) => setExpanded(p => ({ ...p, [i]: !p[i] }))
  const isExpanded = (i: number) => expanded[i] ?? i < 2  // First 2 open by default

  return (
    <div>
      {/* Formula badge */}
      {formula && (
        <div style={{
          padding: '8px 12px', marginBottom: 14, borderRadius: 8,
          background: 'rgba(224,152,24,.07)', border: '1px solid rgba(224,152,24,.2)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
          <span style={{ fontSize: 12, color: 'rgba(224,152,24,.9)', lineHeight: 1.55 }}>
            <strong style={{ fontWeight: 700 }}>Formula: </strong>{formula}
          </span>
        </div>
      )}

      {messages.map((msg, i) => {
        const color = msgColor(msg.type)
        const open  = isExpanded(i)
        return (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
            {/* Sequence number */}
            <div style={{
              minWidth: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 2,
              background: `${color}18`, border: `1.5px solid ${color}45`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color,
            }}>{i + 1}</div>

            {/* Message content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Type + timing row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
                  background: `${color}16`, border: `1px solid ${color}35`, color,
                }}>
                  {msg.type}
                </span>
                {msg.timing && (
                  <span style={{ fontSize: 11, color: 'rgba(224,152,24,.75)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    ⏰ {msg.timing}
                  </span>
                )}
              </div>

              {/* WhatsApp bubble */}
              <div style={{
                background: 'rgba(255,255,255,.06)', border: `1px solid ${D.bdr}`,
                borderRadius: '3px 12px 12px 12px', overflow: 'hidden',
              }}>
                <div style={{ padding: '11px 13px' }}>
                  {open ? (
                    <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.72, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </p>
                  ) : (
                    <p style={{
                      fontSize: 13.5, color: D.muted, lineHeight: 1.72, margin: 0,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {msg.text}
                    </p>
                  )}
                  {msg.text.length > 140 && (
                    <button onClick={() => toggle(i)} style={{
                      fontSize: 11.5, color: D.teal, background: 'none', border: 'none',
                      cursor: 'pointer', padding: '5px 0 0', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      {open ? <><ChevronUp size={12}/> Show less</> : <><ChevronDown size={12}/> Show full message</>}
                    </button>
                  )}
                </div>
                <div style={{
                  padding: '8px 13px', borderTop: `1px solid ${D.bdr}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <span style={{ fontSize: 11, color: D.muted }}>{msg.text.length} chars</span>
                    {msg.send_tip && (
                      <span style={{ fontSize: 11, color: D.muted, marginLeft: 8 }}>· {msg.send_tip}</span>
                    )}
                  </div>
                  <MsgCopyBtn text={msg.text}/>
                </div>
              </div>

              {/* Connector line (not on last) */}
              {i < messages.length - 1 && (
                <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,.08)', margin: '4px 0 0 6px' }}/>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── 2. TIMELINE VIEW — FollowUpSequencer ──────────────────────
// Vertical timeline with nodes, showing the follow-up journey
function TimelineView({ messages }: { messages: WhatsAppMessage[] }) {
  const [selectedMsg, setSelectedMsg] = useState<number | null>(null)

  return (
    <div>
      {/* Timeline rail */}
      <div style={{ position: 'relative', paddingLeft: 36 }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 12, top: 12, bottom: 12,
          width: 1, background: `linear-gradient(to bottom, ${D.teal}60, rgba(255,255,255,.06))`,
        }}/>

        {messages.map((msg, i) => {
          const color   = msgColor(msg.type)
          const isOpen  = selectedMsg === i
          return (
            <div key={i} style={{ position: 'relative', marginBottom: 12 }}>
              {/* Node */}
              <div style={{
                position: 'absolute', left: -24, top: 12,
                width: 16, height: 16, borderRadius: '50%',
                background: `${color}22`, border: `2px solid ${color}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }}/>
              </div>

              {/* Message card */}
              <div
                onClick={() => setSelectedMsg(isOpen ? null : i)}
                style={{
                  background: isOpen ? 'rgba(255,255,255,.06)' : D.faint,
                  border: `1px solid ${isOpen ? color + '35' : D.bdr}`,
                  borderRadius: 10, cursor: 'pointer', overflow: 'hidden',
                  transition: 'all .2s',
                }}
              >
                <div style={{ padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: `${color}15`, border: `1px solid ${color}30`, color,
                    flexShrink: 0,
                  }}>{msg.type}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: isOpen ? D.dim : D.muted, margin: 0, lineHeight: 1.5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {msg.text}
                    </p>
                  </div>
                  {msg.timing && <span style={{ fontSize: 10.5, color: D.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>{msg.timing}</span>}
                  <ChevronDown size={13} style={{ color: D.muted, flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
                </div>

                {isOpen && (
                  <div style={{ padding: '0 13px 12px', borderTop: `1px solid ${D.bdr}` }}>
                    <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: '12px 0 10px', whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: D.muted }}>{msg.text.length} chars · {msg.send_tip || ''}</span>
                      <MsgCopyBtn text={msg.text}/>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 3. WELCOME VIEW — WelcomeMessageCraft ─────────────────────
// Single message as oversized welcome bubble — first impressions
function WelcomeView({ messages }: { messages: WhatsAppMessage[] }) {
  const msg  = messages[0]
  if (!msg) return null
  const { done, copy } = useCopy(msg.text)

  return (
    <div>
      {/* Welcome context card */}
      <div style={{
        padding: '10px 14px', marginBottom: 14, borderRadius: 10,
        background: 'rgba(18,212,180,.06)', border: '1px solid rgba(18,212,180,.18)',
        display: 'flex', alignItems: 'flex-start', gap: 9,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>👋</span>
        <div>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: D.teal, margin: '0 0 2px' }}>First impression message</p>
          <p style={{ fontSize: 12, color: D.muted, margin: 0, lineHeight: 1.5 }}>
            This is what every new contact sees the moment they reach out. Delivered within seconds of first contact.
          </p>
        </div>
      </div>

      {/* Oversized bubble */}
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        border: `2px solid rgba(37,211,102,.3)`,
        background: 'rgba(37,211,102,.05)',
        boxShadow: '0 8px 32px rgba(37,211,102,.08)',
      }}>
        {/* Bubble header */}
        <div style={{
          padding: '11px 16px',
          background: `linear-gradient(90deg, rgba(37,211,102,.12), ${D.card})`,
          borderBottom: `1px solid rgba(37,211,102,.18)`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,211,102,.2)', border: '1.5px solid rgba(37,211,102,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>💬</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: D.w, margin: 0 }}>Auto-reply message</p>
            <p style={{ fontSize: 11, color: 'rgba(37,211,102,.7)', margin: 0 }}>Sent instantly on first contact</p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 10.5, color: 'rgba(37,211,102,.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: D.wa, display: 'inline-block' }}/>
            WhatsApp
          </div>
        </div>

        {/* Message body */}
        <div style={{ padding: '18px 20px' }}>
          <p style={{
            fontSize: 15, color: D.w, lineHeight: 1.8,
            margin: '0 0 16px', whiteSpace: 'pre-wrap',
            fontFamily: "'system-ui', -apple-system, sans-serif",
          }}>
            {msg.text}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(37,211,102,.5)' }}>{msg.text.length} characters</span>
              <span style={{ fontSize: 13, color: 'rgba(37,211,102,.7)' }}>✓✓</span>
            </div>
            <button onClick={copy} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 18px', borderRadius: 9, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              border: `1px solid ${done ? 'rgba(18,212,180,.4)' : 'rgba(37,211,102,.35)'}`,
              background: done ? 'rgba(18,212,180,.14)' : 'rgba(37,211,102,.12)',
              color: done ? D.teal : D.wa, transition: 'all .18s', minHeight: 38,
            }}>
              {done ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy message</>}
            </button>
          </div>
        </div>

        {msg.send_tip && (
          <div style={{ padding: '10px 20px', borderTop: `1px solid rgba(37,211,102,.15)`, background: 'rgba(37,211,102,.04)' }}>
            <p style={{ fontSize: 12, color: 'rgba(37,211,102,.65)', margin: 0 }}>
              💡 {msg.send_tip}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 4. WIN-BACK VIEW — WinBackCampaign ────────────────────────
// 3 messages with escalating urgency: warm → pressing → final
function WinBackView({ messages }: { messages: WhatsAppMessage[] }) {
  const urgencyLabels = ['Warm re-engagement', 'Second touch', 'Final attempt']
  const urgencyDesc   = [
    'Friendly reminder — no pressure tone',
    'Light urgency — showing what they might miss',
    'Final message — clear deadline or consequences',
  ]

  return (
    <div>
      {/* Urgency scale */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 14, padding: '10px 14px',
        background: D.faint, borderRadius: 8, border: `1px solid ${D.bdr}`,
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: D.muted, flexShrink: 0 }}>Urgency:</span>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${D.gl}, ${D.amber}, ${D.red})`, margin: '0 10px' }}/>
        <span style={{ fontSize: 11, color: D.red, fontWeight: 700, flexShrink: 0 }}>High</span>
      </div>

      {messages.slice(0, 3).map((msg, i) => {
        const color = urgencyColor(i)
        const { done, copy } = useCopy(msg.text) // eslint-disable-line -- safe as static index
        return (
          <WinBackCard
            key={i} msg={msg} index={i}
            color={color}
            label={urgencyLabels[i] ?? msg.type}
            desc={urgencyDesc[i] ?? ''}
          />
        )
      })}
    </div>
  )
}

// Separate component to avoid hooks-in-map issue
function WinBackCard({ msg, index, color, label, desc }: {
  msg: WhatsAppMessage; index: number; color: string; label: string; desc: string
}) {
  const [open, setOpen] = useState(index === 0)
  const { done, copy } = useCopy(msg.text)

  return (
    <div style={{ marginBottom: 10, borderRadius: 12, border: `1.5px solid ${color}35`, overflow: 'hidden' }}>
      {/* Card header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '10px 14px', cursor: 'pointer',
          background: `${color}08`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: `${color}18`, border: `1.5px solid ${color}45`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color,
        }}>{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color, margin: '0 0 2px' }}>{label}</p>
          <p style={{ fontSize: 11, color: D.muted, margin: 0 }}>{desc}</p>
        </div>
        {msg.timing && <span style={{ fontSize: 10.5, color: D.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>{msg.timing}</span>}
        <ChevronDown size={13} style={{ color: D.muted, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
      </div>

      {open && (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${color}18` }}>
          <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.75, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: D.muted }}>{msg.text.length} chars</span>
            <button onClick={copy} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 13px', borderRadius: 7, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
              border: `1px solid ${done ? 'rgba(18,212,180,.4)' : `${color}30`}`,
              background: done ? 'rgba(18,212,180,.1)' : `${color}0d`,
              color: done ? D.teal : color, transition: 'all .18s', minHeight: 32,
            }}>
              {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface WhatsAppGroupOutputProps {
  outputJson:    WhatsAppOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
}

export function WhatsAppGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave,
}: WhatsAppGroupOutputProps) {
  const messages = outputJson.essentials?.messages ?? []
  const formula  = outputJson.formula  ?? ''
  const headline = outputJson.headline ?? 'WhatsApp messages generated'
  const span     = outputJson.campaign_span ?? ''

  // All messages text for copy all
  const allText = messages.map((m, i) =>
    `Message ${i + 1} (${m.type}) ${m.timing ? '· ' + m.timing : ''}\n${m.text}`
  ).join('\n\n─────\n\n')
  const { done: allDone, copy: copyAll } = useCopy(allText)

  const toolLabels: Record<string, string> = {
    'whatsapp-campaign-builder': '💬 Campaign Builder',
    'follow-up-sequencer':       '🔄 Follow-up Sequencer',
    'welcome-message-craft':     '👋 Welcome Message',
    'win-back-campaign':         '🔙 Win-Back Campaign',
  }

  function renderVisualMode() {
    switch (toolId) {
      case 'follow-up-sequencer':  return <TimelineView messages={messages}/>
      case 'welcome-message-craft':return <WelcomeView  messages={messages}/>
      case 'win-back-campaign':    return <WinBackView  messages={messages}/>
      default:                     return <CampaignThread messages={messages} formula={formula}/>
    }
  }

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`
        @media(max-width:600px){
          .wago-actions{flex-direction:column!important}
          .wago-actions>button{width:100%!important}
          .wago-stats{flex-wrap:wrap!important}
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderBottom: `1px solid ${D.bdr}`,
          flexWrap: 'wrap', gap: 8, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
            }}>💬</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: D.w, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                {headline}
              </p>
              <p style={{ fontSize: 11, color: D.muted, margin: 0 }}>
                {toolLabels[toolId] || toolId} · {coinsSpent}⊙
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {onSave && (
              <button onClick={onSave} style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isSaved ? 'rgba(224,152,24,.4)' : D.bdr}`, background: isSaved ? 'rgba(224,152,24,.1)' : D.faint, color: isSaved ? D.gl : D.muted, cursor: 'pointer' }}>
                {isSaved ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${D.bdr}`, background: D.faint, color: D.muted, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, minHeight: 34 }}>
                <RefreshCw size={12}/> Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        {messages.length > 0 && (
          <div className="wago-stats" style={{ display: 'flex', borderBottom: `1px solid ${D.bdr}`, flexShrink: 0 }}>
            {[
              { n: messages.length,          l: 'messages'      },
              { n: span || 'Sequence',       l: 'campaign span' },
              { n: messages.reduce((a,m) => a + m.text.length, 0) + ' chars', l: 'total content' },
            ].map(({ n, l }, i) => (
              <div key={l} style={{ flex: 1, padding: '10px 14px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${D.bdr}` : 'none' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: D.w, margin: '0 0 2px', fontFamily: "'Georgia',serif" }}>{n}</p>
                <p style={{ fontSize: 10.5, color: D.muted, margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
          {renderVisualMode()}

          {/* Deep Dive trigger */}
          <div style={{ marginTop: 18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="wago-actions" style={{
          padding: '10px 14px', borderTop: `1px solid ${D.bdr}`,
          display: 'flex', gap: 8, flexShrink: 0,
          background: 'rgba(6,12,26,.97)', backdropFilter: 'blur(14px)',
        }}>
          <button onClick={copyAll} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 800,
            border: `1px solid ${allDone ? 'rgba(18,212,180,.4)' : 'rgba(37,211,102,.35)'}`,
            background: allDone ? 'rgba(18,212,180,.14)' : 'rgba(37,211,102,.1)',
            color: allDone ? D.teal : D.wa, transition: 'all .18s', minHeight: 46,
          }}>
            {allDone
              ? <><Check size={14}/> All {messages.length} messages copied!</>
              : <><Copy size={14}/> Copy all {messages.length} messages</>}
          </button>
        </div>

        {/* Deep Dive drawer */}
        <DeepDiveDrawer headline={headline}/>
      </div>
    </DeepDiveProvider>
  )
}
