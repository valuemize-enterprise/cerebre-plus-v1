// /app/page.tsx — Cerebre Plus Landing Page
// Updated August 2026 — Phase 1 + Phase 2 changes:
//   • Coin economy (no subscriptions, 70 free coins on signup)
//   • SME Club now free for every member
//   • Nav SME Club link → /club
'use client'
import Link  from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

const A    = '#060C1A'
const B    = '#0B1F3A'
const GOLD = '#E09818'
const GL   = '#F5B830'
const TEAL = '#12D4B4'
const VOID = '#06080E'
const MUTED = 'rgba(205,217,236,0.35)'
const DIM   = 'rgba(205,217,236,0.58)'


const WEEK = [
  { day: 'MON', label: 'Monday Money Move',  icon: '💰', color: GOLD,      desc: 'One action for your revenue — 3-min WhatsApp voice note.'     },
  { day: 'TUE', label: 'Tool Tuesday',        icon: '🛠️', color: TEAL,      desc: 'Live demo: a real business problem solved with a Cerebre tool.' },
  { day: 'WED', label: 'Hot Seat',            icon: '🔥', color: '#E84830', desc: 'One member\'s business diagnosed live — strategy and pricing.'  },
  { day: 'THU', label: 'Template Thursday',   icon: '📄', color: '#8B5CF6', desc: 'A professional template drops on the platform. Free download.'  },
  { day: 'FRI', label: 'Win Friday',          icon: '🏆', color: '#22C55E', desc: 'Members post results. Approved wins earn coins automatically.'  },
]

const RANKS = [
  { rank: 'Rookie',         pts: '0',    color: '#6B7280' },
  { rank: 'Builder',        pts: '100',  color: '#8B5CF6' },
  { rank: 'Operator',       pts: '400',  color: TEAL      },
  { rank: 'Growth Partner', pts: '1,000', color: GL       },
]

