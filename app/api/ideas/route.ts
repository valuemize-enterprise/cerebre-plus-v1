// ═══════════════════════════════════════════════════════════════
// /app/api/ideas/route.ts
// Generates and serves daily personalised content ideas.
// Cached in Upstash Redis with 24hr TTL.
// Cron job at /api/cron/daily-ideas pre-generates at 6AM WAT.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { Redis }                     from '@upstash/redis'
import Anthropic                     from '@anthropic-ai/sdk'
import { createServerClient }        from '@/lib/supabase/server'

const redis     = Redis.fromEnv()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const REFRESH_COST = 5
const TTL_SECONDS  = 60 * 60 * 24   // 24 hours

// ─────────────────────────────────────────────────────────────
// IDEA GENERATOR PROMPT
// ─────────────────────────────────────────────────────────────

function buildIdeasPrompt(profile: Record<string, any>, dateStr: string): string {
  // Nigerian cultural calendar lookup
  const date        = new Date(dateStr)
  const month       = date.getMonth()
  const day         = date.getDate()
  const daysInMonth = new Date(date.getFullYear(), month + 1, 0).getDate()
  const isSalaryWeek = day >= daysInMonth - 6
  const isMonthStart = day <= 7

  const culturalMoments: string[] = []
  if (isSalaryWeek) culturalMoments.push('Salary Week — peak Nigerian purchase intent window')
  if (isMonthStart) culturalMoments.push('Start of month — budget-conscious buyers, educational content performs best')
  if (month === 3 && day >= 18 && day <= 22) culturalMoments.push('Easter period — family spending and gifting surge')
  if (month === 9 && day === 1) culturalMoments.push('Independence Day — patriotic content, national pride angle')
  if (month === 10 && day >= 24 && day <= 30) culturalMoments.push('Black Friday week — Nigerian e-commerce peak')
  if (month === 11 && day >= 20) culturalMoments.push('Detty December — entertainment, fashion, food, hospitality surge')
  if (month === 1 && day >= 10 && day <= 15) culturalMoments.push("Valentine's week — gifting, experiences, romantic products")
  if (month === 4 && day === 27) culturalMoments.push("Children's Day — education, parenting, children's products")

  const cultural = culturalMoments.length > 0
    ? `ACTIVE CULTURAL MOMENTS: ${culturalMoments.join(', ')}`
    : 'CULTURAL MOMENT: Standard month mid-point — relationship building and value content'

  return `
You are CerebreBrain, generating 5 highly specific, actionable content ideas for a Nigerian business owner.

BUSINESS PROFILE:
Business: ${profile.business_name || 'Nigerian business'}
Industry: ${profile.industry || 'general business'}
City: ${profile.city || 'Lagos'}
Target Customer: ${profile.target_customer || 'Nigerian consumers'}
Brand Voice: ${profile.brand_voice || 'professional'}
Challenges: ${JSON.stringify(profile.marketing_challenges) || 'growing customer base'}
Social Proof: ${profile.social_proof || ''}
WhatsApp: ${profile.whatsapp || '08012345678'}

TODAY'S DATE: ${dateStr}
${cultural}

Generate exactly 5 content ideas. Return ONLY a valid JSON array, no markdown, no explanation.

Each idea must be specific to this business's industry and city. No generic ideas.

Format:
[
  {
    "id": "idea_1",
    "format": "Reel|Carousel|Post|WhatsApp|Story",
    "hook": "The exact first line/headline they post — must pass the Lagos Bus Test",
    "concept": "2-3 sentences describing what to create and what to say",
    "whyNow": "Why this specific moment (today's date, cultural calendar, salary cycle) makes this idea especially relevant right now",
    "engagementType": "Shares|Saves|Comments|DMs|WhatsApp replies",
    "difficulty": "Easy|Medium|Advanced",
    "estimatedMinutes": 10,
    "toolId": "caption-craft|copy-brain|whatsapp-campaign-builder|video-script-forge|carousel-script-builder|content-calendar|story-planner|promo-blast",
    "toolName": "CaptionCraft|CopyBrain AI|etc",
    "toolIcon": "✍️",
    "coinCost": 15,
    "tag": "Salary Week|null"
  }
]

Rules:
- Ideas must be immediately actionable — no vague concepts
- At least one idea must reference salary week or a cultural moment if active
- At least one idea should drive WhatsApp enquiries (the primary conversion channel)
- At least one should be a quick win (Easy, under 15 minutes)
- Hook lines must be specific to the business's city and industry
- The "whyNow" must contain a specific insight about timing in the Nigerian market
`.trim()
}

// ─────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Auth
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId     = user.id
  const today      = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  const cacheKey   = `ideas:${userId}:${today}`
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true'

  // ── Forced refresh: deduct coins ──────────────────────────
  if (forceRefresh) {
    const { error: deductError } = await supabase.rpc('deduct_coins', {
      p_user_id:  userId,
      p_amount:   REFRESH_COST,
      p_tool_id:  'ideas_refresh',
      p_generation_id: null,
    })
    if (deductError) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_COINS', message: `Need ${REFRESH_COST} coins to refresh ideas` },
        { status: 402 }
      )
    }
    await redis.del(cacheKey)
  }

  // ── Check cache ───────────────────────────────────────────
  const cached = await redis.get<any>(cacheKey)
  if (cached && !forceRefresh) {
    return NextResponse.json(cached)
  }

  // ── Fetch profile ─────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // ── Generate via Claude ───────────────────────────────────
  try {
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{
        role:    'user',
        content: buildIdeasPrompt(profile, today),
      }],
    })

    const rawText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    const clean  = rawText.replace(/```json|```/g, '').trim()
    const ideas  = JSON.parse(clean)

    // Next auto-refresh = tomorrow at 6AM WAT
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(6, 0, 0, 0)  // 6AM WAT (UTC+1)
    const nextRefreshAt = new Date(tomorrow.getTime() - 60 * 60 * 1000) // Convert WAT to UTC

    const payload = { ideas, nextRefreshAt: nextRefreshAt.toISOString(), date: today }

    // Cache in Redis
    await redis.set(cacheKey, payload, { ex: TTL_SECONDS })

    return NextResponse.json(payload)
  } catch (err: any) {
    console.error('[ideas] generation failed:', err)
    return NextResponse.json({ error: 'Generation failed', message: err.message }, { status: 500 })
  }
}

export const dynamic    = 'force-dynamic'
export const maxDuration = 30
