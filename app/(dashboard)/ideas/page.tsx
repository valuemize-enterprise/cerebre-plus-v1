'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/ideas/page.tsx
// Daily-refreshed content idea feed.
// Ideas are AI-generated at 6AM WAT, cached in Redis for 24hrs.
// "Use This Idea" → opens recommended tool with idea pre-filled.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter }    from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb, RefreshCw, ArrowRight, Coins,
  Zap, Clock, Sparkles, TrendingUp, Calendar,
  MessageCircle, Film, LayoutGrid, FileText,
  BookOpen, Star,
} from 'lucide-react'
import { useUser }  from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'
const REFRESH_COST = 5

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ContentIdea {
  id:                string
  format:            'Reel' | 'Carousel' | 'Post' | 'WhatsApp' | 'Story' | 'YouTube'
  hook:              string
  concept:           string
  whyNow:            string
  engagementType:    'Shares' | 'Saves' | 'Comments' | 'DMs' | 'WhatsApp replies'
  difficulty:        'Easy' | 'Medium' | 'Advanced'
  estimatedMinutes:  number
  toolId:            string
  toolName:          string
  toolIcon:          string
  coinCost:          number
  tag?:              string  // e.g. "Salary Week", "Independence Day"
}

// ─────────────────────────────────────────────────────────────
// FORMAT ICON
// ─────────────────────────────────────────────────────────────

function FormatIcon({ format }: { format: ContentIdea['format'] }) {
  const icons: Record<string, React.ReactNode> = {
    Reel:     <Film className="h-3.5 w-3.5" />,
    Carousel: <LayoutGrid className="h-3.5 w-3.5" />,
    Post:     <FileText className="h-3.5 w-3.5" />,
    WhatsApp: <MessageCircle className="h-3.5 w-3.5" />,
    Story:    <Sparkles className="h-3.5 w-3.5" />,
    YouTube:  <Film className="h-3.5 w-3.5" />,
  }
  const colours: Record<string, string> = {
    Reel:     '#EF4444',
    Carousel: '#8B5CF6',
    Post:     '#3B82F6',
    WhatsApp: '#25D366',
    Story:    '#F97316',
    YouTube:  '#EF4444',
  }

  return (
    <span
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: `${colours[format]}15`, color: colours[format], border: `1px solid ${colours[format]}30` }}
    >
      {icons[format]}{format}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// IDEA CARD
