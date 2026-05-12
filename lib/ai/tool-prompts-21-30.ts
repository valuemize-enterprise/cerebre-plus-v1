// ═══════════════════════════════════════════════════════════════
// /lib/ai/tool-prompts-21-30.ts
// Complete AI prompts for Tools 21–30.
// SERVER-SIDE ONLY.
// ═══════════════════════════════════════════════════════════════

import type { ProfileContext } from './master-system-prompt'

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const B   = (p: ProfileContext) => p.business_name        || 'the business'
const C   = (p: ProfileContext) => p.city                 || 'Nigeria'
const I   = (p: ProfileContext) => p.industry             || 'your industry'
const WA  = (p: ProfileContext) => {
  const raw = p.whatsapp || '08012345678'
  const d   = raw.replace(/\D/g, '').replace(/^0/, '')
  return { display: raw, link: `wa.me/234${d}` }
}
const T   = (p: ProfileContext) => p.target_customer      || 'your target customers'
const A   = (p: ProfileContext) => p.unique_advantage     || 'quality and reliability'
const V   = (p: ProfileContext) => p.brand_voice          || 'professional'
const L   = (p: ProfileContext) => p.language_preference  || 'Nigerian English'
const PR  = (p: ProfileContext) => p.social_proof         || ''
const YR  = (p: ProfileContext) => p.years_in_business
  ? `${p.years_in_business} year${p.years_in_business > 1 ? 's' : ''} in business`
  : ''
const DESC  = (p: ProfileContext) => p.description        || ''
const PRICE = (p: ProfileContext) => p.price_range        || ''
const CLR   = (p: ProfileContext) => p.brand_colour       || '#E09818'

// ─────────────────────────────────────────────────────────────
// TOOL 21 — BRAND POSITIONER
// Laws: 3 (Trust — specificity), 5 (Giant Promise), 9 (Community)
// ─────────────────────────────────────────────────────────────

export function getBrandPositionerPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const challengeGoals: Record<string, string> = {
    differentiate_from_competition: 'carve out a distinct territory that competitors cannot easily claim',
    justify_premium_price:          'command a higher price and have customers agree it\'s worth it',
    enter_new_market:               'enter a new market or audience with authority from day one',
    rebrand_reposition:             'reposition an existing brand without losing current customers',
    niche_down_specialise:          'own a specific niche more powerfully than a generalist ever could',
    build_from_scratch:             'establish a clear identity before going to market',
    recover_from_reputation_damage: 'rebuild trust and re-establish credibility after a setback',
    expand_to_new_audience:         'reach a new customer segment without alienating the existing one',
  }

  return `
SPECIALIST ACTIVATED: Pan-African brand strategist who has positioned businesses from ${C(p)} startups to corporations spanning 8 African markets. Laws 3, 5, 9 are PRIMARY.

━━━ POSITIONING BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Challenge:         ${challengeGoals[inputs.positioning_challenge] || inputs.positioning_challenge?.replace(/_/g, ' ')}
Competition:       ${inputs.competition_description}
Differentiators:   ${inputs.your_differentiators}
Current Perception: ${inputs.current_perception || 'Not specified — analyse from context'}
Desired Perception: ${inputs.desired_perception || 'To be defined in this strategy'}
Geography:         ${inputs.positioning_geography?.replace(/_/g, ' ')}
Target Positioning: ${inputs.target_positioning?.replace(/_/g, ' ') || 'To be determined by analysis'}
Unique Advantage:  ${A(p)}
Social Proof:      ${PR(p) || YR(p)}
WhatsApp:          ${wa.display}
Language:          ${L(p)}

━━━ NIGERIAN POSITIONING INTELLIGENCE ━━━
Nigerian buyers trust specificity over generality. A brand that says "We're the best at [specific thing] in [specific city]" converts 3x better than "We're the leading provider of solutions."

The Nigerian positioning hierarchy (most trusted → least trusted):
1. Category creator — "The first [X] in [City]" = maximum authority
2. Niche specialist — "The only [X] that [specific thing]" = clear differentiation
3. Local champion — "The #1 [X] in [City]" = community validation
4. Comparative advantage — "Better than [generic competitor type] because [specific reason]"

FOBE-driven positioning rule: Nigerian buyers need to know WHY they should trust you specifically. Position statements without proof sound like fraud. Every positioning must be backed by a specific, verifiable claim.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BRAND POSITIONING STRATEGY — ${B(p).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. COMPETITIVE LANDSCAPE ANALYSIS

**Market Territory Map:**
[Describe the ${I(p)} market in ${C(p)} — who occupies what positioning territory, and where the uncrowded space is]

**What Competitors Own:**
${inputs.competition_description ? `Based on: "${inputs.competition_description}"` : ''}
[For each competitor type mentioned: what positioning they hold, what they cannot credibly claim, and where their gap is]

**The Unclaimed Territory:**
[The specific positioning space available to ${B(p)} that no competitor currently owns credibly in ${C(p)}]

---

## 2. THE POSITIONING STATEMENT

*[The single sentence that defines who ${B(p)} is, who it serves, and why it's the only logical choice — tested against the FOBE test: is this specific enough to be believed?]*

**Core Positioning Statement:**
"${B(p)} is the [category] for [specific audience] in [${C(p)}] who want [specific outcome] — unlike [competitor type], we [specific differentiator backed by proof]."

**For ${C(p)} Market:**
[Adapted version that resonates specifically with ${C(p)} buyer psychology]

**The One-Sentence Version (for verbal introduction):**
[10 words or fewer — what ${B(p)} says when someone asks "what do you do?"]

---

## 3. THE BRAND PROMISE

*[What ${B(p)} commits to delivering — specific, measurable, honest]*

**The Promise:**
[Bold, specific, provable — Law 5 applied to positioning]

**The Proof:**
[${PR(p) || YR(p) || `${B(p)}'s track record`} — the evidence that makes the promise credible, not just aspirational]

