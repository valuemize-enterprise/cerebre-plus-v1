// /app/api/tools/ai-suggestions/route.ts
// Generates 3 AI-powered, hyper-personalised field suggestions using Claude.
// Uses claude-haiku for speed — typical response under 2 seconds.

import { NextRequest, NextResponse } from 'next/server'
import Anthropic                     from '@anthropic-ai/sdk'
import { createServerClient }        from '@/lib/supabase/server'

const claude = new Anthropic()

function buildSystemPrompt(p: Record<string,string>): string {
  return `You are a senior marketing strategist at Cerebre Plus — Nigeria's #1 AI marketing platform.

A business owner needs help filling a field in a marketing tool. Generate suggestions that sound like a real marketing expert who studied this specific business.

BUSINESS PROFILE:
- Name: ${p.businessName || 'their business'}
- Industry: ${p.industry || 'not specified'}
- City: ${p.city || 'Lagos'}
- What they do: ${p.description || 'not described'}
- Their customers: ${p.targetCustomer || 'Nigerian buyers'}
- Their advantage: ${p.uniqueAdvantage || 'not specified'}
- Their proof: ${p.socialProof || 'not provided'}
- Price range: ${p.priceRange || 'not specified'}
- Brand voice: ${p.brandVoice || 'professional'}
- Primary challenge: ${p.primaryChallenge || 'growing the business'}

NON-NEGOTIABLE RULES:
1. Each suggestion must be usable AS-IS — no placeholders like [INSERT X]
2. Reference the actual business name, product, city, or customers where it adds specificity
3. Sound like a human expert who knows THIS business, not a generic AI
4. Max 30 words per suggestion
5. Nigerian context: naira, Nigerian platforms, Nigerian buyer psychology
6. Never start with "I" — write as if filling in the field for them
7. Return ONLY a JSON array of exactly 3 strings. Nothing else.`
}

