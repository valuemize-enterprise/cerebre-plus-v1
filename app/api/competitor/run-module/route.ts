// /app/api/competitor/run-module/route.ts
// Runs one module at a time. Called sequentially by the frontend.
// For heavy analysis (6-7 competitors), the frontend polls this repeatedly.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { gatherCompetitorData }      from '@/lib/competitor/scrapers'
import { runModule }                 from '@/lib/competitor/module-engine'
import { calculateModuleCost, type ModuleId, type AnalysisMode } from '@/lib/competitor/types'
import type { CompetitorProfile }    from '@/lib/competitor/types'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { sessionId, moduleId } = body as { sessionId: string; moduleId: ModuleId }

  if (!sessionId || !moduleId) {
    return NextResponse.json({ error: 'sessionId and moduleId are required' }, { status: 400 })
  }

  // Fetch session
  const { data: session, error: sessErr } = await supabase
    .from('competitor_sessions' as any)
    .select('*')
    .eq('id', sessionId).eq('user_id', user.id).single()

  if (sessErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status === 'completed') return NextResponse.json({ error: 'Session already completed' }, { status: 400 })
  if (session.modules_completed?.includes(moduleId)) {
    // Already done — return cached result
    return NextResponse.json({ result: session.module_results?.[moduleId], cached: true })
  }

  const competitors: CompetitorProfile[] = session.competitors
  const mode:        AnalysisMode        = session.mode
  const coinCost     = calculateModuleCost(moduleId, mode, competitors.length)

  // Check coin balance
  const { data: balance } = await supabase
    .from('coin_balances').select('balance').eq('user_id', user.id).single()
  if (!balance || balance.balance < coinCost) {
    return NextResponse.json({ error: 'Insufficient coins', required: coinCost }, { status: 402 })
  }

  // Update session status to running
  await supabase.from('competitor_sessions' as any).update({
    status:      'running',
    current_task:`Running ${moduleId.replace(/_/g,' ')} analysis…`,
    started_at:  session.started_at || new Date().toISOString(),
  }).eq('id', sessionId)

  // ── Scrape data (Enhanced mode only) ─────────────────────
  const scrapedData: Record<string, Record<string, any>> = {}
  if (mode === 'enhanced') {
    await Promise.allSettled(
      competitors.map(async comp => {
        scrapedData[comp.id] = await gatherCompetitorData(comp, [moduleId])
      })
    )
  }

  // ── Run the module analysis ───────────────────────────────
  const result = await runModule({
    moduleId,
    mode,
    competitors,
    scrapedData,
    userBusiness: session.business_snapshot,
    coinsToCharge:coinCost,
  })

  // ── Update session with results ───────────────────────────
  const newModulesCompleted = [...(session.modules_completed || []), moduleId]
  const allModules          = session.modules_selected || []
  const newProgress         = Math.round((newModulesCompleted.length / allModules.length) * 100)
  const isComplete          = newModulesCompleted.length >= allModules.length

  await supabase.from('competitor_sessions' as any).update({
    modules_completed: newModulesCompleted,
    module_results:    { ...(session.module_results || {}), [moduleId]: result },
    progress_pct:      newProgress,
    coins_spent:       (session.coins_spent || 0) + coinCost,
    status:            isComplete ? 'completed' : 'running',
    completed_at:      isComplete ? new Date().toISOString() : null,
    current_task:      isComplete ? null : `${allModules.length - newModulesCompleted.length} module(s) remaining…`,
  }).eq('id', sessionId)

  // ── Deduct coins ──────────────────────────────────────────
  if (result.status === 'completed') {
    const { error: deductModErr } = await supabase.rpc('deduct_design_coins' as any, {
      p_user_id: user.id, p_amount: coinCost,
      p_tool_id: 'competitor-intelligence', p_engine: mode,
    })
    if (deductModErr) {
      console.error('[competitor-run-module] coin deduction failed:', deductModErr.message)
    }
  }

  return NextResponse.json({
    result,
    progress:         newProgress,
    modulesCompleted: newModulesCompleted,
    isComplete,
    coinsSpent:       coinCost,
  })
}

export const dynamic     = 'force-dynamic'
export const maxDuration = 90
