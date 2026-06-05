// ═══════════════════════════════════════════════════════════════
// /lib/ai/suggestion-prompts.ts
// Context hints for AI-powered field suggestions across all tools.
// Each entry tells Claude *what the field is asking for*,
// *what format the answer should be*, and any Nigerian-specific
// context that makes suggestions more relevant.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// FIELD-LEVEL CONTEXT HINTS
// Key: fieldKey (e.g. 'product_service', 'target_audience')
// Used as a fallback for any tool that has these common fields.
// ─────────────────────────────────────────────────────────────

export const FIELD_HINTS: Record<string, string> = {
  // Product / Service
  product_service:
    'The specific product or service being promoted. Be precise — include a name, category, and optionally a price in ₦. E.g. "Custom ankara skirts — ₦12,500 each" or "3-bedroom duplex in Lekki Phase 1 — ₦85M".',
  product:
    'The exact product name, type, and key detail (price, size, flavour, colour). Keep it under 60 characters.',
  service:
    'The service offered — include what makes it different. E.g. "Same-day delivery across Lagos", "Monthly retainer from ₦50,000".',
  offer:
    'The specific deal, promo, or value proposition. Include the discount/value and any urgency. E.g. "Buy 2 get 1 free — this weekend only".',
  promotion:
    'The marketing promotion or special offer. Be specific about what the customer gets and any deadline.',

  // Audience
  target_audience:
    'Description of who this is for. Be specific — age range, location, situation, and what they care about. E.g. "Nigerian women aged 25–40 who love quality fashion without overpaying".',
  target_customer:
    'The ideal customer for this business. Include demographics, location, and what motivates their purchase decisions.',
  audience:
    'Who this message is aimed at. Be specific about their identity, needs, and what stage of the buying journey they are on.',
  customer_segment:
    'A specific subset of customers. E.g. "Existing customers who haven\'t ordered in 30 days" or "New parents in Abuja".',

  // Goals & Objectives
  goal:
    'A specific, measurable business or marketing goal. Include numbers and timeframes. E.g. "Get 20 new WhatsApp enquiries this week" or "Sell 50 units before end of month".',
  objective:
    'The specific result this campaign or tool should achieve. Make it measurable with a clear success metric.',
  campaign_goal:
    'What success looks like for this campaign. Include a specific number and timeframe.',
  business_goal:
    'The core business result you want to achieve. Use SMART format — specific, measurable, achievable, relevant, time-bound.',

  // Tone & Voice
  tone:
    'The emotional tone and brand voice for this content. E.g. "Warm and approachable, like a trusted friend", "Confident and premium, for high-value customers", "Energetic and youthful".',
  brand_voice:
    'How the brand communicates. Describe 2-3 personality traits. E.g. "Bold, direct, and no-nonsense" or "Empathetic, professional, and encouraging".',
  writing_style:
    'The style of writing. E.g. "Conversational with Nigerian slang", "Corporate and formal", "Storytelling with a warm personal touch".',

  // Pain Points & Problems
  pain_point:
    'The specific customer problem this solves. Write it as the customer would say it. E.g. "I keep running out of content ideas every Sunday night" or "My ads get views but zero sales".',
  problem:
    'The challenge your customer faces before they find you. Be specific and emotional.',
  customer_challenge:
    'What keeps your target customer up at night. Write in their voice, not yours.',

  // Unique Selling Proposition
  usp:
    'What makes this product/service different from every alternative. One specific, provable difference. E.g. "Fastest delivery in Lagos — guaranteed within 2 hours or it\'s free".',
  unique_advantage:
    'The single most compelling reason to choose you over a competitor. Should be something only you can claim.',
  differentiator:
    'What sets this apart from every alternative the customer has. One clear, specific, credible claim.',

  // Call to Action
  call_to_action:
    'The specific action you want the customer to take. Use WhatsApp or a Nigerian platform. E.g. "DM us \'ORDER\' on WhatsApp", "Click the link in bio", "Call 0803 XXX XXXX to book".',
  cta:
    'The one action you want customers to take after seeing this. Make it specific and frictionless for a Nigerian audience.',

  // Platforms
  platform:
    'The social media or messaging platform. Consider which platform your target audience is most active on in Nigeria.',
  channels:
    'The marketing channels to use. Think about where your specific customers in Nigeria spend time online.',

  // Budget
  budget:
    'The marketing budget for this campaign or period. State it in ₦ and be realistic for a Nigerian SME. E.g. "₦50,000 total for 2 weeks" or "₦15,000/week for Meta ads".',
  marketing_budget:
    'Monthly or campaign marketing spend in ₦. Nigerian SME ranges: ₦10,000–₦500,000/month.',
  ad_budget:
    'Budget specifically for paid advertising. Include platform allocation. E.g. "₦30,000 total: ₦20,000 Facebook, ₦10,000 Google".',

  // Strategy & Planning
  current_situation:
    'Where the business is right now — revenue, audience size, what\'s working, what isn\'t. Be honest and specific.',
  current_channels:
    'Which marketing channels the business currently uses. Be specific about what\'s working and what isn\'t.',
  timeline:
    'The time period for this strategy or campaign. E.g. "3 months: Jan–Mar 2026" or "6-week launch period".',
  strategy_period:
    'The duration this strategy should cover. State start date and end date.',

  // WhatsApp specific
  whatsapp_message:
    'A WhatsApp broadcast message. Should feel personal, conversational, and include a clear call to action. Max 300 words.',
  broadcast_message:
    'A message to send to existing WhatsApp contacts. Warm, direct, and with a specific offer or reason to respond.',
  follow_up_message:
    'A follow-up message for leads who showed interest but haven\'t converted. Friendly, not pushy.',

  // Content specific
  content_theme:
    'The overarching theme or topic for this batch of content. E.g. "Customer transformation stories" or "Behind-the-scenes of how we make our products".',
  post_theme:
    'The theme or angle for this specific post. One clear idea per post.',
  content_pillars:
    'The 3–5 topic areas this brand will consistently post about. Should reflect both the brand\'s expertise and the audience\'s interests.',

  // Email
  subject_line:
    'An email subject line that gets opened. Use curiosity, urgency, or personalisation. Under 50 characters ideally.',
  email_opening:
    'The first line of the email — should hook the reader immediately. Personalise for a Nigerian audience.',
  email_cta:
    'The clickable button or link text in the email. Specific and action-oriented. E.g. "Claim your 20% off today".',

  // Ads
  ad_headline:
    'The main headline for this ad. Should stop the scroll. Under 40 characters. Make a bold, specific promise.',
  ad_body:
    'The body copy for this ad. Max 125 characters for feed ads. Lead with the customer\'s problem, then your solution.',
  ad_hook:
    'The opening line or visual hook for this ad. Should stop someone mid-scroll on Instagram or Facebook.',
  target_location:
    'Where these ads should be shown. Be specific — city, LGA, or radius. E.g. "Lagos Island and Lekki" or "All of Nigeria".',

  // Competitor intelligence
  competitor_name:
    'The main competitor to analyse. Include their full business name as known on social media.',
  competitor_strength:
    'What this competitor does well that you need to learn from or counter. Be specific.',
  competitive_advantage:
    'What you do better than this competitor. Something your customers have confirmed, not just what you believe.',

  // General
  key_message:
    'The single most important thing you want the audience to walk away knowing or feeling after engaging with this content.',
  headline:
    'A bold, attention-grabbing headline. Should include a specific benefit or provoke curiosity.',
  description:
    'A short description that explains what this is and why it matters. 2–3 sentences maximum.',
  price:
    'The price in ₦. Include any instalment or payment plan options that are available.',
  location:
    'The specific location or delivery area. Use specific Lagos areas, cities, or "Nationwide delivery available".',
  duration:
    'How long this offer, service, or campaign lasts. E.g. "Valid for 48 hours", "Month-to-month contract".',
  urgency:
    'What creates time pressure for this offer. E.g. "Only 10 units left", "Offer ends Sunday midnight", "Prices go up January 1st".',
  social_proof:
    'Evidence that others trust this product/service. E.g. "500 customers served", "4.9/5 on Google", specific customer testimonial.',
  guarantee:
    'What assurance or guarantee removes the customer\'s risk. E.g. "30-day money-back, no questions asked".',
}

