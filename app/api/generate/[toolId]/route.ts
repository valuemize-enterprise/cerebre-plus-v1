// ═══════════════════════════════════════════════════════════════
// /app/api/generate/[toolId]/route.ts
// The streaming AI generation endpoint. Every tool call flows through here.
// SERVER-SIDE ONLY — never exposes Anthropic API key or system prompts.
// ═══════════════════════════════════════════════════════════════

import { NextRequest }           from 'next/server'
import Anthropic                 from '@anthropic-ai/sdk'
import { createServerClient }    from '@/lib/supabase/server'
import { getTool, canAffordTool } from '@/lib/tools/registry'
import { CEREBRE_MASTER_SYSTEM_PROMPT, buildProfileContext, type ProfileContext } from '@/lib/ai/master-system-prompt'
import { getToolPrompt1to10 }    from '@/lib/ai/tool-prompts-1-10'
import { getToolPrompt11to20 }   from '@/lib/ai/tool-prompts-11-20'
import { getToolPrompt21to30 }   from '@/lib/ai/tool-prompts-21-30'
import { getToolPrompt31to40 }   from '@/lib/ai/tool-prompts-31-40'
import { validateToolInputs }    from '@/lib/validations/tool-schemas'
import { Ratelimit }             from '@upstash/ratelimit'
import { Redis }                 from '@upstash/redis'

// Mixpanel — fire-and-forget via HTTP (no SDK import needed, avoids mixpanel-browser vs mixpanel confusion)
async function trackEvent(event: string, props: Record<string, unknown>) {
  const token = process.env.MIXPANEL_TOKEN
  if (!token) return
  try {
    const payload = Buffer.from(JSON.stringify({
      event,
      properties: { token, ...props, time: Math.floor(Date.now() / 1000) },
    })).toString('base64')
    // Non-blocking — intentionally not awaited at call site
    fetch(`https://api.mixpanel.com/track?data=${payload}`, { method: 'GET' })
      .catch(() => { /* never throw */ })
  } catch { /* analytics never blocks the user */ }
}

// ─────────────────────────────────────────────────────────────
// CLIENTS (initialised once at module level)
// ─────────────────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Upstash rate limiter: 10 requests/minute/user
const ratelimit = new Ratelimit({
  redis:   Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60s'),
  prefix:  'cerebre:generate',
})

// ─────────────────────────────────────────────────────────────
// ERROR CODE ENUM
// ─────────────────────────────────────────────────────────────

const ERR = {
  TOOL_NOT_FOUND:   { code: 'TOOL_NOT_FOUND',   status: 404, message: 'Tool not found. Please refresh the page.' },
  UNAUTHENTICATED:  { code: 'UNAUTHENTICATED',   status: 401, message: 'Please log in to continue.' },
  PROFILE_MISSING:  { code: 'PROFILE_MISSING',   status: 422, message: 'Complete your profile to run this tool.' },
  INSUFFICIENT_COINS: { code: 'INSUFFICIENT_COINS', status: 402, message: 'Not enough Cerebre Coins. Please top up to continue.' },
  ENTERPRISE_ONLY:  { code: 'ENTERPRISE_ONLY',   status: 402, message: 'This tool requires an Enterprise plan.' },
  RATE_LIMITED:     { code: 'RATE_LIMITED',      status: 429, message: 'Too many requests. Please wait a moment and try again.' },
  VALIDATION_FAILED:{ code: 'VALIDATION_FAILED', status: 400, message: 'Please check all required fields and try again.' },
  GENERATION_FAILED:{ code: 'GENERATION_FAILED', status: 500, message: 'Generation failed. No coins were deducted.' },
  PROMPT_MISSING:   { code: 'PROMPT_MISSING',    status: 500, message: 'Tool prompt configuration error. Please contact support.' },
} as const

function errResponse(err: typeof ERR[keyof typeof ERR], detail?: string) {
  return new Response(
    JSON.stringify({ error: err.code, message: err.message, detail }),
    { status: err.status, headers: { 'Content-Type': 'application/json' } },
  )
}

// ─────────────────────────────────────────────────────────────
// PROMPT ROUTER
// ─────────────────────────────────────────────────────────────

