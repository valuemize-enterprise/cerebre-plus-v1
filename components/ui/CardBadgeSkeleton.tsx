'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Coins, TrendingUp } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/navigation'

// ══════════════════════════════════════════════════════════════
// CARD COMPONENT
// ══════════════════════════════════════════════════════════════

export type CardVariant = 'default' | 'featured' | 'glass'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:   CardVariant
  padding?:   CardPadding
  clickable?: boolean
  children:   React.ReactNode
  asChild?:   boolean
}

const cardVariantStyles: Record<CardVariant, string> = {
  default:  'bg-cerebre-surface border border-cerebre-border',
  featured: 'bg-cerebre-surface border-2 border-cerebre-gold shadow-gold-sm',
  glass:    'bg-cerebre-ink/85 backdrop-blur-xl border border-cerebre-border/60',
}

const cardPaddingStyles: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4 md:p-5',
  lg:   'p-5 md:p-6',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', clickable, children, className, onClick, ...props }, ref) => {
    const Tag = clickable ? motion.div : 'div'

    const clickableProps = clickable ? {
      whileHover: { y: -2, transition: { duration: 0.18 } },
      whileTap:   { y: 0,  scale: 0.99 },
      style:      { cursor: 'pointer' },
      onClick,
    } : { onClick }

    return (
      <Tag
        ref={ref as any}
        className={twMerge(
          'rounded-card transition-[border-color,box-shadow] duration-200',
          cardVariantStyles[variant],
          cardPaddingStyles[padding],
          clickable && 'hover:border-cerebre-gold/35 hover:shadow-card-hover',
          className,
        )}
        {...(clickable ? clickableProps : { onClick })}
        {...(props as any)}
      >
        {children}
      </Tag>
    )
  },
)
Card.displayName = 'Card'

// ── Card sub-components ───────────────────────────────────────

export const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('flex flex-col gap-1 pb-3 border-b border-cerebre-border/50', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={twMerge('font-display font-semibold text-cerebre-text text-lg leading-tight', className)} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={twMerge('text-sm text-cerebre-muted leading-relaxed', className)} {...props}>
    {children}
  </p>
)

export const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('pt-3', className)} {...props}>{children}</div>
)

export const CardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('flex items-center pt-3 mt-3 border-t border-cerebre-border/50', className)} {...props}>
    {children}
  </div>
)

// ══════════════════════════════════════════════════════════════
// BADGE COMPONENT
// ══════════════════════════════════════════════════════════════

export type BadgeVariant =
  | 'starter' | 'growth' | 'premium' | 'enterprise'
  | 'live' | 'coming-soon' | 'beta' | 'new'
  | 'gold' | 'teal' | 'coral' | 'muted' | 'lav' | 'green'

export type BadgeSize = 'xs' | 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?:    BadgeSize
  dot?:     boolean   // Show a coloured pulse dot before text
  children: React.ReactNode
}

const badgeVariantStyles: Record<BadgeVariant, string> = {
  starter:      'bg-cerebre-muted/15    text-cerebre-muted    border border-cerebre-muted/30',
  growth:       'bg-cerebre-gold-dim    text-cerebre-gold     border border-cerebre-gold/30',
  premium:      'bg-cerebre-teal-dim    text-cerebre-teal     border border-cerebre-teal/30',
  enterprise:   'bg-[rgba(139,112,240,0.12)] text-[#A890F8]  border border-[rgba(139,112,240,0.3)]',
  live:         'bg-cerebre-green/10    text-cerebre-green    border border-cerebre-green/30',
  'coming-soon':'bg-cerebre-muted/10    text-cerebre-muted    border border-cerebre-border',
  beta:         'bg-[rgba(139,112,240,0.12)] text-[#A890F8]  border border-[rgba(139,112,240,0.3)]',
  new:          'bg-cerebre-gold-dim    text-cerebre-gold     border border-cerebre-gold/30',
  gold:         'bg-cerebre-gold-dim    text-cerebre-gold     border border-cerebre-gold/30',
  teal:         'bg-cerebre-teal-dim    text-cerebre-teal     border border-cerebre-teal/30',
  coral:        'bg-[rgba(255,72,48,0.12)] text-[#FF7060]    border border-[rgba(255,72,48,0.25)]',
  muted:        'bg-cerebre-muted/10    text-cerebre-muted    border border-cerebre-border',
  lav:          'bg-[rgba(139,112,240,0.12)] text-[#A890F8]  border border-[rgba(139,112,240,0.3)]',
  green:        'bg-cerebre-green/10    text-cerebre-green    border border-cerebre-green/30',
}