// ─────────────────────────────────────────────────────────────
// TOOL-LEVEL OVERRIDES
// For tools where a common field has a specific meaning,
// override the default hint with something more precise.
// Key format: `${toolId}::${fieldKey}`
// ─────────────────────────────────────────────────────────────

export const TOOL_FIELD_OVERRIDES: Record<string, string> = {
  // 30-Day Marketing Strategy
  'marketing-strategy::goal':
    'Your primary business goal for the next 30 days. Be specific — include a number and a deadline. E.g. "Double monthly revenue from ₦400K to ₦800K by the end of Q2 2026" or "Get 200 new WhatsApp subscribers in 30 days".',
  'marketing-strategy::current_situation':
    'Your honest current state — monthly revenue, social following, which channels you use, what\'s worked before. E.g. "Monthly revenue: ₦250,000. Instagram: 2,200 followers. No WhatsApp broadcast list. Facebook ads tried twice — didn\'t convert."',
  'marketing-strategy::budget':
    'Your total marketing budget for 30 days. Be realistic. E.g. "₦120,000 total (₦40,000/month)" or "₦50,000 total, mostly for content creation".',

  // Content Calendar
  'content-calendar::content_pillars':
    'The 3–5 topics this brand will post about consistently. Think: what do your customers need to know, what builds trust, what drives sales. E.g. "Product showcases, Customer results, Behind-the-scenes, Nigerian lifestyle relevance, Educational tips".',
  'content-calendar::posting_frequency':
    'How often to post on each platform. Be realistic — consistency beats frequency. E.g. "Instagram: 4x/week, WhatsApp Status: daily, Facebook: 3x/week".',

  // WhatsApp Campaign Builder
  'whatsapp-campaign::offer':
    'The specific thing you\'re offering via WhatsApp. Include the product/service name, price, and any discount. E.g. "50% off all hair braiding this week — walk-in or appointment".',
  'whatsapp-campaign::urgency':
    'What makes this offer time-sensitive. WhatsApp campaigns work best with genuine urgency. E.g. "Offer ends Friday midnight", "Only 8 slots available this month", "Price goes up on Sunday".',

  // Caption Craft
  'caption-craft::hook_angle':
    'The opening angle or hook for this caption. What emotion, question, or statement stops someone from scrolling? E.g. "A surprising contrast (before/after)", "A relatable problem", "A bold claim", "A question that makes them think".',

  // Sales Page Builder
  'sales-page::headline':
    'The headline for this sales page. Should include: who it\'s for, what they get, and why now. E.g. "For Lagos Entrepreneurs Who Are Tired of Paying ₦500,000/Month for Marketing That Doesn\'t Work".',
  'sales-page::pain_point':
    'The specific frustration your customer feels RIGHT NOW, before they\'ve found your solution. Write it in their words. E.g. "You\'re posting every day but getting zero sales. Your competitors somehow have a queue of customers and you can\'t figure out what they\'re doing differently."',

  // Competitor Intelligence
  'competitor-intelligence::competitor_name':
    'The specific competitor to analyse. Use their exact business name or social media handle. E.g. "Adunni Couture" or "@adunnicouture on Instagram".',

  // Budget Allocator
  'budget-allocator::budget':
    'Your total monthly marketing budget in ₦. Be honest — this tool optimises what you actually have, not what you wish you had. E.g. "₦80,000/month" or "₦200,000 for this campaign".',
  'budget-allocator::goal':
    'What you want this budget to achieve. Include a metric. E.g. "Generate 30 leads per month" or "Get 500 app downloads in 4 weeks" or "₦1.5M in direct sales this quarter".',

  // Email Sequence Writer
  'email-sequence::subject_line':
    'The subject line for the first email in the sequence. Aim for curiosity + specificity. E.g. "The mistake most Lagos entrepreneurs make in their first email" or "Your free {thing} is inside".',

  // Brand Voice Builder
  'brand-voice::brand_personality':
    'Describe your brand as if it were a person. What 3 adjectives describe it? What does it sound like? E.g. "Bold, warm, and no-nonsense — like a brilliant older sister who tells you the truth".',

  // Weekly Pulse Report
  'weekly-pulse::key_metrics':
    'The numbers you track every week. E.g. "Instagram: reach, saves, DMs. WhatsApp: replies, orders. Website: sessions, enquiries. Revenue: weekly sales vs last week".',
}

