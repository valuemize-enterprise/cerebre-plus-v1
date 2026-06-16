// /app/api/admin/auth/route.ts
// GET  — validate current admin session (used by layout on mount)
// POST — admin login
// DELETE — admin logout

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/admin/auth'
import { logAction, A }              from '@/lib/admin/audit'

const RATE_LIMIT: Map<string, { count: number; first: number }> = new Map()
const MAX_ATTEMPTS = 5
const WINDOW_MS    = 30 * 60 * 1000  // 30 minutes

function isRateLimited(ip: string): boolean {
  const now    = Date.now()
  const record = RATE_LIMIT.get(ip)
  if (!record || (now - record.first) > WINDOW_MS) {
    RATE_LIMIT.set(ip, { count: 1, first: now }); return false
  }
  record.count++
  return record.count > MAX_ATTEMPTS
}

// ── GET — session check ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  return NextResponse.json({ adminId: session.adminId, email: session.email, name: session.name, role: session.role })
}

// ── POST — login ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many login attempts. Try again in 30 minutes.' }, { status: 429 })
  }

  const { email, password } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const admin   = createAdminClient()

  // 1. Sign in via Supabase Auth
  const { data: authData, error: authError } = await admin.auth.signInWithPassword({ email, password })
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  // 2. Check admin_profiles
  const { data: profile } = await admin
    .from('admin_profiles' as any)
    .select('id, email, name, role, is_active')
    .eq('user_id', authData.user.id)
    .single() as any

  if (!profile) return NextResponse.json({ error: 'Not an admin account. Contact your super admin.' }, { status: 403 })
  if (!profile.is_active) return NextResponse.json({ error: 'This admin account has been deactivated.' }, { status: 403 })

  // 3. Create session
  const ua = request.headers.get('user-agent') || null
  const { data: session } = await admin
    .from('admin_sessions' as any)
    .insert({ admin_id: profile.id, ip_address: ip, user_agent: ua })
    .select('id')
    .single()

  if (!session) return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })

  // 4. Update last_login
  await admin.from('admin_profiles' as any).update({ last_login: new Date().toISOString() }).eq('id', profile.id)

  // 5. Audit log
  await logAction({ adminId: profile.id, email: profile.email, name: profile.name, role: profile.role, sessionId: session.id, ipAddress: ip, userId: authData.user.id }, A.LOGIN, 'session', session.id, { ip })

  const response = NextResponse.json({ ok: true, name: profile.name, role: profile.role })
  response.headers.set('Set-Cookie', setAdminSessionCookie(session.id))
  return response
}

// ── DELETE — logout ────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const session = await getAdminSession(request)
  if (session) {
    const admin = createAdminClient()
    await admin.from('admin_sessions' as any).update({ is_active: false, logged_out_at: new Date().toISOString() }).eq('id', session.sessionId)
    await logAction(session, A.LOGOUT, 'session', session.sessionId, {})
  }
  const response = NextResponse.json({ ok: true })
  response.headers.set('Set-Cookie', clearAdminSessionCookie())
  return response
}

export const dynamic = 'force-dynamic'
