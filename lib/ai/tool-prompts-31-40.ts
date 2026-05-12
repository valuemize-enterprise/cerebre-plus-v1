// ═══════════════════════════════════════════════════════════════
// /lib/ai/tool-prompts-31-40.ts
// Complete AI prompts for Tools 31–40 (final batch).
// SERVER-SIDE ONLY.
// ═══════════════════════════════════════════════════════════════

import type { ProfileContext } from './master-system-prompt'

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const B  = (p: ProfileContext) => p.business_name       || 'the business'
const C  = (p: ProfileContext) => p.city                || 'Nigeria'
const I  = (p: ProfileContext) => p.industry            || 'your industry'
const WA = (p: ProfileContext) => {
  const raw = p.whatsapp || '08012345678'
  const d   = raw.replace(/\D/g, '').replace(/^0/, '')
  return { display: raw, link: `wa.me/234${d}` }
}
const T   = (p: ProfileContext) => p.target_customer    || 'your target customers'
const A   = (p: ProfileContext) => p.unique_advantage   || 'quality and reliability'
const V   = (p: ProfileContext) => p.brand_voice        || 'professional'
const L   = (p: ProfileContext) => p.language_preference|| 'Nigerian English'
const PR  = (p: ProfileContext) => p.social_proof       || ''
const YR  = (p: ProfileContext) => p.years_in_business
  ? `${p.years_in_business} year${p.years_in_business > 1 ? 's' : ''} in business`
  : ''
const DESC  = (p: ProfileContext) => p.description      || ''
const PRICE = (p: ProfileContext) => p.price_range      || ''

// ─────────────────────────────────────────────────────────────
// TOOL 31 — SALES SCRIPT WRITER
// Laws: 3 (Trust BEFORE product), 6 (Story), 7 (Sales Letter Formula), 8 (Personal direct)
// Special: Trust in first 3 exchanges before ANY offer is made
// ─────────────────────────────────────────────────────────────

export function getSalesScriptWriterPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const scriptTypeLabels: Record<string, string> = {
    whatsapp_conversation: 'WhatsApp conversation script',
    phone_call:            'Phone / video call script',
    in_person_meeting:     'In-person meeting script',
    discovery_call:        'Discovery / qualification call',
    presentation_pitch:    'Presentation / pitch script',
    closing_call:          'Closing call script',
    demo_walkthrough:      'Demo / walkthrough script',
    follow_up_call:        'Follow-up call script',
  }

  const objectionPlaybook: Record<string, { realReason: string; kill: string }> = {
    price_too_high: {
      realReason: 'They don\'t fully see the value yet. "Too expensive" almost always means "I don\'t understand why this is worth it."',
      kill: 'Rebuild value. Awoof Stack. Show what NOT solving this costs. "If this solved [problem] and gave you [result], would [price] still feel expensive?"',
    },
    think_about_it: {
      realReason: 'Polite Nigerian way of saying no — OR they genuinely need more info OR there\'s a decision partner involved.',
      kill: 'Acknowledge. Add urgency. "Of course — what specifically are you weighing up? Because I want to make sure you have everything you need to decide."',
    },
    comparing_options: {
      realReason: 'Shopping for the best deal. Not disloyal — rational.',
      kill: 'Differentiate on value, not price. "What are the top 2 things you\'re comparing? Because [specific differentiator] is something most providers in ${C(p)} don\'t offer."',
    },
    not_sure_of_quality_fobe: {
      realReason: 'FOBE — Fear of Being Cheated. They\'ve been burned before. This is not about the product.',
      kill: 'Trust signals: specific numbers + specific city + specific result + guarantee. "I understand — here\'s what I\'d want to know if I were in your position: [trust stack]"',
    },
    budget_tight_now: {
      realReason: 'Real cash flow issue OR price sensitivity dressed as timing.',
      kill: 'Payment plan + cost of delay. "What does [the problem] cost you per month right now? Because if it\'s more than [payment option], waiting is the more expensive choice."',
    },
    talk_to_partner: {
      realReason: 'Decision partner exists — need their buy-in. Sometimes a stall.',
      kill: 'Offer to speak with the partner directly. "Of course — what would help them feel confident? I\'m happy to send something they can review, or we can schedule a brief call with both of you."',
    },
    already_using_competitor: {
      realReason: 'They have a current solution. Switching cost perceived as high.',
      kill: 'Respect it. "That makes sense. What would have to be true for you to consider switching? I\'m not asking you to — I\'m asking what would make it worth it."',
    },
    not_right_time: {
      realReason: 'Real life timing OR classic procrastination.',
      kill: 'Bridge the gap. "I hear you — when does right now start? Because the [specific thing] we\'re offering only stays at [price] until [date], and I\'d hate for you to pay more for the same result."',
    },
  }

  const topObj = inputs.top_objection || 'price_too_high'
  const pb     = objectionPlaybook[topObj] || objectionPlaybook['price_too_high']

  return `
SPECIALIST ACTIVATED: Nigerian sales master — trained in Cerebre Plus's complete Sales Letter Formula applied to live conversation. Laws 3 (Trust FIRST), 6 (Story), 7 (Formula), 8 (Personal/direct) are PRIMARY.

━━━ SCRIPT BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Script Type:       ${scriptTypeLabels[inputs.script_type] || inputs.script_type?.replace(/_/g, ' ')}
Product/Service:   ${inputs.product_service || DESC(p)}
Lead Temperature:  ${inputs.lead_temperature || 'warm'}
Primary Objection: ${topObj.replace(/_/g, ' ')}
Desired Outcome:   ${inputs.desired_outcome?.replace(/_/g, ' ')}
Sale Value:        ${inputs.typical_sale_value || PRICE(p)}
Awoof Comparison:  ${inputs.awoof_comparison || 'Build from industry context'}
Previous Interaction: ${inputs.previous_interaction || 'None / first contact'}
All 5 Objections:  ${inputs.include_all_five_objections ? 'Yes' : 'No'}
All 4 Closes:      ${inputs.include_all_four_closes ? 'Yes' : 'No'}
WhatsApp:          ${wa.display}
Trust Signal:      ${PR(p) || YR(p)}
Language:          ${L(p)}

━━━ THE AKIN ALABI SALES CONVERSATION RULES ━━━
1. TRUST BEFORE PRODUCT: In Nigerian sales, you must establish trust in the first 3 exchanges before ANY mention of what you're selling. The script must earn the right to present before presenting.
2. DISCOVERY BEFORE PROPOSAL: Ask 3–4 questions that make the prospect feel deeply understood. Only then does the presentation begin.
3. BENEFITS NOT FEATURES: The presentation section names outcomes the prospect gets, not specifications of the product.
4. STORY BRIDGE: Use a customer story from ${C(p)} to bridge from their pain to your solution — before the close.
5. PERSONAL "I" VOICE: This is ${B(p)} speaking — not "our team" or "we offer" — "I" and "my".

━━━ OBJECTION DIAGNOSTIC — ${topObj.replace(/_/g, ' ').toUpperCase()} ━━━
Real reason: ${pb.realReason}
Kill strategy: ${pb.kill}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE SALES SCRIPT — ${B(p).toUpperCase()}
## Type: ${scriptTypeLabels[inputs.script_type]}
## Temperature: ${inputs.lead_temperature || 'Warm lead'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## SECTION 1 — THE PATTERN INTERRUPT OPENING
*[NOT "How can I help you?" — that hands control to the prospect. Use authority from word one.]*

${inputs.script_type === 'whatsapp_conversation' ? `
**Opening Message (WhatsApp — arrives after their initial contact):**
"[Pattern interrupt opening — establishes expertise and curiosity before asking about their need]

Not: 'How can I help you?'
YES: '[Observation or authority statement that makes them want to continue the conversation]'

This opening passes the Nigerian trust test: they feel they've reached someone who actually knows what they're talking about — before you've even asked about their situation."
` : `
**Opening Line (Spoken — not 'How can I help you today?'):**
"[Pattern interrupt that establishes authority and creates instant engagement]
[Followed by: one warm human statement that makes them feel this is a person, not a sales pitch]"
`}

**Why this works for ${C(p)} buyers:**
[The psychological mechanism — why this opening disarms FOBE and builds immediate credibility]

---

## SECTION 2 — THE TRUST BUILDERS (First 3 Exchanges)
*[These must happen BEFORE any mention of the product. Nigerian trust is earned, not assumed.]*

**Exchange 1 — Understand Their World:**
You: "[Question that shows deep understanding of their industry/situation — not 'what are you looking for?' but a specific question about their specific ${I(p)} challenge]"

If they answer: [Exact response that deepens the conversation and signals you've heard them]
If they deflect: [How to gently redirect back to the discovery]

**Exchange 2 — Show You Know Their Problem:**
You: "[A follow-up that references something from Exchange 1 and adds insight — 'A lot of ${I(p)} businesses in ${C(p)} that I work with tell me that [specific challenge]. Is that part of what you're dealing with?']"

Trust signal drop: [Natural mention of ${PR(p) || YR(p)} — one sentence, not a speech]

**Exchange 3 — Create the Turning Point:**
You: "[The question or statement that shifts from their current painful situation to the possibility of a better one. 'What would it mean for [their business] if you could [specific outcome]?']"

---

## SECTION 3 — THE DISCOVERY QUESTIONS
*[4–5 questions that make them feel deeply understood. Good discovery makes the close easier.]*

**Primary Discovery Questions (ask in this order):**
Q1: "[Current situation — where are they now?]"
Q2: "[Desired outcome — where do they want to be?]"
Q3: "[What's stopped them so far? — surfaces the real obstacle]"
Q4: "[Timeline and urgency — creates natural pressure without forcing]"
Q5 (optional): "[Decision process — who else is involved?]"

**How to handle each answer:**
[For Q1] If they say [X]: "That's interesting — [follow-up that shows you understand ${I(p)}]"
[For Q2] If they say [X]: "So what you're really saying is [reframe as emotional outcome, not feature]"
[For Q3] If they say [X]: "That's exactly why I designed [solution] the way I did — because [connection to their stated obstacle]"

---

## SECTION 4 — THE BENEFIT-LED PRESENTATION
*[Law 7 condensed. Benefits FIRST — always tied back to what they said in discovery.]*

**The Bridge (Law 6 — Story):**
"[Short story of a ${I(p)} business in ${C(p)} who had the exact same situation as this prospect. 3 sentences: their problem → their decision → their result. End with: 'That's what I want to show you is possible for [their business name if known].']"

**The Solution Introduction:**
"Based on what you've told me, here's what I'd recommend and why it specifically fits your situation..."

**Benefits Presentation (outcome-led):**
[For each key benefit — tied to something the prospect said in discovery:]
"You mentioned [X from discovery] — with [solution], you get [specific outcome that addresses exactly X]."
[Continue for 3–5 benefits — never features, always outcomes]

**The Awoof Moment:**
"What most ${I(p)} businesses in ${C(p)} don't realise is that [normal cost of solving this problem]. What I'm offering gives you [same or better outcome] for [price]. The question isn't whether you can afford it — the question is whether [the result] is worth it."

**The Trust Stack:**
"${PR(p) || YR(p) || `${B(p)} has been doing this in ${C(p)}`}. [Specific result for a similar client]."

---

## SECTION 5 — THE 5 OBJECTION HANDLERS
*[Word-for-word scripts for each major Nigerian objection]*

${inputs.include_all_five_objections ? Object.entries(objectionPlaybook).map(([obj, data]) => `
### "${obj.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}"

**Real reason:** ${data.realReason}
**Kill strategy:** ${data.kill}

**Word-for-word script:**
You: "[Acknowledge without agreeing. Then redirect.] [Specific handler for ${I(p)} businesses in ${C(p)}]"
[Pause instruction]
Them: [Most likely response]
You: "[The follow-up that converts the objection into a question you can answer]"

**The close attempt after this objection:**
"[The specific close that works after this objection has been addressed]"

**If they pushback again:**
"[The graceful redirect that plants the seed for later without burning the bridge]"
`).join('\n') : `
### "${topObj.replace(/_/g, ' ')}" — Primary Objection

