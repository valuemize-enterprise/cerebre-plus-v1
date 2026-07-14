'use client'
// /components/marketing/PricingSection.tsx
// Full 3-tier pricing component with feature comparison table and FAQ.
// Used on the landing page and at /pricing.

import React, { useState } from 'react'
import Link from 'next/link'

const A = '#060C1A'
const B = '#0B1F3A'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const W     = '#EBF2FC'
const DIM   = 'rgba(235,242,252,0.65)'
const MUTED = 'rgba(235,242,252,0.38)'
const FAINT = 'rgba(255,255,255,0.05)'
const BDR   = 'rgba(255,255,255,0.08)'

// ── Tick / Cross ──────────────────────────────────────────────
const Tick  = ({ color = TEAL }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}>
    <circle cx="8" cy="8" r="8" fill={`${color}20`}/>
    <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const Cross = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}>
    <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.05)"/>
    <path d="M6 6l4 4M10 6l-4 4" stroke="rgba(235,242,252,0.2)" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

// ── Coin usage estimate helper ────────────────────────────────
function CoinBadge({ coins, label }: { coins: number; label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:`${GL}08`, border:`1px solid ${GL}20`, borderRadius:10 }}>
      <span style={{ fontSize:18, fontWeight:900, color:GL, fontFamily:"'Georgia',serif" }}>⊙ {coins}</span>
      <span style={{ fontSize:12, color:MUTED, lineHeight:1.4 }}>{label}</span>
    </div>
  )
}

// ── FAQ item ──────────────────────────────────────────────────
function FAQItem({ q, a }: { q:string; a:string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:`1px solid ${BDR}` }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}>
        <span style={{ fontSize:15, fontWeight:600, color:DIM }}>{q}</span>
        <span style={{ fontSize:20, color:MUTED, transition:'transform .2s', transform:open?'rotate(45deg)':'none', flexShrink:0, marginLeft:12 }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize:14.5, color:MUTED, lineHeight:1.8, paddingBottom:18, maxWidth:640 }}>{a}</p>
      )}
    </div>
  )
}

// ── Plan data ─────────────────────────────────────────────────
const PLANS = [
  {
    id:       'free',
    name:     'Free',
    tagline:  'Try before you spend a naira.',
    price:    '₦0',
    period:   'always',
    cta:      'Start free →',
    href:     '/signup',
    color:    TEAL,
    coins:    null,
    badge:    null,
    highlight:false,
    keyFeatures: [
      '1 free tool run — full output, no card',
      'Business profile & Brand DNA setup',
      'AI-powered suggestions on every field',
      'Preview all 40+ tools before buying',
      '3 free SME Club sessions',
    ],
    notIncluded: [
      'Ongoing tool access after free run',
      'Design Studio',
      'Competitor Intelligence',
      'Full SME Club library',
    ],
  },
  {
    id:       'starter',
    name:     'Starter',
    tagline:  'For businesses that market every week.',
    price:    '₦7,500',
    period:   '/month',
    cta:      'Get Starter →',
    href:     '/signup?plan=starter',
    color:    GL,
    coins:    250,
    badge:    null,
    highlight:false,
    keyFeatures: [
      '250 coins refreshed every month',
      'All 40+ AI text & strategy tools',
      'Design Studio — Standard tier (10–50 coins/design)',
      'Content Calendar tool',
      'Brand DNA — colours, logo, font on every design',
      'Generation history (30 days)',
      'AI-powered suggestions across all tools',
      'Email support (48h response)',
    ],
    notIncluded: [
      'Design Studio Premium (Gemini Imagen 3)',
      'Full SME Club library',
      'Competitor Intelligence 2.0',
      'Team workspace',
    ],
  },
  {
    id:       'growth',
    name:     'Growth',
    tagline:  'For fast-moving businesses that live on content.',
    price:    '₦15,000',
    period:   '/month',
    cta:      'Go Growth →',
    href:     '/signup?plan=growth',
    color:    GOLD,
    coins:    600,
    badge:    'Most popular',
    highlight:true,
    keyFeatures: [
      '600 coins refreshed every month',
      'Everything in Starter',
      'Design Studio — Standard + Premium tier (Gemini)',
      'SME Club — full library access + weekly new sessions',
      'Competitor Intelligence 2.0 — social audit, ad intel, gap map',
      'Unlimited generation history & library',
      'Team workspace — up to 3 team members',
      'Coin alerts when balance runs low',
      'WhatsApp priority support (12h response)',
    ],
    notIncluded: [],
  },
]

