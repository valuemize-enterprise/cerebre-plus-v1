// /app/api/club/hub/route.ts
// Aggregated data for the SME Club member hub dashboard.
// Returns: points, rank, active challenge, recent wins, template count, session stats.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const now = new Date().toISOString()

  const [
    pointsRes,
    challengeRes,
    winsRes,
    myWinsRes,
    templatesRes,
    sessionsRes,
    progressRes,
    myEntryRes,
    joinRes,
  ] = await Promise.allSettled([
    // User's total points
    supabase
      .from('club_points_ledger' as any)
      .select('points')
      .eq('user_id', user.id),

    // Active challenge
    supabase
      .from('club_challenges' as any)
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .order('starts_at', { ascending: false })
      .limit(1)
      .single(),

    // Recent approved community wins (up to 5)
    supabase
      .from('club_wins' as any)
      .select('id, title, description, tool_used, result_metric, created_at, user_id, profiles!inner(full_name, business_name)')
      .in('status', ['approved', 'featured'])
      .order('approved_at', { ascending: false })
      .limit(5),

    // User's own win count
    supabase
      .from('club_wins' as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['approved', 'featured']),

    // Published template count
    supabase
      .from('club_templates' as any)
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),

    // Published session count
    supabase
      .from('sme_club_sessions' as any)
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),

    // User's session progress
    supabase
      .from('sme_club_progress' as any)
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'completed'),

    // User's entry for the active challenge (if any)
    supabase
      .from('club_challenge_entries' as any)
      .select('status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),

    // Whether user has clicked the WhatsApp join button
    supabase
      .from('club_whatsapp_joins' as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  // Compute total points
  const pointRows = pointsRes.status === 'fulfilled' ? (pointsRes.value.data ?? []) : []
  const totalPoints = pointRows.reduce((s: number, r: any) => s + (r.points || 0), 0)

  const rankBreakpoints = [
    { label: 'Growth Partner', min: 1000, next: null, color: '#E09818' },
    { label: 'Operator',       min: 400,  next: 1000, color: '#12D4B4' },
    { label: 'Builder',        min: 100,  next: 400,  color: '#8B5CF6' },
    { label: 'Rookie',         min: 0,    next: 100,  color: '#6B7280' },
  ]
  const rankInfo = rankBreakpoints.find(r => totalPoints >= r.min) ?? rankBreakpoints[rankBreakpoints.length - 1]
  const pctToNext = rankInfo.next
    ? Math.round(((totalPoints - rankInfo.min) / (rankInfo.next - rankInfo.min)) * 100)
    : 100

  return NextResponse.json({
    points: {
      total:       totalPoints,
      rank:        rankInfo.label,
      rankColor:   rankInfo.color,
      nextRank:    rankInfo.next ? rankBreakpoints[rankBreakpoints.indexOf(rankInfo) - 1]?.label : null,
      pointsToNext: rankInfo.next ? rankInfo.next - totalPoints : 0,
      pctToNext,
    },
    challenge: challengeRes.status === 'fulfilled' ? challengeRes.value.data : null,
    myEntry:   myEntryRes.status  === 'fulfilled' ? myEntryRes.value.data  : null,
    recentWins: winsRes.status === 'fulfilled' ? (winsRes.value.data ?? []).map((w: any) => ({
      id:            w.id,
      title:         w.title,
      description:   w.description,
      toolUsed:      w.tool_used,
      resultMetric:  w.result_metric,
      authorName:    (w.profiles as any)?.business_name || (w.profiles as any)?.full_name || 'A Club Member',
    })) : [],
    stats: {
      myWinCount:        myWinsRes.status   === 'fulfilled' ? (myWinsRes.value.count   ?? 0) : 0,
      templateCount:     templatesRes.status === 'fulfilled' ? (templatesRes.value.count ?? 0) : 0,
      sessionCount:      sessionsRes.status  === 'fulfilled' ? (sessionsRes.value.count  ?? 0) : 0,
      sessionsCompleted: progressRes.status  === 'fulfilled' ? (progressRes.value.data?.length ?? 0) : 0,
      hasJoinedWhatsApp: joinRes.status === 'fulfilled' ? (joinRes.value.count ?? 0) > 0 : false,
    },
  })
}

export const dynamic = 'force-dynamic'
