// /lib/tools/form-suggestions.ts
// Pure suggestion engine. Given a field descriptor and the user's saved profile,
// returns an array of contextual, business-relevant suggestion strings.
// No API calls. No side effects. Runs entirely client-side.

export interface ProfileContext {
  businessName?:    string
  industry?:        string
  city?:            string
  targetCustomer?:  string   // from onboarding "who are your customers"
  description?:     string   // business description
  uniqueAdvantage?: string
  primaryGoal?:     string
  primaryChallenge?:string
}

// ── Field semantic detection ───────────────────────────────────
// Determines what type of suggestions to generate based on the field's id/label.

type FieldSemantic =
  | 'target_audience'
  | 'product_service'
  | 'content_topic'
  | 'business_situation'
  | 'usp_differentiator'
  | 'offer_deal'
  | 'competitor'
  | 'cta_text'
  | 'greeting'
  | 'social_proof'
  | 'price_range'
  | 'key_message'
  | 'objection'
  | 'winning'
  | 'hook'
  | 'none'

export function detectFieldSemantic(fieldId: string, fieldLabel = ''): FieldSemantic {
  const id  = fieldId.toLowerCase()
  const lbl = fieldLabel.toLowerCase()
  const combined = id + ' ' + lbl

  // Target audience — also catches target_customer (onboarding/profile key)
  if (/audience|target.?(customer|audience|market|who)|who.*buy|who.*read|who.*is|who.*are|ideal.?customer|customer.?profile|subscriber|target_customer/.test(combined)) {
    return 'target_audience'
  }
  // Product / service — also catches description & "what does your business do" (onboarding/profile)
  if (/product|service|offer.*sell|what.*sell|what.*promot|what.*launch|what.*advertis|being.*sold|product_name|industry_context|^description|what.*does.*business|what.*do.*you|about.*business|what.*business.*do/.test(combined)) {
    return 'product_service'
  }
  if (/topic|post.?about|what.*post|video.*about|article|carousel|story.?topic|content.*about|what.*this.*video|what.*this.*post|blog|post_topic|story_message|video_topic|key_message|video_title|whatworking|what.*working|currently.*working/.test(combined)) {
    return 'content_topic'
  }
  if (/situation|challenge|current.*market|biggest.*challenge|what.*struggle|problem|obstacle|current.*state|what.*is.*your.*market/.test(combined)) {
    return 'business_situation'
  }
  // USP — also catches unique_advantage (onboarding/profile key)
  if (/usp|unique|differ|advantage|what.*makes.*you|why.*choose|why.*should.*buy|what.*best|tagline|unique_advantage/.test(combined)) {
    return 'usp_differentiator'
  }
  if (/offer.?detail|offer.?text|promo.?detail|deal|discount|what.*deal|specific.*offer|key.?detail|key.?info|key_details/.test(combined)) {
    return 'offer_deal'
  }
  if (/competitor|competi/.test(combined)) {
    return 'competitor'
  }
  if (/\bcta\b|cta_text|call.?to.?action|thumbnail.?text|headline/.test(combined)) {
    return 'cta_text'
  }
  if (/greeting|greeting_msg|festive.?message|holiday.?message/.test(combined)) {
    return 'greeting'
  }
  // Social proof — key stats, achievements, testimonial figures (onboarding/profile)
  if (/social.?proof|social_proof|key.*stat|key.*achievement|track.*record|testimonial.*stat|achievement|milestone|how.*many.*client|satisfied.*client|trust_signal|credentials/.test(combined)) {
    return 'social_proof'
  }
  // Price range — what you charge (onboarding/profile)
  if (/price.?range|price_range|pricing|what.*charge|your.*price|typical.*cost|how.*much|cost.*of|fee|rate|normal_price|promo_price/.test(combined)) {
    return 'price_range'
  }
  // Key message / hook — the core one-liner for this campaign, post, or ad
  if (/key.?message|key_message|key_benefit|core.*message|main.*message|subscriber.?context|what.*emotion|target.?emotion|value.?add/.test(combined)) {
    return 'key_message'
  }
  // Objections — why customers hesitate (Sprint Blueprint, sales tools)
  if (/objection|hesitat|main.?reason|don.?t.?buy|currentobjdescript|obstacle|pushback|why.*not/.test(combined)) {
    return 'objection'
  }
  // Winning / success — what does success look like for this business
  if (/what.*winning|winning.*looks|success.*like|whatwinning|what.*success|result.*want|goal.*achieve/.test(combined)) {
    return 'winning'
  }
  // Hook / opening line
  if (/hook|opening.?line|first.?line|announcement.?detail|lead.?context/.test(combined)) {
    return 'hook'
  }
  return 'none'
}

// ── Industry-specific suggestion data ─────────────────────────
// Templates use {businessName}, {city}, {targetCustomer} as placeholders.

