// /app/api/club/wins/route.ts
// GET  — list approved community wins (public) + own wins
// POST — submit a new win
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const [communityRes, myRes] = await Promise.allSettled([
    // Approved community wins (latest 20)
    supabase
      .from('club_wins' as any)
      .select('id, title, description, tool_used, result_metric, created_at, is_featured, profiles!inner(full_name, business_name)')
      .in('status', ['approved', 'featured'])
      .order('approved_at', { ascending: false })
      .limit(20),

    // User's own submissions (all statuses)
    supabase
      .from('club_wins' as any)
      .select('id, title, description, tool_used, result_metric, status, coins_awarded, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    communityWins: communityRes.status === 'fulfilled'
      ? (communityRes.value.data ?? []).map((w: any) => ({
          id:           w.id,
          title:        w.title,
          description:  w.description,
          toolUsed:     w.tool_used,
          resultMetric: w.result_metric,
          isFeatured:   w.is_featured,
          authorName:   (w.profiles as any)?.business_name || (w.profiles as any)?.full_name || 'A Club Member',
          createdAt:    w.created_at,
        }))
      : [],
    myWins: myRes.status === 'fulfilled' ? myRes.value.data ?? [] : [],
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { title, description, toolUsed, resultMetric } = body

  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  // Prevent duplicate pending submissions
  const admin = createAdminClient()
  const { count: pending } = await admin
    .from('club_wins' as any)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')

  if ((pending ?? 0) >= 3) {
    return NextResponse.json({
      error: 'You have 3 pending wins already. Please wait for them to be reviewed.',
    }, { status: 429 })
  }

  const { data, error } = await admin
    .from('club_wins' as any)
    .insert({
      user_id:       user.id,
      title:         title.trim(),
      description:   description.trim(),
      tool_used:     toolUsed?.trim() || null,
      result_metric: resultMetric?.trim() || null,
      status:        'pending',
      coins_awarded: 10,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, winId: data.id })
}

export const dynamic = 'force-dynamic'
