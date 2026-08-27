// ═══════════════════════════════════════════════════════════════
// /middleware.ts  — Cerebre Plus Edge Middleware
// Runs on EVERY request (excluding static assets).
//
// Responsibilities:
//   1. Refresh Supabase auth tokens on every request (CRITICAL)
//      Without this, access tokens expire silently → random logouts.
//   2. Protect /cerebre-admin/* and /api/admin/* (cookie-based)
//
// Route protection for /dashboard, /tools, /billing, etc. is
// handled in each layout's Server Component (app/(dashboard)/layout.tsx),
// which uses getServerUser() and redirects if unauthenticated.
// This is the correct Supabase SSR pattern — the layout runs after
// middleware has already refreshed the session cookies.
//
// NOTE: app/middleware.ts is dead code — Next.js only reads
// middleware.ts at the project root (this file). See that file
// for historical context.
// ═══════════════════════════════════════════════════════════════

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Admin page protection (cookie-based, no Supabase needed) ──
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
    // Valid admin session — pass through (no Supabase needed for admin)
    return NextResponse.next()
  }

  // ── 2. Admin API protection (cookie-based) ────────────────────
  if (
    pathname.startsWith('/api/admin') &&
    pathname !== '/api/admin/auth'
  ) {
    const cookie = request.cookies.get('admin_session')
    if (!cookie?.value) {
      return NextResponse.json(
        { error: 'Admin session required' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // ── 3. All other routes: refresh Supabase session ─────────────
  // This keeps access tokens fresh so getServerUser() in layouts
  // always sees a valid, non-expired token.
  // The actual Set-Cookie headers are written into supabaseResponse.
  const { supabaseResponse } = await updateSession(request)
  return supabaseResponse
}

// ─────────────────────────────────────────────────────────────
// MATCHER — run on every path except Next.js internals and
// static files that never need auth (images, fonts, sw.js, etc.)
// ─────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (compiled JS/CSS bundles)
     *  - _next/image   (image optimisation endpoint)
     *  - Static files: .png .svg .jpg .ico .woff2 etc.
     *
     * This intentionally INCLUDES /api/* so that API route handlers
     * benefit from refreshed session cookies in their request context.
     */
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
