// ═══════════════════════════════════════════════════════════════
// /middleware.ts  — Cerebre Plus Edge Middleware
// FIX: MIDDLEWARE_INVOCATION_TIMEOUT
//   - Public pages (login, signup, club, etc.) skip the Supabase
//     call entirely — they don't need session refresh.
//   - All other routes wrap updateSession in try/catch so a slow
//     Supabase never produces a 504 — it falls back to NextResponse.next().
// ═══════════════════════════════════════════════════════════════

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ── Routes that never need a Supabase session refresh ──────────
// These are public pages: the user is not logged in, or the page
// doesn't touch server auth at all. Calling updateSession on them
// adds 200-800 ms of cold Supabase latency for zero benefit.
const SKIP_SESSION_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/club',          // public marketing page
  '/waitlist',
  '/demo',
  '/pricing',
  '/privacy',
  '/terms',
  '/(auth)/',       // catch-all for any (auth) group pages
]

function shouldSkipSession(pathname: string): boolean {
  return SKIP_SESSION_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Admin page protection (no Supabase needed) ────────────
  if (
    pathname.startsWith('/cerebre-admin') &&
    !pathname.startsWith('/cerebre-admin/login')
  ) {
    const cookie = request.cookies.get('admin_session')
    if (!cookie?.value) {
      const loginUrl = new URL('/cerebre-admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ── 2. Admin API protection (no Supabase needed) ─────────────
  if (
    pathname.startsWith('/api/admin') &&
    pathname !== '/api/admin/auth'
  ) {
    const cookie = request.cookies.get('admin_session')
    if (!cookie?.value) {
      return NextResponse.json({ error: 'Admin session required' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // ── 3. Public pages — skip Supabase entirely ─────────────────
  // No session to refresh, no auth needed. Just pass through.
  if (shouldSkipSession(pathname)) {
    return NextResponse.next()
  }

  // ── 4. All other routes — refresh Supabase session ───────────
  // Wrap in try/catch: if Supabase is slow or unreachable, the
  // site keeps working instead of throwing a 504.
  try {
    const { supabaseResponse } = await updateSession(request)
    return supabaseResponse
  } catch (err) {
    // Supabase timed out or errored — degrade gracefully.
    // The layout's getServerUser() will redirect to /login if needed.
    console.error('[middleware] updateSession failed:', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}