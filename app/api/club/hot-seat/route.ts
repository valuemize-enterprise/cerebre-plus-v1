// /app/api/club/hot-seat/route.ts
// GET  — check if user has an open application
// POST — submit a Hot Seat application
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data } = await supabase
    .from('club_hot_seat_applications' as any)
    .select('id, status, biggest_challenge, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({ application: data ?? null })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { businessName, biggestChallenge, desiredOutcome, availableDates } = body

  if (!biggestChallenge?.trim()) {
    return NextResponse.json({ error: 'Please describe your biggest challenge' }, { status: 400 })
  }

  // Check for existing pending application
  const admin = createAdminClient()
  const { count } = await admin
    .from('club_hot_seat_applications' as any)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'scheduled'])

  if ((count ?? 0) > 0) {
    return NextResponse.json({
      error: 'You already have an open Hot Seat application. We\'ll be in touch!',
    }, { status: 409 })
  }

  const { data, error } = await admin
    .from('club_hot_seat_applications' as any)
    .insert({
      user_id:           user.id,
      business_name:     businessName?.trim() || null,
      biggest_challenge: biggestChallenge.trim(),
      desired_outcome:   desiredOutcome?.trim() || null,
      available_dates:   availableDates?.trim() || null,
      status:            'pending',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, applicationId: data.id })
}

export const dynamic = 'force-dynamic'
