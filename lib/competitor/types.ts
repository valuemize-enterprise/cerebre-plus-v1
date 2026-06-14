// /lib/competitor/types.ts
// All shared TypeScript types for the Competitor Intelligence 2.0 system.

// ─── Mode ─────────────────────────────────────────────────────
export type AnalysisMode = 'base' | 'enhanced'

// ─── Competitor tier ─────────────────────────────────────────
export type CompetitorTier = 'aspirational' | 'peer_ahead' | 'current_peer' | 'custom'

export const TIER_CONFIG: Record<CompetitorTier, {
  label: string; badge: string; color: string; bgColor: string
  description: string; sizeRelationship: string
}> = {
  aspirational: {
    label:            'Aspirational',
    badge:            '🏆',
    color:            '#F59E0B',
    bgColor:          'rgba(245,158,11,0.12)',
    description:      'Market leader in your category. Study their playbook, not to copy — to understand where the industry is going.',
    sizeRelationship: '3–10× your size',
  },
  peer_ahead: {
    label:            'Peer Ahead',
    badge:            '⚡',
    color:            '#12D4B4',
    bgColor:          'rgba(18,212,180,0.12)',
    description:      'Ahead of you in marketing maturity. Their recent wins are achievable for you in the next 90 days.',
    sizeRelationship: '1.5–3× your size',
  },
  current_peer: {
    label:            'Current Peer',
    badge:            '🎯',
    color:            '#8B7FFF',
    bgColor:          'rgba(139,127,255,0.12)',
    description:      'At the same stage as you. Where they go left, consider going right — differentiation beats duplication.',
    sizeRelationship: 'Similar size to you',
  },
  custom: {
    label:            'Custom',
    badge:            '✦',
    color:            '#E09818',
    bgColor:          'rgba(224,152,24,0.10)',
    description:      'A competitor you\'ve specifically identified. We\'ll analyse their marketing approach.',
    sizeRelationship: 'You defined them',
  },
}

// ─── Size tiers ───────────────────────────────────────────────
export type SizeTier = 'micro' | 'small' | 'medium' | 'large'

export const SIZE_TIER_CONFIG: Record<SizeTier, { label: string; range: string }> = {
  micro:  { label: 'Micro (Local)',    range: '0–10K followers'   },
  small:  { label: 'Small (City)',     range: '10K–100K followers'},
  medium: { label: 'Medium (National)',range: '100K–500K followers'},
  large:  { label: 'Large (Established)',range:'500K+ followers'  },
}

// ─── Competitor profile ───────────────────────────────────────
export interface CompetitorProfile {
  id:              string
  name:            string
  instagramHandle: string
  websiteUrl?:     string
  facebookHandle?: string
  youtubeHandle?:  string
  industry:        string
  city:            string
  sizeTier:        SizeTier
  tier:            CompetitorTier
  estimatedFollowers?: string  // e.g. "~50K"
  description:     string      // one-liner about the business
  source:          'discovered' | 'manual' | 'suggested'
}

// ─── Analysis modules ─────────────────────────────────────────
export type ModuleId =
  | 'social_media_audit'
  | 'ad_intelligence'
  | 'website_content_audit'
  | 'brand_voice_positioning'
  | 'content_strategy_decoder'
  | 'audience_intelligence'
  | 'gap_opportunity_map'

export interface ModuleConfig {
  id:          ModuleId
  name:        string
  icon:        string
  description: string
  whatItFetches: string
  baseCoins:   number    // Claude-only cost for 3 competitors
  enhancedCoins: number  // Live data cost for 3 competitors
  dataSources: string[]  // Which APIs are called
  upsellTools: string[]  // Cerebre Plus tool IDs to recommend
  estimatedTime: { base: string; enhanced: string }
}

