/**
 * /lib/tools/output-parsers.ts  v4
 *
 * Uses each tool's `outputSections` array as the authoritative guide
 * to split Claude's output into structured sections.  Each section is
 * classified as either COPY (what the user posts/sends/uses) or
 * GUIDANCE (strategy notes, timing, targeting — collapsed by default).
 *
 * Architecture:
 *   parseToolOutput(toolId, outputSections, rawText)
 *     → { layout, sections, allCopyText }
 *
 * Layout types (one per tool family):
 *   'carousel'   – swipeable variant cards   (copy-brain, caption-craft, ad-scribe, bio-builder, promo-blast)
 *   'whatsapp'   – WA bubble preview          (whatsapp-*, follow-up-*, welcome-*, win-back-*)
 *   'strategy'   – tabbed phases               (strategy-brain, launch-pad, campaign-clock, brand-positioner, audience-profiler)
 *   'sequence'   – numbered step timeline      (email-scribe, video-script-forge, sales-script-writer, funnel-builder)
 *   'calendar'   – week/day grid               (content-calendar)
 *   'document'   – accordion sections          (blog-brain, press-release-ai, proposal-writer, product-describer)
 *   'report'     – metric-first layout         (budget-optimizer, retarget-engine)
 *   'plain'      – single copy block fallback
 */

// ─── Public types ─────────────────────────────────────────────

export type LayoutType =
  | 'carousel' | 'whatsapp' | 'strategy' | 'sequence'
  | 'calendar'  | 'document' | 'report'   | 'plain'

export type SectionKind = 'copy' | 'guidance' | 'hashtags' | 'metrics'

export interface ParsedSection {
  id:       number
  name:     string        // original section name from outputSections
  label:    string        // display label (cleaned)
  kind:     SectionKind
  text:     string        // full section text
  // Extracted sub-fields (for copy sections):
  subject?: string        // email subject line
  timing?:  string        // "Send immediately" / "Friday 6–8pm"
  targets?: string        // who to send/target
  hashtags?: string[]     // #tags extracted
  bullets?: string[]      // → action items
  platform?: string       // Instagram / Facebook / WhatsApp
  icon?:    string        // emoji for the section
}

export interface ParsedOutput {
  layout:      LayoutType
  sections:    ParsedSection[]
  allCopyText: string          // full copy-only text for "Copy All"
}

// ─── Layout map ───────────────────────────────────────────────

const LAYOUT_MAP: Record<string, LayoutType> = {
  'copy-brain':              'carousel',
  'caption-craft':           'carousel',
  'ad-scribe':               'carousel',
  'bio-builder':             'carousel',
  'promo-blast':             'carousel',
  'story-planner':           'carousel',

  'whatsapp-campaign-builder': 'whatsapp',
  'follow-up-sequencer':       'whatsapp',
  'welcome-message-craft':     'whatsapp',
  'win-back-campaign':         'whatsapp',

  'strategy-brain':   'strategy',
  'launch-pad':       'strategy',
  'campaign-clock':   'strategy',
  'brand-positioner': 'strategy',
  'audience-profiler':'strategy',
  'retarget-engine':  'strategy',
  'funnel-builder':   'strategy',

  'email-scribe':        'sequence',
  'video-script-forge':  'sequence',
  'sales-script-writer': 'sequence',
  'carousel-script-builder': 'sequence',
  'lead-magnet-forge':   'sequence',

  'content-calendar': 'calendar',

  'blog-brain':            'document',
  'press-release-ai':      'document',
  'proposal-writer':       'document',
  'product-describer':     'document',
  'pricing-narrator':      'document',
  'influencer-brief-writer':'document',
  'google-ad-craft':       'document',

  'budget-optimizer':     'report',
  'campaign-clock-report':'report',
  'my-new-tool': 'carousel',
}

// ─── Guidance section names ───────────────────────────────────
// Sections whose NAME suggests strategy/context rather than usable copy

const GUIDANCE_NAME_PATTERNS: RegExp[] = [
  /guide$/i,
  /which to use/i,
  /analysis/i,
  /overview/i,
  /structure/i,
  /targeting/i,
  /benchmarks/i,
  /audit/i,
  /roadmap/i,
  /projections/i,
  /comparison/i,
  /recommendation/i,
  /implementation/i,
  /tracking/i,
  /performance/i,
  /^kpi/i,
  /calendar$/i,   // "Retargeting Calendar" = guidance
  /killers/i,
  /signals/i,
  /landing page/i,
  /legal/i,
  /frequency/i,
  /setup$/i,
  /anti-profile/i,
  /competitive map/i,
  /messaging hierarchy/i,
]

