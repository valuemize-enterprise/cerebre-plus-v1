// /app/api/ratings/route.ts
// POST — submit a rating for a tool output
// GET  — get the user's own ratings (history)

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

// ── Allowed feedback tags ─────────────────────────────────────
const POSITIVE_TAGS = new Set([
  'used_as_is', 'nailed_voice', 'saved_time',
  'exactly_what_needed', 'better_than_expected', 'gave_new_ideas',
])
const NEGATIVE_TAGS = new Set([
  'too_generic', 'wrong_tone', 'wrong_industry_feel',
  'too_much_editing', 'too_long', 'too_short',
  'missed_brief', 'poor_visual', 'not_worth_coins',
])
const ALL_TAGS = new Set([...POSITIVE_TAGS, ...NEGATIVE_TAGS])

// ── POST — submit rating ──────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const {
    toolId, toolCategory = 'text', generationId,
    thumbs, stars, feedbackTags = [], feedbackText,
    preferredVariant, engine, coinsSpent,
  } = body

  if (!toolId) return NextResponse.json({ error: 'toolId is required' }, { status: 400 })
  if (!thumbs && !stars) return NextResponse.json({ error: 'thumbs or stars rating is required' }, { status: 400 })
  if (thumbs && !['up','down'].includes(thumbs)) return NextResponse.json({ error: 'thumbs must be "up" or "down"' }, { status: 400 })
  if (stars && (stars < 1 || stars > 5)) return NextResponse.json({ error: 'stars must be 1–5' }, { status: 400 })

  // Sanitise tags
  const sanitisedTags = feedbackTags.filter((t: string) => ALL_TAGS.has(t))

  // Get current plan tier
  const { data: sub } = await supabase
    .from('subscriptions').select('plan_tier').eq('user_id', user.id)
    .eq('status','active').single()

  const { data, error } = await supabase.from('output_ratings' as any).insert({
    user_id:          user.id,
    tool_id:          toolId,
    tool_category:    toolCategory,
    generation_id:    generationId || null,
    thumbs:           thumbs || null,
    stars:            stars || null,
    feedback_tags:    sanitisedTags,
    feedback_text:    feedbackText?.slice(0, 1000) || null,
    preferred_variant:preferredVariant || null,
    plan_tier:        sub?.plan_tier || 'free',
    engine:           engine || null,
    coins_spent:      coinsSpent || null,
    had_brand_profile:body.hadBrandProfile || false,
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Trigger stats refresh every 50 ratings (non-blocking)
  void supabase.rpc('refresh_rating_stats' as any)

  return NextResponse.json({ success: true, ratingId: data.id } as any)
}

// ── GET — user's own rating history ──────────────────────────
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get('tool_id')
  const limit  = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  let query = supabase
    .from('output_ratings' as any)
    .select('id, tool_id, thumbs, stars, feedback_tags, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (toolId) query = query.eq('tool_id', toolId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ratings: data })
}

export const dynamic = 'force-dynamic'
