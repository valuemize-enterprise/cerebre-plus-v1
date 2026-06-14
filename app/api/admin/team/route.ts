// /app/api/admin/team/route.ts
// Admin team management — list, invite, update role.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'
import { logAction, A }              from '@/lib/admin/audit'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'view_admin_team')) return forbidden()

  const admin = createAdminClient()
  const { data: team, error } = await (admin as any)
    .from('admin_profiles')
    .select('id, email, name, role, is_active, last_login, created_at')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ team: team ?? [] })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'manage_admin_team')) return forbidden()

  const { userId, role } = await request.json()
  if (!userId || !role) {
    return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
  }

  const validRoles = ['super_admin', 'admin', 'support', 'analyst']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await (admin as any).from('admin_profiles').update({ role }).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAction(session, A.CHANGE_ADMIN_ROLE, 'admin', userId, { newRole: role })

  return NextResponse.json({ ok: true, message: `Role updated to ${role}` })
}

export const dynamic = 'force-dynamic'
