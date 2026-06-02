'use client'

// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/DashboardShell.tsx
// Client Component that wraps the entire dashboard experience.
// Provides: QueryClient, Toast, Notifications, Sidebar, TopNav, MobileNav.
// Receives server-fetched initial data as props to avoid waterfalls.
// ═══════════════════════════════════════════════════════════════

import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Sidebar, MobileNav, TopNav } from '@/components/shared/Navigation'
import { Toast, ToastViewport } from '@/components/ui/ModalToastSelect'

// ─────────────────────────────────────────────────────────────
// QUERY CLIENT (singleton per session)
// ─────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:        60 * 1000,   // 1 min
        gcTime:           5 * 60 * 1000, // 5 min
        retry:            1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

// ─────────────────────────────────────────────────────────────
// TOAST CONTEXT
// ─────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'coin'

interface ToastItem {
  id:          string
  type:        ToastVariant
  title:       string
  description?: string
  duration?:   number
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void
  success: (title: string, description?: string) => void
  error:   (title: string, description?: string) => void
  info:    (title: string, description?: string) => void
  coin:    (amount: number, direction: 'spent' | 'earned') => void
}

export const ToastContext = React.createContext<ToastContextValue>({
  toast:   () => {},
  success: () => {},
  error:   () => {},
  info:    () => {},
  coin:    () => {},
})

export function useToast() {
  return React.useContext(ToastContext)
}

// ─────────────────────────────────────────────────────────────
// COIN BALANCE CONTEXT
// (Re-exported so tool pages can deduct and update)
// ─────────────────────────────────────────────────────────────

interface CoinContextValue {
  balance:     number
  setBalance:  (n: number) => void
  deduct:      (amount: number) => void
  credit:      (amount: number) => void
}

export const CoinContext = React.createContext<CoinContextValue>({
  balance:    0,
  setBalance: () => {},
  deduct:     () => {},
  credit:     () => {},
})

export function useCoinBalance() {
  return React.useContext(CoinContext)
}

// ─────────────────────────────────────────────────────────────
// PAGE TITLE MAP
// ─────────────────────────────────────────────────────────────

function getPageMeta(pathname: string): {
  title:       string
  breadcrumbs: { label: string; href?: string }[]
} {
  const segments = pathname.split('/').filter(Boolean)

  const map: Record<string, string> = {
    dashboard:     'Dashboard',
    tools:         'Tools',
    library:       'Library',
    profile:       'Business Profile',
    billing:       'Billing & Coins',
    referral:      'Referrals',
    calendar:      'Content Calendar',
    insights:      'AI Insights',
    settings:      'Settings',
    notifications: 'Notifications',
    onboarding:    'Onboarding',
    help:          'Help & Support',
    feedback:      'Give Feedback',
  }

  if (segments.length === 1) {
    return {
      title:       map[segments[0]] ?? segments[0],
      breadcrumbs: [{ label: map[segments[0]] ?? segments[0] }],
    }
  }

  if (segments[0] === 'tools' && segments[1]) {
    return {
      title:       'Tool',
      breadcrumbs: [
        { label: 'Tools', href: '/tools' },
        { label: segments[1].replace(/-/g, ' ') },
      ],
    }
  }

  return {
    title:       map[segments[0]] ?? 'Dashboard',
    breadcrumbs: segments.map((s, i) => ({
      label: map[s] ?? s.replace(/-/g, ' '),
      href:  i < segments.length - 1 ? `/${segments.slice(0, i + 1).join('/')}` : undefined,
    })),
  }
}

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────

export interface DashboardShellProps {
  user: {
    id:    string
    email: string
  }
  profile: {
    full_name?:   string | null
    business_name?: string | null
    plan_tier?:   string | null
    whatsapp?:    string | null
    [key: string]: any
  }
  coinBalance:  number
  renewsInDays?: number
  children:     React.ReactNode
}

// ─────────────────────────────────────────────────────────────
// CELEBRATION OVERLAY
// ─────────────────────────────────────────────────────────────

