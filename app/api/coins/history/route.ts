// /app/api/coins/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit  = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10)
  const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0', 10)

  const { data: transactions, count } = await supabase
    .from('coin_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ transactions: transactions || [], total: count || 0 })
}

export const dynamic = 'force-dynamic'
