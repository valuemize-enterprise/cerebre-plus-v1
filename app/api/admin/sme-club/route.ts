// /app/api/admin/sme-club/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized } from '@/lib/admin/auth'
import { sendSmeNewSession }         from '@/lib/email/sender'

// GET — list all sessions
export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin = createAdminClient()
  const { data } = await admin.from('sme_club_sessions' as any).select('*').order('session_number')
  return NextResponse.json({ sessions: data ?? [] })
}

// POST — create session
export async function POST(request: NextRequest) {
  const adminSession = await getAdminSession(request)
  if (!adminSession) return unauthorized()

  const admin = createAdminClient()
  const body  = await request.json()
  const { session_number, title, description, category, video_url, thumbnail_url,
          duration_minutes, resources, key_takeaways, is_published, is_free_preview, scheduled_for } = body

  const { data, error } = await admin.from('sme_club_sessions' as any).insert({
    session_number, title, description, category, video_url, thumbnail_url,
    duration_minutes, resources, key_takeaways,
    is_published: is_published ?? false,
    is_free_preview: is_free_preview ?? false,
    scheduled_for,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If published → notify all Growth subscribers
  if (is_published && data) {
    const { data: growthUsers } = await admin
      .from('subscriptions').select('user_id').eq('plan_tier','growth').eq('status','active')

    const notifyJobs = (growthUsers ?? []).map(({ user_id }) =>
      sendSmeNewSession(user_id, {
        number:       data.session_number,
        title:        data.title,
        description:  data.description ?? '',
        category:     data.category,
        duration:     data.duration_minutes ?? 45,
        isFreePreview:data.is_free_preview,
      })
    )
    await Promise.allSettled(notifyJobs)
  }

  return NextResponse.json({ session: data })
}

// PATCH — update session (publish/unpublish, edit)
export async function PATCH(request: NextRequest) {
  const adminSession = await getAdminSession(request)
  if (!adminSession) return unauthorized()

  const admin = createAdminClient()
  const body  = await request.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data: before } = await admin.from('sme_club_sessions' as any).select('is_published').eq('id', id).single()

  const { data, error } = await admin.from('sme_club_sessions' as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify on publish (not already published before)
  if (updates.is_published && !before?.is_published && data) {
    const { data: growthUsers } = await admin.from('subscriptions').select('user_id').eq('plan_tier','growth').eq('status','active')
    const notifyJobs = (growthUsers ?? []).map(({ user_id }) =>
      sendSmeNewSession(user_id, {
        number: data.session_number, title: data.title, description: data.description ?? '',
        category: data.category, duration: data.duration_minutes ?? 45, isFreePreview: data.is_free_preview,
      })
    )
    await Promise.allSettled(notifyJobs)
  }

  return NextResponse.json({ session: data })
}

export const dynamic = 'force-dynamic'