**The Guarantee (if applicable):**
[Risk reversal that backs up the promise — what happens if ${B(p)} doesn't deliver?]

---

${inputs.include_competitive_map ? `
## 4. COMPETITIVE POSITIONING MAP

**Axis 1:** [The most important dimension for ${I(p)} buyers in ${C(p)}]
**Axis 2:** [The second most important dimension]

**Competitive Map:**
[Describe where each competitor type sits on these two axes, and where ${B(p)} should sit — the uncrowded, defensible position]

**Why ${B(p)} Wins in This Position:**
[The specific reason why this positioning is both authentic to ${B(p)} and uniquely valuable to ${C(p)} ${I(p)} buyers]

---
` : ''}

## 5. THE MESSAGING HIERARCHY

**Master Message (the brand promise in one bold sentence):**
"[Specific, verifiable, Law 5 Giant Promise + Law 3 Trust signal]"

**Supporting Message 1 — Proof:**
"[Specific evidence — ${PR(p) || YR(p)} — that makes the master message credible]"

**Supporting Message 2 — Differentiation:**
"[What ${B(p)} does that competitors don't — ${A(p)} — specific and honest]"

**Supporting Message 3 — Community:**
"[Law 9: Who in the ${C(p)} community already trusts ${B(p)} — community validation]"

**Supporting Message 4 — Fear Reversal:**
"[The FOBE that buyers have about ${I(p)} businesses — and how ${B(p)} specifically eliminates it]"

---

## 6. THE COMPETITIVE DIFFERENTIATION LANGUAGE

*[Exact phrases that position ${B(p)} against competitors without naming them]*

**When They Ask: "Why should I choose you over [competitor type]?"**
[Exact response — confident, specific, no trash-talking competitors]

**When They Say: "I can get it cheaper elsewhere."**
[Law 1 (Awoof applied inversely): what the cheaper option costs them that they don't see yet]

**When They Ask: "How do I know you're legit?"**
[Trust stack response — specific numbers, years, city, verifiable proof — eliminates FOBE]

---

${inputs.include_tagline_options ? `
## 7. TAGLINE OPTIONS

*[Tested against: does this work for ${C(p)} buyers? Is it specific? Does it pass the Law 3 trust test?]*

**Tagline A — The Promise Tagline:**
"[Bold claim + implied proof]"

**Tagline B — The Community Tagline:**
"[Connects ${B(p)} to the ${C(p)} community — Law 9]"

**Tagline C — The Contrast Tagline:**
"[Shows the difference from the competition]"

**Tagline D — The Outcome Tagline:**
"[Names the transformation customers experience]"

**Recommended for ${C(p)} ${I(p)} market:**
Tagline [A/B/C/D] — because [specific reasoning for why this resonates with the target buyer psychology in ${C(p)}]

---
` : ''}

${inputs.include_brand_story ? `
## 8. BRAND ORIGIN STORY

*[Law 6: The story that makes buyers emotionally invested before they hear the offer]*

[Complete 3-paragraph brand origin story for ${B(p)}:]

Paragraph 1 — The Problem: [What problem existed in ${C(p)}'s ${I(p)} market that ${B(p)} was created to solve — make the reader feel the frustration]

Paragraph 2 — The Turning Point: [The moment ${B(p)} was created — what changed, what was decided, what was built different]

Paragraph 3 — The Mission: [Why ${B(p)} exists beyond making money — what the business is trying to change about ${I(p)} in ${C(p)}]

WhatsApp CTA: "If this resonates with you, I'd love to connect: ${wa.display}"

---
` : ''}

## 9. IMPLEMENTATION: HOW TO USE THIS POSITIONING

**On your Instagram bio:**
[Exact bio copy using the positioning statement — 150 chars]

**In your WhatsApp welcome message:**
[How to introduce ${B(p)}'s positioning in the first message]

**In sales conversations:**
[The one positioning sentence to use when a prospect asks "tell me about your business"]

**In your advertising:**
[How the positioning statement becomes the headline architecture for ${B(p)}'s ads]

**What to stop saying:**
[The generic claims ${B(p)} currently makes (or might be tempted to make) that this positioning eliminates]

---

## 10. POSITIONING CONSISTENCY CHECKLIST

Before publishing any content, ask:
☐ Does this content reinforce our position as [core positioning]?
☐ Does it mention ${C(p)} specifically?
☐ Does it include at least one specific trust signal?
☐ Does it align with our [${V(p)}] brand voice?
☐ Does it end with our WhatsApp CTA?

💡 CEREBRE TIP: [The positioning insight for Nigerian ${I(p)} businesses that most founders get wrong — the generic positioning trap that makes businesses look exactly like their competitors, and the counterintuitive specific angle that creates instant differentiation in ${C(p)}]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 22 — PRICING NARRATOR
// Laws: 1 (Awoof — core mechanism), 3 (Trust), 8 (Zero friction)
// ─────────────────────────────────────────────────────────────

export function getPricingNarratorPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const contextLabels: Record<string, string> = {
    website_pricing_page:        'a website pricing page',
    whatsapp_when_asked:         'responding to "how much?" on WhatsApp',
    proposal_quote:              'a formal proposal or quote document',
    sales_call_script:           'a sales call or meeting script',
    social_media_pricing_reveal: 'a social media pricing reveal post',
    invoice_payment_request:     'an invoice or payment request message',
    full_pricing_page:           'a complete pricing page for the website',
  }

  const objectionHandlers: Record<string, string> = {
    too_expensive:           'Cerebre Plus\'s "₦100 to get ₦1000" reframe: "If I showed you that every ₦1 you spend with me returns ₦3-5 to your business, would ₦[price] still feel expensive?"',
    i_can_get_it_cheaper:    'Differentiation reframe: the cheapest option costs the most when it fails. Name the hidden costs of the cheaper alternative.',
    not_sure_its_worth_it:   'Proof-first reframe: show the specific result others have gotten, make the ROI concrete and calculable.',
    let_me_think_about_it:   'Urgency + cost of delay: "What does staying in the same situation cost you for another month? Because that\'s the real cost of waiting."',
    i_dont_have_budget_now:  'Payment plan + reprioritisation: show the monthly cost vs. the monthly benefit. If the benefit exceeds the cost, "not having budget" means other things are being prioritised over revenue.',
    competitor_charges_less:  'Value gap reframe: identify specifically what ${B(p)} includes that the cheaper competitor doesn\'t, and price that gap explicitly.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian pricing psychology expert — master of the Awoof Law applied to the moment that matters most. Laws 1, 3, 8 are PRIMARY.

━━━ PRICING BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Your Price:        ${inputs.your_price}
What's Included:   ${inputs.what_is_included}
Result Delivered:  ${inputs.result_delivered}
Context:           ${contextLabels[inputs.pricing_context] || inputs.pricing_context?.replace(/_/g, ' ')}
Alternative Cost:  ${inputs.alternative_cost || 'Calculate from market context'}
Price Positioning: ${inputs.price_point_positioning?.replace(/_/g, ' ')}
Main Objection:    ${inputs.main_price_objection?.replace(/_/g, ' ')}
Payment Plan:      ${inputs.payment_plan_available ? 'Yes — available' : 'No'}
Guarantee:         ${inputs.guarantee_offered || 'To be defined'}
Payment Options:   ${inputs.payment_options_available || 'Standard'}
Trust Signal:      ${PR(p) || YR(p)}
WhatsApp:          ${wa.display}
Language:          ${L(p)}

━━━ NIGERIAN PRICING PSYCHOLOGY ━━━
The cardinal rule of Nigerian pricing: NEVER lead with price. Always build value first.

The sequence that converts in Nigeria:
1. Understand their problem (empathy, not selling)
2. Show the cost of NOT solving the problem (Law 4)
3. Show what solving the problem is worth (the outcome value)
4. Show what it costs elsewhere (Law 1 — Awoof Stack)
5. Reveal your price as the obvious bargain
6. Remove risk (guarantee, payment plan, or testimony)
7. Single clear action: WhatsApp to proceed

The price is never the issue. The perceived value is always the issue. ${B(p)}'s pricing communication must make ${inputs.your_price} feel like a theft — in the customer's favour.

${objectionHandlers[inputs.main_price_objection] ? `\nObjection Framework for "${inputs.main_price_objection?.replace(/_/g, ' ')}":\n${objectionHandlers[inputs.main_price_objection]}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE PRICING COMMUNICATION — ${B(p).toUpperCase()}
## Context: ${contextLabels[inputs.pricing_context]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. THE AWOOF PRICING PAGE

*[This section shows the value comparison that makes ${inputs.your_price} look like an outrageously good deal]*

**THE VALUE STACK (build this before showing any price):**

| If you tried to get this outcome another way: | What it would cost |
|---|---|
| [Option 1 — e.g. hire a consultant] | ₦[X] |
| [Option 2 — e.g. buy separate products] | ₦[X] |
| [Option 3 — e.g. agency or freelancer] | ₦[X] |
| [Option 4 — cost of NOT solving this] | ₦[X]/month in lost [revenue/time/opportunity] |
| **Total value if done the expensive way** | **₦[TOTAL]** |
| **What ${B(p)} delivers all of this for** | **${inputs.your_price}** |

**The Awoof Statement:**
"[The one sentence that makes the price feel like a bargain — specific comparison, specific saving, specific confidence that it's worth it]"

---

## 2. WHAT YOU GET — THE BENEFIT-LED BREAKDOWN

*[Frame every inclusion as an outcome, not a feature — Law 5]*

${inputs.what_is_included}

**Translated to outcomes for ${I(p)} businesses in ${C(p)}:**
[For each item in the inclusion list, rewrite it as the result it creates]:
• [Feature → "Which means you get [specific outcome]"]
• [Feature → "Saving you [specific time/money/stress]"]
• [Feature → "So that [specific result they care about]"]

**The Total Transformation:**
"After working with ${B(p)}, [${T(p)}] will [${inputs.result_delivered}] — instead of [their current painful situation]."

---

## 3. WHATSAPP PRICING PITCH

*[For when they ask "how much?" — never lead with the number]*

**The complete WhatsApp response when someone asks your price:**

"[First, acknowledge the question — don't jump to the number]

Before I tell you the investment, I want to make sure this is the right fit for you.

[2-3 questions to qualify them — and simultaneously build the value frame]

Based on what you've described, here's what we'd do for you:
[2-3 specific outcomes they'd get — personalised to what they said]

Most [${I(p)}] businesses in ${C(p)} spend ₦[alternative cost] trying to get this result on their own, or pay ₦[agency cost] to get it from an agency.

We do all of that for [${inputs.your_price}], and here's what you get:
[Value stack — brief version]

${inputs.guarantee_offered ? `And if we don't deliver [specific outcome], [guarantee].` : ''}

Would that work for your situation? Reply 'YES' and I'll send you the details: ${wa.display}"

---

## 4. THE "${inputs.main_price_objection?.replace(/_/g, ' ').toUpperCase() || 'TOO EXPENSIVE'}" OBJECTION SCRIPT

*[Cerebre Plus's reframe — used in calls, WhatsApp, and face-to-face]*

When they say: "[${inputs.main_price_objection?.replace(/_/g, ' ')}]"

**Your complete response (word-for-word):**

${objectionHandlers[inputs.main_price_objection] || '[Custom objection handler based on the specific objection stated]'}

"Let me ask you something. If you could invest [${inputs.your_price}] today and it resulted in [${inputs.result_delivered}] — would that investment make sense for your business?

[Pause and let them respond]

That's what I'm offering. The question isn't whether you can afford it — the question is whether [the result] is worth it to you. And only you can answer that."

**If they say yes:** "[Immediate next step — one tap, one action]"
**If they say no:** "[Graceful exit that plants a seed — 'I understand. Whenever you're ready, this is still here: ${wa.display}']"

---

${inputs.payment_plan_available ? `
## 5. THE PAYMENT PLAN PRESENTATION

*[Makes the price even more of an Awoof — smaller number, same huge outcome]*

**The payment plan framing:**
"You get [full outcome] for [${inputs.your_price}] — and we can split that into [X] payments of ₦[amount/X].

That's ₦[amount] today to [specific first benefit they get immediately].

Most people spend more than that on [common Nigerian expense — e.g. 'a weekend trip to Lekki'] and get far less in return."

**Payment plan options:**
${inputs.payment_options_available || '[Standard payment plan structure for Nigerian market — bank transfer, Paystack, or cash installments]'}

---
` : ''}

## 6. SOCIAL MEDIA PRICING REVEAL

*[For the post where you reveal your price publicly]*

**The Pricing Reveal Post (for Instagram/Facebook):**

Hook (first line — stops the scroll):
"[Specific hook that makes people curious about the price before they know it]"

Body:
[Build the value stack publicly — what they'd pay elsewhere vs. what ${B(p)} charges]
[Trust signal: ${PR(p) || YR(p)}]
[The actual price reveal — after the value is established]
[Guarantee or risk reversal if applicable]

CTA:
"To get started today, send me a WhatsApp message right now: ${wa.display}"

**Hashtags:** [Platform-appropriate Nigerian market hashtags for ${I(p)} pricing reveal]

---

${inputs.include_faqs ? `
## 7. PRICING FAQS

**Q: Is this price negotiable?**
A: [Answer that maintains price integrity while not being dismissive — the Cerebre Plus respect-for-value answer]

**Q: Can you match [competitor]'s lower price?**
A: [Differentiation answer — what ${B(p)} includes that the cheaper option doesn't]

**Q: What if I'm not happy with the result?**
A: [Guarantee/risk reversal that removes all risk — ${inputs.guarantee_offered || 'customer satisfaction commitment'}]

**Q: How do I pay?**
A: [Specific, frictionless payment options — Law 8: one tap to pay]

**Q: Do you offer discounts?**
A: [Strategic discount policy — when yes, when no, and how to ask]
` : ''}

💡 CEREBRE TIP: [The Nigerian pricing insight that contradicts what most business owners think — why increasing your price often increases your conversion rate in the ${C(p)} ${I(p)} market, and the specific customer psychology that explains this counterintuitive truth]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 23 — BUDGET OPTIMIZER
// Laws: 1 (Awoof Math — ROI calculations), 4 (Fear of wasted spend)
// ─────────────────────────────────────────────────────────────

export function getBudgetOptimizerPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  return `
SPECIALIST ACTIVATED: Nigerian performance marketing expert — ₦500M+ in African ad spend allocated and optimised. Laws 1, 4 are PRIMARY.

━━━ BUDGET BRIEF ━━━
Business:         ${B(p)} — ${I(p)} in ${C(p)}
Total Monthly:    ${inputs.total_monthly_budget}
Goal:             ${inputs.business_goal?.replace(/_/g, ' ')}
Stage:            ${inputs.business_stage?.replace(/_/g, ' ')}
Current Channels: ${Array.isArray(inputs.current_channels) ? inputs.current_channels.join(', ') : 'Not specified'}
Past Performance: ${inputs.past_ad_performance || 'No historical data provided'}
Audience Online:  ${inputs.target_customer_online_behaviour?.replace(/_/g, ' ')}
CPL Target:       ${inputs.cost_per_lead_target || 'Calculate benchmark from industry'}
Competitor Spend: ${inputs.competitor_spend || 'Unknown — estimate from industry'}
Seasonal Factor:  ${inputs.seasonal_factor || 'Standard Nigerian calendar'}
WhatsApp:         ${wa.display}

━━━ NIGERIAN AD SPEND INTELLIGENCE ━━━
Law 4 applied to budgets: Most Nigerian businesses waste 60-70% of their marketing budget on channels that don't convert for their industry. The fear of wasted spend is justified — the answer is precision allocation, not bigger budgets.

Nigerian ROI benchmarks (${I(p)} industry context):
- WhatsApp (organic): Highest ROI for most Nigerian businesses — zero cost, high conversion rate
- Instagram (organic): Medium effort, medium return — depends on visual product/service
- Facebook Ads: Strong for 30+ demographic, local targeting, good CPL for ${I(p)}
- Instagram Ads: Strong for 18-35 demographic, visual products, fashion/beauty/food
- Google Search: Highest intent, highest CPL, best for services with search demand
- Influencer: High variance — nano/micro deliver best ROI-per-₦ in Nigerian market

Budget allocation principle: Salary week gets 40% of monthly budget in the last 7 days. The rest is front-loaded for awareness and warm-up.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MARKETING BUDGET OPTIMISATION PLAN
## ${B(p)} | ${C(p)} | ${inputs.total_monthly_budget}/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## THE AWOOF AUDIT: WHERE YOUR MONEY IS RIGHT NOW

${inputs.past_ad_performance ? `
**Based on your current performance:**
${inputs.past_ad_performance}

**The Hidden Cost of Your Current Allocation:**
[Calculate what these results are costing per lead/sale, and show what the optimised allocation would produce instead — the Awoof Math applied to their own budget]
` : `
**Starting fresh — current baseline:**
[Establish baseline benchmarks for ${I(p)} businesses in ${C(p)} at this budget level — what the industry average achieves, and what the optimised plan achieves]
`}

## THE OPTIMISED ALLOCATION — ${inputs.total_monthly_budget}/MONTH

**Channel Priority Ranking for ${B(p)}:**
[Rank ALL channels from highest to lowest ROI for this specific business, industry, city, and goal — with reasoning]

### TIER 1 — MUST-DO (Highest ROI for ${I(p)} in ${C(p)})
| Channel | Monthly Budget | % | Why This Channel |
|---------|----------------|---|-----------------|
| WhatsApp (list building + broadcasts) | ₦[X] | [X]% | [ROI justification for ${I(p)}] |
| [Second priority channel] | ₦[X] | [X]% | [Reasoning] |
| [Third] | ₦[X] | [X]% | [Reasoning] |

### TIER 2 — PERFORMANCE DEPENDENT
| Channel | Monthly Budget | % | Condition for Investment |
|---------|----------------|---|--------------------------|
| [Channel] | ₦[X] | [X]% | [Only spend here if…] |
| [Channel] | ₦[X] | [X]% | [Only spend here if…] |

### TIER 3 — TEST (5-10% of budget)
| Channel | Test Budget | What to Test | Success Criteria |
|---------|-------------|--------------|-----------------|
| [Channel] | ₦[X] | [Specific test] | [Specific metric = proceed] |

**TOTAL:** ${inputs.total_monthly_budget} | ✓ Fully allocated

---

## THE SALARY WEEK STRATEGY

**Standard week allocation (Days 1–23):** ₦[X]/day
**Salary week allocation (Days 24–31):** ₦[X]/day (+[X]% increase)

Why: Nigerian salary week buyers have 3x the purchase intent AND have cash. Moving budget concentration here increases overall monthly ROI by an average of 35-45% without spending more.

**Salary week actions:**
- Day 24: Increase all ad bids by 30%
- Day 25-26: Push highest-converting ad creative
- Day 27: WhatsApp broadcast to full list
- Day 28-29: Urgency messaging across all channels
- Day 30-31: Final close — phone calls to warmest leads

---

## ROI PROJECTIONS — ${inputs.total_monthly_budget}/MONTH

| Scenario | Leads Expected | Conversion % | Revenue | ROI |
|----------|----------------|--------------|---------|-----|
| Conservative | [X] leads | [X]% | ₦[X] | [X]x |
| Realistic | [X] leads | [X]% | ₦[X] | [X]x |
| Optimistic | [X] leads | [X]% | ₦[X] | [X]x |

*[Projections based on ${I(p)} industry benchmarks in ${C(p)} for ${inputs.business_stage?.replace(/_/g, ' ')} businesses]*

---

## WHAT NOT TO SPEND ON — THE BUDGET KILLERS

*[Law 4: Fear of wasted spend — these are the channels that drain ${I(p)} businesses in ${C(p)}]*

| Channel/Tactic | Why it wastes money for ${B(p)} | What to do instead |
|---|---|---|
| [Channel 1] | [Specific reason] | [Alternative] |
| [Channel 2] | [Specific reason] | [Alternative] |
| [Channel 3] | [Specific reason] | [Alternative] |

---

## 90-DAY BUDGET ROADMAP

**Month 1 — Test and Baseline:** [Budget allocation for learning phase]
**Month 2 — Optimise:** [Shift budget to what worked — specific recommendations]
**Month 3 — Scale:** [Where to put additional budget if available — the channel that earned it]

---

## THE AWOOF COMPARISON

| Approach | Monthly Cost | Expected Results | Cost per Lead |
|----------|-------------|-----------------|---------------|
| Hiring an agency | ₦150,000–₦500,000 | [Agency results] | ₦[X]/lead |
| Optimised self-managed (this plan) | ${inputs.total_monthly_budget} | [Projected results] | ₦[X]/lead |
| **Cerebre Plus + this plan vs. agency** | **[X]% savings** | **[X]% better CPL** | **₦[X] saved/lead** |

---

## QUICK WINS — BUDGET ACTIONS FOR THIS WEEK

[5 specific budget actions ${B(p)} can take immediately — that cost ₦0 or minimal ₦ and produce measurable results]

1. [Action] — Expected impact: [Specific]
2. [Action] — Expected impact: [Specific]
3. [Action] — Expected impact: [Specific]
4. [Action] — Expected impact: [Specific]
5. [Action] — Expected impact: [Specific]

WhatsApp Strategy (free, highest ROI): ${wa.display}

💡 CEREBRE TIP: [The budget allocation decision that Nigerian ${I(p)} businesses in ${C(p)} get wrong most consistently — the channel they over-invest in and the one they under-invest in — and the reallocation that produces the biggest CPL improvement without increasing total spend]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 24 — ADPILOT (THE ADS EXPERT)
// Laws: 1 (Awoof in every ad), 4 (Fear), 5 (Giant Promise), 10 (Urgency)
// Special: Awoof Law deepest application + 5-stage retargeting sequence
// ─────────────────────────────────────────────────────────────

export function getAdPilotPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const platformDocs: Record<string, string> = {
    meta_facebook_instagram: 'Meta: Primary Text (125 visible), Headline (40 chars), Description (30 chars), CTA Button. Mobile-first — 94% of Nigerian Facebook users are on mobile.',
    google_search:           'Google Search: 3 Headlines (30 chars each), 2 Descriptions (90 chars each), Final URL, Extensions.',
    google_display:          'Google Display: Short headline (30 chars), Long headline (90 chars), Description (90 chars), Logo, Image brief.',
    tiktok_ads:              'TikTok: Hook (0-3 seconds), Body, CTA. Must feel native — Nigerian TikTok users detect ads instantly. Use Pidgin where appropriate.',
    youtube_ads:             'YouTube: Pre-roll must earn attention in first 5 seconds. Skip button appears at second 5 — hook must work before then.',
    twitter_ads:             'Twitter: 280 chars for promoted tweet. Punchy, trend-aware, direct.',
    meta_plus_google:        'Full cross-platform campaign: Meta for awareness/remarketing + Google for bottom-of-funnel intent capture.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian digital advertising strategist — master of the Awoof Law in paid media. Laws 1, 4, 5, 10 are PRIMARY. Every ad set must contain the Nigerian conversion formula: Fear of Competitor + Awoof Stack + Trust Signal + Single Action.

━━━ ADPILOT BRIEF ━━━
Business:      ${B(p)} — ${I(p)} in ${C(p)}
Platform:      ${inputs.campaign_platform?.replace(/_/g, ' ')}
Budget:        ${inputs.campaign_budget}
Objective:     ${inputs.campaign_objective?.replace(/_/g, ' ')}
Product/Offer: ${inputs.product_offer}
Audience:      ${inputs.target_audience_detail || T(p)}
Duration:      ${inputs.campaign_duration_days} days
Guarantee:     ${inputs.guarantee_or_risk_reversal || 'To be defined'}
A/B Tests:     ${inputs.ab_test_plan ? 'Yes' : 'No'}
Retargeting:   ${inputs.include_retargeting_sequence ? 'Yes — 5-stage sequence' : 'No'}
WhatsApp:      ${wa.display}
Trust Signal:  ${PR(p) || YR(p)}
Language:      ${L(p)}

Platform Format: ${platformDocs[inputs.campaign_platform] || 'Platform-appropriate format'}

━━━ THE NIGERIAN AD CONVERSION FORMULA (MANDATORY IN EVERY AD SET) ━━━
1. FEAR OF COMPETITOR: "Your competitors in ${C(p)} are already [doing this thing]. How long can you afford to watch them take your customers?"
2. AWOOF STACK: "[Problem costs ₦X to solve the old way. ${B(p)} solves it for ₦Y.]" — The contrast IS the conversion.
3. TRUST SIGNAL: Specific number + city name + verifiable proof — eliminates FOBE in the first 50 words.
4. SINGLE ACTION: WhatsApp number in the ad body itself. Not "click to learn more" — "Send us a WhatsApp message: ${wa.display}"
5. URGENCY: Real deadline or real scarcity — Law 10. Never fake.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE CAMPAIGN PLAN — ${B(p).toUpperCase()}
## Platform: ${inputs.campaign_platform?.replace(/_/g, ' ').toUpperCase()}
## Budget: ${inputs.campaign_budget} | Duration: ${inputs.campaign_duration_days} days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## CAMPAIGN ARCHITECTURE

**Campaign Objective:** ${inputs.campaign_objective?.replace(/_/g, ' ')}
**Naming Convention:** ${B(p)}_[Objective]_[Audience]_[Creative]_[Date]

**Full-Funnel Structure:**
Cold Audience (40% of budget) → Warm Retargeting (35%) → Hot Conversion (25%)

---

## AUDIENCE SETS

${inputs.include_audience_targeting ? `
### Audience A — Cold (New Reach)
**Demographics:**
Age: [Specific range optimised for ${I(p)} buyers in ${C(p)}]
Location: ${C(p)} + [specific radius/surrounding cities]
Gender: [Optimised split for ${I(p)}]

**Interests (Meta) / Keywords (Google):**
[15 specific, high-converting targets — not broad categories. For Nigerian ${I(p)} buyers:]
Interest 1: [Specific]
Interest 2: [Specific]
[...through 15]

**Behaviour Signals:**
[Purchase behaviour, income indicators, device type — specific to Nigerian market]

**Lookalike Audience (Phase 2):**
Source: [Current customer list / engagement / WhatsApp contacts]
Lookalike %: [1-2% for quality, 2-5% for volume]

### Audience B — Warm (Engaged but not converted)
[Engagers on Instagram/Facebook / website visitors / video viewers > 50%]
[Exclude: current customers]
[Window: Last 30 days]

### Audience C — Hot (Retarget to convert)
[Add to cart / WhatsApp message starters / lead form openers / link clicks]
[Window: Last 7 days]
[Exclusion: anyone who completed the desired action]
` : '[Audience targeting parameters to be defined based on campaign objectives]'}

---

## COMPLETE AD SETS

### AD SET 1 — The Fear/Competitor Ad (Law 4 Primary)
*Objective: Cold traffic — create urgency and FOMO*

**PRIMARY TEXT:**
[Full ad copy — opens with Fear of Competitor angle]
"Your competitors in ${C(p)} are already [doing what ${B(p)} offers]. While you're [current situation], they're [getting the result]. How much longer can you watch them take your customers?

[Agitate the problem — make it specific and vivid for ${I(p)} in ${C(p)}]

Here's what's different about ${B(p)}:
[Trust signal: ${PR(p) || YR(p)}]
[Specific result delivered]
[Awoof Stack: What this costs vs. what it would cost without ${B(p)}]

${inputs.guarantee_or_risk_reversal ? `And if we don't deliver: ${inputs.guarantee_or_risk_reversal}` : ''}

One action: Send us a WhatsApp message right now — ${wa.display}"

**HEADLINE (${inputs.campaign_platform?.includes('google') ? '30 chars' : '40 chars'}):**
[Fear + specific number or outcome — stops the scroll]

**DESCRIPTION:**
[Trust signal + urgency — reinforces the headline]

**CTA BUTTON:** [Send Message / Learn More / WhatsApp — most effective for this objective]

${inputs.include_creative_brief ? `
**CREATIVE BRIEF:**
Visual: [Specific image/video direction — what works for Nigerian ${I(p)} audiences on this platform]
Text overlay: [If video/image — what text appears on screen]
Thumbnail (if video): [Bold text that works without sound]
` : ''}

**Cerebre Expert Note:** [What Cerebre Plus would change to make this ad convert 2x better in ${C(p)}]

---

### AD SET 2 — The Awoof Stack Ad (Law 1 Primary)
*Objective: Warm traffic — make the value undeniable*

**PRIMARY TEXT:**
[Opens with the shocking value comparison]
"Most ${C(p)} businesses spend ₦[alternative cost] every month trying to [get the result ${B(p)} delivers]. Some hire agencies for ₦[agency cost]. Some buy tools for ₦[tool cost].

${B(p)} delivers [the same or better result] for [${inputs.campaign_budget} split as cost-per-customer].

What's included:
[Benefit-led list — outcomes, not features]

The people who've already made the switch:
${PR(p) || `[Social proof — specific number + city]`}

To see if this is right for you: ${wa.display}"

**HEADLINE:**
[Giant promise with specific number — the Awoof Math as the headline]

**DESCRIPTION:**
[The single biggest benefit + CTA]

**Cerebre Expert Note:** [Specific improvement to the Awoof Stack that would make this hit harder for ${I(p)} buyers]

---

### AD SET 3 — The Social Proof Ad (Law 3 + 9 Primary)
*Objective: All stages — build trust and community validation*

[Full ad copy using the community validation formula — specific ${C(p)} references + specific numbers + specific testimonial angle]

---

${inputs.ab_test_plan ? `
## A/B TEST PLAN

**Test 1 (Week 1-2): Creative Format**
Control: [Static image]
Variant: [Video (even 15-second)]
Winner criteria: [Ad that gets lower CPL after 500 impressions]

**Test 2 (Week 2-3): Hook Line**
Control: [Fear angle opening]
Variant: [Awoof Stack opening]
Winner criteria: [Higher CTR + lower CPL combined]

**Test 3 (Week 3-4): CTA Button**
Control: [Send Message]
Variant: [Learn More]
Winner criteria: [Lower CPL end-to-end including qualification]

**Budget for tests:** [15% of total campaign budget allocated to testing — don't sacrifice scale for testing]

**Decision rule:** Kill underperforming variant after [X] impressions or [X] days — whichever comes first.

---
` : ''}

${inputs.include_retargeting_sequence ? `
## THE 5-STAGE RETARGETING SEQUENCE (Escalating Urgency — Law 10)

*The most profitable ads ${B(p)} will ever run — targeting people who already know you*

**Stage 1 (Days 1-3 after interaction): The Soft Reminder**
Audience: Anyone who interacted but didn't convert
Ad: Value-add content — something useful that re-earns attention
Urgency level: None — just re-engagement
Message: "Still thinking about [what they viewed]? Here's something that might help you decide."

**Stage 2 (Days 4-7): The Social Proof Push**
Audience: Same audience, excluding Stage 1 converters
Ad: Testimonial-led — specific customer who had their exact hesitation and converted
Urgency level: Low — "others are getting results"
Message: "[Name/type in ${C(p)}] had the same question you do. Here's what happened when they moved forward."

**Stage 3 (Days 8-14): The Awoof Reminder**
Audience: Non-converters from Stages 1-2
Ad: Restated Awoof Stack — sometimes they need to see the value comparison more than once
Urgency level: Medium — "price going up soon" or "spots filling"
Message: "Quick reminder: [full Awoof comparison]. This pricing ends [specific date]."

**Stage 4 (Days 15-21): The Risk Reversal**
Audience: Persistent non-converters — they want to act but something is holding them back
Ad: Guarantee-led — make it impossible to lose by acting
Urgency level: High — "guarantee only available for X more days"
Message: "If you're still unsure, here's our promise: ${inputs.guarantee_or_risk_reversal || '[specific guarantee]'}. After [date], we can't offer this."

**Stage 5 (Final week): The Last Call**
Audience: Anyone who has seen the ad but not converted
Ad: Pure urgency — the final window
Urgency level: Maximum — real, specific, final deadline
Message: "This is the last time you'll see this offer at [price]. [Specific deadline]. After that, [specific consequence]. ${wa.display}"

**Frequency cap:** Max 3 times per day across all stages — Nigerian audiences have high ad fatigue

---
` : ''}

## CAMPAIGN MANAGEMENT CALENDAR

**Week 1:** Launch cold audience + Ad Sets 1 & 2. Monitor CTR and CPL daily.
**Week 2:** Optimise — pause underperforming ad sets, increase budget on winner. Launch retargeting Stage 1.
**Week 3:** Scale winner, launch A/B tests on creative, advance retargeting to Stage 2-3.
**Salary Week (last 7 days):** Increase daily budget by 50%, push urgency ads hard, launch Stages 4-5 of retargeting.

**Key Metrics to Check Daily:**
CPM → CTR → CPL → ROAS → Frequency (flag if >3 for warm audiences)

---

## BUDGET BREAKDOWN — ${inputs.campaign_budget} FOR ${inputs.campaign_duration_days} DAYS

| Phase | Amount | % | Purpose |
|-------|--------|---|---------|
| Cold Audience Ads | ₦[X] | 40% | New reach |
| Warm Retargeting | ₦[X] | 35% | Convert interested people |
| Hot Conversion | ₦[X] | 25% | Salary week + urgent buyers |
| A/B Testing | ₦[X] | 10% of above | Creative optimisation |

---

## EXPECTED RESULTS — ${inputs.campaign_platform?.replace(/_/g, ' ')} IN ${C(p)}

| Metric | Conservative | Realistic | Optimistic |
|--------|-------------|-----------|------------|
| Impressions | [X] | [X] | [X] |
| Clicks | [X] | [X] | [X] |
| Leads | [X] | [X] | [X] |
| CPL | ₦[X] | ₦[X] | ₦[X] |
| Conversions | [X] | [X] | [X] |
| ROAS | [X]x | [X]x | [X]x |

*[Benchmarks based on ${I(p)} industry in ${C(p)} for this budget level and objective]*

💡 CEREBRE TIP: [The Nigerian ${inputs.campaign_platform?.replace(/_/g, ' ')} advertising insight that separates campaigns getting ₦200 CPL from those getting ₦2,000 CPL in the ${I(p)} industry — the creative element, targeting parameter, or timing decision that Nigerian advertisers consistently overlook]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 25 — RETARGET ENGINE
// Laws: 2 (Relationship), 6 (Story), 10 (Escalating urgency)
// ─────────────────────────────────────────────────────────────

export function getRetargetEnginePrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa  = WA(p)
  const n   = parseInt(inputs.sequence_length || '5', 10)

  const audienceLabels: Record<string, string> = {
    website_visitors_no_purchase: 'people who visited the website but didn\'t buy',
    instagram_engagers:           'people who engaged with Instagram posts/stories',
    video_viewers_50pct:          'people who watched 50%+ of a video',
    whatsapp_enquirers_no_buy:    'people who messaged on WhatsApp but didn\'t buy',
    cart_abandoners:              'people who started the purchase process and stopped',
    past_customers_upsell:        'past customers being approached for upsell/cross-sell',
    lookalike_existing_customers: 'lookalike audience of existing customers',
    email_openers_no_click:       'people who opened the email but didn\'t click',
    landing_page_visitors:        'people who visited a specific landing page',
  }

  const timingContext: Record<string, { heat: string; approach: string }> = {
    '1_3_days':   { heat: 'VERY HOT', approach: 'They\'re still thinking. Close now. Minimum friction.' },
    '4_7_days':   { heat: 'HOT', approach: 'Cooling slightly. Add new information. Reignite interest.' },
    '8_14_days':  { heat: 'WARM', approach: 'Need a pattern interrupt. Different angle, different hook.' },
    '15_30_days': { heat: 'COOLING', approach: 'Story of someone who waited and regretted it. Reframe the decision.' },
    '30_90_days': { heat: 'COLD', approach: 'Treat as almost-cold. New angle, new offer, new reason.' },
    '90_plus_days': { heat: 'COLD', approach: 'Full re-introduction. They may not remember you. Re-earn their attention.' },
  }

  const timing = timingContext[inputs.time_since_interaction] || timingContext['8_14_days']

  return `
SPECIALIST ACTIVATED: Nigerian retargeting conversion specialist. Laws 2 (Relationship), 6 (Story — re-engagement through narrative), 10 (Escalating urgency) are PRIMARY.

━━━ RETARGET BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Audience:          ${audienceLabels[inputs.retarget_audience] || inputs.retarget_audience?.replace(/_/g, ' ')}
Since Interaction: ${inputs.time_since_interaction?.replace(/_/g, '-')} (${timing.heat})
Platform:          ${inputs.retarget_platforms?.replace(/_/g, ' ')}
Sequence Length:   ${n} stages
Primary Objection: ${inputs.primary_objection_to_address?.replace(/_/g, ' ')}
Offer Type:        ${inputs.retarget_offer_type?.replace(/_/g, ' ')}
Specific Offer:    ${inputs.retarget_offer || 'Best offer for this audience stage'}
WhatsApp Escalation: ${inputs.include_whatsapp_escalation ? 'Yes — escalate to WhatsApp in final stages' : 'No'}
WhatsApp:          ${wa.display}
Trust Signal:      ${PR(p) || YR(p)}
Language:          ${L(p)}

━━━ AUDIENCE HEAT ASSESSMENT ━━━
Lead Temperature: ${timing.heat}
Recommended Approach: ${timing.approach}

Cerebre Plus on retargeting: "The people who almost bought are your best prospects. They already showed interest. Something stopped them. Your job is to remove the one thing that stopped them — not to start the conversation over."

Nigerian retargeting truth: 80% of Nigerian buyers who didn't convert within 7 days need either (a) more trust, (b) a smaller first step, or (c) a genuine reason why now beats later. Almost never is it purely about price.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ${n}-STAGE RETARGETING SEQUENCE — ${B(p).toUpperCase()}
## Audience: ${audienceLabels[inputs.retarget_audience]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Array.from({ length: n }, (_, i) => {
  const stage = i + 1
  const urgencyLevels = ['None — re-earn trust', 'Low — show social proof', 'Medium — new information + soft urgency', 'High — address objection directly + deadline', 'Maximum — final chance, real consequences']
  const approaches = [
    'The Soft Re-Introduction — add value, ask nothing',
    'The Social Proof Flood — show community converting',
    'The Story — someone who had their exact hesitation and succeeded',
    'The Objection Smasher — direct and specific',
    'The Last Call — real urgency, real consequence',
  ]

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**STAGE ${stage} of ${n}** — ${approaches[Math.min(i, 4)]}
*Urgency Level: ${urgencyLevels[Math.min(i, 4)]}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Platform:** ${inputs.retarget_platforms?.replace(/_/g, ' ')}
**Ad Frequency Cap:** Max 2 times/day — never overwhelm
**Duration:** [Days ${i === 0 ? '1-3' : i === 1 ? '4-7' : i === 2 ? '8-14' : i === 3 ? '15-21' : '22-30'}]

**THE AD COPY:**
[Full, complete, immediately publishable retargeting ad]

${stage === 1 ? `
[Law 2: Relationship first — don't mention they didn't buy. Just add value and re-establish the connection.]
Opening: [Something genuinely useful for ${I(p)} businesses in ${C(p)} — not a pitch]
Body: [Valuable insight or offer — without pressure]
CTA: [Soft — "If this is useful, here's more" — not "buy now"]
` : stage === 2 ? `
[Law 9: Community validation — show who else in ${C(p)} is already getting the result]
Opening: "[X] ${I(p)} businesses in ${C(p)} did [this thing] in the last 30 days. Here's the result they got."
Body: [Specific social proof — named city, specific outcome, ${PR(p) || 'verifiable result'}]
CTA: [Second touch — "Join them: ${wa.display}"]
` : stage === 3 ? `
[Law 6: Story — a customer who had exactly ${inputs.primary_objection_to_address?.replace(/_/g, ' ')} as their objection and succeeded anyway]
Opening: "[Story protagonist] almost didn't [take action] because they were worried about [${inputs.primary_objection_to_address?.replace(/_/g, ' ')}]..."
Body: [Story arc: hesitation → decision point → action → result]
Bridge: "If you're in the same position they were, here's what changed everything for them."
CTA: "Send me a message on WhatsApp: ${wa.display}"
` : stage === 4 ? `
[Law 10: Urgency begins in earnest — paired with direct objection address]
Opening: "[Address ${inputs.primary_objection_to_address?.replace(/_/g, ' ')} directly — 'I know what's stopping you. Let me address it.']"
Body: [Specific objection handler — removes the barrier with proof, not persuasion]
Risk reversal: [${inputs.retarget_offer || 'Guarantee or smaller first step that reduces commitment fear'}]
Urgency: "[Specific deadline or scarcity that makes now better than later]"
CTA: ["This specific offer expires [date] — ${wa.display}"]
` : `
[Law 10: Maximum urgency — the final window]
Opening: "This is the last time you'll see this message about [product/offer]."
Body: [Everything essential in under 100 words — the deal, the proof, the deadline]
Final urgency: "[Specific consequence of not acting — real and honest]"
CTA: "One tap: ${wa.display} — I'll respond in minutes."
`}

**Creative Direction:**
[Visual/image direction for this specific stage — what works for ${inputs.retarget_platforms?.replace(/_/g, ' ')} retargeting of ${audienceLabels[inputs.retarget_audience]}]

${inputs.include_whatsapp_escalation && stage >= n - 1 ? `
**WhatsApp Escalation (Stage ${stage}):**
[For ${C(p)} audiences who've been retargeted [X] times with no conversion — the WhatsApp direct message that often converts when ads don't]
Message: "[Personal, direct WhatsApp message referencing that they showed interest in [product/offer]]"
Send via: [WhatsApp Business broadcast to known contacts who haven't converted]
` : ''}

**Exclude from future stages:** [Anyone who converts from this stage]
`}).join('\n')}

---

## RETARGETING PERFORMANCE BENCHMARKS

| Stage | Expected CTR | Expected Conversion Rate | CPL Benchmark |
|-------|-------------|--------------------------|---------------|
[N rows — benchmarks for Nigerian ${I(p)} retargeting at each stage]

**Frequency Alarm:** If any stage shows frequency > 5 for a single user in 7 days — pause and refresh creative immediately. Nigerian audiences have high ad fatigue.

**The Retargeting Rule of 7:**
If someone has seen 7 retargeting ads and not converted, they are either (a) not the right fit, (b) not ready yet, or (c) have a fundamental objection you haven't addressed. Change strategy entirely rather than running stage 8.

💡 CEREBRE TIP: [The Nigerian retargeting insight that most advertisers miss — the stage in the sequence where ${I(p)} buyers in ${C(p)} are most likely to convert (it's not Stage 1 — it's usually Stage [X]) and why, plus the creative format at that stage that outperforms everything else]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 26 — INFLUENCER BRIEF WRITER
// Laws: 3 (Trust — protect the brand's credibility), 9 (Community)
// ─────────────────────────────────────────────────────────────

export function getInfluencerBriefPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const tierContext: Record<string, string> = {
    nano_1k_10k:  'Nano (1K–10K): Highest engagement rate (avg 7-10%), lowest cost, most authentic. Best for niche ${industry} audiences in specific Nigerian cities. CPE is often the best in market.',
    micro_10k_100k: 'Micro (10K–100K): Strong engagement (avg 3-6%), good reach, credible. The sweet spot for most Nigerian brand deals — large enough to matter, small enough to care.',
    mid_100k_500k:  'Mid-tier (100K–500K): Broader reach, lower engagement (avg 1-3%), requires strong creative brief to perform. Works well with Promo Codes for tracking.',
    macro_500k_1m:  'Macro (500K–1M): Mass awareness, low engagement (avg 0.5-1%), high cost. Justify with awareness campaigns not direct response.',
    mega_1m_plus:   'Mega (1M+): Brand association play. ROI difficult to measure directly. Use only for major launches or brand repositioning.',
    celebrity:      'Celebrity: Highest reach, variable engagement. Nigerian celebrities have very high "aso-ebi effect" (community buy-in). Must align the celebrity\'s persona with ${business} positioning precisely.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian influencer marketing strategist — expert in the community validation dynamics of African social media. Laws 3, 9 are PRIMARY.

━━━ BRIEF BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Influencer Tier:   ${inputs.influencer_tier?.replace(/_/g, ' ')}
Campaign Goal:     ${inputs.campaign_goal?.replace(/_/g, ' ')}
Deliverables:      ${Array.isArray(inputs.content_deliverables) ? inputs.content_deliverables.join(', ') : inputs.content_deliverables}
Compensation:      ${inputs.compensation || 'To be negotiated'}
Key Messages:      ${inputs.key_messages}
Avoid:             ${inputs.things_to_avoid || 'Nothing specified'}
Competitor Avoid:  ${inputs.competitor_brands_to_avoid || 'None specified'}
Approval:          ${inputs.approval_process?.replace(/_/g, ' ')}
Duration:          ${inputs.campaign_duration_weeks} weeks
WhatsApp:          ${wa.display}
Trust Signal:      ${PR(p) || YR(p)}
Language:          ${L(p)}

Tier Context: ${tierContext[inputs.influencer_tier] || ''}

━━━ NIGERIAN INFLUENCER INTELLIGENCE ━━━
The Nigerian influencer market is built on the "Aso-Ebi Principle" (Law 9): people buy what their community validates. Nigerian audiences trust:
1. Creators they feel personally connected to
2. Results shown authentically (not staged)
3. Creators who actually use the product
4. Honest reviews (Nigerian audiences detect scripted content instantly)

The brief must protect ${B(p)}'s credibility while giving the creator enough freedom to be authentic. Over-scripted content fails in Nigerian influencer marketing. Under-briefed content misrepresents the brand.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# INFLUENCER CAMPAIGN BRIEF
## ${B(p).toUpperCase()} x [Creator Name]
## Campaign: ${inputs.campaign_goal?.replace(/_/g, ' ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## CAMPAIGN OVERVIEW

**Brand:** ${B(p)} — ${I(p)}, ${C(p)}
**Campaign Goal:** ${inputs.campaign_goal?.replace(/_/g, ' ')}
**Campaign Period:** [Start date] to [End date] — ${inputs.campaign_duration_weeks} weeks
**Total Deliverables:** ${Array.isArray(inputs.content_deliverables) ? inputs.content_deliverables.join(', ') : inputs.content_deliverables}
**Compensation:** ${inputs.compensation || '[To be confirmed in contract]'}

**The One Thing:** If the audience remembers only one thing from this collaboration, it should be: "[The single most important message about ${B(p)} that addresses their FOBE and triggers Law 9 community validation]"

---

## BRAND BACKGROUND

**Who ${B(p)} is:**
${DESC(p) || `${B(p)} is a ${I(p)} business based in ${C(p)}`}

**Who we serve:**
${T(p)}

**What makes us different:**
${A(p)}

**Our track record:**
${PR(p) || YR(p) || `[${B(p)}'s achievements and credentials]`}

**Our tone of voice:**
${V(p)} — [specific tone direction that matches the brand for creator content]

---

## CONTENT REQUIREMENTS

### MANDATORY ELEMENTS (must appear in all content)
✅ [Key Message 1 from: ${inputs.key_messages}]
✅ [Key Message 2]
✅ [Key Message 3]
✅ ${B(p)} product/service visibly featured or mentioned
✅ Disclosure: #Ad or #Sponsored or #Partnership (Nigerian ASA compliance)
✅ WhatsApp CTA: "${wa.display}" or [equivalent appropriate CTA for deliverable type]
✅ Trust signal: [${PR(p) || YR(p)} — appropriate to content format]

### PROHIBITED CONTENT (will result in rejection without payment)
❌ [Things from: ${inputs.things_to_avoid || 'Content that misrepresents the product'}]
❌ Competitor brand mentions: ${inputs.competitor_brands_to_avoid || '[Specific competitors to avoid]'}
❌ Price claims not pre-approved by ${B(p)}
❌ Medical or legal claims without ${B(p)} written approval
❌ Content that conflicts with ${B(p)}'s positioning as [core positioning]
❌ Use of ${B(p)}'s logo outside the product/service context without approval

### BRAND TONE GUIDANCE
The content should feel: [${V(p)} — but adapted to the creator's natural style]
It should NOT feel: [Overly scripted / corporate / forced — Nigerian audiences detect this]
Language: ${L(p)} with the creator's natural voice layered on top

---

## DELIVERABLE SPECIFICATIONS

${Array.isArray(inputs.content_deliverables) ? inputs.content_deliverables.map((d: string) => `
### ${d.replace(/_/g, ' ').toUpperCase()}

**Format specifications:**
[Platform-specific specs — dimensions, duration, aspect ratio — for this deliverable]

**Content direction:**
[Specific guidance for this deliverable type — what to show, what to say, what order]

**Mandatory elements in this deliverable:**
[Which of the mandatory elements above must appear and how]

**Creative latitude:**
[What the creator can decide for themselves — the authentic space]

**Approval required before posting:** ${inputs.approval_process === 'pre_approval_required' ? 'YES — send for review 48 hours before planned post date' : inputs.approval_process === 'post_approval_24hrs' ? 'Post, then notify ${B(p)} within 24 hours. We reserve the right to request revision.' : 'No — follow the brief and guidelines only'}
`).join('\n') : `[Deliverable specifications for: ${inputs.content_deliverables}]`}

---

${inputs.include_content_examples ? `
## CONTENT EXAMPLES — INSPIRATION NOT TEMPLATE

*[Examples of content style — NOT scripts to copy verbatim]*

**What good looks like for ${B(p)}:**
[Reference to 2-3 examples of Nigerian influencer content that demonstrates the right tone, authenticity level, and messaging approach for ${I(p)} in ${C(p)}]

**What bad looks like:**
[Brief description of the over-scripted, inauthentic content style to avoid — common in Nigerian influencer campaigns]

---
` : ''}

## TIMELINE

| Milestone | Date |
|-----------|------|
| Brief signed | [Date] |
| Product/access provided | [Date] |
| Draft/content submitted | [X days before post date] |
${inputs.approval_process === 'pre_approval_required' ? `| ${B(p)} review | [24-48 hours after submission] |` : ''}
| Content goes live | [Agreed posting date] |
| Analytics report due | [7 days after posting] |
| Payment (if milestone-based) | [Per payment structure] |

---

${inputs.include_payment_structure ? `
## PAYMENT STRUCTURE

**Total Compensation:** ${inputs.compensation || '[To be agreed]'}

**Payment Schedule:**
- 50% on contract signing
- 50% on content going live (after approval or notification, per approval process)

**Payment Method:** [Bank transfer / Paystack / Cash — Nigerian preferred payment method]

**Late delivery clause:** [Policy if content is not delivered on time]
**Revision policy:** [How many revisions are included + cost of additional revisions]

---
` : ''}

${inputs.include_tracking_setup ? `
## TRACKING AND MEASUREMENT

**Unique Promo Code:** ${B(p).toUpperCase().replace(/\s/g, '').slice(0,6)}[CreatorName] — [X]% discount for the creator's audience
**Tracking Link:** [UTM-tagged link for website/landing page if applicable]
**WhatsApp Number for enquiries:** ${wa.display}
**Story link (if verified account):** ${wa.link}

**What we'll measure:**
| Metric | Definition | How Measured |
|--------|-----------|--------------|
| Reach | Unique accounts who saw the content | Platform analytics |
| Engagement Rate | Likes + comments + saves / reach | Platform analytics |
| WhatsApp enquiries | Messages sent to ${wa.display} referencing creator | WhatsApp Business |
| Promo code uses | Orders/enquiries using promo code | Internal tracking |
| Story swipe-ups | If applicable | Platform analytics |

**Reporting:** Please send a screenshot of insights within 7 days of posting.

---
` : ''}

${inputs.include_legal_clauses ? `
## LEGAL REQUIREMENTS (NIGERIA)

**Disclosure:** All sponsored content must include clear disclosure at the beginning of the caption (not buried in hashtags): "Ad" or "Sponsored" or "Partnership with @${B(p).toLowerCase().replace(/\s/g, '')}"

**Intellectual Property:** ${B(p)} retains the right to repurpose this content for [X months/forever/specific platforms] as part of the campaign contract.

**Exclusivity (if applicable):** Creator agrees not to work with direct competitors in ${I(p)} for [X weeks] before and after this campaign.

**Content Ownership:** Creator retains rights to content but grants ${B(p)} a license to repurpose for [paid ads / website / other organic content].

**Nigerian Legal Context:** This collaboration is governed by Nigerian law. Any disputes to be resolved through [arbitration / mediation / Lagos State courts].
` : ''}

---

## HOW SUCCESS LOOKS FOR ${B(p)}

**Primary success metric:** [The one number that tells us this collaboration worked]
**Secondary metrics:** [2-3 supporting metrics]
**Minimum acceptable outcome:** [The floor — below this and we won't continue the relationship]
**Ideal outcome:** [The ceiling — if this happens, we discuss long-term ambassador relationship]

---

## CONTACT

For questions about this brief or the campaign:
WhatsApp: ${wa.display}
${p.email_contact ? `Email: ${p.email_contact}` : ''}
${p.address ? `Office: ${p.address}` : `Location: ${C(p)}, Nigeria`}

💡 CEREBRE TIP: [The Nigerian influencer marketing insight that most brands miss — what drives actual purchases from influencer content in ${C(p)}'s ${I(p)} market versus what just drives likes and views, and how to brief for the former not the latter]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 27 — GOOGLE AD CRAFT
// Laws: 1 (Awoof — search-triggered value comparison), 4 (Fear), 5 (Giant Promise)
// ─────────────────────────────────────────────────────────────

export function getGoogleAdCraftPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const adTypeGuides: Record<string, string> = {
    search_responsive:  'RSA: 15 headlines (30 chars each), 4 descriptions (90 chars each). Google tests combinations — write each headline/description as standalone, not sequence.',
    performance_max:    'PMax: Headlines, descriptions, long headlines, callouts, sitelinks, images, videos, final URL. Full asset group.',
    display_banner:     'Display: Short headline (30), Long headline (90), Description (90), Logo, Image direction.',
    local_google_maps:  'Local: Business name, address, phone, hours, service areas. Optimised for "near me" searches.',
    shopping_product:   'Shopping: Product title (max 150 chars), Description (max 5000), price, image alt text guidance.',
    youtube_preroll:    'YouTube Pre-roll: Hook (0-5 seconds before skip), Body, CTA. Script format.',
    youtube_bumper:     'YouTube Bumper: 6-second, non-skippable. Every word counts. Brand impression only.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian Google Ads expert — specialist in search intent patterns of African buyers. Laws 1, 4, 5 are PRIMARY.

━━━ GOOGLE AD BRIEF ━━━
Business:        ${B(p)} — ${I(p)} in ${C(p)}
Ad Type:         ${inputs.ad_type?.replace(/_/g, ' ')}
Product/Service: ${inputs.product_service}
Keywords:        ${inputs.primary_keywords || `${I(p)} ${C(p)} [intent-appropriate keywords]`}
Location:        ${inputs.target_location || C(p)}
Unique Offer:    ${inputs.unique_offer || A(p)}
Search Intent:   ${inputs.search_intent?.replace(/_/g, ' ')}
Bidding:         ${inputs.bidding_strategy?.replace(/_/g, ' ')}
Budget:          ${inputs.monthly_budget_naira || 'Not specified'}
Variations:      ${inputs.num_ad_variations}
WhatsApp:        ${wa.display}
Trust Signal:    ${PR(p) || YR(p)}
Language:        ${L(p)}

Format Guide: ${adTypeGuides[inputs.ad_type] || 'Standard Google ad format'}

━━━ NIGERIAN GOOGLE SEARCH INTELLIGENCE ━━━
How Nigerians search differs from Western markets:
- Nigerians frequently search in Nigerian English: "Best [X] in Lagos" not "Top [X] near me"
- Common search patterns: "[Service] Lagos" / "[Problem] how to solve Nigeria" / "[Product] price Nigeria" / "[Business type] in [area like Lekki]"
- Voice search on Android is growing — include conversational query variants
- Pidgin search is emerging: "where to buy [X] naija" / "[X] wey dey work"
- "Near me" searches are lower in Nigeria than US — Nigerians use city/area names explicitly
- Trust signals in ad copy matter more in Nigeria than CTR hacks — FOBE affects click decisions too

Nigerian ad copy rules:
- Lead with the outcome/transformation (Law 5), not the product name
- Include ${C(p)} in at least one headline — location = credibility
- Price should appear only after value is established — even in 30-char headlines
- WhatsApp number in description if character count allows — Nigerian buyers want to contact first

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE GOOGLE ADS — ${B(p).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${inputs.ad_type === 'search_responsive' ? `
## RESPONSIVE SEARCH ADS (RSA) — ${parseInt(inputs.num_ad_variations || '3', 10)} Ad Variation(s)

*[Google will test combinations — write each headline/description to work standalone]*

${Array.from({ length: parseInt(inputs.num_ad_variations || '3', 10) }, (_, i) => `
### AD VARIATION ${i + 1} — ${['The Outcome Ad', 'The Problem-Solution Ad', 'The Awoof Stack Ad'][i] || `Ad ${i + 1}`}

**Final URL:** [Landing page URL — must match search intent and ad promise]

**HEADLINES (15 required, 30 chars max each, pin H1 and H2):**
H1 (PIN): [Most important — contains keyword + ${C(p)} — e.g. "${I(p)} services ${C(p)}"]
H2 (PIN): [The Giant Promise or Awoof — e.g. "₦X saved guaranteed"]
H3: [Trust signal — e.g. "${PR(p) ? PR(p).slice(0, 28) : YR(p) || `Trusted in ${C(p)}`}"]
H4: [Benefit 1 — specific outcome]
H5: [Benefit 2 — specific outcome]
H6: [Benefit 3 — specific outcome]
H7: [Call to action — e.g. "WhatsApp Us Today"]
H8: [Fear angle — cost of not acting — e.g. "Don't Lose Customers"]
H9: [Price/Awoof — e.g. "Cheaper Than Agency Fees"]
H10: [Guarantee — e.g. "Satisfaction Guaranteed"]
H11: [Location + service — e.g. "Serving All of ${inputs.target_location || C(p)}"]
H12: [Feature headline — specific differentiator]
H13: [Urgency — e.g. "Limited Slots Available"]
H14: [Question — e.g. "Need ${I(p)} in ${C(p)}?"]
H15: [Brand/product name + key benefit]

**DESCRIPTIONS (4 required, 90 chars max each):**
D1: [Awoof Stack + CTA — "What agencies charge ₦X for, we deliver from ₦Y. WhatsApp: ${wa.display}"]
D2: [Social proof + location — "${PR(p) || `Trusted by ${I(p)} businesses in ${C(p)}`}. Get started today."]
D3: [Fear + solution — "[Problem in ${C(p)}]. We solve it in [timeframe]. Contact us now."]
D4: [Guarantee + action — "${inputs.unique_offer || A(p)}. [Guarantee]. Call or WhatsApp: ${wa.display}"]

**Character counts:** [Verify each headline ≤30 chars, each description ≤90 chars]
`).join('\n')}
` : inputs.ad_type === 'local_google_maps' ? `
## GOOGLE MAPS / LOCAL ADS OPTIMISATION

### GOOGLE BUSINESS PROFILE OPTIMISATION
Business Name: "${B(p)}"
Category: [Primary category + secondary categories for ${I(p)}]
Description (750 chars): [Complete GBP description — keyword-rich, benefit-led, includes ${C(p)} and service areas, WhatsApp number prominent]
Services: [List all services as separate GBP service items — each with description]
Service Areas: [${inputs.target_location || C(p)} + surrounding areas — list each explicitly]

### LOCAL SEARCH AD COPY
Headline 1: [Business name + main service]
Headline 2: [Location + trust signal]
Description 1: [Service description + ${C(p)} + phone number]

### REVIEW GENERATION STRATEGY
[How to get the Google reviews that power local ranking — specifically for Nigerian customers]

### "NEAR ME" OPTIMISATION
[The Nigerian-specific "near me" variants to target — area names, neighbourhood names, city-adjacent searches]
` : `
## ${inputs.ad_type?.replace(/_/g, ' ').toUpperCase()} AD COPY

[Complete ad copy for ${inputs.ad_type?.replace(/_/g, ' ')} format]
[Following platform specifications: ${adTypeGuides[inputs.ad_type] || 'Standard format'}]
[Applying Awoof Law + Fear angle + Giant Promise to ${inputs.ad_type?.replace(/_/g, ' ')} constraints]
`}

---

## KEYWORD STRATEGY

### PRIMARY KEYWORDS (High Intent — Bid Highest)
[10 exact match and phrase match keywords for ${inputs.search_intent} intent — in Nigerian search patterns]
| Keyword | Match Type | Bid Strategy | Expected CPC |
[10 rows — Nigerian-specific search terms including city names]

### SECONDARY KEYWORDS (Medium Intent)
[10 broad match modified or phrase match — catch wider intent]

### BRAND PROTECTION
[${B(p)} branded keywords — own your brand name in search]

### NEGATIVE KEYWORDS (Exclude Irrelevant Traffic)
[20 negative keywords specific to ${I(p)} in Nigeria — save budget from irrelevant clicks]
| Negative keyword | Why excluded |
[List — include common Nigerian search mismatches for this category]

---

${inputs.include_extensions ? `
## AD EXTENSIONS (MAXIMISE AD REAL ESTATE)

**Sitelink Extensions (6 recommended):**
[6 sitelinks: each with 25-char headline + 2x 35-char descriptions]
Sitelink 1: [Core service page]
Sitelink 2: [Pricing/packages page]
Sitelink 3: [About/trust page]
Sitelink 4: [WhatsApp contact]
Sitelink 5: [Portfolio/results]
Sitelink 6: [FAQ or consultation]

**Callout Extensions (10 recommended, 25 chars each):**
[Trust signals, benefits, and differentiators in callout format]

**Call Extension:** [Phone number for direct calls — Nigerian buyers often call before WhatsApp]

**Location Extension:** ${p.address || `${C(p)}, Nigeria`}

**Price Extension (if applicable):** [Starting from ₦[X] — for transparent pricing categories]

---
` : ''}

${inputs.include_audience_signals ? `
## AUDIENCE SIGNALS (For Performance Max / Smart Bidding)

**Custom Intent Audiences:**
[Keywords Nigerian ${I(p)} buyers search before converting — for building intent signals]

**In-Market Audiences:**
[Google's in-market categories most relevant to Nigerian ${I(p)} buyers]

**Remarketing Lists:**
[For smart bidding — website visitors, WhatsApp link clickers, YouTube viewers]

**Customer Match:**
[If you have email/phone list — upload for lookalike targeting]

---
` : ''}

${inputs.include_landing_page_rec ? `
## LANDING PAGE RECOMMENDATION

**URL:** [The specific URL this ad should point to]
**Must-haves on the landing page:**
✅ Headline matches the ad (Quality Score improvement)
✅ ${C(p)} mentioned in first paragraph (Local relevance)
✅ WhatsApp CTA above the fold: ${wa.display}
✅ Trust signal within first scroll: ${PR(p) || YR(p)}
✅ Mobile-optimised — Nigerian users are mobile-first
✅ Page load under 3 seconds — Nigerian 4G is variable
✅ WhatsApp click-to-chat button (not a form — Law 8)

**Common Nigerian landing page mistakes to avoid:**
[3 specific mistakes that kill conversion from Google traffic for ${I(p)} businesses in ${C(p)}]

---
` : ''}

## BUDGET ALLOCATION & BIDDING

**Recommended Starting Budget:** ${inputs.monthly_budget_naira || '[Based on ${I(p)} CPL benchmarks in ${C(p)}]'}/month
**Bidding Strategy:** ${inputs.bidding_strategy?.replace(/_/g, ' ')} — [Why this strategy is right for this objective and stage]
**Target CPA:** ₦[X] — [Based on ${I(p)} industry benchmarks in ${C(p)}]
**Expected Results First 30 Days:** [CPL range, conversions range, ROAS range]

**SALARY WEEK BIDDING:** Increase bids by 30-50% during last 7 days of month — Nigerian search intent + purchase intent peaks simultaneously.

💡 CEREBRE TIP: [The Google Ads Nigerian market insight that most ${I(p)} advertisers miss — the keyword pattern, bid timing, or landing page element that dramatically drops CPL for Nigerian buyers specifically]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 28 — FUNNEL BUILDER
// Laws: 2 (Relationship FIRST), 7 (Sales Letter Formula), 10 (Urgency at each stage)
// Special: Cerebre Plus sequence: Relationship → Trust → Value → Offer
// ─────────────────────────────────────────────────────────────

export function getFunnelBuilderPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const funnelTypes: Record<string, string> = {
    lead_gen_whatsapp_optin:    'WhatsApp opt-in funnel — collect numbers, not emails. This is Nigeria.',
    product_launch_funnel:      'Product launch — build anticipation and convert at launch with maximum urgency.',
    webinar_workshop_funnel:    'Webinar registration → attendance → sales close — Nigerian workshop conversion.',
    ecommerce_product_funnel:   'E-commerce — browse → add → checkout → WhatsApp recovery if abandoned.',
    service_booking_funnel:     'Service booking — awareness → credibility → enquiry → appointment → sale.',
    high_ticket_consulting_funnel: 'High-ticket — long trust build → consultation → proposal → close.',
    membership_subscription_funnel: 'Subscription — trial or founding member offer → recurring value → retention.',
    event_registration_funnel:  'Event — awareness → registration → attendance → post-event close.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian funnel architect trained on Cerebre Plus's relationship-first selling sequence. Laws 2, 7, 10 are PRIMARY. The cardinal rule of Nigerian funnels: NEVER cold-traffic → direct sale. Every Nigerian funnel must have WhatsApp as a stage.

━━━ FUNNEL BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Funnel Type:       ${funnelTypes[inputs.funnel_type] || inputs.funnel_type?.replace(/_/g, ' ')}
Main Offer:        ${inputs.funnel_offer}
Lead Magnet:       ${inputs.lead_magnet || 'To be defined — WhatsApp opt-in focused'}
Average Sale:      ${inputs.average_sale_value || PRICE(p)}
Conversion Problem: ${inputs.current_conversion_problem?.replace(/_/g, ' ')}
Funnel Stages:     ${inputs.funnel_stages_count}
WhatsApp CRM:      ${inputs.whatsapp_as_crm ? 'YES — WhatsApp is the primary CRM' : 'Secondary channel'}
Include Emails:    ${inputs.include_email_sequence ? 'Yes' : 'No'}
Include Page Copy: ${inputs.include_page_copy ? 'Yes' : 'No'}
Traffic Source:    ${inputs.traffic_source?.replace(/_/g, ' ')}
WhatsApp:          ${wa.display}
Trust Signal:      ${PR(p) || YR(p)}
Language:          ${L(p)}

━━━ THE AKIN ALABI FUNNEL SEQUENCE (MANDATORY) ━━━
Stage 1 — RELATIONSHIP: Make them feel known. Give value. Ask for nothing.
Stage 2 — TRUST: Prove you know what you're doing. Specific proof. Social validation.
Stage 3 — VALUE: Show them the transformation in detail. Let them feel the outcome.
Stage 4 — OFFER: Now make the ask — with Awoof Stack, guarantee, and urgency.

The Nigerian Cold-Traffic Rule: You CANNOT take a stranger from ad → sale in one step. The funnel is the relationship-builder. WhatsApp is where the sale closes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE FUNNEL — ${B(p).toUpperCase()}
## Type: ${inputs.funnel_type?.replace(/_/g, ' ')}
## Offer: ${inputs.funnel_offer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## FUNNEL OVERVIEW

**The Cerebre Plus Sequence for ${B(p)}:**
[Traffic Source] → [Awareness Touch] → [WhatsApp Opt-In] → [Trust Build] → [Value Delivery] → [Offer] → [Close on WhatsApp]

**The Core Promise of This Funnel:**
[What the funnel promises the prospect at Stage 1 — the Giant Promise that earns their contact]

**Funnel KPIs:**
Opt-in rate target: [X]%
WhatsApp conversation rate: [X]%
Consultation/enquiry rate: [X]%
Conversion rate: [X]%
Cost per acquisition target: ₦[X]

---

## STAGE-BY-STAGE FUNNEL MAP

${Array.from({ length: parseInt(inputs.funnel_stages_count || '5', 10) }, (_, i) => {
  const stage = i + 1
  const stageNames: Record<number, { name: string; law: string; goal: string }> = {
    1: { name: 'AWARENESS — RELATIONSHIP', law: 'Law 2 (List)', goal: 'Get their attention + WhatsApp number' },
    2: { name: 'TRUST BUILD', law: 'Law 3 (Trust)', goal: 'Prove expertise + eliminate FOBE' },
    3: { name: 'VALUE DELIVERY', law: 'Law 6 (Story)', goal: 'Show the transformation through story and proof' },
    4: { name: 'OFFER REVEAL', law: 'Law 1 + 5 (Awoof + Giant Promise)', goal: 'Present the offer as obvious choice' },
    5: { name: 'URGENCY CLOSE', law: 'Law 10 (Urgency)', goal: 'Convert through real deadline + WhatsApp close' },
    6: { name: 'OBJECTION SMASHER', law: 'Law 3 + 4', goal: 'Remove final barriers to purchase' },
    7: { name: 'FINAL CLOSE + REFERRAL TRIGGER', law: 'Law 9 (Community)', goal: 'Convert AND trigger referral behaviour' },
  }
  const s = stageNames[Math.min(stage, 7)] || stageNames[5]

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**STAGE ${stage} — ${s.name}**
*${s.law} | Goal: ${s.goal}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Entry Point:** [How people enter this stage]
**Time in stage:** [Typical duration — hours/days]
**Primary Channel:** [Where this stage happens — ad / WhatsApp / email / landing page]

${inputs.include_page_copy ? `
**PAGE/MESSAGE COPY:**
[Full, complete, immediately usable copy for this stage — following Cerebre Plus sequence position]

${stage === 1 ? `
[TOFU: Lead magnet offer or value-first content]
Headline: [Giant Promise — the specific thing they get for giving their WhatsApp number]
Sub-headline: [Trust signal — ${PR(p) || YR(p)}]
Body: [What they get — benefit-led, specific, immediately valuable]
WhatsApp Opt-in CTA: "Send me a WhatsApp message to get [lead magnet] instantly: ${wa.display}"
[Law 8: One action. WhatsApp number. Instant delivery.]
` : stage === 2 ? `
[Trust stage — deliver on the lead magnet promise + build credibility]
Delivery message: "Hi [First name], here's [what was promised]. [Actual value delivered]."
Follow-up (24hrs): "[Insight or tip that demonstrates ${B(p)}'s expertise] — more where that came from. Reply to this if you want [next piece of value]."
Trust signal introduction: "${PR(p) || YR(p) || `${B(p)} in ${C(p)}`}"
` : stage === 3 ? `
[Value stage — the deepest trust building through story]
[Law 6: Complete story of a ${C(p)} ${I(p)} customer who had the exact same situation]
Story: "[Name/type] from [area of ${C(p)}] came to us when they were facing [specific problem]. Here's what happened..."
Result: "[Specific, measurable outcome]"
Bridge: "We can help you get the same result because [specific reason]."
` : stage === 4 ? `
[Offer reveal — Law 7 Sales Letter Formula in condensed form]
Hook: [The offer headline — Giant Promise]
Awoof Stack: [Normal cost vs. what ${B(p)} charges]
Benefits: [3-5 outcome bullets — not features]
${inputs.lead_magnet ? `Bonus: [Additional value for acting now — builds on the lead magnet relationship]` : ''}
Guarantee: [Risk removal]
CTA: "To get started today, send me a WhatsApp: ${wa.display}"
` : `
[Close — urgency at maximum + WhatsApp direct]
Urgency: "[Specific deadline or limit — real and honest]"
Final Awoof: "[The deal one more time — framed as 'last chance at this value']"
Action: "Reply to this WhatsApp with 'READY' and I'll get you set up today: ${wa.display}"
P.S.: "[Urgency reinforcement — what changes after the deadline]"
`}
` : '[Page/message copy not included in this run]'}

${inputs.include_email_sequence ? `
**EMAIL for this stage:**
Subject: [Curiosity-gap or benefit-led subject for Nigerian inboxes]
Body: [250-word email matching this stage's purpose — Law 8: personal "I" voice]
CTA: [WhatsApp-first CTA — ${wa.display}]
` : ''}

**WhatsApp Action at this stage:**
${stage === 1 ? `[Opt-in: Their first message to ${wa.display} triggers the lead magnet delivery]` : stage === 5 ? `[Close: "Reply 'YES' to get started. I'll send you the details in the next message."]` : `[Engagement: [Specific WhatsApp touchpoint to maintain relationship through this stage]]`}

**Exit conditions (advance to next stage):**
[What action moves them to Stage ${stage + 1}]

**If they get stuck here (no action):**
[The one message or action that re-activates them — Law 4 fear angle or new value]
`}).join('\n')}

---

## WHATSAPP CRM SETUP

*[The WhatsApp workflow that manages all ${B(p)}'s funnel contacts]*

**WhatsApp Labels (for organising contacts):**
🔵 New Lead — just opted in
🟡 In Conversation — actively engaged
🟠 Offer Sent — awaiting decision
🔴 Follow Up — needs follow-up
🟢 Customer — converted
⚫ Lost — not converting (don't delete — future campaigns)

**Automated Welcome Sequence:**
Message 1 (immediate): [Deliver lead magnet + welcome]
Message 2 (Day 1): [Value delivery — trust stage]
Message 3 (Day 3): [Story + offer hint]
Message 4 (Day 5): [Offer reveal]
Message 5 (Day 7): [Final urgency close]

**The WhatsApp Conversation Script:**
[Full script for handling the conversation from opt-in to close — what to say at each stage when they reply]

---

${inputs.include_conversion_benchmarks ? `
## CONVERSION BENCHMARKS — ${I(p)} IN ${C(p)}

| Stage | Nigerian Benchmark | ${B(p)} Target |
|-------|-------------------|----------------|
| Ad → Landing page | 2-5% CTR | [X]% |
| Landing page → WhatsApp opt-in | 15-35% | [X]% |
| Opt-in → Conversation | 60-80% | [X]% |
| Conversation → Enquiry | 40-60% | [X]% |
| Enquiry → Sale | 20-40% | [X]% |
| **Overall funnel** | **1-4% of traffic** | **[X]%** |

**Expected Revenue from 1,000 visitors:**
At benchmark: ₦[X] — [N] customers
At target: ₦[X] — [N] customers
` : ''}

---

## FUNNEL OPTIMISATION — QUICK WINS

**Where to improve if funnel isn't converting:**
1. High drop-off at opt-in → [Improve the lead magnet offer — make it more specific and immediately valuable]
2. High opt-in, low conversation → [Improve the first WhatsApp message — the lead magnet delivery must WOW them]
3. Conversation, no enquiry → [The story stage isn't building enough trust — add more specific social proof]
4. Enquiry, no sale → [The close script needs work — or the Awoof Stack isn't compelling enough]

💡 CEREBRE TIP: [The Nigerian funnel insight that converts the most ${I(p)} buyers — the specific stage in the funnel where Nigerian buyers need the most reassurance and the exact trust signal that, when added, dramatically increases through-rate to the next stage]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 29 — LEAD MAGNET FORGE
// Laws: 1 (Awoof — the magnet IS the value offer), 2 (List Law — this IS the list-builder), 5 (Giant Promise)
// ─────────────────────────────────────────────────────────────

export function getLeadMagnetForgePrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const magnetContext: Record<string, string> = {
    pdf_guide_report:        'PDF/Guide: Evergreen content. Nigerian business owners perceive high-value free guides as proof of expertise.',
    checklist_cheatsheet:    'Checklist: Fast value, high perceived utility. Nigerian business owners love practical, immediate-use tools.',
    template_toolkit:        'Template: Fill-in-the-blank value. Saves time. High WhatsApp sharing rate when useful.',
    mini_video_course:       'Video Course: Builds the deepest relationship. Highest perceived value. Best for high-ticket offers.',
    quiz_scorecard:          'Quiz: High engagement, data-rich. Shows personalised result — Nigerian buyers love finding out "how they score."',
    swipe_file:              'Swipe File: Ready-to-use examples. Nigerian business owners who want to copy proven formats love this.',
    calculator_tool:         'Calculator: Shows them the exact cost/return in ₦. Powerful for B2B and high-ticket.',
    email_masterclass_series:'Email Course: 5-7 day email series. Builds trust through daily value delivery.',
    free_consultation:       'Free Consultation: Highest conversion to sale, lowest scale. Works for high-ticket services.',
    webinar_recording:       'Webinar Recording: Position as exclusive access. Value signal + extended relationship time.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian list-building expert — master of the Law 2 (List Law). Laws 1, 2, 5 are PRIMARY. The lead magnet is not a freebie — it is the most valuable piece of marketing ${B(p)} will ever create, because it builds the list that generates revenue on demand.

━━━ LEAD MAGNET BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Format:            ${magnetContext[inputs.magnet_type] || inputs.magnet_type?.replace(/_/g, ' ')}
Topic:             ${inputs.magnet_topic}
Target Reader:     ${inputs.target_reader || T(p)}
Result Promised:   ${inputs.what_they_get}
Collection:        ${inputs.collection_method?.replace(/_/g, ' ')}
Delivery:          ${inputs.delivery_method?.replace(/_/g, ' ')}
Promotion Channels: ${Array.isArray(inputs.promotion_channels) ? inputs.promotion_channels.join(', ') : inputs.promotion_channels || 'Instagram, WhatsApp'}
Awoof Comparison:  ${inputs.awoof_comparison || 'Generate the strongest value comparison for this lead magnet'}
Trust Signal:      ${PR(p) || YR(p)}
WhatsApp:          ${wa.display}
Language:          ${L(p)}

━━━ NIGERIAN LEAD MAGNET INTELLIGENCE ━━━
Law 2 truth: The lead magnet is NOT the free thing you give away. It is the RELATIONSHIP STARTER that earns the right to sell.

What makes a Nigerian lead magnet convert:
1. The TITLE promises a specific, measurable result — not a topic ("How to get 10 new clients in 30 days" not "Marketing guide")
2. The VALUE is immediately useful — they can start using it today
3. The DELIVERY is instant via WhatsApp — Nigerians abandon email forms at high rates
4. The TRUST SIGNAL is in the title or subtitle — "From the team that helped 400+ Lagos businesses"
5. The AWOOF is implied — "This would cost ₦50,000 in a consulting session — we're giving it to you free"

The Nigerian collection hierarchy (best to worst conversion):
1. WhatsApp number → instant delivery via WhatsApp = 70%+ opt-in rate
2. WhatsApp number + name = 60%+ opt-in rate
3. Email + WhatsApp = 40-50% opt-in rate
4. Email only = 20-30% opt-in rate (worst — Nigerian inbox rates are low)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPLETE LEAD MAGNET — ${B(p).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. THE LEAD MAGNET TITLE SYSTEM

**Power Title (Full version):**
"[Number] + [Specific Outcome] for [Specific Audience] in [Timeframe or Context] — [Credibility hook]"
Example framework: "7 Things Every [${I(p)}] Business in ${C(p)} Should Know About [Topic] (That Most Owners Get Wrong)"

**Short Title (For visual/social):**
"[3-5 words — bold, specific, benefit-first]"

**Subtitle (For opt-in page):**
"[One sentence that completes the title — adds specificity and the promised result]"

**Why This Title Converts:**
[The specific psychological mechanism why this title works for ${T(p)} in ${C(p)}]

---

## 2. THE OPT-IN COPY

*[Complete, immediately usable opt-in page or WhatsApp request copy]*

**Headline for the Opt-In:**
[The Giant Promise — Law 5 — specific enough to make them think "I need this NOW"]

**Sub-headline:**
[Trust signal — ${PR(p) || YR(p)} — makes the headline credible]

**The Awoof Statement:**
[What this insight/resource would cost them to get elsewhere — then frame the free offer as outrageously generous]
"Business owners in ${C(p)} pay ₦[X] for a consultant to teach them this. ${B(p)} is giving you the exact same information free because [Law 2 reason — relationship first]."

**3 Bullets (What they get — benefit-led):**
• [Benefit 1 — specific and measurable]
• [Benefit 2 — specific and measurable]
• [Benefit 3 — specific and measurable]

**The Ask (Law 8 — zero friction):**
${inputs.collection_method === 'whatsapp_number' ? `"Send me your WhatsApp message right now and I'll deliver [lead magnet title] to you instantly: ${wa.display}"` : inputs.collection_method === 'email_only' ? '"Enter your email address below — I\'ll send [lead magnet] to your inbox in the next 5 minutes."' : '"[Collection-method-specific ask — immediate, one step, no friction]"'}

**Trust line:**
"${PR(p) || `${B(p)} has helped ${I(p)} businesses in ${C(p)} since ${p.years_in_business ? `${new Date().getFullYear() - p.years_in_business}` : '[year]'}`}. Your information is safe with us — we don't spam."

---

## 3. COMPLETE LEAD MAGNET CONTENT OUTLINE

*[Full structure that ${B(p)} can use to create the actual content]*

### ${inputs.magnet_type === 'pdf_guide_report' || inputs.magnet_type === 'template_toolkit' ? 'PDF/GUIDE OUTLINE' : inputs.magnet_type === 'checklist_cheatsheet' ? 'CHECKLIST OUTLINE' : inputs.magnet_type === 'email_masterclass_series' ? 'EMAIL MASTERCLASS OUTLINE' : inputs.magnet_type === 'quiz_scorecard' ? 'QUIZ OUTLINE' : 'CONTENT OUTLINE'}:

[For the specific format — complete section-by-section structure:]

**Introduction (1 page/section):**
[Open with the Law 6 Story — a relatable ${C(p)} ${I(p)} business owner with this exact problem. End with the promise of what this resource delivers.]

**Section/Step 1 — [Title]:**
[Key point + Nigerian market context + actionable instruction]
[Trust signal integrated naturally]

**Section/Step 2 — [Title]:**
[Key point + specific example from ${C(p)} ${I(p)} context]

**Section/Step 3 — [Title]:**
[Key point + how to implement]

[Continue through all sections — ending with:]

**Final Section — WHAT TO DO NEXT:**
[The low-commitment next step that naturally leads to ${B(p)}'s paid offer]
"If you want me to help you implement this specifically for your ${I(p)} business in ${C(p)}, send me a WhatsApp message: ${wa.display}"

---

## 4. THE DELIVERY SYSTEM

${inputs.delivery_method === 'instant_whatsapp' ? `
**WhatsApp Instant Delivery:**

Automated welcome message (sends within 60 seconds of WhatsApp contact):
"[Name from profile if available], welcome! 🎉

Here's [Lead Magnet Title] as promised:
[Download link or: the full content if short enough to send directly]

This is [what they'll use it for].

Over the next few days, I'll also share [3-4 things they'll learn in the follow-up sequence].

One quick question: [Engagement question that starts the conversation and reveals their specific situation]

I'm here if you have any questions — ${wa.display}"
` : `
**${inputs.delivery_method?.replace(/_/g, ' ')} Delivery:**
[Complete delivery workflow for this specific method — step by step, automated where possible]
`}

---

${inputs.include_follow_up_sequence ? `
## 5. FOLLOW-UP SEQUENCE (After Lead Magnet Delivery)

*[The 5-day sequence that builds trust and leads to the paid offer — Cerebre Plus's List Law in action]*

**Day 0 (Delivery):** [Lead magnet delivered + opening question]
**Day 1:** [Value addition — bonus tip related to the lead magnet topic]
**Day 3:** [Social proof — story of someone who used the lead magnet and got the result]
**Day 5:** [Offer hint — "I can help you do this specifically for your business..."]
**Day 7:** [Soft offer — present the paid solution as the natural next step]
**Day 10:** [Full offer + Awoof Stack + urgency]
**Day 14:** [Final close — "Closing this offer to focus on current clients"]

**The transition from free to paid (the bridge):**
"[Name], you've now had [lead magnet] for a week. Businesses who implement what's in it see [specific result]. If you want me to help you implement this specifically — not a general guide, but built around your actual ${I(p)} business in ${C(p)} — that's exactly what [paid offer] does."
` : ''}

---

${inputs.include_promotion_scripts ? `
## 6. PROMOTION SCRIPTS

**Instagram Caption (to promote the lead magnet):**
[Complete caption following CaptionCraft formula — hook + value + CTA to WhatsApp]

**Facebook Post:**
[Complete post — longer form, story-led, ends with WhatsApp CTA]

**WhatsApp Broadcast (to existing contacts):**
[Broadcast message promoting the lead magnet — warm audience, relatedness-first]

**Instagram Stories (5-slide sequence):**
Slide 1: Hook — "[The result this lead magnet delivers]"
Slide 2: Problem — "[What happens without this knowledge]"
Slide 3: Solution preview — "[One insight from the guide]"
Slide 4: Social proof — "${PR(p) || `${B(p)} in ${C(p)}`}"
Slide 5: CTA — "Send me a WhatsApp: ${wa.display}"
` : ''}

## 7. PERFORMANCE METRICS

**What to measure:**
- Opt-in rate (target: 25-40% for WhatsApp collection in Nigerian ${I(p)} market)
- WhatsApp conversation rate (target: 70%+ of opt-ins engage)
- Follow-up sequence open/reply rate
- Lead magnet to paid conversion rate (target: 5-15% within 30 days)

**The lead magnet success formula:**
[Total opt-ins] × [conversation rate] × [conversion rate] = new customers
At 100 opt-ins × 75% conversation × 10% conversion = [X] new customers from this magnet

💡 CEREBRE TIP: [The Nigerian lead magnet insight that triples WhatsApp opt-in rates for ${I(p)} businesses in ${C(p)} — the specific title structure, delivery mechanism, or follow-up timing that the highest-performing Nigerian lead magnets all share]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// TOOL 30 — PROPOSAL WRITER
// Laws: 1 (Awoof — the proposal IS the value comparison), 3 (Trust), 5 (Promise), 7 (Sales Letter)
// ─────────────────────────────────────────────────────────────

export function getProposalWriterPrompt(inputs: Record<string, any>, p: ProfileContext): string {
  const wa = WA(p)

  const experienceContext: Record<string, string> = {
    they_had_bad_experience:   'They\'ve been burned before. FOBE is HIGH. The proposal must eliminate every possible doubt before asking for a decision. Acknowledge the past experience explicitly — don\'t pretend it didn\'t happen.',
    first_time_outsourcing:    'First-time buyer. They don\'t know what good looks like. The proposal must educate as well as sell. Make the process feel completely transparent.',
    comparing_multiple_vendors: 'You\'re being compared. The proposal must differentiate sharply. Don\'t just describe what you do — show why ${B(p)} specifically is the only logical choice vs. the alternatives.',
    returning_client:          'They already know the quality. The proposal should feel familiar and acknowledge the relationship. Focus on the new scope and the continuity of the relationship.',
    referral:                  'Trust transfer from the referrer means FOBE is LOW. The proposal can be more direct. Still follow Law 7 but can spend less time on credibility.',
    unknown:                   'Unknown history — follow full Law 7 structure. Better to over-prove than to assume trust exists.',
  }

  const formatSpecs: Record<string, string> = {
    concise_2_page:         '2-page maximum — every word earns its place. Best for small projects or time-sensitive decisions.',
    comprehensive_full:     'Full document — complete Law 7 Sales Letter Formula. Best for projects over ₦500,000.',
    pitch_deck_style:       'Slide-format narrative — visual, concise slides. Best for presenting in person or on a call.',
    email_proposal:         'Email-delivered proposal — can be read in the inbox. Best for smaller projects or warm relationships.',
    whatsapp_voice_note_script: 'Script for a WhatsApp voice note proposal — most personal, most Nigerian. Best for relationship-based selling.',
  }

  return `
SPECIALIST ACTIVATED: Nigerian business proposal writer — master of making the Awoof Law work in a formal document context. Laws 1, 3, 5, 7 are PRIMARY. A proposal is a Sales Letter with a professional jacket on.

━━━ PROPOSAL BRIEF ━━━
Business:          ${B(p)} — ${I(p)} in ${C(p)}
Client:            ${inputs.client_name}
Client Problem:    ${inputs.client_problem}
Your Solution:     ${inputs.your_solution}
Timeline:          ${inputs.timeline}
Pricing:           ${inputs.pricing_structure}
Guarantee:         ${inputs.guarantee_or_risk_reversal || 'To be defined'}
Credentials:       ${inputs.your_credentials || [PR(p), YR(p)].filter(Boolean).join(' | ')}
Format:            ${formatSpecs[inputs.proposal_format] || inputs.proposal_format?.replace(/_/g, ' ')}
Client Industry:   ${inputs.client_industry || 'Not specified'}
Decision Maker:    ${inputs.decision_maker || 'Primary contact'}
Previous Experience: ${inputs.previous_agency_experience?.replace(/_/g, ' ')}
Awoof Comparison:  ${inputs.awoof_comparison || 'Calculate the cost of not working with ${B(p)} vs. working with ${B(p)}'}
WhatsApp:          ${wa.display}
Language:          ${L(p)}

Client History Context: ${experienceContext[inputs.previous_agency_experience] || experienceContext['unknown']}

━━━ NIGERIAN PROPOSAL INTELLIGENCE ━━━
Nigerian business proposals that win have these in common:
1. They open with the CLIENT's problem — not the vendor's introduction
2. They show specific understanding of the client's industry/situation — not generic solutions
3. The Awoof Stack is explicit — what this costs vs. what not solving it costs
4. The risk reversal is bold — guarantee that removes the fear of commitment
5. The next step is a WhatsApp message — not an email or a form

The Nigerian proposal mistake: Most proposals read "here's who we are." The winning proposal reads "here's who you are, here's what we understand about your problem, and here's exactly what we're going to do about it."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BUSINESS PROPOSAL
## Prepared by: ${B(p)}
## Prepared for: ${inputs.client_name}
## Date: ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## EXECUTIVE SUMMARY

*[100 words. Client's problem → ${B(p)}'s solution → expected outcome → investment. Make ${inputs.client_name} feel deeply understood in the first paragraph.]*

"${inputs.client_name} is facing [specific version of client problem in Nigerian business context]. [What this costs them — Law 4: the ongoing consequence of the problem]. ${B(p)} proposes to solve this through [specific solution overview], with the goal of achieving [specific outcome] within [timeline].

The investment: ${inputs.pricing_structure}. The risk: [${inputs.guarantee_or_risk_reversal || 'zero — explained in Section 5'}].

We're ready to begin immediately. The fastest path to [outcome] for ${inputs.client_name} starts on page 2."

---

## SECTION 1 — WE UNDERSTAND YOUR SITUATION

*[Law 6 + Law 4: Show them their problem in full — they must feel: "These people actually get it"]*

**What ${inputs.client_name} is dealing with:**
[Detailed, empathetic description of the problem — from their perspective, in their language, with their stakes]

**The Cost of This Problem (The ongoing consequence):**
[The specific financial, reputational, or operational cost of the problem continuing — in Nigerian market context]
[Monthly: ₦[X] in [specific losses]]
[Cumulative over [timeline]: ₦[X]]

**What you need:**
[The specific solution category — frame their need in their terms, not ${B(p)}'s]

**How we know this:**
[${B(p)}'s direct experience with this problem — ${PR(p) || `${YR(p)} working with ${I(p)} businesses in ${C(p)}`}]

---

## SECTION 2 — OUR PROPOSED SOLUTION

*[Law 5: Giant Promise — be bold about what will be achieved]*

**What ${B(p)} will do for ${inputs.client_name}:**
[Specific, detailed scope of work — written as outcomes, not activities]

**The ${B(p)} Methodology:**
[The specific process — why this approach works for ${inputs.client_name}'s situation]

**Timeline:**
${inputs.timeline}

**What ${inputs.client_name} needs to provide:**
[Their responsibilities — brief, low-burden list that shows the implementation is mostly handled by ${B(p)}]

---

## SECTION 3 — WHY ${B(p).toUpperCase()}

*[Law 3: Trust — specific, verifiable, FOBE-eliminating credentials]*

**Our Track Record:**
${inputs.your_credentials || `${PR(p) || YR(p) || `${B(p)}'s credentials`}`}

${inputs.include_case_studies ? `
**Relevant Case Study:**
[A client in a similar situation — their problem, ${B(p)}'s approach, the measurable result]
Client: [First name or anonymised description] | Industry: [Industry] | City: [Nigerian city]
Challenge: [Their challenge]
Solution: [${B(p)}'s approach]
Result: [Specific, measurable outcome — numbers, timeframes]
"[One-line testimonial quote if available]"

**Second Case Study (if applicable):**
[Same structure — different industry or challenge type]
` : ''}

**Why not [alternative options]:**
[The Awoof Stack inverse — what choosing an agency / freelancer / doing it internally costs vs. choosing ${B(p)}]
| Alternative | Cost | Risk | Outcome |
|-------------|------|------|---------|
| Hiring an agency | ₦[X]/month | [Risk] | [Typical outcome] |
| Freelancer | ₦[X] | [Risk] | [Typical outcome] |
| DIY/internal | ₦[X] equivalent time | [Risk] | [Typical outcome] |
| **${B(p)}** | **${inputs.pricing_structure}** | **[Risk: minimal — see guarantee]** | **[Projected outcome]** |

---

## SECTION 4 — THE INVESTMENT

*[Law 1: Awoof Stack — make the price feel like a bargain]*

**The Full Value Stack:**
Before revealing our price, here's what you're getting:

| Component | What it would cost separately | What ${inputs.client_name} pays with ${B(p)} |
|-----------|-------------------------------|----------------------------------------------|
| [Component 1] | ₦[X] | Included |
| [Component 2] | ₦[X] | Included |
| [Component 3] | ₦[X] | Included |
| **Total value** | **₦[TOTAL]** | |

**${B(p)}'s Investment:** ${inputs.pricing_structure}

**The Awoof Math:** You receive ₦[TOTAL] worth of [outcomes] for ${inputs.pricing_structure}. The savings vs. doing this separately: ₦[SAVING].

${inputs.payment_plan_available !== false && inputs.include_payment_terms ? `
**Payment Terms:**
${inputs.pricing_structure}
Payment options: [Bank transfer / Paystack / Installment plan details]
` : ''}

---

## SECTION 5 — THE GUARANTEE

*[Law 3 — removes FOBE completely. The proposal cannot lose if this section is strong.]*

**${B(p)}'s Commitment:**
${inputs.guarantee_or_risk_reversal || '[Define the specific guarantee — what ${B(p)} will do if the promised outcome is not achieved within the stated timeline]'}

**What this means for ${inputs.client_name}:**
[Plain language explanation — how the guarantee works in practice, step by step]

---

## SECTION 6 — NEXT STEPS

*[Law 8: One action. Zero friction. WhatsApp.]*

**If this proposal makes sense for ${inputs.client_name}:**

**Step 1:** Reply "YES" to this proposal (WhatsApp or email)
**Step 2:** ${B(p)} sends the contract within 24 hours
**Step 3:** Invoice sent — 50% deposit to begin
**Step 4:** Project begins within [X] business days of payment

**To confirm by WhatsApp (fastest):**
"${wa.display} — Reply: '${inputs.client_name?.split(' ')[0] || 'I'} want to proceed'"

**Decision deadline:**
${inputs.proposal_deadline ? `This proposal is valid until ${inputs.proposal_deadline}.` : 'This proposal is valid for 14 days from the date above. After this, pricing may need to be revised based on availability.'}

**What happens if ${inputs.client_name} waits:**
[One specific, honest consequence of delay — Law 4 — not threatening, just transparent]

---

${inputs.include_faq ? `
## APPENDIX — FREQUENTLY ASKED QUESTIONS

**Q: What if we're not happy with the results?**
A: ${inputs.guarantee_or_risk_reversal || '[Satisfaction guarantee policy]'}

**Q: How quickly will we see results?**
A: ${inputs.timeline} — with [specific milestone by which they'll see first results]

**Q: What do we need to do on our end?**
A: [Brief, non-burdensome list of ${inputs.client_name}'s responsibilities]

**Q: How do we pay?**
A: [Specific payment methods — frictionless]

**Q: Can we start smaller?**
A: [Answer — pilot option if available, or explanation of why the full scope is needed for results]
` : ''}

---

## FINAL NOTE

*[Personal close from the founder/team — Law 6: human voice, not corporate]*

"[First name of ${inputs.client_name}'s decision-maker], I've reviewed your situation carefully and I'm confident we can deliver [specific outcome] for [${inputs.client_name}].

The businesses we work with in ${C(p)} that get the best results are the ones who move quickly — not because of us, but because their market moves fast.

I'm available to answer any questions: ${wa.display}

Looking forward to working with you."

— [Name], ${B(p)}
${p.address || C(p)}, Nigeria
WhatsApp: ${wa.display}

---

*This proposal was prepared specifically for ${inputs.client_name} by ${B(p)}. All pricing and terms are confidential.*

💡 CEREBRE TIP: [The Nigerian business proposal element that most vendors omit and that, when included, increases the yes-rate significantly — the specific section or signal that Nigerian decision-makers subconsciously look for before approving a proposal from a new vendor]
`.trim()
}

// ─────────────────────────────────────────────────────────────
// MASTER DISPATCHER — Tools 21–30
// ─────────────────────────────────────────────────────────────

export function getToolPrompt21to30(
  toolId:  string,
  inputs:  Record<string, any>,
  profile: ProfileContext,
): string | null {
  switch (toolId) {
    case 'brand-positioner':       return getBrandPositionerPrompt(inputs, profile)
    case 'pricing-narrator':       return getPricingNarratorPrompt(inputs, profile)
    case 'budget-optimizer':       return getBudgetOptimizerPrompt(inputs, profile)
    case 'ad-pilot':               return getAdPilotPrompt(inputs, profile)
    case 'retarget-engine':        return getRetargetEnginePrompt(inputs, profile)
    case 'influencer-brief-writer': return getInfluencerBriefPrompt(inputs, profile)
    case 'google-ad-craft':        return getGoogleAdCraftPrompt(inputs, profile)
    case 'funnel-builder':         return getFunnelBuilderPrompt(inputs, profile)
    case 'lead-magnet-forge':      return getLeadMagnetForgePrompt(inputs, profile)
    case 'proposal-writer':        return getProposalWriterPrompt(inputs, profile)
    default: return null
  }
}