const INDUSTRY_DATA: Record<string, {
  audiences:    string[]
  products:     string[]
  topics:       string[]
  situations:   string[]
  usps:         string[]
  offers:       string[]
  ctas:         string[]
  headlines:    string[]
  greetings:    string[]
  socialProofs: string[]
  priceRanges:  string[]
}> = {
  fashion_clothing: {
    audiences: [
      'Lagos women 25–40 who want premium, locally-made Nigerian fashion',
      'Corporate women needing stylish ready-to-wear for work and events',
      'Young professionals who prefer unique handcrafted pieces over fast fashion imports',
      'Brides and bridal parties seeking custom-made aso-ebi and occasion outfits',
    ],
    products: [
      'Custom ankara designs and ready-to-wear pieces for the modern Nigerian woman',
      'Bespoke occasion wear — weddings, corporate events, and parties',
      'Affordable luxury fashion: premium Nigerian fabrics, contemporary cuts',
      'Full outfit coordination service: from fabric selection to finished garment',
    ],
    topics: [
      'Show a client transformation: before styling vs. after wearing our piece',
      '5 outfit ideas for {city} working women this week',
      'Why Nigerian fabric quality beats imported alternatives at half the price',
      'Behind the scenes: how we turn fabric into a finished custom piece in 5 days',
      'The 3 outfit mistakes most {city} women make at events (and how to avoid them)',
    ],
    situations: [
      'We have loyal repeat customers but struggle to attract new buyers consistently',
      'Our Instagram page gets views but very few people DM to enquire or buy',
      'We are getting enquiries but most people drop off when we quote a price',
    ],
    usps: [
      'All our fabrics are sourced directly from Nigerian weavers — no imported substitutes',
      'Completed in 5–7 working days, even for custom pieces. We never miss a deadline.',
      'Every client gets a fit consultation before we start sewing — zero surprises',
    ],
    offers: [
      'Buy any 2 pieces this weekend and get free delivery to {city} and environs',
      'Book a bespoke fitting this month and get a free style consultation worth ₦15,000',
      'First-time customers get 15% off their first order — mention this post to redeem',
    ],
    ctas: [
      'DM us to order',
      'Tap the link in bio to shop',
      'Send us a WhatsApp message to book your fitting',
      `Comment "I want this" and we'll DM you the details`,
    ],
    headlines: [
      'NEW COLLECTION JUST DROPPED',
      '50% OFF THIS WEEKEND ONLY',
      'YOUR NEXT FAVOURITE OUTFIT IS HERE',
      'CUSTOM DESIGNS — YOUR STYLE, YOUR WAY',
    ],
    greetings: [
      'Wishing you a blessed celebration from all of us at {businessName}',
      'From our family to yours — happy celebrations and beautiful moments ahead',
      'This season, dress the part. Wishing you joy from {businessName}',
    ],
    socialProofs: [
      'Over 500 custom outfits delivered to Lagos and Abuja clients since 2021',
      '4.9/5 rating from 300+ verified customers — zero late deliveries',
      'Featured in 3 Nigerian fashion publications and worn at 50+ high-profile events',
    ],
    priceRanges: [
      'Ready-to-wear from ₦15,000 · Custom designs from ₦45,000',
      'Casual pieces from ₦8,000 · Event outfits from ₦30,000 upwards',
      'Starter sets from ₦12,000 · Premium bespoke collections from ₦80,000',
    ],
  },

  food_restaurants: {
    audiences: [
      'Lagos office workers who want a quality hot lunch delivered within 45 minutes',
      'Families in {city} seeking authentic Nigerian catering for events and celebrations',
      'Young professionals who want healthy, home-cooked meal alternatives on weekdays',
      'Corporate clients who need reliable, professional catering for meetings and events',
    ],
    products: [
      'Daily hot lunch delivery service across {city} — quality Nigerian dishes',
      'Event catering for weddings, birthdays, corporate events, and outdoor occasions',
      'Small chops and appetiser packages for Lagos events from 30 to 500 guests',
      'Weekly meal prep subscription: healthy, home-cooked food delivered every Monday',
    ],
    topics: [
      'Show the full process of how we prepare a pot of our signature jollof rice',
      "Customer review: what our clients say after 3 months of weekly meal delivery",
      '5 Nigerian dishes that are actually healthy and why you should eat them weekly',
      'How we handled catering for a 300-person event — behind the scenes',
      "Why our delivery arrives hot every single time (and what most food businesses get wrong)",
    ],
    situations: [
      'We get many phone enquiries but struggle to convert them to confirmed bookings',
      'Our repeat customers love us but we cannot seem to grow beyond our current base',
      'We are known locally but have no consistent way to attract new corporate clients',
    ],
    usps: [
      'Guaranteed delivery within 45 minutes across Lagos Island — or the next meal is free',
      'All meals prepared fresh daily with zero reheated food — ever',
      'The only catering company in {city} with a dedicated event coordinator on every booking',
    ],
    offers: [
      'Order lunch for your team today — free delivery for first-time corporate orders',
      'Book any event catering this month and get a complimentary small chops tray',
      'New customers: try our weekly meal plan for 2 weeks at 20% off',
    ],
    ctas: [
      'Order now on WhatsApp',
      'Call us to book your event catering',
      'DM us for today\'s menu',
      'Tap to see our full menu',
    ],
    headlines: [
      'HOT LUNCH DELIVERED IN 45 MINUTES',
      'AUTHENTIC NIGERIAN CUISINE — ORDER NOW',
      'CATERING FOR YOUR NEXT EVENT',
      'FRESH. HOT. DELIVERED.',
    ],
    greetings: [
      'A blessed celebration from all of us at {businessName} — enjoy the feast',
      'Happy holidays from {businessName}. May your table always be full',
      'Season\'s greetings from {businessName} — food, family, and joy',
    ],
    socialProofs: [
      'Catered 150+ events across Lagos — from intimate dinners to 500-guest celebrations',
      'Serving 200+ daily lunch orders with 98% on-time delivery rate',
      `4.8/5 on Google Maps from 400+ reviews — 'Best jollof in Victoria Island'`,
    ],
    priceRanges: [
      'Daily lunch packs from ₦2,500 · Event catering from ₦3,500 per head',
      'Small chops packages from ₦45,000 · Full event catering from ₦250,000',
      'Weekly meal plans from ₦15,000 · Individual meals from ₦2,000',
    ],
  },

  beauty_cosmetics: {
    audiences: [
      'Nigerian women 20–40 seeking skincare formulated specifically for melanin-rich skin',
      'Working Lagos women who want professional beauty services with shorter wait times',
      'Brides and their bridal parties needing complete hair, makeup, and styling packages',
      'Naturalists looking for organic, locally-sourced hair growth and skin products',
    ],
    products: [
      'Premium skincare line for melanin-rich Nigerian skin — zero harsh chemicals',
      'Full bridal beauty packages: hair, makeup, skincare prep, and day-of styling',
      'Natural hair growth products formulated from Nigerian herbs and carrier oils',
      'Express lash and brow services in {city} — professional results in under an hour',
    ],
    topics: [
      '3 skincare mistakes most Nigerian women make in harmattan that cause breakouts',
      'Client glow-up: watch how this bride went from dull to radiant in 60 minutes',
      'Why most drugstore creams fail on melanin-rich skin — and what actually works',
      'How to maintain your natural hair health through the Lagos dry season',
      "What's in our best-selling serum and why it works for Nigerian skin specifically",
    ],
    situations: [
      'We have great reviews but struggle to maintain a consistent flow of new clients',
      'Our products sell well at pop-ups but we cannot convert that to online sales',
      'Clients love our services but rarely refer us or share on social media unprompted',
    ],
    usps: [
      'Every product is formulated and tested for Nigerian skin tones — not adapted from Western formulas',
      'Results guaranteed in 4 weeks or we refund your product, no questions asked',
      'Appointments start exactly on time — we respect that our clients have busy schedules',
    ],
    offers: [
      'First facial with us is 30% off — book via WhatsApp and mention this post',
      'Buy any 2 skincare products this week and get free delivery anywhere in {city}',
      'Bridal trial package: full makeup test + 1 skincare consultation for ₦15,000',
    ],
    ctas: [
      'Book your appointment via WhatsApp',
      'DM us to order your skincare set',
      'Tap the link in bio to shop',
      'Comment your city and we\'ll share delivery details',
    ],
    headlines: [
      'GLOW UP STARTS HERE',
      'YOUR SKIN DESERVES BETTER',
      'NEW SKINCARE COLLECTION — MELANIN FIRST',
      'BOOK YOUR BRIDAL BEAUTY PACKAGE',
    ],
    greetings: [
      'Happy celebrations from {businessName} — glow all season long',
      'This festive season, shine from {businessName} to you',
      'Wishing you beauty, joy and great skin from {businessName}',
    ],
    socialProofs: [
      'Transformed 800+ clients — 95% return rate for repeat bookings',
      'Bridal beauty specialist with 200+ weddings completed across Lagos and Abuja',
      '4.9 rating on Instagram from 1,000+ tagged client posts in 2 years',
    ],
    priceRanges: [
      'Skincare consultations from ₦5,000 · Full bridal packages from ₦80,000',
      'Express services from ₦3,500 · Premium packages from ₦25,000',
      'Monthly skincare sets from ₦18,000 · Single products from ₦4,500',
    ],
  },

  technology_software: {
    audiences: [
      'Nigerian SMEs that need affordable, locally supported software with real human help',
      'Lagos and Abuja startups who need solid tech infrastructure from day one',
      'Traditional businesses in {city} ready to digitise their operations and go online',
      'Companies that have been burned by foreign software with no local support',
    ],
    products: [
      'Custom software development built for the African market and Nigerian internet conditions',
      'Business management software: inventory, invoicing, payroll — all in one Nigerian-built platform',
      'Mobile app development for SMEs: affordable, fast, and built to scale',
      'Website design and development with built-in SEO and WhatsApp integration',
    ],
    topics: [
      'How a {city} retail business reduced stock losses by 60% after going digital',
      '5 Nigerian businesses that went from pen-and-paper to profitable software users in 90 days',
      'Why most Nigerian businesses outgrow their first software in year 2 — and how to avoid it',
      'The real cost of running a business without proper accounting software in Nigeria',
      'How to choose the right software for your Nigerian business without wasting money',
    ],
    situations: [
      'We have a great product but our target buyers are slow to adopt new technology',
      'We win contracts easily but struggle to demonstrate ROI to clients who have never used software before',
      'We are competing against international tools with bigger marketing budgets',
    ],
    usps: [
      'Built and supported by Nigerian developers who understand your market, your internet speeds, and your needs',
      'Onboarding takes 2 days, not 2 months — and includes free training for your entire team',
      'Works offline and syncs automatically when connectivity is restored — built for Nigerian realities',
    ],
    offers: [
      'Start your free 30-day trial with full features — no credit card needed',
      'First 3 months at 40% off for businesses that sign up before month-end',
      'Free data migration from your current system — we do all the work',
    ],
    ctas: [
      'Start your free 30-day trial today',
      'Book a demo call with our team',
      'Click to get a free quote',
      'WhatsApp us to discuss your needs',
    ],
    headlines: [
      'DIGITAL SOLUTIONS BUILT FOR NIGERIA',
      'YOUR BUSINESS. DIGITISED. TODAY.',
      'STOP LOSING MONEY TO MANUAL PROCESSES',
      'SOFTWARE THAT WORKS IN NIGERIAN CONDITIONS',
    ],
    greetings: [
      'Wishing you a productive new year from the {businessName} team',
      'Happy holidays from {businessName} — here\'s to a more digital 2025',
      'Season\'s greetings from {businessName}. Thank you for trusting us with your business',
    ],
    socialProofs: [
      'Built and deployed software for 60+ Nigerian businesses — zero failed launches',
      'Saved clients an average of ₦2.5M per year in operational inefficiencies',
      'ISO-certified team with 5 years average experience building for African markets',
    ],
    priceRanges: [
      'Website from ₦150,000 · Custom software from ₦500,000 · Monthly SaaS from ₦25,000',
      'MVP development from ₦300,000 · Annual support packages from ₦80,000/month',
      'Setup from ₦200,000 · Ongoing maintenance from ₦50,000/month',
    ],
  },

  real_estate: {
    audiences: [
      'Lagos professionals earning ₦500K+/month looking for their first home purchase',
      'Diaspora Nigerians investing remotely in Lagos and Abuja property',
      'Young couples seeking affordable plots in emerging satellite towns around {city}',
      'Investors building short-let portfolios in high-demand Lagos Island locations',
    ],
    products: [
      'Residential plots and homes in {city} — verified titles, payment plans available',
      'Off-plan property investments in rapidly appreciating Lagos neighbourhoods',
      'Short-let property management: we handle everything so you earn passively',
      'Land banking packages in {city} satellite towns — starting from ₦2.5M',
    ],
    topics: [
      '5 things every Nigerian must verify before buying land in {city}',
      'Why this {city} neighbourhood has appreciated 40% in 3 years — and is still underpriced',
      'How diaspora clients buy Nigerian property remotely — our secure process explained',
      'The difference between C of O, R of O, and Gazette — and which actually protects you',
      'First-time buyer in {city}? Here are the 6 questions you must ask your agent',
    ],
    situations: [
      'We have genuine properties but face constant buyer scepticism about documentation and fraud',
      'Our referrals are strong but our digital presence does not match our offline reputation',
      'We attract serious enquiries but the sales cycle is very long due to trust-building requirements',
    ],
    usps: [
      'Every property comes with a full title verification report — you see the documents before you pay',
      '12-month payment plans available on all our {city} properties — no bank needed',
      'We have completed over 300 transactions without a single title dispute — verified and documented',
    ],
    offers: [
      'Reserve your plot with just 30% down — balance spread over 12 months',
      'Buy this weekend and get free government processing fees worth ₦150,000',
      'Virtual inspection available for diaspora buyers — WhatsApp us to schedule',
    ],
    ctas: [
      'Call us to schedule a site inspection',
      'Send us a WhatsApp message to get the brochure',
      'DM us — payment plans available',
      'Tap to see all available properties',
    ],
    headlines: [
      'YOUR DREAM HOME IN {city} — VERIFIED TITLE',
      'LAND FOR SALE — PAYMENT PLAN AVAILABLE',
      'INVEST IN {city} PROPERTY TODAY',
      'NEW LISTING — ACT FAST',
    ],
    greetings: [
      'Wishing you a home full of joy this season — from {businessName}',
      'Happy new year from {businessName}. May this year bring the home of your dreams',
      'Season\'s greetings from {businessName} — thank you for trusting us',
    ],
    socialProofs: [
      '₦4.2B in property transactions completed — 300+ happy homeowners in Lagos',
      '100% of properties sold with verified government titles — zero disputes in 6 years',
      'Trusted by 500+ diaspora clients to invest in Nigerian property remotely',
    ],
    priceRanges: [
      'Land from ₦3M · 2-bedroom apartments from ₦18M · Duplexes from ₦45M',
      'Off-plan investments from ₦5M · Completed homes from ₦25M upwards',
      'Short-let management from 10% commission · Sales commission from 5%',
    ],
  },

  education_training: {
    audiences: [
      'Nigerian youth 18–30 seeking practical, career-ready vocational skills training',
      'Working professionals in {city} who want to upskill without leaving their jobs',
      'Business owners wanting structured training and industry-recognised certifications',
      'Parents seeking quality after-school STEM and business training for secondary students',
    ],
    products: [
      'Practical skills training courses designed for Nigerian career market entry and advancement',
      'Weekend and evening business classes for {city} entrepreneurs who cannot attend full-time',
      'Digital marketing bootcamp: 6 weeks, hands-on, taught by practitioners not academics',
      'Corporate training programmes: customised for your team, delivered on-site or online',
    ],
    topics: [
      'Graduate who completed our programme 6 months ago — this is where they are now',
      '5 skills Nigerian employers are desperately looking for that schools do not teach',
      'How our weekend programme fits around a full-time job — a student shares their experience',
      'Why practical training produces better career outcomes than degrees in today\'s Nigerian market',
      'The 3 certifications {city} employers actually check and respect in 2025',
    ],
    situations: [
      'We have strong course content but struggle to convince prospects to invest in training during tough times',
      'Our completion rates are excellent but we are not getting enough new enrolments each month',
      'We attract students but many drop out due to financial pressure or competing commitments',
    ],
    usps: [
      'Job placement support included: we actively connect graduates to our employer network',
      '80% of our graduates report a salary increase or new employment within 90 days of completion',
      'Pay in 3 instalments — we want nothing to stop a determined learner from accessing training',
    ],
    offers: [
      'Enrol this week and get our ₦25,000 career resources toolkit completely free',
      'Pay for one course, bring a friend for 50% off — both of you go further together',
      'Early registration for our next cohort: save ₦15,000 if you register by Friday',
    ],
    ctas: [
      'Register now — limited seats available',
      'DM us for the course brochure',
      'Apply before the deadline this Friday',
      'WhatsApp us to speak with an advisor',
    ],
    headlines: [
      'ENROL NOW — NEXT COHORT STARTS SOON',
      'GET THE SKILLS {city} EMPLOYERS WANT',
      'YOUR CAREER STARTS HERE',
      'LIMITED SEATS — REGISTER TODAY',
    ],
    greetings: [
      'Happy new year from {businessName} — this is your year to level up',
      'Season\'s greetings from {businessName}. Wishing you growth and new skills ahead',
      'A blessed celebration from the {businessName} family to yours',
    ],
    socialProofs: [
      '80% of graduates secured employment or new contracts within 90 days of completing',
      'Trained 2,000+ students across Lagos and Abuja since 2019 — 4.8/5 satisfaction',
      'Our graduates have gone on to earn an average of 40% more than before training',
    ],
    priceRanges: [
      'Short courses from ₦15,000 · Bootcamps from ₦75,000 · Certification programmes from ₦120,000',
      'Weekend workshops from ₦8,000 · 3-month programmes from ₦45,000',
      'Online courses from ₦5,000 · In-person intensive from ₦60,000',
    ],
  },

  logistics_delivery: {
    audiences: [
      'Lagos SMEs needing reliable same-day delivery across the island and mainland',
      'E-commerce sellers who need an affordable last-mile delivery partner they can trust',
      'Restaurants and food businesses in {city} who need fast, professional delivery riders',
      'Businesses importing goods who need clearing, forwarding, and bonded warehousing',
    ],
    products: [
      'Same-day delivery service across {city} — starting from ₦1,500 per delivery',
      'Dedicated dispatch rider service: monthly contracts for e-commerce and food businesses',
      'Bulk cargo haulage and distribution across Nigeria — tracking included',
      'Customs clearing and freight forwarding for Nigerian importers',
    ],
    topics: [
      'How we delivered 800 packages in one day without a single lost item — our process',
      '3 signs your current delivery company is costing you more than you think',
      'Why {city} e-commerce businesses are switching to dedicated dispatch riders in 2025',
      'What to look for in a last-mile delivery partner before signing a contract',
      'How we\'ve maintained a 98.7% on-time delivery rate for 2 years in Lagos traffic',
    ],
    situations: [
      'Customers love our core service but poor delivery experiences are hurting our reviews',
      'We are growing fast but cannot find a delivery partner that scales reliably with us',
      'We are losing e-commerce sales because our current delivery is too slow and unreliable',
    ],
    usps: [
      'Real-time tracking link sent to every customer automatically — no chasing for updates',
      'Dedicated account manager for all business clients — you always reach a real person',
      '₦0 delivery fee for first 10 deliveries — try us before committing to a contract',
    ],
    offers: [
      'First 10 deliveries are completely free — no commitment, no contract',
      'Sign a monthly contract this week and get the first week\'s deliveries at half price',
      'Refer another business: you both get 20 free deliveries when they sign up',
    ],
    ctas: [
      'Call us now to book your delivery',
      'WhatsApp us for an instant quote',
      'Get your first 10 deliveries free — sign up today',
      'DM us to discuss a monthly contract',
    ],
    headlines: [
      'SAME-DAY DELIVERY ACROSS {city}',
      'RELIABLE. FAST. TRACKED.',
      'YOUR PACKAGES — SAFE AND ON TIME',
      'FREE FIRST 10 DELIVERIES — TRY US TODAY',
    ],
    greetings: [
      'Happy holidays from the {businessName} team — keeping your deliveries moving all season',
      'Season\'s greetings from {businessName}. Thank you for trusting us with your shipments',
      'Wishing you joy and smooth deliveries from {businessName}',
    ],
    socialProofs: [
      '800,000+ packages delivered across Lagos with 98.7% on-time rate',
      'Trusted by 200+ e-commerce businesses for their last-mile delivery',
      'Zero lost shipment claims in 3 years of operation — 100% insured deliveries',
    ],
    priceRanges: [
      'Within Lagos from ₦1,200 · Same-day island-to-mainland from ₦2,500',
      'Monthly contracts from ₦80,000 · Per-delivery from ₦1,500',
      'Bulk rates from ₦800 per delivery · Dedicated rider from ₦60,000/month',
    ],
  },

  healthcare_wellness: {
    audiences: [
      'Lagos residents 30–55 who want accessible, affordable primary healthcare nearby',
      'Corporate clients in {city} seeking HMO packages and employee wellness programmes',
      'Pregnant women and new mothers needing quality maternal health support',
      'Fitness-conscious Nigerians looking for personalised nutrition and wellness coaching',
    ],
    products: [
      'Primary healthcare services: consultations, lab tests, prescriptions — all under one roof',
      'Corporate HMO and wellness packages for businesses with 5 to 500 employees',
      'Antenatal care package: complete prenatal monitoring from booking to delivery',
      'Nutrition and lifestyle coaching for busy {city} professionals wanting better health outcomes',
    ],
    topics: [
      'Patient story: how early diagnosis changed everything for a 42-year-old {city} father',
      '5 health checks every Nigerian over 35 should do annually — and most never do',
      'Why Lagos corporate employees are burning out faster — and what good employers do about it',
      'The real cost of ignoring your annual medical checkup as a Nigerian professional',
      'How to choose a trustworthy healthcare provider in {city} — 7 questions to ask',
    ],
    situations: [
      'We provide excellent care but struggle to communicate that quality to new patients digitally',
      'Our existing patients are loyal but most new patients come only after an emergency',
      'We have strong medical expertise but our marketing does not reflect the quality of our service',
    ],
    usps: [
      'Appointments within 24 hours — no more waiting 3 weeks to see a doctor',
      'All our doctors are Nigerian-trained and board-certified — speak your language, understand your context',
      'Transparent pricing: you see the cost before you receive any service, no surprise bills',
    ],
    offers: [
      'Book a full health screening this month for ₦15,000 — save ₦8,000 off normal price',
      'Corporate: free health talk for your team when you enquire about our HMO package',
      'New patients: first consultation free when you book by WhatsApp before Friday',
    ],
    ctas: [
      'Book your appointment via WhatsApp',
      'Call us to schedule a consultation',
      'DM us for our service menu and pricing',
      'Tap the link to book online',
    ],
    headlines: [
      'YOUR HEALTH IS YOUR WEALTH',
      'BOOK A CHECK-UP — TAKE CHARGE OF YOUR HEALTH',
      'QUALITY HEALTHCARE IN {city}',
      'EARLY DETECTION SAVES LIVES — BOOK TODAY',
    ],
    greetings: [
      'Wishing you a healthy, joyful celebration from {businessName}',
      'Season\'s greetings from {businessName}. Your health is our priority, always',
      'Happy holidays from the {businessName} team — stay healthy, stay happy',
    ],
    socialProofs: [
      '3,000+ patients served since 2020 — 92% patient satisfaction score',
      'Early detection changed lives: 400+ patients diagnosed and successfully treated',
      'Accredited clinic with board-certified doctors — 4.9/5 on Google and Zocdoc',
    ],
    priceRanges: [
      'Consultations from ₦5,000 · Full health screening from ₦25,000',
      'Annual wellness packages from ₦80,000 · Corporate HMO from ₦15,000/employee',
      'Antenatal care package from ₦120,000 · Specialist consultations from ₦15,000',
    ],
  },

  events_entertainment: {
    audiences: [
      'Lagos professionals planning weddings with budgets from ₦5M upwards',
      'Corporate clients in {city} who need professional event management for conferences',
      'Families planning birthdays, naming ceremonies, and graduation celebrations',
      'Brands seeking creative event activations and experiential marketing campaigns',
    ],
    products: [
      'Full-service wedding planning: venue, decor, catering coordination, and day-of management',
      'Corporate events: conferences, product launches, team retreats, and award ceremonies',
      'Birthday and social event packages — complete planning from guest list to cleanup',
      'Brand activations and experiential marketing events across {city}',
    ],
    topics: [
      'Inside our most elaborate {city} wedding this year — budget, breakdown, and lessons',
      '5 venue mistakes {city} couples make that cost them ₦500K more than necessary',
      'Corporate event vs. DIY: what a {city} company learned after their product launch disaster',
      'How we plan a 300-person event in 4 weeks — our exact process and checklist',
      'The 7 questions to ask any event planner before paying a deposit',
    ],
    situations: [
      'Our events are consistently excellent but we struggle to get clients who have not seen our work',
      'We win clients through word of mouth but our online presence does not represent our quality',
      'We are getting more enquiries but most are fishing for the cheapest option, not the best',
    ],
    usps: [
      'We have managed 150+ events in {city} without a single missed timeline or vendor failure',
      'Full post-event cleanup and documentation included — you enjoy your day, we handle everything',
      'We have exclusive vendor relationships that save our clients 20–30% vs. market rates',
    ],
    offers: [
      'Book this month and get a complimentary decor consultation worth ₦50,000',
      'Corporate enquiries: free site inspection and initial proposal — no obligation',
      'Refer a client who books with us — receive ₦30,000 referral bonus after their event',
    ],
    ctas: [
      'Send us a WhatsApp message to get a quote',
      'DM us to check availability for your date',
      'Call us now to book your event',
      'Fill the inquiry form — link in bio',
    ],
    headlines: [
      'YOUR EVENT. PERFECTLY PLANNED.',
      'WE TURN YOUR VISION INTO REALITY',
      'BOOK YOUR EVENT NOW — LIMITED DATES LEFT',
      'LUXURY EVENTS IN {city}',
    ],
    greetings: [
      'Wishing you a joyful celebration from the {businessName} team',
      'Happy holidays from {businessName} — thank you for letting us be part of your special moments',
      'Season\'s greetings from {businessName}. Here\'s to more beautiful events ahead',
    ],
    socialProofs: [
      '200+ flawless events — from intimate 20-person dinners to 1,500-guest weddings',
      'Trusted by 5 Fortune 500 companies in Nigeria for their annual events since 2020',
      'Zero cancelled events in 4 years — 100% delivery on contracted date and budget',
    ],
    priceRanges: [
      'Birthday events from ₦350,000 · Weddings from ₦1.5M · Corporate events from ₦800,000',
      'Decor-only packages from ₦150,000 · Full event management from ₦600,000',
      'Consultation from ₦50,000 · Full-service events from ₦500,000 upwards',
    ],
  },

  ecommerce_retail: {
    audiences: [
      'Nigerian online shoppers 20–40 who value fast delivery and genuine quality',
      'Budget-conscious buyers in {city} looking for real value without compromising quality',
      'Gift buyers searching for unique, locally-made Nigerian products and curated items',
      'Bulk buyers and resellers sourcing quality products to sell through their own channels',
    ],
    products: [
      'Curated collection of quality Nigerian products delivered across {city} within 24 hours',
      'Premium gift sets featuring locally-made products — perfect for corporate gifting',
      'Bulk and wholesale supply for resellers and retail buyers across Nigeria',
      'Subscription boxes featuring the best Nigerian artisan and food products monthly',
    ],
    topics: [
      'Customer unboxing: watch how we pack and deliver orders across {city}',
      '5 locally-made Nigerian products that are actually better than their imported equivalents',
      'How we guarantee every order arrives exactly as described — our quality process',
      'Gift ideas under ₦10,000 for every type of person — {city} edition',
      'Why we chose to work exclusively with Nigerian producers (and why it matters to you)',
    ],
    situations: [
      'We have a great product range but our social media content is not converting to sales',
      'Customers who buy once rarely return — our repeat purchase rate needs improvement',
      'We get good traffic but most people browse and leave without adding to cart',
    ],
    usps: [
      'Every product is personally inspected before shipping — no compromises on quality',
      'Same-day delivery available across {city} — order before noon, receive by 6pm',
      '14-day no-questions-asked returns: if you are not happy, we make it right',
    ],
    offers: [
      'First order 15% off — use code WELCOME15 at checkout',
      'Free delivery on orders above ₦15,000 anywhere in {city}',
      'Buy 3, get 1 free on all gift sets this week only — offer ends Sunday',
    ],
    ctas: [
      'Shop now — link in bio',
      'DM us to order',
      'Order on WhatsApp for same-day delivery in {city}',
      'Tap to buy — we deliver nationwide',
    ],
    headlines: [
      'NEW ARRIVALS JUST LANDED',
      'SALE — UP TO 50% OFF THIS WEEKEND',
      'FREE DELIVERY ON ORDERS ABOVE ₦15,000',
      'SHOP LOCAL. SHOP QUALITY.',
    ],
    greetings: [
      'Happy celebrations from {businessName} — treat yourself this season',
      'Season\'s greetings from {businessName}. Thank you for shopping with us',
      'Wishing you joy and great purchases from {businessName}',
    ],
    socialProofs: [
      '10,000+ orders fulfilled across Nigeria — 4.8/5 from 2,000+ verified reviews',
      '₦120M in GMV processed in 2024 — fastest growing online store in our category',
      '99.2% order accuracy rate — less than 0.8% returns across 15,000+ orders',
    ],
    priceRanges: [
      'Products from ₦2,500 · Premium range from ₦15,000 · Bundle deals from ₦8,000',
      'Entry-level from ₦1,500 · Mid-range from ₦8,000 · Premium from ₦25,000+',
      'Everyday items from ₦3,000 · Gift sets from ₦12,000 · Wholesale from ₦50,000',
    ],
  },

  finance_fintech: {
    audiences: [
      'Nigerian SMEs that need accessible business credit without traditional collateral barriers',
      'Salary earners in {city} wanting smarter ways to save and grow money in naira',
      'Students and young professionals building their first savings and investment habits',
      'Businesses needing faster, cheaper cross-border payments and foreign exchange',
    ],
    products: [
      'Business loans for Nigerian SMEs: fast approval, flexible repayment, no land collateral',
      'Digital savings and investment platform built for Nigerian income and spending patterns',
      'Cross-border payment solution: send and receive money between Nigeria and abroad cheaply',
      'Business account with built-in invoicing, payroll, and expense tracking',
    ],
    topics: [
      'How a {city} SME grew revenue 300% after accessing working capital through us',
      '5 money mistakes Nigerian entrepreneurs make in year one — and how to avoid them',
      'Why traditional banks cannot serve Nigeria\'s growing middle class — and who can',
      'How to build a ₦1M emergency fund on a ₦200,000 salary in {city}',
      'The real ROI of getting your business finances in order: a {city} case study',
    ],
    situations: [
      'We offer a genuinely better financial product but trust is a major barrier for new users',
      'Our product is excellent but Nigerians have been burned by too many financial scams',
      'We are growing through referrals but need to build credibility at scale',
    ],
    usps: [
      'CBN-licensed and regulated — your money is protected by Nigerian financial law',
      'Loan decisions in 4 hours — not 4 weeks like traditional banks',
      '100% digital: open your account, apply for credit, and receive funds without leaving {city}',
    ],
    offers: [
      'Open an account today: earn 18% p.a. on your savings from day one',
      'Apply for a business loan — no processing fees for applications received this week',
      'Refer a friend who opens an account: you both earn ₦5,000 cashback',
    ],
    ctas: [
      'Download the app and start today',
      'Open your account in 5 minutes — link in bio',
      'Apply for a loan — WhatsApp us your details',
      'Book a free financial consultation',
    ],
    headlines: [
      'GROW YOUR MONEY. BUILT FOR NIGERIA.',
      'APPLY FOR A LOAN IN 4 HOURS',
      'SAVE SMARTER. EARN MORE.',
      'YOUR FINANCIAL FREEDOM STARTS HERE',
    ],
    greetings: [
      'Wishing you financial abundance this season from {businessName}',
      'Happy new year from {businessName} — may this year be your most prosperous',
      'Season\'s greetings from {businessName}. Thank you for trusting us with your finances',
    ],
    socialProofs: [
      '₦2.8B in loans disbursed to 5,000+ Nigerian SMEs — 94% repayment rate',
      'Managing ₦500M+ in client savings and investments — CBN-licensed and regulated',
      'Saved clients an average of ₦180,000/year in banking fees and transaction costs',
    ],
    priceRanges: [
      'Business loans from ₦500,000 · Processing fee 1.5% · Monthly rate from 3%',
      'Investment plans from ₦10,000/month · Returns from 12% p.a.',
      'Account management free · Transaction fees from ₦50 · FX from 0.5% spread',
    ],
  },

  other: {
    audiences: [
      'Nigerian business owners who want reliable, professional services at fair prices',
      'Lagos professionals who value quality work, clear communication, and delivered results',
      'SMEs across Nigeria looking for solutions that genuinely understand the local market',
      'Anyone who has been underserved or overcharged by existing providers in this category',
    ],
    products: [
      'Professional services delivered to the highest standard — on time, every time',
      'Bespoke solutions designed specifically for your business — not a one-size-fits-all package',
      'Results-focused approach: we measure success by the outcomes we deliver for you',
      'Local expertise with international quality standards — the best of both worlds',
    ],
    topics: [
      'Client spotlight: the result we delivered for a {city} business in the last 30 days',
      '3 ways our approach is fundamentally different from what you have tried before',
      'Behind the scenes: how we actually deliver results for our clients',
      'The honest truth about what most providers in our industry get wrong',
      'Why our {city} clients stay with us for years — not just one project',
    ],
    situations: [
      'We deliver excellent results but struggle to demonstrate our value to new prospects',
      'Our satisfied clients rarely put their testimonials in writing or post on social media',
      'We are consistently busy but not growing because we rely entirely on word of mouth',
    ],
    usps: [
      'We have delivered results for over {count} {city} businesses — verified and referenceable',
      'Transparent pricing, no hidden costs, and a clear deliverables list in every proposal',
      'We only take on clients we are genuinely confident we can serve — no overpromising',
    ],
    offers: [
      'Free consultation this week — 30 minutes to understand your challenge before we propose anything',
      'Refer a client who becomes a customer: receive 10% of their first invoice as a thank-you',
      'Pilot engagement available: start small, see results, then decide on a full engagement',
    ],
    ctas: [
      'Contact us today to get started',
      'DM us for more information',
      'WhatsApp us — we respond within the hour',
      'Click the link in bio to learn more',
    ],
    headlines: [
      'QUALITY YOU CAN COUNT ON',
      'GET IN TOUCH — WE\'RE READY TO HELP',
      'TRUSTED BY {city} BUSINESSES',
      'YOUR SOLUTION STARTS HERE',
    ],
    greetings: [
      'Happy celebrations from all of us at {businessName}',
      'Season\'s greetings from {businessName} — thank you for your trust and support',
      'Wishing you a joyful season from the {businessName} team',
    ],
    socialProofs: [
      'Served 500+ satisfied clients across Lagos and Abuja since 2020',
      '4.9/5 average rating from verified client reviews — 97% would recommend us',
      'Consistent delivery record: 98% of projects completed on time and on budget',
    ],
    priceRanges: [
      'Starter packages from ₦25,000 · Standard from ₦75,000 · Premium from ₦200,000',
      'Hourly rate from ₦15,000 · Project-based from ₦50,000 · Retainer from ₦80,000/month',
      'Basic package from ₦30,000 · Full service from ₦150,000 upwards',
    ],
  },
}

