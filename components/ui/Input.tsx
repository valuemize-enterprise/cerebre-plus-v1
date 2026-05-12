'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type InputState = 'default' | 'focused' | 'error' | 'success'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:          string
  helpText?:       string
  errorText?:      string
  successText?:    string
  characterLimit?: number
  prefixIcon?:     React.ReactNode
  suffixIcon?:     React.ReactNode
  inputSize?:      'sm' | 'md' | 'lg'
  showPasswordToggle?: boolean
  wrapperClassName?: string
  labelClassName?: string
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:          string
  helpText?:       string
  errorText?:      string
  successText?:    string
  characterLimit?: number
  minHeight?:      number
  wrapperClassName?: string
  labelClassName?: string
}

// ─────────────────────────────────────────────────────────────
// SIZE STYLES
// ─────────────────────────────────────────────────────────────

const inputSizeStyles = {
  sm: 'h-8  text-sm  px-3 py-1.5',
  md: 'h-10 text-sm  px-3.5 py-2.5',
  lg: 'h-12 text-base px-4 py-3',
}

// ─────────────────────────────────────────────────────────────
// STATE RING STYLES
// ─────────────────────────────────────────────────────────────

const getStateStyles = (
  hasError: boolean,
  hasSuccess: boolean,
) => {
  if (hasError)   return 'border-cerebre-coral focus:border-cerebre-coral focus:ring-cerebre-coral/20 focus:ring-2'
  if (hasSuccess) return 'border-cerebre-teal  focus:border-cerebre-teal  focus:ring-cerebre-teal/20  focus:ring-2'
  return 'border-cerebre-border focus:border-cerebre-gold focus:ring-cerebre-gold/20 focus:ring-2 hover:border-cerebre-gold/40'
}

// ─────────────────────────────────────────────────────────────
// SHAKE ANIMATION (error state)
// ─────────────────────────────────────────────────────────────

const shakeVariants = {
  idle:  { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.45, ease: 'easeInOut' as const  },
  },
}

// ─────────────────────────────────────────────────────────────
// CHARACTER COUNTER
// ─────────────────────────────────────────────────────────────

