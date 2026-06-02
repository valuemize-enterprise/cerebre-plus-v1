// /app/api/cron/daily-ideas/route.ts
// Runs daily at 5AM UTC (6AM WAT) to pre-generate content ideas for all active users.
// Protected by CRON_SECRET.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import Anthropic                     from '@anthropic-ai/sdk'
import { Redis }                     from '@upstash/redis'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const redis     = Redis.fromEnv()
const TTL       = 60 * 60 * 24  // 24 hours

export async function GET(request: NextRequest) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CEREBRE_CRON_SECRET || process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase  = createAdminClient()
  const today     = new Date().toISOString().split('T')[0]

  // Get active users (generated content in last 14 days)
  const { data: activeUsers } = await supabase
    .from('generations')
    .select('user_id')
    .gt('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'completed')

  const userIds = [...new Set((activeUsers || []).map((g) => g.user_id))].slice(0, 100) // Process 100/day max

  let generated = 0, skipped = 0, errors = 0

  for (const userId of userIds) {
    const cacheKey = `ideas:${userId}:${today}`

    // Skip if already generated
    const cached = await redis.exists(cacheKey)
    if (cached) { skipped++; continue }

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
    if (!profile) { skipped++; continue }

    try {
      // Build a simple ideas prompt (reuse logic from ideas API route)
      const prompt = `Generate 5 specific content ideas for ${profile.business_name || 'a Nigerian business'} in ${profile.industry || 'general business'} based in ${profile.city || 'Nigeria'}. Return only valid JSON array. Today is ${today}. Format: [{"id":"idea_1","format":"Post","hook":"...","concept":"...","whyNow":"...","engagementType":"Saves","difficulty":"Easy","estimatedMinutes":15,"toolId":"caption-craft","toolName":"CaptionCraft","toolIcon":"✍️","coinCost":15,"tag":null}]`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5', max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })

      const raw  = message.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')
      const clean = raw.replace(/```json|```/g, '').trim()
      const ideas = JSON.parse(clean)

      await redis.set(cacheKey, { ideas, date: today }, { ex: TTL })
      generated++
    } catch {
      errors++
    }
  }

  return NextResponse.json({ generated, skipped, errors, date: today })
}

export const dynamic     = 'force-dynamic'
export const maxDuration = 300