**Real reason:** ${pb.realReason}
**Kill strategy:** ${pb.kill}

**Word-for-word script:**
You: "[Acknowledge without agreeing — 'I hear you completely. Let me ask you something...']"
"[Reframe using ${pb.kill} — full, word-for-word response]"
[Pause — let them respond. Never answer your own question.]
Them: [Most likely response — 2 variants]
You (variant A): "[If they engage positively — advance to the close]"
You (variant B): "[If they resist — the gentle pivot that opens new ground]"
`}

---

## SECTION 6 — THE 4 CLOSING APPROACHES
*[Multiple closing techniques — use based on the conversation's momentum]*

${inputs.include_all_four_closes ? `
### CLOSE 1 — THE DIRECT ASK (Most effective for hot leads in ${C(p)})
"[Direct question that assumes they want the result — not "do you want to proceed" but "shall we get started?" or "which option works better for you — X or Y?"]"

### CLOSE 2 — THE URGENCY CLOSE (For warm leads who keep delaying)
"[Real urgency — specific deadline or capacity limit. 'I want to be transparent with you — [specific real constraint]. If you want [result] by [date], we need to start no later than [date]. Can we confirm that today?']"

### CLOSE 3 — THE FEAR CLOSE (For those who need to feel the cost of waiting)
"[Make the cost of not acting concrete. 'Every [week/month] without [solution] means [specific cost]. That's ₦[X] you won't get back. How much longer can you afford that?'] — then immediate easy action: 'The simplest next step is just to send me [simple action] now.'"

### CLOSE 4 — THE ASSUMPTIVE CLOSE (For prospects who are clearly interested but not initiating)
"[Act as though the decision is already made — move to logistics. 'So what I'll do is send you [next step] right now, and we'll schedule the kickoff for [timeframe]. Does [day] or [day] work better for you?']"

**Choosing the right close:**
- Direct Ask: Use when they've agreed the solution is right
- Urgency Close: Use after the 3rd follow-up when they keep delaying
- Fear Close: Use when they minimise the problem
- Assumptive Close: Use when they're clearly interested but passive
` : `
### THE PRIMARY CLOSE — For ${inputs.desired_outcome?.replace(/_/g, ' ')}

[Full closing script tailored to getting the desired outcome]
"[The specific closing line — direct, confident, single action]"
[If yes — immediate next step]
[If no — graceful exit that plants the seed]
`}

---

## SECTION 7 — THE GRACEFUL EXIT AND FUTURE SEED

*[If they say no — never burn the bridge. Nigerian business is relationship-based.]*

"I completely understand — and I respect your decision. Can I just say one last thing? [One sentence about what will change in the future that makes this relevant again.] Whenever the time is right, my number is always ${wa.display}. This conversation doesn't expire."

**The post-call WhatsApp follow-up (send within 30 minutes):**
"[Warm summary of the conversation — references something personal they shared — no selling — ends with: 'The door is always open: ${wa.display}']"

---

${inputs.include_voice_note_script ? `
## VOICE NOTE VERSION (for WhatsApp — highest conversion in Nigerian market)

*[Voice notes convert 3x better than text in Nigerian B2B sales. Write the script for a 90-second voice note.]*

[Full voice note script — conversational, warm, personal — designed for the human voice, not text]
` : ''}

---

## QUICK REFERENCE — SCRIPT AT A GLANCE

| Stage | Duration | Key Action |
|-------|----------|------------|
| Pattern interrupt open | 0–30 sec | Establish authority — not "how can I help?" |
| Trust builders (3 exchanges) | 1–3 min | Build trust BEFORE mentioning product |
| Discovery (4 questions) | 3–5 min | Make them feel deeply understood |
| Benefit presentation | 3–5 min | Outcomes tied to their discovery answers |
| Story bridge (Law 6) | 1 min | Nigerian ${I(p)} story — 3 sentences |
| Awoof moment | 30 sec | Value stack + price reveal |
| Objection handler | 1–2 min | Acknowledge → reframe → close |
| Close | 30 sec | One specific action |

💡 CEREBRE TIP: [The Nigerian sales conversation insight that turns "let me think about it" into "okay, let's proceed" — the specific question or reframe that works for ${I(p)} buyers in ${C(p)} that most salespeople never ask]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 32 — TESTIMONIAL COLLECTOR
// Laws: 3 (Trust — the testimonial IS the proof), 9 (Community validation)
// ─────────────────────────────────────────────────────────────

export function getTestimonialCollectorPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  return `
SPECIALIST ACTIVATED: Nigerian social proof engineer — master of extracting specific, FOBE-busting testimonials from Nigerian customers. Laws 3 (Trust) and 9 (Community) are PRIMARY.

━━━ BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Collection Method: ${inputs.collection_method?.replace(/_/g, ' ')}
Timing:            ${inputs.relationship_stage?.replace(/_/g, ' ')}
Service Delivered: ${inputs.product_or_service_delivered}
Result Achieved:   ${inputs.result_achieved || 'To be captured in the testimonial'}
Goal:              ${inputs.testimonial_goal?.replace(/_/g, ' ')}
Incentive:         ${inputs.incentive || 'None'}
WhatsApp:          ${wa.display}
Language:          ${L(p)}

━━━ NIGERIAN TESTIMONIAL INTELLIGENCE ━━━
Generic testimonials KILL trust in Nigeria. "Great service, very professional" = invisible. 
Specific testimonials BUILD trust: "Adaeze's skincare helped me get 47 new customers in 3 weeks from just Instagram — I used to get 3 per month."

The FOBE-busting question: Nigerian buyers reading testimonials are asking "was this person like me? Did they have the same doubts I have? And it still worked?" The testimonial must answer these implicit questions.

