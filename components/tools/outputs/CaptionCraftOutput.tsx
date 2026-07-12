'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/CaptionCraftOutput.tsx
//
// GROUP 1 — CAPTION (covers all caption/short-copy tools)
// Unique to CaptionCraft: Instagram post preview frame that renders
// the caption as it would look inside a real social feed post.
//
// Tools using this component:
//   caption-craft, ad-scribe, copy-brain, promo-blast,
//   bio-builder, product-describer, review-requestor, pricing-narrator
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Check, Clock, Hash, RefreshCw, Bookmark, BookmarkCheck, Share2, ChevronRight, Instagram, Link2 } from 'lucide-react'
import type { CaptionOutput, CaptionVariant, CaptionDeepDive } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Design tokens ─────────────────────────────────────────────
const D = {
  dark:   '#060C1A',
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
}

// Platform colour map
const PLATFORM_COLORS: Record<string, { primary: string; bg: string; name: string }> = {
  Instagram: { primary: '#E1306C', bg: 'rgba(225,48,108,.1)',  name: 'Instagram' },
  Facebook:  { primary: '#1877F2', bg: 'rgba(24,119,242,.1)', name: 'Facebook'  },
  LinkedIn:  { primary: '#0A66C2', bg: 'rgba(10,102,194,.1)', name: 'LinkedIn'  },
  TikTok:    { primary: '#69C9D0', bg: 'rgba(105,201,208,.1)',name: 'TikTok'    },
  Twitter:   { primary: '#1DA1F2', bg: 'rgba(29,161,242,.1)', name: 'Twitter'   },
  WhatsApp:  { primary: '#25D366', bg: 'rgba(37,211,102,.1)', name: 'WhatsApp'  },
  All:       { primary: D.gold,    bg: 'rgba(224,152,24,.1)',  name: 'All'       },
}

function getPlatformColor(platform: string) {
  return PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.Instagram
}

// ── Copy hook ──────────────────────────────────────────────────
function useCopy(text: string, duration = 2000) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), duration)
  }, [text, duration])
  return { done, copy }
}

// ── Hashtag pill ───────────────────────────────────────────────
function HashPill({ tag }: { tag: string }) {
  const { done, copy } = useCopy(`#${tag}`)
  return (
    <button onClick={copy} style={{
      padding: '4px 11px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 12, fontWeight: 600,
      border:  `1px solid ${done ? 'rgba(18,212,180,.45)' : 'rgba(18,212,180,.22)'}`,
      background: done ? 'rgba(18,212,180,.14)' : 'rgba(18,212,180,.06)',
      color: done ? D.teal : 'rgba(18,212,180,.8)',
      transition: 'all .18s',
    }}>
      {done ? '✓ ' : '#'}{tag}
    </button>
  )
}

// ── Instagram post preview frame ───────────────────────────────
interface PostPreviewProps {
  variant:      CaptionVariant
  platform:     string
  businessName: string
  isActive:     boolean
}

