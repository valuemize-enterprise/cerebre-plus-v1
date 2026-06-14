// /app/api/tools/design-history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit  = Math.min(parseInt(searchParams.get('limit')  || '20'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')
  const toolId = searchParams.get('tool_id')

  let query = supabase
    .from('design_generations' as any)
    .select('id, tool_id, tool_name, format, engine, image_urls, coins_spent, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (toolId) query = query.eq('tool_id', toolId)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ designs: data, total: count, limit, offset })
}

export const dynamic = 'force-dynamic'
