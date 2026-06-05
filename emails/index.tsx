// /emails/index.tsx
// All Cerebre Plus transactional email templates (React Email).
// Install: npm install @react-email/components react-email
//
// Templates:
//   1.  WelcomeEmail              — on signup
//   2.  VerificationEmail         — email verify
//   3.  Day1NudgeEmail            — 24h after signup, no generation
//   4.  Day3NudgeEmail            — 3 days after signup, still no generation
//   5.  FirstGenerationEmail      — after first tool run
//   6.  LowCoinsEmail             — balance < 20% of plan coins
//   7.  RenewalEmail              — after successful annual payment
//   8.  PaymentFailedEmail        — payment failure
//   9.  ReferralSuccessEmail      — referral converts to paid
//  10.  SMEClubWelcomeEmail       — on Growth plan upgrade
//  11.  TrialEndingSoonEmail      — 7 days and 3 days before trial expires
//  12.  TrialExpiredEmail         — day trial expires
//  13.  UpgradeConfirmEmail       — any plan upgrade (Starter or Growth)

import * as React from 'react'
import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Link, Preview,
} from '@react-email/components'

// ── Brand tokens ──────────────────────────────────────────────
const DARK      = '#071528'
const NAVY      = '#0B1F3A'
const GOLD      = '#E09818'
const GOLD_L    = '#F5B830'
const TEAL      = '#12D4B4'
const CORAL     = '#E84830'
const WHITE     = '#FFFFFF'
const DIM       = 'rgba(255,255,255,0.55)'
const MUTED     = 'rgba(255,255,255,0.3)'
const BASE_URL  = process.env.NEXT_PUBLIC_APP_URL || 'https://cerebreplus.com'
const SUPPORT_WA = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '2348124266524'

// ── Shared components ─────────────────────────────────────────