// ── Suggestion resolver ────────────────────────────────────────
function interpolate(template: string, ctx: ProfileContext): string {
  return template
    .replace(/\{businessName\}/g, ctx.businessName || 'your business')
    .replace(/\{city\}/g, ctx.city || 'your city')
    .replace(/\{targetCustomer\}/g, ctx.targetCustomer || 'your ideal customer')
    .replace(/\{count\}/g, '100')
}

export function getFieldSuggestions(
  fieldId:    string,
  fieldLabel: string,
  profile:    ProfileContext,
): string[] {
  const semantic  = detectFieldSemantic(fieldId, fieldLabel)
  if (semantic === 'none') return []

  const industry  = profile.industry || 'other'
  const data      = INDUSTRY_DATA[industry] || INDUSTRY_DATA.other
  const ctx       = profile

  let pool: string[] = []

  switch (semantic) {
    case 'target_audience': {
      // Lead with the user's own saved target customer, then industry data
      const saved = ctx.targetCustomer?.trim()
      pool = [
        ...(saved ? [saved] : []),
        ...data.audiences,
      ].filter(Boolean)
      break
    }

    case 'product_service': {
      const desc = ctx.description?.trim()
      pool = [
        ...(desc ? [desc] : []),
        ...data.products,
      ].filter(Boolean)
      break
    }

    case 'content_topic': {
      pool = data.topics
      // Add challenge-driven topic ideas if we know their challenge
      const challenge = ctx.primaryChallenge
      if (challenge?.includes('engagement')) {
        pool = ['Share a client transformation with before/after visuals', ...pool]
      }
      if (challenge?.includes('competitors')) {
        pool = ['Compare your approach vs. the standard way others do it in your industry', ...pool]
      }
      if (challenge?.includes('customers')) {
        pool = ['Tell the story of your most recent satisfied client — in their own words', ...pool]
      }
      break
    }

    case 'business_situation': {
      // Show relevant to their challenge
      const challenge = ctx.primaryChallenge
      pool = data.situations
      if (challenge) {
        const challengeMap: Record<string, string> = {
          "I don't have time for marketing": `We are a small team of ${ctx.businessName ? ctx.businessName + ' team members' : 'people'} and marketing consistently is our biggest challenge`,
          "I don't know where to start": 'We have a good product but no clear marketing strategy or budget allocation',
          "I can't afford a marketing team": 'We are handling all marketing in-house but lack the specialist skills to do it well',
          "I post but get no engagement": 'We post 3–5 times per week but get very little engagement and almost no enquiries from social media',
          "I don't know what my competitors are doing": 'We have no visibility into how our competitors are positioning, pricing, or marketing themselves',
          "My branding is inconsistent": 'Our visual identity, voice, and messaging differ across Instagram, WhatsApp, and our website',
        }
        const mapped = challengeMap[challenge]
        if (mapped) pool = [mapped, ...pool]
      }
      break
    }

    case 'usp_differentiator': {
      const advantage = ctx.uniqueAdvantage?.trim()
      pool = [
        ...(advantage ? [advantage] : []),
        ...data.usps,
      ].filter(Boolean)
      break
    }

    case 'offer_deal': {
      pool = data.offers
      break
    }

    case 'cta_text': {
      pool = data.ctas
      break
    }

    case 'greeting': {
      pool = data.greetings
      break
    }

    case 'social_proof': {
      pool = data.socialProofs
      break
    }

    case 'price_range': {
      pool = data.priceRanges
      break
    }

    case 'competitor': {
      pool = [
        `Large national brands with bigger budgets but less personalised service than ${ctx.businessName || 'us'}`,
        `Informal local providers in ${ctx.city || 'our market'} who compete mainly on price`,
        'International platforms adapted for Nigeria — they lack local market understanding',
        'Individual freelancers who cannot offer the consistency and reliability a business needs',
      ]
      break
    }

    case 'key_message': {
      // Key messages derived from the user's core advantage
      const advantage = ctx.uniqueAdvantage?.trim()
      const biz = ctx.businessName || 'we'
      const cust = ctx.targetCustomer || 'our customers'
      pool = [
        ...(advantage ? [`${advantage} — that is why ${cust} keep coming back`] : []),
        ...data.usps.slice(0, 2),
        ...data.ctas.slice(0, 1),
      ].filter(Boolean)
      break
    }

    case 'objection': {
      // Common objections for the industry
      const objections: Record<string, string[]> = {
        fashion_clothing:     [`"It's too expensive for what it is"`, `"I'll check other options first"`, `"I'm not sure about the quality before I pay"`],
        food_restaurants:     [`"I'm not sure the food will still be hot on arrival"`, `"It's cheaper to buy from somewhere closer"`, `"I've had bad experiences with food delivery before"`],
        beauty_cosmetics:     [`"Let me see results on someone else first"`, `"I'll wait until after payday"`, `"I can get cheaper products at the market"`],
        technology_software:  [`"We tried software before and it didn't work for us"`, `"It's too complex for my team to learn"`, `"We're worried about our data security"`],
        real_estate:          [`"The documentation might not be genuine"`, `"I want to see the property in person first"`, `"The price might drop if I wait"`],
        education_training:   [`"I don't have time with my current job"`, `"How do I know this certification is valuable?"`, `"I'll do it next year when things calm down"`],
        logistics_delivery:   [`"My last delivery partner kept losing packages"`, `"The price is higher than what I currently pay"`, `"I need to test you before committing"`],
        healthcare_wellness:  [`"I'll only go if it gets worse"`, `"I don't trust private hospitals with their bills"`, `"I want to check your doctor's qualifications first"`],
        events_entertainment: [`"Can you guarantee everything will run on time?"`, `"I've been let down by event planners before"`, `"Your quote is higher than others I've seen"`],
        ecommerce_retail:     [`"What if the product is different from the photo?"`, `"How do I return it if I don't like it?"`, `"I don't trust paying online without seeing the seller"`],
        finance_fintech:      [`"How do I know my money is safe with you?"`, `"The interest rate sounds too low to be real"`, `"I've seen too many fintech scams in Nigeria"`],
        other:                [`"Let me think about it and get back to you"`, `"It's a bit outside my budget right now"`, `"I want to compare more options first"`],
      }
      pool = objections[ctx.industry || 'other'] || objections.other
      break
    }

    case 'winning': {
      // What winning looks like for this specific business
      const biz = ctx.businessName || 'the business'
      const cust = ctx.targetCustomer ? ctx.targetCustomer.split(' ').slice(0,6).join(' ') : 'ideal customers'
      pool = [
        `20 new paying clients in 60 days — each referral brings another without paid ads`,
        `${biz} becomes the first name ${cust} mention when recommending our category in ${ctx.city || 'the city'}`,
        `A fully booked calendar for the next 3 months with a waiting list for the month after`,
      ]
      break
    }

    case 'hook': {
      // Opening hook or announcement hook
      const biz = ctx.businessName || 'we'
      pool = [
        `Most ${ctx.industry?.replace(/_/g,' ')||'Nigerian'} businesses make this mistake — here is how ${biz} fixed it`,
        `The real reason ${ctx.targetCustomer||'Nigerian buyers'} keep coming back to ${biz} (it is not what you think)`,
        `${biz} just changed how ${ctx.city||'Lagos'} ${ctx.industry?.replace(/_/g,' ')||'businesses'} operate — here is what happened`,
      ]
      break
    }
  }

  // Interpolate variables and return up to 4 suggestions
  return pool
    .slice(0, 4)
    .map(s => interpolate(s, ctx))
}

// ── Convenience: is this field type eligible for suggestions? ──
// Only text and textarea fields make sense to suggest for.
export function fieldIsEligibleForSuggestions(fieldType: string): boolean {
  return fieldType === 'text' || fieldType === 'textarea'
}
