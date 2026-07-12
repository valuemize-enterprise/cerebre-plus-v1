'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/history/page.tsx  (v2 — JSON-aware)
//
// WHAT CHANGED:
//   • Generation type now includes output_json, output_group, schema_version
//   • Supabase query selects these new columns
//   • GenerationRow: if schema_version === 2 and output_json present,
//     renders the appropriate output component (same component as the tool page)
//   • Legacy entries (schema_version === 1 / output_json null) still render
//     with the existing <pre> block — no regression
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, Copy, MessageCircle, ExternalLink,
  ChevronDown, ChevronUp, FileDown, Coins, Check, Sparkles,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { getTool, CATEGORY_LABELS, type ToolCategory } from '@/lib/tools/registry'
import { useUser }    from '@/lib/hooks/useUser'
import { useToast }   from '@/components/ui/ModalToastSelect'

// v2 output components — dispatched from GenerationRow when output_json is present
import { CaptionGroupOutput }      from '@/components/tools/outputs/CaptionGroupOutput'
import { CaptionCraftOutput }      from '@/components/tools/outputs/CaptionCraftOutput'
import { WhatsAppGroupOutput }     from '@/components/tools/outputs/WhatsAppGroupOutput'
import { StrategyGroupOutput }     from '@/components/tools/outputs/StrategyGroupOutput'
import { CalendarGroupOutput }     from '@/components/tools/outputs/CalendarGroupOutput'
import { EmailGroupOutput }        from '@/components/tools/outputs/EmailGroupOutput'
import { DocumentGroupOutput }     from '@/components/tools/outputs/DocumentGroupOutput'
import { ScriptGroupOutput }       from '@/components/tools/outputs/ScriptGroupOutput'
import { IntelligenceGroupOutput } from '@/components/tools/outputs/IntelligenceGroupOutput'
import { DesignOutput }            from '@/components/design/DesignOutput'

import type {
  CaptionOutput, WhatsAppOutput, StrategyOutput, CalendarOutput,
  EmailOutput, DocumentOutput, ScriptOutput, IntelligenceOutput,
} from '@/lib/tools/output-schemas'

// ── Type ───────────────────────────────────────────────────────
type Generation = {
  id:               string
  tool_id:          string
  tool_name:        string
  output:           string
  output_json:      Record<string, unknown> | null
  output_group:     string | null
  schema_version:   number
  created_at:       string
  coin_cost:        number
  initial_coin_cost: number | null
  status:           string
}

// ── V2 output dispatcher ───────────────────────────────────────
function V2OutputRenderer({
  gen, businessName,
}: {
  gen: Generation
  businessName: string
}) {
  const group       = gen.output_group
  const outputJson  = gen.output_json!
  const coinsSpent  = gen.initial_coin_cost ?? gen.coin_cost
  const tool        = getTool(gen.tool_id)
  const deepDiveCost = tool?.coinCost ?? coinsSpent

  const common = {
    generationId: gen.id,
    toolId:       gen.tool_id,
    coinsSpent,
    deepDiveCost,
  }

  switch (group) {
    case 'caption':
      return gen.tool_id === 'caption-craft'
        ? <CaptionCraftOutput  {...common} outputJson={outputJson as unknown as CaptionOutput} businessName={businessName}/>
        : <CaptionGroupOutput  {...common} outputJson={outputJson as unknown as CaptionOutput} businessName={businessName}/>
    case 'whatsapp':
      return <WhatsAppGroupOutput   {...common} outputJson={outputJson as unknown as WhatsAppOutput}/>
    case 'strategy':
      return <StrategyGroupOutput   {...common} outputJson={outputJson as unknown as StrategyOutput}/>
    case 'calendar':
      return <CalendarGroupOutput   {...common} outputJson={outputJson as unknown as CalendarOutput}/>
    case 'email':
      return <EmailGroupOutput      {...common} outputJson={outputJson as unknown as EmailOutput}/>
    case 'document':
      return <DocumentGroupOutput   {...common} outputJson={outputJson as unknown as DocumentOutput}/>
    case 'script':
      return <ScriptGroupOutput     {...common} outputJson={outputJson as unknown as ScriptOutput}/>
    case 'intelligence':
      return <IntelligenceGroupOutput {...common} outputJson={outputJson as unknown as IntelligenceOutput}/>
    case 'design': {
      const ess = (outputJson.essentials as any) ?? {}
      const imageUrls = [ess.primary_url, ...(ess.variations ?? [])].filter(Boolean)
      return (
        <DesignOutput
          toolId={gen.tool_id}
          toolName={gen.tool_name}
          engine={(ess.tier === 'Premium' ? 'premium' : 'standard') as 'standard' | 'premium'}
          saved={{
            imageUrls,
            coinCost:    coinsSpent,
            engine:      ess.tier === 'Premium' ? 'premium' : 'standard',
            generationId: gen.id,
            brandApplied: { primaryColor: '', logoOverlaid: false, footerApplied: true },
          }}
        />
      )
    }
    default:
      return null
  }
}

