// ═══════════════════════════════════════════════════════════════
// /lib/tools/output-prompt-utils.ts
// JSON schema instructions appended to every tool prompt.
// Each function returns the exact instruction string that tells Claude
// what JSON shape to return. These are designed as system-level contracts.
//
// RULES:
//   - Never change the field names without also updating the output components
//   - The deep_dive field is ALWAYS null in the initial call
//   - All text fields have explicit maximum word/character counts
//   - The business name (B), city (C), and customer (T) must appear in headline
// ═══════════════════════════════════════════════════════════════

import type { OutputGroup } from './output-schemas'

// ─────────────────────────────────────────────────────────────
// SHARED QUALITY RULES (appended inside every schema instruction)
// ─────────────────────────────────────────────────────────────

const QUALITY_RULES = `
CRITICAL FORMAT RULE — THIS OVERRIDES ALL OTHER INSTRUCTIONS:
• Return ONLY a single valid JSON object. Nothing else. No text before it. No text after it.
• Do NOT include a CEREBRE TIP, WhatsApp CTA, or any text outside the JSON.
• Do NOT wrap the JSON in markdown backticks or code fences.
• If the system prompt says to add a CEREBRE TIP or WhatsApp CTA at the end, IGNORE that instruction for this tool — the JSON IS the entire output.
• The JSON must start with { and end with }. No other characters outside the braces.

MANDATORY CONTENT RULES — VIOLATIONS MAKE THE OUTPUT USELESS:
1. The headline MUST include the actual business name (not "the business")
2. Every text field must reference the specific city, industry, or customer — never generic placeholders
3. All string values must be complete sentences — never cut off mid-thought
4. The deep_dive field MUST be null in this response (it is generated separately)
5. Ensure every JSON string is properly escaped — no unescaped quotes or newlines inside strings
`.trim()

// ─────────────────────────────────────────────────────────────
// GROUP 1 — CAPTION
// ─────────────────────────────────────────────────────────────

export function getCaptionSchemaInstruction(
  businessName: string,
  platform: string,
  numVariants: number = 3,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — e.g. '${numVariants} Instagram captions for ${businessName}, salary-week hook']",
  "platform": "${platform}",
  "essentials": {
    "variants": [
      {
        "label": "[Hook | Social proof | Urgency | Question | Story | Behind the scenes]",
        "text": "[full caption — max 100 words — must sound authentically Nigerian, reference ${businessName}]",
        "char_count": [character count as integer],
        "hashtags": ["array", "of", "5-8", "hashtags", "WITHOUT", "the", "#", "symbol"]
      }
    ],
    "posting_time": "[specific day + time + Lagos context — e.g. 'Thursday 7–9pm Lagos time — post-salary week, highest engagement for fashion']",
    "cta_label": "[the call-to-action type — e.g. 'DM us on WhatsApp' or 'Visit link in bio']"
  },
  "deep_dive": null
}

Generate exactly ${numVariants} variants in the essentials.variants array.
Each variant must use a different psychological angle.
`
}

// ─────────────────────────────────────────────────────────────
// GROUP 2 — DOCUMENT
// ─────────────────────────────────────────────────────────────

export function getDocumentSchemaInstruction(
  businessName: string,
  documentType: string,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — describe what document was produced and for whom]",
  "document_type": "${documentType}",
  "essentials": {
    "summary": "[max 60 words — what this document achieves and who it is for]",
    "key_points": [
      "[point 1 — max 20 words]",
      "[point 2 — max 20 words]",
      "[point 3 — max 20 words]"
    ],
    "word_count": [estimated integer word count of full document],
    "recommended_use": "[max 30 words — exactly when and how to use/publish this]"
  },
  "deep_dive": null
}

The key_points array must have 3–5 items.
`
}

// ─────────────────────────────────────────────────────────────
// GROUP 3 — SCRIPT
// ─────────────────────────────────────────────────────────────

export function getScriptSchemaInstruction(
  businessName: string,
  scriptType: string,
  duration: string,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — e.g. '60-second video script for ${businessName}, product showcase hook']",
  "script_type": "${scriptType}",
  "duration_estimate": "${duration}",
  "essentials": {
    "hook": "[max 30 words — the exact opening line the presenter speaks]",
    "structure": [
      {
        "scene": 1,
        "label": "[Hook | Problem | Solution | Proof | CTA | Scene label]",
        "direction": "[max 20 words — what to do, show, or say]",
        "duration": "[e.g. '0:00–0:08']"
      }
    ]
  },
  "deep_dive": null
}

