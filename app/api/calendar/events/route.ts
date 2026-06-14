// /app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

// GET — fetch events for a month
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const monthYear = searchParams.get('month') // '2025-06'
  if (!monthYear) return NextResponse.json({ error: 'month param required (YYYY-MM)' }, { status: 400 })

  const { data, error } = await supabase
    .from('content_calendar_events' as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('month_year', monthYear)
    .order('scheduled_date', { ascending: true })
    .order('sort_order',     { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data ?? [] })
}

// POST — create a single event (manual add)
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { scheduled_date, platform, content_type, caption, hashtags, visual_note, best_time, generation_id } = body
  if (!scheduled_date || !platform || !content_type) {
    return NextResponse.json({ error: 'scheduled_date, platform, and content_type are required' }, { status: 400 })
  }

  const monthYear = scheduled_date.slice(0, 7) // '2025-06-15' → '2025-06'

  const { data, error } = await supabase.from('content_calendar_events' as any).insert({
    user_id: user.id, month_year: monthYear, scheduled_date,
    platform, content_type, caption, hashtags, visual_note, best_time, generation_id,
  }).select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}

// PATCH — update status or content of an event
export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const allowed = ['status', 'caption', 'hashtags', 'visual_note', 'best_time', 'platform', 'content_type']
  const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))

  const { data, error } = await supabase
    .from('content_calendar_events' as any)
    .update(safeUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}

// DELETE
export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabase.from('content_calendar_events' as any).delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
