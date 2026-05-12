// ═══════════════════════════════════════════════════════════════
// /lib/onboarding/business-intelligence.ts
// Detects industry from business name, maps Nigerian area names
// to cities, and provides smart autocomplete for African locations.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface IndustryDetectionResult {
  industry:    string
  confidence:  'high' | 'medium' | 'low'
  reasoning:   string   // Short reason shown to user: "We detected 'Clinic' in your name"
}

export interface LocationResult {
  display:   string   // "Lagos, Nigeria"
  city:      string   // "Lagos"
  country:   string   // "Nigeria"
  flag:      string   // "🇳🇬"
  state?:    string   // "Lagos State"
}

// ─────────────────────────────────────────────────────────────
// INDUSTRY CATEGORIES (20 categories matching the spec)
// ─────────────────────────────────────────────────────────────

export const INDUSTRY_CATEGORIES = [
  'Real Estate & Property',
  'Food & Restaurants',
  'Healthcare & Clinics',
  'Fashion & Beauty',
  'Education & Training',
  'Financial Services & Fintech',
  'E-Commerce & Retail',
  'Professional Services',
  'Technology & Digital Services',
  'Events & Entertainment',
  'Logistics & Transportation',
  'Agriculture & Food Production',
  'Media & Creative Services',
  'Fitness & Wellness',
  'Hospitality & Tourism',
  'Construction & Interior Design',
  'Automobile & Transport',
  'Religious Organisations & NGOs',
  'Manufacturing & Production',
  'Other Business',
] as const

export type IndustryCategory = typeof INDUSTRY_CATEGORIES[number]

// ─────────────────────────────────────────────────────────────
// KEYWORD → INDUSTRY MAPPING (80+ patterns)
// ─────────────────────────────────────────────────────────────

type KeywordMap = {
  keywords: string[]
  industry: IndustryCategory
  weight:   number   // Higher = more confident match
}

