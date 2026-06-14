// /middleware.ts  — place at project root, same level as app/
// Protects /cerebre-admin/* and /api/admin/* routes.

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin pages (except login) ─────────────────────────────
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
  }

  // ── Admin API routes (except the auth endpoint itself) ──────
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
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/cerebre-admin/:path*', '/api/admin/:path*'],
}
