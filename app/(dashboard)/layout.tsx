// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/layout.tsx — Dashboard Shell
// Server Component: checks auth, fetches data, renders shell.
// PHASE 1 UPDATE: Subscription tier system removed.
// Auth = coin balance. No plan expiry gate.
// ═══════════════════════════════════════════════════════════════
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient, getServerUser, getServerProfile, getServerCoinBalance }
  from '@/lib/supabase/server'
import { DashboardShell } from './DashboardShell'

export const metadata: Metadata = {
  title: { template: '%s — Cerebre Plus', default: 'Dashboard — Cerebre Plus' },
  description: 'Your AI marketing platform dashboard.',
  robots: { index: false, follow: false },
}

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
  if (!profile) redirect('/onboarding')

  // ── 3. Onboarding guard ────────────────────────────────────
  if (!profile.onboarding_complete) {
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
    >
      {children}
    </DashboardShell>
  )
}
