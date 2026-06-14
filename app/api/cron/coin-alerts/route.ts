// /app/api/cron/coin-alerts/route.ts
// Runs every day at 9:00 AM WAT (8:00 AM UTC).
// Finds users whose coin balance has dropped below threshold and sends an alert.
// Schedule in vercel.json: { "path": "/api/cron/coin-alerts", "schedule": "0 8 * * *" }

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { sendCoinAlert }             from '@/lib/email/sender'

const ALERT_THRESHOLD = 20  // coins

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find users with low balance who haven't been alerted in 72 hours
  const { data: lowUsers } = await admin
    .from('coin_balances')
    .select('user_id, balance')
    .lt('balance', ALERT_THRESHOLD)
    .gt('balance', 0)  // don't alert empty accounts (they'd have gotten the previous alert)

  let sent = 0, skipped = 0

  for (const row of (lowUsers ?? [])) {
    // Get plan tier
    const { data: sub } = await admin
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', row.user_id)
      .eq('status', 'active')
      .single()

    const result = await sendCoinAlert(row.user_id, row.balance, sub?.plan_tier ?? 'free')
    // sendCoinAlert internally deduplicates — returns success even if skipped
    if (result?.success) sent++
    else skipped++
  }

  return NextResponse.json({ success: true, checked: lowUsers?.length ?? 0, sent, skipped })
}

export const dynamic = 'force-dynamic'