// ── Feature comparison rows ───────────────────────────────────
const COMPARE = [
  // ── Core
  { section:'Core', feature:'Business profile & Brand DNA', free:true,  starter:true,  growth:true },
  { section:'Core', feature:'AI-powered form suggestions on all tools', free:true, starter:true, growth:true },
  { section:'Core', feature:'Monthly coins (auto-refresh)', free:'—', starter:'250 coins', growth:'600 coins' },
  { section:'Core', feature:'Carry unused coins forward', free:false, starter:false, growth:true },
  { section:'Core', feature:'Generation history', free:false, starter:'30 days', growth:'Unlimited' },
  // ── Text tools
  { section:'Text & Strategy Tools', feature:'Copywriting tools (CaptionCraft, AdScribe, CopyBrain AI…)', free:'Preview', starter:true, growth:true },
  { section:'Text & Strategy Tools', feature:'WhatsApp Campaign Builder & Broadcast tools', free:'Preview', starter:true, growth:true },
  { section:'Text & Strategy Tools', feature:'StrategyBrain / Sprint Blueprint (50 coins)', free:'Preview', starter:true, growth:true },
  { section:'Text & Strategy Tools', feature:'LaunchPad, BrandPositioner, CampaignClock (50–60 coins)', free:'Preview', starter:true, growth:true },
  { section:'Text & Strategy Tools', feature:'Full access to all 40+ text tools', free:false, starter:true, growth:true },
  // ── Design
  { section:'Design Studio', feature:'Social posts, flyers, banners, thumbnails — Standard', free:false, starter:true, growth:true },
  { section:'Design Studio', feature:'Carousel Slide Maker — Standard (30 coins)', free:false, starter:true, growth:true },
  { section:'Design Studio', feature:'Logo Generator — Standard (50 coins)', free:false, starter:true, growth:true },
  { section:'Design Studio', feature:'All 11 design tools — Premium tier (Gemini Imagen 3)', free:false, starter:false, growth:true },
  { section:'Design Studio', feature:'Logo Generator — Premium (80 coins)', free:false, starter:false, growth:true },
  // ── SME Club
  { section:'SME Club', feature:'3 free preview sessions', free:true, starter:true, growth:true },
  { section:'SME Club', feature:'Full library of expert sessions', free:false, starter:false, growth:true },
  { section:'SME Club', feature:'Weekly new sessions (notified by email)', free:false, starter:false, growth:true },
  { section:'SME Club', feature:'Completion certificates + resource downloads', free:false, starter:false, growth:true },
  // ── Competitor Intel
  { section:'Competitor Intelligence', feature:'Competitor discovery (Quick Scan)', free:false, starter:false, growth:true },
  { section:'Competitor Intelligence', feature:'Social Media Audit module', free:false, starter:false, growth:true },
  { section:'Competitor Intelligence', feature:'Meta Ad Intelligence module', free:false, starter:false, growth:true },
  { section:'Competitor Intelligence', feature:'Gap & Opportunity Map', free:false, starter:false, growth:true },
  { section:'Competitor Intelligence', feature:'Full Intel (up to 3 competitors)', free:false, starter:false, growth:true },
  // ── Team & support
  { section:'Team & Support', feature:'Team workspace (shared coins + brand)', free:false, starter:false, growth:'Up to 3 members' },
  { section:'Team & Support', feature:'Coin balance alerts', free:false, starter:false, growth:true },
  { section:'Team & Support', feature:'Email support', free:false, starter:'48h response', growth:'Priority' },
  { section:'Team & Support', feature:'WhatsApp support', free:false, starter:false, growth:'12h response' },
]