function buildUserPrompt(
  fieldSemantic:  string,
  fieldLabel:     string,
  toolName:       string,
  existingInputs: Record<string,string>,
  p:              Record<string,string>
): string {
  const ctx = Object.entries(existingInputs).filter(([,v])=>v).map(([k,v])=>`  ${k}: "${v}"`).join('\n') || '  (nothing yet)'

  const map: Record<string,string> = {
    content_topic:
      `They need a content idea for "${fieldLabel}" in ${toolName}.
Context already filled:\n${ctx}
Generate 3 specific post/content ideas for ${p.businessName || 'this business'} that their customers (${p.targetCustomer || 'Nigerian buyers'}) would genuinely engage with. Each must be a complete, specific idea — not a category.`,

    product_service:
      `They need to describe their product/service for "${fieldLabel}" in ${toolName}.
Context:\n${ctx}
Generate 3 specific descriptions of what ${p.businessName || 'this business'} offers. Use the actual business context — city, price range, customer type.`,

    usp_differentiator:
      `They need a differentiator statement for "${fieldLabel}" in ${toolName}.
Their known advantage: ${p.uniqueAdvantage || 'not stated'}
Context:\n${ctx}
Generate 3 genuine differentiators that could only apply to THIS business. Reference their specific advantage, price (${p.priceRange || 'not stated'}), and customer type.`,

    business_situation:
      `They need to describe their current business situation for "${fieldLabel}" in ${toolName}.
Their stated challenge: ${p.primaryChallenge || 'growth'}
Context:\n${ctx}
Generate 3 honest, specific situational descriptions for a ${p.industry || 'Nigerian'} business in ${p.city || 'Lagos'}. They should sound like the owner wrote them.`,

    offer_deal:
      `They need to describe a specific offer for "${fieldLabel}" in ${toolName}.
Their price range: ${p.priceRange || 'not stated'}
Context:\n${ctx}
Generate 3 compelling, specific offer descriptions for ${p.businessName || 'this business'} using their actual pricing context.`,

    social_proof:
      `They need a social proof statement for "${fieldLabel}" in ${toolName}.
Known proof: ${p.socialProof || 'none provided'}
Context:\n${ctx}
Generate 3 credibility statements. If they have proof data, use it. If not, suggest plausible achievements for a ${p.industry || 'Nigerian'} business that they can update with real numbers.`,

    competitor:
      `They need to describe their competitive landscape for "${fieldLabel}" in ${toolName}.
Context:\n${ctx}
Generate 3 specific competitor landscape descriptions for a ${p.industry || 'Nigerian'} business in ${p.city || 'Lagos'} — not generic "other businesses" but specific competitor types they likely face.`,

    brand_perception:
      `They need a brand perception statement for "${fieldLabel}" in ${toolName}.
Context:\n${ctx}
Generate 3 perception statements for how ${p.businessName || 'this business'} is currently seen — or aspires to be seen — in the ${p.city || 'Nigerian'} market.`,

    key_message:
      `They need a core message for "${fieldLabel}" in ${toolName}.
Context:\n${ctx}
Generate 3 powerful, specific core messages for ${p.businessName || 'this business'} that would resonate with ${p.targetCustomer || 'their customers'}. Each must feel like it was written for this exact business.`,

    objection:
      `They need to name the key objection their customers raise, for "${fieldLabel}" in ${toolName}.
Price range: ${p.priceRange || 'not stated'}
Context:\n${ctx}
Generate 3 real objections that ${p.targetCustomer || 'Nigerian buyers'} typically raise when considering ${p.industry || 'this type of'} purchase at ${p.priceRange || 'this price point'}.`,

    winning:
      `They need to describe what success looks like for "${fieldLabel}" in ${toolName}.
Context:\n${ctx}
Generate 3 specific descriptions of what "winning" looks like for ${p.businessName || 'this business'} — reference their industry, customer type, and what measurable success looks like.`,
  }

  return map[fieldSemantic] || `They need to fill "${fieldLabel}" in ${toolName}.
Context:\n${ctx}
Generate 3 perfect suggestions for this field for ${p.businessName || 'this Nigerian business'} in ${p.industry || 'their industry'}.`
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { fieldId='', fieldLabel='', fieldSemantic='', toolName='', existingInputs={} } = body

  // Load profile
  const { data: row } = await supabase.from('profiles' as any)
    .select('business_name,industry,city,description,target_customer,unique_advantage,social_proof,price_range,brand_voice,primary_challenge,call_to_action')
    .eq('id', user.id).single()

  const p = {
    businessName:    row?.business_name    || '',
    industry:        row?.industry         || '',
    city:            row?.city             || '',
    description:     row?.description      || '',
    targetCustomer:  row?.target_customer  || '',
    uniqueAdvantage: row?.unique_advantage || '',
    socialProof:     row?.social_proof     || '',
    priceRange:      row?.price_range      || '',
    brandVoice:      row?.brand_voice      || 'professional',
    primaryChallenge:row?.primary_challenge|| '',
    callToAction:    row?.call_to_action   || '',
  }

  try {
    const resp = await claude.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 350,
      system:     buildSystemPrompt(p),
      messages:   [{ role:'user', content: buildUserPrompt(fieldSemantic, fieldLabel, toolName, existingInputs, p) }],
    })

    const raw  = resp.content[0].type==='text' ? resp.content[0].text.trim() : '[]'
    const clean = raw.replace(/```json?\n?/g,'').replace(/```/g,'').trim()

    let suggestions: string[] = []
    try {
      suggestions = JSON.parse(clean)
      if (!Array.isArray(suggestions)) suggestions = []
    } catch {
      const matches = raw.match(/"([^"]{8,})"/g)
      suggestions = (matches||[]).slice(0,3).map(m=>m.replace(/"/g,''))
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0,3).filter(Boolean),
      businessName: p.businessName,
    })
  } catch (err: any) {
    console.error('[ai-suggestions]', err?.message)
    return NextResponse.json({ suggestions:[], error:'AI unavailable' }, { status:500 })
  }
}

export const dynamic = 'force-dynamic'
