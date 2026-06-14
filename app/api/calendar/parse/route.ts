// /app/api/calendar/parse/route.ts
// Takes raw content calendar tool output text → Claude structures it into events
// → saves to content_calendar_events table.

import { NextRequest, NextResponse } from 'next/server'
import Anthropic                     from '@anthropic-ai/sdk'
import { createServerClient }        from '@/lib/supabase/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { rawOutput, startDate, generationId } = body as {
    rawOutput:    string
    startDate:    string  // '2025-06-01' — first day of the calendar month
    generationId?: string
  }

  if (!rawOutput || !startDate) {
    return NextResponse.json({ error: 'rawOutput and startDate are required' }, { status: 400 })
  }

  // Ask Claude to parse the calendar text into structured events
  const prompt = `You are parsing a content calendar output from an AI marketing tool into structured JSON.

The calendar below was generated for a Nigerian business. It covers approximately 4 weeks starting from ${startDate}.
The output may use various formats — week numbers, day names, dates, or just sequential posts.

CALENDAR OUTPUT:
${rawOutput.slice(0, 6000)}

TASK: Extract every individual content post from this calendar.
For each post, determine:
- scheduled_date: YYYY-MM-DD format. Use the start date ${startDate} as your anchor for Week 1 Day 1. Monday of week 1 = ${startDate}.
- platform: one of: instagram, facebook, whatsapp, tiktok, linkedin, youtube, twitter
- content_type: one of: image, video, carousel, reel, story, text, broadcast
- caption: the actual copy/caption text (not the instruction, the actual post text)
- hashtags: any hashtags (may be empty string)
- visual_note: any creative direction about what the image/video should show
- best_time: suggested posting time if mentioned (e.g. "7pm")

Respond with a JSON array ONLY — no markdown, no explanation:
[
  {
    "scheduled_date": "2025-06-02",
    "platform": "instagram",
    "content_type": "image",
    "caption": "The actual caption text here...",
    "hashtags": "#nigeria #business",
    "visual_note": "Photo of product in natural lighting",
    "best_time": "7pm"
  }
]

If a specific date cannot be determined, estimate based on day position (Monday=start of each week).
Include ALL posts found. Typical calendars have 20-35 posts.`

  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = response.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')

  let events: any[]
  try {
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found')
    events = JSON.parse(match[0])
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse calendar structure from output. Please try again.' }, { status: 422 })
  }

  // Validate and insert
  const monthYear = startDate.slice(0, 7)
  const toInsert  = events
    .filter(e => e.scheduled_date && e.platform && e.content_type)
    .map((e, i) => ({
      user_id:        user.id,
      generation_id:  generationId ?? null,
      month_year:     e.scheduled_date?.slice(0, 7) ?? monthYear,
      scheduled_date: e.scheduled_date,
      platform:       e.platform,
      content_type:   e.content_type,
      caption:        e.caption ?? '',
      hashtags:       e.hashtags ?? '',
      visual_note:    e.visual_note ?? '',
      best_time:      e.best_time ?? '',
      sort_order:     i,
      status:         'draft',
    }))

  if (!toInsert.length) {
    return NextResponse.json({ error: 'No valid events found in the calendar output.' }, { status: 422 })
  }

  const { data: inserted, error } = await supabase
    .from('content_calendar_events' as any)
    .insert(toInsert)
    .select('id, scheduled_date, platform, content_type, status')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success:       true,
    eventsCreated: inserted?.length ?? 0,
    monthYear,
    message:       `${inserted?.length} content posts have been added to your calendar.`,
  })
}

export const dynamic     = 'force-dynamic'
export const maxDuration = 60
