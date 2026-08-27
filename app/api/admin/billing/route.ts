// /app/api/admin/billing/route.ts
// PHASE 1 UPDATE: Coin revenue overview. Subscription MRR/ARR removed.
// Metrics: total ₦ from top-ups, coins sold, coins spent, top buyers.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'view_billing')) return forbidden()

  const admin       = createAdminClient()
  const now         = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()
  const d30         = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const [txnsYTDRes, txns30dRes, recentRes, balancesRes] = await Promise.allSettled([
    // All top-up transactions YTD
    admin.from('coin_transactions')
      .select('amount, type, created_at, user_id')
      .eq('type', 'topup')
      .gte('created_at', startOfYear),

    // Last 30 days top-ups
    admin.from('coin_transactions')
      .select('amount, type, created_at')
      .eq('type', 'topup')
      .gte('created_at', d30),

    // Recent top-up transactions with user info
    admin.from('coin_transactions')
      .select('id, amount, type, created_at, user_id, profiles!inner(email, full_name)')
      .eq('type', 'topup')
      .order('created_at', { ascending: false })
      .limit(20),

    // Active coin balances (platform health)
    admin.from('coin_balances')
      .select('balance, user_id'),
  ])

  const txnsYTD  = txnsYTDRes.status  === 'fulfilled' ? (txnsYTDRes.value.data  ?? []) : []
  const txns30d  = txns30dRes.status  === 'fulfilled' ? (txns30dRes.value.data  ?? []) : []
  const recent   = recentRes.status   === 'fulfilled' ? (recentRes.value.data   ?? []) : []
  const balances = balancesRes.status === 'fulfilled' ? (balancesRes.value.data ?? []) : []

  // Revenue metrics — estimate ₦ from coin counts (₦500/coin average base rate)
  // Note: actual ₦ per transaction needs to come from Paystack. For now we estimate.
  const COIN_BASE_RATE = 500
  const coinsYTD   = txnsYTD.reduce((s: number, t: any) => s + (t.amount || 0), 0)
  const revenueYTD = coinsYTD * COIN_BASE_RATE
  const coins30d   = txns30d.reduce((s: number, t: any) => s + (t.amount || 0), 0)
  const revenue30d = coins30d * COIN_BASE_RATE

  const totalUsersWithCoins = balances.filter((b: any) => b.balance > 0).length
  const totalCoinsHeld      = balances.reduce((s: number, b: any) => s + (b.balance || 0), 0)

  // Monthly breakdown of top-ups YTD
  const monthlyRevenue: Record<string, { coins: number; revenue: number }> = {}
  for (const t of txnsYTD) {
    const month = new Date(t.created_at).toLocaleString('en-NG', { month: 'short', year: 'numeric' })
    if (!monthlyRevenue[month]) monthlyRevenue[month] = { coins: 0, revenue: 0 }
    monthlyRevenue[month].coins   += t.amount || 0
    monthlyRevenue[month].revenue += (t.amount || 0) * COIN_BASE_RATE
  }

  // Unique buyers (users who have done at least one topup)
  const uniqueBuyers = new Set(txnsYTD.map((t: any) => t.user_id)).size

  return NextResponse.json({
    stats: {
      revenue_ytd:            revenueYTD,
      revenue_30d:            revenue30d,
      coins_sold_ytd:         coinsYTD,
      coins_sold_30d:         coins30d,
      total_buyers:           uniqueBuyers,
      total_users_with_coins: totalUsersWithCoins,
      coins_held:             totalCoinsHeld,
    },
    monthly_revenue: Object.entries(monthlyRevenue).map(([month, d]) => ({ month, ...d })),
    recent_transactions: recent.map((t: any) => ({
      id:     t.id,
      email:  (t.profiles as any)?.email,
      name:   (t.profiles as any)?.full_name,
      coins:  t.amount,
      date:   t.created_at,
    })),
  })
}

export const dynamic = 'force-dynamic'
