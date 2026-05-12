// /lib/email.ts
// Unified email sender using Resend.
// SERVER-SIDE ONLY — never import in client components.
import * as React from 'react'
import { Resend } from 'resend'
import {
  WelcomeEmail, VerificationEmail, Day1NudgeEmail,
  Day3NudgeEmail, FirstGenerationEmail, LowCoinsEmail,
  RenewalEmail, PaymentFailedEmail,
} from '@/emails'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

const FROM = 'Cerebre Plus <hello@cerebreplus.com>'

export type EmailName =
  | 'welcome'
  | 'verification'
  | 'day1_nudge'
  | 'day3_nudge'
  | 'first_generation'
  | 'low_coins'
  | 'renewal'
  | 'payment_failed'

interface SendEmailOptions {
  to:       string
  template: EmailName
  data:     Record<string, any>
}

export async function sendEmail({ to, template, data }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send')
    return { success: false, skipped: true }
  }

  const resend = getResend()

  const TEMPLATES: Record<EmailName, { subject: string; component: React.ReactElement }> = {
    welcome: {
      subject:   `Welcome to Cerebre Plus, ${data.firstName}!`,
      component: React.createElement(WelcomeEmail, { firstName: data.firstName, planName: data.planName }),
    },
    verification: {
      subject:   'Verify your Cerebre Plus email',
      component: React.createElement(VerificationEmail, { firstName: data.firstName, verificationUrl: data.verificationUrl }),
    },
    day1_nudge: {
      subject:   `${data.firstName}, your outputs aren't fully personalised yet`,
      component: React.createElement(Day1NudgeEmail, { firstName: data.firstName, completeness: data.completeness }),
    },
    day3_nudge: {
      subject:   'Your competitors are using this. Are you?',
      component: React.createElement(Day3NudgeEmail, { firstName: data.firstName }),
    },
    first_generation: {
      subject:   `🎉 First generation done, ${data.firstName}!`,
      component: React.createElement(FirstGenerationEmail, { firstName: data.firstName, toolName: data.toolName }),
    },
    low_coins: {
      subject:   `⚠️ Only ${data.balance} Cerebre Coins left`,
      component: React.createElement(LowCoinsEmail, { firstName: data.firstName, balance: data.balance, planName: data.planName }),
    },
    renewal: {
      subject:   `✅ Cerebre Plus ${data.planName} renewed — ${data.coins} coins added`,
      component: React.createElement(RenewalEmail, { firstName: data.firstName, planName: data.planName, coins: data.coins, nextRenewal: data.nextRenewal }),
    },
    payment_failed: {
      subject:   'Action required: Your Cerebre Plus payment failed',
      component: React.createElement(PaymentFailedEmail, { firstName: data.firstName, planName: data.planName, retryUrl: data.retryUrl }),
    },
  }

  const tmpl = TEMPLATES[template]
  if (!tmpl) throw new Error(`Unknown email template: ${template}`)

  try {
    const result = await resend.emails.send({
      from:    FROM,
      to,
      subject: tmpl.subject,
      react:   tmpl.component,
    })
    return { success: true, id: result.data?.id }
  } catch (err: any) {
    console.error(`[email] Failed to send ${template} to ${to}:`, err)
    return { success: false, error: err.message }
  }
}
