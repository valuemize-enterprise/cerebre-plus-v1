'use client'
/**
 * app/waitlist/page.tsx — Cerebre Plus Pre-Launch Waitlist
 * Fixed: text contrast, FAQ accordion, no lag animations, logo in nav+footer
 * Mobile: logo LEFT · hamburger RIGHT
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

/* ── colours ──────────────────────────────────────────────── */
const C = {
  void:'#06080E', ink:'#090C16', s1:'#0C1020', s2:'#101528',
  gold:'#C8880A', gm:'#E09C12', gl:'#F5B830',
  teal:'#0BA890', tl:'#12D4B4',
  coral:'#E84830', wa:'#25D366', wad:'#128C7E',
  bright:'#EBF2FC', text:'#CDD9EC', muted:'#4A6280',
} as const

const WA   = '2348124266524'
const wa   = (t:string) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`
const LAUNCH = new Date('2026-06-01T00:00:00+01:00').getTime()
const SHEET  = 'https://script.google.com/macros/s/AKfycbyQ3WI9FMLMpUJw2eFRQjxDtuaVAtzZAiibcODVBQTDTxiCxnTVeIh6g4drUSfHI3Rk/exec'
const CLAIMED = 247
const pad = (n:number) => String(n).padStart(2,'0')

/* ── tiny icon ───────────────────────────────────────────── */
function WaIcon({sz=24,col='white'}:{sz?:number;col?:string}) {
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill={col} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.533 5.851L.057 23.526a.5.5 0 0 0 .617.608l5.87-1.539A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.587-.5-5.084-1.374l-.36-.214-3.736.979.997-3.648-.235-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}

/* ── eyebrow ─────────────────────────────────────────────── */
function Ey({t,col=C.gm}:{t:string;col?:string}) {
  return <span style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:col,marginBottom:10}}>{t}</span>
}

/* ── gold button ─────────────────────────────────────────── */
function GBtn({ch,onClick,full,lg}:{ch:React.ReactNode;onClick:()=>void;full?:boolean;lg?:boolean}) {
  return (
    <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,background:`linear-gradient(135deg,${C.gm},${C.gl})`,color:C.void,fontWeight:800,fontSize:lg?16:14,padding:lg?'15px 36px':'11px 24px',borderRadius:10,border:'none',cursor:'pointer',width:full?'100%':'auto',fontFamily:'inherit'}}>
      {ch}
    </button>
  )
}

/* ── trust tick ──────────────────────────────────────────── */
function Tick({t}:{t:string}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'rgba(205,217,236,0.65)'}}>
      <span style={{width:18,height:18,borderRadius:'50%',background:`${C.teal}18`,border:`1px solid ${C.teal}3A`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:C.tl,flexShrink:0}}>✓</span>
      {t}
    </div>
  )
}

/* ── FAQ row ─────────────────────────────────────────────── */
function FAQ({q,a,open,toggle}:{q:string;a:string;open:boolean;toggle:()=>void}) {
  return (
    <div style={{border:`1px solid ${open?C.gm+'40':'rgba(255,255,255,0.08)'}`,borderRadius:12,overflow:'hidden',transition:'border-color .2s'}}>
      <button onClick={toggle} style={{width:'100%',background:open?`${C.gm}08`:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'18px 22px',textAlign:'left'}}>
        <span style={{fontSize:14.5,fontWeight:700,color:C.bright,lineHeight:1.4,fontFamily:'inherit'}}>{q}</span>
        <span style={{color:C.gm,fontSize:22,lineHeight:1,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .25s'}}>+</span>
      </button>
      <div style={{maxHeight:open?400:0,overflow:'hidden',transition:'max-height .35s ease'}}>
        <div style={{padding:'0 22px 20px'}}>
          <p style={{fontSize:14,color:'rgba(205,217,236,0.68)',lineHeight:1.85,margin:0}}>{a}</p>
        </div>
      </div>
    </div>
  )
}

/* ── form field ──────────────────────────────────────────── */
function FF({label,req,err,children}:{label:string;req?:boolean;err?:string;children:React.ReactNode}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <label style={{fontSize:11,fontWeight:700,color:'rgba(205,217,236,0.55)',textTransform:'uppercase',letterSpacing:'1px'}}>
        {label}{req&&<span style={{color:C.coral,marginLeft:2}}>*</span>}
      </label>
      {children}
      {err&&<span style={{fontSize:11.5,color:C.coral}}>{err}</span>}
    </div>
  )
}
const IS:React.CSSProperties={background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'13px 16px',color:C.bright,fontFamily:'inherit',fontSize:14,outline:'none',width:'100%'}

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function WaitlistClient() {
  const [scrolled,setScrolled]=useState(false)
  const [menu,setMenu]=useState(false)
  const [cd,setCd]=useState({d:'00',h:'00',m:'00',s:'00'})
  const [faq,setFaq]=useState<number|null>(null)
  const [count,setCount]=useState(CLAIMED)
  const [done,setDone]=useState(false)
  const [busy,setBusy]=useState(false)
  const [form,setForm]=useState({name:'',email:'',phone:'',biz:'',industry:'',size:'',plan:'',source:'',challenge:''})
  const [er,setEr]=useState<Record<string,string>>({})

  /* countdown */
  useEffect(()=>{
    const tick=()=>{const d=LAUNCH-Date.now();if(d<=0)return;setCd({d:pad(Math.floor(d/86400000)),h:pad(Math.floor((d/3600000)%24)),m:pad(Math.floor((d/60000)%60)),s:pad(Math.floor((d/1000)%60))})}
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id)
  },[])

  /* nav tint */
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>50)
    window.addEventListener('scroll',fn,{passive:true});return()=>window.removeEventListener('scroll',fn)
  },[])

  /* body lock */
  useEffect(()=>{document.body.style.overflow=menu?'hidden':'';return()=>{document.body.style.overflow=''}},[menu])

  const goto=useCallback((id:string)=>{
    setMenu(false)
    setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}),80)
  },[])

  const sf=(k:string,v:string)=>setForm(p=>({...p,[k]:v}))

  const validate=()=>{
    const e:Record<string,string>={}
    if(form.name.trim().length<2)e.name='Please enter your full name'
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))e.email='Please enter a valid email'
    if(form.phone.trim().length<7)e.phone='Please enter your WhatsApp number'
    if(form.biz.trim().length<2)e.biz='Please enter your business name'
    if(!form.industry)e.industry='Please select your industry'
    if(!form.size)e.size='Please select your team size'
    setEr(e);return!Object.keys(e).length
  }

  const submit=async()=>{
    if(!validate())return
    setBusy(true)
    const p={timestamp:new Date().toISOString(),name:form.name,email:form.email,phone:form.phone,businessName:form.biz,industry:form.industry,businessSize:form.size,planInterest:form.plan,referralSource:form.source,challenge:form.challenge}
    await Promise.allSettled([
      fetch(SHEET,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}),
      fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({firstName:form.name.split(' ')[0],email:form.email,source:form.source||'waitlist'})}),
    ])
    try{const s=JSON.parse(localStorage.getItem('cp_wl')||'[]');localStorage.setItem('cp_wl',JSON.stringify([...s,p]))}catch{}
    setBusy(false);setDone(true);setCount(n=>n+1)
  }

  const pct=((count/1000)*100).toFixed(1)
  const sec=(bg: string = C.void):React.CSSProperties=>({padding:'clamp(64px,8vw,100px) 0',background:bg})
  const wrap:React.CSSProperties={maxWidth:1120,margin:'0 auto',padding:'0 clamp(18px,5%,48px)'}
  const narrow:React.CSSProperties={maxWidth:800,margin:'0 auto',padding:'0 clamp(18px,5%,48px)'}
  const H=(fs:string):React.CSSProperties=>({fontFamily:"'Georgia','Times New Roman',serif",fontSize:fs,fontWeight:900,lineHeight:.93,color:'#FFFFFF',marginBottom:16})

  const FAQS=[
    ['When exactly does Cerebre Plus launch?','Cerebre Plus launches on Sunday, June 1st, 2026. Everyone on the waitlist will receive their access link and setup instructions via email on that day. Founding member pricing will be available from day one.'],
    ['What does "first generation completely free" mean?',"When you create your account and set up your business profile, you can run any one tool — completely free. No card required. You can get a full 90-day marketing strategy for your real business before spending a naira."],
    ['How is Cerebre Plus different from ChatGPT?',"ChatGPT is a general AI. Cerebre Plus is a purpose-built marketing platform calibrated for the African market. It understands WhatsApp culture, naira pricing, Nigerian consumer behaviour, and has 40 structured tools — not a blank chat box."],
    ['Do I need any marketing knowledge to use it?',"Zero skills needed. The tools ask you questions about your business and produce the output. If you can describe what you sell and who you sell it to, you can use every tool on the platform."],
    ['What happens to my founding member price when you raise prices?',"Your founding member price is locked in forever, for as long as you remain a subscriber. You'll pay the same in 2027 and beyond — even when the price for new members is double or triple."],
    ['What payment methods do you accept?','We accept all major payment methods for Nigerian businesses: Paystack, Flutterwave, bank transfer, and debit/credit cards. Subscriptions are monthly and you can cancel at any time.'],
    ['How does the 30-day guarantee work?',"If you subscribe, use the tools for 30 days, and genuinely don't believe it was worth the money — message us on WhatsApp and we will process your full refund. No forms, no arguments, no questions."],
  ] as const


  const STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Syne',system-ui,sans-serif;overflow-x:hidden}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.gm}66;border-radius:4px}
        input,select,button{font-family:inherit}
        select option{background:${C.s2};color:${C.bright}}
        a{text-decoration:none}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes wap{0%,100%{box-shadow:0 6px 24px rgba(37,211,102,.35)}50%{box-shadow:0 6px 24px rgba(37,211,102,.35),0 0 0 10px rgba(37,211,102,.07)}}
        /* grid helpers */
        .pg{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .tg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .prg{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .bg{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .hg{display:grid;grid-template-columns:repeat(4,1fr)}
        .sg{display:grid;grid-template-columns:repeat(4,1fr)}
        .fg{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}
        .fmg{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .hbtns{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:32px}
        .cdr{display:flex;gap:20px;align-items:center}
        .mob{display:none}
        .dsk{display:flex}
        @media(max-width:900px){
          .mob{display:flex}
          .dsk{display:none!important}
          .tg{grid-template-columns:1fr!important}
          .prg{grid-template-columns:1fr!important}
          .hg{grid-template-columns:1fr 1fr!important}
          .fg{grid-template-columns:1fr 1fr!important}
          .fb{grid-column:1/-1!important}
        }
        @media(max-width:640px){
          .pg{grid-template-columns:1fr!important}
          .bg{grid-template-columns:1fr!important}
          .fmg{grid-template-columns:1fr!important}
          .fmf{grid-column:auto!important}
          .hbtns{flex-direction:column}
          .hbtns>*{width:100%!important;text-align:center!important;justify-content:center!important}
          .hg{grid-template-columns:1fr!important}
          .sg{grid-template-columns:1fr 1fr!important}
          .fg{grid-template-columns:1fr!important}
          .cdr{gap:10px!important}
          .ghead{flex-direction:column!important}
        }
      `

  return (
    <>
     {/* Inject styles */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{fontFamily:"'Syne',system-ui,sans-serif",background:C.void,color:C.text,WebkitFontSmoothing:'antialiased',lineHeight:1.7}}>

        {/* ── STRIP ── */}
        <div style={{background:`linear-gradient(90deg,${C.gm}1C,${C.teal}18,${C.gm}1C)`,borderBottom:`1px solid ${C.gm}2E`,padding:'10px 20px',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:10}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:C.tl,display:'inline-block',animation:'blink 2s ease infinite',flexShrink:0}}/>
          <span style={{fontSize:12.5,fontWeight:600,color:'rgba(205,217,236,0.82)'}}>Launching <strong style={{color:C.gl}}>June 1st, 2026</strong> — Africa's premier AI marketing platform</span>
          <span style={{background:`${C.gm}22`,border:`1px solid ${C.gm}44`,color:C.gl,fontSize:11,fontWeight:700,padding:'2px 12px',borderRadius:20}}>🔥 Founding member pricing now open</span>
        </div>

        {/* ══ NAV ══ */}
        <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:900,height:68,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 clamp(16px,5%,48px)',background:scrolled?'rgba(6,8,14,0.97)':'rgba(6,8,14,0.93)',backdropFilter:'blur(24px) saturate(160%)',borderBottom:scrolled?`1px solid ${C.gm}28`:'1px solid rgba(255,255,255,0.04)',boxShadow:scrolled?'0 4px 32px rgba(0,0,0,0.5)':'none',transition:'all .3s'}}>

          {/* Logo — LEFT */}
          <a href="#hero" onClick={e=>{e.preventDefault();goto('hero')}} style={{flexShrink:0,display:'block'}}>
            <Image src="/Cerebre_Plus_2.png" alt="Cerebre Plus" width={130} height={63} style={{objectFit:'contain',mixBlendMode:'screen',display:'block'}} priority/>
          </a>

          {/* Desktop links */}
          <div className="dsk" style={{alignItems:'center',gap:28}}>
            {[['problem','The Problem'],['tools','40 Tools'],['pricing','Pricing'],['faq','FAQs']].map(([id,lbl])=>(
              <a key={id} href={`#${id}`} onClick={e=>{e.preventDefault();goto(id)}} style={{fontSize:13,fontWeight:600,color:'rgba(205,217,236,0.62)'}}>{lbl}</a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="dsk" style={{alignItems:'center',gap:8}}>
            <a href={wa('Hi! I found Cerebre Plus and want to learn more.')} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:6,border:'1px solid rgba(255,255,255,0.14)',background:'transparent',color:C.bright,fontSize:13,fontWeight:600,padding:'8px 18px',borderRadius:8}}>
              <WaIcon sz={16}/> Chat Us
            </a>
            <GBtn ch="Join Waitlist →" onClick={()=>goto('waitlist')}/>
          </div>

          {/* Hamburger — RIGHT */}
          <button className="mob" aria-label="Open menu" onClick={()=>setMenu(true)} style={{background:'none',border:'none',cursor:'pointer',padding:8,flexDirection:'column',gap:5,alignItems:'flex-end'}}>
            <span style={{display:'block',width:24,height:2,background:C.bright,borderRadius:2}}/>
            <span style={{display:'block',width:18,height:2,background:C.bright,borderRadius:2}}/>
            <span style={{display:'block',width:22,height:2,background:C.bright,borderRadius:2}}/>
          </button>
        </nav>

        {/* ── MOBILE MENU ── */}
        <div style={{position:'fixed',inset:0,zIndex:950,background:'rgba(6,8,14,0.99)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:32,opacity:menu?1:0,pointerEvents:menu?'auto':'none',transition:'opacity .25s'}}>
          <button onClick={()=>setMenu(false)} style={{position:'absolute',top:24,right:20,background:'none',border:'none',color:C.bright,fontSize:28,cursor:'pointer',lineHeight:1}}>✕</button>
          {[['problem','The Problem'],['tools','The Tools'],['pricing','Pricing'],['faq','FAQs'],['waitlist','Join Waitlist →']].map(([id,lbl])=>(
            <a key={id} href={`#${id}`} onClick={e=>{e.preventDefault();goto(id)}} style={{fontFamily:"'Georgia',serif",fontSize:30,fontWeight:700,color:id==='waitlist'?C.gl:'rgba(205,217,236,0.85)'}}>{lbl}</a>
          ))}
          <a href={wa('Hi! I found Cerebre Plus and want to learn more.')} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:8,fontSize:14,color:'rgba(37,211,102,0.85)'}}>
            <WaIcon sz={20} col={C.wa}/> Chat on WhatsApp
          </a>
        </div>


        {/* ════════════ HERO ════════════ */}
        <section id="hero" style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'clamp(120px,14vw,160px) clamp(18px,5%,48px) clamp(64px,8vw,96px)',position:'relative',overflow:'hidden',background:`radial-gradient(ellipse 120% 70% at 110% -10%,${C.gold}15 0%,transparent 50%),radial-gradient(ellipse 80% 60% at -15% 95%,${C.teal}0D 0%,transparent 50%),linear-gradient(180deg,${C.void} 0%,${C.ink} 100%)`}}>
          <div style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:`linear-gradient(rgba(19,30,56,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(19,30,56,.22) 1px,transparent 1px)`,backgroundSize:'56px 56px'}}/>
          <div style={{position:'relative',zIndex:2,maxWidth:920}}>

            {/* Tag */}
            <div style={{marginBottom:28}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:10,background:`${C.tl}10`,border:`1px solid ${C.tl}2E`,color:`${C.tl}EE`,fontSize:11,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',padding:'7px 18px',borderRadius:30}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:C.tl,animation:'blink 1.6s ease infinite',display:'inline-block',flexShrink:0}}/>
                Africa's first AI marketing platform — launching June 1st
              </span>
            </div>

            {/* H1 */}
            <h1 style={{fontFamily:"'Georgia','Times New Roman',serif",fontSize:'clamp(44px,9vw,100px)',fontWeight:900,lineHeight:.92,color:'#FFFFFF',marginBottom:28}}>
              More customers<br/>
              from your marketing<br/>
              in <span style={{color:C.gl,fontStyle:'italic'}}>30 days</span> than<br/>
              the last <span style={{color:'#FFFFFF'}}>300.</span>
            </h1>

            {/* Deck */}
            <p style={{fontSize:'clamp(16px,2.2vw,20px)',color:'rgba(205,217,236,0.72)',maxWidth:640,lineHeight:1.78,marginBottom:20}}>
              A complete AI marketing team — <strong style={{color:C.bright}}>writing your ads, building your strategy, creating your content</strong> — available 24/7, starting from <strong style={{color:C.gl}}>₦20,000/month.</strong>
            </p>

            {/* Compare */}
            <div style={{display:'flex',flexWrap:'wrap',gap:'10px 20px',marginBottom:36}}>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
                <span style={{color:C.coral}}>❌</span>
                <span style={{color:'rgba(205,217,236,0.55)'}}>Agency: <strong style={{color:'rgba(205,217,236,0.82)'}}>₦300k–₦2M/mo</strong></span>
              </div>
              <span style={{color:C.gm,fontWeight:800}}>→</span>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
                <span style={{color:C.tl}}>✓</span>
                <span style={{color:'rgba(205,217,236,0.55)'}}>Cerebre Plus from: <strong style={{color:C.gl}}>₦20,000/month</strong></span>
              </div>
            </div>

            {/* CTAs */}
            <div className="hbtns">
              <GBtn ch="Secure Your Founding Spot — Free →" onClick={()=>goto('waitlist')} lg/>
              <a href="https://www.cerebreplus.com/demo" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',background:'#FFFFFF',color:C.void,fontWeight:800,fontSize:14,padding:'15px 32px',borderRadius:10}}>
                See Cerebre Plus in Action →
              </a>
            </div>

            {/* Trust */}
            <div style={{display:'flex',flexWrap:'wrap',gap:'10px 20px',marginBottom:48}}>
              {['First generation completely free','No credit card required','Founding price locked forever','Works for any Nigerian industry'].map(t=><Tick key={t} t={t}/>)}
            </div>

            {/* Countdown */}
            <div style={{background:`linear-gradient(135deg,${C.s2},${C.s1})`,border:`1px solid ${C.gm}2E`,borderRadius:18,padding:'clamp(20px,4vw,30px)',display:'inline-flex',flexDirection:'column',gap:12}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:`${C.gm}AA`}}>Launching in</div>
              <div className="cdr">
                {[['d','Days'],['h','Hours'],['m','Mins'],['s','Secs']].map(([k,lbl],i)=>(
                  <React.Fragment key={k}>
                    {i>0&&<span style={{fontFamily:"'Georgia',serif",fontSize:'clamp(28px,5vw,48px)',color:`${C.gm}44`,lineHeight:1,paddingBottom:12,animation:'blink 1s ease infinite',display:'inline-block'}}>:</span>}
                    <div style={{textAlign:'center'}}>
                      <div style={{fontFamily:"'Georgia',serif",fontSize:'clamp(38px,7vw,64px)',fontWeight:900,color:C.gl,lineHeight:1}}>{cd[k as keyof typeof cd]}</div>
                      <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'2px',marginTop:4}}>{lbl}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div style={{fontSize:12,color:'rgba(205,217,236,0.4)',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:10,fontFamily:'monospace'}}>
                Launch date: <strong style={{color:'rgba(205,217,236,0.62)'}}>Sunday, June 1st, 2026 — 12:00 AM WAT</strong>
              </div>
            </div>

            {/* Stat band */}
            <div className="sg" style={{border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,overflow:'hidden',marginTop:40,background:'rgba(255,255,255,0.02)'}}>
              {[['40','Live Tools'],['20+','Tools Coming'],['60s','First Result'],['₦0','To Join']].map(([v,l],i)=>(
                <div key={l} style={{padding:'16px 10px',textAlign:'center',borderRight:i<3?'1px solid rgba(255,255,255,0.06)':'none'}}>
                  <div style={{fontFamily:"'Georgia',serif",fontSize:26,color:C.gl,fontWeight:700}}>{v}</div>
                  <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'1.5px',marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ════════════ PROBLEM ════════════ */}
        <section id="problem" style={sec(C.ink)}>
          <div style={wrap}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <Ey t="The Real Problem" col={C.coral}/>
              <h2 style={H('clamp(28px,5vw,56px)')}>Every month without a system,<br/><span style={{color:C.gl,fontStyle:'italic'}}>you pay for it twice.</span></h2>
              <p style={{fontSize:16,color:'rgba(205,217,236,0.65)',maxWidth:600,margin:'0 auto',lineHeight:1.8}}>Once in money wasted on marketing that doesn't work. And once in the customers your competitors collect while you figure it out.</p>
            </div>
            <div className="pg">
              {[
                {i:'😩',t:'The blank screen every Sunday night',b:"You know you need to post tomorrow. You stare at your phone. Nothing comes. An hour passes. You have nothing — again.",c:'Costs you: consistency, credibility, customers'},
                {i:'💸',t:'Paying people who disappear with your money',b:'₦80,000 for Facebook ads. 9 likes. 2 comments. Zero enquiries. A social media manager great month one — then gone.',c:'Costs you: ₦80,000–₦500,000 per month'},
                {i:'🎯',t:'Strategy? What strategy?',b:'Your marketing has no plan. You post when you remember. Nothing is connected. Nothing compounds. Every month starts from zero.',c:'Costs you: growth, time, momentum'},
                {i:'🌍',t:'Tools built for the wrong market',b:"Canva, Hootsuite, HubSpot — powerful tools, wrong market. None of them understand WhatsApp culture or how Nigerians actually buy.",c:'Costs you: relevance, conversion, trust'},
              ].map(({i,t,b,c})=>(
                <div key={t} style={{background:'rgba(232,72,48,0.05)',border:'1px solid rgba(232,72,48,0.15)',borderRadius:14,padding:24,display:'flex',gap:16}}>
                  <div style={{width:44,height:44,borderRadius:10,background:'rgba(232,72,48,0.1)',border:'1px solid rgba(232,72,48,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,marginTop:2}}>{i}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:C.bright,marginBottom:6}}>{t}</div>
                    <div style={{fontSize:13.5,color:'rgba(205,217,236,0.62)',lineHeight:1.7}}>{b}</div>
                    <span style={{display:'inline-block',marginTop:10,background:'rgba(232,72,48,0.1)',border:'1px solid rgba(232,72,48,0.2)',color:'rgba(255,110,90,0.9)',fontSize:10,fontWeight:700,padding:'3px 12px',borderRadius:20}}>{c}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:48}}>
              <span style={{display:'inline-block',background:`${C.gm}10`,border:`1px solid ${C.gm}30`,color:C.gl,fontSize:13,fontWeight:700,padding:'11px 32px',borderRadius:30}}>✦ &nbsp; This is precisely why Cerebre Plus exists &nbsp; ✦</span>
            </div>
          </div>
        </section>


        {/* ════════════ STORY ════════════ */}
        <section id="story" style={sec()}>
          <div style={narrow}>
            <div style={{textAlign:'center',marginBottom:32}}>
              <Ey t="The Story Behind Cerebre Plus"/>
              <h2 style={H('clamp(28px,4.5vw,52px)')}>Two businesses. Same city.<br/><span style={{color:C.gl,fontStyle:'italic'}}>Completely different outcomes.</span></h2>
            </div>
            <div style={{background:`linear-gradient(135deg,${C.s1},${C.s2})`,border:`1px solid rgba(255,255,255,0.08)`,borderRadius:20,padding:'clamp(28px,5vw,48px)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-30,right:28,fontFamily:"'Georgia',serif",fontSize:200,color:`${C.gm}06`,lineHeight:1,userSelect:'none'}}>"</div>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'2.5px',color:C.gm,textTransform:'uppercase',marginBottom:18}}>📖 A True Story — Lagos, 2024</div>
              <p style={{fontFamily:"'Georgia',serif",fontSize:'clamp(18px,2.8vw,26px)',fontStyle:'italic',color:'#FFFFFF',lineHeight:1.55,marginBottom:24}}>
                Tunde and Emeka opened their fashion brands the same year, in the same Lagos market, with the same quality of clothes. Three years later, <span style={{color:C.gl,fontStyle:'normal',fontWeight:700}}>Emeka has 38,000 followers and a waiting list.</span> Tunde has 1,100 followers and is wondering if he should close.
              </p>
              <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)',margin:'24px 0'}}/>
              <p style={{fontSize:15,color:'rgba(205,217,236,0.72)',lineHeight:1.85,marginBottom:14}}>The product was never the difference. Emeka had a content system. He posted consistently. His captions converted. His campaigns were timed to when his customers had money.</p>
              <p style={{fontSize:15,color:'rgba(205,217,236,0.72)',lineHeight:1.85}}>Most Nigerian businesses are Tunde. Excellent at what they do. Invisible to the people who need them. <strong style={{color:C.gl}}>Cerebre Plus was built to change that.</strong></p>
              <div style={{fontSize:12,color:C.muted,marginTop:16}}>— The founding insight behind Cerebre Plus</div>
            </div>
          </div>
        </section>


        {/* ════════════ TOOLS ════════════ */}
        <section id="tools" style={sec(C.ink)}>
          <div style={wrap}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <Ey t="The Platform" col={C.teal}/>
              <h2 style={H('clamp(28px,5vw,56px)')}>40 AI tools live. <span style={{color:C.gl,fontStyle:'italic'}}>20 more coming.</span></h2>
              <p style={{fontSize:16,color:'rgba(205,217,236,0.65)',maxWidth:580,margin:'0 auto',lineHeight:1.8}}>Every tool calibrated for the African market. Here's what's live on launch day:</p>
            </div>
            <div className="tg">
              {[
                {cat:'STRATEGY',name:'90-Day Marketing Strategy',desc:'A complete, tailored marketing plan for your exact business, industry, and the Nigerian market — generated in under 60 seconds.'},
                {cat:'CONTENT',name:'30-Day Content Calendar',desc:'30 days of social media content with ready captions, posting times, and creative direction — done in under 5 minutes.'},
                {cat:'PAID ADS',name:'Meta & Google Campaign Brief',desc:'Professionally structured campaign briefs with audience targeting, ad copy, and budget allocation — done for you.'},
                {cat:'COPYWRITING',name:'Nigerian Copywriter AI',desc:'Generate ad copy, Instagram captions, email sequences, and video scripts — written for Nigerian audiences who buy.'},
                {cat:'ANALYTICS',name:'Budget Allocation Engine',desc:"Know exactly where to spend your marketing budget. Stop wasting money on channels that don't convert."},
                {cat:'WHATSAPP',name:'WhatsApp Marketing Builder',desc:'Build complete WhatsApp broadcast strategies and message sequences for the platform your customers already use.'},
              ].map(({cat,name,desc})=>(
                <div key={name} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:24}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:C.tl,display:'inline-block',flexShrink:0,animation:'blink 1.8s ease infinite'}}/>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:C.teal}}>Live on launch</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:16,color:C.bright,marginBottom:8}}>{name}</div>
                  <div style={{fontSize:13,color:'rgba(205,217,236,0.58)',lineHeight:1.7,marginBottom:16}}>{desc}</div>
                  <div style={{paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <span style={{fontSize:10,fontWeight:700,color:`${C.gl}88`,letterSpacing:'1px',fontFamily:'monospace'}}>{cat}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,background:`${C.teal}08`,border:`1px dashed ${C.teal}28`,borderRadius:14,padding:'20px 24px'}}>
              <div style={{fontWeight:700,color:C.bright,fontSize:15,marginBottom:6}}>52+ More Tools Are Coming</div>
              <div style={{fontSize:13,color:'rgba(205,217,236,0.52)',marginBottom:12}}>All included in your founding member subscription at no extra cost.</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {['SEO Writer','Email Sequences','Brand Voice Builder','Competitor Analysis','Sales Script','+ 47 more'].map(t=>(
                  <span key={t} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'rgba(205,217,236,0.52)',fontSize:10,fontWeight:600,padding:'4px 11px',borderRadius:20}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ════════════ HOW IT WORKS ════════════ */}
        <section id="how" style={sec()}>
          <div style={wrap}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <Ey t="How It Works" col={C.teal}/>
              <h2 style={H('clamp(28px,5vw,56px)')}>You'll be running your first <span style={{color:C.gl,fontStyle:'italic'}}>tool in under 5 minutes.</span></h2>
            </div>
            <div className="hg" style={{border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,overflow:'hidden'}}>
              {[
                {n:'01',e:'📝',t:'Create your free account',d:'Takes 90 seconds. Just your name and email. No card. No obligation.'},
                {n:'02',e:'🏢',t:'Set up your business profile',d:'Tell us your business, industry, and target market. This calibrates every tool to your business.'},
                {n:'03',e:'⚡',t:'Run any tool for free',d:'Your first generation is completely free. See what it produces for your real business.'},
                {n:'04',e:'🚀',t:"Subscribe when you're ready",d:'Starting at ₦20,000/month. Paystack, Flutterwave, bank transfer, or card. Cancel anytime.'},
              ].map((s,i)=>(
                <div key={s.n} style={{padding:'26px 18px',borderRight:i<3?'1px solid rgba(255,255,255,0.06)':'none',background:'rgba(255,255,255,0.015)'}}>
                  <div style={{fontFamily:"'Georgia',serif",fontSize:40,color:`${C.gm}1A`,lineHeight:1,marginBottom:10}}>{s.n}</div>
                  <div style={{fontSize:24,marginBottom:12}}>{s.e}</div>
                  <div style={{fontWeight:700,fontSize:13.5,color:C.bright,marginBottom:8}}>{s.t}</div>
                  <div style={{fontSize:12.5,color:C.muted,lineHeight:1.7}}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ════════════ PRICING ════════════ */}
        <section id="pricing" style={sec(C.ink)}>
          <div style={wrap}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <Ey t="Founding Member Pricing"/>
              <h2 style={H('clamp(28px,5vw,56px)')}>Less than what an agency charges <span style={{color:C.gl,fontStyle:'italic'}}>for a single day's work.</span></h2>
              <p style={{fontSize:16,color:'rgba(205,217,236,0.65)',maxWidth:560,margin:'0 auto',lineHeight:1.8}}>Available only until we hit 1,000 members. Once the counter hits 1,000, the price goes up permanently.</p>
            </div>
            <div className="prg">
              {[
                {badge:'Free Plan',name:'Cerebre Free',amt:'₦0',period:'/month',strike:'',desc:'Perfect for solopreneurs getting started with AI-powered marketing.',features:['30 Cerebre Coins/month','Access to core tools','First generation free'],cta:'Join Waitlist — Free →',feat:false},
                {badge:'Starter Plan',name:'Cerebre Starter',amt:'₦20,000',period:'/month',strike:'Regular price: ₦25,000/month',desc:'For business owners ready to market consistently and professionally.',features:['100 Cerebre Coins/month','All 40 live tools','All new tools as they launch','Email support','Founding member badge forever'],cta:'Join Waitlist — Starter →',feat:false},
                {badge:'⚡ Most Popular',name:'Cerebre Growth',amt:'₦35,000',period:'/month',strike:'Regular price: ₦65,000/month',desc:'The full marketing team experience. All tools, priority access, community.',features:['250 Cerebre Coins/month','Everything in Starter, plus:','Priority access to all 52+ new tools','Tuesday live group onboarding','Nigerian Business Owners WhatsApp community','Priority WhatsApp support'],cta:'Join Waitlist — Growth →',feat:true},
              ].map(p=>(
                <div key={p.name} style={{background:p.feat?'linear-gradient(160deg,#120E00,#1C1600,#0A1020)':'rgba(255,255,255,0.03)',border:`1px solid ${p.feat?C.gm+'55':'rgba(255,255,255,0.08)'}`,borderRadius:18,padding:28,position:'relative',overflow:'hidden'}}>
                  {p.feat&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${C.gm},transparent)`}}/>}
                  <div style={{display:'inline-block',marginBottom:16,background:p.feat?`linear-gradient(135deg,${C.gm},${C.gl})`:`${C.gm}20`,border:p.feat?'none':`1px solid ${C.gm}44`,color:p.feat?C.void:C.gl,fontSize:10,fontWeight:700,padding:'4px 14px',borderRadius:20,letterSpacing:'1px',textTransform:'uppercase'}}>{p.badge}</div>
                  <div style={{fontFamily:"'Georgia',serif",fontSize:24,fontWeight:700,color:C.bright,marginBottom:8}}>{p.name}</div>
                  <div style={{marginBottom:4}}>
                    <span style={{fontFamily:"'Georgia',serif",fontSize:'clamp(38px,5vw,56px)',fontWeight:900,color:C.gl,lineHeight:1}}>{p.amt}</span>
                    <span style={{fontSize:14,color:C.muted,marginLeft:4}}>{p.period}</span>
                  </div>
                  {p.strike&&<div style={{fontSize:12,color:'rgba(205,217,236,0.3)',textDecoration:'line-through',fontFamily:'monospace',marginBottom:12}}>{p.strike}</div>}
                  <div style={{fontSize:13.5,color:'rgba(205,217,236,0.58)',lineHeight:1.7,margin:'14px 0'}}>{p.desc}</div>
                  <div style={{display:'flex',flexDirection:'column',gap:10,margin:'18px 0'}}>
                    {p.features.map(f=>(
                      <div key={f} style={{display:'flex',gap:10,fontSize:13,color:'rgba(205,217,236,0.72)',alignItems:'flex-start'}}>
                        <span style={{color:C.tl,fontSize:11,marginTop:2,flexShrink:0}}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>goto('waitlist')} style={{width:'100%',padding:14,borderRadius:10,fontWeight:800,fontSize:14,cursor:'pointer',border:p.feat?'none':'1px solid rgba(255,255,255,0.12)',background:p.feat?`linear-gradient(135deg,${C.gm},${C.gl})`:'rgba(255,255,255,0.06)',color:p.feat?C.void:C.bright,fontFamily:'inherit'}}>{p.cta}</button>
                </div>
              ))}
            </div>
            <div style={{marginTop:24,background:`${C.teal}07`,border:`1px solid ${C.teal}18`,borderRadius:14,padding:'18px 24px'}}>
              <div style={{fontSize:12,color:'rgba(205,217,236,0.52)',marginBottom:8}}>Compare the cost of your alternatives:</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px 24px'}}>
                <span style={{fontSize:13.5,fontWeight:700,color:'rgba(232,72,48,0.82)'}}>❌ Lagos agency: ₦300,000–₦2,000,000/mo</span>
                <span style={{fontSize:13.5,fontWeight:700,color:'rgba(232,72,48,0.82)'}}>❌ Marketing manager: ₦250,000–₦500,000/mo</span>
                <span style={{fontSize:13.5,fontWeight:700,color:C.tl}}>✓ Cerebre Plus Growth: ₦35,000/mo</span>
              </div>
            </div>
          </div>
        </section>


        {/* ════════════ BONUSES ════════════ */}
        <section id="bonus" style={sec()}>
          <div style={wrap}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <Ey t="Founding Member Bonuses"/>
              <h2 style={H('clamp(28px,5vw,56px)')}>Join before 1,000 members <span style={{color:C.gl,fontStyle:'italic'}}>and you get all of this too.</span></h2>
            </div>
            <div className="bg">
              {[
                {e:'⚡',t:'Immediate access to every new tool as it launches',d:'All 52+ tools coming to the platform — included in your subscription at no extra cost.'},
                {e:'🎓',t:'Group onboarding session every Tuesday — live & free',d:"Weekly live sessions with the Cerebre team. We walk you through every tool and ensure you're getting maximum results."},
                {e:'💬',t:'Nigerian Business Owners WhatsApp Community',d:'Join a community of Nigerian and African business owners using AI to grow. Share wins and network with peers.'},
                {e:'🏆',t:'Founding Member badge — recognised forever',d:"Your founding member status is recognised in the platform permanently. You're part of what built this."},
              ].map(({e,t,d})=>(
                <div key={t} style={{background:`linear-gradient(135deg,${C.s1},${C.s2})`,border:`1px solid ${C.gm}22`,borderRadius:14,padding:22,display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{width:40,height:40,borderRadius:10,flexShrink:0,background:`${C.gm}18`,border:`1px solid ${C.gm}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{e}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:C.bright,marginBottom:6}}>{t}</div>
                    <div style={{fontSize:13,color:'rgba(205,217,236,0.58)',lineHeight:1.65}}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ════════════ GUARANTEE ════════════ */}
        <section id="guarantee" style={sec(C.ink)}>
          <div style={narrow}>
            <div style={{background:'linear-gradient(160deg,#040800,#0A0C02,#020508)',border:`1px solid ${C.gm}30`,borderRadius:20,padding:'clamp(30px,5vw,52px)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',right:-20,top:-30,fontFamily:"'Georgia',serif",fontSize:200,fontWeight:900,color:`${C.gm}05`,lineHeight:1,userSelect:'none'}}>30</div>
              <div className="ghead" style={{display:'flex',alignItems:'center',gap:22,marginBottom:28}}>
                <div style={{width:76,height:76,borderRadius:'50%',flexShrink:0,background:`linear-gradient(135deg,${C.gm},${C.gl})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,boxShadow:`0 0 36px ${C.gm}44`}}>🛡️</div>
                <div>
                  <Ey t="Our Promise To You"/>
                  <h2 style={{fontFamily:"'Georgia',serif",fontSize:'clamp(22px,3.5vw,34px)',color:'#FFFFFF',lineHeight:1.1}}>The 30-Day <span style={{color:C.gl,fontStyle:'italic'}}>Money-Back Guarantee</span></h2>
                </div>
              </div>
              <p style={{fontSize:15,color:'rgba(205,217,236,0.72)',lineHeight:1.85,marginBottom:16}}>We know that if you've been burned by marketing agencies or tools that didn't deliver, you are cautious. You should be. That's why Cerebre Plus comes with a 30-day guarantee.</p>
              <p style={{fontSize:15,color:'rgba(205,217,236,0.72)',lineHeight:1.85,marginBottom:24}}>If you join, use the tools, and within 30 days you don't believe it has been worth every naira — contact us and we will refund you. <strong style={{color:'#FFFFFF'}}>No questions. No forms. No arguments. Just your money back.</strong></p>
              <div style={{fontFamily:"'Georgia',serif",fontSize:'clamp(15px,2vw,19px)',fontStyle:'italic',color:'rgba(205,217,236,0.82)',borderLeft:`3px solid ${C.gm}`,paddingLeft:20,lineHeight:1.6}}>
                "We can afford to make this guarantee because we built something that works. Most of our members will never use it — because they'll be too busy getting results."
              </div>
            </div>
          </div>
        </section>


        {/* ════════════ WAITLIST FORM ════════════ */}
        <section id="waitlist" style={{...sec(),background:`radial-gradient(ellipse 80% 60% at 50% 0%,${C.gm}10 0%,transparent 55%),${C.void}`}}>
          <div style={narrow}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <Ey t="Limited Founding Spots"/>
              <h2 style={H('clamp(28px,5vw,54px)')}>Every day you wait is a day<br/>your competitors <span style={{color:C.gl,fontStyle:'italic'}}>get further ahead.</span></h2>
              <p style={{fontSize:16,color:'rgba(205,217,236,0.65)',maxWidth:560,margin:'0 auto',lineHeight:1.8}}>The businesses that join today will have months of marketing advantage before their competitors understand what they're doing differently.</p>
            </div>

            <div style={{background:`linear-gradient(160deg,${C.s1},${C.s2})`,border:`1px solid ${C.gm}28`,borderRadius:20,padding:'clamp(26px,5vw,52px)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${C.gm},transparent)`}}/>
              <div style={{marginBottom:20}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:8,background:`${C.gm}18`,border:`1px solid ${C.gm}35`,color:C.gl,fontSize:11,fontWeight:700,padding:'6px 16px',borderRadius:20,letterSpacing:'.5px'}}>⏳ Founding member pricing — closes at 1,000 members</span>
              </div>
              <h3 style={{fontFamily:"'Georgia',serif",fontSize:'clamp(20px,3vw,28px)',color:'#FFFFFF',marginBottom:8}}>
                Secure your founding member spot — <span style={{color:C.gl,fontStyle:'italic'}}>it's free to join</span>
              </h3>
              <p style={{fontSize:14,color:'rgba(205,217,236,0.6)',marginBottom:28}}>Join the waitlist now. We'll send your launch access on June 1stth. No card required.</p>

              {done?(
                <div style={{background:`${C.teal}0E`,border:`1px solid ${C.teal}30`,borderRadius:14,padding:32,textAlign:'center'}}>
                  <div style={{fontSize:52,marginBottom:12}}>🎉</div>
                  <h3 style={{fontFamily:"'Georgia',serif",fontSize:24,color:C.tl,marginBottom:10}}>You're on the list!</h3>
                  <p style={{fontSize:14,color:'rgba(205,217,236,0.68)',lineHeight:1.8}}>We've received your details. We'll send your launch access on June 1stth, 2026. You're officially a Cerebre Plus founding member.</p>
                  <a href={wa("Hi! I just joined the Cerebre Plus waitlist. I'd love to learn more.")} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:8,marginTop:16,color:C.tl,fontWeight:700,fontSize:14}}>
                    <WaIcon sz={18} col={C.tl}/> Message us on WhatsApp →
                  </a>
                </div>
              ):(
                <div className="fmg">
                  <FF label="Full Name" req err={er.name}><input style={IS} type="text" placeholder="Your full name" value={form.name} onChange={e=>sf('name',e.target.value)} autoComplete="name"/></FF>
                  <FF label="Email Address" req err={er.email}><input style={IS} type="email" placeholder="your@email.com" value={form.email} onChange={e=>sf('email',e.target.value)} autoComplete="email"/></FF>
                  <FF label="WhatsApp / Phone" req err={er.phone}><input style={IS} type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e=>sf('phone',e.target.value)}/></FF>
                  <FF label="Business Name" req err={er.biz}><input style={IS} type="text" placeholder="Your business name" value={form.biz} onChange={e=>sf('biz',e.target.value)}/></FF>
                  <FF label="Industry" req err={er.industry}>
                    <select style={{...IS,appearance:'none',cursor:'pointer'}} value={form.industry} onChange={e=>sf('industry',e.target.value)}>
                      <option value="" disabled>Select your industry</option>
                      {['Fashion & Clothing','Food & Beverages','Beauty & Personal Care','Health & Wellness','Real Estate & Property','Education & Training','Technology & Software','Retail & E-commerce','Professional Services','Events & Entertainment','Logistics & Delivery','Finance & Fintech','Agriculture','Media & Content Creation','Hospitality & Travel','Manufacturing','Other'].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </FF>
                  <FF label="Business Size" req err={er.size}>
                    <select style={{...IS,appearance:'none',cursor:'pointer'}} value={form.size} onChange={e=>sf('size',e.target.value)}>
                      <option value="" disabled>How many on your team?</option>
                      {['Just me (solopreneur)','2–5 people','6–15 people','16–50 people','50+ people'].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </FF>
                  <FF label="Plan Interest">
                    <select style={{...IS,appearance:'none',cursor:'pointer'}} value={form.plan} onChange={e=>sf('plan',e.target.value)}>
                      <option value="" disabled>Which plan interests you?</option>
                      {['Free — ₦0/month','Starter — ₦20,000/month','Growth — ₦35,000/month','Not sure yet'].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </FF>
                  <FF label="How Did You Find Us?">
                    <select style={{...IS,appearance:'none',cursor:'pointer'}} value={form.source} onChange={e=>sf('source',e.target.value)}>
                      <option value="" disabled>Select one</option>
                      {['Instagram','Facebook','WhatsApp','Twitter / X','LinkedIn','TikTok','Referral from a friend','Google Search','Other'].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </FF>
                  <div className="fmf" style={{gridColumn:'1/-1'}}>
                    <FF label="Your Biggest Marketing Challenge Right Now">
                      <input style={IS} type="text" placeholder="e.g. I can't get my ads to convert, I don't know what to post..." value={form.challenge} onChange={e=>sf('challenge',e.target.value)}/>
                    </FF>
                  </div>
                  <div className="fmf" style={{gridColumn:'1/-1'}}>
                    <GBtn ch={busy?'⏳ Securing your spot...':'🚀 Join the Waitlist — Secure My Founding Spot'} onClick={submit} full lg/>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div style={{marginTop:32,paddingTop:28,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.muted,marginBottom:8}}>
                  <span>Progress to 1,000 founding members</span><span>{pct}%</span>
                </div>
                <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${C.gold},${C.gl})`,borderRadius:3}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:"'Georgia',serif",fontSize:26,color:C.gl}}>{count.toLocaleString()}</div>
                    <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'1.5px'}}>Spots claimed</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:"'Georgia',serif",fontSize:26,color:C.tl}}>{(1000-count).toLocaleString()}</div>
                    <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'1.5px'}}>Spots left</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust row */}
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'12px 24px',marginTop:24}}>
              {['First generation completely free','No credit card to join','Founding price locked forever','30-day money-back guarantee','Cancel anytime'].map(t=><Tick key={t} t={t}/>)}
            </div>
          </div>
        </section>


        {/* ════════════ FAQ ════════════ */}
        <section id="faq" style={sec(C.ink)}>
          <div style={narrow}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <Ey t="Common Questions"/>
              <h2 style={H('clamp(28px,5vw,54px)')}>You probably want to know <span style={{color:C.gl,fontStyle:'italic'}}>these answers first.</span></h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {FAQS.map(([q,a],i)=>(
                <FAQ key={i} q={q} a={a} open={faq===i} toggle={()=>setFaq(faq===i?null:i)}/>
              ))}
            </div>
          </div>
        </section>


        {/* ════════════ FINAL CTA ════════════ */}
        <section style={{...sec(),background:`radial-gradient(ellipse 90% 70% at 50% 110%,${C.gm}12 0%,transparent 55%),${C.void}`}}>
          <div style={{...narrow,textAlign:'center'}}>
            <div style={{marginBottom:24}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:8,background:`${C.gm}18`,border:`1px solid ${C.gm}35`,color:C.gl,fontSize:11,fontWeight:700,padding:'6px 16px',borderRadius:20}}>⏳ June 1stth launch — founding price closing soon</span>
            </div>
            <h2 style={{...H('clamp(34px,6.5vw,72px)'),marginBottom:18}}>
              You already have<br/>a great business.<br/><span style={{color:C.gl,fontStyle:'italic'}}>Show the world.</span>
            </h2>
            <p style={{fontSize:16,color:'rgba(205,217,236,0.65)',maxWidth:560,margin:'0 auto 32px',lineHeight:1.8}}>You work hard. You know your customers better than anyone. What you need is the marketing system to show the world what you've built. Cerebre Plus is that system.</p>
            <GBtn ch="Join the Waitlist — It's Free →" onClick={()=>goto('waitlist')} lg/>
            <div style={{fontSize:13,color:'rgba(205,217,236,0.35)',margin:'14px 0 28px'}}>
              Or <a href={wa("Hi! I want to know more about Cerebre Plus before joining.")} target="_blank" rel="noopener noreferrer" style={{color:'rgba(37,211,102,0.75)',fontWeight:700}}>WhatsApp us →</a>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'10px 20px',marginBottom:40}}>
              {['Free to join','First generation free','Founding price locked','30-day guarantee'].map(t=><Tick key={t} t={t}/>)}
            </div>
            <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:'24px 28px',textAlign:'left',maxWidth:600,margin:'0 auto'}}>
              <p style={{fontSize:13,color:'rgba(205,217,236,0.48)',fontStyle:'italic',lineHeight:1.75,marginBottom:10}}>
                <strong style={{color:'rgba(205,217,236,0.62)',fontStyle:'normal'}}>P.S.</strong> The founding member price closes at 1,000 members. If you're still reading this, you already know this is what your business needs. The only question is whether you're going to act today or wait until the price goes up.
              </p>
              <p style={{fontSize:13,color:'rgba(205,217,236,0.38)',fontStyle:'italic',lineHeight:1.75}}>
                <strong style={{color:'rgba(205,217,236,0.48)',fontStyle:'normal'}}>P.P.S.</strong> Your first generation is completely free. Try it first. See what it produces for your real business. Then decide. What do you have to lose?
              </p>
            </div>
          </div>
        </section>


        {/* ════════════ FOOTER ════════════ */}
        <footer style={{background:C.ink,borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:60}}>
          <div style={{maxWidth:1120,margin:'0 auto',padding:'0 clamp(18px,5%,48px)',paddingBottom:48}}>
            <div className="fg">
              {/* Brand */}
              <div className="fb">
                <Image src="/Cerebre_Plus_2.png" alt="Cerebre Plus" width={150} height={73} style={{objectFit:'contain',mixBlendMode:'screen',display:'block',marginBottom:8}}/>
                <span style={{display:'block',fontSize:10,color:`${C.gm}55`,letterSpacing:'2px',textTransform:'uppercase',marginBottom:14}}>A product of Cerebre Media Africa</span>
                <p style={{fontSize:13.5,color:'rgba(205,217,236,0.42)',lineHeight:1.75,maxWidth:280}}>Africa's AI-powered marketing platform. 40 tools live on June 1stth. Built for every African business owner who deserves better marketing.</p>
                <div style={{display:'flex',gap:10,marginTop:20}}>
                  {[['#','📸'],['#','🎵'],['#','💼'],['#','✕'],[`https://wa.me/${WA}`,'💬']].map(([href,e],i)=>(
                    <a key={i} href={href} target={href.startsWith('http')?'_blank':undefined} rel="noopener noreferrer" style={{width:36,height:36,borderRadius:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{e}</a>
                  ))}
                </div>
              </div>
              {/* Link cols */}
              {[
                {title:'Platform',links:[['#tools','The 40 Tools'],['#how','How It Works'],['#pricing','Pricing'],['#faq','FAQs'],['#waitlist','Join Waitlist']]},
                {title:'Company',links:[['#','About Us'],['#','Cerebre Media Africa'],['#','Our Africa Vision'],['#','Careers'],['#','Press']]},
                {title:'Support',links:[['#','Help Centre'],['#','WhatsApp Us'],['#','Privacy Policy'],['#','Terms of Service'],['#','Contact']]},
              ].map(col=>(
                <div key={col.title}>
                  <h4 style={{fontSize:10,fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(205,217,236,0.35)',marginBottom:18}}>{col.title}</h4>
                  <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:11}}>
                    {col.links.map(([href,lbl])=>(
                      <li key={lbl}><a href={href} onClick={href.startsWith('#')?(e)=>{e.preventDefault();goto(href.slice(1))}:undefined} style={{fontSize:13.5,color:'rgba(205,217,236,0.5)'}}>{lbl}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div style={{maxWidth:1120,margin:'0 auto',padding:'18px clamp(18px,5%,48px)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,borderTop:'1px solid rgba(255,255,255,0.04)'}}>
            <span style={{fontSize:12,color:'rgba(205,217,236,0.28)'}}>© 2026 Cerebre Media Africa. All Rights Reserved. Lagos, Nigeria.</span>
            <span style={{fontSize:12,color:'rgba(205,217,236,0.28)'}}>Cerebre Plus — <strong style={{color:`${C.gm}55`}}>A product of Cerebre Media Africa</strong></span>
          </div>
        </footer>

        {/* ── WA FLOAT ── */}
        <a href={wa("Hi! I found Cerebre Plus and I'd like to know more before launch.")} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" style={{position:'fixed',bottom:28,right:28,zIndex:999,width:58,height:58,borderRadius:'50%',background:`linear-gradient(135deg,${C.wad},${C.wa})`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 24px rgba(37,211,102,0.35)',animation:'wap 3s ease infinite'}}>
          <WaIcon sz={26}/>
        </a>

      </div>
    </>
  )
}