// ─────────────────────────────────────────────────────────────
// TOOL CONTEXT DESCRIPTIONS
// A one-line description of what each tool does — fed to Claude
// so it understands the purpose when generating suggestions.
// ─────────────────────────────────────────────────────────────

export const TOOL_DESCRIPTIONS: Record<string, string> = {
  'marketing-strategy':         'Creates a full 90-day marketing plan tailored to the user\'s business and Nigerian market',
  'content-calendar':           'Builds a 30-day social media content plan with captions, themes, and posting schedule',
  'caption-craft':              'Writes Instagram, Facebook, and TikTok captions optimised to drive Nigerian customer action',
  'whatsapp-campaign':          'Builds complete WhatsApp broadcast campaigns for Nigerian businesses',
  'meta-ads-brief':             'Creates Facebook and Instagram ad campaign briefs with targeting and copy',
  'google-ads-script':          'Writes Google Ads copy and targeting strategy for Nigerian businesses',
  'budget-allocator':           'Optimises how a marketing budget should be split across channels',
  'competitor-intelligence':    'Analyses a named competitor and identifies gaps and opportunities',
  'email-sequence':             'Writes multi-email nurture or sales sequences',
  'sales-page':                 'Writes a full sales page using proven Nigerian copywriting principles',
  'brand-voice':                'Defines and documents the brand\'s tone, vocabulary, and communication style',
  'product-description':        'Writes product descriptions that convert Nigerian buyers',
  'ad-headline':                'Generates high-performing ad headlines for Nigerian audiences',
  'blog-writer':                'Writes SEO-optimised blog posts relevant to Nigerian readers',
  'linkedin-post':              'Writes professional LinkedIn posts for Nigerian entrepreneurs and executives',
  'carousel-script':            'Scripts an Instagram or Facebook carousel post',
  'weekly-pulse':               'Generates a weekly marketing performance summary and action plan',
  'win-back-sequence':          'Writes a WhatsApp re-engagement campaign for inactive customers',
  'referral-programme':         'Designs a customer referral programme for a Nigerian business',
  'launch-strategy':            'Plans a product or service launch campaign',
  'sales-script':               'Writes a telephone or WhatsApp sales conversation script',
  'cold-outreach':              'Writes cold outreach messages for B2B or B2C Nigerian prospects',
  'testimonial-request':        'Writes messages asking satisfied customers for reviews and testimonials',
  'pricing-strategy':           'Helps define and communicate pricing for a Nigerian market',
  'loyalty-programme':          'Designs a customer loyalty and rewards programme',
  'newsletter':                 'Writes an email newsletter edition for Nigerian subscribers',
  'press-release':              'Writes a press release for Nigerian media distribution',
  'event-promo':                'Creates promotional content for an event or launch',
  'influencer-brief':           'Writes a brief for an influencer collaboration',
  'flash-sale-campaign':        'Plans and writes a short-window flash sale campaign',
  'sms-campaign':               'Writes an SMS marketing campaign for Nigerian mobile users',
  'tiktok-concept':             'Develops a TikTok video concept and script hook',
  'youtube-script':             'Writes a YouTube video script optimised for Nigerian viewers',
  'podcast-outline':            'Outlines a podcast episode for Nigerian business audiences',
  'market-entry-brief':         'Plans how to enter a new market or city in Nigeria',
  'audience-persona':           'Builds a detailed customer persona for a Nigerian target market',
  'seasonal-campaign':          'Plans a campaign around a Nigerian seasonal opportunity',
  'growth-forecast':            'Creates a revenue and growth projection for the next 3–12 months',
  'roi-calculator':             'Estimates expected marketing ROI based on budget and industry benchmarks',
}

