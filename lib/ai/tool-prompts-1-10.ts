// ═══════════════════════════════════════════════════════════════
// /lib/ai/tool-prompts-1-10.ts
// Complete AI prompts for Tools 1–10 (Copywriting & Content).
// Each prompt: specialist activation + output structure + Laws applied.
// SERVER-SIDE ONLY.
// ═══════════════════════════════════════════════════════════════

import type { ProfileContext } from './master-system-prompt'

// ─────────────────────────────────────────────────────────────
// PROFILE SHORTHAND HELPERS
// ─────────────────────────────────────────────────────────────

const B = (p: ProfileContext) => p.business_name  || 'the business'
const C = (p: ProfileContext) => p.city           || 'Nigeria'
const I = (p: ProfileContext) => p.industry       || 'your industry'
const W = (p: ProfileContext) => {
  const raw = p.whatsapp || '08012345678'
  const digits = raw.replace(/\D/g, '').replace(/^0/, '')
  return { display: raw, link: `wa.me/234${digits}` }
}
const T = (p: ProfileContext) => p.target_customer || 'your target customers'
const A = (p: ProfileContext) => p.unique_advantage || 'quality and reliability'
const V = (p: ProfileContext) => p.brand_voice    || 'professional'
const L = (p: ProfileContext) => p.language_preference || 'Nigerian English'
const PR = (p: ProfileContext) => p.social_proof  || ''
const YR = (p: ProfileContext) => p.years_in_business
  ? `${p.years_in_business} years in business`
  : ''
const DESC = (p: ProfileContext) => p.description || ''
const PRICE = (p: ProfileContext) => p.price_range || ''

// ─────────────────────────────────────────────────────────────
// TOOL 01 — COPYBRAIN AI
// Laws: 1 (Awoof), 4 (Fear), 5 (Giant Promise), 6 (Story), 7 (Sales Letter)
// ─────────────────────────────────────────────────────────────

export function getCopyBrainPrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)

  const purposeLabel: Record<string, string> = {
    social_media_post:         'social media post',
    facebook_instagram_ad:     'Facebook/Instagram ad',
    website_homepage_copy:     'website homepage copy',
    whatsapp_broadcast:        'WhatsApp broadcast message',
    product_service_description: 'product/service description',
    promotional_flyer_copy:    'promotional flyer copy',
    sales_pitch_message:       'sales pitch message',
    other:                     'marketing copy',
  }

  const contentLabel: Record<string, string> = {
    caption_only:       'caption only',
    headline_body_cta:  'headline + body + CTA',
    full_ad_copy:       'full ad copy with all elements',
    full_landing_page:  'full landing page copy',
  }

  const product = inputs.specific_product || DESC(profile) || `the products and services of ${B(profile)}`
  const trust   = inputs.trust_signal     || PR(profile)   || YR(profile) || `${B(profile)} in ${C(profile)}`
  const price   = inputs.price_and_offer  || PRICE(profile) || ''

  return `
SPECIALIST ACTIVATED: Cerebre Plus-trained conversion copywriter — the best in Africa for the Nigerian market.

PRIMARY LAWS FOR THIS OUTPUT: Law 1 (Awoof Stack), Law 4 (Fear), Law 5 (Giant Promise), Law 6 (Story), Law 7 (Sales Letter Formula)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:       ${B(profile)} — ${I(profile)} in ${C(profile)}
Purpose:        ${purposeLabel[inputs.copy_purpose] || inputs.copy_purpose}
Content Format: ${contentLabel[inputs.content_type] || inputs.content_type}
Goal:           ${inputs.copy_goal?.replace(/_/g, ' ')}
Platform:       ${inputs.platform?.replace(/_/g, ' ')}
Emotional Hook: ${inputs.emotional_hook?.replace(/_/g, ' ')}
Subject:        ${product}
Target Audience: ${T(profile)}
Unique Advantage: ${A(profile)}
Trust Signal:   ${trust}
${price ? `Offer/Price:    ${price}` : ''}
WhatsApp:       ${wa.display} (${wa.link})
Brand Voice:    ${V(profile)}
Language:       ${L(profile)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT INSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Produce 3 COMPLETE, immediately publishable copy variants. Each variant must be written in ${L(profile)} with ${V(profile)} tone, personalised for ${B(profile)} in ${C(profile)}.

The FIRST SENTENCE of every variant must pass the "Lagos Bus Test": would a ${C(profile)} resident, scrolling on a bouncing danfo bus on 3G, stop for this opening line? If not, rewrite until they would.

Every variant must contain: the business name (${B(profile)}), the city (${C(profile)}), a trust signal, and end with the WhatsApp CTA including the actual number (${wa.display}).

─────────────────────────────────────────
## VARIANT A — THE FEAR APPROACH
*Primary Law: Law 4 (Fear) + Law 3 (Trust)*
─────────────────────────────────────────
AKIN'S INSTRUCTION FOR THIS VARIANT:
"Open with what they are LOSING right now by not acting. Make the cost of inaction so specific and vivid that it hurts. Name their competitor (generically). Name their city. Show the money walking out the door every week they wait. The fear must be honest and real — not manufactured. Then position ${B(profile)} as the relief."

FORMAT: ${contentLabel[inputs.content_type]}
[Write the complete ${contentLabel[inputs.content_type]} using the Fear approach]

Opening Hook: [The cost of inaction — vivid, specific, set in ${C(profile)}]
Body: [Agitate the problem → introduce the relief → trust signal: ${trust}]
${price ? `Price (with Awoof context): [${price} — what this is worth vs. what it costs]` : ''}
CTA: [WhatsApp CTA — exact message to send — wa.me/234${W(profile).link.replace('wa.me/234', '')}]

**Cerebre Expert Note:** [One specific thing Cerebre Plus would improve about this variant for the ${C(profile)} market]

─────────────────────────────────────────
## VARIANT B — THE AWOOF APPROACH
*Primary Law: Law 1 (Awoof Stack) + Law 5 (Giant Promise)*
─────────────────────────────────────────
AKIN'S INSTRUCTION FOR THIS VARIANT:
"Build the comparison stack so compelling that refusing to act feels irrational. Show exactly what this would cost if they hired a professional consultant, agency, or specialist — then show what ${B(profile)} delivers for ${price || 'their investment'}. Make them feel they're stealing from you. The comparison IS the selling line."

FORMAT: ${contentLabel[inputs.content_type]}
[Write the complete ${contentLabel[inputs.content_type]} using the Awoof approach]

Awoof Stack: [What a ${C(profile)} agency/professional would charge for this vs. what ${B(profile)} delivers]
Giant Promise: [The specific, bold outcome they get — with a number]
Body: [Benefits (not features) → social proof → ${trust}]
${price ? `Investment: [${price} — framed as the outrageously good deal it is]` : ''}
CTA: [WhatsApp CTA — include ${wa.display} directly in the message]

**Cerebre Expert Note:** [The one Awoof comparison line that would make this convert 3x better]

─────────────────────────────────────────
## VARIANT C — THE STORY APPROACH
*Primary Law: Law 6 (Story) + Law 2 (List Building)*
─────────────────────────────────────────
AKIN'S INSTRUCTION FOR THIS VARIANT:
"Begin with a 3-sentence story of a relatable Nigerian business owner. Make them recognisable. The story arc: [STRUGGLE — a problem the reader sees in themselves] → [DISCOVERY — how they found ${B(profile)}] → [TRANSFORMATION — the specific result they got]. The reader should think 'that's me' by sentence two. Only introduce the offer AFTER the reader is emotionally invested."

FORMAT: ${contentLabel[inputs.content_type]}
[Write the complete ${contentLabel[inputs.content_type]} using the Story approach]

Story Open: [3 sentences — Nigerian business owner + city + struggle → discovery → result]
Bridge: [How ${B(profile)} creates this result for people like them]
Trust Moment: [${trust}]
Low-Commitment CTA First: [Something easy — e.g. "Send me a WhatsApp and I'll tell you if this is right for you" — ${wa.display}]
Close: [The actual offer/ask — after trust is built]

**Cerebre Expert Note:** [The story detail that would make this variant resonate most in ${C(profile)}]

─────────────────────────────────────────
## CEREBRE'S RECOMMENDATION
─────────────────────────────────────────
**Which variant to use and when:**
- For [goal/context]: Use Variant [A/B/C] because [specific reasoning for ${I(profile)} businesses in ${C(profile)}]
- For [goal/context]: Use Variant [A/B/C] because [specific reasoning]
- A/B test recommendation: [Which two to test first and why]

**Timing note for ${C(profile)}:**
[Is the last week of the month better for this content? Why or why not for ${I(profile)}?]

💡 CEREBRE TIP: [One specific, non-obvious Nigerian copywriting insight that applies directly to ${I(profile)} businesses — something that would surprise most business owners and immediately improve their conversion rate]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 02 — CAPTIONCRAFT
// Laws: 1 (Awoof in context), 2 (List building), 3 (Trust), 8 (Serve lazy buyer)
// ─────────────────────────────────────────────────────────────

export function getCaptionCraftPrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)
  const platforms: string[] = Array.isArray(inputs.platform)
    ? inputs.platform
    : [inputs.platform || 'instagram']

  const platformNotes: Record<string, string> = {
    instagram: 'IG: visual-forward, emotive, hook in first line, 5-8 line breaks for readability, 1-3 emojis, 20-30 hashtags',
    facebook:  'FB: story-led and longer, more text comfortable, community feeling, personal tone, 3-5 hashtags',
    linkedin:  'LinkedIn: insight-driven, professional credibility, thought leadership, minimal hashtags (3-5), formal but warm',
    tiktok:    'TikTok: rapid and conversational, hooks in under 3 words, trends-aware, bold claims, 5-8 hashtags',
    twitter:   'Twitter/X: punchy and direct, under 280 chars for main tweet, thread format for longer pieces, 1-2 hashtags',
    threads:   'Threads: conversational, Instagram-adjacent, longer-form OK, community discussion focus',
  }

  const numVariations = parseInt(inputs.num_variations || '3', 10)

  return `
