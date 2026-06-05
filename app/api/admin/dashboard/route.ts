import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin = createAdminClient()
  const d7    = new Date(Date.now() - 7 * 86400_000).toISOString()
  const in7   = new Date(Date.now() + 7 * 86400_000).toISOString()

  const [total, subs, newToday, expiring, recent] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('subscriptions').select('plan_tier, status'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 86400_000).toISOString()),
    admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_tier','free').eq('status','active').lte('free_expires_at', in7),
    admin.from('profiles').select('id, email, first_name, last_name, created_at, subscriptions!left(plan_tier)').order('created_at', { ascending: false }).limit(10),
  ])

  const allSubs = subs.data || []
  const starter = allSubs.filter(s => s.plan_tier === 'starter').length
  const growth  = allSubs.filter(s => s.plan_tier === 'growth').length
  const free    = allSubs.filter(s => s.plan_tier === 'free').length
  const paid    = starter + growth
  const mrr     = (starter * 20000 + growth * 80000) / 12

  return NextResponse.json({
    stats: {
      total_users:    total.count || 0,
      paid_users:     paid,
      free_users:     free,
      starter_users:  starter,
      growth_users:   growth,
      new_today:      newToday.count || 0,
      expiring_soon:  expiring.count || 0,
      mrr:            Math.round(mrr),
    },
    recent_users: (recent.data || []).map((u: any) => ({
      ...u,
      subscription_tier: u.subscriptions?.[0]?.plan_tier || 'free',
    })),
  })
}
export const dynamic = 'force-dynamic'