export const MODULES: Record<ModuleId, ModuleConfig> = {
  social_media_audit: {
    id:           'social_media_audit',
    name:         'Social Media Audit',
    icon:         '📱',
    description:  'Posting frequency, content types, engagement patterns, and best-performing formats across all competitors.',
    whatItFetches:'Instagram posts, Facebook posts, posting schedule, engagement signals',
    baseCoins:    15,
    enhancedCoins:25,
    dataSources:  ['Apify Instagram', 'Apify Facebook'],
    upsellTools:  ['content-calendar','caption-craft','story-reel-designer'],
    estimatedTime:{ base:'~15s', enhanced:'~45s' },
  },
  ad_intelligence: {
    id:           'ad_intelligence',
    name:         'Ad Intelligence Scan',
    icon:         '🎯',
    description:  'Whether competitors run paid ads, how many are active, creative formats, offer types, and messaging themes.',
    whatItFetches:'Meta Ad Library — active ads, creative formats, ad copy samples',
    baseCoins:    15,
    enhancedCoins:30,
    dataSources:  ['Meta Ad Library API'],
    upsellTools:  ['ad-scribe','promo-card-designer','flyer-designer'],
    estimatedTime:{ base:'~10s', enhanced:'~30s' },
  },
  website_content_audit: {
    id:           'website_content_audit',
    name:         'Website & Content Audit',
    icon:         '🌐',
    description:  'Website quality, blog activity, SEO approach, content freshness, and call-to-action strategy.',
    whatItFetches:'Website homepage, about page, blog — meta tags, content themes, CTAs',
    baseCoins:    10,
    enhancedCoins:20,
    dataSources:  ['Firecrawl API'],
    upsellTools:  ['blog-brain','local-seo-kit','website-copy-audit'],
    estimatedTime:{ base:'~10s', enhanced:'~40s' },
  },
  brand_voice_positioning: {
    id:           'brand_voice_positioning',
    name:         'Brand Voice & Positioning',
    icon:         '🗣️',
    description:  'How competitors speak to customers, their market positioning, visual identity cues, and tone of voice.',
    whatItFetches:'Website copy, social captions, about sections, taglines',
    baseCoins:    10,
    enhancedCoins:15,
    dataSources:  ['Firecrawl API', 'Apify Instagram'],
    upsellTools:  ['brand-positioner','copy-brain','bio-builder'],
    estimatedTime:{ base:'~10s', enhanced:'~30s' },
  },
  content_strategy_decoder: {
    id:           'content_strategy_decoder',
    name:         'Content Strategy Decoder',
    icon:         '📋',
    description:  'Content pillars, posting schedule, viral content patterns, hashtag strategy, and format mix.',
    whatItFetches:'Recent posts, hashtags, content categories, video vs image ratio',
    baseCoins:    10,
    enhancedCoins:20,
    dataSources:  ['Apify Instagram', 'YouTube Data API'],
    upsellTools:  ['carousel-slide-maker','carousel-script-builder','content-calendar'],
    estimatedTime:{ base:'~15s', enhanced:'~45s' },
  },
  audience_intelligence: {
    id:           'audience_intelligence',
    name:         'Audience Intelligence',
    icon:         '👥',
    description:  'Who their audience appears to be (inferred from content), engagement demographics, and community tone.',
    whatItFetches:'Post comments tone, audience demographics signals, engagement patterns',
    baseCoins:    10,
    enhancedCoins:20,
    dataSources:  ['Apify Instagram', 'Apify Facebook'],
    upsellTools:  ['audience-profiler','quote-card-creator','whatsapp-campaign-builder'],
    estimatedTime:{ base:'~10s', enhanced:'~35s' },
  },
  gap_opportunity_map: {
    id:           'gap_opportunity_map',
    name:         'Gap & Opportunity Map',
    icon:         '🗺️',
    description:  'What marketing activities competitors do that you don\'t, what they\'re missing, and your unique window.',
    whatItFetches:'Synthesis of all other modules — identifies gaps and opportunities',
    baseCoins:    10,
    enhancedCoins:20,
    dataSources:  ['All previous module results'],
    upsellTools:  ['strategy-brain','launch-pad','campaign-clock'],
    estimatedTime:{ base:'~20s', enhanced:'~30s' },
  },
}

