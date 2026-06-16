// /app/api/admin/dashboard/route.ts
// Returns platform KPIs for the role-aware admin dashboard.
// Data returned is tailored based on the caller's role — analysts
// get read-only metrics, content managers get content stats, etc.

import { NextRequest, NextResponse }      from 'next/server'
import { createAdminClient }              from '@/lib/supabase/admin'
import { getAdminSession, unauthorized }  from '@/lib/admin/auth'
import { hasPermission } from '@/lib/admin/permissions'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()

  const admin  = createAdminClient()
  const role   = session.role
  const now    = new Date()
  const d30    = new Date(now.getTime() - 30 * 86400_000).toISOString()
  const d7     = new Date(now.getTime() -  7 * 86400_000).toISOString()
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const result: Record<string, any> = {}

  // ── Users (all roles can view basic user count) ───────────
  if (hasPermission(role, 'view_users')) {
    const [total, newToday, new7d, recentSignups] = await Promise.all([
      admin.from('profiles').select('id', { count:'exact', head:true }),
      admin.from('profiles').select('id', { count:'exact', head:true }).gte('created_at', today),
      admin.from('profiles').select('id', { count:'exact', head:true }).gte('created_at', d7),
      admin.from('profiles').select('id,business_name,email:id,industry,city,created_at')
        .order('created_at',{ ascending:false }).limit(5),
    ])
    result.totalUsers    = total.count || 0
    result.newUsersToday = newToday.count || 0
    result.newUsers7d    = new7d.count || 0
    result.recentSignups = recentSignups.data || []
  }

  // ── Revenue (billing + analyst roles) ────────────────────
  if (hasPermission(role, 'view_revenue')) {
    const [subs, growthCount] = await Promise.all([
      admin.from('subscriptions').select('plan_tier,status').eq('status','active'),
      admin.from('subscriptions').select('id',{count:'exact',head:true}).eq('plan_tier','growth').eq('status','active'),
    ])
    const subList = subs.data || []
    const growthPrice = 7500
    result.mrr          = (growthCount.count || 0) * growthPrice
    result.growthMembers= growthCount.count || 0
    result.conversionRate = result.totalUsers
      ? Math.round(((growthCount.count||0) / result.totalUsers) * 100)
      : 0
  }

  // ── Coins ────────────────────────────────────────────────
  if (hasPermission(role, 'view_coin_stats')) {
    const [issued, granted] = await Promise.all([
      admin.from('coin_transactions').select('amount').eq('type','deduction').gte('created_at',d30),
      admin.from('coin_transactions').select('amount').eq('type','grant').gte('created_at',d30),
    ])
    const totalDeducted    = (issued.data||[]).reduce((s:number,r:any)=>s+Math.abs(r.amount),0)
    const totalGranted     = (granted.data||[]).reduce((s:number,r:any)=>s+r.amount,0)
    result.coinsIssued30d  = totalDeducted
    result.coinsGranted30d = totalGranted
    const balances = await admin.from('coin_balances').select('balance')
    const avgBal   = balances.data?.length
      ? Math.round(balances.data.reduce((s:number,r:any)=>s+r.balance,0)/balances.data.length)
      : 0
    result.avgCoinsPerUser = avgBal
  }

  // ── Generations ──────────────────────────────────────────
  if (hasPermission(role, 'view_ai_insights')) {
    const [genToday, gen30d, topTools] = await Promise.all([
      admin.from('generations').select('id',{count:'exact',head:true}).eq('status','complete').gte('created_at',today),
      admin.from('generations').select('id',{count:'exact',head:true}).eq('status','complete').gte('created_at',d30),
      admin.from('generations').select('tool_id,tool_name').eq('status','complete').gte('created_at',today),
    ])
    result.generationsToday = genToday.count || 0
    result.generations30d   = gen30d.count   || 0

    // Aggregate top tools
    const toolMap: Record<string,{tool_name:string;count:number}> = {}
    ;(topTools.data||[]).forEach((g:any) => {
      if (!toolMap[g.tool_id]) toolMap[g.tool_id] = { tool_name: g.tool_name, count: 0 }
      toolMap[g.tool_id].count++
    })
    result.topTools = Object.entries(toolMap)
      .map(([tool_id, d]) => ({ tool_id, ...d }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 5)
  }

  // ── Ratings ──────────────────────────────────────────────
  if (hasPermission(role, 'view_ratings')) {
    const ratings = await admin.from('output_ratings' as any).select('thumbs').gte('created_at',d30)
    const list    = ratings.data || []
    const up      = list.filter((r:any) => r.thumbs === 'up').length
    result.satisfactionPct = list.length ? Math.round((up/list.length)*100) : 0
  }

  // ── SME Club ─────────────────────────────────────────────
  if (hasPermission(role, 'view_sme_club')) {
    const [sessions, completions, recent] = await Promise.all([
      admin.from('sme_club_sessions' as any).select('id',{count:'exact',head:true}),
      admin.from('sme_club_progress' as any).select('id',{count:'exact',head:true}).eq('completed',true),
      admin.from('sme_club_sessions' as any).select('id,title,is_published,created_at')
        .order('created_at',{ascending:false}).limit(5),
    ])
    result.smeSessionsTotal = sessions.count || 0
    result.smeCompletions   = completions.count || 0
    result.recentSmeSessions= recent.data || []
  }

  // ── Messages ─────────────────────────────────────────────
  if (hasPermission(role, 'view_messages')) {
    const msgs = await admin.from('admin_messages' as any).select('id',{count:'exact',head:true}).gte('sent_at',d30)
    result.messagesSent30d = msgs.count || 0
  }

  // ── Recent audit activity ────────────────────────────────
  if (hasPermission(role, 'view_audit_log')) {
    const activity = await admin.from('admin_audit_log' as any)
      .select('action,created_at').order('created_at',{ascending:false}).limit(8)
    result.recentActivity = activity.data || []
  }

  // ── Admin team summary ───────────────────────────────────
  if (hasPermission(role, 'view_admin_team')) {
    const team = await admin.from('admin_profiles' as any)
      .select('id,name,role,is_active').eq('is_active',true).order('created_at',{ascending:true}).limit(5)
    result.adminTeamSummary = team.data || []
  }

  return NextResponse.json(result)
}

export const dynamic = 'force-dynamic'
