// ═══════════════════════════════════════════════════════════════
// /app/admin/page.tsx
// Cerebre Plus admin panel.
// Protected by CEREBRE_ADMIN_EMAILS env var.
// Full stats, user management, generation logs, waitlist.
// ═══════════════════════════════════════════════════════════════

import { redirect }           from 'next/navigation'
import { createServerClient, getServerUser } from '@/lib/supabase/server'
import AdminClient            from './AdminClient'

const ADMIN_EMAILS = (process.env.CEREBRE_ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase())

export const dynamic    = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    redirect('/dashboard')
  }

  const supabase = await createServerClient()
  const now      = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalUsers },
    { count: generationsToday },
    { count: generationsWeek },
    { count: generationsMonth },
    { data: subscriptionStats },
    { data: topTools },
    { data: waitlistCount },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
    supabase.from('generations').select('id', { count: 'exact', head: true }).gte('created_at', todayStart).eq('status', 'completed'),
    supabase.from('generations').select('user_id', { count: 'exact', head: true }).gte('created_at', weekStart).eq('status', 'completed'),
    supabase.from('generations').select('user_id', { count: 'exact', head: true }).gte('created_at', monthStart).eq('status', 'completed'),
    supabase.from('subscriptions').select('plan_tier').eq('status', 'active'),
    supabase.from('generations').select('tool_name').gte('created_at', weekStart).eq('status', 'completed').limit(1000),
    supabase.from('waitlist').select('user_id', { count: 'exact', head: true }),
    supabase.from('profiles').select('user_id, business_name, city, industry, created_at, profile_completeness_score').order('created_at', { ascending: false }).limit(20),
  ])

  // Plan distribution
  const planCounts: Record<string, number> = {}
  ;(subscriptionStats || []).forEach((s) => {
    planCounts[s.plan_tier] = (planCounts[s.plan_tier] || 0) + 1
  })

  // Top tools this week
  const toolCounts: Record<string, number> = {}
  ;(topTools || []).forEach((g) => {
    toolCounts[g.tool_name] = (toolCounts[g.tool_name] || 0) + 1
  })
  const topToolsList = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return (
    <AdminClient
      stats={{
        totalUsers:        totalUsers   || 0,
        waitlistCount:     (waitlistCount as any)?.count || 0,
        generationsToday:  generationsToday  || 0,
        generationsWeek:   generationsWeek   || 0,
        generationsMonth:  generationsMonth  || 0,
        planCounts,
        topTools: topToolsList,
      }}
      recentUsers={recentUsers || []}
    />
  )
}