// ─────────────────────────────────────────────────────────────
// MASTER PROMPT BUILDER
// Called by /api/suggest to build the final Claude prompt.
// ─────────────────────────────────────────────────────────────

export interface SuggestionContext {
  toolId:       string
  toolName:     string
  fieldKey:     string
  fieldLabel:   string
  formState:    Record<string, any>   // other fields already filled
  profile: {
    businessName:   string
    industry:       string
    city:           string
    targetCustomer: string
    description:    string
    uniqueAdvantage?: string
    brandVoice?:     string
  }
}

export function buildSuggestionPrompt(ctx: SuggestionContext): string {
  // Get the most specific hint available: tool override → generic field hint → fallback
  const overrideKey = `${ctx.toolId}::${ctx.fieldKey}`
  const fieldHint   =
    TOOL_FIELD_OVERRIDES[overrideKey] ??
    FIELD_HINTS[ctx.fieldKey] ??
    `Content for the "${ctx.fieldLabel}" field — make it specific and immediately usable.`

  const toolDescription = TOOL_DESCRIPTIONS[ctx.toolId] ?? `a marketing tool called "${ctx.toolName}"`

  // Build a summary of what's already filled in
  const filledFields = Object.entries(ctx.formState)
    .filter(([k, v]) => k !== ctx.fieldKey && v && String(v).trim().length > 1)
    .map(([k, v]) => `  • ${k}: ${String(v).slice(0, 120)}`)
    .join('\n')

  const profileContext = [
    ctx.profile.businessName && `Business: ${ctx.profile.businessName}`,
    ctx.profile.industry     && `Industry: ${ctx.profile.industry}`,
    ctx.profile.city         && `City: ${ctx.profile.city}`,
    ctx.profile.targetCustomer && `Target customer: ${ctx.profile.targetCustomer}`,
    ctx.profile.description  && `Business description: ${ctx.profile.description.slice(0, 200)}`,
    ctx.profile.uniqueAdvantage && `Unique advantage: ${ctx.profile.uniqueAdvantage.slice(0, 150)}`,
    ctx.profile.brandVoice   && `Brand voice: ${ctx.profile.brandVoice}`,
  ].filter(Boolean).join('\n')

  return `You are an expert Nigerian marketing strategist with 15 years of experience helping Lagos, Abuja, and Port Harcourt businesses grow.

TASK:
Generate exactly 4 short, specific, immediately-usable suggestions for the "${ctx.fieldLabel}" field in the Cerebre Plus "${ctx.toolName}" tool.

TOOL PURPOSE: ${toolDescription}

WHAT THIS FIELD NEEDS:
${fieldHint}

USER'S BUSINESS PROFILE:
${profileContext || 'No profile available — generate generic but realistic suggestions.'}

${filledFields ? `WHAT THEY'VE ALREADY FILLED IN (use for context):\n${filledFields}` : ''}

STRICT RULES:
1. Each suggestion must be under 90 characters (they appear as clickable chips)
2. Each suggestion must be specific — NO generic placeholders like "[your product]" or "[your city]"
3. Use actual Nigerian context: ₦ for prices, specific Lagos/Abuja/PH references where relevant, Nigerian consumer behaviour
4. All 4 suggestions must be DIFFERENT angles/approaches — not just rephrasings of the same idea
5. Each suggestion must be ready to use as-is — no additional editing required
6. If the profile gives you a specific industry or business name, make the suggestions relevant to that business

RESPONSE FORMAT:
Return ONLY a valid JSON array with exactly 4 strings. No markdown, no explanation, no extra text.
Example: ["suggestion one", "suggestion two", "suggestion three", "suggestion four"]`
}