function PostPreview({ variant, platform, businessName, isActive }: PostPreviewProps) {
  const pColor = getPlatformColor(platform)
  const { done, copy } = useCopy(variant.text)

  // Derive a clean Instagram handle from business name
  const handle = '@' + businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 20)

  // First initial of business name for avatar
  const initial = (businessName || 'B')[0].toUpperCase()

  const charLimit = platform === 'Instagram' ? 2200
    : platform === 'Facebook' ? 63206
    : platform === 'LinkedIn' ? 3000
    : platform === 'Twitter' ? 280
    : 1000

  const isOverLimit = variant.char_count > charLimit

  return (
    <div style={{
      borderRadius: 14,
      border: `1.5px solid ${isActive ? pColor.primary + '50' : D.bdr}`,
      overflow: 'hidden',
      background: D.card,
      transition: 'all .22s',
      boxShadow: isActive ? `0 8px 32px ${pColor.primary}18` : 'none',
    }}>
      {/* Post header — mimics social feed */}
      <div style={{
        padding: '12px 14px',
        background: `linear-gradient(135deg, ${D.navy}, ${D.card})`,
        borderBottom: `1px solid ${D.bdr}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${pColor.primary}, ${pColor.primary}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color: '#fff',
          border: `2px solid ${pColor.primary}50`,
        }}>
          {initial}
        </div>
        {/* Handle + platform */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: D.w, lineHeight: 1 }}>{businessName}</div>
          <div style={{ fontSize: 11, color: D.muted, marginTop: 2 }}>{handle}</div>
        </div>
        {/* Platform badge */}
        <div style={{
          fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: pColor.bg, border: `1px solid ${pColor.primary}35`,
          color: pColor.primary, letterSpacing: '.3px',
        }}>
          {platform}
        </div>
        {/* Variant label */}
        <div style={{
          fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: isActive ? `${pColor.primary}18` : D.faint,
          border: `1px solid ${isActive ? pColor.primary + '35' : D.bdr}`,
          color: isActive ? pColor.primary : D.muted, letterSpacing: '.3px',
        }}>
          {variant.label}
        </div>
      </div>

      {/* Image placeholder */}
      <div style={{
        height: 4, width: '100%',
        background: `linear-gradient(90deg, ${pColor.primary}40, ${D.teal}30, ${pColor.primary}20)`,
      }}/>

      {/* Caption body */}
      <div style={{ padding: '14px 14px 10px' }}>
        <p style={{
          fontSize: 13.5, color: D.dim, lineHeight: 1.78,
          margin: 0, whiteSpace: 'pre-wrap',
          fontFamily: "'system-ui', sans-serif",
        }}>
          {variant.text}
        </p>
      </div>

      {/* Hashtags inside the post */}
      {variant.hashtags.length > 0 && (
        <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {variant.hashtags.slice(0, 5).map(tag => (
            <span key={tag} style={{ fontSize: 12, color: pColor.primary, fontWeight: 600 }}>#{tag}</span>
          ))}
          {variant.hashtags.length > 5 && (
            <span style={{ fontSize: 12, color: D.muted }}>+{variant.hashtags.length - 5} more</span>
          )}
        </div>
      )}

      {/* Post footer */}
      <div style={{
        padding: '10px 14px',
        borderTop: `1px solid ${D.bdr}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, color: isOverLimit ? D.dim + 'cc' : D.muted,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
              background: variant.char_count <= 150 ? D.teal : variant.char_count <= 280 ? D.gl : D.gold,
            }}/>
            {variant.char_count} chars
            {isOverLimit && (
              <span style={{ color: '#E55252', marginLeft: 3 }}>· Over {platform} limit</span>
            )}
          </span>
        </div>
        {/* Copy button — most important interaction */}
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
            border: `1px solid ${done ? 'rgba(18,212,180,.45)' : D.bdr}`,
            background: done ? 'rgba(18,212,180,.12)' : D.faint,
            color: done ? D.teal : D.muted,
            transition: 'all .18s',
            minHeight: 34,  // 44px touch target height
          }}
        >
          {done ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy caption</>}
        </button>
      </div>
    </div>
  )
}

// ── Platform tab ───────────────────────────────────────────────
function PlatformTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const pColor = getPlatformColor(label)
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 13, fontWeight: active ? 700 : 500,
      color: active ? pColor.primary : D.muted,
      background: 'none', border: 'none',
      borderBottom: `2px solid ${active ? pColor.primary : 'transparent'}`,
      transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
      minHeight: 44,  // accessibility — minimum touch target
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: active ? pColor.primary : D.muted,
        display: 'inline-block', flexShrink: 0,
      }}/>
      {label}
    </button>
  )
}

// ── Deep Dive content renderer (caption-specific) ──────────────
function CaptionDeepDiveContent({ data }: { data: Record<string, unknown> }) {
  const deepDive = (data.deep_dive ?? data) as Partial<CaptionDeepDive>

  const sections: Array<{ key: keyof CaptionDeepDive; label: string }> = [
    { key: 'strategy_notes',      label: 'Why these captions work'    },
    { key: 'why_this_works',      label: 'Platform psychology'         },
    { key: 'brand_voice_analysis',label: 'Brand voice analysis'        },
    { key: 'ab_test_suggestion',  label: 'A/B test recommendation'     },
  ]

  return (
    <div>
      {sections.map(({ key, label }) => {
        const val = deepDive[key]
        if (!val) return null
        return <DeepDiveSection key={key} title={label} content={String(val)}/>
      })}

      {deepDive.alternative_angles && deepDive.alternative_angles.length > 0 && (
        <DeepDiveSection
          title="Alternative angles to explore"
          content={deepDive.alternative_angles}
        />
      )}
    </div>
  )
}

