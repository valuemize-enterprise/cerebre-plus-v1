// /app/api/billing/create-payment/route.ts
// PHASE 1 UPDATE: Coin top-up only. Plan upgrades removed.
// Coin packs start at ₦5,000 (10 coins). Bulk packs available.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { BULK_PACKS, COIN_BASE_RATE, COIN_MIN_CUSTOM } from '@/lib/coins/economy'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, packId, coinQty, price } = body

  const reference = `cp_${user.id.slice(0, 8)}_${Date.now()}`
  let amount = 0
  let coins  = 0

  if (type === 'topup_bulk') {
    const pack = BULK_PACKS.find(p => p.id === packId)
    if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    amount = pack.price
    coins  = pack.coins

  } else if (type === 'topup_custom') {
    const qty = Math.max(COIN_MIN_CUSTOM, Math.round(coinQty || 0))
    if (qty < COIN_MIN_CUSTOM) {
      return NextResponse.json({ error: `Minimum ${COIN_MIN_CUSTOM} coins` }, { status: 400 })
    }
    amount = price ?? qty * COIN_BASE_RATE
    coins  = qty

  } else {
    return NextResponse.json({ error: 'Invalid type. Use topup_bulk or topup_custom' }, { status: 400 })
  }

  const metadata = {
    user_id:       user.id,
    type,
    pack_id:       packId || null,
    coin_qty:      coinQty || null,
    coins,
    reference,
    is_top_up:     true,
    top_up_coins:  coins,
  }

  return NextResponse.json({ reference, amount, coins, metadata })
}

export const dynamic = 'force-dynamic'