The 5 elements of a trust-converting Nigerian testimonial:
1. SPECIFIC RESULT with a number ("47 new customers" not "many customers")
2. TIMEFRAME ("in 3 weeks" not "quickly")
3. CITY OR LOCATION (makes it community-specific — Law 9)
4. THE DOUBT THEY HAD BEFORE ("I wasn't sure at first because...")
5. THE COMPARISON ("before I used ${B(p)}, I was spending ₦X on agencies")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE TESTIMONIAL COLLECTION SYSTEM — ${B(p).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. THE COLLECTION REQUEST MESSAGES

${inputs.collection_method === 'all_channels' ? `
Generate a complete request message for each channel:

**WhatsApp Request:**
[Complete, natural WhatsApp message — personal "I" voice — makes giving a testimonial feel easy and generous, not like a chore]
[Includes: specific what to say, where to put it, why it matters]

**In-Person Request (script for face-to-face):**
[Word-for-word — what to say, when to say it, how to make it feel natural and not awkward]

**Google Review Request:**
[Direct Google Maps review request — include the link in the message — explain how to post in 2 simple steps for Nigerian users unfamiliar with the process]

**Email Request:**
[Subject line + email body — warmer, more personal than standard email — reads like it came from a real person]
` : `
**${inputs.collection_method?.replace(/_/g, ' ')} Request:**
[COMPLETE REQUEST MESSAGE — immediately usable]

Opening: [Personal — acknowledges their specific experience with ${B(p)}]
The ask: [Frame it as doing a favour — "Your experience could help someone else in ${C(p)} who is unsure right now"]
What to say: [Brief direction — make it easy]
Why now: [Timing justification — while the experience is fresh]
Incentive: ${inputs.incentive ? `"As a thank you: ${inputs.incentive}"` : '[No incentive — make the ask pure and genuine]'}
`}

---

## 2. THE 5 QUESTIONS THAT UNLOCK SPECIFICITY

*[These questions extract FOBE-busting, specific, community-validated testimonials — not generic praise]*

**Question 1 — The Before State:**
"Before you used ${B(p)}, what was the situation you were trying to solve? Describe it as you experienced it."
[Why this works: Makes the testimonial relatable to other ${I(p)} businesses in ${C(p)} with the same problem]

**Question 2 — The Specific Result:**
"What specific result did you get? Can you give me a number — even an approximate one?"
[Why this works: Specificity kills FOBE. "47 new enquiries" is 10x more credible than "many new enquiries"]

**Question 3 — The Timeframe:**
"How quickly did you see this result?"
[Why this works: Timeframe + result = the Giant Promise formula (Law 5)]

**Question 4 — THE FOBE-BUSTING QUESTION (Most Important):**
"Before you worked with ${B(p)}, was there anything you were unsure or nervous about? And how did that turn out?"
[Why this is the most important question: It captures the pre-purchase doubt that current prospects have. When a potential customer reads "I was scared to spend ₦50,000 but now I've made ₦400,000 from one campaign" — they feel understood and reassured simultaneously]

**Question 5 — The Recommendation:**
"Who specifically would you recommend ${B(p)} to? What type of ${I(p)} business in ${C(p)} would get the most from working with us?"
[Why this works: Narrows the community validation — makes it hyper-relevant to the specific reader of the testimonial]

---

## 3. THE NON-RESPONDER FOLLOW-UP SEQUENCE

*[Most people mean to give testimonials but forget. This retrieves them without being pushy.]*

**Follow-up 1 (3 days after initial request — if no response):**
[Light reminder — references what they said they loved — no pressure — new angle: "This is for someone just like you who's hesitating"]

**Follow-up 2 (7 days after — if still no response):**
[Even lighter — "5 minutes is all it takes — here's the simplest version: just tell me in one sentence what changed for your business"]

**Follow-up 3 (14 days — final):**
[Graceful acknowledgement that they're busy — "I'll leave this here — whenever you have 2 minutes, it would mean a lot" — removes all pressure]

---

## 4. SOCIAL MEDIA SHARING TEMPLATES

*[Once collected — turn each testimonial into 3 content pieces]*

**Instagram Post Format:**
[Quote card format — which parts of the testimonial to highlight — how to present it visually]
Caption: [Complete caption using the testimonial — Law 9: includes the customer's city]
Hashtags: [Testimonial-specific hashtags for ${I(p)} in ${C(p)}]

**WhatsApp Status Format:**
[Single-image or text card — testimonial condensed to 50 words — most powerful elements front-loaded]

**Sales Message Embed:**
[How to embed testimonials into WhatsApp sales conversations naturally — not "here's a testimonial" but woven into the pitch]

---

${inputs.include_fobe_busting_question ? `
## 5. THE ADVANCED FOBE-BUSTING TESTIMONIAL STRUCTURE

*[Template for formatting collected testimonials into FOBE-destroying social proof]*

**The Perfect Nigerian Testimonial Formula:**

"[Name, business type, city] — '[THE DOUBT: I wasn't sure if this would work for my [industry] business in [city] because [specific fear].] [THE RESULT: But in [timeframe], I got [specific number + outcome].] [THE COMPARISON: Before I used ${B(p)}, I was [old way — cost or struggle]. Now [new reality].] [THE RECOMMENDATION: If you're a [specific type of business] in [city], this is the one thing I'd tell you not to skip.']"

**Applying this to ${inputs.result_achieved || 'your best customer result'}:**
[Fill in the template with the actual result provided]

**Where to use this testimonial:**
- Instagram post (standalone)
- Facebook ad social proof section
- WhatsApp pitch message (embedded naturally)
- Website trust section
- Proposal document (Law 3 trust builder)
` : ''}

💡 CEREBRE TIP: [The testimonial collection insight that doubles the response rate for Nigerian ${I(p)} businesses — the timing, phrasing, or method that makes customers who normally wouldn't bother actually send you specific, detailed testimonials]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 33 — REVIEW REQUESTOR
// Laws: 3 (Trust — reviews ARE the trust signals), 9 (Community), 10 (Velocity urgency)
// ─────────────────────────────────────────────────────────────

export function getReviewRequestorPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  return `
SPECIALIST ACTIVATED: Nigerian online reputation builder. Laws 3 (Trust via reviews), 9 (Community validation), 10 (Urgency — build velocity) are PRIMARY.

━━━ BRIEF ━━━
Business:        ${B(p)} — ${I(p)} in ${C(p)}
Platform:        ${inputs.review_platform?.replace(/_/g, ' ')}
Experience:      ${inputs.what_they_experienced}
Timing:          ${inputs.timing?.replace(/_/g, ' ')}
Request Channel: ${inputs.request_channel?.replace(/_/g, ' ')}
Current Rating:  ${inputs.current_rating || 'Not specified'}
Review Count:    ${inputs.current_review_count || 'Not specified'}
Competitors:     ${inputs.competitor_advantage || 'Not specified'}
WhatsApp:        ${wa.display}
Language:        ${L(p)}

━━━ NIGERIAN REVIEW INTELLIGENCE ━━━
Nigerian Google Maps users trust businesses with 20+ reviews more than those with 5 reviews — regardless of rating. Velocity matters as much as quality.

The Nigerian review psychology:
- A 4.7 rating with 200 reviews beats 5.0 with 3 reviews — volume = legitimacy
- Negative reviews with good responses often INCREASE trust ("they actually responded and fixed it")
- Reviews mentioning the city/area ("great event planner in Lagos Island") rank better in local search
- Most Nigerian businesses never ask for reviews — this alone gives ${B(p)} a competitive advantage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE REVIEW REQUEST SYSTEM — ${B(p).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. THE MAIN REVIEW REQUEST

**${inputs.request_channel?.replace(/_/g, ' ')} — Sent ${inputs.timing?.replace(/_/g, ' ')} delivery:**

[COMPLETE MESSAGE — personalised, natural, immediately sendable in ${L(p)}]

Opening: [Personal — references their specific experience with ${B(p)}]
The ask: [Frame as community service — "Your review helps other [business type] owners in ${C(p)} make a confident decision"]
How to do it: [Step-by-step for Nigerian users — especially Google Maps, which many haven't reviewed on before]
${inputs.review_platform === 'google_maps_business' ? `Google Maps link: [INSERT GOOGLE MAPS REVIEW LINK — remind them to include their city/area]` : ''}
Timing note: [Why now is the perfect moment to leave a review]

**The Nigerian-specific instruction for Google Maps:**
"To leave your review: [Open Google Maps → Search '${B(p)}' → Scroll to reviews → Tap 'Write a review' → Give stars + tell your story]"
[Why this level of detail matters: Nigerian users on Android need this walkthrough — don't assume Google Maps familiarity]

---

## 2. PLATFORM-SPECIFIC STRATEGY

${inputs.review_platform === 'all_platforms' ? `
**GOOGLE MAPS (Priority 1 — highest SEO impact):**
[Full request + step-by-step instructions]
[Include: "Mention '${B(p)} in ${C(p)}' in your review — it helps people searching for [service] in [city] find us"]

**INSTAGRAM (Priority 2 — highest visibility):**
[DM request to happy customers — ask them to DM you a testimonial OR mention @${B(p).toLowerCase().replace(/\s/g, '')} in a story]
[Repurpose: use for ads, website, WhatsApp broadcast]

**FACEBOOK PAGE (Priority 3 — older demographic trust):**
[Page recommendation request — include link to ${B(p)} Facebook page]

**WHATSAPP GROUP/COMMUNITY:**
[Request for positive word-of-mouth in their networks — the Aso-Ebi principle: community sharing]
` : `
**${inputs.review_platform?.replace(/_/g, ' ')} Strategy:**
[Full platform-specific approach — how to get reviews on this specific platform for Nigerian businesses]
[Step-by-step instructions for customers who may not be familiar with this platform's review system]
[What the review should mention for maximum trust impact: city, specific service, specific result]
`}

---

${inputs.include_positive_response_scripts ? `
## 3. HOW TO RESPOND TO REVIEWS

**Responding to 5-star reviews:**
[Template response that: acknowledges them by name, references their specific experience, adds a trust-building detail, ends with invitation to return — takes 30 seconds to personalise]

Example format:
"Thank you [Name]! We're so glad [specific thing they mentioned] worked out for you. Your support means everything to ${B(p)} — it's customers like you in ${C(p)} that keep us going. Looking forward to serving you again!"

**Responding to reviews that mention specific outcomes:**
[Special template for reviews with specific results — amplifies the social proof with a response that acknowledges the result without sounding like an ad]
` : ''}

${inputs.include_negative_response_scripts ? `
**Responding to negative/1-2 star reviews:**
[Complete, professional response template]

THE NIGERIAN RULE FOR NEGATIVE REVIEW RESPONSES:
A well-handled negative review converts more prospects than a 5-star with no response. The public watching your response is deciding whether to trust you — your response to a complaint is the real test.

**Response formula:**
1. Acknowledge without defensive language (NEVER "That's not what happened")
2. Take responsibility for the experience (even if technically disputable)
3. Move it to private: "I'd like to make this right — please WhatsApp me directly: ${wa.display}"
4. Show what changed: "We've since [specific improvement] to ensure this doesn't happen again"

[Full word-for-word template for common negative review types in ${I(p)}]
` : ''}

---

${inputs.include_velocity_strategy ? `
## 4. REVIEW VELOCITY STRATEGY

*[How to build from current to 50+ reviews in 90 days for ${B(p)}]*

**The "Past 12 Months" Campaign:**
Week 1: Send to 10 happiest current clients — personalised WhatsApp
Week 2: Send to best clients from last 6 months — use the soft template
Week 3: Send to all past clients ever — the broadcast version
Ongoing: Send to every new client 3–7 days after service completion

**Target milestone:**
Month 1: [X] reviews
Month 2: [X] reviews  
Month 3: 50+ reviews — this threshold is where Nigerian local search ranking changes significantly

**The velocity-building technique:**
[A specific ethical strategy for generating a high volume of real reviews in a short period — used by top-rated Nigerian businesses]
` : ''}

---

${inputs.include_nonresponder_sequence ? `
## 5. NON-RESPONDER FOLLOW-UP

**Follow-up 1 (5 days after request):**
[Lighter touch — "It takes 2 minutes and would genuinely help someone making the same decision you made"]

**Follow-up 2 (10 days — final):**
[Graceful last try — "No pressure at all — if you ever do have a moment, this is the link: [Google Maps link]. It's always appreciated."]

[After 2 follow-ups with no response — stop. Don't pressure. Mark them as "future opportunity."]
` : ''}

💡 CEREBRE TIP: [The counterintuitive review insight for Nigerian ${I(p)} businesses — why businesses with a 4.6 rating often outperform those with 5.0, and the specific review response strategy that converts hesitant prospects into buyers]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 34 — CRISIS RESPONDER
// Laws: 3 (Trust recovery), 8 (Immediate, personal, direct)
// ─────────────────────────────────────────────────────────────

export function getCrisisResponderPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const validityGuide: Record<string, { approach: string; tone: string }> = {
    yes_fully_valid:     { approach: 'Full accountability — take ownership completely. Attempting to minimise will destroy trust more than the incident.', tone: 'Deeply apologetic + action-focused. Never defensive.' },
    partially_valid:     { approach: 'Acknowledge the experience while clarifying facts. Do not gaslight — their experience is real even if the facts are disputed.', tone: 'Empathetic + clarifying. Never argumentative.' },
    no_false_claim:      { approach: 'Correct the record factually — but lead with empathy for anyone who was affected. Being right is less important than appearing trustworthy.', tone: 'Calm, factual, non-defensive. Show not argue.' },
    not_sure_investigating: { approach: 'Transparency about the investigation. "We\'re looking into this and will respond fully within [timeframe]." Never promise what you can\'t deliver.', tone: 'Transparent + reassuring. Promise process not outcome.' },
  }

  const validity    = inputs.is_complaint_valid || 'partially_valid'
  const guide       = validityGuide[validity] || validityGuide['partially_valid']
  const platforms   = Array.isArray(inputs.response_platform) ? inputs.response_platform : ['instagram']
  const isSerious   = inputs.crisis_severity === 'serious_going_viral' || inputs.crisis_severity === 'severe_business_threatening'

  return `
SPECIALIST ACTIVATED: Nigerian brand crisis management expert. Laws 3 (Trust recovery — the crisis IS a trust event) and 8 (Immediate, personal, direct) are PRIMARY.

━━━ CRISIS BRIEF ━━━
Business:         ${B(p)} — ${I(p)} in ${C(p)}
Crisis Type:      ${inputs.crisis_type?.replace(/_/g, ' ')}
What Happened:    ${inputs.what_happened}
Validity:         ${validity.replace(/_/g, ' ')}
Severity:         ${inputs.crisis_severity?.replace(/_/g, ' ')}
Time Since:       ${inputs.timeline_hours_since_crisis?.replace(/_/g, ' ')} hours since crisis
Platforms:        ${platforms.join(', ')}
Recovery Offer:   ${inputs.recovery_offer || 'To be defined'}
Spokesperson:     ${inputs.spokesperson || `${B(p)} leadership`}
WhatsApp:         ${wa.display}
Language:         ${L(p)}

━━━ CRISIS APPROACH ━━━
Approach: ${guide.approach}
Tone:     ${guide.tone}

━━━ NIGERIAN CRISIS INTELLIGENCE ━━━
In Nigeria, how a business handles a complaint publicly is watched more carefully than the original complaint. Your crisis response is, paradoxically, your biggest trust-building opportunity.

The 3 rules of Nigerian crisis management:
1. SPEED: Respond within 2 hours on social media. Nigerian audiences respect speed of acknowledgement even when the full answer isn't available yet.
2. HUMAN: The response must sound like a real person — not a legal disclaimer or corporate statement. "I" not "we" or "the company."
3. ACTION: Every response must name a specific action being taken — not "we take this seriously" but "I've personally refunded [Name] and called them to apologise."

What DESTROYS trust in Nigerian crisis management:
- Deleting comments (they screenshot before you delete — it always goes viral)
- "Our team will reach out" (passive — they want a person, not a team)
- Defensive responses that argue with the complainer
- Taking too long to respond (silence = guilt in Nigerian social media culture)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE CRISIS RESPONSE PLAN — ${B(p).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## IMMEDIATE PRIORITY ACTIONS (Do these FIRST — before writing any response)

☐ 1. Screenshot the original complaint (with timestamp) — for reference
☐ 2. Do NOT delete the post/comment — it always makes things worse
☐ 3. Alert any staff who interacted with this customer for context
☐ 4. Check if the complaint is spreading beyond the original platform
☐ 5. Decide on the recovery offer (${inputs.recovery_offer || 'full refund / redo service / compensation — decide now'})

---

## PUBLIC RESPONSES BY PLATFORM

${platforms.map((platform: string) => `
### ${platform.toUpperCase().replace(/_/g, ' ')} RESPONSE

**Character/Format Guide:** ${platform === 'twitter_x' ? '280 chars — punchy, human, move to WhatsApp fast' : platform === 'instagram' ? 'Comment response — 150-200 chars — full response in DM' : platform === 'public_statement' ? 'Full statement — 300-500 words — professional format' : 'Standard response — platform-appropriate length'}

**PUBLIC RESPONSE:**
[COMPLETE RESPONSE — immediately usable]

Opening: [Lead with empathy, not facts — "This is not the experience I want for anyone who deals with ${B(p)}"]
${validity === 'yes_fully_valid' ? 'Accountability: [Take full responsibility — specific and genuine — not "mistakes were made"]' : validity === 'no_false_claim' ? 'Gentle clarification: [Factual correction — without being defensive or dismissive of their experience]' : 'Acknowledgement: [Acknowledge their experience was real — don\'t fight the facts yet]'}
Action named: [Specific action taken — "${inputs.recovery_offer ? inputs.recovery_offer : 'specific remedy'} has been/will be done"]
Move to private: "I've sent you a direct message / Please WhatsApp me: ${wa.display}"

[Note: This response is visible to everyone — write for the 1,000 people watching, not just the 1 person complaining]

**WHY NOT TO:]**
- Say "Our team will look into this" → says nobody is personally responsible
- Delete this comment → Nigerian audiences screenshot before deletion
- Argue facts publicly → you'll never win, and it looks petty
`).join('\n')}

---

## DIRECT CUSTOMER COMMUNICATION (Private — WhatsApp or DM)

**The apology message (sent immediately after the public response):**
[COMPLETE MESSAGE — personal, direct, in ${L(p)}]

"[Use 'I' not 'we'] [Genuine acknowledgement of their specific experience — reference exactly what happened] [What I'm doing about it specifically: ${inputs.recovery_offer || '[specific recovery action]'}] [How this will not happen to them again] [Direct invitation to speak if they want — ${wa.display}]"

**Key principle:** This message is the one that converts the unhappy customer into a future advocate. A customer who had a bad experience AND received a genuine, personal response often becomes your most loyal customer AND your strongest referrer. The Aso-Ebi principle: they tell their community "they made it right."

**If they respond with continued anger:**
[Script for de-escalation — acknowledge → validate → redirect to action → let them vent → close with action]

**If they're satisfied with your response:**
[Script for converting this into a future relationship — the gentle transition from crisis to customer loyalty]

---

${inputs.include_48hr_action_plan ? `
## THE 48-HOUR CRISIS MANAGEMENT PLAN

**Hour 0–2: Immediate Response**
☐ Post public response (see above — done)
☐ Send private DM/WhatsApp to affected customer
☐ Alert all staff who might receive questions about this
☐ Brief anyone who manages ${B(p)}'s social media accounts

**Hour 2–6: Monitor and Respond**
☐ Watch for reshares, screenshots, or further comments
☐ Respond to all comments on the crisis post within 2 hours
☐ Monitor WhatsApp for direct messages about this
☐ Implement the recovery offer (${inputs.recovery_offer || 'complete the remedy promised'})

**Hour 6–24: Containment and Proof of Action**
☐ Post "What we did" update (if appropriate — shows accountability)
☐ Get confirmation from the affected customer that the issue is resolved
☐ Reach out personally to your 3–5 most loyal customers to reassure them

**Hour 24–48: Recovery Content**
☐ Post value-first content that doesn't reference the crisis but shows ${B(p)} at its best
☐ Collect 1–2 fresh testimonials from happy customers to rebalance the narrative
☐ Document what went wrong and create a system to prevent it

**What NOT to do in 48 hours:**
- Launch promotional content (looks tone-deaf)
- Go silent / stop posting (looks like you're hiding)
- Make promises about what caused it if you don't fully know yet
` : ''}

---

${inputs.include_recovery_sequence ? `
## THE LONG-TERM TRUST RECOVERY SEQUENCE (Days 3–30)

*[How to rebuild trust and come out stronger than before]*

**Week 1 — Show, Don't Tell:**
[Content plan for 7 days that demonstrates ${B(p)}'s values through action — not words about the crisis]

**Week 2 — Proof of Change:**
[Specific content or communication that shows what ${B(p)} changed as a result of the incident]

**Week 3 — Community Re-Engagement:**
[How to re-engage the audience who saw the crisis — create a "comeback" narrative that Nigerian audiences actually respect]

**Week 4 — The Transformation Story:**
[The optional but powerful move: share what you learned and how you improved — Nigerians deeply respect businesses that own their mistakes and grow from them]

**The final move — turning the crisis customer into an advocate:**
[If they accepted the recovery offer — how to follow up in 2–3 weeks and gently ask if they'd be willing to share their experience of how ${B(p)} handled it]
` : ''}

---

## WHAT NEVER TO SAY (The Nigerian Crisis Response Blacklist)

❌ "We take your feedback seriously" — empty, corporate, instantly recognised as template
❌ "Our team will reach out" — no one owns it, no one trusts it
❌ "This is not our policy" — who cares? It happened.
❌ "We cannot discuss this publicly" — looks like hiding
❌ Threats of legal action — destroys trust permanently in Nigerian social media
❌ "You misunderstood" — gaslighting. Never wins.

✅ INSTEAD SAY: Personal name + specific acknowledgement + specific action + direct contact

---

💡 CEREBRE TIP: [The Nigerian crisis management insight that most businesses don't know — how a well-handled complaint publicly builds more trust for ${B(p)} in ${C(p)} than 10 five-star reviews, and the specific response element that makes the watching audience say "they're the real deal" instead of "drama business"]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 35 — LOCAL SEO KIT
// Laws: 3 (Trust — local credibility), 9 (Community — local discovery)
// ─────────────────────────────────────────────────────────────

export function getLocalSEOKitPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  return `
SPECIALIST ACTIVATED: Nigerian local SEO expert — specialist in the Google Maps ranking signals that matter for African businesses. Laws 3 (Trust — local credibility signals) and 9 (Community — local search is community discovery) are PRIMARY.

━━━ BRIEF ━━━
Business:         ${B(p)} — ${I(p)} in ${C(p)}
Specific Location: ${inputs.business_location}
Primary Service:  ${inputs.primary_service}
Service Areas:    ${inputs.service_areas || `${inputs.business_location} and surrounding areas`}
SEO Priority:     ${inputs.seo_priority?.replace(/_/g, ' ')}
Current Rating:   ${inputs.current_google_rating || 'Not specified'}
Review Count:     ${inputs.current_review_count || 'Not specified'}
Competitors:      ${inputs.top_competitors_listed || 'Not specified'}
Target Searches:  ${inputs.target_search_queries || `${inputs.primary_service} ${inputs.business_location}`}
WhatsApp:         ${wa.display}
Trust Signal:     ${PR(p) || YR(p)}

━━━ NIGERIAN LOCAL SEO INTELLIGENCE ━━━
Nigerian businesses that rank on Google Maps get 4x more qualified enquiries than those relying on social media alone — because search intent is purchase intent.

The 5 factors that most affect Google Maps ranking for Nigerian businesses:
1. COMPLETENESS: A fully completed Google Business Profile ranks significantly higher than a partial one (most Nigerian businesses are 40–60% complete)
2. REVIEWS: Quantity + recency + city mentions in review text
3. CATEGORIES: Most businesses choose 1 category — choose 3–5 relevant ones
4. CITATIONS: Consistent name/address/phone across Nigerian directories (VConnect, Businesslist, etc.)
5. PROXIMITY + KEYWORDS: Geographic keywords in business description, posts, and review responses

The "near me" search pattern in Nigeria differs from Western markets:
- Nigerians search: "[service] in [area]" not "[service] near me" (area name specificity is higher)
- Common Nigerian search formats: "best [service] Lagos Island", "top [service] Maitama", "[service] Lekki"
- Include area names IN the GBP description — not just the main city

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE LOCAL SEO STRATEGY — ${B(p).toUpperCase()}
## Location: ${inputs.business_location} | Service: ${inputs.primary_service}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${inputs.include_gbp_checklist ? `
## 1. GOOGLE BUSINESS PROFILE OPTIMISATION — ALL 47 FIELDS

*[Complete from top to bottom — every incomplete field hurts ranking]*

**CRITICAL FIELDS (fill these first — biggest ranking impact):**

✅ Business Name: "${B(p)}" [Exact match to real-world signage — no keyword stuffing]
✅ Primary Category: [Most specific category available for ${inputs.primary_service}]
✅ Additional Categories (add all that apply):
   - [Category 2]
   - [Category 3]
   - [Category 4]
   [Tip: Adding 3+ categories increases search visibility by ~40%]

✅ Business Description (750 chars max — use all of it):
[COMPLETE DESCRIPTION — keyword-rich, benefit-led, includes location modifiers]
"${B(p)} is [specific service type] based in ${inputs.business_location}. [What they do + who they serve + key differentiator: ${A(p)}]. Serving ${inputs.service_areas || `clients across ${C(p)}`}. [Trust signal: ${PR(p) || YR(p)}]. Contact: ${wa.display}"
[Natural inclusion of: ${inputs.business_location}, ${inputs.primary_service}, ${inputs.service_areas || C(p)}]

✅ Phone Number: ${p.phone || '[Add your phone number — required for local ranking]'}
✅ WhatsApp: ${wa.display} [Add in the "Additional Info" section]
✅ Website: [Your website URL if applicable]
✅ Address: ${p.address || inputs.business_location}
✅ Service Area (if you serve customers at their location): [List all areas/LGAs served]
✅ Hours: ${p.business_hours || '[Add your exact opening hours — including if Saturday/Sunday differs]'}

**SERVICES SECTION (Add ALL services — each gets its own ranking signal):**
[For each service ${B(p)} offers — create a separate GBP service entry with:]
Service name: [Specific service name + city — "Event Photography Lagos Island"]
Description: [50-100 words per service — keyword-rich — includes location]
Price (if applicable): [Add price range if you have standard pricing]

**PHOTOS (minimum 10 — maximum no limit):**
Required photos in order of ranking impact:
- Logo (profile photo)
- Cover photo (your best work / storefront)
- Interior/workspace photos (builds trust)
- Work/product photos (5+ examples)
- Team photos (human faces = trust signals)
- Location exterior (helps customers find you)
[Tip: Geotagged photos taken near your business location rank higher]

**POSTS (create 1x per week for maximum ranking):**
Post format: [Specific template for weekly GBP posts that include service keywords + location + WhatsApp CTA]

**Q&A SECTION (seed your own questions):**
[5 questions customers commonly ask — seed these yourself then answer them]
Q1: "What area of ${C(p)} do you serve?"
Q2: "How do I book/order from ${B(p)}?"
Q3: "What is the price range for [primary service]?"
Q4: "How long has ${B(p)} been in business?"
Q5: "[Most common specific question for ${inputs.primary_service}]"
` : ''}

---

${inputs.include_keyword_list ? `
## 2. LOCAL KEYWORD LIST — ${inputs.primary_service.toUpperCase()} IN ${inputs.business_location.toUpperCase()}

**Tier 1 — High Intent (most valuable — people searching to hire/buy):**
| Keyword | Search Intent | Priority |
|---------|---------------|----------|
| "${inputs.primary_service} ${inputs.business_location}" | Buying | HIGH |
| "${inputs.primary_service} in ${C(p)}" | Buying | HIGH |
| "best ${inputs.primary_service} ${C(p)}" | Research | HIGH |
| "${inputs.primary_service} ${inputs.business_location} price" | Price comparison | HIGH |
| "${inputs.primary_service} near me ${C(p)}" | Local intent | HIGH |
[Continue with 10 more high-intent variations specific to ${I(p)}]

**Tier 2 — Area-Specific (neighbourhood-level):**
[Keywords using specific Nigerian area names within the service area — e.g. "event planner Lekki Phase 1", "caterer Victoria Island"]

**Tier 3 — Problem-Solution (educational, lower intent but higher volume):**
[How-to queries and problem phrases that ${T(p)} searches before knowing what service they need]

**Nigerian Search Patterns to Target:**
- "[Service] Lagos" (city name + service — the #1 Nigerian local search format)
- "Affordable [service] in [area]" (value-conscious Nigerian searcher)
- "[Service] company in Nigeria" (national searches)
- "How to find [service] [city]" (discovery searches)
- Pidgin variant: "where to get [service] for [city]" (emerging voice search pattern)

**Keywords NOT to target (save budget):**
[Irrelevant, too broad, or cannibalising queries specific to ${I(p)} that waste ranking effort]
` : ''}

---

${inputs.include_citation_guide ? `
## 3. NIGERIAN CITATION BUILDING GUIDE

*[Consistent NAP (Name, Address, Phone) across directories is a strong local ranking signal]*

**Your NAP — use EXACTLY this format everywhere:**
Name: ${B(p)}
Address: ${p.address || inputs.business_location + ', Nigeria'}
Phone: ${p.phone || wa.display}
Website: [Your website if applicable]

**Priority Nigerian Directories to List On:**
1. VConnect.com — [Instructions for listing]
2. Businesslist.com.ng — [Instructions]
3. Afribiz.info — [Instructions]
4. Yellow Pages Nigeria (yellowpages.com.ng) — [Instructions]
5. NgEX (ngex.com/bizdir) — [Instructions]
6. Nairaland Business Listings — [Instructions for relevant service threads]
7. [Industry-specific directory for ${I(p)}]

**Pan-African directories (if serving beyond Nigeria):**
- Kompass Africa
- Empresarial Africa
- Africa Business Communities

**Citation consistency check:**
[How to audit your current citations for inconsistencies that may be hurting ranking]
` : ''}

${inputs.include_review_strategy ? `
---

## 4. REVIEW VELOCITY STRATEGY FOR ${C(p)} RANKING

*[Google Maps ranking in Nigerian cities is heavily influenced by review recency and velocity]*

**Current status:** ${inputs.current_review_count || 'Unknown'} reviews at ${inputs.current_google_rating || 'unknown'} rating
**Target for significant ranking improvement:** 25+ reviews at 4.5+ rating

**90-Day Review Building Plan:**
Month 1: Get 10 reviews from existing happy customers
Month 2: Build to 20 reviews — activate review request on every new customer
Month 3: Build to 30+ — the threshold where ${I(p)} ranking in ${inputs.business_location} starts to shift

**The review text that helps you rank locally:**
[Encourage customers to naturally include in their review:]
- The area/location they're from
- The specific service they received
- The outcome they got
Example: "I used ${B(p)} for [service] in [area of ${C(p)}] and got [result] — highly recommend for [city] businesses"

**Responding to every review:**
[Why responding to every review — positive and negative — increases local ranking, not just trust]
` : ''}

${inputs.include_nigerian_directories ? `
---

## 5. NIGERIAN-SPECIFIC LOCAL DISCOVERY CHANNELS

*[Beyond Google — how Nigerians discover local businesses]*

**WhatsApp Groups (highest Nigerian local discovery channel):**
[How to get ${B(p)} recommended in relevant Lagos/Abuja/PH WhatsApp groups — the ethical, effective approach]

**Nairaland Forum:**
[How to build presence on the "Reviews and Testimonials" section for ${inputs.primary_service} in ${inputs.business_location}]

**Nigerian Facebook Groups:**
[Local Facebook groups for ${C(p)} where ${B(p)}'s target customers ask for service recommendations — how to position to be recommended]

**Instagram Location Tags:**
[Using Instagram's location-tagging feature to appear in "${inputs.business_location}" searches on Instagram]
` : ''}

---

## 6. 30-DAY LOCAL SEO ACTION PLAN

**Week 1 (Foundation):**
☐ Complete all 47 GBP fields (today)
☐ Add 10+ photos (geotag them)
☐ List on VConnect, Businesslist, Afribiz (same NAP everywhere)

**Week 2 (Reviews):**
☐ Request reviews from 10 happiest clients
☐ Add Q&A to GBP (seed 5 questions yourself)
☐ Create first GBP post (with local keyword)

**Week 3–4 (Consistency):**
☐ Respond to every review (positive and negative)
☐ Post weekly GBP update
☐ Request 5 more reviews from recent clients

**Ongoing:**
☐ 1 GBP post per week
☐ 3–5 review requests per week
☐ Respond to all reviews within 24 hours

💡 CEREBRE TIP: [The single Google Business Profile optimisation that ranks ${I(p)} businesses in ${inputs.business_location} 3x faster than everything else — the field that 90% of Nigerian businesses leave blank and that accounts for 30% of local map ranking]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 36 — KEYWORD HUNTER
// Laws: 3 (Trust via discoverability), 5 (Giant Promise of visibility)
// ─────────────────────────────────────────────────────────────

export function getKeywordHunterPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  return `
SPECIALIST ACTIVATED: Nigerian SEO keyword strategist — expert in how African buyers actually search online. Laws 3 (Trust via visibility), 5 (Giant Promise of discoverability) are PRIMARY.

━━━ BRIEF ━━━
Business:       ${B(p)} — ${I(p)} in ${C(p)}
Seed Topic:     ${inputs.seed_topic}
Intent Focus:   ${inputs.keyword_intent?.replace(/_/g, ' ')}
Target Cities:  ${inputs.target_cities || C(p)}
Content Type:   ${inputs.content_type_for_keywords?.replace(/_/g, ' ')}
Competitor:     ${inputs.competitor_url || 'Not specified'}
Pidgin Variants: ${inputs.include_pidgin ? 'Yes' : 'No'}
Voice Search:    ${inputs.include_voice_search ? 'Yes' : 'No'}
Negatives:      ${inputs.include_negative_keywords ? 'Yes' : 'No'}
Language:       ${L(p)}

━━━ NIGERIAN SEARCH BEHAVIOUR INTELLIGENCE ━━━
How Nigerians search differently from Western markets:

1. CITY SPECIFICITY: Nigerians almost always include the city — "event planner Lagos" not "event planner near me"
2. "BEST" IS DOMINANT: "Best [X] in Lagos" is the most common research query format
3. PRICE SEARCHES: "How much is [X] in Nigeria" and "[X] price Nigeria" are high-volume commercial signals
4. TRUST SEARCHES: "[Business name] real or fake", "[Service] legit" — FOBE-driven trust verification searches
5. INSTAGRAM/YOUTUBE SEARCH: Many Nigerians search Instagram and YouTube more than Google for certain categories
6. VOICE SEARCH EMERGENCE: Android users increasingly search by voice on 4G — conversational queries growing

Pidgin search patterns (emerging, valuable, low competition):
- "where to get [X] naija" / "how to get [X] in naija"
- "[X] wey dey work for Nigeria"
- "best [X] no cap" (youth-influenced)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# KEYWORD RESEARCH STRATEGY — ${B(p).toUpperCase()}
## Topic: ${inputs.seed_topic}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## TIER 1 — HIGH INTENT KEYWORDS (Buying / Transactional)
*[People actively looking to hire or buy — highest conversion potential]*

| Keyword | Intent Signal | Competition | Best For |
|---------|---------------|-------------|---------|
[20 high-intent keywords — specific to ${inputs.seed_topic} in Nigerian market]
[Include: city name variants, "best" variations, price queries, comparison queries]

**The Golden Keywords for ${I(p)} in ${C(p)}:**
[The 5 keywords that, if ranked for, would have the highest business impact for ${B(p)}]

---

## TIER 2 — RESEARCH / CONSIDERATION KEYWORDS
*[People learning before buying — great for content marketing and building trust]*

| Keyword | Intent Signal | Content Type | CTA at End |
|---------|---------------|--------------|------------|
[15 research-intent keywords — "how to", "what is", "guide to" variations]
[Each with: suggested content title + recommended WhatsApp CTA for that content piece]

---

## TIER 3 — LOCAL / COMMUNITY KEYWORDS
*[City-specific + area-specific + community-validation searches — the Nigerian trust keywords]*

| Keyword | Location Modifier | Search Volume Indicator |
|---------|------------------|-------------------------|
[15 local keywords — "${inputs.target_cities}" + service variations]
[Include: area-level keywords (Lekki, VI, Ikeja for Lagos; Maitama, Garki for Abuja etc.)]
[Include: "testimonials", "reviews", "legit", "recommended" variations]

---

${inputs.include_pidgin ? `
## TIER 4 — NIGERIAN ENGLISH & PIDGIN VARIANTS
*[Low competition, growing search volume — differentiated positioning]*

| Standard English Keyword | Nigerian English Variant | Pidgin Variant |
|--------------------------|--------------------------|----------------|
[10 keyword pairs — shows how Nigerians actually type these searches]
[Specific to ${inputs.seed_topic} and ${I(p)}]
` : ''}

${inputs.include_voice_search ? `
## VOICE SEARCH / CONVERSATIONAL KEYWORDS
*[Android voice search queries — growing rapidly in Nigeria — full sentences]*

| Voice Search Query | Intent | Content to Create |
|--------------------|--------|------------------|
[10 voice search variants — "what is the best...", "how do I find...", "where can I get..."]
[Formatted as complete questions Nigerians speak to their phones]
` : ''}

---

## CONTENT CLUSTER MAP

*[How to turn these keywords into a content strategy that ranks for all of them]*

**Pillar Page (ranks for main keyword):**
Topic: "[Main high-intent keyword]"
Content type: [Long-form guide / Service page / Product page]
WhatsApp CTA at end: [Specific CTA for ${B(p)}]

**Supporting Content Pieces (rank for secondary keywords + link to pillar):**
[6–8 supporting content pieces — each targeting a different Tier 2 keyword]
[Content title + keyword + format + internal link structure]

**The content calendar tied to these keywords:**
[Month-by-month plan for producing and publishing content that captures these search rankings]

---

${inputs.include_negative_keywords ? `
## NEGATIVE KEYWORDS — SAVE BUDGET / AVOID WASTED EFFORT
*[For paid ads: exclude these. For content: don't create content targeting these.]*

| Keyword to Exclude | Why Irrelevant | How to Exclude |
|--------------------|----------------|----------------|
[15 negative keywords specific to ${inputs.seed_topic} in Nigeria]
[Includes: irrelevant locations, unrelated services, wrong-intent variations]
` : ''}

---

## IMPLEMENTATION ROADMAP — 90 DAYS TO KEYWORD DOMINANCE

**Month 1 — Foundation:**
[Target 5 high-intent keywords — create 5 pages/articles — build NAP consistency for local]

**Month 2 — Authority Building:**
[Create pillar page + 3 supporting articles — get backlinks from Nigerian directories]

**Month 3 — Expansion:**
[Target Tier 3 local keywords — create neighbourhood-specific content — build Google Maps reviews with keyword mentions]

**Quick win this week:**
[The single keyword action that would give ${B(p)} the fastest visible SEO improvement — the thing to do TODAY]

WhatsApp for questions: ${wa.display}

💡 CEREBRE TIP: [The Nigerian keyword category that ${I(p)} businesses systematically ignore but that converts 4x better than branded keywords — the specific search pattern that Nigerian buyers use when they're most ready to spend money and how ${B(p)} can own it with a single piece of content]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 37 — WEBSITE COPY AUDIT
// Laws: 1 (Awoof — show value before price), 3 (Trust — eliminate FOBE), 4 (Fear), 5 (Giant Promise)
// ─────────────────────────────────────────────────────────────

export function getWebsiteCopyAuditPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  return `
SPECIALIST ACTIVATED: Nigerian conversion rate optimisation expert — applying all 10 Cerebre Plus laws as an audit framework. Laws 1, 3, 4, 5 are PRIMARY.

━━━ AUDIT BRIEF ━━━
Business:           ${B(p)} — ${I(p)} in ${C(p)}
Website:            ${inputs.website_url}
Pages to Audit:     ${Array.isArray(inputs.pages_to_audit) ? inputs.pages_to_audit.join(', ') : inputs.pages_to_audit}
Current Copy:       ${inputs.current_copy_or_headline}
Conversion Goal:    ${inputs.main_conversion_goal?.replace(/_/g, ' ')}
Primary Problem:    ${inputs.biggest_conversion_problem?.replace(/_/g, ' ')}
Industry:           ${inputs.industry_context || I(p)}
Competitors:        ${inputs.competitor_websites || 'Not specified'}
WhatsApp:           ${wa.display}
Trust Signal:       ${PR(p) || YR(p)}
Language:           ${L(p)}

━━━ THE 10-LAW AUDIT FRAMEWORK ━━━
Every website page is audited against all 10 Cerebre Plus Laws:
1. Awoof: Is there a value comparison? Is the price anchored against alternatives?
2. List: Is there a WhatsApp/email opt-in before the sale ask?
3. Trust: Are there specific trust signals? (Numbers, city, years — not generic claims)
4. Fear: Is the cost of not acting articulated?
5. Giant Promise: Is there a bold, specific promise that earns their attention?
6. Story: Does it open with a story or a relatable situation — not a feature list?
7. Sales Letter: Is the page structured Hook → Problem → Solution → Proof → CTA?
8. Customer Behaviour: Is the action step frictionless? Is there a WhatsApp number?
9. Community: Is the social proof community-specific? (city names, specific numbers)
10. Urgency: Is there any urgency? Or can they "come back later"?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WEBSITE COPY AUDIT — ${B(p).toUpperCase()}
## URL: ${inputs.website_url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PART 1 — THE 10-LAW AUDIT RESULTS

**Current copy submitted for audit:**
"${inputs.current_copy_or_headline}"

| Law | Status | Finding | Priority Fix |
|-----|--------|---------|--------------|
| Law 1 — Awoof | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 2 — List | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 3 — Trust | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 4 — Fear | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 5 — Giant Promise | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 6 — Story | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 7 — Sales Letter | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 8 — Customer | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 9 — Community | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |
| Law 10 — Urgency | [✅/❌/⚠️] | [Specific finding] | [What to add/change] |

**Overall Conversion Score: [X]/10**
**Primary Conversion Killer:** [The single biggest reason this page isn't converting for ${C(p)} visitors]
**Estimated Conversion Improvement from Full Rewrite:** [X]% (conservative estimate for ${I(p)} in ${C(p)}]

---

## PART 2 — THE CONVERSION KILLERS

*[Specific, brutal honesty about what's stopping visitors from taking action]*

**Conversion Killer 1 (Most Damaging):**
[What it is + why it kills conversions for Nigerian buyers specifically + how to fix it]

**Conversion Killer 2:**
[Same structure]

**Conversion Killer 3:**
[Same structure]

**The FOBE Assessment:**
[Does the current copy trigger "Fear of Being Cheated"? What specific elements make Nigerian visitors suspicious — and how to eliminate each one]

---

${inputs.include_full_rewrite ? `
## PART 3 — THE COMPLETE REWRITTEN HOMEPAGE HERO

*[Law 7 Sales Letter Formula applied to a hero section — Nigerian buyer psychology throughout]*

**HEADLINE (H1 — the first thing they read):**
[REWRITTEN HEADLINE — follows the Giant Promise formula — specific outcome + for specific person + in specific context — max 12 words]

Current: "${inputs.current_copy_or_headline.slice(0, 60)}..."
Rewritten: "[Bold, specific, FOBE-eliminating headline]"

**Why this headline converts better:**
[The psychological mechanism — why this specific formulation works for ${C(p)} ${I(p)} buyers]

**SUBHEADLINE (H2 — supports and deepens the headline):**
[Rewritten subheadline that adds specificity and trust signal]

**THE HERO BODY (2–3 sentences that seal the deal):**
[Rewritten body copy that: names the customer's problem, shows the Giant Promise, includes a trust signal, and makes the CTA feel like the obvious next step]

**TRUST SIGNALS SECTION (above the fold on desktop):**
[The trust signals to add — specific format — e.g. "4,200+ businesses served • Lagos • Since 2018 • Google 4.9★"]

**PRIMARY CTA BUTTON (replacing or upgrading the current CTA):**
Button text: "[Specific action + benefit — not 'Submit' or 'Learn More']"
Sub-text below button: "[Objection-killer — e.g. 'Free consultation • No obligation • WhatsApp reply in 30 minutes']"
WhatsApp CTA: "${wa.display}"

---

## PART 4 — FULL ABOUT PAGE REWRITE

*[The About page is the most-read page on Nigerian business websites — Nigerians buy from people they feel they know]*

**ABOUT PAGE STRUCTURE (Law 6 + Law 3):**

Opening: [Story — not "We are XYZ established in 2018" — but a human story that makes them feel they're dealing with a real person who understands them]

Proof section: [${PR(p) || YR(p)} — specific, verifiable, city-named social proof]

Why we exist: [The WHY behind ${B(p)} — what's wrong with the current ${I(p)} market in ${C(p)} and why ${B(p)} was created to fix it]

The team: [Human, warm — shows real people — combats FOBE]

CTA: ["If you're a ${I(p)} business in ${C(p)} and want [specific result] — send me a message on WhatsApp: ${wa.display}"]
` : ''}

---

${inputs.include_cta_rewrites ? `
## PART 5 — CTA REWRITES ACROSS ALL PAGES

*[The call-to-action is the moment of conversion — most Nigerian businesses have weak CTAs]*

**The CTA Formula for Nigerian Business Websites:**
[Specific action] + [Specific benefit] + [FOBE eliminator] + [WhatsApp number] + [Urgency if genuine]

**Homepage CTA (Primary):**
Current: "[Whatever it currently says]"
Rewritten: "[Action verb + specific outcome] — Send us a WhatsApp message: ${wa.display}"

**Services/Products CTA:**
Rewritten: "[I want to help you + specific result]. [Trust signal]. [Simple WhatsApp action]"

**Contact Page CTA:**
Rewritten: "[Make it feel like reaching out to a person, not a company]"

**The 2-CTA Rule for Nigerian Websites:**
[Primary CTA = WhatsApp (instant) | Secondary CTA = Form/email (for those not ready to WhatsApp] — why this dual approach captures more Nigerian leads]
` : ''}

---

${inputs.include_trust_section_additions ? `
## PART 6 — TRUST SECTION ADDITIONS

*[The trust section is the #1 missing element on most Nigerian ${I(p)} websites]*

**Where to add trust signals:**
- Above the fold (before they scroll)
- After the problem statement (reassurance before the solution)
- Next to the primary CTA (right where they need the confidence to click)
- In the footer (persistent trust reinforcement)

**The 5 trust elements ${B(p)}'s website needs:**

1. **Social Proof Counter (specific number + city):**
"[X]+ ${I(p)} businesses in ${C(p)} trust ${B(p)}"

2. **Years in Business:**
"${YR(p) || 'X years serving [city]'}"

3. **Testimonial Widget:**
[Best-performing testimonial format for the website — with city + specific result]

4. **Trust Badges:**
[Industry associations, certifications, or Nigerian-specific trust signals relevant to ${I(p)}]

5. **Guarantee Statement:**
"[The risk reversal that makes clicking CTA feel safe — what happens if they're not satisfied]"
` : ''}

${inputs.include_mobile_notes ? `
---

## PART 7 — MOBILE OPTIMISATION NOTES

*[75%+ of Nigerian website visitors are on mobile — these notes apply specifically to Android mobile experience]*

**Critical Mobile Fixes:**
☐ WhatsApp CTA button must be visible without scrolling on a 6-inch Android screen
☐ Text size minimum 16px — Nigerian Android users often have accessibility sizes set larger
☐ Images compressed to < 200KB each — 3G visitors bounce if page loads > 3 seconds
☐ Contact number must be clickable-to-call on mobile
☐ WhatsApp link must open in WhatsApp directly (use wa.me format — ${wa.link})
☐ No horizontal scrolling — a conversion-killer for Nigerian mobile users

**The 3-Second Rule for Nigerian Mobile:**
[Specific advice on which elements to load first vs. defer for 3G performance]
` : ''}

---

## PRIORITY ACTION LIST — WHAT TO FIX FIRST

**This week (biggest conversion impact):**
1. [Specific headline change]
2. [Add WhatsApp CTA above fold]
3. [Add trust signal section]

**This month:**
[Full hero section rewrite + about page rewrite]

**Long-term:**
[Full site copy update using the rewritten templates above]

💡 CEREBRE TIP: [The website copy element that specifically kills conversion for Nigerian ${I(p)} businesses — the section most web designers include by default that actually increases FOBE for Nigerian visitors, and what to replace it with that increases WhatsApp enquiries by 3x]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 38 — REFERRAL PROGRAM BUILDER
// Laws: 2 (Relationship — referrers are the relationship), 9 (Community), 10 (Urgency to activate)
// ─────────────────────────────────────────────────────────────

export function getReferralProgramBuilderPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  return `
SPECIALIST ACTIVATED: Nigerian referral marketing strategist — expert in the Aso-Ebi Principle (community buying behaviour). Laws 2 (Relationship), 9 (Community — referral IS community validation), 10 (Urgency — activate referrers before momentum dies) are PRIMARY.

━━━ BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Referrer Incentive: ${inputs.referral_incentive}
New Customer Offer: ${inputs.new_customer_incentive || 'None'}
Goal:              ${inputs.referral_goal?.replace(/_/g, ' ')}
Method:            ${inputs.referral_method?.replace(/_/g, ' ')}
Customer Base:     ${inputs.existing_customer_relationship?.replace(/_/g, ' ')}
Tracking:          ${inputs.referral_tracking_method?.replace(/_/g, ' ')}
WhatsApp:          ${wa.display}
Trust Signal:      ${PR(p) || YR(p)}
Language:          ${L(p)}

━━━ THE ASO-EBI PRINCIPLE IN BUSINESS ━━━
In Nigerian culture, the Aso-Ebi tradition (dressing in coordinated fabric as a community) demonstrates how strongly Nigerians buy what their community validates. The most powerful marketing in Nigeria is not advertising — it is a trusted person recommending your business to people they know.

Referral marketing facts for Nigerian ${I(p)} businesses:
- A referred customer in Nigeria converts at 4x the rate of an ad lead
- Referred customers have 37% higher lifetime value on average
- A referred customer trusts ${B(p)} from the first contact — FOBE is low because the trust transfers from the referrer
- Referral marketing costs ₦0 per referred customer (vs. ₦[X] cost-per-lead from ads)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE REFERRAL PROGRAMME — ${B(p).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. PROGRAMME STRUCTURE

**Programme Name:** "[Name that feels like community, not a corporate scheme — e.g. '${B(p)} Circle' or '${B(p)} Inner Community']"

**How it works (in plain English that a customer can understand in 10 seconds):**
"When you introduce a friend to ${B(p)} and they [buy/book/sign up], you get [${inputs.referral_incentive}]. No complicated steps. Just tell a friend and make sure they mention your name."
${inputs.new_customer_incentive ? `"And your friend gets: ${inputs.new_customer_incentive} — making it easy for both of you."` : ''}

**Referrer Incentive:** ${inputs.referral_incentive}
**How and when paid/given:** [Specific — immediately / after first payment / monthly batch]
**Tracking:** ${inputs.referral_tracking_method?.replace(/_/g, ' ')} — [How to make this frictionless for Nigerian businesses]

---

## 2. THE LAUNCH BROADCAST (WhatsApp to existing customers)

*[Law 2: Build relationship before the ask. Law 9: Community belonging. Law 10: First-mover advantage.]*

**Complete Launch Message (WhatsApp — ${V(p)} tone):**

[FULL BROADCAST MESSAGE — immediately copy-pasteable]

Opening: [NOT "Join our referral programme" — instead: personal appreciation for being a customer]
Community angle: [Law 9: make them feel part of an exclusive inner circle — the Aso-Ebi feeling]
The offer: [${inputs.referral_incentive} — framed as a thank-you, not a sales pitch]
How easy it is: [One sentence — how simple the referral process is — Law 8]
${inputs.new_customer_incentive ? `The gift for their friend: [${inputs.new_customer_incentive} — makes it easy to make the introduction]` : ''}
Urgency: [Law 10: early adopter advantage — "the first [X] to refer get an extra [bonus]"]
CTA: [Exactly what to do next — one step — WhatsApp: ${wa.display}]

---

## 3. THE REFERRER BRIEF

*[What to tell your referrer about how to introduce ${B(p)} to their network]*

**The "elevator pitch" your customers give their friends:**
"I've been using ${B(p)} for [service] in ${C(p)} and I genuinely recommend it. [One specific result they can share: ${PR(p) || 'they did great work for me'}]. Tell them [Name] sent you."

**What to say on WhatsApp to a friend:**
[Pre-written WhatsApp message the customer can forward to their contact — ready to share]
"[Friend's name], I wanted to recommend ${B(p)} for [service] in ${C(p)}. I used them for [X] and [specific result]. I think they'd be great for your [business/situation]. Their WhatsApp is ${wa.display} — tell them [Name] referred you."

**What NOT to do:**
[Common mistakes that make Nigerian referrals feel awkward or transactional — and how to avoid them]

---

${inputs.include_share_message_template ? `
## 4. READY-TO-SHARE REFERRAL MESSAGES (by channel)

**WhatsApp Forward (most effective in Nigeria):**
[Complete message — formatted for WhatsApp forwarding — includes ${B(p)} WhatsApp number]

**WhatsApp Status / Stories:**
[Brief, visual-friendly message for WhatsApp Status — creates passive referral awareness]

**Instagram Story Mention:**
[Direction for what to say when recommending ${B(p)} on Instagram Stories — includes what to tag]

**Word-of-mouth script (for in-person recommendation):**
[The 2-sentence in-person recommendation — what a happy ${B(p)} customer says when someone asks for a referral in ${C(p)}]
` : ''}

---

${inputs.include_tracking_system ? `
## 5. TRACKING SYSTEM (Realistic for Nigerian SME)

*[Must be simple — Nigerian business owners don't have time for complex CRM systems]*

**The Simple Tracking Method for "${inputs.referral_tracking_method?.replace(/_/g, ' ')}":**

[Specific, step-by-step tracking system using tools Nigerian business owners already use]

Option A — WhatsApp-based tracking:
[How to use WhatsApp Business labels to track: "Referral Lead" → "Converted" → "Incentive Paid"]

Option B — Simple Google Spreadsheet:
[3-column spreadsheet template: Referrer Name | New Customer Name | Incentive Status]

**The referral confirmation message (sent to referrer when their referral converts):**
[WhatsApp message notifying the referrer they've earned their incentive — creates momentum]

**Monthly referral report:**
[Simple monthly check-in with top referrers — recognises community champions — builds loyalty]
` : ''}

${inputs.include_gamification ? `
---

## 6. GAMIFICATION (OPTIONAL BUT POWERFUL)

**Leaderboard / Top Referrer Recognition:**
[Monthly WhatsApp status post recognising the top referrer — community validation reinforcement]

**Tier System:**
Bronze: 1 referral = [incentive]
Silver: 3 referrals = [enhanced incentive]
Gold: 5+ referrals = [VIP incentive + community recognition]

**The "Community Champion" Status:**
[How to create an exclusive tier for ${B(p)}'s top referrers — the Nigerian equivalent of brand ambassadors]
` : ''}

---

## REFERRAL PROGRAMME PERFORMANCE TARGETS

Month 1: [X] active referrers → [X] new customers
Month 3: [X] active referrers → [X] new customers
Month 6: Referral channel generating [X]% of all new business

**The ROI calculation:**
Cost per referred customer: ${inputs.referral_incentive} (vs. ₦[X] cost-per-lead from advertising)
If referral programme generates [X] customers/month: saves ₦[X]/month in ad spend
Net saving + revenue: ₦[X]/month from a ₦0/month marketing channel

💡 CEREBRE TIP: [The referral programme insight that doubles activation rate for Nigerian ${I(p)} businesses — the specific way to frame the referral ask that makes it feel like community service rather than sales, and why Nigerian referrers refer more when the benefit goes to BOTH parties rather than just themselves]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 39 — NEWSLETTER AI
// Laws: 2 (Relationship — newsletter IS the relationship), 3 (Trust via expertise), 6 (Story)
// ─────────────────────────────────────────────────────────────

export function getNewsletterAIPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const toneGuides: Record<string, string> = {
    expert_friend:        'Warm authority — like getting advice from a smart friend who happens to be an expert. Direct, warm, practical. Uses "I" liberally.',
    industry_authority:   'Established expert — formal but accessible. Positions ${B(p)} as the industry reference point in ${C(p)}.',
    personal_storyteller: 'Story-led — every issue opens with a personal or customer story that illuminates the newsletter\'s point.',
    value_packed_practical: 'Practical first — delivers immediate actionable value in every paragraph. Business owners love reading this because they always finish with something they can apply today.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian newsletter strategist — expert in creating email newsletters that Nigerian business owners actually read, forward, and act on. Laws 2 (Relationship), 3 (Trust via expertise), 6 (Story) are PRIMARY.

━━━ BRIEF ━━━
Business:         ${B(p)} — ${I(p)} in ${C(p)}
Theme:            ${inputs.newsletter_theme}
Reader:           ${inputs.reader_description}
Length:           ${inputs.newsletter_length}
Featured Offer:   ${inputs.featured_offer || 'None this issue'}
Story Angle:      ${inputs.story_angle?.replace(/_/g, ' ')}
Industry Insight: ${inputs.include_industry_insight ? 'Yes' : 'No'}
Quick Tip:        ${inputs.include_quick_tip_section ? 'Yes' : 'No'}
Frequency:        ${inputs.newsletter_frequency}
Tone:             ${toneGuides[inputs.tone_for_newsletter] || toneGuides['expert_friend']}
Previous Issue:   ${inputs.previous_issue_topic || 'First issue / not specified'}
WhatsApp:         ${wa.display}
Trust Signal:     ${PR(p) || YR(p)}
Language:         ${L(p)}

━━━ NIGERIAN NEWSLETTER INTELLIGENCE ━━━
Nigerian business newsletter readers have one filter: "Is there something I can use in my business today?"

What gets Nigerian business newsletters opened:
- Subject lines with specific numbers ("7 things Lagos businesses do wrong with WhatsApp")
- Subject lines with FOBE triggers ("Are you accidentally losing customers?")
- Personal stories from Nigerian business contexts
- Actionable insights specific to the Nigerian/African market

What gets them clicked through to buy:
- The featured offer framed as Awoof (value comparison)
- Community validation (others in their city/industry are doing this)
- The "I learned this from a client in [city]" authority signal
- A WhatsApp CTA that doesn't require typing — just clicking the link

The Law 6 rule for newsletters: Every issue opens with a 3-sentence story. Not a preamble. Not "this week's topic is." A story that makes them feel: "That's me" by sentence two.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NEWSLETTER — ${B(p).toUpperCase()}
## Issue Theme: ${inputs.newsletter_theme}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## SUBJECT LINES (3 variants — A/B test the first 2)

**Subject A (Number-promise — highest Nigerian open rates):**
"[Specific number] + [specific outcome] + [Nigerian specificity]"
Example structure: "7 reasons Lagos [industry] businesses lose money on [topic]"

**Subject B (Fear/FOBE trigger):**
"[Unsettling truth about the Nigerian market that they need to know]"
Example structure: "The [industry] mistake that's costing you customers this week"

**Subject C (Curiosity gap — for warm lists):**
"[Incomplete thought that makes them need to open to get the answer]"

**Preview Text (the second subject line — appears next to subject in inbox):**
[40-60 characters that extend the subject line and add more reason to open]
[Never repeat the subject — always add new intrigue]

---

## NEWSLETTER BODY

**FROM:** ${B(p)} / [Founder name if personal brand]
**TO:** ${inputs.reader_description}

---

**OPENING — THE LAW 6 STORY (first thing they read):**

[3-sentence story — Nigerian business context — follows the story arc: PERSON → PROBLEM → TURNING POINT]

"[Nigerian business owner name], a [specific type of ${I(p)} business] in ${C(p)}, [specific situation that readers will recognise in themselves]. [The problem they faced — made vivid and specific]. [The unexpected thing that happened — the turning point that will be explained in the newsletter]."

[ONE transition sentence: "What happened next taught me something about [newsletter theme] that I've never seen shared anywhere."]

---

**SECTION 1 — THE CORE VALUE DELIVERY:**
*[${inputs.newsletter_length === 'short' ? '150-200' : inputs.newsletter_length === 'long' ? '400-600' : '250-350'} words — the heart of the newsletter]*

[COMPLETE SECTION — specific, actionable, Nigerian market context throughout]

Opening of section: [Continue from the story — reveal what was learned]
Key insight 1: [Specific, immediately applicable — with Nigerian example]
Key insight 2: [Specific, immediately applicable — with ${C(p)}/Nigerian context]
${inputs.newsletter_length !== 'short' ? 'Key insight 3: [Specific, actionable]' : ''}
The so-what: [How this applies specifically to ${inputs.reader_description}]

---

${inputs.include_industry_insight ? `
**SECTION 2 — ${I(p).toUpperCase()} INTELLIGENCE FOR ${C(p).toUpperCase()}:**
*[One non-obvious insight about the Nigerian ${I(p)} market that makes readers feel they're getting insider access]*

"[Specific Nigerian market observation — something that's changed, a trend, a counterintuitive data point, or a competitive insight that most ${I(p)} businesses in ${C(p)} don't know]"

Why this matters for [reader description]: [Direct practical implication]
What to do about it: [One specific action]
` : ''}

${inputs.include_quick_tip_section ? `
**QUICK WIN — TRY THIS TODAY:**
*[One actionable thing they can implement in the next 30 minutes — no expensive tools, no agency required]*

"[Specific tip — Nigerian market context — step-by-step instructions]"
[For ${B(p)}'s readers: how to apply this specifically]
WhatsApp to ask questions: ${wa.display}
` : ''}

---

${inputs.featured_offer && inputs.include_featured_offer ? `
**THIS WEEK FROM ${B(p).toUpperCase()}:**
*[The Awoof section — offer presented after value is delivered — never before]*

[Complete featured offer section following the Awoof formula:]

"For those of you who want to go further with [newsletter theme], here's what I'm offering this week:"

Value stack: [What this is normally worth]
The offer: [What they get + the Awoof comparison]
Trust signal: [${PR(p) || YR(p)}]
Urgency: [Real deadline — "this is only available until [date] for newsletter subscribers"]
CTA: "If this is for you, send me a WhatsApp message right now: ${wa.display}"
Simplest action: "[Reply to this email with 'interested' and I'll send you the details"]
` : ''}

---

**CLOSING — THE RELATIONSHIP ANCHOR:**

[2–3 sentences that close the newsletter in a personal, warm way]
[Law 8: make the reply/action step feel like replying to a friend — not a corporation]
[Sign-off: First name or the ${B(p)} team — never "Regards, The ${B(p)} Team"]

**P.S.:** [The urgency reinforcement — the most-read element in any email — use for the featured offer or the most important CTA of this issue]

---

**FOOTER:**
${B(p)} | ${C(p)}, Nigeria | WhatsApp: ${wa.display}
[Unsubscribe link] | [Why you're receiving this]

---

## NEXT ISSUE PREVIEW

**Send date:** [Specific date based on ${inputs.newsletter_frequency} frequency]
**Teaser for next issue:** "[1-2 sentence preview that creates anticipation — makes them want to open the next one]"

**The "connected issues" approach:**
[How to structure the next 3 issues so each one builds on the last — creating a narrative arc that increases open rates issue over issue]

💡 CEREBRE TIP: [The Nigerian newsletter insight that triples open rates for ${I(p)} businesses in ${C(p)} — the subject line format, send time, or content structure that outperforms every other approach for business newsletter readership in this market]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 40 — WIN BACK CAMPAIGN
// Laws: 3 (Trust rebuilt), 6 (Story — what changed), 10 (Urgency — the window is closing)
// Special: Cerebre Plus's deepest insight — old customers are the best customers
// ─────────────────────────────────────────────────────────────

export function getWinBackCampaignPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const inactiveReasonGuides: Record<string, { diagnosis: string; approach: string }> = {
    life_happened_drifted: {
      diagnosis: 'They haven\'t left — they just got busy. Life moved on. They probably still like ${B(p)} — they just forgot.',
      approach:  'Warm re-introduction. No selling in Message 1. Just reconnect. Law 6: story of what\'s changed. The offer appears in Message 3 only.',
    },
    price_concern: {
      diagnosis: 'Price was a barrier. They may have gone to a cheaper alternative. They miss the quality but can\'t justify it.',
      approach:  'Acknowledge without assuming. Build new value first. Message 3 offers a bridge — smaller commitment or payment plan.',
    },
    had_bad_experience: {
      diagnosis: 'Trust was broken. This is the hardest win-back. The relationship needs repairing before anything can be sold.',
      approach:  'Message 1 is purely relationship repair — acknowledge the experience (never deny it). Message 2 shows what changed. Offer comes only if they respond positively to Message 2.',
    },
    competitor_won_them: {
      diagnosis: 'They\'re getting their ${I(p)} needs met elsewhere. But they probably have doubts — or gaps the competitor doesn\'t fill.',
      approach:  'Don\'t reference the competitor. Lead with what\'s new/improved at ${B(p)}. Message 3 wins them back with something the competitor can\'t match.',
    },
    forgot_about_us: {
      diagnosis: 'The most common reason. Absence of contact led to absence of mind. This is the easiest win-back.',
      approach:  'Pattern interrupt — reach out as a person who remembers them specifically. Make them feel missed (because they were). Offer comes naturally.',
    },
    unknown: {
      diagnosis: 'Unknown reason — use the approach that works for all scenarios: warm → value → offer.',
      approach:  'Follow the Cerebre Plus win-back sequence: Message 1 = check-in (no selling). Message 2 = what improved (value). Message 3 = offer (Awoof). Message 4 = final urgency (if running 4+).',
    },
  }

  const reasonKey  = inputs.reason_for_inactivity || 'unknown'
  const guide      = inactiveReasonGuides[reasonKey] || inactiveReasonGuides['unknown']
  const msgCount   = parseInt(inputs.messages_in_sequence || '3', 10)
  const inactivePd = inputs.inactive_period?.replace(/_/g, ' ') || '60 days'

  return `
SPECIALIST ACTIVATED: Nigerian customer re-engagement expert — applying Cerebre Plus's deepest sales insight: old customers are your best prospects. Laws 3 (Trust rebuilt through personal contact), 6 (Story — what changed since they left), 10 (Urgency — the win-back window is real) are PRIMARY.

━━━ WIN-BACK BRIEF ━━━
Business:         ${B(p)} — ${I(p)} in ${C(p)}
Inactive Period:  ${inactivePd}
Reason:           ${reasonKey.replace(/_/g, ' ')}
Win-Back Offer:   ${inputs.win_back_offer || 'To be defined in strategy'}
Channel:          ${inputs.win_back_channel?.replace(/_/g, ' ')}
Messages:         ${msgCount}
What Changed:     ${inputs.what_changed_or_improved || 'Improved service / new offerings'}
Segment:          ${inputs.customer_segment?.replace(/_/g, ' ')}
Deadline:         ${inputs.win_back_deadline || 'Create genuine urgency for final message'}
WhatsApp:         ${wa.display}
Trust Signal:     ${PR(p) || YR(p)}
Language:         ${L(p)}

━━━ AKIN ALABI'S WIN-BACK WISDOM ━━━
"The best customers are old customers. They already know you. They already bought from you. They already trust you — at some level. The work of building trust from zero is already done. Your job is just to remind them why they chose you in the first place."

The Cerebre Plus 3-part win-back sequence:
Message 1 = Personal check-in (NEVER start with an offer — it feels desperate)
Message 2 = The story of what changed / improved (Value before the ask)
Message 3 = The offer (Awoof Stack — the deal that makes returning feel obvious)
[Message 4 = Fear close: "After [date], this offer is gone and we're moving on"]

━━━ DIAGNOSIS ━━━
Reason for inactivity: ${guide.diagnosis}
Win-back approach: ${guide.approach}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE WIN-BACK CAMPAIGN — ${B(p).toUpperCase()}
## Inactive for: ${inactivePd} | Channel: ${inputs.win_back_channel?.replace(/_/g, ' ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PRE-CAMPAIGN SEGMENTATION

*[Not all inactive customers should receive the same message — segment first]*

**Segment A — High-value past customers (highest priority):**
[Definition + specific win-back offer for this group]

**Segment B — Regular past customers:**
[Standard win-back sequence — this document]

**Segment C — One-time purchasers:**
[Lighter touch — they never had deep loyalty — treat more like cold outreach]

**The 'Never Win Back' list:**
[Who to exclude from win-back campaigns — customers who left with a specific complaint that was never resolved]

---

## MESSAGE 1 — THE PERSONAL CHECK-IN
*[Cerebre Rule: Never start with an offer. Start with a person.]*

**Send timing:** ${inactivePd} after last contact
**Character count target:** Under 200 characters (feels like a real WhatsApp message, not a broadcast)

**COMPLETE MESSAGE:**

[IN ${L(p)} — ${V(p)} tone — written as a person, not a business]

"Hi [Name if available, otherwise warm opener],

[Personal check-in that references something specific about their past interaction with ${B(p)} — shows they haven't just been added to a blast list]

[One genuine question about them — NOT about buying — about their life/business]

— [Name], ${B(p)}"

**Why NO offer in Message 1:**
Starting with an offer signals that the only reason you're reaching out is to sell. Nigerian buyers see through this immediately. The personal check-in signals: "I remember you specifically. You matter to me beyond the transaction." This is how ${B(p)} re-opens the relationship.

**If they reply positively:**
[Exact response — warm, human, move to Message 2 sooner]

**If no reply (wait [X] days then send Message 2):**
[Note: Silence is not rejection in Nigerian WhatsApp etiquette — they may have seen it but been busy. Continue the sequence.]

---

## MESSAGE 2 — THE STORY OF WHAT CHANGED
*[Law 6: Story first. Law 3: Proof of improvement. The offer is not mentioned yet.]*

**Send timing:** 3–5 days after Message 1 (or immediately after they reply to Message 1)

**COMPLETE MESSAGE:**

[Opens with Law 6 — a brief story of what changed at ${B(p)} since they were last a customer]

"[Name],

[Opening story — 2–3 sentences: 'Since we last worked together in [timeframe], [specific change at ${B(p)}]. I [personal anecdote about the improvement]. The [result for customers].']

${inputs.what_changed_or_improved ? `[Specific improvement: ${inputs.what_changed_or_improved}]` : '[Specific: what ${B(p)} improved, new service, better process, better results for others]'}

I thought of you specifically because [personal reason connecting this improvement to their specific situation/needs].

I'm not asking anything from you — just wanted you to know.

${wa.display} if you ever want to chat.

— [Name]"

**The psychology of Message 2:**
This message does two things simultaneously: (1) demonstrates that ${B(p)} is committed to improving (rebuilding trust) and (2) makes them curious about the offer they haven't heard yet. It plants the desire before the offer appears.

**Key: Do NOT mention a sale, offer, or price in Message 2. The offer in Message 3 will land much better if this message was purely about them.**

---

## MESSAGE 3 — THE OFFER
*[NOW the offer — Awoof Stack — after relationship is re-established]*

**Send timing:** 5–7 days after Message 2

**COMPLETE MESSAGE:**

[Opens with the connection from Messages 1 and 2]
[The Awoof Stack — framed as exclusive to past customers, not a mass promotion]
[Real urgency — specific deadline]
[Single easy action]

"[Name],

I've been thinking about what we talked about [or: I wanted to share something with you].

Because you've worked with ${B(p)} before, I want to offer you something I'm not offering to new customers right now:

[WIN-BACK OFFER — ${inputs.win_back_offer || 'exclusive returning customer deal'}]

[Awoof Stack: What this is normally worth vs. what returning customers pay]
[Why this is available only to past customers — community validation (Law 9)]
[Trust signal: ${PR(p) || YR(p) || `${B(p)}'s track record`}]

This is only for ${inputs.inactive_period?.replace(/_/g, '-')}-ago customers, and only available until [${inputs.win_back_deadline || 'specific date'}].

One tap: ${wa.display} — reply 'RETURNING' and I'll send you the details.

— [Name], ${B(p)}"

---

${inputs.include_akin_winback_formula && msgCount >= 4 ? `
## MESSAGE 4 — THE FEAR CLOSE
*[Cerebre Plus's win-back final move: the polite goodbye that creates genuine FOMO]*
*[Law 10: Real urgency — the offer is genuinely closing]*
*[Law 4: The cost of not returning — what they'll miss out on]*

**Send timing:** 2 days before the win-back deadline in Message 3

**COMPLETE MESSAGE:**

"[Name],

I'm reaching out one last time before [${inputs.win_back_deadline || 'Friday midnight'}].

After that, this offer closes — and I'll be focusing on new customers rather than win-back programmes for a while.

[Genuine consequence of not returning — not manipulative, just honest: what they miss, what's changing]

If returning makes sense for you, send me a WhatsApp now: ${wa.display}

If not, I understand completely — and I genuinely wish your [business/situation] well.

— [Name], ${B(p)}"

**The psychology of Message 4:**
This message gives them permission NOT to return — and that's exactly what makes some of them decide to return. The low pressure of "I understand if not" paradoxically reduces the stakes and makes the "yes" feel safe. This is Cerebre Plus's most sophisticated insight about Nigerian buyer psychology: making the exit easy makes the entry easier.
` : ''}

${inputs.include_reactivation_offer ? `
---

## THE REACTIVATION OFFER STRUCTURE

*[The offer that makes returning feel obvious — Law 1 (Awoof) at maximum]*

**The Win-Back Awoof Stack:**
What a new customer pays: [Standard price]
What a returning customer gets: ${inputs.win_back_offer || '[Special returning customer offer]'}
What they get additionally: [Any bonus for returning — makes them feel valued not just sold to]
Total value of the win-back package: [Sum of all components]
Net saving by returning: [₦X saved vs. new customer pricing]

**The win-back offer must feel like:**
"They're giving me this because I'm a past customer, not because they're desperate." — Never desperate. Always abundant. The offer is a reward for their past loyalty.
` : ''}

${inputs.include_final_goodbye_message ? `
---

## THE GRACEFUL GOODBYE (If They Don't Return)

*[The message that preserves the relationship for future opportunities — Nigerian business is built on relationships that last years, not single transactions]*

**Send timing:** After the win-back deadline has passed with no response

**COMPLETE MESSAGE:**

"[Name],

I wanted to reach out one last time — not to sell you anything, but to say:

Thank you for working with ${B(p)} when you did. Whatever brought you to us in the first place was the start of something I'm genuinely grateful for.

[One line: personal thing you remember about their time as a customer]

The door is always open whenever you're ready — ${wa.display}. No campaigns, no pitches — just [Name], whenever it makes sense.

Take care.

— [Name], ${B(p)}"

**Why this message matters:**
This message costs nothing. It plants a seed that may take 3 months or 3 years to grow. In Nigeria's relationship economy, the business owner remembered is the business owner eventually returned to. This goodbye message is the most underrated revenue-generating message in the entire campaign.
` : ''}

---

## WIN-BACK PERFORMANCE BENCHMARKS

**Expected response rates by inactive period:**
- 30 days inactive: 25–40% response rate to Message 1
- 60 days inactive: 15–25% response rate
- 90 days inactive: 10–18% response rate
- 6 months inactive: 5–12% response rate
- 12 months+: 3–8% response rate

**Expected conversion rates (of those who respond):**
[For ${I(p)} businesses in ${C(p)}: X–Y% of responders convert to paying customers]

**The ROI calculation:**
If you have [X] inactive customers and [Y]% convert at [₦Z] average order:
Revenue from win-back: ₦[calculated amount]
Cost of win-back: ₦0 (time only — these are existing contacts)

💡 CEREBRE TIP: [The Cerebre Plus win-back insight that most Nigerian ${I(p)} businesses miss — the specific Message 1 detail that increases response rates by 3x, and why the most common win-back mistake (leading with an offer) is the single biggest reason win-back campaigns fail for Nigerian businesses]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// MASTER DISPATCHER — Tools 31–40
// ─────────────────────────────────────────────────────────────

export function getToolPrompt31to40(
  toolId:  string,
  inputs:  Record<string, any>,
  profile: ProfileContext,
): string | null {
  switch (toolId) {
    case 'sales-script-writer':     return getSalesScriptWriterPrompt(inputs, profile)
    case 'testimonial-collector':   return getTestimonialCollectorPrompt(inputs, profile)
    case 'review-requestor':        return getReviewRequestorPrompt(inputs, profile)
    case 'crisis-responder':        return getCrisisResponderPrompt(inputs, profile)
    case 'local-seo-kit':           return getLocalSEOKitPrompt(inputs, profile)
    case 'keyword-hunter':          return getKeywordHunterPrompt(inputs, profile)
    case 'website-copy-audit':      return getWebsiteCopyAuditPrompt(inputs, profile)
    case 'referral-program-builder': return getReferralProgramBuilderPrompt(inputs, profile)
    case 'newsletter-ai':           return getNewsletterAIPrompt(inputs, profile)
    case 'win-back-campaign':       return getWinBackCampaignPrompt(inputs, profile)
    default: return null
  }
}
