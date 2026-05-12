// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/layout.tsx — Dashboard Shell
// Server Component: checks auth, fetches data, renders shell.
// Client providers: Toast, Query, Notification system.
// ═══════════════════════════════════════════════════════════════
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerUser, getServerProfile, getServerCoinBalance }
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

  // Edge case: profile not created yet (handle_new_user trigger may be slow)
  // if (!profile) redirect('/onboarding')

  // ── 3. Onboarding guard ────────────────────────────────────
  // if (!profile.onboarding_complete) {
  //   // Allow access to /onboarding/* itself so user can complete the flow
  //   // The middleware already handles this redirect for all other /dashboard/* paths,
  //   // but we keep it here as a belt-and-suspenders for the layout level.
  //   redirect('/onboarding')
  // }

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
