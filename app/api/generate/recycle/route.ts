// ═══════════════════════════════════════════════════════════════
// /app/api/generate/recycle/route.ts
// Content Recycler — transforms any output into a different format.
// 8 coins per recycle. Streams the result.
// ═══════════════════════════════════════════════════════════════

import { NextRequest }        from 'next/server'
import Anthropic              from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'
import { Ratelimit }          from '@upstash/ratelimit'
import { Redis }              from '@upstash/redis'

const anthropic   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const ratelimit   = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(20, '60s'), prefix: 'cerebre:recycle' })

const RECYCLE_COST = 8

// ─────────────────────────────────────────────────────────────
// TRANSFORM DEFINITIONS
// ─────────────────────────────────────────────────────────────

const TRANSFORMS: Record<string, { label: string; prompt: (content: string, profile: Record<string,any>) => string }> = {

  'caption_to_linkedin': {
    label: 'Instagram caption → LinkedIn post',
    prompt: (content, p) => `
Transform this Instagram caption into a professional LinkedIn post for ${p.business_name || 'the business'} in ${p.city || 'Nigeria'}.

INSTAGRAM CAPTION:
${content}

LinkedIn post rules:
- Open with an insight or observation — not a promotional hook
- Write in a thought-leadership voice that retains the Cerebre Plus persuasion elements
- Remove hashtags — LinkedIn doesn't benefit from them in body text
- Expand the content to 200-300 words (LinkedIn rewards longer, value-dense posts)
- End with a WhatsApp CTA: ${p.whatsapp || '08012345678'}
- Add 3-5 professional hashtags as the final line

Generate the complete LinkedIn post. Immediately usable.
💡 CEREBRE TIP: [Non-obvious LinkedIn insight for Nigerian ${p.industry || ''} businesses]
`.trim(),
  },

  'blog_to_carousel': {
    label: 'Blog post → 7-slide carousel',
    prompt: (content, p) => `
Extract the 5 most valuable insights from this blog post and transform them into a 7-slide Instagram carousel for ${p.business_name || 'the business'}.

BLOG POST:
${content.slice(0, 3000)}

Output format — write exactly 7 slides:

SLIDE 1 — HOOK: [Bold claim from the blog — stops the scroll]
SLIDE 2 — CONTEXT: [The problem this addresses — 2 lines]
SLIDE 3 — INSIGHT 1: [Slide headline + 2-line explanation]
SLIDE 4 — INSIGHT 2: [Slide headline + 2-line explanation]
SLIDE 5 — INSIGHT 3: [Slide headline + 2-line explanation]
SLIDE 6 — SOCIAL PROOF: [Trust signal from the blog or ${p.social_proof || p.business_name + "'s experience"}]
SLIDE 7 — CTA: [Giant promise + WhatsApp CTA: ${p.whatsapp || '08012345678'}]

POST CAPTION: [Complete Instagram caption using the carousel topic as hook — 150 words — ends with WhatsApp CTA]
HASHTAGS: [20 relevant Nigerian hashtags]

💡 CEREBRE TIP: [Instagram carousel timing insight for Nigerian ${p.industry || ''} audiences]
`.trim(),
  },

  'whatsapp_to_email': {
    label: 'WhatsApp broadcast → Email campaign',
    prompt: (content, p) => `
Transform this WhatsApp broadcast into a professional email campaign for ${p.business_name || 'the business'}.

WHATSAPP BROADCAST:
${content}

Create a complete email with:
SUBJECT LINE (A): [High-open-rate subject for Nigerian inboxes]
SUBJECT LINE (B): [Alternative A/B test variant]
PREVIEW TEXT: [40 chars that extend the subject]

EMAIL BODY:
[Expand the WhatsApp message into a full email following Cerebre Plus's Sales Letter Formula]
[Use "I" voice, not "we"]
[Lead with the same hook from the WhatsApp message]
[Add: story section, trust signals, expanded offer details]
[CTA: WhatsApp number ${p.whatsapp || '08012345678'} — not a link, the actual number]
[P.S.: urgency reinforcement]

Keep all the Cerebre Plus persuasion elements from the original but adapt them for email reading behaviour.

💡 CEREBRE TIP: [Nigerian email vs WhatsApp conversion insight]
`.trim(),
  },

  'video_to_thread': {
    label: 'Video script → X/Twitter thread',
    prompt: (content, p) => `
Transform this video script into a high-engagement X (Twitter) thread for ${p.business_name || 'the business'}.

VIDEO SCRIPT:
${content.slice(0, 3000)}

Thread format — write 8-10 tweets:

Tweet 1 (HOOK): [Bold statement that makes people click "show more" — must create curiosity or fear]
Tweet 2 (CONTEXT): [The problem being addressed — 1-2 sentences]
Tweets 3-7 (VALUE): [One insight per tweet — each is a standalone point but builds on the last]
Tweet 8 (SOCIAL PROOF): [Trust signal — ${p.social_proof || p.business_name + " credentials"} — city-specific]
Tweet 9 (OFFER): [What they can get — with Awoof Stack if applicable]
Tweet 10 (CTA): [Direct action — WhatsApp: ${p.whatsapp || '08012345678'}]

Each tweet must be under 280 characters. Number each tweet (1/10), (2/10) etc.
Include relevant hashtags on tweet 10 only (2-3 max).

💡 CEREBRE TIP: [X/Twitter thread insight for Nigerian ${p.industry || ''} businesses]
`.trim(),
  },

  'email_to_whatsapp': {
    label: 'Email sequence → WhatsApp campaign',
    prompt: (content, p) => `
Condense this email sequence into a 3-message WhatsApp broadcast campaign for ${p.business_name || 'the business'}.

EMAIL SEQUENCE:
${content.slice(0, 3000)}

WhatsApp rules:
- Use "I" not "we" — sounds personal, not corporate
- Maximum 300 characters per message (WhatsApp preview shows first 80)
- Bold: *use asterisks*
- Emoji: 1-2 per message maximum
- Include ${p.whatsapp || '08012345678'} in Message 3

MESSAGE 1 (Send Day 1, 10AM): [Warm version of Email 1's story/hook — no hard sell]
MESSAGE 2 (Send Day 2, 6PM): [The offer + Awoof Stack from the email sequence]
MESSAGE 3 (Day of deadline, 10AM): [Final urgency — shorter than Message 2 — include phone number]

BROADCAST NOTES: [Best list segments for this campaign — past customers vs. new enquiries]

💡 CEREBRE TIP: [WhatsApp vs email conversion insight for Nigerian ${p.industry || ''} businesses]
`.trim(),
  },

  'post_to_story': {
    label: 'Feed post → Story sequence',
    prompt: (content, p) => `
Transform this feed post into a 5-slide Instagram/Facebook Story sequence for ${p.business_name || 'the business'}.

FEED POST:
${content}

Story format — 5 slides:

STORY 1 (HOOK — 0-2 sec): 
Screen text: [Bold 5-word hook — large text — readable without sound]
Caption: [What to type as story caption]
Engagement sticker: [Poll or question to add]

STORY 2-4 (VALUE):
[For each story: Screen text + Caption + B-roll direction]

STORY 5 (CTA):
Screen text: "Send me a WhatsApp 👇"
Phone: ${p.whatsapp || '08012345678'}
Link sticker: WhatsApp link

HIGHLIGHT COVER NAME: [Short title for saving to Highlights]

💡 CEREBRE TIP: [Nigerian Stories engagement insight]
`.trim(),
  },

  'strategy_to_30day': {
    label: 'Full strategy → 30-day action plan',
    prompt: (content, p) => `
Extract the most actionable items from this strategy document and create a practical 30-day day-by-day action plan for ${p.business_name || 'the business'}.

STRATEGY:
${content.slice(0, 4000)}

Create a 30-day action plan that:
- Has a specific action for each of the 30 days (not "Week 1: Do X" — specific day-by-day)
- Prioritises the highest-impact tasks from the strategy
- Is realistic for a ${p.team_size || 'solo'} business owner
- Flags the salary week days (Days 25-30) for maximum promotional activity
- Each day's task can be done in under 2 hours

Format:
Day 1 (Mon): [Specific task] — ⏱️ [X] mins — 📌 [Tool to use if relevant]
Day 2 (Tue): [Specific task] — ⏱️ [X] mins
[...continue for all 30 days]

SALARY WEEK ACTIONS (Days 25-30):
[Enhanced promotional schedule for the conversion window]

💡 CEREBRE TIP: [Nigerian 30-day plan insight — the most impactful first week action]
`.trim(),
  },
}

