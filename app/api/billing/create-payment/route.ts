// /app/api/billing/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId, isTopUp, topUpCoins } = await request.json()

  // Generate a unique reference
  const reference = `cp_${user.id.slice(0, 8)}_${Date.now()}`

  const metadata = {
    user_id:      user.id,
    plan_id:      planId,
    is_top_up:    isTopUp || false,
    top_up_coins: topUpCoins || 0,
    reference,
  }

  return NextResponse.json({ reference, metadata })
}

export const dynamic = 'force-dynamic'
