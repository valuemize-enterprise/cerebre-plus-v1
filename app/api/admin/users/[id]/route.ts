// /app/api/admin/users/[id]/route.ts
// GET  — full user profile
// POST — execute a management action on a user

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'
import { logAction, A }              from '@/lib/admin/audit'
import { sendEmail }                 from '@/lib/email'

// ── GET — full user profile ────────────────────────────────────
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'view_users')) return forbidden()

  const admin = createAdminClient()
  const uid   = params.id

  const [{ data: profile }, { data: sub }, { data: coins }, { data: txns }, { data: authUser }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', uid).single(),
    admin.from('subscriptions').select('*').eq('user_id', uid).single(),
    admin.from('coin_balances').select('balance').eq('user_id', uid).single(),
    admin.from('coin_transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    admin.auth.admin.getUserById(uid),
  ])

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const smeClubOverride = (profile as { sme_club_override?: boolean })?.sme_club_override
  const accountStatus = (profile as { account_status?: string })?.account_status || 'active'

  await logAction(session, A.VIEW_USER, 'user', uid, {})

  return NextResponse.json({
    ...profile,
    subscription:     sub,
    coin_balance:     coins?.balance || 0,
    recent_transactions: txns || [],
    last_sign_in_at:  authUser?.user?.last_sign_in_at,
    sme_club_member:  sub?.plan_tier === 'growth' || smeClubOverride === true,
    account_status:   accountStatus,
  })
}

// ── POST — management actions ──────────────────────────────────
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin  = createAdminClient()
  const uid    = params.id
  const body   = await request.json()
  const action = body.action as string

  // Verify user exists
  const { data: profile } = await admin.from('profiles').select('full_name, email').eq('id', uid).single()
  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  switch (action) {

    case 'change_plan': {
      if (!hasPermission(session.role, 'edit_user_plan')) return forbidden()
      const { plan } = body
      if (!['free','starter','growth'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

      if (plan !== 'free') {
        const { plans: { [plan as 'starter'|'growth']: planDef } } = await import('@/lib/coins/economy').then(m => ({ plans: m.PLANS }))
        await admin.rpc('activate_annual_plan' as any, { p_user_id: uid, p_plan_id: plan, p_coins: planDef.coins, p_reference: `admin_upgrade_${Date.now()}` })
      } else {
        await admin.from('subscriptions').update({ plan_tier: 'free', status: 'active', billing_cycle: 'one-time', free_expires_at: new Date(Date.now() + 30 * 86400_000).toISOString() }).eq('user_id', uid)
      }
      await logAction(session, A.UPGRADE_PLAN, 'subscription', uid, { from: '?', to: plan })
      return NextResponse.json({ message: `Plan changed to ${plan}` })
    }

    case 'grant_coins': {
      if (!hasPermission(session.role, 'grant_coins')) return forbidden()
      const { coins } = body
      if (!coins || coins <= 0) return NextResponse.json({ error: 'Invalid coin amount' }, { status: 400 })
      await admin.rpc('credit_coins' as any, { p_user_id: uid, p_amount: coins, p_type: 'admin_grant', p_description: `Admin grant by ${session.email}` })
      await logAction(session, A.GRANT_COINS, 'coin_balance', uid, { coins, granted_by: session.email })
      return NextResponse.json({ message: `${coins} coins granted` })
    }

    case 'send_email': {
      if (!hasPermission(session.role, 'send_user_email')) return forbidden()
      const { message } = body
      if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })
      const { data: authUser } = await admin.auth.admin.getUserById(uid)
      const email = authUser?.user?.email
      if (!email) return NextResponse.json({ error: 'User email not found' }, { status: 404 })
      // Send as a direct admin message (reuses the email utility)
      await sendEmail({ to: email, template: 'welcome', data: { firstName: (profile as { full_name?: string }).full_name || 'there', adminMessage: message } }).catch(() => {})
      await logAction(session, A.SEND_EMAIL, 'user', uid, { preview: message.slice(0, 100) })
      return NextResponse.json({ message: 'Email sent' })
    }

    case 'suspend': {
      if (!hasPermission(session.role, 'suspend_user')) return forbidden()
      await admin.from('profiles').update({ account_status: 'suspended' } as any).eq('id', uid)
      await admin.auth.admin.updateUserById(uid, { ban_duration: '87600h' })
      await logAction(session, A.SUSPEND_USER, 'user', uid, {})
      return NextResponse.json({ message: 'Account suspended' })
    }

    case 'unsuspend': {
      if (!hasPermission(session.role, 'suspend_user')) return forbidden()
      await admin.from('profiles').update({ account_status: 'active' } as any).eq('id', uid)
      await admin.auth.admin.updateUserById(uid, { ban_duration: 'none' })
      await logAction(session, A.UNSUSPEND_USER, 'user', uid, {})
      return NextResponse.json({ message: 'Account unsuspended' })
    }

    case 'delete_user': {
      if (!hasPermission(session.role, 'delete_user')) return forbidden('Only Super Admins can delete users')
      const { data: authUser } = await admin.auth.admin.getUserById(uid)
      await logAction(session, A.DELETE_USER, 'user', uid, { email: authUser?.user?.email })
      await admin.auth.admin.deleteUser(uid)
      return NextResponse.json({ message: 'User deleted permanently' })
    }

    case 'add_sme_club': {
      if (!hasPermission(session.role, 'manage_sme_club')) return forbidden()
      await admin.from('profiles').update({ sme_club_override: true } as any).eq('id', uid)
      await logAction(session, A.ADD_SME_CLUB, 'user', uid, {})
      return NextResponse.json({ message: 'Added to SME Club' })
    }

    case 'remove_sme_club': {
      if (!hasPermission(session.role, 'manage_sme_club')) return forbidden()
      await admin.from('profiles').update({ sme_club_override: false } as any).eq('id', uid)
      await logAction(session, A.REMOVE_SME_CLUB, 'user', uid, {})
      return NextResponse.json({ message: 'Removed from SME Club' })
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }
}

export const dynamic = 'force-dynamic'
