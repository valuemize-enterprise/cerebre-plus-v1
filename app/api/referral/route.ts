// /app/api/referral/route.ts
// GET  — returns referral stats + history for the current user
// POST — called by Paystack webhook when a referred user subscribes;
//        credits referrer coins atomically and marks referral converted.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { sendEmail }                 from '@/lib/email'

// Coin rewards per plan tier referred
const REFERRAL_REWARDS: Record<string, number> = {
  starter: 5,
  growth:  10,
}

// ─────────────────────────────────────────────────────────────
// GET — referral stats + history
// ─────────────────────────────────────────────────────────────
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const referralCode = user.id.replace(/-/g, '').slice(0, 8).toUpperCase()
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL || 'https://cerebreplus.com'

  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, referred_email, referred_plan, status, coins_earned, created_at, converted_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const list = referrals ?? []

  return NextResponse.json({
    code:         referralCode,
    link:         `${appUrl}/signup?ref=${referralCode}`,
    total:        list.length,
    converted:    list.filter((r: any) => r.status === 'converted').length,
    coins_earned: list.reduce((acc: number, r: any) => acc + (r.coins_earned ?? 0), 0),
    referrals:    list.map((r: any) => ({
      id:           r.id,
      email:        r.referred_email,
      referred_plan: r.referred_plan,
      status:       r.status,
      coins_earned: r.coins_earned,
      created_at:   r.created_at,
      converted_at: r.converted_at,
    })),
  })
}

// ─────────────────────────────────────────────────────────────
// POST — called by Paystack webhook when referred user subscribes
// Body: { referred_user_id, plan_tier }
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Internal webhook call — protected by secret header
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.CEREBRE_CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { referred_user_id, plan_tier } = await request.json()
  if (!referred_user_id || !plan_tier) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Find the referral record
  const { data: referral } = await admin
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referred_user_id', referred_user_id)
    .eq('status', 'pending')
    .single()

  if (!referral) {
    // No pending referral found — normal for non-referred users
    return NextResponse.json({ ok: true, credited: false })
  }

  const coinsToAward = REFERRAL_REWARDS[plan_tier] ?? 0
  if (coinsToAward === 0) {
    return NextResponse.json({ ok: true, credited: false, reason: 'no reward for this plan' })
  }

  // 2. Credit coins atomically
  const { error: creditErr } = await admin.rpc('credit_coins', {
    p_user_id:    referral.referrer_id,
    p_amount:     coinsToAward,
    p_type:       'referral',
    p_description: `Referral reward — ${plan_tier} plan`,
  })
  if (creditErr) {
    console.error('[referral] credit_coins error:', creditErr)
    return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 })
  }

  // 3. Mark referral converted
  await admin
    .from('referrals')
    .update({
      status:       'converted',
      referred_plan: plan_tier,
      coins_earned: coinsToAward,
      converted_at: new Date().toISOString(),
    })
    .eq('id', referral.id)

  // 4. Get referrer profile for email
  const referrerRes = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', referral.referrer_id)
    .single()
  const referrerProfile = referrerRes.data as { email?: string; full_name?: string } | null

  // 5. Send referral success email
  if (referrerProfile && referrerProfile.email) {
    await sendEmail({
      to:       referrerProfile.email,
      template: 'referral_success',
      data:     {
        firstName:  referrerProfile.full_name || 'there',
        planTier:   plan_tier,
        coinsEarned: coinsToAward,
      },
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true, credited: true, coins: coinsToAward })
}

export const dynamic = 'force-dynamic'
