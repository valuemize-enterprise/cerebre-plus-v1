'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/ToolPage.tsx
// Universal tool page — handles all 40 tools.
// Desktop: 40% form | 60% output split layout.
// Mobile: Brief tab | Output tab.
// All UX North Star principles applied throughout.
// ═══════════════════════════════════════════════════════════════

import React, {
  useState, useCallback, useEffect, useRef, useMemo,
  type ChangeEvent,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCompletion }    from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coins, ChevronDown, ChevronUp, Sparkles,
  MessageCircle, Wifi, WifiOff, AlertTriangle,
  ArrowRight, CheckCircle2, Clock,
} from 'lucide-react'

import type { ToolDefinition, ToolFormField } from '@/lib/tools/registry'
import { getNextTools }    from '@/lib/tools/registry'
import { OutputRenderer }  from '@/components/tools/OutputRenderer'
import { LoadingStages }   from '@/components/ui/LoadingStages'
import { ToolCard }        from '@/components/tools/ToolCard'
import { CoinDisplay }     from '@/components/ui/CardBadgeSkeleton'
import { useUser }         from '@/lib/hooks/useUser'
import { useToast }        from '@/components/ui/ModalToastSelect'
import { SuggestionStrip } from '@/components/tools/SuggestionStrip'
import { AISuggestionStrip, AI_ELIGIBLE_SEMANTICS } from '@/components/tools/AISuggestionStrip'
import {
  getFieldSuggestions,
  detectFieldSemantic,
  fieldIsEligibleForSuggestions,
  type ProfileContext,
} from './form-suggestions'

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const NAVY  = '#0B1F3A'
const GOLD  = '#E09818'
const PRIMARY_FIELDS = 4  // Show this many before the "more context" toggle

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ToolPageProps {
  tool:            ToolDefinition
  coinBalance:     number
  prefill?:        Record<string, string> | null
  onCoinDeducted?: (cost: number) => void
}

type MobileTab = 'brief' | 'output'

interface FormState {
  [key: string]: string | string[] | boolean
}

// ─────────────────────────────────────────────────────────────
// FORM FIELD RENDERER
// ─────────────────────────────────────────────────────────────

