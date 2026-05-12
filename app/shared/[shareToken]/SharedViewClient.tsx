'use client'
// ═══════════════════════════════════════════════════════════════
// /app/shared/[shareToken]/SharedViewClient.tsx
// The public growth-loop page.
// Every share = an ad. Every viewer = a potential customer.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import { useRouter }   from 'next/navigation'
import { motion }      from 'framer-motion'
import ReactMarkdown   from 'react-markdown'
import {
  Copy, MessageCircle, Check, Sparkles,
  ArrowRight, Zap, ExternalLink, Globe,
} from 'lucide-react'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

interface SharedViewClientProps {
  generation: {
    id:        string
    toolId:    string
    toolName:  string
    output:    string
    createdAt: string
  }
  business: {
    name:       string
    industry:   string
    city:       string
    logoUrl:    string | null
    brandColour: string
  }
}

export default function SharedViewClient({ generation, business }: SharedViewClientProps) {
  const router  = useRouter()
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(generation.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generation.output])

  const shareWhatsApp = () => {
    const text = encodeURIComponent(generation.output.slice(0, 2000))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const formattedDate = new Date(generation.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const TOOL_ICONS: Record<string, string> = {
    'copy-brain': '🧠', 'caption-craft': '✍️', 'strategy-brain': '🎯',
    'whatsapp-campaign-builder': '💬', 'ad-scribe': '📣', 'email-scribe': '📧',
    'video-script-forge': '🎬', 'blog-brain': '📝', 'funnel-builder': '🔮',
  }
  const toolIcon = TOOL_ICONS[generation.toolId] || '✨'

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #071528 100%)` }}
    >
      {/* ── Top nav bar ─────────────────────────── */}
      <div className="border-b border-white/10 bg-[#0B1F3A]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">Cerebre</span>
            <span className="text-lg font-black" style={{ color: GOLD }}>Plus</span>
          </div>
          <button
            onClick={() => router.push('/waitlist')}
            className="flex items-center gap-1.5 rounded-xl bg-[#E09818] px-4 py-2 text-xs font-bold text-[#0B1F3A] hover:opacity-90"
          >
            <Zap className="h-3.5 w-3.5" /> Create yours free
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">

        {/* ── Generation badge ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#E09818]/30 bg-[#E09818]/5 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl shrink-0">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} className="h-10 w-10 rounded-lg object-contain" />
              ) : (
                <span className="text-xl">{toolIcon}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{business.name}</p>
              <p className="text-xs text-white/50">
                {business.industry ? `${business.industry} · ` : ''}{business.city}
              </p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <div className="flex items-center gap-1.5 justify-end">
                <Sparkles className="h-3.5 w-3.5 text-[#E09818]" />
                <span className="text-xs font-semibold text-[#E09818]">{generation.toolName}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-white/30">Generated in ~60 seconds · {formattedDate}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Output ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
        >
          {/* Action bar */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/60">Generated output</span>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  copied
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/20"
              >
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </button>
            </div>
          </div>

          {/* Markdown output */}
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-xl font-black text-white mt-6 mb-3 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold text-white mt-5 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold text-[#E09818] mt-4 mb-2">{children}</h3>,
                p:  ({ children }) => <p className="text-sm text-white/80 leading-relaxed mb-3">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                li: ({ children }) => <li className="text-sm text-white/70 leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#E09818]/50 pl-4 my-3 text-white/60 italic">{children}</blockquote>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-white/80">{children}</code>
                ),
              }}
            >
              {generation.output}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* ── Cerebre Plus pitch ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#E09818]/20 bg-gradient-to-br from-[#E09818]/10 to-transparent p-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#E09818]" />
            <span className="text-base font-black text-white">Generated by Cerebre Plus</span>
            <Sparkles className="h-5 w-5 text-[#E09818]" />
          </div>

          <p className="text-sm text-white/70 mb-1">
            That {generation.toolName} output was created in under 60 seconds.
          </p>
          <p className="text-sm text-white/70 mb-5">
            Cerebre Plus gives Nigerian business owners 40 AI marketing tools — from ₦18,000/month.
          </p>

          {/* Awoof stack */}
          <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-white/30 mb-1">Lagos agency charges</p>
                <p className="text-xl font-black text-white/50 line-through">₦1.2M/month</p>
              </div>
              <div>
                <p className="text-xs text-[#E09818]/70 mb-1">Cerebre Plus costs</p>
                <p className="text-2xl font-black text-[#E09818]">₦18,000/month</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/waitlist')}
            className="w-full rounded-xl bg-[#E09818] py-3.5 text-sm font-black text-[#0B1F3A] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Create yours free → Join Cerebre Plus
          </button>
          <p className="mt-2 text-xs text-white/30">No credit card · First generation free · Cancel anytime</p>
        </motion.div>

        {/* ── Footer ──────────────────────────── */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Globe className="h-3.5 w-3.5 text-white/20" />
            <span className="text-xs text-white/30">cerebreplus.com</span>
          </div>
          <p className="text-xs text-white/20">
            © Cerebre Media Africa · Africa's Premier AI Marketing Platform
          </p>
        </div>

      </div>
    </div>
  )
}
