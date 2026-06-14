// /lib/competitor/discovery.ts
// Auto-discovery engine: uses SerpAPI + Claude to find and classify competitors.

import Anthropic from '@anthropic-ai/sdk'
import type { CompetitorProfile, CompetitorTier, SizeTier } from './types'

const client = new Anthropic()

// ─── SerpAPI search ──────────────────────────────────────────
async function searchCompetitors(
  industry: string,
  city:     string,
  query?:   string
): Promise<Array<{ title: string; snippet: string; link: string }>> {
  const key = process.env.SERPAPI_API_KEY
  if (!key) {
    console.warn('[discovery] SERPAPI_API_KEY not set — using Claude-only discovery')
    return []
  }

  const searchQuery = query
    ?? `${industry} business ${city} Nigeria marketing`

  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('api_key',  key)
  url.searchParams.set('engine',   'google')
  url.searchParams.set('q',        searchQuery)
  url.searchParams.set('location', 'Nigeria')
  url.searchParams.set('num',      '15')
  url.searchParams.set('gl',       'ng')
  url.searchParams.set('hl',       'en')

  try {
    const res  = await fetch(url.toString())
    const data = await res.json()
    return (data.organic_results || []).map((r: any) => ({
      title:   r.title   || '',
      snippet: r.snippet || '',
      link:    r.link    || '',
    }))
  } catch (err) {
    console.error('[discovery] SerpAPI error:', err)
    return []
  }
}

// ─── Claude classification ────────────────────────────────────
async function classifyCompetitors(
  searchResults:     Array<{ title: string; snippet: string; link: string }>,
  userBusiness:      { name: string; industry: string; city: string; description?: string; estimatedFollowers?: string },
  manualSuggestions: string[] = []
): Promise<CompetitorProfile[]> {

  const hasSearchResults = searchResults.length > 0
  const searchContext    = hasSearchResults
    ? `\nSEARCH RESULTS FROM SERPAPI:\n${searchResults.slice(0,12).map((r,i) => `${i+1}. ${r.title}\n   ${r.snippet}\n   URL: ${r.link}`).join('\n\n')}`
    : '\nNo live search results available — use your knowledge of the Nigerian market.'

  const manualContext = manualSuggestions.length > 0
    ? `\nMANUALLY SPECIFIED COMPETITORS (must include these):\n${manualSuggestions.join(', ')}`
    : ''

  const prompt = `You are a Nigerian market research specialist. Identify competitors for a ${userBusiness.industry} business.

USER'S BUSINESS:
Name: ${userBusiness.name}
Industry: ${userBusiness.industry}
City: ${userBusiness.city}
Description: ${userBusiness.description || 'Not provided'}
Estimated size: ${userBusiness.estimatedFollowers || 'Unknown'}
${searchContext}
${manualContext}

TASK: Generate a list of 6–8 real or highly probable Nigerian ${userBusiness.industry} businesses that would be meaningful competitors. 

For EACH competitor, determine:
1. Their tier: "aspirational" (market leader, much larger), "peer_ahead" (slightly ahead), or "current_peer" (similar size)
2. Their size tier: "micro" (0–10K followers), "small" (10K–100K), "medium" (100K–500K), or "large" (500K+)
3. A realistic Instagram handle if known, or a best guess starting with @

RULES:
- Include 1–2 aspirational brands (well-known in the industry nationally)
- Include 2–3 peer_ahead brands (growing, known in major Nigerian cities)
- Include 2–3 current_peer brands (similar stage, local or city-level)
- Only include businesses that genuinely operate in Nigeria
- If search results include real business names, use those
- Be specific with Nigerian city names (Lagos, Abuja, Port Harcourt, Kano, etc.)

Respond with a JSON array ONLY — no markdown, no explanation:
[
  {
    "name": "Business Name",
    "instagramHandle": "@handle",
    "websiteUrl": "https://..." or null,
    "industry": "${userBusiness.industry}",
    "city": "Lagos",
    "sizeTier": "small",
    "tier": "peer_ahead",
    "estimatedFollowers": "~25K",
    "description": "One sentence about this business and what makes them notable in marketing."
  }
]`

  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = response.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')
    const raw: any[] = JSON.parse(jsonMatch[0])

    return raw.slice(0, 8).map((r, i) => ({
      id:              `discovered-${i}`,
      name:            r.name        || `Competitor ${i + 1}`,
      instagramHandle: r.instagramHandle || '',
      websiteUrl:      r.websiteUrl  || undefined,
      facebookHandle:  r.facebookHandle || undefined,
      youtubeHandle:   r.youtubeHandle  || undefined,
      industry:        r.industry    || userBusiness.industry,
      city:            r.city        || userBusiness.city,
      sizeTier:        (r.sizeTier   || 'small') as SizeTier,
      tier:            (r.tier       || 'current_peer') as CompetitorTier,
      estimatedFollowers: r.estimatedFollowers || undefined,
      description:     r.description || '',
      source:          'discovered' as const,
    }))
  } catch (err) {
    console.error('[discovery] Failed to parse Claude response:', err)
    return []
  }
}

