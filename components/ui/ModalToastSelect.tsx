'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as ToastPrimitive from '@radix-ui/react-toast'
import * as SelectPrimitive from '@radix-ui/react-select'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, ChevronDown, Check } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

// ══════════════════════════════════════════════════════════════
// MODAL (Radix Dialog)
// ══════════════════════════════════════════════════════════════

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'

export interface ModalProps {
  open:          boolean
  onOpenChange:  (open: boolean) => void
  title?:        string
  description?:  string
  size?:         ModalSize
  children:      React.ReactNode
  showClose?:    boolean
  accentColour?: string   // Top accent line colour (hex), defaults to gold
  className?:    string
}

const modalWidths: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)]',
}

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  size        = 'md',
  children,
  showClose   = true,
  accentColour = '#E09818',
  className,
}: ModalProps) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          {/* Overlay */}
          <DialogPrimitive.Overlay asChild>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-modal bg-cerebre-void/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </DialogPrimitive.Overlay>

          {/* Panel */}
          <DialogPrimitive.Content asChild>
            <motion.div
              key="content"
              className={twMerge(
                'fixed z-modal inset-x-4 top-1/2 -translate-y-1/2',
                'sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full',
                'bg-cerebre-surface rounded-card shadow-cerebre-xl',
                'overflow-hidden flex flex-col',
                'max-h-[90dvh]',
                modalWidths[size],
                className,
              )}
              initial={{ opacity: 0, scale: 0.94, y: '-45%' }}
              animate={{ opacity: 1, scale: 1,    y: '-50%' }}
              exit={{ opacity: 0,   scale: 0.94, y: '-45%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 380, mass: 0.7 }}
              aria-modal="true"
              role="dialog"
            >
              {/* Gold accent line at top */}
              <div
                className="h-[3px] w-full flex-shrink-0"
                style={{ background: `linear-gradient(90deg, ${accentColour}, transparent)` }}
              />

              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-start justify-between px-5 pt-4 pb-3 flex-shrink-0">
                  <div className="flex-1 min-w-0 pr-8">
                    {title && (
                      <DialogPrimitive.Title className="font-display font-semibold text-lg text-cerebre-text leading-tight">
                        {title}
                      </DialogPrimitive.Title>
                    )}
                    {description && (
                      <DialogPrimitive.Description className="mt-1 text-sm text-cerebre-muted leading-relaxed">
                        {description}
                      </DialogPrimitive.Description>
                    )}
                  </div>
                  {showClose && (
                    <DialogPrimitive.Close
                      className="absolute top-4 right-4 flex items-center justify-center h-7 w-7 rounded-md text-cerebre-muted hover:text-cerebre-text hover:bg-cerebre-border/40 transition-colors focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:outline-none"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </DialogPrimitive.Close>
                  )}
                </div>
              )}

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 pb-5 pt-1">
                {children}
              </div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  </DialogPrimitive.Root>
)

// ── Trigger shorthand ─────────────────────────────────────────
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalClose   = DialogPrimitive.Close

// ── Modal footer helper ───────────────────────────────────────
export const ModalFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={twMerge('flex items-center justify-end gap-2 pt-4 mt-4 border-t border-cerebre-border/50', className)}>
    {children}
  </div>
)

// ══════════════════════════════════════════════════════════════
// TOAST COMPONENT (Radix Toast)
// ══════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'coin'

export interface ToastData {
  id?:         string
  type:        ToastType
  title:       string
  description?: string
  duration?:   number
}

const toastConfig: Record<ToastType, {
  icon: React.ReactNode
  border: string
  bg: string
  iconColor: string
}> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 flex-shrink-0" />,
    border: 'border-cerebre-teal/40',
    bg:     'bg-cerebre-teal/8',
    iconColor: 'text-cerebre-teal',
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 flex-shrink-0" />,
    border: 'border-cerebre-coral/40',
    bg:     'bg-cerebre-coral/8',
    iconColor: 'text-cerebre-coral',
  },
  info: {
    icon: <Info className="h-4 w-4 flex-shrink-0" />,
    border: 'border-cerebre-gold/40',
    bg:     'bg-cerebre-gold-dim',
    iconColor: 'text-cerebre-gold',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 flex-shrink-0" />,
    border: 'border-amber-400/40',
    bg:     'bg-amber-400/8',
    iconColor: 'text-amber-400',
  },
  coin: {
    icon: <span className="text-base leading-none flex-shrink-0">🪙</span>,
    border: 'border-cerebre-gold/40',
    bg:     'bg-cerebre-gold-dim',
    iconColor: 'text-cerebre-gold',
  },
}

