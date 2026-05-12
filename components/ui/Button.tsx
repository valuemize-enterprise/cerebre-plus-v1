'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal' | 'whatsapp'
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:      ButtonVariant
  size?:         ButtonSize
  loading?:      boolean
  leftIcon?:     React.ReactNode
  rightIcon?:    React.ReactNode
  iconOnly?:     boolean
  fullWidth?:    boolean
  children?:     React.ReactNode
}

// ─────────────────────────────────────────────────────────────
// STYLE MAPS
// ─────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-cerebre-gold to-cerebre-gold-light',
    'text-cerebre-ink font-semibold',
    'hover:shadow-gold hover:-translate-y-px',
    'active:translate-y-0 active:shadow-none',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
    'focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cerebre-ink',
  ].join(' '),

  secondary: [
    'bg-transparent',
    'border border-cerebre-gold text-cerebre-gold',
    'hover:bg-cerebre-gold-dim hover:-translate-y-px',
    'active:translate-y-0 active:bg-cerebre-gold/20',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
    'focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cerebre-ink',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'border border-cerebre-border text-cerebre-muted',
    'hover:border-cerebre-gold/40 hover:text-cerebre-text hover:bg-white/[0.04]',
    'active:scale-95',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'focus-visible:ring-2 focus-visible:ring-cerebre-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cerebre-ink',
  ].join(' '),

  danger: [
    'bg-cerebre-coral text-white font-semibold',
    'hover:bg-[#E04020] hover:-translate-y-px hover:shadow-[0_0_20px_rgba(255,72,48,0.3)]',
    'active:translate-y-0 active:shadow-none',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
    'focus-visible:ring-2 focus-visible:ring-cerebre-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cerebre-ink',
  ].join(' '),

  teal: [
    'bg-cerebre-teal text-cerebre-ink font-semibold',
    'hover:bg-cerebre-teal-light hover:-translate-y-px hover:shadow-teal',
    'active:translate-y-0 active:shadow-none',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
    'focus-visible:ring-2 focus-visible:ring-cerebre-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cerebre-ink',
  ].join(' '),

  whatsapp: [
    'bg-[#25D366] text-white font-semibold',
    'hover:bg-[#20BA5A] hover:-translate-y-px hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]',
    'active:translate-y-0',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
    'focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-cerebre-ink',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-button',
  lg: 'h-11 px-5 text-base gap-2 rounded-button',
  xl: 'h-12 px-6 text-base gap-2.5 rounded-button',
}

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 w-7 p-0',
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-11 w-11 p-0',
  xl: 'h-12 w-12 p-0',
}

const spinnerSizeStyles: Record<ButtonSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4.5 w-4.5',
  xl: 'h-5 w-5',
}

// ─────────────────────────────────────────────────────────────
// LOADING DOTS (3-dot bounce, inherits button colour)
// ─────────────────────────────────────────────────────────────

const LoadingDots = ({ variant, size }: { variant: ButtonVariant; size: ButtonSize }) => {
  const dotSize = size === 'xs' || size === 'sm' ? 'h-1 w-1' : 'h-1.5 w-1.5'
  const dotColour =
    variant === 'primary' ? 'bg-cerebre-ink' :
    variant === 'teal'    ? 'bg-cerebre-ink' :
    variant === 'whatsapp'? 'bg-white'        :
    variant === 'danger'  ? 'bg-white'        :
    'bg-cerebre-gold'

  return (
    <span className="flex items-center gap-1" aria-label="Loading…" role="status">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={twMerge('rounded-full', dotSize, dotColour)}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration:   0.6,
            repeat:     Infinity,
            delay:      i * 0.15,
            ease:       'easeInOut',
          }}
        />
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// BUTTON COMPONENT
// ─────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      leftIcon,
      rightIcon,
      iconOnly  = false,
      fullWidth = false,
      children,
      disabled,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    const baseClasses = [
      // Layout
      'relative inline-flex items-center justify-center',
      'whitespace-nowrap select-none',
      // Typography
      'font-body font-medium tracking-wide leading-none',
      // Transition
      'transition-all duration-200 ease-cerebre',
      // Full width
      fullWidth ? 'w-full' : '',
      // Size
      iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
      // Variant
      variantStyles[variant],
      // Custom
      className ?? '',
    ].join(' ')

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        className={baseClasses}
        onClick={isDisabled ? undefined : onClick}
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <LoadingDots variant={variant} size={size} />
            </motion.span>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-[inherit]"
            >
              {leftIcon && (
                <span className="flex-shrink-0 flex items-center" aria-hidden="true">
                  {leftIcon}
                </span>
              )}
              {!iconOnly && children}
              {rightIcon && (
                <span className="flex-shrink-0 flex items-center" aria-hidden="true">
                  {rightIcon}
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    )
  },
)

Button.displayName = 'Button'

// ─────────────────────────────────────────────────────────────
// ICON BUTTON SHORTHAND
// ─────────────────────────────────────────────────────────────

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'iconOnly'> {
  icon:      React.ReactNode
  label:     string   // Required for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, ...props }, ref) => (
    <Button
      ref={ref}
      iconOnly
      aria-label={label}
      leftIcon={icon}
      {...props}
    />
  ),
)
IconButton.displayName = 'IconButton'