const INDUSTRY_KEYWORD_MAP: KeywordMap[] = [
  // Real Estate & Property
  {
    keywords: ['realty', 'real estate', 'property', 'properties', 'homes', 'housing', 'estate', 'land', 'lettings', 'letting', 'landlord', 'realtor', 'mortgage', 'shelter', 'haven', 'residences', 'apartments', 'flat'],
    industry: 'Real Estate & Property', weight: 10,
  },
  // Food & Restaurants
  {
    keywords: ['restaurant', 'eatery', 'kitchen', 'food', 'catering', 'chef', 'grill', 'suya', 'buka', 'canteen', 'bakery', 'pastry', 'cake', 'lounge', 'diner', 'bite', 'cuisine', 'delicacy', 'jollof', 'shawarma', 'pizza', 'burger', 'meals', 'lunch', 'dinner', 'brunch', 'snacks', 'tasty', 'yummy', 'delicious', 'takeout', 'delivery food', 'eat'],
    industry: 'Food & Restaurants', weight: 10,
  },
  // Healthcare & Clinics
  {
    keywords: ['clinic', 'hospital', 'health', 'medical', 'pharmacy', 'pharma', 'dental', 'dentist', 'doctor', 'dr.', 'nursing', 'nurse', 'therapy', 'therapist', 'optician', 'optometry', 'lab', 'laboratory', 'diagnostic', 'wellness center', 'care center', 'healthcare', 'medicals', 'physiotherapy'],
    industry: 'Healthcare & Clinics', weight: 10,
  },
  // Fashion & Beauty
  {
    keywords: ['fashion', 'beauty', 'salon', 'spa', 'boutique', 'clothing', 'clothes', 'wear', 'apparel', 'style', 'makeup', 'cosmetics', 'hair', 'braid', 'lash', 'nails', 'skincare', 'skin', 'glow', 'glam', 'couture', 'tailor', 'tailoring', 'sewing', 'fabrics', 'threads', 'drip', 'collection', 'designs'],
    industry: 'Fashion & Beauty', weight: 10,
  },
  // Education & Training
  {
    keywords: ['school', 'academy', 'institute', 'college', 'university', 'training', 'coaching', 'tutoring', 'tutor', 'learn', 'learning', 'education', 'educational', 'mentor', 'mentorship', 'class', 'classes', 'course', 'courses', 'skill', 'skills', 'bootcamp', 'workshop'],
    industry: 'Education & Training', weight: 10,
  },
  // Financial Services & Fintech
  {
    keywords: ['finance', 'financial', 'fintech', 'investment', 'invest', 'bank', 'banking', 'loan', 'loans', 'credit', 'insurance', 'microfinance', 'savings', 'fund', 'capital', 'forex', 'trading', 'stocks', 'wealth', 'money', 'asset', 'accounting', 'tax', 'audit'],
    industry: 'Financial Services & Fintech', weight: 10,
  },
  // E-Commerce & Retail
  {
    keywords: ['store', 'shop', 'market', 'marketplace', 'retail', 'trade', 'trading', 'merchant', 'ecommerce', 'online store', 'supplies', 'supply', 'distributor', 'distribution', 'wholesale', 'deals', 'gadgets', 'electronics', 'phones', 'accessories', 'gifts'],
    industry: 'E-Commerce & Retail', weight: 8,
  },
  // Professional Services
  {
    keywords: ['law', 'legal', 'solicitor', 'barrister', 'advocate', 'chambers', 'consulting', 'consultancy', 'advisory', 'advisor', 'management', 'strategy', 'audit', 'auditors', 'chartered', 'associates', 'partners', 'partnership', 'professional'],
    industry: 'Professional Services', weight: 9,
  },
  // Technology & Digital Services
  {
    keywords: ['tech', 'technology', 'digital', 'software', 'app', 'web', 'website', 'it services', 'it solutions', 'coding', 'developer', 'development', 'ai', 'data', 'cloud', 'cyber', 'security', 'saas', 'solutions', 'systems', 'network', 'ict'],
    industry: 'Technology & Digital Services', weight: 10,
  },
  // Events & Entertainment
  {
    keywords: ['events', 'event', 'entertainment', 'party', 'wedding', 'decorator', 'decoration', 'planner', 'planning', 'venue', 'mc', 'dj', 'photography', 'photographer', 'videography', 'videographer', 'music', 'band', 'concert', 'show', 'production', 'media production', 'coverage'],
    industry: 'Events & Entertainment', weight: 10,
  },
  // Logistics & Transportation
  {
    keywords: ['logistics', 'delivery', 'dispatch', 'courier', 'shipping', 'haulage', 'freight', 'transport', 'transportation', 'express', 'cargo', 'fleet', 'movers', 'moving', 'errand', 'sendme', 'pickme'],
    industry: 'Logistics & Transportation', weight: 10,
  },
  // Agriculture & Food Production
  {
    keywords: ['farm', 'farming', 'agro', 'agriculture', 'agric', 'harvest', 'crop', 'poultry', 'fish', 'fishery', 'livestock', 'cattle', 'dairy', 'organic', 'produce', 'agribusiness', 'plantation'],
    industry: 'Agriculture & Food Production', weight: 10,
  },
  // Media & Creative Services
  {
    keywords: ['media', 'creative', 'design', 'branding', 'brand', 'agency', 'marketing', 'advertising', 'content', 'studio', 'graphic', 'print', 'printing', 'publisher', 'publishing', 'blog', 'podcast', 'influencer', 'PR', 'communications'],
    industry: 'Media & Creative Services', weight: 9,
  },
  // Fitness & Wellness
  {
    keywords: ['fitness', 'gym', 'workout', 'yoga', 'pilates', 'wellness', 'nutrition', 'diet', 'weight loss', 'personal trainer', 'coach fitness', 'health club', 'body', 'slim', 'fit', 'crossfit', 'aerobics'],
    industry: 'Fitness & Wellness', weight: 10,
  },
  // Hospitality & Tourism
  {
    keywords: ['hotel', 'hospitality', 'tourism', 'travel', 'resort', 'lodge', 'airbnb', 'shortlet', 'apartment rental', 'vacation', 'tour', 'tourist', 'guest house', 'inn', 'suites', 'accommodation'],
    industry: 'Hospitality & Tourism', weight: 10,
  },
  // Construction & Interior Design
  {
    keywords: ['construction', 'building', 'builders', 'contractor', 'architecture', 'architect', 'interior', 'design', 'renovations', 'renovation', 'remodeling', 'furnishing', 'furniture', 'flooring', 'roofing', 'plumbing', 'electrical', 'fit out', 'fitout'],
    industry: 'Construction & Interior Design', weight: 10,
  },
  // Automobile & Transport
  {
    keywords: ['auto', 'automobile', 'car', 'cars', 'vehicle', 'motors', 'motor', 'garage', 'mechanic', 'auto repair', 'dealer', 'dealership', 'ride', 'cabify', 'bolt', 'uber', 'spare parts', 'tyres', 'tires', 'petrol'],
    industry: 'Automobile & Transport', weight: 10,
  },
  // Religious Organisations & NGOs
  {
    keywords: ['church', 'ministry', 'mission', 'gospel', 'christian', 'islamic', 'muslim', 'mosque', 'foundation', 'charity', 'ngo', 'nonprofit', 'non-profit', 'outreach', 'community', 'humanitarian', 'relief', 'aid'],
    industry: 'Religious Organisations & NGOs', weight: 10,
  },
  // Manufacturing & Production
  {
    keywords: ['manufacturing', 'factory', 'production', 'industrial', 'industry', 'fabrication', 'mill', 'plant', 'assembly', 'processing', 'packaging', 'bottling', 'processing plant'],
    industry: 'Manufacturing & Production', weight: 10,
  },
]

