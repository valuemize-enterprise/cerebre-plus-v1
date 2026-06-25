// /app/api/admin/sme-club/members/route.ts
// POST — add or remove a user from SME Club

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'
import { getAdminSession, unauthorized, forbidden } from '@/lib/admin/auth'
import { hasPermission }             from '@/lib/admin/permissions'
import { logAction, A }              from '@/lib/admin/audit'

export async function POST(request: NextRequest) {
  const session = await getAdminSession(request)
  if (!session) return unauthorized()
  if (!hasPermission(session.role, 'manage_sme_club')) return forbidden()

  const admin = createAdminClient()
  const { user_id, action } = await request.json()

  if (!user_id) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  if (action === 'add') {
    await admin.from('profiles' as any).update({ sme_club_override: true }).eq('id', user_id)
    await logAction(session, A.ADD_SME_CLUB, 'user', user_id, {})
    return NextResponse.json({ message: 'Added to SME Club' })
  }

  if (action === 'remove') {
    await admin.from('profiles' as any).update({ sme_club_override: false }).eq('id', user_id)
    await logAction(session, A.REMOVE_SME_CLUB, 'user', user_id, {})
    return NextResponse.json({ message: 'Removed from SME Club' })
  }

  return NextResponse.json({ error: 'Invalid action. Use "add" or "remove".' }, { status: 400 })
}

export const dynamic = 'force-dynamic'
