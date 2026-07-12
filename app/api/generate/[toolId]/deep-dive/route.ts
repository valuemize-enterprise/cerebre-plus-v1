// ═══════════════════════════════════════════════════════════════
// /app/api/generate/[toolId]/deep-dive/route.ts
//
// Called when the user taps "Tell me more" on a v2 tool output.
// Generates Layer 3 (Deep Dive) and appends it to the existing
// generation row. Deducts the full coin cost.
//
// Request: POST { generation_id: string }
// Response: { deep_dive_json, coins_spent, balance_after }
// ═══════════════════════════════════════════════════════════════

import { NextRequest }           from 'next/server'
import Anthropic                 from '@anthropic-ai/sdk'
import { createServerClient }    from '@/lib/supabase/server'
import { getTool }               from '@/lib/tools/registry'
import { CEREBRE_MASTER_SYSTEM_PROMPT, buildProfileContext, type ProfileContext } from '@/lib/ai/master-system-prompt'
import { getToolPrompt1to10 }    from '@/lib/ai/tool-prompts-1-10'
import { getToolPrompt11to20 }   from '@/lib/ai/tool-prompts-11-20'
import { getToolPrompt21to30 }   from '@/lib/ai/tool-prompts-21-30'
import { getToolPrompt31to40 }   from '@/lib/ai/tool-prompts-31-40'
import { getDeepDiveSuffix }     from '@/lib/tools/output-prompt-utils'
import type { OutputGroup }      from '@/lib/tools/output-schemas'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function extractJson(text: string): string {
  try { JSON.parse(text); return text } catch {}
  let s = text.trim().replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '').trim()
  try { JSON.parse(s); return s } catch {}
  const firstBrace = s.indexOf('{')
  const lastBrace = s.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1)
    try { JSON.parse(s); return s } catch {}
  }
  s = repairTruncatedJson(s)
  try { JSON.parse(s); return s } catch {}
  throw new Error('All JSON extraction strategies failed')
}

