// ═══════════════════════════════════════════════════════════════
// /lib/tools/industries.ts
// Master industry list — single source of truth used by:
//   • Onboarding page
//   • Profile page
//   • form-suggestions.ts (via INDUSTRY_SUGGESTION_MAP)
//   • master-system-prompt.ts (via INDUSTRY_LABELS)
//   • Any analytics or admin dashboard
//
// DESIGN PRINCIPLES:
//   - Nigeria-specific: categories and labels reflect the actual
//     structure of Nigerian SME commerce, not a generic Western list
//   - Granular enough to produce genuinely tailored AI suggestions
//   - Grouped into 17 categories for easy browsing and search
//   - Every value is snake_case, stable (never rename after launch)
// ═══════════════════════════════════════════════════════════════

export interface Industry {
  value:    string   // stable key stored in DB (never change after launch)
  label:    string   // display label shown to user
  emoji:    string   // visual identifier
  keywords: string[] // extra words that match this industry in search
}

export interface IndustryCategory {
  id:         string
  label:      string
  emoji:      string
  industries: Industry[]
}

export const INDUSTRY_CATEGORIES: IndustryCategory[] = [

  // ── Food & Drinks ─────────────────────────────────────────────
  {
    id: 'food_drinks', label: 'Food & Drinks', emoji: '🍽️',
    industries: [
      { value:'restaurant_eatery',      label:'Restaurant / Eatery',                         emoji:'🍛', keywords:['canteen','bukas','buka','cafeteria','eating place','amala','nkwobi'] },
      { value:'fast_food',              label:'Fast Food & Quick Service',                   emoji:'🍔', keywords:['shawarma','snacks','takeaway','takeout'] },
      { value:'catering_event_food',    label:'Catering & Event Food',                       emoji:'🥘', keywords:['caterer','party food','wedding catering','cook'] },
      { value:'pastry_bakery',          label:'Bakery / Pastry & Cakes',                     emoji:'🎂', keywords:['cake','bread','pastries','confectionery','chin chin','puff puff','donuts'] },
      { value:'small_chop_street_food', label:'Small Chop & Street Food',                    emoji:'🍢', keywords:['suya','street vendor','roasted corn','boli','roasted yam','finger food'] },
      { value:'suya_bbq',               label:'Suya, Grills & BBQ',                          emoji:'🔥', keywords:['asun','bbq','grill','peppered meat','nkwobi'] },
      { value:'drinks_beverages',       label:'Drinks & Beverages',                          emoji:'🥤', keywords:['zobo','kunu','smoothie','juice','cocktail','drinks supply','water production'] },
      { value:'food_processing',        label:'Food Processing & Packaging',                 emoji:'🏭', keywords:['groundnut oil','palm oil','spice','tomato paste','dry fish','smoked fish','processed food'] },
      { value:'snacks_production',      label:'Snacks Production & Wholesale',               emoji:'🥜', keywords:['chin chin','plantain chips','groundnut','popcorn','biscuit','peanut butter'] },
    ],
  },

  // ── Fashion & Clothing ────────────────────────────────────────
  {
    id: 'fashion', label: 'Fashion & Clothing', emoji: '👗',
    industries: [
      { value:'tailoring_bespoke',      label:'Tailoring & Bespoke Fashion',                 emoji:'🧵', keywords:['sewing','seamstress','tailor','agbada','kaftan','native wear','couture'] },
      { value:'ready_to_wear',          label:'Ready-to-Wear Clothing Brand',                emoji:'👕', keywords:['clothing brand','t-shirt','apparel','streetwear'] },
      { value:'ankara_fabric_fashion',  label:'Ankara / African Print Fashion',              emoji:'🪡', keywords:['ankara','adire','fabric','African print','aso-oke','lace','George'] },
      { value:'mens_fashion',           label:"Men's Fashion & Suits",                       emoji:'🤵', keywords:['agbada','male fashion','corporate fashion','suit','shirt'] },
      { value:'childrens_fashion',      label:"Children's Clothing",                         emoji:'🧒', keywords:['kids wear','baby clothes','school uniform','children fashion'] },
      { value:'shoes_footwear',         label:'Shoes & Footwear',                            emoji:'👠', keywords:['cobbler','cordwainer','sneakers','sandals','heels','shoe repair'] },
      { value:'accessories_jewellery',  label:'Jewellery & Accessories',                     emoji:'💍', keywords:['bags','belts','hats','beads','bangles','earrings','necklace'] },
      { value:'fabrics_textile',        label:'Fabrics, Lace & Textile',                     emoji:'🧶', keywords:['George lace','fabric store','textile','voile','chiffon','hollandis'] },
      { value:'thrift_okrika',          label:'Thrift / Okrika & Vintage Fashion',           emoji:'♻️', keywords:['okrika','fairly used','bale','second hand','thrift store'] },
    ],
  },

  // ── Beauty & Personal Care ────────────────────────────────────
  {
    id: 'beauty', label: 'Beauty & Personal Care', emoji: '💅',
    industries: [
      { value:'hair_salon',             label:'Hair Salon & Braiding',                       emoji:'💇', keywords:['braids','weave','wig','locs','relaxer','natural hair','hairdresser'] },
      { value:'barber_shop',            label:'Barbershop',                                  emoji:'💈', keywords:['haircut','fade','beard','shaving','men grooming'] },
      { value:'skincare_cosmetics',     label:'Skincare & Cosmetics',                        emoji:'✨', keywords:['cream','serum','glow','body butter','lotion','skincare brand','beauty products'] },
      { value:'nail_salon',             label:'Nail Salon & Nail Studio',                    emoji:'💅', keywords:['manicure','pedicure','acrylic nails','gel nails','nail art'] },
      { value:'makeup_artistry',        label:'Makeup Artist (MUA)',                         emoji:'💄', keywords:['MUA','bridal makeup','gele','glam','makeup studio'] },
      { value:'wig_hairpiece',          label:'Wig Making & Hair Pieces',                    emoji:'👱', keywords:['human hair','lace front','closure','bundles','hair vendor'] },
      { value:'spa_massage',            label:'Spa & Massage Therapy',                       emoji:'🧖', keywords:['massage','steam room','facial','body treatment','relaxation','sauna'] },
      { value:'perfume_fragrance',      label:'Perfume & Fragrance Business',                emoji:'🌸', keywords:['perfume oil','attar','fragrance','scent','parfum','oil perfume'] },
      { value:'beauty_training',        label:'Beauty Academy & Training',                   emoji:'🎓', keywords:['makeup school','hair training','nail training','beauty school','MUA course'] },
    ],
  },

  // ── Health & Wellness ─────────────────────────────────────────
  {
    id: 'health', label: 'Health & Wellness', emoji: '🏥',
    industries: [
      { value:'pharmacy_chemist',       label:'Pharmacy & Chemist',                          emoji:'💊', keywords:['drugs','medication','patent medicine store','chemist shop'] },
      { value:'private_clinic',         label:'Private Clinic / Hospital',                   emoji:'🏥', keywords:['doctor','medical centre','GP','general practice','hospital'] },
      { value:'dental_clinic',          label:'Dental Clinic & Orthodontics',                emoji:'🦷', keywords:['dentist','teeth whitening','braces','oral health','dental care'] },
      { value:'optician_eyecare',       label:'Optician & Eye Care',                         emoji:'👓', keywords:['eye test','glasses','spectacles','contact lens','optometrist'] },
      { value:'gym_fitness',            label:'Gym & Fitness Centre',                        emoji:'🏋️', keywords:['gym','workout','exercise','crossfit','aerobics','weight loss class'] },
      { value:'physiotherapy',          label:'Physiotherapy & Rehabilitation',              emoji:'🦾', keywords:['physio','rehab','sports therapy','back pain','stroke recovery'] },
      { value:'mental_health',          label:'Mental Health & Counselling',                 emoji:'🧠', keywords:['therapist','counsellor','psychologist','depression','anxiety support'] },
      { value:'herbal_medicine',        label:'Herbal & Alternative Medicine',               emoji:'🌿', keywords:['agbo','yoruba medicine','naturopath','organic remedy','herbal tea','jedi jedi'] },
      { value:'medical_lab',            label:'Medical Laboratory & Diagnostics',            emoji:'🔬', keywords:['blood test','HIV test','malaria test','lab','medical testing'] },
      { value:'maternity_childhealth',  label:'Maternity & Child Health',                    emoji:'🤱', keywords:['antenatal','midwife','baby clinic','immunisation','paediatrics'] },
      { value:'dietitian_nutrition',    label:'Nutrition & Dietitian Services',              emoji:'🥗', keywords:['diet plan','nutritionist','weight management','meal plan','healthy eating'] },
    ],
  },

  // ── Real Estate & Property ────────────────────────────────────
  {
    id: 'real_estate', label: 'Real Estate & Property', emoji: '🏠',
    industries: [
      { value:'real_estate_agency',     label:'Real Estate Agency',                          emoji:'🏢', keywords:['property agent','realtor','land','flat','duplex','letting agent','houses for sale'] },
      { value:'property_development',   label:'Property Development',                        emoji:'🏗️', keywords:['estate developer','housing scheme','land development','estate project'] },
      { value:'short_let_airbnb',       label:'Short-Let / Airbnb / Serviced Apartments',   emoji:'🛎️', keywords:['short let','serviced apartment','vacation rental','airbnb','self-contained','hotel alternative'] },
      { value:'facility_management',    label:'Facility & Estate Management',                emoji:'🏘️', keywords:['facility manager','property manager','estate management company','block management'] },
      { value:'interior_design',        label:'Interior Design & Home Décor',                emoji:'🛋️', keywords:['interior decorator','home design','space planning','furniture arrangement','decor'] },
      { value:'furniture',              label:'Furniture Making & Sales',                    emoji:'🪑', keywords:['carpenter','furniture maker','wardrobes','beds','chairs','sitting room set','custom furniture'] },
    ],
  },

  // ── Construction & Trades ─────────────────────────────────────
  {
    id: 'construction', label: 'Construction & Trades', emoji: '🔨',
    industries: [
      { value:'construction_building',  label:'Construction & Building',                     emoji:'🏗️', keywords:['building contractor','block laying','foundation','concrete','civil engineering'] },
      { value:'electrical_installation',label:'Electrical Installation & Repairs',           emoji:'⚡', keywords:['electrician','wiring','generator installation','electrical contractor','power'] },
      { value:'plumbing',               label:'Plumbing Services',                           emoji:'🔧', keywords:['plumber','pipes','water supply','drainage','borehole','water pump'] },
      { value:'air_conditioning',       label:'Air Conditioning (AC) Installation & Repairs',emoji:'❄️', keywords:['AC installer','split unit','inverter AC','cooling','aircon','AC technician'] },
      { value:'solar_energy',           label:'Solar Energy & Inverter Systems',             emoji:'☀️', keywords:['solar panels','inverter','backup power','off-grid','renewable energy','solar installation'] },
      { value:'tile_flooring',          label:'Tiling & Flooring',                           emoji:'🟫', keywords:['tiler','floor tiles','wall tiles','terrazzo','epoxy floor','screeding'] },
      { value:'painting_finishing',     label:'Painting & Wall Finishing',                   emoji:'🎨', keywords:['painter','wall painting','texture coating','waterproofing','house painting','wallpaper'] },
      { value:'aluminium_windows',      label:'Aluminium Windows, Doors & Railings',         emoji:'🪟', keywords:['aluminium fabricator','burglary proof','sliding doors','grille','window frames'] },
      { value:'welding_fabrication',    label:'Welding & Metal Fabrication',                 emoji:'⚙️', keywords:['welder','iron works','stainless steel','metal work','fabrication','gate'] },
    ],
  },

  // ── Technology & Digital ──────────────────────────────────────
  {
    id: 'technology', label: 'Technology & Digital Services', emoji: '💻',
    industries: [
      { value:'software_development',   label:'Software Development',                        emoji:'🖥️', keywords:['developer','programmer','SaaS','web app','ERP','CRM','custom software'] },
      { value:'mobile_app_dev',         label:'Mobile App Development',                      emoji:'📱', keywords:['app developer','iOS','Android','Flutter','React Native','mobile app'] },
      { value:'website_design',         label:'Website Design & Development',                emoji:'🌐', keywords:['web designer','WordPress','web developer','e-commerce website','online store builder'] },
      { value:'it_support',             label:'IT Support & Computer Repairs',               emoji:'🔧', keywords:['IT technician','computer repair','laptop repair','virus removal','CCTV installation','networking'] },
      { value:'digital_marketing',      label:'Digital Marketing Agency',                    emoji:'📊', keywords:['social media marketing','SEO','Google Ads','Facebook Ads','online marketing','content marketing'] },
      { value:'graphic_design',         label:'Graphic Design & Branding',                   emoji:'🎨', keywords:['logo design','branding','flyer design','brand identity','visual design','Canva'] },
      { value:'video_production',       label:'Video Production & Cinematography',           emoji:'🎬', keywords:['videographer','filmmaker','content creator','video editor','drone','wedding video'] },
      { value:'photography_business',   label:'Photography Studio',                          emoji:'📸', keywords:['photographer','photo studio','portrait','product photography','event photographer'] },
      { value:'pos_payment',            label:'POS & Payment Solutions',                     emoji:'💳', keywords:['POS terminal','point of sale','payment processing','fintech','transfer agent'] },
      { value:'social_media_management',label:'Social Media Management',                     emoji:'📲', keywords:['social media manager','content strategy','Instagram management','community manager'] },
      { value:'data_cybersecurity',     label:'Data Recovery & Cybersecurity',               emoji:'🔐', keywords:['ethical hacking','data backup','network security','antivirus','penetration testing'] },
    ],
  },

  // ── Education & Training ──────────────────────────────────────
  {
    id: 'education', label: 'Education & Training', emoji: '📚',
    industries: [
      { value:'private_tutoring',       label:'Private Tutoring & Lesson Teacher',           emoji:'📖', keywords:['home lesson','extra lesson','maths tutor','lesson teacher','exam lesson'] },
      { value:'private_school',         label:'Private School',                              emoji:'🏫', keywords:['nursery school','primary school','secondary school','A-levels','playgroup'] },
      { value:'vocational_skills',      label:'Vocational & Skills Training',                emoji:'🔨', keywords:['trade school','skills acquisition','catering school','fashion school','computing training','make money skills'] },
      { value:'online_courses',         label:'Online Courses & E-Learning Business',        emoji:'💻', keywords:['online coaching','course creator','digital skills','eLearning','virtual training'] },
      { value:'exam_coaching',          label:'Exam Coaching (JAMB, WAEC, GRE, IELTS)',      emoji:'✏️', keywords:['JAMB lessons','WAEC lesson','IELTS preparation','TOEFL','Common Entrance','university admission'] },
      { value:'driving_school',         label:'Driving School',                              emoji:'🚗', keywords:['driving lesson','drivers license','vehicle training'] },
      { value:'language_school',        label:'Language Training',                           emoji:'🗣️', keywords:['French class','English class','Mandarin','Yoruba lessons','language tutor'] },
      { value:'music_arts_school',      label:'Music, Dance & Arts School',                  emoji:'🎵', keywords:['music lessons','piano lesson','guitar class','dance studio','drama school'] },
      { value:'child_daycare',          label:'Childcare, Crèche & Day Care',                emoji:'🧒', keywords:['crèche','nursery','after school','babysitter','nanny service','childminder'] },
    ],
  },

  // ── Logistics & Transportation ────────────────────────────────
  {
    id: 'logistics', label: 'Logistics & Transportation', emoji: '🚚',
    industries: [
      { value:'dispatch_delivery',      label:'Dispatch & Same-Day Delivery',                emoji:'🛵', keywords:['dispatch rider','errand','last-mile','logistics company','courier','okada'] },
      { value:'long_distance_haulage',  label:'Long-Distance Haulage & Logistics',           emoji:'🚛', keywords:['truck','haulage','bulk cargo','inter-state logistics','freight transport'] },
      { value:'ride_hailing',           label:'Ride-Hailing & Taxi Service',                 emoji:'🚖', keywords:['taxi','Uber','Bolt','cab','ride service','airport transfer','executive driver'] },
      { value:'car_hire',               label:'Car Hire & Vehicle Rental',                   emoji:'🚙', keywords:['car rental','fleet management','self-drive hire','wedding car','bus hire'] },
      { value:'moving_relocation',      label:'Moving & Relocation Service',                 emoji:'📦', keywords:['movers','packing','house moving','office relocation','packers and movers'] },
      { value:'freight_forwarding',     label:'Freight Forwarding & Clearing',               emoji:'⚓', keywords:['import','export','customs clearance','shipping agent','freight broker','cargo'] },
      { value:'courier_express',        label:'Courier & Express Delivery',                  emoji:'📮', keywords:['DHL','FedEx','courier service','parcel delivery','document delivery'] },
      { value:'tricycle_keke',          label:'Keke / Tricycle Operations',                  emoji:'🛺', keywords:['keke napep','tricycle','3-wheeler','public transport','napep'] },
    ],
  },

  // ── Finance & Professional Services ──────────────────────────
  {
    id: 'finance_professional', label: 'Finance & Professional Services', emoji: '📊',
    industries: [
      { value:'accounting_bookkeeping', label:'Accounting & Bookkeeping',                    emoji:'🧾', keywords:['accountant','bookkeeper','tax filing','financial records','audit','ICAN'] },
      { value:'tax_consulting',         label:'Tax Consulting',                              emoji:'📋', keywords:['tax consultant','FIRS','VAT','income tax','company tax','tax advisory'] },
      { value:'insurance_agency',       label:'Insurance Agency & Brokerage',                emoji:'🛡️', keywords:['insurance broker','life insurance','car insurance','health insurance','AIICO','Leadway'] },
      { value:'business_consulting',    label:'Business Consulting & Strategy',              emoji:'💼', keywords:['business consultant','strategy consultant','management consulting','business advisory','SME advisor'] },
      { value:'hr_consulting',          label:'HR, Recruitment & Staffing',                  emoji:'👥', keywords:['recruiter','headhunter','HR manager','talent acquisition','workforce solutions','payroll'] },
      { value:'legal_services',         label:'Law Firm & Legal Services',                   emoji:'⚖️', keywords:['lawyer','solicitor','barrister','legal advisor','notary','attorney','chamber'] },
      { value:'immigration_consulting', label:'Immigration, Visa & Travel Document Services',emoji:'🛂', keywords:['visa agent','passport','immigration','travel documents','Canada visa','UK visa','student visa'] },
      { value:'microfinance',           label:'Microfinance, Cooperative & Thrift',          emoji:'🏦', keywords:['cooperative society','ajo','esusu','thrift','savings group','microfinance bank'] },
      { value:'investment_advisory',    label:'Investment & Wealth Advisory',                emoji:'📈', keywords:['investment','forex trading','stocks','mutual fund','wealth manager','financial planner'] },
    ],
  },

  // ── Retail & E-Commerce ───────────────────────────────────────
  {
    id: 'retail', label: 'Retail & E-Commerce', emoji: '🛒',
    industries: [
      { value:'online_store_general',   label:'Online Store (General Retail)',               emoji:'🛍️', keywords:['e-commerce','Jumia seller','online market','seller','reseller','buy and sell'] },
      { value:'phones_electronics',     label:'Phones, Gadgets & Electronics',               emoji:'📱', keywords:['phone sales','accessories','chargers','screen repair','Tecno','Samsung','iPhone'] },
      { value:'supermarket_minimart',   label:'Supermarket / Mini Mart',                     emoji:'🏪', keywords:['provision','grocery','minimart','convenience store','food mart','corner shop'] },
      { value:'baby_children_store',    label:'Baby & Children\'s Products',                 emoji:'🍼', keywords:['baby products','stroller','diapers','toddler','children\'s shop','baby clothes'] },
      { value:'home_appliances_store',  label:'Home Appliances & Electronics',               emoji:'🏠', keywords:['fridge','washing machine','blender','TV','microwave','home electronics'] },
      { value:'building_materials',     label:'Building Materials & Hardware',               emoji:'🧱', keywords:['cement','iron rods','paints','tiles','roofing sheet','hardware store'] },
      { value:'auto_spare_parts',       label:'Auto Spare Parts & Accessories',              emoji:'🔩', keywords:['spare parts dealer','car parts','auto accessories','Tokunbo parts','engine parts'] },
      { value:'books_stationery',       label:'Books, Stationery & Office Supplies',         emoji:'📚', keywords:['textbooks','exercise books','school supplies','office stationery','printing paper'] },
      { value:'gifts_crafts_souvenirs', label:'Gifts, Crafts & Souvenirs',                   emoji:'🎁', keywords:['gift shop','handmade crafts','souvenir','hamper','customised gift','branded items'] },
      { value:'sports_equipment',       label:'Sports & Fitness Equipment',                  emoji:'⚽', keywords:['gym equipment','sporting goods','football','fitness gear','treadmill','sportswear'] },
    ],
  },

  // ── Events & Hospitality ──────────────────────────────────────
  {
    id: 'events_hospitality', label: 'Events & Hospitality', emoji: '🎉',
    industries: [
      { value:'event_planning',         label:'Event Planning & Management',                 emoji:'🎊', keywords:['event coordinator','event company','event organiser','party planner','conference planning'] },
      { value:'wedding_planning',       label:'Wedding Planning & Coordination',             emoji:'💒', keywords:['wedding planner','bridal coordinator','wedding consultant','asooke','wedding vendors'] },
      { value:'venue_rental',           label:'Event Venue / Hall Rental',                   emoji:'🏛️', keywords:['event hall','banquet hall','party venue','hall hiring','conference room'] },
      { value:'dj_entertainment',       label:'DJ, Live Band & Entertainment',               emoji:'🎧', keywords:['DJ services','MC','live band','saxophonist','music for events','entertainment company'] },
      { value:'event_decor',            label:'Event Decoration & Styling',                  emoji:'🎀', keywords:['decorator','balloon artistry','centrepiece','event setup','floral arrangement','backdrops'] },
      { value:'hotel_guesthouse',       label:'Hotel, Guest House & Lodge',                  emoji:'🏨', keywords:['hotel','lodge','inn','b&b','self-catering accommodation','transit hotel'] },
      { value:'travel_tourism',         label:'Travel Agency & Tourism',                     emoji:'✈️', keywords:['travel agent','holiday package','visa processing','ticket booking','tour guide','adventure tourism'] },
      { value:'bar_lounge_club',        label:'Bar, Lounge & Club',                          emoji:'🍹', keywords:['bar','lounge','nightclub','hookah','shisha lounge','cocktail bar','sports bar'] },
    ],
  },

  // ── Agriculture & Farming ─────────────────────────────────────
  {
    id: 'agriculture', label: 'Agriculture & Farming', emoji: '🌾',
    industries: [
      { value:'crop_farming',           label:'Crop Farming (Vegetables, Fruits, Grains)',   emoji:'🌽', keywords:['cassava','maize','yam','plantain','tomato','pepper','farm produce','smallholder farmer'] },
      { value:'poultry_farming',        label:'Poultry Farming',                             emoji:'🐔', keywords:['broiler','layers','eggs','chickens','turkey','duck farming'] },
      { value:'fish_farming',           label:'Fish Farming & Aquaculture',                  emoji:'🐟', keywords:['catfish','tilapia','fish pond','aquaculture','smoking fish','fish feed'] },
      { value:'cattle_livestock',       label:'Cattle, Goat & Livestock Farming',            emoji:'🐄', keywords:['cattle rearing','goat farming','dairy','ram','livestock trading','Fulani'] },
      { value:'agro_processing',        label:'Agro-Processing & Food Mill',                 emoji:'⚙️', keywords:['palm oil mill','cassava processing','gari','palm kernel','rice milling','flour mill'] },
      { value:'organic_farming',        label:'Organic & Natural Farming',                   emoji:'🌱', keywords:['organic produce','natural farm','pesticide-free','farm to table','herb farm'] },
      { value:'farm_input_supply',      label:'Farm Input & Agro Supplies',                  emoji:'🌿', keywords:['fertiliser','seedlings','agrochemicals','agro dealer','irrigation equipment','farm supplies'] },
      { value:'horticulture',           label:'Horticulture, Landscaping & Nursery',         emoji:'🌷', keywords:['flower farm','plant nursery','landscape gardening','succulent','indoor plants','floriculture'] },
    ],
  },

  // ── Media, Creativity & Content ───────────────────────────────
  {
    id: 'media_content', label: 'Media, Creativity & Content', emoji: '🎭',
    industries: [
      { value:'music_production',       label:'Music, Recording & Production',               emoji:'🎵', keywords:['musician','record label','beat maker','music producer','artiste','songwriter'] },
      { value:'acting_film',            label:'Acting, Film & TV Production',                emoji:'🎬', keywords:['actor','movie producer','Nollywood','film director','casting','production company'] },
      { value:'blogging_content',       label:'Blogging & Content Creation',                 emoji:'✍️', keywords:['blogger','writer','content creator','newsletter','media house','digital media'] },
      { value:'youtube_tiktok_creator', label:'YouTube / TikTok / Reels Creator',            emoji:'▶️', keywords:['YouTuber','TikToker','content creator','vlogger','short video','Reels'] },
      { value:'printing_branding',      label:'Printing, Branding & Signage',                emoji:'🖨️', keywords:['printer','banner','brochure','business card','branded merchandise','signage','billboard'] },
      { value:'animation_motion',       label:'Animation & Motion Graphics',                 emoji:'🎞️', keywords:['animator','2D animation','3D animation','motion designer','explainer video','whiteboard video'] },
      { value:'pr_publicity',           label:'PR, Media & Publicity',                       emoji:'📡', keywords:['public relations','press release','media coverage','brand publicity','influencer marketing','event PR'] },
      { value:'podcast_radio',          label:'Podcast & Radio',                             emoji:'🎙️', keywords:['podcaster','radio presenter','audio content','community radio','internet radio'] },
      { value:'influencer_creator',     label:'Social Media Influencer',                     emoji:'⭐', keywords:['influencer','brand ambassador','skit maker','Instagram influencer','nano-influencer','macro-influencer'] },
    ],
  },

  // ── Auto Services ─────────────────────────────────────────────
  {
    id: 'auto', label: 'Auto Services', emoji: '🚗',
    industries: [
      { value:'auto_mechanic',          label:'Auto Mechanic / Car Workshop',                emoji:'🔧', keywords:['mechanic','engine repair','servicing','car maintenance','vulcanizer','auto workshop'] },
      { value:'car_wash',               label:'Car Wash & Auto Detailing',                   emoji:'🚿', keywords:['car wash','steam wash','auto detailing','car cleaning','interior cleaning'] },
      { value:'car_dealership',         label:'Car Dealership (New / Used / Tokunbo)',        emoji:'🚘', keywords:['car dealer','used cars','tokunbo','Belgium','car sales','auto sales'] },
      { value:'auto_body_paint',        label:'Auto Body & Paint Shop',                      emoji:'🎨', keywords:['panel beater','auto body repair','spray painting','accident repair','dent removal'] },
      { value:'tyre_vulcanizing',       label:'Tyre Sales & Vulcanizing',                    emoji:'⭕', keywords:['tyre shop','tyres','alignment','balancing','wheel repair','vulcaniser'] },
      { value:'auto_electrical',        label:'Auto Electrical & Electronics',               emoji:'⚡', keywords:['car electrician','AC gas','sound system','car audio','tracker installation','dashcam'] },
    ],
  },

  // ── Home & Personal Services ──────────────────────────────────
  {
    id: 'home_services', label: 'Home & Personal Services', emoji: '🏡',
    industries: [
      { value:'cleaning_services',      label:'Cleaning & Fumigation Services',              emoji:'🧹', keywords:['house cleaning','office cleaning','pest control','fumigation','janitorial','deep clean'] },
      { value:'laundry_drycleaning',    label:'Laundry & Dry Cleaning',                      emoji:'👔', keywords:['laundry service','dry cleaner','iron clothes','wash and fold','express laundry'] },
      { value:'home_security_cctv',     label:'Home Security & CCTV Installation',           emoji:'🔒', keywords:['security cameras','CCTV','burglar alarm','access control','smart home security'] },
      { value:'domestic_staffing',      label:'Domestic Staffing & Nanny Agency',            emoji:'👶', keywords:['nanny','house help','domestic worker','cook','driver','caregiver','housekeeper'] },
      { value:'elderly_care',           label:'Elderly & Home Care Services',                emoji:'👴', keywords:['elder care','home nursing','caregiver','disability support','hospice'] },
      { value:'waste_recycling',        label:'Waste Management & Recycling',                emoji:'♻️', keywords:['waste collection','refuse','recycling','environmental services','sanitation'] },
    ],
  },

  // ── NGO, Religious & Community ────────────────────────────────
  {
    id: 'ngo_religious', label: 'NGO, Religious & Community', emoji: '🤲',
    industries: [
      { value:'ngo_foundation',         label:'NGO, Foundation & Charity',                   emoji:'🤝', keywords:['nonprofit','charity','social enterprise','humanitarian','community organisation','CBO'] },
      { value:'church_religious',       label:'Church, Mosque & Religious Organisation',     emoji:'⛪', keywords:['church','mosque','ministry','pastor','imam','religious centre','faith organisation'] },
      { value:'community_development',  label:'Community Development Organisation',          emoji:'🏘️', keywords:['community group','cooperative','residents association','development committee'] },
    ],
  },
]

