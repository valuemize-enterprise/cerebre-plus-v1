// /app/api/notifications/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

const DEFAULT_PREFS = {
  weekly_pulse_email:     true,
  weekly_pulse_whatsapp:  false,
  low_coins_notification:  true,
  milestone_notification:  true,
  marketing_emails:        true,
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ preferences: data?.notification_preferences || DEFAULT_PREFS })
}

export async function PUT(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const preferences = await request.json()

  await supabase.from('profiles')
    .update({ notification_preferences: preferences })
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
