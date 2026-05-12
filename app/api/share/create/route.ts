// ═══════════════════════════════════════════════════════════════
// /app/api/share/create/route.ts
// Creates a share token for a generation output.
// Returns the public URL + pre-filled WhatsApp share message.
// Tokens expire after 30 days.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { generationId } = await request.json() as { generationId: string }
  if (!generationId) return NextResponse.json({ error: 'generationId required' }, { status: 400 })

  // Verify ownership
  const { data: gen } = await supabase
    .from('generations')
    .select('id, tool_name, user_id')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single()

  if (!gen) return NextResponse.json({ error: 'Generation not found' }, { status: 404 })

  // Check if a share token already exists (idempotent)
  const { data: existing } = await supabase
    .from('share_tokens')
    .select('token')
    .eq('generation_id', generationId)
    .single()

  if (existing) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${existing.token}`
    return NextResponse.json({ token: existing.token, url, waMessage: buildWAMessage(url, gen.tool_name) })
  }

  // Create new token
  const token     = `cp_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

 const { error } = await supabase
  .from('share_tokens')
  .insert({
    token,
    generation_id: generationId,
    user_id: user.id,
    expires_at: expiresAt,
  } as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${token}`
  return NextResponse.json({
    token,
    url,
    waMessage: buildWAMessage(url, gen.tool_name),
    expiresAt,
  })
}

function buildWAMessage(url: string, toolName: string): string {
  return `Look what Cerebre Plus created for my business in 60 seconds with ${toolName} 👇\n\n${url}\n\nTry yours free at cerebreplus.com 🚀`
}

export const dynamic = 'force-dynamic'