// ── What coins actually buy ───────────────────────────────────
const COIN_EXAMPLES = [
  { cat:'Copywriting',  examples:[{t:'CaptionCraft (per output)',c:15},{t:'CopyBrain AI (per output)',c:20},{t:'AdScribe (per output)',c:15},{t:'WhatsApp Campaign Builder',c:30},{t:'EmailScribe sequence',c:25},{t:'VideoScriptForge script',c:25}] },
  { cat:'Strategy',     examples:[{t:'Content Calendar (30 days)',c:20},{t:'StrategyBrain / Sprint Blueprint',c:50},{t:'AudienceProfiler deep dive',c:40},{t:'BrandPositioner strategy',c:50},{t:'LaunchPad full playbook',c:60},{t:'CampaignClock monthly plan',c:50}] },
  { cat:'Design',       examples:[{t:'Social Post — Standard',c:10},{t:'Flyer / Story / Banner — Standard',c:10},{t:'Carousel Slides — Standard (6 slides)',c:30},{t:'Logo — Standard',c:50},{t:'Any design — Premium (Gemini)',c:'15–80'},{t:'Logo — Premium (Gemini)',c:80}] },
  { cat:'Intelligence', examples:[{t:'Competitor Quick Scan (1 competitor)',c:60},{t:'Competitor Marketing Deep Dive',c:120},{t:'Full Intel 3 competitors',c:'180–200'},{t:'Background processing (6–7 competitors)',c:'250–320'},{t:'',c:0},{t:'',c:0}] },
]