SPECIALIST ACTIVATED: Nigerian social media content expert who understands exactly what makes ${C(profile)} audiences stop scrolling.

PRIMARY LAWS: Law 2 (List Building — every caption has a path to WhatsApp), Law 3 (Trust signals), Law 8 (Serve the scrolling thumb — zero friction), Law 1 (Awoof angle where promotional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAPTION BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:        ${B(profile)} — ${I(profile)} in ${C(profile)}
Platforms:       ${platforms.join(', ')}
Topic:           ${inputs.post_topic}
Post Type:       ${inputs.post_type?.replace(/_/g, ' ')}
Tone:            ${inputs.tone_override === 'use_brand_voice' ? V(profile) : inputs.tone_override?.replace(/_/g, ' ')}
Hashtag Strategy: ${inputs.hashtag_strategy?.replace(/_/g, ' ')}
CTA Preference:  ${inputs.cta_preference?.replace(/_/g, ' ')}
Length:          ${inputs.caption_length || 'medium'}
Variations:      ${numVariations}
WhatsApp:        ${wa.display}
Trust Signal:    ${PR(profile) || YR(profile) || `${B(profile)} in ${C(profile)}`}
Language Style:  ${L(profile)}
${inputs.target_emotion ? `Emotional Target: ${inputs.target_emotion}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE LAGOS BUS TEST (APPLY TO EVERY CAPTION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before writing each caption, ask: "Would a ${C(profile)} resident, standing on a crowded bus on 3G data, stop scrolling for this first line?" If the first sentence doesn't pass this test, rewrite it until it does. The first line is the entire caption — everything after it is bonus.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — GENERATE FOR EACH PLATFORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${platforms.map((platform: string) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ${platform.toUpperCase()} CAPTIONS
*Format guide: ${platformNotes[platform] || 'Adapted to platform best practices'}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Array.from({ length: numVariations }, (_, i) => `
### Caption ${i + 1} of ${numVariations} — [Hook style: e.g. "Question Hook" / "Bold Statement" / "Story Open" / "Shocking Fact" / "Direct Command"]

[FULL CAPTION — complete, copy-paste ready, written in ${L(profile)} with ${inputs.tone_override === 'use_brand_voice' ? V(profile) : inputs.tone_override?.replace(/_/g, ' ') || V(profile)} tone]

**Hook Line (first 125 chars — what shows before "more"):**
[Standalone hook that works even if the rest is cut off]

**Body:**
[Main content — ${inputs.caption_length === 'short' ? '2-3 short paragraphs' : inputs.caption_length === 'long' ? '4-6 paragraphs with line breaks' : '3-4 short paragraphs'} — with line breaks for mobile readability]

**Trust Moment:**
[Natural trust signal insertion — ${PR(profile) || YR(profile) || `${B(profile)}'s track record`}]

**CTA:**
${inputs.cta_preference === 'whatsapp_cta'
  ? `"[Action] — send me a message on WhatsApp right now: ${wa.display}" (Link: ${wa.link})`
  : inputs.cta_preference === 'comment_below'
    ? '[Question that invites Nigerian audiences to engage — something with a YES/NO or easy answer]'
    : '[Appropriate CTA based on preference]'
}

${inputs.hashtag_strategy !== 'no_hashtags' ? `**Hashtag Set:**
[Platform-optimised hashtags — ${platform === 'instagram' ? '20-25' : platform === 'facebook' ? '3-5' : platform === 'tiktok' ? '5-8' : '3-5'} hashtags]
[Mix: broad Nigerian hashtags + ${I(profile)}-specific + ${C(profile)}-location + ${B(profile).toLowerCase().replace(/\s/g, '')} brand hashtag]` : ''}
`).join('\n')}

**🕐 Best Posting Time for ${C(profile)} on ${platform.charAt(0).toUpperCase() + platform.slice(1)}:**
[Specific WAT time based on Nigerian audience behaviour on this platform]

**💡 Engagement Tip for Nigerian ${platform.charAt(0).toUpperCase() + platform.slice(1)} Users:**
[One specific, actionable tip for how ${I(profile)} businesses can maximise engagement from ${C(profile)} audiences on this platform]
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CROSS-PLATFORM REPURPOSING GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
How to adapt Caption 1 for each of the platforms above without rewriting from scratch.

💡 CEREBRE TIP: [The single most powerful caption element that Nigerian ${I(profile)} audiences in ${C(profile)} respond to — backed by what actually works in this market, not generic social media advice]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 03 — ADSCRIBE
// Laws: 1 (Awoof), 4 (Fear), 5 (Giant Promise), 7 (Sales Letter), 10 (Urgency)
// ─────────────────────────────────────────────────────────────

export function getAdScribePrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)
  const numVariations = parseInt(inputs.ad_variations || '3', 10)

  const platformGuide: Record<string, string> = {
    facebook_instagram: 'Meta Ads: Primary Text (max 125 chars visible + more), Headline (max 40 chars), Description (max 30 chars), CTA Button. Mobile-first — most Nigerian Facebook users are on mobile.',
    google_search:      'Google Search: 3x Headlines (max 30 chars each), 2x Descriptions (max 90 chars each). Match to Nigerian search intent patterns. Use city names.',
    google_display:     'Google Display: Short headline (max 30 chars), Long headline (max 90 chars), Description (max 90 chars). Visual guidance for the creative.',
    tiktok_ads:         'TikTok Ads: Hook (first 3 seconds crucial), body, CTA. Native feel — should not look like an ad. Young Nigerian market.',
    youtube_preroll:    'YouTube Pre-roll: Must earn attention in first 5 seconds before skip button. Hook is everything.',
    twitter_ads:        'Twitter/X Ads: 280 char limit for promoted tweet. Punchy, direct, trend-aware.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian performance advertising expert — ₦500M+ in African ad spend managed. Laws 1, 4, 5, 7, 10 are PRIMARY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AD BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:          ${B(profile)} — ${I(profile)} in ${C(profile)}
Platform:          ${inputs.ad_platform?.replace(/_/g, ' ')}
Objective:         ${inputs.ad_objective?.replace(/_/g, ' ')}
Product/Service:   ${inputs.product_or_service}
Target Audience:   ${inputs.target_audience_description || T(profile)}
USP:               ${inputs.unique_selling_point || A(profile)}
${inputs.special_offer ? `Special Offer:     ${inputs.special_offer}` : ''}
${inputs.monthly_budget_naira ? `Monthly Budget:    ${inputs.monthly_budget_naira}` : ''}
Trust Signal:      ${PR(profile) || YR(profile)}
WhatsApp:          ${wa.display}
Variations:        ${numVariations}
Language:          ${L(profile)}

Platform Format:   ${platformGuide[inputs.ad_platform] || 'Platform-appropriate format'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGERIAN AD INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Nigerian Facebook/IG mobile users scroll fast — the first 3 words of primary text must stop them
- Including the city name (${C(profile)}) in ad copy increases CTR for Nigerian audiences by an average 35%
- Price anchoring (Awoof Stack) in Nigerian ads: showing "Normal: ₦X — Now: ₦Y" outperforms any other ad format for conversion
- Nigerian users have FOBE — ads must include a trust signal in the first 50 words
- WhatsApp CTAs outperform website CTAs for Nigerian audiences by 4x — always use WhatsApp where possible
- Salary week (last 7 days of month) is the highest-converting window — note if budget should be concentrated here

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — ${numVariations} COMPLETE AD SETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Array.from({ length: numVariations }, (_, i) => {
  const approaches = ['The Fear/Pain Ad (Law 4)', 'The Awoof/Value Ad (Law 1 + 5)', 'The Social Proof/Community Ad (Law 3 + 9)', 'The Urgency Close Ad (Law 10)', 'The Story Ad (Law 6)']
  const approach = approaches[i % approaches.length]
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## AD SET ${i + 1} OF ${numVariations} — ${approach}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### PRIMARY TEXT (${inputs.ad_platform === 'google_search' ? 'Ad Copy' : 'Facebook/IG Body'}):
[Complete ad body — written in ${L(profile)}, immediately publishable]
[Must include: trust signal + ${i === 0 ? 'fear of not acting' : i === 1 ? 'Awoof Stack price comparison' : 'social proof from Nigerian community'} + WhatsApp CTA]
[WhatsApp number included directly: ${wa.display}]

### HEADLINE (${inputs.ad_platform === 'google_search' ? 'Headline 1 / Headline 2 / Headline 3' : '40 chars max'}):
${inputs.ad_platform === 'google_search'
  ? `Headline 1: [Power word + keyword + ${C(profile)} — max 30 chars]\nHeadline 2: [Benefit/USP — max 30 chars]\nHeadline 3: [CTA or trust signal — max 30 chars]`
  : '[Specific benefit OR number OR fear trigger — max 40 chars]'
}

### DESCRIPTION:
${inputs.ad_platform === 'google_search'
  ? `Description 1: [Expand headline 1 benefit with specific ${C(profile)} context — max 90 chars]\nDescription 2: [Trust signal + CTA — max 90 chars]`
  : '[Urgency reinforcement or bonus — max 30 chars]'
}

### CTA BUTTON: [WhatsApp / Send Message / Learn More / Shop Now — most effective for this objective]

### CREATIVE DIRECTION (Visual Brief):
Image/Video: [Specific visual recommendation for Nigerian market — what type of creative works for ${I(profile)} ads in ${C(profile)}]
Color: [${profile.brand_colour || '#E09818'} as accent — how to use in creative]
Text Overlay: [What text to overlay on the image if any]

### AUDIENCE TARGETING RECOMMENDATION:
Age Range: [Specific range for ${I(profile)} buyers in ${C(profile)}]
Location: ${C(profile)} + [specific areas/radius]
Interests: [8 specific Meta interest categories that catch Nigerian ${I(profile)} buyers]
Exclusions: [Who NOT to show this ad to — save budget]

### ESTIMATED PERFORMANCE (Nigerian ${I(profile)} market benchmarks):
Expected CTR: [Range]
Expected CPC: ₦[Range]
Expected CPL (if lead gen): ₦[Range]

**Cerebre Expert Note:** [What Cerebre Plus would specifically improve about this ad for the ${C(profile)} market]
`}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CAMPAIGN STRUCTURE RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Testing Order:** Run Ad Set [N] first because [reason] — measure for [X] days before testing Ad Set [N]
**Budget Split:** [How to allocate if running multiple ad sets]
**Salary Week Strategy:** [Specific advice for concentrating spend in last 7 days of month for ${I(profile)}]
**What to Measure First:** [The one metric that tells you if this campaign is working for ${B(profile)}]

💡 CEREBRE TIP: [The Nigerian paid advertising insight specific to ${I(profile)} businesses — the targeting or creative tweak that most Nigerian advertisers miss and that can cut cost per lead by 40-60%]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 04 — EMAILSCRIBE
// Laws: 2 (List building), 6 (Story), 7 (Sales Letter), 10 (Urgency)
// ─────────────────────────────────────────────────────────────

export function getEmailScribePrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)
  const numEmails = parseInt(inputs.num_emails || '5', 10)

  const sequenceGoal: Record<string, string> = {
    welcome_onboarding:      'Welcome new subscribers — build relationship before asking for anything',
    sales_campaign_launch:   'Launch and sell a specific product/service',
    nurture_relationship:    'Build trust over time — the long game that creates loyal buyers',
    abandoned_cart_follow_up: 'Re-engage people who started but did not complete a purchase',
    reengagement_winback:    'Wake up inactive subscribers who have gone quiet',
    promotional_campaign:    'Run a time-limited promotion with urgency and Awoof Stack',
    event_invitation:        'Invite and follow up for an event, webinar, or workshop',
    post_purchase_onboarding: 'Onboard new buyers — reduce regret, increase referrals',
  }

  // Email structure guide by position in sequence
  const emailPurposes: Record<number, { title: string; primaryLaw: string; instruction: string }> = {
    1: {
      title: 'THE WELCOME / HOOK',
      primaryLaw: 'Law 6 (Story) + Law 2 (List)',
      instruction: 'Open with the best story you have. A real Nigerian business owner. Their struggle. Do NOT sell in email 1. Your only job is to make them look forward to email 2. End with a promise of what is coming.',
    },
    2: {
      title: 'THE VALUE DELIVERY',
      primaryLaw: 'Law 3 (Trust) + Law 2 (List)',
      instruction: 'Give your single best piece of advice — something they would normally pay for. No selling. Build credibility. Drop a specific trust signal: years in business, client results, a testimonial. Create the feeling "these people actually know what they\'re talking about."',
    },
    3: {
      title: 'THE PROBLEM AGITATOR',
      primaryLaw: 'Law 4 (Fear) + Law 6 (Story)',
      instruction: 'Show them the full cost of their current situation. Another story. But this time, the character does NOT find the solution — they keep suffering. The reader should feel: "I don\'t want to be this person." End with a hint that there is a better way.',
    },
    4: {
      title: 'THE SOLUTION REVEAL',
      primaryLaw: 'Law 5 (Giant Promise) + Law 1 (Awoof)',
      instruction: 'Now introduce the product/service. Lead with the transformation (the outcome), not the product (the thing). Use the Awoof Stack: what this would cost elsewhere vs. what they get now. List benefits (not features). Include a guarantee or risk reversal.',
    },
    5: {
      title: 'THE URGENCY CLOSE',
      primaryLaw: 'Law 10 (Urgency) + Law 7 (Sales Letter)',
      instruction: 'This is the close email. All the elements of Law 7 in condensed form. Real deadline. Real consequence of missing it. Clear single action: WhatsApp me right now. The P.S. must reinforce the deadline and be the most read thing in the email.',
    },
    6: {
      title: 'THE OBJECTION SMASHER',
      primaryLaw: 'Law 3 (Trust) + Law 4 (Fear)',
      instruction: 'Address the top 3 objections directly. Lead with "I know what you\'re thinking..." Then destroy each objection with specific proof. End with a stronger CTA than email 5.',
    },
    7: {
      title: 'THE FINAL CALL',
      primaryLaw: 'Law 10 (Urgency) — Maximum Intensity',
      instruction: 'This is the last chance email. Short. Punchy. Real urgency — this is the actual final reminder. "After midnight tonight, [specific consequence]." Nothing else except the action step.',
    },
  }

  return `
SPECIALIST ACTIVATED: Cerebre Plus's Sales Letter Formula applied to a ${numEmails}-email sequence. Laws 2, 6, 7, 10 are PRIMARY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEQUENCE BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:          ${B(profile)} — ${I(profile)} in ${C(profile)}
Sequence Goal:     ${sequenceGoal[inputs.sequence_type] || inputs.sequence_type?.replace(/_/g, ' ')}
Number of Emails:  ${numEmails}
Product/Offer:     ${inputs.product_or_offer}
Subscriber Context: ${inputs.subscriber_context}
Desired Action:    ${inputs.cta_action}
${inputs.story_protagonist ? `Story Protagonist: ${inputs.story_protagonist}` : ''}
${inputs.deadline ? `Campaign Deadline: ${inputs.deadline}` : ''}
From Name:         ${inputs.from_name || B(profile)}
WhatsApp:          ${wa.display} (${wa.link})
Trust Signal:      ${PR(profile) || YR(profile)}
Language:          ${L(profile)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES FOR THIS SEQUENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Use "I" (not "we") throughout — Nigerian buyers want a person, not a company
2. Include the WhatsApp number (${wa.display}) in at least 3 of the ${numEmails} emails
3. Every subject line must pass the "Nigerian inbox test" — would a ${C(profile)} business owner open this at 7pm after work?
4. The P.S. of every email is mandatory — it is always read first, use it to reinforce the key point
5. Reference ${C(profile)} and ${I(profile)} specifically — never generic "Nigerian business"
6. The sequence must follow Cerebre Plus's Sales Letter Formula across its arc:
   Emails 1-2 = Story/Value (relationship), Emails 3 = Problem (fear), Email 4 = Solution (promise + awoof), Email ${numEmails} = Close (urgency)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT — COMPLETE ${numEmails}-EMAIL SEQUENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Array.from({ length: numEmails }, (_, i) => {
  const emailNum = i + 1
  const ep = emailPurposes[Math.min(emailNum, 7)] || emailPurposes[5]
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## EMAIL ${emailNum} OF ${numEmails} — ${ep.title}
*${ep.primaryLaw}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📅 SEND TIMING:** ${emailNum === 1 ? 'Immediately on signup' : emailNum === 2 ? `${emailNum === 2 ? 2 : emailNum} days after email 1` : `${emailNum} days after sign-up` }
**⏰ BEST SEND TIME:** [Specific time in WAT — when Nigerian ${I(profile)} buyers are most likely to open]

**SUBJECT LINE (A):**
[Subject line — passes Nigerian inbox test — specific, not vague]
**SUBJECT LINE (B) — A/B TEST:**
[Alternative variant — different hook style]
**PREVIEW TEXT:** [40-80 chars that extend the subject line — makes them open]

**EMAIL BODY:**

From: ${inputs.from_name || B(profile)}
[Opening — personal, immediate, uses "I" voice]

${ep.instruction}

[FULL EMAIL BODY — written in ${L(profile)}, personalised for ${B(profile)} in ${C(profile)}]
[Naturally includes: ${ep.primaryLaw.includes('Trust') ? `Trust signal: ${PR(profile) || YR(profile)}` : ep.primaryLaw.includes('Fear') ? 'Fear angle — cost of not acting' : ep.primaryLaw.includes('Promise') ? 'Giant promise with specific number' : 'Story with Nigerian protagonist'}]
${emailNum >= Math.ceil(numEmails / 2) ? `[WhatsApp CTA: "${inputs.cta_action}" — ${wa.display} (${wa.link})]` : '[Build value — no hard sell in this email]'}

**P.S.:**
[The P.S. that reinforces the single most important point of this email — written knowing it will be read before the body]

**AKIN'S CHECKLIST FOR THIS EMAIL:**
☐ "I" voice (not "we") ☐ ${C(profile)} mentioned ☐ Trust signal present ☐ No placeholders ☐ Immediately sendable ☐ P.S. written

---
`}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SEQUENCE PERFORMANCE GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Expected Open Rate Benchmarks:** [Nigerian ${I(profile)} business email benchmarks]
**Which Email to Fix If Sequence Isn't Converting:** [Diagnostic guide]
**Salary Week Timing:** [Should this sequence be timed to land during salary week? Advice specific to ${inputs.product_or_offer}]

