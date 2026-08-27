// /app/api/club/join/route.ts
// Called when user clicks the WhatsApp join button.
// Tracks the source and awards 5 coins + 10 points on first click.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json().catch(() => ({}))
  const { source = 'direct', medium, campaign } = body

  // Record the click
  const admin = createAdminClient()
  await admin.from('club_whatsapp_joins' as any).insert({
    user_id:  user?.id ?? null,
    source,
    medium,
    campaign,
  })

  // Award first-join bonus (logged-in users only, only once)
  if (user?.id) {
    const { count } = await admin
      .from('club_whatsapp_joins' as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) === 1) {
      // First-ever click for this user — award bonus
      await admin.rpc('award_club_points' as any, {
        p_user_id:   user.id,
        p_points:    10,
        p_action:    'whatsapp_join',
        p_notes:     'Joined the SME Club WhatsApp community',
        p_coins:     5,
      })
    }
  }

  return NextResponse.json({ ok: true })
}

export const dynamic = 'force-dynamic'

// GET /api/club/join?source=...&redirect=... — used from the public landing page
// Tracks the click anonymously (no session on public page) then redirects to WhatsApp
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source   = searchParams.get('source') ?? 'public'
  const redirect = searchParams.get('redirect') ?? process.env.NEXT_PUBLIC_SME_CLUB_WHATSAPP_LINK ?? 'https://wa.me/'

  // Try to get user (may be null on public page)
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

  const admin = createAdminClient()
  await admin.from('club_whatsapp_joins' as any).insert({
    user_id:  user?.id ?? null,
    source,
    medium:   'link',
    campaign: 'public_landing',
  })

  // Award coins/points for first join if logged in
  if (user?.id) {
    const { count } = await admin
      .from('club_whatsapp_joins' as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) === 1) {
      await admin.rpc('award_club_points' as any, {
        p_user_id: user.id, p_points: 10, p_action: 'whatsapp_join',
        p_notes: 'Joined the SME Club WhatsApp', p_coins: 5,
      })
    }
  }

  // 302 redirect to WhatsApp
  const { NextResponse: NR } = await import('next/server')
  return NR.redirect(redirect)
}