const badgeDotStyles: Record<BadgeVariant, string> = {
  starter:      'bg-cerebre-muted',
  growth:       'bg-cerebre-gold',
  premium:      'bg-cerebre-teal',
  enterprise:   'bg-[#A890F8]',
  live:         'bg-cerebre-green',
  'coming-soon':'bg-cerebre-muted',
  beta:         'bg-[#A890F8]',
  new:          'bg-cerebre-gold',
  gold:         'bg-cerebre-gold',
  teal:         'bg-cerebre-teal',
  coral:        'bg-cerebre-coral',
  muted:        'bg-cerebre-muted',
  lav:          'bg-[#A890F8]',
  green:        'bg-cerebre-green',
}

const badgeSizeStyles: Record<BadgeSize, string> = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-1 rounded',
  sm: 'text-xs     px-2   py-0.5 gap-1 rounded-badge',
  md: 'text-xs     px-2.5 py-1   gap-1.5 rounded-badge',
}

export const Badge = ({ variant = 'muted', size = 'sm', dot, children, className, ...props }: BadgeProps) => (
  <span
    className={twMerge(
      'inline-flex items-center font-medium font-body leading-none whitespace-nowrap',
      badgeVariantStyles[variant],
      badgeSizeStyles[size],
      className,
    )}
    {...props}
  >
    {dot && (
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        <span className={twMerge(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          badgeDotStyles[variant],
        )} />
        <span className={twMerge('relative inline-flex rounded-full h-1.5 w-1.5', badgeDotStyles[variant])} />
      </span>
    )}
    {children}
  </span>
)

// Plan tier → badge variant map
export const planBadgeVariant: Record<string, BadgeVariant> = {
  free:       'muted',
  starter:    'starter',
  growth:     'growth',
  premium:    'premium',
  enterprise: 'enterprise',
}

// ══════════════════════════════════════════════════════════════
// SKELETON LOADER
// ══════════════════════════════════════════════════════════════

export type SkeletonVariant = 'line' | 'block' | 'circle' | 'avatar'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?:   string | number
  height?:  string | number
  lines?:   number   // For 'line' variant — renders N lines
}

const skeletonBase = [
  'bg-gradient-to-r from-cerebre-surface via-cerebre-border/30 to-cerebre-surface',
  'bg-[length:200%_100%]',
  'animate-shimmer',
].join(' ')

export const Skeleton = ({
  variant = 'line',
  width,
  height,
  lines = 1,
  className,
  style,
  ...props
}: SkeletonProps) => {
  if (variant === 'line' && lines > 1) {
    return (
      <div className="flex flex-col gap-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={twMerge(skeletonBase, 'h-4 rounded-md', className)}
            style={{ width: i === lines - 1 ? '70%' : '100%', ...style }}
          />
        ))}
      </div>
    )
  }

  const dims = {
    line:   { h: height ?? 16, r: 'rounded-md' },
    block:  { h: height ?? 80, r: 'rounded-card' },
    circle: { h: height ?? 40, r: 'rounded-full' },
    avatar: { h: height ?? 40, r: 'rounded-full' },
  }[variant]

  return (
    <div
      className={twMerge(skeletonBase, dims.r, className)}
      style={{
        width:  width  ?? (variant === 'circle' || variant === 'avatar' ? dims.h : '100%'),
        height: dims.h,
        ...style,
      }}
      {...props}
    />
  )
}

// Convenience: generate N skeleton items
export const generateSkeletons = (n: number, props?: SkeletonProps) =>
  Array.from({ length: n }).map((_, i) => <Skeleton key={i} {...props} />)

// ── Card skeleton preset ──────────────────────────────────────
export const CardSkeleton = () => (
  <Card padding="md">
    <div className="flex items-start gap-3 mb-3">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
    <Skeleton variant="line" lines={3} />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-8 flex-1 rounded-button" />
      <Skeleton className="h-8 w-20 rounded-button" />
    </div>
  </Card>
)

// ══════════════════════════════════════════════════════════════
// PROGRESS RING
// ══════════════════════════════════════════════════════════════

export interface ProgressRingProps {
  value:       number    // 0-100
  size?:       number    // SVG size in px, default 80
  strokeWidth?: number
  label?:      React.ReactNode  // Centre label (e.g. "72%")
  showLabel?:  boolean
  className?:  string
}