function FormField({
  field,
  value,
  onChange,
}: {
  field:    ToolFormField
  value:    string | string[] | boolean
  onChange: (key: string, val: string | string[] | boolean) => void
}) {
  const base = `
    w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5
    text-sm text-white placeholder:text-white/30
    focus:outline-none focus:ring-2 focus:ring-[#E09818]/50 focus:border-[#E09818]/50
    transition-all duration-150
  `.trim()

  if (field.type === 'toggle') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        onClick={() => onChange(field.key, !value)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${value ? 'bg-[#E09818]' : 'bg-white/20'}
        `}
      >
        <span className={`
          inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200
          ${value ? 'translate-x-6' : 'translate-x-1'}
        `} />
      </button>
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={value as string}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={`${base} cursor-pointer`}
        style={{ background: NAVY }}
      >
        <option value="" disabled>Select an option…</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value as string[] : []
    return (
      <div className="flex flex-wrap gap-2">
        {field.options?.map((opt) => {
          const isOn = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                const next = isOn
                  ? selected.filter((v) => v !== opt.value)
                  : [...selected, opt.value]
                onChange(field.key, next)
              }}
              className={`
                rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150
                ${isOn
                  ? 'bg-[#E09818] border-[#E09818] text-[#0B1F3A]'
                  : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'}
              `}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value as string}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        rows={field.rows ?? 3}
        maxLength={field.maxLength}
        className={`${base} resize-none`}
      />
    )
  }

  // Default: text / number
  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value as string}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      className={base}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// RESTORE TOAST
// ─────────────────────────────────────────────────────────────

function RestoreToast({ onRestore, onDismiss }: { onRestore: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 rounded-lg border border-[#E09818]/30 bg-[#0B1F3A] px-4 py-3 shadow-lg"
    >
      <Clock className="h-4 w-4 text-[#E09818] shrink-0" />
      <span className="text-sm text-white/80">Resume where you left off?</span>
      <button onClick={onRestore} className="ml-auto text-sm font-semibold text-[#E09818] hover:opacity-80">
        Restore
      </button>
      <button onClick={onDismiss} className="text-sm text-white/40 hover:text-white/60">
        No thanks
      </button>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN TOOL PAGE
// ─────────────────────────────────────────────────────────────

export default function ToolPage({ tool, coinBalance, prefill, onCoinDeducted }: ToolPageProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  // ?free=1 → user is running their one-time free tool from the dashboard widget
  const isFreeRun    = searchParams.get('free') === '1'
  const { toast } = useToast()
  const { profile } = useUser()

  // Build suggestion context from the user's saved profile.
  // useMemo so we don't recompute on every render.
  const profileCtx = useMemo((): ProfileContext => ({
    businessName:     profile?.business_name,
    industry:         profile?.industry,
    city:             profile?.city,
    targetCustomer:   profile?.target_customer,
    description:      profile?.description,
    uniqueAdvantage:  profile?.unique_advantage,
    primaryGoal:      (profile as any)?.primaryGoal    as string | undefined,
    primaryChallenge: (profile as any)?.primaryChallenge as string | undefined,
  }), [profile])

  // ── State ─────────────────────────────────────────────────
  const [mobileTab,     setMobileTab]     = useState<MobileTab>('brief')
  const [showMore,      setShowMore]      = useState(false)
  const [form,          setForm]          = useState<FormState>({})
  const [showRestore,   setShowRestore]   = useState(false)
  const [savedForm,     setSavedForm]     = useState<FormState | null>(null)
  const [generationId,  setGenerationId]  = useState<string | undefined>(undefined)
  const [balanceAfter,  setBalanceAfter]  = useState(coinBalance)
  const [isOnline,      setIsOnline]      = useState(true)
  const [cachedOutput,  setCachedOutput]  = useState<string | null>(null)

  const outputPanelRef = useRef<HTMLDivElement>(null)
  const storageKey     = `cerebre_form_${tool.id}`
  const cacheKey       = `cerebre_output_${tool.id}`

  // ── Initialise default values ─────────────────────────────
  useEffect(() => {
    const defaults: FormState = {}
    tool.formBlocks.forEach((f) => {
      if (f.defaultValue !== undefined) {
        defaults[f.key] = f.defaultValue as string | string[] | boolean
      }
    })
    // Apply idea prefill if provided (overwrites defaults for matching keys)
    if (prefill) {
      Object.entries(prefill).forEach(([k, v]) => {
        defaults[k] = v
      })
    }
    setForm(defaults)
  }, [tool.id, prefill])

  // ── Online / offline detection ────────────────────────────
  useEffect(() => {
    const online  = () => setIsOnline(true)
    const offline = () => setIsOnline(false)
    window.addEventListener('online',  online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online',  online)
      window.removeEventListener('offline', offline)
    }
  }, [])

  // ── Load saved form from localStorage ────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as FormState
        setSavedForm(parsed)
        setShowRestore(true)
      }
    } catch { /* ignore */ }

    // Load cached output
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) setCachedOutput(cached)
    } catch { /* ignore */ }
  }, [storageKey, cacheKey])

  // ── Auto-save form to localStorage on every change ───────
  const handleFormChange = useCallback((key: string, val: string | string[] | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch { /* storage full — fail silently */ }
      return next
    })
  }, [storageKey])

  // ── Restore saved form ────────────────────────────────────
  const handleRestore = useCallback(() => {
    if (savedForm) setForm(savedForm)
    setShowRestore(false)
  }, [savedForm])

  // ── Streaming via Vercel AI SDK useCompletion ─────────────
  const {
    completion,
    complete,
    isLoading,
    error: completionError,
    stop,
  } = useCompletion({
    api: `/api/generate/${tool.id}`,
    onResponse: (response) => {
      // Read response headers for generation metadata
      const genId        = response.headers.get('X-Generation-Id')
      const balAfter     = response.headers.get('X-Balance-After')
      if (genId)    setGenerationId(genId)
      if (balAfter) {
        const bal = parseInt(balAfter, 10)
        setBalanceAfter(bal)
        onCoinDeducted?.(bal)
      }

      // Switch to output tab on mobile
      setMobileTab('output')

      // Scroll output panel into view on desktop
      setTimeout(() => {
        outputPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    },
    onFinish: (_prompt, completion) => {
      // Cache the last 10 outputs locally
      try {
        const history: string[] = JSON.parse(
          localStorage.getItem(`cerebre_history_${tool.id}`) || '[]'
        )
        history.unshift(completion)
        history.splice(10)
        localStorage.setItem(`cerebre_history_${tool.id}`, JSON.stringify(history))
        localStorage.setItem(cacheKey, completion)
        setCachedOutput(completion)
      } catch { /* ignore */ }
    },
    onError: (err) => {
      let msg = 'Generation failed. No coins were deducted.'
      try {
        const parsed = JSON.parse(err.message)
        msg = parsed.message || msg
        if (parsed.code === 'INSUFFICIENT_COINS') {
          toast({ type: 'warning', title: 'Not enough coins', description: msg })
          return
        }
      } catch { /* err.message is plain text */ }
      toast({ type: 'error', title: 'Generation failed', description: msg })
    },
  })

  // ── Submit handler ────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (isLoading) { stop(); return }

    // Validate required fields
    const primaryFields = tool.formBlocks.filter((f) => f.tier === 'primary' && f.required)
    const missing = primaryFields.filter((f) => {
      const v = form[f.key]
      if (Array.isArray(v)) return v.length === 0
      return !v
    })

    if (missing.length > 0) {
      toast({
        type:        'warning',
        title:       'Missing required fields',
        description: `Please fill in: ${missing.map((f) => f.label).join(', ')}`,
      })
      return
    }

    if (!isOnline) {
      toast({
        type:        'warning',
        title:       'You\'re offline',
        description: 'Check your connection and try again.',
      })
      return
    }

    await complete('', {
      body: { inputs: form, freeRun: isFreeRun },
    })
  }, [isLoading, stop, form, tool.formBlocks, isOnline, complete, toast])

  // ── Derived state ─────────────────────────────────────────
  const canAfford      = coinBalance >= tool.coinCost
  const primaryFields  = tool.formBlocks.filter((f) => f.tier === 'primary')
  const moreFields     = tool.formBlocks.filter((f) => f.tier === 'more_context')
  const hasOutput      = Boolean(completion || cachedOutput)
  const displayOutput  = completion || cachedOutput || ''
  const nextTools      = getNextTools(tool.id)

  // ── Profile chip data ─────────────────────────────────────
  const profileFieldsUsed = tool.profiling.filter((f) => Boolean(profile?.[f as keyof typeof profile]))
  const profileComplete   = Math.round((profileFieldsUsed.length / tool.profiling.length) * 100)

  // ─────────────────────────────────────────────────────────
  // FORM PANEL
  // ─────────────────────────────────────────────────────────

  const FormPanel = (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Tool header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0B1F3A]/95 px-5 pt-5 pb-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{tool.icon}</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-white leading-tight">{tool.name}</h1>
            <p className="mt-0.5 text-xs text-white/50">{tool.tagline}</p>
          </div>
          {/* Coin cost badge */}
          <div className={`
            flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shrink-0
            ${canAfford
              ? 'bg-[#E09818]/15 text-[#E09818] border border-[#E09818]/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'}
          `}>
            <Coins className="h-3 w-3" />
            {tool.coinCost}
          </div>
        </div>

        {/* Profile loaded chip */}
        {profileFieldsUsed.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300">
              Profile loaded — {profileFieldsUsed.length}/{tool.profiling.length} fields auto-filled
            </span>
          </div>
        )}

        {/* Offline warning */}
        {!isOnline && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
            <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-amber-300">You're offline — generations will resume when reconnected</span>
          </div>
        )}
      </div>

      {/* Restore toast */}
      <div className="px-5 pt-3">
        <AnimatePresence>
          {showRestore && (
            <RestoreToast
              onRestore={handleRestore}
              onDismiss={() => setShowRestore(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Form fields */}
      <div className="flex-1 space-y-5 px-5 py-4">
        {/* Primary fields (always visible) */}
        {primaryFields.map((field) => {
          if (!fieldIsEligibleForSuggestions(field.type)) {
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                  {field.label}
                  {field.required && <span className="text-[#E09818] text-xs">*</span>}
                  {field.helpText && (
                    <span className="text-white/30 text-xs font-normal">— {field.helpText}</span>
                  )}
                </label>
                <FormField
                  field={field}
                  value={form[field.key] ?? (field.type === 'multiselect' ? [] : field.type === 'toggle' ? false : '')}
                  onChange={handleFormChange}
                />
              </div>
            )
          }

          const semantic  = detectFieldSemantic(field.key, field.label || '')
          const fieldVal  = String(form[field.key] ?? '')
          const showStrip = fieldVal.length < 30
          const existingInputs = Object.fromEntries(
            Object.entries(form).filter(([k]) => k !== field.key && typeof form[k] === 'string' && String(form[k]).length > 0)
          ) as Record<string, string>

          return (
            <div key={field.key} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                {field.label}
                {field.required && <span className="text-[#E09818] text-xs">*</span>}
                {field.helpText && (
                  <span className="text-white/30 text-xs font-normal">— {field.helpText}</span>
                )}
              </label>
              <FormField
                field={field}
                value={form[field.key] ?? ''}
                onChange={handleFormChange}
              />
              {showStrip && AI_ELIGIBLE_SEMANTICS.has(semantic) ? (
                <AISuggestionStrip
                  fieldId={field.key}
                  fieldLabel={field.label || ''}
                  fieldSemantic={semantic}
                  toolId={tool.id}
                  toolName={tool.name}
                  existingInputs={existingInputs}
                  onSelect={v => handleFormChange(field.key, v)}
                  visible={showStrip}
                />
              ) : showStrip ? (
                <SuggestionStrip
                  suggestions={getFieldSuggestions(field.key, field.label || '', profileCtx)}
                  onSelect={v => handleFormChange(field.key, v)}
                  visible={showStrip}
                />
              ) : null}
            </div>
          )
        })}

        {/* More context toggle */}
        {moreFields.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2.5 text-sm text-white/50 hover:border-white/30 hover:text-white/70 transition-all duration-150"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#E09818]" />
              <span>More context = better results</span>
              <span className="ml-auto text-[#E09818] text-xs">
                +{moreFields.length} optional fields
              </span>
              {showMore
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
            </button>

            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-5">
                    {moreFields.map((field) => {
                      const sugs = fieldIsEligibleForSuggestions(field.type)
                        ? getFieldSuggestions(field.key, field.label || '', profileCtx)
                        : []
                      const fieldVal = String(form[field.key] ?? '')
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-sm font-medium text-white/60">
                            {field.label}
                            <span className="text-white/30 text-xs font-normal">(optional)</span>
                          </label>
                          <FormField
                            field={field}
                            value={form[field.key] ?? (field.type === 'multiselect' ? [] : field.type === 'toggle' ? false : '')}
                            onChange={handleFormChange}
                          />
                          {(() => {
                            const sem = detectFieldSemantic(field.key, field.label || '')
                            const fv  = String(form[field.key] || '')
                            const show= fv.length < 30
                            const ei  = Object.fromEntries(Object.entries(form).filter(([k])=>k!==field.key&&typeof form[k]==='string'&&String(form[k]).length>0)) as Record<string,string>
                            if (!show) return null
                            return AI_ELIGIBLE_SEMANTICS.has(sem) ? (
                              <AISuggestionStrip fieldId={field.key} fieldLabel={field.label||''} fieldSemantic={sem} toolId={tool.id} toolName={tool.name} existingInputs={ei} onSelect={v=>handleFormChange(field.key,v)} visible={show}/>
                            ) : (
                              <SuggestionStrip suggestions={getFieldSuggestions(field.key,field.label||'',profileCtx)} onSelect={v=>handleFormChange(field.key,v)} visible={show}/>
                            )
                          })()}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sticky generate button */}
      <div className="sticky bottom-0 border-t border-white/10 bg-[#0B1F3A]/95 px-5 py-4 backdrop-blur-sm">
        {!canAfford && (
          <p className="mb-2 text-center text-xs text-red-400">
            You need {tool.coinCost} coins. You have {coinBalance}.{' '}
            <button
              onClick={() => router.push('/coins')}
              className="text-[#E09818] underline"
            >
              Top up
            </button>
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canAfford || !isOnline}
          className={`
            relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold
            transition-all duration-200 active:scale-[0.98]
            ${canAfford && isOnline
              ? 'bg-[#E09818] text-[#0B1F3A] hover:bg-[#F0A828] shadow-lg shadow-[#E09818]/20'
              : 'bg-white/10 text-white/40 cursor-not-allowed'}
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span>Generating</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
              <span className="flex items-center gap-1 rounded-full bg-[#0B1F3A]/20 px-2 py-0.5 text-xs">
                <Coins className="h-3 w-3" />
                {tool.coinCost}
              </span>
            </span>
          )}

          {/* Animated shimmer when loading */}
          {isLoading && (
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ translateX: ['−100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </button>

        {isLoading && (
          <button
            onClick={stop}
            className="mt-2 w-full text-center text-xs text-white/30 hover:text-white/50"
          >
            Stop generation
          </button>
        )}
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────
  // OUTPUT PANEL
  // ─────────────────────────────────────────────────────────

  const OutputPanel = (
    <div ref={outputPanelRef} className="flex h-full flex-col overflow-y-auto">
      {/* Loading stages (while streaming is in progress before text appears) */}
      <AnimatePresence>
        {isLoading && !completion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-8"
          >
            <LoadingStages
              messages={tool.loadingMessages}
              estimatedSeconds={tool.estimatedSeconds}
              toolName={tool.name}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!hasOutput && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ background: `${tool.accentColour}15`, border: `1px solid ${tool.accentColour}30` }}
          >
            {tool.icon}
          </div>
          <h3 className="text-base font-semibold text-white">Ready to generate</h3>
          <p className="mt-1.5 max-w-[280px] text-sm text-white/40">
            Fill in your details on the{' '}
            <button onClick={() => setMobileTab('brief')} className="text-[#E09818] hover:underline md:hidden">
              Brief tab
            </button>
            <span className="hidden md:inline">left</span>
            {' '}and tap Generate to create your {tool.name} output.
          </p>

          {/* Output sections preview */}
          <div className="mt-6 w-full max-w-sm">
            <p className="mb-2 text-xs text-white/30 text-left">This tool generates:</p>
            <div className="space-y-1.5">
              {tool.outputSections.slice(0, 5).map((section) => (
                <div
                  key={section}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50"
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: tool.accentColour }}
                  />
                  {section}
                </div>
              ))}
              {tool.outputSections.length > 5 && (
                <p className="text-center text-xs text-white/25">
                  +{tool.outputSections.length - 5} more sections
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Streaming / complete output */}
      {(completion || (cachedOutput && !isLoading)) && (
        <div className="flex-1">
          <OutputRenderer
            text={completion || cachedOutput || ''}
            isStreaming={isLoading}
            toolId={tool.id}
            toolName={tool.name}
            toolCategory={tool.category as any}
            outputSections={tool.outputSections}
            coinsSpent={tool.coinCost}
            generationId={generationId}
            whatsappEnabled={tool.whatsappEnabled}
          />
        </div>
      )}

      {/* "What to do next" recommendations */}
      {hasOutput && !isLoading && nextTools.length > 0 && (
        <div className="border-t border-white/10 px-5 py-6">
          <h3 className="mb-3 text-sm font-semibold text-white/60 uppercase tracking-wider">
            What to do next
          </h3>
          <div className="space-y-2">
            {nextTools.map((nextTool) => (
              <button
                key={nextTool.id}
                onClick={() => router.push(`/tools/${nextTool.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/8 active:scale-[0.98]"
              >
                <span className="text-xl">{nextTool.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{nextTool.name}</p>
                  <p className="text-xs text-white/40 truncate">{nextTool.tagline}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Coins className="h-3 w-3 text-[#E09818]" />
                  <span className="text-xs text-[#E09818]">{nextTool.coinCost}</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5 text-white/30" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {completionError && !isLoading && (
        <div className="m-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">Generation failed</p>
              <p className="mt-1 text-xs text-red-400/80">
                {completionError.message || 'Something went wrong. No coins were deducted.'}
              </p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-xs text-red-300 underline hover:text-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col" style={{ background: NAVY }}>

      {/* ── MOBILE LAYOUT ─────────────────────────────────── */}
      <div className="flex flex-col h-full md:hidden">

        {/* Mobile tab bar */}
        <div className="flex border-b border-white/10 bg-[#0B1F3A]/95 shrink-0">
          {(['brief', 'output'] as MobileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`
                flex-1 py-3 text-sm font-semibold transition-all duration-150
                ${mobileTab === tab
                  ? 'text-[#E09818] border-b-2 border-[#E09818]'
                  : 'text-white/40 hover:text-white/60'}
              `}
            >
              {tab === 'brief' ? 'Brief' : (
                <span className="flex items-center justify-center gap-1.5">
                  Output
                  {isLoading && (
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="inline-block h-1 w-1 rounded-full bg-[#E09818] animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  )}
                  {hasOutput && !isLoading && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile tab content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileTab}
              initial={{ opacity: 0, x: mobileTab === 'brief' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mobileTab === 'brief' ? 16 : -16 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0"
            >
              {mobileTab === 'brief' ? FormPanel : OutputPanel}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ────────────────────────────────── */}
      <div className="hidden md:flex h-full overflow-hidden">

        {/* Left: Form panel (40%) */}
        <div
          className="w-2/5 shrink-0 border-r border-white/10 overflow-hidden"
          style={{ maxWidth: 480 }}
        >
          {FormPanel}
        </div>

        {/* Right: Output panel (60%) */}
        <div className="flex-1 overflow-hidden">
          {OutputPanel}
        </div>
      </div>
    </div>
  )
}
