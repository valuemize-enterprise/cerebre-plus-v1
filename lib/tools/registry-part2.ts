// ═══════════════════════════════════════════════════════════════
// CEREBRE PLUS — Tool Registry (Part 2: Tools 23-40)
// lib/tools/registry-part2.ts
// Merge this with registry.ts at the TOOL_REGISTRY array level
// ═══════════════════════════════════════════════════════════════

import { ToolCategory } from "@/types"

// NOTE: This file continues the TOOL_REGISTRY array from registry.ts
// In production, append these entries directly into the TOOL_REGISTRY
// array in registry.ts starting after the RetargetEngine entry.

export const TOOL_REGISTRY_PART2 = [

  // ── RetargetEngine (continued) ─────────────────────────────

  // (RetargetEngine formBlocks continuation — paste from id: 'time_since_interaction')
  // Full entry:
  {
    id:              'retarget-engine',
    name:            'RetargetEngine',
    tagline:         'Win back website visitors who didn\'t buy — yet',
    description:     'RetargetEngine designs targeted retargeting campaigns for people who visited your website, engaged with your content, or viewed your products — turning warm interest into cold hard naira. These are the easiest sales you\'ll ever make.',
    category:        'Paid Advertising',
    coinCost:        35,
    icon:            '🎯',
    accentColour:    '#FF4830',
    estimatedSeconds: 20,
    formBlocks: [
      {
        id: 'retarget_audience', label: 'Who are you retargeting?', type: 'select', required: true,
        options: [
          { value: 'website_visitors',   label: 'Website visitors who didn\'t buy' },
          { value: 'instagram_engagers', label: 'People who engaged with Instagram' },
          { value: 'video_viewers',      label: 'Video viewers (50%+ watch)' },
          { value: 'whatsapp_enquirers', label: 'WhatsApp enquirers who didn\'t buy' },
          { value: 'cart_abandoners',    label: 'Shopping cart abandoners' },
          { value: 'past_customers',     label: 'Past customers for upsell' },
          { value: 'lookalike',          label: 'Lookalike of existing customers' },
        ],
      },
      {
        id: 'time_since_interaction', label: 'How long ago did they interact?', type: 'select', required: true,
        options: [
          { value: '1_3_days',   label: '1–3 days ago (hot)' },
          { value: '4_7_days',   label: '4–7 days ago (warm)' },
          { value: '8_14_days',  label: '8–14 days ago' },
          { value: '15_30_days', label: '15–30 days ago (cooling)' },
          { value: '30_90_days', label: '30–90 days ago (re-engage)' },
        ],
      },
      {
        id: 'retarget_offer', label: 'What offer or hook will you use for retargeting?', type: 'textarea',
        placeholder: 'e.g. Limited-time 10% discount, free shipping, payment plan, bonus included',
        required: false, characterLimit: 250,
      },
      {
        id: 'retarget_platforms', label: 'Retargeting platform', type: 'select', required: true,
        options: [
          { value: 'meta',   label: 'Meta (Facebook/Instagram)' },
          { value: 'google', label: 'Google Display / YouTube' },
          { value: 'both',   label: 'Both Meta + Google' },
        ],
      },
    ],
    loadingMessages: [
      '🎯 Analysing your warm audience segments...',
      '🧠 Mapping objection-breaking messages to each segment...',
      '✍️ Writing retargeting ad copy per audience...',
      '⏰ Scheduling frequency caps and sequencing...',
      '✅ Your RetargetEngine campaign is ready!',
    ],
    akinAlabiHook: 'Retargeting copy addresses the specific objection that stopped them buying (price, trust, timing) using Trust Law + Awoof Math. Fear Law closes: "Everyone who enquired 2 weeks ago and didn\'t act has already watched their competitor take those customers."',
    outputFormats: ['markdown', 'pdf-export', 'save-library'],
  },

  {
    id:              'influencer-brief-writer',
    name:            'InfluencerBriefWriter',
    tagline:         'Briefing documents that get influencers delivering results',
    description:     'InfluencerBriefWriter produces professional campaign briefs for Nigerian content creators — with clear deliverables, messaging guidelines, payment terms, and the brand language that ensures the influencer promotes your business the way you need them to. Stop leaving influencer campaigns to chance.',
    category:        'Paid Advertising',
    coinCost:        25,
    icon:            '🌟',
    accentColour:    '#F5A623',
    estimatedSeconds: 18,
    formBlocks: [
      {
        id: 'influencer_tier', label: 'Influencer tier you\'re targeting', type: 'select', required: true,
        options: [
          { value: 'nano',   label: 'Nano (1K–10K followers)' },
          { value: 'micro',  label: 'Micro (10K–100K followers)' },
          { value: 'mid',    label: 'Mid-tier (100K–500K followers)' },
          { value: 'macro',  label: 'Macro (500K–1M followers)' },
          { value: 'mega',   label: 'Mega (1M+ followers)' },
        ],
      },
      {
        id: 'campaign_goal', label: 'Campaign goal', type: 'select', required: true,
        options: [
          { value: 'awareness',         label: 'Brand Awareness' },
          { value: 'product_review',    label: 'Product Review / Honest Opinion' },
          { value: 'promo_code',        label: 'Promo Code / Discount Drive' },
          { value: 'event_promotion',   label: 'Event Promotion' },
          { value: 'giveaway',          label: 'Giveaway / Competition' },
          { value: 'ambassador',        label: 'Brand Ambassador (long-term)' },
        ],
      },
      {
        id: 'content_deliverables', label: 'Content deliverables required', type: 'multiselect', required: true,
        options: [
          { value: 'ig_reel',    label: 'Instagram Reel' },
          { value: 'ig_post',    label: 'Instagram Static Post' },
          { value: 'ig_story',   label: 'Instagram Stories (x3)' },
          { value: 'tiktok',     label: 'TikTok Video' },
          { value: 'youtube',    label: 'YouTube Integration' },
          { value: 'twitter',    label: 'Twitter/X Thread or Post' },
        ],
      },
      {
        id: 'compensation', label: 'Compensation offered', type: 'text',
        placeholder: 'e.g. ₦75,000 flat fee + free product worth ₦25,000',
        required: false, characterLimit: 200,
      },
      {
        id: 'key_messages', label: 'Key messages the influencer MUST communicate', type: 'textarea',
        placeholder: 'e.g. Must mention the Lagos delivery, the ₦10,000 entry price point, and the 48-hour turnaround',
        required: true, characterLimit: 300,
      },
      {
        id: 'things_to_avoid', label: 'Things they must NOT say or do', type: 'textarea',
        placeholder: 'e.g. Must not compare us to Brand X, must not show product before unboxing',
        required: false, characterLimit: 200, advanced: true,
      },
    ],
    loadingMessages: [
      '🌟 Building your influencer brief...',
      '📋 Structuring deliverables and timelines...',
      '💬 Writing brand messaging guidelines...',
      '📝 Adding compliance and approval steps...',
      '✅ Your influencer brief is professional and ready!',
    ],
    akinAlabiHook: 'Brief uses Influencer Law — specifies community validation language ("join thousands of Lagos businesses") that resonates with Nigerian followers. Trust Law: specific metrics and approval gates ensure quality before posting.',
    outputFormats: ['markdown', 'pdf-export', 'docx-export', 'save-library'],
  },

  {
    id:              'google-ad-craft',
    name:            'GoogleAdCraft',
    tagline:         'Google Search ads written for Nigerian search intent',
    description:     'GoogleAdCraft produces complete Google Search and Display ad copy with the headlines, descriptions, and keyword targeting strategy calibrated for how Nigerian business owners search — because search intent in Lagos is different from London, and your ads should reflect that.',
    category:        'Paid Advertising',
    coinCost:        30,
    icon:            '🔍',
    accentColour:    '#4285F4',
    estimatedSeconds: 18,
    formBlocks: [
      {
        id: 'ad_type', label: 'Google ad type', type: 'select', required: true,
        options: [
          { value: 'search',       label: 'Search Ads (text, keyword-triggered)' },
          { value: 'display',      label: 'Display Ads (image-based)' },
          { value: 'performance_max', label: 'Performance Max' },
          { value: 'local',        label: 'Local Ads (Google Maps)' },
        ],
      },
      {
        id: 'product_service', label: 'Product or service being advertised', type: 'textarea',
        placeholder: 'e.g. Fumigation services for Lagos homes and offices, starting at ₦18,000',
        required: true, characterLimit: 300,
      },
      {
        id: 'primary_keywords', label: 'Primary keywords you want to target', type: 'text',
        placeholder: 'e.g. fumigation Lagos, pest control Lagos, rat exterminator Lagos Island',
        required: false, characterLimit: 200,
      },
      {
        id: 'target_location', label: 'Target location(s)', type: 'text',
        placeholder: 'e.g. Lagos Island, Victoria Island, Ikoyi, Lekki',
        required: true, characterLimit: 150,
      },
      {
        id: 'unique_offer', label: 'Your unique offer or differentiator', type: 'text',
        placeholder: 'e.g. Same-day service, 6-month guarantee, family-safe chemicals',
        required: false, characterLimit: 200, advanced: true,
      },
    ],
    loadingMessages: [
      '🔍 Researching Nigerian search intent for your service...',
      '✍️ Writing 3 responsive search ad variations...',
      '🎯 Building keyword match types and negative keywords...',
      '📍 Optimising for local Nigerian search patterns...',
      '✅ Your Google Ads are ready to launch!',
    ],
    akinAlabiHook: 'Headlines use Fear Law (urgent need language) and Giant Promise (specific outcome) in under 30 characters. Ad copy addresses Nigerian FOBE by including trust signals — years in business, number of clients, guarantee.',
    outputFormats: ['markdown', 'copy-button', 'pdf-export', 'save-library'],
  },

  // ════════════════════════════════════════════════════════════
  // CATEGORY 6 — SALES & LEAD CONVERSION (4 tools)
  // ════════════════════════════════════════════════════════════

  {
    id:              'funnel-builder',
    name:            'FunnelBuilder',
    tagline:         'A complete sales funnel mapped and written in minutes',
    description:     'FunnelBuilder designs and writes every stage of your sales funnel — from awareness ad to WhatsApp close — with the specific page copy, email sequence, and conversion mechanics for each stage. A conversion strategist charges ₦1,500,000 for a funnel audit; yours is done in 60 seconds.',
    category:        'Sales & Lead Conversion',
    coinCost:        45,
    icon:            '🔽',
    accentColour:    '#8B70F0',
    estimatedSeconds: 35,
    formBlocks: [
      {
        id: 'funnel_type', label: 'Funnel type', type: 'select', required: true,
        options: [
          { value: 'lead_gen',        label: 'Lead Generation Funnel (free opt-in → WhatsApp)' },
          { value: 'product_launch',  label: 'Product Launch Funnel' },
          { value: 'webinar',         label: 'Webinar / Workshop Funnel' },
          { value: 'ecommerce',       label: 'E-commerce Product Funnel' },
          { value: 'service_booking', label: 'Service Booking Funnel' },
          { value: 'high_ticket',     label: 'High-Ticket Consulting / Coaching Funnel' },
          { value: 'membership',      label: 'Membership / Subscription Funnel' },
        ],
      },
      {
        id: 'funnel_offer', label: 'What is the main product/service at the bottom of the funnel?', type: 'textarea',
        placeholder: 'e.g. ₦350,000 12-week business mentorship programme for Lagos entrepreneurs',
        required: true, characterLimit: 400,
      },
      {
        id: 'lead_magnet', label: 'What free offer will you use to enter the funnel?', type: 'text',
        placeholder: 'e.g. Free PDF: "5 financial mistakes costing your business ₦500,000/year"',
        required: false, characterLimit: 200,
      },
      {
        id: 'average_sale_value', label: 'Average sale / transaction value', type: 'text',
        placeholder: 'e.g. ₦350,000',
        required: false, characterLimit: 50, advanced: true,
      },
      {
        id: 'current_conversion_problem', label: 'Where does your current funnel break down?', type: 'select',
        required: false, advanced: true,
        options: [
          { value: 'getting_leads',      label: 'Not generating enough leads' },
          { value: 'leads_not_buying',   label: 'Leads enquire but don\'t buy' },
          { value: 'high_no_shows',      label: 'High drop-off at proposal stage' },
          { value: 'price_objections',   label: 'Too many price objections' },
          { value: 'no_repeat_buyers',   label: 'Customers don\'t come back' },
        ],
      },
    ],
    loadingMessages: [
      '🔽 Mapping your complete funnel architecture...',
      '🎁 Designing your lead magnet and opt-in strategy...',
      '✍️ Writing page copy for each funnel stage...',
      '📧 Building nurture sequence between stages...',
      '📞 Scripting the WhatsApp close...',
      '✅ Your complete funnel is mapped, written and ready!',
    ],
    akinAlabiHook: 'Funnel architecture follows Cerebre Plus\'s complete Sales Letter Formula across stages. Top of funnel uses List Law (collect before you sell). Middle uses Trust + Story Law. Bottom uses Giant Promise + Urgency + Awoof Math.',
    outputFormats: ['markdown', 'pdf-export', 'docx-export', 'save-library', 'sections'],
  },

  {
    id:              'lead-magnet-forge',
    name:            'LeadMagnetForge',
    tagline:         'Free offers your target customers can\'t refuse',
    description:     'LeadMagnetForge creates complete lead magnets — the outline, title, chapter structure, and key content — for guides, checklists, toolkits, and mini-courses that collect WhatsApp numbers and emails from your exact target customer. Building your list is building your business.',
    category:        'Sales & Lead Conversion',
    coinCost:        35,
    icon:            '🧲',
    accentColour:    '#0CC4A0',
    estimatedSeconds: 25,
    formBlocks: [
      {
        id: 'magnet_type', label: 'Lead magnet format', type: 'select', required: true,
        options: [
          { value: 'pdf_guide',     label: 'PDF Guide / Report (5-15 pages)' },
          { value: 'checklist',     label: 'Checklist / Cheat Sheet' },
          { value: 'template',      label: 'Fill-in Template or Toolkit' },
          { value: 'mini_course',   label: 'Mini Video / Audio Course (3-5 lessons)' },
          { value: 'quiz_scorecard', label: 'Quiz or Scorecard' },
          { value: 'swipe_file',    label: 'Swipe File (examples and scripts)' },
          { value: 'calculator',    label: 'Calculator or Assessment Tool' },
          { value: 'email_series',  label: '5-Day Email Masterclass' },
        ],
      },
      {
        id: 'magnet_topic', label: 'What topic should the lead magnet cover?', type: 'textarea',
        placeholder: 'e.g. How to get your first 50 customers without spending money on ads — for Lagos service businesses',
        required: true, characterLimit: 300,
      },
      {
        id: 'target_reader', label: 'Who is the ideal person to download this?', type: 'textarea',
        placeholder: 'e.g. New business owners in Lagos who have been open less than 12 months and are struggling to get customers',
        required: true, characterLimit: 250,
      },
      {
        id: 'what_they_get', label: 'What specific result or insight will they get from it?', type: 'text',
        placeholder: 'e.g. A step-by-step system to get their first 50 customers using only WhatsApp and referrals',
        required: true, characterLimit: 200,
      },
      {
        id: 'promotion_channels', label: 'How will you promote this lead magnet?', type: 'multiselect',
        required: false, advanced: true,
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'facebook',  label: 'Facebook' },
          { value: 'whatsapp',  label: 'WhatsApp' },
          { value: 'website',   label: 'Website popup' },
          { value: 'paid_ads',  label: 'Paid Ads (lead form)' },
        ],
      },
    ],
    loadingMessages: [
      '🧲 Designing your irresistible lead magnet...',
      '📋 Building the structure and chapter outline...',
      '✍️ Writing key content for each section...',
      '🎁 Crafting the opt-in headline and CTA...',
      '✅ Your lead magnet is ready to build your list!',
    ],
    akinAlabiHook: 'List Law centrepiece — every lead magnet is engineered to collect the WhatsApp number, not just an email. Title uses Giant Promise Law. Content delivers real value (Trust Law) so the subscriber is already sold before the follow-up begins.',
    outputFormats: ['markdown', 'pdf-export', 'docx-export', 'save-library'],
  },

  {
    id:              'proposal-writer',
    name:            'ProposalWriter',
    tagline:         'Proposals that win the client before the meeting happens',
    description:     'ProposalWriter generates professional, persuasive business proposals tailored to Nigerian clients — with benefit-led sections, transparent pricing, risk-removing guarantees, and the exact trust signals that make a prospect say yes before you even have to follow up.',
    category:        'Sales & Lead Conversion',
    coinCost:        40,
    icon:            '📄',
    accentColour:    '#E09818',
    estimatedSeconds: 28,
    formBlocks: [
      {
        id: 'client_name', label: 'Client / prospect name or business', type: 'text',
        placeholder: 'e.g. Adeola Bakeries Ltd, Ikeja',
        required: true, characterLimit: 150,
      },
      {
        id: 'client_problem', label: 'What problem does the client have that you\'re solving?', type: 'textarea',
        placeholder: 'e.g. They need a new website and social media presence. Currently losing customers to competitors who are more visible online.',
        required: true, characterLimit: 400,
      },
      {
        id: 'your_solution', label: 'Your proposed solution / what you will deliver', type: 'textarea',
        placeholder: 'e.g. 5-page website design and development, 3-month social media management (IG and Facebook), monthly reporting',
        required: true, characterLimit: 500,
      },
      {
        id: 'timeline', label: 'Project timeline', type: 'text',
        placeholder: 'e.g. Website: 3 weeks. Social media management: ongoing monthly',
        required: true, characterLimit: 150,
      },
      {
        id: 'pricing_structure', label: 'Your pricing', type: 'textarea',
        placeholder: 'e.g. Website: ₦450,000 one-time. Social media: ₦120,000/month. Total first month: ₦570,000.',
        required: true, characterLimit: 300,
      },
      {
        id: 'guarantee_or_risk_reversal', label: 'Do you offer a guarantee or risk reversal?', type: 'text',
        placeholder: 'e.g. Website completed in 3 weeks or we refund 20%. First month results guaranteed.',
        required: false, characterLimit: 200, advanced: true,
      },
      {
        id: 'your_credentials', label: 'Credentials and relevant past work', type: 'textarea',
        placeholder: 'e.g. 7 years in digital marketing, 200+ websites built, worked with GTBank, Fidelity Bank, Shoprite Nigeria',
        required: false, characterLimit: 300, advanced: true,
      },
    ],
    loadingMessages: [
      '📄 Building your proposal structure...',
      '🎯 Leading with client problem and transformation...',
      '💼 Writing your solution and deliverables section...',
      '🛡️ Adding trust signals and risk-reversals...',
      '💰 Presenting your pricing with Awoof anchoring...',
      '✅ Your winning proposal is ready!',
    ],
    akinAlabiHook: 'Proposal follows Sales Letter Formula: opens with client\'s problem (Fear Law) → your solution (Giant Promise) → your credentials (Trust Law) → pricing anchored against alternatives (Awoof Law) → guarantee (FOBE elimination) → clear next step (Customer Behaviour Law).',
    outputFormats: ['markdown', 'pdf-export', 'docx-export', 'save-library'],
  },

  {
    id:              'sales-script-writer',
    name:            'SalesScriptWriter',
    tagline:         'Sales scripts that close on the first call',
    description:     'SalesScriptWriter builds complete, word-for-word sales scripts for phone calls, WhatsApp voice notes, DMs, and in-person meetings — calibrated for Nigerian buyer behaviour, with objection-handling branches and closing techniques that feel natural, not pushy.',
    category:        'Sales & Lead Conversion',
    coinCost:        30,
    icon:            '📞',
    accentColour:    '#10B880',
    estimatedSeconds: 22,
    formBlocks: [
      {
        id: 'script_type', label: 'Sales script type', type: 'select', required: true,
        options: [
          { value: 'cold_call',         label: 'Cold Call / Introduction' },
          { value: 'warm_follow_up',    label: 'Warm Lead Follow-Up (WhatsApp / phone)' },
          { value: 'discovery_call',    label: 'Discovery / Consultation Call' },
          { value: 'proposal_close',    label: 'Proposal Close Call' },
          { value: 'objection_handler', label: 'Objection Handling Script' },
          { value: 'dm_outreach',       label: 'Instagram/LinkedIn DM Outreach' },
          { value: 'voice_note_script', label: 'WhatsApp Voice Note Script' },
          { value: 'in_person',         label: 'In-Person Meeting Script' },
        ],
      },
      {
        id: 'product_service', label: 'What are you selling?', type: 'textarea',
        placeholder: 'e.g. Corporate catering service for Abuja offices, starting at ₦2,500 per head, minimum 20 pax',
        required: true, characterLimit: 300,
      },
      {
        id: 'lead_temperature', label: 'How warm is this lead?', type: 'select', required: true,
        options: [
          { value: 'cold',  label: 'Cold — they don\'t know us' },
          { value: 'warm',  label: 'Warm — they enquired but haven\'t bought' },
          { value: 'hot',   label: 'Hot — they want to buy, just need pushing' },
        ],
      },
      {
        id: 'top_objection', label: 'The most common objection you face', type: 'select', required: true,
        options: [
          { value: 'too_expensive',   label: '"It\'s too expensive"' },
          { value: 'think_about_it',  label: '"Let me think about it"' },
          { value: 'not_now',         label: '"Not right now"' },
          { value: 'talk_someone',    label: '"I need to talk to my partner/boss"' },
          { value: 'bad_experience',  label: '"I had a bad experience before"' },
          { value: 'comparing',       label: '"I\'m getting other quotes"' },
          { value: 'trust',           label: '"How do I know this works?"' },
        ],
      },
      {
        id: 'desired_outcome', label: 'What do you want the prospect to do at the end?', type: 'select', required: true,
        options: [
          { value: 'book_appointment', label: 'Book an appointment' },
          { value: 'send_deposit',     label: 'Send a deposit' },
          { value: 'sign_contract',    label: 'Sign a contract' },
          { value: 'agree_next_call',  label: 'Agree to a follow-up call' },
          { value: 'join_waitlist',    label: 'Join a waitlist' },
        ],
      },
    ],
    loadingMessages: [
      '📞 Building your sales script framework...',
      '🧠 Engineering the opening that gets attention...',
      '🎯 Writing objection-handling branches...',
      '🔑 Crafting your closing sequence...',
      '✅ Your sales script is ready — go close!',
    ],
    akinAlabiHook: 'Script structure: Warm opener (List Law) → problem identification (Fear Law) → solution reveal (Giant Promise) → social proof (Trust Law + Influencer Law) → price with Awoof anchoring → close with Urgency Law. Objection handlers use specific Nigerian market language.',
    outputFormats: ['markdown', 'copy-button', 'pdf-export', 'save-library'],
  },

  // ════════════════════════════════════════════════════════════
  // CATEGORY 7 — REPUTATION & TRUST (3 tools)
  // ════════════════════════════════════════════════════════════

  {
    id:              'testimonial-collector',
    name:            'TestimonialCollector',
    tagline:         'Get powerful testimonials that actually drive sales',
    description:     'TestimonialCollector creates the perfect testimonial request sequence — including the follow-up messages and the exact questions that pull out specific, credibility-building responses from your happy customers. A great testimonial is worth more than ₦500,000 in advertising.',
    category:        'Reputation & Trust',
    coinCost:        20,
    icon:            '⭐',
    accentColour:    '#F5A623',
    estimatedSeconds: 14,
    formBlocks: [
      {
        id: 'collection_method', label: 'How will you collect testimonials?', type: 'select', required: true,
        options: [
          { value: 'whatsapp_message', label: 'WhatsApp message to customer' },
          { value: 'email',            label: 'Email request' },
          { value: 'google_form',      label: 'Google Form link' },
          { value: 'in_person',        label: 'In-person / phone request' },
          { value: 'instagram_dm',     label: 'Instagram DM' },
          { value: 'video_request',    label: 'Video testimonial request' },
        ],
      },
      {
        id: 'what_you_want_highlighted', label: 'What specific results or experience do you want them to mention?', type: 'textarea',
        placeholder: 'e.g. The speed of delivery, the results they got within 30 days, or the quality of the product vs. competitors they\'ve tried',
        required: true, characterLimit: 300,
      },
      {
        id: 'relationship_stage', label: 'When in the customer journey?', type: 'select', required: true,
        options: [
          { value: 'immediately_after',   label: 'Immediately after purchase/delivery' },
          { value: '30_days_after',       label: '30 days after (results visible)' },
          { value: '90_days_after',       label: '90 days after (full transformation)' },
          { value: 'milestone',           label: 'When they hit a milestone or result' },
          { value: 'repeat_purchase',     label: 'After repeat purchase' },
        ],
      },
      {
        id: 'incentive', label: 'Incentive offered (if any)', type: 'text',
        placeholder: 'e.g. ₦2,000 airtime, 10% off next order, free gift',
        required: false, characterLimit: 150, advanced: true,
      },
    ],
    loadingMessages: [
      '⭐ Engineering your testimonial collection strategy...',
      '📝 Writing questions that pull specific proof...',
      '💬 Crafting natural, unforced request messages...',
      '🔄 Building follow-up sequence for non-responders...',
      '✅ Your testimonial collector is ready!',
    ],
    akinAlabiHook: 'Questions are engineered using Trust Law — they guide customers to mention specific numbers, timeframes, and results. The request itself uses List Law (relationship framing) so it doesn\'t feel like a demand.',
    outputFormats: ['markdown', 'copy-button', 'whatsapp-share', 'save-library'],
  },

  {
    id:              'review-requestor',
    name:            'ReviewRequestor',
    tagline:         'Get 5-star Google reviews on autopilot',
    description:     'ReviewRequestor generates optimised review request sequences for Google, social media, and third-party platforms — timed perfectly and worded specifically to maximise the percentage of happy customers who actually leave a review. Your Google rating is your most valuable piece of free advertising.',
    category:        'Reputation & Trust',
    coinCost:        15,
    icon:            '🌟',
    accentColour:    '#10B880',
    estimatedSeconds: 10,
    formBlocks: [
      {
        id: 'review_platform', label: 'Review platform', type: 'select', required: true,
        options: [
          { value: 'google',      label: 'Google Business Profile' },
          { value: 'facebook',    label: 'Facebook Page Reviews' },
          { value: 'instagram',   label: 'Instagram Tags / Mentions' },
          { value: 'jumia',       label: 'Jumia / Konga Product Reviews' },
          { value: 'tripadvisor', label: 'TripAdvisor' },
          { value: 'multiple',    label: 'Multiple platforms' },
        ],
      },
      {
        id: 'request_channel', label: 'How will you send the request?', type: 'select', required: true,
        options: [
          { value: 'whatsapp', label: 'WhatsApp message' },
          { value: 'email',    label: 'Email' },
          { value: 'sms',      label: 'SMS' },
          { value: 'in_person', label: 'In person / card' },
        ],
      },
      {
        id: 'what_they_experienced', label: 'What did the customer experience?', type: 'text',
        placeholder: 'e.g. They had their car serviced and were very happy with the speed and price',
        required: true, characterLimit: 200,
      },
      {
        id: 'timing', label: 'When will you send the request?', type: 'select', required: true,
        options: [
          { value: 'same_day',    label: 'Same day as purchase/delivery' },
          { value: '24_hours',    label: '24 hours later' },
          { value: '3_days',      label: '3 days later' },
          { value: '1_week',      label: '1 week later' },
        ],
      },
    ],
    loadingMessages: [
      '🌟 Crafting your review request strategy...',
      '💬 Writing the perfect request message...',
      '🔗 Building direct review link instructions...',
      '✅ Your review request is ready!',
    ],
    akinAlabiHook: 'Request uses Customer Behaviour Law — the path to leaving a review has zero friction, with the exact URL and one-click instructions. Trust Law: reviews that mention specific details convert better, so the request subtly guides the reviewer.',
    outputFormats: ['markdown', 'copy-button', 'whatsapp-share', 'save-library'],
  },

  {
    id:              'crisis-responder',
    name:            'CrisisResponder',
    tagline:         'Handle bad reviews and PR crises without losing customers',
    description:     'CrisisResponder generates professional, brand-protecting responses to negative reviews, customer complaints, and social media crises — with the de-escalation language and recovery offers that turn an angry customer into a loyal brand advocate. How you respond to a crisis determines whether you lose or gain trust.',
    category:        'Reputation & Trust',
    coinCost:        25,
    icon:            '🛡️',
    accentColour:    '#FF4830',
    estimatedSeconds: 15,
    formBlocks: [
      {
        id: 'crisis_type', label: 'Type of crisis or complaint', type: 'select', required: true,
        options: [
          { value: 'negative_google_review', label: 'Negative Google review' },
          { value: 'negative_facebook',      label: 'Negative Facebook comment/review' },
          { value: 'twitter_complaint',      label: 'Twitter/X complaint going viral' },
          { value: 'whatsapp_screenshot',    label: 'WhatsApp conversation screenshot leaked' },
          { value: 'delivery_complaint',     label: 'Delivery / service failure complaint' },
          { value: 'product_quality',        label: 'Product quality complaint' },
          { value: 'staff_misconduct',       label: 'Staff behaviour complaint' },
          { value: 'price_dispute',          label: 'Pricing / billing dispute' },
          { value: 'false_accusation',       label: 'False or misleading accusation' },
        ],
      },
      {
        id: 'complaint_summary', label: 'Summarise the complaint or crisis', type: 'textarea',
        placeholder: 'e.g. Customer posted on Twitter that their order arrived 3 days late and the food was cold. Post has 200 retweets. The delay was caused by LASTMA seizing our delivery bike.',
        required: true, characterLimit: 500,
      },
      {
        id: 'is_complaint_valid', label: 'Is the complaint valid?', type: 'select', required: true,
        options: [
          { value: 'yes_our_fault',     label: 'Yes — it was our fault' },
          { value: 'partial',           label: 'Partially — both sides have a point' },
          { value: 'no_false',          label: 'No — the complaint is false or exaggerated' },
          { value: 'external_factor',   label: 'External factors (LASTMA, NEPA, logistics, etc.)' },
        ],
      },
      {
        id: 'recovery_offer', label: 'What can you offer to resolve this?', type: 'text',
        placeholder: 'e.g. Full refund, free replacement order, 50% off next order, personal apology call',
        required: false, characterLimit: 200,
      },
      {
        id: 'response_platform', label: 'Where will you post the response?', type: 'multiselect', required: true,
        options: [
          { value: 'google_reply',   label: 'Google Review Reply' },
          { value: 'facebook_reply', label: 'Facebook Comment Reply' },
          { value: 'twitter',        label: 'Twitter/X Public Reply' },
          { value: 'instagram',      label: 'Instagram Comment' },
          { value: 'whatsapp_dm',    label: 'WhatsApp DM' },
          { value: 'press_statement', label: 'Public Statement / Press Release' },
        ],
      },
    ],
    loadingMessages: [
      '🛡️ Assessing the crisis and risk level...',
      '🧠 Choosing the right de-escalation approach...',
      '✍️ Writing your brand-protecting response...',
      '🤝 Crafting the recovery and trust-rebuilding offer...',
      '✅ Your crisis response is ready — stay calm and post it.',
    ],
    akinAlabiHook: 'Crisis responses use Trust Law — acknowledge specifically, not generically. Customer Behaviour Law: recovery offer is immediately actionable (a direct WhatsApp number, not "contact us"). Every public response is written knowing that 100 silent readers are judging your brand integrity.',
    outputFormats: ['markdown', 'copy-button', 'save-library'],
  },

  // ════════════════════════════════════════════════════════════
  // CATEGORY 8 — SEO & DISCOVERABILITY (3 tools)
  // ════════════════════════════════════════════════════════════

  {
    id:              'local-seo-kit',
    name:            'LocalSEOKit',
    tagline:         'Get found on Google by customers in your city',
    description:     'LocalSEOKit builds a complete local SEO strategy for your business — from Google Business Profile optimisation to local keyword targeting and citation building — so that when a potential customer in Lekki, Maitama, or GRA searches for your service, your business is the first they find.',
    category:        'SEO & Discoverability',
    coinCost:        30,
    icon:            '📍',
    accentColour:    '#4285F4',
    estimatedSeconds: 22,
    formBlocks: [
      {
        id: 'business_location', label: 'Your business location(s)', type: 'text',
        placeholder: 'e.g. 14 Admiralty Way, Lekki Phase 1, Lagos',
        required: true, characterLimit: 200,
      },
      {
        id: 'service_areas', label: 'Areas you serve (delivery or service coverage)', type: 'text',
        placeholder: 'e.g. Lekki, Victoria Island, Ikoyi, Ajah, Sangotedo',
        required: true, characterLimit: 200,
      },
      {
        id: 'primary_service', label: 'Your primary service or product (what customers search for)', type: 'text',
        placeholder: 'e.g. Hair salon, electrician, event decorator, tax consultant',
        required: true, characterLimit: 150,
      },
      {
        id: 'seo_priority', label: 'What SEO challenge are you prioritising?', type: 'select', required: true,
        options: [
          { value: 'google_maps',         label: 'Rank higher on Google Maps' },
          { value: 'local_search',        label: 'Appear in local "near me" searches' },
          { value: 'competitor_outrank',  label: 'Outrank specific local competitors' },
          { value: 'new_business',        label: 'New business — build presence from scratch' },
          { value: 'multiple_locations',  label: 'Multiple location optimisation' },
        ],
      },
      {
        id: 'google_profile_status', label: 'Google Business Profile status', type: 'select', required: false,
        options: [
          { value: 'none',         label: 'Don\'t have one yet' },
          { value: 'unverified',   label: 'Created but not verified' },
          { value: 'basic',        label: 'Basic profile only' },
          { value: 'complete',     label: 'Fully set up and verified' },
        ], advanced: true,
      },
    ],
    loadingMessages: [
      '📍 Mapping your local search landscape...',
      '🔍 Identifying high-value local keywords...',
      '📊 Auditing your Google Business Profile opportunity...',
      '🗺️ Building your local citation strategy...',
      '✅ Your LocalSEO Kit is ready!',
    ],
    akinAlabiHook: 'LocalSEO is Trust Law infrastructure — Google reviews, consistent NAP data, and local citations are the digital equivalent of social proof that Nigerian buyers look for before they trust a business enough to call.',
    outputFormats: ['markdown', 'pdf-export', 'docx-export', 'save-library', 'sections'],
  },

  {
    id:              'keyword-hunter',
    name:            'KeywordHunter',
    tagline:         'Find the exact words your Nigerian customers type into Google',
    description:     'KeywordHunter identifies the specific search terms your ideal customers use in Nigeria — with local variations, Pidgin-influenced phrasing, and competitor keyword gaps — so you can create content that ranks and ads that reach the right people at the lowest cost.',
    category:        'SEO & Discoverability',
    coinCost:        25,
    icon:            '🔑',
    accentColour:    '#0CC4A0',
    estimatedSeconds: 18,
    formBlocks: [
      {
        id: 'seed_topic', label: 'Your core service or product topic', type: 'text',
        placeholder: 'e.g. interior design, cake delivery, real estate Lagos, business loan',
        required: true, characterLimit: 150,
      },
      {
        id: 'target_cities', label: 'Target cities for local keywords', type: 'text',
        placeholder: 'e.g. Lagos, Abuja, Port Harcourt',
        required: true, characterLimit: 150,
      },
      {
        id: 'keyword_intent', label: 'Primary keyword intent to target', type: 'select', required: true,
        options: [
          { value: 'buying',      label: 'Buying intent ("buy", "order", "hire")' },
          { value: 'informational', label: 'Informational ("how to", "best way", "guide")' },
          { value: 'local',       label: 'Local search ("near me", "in Lagos")' },
          { value: 'comparison',  label: 'Comparison ("vs", "best", "top")' },
          { value: 'all',         label: 'All intents' },
        ],
      },
      {
        id: 'competitors_to_research', label: 'Competitor websites to analyse (optional)', type: 'text',
        placeholder: 'e.g. competitorone.com.ng, competitor2.com',
        required: false, characterLimit: 200, advanced: true,
      },
    ],
    loadingMessages: [
      '🔑 Scanning Nigerian search patterns...',
      '🧩 Identifying local keyword variations...',
      '📊 Grouping keywords by intent and difficulty...',
      '💡 Finding competitor keyword gaps...',
      '✅ Your keyword strategy is ready!',
    ],
    akinAlabiHook: 'Keyword research focuses on buying-intent terms — the words Nigerian customers use when they\'re ready to spend, not just browse. Includes Pidgin and Nigerian English variants (e.g. "hair do Lagos" vs "hairstylist Lagos").',
    outputFormats: ['markdown', 'pdf-export', 'save-library'],
  },

  {
    id:              'website-copy-audit',
    name:            'WebsiteCopyAudit',
    tagline:         'Find out why your website isn\'t converting visitors into buyers',
    description:     'WebsiteCopyAudit analyses your website copy and structure through the lens of the Nigerian buyer — identifying FOBE triggers, missing trust signals, weak CTAs, and conversion killers — then provides a prioritised rewrite plan that can immediately increase your enquiry rate.',
    category:        'SEO & Discoverability',
    coinCost:        35,
    icon:            '🔎',
    accentColour:    '#8B70F0',
    estimatedSeconds: 28,
    formBlocks: [
      {
        id: 'website_url', label: 'Your website URL', type: 'url',
        placeholder: 'e.g. https://www.yourbusiness.com.ng',
        required: false, characterLimit: 200,
        helpText: 'If you don\'t have a URL yet, paste your homepage copy below.',
      },
      {
        id: 'homepage_copy', label: 'Paste your homepage copy here (if no URL)', type: 'textarea',
        placeholder: 'Paste your existing website headline, subheadline, and about text here...',
        required: false, characterLimit: 2000,
      },
      {
        id: 'what_you_want_visitors_to_do', label: 'What should website visitors do?', type: 'select', required: true,
        options: [
          { value: 'whatsapp',     label: 'Message you on WhatsApp' },
          { value: 'call',         label: 'Call your phone number' },
          { value: 'buy_online',   label: 'Make a purchase directly' },
          { value: 'book_appt',    label: 'Book an appointment' },
          { value: 'fill_form',    label: 'Fill a contact form' },
          { value: 'download',     label: 'Download something (lead magnet)' },
        ],
      },
      {
        id: 'current_conversion_rate', label: 'Current situation (approximate)', type: 'select', required: false,
        options: [
          { value: 'very_low',  label: 'Website gets visitors but almost no enquiries' },
          { value: 'ok',        label: 'Some enquiries but conversion could be better' },
          { value: 'no_traffic', label: 'No traffic at all — new website' },
          { value: 'unknown',   label: 'Not sure' },
        ], advanced: true,
      },
      {
        id: 'main_pages_to_audit', label: 'Pages to focus audit on', type: 'multiselect', required: false,
        options: [
          { value: 'homepage',  label: 'Homepage' },
          { value: 'about',     label: 'About page' },
          { value: 'services',  label: 'Services page' },
          { value: 'pricing',   label: 'Pricing page' },
          { value: 'contact',   label: 'Contact page' },
          { value: 'product',   label: 'Product pages' },
        ], advanced: true,
      },
    ],
    loadingMessages: [
      '🔎 Auditing your copy through the Nigerian buyer\'s eyes...',
      '🚨 Identifying FOBE triggers and trust gaps...',
      '📝 Finding weak headlines and missing proof points...',
      '🔧 Prioritising the highest-impact rewrites...',
      '✅ Your copy audit and rewrite plan is ready!',
    ],
    akinAlabiHook: 'Audit checks all 10 Cerebre Plus Laws: does the homepage have Awoof Math? Does the About page eliminate FOBE? Is there a WhatsApp CTA above the fold? Is there a Giant Promise in the headline? Every gap is a potential sale being lost.',
    outputFormats: ['markdown', 'pdf-export', 'docx-export', 'save-library', 'sections'],
  },

  // ════════════════════════════════════════════════════════════
  // CATEGORY 9 — GROWTH & RETENTION (3 tools)
  // ════════════════════════════════════════════════════════════

  {
    id:              'referral-program-builder',
    name:            'ReferralProgramBuilder',
    tagline:         'Turn every customer into a salesperson',
    description:     'ReferralProgramBuilder designs a complete referral programme for your business — with reward structure, launch messaging, WhatsApp scripts for customers to share, and the tracking mechanism — so that your best customers become your best marketers. In Nigeria, word of mouth is still the most trusted medium.',
    category:        'Growth & Retention',
    coinCost:        25,
    icon:            '🤝',
    accentColour:    '#E09818',
    estimatedSeconds: 20,
    formBlocks: [
      {
        id: 'referral_reward_type', label: 'What reward will you offer referrers?', type: 'select', required: true,
        options: [
          { value: 'cash_transfer',    label: 'Cash transfer (Opay, bank, etc.)' },
          { value: 'discount_voucher', label: 'Discount on their next purchase' },
          { value: 'free_product',     label: 'Free product or service' },
          { value: 'credit_account',   label: 'Account credit' },
          { value: 'airtime_data',     label: 'Airtime / data' },
          { value: 'tiered_rewards',   label: 'Tiered rewards (more referrals = bigger reward)' },
        ],
      },
      {
        id: 'reward_value', label: 'What is the reward value?', type: 'text',
        placeholder: 'e.g. ₦2,000 per successful referral, or 15% off their next order',
        required: true, characterLimit: 150,
      },
      {
        id: 'what_counts_as_conversion', label: 'What counts as a successful referral?', type: 'select', required: true,
        options: [
          { value: 'first_purchase',     label: 'Referred person makes any purchase' },
          { value: 'minimum_spend',      label: 'Referred person spends ₦X or more' },
          { value: 'signs_up',           label: 'Referred person signs up / registers' },
          { value: 'books_appointment',  label: 'Referred person books appointment' },
        ],
      },
      {
        id: 'tracking_method', label: 'How will you track referrals?', type: 'select', required: true,
        options: [
          { value: 'referral_code',    label: 'Unique referral code per customer' },
          { value: 'ask_how_heard',    label: '"How did you hear about us?" question' },
          { value: 'whatsapp_forward', label: 'Forward WhatsApp message with name included' },
          { value: 'referral_link',    label: 'Unique tracking link' },
        ],
      },
      {
        id: 'programme_name', label: 'Name for your referral programme (optional)', type: 'text',
        placeholder: 'e.g. "Cerebre Friends", "Refer & Earn", "Our Inner Circle"',
        required: false, characterLimit: 100, advanced: true,
      },
    ],
    loadingMessages: [
      '🤝 Designing your referral programme structure...',
      '🎁 Engineering the reward mechanics...',
      '💬 Writing the customer scripts to share...',
      '📋 Building the programme launch campaign...',
      '✅ Your referral programme is ready to launch!',
    ],
    akinAlabiHook: 'Referral programme uses Influencer Law — community validation made systematic. Customer scripts use Customer Behaviour Law (zero friction to share). Giant Promise: the referrer\'s reward is presented with Awoof framing ("earn ₦2,000 for a 30-second WhatsApp message").',
    outputFormats: ['markdown', 'pdf-export', 'docx-export', 'save-library'],
  },

  {
    id:              'newsletter-ai',
    name:            'NewsletterAI',
    tagline:         'Email newsletters your subscribers actually read',
    description:     'NewsletterAI writes complete email newsletters for your subscriber list — with the storytelling hooks, value delivery, and subtle sales angles that keep Nigerian business owners opening every edition. A newsletter that gets read is a customer relationship being maintained at zero cost.',
    category:        'Growth & Retention',
    coinCost:        25,
    icon:            '📰',
    accentColour:    '#0CC4A0',
    estimatedSeconds: 22,
    formBlocks: [
      {
        id: 'newsletter_type', label: 'Newsletter type', type: 'select', required: true,
        options: [
          { value: 'weekly_tips',      label: 'Weekly tips and insights' },
          { value: 'monthly_digest',   label: 'Monthly digest / roundup' },
          { value: 'product_update',   label: 'Product / service update' },
          { value: 'story_sale',       label: 'Story-led newsletter with offer' },
          { value: 'industry_news',    label: 'Industry news + your perspective' },
          { value: 'personal_letter',  label: 'Personal letter from the founder' },
        ],
      },
      {
        id: 'main_topic', label: 'Main topic or story for this edition', type: 'textarea',
        placeholder: 'e.g. How a customer of ours turned a ₦150,000 investment in marketing into ₦2.4M in revenue in 4 months — and what we learned from it',
        required: true, characterLimit: 400,
      },
      {
        id: 'newsletter_length', label: 'Newsletter length', type: 'select', required: true,
        options: [
          { value: 'short',  label: 'Short (300-400 words, high value density)' },
          { value: 'medium', label: 'Medium (500-700 words)' },
          { value: 'long',   label: 'Long (800-1,200 words, deep dive)' },
        ], defaultValue: 'medium',
      },
      {
        id: 'include_offer', label: 'Include a soft offer or CTA?', type: 'toggle',
        required: false, defaultValue: true,
      },
      {
        id: 'offer_details', label: 'What offer or CTA to include?', type: 'text',
        placeholder: 'e.g. Book a free strategy call via WhatsApp this week only',
        required: false, characterLimit: 200, advanced: true,
      },
    ],
    loadingMessages: [
      '📰 Crafting your newsletter structure...',
      '📖 Writing the opening story hook...',
      '💡 Delivering the core value and insight...',
      '📲 Adding the soft WhatsApp CTA...',
      '✅ Your newsletter is ready to send!',
    ],
    akinAlabiHook: 'Every newsletter opens with Story Law — a relatable Nigerian business scenario. Value is delivered (List Law: give before asking) before any offer is mentioned. Closing uses Giant Promise subtly, with WhatsApp as the action pathway.',
    outputFormats: ['markdown', 'copy-button', 'pdf-export', 'docx-export', 'save-library'],
  },

  {
    id:              'win-back-campaign',
    name:            'WinBackCampaign',
    tagline:         'Re-activate customers who went quiet and bring them back',
    description:     'WinBackCampaign creates targeted re-engagement campaigns for customers who haven\'t bought in 30, 60, or 90+ days — with the personalised messaging and irresistible offers that remind them why they chose you in the first place. It costs 7x more to acquire a new customer than to re-activate an old one.',
    category:        'Growth & Retention',
    coinCost:        30,
    icon:            '♻️',
    accentColour:    '#8B70F0',
    estimatedSeconds: 20,
    formBlocks: [
      {
        id: 'inactive_duration', label: 'How long have they been inactive?', type: 'select', required: true,
        options: [
          { value: '30_days',  label: '30 days' },
          { value: '60_days',  label: '60 days' },
          { value: '90_days',  label: '90 days' },
          { value: '6_months', label: '6 months' },
          { value: '1_year',   label: '1 year or more' },
        ],
      },
      {
        id: 'likely_reason_left', label: 'Why do you think they stopped buying?', type: 'select', required: true,
        options: [
          { value: 'forgot_us',       label: 'They just forgot about us' },
          { value: 'price',           label: 'Price — went to cheaper option' },
          { value: 'bad_experience',  label: 'Had a bad experience' },
          { value: 'no_longer_need',  label: 'No longer need the product/service' },
          { value: 'life_change',     label: 'Life circumstance changed' },
          { value: 'competition',     label: 'Competitor won them over' },
          { value: 'unknown',         label: 'Not sure' },
        ],
      },
      {
        id: 'winback_incentive', label: 'What incentive will you offer to come back?', type: 'text',
        placeholder: 'e.g. 20% comeback discount, free first session, gift with next purchase',
        required: true, characterLimit: 200,
      },
      {
        id: 'winback_channel', label: 'Communication channel', type: 'select', required: true,
        options: [
          { value: 'whatsapp',          label: 'WhatsApp direct message' },
          { value: 'email',             label: 'Email sequence' },
          { value: 'sms',               label: 'SMS' },
          { value: 'whatsapp_and_email', label: 'WhatsApp + Email combined' },
        ],
      },
      {
        id: 'num_messages', label: 'Number of messages in the sequence', type: 'select', required: true,
        options: [
          { value: '2', label: '2 messages (check-in + offer)' },
          { value: '3', label: '3 messages (we miss you + offer + urgency)' },
          { value: '5', label: '5 messages (full re-engagement journey)' },
        ], defaultValue: '3',
      },
    ],
    loadingMessages: [
      '♻️ Analysing your win-back opportunity...',
      '💌 Writing your "we miss you" opener...',
      '🎁 Crafting the irresistible comeback offer...',
      '⏰ Building urgency into the final message...',
      '✅ Your Win-Back Campaign is ready to re-activate!',
    ],
    akinAlabiHook: 'Win-back opens with List Law — acknowledge the relationship first ("It\'s been a while..."). Middle message uses Giant Promise (here\'s what\'s new and better). Final message uses Fear Law ("this offer is for our previous customers only — it closes Sunday"). Urgency/Scarcity Law closes the loop.',
    outputFormats: ['markdown', 'copy-button', 'whatsapp-share', 'pdf-export', 'save-library'],
  },
]