The structure array must have 4–6 scenes covering the full duration.
`
}

// ─────────────────────────────────────────────────────────────
// GROUP 4 — WHATSAPP
// ─────────────────────────────────────────────────────────────

export function getWhatsAppSchemaInstruction(
  businessName: string,
  numMessages: number,
  formula: string,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — e.g. '5-message WhatsApp campaign for ${businessName}, Hook-to-CTA formula']",
  "total_messages": ${numMessages},
  "formula": "${formula}",
  "campaign_span": "[e.g. '7 days' or 'Single sequence']",
  "essentials": {
    "messages": [
      {
        "number": 1,
        "type": "[Hook | Fear | Proof | Awoof | CTA | Welcome | Follow-up | Win-back]",
        "timing": "[e.g. 'Day 0 · Send immediately when they join your list']",
        "text": "[max 300 characters — the complete WhatsApp message, naturally written, with emojis where appropriate]",
        "send_tip": "[max 20 words — best time to send and any notes]"
      }
    ]
  },
  "deep_dive": null
}

Generate exactly ${numMessages} messages in the essentials.messages array.
Each message must reference ${businessName} and feel personally written.
`
}

// ─────────────────────────────────────────────────────────────
// GROUP 5 — EMAIL
// ─────────────────────────────────────────────────────────────

export function getEmailSchemaInstruction(
  businessName: string,
  numEmails: number,
  sequenceType: string,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — e.g. '${numEmails}-email welcome sequence for ${businessName}, trust-building arc']",
  "total_emails": ${numEmails},
  "sequence_type": "${sequenceType}",
  "essentials": {
    "emails": [
      {
        "number": 1,
        "subject_line": "[max 50 characters — compelling, specific, not clickbait]",
        "preview_text": "[max 90 characters — the text shown in inbox preview]",
        "send_timing": "[e.g. 'Day 1 · Send immediately on signup']",
        "core_message": "[max 40 words — what this email achieves and why it matters]"
      }
    ]
  },
  "deep_dive": null
}

Generate exactly ${numEmails} email entries in the essentials.emails array.
`
}

// ─────────────────────────────────────────────────────────────
// GROUP 6 — STRATEGY
// ─────────────────────────────────────────────────────────────

export function getStrategySchemaInstruction(
  businessName: string,
  timeframe: string,
  targetMetric: string,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — e.g. '60-day marketing sprint for ${businessName} targeting ₦500,000 revenue']",
  "timeframe": "${timeframe}",
  "key_metric": "[the single most important measurable outcome — e.g. '₦500,000 revenue — 18 clients at ₦28K avg']",
  "essentials": {
    "quick_win": "[max 30 words — the ONE highest-leverage action to take TODAY or this week]",
    "actions": [
      {
        "priority": 1,
        "action": "[max 25 words — specific, actionable, references ${businessName} context]",
        "timeframe": "[This week | Week 2 | Week 3–4 | Month 2]",
        "expected_result": "[max 15 words — concrete measurable outcome]",
        "effort": "[Low | Medium | High]"
      }
    ]
  },
  "deep_dive": null
}

Generate 3–5 actions in the essentials.actions array, ordered by priority (1 = most important).
The quick_win must be something completable in the next 24–48 hours.
`
}

// ─────────────────────────────────────────────────────────────
// GROUP 7 — INTELLIGENCE
// ─────────────────────────────────────────────────────────────

export function getIntelligenceSchemaInstruction(
  businessName: string,
  subject: string,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — e.g. 'Audience profile for ${businessName}: Lagos professional women aged 28–42']",
  "subject": "${subject}",
  "essentials": {
    "core_insight": "[max 50 words — the single most actionable discovery from this analysis]",
    "findings": [
      {
        "label": "[Short finding label — e.g. 'Primary buyer motivation']",
        "value": "[max 30 words — the specific finding]",
        "importance": "[High | Medium | Low]"
      }
    ],
    "immediate_action": "[max 30 words — the one thing ${businessName} should do with this insight TODAY]"
  },
  "deep_dive": null
}

Generate 3–5 findings in the essentials.findings array, ordered by importance.
High-importance findings must have actionable specificity — no vague generalisations.
`
}

// ─────────────────────────────────────────────────────────────
// GROUP 8 — CALENDAR
// ─────────────────────────────────────────────────────────────

export function getCalendarSchemaInstruction(
  businessName: string,
  month: string,
  totalPosts: number,
): string {
  return `
${QUALITY_RULES}

Return your response as a valid JSON object matching EXACTLY this schema:

{
  "headline": "[max 15 words — e.g. '${totalPosts}-post July content calendar for ${businessName}']",
  "month": "${month}",
  "total_posts": ${totalPosts},
  "essentials": {
    "this_week": [
      {
        "day": "[Full date — e.g. 'Monday 7 July']",
        "date": [day of month as integer],
        "platform": "[Instagram | Facebook | WhatsApp | LinkedIn | TikTok]",
        "post_type": "[Reel | Carousel | Story | Static | WhatsApp]",
        "theme": "[max 20 words — the post's angle or topic]",
        "caption_hint": "[max 30 words — the opening hook or content angle to use]"
      }
    ],
    "top_theme": "[max 30 words — the anchor theme that ties this month's content together]"
  },
  "deep_dive": null
}