💡 CEREBRE TIP: [The email marketing insight specific to Nigerian ${I(profile)} businesses — the subject line pattern, send time, or sequence structure that works in this market vs. what Western email courses teach]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 05 — VIDEOSCRIPTFORGE
// Laws: 5 (Giant Promise), 6 (Story), 8 (Serve the impatient viewer)
// ─────────────────────────────────────────────────────────────

export function getVideoScriptForgePrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)

  const platformFormats: Record<string, { duration: string; hookWindow: string; style: string }> = {
    instagram_reel: { duration: '15-60 seconds', hookWindow: '0-1 second', style: 'Fast-paced, visual, punchy — IG viewers decide in under a second' },
    tiktok: { duration: '15-60 seconds', hookWindow: '0-2 seconds', style: 'Ultra-casual, feels authentic, TikTok users detect ads instantly — don\'t look like an ad' },
    youtube_short: { duration: 'under 60 seconds', hookWindow: '0-3 seconds', style: 'YouTube Short — similar to TikTok but Google SEO matters more here' },
    youtube_long: { duration: `${inputs.video_length || '5-15'} minutes`, hookWindow: '0-30 seconds', style: 'Longer format — intro must set up a compelling reason to watch the whole video' },
    facebook_video: { duration: '1-3 minutes optimal', hookWindow: '0-3 seconds', style: 'Facebook autoplay is muted — text overlay critical in first 5 seconds' },
    whatsapp_status: { duration: '15-30 seconds', hookWindow: '0-2 seconds', style: 'Personal and authentic — friends sharing, not brands broadcasting' },
    paid_ad_video: { duration: '15-30 seconds for pre-roll, 60 sec for in-feed', hookWindow: '0-5 seconds', style: 'Must earn the right to be watched — interrupt pattern clearly and early' },
    testimonial: { duration: '60-120 seconds', hookWindow: '0-5 seconds', style: 'Authentic customer voice — avoid looking scripted or rehearsed' },
    explainer: { duration: '90-180 seconds', hookWindow: '0-10 seconds', style: 'Problem-solution arc — make the problem vivid before the solution' },
    pitch_video: { duration: '60-120 seconds', hookWindow: '0-5 seconds', style: 'Investor/partner pitch — credibility-first, data-driven, professional' },
  }

  const format = platformFormats[inputs.video_platform] || platformFormats.instagram_reel
  const includeSceneDir = inputs.scene_direction !== false
  const includeBRoll    = inputs.include_b_roll_notes !== false

  return `
SPECIALIST ACTIVATED: Nigerian video content director and conversion scriptwriter. Laws 5, 6, 8 are PRIMARY. 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCRIPT BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:         ${B(profile)} — ${I(profile)} in ${C(profile)}
Platform:         ${inputs.video_platform?.replace(/_/g, ' ')}
Duration Target:  ${inputs.video_length || format.duration}
Goal:             ${inputs.video_goal?.replace(/_/g, ' ')}
Topic:            ${inputs.video_topic}
Presenter Style:  ${inputs.presenter_style?.replace(/_/g, ' ') || 'talking head'}
Hook Idea:        ${inputs.key_hook || 'Generate the strongest possible hook for this topic and audience'}
WhatsApp:         ${wa.display} (${wa.link})
Trust Signal:     ${PR(profile) || YR(profile)}
Language:         ${L(profile)}
Brand Voice:      ${V(profile)}

Platform Format:  ${format.style}
Hook Window:      ${format.hookWindow} — THIS IS EVERYTHING. If you don't hook them here, they scroll.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE NIGERIAN VIDEO ATTENTION RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nigerian video viewers, especially on Instagram and TikTok, make the scroll-or-stay decision in under 2 seconds. The hook is not the beginning of the script — it IS the script. Everything after the hook is the reward for those who stayed.

The 3 hooks that always work for Nigerian audiences:
1. THE SHOCKING STATEMENT: "[Surprising fact about ${I(profile)} in Nigeria] that nobody is talking about"
2. THE DIRECT CHALLENGE: "If you're a ${C(profile)} business owner and you're not doing [X], stop what you're doing"
3. THE PROMISE: "I'm going to show you exactly how to [giant specific outcome] in [short timeframe]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE VIDEO SCRIPT — ${B(profile)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**THUMBNAIL CONCEPT:**
[Bold text overlay + visual direction — what makes someone click before watching]
Text on thumbnail: [5 words max, high contrast, readable on phone]

---

**HOOK (${format.hookWindow} — THE MAKE OR BREAK MOMENT)**
Spoken: "[The single line that stops the scroll — tested against the 3 Nigerian hook types above]"
${includeSceneDir ? `Screen Direction: [Camera angle, text overlay, visual treatment]` : ''}
${includeBRoll ? `B-Roll/Visual: [What appears on screen in the first ${format.hookWindow}]` : ''}
Text Overlay: "[Same spoken text as text overlay — Facebook autoplay is muted, must work silent]"

**Why This Hook Works:** [One sentence explaining why this specific hook will stop a ${C(profile)} ${I(profile)} business owner from scrolling]

---

**OPENING (Seconds 3–${inputs.video_length === '60sec' ? '15' : inputs.video_length === '30sec' ? '10' : '20'})**
Spoken: [Establish the problem or premise — make them commit to watching. Law 6 Story opens here.]
${includeSceneDir ? `Scene: [Direction]` : ''}
${includeBRoll ? `B-Roll: [Supporting visuals]` : ''}
Lower Third (if applicable): "${B(profile)} | ${C(profile)}"

---

**CORE CONTENT (Middle section — delivers on the hook's promise)**
[Structured content delivery — ${inputs.presenter_style === 'screen_recording' ? 'walkthrough format with clear callouts' : 'talking head with supporting visuals'} — written as spoken word in ${L(profile)}]

${inputs.video_goal === 'generate_leads' || inputs.video_goal === 'drive_sales' ? `
**CREDIBILITY MOMENT (Natural, not boastful):**
Spoken: "[One-sentence trust drop: ${PR(profile) || YR(profile) || `${B(profile)}'s experience`}]"
[Delivered casually — not as a hard credential claim]
` : ''}

---

**CLOSE AND CTA (Last ${inputs.video_length === '60sec' ? '10-15' : '10'} seconds)**
Spoken: "[Callback to hook + Giant Promise + Single Action]"

"If you want [specific result from the hook's promise], send me a WhatsApp message right now — my number is ${wa.display}"
"[Repeat the number — people cannot write fast enough, give it twice]"
"${wa.display} — that's ${wa.display}"

${includeSceneDir ? `Screen: [Show phone number on screen in large text + WhatsApp icon]` : ''}
${includeBRoll ? `B-Roll: [CTA screen / phone with WhatsApp open]` : ''}

---

**CAPTION FOR UPLOAD:**
[Complete, SEO-optimised caption for the upload — includes ${B(profile)}, ${C(profile)}, and keyword for ${inputs.video_topic}]
[Ends with: WhatsApp: ${wa.display}]

**HASHTAGS:**
[10-20 hashtags: broad Nigerian reach + ${I(profile)}-specific + ${C(profile)}-location + topic-specific]

${inputs.include_thumbnail_suggestion !== false ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## THUMBNAIL DESIGN BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Concept: [Visual concept that drives highest CTR for Nigerian ${I(profile)} audiences]
Text Overlay: "[Max 5 words — bold, high contrast, readable at phone size]"
Color: Use ${profile.brand_colour || '#E09818'} as accent
Image Type: [Face / Product / Outcome graphic / Typography — which performs best for this topic]
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## REPURPOSING GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[How to adapt this script for 3 other platforms/formats with minimal re-shooting]

💡 CEREBRE TIP: [The Nigerian video content insight that makes ${I(profile)} business videos get 10x more reach in ${C(profile)} — the format, timing, or content type that the algorithm and Nigerian audiences reward right now]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 06 — BLOGBRAIN
// Laws: 3 (Trust — specificity), 5 (Giant Promise), 9 (Community validation)
// ─────────────────────────────────────────────────────────────

export function getBlogBrainPrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)
  const wordCount = parseInt(inputs.article_length || '1200', 10)

  return `
