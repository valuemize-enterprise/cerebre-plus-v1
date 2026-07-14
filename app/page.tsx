// /app/page.tsx — Cerebre Plus Landing Page
// Images go in /public/images/:
//   hero-dashboard.png      (man with laptop — Image 1)
//   founder-woman.png       (confident woman in store — Image 2)
//   businesses-collage.png  (8-person grid — Image 3)
'use client'
import Link   from 'next/link'
import Image  from 'next/image'
import { PricingSection } from '@/components/marketing/PricingSection'
import { Check, ChevronDown, ChevronRight, ChevronUp, Crown, Star, X, Zap } from 'lucide-react'
import { PLANS, PLAN_FEATURES, type PlanId } from '@/lib/coins/economy'
import { useState } from 'react'

const A = '#060C1A'   // deep space navy — odd sections
const B = '#0B1F3A'   // mid navy       — even sections


const GOLD = '#E09818'
const GL = '#F5B830'
const TEAL = '#12D4B4'
const VOID = '#06080E'
const MUTED = 'rgba(205,217,236,0.35)'

const PLAN_ICON: Record<string, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  starter: <Star className="h-5 w-5" />,
  growth: <Crown className="h-5 w-5" />,
}

function LandingPlanCard({ planId }: { planId: PlanId }) {
  const plan = PLANS[planId]
  const features = PLAN_FEATURES[planId]
  const featured = planId === 'growth'
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      background: featured ? 'linear-gradient(160deg,#130E00,#1C1600,#090F1E)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${featured ? GOLD + '55' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 20, overflow: 'hidden', position: 'relative',
      boxShadow: featured ? `0 0 60px ${GOLD}0A` : 'none',
    }}>
      {featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />}

      <div style={{ padding: '26px 22px' }}>
        {plan.badge && (
          <div style={{ display: 'inline-block', marginBottom: 14, background: `linear-gradient(135deg,${GOLD},${GL})`, color: VOID, fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '1px' }}>
            {plan.badge}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ color: GOLD }}>{PLAN_ICON[planId]}</span>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 700, color: '#EBF2FC' }}>{plan.name}</span>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(205,217,236,0.55)', lineHeight: 1.55, marginBottom: 16, fontStyle: 'italic' }}>
          {features.tagline}
        </p>

        <div style={{ marginBottom: plan.monthlyEq ? 4 : 14 }}>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: planId === 'free' ? 40 : 46, fontWeight: 900, color: planId === 'free' ? TEAL : GL, lineHeight: 1 }}>
            {plan.priceLabel}
          </span>
          {plan.price > 0 && <span style={{ fontSize: 13, color: MUTED, marginLeft: 5 }}>/year</span>}
        </div>
        {plan.monthlyEq && (
          <p style={{ fontSize: 11.5, color: MUTED, marginBottom: 14, fontFamily: 'monospace' }}>
            = {plan.monthlyEq} equivalent
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${GL}12`, border: `1px solid ${GL}28`, borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
          <span style={{ fontSize: 20 }}>🪙</span>
          <div>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: GL, lineHeight: 1 }}>{plan.coins}</div>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' as const }}>
              Cerebre Coins · {planId === 'free' ? '30 days' : 'Full year'}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 5 }}>This plan is for</p>
          <p style={{ fontSize: 13, color: 'rgba(205,217,236,0.72)', lineHeight: 1.5 }}>{features.forWho}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {features.highlighted.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, fontWeight: 600, color: '#EBF2FC', alignItems: 'flex-start' }}>
              <span style={{ color: GL, fontSize: 12, marginTop: 2, flexShrink: 0 }}>★</span>{f}
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: GL, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, marginBottom: open ? 12 : 0, fontFamily: 'inherit' }}
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? 'Hide full feature list' : 'See everything included'}
        </button>

        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
            {features.included.map((f, i) => {
              const isSME = f.startsWith('🌟')
              const isSup = f.startsWith('🚀')
              const indent = f.startsWith('   ')
              return (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: indent ? 12 : 13, color: isSME ? GL : isSup ? TEAL : 'rgba(205,217,236,0.72)', alignItems: 'flex-start', paddingLeft: indent ? 8 : 0 }}>
                  {!isSME && !isSup && <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: TEAL }} />}
                  {isSME && <span style={{ fontSize: 10, marginTop: 3, flexShrink: 0 }}>🌟</span>}
                  {isSup && <span style={{ fontSize: 10, marginTop: 3, flexShrink: 0 }}>🚀</span>}
                  <span>{f.replace(/^(🌟|🚀)\s*/, '').replace(/^   /, '')}</span>
                </div>
              )
            })}
            {features.notIncluded.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'rgba(205,217,236,0.3)', alignItems: 'flex-start' }}>
                <X className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'rgba(205,217,236,0.2)' }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        <Link
          href={planId === 'free' ? '/signup' : `/signup?plan=${planId}`}
          style={{
            width: '100%', padding: 14, borderRadius: 10,
            fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'flex', justifyContent:"center", alignItems:"center", textAlign: 'center',
            fontFamily: 'inherit',
            background: planId === 'free' ? 'rgba(255,255,255,0.04)' : featured ? `linear-gradient(135deg,${GOLD},${GL})` : 'rgba(255,255,255,0.07)',
            color: planId === 'free' ? MUTED : featured ? VOID : '#EBF2FC',
            border: planId === 'free' ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}
        >
          {planId === 'free' ? 'Activate Free Trial' : `Start ${plan.name} — ${plan.priceLabel}/yr `} <ChevronRight />
        </Link>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', background:A, color:'#EBF2FC', overflowX:'hidden' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#E09818;color:#060C1A}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .fade1{animation:fadeUp .7s ease both}
        .fade2{animation:fadeUp .7s .15s ease both}
        .fade3{animation:fadeUp .7s .28s ease both}
        .cta-main{background:linear-gradient(135deg,#E09818,#F5B830);color:#060C1A;transition:all .2s}
        .cta-main:hover{background:linear-gradient(135deg,#F5B830,#FFD055); color:#060C1A;transform:translateY(-2px);box-shadow:0 14px 40px rgba(224,152,24,0.4)}
        .cta-ghost:hover{background:rgba(224,152,24,0.1);border-color:rgba(224,152,24,0.35)!important;color:#EBF2FC!important}
        .fcard{transition:all .22s}
        .fcard:hover{border-color:rgba(18,212,180,0.35)!important;transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.3)}
        .chip:hover{background:rgba(18,212,180,0.18)!important;border-color:rgba(18,212,180,0.4)!important}
        .footer-link{font-size:13.5px;color:rgba(235,242,252,0.42);text-decoration:none;transition:color .15s}
        .footer-link:hover{color:#EBF2FC}
        a.nav-link{font-size:13.5px;color:rgba(235,242,252,0.55);text-decoration:none;font-weight:500;transition:color .15s}
        a.nav-link:hover{color:#EBF2FC}
        @media(max-width:900px){
          .hero-wrap{flex-direction:column!important}
          .hero-img{width:100%!important;height:400px!important;flex:none!important}
          .hero-txt{width:100%!important;padding:52px 24px!important;flex:none!important}
          .two-col,.two-col-r{flex-direction:column!important;gap:44px!important}
          .grid-3{grid-template-columns:1fr 1fr!important}
          .grid-price{grid-template-columns:1fr!important}
          .stat-row{flex-wrap:wrap!important;gap:28px!important;justify-content:center!important}
          .steps{flex-direction:column!important;gap:36px!important}
          .steps-line{display:none!important}
          .nav-links{display:none!important}
          h1.hero-h{font-size:38px!important}
        }
        @media(max-width:540px){
          h1.hero-h{font-size:30px!important}
          .grid-3{grid-template-columns:1fr!important}
          .hero-img{height:300px!important}
          section{padding-left:18px!important;padding-right:18px!important}
        }
      `}</style>

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,12,26,0.88)',backdropFilter:'blur(22px)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 36px',height:66,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:"'Georgia',serif",fontSize:20,fontWeight:900,letterSpacing:1,color:'#EBF2FC'}}>
            CEREBRE <span style={{color:'#F5B830'}}>PLUS</span>
          </span>
          <div className="nav-links" style={{display:'flex',gap:32}}>
            {[['Tools','#tools'],['How it works','#how'],['Pricing','#pricing'],['SME Club','#sme'],['Blog','/blog']].map(([l,h])=>(
              <a key={l} href={h} className="nav-link">{l}</a>
            ))}
          </div>
          <div style={{display:'flex',gap:10}}>
            <Link href="/login" style={{padding:'8px 18px',borderRadius:8,fontSize:13.5,fontWeight:600,color:'rgba(235,242,252,0.65)',textDecoration:'none',border:'1px solid rgba(255,255,255,0.12)',transition:'all .18s'}} className="cta-ghost">
              Log in
            </Link>
            <Link href="/signup" className="cta-main" style={{padding:'8px 22px',borderRadius:8,fontSize:13.5,fontWeight:700,textDecoration:'none',display:'flex'}}>
              <span>Start free</span> <ChevronRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ §1 HERO ── bg A ════════════════════════════════════ */}
      <section style={{background:A,minHeight:'92vh',display:'flex',alignItems:'stretch'}}>
        <div className="hero-wrap" style={{display:'flex',width:'100%'}}>

          {/* Left — text */}
          <div className="hero-txt" style={{flex:'0 0 45%',display:'flex',flexDirection:'column',justifyContent:'center',padding:'64px 52px 64px 80px'}}>
            <div className="fade1" style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:26}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#12D4B4',display:'inline-block'}}/>
              <span style={{fontSize:11.5,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#12D4B4'}}>
                AI Marketing for Nigerian Businesses
              </span>
            </div>

            <h1 className="fade2 hero-h" style={{fontFamily:"'Georgia',serif",fontSize:54,fontWeight:900,lineHeight:1.08,color:'#EBF2FC',marginBottom:26}}>
              Your entire<br/>
              marketing team<br/>
              <span style={{color:'#F5B830'}}>at a fraction<br/>of the cost.</span>
            </h1>

            <p className="fade3" style={{fontSize:17,lineHeight:1.8,color:'rgba(235,242,252,0.6)',maxWidth:400,marginBottom:42}}>
              40+ AI tools that write your captions, build your campaigns, design your visuals, and plan your 60-day strategy, built for Nigerian SMEs, ready in 60 seconds.
            </p>

            <div className="fade3" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <Link href="/signup" className="cta-main" style={{display:'flex',alignItems:'center',gap:8,padding:'15px 30px',borderRadius:12,fontWeight:800,fontSize:15,textDecoration:'none',boxShadow:'0 8px 28px rgba(224,152,24,0.3)'}}>
                Run your first tool free <ChevronRight />
              </Link>
              <a href="#how" style={{display:'inline-flex',alignItems:'center',gap:7,padding:'15px 24px',borderRadius:12,fontWeight:600,fontSize:15,color:'rgba(235,242,252,0.65)',textDecoration:'none',border:'1px solid rgba(255,255,255,0.13)'}} className="cta-ghost">
                See how it works
              </a>
            </div>
            <p style={{marginTop:26,fontSize:12.5,color:'rgba(235,242,252,0.28)',letterSpacing:'.3px'}}>
              No credit card · First tool free · Done in 60 seconds
            </p>
          </div>

          {/* Right — image full bleed */}
          <div className="hero-img" style={{flex:'0 0 55%',position:'relative',minHeight:600,overflow:'hidden'}}>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:180,zIndex:2,background:`linear-gradient(to right,${A},transparent)`}}/>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:120,zIndex:2,background:`linear-gradient(to top,${A},transparent)`}}/>
            <Image
              src="/images/hero-dashboard.png"
              alt="Nigerian business owner using Cerebre Plus on a laptop"
              fill
              priority
              style={{objectFit:'cover',objectPosition:'center top'}}
            />
          </div>
        </div>
      </section>

      {/* ══ STAT STRIP ── bg B ═════════════════════════════════ */}
      <section style={{background:B,borderTop:'1px solid rgba(255,255,255,0.06)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="stat-row" style={{maxWidth:1100,margin:'0 auto',padding:'44px 36px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
          {[{n:'40+',l:'AI marketing tools'},{n:'12',l:'Industries covered'},{n:'60s',l:'To your first output'},{n:'100%',l:'Built for Nigeria'},{n:'₦0',l:'To start'}].map(({n,l})=>(
            <div key={l} style={{textAlign:'center',flex:'1 1 0'}}>
              <p style={{fontFamily:"'Georgia',serif",fontSize:38,fontWeight:900,color:'#F5B830',lineHeight:1}}>{n}</p>
              <p style={{fontSize:12.5,color:'rgba(235,242,252,0.45)',marginTop:7,fontWeight:500}}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker */}
      <div style={{background:A,overflow:'hidden',padding:'13px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{display:'flex',animation:'ticker 35s linear infinite',width:'max-content'}}>
          {[0,1].map(i=>(
            <span key={i} style={{display:'flex'}}>
              {['CaptionCraft','StrategyBrain','WhatsApp Campaign Builder','AdScribe','Sprint Blueprint','Content Calendar','Competitor Intel 2.0','Design Studio','CopyBrain AI','EmailScribe','VideoScriptForge','LaunchPad','BrandPositioner','AudienceProfiler','SME Club'].map(t=>(
                <span key={t} style={{padding:'0 28px',fontSize:12.5,fontWeight:600,color:'rgba(235,242,252,0.25)',letterSpacing:'.5px',whiteSpace:'nowrap',borderRight:'1px solid rgba(255,255,255,0.06)'}}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ §3 PROBLEM ── bg A ═════════════════════════════════ */}
      <section style={{background:A,padding:'104px 36px'}}>
        <div className="two-col" style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:68,alignItems:'center'}}>

          {/* Image — collage */}
          <div style={{flex:'0 0 47%',position:'relative',borderRadius:22,overflow:'hidden',aspectRatio:'4/5'}}>
            <Image
              src="/images/businesses-collage.png"
              alt="Nigerian business owners across fashion, food, tech, logistics and more"
              fill
              style={{objectFit:'cover'}}
            />
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:28,background:'linear-gradient(to top,rgba(6,12,26,0.95),transparent)'}}>
              <p style={{fontSize:13,color:'rgba(235,242,252,0.5)',fontStyle:'italic'}}>
                Fashion · Food · Tech · Real estate · Logistics · Healthcare · and more
              </p>
            </div>
          </div>

          {/* Text */}
          <div style={{flex:1}}>
            <p style={{fontSize:11.5,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#12D4B4',marginBottom:20}}>
              The real problem
            </p>
            <h2 style={{fontFamily:"'Georgia',serif",fontSize:42,fontWeight:900,lineHeight:1.14,color:'#EBF2FC',marginBottom:34}}>
              Most Nigerian businesses have a great product —{' '}
              <span style={{color:'#F5B830'}}>and terrible marketing.</span>
            </h2>
            {[
              ['✗','Hiring a marketing team costs ₦1.5M+ per month'],
              ['✗','Content agencies charge ₦300K and miss your voice completely'],
              ['✗','Generic AI tools don\'t understand Nigerian buyer psychology'],
              ['✗','You post every day and still get zero enquiries'],
              ['✗','You have no strategy — just scattered, expensive activity'],
            ].map(([ico,text])=>(
              <div key={text} style={{display:'flex',gap:13,alignItems:'flex-start',marginBottom:15}}>
                <span style={{fontSize:14,color:'rgba(239,68,68,0.65)',fontWeight:800,flexShrink:0,marginTop:2}}>{ico}</span>
                <p style={{fontSize:15.5,color:'rgba(235,242,252,0.62)',lineHeight:1.65}}>{text}</p>
              </div>
            ))}
            <div style={{marginTop:38,padding:'20px 24px',borderLeft:'3px solid #F5B830',background:'rgba(245,184,48,0.05)',borderRadius:'0 12px 12px 0'}}>
              <p style={{fontSize:15,color:'#F5B830',fontWeight:600,lineHeight:1.65}}>
                "Nigerian businesses need marketing that understands salary cycles, WhatsApp culture, and Awoof psychology — not Western templates with a naira sign added."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ §4 HOW IT WORKS ── bg B ════════════════════════════ */}
      <section id="how" style={{background:B,padding:'104px 36px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:68}}>
            <p style={{fontSize:11.5,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#12D4B4',marginBottom:16}}>
              Simple from day one
            </p>
            <h2 style={{fontFamily:"'Georgia',serif",fontSize:46,fontWeight:900,color:'#EBF2FC',lineHeight:1.12}}>
              From signup to output<br/>
              <span style={{color:'#F5B830'}}>in under 3 minutes.</span>
            </h2>
          </div>

          <div className="steps" style={{display:'flex',position:'relative',gap:0}}>
            <div className="steps-line" style={{position:'absolute',top:30,left:'14%',right:'14%',height:1,background:'rgba(224,152,24,0.18)'}}/>
            {[
              {n:'01',title:'Tell us about your business',desc:'A 3-minute setup. Industry, city, customers, price range, what makes you different. The AI remembers everything from this moment forward.',color:'#E09818'},
              {n:'02',title:'Pick a tool and open it',desc:'40+ tools across copywriting, strategy, design, and analytics. Personalised suggestions appear before you type a single word.',color:'#12D4B4'},
              {n:'03',title:'Get output that sounds like you',desc:'Every output references your actual brand — your name, your city, your customers, your pricing. Edit what you want, publish the rest.',color:'#8B7FFF'},
            ].map(({n,title,desc,color})=>(
              <div key={n} style={{flex:1,padding:'0 22px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>
                <div style={{width:58,height:58,borderRadius:'50%',zIndex:1,background:B,border:`2px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Georgia',serif",fontSize:18,fontWeight:900,color}}>
                  {n}
                </div>
                <h3 style={{fontFamily:"'Georgia',serif",fontSize:21,fontWeight:700,color:'#EBF2FC',lineHeight:1.3}}>{title}</h3>
                <p style={{fontSize:14.5,color:'rgba(235,242,252,0.52)',lineHeight:1.75,maxWidth:290}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ §5 TOOLS ── bg A ═══════════════════════════════════ */}
      <section id="tools" style={{background:A,padding:'104px 36px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:68}}>
            <p style={{fontSize:11.5,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#12D4B4',marginBottom:16}}>
              40+ tools · 6 categories
            </p>
            <h2 style={{fontFamily:"'Georgia',serif",fontSize:46,fontWeight:900,color:'#EBF2FC',lineHeight:1.12}}>
              Everything your marketing needs.<br/>
              <span style={{color:'#F5B830'}}>Nothing you don't.</span>
            </h2>
          </div>

          <div className="grid-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {[
              {ico:'✍',cat:'Copywriting',tools:'CaptionCraft · AdScribe · CopyBrain AI · BlogBrain',desc:'Captions, ads, emails, and sales copy — in your voice, for Nigerian buyers who respond to local psychology.',accent:'#E09818'},
              {ico:'🧠',cat:'Strategy',tools:'StrategyBrain · Sprint Blueprint · CampaignClock',desc:'A complete 60-day execution plan calculated from your actual numbers. Not a template — a real strategy.',accent:'#12D4B4',badge:'Flagship'},
              {ico:'📱',cat:'WhatsApp & Social',tools:'WhatsApp Campaign Builder · Content Calendar · StoryPlanner',desc:'Broadcast sequences, 30-day content plans, and story scripts built for how Nigerians actually buy.',accent:'#25D366'},
              {ico:'🎨',cat:'Design Studio',tools:'11 visual tools — posts, flyers, logos, banners',desc:'Social posts, YouTube thumbnails, festive banners, and logos generated with your brand colours and logo overlay.',accent:'#E1306C'},
              {ico:'🎯',cat:'Competitor Intel 2.0',tools:'Social audit · Ad intelligence · Gap mapping',desc:'See what your competitors post, spend, and run as ads — then find the exact gaps you can take from them.',accent:'#8B7FFF'},
              {ico:'👑',cat:'SME Club',tools:'Weekly expert sessions & masterclasses',desc:'Training from people who actually build Nigerian businesses — not theories, not Western case studies.',accent:'#F5B830'},
            ].map(({ico,cat,tools,desc,accent,badge})=>(
              <div key={cat} className="fcard" style={{background:B,border:'1px solid rgba(255,255,255,0.07)',borderRadius:18,padding:26,display:'flex',flexDirection:'column',gap:14,position:'relative'}}>
                {badge&&<span style={{position:'absolute',top:16,right:16,fontSize:9.5,fontWeight:800,letterSpacing:'1.5px',padding:'3px 9px',borderRadius:20,background:`${accent}20`,color:accent,border:`1px solid ${accent}40`}}>{badge.toUpperCase()}</span>}
                <div style={{fontSize:30}}>{ico}</div>
                <div>
                  <p style={{fontSize:10.5,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:accent,marginBottom:8}}>{cat}</p>
                  <p style={{fontSize:12.5,fontWeight:600,color:'rgba(235,242,252,0.75)',marginBottom:10,lineHeight:1.5}}>{tools}</p>
                  <p style={{fontSize:13.5,color:'rgba(235,242,252,0.48)',lineHeight:1.7}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ §6 AI SUGGESTIONS ── bg B ══════════════════════════ */}
      <section style={{background:B,padding:'104px 36px'}}>
        <div className="two-col" style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:72,alignItems:'center'}}>
          {/* Text + mockup */}
          <div style={{flex:1}}>
            <p style={{fontSize:11.5,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#12D4B4',marginBottom:20}}>The difference</p>
            <h2 style={{fontFamily:"'Georgia',serif",fontSize:42,fontWeight:900,lineHeight:1.14,color:'#EBF2FC',marginBottom:24}}>
              We finish your sentences<br/><span style={{color:'#F5B830'}}>before you write them.</span>
            </h2>
            <p style={{fontSize:16,color:'rgba(235,242,252,0.58)',lineHeight:1.82,marginBottom:38,maxWidth:460}}>
              Every tool reads your business profile and pre-fills suggestions that sound like a senior marketing strategist spent 30 minutes studying your brand — not a generic list, not a template.
            </p>
            {/* Suggestion mockup */}
            <div style={{background:'rgba(6,12,26,0.65)',borderRadius:16,padding:22,border:'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <span style={{fontSize:13}}>🧠</span>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',color:'rgba(18,212,180,0.7)'}}>Ideas for Amara's Fashion House</span>
              </div>
              {[
                'Show how we turn ankara into a finished dress in 5 days — guaranteed delivery in Lagos',
                'Why 400 Lagos women have switched from fast fashion imports to our custom pieces',
                'The outfit mistake most Nigerian women make at events — and exactly how we fix it',
              ].map((s,i)=>(
                <div key={i} style={{padding:'10px 14px',borderRadius:10,marginBottom:8,background:'rgba(18,212,180,0.07)',border:'1px solid rgba(18,212,180,0.2)',fontSize:13.5,color:'rgba(235,242,252,0.75)',lineHeight:1.58,display:'flex',alignItems:'flex-start',gap:9,cursor:'pointer'}}>
                  <span style={{color:'#12D4B4',fontSize:11,marginTop:3,flexShrink:0}}>✦</span>{s}
                </div>
              ))}
              <p style={{fontSize:11,color:'rgba(235,242,252,0.22)',marginTop:10,fontStyle:'italic'}}>Tap any suggestion to fill the field instantly</p>
            </div>
          </div>

          {/* Feature pills */}
          <div style={{flex:'0 0 38%',display:'flex',flexDirection:'column',gap:22}}>
            {[
              {ico:'🎯',title:'Knows your industry',desc:'Ideas built for fashion, food, real estate, fintech, logistics and 7 more industries — not adapted from Western examples.'},
              {ico:'📍',title:'Knows your city',desc:'Lagos. Abuja. Port Harcourt. Your outputs reference your market. Not generic "your city" placeholder text.'},
              {ico:'👥',title:'Knows your customers',desc:'Your target customer is saved from onboarding. Every output speaks directly to the people who actually buy from you.'},
              {ico:'💰',title:'Knows your price range',desc:'No suggestions that position you too cheap or too premium for your actual customers. Context changes everything.'},
            ].map(({ico,title,desc})=>(
              <div key={title} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:42,height:42,borderRadius:10,background:'rgba(18,212,180,0.08)',border:'1px solid rgba(18,212,180,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                  {ico}
                </div>
                <div>
                  <p style={{fontSize:15,fontWeight:700,color:'#EBF2FC',marginBottom:5}}>{title}</p>
                  <p style={{fontSize:13.5,color:'rgba(235,242,252,0.48)',lineHeight:1.65}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ §7 PERSON / QUOTE ── bg A ══════════════════════════ */}
      <section style={{background:A,padding:'104px 36px'}}>
        <div className="two-col-r" style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:72,alignItems:'center'}}>
          {/* Quote */}
          <div style={{flex:1}}>
            <p style={{fontSize:11.5,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#F5B830',marginBottom:28}}>
              Built for businesses like yours
            </p>
            <p style={{fontFamily:"'Georgia',serif",fontSize:38,fontWeight:700,color:'#EBF2FC',lineHeight:1.32,marginBottom:34}}>
              "It felt like someone who actually knew my business wrote all of this — not a generic AI."
            </p>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:52}}>
              <div style={{width:46,height:46,borderRadius:'50%',background:'rgba(224,152,24,0.15)',border:'2px solid rgba(224,152,24,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:900,color:'#F5B830'}}>A</div>
              <div>
                <p style={{fontSize:14.5,fontWeight:700,color:'#EBF2FC'}}>Amara Okafor</p>
                <p style={{fontSize:13,color:'rgba(235,242,252,0.4)'}}>Fashion designer · Lagos Island</p>
              </div>
            </div>
            {[
              'First output runs completely free — no card required',
              'Every tool remembers your brand from the very first day',
              'Works on phone or desktop — optimised for Nigerian connectivity',
              'All outputs in plain language your customers actually use',
            ].map(item=>(
              <div key={item} style={{display:'flex',gap:11,alignItems:'flex-start',marginBottom:14}}>
                <span style={{color:'#12D4B4',fontSize:14,marginTop:2,flexShrink:0}}>✓</span>
                <p style={{fontSize:15,color:'rgba(235,242,252,0.58)',lineHeight:1.6}}>{item}</p>
              </div>
            ))}
          </div>

          {/* Image — founder woman */}
          <div style={{flex:'0 0 43%',position:'relative',borderRadius:22,overflow:'hidden',aspectRatio:'3/4'}}>
            <Image
              src="/images/founder-woman.png"
              alt="Confident Nigerian business owner in her fashion store"
              fill
              style={{objectFit:'cover',objectPosition:'center top'}}
            />
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:26,background:'linear-gradient(to top,rgba(6,12,26,0.94),transparent)'}}>
              <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                {['Fashion','Custom pieces','Lagos','₦45,000/outfit'].map(t=>(
                  <span key={t} className="chip" style={{fontSize:11.5,padding:'4px 12px',borderRadius:20,background:'rgba(224,152,24,0.14)',border:'1px solid rgba(224,152,24,0.28)',color:'#F5B830',fontWeight:600,transition:'all .15s'}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══ §8 PRICING — full component with feature table & FAQ ═══════════════════ */}
      <section id="pricing" style={{ background: B, padding: '104px 36px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#12D4B4', marginBottom: 16 }}>Simple pricing</p>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 46, fontWeight: 900, color: '#EBF2FC', lineHeight: 1.12 }}>
              Start free.<br /><span style={{ color: '#F5B830' }}>Scale when you're ready.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(235,242,252,0.5)', marginTop: 18, lineHeight: 1.75 }}>
              Coins power every tool. Buy what you need. They never expire.
            </p>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#EBF2FC', marginBottom: 16 }}>Choose your plan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(268px,1fr))', gap: 14, marginBottom: 48 }}>
            {(['free', 'starter', 'growth'] as PlanId[]).map(pid => (
              <LandingPlanCard key={pid} planId={pid} />
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 26, fontSize: 13, color: 'rgba(235,242,252,0.25)' }}>
            All prices in Nigerian Naira · Coins never expire · Cancel anytime
          </p>
        </div>
      </section>

            {/* ══ §9 FINAL CTA ── bg A ═══════════════════════════════ */}
      <section style={{background:A,padding:'110px 36px',textAlign:'center'}}>
        <div style={{maxWidth:680,margin:'0 auto'}}>
          <p style={{fontSize:11.5,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#12D4B4',marginBottom:22}}>
            The time is now
          </p>
          <h2 style={{fontFamily:"'Georgia',serif",fontSize:54,fontWeight:900,color:'#EBF2FC',lineHeight:1.08,marginBottom:22}}>
            Your competitors are<br/>already using AI.<br/>
            <span style={{color:'#F5B830'}}>Will you?</span>
          </h2>
          <p style={{fontSize:17,color:'rgba(235,242,252,0.52)',lineHeight:1.82,marginBottom:48}}>
            Start with one free tool. No card. No commitment.<br/>
            Your first Cerebre Plus output — in under 60 seconds.
          </p>
          <Link href="/signup" className="cta-main" style={{display:'inline-flex',alignItems:'center',gap:10,padding:'18px 44px',borderRadius:14,fontWeight:800,fontSize:17,textDecoration:'none',boxShadow:'0 14px 44px rgba(224,152,24,0.32)'}}>
            Start free — no card needed <ChevronRight />
          </Link>
          <p style={{marginTop:22,fontSize:13,color:'rgba(235,242,252,0.25)'}}>
            40+ tools · Nigerian businesses · First output in 60 seconds
          </p>
        </div>
      </section>

      {/* ══ FOOTER ─────────────────────────────────────────────── */}
      <footer style={{background:B,borderTop:'1px solid rgba(255,255,255,0.06)',padding:'56px 36px 36px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:40}}>
          <div>
            <span style={{fontFamily:"'Georgia',serif",fontSize:19,fontWeight:900,letterSpacing:1,color:'#EBF2FC'}}>CEREBRE <span style={{color:'#F5B830'}}>PLUS</span></span>
            <p style={{fontSize:13.5,color:'rgba(235,242,252,0.32)',marginTop:12,maxWidth:240,lineHeight:1.75}}>
              AI marketing for Nigerian businesses. 40+ tools. One platform.
            </p>
            <p style={{fontSize:12,color:'rgba(235,242,252,0.2)',marginTop:18}}>Lagos, Nigeria · cerebreplus.com</p>
          </div>
          <div style={{display:'flex',gap:52,flexWrap:'wrap'}}>
            {[
              {label:'Product',links:['Tools','Pricing','SME Club','Competitor Intel','Design Studio','Sprint Blueprint']},
              {label:'Company',links:['About','Blog','Careers','Contact','Cerebre Media Africa']},
              {label:'Legal',links:['Privacy Policy','Terms of Service','Cookie Policy']},
            ].map(({label,links})=>(
              <div key={label}>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(235,242,252,0.28)',marginBottom:16}}>{label}</p>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {links.map(l=>(
                    <a key={l} href="#" className="footer-link">
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{maxWidth:1100,margin:'36px auto 0',paddingTop:24,borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <p style={{fontSize:12.5,color:'rgba(235,242,252,0.22)'}}>© 2026 Cerebre Media Africa. All rights reserved.</p>
          <p style={{fontSize:12.5,color:'rgba(235,242,252,0.22)'}}>Built in Lagos, Nigeria 🇳🇬</p>
        </div>
      </footer>
    </div>
  )
}
