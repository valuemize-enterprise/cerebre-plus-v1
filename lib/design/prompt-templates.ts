// /lib/design/prompt-templates.ts
// Builds the complete AI image generation prompt for each of the 11 design tools.
// Brand injection from buildBrandInjection() is PREPENDED to every prompt here.

import type { BrandProfile } from '@/lib/design/brand-dna'

// ─────────────────────────────────────────────────────────────
// SOCIAL POST DESIGNER
// ─────────────────────────────────────────────────────────────
export function socialPostPrompt(data: Record<string, string>, brand: BrandProfile): string {
  return `Design a professional social media post graphic.

CONTENT:
Topic: ${data.post_topic}
Key message: ${data.key_message}
Call to action: ${data.cta || 'None'}
Platform: ${data.platform}
Format: ${data.format === 'portrait' ? 'Portrait 4:5' : data.format === 'landscape' ? 'Landscape 1.91:1' : 'Square 1:1'}

DESIGN DIRECTION:
Create a clean, scroll-stopping social media graphic with strong visual hierarchy.
The headline "${data.key_message}" must be prominent and immediately readable.
Use a compelling visual background that relates to the topic.
Include clear whitespace — the design should not feel cluttered.
The call to action "${data.cta || ''}" should be clearly visible if provided.
Design style: ${data.style_override || 'modern, clean, professional'}

This is for a Nigerian ${brand.industry} business in ${brand.city}. Make it culturally resonant and visually compelling for the Nigerian market.
No stock photo watermarks. No Lorem Ipsum text. No generic placeholder text.`
}

// ─────────────────────────────────────────────────────────────
// STORY & REEL DESIGNER
// ─────────────────────────────────────────────────────────────
export function storyReelPrompt(data: Record<string, string>, brand: BrandProfile): string {
  return `Design a full-screen mobile story/reel cover graphic in 9:16 vertical format.

CONTENT:
Story type: ${data.story_type}
Main message: ${data.story_message}
Headline text: ${data.headline_text}
Call to action: ${data.cta_text || 'None'}

DESIGN DIRECTION:
Full-screen vertical composition optimised for mobile viewing.
Large, bold headline text — must be readable on a mobile screen.
Dynamic, visually engaging background that fills the entire 9:16 frame.
Bottom 20% of the image should have space for text or a safe zone.
The headline "${data.headline_text}" must be visually dominant.
Design style: ${data.style_override || 'bold, vibrant, mobile-first'}

For a Nigerian ${brand.industry} business. Make it look like premium African brand content.`
}

// ─────────────────────────────────────────────────────────────
// YOUTUBE THUMBNAIL MAKER
// ─────────────────────────────────────────────────────────────
export function youtubeThumbnailPrompt(data: Record<string, string>, brand: BrandProfile): string {
  return `Design a YouTube thumbnail in 16:9 landscape format.

CONTENT:
Video title: ${data.video_title}
Video topic: ${data.video_topic}
Overlay text: ${data.thumbnail_text || data.video_title}
Emotional hook: ${data.emotion}

DESIGN DIRECTION:
High-contrast, click-worthy YouTube thumbnail design.
Bold text overlay: "${data.thumbnail_text || data.video_title}" — must be immediately readable at small size.
Strong emotional visual that captures the hook: ${data.emotion}.
Clean composition — typically: striking visual on left/centre, text on right or overlaid.
High contrast between text and background.
Design style: ${data.style_override || 'bold, high-contrast, click-worthy'}

Nigerian ${brand.industry} content creator aesthetic. Professional but engaging.`
}

// ─────────────────────────────────────────────────────────────
// QUOTE CARD CREATOR
// ─────────────────────────────────────────────────────────────
export function quoteCardPrompt(data: Record<string, string>, brand: BrandProfile): string {
  const quoteForDisplay = `"${data.quote_text.slice(0, 200)}"`
  return `Design a quote card graphic.

CONTENT:
Quote: ${quoteForDisplay}
Attribution: ${data.attribution || brand.businessName}
Quote type: ${data.quote_type}

DESIGN DIRECTION:
Elegant, shareable quote card design.
The quote text "${data.quote_text.slice(0, 100)}..." should be the focal point.
Large, clear typography for the quote — readable at a glance.
Attribution "${data.attribution || brand.businessName}" in smaller text below.
${data.quote_type === 'testimonial' ? 'Add a subtle trust indicator — a star rating or verified badge feel.' : ''}
${data.quote_type === 'result' ? 'Make the result/number feel impactful and celebratory.' : ''}
Clean, premium design with generous whitespace.
Design style: ${data.style_override || 'elegant, clean, shareable'}

For a Nigerian ${brand.industry} brand. Quality consistent with premium Nigerian social content.`
}

