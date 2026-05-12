// ═══════════════════════════════════════════════════════════════
// /app/(auth)/reset-password/page.tsx
// ═══════════════════════════════════════════════════════════════
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBrowserClient } from '@/lib/supabase/client'

const schema = z.object({
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords don\'t match',
  path: ['confirm'],
})

type Form = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const supabase = createBrowserClient()
  const router   = useRouter()

  const [showPwd,     setShowPwd]     = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [done,        setDone]        = React.useState(false)
  const [authError,   setAuthError]   = React.useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: Form) => {
    setAuthError(null)
    const { error } = await supabase.auth.updateUser({ password: values.password })
    if (error) { setAuthError(error.message); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2800)
  }

  const base = 'w-full h-10 bg-cerebre-navy rounded-input border border-cerebre-border pl-10 pr-10 text-sm text-cerebre-text placeholder:text-cerebre-muted outline-none transition-all duration-200 hover:border-cerebre-gold/40 focus:border-cerebre-gold focus:ring-2 focus:ring-cerebre-gold/20'

  return (
    <div className="min-h-dvh bg-cerebre-ink flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-cerebre-gold flex items-center justify-center">
            <span className="text-cerebre-ink font-black text-xs font-mono">C+</span>
          </div>
          <span className="font-bold text-cerebre-text">Cerebre Plus</span>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-cerebre-teal-dim border border-cerebre-teal/30 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                >
                  <CheckCircle2 className="h-7 w-7 text-cerebre-teal" />
                </motion.div>
              </div>
              <div>
                <h2 className="font-display font-semibold text-xl text-cerebre-text mb-1.5">
                  Password updated! 🎉
                </h2>
                <p className="text-sm text-cerebre-muted">
                  Taking you to your dashboard…
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-7">
                <h2 className="font-display font-semibold text-2xl text-cerebre-text mb-1.5">
                  Set a new password
                </h2>
                <p className="text-sm text-cerebre-muted">
                  Choose something strong. You won't need to reset it again for a while.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="newpwd">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                    <input
                      id="newpwd"
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 chars, 1 uppercase, 1 number"
                      className={[base, errors.password ? 'border-cerebre-coral' : ''].join(' ')}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cerebre-muted hover:text-cerebre-text transition-colors"
                      aria-label={showPwd ? 'Hide' : 'Show'}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-cerebre-coral">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="confirmpwd">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                    <input
                      id="confirmpwd"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat your new password"
                      className={[base, errors.confirm ? 'border-cerebre-coral' : ''].join(' ')}
                      {...register('confirm')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cerebre-muted hover:text-cerebre-text transition-colors"
                      aria-label={showConfirm ? 'Hide' : 'Show'}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirm && (
                    <p className="mt-1.5 text-xs text-cerebre-coral">{errors.confirm.message}</p>
                  )}
                </div>

                {/* Auth error */}
                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 rounded-lg border border-cerebre-coral/40 bg-cerebre-coral/8 text-sm text-cerebre-coral"
                      role="alert"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      {authError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-button font-semibold text-sm text-cerebre-ink bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light hover:shadow-gold hover:-translate-y-px transition-all duration-200 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:outline-none"
                >
                  {isSubmitting ? 'Updating password…' : 'Set New Password'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
