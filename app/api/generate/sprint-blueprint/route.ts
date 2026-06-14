// /app/api/generate/sprint-blueprint/route.ts
// Streaming generation endpoint for the 60-Day Sprint Blueprint.

import { NextRequest }   from 'next/server'
import Anthropic         from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'
import { buildSprintBlueprintPrompt, type SprintBlueprintInputs } from '@/lib/tools/blueprints/sprint-blueprint-prompt'

const client = new Anthropic()
const COIN_COST = 50

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: {'Content-Type':'application/json'} })

  // Coin check
  const { data: balance } = await supabase.from('coin_balances').select('balance').eq('user_id', user.id).single()
  if (!balance || balance.balance < COIN_COST) {
    return new Response(JSON.stringify({ error: 'Insufficient coins', required: COIN_COST, current: balance?.balance || 0 }), { status: 402, headers: {'Content-Type':'application/json'} })
  }

  const body = await request.json()
  const { inputs } = body as { inputs: SprintBlueprintInputs }
  const prompt = buildSprintBlueprintPrompt(inputs)

  // Save generation record first
  const { data: genRecord } = await supabase
    .from('tool_generations' as any)
    .insert({
      user_id:  user.id,
      tool_id:  'sprint-blueprint',
      tool_name:'60-Day Sprint Blueprint',
      prompt:   prompt.slice(0, 500) + '...',  // truncated for storage
      coin_cost: COIN_COST,
      status:   'generating',
    })
    .select('id')
    .single()

  // ── Stream response ──────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {

      // Send generation ID first so the client can use it for ratings
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ generationId: genRecord?.id })}\n\n`))

      let fullText = ''

      const claudeStream = await client.messages.create({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 8000,
        stream:     true,
        system:     'You are a high-performance marketing strategist. You write precise, actionable marketing execution documents for Nigerian businesses. You never use filler phrases or generic advice. Every recommendation references specific numbers, platforms, and actions.',
        messages:   [{ role: 'user', content: prompt }],
      })

      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const chunk = event.delta.text
          fullText += chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
        }
        if (event.type === 'message_stop') {
          // Deduct coins and update generation record
          await Promise.all([
            supabase.rpc('deduct_design_coins' as any, {
              p_user_id: user.id, p_amount: COIN_COST,
              p_tool_id: 'sprint-blueprint', p_engine: 'base',
            }),
            supabase.from('tool_generations' as any).update({
              output: fullText, status: 'completed', completed_at: new Date().toISOString()
            }).eq('id', genRecord?.id).eq('user_id', user.id),
          ]).catch(() => {})
          controller.enqueue(encoder.encode('data: {"done":true}\n\n'))
        }
      }

      controller.close()
    },

    cancel() {}
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