// ─────────────────────────────────────────────────────────────
// PROMO CARD DESIGNER
// ─────────────────────────────────────────────────────────────
export function promoCardPrompt(data: Record<string, string>, brand: BrandProfile): string {
  return `Design a promotional product/service card graphic.

CONTENT:
Product/service: ${data.product_name}
Offer: ${data.offer}
Price: ${data.price || 'Not specified'}
Deadline: ${data.deadline || 'Limited time'}
Description: ${data.product_desc || ''}

DESIGN DIRECTION:
High-impact promotional design that creates desire and urgency.
"${data.offer}" should be visually dominant — this is the hook.
Price "${data.price || ''}" displayed clearly if provided — Nigerian Naira (₦) format.
Deadline creates urgency — make it feel time-sensitive.
Bold, action-oriented visual style.
Design style: ${data.style_override || 'bold, vibrant, sales-oriented'}

For a Nigerian ${brand.industry} business selling to Nigerian customers. Make it irresistible.`
}

// ─────────────────────────────────────────────────────────────
// CAROUSEL SLIDE MAKER  — one prompt per slide
// ─────────────────────────────────────────────────────────────
export function carouselSlidePrompt(
  data:       Record<string, string>,
  brand:      BrandProfile,
  slideNum:   number,
  slideText:  string,
  isCover:    boolean,
  isCTA:      boolean
): string {
  return `Design a single Instagram carousel slide — square 1:1 format.

SLIDE ${slideNum} CONTENT:
${slideText}
${isCover  ? 'This is the COVER SLIDE (first) — it must be the most visually striking and make people want to swipe.' : ''}
${isCTA    ? 'This is the FINAL CTA SLIDE — include a strong call to action and save/share prompt.' : ''}

DESIGN REQUIREMENTS:
Consistent with the other slides in this carousel — same brand colors, same layout framework.
Bold, readable text that works at mobile size.
Visual element that supports the slide content.
Clear visual hierarchy: title prominent, body text secondary.
Bottom-left or bottom-right should have a "Slide ${slideNum} / ${data.slide_count}" indicator subtly.
${isCover ? 'Big, attention-grabbing headline. Make them swipe.' : 'Clean content layout. Make them stay.'}

Carousel topic: ${data.carousel_topic}
Design style: ${data.style_override || 'clean, modern, scrollable'}
Nigerian ${brand.industry} brand.`
}

// ─────────────────────────────────────────────────────────────
// LINKEDIN BANNER
// ─────────────────────────────────────────────────────────────
export function linkedinBannerPrompt(data: Record<string, string>, brand: BrandProfile): string {
  return `Design a LinkedIn profile banner in 4:1 wide landscape format (1584×396).

CONTENT:
Banner type: ${data.banner_type}
Tagline: ${data.tagline}
Key services: ${data.key_services || ''}
Contact: ${data.contact_info || ''}

DESIGN DIRECTION:
Professional, wide-format banner suitable for LinkedIn.
"${data.tagline}" as the primary text — left-aligned or centre-aligned.
Services "${data.key_services}" displayed as subtle secondary text or visual elements.
Contact info "${data.contact_info}" in the bottom-right or bottom-left corner.
Clean, wide composition — no elements near the very edges (safe zone).
${data.banner_type === 'personal' ? 'Personal professional brand feel — approachable yet credible.' : 'Company brand — corporate, authoritative, trustworthy.'}
Design style: ${data.style_override || 'professional, clean, corporate'}

Nigerian ${brand.industry} professional. LinkedIn-appropriate quality.`
}

// ─────────────────────────────────────────────────────────────
// EMAIL HEADER DESIGNER
// ─────────────────────────────────────────────────────────────
export function emailHeaderPrompt(data: Record<string, string>, brand: BrandProfile): string {
  return `Design an email newsletter header in wide banner format (approximately 600px wide, 150–200px tall).

CONTENT:
Email type: ${data.email_type}
Header title: ${data.email_title}
Tagline: ${data.tagline || ''}

DESIGN DIRECTION:
Clean, wide email header banner.
"${data.email_title}" as the primary title — clearly readable.
"${data.tagline}" as subtitle text below if provided.
Horizontal composition optimised for email clients.
Professional, brand-consistent design that appears at the top of an email.
No clutter — email headers must be simple and fast-loading visually.
Design style: ${data.style_override || 'clean, minimal, professional'}

For ${brand.businessName}'s email communications. Nigerian ${brand.industry} brand.`
}

// ─────────────────────────────────────────────────────────────
// FLYER DESIGNER
// ─────────────────────────────────────────────────────────────
export function flyerPrompt(data: Record<string, string>, brand: BrandProfile): string {
  const isA4 = data.format === 'a4portrait'
  return `Design a digital promotional flyer — ${isA4 ? 'A4 portrait' : 'square'} format.

CONTENT:
Flyer type: ${data.flyer_type}
Main headline: ${data.headline}
Key details: ${data.key_details}
Contact information: ${data.contact_info || ''}

DESIGN DIRECTION:
Eye-catching, information-rich flyer design.
"${data.headline}" must be the largest, most prominent element — seen from a distance.
Key details presented clearly with visual hierarchy.
Contact info "${data.contact_info}" prominent and easy to read.
${isA4 ? 'Portrait A4 composition — information flows top to bottom.' : 'Square composition — balanced, social-media-ready.'}
Nigerian flyer aesthetic — vibrant, clear, shareable on WhatsApp.
Design style: ${data.style_override || 'bold, vibrant, information-clear'}

This flyer will be shared on WhatsApp and social media by a Nigerian ${brand.industry} business.`
}

