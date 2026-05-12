'use client'
// ═══════════════════════════════════════════════════════════════
// /app/offline/page.tsx
// Branded offline page — shows last 5 cached outputs from localStorage.
// Served by the service worker when the user has no connection.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { WifiOff, Copy, Check, RefreshCw, MessageCircle } from 'lucide-react'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

type CachedOutput = {
  toolId:    string
  toolName:  string
  output:    string
  cachedAt:  string
}

export default function OfflinePage() {
  const [cached,  setCached]  = useState<CachedOutput[]>([])
  const [copied,  setCopied]  = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    // Load cached outputs from localStorage
    const outputs: CachedOutput[] = []
    const toolIds = [
      'copy-brain', 'caption-craft', 'strategy-brain',
      'whatsapp-campaign-builder', 'ad-scribe', 'email-scribe',
      'blog-brain', 'promo-blast', 'funnel-builder', 'content-calendar',
    ]

    for (const toolId of toolIds) {
      try {
        const cached = localStorage.getItem(`cerebre_output_${toolId}`)
        if (cached) {
          // Get tool name from registry (simplified offline version)
          const toolNames: Record<string, string> = {
            'copy-brain':                  'CopyBrain AI',
            'caption-craft':               'CaptionCraft',
            'strategy-brain':              'StrategyBrain',
            'whatsapp-campaign-builder':   'WhatsApp Campaign Builder',
            'ad-scribe':                   'AdScribe',
            'email-scribe':                'EmailScribe',
            'blog-brain':                  'BlogBrain',
            'promo-blast':                 'PromoBlast',
            'funnel-builder':              'FunnelBuilder',
            'content-calendar':            'Content Calendar',
          }
          outputs.push({
            toolId,
            toolName: toolNames[toolId] || toolId,
            output:   cached,
            cachedAt: 'Recent',
          })
        }
      } catch {}
      if (outputs.length >= 5) break
    }

    setCached(outputs)

    // Listen for connectivity changes
    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const shareWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text.slice(0, 2000))}`, '_blank')
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #071528 100%)` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-white">Cerebre</span>
          <span className="text-lg font-black" style={{ color: GOLD }}>Plus</span>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          isOnline
            ? 'bg-emerald-500/15 text-emerald-400'
            : 'bg-red-500/15 text-red-400'
        }`}>
          <WifiOff className="h-3 w-3" />
          {isOnline ? 'Back online' : 'Offline'}
        </div>
      </div>

      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">

        {/* Offline message */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <WifiOff className="h-8 w-8 text-white/30" />
          </div>
          <h1 className="text-xl font-black text-white">You're offline</h1>
          <p className="mt-2 text-sm text-white/50">
            No internet connection detected. Check your data or WiFi and try again.
          </p>

          {isOnline && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/25"
            >
              <RefreshCw className="h-4 w-4" /> You're back online — reload
            </button>
          )}
        </div>

        {/* Cached outputs */}
        {cached.length > 0 ? (
          <div>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
              Your recent outputs (available offline)
            </h2>
            <div className="space-y-4">
              {cached.map((item) => (
                <div
                  key={item.toolId}
                  className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <span className="text-sm font-semibold text-white">{item.toolName}</span>
                      <span className="ml-2 text-xs text-white/30">{item.cachedAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copy(item.toolId, item.output)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          copied === item.toolId
                            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                            : 'border-white/10 text-white/50 hover:text-white'
                        }`}
                      >
                        {copied === item.toolId
                          ? <><Check className="h-3 w-3" /> Copied</>
                          : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                      <button
                        onClick={() => shareWhatsApp(item.output)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#25D366]/20 bg-[#25D366]/10 px-2.5 py-1.5 text-xs text-[#25D366]"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-3 max-h-32 overflow-hidden relative">
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-4 whitespace-pre-line">
                      {item.output.replace(/#{1,6}\s/g, '').replace(/\*+/g, '')}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
            <p className="text-sm text-white/30">No cached outputs yet</p>
            <p className="mt-1 text-xs text-white/20">
              Run tools when online — your last 10 outputs are saved for offline access
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-xs font-semibold text-white/40 mb-2">While you wait for connection:</p>
          <ul className="space-y-1.5">
            {[
              'Copy any output above to use in WhatsApp or Instagram',
              'Share outputs to WhatsApp even without internet (it queues the message)',
              'Form data you typed is saved — it will restore when you reconnect',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-white/30">
                <span className="text-[#E09818] mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
