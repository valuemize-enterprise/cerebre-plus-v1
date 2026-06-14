// /lib/competitor/module-engine.ts
// Runs one analysis module against all selected competitors.
// Takes raw scraped data (Enhanced) or just profiles (Base) → returns structured ModuleResult.

import Anthropic from '@anthropic-ai/sdk'
import type {
  ModuleId, AnalysisMode, CompetitorProfile,
  ModuleResult, CompetitorInsight, UpsellRecommendation,
} from './types'
import { MODULES, TIER_CONFIG } from './types'

const client = new Anthropic()

// ─── Build module prompt ──────────────────────────────────────
function buildModulePrompt(
  moduleId:    ModuleId,
  mode:        AnalysisMode,
  competitors: CompetitorProfile[],
  scrapedData: Record<string, Record<string, any>>,  // keyed by competitor.id
  userBusiness:{ name:string; industry:string; city:string; description?:string }
): string {

  const competitorContext = competitors.map(comp => {
    const data      = scrapedData[comp.id] || {}
    const tierInfo  = TIER_CONFIG[comp.tier]
    const liveData  = mode === 'enhanced' ? buildLiveDataContext(data, moduleId) : ''
    return `
--- COMPETITOR: ${comp.name} ---
Tier: ${tierInfo.label} (${tierInfo.sizeRelationship})
Platform: Instagram ${comp.instagramHandle}
City: ${comp.city}
Estimated size: ${comp.estimatedFollowers || 'Unknown'}
${comp.description}
${liveData}
`.trim()
  }).join('\n\n')

  const moduleConfig = MODULES[moduleId]
  const upsellTools  = moduleConfig.upsellTools.join(', ')

  const MODULE_INSTRUCTIONS: Record<ModuleId, string> = {
    social_media_audit: `Analyse the social media marketing presence of each competitor.
For each: posting frequency, content types (video/photo/carousel/reels), engagement patterns, best-performing content themes, and visual style consistency.
Then: what pattern do all three share? What should our user learn from this?`,

    ad_intelligence: `Analyse the paid advertising activity of each competitor.
For each: whether they run ads, estimated ad frequency, formats used (feed/stories/reels), offer types, messaging themes (discount/urgency/storytelling/authority), and CTA patterns.
Then: what advertising pattern emerges? Is any competitor failing to advertise when they should?`,

    website_content_audit: `Analyse the website and content strategy of each competitor.
For each: website quality, content freshness, blog activity, SEO approach (from titles/meta), calls to action, and overall digital presence quality.
Then: what content gap exists across all three that our user could exploit?`,

    brand_voice_positioning: `Analyse the brand voice and positioning of each competitor.
For each: tone of voice (formal/informal/playful/authority), market positioning claim, target audience signals, and unique selling propositions visible in their marketing.
Then: what positioning space is unclaimed that our user could own?`,

    content_strategy_decoder: `Analyse the content strategy of each competitor.
For each: content pillars (recurring themes), posting schedule patterns, format mix (video/image/carousel), hashtag sophistication, and any viral or high-engagement content patterns.
Then: what content format or theme is working well that our user should adopt?`,

    audience_intelligence: `Infer the audience of each competitor from their marketing signals.
For each: apparent target demographic, content language level, price sensitivity signals, lifestyle cues, and community engagement tone.
Then: which competitor has the most loyal audience? What content approach creates that loyalty?`,

    gap_opportunity_map: `Based on all available information about these competitors, identify the marketing gaps and opportunities for our user.
For each competitor: what are they doing well? What are they neglecting?
Then: what is the single most actionable marketing opportunity our user has right now, given this competitive landscape?`,
  }

  return `You are a marketing intelligence analyst specialising in Nigerian SME competitive analysis.

YOUR USER'S BUSINESS:
Name: ${userBusiness.name}
Industry: ${userBusiness.industry}
City: ${userBusiness.city}
${userBusiness.description ? `Description: ${userBusiness.description}` : ''}

COMPETITORS TO ANALYSE:
${competitorContext}

ANALYSIS MODULE: ${moduleConfig.name}
${MODULE_INSTRUCTIONS[moduleId]}

MARKETING SCOPE ONLY: Focus exclusively on marketing activities — social media, paid advertising, content, branding, campaigns, customer acquisition. Do not analyse operations, HR, finance, or general business strategy.

Nigerian MARKET CONTEXT: These are Nigerian businesses. Factor in Nigerian consumer behaviour, platform preferences (Instagram and WhatsApp dominate), cultural marketing dynamics, and the specific competitive landscape of ${userBusiness.city}.

OUTPUT FORMAT — respond with JSON only, no markdown:
{
  "teaserLine": "One compelling sentence summarising the most important finding (shown during loading)",
  "synthesis": "2–3 paragraph cross-competitor summary: what pattern emerges, what it means for our user",
  "competitorInsights": [
    {
      "competitorId": "...",
      "competitorName": "...",
      "tier": "...",
      "summary": "One sentence summary of this competitor's marketing in this area",
      "scoreVsYou": "ahead|similar|behind",
      "findings": [
        {
          "category": "Posting Frequency",
          "value": "5× per week",
          "context": "2.5× more frequent than average for this industry",
          "sentiment": "positive|neutral|negative"
        }
      ]
    }
  ],
  "upsellRecs": [
    {
      "toolId": "content-calendar",
      "toolName": "Content Calendar",
      "reason": "Specific reason based on the finding — e.g. 'Your peer competitor posts 5× weekly — a content calendar will help you achieve consistency'",
      "priority": "high|medium|low",
      "actionCta": "Action phrase — e.g. 'Build your 30-day content calendar now'"
    }
  ]
}

Upsell tools to recommend (choose the most relevant from): ${upsellTools}`
}

