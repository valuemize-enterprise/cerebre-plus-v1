// /lib/tools/blueprints/sprint-blueprint-prompt.ts
// Master prompt for the 60-Day Sprint Blueprint tool.
// This generates a complete, tailored execution document — not a generic guide.

export interface SprintBlueprintInputs {
  // From business profile (auto-populated)
  businessName:      string
  industry:          string
  city:              string
  targetCustomers?:  string
  primaryGoal?:      string

  // Step 1: The Goal
  currentMonthlyRevenue: string   // e.g. "₦150,000"
  revenueTarget60d:      string   // e.g. "₦500,000"
  whatWinningLooksLike:  string   // free text

  // Step 2: The Offer
  mainProduct:         string   // product/service name
  pricePoint:          string   // price
  whyBuyNow:           string   // urgency/reason
  currentObjDescript:  string   // what makes people hesitate

  // Step 3: Traffic
  whereCustomersAre:   string   // comma-separated platforms
  currentMarketing:    string   // what they're currently doing
  whatWorking:         string   // what's working even a little

  // Step 4: Conversion
  currentSalesProcess: string   // their current funnel
  avgLeadsPerMonth:    string   // how many leads monthly
  closeRate:           string   // what % convert

  // Step 5: Resources
  monthlyAdBudget:     string   // ₦ or ₦0
  teamSize:            string   // just me / small team etc.
  hoursPerWeek:        string   // hours available
}