export const MODULE_LIST = Object.values(MODULES)

// ─── Presets ──────────────────────────────────────────────────
export const PRESETS = {
  quick_scan: {
    id:      'quick_scan',
    name:    'Quick Scan',
    modules: ['social_media_audit','brand_voice_positioning','gap_opportunity_map'] as ModuleId[],
    description: 'Essential overview — fastest competitor snapshot',
  },
  marketing_deep_dive: {
    id:      'marketing_deep_dive',
    name:    'Marketing Deep Dive',
    modules: ['social_media_audit','ad_intelligence','content_strategy_decoder','brand_voice_positioning','gap_opportunity_map'] as ModuleId[],
    description: 'Full social and advertising intelligence',
  },
  full_intel: {
    id:      'full_intel',
    name:    'Full Intelligence Report',
    modules: ['social_media_audit','ad_intelligence','website_content_audit','brand_voice_positioning','content_strategy_decoder','audience_intelligence','gap_opportunity_map'] as ModuleId[],
    description: 'Complete 7-module competitor marketing analysis',
  },
}

// ─── Coin calculator ─────────────────────────────────────────
export const COMPETITOR_MULTIPLIERS: Record<number, number> = {
  1: 0.4, 2: 0.7, 3: 1.0, 4: 1.3, 5: 1.6, 6: 2.0, 7: 2.4,
}

export function calculateModuleCost(
  moduleId:  ModuleId,
  mode:      AnalysisMode,
  count:     number
): number {
  const cfg  = MODULES[moduleId]
  const base = mode === 'enhanced' ? cfg.enhancedCoins : cfg.baseCoins
  const mult = COMPETITOR_MULTIPLIERS[count] ?? 2.4
  return Math.ceil(base * mult)
}

export function calculateTotalCost(
  moduleIds: ModuleId[],
  mode:      AnalysisMode,
  count:     number
): number {
  return moduleIds.reduce((sum, id) => sum + calculateModuleCost(id, mode, count), 0)
}

export function isHeavyAnalysis(count: number): boolean {
  return count >= 6
}

// ─── Session status ───────────────────────────────────────────
export type SessionStatus = 'draft' | 'discovering' | 'running' | 'completed' | 'failed' | 'partial'

export interface ModuleResult {
  moduleId:    ModuleId
  status:      'pending' | 'running' | 'completed' | 'failed' | 'partial'
  coinsSpent:  number
  insights:    CompetitorInsight[]      // per-competitor findings
  synthesis:   string                   // cross-competitor pattern summary
  upsellRecs:  UpsellRecommendation[]
  teaserLine:  string                   // one-line insight shown in progress
  completedAt: string
  error?:      string
}

export interface CompetitorInsight {
  competitorId:   string
  competitorName: string
  tier:           CompetitorTier
  findings:       InsightFinding[]
  summary:        string
  scoreVsYou:     'ahead' | 'similar' | 'behind'  // relative to user's business
}

export interface InsightFinding {
  category:  string      // e.g. "Posting Frequency"
  value:     string      // e.g. "5× per week"
  context:   string      // e.g. "2.5× more than average for this industry"
  sentiment: 'positive' | 'neutral' | 'negative'  // relative to user
}

export interface UpsellRecommendation {
  toolId:    string
  toolName:  string
  reason:    string   // specific reason based on the finding
  priority:  'high' | 'medium' | 'low'
  actionCta: string   // e.g. "Create a 30-day content calendar now"
}

export interface CompetitorSession {
  id:                string
  mode:              AnalysisMode
  competitorCount:   number
  isHeavyAnalysis:   boolean
  competitors:       CompetitorProfile[]
  modulesSelected:   ModuleId[]
  modulesCompleted:  ModuleId[]
  moduleResults:     Record<ModuleId, ModuleResult>
  status:            SessionStatus
  progressPct:       number
  currentTask?:      string
  coinsEstimated:    number
  coinsSpent:        number
  businessSnapshot:  Record<string, string>
  startedAt?:        string
  completedAt?:      string
  createdAt:         string
}
