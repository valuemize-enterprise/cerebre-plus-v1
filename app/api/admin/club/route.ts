// /app/api/admin/club/route.ts
// Admin: approve wins, approve challenge entries, manage templates.
// PATCH /api/admin/club?action=approve_win&id=...
// PATCH /api/admin/club?action=approve_entry&id=...
// PATCH /api/admin/club?action=update_hot_seat&id=...
// GET   /api/admin/club — dashboard summary
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin = createAdminClient()

  const [winsRes, entriesRes, hotSeatRes, templatesRes] = await Promise.allSettled([
    // Pending wins
    admin
      .from('club_wins' as any)
      .select('id, user_id, title, description, tool_used, result_metric, status, created_at, profiles!inner(full_name, business_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),

    // Pending challenge entries
    admin
      .from('club_challenge_entries' as any)
      .select('id, user_id, challenge_id, submission_text, submission_url, status, created_at, profiles!inner(full_name, email), club_challenges!inner(title, coin_reward, point_reward)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),

    // Pending hot seat applications
    admin
      .from('club_hot_seat_applications' as any)
      .select('id, user_id, business_name, biggest_challenge, desired_outcome, available_dates, status, created_at, profiles!inner(full_name, email)')
      .in('status', ['pending'])
      .order('created_at', { ascending: true }),

    // Published template count
    admin
      .from('club_templates' as any)
      .select('id, title, is_published, download_count, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return NextResponse.json({
    pendingWins:    winsRes.status    === 'fulfilled' ? winsRes.value.data    ?? [] : [],
    pendingEntries: entriesRes.status === 'fulfilled' ? entriesRes.value.data ?? [] : [],
    pendingHotSeat: hotSeatRes.status === 'fulfilled' ? hotSeatRes.value.data ?? [] : [],
    templates:      templatesRes.status === 'fulfilled' ? templatesRes.value.data ?? [] : [],
  })
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin  = createAdminClient()
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const id     = searchParams.get('id')

  if (!action || !id) return NextResponse.json({ error: 'action and id required' }, { status: 400 })

  const body = await request.json().catch(() => ({}))

  // ── Approve a win ───────────────────────────────────────────
  if (action === 'approve_win') {
    const { featured = false } = body

    const { data: win } = await admin
      .from('club_wins' as any)
      .select('user_id, coins_awarded')
      .eq('id', id)
      .single()

    if (!win) return NextResponse.json({ error: 'Win not found' }, { status: 404 })

    await admin.from('club_wins' as any).update({
      status:      featured ? 'featured' : 'approved',
      is_featured: featured,
      approved_at: new Date().toISOString(),
    }).eq('id', id)

    await admin.rpc('award_club_points' as any, {
      p_user_id:   win.user_id,
      p_points:    20,
      p_action:    'win_approved',
      p_reference: id,
      p_notes:     featured ? 'Featured win approved' : 'Win approved',
      p_coins:     win.coins_awarded ?? 10,
    })

    return NextResponse.json({ ok: true })
  }

  // ── Reject a win ────────────────────────────────────────────
  if (action === 'reject_win') {
    await admin.from('club_wins' as any)
      .update({ status: 'rejected' })
      .eq('id', id)
    return NextResponse.json({ ok: true })
  }

  // ── Approve a challenge entry ────────────────────────────────
  if (action === 'approve_entry') {
    const { data: entry } = await admin
      .from('club_challenge_entries' as any)
      .select('user_id, challenge_id, club_challenges!inner(coin_reward, point_reward)')
      .eq('id', id)
      .single()

    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

    const challenge = (entry as any).club_challenges
    const coins     = challenge?.coin_reward  ?? 50
    const points    = challenge?.point_reward ?? 100

    await admin.from('club_challenge_entries' as any).update({
      status:         'approved',
      coins_awarded:  coins,
      points_awarded: points,
      approved_at:    new Date().toISOString(),
    }).eq('id', id)

    await admin.rpc('award_club_points' as any, {
      p_user_id:   entry.user_id,
      p_points:    points,
      p_action:    'challenge_complete',
      p_reference: entry.challenge_id,
      p_notes:     'Challenge entry approved',
      p_coins:     coins,
    })

    return NextResponse.json({ ok: true })
  }

  // ── Update hot seat status ───────────────────────────────────
  if (action === 'update_hot_seat') {
    const { status, notes } = body
    await admin.from('club_hot_seat_applications' as any)
      .update({ status, notes: notes ?? null })
      .eq('id', id)

    // Award 100 coins + 200 points when scheduled for hot seat
    if (status === 'scheduled') {
      const { data: app } = await admin
        .from('club_hot_seat_applications' as any)
        .select('user_id')
        .eq('id', id)
        .single()

      if (app) {
        await admin.rpc('award_club_points' as any, {
          p_user_id:   app.user_id,
          p_points:    200,
          p_action:    'hot_seat',
          p_reference: id,
          p_notes:     'Selected for the Hot Seat session',
          p_coins:     100,
        })
      }
    }
    return NextResponse.json({ ok: true })
  }

  // ── Publish/unpublish a template ─────────────────────────────
  if (action === 'toggle_template') {
    const { data: tpl } = await admin
      .from('club_templates' as any)
      .select('is_published')
      .eq('id', id)
      .single()
    if (!tpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    await admin.from('club_templates' as any)
      .update({ is_published: !tpl.is_published })
      .eq('id', id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}

export const dynamic = 'force-dynamic'
