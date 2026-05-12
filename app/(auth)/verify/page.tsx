'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, RefreshCw, Mail } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────
// RESEND COOLDOWN — 60 seconds
// ─────────────────────────────────────────────────────────────

function useResendCooldown(initialSeconds = 60) {
  const [seconds,  setSeconds]  = React.useState(initialSeconds)
  const [canResend, setCanResend] = React.useState(false)

  React.useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const reset = () => { setSeconds(initialSeconds); setCanResend(false) }

  return { seconds, canResend, reset }
}

// ─────────────────────────────────────────────────────────────
// EMAIL CLIENT SHORTCUTS
// ─────────────────────────────────────────────────────────────

const EMAIL_CLIENTS = [
  { name: 'Gmail',   url: 'https://mail.google.com',  emoji: '📬', color: '#EA4335' },
  { name: 'Yahoo',   url: 'https://mail.yahoo.com',   emoji: '📮', color: '#6001D2' },
  { name: 'Outlook', url: 'https://outlook.live.com', emoji: '📫', color: '#0078D4' },
]

// ─────────────────────────────────────────────────────────────
// ANIMATED CHECK (success state)
// ─────────────────────────────────────────────────────────────

const AnimatedEnvelope = () => (
  <div className="relative mx-auto w-20 h-20 mb-6">
    {/* Outer ring pulse */}
    <motion.div
      className="absolute inset-0 rounded-2xl bg-cerebre-gold/10"
      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Card */}
    <motion.div
      className="relative z-10 w-full h-full rounded-2xl bg-cerebre-gold-dim border border-cerebre-gold/30 flex items-center justify-center"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Mail className="h-8 w-8 text-cerebre-gold" />
    </motion.div>
    {/* Check badge */}
    <motion.div
      className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-cerebre-teal border-2 border-cerebre-ink flex items-center justify-center"
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, type: 'spring', damping: 15, stiffness: 300 }}
    >
      <CheckCircle2 className="h-4 w-4 text-cerebre-ink" />
    </motion.div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// VERIFY PAGE
// ─────────────────────────────────────────────────────────────

export default function VerifyPage() {
  const supabase     = createBrowserClient()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') ?? ''

  const { seconds, canResend, reset } = useResendCooldown(60)
  const [resending,   setResending]   = React.useState(false)
  const [resentMsg,   setResentMsg]   = React.useState('')
  const [resendError, setResendError] = React.useState('')

  const handleResend = async () => {
    if (!canResend || !email || resending) return
    setResending(true)
    setResentMsg('')
    setResendError('')

    const { error } = await supabase.auth.resend({
      type:  'signup',
      email: email.toLowerCase(),
    })

    if (error) {
      setResendError('Something went wrong. Please try again.')
    } else {
      setResentMsg('Email resent! Check your inbox.')
      reset()
    }
    setResending(false)
  }

  return (
    <div className="min-h-dvh bg-cerebre-ink flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-cerebre-gold flex items-center justify-center">
            <span className="text-cerebre-ink font-black text-xs font-mono">C+</span>
          </div>
          <span className="font-bold text-cerebre-text">Cerebre Plus</span>
        </div>

        <AnimatedEnvelope />

        {/* Heading */}
        <h1 className="font-display font-semibold text-2xl text-cerebre-text mb-2">
          You're almost there!
        </h1>
        <p className="text-sm text-cerebre-muted leading-relaxed mb-1">
          We sent a verification email to
        </p>
        {email && (
          <p className="text-sm font-semibold text-cerebre-text mb-6">
            {email}
          </p>
        )}
        <p className="text-sm text-cerebre-muted leading-relaxed mb-6">
          Click the link in that email to activate your account and claim your{' '}
          <span className="text-cerebre-gold font-medium">30 free coins</span>.
        </p>

        {/* Email client buttons */}
        <div className="mb-6">
          <p className="text-xs text-cerebre-muted mb-3">Open your email app:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {EMAIL_CLIENTS.map((client) => (
              <motion.a
                key={client.name}
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cerebre-border bg-cerebre-surface hover:border-cerebre-gold/35 transition-colors text-sm text-cerebre-text"
              >
                <span>{client.emoji}</span>
                <span>{client.name}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Resend section */}
        <div className="p-4 rounded-card border border-cerebre-border bg-cerebre-surface mb-6">
          <p className="text-sm text-cerebre-muted mb-3">
            Didn't get it? Check your spam, or resend below.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending || !email}
            className={[
              'w-full h-9 flex items-center justify-center gap-2 rounded-button text-sm font-medium',
              'transition-all duration-200',
              canResend && !resending
                ? 'border border-cerebre-gold text-cerebre-gold hover:bg-cerebre-gold-dim'
                : 'border border-cerebre-border text-cerebre-muted cursor-not-allowed opacity-60',
            ].join(' ')}
            aria-live="polite"
          >
            {resending ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.span>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {resending
              ? 'Sending…'
              : canResend
                ? 'Resend verification email'
                : `Resend in ${seconds}s`}
          </button>

          <AnimatePresence>
            {resentMsg && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2.5 text-xs text-cerebre-teal text-center"
              >
                ✅ {resentMsg}
              </motion.p>
            )}
            {resendError && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2.5 text-xs text-cerebre-coral text-center"
              >
                {resendError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Help links */}
        <div className="flex items-center justify-center gap-4 text-xs text-cerebre-muted">
          <Link href="/signup" className="hover:text-cerebre-text transition-colors">
            Wrong email? Start over
          </Link>
          <span className="text-cerebre-border">|</span>
          <Link href="/login" className="hover:text-cerebre-text transition-colors">
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
