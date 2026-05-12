// /app/api/billing/subscription/route.ts
import { NextResponse }       from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json(data || { plan_tier: 'free', status: 'inactive' })
}
export const dynamic = 'force-dynamic'
