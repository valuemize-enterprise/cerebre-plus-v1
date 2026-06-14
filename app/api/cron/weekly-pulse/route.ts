// /app/api/cron/weekly-pulse/route.ts
// Runs every Monday at 8:00 AM WAT (7:00 AM UTC).
// Sends a weekly digest email to every active user with their past-week stats.
// Schedule in vercel.json:  { "path": "/api/cron/weekly-pulse", "schedule": "0 7 * * 1" }

import { NextRequest, NextResponse }  from 'next/server'
import { createAdminClient }          from '@/lib/supabase/admin'
import { sendWeeklyDigest }           from '@/lib/email/sender'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin      = createAdminClient()
  const weekEnd    = new Date()
  const weekStart  = new Date(weekEnd.getTime() - 7 * 86400_000)
  const weekEndStr = weekEnd.toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' })

  const { data: activeUsers } = await admin
    .from('profiles')
    .select('id, business_name')
    .gte('updated_at', new Date(Date.now() - 90 * 86400_000).toISOString()) as any

  let sent = 0, failed = 0

  for (const user of (activeUsers ?? [])) {
    try {
      const [genRes, coinsRes, smeRes] = await Promise.all([
        admin.from('tool_generations' as any).select('id, tool_id', { count: 'exact' }).eq('user_id', user.id).gte('created_at', weekStart.toISOString()),
        admin.from('coin_balances').select('balance').eq('user_id', user.id).single() as any,
        admin.from('sme_club_sessions' as any).select('title, scheduled_for').eq('is_published', true).gte('scheduled_for', new Date().toISOString().slice(0,10)).order('scheduled_for', { ascending: true }).limit(1).single(),
      ])

      const outputs = genRes.data ?? []
      const toolCounts: Record<string,number> = {}
      outputs.forEach((g: any) => { toolCounts[g.tool_id] = (toolCounts[g.tool_id]||0)+1 })
      const topTool = Object.entries(toolCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]?.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) ?? null

      const { data: txns } = await admin.from('coin_transactions').select('amount').eq('user_id', user.id).eq('type','deduction').gte('created_at', weekStart.toISOString())
      const coinsSpent = txns?.reduce((s:number,t:any)=>s+Math.abs(t.amount),0) ?? 0

      const result = await sendWeeklyDigest(user.id, {
        weekEnding:      weekEndStr,
        toolsUsed:       new Set(outputs.map((g:any)=>g.tool_id)).size,
        outputsCreated:  outputs.length,
        coinsSpent,
        coinsRemaining:  coinsRes.data?.balance ?? 0,
        topTool,
        upcomingSmeSession: smeRes.data ? { title: smeRes.data.title, date: new Date(smeRes.data.scheduled_for).toLocaleDateString('en-NG',{weekday:'long',day:'numeric',month:'long'}) } : null,
        suggestedTool: outputs.length === 0 ? { name:'CaptionCraft', description:'Generate a week of Instagram captions in under 60 seconds.', href:'/tools/caption-craft' } : null,
      })
      result?.success ? sent++ : failed++
    } catch { failed++ }
  }

  return NextResponse.json({ success:true, week:weekEndStr, users:activeUsers?.length??0, sent, failed })
}

export const dynamic = 'force-dynamic'
export const maxDuration = 300