// ─────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const userId = user.id

  // Rate limit
  const { success: ratePassed } = await ratelimit.limit(userId)
  if (!ratePassed) return new Response(JSON.stringify({ error: 'RATE_LIMITED' }), { status: 429 })

  const { content, transformId, generationId } = await request.json() as {
    content:      string
    transformId:  string
    generationId?: string
  }

  const transform = TRANSFORMS[transformId]
  if (!transform) return new Response(JSON.stringify({ error: 'Unknown transform' }), { status: 400 })

  if (!content?.trim()) return new Response(JSON.stringify({ error: 'No content provided' }), { status: 400 })

  // Check coins
  const isEnterprise = (await supabase.from('subscriptions').select('plan_tier').eq('user_id', userId).single())?.data?.plan_tier === 'enterprise'

  if (!isEnterprise) {
    const { data: coinData } = await supabase.from('coin_balances').select('balance').eq('user_id', userId).single()
    if ((coinData?.balance ?? 0) < RECYCLE_COST) {
      return new Response(JSON.stringify({ error: 'INSUFFICIENT_COINS', message: `Need ${RECYCLE_COST} coins to recycle content` }), { status: 402 })
    }
  }

  // Fetch profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single()

  const prompt = transform.prompt(content, profile || {})
  const encoder = new TextEncoder()

  // Pre-insert recycle generation