// ── Generation row ─────────────────────────────────────────────
const PER_PAGE = 20

function GenerationRow({ gen, isExpanded, onToggle, businessName }: {
  gen:          Generation
  isExpanded:   boolean
  onToggle:     () => void
  businessName: string
}) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const tool    = getTool(gen.tool_id)
  const isV2    = gen.schema_version === 2 && gen.output_json != null
  const rawText = gen.output || ''
  const preview = isV2
    ? (gen.output_json?.headline as string ?? gen.tool_name)
    : rawText.replace(/#{1,6}\s/g, '').replace(/\*+/g, '').slice(0, 80)

  const date = new Date(gen.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })
  const time = new Date(gen.created_at).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Lagos' })

  const copy = async () => {
    const txt = isV2
      ? (gen.output_json?.headline as string ?? '') + '\n\n' + rawText
      : rawText
    await navigator.clipboard.writeText(txt)
    setCopied(true)
    toast({ type:'success', title:'Copied!', description:'Output copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWA = () => {
    const text = encodeURIComponent(rawText.slice(0, 2000))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <motion.div layout className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={onToggle}>
        <span className="text-xl shrink-0">{tool?.icon || '✨'}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white">{gen.tool_name}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40">{date} at {time} WAT</span>
            <div className="flex items-center gap-0.5 rounded-full bg-[#E09818]/10 px-1.5 py-0.5 text-xs text-[#E09818]">
              <Coins className="h-2.5 w-2.5"/>{gen.coin_cost}
            </div>
            {isV2 && (
              <div className="rounded-full bg-[#12D4B4]/10 border border-[#12D4B4]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#12D4B4]">
                v2
              </div>
            )}
          </div>
          <p className="mt-0.5 text-sm text-white/50 truncate">{preview}…</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={e => { e.stopPropagation(); copy() }}
            className={`rounded-lg border px-2 py-1 text-xs transition-all ${copied ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
            {copied ? <Check className="h-3 w-3"/> : <Copy className="h-3 w-3"/>}
          </button>
          <button onClick={e => { e.stopPropagation(); shareWA() }}
            className="rounded-lg border border-[#25D366]/20 bg-[#25D366]/10 p-1 text-[#25D366] hover:bg-[#25D366]/20 transition-all">
            <MessageCircle className="h-3 w-3"/>
          </button>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-white/30"/> : <ChevronDown className="h-4 w-4 text-white/30"/>}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
            <div className="border-t border-white/10 px-4 pb-4 pt-4">

              {/* V2: render using the correct output component */}
              {isV2 ? (
                <div style={{ maxHeight: 600, overflow:'auto', borderRadius: 12 }}>
                  <V2OutputRenderer gen={gen} businessName={businessName}/>
                </div>
              ) : (
                /* V1 legacy: plain text block */
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap rounded-xl bg-white/5 p-4 text-xs text-white/70 font-sans leading-relaxed overflow-x-auto max-h-96 overflow-y-auto">
                    {rawText}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10">
                  <Copy className="h-3 w-3"/> Copy all
                </button>
                <button onClick={shareWA} className="flex items-center gap-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 px-3 py-1.5 text-xs text-[#25D366] hover:bg-[#25D366]/20">
                  <MessageCircle className="h-3 w-3"/> Share on WhatsApp
                </button>
                <button onClick={() => router.push(`/tools/${gen.tool_id}`)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#E09818]/10 border border-[#E09818]/20 px-3 py-1.5 text-xs text-[#E09818] hover:bg-[#E09818]/20">
                  <ExternalLink className="h-3 w-3"/> Run again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function HistoryPage() {
  const { profile } = useUser()
  const { toast }   = useToast()
  const searchParams = useSearchParams()
  const focusId      = searchParams.get('id')

  const [userId,        setUserId]        = useState<string | null>(null)
  const [generations,   setGenerations]   = useState<Generation[]>([])
  const [loading,       setLoading]       = useState(false)
  const [query,         setQuery]         = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'all'>('all')
  const [expandedId,    setExpandedId]    = useState<string | null>(focusId)
  const [page,          setPage]          = useState(0)
  const [hasMore,       setHasMore]       = useState(true)

  const supabase      = createBrowserClient()
  const businessName  = (profile as any)?.businessName || (profile as any)?.business_name || 'Your Business'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) setUserId(user.id) })
  }, [])

  const fetchGenerations = useCallback(async (reset = false) => {
    if (!userId) return
    setLoading(true)
    const offset = reset ? 0 : page * PER_PAGE

    // Now selects the new JSON columns
    let q = supabase
      .from('generations')
      .select('id, tool_id, tool_name, output_content, output_json, output_group, schema_version, created_at, coins_deducted, initial_coin_cost, status')
      .eq('user_id', userId)
      // .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .range(offset, offset + PER_PAGE - 1)

    if (query) q = q.ilike('output_content', `%${query}%`)

    const { data, error } = await q

    if (error) {
      toast({ type:'error', title:'Failed to load history', description:error.message })
    } else {
      // Guard the supabase response typing — cast via unknown to avoid SelectQueryError overlap
      const list = (Array.isArray(data) ? data : []) as unknown as Generation[]
      setGenerations(prev => reset ? list : [...prev, ...list])
      setHasMore(list.length === PER_PAGE)
    }
    setLoading(false)
  }, [userId, query, page])

  useEffect(() => {
    if (userId) { fetchGenerations(true); setPage(0) }
  }, [userId, query, categoryFilter])

  const filtered = categoryFilter === 'all'
    ? generations
    : generations.filter(g => getTool(g.tool_id)?.category === categoryFilter)

  const categories = Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id: id as ToolCategory, label }))

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: '#0B1F3A' }}>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Generation History</h1>
            <p className="mt-1 text-sm text-white/40">{generations.length}+ generations — tap any to view the full output</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10">
            <FileDown className="h-3.5 w-3.5"/> Export
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none"/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your generations…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40"/>
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X className="h-4 w-4"/>
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
          <button onClick={() => setCategoryFilter('all')}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${categoryFilter==='all'?'bg-[#E09818] text-[#0B1F3A]':'border border-white/10 text-white/50'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${categoryFilter===cat.id?'bg-[#E09818] text-[#0B1F3A]':'border border-white/10 text-white/50'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && generations.length === 0 ? (
          <div className="space-y-3">
            {Array.from({length:5}).map((_,i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-white/20"/>
            <p className="text-white/40">{query ? `No results for "${query}"` : 'No generations yet — run a tool to get started'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(gen => (
              <GenerationRow
                key={gen.id} gen={gen}
                isExpanded={expandedId === gen.id}
                onToggle={() => setExpandedId(expandedId === gen.id ? null : gen.id)}
                businessName={businessName}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <button onClick={() => { setPage(p => p + 1); fetchGenerations() }}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/50 hover:text-white hover:bg-white/8">
            Load more generations
          </button>
        )}
      </div>
    </div>
  )
}
