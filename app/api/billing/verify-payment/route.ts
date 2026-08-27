// /app/api/billing/verify-payment/route.ts
// PHASE 1 UPDATE: Coin top-up only. Subscription handling removed.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { invalidateBalance } from '@/lib/performance/cache'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reference, topUpCoins } = await request.json()

  if (!topUpCoins || topUpCoins <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid coin amount' }, { status: 400 })
  }

  // Verify with Paystack
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  )
  const { data: txData } = await verifyRes.json()

  if (txData?.status !== 'success') {
    return NextResponse.json({ success: false, error: 'Payment not verified' }, { status: 400 })
  }

  // Idempotency check — prevent double-crediting
  const { data: existing } = await supabase
    .from('coin_transactions')
    .select('id')
    .eq('description', `paystack:${reference}`)
    .single()

  if (existing) return NextResponse.json({ success: true, message: 'Already processed' })

  // Credit coins
  const { error: creditError } = await supabase.rpc('credit_coins', {
    p_user_id:    user.id,
    p_amount:     topUpCoins,
    p_type:       'topup',
    p_description: `paystack:${reference}`,
  })

  if (creditError) {
    console.error('[verify-payment] credit_coins failed:', creditError)
    return NextResponse.json({ success: false, error: 'Failed to credit coins. Contact support.' }, { status: 500 })
  }

  await invalidateBalance(user.id)
  return NextResponse.json({ success: true, coins_added: topUpCoins })
}

export const dynamic = 'force-dynamic'