const { data: recycleRow } = await supabase
  .from('generations')
  .insert({
    user_id: userId,
    tool_id: `recycle_${transformId}`,
    tool_name: transform.label,
    tool_category: 'recycle',
    input_data: {
      transformId,
      source_generation_id: generationId,
    },
    status: 'streaming',
    coins_deducted: isEnterprise ? 0 : RECYCLE_COST,
    output_content: null,
    output_metadata: {},
    token_count: null,
  } as any)
  .select('id')
  .single()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const startedAt = Date.now();
        let totalTokens = 0;

        const response = await anthropic.messages.create({
          model:      'claude-sonnet-4-5',
          max_tokens: 3000,
          messages:   [{ role: 'user', content: prompt }],
          stream:     true,
        })

        let fullText = ''

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(`0:${JSON.stringify(event.delta.text)}\n`))
          }
          if (event.type === 'message_delta') {
            totalTokens = event.usage?.output_tokens ?? totalTokens
          }
          if (event.type === 'message_stop') {
            // Deduct coins
            if (!isEnterprise) {
              const { data, error: deductError } = await supabase.rpc('deduct_coins', {
                p_user_id:       userId,
                p_amount:        RECYCLE_COST,
                p_tool_id:       `recycle_${transformId}`,
                p_generation_id: recycleRow?.id ?? null,
              })
              const deductResult = data as any
              if (deductError || !deductResult?.success) {
                console.error('[recycle] deduct_coins failed:', deductError ?? deductResult?.error_message)
              }
            }
            // Save
            if (recycleRow?.id) {
              await supabase.from('generations').update({
                output_content: fullText,
                status: 'completed',
                coins_deducted: isEnterprise ? 0 : RECYCLE_COST,
                token_count: totalTokens,
                is_saved: true,
                saved_at: new Date().toISOString(),
                generation_time_ms: Date.now() - startedAt,
                updated_at: new Date().toISOString(),
              } as any).eq('id', recycleRow.id)
            }
            controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`))
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`3:${JSON.stringify({ error: 'Generation failed' })}\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':            'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
      'X-Recycle-Cost':          String(RECYCLE_COST),
      'X-Transform-Label':       transform.label,
    },
  })
}

export const runtime     = 'nodejs'
export const dynamic     = 'force-dynamic'
export const maxDuration = 45