function EmailLayout({ preview, children, accentColor = GOLD }: {
  preview: string; children: React.ReactNode; accentColor?: string
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: DARK, fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
          {/* Logo */}
          <Section style={{ marginBottom: 28, textAlign: 'center' }}>
            <Text style={{ fontSize: 26, fontWeight: 900, color: WHITE, margin: 0, letterSpacing: '-0.5px' }}>
              Cerebre <span style={{ color: GOLD }}>Plus</span>
            </Text>
            <Text style={{ fontSize: 11, color: MUTED, margin: '4px 0 0' }}>by Cerebre Media Africa</Text>
          </Section>
          {/* Top accent bar */}
          <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${accentColor},transparent)`, marginBottom: 0, borderRadius: '2px 2px 0 0' }} />
          {/* Card */}
          <Section style={{ backgroundColor: NAVY, borderRadius: '0 0 16px 16px', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', padding: '32px 28px' }}>
            {children}
          </Section>
          {/* Footer */}
          <Section style={{ marginTop: 24, textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
              © {new Date().getFullYear()} Cerebre Media Africa · Lagos, Nigeria
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', margin: '6px 0 0' }}>
              <Link href={`${BASE_URL}/settings`} style={{ color: 'rgba(255,255,255,0.25)' }}>Manage preferences</Link>
              {' · '}
              <Link href={`${BASE_URL}/settings`} style={{ color: 'rgba(255,255,255,0.25)' }}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

function CTA({ href, label, color = GOLD, textColor = NAVY }: { href: string; label: string; color?: string; textColor?: string }) {
  return (
    <Button href={href} style={{ backgroundColor: color, color: textColor, fontWeight: 700, fontSize: 14, padding: '14px 28px', borderRadius: 12, display: 'block', textAlign: 'center', marginTop: 22, textDecoration: 'none' }}>
      {label}
    </Button>
  )
}

function Divider() {
  return <Hr style={{ borderColor: 'rgba(255,255,255,0.07)', margin: '22px 0' }} />
}

function Highlight({ children, color = GOLD }: { children: React.ReactNode; color?: string }) {
  return <span style={{ color }}>{children}</span>
}

function InfoBox({ children, color = GOLD }: { children: React.ReactNode; color?: string }) {
  return (
    <Section style={{ backgroundColor: `rgba(224,152,24,0.08)`, border: `1px solid rgba(224,152,24,0.2)`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
      {children}
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════
// 1. WELCOME  (trigger: immediately on signup)
// ═══════════════════════════════════════════════════════════════
export function WelcomeEmail({ firstName }: { firstName: string }) {
  return (
    <EmailLayout preview={`Welcome to Cerebre Plus, ${firstName} — your AI marketing engine is ready.`}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        Welcome to Cerebre Plus, {firstName} ✨
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        You just joined Africa's AI marketing platform. Brands pay agencies{' '}
        <Highlight>₦300,000–₦2,000,000/month</Highlight> for what you now have access to — starting from{' '}
        <Highlight>₦20,000/year</Highlight>.
      </Text>
      <InfoBox>
        <Text style={{ color: GOLD_L, fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>Your first step — takes 3 minutes</Text>
        <Text style={{ color: DIM, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Complete your business profile. This is what makes every output personal to your business — your city, your customers, your brand voice. Without it, the tools give you generic output. With it, they give you your marketing.
        </Text>
      </InfoBox>
      <CTA href={`${BASE_URL}/profile`} label="Complete my profile →" />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, lineHeight: 1.6, margin: 0 }}>
        You have <Highlight>70 free coins</Highlight> valid for 30 days. Every coin buys real marketing output. Use them well.
      </Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 2. VERIFICATION  (trigger: email verification required)
// ═══════════════════════════════════════════════════════════════
export function VerificationEmail({ firstName, verificationUrl }: { firstName: string; verificationUrl: string }) {
  return (
    <EmailLayout preview="Verify your Cerebre Plus email address to get started.">
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        Verify your email, {firstName}
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 6px' }}>
        Click the button below to verify your email address and activate your Cerebre Plus account.
      </Text>
      <Text style={{ color: MUTED, fontSize: 12, margin: '0 0 20px' }}>This link expires in 24 hours.</Text>
      <CTA href={verificationUrl} label="Verify my email →" />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>
        Didn't sign up? Ignore this email — your address won't be added to anything.
      </Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 3. DAY 1 NUDGE  (trigger: 24h after signup, no generation yet)
// Focused on specifics — exactly what completing 4 fields unlocks.
// ═══════════════════════════════════════════════════════════════
export function Day1NudgeEmail({ firstName, completeness = 40 }: { firstName: string; completeness?: number }) {
  return (
    <EmailLayout preview={`${firstName}, your outputs aren't fully personalised yet. Here's what you're missing.`}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        {firstName}, your tools are running at {completeness}% power
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        You have 40 marketing tools ready to go — but right now they're working with incomplete information. Here's exactly what filling in 4 fields unlocks:
      </Text>
      {[
        { field: 'Your city',            unlock: 'Outputs mention your specific location — Yaba, VI, Lekki, GRA. Not "Lagos" generically.' },
        { field: 'Your target customer', unlock: 'Every caption, ad, and strategy is written for that specific person — not a generic Nigerian.' },
        { field: 'Your unique advantage',unlock: 'Your WhatsApp campaigns and sales pages lead with what makes you different.' },
        { field: 'Your brand voice',     unlock: 'Outputs match your personality — warm, bold, professional, or whatever yours is.' },
      ].map(item => (
        <Section key={item.field} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
          <Text style={{ color: GOLD_L, fontSize: 12, fontWeight: 700, margin: '0 0 3px' }}>{item.field}</Text>
          <Text style={{ color: DIM, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{item.unlock}</Text>
        </Section>
      ))}
      <CTA href={`${BASE_URL}/profile`} label="Complete my profile in 3 minutes →" />
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 4. DAY 3 NUDGE  (trigger: 3 days after signup, still no generation)
// Cerebre Law 4: Fear. Your competitors are already using this.
// ═══════════════════════════════════════════════════════════════
export function Day3NudgeEmail({ firstName }: { firstName: string }) {
  return (
    <EmailLayout preview="Your competitors are already using this. You signed up 3 days ago and haven't started yet." accentColor={CORAL}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        {firstName}, your competitors are already using this.
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        You signed up for Cerebre Plus 3 days ago and haven't run your first tool yet. That's fine — life is busy. But here's the honest version of what's happening in your market right now:
      </Text>
      <Section style={{ backgroundColor: 'rgba(232,72,48,0.06)', border: '1px solid rgba(232,72,48,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: CORAL, fontSize: 13, fontWeight: 700, margin: '0 0 6px' }}>Every day you don't market consistently…</Text>
        <Text style={{ color: DIM, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          A customer who would have found you is finding your competitor instead. Not because your product is worse. Because your marketing isn't there.
        </Text>
      </Section>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        You have <Highlight>70 free coins</Highlight> sitting in your account. Your first generation takes 60 seconds. Pick one tool and run it right now — even if the output isn't perfect, it will show you what's possible.
      </Text>
      <CTA href={`${BASE_URL}/tools`} label="Run my first tool now →" />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>
        Your trial expires in <strong style={{ color: CORAL }}>27 days</strong>. After that, your coins are gone.
      </Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 5. FIRST GENERATION  (trigger: immediately after first tool run)
// ═══════════════════════════════════════════════════════════════
export function FirstGenerationEmail({ firstName, toolName = 'your first tool' }: { firstName: string; toolName?: string }) {
  const nextTools = [
    { name: '90-Day Marketing Strategy', cost: '100 coins', desc: 'A complete marketing plan for the next 3 months.' },
    { name: 'WhatsApp Campaign Builder', cost: '25 coins',  desc: 'Turn one idea into a full WhatsApp broadcast campaign.' },
  ]
  return (
    <EmailLayout preview={`🎉 First generation done, ${firstName}! Here are two tools to try next.`} accentColor={TEAL}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        🎉 First generation complete, {firstName}!
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        You just ran <Highlight color={TEAL}>{toolName}</Highlight> — welcome to Cerebre Plus properly. That output was personalised to your business, your city, and your customers. Not a template. Yours.
      </Text>
      <Text style={{ color: WHITE, fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>What to try next:</Text>
      {nextTools.map(t => (
        <Section key={t.name} style={{ backgroundColor: 'rgba(18,212,180,0.06)', border: '1px solid rgba(18,212,180,0.18)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
          <Text style={{ color: TEAL, fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>{t.name} · {t.cost}</Text>
          <Text style={{ color: DIM, fontSize: 13, margin: 0 }}>{t.desc}</Text>
        </Section>
      ))}
      <CTA href={`${BASE_URL}/tools`} label="Explore all 40 tools →" color={TEAL} textColor={DARK} />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>
        Running low on coins? <Link href={`${BASE_URL}/billing`} style={{ color: GOLD_L }}>Top up from ₦5,000</Link>
      </Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 6. LOW COINS  (trigger: balance < 20% of plan allocation)
// Red warning styling. 3 top-up options inline.
// ═══════════════════════════════════════════════════════════════
export function LowCoinsEmail({ firstName, balance, planName = 'Starter' }: { firstName: string; balance: number; planName?: string }) {
  const packs = [
    { coins: 50,  price: '₦20,000', href: `${BASE_URL}/billing?pack=bulk_50`  },
    { coins: 100, price: '₦35,000', href: `${BASE_URL}/billing?pack=bulk_100` },
    { coins: 200, price: '₦65,000', href: `${BASE_URL}/billing?pack=bulk_200` },
  ]
  return (
    <EmailLayout preview={`⚠️ Only ${balance} coins left in your Cerebre Plus account, ${firstName}.`} accentColor={CORAL}>
      <Section style={{ backgroundColor: 'rgba(232,72,48,0.06)', border: '1px solid rgba(232,72,48,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: CORAL, fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>⚠️ {balance} coins remaining</Text>
        <Text style={{ color: DIM, fontSize: 13, margin: 0 }}>{firstName}, your {planName} account is running low.</Text>
      </Section>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>
        When your coins run out, you won't be able to generate new outputs until you top up. Choose a pack below to keep things moving:
      </Text>
      {packs.map(p => (
        <Section key={p.coins} style={{ display: 'inline-block', width: '100%', marginBottom: 10 }}>
          <Button href={p.href} style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: WHITE, fontWeight: 700, fontSize: 13, padding: '12px 20px', borderRadius: 10, display: 'block', textAlign: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.14)' }}>
            {p.coins} coins — {p.price}
          </Button>
        </Section>
      ))}
      <CTA href={`${BASE_URL}/billing`} label="Top up my coins →" color={CORAL} textColor={WHITE} />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>
        Base rate: ₦500/coin. Minimum 10 coins (₦5,000). Bulk packs save up to 40%.
      </Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 7. RENEWAL CONFIRMATION  (trigger: after successful annual payment)
// ═══════════════════════════════════════════════════════════════
export function RenewalEmail({ firstName, planName, coins, nextRenewal }: {
  firstName: string; planName: string; coins: number; nextRenewal: string
}) {
  return (
    <EmailLayout preview={`✅ ${planName} renewed — ${coins} coins are now in your account.`} accentColor={TEAL}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        ✅ Your {planName} plan is renewed
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        Payment confirmed, {firstName}. Your Cerebre Plus {planName} plan is active for another full year.
      </Text>
      <Section style={{ backgroundColor: 'rgba(18,212,180,0.08)', border: '1px solid rgba(18,212,180,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: TEAL, fontSize: 32, fontWeight: 900, margin: '0 0 4px' }}>+{coins} coins</Text>
        <Text style={{ color: DIM, fontSize: 13, margin: 0 }}>credited to your account right now</Text>
        <Hr style={{ borderColor: 'rgba(18,212,180,0.15)', margin: '12px 0' }} />
        <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>Next renewal: <strong style={{ color: WHITE }}>{nextRenewal}</strong></Text>
      </Section>
      {planName.toLowerCase().includes('growth') && (
        <InfoBox>
          <Text style={{ color: GOLD_L, fontSize: 13, fontWeight: 700, margin: '0 0 3px' }}>Your SME Club is active</Text>
          <Text style={{ color: DIM, fontSize: 13, margin: 0, lineHeight: 1.5 }}>The weekly WhatsApp masterclass, private community, and priority support are all live. Check your WhatsApp for this week's lesson.</Text>
        </InfoBox>
      )}
      <CTA href={`${BASE_URL}/tools`} label="Run a tool now →" color={TEAL} textColor={DARK} />
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 8. PAYMENT FAILED  (trigger: Paystack charge.failed event)
// 7-day grace period clearly stated. Single update CTA.
// ═══════════════════════════════════════════════════════════════
export function PaymentFailedEmail({ firstName, planName, retryUrl }: {
  firstName: string; planName: string; retryUrl: string
}) {
  return (
    <EmailLayout preview={`Action required: Your Cerebre Plus payment failed, ${firstName}.`} accentColor={CORAL}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        Payment not processed, {firstName}
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        We couldn't process your payment for Cerebre Plus {planName}. This can happen when a card expires or the bank declines the charge.
      </Text>
      <Section style={{ backgroundColor: 'rgba(232,72,48,0.06)', border: '1px solid rgba(232,72,48,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <Text style={{ color: CORAL, fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>You have 7 days</Text>
        <Text style={{ color: DIM, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Your account will stay active for 7 days from today. Update your payment details before then to avoid losing access to your tools and outputs.
        </Text>
      </Section>
      <CTA href={retryUrl} label="Update payment details →" color={CORAL} textColor={WHITE} />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
        Need help? Message us on WhatsApp:{' '}
        <Link href={`https://wa.me/${SUPPORT_WA}`} style={{ color: GOLD_L }}>click here</Link>
      </Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 9. REFERRAL SUCCESS  (trigger: referral converts to paid subscriber)
// ═══════════════════════════════════════════════════════════════
export function ReferralSuccessEmail({ firstName, planTier, coinsEarned }: {
  firstName: string; planTier: string; coinsEarned: number
}) {
  return (
    <EmailLayout preview={`🎉 You just earned ${coinsEarned} coins — your referral subscribed to Cerebre Plus!`} accentColor={GOLD}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        💰 Your referral just converted!
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        Good news, {firstName} — someone you referred just subscribed to the <Highlight>{planTier}</Highlight> plan. Your reward is in your account.
      </Text>
      <Section style={{ backgroundColor: 'rgba(224,152,24,0.1)', border: '1px solid rgba(224,152,24,0.25)', borderRadius: 12, padding: '18px 20px', marginBottom: 20, textAlign: 'center' }}>
        <Text style={{ color: GOLD, fontSize: 40, fontWeight: 900, margin: '0 0 4px' }}>+{coinsEarned} coins</Text>
        <Text style={{ color: DIM, fontSize: 13, margin: 0 }}>credited to your account right now</Text>
      </Section>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        Keep sharing your referral link. Every Starter referral earns you 50 coins. Every Growth referral earns you 100 coins.
      </Text>
      <CTA href={`${BASE_URL}/referral`} label="View my referral stats →" />
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 10. SME CLUB WELCOME  (trigger: user upgrades to Growth plan)
// ═══════════════════════════════════════════════════════════════
export function SMEClubWelcomeEmail({ firstName }: { firstName: string }) {
  const benefits = [
    { e: '📱', t: 'Weekly WhatsApp Masterclass',   d: 'Every week — one sharp, practical marketing lesson from practitioners who build Nigerian brands.' },
    { e: '👥', t: 'Private SME Community',         d: 'A group of serious Nigerian business owners sharing wins, asking for feedback, holding each other accountable.' },
    { e: '📰', t: 'Monthly Insider Newsletter',    d: 'Curated marketing playbook, Nigerian case studies, and platform-specific strategies every month.' },
    { e: '🚀', t: 'Priority Support (< 4 hours)', d: 'Direct line to the Cerebre team. Monday to Saturday. Real answers, not a ticket queue.' },
  ]
  return (
    <EmailLayout preview={`Welcome to the SME Club, ${firstName} — your weekly marketing edge starts now.`} accentColor={GOLD}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        🌟 Welcome to the SME Club, {firstName}
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        You've joined the Growth plan — and with it, the exclusive SME Club. Here's what's now active on your account:
      </Text>
      {benefits.map(b => (
        <Section key={b.t} style={{ backgroundColor: 'rgba(224,152,24,0.06)', border: '1px solid rgba(224,152,24,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
          <Text style={{ fontSize: 14, margin: '0 0 4px' }}>
            {b.e} <span style={{ color: GOLD_L, fontWeight: 700 }}>{b.t}</span>
          </Text>
          <Text style={{ color: DIM, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{b.d}</Text>
        </Section>
      ))}
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '18px 0' }}>
        Your <Highlight>700 coins</Highlight> are in your account. The first masterclass will arrive on WhatsApp this week. Make sure your WhatsApp number is in your profile.
      </Text>
      <CTA href={`${BASE_URL}/profile`} label="Verify my WhatsApp number →" />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>
        Priority support: <Link href={`https://wa.me/${SUPPORT_WA}`} style={{ color: GOLD_L }}>WhatsApp the Cerebre team</Link>
      </Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 11. TRIAL ENDING SOON  (trigger: 7 days AND 3 days before trial ends)
// ═══════════════════════════════════════════════════════════════
export function TrialEndingSoonEmail({ firstName, daysLeft }: { firstName: string; daysLeft: number }) {
  const urgent = daysLeft <= 3
  const accentColor = urgent ? CORAL : GOLD
  return (
    <EmailLayout preview={`${firstName}, your Cerebre Plus trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`} accentColor={accentColor}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        {urgent ? '⏳' : '📅'} {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your trial, {firstName}
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        Your 30-day free trial ends in <Highlight color={urgent ? CORAL : GOLD_L}>{daysLeft} days</Highlight>. After that, your 70 coins expire and you won't be able to run tools until you subscribe.
      </Text>
      <Section style={{ backgroundColor: `rgba(224,152,24,0.08)`, border: `1px solid rgba(224,152,24,0.2)`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <Text style={{ color: GOLD_L, fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>Lock in your founding member price before it closes:</Text>
        {[
          { name: 'Starter', price: '₦20,000/year', eq: '₦1,667/month', href: `${BASE_URL}/billing?plan=starter` },
          { name: 'Growth',  price: '₦80,000/year', eq: '₦6,667/month', href: `${BASE_URL}/billing?plan=growth`  },
        ].map(p => (
          <Text key={p.name} style={{ color: DIM, fontSize: 13, margin: '0 0 4px' }}>
            {p.name}: <span style={{ color: WHITE, fontWeight: 700 }}>{p.price}</span> = {p.eq} equivalent
          </Text>
        ))}
      </Section>
      <CTA href={`${BASE_URL}/billing`} label={`Upgrade now — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left →`} color={urgent ? CORAL : GOLD} textColor={urgent ? WHITE : DARK} />
      <Divider />
      <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>Founding member price is locked in forever once you subscribe.</Text>
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 12. TRIAL EXPIRED  (trigger: day free trial expires)
// ═══════════════════════════════════════════════════════════════
export function TrialExpiredEmail({ firstName }: { firstName: string }) {
  return (
    <EmailLayout preview={`Your Cerebre Plus free trial has ended, ${firstName}. Here's how to get back in.`} accentColor={CORAL}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        Your free trial has ended, {firstName}
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        Your 30-day free trial has expired and your coins have run out. Your account is now locked — but your profile and history are saved.
      </Text>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        Subscribe to get back in. Founding member pricing is still available — but it closes when we hit 1,000 subscribers:
      </Text>
      {[
        { name: 'Starter', price: '₦20,000/year', coins: '150 coins', eq: '₦1,667/mo equivalent', href: `${BASE_URL}/billing?plan=starter&reason=trial_expired` },
        { name: 'Growth',  price: '₦80,000/year', coins: '700 coins + SME Club', eq: '₦6,667/mo equivalent', href: `${BASE_URL}/billing?plan=growth&reason=trial_expired` },
      ].map(p => (
        <Section key={p.name} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px', marginBottom: 10 }}>
          <Text style={{ color: WHITE, fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>{p.name} — <span style={{ color: GOLD_L }}>{p.price}</span></Text>
          <Text style={{ color: DIM, fontSize: 13, margin: '0 0 10px' }}>{p.coins} · {p.eq}</Text>
          <Button href={p.href} style={{ backgroundColor: GOLD, color: DARK, fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            Subscribe to {p.name} →
          </Button>
        </Section>
      ))}
    </EmailLayout>
  )
}

// ═══════════════════════════════════════════════════════════════
// 13. UPGRADE CONFIRMATION  (trigger: any plan upgrade: Starter or Growth)
// ═══════════════════════════════════════════════════════════════
export function UpgradeConfirmEmail({ firstName, planName, coins, validUntil }: {
  firstName: string; planName: string; coins: number; validUntil: string
}) {
  return (
    <EmailLayout preview={`✅ You're on ${planName}! ${coins} coins are ready in your account.`} accentColor={TEAL}>
      <Heading style={{ color: WHITE, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
        ✅ You're on {planName}, {firstName}
      </Heading>
      <Text style={{ color: DIM, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        Payment confirmed. Welcome to your first full year of Cerebre Plus. Your account is fully active.
      </Text>
      <Section style={{ backgroundColor: 'rgba(18,212,180,0.08)', border: '1px solid rgba(18,212,180,0.2)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
        <Text style={{ color: TEAL, fontSize: 32, fontWeight: 900, margin: '0 0 4px' }}>{coins} coins</Text>
        <Text style={{ color: DIM, fontSize: 13, margin: '0 0 10px' }}>available in your account right now</Text>
        <Hr style={{ borderColor: 'rgba(18,212,180,0.15)', margin: '10px 0' }} />
        <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>Valid until: <strong style={{ color: WHITE }}>{validUntil}</strong></Text>
      </Section>
      {planName.toLowerCase().includes('growth') && (
        <InfoBox>
          <Text style={{ color: GOLD_L, fontSize: 13, fontWeight: 700, margin: '0 0 3px' }}>🌟 SME Club is live on your account</Text>
          <Text style={{ color: DIM, fontSize: 13, margin: 0, lineHeight: 1.5 }}>Expect your first WhatsApp masterclass this week. Make sure your WhatsApp number is saved in your profile.</Text>
        </InfoBox>
      )}
      <CTA href={`${BASE_URL}/tools`} label="Start using your tools →" color={TEAL} textColor={DARK} />
    </EmailLayout>
  )
}
