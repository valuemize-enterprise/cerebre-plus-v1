// /app/api/competitor/discover/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { discoverCompetitors }       from '@/lib/competitor/discovery'
import { createHash }                from 'crypto'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { industry, city, businessName, description, manualCompetitors = [] } = body

  if (!industry || !city) {
    return NextResponse.json({ error: 'industry and city are required' }, { status: 400 })
  }

  // Check cache first (24-hour freshness)
  const cacheKey = createHash('md5')
    .update(`${industry.toLowerCase()}-${city.toLowerCase()}-${manualCompetitors.join(',')}`)
    .digest('hex')

  const { data: cached } = await supabase
    .from('competitor_discovery_cache' as any)
    .select('suggestions, expires_at')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (cached?.suggestions && !manualCompetitors.length) {
    return NextResponse.json({ competitors: cached.suggestions, fromCache: true })
  }

  // Run discovery
  const competitors = await discoverCompetitors({
    industry, city, businessName, description, manualCompetitors,
  })

  // Cache result
  await supabase.from('competitor_discovery_cache' as any).upsert({
    cache_key:  cacheKey,
    suggestions:competitors,
    expires_at: new Date(Date.now() + 86400_000).toISOString(),
  })

  return NextResponse.json({ competitors, fromCache: false })
}

export const dynamic    = 'force-dynamic'
export const maxDuration = 30
