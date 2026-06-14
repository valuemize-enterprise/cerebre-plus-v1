// /app/api/tools/brand-profile/route.ts
// GET + PUT for user brand DNA settings

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      brand_primary_color, industry, business_name, city, brand_secondary_color, brand_accent_color,
      brand_background_color, brand_font_style, brand_design_voice,
      brand_logo_url, brand_pattern_pref, brand_design_engine
    `)
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}

export async function PUT(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const allowed = [
    'brand_primary_color', 'brand_secondary_color', 'brand_accent_color',
    'brand_background_color', 'brand_font_style', 'brand_design_voice',
    'brand_logo_url', 'brand_pattern_pref', 'brand_design_engine',
  ]
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
