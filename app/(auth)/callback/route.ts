// ═══════════════════════════════════════════════════════════════
// /app/(auth)/callback/route.ts — Supabase OAuth Callback
// Handles: Google OAuth redirect, email verification links,
//          password reset links, magic link sign-ins.
// ═══════════════════════════════════════════════════════════════
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import React from 'react'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code          = searchParams.get('code')
  const redirect      = searchParams.get('redirect') ?? '/dashboard'
  const next          = searchParams.get('next')
  const finalRedirect = next ?? redirect

  if (code) {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // ✅ Upsert profile — prevents profile_missing loop
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id:    user.id,
          email:      user.email,
          full_name:  user.user_metadata?.full_name  ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (profileError) {
        console.error('[auth/callback] Profile upsert error:', profileError.message)
        // Don't block login over a profile error — still redirect
      }

      const destination = finalRedirect.startsWith('/')
        ? `${origin}${finalRedirect}`
        : finalRedirect

      return NextResponse.redirect(destination, { status: 303 })
    }

    console.error('[auth/callback] Code exchange error:', error?.message)
  }

  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'auth_failed')
  return NextResponse.redirect(errorUrl, { status: 303 })
}