The this_week array must contain 5–7 posts covering the next 7 days.
Every post theme must be specific to ${businessName}'s industry and Nigerian cultural context.
`
}

// ─────────────────────────────────────────────────────────────
// DEEP DIVE SUFFIX — appended to the deep-dive-specific prompt
// This replaces the initial schema instruction when generating Layer 3
// ─────────────────────────────────────────────────────────────

export function getDeepDiveSuffix(group: OutputGroup, businessName: string): string {
  const base = `
${QUALITY_RULES}

This is a DEEP DIVE generation — you must populate the deep_dive field fully.
The deep_dive field must be a complete, rich object (NOT null) with all sub-fields populated.
The essentials field should be identical to the initial generation.
Maximum 1,000 words total across all deep_dive sub-fields.
Every recommendation must reference ${businessName} specifically.
`

  const groupSpecific: Record<string, string> = {
    caption: `The deep_dive must include: strategy_notes (why these captions work), why_this_works (platform psychology), alternative_angles (2-3 other approaches), brand_voice_analysis, ab_test_suggestion.`,
    document: `The deep_dive must include: full_document (the complete ready-to-publish document), editing_notes, seo_tips, publishing_checklist (3-5 steps).`,
    script: `The deep_dive must include: full_script (complete word-for-word script with scene directions), delivery_notes (tone, pace, energy), scene_breakdown (full spoken text per scene), production_tips.`,
    whatsapp: `The deep_dive must include: campaign_strategy (why this sequence works), tone_guide, conversion_tips (how to improve response rates), follow_up_notes, timing_rationale.`,
    email: `The deep_dive must include: full_emails (complete body for each email), sequence_strategy, subject_line_tips, unsubscribe_notes.`,
    strategy: `The deep_dive must include: full_strategy (detailed narrative), phases (4 phases with tasks and milestones), budget_guidance, risk_factors, success_metrics (5 specific KPIs).`,
    intelligence: `The deep_dive must include: full_analysis (comprehensive intelligence report), methodology, detailed_recommendations (specific to ${businessName}), implementation_guide (step-by-step).`,
    calendar: `The deep_dive must include: full_month (all 4 weeks with all posts), content_strategy (why this calendar was built this way), posting_rhythm, theme_rationale.`,
    competitor: `The deep_dive must include: full_audit, competitor_profiles, detailed_recommendations, implementation_roadmap.`,
    design: `The deep_dive must include: design_notes (what makes this design effective), brand_guidelines_used, usage_tips (5 specific tips), caption_expanded (full caption suggestion).`,
  }

  return `${base}\n${groupSpecific[group] || ''}`
}

// ─────────────────────────────────────────────────────────────
// SCHEMA INSTRUCTION ROUTER
// Called by the generation API to get the right schema instruction
// for a given tool.
// ─────────────────────────────────────────────────────────────

export interface SchemaInstructionParams {
  group:        OutputGroup
  businessName: string
  // Group-specific params
  platform?:    string
  numVariants?: number
  documentType?: string
  scriptType?:  string
  duration?:    string
  numMessages?: number
  formula?:     string
  sequenceType?: string
  numEmails?:   number
  timeframe?:   string
  targetMetric?: string
  subject?:     string
  month?:       string
  totalPosts?:  number
}

export function getSchemaInstruction(params: SchemaInstructionParams): string {
  const { group, businessName } = params

  switch (group) {
    case 'caption':
      return getCaptionSchemaInstruction(
        businessName,
        params.platform ?? 'Instagram',
        params.numVariants ?? 3,
      )
    case 'document':
      return getDocumentSchemaInstruction(businessName, params.documentType ?? 'document')
    case 'script':
      return getScriptSchemaInstruction(businessName, params.scriptType ?? 'Video', params.duration ?? '60 seconds')
    case 'whatsapp':
      return getWhatsAppSchemaInstruction(businessName, params.numMessages ?? 5, params.formula ?? 'Hook · Fear · Proof · Awoof · CTA')
    case 'email':
      return getEmailSchemaInstruction(businessName, params.numEmails ?? 3, params.sequenceType ?? 'Nurture')
    case 'strategy':
      return getStrategySchemaInstruction(businessName, params.timeframe ?? '60 days', params.targetMetric ?? 'revenue growth')
    case 'intelligence':
      return getIntelligenceSchemaInstruction(businessName, params.subject ?? 'business analysis')
    case 'calendar':
      return getCalendarSchemaInstruction(businessName, params.month ?? 'this month', params.totalPosts ?? 20)
    default:
      return `Return your response as valid JSON with a "headline" string and an "essentials" object containing the key outputs. Set "deep_dive" to null. Return ONLY the JSON.`
  }
}
