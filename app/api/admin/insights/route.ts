// /app/api/admin/insights/route.ts
// AI-powered platform analysis endpoint.
// Aggregates real platform data, sends to Claude, returns analysis.

import { NextRequest, NextResponse } from 'next/server'
import Anthropic                     from '@anthropic-ai/sdk'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'
import { logAction, A }              from '@/lib/admin/audit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function gatherPlatformData() {
  const admin = createAdminClient()
  const now   = new Date()
  const d7    = new Date(now.getTime() - 7  * 86400_000).toISOString()
  const d30   = new Date(now.getTime() - 30 * 86400_000).toISOString()

  const [users, subs, txns, expiring] = await Promise.all([
    // User breakdown
    admin.from('profiles').select('id, created_at, account_status', { count: 'exact' }),
    // Subscription breakdown
    admin.from('subscriptions').select('plan_tier, status, created_at'),
    // Coin transactions (last 30d)
    admin.from('coin_transactions').select('type, amount, created_at').gte('created_at', d30),
    // Expiring trials
    admin.from('subscriptions').select('id').eq('plan_tier','free').eq('status','active').lte('free_expires_at', new Date(now.getTime() + 7 * 86400_000).toISOString()),
  ])

  const allSubs = subs.data || []
  const planCounts = allSubs.reduce((a: any, s: any) => { a[s.plan_tier] = (a[s.plan_tier]||0)+1; return a }, {})

  const newLast7  = (users.data||[]).filter((u:any) => u.created_at > d7).length
  const newLast30 = (users.data||[]).filter((u:any) => u.created_at > d30).length
  const totalTxns = (txns.data||[]).length
  const deductions = (txns.data||[]).filter((t:any) => t.type === 'deduction')
  const usersWhoGenerated = new Set(deductions.map((t:any) => t.user_id)).size

  return {
    platform_snapshot: {
      total_users:       users.count || 0,
      new_last_7_days:   newLast7,
      new_last_30_days:  newLast30,
      plan_breakdown: {
        free:    planCounts.free    || 0,
        starter: planCounts.starter || 0,
        growth:  planCounts.growth  || 0,
      },
      active_subscriptions: allSubs.filter((s:any) => s.status === 'active').length,
      expired_or_cancelled: allSubs.filter((s:any) => ['expired','cancelled'].includes(s.status)).length,
      trials_expiring_7d:  expiring.count || 0,
      tool_generations_30d: deductions.length,
      unique_generators_30d: usersWhoGenerated,
      estimated_annual_revenue_ngn:
        (planCounts.starter||0) * 20000 + (planCounts.growth||0) * 80000,
    },
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'view_ai_insights')) return forbidden()

  const { query } = await request.json()
  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  let data: any
  try { data = await gatherPlatformData() }
  catch (e: any) { return NextResponse.json({ error: 'Failed to gather platform data: ' + e.message }, { status: 500 }) }

  const systemPrompt = `You are a senior marketing analytics consultant analysing the Cerebre Plus platform — an AI marketing SaaS based in Lagos, Nigeria, targeting Nigerian SMEs.

Platform context:
- 3 plans: Free (₦0, 70 coins, 30-day trial), Starter (₦20,000/year, 150 coins), Growth (₦80,000/year, 700 coins + SME Club)
- Target market: Nigerian SMEs who need affordable marketing tools
- Revenue model: Annual subscriptions + coin top-ups

Current platform data:
${JSON.stringify(data, null, 2)}

Your job: Answer the admin's question with specific, actionable analysis. Be honest about what the data shows and what it doesn't. Give concrete recommendations, not generalities. Write in plain business English — no jargon, no hedging. Be direct.`

  try {
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: query }],
    })

    const insight = response.content.find(b => b.type === 'text')?.text || 'No response generated.'
    await logAction(session, A.AI_QUERY, 'insights', 'claude', { query: query.slice(0, 200) })

    return NextResponse.json({ insight, data_used: data.platform_snapshot })
  } catch (e: any) {
    return NextResponse.json({ error: 'Claude API error: ' + e.message }, { status: 503 })
  }
}

export const dynamic = 'force-dynamic'
