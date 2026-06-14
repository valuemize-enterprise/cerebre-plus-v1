// /app/api/auth/send-otp/route.ts
// Generate a 6-digit OTP, store it with 10-minute expiry, send via Resend.
// Called immediately after form submission on the signup page.

import { NextRequest, NextResponse } from 'next/server'
import { Resend }                    from 'resend'
import { createAdminClient }         from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = process.env.RESEND_FROM_EMAIL ?? '<hello@cerebreplus.com>'
const APP_URL= process.env.NEXT_PUBLIC_APP_URL ?? 'https://cerebreplus.com'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function otpEmailHTML(code: string, name: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080F1F;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td style="background:#0B1F3A;border-radius:16px 16px 0 0;padding:24px 36px 18px;">
    <span style="font-family:Georgia,serif;font-size:20px;font-weight:900;color:#EBF2FC;letter-spacing:2px;">CEREBRE</span>
    <span style="font-family:Georgia,serif;font-size:20px;font-weight:900;color:#F5B830;letter-spacing:2px;"> PLUS</span>
  </td></tr>
  <tr><td style="background:#0D2040;padding:36px;">
    <p style="margin:0 0 8px;font-size:22px;font-weight:700;font-family:Georgia,serif;color:#EBF2FC;">
      ${name ? `Hi ${name.split(' ')[0]}, v` : 'V'}erify your email
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#8FA5BE;line-height:1.6;">
      Enter this code in the Cerebre Plus app to confirm your email address.
      The code expires in <strong style="color:#EBF2FC;">10 minutes</strong>.
    </p>
    <!-- Big OTP code -->
    <div style="text-align:center;margin:0 0 28px;">
      <div style="display:inline-block;padding:20px 40px;background:#132845;border-radius:16px;border:2px solid #E0981840;">
        <span style="font-family:'Courier New',monospace;font-size:42px;font-weight:900;color:#F5B830;letter-spacing:10px;">${code}</span>
      </div>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#6B84A0;text-align:center;">
      Didn't request this? You can safely ignore this email.
    </p>
    <p style="margin:0;font-size:13px;color:#6B84A0;text-align:center;">
      Code not arriving?
      <a href="${APP_URL}/verify?resend=1" style="color:#12D4B4;text-decoration:none;">Click here to resend</a>
    </p>
  </td></tr>
  <tr><td style="background:#0B1F3A;border-radius:0 0 16px 16px;padding:16px 36px;">
    <p style="margin:0;font-size:11px;color:#6B84A0;text-align:center;">
      Cerebre Plus · Cerebre Media Africa · Lagos, Nigeria
    </p>
  </td></tr>
</table></td></tr></table>
</body></html>`
}

export async function POST(request: NextRequest) {
  const admin = createAdminClient()

  const body = await request.json()
  const { email, name = '' } = body
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // ── Rate limit: max 3 OTPs per email per hour ─────────────
  const { data: countData } = await admin.rpc('otp_sends_in_last_hour ' as any, { p_email: normalizedEmail })
  if ((countData ?? 0) >= 3) {
    return NextResponse.json({
      error: 'Too many codes sent. Please wait an hour before requesting another.',
      retryAfter: 3600,
    }, { status: 429 })
  }

  // ── Generate OTP ─────────────────────────────────────────
  const code     = generateOTP()
  const expiresAt= new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // ── Store in DB ───────────────────────────────────────────
  const { error: storeErr } = await admin.from('email_otps' as any).insert({
    email:      normalizedEmail,
    code,
    expires_at: expiresAt,
  })
  if (storeErr) {
    return NextResponse.json({ error: 'Failed to generate code. Please try again.' }, { status: 500 })
  }

  // ── Send via Resend ───────────────────────────────────────
  const { error: sendErr } = await resend.emails.send({
    from: "Cerebre Plus <noreply@cerebreplus.com>", 
    to:      [normalizedEmail],
    subject: `${code} — Your Cerebre Plus verification code`,
    html:    otpEmailHTML(code, name),
  })

  console.log('sendErr', sendErr)

  if (sendErr) {
    console.error('[send-otp] Resend error:', sendErr)
    return NextResponse.json({ error: 'Failed to send code. Please check your email address.' }, { status: 500 })
  }

  return NextResponse.json({
    success:   true,
    expiresIn: 600,  // seconds
    maskedEmail: normalizedEmail.replace(/(.{2}).+(@.+)/, '$1***$2'),
  })
}

export const dynamic = 'force-dynamic'