// ── Flat list for lookup ───────────────────────────────────────
export const INDUSTRY_LIST: Industry[] = INDUSTRY_CATEGORIES.flatMap(cat => cat.industries)

// ── Map value → label ─────────────────────────────────────────
export const INDUSTRY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  INDUSTRY_LIST.map(i => [i.value, i.label])
)

// ── Map industry value → suggestion data key ──────────────────
// Industries that don't have bespoke INDUSTRY_DATA entries fall back
// to the closest equivalent category key.
export const INDUSTRY_SUGGESTION_MAP: Record<string, string> = {
  // GROUP 1 → fashion_clothing
  tailoring_bespoke:      'fashion_clothing',
  ready_to_wear:          'fashion_clothing',
  ankara_fabric_fashion:  'fashion_clothing',
  mens_fashion:           'fashion_clothing',
  childrens_fashion:      'fashion_clothing',
  shoes_footwear:         'fashion_clothing',
  accessories_jewellery:  'fashion_clothing',
  fabrics_textile:        'fashion_clothing',
  thrift_okrika:          'fashion_clothing',

  // GROUP 2 → food_restaurants
  restaurant_eatery:      'food_restaurants',
  fast_food:              'food_restaurants',
  catering_event_food:    'food_restaurants',
  pastry_bakery:          'food_restaurants',
  small_chop_street_food: 'food_restaurants',
  suya_bbq:               'food_restaurants',
  drinks_beverages:       'food_restaurants',
  food_processing:        'food_restaurants',
  snacks_production:      'food_restaurants',

  // GROUP 3 → beauty_cosmetics
  hair_salon:             'beauty_cosmetics',
  barber_shop:            'beauty_cosmetics',
  skincare_cosmetics:     'beauty_cosmetics',
  nail_salon:             'beauty_cosmetics',
  makeup_artistry:        'beauty_cosmetics',
  wig_hairpiece:          'beauty_cosmetics',
  spa_massage:            'beauty_cosmetics',
  perfume_fragrance:      'beauty_cosmetics',
  beauty_training:        'beauty_cosmetics',

  // GROUP 4 → healthcare_wellness
  pharmacy_chemist:       'healthcare_wellness',
  private_clinic:         'healthcare_wellness',
  dental_clinic:          'healthcare_wellness',
  optician_eyecare:       'healthcare_wellness',
  gym_fitness:            'healthcare_wellness',
  physiotherapy:          'healthcare_wellness',
  mental_health:          'healthcare_wellness',
  herbal_medicine:        'healthcare_wellness',
  medical_lab:            'healthcare_wellness',
  maternity_childhealth:  'healthcare_wellness',
  dietitian_nutrition:    'healthcare_wellness',

  // GROUP 5 → real_estate
  real_estate_agency:     'real_estate',
  property_development:   'real_estate',
  short_let_airbnb:       'real_estate',
  facility_management:    'real_estate',
  interior_design:        'real_estate',
  furniture:              'real_estate',

  // GROUP 6 → construction (new)
  construction_building:   'construction',
  electrical_installation: 'construction',
  plumbing:                'construction',
  air_conditioning:        'construction',
  solar_energy:            'construction',
  tile_flooring:           'construction',
  painting_finishing:      'construction',
  aluminium_windows:       'construction',
  welding_fabrication:     'construction',

  // GROUP 7 → technology_software
  software_development:    'technology_software',
  mobile_app_dev:          'technology_software',
  website_design:          'technology_software',
  it_support:              'technology_software',
  digital_marketing:       'technology_software',
  graphic_design:          'technology_software',
  video_production:        'technology_software',
  photography_business:    'technology_software',
  pos_payment:             'technology_software',
  social_media_management: 'technology_software',
  data_cybersecurity:      'technology_software',

  // GROUP 8 → education_training
  private_tutoring:        'education_training',
  private_school:          'education_training',
  vocational_skills:       'education_training',
  online_courses:          'education_training',
  exam_coaching:           'education_training',
  driving_school:          'education_training',
  language_school:         'education_training',
  music_arts_school:       'education_training',
  child_daycare:           'education_training',

  // GROUP 9 → logistics_delivery
  dispatch_delivery:       'logistics_delivery',
  long_distance_haulage:   'logistics_delivery',
  ride_hailing:            'logistics_delivery',
  car_hire:                'logistics_delivery',
  moving_relocation:       'logistics_delivery',
  freight_forwarding:      'logistics_delivery',
  courier_express:         'logistics_delivery',
  tricycle_keke:           'logistics_delivery',

  // GROUP 10 → finance_fintech
  accounting_bookkeeping:  'finance_fintech',
  tax_consulting:          'finance_fintech',
  insurance_agency:        'finance_fintech',
  business_consulting:     'finance_fintech',
  hr_consulting:           'finance_fintech',
  legal_services:          'finance_fintech',
  immigration_consulting:  'finance_fintech',
  microfinance:            'finance_fintech',
  investment_advisory:     'finance_fintech',

  // GROUP 11 → ecommerce_retail
  online_store_general:    'ecommerce_retail',
  phones_electronics:      'ecommerce_retail',
  supermarket_minimart:    'ecommerce_retail',
  baby_children_store:     'ecommerce_retail',
  home_appliances_store:   'ecommerce_retail',
  building_materials:      'ecommerce_retail',
  auto_spare_parts:        'ecommerce_retail',
  books_stationery:        'ecommerce_retail',
  gifts_crafts_souvenirs:  'ecommerce_retail',
  sports_equipment:        'ecommerce_retail',

  // GROUP 12 → events_entertainment
  event_planning:          'events_entertainment',
  wedding_planning:        'events_entertainment',
  venue_rental:            'events_entertainment',
  dj_entertainment:        'events_entertainment',
  event_decor:             'events_entertainment',
  hotel_guesthouse:        'events_entertainment',
  travel_tourism:          'events_entertainment',
  bar_lounge_club:         'events_entertainment',

  // GROUP 13 → agriculture (new)
  crop_farming:            'agriculture',
  poultry_farming:         'agriculture',
  fish_farming:            'agriculture',
  cattle_livestock:        'agriculture',
  agro_processing:         'agriculture',
  organic_farming:         'agriculture',
  farm_input_supply:       'agriculture',
  horticulture:            'agriculture',

  // GROUP 14 → media_content (new)
  music_production:        'media_content',
  acting_film:             'media_content',
  blogging_content:        'media_content',
  youtube_tiktok_creator:  'media_content',
  printing_branding:       'media_content',
  animation_motion:        'media_content',
  pr_publicity:            'media_content',
  podcast_radio:           'media_content',
  influencer_creator:      'media_content',

  // GROUP 15 → auto_services (new)
  auto_mechanic:           'auto_services',
  car_wash:                'auto_services',
  car_dealership:          'auto_services',
  auto_body_paint:         'auto_services',
  tyre_vulcanizing:        'auto_services',
  auto_electrical:         'auto_services',

  // GROUP 16 → home_services (new)
  cleaning_services:       'home_services',
  laundry_drycleaning:     'home_services',
  home_security_cctv:      'home_services',
  domestic_staffing:       'home_services',
  elderly_care:            'home_services',
  waste_recycling:         'home_services',

  // GROUP 17 → other (existing fallback)
  ngo_foundation:          'other',
  church_religious:        'other',
  community_development:   'other',
}