function DeepDiveSection({ title, content }: { title: string; content: string | string[] }) {
  const text = Array.isArray(content) ? content.join('\n') : content
  const { done, copy } = useCopy(text)

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
        color: D.teal, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: D.teal, display: 'inline-block' }}/>
        {title}
      </div>

      {Array.isArray(content) ? (
        <div>
          {content.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '8px 0', borderTop: i > 0 ? `1px solid ${D.bdr}` : 'none',
            }}>
              <span style={{
                minWidth: 20, height: 20, borderRadius: '50%',
                background: 'rgba(18,212,180,.1)', border: '1px solid rgba(18,212,180,.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10.5, fontWeight: 800, color: D.teal, flexShrink: 0, marginTop: 1,
              }}>{i + 1}</span>
              <span style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.7 }}>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          position: 'relative',
          background: 'rgba(18,212,180,.05)', border: `1px solid rgba(18,212,180,.15)`,
          borderRadius: 10, padding: '14px 16px',
        }}>
          <p style={{ fontSize: 13.5, color: D.dim, lineHeight: 1.8, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
            {content}
          </p>
          <button onClick={copy} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700,
            border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`,
            background: done ? 'rgba(18,212,180,.1)' : D.faint,
            color: done ? D.teal : D.muted, transition: 'all .18s',
          }}>
            {done ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────────
interface CaptionCraftOutputProps {
  outputJson:   CaptionOutput
  generationId: string
  toolId?:      string
  coinsSpent:   number
  deepDiveCost: number
  onRegenerate?: () => void
  isSaved?:     boolean
  onSave?:      () => void
  // Business context for the post preview
  businessName: string
}

export function CaptionCraftOutput({
  outputJson,
  generationId,
  toolId = 'caption-craft',
  coinsSpent,
  deepDiveCost,
  onRegenerate,
  isSaved,
  onSave,
  businessName,
}: CaptionCraftOutputProps) {

  const [activeVariant, setActiveVariant] = useState(0)
  const variants = outputJson.essentials?.variants ?? []
  const allHashtags = useMemo(
    () => [...new Set(variants.flatMap(v => v.hashtags ?? []))],
    [variants],
  )
  const postingTime  = outputJson.essentials?.posting_time ?? ''
  const platform     = outputJson.platform || 'Instagram'
  const pColor       = getPlatformColor(platform)
  const headline     = outputJson.headline || 'Captions generated'

  const allText = variants.map((v, i) =>
    `Variant ${i + 1} — ${v.label}\n${v.text}\n\nHashtags: ${v.hashtags.map(h => `#${h}`).join(' ')}`
  ).join('\n\n---\n\n')
  const { done: allDone, copy: copyAll } = useCopy(allText)

  return (
    <DeepDiveProvider
      generationId={generationId}
      toolId={toolId}
      deepDiveCost={deepDiveCost}
      initialDeepDive={outputJson.deep_dive as any}
    >
      <style>{`
        @keyframes cc-spin { to { transform: rotate(360deg) } }
        @media(max-width:600px){
          .cc-actions { flex-direction: column !important }
          .cc-actions > button { width: 100% !important }
          .cc-tabs { overflow-x: auto !important; scrollbar-width: none !important }
          .cc-tabs::-webkit-scrollbar { display: none }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

        {/* ── Top bar ───────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderBottom: `1px solid ${D.bdr}`,
          flexWrap: 'wrap', gap: 8, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: pColor.bg, border: `1px solid ${pColor.primary}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>✍️</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: D.w,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {headline}
              </div>
              <div style={{ fontSize: 11, color: D.muted, marginTop: 1 }}>
                {coinsSpent} coins · {variants.length} variant{variants.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {onSave && (
              <button onClick={onSave} aria-label={isSaved ? 'Saved' : 'Save'} style={{
                width: 34, height: 34, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${isSaved ? 'rgba(224,152,24,.4)' : D.bdr}`,
                background: isSaved ? 'rgba(224,152,24,.1)' : D.faint,
                color: isSaved ? D.gl : D.muted, cursor: 'pointer',
              }}>
                {isSaved ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                border: `1px solid ${D.bdr}`, background: D.faint, color: D.muted,
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
                minHeight: 34,
              }}>
                <RefreshCw size={12}/>
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* ── Platform tabs ─────────────────────────────────── */}
        <div className="cc-tabs" style={{
          display: 'flex', borderBottom: `1px solid ${D.bdr}`,
          overflowX: 'auto', flexShrink: 0,
        }}>
          <PlatformTab label={platform} active={true} onClick={() => {}}/>
          {/* If the output has platform-specific variants, show tabs */}
        </div>

        {/* ── Scrollable content ────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

          {/* Variant navigation dots */}
          {variants.length > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {variants.length} caption variants
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {variants.map((_, i) => (
                  <button
                    key={i} onClick={() => setActiveVariant(i)}
                    aria-label={`View variant ${i + 1}`}
                    style={{
                      width: 8, height: 8, borderRadius: '50%', border: 'none',
                      padding: 0, cursor: 'pointer',
                      background: activeVariant === i ? D.gl : D.bdr,
                      transition: 'background .15s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active variant — Instagram post preview */}
          {variants[activeVariant] && (
            <div style={{ marginBottom: 12 }}>
              <PostPreview
                variant={variants[activeVariant]}
                platform={platform}
                businessName={businessName}
                isActive={true}
              />
            </div>
          )}

          {/* Other variants — collapsed previews */}
          {variants.length > 1 && variants.map((variant, i) => {
            if (i === activeVariant) return null
            const { done, copy } = useCopyStatic(variant.text)
            return (
              <div
                key={i}
                onClick={() => setActiveVariant(i)}
                style={{
                  background: D.faint, border: `1px solid ${D.bdr}`,
                  borderRadius: 12, padding: '11px 14px',
                  marginBottom: 8, cursor: 'pointer',
                  transition: 'all .18s', display: 'flex', gap: 12, alignItems: 'flex-start',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.18)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = D.bdr }}
              >
                <span style={{
                  fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 20, flexShrink: 0,
                  background: `${pColor.primary}15`, border: `1px solid ${pColor.primary}30`, color: pColor.primary,
                  marginTop: 2,
                }}>
                  {variant.label}
                </span>
                <p style={{
                  fontSize: 12.5, color: D.muted, flex: 1, margin: 0, lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {variant.text}
                </p>
                <button
                  onClick={e => { e.stopPropagation(); copy() }}
                  style={{
                    padding: '5px 10px', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                    fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, border: `1px solid ${D.bdr}`,
                    background: D.faint, color: done ? D.teal : D.muted, transition: 'all .18s',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {done ? <><Check size={11}/>Copied</> : <><Copy size={11}/>Copy</>}
                </button>
              </div>
            )
          })}

          {/* Hashtags */}
          {allHashtags.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
              }}>
                <Hash size={13} style={{ color: D.teal }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Hashtags
                </span>
                <CopyAllHashtags tags={allHashtags}/>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {allHashtags.map(tag => <HashPill key={tag} tag={tag}/>)}
              </div>
            </div>
          )}

          {/* Posting time */}
          {postingTime && (
            <div style={{
              marginTop: 16, padding: '11px 14px', borderRadius: 10,
              background: 'rgba(224,152,24,.06)', border: '1px solid rgba(224,152,24,.2)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <Clock size={14} style={{ color: D.gl, marginTop: 2, flexShrink: 0 }}/>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: D.gl, margin: '0 0 2px' }}>
                  Best posting time
                </p>
                <p style={{ fontSize: 12.5, color: D.dim, margin: 0, lineHeight: 1.55 }}>
                  {postingTime}
                </p>
              </div>
            </div>
          )}

          {/* Tell me more trigger */}
          <div style={{ marginTop: 18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* ── Sticky action bar ─────────────────────────────── */}
        <div className="cc-actions" style={{
          padding: '10px 14px', borderTop: `1px solid ${D.bdr}`,
          display: 'flex', gap: 8, flexShrink: 0,
          background: 'rgba(6,12,26,.97)', backdropFilter: 'blur(14px)',
        }}>
          <button
            onClick={copyAll}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13.5, fontWeight: 800,
              border: `1px solid ${allDone ? 'rgba(18,212,180,.4)' : 'rgba(224,152,24,.35)'}`,
              background: allDone ? 'rgba(18,212,180,.14)' : 'rgba(224,152,24,.14)',
              color: allDone ? D.teal : D.gl, transition: 'all .18s',
              minHeight: 46,
            }}
          >
            {allDone ? <><Check size={14}/>All copied!</> : <><Copy size={14}/>Copy all {variants.length} variants</>}
          </button>
          <button
            onClick={() => {
              const text = variants[activeVariant]?.text || ''
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.25)',
              color: '#25D366', fontSize: 13.5, fontWeight: 700, minHeight: 46,
            }}
          >
            <Share2 size={14}/>
          </button>
        </div>

        {/* Deep Dive Drawer — slides up when "Tell me more" is tapped */}
        <DeepDiveDrawer
          headline={headline}
          renderContent={(data) => <CaptionDeepDiveContent data={data}/>}
        />
      </div>
    </DeepDiveProvider>
  )
}

// Stable copy hook for mapped elements (avoids hooks-in-loops issues)
function useCopyStatic(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

function CopyAllHashtags({ tags }: { tags: string[] }) {
  const { done, copy } = useCopy(tags.map(t => `#${t}`).join(' '))
  return (
    <button onClick={copy} style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px',
      borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 11, fontWeight: 700,
      border: `1px solid ${done ? 'rgba(18,212,180,.4)' : D.bdr}`,
      background: done ? 'rgba(18,212,180,.1)' : D.faint,
      color: done ? D.teal : D.muted, transition: 'all .15s',
    }}>
      {done ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy all</>}
    </button>
  )
}
