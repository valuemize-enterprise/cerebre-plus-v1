// ═══════════════════════════════════════════════════════════════
// /app/api/cron/weekly-pulse/route.ts
// Runs every Monday 7AM WAT.
// Generates personalised weekly marketing report.
// Sends in-app notification (+ optional WhatsApp via Twilio/WA API).
// Protected with CRON_SECRET header.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import Anthropic                     from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const AKIN_LAWS_ROTATION = [
  { number: 1, name: 'The Awoof Law', tip: 'Show what this costs elsewhere vs. what it costs with you. The comparison IS the sale.' },
  { number: 2, name: 'The List Law',  tip: 'Every piece of content should collect a WhatsApp number before it asks for a sale.' },
  { number: 3, name: 'The Trust Law', tip: '"2,400 clients in Lagos" converts. "Many clients" doesn\'t. Specificity kills FOBE.' },
  { number: 4, name: 'The Fear Law',  tip: 'Show the cost of NOT acting. Fear of loss beats promise of gain 3-to-1 in Nigeria.' },
  { number: 5, name: 'The Giant Promise Law', tip: 'Make the biggest honest promise you can. Bold + specific converts. Cautious + vague doesn\'t.' },
  { number: 6, name: 'The Story Law', tip: 'Lead with a Nigerian business owner story. The offer only appears after emotional investment.' },
  { number: 7, name: 'The Sales Letter Formula', tip: 'Hook → Story → Trust → Offer → Urgency → Close → P.S. — in that order, every time.' },
  { number: 8, name: 'The Customer Behaviour Law', tip: 'Use "I" not "we". Put the WhatsApp number IN the message. Make the action zero effort.' },
  { number: 9, name: 'The Community Validation Law', tip: '"2,400 businesses in Lagos, Abuja, and PH" vs "thousands of businesses". City names convert.' },
  { number: 10, name: 'The Urgency/Scarcity Law', tip: 'Real deadline or real limit — no fake countdowns. "Offer closes this Friday midnight." That\'s it.' },
]

// ─────────────────────────────────────────────────────────────
// BUILD PULSE MESSAGE
// ─────────────────────────────────────────────────────────────

function buildPulseNotification(params: {
  businessName:    string
  coinsUsedThis:   number
  coinsUsedLast:   number
  topToolName:     string
  generationCount: number
  weeklyValue:     number
  focusSuggestion: string
  lawOfWeek:       typeof AKIN_LAWS_ROTATION[0]
}): { title: string; body: string } {
  const trend = params.coinsUsedThis > params.coinsUsedLast
    ? `🔼 Up from ${params.coinsUsedLast} last week`
    : params.coinsUsedThis < params.coinsUsedLast
      ? `🔽 Down from ${params.coinsUsedLast} last week`
      : `➡️ Same as last week`

  const title = `Weekly Pulse — ${params.businessName} 📊`
  const body = `
**Your Marketing Week in Review**

🪙 Coins used this week: **${params.coinsUsedThis}** (${trend})
✨ Outputs created: **${params.generationCount}** pieces of content
🏆 Most used tool: **${params.topToolName}**
💰 Agency equivalent value: **₦${params.weeklyValue.toLocaleString()}**

*What a Lagos agency would charge for ${params.generationCount} of these outputs: ₦${(params.weeklyValue * 10).toLocaleString()}. What you paid: ${params.coinsUsedThis} coins.*

**This week, focus on: ${params.focusSuggestion}**

**Cerebre Law of the Week — Law ${params.lawOfWeek.number}: ${params.lawOfWeek.name}**
${params.lawOfWeek.tip}
`.trim()

  return { title, body }
}

// ─────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CEREBRE_CRON_SECRET || process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase   = createAdminClient()
  const weekOfYear = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const lawOfWeek  = AKIN_LAWS_ROTATION[weekOfYear % AKIN_LAWS_ROTATION.length]

  // Get date range: last 7 days
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const prevStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Get all active users (those with at least 1 generation in the last 30 days)
  const { data: activeUsers } = await supabase
    .from('generations')
    .select('user_id')
    .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'completed')

  const userIds = [...new Set((activeUsers || []).map((g) => g.user_id))]

  let processed = 0
  let errors    = 0

  for (const userId of userIds) {
    try {
      // This week's generations
      const { data: thisWeek } = await supabase
        .from('generations')
        .select('tool_id, tool_name, coin_cost')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', weekStart)

      const { data: lastWeek } = await supabase
        .from('generations')
        .select('coin_cost')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', prevStart)
        .lt('created_at', weekStart)

      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, industry, city, marketing_challenges')
        .eq('user_id', userId)
        .single()

      if (!thisWeek || thisWeek.length === 0) continue

      // Calculate stats
      const coinsUsedThis = thisWeek.reduce((s, g) => s + (g.coin_cost || 0), 0)
      const coinsUsedLast = (lastWeek || []).reduce((s, g) => s + (g.coin_cost || 0), 0)
      const genCount      = thisWeek.length

      // Top tool
      const toolCounts = thisWeek.reduce<Record<string, { name: string; count: number }>>((acc, g) => {
        if (!acc[g.tool_id]) acc[g.tool_id] = { name: g.tool_name, count: 0 }
        acc[g.tool_id].count++
        return acc
      }, {})
      const topTool = Object.values(toolCounts).sort((a, b) => b.count - a.count)[0]

      // Agency equivalent: coins × ₦10 × 3 (market rate multiplier)
      const weeklyValue = coinsUsedThis * 10 * 3

      // Focus suggestion based on challenges + unused tools this week
      const usedToolIds   = new Set(thisWeek.map((g) => g.tool_id))
      const challenges    = profile?.marketing_challenges as string[] || []
      const suggestions   = ['WhatsApp Campaign Builder', 'StrategyBrain', 'CopyBrain AI', 'Content Calendar']
      const focusSuggestion = suggestions.find((s) => !usedToolIds.has(s.toLowerCase().replace(/\s/g, '-')))
        || (challenges[0] ? `tackling your challenge: "${challenges[0]}"` : 'trying StrategyBrain for a full 90-day plan')

      const notification = buildPulseNotification({
        businessName:    profile?.business_name || 'your business',
        coinsUsedThis,
        coinsUsedLast,
        topToolName:     topTool?.name || 'CopyBrain AI',
        generationCount: genCount,
        weeklyValue,
        focusSuggestion,
        lawOfWeek,
      })

      // Create in-app notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type:    'weekly_pulse',
        payload: {
          title:       notification.title,
          body:        notification.body,
          stats: {
            coinsUsedThis, coinsUsedLast, genCount, weeklyValue,
            topTool:      topTool?.name,
            focusSuggestion,
            lawOfWeek:    lawOfWeek.name,
          },
        },
        is_read:    false,
      })

      processed++
    } catch {
      errors++
    }
  }

  return NextResponse.json({
    processed,
    errors,
    message: `Weekly pulse sent to ${processed} users`,
  })
}

export const dynamic     = 'force-dynamic'
export const maxDuration = 300  // 5 minutes for batch processing
