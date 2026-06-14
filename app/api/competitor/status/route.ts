// /app/api/competitor/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('competitor_sessions' as any)
    .select('id,status,progress_pct,current_task,modules_completed,module_results,coins_spent,completed_at,error_message')
    .eq('id', sessionId).eq('user_id', user.id).single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ session: data })
}

export const dynamic = 'force-dynamic'
