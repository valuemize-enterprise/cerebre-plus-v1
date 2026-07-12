// ═══════════════════════════════════════════════════════════════
// /app/api/generate/[toolId]/route.ts  (v2 — Output System upgrade)
//
// TWO GENERATION MODES:
//   MODE A — Legacy streaming (tools without outputGroup in registry)
//   MODE B — JSON non-streaming (tools WITH outputGroup in registry)
//             Deducts 70% of coinCost on initial call.
//             Deep Dive handled by separate /deep-dive route.
// ═══════════════════════════════════════════════════════════════

import { NextRequest }             from 'next/server'
import Anthropic                   from '@anthropic-ai/sdk'
import { createServerClient }      from '@/lib/supabase/server'
import { getTool }                 from '@/lib/tools/registry'
import { CEREBRE_MASTER_SYSTEM_PROMPT, buildProfileContext, type ProfileContext } from '@/lib/ai/master-system-prompt'
import { getToolPrompt1to10 }      from '@/lib/ai/tool-prompts-1-10'
import { getToolPrompt11to20 }     from '@/lib/ai/tool-prompts-11-20'
import { getToolPrompt21to30 }     from '@/lib/ai/tool-prompts-21-30'
import { getToolPrompt31to40 }     from '@/lib/ai/tool-prompts-31-40'
import { validateToolInputs }      from '@/lib/validations/tool-schemas'
import { getSchemaInstruction }    from '@/lib/tools/output-prompt-utils'
import { validateOutputSchema }    from '@/lib/tools/output-schemas'
import { Ratelimit }               from '@upstash/ratelimit'
import { Redis }                   from '@upstash/redis'

async function trackEvent(event: string, props: Record<string, unknown>) {
  const token = process.env.MIXPANEL_TOKEN
  if (!token) return
  try {
    const payload = Buffer.from(JSON.stringify({
      event, properties: { token, ...props, time: Math.floor(Date.now() / 1000) },
    })).toString('base64')
    fetch(`https://api.mixpanel.com/track?data=${payload}`, { method: 'GET' }).catch(() => {})
  } catch { /* analytics never blocks */ }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60s'),
  prefix: 'cerebre:generate',
})

const ERR = {
  TOOL_NOT_FOUND:     { code: 'TOOL_NOT_FOUND',     status: 404, message: 'Tool not found. Please refresh the page.'              },
  UNAUTHENTICATED:    { code: 'UNAUTHENTICATED',    status: 401, message: 'Please log in to continue.'                            },
  PROFILE_MISSING:    { code: 'PROFILE_MISSING',    status: 422, message: 'Complete your profile to run this tool.'               },
  INSUFFICIENT_COINS: { code: 'INSUFFICIENT_COINS', status: 402, message: 'Not enough Cerebre Coins. Please top up to continue.'  },
  RATE_LIMITED:       { code: 'RATE_LIMITED',       status: 429, message: 'Too many requests. Please wait a moment and try again.'},
  VALIDATION_FAILED:  { code: 'VALIDATION_FAILED',  status: 400, message: 'Please check all required fields and try again.'       },
  GENERATION_FAILED:  { code: 'GENERATION_FAILED',  status: 500, message: 'Generation failed. No coins were deducted.'            },
  PROMPT_MISSING:     { code: 'PROMPT_MISSING',     status: 500, message: 'Tool prompt configuration error. Contact support.'     },
  SCHEMA_INVALID:     { code: 'SCHEMA_INVALID',     status: 500, message: 'Unexpected AI response format. Please retry.'          },
} as const

function errR(err: typeof ERR[keyof typeof ERR], detail?: string) {
  return new Response(
    JSON.stringify({ error: err.code, message: err.message, detail }),
    { status: err.status, headers: { 'Content-Type': 'application/json' } },
  )
}

function getToolPrompt(toolId: string, inputs: Record<string, any>, profile: ProfileContext): string | null {
  return (
    getToolPrompt1to10(toolId, inputs, profile)  ??
    getToolPrompt11to20(toolId, inputs, profile) ??
    getToolPrompt21to30(toolId, inputs, profile) ??
    getToolPrompt31to40(toolId, inputs, profile) ??
    null
  )
}

