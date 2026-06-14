// /lib/email/sender.ts
// Central send function. Every outbound email goes through here.
// Handles: deduplication, preference checks, Resend API call, DB logging.

import { Resend }           from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import * as T               from '@/lib/email/templates'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = process.env.RESEND_FROM_EMAIL ?? 'hello@cerebreplus.com'

// ── Send any email ────────────────────────────────────────────
async function sendEmail(params: {
  to:         string
  subject:    string
  html:       string
  emailType:  string
  userId?:    string
  metadata?:  Record<string, unknown>
  skipDedup?: boolean   // set true for transactional (plan upgrade, referral)
  dedupHours?:number
}): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()

  // ── Deduplication check ──────────────────────────────────
  if (!params.skipDedup && params.userId) {
    const { data: alreadySent } = await admin.rpc('was_email_sent_recently' as any, {
      p_user_id: params.userId,
      p_type:    params.emailType,
      p_hours:   params.dedupHours ?? 168,
    })
    if (alreadySent) {
      return { success: true } // already sent recently — silently skip
    }
  }

  // ── Send via Resend ──────────────────────────────────────
  let resendId: string | undefined
  try {
    const { data, error } = await resend.emails.send({
      from:    `Cerebre Plus <${FROM}>`,
      to:      [params.to],
      subject: params.subject,
      html:    params.html,
    })
    if (error) throw new Error(error.message)
    resendId = data?.id
  } catch (err: any) {
    // Log failure
    try {
      await admin.from('email_notifications_log' as any).insert({
        user_id:       params.userId ?? null,
        email_address: params.to,
        email_type:    params.emailType,
        subject:       params.subject,
        status:        'failed',
        metadata:      params.metadata ?? {},
      })
    } catch {
      // ignore logging failure
    }
    return { success: false, error: err.message }
  }

  // ── Log success ──────────────────────────────────────────
  try {
    await admin.from('email_notifications_log' as any).insert({
      user_id:       params.userId ?? null,
      email_address: params.to,
      email_type:    params.emailType,
      subject:       params.subject,
      status:        'sent',
      resend_id:     resendId,
      metadata:      params.metadata ?? {},
    })
  } catch {
    // ignore logging failure
  }

  return { success: true }
}

// ── Check notification preference ─────────────────────────────
async function prefEnabled(userId: string, prefKey: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('notification_preferences' as any)
    .select(prefKey)
    .eq('user_id', userId)
    .single()
  // If no row → default to true (user hasn't opted out yet)
  return data ? (data as any)[prefKey] !== false : true
}

// ── Get user email ─────────────────────────────────────────────
async function getUserEmail(userId: string): Promise<{ email: string; name: string } | null> {
  const admin = createAdminClient()
  const { data } = await admin.auth.admin.getUserById(userId)
  if (!data?.user?.email) return null
  const { data: profile } = await admin.from('profiles').select('business_name').eq('id', userId).single()
  return {
    email: data.user.email,
    name:  profile?.business_name ?? data.user.email.split('@')[0],
  }
}


// ══════════════════════════════════════════════════════════════
// PUBLIC SEND FUNCTIONS — one per email type
// ══════════════════════════════════════════════════════════════

export async function sendWelcomeEmail(userId: string, coins = 50) {
  const user = await getUserEmail(userId)
  if (!user) return
  const { subject, html } = T.welcomeEmail({ name: user.name, coins })
  return sendEmail({ to: user.email, subject, html, emailType: 'welcome', userId, skipDedup: true })
}

export async function sendWeeklyDigest(userId: string, stats: {
  weekEnding:    string
  toolsUsed:     number
  outputsCreated:number
  coinsSpent:    number
  coinsRemaining:number
  topTool:       string | null
  upcomingSmeSession: { title: string; date: string } | null
  suggestedTool: { name: string; description: string; href: string } | null
}) {
  if (!(await prefEnabled(userId, 'weekly_digest'))) return
  const user = await getUserEmail(userId)
  if (!user) return
  const { subject, html } = T.weeklyDigestEmail({ name: user.name, ...stats })
  return sendEmail({ to: user.email, subject, html, emailType: 'weekly_digest', userId, dedupHours: 144 })
}

export async function sendCoinAlert(userId: string, balance: number, planTier: string) {
  if (!(await prefEnabled(userId, 'coin_alerts'))) return
  const user = await getUserEmail(userId)
  if (!user) return
  const { subject, html } = T.coinAlertEmail({ name: user.name, balance, planTier })
  return sendEmail({ to: user.email, subject, html, emailType: 'coin_alert', userId, dedupHours: 72 })
}

export async function sendSmeNewSession(userId: string, session: {
  number: number; title: string; description: string; category: string; duration: number; isFreePreview: boolean
}) {
  if (!(await prefEnabled(userId, 'sme_new_sessions'))) return
  const user = await getUserEmail(userId)
  if (!user) return
  const { subject, html } = T.smeNewSessionEmail({ name: user.name, session })
  return sendEmail({ to: user.email, subject, html, emailType: 'sme_new_session', userId,
    metadata: { session_number: session.number }, dedupHours: 12 })
}

export async function sendCompetitorCompleteEmail(userId: string, params: {
  sessionId: string; competitors: string[]; modulesCount: number; coinsSpent: number
}) {
  const user = await getUserEmail(userId)
  if (!user) return
  const { subject, html } = T.competitorCompleteEmail({ name: user.name, ...params })
  return sendEmail({ to: user.email, subject, html, emailType: 'competitor_complete', userId, skipDedup: true })
}

export async function sendPlanUpgradeEmail(userId: string, params: {
  plan: string; coins: number; amount: string
}) {
  const user = await getUserEmail(userId)
  if (!user) return
  const { subject, html } = T.planUpgradeEmail({ name: user.name, ...params })
  return sendEmail({ to: user.email, subject, html, emailType: 'plan_upgrade', userId, skipDedup: true })
}

export async function sendReferralRewardEmail(userId: string, params: {
  referredName: string; coinsEarned: number; totalBalance: number
}) {
  const user = await getUserEmail(userId)
  if (!user) return
  const { subject, html } = T.referralRewardEmail({ name: user.name, ...params })
  return sendEmail({ to: user.email, subject, html, emailType: 'referral_reward', userId, skipDedup: true })
}
