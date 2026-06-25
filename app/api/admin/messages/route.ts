// /app/api/admin/messages/route.ts
// POST — send a message to a user segment.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'
import { logAction, A }              from '@/lib/admin/audit'
import { sendEmail }                 from '@/lib/email'

export async function POST(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'send_user_email')) return forbidden()

  const { segment, subject, body } = await request.json()

  if (!segment || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'segment, subject, and body are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const now   = new Date()

  // Build query based on segment
  let query = (admin as any).from('profiles').select('id, email, full_name')

  if (segment === 'free') {
    // Free trial users
    const { data: subs } = await admin.from('subscriptions').select('user_id').eq('plan_tier','free').eq('status','active')
    const ids = (subs ?? []).map((s:any) => s.user_id)
    if (!ids.length) return NextResponse.json({ message: 'No users in this segment', count: 0 })
    query = query.in('id', ids)
  } else if (segment === 'starter') {
    const { data: subs } = await admin.from('subscriptions').select('user_id').eq('plan_tier','starter').eq('status','active')
    const ids = (subs ?? []).map((s:any) => s.user_id)
    if (!ids.length) return NextResponse.json({ message: 'No users in this segment', count: 0 })
    query = query.in('id', ids)
  } else if (segment === 'growth') {
    const { data: subs } = await admin.from('subscriptions').select('user_id').eq('plan_tier','growth').eq('status','active')
    const ids = (subs ?? []).map((s:any) => s.user_id)
    if (!ids.length) return NextResponse.json({ message: 'No users in this segment', count: 0 })
    query = query.in('id', ids)
  } else if (segment === 'expiring') {
    const in7 = new Date(now.getTime() + 7 * 86400_000).toISOString()
    const { data: subs } = await admin.from('subscriptions').select('user_id').eq('plan_tier','free').eq('status','active').lte('free_expires_at', in7).gte('free_expires_at', now.toISOString())
    const ids = (subs ?? []).map((s:any) => s.user_id)
    if (!ids.length) return NextResponse.json({ message: 'No trials expiring in 7 days', count: 0 })
    query = query.in('id', ids)
  } else if (segment === 'inactive') {
    const d30 = new Date(now.getTime() - 30 * 86400_000).toISOString()
    const { data: txns } = await admin.from('coin_transactions').select('user_id').gte('created_at', d30).eq('type','deduction')
    const activeIds = new Set((txns ?? []).map((t:any) => t.user_id))
    // Get all users and exclude active ones
    const { data: allUsers } = await (admin as any).from('profiles').select('id, email, first_name')
    const inactiveUsers = (allUsers ?? []).filter((u:any) => !activeIds.has(u.id))
    if (!inactiveUsers.length) return NextResponse.json({ message: 'No inactive users found', count: 0 })

    // Send to inactive users directly
    let sentCount = 0
    for (const user of inactiveUsers.slice(0, 500)) {
      const personalBody = body.replace(/\[first_name\]/gi, user.first_name || 'there')
      await sendEmail({ to: user.email, template: 'admin_message', data: { firstName: user.first_name || 'there', subject, message: personalBody } }).catch(() => {})
      sentCount++
    }
    await logAction(session, 'send_bulk_message', 'users', 'bulk', { segment, subject, count: sentCount })
    return NextResponse.json({ message: `Message sent successfully`, count: sentCount })
  }
  // segment === 'all' — no extra filter needed

  const { data: users, error } = await query.limit(1000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!users?.length) return NextResponse.json({ message: 'No users in this segment', count: 0 })

  // Send in batches
  let sentCount = 0
  for (const user of users) {
    const personalBody = body.replace(/\[first_name\]/gi, user.first_name || 'there')
    await sendEmail({
      to:       user.email,
      template: 'admin_message',
      data:     { firstName: user.first_name || 'there', subject, message: personalBody },
    }).catch(() => {}) // don't let one failure stop the batch
    sentCount++
  }

  await logAction(session, 'send_bulk_message', 'users', 'bulk', { segment, subject, count: sentCount })

  return NextResponse.json({
    message: `Message sent successfully to ${sentCount} user${sentCount !== 1 ? 's' : ''}`,
    count:   sentCount,
  })
}

export const dynamic = 'force-dynamic'
