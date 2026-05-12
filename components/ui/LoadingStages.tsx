'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface LoadingStagesProps {
  messages:          string[]      // Stage messages for this tool
  estimatedSeconds:  number        // For progress bar
  isComplete?:       boolean       // When generation finishes
  toolName?:         string
  className?:        string
}

// ─────────────────────────────────────────────────────────────
// ROTATING "DID YOU KNOW" FACTS
// ─────────────────────────────────────────────────────────────

const MARKETING_FACTS = [
  'Nigerian businesses that send WhatsApp broadcasts at least once a week see 3x more repeat orders than those that don\'t.',
  '82% of Nigerian online purchases begin with a WhatsApp enquiry, not a website visit.',
  'The last 7 days of the month — after salary day — generate up to 60% of monthly revenue for many Lagos retailers.',
  'A specific trust signal ("4,200 clients served") converts 4x better than a generic one ("thousands of satisfied customers").',
  'Businesses that respond to WhatsApp enquiries within 10 minutes close 78% more deals than those who wait hours.',
  'Nigerian Instagram users scroll 3x more in the morning (6am–9am) and evening (7pm–10pm) than midday.',
  'A fear-based subject line ("Your competitors are getting your customers") gets 42% higher open rates in Nigeria.',
  'Referral marketing costs 7x less than paid advertising for Nigerian service businesses.',
  'Adding your exact WhatsApp number (not a contact form) to your bio increases enquiries by an average of 5x.',
  'The Awoof Stack (normal price vs. your price) can increase perceived value by up to 300% without changing the actual price.',
  'Google Maps listings with more than 10 reviews get 4x more direction requests in Nigerian cities.',
  'Content posted on Instagram between 8pm–10pm on weekdays gets 40% more engagement from Nigerian audiences.',
  'Nigerian B2B deals close 65% faster when the proposal mentions a case study from a known Nigerian company.',
  'Businesses using the "I" voice in WhatsApp messages (not "we") see 35% higher reply rates from leads.',
  'End-of-year (November–December) and Sallah/Easter periods generate 2.5x the normal enquiry volume for most consumer businesses.',
]

// ─────────────────────────────────────────────────────────────
// ANIMATED ORB (visual centrepiece during generation)
// ─────────────────────────────────────────────────────────────