function isGuidanceSection(name: string): boolean {
  return GUIDANCE_NAME_PATTERNS.some(p => p.test(name))
}

// ─── Platform detection ───────────────────────────────────────

const PLATFORM_ICONS: Record<string, string> = {
  'instagram': '📸', 'facebook': '📘', 'linkedin': '💼',
  'tiktok':    '🎵', 'twitter':  '✕',  'x':        '✕',
  'whatsapp':  '💬', 'youtube':  '▶',  'website':  '🌐',
  'sms':       '📱', 'email':    '📧',
}

function detectPlatform(name: string): { platform: string; icon: string } | null {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(PLATFORM_ICONS)) {
    if (lower.includes(key)) return { platform: key.charAt(0).toUpperCase() + key.slice(1), icon }
  }
  return null
}

// ─── Section icons ────────────────────────────────────────────

function sectionIcon(name: string): string {
  const l = name.toLowerCase()
  if (l.includes('hook'))       return '🪝'
  if (l.includes('opening'))    return '👋'
  if (l.includes('close'))      return '🎯'
  if (l.includes('cta'))        return '🚀'
  if (l.includes('credibility'))return '🏆'
  if (l.includes('email'))      return '📧'
  if (l.includes('hashtag'))    return '#️⃣'
  if (l.includes('whatsapp'))   return '💬'
  if (l.includes('instagram'))  return '📸'
  if (l.includes('facebook'))   return '📘'
  if (l.includes('linkedin'))   return '💼'
  if (l.includes('phase') || l.includes('month')) return ['🎯','🚀','⚡','🏆'][
    parseInt(name.match(/\d/)?.[0] || '1') - 1
  ] ?? '📋'
  if (l.includes('week'))       return '📅'
  if (l.includes('story'))      return '📖'
  if (l.includes('launch'))     return '🚀'
  if (l.includes('revenue') || l.includes('roi')) return '💰'
  if (l.includes('audience') || l.includes('persona')) return '👥'
  if (l.includes('strategy'))   return '🗺️'
  if (l.includes('kpi') || l.includes('metric')) return '📊'
  if (l.includes('quick start') || l.includes('quick win')) return '⚡'
  if (l.includes('variant') || l.includes('option')) return '✍️'
  if (l.includes('ad set'))     return '🎯'
  return '📋'
}

// ─── Within-section extractors ────────────────────────────────

function extractSubject(text: string): { subject: string; rest: string } {
  const m = text.match(/^(?:\*\*)?Subject(?:\s*Line)?(?:\*\*)?:\s*(.+?)(?:\n|$)/im)
  if (!m) return { subject: '', rest: text }
  return {
    subject: m[1].replace(/\*\*/g, '').trim(),
    rest:    text.slice(0, m.index!) + text.slice(m.index! + m[0].length),
  }
}

function extractTiming(text: string): { timing: string; rest: string } {
  const m = text.match(/^(?:\*\*)?(?:Send|Timing|Delay|Schedule)(?:\*\*)?:\s*(.+?)(?:\n|$)/im)
  if (!m) return { timing: '', rest: text }
  return {
    timing: m[1].replace(/\*\*/g, '').trim(),
    rest:   text.slice(0, m.index!) + text.slice(m.index! + m[0].length),
  }
}

function extractTargets(text: string): { targets: string; rest: string } {
  const m = text.match(/^(?:\*\*)?(?:Who to Send|Target|Audience|Segment)(?:\*\*)?:\s*(.+?)(?:\n|$)/im)
  if (!m) return { targets: '', rest: text }
  return {
    targets: m[1].replace(/\*\*/g, '').trim(),
    rest:    text.slice(0, m.index!) + text.slice(m.index! + m[0].length),
  }
}

