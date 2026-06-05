// ═══════════════════════════════════════════════════════════════
// /lib/email.ts  — Cerebre Plus Email Utility
//
// SERVER-SIDE ONLY. Never import in client components.
//
// Usage:
//   import { sendEmail } from '@/lib/email'
//
//   await sendEmail({
//     to:       'user@example.com',
//     template: 'welcome',
//     data:     { firstName: 'Amaka' },
//   })
//
// Gracefully skips if RESEND_API_KEY is not set.
// All 13 templates are mapped here.
// ═══════════════════════════════════════════════════════════════

import * as React from 'react'
import { Resend }  from 'resend'
import {
  WelcomeEmail,
  VerificationEmail,
  Day1NudgeEmail,
  Day3NudgeEmail,
  FirstGenerationEmail,
  LowCoinsEmail,
  RenewalEmail,
  PaymentFailedEmail,
  ReferralSuccessEmail,
  SMEClubWelcomeEmail,
  TrialEndingSoonEmail,
  TrialExpiredEmail,
  UpgradeConfirmEmail,
} from '@/emails'

// ── Resend singleton ──────────────────────────────────────────
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

const FROM = 'Cerebre Plus <hello@cerebreplus.com>'

// ─────────────────────────────────────────────────────────────
// TEMPLATE TYPES
// ─────────────────────────────────────────────────────────────

export type EmailTemplate =
  | 'welcome'               // Immediate on signup
  | 'verification'          // Email verify
  | 'day1_nudge'            // 24h after signup, no generation
  | 'day3_nudge'            // 3 days after signup, still no generation
  | 'first_generation'      // After first tool run
  | 'low_coins'             // Balance < 20% of plan coins
  | 'renewal'               // After successful annual payment
  | 'payment_failed'        // Payment failure
  | 'referral_success'      // Referral converts to paying user
  | 'sme_club_welcome'      // On Growth plan upgrade
  | 'trial_ending_soon'     // 7 days and 3 days before trial expires
  | 'trial_expired'         // Day trial expires
  | 'upgrade_confirm'       // Any plan upgrade (Starter or Growth)

// ─────────────────────────────────────────────────────────────
// EMAIL TRIGGERS — when each template fires
// Reference for cron jobs, webhooks, and auth callbacks.
// ─────────────────────────────────────────────────────────────

export const EMAIL_TRIGGERS: Record<EmailTemplate, string> = {
  welcome:            'Immediately after new user signup (auth callback)',
  verification:       'When email verification is required (auth callback)',
  day1_nudge:         'Cron: 24 hours after signup IF no tool generation recorded',
  day3_nudge:         'Cron: 72 hours after signup IF no tool generation recorded',
  first_generation:   'Immediately after first tool run (in generate API route)',
  low_coins:          'After any coin deduction when balance < 20% of plan allocation',
  renewal:            'Immediately after successful Paystack annual payment (webhook)',
  payment_failed:     'Immediately after Paystack charge.failed event (webhook)',
  referral_success:   `When referred user's payment clears (referral API POST route)`,
  sme_club_welcome:   'Immediately after upgrade to Growth plan (verify-payment route)',
  trial_ending_soon:  'Cron: 7 days before free_expires_at AND 3 days before',
  trial_expired:      'Cron: On the day free_expires_at passes',
  upgrade_confirm:    'Immediately after any paid plan upgrade (verify-payment route)',
}

// ─────────────────────────────────────────────────────────────
// SEND FUNCTION
// ─────────────────────────────────────────────────────────────

interface SendEmailOptions {
  to:       string
  template: EmailTemplate
  data:     Record<string, any>
}

