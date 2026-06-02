// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/layout.tsx — Dashboard Shell
// Server Component: checks auth, fetches data, renders shell.
// Client providers: Toast, Query, Notification system.
// ═══════════════════════════════════════════════════════════════
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient, getServerUser, getServerProfile, getServerCoinBalance }
  from '@/lib/supabase/server'
import { DashboardShell } from './DashboardShell'

// ─────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: { template: '%s — Cerebre Plus', default: 'Dashboard — Cerebre Plus' },
  description: 'Your AI marketing platform dashboard.',
  robots: { index: false, follow: false },
}

// ─────────────────────────────────────────────────────────────
// LAYOUT (Server Component)
// ─────────────────────────────────────────────────────────────

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ── 1. Auth guard ──────────────────────────────────────────
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }

  // ── 2. Fetch profile + coin balance in parallel ────────────
  const [profile, coinBalance] = await Promise.all([
    getServerProfile(user.id),
    getServerCoinBalance(user.id),
  ])

  const supabase = await createServerClient()
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_tier, free_expires_at')
    .eq('user_id', user.id)
    .single()

  const { headers } = await import('next/headers')
  const headersList = headers()
  const pathname = headersList.get('x-invoke-path') || ''

  // subscription may be typed as an error union; narrow with safe access via any
  const planTier = (subscription as any)?.plan_tier
  const freeExpiresAt = (subscription as any)?.free_expires_at

  if (
    planTier === 'free' &&
    isFreePlanExpired(freeExpiresAt) &&
    !pathname.includes('/billing') &&
    !pathname.includes('/settings')
  ) {
    redirect('/billing?reason=trial_expired')
  }

  // Edge case: profile not created yet (handle_new_user trigger may be slow)
  if (!profile) redirect('/onboarding')

  // ── 3. Onboarding guard ────────────────────────────────────
  if (!profile.onboarding_complete) {
    // Allow access to /onboarding/* itself so user can complete the flow
    // The middleware already handles this redirect for all other /dashboard/* paths,
    // but we keep it here as a belt-and-suspenders for the layout level.
    redirect('/onboarding')
  }

  // ── 4. Render shell ────────────────────────────────────────
  return (
    <DashboardShell
      user={{
        id: user.id,
        email: user.email ?? '',
      }}
      profile={profile ?? {}}
      coinBalance={coinBalance?.balance ?? 0}
      renewsInDays={getRenewsInDays(coinBalance?.last_allocated_at)}
    >
      {children}
    </DashboardShell>
  )
}

// ─────────────────────────────────────────────────────────────
// HELPER: Days until next coin renewal
// ─────────────────────────────────────────────────────────────

function getRenewsInDays(lastAllocatedAt: string | null | undefined): number {
  if (!lastAllocatedAt) return 30
  const lastDate = new Date(lastAllocatedAt)
  const nextDate = new Date(lastDate)
  nextDate.setDate(nextDate.getDate() + 30)
  const diff = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function isFreePlanExpired(freeExpiresAt: string | null | undefined): boolean {
  if (!freeExpiresAt) return false
  return new Date(freeExpiresAt).getTime() < Date.now()
}
