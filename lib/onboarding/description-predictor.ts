// ═══════════════════════════════════════════════════════════════
// /lib/onboarding/description-predictor.ts
// Generates pre-written description and target customer suggestions
// tailored to each industry + city combination.
// ═══════════════════════════════════════════════════════════════

import type { IndustryCategory } from './business-intelligence'

// ─────────────────────────────────────────────────────────────
// DESCRIPTION TEMPLATES (one per industry, Nigerian context)
// ─────────────────────────────────────────────────────────────

type Template = {
  description:    (name: string, city: string) => string
  targetCustomer: (city: string) => string
  uniqueAdvantage: string
  painPointSolved: string
}

const INDUSTRY_TEMPLATES: Record<IndustryCategory, Template> = {
  'Real Estate & Property': {
    description:    (name, city) =>
      `${name} is a real estate firm based in ${city} that helps individuals and families find, buy, rent, and manage quality properties. We specialise in residential and commercial listings that match our clients' lifestyles and investment goals.`,
    targetCustomer: (city) =>
      `Working professionals and investors in ${city} aged 28–50 who want to own property or secure a quality rental without the stress of dealing with dishonest agents`,
    uniqueAdvantage: 'We verify every property listing before advertising and accompany every client to site inspections — no surprises.',
    painPointSolved: 'Finding trustworthy property agents and verified listings in a market full of fraud',
  },
  'Food & Restaurants': {
    description:    (name, city) =>
      `${name} is a food business based in ${city} offering freshly prepared meals and catering services. We combine authentic Nigerian flavours with consistent quality to deliver memorable dining experiences — whether dine-in, delivery, or large-scale events.`,
    targetCustomer: (city) =>
      `Busy professionals and families in ${city} who love good Nigerian food but don't always have time to cook, and event planners who need reliable large-scale catering`,
    uniqueAdvantage: 'All our ingredients are sourced fresh daily from local markets — no frozen or pre-cooked shortcuts.',
    painPointSolved: 'Inconsistent food quality and unreliable delivery from other restaurants and caterers',
  },
  'Healthcare & Clinics': {
    description:    (name, city) =>
      `${name} is a healthcare facility in ${city} providing quality medical consultations, diagnostics, and treatment to individuals and families. Our qualified medical team delivers compassionate, professional care in a clean and welcoming environment.`,
    targetCustomer: (city) =>
      `Families and individuals in ${city} who want accessible, affordable healthcare from qualified doctors without the long waits and impersonal treatment of government hospitals`,
    uniqueAdvantage: 'Our patients are seen within 30 minutes of arrival and receive follow-up calls after every visit.',
    painPointSolved: 'Long wait times, misdiagnosis, and poor patient experience at public and some private facilities',
  },
  'Fashion & Beauty': {
    description:    (name, city) =>
      `${name} is a fashion and beauty brand based in ${city} that helps clients look and feel their best through quality clothing, styling, and beauty services. We combine contemporary aesthetics with African identity to create looks that turn heads.`,
    targetCustomer: (city) =>
      `Style-conscious women and men in ${city} aged 20–40 who want to look professionally put-together and stylish without spending hours shopping or sitting in a salon`,
    uniqueAdvantage: 'We offer same-day alterations on all purchases and a 48-hour turnaround on custom orders.',
    painPointSolved: 'Finding quality fashion and beauty services that understand the Nigerian aesthetic without breaking the bank',
  },
  'Education & Training': {
    description:    (name, city) =>
      `${name} is an education and training organisation in ${city} that equips students and professionals with in-demand skills through structured courses, mentorship, and hands-on learning. We are committed to producing graduates who can immediately apply what they learn.`,
    targetCustomer: (city) =>
      `Students, young professionals, and career changers in ${city} aged 18–35 who want to acquire marketable skills and advance their careers without leaving their current job`,
    uniqueAdvantage: 'Every student gets a dedicated mentor and 3 months of job placement support after completing any programme.',
    painPointSolved: 'Acquiring practical, relevant skills in a market where most training is theoretical and outdated',
  },
  'Financial Services & Fintech': {
    description:    (name, city) =>
      `${name} is a financial services firm in ${city} providing accessible investment, loans, insurance, and wealth management solutions to individuals and SMEs. We make financial tools that were once only available to the elite accessible to every working Nigerian.`,
    targetCustomer: (city) =>
      `Entrepreneurs and working professionals in ${city} aged 25–50 who want to grow their money, secure insurance, or access business funding without complex paperwork or unfavourable terms`,
    uniqueAdvantage: 'Loan approvals in under 24 hours with minimal documentation and no hidden charges.',
    painPointSolved: 'Accessing fair financial services without predatory interest rates or excessive bureaucracy',
  },
  'E-Commerce & Retail': {
    description:    (name, city) =>
      `${name} is a retail business based in ${city} selling quality products online and in-store. We offer a curated selection of [products] with fast delivery and an easy return policy that makes shopping stress-free for our customers.`,
    targetCustomer: (city) =>
      `Online shoppers in ${city} and nationwide who want to buy quality products at fair prices with the confidence that they'll get exactly what they ordered`,
    uniqueAdvantage: 'Every product we sell is quality-checked and comes with a 7-day return guarantee — no questions asked.',
    painPointSolved: 'Receiving substandard or completely different products after paying online',
  },
  'Professional Services': {
    description:    (name, city) =>
      `${name} is a professional services firm in ${city} providing expert legal, consulting, and advisory services to businesses and individuals. Our team of experienced professionals helps clients navigate complex challenges and make informed decisions.`,
    targetCustomer: (city) =>
      `Business owners and executives in ${city} who need expert guidance on legal, financial, or strategic matters but want practical advice that protects their business interests`,
    uniqueAdvantage: 'We provide honest, conflict-free advice and keep our clients informed throughout every engagement — no jargon, no surprises.',
    painPointSolved: 'Navigating complex professional challenges without access to affordable, trustworthy expert advice',
  },
  'Technology & Digital Services': {
    description:    (name, city) =>
      `${name} is a technology company in ${city} building digital products and providing IT services that help businesses work smarter and grow faster. From websites and apps to automation and digital marketing, we turn technology into a competitive advantage for our clients.`,
    targetCustomer: (city) =>
      `Business owners and executives in ${city} who want to modernise their operations, build a strong digital presence, and automate manual processes without becoming a tech expert themselves`,
    uniqueAdvantage: 'We build solutions, then we train your team and support you for 3 months after launch at no extra cost.',
    painPointSolved: 'Being left with a website or software that breaks and a vendor who disappears after payment',
  },
  'Events & Entertainment': {
    description:    (name, city) =>
      `${name} is an events and entertainment company in ${city} creating memorable experiences for corporate events, weddings, parties, and social gatherings. From concept to execution, we handle every detail so our clients can enjoy their event without stress.`,
    targetCustomer: (city) =>
      `Individuals and corporate organisations in ${city} planning events who want a reliable, creative team that delivers exactly what was promised without cutting corners on quality`,
    uniqueAdvantage: 'We guarantee delivery or we refund 50% of our fee — every event is covered by our satisfaction promise.',
    painPointSolved: 'Event vendors who take deposits and underdeliver, leaving clients embarrassed in front of their guests',
  },
  'Logistics & Transportation': {
    description:    (name, city) =>
      `${name} is a logistics and delivery company in ${city} providing fast, reliable, and tracked delivery services for businesses and individuals. We move packages, goods, and documents safely and on time — every time.`,
    targetCustomer: (city) =>
      `E-commerce businesses and busy individuals in ${city} who need a delivery service they can trust to handle their packages professionally and deliver on schedule`,
    uniqueAdvantage: 'Real-time tracking on every delivery and a compensation policy if items are damaged or delayed.',
    painPointSolved: 'Unreliable delivery services that lose or damage goods and provide no accountability',
  },
  'Agriculture & Food Production': {
    description:    (name, city) =>
      `${name} is an agribusiness based in ${city} producing and supplying fresh, quality agricultural products to retailers, wholesalers, restaurants, and individual buyers. We use modern farming techniques to deliver consistent quality throughout the year.`,
    targetCustomer: (city) =>
      `Retailers, restaurants, and bulk buyers in ${city} and nationwide who need a reliable supplier of fresh agricultural produce at competitive prices`,
    uniqueAdvantage: 'We supply directly from farm to buyer — no middlemen, which means fresher produce at lower prices.',
    painPointSolved: 'Inconsistent supply, poor quality produce, and inflated prices from multiple middlemen',
  },
  'Media & Creative Services': {
    description:    (name, city) =>
      `${name} is a creative agency in ${city} helping businesses build powerful brands, create compelling content, and communicate effectively with their target audience. We combine strategic thinking with creative execution to produce work that gets results.`,
    targetCustomer: (city) =>
      `Business owners and marketing managers in ${city} who need consistent, high-quality creative output but don't have the budget for a full in-house creative team`,
    uniqueAdvantage: 'We don\'t just deliver creative work — we provide the strategy behind it, so every piece serves a business goal.',
    painPointSolved: 'Spending money on generic-looking creative that does not differentiate the brand or drive any measurable results',
  },
  'Fitness & Wellness': {
    description:    (name, city) =>
      `${name} is a fitness and wellness centre in ${city} helping individuals achieve their health goals through personalised training, nutrition guidance, and wellness programmes. We believe fitness is for everyone, and we create a supportive environment that gets results.`,
    targetCustomer: (city) =>
      `Working professionals in ${city} aged 25–45 who want to lose weight, build strength, and improve their energy levels but struggle with consistency and accountability`,
    uniqueAdvantage: 'Every member gets a personalised 30-day programme and weekly check-ins with their assigned trainer.',
    painPointSolved: 'Starting a fitness journey and quitting after 2 weeks because there is no accountability or real-time guidance',
  },
  'Hospitality & Tourism': {
    description:    (name, city) =>
      `${name} is a hospitality business in ${city} providing comfortable, well-equipped accommodations and exceptional service to travellers, business visitors, and holidaymakers. We create a home-away-from-home experience that our guests remember and return to.`,
    targetCustomer: (city) =>
      `Business travellers, tourists, and couples in ${city} who want comfortable, clean, and well-located accommodation with the personal touch they don't get from large hotel chains`,
    uniqueAdvantage: 'Personalised check-in experience and complimentary local area guide for every guest — plus flexible checkout.',
    painPointSolved: 'Impersonal service, dirty rooms, and poor value for money from standard hotel chains',
  },
  'Construction & Interior Design': {
    description:    (name, city) =>
      `${name} is a construction and interior design firm in ${city} transforming spaces into beautiful, functional environments for residential and commercial clients. We handle everything from architectural design to final furnishing with uncompromising attention to detail.`,
    targetCustomer: (city) =>
      `Homeowners, property developers, and business owners in ${city} who want their space to reflect quality and taste, and need a team that delivers on budget without cutting corners`,
    uniqueAdvantage: 'We provide a fixed-price guarantee before work begins — no surprise invoices at the end of the project.',
    painPointSolved: 'Construction projects that go over budget, over time, and deliver substandard workmanship',
  },
  'Automobile & Transport': {
    description:    (name, city) =>
      `${name} is an automotive business in ${city} providing quality vehicles, genuine spare parts, and professional servicing for Nigerian car owners and fleet operators. We help our clients keep their vehicles in peak condition with honest advice and quality workmanship.`,
    targetCustomer: (city) =>
      `Car owners and fleet operators in ${city} who want a trustworthy mechanic or dealer they can rely on for honest diagnosis, fair pricing, and quality parts`,
    uniqueAdvantage: 'We provide a written diagnosis before any work begins and a 3-month warranty on all mechanical repairs.',
    painPointSolved: 'Being overcharged for repairs that were never needed, or receiving fake parts from unscrupulous mechanics',
  },
  'Religious Organisations & NGOs': {
    description:    (name, city) =>
      `${name} is a faith-based/non-profit organisation in ${city} dedicated to community transformation through spiritual growth, social intervention, and empowerment programmes. We serve our community with integrity, compassion, and measurable impact.`,
    targetCustomer: (city) =>
      `Members of the community in ${city} who are seeking spiritual growth, community support, or access to educational and empowerment resources`,
    uniqueAdvantage: 'Every programme we run publishes a full impact report — we are committed to transparency and accountability in all our operations.',
    painPointSolved: 'Finding a trustworthy faith community or NGO that is genuinely committed to impact rather than self-promotion',
  },
  'Manufacturing & Production': {
    description:    (name, city) =>
      `${name} is a manufacturing company in ${city} producing quality goods for wholesale buyers, retailers, and end consumers. We combine modern production techniques with strict quality control to deliver consistent products that meet international standards.`,
    targetCustomer: (city) =>
      `Retailers, distributors, and corporate buyers in ${city} and nationally who need a reliable manufacturing partner with consistent quality and dependable supply`,
    uniqueAdvantage: 'ISO-aligned quality control at every production stage with full traceability from raw material to finished product.',
    painPointSolved: 'Receiving inconsistent product quality or supply disruptions from unreliable manufacturers',
  },
  'Other Business': {
    description:    (name, city) =>
      `${name} is a business based in ${city} providing quality products and services to individuals and corporate clients. We are committed to delivering exceptional value, building lasting relationships, and growing with our customers.`,
    targetCustomer: (city) =>
      `Individuals and businesses in ${city} who need a reliable, professional service provider they can trust to deliver on their promises`,
    uniqueAdvantage: 'We are easy to reach, quick to respond, and we do exactly what we say we will do — every time.',
    painPointSolved: 'Unreliable service providers who overpromise and underdeliver',
  },
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

/**
 * Returns a complete description suggestion based on industry, city, and business name.
 */
export function getDescriptionSuggestion(
  industry:     IndustryCategory | null,
  city:         string,
  businessName: string,
): string {
  if (!industry) return ''
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES['Other Business']
  const displayCity = city || 'Nigeria'
  const displayName = businessName || 'Our business'
  return template.description(displayName, displayCity)
}

/**
 * Returns a target customer suggestion.
 */
export function getTargetCustomerSuggestion(
  industry: IndustryCategory | null,
  city:     string,
): string {
  if (!industry) return ''
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES['Other Business']
  return template.targetCustomer(city || 'Nigeria')
}

/**
 * Returns a unique advantage suggestion.
 */
export function getUniqueAdvantageSuggestion(industry: IndustryCategory | null): string {
  if (!industry) return ''
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES['Other Business']
  return template.uniqueAdvantage
}

/**
 * Returns a pain point suggestion.
 */
export function getPainPointSuggestion(industry: IndustryCategory | null): string {
  if (!industry) return ''
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES['Other Business']
  return template.painPointSolved
}


// ═══════════════════════════════════════════════════════════════
// /lib/onboarding/progress-messages.ts
// Personalised messages shown at each step and on the progress bar.
// ═══════════════════════════════════════════════════════════════

export interface StepMeta {
  number:     number
  title:      string
  subtitle:   string
  timeEst:    string   // "30 seconds" | "1 minute"
  icon:       string   // Emoji
}

export const ONBOARDING_STEPS: StepMeta[] = [
  {
    number: 1, title: 'Welcome',          subtitle: 'Let\'s get started',
    timeEst: '30 sec', icon: '👋',
  },
  {
    number: 2, title: 'Your Business',    subtitle: 'Tell us what you do',
    timeEst: '1 min', icon: '🏢',
  },
  {
    number: 3, title: 'Your Customers',   subtitle: 'Who do you serve?',
    timeEst: '1 min', icon: '🎯',
  },
  {
    number: 4, title: 'Brand Voice',      subtitle: 'How do you communicate?',
    timeEst: '30 sec', icon: '🎨',
  },
  {
    number: 5, title: 'Contact Details',  subtitle: 'How do people reach you?',
    timeEst: '1 min', icon: '📱',
  },
  {
    number: 6, title: 'Logo & Brand',     subtitle: 'Your visual identity',
    timeEst: '1 min', icon: '⭐',
  },
  {
    number: 7, title: 'Your Challenge',   subtitle: 'What\'s holding you back?',
    timeEst: '30 sec', icon: '🚀',
  },
]

export function getTimeRemaining(currentStep: number): string {
  const remainingSteps = ONBOARDING_STEPS.slice(currentStep - 1)
  const totalSecs = remainingSteps.reduce((acc, s) => {
    const mins = s.timeEst.includes('min') ? parseInt(s.timeEst) * 60 : 30
    return acc + mins
  }, 0)

  if (totalSecs < 60)  return `About ${totalSecs} seconds remaining`
  const mins = Math.ceil(totalSecs / 60)
  return `About ${mins} minute${mins > 1 ? 's' : ''} remaining`
}

/** Personalised encouragement message shown at top of each step */
export function getStepEncouragement(
  step:      number,
  firstName: string,
  industry?: string | null,
): string {
  const name  = firstName ? `, ${firstName}` : ''
  const biz   = industry  ? ` for ${industry} businesses` : ''

  const messages: Record<number, string> = {
    1: `Welcome${name}! Your 40 AI marketing tools are waiting.`,
    2: `Let's start with the basics${name}. The more you tell us, the better your outputs.`,
    3: `Great${name}! Now tell us who you're trying to reach${biz}.`,
    4: `Almost halfway there${name}. Your brand voice shapes every output we generate.`,
    5: `This is important${name} — your WhatsApp number becomes the CTA on all your content.`,
    6: `Final details${name}. Your logo and colours make your outputs look professional.`,
    7: `One last thing${name}. Your challenge helps us recommend the right tools.`,
  }
  return messages[step] ?? `Step ${step} of 7`
}

/** Fun fact shown between steps to keep users engaged */
export function getBetweenStepFact(step: number): string {
  const facts = [
    'Nigerian businesses that complete their full profile get 3.7x better AI outputs than incomplete profiles.',
    'The average Cerebre Plus user generates their first piece of marketing content in under 90 seconds.',
    'Businesses with a clearly defined brand voice convert 42% better than those without one.',
    'WhatsApp broadcasts have a 92% open rate in Nigeria — compared to 20% for email.',
    'Adding your WhatsApp number to all marketing content increases enquiry rates by an average of 5x.',
    '87% of Nigerian consumers check a business\'s social media before making a purchasing decision.',
  ]
  return facts[step % facts.length]
}
