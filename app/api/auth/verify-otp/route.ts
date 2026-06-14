// /app/api/auth/verify-otp/route.ts
// Checks the submitted 6-digit code against the stored OTP.
// On success: marks the user's email as verified and allows app access.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { createServerClient }        from '@/lib/supabase/server'
import { sendWelcomeEmail }          from '@/lib/email/sender'

export async function POST(request: NextRequest) {
  const admin    = createAdminClient()
  const supabase = await createServerClient()

  const body = await request.json()
  const { email, code } = body

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const normalizedCode  = code.trim()

  // ── Find latest OTP for this email ───────────────────────
  const { data: otp } = await admin
    .from('email_otps' as any)
    .select('*')
    .eq('email', normalizedEmail)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!otp) {
    return NextResponse.json({
      error: 'Code expired or not found. Please request a new code.',
      expired: true,
    }, { status: 400 })
  }

  // ── Max attempts guard ───────────────────────────────────
  if (otp.attempts >= 5) {
    await admin.from('email_otps' as any).update({ verified: false }).eq('id', otp.id)
    return NextResponse.json({
      error: 'Too many incorrect attempts. Please request a new code.',
      maxAttempts: true,
    }, { status: 400 })
  }

  // ── Check code ────────────────────────────────────────────
  if (otp.code !== normalizedCode) {
    await admin.from('email_otps' as any).update({ attempts: otp.attempts + 1 }).eq('id', otp.id)
    const remaining = 5 - (otp.attempts + 1)
    return NextResponse.json({
      error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      attemptsRemaining: remaining,
    }, { status: 400 })
  }

  // ── Mark OTP as verified ──────────────────────────────────
  await admin.from('email_otps' as any).update({ verified: true }).eq('id', otp.id)

  // ── Mark user's profile as email verified ─────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await admin.from('profiles')
      .update({ email_verified_at: new Date().toISOString() } as any)
      .eq('id', user.id)
  }

  // ── Also mark in Supabase Auth user metadata ──────────────
  if (user) {
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, email_verified: true },
      email_confirm: true,  // marks email as confirmed in Supabase
    })
    // Send welcome email (async, non-blocking)
    const { data: profile } = await admin.from('profiles').select('coin_balances(balance)').eq('id', user.id).single()
    const balance = (profile as any)?.coin_balances?.balance ?? 50
    sendWelcomeEmail(user.id, balance).catch(() => {})
  }

  return NextResponse.json({ success: true, verified: true })
}

export const dynamic = 'force-dynamic'