const TOOLS = [
  { ico: '✍',  cat: 'Copywriting',     tools: 'CaptionCraft · AdScribe · CopyBrain AI · BlogBrain',          desc: 'Captions, ads, emails, and sales copy — in your voice, for Nigerian buyers.',            accent: GOLD                  },
  { ico: '🧠', cat: 'Strategy',         tools: 'StrategyBrain · Sprint Blueprint · CampaignClock',            desc: 'A 60-day plan from your actual numbers. Not a template — a real strategy.',             accent: TEAL, badge: 'Flagship' },
  { ico: '📱', cat: 'WhatsApp & Social', tools: 'WhatsApp Campaign Builder · Content Calendar · StoryPlanner', desc: 'Broadcast sequences and plans built for how Nigerians actually buy.',                   accent: '#25D366'              },
  { ico: '🎨', cat: 'Design Studio',    tools: '11 visual tools — posts, flyers, logos, banners',             desc: 'Social posts, thumbnails, and banners with your brand colours and logo.',               accent: '#E1306C'              },
  { ico: '🎯', cat: 'Competitor Intel', tools: 'Social audit · Ad intelligence · Gap mapping',                desc: 'See what competitors post and spend — then find the gaps you can own.',                 accent: '#8B7FFF'              },
  { ico: '🌟', cat: 'SME Club',         tools: 'WhatsApp Community · Templates · Wins · Challenges',          desc: 'Weekly masterclasses, template drops, a wins board that earns you coins, and the Hot Seat.', accent: GL, badge: 'Free'   },
]

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', background: A, color: '#EBF2FC', overflowX: 'hidden' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#E09818;color:#060C1A}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .f1{animation:fadeUp .65s ease both}
        .f2{animation:fadeUp .65s .14s ease both}
        .f3{animation:fadeUp .65s .26s ease both}
        .cta-btn{background:linear-gradient(135deg,#E09818,#F5B830);color:#06080E;display:inline-flex;align-items:center;gap:8px;font-weight:800;border-radius:12px;text-decoration:none;transition:all .2s}
        .cta-btn:hover{filter:brightness(1.1);transform:translateY(-2px);box-shadow:0 14px 40px rgba(224,152,24,0.38)}
        .ghost-btn{border:1px solid rgba(255,255,255,0.14);color:rgba(235,242,252,0.65);text-decoration:none;border-radius:12px;display:inline-flex;align-items:center;gap:7px;font-weight:600;transition:all .18s}
        .ghost-btn:hover{background:rgba(224,152,24,0.1);border-color:rgba(224,152,24,0.35);color:#EBF2FC}
        .nav-a{font-size:13.5px;color:rgba(235,242,252,0.55);text-decoration:none;font-weight:500;transition:color .15s}
        .nav-a:hover{color:#EBF2FC}
        .t-card{transition:all .22s;border:1px solid rgba(255,255,255,0.07)}
        .t-card:hover{border-color:rgba(18,212,180,0.35)!important;transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.28)}
        .p-card{transition:all .22s}
        .p-card:hover{transform:translateY(-5px);box-shadow:0 20px 48px rgba(0,0,0,0.35)}
        .footer-a{font-size:13.5px;color:rgba(235,242,252,0.38);text-decoration:none;transition:color .15s}
        .footer-a:hover{color:#EBF2FC}
        @media(max-width:900px){
          .h-inner{flex-direction:column!important}
          .h-img{width:100%!important;height:420px!important;flex:none!important}
          .h-txt{padding:56px 24px!important;flex:none!important;width:100%!important}
          .two{flex-direction:column!important;gap:44px!important}
          .g3{grid-template-columns:1fr 1fr!important}
          .s-row{flex-direction:column!important;gap:36px!important}
          .s-line{display:none!important}
          .stat-r{flex-wrap:wrap!important;justify-content:center!important}
          .nav-links{display:none!important}
          .wk-g{grid-template-columns:1fr 1fr!important}
          .pk-g{grid-template-columns:1fr!important}
          .cl-g{grid-template-columns:1fr 1fr!important}
          h1.hh{font-size:36px!important}
        }
        @media(max-width:540px){
          h1.hh{font-size:28px!important}
          .g3{grid-template-columns:1fr!important}
          .wk-g{grid-template-columns:1fr!important}
          .cl-g{grid-template-columns:1fr!important}
          section{padding-left:18px!important;padding-right:18px!important}
          .h-img{height:300px!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,12,26,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 36px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/Cerebre_Plus_2.png" alt="Cerebre Plus" style={{ height: 46, width: 'auto' }} />
          <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
            {[['Tools', '#tools'], ['How it works', '#how'], ['SME Club', '/club'], ['Pricing', '#pricing'], ['Blog', '/blog']].map(([l, h]) => (
              <a key={l} href={h} className="nav-a">{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" className="ghost-btn" style={{ padding: '8px 18px', fontSize: 13.5 }}>Log in</Link>
            <Link href="/signup" className="cta-btn" style={{ padding: '8px 22px', fontSize: 13.5 }}>
              Start free · 70 coins <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: A, minHeight: '92vh', display: 'flex', alignItems: 'stretch' }}>
        <div className="h-inner" style={{ display: 'flex', width: '100%' }}>
          <div className="h-txt" style={{ flex: '0 0 46%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 52px 64px 80px' }}>
            <div className="f1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL, display: 'inline-block' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL }}>AI Marketing for Nigerian Businesses</span>
            </div>
            <h1 className="f2 hh" style={{ fontFamily: "'Georgia',serif", fontSize: 54, fontWeight: 900, lineHeight: 1.08, color: '#EBF2FC', marginBottom: 24 }}>
              Your entire<br />marketing team<br /><span style={{ color: GL }}>at a fraction<br />of the cost.</span>
            </h1>
            <p className="f3" style={{ fontSize: 17, lineHeight: 1.8, color: DIM, maxWidth: 400, marginBottom: 18 }}>
              40+ AI tools built for Nigerian SMEs — captions, strategy, visuals, competitor intel, and a free community that pushes you every week.
            </p>
            <div className="f3" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${GL}12`, border: `1px solid ${GL}28`, borderRadius: 12, padding: '10px 16px', marginBottom: 32, width: 'fit-content' }}>
              <span style={{ fontSize: 20 }}>🪙</span>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 800, color: GL, lineHeight: 1 }}>70 coins free on signup</p>
                <p style={{ fontSize: 11.5, color: MUTED }}>No card · No expiry · No subscription</p>
              </div>
            </div>
            <div className="f3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/signup" className="cta-btn" style={{ padding: '15px 30px', fontSize: 15, boxShadow: '0 8px 28px rgba(224,152,24,0.3)' }}>
                Run your first tool free <ChevronRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="ghost-btn" style={{ padding: '15px 24px', fontSize: 15 }}>See how it works</a>
            </div>
          </div>
          <div className="h-img" style={{ flex: '0 0 54%', position: 'relative', minHeight: 600, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 160, zIndex: 2, background: `linear-gradient(to right,${A},transparent)` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, zIndex: 2, background: `linear-gradient(to top,${A},transparent)` }} />
            <Image src="/images/hero-dashboard.png" alt="Nigerian business owner using Cerebre Plus" fill priority style={{ objectFit: 'cover', objectPosition: 'center top' }} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: B, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="stat-r" style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {[{ n: '40+', l: 'AI marketing tools' }, { n: '12', l: 'Industries covered' }, { n: '60s', l: 'To your first output' }, { n: '70', l: 'Free coins on signup' }, { n: '₦0', l: 'Subscription required' }].map(({ n, l }) => (
            <div key={l} style={{ textAlign: 'center', flex: '1 1 0' }}>
              <p style={{ fontFamily: "'Georgia',serif", fontSize: 38, fontWeight: 900, color: GL, lineHeight: 1 }}>{n}</p>
              <p style={{ fontSize: 12.5, color: 'rgba(235,242,252,0.45)', marginTop: 7, fontWeight: 500 }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: A, overflow: 'hidden', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', animation: 'ticker 38s linear infinite', width: 'max-content' }}>
          {[0, 1].map(i => (
            <span key={i} style={{ display: 'flex' }}>
              {['CaptionCraft', 'StrategyBrain', 'WhatsApp Campaign Builder', 'AdScribe', 'Sprint Blueprint', 'Content Calendar', 'Competitor Intel', 'Design Studio', 'CopyBrain AI', 'SME Club', 'Template Thursday', 'Win Friday', 'Challenges + Coins', 'Hot Seat Wednesday', 'EmailScribe'].map(t => (
                <span key={t} style={{ padding: '0 28px', fontSize: 12.5, fontWeight: 600, color: 'rgba(235,242,252,0.22)', letterSpacing: '.5px', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.05)' }}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section style={{ background: A, padding: '104px 36px' }}>
        <div className="two" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 68, alignItems: 'center' }}>
          <div style={{ flex: '0 0 46%', position: 'relative', borderRadius: 22, overflow: 'hidden', aspectRatio: '4/5' }}>
            <Image src="/images/businesses-collage.png" alt="Nigerian business owners" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 28, background: 'linear-gradient(to top,rgba(6,12,26,0.95),transparent)' }}>
              <p style={{ fontSize: 13, color: 'rgba(235,242,252,0.5)', fontStyle: 'italic' }}>Fashion · Food · Tech · Real estate · Logistics · Healthcare · and more</p>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 20 }}>The real problem</p>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 42, fontWeight: 900, lineHeight: 1.14, color: '#EBF2FC', marginBottom: 34 }}>
              Great product.<br /><span style={{ color: GL }}>Terrible marketing.</span>
            </h2>
            {[
              ['✗', 'Hiring a marketing team costs ₦1.5M+ per month'],
              ['✗', 'Agencies charge ₦300K and miss your voice completely'],
              ['✗', 'Generic AI tools don\'t understand Nigerian buyer psychology'],
              ['✗', 'You post every day and still get zero enquiries'],
              ['✗', 'You have no strategy — just scattered, expensive activity'],
            ].map(([ico, text]) => (
              <div key={text} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 15 }}>
                <span style={{ fontSize: 14, color: 'rgba(239,68,68,0.65)', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{ico}</span>
                <p style={{ fontSize: 15.5, color: DIM, lineHeight: 1.65 }}>{text}</p>
              </div>
            ))}
            <div style={{ marginTop: 36, padding: '20px 24px', borderLeft: `3px solid ${GL}`, background: `${GL}06`, borderRadius: '0 12px 12px 0' }}>
              <p style={{ fontSize: 15, color: GL, fontWeight: 600, lineHeight: 1.65 }}>
                "Nigerian businesses need marketing that understands salary cycles, WhatsApp culture, and Awoof psychology — not Western templates with a naira sign added."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: B, padding: '104px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 68 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 16 }}>Simple from day one</p>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 46, fontWeight: 900, color: '#EBF2FC', lineHeight: 1.12 }}>
              From signup to output<br /><span style={{ color: GL }}>in under 3 minutes.</span>
            </h2>
          </div>
          <div className="s-row" style={{ display: 'flex', position: 'relative' }}>
            <div className="s-line" style={{ position: 'absolute', top: 30, left: '14%', right: '14%', height: 1, background: 'rgba(224,152,24,0.18)' }} />
            {[
              { n: '01', title: 'Tell us about your business', desc: 'Industry, city, customers, price range. 3 minutes. The AI remembers everything from this moment on.', color: GOLD },
              { n: '02', title: 'Pick a tool and open it', desc: '40+ tools across copywriting, strategy, design, and analytics. Personalised suggestions appear before you type a word.', color: TEAL },
              { n: '03', title: 'Get output that sounds like you', desc: 'Every output references your actual brand — your name, city, customers, pricing. Edit what you want, publish the rest.', color: '#8B7FFF' },
            ].map(({ n, title, desc, color }) => (
              <div key={n} style={{ flex: 1, padding: '0 22px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 58, height: 58, borderRadius: '50%', zIndex: 1, background: B, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Georgia',serif", fontSize: 18, fontWeight: 900, color }}>
                  {n}
                </div>
                <h3 style={{ fontFamily: "'Georgia',serif", fontSize: 21, fontWeight: 700, color: '#EBF2FC', lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: 14.5, color: 'rgba(235,242,252,0.52)', lineHeight: 1.75, maxWidth: 290 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ background: A, padding: '104px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 68 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 16 }}>40+ tools · 6 categories</p>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 46, fontWeight: 900, color: '#EBF2FC', lineHeight: 1.12 }}>
              Everything your marketing needs.<br /><span style={{ color: GL }}>Nothing you don't.</span>
            </h2>
          </div>
          <div className="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {TOOLS.map(({ ico, cat, tools, desc, accent, badge }) => (
              <div key={cat} className="t-card" style={{ background: B, borderRadius: 18, padding: 26, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
                {badge && (
                  <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 9.5, fontWeight: 800, letterSpacing: '1.5px', padding: '3px 9px', borderRadius: 20, background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                    {badge.toUpperCase()}
                  </span>
                )}
                <div style={{ fontSize: 30 }}>{ico}</div>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>{cat}</p>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(235,242,252,0.75)', marginBottom: 10, lineHeight: 1.5 }}>{tools}</p>
                  <p style={{ fontSize: 13.5, color: 'rgba(235,242,252,0.48)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI PERSONALISATION */}
      <section style={{ background: B, padding: '104px 36px' }}>
        <div className="two" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 72, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 20 }}>The difference</p>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 42, fontWeight: 900, lineHeight: 1.14, color: '#EBF2FC', marginBottom: 24 }}>
              We finish your sentences<br /><span style={{ color: GL }}>before you write them.</span>
            </h2>
            <p style={{ fontSize: 16, color: DIM, lineHeight: 1.82, marginBottom: 38, maxWidth: 460 }}>
              Every tool reads your business profile and pre-fills ideas that sound like a senior marketing strategist spent 30 minutes studying your brand.
            </p>
            <div style={{ background: 'rgba(6,12,26,0.65)', borderRadius: 16, padding: 22, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span>🧠</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(18,212,180,0.7)' }}>Ideas for Amara's Fashion House</span>
              </div>
              {[
                'Show how we turn ankara into a finished dress in 5 days — guaranteed delivery in Lagos',
                'Why 400 Lagos women have switched from fast fashion imports to our custom pieces',
                'The outfit mistake most Nigerian women make at events — and exactly how we fix it',
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 8, background: 'rgba(18,212,180,0.07)', border: '1px solid rgba(18,212,180,0.2)', fontSize: 13.5, color: 'rgba(235,242,252,0.75)', lineHeight: 1.58, display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <span style={{ color: TEAL, fontSize: 11, marginTop: 3, flexShrink: 0 }}>✦</span>{s}
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'rgba(235,242,252,0.22)', marginTop: 10, fontStyle: 'italic' }}>Tap any suggestion to fill the field instantly</p>
            </div>
          </div>
          <div style={{ flex: '0 0 37%', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              { ico: '🎯', t: 'Knows your industry', d: 'Ideas built for fashion, food, real estate, fintech, logistics and 7 more.' },
              { ico: '📍', t: 'Knows your city',     d: 'Lagos. Abuja. Port Harcourt. Your market, not a generic placeholder.' },
              { ico: '👥', t: 'Knows your customers',d: 'Your target customer is saved from onboarding. Every output speaks to them.' },
              { ico: '💰', t: 'Knows your pricing',  d: 'No suggestions that position you too cheap or too premium for your market.' },
            ].map(({ ico, t, d }) => (
              <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(18,212,180,0.08)', border: '1px solid rgba(18,212,180,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ico}</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#EBF2FC', marginBottom: 5 }}>{t}</p>
                  <p style={{ fontSize: 13.5, color: 'rgba(235,242,252,0.48)', lineHeight: 1.65 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SME CLUB */}
      <section id="sme" style={{ background: A, padding: '104px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 20, background: `${GL}12`, border: `1px solid ${GL}28`, marginBottom: 20, fontSize: 12, fontWeight: 700, color: GL, letterSpacing: '1px', textTransform: 'uppercase' }}>
              ✦ Free for every member — always
            </div>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 46, fontWeight: 900, color: '#EBF2FC', lineHeight: 1.12, marginBottom: 16 }}>
              The SME Club.<br /><span style={{ color: GL }}>A community that actually works.</span>
            </h2>
            <p style={{ fontSize: 17, color: DIM, maxWidth: 640, margin: '0 auto', lineHeight: 1.8 }}>
              Not a Facebook group. A structured weekly programme — templates you can download, a wins board that pays you coins, monthly challenges, and the Hot Seat where your business gets diagnosed live.
            </p>
          </div>

          {/* Weekly schedule */}
          <div className="wk-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 52 }}>
            {WEEK.map(({ day, label, icon, color, desc }) => (
              <div key={day} style={{ background: B, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 16px', transition: 'border-color .18s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color }}>{day}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#EBF2FC', marginBottom: 6, lineHeight: 1.3 }}>{label}</p>
                <p style={{ fontSize: 12.5, color: 'rgba(235,242,252,0.45)', lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* 4 feature cards */}
          <div className="cl-g" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 44 }}>
            {[
              { ico: '📄', t: 'Templates Vault',   d: 'Every Thursday drop lives here permanently. Caption swipes, email scripts, WhatsApp frameworks — download any time. +2 pts per download.', b: 'Grows weekly', c: '#8B5CF6' },
              { ico: '🏆', t: 'Wins Board',         d: 'Share a business win. Approved wins earn 10 coins + 20 points and get published to inspire the whole community.',                          b: '+10 coins',  c: '#22C55E' },
              { ico: '⚡', t: 'Monthly Challenges', d: 'One challenge. One deadline. Complete it and earn 50 coins + 100 points. The leaderboard shows who\'s doing the actual work.',              b: '+50 coins',  c: GOLD      },
              { ico: '🔥', t: 'Hot Seat',           d: 'Apply to have your business diagnosed publicly every Wednesday. Unfiltered strategy from the Cerebre team. Selected members get 100 coins.', b: '+100 coins', c: '#E84830' },
            ].map(({ ico, t, d, b, c }) => (
              <div key={t} style={{ background: B, border: `1px solid ${c}18`, borderRadius: 16, padding: '22px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 26 }}>{ico}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 12, background: `${c}18`, color: c, letterSpacing: '1px' }}>{b.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#EBF2FC', marginBottom: 8 }}>{t}</p>
                <p style={{ fontSize: 13, color: 'rgba(235,242,252,0.5)', lineHeight: 1.65 }}>{d}</p>
              </div>
            ))}
          </div>

          {/* Rank ladder */}
          <div style={{ background: `linear-gradient(135deg,${GOLD}0C,${TEAL}06)`, border: `1px solid ${GOLD}22`, borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 44 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED, marginBottom: 8 }}>RANK SYSTEM</p>
              <p style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: '#EBF2FC', marginBottom: 4 }}>Earn points. Climb the ranks.</p>
              <p style={{ fontSize: 14, color: DIM }}>Rookie → Builder → Operator → Growth Partner. The leaderboard is public.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {RANKS.map(({ rank, pts, color }) => (
                <div key={rank} style={{ padding: '10px 16px', borderRadius: 10, background: `${color}12`, border: `1px solid ${color}30`, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color }}>{rank}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{pts}+ pts</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/club" className="cta-btn" style={{ padding: '15px 36px', fontSize: 16 }}>
              Join the SME Club — Free <ChevronRight className="h-4 w-4" />
            </Link>
            <p style={{ marginTop: 12, fontSize: 13, color: MUTED }}>No payment. No subscription. Just show up every week.</p>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ background: B, padding: '104px 36px' }}>
        <div className="two" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 72, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GL, marginBottom: 28 }}>Built for businesses like yours</p>
            <p style={{ fontFamily: "'Georgia',serif", fontSize: 38, fontWeight: 700, color: '#EBF2FC', lineHeight: 1.32, marginBottom: 34 }}>
              "It felt like someone who actually knew my business wrote all of this — not a generic AI."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: `${GOLD}18`, border: `2px solid ${GOLD}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color: GL }}>A</div>
              <div>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: '#EBF2FC' }}>Amara Okafor</p>
                <p style={{ fontSize: 13, color: MUTED }}>Fashion designer · Lagos Island</p>
              </div>
            </div>
            {['70 free coins on signup — no card required', 'Every tool remembers your brand from the first day', 'Works on phone or desktop — built for Nigerian connectivity', 'Coins never expire. Buy more only when you need them.'].map(item => (
              <div key={item} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ color: TEAL, fontSize: 14, marginTop: 2, flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: 15, color: DIM, lineHeight: 1.6 }}>{item}</p>
              </div>
            ))}
          </div>
          <div style={{ flex: '0 0 43%', position: 'relative', borderRadius: 22, overflow: 'hidden', aspectRatio: '3/4' }}>
            <Image src="/images/founder-woman.png" alt="Nigerian business owner" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 26, background: 'linear-gradient(to top,rgba(6,12,26,0.94),transparent)' }}>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {['Fashion', 'Custom pieces', 'Lagos', '₦45,000/outfit'].map(t => (
                  <span key={t} style={{ fontSize: 11.5, padding: '4px 12px', borderRadius: 20, background: `${GOLD}18`, border: `1px solid ${GOLD}30`, color: GL, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING — FREE focus, zero barrier messaging */}
      <section id="pricing" style={{ background: A, padding: '104px 36px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>

          {/* Eyebrow */}
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 24 }}>
            Pricing
          </p>

          {/* Massive FREE */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
            <span style={{
              fontFamily: "'Georgia',serif",
              fontSize: 'clamp(96px,18vw,160px)',
              fontWeight: 900,
              lineHeight: 0.88,
              background: `linear-gradient(135deg, ${GL}, ${GOLD})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
            }}>
              FREE
            </span>
            <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, opacity: 0.35 }} />
          </div>

          <p style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 700, color: '#EBF2FC', marginBottom: 16, lineHeight: 1.2 }}>
            No credit card. No subscription.<br />No reason not to start right now.
          </p>
          <p style={{ fontSize: 17, color: DIM, maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.8 }}>
            Sign up and get <strong style={{ color: GL }}>70 Cerebre Coins instantly</strong> — enough to run your first 5 to 8 AI marketing tools today. Zero commitment. Zero payment. Zero risk.
          </p>

          {/* Primary CTA */}
          <Link href="/signup" className="cta-btn" style={{ padding: '18px 48px', fontSize: 17, marginBottom: 16, boxShadow: '0 14px 44px rgba(224,152,24,0.35)' }}>
            Start free right now — no card needed <ChevronRight className="h-5 w-5" />
          </Link>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 72 }}>
            Takes 60 seconds. Your first output before your coffee gets cold.
          </p>

          {/* Four "NO" reassurances */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 72 }}>
            {[
              { ico: '🚫', headline: 'No credit card',    sub: 'Not even to sign up.' },
              { ico: '🔓', headline: 'No subscription',   sub: 'Use it and pay nothing.' },
              { ico: '♾️', headline: 'Coins never expire', sub: 'They wait until you need them.' },
              { ico: '🚪', headline: 'No commitment',     sub: 'Leave any time. Keep your outputs.' },
            ].map(({ ico, headline, sub }) => (
              <div key={headline} style={{ background: B, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 18px', textAlign: 'center' }}>
                <span style={{ fontSize: 30, display: 'block', marginBottom: 12 }}>{ico}</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#EBF2FC', marginBottom: 5 }}>{headline}</p>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* What 70 coins covers */}
          <div style={{ background: B, border: `1px solid ${GL}18`, borderRadius: 20, padding: '40px 36px', marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GL, marginBottom: 10 }}>
              WHAT YOUR 70 FREE COINS COVERS
            </p>
            <p style={{ fontFamily: "'Georgia',serif", fontSize: 26, fontWeight: 900, color: '#EBF2FC', marginBottom: 32 }}>
              A full week of marketing. On us.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, textAlign: 'left' }}>
              {[
                { ico: '✍', what: '6 captions or ad copies',    why: 'One per product. One per offer. Done in seconds.' },
                { ico: '🧠', what: '3 full marketing strategies', why: 'Each a 60-day plan from your actual business data.' },
                { ico: '🎨', what: '7 social media visuals',     why: 'Posts, banners, and flyers with your branding baked in.' },
                { ico: '📱', what: '8 WhatsApp sequences',       why: 'Broadcast scripts built for how Nigerians actually buy.' },
              ].map(({ ico, what, why }) => (
                <div key={what} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${GL}12`, border: `1px solid ${GL}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {ico}
                  </div>
                  <div>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: GL, marginBottom: 4 }}>{what}</p>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objection killer strip */}
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
            {[
              '"What if I don\'t like it?"',
              '"What if I run out of coins?"',
              '"What if I forget about it?"',
            ].map((q, i) => (
              <div key={i} style={{ flex: '1 1 220px', padding: '24px 20px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none', textAlign: 'left' }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: DIM, marginBottom: 8 }}>{q}</p>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                  {i === 0 && 'Your coins don\'t disappear. They\'re yours. Come back whenever. They\'ll still be there.'}
                  {i === 1 && 'Your 70 coins never expire. You decide if and when to get more — there\'s no pressure and no prompts.'}
                  {i === 2 && 'Your brand profile, your outputs, and your ideas are saved. Pick up exactly where you left off, any time.'}
                </p>
              </div>
            ))}
          </div>

          {/* Second CTA block */}
          <div style={{ background: `linear-gradient(135deg,${GOLD}10,${TEAL}06)`, border: `1px solid ${GOLD}22`, borderRadius: 20, padding: '44px 36px' }}>
            <p style={{ fontFamily: "'Georgia',serif", fontSize: 28, fontWeight: 900, color: '#EBF2FC', marginBottom: 10, lineHeight: 1.2 }}>
              The only thing standing between you<br />and your first AI marketing output is a signup form.
            </p>
            <p style={{ fontSize: 16, color: DIM, marginBottom: 32, lineHeight: 1.7 }}>
              No payment screen. No plan comparison. No credit card field. Just your name, your business, and 60 seconds.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="cta-btn" style={{ padding: '16px 40px', fontSize: 16, boxShadow: '0 8px 32px rgba(224,152,24,0.3)' }}>
                Get my 70 free coins <ChevronRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="ghost-btn" style={{ padding: '16px 28px', fontSize: 15 }}>
                I already have an account
              </Link>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(235,242,252,0.2)', marginTop: 20 }}>
              Free forever for what you start with · No subscription ever required
            </p>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: B, padding: '110px 36px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 22 }}>The time is now</p>
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 54, fontWeight: 900, color: '#EBF2FC', lineHeight: 1.08, marginBottom: 22 }}>
            Your competitors<br />are already using AI.<br /><span style={{ color: GL }}>Will you?</span>
          </h2>
          <p style={{ fontSize: 17, color: DIM, lineHeight: 1.82, marginBottom: 48 }}>
            Start with 70 free coins. No card. No subscription. No commitment.<br />
            Your first Cerebre Plus output in under 60 seconds.
          </p>
          <Link href="/signup" className="cta-btn" style={{ padding: '18px 48px', fontSize: 17, boxShadow: '0 14px 44px rgba(224,152,24,0.32)' }}>
            Start free — get 70 coins <ChevronRight className="h-5 w-5" />
          </Link>
          <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(235,242,252,0.25)' }}>
            40+ tools · No subscription · Coins never expire · First output in 60 seconds
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: A, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 36px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
          <div>
            <img src="/Cerebre_Plus_2.png" alt="Cerebre Plus" style={{ height: 42, width: 'auto', marginBottom: 16 }} />
            <p style={{ fontSize: 13.5, color: 'rgba(235,242,252,0.32)', maxWidth: 240, lineHeight: 1.75 }}>
              AI marketing for Nigerian businesses.<br />40+ tools. Pay as you go. Free SME Club.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(235,242,252,0.2)', marginTop: 18 }}>Lagos, Nigeria · cerebreplus.com</p>
          </div>
          <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
            {[
              { l: 'Product', ls: ['Tools', 'Pricing', 'SME Club', 'Competitor Intel', 'Design Studio', 'Sprint Blueprint'] },
              { l: 'Company', ls: ['About', 'Blog', 'Careers', 'Contact', 'Cerebre Media Africa'] },
              { l: 'Legal',   ls: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map(({ l, ls }) => (
              <div key={l}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(235,242,252,0.28)', marginBottom: 16 }}>{l}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ls.map(x => <a key={x} href="#" className="footer-a">{x}</a>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '36px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12.5, color: 'rgba(235,242,252,0.22)' }}>© 2026 Cerebre Media Africa. All rights reserved.</p>
          <p style={{ fontSize: 12.5, color: 'rgba(235,242,252,0.22)' }}>Built in Lagos, Nigeria 🇳🇬</p>
        </div>
      </footer>
    </div>
  )
}