export const Toast = ({
  id,
  type,
  title,
  description,
  duration = 4000,
}: ToastData) => {
  const cfg = toastConfig[type]

  return (
    <ToastPrimitive.Root
      className={twMerge(
        'relative flex items-start gap-3 p-3.5',
        'rounded-card border shadow-cerebre',
        'bg-cerebre-surface',
        cfg.border,
        'data-[state=open]:animate-slideInRight',
        'data-[state=closed]:animate-fadeIn',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform duration-200',
        'data-[swipe=end]:animate-fadeIn',
        'min-w-[280px] max-w-[360px]',
      )}
      duration={duration}
    >
      <span className={twMerge('mt-0.5', cfg.iconColor)}>{cfg.icon}</span>

      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="text-sm font-semibold text-cerebre-text leading-tight">
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="mt-0.5 text-xs text-cerebre-muted leading-relaxed">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>

      <ToastPrimitive.Close
        className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded text-cerebre-muted hover:text-cerebre-text transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

// ── Toast viewport (add once to layout) ──────────────────────
export const ToastViewport = () => (
  <ToastPrimitive.Viewport
    className={twMerge(
      'fixed z-toast flex flex-col gap-2 p-4',
      // Desktop: top-right; Mobile: top-center
      'top-4 right-4 sm:right-4 sm:left-auto',
      'left-4 sm:left-auto',
      'max-w-[360px] w-[calc(100vw-2rem)] sm:w-full',
    )}
  />
)

// ── Toast provider (wrap around app) ─────────────────────────
export const ToastProvider = ToastPrimitive.Provider

// ══════════════════════════════════════════════════════════════
// SELECT COMPONENT (Radix Select)
// ══════════════════════════════════════════════════════════════

export interface SelectOption {
  value:     string
  label:     string
  disabled?: boolean
  group?:    string
}

export interface SelectProps {
  options:       SelectOption[]
  value?:        string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?:  string
  label?:        string
  helpText?:     string
  errorText?:    string
  disabled?:     boolean
  required?:     boolean
  id?:           string
  className?:    string
}

export const Select = ({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option',
  label,
  helpText,
  errorText,
  disabled,
  required,
  id,
  className,
}: SelectProps) => {
  const selectId  = id ?? React.useId()
  const hasError  = !!errorText

  // Group options
  const groups = React.useMemo(() => {
    const ungrouped: SelectOption[] = []
    const grouped: Record<string, SelectOption[]> = {}
    for (const opt of options) {
      if (opt.group) {
        grouped[opt.group] = grouped[opt.group] ?? []
        grouped[opt.group].push(opt)
      } else {
        ungrouped.push(opt)
      }
    }
    return { ungrouped, grouped }
  }, [options])

  return (
    <div className={twMerge('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-cerebre-text mb-1.5 select-none"
        >
          {label}
          {required && <span className="ml-1 text-cerebre-coral" aria-hidden>*</span>}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectPrimitive.Trigger
          id={selectId}
          aria-invalid={hasError}
          aria-required={required}
          className={twMerge(
            'flex h-10 w-full items-center justify-between',
            'bg-cerebre-navy rounded-input border px-3.5 py-2.5',
            'text-sm font-body text-cerebre-text',
            'placeholder:text-cerebre-muted',
            'transition-all duration-200 outline-none',
            hasError
              ? 'border-cerebre-coral focus:ring-2 focus:ring-cerebre-coral/20'
              : 'border-cerebre-border hover:border-cerebre-gold/40 focus:border-cerebre-gold focus:ring-2 focus:ring-cerebre-gold/20',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          <SelectPrimitive.Value
            placeholder={
              <span className="text-cerebre-muted">{placeholder}</span>
            }
          />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 text-cerebre-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={twMerge(
              'relative z-tooltip overflow-hidden',
              'bg-cerebre-surface border border-cerebre-border rounded-card',
              'shadow-cerebre-xl',
              'data-[state=open]:animate-fadeDown data-[state=closed]:animate-fadeIn',
              'min-w-[var(--radix-select-trigger-width)] max-h-72',
            )}
            position="popper"
            sideOffset={6}
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-cerebre-surface text-cerebre-muted">
              <ChevronDown className="h-3 w-3 rotate-180" />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1">
              {/* Ungrouped */}
              {groups.ungrouped.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}

              {/* Grouped */}
              {Object.entries(groups.grouped).map(([groupName, opts]) => (
                <SelectPrimitive.Group key={groupName}>
                  <SelectPrimitive.Label className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-cerebre-muted">
                    {groupName}
                  </SelectPrimitive.Label>
                  {opts.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectPrimitive.Group>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-cerebre-surface text-cerebre-muted">
              <ChevronDown className="h-3 w-3" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {hasError  && (
        <p className="mt-1.5 text-xs text-cerebre-coral" role="alert">{errorText}</p>
      )}
      {!hasError && helpText && (
        <p className="mt-1.5 text-xs text-cerebre-muted">{helpText}</p>
      )}
    </div>
  )
}

// ── Select item ───────────────────────────────────────────────
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={twMerge(
      'relative flex items-center gap-2 px-3 py-2.5 rounded-md',
      'text-sm text-cerebre-text cursor-pointer select-none outline-none',
      'transition-colors duration-100',
      'data-[highlighted]:bg-cerebre-gold-dim data-[highlighted]:text-cerebre-gold',
      'data-[state=checked]:text-cerebre-gold',
      'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="ml-auto">
      <Check className="h-3.5 w-3.5 text-cerebre-gold" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
))
SelectItem.displayName = 'SelectItem'

// ══════════════════════════════════════════════════════════════
// useToast HOOK — context-based toast system
// ══════════════════════════════════════════════════════════════

interface ToastContextValue {
  toast: (data: ToastData) => void
}

const ToastContext = React.createContext<ToastContextValue>({
  toast: () => {},
})

export interface ToastProviderWithHookProps {
  children: React.ReactNode
}

export function ToastProviderWithHook({ children }: ToastProviderWithHookProps) {
  const [toasts, setToasts] = React.useState<(ToastData & { id: string })[]>([])

  const toast = React.useCallback((data: ToastData) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev.slice(-4), { ...data, id }]) // max 5 toasts
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, data.duration ?? 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <Toast key={t.id} {...t} />
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastContext)
}
