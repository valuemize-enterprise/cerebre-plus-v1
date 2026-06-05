// /app/api/notifications/preferences/route.ts
// GET  — fetch current user's notification preferences
// PUT  — update notification preferences (partial update supported)
// Stored in profiles.notification_preferences (JSONB column).

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

// Defaults applied when a user has no saved preferences yet
const DEFAULTS = {
  weekly_pulse_email:      true,
  weekly_pulse_whatsapp:   false,
  low_coins_warning:       true,
  milestone_notifications: true,
  referral_updates:        true,
  sme_club_updates:        true,
  marketing_emails:        true,
}

// ── GET ───────────────────────────────────────────────────────
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences, subscription_tier')
    .eq('id', user.id)
    .single() as { data: { notification_preferences?: Record<string, boolean>; subscription_tier?: string } | null }

  const saved = profile?.notification_preferences ?? {}
  const preferences = { ...DEFAULTS, ...saved }

  // If user is not on Growth plan, sme_club_updates is irrelevant
  // (show it as locked in the UI, not disabled in DB)
  return NextResponse.json({
    preferences,
    subscriptionTier: profile?.subscription_tier  ?? 'free',
  })
}

// ── PUT ───────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Only accept known preference keys — strip unknown fields
  const allowed = new Set(Object.keys(DEFAULTS))
  const cleaned = Object.fromEntries(
    Object.entries(body).filter(([k, v]) => allowed.has(k) && typeof v === 'boolean')
  )

  if (Object.keys(cleaned).length === 0) {
    return NextResponse.json({ error: 'No valid preference fields provided' }, { status: 400 })
  }

  // Merge with existing preferences (partial update)
  const { data: existing } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', user.id)
    .single() as { data: { notification_preferences?: Record<string, boolean> } | null }

  const merged = {
    ...DEFAULTS,
    ...(existing?.notification_preferences ?? {}),
    ...cleaned,
  }

  const { error } = await supabase
    .from('profiles')
    .update({ notification_preferences: merged, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('[preferences] update error:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }

  return NextResponse.json({ success: true, preferences: merged })
}

export const dynamic = 'force-dynamic'
