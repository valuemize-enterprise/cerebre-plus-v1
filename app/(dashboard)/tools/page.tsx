'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/tools/page.tsx
// The complete 40-tool library.
// Search, filter by category, sort, recently used, starter picks.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter }       from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Coins, Clock, TrendingUp, ArrowUpDown, Star, Sparkles } from 'lucide-react'

import {
  TOOL_REGISTRY, CATEGORY_LABELS, CATEGORY_ICONS,
  type ToolDefinition, type ToolCategory,
} from '@/lib/tools/registry'
import { useUser }   from '@/lib/hooks/useUser'

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

const STARTER_TOOL_IDS = ['copy-brain', 'caption-craft', 'whatsapp-campaign-builder', 'strategy-brain']

type SortMode = 'popular' | 'cost_asc' | 'recent' | 'new'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'popular',  label: 'Popular' },
  { value: 'cost_asc', label: 'Lowest cost' },
  { value: 'recent',   label: 'Recently used' },
  { value: 'new',      label: 'Newest' },
]

// Popularity rank (hard-coded until analytics data available)
const POPULARITY: Record<string, number> = {
  'copy-brain': 1, 'caption-craft': 2, 'whatsapp-campaign-builder': 3,
  'strategy-brain': 4, 'ad-pilot': 5, 'promo-blast': 6,
  'email-scribe': 7, 'funnel-builder': 8, 'content-calendar': 9,
  'audience-profiler': 10,
}

// ─────────────────────────────────────────────────────────────
// TOOL CARD
// ─────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  canAfford,
  isRecentlyUsed,
  onClick,
}: {
  tool:           ToolDefinition
  canAfford:      boolean
  isRecentlyUsed: boolean
  onClick:        () => void
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/8 active:scale-[0.97]"
    >
      {/* Recently used badge */}
      {isRecentlyUsed && (
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          Used
        </span>
      )}

      {/* Icon + coin cost */}
      <div className="flex items-start justify-between">
        <span className="text-2xl">{tool.icon}</span>
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${canAfford ? 'bg-[#E09818]/15 text-[#E09818]' : 'bg-red-500/15 text-red-400'}`}>
          <Coins className="h-3 w-3" />
          {tool.coinCost}
        </div>
      </div>

      {/* Name + tagline */}
      <div className="mt-2 flex-1">
        <h3 className="text-sm font-bold text-white">{tool.name}</h3>
        <p className="mt-0.5 text-xs text-white/40 line-clamp-2">{tool.tagline}</p>
      </div>

      {/* Law badges */}
      <div className="mt-3 flex flex-wrap gap-1">
        {tool.laws.slice(0, 3).map((law) => (
          <span key={law} className="rounded-full bg-[#E09818]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#E09818]/70">
            Law {law}
          </span>
        ))}
      </div>

      {/* Run now hover CTA */}
      <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-semibold text-[#E09818]">Run now →</span>
        {!canAfford && (
          <span className="text-xs text-red-400">Not enough coins</span>
        )}
      </div>

      {/* Accent line on hover */}
      <div
        className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: tool.accentColour }}
      />
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const router = useRouter()
  const { profile } = useUser()

  const [query,        setQuery]        = useState('')
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all')
  const [sortMode,     setSortMode]     = useState<SortMode>('popular')
  const [recentIds,    setRecentIds]    = useState<string[]>([])
  const [genCount,     setGenCount]     = useState(0)
  const [coinBalance,  setCoinBalance]  = useState(0)

  // Load recent tools and generation count from localStorage
  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('cerebre_recent_tools') || '[]') as string[]
      setRecentIds(recent.slice(0, 3))
      const count = parseInt(localStorage.getItem('cerebre_gen_count') || '0', 10)
      setGenCount(count)
    } catch { /* ignore */ }
  }, [])

  // Categories
  const categories: Array<{ id: ToolCategory | 'all'; label: string; icon: string; count: number }> = useMemo(() => [
    { id: 'all',          label: 'All', icon: '🔮', count: TOOL_REGISTRY.length },
    ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({
      id:    id as ToolCategory,
      label,
      icon:  CATEGORY_ICONS[id as ToolCategory],
      count: TOOL_REGISTRY.filter((t) => t.category === id).length,
    })),
  ], [])

  // Filter + sort
  const filtered = useMemo(() => {
    let tools = TOOL_REGISTRY.filter((t) => {
      const matchesSearch = !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.tagline.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory
      return matchesSearch && matchesCategory
    })

    switch (sortMode) {
      case 'popular':
        tools = tools.sort((a, b) => (POPULARITY[a.id] || 99) - (POPULARITY[b.id] || 99))
        break
      case 'cost_asc':
        tools = tools.sort((a, b) => a.coinCost - b.coinCost)
        break
      case 'recent':
        tools = tools.sort((a, b) => {
          const ai = recentIds.indexOf(a.id)
          const bi = recentIds.indexOf(b.id)
          if (ai >= 0 && bi < 0) return -1
          if (bi >= 0 && ai < 0) return 1
          if (ai >= 0 && bi >= 0) return ai - bi
          return 0
        })
        break
    }

    return tools
  }, [query, activeCategory, sortMode, recentIds])

  const recentTools   = TOOL_REGISTRY.filter((t) => recentIds.includes(t.id))
  const starterTools  = TOOL_REGISTRY.filter((t) => STARTER_TOOL_IDS.includes(t.id))
  const showStarter   = genCount < 5
  const showRecent    = recentTools.length > 0

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: NAVY }}>
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-black text-white">Tool Library</h1>
          <p className="mt-1 text-sm text-white/40">40 AI marketing tools for African business owners</p>
        </div>

        {/* ── Search ─────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools — e.g. 'WhatsApp', 'Google ads', 'testimonials'…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40 focus:border-[#E09818]/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Category tabs + sort ─────────────────────── */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#E09818] text-[#0B1F3A]'
                    : 'border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`rounded-full px-1.5 ${activeCategory === cat.id ? 'bg-[#0B1F3A]/20 text-[#0B1F3A]' : 'bg-white/10 text-white/30'} text-[10px]`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-white/30 shrink-0" />
            <span className="text-xs text-white/30 shrink-0">Sort by:</span>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortMode(opt.value)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                    sortMode === opt.value
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recently used section ─────────────────────── */}
        {showRecent && !query && activeCategory === 'all' && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-white/30" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recently used</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {recentTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  canAfford={coinBalance >= tool.coinCost}
                  isRecentlyUsed
                  onClick={() => router.push(`/tools/${tool.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Try these first section ─────────────────── */}
        {showStarter && !query && activeCategory === 'all' && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#E09818]" />
              <h2 className="text-xs font-semibold text-[#E09818]/70 uppercase tracking-wider">Try these first</h2>
              <span className="text-xs text-white/30">— Recommended for new members</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {starterTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  canAfford={coinBalance >= tool.coinCost}
                  isRecentlyUsed={recentIds.includes(tool.id)}
                  onClick={() => router.push(`/tools/${tool.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Main tool grid ─────────────────────────── */}
        <div>
          {!query && activeCategory === 'all' && (
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-white/30" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                All {filtered.length} tools
              </h2>
            </div>
          )}
          {query && (
            <p className="mb-3 text-sm text-white/40">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-white/40">No tools match "{query}"</p>
              <button onClick={() => setQuery('')} className="mt-2 text-sm text-[#E09818] hover:opacity-80">
                Clear search
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    canAfford={coinBalance >= tool.coinCost}
                    isRecentlyUsed={recentIds.includes(tool.id)}
                    onClick={() => router.push(`/tools/${tool.id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
