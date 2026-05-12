// ═══════════════════════════════════════════════════════════════
// /app/shared/[shareToken]/page.tsx
// Public read-only view of a shared generation.
// This page IS the growth loop — every share is an ad.
// No auth required to view. "Create yours →" CTA everywhere.
// ═══════════════════════════════════════════════════════════════

import { Suspense }              from 'react'
import { notFound }              from 'next/navigation'
import type { Metadata }         from 'next'
import { createServerClient }    from '@/lib/supabase/server'
import SharedViewClient          from './SharedViewClient'

interface Props {
  params: { shareToken: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'See what AI created in 60 seconds — Cerebre Plus',
    description: 'A Nigerian business owner just used Cerebre Plus to create this marketing content. Create yours free.',
    openGraph: {
      title: 'Created in 60 seconds with Cerebre Plus 🚀',
      description: 'Africa\'s premier AI marketing platform for Nigerian business owners.',
      siteName: 'Cerebre Plus',
    },
  }
}

export default async function SharedPage({ params }: Props) {
  const supabase = await createServerClient()

  const { data: shareToken } = await supabase
    .from('share_tokens')
    .select(`
      token, expires_at,
      generations (
        id, tool_id, tool_name, output, created_at,
        profiles (
          business_name, industry, city, logo_url, brand_colour
        )
      )
    `)
    .eq('token', params.shareToken)
    .single()

  if (!shareToken) notFound()

  // Check expiry
  if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
    notFound()
  }

  const gen     = shareToken.generations as any
  const profile = gen?.profiles as any

  return (
    <SharedViewClient
      generation={{
        id:       gen.id,
        toolId:   gen.tool_id,
        toolName: gen.tool_name,
        output:   gen.output,
        createdAt: gen.created_at,
      }}
      business={{
        name:       profile?.business_name || 'A Nigerian Business',
        industry:   profile?.industry      || '',
        city:       profile?.city          || 'Nigeria',
        logoUrl:    profile?.logo_url      || null,
        brandColour: profile?.brand_colour || '#E09818',
      }}
    />
  )
}
