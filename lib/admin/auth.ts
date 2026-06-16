// /lib/admin/auth.ts
// Admin session validation helpers. Used by every admin API route.
// All admin routes use the Supabase service-role client.

import { cookies }          from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import  type { AdminRole } from './permissions'


export interface AdminSession {
  adminId:   string
  userId:    string
  email:     string
  name:      string
  role:      AdminRole
  sessionId: string
  ipAddress: string | null
}

// ─────────────────────────────────────────────────────────────
// Validate admin session from cookie
// Returns null if session is missing, expired, or invalid.
// ─────────────────────────────────────────────────────────────
export async function getAdminSession(
  request: Request
): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get('cookie') || ''
  const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/)
  if (!sessionMatch) return null
  const sessionId = decodeURIComponent(sessionMatch[1])

  const admin = createAdminClient()

  const { data: session } = await admin
    .from('admin_sessions' as any)
    .select(`
      id, admin_id, ip_address, last_active_at, is_active,
      admin_profiles!inner(id, user_id, email, name, role, is_active)
    `)
    .eq('id', sessionId)
    .eq('is_active', true)
    .single()

  if (!session) return null

  const profile = (session as any).admin_profiles
  if (!profile?.is_active) return null

  // Check 2-hour inactivity timeout
  const lastActive = new Date(session.last_active_at)
  if (Date.now() - lastActive.getTime() > 2 * 60 * 60 * 1000) {
    await admin.from('admin_sessions' as any).update({ is_active: false, logged_out_at: new Date().toISOString() }).eq('id', sessionId)
    return null
  }

  // Extend session activity
  await admin.from('admin_sessions' as any).update({ last_active_at: new Date().toISOString() }).eq('id', sessionId)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
             || request.headers.get('x-real-ip')
             || null

  return {
    adminId:   profile.id,
    userId:    profile.user_id,
    email:     profile.email,
    name:      profile.name,
    role:      profile.role as AdminRole,
    sessionId,
    ipAddress: ip,
  }
}

// ─────────────────────────────────────────────────────────────
// Standard unauthorized response
// ─────────────────────────────────────────────────────────────
export function unauthorized(msg = 'Admin session required') {
  return new Response(JSON.stringify({ error: msg }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function forbidden(msg = 'Insufficient permissions') {
  return new Response(JSON.stringify({ error: msg }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─────────────────────────────────────────────────────────────
// Set the admin session cookie (called after login)
// ─────────────────────────────────────────────────────────────
export function setAdminSessionCookie(sessionId: string): string {
  const isProd = process.env.NODE_ENV === 'production'
  const maxAge = 60 * 60 * 2   // 2 hours
  return `admin_session=${encodeURIComponent(sessionId)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${isProd ? '; Secure' : ''}`
}

export function clearAdminSessionCookie(): string {
  return `admin_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