export function buildSprintBlueprintPrompt(inputs: SprintBlueprintInputs): string {

  // Pre-calculate key numbers to include in the prompt
  const math = `
CRITICAL PRE-CALCULATIONS (use these exact numbers throughout — do not recalculate or use vague ranges):
- Business: ${inputs.businessName}
- Revenue target: ${inputs.revenueTarget60d}
- Price point: ${inputs.pricePoint}
- Current monthly leads: ${inputs.avgLeadsPerMonth}
- Stated close rate: ${inputs.closeRate}
- Available ad budget: ${inputs.monthlyAdBudget}
- Team: ${inputs.teamSize}
- Weekly hours: ${inputs.hoursPerWeek}

Before writing, calculate:
1. How many clients/units does ${inputs.businessName} need to sell in 60 days to hit ${inputs.revenueTarget60d}?
   (= Target ÷ Price point. Show this number explicitly in Section 1.)
2. What's the monthly requirement? (= total clients ÷ 2)
3. Given their close rate of ${inputs.closeRate}, how many leads do they need to produce those clients?
4. Are they currently getting enough leads? If not, what's the gap?
5. With ${inputs.monthlyAdBudget} budget, what can realistically be achieved on paid platforms?
Use these exact numbers. Never round up to sound optimistic. Be realistic and honest.`

  return `You are a high-performance marketing strategist specialising in Nigerian small and medium businesses. Your client is sitting across from you. They have shared everything about their business. You are writing their 60-Day Sprint Blueprint — a precise, no-fluff execution document they will follow for the next 60 days.

This is NOT a marketing textbook. This is NOT generic advice. Every sentence must be specific to ${inputs.businessName} and their actual situation.

BUSINESS PROFILE:
- Business: ${inputs.businessName}
- Industry: ${inputs.industry}
- Location: ${inputs.city}, Nigeria
- Who they serve: ${inputs.targetCustomers || 'Not specified — infer from industry and context'}
- Primary goal: ${inputs.primaryGoal || 'Revenue growth'}

SPRINT DATA:
- Current monthly revenue: ${inputs.currentMonthlyRevenue}
- 60-day revenue target: ${inputs.revenueTarget60d}
- What winning looks like: ${inputs.whatWinningLooksLike}
- Main offer: ${inputs.mainProduct} at ${inputs.pricePoint}
- Why customers should buy now: ${inputs.whyBuyNow}
- Biggest objection/hesitation: ${inputs.currentObjDescript}
- Where customers are: ${inputs.whereCustomersAre}
- Current marketing: ${inputs.currentMarketing}
- What's working: ${inputs.whatWorking}
- Current sales process: ${inputs.currentSalesProcess}
- Monthly leads: ${inputs.avgLeadsPerMonth}
- Close rate: ${inputs.closeRate}
- Monthly ad budget: ${inputs.monthlyAdBudget}
- Team: ${inputs.teamSize}
- Hours/week available: ${inputs.hoursPerWeek}

${math}

TONE: Write as a confident, direct Nigerian marketing consultant. Use "you" and "${inputs.businessName}" throughout. No hedging. No vague language. Say exactly what they need to do, when, and why it will work. Reference WhatsApp, Instagram, Lagos/Nigerian market dynamics naturally where relevant.

UPSELL RULE: At the end of Sections 2, 3, 4, 5, and 6, include a "→ Cerebre Plus Action" line that names 1-2 specific tools from the platform that directly implement the tactic in that section. Be specific about what the tool does for them, not just the tool name.

FORMAT: Use these EXACT section headers (they control how the document is displayed):

---
## SECTION 1: REVENUE TARGET — THE GOAL

Write ${inputs.businessName}'s singular financial mission for the next 60 days. This section must:
- State the target in bold: the exact ₦ amount and the exact number of clients/customers needed
- Show the math clearly: if target is ₦X and product costs ₦Y, they need Z clients — write "That means Z new [product] clients in 60 days, or [Z÷2] per month."
- Set a 30-day checkpoint: what number does ${inputs.businessName} need to hit by Day 30 to stay on track?
- Give one sentence on why this is achievable — based on their current trajectory, not wishful thinking
- If the target seems too aggressive given their current numbers, say so honestly and suggest a revised realistic target alongside the ambitious one
- End with: **Start Here Today:** One specific action to take in the next 24 hours to begin this sprint

---
## SECTION 2: THE IRRESISTIBLE OFFER — THE HOOK

Craft or sharpen ${inputs.businessName}'s single offer for the 60-day sprint. This section must:
- Write the offer as a complete pitch: name, price, what's included, and why right now. Write it as if you're saying it to a customer — not describing it abstractly.
- Create a specific "reason to act now" based on what they told you: deadline, bonus, limited slots, or price increase. Make it believable for their specific business and customer type.
- Write the objection script: take their specific stated objection ("${inputs.currentObjDescript.slice(0,80)}...") and give them the exact words to respond. Not "handle objections" — the actual sentences to say.
- Price anchoring: if their price point is high relative to what competitors charge, show how to frame it. If it's low, explain why they should not compete on price.
- End with: **Start Here Today:** Rewrite their offer description using this section and update it across WhatsApp status, Instagram bio, and any active profile.
- → **Cerebre Plus Action:** [Name relevant tool e.g. Ad Scribe, Promo Card Designer] — explain specifically what to create

---
## SECTION 3: TRAFFIC SOURCE — THE ENGINE

Pick ${inputs.businessName}'s primary traffic channel for the next 60 days. This section must:
- Name the ONE primary platform (based on where their customers actually are: "${inputs.whereCustomersAre}") and explain why this specific platform over the others — use Nigerian market context
- Build their weekly activity schedule: be specific. E.g. "Monday: 1 educational Reel about [specific topic]. Tuesday: 1 WhatsApp broadcast to your list of [X contacts]. Wednesday: 1 Story with a poll. Thursday: 1 product/service post with price. Friday: 1 testimonial or result post."
- Address their ad budget (${inputs.monthlyAdBudget}): if they have budget, tell them exactly what to run (platform, ad format, targeting, spend per day, expected result). If no budget, give them the honest organic-only path with realistic volume expectations.
- Reference what's already working: "${inputs.whatWorking}" — tell them to do MORE of this immediately
- End with: **Start Here Today:** The first post or action to publish/send today, written out completely.
- → **Cerebre Plus Action:** [Specific tool names] — explain the specific output to create for this channel

---
## SECTION 4: CONVERSION PATH — THE STOREFRONT

Map ${inputs.businessName}'s exact money path from stranger to customer. This section must:
- Describe their CURRENT conversion path back to them — show you understand it: "${inputs.currentSalesProcess.slice(0,120)}..." — then identify where prospects are falling off
- If their close rate is low (below 25%), this is the sprint's biggest leverage point. Be direct: "Your close rate of ${inputs.closeRate} means 3 out of 4 people who enquire don't buy. Here's exactly why that's happening and how to fix it."
- Build the IMPROVED 3-step path. Make it as frictionless as possible. Every extra step costs conversions.
- Give them a specific script or template for the conversion conversation — the first message to send when a lead enquires, the follow-up timing, and the closing move
- 7-day implementation: what specific change should they make to their conversion process by this time next week?
- End with: **Start Here Today:** One change to implement in their sales conversation today
- → **Cerebre Plus Action:** [Specific tools e.g. WhatsApp Campaign Builder, Sales Script Writer]

---
## SECTION 5: CONTENT SYSTEM — THE AUTHORITY

Build ${inputs.businessName}'s 60-day content system. This section must:
- Give their weekly content rhythm using the 3-bucket rotation: Trust (social proof), Education (value), Direct CTA. Assign days based on their ${inputs.hoursPerWeek} available hours — be realistic about output volume.
- Write 5 SPECIFIC content ideas per bucket (15 total) — written for ${inputs.industry} in ${inputs.city}, for their specific target customer. Not vague topics — actual post concepts. E.g. "Trust post: Screenshot of the WhatsApp message from [customer type] who [specific outcome they got from your product]."
- Month 1 vs Month 2 strategy: Month 1 is about building trust and visibility. Month 2 is about converting that trust into sales. Describe the specific shift in content tone and frequency.
- Give them the minimum viable content plan: if they have limited time, what's the ONE thing they absolutely must post every week, and what format gets the most reach for their industry on their chosen platform?
- End with: **Start Here Today:** Write the first post from this system — content and caption — right now
- → **Cerebre Plus Action:** Content Calendar + Caption Craft — explain exactly how these two tools execute this section

---
## SECTION 6: KPI SCORECARD — THE REALITY CHECK

Set up ${inputs.businessName}'s Friday metrics ritual. This section must:
- Set three specific weekly targets based on their data:
  * Cost Per Lead target: if using ads, calculate ₦ad budget ÷ leads needed per week. If organic only, state "₦0 — focus on volume."
  * Conversion Rate target: be specific. "Your current rate is ${inputs.closeRate}. The 60-day target is [X]%. Here's the one change that will get you there."
  * Pipeline Velocity target: "Every lead should either buy or be off your list within [X] days. Currently it's taking [longer/shorter]."
- Build their actual weekly scorecard as a simple table they fill in every Friday:

| Week | Leads Generated | Sales Closed | Revenue (₦) | Close Rate | Notes |
|------|----------------|--------------|-------------|------------|-------|
| 1    |                |              |             |            |       |
| 2    |                |              |             |            |       |
[continue for all 8 weeks]

- 4 checkpoints: What numbers should ${inputs.businessName} see at Week 2, Week 4, Week 6, and Week 8?
- The Danger Signal: "If by Week 3 you have not [specific measurable indicator], the sprint is off track. The fix is [specific pivot action]."
- End with: **Start Here Today:** Fill in Week 0 baseline numbers. Open a new note or spreadsheet right now and write down: leads this week = [X], sales = [Y], revenue = [Z].

---

CLOSING PARAGRAPH (after the last section):
Write a short, direct closing paragraph (no header) that:
- Acknowledges this is going to require real work from ${inputs.businessName}
- References their specific goal one more time
- Ends with one motivating sentence that feels personal to their situation — not generic

Do not add any text before Section 1 or after the closing paragraph.`
}

// ── Output sections for the dual-zone parser ─────────────────
export const SPRINT_BLUEPRINT_OUTPUT_SECTIONS = [
  'REVENUE TARGET — THE GOAL',
  'THE IRRESISTIBLE OFFER — THE HOOK',
  'TRAFFIC SOURCE — THE ENGINE',
  'CONVERSION PATH — THE STOREFRONT',
  'CONTENT SYSTEM — THE AUTHORITY',
  'KPI SCORECARD — THE REALITY CHECK',
]
