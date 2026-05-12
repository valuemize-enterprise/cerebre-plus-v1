// ═══════════════════════════════════════════════════════════════
// /lib/ai/tool-prompts.ts
// Layer 2 (specialist activation) + Layer 3 (tool-specific output
// structure) for all 40 Cerebre Plus tools.
// SERVER-SIDE ONLY.
// ═══════════════════════════════════════════════════════════════

type Profile = Record<string, any>
type Inputs  = Record<string, any>

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export function getToolPrompt(
  toolId:  string,
  inputs:  Inputs,
  profile: Profile,
): string {
  const p = profile
  const biz  = p.business_name || 'this Nigerian business'
  const city = p.city          || 'Lagos'
  const ind  = p.industry      || 'their industry'
  const wa   = p.whatsapp      || '+234XXXXXXXXXX'
  const aud  = p.target_customer || 'Nigerian consumers'
  const voice = p.brand_voice  || 'professional'
  const adv  = p.unique_advantage || 'quality and reliability'

  switch (toolId) {

    // ══════════════════════════════════════════════════════════
    // CATEGORY 1 — COPYWRITING & CONTENT
    // ══════════════════════════════════════════════════════════

    case 'copy-brain':
      return `ACTIVATE: Conversion copywriter mode — Cerebre Plus Laws 1, 4, 5, 7 are PRIMARY.

TASK: Write ${inputs.copy_type || 'persuasive sales copy'} for ${biz} in ${city}.
TARGET AUDIENCE: ${aud}
GOAL: ${inputs.key_benefit || 'Communicate the value and drive action'}
TONE: ${voice}
PLATFORM/USE: ${inputs.tone || 'General marketing'}

OUTPUT — Produce exactly 3 copy variants:

## Variant A — The Fear Angle (Law 4)
Lead with the vivid consequence of NOT having what ${biz} offers. Open with the problem.
- Headline: [Scroll-stopping, specific, fear-led]
- Opening: [2–3 sentences painting the problem vividly]
- Body: [Pain → solution → specific proof → CTA]
- CTA: [Direct WhatsApp message — "Chat with us now on WhatsApp: ${wa}"]

## Variant B — The Awoof Angle (Law 1)
Lead with the outrageous value comparison. Make them feel they are getting an unfair deal in their favour.
- Headline: [Giant promise with specific number]
- Comparison Stack: [What this would cost elsewhere vs. what ${biz} offers]
- Benefits: [3–5 specific benefits, not features]
- Social Proof: [Specific — include city name and number if profile has it]
- CTA: [WhatsApp CTA with pre-written opening message direction]

## Variant C — The Story Angle (Law 6)
Lead with a relatable Nigerian story. Make them see themselves in it.
- Headline: [Curiosity-opening story hook]
- Story: [2–3 sentences: specific Nigerian, specific problem, turning point with ${biz}]
- Result: [Specific outcome with numbers]
- Offer: [Bridge from story to ${biz}'s solution]
- CTA: [Urgency CTA with deadline or scarcity]

After each variant, add one line:
**Cerebre Plus would say:** [What Cerebre Plus would specifically improve about this copy for the ${city} market]

End with the CEREBRE TIP.`

    case 'caption-craft':
      return `ACTIVATE: Social media content specialist mode — Cerebre Plus Laws 2, 3, 9 are PRIMARY.

TASK: Write ${inputs.variations || '3'} ${inputs.platform || 'Instagram'} captions for ${biz} in ${city}.
CAPTION TYPE: ${inputs.caption_type || 'product showcase'}
ABOUT THIS POST: ${inputs.what_to_post_about || 'our products and services'}
LENGTH: ${inputs.caption_length || 'medium (100–200 words)'}
TONE: ${voice}

OUTPUT FORMAT for each caption:

## Caption [N] — [Hook Style Name]
[First line: The hook — must stop the scroll. Questions, bold statements, or surprising facts work best for Nigerian audiences.]

[Body: 3–5 lines of value, story, or proof. Use short paragraphs. Never a wall of text. Nigerian readers scan, not read.]

[Social proof line if available: specific city + number]

[CTA — always ends with WhatsApp: ${wa}]

${inputs.include_hashtags ? `
**Hashtag Strategy:**
[5 niche hashtags for ${ind} in ${city}]
[3 broad Nigerian business hashtags]
[2 location hashtags for ${city}]` : ''}

**Best posting time for ${city}:** [Recommend morning 7am–9am or evening 8pm–10pm with brief reason]

End with the CEREBRE TIP about Instagram or social media strategy specific to ${city} or ${ind}.`

    case 'ad-scribe':
      return `ACTIVATE: Performance advertising copywriter mode — Cerebre Plus Laws 1, 4, 5, 10 are PRIMARY.

TASK: Write ${inputs.ad_variations || '3'} ${inputs.ad_platform || 'Facebook/Instagram'} ad copy sets for ${biz} in ${city}.
CAMPAIGN OBJECTIVE: ${inputs.ad_objective || 'conversions'}
PRODUCT/OFFER: ${inputs.product_or_service || `${biz}'s main offering`}
TARGET AUDIENCE: ${inputs.target_audience_description || aud}
UNIQUE OFFER: ${inputs.unique_selling_point || adv}

For each ad set, produce:

## Ad Set [N] — [Angle Name]

**Primary Text (Facebook/Instagram body):**
[Hook line — grab attention in first 2 words]
[Problem + agitation — 2 sentences]
[Solution reveal — ${biz}]
[Specific benefit with number]
[Social proof — specific city + count]
[Urgency line]
[CTA with WhatsApp: ${wa}]

**Headline (25 chars max):** [Bold, specific, benefit-led]

**Description (30 chars max):** [Supporting claim or offer]

**CTA Button:** [WhatsApp / Learn More / Shop Now — recommend best option]

**Audience Targeting Notes:**
[Specific Nigerian audience targeting recommendations for this ad]
[Income level, interests, behaviors that match ${aud} in ${city}]

**Budget Recommendation:**
[Daily budget range in ₦ for testing this audience]
[Expected cost-per-click range for ${city}]

End with the CEREBRE TIP about paid advertising in the Nigerian market.`

    case 'email-scribe':
      return `ACTIVATE: Email marketing specialist mode — Cerebre Plus Laws 2, 6, 7, 10 are PRIMARY. Full Sales Letter Formula applies.

TASK: Write a ${inputs.num_emails || '5'}-email ${inputs.sequence_type || 'sales'} sequence for ${biz} in ${city}.
PRODUCT/OFFER: ${inputs.product_or_offer || `${biz}'s main offering`}
SUBSCRIBER CONTEXT: ${inputs.subscriber_context || `People who have shown interest in ${biz}`}
DESIRED ACTION: ${inputs.cta_action || `Contact ${biz} on WhatsApp: ${wa}`}
DEADLINE: ${inputs.deadline || 'End of month'}
STORY: ${inputs.story_protagonist || `A ${city} business owner in ${ind}`}

Apply Cerebre Plus's Sales Letter Formula across the 5-email arc:
Email 1: Story/Hook — Lead with story, zero selling
Email 2: Build Credibility — Establish expertise and trust signals
Email 3: Introduce Solution — Present ${biz}'s offer with benefits
Email 4: Bonuses + Guarantee — Stack value, reduce risk
Email 5: Urgency/Scarcity + Final CTA — Close with genuine deadline

For EACH email:
---
**Subject Line:** [A/B test — give 2 options]
**Preview Text:** [35-char preview line]

**Body:**
[Full email content following the formula for this email's role]
[Opening that references the story from Email 1]
[The specific CTA for this email]
[P.S. line for every email — urgency reinforcement]

**Best Send Time:** [Day + time recommendation for ${city} audience]
---

End with the CEREBRE TIP about email marketing for Nigerian businesses.`

    case 'video-script-forge':
      return `ACTIVATE: Video content specialist mode — Cerebre Plus Laws 5, 6, 8 are PRIMARY.

TASK: Write a ${inputs.video_length || '60-second'} ${inputs.video_platform || 'Instagram Reel'} script for ${biz} in ${city}.
GOAL: ${inputs.video_goal || 'generate enquiries'}
TOPIC: ${inputs.video_topic || `What ${biz} does and why it matters`}
STYLE: ${inputs.presenter_style || 'Talking head — on camera'}

OUTPUT FORMAT:

## VIDEO SCRIPT — ${biz}
**Platform:** ${inputs.video_platform || 'Instagram Reel'}
**Duration:** ${inputs.video_length || '60 seconds'}
**Hook (0–3 seconds):**
[OPENING LINE — must be said in first 3 seconds. This is what stops the scroll. Make it bold, surprising, or fear-based for Nigerian audience. Example format: "If you are spending money on [X] and not getting results, watch this."]

**Problem/Agitation (3–15 seconds):**
[Describe the specific problem ${aud} face. Make them feel seen. Specific to ${city} if possible.]

**Story/Proof (15–40 seconds):**
[Brief story or specific result. Real numbers. Real outcome. "${biz} helped a client in ${city} go from X to Y."]

**Solution Reveal (40–50 seconds):**
[Introduce ${biz}'s solution. One clear, specific benefit.]

**CTA (50–60 seconds):**
[One action only. WhatsApp: ${wa}. Say the number on camera.]

---
**DIRECTOR'S NOTES:**
- Visual suggestions for each section
- B-roll recommendations
- Text overlay suggestions for mobile viewers watching without sound (critical for Nigeria)
- Caption/subtitle note: always add captions — 85% of Nigerian mobile video is watched without sound

End with the CEREBRE TIP about video content strategy for Nigerian social media.`

    case 'blog-brain':
      return `ACTIVATE: Content marketing specialist + SEO mode — Cerebre Plus Laws 2, 3, 6 are PRIMARY.

TASK: Write a ${inputs.article_length || '1,200-word'} blog article for ${biz} in ${city}.
TOPIC: ${inputs.article_topic || `Why ${city} businesses need better marketing`}
GOAL: ${inputs.article_goal || 'build authority and generate leads'}
SEO KEYWORD: ${inputs.target_keyword || `${ind} ${city}`}
AUDIENCE: ${inputs.audience_profile || aud}
CTA OFFER: ${inputs.cta_offer || `Free consultation on WhatsApp: ${wa}`}

OUTPUT FORMAT:

# [SEO-Optimised Headline — include keyword naturally]

**Meta Description (155 chars):** [Include keyword + compelling reason to click]

---

[OPENING — Story Law: Begin with a specific Nigerian business owner story. 3 sentences. Sets the problem.]

[SECTION 1 — The Problem: Detailed, specific, relatable. Use ${city} and ${ind} specifics where possible.]

## [H2 — Natural keyword placement]
[Content — 200–250 words per section]
[Include specific Nigerian statistics, examples, or market data where relevant]
[If no real data available, use specific-sounding realistic estimates and note they are estimates]

## [H2 — Sub-topic]
[Content]

## [H2 — Solution angle]
[Content — position ${biz}'s approach here without being overtly promotional]

## [H2 — Proof/Trust section]
[Trust signals — specific numbers, years, results for ${biz}]

## Final Section — The Action Step
[Fear angle: what happens if they do not implement this]
[Giant Promise: specific outcome if they do]
[Soft CTA: free resource or consultation, not immediate buy]

---
**WhatsApp CTA Box:**
> 💬 Want to implement this for [your ${ind} business in ${city}]? Let's build your strategy together. WhatsApp ${biz}: ${wa}

**SEO Recommendations:**
[3 LSI keywords to use naturally in the article]
[Internal link opportunities]
[Image alt text suggestion]

End with the CEREBRE TIP about content marketing for ${ind} businesses in Nigeria.`

    case 'bio-builder':
      return `ACTIVATE: Brand positioning specialist mode — Cerebre Plus Law 3 (Trust) is PRIMARY.

TASK: Write a ${inputs.bio_type || 'Instagram'} bio for ${biz} in ${city}.
WHO THIS IS FOR: ${inputs.who_you_are || `${biz}, a ${ind} business in ${city}`}
CREDENTIALS: ${inputs.credentials || adv}
TARGET READER: ${inputs.target_who_reads || aud}
INCLUDE CTA: ${inputs.include_cta !== false ? 'Yes' : 'No'}

OUTPUT — Produce the bio for the specified platform:

## Bio — ${inputs.bio_type || 'Instagram'}

[WRITTEN BIO — platform-appropriate length]
[Line 1: Who you are + what you do (clear, immediate, specific)]
[Line 2: Specific trust signal — years, clients, result, credential]
[Line 3: Who you serve (${aud} in ${city})]
[Line 4 — if CTA: One action — WhatsApp link or DM instruction]

**Character count:** [X characters — confirm fits platform limit]

---
## Alternative Version — [Different angle]
[Second bio variant using a different lead]

**Profile Picture Recommendation:**
[Specific recommendation for ${ind} business — headshot vs. logo, background colour suggestion using ${p.brand_colour || '#E09818'}]

**Instagram Highlights Recommendation:**
[5 highlight cover suggestions specific to ${ind} business in ${city}]

End with the CEREBRE TIP about Instagram profile optimisation for Nigerian businesses.`

    case 'product-describer':
      return `ACTIVATE: E-commerce conversion copywriter mode — Cerebre Plus Laws 1, 3, 5 are PRIMARY.

TASK: Write ${inputs.description_length || 'medium (100–200 word)'} product description for ${biz} in ${city}.
PRODUCT NAME: ${inputs.product_name || 'the product'}
PRODUCT DETAILS: ${inputs.product_details || 'quality product from ' + biz}
PRICE: ${inputs.price || 'contact for pricing'}
PLATFORM: ${inputs.platform_for_description || 'website'}
TARGET BUYER: ${inputs.target_customer || aud}

OUTPUT:

## Product Description — ${inputs.product_name || 'Product'}

[HEADLINE — benefit-led, not feature-led. What transformation does this create?]

[OPENING — the before/after contrast. What life is like without this product, then with it.]

[FEATURE → BENEFIT TRANSLATION TABLE:]
| Feature | What It Means For You |
|---------|----------------------|
[Convert every technical feature into a customer benefit]

[TRUST BLOCK — specific trust signal for ${biz}: ${adv}]

[PRICE FRAMING — Awoof Stack: What does the problem cost vs. what this costs?]
[If price is known: "₦${inputs.price || 'X'} — less than the cost of [relatable everyday comparison in Nigeria]"]

[CTA — WhatsApp to order: ${wa}]

**SEO Title Tag (60 chars):** [Product name + key benefit + city/Nigeria]
**Meta Description (155 chars):** [Benefit + price + CTA]

End with the CEREBRE TIP about product descriptions for ${inputs.platform_for_description || 'online'} in the Nigerian market.`

    case 'press-release-ai':
      return `ACTIVATE: PR specialist mode — Cerebre Plus Law 3 (Trust) and professional positioning are PRIMARY.

TASK: Write a press release for ${biz} in ${city}.
ANNOUNCEMENT TYPE: ${inputs.announcement_type || 'business update'}
ANNOUNCEMENT DETAILS: ${inputs.announcement_details || `${biz} has an important announcement`}
SPOKESPERSON: ${inputs.spokesperson || `The CEO of ${biz}`}
TARGET MEDIA: ${inputs.target_media || 'Nigerian business media'}

OUTPUT — Standard Nigerian press release format:

FOR IMMEDIATE RELEASE

## [COMPELLING HEADLINE — Newsworthy, specific, active voice]

**[SUBHEADLINE — Supporting detail that adds context]**

${city}, [Date] — [OPENING PARAGRAPH: Who, What, Where, When, Why in 2–3 sentences. Lead with the most newsworthy angle.]

[BODY PARAGRAPH 1 — Context and significance. Why does this matter to Nigerian businesses?]

[EXECUTIVE QUOTE:]
"[Quote from ${inputs.spokesperson || 'company leadership'}. Must be specific, quotable, not generic corporate-speak. Include a Nigerian market insight.]"

[BODY PARAGRAPH 2 — Supporting details, data, or background]

[BODY PARAGRAPH 3 — Industry context or market significance]

[CLOSING PARAGRAPH — Forward-looking statement about ${biz}'s plans]

**ABOUT ${(biz).toUpperCase()}:**
[3-sentence company background. Specific: years, city, what they do, who they serve. Trust signals baked in.]

**MEDIA CONTACT:**
[Name], ${biz}
WhatsApp: ${wa}
Email: ${p.email_contact || 'press@business.com'}
Website: ${p.website_url || 'website.com'}

---
**DISTRIBUTION LIST RECOMMENDATIONS:**
[5 specific Nigerian media outlets relevant to this announcement type]

End with the CEREBRE TIP about PR strategy for Nigerian businesses.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 2 — CONTENT PLANNING
    // ══════════════════════════════════════════════════════════

    case 'content-calendar':
      return `ACTIVATE: Content strategy specialist mode — Cerebre Plus Laws 2, 9, 10 are PRIMARY.

TASK: Build a ${inputs.calendar_duration || '30'}-day content calendar for ${biz} in ${city}.
PLATFORMS: ${Array.isArray(inputs.platforms) ? inputs.platforms.join(', ') : inputs.platforms || 'Instagram, WhatsApp'}
POSTS PER WEEK: ${inputs.posts_per_week || '5'}
GOALS: ${Array.isArray(inputs.content_goals) ? inputs.content_goals.join(', ') : 'engagement and leads'}
SALARY CYCLE AWARE: ${inputs.salary_cycle_awareness !== false ? 'YES — place promotional posts in last 7 days of month' : 'Standard distribution'}

OUTPUT FORMAT:

## ${biz} — ${inputs.calendar_duration || '30'}-Day Content Calendar

**Content Pillars for ${biz} in ${city}:**
[3–5 content themes specific to ${ind} business in ${city} — each gets ~20% of posts]

**Salary Cycle Strategy:**
[Specific content distribution: educational early month → relationship mid-month → promotional last 7 days]

---
### WEEK 1
| Day | Platform | Content Type | Topic/Hook | CTA | Best Time |
|-----|----------|-------------|------------|-----|-----------|
[7 rows — one per day, even rest days say "Rest" or "Engagement only"]

[Repeat for Week 2, 3, 4]

---
**Recurring Weekly Features:**
[2–3 recurring content series specific to ${ind} that build audience habit]

**Monthly Engagement Events:**
[Nigerian calendar moments to leverage this month — public holidays, salary day, etc.]

**WhatsApp Broadcast Schedule:**
[Recommended WhatsApp broadcast days and topics for ${biz}: ${wa}]

End with the CEREBRE TIP about content calendar strategy for ${ind} businesses in ${city}.`

    case 'carousel-script-builder':
      return `ACTIVATE: Carousel content specialist mode — Cerebre Plus Laws 2, 3, 5 are PRIMARY.

TASK: Write a ${inputs.num_slides || '7'}-slide Instagram carousel for ${biz} in ${city}.
TOPIC: ${inputs.carousel_topic || `Key insights for ${aud}`}
TYPE: ${inputs.carousel_type || 'educational tips'}
AUDIENCE: ${aud}

For each slide, provide:
[SLIDE TEXT — short, punchy, large-type friendly]
[VISUAL SUGGESTION — what to show or design direction]
[OPTIONAL SUB-TEXT — smaller supporting text]

## Slide 1 — HOOK (The Only Slide That Must Win)
**Headline:** [Bold statement that stops the scroll. Fear-based or bold promise. Max 8 words.]
**Visual:** [Eye-catching image/graphic suggestion]
**Sub-text:** [Swipe → to see all [N]]

## Slide 2 — [Section title]
[Content — each slide should be self-contained value. Someone who only sees one slide should still get value.]

[Continue through all ${inputs.num_slides || '7'} slides]

## Final Slide — THE CTA
**Headline:** [Action — "Save this." "Share with a business owner you know."]
**Body:** [One-line offer or value proposition]
**CTA:** [WhatsApp: ${wa}]
**Visual:** [${biz} logo + brand colour ${p.brand_colour || '#E09818'} background]

**Caption for this carousel:**
[Full Instagram caption to accompany the carousel — with hashtags]

End with the CEREBRE TIP about carousel strategy for Nigerian Instagram.`

    case 'story-planner':
      return `ACTIVATE: Social media storytelling specialist mode — Cerebre Plus Laws 6, 8 are PRIMARY.

TASK: Plan a ${inputs.story_count || '7'}-slide Instagram/Facebook Story sequence for ${biz} in ${city}.
GOAL: ${inputs.story_goal || 'generate WhatsApp enquiries'}
TOPIC: ${inputs.story_topic || `${biz} behind the scenes`}
INCLUDE POLLS: ${inputs.include_polls !== false ? 'Yes — include 2 engagement mechanics' : 'No'}

For each Story slide:

## Story 1 — [Hook/Opener]
**Content:** [What to show/say]
**Text Overlay:** [On-screen text — large and readable on mobile]
**Sticker/Interactive:** ${inputs.include_polls !== false ? '[Poll or Question sticker]' : 'None'}
**Duration:** [Recommended seconds]
**Transition to next:** [Why they should keep watching]

[Continue for all ${inputs.story_count || '7'} slides]

## Final Story — CTA
**Content:** [Direct, simple ask]
**Text Overlay:** [WhatsApp link and number: ${wa}]
**Link Sticker:** [wa.me link with pre-written opening message]

**Story Highlight Category:**
[Recommend saving to which highlight: Services / Results / About / FAQ]

End with the CEREBRE TIP about Instagram Stories strategy for Nigerian businesses.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 3 — WHATSAPP MARKETING
    // ══════════════════════════════════════════════════════════

    case 'whatsapp-campaign-builder':
      return `ACTIVATE: WhatsApp marketing specialist mode — ALL 10 Cerebre Plus Laws apply. Law 8 (Customer Behaviour) is MOST critical.

TASK: Write a ${inputs.message_count || '3'}-message WhatsApp broadcast sequence for ${biz} in ${city}.
CAMPAIGN GOAL: ${inputs.campaign_goal || 'drive enquiries'}
OFFER DETAILS: ${inputs.offer_details || `${biz}'s special offer`}
TONE: ${inputs.tone_formality || 'warm_casual'}
DEADLINE: ${inputs.deadline || 'end of this week'}

CRITICAL RULES FOR WHATSAPP:
- Sound like a personal message from a trusted friend, not a company broadcast
- Use "I" not "we" throughout
- Include the WhatsApp number IN the message (${wa})
- Short paragraphs — 2 lines maximum before a break
- End with one clear action only
- No corporate language whatsoever

## Message 1 — [Send Day 1: The Relationship Opener]
[Start with a warm, personal greeting. Reference something relatable. Zero selling in this message. Build the relationship first. Law 2.]

## Message 2 — [Send Day 3: The Offer Reveal]
[Reference Message 1. Now introduce the offer. Fear angle first. Then giant promise. Then the offer details. Awoof Stack comparison.]
[Deadline mention: ${inputs.deadline || 'this weekend'}]

## Message 3 — [Send Day [deadline-1]: The Urgency Close]
[Final push. Pure urgency. What they miss if they don't act today. Specific remaining time/slots. WhatsApp: ${wa}]

---
**Message Performance Notes:**
- Best broadcast time for ${city}: [Day + time recommendation]
- Expected open rate for personal-style WhatsApp broadcast: 85–92%
- Salary cycle note: [Is timing optimal? Suggest adjustment if not]

End with the CEREBRE TIP about WhatsApp marketing strategy for Nigerian businesses.`

    case 'follow-up-sequencer':
      return `ACTIVATE: Sales follow-up specialist mode — Cerebre Plus Laws 3, 4, 5, 10 are PRIMARY.

TASK: Write a ${inputs.num_follow_ups || '5'}-message follow-up sequence for ${biz} in ${city}.
LEAD CONTEXT: ${inputs.lead_context || 'A prospect who enquired but has not yet committed'}
OBJECTION: ${inputs.top_objection || 'thinking about it'}
VALUE ADD: ${inputs.value_add || 'additional context about the offer'}
CHANNEL: ${inputs.winback_channel || 'WhatsApp'}

Each follow-up must address the specific objection differently:

## Follow-Up 1 — [Send: 24–48 hours after initial enquiry]
**Approach:** Value-first. No pressure. Add something new.
[Content: Check-in + deliver one piece of value they did not ask for. No "just following up."]

## Follow-Up 2 — [Send: 3–4 days later]
**Approach:** Social proof. Community validation.
[Content: Share a specific result from a similar ${city} business. Make them see themselves in the success story.]

## Follow-Up 3 — [Send: 5–7 days later]
**Approach:** Address the objection head-on with specifics.
[Content: Directly address "${inputs.top_objection || 'the objection'}" with trust law: specific number, guarantee, or risk reversal.]

## Follow-Up 4 — [Send: 10 days later]
**Approach:** Fear Law — the cost of waiting.
[Content: Show what continues to happen every day they do not act. Specific ₦ cost if calculable.]

## Follow-Up 5 — [Send: 14 days later]
**Approach:** The genuine last message.
[Content: State clearly this is the last message. Create real scarcity. Offer a final easy-entry option.]

End with the CEREBRE TIP about follow-up sequences for Nigerian market conversion.`

    case 'welcome-message-craft':
      return `ACTIVATE: First-impression specialist mode — Cerebre Plus Laws 3, 8 are PRIMARY.

TASK: Write a WhatsApp ${inputs.message_type || 'greeting'} message for ${biz} in ${city}.
BUSINESS HOURS: ${inputs.business_hours || p.business_hours || 'Monday–Saturday 8am–6pm'}
IMMEDIATE OFFER: ${inputs.what_to_offer_immediately || 'direct them to our products/services'}

## ${inputs.message_type === 'away_message' ? 'Away Message' : 'Welcome Message'} — ${biz}

[WRITTEN MESSAGE — must:]
[✓ Feel personal, not automated]
[✓ Use "I" or business owner name, not "we" or "the team"]
[✓ Establish trust in the first line — years in business or specific credential]
[✓ Tell them exactly what happens next and when]
[✓ Make the next step require zero thinking]
[✓ Include a specific action they can take right now]

---
**Catalogue/Menu Auto-Reply (if applicable):**
[Second message to send when someone first messages — includes catalogue link or product list intro]

**Quick Reply Buttons (WhatsApp Business):**
[3 quick reply button suggestions specific to ${biz}]

**Away Message Variant:**
[Alternative for outside business hours — warm, sets expectations, gives emergency option]

End with the CEREBRE TIP about WhatsApp Business setup for Nigerian businesses.`

    case 'promo-blast':
      return `ACTIVATE: Promotional urgency specialist mode — Cerebre Plus Laws 1, 4, 5, 10 are PRIMARY.

TASK: Write a ${inputs.promo_type || 'flash sale'} promotional message for ${biz} in ${city}.
OFFER: ${inputs.offer || 'special limited-time offer'}
DEADLINE: ${inputs.deadline_hours || '48 hours'}
CHANNELS: ${Array.isArray(inputs.channels) ? inputs.channels.join(', ') : 'WhatsApp, Instagram'}

Produce the promo message adapted for each channel:

## WhatsApp Broadcast Version
[Personal, casual, direct. Short paragraphs. Feels like a message from a friend who runs the business.]
[Awoof Stack: normal price vs. promo price]
[Countdown: ${inputs.deadline_hours || '48 hours'} only]
[WhatsApp reply to order: ${wa}]

## Instagram Caption Version
[More visual-language. Strong hook first line. Emojis appropriate for ${voice} voice.]
[Same Awoof Stack]
[Link in bio direction or WhatsApp CTA]
[Hashtags for ${ind} in ${city}]

## Facebook Post Version
[Slightly longer. More storytelling. Works well for ${p.facebook ? 'your Facebook page' : 'Facebook'} audience.]

**Promo Graphic Text Overlay:**
[Headline for the image/video: 6 words max]
[Subline: offer summary in 10 words]
[Brand: ${biz} | WhatsApp: ${wa}]

**Salary Cycle Note:**
[Is this promo timed well relative to the monthly salary cycle? Specific recommendation.]

End with the CEREBRE TIP about running flash promotions for Nigerian customers.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 4 — AI STRATEGY & CMO BRAIN
    // ══════════════════════════════════════════════════════════

    case 'strategy-brain':
      return `ACTIVATE: CMO mode — Full 90-day strategic planning. ALL 10 Cerebre Plus Laws inform this strategy. This is the flagship tool.

TASK: Build a complete 90-day marketing strategy for ${biz} in ${city}, ${ind} industry.
PRIMARY GOAL: ${inputs.strategy_goal || 'grow the business and get more customers'}
CURRENT SITUATION: ${inputs.current_situation || `${biz} needs a structured marketing approach`}
MONTHLY BUDGET: ${inputs.monthly_budget || '₦50,000–₦150,000'}
BIGGEST CHALLENGE: ${inputs.biggest_challenge || 'not enough customers'}

OUTPUT — Complete 90-Day Marketing Strategy:

# ${biz} — 90-Day Marketing Strategy
*Built by Cerebre Plus | ${city}, Nigeria*

---

## Executive Summary
[2 paragraphs. Current situation → the opportunity → the 90-day plan in plain language. No jargon.]

**The Awoof Math for ${biz}:**
[What a Lagos marketing agency would charge for this strategy: ₦[X]]
[What Cerebre Plus delivered it in: 60 seconds]

---

## Part 1 — Market Situation Analysis

### Your Competitive Position in ${city}
[Analysis of ${biz}'s position relative to local competition in ${city} for ${ind}]

### Target Audience Deep Dive
[Specific profile of ${aud} — where they spend time online, what they fear, what they want, how they buy in ${city}]

### Your Biggest Opportunity Right Now
[The single most underutilised marketing opportunity for ${biz} based on the profile]

---

## Part 2 — The 90-Day Roadmap

### Month 1: FOUNDATION (Days 1–30)
**Theme:** Build the infrastructure and start consistent presence

**Goals:**
- [Specific measurable goal 1 with numbers]
- [Specific measurable goal 2 with numbers]
- [Specific measurable goal 3 with numbers]

**Week 1–2 Actions:**
[Specific, numbered action items — not vague suggestions]

**Week 3–4 Actions:**
[Continue with specific actions]

**Budget Allocation — Month 1:**
| Channel | Budget | Expected Result |
|---------|--------|-----------------|
[Breakdown of ${inputs.monthly_budget || '₦100,000'} across recommended channels]

---

### Month 2: GROWTH (Days 31–60)
**Theme:** Amplify what worked in Month 1

**Goals:** [Specific, building on Month 1]
**Key Actions:** [Specific]
**Budget:** [Allocation]
**Key Metrics to Watch:** [3–5 specific KPIs]

---

### Month 3: SCALE (Days 61–90)
**Theme:** Double down on highest-performing channels

**Goals:** [Aggressive but achievable with Month 1+2 foundation]
**Key Actions:** [Specific]
**Budget:** [Allocation, likely larger if Month 1+2 worked]

---

## Part 3 — Channel Strategy

### Primary Channels for ${biz} in ${city}
[3 recommended primary channels with specific reasoning for ${ind} business in ${city}]

**WhatsApp Strategy (ALWAYS PRIMARY IN NIGERIA):**
[Specific WhatsApp marketing plan: broadcast schedule, content types, CTA approach using ${wa}]

**Content Calendar Overview:**
[High-level content themes by month — detailed calendar via Content Calendar tool]

**Paid Advertising (if budget allows):**
[Specific platform recommendation, targeting parameters for ${city}, budget allocation, expected CPL in ₦]

---

## Part 4 — The Sales System

### Lead Generation Funnel
[How ${biz} attracts → captures → converts customers specific to ${ind} in ${city}]

**WhatsApp Lead Capture Strategy:**
[Specific approach to building the WhatsApp list for ${biz}]

**Follow-Up System:**
[The follow-up sequence recommendation — number of touchpoints, timing, channel]

---

## Part 5 — KPIs and Success Metrics

| Metric | Month 1 Target | Month 3 Target | How to Measure |
|--------|----------------|----------------|----------------|
[5–7 specific, measurable KPIs with realistic Nigerian market targets]

**The Fear Check:**
[What happens to ${biz} if this strategy is not implemented in the next 90 days — specific, honest consequences]

**The Giant Promise:**
[What ${biz} can specifically achieve if this strategy is executed — bold but achievable]

---

*Strategy built by Cerebre Plus for ${biz}, ${city}. Normally takes a Lagos marketing agency 2–4 weeks and costs ₦500,000–₦800,000. You got this in 60 seconds.*

End with the CEREBRE TIP — a non-obvious strategic insight about ${ind} marketing in ${city} that most business owners miss.`

    case 'campaign-clock':
      return `ACTIVATE: Campaign timing specialist mode — Cerebre Plus Laws 10, 9 are PRIMARY. Salary cycle intelligence is CRITICAL.

TASK: Build a strategic campaign calendar for ${inputs.campaign_month || 'this month'} ${inputs.campaign_year || new Date().getFullYear()} for ${biz} in ${city}.
GOALS: ${Array.isArray(inputs.campaign_goals) ? inputs.campaign_goals.join(', ') : 'generate leads and sales'}
BUDGET: ${inputs.budget_monthly || 'not specified'}
AUDIENCE RELIGION: ${inputs.target_audience_religion || 'mixed'}

## ${biz} — ${inputs.campaign_month || 'Monthly'} Campaign Clock

### Month Overview
**Salary Day:** [Date when most ${city} workers get paid — typically 25th–28th]
**Peak Purchase Window:** [Last 7 days of month — specific dates for this month]
**Public Holidays/Events This Month:** [List all Nigerian public holidays and cultural events]
**Islamic Calendar:** [Relevant Islamic dates if mixed/Muslim audience]
**Christian Calendar:** [Relevant Christian dates if mixed/Christian audience]

---

### Week-by-Week Campaign Structure

**Week 1 (Days 1–7) — EDUCATION WEEK**
[Content focus: educate, add value, no hard selling. People spent last month's salary.]
[Specific content ideas: 3 posts per platform]
[Budget: Minimal — organic focus]

**Week 2 (Days 8–14) — RELATIONSHIP WEEK**
[Content focus: social proof, behind-scenes, community building]
[Specific content ideas]
[Budget: Light paid boost on best organic content]

**Week 3 (Days 15–21) — BUILD ANTICIPATION**
[Content focus: tease upcoming offer, collect leads for promotion]
[Begin WhatsApp list warming]
[Budget: Increase paid spend]

**Week 4 (Days 22–[month end]) — PROMOTION WEEK** ⭐
[THIS IS THE MOST IMPORTANT WEEK]
[Full promotional content — salary just arrived]
[Day-by-day promotional calendar with specific messaging]
[Urgency: end-of-month deadline]
[Budget: Maximum — 60% of monthly budget in this week]

---

### Campaign Brief for This Month
**Hero Promotion:** [Recommended main offer for ${biz} this month based on industry + timing]
**Supporting Content:** [3 content themes to run alongside]
**WhatsApp Broadcast Schedule:** [Specific dates and content for ${wa} broadcasts]
**Paid Ad Schedule:** [When to turn on ads, when to scale, when to stop]

End with the CEREBRE TIP about campaign timing specific to ${city} and ${ind}.`

    case 'audience-profiler':
      return `ACTIVATE: Market research and psychographic profiling mode — Cerebre Plus Laws 3, 4, 9 are PRIMARY.

TASK: Build a complete Ideal Customer Profile for ${biz} in ${city}.
CURRENT CUSTOMER: ${inputs.current_customer_description || `${aud} in ${city}`}
PRODUCT: ${inputs.product_being_sold || `${biz}'s main offering`}
PROBLEMS SOLVED: ${inputs.problems_you_solve || `What ${biz} helps with`}

## ${biz} — Ideal Customer Profile (ICP)

### The Portrait
**Name (Persona):** [Give them a realistic Nigerian name]
**Age:** [Specific range]
**Location:** [Specific area within ${city}]
**Occupation/Role:** [Specific — not "professional"]
**Monthly Income:** [Specific range in ₦]
**Family Situation:** [Relevant context]

---

### Digital Life
**Primary Phone:** [iPhone vs. Android — which % of your audience?]
**Primary Social Platform:** [Where they spend the most time in ${city}]
**WhatsApp Usage:** [How they use WhatsApp for purchases — critical]
**Content Consumption:** [What they watch, read, listen to]
**Online Purchase History:** [What they have bought online before — trust level]

---

### Psychology & Buying Behaviour

**What They FEAR (Law 4):**
[3 specific fears related to ${inputs.problems_you_solve || 'the problem ${biz} solves'}]
[Include FOBE-specific fears relevant to Nigerian consumers]

**What They WANT (Law 5):**
[3 specific desires and aspirations — specific to ${city} demographic]

**What Stops Them From Buying:**
[Top 3 objections — specific to Nigerian buyers for this product/service]
[The FOBE triggers specifically relevant to ${ind} in Nigeria]

**The Trust Triggers (Law 3):**
[What specific signals make this person trust a ${ind} business in ${city}?]
[In order of importance for this audience]

**The Decision Moment:**
[Where, when, and how this person makes the final decision to buy]
[What the final trigger is — usually a specific conversation or piece of content]

---

### Marketing Implications

**The Message That Converts:**
[The single most powerful message for this audience — specific headline style]

**The Channel Stack:**
[Priority order of channels to reach this person in ${city}]
[With specific reasons for each ranking]

**The Content That Builds Trust:**
[3 types of content that build trust with this specific profile in ${city}]

**Salary Cycle Behaviour:**
[How this persona's buying behaviour changes across the month]
[Peak purchase window specific to their income pattern]

**Nigerian Cultural Factors:**
[2–3 cultural considerations specific to ${city} that affect how this person buys]

End with the CEREBRE TIP about audience targeting for ${ind} businesses in ${city}.`

    case 'launch-pad':
      return `ACTIVATE: Product launch specialist mode — ALL Cerebre Plus Laws apply across the launch arc.

TASK: Build a complete launch plan for ${biz} in ${city}.
WHAT IS LAUNCHING: ${inputs.what_are_you_launching || `A new ${ind} offering from ${biz}`}
LAUNCH DATE: ${inputs.launch_date || 'in 4 weeks'}
WEEKS BEFORE LAUNCH: ${inputs.weeks_before_launch || '4'}
LAUNCH BUDGET: ${inputs.launch_budget || 'bootstrap'}
EARLY BIRD OFFER: ${inputs.early_access_offer || 'early bird discount for first 50 buyers'}

## ${biz} — Launch Plan

### The Launch Story (Law 6)
[Write the launch narrative — why is ${biz} launching this, what problem does it solve, what is the story behind it? This becomes the through-line of all launch content.]

---

### Pre-Launch Phase (Weeks 1–${Math.max(1, parseInt(inputs.weeks_before_launch || '4') - 1)})

**Week 1 Goals:** Build awareness + collect waitlist
**Week 2 Goals:** Build anticipation + social proof seeding
**Week 3 Goals:** Urgency + early bird close

**Pre-Launch Content Calendar:**
[Day-by-day content plan leading to launch]

**Waitlist/Early Access Strategy:**
[How to collect WhatsApp numbers and emails before launch]
[The early bird offer mechanism: ${inputs.early_access_offer || 'first 50 get special pricing'}]
[How to create genuine anticipation and FOMO]

---

### Launch Day Plan (${inputs.launch_date || 'Launch Day'})

**Hour-by-hour Launch Day Timeline:**
[Specific schedule — what goes live when, in what order, on which platforms]

**Launch Day Content:**
[All posts, messages, and communications scheduled]
[WhatsApp broadcast sequence for launch day: ${wa}]

**The Launch Offer:**
[Exact pricing with Awoof Stack comparison]
[Urgency: specific close date/quantity]

---

### Post-Launch Phase (First 7 Days)

**Days 1–3:** Momentum building
**Days 4–5:** Social proof amplification
**Days 6–7:** Urgency close / deadline

**Follow-Up Sequence for Enquiries:**
[What to say to people who expressed interest but did not buy]

---

### Launch Budget Breakdown
| Activity | Budget (₦) | Expected Result |
|----------|------------|-----------------|
[Allocation of ${inputs.launch_budget || 'available budget'} across launch activities]

End with the CEREBRE TIP about product launches specific to the Nigerian market.`

    case 'brand-positioner':
      return `ACTIVATE: Brand strategy specialist mode — Cerebre Plus Laws 1, 3, 5 are PRIMARY.

TASK: Build brand positioning strategy for ${biz} in ${city}.
CHALLENGE: ${inputs.positioning_challenge || 'differentiate from competition'}
COMPETITION: ${inputs.competition_description || `Other ${ind} businesses in ${city}`}
DIFFERENTIATORS: ${inputs.your_differentiators || adv}

## ${biz} — Brand Positioning Strategy

### Position Statement (The Foundation)
[One sentence that defines exactly what ${biz} is, who it serves, what it delivers, and why it is different — the "only" statement]

**Draft:** "${biz} is the only ${ind} business in ${city} that [differentiator] for [target customer] who [specific need/desire]."

---

### Competitive Landscape Map
[Visual description of where ${biz} sits relative to competitors on two key dimensions]

**${biz}'s White Space:**
[The specific positioning territory that is unclaimed in ${city}'s ${ind} market]

---

### The Brand Promise
[What ${biz} commits to deliver every single time — specific, measurable, distinctive]
[Must be something competitors cannot or do not claim]

### The Value Proposition
[The specific value that ${aud} gets from ${biz} that they cannot get elsewhere in ${city}]

---

### Messaging Architecture

**Headline Message (What you lead with):**
[The #1 most powerful message for ${biz} — used in all headlines and first impressions]

**Supporting Messages (Proof of the headline):**
[3 supporting proof points that back up the headline message]

**The Awoof Stack for ${biz}:**
[How to frame ${biz}'s value against the alternative — specific comparison that makes the choice obvious]

---

### Brand Voice Guidelines
[3–5 specific do's and don'ts for ${biz}'s communication style]
[Examples of on-brand vs. off-brand messaging]

### Application to Key Touchpoints
**Instagram Bio:** [Specific positioning language]
**WhatsApp Status:** [Positioning in one line]
**Business Card/Flyer:** [The tagline]
**Elevator Pitch:** [30-second verbal positioning statement]

End with the CEREBRE TIP about brand positioning for ${ind} businesses in ${city}.`

    case 'pricing-narrator':
      return `ACTIVATE: Pricing psychology specialist mode — Cerebre Plus Law 1 (Awoof) is PRIMARY.

TASK: Write pricing messaging for ${biz} in ${city}.
YOUR PRICE: ${inputs.your_price || 'contact for pricing'}
WHAT IS INCLUDED: ${inputs.what_is_included || `Everything ${biz} delivers`}
ALTERNATIVE COST: ${inputs.alternative_cost || 'the traditional way of solving this problem'}
RESULT DELIVERED: ${inputs.result_delivered || 'the outcome the customer achieves'}
CONTEXT: ${inputs.pricing_context || 'website pricing page'}

## ${biz} — Pricing Narrative

### The Awoof Stack (The Core of This Output)
[The comparison that makes the price feel like a bargain]

**What it costs to solve this problem the old way:**
[Specific breakdown of alternative costs in ₦]
[Traditional consultant/agency rate × time = total]

**What ${biz} charges:** ${inputs.your_price || 'your price'}

**The Awoof Math:**
"You get [result] for [price] — that's [X% cheaper] than [alternative] which would cost you [₦X] and take [X weeks/months longer]."

---

### Version for ${inputs.pricing_context || 'pricing page'}:

**Headline:** [Makes the price feel like a decision that would be crazy not to make]

**Price Introduction:**
[Frame the price AFTER building all the value. Never lead with price.]
[List everything included with specific values assigned to each component]

**The Value Stack:**
| What You Get | What It Would Cost Separately |
|-------------|-------------------------------|
[Every deliverable with a realistic market rate]
**Total standalone value: ₦[X]**
**${biz} price: ${inputs.your_price || 'your price'}**

**The Risk Reversal:**
[Guarantee that makes saying yes risk-free]

**The Urgency:**
[Genuine scarcity or deadline if applicable]

**The CTA:**
[One action. WhatsApp: ${wa}. Direct.]

End with the CEREBRE TIP about pricing psychology specifically for Nigerian buyers.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 5 — PAID ADVERTISING
    // ══════════════════════════════════════════════════════════

    case 'budget-optimizer':
      return `ACTIVATE: Performance marketing specialist mode — Cerebre Plus Laws 1, 3 are PRIMARY for ROI framing.

TASK: Build a marketing budget allocation plan for ${biz} in ${city}.
TOTAL MONTHLY BUDGET: ${inputs.total_monthly_budget || '₦100,000'}
PRIMARY GOAL: ${inputs.business_goal || 'generate leads and sales'}
CURRENT CHANNELS: ${Array.isArray(inputs.current_channels) ? inputs.current_channels.join(', ') : 'not specified'}

## ${biz} — Marketing Budget Optimisation Plan

### The Awoof Reality Check
**What ${inputs.total_monthly_budget || '₦100,000'}/month could get you:**
[vs. what a full-service agency charges for the same result]
[How Cerebre Plus tools + this allocation replaces ₦[X] in agency fees]

---

### Recommended Budget Allocation

| Channel | Monthly Budget | % of Total | Expected Result | Cost Per Lead |
|---------|---------------|------------|-----------------|---------------|
[5–7 channel rows with specific ₦ amounts and realistic Nigerian market CPL/CPC estimates]

**Total:** ${inputs.total_monthly_budget || '₦100,000'} / month

---

### Channel-by-Channel Strategy

**Priority 1: WhatsApp Marketing (Always Free — Always ROI-Positive)**
[Free channels first. WhatsApp broadcast to existing contacts costs ₦0 and converts best.]
[Specific WhatsApp strategy for ${biz}: ${wa}]

**Priority 2: [Top Paid Channel for ${ind} in ${city}]**
[Specific allocation, targeting parameters, expected results]
[Nigerian market benchmarks for this channel]

[Continue for all recommended channels]

---

### The Anti-Waste Rules
[5 specific budget mistakes Nigerian businesses make — and how ${biz} will avoid them]

### Month 1 Test Plan
[Specific allocation for first 30 days — conservative, testing focus]

### Month 3 Scale Plan
[How to reallocate when data shows what works]

End with the CEREBRE TIP about advertising budget strategy for ${ind} businesses in Nigeria.`

    case 'ad-pilot':
      return `ACTIVATE: Full campaign planning specialist mode — Cerebre Plus Laws 1, 4, 5, 10 are PRIMARY.

TASK: Build a complete ${inputs.campaign_platform || 'Meta'} advertising campaign for ${biz} in ${city}.
BUDGET: ${inputs.campaign_budget || '₦100,000 for 30 days'}
OBJECTIVE: ${inputs.campaign_objective || 'leads'}
PRODUCT/OFFER: ${inputs.product_offer || `${biz}'s main offering`}
TARGET AUDIENCE: ${inputs.target_audience_detail || aud}

## ${biz} — Complete ${inputs.campaign_platform || 'Meta'} Campaign Plan

### Campaign Architecture
**Campaign Objective:** ${inputs.campaign_objective || 'Lead Generation'}
**Campaign Budget:** ${inputs.campaign_budget || '₦100,000'}
**Flight Dates:** [Start → End with salary cycle optimised timing]

---

### Ad Set Structure

**Ad Set 1 — Cold Audience (60% of budget)**
Targeting Parameters:
- Location: [Specific ${city} neighbourhoods/areas most relevant to ${aud}]
- Age: [Specific range]
- Interests: [5–8 specific interest categories relevant to ${ind} in Nigeria]
- Behaviours: [Platform-specific behaviour targeting]
- Estimated reach: [Realistic reach estimate for ${city}]
- Estimated CPL in ₦: [Nigerian market benchmark]

**Ad Set 2 — Warm Audience (25% of budget)**
[Retargeting: page visitors, video viewers, Instagram engagers]
[Messaging: assumes prior awareness — different creative approach]

**Ad Set 3 — Lookalike (15% of budget)**
[Based on WhatsApp contacts or customer list]
[Most likely to convert fastest]

---

### Creative Brief

**Ad Variant A — Fear Lead (Law 4)**
Visual: [Specific image/video description]
Headline: [Fear-based — specific and Nigerian-relevant]
Primary text: [Full ad copy — immediately usable]
CTA button: [Recommended]

**Ad Variant B — Story Lead (Law 6)**
Visual: [Different creative format — video recommended]
Headline: [Story-opening]
Primary text: [Full ad copy]
CTA button: [Recommended]

**Ad Variant C — Offer Lead (Law 1)**
Visual: [Awoof-focused creative — price comparison prominent]
Headline: [Giant promise]
Primary text: [Full ad copy with comparison stack]
CTA button: [WhatsApp recommended]

---

### Testing Protocol
[A/B test structure — what to test first, how to read results in a Nigerian market context]

### Success Metrics
| Metric | Target | Nigerian Benchmark |
|--------|--------|--------------------|
[6 specific metrics with realistic Nigerian market targets]

End with the CEREBRE TIP about paid advertising for ${ind} businesses in ${city}.`

    case 'retarget-engine':
      return `ACTIVATE: Retargeting specialist mode — Cerebre Plus Laws 3, 4, 10 are PRIMARY.

TASK: Design a retargeting campaign for ${biz} in ${city}.
TARGET AUDIENCE: ${inputs.retarget_audience || 'website visitors who did not buy'}
TIME SINCE INTERACTION: ${inputs.time_since_interaction || '4–7 days ago'}
RETARGET OFFER: ${inputs.retarget_offer || 'special incentive to return'}
PLATFORM: ${inputs.retarget_platforms || 'Meta'}

## ${biz} — Retargeting Campaign

### Why These Leads Are Gold
[They already know ${biz}. They showed interest. The objection that stopped them is specific and addressable. Retargeting cost 3–5x less than cold acquisition.]

### Audience Segment Strategy

**Segment 1: Hot (1–3 days) — ${city} visitors**
Message approach: [Gentle reminder + urgency. They just need a nudge.]
Creative: [Specific ad concept]
Copy: [Full retargeting ad copy — references their visit implicitly]
Offer: [What to offer — small incentive, free consultation, answer to objection]

**Segment 2: Warm (4–14 days) — ${city} visitors**
Message approach: [Address the objection head-on. Social proof from similar ${city} businesses.]
Creative: [Different creative from Segment 1]
Copy: [Full ad copy with objection resolution]

**Segment 3: Cooling (15–30 days)**
Message approach: [Re-education + new angle. They may have forgotten. Awoof Stack to re-engage.]
Copy: [Full ad copy — treat as near-cold]

### The Objection Map
[Top 3 objections that stopped them from converting — and the specific creative/copy to address each]

### Frequency Cap Recommendation
[Specific frequency cap to avoid annoying ${city} audience — Nigerian sensitivity to aggressive retargeting]

### Retargeting Sequence
[Day 1 → Day 3 → Day 7 → Day 14 → Day 30 content plan]

End with the CEREBRE TIP about retargeting for Nigerian online buyers.`

    case 'influencer-brief-writer':
      return `ACTIVATE: Influencer marketing specialist mode — Cerebre Plus Law 9 (Community Validation) is PRIMARY.

TASK: Write an influencer campaign brief for ${biz} in ${city}.
INFLUENCER TIER: ${inputs.influencer_tier || 'micro (10K–100K)'}
CAMPAIGN GOAL: ${inputs.campaign_goal || 'brand awareness and enquiries'}
DELIVERABLES: ${Array.isArray(inputs.content_deliverables) ? inputs.content_deliverables.join(', ') : 'Instagram Reel + 3 Stories'}
COMPENSATION: ${inputs.compensation || '₦75,000 flat fee + free product'}
KEY MESSAGES: ${inputs.key_messages || `Promote ${biz} in ${city}`}

## ${biz} — Influencer Campaign Brief

### Campaign Overview
**Brand:** ${biz}, ${city}
**Campaign Name:** [Memorable campaign name for this activation]
**Go-Live Date:** [Recommended launch date with salary cycle rationale]
**Duration:** [Campaign window]

---

### About ${biz}
[3 sentences: who ${biz} is, what they do, why they are credible. Trust signals included.]

### What We Are Promoting
[Specific product/service. Awoof Stack for the influencer to understand the value they are communicating.]

---

### Creative Brief

**The Story We Want to Tell:**
[Narrative direction — NOT a script, but the authentic story the influencer should tell. Must feel real, not staged.]

**Key Messages (MUST include):**
- ${inputs.key_messages || `The unique value of ${biz} in ${city}`}
- [Specific trust signal to mention]
- [WhatsApp CTA: ${wa} — MUST appear on screen or in caption]

**Things to AVOID:**
- ${inputs.things_to_avoid || 'Generic claims, direct competitor comparisons, or misleading promises'}

**Tone:** ${voice}

---

### Deliverables & Specifications
[Specific list of every content piece with exact specs — dimensions, length, platform requirements]

### Approval Process
[Step 1: Concept approval → Step 2: Draft review → Step 3: Final approval → Go-live]
[Response time SLA: 24 hours for each stage]

### Exclusivity
[Non-compete clause specific to ${ind} in ${city}]

### Compensation & Payment Terms
[${inputs.compensation || '₦75,000'} — breakdown and payment schedule]

End with the CEREBRE TIP about influencer marketing for Nigerian brands.`

    case 'google-ad-craft':
      return `ACTIVATE: Google Ads specialist mode — Cerebre Plus Laws 3, 5 are PRIMARY for search intent.

TASK: Write Google ${inputs.ad_type || 'Search'} ads for ${biz} in ${city}.
TARGET KEYWORDS: ${inputs.primary_keywords || `${ind} ${city}`}
TARGET LOCATION: ${inputs.target_location || city}
PRODUCT/SERVICE: ${inputs.product_service || `${biz}'s main offering`}

## ${biz} — Google Ads Campaign

### Keyword Strategy

**Primary Keywords (High Intent):**
[10 specific Nigerian search terms — include "near me" variants, ${city}-specific terms, and Nigerian English variants of global terms]

**Negative Keywords:**
[15 negative keywords to exclude — Nigerian market specific: competitor brand searches to exclude if desired, irrelevant modifiers]

**Nigerian Search Insight:**
[How Nigerians search differently for ${ind} services — specific language patterns]

---

### Responsive Search Ad 1 — Primary

**Headlines (provide 10 — Google picks best combination):**
1. [Benefit headline — 30 chars max]
2. [Location headline — includes ${city}]
3. [Trust signal headline]
4. [Urgency headline]
5. [Price/value headline — Awoof Stack]
6–10. [Additional variations]

**Descriptions (provide 4 — Google picks best combination):**
1. [Full description 1 — 90 chars max — fear angle]
2. [Full description 2 — 90 chars max — giant promise]
3. [Full description 3 — 90 chars max — social proof]
4. [Full description 4 — 90 chars max — WhatsApp CTA]

---

### Responsive Search Ad 2 — Competitor Intent

[Alternative ad targeting competitor brand terms or "alternatives" searches]

### Ad Extensions

**Call Extension:** ${p.phone || wa}
**Location Extension:** ${p.address || city}
**Sitelink Extensions:** [4 sitelinks with text + description]
**Callout Extensions:** [6 callout phrases — trust signals and benefits]
**Structured Snippet Extension:** [Relevant to ${ind}]

### Landing Page Recommendations
[Specific landing page advice for ${city} Google traffic — what converts for Nigerian search users]

End with the CEREBRE TIP about Google Ads for Nigerian businesses.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 6 — SALES & LEAD CONVERSION
    // ══════════════════════════════════════════════════════════

    case 'funnel-builder':
      return `ACTIVATE: Sales funnel architect mode — Cerebre Plus Laws 2, 6, 7 govern the full funnel architecture.

TASK: Design and write a complete ${inputs.funnel_type || 'lead generation'} funnel for ${biz} in ${city}.
MAIN OFFER: ${inputs.funnel_offer || `${biz}'s primary product/service`}
LEAD MAGNET: ${inputs.lead_magnet || 'a free resource that attracts the ideal customer'}
AVERAGE SALE VALUE: ${inputs.average_sale_value || 'contact for pricing'}

## ${biz} — Complete Sales Funnel

### Funnel Architecture Overview
[Visual description of the full funnel: Awareness → Interest → Consideration → Decision → Purchase → Retention]

---

### Stage 1: Awareness (The Traffic Source)
**Best traffic sources for ${biz} in ${city}:**
[Recommended organic + paid channels with specific rationale for ${ind}]

**Hook content:** [The attention-grabbing content that enters the funnel]

---

### Stage 2: The Lead Magnet (Law 2 — Collect Before Selling)

**Lead Magnet:** ${inputs.lead_magnet || '[Recommended lead magnet for ${ind} business]'}
**Opt-in Mechanism:** [WhatsApp number collection — primary. Email secondary.]
**The Opt-in Page Copy:**
Headline: [Giant promise — what they get]
Sub-headline: [Specific benefit in under 10 words]
Bullet points: [3 specific things they'll learn/get]
CTA: [WhatsApp opt-in button text]
Trust signals: [${adv} — specific]

---

### Stage 3: The Nurture Sequence (Build Trust Over 5–7 Touchpoints)
[Day-by-day content plan from opt-in to first sale attempt]
[WhatsApp message sequence for ${wa}]
[Following the Sales Letter Formula across the sequence]

---

### Stage 4: The Offer Page / Pitch
[Full sales page structure using Cerebre Plus's Sales Letter Formula]
[Every section: hook → story → credibility → solution → benefits → bonuses → guarantee → urgency → price → CTA]

---

### Stage 5: The Follow-Up (For Non-Buyers)
[3-message sequence for people who saw the offer but did not buy]
[Addressing the top 3 objections for ${ind} buyers in ${city}]

---

### The Funnel Economics
| Metric | Conservative | Optimistic |
|--------|-------------|------------|
[Conversion rates at each stage with realistic Nigerian market benchmarks]
[Revenue projection based on ${inputs.average_sale_value || 'product value'}]

End with the CEREBRE TIP about sales funnel design for Nigerian businesses.`

    case 'lead-magnet-forge':
      return `ACTIVATE: Lead generation specialist mode — Cerebre Plus Law 2 (List Law) is PRIMARY.

TASK: Create a ${inputs.magnet_type || 'PDF guide'} lead magnet for ${biz} in ${city}.
TOPIC: ${inputs.magnet_topic || `Key insights for ${aud} in ${city}`}
TARGET DOWNLOADER: ${inputs.target_reader || aud}
PROMISED RESULT: ${inputs.what_they_get || 'actionable insights they can use immediately'}

## ${biz} — Lead Magnet: Complete Brief + Content

### Title Options
[3 title options — each using a different psychological trigger]
1. [How-to title — Giant Promise]
2. [Number title — "7 Ways to..."]
3. [Fear-based title — "The [X] Mistakes..."]

**Recommended:** [Choose best with reason for ${aud} in ${city}]

---

### Opt-In Headline + Copy

**Page Headline:** [The result they get — specific, bold]
**Sub-headline:** [Time + ease — "In under 30 minutes"]
**3 Bullet Points:**
- [Specific insight 1 they'll gain]
- [Specific insight 2]
- [Specific insight 3]
**CTA:** [WhatsApp number to receive it: ${wa}]

---

### Lead Magnet Content (Complete)

**Introduction (1 page):**
[Story: A ${city} ${ind} business owner who had this problem → found these solutions → specific result]
[Promise: What they will know by the end]

**Section 1: [Title]**
[Complete content — specific to Nigerian market, ${city} context]
[Include practical, immediately actionable advice]
[Nigerian examples and case studies]

**Section 2: [Title]**
[Complete content]

**Section 3: [Title]**
[Complete content]

[Continue for ${inputs.magnet_type === 'checklist' ? '1–2' : '3–5'} total sections]

**Conclusion:**
[Recap the key insights]
[The "what next" — bridge to ${biz}'s paid offer]

**Final CTA:**
[Soft offer from ${biz} — free consultation or next step]
[WhatsApp: ${wa}]
[Not a hard sell — but clear next step for interested readers]

End with the CEREBRE TIP about lead magnets for ${ind} businesses in Nigeria.`

    case 'proposal-writer':
      return `ACTIVATE: Business development specialist mode — Cerebre Plus Laws 1, 3, 4, 7 apply to the proposal structure.

TASK: Write a business proposal for ${biz} in ${city}.
CLIENT: ${inputs.client_name || 'prospective client'}
CLIENT PROBLEM: ${inputs.client_problem || 'a specific business challenge'}
SOLUTION: ${inputs.your_solution || `${biz}'s proposed approach`}
TIMELINE: ${inputs.timeline || '4–6 weeks'}
PRICING: ${inputs.pricing_structure || 'contact for pricing'}
GUARANTEE: ${inputs.guarantee_or_risk_reversal || ''}
CREDENTIALS: ${inputs.your_credentials || adv}

## BUSINESS PROPOSAL

**Prepared for:** ${inputs.client_name || '[Client Name]'}
**Prepared by:** ${biz}, ${city}
**Date:** ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
**Valid until:** [14 days from today]

---

### Executive Summary
[2 paragraphs: their problem clearly stated → how ${biz} solves it → the specific outcome they get → why ${biz} is uniquely positioned]

**The Cost of the Problem:**
[Fear Law: Specific ₦ cost of their current problem continuing for 6 more months]

**The Giant Promise:**
[What we commit to delivering — specific outcome with timeline]

---

### Understanding Your Challenge

[3–4 paragraphs demonstrating deep understanding of ${inputs.client_problem || 'their specific problem'}]
[This section should make the client feel understood — not sold to]

---

### Our Proposed Solution

[Detailed description of ${inputs.your_solution || "the approach"}]

**Phase-by-Phase Breakdown:**

**Phase 1 (Days 1–[X]): [Name]**
[Specific deliverables and actions]

**Phase 2 (Days [X]–[Y]): [Name]**
[Specific deliverables]

[Continue for all phases within ${inputs.timeline || '4–6 weeks'}]

---

### Why ${biz}

**Our Credentials:**
${inputs.your_credentials || adv}
[Specific numbers, years, notable results]

**Client Results:**
[2 brief case study snapshots — specific outcomes]

---

### Investment

${inputs.guarantee_or_risk_reversal ? `**Our Guarantee:** ${inputs.guarantee_or_risk_reversal}` : ''}

**Pricing:**
${inputs.pricing_structure || '[Pricing breakdown]'}

**The Awoof Stack:**
[What it would cost to solve this problem another way vs. this investment]

---

### Next Steps

To begin, simply:
1. Review this proposal
2. Reply with "YES" on WhatsApp: ${wa}
3. We will send the agreement and kick off within 48 hours

**This proposal is valid until [14 days from today].**

---

*${biz} | ${city} | ${wa}*

End with the CEREBRE TIP about writing proposals that win in the Nigerian B2B market.`

    case 'sales-script-writer':
      return `ACTIVATE: Sales conversion specialist mode — Cerebre Plus Laws 3, 4, 5, 7, 8 are PRIMARY.

TASK: Write a ${inputs.script_type || 'warm follow-up'} sales script for ${biz} in ${city}.
PRODUCT/SERVICE: ${inputs.product_service || `${biz}'s main offering`}
LEAD TEMPERATURE: ${inputs.lead_temperature || 'warm'}
MAIN OBJECTION: ${inputs.top_objection || 'thinking about it'}
DESIRED OUTCOME: ${inputs.desired_outcome || 'book an appointment or send a deposit'}

## ${biz} — ${inputs.script_type || 'Sales'} Script

**IMPORTANT DELIVERY NOTES:**
- Speak as yourself (personal, human) — not as "the company"
- Match their energy. If they're formal, be professional. If casual, relax.
- Never rush. Pauses are powerful.
- Listen 70%, talk 30%.

---

### Opening (First 30 Seconds)
**Goal:** Be remembered. Build instant rapport. Do NOT pitch.

[Script line 1 — genuine opener, references previous interaction or mutual context]
[Script line 2 — one statement of value, not a question yet]
[Script line 3 — permission question: "Is now a good time for 2 minutes?"]

**If busy:** [Exact script for rescheduling without losing the lead]

---

### Discovery (2–3 Minutes)
**Goal:** Let them talk. Find the real pain. They should feel heard.

[3–4 specific discovery questions for ${ind} in ${city}]
[Listen for: ${inputs.top_objection || 'price or timing objection'} — notes on how to handle]

---

### Presentation (2 Minutes)
**Goal:** Connect their pain to ${biz}'s solution. Features are forbidden. Benefits only.

[Script for presenting ${biz}'s solution — customised to what they just told you in discovery]
[Trust signal: ${adv}]
[Social proof: specific ${city} client result]

---

### Objection Handling

**When they say "${inputs.top_objection || "let me think about it"}":**
[Exact script — acknowledge → isolate → address → close]

**When they say "It's too expensive":**
[Exact script — Awoof Stack: what does the problem cost vs. this investment?]

**When they say "I need to talk to someone first":**
[Exact script — include them in the call if possible]

---

### The Close
**Goal:** Make the next step require zero thinking.

[Specific closing line for ${inputs.desired_outcome || 'the desired action'}]
[One action only: WhatsApp payment link, deposit amount, appointment booking]

**If they say yes:**
[Exact next steps — confirmation message to send immediately]

**If they do not close today:**
[Exact follow-up commitment script — get a specific date]

---

### The P.S. (WhatsApp Message After the Call)
[Exact WhatsApp message to send within 30 minutes of hanging up]
[Warm summary + next step + soft urgency]

End with the CEREBRE TIP about sales conversations in the Nigerian market.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 7 — REPUTATION & TRUST
    // ══════════════════════════════════════════════════════════

    case 'testimonial-collector':
      return `ACTIVATE: Trust-building specialist mode — Cerebre Plus Law 3 (Trust) is PRIMARY.

TASK: Create a testimonial collection system for ${biz} in ${city}.
COLLECTION METHOD: ${inputs.collection_method || 'WhatsApp message'}
WHAT TO HIGHLIGHT: ${inputs.what_you_want_highlighted || 'specific results and speed of service'}
TIMING: ${inputs.relationship_stage || 'after service completion'}
INCENTIVE: ${inputs.incentive || 'none / appreciation only'}

## ${biz} — Testimonial Collection System

### Why Testimonials Make or Break ${ind} Businesses in ${city}
[The FOBE reality — and how specific testimonials are the antidote]

---

### The Perfect Testimonial Request Message

**${inputs.collection_method === 'whatsapp_message' ? 'WhatsApp' : 'Email/DM'} Request:**

[FULL MESSAGE — warm, personal, specific. Never generic. Reference their specific experience with ${biz}.]

---

### The 5 Magic Questions
[The exact questions that pull specific, persuasive answers — not generic praise]

1. [Question 1 — pulls the specific result/outcome]
2. [Question 2 — pulls the before/after contrast]
3. [Question 3 — addresses the fear they had before choosing ${biz}]
4. [Question 4 — specific number or timeframe]
5. [Question 5 — who would they recommend ${biz} to?]

**Why these questions work:**
[Brief explanation of the psychology — for the business owner to understand]

---

### Follow-Up Sequence (For Non-Responders)

**Day 3 follow-up:** [Exact message]
**Day 7 follow-up:** [Exact message — offer micro-incentive if applicable]
**Day 14 — final ask:** [Exact message]

---

### How to Use the Testimonials You Collect

**Format 1 — Quote Card:** [Template for Instagram/WhatsApp quote graphic]
**Format 2 — Case Study:** [One-paragraph expansion format]
**Format 3 — WhatsApp Credibility File:** [How to compile testimonials into a trust document]
**Format 4 — Google Review:** [How to guide happy customers to leave Google reviews]

End with the CEREBRE TIP about testimonial collection strategy for Nigerian businesses.`

    case 'review-requestor':
      return `ACTIVATE: Online reputation specialist mode — Cerebre Plus Law 3 (Trust) is PRIMARY.

TASK: Write a review request campaign for ${biz} in ${city}.
REVIEW PLATFORM: ${inputs.review_platform || 'Google Business Profile'}
REQUEST CHANNEL: ${inputs.request_channel || 'WhatsApp'}
CUSTOMER EXPERIENCE: ${inputs.what_they_experienced || 'great service from ' + biz}
TIMING: ${inputs.timing || '24 hours after service'}

## ${biz} — Review Request Campaign

### The Review Reality for ${ind} Businesses in ${city}
[Why Google/platform reviews matter specifically for ${biz} in ${city} — local SEO impact, trust signal for new customers]

---

### Request Message

**${inputs.request_channel === 'whatsapp' ? 'WhatsApp' : 'Email/SMS'} — Send ${inputs.timing || '24 hours after service'}:**

[FULL MESSAGE — short, warm, specific to their experience, makes leaving a review feel easy and important]

**Direct Review Link:**
[Instruction on how to create and include a direct Google review link]
[QR code recommendation]

---

### The 3-Step Guide You Send Them
[Simple, visual step-by-step for leaving a Google review — specifically for Nigerian users on Android/iOS]
[Acknowledge that some customers struggle with this — make it easy]

---

### Follow-Up Sequence

**If no review after 3 days:** [Exact follow-up — gentle reminder with why it matters]
**If they do leave a review:** [Exact thank-you message — immediate, warm, personal]

---

### How to Respond to Reviews

**5-star response template:** [Warm, personal, mentions ${city} — builds SEO value]
**4-star response template:** [Grateful + asking what could make it 5-star next time]
**3-star or below:** [Use CrisisResponder tool — link suggestion]

End with the CEREBRE TIP about Google reviews for ${ind} businesses in ${city}.`

    case 'crisis-responder':
      return `ACTIVATE: Crisis communications specialist mode — Cerebre Plus Law 3 (Trust) + professional de-escalation are PRIMARY.

TASK: Write crisis response for ${biz} in ${city}.
CRISIS TYPE: ${inputs.crisis_type || 'negative review'}
COMPLAINT SUMMARY: ${inputs.complaint_summary || 'a customer complaint that needs addressing'}
IS COMPLAINT VALID: ${inputs.is_complaint_valid || 'partially'}
RECOVERY OFFER: ${inputs.recovery_offer || 'resolution and goodwill gesture'}

## ${biz} — Crisis Response Strategy

### Crisis Assessment
**Severity:** [High/Medium/Low — with reasoning]
**Audience Reach:** [Who has seen this — and how to limit spread]
**Response Timeline:** [How fast to respond — RULE: within 2 hours for public complaints in Nigeria]

---

### Public Response (${inputs.response_platform || 'platform'})

[FULL PUBLIC RESPONSE — follow these rules:]
[✓ Acknowledge without full admission if complaint is disputed]
[✓ Express genuine empathy — not scripted sympathy]
[✓ Take it offline immediately: "Please WhatsApp us directly: ${wa}"]
[✓ Never argue publicly — ever]
[✓ Never write a wall of text — 3 sentences maximum public response]
[✓ Sound like a real person, not a corporate PR department]

---

### Private Resolution Script (WhatsApp: ${wa})

[Full WhatsApp conversation script — step by step]
[Opening: acknowledge their frustration personally]
[Middle: gather full information before offering resolution]
[Resolution: ${inputs.recovery_offer || 'the offered resolution'}]
[Close: ensure they feel heard and valued before ending]

---

### The Nigerian Market Reality
[How Nigerian consumers respond to different crisis handling approaches]
[The community spread risk — WhatsApp groups and how to contain]
[How a well-handled crisis can INCREASE trust — specific examples]

---

### Reputation Repair Plan (7 Days After Crisis)
[Specific steps to rebuild trust with the broader audience]
[Content to post that demonstrates the issue was resolved]
[How to use this crisis to generate future trust — the "we listened and improved" story]

End with the CEREBRE TIP about crisis management for Nigerian businesses.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 8 — SEO & DISCOVERABILITY
    // ══════════════════════════════════════════════════════════

    case 'local-seo-kit':
      return `ACTIVATE: Local SEO specialist mode — Cerebre Plus Law 3 (Trust/Specificity) is PRIMARY for local signals.

TASK: Build a local SEO strategy for ${biz} in ${city}.
BUSINESS LOCATION: ${inputs.business_location || p.address || city}
SERVICE AREAS: ${inputs.service_areas || city}
PRIMARY SERVICE: ${inputs.primary_service || ind}
SEO PRIORITY: ${inputs.seo_priority || 'rank higher on Google Maps'}

## ${biz} — Local SEO Kit for ${city}

### Why Local SEO Is the Highest ROI Marketing for ${ind} in ${city}
[The Awoof Math: ranking #1 on Google Maps for "${ind} ${city}" generates [X] monthly searches — value vs. cost of paid ads to get same traffic]

---

### Google Business Profile Optimisation

**Category Selection:**
[Primary category + 3–5 secondary categories most relevant to ${biz} in ${city}]

**Business Name (GBP):** [Exactly as registered — keyword inclusion rules]

**Business Description (750 chars max):**
[Full optimised description — include: primary keyword "${inputs.primary_service || ind}" + "${city}" + trust signals + WhatsApp: ${wa}]

**Services to Add:**
[10 specific services with descriptions — all with local keywords]

**Attributes to Enable:**
[All relevant attributes for ${ind} business — specific to ${city} audience]

---

### Keyword Strategy for ${city}

**Primary Keywords (Target these first):**
[5 high-value, realistic-to-rank local keywords for ${biz}]

**Long-Tail Keywords (Rank faster):**
[10 specific long-tail searches Nigerians use for ${ind} in ${city}]
[Include "${city} area" variants, "near [landmark]" variants, Nigerian English variants]

**"Near Me" Optimisation:**
[Specific actions to improve ranking for "near me" searches in ${city}]

---

### Review Strategy
[Target review count to rank #1 for "${inputs.primary_service || ind} ${city}"]
[Monthly review acquisition target and method — using ReviewRequestor outputs]
[How to respond to reviews for maximum SEO impact]

---

### Citation Building
[Top 10 Nigerian business directories to list ${biz} on]
[NAP consistency rules: exact name, address, phone format to use everywhere]
[Specific directories most relevant to ${ind} in ${city}]

---

### Content Plan for Local SEO
[5 blog post topics that rank for "${city}" + "${ind}" searches]
[FAQ page content that targets voice search / conversational queries]

---

### Local Link Building
[5 realistic link building opportunities in ${city} for ${ind} business]

End with the CEREBRE TIP about local SEO for ${ind} businesses in Nigerian cities.`

    case 'keyword-hunter':
      return `ACTIVATE: SEO keyword research specialist mode — Nigerian search intent is PRIMARY.

TASK: Find keyword strategy for ${biz} in ${city}.
SEED TOPIC: ${inputs.seed_topic || ind}
TARGET CITIES: ${inputs.target_cities || city}
KEYWORD INTENT: ${inputs.keyword_intent || 'buying'}

## ${biz} — Keyword Strategy for ${city}

### The Nigerian Search Insight
[How Nigerians search for ${inputs.seed_topic || ind} differently from global patterns]
[Nigerian English vs. Standard English keyword variants]
[Mobile voice search patterns specific to Nigerian Android users]

---

### Keyword Research Results

**High-Intent Buying Keywords (Target First):**
| Keyword | Monthly Searches (Est.) | Competition | Priority |
|---------|------------------------|-------------|----------|
[15 specific keywords with realistic Nigerian market estimates]

**Local Keywords (${city}-Specific):**
[10 keywords with ${city} and local area modifiers]
[Include neighbourhood-level keywords for ${city}: Lekki, VI, etc.]

**Long-Tail (Easy Wins):**
[10 longer phrases with high intent and lower competition]

**Nigerian English Variants:**
[5–8 terms Nigerians use that differ from global terminology — specific to ${inputs.seed_topic || ind}]

---

### Competitor Keyword Gaps
[Based on typical ${ind} businesses — what keywords they likely rank for that ${biz} should target]

### Content Cluster Plan
[The topic cluster strategy: 1 pillar page + 5 cluster pages to dominate ${city} search for ${ind}]

### Quick Wins (Rank in 30–60 Days)
[5 low-competition, high-intent keywords ${biz} can realistically rank for quickly]

End with the CEREBRE TIP about SEO keyword strategy for Nigerian businesses.`

    case 'website-copy-audit':
      return `ACTIVATE: Conversion copywriter + UX audit mode — ALL Cerebre Plus Laws used as the audit framework.

TASK: Audit website copy for ${biz} in ${city}.
WEBSITE URL: ${inputs.website_url || 'provided by user'}
HOMEPAGE COPY: ${inputs.homepage_copy || 'website copy to be analysed'}
DESIRED ACTION: ${inputs.what_you_want_visitors_to_do || 'WhatsApp enquiry'}

## ${biz} — Website Copy Audit

### The Nigerian Buyer Lens
[How a potential ${city} customer experiences this website — what they see, what they feel, what they do]

---

### Cerebre Plus Law Audit (10-Point Scoring)

| Law | Score (1–10) | Key Issue | Fix Priority |
|-----|-------------|-----------|-------------|
| LAW 1: AWOOF (Value comparison) | [X]/10 | [Issue] | HIGH/MED/LOW |
| LAW 2: LIST (Lead collection) | [X]/10 | [Issue] | |
| LAW 3: TRUST (Specificity/FOBE) | [X]/10 | [Issue] | |
| LAW 4: FEAR (Cost of inaction) | [X]/10 | [Issue] | |
| LAW 5: GIANT PROMISE (Bold claims) | [X]/10 | [Issue] | |
| LAW 6: STORY (Narrative presence) | [X]/10 | [Issue] | |
| LAW 8: CUSTOMER BEHAVIOUR (Ease) | [X]/10 | [Issue] | |
| LAW 9: COMMUNITY VALIDATION | [X]/10 | [Issue] | |
| LAW 10: URGENCY | [X]/10 | [Issue] | |

**Overall Conversion Score: [X]/90**

---

### Critical Issues (Fix These First)

**Issue 1 — [Most Critical]:**
Current copy: "[what it says now]"
Why it fails: [specific reason based on Nigerian buyer behaviour]
Rewrite: "[improved copy — immediately usable]"

[Repeat for top 5 issues]

---

### The WhatsApp Gap
[Specific audit of how easy it is to WhatsApp ${biz} — and the fix]

### Hero Section Rewrite
[Full rewritten homepage headline + subheadline + CTA button text]

### About Page Rewrite
[Key trust signals to add. Current vs. recommended.]

### CTA Optimisation
[Every CTA on the site — current vs. recommended — specific WhatsApp integration]

End with the CEREBRE TIP about website conversion optimisation for Nigerian audiences.`

    // ══════════════════════════════════════════════════════════
    // CATEGORY 9 — GROWTH & RETENTION
    // ══════════════════════════════════════════════════════════

    case 'referral-program-builder':
      return `ACTIVATE: Growth specialist mode — Cerebre Plus Laws 1, 9, 10 are PRIMARY. Community validation is KEY.

TASK: Design a referral programme for ${biz} in ${city}.
REWARD TYPE: ${inputs.referral_reward_type || 'cash transfer'}
REWARD VALUE: ${inputs.reward_value || '₦2,000 per successful referral'}
WHAT COUNTS AS CONVERSION: ${inputs.what_counts_as_conversion || 'first purchase'}
TRACKING METHOD: ${inputs.tracking_method || 'referral code'}
PROGRAMME NAME: ${inputs.programme_name || `${biz} Referral Programme`}

## ${biz} — Referral Programme: Complete Design + Launch Plan

### Programme Overview

**Programme Name:** ${inputs.programme_name || `The ${biz} Inner Circle`}
**Core Mechanic:** ${inputs.reward_value || '₦2,000'} for every person you refer who [${inputs.what_counts_as_conversion || 'makes a purchase'}]
**Tracking:** ${inputs.tracking_method || 'unique referral code per customer'}

---

### The Awoof Stack for Referrers
[Make the referral reward feel outrageously generous compared to the effort required]
"Send one WhatsApp message → ${inputs.reward_value || '₦2,000'} in your account"
[Lifetime value calculation: if they refer X people per month = ₦[X] additional income]

---

### Programme Launch Announcement

**WhatsApp Broadcast to Existing Customers:**
[Full message — personal, exciting, makes them feel special for being included as an "inner circle" member]

**Instagram Announcement Post:**
[Full caption + visual direction]

---

### The Referral Script (What Your Customers Send)

[Exact WhatsApp message template for customers to send to friends]
[Short, natural, not salesy — feels like a genuine recommendation]
[Includes referral code and ${biz}'s WhatsApp: ${wa}]

### The Referral Code System
[How to set up and track codes — practical steps for ${biz}]
[Google Sheet template structure]
[How to process payments quickly — builds trust with referrers]

---

### The Gamification Layer
[Tiered rewards for top referrers — creates competition and community]
[Monthly leaderboard or recognition — Nigerian community culture activation]

### FAQ for Participants
[5 common questions + answers]

End with the CEREBRE TIP about referral programmes in the Nigerian market.`

    case 'newsletter-ai':
      return `ACTIVATE: Email/newsletter specialist mode — Cerebre Plus Laws 2, 6 are PRIMARY.

TASK: Write a ${inputs.newsletter_type || 'weekly value'} newsletter for ${biz} in ${city}.
MAIN TOPIC: ${inputs.main_topic || `Insights for ${aud} from ${biz}`}
LENGTH: ${inputs.newsletter_length || 'medium (500–700 words)'}
INCLUDE OFFER: ${inputs.include_offer !== false ? `Yes — ${inputs.offer_details || 'soft WhatsApp CTA'}` : 'No — pure value'}

## ${biz} Newsletter — [Edition Number/Date]

**Subject Line Options (A/B test):**
A: [Curiosity-based — makes them wonder what's inside]
B: [Benefit-based — states the value directly]
C: [Story-based — opens a loop they need to close]

**Preview Text (35 chars):** [Supporting the subject line — adds intrigue]

---

### Newsletter Body

**Opening — The Hook (Law 6 — Story)**
[2–3 sentences opening with a specific story or surprising fact. NOT "Hello, it's ${biz} again." Opens with value immediately.]

**Section 1 — The Main Value**
[The core content — specific, actionable, Nigerian-market relevant]
[Must deliver genuine insight that ${aud} in ${city} would not easily find elsewhere]
[Short paragraphs. Sub-headers. Easy to scan on mobile.]

${inputs.newsletter_length !== 'short' ? `**Section 2 — The Supporting Point**
[A secondary insight that reinforces the main section]` : ''}

**The Trust Builder**
[One specific thing ${biz} has achieved, learned, or helped a ${city} client with this week — real, specific, honest]

${inputs.include_offer !== false ? `**The Soft Offer**
[Natural bridge from value to the offer — never feels like a sell]
[Offer: ${inputs.offer_details || `Free consultation for ${city} readers this week`}]
[WhatsApp: ${wa}]` : ''}

**The Close**
[Warm, personal sign-off. From a person, not a company.]

**P.S.:**
[One final insight, teaser for next edition, or soft urgency on the offer]

---

**Best Send Day/Time for ${city} Audience:** [Specific recommendation with reasoning]
**Expected Open Rate:** [Nigerian email benchmark]

End with the CEREBRE TIP about email newsletters for Nigerian businesses.`

    case 'win-back-campaign':
      return `ACTIVATE: Customer retention specialist mode — Cerebre Plus Laws 2, 5, 10 are PRIMARY.

TASK: Create a win-back campaign for ${biz} in ${city}.
INACTIVE DURATION: ${inputs.inactive_duration || '90 days'}
LIKELY REASON: ${inputs.likely_reason_left || 'forgot about us'}
WIN-BACK INCENTIVE: ${inputs.winback_incentive || 'special comeback offer'}
CHANNEL: ${inputs.winback_channel || 'WhatsApp'}
MESSAGES: ${inputs.num_messages || '3'}

## ${biz} — Win-Back Campaign

### The Win-Back Reality
[Cost of acquiring a new customer vs. re-activating this one: specific ₦ comparison]
[The Awoof Math for win-back investment]

---

### Message Sequence

## Message 1 — "We've Missed You" (Day 1)
[Warm, personal, zero selling. Reference their last experience with ${biz} if possible. No offer yet. Pure relationship rebuilding.]

## Message 2 — "Here's What's New" (Day 4)
[Show what has changed or improved at ${biz} since they were last there. Address the likely reason they left without mentioning it directly. Soft introduction of the comeback offer.]
[Incentive: ${inputs.winback_incentive || 'special offer for returning customers'}]

## Message 3 — "Last Chance" (Day [deadline-1 from now])
[Pure urgency. The offer expires. This is their last chance at this price/offer. Real scarcity. One clear action.]
[WhatsApp: ${wa}]

---

### Segmentation Strategy
[How to divide inactive customers by: value, time inactive, product purchased — and tailor the message accordingly]

### The "Why Did They Leave" Analysis
[What the most common reasons ${ind} customers go inactive in ${city} — and how to address each in the win-back]

### Success Metrics
[What win-back success looks like for ${biz}: realistic re-activation rate for Nigerian market]

End with the CEREBRE TIP about customer retention for ${ind} businesses in Nigeria.`

    default:
      return `ACTIVATE: Nigerian marketing specialist mode — All 10 Cerebre Plus Laws apply.

TASK: Generate high-quality marketing output for ${biz} in ${city} (${ind} industry).
REQUEST: ${JSON.stringify(inputs)}

Apply all mandatory output requirements:
- Use the business profile fully — no placeholders
- Include specific Nigerian context: ${city}, Nigerian buyers, ₦ pricing
- Apply at least Laws 1 (Awoof), 3 (Trust), and 4 (Fear)
- Include WhatsApp CTA: ${wa}
- End with 💡 CEREBRE TIP

Generate a comprehensive, immediately usable output.`
  }
}
