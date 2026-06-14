// /app/api/admin/ratings/route.ts
// Admin-only: tool satisfaction stats, tag frequencies, recent feedback

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const view  = searchParams.get('view') || 'overview'  // overview | tool | recent | tags
  const days  = parseInt(searchParams.get('days') || '30')
  const toolId= searchParams.get('tool_id')

  const since = new Date(Date.now() - days * 86400_000).toISOString()

  if (view === 'overview') {
    // Platform-level satisfaction summary
    const [statsRes, byToolRes, recentRes] = await Promise.all([
      admin.rpc('get_platform_satisfaction' as any, { p_days: days }),
      admin.from('tool_rating_stats' as any).select('*').order('total_ratings', { ascending: false }),
      admin.from('output_ratings' as any)
        .select('tool_id, thumbs, stars, feedback_text, feedback_tags, plan_tier, created_at')
        .not('feedback_text', 'is', null)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    return NextResponse.json({
      platform:   statsRes.data?.[0] ?? {},
      by_tool:    byToolRes.data ?? [],
      recent_text:recentRes.data ?? [],
    })
  }

  if (view === 'tool' && toolId) {
    // Drill-down for a specific tool
    const [statsRes, tagsRes, trendRes] = await Promise.all([
      admin.from('output_ratings' as any)
        .select('thumbs, stars, plan_tier, engine, coins_spent')
        .eq('tool_id', toolId)
        .gte('created_at', since),
      admin.from('output_ratings' as any)
        .select('feedback_tags')
        .eq('tool_id', toolId)
        .gte('created_at', since),
      admin.from('output_ratings' as any)
        .select('thumbs, DATE(created_at) AS day')
        .eq('tool_id', toolId)
        .gte('created_at', since)
        .order('created_at', { ascending: true }),
    ])

    const ratings = statsRes.data ?? []
    const up   = ratings.filter((r: any) => r.thumbs === 'up').length
    const down = ratings.filter((r: any) => r.thumbs === 'down').length

    // Flatten and count tags
    const tagCounts: Record<string, number> = {}
    ;(tagsRes.data ?? []).forEach((r: any) => {
      ;(r.feedback_tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

    return NextResponse.json({
      tool_id:          toolId,
      total:            ratings.length,
      thumbs_up:        up,
      thumbs_down:      down,
      satisfaction_pct: ratings.length ? Math.round(up / ratings.length * 100) : 0,
      avg_stars:        ratings.filter((r: any) => r.stars).reduce((s: number, r: any) => s + r.stars, 0) / (ratings.filter((r: any) => r.stars).length || 1),
      top_tags:         sortedTags.slice(0, 10),
      daily_trend:      trendRes.data ?? [],
    })
  }

  if (view === 'tags') {
    // Tag frequency across all tools
    const { data } = await admin.from('output_ratings' as any).select('tool_id, thumbs, feedback_tags').gte('created_at', since)
    const tagCounts: Record<string, { positive: number; negative: number }> = {}
    ;(data ?? []).forEach((r: any) => {
      ;(r.feedback_tags || []).forEach((tag: string) => {
        if (!tagCounts[tag]) tagCounts[tag] = { positive: 0, negative: 0 }
        if (r.thumbs === 'up')   tagCounts[tag].positive++
        if (r.thumbs === 'down') tagCounts[tag].negative++
      })
    })
    return NextResponse.json({ tag_breakdown: tagCounts })
  }

  return NextResponse.json({ error: 'Unknown view' }, { status: 400 })
}

export const dynamic = 'force-dynamic'

// POST — refresh the materialized view (called from admin UI)
export async function POST(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const { searchParams } = new URL(request.url)
  if (searchParams.get('action') === 'refresh') {
    const admin = createAdminClient()
    await admin.rpc('refresh_rating_stats' as any)
    return NextResponse.json({ success: true, refreshed_at: new Date().toISOString() })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