function repairTruncatedJson(text: string): string {
  let result = text.replace(/,\s*$/, '')
  let inString = false, escaped = false, openQuoteCount = 0
  for (let i = 0; i < result.length; i++) {
    const ch = result[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\') { escaped = true; continue }
    if (ch === '"') { inString = !inString; openQuoteCount++ }
  }
  if (openQuoteCount % 2 !== 0) result += '"'
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

const ERR = {
  NOT_FOUND:          { code: 'NOT_FOUND',          status: 404, message: 'Generation not found.'                            },
  UNAUTHENTICATED:    { code: 'UNAUTHENTICATED',    status: 401, message: 'Please log in to continue.'                      },
  PROFILE_MISSING:    { code: 'PROFILE_MISSING',    status: 422, message: 'Profile not found.'                              },
  TOOL_NOT_FOUND:     { code: 'TOOL_NOT_FOUND',     status: 404, message: 'Tool not found.'                                 },
  INSUFFICIENT_COINS: { code: 'INSUFFICIENT_COINS', status: 402, message: 'Not enough coins for the Deep Dive.'             },
  ALREADY_GENERATED:  { code: 'ALREADY_GENERATED',  status: 409, message: 'Deep Dive already generated for this output.'    },
  GENERATION_FAILED:  { code: 'GENERATION_FAILED',  status: 500, message: 'Deep Dive generation failed. No coins deducted.' },
  VALIDATION_FAILED:  { code: 'VALIDATION_FAILED',  status: 400, message: 'Invalid request.'                                },
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

export async function POST(
  request: NextRequest,
  { params }: { params: { toolId: string } },
) {
  const { toolId } = params

  // ── 1. Auth ──────────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return errR(ERR.UNAUTHENTICATED)
  const userId = user.id

  // ── 2. Parse body ────────────────────────────────────────
  let body: { generation_id: string }

  try { body = await request.json() }
  catch { return errR(ERR.VALIDATION_FAILED, 'Invalid request body') }
  console.log('[deep-dive] request body:', body.generation_id)

  if (!body.generation_id) return errR(ERR.VALIDATION_FAILED, 'generation_id is required')

  // ── 3. Fetch existing generation ─────────────────────────
  const { data: gen, error: genErr } = await supabase
    .from('generations')
    .select('id, tool_id, tool_name, input_data, output_json, deep_dive_json, output_group, schema_version, user_id')
    .eq('id', body.generation_id)
    .eq('user_id', userId)   // security: user can only access their own generations
    .single() as any

  if (genErr || !gen) return errR(ERR.NOT_FOUND, body.generation_id)
  if (gen.schema_version !== 2) return errR(ERR.VALIDATION_FAILED, 'This generation does not support Deep Dive')
  if (gen.deep_dive_json !== null) return errR(ERR.ALREADY_GENERATED, 'Deep Dive already exists for this generation')

  // ── 4. Tool + profile ────────────────────────────────────
  const tool = getTool(toolId)
  if (!tool) return errR(ERR.TOOL_NOT_FOUND, toolId)

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!profile) return errR(ERR.PROFILE_MISSING)

  // ── 5. Coin check ────────────────────────────────────────
  const fullCost = tool.coinCost
  const { data: coinData } = await supabase.from('coin_balances').select('balance').eq('user_id', userId).single()
  const balance = coinData?.balance ?? 0

  if (balance < fullCost) {
    return errR(ERR.INSUFFICIENT_COINS, `Deep Dive costs ${fullCost} coins. You have ${balance}.`)
  }

  // ── 6. Build Deep Dive prompt ────────────────────────────
  // ── 6a. Design tools — text Deep Dive (no image call) ─────────
  if (gen.output_group === 'design') {
    const designJson   = gen.output_json as any
    const designBrief  = designJson?.design_brief || ''
    const bizName      = profile?.business_name || 'the business'
    const pCtx         = buildProfileContext(profile as ProfileContext)
    const sysP         = [CEREBRE_MASTER_SYSTEM_PROMPT, '\n\n', pCtx].join('')
    const ddP = `A ${gen.tool_name || toolId} design was created for ${bizName}.
Brief: ${designBrief}
Brand DNA (colors, voice, logo) was applied.
Generate a JSON Deep Dive. Return ONLY valid JSON, no markdown fences:
{
  "design_notes": "[50-70 words — why this design works for ${bizName}]",
  "brand_guidelines_used": "[30 words — which brand elements were applied]",
  "usage_tips": [
    "[Specific usage tip 1]",
    "[Best platform/time to post]",
    "[How to adapt for different needs]",
    "[What to pair with for best results]",
    "[How to measure performance]"
  ],
  "caption_expanded": "[100-120 words — complete ready-to-post caption for ${bizName} with Nigerian context, 5 hashtags, WhatsApp CTA]"
}`
    const aiR = await anthropic.messages.create({ model:'claude-sonnet-4-6', max_tokens:900, system:sysP, messages:[{role:'user',content:ddP}] })
    const rawT = aiR.content.filter((c:any)=>c.type==='text').map((c:any)=>c.text).join('')
    let ddObj: Record<string,unknown>
    try { ddObj = JSON.parse(extractJson(rawT)) } catch { ddObj = {design_notes:rawT.slice(0,400),usage_tips:[],caption_expanded:''} }
    await supabase.rpc('deduct_coins_deep_dive' as any,{p_user_id:userId,p_deep_dive_cost:fullCost,p_tool_id:toolId,p_generation_id:body.generation_id})
    await supabase.from('generations'as any).update({deep_dive_json:ddObj,deep_dive_coin_cost:fullCost,output_json:{...(gen.output_json as object),deep_dive:ddObj}}).eq('id',body.generation_id)
    return new Response(JSON.stringify({deep_dive_json:ddObj,coins_spent:fullCost,generation_id:body.generation_id}),{status:200,headers:{'Content-Type':'application/json'}})
  }

  const profileContext = buildProfileContext(profile as ProfileContext)
  const systemPrompt   = [CEREBRE_MASTER_SYSTEM_PROMPT, '\n\n', profileContext].join('')

  // Re-build the original tool prompt with original inputs
  const originalInputs = gen.input_data as Record<string, any> ?? {}
  const toolPrompt     = getToolPrompt(toolId, originalInputs, profile as ProfileContext)

  const deepDiveSuffix = getDeepDiveSuffix(
    (gen.output_group || toolId) as OutputGroup,
    profile.business_name || 'the business'
  )

  // The deep dive prompt includes:
  // 1. Original tool prompt (same context)
  // 2. The existing essentials (so Claude can reference what was already shown)
  // 3. Deep Dive specific instruction
  const existingEssentials = gen.output_json
    ? JSON.stringify({ headline: (gen.output_json as any).headline, essentials: (gen.output_json as any).essentials }, null, 2)
    : 'No existing essentials available'

  const deepDivePrompt = `${toolPrompt || ''}

The user has already seen this initial output:
${existingEssentials}

Now generate the complete Deep Dive.
${deepDiveSuffix}

Return ONLY a valid JSON object with this structure:
{
  "headline": "[same headline as the initial output]",
  "platform": "[same platform if applicable]",
  "essentials": [same essentials object as above — copy it verbatim],
  "deep_dive": {
    [all deep_dive sub-fields for the ${gen.output_group || toolId} group — fully populated, max 1000 words total]
  }
}
`

  // ── 7. Generate Deep Dive ────────────────────────────────
  const MAX_RETRIES = 2
  let deepDiveJson: unknown = null
  let aiResponse: any = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      aiResponse = await anthropic.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 8192,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: deepDivePrompt }],
      })

      const stopReason = aiResponse.stop_reason
      const rawText = aiResponse.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('')
      console.error(`[deep-dive] attempt ${attempt + 1} stop_reason: ${stopReason}, raw length: ${rawText.length}, first 300 chars:`, rawText.slice(0, 300))

      try {
        deepDiveJson = JSON.parse(extractJson(rawText))
        break
      } catch {
        console.error(`[deep-dive] JSON parse failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Raw:`, rawText.slice(0, 500))
        if (attempt === MAX_RETRIES) {
          return errR(ERR.GENERATION_FAILED, 'AI response was not valid JSON — please retry')
        }
      }
    } catch (aiErr: any) {
      console.error(`[deep-dive] AI call failed (attempt ${attempt + 1}):`, aiErr?.message)
      if (attempt === MAX_RETRIES) throw aiErr
    }
  }

  const deepDiveObject = (deepDiveJson as any)?.deep_dive ?? deepDiveJson

  // ── 8. Deduct coins ──────────────────────────────────────
  const { data: deductResult, error: deductErr } = await supabase.rpc('deduct_coins_deep_dive' as any, {
    p_user_id:        userId,
    p_deep_dive_cost: fullCost,
    p_tool_id:        toolId,
    p_generation_id:  body.generation_id,
  })

  if (deductErr || !(deductResult as any)?.success) {
    console.error('[deep-dive] coin deduction failed:', deductErr || deductResult)
    return errR(ERR.INSUFFICIENT_COINS, 'Coin deduction failed — please retry')
  }

  // ── 9. Save Deep Dive to generation row ──────────────────
  await supabase
    .from('generations' as any)
    .update({
      deep_dive_json:     deepDiveObject,
      deep_dive_coin_cost: fullCost,
      output_json: {
        ...(gen.output_json as object),
        deep_dive: deepDiveObject,
      },
    })
    .eq('id', body.generation_id)

  return new Response(
    JSON.stringify({
      deep_dive_json:  deepDiveObject,
      coins_spent:     fullCost,
      balance_after:   (deductResult as any).balance_after,
      generation_id:   body.generation_id,
    }),
    {
      status: 200,
      headers: {
        'Content-Type':    'application/json',
        'X-Coins-Spent':   String(fullCost),
        'X-Balance-After': String((deductResult as any).balance_after),
      },
    },
  )
}

export const runtime     = 'nodejs'
export const dynamic     = 'force-dynamic'
export const maxDuration = 60