const GenerationOrb = ({ isComplete }: { isComplete: boolean }) => (
  <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
    {/* Outer pulse rings */}
    {!isComplete && (
      <>
        <motion.div
          className="absolute inset-0 rounded-full border border-cerebre-gold/20"
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-cerebre-gold/15"
          animate={{ scale: [1, 2.0], opacity: [0.4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
        />
      </>
    )}

    {/* Core orb */}
    <motion.div
      className={twMerge(
        'relative z-10 flex items-center justify-center w-12 h-12 rounded-full',
        isComplete
          ? 'bg-cerebre-teal/15 border border-cerebre-teal/40'
          : 'bg-cerebre-gold-dim border border-cerebre-gold/30',
      )}
      animate={!isComplete ? {
        boxShadow: [
          '0 0 0px rgba(224,152,24,0)',
          '0 0 20px rgba(224,152,24,0.3)',
          '0 0 0px rgba(224,152,24,0)',
        ],
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {isComplete ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          <CheckCircle2 className="h-5 w-5 text-cerebre-teal" />
        </motion.div>
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-5 w-5 text-cerebre-gold" />
        </motion.div>
      )}
    </motion.div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// STAGE LIST
// ─────────────────────────────────────────────────────────────

const StageList = ({
  messages,
  activeIndex,
  isComplete,
}: {
  messages:    string[]
  activeIndex: number
  isComplete:  boolean
}) => (
  <div className="space-y-2" role="list" aria-label="Generation progress">
    {messages.map((msg, i) => {
      const isDone    = isComplete || i < activeIndex
      const isActive  = !isComplete && i === activeIndex
      const isPending = !isComplete && i > activeIndex

      return (
        <motion.div
          key={msg}
          role="listitem"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="flex items-start gap-2.5"
        >
          {/* State indicator */}
          <div className="flex-shrink-0 mt-0.5">
            {isDone ? (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-cerebre-teal" />
              </motion.div>
            ) : isActive ? (
              <div className="flex gap-0.5 items-center h-3.5">
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-1 h-1 rounded-full bg-cerebre-gold"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: dot * 0.15,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-cerebre-border/60 mt-0.5" />
            )}
          </div>

          {/* Message */}
          <span
            className={twMerge(
              'text-sm leading-snug transition-colors duration-300',
              isDone     ? 'text-cerebre-muted line-through decoration-cerebre-border' :
              isActive   ? 'text-cerebre-text font-medium'  :
              'text-cerebre-muted/50',
            )}
          >
            {msg}
          </span>
        </motion.div>
      )
    })}
  </div>
)

// ─────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────

const ProgressBar = ({
  progress,
  isComplete,
}: {
  progress:   number   // 0-100
  isComplete: boolean
}) => (
  <div className="mt-4">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs text-cerebre-muted">
        {isComplete ? 'Complete!' : 'Generating…'}
      </span>
      <span className="text-xs font-semibold tabular-nums text-cerebre-gold">
        {Math.round(progress)}%
      </span>
    </div>
    <div className="h-1.5 bg-cerebre-border/60 rounded-full overflow-hidden">
      <motion.div
        className={twMerge(
          'h-full rounded-full',
          isComplete
            ? 'bg-cerebre-teal'
            : 'bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light',
        )}
        initial={{ width: '0%' }}
        animate={{ width: `${isComplete ? 100 : progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// DID YOU KNOW ROTATOR
// ─────────────────────────────────────────────────────────────

const DidYouKnow = () => {
  const [factIndex, setFactIndex] = React.useState(() =>
    Math.floor(Math.random() * MARKETING_FACTS.length),
  )
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setFactIndex((i) => (i + 1) % MARKETING_FACTS.length)
        setVisible(true)
      }, 400)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-4 p-3 rounded-lg bg-cerebre-navy border border-cerebre-border/50">
      <p className="text-[10px] font-semibold text-cerebre-gold uppercase tracking-widest mb-1.5">
        💡 While you wait
      </p>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="text-xs text-cerebre-muted leading-relaxed"
          >
            {MARKETING_FACTS[factIndex]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export const LoadingStages = ({
  messages,
  estimatedSeconds,
  isComplete = false,
  toolName,
  className,
}: LoadingStagesProps) => {
  const [activeIndex,   setActiveIndex]   = React.useState(0)
  const [elapsed,       setElapsed]       = React.useState(0)
  const [startTime]                       = React.useState(() => Date.now())

  // Advance stage every (estimatedSeconds / messages.length) seconds
  React.useEffect(() => {
    if (isComplete) return
    const intervalMs = (estimatedSeconds * 1000) / Math.max(messages.length, 1)

    const stageTimer = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, messages.length - 1))
    }, intervalMs)

    const elapsedTimer = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 200)

    return () => {
      clearInterval(stageTimer)
      clearInterval(elapsedTimer)
    }
  }, [isComplete, estimatedSeconds, messages.length, startTime])

  const naturalProgress = Math.min(
    (elapsed / (estimatedSeconds * 1000)) * 90,  // Cap at 90% until complete
    90,
  )
  const progress = isComplete ? 100 : naturalProgress

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className={twMerge(
        'rounded-card border border-cerebre-border bg-cerebre-surface p-5',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={isComplete ? 'Generation complete' : `Generating${toolName ? ` ${toolName}` : ''}…`}
    >
      {/* Orb */}
      <GenerationOrb isComplete={isComplete} />

      {/* Heading */}
      <div className="text-center mt-3 mb-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={isComplete ? 'done' : 'generating'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={twMerge(
              'font-display font-semibold text-base',
              isComplete ? 'text-cerebre-teal' : 'text-cerebre-text',
            )}
          >
            {isComplete
              ? '✅ Your content is ready'
              : toolName
                ? `${toolName} is working…`
                : 'Generating your content…'}
          </motion.p>
        </AnimatePresence>
        {!isComplete && (
          <p className="text-xs text-cerebre-muted mt-0.5">
            This usually takes {estimatedSeconds}–{Math.round(estimatedSeconds * 1.3)} seconds
          </p>
        )}
      </div>

      {/* Stage list */}
      <StageList
        messages={messages}
        activeIndex={isComplete ? messages.length : activeIndex}
        isComplete={isComplete}
      />

      {/* Progress bar */}
      <ProgressBar progress={progress} isComplete={isComplete} />

      {/* Did you know */}
      {!isComplete && <DidYouKnow />}
    </motion.div>
  )
}
