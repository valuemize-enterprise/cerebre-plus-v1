// /lib/tools/design-registry.ts
// All 11 Cerebre Plus Design Tools.
// Coin costs confirmed by Wale — Standard (DALL-E 3) and Premium (Gemini Imagen 3).

export type DesignFormat =
  | 'square'       // 1:1   — 1024×1024
  | 'portrait'     // 4:5   — 1024×1280 (cropped from 1024×1792)
  | 'landscape'    // 1.91:1 — 1792×944 (cropped from 1792×1024)
  | 'story'        // 9:16  — 1024×1792
  | 'thumbnail'    // 16:9  — 1792×1024
  | 'banner'       // 4:1   — 1792×448 (cropped from 1792×1024)
  | 'a4portrait'   // A4    — 1024×1449 (cropped from 1024×1792)
  | 'logo'         // SVG   — vector output

export interface DesignTool {
  id:              string
  name:            string
  tagline:         string
  description:     string
  icon:            string
  accentColor:     string
  coinCostStandard: number   // DALL-E 3
  coinCostPremium:  number   // Gemini Imagen 3
  formats:         DesignFormat[]
  variants:        number    // how many image variants per generation
  formBlocks:      Array<{
    key: string; label: string; type: 'text'|'textarea'|'select'|'multiselect'|'color'
    required?: boolean; placeholder?: string; options?: Array<{value:string;label:string}>
    maxLength?: number; rows?: number
  }>
  loadingMessages: string[]
  festiveSeasons?: string[]  // for Festive Banner only
}

// ── Shared form field sets ───────────────────────────────────
const PLATFORM_OPTS = [
  { value:'instagram', label:'Instagram' },
  { value:'facebook',  label:'Facebook'  },
  { value:'linkedin',  label:'LinkedIn'  },
  { value:'tiktok',    label:'TikTok'    },
  { value:'youtube',   label:'YouTube'   },
  { value:'twitter',   label:'X (Twitter)'},
  { value:'whatsapp',  label:'WhatsApp'  },
]

const STYLE_OPTS = [
  { value:'modern_clean',    label:'Modern & Clean'    },
  { value:'bold_vibrant',    label:'Bold & Vibrant'    },
  { value:'elegant_luxury',  label:'Elegant & Luxury'  },
  { value:'playful_energetic',label:'Playful & Energetic'},
  { value:'minimal_corporate',label:'Minimal & Corporate'},
  { value:'warm_earthy',     label:'Warm & Earthy'     },
  { value:'afrocentric',     label:'Afrocentric / Ankara-inspired' },
]