// ═══════════════════════════════════════════════════════════════
// COMPLETE MERGED REGISTRY EXPORT
// Import TOOL_REGISTRY from registry.ts and append these entries.
// In production, merge into a single file.
// ═══════════════════════════════════════════════════════════════

// Helper: Get tool by ID
export function getToolById(id: string, registry: any[]): any | undefined {
  return registry.find(t => t.id === id)
}

// Helper: Get tools by category
export function getToolsByCategory(category: string, registry: any[]): any[] {
  return registry.filter(t => t.category === category)
}

// Helper: Get featured tools
export function getFeaturedTools(registry: any[]): any[] {
  return registry.filter(t => t.isFeatured)
}

// Helper: Sort by coin cost
export function sortByCoinCost(registry: any[], asc = true): any[] {
  return [...registry].sort((a, b) => asc ? a.coinCost - b.coinCost : b.coinCost - a.coinCost)
}

// Helper: Filter affordable tools given a balance
export function getAffordableTools(balance: number, registry: any[]): any[] {
  return registry.filter(t => t.coinCost <= balance)
}

// Category metadata
export const CATEGORY_META: Record<string, { icon: string; colour: string; description: string }> = {
  [ToolCategory.COPYWRITING]: {
    icon: '✍️',
    colour: '#E09818',
    description: '9 tools for copy that converts',
  },
  [ToolCategory.PLANNING]: {
    icon: '📅',
    colour: '#0CC4A0',
    description: '3 tools for organised content creation',
  },
  [ToolCategory.WHATSAPP]: {
    icon: '💬',
    colour: '#25D366',
    description: '4 tools for Nigeria\'s #1 sales channel',
  },
  [ToolCategory.STRATEGY]: {
    icon: '🎯',
    colour: '#8B70F0',
    description: '6 tools for CMO-level strategic thinking',
  },
  [ToolCategory.ADVERTISING]: {
    icon: '📣',
    colour: '#FF4830',
    description: '5 tools for paid advertising mastery',
  },
  [ToolCategory.SALES]: {
    icon: '💰',
    colour: '#10B880',
    description: '4 tools for closing more deals',
  },
  [ToolCategory.REPUTATION]: {
    icon: '⭐',
    colour: '#F5A623',
    description: '3 tools for trust and credibility',
  },
  [ToolCategory.SEO]: {
    icon: '🔍',
    colour: '#4285F4',
    description: '3 tools for search visibility',
  },
  [ToolCategory.GROWTH]: {
    icon: '🚀',
    colour: '#E09818',
    description: '3 tools for retention and referrals',
  },
}
