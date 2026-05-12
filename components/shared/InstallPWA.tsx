'use client'
// ═══════════════════════════════════════════════════════════════
// /components/shared/InstallPWA.tsx
// Smart PWA install banner.
// Shows max 3 times. Rewards 20 coins on successful install.
// Mobile: bottom banner. Desktop: subtle top-right prompt.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Coins, Smartphone } from 'lucide-react'
import { useToast } from '@/components/ui/ModalToastSelect'

const MAX_SHOW_COUNT    = 3
const STORAGE_KEY_COUNT = 'cerebre_pwa_prompt_count'
const STORAGE_KEY_DONE  = 'cerebre_pwa_installed'
const STORAGE_KEY_LAST  = 'cerebre_pwa_prompt_last'
const REWARD_COINS      = 20
const COOLDOWN_DAYS     = 3

// BeforeInstallPromptEvent (not yet in TS DOM types)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const { toast } = useToast()
  const [show,           setShow]           = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing,     setInstalling]     = useState(false)

  useEffect(() => {
    // Don't show if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem(STORAGE_KEY_DONE) === 'true'
    ) return

    const count = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10)
    if (count >= MAX_SHOW_COUNT) return

    const lastShown = localStorage.getItem(STORAGE_KEY_LAST)
    if (lastShown) {
      const daysSinceLast = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24)
      if (daysSinceLast < COOLDOWN_DAYS) return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show banner after 30 seconds on page
      setTimeout(() => {
        setShow(true)
        localStorage.setItem(STORAGE_KEY_COUNT, String(count + 1))
        localStorage.setItem(STORAGE_KEY_LAST, String(Date.now()))
      }, 30_000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  // Listen for successful install
  useEffect(() => {
    const handleInstalled = () => {
      localStorage.setItem(STORAGE_KEY_DONE, 'true')
      setShow(false)
    }
    window.addEventListener('appinstalled', handleInstalled)
    return () => window.removeEventListener('appinstalled', handleInstalled)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    setInstalling(true)

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        // Credit 20 coins via API
        try {
          await fetch('/api/coins/reward', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ reason: 'pwa_install', coins: REWARD_COINS }),
          })
          toast({
            type:        'success',
            title:       `🎉 +${REWARD_COINS} coins!`,
            description: 'Thank you for installing Cerebre Plus. Coins added to your account.',
          })
        } catch {}

        localStorage.setItem(STORAGE_KEY_DONE, 'true')
        setShow(false)
      } else {
        setShow(false)
      }
    } finally {
      setInstalling(false)
      setDeferredPrompt(null)
    }
  }, [deferredPrompt, toast])

  const dismiss = () => setShow(false)

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Mobile: bottom banner */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[72px] left-0 right-0 z-50 px-3 pb-2 md:hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-[#E09818]/30 bg-[#0B1F3A] p-4 shadow-2xl shadow-black/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E09818]/15">
                <Smartphone className="h-5 w-5 text-[#E09818]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">Install Cerebre Plus</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Coins className="h-3 w-3 text-[#E09818]" />
                  <span className="text-xs text-[#E09818]">+{REWARD_COINS} coins when you install</span>
                </div>
              </div>
              <button
                onClick={handleInstall}
                disabled={installing}
                className="shrink-0 rounded-xl bg-[#E09818] px-3 py-2 text-xs font-bold text-[#0B1F3A] hover:opacity-90 disabled:opacity-60"
              >
                {installing ? '…' : 'Install'}
              </button>
              <button onClick={dismiss} className="shrink-0 text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Desktop: top-right notification */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 hidden md:block"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-[#E09818]/30 bg-[#0B1F3A] p-4 shadow-2xl shadow-black/30 max-w-xs">
              <Download className="h-5 w-5 text-[#E09818] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Install Cerebre Plus</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Add to your home screen for faster access — and earn{' '}
                  <span className="text-[#E09818] font-semibold">{REWARD_COINS} coins</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="rounded-lg bg-[#E09818] px-3 py-1.5 text-xs font-bold text-[#0B1F3A] hover:opacity-90 disabled:opacity-60"
                  >
                    {installing ? 'Installing…' : 'Install now'}
                  </button>
                  <button
                    onClick={dismiss}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white/60"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
