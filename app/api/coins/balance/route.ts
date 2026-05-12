// /app/api/coins/balance/route.ts
import { NextResponse }       from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCachedBalance, setCachedBalance } from '@/lib/performance/cache'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Try cache first (30s TTL)
  const cached = await getCachedBalance(user.id)
  if (cached !== null) return NextResponse.json({ balance: cached })

  const { data } = await supabase
    .from('coin_balances')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  const balance = data?.balance ?? 0
  await setCachedBalance(user.id, balance)
  return NextResponse.json({ balance })
}

export const dynamic = 'force-dynamic'
