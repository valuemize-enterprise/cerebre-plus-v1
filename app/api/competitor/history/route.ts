// /app/api/competitor/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit  = Math.min(parseInt(searchParams.get('limit') || '10'), 30)

  const { data, error } = await supabase
    .from('competitor_sessions' as any)
    .select('id,mode,competitor_count,modules_selected,modules_completed,status,progress_pct,coins_spent,created_at,completed_at,competitors,business_snapshot')
    .eq('user_id', user.id)
    .in('status', ['completed','partial','running'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    sessions: (data || []).map(s => ({
      id:           s.id,
      mode:         s.mode,
      count:        s.competitor_count,
      modulesTotal: s.modules_selected?.length || 0,
      modulesComplete: s.modules_completed?.length || 0,
      status:       s.status,
      progress:     s.progress_pct,
      coinsSpent:   s.coins_spent,
      createdAt:    s.created_at,
      completedAt:  s.completed_at,
      competitorNames: (s.competitors as any[])?.map((c: any) => c.name) || [],
    })),
  })
}

export const dynamic = 'force-dynamic'