// ─────────────────────────────────────────────────────────────
// FESTIVE BANNER DESIGNER
// ─────────────────────────────────────────────────────────────
export function festiveBannerPrompt(data: Record<string, string>, brand: BrandProfile): string {
  const seasonElements: Record<string, string> = {
    eid_sallah:     'crescent moon, star, mosque silhouette, Islamic geometric patterns, green and gold accents, warm celebratory atmosphere',
    christmas:      'subtle stars, warm golden light, festive elegance — NOT kitschy, sophisticated holiday design',
    easter:         'soft floral elements, spring warmth, dawn/sunrise light palette',
    independence:   'Nigerian green and white, eagle motif, national pride, Naija energy',
    valentine:      'hearts, warm rose tones, romantic but tasteful — not overly pink',
    black_friday:   'bold dark background, gold/electric accents, deal energy, dramatic contrast',
    detty_dec:      'vibrant party energy, confetti, Lagos nightlife aesthetic, celebratory gold',
    childrens_day:  'playful, colourful, joyful, child-friendly but still branded',
    mothers_day:    'warm, loving, elegant floral accents',
    new_year:       'fireworks silhouette, fresh start energy, gold and light',
  }
  const festiveElements = seasonElements[data.season] || 'celebratory design elements'

  return `Design a branded festive greeting card / social media graphic.

OCCASION: ${data.season.replace(/_/g, ' ')}${data.custom_occasion ? ` — specifically: ${data.custom_occasion}` : ''}
FESTIVE ELEMENTS: ${festiveElements}

CONTENT:
Greeting message: "${data.greeting_msg}"
${data.include_offer === 'yes' && data.offer_text ? `Promotional offer: "${data.offer_text}"` : ''}
Format: ${data.format === 'story' ? 'Vertical story 9:16' : data.format === 'portrait' ? 'Portrait 4:5' : 'Square 1:1'}

DESIGN DIRECTION:
Festive, celebratory design that authentically represents the ${data.season.replace(/_/g, ' ')} season.
The greeting "${data.greeting_msg}" should be prominent and warm.
${festiveElements} as secondary design elements — tasteful, not overwhelming.
Balance festive energy with brand professionalism.
${data.include_offer === 'yes' ? `Include the offer "${data.offer_text}" visually as a secondary element.` : ''}
This design will be shared across Nigerian WhatsApp groups and social media during ${data.season.replace(/_/g, ' ')}.

Make it feel genuinely Nigerian and culturally appropriate.`
}

// ─────────────────────────────────────────────────────────────
// LOGO GENERATOR — Claude SVG prompt (not image AI)
// ─────────────────────────────────────────────────────────────
export function logoSVGPrompt(data: Record<string, string>, brand: BrandProfile): string {
  return `You are a professional brand identity designer. Create a complete SVG logo for the following business.

BUSINESS BRIEF:
Business name: ${data.business_name}
Tagline: ${data.tagline || 'None'}
Industry: ${data.industry_context}
Brand personality: ${data.brand_personality || 'professional and trustworthy'}
Logo style: ${data.logo_style}
Colors: Primary ${brand.primaryColor}, Secondary ${brand.secondaryColor}
Elements to avoid: ${data.avoid_elements || 'nothing specified'}

YOUR TASK:
Generate THREE separate SVG designs in ONE response, each wrapped in <svg> tags with a preceding comment identifying it:

1. <!-- ICON MARK --> — A standalone geometric/abstract symbol (no text). The icon should work at small sizes (32px). Use ONLY ${brand.primaryColor} and ${brand.secondaryColor} as fill colors.

2. <!-- WORDMARK --> — The business name "${data.business_name}" rendered in a styled SVG typeface that matches the brand personality. Use text paths or styled text elements. Color: ${brand.primaryColor}.

3. <!-- COMBINATION MARK --> — The icon mark and wordmark composed together side by side or stacked. Both elements combined into one SVG.

REQUIREMENTS:
- Each SVG must be self-contained with viewBox="0 0 200 200" (icon) or appropriate viewBox for text
- Use ONLY ${brand.primaryColor} and ${brand.secondaryColor} plus white
- Clean, professional vector paths — no raster content
- The icon must be a genuinely designed mark, not just a letter in a circle
- Output ONLY the three SVG blocks — no markdown, no explanation text

Generate the SVGs now:`
}