SPECIALIST ACTIVATED: Nigerian SEO content strategist and long-form authority writer. Laws 3, 5, 9 are PRIMARY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTICLE BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:          ${B(profile)} — ${I(profile)} in ${C(profile)}
Topic:             ${inputs.article_topic}
Goal:              ${inputs.article_goal?.replace(/_/g, ' ')}
Target Keyword:    ${inputs.target_keyword || inputs.article_topic}
Word Count:        ~${wordCount} words
Audience:          ${inputs.audience_profile || T(profile)}
Tone:              ${inputs.tone_style?.replace(/_/g, ' ') || 'conversational expert'}
Include Stats:     ${inputs.include_stats !== false ? 'Yes — use real Nigerian market statistics' : 'No'}
CTA Offer:         ${inputs.cta_offer || `Free consultation via WhatsApp: ${wa.display}`}
Language:          ${L(profile)}
Trust Signal:      ${PR(profile) || YR(profile)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGERIAN SEO INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Include ${C(profile)} prominently — local SEO helps Nigerian businesses rank for "[service] + ${C(profile)}" searches
- Nigerian readers scan before they read — use clear H2s, short paragraphs, and bold key phrases
- Nigerian Google users increasingly use voice search on Android — write some sections in natural spoken language
- The #1 trust signal in Nigerian blog content: specific numbers and named locations. "Businesses in Lagos" < "2,400 businesses in Lekki and Victoria Island"
- Every blog post from a Nigerian business should end with a WhatsApp CTA — this is how clients actually reach out

BANNED PHRASES (never use these — they scream "Western AI template"):
- "In today's competitive landscape"
- "It's crucial to remember that"
- "At the end of the day"
- "Leverage your synergies"
- "Going forward, it's important to"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE ARTICLE — ~${wordCount} WORDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**META TITLE (max 60 chars — for Google ranking):**
[Includes target keyword "${inputs.target_keyword || inputs.article_topic}" naturally + location "${C(profile)}" if local SEO]

**META DESCRIPTION (max 155 chars — drives the click from Google):**
[Compelling preview that includes the keyword and a clear reason to click]

---

# [H1 HEADLINE — contains the target keyword, creates strong desire to read, max 70 chars]
### [H2 Subheadline — hooks the reader into the opening paragraph]

[OPENING PARAGRAPH — 80-120 words]
This must NOT start with "In today's world..." or any generic opener.
Begin with: a striking Nigerian-market specific fact OR a relatable story OR a bold claim that challenges conventional wisdom.
Reference ${C(profile)} and ${I(profile)} in the first 100 words.
Set up the promise of what they'll know after reading.

---

## [H2: SECTION 1 — The Core Problem or Context]
[200-250 words — establish the problem deeply. Use ${C(profile)} examples. Make them feel understood.]
${inputs.include_stats !== false ? '[Include 1-2 real statistics about the Nigerian market relevant to this topic]' : ''}

---

## [H2: SECTION 2 — The Framework or Solution (Main Value)]
[300-400 words — the insight they came for. Break into numbered points or a framework.]

[For each key point:]
### [H3: Point title]
[60-80 words — explanation + Nigerian ${I(profile)} example]
${inputs.include_examples !== false ? '[Real or illustrative example from the Nigerian market — name a city, name a business type]' : ''}

---

## [H2: SECTION 3 — Proof and Social Validation]
[200 words — Law 9 (Community Validation) + Law 3 (Trust)]
[Reference Nigerian businesses, cities, specific numbers]
[${PR(profile) ? `Naturally include ${B(profile)}'s social proof: ${PR(profile)}` : `Include how ${B(profile)} approaches this topic with ${YR(profile) || 'relevant expertise'}`}]

---

## [H2: SECTION 4 — Practical Action Steps]
[200-250 words — tell them EXACTLY what to do next. Numbered steps. Immediately actionable. No "consider" or "you might want to" — direct instructions.]

---

## [H2: SECTION 5 — The Consequence of Not Acting (Law 4 integrated naturally)]
[150 words — what happens if they read this and do nothing. Make the cost of inaction real without being preachy.]

---

## Conclusion — The WhatsApp Close
[100-150 words — callback to the opening promise → summarise 3 key takeaways → low-commitment CTA first → WhatsApp CTA]

"If you want to discuss how [topic] applies specifically to your ${I(profile)} business in ${C(profile)}, send me a message on WhatsApp — I respond within a few hours."

WhatsApp: ${wa.display}
[Link: ${wa.link}]

---

**INTERNAL LINKS (topics ${B(profile)} should also write about):**
1. [Related topic 1 — explains why this connects to the main article]
2. [Related topic 2]
3. [Related topic 3]

**SCHEMA MARKUP SUGGESTION:** [FAQ, HowTo, or Article schema — which is most appropriate for this article]

💡 CEREBRE TIP: [The Nigerian SEO insight for ${I(profile)} businesses — the keyword pattern or content format that drives the most qualified traffic from Google Nigeria that most businesses don't know to target]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 07 — BIOBUILDER
// Laws: 3 (Trust), 5 (Giant Promise), 9 (Community validation)
// ─────────────────────────────────────────────────────────────

export function getBioBuilderPrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)

  const bioTypes: Record<string, string> = {
    instagram_bio:      'Instagram Bio (150 chars max — every character counts)',
    linkedin_summary:   'LinkedIn About section (2,600 chars max — this is your professional case)',
    website_about_page: 'Website About page (500-800 words — the page that converts browsers to buyers)',
    speaker_intro:      'Speaker/event introduction (60-90 seconds when read aloud)',
    press_media_kit_bio: 'Press/media kit bio (200 words — third person, facts-forward)',
    twitter_x_bio:      'X (Twitter) bio (160 chars)',
    business_brand_bio: 'Business brand bio (200-300 words — first person, relationship-building)',
    full_set_all:       'Complete bio set (all formats)',
  }

  const generateTypes = inputs.bio_type === 'full_set_all'
    ? ['instagram_bio', 'linkedin_summary', 'website_about_page', 'twitter_x_bio', 'business_brand_bio', 'press_media_kit_bio']
    : [inputs.bio_type]

  return `
SPECIALIST ACTIVATED: Nigerian brand positioning and authority copywriter. Laws 3, 5, 9 are PRIMARY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BIO BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:              ${B(profile)} — ${I(profile)} in ${C(profile)}
Bio Type(s):           ${generateTypes.map(t => bioTypes[t] || t).join(', ')}
About:                 ${inputs.who_you_are || DESC(profile)}
Credentials:           ${inputs.credentials || [PR(profile), YR(profile)].filter(Boolean).join(' | ')}
Target Reader:         ${inputs.target_who_reads || T(profile)}
Tone:                  ${inputs.tone_modifier?.replace(/_/g, ' ') || V(profile)}
Key Transformation:    ${inputs.key_transformation || A(profile)}
WhatsApp:              ${wa.display}
Language:              ${L(profile)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGERIAN BIO INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Nigerian bio must answer these 4 questions IMMEDIATELY:
1. Who is this for? (Lead with the customer, not the credentials)
2. What specific result do they get? (Law 5 — Giant Promise)
3. Why should I trust them? (Law 3 — Trust + Law 9 — Community)
4. What do I do next? (Law 8 — Simple action, WhatsApp number)

The FOBE-busting bio principle: Nigerian readers are scanning for scam signals. The bio must feel specific and verifiable. Never write "experienced professional" — write "${YR(profile) || 'X years in business'}." Never write "hundreds of clients" — write "${PR(profile) || 'specific client number'} clients."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${generateTypes.map((bioType: string) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ${bioTypes[bioType]?.toUpperCase() || bioType.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${bioType === 'instagram_bio' ? `
[Line 1 (50 chars): What you do + who it's for — customer-first, not credential-first]
[Line 2 (50 chars): Trust signal — ${PR(profile) || YR(profile)} — specific number or year]
[Line 3 (50 chars): Location anchor — ${C(profile)} — for local discovery]
[Line 4 (50 chars): CTA — wa.me/234${wa.link.replace('wa.me/234', '')} OR "DM for [specific thing]"]
[Emoji: 1-2 strategic emojis only — placed to draw the eye to the key line]
Character count: [X/150]
` : bioType === 'twitter_x_bio' ? `
[160 chars: Who + what + where (${C(profile)}) + trust + CTA — packed tight]
Character count: [X/160]
` : bioType === 'press_media_kit_bio' ? `
[Third-person, 200 words, facts-forward]
[Opening: ${B(profile)} is a [specific role] based in ${C(profile)} who [specific outcome they create for specific person]]
[Body: credentials, numbers, specific achievements — all Law 3 Trust signals]
[Closing: contact information — ${wa.display}]
` : bioType === 'speaker_intro' ? `
[Read aloud in 60-90 seconds — write for the ear, not the eye]
[Opening: "Please welcome someone who [what they do for the audience in the room]..."]
[Credentials: specific, punchy, not a list — woven into narrative]
[Close: build anticipation, then name: "...please welcome, [Name from ${B(profile)}]"]
` : `
[Full bio — ${L(profile)} — ${inputs.tone_modifier?.replace(/_/g, ' ') || V(profile)} tone]
[Opening: Lead with the customer transformation, not the credential]
[Body paragraphs:
  P1: The problem they solve for ${T(profile)} in ${C(profile)}
  P2: How they solve it — the approach, the methodology, ${A(profile)}
  P3: The proof — ${PR(profile) || YR(profile)} — specific, verifiable
  P4: The human story — why this matters to them personally
]
[Close: CTA — ${inputs.include_cta !== false ? `WhatsApp: ${wa.display}` : 'Natural brand close'}]
`}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## KEY AUTHORITY PHRASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[5 powerful phrases specific to ${I(profile)} in ${C(profile)} that ${B(profile)} should use consistently across all platforms to build recognisable authority]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## THINGS TO NEVER SAY IN A NIGERIAN BUSINESS BIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[5 phrases that trigger FOBE and kill trust in Nigerian bios — and what to replace them with]

💡 CEREBRE TIP: [The bio element that Nigerian ${I(profile)} business owners consistently underestimate — and the specific word or phrase type that builds instant authority with ${C(profile)} buyers]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 08 — PRODUCTDESCRIBER
// Laws: 1 (Awoof), 3 (Trust), 5 (Giant Promise), 8 (Lazy buyer)
// ─────────────────────────────────────────────────────────────

export function getProductDescriberPrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)

  const platformGuides: Record<string, string> = {
    website_online_store:  'SEO-optimised, benefit-led, 200-400 words, structured with headers',
    jumia_konga:          'Jumia/Konga format: bullet points, specifications, delivery/returns focus, trust signals prominent',
    instagram_shop:       'Short, punchy, visual-assumed, emojis OK, price clear, CTA to DM/WhatsApp',
    whatsapp_catalogue:   'Ultra-concise, benefit-first, price obvious, single tap to enquire',
    flyer_brochure:       'Print-ready copy, no hyperlinks, phone number prominent, design-friendly formatting',
    email_newsletter:     'Story-led, warm tone, price anchored, CTA to WhatsApp or website',
    facebook_marketplace: 'Facebook Marketplace format: condition, price, location, contact method, trust signals',
    all_platforms:        'Generate versions for all major platforms',
  }

  const lengthWords: Record<string, string> = {
    short:  '50-100',
    medium: '100-200',
    long:   '200-400',
  }

  return `
SPECIALIST ACTIVATED: Nigerian e-commerce conversion copywriter. Laws 1, 3, 5, 8 are PRIMARY. The Nigerian buyer who reads this will be on WhatsApp, on mobile, and will decide in under 30 seconds.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:           ${B(profile)} — ${I(profile)} in ${C(profile)}
Product:            ${inputs.product_name}
Details:            ${inputs.product_details}
Price:              ${inputs.price || PRICE(profile) || 'Not provided — generate without specific price'}
Platform:           ${inputs.platform_for_description?.replace(/_/g, ' ')}
Description Length: ${lengthWords[inputs.description_length] || '100-200'} words
Target Buyer:       ${inputs.target_customer || T(profile)}
Trust Signal:       ${PR(profile) || YR(profile)}
WhatsApp:           ${wa.display}
Language:           ${L(profile)}
${inputs.competitor_product ? `Competitor Context: ${inputs.competitor_product}` : ''}
${inputs.main_objection ? `Main Objection to Address: ${inputs.main_objection}` : ''}
Platform Format:    ${platformGuides[inputs.platform_for_description] || 'Standard product description'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGERIAN PRODUCT COPY INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Nigerian buyers ask three questions in 10 seconds: "What is it? How does it change my life? Is it legit?"
- Lead with transformation (what it DOES for them), not features (what it IS)
- Price must appear AFTER value is established — never list price before benefit
- FOBE is strongest in product buying — include at least one verifiable trust signal
- WhatsApp enquiry option must always be present — Nigerian buyers prefer to talk before buying
- For physical products: condition/quality + delivery details are critical trust signals
- Awoof Stack converts: show what this is worth vs. what they pay

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE PRODUCT DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PLATFORM: ${inputs.platform_for_description?.replace(/_/g, ' ').toUpperCase()}

**HEADLINE / PRODUCT TITLE (for listing header):**
[Transformation-first title — what it DOES for the buyer + product name]
[SEO note: includes key search term for this product category]

**HOOK LINE (First sentence — sets the desire before anything else):**
[The line that makes them keep reading — benefit-focused, immediately compelling]

**SHORT DESCRIPTION (${lengthWords[inputs.description_length || 'medium']} words):**
[Complete product description following Law 8 — immediately scannable, zero friction]

Opening: [What this product does for the buyer — the transformation]
Body: [Key benefits — framed as outcomes, not specifications]
Trust Signal: [${PR(profile) || YR(profile) || `${B(profile)}, ${C(profile)}`}]
${inputs.include_awoof_stack !== false ? `Awoof Stack: [What buying this separately/elsewhere would cost vs. what ${B(profile)} charges — ${inputs.price || PRICE(profile) || 'at their price'}]` : ''}
CTA: [Single action — "${inputs.platform_for_description === 'whatsapp_catalogue' ? 'Send a message to order' : 'WhatsApp us to order/enquire: ' + wa.display}"]

${inputs.include_bullet_features !== false ? `
**FEATURE BULLETS (Platform listing format):**
• [Benefit 1 — written as outcome, not specification]
• [Benefit 2]
• [Benefit 3]
• [Benefit 4]
• [Trust signal bullet — ${PR(profile) || `${B(profile)} quality guarantee`}]
• [WhatsApp/Contact bullet — ${wa.display}]
` : ''}

${inputs.platform_for_description === 'jumia_konga' ? `
**JUMIA/KONGA SPECIFIC FIELDS:**
Condition: [New / Fairly Used / Refurbished]
Delivery: [Delivery timeframe and areas covered]
Returns Policy: [Terms]
Seller Rating Notes: [How to build positive early reviews]
` : ''}

**OBJECTION HANDLER (built into copy):**
[Address "${inputs.main_objection || 'the most common buyer hesitation for this product type'}" naturally within the description — not as a separate FAQ, woven into the body]

${inputs.include_seo_keywords !== false ? `
**SEO KEYWORDS FOR THIS PRODUCT (Nigerian market search terms):**
[8 keywords: product-specific + location-specific + intent-specific — include Nigerian English variants]
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## WHATSAPP CATALOGUE VERSION (ultra-concise)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Under 100 words — price visible, CTA clear, trust signal in one line]

💡 CEREBRE TIP: [The Nigerian product listing element — for ${inputs.platform_for_description?.replace(/_/g, ' ')} specifically — that drives the highest conversion rate. Something most ${I(profile)} sellers get wrong that costs them sales every day]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 09 — PRESSRELEASE AI
// Laws: 3 (Trust), 5 (Giant Promise), 9 (Community validation)
// ─────────────────────────────────────────────────────────────

export function getPressReleasePrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)

  const announcementTypes: Record<string, string> = {
    product_service_launch:    'Product/Service Launch',
    new_business_branch_opening: 'New Business/Branch Opening',
    partnership_collaboration: 'Partnership/Collaboration',
    award_recognition:         'Award/Recognition',
    business_expansion_milestone: 'Business Expansion/Milestone',
    event_announcement:        'Event Announcement',
    csr_community_initiative:  'CSR/Community Initiative',
    funding_investment:        'Funding/Investment',
    new_hire_executive:        'New Executive Hire',
    rebrand_relaunch:          'Rebrand/Relaunch',
  }

  const mediaTargets: Record<string, string[]> = {
    general_nigerian_media: ['Punch Newspapers', 'Guardian Nigeria', 'Vanguard', 'This Day'],
    business_media:         ['BusinessDay', 'Nairametrics', 'TechCabal', 'Financial Times (Nigeria)'],
    tech_media:             ['TechCabal', 'Techpoint Africa', 'Disrupt Africa', 'YNaija Tech'],
    lifestyle_media:        ['BellaNaija', 'Pulse Nigeria', 'Zikoko', 'Guardian Life'],
    social_media_blogs:     ['Major Instagram/Twitter influencers in your industry', 'Nigerian YouTube channels'],
  }

  return `
SPECIALIST ACTIVATED: Nigerian PR and media relations expert. Law 3 (Credibility) is PRIMARY. This press release must pass the "Nigerian editor test" — would a busy Punch or BusinessDay editor find this newsworthy enough to run?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRESS RELEASE BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:           ${B(profile)} — ${I(profile)} in ${C(profile)}
Announcement Type:  ${announcementTypes[inputs.announcement_type] || inputs.announcement_type?.replace(/_/g, ' ')}
Details:            ${inputs.announcement_details}
Spokesperson:       ${inputs.spokesperson_name || `Founder/CEO, ${B(profile)}`}
Target Media:       ${inputs.target_media?.replace(/_/g, ' ')}
Release:            ${inputs.release_date || 'For Immediate Release'}
${inputs.embargo_date ? `Embargo Until: ${inputs.embargo_date}` : ''}
WhatsApp:           ${wa.display}
Trust Signal:       ${PR(profile) || YR(profile)}
Language:           Standard Nigerian English (formal press register)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGERIAN PR INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nigerian journalists receive 50-100 press releases per week. Yours will be skimmed in under 10 seconds. Rules:
1. The HEADLINE must contain the news peg in the first 5 words — editors read headlines, not bodies
2. The LEAD PARAGRAPH must answer Who, What, When, Where, Why in under 60 words
3. ONE strong quote from the executive — make it quotable, not corporate boilerplate
4. SPECIFIC NUMBERS: Nigerian journalism trusts specificity — "increased by 40%" beats "significantly increased"
5. Nigerian press releases should include a local angle — how does this affect ${C(profile)} consumers specifically?
6. Always include a "Notes to Editors" section — Nigerian editors appreciate this professionalism
7. WhatsApp is the preferred media contact method in Nigeria — include it prominently

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE PRESS RELEASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**${inputs.release_date || 'FOR IMMEDIATE RELEASE'}**
${inputs.embargo_date ? `**EMBARGOED UNTIL: ${inputs.embargo_date}**` : ''}

---

# [HEADLINE — Active voice. News peg in first 5 words. Contains ${B(profile)} name. Compelling to a Nigerian editor. Max 80 chars.]

## [SUBHEADLINE — Expands the headline with the most interesting detail — supporting fact or key benefit. Max 120 chars.]

**${C(profile)}, ${inputs.release_date || '[Date]'} —** [LEAD PARAGRAPH: 50-60 words. Who (${B(profile)}), What (${inputs.announcement_type?.replace(/_/g, ' ')}), When, Where (${C(profile)}), Why it matters. Write this as the most important paragraph — if the editor runs only this, the reader gets the full story.]

[SECOND PARAGRAPH: Context and significance — why does this matter to the Nigerian market? What problem does it solve? What change does it represent?]

[THIRD PARAGRAPH: The story behind the announcement — the journey, the motivation, the vision. This is where ${B(profile)}'s narrative comes through.]

**EXECUTIVE QUOTE:**
"[Quotable statement from ${inputs.spokesperson_name || `the leadership of ${B(profile)}`} — must be genuinely quotable. Not: 'We are pleased to announce.' Instead: a specific, bold, human statement about what this means for Nigerian customers/the industry. Should contain a fact or a vision that a journalist would want to cite.]"
— ${inputs.spokesperson_name || `Founder/CEO, ${B(profile)}`}

${inputs.spokesperson_quote ? `[SECOND QUOTE — optional, different angle]
"${inputs.spokesperson_quote}"` : ''}

[FOURTH PARAGRAPH: Supporting details — how this affects customers/market/community. Include specific numbers where available. Trust signals: ${PR(profile) || YR(profile)}.]

[FIFTH PARAGRAPH: Forward-looking statement — what this means for ${B(profile)}'s next phase. Connects to a larger trend in the Nigerian ${I(profile)} market.]

---

${inputs.include_boilerplate !== false ? `
**ABOUT ${B(profile).toUpperCase()}**
${DESC(profile) || `${B(profile)} is a ${I(profile)} company based in ${C(profile)}`}. ${YR(profile) ? `The company has been operating for ${YR(profile)}. ` : ''}${PR(profile) ? `${PR(profile)}. ` : ''}[One forward-looking sentence about the company's mission or vision.]

` : ''}

**MEDIA CONTACT:**
${B(profile)} Communications
WhatsApp: ${wa.display}
${profile.email_contact ? `Email: ${profile.email_contact}` : ''}
${profile.address ? `Address: ${profile.address}` : `Location: ${C(profile)}, Nigeria`}

**NOTES TO EDITORS:**
- High-resolution images and executive photographs available on request
- ${inputs.spokesperson_name || 'A company spokesperson'} is available for interviews and further comment
- [Additional technical detail or background that editors may want but is too detailed for the main body]

###

---

${inputs.include_social_hook !== false ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SOCIAL MEDIA VERSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**TWITTER/X ANNOUNCEMENT (280 chars):**
[Condensed news announcement — includes ${B(profile)}, news peg, ${C(profile)}, WhatsApp if space allows]

**INSTAGRAM CAPTION VERSION:**
[Full caption adapted from press release — follows Nigerian Instagram caption best practices]

**LINKEDIN POST VERSION:**
[Professional tone — addresses ${B(profile)}'s industry network specifically]
` : ''}

${inputs.include_media_list !== false ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TARGET MEDIA LIST — ${(inputs.target_media || 'general_nigerian_media').replace(/_/g, ' ').toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${(mediaTargets[inputs.target_media] || mediaTargets.general_nigerian_media).map((outlet, i) => `${i + 1}. ${outlet} — [Specific desk/editor to target and why this announcement fits their beat]`).join('\n')}

**PITCH EMAIL SUBJECT LINE:**
[Subject line for pitching this press release to Nigerian journalists — not "Press Release:" — something a journalist would actually open]
` : ''}

💡 CEREBRE TIP: [The Nigerian media relations insight that most business owners miss — the press release element, timing, or distribution method that dramatically increases the chance of getting covered by Nigerian media]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 10 — CONTENT CALENDAR
// Laws: 2 (List building), 8 (Serve the lazy planner), 10 (Urgency timing)
// ─────────────────────────────────────────────────────────────

export function getContentCalendarPrompt(
  inputs: Record<string, any>,
  profile: ProfileContext,
): string {
  const wa = W(profile)
  const platforms: string[] = Array.isArray(inputs.platforms)
    ? inputs.platforms
    : [inputs.platforms || 'instagram']
  const duration = parseInt(inputs.calendar_duration || '30', 10)
  const postsPerWeek = parseInt(inputs.posts_per_week || '5', 10)
  const totalPosts = Math.ceil(duration / 7) * postsPerWeek
  const goals: string[] = Array.isArray(inputs.content_goals)
    ? inputs.content_goals
    : [inputs.content_goals || 'awareness']

  return `
SPECIALIST ACTIVATED: Nigerian content strategy expert and editorial calendar architect. Laws 2, 8, 10 are PRIMARY — with salary cycle intelligence at maximum.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALENDAR BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business:           ${B(profile)} — ${I(profile)} in ${C(profile)}
Duration:           ${duration} days (~${totalPosts} total posts)
Platforms:          ${platforms.join(', ')}
Posts Per Week:     ${postsPerWeek}
Goals:              ${goals.join(', ')}
${inputs.upcoming_promotions ? `Upcoming Promotions: ${inputs.upcoming_promotions}` : ''}
${inputs.upcoming_events ? `Events: ${inputs.upcoming_events}` : ''}
${inputs.products_to_feature ? `Products to Feature: ${inputs.products_to_feature}` : ''}
Salary Cycle Aware: ${inputs.salary_cycle_awareness !== false ? 'YES — concentrate promotional content in last 7 days of month' : 'No'}
Month/Period:       ${inputs.month_and_year || 'Current month'}
${inputs.special_dates ? `Special Dates: ${inputs.special_dates}` : ''}
WhatsApp:           ${wa.display}
Language:           ${L(profile)}
Brand Voice:        ${V(profile)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGERIAN CONTENT CALENDAR INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SALARY CYCLE STRATEGY (MANDATORY):
- Days 1–10 of month: Educational and value content — Nigerians are budget-conscious post-salary spending
- Days 11–20: Engagement and relationship building — testimonials, behind-the-scenes, community
- Days 21–31 (SALARY WEEK): Maximum promotional intensity — this is when Nigerian buyers have cash and intent
- The last 7 days of every month = 2.5x more promotional content = 2.5x higher conversion

${C(profile)} POSTING TIMES:
- Instagram: 7:30am (commute), 12:30pm (lunch), 8pm–10pm (evening wind-down)
- Facebook: 8am, 1pm, 7pm (Nigerian Facebook users are older, peak in evening)
- TikTok: 9pm–11pm (Nigerian TikTok peak is late evening)
- WhatsApp Broadcast: 10am or 6pm (never send before 9am)

CONTENT MIX FOR NIGERIAN AUDIENCES (${I(profile)}):
- 40% Education/Value (builds trust, attracts following)
- 25% Social Proof/Testimonials (eliminates FOBE)
- 20% Behind the Scenes (builds relationship — Nigerians buy from people they feel they know)
- 15% Promotional (direct offers — salary week concentration)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${duration}-DAY CONTENT CALENDAR — ${B(profile).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## STRATEGIC OVERVIEW
**Content Theme for This Period:** [Overarching narrative that ties all ${duration} days together]
**Primary Goal:** [Most important goal from inputs, with specific measurable target]
**Content Mix:** ${I(profile)}-specific breakdown: X% Education | X% Social Proof | X% BTS | X% Promo
**Salary Week Dates:** Days [X–${duration}] = maximum promotional push

---

## WEEK 1 — AWARENESS & VALUE (Days 1–7)
**Week Theme:** [Establish authority, educate, attract new followers — no hard selling]
**Goal:** [Specific measurable target for Week 1]

${Array.from({ length: postsPerWeek }, (_, i) => `
📅 **DAY ${i + 1} ${i === 0 ? '(WEEK OPENER — highest effort post)' : i === postsPerWeek - 1 ? '(ENGAGEMENT CLOSER)' : ''}**
**Platform:** ${platforms[i % platforms.length].charAt(0).toUpperCase() + platforms[i % platforms.length].slice(1)}
**Content Type:** ${['Educational tip', 'Behind the scenes', 'Value post', 'Testimonial/proof', 'Engagement question', 'Product showcase', 'Story/narrative'][i % 7]}
**Topic:** [Specific topic tied to ${B(profile)}'s expertise in ${I(profile)} — must provide genuine value]
**Hook (first line):** "[Opening line that passes the Lagos Bus Test — stops the scroll]"
**Format:** [Reel / Carousel (X slides) / Static post / Story sequence / Video]
**Caption Direction:** [3-4 sentence guide — what to write, what tone, what CTA]
**CTA:** [Specific action — tied to ${goals[0]} goal]
**Best Post Time:** [Specific WAT time for ${platforms[i % platforms.length]} + ${C(profile)} audience]
**Hashtags:** [3-5 most important hashtags — full set available in Hashtag Bank below]
`).join('\n')}

---

## WEEK 2 — RELATIONSHIP BUILDING (Days 8–14)
**Week Theme:** [Social proof, testimonials, community — deepen trust before the promotional push]
[Same structure as Week 1 — ${postsPerWeek} posts with full detail]

---

## WEEK 3 — TRANSITION TO OFFER (Days 15–21)
**Week Theme:** [Begin introducing the offer softly — build desire before the salary week push]
[Same structure — posts increasingly mention the product/service, but value-first]

---

${duration >= 28 ? `
## SALARY WEEK — THE MONEY DAYS (Days ${duration - 9}–${duration})
**⚡ MAXIMUM PROMOTIONAL INTENSITY — THIS IS WHERE THE REVENUE IS MADE ⚡**
**Strategy:** ${inputs.salary_cycle_awareness !== false ? 'Post 1.5x more often this week. Lead every post with an offer. Use WhatsApp broadcast on Day ' + (duration - 7) + ', ' + (duration - 4) + ', and ' + (duration - 1) + '.' : 'Standard posting schedule'}
**The Offer Stack:** [The best offer ${B(profile)} can make this week — with Awoof Stack + real urgency deadline]

${Array.from({ length: Math.min(7, postsPerWeek + 2) }, (_, i) => `
📅 **SALARY WEEK DAY ${i + 1}** ${i === 6 ? '(FINAL PUSH — last chance messaging)' : i === 0 ? '(OFFER REVEAL)' : ''}
**Platform:** ${platforms[i % platforms.length].charAt(0).toUpperCase() + platforms[i % platforms.length].slice(1)}${i % 2 === 0 && platforms.includes('whatsapp') ? ' + WhatsApp Broadcast' : ''}
**Content Type:** PROMOTIONAL — ${i === 0 ? 'Offer Announcement' : i === 6 ? 'Final Urgency Close' : i % 2 === 0 ? 'Social Proof + Offer' : 'Awoof Stack Post'}
**Hook:** "[Salary week-specific opening — e.g. 'Your salary just arrived and we have something for you']"
**Urgency Element:** [Real deadline — "Offer closes [specific day at specific time]"]
**CTA:** [WhatsApp direct: ${wa.display}]
`).join('\n')}
` : ''}

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HASHTAG BANK — ${B(profile).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Broad Nigerian Reach (use on all posts):**
[10 broad Nigerian market hashtags]

**${I(profile)}-Specific (use on relevant posts):**
[10 industry-specific hashtags for ${I(profile)} on each platform]

**${C(profile)}-Location (use on local posts):**
[8 location-based hashtags for ${C(profile)} and surrounding areas]

**${B(profile)}-Brand (always include on your posts):**
[3-4 unique brand hashtags to build community]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CONTENT REPURPOSING GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[How to turn each Week 1 post into 3 additional pieces of content — maximum leverage from minimum effort]
[Specifically designed for ${B(profile)} to create a whole month of content from 1 day of work]

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## WHATSAPP BROADCAST SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${platforms.includes('whatsapp') ? `[Complete WhatsApp broadcast calendar — when to send, what to send, the exact hook for each broadcast — aligned with salary week]
Optimal Broadcast Times: 10am and 6pm WAT only
Never broadcast before 9am or after 9pm
Frequency: [Recommended frequency for ${I(profile)} without over-messaging]
Broadcast Hook Suggestions: [5 pre-written opening lines for ${B(profile)}'s WhatsApp broadcasts this month]` : '[Add WhatsApp to your platforms to unlock the complete WhatsApp broadcast schedule — this is where Nigerian deals are closed]'}

---

💡 CEREBRE TIP: [The Nigerian content calendar insight that transforms results for ${I(profile)} businesses — the posting pattern, timing, or content type rotation that most ${C(profile)} businesses don't know about but that consistently outperforms everything else for building engaged followers who actually become paying customers]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// MASTER DISPATCHER — Tools 1-10
// ─────────────────────────────────────────────────────────────

export function getToolPrompt1to10(
  toolId:  string,
  inputs:  Record<string, any>,
  profile: ProfileContext,
): string | null {
  switch (toolId) {
    case 'copy-brain':         return getCopyBrainPrompt(inputs, profile)
    case 'caption-craft':      return getCaptionCraftPrompt(inputs, profile)
    case 'ad-scribe':          return getAdScribePrompt(inputs, profile)
    case 'email-scribe':       return getEmailScribePrompt(inputs, profile)
    case 'video-script-forge': return getVideoScriptForgePrompt(inputs, profile)
    case 'blog-brain':         return getBlogBrainPrompt(inputs, profile)
    case 'bio-builder':        return getBioBuilderPrompt(inputs, profile)
    case 'product-describer':  return getProductDescriberPrompt(inputs, profile)
    case 'press-release-ai':   return getPressReleasePrompt(inputs, profile)
    case 'content-calendar':   return getContentCalendarPrompt(inputs, profile)
    default: return null
  }
}
