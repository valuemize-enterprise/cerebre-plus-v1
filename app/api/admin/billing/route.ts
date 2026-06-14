// /app/api/admin/billing/route.ts
// Revenue overview — called by billing page.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'view_billing')) return forbidden()

  const admin = createAdminClient()
  const now   = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()

  const [subsRes, txnsRes, recentRes] = await Promise.allSettled([
    admin.from('subscriptions').select('plan_tier, status, created_at'),
    admin.from('coin_transactions').select('amount, type, created_at, user_id').gte('created_at', startOfYear),
    admin.from('coin_transactions').select('amount, type, created_at, user_id, profiles!inner(email, first_name, last_name)').order('created_at', { ascending: false }).limit(20),
  ])

  const allSubs = subsRes.status === 'fulfilled' ? (subsRes.value.data ?? []) : []
  const allTxns = txnsRes.status === 'fulfilled' ? (txnsRes.value.data ?? []) : []
  const recent  = recentRes.status === 'fulfilled' ? (recentRes.value.data ?? []) : []

  const activeSubs   = allSubs.filter((s: any) => s.status === 'active')
  const starterCount = activeSubs.filter((s: any) => s.plan_tier === 'starter').length
  const growthCount  = activeSubs.filter((s: any) => s.plan_tier === 'growth').length
  const paid         = starterCount + growthCount
  const arr          = (starterCount * 20_000) + (growthCount * 80_000)
  const mrr          = Math.round(arr / 12)

  const totalRevenue = allTxns.filter((t: any) => t.type === 'payment').reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

  const monthlyRevenue: Record<string, number> = {}
  for (const t of allTxns.filter((t: any) => t.type === 'payment')) {
    const month = new Date(t.created_at).toLocaleString('en-NG', { month: 'short', year: 'numeric' })
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (t.amount || 0)
  }

  return NextResponse.json({
    stats: {
      total_subscribers: paid,
      starter_count: starterCount,
      growth_count: growthCount,
      arr,
      mrr,
      total_revenue_ytd: totalRevenue,
    },
    monthly_revenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
    recent_transactions: recent.slice(0, 20).map((t: any) => ({
      id: t.id,
      email: t.profiles?.email,
      name: [t.profiles?.first_name, t.profiles?.last_name].filter(Boolean).join(' '),
      amount: t.amount,
      type: t.type,
      date: t.created_at,
    })),
  })
}

export const dynamic = 'force-dynamic'
