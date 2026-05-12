// /emails/index.tsx
// All 8 Cerebre Plus transactional email templates.
// Uses React Email (https://react.email)
// Send via: import { sendEmail } from '@/lib/email'
// ─────────────────────────────────────────────────────────────
// Install: npm install @react-email/components react-email

import * as React from 'react'
import {
  Html, Head, Body, Container, Section, Row, Column,
  Heading, Text, Button, Hr, Img, Link, Preview,
} from '@react-email/components'

const NAVY    = '#0B1F3A'
const GOLD    = '#E09818'
const DARK    = '#071528'
const MUTED   = 'rgba(255,255,255,0.5)'
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cerebreplus.com'

// ─────────────────────────────────────────────────────────────
// SHARED LAYOUT
// ─────────────────────────────────────────────────────────────

function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: DARK, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
          {/* Logo */}
          <Section style={{ marginBottom: 32, textAlign: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Cerebre <span style={{ color: GOLD }}>Plus</span>
            </Text>
            <Text style={{ fontSize: 12, color: MUTED, margin: '4px 0 0' }}>by Cerebre Media Africa</Text>
          </Section>

          {/* Main card */}
          <Section style={{ backgroundColor: '#0B1F3A', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: '32px 28px' }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ marginTop: 24, textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              © {new Date().getFullYear()} Cerebre Media Africa · Nigeria's #1 AI Marketing Platform
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', margin: '4px 0 0' }}>
              <Link href={`${baseUrl}/settings`} style={{ color: 'rgba(255,255,255,0.25)' }}>Unsubscribe</Link>
              {' · '}
              <Link href={`${baseUrl}/settings`} style={{ color: 'rgba(255,255,255,0.25)' }}>Manage preferences</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: GOLD, color: NAVY, fontWeight: 700, fontSize: 14,
        padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
        display: 'block', textAlign: 'center', marginTop: 20,
      }}
    >
      {label}
    </Button>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 1: WELCOME (immediate on signup)
// ─────────────────────────────────────────────────────────────

export function WelcomeEmail({ firstName, planName = 'Free' }: { firstName: string; planName?: string }) {
  return (
    <EmailLayout preview={`Welcome to Cerebre Plus, ${firstName} — your AI marketing engine is ready.`}>
      <Heading style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        Welcome to Cerebre Plus, {firstName} ✨
      </Heading>
      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        You just joined {<span style={{ color: GOLD }}>Africa's premier AI marketing platform</span>}. This is the system that Nigerian business owners use to do in 60 seconds what used to take agencies ₦1.2M/month.
      </Text>

      <Section style={{ backgroundColor: 'rgba(224,152,24,0.08)', border: '1px solid rgba(224,152,24,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>Your first step:</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Complete your business profile. It takes 3 minutes and unlocks personalised outputs for all 40 tools — instead of generic templates.
        </Text>
      </Section>

      <CTA href={`${baseUrl}/profile`} label="Complete my profile →" />

      <Hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />

      <Text style={{ color: MUTED, fontSize: 12, lineHeight: 1.6, margin: 0 }}>
        Questions? Reply to this email or send a WhatsApp message to our support team.
      </Text>
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 2: VERIFICATION
// ─────────────────────────────────────────────────────────────

export function VerificationEmail({ firstName, verificationUrl }: { firstName: string; verificationUrl: string }) {
  return (
    <EmailLayout preview={`${firstName}, verify your Cerebre Plus email address.`}>
      <Heading style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        One tap to verify your email
      </Heading>
      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        Click the button below to verify your email address for {firstName}'s Cerebre Plus account. This link expires in 24 hours.
      </Text>

      <CTA href={verificationUrl} label="Verify email address" />

      <Hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
      <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0 }}>
        If you didn't create a Cerebre Plus account, ignore this email safely.
      </Text>
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 3: DAY 1 ONBOARDING NUDGE (profile incomplete)
// ─────────────────────────────────────────────────────────────

export function Day1NudgeEmail({ firstName, completeness = 0 }: { firstName: string; completeness?: number }) {
  return (
    <EmailLayout preview={`${firstName}, your profile is ${completeness}% complete — tool outputs aren't fully personalised yet.`}>
      <Heading style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        {firstName}, your outputs could be 3x better.
      </Heading>
      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        Your profile is only <strong style={{ color: GOLD }}>{completeness}% complete</strong>. That means every output you generate right now is a generic template — not the personalised, city-specific, WhatsApp-ready content Cerebre Plus is built to produce.
      </Text>

      <Section style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>What a complete profile unlocks:</Text>
        {[
          'Your business name and city in every caption and ad',
          'Your actual WhatsApp number in every CTA',
          'Your social proof woven into trust signals',
          'Your brand voice in every piece of content',
        ].map((item) => (
          <Text key={item} style={{ color: MUTED, fontSize: 13, margin: '4px 0', lineHeight: 1.5 }}>
            ✓ {item}
          </Text>
        ))}
      </Section>

      <CTA href={`${baseUrl}/profile`} label="Complete my profile now →" />
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 4: DAY 3 NUDGE (no generations yet — Fear + Giant Promise)
// ─────────────────────────────────────────────────────────────

export function Day3NudgeEmail({ firstName }: { firstName: string }) {
  return (
    <EmailLayout preview="Your competitors are using AI to market their businesses. Are you?">
      <Heading style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        {firstName}, your competitors are already using this.
      </Heading>
      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
        You signed up for Cerebre Plus 3 days ago and haven't run your first tool yet. That's okay — but I want to show you what you're missing.
      </Text>

      <Section style={{ backgroundColor: 'rgba(224,152,24,0.08)', border: '1px solid rgba(224,152,24,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>In the time you've been waiting:</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Business owners using Cerebre Plus have generated 90-day marketing strategies, WhatsApp campaigns, Instagram captions, and Google ad copy — all in under 60 seconds each. Your competitors may already be among them.
        </Text>
      </Section>

      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        Run CaptionCraft for free right now — 3 fields, 15 seconds, a caption that's ready to post.
      </Text>

      <CTA href={`${baseUrl}/tools/caption-craft`} label="Run my first tool free →" />
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 5: FIRST GENERATION CELEBRATION
// ─────────────────────────────────────────────────────────────

export function FirstGenerationEmail({ firstName, toolName = 'CaptionCraft' }: { firstName: string; toolName?: string }) {
  return (
    <EmailLayout preview={`🎉 ${firstName}, your first AI-generated marketing content is ready!`}>
      <Heading style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        🎉 First generation done, {firstName}!
      </Heading>
      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
        You just used <strong style={{ color: GOLD }}>{toolName}</strong> to create your first piece of AI-powered marketing content. This is the beginning of a new way of marketing your business.
      </Text>

      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        Now try these tools that work best together with {toolName}:
      </Text>

      <Section style={{ marginBottom: 20 }}>
        {[
          { name: 'WhatsApp Campaign Builder', desc: 'Turn your content into a broadcast', path: 'whatsapp-campaign-builder' },
          { name: 'StrategyBrain',              desc: 'Get a full 90-day marketing plan',  path: 'strategy-brain' },
        ].map((tool) => (
          <Section key={tool.name} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
            <Link href={`${baseUrl}/tools/${tool.path}`} style={{ textDecoration: 'none' }}>
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>{tool.name}</Text>
              <Text style={{ color: MUTED, fontSize: 12, margin: 0 }}>{tool.desc} →</Text>
            </Link>
          </Section>
        ))}
      </Section>

      <CTA href={`${baseUrl}/tools`} label="Explore all 40 tools →" />
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 6: LOW COINS WARNING (at 20 coins)
// ─────────────────────────────────────────────────────────────

export function LowCoinsEmail({ firstName, balance, planName = 'Starter' }: { firstName: string; balance: number; planName?: string }) {
  return (
    <EmailLayout preview={`⚠️ Only ${balance} Cerebre Coins left — don't let your marketing stop.`}>
      <Section style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: '#f87171', fontSize: 24, fontWeight: 900, margin: '0 0 4px' }}>
          ⚠️ Only {balance} coins left
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>
          Don't let your marketing momentum stop.
        </Text>
      </Section>

      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        {firstName}, at {balance} coins you can still run a few lightweight tools. But with your marketing in full swing, you'll want to top up before you run out mid-campaign.
      </Text>

      <Section style={{ marginBottom: 20 }}>
        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Quick top-up options:</Text>
        {[
          { coins: 50,   price: '₦500'   },
          { coins: 300,  price: '₦2,500' },
          { coins: 800,  price: '₦6,000' },
        ].map((pack) => (
          <Section key={pack.coins} style={{ display: 'inline-block', marginRight: 8 }}>
            <Link href={`${baseUrl}/billing`} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', fontSize: 12, color: '#ffffff' }}>
              {pack.coins} coins — {pack.price}
            </Link>
          </Section>
        ))}
      </Section>

      <CTA href={`${baseUrl}/billing`} label="Top up now →" />
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 7: RENEWAL CONFIRMATION
// ─────────────────────────────────────────────────────────────

export function RenewalEmail({ firstName, planName, coins, nextRenewal }: {
  firstName:   string
  planName:    string
  coins:       number
  nextRenewal: string
}) {
  return (
    <EmailLayout preview={`✅ Cerebre Plus ${planName} renewed — ${coins} coins added to your account.`}>
      <Heading style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        ✅ Subscription renewed, {firstName}
      </Heading>
      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        Your <strong style={{ color: GOLD }}>{planName} Plan</strong> has been renewed and <strong style={{ color: GOLD }}>{coins} coins</strong> have been added to your account.
      </Text>

      <Section style={{ backgroundColor: 'rgba(16,184,129,0.08)', border: '1px solid rgba(16,184,129,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: '#34d399', fontSize: 16, fontWeight: 900, margin: '0 0 4px' }}>
          +{coins} Cerebre Coins
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>
          Next renewal: {nextRenewal}
        </Text>
      </Section>

      <Text style={{ color: MUTED, fontSize: 13, margin: '0 0 16px' }}>
        Your marketing machine is refuelled. Here's what we recommend you run this month:
      </Text>

      <CTA href={`${baseUrl}/dashboard`} label="Go to my dashboard →" />

      <Hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
      <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0 }}>
        To cancel your subscription, go to{' '}
        <Link href={`${baseUrl}/billing`} style={{ color: 'rgba(224,152,24,0.6)' }}>Billing settings</Link>.
      </Text>
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL 8: PAYMENT FAILED
// ─────────────────────────────────────────────────────────────

export function PaymentFailedEmail({ firstName, planName, retryUrl }: {
  firstName: string
  planName:  string
  retryUrl:  string
}) {
  return (
    <EmailLayout preview={`⚠️ Your Cerebre Plus payment failed — action required to keep your access.`}>
      <Heading style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        Payment unsuccessful, {firstName}
      </Heading>
      <Text style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
        Your <strong style={{ color: GOLD }}>{planName} Plan</strong> payment didn't go through. This can happen if your card was declined, expired, or has insufficient funds.
      </Text>

      <Section style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <Text style={{ color: '#f87171', fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>What happens next:</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          You have a 7-day grace period. Update your payment method and your subscription will continue without interruption.
        </Text>
      </Section>

      <CTA href={retryUrl} label="Update payment method →" />

      <Hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
      <Text style={{ color: MUTED, fontSize: 13, margin: 0 }}>
        Need help? Reply to this email and we'll sort it out within 24 hours.
      </Text>
    </EmailLayout>
  )
}

// ─────────────────────────────────────────────────────────────
// EMAIL SENDER UTILITY (uses Resend)
// ─────────────────────────────────────────────────────────────

// /lib/email.ts — import this to send emails
// import { Resend } from 'resend'
// const resend = new Resend(process.env.RESEND_API_KEY)
//
// export async function sendEmail(to: string, subject: string, component: React.ReactElement) {
//   return resend.emails.send({
//     from:    'Cerebre Plus <hello@cerebreplus.com>',
//     to,
//     subject,
//     react:   component,
//   })
// }
//
// Usage:
// await sendEmail(user.email, 'Welcome to Cerebre Plus', <WelcomeEmail firstName="Ife" />)