function getToolPrompt(
  toolId:  string,
  inputs:  Record<string, any>,
  profile: ProfileContext,
): string | null {
  return (
    getToolPrompt1to10(toolId, inputs, profile)  ??
    getToolPrompt11to20(toolId, inputs, profile) ??
    getToolPrompt21to30(toolId, inputs, profile) ??
    getToolPrompt31to40(toolId, inputs, profile) ??
    null
  )
}

// ─────────────────────────────────────────────────────────────
// Validation delegated to validateToolInputs (covers all 40 tools)
// ─────────────────────────────────────────────────────────────
function validateInputs(
  toolId: string,
  raw:    Record<string, unknown>,
) {
  return validateToolInputs(toolId, raw)
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: { toolId: string } },
) {
  const { toolId } = params

  // ── 1. Validate tool exists ──────────────────────────────
  const tool = getTool(toolId)
  if (!tool) return errResponse(ERR.TOOL_NOT_FOUND, toolId)

  // ── 2. Authenticate user ─────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return errResponse(ERR.UNAUTHENTICATED)

  const userId = user.id

  // ── 3. Fetch profile ─────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile) return errResponse(ERR.PROFILE_MISSING)

  // ── 4. Parse body FIRST — needed to determine free run before coin check ──
  // (body must be read here so isFreeRun can bypass the coin check below)
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return errResponse(ERR.VALIDATION_FAILED, 'Invalid request body')
  }

  const inputs       = (body.inputs as Record<string, unknown>) ?? {}
  const isOnboarding = Boolean(body.isOnboarding)
  const isFreeRun    = Boolean(body.freeRun)   // sent by FreeToolWidget with ?free=1

  // ── 5. Plan + free-run eligibility ──────────────────────
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_tier, status')
    .eq('user_id', userId)
    .single()

  const planTier     = subscription?.plan_tier || 'free'
  const isEnterprise = planTier === 'enterprise'
  const coinCost     = tool.coinCost

  // Check free-run eligibility BEFORE the coin balance check so users with
  // zero coins can still claim their one free tool from the dashboard widget.
  let eligibleForFreeRun = false
  if (isFreeRun && !isEnterprise) {
    const { data: profCheck } = await supabase
      .from('profiles' as any)
      .select('free_tool_used')
      .eq('id', userId)
      .single()
    eligibleForFreeRun = !profCheck?.free_tool_used
  }

  const skipCoins = isEnterprise || isOnboarding || eligibleForFreeRun

  // ── 6. Coin balance check (skipped for enterprise, onboarding, free run) ─
  let balance = 0
  if (!skipCoins) {
    const { data: coinData } = await supabase
      .from('coin_balances')
      .select('balance')
      .eq('user_id', userId)
      .single()

    balance = coinData?.balance ?? 0

    if (!canAffordTool(toolId, balance)) {
      return errResponse(ERR.INSUFFICIENT_COINS, `Need ${coinCost}, have ${balance}`)
    }
  }

  // ── 7. Rate limit (10 req/min/user) ─────────────────────
  const { success: ratePassed, remaining } = await ratelimit.limit(userId)
  if (!ratePassed) {
    return errResponse(ERR.RATE_LIMITED, `${remaining} requests remaining this minute`)
  }

  const validated = validateInputs(toolId, inputs)
  if (!validated.success) {
    return errResponse(ERR.VALIDATION_FAILED, validated.errors.join(' | '))
  }

  // ── 7. Build 3-layer prompt ──────────────────────────────
  const profileContext = buildProfileContext(profile as ProfileContext)
  const toolPrompt     = getToolPrompt(toolId, validated.data, profile as ProfileContext)

  if (!toolPrompt) {
    return errResponse(ERR.PROMPT_MISSING, `No prompt defined for ${toolId}`)
  }

  const systemPrompt = [
    CEREBRE_MASTER_SYSTEM_PROMPT,
    '\n\n',
    profileContext,
  ].join('')

  // ── 8. Stream from Claude ────────────────────────────────
  let generationId: string | null = null
  let totalTokens  = 0
  let didComplete  = false

  // Pre-insert generation row in pending state (for recovery if stream dies)
  const { data: genRow } = await supabase
    .from('generations' as any)
    .insert({
      user_id:    userId,
      tool_id:    toolId,
      tool_name:  tool.name,
      inputs:     validated.data,
      status:     'streaming',
      coin_cost:  skipCoins ? 0 : coinCost,
    })
    .select('id')
    .single() as any

  generationId = genRow?.id ?? null

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model:      'claude-sonnet-4-5',
          max_tokens: 8192,
          system:     systemPrompt,
          messages: [
            { role: 'user', content: toolPrompt },
          ],
          stream: true,
        })

        let fullText = ''

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            fullText += chunk
            // Send the chunk to the client in Vercel AI SDK data-stream format
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`))
          }

          if (event.type === 'message_delta') {
            totalTokens = event.usage?.output_tokens ?? 0
          }

          if (event.type === 'message_stop') {
            didComplete = true

            // ── 9. Atomic coin deduction (onFinish) ───────
            if (!skipCoins && generationId) {
              const { error: deductError } = await supabase.rpc('deduct_coins', {
                p_user_id:       userId,
                p_amount:        coinCost,
                p_tool_id:       toolId,
                p_generation_id: generationId,
              })

              if (deductError) {
                // Refund if deduction RPC fails (shouldn't happen — RPC uses FOR UPDATE lock)
                console.error('[generate] coin deduction failed:', deductError)
              }
            }

            // ── 10. Save complete generation ──────────────
            if (generationId) {
              await supabase
                .from('generations')
                .update({
                  output:      fullText,
                  status:      'complete',
                  tokens_used: totalTokens,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', generationId)
            }

            // ── 10b. Mark free tool as used (one-time) ────
            if (eligibleForFreeRun) {
              await supabase
                .from('profiles' as any)
                .update({ free_tool_used: true, free_tool_id: toolId })
                .eq('id', userId)
            }

            // ── 11. Check milestones ───────────────────────
            checkMilestones(userId, supabase).catch(console.error)

            // ── 12. Analytics ──────────────────────────────────
            trackEvent('generation_complete', {
              distinct_id: userId,
              tool_id:     toolId,
              tool_name:   tool.name,
              coin_cost:   skipCoins ? 0 : coinCost,
              plan_tier:   planTier,
              tokens:      totalTokens,
              is_onboarding: isOnboarding,
              city:        profile.city,
              industry:    profile.industry,
            })

            // Send the finish signal
            controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`))
          }
        }
      } catch (err: any) {
        console.error('[generate] streaming error:', err)

        // Mark generation as failed
        if (generationId) {
          await supabase
            .from('generations')
            .update({ status: 'failed' })
            .eq('id', generationId)
        }

        // If coins were not deducted (stream died before onFinish), nothing to refund
        // If stream completed but deduction failed, the RPC handles the refund

        controller.enqueue(
          encoder.encode(`3:${JSON.stringify({ code: 'GENERATION_FAILED', message: ERR.GENERATION_FAILED.message })}\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  // Return the stream in Vercel AI SDK format
  return new Response(stream, {
    headers: {
      'Content-Type':                    'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream':         'v1',
      'Cache-Control':                   'no-cache',
      'Connection':                      'keep-alive',
      'X-Generation-Id':                 generationId ?? '',
      'X-Coin-Cost':                     String(skipCoins ? 0 : coinCost),
      'X-Balance-Before':                String(balance),
      'X-Balance-After':                 String(balance - (skipCoins ? 0 : coinCost)),
    },
  })
}

// ─────────────────────────────────────────────────────────────
// MILESTONE CHECKER (runs after generation, never blocks stream)
// ─────────────────────────────────────────────────────────────

async function checkMilestones(userId: string, supabase: any) {
  const { count } = await supabase
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'complete')

  const milestones = [1, 10, 25, 50, 100, 250, 500]
  if (milestones.includes(count ?? 0)) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type:    'milestone',
      payload: { generations: count },
      read:    false,
    })
  }
}

// ─────────────────────────────────────────────────────────────
// ROUTE CONFIG — Edge runtime for lowest latency streaming
// ─────────────────────────────────────────────────────────────

export const runtime = 'nodejs'    // Node for Anthropic SDK streaming
export const dynamic = 'force-dynamic'
export const maxDuration = 60      // 60-second timeout for longest generations