// ── Design Tool Definitions ──────────────────────────────────
export const DESIGN_TOOLS: DesignTool[] = [

  // ─────────────────────────────────────────────────────────
  // 1. Social Post Designer
  // ─────────────────────────────────────────────────────────
  {
    id:              'social-post-designer',
    name:            'Social Post Designer',
    tagline:         'On-brand social posts in 60 seconds.',
    description:     'Generate 2 branded social media post designs for Instagram, Facebook, or LinkedIn. Your brand colors and logo applied automatically.',
    icon:            '📱',
    accentColor:     '#E1306C',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['square','portrait','landscape'],
    variants:        2,
    formBlocks: [
      { key:'post_topic',    label:'What is this post about?',    type:'textarea', required:true, rows:3, maxLength:400, placeholder:'Describe what you want to post about — product launch, tip, promotion…' },
      { key:'key_message',   label:'The one key message',         type:'text',     required:true, maxLength:120, placeholder:'e.g. 50% off all handbags this weekend only' },
      { key:'platform',      label:'Primary platform',            type:'select',   required:true, options: PLATFORM_OPTS },
      { key:'format',        label:'Image format',                type:'select',   required:true, options: [
        { value:'square',    label:'Square 1:1 (Instagram feed)'  },
        { value:'portrait',  label:'Portrait 4:5 (Best reach)'    },
        { value:'landscape', label:'Landscape (Facebook/LinkedIn)'},
      ]},
      { key:'style_override',label:'Design style (optional)',     type:'select',   options: STYLE_OPTS },
      { key:'cta',           label:'Call to action text',         type:'text',     maxLength:60, placeholder:'e.g. DM us to order  |  Shop now  |  Call +234...' },
    ],
    loadingMessages: [
      'Reading your brand profile…',
      'Building your brand color palette…',
      'Generating Variant 1…',
      'Generating Variant 2…',
      'Applying brand overlay…',
      'Adding your logo…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. Story & Reel Designer
  // ─────────────────────────────────────────────────────────
  {
    id:              'story-reel-designer',
    name:            'Story & Reel Designer',
    tagline:         'Full-screen stories that stop the scroll.',
    description:     'Generate 2 branded 9:16 designs for Instagram Stories, WhatsApp Status, or Reel covers.',
    icon:            '📸',
    accentColor:     '#F77737',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['story'],
    variants:        2,
    formBlocks: [
      { key:'story_message', label:'What is the story about?',    type:'textarea', required:true, rows:3, maxLength:300, placeholder:'The key message for this story — product, promotion, tip…' },
      { key:'story_type',    label:'Story purpose',               type:'select',   required:true, options: [
        { value:'product_showcase', label:'Product showcase'       },
        { value:'promotion',        label:'Sale / promotion'       },
        { value:'announcement',     label:'Announcement'           },
        { value:'behind_scenes',    label:'Behind the scenes'      },
        { value:'testimonial',      label:'Customer testimonial'   },
        { value:'reel_cover',       label:'Reel cover image'       },
        { value:'wa_status',        label:'WhatsApp Status'        },
      ]},
      { key:'headline_text', label:'Main text / headline',        type:'text',     required:true, maxLength:60, placeholder:'e.g. FLASH SALE  |  New Arrival  |  50% Off Today' },
      { key:'style_override',label:'Design style (optional)',     type:'select',   options: STYLE_OPTS },
      { key:'cta_text',      label:'Call to action (optional)',   type:'text',     maxLength:50, placeholder:'e.g. Swipe up  |  DM to order  |  Visit link in bio' },
    ],
    loadingMessages: [
      'Reading your brand profile…',
      'Building 9:16 story canvas…',
      'Generating Story Variant 1…',
      'Generating Story Variant 2…',
      'Applying brand colors and logo…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. YouTube Thumbnail Maker
  // ─────────────────────────────────────────────────────────
  {
    id:              'youtube-thumbnail-maker',
    name:            'YouTube Thumbnail Maker',
    tagline:         'Thumbnails that earn the click.',
    description:     'Generate 2 branded YouTube thumbnails at 1280×720. Bold title text, compelling visual, brand colors.',
    icon:            '▶️',
    accentColor:     '#FF0000',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['thumbnail'],
    variants:        2,
    formBlocks: [
      { key:'video_title',   label:'Video title',                 type:'text',     required:true, maxLength:80, placeholder:'e.g. How I Made ₦500K in 30 Days from WhatsApp' },
      { key:'video_topic',   label:'What is the video about?',   type:'textarea', required:true, rows:2, maxLength:300 },
      { key:'emotion',       label:'Emotional hook',             type:'select',   required:true, options: [
        { value:'curiosity',   label:'Curiosity — make them wonder'  },
        { value:'shock',       label:'Shock / surprise'              },
        { value:'desire',      label:'Desire — show the result'      },
        { value:'fear_fomo',   label:'Fear / FOMO'                   },
        { value:'authority',   label:'Authority / expertise'         },
        { value:'humour',      label:'Humour / entertainment'        },
      ]},
      { key:'thumbnail_text',label:'Overlay text (1–5 words)',   type:'text',     maxLength:40, placeholder:'e.g. ₦500K IN 30 DAYS  |  WATCH THIS!' },
      { key:'style_override',label:'Design style (optional)',    type:'select',   options: STYLE_OPTS },
    ],
    loadingMessages: [
      'Building 16:9 thumbnail canvas…',
      'Analysing video topic for visual direction…',
      'Generating Thumbnail Variant 1…',
      'Generating Thumbnail Variant 2…',
      'Applying brand overlay and logo…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. Quote Card Creator
  // ─────────────────────────────────────────────────────────
  {
    id:              'quote-card-creator',
    name:            'Quote Card Creator',
    tagline:         'Turn testimonials and insights into shareable graphics.',
    description:     'Generate 3 branded quote card designs for testimonials, results, or inspirational content.',
    icon:            '💬',
    accentColor:     '#8B5CF6',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['square','portrait'],
    variants:        3,
    formBlocks: [
      { key:'quote_text',    label:'The quote or testimonial',    type:'textarea', required:true, rows:4, maxLength:300, placeholder:'Paste the exact quote or write the message to feature…' },
      { key:'attribution',   label:'Who said it / source',        type:'text',     maxLength:80, placeholder:'e.g. Amara O., Lagos  |  Customer Review  |  Your Name' },
      { key:'quote_type',    label:'Quote type',                  type:'select',   required:true, options: [
        { value:'testimonial',  label:'Customer testimonial'  },
        { value:'result',       label:'Business result / stat' },
        { value:'inspirational',label:'Inspirational / brand'  },
        { value:'review',       label:'Review screenshot style' },
        { value:'tip',          label:'Tip / advice'           },
      ]},
      { key:'format',        label:'Format',                      type:'select',   options: [
        { value:'square',   label:'Square 1:1' },
        { value:'portrait', label:'Portrait 4:5' },
      ]},
    ],
    loadingMessages: [
      'Building quote canvas with brand colors…',
      'Generating Quote Card Variant 1…',
      'Generating Quote Card Variant 2…',
      'Generating Quote Card Variant 3…',
      'Applying brand overlay…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. Promo Card Designer
  // ─────────────────────────────────────────────────────────
  {
    id:              'promo-card-designer',
    name:            'Promo Card Designer',
    tagline:         'Promotion graphics that drive action.',
    description:     'Generate 2 branded promotional cards for product sales, special offers, and seasonal promotions.',
    icon:            '🎯',
    accentColor:     '#E09818',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['square','portrait'],
    variants:        2,
    formBlocks: [
      { key:'product_name',  label:'Product / service name',      type:'text',     required:true, maxLength:80 },
      { key:'offer',         label:'The promotion / offer',       type:'text',     required:true, maxLength:120, placeholder:'e.g. 50% off  |  Buy 2 get 1 free  |  Free delivery this week' },
      { key:'price',         label:'Price (original and offer)',  type:'text',     maxLength:80, placeholder:'e.g. Was ₦15,000 — Now ₦7,500' },
      { key:'deadline',      label:'Offer deadline',              type:'text',     maxLength:60, placeholder:'e.g. Ends Sunday midnight  |  First 20 customers only' },
      { key:'product_desc',  label:'Brief product description',   type:'textarea', rows:2, maxLength:200 },
      { key:'format',        label:'Format',                      type:'select',   options: [
        { value:'square',   label:'Square 1:1 (Instagram feed)' },
        { value:'portrait', label:'Portrait 4:5 (More feed space)' },
      ]},
      { key:'style_override',label:'Design style',               type:'select',   options: STYLE_OPTS },
    ],
    loadingMessages: [
      'Building promo canvas…',
      'Generating Promo Variant 1…',
      'Generating Promo Variant 2…',
      'Adding brand colors and urgency design elements…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. Carousel Slide Maker
  // ─────────────────────────────────────────────────────────
  {
    id:              'carousel-slide-maker',
    name:            'Carousel Slide Maker',
    tagline:         'Turn content into a branded slide carousel.',
    description:     'Generate 5–8 branded carousel slide designs from your script. Each slide is a 1:1 square matching your brand.',
    icon:            '🎠',
    accentColor:     '#12D4B4',
    coinCostStandard: 30,
    coinCostPremium:  40,
    formats:         ['square'],
    variants:        1, // generates up to 8 slides, not variants
    formBlocks: [
      { key:'carousel_topic',label:'Carousel topic',              type:'text',     required:true, maxLength:100, placeholder:'e.g. 5 ways to grow your business on WhatsApp' },
      { key:'slide_content', label:'Slide content (one per line)',type:'textarea', required:true, rows:8, maxLength:1200, placeholder:'Slide 1: Title / Hook\nSlide 2: Point 1\nSlide 3: Point 2\n...\nSlide 8: Call to Action\n\nOr paste your CarouselScriptBuilder output here.' },
      { key:'slide_count',   label:'Number of slides',            type:'select',   required:true, options: [
        { value:'5', label:'5 slides' },
        { value:'6', label:'6 slides' },
        { value:'7', label:'7 slides' },
        { value:'8', label:'8 slides' },
      ]},
      { key:'style_override',label:'Design style',               type:'select',   options: STYLE_OPTS },
    ],
    loadingMessages: [
      'Reading carousel content…',
      'Building slide template with brand colors…',
      'Generating Slide 1 (Cover)…',
      'Generating content slides…',
      'Generating final slide (CTA)…',
      'Applying brand consistency across all slides…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. LinkedIn Banner
  // ─────────────────────────────────────────────────────────
  {
    id:              'linkedin-banner-designer',
    name:            'LinkedIn Banner Designer',
    tagline:         'Make your LinkedIn profile look as premium as your business.',
    description:     'Generate 2 branded LinkedIn profile banners (1584×396) for personal profiles and company pages.',
    icon:            '💼',
    accentColor:     '#0A66C2',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['banner'],
    variants:        2,
    formBlocks: [
      { key:'banner_type',   label:'Banner type',                 type:'select',   required:true, options: [
        { value:'personal',  label:'Personal profile banner'  },
        { value:'company',   label:'Company page banner'      },
      ]},
      { key:'tagline',       label:'Your tagline or key message', type:'text',     required:true, maxLength:100, placeholder:'e.g. Helping Nigerian SMEs grow with AI-powered marketing' },
      { key:'key_services',  label:'Key services / what you do', type:'text',     maxLength:150, placeholder:'e.g. Digital Marketing  |  Brand Strategy  |  AI Tools' },
      { key:'contact_info',  label:'Contact / CTA (optional)',   type:'text',     maxLength:80, placeholder:'e.g. wa.me/2348012345678  |  yourwebsite.com' },
      { key:'style_override',label:'Design style',               type:'select',   options: STYLE_OPTS },
    ],
    loadingMessages: [
      'Building LinkedIn banner canvas (1584×396)…',
      'Generating Banner Variant 1…',
      'Generating Banner Variant 2…',
      'Applying brand colors and logo…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 8. Email Header Designer
  // ─────────────────────────────────────────────────────────
  {
    id:              'email-header-designer',
    name:            'Email Header Designer',
    tagline:         'Brand your emails like a professional.',
    description:     'Generate 2 branded email header designs for newsletters and transactional emails.',
    icon:            '📧',
    accentColor:     '#12D4B4',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['banner'],
    variants:        2,
    formBlocks: [
      { key:'email_type',    label:'Email type',                  type:'select',   required:true, options: [
        { value:'newsletter',       label:'Newsletter / marketing email' },
        { value:'transactional',    label:'Transactional (order, receipt)'},
        { value:'announcement',     label:'Product announcement'         },
        { value:'promotional',      label:'Promotional / sale email'     },
      ]},
      { key:'email_title',   label:'Header title / issue name',   type:'text',     required:true, maxLength:80, placeholder:'e.g. The Weekly Brief  |  Order Confirmed  |  New Arrival' },
      { key:'tagline',       label:'Tagline or subtitle',         type:'text',     maxLength:100, placeholder:'e.g. Your weekly dose of marketing insights for Nigerian businesses' },
      { key:'style_override',label:'Design style',               type:'select',   options: STYLE_OPTS },
    ],
    loadingMessages: [
      'Building email header canvas…',
      'Generating Header Variant 1…',
      'Generating Header Variant 2…',
      'Applying brand colors and logo…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 9. Flyer Designer
  // ─────────────────────────────────────────────────────────
  {
    id:              'flyer-designer',
    name:            'Flyer Designer',
    tagline:         'Digital flyers that spread like wildfire on WhatsApp.',
    description:     'Generate 2 branded event or promotional flyers in A4 portrait or square format.',
    icon:            '📄',
    accentColor:     '#E84830',
    coinCostStandard: 10,
    coinCostPremium:  15,
    formats:         ['a4portrait','square'],
    variants:        2,
    formBlocks: [
      { key:'flyer_type',    label:'Flyer type',                  type:'select',   required:true, options: [
        { value:'event',       label:'Event invitation / announcement' },
        { value:'promotion',   label:'Sale / promotion'               },
        { value:'product',     label:'Product launch'                 },
        { value:'service',     label:'Service offering'               },
        { value:'job',         label:'Job vacancy / hiring'           },
        { value:'opening',     label:'Grand opening / new location'   },
      ]},
      { key:'headline',      label:'Main headline',               type:'text',     required:true, maxLength:80, placeholder:'e.g. GRAND OPENING  |  50% OFF EVERYTHING  |  WE\'RE HIRING' },
      { key:'key_details',   label:'Key details',                 type:'textarea', required:true, rows:4, maxLength:400, placeholder:'Include: date, time, location, price, or any key information to display on the flyer' },
      { key:'contact_info',  label:'Contact / how to respond',   type:'text',     maxLength:100, placeholder:'e.g. Call 0812-345-6789  |  DM us on Instagram  |  Visit our store at [address]' },
      { key:'format',        label:'Format',                      type:'select',   options: [
        { value:'a4portrait', label:'A4 Portrait (print/WhatsApp)' },
        { value:'square',     label:'Square (Instagram/Facebook)'  },
      ]},
      { key:'style_override',label:'Design style',               type:'select',   options: STYLE_OPTS },
    ],
    loadingMessages: [
      'Building flyer canvas…',
      'Generating Flyer Variant 1…',
      'Generating Flyer Variant 2…',
      'Applying brand colors, logo, and finishing…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 10. Festive Banner Designer
  // ─────────────────────────────────────────────────────────
  {
    id:              'festive-banner-designer',
    name:            'Festive Banner Designer',
    tagline:         'Celebrate every season with your brand front and centre.',
    description:     'Generate 2 branded festive designs for Nigerian holidays and seasonal campaigns.',
    icon:            '🎉',
    accentColor:     '#F59E0B',
    coinCostStandard: 15,
    coinCostPremium:  25,
    formats:         ['square','portrait','story'],
    variants:        2,
    festiveSeasons:  [
      'Eid/Sallah', 'Christmas & New Year', 'Easter', 'Nigerian Independence Day (Oct 1)',
      'Valentine\'s Day', 'Black Friday', 'Detty December', 'Children\'s Day (May 27)',
      'Mother\'s Day', 'Father\'s Day', 'New Year',
    ],
    formBlocks: [
      { key:'season',        label:'Festive season / occasion',   type:'select',   required:true, options: [
        { value:'eid_sallah',    label:'Eid / Sallah'                  },
        { value:'christmas',     label:'Christmas & New Year'           },
        { value:'easter',        label:'Easter'                         },
        { value:'independence',  label:'Nigerian Independence Day Oct 1'},
        { value:'valentine',     label:'Valentine\'s Day'               },
        { value:'black_friday',  label:'Black Friday'                   },
        { value:'detty_dec',     label:'Detty December'                 },
        { value:'childrens_day', label:'Children\'s Day May 27'         },
        { value:'mothers_day',   label:'Mother\'s Day'                  },
        { value:'new_year',      label:'New Year'                       },
        { value:'custom',        label:'Custom occasion'                },
      ]},
      { key:'custom_occasion',label:'Custom occasion name (if selected above)', type:'text', maxLength:60 },
      { key:'greeting_msg',  label:'Your greeting message',       type:'text',     required:true, maxLength:120, placeholder:'e.g. Wishing you a blessed Eid from all of us at [Business Name]' },
      { key:'include_offer', label:'Include a promotion?',        type:'select',   options: [
        { value:'no',   label:'No — just the greeting' },
        { value:'yes',  label:'Yes — include an offer' },
      ]},
      { key:'offer_text',    label:'Offer (if yes above)',        type:'text',     maxLength:100, placeholder:'e.g. 20% off all orders this holiday week' },
      { key:'format',        label:'Format',                      type:'select',   options: [
        { value:'square',   label:'Square 1:1 (Instagram/Facebook)' },
        { value:'portrait', label:'Portrait 4:5 (Instagram feed)'    },
        { value:'story',    label:'Story/Status 9:16'                 },
      ]},
    ],
    loadingMessages: [
      'Loading festive design elements…',
      'Generating Festive Design Variant 1…',
      'Generating Festive Design Variant 2…',
      'Adding brand colors and festive elements…',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 11. Logo Generator
  // ─────────────────────────────────────────────────────────
  {
    id:              'logo-generator',
    name:            'Logo Generator',
    tagline:         'A real vector logo your business can actually use.',
    description:     'Generates your brand logo as a true SVG vector file — scalable to any size, usable in Canva, Illustrator, Figma, and by any printer. Includes icon mark, wordmark, and combination versions.',
    icon:            '✦',
    accentColor:     '#E09818',
    coinCostStandard: 50,
    coinCostPremium:  80,
    formats:         ['logo'],
    variants:        3, // icon, wordmark, combination
    formBlocks: [
      { key:'business_name', label:'Business name (exactly as it should appear)', type:'text', required:true, maxLength:60 },
      { key:'tagline',       label:'Tagline (optional)',           type:'text',     maxLength:80, placeholder:'Leave blank to omit' },
      { key:'logo_style',    label:'Logo style direction',        type:'select',   required:true, options: [
        { value:'geometric_abstract',label:'Geometric / Abstract icon'      },
        { value:'lettermark',        label:'Lettermark (initials-based)'    },
        { value:'wordmark',          label:'Wordmark only (styled name)'    },
        { value:'emblem',            label:'Emblem / badge style'           },
        { value:'minimal',           label:'Minimal / clean line art'       },
        { value:'bold_display',      label:'Bold / display style'           },
      ]},
      { key:'industry_context', label:'Industry / what the business does', type:'text', required:true, maxLength:150, placeholder:'e.g. Fashion boutique, Lagos | Tech startup | Restaurant' },
      { key:'brand_personality', label:'Brand personality', type:'select', options: [
        { value:'professional_trustworthy', label:'Professional & Trustworthy'  },
        { value:'bold_innovative',          label:'Bold & Innovative'           },
        { value:'warm_friendly',            label:'Warm & Friendly'             },
        { value:'luxury_premium',           label:'Luxury & Premium'            },
        { value:'energetic_youthful',       label:'Energetic & Youthful'        },
        { value:'authentic_cultural',       label:'Authentic & Culturally rooted'},
      ]},
      { key:'avoid_elements',label:'Elements to avoid',           type:'text',     maxLength:150, placeholder:'e.g. no animals, no circles, no red colors' },
    ],
    loadingMessages: [
      'Analysing your brand brief…',
      'Designing icon mark concept…',
      'Crafting wordmark typography…',
      'Building combination layout…',
      'Generating SVG vector code…',
      'Preparing PNG export pack…',
    ],
  },
]

// ── Helper: get tool by ID ───────────────────────────────────
export function getDesignTool(id: string): DesignTool | undefined {
  return DESIGN_TOOLS.find(t => t.id === id)
}

// ── Coin cost lookup ─────────────────────────────────────────
export function getDesignCoinCost(toolId: string, engine: 'standard' | 'premium'): number {
  const tool = getDesignTool(toolId)
  if (!tool) return 0
  return engine === 'premium' ? tool.coinCostPremium : tool.coinCostStandard
}

// ── DALL-E 3 supported sizes ─────────────────────────────────
export const DALLE_SIZES = {
  square:      '1024x1024',
  portrait:    '1024x1792',  // crop to 4:5 after
  landscape:   '1792x1024',  // crop to 1.91:1 after
  story:       '1024x1792',
  thumbnail:   '1792x1024',
  banner:      '1792x1024',  // crop to 4:1 after
  a4portrait:  '1024x1792',  // crop to A4 ratio after
  logo:        'n/a',        // SVG generation, no DALL-E
} as const
