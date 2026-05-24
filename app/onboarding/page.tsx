'use client'

// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/onboarding/page.tsx
// The 7-step onboarding wizard for Cerebre Plus.
// Server-redirects here if onboarding_complete = false.
// ═══════════════════════════════════════════════════════════════

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Check, X, ChevronDown,
  Search, Upload, Palette, Loader2, Sparkles,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  detectIndustryFromName,
  getCityAutocomplete,
  mapLocationToCity,
  INDUSTRY_CATEGORIES,
  getIndustryPriceRanges,
  type IndustryCategory,
  type LocationResult,
} from '@/lib/onboarding/business-intelligence'
import {
  getDescriptionSuggestion,
  getTargetCustomerSuggestion,
  getUniqueAdvantageSuggestion,
  getPainPointSuggestion,
} from '@/lib/onboarding/description-predictor'
import {
  ONBOARDING_STEPS,
  getTimeRemaining,
  getStepEncouragement,
} from '@/lib/onboarding/description-predictor'
import { LoadingStages } from '@/components/ui/LoadingStages'
import { OutputRenderer } from '@/components/tools/OutputRenderer'

// ─────────────────────────────────────────────────────────────
// MARKETING CHALLENGE OPTIONS
// ─────────────────────────────────────────────────────────────

const CHALLENGES = [
  { id: 'awareness', icon: '🔇', text: 'Not enough people know my business' },
  { id: 'conversion', icon: '📉', text: 'People enquire but don\'t buy' },
  { id: 'retention', icon: '🔄', text: 'Customers buy once and don\'t come back' },
  { id: 'roi', icon: '💸', text: 'I\'m spending on marketing with no results' },
  { id: 'time', icon: '⏰', text: 'No time to create content consistently' },
  { id: 'channels', icon: '🎯', text: 'Don\'t know which channels to focus on' },
  { id: 'competitors', icon: '🏆', text: 'Competitors look more professional online' },
  { id: 'social_media', icon: '📱', text: 'I know I need social media but don\'t know what to post' },
] as const

type ChallengeId = typeof CHALLENGES[number]['id']

// ─────────────────────────────────────────────────────────────
// BRAND VOICE OPTIONS
// ─────────────────────────────────────────────────────────────

const BRAND_VOICES = [
  {
    id: 'professional',
    label: 'Professional & Authoritative',
    description: 'The credible expert. Formal, precise, trustworthy.',
    example: '"We provide certified financial advisory services tailored to your goals."',
    emoji: '🎓',
  },
  {
    id: 'friendly',
    label: 'Friendly & Approachable',
    description: 'The warm neighbour. Conversational, accessible, personable.',
    example: '"We\'d love to help you find the perfect home — just reach out anytime!"',
    emoji: '😊',
  },
  {
    id: 'bold_direct',
    label: 'Energetic & Bold',
    description: 'The challenger. Direct, punchy, confident, action-oriented.',
    example: '"Stop wasting time. Get results. Start today."',
    emoji: '⚡',
  },
  {
    id: 'luxury',
    label: 'Luxury & Premium',
    description: 'The exclusive brand. Refined, aspirational, beautifully curated.',
    example: '"Crafted for those who demand the extraordinary in every detail."',
    emoji: '💎',
  },
  {
    id: 'storytelling',
    label: 'Warm & Personal',
    description: 'The trusted friend. Honest, human, storytelling-led.',
    example: '"We started this because we felt the same frustration you\'re feeling now."',
    emoji: '❤️',
  },
  {
    id: 'mass_market',
    label: 'Mass Market & Direct',
    description: 'The people\'s brand. Plain language, high energy, no-nonsense.',
    example: '"Best price in Lagos. Order now and get it delivered today!"',
    emoji: '🔥',
  },
] as const

// ─────────────────────────────────────────────────────────────
// CHALLENGE → TOOL MAPPING
// ─────────────────────────────────────────────────────────────

const CHALLENGE_TO_TOOL: Record<ChallengeId, {
  toolId: string
  toolName: string
  coinCost: number
  reasoning: string
  loadingMsgs: string[]
  estimatedSecs: number
}> = {
  awareness: {
    toolId: 'strategy-brain', toolName: 'StrategyBrain', coinCost: 0,
    reasoning: 'Your biggest challenge is visibility. StrategyBrain will build you a complete 90-day plan for getting known in your market.',
    loadingMsgs: ['Reading your business profile…', 'Analysing your market opportunity…', 'Building your 90-day visibility strategy…', 'Adding Naira-specific recommendations…', 'Finalising your personalised plan…'],
    estimatedSecs: 30,
  },
  social_media: {
    toolId: 'content-calendar', toolName: 'Content Calendar', coinCost: 0,
    reasoning: 'You need a content system. Content Calendar will build your full 30-day posting plan across all your platforms.',
    loadingMsgs: ['Reading your industry and audience…', 'Planning your content themes…', 'Scheduling around Nigerian salary cycle…', 'Building your 30-day calendar…', 'Adding platform-specific formats…'],
    estimatedSecs: 20,
  },
  conversion: {
    toolId: 'sales-script-writer', toolName: 'SalesScriptWriter', coinCost: 0,
    reasoning: 'People are interested but not buying. SalesScriptWriter will write you a step-by-step script for turning enquiries into paying customers.',
    loadingMsgs: ['Studying your offer and audience…', 'Building objection-handling branches…', 'Writing your closing sequence…', 'Adding Nigerian buyer psychology…', 'Finalising your sales script…'],
    estimatedSecs: 22,
  },
  time: {
    toolId: 'caption-craft', toolName: 'CaptionCraft', coinCost: 0,
    reasoning: 'Time is your constraint. CaptionCraft will generate a week\'s worth of ready-to-post captions in under a minute.',
    loadingMsgs: ['Studying your brand voice…', 'Crafting scroll-stopping hooks…', 'Writing captions for your platform…', 'Adding hashtag strategy…', 'Including WhatsApp CTAs…'],
    estimatedSecs: 12,
  },
  retention: {
    toolId: 'win-back-campaign', toolName: 'WinBackCampaign', coinCost: 0,
    reasoning: 'Keeping customers is cheaper than finding new ones. WinBackCampaign will give you a complete re-engagement sequence.',
    loadingMsgs: ['Analysing your customer retention challenge…', 'Building re-engagement strategy…', 'Writing your "we miss you" messages…', 'Adding urgency mechanisms…', 'Finalising your win-back sequence…'],
    estimatedSecs: 20,
  },
  roi: {
    toolId: 'budget-optimizer', toolName: 'BudgetOptimizer', coinCost: 0,
    reasoning: 'You need better returns from your marketing spend. BudgetOptimizer will show you exactly where to put every naira.',
    loadingMsgs: ['Analysing your industry and market…', 'Calculating channel ROI for Nigerian businesses…', 'Building your optimal allocation plan…', 'Adding Naira-specific benchmarks…', 'Finalising your budget strategy…'],
    estimatedSecs: 25,
  },
  channels: {
    toolId: 'audience-profiler', toolName: 'AudienceProfiler', coinCost: 0,
    reasoning: 'Knowing your customer tells you which channels to use. AudienceProfiler builds your complete Ideal Customer Portrait.',
    loadingMsgs: ['Studying your industry and city…', 'Building your Nigerian customer profile…', 'Mapping buying psychology…', 'Identifying FOBE patterns…', 'Completing your audience portrait…'],
    estimatedSecs: 28,
  },
  competitors: {
    toolId: 'brand-positioner', toolName: 'BrandPositioner', coinCost: 0,
    reasoning: 'Looking more professional starts with positioning. BrandPositioner crafts your unique market position statement.',
    loadingMsgs: ['Analysing your competitive landscape…', 'Identifying your positioning territory…', 'Crafting your brand promise…', 'Writing your value proposition…', 'Finalising your brand positioning…'],
    estimatedSecs: 28,
  },
}