export const ProgressRing = ({
  value,
  size        = 80,
  strokeWidth = 6,
  label,
  showLabel   = true,
  className,
}: ProgressRingProps) => {
  const clamped = Math.max(0, Math.min(100, value))
  const radius  = (size - strokeWidth) / 2
  const circ    = 2 * Math.PI * radius
  const offset  = circ * (1 - clamped / 100)

  const colour =
    clamped >= 80 ? '#10B880' :  // green
    clamped >= 50 ? '#E09818' :  // gold
    '#FF4830'                    // coral

  return (
    <div
      className={twMerge('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clamped}% complete`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(26,48,88,0.8)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
          style={{ color: colour }}
        >
          {label ?? `${clamped}%`}
        </span>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COIN DISPLAY
// ══════════════════════════════════════════════════════════════

export type CoinDisplayVariant = 'large' | 'medium' | 'small' | 'minimal'

export interface CoinDisplayProps {
  balance:          number
  renewsInDays?:    number
  planTier?:        string
  variant?:         CoinDisplayVariant
  clickable?:       boolean
  className?:       string
  animate?:         boolean   // Animate balance change
}

const LOW_BALANCE_THRESHOLD = 15

export const CoinDisplay = ({
  balance,
  renewsInDays,
  planTier,
  variant   = 'medium',
  clickable = true,
  className,
  animate   = true,
}: CoinDisplayProps) => {
  const router          = useRouter()
  const isLow           = balance <= LOW_BALANCE_THRESHOLD
  const [prev, setPrev] = React.useState(balance)
  const [flash, setFlash] = React.useState<'up' | 'down' | null>(null)

  React.useEffect(() => {
    if (!animate || balance === prev) return
    setFlash(balance > prev ? 'up' : 'down')
    setPrev(balance)
    const t = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(t)
  }, [balance, animate, prev])

  const balanceColour =
    flash === 'up'   ? 'text-cerebre-green' :
    flash === 'down' ? 'text-cerebre-coral' :
    isLow            ? 'text-amber-400'     :
    'text-cerebre-gold'

  const handleClick = () => {
    if (clickable) router.push('/billing')
  }

  const tooltipText = [
    `${balance} coins available`,
    renewsInDays !== undefined ? `Renews in ${renewsInDays} day${renewsInDays !== 1 ? 's' : ''}` : null,
    planTier ? `${planTier.charAt(0).toUpperCase() + planTier.slice(1)} plan` : null,
  ].filter(Boolean).join(' · ')

  if (variant === 'minimal') {
    return (
      <span
        className={twMerge(
          'inline-flex items-center gap-1 text-sm font-semibold',
          balanceColour,
          clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
          className,
        )}
        onClick={handleClick}
        title={tooltipText}
      >
        🪙 {balance.toLocaleString()}
      </span>
    )
  }

  if (variant === 'small') {
    return (
      <motion.button
        onClick={handleClick}
        className={twMerge(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
          'bg-cerebre-gold-dim border border-cerebre-gold/25',
          'transition-all duration-200 hover:border-cerebre-gold/50',
          isLow && 'border-amber-400/40 bg-amber-400/10 animate-pulse-gold',
          className,
        )}
        title={tooltipText}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        aria-label={tooltipText}
      >
        <span className="text-sm" aria-hidden>🪙</span>
        <span className={twMerge('text-xs font-semibold tabular-nums', balanceColour)}>
          {balance.toLocaleString()}
        </span>
      </motion.button>
    )
  }

  if (variant === 'medium') {
    return (
      <motion.button
        onClick={handleClick}
        className={twMerge(
          'flex items-center gap-2 px-3 py-2 rounded-card',
          'bg-cerebre-surface border border-cerebre-border',
          'transition-all duration-200 hover:border-cerebre-gold/35',
          isLow && 'border-amber-400/40',
          className,
        )}
        title={tooltipText}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        aria-label={tooltipText}
      >
        <span className="text-xl leading-none" aria-hidden>🪙</span>
        <div className="text-left">
          <p className={twMerge('text-sm font-bold tabular-nums leading-tight', balanceColour)}>
            {balance.toLocaleString()}
          </p>
          <p className="text-[10px] text-cerebre-muted leading-tight">
            {isLow ? '⚠ Low coins' : 'coins available'}
          </p>
        </div>
        {clickable && <TrendingUp className="h-3.5 w-3.5 text-cerebre-muted ml-1" />}
      </motion.button>
    )
  }

  // variant === 'large'
  return (
    <motion.div
      className={twMerge(
        'p-5 rounded-card',
        'bg-gradient-to-br from-cerebre-surface to-cerebre-navy',
        'border',
        isLow ? 'border-amber-400/40' : 'border-cerebre-border',
        clickable && 'cursor-pointer',
        className,
      )}
      onClick={handleClick}
      whileHover={clickable ? { scale: 1.01, transition: { duration: 0.15 } } : undefined}
      title={tooltipText}
      role={clickable ? 'button' : undefined}
      aria-label={tooltipText}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-cerebre-muted font-medium">Cerebre Coins</p>
        <Coins className="h-5 w-5 text-cerebre-gold opacity-70" />
      </div>

      <motion.p
        key={balance}
        initial={animate ? { y: -8, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={twMerge(
          'text-4xl font-bold font-display tabular-nums leading-none mb-1',
          balanceColour,
        )}
      >
        {balance.toLocaleString()}
      </motion.p>

      {renewsInDays !== undefined && (
        <p className="text-xs text-cerebre-muted">
          Renews in <span className="text-cerebre-text">{renewsInDays}d</span>
        </p>
      )}

      {isLow && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-2.5 py-1.5 rounded-md bg-amber-400/10 border border-amber-400/25"
        >
          <p className="text-xs text-amber-400 font-medium">
            ⚠ Running low — top up to keep creating
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
