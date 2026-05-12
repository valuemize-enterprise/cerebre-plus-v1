'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(marketing)/demo/page.tsx
// Interactive demo page — "Luxe Interiors Lagos" sample business.
// Click any tool → see a pre-generated Nigerian market output.
// CTA everywhere: "Try with YOUR business → Join waitlist"
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react'
import { useRouter }       from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, MessageCircle, ArrowRight, Sparkles, Clock, Coins, Zap } from 'lucide-react'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

// ─────────────────────────────────────────────────────────────
// SAMPLE BUSINESS — "Luxe Interiors Lagos"
// Interior design firm in Victoria Island, Lagos
// ─────────────────────────────────────────────────────────────

const DEMO_BUSINESS = {
  name:           'Luxe Interiors Lagos',
  industry:       'Interior Design',
  city:           'Victoria Island, Lagos',
  whatsapp:       '08091234567',
  years:          5,
  social_proof:   '120+ homes transformed',
  brand_colour:   '#C9A96E',
}

// ─────────────────────────────────────────────────────────────
// PRE-GENERATED SAMPLE OUTPUTS
// ─────────────────────────────────────────────────────────────

const DEMO_OUTPUTS: Record<string, { seconds: number; output: string }> = {

  'caption-craft': {
    seconds: 23,
    output: `Before you spend another naira on furniture you'll hate in 6 months — read this. 🛋️

Most Lagos homes look expensive but feel wrong. The problem isn't budget — it's the absence of a design system.

At Luxe Interiors Lagos, we've transformed 120+ homes across Victoria Island, Ikoyi, and Lekki Phase 1 in the last 5 years. And the #1 thing every client tells us after?

"I should have done this years ago."

Right now, our January transformation slots are almost full. When they're gone, the next available date is March.

If you want a home that looks like it belongs in Architectural Digest but was designed for how Nigerians actually live — send me a message on WhatsApp today: 08091234567

🏠 Homes transformed: 120+
📍 Victoria Island, Lagos
💬 WhatsApp: 08091234567

#LuxeInteriorsLagos #InteriorDesignLagos #LagoHomes #VictoriaIslandLagos #NigerianInteriors #HomeTransformation #LagosDesigner #InteriorDesignNigeria #LuxuryLagos #AbujaInteriors

💡 CEREBRE TIP: Nigerian interior design clients respond 4x better to "transformation" language than "decorating" language. The word "transform" signals a complete change — which is what most clients actually want — not just moving furniture around.`,
  },

  'whatsapp-campaign-builder': {
    seconds: 31,
    output: `**MESSAGE 1 OF 3** | Day 1, 10:00AM WAT

Ify, happy new month! 🎉

It's been a while since we spoke — I hope business is going well and home life is good.

Quick question — how is the house feeling these days? Any rooms that you keep meaning to sort out?

I'm asking because we've had some interesting approaches lately that I think would work really well in homes like yours. Just want to see if it's relevant before I share.

— [Designer's name], Luxe Interiors

---

**MESSAGE 2 OF 3** | Day 2, 6:00PM WAT

Ify, I promised I'd share something interesting 👇

Since January, we've done something we've never done before — we're offering a *design consultation for 3 rooms at the price of 2* for the next 2 weeks only.

Normal value: ₦750,000
This offer: ₦500,000

What changed: we have 2 project slots opening up next month and we'd rather fill them with people we know than cold enquiries.

The last time we ran anything like this, we filled both slots in 4 days.

Is this relevant to where you are right now? WhatsApp me: 08091234567

---

**MESSAGE 3 OF 3** | Deadline day, 10:00AM WAT

Ify — this is the last time I'll mention it.

The 3-room consultation at ₦500,000 closes *today at midnight*.

Both project slots are spoken for. I'm only reaching out to a few people we know because we want to stay ahead of the waiting list.

If you want in: reply 'READY' on WhatsApp and I'll send you the details within the hour.

08091234567

P.S. After today, standard consultation pricing resumes at ₦750,000. No exceptions.

💡 CEREBRE TIP: In Nigerian luxury markets, "exclusive access" messages convert better when sent to past clients than promotional broadcast campaigns sent to cold contacts. Past clients have 4x the purchase intent of new enquiries when reached personally.`,
  },

  'strategy-brain': {
    seconds: 58,
    output: `---
*Note: A Lagos marketing agency would charge between ₦800,000 and ₦2,000,000 for this document. CerebreBrain built it in 58 seconds.*

---

# 90-DAY MARKETING STRATEGY
## LUXE INTERIORS LAGOS | Victoria Island | Interior Design
### Q1 2025

---

## SITUATION ANALYSIS

**Where Luxe Interiors Lagos Is Right Now:**
Five years of quality work in Victoria Island — one of the most competitive interior design markets in Africa. 120+ homes transformed is a strong track record, but this social proof isn't being communicated consistently enough to attract the next 120 clients at premium pricing.

The Victoria Island interior design market is relationship-driven and community-validated. Clients choose designers through personal referrals and Instagram discovery — in that order. A business with this track record should be generating referrals automatically. If that's not happening at the desired rate, the system for requesting and amplifying referrals isn't in place.

**The Core Opportunity:**
The interior design market in Lagos is growing as the upper-middle class expands and property values rise. New builds in Ikoyi, Lekki Phase 1, and VGC represent an active pipeline of potential clients who have never experienced professional design consultation and don't yet know what they're missing. The fear angle (Law 4): every month without a professional design consultation is another month living in a house that costs ₦50M but looks like it cost ₦5M.

**The Risk of Inaction:**
While Luxe Interiors Lagos focuses on project delivery, 3 competitor firms in Victoria Island are running consistent Instagram content and WhatsApp marketing. The clients who would have found Luxe via word of mouth 5 years ago now discover designers through Instagram and Google. An inconsistent online presence is a referral leak — it means that satisfied clients are recommending Luxe to friends who then can't find convincing evidence of quality online.

---

## MONTH 1 — FOUNDATION (Days 1–30)

**Theme: "Prove the portfolio, build the list"**
**Primary Goal:** Get 100 new WhatsApp contacts from the design community in Victoria Island and Ikoyi

**Week 1–2: Quick Wins**
1. Complete Google Business Profile for Luxe Interiors Lagos (all 47 fields)
2. Add 10 before/after project photos to GBP
3. Request 5 Google reviews from the 5 most recently completed projects
4. Create WhatsApp lead magnet: "5 Mistakes Lagos Homeowners Make When Decorating (And What We Do Instead)"
5. Broadcast to existing contacts: announce the lead magnet

**Content Focus:**
40% Before/After transformations (specific rooms, specific projects)
30% "Did you know" education (Lagos home design mistakes, furniture sourcing tips)
20% Behind the scenes (site visits, sourcing trips, client conversations)
10% Promotional (consultation availability, pricing)

**Salary Week Strategy (Days 25–30):**
→ WhatsApp broadcast: "January salaries have landed — is this the month you finally do the master bedroom?"
→ "Book before end of January and lock in [specific offer]"

---

## THE AWOOF AUDIT

| What You Got | What It Would Cost Elsewhere |
|---|---|
| 90-day marketing strategy | ₦800,000–₦2,000,000 (Lagos agency) |
| Channel strategy and budget allocation | ₦150,000 |
| KPI dashboard | ₦100,000 |
| 30-day week-by-week execution roadmap | ₦250,000 |
| **Total value if purchased separately** | **₦1,300,000–₦2,500,000** |
| **What this cost on Cerebre Plus** | **100 coins (₦[X]) — and 58 seconds** |

---

💡 CEREBRE TIP: In the Lagos luxury interior design market, the highest-converting marketing moment is not the showcase of finished rooms — it's the progress shots during the transformation. Nigerian homeowners trust the process more than the polished outcome, because process shots prove the work is actually happening in their city, by real people, not sourced from Pinterest.`,
  },

  'copy-brain': {
    seconds: 26,
    output: `## VARIANT A — The Fear Angle

**Headline:** Your home cost ₦50M to build. Does it look like it?

**Body:**
Most Lagos homes are expensive shells with cheap interiors. Not because the owners don't care — but because they're too busy to find someone they can trust to get it right.

While you keep saying "I'll sort the house soon," your guests are already forming an opinion about your standards. And in Lagos, your home says things about you that you never intended.

Luxe Interiors Lagos has transformed 120+ homes across Victoria Island, Ikoyi, and Lekki in 5 years. Not one client has regretted it. Several have told us they wish they'd done it 3 years earlier.

January consultation slots are almost full. Message me today: 08091234567

*Cerebre Expert Note: The fear angle should be more specific — "While you keep saying 'I'll sort it'" triggers recognition. Add: "The last client who said this waited 8 months. They now have their dream home. 8 months of regret, avoidable."*

---

## VARIANT B — The Awoof Angle

**Headline:** ₦750,000 for a professional interior design consultation. Or ₦500,000 for 3 rooms. This month only.

**Awoof Stack:**
Hiring 3 separate interior designers for 3 rooms: ₦750,000–₦1.5M
Buying furniture without professional guidance (wasted purchases): ₦200,000–₦500,000
Luxe Interiors Lagos — 3 rooms, complete design solution: ₦500,000

5 years. 120+ homes. Victoria Island's most trusted interior designers.
Message us today: 08091234567

Offer closes January 31.

*Cerebre Expert Note: The Awoof Stack is strong but needs the time element earlier. Move "January 31" to the second line after the price reveal — urgency should appear immediately after the deal.*

---

💡 CEREBRE TIP: For luxury services in Lagos, "social proof specificity" matters more than for mass-market products. "120 homes" converts better than "hundreds of homes" — but "120 homes in Victoria Island, Ikoyi, and Lekki Phase 1" converts best of all. Named areas signal exclusivity and target the exact postcodes your ideal clients live in.`,
  },

  'email-scribe': {
    seconds: 42,
    output: `**EMAIL 1 OF 5 — THE WELCOME**

SUBJECT LINE (A): The Lagos interior design mistake that costs ₦200,000 (that most homeowners make)
SUBJECT LINE (B): Adaeze transformed her Ikoyi home in 6 weeks. Here's what she told me.
PREVIEW TEXT: We've been doing this for 5 years. Here's what we know.

---

From: Luxe Interiors Lagos

You signed up to hear from us — so I'll make sure this email is worth your time.

I'm [Designer Name] from Luxe Interiors Lagos. Five years ago, I transformed my first Victoria Island home and thought: every Lagos home deserves to look this way.

Since then, we've worked with 120+ homeowners across VI, Ikoyi, and Lekki Phase 1. And I've noticed that the homes that stay beautiful for years all share something in common — something that has nothing to do with budget.

I'll share that in the next email.

For now — I'm curious: what's the one room in your home that you keep meaning to sort out but haven't?

Reply and tell me. I read every email.

— [Name], Luxe Interiors Lagos
WhatsApp: 08091234567

P.S. Next email: The ₦200,000 mistake most Lagos homeowners make when buying furniture — and how to avoid it.

---

**EMAIL 3 OF 5 — SOCIAL PROOF + OFFER REVEAL**

SUBJECT LINE: "I wish I'd done this 3 years ago" — Adaeze, Ikoyi
PREVIEW TEXT: Her full transformation story — and what's possible for your home.

---

From: Luxe Interiors Lagos

Adaeze came to us with a 4-bedroom home in Ikoyi that she'd lived in for 6 years.

The problem? The house felt expensive but impersonal. Like a show home that nobody actually lives in.

In 6 weeks, we redesigned her living room, master bedroom, and entertainment space using a colour palette that actually reflected how she lives — not how she thought she was supposed to live.

Her exact words three months later: "I wish I'd done this 3 years ago. I avoided it because I thought I couldn't afford it. Turns out I couldn't afford not to."

If you've been sitting on a design decision, January is a good time to move. We have 2 project slots available before March — and we're filling them now.

To see if this is right for your home: 08091234567

— [Name]

P.S. You can see Adaeze's before/after (with her permission) on our Instagram. The master bedroom alone has been saved 847 times.

💡 CEREBRE TIP: For luxury services in Nigeria, email sequences convert best when the story in Email 3 features a client from the same neighbourhood or social context as the reader. "Ikoyi client" speaks to Ikoyi residents. "Victoria Island transformation" speaks to VI residents. Geographical specificity in testimonials is a Nigerian conversion multiplier.`,
  },
}

