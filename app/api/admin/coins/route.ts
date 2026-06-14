// /app/api/admin/coins/route.ts
// Coin economy overview and grant coins.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'
import { logAction, A }              from '@/lib/admin/audit'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'grant_coins')) return forbidden()

  const admin = createAdminClient()

  const [profilesRes, txnsRes] = await Promise.allSettled([
    admin.from('profiles').select('id, email, first_name, last_name, coin_balance, account_status'),
    admin.from('coin_transactions').select('amount, type, created_at, user_id, profiles!left(email, first_name, last_name)').order('created_at', { ascending: false }).limit(50),
  ])

  const profiles = profilesRes.status === 'fulfilled' ? (profilesRes.value.data ?? []) : []
  const txns     = txnsRes.status === 'fulfilled' ? (txnsRes.value.data ?? []) : []

  const totalCoinsInCirculation = profiles.reduce((sum: number, p: any) => sum + (p.coin_balance || 0), 0)
  const activeUsers             = profiles.filter((p: any) => p.account_status !== 'suspended').length

  return NextResponse.json({
    stats: {
      total_coins_in_circulation: totalCoinsInCirculation,
      active_users: activeUsers,
      avg_coins_per_user: activeUsers > 0 ? Math.round(totalCoinsInCirculation / activeUsers) : 0,
    },
    recent_transactions: txns.map((t: any) => ({
      id: t.id,
      user: [t.profiles?.first_name, t.profiles?.last_name].filter(Boolean).join(' ') || t.profiles?.email,
      amount: t.amount,
      type: t.type,
      date: t.created_at,
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'grant_coins')) return forbidden()

  const { userEmail, amount, reason } = await request.json()

if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
  return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
}

if (!amount || amount <= 0) {
  return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
}

  const admin = createAdminClient()
  const { error } = await admin.rpc('admin_grant_coins' as any, {
    p_user_email: userEmail,
    p_amount: amount,
    p_reason: reason || 'Admin grant',
    p_granted_by: session.adminId,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAction(session, A.GRANT_COINS, 'user', userEmail, { amount, reason })

  return NextResponse.json({ ok: true, amount, message: `${amount} coins granted` })
}

export const dynamic = 'force-dynamic'
