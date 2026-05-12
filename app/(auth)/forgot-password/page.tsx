// /app/(auth)/forgot-password/page.tsx
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Mail, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBrowserClient } from '@/lib/supabase/client'


const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const supabase = createBrowserClient()
  const [sent, setSent] = React.useState(false)
  const [sentEmail, setSentEmail] = React.useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    await supabase.auth.resetPasswordForEmail(values.email.trim().toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    // Always show success — don't leak whether the email exists
    setSentEmail(values.email.trim().toLowerCase())
    setSent(true)
  }

  return (
    <div className="min-h-dvh bg-cerebre-ink flex items-center justify-center p-6">
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
          {sent ? (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-cerebre-teal-dim border border-cerebre-teal/30 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-cerebre-teal" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-xl text-cerebre-text mb-1.5">
                  Reset link sent!
                </h2>
                <p className="text-sm text-cerebre-muted leading-relaxed">
                  We sent a password reset link to{' '}
                  <span className="text-cerebre-text font-medium">{sentEmail}</span>.
                  Check your inbox and click the link.
                </p>
              </div>
              <p className="text-xs text-cerebre-muted pt-2">
                Check spam if you don't see it within 2 minutes.
              </p>
              <Link href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-cerebre-gold hover:text-cerebre-gold-light transition-colors mt-4">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Link href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-cerebre-muted hover:text-cerebre-text transition-colors mb-7">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>

              <div className="mb-6">
                <h2 className="font-display font-semibold text-2xl text-cerebre-text mb-1.5">
                  Reset your password
                </h2>
                <p className="text-sm text-cerebre-muted">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="fpEmail">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" />
                    <input
                      id="fpEmail" type="email" autoComplete="email" placeholder="you@business.com"
                      className="w-full h-10 bg-cerebre-navy rounded-input border border-cerebre-border pl-10 px-3.5 py-2.5 text-sm text-cerebre-text placeholder:text-cerebre-muted outline-none transition-all duration-200 hover:border-cerebre-gold/40 focus:border-cerebre-gold focus:ring-2 focus:ring-cerebre-gold/20"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-cerebre-coral">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-button font-semibold text-sm text-cerebre-ink bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light hover:shadow-gold hover:-translate-y-px transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