export async function sendEmail({ to, template, data }: SendEmailOptions): Promise<{
  success: boolean
  skipped?: boolean
  error?:   string
  messageId?: string
}> {
  // Gracefully skip if Resend is not configured
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[email] RESEND_API_KEY not set — skipping: ${template} → ${to}`)
    }
    return { success: false, skipped: true }
  }

  // Validate email address minimally
  if (!to || !to.includes('@')) {
    console.warn(`[email] Invalid address for template ${template}: ${to}`)
    return { success: false, error: 'Invalid email address' }
  }

  try {
    const resend = getResend()
    const { subject, component } = buildTemplate(template, data)

    const { data: sent, error } = await resend.emails.send({
      from:    FROM,
      to,
      subject,
      react:   component,
    })

    if (error) {
      console.error(`[email] Resend error (${template}):`, error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: sent?.id }
  } catch (err: any) {
    console.error(`[email] Unexpected error (${template}):`, err?.message)
    return { success: false, error: err?.message ?? 'Unknown error' }
  }
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE BUILDER
// Maps template name + data to subject + React component.
// ─────────────────────────────────────────────────────────────

function buildTemplate(
  template: EmailTemplate,
  data:     Record<string, any>
): { subject: string; component: React.ReactElement } {
  const d = data  // alias for brevity

  const map: Record<EmailTemplate, { subject: string; component: React.ReactElement }> = {

    welcome: {
      subject:   `Welcome to Cerebre Plus, ${d.firstName}! Your 70 coins are ready.`,
      component: React.createElement(WelcomeEmail, {
        firstName: d.firstName,
      }),
    },

    verification: {
      subject:   'Verify your Cerebre Plus email — takes 10 seconds',
      component: React.createElement(VerificationEmail, {
        firstName:       d.firstName,
        verificationUrl: d.verificationUrl,
      }),
    },

    day1_nudge: {
      subject:   `${d.firstName}, your tools aren't fully personalised yet`,
      component: React.createElement(Day1NudgeEmail, {
        firstName:    d.firstName,
        completeness: d.completeness ?? 40,
      }),
    },

    day3_nudge: {
      subject:   `Your competitors are using this. Are you?`,
      component: React.createElement(Day3NudgeEmail, {
        firstName: d.firstName,
      }),
    },

    first_generation: {
      subject:   `🎉 First generation done, ${d.firstName}! Two tools to try next.`,
      component: React.createElement(FirstGenerationEmail, {
        firstName: d.firstName,
        toolName:  d.toolName ?? 'your first tool',
      }),
    },

    low_coins: {
      subject:   `⚠️ Only ${d.balance} Cerebre Coins left — top up before you run out`,
      component: React.createElement(LowCoinsEmail, {
        firstName: d.firstName,
        balance:   d.balance,
        planName:  d.planName ?? 'Starter',
      }),
    },

    renewal: {
      subject:   `✅ Cerebre Plus ${d.planName} renewed — ${d.coins} coins added`,
      component: React.createElement(RenewalEmail, {
        firstName:   d.firstName,
        planName:    d.planName,
        coins:       d.coins,
        nextRenewal: d.nextRenewal,
      }),
    },

    payment_failed: {
      subject:   `Action required: Your Cerebre Plus payment failed`,
      component: React.createElement(PaymentFailedEmail, {
        firstName: d.firstName,
        planName:  d.planName,
        retryUrl:  d.retryUrl,
      }),
    },

    referral_success: {
      subject:   `💰 You earned ${d.coinsEarned} coins — your referral just subscribed!`,
      component: React.createElement(ReferralSuccessEmail, {
        firstName:   d.firstName,
        planTier:    d.planTier,
        coinsEarned: d.coinsEarned,
      }),
    },

    sme_club_welcome: {
      subject:   `🌟 Welcome to the SME Club, ${d.firstName}`,
      component: React.createElement(SMEClubWelcomeEmail, {
        firstName: d.firstName,
      }),
    },

    trial_ending_soon: {
      subject:   `⏳ ${d.daysLeft} day${d.daysLeft !== 1 ? 's' : ''} left in your Cerebre Plus trial`,
      component: React.createElement(TrialEndingSoonEmail, {
        firstName: d.firstName,
        daysLeft:  d.daysLeft,
      }),
    },

    trial_expired: {
      subject:   `Your Cerebre Plus free trial has ended — here's how to get back in`,
      component: React.createElement(TrialExpiredEmail, {
        firstName: d.firstName,
      }),
    },

    upgrade_confirm: {
      subject:   `✅ You're on ${d.planName}! ${d.coins} coins are in your account.`,
      component: React.createElement(UpgradeConfirmEmail, {
        firstName:  d.firstName,
        planName:   d.planName,
        coins:      d.coins,
        validUntil: d.validUntil,
      }),
    },
  }

  const tmpl = map[template]
  if (!tmpl) throw new Error(`[email] Unknown template: ${template}`)
  return tmpl
}

// ─────────────────────────────────────────────────────────────
// BATCH HELPER
// Send the same template to multiple recipients.
// Fires sequentially to respect Resend rate limits.
// ─────────────────────────────────────────────────────────────

export async function sendEmailBatch(
  recipients: Array<{ to: string; data: Record<string, any> }>,
  template: EmailTemplate,
  delayMs = 100
): Promise<void> {
  for (const r of recipients) {
    await sendEmail({ to: r.to, template, data: r.data })
    if (delayMs) await new Promise(res => setTimeout(res, delayMs))
  }
}