function calcInitialCost(fullCost: number): number {
  return Math.max(1, Math.round(fullCost * 0.7))
}

function extractJson(text: string): string {
  // Strategy 1: try parsing as-is
  try { JSON.parse(text); return text } catch {}

  // Strategy 2: strip markdown fences
  let s = text.trim().replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '').trim()
  try { JSON.parse(s); return s } catch {}

  // Strategy 3: find outermost { ... } pair
  const firstBrace = s.indexOf('{')
  const lastBrace = s.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1)
    try { JSON.parse(s); return s } catch {}
  }

  // Strategy 4: try to repair truncated JSON
  s = repairTruncatedJson(s)
  try { JSON.parse(s); return s } catch {}

  throw new Error('All JSON extraction strategies failed')
}

function repairTruncatedJson(text: string): string {
  let result = text.replace(/,\s*$/, '')

  // Close unclosed strings: count unescaped quotes
  let inString = false, escaped = false
  let openQuoteCount = 0
  for (let i = 0; i < result.length; i++) {
    const ch = result[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\') { escaped = true; continue }
    if (ch === '"') {
      inString = !inString
      openQuoteCount++
    }
  }
  if (openQuoteCount % 2 !== 0) {
    result += '"'
  }

  // Count open vs close braces and brackets on the FINAL result
  let braces = 0, brackets = 0
  inString = false; escaped = false
  for (let i = 0; i < result.length; i++) {
    const ch = result[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\') { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (!inString) {
      if (ch === '{') braces++
      if (ch === '}') braces--
      if (ch === '[') brackets++
      if (ch === ']') brackets--
    }
  }

  while (brackets > 0) { result += ']'; brackets-- }
  while (braces > 0) { result += '}'; braces-- }

  return result
}

export async function POST(
  request: NextRequest,
  { params }: { params: { toolId: string } },
) {
  const { toolId } = params
  const tool = getTool(toolId)
  if (!tool) return errR(ERR.TOOL_NOT_FOUND, toolId)

  const isV2        = Boolean((tool as any).outputGroup)
  const outputGroup = (tool as any).outputGroup as string | undefined

  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return errR(ERR.UNAUTHENTICATED)
  const userId = user.id

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!profile) return errR(ERR.PROFILE_MISSING)

  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return errR(ERR.VALIDATION_FAILED, 'Invalid request body') }

  const inputs       = (body.inputs as Record<string, unknown>) ?? {}
  const isOnboarding = Boolean(body.isOnboarding)
  const isFreeRun    = Boolean(body.freeRun)

  const { data: subscription } = await supabase.from('subscriptions').select('plan_tier, status').eq('user_id', userId).single() 
  const planTier     = subscription?.plan_tier || 'free'
  const isEnterprise = planTier === 'enterprise'
  const fullCost     = tool.coinCost
  const initialCost  = isV2 ? calcInitialCost(fullCost) : fullCost

  let eligibleForFreeRun = false
  if (isFreeRun && !isEnterprise) {
    const { data: profCheck } = await supabase.from('profiles').select('free_tool_used').eq('id', userId).single() as any
    eligibleForFreeRun = !profCheck?.free_tool_used
  }

  const skipCoins = isEnterprise || isOnboarding || eligibleForFreeRun

  let balance = 0
  if (!skipCoins) {
    const { data: coinData } = await supabase.from('coin_balances').select('balance').eq('user_id', userId).single()
    balance = coinData?.balance ?? 0
    const costToCheck = isV2 ? initialCost : fullCost
    if (balance < costToCheck) {
      return errR(ERR.INSUFFICIENT_COINS, `Need ${costToCheck} coins, have ${balance}`)
    }
  }

  const { success: ratePassed } = await ratelimit.limit(userId)
  if (!ratePassed) return errR(ERR.RATE_LIMITED)

  const validated = validateToolInputs(toolId, inputs)
  if (!validated.success) return errR(ERR.VALIDATION_FAILED, validated.errors.join(' | '))

  const profileContext = buildProfileContext(profile as ProfileContext)
  const toolPrompt     = getToolPrompt(toolId, validated.data, profile as ProfileContext)
  if (!toolPrompt) return errR(ERR.PROMPT_MISSING, toolId)

  const systemPrompt = [CEREBRE_MASTER_SYSTEM_PROMPT, '\n\n', profileContext].join('')

  const schemaInstruction = isV2 && outputGroup
    ? getSchemaInstruction({
        group:        outputGroup as any,
        businessName: profile.business_name || 'the business',
        platform:     (validated.data as any).platform || 'Instagram',
        numVariants:  parseInt((validated.data as any).num_variations || '3', 10),
        numMessages:  parseInt((validated.data as any).num_messages || '5', 10),
        formula:      'Hook · Fear · Proof · Awoof · CTA',
        timeframe:    (validated.data as any).timeframe || '60 days',
        month:        new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        totalPosts:   30,
        subject:      profile.business_name || 'your business',
      })
    : null

  const finalPrompt = schemaInstruction ? `${toolPrompt}\n\n${schemaInstruction}` : toolPrompt

  const generationInsertPayload = {
    user_id:           userId,
    tool_id:           toolId,
    tool_name:         tool.name,
    tool_category:     tool.category,
    input_data:        validated.data,
    status:            'streaming',
    coins_deducted:    skipCoins ? 0 : (isV2 ? initialCost : fullCost),
    schema_version:    isV2 ? 2 : 1,
    output_group:      outputGroup ?? null,
    initial_coin_cost: skipCoins ? 0 : (isV2 ? initialCost : null),
  } as any

  const { data: genRow, error: insertErr } = await supabase.from('generations').insert(generationInsertPayload).select('id').single()
  if (insertErr) console.error('[generate] generations insert failed:', insertErr.message, insertErr.details)

  const generationId = genRow?.id ?? null

  // ═══════════════ MODE B — V2 JSON ═══════════════
  if (isV2) {
    const MAX_RETRIES = 2
    let outputJson: unknown = null
    let aiResponse: any = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        aiResponse = await anthropic.messages.create({
          model:      'claude-sonnet-4-6',
          max_tokens: 8192,
          system:     systemPrompt,
          messages:   [{ role: 'user', content: finalPrompt }],
        })

        const stopReason = aiResponse.stop_reason
        const rawText = aiResponse.content.filter((c: any) => c.type === 'text').map((c: any) => (c as any).text).join('')
        console.error(`[v2] attempt ${attempt + 1} stop_reason: ${stopReason}, raw length: ${rawText.length}, first 300 chars:`, rawText.slice(0, 300))

        try {
          outputJson = JSON.parse(extractJson(rawText))
          break
        } catch (parseErr) {
          console.error(`[v2] JSON parse failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Raw:`, rawText.slice(0, 500))
          if (attempt === MAX_RETRIES) {
        if (generationId) await supabase.from('generations').update({ status: 'failed' } as any).eq('id', generationId)
            return errR(ERR.SCHEMA_INVALID, 'AI response was not valid JSON — please retry')
          }
        }
      } catch (aiErr: any) {
        console.error(`[v2] AI call failed (attempt ${attempt + 1}):`, aiErr?.message)
        if (attempt === MAX_RETRIES) throw aiErr
      }
    }

    let validatedOutput: any
    try { validatedOutput = validateOutputSchema(outputJson, outputGroup as any) }
    catch (schemaErr: any) {
      console.error('[v2] Schema validation failed:', schemaErr.message)
      validatedOutput = { ...(outputJson as object), output_group: outputGroup, schema_version: 2 }
    }

    if (!skipCoins && generationId) {
      const { error: deductErr } = await supabase.rpc('deduct_coins_initial' as any, {
        p_user_id: userId, p_initial_cost: initialCost,
        p_full_cost: fullCost, p_tool_id: toolId, p_generation_id: generationId,
      })
      if (deductErr) console.error('[v2] coin deduction failed:', deductErr)
    }

    if (generationId) {
      const { error: updateErr } = await supabase.from('generations').update({
        output_json:      validatedOutput,
        output_content:   JSON.stringify(validatedOutput),
        status:           'complete',
        token_count:      aiResponse.usage.output_tokens,
      }).eq('id', generationId)
      if (updateErr) console.error('[v2] generation update failed:', updateErr.message)
    }

    if (eligibleForFreeRun) {
      await supabase.from('profiles' as any).update({ free_tool_used: true, free_tool_id: toolId }).eq('id', userId)
    }

    checkMilestones(userId, supabase).catch(console.error)
    trackEvent('generation_complete_v2', {
      distinct_id: userId, tool_id: toolId, output_group: outputGroup,
      initial_cost: skipCoins ? 0 : initialCost, full_cost: fullCost,
      plan_tier: planTier, tokens: aiResponse.usage.output_tokens,
    })

    const responseData = {
      generation_id:  generationId,
      output_json:    validatedOutput,
      coins_spent:    skipCoins ? 0 : initialCost,
      balance_after:  balance - (skipCoins ? 0 : initialCost),
      deep_dive_cost: fullCost,
      schema_version: 2,
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const chunk = `0:${JSON.stringify(JSON.stringify(responseData))}\n`
        controller.enqueue(encoder.encode(chunk))
        const tokens = aiResponse?.usage?.output_tokens ?? 0
        controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${tokens}}}\n`))
        controller.close()
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type':         'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
        'Cache-Control':        'no-cache',
        'Connection':           'keep-alive',
        'X-Generation-Id':      generationId ?? '',
        'X-Coins-Spent':        String(skipCoins ? 0 : initialCost),
        'X-Deep-Dive-Cost':     String(fullCost),
        'X-Balance-After':      String(balance - (skipCoins ? 0 : initialCost)),
        'X-Coin-Cost':          String(skipCoins ? 0 : initialCost),
      },
    })
  }

  // ═══════════════ MODE A — V1 Streaming ═══════════════
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6', max_tokens: 8192, system: systemPrompt,
          messages: [{ role: 'user', content: finalPrompt }], stream: true,
        })

        let fullText = '', totalTokens = 0

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            fullText += chunk
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`))
          }
          if (event.type === 'message_delta') totalTokens = event.usage?.output_tokens ?? 0
          if (event.type === 'message_stop') {
            if (!skipCoins && generationId) {
              await supabase.rpc('deduct_coins', { p_user_id: userId, p_amount: fullCost, p_tool_id: toolId, p_generation_id: generationId })
            }
            if (generationId) {
              await supabase.from('generations').update({
                output_content: fullText, status: 'complete', token_count: totalTokens,
              }).eq('id', generationId)
            }
            if (eligibleForFreeRun) {
              await supabase.from('profiles' as any).update({ free_tool_used: true, free_tool_id: toolId }).eq('id', userId)
            }
            checkMilestones(userId, supabase).catch(console.error)
            trackEvent('generation_complete', { distinct_id: userId, tool_id: toolId, coin_cost: skipCoins ? 0 : fullCost })
            controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${totalTokens}}}\n`))
          }
        }
      } catch (err: any) {
        if (generationId) await supabase.from('generations').update({ status: 'failed' }).eq('id', generationId)
        controller.enqueue(encoder.encode(`3:${JSON.stringify({ code: 'GENERATION_FAILED', message: ERR.GENERATION_FAILED.message })}\n`))
      } finally { controller.close() }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8', 'X-Vercel-AI-Data-Stream': 'v1',
      'Cache-Control': 'no-cache', 'Connection': 'keep-alive',
      'X-Generation-Id': generationId ?? '', 'X-Coin-Cost': String(skipCoins ? 0 : fullCost),
    },
  })
}

async function checkMilestones(userId: string, supabase: any) {
  const { count } = await supabase.from('generations').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'complete')
  if ([1, 10, 25, 50, 100, 250, 500].includes(count ?? 0)) {
    await supabase.from('notifications').insert({ user_id: userId, type: 'milestone', payload: { generations: count }, read: false })
  }
}

export const runtime     = 'nodejs'
export const dynamic     = 'force-dynamic'
export const maxDuration = 60
