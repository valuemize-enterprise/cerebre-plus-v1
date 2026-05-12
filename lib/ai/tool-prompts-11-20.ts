// ═══════════════════════════════════════════════════════════════
// /lib/ai/tool-prompts-11-20.ts
// Complete AI prompts for Tools 11–20.
// SERVER-SIDE ONLY.
// ═══════════════════════════════════════════════════════════════

import type { ProfileContext } from './master-system-prompt'

// ─────────────────────────────────────────────────────────────
// PROFILE HELPERS
// ─────────────────────────────────────────────────────────────

const B  = (p: ProfileContext) => p.business_name  || 'the business'
const C  = (p: ProfileContext) => p.city           || 'Nigeria'
const I  = (p: ProfileContext) => p.industry       || 'your industry'
const WA = (p: ProfileContext) => {
  const raw = p.whatsapp || '08012345678'
  const d   = raw.replace(/\D/g, '').replace(/^0/, '')
  return { display: raw, link: `wa.me/234${d}` }
}
const T  = (p: ProfileContext) => p.target_customer    || 'your target customers'
const A  = (p: ProfileContext) => p.unique_advantage   || 'quality and reliability'
const V  = (p: ProfileContext) => p.brand_voice        || 'professional'
const L  = (p: ProfileContext) => p.language_preference|| 'Nigerian English'
const PR = (p: ProfileContext) => p.social_proof       || ''
const YR = (p: ProfileContext) => p.years_in_business
  ? `${p.years_in_business} year${p.years_in_business > 1 ? 's' : ''} in business`
  : ''
const DESC = (p: ProfileContext) => p.description      || ''
const PRICE= (p: ProfileContext) => p.price_range      || ''

// ─────────────────────────────────────────────────────────────
// TOOL 11 — STORY PLANNER
// Laws: 2 (List building), 6 (Story), 8 (Serve the lazy viewer)
// ─────────────────────────────────────────────────────────────

export function getStoryPlannerPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)
  const n  = parseInt(inputs.story_count || '7', 10)

  return `
SPECIALIST ACTIVATED: Nigerian Story content architect. Laws 2 (List Building), 6 (Story), 8 (Zero-friction viewer experience) are PRIMARY.

━━━ STORY BRIEF ━━━
Business:     ${B(p)} — ${I(p)} in ${C(p)}
Platform:     ${inputs.target_platform?.replace(/_/g, ' ')}
Goal:         ${inputs.story_goal?.replace(/_/g, ' ')}
Topic:        ${inputs.story_topic}
Style:        ${inputs.story_style?.replace(/_/g, ' ')}
Slides:       ${n}
Duration:     ${inputs.duration_days} day(s)
Polls:        ${inputs.include_polls ? 'Yes' : 'No'}
Questions:    ${inputs.include_questions ? 'Yes' : 'No'}
Link Stickers: ${inputs.include_link_stickers ? 'Yes — WhatsApp link sticker' : 'No'}
WhatsApp:     ${wa.display}
Language:     ${L(p)}

━━━ NIGERIAN STORY INTELLIGENCE ━━━
Story viewers in Nigeria scroll fast. If Story 1 doesn't grab in under 2 seconds, they skip the rest.
- Stories 1–2: Hook and orientation (earn the right to continue)
- Stories 3–5: Value delivery / relationship building (the "Aso-Ebi principle" — Law 9: make them feel part of the community)
- Stories 6–(N-1): Social proof or engagement mechanics
- Final Story: Clear WhatsApp CTA — wa.me/234${wa.link.replace('wa.me/234', '')}

The Law 8 rule for Stories: Nigerian viewers are on mobile, often standing, often noisy environment. Every story must work with SOUND OFF. Bold text overlay is mandatory on all stories.

━━━ COMPLETE ${n}-STORY SEQUENCE ━━━

**SEQUENCE STRATEGY:**
Arc: [Describe the narrative journey across all ${n} stories — how the emotional temperature rises from hook to CTA]
Business name on every story: "${B(p)}" — bottom corner, always present.

${Array.from({ length: n }, (_, i) => {
  const storyNum = i + 1
  const isHook   = storyNum <= 2
  const isCTA    = storyNum === n
  const isProof  = storyNum === Math.ceil(n / 2)
  const tag      = isHook ? 'HOOK' : isCTA ? 'CTA CLOSE' : isProof ? 'TRUST MOMENT' : 'VALUE DELIVERY'

  return `
---
**STORY ${storyNum} of ${n} — ${tag}**
Type: ${isHook ? 'Attention capture — zero tolerance for boring' : isCTA ? 'Conversion — WhatsApp ask' : 'Value / relationship'}

