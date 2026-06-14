// /app/api/sme-club/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Get user's plan tier
  const { data: sub } = await supabase
    .from('subscriptions').select('plan_tier').eq('user_id', user.id).eq('status','active').single()
  const isGrowth = sub?.plan_tier === 'growth'

  // Fetch published sessions (+ free previews for all plans)
  const query = supabase
    .from('sme_club_sessions' as any)
    .select('id,session_number,title,description,category,thumbnail_url,duration_minutes,key_takeaways,is_free_preview,scheduled_for,resources')
    .eq('is_published', true)
    .lte('scheduled_for', new Date().toISOString().slice(0,10))
    .order('session_number', { ascending: true })

  const { data: sessions } = await query

  // Get user's progress on all sessions
  const { data: progress } = await supabase
    .from('sme_club_progress' as any)
    .select('session_id, status, completed_at')
    .eq('user_id', user.id)

  const progressMap: Record<string, { status: string; completedAt: string | null }> = {}
  progress?.forEach(p => { progressMap[p.session_id] = { status: p.status, completedAt: p.completed_at } })

  // Tag sessions with access + progress
  const tagged = (sessions ?? []).map(s => ({
    ...s,
    accessible:   isGrowth || s.is_free_preview,
    progress:     progressMap[s.id] ?? { status: 'not_started', completedAt: null },
  }))

  return NextResponse.json({ sessions: tagged, isGrowth })
}

export const dynamic = 'force-dynamic'
