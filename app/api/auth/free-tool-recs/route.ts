// /app/api/auth/free-tool-recs/route.ts
// Returns 6 personalised tool recommendations based on onboarding data.
// Scoring crosses three signals: primary_challenge, primary_goal, industry.
// Each recommendation includes a personalised "why this helps you" message.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { createAdminClient }         from '@/lib/supabase/admin'

// ── Tool catalogue (what we can recommend) ─────────────────────
const TOOLS = {
  'caption-craft':              { label:'CaptionCraft',             emoji:'✍',  cost:15,  href:'/tools/caption-craft',             tagline:'Scroll-stopping captions for any platform' },
  'content-calendar':           { label:'Content Calendar',         emoji:'📅',  cost:20,  href:'/tools/content-calendar',          tagline:'30 days of planned content in 60 seconds' },
  'sprint-blueprint':           { label:'60-Day Sprint Blueprint',  emoji:'🚀',  cost:50,  href:'/tools/sprint-blueprint',          tagline:'Your complete 60-day revenue execution plan' },
  'competitor-intelligence':    { label:'Competitor Intel 2.0',     emoji:'🎯',  cost:40,  href:'/competitor-intelligence',         tagline:'See exactly what your competitors are doing' },
  'brand-positioner':           { label:'BrandPositioner',          emoji:'🏆',  cost:50,  href:'/tools/brand-positioner',          tagline:'The position that makes you the obvious choice' },
  'ad-scribe':                  { label:'AdScribe',                 emoji:'📢',  cost:15,  href:'/tools/ad-scribe',                 tagline:'Meta/Google ad copy that converts' },
  'copy-brain':                 { label:'CopyBrain AI',             emoji:'🧠',  cost:20,  href:'/tools/copy-brain',                tagline:'Sales copy that makes buyers reach for their wallet' },
  'whatsapp-campaign-builder':  { label:'WhatsApp Campaign',        emoji:'💬',  cost:30,  href:'/tools/whatsapp-campaign-builder', tagline:'Broadcasts that feel personal and convert' },
  'carousel-script-builder':    { label:'CarouselScriptBuilder',    emoji:'🎠',  cost:18,  href:'/tools/carousel-script-builder',   tagline:'Instagram carousels that educate and sell' },
  'audience-profiler':          { label:'AudienceProfiler',         emoji:'🔬',  cost:40,  href:'/tools/audience-profiler',         tagline:'Know your Nigerian customer better than they know themselves' },
  'email-scribe':               { label:'EmailScribe',              emoji:'📧',  cost:25,  href:'/tools/email-scribe',              tagline:'Email sequences that build trust and print money' },
  'social-post-designer':       { label:'Social Post Designer',     emoji:'🎨',  cost:10,  href:'/design/social-post-designer',     tagline:'Branded social posts without a graphic designer' },
  'launch-pad':                 { label:'LaunchPad',                emoji:'🛸',  cost:60,  href:'/tools/launch-pad',                tagline:'Launch plans that create demand before day one' },
  'video-script-forge':         { label:'VideoScriptForge',         emoji:'🎬',  cost:25,  href:'/tools/video-script-forge',        tagline:'Camera-ready video scripts for Reels and TikTok' },
} as const

type ToolId = keyof typeof TOOLS

// ── Recommendation mappings ────────────────────────────────────

// Challenge → [primary tool, secondary tool] + why message template
const CHALLENGE_MAP: Record<string, [ToolId, ToolId, string, string]> = {
  "I don't have time for marketing": [
    'content-calendar', 'caption-craft',
    'Plan your entire month of content in one 60-second session instead of creating daily.',
    'When you know what to post, creating each piece takes under 2 minutes.',
  ],
  "I don't know where to start": [
    'sprint-blueprint', 'audience-profiler',
    'Get a complete, personalised 60-day execution plan based on your exact business situation.',
    'Before any strategy works, you need crystal clarity on who you\'re selling to.',
  ],
  "I can't afford a marketing team": [
    'copy-brain', 'content-calendar',
    'Replace your entire copywriting function — get professional sales copy in 60 seconds.',
    'One planning session replaces what a content manager spends 3 days producing.',
  ],
  "I post but get no engagement": [
    'caption-craft', 'carousel-script-builder',
    'The problem is almost always the hook. CaptionCraft fixes that with proven engagement triggers.',
    'Carousels get 3× more reach than regular posts. This tool writes the whole script.',
  ],
  "I don't know what my competitors are doing": [
    'competitor-intelligence', 'brand-positioner',
    'See your competitors\' ads, social content, and positioning — updated in real time.',
    'Once you know what they\'re doing, this defines exactly where you win.',
  ],
  "My branding is inconsistent": [
    'brand-positioner', 'social-post-designer',
    'Define a clear brand position once — and every piece of content becomes consistent.',
    'Create branded visuals that always look on-brand, without a designer.',
  ],
}