// ── Main export ───────────────────────────────────────────────
export function PricingSection({ bg = B }: { bg?: string }) {
  const [showCompare, setShowCompare] = useState(false)
  const sections = [...new Set(COMPARE.map(r => r.section))]

  const CellValue = ({ v }: { v: boolean | string }) => {
    if (v === true)  return <Tick/>
    if (v === false) return <Cross/>
    if (v === '—')   return <span style={{ fontSize:13, color:MUTED }}>—</span>
    return <span style={{ fontSize:12.5, color:DIM, fontWeight:500 }}>{v as string}</span>
  }

  return (
    <section id="pricing" style={{ background:bg, padding:'104px 36px' }}>
      <style>{`
        .plan-cta{display:block;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:14.5px;text-decoration:none;transition:all .2s}
        .plan-cta-gold{background:linear-gradient(135deg,#E09818,#F5B830);color:#060C1A}
        .plan-cta-gold:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(224,152,24,0.35)}
        .plan-cta-ghost{background:rgba(255,255,255,0.06);color:rgba(235,242,252,0.65);border:1px solid rgba(255,255,255,0.1)}
        .plan-cta-ghost:hover{background:rgba(255,255,255,0.1);color:#EBF2FC}
        .plan-cta-teal{background:rgba(18,212,180,0.1);color:#12D4B4;border:1px solid rgba(18,212,180,0.25)}
        .plan-cta-teal:hover{background:rgba(18,212,180,0.18)}
        .toggle-btn{padding:8px 18px;border-radius:20px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .18s}
        @media(max-width:860px){.plans-grid{grid-template-columns:1fr!important}.compare-table{display:none}}
        @media(max-width:540px){section#pricing{padding-left:18px!important;padding-right:18px!important}}
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <p style={{ fontSize:11.5, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:TEAL, marginBottom:16 }}>
            Simple pricing
          </p>
          <h2 style={{ fontFamily:"'Georgia',serif", fontSize:48, fontWeight:900, color:W, lineHeight:1.1, marginBottom:18 }}>
            Start free.<br/>
            <span style={{ color:GL }}>Scale when you're ready.</span>
          </h2>
          <p style={{ fontSize:16, color:MUTED, lineHeight:1.8, maxWidth:540, margin:'0 auto' }}>
            Coins power every tool. Buy what you need — they never expire. No hidden fees, no automatic upgrades.
          </p>
        </div>

        {/* Three plan cards */}
        <div className="plans-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:44 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.highlight
                ? `linear-gradient(160deg, rgba(224,152,24,0.1) 0%, rgba(11,31,58,0.95) 100%)`
                : A,
              border: plan.highlight
                ? '1.5px solid rgba(224,152,24,0.45)'
                : `1px solid ${BDR}`,
              borderRadius:22, padding:28,
              display:'flex', flexDirection:'column', position:'relative',
              boxShadow: plan.highlight ? '0 24px 64px rgba(224,152,24,0.14)' : 'none',
            }}>
              {/* Badge */}
              {plan.badge && (
                <span style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', fontSize:10.5, fontWeight:800, letterSpacing:'1.5px', padding:'4px 18px', borderRadius:20, background:'linear-gradient(135deg,#E09818,#F5B830)', color:'#060C1A', whiteSpace:'nowrap' }}>
                  {plan.badge.toUpperCase()}
                </span>
              )}

              {/* Plan name */}
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:plan.color, marginBottom:14 }}>
                {plan.name}
              </p>
              <p style={{ fontSize:13, color:MUTED, marginBottom:20, lineHeight:1.6 }}>{plan.tagline}</p>

              {/* Price */}
              <div style={{ marginBottom:20 }}>
                <span style={{ fontFamily:"'Georgia',serif", fontSize:42, fontWeight:900, color:W }}>{plan.price}</span>
                <span style={{ fontSize:13.5, color:MUTED, marginLeft:5 }}>{plan.period}</span>
              </div>

              {/* Coin badge */}
              {plan.coins && (
                <div style={{ marginBottom:22 }}>
                  <CoinBadge coins={plan.coins} label={`coins per month — never expire`}/>
                </div>
              )}

              {/* Divider */}
              <div style={{ height:1, background:BDR, marginBottom:22 }}/>

              {/* Features */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:11, marginBottom:24 }}>
                {plan.keyFeatures.map(f => (
                  <div key={f} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <Tick color={plan.color}/>
                    <p style={{ fontSize:13.5, color:DIM, lineHeight:1.55 }}>{f}</p>
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <Cross/>
                    <p style={{ fontSize:13, color:'rgba(235,242,252,0.28)', lineHeight:1.55 }}>{f}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link href={plan.href}
                className={`plan-cta ${plan.highlight ? 'plan-cta-gold' : plan.id==='free' ? 'plan-cta-teal' : 'plan-cta-ghost'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Reassurance */}
        <div style={{ display:'flex', justifyContent:'center', gap:28, flexWrap:'wrap', marginBottom:56 }}>
          {['No credit card to start','Coins never expire','Cancel monthly plan anytime','Naira pricing — no FX surprises'].map(t => (
            <div key={t} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ color:TEAL, fontSize:12 }}>✓</span>
              <span style={{ fontSize:13, color:MUTED }}>{t}</span>
            </div>
          ))}
        </div>

        {/* ── What coins actually buy ── */}
        <div style={{ background:A, borderRadius:20, border:`1px solid ${BDR}`, padding:32, marginBottom:40 }}>
          <h3 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:700, color:W, marginBottom:6 }}>
            What do coins actually buy?
          </h3>
          <p style={{ fontSize:14, color:MUTED, marginBottom:28 }}>
            Every tool costs coins — here is the exact breakdown so you can plan your usage.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
            {COIN_EXAMPLES.map(({ cat, examples }) => (
              <div key={cat}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:TEAL, marginBottom:14 }}>
                  {cat}
                </p>
                {examples.filter(e => e.t).map(({ t, c }) => (
                  <div key={t} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                    <span style={{ fontSize:13, color:DIM, lineHeight:1.4, paddingRight:8 }}>{t}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:GL, whiteSpace:'nowrap' }}>⊙ {c}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop:24, padding:'14px 18px', background:`${TEAL}08`, border:`1px solid ${TEAL}20`, borderRadius:12 }}>
            <p style={{ fontSize:13.5, color:TEAL, lineHeight:1.65 }}>
              <strong>Starter plan example:</strong> 250 coins = ~16 captions + 5 WhatsApp campaigns + 2 strategy plans + 5 designs. That's a full month of consistent marketing output.
            </p>
          </div>
          <div style={{ marginTop:10, padding:'14px 18px', background:`${GL}06`, border:`1px solid ${GL}20`, borderRadius:12 }}>
            <p style={{ fontSize:13.5, color:GL, lineHeight:1.65 }}>
              <strong>Growth plan example:</strong> 600 coins = ~40 captions + 10 campaigns + 5 strategy plans + 10 Premium designs + 1 Full Competitor Intel session. Everything you need in a month.
            </p>
          </div>
        </div>

        {/* ── Full comparison table toggle ── */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <button onClick={() => setShowCompare(!showCompare)} className="toggle-btn"
            style={{ background:showCompare?`${TEAL}15`:FAINT, border:`1px solid ${showCompare?TEAL+'40':BDR}`, color:showCompare?TEAL:MUTED }}>
            {showCompare ? '▲ Hide full comparison' : '▼ See full feature comparison'}
          </button>
        </div>

        {/* ── Comparison table ── */}
        {showCompare && (
          <div className="compare-table" style={{ overflowX:'auto', marginBottom:48 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
              <thead>
                <tr>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', width:'45%', borderBottom:`1px solid ${BDR}` }}>Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{ textAlign:'center', padding:'12px 8px', borderBottom:`1px solid ${BDR}`, minWidth:100 }}>
                      <span style={{ fontSize:12, fontWeight:800, color:p.color }}>{p.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map(sec => (
                  <React.Fragment key={sec}>
                    <tr>
                      <td colSpan={4} style={{ padding:'18px 16px 8px', fontSize:10.5, fontWeight:800, color:TEAL, letterSpacing:'1.5px', textTransform:'uppercase' }}>
                        {sec}
                      </td>
                    </tr>
                    {COMPARE.filter(r => r.section === sec).map(row => (
                      <tr key={row.feature} style={{ borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                        <td style={{ padding:'10px 16px', fontSize:13.5, color:DIM, lineHeight:1.5 }}>
                          {row.feature}
                        </td>
                        <td style={{ textAlign:'center', padding:'10px 8px' }}>
                          <div style={{ display:'flex', justifyContent:'center' }}><CellValue v={row.free}/></div>
                        </td>
                        <td style={{ textAlign:'center', padding:'10px 8px' }}>
                          <div style={{ display:'flex', justifyContent:'center' }}><CellValue v={row.starter}/></div>
                        </td>
                        <td style={{ textAlign:'center', padding:'10px 8px', background:'rgba(224,152,24,0.04)' }}>
                          <div style={{ display:'flex', justifyContent:'center' }}><CellValue v={row.growth}/></div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── FAQ ── */}
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <h3 style={{ fontFamily:"'Georgia',serif", fontSize:26, fontWeight:700, color:W, marginBottom:32, textAlign:'center' }}>
            Common questions
          </h3>
          {[
            { q:'What happens when my coins run out?',          a:'You can top up coins at any time from your billing page — coin packs start from ₦3,000. Coins never expire and roll over month to month, so they accumulate if you don\'t use them all.' },
            { q:'Can I run tools on the Free plan after my one free run?', a:'After the free tool run you\'ll need coins to generate more outputs. You can purchase a coin top-up pack without committing to a monthly plan, or upgrade to Starter or Growth for a monthly coin allowance.' },
            { q:'What is the difference between Standard and Premium design?', a:'Standard design uses gpt-image-2 (OpenAI\'s current image model) at medium quality — excellent for most outputs. Premium uses Gemini Imagen 3 which delivers higher resolution, more photorealistic outputs, and better brand consistency. Premium requires the Growth plan.' },
            { q:'Can I switch plans?',                          a:'Yes — upgrade, downgrade, or cancel at any time from your billing page. If you upgrade mid-month, you\'ll be prorated. If you downgrade, the change takes effect at the next billing cycle.' },
            { q:'What is the SME Club?',                       a:'SME Club is a library of expert-led business and marketing sessions — video content, resource packs, and certificates — created specifically for Nigerian small business owners. New sessions publish every week. It\'s included in the Growth plan.' },
            { q:'How does the team workspace work?',            a:'Growth plan includes a shared workspace for up to 3 team members. Each member gets access to all tools, the shared coin pool, and your brand DNA settings. Only the account owner can manage billing.' },
            { q:'Are the prices in Nigerian Naira?',            a:'Yes — all pricing is in NGN. No FX conversion, no dollar pricing that changes with the exchange rate. What you see is what you pay.' },
          ].map(faq => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a}/>
          ))}
        </div>
      </div>
    </section>
  )
}