const CharCounter = ({ current, max }: { current: number; max: number }) => {
  const pct = current / max
  const colour =
    pct > 0.9  ? 'text-cerebre-coral' :
    pct > 0.75 ? 'text-amber-400'     :
    'text-cerebre-muted'

  return (
    <span className={twMerge('text-xs tabular-nums transition-colors duration-200', colour)}>
      {current}/{max}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// LABEL
// ─────────────────────────────────────────────────────────────

const Label = ({
  htmlFor,
  required,
  children,
  className,
}: {
  htmlFor?:  string
  required?: boolean
  children:  React.ReactNode
  className?: string
}) => (
  <label
    htmlFor={htmlFor}
    className={twMerge(
      'block text-sm font-medium text-cerebre-text mb-1.5 select-none',
      className,
    )}
  >
    {children}
    {required && (
      <span className="ml-1 text-cerebre-coral" aria-hidden="true">*</span>
    )}
  </label>
)

// ─────────────────────────────────────────────────────────────
// HELP / ERROR TEXT
// ─────────────────────────────────────────────────────────────

const FieldMessage = ({
  text,
  type,
  id,
}: {
  text: string
  type: 'help' | 'error' | 'success'
  id?: string
}) => {
  const colour =
    type === 'error'   ? 'text-cerebre-coral' :
    type === 'success' ? 'text-cerebre-teal'  :
    'text-cerebre-muted'

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={text}
        id={id}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className={twMerge('mt-1.5 text-xs leading-relaxed', colour)}
        role={type === 'error' ? 'alert' : undefined}
        aria-live={type === 'error' ? 'polite' : undefined}
      >
        {text}
      </motion.p>
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────
// BASE INPUT CLASSES
// ─────────────────────────────────────────────────────────────

const baseInputClasses = [
  'w-full',
  'bg-cerebre-navy',
  'rounded-input',
  'border',
  'text-cerebre-text',
  'placeholder:text-cerebre-muted',
  'outline-none',
  'transition-all duration-200',
  'font-body',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ')

// ─────────────────────────────────────────────────────────────
// INPUT COMPONENT
// ─────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helpText,
      errorText,
      successText,
      characterLimit,
      prefixIcon,
      suffixIcon,
      inputSize    = 'md',
      showPasswordToggle,
      type         = 'text',
      wrapperClassName,
      labelClassName,
      className,
      id,
      value,
      defaultValue,
      onChange,
      required,
      disabled,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount]       = React.useState(
      typeof value === 'string'        ? value.length :
      typeof defaultValue === 'string' ? defaultValue.length : 0,
    )
    const [showPassword, setShowPassword] = React.useState(false)
    const [isShaking,    setIsShaking]    = React.useState(false)
    const inputId   = id ?? React.useId()
    const helpId    = `${inputId}-help`
    const errorId   = `${inputId}-error`
    const successId = `${inputId}-success`

    const hasError   = !!errorText
    const hasSuccess = !!successText && !hasError
    const showHelp   = !hasError && !hasSuccess && !!helpText

    // Shake on error appearance
    React.useEffect(() => {
      if (hasError) {
        setIsShaking(true)
        const t = setTimeout(() => setIsShaking(false), 500)
        return () => clearTimeout(t)
      }
    }, [hasError, errorText])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (characterLimit !== undefined) setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const resolvedType = type === 'password' && showPassword ? 'text' : type

    const ariaIds = [
      showHelp    ? helpId    : null,
      hasError    ? errorId   : null,
      hasSuccess  ? successId : null,
      ariaDescribedby ?? null,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className={twMerge('w-full', wrapperClassName)}>
        {/* Label row */}
        {(label || characterLimit !== undefined) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <Label htmlFor={inputId} required={required} className={twMerge('mb-0', labelClassName)}>
                {label}
              </Label>
            )}
            {characterLimit !== undefined && (
              <CharCounter current={charCount} max={characterLimit} />
            )}
          </div>
        )}

        {/* Input wrapper */}
        <motion.div
          variants={shakeVariants}
          animate={isShaking ? 'shake' : 'idle'}
          className="relative flex items-center"
        >
          {/* Prefix icon */}
          {prefixIcon && (
            <span className="absolute left-3 flex items-center text-cerebre-muted pointer-events-none z-10"
              aria-hidden="true">
              {prefixIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            maxLength={characterLimit}
            aria-invalid={hasError}
            aria-describedby={ariaIds}
            aria-required={required}
            className={twMerge(
              baseInputClasses,
              inputSizeStyles[inputSize],
              getStateStyles(hasError, hasSuccess),
              prefixIcon     ? 'pl-9'  : '',
              suffixIcon || (type === 'password' && showPasswordToggle)
                             ? 'pr-9'  : '',
              hasError       ? 'text-cerebre-coral placeholder:text-cerebre-coral/40' : '',
              className,
            )}
            {...props}
          />

          {/* Suffix icon / success / error / password toggle */}
          <span className="absolute right-3 flex items-center gap-1.5 z-10" aria-hidden="true">
            {hasError   && <AlertCircle  className="h-4 w-4 text-cerebre-coral flex-shrink-0" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-cerebre-teal  flex-shrink-0" />}
            {!hasError && !hasSuccess && suffixIcon && (
              <span className="text-cerebre-muted">{suffixIcon}</span>
            )}
            {type === 'password' && showPasswordToggle && (
              <button
                type="button"
                tabIndex={-1}
                className="text-cerebre-muted hover:text-cerebre-text transition-colors ml-1"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </span>
        </motion.div>

        {/* Messages */}
        {hasError   && <FieldMessage text={errorText!}   type="error"   id={errorId} />}
        {hasSuccess && <FieldMessage text={successText!} type="success" id={successId} />}
        {showHelp   && <FieldMessage text={helpText!}    type="help"    id={helpId} />}
      </div>
    )
  },
)
Input.displayName = 'Input'

// ─────────────────────────────────────────────────────────────
// TEXTAREA COMPONENT
// ─────────────────────────────────────────────────────────────

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helpText,
      errorText,
      successText,
      characterLimit,
      minHeight   = 100,
      wrapperClassName,
      labelClassName,
      className,
      id,
      value,
      defaultValue,
      onChange,
      required,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = React.useState(
      typeof value === 'string'        ? value.length :
      typeof defaultValue === 'string' ? defaultValue.length : 0,
    )
    const [isShaking, setIsShaking] = React.useState(false)
    const inputId  = id ?? React.useId()
    const helpId   = `${inputId}-help`
    const errorId  = `${inputId}-error`
    const successId = `${inputId}-success`


    const hasError   = !!errorText
    const hasSuccess = !!successText && !hasError
    const showHelp   = !hasError && !hasSuccess && !!helpText

    React.useEffect(() => {
      if (hasError) {
        setIsShaking(true)
        const t = setTimeout(() => setIsShaking(false), 500)
        return () => clearTimeout(t)
      }
    }, [hasError, errorText])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (characterLimit !== undefined) setCharCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className={twMerge('w-full', wrapperClassName)}>
        {(label || characterLimit !== undefined) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <Label htmlFor={inputId} required={required} className={twMerge('mb-0', labelClassName)}>
                {label}
              </Label>
            )}
            {characterLimit !== undefined && (
              <CharCounter current={charCount} max={characterLimit} />
            )}
          </div>
        )}

        <motion.div
          variants={shakeVariants}
          animate={isShaking ? 'shake' : 'idle'}
        >
          <textarea
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            required={required}
            maxLength={characterLimit}
            aria-invalid={hasError}
            aria-describedby={[
              showHelp   ? helpId  : null,
              hasError   ? errorId : null,
            ].filter(Boolean).join(' ') || undefined}
            style={{ minHeight }}
            className={twMerge(
              baseInputClasses,
              'px-3.5 py-2.5 text-sm leading-relaxed',
              'resize-y',
              getStateStyles(hasError, hasSuccess),
              className,
            )}
            {...props}
          />
        </motion.div>

        {hasError   && <FieldMessage text={errorText!}   type="error"   id={errorId} />}
        {hasSuccess && <FieldMessage text={successText!} type="success" id={successId} />}
        {showHelp   && <FieldMessage text={helpText!}    type="help"    id={helpId} />}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