function extractHashtags(text: string): { hashtags: string[]; rest: string } {
  const hashtagLineRe = /^(?:\*\*)?Hashtags?(?:\*\*)?:?\s*(#\S+(?:\s+#\S+)*)/im
  const tagOnlyLineRe = /^((?:#\w+\s*){3,})/m  // line that is ONLY hashtags
  const m = text.match(hashtagLineRe) || text.match(tagOnlyLineRe)
  if (!m) return { hashtags: [], rest: text }
  const tags = m[1].match(/#\w+/g) || []
  return {
    hashtags: tags,
    rest:     text.slice(0, m.index!) + text.slice(m.index! + m[0].length),
  }
}

function extractBullets(text: string): string[] {
  const lines = text.split('\n')
  return lines
    .filter(l => /^[→•✓✅□]\s/.test(l.trim()) || /^\d+\.\s/.test(l.trim()))
    .map(l => l.replace(/^[→•✓✅□\d.]\s*/, '').trim())
    .filter(Boolean)
}

function cleanSectionText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // remove bold markers (keep the text)
    .replace(/^#{1,6}\s+/gm, '')        // remove heading markers
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── Text splitter by section names ──────────────────────────

function splitTextBySections(
  text:    string,
  names:   string[]
): Map<string, string> {
  const result = new Map<string, string>()
  if (!names.length) return result

  // Build a regex that matches any section header
  const escapedNames = names.map(n =>
    n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
     .replace(/\s+/g, '[\\s–—-]+')   // flexible dash/whitespace
     .replace(/\(/g, '\\(?').replace(/\)/g, '\\)?')
  )
  const headerRe = new RegExp(
    `(?:^#{1,4}\\s+(?:${escapedNames.join('|')})|^\\*\\*(?:${escapedNames.join('|')})\\*\\*)`,
    'gim'
  )

  const matches: Array<{ name: string; index: number }> = []
  let m: RegExpExecArray | null
  while ((m = headerRe.exec(text)) !== null) {
    const raw = m[0].replace(/^[#*\s]+/, '').replace(/\*\*$/, '').trim()
    // Find closest match in names array
    const matched = names.find(n => {
      const nCore = n.replace(/\s+/g, ' ').toLowerCase()
      const rCore = raw.replace(/\s+/g, ' ').toLowerCase()
      return rCore.includes(nCore) || nCore.includes(rCore) || nCore === rCore
    }) || raw
    matches.push({ name: matched, index: m.index + m[0].length })
  }

  if (matches.length === 0) {
    // No headers found — entire text belongs to first section
    result.set(names[0] ?? 'Output', text.trim())
    return result
  }

  matches.forEach((match, i) => {
    const end  = i + 1 < matches.length ? matches[i + 1].index - matches[i + 1].name.length - 6 : text.length
    const body = text.slice(match.index, Math.max(match.index, end)).trim()
    result.set(match.name, body)
  })

  return result
}

// ─── Main entry point ─────────────────────────────────────────

export function parseToolOutput(
  toolId:         string,
  outputSections: string[],
  rawText:        string
): ParsedOutput {
  const layout = LAYOUT_MAP[toolId] ?? 'plain'

  // If streaming or empty, return minimal structure
  if (!rawText.trim()) {
    return { layout, sections: [], allCopyText: '' }
  }

  // Split text by expected section names
  const sectionMap = splitTextBySections(rawText, outputSections)

  // If splitting found nothing, fall back to whole-text approach
  const effectiveSections = sectionMap.size > 0
    ? outputSections.filter(n => sectionMap.has(n))
    : outputSections.slice(0, 1)

  const parsed: ParsedSection[] = effectiveSections.map((name, idx) => {
    const rawBody = sectionMap.get(name) ?? (idx === 0 ? rawText : '')
    const kind: SectionKind = isGuidanceSection(name) ? 'guidance' : 'copy'

    // Base section
    const section: ParsedSection = {
      id:     idx + 1,
      name,
      label:  name,
      kind,
      text:   cleanSectionText(rawBody),
      icon:   sectionIcon(name),
    }

    // Only extract sub-fields for COPY sections
    if (kind === 'copy') {
      let rest = rawBody

      // Email subject
      const { subject, rest: r1 } = extractSubject(rest)
      if (subject) { section.subject = subject; rest = r1 }

      // Timing
      const { timing, rest: r2 } = extractTiming(rest)
      if (timing) { section.timing = timing; rest = r2 }

      // Targets
      const { targets, rest: r3 } = extractTargets(rest)
      if (targets) { section.targets = targets; rest = r3 }

      // Hashtags
      const { hashtags, rest: r4 } = extractHashtags(rest)
      if (hashtags.length) { section.hashtags = hashtags; rest = r4 }

      // Action items
      const bullets = extractBullets(rest)
      if (bullets.length) section.bullets = bullets

      // Platform detection
      const plt = detectPlatform(name)
      if (plt) { section.platform = plt.platform; section.icon = plt.icon }

      // Final clean text
      section.text = cleanSectionText(rest)
    }

    return section
  })

  // Build allCopyText from copy sections only
  const allCopyText = parsed
    .filter(s => s.kind === 'copy')
    .map(s => {
      const parts: string[] = []
      if (s.subject) parts.push(`Subject: ${s.subject}`)
      parts.push(s.text)
      if (s.hashtags?.length) parts.push(s.hashtags.join(' '))
      return parts.join('\n\n')
    })
    .join('\n\n──────────\n\n')

  return { layout, sections: parsed, allCopyText }
}

// ─── Re-exports for backward compat ───────────────────────────
export type { ParsedOutput as ParsedToolOutput }
