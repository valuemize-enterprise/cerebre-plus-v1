// /app/api/billing/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { invalidateBalance }         from '@/lib/performance/cache'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reference, planId, isTopUp, topUpCoins } = await request.json()

  // Verify with Paystack
  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  })
  const { data: txData } = await verifyRes.json()

  if (txData?.status !== 'success') {
    return NextResponse.json({ success: false, error: 'Payment not verified' }, { status: 400 })
  }

  // Idempotency: check if we've already processed this reference
  const { data: existing } = await supabase
    .from('coin_transactions')
    .select('id')
    .eq('description', `paystack:${reference}`)
    .single()

  if (existing) return NextResponse.json({ success: true, message: 'Already processed' })

  if (isTopUp && topUpCoins) {
    await supabase.rpc('credit_coins', {
      p_user_id: user.id, p_amount: topUpCoins,
      p_type: 'topup_purchase', p_description: `paystack:${reference}`,
    })
    await invalidateBalance(user.id)
    return NextResponse.json({ success: true, coins_added: topUpCoins })
  }

  // Subscription upgrade
  const PLAN_COINS: Record<string, number> = { starter: 100, growth: 250, premium: 650 }
  const coins = PLAN_COINS[planId] || 0
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await Promise.all([
    supabase.from('subscriptions').upsert({
      user_id: user.id, plan_tier: planId, status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
    }, { onConflict: 'user_id' }),
    supabase.rpc('credit_coins', {
      p_user_id: user.id, p_amount: coins,
      p_type: 'subscription_renewal', p_description: `paystack:${reference}`,
    }),
  ])

  await invalidateBalance(user.id)
  return NextResponse.json({ success: true, plan: planId, coins_added: coins })
}

export const dynamic = 'force-dynamic'