// ─────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  index,
  onUse,
}: {
  idea:  ContentIdea
  index: number
  onUse: (idea: ContentIdea) => void
}) {
  const difficultyColour = {
    Easy:     'text-emerald-400 bg-emerald-500/10',
    Medium:   'text-amber-400   bg-amber-500/10',
    Advanced: 'text-red-400     bg-red-500/10',
  }[idea.difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <FormatIcon format={idea.format} />
        {idea.tag && (
          <span className="rounded-full bg-[#E09818]/15 px-2 py-0.5 text-[10px] font-bold text-[#E09818]">
            {idea.tag}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${difficultyColour}`}>
            {idea.difficulty}
          </span>
          <div className="flex items-center gap-1 text-xs text-white/30">
            <Clock className="h-3 w-3" />
            {idea.estimatedMinutes}min
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Hook */}
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Hook / Opening line</p>
          <p className="text-sm font-semibold text-white leading-snug">"{idea.hook}"</p>
        </div>

        {/* Concept */}
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">The Concept</p>
          <p className="text-sm text-white/70 leading-relaxed">{idea.concept}</p>
        </div>

        {/* Why now */}
        <div className="flex items-start gap-2 rounded-xl border border-[#E09818]/20 bg-[#E09818]/5 p-3">
          <Calendar className="h-3.5 w-3.5 text-[#E09818] shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-[#E09818]/70 uppercase tracking-wider mb-0.5">Why post this now</p>
            <p className="text-xs text-white/60">{idea.whyNow}</p>
          </div>
        </div>

        {/* Engagement type */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-white/30" />
          <span className="text-xs text-white/40">Best for: </span>
          <span className="text-xs font-semibold text-white/70">{idea.engagementType}</span>
        </div>
      </div>

      {/* Footer — Use This Idea */}
      <div className="border-t border-white/5 px-4 py-3">
        <button
          onClick={() => onUse(idea)}
          className="flex w-full items-center justify-between rounded-xl bg-[#E09818] px-4 py-2.5 text-sm font-bold text-[#0B1F3A] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span className="flex items-center gap-2">
            <span>{idea.toolIcon}</span>
            Use with {idea.toolName}
          </span>
          <div className="flex items-center gap-1">
            <Coins className="h-3.5 w-3.5" />
            <span>{idea.coinCost}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────

function IdeaSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-14 animate-pulse rounded-full bg-white/10" />
        <div className="ml-auto h-5 w-10 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="h-3 w-full animate-pulse rounded bg-white/10" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
      <div className="h-16 animate-pulse rounded-xl bg-white/5" />
      <div className="h-10 animate-pulse rounded-xl bg-white/10" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function IdeasPage() {
  const router      = useRouter()
  const { profile } = useUser()
  const { toast }   = useToast()

  const [ideas,     setIdeas]     = useState<ContentIdea[]>([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [nextRefreshAt, setNextRefreshAt] = useState<Date | null>(null)

  const fetchIdeas = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true)
    else              setLoading(true)

    try {
      const res = await fetch(`/api/ideas${forceRefresh ? '?refresh=true' : ''}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setIdeas(data.ideas || [])
      setNextRefreshAt(data.nextRefreshAt ? new Date(data.nextRefreshAt) : null)
    } catch (err: any) {
      toast({ type: 'error', title: 'Could not load ideas', description: err.message })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  const handleRefresh = async () => {
    const confirm = window.confirm(`Refresh ideas now? This costs ${REFRESH_COST} Cerebre Coins.`)
    if (!confirm) return
    fetchIdeas(true)
  }

  const handleUseIdea = (idea: ContentIdea) => {
    // Store the idea pre-fill in localStorage so the tool page picks it up
    try {
      localStorage.setItem(`cerebre_idea_prefill_${idea.toolId}`, JSON.stringify({
        hook:    idea.hook,
        concept: idea.concept,
      }))
    } catch {}
    router.push(`/tools/${idea.toolId}?from=idea`)
  }

  // Time until next auto-refresh
  const hoursToRefresh = nextRefreshAt
    ? Math.max(0, Math.ceil((nextRefreshAt.getTime() - Date.now()) / (1000 * 60 * 60)))
    : null

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: NAVY }}>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#E09818]" />
              <h1 className="text-2xl font-black text-white">Content Ideas</h1>
            </div>
            <p className="mt-1 text-sm text-white/40">
              5 daily ideas for {profile?.businessName || 'your business'} in {profile?.city || 'Nigeria'} —
              refreshed at 6AM WAT
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                refreshing
                  ? 'border-white/10 text-white/30 cursor-not-allowed'
                  : 'border-[#E09818]/30 bg-[#E09818]/10 text-[#E09818] hover:bg-[#E09818]/20'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh ({REFRESH_COST} 🪙)
            </button>
            {hoursToRefresh !== null && hoursToRefresh > 0 && (
              <p className="text-[10px] text-white/25">Auto-refreshes in {hoursToRefresh}h</p>
            )}
          </div>
        </div>

        {/* ── Date banner ─────────────────────────── */}
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
          <Star className="h-4 w-4 text-[#E09818]" />
          <p className="text-sm text-white/60">
            Ideas for <span className="font-semibold text-white">
              {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </p>
        </div>

        {/* ── Ideas ───────────────────────────────── */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <IdeaSkeleton key={i} />)}
          </div>
        ) : ideas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-white/15" />
            <p className="text-white/40 font-semibold">No ideas yet</p>
            <p className="mt-2 text-sm text-white/25">Complete your profile and we'll generate personalised ideas for you</p>
            <button
              onClick={() => router.push('/profile')}
              className="mt-6 rounded-xl bg-[#E09818]/15 border border-[#E09818]/30 px-5 py-2.5 text-sm font-bold text-[#E09818]"
            >
              Complete profile →
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {ideas.map((idea, i) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  index={i}
                  onUse={handleUseIdea}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* ── Tip ─────────────────────────────────── */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-xs text-white/30 text-center">
            💡 Ideas are personalised to your industry, city, and marketing challenges.
            The more complete your profile, the better your ideas.{' '}
            <button onClick={() => router.push('/profile')} className="text-[#E09818] hover:underline">
              Update profile →
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
