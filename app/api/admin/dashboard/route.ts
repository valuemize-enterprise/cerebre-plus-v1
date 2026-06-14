// /app/api/admin/dashboard/route.ts
// Dashboard stats — called by /cerebre-admin/dashboard/page.tsx on mount.
// This was missing, which caused a compile/runtime error that broke ALL admin pages.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }        from '@/lib/supabase/admin'
import { getAdminSession, unauthorized } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin  = createAdminClient()
  const now    = new Date()
  const d1     = new Date(now.getTime() - 1     * 86400_000).toISOString()  // 24 hrs ago
  const d7     = new Date(now.getTime() - 7     * 86400_000).toISOString()
  const in7    = new Date(now.getTime() + 7     * 86400_000).toISOString()

  const [
    totalRes, subsRes, newTodayRes, expiringRes,
    recentRes, generationsRes,
  ] = await Promise.allSettled([
    // Total users
    admin.from('profiles').select('id', { count: 'exact', head: true }),

    // Subscriptions by plan
    admin.from('subscriptions').select('plan_tier, status'),

    // New today
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', d1),

    // Trials expiring in 7 days
    admin
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('plan_tier', 'free')
      .eq('status', 'active')
      .lte('free_expires_at', in7)
      .gte('free_expires_at', now.toISOString()),

    // Recent sign-ups (last 10)
    admin
      .from('profiles')
      .select('id, email, first_name, last_name, created_at, subscriptions!left(plan_tier)')
      .order('created_at', { ascending: false })
      .limit(10),

    // Tool generations last 7 days (deductions = usage)
    admin
      .from('coin_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'deduction')
      .gte('created_at', d7),
  ])

  // Safely extract results
  const totalUsers    = totalRes.status    === 'fulfilled' ? (totalRes.value.count ?? 0)         : 0
  const allSubs       = subsRes.status     === 'fulfilled' ? (subsRes.value.data ?? [])           : []
  const newToday      = newTodayRes.status === 'fulfilled' ? (newTodayRes.value.count ?? 0)       : 0
  const expiring      = expiringRes.status === 'fulfilled' ? (expiringRes.value.count ?? 0)       : 0
  const recentUsers   = recentRes.status   === 'fulfilled' ? (recentRes.value.data ?? [])         : []
  const generations7d = generationsRes.status === 'fulfilled' ? (generationsRes.value.count ?? 0) : 0

  const activeSubs  = allSubs.filter((s: any) => s.status === 'active')
  const starterCount= activeSubs.filter((s: any) => s.plan_tier === 'starter').length
  const growthCount = activeSubs.filter((s: any) => s.plan_tier === 'growth').length
  const freeCount   = activeSubs.filter((s: any) => s.plan_tier === 'free').length
  const paid        = starterCount + growthCount
  const arr         = (starterCount * 20_000) + (growthCount * 80_000)
  const mrr         = Math.round(arr / 12)

  const recent = recentUsers.map((u: any) => ({
    id:                u.id,
    email:             u.email,
    first_name:        u.first_name,
    last_name:         u.last_name,
    created_at:        u.created_at,
    subscription_tier: u.subscriptions?.[0]?.plan_tier ?? 'free',
  }))

  return NextResponse.json({
    stats: {
      total_users:    totalUsers,
      paid_users:     paid,
      free_users:     freeCount,
      starter_users:  starterCount,
      growth_users:   growthCount,
      new_today:      newToday,
      expiring_soon:  expiring,
      mrr,
      arr,
      generations_7d: generations7d,
    },
    recent_users: recent,
  })
}

export const dynamic = 'force-dynamic'
