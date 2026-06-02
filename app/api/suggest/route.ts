// ═══════════════════════════════════════════════════════════════
// /app/api/suggest/route.ts
// AI-powered field suggestion endpoint.
// Called by SmartSuggest component for any text/textarea field
// in any tool. FREE — no coin deduction.
// Rate-limited: 30 calls / user / hour via Upstash Redis.
// Cached: same inputs for 30 minutes.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse }       from 'next/server'
import Anthropic                           from '@anthropic-ai/sdk'
import { createServerClient }             from '@/lib/supabase/server'
import { buildSuggestionPrompt }          from '@/lib/ai/suggestion-prompts'

// ── Redis for rate-limiting + caching ─────────────────────────
// Gracefully skips if Upstash env vars are not set.
let redis: any = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = require('@upstash/redis')
    redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch {}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─────────────────────────────────────────────────────────────
// RATE LIMIT HELPER
// ─────────────────────────────────────────────────────────────
async function checkRateLimit(userId: string): Promise<boolean> {
  if (!redis) return true  // No Redis — allow all requests
  const key   = `suggest_rl:${userId}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 3600)  // 1-hour window
  return count <= 30  // 30 suggestions per hour
}

// ─────────────────────────────────────────────────────────────
// CACHE HELPERS
// ─────────────────────────────────────────────────────────────
function cacheKey(userId: string, toolId: string, fieldKey: string, stateHash: string) {
  return `suggest_cache:${userId}:${toolId}:${fieldKey}:${stateHash}`
}

function hashState(obj: Record<string, any>): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

async function getCached(key: string): Promise<string[] | null> {
  if (!redis) return null
  try {
    const raw = await redis.get(key)
    return raw ? JSON.parse(raw as string) : null
  } catch { return null }
}

async function setCache(key: string, suggestions: string[]) {
  if (!redis) return
  try { await redis.set(key, JSON.stringify(suggestions), { ex: 1800 }) } catch {}
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── 2. Parse body ──────────────────────────────────────────
  const { toolId, toolName, fieldKey, fieldLabel, formState = {} } = await request.json()
  if (!toolId || !fieldKey) {
    return NextResponse.json({ error: 'toolId and fieldKey are required' }, { status: 400 })
  }

  // ── 3. Rate limit ──────────────────────────────────────────
  const allowed = await checkRateLimit(user.id)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many suggestions. Take a short break and try again.' },
      { status: 429 }
    )
  }

  // ── 4. Cache check ─────────────────────────────────────────
  const stateHash = hashState(formState)
  const ck        = cacheKey(user.id, toolId, fieldKey, stateHash)
  const cached    = await getCached(ck)
  if (cached) return NextResponse.json({ suggestions: cached, cached: true })

  // ── 5. Fetch user profile ──────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, industry, city, target_customer, description, unique_advantage, brand_voice')
    .eq('id', user.id)
    .single()

  const profileCtx = {
    businessName:   profile?.business_name   || '',
    industry:       profile?.industry        || '',
    city:           profile?.city            || '',
    targetCustomer: profile?.target_customer || '',
    description:    profile?.description     || '',
    uniqueAdvantage: profile?.unique_advantage || '',
    brandVoice:     profile?.brand_voice     || '',
  }

  // ── 6. Build prompt ────────────────────────────────────────
  const prompt = buildSuggestionPrompt({
    toolId, toolName: toolName || toolId,
    fieldKey, fieldLabel: fieldLabel || fieldKey,
    formState, profile: profileCtx,
  })

  // ── 7. Call Claude ─────────────────────────────────────────
  try {
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw  = response.content.find(b => b.type === 'text')?.text ?? '[]'
    const text = raw.replace(/```json|```/g, '').trim()

    let suggestions: string[]
    try {
      suggestions = JSON.parse(text)
      if (!Array.isArray(suggestions)) throw new Error('Not an array')
      // Sanitise: ensure strings, trim, cap at 5
      suggestions = suggestions
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 1)
        .map(s => s.trim())
        .slice(0, 5)
      if (suggestions.length === 0) throw new Error('Empty array')
    } catch {
      return NextResponse.json({ error: 'Could not generate suggestions. Please try again.' }, { status: 500 })
    }

    await setCache(ck, suggestions)
    return NextResponse.json({ suggestions })

  } catch (err: any) {
    console.error('[/api/suggest]', err?.message)
    return NextResponse.json({ error: 'Suggestion service temporarily unavailable.' }, { status: 503 })
  }
}

export const dynamic = 'force-dynamic'
