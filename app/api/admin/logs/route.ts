// /app/api/admin/logs/route.ts
// Immutable audit log — filtered, paginated.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'view_audit_log')) return forbidden()

  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const action   = searchParams.get('action')
  const adminId  = searchParams.get('admin_id')
  const page     = parseInt(searchParams.get('page') || '1', 10)
  const perPage  = Math.min(parseInt(searchParams.get('per_page') || '50', 10), 100)

  let query = (admin as any)
    .from('admin_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  if (action) query = query.eq('action', action)
  if (adminId) query = query.eq('admin_id', adminId)

  const { data: logs, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    logs: logs ?? [],
    total: count ?? 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  })
}

export const dynamic = 'force-dynamic'
