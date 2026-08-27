// /app/api/club/challenges/route.ts
// GET  — list active challenges + user's entries
// POST — submit an entry to the current challenge
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const now = new Date().toISOString()

  const [challengesRes, entriesRes] = await Promise.allSettled([
    supabase
      .from('club_challenges' as any)
      .select('*')
      .eq('is_active', true)
      .order('starts_at', { ascending: false })
      .limit(6),

    supabase
      .from('club_challenge_entries' as any)
      .select('challenge_id, status, coins_awarded, points_awarded, created_at')
      .eq('user_id', user.id),
  ])

  const challenges = challengesRes.status === 'fulfilled' ? (challengesRes.value.data ?? []) : []
  const myEntries  = entriesRes.status  === 'fulfilled' ? (entriesRes.value.data ?? []) : []

  const entryMap: Record<string, any> = {}
  myEntries.forEach((e: any) => { entryMap[e.challenge_id] = e })

  const tagged = challenges.map((c: any) => ({
    ...c,
    myEntry:  entryMap[c.id] ?? null,
    isActive: c.starts_at <= now && c.ends_at >= now,
  }))

  return NextResponse.json({ challenges: tagged })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { challengeId, submissionText, submissionUrl } = await request.json()
  if (!challengeId || !submissionText?.trim()) {
    return NextResponse.json({ error: 'challengeId and submissionText required' }, { status: 400 })
  }

  // Verify challenge is open
  const admin = createAdminClient()
  const { data: challenge } = await admin
    .from('club_challenges' as any)
    .select('id, ends_at, is_active')
    .eq('id', challengeId)
    .single()

  if (!challenge || !challenge.is_active || new Date(challenge.ends_at) < new Date()) {
    return NextResponse.json({ error: 'This challenge is no longer accepting submissions' }, { status: 400 })
  }

  // Upsert the entry (user can update their submission before approval)
  const { data, error } = await admin
    .from('club_challenge_entries' as any)
    .upsert({
      challenge_id:    challengeId,
      user_id:         user.id,
      submission_text: submissionText.trim(),
      submission_url:  submissionUrl?.trim() || null,
      status:          'pending',
    }, { onConflict: 'challenge_id,user_id' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, entryId: data.id })
}

export const dynamic = 'force-dynamic'
