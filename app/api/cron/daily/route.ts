import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail }          from '@/lib/email'

export async function GET(request: Request) {
  // Auth check
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CEREBRE_CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now   = new Date()

  // ── Day 1 nudge ──────────────────────────────────────────
  // Users who signed up ~24h ago with no tool generation
  const yesterday = new Date(now.getTime() - 24 * 3600_000).toISOString()
  const { data: day1Users } = await admin
    .from('profiles')
    .select('id, email, created_at')
    .gte('created_at', new Date(now.getTime() - 26 * 3600_000).toISOString())
    .lte('created_at', yesterday)
    .not('id', 'in',
      admin.from('coin_transactions').select('user_id').eq('type', 'deduction')
    )

  for (const u of day1Users ?? []) {
    await sendEmail({ to: (u as any).email, template: 'day1_nudge', data: { firstName: 'there', completeness: 40 } })
  }

  // ── Day 3 nudge ──────────────────────────────────────────
  // Users who signed up ~72h ago with still no generation
  const threeDaysAgo = new Date(now.getTime() - 72 * 3600_000).toISOString()
  const { data: day3Users } = await admin
    .from('profiles')
    .select('id, email')
    .gte('created_at', new Date(now.getTime() - 74 * 3600_000).toISOString())
    .lte('created_at', threeDaysAgo)
    .not('id', 'in',
      admin.from('coin_transactions').select('user_id').eq('type', 'deduction')
    )

  for (const u of day3Users ?? []) {
    await sendEmail({ to: (u as any).email, template: 'day3_nudge', data: { firstName: 'there' } })
  }

  // ── Trial ending soon (7 days) ───────────────────────────
  const in7 = new Date(now.getTime() + 7 * 86400_000)
  const { data: ending7 } = await admin
    .from('subscriptions')
    .select('user_id, profiles!inner(email)')
    .eq('plan_tier', 'free').eq('status', 'active')
    .gte('free_expires_at', new Date(in7.getTime() - 3600_000).toISOString())
    .lte('free_expires_at', new Date(in7.getTime() + 3600_000).toISOString())

  for (const s of ending7 ?? []) {
    const p = (s as any).profiles
    await sendEmail({ to: p.email, template: 'trial_ending_soon', data: { firstName: 'there', daysLeft: 7 } })
  }

  // ── Trial ending soon (3 days) ───────────────────────────
  const in3 = new Date(now.getTime() + 3 * 86400_000)
  const { data: ending3 } = await admin
    .from('subscriptions')
    .select('user_id, profiles!inner(email)')
    .eq('plan_tier', 'free').eq('status', 'active')
    .gte('free_expires_at', new Date(in3.getTime() - 3600_000).toISOString())
    .lte('free_expires_at', new Date(in3.getTime() + 3600_000).toISOString())

  for (const s of ending3 ?? []) {
    const p = (s as any).profiles
    await sendEmail({ to: p.email, template: 'trial_ending_soon', data: { firstName: 'there', daysLeft: 3 } })
  }

  // ── Trial expired (today) ─────────────────────────────────
  const { data: expired } = await admin
    .from('subscriptions')
    .select('user_id, profiles!inner(email)')
    .eq('plan_tier', 'free')
    .lt('free_expires_at', now.toISOString())
    .eq('status', 'active')  // Not yet marked expired (cron will mark it after)

  for (const s of expired ?? []) {
    const p = (s as any).profiles
    await sendEmail({ to: p.email, template: 'trial_expired', data: { firstName: 'there' } })
  }

  // ── Expire free plans ─────────────────────────────────────
  await admin.rpc('expire_free_plans' as any)

  return Response.json({ ok: true })
}