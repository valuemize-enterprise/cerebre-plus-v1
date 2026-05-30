'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/competitor/page.tsx
// Competitor Intelligence — 40 coins.
// User describes competitors → Claude generates strategy gaps.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import { useRouter }    from 'next/navigation'
import { useCompletion }from 'ai/react'
import { motion }       from 'framer-motion'
import {
  Eye, Coins, Sparkles, AlertTriangle, ArrowRight,
  Plus, X, ChevronDown, Info,
} from 'lucide-react'
import ReactMarkdown    from 'react-markdown'
import { useUser }      from '@/lib/hooks/useUser'
import { useToast }     from '@/components/ui/ModalToastSelect'

const NAVY     = '#0B1F3A'
const GOLD     = '#E09818'
const TOOL_COST = 40

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function CompetitorPage() {
  const router      = useRouter()
  const { profile } = useUser()
  const { toast }   = useToast()

  const [competitors,  setCompetitors]  = useState<string[]>(['', '', ''])
  const [strengths,    setStrengths]    = useState('')
  const [weaknesses,   setWeaknesses]   = useState('')
  const [yourEdge,     setYourEdge]     = useState('')

  const addCompetitor  = () => setCompetitors((c) => [...c, ''])
  const removeComp     = (i: number) => setCompetitors((c) => c.filter((_, idx) => idx !== i))
  const updateComp     = (i: number, v: string) => setCompetitors((c) => { const n = [...c]; n[i] = v; return n })

  const filledCompetitors = competitors.filter(Boolean)

  const {
    completion,
    complete,
    isLoading,
    error,
    stop,
  } = useCompletion({
    api: '/api/generate/competitor',
    onResponse: () => {},
    onError: (err) => toast({ type: 'error', title: 'Analysis failed', description: err.message }),
  })

  const handleAnalyse = useCallback(async () => {
    if (filledCompetitors.length === 0) {
      toast({ type: 'warning', title: 'Add at least one competitor', description: 'Enter your competitors\' names or descriptions' })
      return
    }
    await complete('', {
      body: {
        competitors: filledCompetitors,
        strengths,
        weaknesses,
        yourEdge,
        profile: {
          business_name: profile?.business_name,
          industry:      profile?.industry,
          city:          profile?.city,
          unique_advantage: profile?.unique_advantage,
          target_customer:  profile?.target_customer,
          social_proof:  profile?.social_proof,
        },
      },
    })
  }, [filledCompetitors, strengths, weaknesses, yourEdge, profile, complete, toast])

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: NAVY }}>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#E09818]" />
              <h1 className="text-2xl font-black text-white">Competitor Intelligence</h1>
            </div>
            <p className="mt-1 text-sm text-white/40">
              AI-powered competitive strategy — what they're doing, what you're missing, what to do next.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[#E09818]/15 border border-[#E09818]/30 px-3 py-1">
            <Coins className="h-3.5 w-3.5 text-[#E09818]" />
            <span className="text-sm font-bold text-[#E09818]">{TOOL_COST}</span>
          </div>
        </div>

        {/* ── Disclaimer ─────────────────────────── */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80">
            Analysis is based on your assessment of competitors combined with AI marketing pattern recognition —
            not live web scraping. The more detail you provide, the sharper the strategic insight.
          </p>
        </div>

        {/* ── Input form ──────────────────────────── */}
        {!completion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Competitors */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Competitors (up to 5)
              </label>
              <div className="space-y-2">
                {competitors.map((comp, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={comp}
                      onChange={(e) => updateComp(i, e.target.value)}
                      placeholder={`Competitor ${i + 1} — name or description, e.g. "XYZ Events in VI"`}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40"
                    />
                    {competitors.length > 1 && (
                      <button onClick={() => removeComp(i)} className="rounded-xl border border-white/10 p-3 text-white/30 hover:text-red-400">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {competitors.length < 5 && (
                  <button
                    onClick={addCompetitor}
                    className="flex items-center gap-1.5 text-xs text-[#E09818] hover:opacity-80"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add another competitor
                  </button>
                )}
              </div>
            </div>

            {/* Their strengths */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-white/70">
                What are they doing well? (in your assessment)
              </label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="e.g. Active on Instagram daily, strong Google reviews, consistent WhatsApp broadcasts, lower pricing..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40 resize-none"
              />
            </div>

            {/* Their weaknesses */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-white/70">
                What gaps do you see in their approach?
              </label>
              <textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="e.g. Their content looks generic, no testimonials from real clients, no WhatsApp marketing, slow response times..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40 resize-none"
              />
            </div>

            {/* Your edge */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-white/70">
                What's your actual advantage over them?
              </label>
              <input
                value={yourEdge}
                onChange={(e) => setYourEdge(e.target.value)}
                placeholder="e.g. 8 years experience, faster delivery, more personal service, better pricing for quality..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleAnalyse}
              disabled={isLoading || filledCompetitors.length === 0}
              className="w-full rounded-xl bg-[#E09818] py-4 text-sm font-black text-[#0B1F3A] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span>Analysing…</span>
                  <span className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  Analyse Competitors
                  <span className="flex items-center gap-1 rounded-full bg-[#0B1F3A]/20 px-2 py-0.5 text-xs">
                    <Coins className="h-3 w-3" />{TOOL_COST}
                  </span>
                </span>
              )}
            </button>
          </motion.div>
        )}

        {/* ── Streaming output ────────────────── */}
        {(completion || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#E09818]" />
                <span className="text-sm font-semibold text-white">Competitive Intelligence Report</span>
              </div>
              {isLoading && (
                <button onClick={stop} className="text-xs text-white/30 hover:text-white/50">
                  Stop
                </button>
              )}
            </div>

            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2 className="text-base font-bold text-white mt-5 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold text-[#E09818] mt-4 mb-2">{children}</h3>,
                  p:  ({ children }) => <p className="text-sm text-white/80 leading-relaxed mb-3">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                  li: ({ children }) => <li className="text-sm text-white/70 leading-relaxed">{children}</li>,
                }}
              >
                {completion}
              </ReactMarkdown>
              {isLoading && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-[#E09818] ml-1" />
              )}
            </div>

            {!isLoading && completion && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                <button
                  onClick={() => router.push('/tools/strategy-brain')}
                  className="flex items-center gap-1.5 rounded-lg bg-[#E09818]/10 border border-[#E09818]/20 px-3 py-2 text-xs font-bold text-[#E09818] hover:bg-[#E09818]/20"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Build full counter-strategy
                </button>
                <button
                  onClick={() => router.push('/tools/copy-brain')}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-white"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Write competitive copy
                </button>
                <button
                  onClick={() => { setCompetitors(['', '', '']); setStrengths(''); setWeaknesses(''); setYourEdge('') }}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-white"
                >
                  New analysis
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Error state ─────────────────────── */}
        {error && !isLoading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-300">Analysis failed</p>
                <p className="text-xs text-red-400/70 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