// ─────────────────────────────────────────────────────────────
// CORE DETECTION FUNCTION
// ─────────────────────────────────────────────────────────────

/**
 * Detects industry from a business name using keyword matching.
 * Returns the best match with confidence level.
 * Designed to run both client-side (for instant UX) and server-side.
 */
export function detectIndustryFromName(
  businessName: string,
): IndustryDetectionResult | null {
  if (!businessName || businessName.trim().length < 2) return null

  const name  = businessName.toLowerCase().trim()
  const words = name.split(/[\s&,.-]+/)

  let bestMatch: { industry: IndustryCategory; score: number; keyword: string } | null = null

  for (const mapping of INDUSTRY_KEYWORD_MAP) {
    for (const keyword of mapping.keywords) {
      const kw = keyword.toLowerCase()
      // Check if keyword appears in name (whole word or as part of a compound)
      if (name.includes(kw)) {
        const isExactWord = words.some((w) => w === kw || w.startsWith(kw) || kw.startsWith(w))
        const score = mapping.weight * (isExactWord ? 1.5 : 1)

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { industry: mapping.industry, score, keyword }
        }
      }
    }
  }

  if (!bestMatch) return null

  const confidence =
    bestMatch.score >= 13 ? 'high' :
    bestMatch.score >= 8  ? 'medium' : 'low'

  // Build the reasoning message shown to the user
  const kw = bestMatch.keyword
  const reasoning =
    name.includes(kw)
      ? `We spotted "${kw}" in your business name`
      : `Based on your business name`

  return {
    industry:   bestMatch.industry,
    confidence,
    reasoning,
  }
}

// ─────────────────────────────────────────────────────────────
// NIGERIAN AREA → CITY MAPPING (200+ locations)
// ─────────────────────────────────────────────────────────────

type CityMap = {
  terms:   string[]   // Area names, LGA names, nicknames
  result:  LocationResult
}