const CelebrationOverlay = ({
  message,
  onDismiss,
}: {
  message:   string
  onDismiss: () => void
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-max flex items-center justify-center bg-cerebre-void/60 backdrop-blur-sm"
    onClick={onDismiss}
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 20 }}
      animate={{ scale: 1,   opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      className="text-center px-8 py-10 rounded-2xl border border-cerebre-gold/30 bg-cerebre-surface shadow-gold max-w-xs mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-5xl mb-4"
      >
        🏆
      </motion.div>
      <h2 className="font-display font-bold text-xl text-cerebre-text mb-2">
        Milestone unlocked!
      </h2>
      <p className="text-sm text-cerebre-muted leading-relaxed mb-5">
        {message}
      </p>
      <button
        onClick={onDismiss}
        className="px-4 py-2 rounded-button bg-cerebre-gold text-cerebre-ink text-sm font-semibold hover:shadow-gold transition-all"
      >
        Keep going 🚀
      </button>
    </motion.div>
  </motion.div>
)

// ─────────────────────────────────────────────────────────────
// REAL-TIME COIN SYNC
// Subscribes to Supabase realtime changes on coin_balances
// so balance updates from webhooks are reflected instantly.
// ─────────────────────────────────────────────────────────────

export function useRealtimeCoinSync(
  userId:     string,
  setBalance: (n: number) => void,
) {
  const supabase = createBrowserClient()

  React.useEffect(() => {
    const channel = supabase
      .channel(`coin_balance:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'coin_balances',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBalance = (payload.new as any).balance
          if (typeof newBalance === 'number') setBalance(newBalance)
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, setBalance, supabase])
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD SHELL
// ─────────────────────────────────────────────────────────────

export function DashboardShell({
  user,
  profile,
  coinBalance:    initialCoinBalance,
  renewsInDays,
  children,
}: DashboardShellProps) {
  const queryClient = getQueryClient()
  const pathname    = usePathname()
  const router      = useRouter()
  const supabase    = createBrowserClient()

  // ── State ──────────────────────────────────────────────────
  const [balance,    setBalance]    = React.useState(initialCoinBalance)
  const [toasts,     setToasts]     = React.useState<ToastItem[]>([])
  const [celebration, setCelebration] = React.useState<string | null>(null)
  const [notifCount, setNotifCount]  = React.useState(0)

  // ── Sync balance from realtime ─────────────────────────────
  useRealtimeCoinSync(user.id, setBalance)

  // ── Fetch unread notification count ───────────────────────
  React.useEffect(() => {
    let mounted = true
    const fetchNotifs = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      if (mounted && typeof count === 'number') setNotifCount(count)
    }
    fetchNotifs()
    return () => { mounted = false }
  }, [user.id, supabase])

  // ── Check for pending milestone celebration ────────────────
  React.useEffect(() => {
    const checkMilestones = async () => {
      const { data } = await supabase
        .from('milestones')
        .select('milestone_label')
        .eq('user_id', user.id)
        .eq('celebration_shown', false)
        .order('achieved_at', { ascending: true })
        .limit(1)
        .single()

      if (data) {
        setCelebration(data.milestone_label)
        // Mark as shown
        await supabase
          .from('milestones')
          .update({ celebration_shown: true, celebrated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('milestone_label', data.milestone_label)
      }
    }
    checkMilestones()
  }, [user.id, supabase])

  // ── Toast helpers ──────────────────────────────────────────
  const addToast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-2), { ...item, id }])  // Max 3
  }, [])

  const toastHelpers: ToastContextValue = React.useMemo(() => ({
    toast:   addToast,
    success: (title, description) => addToast({ type: 'success', title, description }),
    error:   (title, description) => addToast({ type: 'error',   title, description }),
    info:    (title, description) => addToast({ type: 'info',    title, description }),
    coin:    (amount, direction) => addToast({
      type:  'coin',
      title: direction === 'spent'
        ? `${amount} coins spent`
        : `+${amount} coins added`,
      description: direction === 'spent'
        ? 'Your output is being generated'
        : 'Your coin balance has been updated',
    }),
  }), [addToast])

  // ── Coin context ───────────────────────────────────────────
  const coinContext: CoinContextValue = React.useMemo(() => ({
    balance,
    setBalance,
    deduct: (amount) => setBalance((b) => Math.max(0, b - amount)),
    credit: (amount) => setBalance((b) => b + amount),
  }), [balance])

  // ── Sign out ───────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // ── Page meta ──────────────────────────────────────────────
  const { title, breadcrumbs } = getPageMeta(pathname)
  

  // ── User display ───────────────────────────────────────────
  const displayName   = profile?.full_name ?? profile?.business_name ?? user?.email ?? 'Paul Adeleke'
  const userInitials  = (displayName ?? 'CB')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
  const planTier = profile.plan_tier ?? 'free'

  return (
    <QueryClientProvider client={queryClient}>
      <ToastPrimitive.Provider swipeDirection="right">
        <ToastContext.Provider value={toastHelpers}>
          <CoinContext.Provider value={coinContext}>

            {/* App shell */}
            <div className="flex h-dvh bg-cerebre-ink overflow-hidden">

              {/* ── Desktop Sidebar ────────────────────────── */}
              <Sidebar
                coinBalance={balance}
                planTier={planTier}
                renewsInDays={renewsInDays}
                userInitials={userInitials}
                userName={displayName ?? undefined}
                userEmail={user.email}
                onSignOut={handleSignOut}
              />

              {/* ── Main content column ────────────────────── */}
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                {/* Top navigation */}
                <TopNav
                  breadcrumbs={breadcrumbs}
                  title={title}
                  coinBalance={balance}
                  planTier={planTier}
                  renewsInDays={renewsInDays}
                  notifCount={notifCount}
                  userInitials={userInitials}
                  userName={displayName ?? undefined}
                  userEmail={user.email}
                  onSignOut={handleSignOut}
                />

                {/* Scrollable page area */}
                <main
                  id="main-content"
                  className="flex-1 overflow-y-auto scrollbar-thin"
                  // Bottom padding accounts for mobile nav bar (60px) + extra
                  style={{ paddingBottom: 'max(80px, calc(60px + env(safe-area-inset-bottom)))' }}
                >
                  <div className="max-w-dash mx-auto px-4 md:px-6 py-5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                      >
                        {children}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </main>
              </div>

              {/* ── Mobile Bottom Nav ──────────────────────── */}
              <MobileNav notifCount={notifCount} />
            </div>

            {/* ── Toasts ───────────────────────────────────── */}
            <AnimatePresence>
              {toasts.map((t) => (
                <ToastPrimitive.Root key={t.id} asChild duration={t.duration ?? 4000}>
                  <motion.div
                    initial={{ opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 32 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Toast {...t} />
                  </motion.div>
                </ToastPrimitive.Root>
              ))}
            </AnimatePresence>
            <ToastViewport />

            {/* ── Milestone celebration ─────────────────────── */}
            <AnimatePresence>
              {celebration && (
                <CelebrationOverlay
                  key="celebration"
                  message={celebration}
                  onDismiss={() => setCelebration(null)}
                />
              )}
            </AnimatePresence>

          </CoinContext.Provider>
        </ToastContext.Provider>
      </ToastPrimitive.Provider>
    </QueryClientProvider>
  )
}
