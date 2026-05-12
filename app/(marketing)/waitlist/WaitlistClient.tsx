'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(marketing)/waitlist/WaitlistClient.tsx
// 8-section sales page. Every section applies Cerebre Plus's laws.
// Law 1 (Awoof): Hero section — ₦1.2M vs ₦18,000
// Law 6 (Story): The two-business story
// Law 3+9: Testimonials + social proof
// Law 8: FAQ objection handling
// Law 1+3: 30-day guarantee
// Law 10: Final CTA with founding member scarcity
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter }  from 'next/navigation'


const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --void: #06080E;
    --ink:  #090C16;
    --s1:   #0C1020;
    --s2:   #101528;
    --s3:   #151C35;
    --gold:     #C8880A;
    --gold-m:   #E09C12;
    --gold-l:   #F5B830;
    --gold-dim: rgba(200,136,10,.12);
    --gold-glow:rgba(240,184,48,.18);
    --teal:   #0BA890;
    --teal-l: #12D4B4;
    --teal-dim:rgba(11,168,144,.1);
    --coral:  #E84830;
    --wa:     #25D366;
    --wa-dark:#128C7E;
    --text:   #CDD9EC;
    --text-bright:#E8F0F9;
    --muted:  #3D5570;
    --border: #131E38;
    --border-mid:rgba(255,255,255,.07);
    --fd:'Fraunces',Georgia,serif;
    --fb:'Syne',system-ui,sans-serif;
    --fm:'DM Mono',monospace;
    --radius-sm:8px;
    --radius-md:14px;
    --radius-lg:20px;
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; font-size:16px; }

  body {
    font-family:var(--fb);
    background:var(--void);
    color:var(--text);
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
    line-height:1.7;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:var(--void); }
  ::-webkit-scrollbar-thumb { background:rgba(200,136,10,.4); border-radius:4px; }

  /* ── Animations ── */
  @keyframes blink {
    0%,100%{opacity:1} 50%{opacity:.25}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(22px)}
    to{opacity:1;transform:none}
  }
  @keyframes waPulse {
    0%,100%{box-shadow:0 6px 24px rgba(37,211,102,.35)}
    50%{box-shadow:0 6px 24px rgba(37,211,102,.35),0 0 0 10px rgba(37,211,102,.06)}
  }
  @keyframes goldShimmer {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
  }
  @keyframes borderGlow {
    0%,100%{opacity:.4} 50%{opacity:1}
  }
  @keyframes float {
    0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)}
  }

  /* ── Strip ── */
  .cp-strip {
    background:linear-gradient(90deg,rgba(200,136,10,.16),rgba(11,168,144,.12),rgba(200,136,10,.16));
    border-bottom:1px solid rgba(200,136,10,.2);
    padding:11px 5%;
    display:flex; align-items:center; justify-content:center;
    gap:12px; flex-wrap:wrap;
    font-size:12.5px; font-weight:600;
    color:rgba(205,217,236,.75); letter-spacing:.3px;
  }
  .cp-strip-dot {
    width:7px; height:7px; border-radius:50%;
    background:var(--teal-l);
    animation:blink 2s ease infinite; flex-shrink:0;
  }
  .cp-strip strong { color:var(--gold-l); }
  .cp-strip-pill {
    background:rgba(200,136,10,.15);
    border:1px solid rgba(200,136,10,.3);
    color:var(--gold-l);
    padding:3px 11px; border-radius:20px;
    font-size:11px; font-weight:700; letter-spacing:.5px;
  }

  /* ── Nav ── */
  .cp-nav {
    position:fixed; top:0; left:0; right:0; z-index:900;
    height:68px;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 5%;
    background:rgba(6,8,14,.94);
    backdrop-filter:blur(28px) saturate(180%);
    border-bottom:1px solid rgba(255,255,255,.04);
    transition:border-color .3s, box-shadow .3s;
  }
  .cp-nav.scrolled {
    border-bottom-color:rgba(200,136,10,.18);
    box-shadow:0 4px 32px rgba(0,0,0,.4);
  }
  .cp-logo {
    display:flex; flex-direction:column;
    line-height:1; text-decoration:none;
  }
  .cp-logo-main {
    font-family:var(--fd);
    font-size:23px; font-weight:700;
    color:#fff; letter-spacing:-.3px;
  }
  .cp-logo-main em { color:var(--gold-l); font-style:italic; }
  .cp-logo-sub {
    font-size:7.5px; color:rgba(200,136,10,.45);
    letter-spacing:3px; text-transform:uppercase; margin-top:2px;
  }
  .cp-nav-links {
    display:flex; align-items:center; gap:30px;
  }
  .cp-nav-links a {
    font-size:13px; font-weight:600;
    color:rgba(205,217,236,.6); text-decoration:none;
    letter-spacing:.2px; transition:color .2s;
  }
  .cp-nav-links a:hover { color:var(--gold-l); }
  .cp-nav-right { display:flex; align-items:center; gap:8px; }
  .cp-nbtn {
    font-family:var(--fb); font-size:13px; font-weight:700;
    padding:9px 22px; border-radius:var(--radius-sm);
    cursor:pointer; text-decoration:none;
    transition:all .22s; border:none;
    display:inline-flex; align-items:center; gap:6px; letter-spacing:.2px;
  }
  .cp-nbtn-ghost {
    background:transparent;
    border:1px solid rgba(255,255,255,.12);
    color:rgba(205,217,236,.65);
  }
  .cp-nbtn-ghost:hover { border-color:rgba(200,136,10,.4); color:var(--gold-l); }
  .cp-nbtn-cta {
    background:linear-gradient(135deg,var(--gold-m),var(--gold-l));
    color:var(--void); font-weight:800;
  }
  .cp-nbtn-cta:hover {
    transform:translateY(-1px);
    box-shadow:0 8px 28px rgba(200,136,10,.4);
  }
  .cp-nbtn-white {
    background:#fff; color:var(--void); font-weight:800;
  }
  .cp-nbtn-white:hover {
    transform:translateY(-1px);
    box-shadow:0 8px 28px rgba(255,255,255,.2);
  }
  .cp-hamburger {
    display:none; background:none; border:none;
    cursor:pointer; padding:8px;
    color:var(--text-bright);
    flex-direction:column; gap:5px; align-items:flex-end;
  }
  .cp-hamburger span {
    display:block; height:2px;
    background:var(--text-bright); border-radius:2px;
    transition:all .3s;
  }
  .cp-hamburger span:nth-child(1) { width:24px; }
  .cp-hamburger span:nth-child(2) { width:18px; }
  .cp-hamburger span:nth-child(3) { width:22px; }

  /* ── Mobile Menu ── */
  .cp-mm {
    position:fixed; inset:0;
    background:rgba(6,8,14,.98);
    z-index:890;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:32px;
    opacity:0; pointer-events:none;
    transition:opacity .3s;
  }
  .cp-mm.open { opacity:1; pointer-events:auto; }
  .cp-mm-close {
    position:absolute; top:24px; right:5%;
    background:none; border:none;
    color:var(--text); font-size:28px; cursor:pointer;
    font-family:var(--fd);
    transition:color .2s;
  }
  .cp-mm-close:hover { color:var(--gold-l); }
  .cp-mm a {
    font-family:var(--fd); font-size:32px; font-weight:700;
    color:rgba(205,217,236,.8); text-decoration:none;
    transition:color .2s;
    position:relative;
  }
  .cp-mm a::after {
    content:''; position:absolute;
    bottom:-4px; left:0; width:0; height:2px;
    background:var(--gold-l); transition:width .3s;
  }
  .cp-mm a:hover { color:#fff; }
  .cp-mm a:hover::after { width:100%; }
  .cp-mm a.cta { color:var(--gold-l); }

  /* ── Hero ── */
  .cp-hero {
    min-height:100vh;
    display:flex; align-items:center;
    padding:130px 5% 80px;
    position:relative; overflow:hidden;
    background:
      radial-gradient(ellipse 120% 80% at 110% -20%,rgba(200,136,10,.12) 0%,transparent 50%),
      radial-gradient(ellipse 80% 70% at -20% 90%,rgba(11,168,144,.09) 0%,transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 60%,rgba(21,28,53,.6) 0%,transparent 55%),
      linear-gradient(180deg,var(--void) 0%,var(--ink) 100%);
  }
  .cp-hero-grid {
    position:absolute; inset:0; pointer-events:none;
    background-image:
      linear-gradient(rgba(19,30,56,.3) 1px,transparent 1px),
      linear-gradient(90deg,rgba(19,30,56,.3) 1px,transparent 1px);
    background-size:56px 56px;
  }
  .cp-hero-glow {
    position:absolute; right:-10%; top:10%;
    width:600px; height:600px;
    border-radius:50%;
    background:radial-gradient(circle,rgba(200,136,10,.06) 0%,transparent 70%);
    pointer-events:none;
    animation:float 8s ease infinite;
  }
  .cp-hero-inner {
    position:relative; z-index:2; max-width:920px;
  }
  .cp-hero-inner > * { animation:fadeUp .65s ease both; }
  .cp-launch-tag {
    display:inline-flex; align-items:center; gap:10px;
    background:rgba(18,212,180,.07);
    border:1px solid rgba(18,212,180,.2);
    color:rgba(18,212,180,.9);
    font-size:11px; font-weight:700; letter-spacing:2px;
    text-transform:uppercase;
    padding:7px 18px; border-radius:30px;
    margin-bottom:28px;
  }
  .cp-launch-dot {
    width:6px; height:6px; border-radius:50%;
    background:var(--teal-l);
    animation:blink 1.6s ease infinite;
  }
  .cp-hero h1 {
    font-family:var(--fd);
    font-size:clamp(44px,9vw,100px);
    font-weight:900; line-height:.92;
    margin-bottom:26px; color:#fff;
  }
  .cp-hero h1 em { font-style:italic; color:var(--gold-l); }
  .cp-hero-deck {
    font-size:clamp(16px,2.1vw,20px);
    color:rgba(205,217,236,.62); max-width:640px;
    line-height:1.8; margin-bottom:12px;
  }
  .cp-hero-deck strong { color:var(--text-bright); font-weight:600; }
  .cp-compare-row {
    display:flex; flex-wrap:wrap;
    gap:12px 20px; margin-bottom:38px;
  }
  .cp-cmp { display:flex; align-items:center; gap:8px; font-size:13px; }
  .cp-cmp-x { color:var(--coral); font-size:15px; }
  .cp-cmp-val { color:rgba(205,217,236,.5); }
  .cp-cmp-val strong { color:rgba(205,217,236,.8); }
  .cp-cmp-arrow { color:var(--gold-m); font-weight:800; font-size:14px; }
  .cp-hero-btns {
    display:flex; flex-wrap:wrap; gap:14px;
    margin-top:8px; margin-bottom:28px;
  }
  .cp-hero-trust {
    display:flex; flex-wrap:wrap; gap:14px 22px;
  }
  .cp-ht { display:flex; align-items:center; gap:7px; font-size:12.5px; color:rgba(205,217,236,.45); }
  .cp-ht-ok {
    width:17px; height:17px; border-radius:50%;
    background:rgba(11,168,144,.12);
    border:1px solid rgba(11,168,144,.25);
    display:flex; align-items:center; justify-content:center;
    font-size:8px; color:var(--teal-l); flex-shrink:0;
  }

  /* ── Countdown ── */
  .cp-countdown {
    background:linear-gradient(135deg,var(--s2),var(--s3));
    border:1px solid rgba(200,136,10,.22);
    border-radius:var(--radius-lg);
    padding:32px 36px; margin-top:44px;
    display:inline-flex; flex-direction:column; gap:10px;
    animation:fadeUp .7s .5s ease both;
  }
  .cp-cd-label {
    font-size:9px; font-weight:700; letter-spacing:3px;
    text-transform:uppercase; color:rgba(200,136,10,.65);
    margin-bottom:4px;
  }
  .cp-cd-units { display:flex; gap:16px; align-items:center; }
  .cp-cd-unit { text-align:center; }
  .cp-cd-num {
    font-family:var(--fd);
    font-size:clamp(40px,7vw,66px);
    font-weight:900; color:var(--gold-l); line-height:1;
    display:block; min-width:2ch;
  }
  .cp-cd-sep {
    font-family:var(--fd);
    font-size:clamp(32px,5vw,52px);
    color:rgba(200,136,10,.35); line-height:1;
    margin-bottom:14px;
    animation:blink 1s ease infinite;
  }
  .cp-cd-unit-lbl {
    font-size:8.5px; color:var(--muted);
    text-transform:uppercase; letter-spacing:2px; margin-top:4px;
  }
  .cp-cd-date {
    font-size:12px; color:rgba(205,217,236,.4);
    border-top:1px solid rgba(255,255,255,.05);
    padding-top:10px; font-family:var(--fm);
  }
  .cp-cd-date strong { color:rgba(205,217,236,.65); }

  /* ── Stat band ── */
  .cp-stat-band {
    display:grid; grid-template-columns:repeat(4,1fr);
    border:1px solid rgba(255,255,255,.06);
    border-radius:var(--radius-md); overflow:hidden;
    max-width:780px; margin-top:52px;
    background:rgba(255,255,255,.02);
    animation:fadeUp .65s .52s ease both;
  }
  .cp-sb {
    padding:20px 16px;
    border-right:1px solid rgba(255,255,255,.05);
    text-align:center;
  }
  .cp-sb:last-child { border-right:none; }
  .cp-sb-val { font-family:var(--fd); font-size:30px; color:var(--gold-l); }
  .cp-sb-lbl {
    font-size:8.5px; color:var(--muted);
    text-transform:uppercase; letter-spacing:1.5px; margin-top:3px;
  }

  /* ── Section scaffold ── */
  .cp-s { padding:96px 0; }
  .cp-s-alt { background:var(--ink); }
  .cp-max { max-width:1160px; margin:0 auto; padding:0 5%; }
  .cp-max-n { max-width:820px; margin:0 auto; padding:0 5%; }
  .cp-ey {
    font-size:9px; font-weight:700;
    letter-spacing:3.5px; text-transform:uppercase;
    color:var(--gold-m); margin-bottom:12px; display:block;
  }
  .cp-ey.t { color:var(--teal); }
  .cp-ey.r { color:var(--coral); }
  .cp-sh {
    font-family:var(--fd);
    font-size:clamp(30px,5vw,60px);
    font-weight:700; line-height:1.05; margin-bottom:14px;
  }
  .cp-sh em { font-style:italic; color:var(--gold-l); }
  .cp-sl { font-size:16px; color:rgba(205,217,236,.55); line-height:1.84; max-width:640px; }
  .cp-center { text-align:center; }
  .cp-center .cp-sl { margin:0 auto; }

  /* ── Scroll reveal ── */
  .rv { opacity:0; transform:translateY(28px); transition:all .72s cubic-bezier(.22,1,.36,1); }
  .rv.in { opacity:1; transform:none; }
  .d1 { transition-delay:.08s!important; }
  .d2 { transition-delay:.18s!important; }
  .d3 { transition-delay:.28s!important; }

  /* ── Pain cards ── */
  .cp-pain-grid {
    display:grid; grid-template-columns:repeat(2,1fr);
    gap:16px; margin-top:48px;
  }
  .cp-pain-card {
    background:rgba(232,72,48,.04);
    border:1px solid rgba(232,72,48,.12);
    border-radius:var(--radius-md); padding:28px 26px;
    display:flex; gap:16px; transition:all .3s;
  }
  .cp-pain-card:hover {
    border-color:rgba(232,72,48,.28);
    background:rgba(232,72,48,.08);
    transform:translateY(-2px);
  }
  .cp-pain-icon {
    width:44px; height:44px; border-radius:10px;
    background:rgba(232,72,48,.08);
    border:1px solid rgba(232,72,48,.14);
    display:flex; align-items:center; justify-content:center;
    font-size:18px; flex-shrink:0; margin-top:2px;
  }
  .cp-pain-title { font-weight:700; font-size:14px; color:var(--text-bright); margin-bottom:6px; }
  .cp-pain-body { font-size:13px; color:rgba(205,217,236,.5); line-height:1.68; }
  .cp-pain-cost {
    margin-top:10px; display:inline-block;
    background:rgba(232,72,48,.08); border:1px solid rgba(232,72,48,.16);
    color:rgba(255,120,100,.88);
    font-size:10px; font-weight:700; padding:3px 12px;
    border-radius:20px; letter-spacing:.3px;
  }
  .cp-vs-bridge { text-align:center; margin:50px 0; }
  .cp-vs-badge {
    display:inline-block;
    background:rgba(200,136,10,.08);
    border:1px solid rgba(200,136,10,.22);
    color:var(--gold-l); font-size:13px; font-weight:700;
    padding:11px 32px; border-radius:30px; letter-spacing:.3px;
  }

  /* ── Story ── */
  .cp-story-box {
    background:linear-gradient(135deg,var(--s1),var(--s2));
    border:1px solid var(--border);
    border-radius:var(--radius-lg); padding:48px;
    position:relative; overflow:hidden; margin-top:40px;
  }
  .cp-story-box::before {
    content:'"'; position:absolute;
    top:-30px; right:28px;
    font-family:var(--fd); font-size:220px;
    color:rgba(200,136,10,.04); line-height:1; pointer-events:none;
  }
  .cp-story-label {
    font-size:9px; font-weight:700; letter-spacing:2.5px;
    color:var(--gold-m); text-transform:uppercase; margin-bottom:18px;
  }
  .cp-story-text {
    font-family:var(--fd);
    font-size:clamp(19px,2.8vw,28px);
    font-style:italic; color:#fff; line-height:1.52; margin-bottom:24px;
  }
  .cp-story-text em { color:var(--gold-l); font-style:normal; }
  .cp-story-hr {
    height:1px;
    background:linear-gradient(90deg,transparent,var(--border),transparent);
    margin:24px 0;
  }
  .cp-story-lesson { font-size:15px; color:rgba(205,217,236,.68); line-height:1.82; }
  .cp-story-lesson + .cp-story-lesson { margin-top:14px; }
  .cp-story-attr { font-size:12px; color:var(--muted); margin-top:16px; }

  /* ── Tools ── */
  .cp-tool-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:48px; }
  .cp-tool-card {
    background:rgba(255,255,255,.025);
    border:1px solid rgba(255,255,255,.06);
    border-radius:var(--radius-md); padding:26px;
    position:relative; overflow:hidden; transition:all .3s; cursor:default;
  }
  .cp-tool-card::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(200,136,10,.06),transparent 60%);
    opacity:0; transition:opacity .3s;
  }
  .cp-tool-card:hover {
    border-color:rgba(200,136,10,.32);
    transform:translateY(-4px);
    box-shadow:0 16px 48px rgba(0,0,0,.35);
  }
  .cp-tool-card:hover::before { opacity:1; }
  .cp-tool-live {
    font-size:8px; font-weight:700; letter-spacing:2px; text-transform:uppercase;
    color:var(--teal); display:flex; align-items:center; gap:5px; margin-bottom:9px;
  }
  .cp-tool-dot {
    width:5px; height:5px; border-radius:50%;
    background:var(--teal); animation:blink 1.8s ease infinite;
  }
  .cp-tool-name { font-weight:700; font-size:17px; color:var(--text-bright); margin-bottom:7px; line-height:1.2; }
  .cp-tool-desc { font-size:13px; color:rgba(205,217,236,.5); line-height:1.68; margin-bottom:16px; }
  .cp-tool-foot {
    display:flex; align-items:center; justify-content:space-between;
    padding-top:14px; border-top:1px solid rgba(255,255,255,.05);
  }
  .cp-tool-tag { font-size:10px; font-weight:700; color:rgba(200,136,10,.7); font-family:var(--fm); }
  .cp-more-tools {
    margin-top:20px;
    background:rgba(11,168,144,.05);
    border:1px dashed rgba(11,168,144,.2);
    border-radius:var(--radius-md); padding:22px 28px;
    display:flex; align-items:center; justify-content:space-between;
    flex-wrap:wrap; gap:16px;
  }
  .cp-mtb-title { font-weight:700; color:var(--text-bright); font-size:15px; margin-bottom:4px; }
  .cp-mtb-sub { font-size:13px; color:rgba(205,217,236,.5); }
  .cp-mtb-tags { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
  .cp-mtb-tag {
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    color:rgba(205,217,236,.5); font-size:10px; font-weight:600;
    padding:4px 11px; border-radius:20px;
  }

  /* ── How it works ── */
  .cp-how-grid {
    display:grid; grid-template-columns:repeat(4,1fr);
    gap:0; margin-top:52px;
    border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden;
  }
  .cp-hs {
    padding:30px 22px;
    border-right:1px solid var(--border);
    background:rgba(255,255,255,.015); transition:background .3s;
  }
  .cp-hs:last-child { border-right:none; }
  .cp-hs:hover { background:rgba(200,136,10,.04); }
  .cp-hs-num {
    font-family:var(--fd); font-size:48px;
    color:rgba(200,136,10,.12); line-height:1; margin-bottom:10px;
  }
  .cp-hs-icon { font-size:26px; margin-bottom:12px; }
  .cp-hs-title { font-weight:700; font-size:14px; color:var(--text-bright); margin-bottom:8px; }
  .cp-hs-desc { font-size:12.5px; color:var(--muted); line-height:1.68; }

  /* ── Benefits ── */
  .cp-benefits-list { display:flex; flex-direction:column; gap:16px; margin-top:48px; }
  .cp-benefit-row {
    display:flex; gap:18px; align-items:flex-start;
    background:rgba(255,255,255,.02); border:1px solid var(--border-mid);
    border-radius:var(--radius-md); padding:24px; transition:all .3s;
  }
  .cp-benefit-row:hover { border-color:rgba(200,136,10,.22); background:rgba(200,136,10,.03); }
  .cp-ben-arrow {
    width:36px; height:36px; border-radius:8px;
    background:linear-gradient(135deg,var(--gold-m),var(--gold-l));
    display:flex; align-items:center; justify-content:center;
    font-size:16px; flex-shrink:0; margin-top:2px;
  }
  .cp-ben-title { font-weight:700; font-size:15px; color:var(--text-bright); margin-bottom:5px; }
  .cp-ben-desc { font-size:13.5px; color:rgba(205,217,236,.55); line-height:1.72; }

  /* ── Pricing ── */
  .cp-price-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:48px; }
  .cp-price-card { border-radius:var(--radius-lg); padding:28px; position:relative; overflow:hidden; }
  .cp-price-card.basic {
    background:rgba(255,255,255,.025);
    border:1px solid rgba(255,255,255,.07);
  }
  .cp-price-card.growth {
    background:linear-gradient(160deg,#100B00,#1A1200,#0A1020);
    border:1px solid rgba(200,136,10,.32);
    box-shadow:0 0 60px rgba(200,136,10,.07);
  }
  .cp-price-card.growth::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,var(--gold-m),transparent);
  }
  .cp-price-badge {
    display:inline-block;
    background:rgba(200,136,10,.15); border:1px solid rgba(200,136,10,.3);
    color:var(--gold-l); font-size:10px; font-weight:700;
    padding:4px 12px; border-radius:20px;
    letter-spacing:1px; text-transform:uppercase; margin-bottom:18px;
  }
  .cp-price-badge.pop {
    background:linear-gradient(135deg,var(--gold-m),var(--gold-l));
    color:var(--void); border:none;
  }
  .cp-price-name { font-family:var(--fd); font-size:26px; font-weight:700; color:#fff; margin-bottom:8px; }
  .cp-price-amount { font-family:var(--fd); font-size:clamp(44px,6vw,66px); font-weight:900; color:var(--gold-l); line-height:1; }
  .cp-price-period { font-size:14px; color:var(--muted); margin-left:4px; }
  .cp-price-was { font-size:12px; color:rgba(205,217,236,.35); text-decoration:line-through; font-family:var(--fm); margin-top:4px; }
  .cp-price-desc { font-size:13.5px; color:rgba(205,217,236,.5); margin:16px 0; line-height:1.68; }
  .cp-price-features { display:flex; flex-direction:column; gap:10px; margin:22px 0; }
  .cp-pf { display:flex; align-items:flex-start; gap:10px; font-size:13px; color:rgba(205,217,236,.65); }
  .cp-pf-ok { color:var(--teal-l); font-size:11px; margin-top:2px; flex-shrink:0; }
  .cp-price-cta {
    display:block; text-align:center; padding:14px;
    border-radius:10px; font-weight:800; font-size:15px;
    cursor:pointer; border:none; font-family:var(--fb);
    text-decoration:none; transition:all .25s; width:100%;
  }
  .cp-price-cta.basic-cta {
    background:rgba(255,255,255,.06); color:var(--text-bright);
    border:1px solid rgba(255,255,255,.12);
  }
  .cp-price-cta.basic-cta:hover { background:rgba(255,255,255,.1); }
  .cp-price-cta.growth-cta {
    background:linear-gradient(135deg,var(--gold-m),var(--gold-l));
    color:var(--void);
  }
  .cp-price-cta.growth-cta:hover {
    transform:translateY(-2px);
    box-shadow:0 12px 32px rgba(200,136,10,.4);
  }
  .cp-agency-compare {
    margin-top:28px;
    background:rgba(11,168,144,.04); border:1px solid rgba(11,168,144,.14);
    border-radius:var(--radius-md); padding:22px 26px;
    display:flex; align-items:center; gap:20px; flex-wrap:wrap;
  }
  .cp-ac-label { font-size:12px; color:rgba(205,217,236,.5); }
  .cp-ac-vs { display:flex; flex-wrap:wrap; gap:12px 24px; margin-top:6px; }
  .cp-ac-item { font-size:13.5px; font-weight:700; }
  .cp-ac-item.bad { color:rgba(232,72,48,.8); }
  .cp-ac-item.good { color:var(--teal-l); }

  /* ── Bonus ── */
  .cp-bonus-list { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:40px; }
  .cp-bonus-item {
    background:linear-gradient(135deg,var(--s1),var(--s2));
    border:1px solid rgba(200,136,10,.14);
    border-radius:var(--radius-md); padding:22px;
    display:flex; gap:14px; align-items:flex-start; transition:all .3s;
  }
  .cp-bonus-item:hover { border-color:rgba(200,136,10,.32); transform:translateY(-2px); }
  .cp-bonus-icon {
    width:38px; height:38px; border-radius:8px;
    background:rgba(200,136,10,.1); border:1px solid rgba(200,136,10,.2);
    display:flex; align-items:center; justify-content:center;
    font-size:16px; flex-shrink:0;
  }
  .cp-bonus-title { font-weight:700; font-size:14px; color:var(--text-bright); margin-bottom:4px; }
  .cp-bonus-desc { font-size:12.5px; color:rgba(205,217,236,.5); line-height:1.62; }

  /* ── Guarantee ── */
  .cp-guar-box {
    background:linear-gradient(160deg,#040800,#0A0C00,#020508);
    border:1px solid rgba(200,136,10,.26);
    border-radius:var(--radius-lg); padding:52px;
    margin-top:40px; position:relative; overflow:hidden;
  }
  .cp-guar-box::before {
    content:'30'; position:absolute; right:-20px; top:-30px;
    font-family:var(--fd); font-size:240px; font-weight:900;
    color:rgba(200,136,10,.04); line-height:1; pointer-events:none;
  }
  .cp-guar-header { display:flex; align-items:center; gap:22px; margin-bottom:28px; }
  .cp-guar-seal {
    width:80px; height:80px; border-radius:50%;
    background:linear-gradient(135deg,var(--gold-m),var(--gold-l));
    display:flex; align-items:center; justify-content:center;
    font-size:32px;
    box-shadow:0 0 40px rgba(200,136,10,.3); flex-shrink:0;
  }
  .cp-guar-title { font-family:var(--fd); font-size:clamp(22px,3.5vw,36px); color:#fff; line-height:1.15; }
  .cp-guar-title em { font-style:italic; color:var(--gold-l); }
  .cp-guar-body { font-size:15px; color:rgba(205,217,236,.65); line-height:1.84; margin-bottom:24px; }
  .cp-guar-promise {
    font-family:var(--fd); font-size:clamp(16px,2.2vw,20px); font-style:italic;
    color:rgba(205,217,236,.8); border-left:3px solid var(--gold-m);
    padding-left:20px; line-height:1.55;
  }

  /* ── Waitlist form ── */
  .cp-wl-s {
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%,rgba(200,136,10,.08) 0%,transparent 60%),
      var(--void);
  }
  .cp-wl-box {
    background:linear-gradient(160deg,var(--s1),var(--s2));
    border:1px solid rgba(200,136,10,.2);
    border-radius:var(--radius-lg); padding:52px;
    margin-top:40px; position:relative; overflow:hidden;
  }
  .cp-wl-box::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,var(--gold-m),transparent);
  }
  .cp-urgency-tag {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(200,136,10,.1); border:1px solid rgba(200,136,10,.22);
    color:var(--gold-l); font-size:11px; font-weight:700;
    padding:6px 16px; border-radius:20px; letter-spacing:.5px; margin-bottom:22px;
  }
  .cp-wl-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:28px; }
  .cp-wl-form-full { grid-column:1/-1; }
  .cp-field-group { display:flex; flex-direction:column; gap:6px; }
  .cp-field-label {
    font-size:11.5px; font-weight:700;
    color:rgba(205,217,236,.55); text-transform:uppercase; letter-spacing:1px;
  }
  .cp-field-label span { color:var(--coral); margin-left:2px; }
  .cp-wl-input, .cp-wl-select {
    background:rgba(255,255,255,.05);
    border:1.5px solid rgba(255,255,255,.1);
    border-radius:10px; padding:13px 16px;
    color:var(--text-bright); font-family:var(--fb);
    font-size:14px; outline:none; transition:all .2s; width:100%;
  }
  .cp-wl-input::placeholder { color:rgba(205,217,236,.3); }
  .cp-wl-input:focus, .cp-wl-select:focus {
    border-color:rgba(200,136,10,.5);
    background:rgba(200,136,10,.04);
    box-shadow:0 0 0 3px rgba(200,136,10,.07);
  }
  .cp-wl-select {
    cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23C8880A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 14px center;
  }
  .cp-wl-select option { background:var(--s2); color:var(--text-bright); }
  .cp-wl-submit {
    grid-column:1/-1;
    background:linear-gradient(135deg,var(--gold-m),var(--gold-l));
    color:var(--void); font-family:var(--fb); font-size:16px;
    font-weight:800; padding:17px 36px; border-radius:12px;
    border:none; cursor:pointer; transition:all .28s;
    width:100%; display:flex; align-items:center;
    justify-content:center; gap:8px; letter-spacing:.3px;
    position:relative; overflow:hidden;
  }
  .cp-wl-submit:hover {
    transform:translateY(-2px);
    box-shadow:0 14px 40px rgba(200,136,10,.42);
  }
  .cp-wl-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .cp-wl-error { font-size:11.5px; color:rgba(232,72,48,.85); margin-top:4px; display:none; }
  .cp-wl-error.show { display:block; }
  .cp-scarcity-bar {
    margin-top:32px; padding-top:28px;
    border-top:1px solid rgba(255,255,255,.05);
    display:flex; align-items:center; justify-content:space-between;
    flex-wrap:wrap; gap:20px;
  }
  .cp-sc-item { text-align:center; }
  .cp-sc-num { font-family:var(--fd); font-size:28px; color:var(--gold-l); }
  .cp-sc-lbl { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; margin-top:3px; }
  .cp-sc-bar-wrap { flex:1; min-width:200px; }
  .cp-sc-bar-label { display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-bottom:6px; }
  .cp-sc-bar { height:6px; background:rgba(255,255,255,.06); border-radius:3px; overflow:hidden; }
  .cp-sc-bar-fill {
    height:100%;
    background:linear-gradient(90deg,var(--gold),var(--gold-l));
    border-radius:3px; transition:width 2s cubic-bezier(.22,1,.36,1);
  }

  /* ── FAQ ── */
  .cp-faq-list { margin-top:40px; display:flex; flex-direction:column; gap:12px; }
  .cp-faq-item {
    border:1px solid rgba(255,255,255,.06);
    border-radius:var(--radius-md); overflow:hidden; transition:border-color .3s;
  }
  .cp-faq-item.open { border-color:rgba(200,136,10,.24); }
  .cp-faq-q {
    width:100%; background:none; border:none;
    color:var(--text-bright); font-family:var(--fb);
    font-size:14.5px; font-weight:700; padding:20px 24px;
    text-align:left; cursor:pointer;
    display:flex; align-items:center; justify-content:space-between;
    gap:12px; transition:all .2s;
  }
  .cp-faq-q:hover { color:#fff; }
  .cp-faq-icon { color:var(--gold-m); font-size:20px; transition:transform .3s; flex-shrink:0; line-height:1; }
  .cp-faq-item.open .cp-faq-icon { transform:rotate(45deg); }
  .cp-faq-a { max-height:0; overflow:hidden; transition:max-height .4s ease; padding:0 24px; }
  .cp-faq-item.open .cp-faq-a { max-height:400px; padding:0 24px 20px; }
  .cp-faq-a p { font-size:14px; color:rgba(205,217,236,.58); line-height:1.8; }

  /* ── Final CTA ── */
  .cp-fcta-s {
    background:
      radial-gradient(ellipse 100% 80% at 50% 100%,rgba(200,136,10,.1) 0%,transparent 55%),
      var(--void);
  }
  .cp-fcta-inner { text-align:center; max-width:700px; margin:0 auto; }
  .cp-fcta-h {
    font-family:var(--fd); font-size:clamp(34px,6.5vw,72px);
    font-weight:900; line-height:.94; margin-bottom:18px; color:#fff;
  }
  .cp-fcta-h em { font-style:italic; color:var(--gold-l); }
  .cp-fcta-sub { font-size:16px; color:rgba(205,217,236,.55); line-height:1.78; margin-bottom:34px; }
  .cp-fcta-trust { display:flex; flex-wrap:wrap; gap:12px 20px; justify-content:center; margin-top:24px; }
  .cp-ft { display:flex; align-items:center; gap:7px; font-size:12.5px; color:rgba(205,217,236,.45); }
  .cp-ft-ok { color:var(--teal-l); }

  /* ── WA Float ── */
  .cp-wa-float {
    position:fixed; bottom:28px; right:28px; z-index:998;
    width:58px; height:58px; border-radius:50%;
    background:linear-gradient(135deg,var(--wa-dark),var(--wa));
    display:flex; align-items:center; justify-content:center;
    text-decoration:none; font-size:26px;
    box-shadow:0 6px 24px rgba(37,211,102,.35);
    transition:all .3s; animation:waPulse 3s ease infinite;
  }
  .cp-wa-float:hover { transform:scale(1.1); box-shadow:0 8px 32px rgba(37,211,102,.5); }
  .cp-wa-tooltip {
    position:absolute; right:70px; bottom:8px;
    background:var(--s2); border:1px solid rgba(37,211,102,.25);
    color:var(--text-bright); font-size:12px; font-weight:600;
    padding:7px 14px; border-radius:8px; white-space:nowrap;
    opacity:0; pointer-events:none; transition:opacity .25s;
  }
  .cp-wa-float:hover .cp-wa-tooltip { opacity:1; }

  /* ── Footer ── */
  footer.cp-footer { background:var(--ink); border-top:1px solid rgba(255,255,255,.04); padding-top:72px; }
  .cp-fg {
    max-width:1160px; margin:0 auto; padding:0 5%;
    display:grid; grid-template-columns:2fr 1fr 1fr 1fr;
    gap:40px; padding-bottom:56px;
  }
  .cp-fl-logo { font-family:var(--fd); font-size:28px; font-weight:700; color:#fff; margin-bottom:5px; }
  .cp-fl-logo em { color:var(--gold-l); font-style:italic; }
  .cp-fl-prod { font-size:10px; color:rgba(200,136,10,.45); letter-spacing:2px; text-transform:uppercase; display:block; margin-bottom:14px; }
  .cp-fl-desc { font-size:13.5px; color:rgba(205,217,236,.4); line-height:1.75; max-width:280px; }
  .cp-fsoc { display:flex; gap:10px; margin-top:20px; }
  .cp-fs-a {
    width:36px; height:36px; border-radius:8px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
    display:flex; align-items:center; justify-content:center;
    font-size:16px; text-decoration:none; transition:all .2s;
  }
  .cp-fs-a:hover { background:rgba(200,136,10,.1); border-color:rgba(200,136,10,.25); }
  .cp-fc h4 { font-size:10px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:rgba(205,217,236,.4); margin-bottom:18px; }
  .cp-fc ul { list-style:none; display:flex; flex-direction:column; gap:11px; }
  .cp-fc ul li a { font-size:13.5px; color:rgba(205,217,236,.5); text-decoration:none; transition:color .2s; }
  .cp-fc ul li a:hover { color:var(--gold-l); }
  .cp-fb-row {
    max-width:1160px; margin:0 auto; padding:18px 5%;
    display:flex; align-items:center; justify-content:space-between;
    flex-wrap:wrap; gap:10px;
    border-top:1px solid rgba(255,255,255,.04);
  }
  .cp-fb-copy { font-size:12px; color:rgba(205,217,236,.28); }
  .cp-fb-brand { font-size:12px; color:rgba(205,217,236,.28); }
  .cp-fb-brand strong { color:rgba(200,136,10,.5); }

  /* ── Responsive ── */
  @media(max-width:900px){
    .cp-nav-links { display:none; }
    .cp-nav-right { display:none; }
    .cp-hamburger { display:flex; }
    .cp-hero-btns { flex-direction:column; }
    .cp-hero-btns a { text-align:center; justify-content:center; }
    .cp-pain-grid { grid-template-columns:1fr; }
    .cp-tool-grid { grid-template-columns:1fr; }
    .cp-how-grid { grid-template-columns:1fr 1fr; }
    .cp-price-grid { grid-template-columns:1fr; }
    .cp-bonus-list { grid-template-columns:1fr; }
    .cp-wl-form-grid { grid-template-columns:1fr; }
    .cp-wl-form-full, .cp-wl-submit { grid-column:auto; }
    .cp-fg { grid-template-columns:1fr 1fr; }
    .cp-fg > div:first-child { grid-column:1/-1; }
    .cp-stat-band { grid-template-columns:repeat(2,1fr); }
    .cp-sb:nth-child(2) { border-right:none; }
    .cp-sb:nth-child(3) { border-top:1px solid rgba(255,255,255,.05); }
    .cp-scarcity-bar { flex-direction:column; text-align:center; }
    .cp-cd-units { gap:8px; }
  }
  @media(max-width:600px){
    .cp-fg { grid-template-columns:1fr; }
    .cp-how-grid { grid-template-columns:1fr; }
    .cp-hero { padding-top:110px; }
    .cp-guar-header { flex-direction:column; text-align:center; }
    .cp-wl-box { padding:32px 22px; }
    .cp-story-box { padding:30px 24px; }
    .cp-countdown { padding:24px 20px; }
    .cp-stat-band { max-width:100%; }
    .cp-nbtn-white { display:none; }
  }
`

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface FormData {
  name: string
  email: string
  phone: string
  bizName: string
  industry: string
  size: string
  plan: string
  source: string
  challenge: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  bizName?: string
  industry?: string
  size?: string
}

// ─────────────────────────────────────────────────────────────
// WHATSAPP SVG ICON
// ─────────────────────────────────────────────────────────────

function WAIcon({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.533 5.851L.057 23.526a.5.5 0 0 0 .617.608l5.87-1.539A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.587-.5-5.084-1.374l-.36-.214-3.736.979.997-3.648-.235-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}




const WA_NUMBER   = '2348124266524'
const WA_URL      = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
const LAUNCH_DATE = new Date('2026-05-18T00:00:00+01:00').getTime() // May 18 midnight WAT
const MEMBER_COUNT = 247
const SHEET_URL   = 'https://script.google.com/macros/s/AKfycbyQ3WI9FMLMpUJw2eFRQjxDtuaVAtzZAiibcODVBQTDTxiCxnTVeIh6g4drUSfHI3Rk/exec'


// ─────────────────────────────────────────────────────────────
// MAIN WAITLIST CLIENT
// ─────────────────────────────────────────────────────────────

export default function WaitlistClient() {
  const router = useRouter()

   // ── State ────────────────────────────────────────────────
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [countdown,   setCountdown]   = useState({ d: '00', h: '00', m: '00', s: '00' })
  const [openFAQ,     setOpenFAQ]     = useState<number | null>(null)
  const [memberCount, setMemberCount] = useState(MEMBER_COUNT)
  const [barWidth,    setBarWidth]    = useState('0%')
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [form,        setForm]        = useState<FormData>({
    name: '', email: '', phone: '', bizName: '',
    industry: '', size: '', plan: '', source: '', challenge: '',
  })
  const [errors,  setErrors]  = useState<FormErrors>({})

  // ── Countdown ────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE - Date.now()
      if (diff <= 0) { setCountdown({ d: '00', h: '00', m: '00', s: '00' }); return }
      const pad = (n: number) => String(n).padStart(2, '0')
      setCountdown({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor((diff / 3600000) % 24)),
        m: pad(Math.floor((diff / 60000) % 60)),
        s: pad(Math.floor((diff / 1000) % 60)),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ── Nav scroll ───────────────────────────────────────────
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // ── Scroll reveal ────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    document.querySelectorAll('.rv').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ── Animated counter ─────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setBarWidth(`${(MEMBER_COUNT / 10).toFixed(1)}%`)
    }, 1400)
    return () => clearTimeout(timer)
  }, [])

  // ── Lock body scroll when menu open ─────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // ── Smooth scroll ────────────────────────────────────────
  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  // ── Form ─────────────────────────────────────────────────
  const setField = (k: keyof FormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (form.name.trim().length < 2)            errs.name     = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email.'
    if (form.phone.trim().length < 7)           errs.phone    = 'Please enter your phone number.'
    if (form.bizName.trim().length < 2)         errs.bizName  = 'Please enter your business name.'
    if (!form.industry)                         errs.industry = 'Please select your industry.'
    if (!form.size)                             errs.size     = 'Please select your team size.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    const payload = {
      timestamp: new Date().toISOString(),
      name: form.name, email: form.email, phone: form.phone,
      businessName: form.bizName, industry: form.industry,
      businessSize: form.size, planInterest: form.plan,
      referralSource: form.source, marketingChallenge: form.challenge,
    }
    // Save to Google Sheet
    try {
      await fetch(SHEET_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {}
    // Backup to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('cerebre_waitlist') || '[]')
      stored.push(payload)
      localStorage.setItem('cerebre_waitlist', JSON.stringify(stored))
    } catch {}
    // Also hit the internal API
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.name.split(' ')[0], email: form.email, source: form.source || 'waitlist' }),
      })
    } catch {}

    setSubmitting(false)
    setSubmitted(true)
    setMemberCount((c) => c + 1)
    setBarWidth(`${((memberCount + 1) / 10).toFixed(1)}%`)
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <>
      {/* Inject styles */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── ANNOUNCE STRIP ── */}
      <div className="cp-strip">
        <div className="cp-strip-dot" />
        <span>Launching <strong>May 18, 2026</strong> — Africa's AI marketing platform is almost here</span>
        <span className="cp-strip-pill">🔥 Founding member pricing now open</span>
      </div>

      {/* ══════════ NAV ══════════ */}
      <nav className={`cp-nav${scrolled ? ' scrolled' : ''}`}>
        {/* Logo — always left */}
        <a href="#top" className="cp-logo" onClick={(e) => { e.preventDefault(); scrollTo('top') }}>
          <span className="cp-logo-main">Cerebre<em>Plus</em></span>
          <span className="cp-logo-sub">by Cerebre Media Africa</span>
        </a>

        {/* Desktop links */}
        <div className="cp-nav-links">
          {[['problem','The Problem'],['tools','40 Tools'],['pricing','Pricing'],['faq','FAQs']].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id) }}>{label}</a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="cp-nav-right">
          <a
            href={WA_URL('Hi! I found Cerebre Plus and want to learn more.')}
            className="cp-nbtn cp-nbtn-ghost"
            target="_blank" rel="noopener noreferrer"
          >
            <WAIcon size={18} /> Chat Us
          </a>
          <a href="#waitlist" className="cp-nbtn cp-nbtn-cta" onClick={(e) => { e.preventDefault(); scrollTo('waitlist') }}>
            Join Waitlist →
          </a>
        </div>

        {/* Hamburger — always right on mobile */}
        <button
          className="cp-hamburger"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`cp-mm${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        <button className="cp-mm-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        {[['problem','The Problem'],['tools','The Tools'],['pricing','Pricing'],['faq','FAQs']].map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id) }}>{label}</a>
        ))}
        <a href="#waitlist" className="cta" onClick={(e) => { e.preventDefault(); scrollTo('waitlist') }}>
          Join Waitlist →
        </a>
        <a
          href={WA_URL('Hi! I found Cerebre Plus and want to learn more.')}
          style={{ fontSize: 14, color: 'rgba(37,211,102,.85)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
          target="_blank" rel="noopener noreferrer"
        >
          <WAIcon size={22} /> Chat on WhatsApp
        </a>
      </div>


      {/* ══════════ HERO ══════════ */}
      <section className="cp-hero" id="top">
        <div className="cp-hero-grid" />
        <div className="cp-hero-glow" />
        <div className="cp-hero-inner">

          <div className="cp-launch-tag" style={{ animationDelay: '0s' }}>
            <span className="cp-launch-dot" />
            <span>Africa's first AI marketing platform — launching May 18</span>
          </div>

          <h1 style={{ animationDelay: '.07s' }}>
            More customers<br />
            from your marketing<br />
            in <em>30 days</em> than<br />
            <strong>the last 300.</strong>
          </h1>

          <p className="cp-hero-deck" style={{ animationDelay: '.14s' }}>
            Would you like a complete professional marketing team — one that{' '}
            <strong>writes your ads, builds your strategy, creates your content, and plans your campaigns</strong>{' '}
            — available 24/7, starting from ₦20,000 a month? That's Cerebre Plus.
          </p>

          <div className="cp-compare-row" style={{ animationDelay: '.2s' }}>
            <div className="cp-cmp">
              <span className="cp-cmp-x">❌</span>
              <span className="cp-cmp-val">Marketing agency: <strong>₦300,000–₦2,000,000/mo</strong></span>
            </div>
            <span className="cp-cmp-arrow">→</span>
            <div className="cp-cmp">
              <span style={{ color: 'var(--teal-l)', fontSize: 15 }}>✓</span>
              <span className="cp-cmp-val">Cerebre Plus starting from: <strong style={{ color: 'var(--gold-l)' }}>₦20,000/month</strong></span>
            </div>
          </div>

          <div className="cp-hero-btns" style={{ animationDelay: '.28s' }}>
            <a
              href="#waitlist"
              className="cp-nbtn cp-nbtn-cta"
              style={{ fontSize: 13, padding: '15px 36px', borderRadius: 11 }}
              onClick={(e) => { e.preventDefault(); scrollTo('waitlist') }}
            >
              Secure Your Founding Spot — Free →
            </a>
            <a
              href="https://www.cerebreplus.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="cp-nbtn cp-nbtn-white"
              style={{ fontSize: 13, padding: '15px 36px', borderRadius: 11 }}
            >
              See Cerebre Plus in Action →
            </a>
          </div>

          <div className="cp-hero-trust" style={{ animationDelay: '.36s' }}>
            {[
              'First generation completely free',
              'No credit card required',
              'Founding member price locked forever',
              'Works for any Nigerian industry',
            ].map((txt) => (
              <div key={txt} className="cp-ht">
                <div className="cp-ht-ok">✓</div>{txt}
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div className="cp-countdown rv">
            <div className="cp-cd-label">Launching in</div>
            <div className="cp-cd-units">
              {[['d','Days'],['h','Hours'],['m','Minutes'],['s','Seconds']].map(([key, label], i) => (
                <React.Fragment key={key}>
                  {i > 0 && <span className="cp-cd-sep">:</span>}
                  <div className="cp-cd-unit">
                    <span className="cp-cd-num">{countdown[key as keyof typeof countdown]}</span>
                    <div className="cp-cd-unit-lbl">{label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="cp-cd-date">
              Launch date: <strong>Monday, May 18, 2026 — 12:00 AM WAT</strong>
            </div>
          </div>

          {/* Stat band */}
          <div className="cp-stat-band rv d2">
            {[['40','Live Tools'],['20+','Tools Coming'],['60s','To First Result'],['₦0','To Join Today']].map(([val, lbl]) => (
              <div key={lbl} className="cp-sb">
                <div className="cp-sb-val">{val}</div>
                <div className="cp-sb-lbl">{lbl}</div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ══════════ PROBLEM ══════════ */}
      <section className="cp-s cp-s-alt" id="problem">
        <div className="cp-max">
          <div className="rv cp-center">
            <span className="cp-ey r">The Real Problem</span>
            <h2 className="cp-sh cp-center">Every month without a system,<br /><em>you pay for it twice.</em></h2>
            <p className="cp-sl cp-center">
              Once in the money wasted on marketing that doesn't work. And once in the customers
              your competitors are collecting while you're figuring it out.
            </p>
          </div>

          <div className="cp-pain-grid">
            {[
              { icon: '😩', title: 'The blank screen every Monday night', cost: 'Costs you: consistency, credibility, customers', body: 'You know you need to post tomorrow. You stare at your phone. Nothing comes. You type something, delete it. An hour passes. You have nothing — again.', d: 'd1' },
              { icon: '💸', title: 'Paying people who disappear with your money', cost: 'Costs you: ₦80,000–₦500,000 per month', body: '₦80,000 for Facebook ads. 9 likes. 2 comments. Zero enquiries. A social media manager who was great month one — then slow, then absent, then gone.', d: 'd2' },
              { icon: '🎯', title: 'Strategy? What strategy?', cost: 'Costs you: growth, time, momentum', body: 'Your marketing has no plan. You post when you remember. Run an ad when you feel like it. Nothing is connected. Nothing compounds. Every month starts from zero.', d: 'd1' },
              { icon: '🌍', title: 'Tools built for the wrong market', cost: 'Costs you: relevance, conversion, trust', body: "Canva, Hootsuite, HubSpot — powerful tools, wrong market. None of them understand WhatsApp culture, naira pricing, or how Nigerians actually buy.", d: 'd2' },
            ].map((card) => (
              <div key={card.title} className={`cp-pain-card rv ${card.d}`}>
                <div className="cp-pain-icon">{card.icon}</div>
                <div>
                  <div className="cp-pain-title">{card.title}</div>
                  <div className="cp-pain-body">{card.body}</div>
                  <span className="cp-pain-cost">{card.cost}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cp-vs-bridge rv d2">
            <div className="cp-vs-badge">✦ &nbsp; This is precisely why Cerebre Plus exists &nbsp; ✦</div>
          </div>
        </div>
      </section>


      {/* ══════════ STORY ══════════ */}
      <section className="cp-s" id="story">
        <div className="cp-max-n">
          <div className="rv cp-center">
            <span className="cp-ey">The Story Behind Cerebre Plus</span>
            <h2 className="cp-sh cp-center">Two businesses. Same city.<br /><em>Completely different outcomes.</em></h2>
          </div>
          <div className="cp-story-box rv d1">
            <div className="cp-story-label">📖 A True Story — Lagos, 2024</div>
            <div className="cp-story-text">
              Tunde and Emeka opened their fashion brands the same year, in the same Lagos market,
              with the same quality of clothes. Three years later,{' '}
              <em>Emeka has 38,000 followers and a waiting list.</em> Tunde has 1,100 followers
              and is wondering if he should close.
            </div>
            <div className="cp-story-hr" />
            <div className="cp-story-lesson">
              The product was never the difference. Emeka had a content system. He posted consistently.
              His captions converted. His campaigns were timed to when his customers had money. He ran ads
              that targeted the right people.
            </div>
            <div className="cp-story-lesson">
              Tunde was doing all of this by guesswork, one post at a time, hoping something would stick.
              Most Nigerian businesses are Tunde. Excellent at what they do. Invisible to the people who need them.{' '}
              <strong style={{ color: 'var(--gold-l)' }}>Cerebre Plus was built to change that.</strong>
            </div>
            <div className="cp-story-attr">— The founding insight behind Cerebre Plus</div>
          </div>
        </div>
      </section>


      {/* ══════════ TOOLS ══════════ */}
      <section className="cp-s cp-s-alt" id="tools">
        <div className="cp-max">
          <div className="rv cp-center">
            <span className="cp-ey t">The Platform</span>
            <h2 className="cp-sh cp-center">40 AI tools live. <em>20 more coming.</em></h2>
            <p className="cp-sl cp-center">
              Every tool is powered by AI calibrated for the African market.
              Here's what's live on launch day:
            </p>
          </div>

          <div className="cp-tool-grid">
            {[
              { tag: 'STRATEGY',   name: '90-Day Marketing Strategy',   desc: 'A complete, tailored marketing plan for your exact business, industry, and the Nigerian market — generated in under 60 seconds.', d: 'd1' },
              { tag: 'CONTENT',    name: '30-Day Content Calendar',     desc: '30 days of social media content with ready captions, posting times, and creative direction — done in under 5 minutes.', d: 'd2' },
              { tag: 'PAID ADS',   name: 'Meta & Google Campaign Brief',desc: 'Professionally structured campaign briefs with audience targeting, ad copy, and budget allocation — done for you.', d: 'd3' },
              { tag: 'COPYWRITING',name: 'Nigerian Copywriter AI',      desc: 'Generate ad copy, Instagram captions, email sequences, video scripts, and blog posts — written for Nigerian audiences who buy.', d: 'd1' },
              { tag: 'ANALYTICS',  name: 'Budget Allocation Engine',    desc: 'Know exactly where to spend your marketing budget. Stop wasting money on channels that don\'t work.', d: 'd2' },
              { tag: 'WHATSAPP',   name: 'WhatsApp Marketing Builder',  desc: 'Build complete WhatsApp broadcast strategies, message sequences, and conversion flows for the platform your customers already use.', d: 'd3' },
            ].map((tool) => (
              <div key={tool.name} className={`cp-tool-card rv ${tool.d}`}>
                <div className="cp-tool-live"><span className="cp-tool-dot" /> Live on launch</div>
                <div className="cp-tool-name">{tool.name}</div>
                <div className="cp-tool-desc">{tool.desc}</div>
                <div className="cp-tool-foot"><span className="cp-tool-tag">{tool.tag}</span></div>
              </div>
            ))}
          </div>

          <div className="cp-more-tools rv d1">
            <div>
              <div className="cp-mtb-title">52+ More Tools Are Coming</div>
              <div className="cp-mtb-sub">All included in your founding member subscription at no extra cost.</div>
              <div className="cp-mtb-tags">
                {['SEO Writer','Email Sequences','Brand Voice Builder','Competitor Analysis','Sales Script Generator','+ 47 more'].map((t) => (
                  <span key={t} className="cp-mtb-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════ BENEFITS ══════════ */}
      <section className="cp-s" id="benefits">
        <div className="cp-max-n">
          <div className="rv cp-center">
            <span className="cp-ey">What You Actually Get</span>
            <h2 className="cp-sh cp-center">Stop guessing.<br /><em>Start growing.</em></h2>
          </div>
          <div className="cp-benefits-list">
            {[
              { title: 'A complete 90-day marketing strategy — in 60 seconds', desc: 'Tailored to your exact business, industry, and the Nigerian market. Not a generic template — your actual strategy, done instantly.' },
              { title: 'Never stare at a blank screen again', desc: 'Get 30 days of social media content with ready captions, posting times, and creative direction — in under 5 minutes.' },
              { title: 'Stop guessing with your ads', desc: 'Get professionally structured Meta and Google campaign briefs with audience targeting, ad copy, and budget allocation done for you. No more ₦80,000 for 9 likes.' },
              { title: 'Write better than any copywriter you\'ve ever hired', desc: 'Generate ad copy, Instagram captions, email sequences, video scripts, and blog posts — all written for Nigerian audiences who actually buy.' },
              { title: 'A marketing team that never disappears with your money', desc: 'Shows up every day. Never asks for a salary raise. Available 24/7, 365 days a year — for ₦35,000/month.' },
            ].map((b) => (
              <div key={b.title} className="cp-benefit-row rv d1">
                <div className="cp-ben-arrow">→</div>
                <div>
                  <div className="cp-ben-title">{b.title}</div>
                  <div className="cp-ben-desc">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="cp-s cp-s-alt" id="how">
        <div className="cp-max">
          <div className="rv cp-center">
            <span className="cp-ey t">How It Works</span>
            <h2 className="cp-sh cp-center">You'll be running your first<br /><em>tool in under 5 minutes.</em></h2>
          </div>
          <div className="cp-how-grid rv d1">
            {[
              { num: '01', icon: '📝', title: 'Create your free account', desc: 'Takes 90 seconds. Just your name and email. No card. No obligation.' },
              { num: '02', icon: '🏢', title: 'Set up your business profile', desc: 'Tell us your business, industry, and target market. This is how we calibrate every tool to your business.' },
              { num: '03', icon: '⚡', title: 'Run any tool for free', desc: 'Your first generation is completely free. Run the 90-Day Strategy tool and see what it produces for your real business.' },
              { num: '04', icon: '🚀', title: 'Subscribe when you\'re ready', desc: 'Starting at ₦20,000/month. Pay with Paystack, Flutterwave, bank transfer, or card. Cancel anytime.' },
            ].map((step) => (
              <div key={step.num} className="cp-hs">
                <div className="cp-hs-num">{step.num}</div>
                <div className="cp-hs-icon">{step.icon}</div>
                <div className="cp-hs-title">{step.title}</div>
                <div className="cp-hs-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════ PRICING ══════════ */}
      <section className="cp-s" id="pricing">
        <div className="cp-max">
          <div className="rv cp-center">
            <span className="cp-ey">Founding Member Pricing</span>
            <h2 className="cp-sh cp-center">Less than what an agency charges<br /><em>for a single day's work.</em></h2>
            <p className="cp-sl cp-center">
              Founding member pricing — available only until we hit 1,000 members.
              Once the counter hits 1,000, the price goes up permanently.
            </p>
          </div>

          <div className="cp-price-grid">
            {/* Free */}
            <div className="cp-price-card basic rv d1">
              <div className="cp-price-badge">Free Plan</div>
              <div className="cp-price-name">Cerebre Free</div>
              <div>
                <span className="cp-price-amount">₦0</span>
                <span className="cp-price-period">/month</span>
              </div>
              <div className="cp-price-desc">Perfect for solopreneurs getting started with AI-powered marketing.</div>
              <div className="cp-price-features">
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>30 Cerebre Coins monthly</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Access to core tools</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>First generation free</div>
              </div>
              <a href="#waitlist" className="cp-price-cta basic-cta" onClick={(e) => { e.preventDefault(); scrollTo('waitlist') }}>
                Join Waitlist — Free →
              </a>
            </div>

            {/* Starter */}
            <div className="cp-price-card basic rv d1">
              <div className="cp-price-badge">Starter Plan</div>
              <div className="cp-price-name">Cerebre Starter</div>
              <div>
                <span className="cp-price-amount">₦20,000</span>
                <span className="cp-price-period">/month</span>
              </div>
              <div className="cp-price-was">Regular price: ₦25,000/month</div>
              <div className="cp-price-desc">For serious business owners ready to market consistently.</div>
              <div className="cp-price-features">
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Access to all 40 live tools</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>100 Cerebre Coins/month</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>All new tools as they launch</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Email support</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Founding member badge forever</div>
              </div>
              <a href="#waitlist" className="cp-price-cta basic-cta" onClick={(e) => { e.preventDefault(); scrollTo('waitlist') }}>
                Join Waitlist — Starter →
              </a>
            </div>

            {/* Growth — featured */}
            <div className="cp-price-card growth rv d2">
              <div className="cp-price-badge pop">⚡ Most Popular — Best Value</div>
              <div className="cp-price-name">Cerebre Growth</div>
              <div>
                <span className="cp-price-amount">₦35,000</span>
                <span className="cp-price-period">/month</span>
              </div>
              <div className="cp-price-was">Regular price: ₦65,000/month</div>
              <div className="cp-price-desc">For serious business owners who want the full marketing team experience.</div>
              <div className="cp-price-features">
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Everything in Starter, plus:</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>250 Cerebre Coins/month</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Priority access to all 52+ new tools</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Tuesday live group onboarding sessions</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Nigerian Business Owners WhatsApp community</div>
                <div className="cp-pf"><span className="cp-pf-ok">✓</span>Priority WhatsApp support</div>
              </div>
              <a href="#waitlist" className="cp-price-cta growth-cta" onClick={(e) => { e.preventDefault(); scrollTo('waitlist') }}>
                Join Waitlist — Growth →
              </a>
            </div>
          </div>

          <div className="cp-agency-compare rv d1">
            <div>
              <div className="cp-ac-label">Compare the cost of your alternatives:</div>
              <div className="cp-ac-vs">
                <span className="cp-ac-item bad">❌ Lagos agency: ₦300,000–₦2,000,000/mo</span>
                <span className="cp-ac-item bad">❌ Senior marketing manager: ₦250,000–₦500,000/mo</span>
                <span className="cp-ac-item good">✓ Cerebre Plus Growth: ₦35,000/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════ BONUSES ══════════ */}
      <section className="cp-s" id="bonus">
        <div className="cp-max">
          <div className="rv cp-center">
            <span className="cp-ey">Founding Member Bonuses</span>
            <h2 className="cp-sh cp-center">Join before 1,000 members<br /><em>and you get all of this too.</em></h2>
          </div>
          <div className="cp-bonus-list">
            {[
              { icon: '⚡', d: 'd1', title: 'Immediate access to every new tool as it launches', desc: 'All 52+ tools coming to the platform — included in your subscription at no extra cost. Every new launch, yours automatically.' },
              { icon: '🎓', d: 'd2', title: 'Group onboarding session every Tuesday — free, live', desc: 'Weekly live sessions with the Cerebre team. We walk you through every tool and ensure you\'re getting maximum results.' },
              { icon: '💬', d: 'd1', title: 'Nigerian Business Owners WhatsApp Community', desc: 'Join a community of Nigerian and African business owners using AI to grow. Share wins, get feedback, network with peers.' },
              { icon: '🏆', d: 'd2', title: 'Founding Member badge — recognised forever', desc: "Your founding member status is recognised in the platform permanently. You're not just a customer — you're part of what built this." },
            ].map((b) => (
              <div key={b.title} className={`cp-bonus-item rv ${b.d}`}>
                <div className="cp-bonus-icon">{b.icon}</div>
                <div>
                  <div className="cp-bonus-title">{b.title}</div>
                  <div className="cp-bonus-desc">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════ GUARANTEE ══════════ */}
      <section className="cp-s cp-s-alt" id="guarantee">
        <div className="cp-max-n">
          <div className="cp-guar-box rv">
            <div className="cp-guar-header">
              <div className="cp-guar-seal">🛡️</div>
              <div>
                <span className="cp-ey" style={{ marginBottom: 6 }}>Our Promise To You</span>
                <h2 className="cp-guar-title">The 30-Day<br /><em>Money-Back Guarantee</em></h2>
              </div>
            </div>
            <p className="cp-guar-body">
              We know that if you've been burned by marketing agencies or tools that didn't deliver,
              you are cautious. You should be. That's why Cerebre Plus comes with a 30-day guarantee.
            </p>
            <p className="cp-guar-body">
              If you join, use the tools, and within 30 days you don't believe it has been worth every naira —
              contact us and we will refund you.{' '}
              <strong style={{ color: '#fff' }}>No questions. No forms. No arguments. Just your money back.</strong>
            </p>
            <div className="cp-guar-promise">
              "We can afford to make this guarantee because we built something that works. The guarantee is only
              there for the few people who need reassurance to start. Most of our members will never use it —
              because they'll be too busy getting results."
            </div>
          </div>
        </div>
      </section>


      {/* ══════════ WAITLIST FORM ══════════ */}
      <section className="cp-s cp-wl-s" id="waitlist">
        <div className="cp-max-n">
          <div className="rv cp-center">
            <span className="cp-ey">Limited Founding Spots</span>
            <h2 className="cp-sh cp-center">Every day you wait is a day<br />your competitors <em>get further ahead.</em></h2>
            <p className="cp-sl cp-center" style={{ margin: '0 auto' }}>
              The businesses that join Cerebre Plus today will have months of marketing advantage
              before their competitors understand what they're doing differently.
            </p>
          </div>

          <div className="cp-wl-box rv d1">
            <div className="cp-urgency-tag">⏳ Founding member pricing — closes at 1,000 members</div>

            <h3 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(22px,3.5vw,30px)', color: '#fff', marginBottom: 6 }}>
              Secure your founding member spot —{' '}
              <em style={{ color: 'var(--gold-l)' }}>it's free to join</em>
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(205,217,236,.5)' }}>
              Join the waitlist now. We'll send your launch access details on May 18th. No card required.
            </p>

            {submitted ? (
              /* Success state */
              <div style={{
                marginTop: 28,
                background: 'rgba(11,168,144,.08)',
                border: '1px solid rgba(11,168,144,.22)',
                borderRadius: 14, padding: 28, textAlign: 'center',
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontFamily: 'var(--fd)', fontSize: 24, color: 'var(--teal-l)', marginBottom: 8 }}>
                  You're on the list!
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(205,217,236,.6)' }}>
                  We've received your details. We'll send your launch access on May 18th, 2026.
                  You're officially a Cerebre Plus founding member.
                </p>
                <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(18,212,180,.6)' }}>
                  Want to chat with us directly?{' '}
                  <a
                    href={WA_URL("Hi! I just joined the Cerebre Plus waitlist. I'd love to learn more.")}
                    style={{ color: 'var(--teal-l)', fontWeight: 700 }}
                    target="_blank" rel="noopener noreferrer"
                  >
                    Message us on WhatsApp →
                  </a>
                </p>
              </div>
            ) : (
              /* Form */
              <div className="cp-wl-form-grid">
                {/* Name */}
                <div className="cp-field-group">
                  <label className="cp-field-label">Full Name <span>*</span></label>
                  <input
                    className="cp-wl-input"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    autoComplete="name"
                  />
                  {errors.name && <div className="cp-wl-error show">{errors.name}</div>}
                </div>

                {/* Email */}
                <div className="cp-field-group">
                  <label className="cp-field-label">Email Address <span>*</span></label>
                  <input
                    className="cp-wl-input"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    autoComplete="email"
                  />
                  {errors.email && <div className="cp-wl-error show">{errors.email}</div>}
                </div>

                {/* Phone */}
                <div className="cp-field-group">
                  <label className="cp-field-label">WhatsApp / Phone <span>*</span></label>
                  <input
                    className="cp-wl-input"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    autoComplete="tel"
                  />
                  {errors.phone && <div className="cp-wl-error show">{errors.phone}</div>}
                </div>

                {/* Biz name */}
                <div className="cp-field-group">
                  <label className="cp-field-label">Business Name <span>*</span></label>
                  <input
                    className="cp-wl-input"
                    type="text"
                    placeholder="Your business name"
                    value={form.bizName}
                    onChange={(e) => setField('bizName', e.target.value)}
                  />
                  {errors.bizName && <div className="cp-wl-error show">{errors.bizName}</div>}
                </div>

                {/* Industry */}
                <div className="cp-field-group">
                  <label className="cp-field-label">Industry <span>*</span></label>
                  <select className="cp-wl-select" value={form.industry} onChange={(e) => setField('industry', e.target.value)}>
                    <option value="" disabled>Select your industry</option>
                    {['Fashion & Clothing','Food & Beverages','Beauty & Personal Care','Health & Wellness','Real Estate & Property','Education & Training','Technology & Software','Retail & E-commerce','Professional Services','Events & Entertainment','Logistics & Delivery','Finance & Fintech','Agriculture & Food Production','Media & Content Creation','Hospitality & Travel','Manufacturing','Other'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  {errors.industry && <div className="cp-wl-error show">{errors.industry}</div>}
                </div>

                {/* Team size */}
                <div className="cp-field-group">
                  <label className="cp-field-label">Business Size <span>*</span></label>
                  <select className="cp-wl-select" value={form.size} onChange={(e) => setField('size', e.target.value)}>
                    <option value="" disabled>How many on your team?</option>
                    {['Just me (solopreneur)','2–5 people','6–15 people','16–50 people','50+ people'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  {errors.size && <div className="cp-wl-error show">{errors.size}</div>}
                </div>

                {/* Plan */}
                <div className="cp-field-group">
                  <label className="cp-field-label">Plan You're Interested In</label>
                  <select className="cp-wl-select" value={form.plan} onChange={(e) => setField('plan', e.target.value)}>
                    <option value="" disabled>Which plan interests you?</option>
                    {['Free — ₦0/month','Starter — ₦20,000/month','Growth — ₦35,000/month','Not sure yet'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div className="cp-field-group">
                  <label className="cp-field-label">How Did You Find Us?</label>
                  <select className="cp-wl-select" value={form.source} onChange={(e) => setField('source', e.target.value)}>
                    <option value="" disabled>Select one</option>
                    {['Instagram','Facebook','WhatsApp','Twitter / X','LinkedIn','TikTok','Referral from a friend','Google Search','Other'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Challenge */}
                <div className="cp-field-group cp-wl-form-full">
                  <label className="cp-field-label">Your Biggest Marketing Challenge Right Now</label>
                  <input
                    className="cp-wl-input"
                    type="text"
                    placeholder="e.g. I can't get my ads to convert, I don't know what to post..."
                    value={form.challenge}
                    onChange={(e) => setField('challenge', e.target.value)}
                  />
                </div>

                {/* Submit */}
                <button
                  className="cp-wl-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? '⏳ Securing your spot...' : '🚀 Join the Waitlist — Secure My Founding Spot'}
                </button>
              </div>
            )}

            {/* Scarcity meter */}
            <div className="cp-scarcity-bar">
              <div className="cp-sc-item">
                <div className="cp-sc-num">{memberCount.toLocaleString()}</div>
                <div className="cp-sc-lbl">Spots claimed</div>
              </div>
              <div className="cp-sc-bar-wrap">
                <div className="cp-sc-bar-label">
                  <span>Progress to 1,000 founding members</span>
                  <span>{(memberCount / 10).toFixed(1)}%</span>
                </div>
                <div className="cp-sc-bar">
                  <div className="cp-sc-bar-fill" style={{ width: barWidth }} />
                </div>
              </div>
              <div className="cp-sc-item">
                <div className="cp-sc-num" style={{ color: 'var(--teal-l)' }}>{(1000 - memberCount).toLocaleString()}</div>
                <div className="cp-sc-lbl">Spots left</div>
              </div>
            </div>
          </div>

          {/* Trust strip below form */}
          <div className="cp-fcta-trust rv d2" style={{ justifyContent: 'center', marginTop: 24 }}>
            {['First generation completely free','No credit card to join waitlist','Founding member price locked forever','30-day money-back guarantee','Cancel anytime, no penalties'].map((txt) => (
              <div key={txt} className="cp-ft"><span className="cp-ft-ok">✓</span>{txt}</div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════ FAQ ══════════ */}
      <section className="" id="faq">
        <div className="cp-max-n">
          <div className="rv cp-center">
            <span className="cp-ey">Common Questions</span>
            <h2 className="cp-sh cp-center">You probably want to know<br /><em>these answers first.</em></h2>
          </div>
          <div className="cp-faq-list">
            {[
              { q: 'When exactly does Cerebre Plus launch?', a: 'Cerebre Plus launches on Monday, May 18, 2026. Everyone on the waitlist will receive their access link and setup instructions via email on that day. Founding member pricing is available from day one.' },
              { q: 'What does "first generation completely free" mean?', a: 'When you create your account and set up your business profile, you can run any one tool — completely free. No card required. Run a full 90-day marketing strategy for your real business before spending a naira.' },
              { q: 'How is Cerebre Plus different from ChatGPT?', a: 'ChatGPT is a general AI. Cerebre Plus is a purpose-built marketing platform calibrated for the African market. It understands WhatsApp culture, naira pricing, Nigerian consumer behaviour, and has 40 structured tools — not a blank chat box.' },
              { q: 'Do I need any marketing knowledge to use it?', a: 'Zero skills needed. If you can describe what you sell and who you sell it to, you can use every tool on the platform. The expertise is in the system — not something you need to carry yourself.' },
              { q: 'What happens to my founding member price when you raise prices?', a: "Your founding member price is locked in forever, for as long as you remain a subscriber. If you're on ₦35,000/month Growth today, that's what you'll pay in 2027 and 2030 — even when the price for new members is double." },
              { q: 'What payment methods do you accept?', a: 'We accept all major payment methods for Nigerian businesses: Paystack, Flutterwave, bank transfer, and debit/credit cards. Subscriptions are monthly and you can cancel at any time.' },
              { q: 'How does the 30-day guarantee work?', a: "If you subscribe, use the tools for 30 days, and genuinely don't believe it was worth the money — message us on WhatsApp and we will process your full refund. No forms, no arguments, no questions." },
            ].map((item, i) => (
              <div key={i} className={`cp-faq-item rv d1${openFAQ === i ? ' open' : ''}`}>
                <button className="cp-faq-q" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                  {item.q}
                  <span className="cp-faq-icon">+</span>
                </button>
                <div className="cp-faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════ FINAL CTA ══════════ */}
      <section className="cp-s cp-fcta-s">
        <div className="cp-max-n">
          <div className="cp-fcta-inner rv">
            <div className="cp-urgency-tag" style={{ marginBottom: 24 }}>⏳ May 18th launch — founding price closing soon</div>
            <h2 className="cp-fcta-h">You already have<br />a great business.<br /><em>Show the world.</em></h2>
            <p className="cp-fcta-sub">
              You work hard. You know your customers better than anyone. What you need is the
              marketing system to show the world what you've built. Cerebre Plus is that system.
            </p>
            <a
              href="#waitlist"
              className="cp-nbtn cp-nbtn-cta"
              style={{ fontSize: 16, padding: '16px 40px', borderRadius: 12, display: 'inline-flex', marginBottom: 12 }}
              onClick={(e) => { e.preventDefault(); scrollTo('waitlist') }}
            >
              Join the Waitlist — It's Free →
            </a>
            <div style={{ fontSize: 13, color: 'rgba(205,217,236,.35)', marginBottom: 28 }}>
              Or chat with us:{' '}
              <a
                href={WA_URL("Hi! I want to know more about Cerebre Plus before joining the waitlist.")}
                style={{ color: 'rgba(37,211,102,.7)', textDecoration: 'none', fontWeight: 700 }}
                target="_blank" rel="noopener noreferrer"
              >
                WhatsApp us →
              </a>
            </div>
            <div className="cp-fcta-trust">
              {['Free to join waitlist','First generation free','Founding price locked forever','30-day money-back guarantee'].map((t) => (
                <div key={t} className="cp-ft"><span className="cp-ft-ok">✓</span>{t}</div>
              ))}
            </div>
          </div>

          {/* P.S. boxes */}
          <div style={{ textAlign: 'center', marginTop: 32, padding: '22px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14 }}>
            <p style={{ fontSize: 13, color: 'rgba(205,217,236,.4)', fontStyle: 'italic', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              <strong style={{ color: 'rgba(205,217,236,.6)' }}>P.S.</strong>{' '}
              The founding member price closes at 1,000 members. If you're still reading this page,
              you already know this is what your business needs. The only question is whether you're
              going to act today or wait until the price goes up.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(205,217,236,.35)', marginTop: 12, fontStyle: 'italic', maxWidth: 500, margin: '12px auto 0', lineHeight: 1.7 }}>
              <strong style={{ color: 'rgba(205,217,236,.45)' }}>P.P.S.</strong>{' '}
              Your first generation is completely free. You don't have to believe me.
              Try it first. See what it produces for your real business. Then decide.
              What do you have to lose?
            </p>
          </div>
        </div>
      </section>


      {/* ══════════ FOOTER ══════════ */}
      <footer className="cp-footer">
        <div className="cp-fg">
          <div>
            <div className="cp-fl-logo">Cerebre<em>Plus</em></div>
            <span className="cp-fl-prod">A product of Cerebre Media Africa</span>
            <p className="cp-fl-desc">
              Africa's AI-powered marketing platform. 40 tools live on May 18th, 20+ coming.
              Built for every African business owner who deserves better marketing.
            </p>
            <div className="cp-fsoc">
              {[['#','📸','Instagram'],['#','🎵','TikTok'],['#','💼','LinkedIn'],['#','✕','Twitter']].map(([href, emoji, label]) => (
                <a key={label} href={href} className="cp-fs-a" aria-label={label}>{emoji}</a>
              ))}
              <a href={`https://wa.me/${WA_NUMBER}`} className="cp-fs-a" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">💬</a>
            </div>
          </div>
          <div className="cp-fc">
            <h4>Platform</h4>
            <ul>
              {[['tools','The 40 Tools'],['how','How It Works'],['pricing','Pricing'],['faq','FAQs'],['waitlist','Join Waitlist']].map(([id, label]) => (
                <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id) }}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div className="cp-fc">
            <h4>Company</h4>
            <ul>
              {['About Us','Cerebre Media Africa','Our Africa Vision','Careers','Press'].map((t) => (
                <li key={t}><a href="#">{t}</a></li>
              ))}
            </ul>
          </div>
          <div className="cp-fc">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Centre</a></li>
              <li><a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="cp-fb-row">
          <div className="cp-fb-copy">© 2026 Cerebre Media Africa. All Rights Reserved. Lagos, Nigeria.</div>
          <div className="cp-fb-brand">Cerebre Plus — <strong>A product of Cerebre Media Africa</strong></div>
        </div>
      </footer>


      {/* ══════════ WHATSAPP FLOAT ══════════ */}
      <a
        href={WA_URL("Hi! I found Cerebre Plus and I'd like to know more about the platform before launch.")}
        className="cp-wa-float"
        aria-label="Chat with us on WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <WAIcon size={26} />
        <span className="cp-wa-tooltip">Chat with us on WhatsApp</span>
      </a>
    </>
  )
}