const NIGERIA_CITY_MAP: CityMap[] = [
  // ── Lagos ─────────────────────────────────────────────────
  {
    terms: ['lagos', 'lekki', 'vi', 'victoria island', 'ikoyi', 'ajah', 'sangotedo', 'festac', 'surulere', 'yaba', 'ikeja', 'maryland', 'ojodu', 'berger', 'ojota', 'ketu', 'mile 12', 'agege', 'oshodi', 'isolo', 'alimosho', 'badagry', 'ibeju-lekki', 'epe', 'ikorodu', 'amuwo', 'apapa', 'tin can', 'port tincan', 'mushin', 'orile', 'palm grove', 'anthony', 'gbagada', 'magodo', 'ojuelegba', 'bode thomas', 'costain', 'dolphin estate', 'jibowu', 'oyingbo', 'eric moore', 'sabo', 'iju', 'agbado', 'egbeda', 'idimu', 'igando', 'jakande', 'oke-afa', 'ipaja'],
    result: { display: 'Lagos, Nigeria', city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', state: 'Lagos State' },
  },
  // ── Abuja ─────────────────────────────────────────────────
  {
    terms: ['abuja', 'fct', 'maitama', 'asokoro', 'garki', 'wuse', 'central area', 'gwarinpa', 'jabi', 'utako', 'wuse 2', 'wuse2', 'life camp', 'life-camp', 'lugbe', 'kubwa', 'bwari', 'gwagwa', 'kuje', 'area 1', 'area 2', 'area 3', 'area 11', 'cadastral', 'durumi', 'gudu', 'lokogoma', 'apo', 'galadimawa', 'dawaki', 'nbora', 'pyakasa', 'tundun wada', 'wumba', 'deidei', 'jiwa'],
    result: { display: 'Abuja, Nigeria', city: 'Abuja', country: 'Nigeria', flag: '🇳🇬', state: 'FCT' },
  },
  // ── Port Harcourt ──────────────────────────────────────────
  {
    terms: ['port harcourt', 'ph', 'p.h', 'phc', 'trans-amadi', 'trans amadi', 'gra ph', 'rumuola', 'rumuigbo', 'rumuokoro', 'rumuodumaya', 'eliozu', 'obio akpor', 'ikwerre', 'oyigbo', 'rumuche', 'agip estate', 'old gra', 'new gra', 'd-line', 'dline', 'mile 1', 'mile 2', 'mile 3', 'mile 4', 'air force base ph', 'choba', 'alakahia', 'rumuosi'],
    result: { display: 'Port Harcourt, Nigeria', city: 'Port Harcourt', country: 'Nigeria', flag: '🇳🇬', state: 'Rivers State' },
  },
  // ── Kano ──────────────────────────────────────────────────
  {
    terms: ['kano', 'nassarawa kano', 'fagge', 'gwale', 'ungogo', 'bompai', 'sabon gari kano', 'dawanau', 'kofar mata', 'naibawa', 'challawa', 'shanono'],
    result: { display: 'Kano, Nigeria', city: 'Kano', country: 'Nigeria', flag: '🇳🇬', state: 'Kano State' },
  },
  // ── Ibadan ────────────────────────────────────────────────
  {
    terms: ['ibadan', 'bodija', 'oluyole', 'iyaganku', 'agodi', 'mokola', 'ring road ibadan', 'challenge', 'dugbe', 'oke-ado', 'sango ibadan', 'ojoo', 'apata ibadan', 'ojuiwi', 'iwo road'],
    result: { display: 'Ibadan, Nigeria', city: 'Ibadan', country: 'Nigeria', flag: '🇳🇬', state: 'Oyo State' },
  },
  // ── Enugu ─────────────────────────────────────────────────
  {
    terms: ['enugu', 'independence layout', 'gra enugu', 'new haven', 'trans ekulu', 'ogui', 'coal camp', 'uwani', 'emene', 'abakpa', 'gariki enugu'],
    result: { display: 'Enugu, Nigeria', city: 'Enugu', country: 'Nigeria', flag: '🇳🇬', state: 'Enugu State' },
  },
  // ── Benin City ────────────────────────────────────────────
  {
    terms: ['benin city', 'benin', 'gra benin', 'ekenwan', 'ugbowo', 'oba market', 'ring road benin', 'akpakpava'],
    result: { display: 'Benin City, Nigeria', city: 'Benin City', country: 'Nigeria', flag: '🇳🇬', state: 'Edo State' },
  },
  // ── Kaduna ────────────────────────────────────────────────
  {
    terms: ['kaduna', 'barnawa', 'malali', 'unguwan rimi', 'rigasa', 'tudun wada kaduna', 'television'],
    result: { display: 'Kaduna, Nigeria', city: 'Kaduna', country: 'Nigeria', flag: '🇳🇬', state: 'Kaduna State' },
  },
  // ── Onitsha ───────────────────────────────────────────────
  {
    terms: ['onitsha', 'fegge', 'woliwo', 'bridgehead'],
    result: { display: 'Onitsha, Nigeria', city: 'Onitsha', country: 'Nigeria', flag: '🇳🇬', state: 'Anambra State' },
  },
  // ── Aba ───────────────────────────────────────────────────
  {
    terms: ['aba', 'ariaria', 'ogbor hill', 'osisioma'],
    result: { display: 'Aba, Nigeria', city: 'Aba', country: 'Nigeria', flag: '🇳🇬', state: 'Abia State' },
  },
  // ── Warri ─────────────────────────────────────────────────
  {
    terms: ['warri', 'effurun', 'uvwie', 'ptdi', 'airport road warri'],
    result: { display: 'Warri, Nigeria', city: 'Warri', country: 'Nigeria', flag: '🇳🇬', state: 'Delta State' },
  },
  // ── Asaba ─────────────────────────────────────────────────
  {
    terms: ['asaba', 'okpanam', 'ugbolu', 'cable point'],
    result: { display: 'Asaba, Nigeria', city: 'Asaba', country: 'Nigeria', flag: '🇳🇬', state: 'Delta State' },
  },
  // ── Uyo ───────────────────────────────────────────────────
  {
    terms: ['uyo', 'ewet housing', 'itam', 'ibom'],
    result: { display: 'Uyo, Nigeria', city: 'Uyo', country: 'Nigeria', flag: '🇳🇬', state: 'Akwa Ibom State' },
  },
  // ── Calabar ───────────────────────────────────────────────
  {
    terms: ['calabar', 'ikot', 'watt market', 'state housing calabar'],
    result: { display: 'Calabar, Nigeria', city: 'Calabar', country: 'Nigeria', flag: '🇳🇬', state: 'Cross River State' },
  },
  // ── Owerri ────────────────────────────────────────────────
  {
    terms: ['owerri', 'new owerri', 'world bank owerri', 'uratta'],
    result: { display: 'Owerri, Nigeria', city: 'Owerri', country: 'Nigeria', flag: '🇳🇬', state: 'Imo State' },
  },
  // ── Abeokuta ──────────────────────────────────────────────
  {
    terms: ['abeokuta', 'kemta', 'oke-lantoro', 'panseke'],
    result: { display: 'Abeokuta, Nigeria', city: 'Abeokuta', country: 'Nigeria', flag: '🇳🇬', state: 'Ogun State' },
  },
  // ── Ilorin ────────────────────────────────────────────────
  {
    terms: ['ilorin', 'gra ilorin', 'tanke', 'basin road', 'adewole'],
    result: { display: 'Ilorin, Nigeria', city: 'Ilorin', country: 'Nigeria', flag: '🇳🇬', state: 'Kwara State' },
  },
  // ── Jos ───────────────────────────────────────────────────
  {
    terms: ['jos', 'rayfield', 'anglo jos', 'bukuru'],
    result: { display: 'Jos, Nigeria', city: 'Jos', country: 'Nigeria', flag: '🇳🇬', state: 'Plateau State' },
  },
  // ── Maiduguri ─────────────────────────────────────────────
  {
    terms: ['maiduguri', 'gwange', 'bolori', 'lamisula'],
    result: { display: 'Maiduguri, Nigeria', city: 'Maiduguri', country: 'Nigeria', flag: '🇳🇬', state: 'Borno State' },
  },
  // ── Akure ─────────────────────────────────────────────────
  {
    terms: ['akure', 'futa road', 'oke-ijebu'],
    result: { display: 'Akure, Nigeria', city: 'Akure', country: 'Nigeria', flag: '🇳🇬', state: 'Ondo State' },
  },
  // ── Sokoto ────────────────────────────────────────────────
  {
    terms: ['sokoto', 'gawon nama', 'sama road'],
    result: { display: 'Sokoto, Nigeria', city: 'Sokoto', country: 'Nigeria', flag: '🇳🇬', state: 'Sokoto State' },
  },
  // ── Other major Nigerian cities ───────────────────────────
  { terms: ['nnewi'],      result: { display: 'Nnewi, Nigeria',    city: 'Nnewi',      country: 'Nigeria', flag: '🇳🇬', state: 'Anambra State' }},
  { terms: ['minna'],      result: { display: 'Minna, Nigeria',    city: 'Minna',      country: 'Nigeria', flag: '🇳🇬', state: 'Niger State' }},
  { terms: ['lafia'],      result: { display: 'Lafia, Nigeria',    city: 'Lafia',      country: 'Nigeria', flag: '🇳🇬', state: 'Nasarawa State' }},
  { terms: ['makurdi'],    result: { display: 'Makurdi, Nigeria',  city: 'Makurdi',    country: 'Nigeria', flag: '🇳🇬', state: 'Benue State' }},
  { terms: ['bauchi'],     result: { display: 'Bauchi, Nigeria',   city: 'Bauchi',     country: 'Nigeria', flag: '🇳🇬', state: 'Bauchi State' }},
  { terms: ['yola'],       result: { display: 'Yola, Nigeria',     city: 'Yola',       country: 'Nigeria', flag: '🇳🇬', state: 'Adamawa State' }},
  { terms: ['gombe'],      result: { display: 'Gombe, Nigeria',    city: 'Gombe',      country: 'Nigeria', flag: '🇳🇬', state: 'Gombe State' }},
  { terms: ['dutse'],      result: { display: 'Dutse, Nigeria',    city: 'Dutse',      country: 'Nigeria', flag: '🇳🇬', state: 'Jigawa State' }},
  { terms: ['damaturu'],   result: { display: 'Damaturu, Nigeria', city: 'Damaturu',   country: 'Nigeria', flag: '🇳🇬', state: 'Yobe State' }},
  // ── Pan-African cities ────────────────────────────────────
  { terms: ['accra', 'tema', 'kumasi', 'tamale', 'takoradi'], result: { display: 'Accra, Ghana', city: 'Accra', country: 'Ghana', flag: '🇬🇭' }},
  { terms: ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret'], result: { display: 'Nairobi, Kenya', city: 'Nairobi', country: 'Kenya', flag: '🇰🇪' }},
  { terms: ['johannesburg', 'joburg', 'jozi', 'sandton', 'soweto', 'cape town', 'durban', 'pretoria', 'tshwane'], result: { display: 'Johannesburg, South Africa', city: 'Johannesburg', country: 'South Africa', flag: '🇿🇦' }},
  { terms: ['cape town', 'v&a waterfront', 'stellenbosch'], result: { display: 'Cape Town, South Africa', city: 'Cape Town', country: 'South Africa', flag: '🇿🇦' }},
  { terms: ['dar es salaam', 'dodoma', 'mwanza', 'arusha', 'zanzibar'], result: { display: 'Dar es Salaam, Tanzania', city: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿' }},
  { terms: ['kampala', 'entebbe', 'jinja', 'gulu'], result: { display: 'Kampala, Uganda', city: 'Kampala', country: 'Uganda', flag: '🇺🇬' }},
  { terms: ['dakar', 'saint-louis senegal', 'thies'], result: { display: 'Dakar, Senegal', city: 'Dakar', country: 'Senegal', flag: '🇸🇳' }},
  { terms: ['douala', 'yaounde', 'yaoundé'], result: { display: 'Douala, Cameroon', city: 'Douala', country: 'Cameroon', flag: '🇨🇲' }},
  { terms: ['addis ababa', 'addis'], result: { display: 'Addis Ababa, Ethiopia', city: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹' }},
  { terms: ['cairo', 'alexandria egypt', 'giza'], result: { display: 'Cairo, Egypt', city: 'Cairo', country: 'Egypt', flag: '🇪🇬' }},
  { terms: ['casablanca', 'rabat', 'marrakesh', 'fez'], result: { display: 'Casablanca, Morocco', city: 'Casablanca', country: 'Morocco', flag: '🇲🇦' }},
  { terms: ['london', 'manchester', 'birmingham', 'uk'], result: { display: 'London, UK', city: 'London', country: 'United Kingdom', flag: '🇬🇧' }},
  { terms: ['houston', 'new york', 'maryland usa', 'atlanta', 'dallas', 'usa'], result: { display: 'Houston, USA', city: 'Houston', country: 'United States', flag: '🇺🇸' }},
]

/**
 * Maps a city input (area name, LGA, shorthand) to a structured LocationResult.
 * Handles "Lekki" → Lagos, "Maitama" → Abuja, etc.
 */
export function mapLocationToCity(input: string): LocationResult | null {
  if (!input || input.trim().length < 2) return null
  const q = input.toLowerCase().trim()

  for (const mapping of NIGERIA_CITY_MAP) {
    if (mapping.terms.some((t) => q.includes(t) || t.includes(q))) {
      return mapping.result
    }
  }
  return null
}

/**
 * Autocomplete suggestions for city input.
 * Returns up to 8 matches for displaying in a dropdown.
 */
export function getCityAutocomplete(input: string): LocationResult[] {
  if (!input || input.trim().length < 1) return []
  const q = input.toLowerCase().trim()
  const seen = new Set<string>()
  const results: LocationResult[] = []

  for (const mapping of NIGERIA_CITY_MAP) {
    if (results.length >= 8) break
    const matches = mapping.terms.some((t) => t.startsWith(q) || t.includes(q))
    if (matches && !seen.has(mapping.result.city)) {
      seen.add(mapping.result.city)
      results.push(mapping.result)
    }
  }
  return results
}

/**
 * Returns pricing range options relevant to an industry.
 * Used in Step 3 of onboarding.
 */
export function getIndustryPriceRanges(industry: IndustryCategory): string[] {
  const ranges: Record<string, string[]> = {
    'Real Estate & Property':         ['₦500k–₦5M', '₦5M–₦50M', '₦50M–₦200M', '₦200M+'],
    'Food & Restaurants':             ['Under ₦5,000/head', '₦5,000–₦15,000/head', '₦15,000–₦50,000/head', '₦50,000+/event'],
    'Healthcare & Clinics':           ['₦2,000–₦15,000/visit', '₦15,000–₦50,000/procedure', '₦50,000–₦500,000/procedure', '₦500,000+'],
    'Fashion & Beauty':               ['Under ₦10,000', '₦10,000–₦50,000', '₦50,000–₦200,000', '₦200,000+'],
    'Education & Training':           ['Under ₦20,000', '₦20,000–₦100,000', '₦100,000–₦500,000', '₦500,000+'],
    'Financial Services & Fintech':   ['₦10,000–₦50,000/month', '₦50,000–₦200,000/month', '₦200,000+/month'],
    'E-Commerce & Retail':            ['Under ₦5,000', '₦5,000–₦30,000', '₦30,000–₦100,000', '₦100,000+'],
    'Professional Services':          ['₦50,000–₦200,000', '₦200,000–₦1M', '₦1M–₦5M', '₦5M+'],
    'Technology & Digital Services':  ['₦50,000–₦300,000', '₦300,000–₦1M', '₦1M–₦5M', '₦5M+'],
    'Events & Entertainment':         ['₦50,000–₦200,000/event', '₦200,000–₦1M/event', '₦1M–₦5M/event', '₦5M+/event'],
    'Logistics & Transportation':     ['₦1,000–₦10,000/delivery', '₦10,000–₦50,000', '₦50,000–₦200,000', '₦200,000+'],
    'Hospitality & Tourism':          ['₦10,000–₦50,000/night', '₦50,000–₦200,000/night', '₦200,000+/night'],
    'Construction & Interior Design': ['₦500,000–₦5M', '₦5M–₦20M', '₦20M–₦100M', '₦100M+'],
    'Automobile & Transport':         ['₦5M–₦15M', '₦15M–₦50M', '₦50M+', 'Services: ₦5,000–₦50,000'],
    'Fitness & Wellness':             ['₦10,000–₦30,000/month', '₦30,000–₦100,000/month', '₦100,000+/month'],
    'Agriculture & Food Production':  ['Under ₦500,000', '₦500,000–₦5M', '₦5M–₦20M', '₦20M+'],
    'Manufacturing & Production':     ['₦1M–₦10M', '₦10M–₦100M', '₦100M+'],
    'Media & Creative Services':      ['₦20,000–₦100,000', '₦100,000–₦500,000', '₦500,000–₦2M', '₦2M+'],
  }
  return ranges[industry] ?? ['Under ₦50,000', '₦50,000–₦200,000', '₦200,000–₦1M', '₦1M+']
}
