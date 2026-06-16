// /app/api/admin/team/route.ts
// GET  — list all admin users with session and activity stats
// POST — invite admin | change role | deactivate | reactivate

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'

import { logAction, A }              from '@/lib/admin/audit'
import { hasPermission } from '@/lib/admin/permissions'

const VALID_ROLES = ['super_admin','admin','content_manager','support','analyst']

// ── GET — team list ───────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'view_admin_team')) return forbidden()

  const admin  = createAdminClient()
  const d30    = new Date(Date.now() - 30 * 86400_000).toISOString()

  const [admins, activityCounts] = await Promise.all([
    admin
      .from('admin_profiles' as any)
      .select('id, user_id, email, name, role, is_active, invited_by, last_login, created_at, permissions')
      .order('created_at', { ascending: true }),

    // Count audit log entries per admin in last 30 days
    admin
      .from('admin_audit_log' as any)
      .select('admin_id')
      .gte('created_at', d30),
  ])

  const activityMap: Record<string, number> = {}
  ;(activityCounts.data ?? []).forEach((r: any) => {
    activityMap[r.admin_id] = (activityMap[r.admin_id] || 0) + 1
  })

  // Enrich invited_by name
  const adminList = admins.data ?? []
  const idToName  = Object.fromEntries(adminList.map(a => [a.id, a.name]))

  const team = adminList.map(a => ({
    id:             a.id,
    email:          a.email,
    name:           a.name,
    role:           a.role,
    is_active:      a.is_active,
    last_login:     a.last_login,
    created_at:     a.created_at,
    actions_30d:    activityMap[a.id] || 0,
    invited_by_name: a.invited_by ? (idToName[a.invited_by] || 'Unknown') : 'System',
    is_self:        a.id === session.adminId,
  }))

  return NextResponse.json({ team, total: team.length })
}

// ── POST — team management actions ───────────────────────────
export async function POST(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'manage_admin_team')) return forbidden()

  const admin  = createAdminClient()
  const body   = await request.json()
  const action = body.action as string

  switch (action) {

    case 'invite': {
      const { email, name, role } = body
      if (!email || !name || !role) return NextResponse.json({ error: 'email, name, and role are required' }, { status: 400 })
      if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      if (role === 'super_admin' && session.role !== 'super_admin') return forbidden('Only super admins can create other super admins')

      // Find auth.users entry
      const { data: users, error: listError } = await admin.auth.admin.listUsers()
      if (listError) return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 })
      const authUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim())
      if (!authUser) {
        return NextResponse.json({ error: `No account found for ${email}. Ask them to sign up at cerebreplus.com first.` }, { status: 404 })
      }

      // Check not already an admin
      const { data: existing } = await admin.from('admin_profiles' as any).select('id').eq('email', email).single()
      if (existing) return NextResponse.json({ error: `${email} is already an admin` }, { status: 409 })

      const { data: newAdmin, error: createErr } = await admin
        .from('admin_profiles' as any)
        .insert({ user_id: authUser.id, email: email.toLowerCase().trim(), name: name.trim(), role, invited_by: session.adminId })
        .select('id')
        .single()

      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })

      await logAction(session, A.ADD_ADMIN, 'admin_profiles', newAdmin.id, { email, role })
      return NextResponse.json({ message: `${email} added as ${role}. They can now log in at /cerebre-admin/login.` })
    }

    case 'change_role': {
      const { admin_id, role } = body
      if (!admin_id || !role) return NextResponse.json({ error: 'admin_id and role required' }, { status: 400 })
      if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      if (admin_id === session.adminId) return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 })
      if (role === 'super_admin' && session.role !== 'super_admin') return forbidden('Only super admins can grant super_admin role')

      const { data: target } = await admin.from('admin_profiles' as any).select('role,email').eq('id', admin_id).single()
      if (!target) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

      await admin.from('admin_profiles' as any).update({ role, updated_at: new Date().toISOString() }).eq('id', admin_id)
      await logAction(session, A.CHANGE_ADMIN_ROLE, 'admin_profiles', admin_id, { from: target.role, to: role, email: target.email })
      return NextResponse.json({ message: `Role updated to ${role}` })
    }

    case 'deactivate': {
      const { admin_id } = body
      if (!admin_id) return NextResponse.json({ error: 'admin_id required' }, { status: 400 })
      if (admin_id === session.adminId) return NextResponse.json({ error: 'You cannot deactivate yourself' }, { status: 400 })

      // Deactivate profile and close all sessions
      await admin.from('admin_profiles' as any).update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', admin_id)
      await admin.from('admin_sessions' as any).update({ is_active: false, logged_out_at: new Date().toISOString() }).eq('admin_id', admin_id).eq('is_active', true)

      const { data: target } = await admin.from('admin_profiles' as any).select('email').eq('id', admin_id).single()
      await logAction(session, A.REMOVE_ADMIN, 'admin_profiles', admin_id, { email: target?.email })
      return NextResponse.json({ message: 'Admin deactivated — they can no longer log in' })
    }

    case 'reactivate': {
      const { admin_id } = body
      if (!admin_id) return NextResponse.json({ error: 'admin_id required' }, { status: 400 })
      await admin.from('admin_profiles' as any).update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', admin_id)
      const { data: target } = await admin.from('admin_profiles' as any).select('email').eq('id', admin_id).single()
      await logAction(session, A.ADD_ADMIN, 'admin_profiles', admin_id, { email: target?.email, action: 'reactivate' })
      return NextResponse.json({ message: 'Admin reactivated' })
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }
}

export const dynamic = 'force-dynamic'
