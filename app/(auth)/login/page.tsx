'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBrowserClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

// ─────────────────────────────────────────────────────────────
// ROTATING TESTIMONIALS
// ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'Cerebre Plus gave my business in Lekki what an ₦800,000 agency couldn\'t deliver in 6 months.',
    author: 'Amaka O.',
    business: 'Skincare brand, Lagos',
    initials: 'AO',
  },
  {
    quote: 'My WhatsApp broadcasts now get 3x more replies. The copy sounds exactly like me — but better.',
    author: 'Emeka T.',
    business: 'Events company, Abuja',
    initials: 'ET',
  },
  {
    quote: 'I ran StrategyBrain once and now I know exactly what to do for the next 90 days. No confusion.',
    author: 'Fatima B.',
    business: 'Fashion house, Kano',
    initials: 'FB',
  },
  {
    quote: 'The first time I used it, I generated a full sales email sequence in under 2 minutes. I cried.',
    author: 'Chukwuemeka A.',
    business: 'Logistics company, Port Harcourt',
    initials: 'CA',
  },
]

// ─────────────────────────────────────────────────────────────
// GOLD PARTICLES (CSS-only, subtle background animation)
// ─────────────────────────────────────────────────────────────

const GoldParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-cerebre-gold/30"
        style={{
          left: `${10 + (i * 7.5) % 85}%`,
          top: `${15 + (i * 11) % 70}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 3 + (i % 3),
          repeat: Infinity,
          delay: i * 0.35,
          ease: 'easeInOut',
        }}
      />
    ))}
    {/* Larger accent orbs */}
    <motion.div
      className="absolute w-40 h-40 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(224,152,24,0.06) 0%, transparent 70%)',
        left: '10%', top: '20%',
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-64 h-64 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(12,196,160,0.04) 0%, transparent 70%)',
        right: '5%', bottom: '15%',
      }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
    />
  </div>
)

// ─────────────────────────────────────────────────────────────
// LEFT PANEL
// ─────────────────────────────────────────────────────────────

const LeftPanel = () => {
  const [activeTestimonial, setActiveTestimonial] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const t = TESTIMONIALS[activeTestimonial]

  return (
    <div className="hidden lg:flex flex-col justify-between relative h-full p-10 overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #06080E 0%, #0B1F3A 50%, #0E1F3A 100%)' }}>
      <GoldParticles />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cerebre-gold flex items-center justify-center">
          <span className="text-cerebre-ink font-black text-sm font-mono">C+</span>
        </div>
        <div>
          <p className="font-bold text-cerebre-text text-base leading-tight">Cerebre Plus</p>
          <p className="text-[11px] text-cerebre-muted">by Cerebre Media Africa</p>
        </div>
      </div>

      {/* Hero copy */}
      <div className="relative z-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="font-display font-bold text-4xl text-cerebre-text leading-tight mb-3">
            The marketing team{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E09818, #F5C040)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              your business deserves.
            </span>
          </h1>
          <p className="text-cerebre-muted text-base leading-relaxed max-w-sm">
            40 AI tools trained on the Nigerian market. Built for serious business owners who want results — not theory.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="flex items-center gap-6 pt-2">
          {[
            { value: '40+', label: 'AI tools' },
            { value: '2,400+', label: 'businesses' },
            { value: '9', label: 'categories' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-bold text-cerebre-gold text-xl leading-tight">{stat.value}</p>
              <p className="text-cerebre-muted text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className="mt-6 p-4 rounded-xl border border-cerebre-border/60"
          style={{ background: 'rgba(18,32,56,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-sm text-cerebre-text leading-relaxed italic mb-3">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cerebre-gold flex items-center justify-center flex-shrink-0">
                  <span className="text-cerebre-ink text-[10px] font-black">{t.initials}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-cerebre-text">{t.author}</p>
                  <p className="text-[11px] text-cerebre-muted">{t.business}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex gap-1.5 mt-3">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className="transition-all duration-300"
                style={{
                  width: i === activeTestimonial ? 16 : 6,
                  height: 4,
                  borderRadius: 2,
                  background: i === activeTestimonial ? '#E09818' : 'rgba(72,104,128,0.5)',
                }}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trust signal */}
      <div className="relative z-10">
        <p className="text-xs text-cerebre-muted">
          🇳🇬 Joined by 2,400+ business owners across Lagos, Abuja, and beyond
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GOOGLE SIGN-IN BUTTON
// ─────────────────────────────────────────────────────────────

const GoogleButton = ({
  onClick,
  loading,
  label = 'Continue with Google',
}: {
  onClick: () => void
  loading: boolean
  label?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={[
      'w-full flex items-center justify-center gap-2.5 h-10 rounded-button',
      'bg-white text-gray-800 text-sm font-semibold',
      'border border-gray-200 shadow-sm',
      'hover:bg-gray-50 transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:outline-none',
    ].join(' ')}
  >
    {/* Google SVG */}
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
    {loading ? 'Signing in…' : label}
  </button>
)

// ─────────────────────────────────────────────────────────────
// ERROR MESSAGES
// ─────────────────────────────────────────────────────────────

function parseAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Incorrect email or password. Please check and try again.'
  if (message.includes('Email not confirmed'))
    return 'Please verify your email address before signing in.'
  if (message.includes('Too many requests'))
    return 'Too many sign-in attempts. Please wait 5 minutes and try again.'
  if (message.includes('User not found'))
    return 'No account found with this email. Would you like to create one?'
  return message
}

// ─────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const [showPassword, setShowPassword] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  })

  // ── Email/password sign in ─────────────────────────────────
  const onSubmit = async (values: LoginForm) => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    })

    if (error) {
      setAuthError(parseAuthError(error.message))
      return
    }

    router.push(redirect)
    router.refresh()
  }

  // ── Google OAuth ───────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true)
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=${redirect}`,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
      },
    })
    if (error) {
      setAuthError(error.message)
      setGoogleLoading(false)
    }
    // On success the browser navigates away — no need to setGoogleLoading(false)
  }

  const inputBase = [
    'w-full h-10 bg-cerebre-navy rounded-input border px-3.5 py-2.5 pl-10',
    'text-sm text-cerebre-text placeholder:text-cerebre-muted outline-none',
    'transition-all duration-200',
    'border-cerebre-border hover:border-cerebre-gold/40',
    'focus:border-cerebre-gold focus:ring-2 focus:ring-cerebre-gold/20',
    'disabled:opacity-40',
  ].join(' ')

  return (
    <div className="min-h-dvh flex">
      {/* Left panel */}
      <div className="w-[45%] flex-shrink-0">
        <LeftPanel />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-cerebre-ink px-6 py-12 min-h-dvh lg:min-h-0">
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

          {/* Heading */}
          <div className="mb-7">
            <h2 className="font-display font-semibold text-2xl text-cerebre-text mb-1.5">
              Welcome back
            </h2>
            <p className="text-sm text-cerebre-muted">
              Sign in to your account to keep building.
            </p>
          </div>

          {/* Google OAuth */}
          <GoogleButton onClick={handleGoogle} loading={googleLoading} />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-cerebre-border" />
            <span className="text-xs text-cerebre-muted">or continue with email</span>
            <div className="flex-1 h-px bg-cerebre-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-cerebre-text mb-1.5" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@business.com"
                  className={[
                    inputBase,
                    errors.email ? 'border-cerebre-coral focus:border-cerebre-coral focus:ring-cerebre-coral/20' : '',
                  ].join(' ')}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-cerebre-coral">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-cerebre-text" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-cerebre-gold hover:text-cerebre-gold-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted" aria-hidden />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={[
                    inputBase,
                    'pr-10',
                    errors.password ? 'border-cerebre-coral focus:border-cerebre-coral focus:ring-cerebre-coral/20' : '',
                  ].join(' ')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cerebre-muted hover:text-cerebre-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-cerebre-coral">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-cerebre-border bg-cerebre-navy accent-cerebre-gold cursor-pointer"
                {...register('remember')}
              />
              <label htmlFor="remember" className="text-sm text-cerebre-muted cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            {/* Global auth error */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
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
              className={[
                'w-full h-10 flex items-center justify-center gap-2',
                'rounded-button font-semibold text-sm text-cerebre-ink',
                'bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light',
                'hover:shadow-gold hover:-translate-y-px transition-all duration-200',
                'active:translate-y-0 active:shadow-none',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
                'focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cerebre-ink focus-visible:outline-none',
              ].join(' ')}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-cerebre-ink"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                  Signing you in…
                </span>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-cerebre-muted">
            Don't have an account?{' '}
            <Link href="/signup" className="text-cerebre-gold hover:text-cerebre-gold-light font-medium transition-colors">
              Create one →
            </Link>
          </p>

          {/* Mobile trust signal */}
          <p className="lg:hidden mt-8 text-center text-xs text-cerebre-muted">
            🇳🇬 Joined by 2,400+ business owners across Lagos, Abuja, and beyond
          </p>
        </motion.div>
      </div>
    </div>
  )
}