📱 SCREEN CONTENT (what appears on screen):
[Bold text overlay — max 8 words — readable on 5" screen — high contrast]
Background: [Specific visual direction — colour, photo type, video suggestion]
Sticker placement: [Where on screen for text / interactive element]

🎙️ CAPTION / VOICEOVER (if recording):
"[What to say or type as the story caption — written in ${L(p)}]"
[Written in ${V(p)} tone for ${B(p)}]

${inputs.include_polls && !isHook && !isCTA ? `
📊 POLL / INTERACTIVE ELEMENT:
Type: [Poll / Question sticker / Slider / Quiz]
Question: "[Specific question that gets engagement — binary YES/NO or emotional response]"
Option A: "[First choice]" | Option B: "[Second choice]"
Why this works: [Why Nigerian ${I(p)} audiences will engage with this specific question]
` : ''}

${inputs.include_link_stickers && storyNum >= Math.ceil(n * 0.6) ? `
🔗 LINK STICKER: WhatsApp — ${wa.link}
Label: "${storyNum === n ? 'Message us NOW' : 'Ask us anything'}"
` : ''}

${isCTA ? `
📲 FINAL CTA STORY — THE ASK:
Spoken/Text: "Send me a WhatsApp message right now — ${wa.display}"
[Show number on screen in large text]
[WhatsApp link sticker: ${wa.link}]
Trust line: "${PR(p) || YR(p) || `${B(p)} — ${C(p)}`}"
Urgency (if applicable): "${inputs.urgency_element || '[Add deadline or scarcity if relevant]'}"
` : ''}
`}).join('\n')}

---
**STORY POSTING SCHEDULE:**
Best time to post in ${C(p)}: [Specific WAT time — 7am, 12pm, or 8pm depending on goal]
Frequency: [If running over ${inputs.duration_days} days — when to post each set]

${inputs.highlight_cover_name ? `
**HIGHLIGHT COVER:**
Name: "${inputs.highlight_cover_name}"
Cover design: [Simple icon + brand colour ${p.brand_colour || '#E09818'}]
` : ''}

**REPURPOSE THIS SEQUENCE:**
[How to turn these ${n} stories into 1 Reel, 1 carousel, and 1 WhatsApp broadcast — triple the value]

💡 CEREBRE TIP: [The Nigerian Story engagement mechanic that ${I(p)} businesses get the highest reply rates from — the poll/question format that Nigerian audiences cannot resist responding to]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 12 — WHATSAPP CAMPAIGN BUILDER
// Laws: 1 (Awoof), 4 (Fear), 7 (Sales Letter), 8 (Personal/direct), 10 (Urgency)
// THE MODIFIED WHATSAPP SALES LETTER FORMULA IS MANDATORY HERE
// ─────────────────────────────────────────────────────────────

export function getWhatsAppCampaignPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)
  const msgCount = parseInt(inputs.message_count || '3', 10)

  const toneGuide: Record<string, string> = {
    very_personal:       'Very personal — use "my friend", "bro/sis" where natural, colloquial, feels like a friend texting',
    warm_casual:         'Warm and casual — friendly, direct, professional enough to be taken seriously but personal enough to feel human',
    professional_friendly: 'Professional but warm — credible authority without being corporate or cold',
    urgent_direct:       'Direct and urgent — short sentences, strong verbs, the deadline is front and centre',
  }

  const listLabel: Record<string, string> = {
    all_contacts:      'full contact list',
    past_customers:    'past customers',
    recent_enquiries:  'people who enquired but haven\'t bought',
    cold_contacts:     'cold/new contacts',
    vip_customers:     'VIP / highest-spending customers',
  }

  return `
SPECIALIST ACTIVATED: Nigerian WhatsApp marketing expert — master of the platform where Nigerian deals actually close. Laws 1, 4, 7, 8, 10 are PRIMARY at maximum intensity.

━━━ WHATSAPP CAMPAIGN BRIEF ━━━
Business:       ${B(p)} — ${I(p)} in ${C(p)}
Goal:           ${inputs.campaign_goal?.replace(/_/g, ' ')}
Offer:          ${inputs.offer_details}
Messages:       ${msgCount}
Deadline:       ${inputs.deadline || 'Create a compelling real deadline'}
Tone:           ${toneGuide[inputs.tone_formality] || 'warm and casual'}
List Segment:   ${listLabel[inputs.target_list_segment] || 'all contacts'}
WhatsApp:       ${wa.display}
Social Proof:   ${inputs.social_proof_to_include || PR(p) || YR(p)}
${inputs.awoof_comparison ? `Awoof Comparison: ${inputs.awoof_comparison}` : ''}
${inputs.bonus_offer ? `Bonus: ${inputs.bonus_offer}` : ''}
Language:       ${L(p)}

━━━ THE WHATSAPP SALES LETTER FORMULA (MANDATORY) ━━━
Every single WhatsApp broadcast in this campaign MUST follow this adapted structure:

LINE 1 — THE HOOK: Stop their thumb. First line must create curiosity, fear, or desire. This is what they see in the notification preview — before they even open the message. It must make them open.

PARAGRAPH 2 — FEAR OR GIANT PROMISE: Show what they're losing by not acting (Law 4) OR the specific bold outcome they'll get (Law 5). Nigerians are 3x more motivated by fear of loss than by promise of gain.

PARAGRAPH 3 — SOCIAL PROOF: "[Number] [type] in [City] are already..." — Law 9: community validation from their actual city. Not generic "many Nigerians" — specific city names.

PARAGRAPH 4 — THE OFFER with AWOOF STACK: Normal price vs. this price. What they'd pay elsewhere vs. what ${B(p)} is offering. Make it feel like they're stealing from you.

CLOSING — SINGLE CLEAR ACTION: One instruction. One tap. WhatsApp reply or "Send this message." Never give two options. Nigerian buyers don't choose — they act or they don't.

DEADLINE — REAL AND SPECIFIC: "This offer closes [specific day] at [specific time]." Not "soon." Not "limited time." A specific timestamp creates specific urgency.

━━━ CRITICAL WHATSAPP FORMATTING RULES ━━━
✓ Use "I" (not "we") — Nigerians want a person, not a company
✓ WhatsApp bold: *use asterisks* for key phrases
✓ Short paragraphs — max 3 sentences before a line break
✓ Emoji: 1–2 max per message — strategic, not decorative
✓ Include ${wa.display} in the body — not just a link
✓ Never start with "Dear Customer" — start with a hook
✓ Total message length: <300 chars preferred, <500 chars max
✓ P.S. line is optional but always gets read — use for urgency reinforcement

━━━ COMPLETE ${msgCount}-MESSAGE CAMPAIGN ━━━

${Array.from({ length: msgCount }, (_, i) => {
  const msgNum = i + 1
  const days   = msgCount === 3
    ? ['Day 1 — 10:00am', 'Day 2 — 6:00pm', `Final day — 10:00am (${inputs.deadline || 'deadline day'})`]
    : msgCount === 5
      ? ['Day 1 — 10am (Announcement)', 'Day 2 — 6pm (Value add)', 'Day 3 — 10am (Social proof push)', 'Day 4 — 6pm (Offer reminder)', `Final day — 10am (Urgency close)`]
      : [`Message ${msgNum}`]
  const timing = days[i] || `Day ${msgNum}`
  const purpose= i === 0 ? 'WARM OPEN — build relationship before selling'
    : i === msgCount - 1 ? 'URGENCY CLOSE — final push'
    : i === 1 ? 'VALUE DELIVERY + OFFER REVEAL'
    : 'SOCIAL PROOF + OFFER REMINDER'

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**MESSAGE ${msgNum} of ${msgCount}** | ${timing}
*Purpose: ${purpose}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FULL MESSAGE — written in ${L(p)}, immediately copy-paste ready]
[Opens with hook — first line is what appears in phone notification preview]
${i === 0 ? '[Law 2: Relationship first — warm opener before any mention of the offer]' : ''}
${i > 0 ? `[Law 4/5: Fear or Giant Promise — second paragraph]\n[Social proof from ${C(p)}: "${inputs.social_proof_to_include || PR(p) || `${B(p)} in ${C(p)}`}" — Law 9]` : ''}
${i > 0 ? `[Offer + Awoof Stack: ${inputs.awoof_comparison || 'Normal value vs. what they pay today — Law 1'}]` : ''}
${inputs.bonus_offer && i === 1 ? `[Bonus reveal: ${inputs.bonus_offer}]` : ''}
[Single clear action: "[Reply] / [Send this message]" — ${wa.display}]
${i === msgCount - 1 ? `[DEADLINE — final: "${inputs.deadline || 'This offer closes at midnight tonight'}"]` : `[Deadline preview: "${inputs.deadline ? `Closes ${inputs.deadline}` : 'Limited time'}"]`}

${i === msgCount - 1 ? `*P.S. [Urgency reinforcement — one line that makes them act if they almost didn't]*` : ''}

**CHARACTER COUNT:** ~[X] characters
**NOTIFICATION PREVIEW (first 50 chars):** "[First 50 chars of message]"
**DELIVERY WINDOW:** ${timing}

${inputs.include_media_description ? `📸 **MEDIA TO ATTACH:**
[Specific image/video description that complements this message — what visual would maximise opens and engagement for ${I(p)} businesses in ${C(p)}]` : ''}

**IF THEY REPLY WITH "HOW MUCH?":**
"[Exact response — price with Awoof Stack, payment options, and next step in under 50 words]"

**IF THEY REPLY WITH "I'LL THINK ABOUT IT":**
"[Exact re-engagement response — acknowledge + add urgency + remove friction]"

**IF NO REPLY:**
${i < msgCount - 1 ? `Proceed to Message ${i + 2} on ${days[i + 1] || 'next day'}` : 'Final message sent. Add to a separate "warm but not yet converted" list for next campaign.'}
`}).join('\n')}

━━━ BROADCAST LIST SEGMENTATION ━━━
**For ${listLabel[inputs.target_list_segment] || 'all contacts'}:**
[How to segment ${B(p)}'s contact list to maximise relevance and response rate for this specific campaign]

**Personalisation tip:**
[How to personalise these messages even when broadcasting to 200+ contacts — the one technique that makes broadcasts feel personal in Nigeria]

━━━ FOLLOW-UP PROTOCOL ━━━
What to do within 30 minutes of sending each broadcast:
[Specific actions to take while replies are coming in — the window when Nigerian buyers are most responsive]

💡 CEREBRE TIP: [The WhatsApp broadcast insight that separates ${C(p)} businesses getting 40% reply rates from those getting 3% — the single element that makes the biggest difference in Nigerian WhatsApp marketing]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 13 — FOLLOWUP SEQUENCER
// Laws: 2 (Relationship), 3 (Trust), 6 (Story), 10 (Urgency)
// ─────────────────────────────────────────────────────────────

export function getFollowUpSequencerPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)
  const n  = parseInt(inputs.num_follow_ups || '5', 10)

  const objectionPlaybooks: Record<string, { realReason: string; strategy: string }> = {
    price_too_high:    { realReason: 'They haven\'t fully understood the value, or they\'re comparing to a cheaper but inferior alternative. "Too expensive" almost always means "I don\'t see why this is worth it yet."', strategy: 'Rebuild value with Awoof Stack. Show what they\'d pay for a worse result. Add a risk-reversal or payment plan.' },
    think_about_it:    { realReason: 'They don\'t want to say no, OR they genuinely need more information, OR there\'s a decision-maker they need to consult. This is the most common Nigerian delay tactic.', strategy: 'Give them a reason to think faster — add information and urgency simultaneously. Remove the decision friction.' },
    talk_to_someone_first: { realReason: 'There\'s another decision-maker. Or they\'re using this as a polite brush-off.', strategy: 'Help them bring the other person on board. Offer a joint conversation. Provide a "share with your partner" message.' },
    not_right_now:     { realReason: 'Timing, cash flow, or they\'re not yet convinced this is the right priority.', strategy: 'Create a bridge — a small first step. Or a price-lock for later. Make "right now" worth it versus "later."' },
    no_response_at_all: { realReason: 'Life happened. They got distracted. Or they\'re quietly hoping you\'ll go away.', strategy: 'Pattern interrupt. Change the channel. Change the content type. A voice note beats a text message almost every time in Nigeria.' },
    comparing_prices:  { realReason: 'They\'re genuinely shopping, or they want you to match a competitor\'s price.', strategy: 'Differentiate on value, not price. Show what the cheaper option doesn\'t include. Community validation — who in their city chose ${B(p)} over the cheaper option.' },
    budget_tight:      { realReason: 'Real cash flow issue, or price sensitivity they\'re dressing as budget.', strategy: 'Payment plan. Smaller first step. Something that starts the relationship now and scales up. FOMO on the current price.' },
    bad_past_experience: { realReason: 'They got burned before — by you, a competitor, or the industry. FOBE is at maximum.', strategy: 'Acknowledge the legitimate fear. Prove you\'re different with specifics. Guarantee that removes all risk.' },
    dont_see_value:    { realReason: 'Your value proposition hasn\'t landed clearly enough.', strategy: 'Story-first. Show a similar person who had the same doubt, then got the result. Make the result concrete and measurable.' },
  }

  const objKey = inputs.objection || 'think_about_it'
  const pb = objectionPlaybooks[objKey] || objectionPlaybooks['think_about_it']

  return `
SPECIALIST ACTIVATED: Nigerian sales psychology expert and follow-up conversion specialist. Laws 2, 3, 6, 10 are PRIMARY.

━━━ FOLLOW-UP BRIEF ━━━
Business:        ${B(p)} — ${I(p)} in ${C(p)}
Lead Context:    ${inputs.lead_context}
Primary Objection: ${objKey.replace(/_/g, ' ')}
${inputs.objection_custom ? `Custom detail: ${inputs.objection_custom}` : ''}
Lead Temperature: ${inputs.lead_temperature || 'warm'}
Days Since Contact: ${inputs.days_since_last_contact?.replace(/_/g, '-')} days
Follow-ups:      ${n}
Channel:         ${inputs.channel?.replace(/_/g, ' ')}
Product/Service: ${inputs.product_service || DESC(p)}
Value Add:       ${inputs.value_add || 'Provide new value or perspective'}
WhatsApp:        ${wa.display}
Trust Signal:    ${PR(p) || YR(p)}
Language:        ${L(p)}

━━━ OBJECTION DIAGNOSTIC ━━━
**The Stated Objection:** "${objKey.replace(/_/g, ' ')}"
**The Real Reason (what's actually going on):** ${pb.realReason}
**Your Winning Strategy:** ${pb.strategy}

━━━ NIGERIAN FOLLOW-UP INTELLIGENCE ━━━
In Nigeria, 80% of sales happen between the 3rd and 7th follow-up. Most businesses give up after the first "no." The ones who follow up consistently and intelligently win.

Key Nigerian follow-up principles:
- Never sound desperate — always sound abundant ("I wanted to check back because I have some good news")
- Add NEW value each time — never send the same message twice
- Law 6 (Story): Use a story of someone else in ${C(p)} who had the same hesitation and then regretted waiting
- Law 10 (Urgency): Each follow-up after the 3rd should introduce a real time-based reason to act now
- Voice notes perform 3x better than text in Nigerian follow-ups — note this in each touchpoint
- Never burn the bridge — even if they say no, end with a relationship-preserving close

━━━ COMPLETE ${n}-TOUCHPOINT SEQUENCE ━━━

${Array.from({ length: n }, (_, i) => {
  const num = i + 1
  const dayMap: Record<number, string> = { 1:'Same day or next morning', 2:'48 hours later', 3:'5 days after last contact', 4:'10 days after last contact', 5:'2 weeks after last contact', 6:'3 weeks after last contact', 7:'1 month after last contact' }
  const approachMap: Record<number, string> = {
    1: 'Soft value add — no mention of buying. Build the relationship.',
    2: 'New information + gentle re-open. Reframe, don\'t repeat.',
    3: 'Story of a similar customer who hesitated, then succeeded. Address the objection obliquely.',
    4: 'Direct objection address + risk removal (guarantee or trial). Urgency begins.',
    5: `Final serious push — real deadline. Law 10 at full intensity. After this, graceful wind-down.`,
    6: 'Graceful "last try" message. Make it easy to say yes or no. Plant seed for next season.',
    7: 'Re-engagement check-in. Situation may have changed. No selling — just reconnecting.',
  }

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TOUCHPOINT ${num} of ${n}** | ${dayMap[num] || `Week ${Math.ceil(num / 2)}`}
*Approach: ${approachMap[num] || 'Persistence with value'}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Recommended Channel:** ${inputs.channel?.includes('whatsapp') ? `WhatsApp ${num % 3 === 0 && inputs.channel?.includes('call') ? '+ voice note/call' : 'text'}` : inputs.channel?.replace(/_/g, ' ')}

**THE MESSAGE / SCRIPT:**
[COMPLETE, WORD-FOR-WORD MESSAGE — in ${L(p)}, ${V(p)} tone — immediately sendable]

Opening: ${num === 1 ? '[Warm, relationship-first — no selling. Reference something personal or relevant to them.]' : num === n ? '[Final urgency — specific deadline. "After this I won\'t reach out about this again."]' : '[Reference last interaction naturally — show continuity, not desperation]'}

Body:
${num === 1 ? `[Add new value — an insight, a tip, a resource related to ${inputs.product_service || I(p)}. Law 2: Give before you ask.]` : ''}
${num === 2 ? `[New perspective on their situation. A story or example from ${C(p)} that addresses their real concern.]` : ''}
${num === 3 ? `[Law 6 Story: "I was talking to someone in ${C(p)} last week who had the exact same concern about [${objKey.replace(/_/g, ' ')}]... here\'s what happened when they moved forward anyway."]` : ''}
${num === 4 ? `[Direct: "I know you mentioned [${objKey.replace(/_/g, ' ')}]. I want to address that properly." → Trust signal → Risk removal → Offer adjustment if applicable]` : ''}
${num >= 5 ? `[Final urgency: Real reason why acting now beats acting later. Price change / availability / external deadline. NOT manufactured.]` : ''}
[WhatsApp CTA: ${wa.display}]

**If they reply positively:** [Exact script to move them to the next step immediately — close while warm]
**If they reply with more objection:** [How to handle the secondary objection that typically follows "${objKey.replace(/_/g, ' ')}"]
**If no reply:** [Proceed to Touchpoint ${num + 1} on ${dayMap[num + 1] || 'next timing'}]

${num === n ? `
━━━ GRACEFUL EXIT (if no response after all ${n} follow-ups) ━━━
[The closing message that preserves the relationship for future — plants the seed, never burns the bridge]
"I won't keep following up, but the door is always open when the time is right. My WhatsApp is always ${wa.display}"
` : ''}
`}).join('\n')}

━━━ FOLLOW-UP TRACKING SYSTEM ━━━
Simple WhatsApp tracking system for ${B(p)} to manage all follow-ups:
[Practical system using WhatsApp labels or a simple spreadsheet — realistic for Nigerian business owners]

💡 CEREBRE TIP: [The follow-up timing or channel insight that Nigerian ${I(p)} businesses in ${C(p)} use to convert an additional 20-30% of leads who initially said no — the thing most businesses never try]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 14 — WELCOME MESSAGE CRAFT
// Laws: 3 (Trust — first impression), 8 (Zero friction)
// ─────────────────────────────────────────────────────────────

export function getWelcomeMessagePrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa  = WA(p)
  const all = inputs.message_type === 'full_set_all'
  const types = all
    ? ['greeting_welcome','away_out_of_hours','first_reply_after_save','catalogue_prompt','booking_confirmation','post_enquiry_follow_up']
    : [inputs.message_type]

  const typeLabels: Record<string, string> = {
    greeting_welcome:        'Greeting / Welcome Message',
    away_out_of_hours:       'Away / Out of Hours Message',
    first_reply_after_save:  'First Reply After New Contact Saves Number',
    catalogue_prompt:        'Catalogue / Services Prompt',
    booking_confirmation:    'Booking Confirmation',
    post_enquiry_follow_up:  'Post-Enquiry Automated Follow-Up',
  }

  return `
SPECIALIST ACTIVATED: Nigerian customer experience designer. Laws 3 (Trust — first impressions) and 8 (Zero friction) are PRIMARY.

━━━ WELCOME MESSAGE BRIEF ━━━
Business:         ${B(p)} — ${I(p)} in ${C(p)}
Message Types:    ${types.map(t => typeLabels[t]).join(', ')}
Business Hours:   ${inputs.business_hours || p.business_hours || 'Monday–Saturday, 8am–6pm'}
Response Promise: ${inputs.response_time_promise || 'Within a few hours'}
First Action:     ${inputs.what_to_offer_immediately}
Tone:             ${inputs.tone?.replace(/_/g, ' ') || 'friendly professional'}
Language:         ${inputs.languages?.replace(/_/g, ' ') || 'English only'}
Languages:        ${inputs.languages?.replace(/_/g, ' ')}
WhatsApp:         ${wa.display}
Trust Signal:     ${PR(p) || YR(p) || `${B(p)} in ${C(p)}`}

━━━ NIGERIAN FIRST-IMPRESSION INTELLIGENCE ━━━
Nigerian buyers make their trust decision about a WhatsApp contact in under 10 seconds of the first message.
The 3 things they judge immediately:
1. Does this feel like a real person or a bot? (Use "I" voice — Law 8)
2. Do they know what they're doing? (Specific, clear, competent — Law 3)
3. Is this going to be easy? (One clear next step — Law 8)

FOBE eliminates with: Business name + location + specific action + response time promise.

━━━ COMPLETE MESSAGE SET ━━━

${types.map((msgType: string) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**${typeLabels[msgType]?.toUpperCase()}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**THE MESSAGE:**
[COMPLETE MESSAGE — immediately usable, zero editing needed]
[${inputs.tone?.replace(/_/g, ' ') || 'Friendly professional'} tone in ${inputs.languages === 'english_and_pidgin' ? 'English with light Pidgin' : L(p)}]

${msgType === 'greeting_welcome' ? `
Opening: [Warm greeting that immediately tells them WHO they've reached and in what city]
Context: "${B(p)} — ${I(p)} in ${C(p)}"
Trust: ${PR(p) || YR(p) || `${B(p)}'s service guarantee`}
Immediate value: ${inputs.what_to_offer_immediately}
Next step: [One clear, simple action — no menu of options]
Signature: "— [Name from ${B(p)}], ${C(p)}"
` : ''}

${msgType === 'away_out_of_hours' ? `
Time acknowledgement: [Acknowledge they messaged outside ${inputs.business_hours || 'business hours'}]
Specific return time: "I'll respond by [specific time tomorrow]" — not vague
Immediate value while they wait: ${inputs.what_to_offer_immediately}
Emergency option (if applicable): [If urgent, what they can do right now]
Warm close: [Make them feel their message was valued — not "Your call is important to us" robotic equivalent]
` : ''}

${msgType === 'first_reply_after_save' ? `
Opening: [Welcome them — acknowledge they just saved the number, feel honoured they're reaching out to ${B(p)}]
Who you are: "${B(p)} — [what you do in one sentence] — based in ${C(p)}"
Trust drop: ${PR(p) || YR(p) || `Proudly serving ${C(p)} since [year]`}
Immediate value: ${inputs.what_to_offer_immediately}
Conversation starter: [One question that leads naturally to understanding their need]
` : ''}

${msgType === 'catalogue_prompt' ? `
Opening: [Make viewing the catalogue feel like a gift, not an instruction]
Catalogue description: [What they'll find when they open — specific and enticing]
Highlight item: [The one thing in the catalogue most people ask about first]
How to order: [Frictionless — reply with item name and quantity]
WhatsApp: ${wa.display}
` : ''}

${msgType === 'booking_confirmation' ? `
Confirmation: [Specific booking details — date, time, what is included]
Trust/reliability: [What to expect — the experience they should prepare for]
Preparation: [Anything they should bring / know beforehand — one clear instruction]
Cancellation/change policy: [Brief — without sounding defensive]
Excitement builder: [One thing to look forward to about the experience with ${B(p)}]
` : ''}

${msgType === 'post_enquiry_follow_up' ? `
Acknowledgement: [Confirm you received their enquiry — within [response time]]
Next step: [Specific — not "we'll be in touch" but "I will send you the price list / we'll schedule a call / I'll prepare your quote by [time]"]
Trust: ${PR(p) || `${B(p)} — ${YR(p)} — ${C(p)}`}
Value add: ${inputs.what_to_offer_immediately}
Expectation setting: [When exactly they'll hear from you again]
` : ''}

${inputs.include_quick_replies ? `
**QUICK REPLIES (set up in WhatsApp Business):**
/"services" — [Shows list of main services]
/"price" — [Sends pricing/packages message]
/"hours" — [Sends business hours]
/"location" — [Sends address and Google Maps link]
` : ''}

${inputs.languages !== 'english_only' ? `
**MULTILINGUAL VERSION:**
[Same message adapted with ${inputs.languages?.replace(/_/g, ' ')} greeting phrase — e.g. "Ẹ káabọ̀" for Yoruba, "Nnọọ" for Igbo, "Barka da zuwa" for Hausa — then continues in English]
` : ''}
`).join('\n')}

**CHARACTER COUNT AUDIT:** [Each message should be under 300 characters where possible for quick reading]

**A/B TEST SUGGESTION:**
Version A: [Formal opening] vs. Version B: [Emoji-led opening] — Test with next 20 new contacts and measure which gets faster replies.

💡 CEREBRE TIP: [The WhatsApp welcome message element that increases reply rates by 40% for Nigerian ${I(p)} businesses — the one line that most businesses forget to include in their automated welcome]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 15 — PROMO BLAST
// Laws: 1 (Awoof), 4 (Fear), 5 (Giant Promise), 10 (Urgency — maximum)
// ─────────────────────────────────────────────────────────────

export function getPromoBlastPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa       = WA(p)
  const channels: string[] = Array.isArray(inputs.channels) ? inputs.channels : ['whatsapp']
  const hasPrice = inputs.normal_price && inputs.promo_price

  return `
SPECIALIST ACTIVATED: Nigerian promotional copywriter — urgency, Awoof, and fear at maximum intensity. Laws 1, 4, 5, 10 are PRIMARY.

━━━ PROMO BLAST BRIEF ━━━
Business:        ${B(p)} — ${I(p)} in ${C(p)}
Promo Type:      ${inputs.promo_type?.replace(/_/g, ' ')}
Offer:           ${inputs.offer}
Channels:        ${channels.join(', ')}
Deadline:        ${inputs.deadline_hours}
${hasPrice ? `Normal Price:    ${inputs.normal_price}\nPromo Price:     ${inputs.promo_price}` : ''}
${inputs.slots_available ? `Available Slots: ${inputs.slots_available}` : ''}
${inputs.bonus_included ? `Bonus:           ${inputs.bonus_included}` : ''}
${inputs.guarantee ? `Guarantee:       ${inputs.guarantee}` : ''}
Social Proof:    ${inputs.social_proof || PR(p) || YR(p)}
Awoof Context:   ${inputs.awoof_comparison || 'Generate the strongest comparison stack possible'}
WhatsApp:        ${wa.display}
Language:        ${L(p)}

━━━ PROMO BLAST FORMULA (NON-NEGOTIABLE) ━━━
Line 1: THE SHOUT — stops everything. Specific number/deal/deadline visible in notification preview.
Para 2: THE AWOOF STACK — ${hasPrice ? `Normal ₦${inputs.normal_price} vs. Promo ₦${inputs.promo_price}` : 'What this would cost normally vs. what they pay now — make the gap shocking'}
Para 3: TRUST SIGNAL — ${inputs.social_proof || PR(p) || `${B(p)}'s track record in ${C(p)}`}
Para 4: FEAR — what they LOSE by not acting before the deadline
Para 5: THE SINGLE ACTION — one tap. One message. "${wa.display}"
LINE LAST: DEADLINE — specific to the hour. "${inputs.deadline_hours}"
P.S.: REINFORCEMENT — one line that makes them act if they almost didn't

━━━ CHANNEL-OPTIMISED BLASTS ━━━

${channels.map((ch: string) => {
  const chGuide: Record<string, string> = {
    whatsapp:         'WhatsApp: Short paragraphs, *bold key numbers*, emoji used sparingly, personal "I" voice, phone number in body',
    instagram_post:   'Instagram Post: Hook in first line, emojis OK here, 200-300 words, hashtags at end, WhatsApp link in caption',
    instagram_story:  'Instagram Story: 3-slide story sequence — Slide 1: Hook/deal. Slide 2: Offer details. Slide 3: CTA with link sticker',
    facebook_post:    'Facebook Post: Story-led, longer form OK, can include full Awoof Stack, share-friendly, local references',
    sms:              'SMS: Ultra-concise, 160 chars max, number at end, no emoji — must work on all phones',
    email:            'Email: Subject line that opens, full Awoof Stack in body, urgency in subject line and P.S.',
  }
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**${ch.toUpperCase().replace(/_/g, ' ')} VERSION**
*Format: ${chGuide[ch] || 'Channel-appropriate format'}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MAIN BLAST:**
[COMPLETE, IMMEDIATELY PUBLISHABLE MESSAGE — in ${L(p)}]
[Follows the Promo Blast Formula above — adapted for ${ch} format]
${ch === 'instagram_post' || ch === 'facebook_post' ? `[Include hashtags: [10 relevant for ${I(p)} + ${C(p)} + offer type]]` : ''}
${ch === 'instagram_story' ? `
STORY SLIDE 1 SCREEN TEXT: "[Deal in 5 words — huge font]"
STORY SLIDE 2 SCREEN TEXT: "[Offer details — Awoof Stack visible]"
STORY SLIDE 3 CTA: "Tap the link — ${wa.link}"
` : ''}
${ch === 'email' ? `
SUBJECT LINE (A): "[Urgency + Number + City — e.g. '48 hours left: 40% off for ${C(p)} businesses']"
SUBJECT LINE (B): "[Fear-based — e.g. 'After tomorrow, this price is gone']"
PREVIEW TEXT: "[Extend the subject — 40 chars — the Awoof Stack preview]"
` : ''}

**CHARACTER COUNT:** [X chars${ch === 'sms' ? ' — must be under 160' : ''}]
`}).join('\n')}

━━━ TIMING STRATEGY ━━━
**Best send time for maximum opens:** [Specific WAT time for each channel]
**Salary week overlay:** ${inputs.promo_type === 'flash_sale' || inputs.promo_type === 'limited_slots' ? `This promo SHOULD run in the last 7 days of the month — Nigerian buyers have cash and motivation. ${inputs.deadline_hours} — time it accordingly.` : `This promo type works at any time, but last 7 days of month adds 2.5x conversion uplift if you can time it.`}

━━━ FOLLOW-UP BLAST (6 hours before deadline) ━━━
[Short, urgent final reminder for WhatsApp — "<100 characters if possible"]
[Opens with: "Last [X] hours for [specific deal]"]
[Ends with: "${wa.display}"]

━━━ DAY-AFTER MESSAGE (For those who missed it) ━━━
[Position the 'missed' deal as the next opportunity — seed the next promo without seeming desperate]

💡 CEREBRE TIP: [The promo blast element — message length, timing, or Awoof formula detail — that makes Nigerian ${I(p)} promotions generate 3x more replies than the average competitor in ${C(p)}]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 16 — STRATEGYBRAIN (THE FLAGSHIP)
// ALL 10 LAWS FULLY ACTIVE
// ─────────────────────────────────────────────────────────────

export function getStrategyBrainPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)
  const budgetLabels: Record<string, string> = {
    '0_50k':    '₦0–₦50,000/month',
    '50_150k':  '₦50,000–₦150,000/month',
    '150_500k': '₦150,000–₦500,000/month',
    '500k_1m':  '₦500,000–₦1,000,000/month',
    '1m_plus':  '₦1,000,000+/month',
  }
  const budget = budgetLabels[inputs.monthly_budget] || inputs.monthly_budget

  const goalLabels: Record<string, string> = {
    get_first_100_customers:    'Acquire the first 100 customers',
    double_monthly_revenue:     'Double monthly revenue',
    launch_new_product:         'Successfully launch a new product/service',
    build_online_presence:      'Build a strong online brand presence',
    reduce_ad_spend_grow_organic: 'Reduce ad dependency, grow organically',
    enter_new_city_market:      'Enter a new city or market',
    increase_repeat_purchases:  'Increase repeat purchase rate',
    build_whatsapp_email_list:  'Build a WhatsApp/email subscriber list',
    recover_from_slow_period:   'Recover from a slow business period',
    dominate_local_market:      'Dominate the local ${city} market',
  }

  return `
SPECIALIST ACTIVATED: Pan-African CMO with 40 years of Nigerian market experience. ALL 10 AKIN ALABI LAWS are active simultaneously. This is the highest-stakes output in Cerebre Plus — make ${B(p)} feel deeply understood.

━━━ STRATEGY BRIEF ━━━
Business:            ${B(p)} — ${I(p)} in ${C(p)}
Primary Goal:        ${goalLabels[inputs.strategy_goal] || inputs.strategy_goal?.replace(/_/g, ' ')}
Current Situation:   ${inputs.current_situation}
Monthly Budget:      ${budget}
Biggest Challenge:   ${inputs.biggest_challenge}
Team Size:           ${inputs.team_size?.replace(/_/g, ' ')}
Time Available:      ${inputs.time_available_per_week?.replace(/_/g, ' ')} per week
${inputs.competitors ? `Competitors: ${inputs.competitors}` : ''}
${inputs.current_monthly_revenue ? `Current Revenue: ${inputs.current_monthly_revenue}` : ''}
${inputs.target_monthly_revenue ? `Revenue Target: ${inputs.target_monthly_revenue}` : ''}
${inputs.current_customer_count ? `Current Customers: ${inputs.current_customer_count}` : ''}
Preferred Channels: ${Array.isArray(inputs.preferred_channels) ? inputs.preferred_channels.join(', ') : 'To be determined by strategy'}
WhatsApp:           ${wa.display}
Social Proof:       ${PR(p) || YR(p)}
Target Customer:    ${T(p)}
Unique Advantage:   ${A(p)}
Language:           ${L(p)}

━━━ THE AWOOF DISCLOSURE (MANDATORY OPENING NOTE) ━━━
[INCLUDE THIS AT THE TOP OF THE STRATEGY: "Note: A Lagos marketing agency would charge between ₦800,000 and ₦2,000,000 to produce this strategy document. It took CerebreBrain 60 seconds. Read it carefully — there is ₦1,500,000 worth of strategic thinking on these pages."]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 90-DAY MARKETING STRATEGY
## ${B(p).toUpperCase()} | ${C(p)} | ${I(p).toUpperCase()}
### Prepared by CerebreBrain | ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## SECTION 1 — SITUATION ANALYSIS
*[Make ${B(p)} feel deeply understood — this section should feel like a mirror, not a generic template]*

**Where ${B(p)} Is Right Now:**
[Honest, empathetic, specific analysis of the current situation based on the inputs. Name the city. Name the industry challenges. Show you understand the ${C(p)} ${I(p)} market specifically. Use their actual words from the input back to them. Acknowledge the specific challenge they named. Make them feel: "This AI actually gets my situation."]

**The Core Problem to Solve:**
[The root issue beneath their biggest challenge — go one level deeper than what they said. The thing they're experiencing but might not have articulated perfectly.]

**The Opportunity:**
[What's available to ${B(p)} right now that they might not be seeing. Specific to ${I(p)} in ${C(p)}. This is the Law 5 Giant Promise applied at the strategic level.]

**The Risk of Not Executing:**
[Law 4: What happens in the next 90 days if ${B(p)} doesn't implement this strategy. Specific. Real. The competitor in ${C(p)} who will take their customers if they don't move.]

**Key Strengths to Build On:**
[What ${B(p)} already has going for it — ${A(p)}, ${PR(p) || YR(p)}, their position in ${C(p)}]

---

## SECTION 2 — 90-DAY STRATEGY OVERVIEW

**Strategic Goal:** ${goalLabels[inputs.strategy_goal] || inputs.strategy_goal?.replace(/_/g, ' ')}
**Primary Metric:** [The one number that will tell us if this strategy worked]
**Budget Framework:** ${budget} — [How this budget enables the strategy]

**The Core Strategic Bet:**
[The single most important strategic decision — the move that will make or break the 90 days for ${B(p)} in ${C(p)}]

**The 3 Strategic Pillars:**
1. [Pillar 1 — Foundation]
2. [Pillar 2 — Growth engine]
3. [Pillar 3 — Conversion system]

**The Cerebre Plus Framework Applied:**
[How each of the 10 laws maps to a specific action in this strategy — shown as a table]
| Law | Application for ${B(p)} |
|-----|--------------------------|
| 1. Awoof | [Specific] |
| 2. List | [Specific] |
| 3. Trust | [Specific] |
| 4. Fear | [Specific] |
| 5. Promise | [Specific] |
| 6. Story | [Specific] |
| 7. Sales Letter | [Specific] |
| 8. Customer | [Specific] |
| 9. Community | [Specific] |
| 10. Urgency | [Specific] |

---

## SECTION 3 — PHASE 1: DAYS 1–30 "BUILD THE FOUNDATION"

**Theme:** [Phase 1 strategic narrative]
**Primary Goal:** [Specific, measurable target by Day 30]
**Success Metric:** [The number that tells you Phase 1 worked]

### Week 1 (Days 1–7): Quick Wins — Start Moving Immediately
[5 specific, actionable tasks for Week 1 — with enough detail that ${B(p)} knows EXACTLY what to do tomorrow morning]

| Task | What exactly to do | Time needed | Expected result |
[5 rows — specific enough to execute without guessing]

### Weeks 2–4: Foundation Actions
[Detailed weekly breakdown — content plan, WhatsApp strategy, lead generation activities]

**Content Strategy (Days 1–30):**
[Specific content plan — how many posts per week, what types, what topics — for ${I(p)} in ${C(p)}]

**WhatsApp Strategy (Days 1–30):**
[List building: [specific target]]
[First broadcast: [timing and purpose]]
[WhatsApp number: ${wa.display}]

**Budget Allocation — Month 1:**
| Activity | ₦ Amount | % of Budget | Expected Return |
[Detailed allocation of ${budget} for Month 1]

**Phase 1 Salary Week Strategy (Days 25–30):**
[Specific promotional actions timed for maximum conversion during salary week]

---

## SECTION 4 — PHASE 2: DAYS 31–60 "BUILD MOMENTUM"

**Theme:** [Scale what worked in Phase 1]
**Primary Goal:** [Specific target — must be higher than Phase 1]

[Full Phase 2 breakdown — same structure as Phase 1 but with emphasis on scaling proven tactics and introducing the next layer of the growth engine]

**What Changes from Phase 1:**
[What gets turned up, what gets stopped, what gets added based on Phase 1 learnings]

**Phase 2 Salary Week Strategy (Days 55–60):**
[More aggressive promotional push — ${B(p)} now has social proof from Phase 1 to amplify]

---

## SECTION 5 — PHASE 3: DAYS 61–90 "ACCELERATE TO RESULTS"

**Theme:** [Maximum execution — the harvest phase]
**Primary Goal:** [The 90-day target that makes the whole strategy worthwhile]

[Full Phase 3 breakdown — emphasis on conversion, referrals, upsells, and building the flywheel for beyond Day 90]

**The Referral Engine (Phase 3):**
[Specific referral strategy leveraging Law 9 — community validation as a growth channel]

**Phase 3 Salary Week Strategy (Days 85–90):**
[The biggest push of the entire 90 days — culmination campaign]

---

## SECTION 6 — CHANNEL STRATEGY TABLE

| Channel | Strategy | Frequency | Monthly ₦ | Primary Goal | KPI |
|---------|----------|-----------|-----------|--------------|-----|
| WhatsApp | [Specific] | [X/week] | ₦X | [Goal] | [Metric] |
| Instagram | [Specific] | [X/week] | ₦X | [Goal] | [Metric] |
| Facebook | [Specific] | [X/week] | ₦X | [Goal] | [Metric] |
[All relevant channels for ${I(p)} in ${C(p)} based on preferred channels and budget]

**Channel Priority for ${B(p)}:**
1. **PRIMARY:** [Most important channel for this specific business] — because [reason specific to ${I(p)} in ${C(p)}]
2. **SECONDARY:** [Second channel]
3. **TEST:** [Channel to test in Phase 2]

---

## SECTION 7 — KPI DASHBOARD

| Metric | Baseline | Day 30 | Day 60 | Day 90 |
|--------|----------|--------|--------|--------|
| Monthly Revenue | ${inputs.current_monthly_revenue || '[Current]'} | [Target] | [Target] | ${inputs.target_monthly_revenue || '[90-day target]'} |
| WhatsApp Contacts | [Current] | +[X] | +[X] | +[X] |
| Monthly Enquiries | [Current] | [Target] | [Target] | [Target] |
| Conversion Rate | [Current] | [Target] | [Target] | [Target] |
| Instagram Followers | [Current] | +[X] | +[X] | +[X] |
| Revenue per customer | [Current] | [Target] | [Target] | [Target] |
[Additional KPIs relevant to ${inputs.strategy_goal}]

**Leading Indicators to Watch Weekly:**
[The 3 numbers ${B(p)} should check every Monday morning to know if the strategy is on track]

**Warning Signs:**
[The signals that something is off and needs to be adjusted — specific thresholds]

---

## SECTION 8 — QUICK START: THIS WEEK (Days 1–7)

[THE MOST IMPORTANT SECTION — what ${B(p)} does starting tomorrow]

### Monday (Day 1):
**Morning (30 mins):** [Specific task]
**Afternoon (1 hour):** [Specific task]
**Evening (15 mins):** [Specific task]

### Tuesday–Friday:
[Specific daily actions — granular enough that there's no ambiguity about what to do]

### This Weekend:
[The preparation work for next week's launch]

### The One Thing:
If ${B(p)} could do only ONE thing from this entire strategy, it should be:
**[SPECIFIC RECOMMENDATION]** — because [Nigerian market reasoning specific to ${I(p)} in ${C(p)}]

---

## NIGERIAN CULTURAL CALENDAR — NEXT 3 MARKETING MOMENTS

**Marketing Moment 1:** [Next upcoming Nigerian cultural/commercial event]
How ${B(p)} should leverage it: [Specific, actionable — timing, content, offer]

**Marketing Moment 2:** [Second upcoming event]
How ${B(p)} should leverage it: [Specific, actionable]

**Marketing Moment 3:** [Third upcoming event]
How ${B(p)} should leverage it: [Specific, actionable]

**Salary Week Calendar:**
Month 1 salary week: [Days X–Y] — planned actions: [specific]
Month 2 salary week: [Days X–Y] — planned actions: [specific]
Month 3 salary week: [Days X–Y] — planned actions: [specific]

---

## THE AWOOF AUDIT — WHAT THIS STRATEGY IS WORTH

| What You Got | What It Would Cost Elsewhere |
|---|---|
| Complete 90-day marketing strategy | ₦800,000–₦2,000,000 (Lagos marketing agency) |
| Channel strategy and budget allocation | ₦150,000 (media planning consultant) |
| Nigerian cultural calendar integration | ₦75,000 (specialist consultant) |
| KPI dashboard and metrics framework | ₦100,000 (analytics consultant) |
| 90-day execution roadmap (week by week) | ₦250,000 (project management) |
| **Total value if purchased separately** | **₦1,375,000–₦2,575,000** |
| **What this cost you on Cerebre Plus** | **100 coins (₦[coin equivalent]) — and 60 seconds** |

The choice is yours: hire an agency for ₦1.5M, or use Cerebre Plus and put that ₦1.5M into actually executing the strategy.

---

💡 CEREBRE TIP: [The single highest-leverage, least-known strategic insight for ${I(p)} businesses specifically in ${C(p)} — the move that most businesses in this space miss and that can dramatically change the trajectory of the next 90 days. This should be genuinely surprising — not obvious advice.]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 17 — CAMPAIGN CLOCK
// Laws: 2 (List building timing), 10 (Urgency — salary cycle intelligence)
// ─────────────────────────────────────────────────────────────

export function getCampaignClockPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)
  const month = (inputs.campaign_month || 'current month')
  const year  = inputs.campaign_year || new Date().getFullYear()

  const nigerianCalendar: Record<string, string[]> = {
    january:   ['New Year buying mood', 'JAMB registration period', 'Back-to-school shopping', 'January blues — fitness & self-improvement surge'],
    february:  ['Valentine\'s Day (Feb 14)', 'Valentine\'s week promotions (Feb 10–14)', 'Post-Christmas budget recovery'],
    march:     ['Mothering Sunday (UK diaspora)', 'End of Q1 business reviews', 'Grad season approaches'],
    april:     ['Easter weekend (Good Friday to Easter Monday — massive family spending)', 'Children\'s Day (May 27 approaching — early promotions)', 'School holiday buying'],
    may:       ['Children\'s Day (May 27)', 'Workers\' Day (May 1)', 'Pre-Eid shopping if Ramadan ends this month'],
    june:      ['Post-exam season', 'Holiday travel picks up', 'Corporate mid-year budgets'],
    july:      ['Eid-el-Fitr if applicable — major commercial moment', 'Back-to-school preparation begins', 'Corporate H1 reviews complete'],
    august:    ['Back-to-school peak spending', 'Late Eid-el-Kabir (Sallah) if applicable', 'Holiday season in full swing'],
    september: ['School resumption — huge parent spending', 'Ember months begin — consumer confidence rises', 'Corporate Q3 budgets'],
    october:   ['Independence Day (Oct 1) — national pride content', 'Black Friday preparation begins', 'Ember month momentum — Nigerian buyers spend more Oct-Dec'],
    november:  ['Black Friday (last Friday of month) — Nigerian e-commerce peak', 'Pre-Christmas shopping', 'Year-end budget spending by corporates'],
    december:  ['Christmas spending peak — highest consumer month', 'Corporate year-end gifts and events', 'New Year preparation', 'Detty December — entertainment, fashion, food, hospitality surge'],
  }

  const monthEvents = nigerianCalendar[month.toLowerCase()] || ['Month-specific events — apply general Nigerian calendar intelligence']

  return `
SPECIALIST ACTIVATED: Nigerian campaign timing strategist with salary-cycle intelligence. Laws 2, 10 are PRIMARY. Salary week awareness is at MAXIMUM.

━━━ CAMPAIGN CLOCK BRIEF ━━━
Business:      ${B(p)} — ${I(p)} in ${C(p)}
Planning For:  ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}
Audience Religion: ${inputs.target_audience_religion?.replace(/_/g, ' ')}
Goals:         ${Array.isArray(inputs.campaign_goals) ? inputs.campaign_goals.join(', ') : inputs.campaign_goals}
Budget:        ${inputs.budget_monthly?.replace(/_/g, ' ') || 'Not specified'}
Platforms:     ${Array.isArray(inputs.platforms_in_use) ? inputs.platforms_in_use.join(', ') : 'All relevant channels'}
Products:      ${inputs.products_to_promote || DESC(p)}
Special Events: ${inputs.special_events_in_month || 'Standard Nigerian calendar'}
WhatsApp:      ${wa.display}
Language:      ${L(p)}

━━━ ${month.toUpperCase()} ${year} — MARKET INTELLIGENCE ━━━

**Nigerian Calendar Events This Month:**
${monthEvents.map((e: string, i: number) => `${i + 1}. ${e}`).join('\n')}

**Salary Intelligence:**
Peak purchase intent dates: 25th–31st of ${month}
Recommendation: Concentrate 60% of promotional content in the last 7 days
Pre-salary warmup: 20th–24th — build desire, start the conversation before money arrives
Post-salary window: 25th–28th — highest conversion rate days of the month

**Religious Sensitivity This Month:**
${inputs.target_audience_religion === 'predominantly_muslim' ? `Muslim audience primary — ensure no promotions clash with Islamic prayer times (5x daily), Jumu\'ah (Friday 12pm-2pm), or any Ramadan/Eid observances this month.` : inputs.target_audience_religion === 'predominantly_christian' ? `Christian audience primary — Sunday mornings are low reach/low conversion. Sunday evenings and Monday mornings are high intent post-church motivation windows.` : `Mixed audience — balance Christian and Muslim sensitivities. Sunday mornings: low. Friday afternoons: low. Best universal times: Monday 10am, Tuesday-Thursday all day, Saturday morning.`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ${month.toUpperCase()} ${year} CAMPAIGN CALENDAR
## ${B(p)} | ${C(p)} | ${I(p)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## MONTH OVERVIEW

**Strategic Mode:** [What this month's campaign should feel like holistically — narrative arc]
**Primary Offer:** [The hero offer ${B(p)} leads with this month]
**Content Theme:** [The unifying theme across all platforms for ${month}]
**Revenue Target Guidance:** [If current + target provided, specific guidance; else benchmark for ${I(p)} in ${C(p)}]

---

## WEEK-BY-WEEK BREAKDOWN

### WEEK 1 — Days 1–7 | [Theme: e.g. "Authority & Value"]
**Campaign Mode:** Education and trust building
**Daily Intensity:** ●● (Medium)
**Content Focus:** [What to post about this week — ${I(p)} expertise, behind-the-scenes, value posts]
**Offer Mention:** None — build desire without asking yet
**Best Performing Day This Week:** [Specific day for ${I(p)} in ${C(p)}]
**WhatsApp Activity:** [1 value broadcast — no selling]

**Daily Schedule:**
${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => `
${day}: ${i < 5 ? `[Specific post type for ${I(p)}] | [Platform] | [Best time WAT]` : i === 5 ? `[High-engagement Saturday content — Nigerian audiences most active 8am–10am and 7pm–10pm]` : '[Rest or schedule — Sunday organic reach is lower for most Nigerian audiences]'}`).join('\n')}

---

### WEEK 2 — Days 8–14 | [Theme: e.g. "Social Proof & Community"]
**Campaign Mode:** Trust acceleration — testimonials, community validation, behind the success stories
**Daily Intensity:** ●● (Medium)
**Content Focus:** Social proof, testimonials, community (Law 9 — reference ${C(p)} specifically)
**Offer Mention:** Soft — "clients who worked with us in ${C(p)} got [result]" — plant the seed
**WhatsApp Activity:** [Testimonial broadcast — soft mention of offer]

[Same daily breakdown structure as Week 1]

---

### WEEK 3 — Days 15–21 | [Theme: e.g. "Desire Building"]
**Campaign Mode:** Introduce the offer — soft sell increasing to medium sell
**Daily Intensity:** ●●● (High)
**Content Focus:** Problem-solution content, case studies, the offer revealed
**Offer Mention:** Yes — but value-led, not price-first
**WhatsApp Activity:** [Offer reveal broadcast — Awoof Stack included]

[Same daily breakdown structure]

---

### 🔥 SALARY WEEK — Days 22–31 | [Theme: "MONEY IS IN THE ROOM — CONVERT"]
**⚡ Campaign Mode: MAXIMUM PROMOTIONAL INTENSITY**
**Daily Intensity:** ●●●●● (Maximum — post every day, multiple times)

**THE SALARY WEEK GAME PLAN:**
This is not the time for educational content. This is the harvest. ${C(p)} salaries land between the 24th and 31st. Your buyers have cash and buying intent simultaneously for a 7-day window. Don't waste a single day of it.

**Budget shift:** Move additional spend here — increase daily ad budget by 50% in salary week
**WhatsApp broadcasts:** Send on: Day 24 (pre-salary warmup), Day 26 (offer + Awoof Stack), Day 29 (urgency), Day 31 (final close)

**Daily Salary Week Schedule:**

${Array.from({ length: 7 }, (_, i) => `
📅 **SALARY WEEK DAY ${i + 1} (Day ${22 + i})**
**Mode:** ${i === 0 ? 'Pre-salary warmup — build anticipation' : i === 6 ? 'Final close — last chance urgency' : i % 2 === 0 ? 'Offer push with social proof' : 'Awoof Stack promotion'}
**Post:** [Specific content direction]
**WhatsApp:** ${i % 2 === 0 || i === 6 ? 'YES — broadcast' : 'No — let last broadcast breathe'}
**Offer Urgency Level:** ${i < 2 ? 'Medium' : i < 5 ? 'High' : 'Maximum — deadline visible in every message'}
**CTA:** [Specific action — directly to WhatsApp: ${wa.display}]
`).join('\n')}

---

## TOP 5 HIGH-CONVERSION DATES IN ${month.toUpperCase()} ${year}

${Array.from({ length: 5 }, (_, i) => `
**${i + 1}. [Specific date and event]:**
Why it matters for ${B(p)}: [Specific ${I(p)} angle]
Recommended action: [Specific post, broadcast, or campaign element]
Preparation needed: [Lead time — what to prepare by when]
`).join('\n')}

---

## PAID ADS CALENDAR (if budget allocated)

**Week 1–2:** ₦[X] — Brand awareness, cold audience
**Week 3:** ₦[X] — Warm retargeting, offer introduction
**Salary Week:** ₦[X] — Maximum spend on conversion-focused ads — ROI highest this week
**Recommended daily budget salary week:** [Specific ₦ amount based on budget tier]

---

## PRE-WRITTEN WHATSAPP BROADCASTS FOR ${month.toUpperCase()}

[4 complete, ready-to-send WhatsApp broadcasts for ${B(p)} — one for each key moment in the month:]

**Broadcast 1 (Week 1 — Value):**
[Complete message — no selling, just value]

**Broadcast 2 (Week 3 — Offer):**
[Complete message — Awoof Stack + offer + trust signal]

**Broadcast 3 (Salary Week Start):**
[Complete message — pre-salary excitement]

**Broadcast 4 (Salary Week Close):**
[Complete message — final urgency — "${inputs.budget_monthly}" style final push]

WhatsApp: ${wa.display}

---

## CONTENT BANK — 15 POST IDEAS FOR ${month.toUpperCase()}

[15 specific, scroll-stopping post ideas for ${B(p)} in ${I(p)} — each with: topic, hook line, format, and best day to post]

1. [Topic | "Hook line..." | Format | Best day]
[...through 15]

💡 CEREBRE TIP: [The ${month} Nigerian market insight that ${I(p)} businesses in ${C(p)} almost never leverage — the timing or cultural moment specific to this month that could be the highest-converting day in ${month} if done right]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 18 — AUDIENCE PROFILER
// Laws: 3 (Trust — prove specificity), 6 (Story), 9 (Community)
// ─────────────────────────────────────────────────────────────

export function getAudienceProfilerPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa  = WA(p)
  const depth = inputs.depth === 'deep_dive'

  const cityInsights: Record<string, string> = {
    lagos:        'Lagos buyers: status-conscious, fast-moving, globally aware. Premium positioning works. They\'re used to being sold to — they have a highly developed scam-detector. Speed and professionalism matter.',
    abuja:        'Abuja buyers: credential-driven, government-adjacent, professional. Formal presentation matters. They trust established brands and institutional affiliations.',
    port_harcourt:'Port Harcourt buyers: oil-money culture, relationship-first. They buy from people they know or people vouched for by people they know. Trust takes time but converts big.',
    kano:         'Kano buyers: value-driven, community-trusted. Hausa cultural sensitivity essential. Family and community approval matters more than individual desire. Halal considerations where relevant.',
    ibadan:       'Ibadan buyers: educated, academic-adjacent, value-quality balance. Don\'t respond to aggressive selling — prefer to feel they discovered you.',
    nationwide:   'Nationwide mix: use Lagos-dominant messaging for premium, Kano-sensitive messaging for value, always acknowledge the diversity of the Nigerian market.',
  }

  const cityKey = inputs.target_city || 'lagos'
  const cityNote = cityInsights[cityKey] || cityInsights['lagos']

  return `
SPECIALIST ACTIVATED: Nigerian consumer psychologist and Ideal Customer Portrait (ICP) architect. Laws 3, 6, 9 are PRIMARY.

━━━ AUDIENCE PROFILER BRIEF ━━━
Business:           ${B(p)} — ${I(p)} in ${C(p)}
Best Customer:      ${inputs.current_customer_description}
Product/Service:    ${inputs.product_being_sold}
Problems Solved:    ${inputs.problems_you_solve}
Target City:        ${cityKey.replace(/_/g, ' ')}
Income Bracket:     ${inputs.income_bracket?.replace(/_/g, ' ')}
Age Range:          ${inputs.age_range?.replace(/_/g, ' ')}
Gender Focus:       ${inputs.gender_focus?.replace(/_/g, ' ')}
Depth:              ${depth ? 'Deep dive' : 'Standard'}
WhatsApp:           ${wa.display}
Language:           ${L(p)}

━━━ CITY INTELLIGENCE ━━━
${cityNote}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# IDEAL CUSTOMER PROFILE (ICP)
## ${B(p)} | ${cityKey.replace(/_/g, ' ').replace(/^\w/, (c: any) => c.toUpperCase())} Market
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## MEET YOUR IDEAL BUYER

*[Give them a real name, a real life, a real day. Law 6: make them a character, not a demographic.]*

**Name:** [Nigerian name appropriate to ${cityKey.replace(/_/g, ' ')} — first name only]
**Age:** [Specific age within the ${inputs.age_range?.replace(/_/g, '-')} range — pick the peak age]
**Location:** [Specific ${cityKey.replace(/_/g, ' ')} neighbourhood/area — e.g. "lives in Lekki Phase 1, works on the Island" — not generic "Lagos"]
**Monthly Income:** [Specific range in ₦ within ${inputs.income_bracket?.replace(/_/g, '-')}]
**Job/Role:** [Specific job title — not just "professional" — e.g. "Branch Manager at a mid-size commercial bank"]
**Family:** [Marital status, children, dependents — affects disposable income and buying motivation]
**Phone:** [Specific phone model common in their income bracket — influences how they interact with content]

**A Day in Their Life:**
6am: [Morning routine — when are they first on their phone?]
Commute: [How they get to work in ${cityKey.replace(/_/g, ' ')} — what they consume during commute]
Lunch: [Mid-day phone behaviour — peak engagement window?]
Evening: [When they're most relaxed, most receptive, most likely to make buying decisions]
Bedtime: [WhatsApp browsing patterns — last scroll before sleep]

---

## PSYCHOLOGICAL PROFILE

**Their Deepest Desire (not the product — the life they want):**
[The emotional outcome beneath the surface need — what ${inputs.product_being_sold} gives them access to that they can't easily say out loud]

**Their Primary Fear:**
[The specific thing they're afraid of — related to ${inputs.problems_you_solve} — the FOBE pattern]

**Their FOBE Pattern:**
[What specific scam or bad experience has primed them to be suspicious of ${I(p)} businesses in ${cityKey.replace(/_/g, ' ')}. What they've heard or experienced that makes them cautious.]

**The Internal Story They Tell Themselves:**
[The narrative they use to explain why they haven't solved this problem yet — the rationalisation that ${B(p)} needs to interrupt]

**What Would Make Them Act Today (not tomorrow):**
[The exact trigger — external event, internal emotion, or specific combination of information — that converts thinking to buying for this specific person]

**Social Validation Pattern:**
[Who they ask for recommendations. How they validate a purchase decision socially in ${cityKey.replace(/_/g, ' ')}. Law 9: who in their community needs to approve before they buy?]

---

## BUYING BEHAVIOUR

**Research Pattern:**
[How they research before buying in ${I(p)} — Google, Instagram, WhatsApp groups, referrals, etc. — in order of frequency for ${cityKey.replace(/_/g, ' ')} buyers]

**FOBE Trust Signals That Work for This Specific Person:**
[The 3 specific trust signals that speak to their particular FOBE pattern — not generic "testimonials" but: what TYPE of testimonial, from whom, in what format]

**Decision Influences:**
[The specific people or platforms they trust most for ${I(p)} recommendations in ${cityKey.replace(/_/g, ' ')}]

**Price Sensitivity:**
[How they actually think about price — is a higher price a quality signal? Do they negotiate? When do they feel "it's worth it" vs "too expensive"?]

**WhatsApp Buying Behaviour:**
[Do they buy on WhatsApp directly? Do they use WhatsApp to enquire then pay in-store? How does WhatsApp fit into their buying journey for ${I(p)}?]

**Salary Cycle Buying Pattern:**
[How their purchasing decision and speed of decision changes across the month — specific to ${inputs.income_bracket?.replace(/_/g, ' ')} earners in ${cityKey.replace(/_/g, ' ')}]

---

## COMMUNICATION MATRIX

| Channel | Usage Level | Best Time | Content Type | Conversion Probability |
|---------|-------------|-----------|--------------|------------------------|
| WhatsApp | [High/Med/Low] | [WAT time] | [Format] | [High/Med/Low] |
| Instagram | [H/M/L] | [WAT time] | [Format] | [H/M/L] |
| Facebook | [H/M/L] | [WAT time] | [Format] | [H/M/L] |
| TikTok | [H/M/L] | [WAT time] | [Format] | [H/M/L] |
| Google Search | [H/M/L] | [When they search] | [Query type] | [H/M/L] |
| Word of Mouth | [H/M/L] | [When they refer] | [Trigger] | [H/M/L] |

**PRIORITY CHANNEL FOR ${B(p)}:** [The one channel to own for this specific ICP in ${cityKey.replace(/_/g, ' ')}]

---

## THE 6 TRUST TOUCHPOINTS

*[Nigerian buyers need an average of 4–6 trust touchpoints before purchasing. Map the exact journey for this ICP.]*

| Touchpoint | What They Experience | What They Need to Feel | How ${B(p)} Delivers This |
|------------|---------------------|------------------------|--------------------------|
| 1st (Awareness) | [Specific] | [Emotion] | [Specific action] |
| 2nd (Interest) | [Specific] | [Emotion] | [Specific action] |
| 3rd (Consideration) | [Specific] | [Emotion] | [Specific action] |
| 4th (Trust) | [Specific] | [Emotion] | [Specific action] |
| 5th (Desire) | [Specific] | [Emotion] | [Specific action] |
| 6th (Decision) | [Specific] | [Emotion/trigger] | [The final conversion action] |

---

## MESSAGING FRAMEWORK FOR THIS ICP

**Headlines that stop their scroll:**
1. [Headline 1 — triggers their specific fear]
2. [Headline 2 — speaks to their deepest desire]
3. [Headline 3 — community validation angle for ${cityKey.replace(/_/g, ' ')}]

**Their Exact Language (words they actually use):**
[When searching for ${B(p)}'s solution, this person types: "[exact search terms in Nigerian English]"]
[When describing their problem to a friend, they say: "[exact conversational phrase]"]
[When they find what they're looking for, they say: "[exact expression of satisfaction]"]

**Top 3 Objections & Handlers:**
1. "[Specific objection 1]" → [Specific handler for this ICP's FOBE pattern]
2. "[Specific objection 2]" → [Handler]
3. "[Specific objection 3]" → [Handler]

**The Closing Sentence:**
[The single sentence that converts this specific ICP — the framing that makes them say "okay, let's do this." Should reference their city and their specific transformation.]

---

## CONTENT THEY CONSUME AND SHARE

**Content types that attract this ICP:**
[Specific — not "educational content" but e.g. "before/after transformations shown by creators they recognise in ${cityKey.replace(/_/g, ' ')}"]

**What makes them share content:**
[The specific emotional trigger that causes this person to forward something to their WhatsApp contacts]

**Influencers they trust:**
[Not celebrity names — describe the TYPE of person this ICP takes recommendations from in ${I(p)}]

${inputs.include_anti_profile ? `
---

## ANTI-PROFILE (WHO NOT TO TARGET — SAVES BUDGET)

*[The 3 types of customers who look like the ICP but are not worth targeting]*

**Anti-Profile 1:** [Demographic description] — Why they don't convert: [Specific reason]
**Anti-Profile 2:** [Demographic description] — Why they don't convert: [Specific reason]
**Anti-Profile 3:** [Demographic description] — Why they don't convert: [Specific reason]

[For each anti-profile: how to exclude them in Facebook ads targeting / how to filter them out in WhatsApp conversations]
` : ''}

${depth ? `
---

## DEEP DIVE — ADVANCED ICP INTELLIGENCE

**Cognitive Biases at Play:**
[The 3 specific cognitive biases this ICP is most susceptible to in ${I(p)} buying decisions — with specific application for ${B(p)}]

**The Community Validation Map:**
[Specific Nigerian communities, WhatsApp groups, or social circles where this ICP validates purchases — Law 9 applied with surgical precision]

**Micro-Segmentation:**
[3 sub-segments within this ICP — each slightly different in motivation and messaging requirement]

**Lifetime Value Calculation:**
[If this ICP becomes a ${B(p)} customer: estimated LTV over 12 months + referral multiplier for ${cityKey.replace(/_/g, ' ')} social networks]
` : ''}

💡 CEREBRE TIP: [The single most surprising insight about this specific ICP type in ${cityKey.replace(/_/g, ' ')} — something that contradicts conventional wisdom about targeting ${I(p)} customers and that, once understood, changes how ${B(p)} markets completely]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 19 — LAUNCHPAD
// Laws: 1 (Awoof — launch value), 5 (Giant Promise), 10 (Urgency architecture)
// ─────────────────────────────────────────────────────────────

export function getLaunchPadPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)
  const weeks = parseInt(inputs.weeks_before_launch || '4', 10)

  const budgetLabels: Record<string, string> = {
    bootstrap_under_50k: 'Bootstrap (under ₦50,000)',
    '50k_200k':          '₦50,000–₦200,000',
    '200k_500k':         '₦200,000–₦500,000',
    '500k_1m':           '₦500,000–₦1,000,000',
    '1m_plus':           '₦1,000,000+',
  }

  return `
SPECIALIST ACTIVATED: Nigerian launch strategist — expert in creating anticipation, waitlists, and Day-1 revenue for new businesses and products in the African market. Laws 1, 5, 10 are PRIMARY.

━━━ LAUNCH BRIEF ━━━
Business:         ${B(p)} — ${I(p)} in ${C(p)}
What's Launching: ${inputs.what_are_you_launching}
Launch Date:      ${inputs.launch_date}
Weeks to Launch:  ${weeks} weeks
Launch Type:      ${inputs.launch_type?.replace(/_/g, ' ')}
Budget:           ${budgetLabels[inputs.launch_budget] || inputs.launch_budget}
Early Bird Offer: ${inputs.early_access_offer || 'First customers get exclusive founding-member benefits'}
Waitlist Goal:    ${inputs.waitlist_goal || 'Maximum pre-launch subscribers'}
Influencer Plan:  ${inputs.influencer_seeding ? 'Yes — seed with influencers pre-launch' : 'No — organic only'}
Risk Reversal:    ${inputs.risk_reversal || 'Full satisfaction guarantee'}
First Week Target: ${inputs.target_first_week_sales || 'Generate maximum Day-1 momentum'}
Launch Angle:     ${inputs.unique_launch_angle || 'Generate the strongest possible positioning angle'}
WhatsApp:         ${wa.display}
Trust Signal:     ${PR(p) || YR(p)}
Language:         ${L(p)}

━━━ LAUNCH INTELLIGENCE ━━━
The Nigerian launch formula: Launch-day revenue is determined by what you do in the weeks BEFORE, not on the day itself.

3 Things that determine Nigerian launch success:
1. **The Waitlist** — get 50+ WhatsApp numbers before Day 1. These are guaranteed Day-1 sales.
2. **The Awoof Stack** — the launch price MUST look outrageously good vs. the future price. Make early buyers feel like they got insider access.
3. **The Urgency Architecture** — multiple layers of real, honest scarcity. Early bird price. Limited units/slots. Founder pricing that ends on a specific date.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE LAUNCH PLAN — ${B(p).toUpperCase()}
## Launching: ${inputs.what_are_you_launching}
## Date: ${inputs.launch_date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## THE LAUNCH POSITIONING

**The Core Launch Message:**
[The single sentence that makes someone in ${C(p)} want to be among the first — combines Giant Promise + Awoof + Community belonging]

**The Launch Awoof Stack:**
Founder price: [X] | Normal future price: [Y] | What similar [product/service] costs elsewhere: [Z]
This saving: [Specific ₦ amount the early buyer gets to keep by acting now]

**The Urgency Architecture:**
Layer 1: Founder pricing — "First [X] customers only"
Layer 2: Time-based — "Founder price ends [specific date]"
Layer 3: Quantity — "After [X] units/slots, price goes to [Y]"
Layer 4: Experience — "Founders get [specific bonus] that later customers won't"

**The Launch Positioning vs. ${C(p)} Alternatives:**
[Awoof Law applied: what the market currently offers vs. what ${B(p)}'s launch brings — make the comparison undeniable]

---

## PRE-LAUNCH PLAYBOOK — WEEKS 1 TO ${weeks}

${Array.from({ length: weeks }, (_, i) => {
  const wk = i + 1
  const isFirst = wk === 1
  const isLast  = wk === weeks
  const isMid   = wk === Math.ceil(weeks / 2)

  return `
### WEEK ${wk} — ${isFirst ? 'FOUNDATION: BUILD INTRIGUE' : isLast ? 'LAUNCH WEEK: EXECUTE' : isMid ? 'MOMENTUM: REVEAL THE OFFER' : 'BUILD ANTICIPATION'}

**Primary Goal:** ${isFirst ? 'Start building the waitlist — get first 20 WhatsApp numbers' : isLast ? 'Maximum launch day revenue — convert waitlist to buyers' : 'Add ' + Math.ceil(40 / weeks) + '+ names to waitlist, start warming them up'}

**Key Activities This Week:**
${isFirst ? `
• Set up WhatsApp landing message — "We're launching something in ${C(p)} that [industry] businesses have been waiting for. Be the first to know: [wa.me/234${wa.link.replace('wa.me/234', '')}]"
• Create launch announcement post (mystery/intrigue angle — don't reveal full offer yet)
• Identify 10 people in ${C(p)} to personally reach out to as seed community
• Set up counting mechanism for waitlist (simple Google Form or WhatsApp business label)
` : isLast ? `
• Send launch-day WhatsApp broadcast to full waitlist at 8am
• Post launch announcement across all platforms simultaneously
• DM every single waitlist member personally (or use broadcast with personal feel)
• Monitor and respond to every enquiry within 30 minutes
• Evening launch recap post — "Here's what happened today"
• Close Day 1 with a count of sales and a reminder of when early-bird ends
` : `
• Add [specific number] to waitlist through [specific method]
• Send value content to existing waitlist (Law 2: build relationship before reveal)
• [Week-specific activity: influencer seed / testimonial feature / behind-the-scenes content]
• Increase urgency in messaging — deadline for founder pricing getting closer
`}

**Content Outputs This Week:**
[Specific posts, stories, broadcasts for this week — tied to the launch journey narrative]

**WhatsApp Broadcast ${wk > 1 ? '(send to current waitlist)' : '(recruitment broadcast to existing contacts)'}:**
[Complete broadcast message for this week — appropriate urgency level]

**Waitlist Goal by End of Week ${wk}:** [Specific number of WhatsApp contacts]
`}).join('\n')}

---

## LAUNCH DAY PLAYBOOK — ${inputs.launch_date}

**T-0 (8:00am WAT):**
☐ Send WhatsApp broadcast to full waitlist — "It's here."
☐ Post on all social platforms simultaneously
☐ Go live if applicable — live video is the highest-converting launch format for Nigerian audiences

**T+2 hours:**
☐ First update post — "Here's the response so far..."
☐ Personal DMs to top 20 most engaged waitlist members

**12:00pm:**
☐ Midday momentum update — show social proof accumulating
☐ WhatsApp stories throughout the day

**4:00pm:**
☐ Afternoon urgency post — "X spots/units remaining at founder price"

**8:00pm:**
☐ Evening broadcast — "Today closes in 4 hours"
☐ Day 1 recap — what happened, who joined, what's coming tomorrow

**The Launch Day Script (for live video or voice notes):**
[Word-for-word script following Law 7 — full sales letter formula adapted for live Nigerian audience]

---

## POST-LAUNCH PLAN (Days 2–14)

**Day 2:** [Second-day momentum — social proof from Day 1, urgency countdown]
**Days 3–5:** [Objection handling content + influencer features if applicable]
**Days 6–7:** [First close deadline — "Founder pricing ends Sunday midnight"]
**Week 2:** [Transition from launch energy to normal business — onboard new customers + ask for early testimonials]
**Week 2 Ask:** [Testimonial collection from first customers — these become the social proof for the next marketing phase]

---

## LAUNCH FINANCIAL PROJECTIONS

| Scenario | Waitlist Size | Conversion % | Day-1 Revenue | Week-1 Revenue |
|----------|---------------|--------------|---------------|----------------|
| Conservative | [X] | 20% | ₦[X] | ₦[X] |
| Realistic | [Y] | 35% | ₦[Y] | ₦[Y] |
| Optimistic | [Z] | 50% | ₦[Z] | ₦[Z] |

[Projections based on ${I(p)} launch benchmarks in ${C(p)} for ${budgetLabels[inputs.launch_budget]} budget launches]

---

## THE AWOOF AUDIT FOR THIS LAUNCH
[What it would cost to launch the same product/service using traditional methods (agency, events, paid media only) vs. what Cerebre Plus + this playbook delivers]

💡 CEREBRE TIP: [The Nigerian launch mistake that costs businesses 70% of their potential Day-1 revenue — and the counter-intuitive thing that the most successful ${C(p)} ${I(p)} launches in the last 2 years have all done differently from what launch "gurus" teach]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 20 — CAROUSEL SCRIPT BUILDER
// Laws: 3 (Trust — specificity in each slide), 5 (Giant Promise — the hook)
//         8 (Serve the lazy scroller — zero effort to get value)
// ─────────────────────────────────────────────────────────────

export function getCarouselScriptPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)
  const n  = parseInt(inputs.num_slides || '7', 10)

  const hookStyles: Record<string, string> = {
    fear_of_missing_out: 'Open with what they\'re LOSING by not knowing this. Create a gap they need to fill.',
    bold_statement:      'A statement so specific and bold that the only response is to swipe and find out more.',
    question_hook:       'A question that makes them realise they don\'t know the answer — and need to swipe to get it.',
    number_promise:      'Lead with a specific number: "7 mistakes", "5 things", "The 1 rule" — promises a specific payoff.',
    story_open:          'Open with a story that\'s already in progress — they swipe to find out what happened.',
    shocking_fact:       'A statistic or fact about Nigerian ${industry} that stops them — because it challenges what they thought they knew.',
  }

  const typeInstructions: Record<string, string> = {
    educational_tips:     'Each slide = one actionable tip. Slide headline = the tip summary. Body = explanation in 2-3 lines. Format: "Tip [N]: [Tip headline]"',
    listicle_top_mistakes: 'Each slide = one mistake. Slide headline = the mistake in their voice ("You\'re doing X"). Body = why it costs them + what to do instead.',
    case_study_before_after: 'Story arc: Problem → Situation → Discovery (${B(p)}) → Result. Each slide advances the story.',
    product_showcase_features: 'Each slide = one benefit (not feature). Headline = the transformation. Body = how this specific feature creates the transformation.',
    myth_vs_fact:         'Each slide: "MYTH: [Common belief]" vs "FACT: [Truth]". Challenging what Nigerian ${I(p)} buyers think they know.',
    step_by_step_process: 'Each slide = one step. Numbered. Clear. The last step always leads to WhatsApp.',
    comparison_old_vs_new: 'Left side: old way (painful, expensive, slow). Right side: ${B(p)} way (fast, valuable, guaranteed).',
    industry_insights:    'Data-led. Each slide = one statistic or trend with Nigerian market context. Position ${B(p)} as the insider.',
    customer_journey_story: 'Slide 1: The customer (name + city in Nigeria + problem). Slide 2-N: Their journey. Last slide: The result + CTA.',
    faq_answers:          'Each slide = one FAQ. Question as headline. Answer in 2-3 lines. Last FAQ always leads to WhatsApp for more.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian Instagram carousel architect. Laws 3 (Trust — specificity in every slide), 5 (Giant Promise — the hook), 8 (Zero friction — each slide must be understood without caption) are PRIMARY.

━━━ CAROUSEL BRIEF ━━━
Business:      ${B(p)} — ${I(p)} in ${C(p)}
Topic:         ${inputs.carousel_topic}
Type:          ${inputs.carousel_type?.replace(/_/g, ' ')}
Slides:        ${n}
Platform:      ${inputs.platform}
Goal:          ${inputs.carousel_goal?.replace(/_/g, ' ')}
Audience:      ${inputs.target_audience || T(p)}
Hook Style:    ${inputs.hook_style?.replace(/_/g, ' ')}
WhatsApp:      ${wa.display}
Trust Signal:  ${PR(p) || YR(p)}
Language:      ${L(p)}
Brand Colour:  ${p.brand_colour || '#E09818'}

Slide Format:  ${typeInstructions[inputs.carousel_type] || 'Standard carousel format'}
Hook Approach: ${hookStyles[inputs.hook_style] || 'Number-promise hook'}

━━━ THE NIGERIAN CAROUSEL FORMULA ━━━
Slide 1: The HOOK — must make them swipe before reading the caption. Test: cover the caption, does the slide alone make them swipe?
Slides 2–(N-2): Value delivery — each slide delivers on the hook's promise. Each slide must work standalone — someone jumping to Slide 4 should understand it.
Slide (N-1): Trust moment — ${PR(p) || `${B(p)}'s track record in ${C(p)}`}
Slide N: WhatsApp CTA — the ask. One action. ${wa.display} in large text.

Law 8 applied to carousels: Nigerian mobile users swipe fast. Each slide has 1.5 seconds to land before the next swipe. The headline is the slide. Everything else is bonus.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE ${n}-SLIDE CAROUSEL
## "${inputs.carousel_topic}" | ${B(p)} | ${C(p)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${inputs.include_cover_slide_brief ? `
**COVER SLIDE DESIGN BRIEF (for Highlights thumbnail):**
Background: [${p.brand_colour || '#E09818'} accent or complementary dark background]
Text: [The carousel hook in 3–4 bold words — what appears in Highlights]
Icon/Graphic: [Simple visual element that telegraphs the topic]
Brand mark: "${B(p)}" — bottom right
` : ''}

${Array.from({ length: n }, (_, i) => {
  const slideNum = i + 1
  const isHook  = slideNum === 1
  const isTrust = slideNum === n - 1
  const isCTA   = slideNum === n
  const slideType = isHook ? 'HOOK SLIDE — THE MOST IMPORTANT' : isTrust ? 'TRUST SLIDE' : isCTA ? 'CTA SLIDE' : `VALUE SLIDE ${slideNum - 1} OF ${n - 2}`

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**SLIDE ${slideNum} of ${n} — ${slideType}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${isHook ? `
**HEADLINE (big, bold — the only thing they need to read):**
[Hook using "${hookStyles[inputs.hook_style]}" approach — specific, scroll-stopping, in ${L(p)}]
[Must make the ${C(p)} ${I(p)} audience NEED to swipe. Test: if this were an Instagram post headline alone, would they stop?]

**SUBLINE (smaller — optional but strong if used):**
[One line that expands the hook — adds urgency or specificity]

**Visual Direction:**
[Specific: background colour/image, text placement, emphasis technique — designed for ${p.brand_colour || '#E09818'} brand]

**Swipe Invitation (small text, bottom):**
"Swipe to see all ${n}" or "Swipe →" — always present on Slide 1
` : isTrust ? `
**HEADLINE:**
[Trust statement — specific, verifiable. "${PR(p) || `${YR(p) || 'In business for X years'}`}" — in large text]

**BODY (2 lines max):**
[Second trust signal — number of ${C(p)} clients, a result, a named outcome]
[NOT "we're the best" — specific and verifiable]

**Visual Direction:**
[Results graphic / number in large text / client city collage — trust-appropriate visual]
` : isCTA ? `
**HEADLINE:**
[Giant Promise — the specific result they can get by contacting ${B(p)}]

**CTA LINE:**
"Send me a WhatsApp message right now:"
"${wa.display}"

**VISUAL DIRECTION:**
[Phone number in LARGE text — readable without zooming]
[WhatsApp icon prominent]
[Brand: "${B(p)}" | "${C(p)}"]

${inputs.include_design_direction ? `
**QR CODE SUGGESTION:** [Include a WhatsApp QR code linking to ${wa.link} for print/share contexts]
` : ''}
` : `
**HEADLINE (4–6 words max — the main point of this slide):**
[Specific slide headline — follows the "${inputs.carousel_type?.replace(/_/g, ' ')}" format for slide ${slideNum - 1}]
[Law 3: Must be specific — not "great results" but "saves ₦X" or "gets [specific outcome]"]

**BODY (2–3 lines — supporting detail):**
[${inputs.carousel_type === 'educational_tips' ? 'Actionable explanation + Nigerian context' : inputs.carousel_type === 'myth_vs_fact' ? 'MYTH: [common belief] / FACT: [truth backed by specific data]' : 'Main content for this slide — concise, specific, valuable'}]
[Reference ${C(p)} or ${I(p)} context where natural]

**VISUAL DIRECTION:**
[Specific visual for this slide — what image/graphic/layout makes this point land visually]
[Colour: ${p.brand_colour || '#E09818'} accent — how to use]

**Micro-CTA (optional engagement prompt):**
${slideNum % 2 === 0 ? `"Save this slide" or "Share with a business owner you know"` : `"Which of these surprises you? Comment below"`}
`}
`}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CAPTION FOR THE CAROUSEL POST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${inputs.include_caption_for_post ? `
[COMPLETE CAPTION — immediately copy-paste ready]

**First line (the hook — shown before "more"):**
[Opens with the carousel topic hook — same energy as Slide 1 but slightly different angle]

**Body (150–250 words):**
[Expands the carousel theme — what they'll get from swiping]
[Mentions ${B(p)} and ${C(p)} naturally]
[Trust signal: ${PR(p) || YR(p)}]
[Law 9 community validation: "Business owners in ${C(p)} who..."]

**CTA:**
"Save this for the next time [problem they face]. And if you want us to [relevant offer] specifically for your business, send me a WhatsApp message: ${wa.display}"

**Hashtags (${inputs.platform === 'instagram' ? '20-25' : inputs.platform === 'facebook' ? '5' : '3-5'} total):**
[Platform-optimised hashtag set: broad Nigerian + ${I(p)}-specific + ${C(p)}-location + topic-specific]
` : '[Caption generation not requested for this carousel]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## REPURPOSING GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Turn this ${n}-slide carousel into 5 more pieces of content:
1. [Reel idea using carousel content]
2. [WhatsApp broadcast using the best slide as the hook]
3. [Twitter/X thread — each slide = one tweet]
4. [LinkedIn article — expand the carousel topic to 500 words]
5. [Instagram Story series — one story per slide over 7 days]

**Best Posting Day and Time for ${inputs.platform} in ${C(p)}:**
[Specific WAT day/time for maximum carousel reach from Nigerian ${I(p)} audiences]

💡 CEREBRE TIP: [The carousel strategy that Nigerian ${I(p)} businesses consistently under-use — the slide position, content type, or posting pattern that drives 3x more saves and follows than standard carousels from ${C(p)} businesses in this industry]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// MASTER DISPATCHER — Tools 11–20
// ─────────────────────────────────────────────────────────────

export function getToolPrompt11to20(
  toolId:  string,
  inputs:  Record<string, any>,
  profile: ProfileContext,
): string | null {
  switch (toolId) {
    case 'story-planner':             return getStoryPlannerPrompt(inputs, profile)
    case 'whatsapp-campaign-builder': return getWhatsAppCampaignPrompt(inputs, profile)
    case 'follow-up-sequencer':       return getFollowUpSequencerPrompt(inputs, profile)
    case 'welcome-message-craft':     return getWelcomeMessagePrompt(inputs, profile)
    case 'promo-blast':               return getPromoBlastPrompt(inputs, profile)
    case 'strategy-brain':            return getStrategyBrainPrompt(inputs, profile)
    case 'campaign-clock':            return getCampaignClockPrompt(inputs, profile)
    case 'audience-profiler':         return getAudienceProfilerPrompt(inputs, profile)
    case 'launch-pad':                return getLaunchPadPrompt(inputs, profile)
    case 'carousel-script-builder':   return getCarouselScriptPrompt(inputs, profile)
    default: return null
  }
}
