// /app/api/club/leaderboard/route.ts
// Returns the top 20 members by points + the current user's position.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = createAdminClient()

  // Aggregate points per user and join with profiles
  const { data: board } = await admin
    .from('club_member_totals' as any)
    .select('user_id, total_points, actions_count, rank')
    .order('total_points', { ascending: false })
    .limit(20)

  if (!board?.length) {
    return NextResponse.json({ leaderboard: [], myPosition: null })
  }

  // Enrich with profile data
  const userIds = board.map((b: any) => b.user_id)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, business_name, industry')
    .in('id', userIds)

  const profileMap: Record<string, any> = {}
  profiles?.forEach((p: any) => { profileMap[p.id] = p })

  const leaderboard = board.map((b: any, index: number) => {
    const profile = profileMap[b.user_id] ?? {}
    return {
      position:     index + 1,
      userId:       b.user_id,
      isMe:         b.user_id === user.id,
      name:         profile.business_name || profile.full_name || 'Club Member',
      industry:     profile.industry,
      totalPoints:  b.total_points,
      actionsCount: b.actions_count,
      rank:         b.rank,
    }
  })

  const myPosition = leaderboard.find(l => l.isMe) ?? null

  return NextResponse.json({ leaderboard, myPosition })
}

export const dynamic = 'force-dynamic'
