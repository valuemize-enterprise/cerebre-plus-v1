// /app/api/competitor/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { calculateTotalCost, isHeavyAnalysis, type ModuleId, type AnalysisMode } from '@/lib/competitor/types'
import type { CompetitorProfile } from '@/lib/competitor/types'

// POST — create a new session
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const {
    mode,
    competitors,
    modulesSelected,
  } = body as {
    mode:            AnalysisMode
    competitors:     CompetitorProfile[]
    modulesSelected: ModuleId[]
  }

  if (!mode || !competitors?.length || !modulesSelected?.length) {
    return NextResponse.json({ error: 'mode, competitors, and modulesSelected are required' }, { status: 400 })
  }

  const count        = competitors.length
  const coinsEst     = calculateTotalCost(modulesSelected, mode, count)
  const heavy        = isHeavyAnalysis(count)

  // Check balance
  const { data: balance } = await supabase
    .from('coin_balances').select('balance').eq('user_id', user.id).single()
  if (!balance || balance.balance < coinsEst) {
    return NextResponse.json({ error: 'Insufficient coins', required: coinsEst, current: balance?.balance || 0 }, { status: 402 })
  }

  // Build business snapshot from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name,industry,city,description,brand_primary_color')
    .eq('id', user.id).single() as any

  const { data: session, error } = await supabase
    .from('competitor_sessions' as any)
    .insert({
      user_id:          user.id,
      mode,
      competitor_count: count,
      is_heavy_analysis:heavy,
      competitors,
      modules_selected: modulesSelected,
      coins_estimated:  coinsEst,
      status:           'draft',
      business_snapshot:{
        name:        profile?.business_name || 'My Business',
        industry:    profile?.industry      || 'business',
        city:        profile?.city          || 'Lagos',
        description: profile?.description,
      },
    })
    .select('id, coins_estimated, is_heavy_analysis, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session })
}

// GET — get session details
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('id')
  if (!sessionId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('competitor_sessions' as any)
    .select('*')
    .eq('id', sessionId).eq('user_id', user.id).single()

  if (error || !data) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  return NextResponse.json({ session: data })
}

export const dynamic = 'force-dynamic'