// ─── Assign default tier selection (recommended 3) ───────────
export function getRecommendedSelection(competitors: CompetitorProfile[]): string[] {
  const aspirational = competitors.find(c => c.tier === 'aspirational')
  const peerAhead    = competitors.find(c => c.tier === 'peer_ahead')
  const currentPeer  = competitors.find(c => c.tier === 'current_peer')

  const selected: string[] = []
  if (aspirational) selected.push(aspirational.id)
  if (peerAhead)    selected.push(peerAhead.id)
  if (currentPeer)  selected.push(currentPeer.id)

  // Fill up to 3 if any tier is missing
  if (selected.length < 3) {
    for (const c of competitors) {
      if (!selected.includes(c.id) && selected.length < 3) {
        selected.push(c.id)
      }
    }
  }
  return selected
}

// ─── Classify a manually entered competitor ──────────────────
export async function classifyManualCompetitor(
  name:         string,
  handle:       string,
  userBusiness: { industry: string; city: string }
): Promise<CompetitorProfile> {
  const prompt = `A Nigerian ${userBusiness.industry} business owner in ${userBusiness.city} wants to analyse this competitor:

Name: ${name}
Instagram: ${handle}

Classify this competitor:
1. tier: "aspirational", "peer_ahead", or "current_peer" (use "custom" if unclear)
2. sizeTier: "micro", "small", "medium", or "large"
3. estimatedFollowers: a rough estimate like "~5K", "~50K", "~200K"
4. description: one sentence about this type of business

Respond with JSON only: {"tier":"...","sizeTier":"...","estimatedFollowers":"...","description":"..."}`

  const response = await client.messages.create({
    model:'claude-sonnet-4-20250514', max_tokens:300,
    messages:[{role:'user',content:prompt}],
  })

  const text = response.content.filter(b=>b.type==='text').map(b=>(b as any).text).join('')
  try {
    const m    = text.match(/\{[\s\S]*\}/)
    const data = m ? JSON.parse(m[0]) : {}
    return {
      id:              `manual-${Date.now()}`,
      name, instagramHandle: handle,
      industry:        userBusiness.industry,
      city:            userBusiness.city,
      sizeTier:        (data.sizeTier  || 'small') as SizeTier,
      tier:            (data.tier      || 'custom') as CompetitorTier,
      estimatedFollowers: data.estimatedFollowers,
      description:     data.description || `${userBusiness.industry} business`,
      source:          'manual' as const,
    }
  } catch {
    return {
      id: `manual-${Date.now()}`, name, instagramHandle: handle,
      industry: userBusiness.industry, city: userBusiness.city,
      sizeTier:'small', tier:'custom', description: '', source:'manual',
    }
  }
}

// ─── Main export: run full discovery ─────────────────────────
export async function discoverCompetitors(params: {
  industry:          string
  city:              string
  businessName:      string
  description?:      string
  estimatedFollowers?:string
  manualCompetitors?: string[]
}): Promise<CompetitorProfile[]> {
  const [searchResults] = await Promise.all([
    searchCompetitors(params.industry, params.city),
  ])

  const profiles = await classifyCompetitors(
    searchResults,
    {
      name:               params.businessName,
      industry:           params.industry,
      city:               params.city,
      description:        params.description,
      estimatedFollowers: params.estimatedFollowers,
    },
    params.manualCompetitors,
  )

  // Ensure we have at least one of each recommended tier
  const hasTiers = {
    aspirational: profiles.some(p => p.tier === 'aspirational'),
    peer_ahead:   profiles.some(p => p.tier === 'peer_ahead'),
    current_peer: profiles.some(p => p.tier === 'current_peer'),
  }

  // Sort: aspirational first, then peer_ahead, then current_peer, then custom
  const tierOrder: Record<string, number> = { aspirational:0, peer_ahead:1, current_peer:2, custom:3 }
  return profiles.sort((a, b) => (tierOrder[a.tier]??3) - (tierOrder[b.tier]??3))
}
