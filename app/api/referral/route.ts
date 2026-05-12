// /app/api/referral/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

const REFERRAL_COINS = 100

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  const converted = (referrals || []).filter((r) => r.status === 'converted').length
  const link      = `${process.env.NEXT_PUBLIC_APP_URL}/waitlist?ref=${user.id.slice(0, 8)}`

  return NextResponse.json({ referrals: referrals || [], total: (referrals || []).length, converted, link })
}

// Called when a referred user subscribes
export async function POST(request: NextRequest) {
  const { referredUserId, referralCode } = await request.json()

  const supabase = await createServerClient()

  // Find the referrer by their code (first 8 chars of user ID)
  const { data: referralRow } = await supabase
    .from('referrals')
    .select('referrer_id, status')
    .eq('referred_user_id', referredUserId)
    .single()

  if (!referralRow || referralRow.status === 'converted') return NextResponse.json({ success: false })

  // Credit the referrer
  await supabase.rpc('credit_coins', {
    p_user_id: referralRow.referrer_id,
    p_amount:  REFERRAL_COINS,
    p_type:    'referral_reward',
    p_description: `Referral reward — ${referredUserId.slice(0, 8)} subscribed`,
  })

  await supabase.from('referrals').update({ status: 'converted', coins_awarded: REFERRAL_COINS }).eq('referred_user_id', referredUserId)

  return NextResponse.json({ success: true, coins: REFERRAL_COINS })
}

export const dynamic = 'force-dynamic'
