// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/dashboard/page.tsx
// The Cerebre Plus main dashboard.
// A business owner's daily marketing briefing — answers:
// "What should I do for my business marketing today?"
// ═══════════════════════════════════════════════════════════════

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerUser, getServerProfile } from '@/lib/supabase/server'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardShell } from '../DashboardShell'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  // ── Auth ───────────────────────────────────────────────────
  const user = await getServerUser()
  if (!user) redirect('/login')

  const supabase = await createServerClient()

  // ── Parallel fetches ───────────────────────────────────────
  const [
    { data: profile },
    { data: subscription },
    { data: coinData },
    { data: recentGenerations },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('coin_balances').select('balance, updated_at').eq('user_id', user.id).single(),
    supabase
      .from('generations')
      .select('id, tool_id, tool_name, output, created_at, coin_cost, status')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // ── Onboarding redirect ────────────────────────────────────
  if (profile && !profile.onboarding_complete) {
    redirect('/onboarding')
  }

  // ── Compute join date stats ────────────────────────────────
  const joinedAt = new Date(user.created_at)
  const now = new Date()
  const daysSinceJoin = Math.floor((now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24))
  const isEarlyMember = daysSinceJoin <= 7
  const isFoundingMember = Boolean(profile?.founding_member)

  // ── Renewal countdown ─────────────────────────────────────
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null
  const daysToRenewal = renewalDate
    ? Math.max(0, Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <DashboardClient
      user={{
        id: user.id,
        email: user.email!,
        joinedAt: joinedAt.toISOString(),
      }}
      profile={profile}
      subscription={{
        planTier: subscription?.plan_tier || 'free',
        renewalDate: renewalDate?.toISOString() || null,
        daysToRenewal,
        status: subscription?.status || 'inactive',
      }}
      coins={{
        balance: coinData?.balance ?? 0,
        updatedAt: coinData?.updated_at || null,
      }}
      recentGenerations={(recentGenerations || []).map(g => ({
        id: g.id,
        tool_id: g.tool_id,
        tool_name: g.tool_name,
        output: g.output ?? '',
        created_at: g.created_at,
        coin_cost: g.coin_cost,
      }))}
      notifications={notifications || []}
      daysSinceJoin={daysSinceJoin}
      isEarlyMember={isEarlyMember}
      isFoundingMember={isFoundingMember}
    />
  )
}
