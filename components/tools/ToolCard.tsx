'use client'

import * as React from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Badge } from '@/components/ui/CardBadgeSkeleton'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────
// TOOL CARD
// ─────────────────────────────────────────────────────────────

export interface ToolCardProps {
  id:           string
  name:         string
  tagline:      string
  description:  string
  coinCost:     number
  icon:         string
  accentColour: string
  category:     string
  isNew?:       boolean
  isPremium?:   boolean
  isFeatured?:  boolean
  canAfford?:   boolean    // false = dim the coin cost in coral
  onClick:      () => void
}

export const ToolCard = ({
  id,
  name,
  tagline,
  description,
  coinCost,
  icon,
  accentColour,
  category,
  isNew,
  isPremium,
  isFeatured,
  canAfford = true,
  onClick,
}: ToolCardProps) => {
  const [hovered, setHovered] = React.useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={twMerge(
        'relative rounded-card border cursor-pointer overflow-hidden',
        'bg-cerebre-surface',
        'transition-[border-color,box-shadow] duration-200',
        isFeatured
          ? 'border-cerebre-gold/40 shadow-gold-sm'
          : 'border-cerebre-border hover:border-cerebre-gold/35 hover:shadow-card-hover',
      )}
      style={{
        '--accent': accentColour,
      } as React.CSSProperties}
      role="button"
      tabIndex={0}
      aria-label={`Run ${name} — ${coinCost} coins`}
      onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? onClick() : undefined}
    >
      {/* Accent gradient overlay (shows on hover) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: `radial-gradient(ellipse at top right, ${accentColour}0D 0%, transparent 70%)`,
        }}
      />

      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accentColour}, transparent 60%)` }}
      />

      <div className="relative p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            {/* Icon */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl text-lg flex-shrink-0"
              style={{ background: `${accentColour}18`, border: `1px solid ${accentColour}30` }}
            >
              {icon}
            </div>

            <div>
              {/* Badges */}
              <div className="flex items-center gap-1 mb-0.5">
                <Badge variant="live" size="xs" dot>Live</Badge>
                {isNew     && <Badge variant="new"   size="xs">New</Badge>}
                {isPremium && <Badge variant="growth" size="xs">Growth+</Badge>}
              </div>

              {/* Name */}
              <h3 className="font-body font-bold text-sm text-cerebre-text leading-tight">
                {name}
              </h3>
            </div>
          </div>

          {/* Coin cost */}
          <div
            className={twMerge(
              'flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 text-xs font-semibold',
              canAfford
                ? 'bg-cerebre-gold-dim border border-cerebre-gold/25 text-cerebre-gold'
                : 'bg-red-500/10 border border-red-500/25 text-red-400',
            )}
          >
            🪙 {coinCost}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-cerebre-muted leading-relaxed mb-3 line-clamp-2">
          {tagline}
        </p>

        {/* Run button */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            className="border-dashed"
          >
            Run tool
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// PLATFORM SELECTOR
// ─────────────────────────────────────────────────────────────

export interface Platform {
  id:           string
  name:         string
  icon:         string
  colour:       string      // Hex accent
  borderColour: string
  bgColour:     string
  contentTypes: string[]
  bestFor:      string
  optimalFreq:  string      // "5x/week"
}

const PLATFORMS: Platform[] = [
  {
    id: 'instagram', name: 'Instagram', icon: '📸',
    colour: '#E040FB', borderColour: 'rgba(224,64,251,0.35)', bgColour: 'rgba(224,64,251,0.06)',
    contentTypes: ['Reels', 'Carousels', 'Stories', 'Static posts'],
    bestFor: 'Visual products, lifestyle brands',
    optimalFreq: '5–7x/week',
  },
  {
    id: 'facebook', name: 'Facebook', icon: '👥',
    colour: '#1877F2', borderColour: 'rgba(24,119,242,0.35)', bgColour: 'rgba(24,119,242,0.06)',
    contentTypes: ['Videos', 'Long posts', 'Events', 'Groups'],
    bestFor: 'Community building, 30+ audience',
    optimalFreq: '3–5x/week',
  },
  {
    id: 'tiktok', name: 'TikTok', icon: '🎵',
    colour: '#00F2EA', borderColour: 'rgba(0,242,234,0.35)', bgColour: 'rgba(0,242,234,0.06)',
    contentTypes: ['Short videos', 'Trends', 'Duets'],
    bestFor: 'Youth market, viral reach, Gen Z',
    optimalFreq: '7–14x/week',
  },
  {
    id: 'linkedin', name: 'LinkedIn', icon: '💼',
    colour: '#0A66C2', borderColour: 'rgba(10,102,194,0.35)', bgColour: 'rgba(10,102,194,0.06)',
    contentTypes: ['Articles', 'Thought leadership', 'Company updates'],
    bestFor: 'B2B, professional services, corporate',
    optimalFreq: '3x/week',
  },
  {
    id: 'twitter', name: 'X (Twitter)', icon: '🐦',
    colour: '#9CA3AF', borderColour: 'rgba(156,163,175,0.35)', bgColour: 'rgba(156,163,175,0.06)',
    contentTypes: ['Threads', 'Hot takes', 'Announcements'],
    bestFor: 'Real-time engagement, tech/media',
    optimalFreq: '5–10x/week',
  },
  {
    id: 'whatsapp', name: 'WhatsApp', icon: '💬',
    colour: '#25D366', borderColour: 'rgba(37,211,102,0.35)', bgColour: 'rgba(37,211,102,0.06)',
    contentTypes: ['Broadcasts', 'Status', 'Stories'],
    bestFor: 'Nigeria\'s #1 sales channel, direct deals',
    optimalFreq: '2–3x/week',
  },
]

export interface PlatformSelectorProps {
  selected:    string[]
  onChange:    (platforms: string[]) => void
  multiSelect?: boolean
  className?:  string
}

export const PlatformSelector = ({
  selected,
  onChange,
  multiSelect = true,
  className,
}: PlatformSelectorProps) => {
  const toggle = (id: string) => {
    if (!multiSelect) {
      onChange([id])
      return
    }
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div
      className={twMerge('grid grid-cols-2 gap-2.5 sm:grid-cols-3', className)}
      role="group"
      aria-label="Select platforms"
    >
      {PLATFORMS.map((platform) => {
        const isSelected = selected.includes(platform.id)

        return (
          <motion.button
            key={platform.id}
            type="button"
            onClick={() => toggle(platform.id)}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
            className={twMerge(
              'relative text-left p-3 rounded-card border transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:outline-none',
              isSelected
                ? 'border-opacity-100 shadow-card-hover'
                : 'border-cerebre-border bg-cerebre-surface hover:border-opacity-60',
            )}
            style={{
              borderColor: isSelected ? platform.borderColour : undefined,
              backgroundColor: isSelected ? platform.bgColour : undefined,
            }}
            aria-pressed={isSelected}
            aria-label={`${platform.name}${isSelected ? ' (selected)' : ''}`}
          >
            {/* Selected checkmark */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: platform.colour,
                    color: '#06080E',
                  }}
                >
                  ✓
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon + name */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-lg leading-none">{platform.icon}</span>
              <span
                className="text-xs font-bold leading-tight"
                style={{ color: isSelected ? platform.colour : '#D8E8F8' }}
              >
                {platform.name}
              </span>
            </div>

            {/* Content types */}
            <p className="text-[10px] text-cerebre-muted leading-relaxed line-clamp-2">
              {platform.contentTypes.slice(0, 2).join(', ')}
            </p>

            {/* Frequency */}
            <p
              className="mt-1.5 text-[10px] font-semibold"
              style={{ color: platform.colour }}
            >
              {platform.optimalFreq}
            </p>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COIN SPEND ANIMATION
// ─────────────────────────────────────────────────────────────

export interface CoinSpendProps {
  amount:      number
  isPlaying:   boolean
  onComplete?: () => void
  className?:  string
}

export const CoinSpend = ({ amount, isPlaying, onComplete, className }: CoinSpendProps) => {
  const coins = React.useMemo(
    () => Array.from({ length: Math.min(amount, 5) }, (_, i) => i),
    [amount],
  )

  return (
    <div className={twMerge('relative inline-flex items-center', className)} aria-hidden="true">
      <AnimatePresence onExitComplete={onComplete}>
        {isPlaying && coins.map((i) => (
          <motion.span
            key={i}
            className="absolute text-base pointer-events-none"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: [-4 + i * 6, -20 + i * 8, -8 + i * 4],
              y: [0, -24 - i * 4, -48],
              opacity: [1, 1, 0],
              scale: [1, 1.2, 0.7],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.75,
              delay: i * 0.06,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            🪙
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Static coin icon */}
      <span className="text-base">🪙</span>

      {/* Amount */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isPlaying ? 'spending' : 'idle'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={twMerge(
            'ml-1 text-xs font-bold tabular-nums',
            isPlaying ? 'text-cerebre-coral' : 'text-cerebre-gold',
          )}
        >
          {isPlaying ? `-${amount}` : amount}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────

const EMPTY_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  history: (
    <svg viewBox="0 0 120 100" className="w-24 h-20 mx-auto" aria-hidden="true">
      <rect x="20" y="20" width="80" height="60" rx="8" fill="rgba(26,48,88,0.8)" stroke="rgba(26,48,88,1)" strokeWidth="1.5"/>
      <rect x="30" y="35" width="60" height="4" rx="2" fill="rgba(72,104,128,0.5)"/>
      <rect x="30" y="47" width="45" height="4" rx="2" fill="rgba(72,104,128,0.4)"/>
      <rect x="30" y="59" width="55" height="4" rx="2" fill="rgba(72,104,128,0.3)"/>
      <circle cx="95" cy="25" r="10" fill="rgba(224,152,24,0.15)" stroke="rgba(224,152,24,0.4)" strokeWidth="1.5"/>
      <text x="95" y="29" textAnchor="middle" fontSize="10" fill="rgba(224,152,24,0.8)">?</text>
    </svg>
  ),
  library: (
    <svg viewBox="0 0 120 100" className="w-24 h-20 mx-auto" aria-hidden="true">
      <rect x="15" y="25" width="90" height="55" rx="8" fill="rgba(26,48,88,0.8)" stroke="rgba(26,48,88,1)" strokeWidth="1.5"/>
      <path d="M45 55 L60 40 L75 55" stroke="rgba(224,152,24,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="60" cy="57" r="3" fill="rgba(224,152,24,0.5)"/>
    </svg>
  ),
  tools: (
    <svg viewBox="0 0 120 100" className="w-24 h-20 mx-auto" aria-hidden="true">
      <circle cx="60" cy="50" r="28" fill="rgba(26,48,88,0.8)" stroke="rgba(26,48,88,1)" strokeWidth="1.5"/>
      <path d="M50 50 L65 40 L65 60 Z" fill="rgba(12,196,160,0.6)"/>
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 120 100" className="w-24 h-20 mx-auto" aria-hidden="true">
      <circle cx="60" cy="45" r="28" fill="rgba(18,32,56,1)" stroke="rgba(26,48,88,1)" strokeWidth="1.5"/>
      <path d="M55 35 Q60 28 65 35 Q70 42 60 48 L60 53" stroke="rgba(224,152,24,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="60" cy="57" r="2.5" fill="rgba(224,152,24,0.7)"/>
    </svg>
  ),
}

export interface EmptyStateProps {
  type?:       'history' | 'library' | 'tools' | 'generic'
  title:       string
  description: string
  ctaLabel?:   string
  ctaOnClick?: () => void
  className?:  string
}

export const EmptyState = ({
  type = 'generic',
  title,
  description,
  ctaLabel,
  ctaOnClick,
  className,
}: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={twMerge(
      'flex flex-col items-center justify-center text-center',
      'py-12 px-6 rounded-card border border-dashed border-cerebre-border/50',
      'bg-cerebre-surface/50',
      className,
    )}
    role="status"
    aria-label={title}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-4 opacity-80"
    >
      {EMPTY_ILLUSTRATIONS[type] ?? EMPTY_ILLUSTRATIONS.generic}
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
    >
      <h3 className="font-display font-semibold text-lg text-cerebre-text mb-2">
        {title}
      </h3>
      <p className="text-sm text-cerebre-muted leading-relaxed max-w-[280px] mx-auto mb-5">
        {description}
      </p>

      {ctaLabel && ctaOnClick && (
        <Button
          variant="primary"
          size="md"
          leftIcon={<Zap className="h-4 w-4" />}
          onClick={ctaOnClick}
        >
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  </motion.div>
)