// ─────────────────────────────────────────────────────────────
// TOOL SELECTOR
// ─────────────────────────────────────────────────────────────

const DEMO_TOOLS = [
  { id: 'caption-craft',              icon: '✍️', name: 'CaptionCraft',             desc: 'Instagram caption',       seconds: 23, coins: 15  },
  { id: 'whatsapp-campaign-builder',  icon: '💬', name: 'WhatsApp Campaign',        desc: 'WhatsApp broadcast',      seconds: 31, coins: 30  },
  { id: 'strategy-brain',             icon: '🎯', name: 'StrategyBrain',            desc: '90-day strategy',         seconds: 58, coins: 100 },
  { id: 'copy-brain',                 icon: '🧠', name: 'CopyBrain AI',             desc: 'Ad copy — 3 variants',   seconds: 26, coins: 20  },
  { id: 'email-scribe',               icon: '📧', name: 'EmailScribe',              desc: '5-email sequence',        seconds: 42, coins: 25  },
]

// ─────────────────────────────────────────────────────────────
// MAIN DEMO PAGE
// ─────────────────────────────────────────────────────────────

export default function DemoPage() {
  const router        = useRouter()
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [copied,      setCopied]      = useState(false)

  const selectedTool   = DEMO_TOOLS.find((t) => t.id === selectedId)
  const selectedOutput = selectedId ? DEMO_OUTPUTS[selectedId] : null

  const copy = async () => {
    if (!selectedOutput) return
    await navigator.clipboard.writeText(selectedOutput.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    if (!selectedOutput) return
    const text = encodeURIComponent(selectedOutput.output.slice(0, 2000))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen" style={{ background: NAVY }}>

      {/* ── Nav ───────────────────────────────── */}
      <div className="border-b border-white/10 bg-[#0B1F3A]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">Cerebre</span>
            <span className="text-lg font-black" style={{ color: GOLD }}>Plus</span>
            <span className="rounded-full bg-[#E09818]/15 px-2 py-0.5 text-[10px] font-bold text-[#E09818] ml-1">DEMO</span>
          </div>
          <button
            onClick={() => router.push('/waitlist')}
            className="flex items-center gap-1.5 rounded-xl bg-[#E09818] px-4 py-2 text-xs font-bold text-[#0B1F3A] hover:opacity-90"
          >
            <Zap className="h-3.5 w-3.5" /> Try with YOUR business →
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* ── Demo header ─────────────────────── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white md:text-4xl">
            See Cerebre Plus in Action
          </h1>
          <p className="mt-3 text-base text-white/60">
            Using a sample Nigerian business: <span className="font-semibold text-white">Luxe Interiors Lagos</span> — interior design, Victoria Island
          </p>
          <p className="mt-1 text-sm text-[#E09818]/70">
            Click any tool to see what it generates. Your business gets a fully customised version.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Tool selector ─────────────────── */}
          <div>
            <p className="mb-3 text-xs font-bold text-white/40 uppercase tracking-wider">Choose a tool to demo</p>
            <div className="space-y-2">
              {DEMO_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedId(tool.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    selectedId === tool.id
                      ? 'border-[#E09818]/50 bg-[#E09818]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  }`}
                >
                  <span className="text-2xl shrink-0">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{tool.name}</p>
                    <p className="text-xs text-white/40">{tool.desc}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-white/30">
                      <Clock className="h-3 w-3" />
                      {tool.seconds}s
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#E09818]">
                      <Coins className="h-3 w-3" />
                      {tool.coins}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 rounded-2xl border border-[#E09818]/20 bg-[#E09818]/5 p-5">
              <p className="text-sm font-bold text-white">This was for Luxe Interiors Lagos.</p>
              <p className="mt-1 text-xs text-white/60">
                Your generation uses your business name, your city, your WhatsApp number, and your industry — not a sample company.
              </p>
              <a
                href='https://waitlist-orcin-nu.vercel.app/#waitlist'
                target='_blank'
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E09818] py-3 text-sm font-black text-[#0B1F3A] hover:opacity-90"
              >
                Create yours → Join Cerebre Plus <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* ── Output panel ──────────────────── */}
          <div>
            {!selectedOutput ? (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <div>
                  <Sparkles className="mx-auto mb-3 h-10 w-10 text-white/15" />
                  <p className="text-sm font-semibold text-white/40">Select a tool to see the output</p>
                  <p className="mt-1 text-xs text-white/25">Each output was generated in under 60 seconds</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                >
                  {/* Output header */}
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedTool?.icon}</span>
                      <span className="text-sm font-semibold text-white">{selectedTool?.name}</span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                        Generated in {selectedOutput.seconds}s
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copy}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          copied
                            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                            : 'border-white/10 text-white/50 hover:text-white'
                        }`}
                      >
                        {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                      <button
                        onClick={shareWhatsApp}
                        className="flex items-center gap-1.5 rounded-lg border border-[#25D366]/20 bg-[#25D366]/10 px-2.5 py-1.5 text-xs text-[#25D366]"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Output body */}
                  <div className="max-h-[480px] overflow-y-auto p-5">
                    <pre className="whitespace-pre-wrap text-xs text-white/75 font-sans leading-relaxed">
                      {selectedOutput.output}
                    </pre>
                  </div>

                  {/* CTA banner */}
                  <div className="border-t border-[#E09818]/20 bg-[#E09818]/5 px-5 py-4">
                    <p className="text-xs text-white/60 mb-2">
                      This was for "Luxe Interiors Lagos" — a sample business.
                      <strong className="text-white"> Your output uses your business details.</strong>
                    </p>
                    <button
                      onClick={() => router.push('/waitlist')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E09818] py-2.5 text-sm font-black text-[#0B1F3A] hover:opacity-90"
                    >
                      <Zap className="h-4 w-4" />
                      Try with YOUR business →
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
