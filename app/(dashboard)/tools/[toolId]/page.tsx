// /app/(dashboard)/tools/[toolId]/page.tsx
// Dynamic route for every one of the 40 tools.
// Looks up the tool definition, gates on auth + coins, renders ToolPage.
import { notFound, redirect } from 'next/navigation'
import type { Metadata }      from 'next'
import { getTool }            from '@/lib/tools/registry'
import { getServerUser }      from '@/lib/supabase/server'
import { getServerCoinBalance } from '@/lib/supabase/server'
import ToolPageClient         from './ToolPageClient'

interface Props {
  params: { toolId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool(params.toolId)
  if (!tool) return { title: 'Tool Not Found' }
  return {
    title:       `${tool.name} — Cerebre Plus`,
    description: tool.description,
  }
}

export default async function ToolPage({ params }: Props) {
  // Validate tool exists
  const tool = getTool(params.toolId)
  if (!tool) notFound()

  // Auth guard
  const user = await getServerUser()
  if (!user) redirect('/login')

  // Fetch coin balance server-side (no extra round-trip on client)
  const coinBalance = await getServerCoinBalance(user.id)

  return <ToolPageClient tool={tool} coinBalance={coinBalance?.balance ?? 0} />
}