// Goal → recommended tool + why message
const GOAL_MAP: Record<string, [ToolId, string]> = {
  'Get more customers':           ['ad-scribe',               'Paid ad copy that targets buyers in your specific Nigerian market.'],
  'Improve my content quality':   ['caption-craft',           'Captions that stop the scroll and start the conversation.'],
  'Understand my competitors':    ['competitor-intelligence', 'Live competitor intelligence — not guesswork.'],
  'Build a stronger brand':       ['brand-positioner',        'The strategic foundation that makes everything else cheaper to do.'],
  'Increase revenue / sales':     ['sprint-blueprint',        'A 60-day execution plan built around your specific revenue target.'],
  'Launch a new product or service':['launch-pad',            'Pre-launch, launch day, and post-launch plan — complete.'],
}

// Industry → contextual tool + why message
const INDUSTRY_MAP: Record<string, [ToolId, string]> = {
  fashion_clothing:     ['social-post-designer',      'Fashion is visual. Branded posts that look like you hired a designer.'],
  food_restaurants:     ['whatsapp-campaign-builder', 'Nigerian food businesses close deals on WhatsApp. This writes the broadcasts.'],
  beauty_cosmetics:     ['video-script-forge',        'Before/after videos are the #1 converter for beauty. This writes the script.'],
  technology_software:  ['brand-positioner',          'In tech, differentiation is everything. Define your unique position.'],
  real_estate:          ['ad-scribe',                 'Real estate sells via ads. Copy that speaks to Nigerian property buyers.'],
  education_training:   ['email-scribe',              'Education businesses convert through email. Full sequences, ready to send.'],
  logistics_delivery:   ['whatsapp-campaign-builder', 'Logistics businesses run on WhatsApp. Professional broadcast campaigns.'],
  healthcare_wellness:  ['copy-brain',                'Trust-building copy is everything in healthcare. Get it right every time.'],
  events_entertainment: ['video-script-forge',        'Events sell through video. Behind-the-scenes and testimonial scripts.'],
  ecommerce_retail:     ['caption-craft',             'Product captions that make buyers reach for their wallet immediately.'],
  finance_fintech:      ['brand-positioner',          'In finance, trust = brand. Define what makes you credible and safe.'],
  other:                ['content-calendar',          '30 days of structured, strategic content planned in 60 seconds.'],
}

// Always offer these if not already in the set
const FALLBACK_TOOLS: ToolId[] = ['caption-craft', 'content-calendar', 'sprint-blueprint']

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      // free_tool_used was removed from the table; avoid selecting it to prevent TS error
      .select('industry, primary_goal, free_tool_used, primary_challenge, business_name, city')
    .eq('id', user.id)
    .single() as any

  if (profile?.free_tool_used) {
    return NextResponse.json({ alreadyUsed: true })
  }

  const challenge = profile?.primary_challenge || ''
  const goal      = profile?.primary_goal      || ''
  const industry  = (profile?.industry || 'other').toLowerCase().replace(/[^a-z_]/g, '_')
  const bizName   = profile?.business_name || 'your business'

  const picks: Array<{ toolId: ToolId; whyMessage: string; priority: number }> = []

  // ── Signal 1: Challenge (highest weight — most direct pain) ──
  const challengeData = CHALLENGE_MAP[challenge]
  if (challengeData) {
    const [primary, secondary, why1, why2] = challengeData
    picks.push({ toolId: primary,   whyMessage: why1, priority: 10 })
    picks.push({ toolId: secondary, whyMessage: why2, priority:  8 })
  }

  // ── Signal 2: Goal ────────────────────────────────────────────
  const goalData = GOAL_MAP[goal]
  if (goalData) {
    const [tool, why] = goalData
    picks.push({ toolId: tool, whyMessage: why, priority: 6 })
  }

  // ── Signal 3: Industry ────────────────────────────────────────
  const industryData = INDUSTRY_MAP[industry] || INDUSTRY_MAP['other']
  const [indTool, indWhy] = industryData
  picks.push({ toolId: indTool, whyMessage: indWhy, priority: 4 })

  // ── Fill to 6 with fallbacks ──────────────────────────────────
  for (const fb of FALLBACK_TOOLS) {
    picks.push({ toolId: fb, whyMessage: TOOLS[fb].tagline, priority: 1 })
  }

  // Deduplicate (first occurrence wins — higher priority comes first)
  const seen = new Set<ToolId>()
  const deduped = picks.filter(p => {
    if (seen.has(p.toolId)) return false
    seen.add(p.toolId)
    return true
  })

  // Take first 6
  const top6 = deduped.slice(0, 6)

  // Build response with full tool metadata
  const recommendations = top6.map(({ toolId, whyMessage }) => {
    const tool = TOOLS[toolId]
    return {
      tool_id:      toolId,
      label:        tool.label,
      emoji:        tool.emoji,
      coin_value:   tool.cost,
      tagline:      tool.tagline,
      href:         tool.href,
      why_for_you:  whyMessage.replace('{bizName}', bizName),
    }
  })

  return NextResponse.json({ recommendations, alreadyUsed: false })
}

export const dynamic = 'force-dynamic'
