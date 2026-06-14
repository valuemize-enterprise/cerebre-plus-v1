// /app/api/sme-club/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { sessionId, status, notes } = await request.json()
  if (!sessionId || !status) return NextResponse.json({ error: 'sessionId and status required' }, { status: 400 })

  const update: any = { user_id: user.id, session_id: sessionId, status }
  if (status === 'in_progress' && !update.started_at) update.started_at = new Date().toISOString()
  if (status === 'completed') { update.completed_at = new Date().toISOString(); update.started_at = update.started_at ?? new Date().toISOString() }
  if (notes !== undefined) update.notes = notes

  const { data, error } = await supabase.from('sme_club_progress' as any)
    .upsert(update, { onConflict: 'user_id,session_id' })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ progress: data })
}

export const dynamic = 'force-dynamic'
