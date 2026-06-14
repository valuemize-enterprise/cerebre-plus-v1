// /lib/design/brand-dna.ts
// Brand DNA Engine — reads user brand profile and builds the prompt injection string
// that is prepended to EVERY design generation request.

import { createServerClient } from '@/lib/supabase/server'

// ── Types ────────────────────────────────────────────────────
export interface BrandProfile {
  businessName:     string
  industry:         string
  city:             string
  primaryColor:     string  // hex e.g. '#E09818'
  secondaryColor:   string
  accentColor:      string
  backgroundColor:  string
  fontStyle:        'modern' | 'classic' | 'bold' | 'elegant' | 'playful'
  designVoice:      'professional' | 'vibrant' | 'warm' | 'minimal' | 'bold'
  logoUrl:          string | null
  patternPref:      'none' | 'geometric' | 'ankara' | 'dots' | 'lines'
  description:      string
  whatsapp:         string
}

export interface BrandDNASettings {
  primaryColor:    string
  secondaryColor:  string
  accentColor:     string
  backgroundColor: string
  fontStyle:       string
  designVoice:     string
  logoUrl:         string | null
  patternPref:     string
}

// ── Font style → design description ──────────────────────────
const FONT_DESCRIPTIONS: Record<string, string> = {
  modern:   'clean geometric sans-serif typefaces, contemporary and minimal',
  classic:  'elegant serif typefaces, traditional and authoritative',
  bold:     'heavy bold sans-serif display fonts, strong and commanding',
  elegant:  'refined thin serif or script typefaces, sophisticated and premium',
  playful:  'rounded friendly sans-serif fonts, approachable and energetic',
}

const VOICE_DESCRIPTIONS: Record<string, string> = {
  professional: 'polished, corporate, credible — like a top Nigerian business brand',
  vibrant:      'energetic, colourful, lively — like a Lagos market at its best',
  warm:         'inviting, human, community-focused — like a trusted neighbourhood brand',
  minimal:      'clean, spacious, refined — like a premium Lagos lifestyle brand',
  bold:         'strong, confident, impactful — like a market-leading Nigerian company',
}

// ── Fetch user brand profile from Supabase ───────────────────
export async function getBrandProfile(userId: string): Promise<BrandProfile> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select(`
      business_name, industry, city, description, whatsapp,
      brand_primary_color, brand_secondary_color, brand_accent_color,
      brand_background_color, brand_font_style, brand_design_voice,
      brand_logo_url, brand_pattern_pref
    `)
    .eq('id', userId)
    .single() as any

  return {
    businessName:    data?.business_name   || 'My Business',
    industry:        data?.industry         || 'business',
    city:            data?.city             || 'Lagos',
    description:     data?.description      || '',
    whatsapp:        data?.whatsapp         || '',
    primaryColor:    data?.brand_primary_color    || '#E09818',
    secondaryColor:  data?.brand_secondary_color  || '#0B1F3A',
    accentColor:     data?.brand_accent_color     || '#12D4B4',
    backgroundColor: data?.brand_background_color || '#0B1F3A',
    fontStyle:       data?.brand_font_style       || 'modern',
    designVoice:     data?.brand_design_voice      || 'professional',
    logoUrl:         data?.brand_logo_url          || null,
    patternPref:     data?.brand_pattern_pref      || 'none',
  }
}

// ── Build brand injection string ─────────────────────────────
// This is prepended to every design prompt before hitting DALL-E or Gemini.
export function buildBrandInjection(brand: BrandProfile): string {
  const fontDesc  = FONT_DESCRIPTIONS[brand.fontStyle]  || FONT_DESCRIPTIONS.modern
  const voiceDesc = VOICE_DESCRIPTIONS[brand.designVoice] || VOICE_DESCRIPTIONS.professional

  const patternLine = brand.patternPref !== 'none'
    ? `Incorporate subtle ${brand.patternPref === 'ankara' ? 'Ankara-inspired African geometric' : brand.patternPref} pattern elements as a secondary design texture.`
    : ''

  return `
BRAND IDENTITY — MANDATORY REQUIREMENTS:
Business: ${brand.businessName} (${brand.industry} industry, ${brand.city}, Nigeria)
Primary colour: ${brand.primaryColor} — this MUST be the dominant colour in the design
Secondary colour: ${brand.secondaryColor} — use for backgrounds, text backgrounds, and accents
Accent colour: ${brand.accentColor} — use sparingly for highlights and CTAs
Background: ${brand.backgroundColor}
Typography style: ${fontDesc}
Brand voice: ${voiceDesc}
Target market: Nigerian ${brand.industry} business customers
${patternLine}

CRITICAL COLOUR RULE: Use ONLY ${brand.primaryColor}, ${brand.secondaryColor}, and ${brand.accentColor} plus white and black. Do NOT introduce any other colours. The design must look immediately on-brand for ${brand.businessName}.

`.trim()
}

// ── Snapshot brand DNA for storage ───────────────────────────
export function snapshotBrand(brand: BrandProfile): Record<string, string | null> {
  return {
    primaryColor:   brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    accentColor:    brand.accentColor,
    fontStyle:      brand.fontStyle,
    designVoice:    brand.designVoice,
    logoUrl:        brand.logoUrl,
  }
}