// ─── Build live data context string ──────────────────────────
function buildLiveDataContext(data: Record<string, any>, moduleId: ModuleId): string {
  const parts: string[] = []

  if (data.instagram) {
    const ig = data.instagram
    parts.push(`LIVE INSTAGRAM DATA:`)
    if (ig.followersCount != null) parts.push(`  Followers: ${ig.followersCount.toLocaleString()}`)
    if (ig.postsCount != null)     parts.push(`  Total posts: ${ig.postsCount}`)
    if (ig.bio)                    parts.push(`  Bio: "${ig.bio}"`)
    if (ig.postingFreq)            parts.push(`  Posting frequency: ${ig.postingFreq}`)
    if (ig.hashtags?.length)       parts.push(`  Top hashtags: ${ig.hashtags.slice(0,8).join(' ')}`)
    if (ig.recentPosts?.length) {
      parts.push(`  Recent posts sample:`)
      ig.recentPosts.slice(0,4).forEach((p: any) =>
        parts.push(`    - ${p.type}: "${p.caption.slice(0,120)}" (${p.likes} likes)`)
      )
    }
  }

  if (data.ads) {
    const ads = data.ads
    parts.push(`LIVE META AD LIBRARY DATA:`)
    parts.push(`  ${ads.adMessage}`)
    if (ads.formats?.length) parts.push(`  Ad formats: ${ads.formats.join(', ')}`)
    if (ads.activeAds?.length) {
      parts.push(`  Active ad samples:`)
      ads.activeAds.slice(0,3).forEach((a: any) =>
        parts.push(`    - "${a.body.slice(0,150)}" [${a.type}]`)
      )
    }
  }

  if (data.website) {
    const web = data.website
    parts.push(`LIVE WEBSITE DATA:`)
    if (web.title)       parts.push(`  Title: "${web.title}"`)
    if (web.description) parts.push(`  Meta: "${web.description}"`)
    if (web.content)     parts.push(`  Content (first 1500 chars): ${web.content.slice(0,1500)}`)
  }

  if (data.youtube) {
    const yt = data.youtube
    parts.push(`LIVE YOUTUBE DATA:`)
    if (yt.subscriberCount) parts.push(`  Subscribers: ${yt.subscriberCount}`)
    if (yt.postingFreq)     parts.push(`  Posting: ${yt.postingFreq}`)
    if (yt.recentVideoTopics?.length) parts.push(`  Recent topics: ${yt.recentVideoTopics.slice(0,5).join('; ')}`)
  }

  return parts.length > 0 ? '\n' + parts.join('\n') : ''
}

// ─── Run a single module ──────────────────────────────────────
export async function runModule(params: {
  moduleId:     ModuleId
  mode:         AnalysisMode
  competitors:  CompetitorProfile[]
  scrapedData:  Record<string, Record<string, any>>
  userBusiness: { name:string; industry:string; city:string; description?:string }
  coinsToCharge:number
}): Promise<ModuleResult> {
  const { moduleId, mode, competitors, scrapedData, userBusiness, coinsToCharge } = params

  const prompt = buildModulePrompt(moduleId, mode, competitors, scrapedData, userBusiness)

  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = response.content.filter(b=>b.type==='text').map(b=>(b as any).text).join('')

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0])

    return {
      moduleId,
      status:      'completed',
      coinsSpent:  coinsToCharge,
      insights:    parsed.competitorInsights || [],
      synthesis:   parsed.synthesis          || '',
      upsellRecs:  (parsed.upsellRecs        || []).slice(0, 3),
      teaserLine:  parsed.teaserLine         || 'Analysis complete',
      completedAt: new Date().toISOString(),
    }
  } catch (err) {
    return {
      moduleId,
      status:      'failed',
      coinsSpent:  0,
      insights:    [],
      synthesis:   '',
      upsellRecs:  [],
      teaserLine:  'Analysis encountered an issue',
      completedAt: new Date().toISOString(),
      error:       String(err),
    }
  }
}