// ─────────────────────────────────────────────────────────────
// STEP PROGRESS BAR
// ─────────────────────────────────────────────────────────────

const StepProgressBar = ({
  currentStep,
  totalSteps,
  firstName,
}: {
  currentStep: number
  totalSteps: number
  firstName: string
}) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-cerebre-ink/95 backdrop-blur-sm border-b border-cerebre-border px-4 py-3">
    <div className="max-w-lg mx-auto">
      {/* Dots */}
      <div className="flex items-center gap-2 mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1
          const done = step < currentStep
          const active = step === currentStep

          return (
            <React.Fragment key={step}>
              <motion.div
                animate={{
                  scale: active ? 1.15 : 1,
                }}
                className={[
                  'flex items-center justify-center rounded-full flex-shrink-0',
                  'transition-colors duration-300',
                  active ? 'w-5 h-5 bg-cerebre-gold border-2 border-cerebre-gold' :
                    done ? 'w-4 h-4 bg-cerebre-teal' :
                      'w-4 h-4 bg-cerebre-border',
                ].join(' ')}
              >
                {done && <Check className="h-2.5 w-2.5 text-cerebre-ink" />}
                {active && (
                  <div className="w-2 h-2 rounded-full bg-cerebre-ink" />
                )}
              </motion.div>
              {i < totalSteps - 1 && (
                <div className={[
                  'flex-1 h-0.5 rounded-full transition-colors duration-300',
                  step < currentStep ? 'bg-cerebre-teal' : 'bg-cerebre-border',
                ].join(' ')} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-cerebre-muted">
          Step <span className="text-cerebre-text font-medium">{currentStep}</span> of {totalSteps}
          {' '}· {ONBOARDING_STEPS[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-cerebre-muted">{getTimeRemaining(currentStep)}</p>
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// TYPEWRITER EFFECT HOOK
// ─────────────────────────────────────────────────────────────

function useTypewriter(text: string, onComplete?: () => void) {
  const [displayed, setDisplayed] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)

  const startTyping = React.useCallback((content: string) => {
    setDisplayed('')
    setIsTyping(true)
    let i = 0
    const interval = setInterval(() => {
      if (i >= content.length) {
        clearInterval(interval)
        setIsTyping(false)
        onComplete?.()
        return
      }
      setDisplayed(content.slice(0, i + 1))
      i++
    }, 12)  // ~80 chars/second
    return () => clearInterval(interval)
  }, [onComplete])

  return { displayed, isTyping, startTyping }
}

// ─────────────────────────────────────────────────────────────
// SUGGESTION CARD (ghost text + "Use this suggestion" button)
// ─────────────────────────────────────────────────────────────

const SuggestionCard = ({
  suggestion,
  onAccept,
  label = 'Use this suggestion',
}: {
  suggestion: string
  onAccept: (text: string) => void
  label?: string
}) => {
  if (!suggestion) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 6, height: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-2 p-3 rounded-lg border border-cerebre-gold/25 bg-cerebre-gold-dim"
    >
      <p className="text-xs text-cerebre-muted italic leading-relaxed mb-2 line-clamp-3">
        "{suggestion}"
      </p>
      <button
        type="button"
        onClick={() => onAccept(suggestion)}
        className="text-xs font-semibold text-cerebre-gold hover:text-cerebre-gold-light transition-colors flex items-center gap-1"
      >
        <Sparkles className="h-3 w-3" /> {label}
      </button>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// INDUSTRY DETECT CARD
// ─────────────────────────────────────────────────────────────

const IndustryDetectCard = ({
  reasoning,
  industry,
  onConfirm,
  onDismiss,
}: {
  reasoning: string
  industry: string
  onConfirm: () => void
  onDismiss: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 6, height: 0 }}
    animate={{ opacity: 1, y: 0, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="mt-2 p-3 rounded-lg border border-cerebre-teal/30 bg-cerebre-teal-dim"
  >
    <p className="text-xs text-cerebre-muted mb-2">
      💡 {reasoning}. We think you're in{' '}
      <span className="font-semibold text-cerebre-text">{industry}</span> — is that right?
    </p>
    <div className="flex gap-2">
      <button type="button" onClick={onConfirm}
        className="flex items-center gap-1 text-xs font-semibold text-cerebre-teal hover:text-cerebre-teal-light transition-colors">
        <Check className="h-3.5 w-3.5" /> Yes, that's right
      </button>
      <button type="button" onClick={onDismiss}
        className="flex items-center gap-1 text-xs text-cerebre-muted hover:text-cerebre-text transition-colors ml-3">
        <X className="h-3 w-3" /> No, let me change it
      </button>
    </div>
  </motion.div>
)

// ─────────────────────────────────────────────────────────────
// FORM STATE
// ─────────────────────────────────────────────────────────────

interface OnboardingState {
  // Step 1
  firstName: string

  // Step 2
  businessName: string
  industry: IndustryCategory | ''
  city: string
  cityResult: LocationResult | null
  yearsInBusiness: string
  description: string

  // Step 3
  targetCustomer: string
  painPointSolved: string
  uniqueAdvantage: string
  priceRange: string

  // Step 4
  brandVoice: string
  languagePreference: string
  primaryCta: string

  // Step 5
  whatsapp: string
  phone: string
  emailContact: string
  address: string
  instagram: string
  facebook: string
  linkedin: string
  tiktok: string

  // Step 6
  logoUrl: string
  brandColour: string

  // Step 7 (challenge)
  challenges: ChallengeId[]
}

const INITIAL_STATE: OnboardingState = {
  firstName: '', businessName: '', industry: '', city: '',
  cityResult: null, yearsInBusiness: '', description: '',
  targetCustomer: '', painPointSolved: '', uniqueAdvantage: '', priceRange: '',
  brandVoice: '', languagePreference: 'nigerian_english', primaryCta: 'WhatsApp Us',
  whatsapp: '', phone: '', emailContact: '', address: '',
  instagram: '', facebook: '', linkedin: '', tiktok: '',
  logoUrl: '', brandColour: '#E09818', challenges: [],
}

// ─────────────────────────────────────────────────────────────
// REUSABLE INPUT STYLES
// ─────────────────────────────────────────────────────────────

const inputClass = 'w-full h-10 bg-cerebre-navy rounded-input border border-cerebre-border px-3.5 text-sm text-cerebre-text placeholder:text-cerebre-muted outline-none transition-all duration-200 hover:border-cerebre-gold/40 focus:border-cerebre-gold focus:ring-2 focus:ring-cerebre-gold/20'
const textareaClass = 'w-full bg-cerebre-navy rounded-card border border-cerebre-border px-3.5 py-2.5 text-sm text-cerebre-text placeholder:text-cerebre-muted outline-none transition-all duration-200 hover:border-cerebre-gold/40 focus:border-cerebre-gold focus:ring-2 focus:ring-cerebre-gold/20 resize-none leading-relaxed'
const labelClass = 'block text-sm font-medium text-cerebre-text mb-1.5'

// ─────────────────────────────────────────────────────────────
// NAVIGATION BUTTONS
// ─────────────────────────────────────────────────────────────

const StepNav = ({
  step,
  totalSteps,
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextLoading = false,
  nextDisabled = false,
}: {
  step: number
  totalSteps: number
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextLoading?: boolean
  nextDisabled?: boolean
}) => (
  <div className="flex items-center justify-between pt-6 border-t border-cerebre-border/50 mt-8">
    {step > 1 ? (
      <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-cerebre-muted hover:text-cerebre-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
    ) : <div />}

    <button
      type="button"
      onClick={onNext}
      disabled={nextDisabled || nextLoading}
      className="flex items-center gap-2 h-10 px-6 rounded-button text-sm font-semibold text-cerebre-ink bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light hover:shadow-gold hover:-translate-y-px transition-all duration-200 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {nextLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {nextLabel}
          {nextLabel === 'Continue' && <ArrowRight className="h-4 w-4" />}
        </>
      )}
    </button>
  </div>
)

// ─────────────────────────────────────────────────────────────
// STEP 1 — WELCOME
// ─────────────────────────────────────────────────────────────

const Step1Welcome = ({
  firstName,
  onNext,
  onSkip,
}: {
  firstName: string
  onNext: () => void
  onSkip: () => void
}) => {
  const benefits = [
    { icon: '⚡', number: '40', text: 'AI marketing tools are ready for your business' },
    { icon: '🇳🇬', text: 'Built specifically for Nigerian and African market realities' },
    { icon: '📣', text: 'Your competitors are already looking for this — don\'t be last' },
  ]

  return (
    <div className="text-center">
      {/* Logo animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
        className="mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-cerebre-gold mx-auto flex items-center justify-center shadow-gold mb-3">
          <span className="text-cerebre-ink font-black text-xl font-mono">C+</span>
        </div>

        {/* <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-gold mb-3 relative overflow-hidden">
  <Image
    src="/Cerebre_Plus_2.png"
    alt="Cerebre Plus"
    fill
    className="object-cover"
  />
</div> */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-xs text-cerebre-muted"
        >
          by Cerebre Media Africa
        </motion.p>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display font-bold text-2xl md:text-3xl text-cerebre-text mb-3">
          Welcome{firstName ? `, ${firstName}` : ''}. 👋
        </h1>
        <p className="text-base text-cerebre-muted leading-relaxed max-w-sm mx-auto">
          Let's make your business <span className="text-cerebre-gold font-semibold">impossible to ignore.</span>
        </p>
      </motion.div>

      {/* Benefits */}
      <div className="space-y-3 mb-8 max-w-sm mx-auto text-left">
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-cerebre-border bg-cerebre-surface"
          >
            <span className="text-xl flex-shrink-0">{b.icon}</span>
            <p className="text-sm text-cerebre-text leading-snug">
              {b.number && (
                <span className="font-bold text-cerebre-gold">{b.number} </span>
              )}
              {b.text}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
        className="space-y-3"
      >
        <p className="text-sm text-cerebre-muted">It takes 3 minutes to set up.</p>
        <button
          type="button"
          onClick={onNext}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 h-12 rounded-button text-base font-bold text-cerebre-ink bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light hover:shadow-gold hover:-translate-y-px transition-all duration-200 active:translate-y-0"
        >
          Start Setup <ArrowRight className="h-5 w-5" />
        </button>
        <button type="button" onClick={onSkip}
          className="block text-xs text-cerebre-muted hover:text-cerebre-text transition-colors mx-auto pt-1">
          Skip for now
        </button>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — YOUR BUSINESS
// ─────────────────────────────────────────────────────────────

const Step2Business = ({
  state,
  update,
  onNext,
  onBack,
}: {
  state: OnboardingState
  update: (key: keyof OnboardingState, value: any) => void
  onNext: () => void
  onBack: () => void
}) => {
  // const [detecting,    setDetecting]    = React.useState(false)
  const [detection, setDetection] = React.useState<{ industry: IndustryCategory; reasoning: string } | null>(null)
  const [showDetect, setShowDetect] = React.useState(false)
  const [cityQuery, setCityQuery] = React.useState(state.city)
  const [cityResults, setCityResults] = React.useState<LocationResult[]>([])
  const [showCitySugg, setShowCitySugg] = React.useState(false)
  const [descSuggestion, setDescSugg] = React.useState('')
  const { startTyping } = useTypewriter(state.description)
  const detectTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-detect industry from business name with debounce
  const handleNameChange = (name: string) => {
    update('businessName', name)
    if (detectTimer.current) clearTimeout(detectTimer.current)
    detectTimer.current = setTimeout(() => {
      const result = detectIndustryFromName(name)
      if (result && result.confidence !== 'low') {
        setDetection({ industry: result.industry as IndustryCategory, reasoning: result.reasoning })
        setShowDetect(true)
      } else {
        setShowDetect(false)
      }
    }, 400)
  }

  const handleIndustryConfirm = () => {
    if (detection) {
      update('industry', detection.industry)
      setShowDetect(false)
    }
  }

  // City autocomplete
  const handleCityChange = (q: string) => {
    setCityQuery(q)
    update('city', q)
    const results = getCityAutocomplete(q)
    setCityResults(results)
    setShowCitySugg(results.length > 0 && q.length > 1)
  }

  const handleCitySelect = (loc: LocationResult) => {
    update('city', loc.city)
    update('cityResult', loc)
    setCityQuery(loc.display)
    setShowCitySugg(false)
  }

  // Description suggestion when industry + city are both set
  React.useEffect(() => {
    if (state.industry && state.city && !state.description) {
      const sugg = getDescriptionSuggestion(
        state.industry as IndustryCategory,
        state.city,
        state.businessName,
      )
      setDescSugg(sugg)
    }
  }, [state.industry, state.city, state.businessName, state.description])

  const handleUseSuggestion = (text: string) => {
    startTyping(text)
    update('description', text)
    setDescSugg('')
  }

  const canProceed = state.businessName && state.industry && state.city && state.description.length >= 20

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-semibold text-xl text-cerebre-text mb-1">Tell us about your business</h2>
        <p className="text-sm text-cerebre-muted">This powers all your AI tool outputs — the more specific, the better.</p>
      </div>

      {/* Business name */}
      <div>
        <label className={labelClass} htmlFor="biz-name">Business name *</label>
        <input
          id="biz-name" type="text"
          value={state.businessName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Adaeze Skincare Lagos"
          className={inputClass}
        />
        <AnimatePresence>
          {showDetect && detection && (
            <IndustryDetectCard
              reasoning={detection.reasoning}
              industry={detection.industry}
              onConfirm={handleIndustryConfirm}
              onDismiss={() => setShowDetect(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Industry */}
      <div>
        <label className={labelClass} htmlFor="industry">Industry *</label>
        <div className="relative">
          <select
            id="industry"
            value={state.industry}
            onChange={(e) => update('industry', e.target.value)}
            className={`${inputClass} pr-9 appearance-none`}
          >
            <option value="">Select your industry…</option>
            {INDUSTRY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted pointer-events-none" />
        </div>
      </div>

      {/* City */}
      <div>
        <label className={labelClass} htmlFor="city">
          City *
          {state.cityResult && (
            <span className="ml-2 text-cerebre-teal font-normal text-xs">
              {state.cityResult.flag} {state.cityResult.display}
            </span>
          )}
        </label>
        <div className="relative">
          <input
            id="city" type="text"
            value={cityQuery}
            onChange={(e) => handleCityChange(e.target.value)}
            onFocus={() => cityQuery.length > 1 && setShowCitySugg(true)}
            onBlur={() => setTimeout(() => setShowCitySugg(false), 200)}
            placeholder="e.g. Lekki, Lagos"
            className={inputClass}
            autoComplete="off"
          />
          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showCitySugg && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 right-0 mt-1 z-20 bg-cerebre-surface border border-cerebre-border rounded-card shadow-cerebre overflow-hidden"
              >
                {cityResults.map((loc) => (
                  <button
                    key={loc.display}
                    type="button"
                    onMouseDown={() => handleCitySelect(loc)}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-cerebre-text hover:bg-cerebre-gold-dim transition-colors flex items-center gap-2"
                  >
                    <span>{loc.flag}</span>
                    <span>{loc.display}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Years in business */}
      <div>
        <label className={labelClass} htmlFor="years">Years in business</label>
        <div className="relative">
          <select
            id="years"
            value={state.yearsInBusiness}
            onChange={(e) => update('yearsInBusiness', e.target.value)}
            className={`${inputClass} pr-9 appearance-none`}
          >
            <option value="">Select…</option>
            <option value="less_than_1">Less than 1 year</option>
            <option value="1_to_3">1–3 years</option>
            <option value="3_to_5">3–5 years</option>
            <option value="5_to_10">5–10 years</option>
            <option value="10_plus">10+ years</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted pointer-events-none" />
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-cerebre-text" htmlFor="desc">
            Business description *
          </label>
          <span className={`text-xs tabular-nums ${state.description.length > 240 ? 'text-cerebre-coral' : 'text-cerebre-muted'}`}>
            {state.description.length}/250
          </span>
        </div>
        <textarea
          id="desc"
          value={state.description}
          onChange={(e) => {
            if (e.target.value.length <= 250) update('description', e.target.value)
          }}
          placeholder="Describe what your business does, who you serve, and what makes you different…"
          className={textareaClass}
          rows={4}
          maxLength={250}
        />
        <p className="mt-1 text-xs text-cerebre-muted">
          This is the foundation of all your tool outputs — the more specific, the better your results.
        </p>
        <AnimatePresence>
          {descSuggestion && !state.description && (
            <SuggestionCard suggestion={descSuggestion} onAccept={handleUseSuggestion} />
          )}
        </AnimatePresence>
      </div>

      <StepNav step={2} totalSteps={7} onBack={onBack} onNext={onNext} nextDisabled={!canProceed} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STEP 3 — YOUR CUSTOMERS
// ─────────────────────────────────────────────────────────────

const Step3Customers = ({
  state, update, onNext, onBack,
}: { state: OnboardingState; update: (k: keyof OnboardingState, v: any) => void; onNext: () => void; onBack: () => void }) => {
  const industry = state.industry as IndustryCategory | null
  const priceRanges = industry ? getIndustryPriceRanges(industry) : []

  const customerSugg = getTargetCustomerSuggestion(industry, state.city)
  const advantageSugg = getUniqueAdvantageSuggestion(industry)
  const painPointSugg = getPainPointSuggestion(industry)

  const canProceed = state.targetCustomer.length >= 10 && state.uniqueAdvantage.length >= 5

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-semibold text-xl text-cerebre-text mb-1">Who do you serve?</h2>
        <p className="text-sm text-cerebre-muted">Define your ideal customer — this shapes every tool output.</p>
      </div>

      {/* Target customer */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass.replace('mb-1.5', '')} htmlFor="target">Target customer *</label>
          <span className="text-xs text-cerebre-muted">{state.targetCustomer.length}/250</span>
        </div>
        <textarea id="target" value={state.targetCustomer}
          onChange={(e) => { if (e.target.value.length <= 250) update('targetCustomer', e.target.value) }}
          placeholder="e.g. Lagos professionals aged 28–45 who want quality skincare but struggle to find trusted brands"
          className={textareaClass} rows={3} maxLength={250} />
        <AnimatePresence>
          {customerSugg && !state.targetCustomer && (
            <SuggestionCard suggestion={customerSugg} onAccept={(t) => update('targetCustomer', t)} />
          )}
        </AnimatePresence>
      </div>

      {/* Pain point */}
      <div>
        <label className={labelClass} htmlFor="pain">Primary problem you solve</label>
        <input id="pain" type="text" value={state.painPointSolved}
          onChange={(e) => update('painPointSolved', e.target.value)}
          placeholder="e.g. Finding quality skincare products without fear of fakes or skin damage"
          className={inputClass} />
        <AnimatePresence>
          {painPointSugg && !state.painPointSolved && (
            <SuggestionCard suggestion={painPointSugg} onAccept={(t) => update('painPointSolved', t)} label="Use suggestion" />
          )}
        </AnimatePresence>
      </div>

      {/* Unique advantage */}
      <div>
        <label className={labelClass} htmlFor="advantage">Unique advantage *</label>
        <input id="advantage" type="text" value={state.uniqueAdvantage}
          onChange={(e) => update('uniqueAdvantage', e.target.value)}
          placeholder="What makes you different from every other business in your industry?"
          className={inputClass} />
        <p className="mt-1 text-xs text-cerebre-muted">
          This becomes your competitive edge in every piece of content.
        </p>
        <AnimatePresence>
          {advantageSugg && !state.uniqueAdvantage && (
            <SuggestionCard suggestion={advantageSugg} onAccept={(t) => update('uniqueAdvantage', t)} label="Use suggestion" />
          )}
        </AnimatePresence>
      </div>

      {/* Price range */}
      <div>
        <label className={labelClass} htmlFor="price">Starting price range</label>
        <div className="relative">
          <select id="price" value={state.priceRange}
            onChange={(e) => update('priceRange', e.target.value)}
            className={`${inputClass} pr-9 appearance-none`}>
            <option value="">Select approximate price range…</option>
            {priceRanges.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted pointer-events-none" />
        </div>
      </div>

      <StepNav step={3} totalSteps={7} onBack={onBack} onNext={onNext} nextDisabled={!canProceed} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STEP 4 — BRAND VOICE
// ─────────────────────────────────────────────────────────────

const Step4BrandVoice = ({
  state, update, onNext, onBack,
}: { state: OnboardingState; update: (k: keyof OnboardingState, v: any) => void; onNext: () => void; onBack: () => void }) => {
  const LANGUAGE_OPTIONS = [
    { id: 'standard_english', label: 'Standard English', example: '"We provide premium solutions tailored to your business goals."' },
    { id: 'nigerian_english', label: 'Nigerian English', example: '"We deliver top-notch service that will take your business to the next level!"' },
    { id: 'mix_pidgin', label: 'Mix with Pidgin', example: '"Our service na the real deal — e go change your business completely."' },
  ]

  const CTA_OPTIONS = [
    'WhatsApp Us', 'Call Us Now', 'Book Appointment',
    'Shop Now', 'Get a Free Consultation', 'Start Your Free Trial', 'Visit Our Store',
  ]

  const canProceed = !!state.brandVoice

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-semibold text-xl text-cerebre-text mb-1">What's your brand voice?</h2>
        <p className="text-sm text-cerebre-muted">This determines the tone of every piece of content we generate for you.</p>
      </div>

      {/* Brand voice cards */}
      <div>
        <p className={labelClass}>Choose your communication style</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BRAND_VOICES.map((voice) => {
            const selected = state.brandVoice === voice.id
            return (
              <motion.button
                key={voice.id}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => update('brandVoice', voice.id)}
                className={[
                  'text-left p-3.5 rounded-card border transition-all duration-200',
                  selected
                    ? 'border-cerebre-gold/60 bg-cerebre-gold-dim shadow-gold-sm'
                    : 'border-cerebre-border bg-cerebre-surface hover:border-cerebre-gold/30',
                ].join(' ')}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0">{voice.emoji}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${selected ? 'text-cerebre-gold' : 'text-cerebre-text'}`}>
                      {voice.label}
                    </p>
                    <p className="text-xs text-cerebre-muted mt-0.5 leading-snug">{voice.description}</p>
                    {selected && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-cerebre-muted italic mt-2 leading-relaxed border-t border-cerebre-gold/20 pt-2"
                      >
                        {voice.example}
                      </motion.p>
                    )}
                  </div>
                  {selected && (
                    <div className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-cerebre-gold flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-cerebre-ink" />
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Language preference */}
      <div>
        <p className={labelClass}>Language preference</p>
        <div className="space-y-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const selected = state.languagePreference === lang.id
            return (
              <label key={lang.id}
                className={[
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200',
                  selected ? 'border-cerebre-gold/40 bg-cerebre-gold-dim' : 'border-cerebre-border hover:border-cerebre-gold/25',
                ].join(' ')}>
                <input type="radio" name="language" value={lang.id} checked={selected}
                  onChange={() => update('languagePreference', lang.id)}
                  className="mt-0.5 accent-cerebre-gold" />
                <div>
                  <p className={`text-sm font-medium ${selected ? 'text-cerebre-gold' : 'text-cerebre-text'}`}>{lang.label}</p>
                  <p className="text-xs text-cerebre-muted italic mt-0.5">{lang.example}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Primary CTA */}
      <div>
        <label className={labelClass} htmlFor="cta">Primary call-to-action</label>
        <div className="relative">
          <select id="cta" value={state.primaryCta}
            onChange={(e) => update('primaryCta', e.target.value)}
            className={`${inputClass} pr-9 appearance-none`}>
            {CTA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cerebre-muted pointer-events-none" />
        </div>
      </div>

      <StepNav step={4} totalSteps={7} onBack={onBack} onNext={onNext} nextDisabled={!canProceed} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STEP 5 — CONTACT DETAILS
// ─────────────────────────────────────────────────────────────

const Step5Contact = ({
  state, update, onNext, onBack,
}: { state: OnboardingState; update: (k: keyof OnboardingState, v: any) => void; onNext: () => void; onBack: () => void }) => {
  const canProceed = state.whatsapp.length >= 10

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-semibold text-xl text-cerebre-text mb-1">How do people reach you?</h2>
        <p className="text-sm text-cerebre-muted">Your WhatsApp number appears on every piece of content we generate.</p>
      </div>

      {/* WhatsApp */}
      <div>
        <label className={labelClass} htmlFor="wa">WhatsApp number *</label>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 h-10 px-3 rounded-input border border-cerebre-border bg-cerebre-navy text-sm text-cerebre-text flex-shrink-0">
            🇳🇬 +234
          </div>
          <input id="wa" type="tel" value={state.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            placeholder="08012345678"
            className={`${inputClass} flex-1`} />
        </div>
        <p className="mt-1 text-xs text-cerebre-gold">
          This becomes the CTA on all your marketing content
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass} htmlFor="phone">Phone number <span className="text-cerebre-muted font-normal">(optional)</span></label>
        <input id="phone" type="tel" value={state.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="08012345678" className={inputClass} />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass} htmlFor="emailc">Business email</label>
        <input id="emailc" type="email" value={state.emailContact}
          onChange={(e) => update('emailContact', e.target.value)}
          placeholder="hello@yourbusiness.com" className={inputClass} />
      </div>

      {/* Address */}
      <div>
        <label className={labelClass} htmlFor="addr">Physical address <span className="text-cerebre-muted font-normal">(optional — boosts local SEO)</span></label>
        <input id="addr" type="text" value={state.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
          className={inputClass} />
      </div>

      {/* Social handles */}
      <div>
        <p className={labelClass}>Social media handles <span className="text-cerebre-muted font-normal">(optional)</span></p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key: 'instagram', placeholder: '@yourhandle', icon: '📸' },
            { key: 'facebook', placeholder: 'Page name', icon: '👥' },
            { key: 'linkedin', placeholder: 'Profile URL', icon: '💼' },
            { key: 'tiktok', placeholder: '@yourhandle', icon: '🎵' },
          ].map((s) => (
            <div key={s.key} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">{s.icon}</span>
              <input type="text" value={(state as any)[s.key]}
                onChange={(e) => update(s.key as keyof OnboardingState, e.target.value)}
                placeholder={s.placeholder}
                className={`${inputClass} pl-9 text-xs`} />
            </div>
          ))}
        </div>
      </div>

      <StepNav step={5} totalSteps={7} onBack={onBack} onNext={onNext} nextDisabled={!canProceed} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STEP 6 — LOGO & BRAND
// ─────────────────────────────────────────────────────────────

const Step6Brand = ({
  state, update, onNext, onBack,
}: { state: OnboardingState; update: (k: keyof OnboardingState, v: any) => void; onNext: () => void; onBack: () => void }) => {
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const [noLogo, setNoLogo] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const extractColourFromImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      img.onload = () => {
        canvas.width = 32
        canvas.height = 32
        ctx?.drawImage(img, 0, 0, 32, 32)
        const data = ctx?.getImageData(0, 0, 32, 32).data
        if (!data) { resolve(null); return }
        // Average colour of non-white pixels
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) continue
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
        }
        if (count === 0) { resolve(null); return }
        const toHex = (n: number) => Math.round(n / count).toString(16).padStart(2, '0')
        resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`)
      }
      img.onerror = () => resolve(null)
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (file: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return }
    setUploading(true)

    const colour = await extractColourFromImage(file)
    if (colour) update('brandColour', colour)

    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/profile/upload-logo', { method: 'POST', body: form })
      if (res.ok) {
        const { url } = await res.json()
        update('logoUrl', url)
      }
    } catch { }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-semibold text-xl text-cerebre-text mb-1">Logo & brand identity</h2>
        <p className="text-sm text-cerebre-muted">Your logo and colours make all exported content look professional.</p>
      </div>

      {/* Logo upload */}
      {!noLogo ? (
        <div>
          <p className={labelClass}>Business logo</p>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={[
              'relative flex flex-col items-center justify-center gap-3 p-8 rounded-card border-2 border-dashed cursor-pointer transition-all duration-200',
              dragOver ? 'border-cerebre-gold bg-cerebre-gold-dim' : 'border-cerebre-border hover:border-cerebre-gold/40 hover:bg-cerebre-surface',
            ].join(' ')}
          >
            <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.svg,.webp"
              className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

            {uploading ? (
              <Loader2 className="h-8 w-8 text-cerebre-gold animate-spin" />
            ) : state.logoUrl ? (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.logoUrl} alt="Logo" className="h-16 mx-auto mb-2 object-contain" />
                <p className="text-xs text-cerebre-teal">✅ Logo uploaded — click to change</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-cerebre-muted" />
                <div className="text-center">
                  <p className="text-sm font-medium text-cerebre-text">Drag & drop your logo here</p>
                  <p className="text-xs text-cerebre-muted mt-0.5">or click to browse · PNG, JPG, SVG · Max 5MB</p>
                </div>
              </>
            )}
          </div>

          {/* Brand colour detected from logo */}
          {state.logoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 text-xs text-cerebre-muted"
            >
              <div className="w-4 h-4 rounded-full border border-cerebre-border flex-shrink-0"
                style={{ backgroundColor: state.brandColour }} />
              <span>Detected brand colour:</span>
              <span className="font-mono text-cerebre-text">{state.brandColour}</span>
              <span>·</span>
              <span className="text-cerebre-gold cursor-pointer">Adjust</span>
            </motion.div>
          )}

          <button type="button" onClick={() => setNoLogo(true)}
            className="mt-2 text-xs text-cerebre-muted hover:text-cerebre-text transition-colors">
            I don't have a logo yet →
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-card border border-cerebre-border bg-cerebre-surface">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ backgroundColor: state.brandColour, color: '#06080E' }}
            >
              {(state.businessName || 'C').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-cerebre-text">{state.businessName || 'Your Business'}</p>
              <p className="text-xs text-cerebre-muted">Text-based logo preview</p>
            </div>
          </div>
          <p className="text-xs text-cerebre-muted">
            You can add your logo anytime from Brand Settings.
          </p>
          <button type="button" onClick={() => setNoLogo(false)}
            className="mt-2 text-xs text-cerebre-gold hover:text-cerebre-gold-light transition-colors">
            ← Upload logo instead
          </button>
        </div>
      )}

      {/* Brand colour manual input */}
      <div>
        <label className={labelClass} htmlFor="colour">Brand colour</label>
        <div className="flex items-center gap-3">
          <input type="color" value={state.brandColour}
            onChange={(e) => update('brandColour', e.target.value)}
            className="w-10 h-10 rounded-lg border border-cerebre-border cursor-pointer bg-transparent p-0.5" />
          <input type="text" value={state.brandColour}
            onChange={(e) => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) update('brandColour', e.target.value) }}
            className={`${inputClass} font-mono flex-1 uppercase`}
            placeholder="#E09818" maxLength={7} />
          <div className="w-10 h-10 rounded-lg border border-cerebre-border flex-shrink-0"
            style={{ backgroundColor: state.brandColour }} />
        </div>
      </div>

      <StepNav step={6} totalSteps={7} onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CHALLENGE STEP (Between 6 & 7)
// ─────────────────────────────────────────────────────────────

const ChallengeStep = ({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: ChallengeId[]
  onToggle: (id: ChallengeId) => void
  onNext: () => void
  onBack: () => void
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="font-display font-bold text-2xl text-cerebre-text mb-2">
        What's your #1 marketing challenge?
      </h2>
      <p className="text-sm text-cerebre-muted">
        Select up to 3. This personalises your dashboard recommendations.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {CHALLENGES.map((c) => {
        const isSelected = selected.includes(c.id)
        const atMax = selected.length >= 3 && !isSelected

        return (
          <motion.button
            key={c.id}
            type="button"
            whileHover={!atMax ? { y: -1 } : undefined}
            whileTap={!atMax ? { scale: 0.98 } : undefined}
            onClick={() => { if (!atMax) onToggle(c.id) }}
            className={[
              'text-left p-3.5 rounded-card border transition-all duration-200',
              isSelected
                ? 'border-cerebre-gold bg-cerebre-gold-dim shadow-gold-sm'
                : atMax
                  ? 'border-cerebre-border bg-cerebre-navy opacity-40 cursor-not-allowed'
                  : 'border-cerebre-border bg-cerebre-surface hover:border-cerebre-gold/35',
            ].join(' ')}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">{c.icon}</span>
              <p className={`text-sm leading-snug ${isSelected ? 'text-cerebre-gold font-medium' : 'text-cerebre-text'}`}>
                {c.text}
              </p>
              {isSelected && (
                <div className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-cerebre-gold flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-cerebre-ink" />
                </div>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>

    <StepNav step={7} totalSteps={7} onBack={onBack} onNext={onNext}
      nextLabel="Generate My First Result 🚀"
      nextDisabled={selected.length === 0} />
  </div>
)

// ─────────────────────────────────────────────────────────────
// STEP 7 — MAGIC MOMENT
// ─────────────────────────────────────────────────────────────

const Step7MagicMoment = ({
  state,
  businessName,
  onComplete,
}: {
  state: OnboardingState
  businessName: string
  onComplete: () => void
}) => {
  const primaryChallenge = state.challenges[0] as ChallengeId | undefined
  const toolConfig = primaryChallenge
    ? CHALLENGE_TO_TOOL[primaryChallenge]
    : CHALLENGE_TO_TOOL['awareness']

  const [phase, setPhase] = React.useState<'intro' | 'generating' | 'complete'>('intro')
  const [output, setOutput] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const runGeneration = async () => {
    setPhase('generating')
    setError(null)

     const CHALLENGE_TO_STRATEGY: Record<string, string> = {
    awareness:    'build_online_presence',
    leads:        'get_first_100_customers',
    sales:        'double_monthly_revenue',
    retention:    'increase_repeat_purchases',
    launch:       'launch_new_product',
    local:        'dominate_local_market',
    organic:      'reduce_ad_spend_grow_organic',
    whatsapp:     'build_whatsapp_email_list',
    new_market:   'enter_new_city_market',
    slow_period:  'recover_from_slow_period',
  }

  const PRICE_TO_BUDGET: Record<string, string> = {
    'under_100k':    '0_50k',
    '100k_500k':     '50_150k',
    '500k_1m':       '150_500k',
    '1m_5m':         '500k_1m',
    '5m_plus':       '1m_plus',
  }

    try {
      const response = await fetch(`/api/generate/${toolConfig.toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inputs: {
          // Required fields
          strategy_goal: CHALLENGE_TO_STRATEGY[primaryChallenge ?? 'awareness'] ?? 'build_online_presence',
          current_situation: state.description?.trim() || `${state.businessName} is a ${state.industry} business based in ${state.city}, Nigeria.`,
          monthly_budget: PRICE_TO_BUDGET[state.priceRange ?? ''] ?? '0_50k',
          biggest_challenge: state.challenges.length
            ? `Our biggest challenges include: ${state.challenges.join(', ')}. We need a clear strategy to overcome these and grow.`
            : 'Growing brand awareness and acquiring new customers consistently in a competitive market.',

          // Optional fields — pass what you have from onboarding
          team_size:               'solo_founder',        // default
          time_available_per_week: '5_10hrs',             // default
          preferred_channels:      state.instagram || state.tiktok
            ? (['instagram', 'tiktok', 'whatsapp'] as const).filter(Boolean)
            : ['whatsapp', 'instagram'],
        }, // Profile is auto-filled server-side
          skipCoinDeduct: true,
          isOnboarding: true,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Generation failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setOutput(full)
      }

      setPhase('complete')

      // Confetti
      const confetti = (await import('canvas-confetti')).default
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E09818', '#F5C040', '#0CC4A0', '#FFFFFF'],
      })
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.')
      setPhase('intro')
    }
  }

  return (
    <div className="space-y-6">
      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div>
            <p className="text-xs font-bold text-cerebre-gold uppercase tracking-widest mb-3">
              Final step
            </p>
            <h2 className="font-display font-bold text-2xl text-cerebre-text mb-2">
              Let's show you exactly what Cerebre Plus can do for{' '}
              <span className="text-cerebre-gold">{businessName || 'your business'}</span>.
            </h2>
          </div>

          {/* Recommended tool card */}
          <div className="p-5 rounded-card border border-cerebre-gold/30 bg-cerebre-gold-dim text-left">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cerebre-gold/20 border border-cerebre-gold/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-cerebre-gold" />
              </div>
              <div>
                <p className="text-xs text-cerebre-muted mb-0.5">Recommended for your challenge</p>
                <p className="font-bold text-cerebre-gold">{toolConfig.toolName}</p>
              </div>
            </div>
            <p className="text-sm text-cerebre-text leading-relaxed">{toolConfig.reasoning}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-cerebre-muted">
              This runs completely free — zero coins deducted.
            </p>
            <button
              type="button"
              onClick={runGeneration}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-button text-base font-bold text-cerebre-ink bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light hover:shadow-gold hover:-translate-y-px transition-all duration-200 active:translate-y-0"
            >
              🚀 Generate My Free First Result
            </button>
          </div>

          {error && (
            <p className="text-xs text-cerebre-coral">{error}</p>
          )}
        </motion.div>
      )}

      {phase === 'generating' && (
        <LoadingStages
          messages={toolConfig.loadingMsgs}
          estimatedSeconds={toolConfig.estimatedSecs}
          toolName={toolConfig.toolName}
        />
      )}

      {phase === 'complete' && output && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 250, delay: 0.1 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cerebre-teal-dim border border-cerebre-teal/30 mb-3"
            >
              <span className="text-2xl">🎉</span>
            </motion.div>
            <h3 className="font-display font-bold text-xl text-cerebre-text mb-1">
              Your first result is ready!
            </h3>
            <p className="text-sm text-cerebre-muted">
              This is what Cerebre Plus does for {businessName} — every single time you use a tool.
            </p>
          </div>

          <OutputRenderer
            content={output}
            isStreaming={false}
            toolName={toolConfig.toolName}
          />

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-2 h-11 px-8 rounded-button text-sm font-bold text-cerebre-ink bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light hover:shadow-gold hover:-translate-y-px transition-all duration-200"
            >
              Continue to Your Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN ONBOARDING PAGE
// ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const supabase = createBrowserClient()
  const router = useRouter()

  const [step, setStep] = React.useState(1)
  const [saving, setSaving] = React.useState(false)
  const [state, setState] = React.useState<OnboardingState>(INITIAL_STATE)

  // Load user name on mount
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        const first = (user.user_metadata.full_name as string).split(' ')[0]
        setState((s) => ({ ...s, firstName: first }))
      }
    })
  }, [supabase])

  const update = React.useCallback((key: keyof OnboardingState, value: any) => {
    setState((s) => ({ ...s, [key]: value }))
  }, [])

  const toggleChallenge = (id: ChallengeId) => {
    setState((s) => ({
      ...s,
      challenges: s.challenges.includes(id)
        ? s.challenges.filter((c) => c !== id)
        : [...s.challenges, id].slice(0, 3),
    }))
  }

  // Save current step data to DB
  const saveStep = async (stepNum: number) => {
    if (saving) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const dbPayload: Record<string, any> = {}

    if (stepNum === 2) {
      Object.assign(dbPayload, {
        business_name: state.businessName,
        industry: state.industry,
        city: state.city,
        country: state.cityResult?.country ?? 'Nigeria',
        years_in_business: state.yearsInBusiness ? parseInt(state.yearsInBusiness.split('_')[0]) : null,
        description: state.description,
        onboarding_step: 'step2_industry_audience',
      })
    } else if (stepNum === 3) {
      Object.assign(dbPayload, {
        target_customer: state.targetCustomer,
        unique_advantage: state.uniqueAdvantage,
        price_range: state.priceRange,
        onboarding_step: 'step3_social_contact',
      })
    } else if (stepNum === 4) {
      Object.assign(dbPayload, {
        brand_voice: state.brandVoice,
        language_preference: state.languagePreference,
        primary_cta: state.primaryCta,
        onboarding_step: 'step4_brand_voice',
      })
    } else if (stepNum === 5) {
      Object.assign(dbPayload, {
        whatsapp: state.whatsapp,
        phone: state.phone,
        email_contact: state.emailContact,
        address: state.address,
        instagram: state.instagram,
        facebook: state.facebook,
        linkedin: state.linkedin,
        tiktok: state.tiktok,
      })
    } else if (stepNum === 6) {
      Object.assign(dbPayload, {
        logo_url: state.logoUrl,
        brand_colour: state.brandColour,
      })
    } else if (stepNum === 7) {
      Object.assign(dbPayload, {
        marketing_challenges: state.challenges,
        onboarding_step: 'magic_moment_completed',
      })
    }

    if (Object.keys(dbPayload).length > 0) {
      await supabase.from('profiles').update({ ...dbPayload, updated_at: new Date().toISOString() }).eq('id', user.id)
    }

    setSaving(false)
  }

  const goNext = async () => {
    
    await saveStep(step)
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSkip = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        onboarding_complete: true,
        onboarding_step: 'complete',
      }).eq('id', user.id)
    }
    router.push('/dashboard')
    router.refresh()
  }
    const handleGetReward = async () => {
         await fetch('/api/coins/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'onboarding_complete' }),
      })

    }
  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        onboarding_complete: true,
        magic_moment_completed: true,
        onboarding_step: 'complete',
      }).eq('id', user.id)

    await handleGetReward ()
    }
    router.push('/dashboard?welcome=1')
    router.refresh()
  }

  // Total visual steps for the progress bar (7, excluding the challenge interlude)
  const TOTAL_VISUAL_STEPS = 7
  // Steps 1-6 = steps, between 6-7 = challenge, step 7 = magic moment
  const progressStep =
    step <= 6 ? step :
      step === 7 ? 6 :   // Challenge is still "between" 6 and 7
        7

  return (
    <div className="min-h-dvh bg-cerebre-ink">
      {/* Step 1 has no progress bar */}
      {step > 1 && (
        <StepProgressBar
          currentStep={progressStep}
          totalSteps={TOTAL_VISUAL_STEPS}
          firstName={state.firstName}
        />
      )}

      {/* Content area */}
      <div
        className="max-w-lg mx-auto px-4 pb-16"
        style={{ paddingTop: step > 1 ? '88px' : '2rem' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <Step1Welcome
                firstName={state.firstName}
                onNext={goNext}
                onSkip={handleSkip}
              />
            )}

            {step === 2 && (
              <Step2Business state={state} update={update} onNext={goNext} onBack={goBack} />
            )}

            {step === 3 && (
              <Step3Customers state={state} update={update} onNext={goNext} onBack={goBack} />
            )}

            {step === 4 && (
              <Step4BrandVoice state={state} update={update} onNext={goNext} onBack={goBack} />
            )}

            {step === 5 && (
              <Step5Contact state={state} update={update} onNext={goNext} onBack={goBack} />
            )}

            {step === 6 && (
              <Step6Brand state={state} update={update} onNext={goNext} onBack={goBack} />
            )}

            {step === 7 && (
              <ChallengeStep
                selected={state.challenges}
                onToggle={toggleChallenge}
                onNext={goNext}
                onBack={goBack}
              />
            )}

            {step === 8 && (
              <Step7MagicMoment
                state={state}
                businessName={state.businessName}
                onComplete={handleComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
