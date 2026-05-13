'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Gift, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBrowserClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/ModalToastSelect'

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────

const signupSchema = z.object({
  fullName:       z.string().min(2, 'Please enter your full name'),
  email:          z.string().email('Please enter a valid email address'),
  password:       z.string()
    .min(8,  'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  referralCode:   z.string().optional(),
  terms:          z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service to continue' }),
  }),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords don\'t match',
  path:    ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

// ─────────────────────────────────────────────────────────────
// PASSWORD STRENGTH
// ─────────────────────────────────────────────────────────────

function getPasswordStrength(password: string): { score: number; label: string; colour: string } {
  if (!password) return { score: 0, label: '', colour: '' }
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Weak',   colour: '#FF4830' }
  if (score <= 2) return { score, label: 'Fair',   colour: '#F5A623' }
  if (score <= 3) return { score, label: 'Good',   colour: '#E09818' }
  if (score <= 4) return { score, label: 'Strong', colour: '#0CC4A0' }
  return            { score, label: 'Very strong', colour: '#10B880' }
}

const PasswordStrengthBar = ({ password }: { password: string }) => {
  const { score, label, colour } = getPasswordStrength(password)
  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((bar) => (
          <motion.div
            key={bar}
            className="flex-1 h-1 rounded-full"
            animate={{ backgroundColor: bar <= Math.ceil(score / 1.25) ? colour : '#1A3058' }}
            transition={{ duration: 0.25 }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] font-medium"
          style={{ color: colour }}
        >
          {label}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TERMS MODAL CONTENT
// ─────────────────────────────────────────────────────────────

const TermsContent = () => (
  <div className="prose-cerebre text-sm space-y-4">
    <p className="text-cerebre-muted">
      By creating a Cerebre Plus account, you agree to use the platform for legitimate business marketing purposes.
      You agree not to use the AI tools to generate spam, misleading content, or material that violates Nigerian
      advertising regulations.
    </p>
    <p className="text-cerebre-muted">
      Cerebre Plus subscriptions auto-renew monthly. You may cancel at any time before the renewal date.
      Coin balances are non-refundable except where required by law.
    </p>
    <p className="text-cerebre-muted">
      We collect and process your business data to personalise AI outputs. We do not sell your data to third parties.
      All AI generations are performed server-side and are subject to Anthropic's usage policies.
    </p>
    <p className="text-cerebre-text font-medium">
      Full Terms of Service: cerebre.plus/terms | Privacy Policy: cerebre.plus/privacy
    </p>
  </div>
)

// ─────────────────────────────────────────────────────────────
// EMAIL SENT SCREEN
// ─────────────────────────────────────────────────────────────

const EmailSentScreen = ({ email }: { email: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center space-y-5"
  >
    {/* Animated envelope */}
    <div className="mx-auto w-20 h-20 relative">
      <motion.div
        className="w-20 h-20 rounded-2xl bg-cerebre-gold-dim border border-cerebre-gold/30 flex items-center justify-center"
        animate={{
          y: [0, -6, 0],
          boxShadow: [
            '0 0 0px rgba(224,152,24,0)',
            '0 0 24px rgba(224,152,24,0.3)',
            '0 0 0px rgba(224,152,24,0)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-4xl">📧</span>
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cerebre-teal flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', damping: 15, stiffness: 300 }}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-cerebre-ink" />
      </motion.div>
    </div>

    <div>
      <h2 className="font-display font-semibold text-2xl text-cerebre-text mb-2">
        Check your inbox!
      </h2>
      <p className="text-sm text-cerebre-muted leading-relaxed">
        We sent a verification link to{' '}
        <span className="font-semibold text-cerebre-text">{email}</span>.
        Click it to activate your account.
      </p>
    </div>

    {/* Email client shortcuts */}
    <div className="space-y-2">
      <p className="text-xs text-cerebre-muted">Open your email app:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { name: 'Gmail',   url: 'https://mail.google.com',  emoji: '📬' },
          { name: 'Yahoo',   url: 'https://mail.yahoo.com',   emoji: '📮' },
          { name: 'Outlook', url: 'https://outlook.live.com', emoji: '📫' },
        ].map((client) => (
          <a
            key={client.name}
            href={client.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cerebre-border bg-cerebre-surface hover:border-cerebre-gold/40 transition-colors text-sm text-cerebre-text"
          >
            <span>{client.emoji}</span> {client.name}
          </a>
        ))}
      </div>
    </div>

    <p className="text-xs text-cerebre-muted">
      Didn't get it? Check your spam folder. Or{' '}
      <Link href="/login" className="text-cerebre-gold hover:underline">
        back to sign in
      </Link>
    </p>
  </motion.div>
)

// ─────────────────────────────────────────────────────────────
// LEFT PANEL (reused from login page concept)
// ─────────────────────────────────────────────────────────────

const SignupLeftPanel = () => (
  <div className="hidden lg:flex flex-col justify-between relative h-full p-10 overflow-hidden"
    style={{ background: 'linear-gradient(145deg, #06080E 0%, #0B1F3A 50%, #0E1F3A 100%)' }}>
    {/* Particles */}
    {[...Array(8)].map((_, i) => (
      <motion.div key={i}
        className="absolute w-1 h-1 rounded-full bg-cerebre-gold/30"
        style={{ left: `${15 + (i * 11) % 75}%`, top: `${10 + (i * 14) % 80}%` }}
        animate={{ y: [0,-15,0], opacity: [0.2,0.7,0.2] }}
        transition={{ duration: 3.5 + (i%3), repeat: Infinity, delay: i*0.4, ease: 'easeInOut' }}
      />
    ))}

    <div className="flex items-center gap-3 relative z-10">
      <div className="w-10 h-10 rounded-xl bg-cerebre-gold flex items-center justify-center">
        <span className="text-cerebre-ink font-black text-sm font-mono">C+</span>
      </div>
      <div>
        <p className="font-bold text-cerebre-text text-base">Cerebre Plus</p>
        <p className="text-[11px] text-cerebre-muted">by Cerebre Media Africa</p>
      </div>
    </div>

    <div className="relative z-10 space-y-6">
      <h1 className="font-display font-bold text-4xl text-cerebre-text leading-tight">
        Start building your{' '}
        <span style={{
          background: 'linear-gradient(135deg, #E09818, #F5C040)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          marketing machine.
        </span>
      </h1>
      <p className="text-cerebre-muted text-base leading-relaxed max-w-sm">
        Create your account in 60 seconds and get 30 free coins to run your first tools — on us.
      </p>

      {/* What you get */}
      <div className="space-y-3">
        {[
          { icon: '🪙', text: '30 free coins when you sign up — no card required' },
          { icon: '🤖', text: 'Access to 40 AI marketing tools built for Nigeria' },
          { icon: '📲', text: 'WhatsApp-native outputs from every tool' },
          { icon: '⚡', text: 'Your first output in under 60 seconds' },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
            <p className="text-sm text-cerebre-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </div>

    <p className="relative z-10 text-xs text-cerebre-muted">
      🇳🇬 Trusted by 2,400+ businesses across Nigeria and West Africa
    </p>
  </div>
)

// ─────────────────────────────────────────────────────────────
// SIGNUP PAGE
// ─────────────────────────────────────────────────────────────

export default function SignupPage() {
  const supabase     = createBrowserClient()
  const searchParams = useSearchParams()
  const refCode      = searchParams.get('ref') ?? ''

  const [showPassword,        setShowPassword]        = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [authError,           setAuthError]           = React.useState<string | null>(null)
  const [googleLoading,       setGoogleLoading]       = React.useState(false)
  const [submitted,           setSubmitted]           = React.useState(false)
  const [submittedEmail,      setSubmittedEmail]      = React.useState('')
  const [termsModalOpen,      setTermsModalOpen]      = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver:     zodResolver(signupSchema),
    defaultValues: { referralCode: refCode, terms: undefined as any },
  })

  const passwordValue = watch('password', '')

  const onSubmit = async (values: SignupForm) => {
    setAuthError(null)
    const { error } = await supabase.auth.signUp({
      email:    values.email.trim().toLowerCase(),
      password: values.password,
      options: {
        data: {
          full_name:     values.fullName.trim(),
          referral_code: values.referralCode?.trim() ?? null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setAuthError('An account with this email already exists. Please sign in instead.')
      } else {
        setAuthError(error.message)
      }
      return
    }

    setSubmittedEmail(values.email.trim().toLowerCase())
    setSubmitted(true)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
        queryParams: refCode ? { referral_code: refCode } : undefined,
      },
    })
    if (error) { setAuthError(error.message); setGoogleLoading(false) }
  }

  const inputBase = [
    'w-full h-10 bg-cerebre-navy rounded-input border px-3.5 py-2.5 pl-10',
    'text-sm text-cerebre-text placeholder:text-cerebre-muted outline-none',
    'transition-all duration-200 border-cerebre-border',
    'hover:border-cerebre-gold/40 focus:border-cerebre-gold focus:ring-2 focus:ring-cerebre-gold/20',
  ].join(' ')

  return (
    <div className="min-h-dvh flex">
      {/* Left panel */}
      <div className="w-[45%] flex-shrink-0 hidden lg:flex">
        <SignupLeftPanel />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-cerebre-ink px-6 py-10 min-h-dvh lg:min-h-0 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-cerebre-gold flex items-center justify-center">
              <span className="text-cerebre-ink font-black text-xs font-mono">C+</span>
            </div>
            <span className="font-bold text-cerebre-text">Cerebre Plus</span>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmailSentScreen email={submittedEmail} />
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6">
                  <h2 className="font-display font-semibold text-2xl text-cerebre-text mb-1">
                    Create your account
                  </h2>
                  <p className="text-sm text-cerebre-muted">
                    Get 30 free coins when you sign up. No card required.
                  </p>
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 h-10 rounded-button bg-white text-gray-800 text-sm font-semibold border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 mb-5"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  {googleLoading ? 'Signing you up…' : 'Create Account with Google'}
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-cerebre-border" />
                  <span className="text-xs text-cerebre-muted">or create with email</span>
                  <div className="flex-1 h-px bg-cerebre-border" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
                  {/* Full name */}
                  <div>
                    <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="fullName">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                      <input
                        id="fullName" type="text" autoComplete="name"
                        placeholder="Adaeze Okonkwo"
                        className={[inputBase, errors.fullName ? 'border-cerebre-coral' : ''].join(' ')}
                        {...register('fullName')}
                      />
                    </div>
                    {errors.fullName && <p className="mt-1 text-xs text-cerebre-coral">{errors.fullName.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="signupEmail">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                      <input
                        id="signupEmail" type="email" autoComplete="email"
                        placeholder="you@business.com"
                        className={[inputBase, errors.email ? 'border-cerebre-coral' : ''].join(' ')}
                        {...register('email')}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-cerebre-coral">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="signupPwd">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                      <input
                        id="signupPwd" type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password" placeholder="Min. 8 chars, uppercase + number"
                        className={[inputBase, 'pr-10', errors.password ? 'border-cerebre-coral' : ''].join(' ')}
                        {...register('password')}
                      />
                      <button type="button" onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cerebre-muted hover:text-cerebre-text transition-colors"
                        aria-label={showPassword ? 'Hide' : 'Show'}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={passwordValue} />
                    {errors.password && <p className="mt-1 text-xs text-cerebre-coral">{errors.password.message}</p>}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="confirmPwd">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                      <input
                        id="confirmPwd" type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password" placeholder="Repeat your password"
                        className={[inputBase, 'pr-10', errors.confirmPassword ? 'border-cerebre-coral' : ''].join(' ')}
                        {...register('confirmPassword')}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cerebre-muted hover:text-cerebre-text transition-colors"
                        aria-label={showConfirmPassword ? 'Hide' : 'Show'}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-xs text-cerebre-coral">{errors.confirmPassword.message}</p>}
                  </div>

                  {/* Referral code (pre-filled if from ref link) */}
                  <div>
                    <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="refCode">
                      Referral code <span className="text-cerebre-muted font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                      <input
                        id="refCode" type="text"
                        placeholder="e.g. A3F9"
                        className={inputBase.replace('text-sm', 'text-sm font-mono tracking-widest uppercase')}
                        {...register('referralCode')}
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div>
                    <div className="flex items-start gap-2">
                      <input
                        id="terms" type="checkbox"
                        className="w-4 h-4 mt-0.5 rounded border-cerebre-border bg-cerebre-navy accent-cerebre-gold cursor-pointer flex-shrink-0"
                        {...register('terms')}
                      />
                      <label htmlFor="terms" className="text-sm text-cerebre-muted cursor-pointer leading-relaxed">
                        I agree to the{' '}
                        <button type="button" onClick={() => setTermsModalOpen(true)}
                          className="text-cerebre-gold hover:text-cerebre-gold-light transition-colors underline underline-offset-2">
                          Terms of Service and Privacy Policy
                        </button>
                      </label>
                    </div>
                    {errors.terms && <p className="mt-1 text-xs text-cerebre-coral">{errors.terms.message}</p>}
                  </div>

                  {/* Auth error */}
                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
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
                    type="submit" disabled={isSubmitting}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-button font-semibold text-sm text-cerebre-ink bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light hover:shadow-gold hover:-translate-y-px transition-all duration-200 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:outline-none mt-1"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <span className="flex gap-1">
                          {[0,1,2].map(i => (
                            <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-cerebre-ink"
                              animate={{ y: [0,-4,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }} />
                          ))}
                        </span>
                        Creating your account…
                      </span>
                    ) : ' Create My Account'}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-cerebre-muted">
                  Already have an account?{' '}
                  <Link href="/login" className="text-cerebre-gold hover:text-cerebre-gold-light font-medium transition-colors">
                    Sign in →
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Terms modal */}
      <Modal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        title="Terms of Service & Privacy Policy"
        size="md"
      >
        <TermsContent />
      </Modal>
    </div>
  )
}
