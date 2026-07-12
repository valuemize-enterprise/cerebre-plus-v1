// /app/api/generate/strategy-brain/route.ts
// StrategyBrain generation — powered by the Sprint Blueprint prompt engine.
// Saves to generations table as tool_id: 'strategy-brain', tool_name: 'StrategyBrain'.

import { NextRequest }       from 'next/server'
import Anthropic             from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'
import { buildSprintBlueprintPrompt, type SprintBlueprintInputs } from '@/lib/tools/blueprints/sprint-blueprint-prompt'

const client    = new Anthropic()
const COIN_COST = 50
const TOOL_ID   = 'strategy-brain'
const TOOL_NAME = 'StrategyBrain'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Coin check (with free-run support) ───────────────────
  const body = await request.json()
  const isFreeRun = Boolean(body.freeRun)

  let eligibleForFreeRun = false
  if (isFreeRun) {
    const { data: profCheck } = await supabase
      .from('profiles' as any).select('free_tool_used').eq('id', user.id).single()
    eligibleForFreeRun = !profCheck?.free_tool_used
  }

  const skipCoins = eligibleForFreeRun

  if (!skipCoins) {
    const { data: balance } = await supabase
      .from('coin_balances').select('balance').eq('user_id', user.id).single()
    if (!balance || balance.balance < COIN_COST) {
      return new Response(JSON.stringify({
        error: 'Insufficient coins', required: COIN_COST, current: balance?.balance || 0,
      }), { status: 402, headers: { 'Content-Type': 'application/json' } })
    }
  }

  // ── Build prompt ─────────────────────────────────────────
  const { inputs } = body as { inputs: SprintBlueprintInputs }
  const prompt     = buildSprintBlueprintPrompt(inputs)

  // ── Save pending generation row ──────────────────────────
  const { data: genRecord } = await supabase
    .from('generations' as any)
    .insert({
      user_id:   user.id,
      tool_id:   TOOL_ID,
      tool_name: TOOL_NAME,
      inputs:    inputs,
      coin_cost: skipCoins ? 0 : COIN_COST,
      status:    'streaming',
    })
    .select('id')
    .single()

  // ── Stream ───────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Send generation ID immediately so the client can use it for ratings
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ generationId: genRecord?.id })}\n\n`
      ))

      let fullText = ''

      try {
        const claudeStream = await client.messages.create({
          model:      'claude-sonnet-4-5',
          max_tokens: 8000,
          stream:     true,
          system: [
            'You are StrategyBrain — a high-performance marketing strategist inside Cerebre Plus.',
            'You write precise, actionable 60-day marketing execution documents for Nigerian businesses.',
            'Every recommendation references specific numbers, platforms, and actions.',
            'You never use filler phrases or generic advice.',
            'Your output will be formatted with clear section headers so it renders beautifully in the app.',
          ].join(' '),
          messages: [{ role: 'user', content: prompt }],
        })

        for await (const event of claudeStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            fullText += chunk
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ text: chunk })}\n\n`
            ))
          }

          if (event.type === 'message_stop') {
            // Deduct coins and mark generation complete in parallel
            const results = await Promise.allSettled([
              skipCoins
                ? Promise.resolve()
                : supabase.rpc('deduct_design_coins' as any, {
                    p_user_id: user.id,
                    p_amount:  COIN_COST,
                    p_tool_id: TOOL_ID,
                    p_engine:  'base',
                  }),
              supabase.from('generations').update({
                output:       fullText,
                status:       'complete',
                completed_at: new Date().toISOString(),
              }).eq('id', genRecord?.id).eq('user_id', user.id),
              eligibleForFreeRun
                ? supabase.from('profiles' as any).update({ free_tool_used: true, free_tool_id: TOOL_ID }).eq('id', user.id)
                : Promise.resolve(),
            ])
            if (results[0].status === 'rejected') {
              console.error('[strategy-brain] coin deduction failed:', results[0].reason)
            }

            controller.enqueue(encoder.encode('data: {"done":true}\n\n'))
          }
        }
      } catch (err) {
        console.error('[strategy-brain]', err)
        if (genRecord?.id) {
          await supabase.from('generations').update({ status: 'failed' }).eq('id', genRecord.id)
        }
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ error: 'Generation failed. No coins were deducted.' })}\n\n`
        ))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}

export const dynamic     = 'force-dynamic'
export const maxDuration = 120
