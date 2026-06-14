// /lib/competitor/scrapers.ts
// All external data-fetching wrappers for Enhanced mode.
// Each function is graceful-degrading — returns null on failure, never throws.

import type { CompetitorProfile } from './types'

// ─── Firecrawl — website crawling ────────────────────────────
export async function scrapeWebsite(url: string): Promise<{
  title?: string; description?: string; content: string; links: string[]
} | null> {
  const key = process.env.FIRECRAWL_API_KEY
  if (!key || !url) return null

  try {
    const res  = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        url,
        formats:        ['markdown'],
        onlyMainContent:true,
        timeout:        15000,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      title:       data.metadata?.title,
      description: data.metadata?.description,
      content:     (data.markdown || '').slice(0, 4000),  // cap at 4K chars
      links:       (data.links || []).slice(0, 20),
    }
  } catch { return null }
}

// ─── Apify — Instagram public profile ────────────────────────
export async function scrapeInstagram(handle: string): Promise<{
  followersCount: number | null
  postsCount:     number | null
  bio:            string
  recentPosts:    Array<{ caption: string; likes: number; type: string }>
  hashtags:       string[]
  postingFreq:    string
} | null> {
  const token = process.env.APIFY_API_TOKEN
  if (!token || !handle) return null

  const cleanHandle = handle.replace('@', '').trim()
  if (!cleanHandle) return null

  try {
    // Using Apify's Instagram Profile Scraper actor
    const runRes = await fetch(
      'https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?waitForFinish=60',
      {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          usernames:        [cleanHandle],
          resultsLimit:     12,
          scrapeStories:    false,
          scrapeHighlights: false,
        }),
      }
    )
    if (!runRes.ok) return null
    const run  = await runRes.json()
    const dsId = run.defaultDatasetId

    // Fetch results
    const dataRes  = await fetch(
      `https://api.apify.com/v2/datasets/${dsId}/items?token=${token}&limit=15`
    )
    const items: any[] = await dataRes.json()
    if (!items.length) return null

    const profile  = items[0]
    const posts    = (profile.latestPosts || items.slice(1)).slice(0, 12)
    const allTags  = posts.flatMap((p: any) => (p.caption || '').match(/#\w+/g) || [])
    const tagCount: Record<string,number> = {}
    allTags.forEach((t: string) => { tagCount[t] = (tagCount[t]||0)+1 })
    const topTags  = Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([t])=>t)

    // Estimate posting frequency
    const timestamps = posts.map((p: any) => p.timestamp).filter(Boolean)
    const avgDaysBetween = timestamps.length > 1
      ? Math.round((new Date(timestamps[0]).getTime() - new Date(timestamps[timestamps.length-1]).getTime()) / (86400_000 * (timestamps.length-1)))
      : 7
    const postingFreq = avgDaysBetween <= 1 ? 'Daily'
      : avgDaysBetween <= 3 ? `Every ${avgDaysBetween} days`
      : avgDaysBetween <= 7 ? 'Weekly'
      : 'Less than weekly'

    return {
      followersCount: profile.followersCount   || null,
      postsCount:     profile.postsCount        || null,
      bio:            (profile.biography        || '').slice(0, 400),
      recentPosts:    posts.slice(0,8).map((p: any) => ({
        caption: (p.caption || '').slice(0, 300),
        likes:    p.likesCount || 0,
        type:     p.type || 'Image',
      })),
      hashtags:    topTags,
      postingFreq,
    }
  } catch { return null }
}

// ─── Meta Ad Library — paid ads ──────────────────────────────
export async function scrapeMetaAds(searchTerm: string): Promise<{
  totalAds:     number
  activeAds:    Array<{ body: string; type: string; ctaType?: string }>
  formats:      string[]
  adMessage:    string  // synthesised description
} | null> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN
  if (!token) return null

  try {
    const url = new URL('https://graph.facebook.com/v21.0/ads_archive')
    url.searchParams.set('access_token',  token)
    url.searchParams.set('ad_reached_countries', '["NG"]')
    url.searchParams.set('search_terms',  searchTerm)
    url.searchParams.set('ad_active_status','ACTIVE')
    url.searchParams.set('limit',         '15')
    url.searchParams.set('fields',        'id,ad_creative_bodies,ad_creative_link_captions,page_name,publisher_platforms,estimated_audience_size,ad_snapshot_url')

    const res  = await fetch(url.toString())
    if (!res.ok) return null
    const data = await res.json()
    const ads: any[] = data.data || []

    if (!ads.length) return { totalAds:0, activeAds:[], formats:[], adMessage:'No active ads found in Meta Ad Library for this business.' }

    const formats = [...new Set(ads.flatMap((a: any) => a.publisher_platforms || []))]
    const activeAds = ads.slice(0,5).map((a: any) => ({
      body:    (a.ad_creative_bodies?.[0] || '').slice(0, 300),
      type:    (a.publisher_platforms?.[0] || 'feed'),
      ctaType: a.ad_creative_link_captions?.[0],
    }))

    return {
      totalAds:  ads.length,
      activeAds,
      formats:   formats as string[],
      adMessage: `Found ${ads.length} active ad${ads.length!==1?'s':''} running on ${formats.join(', ')}.`,
    }
  } catch { return null }
}

// ─── YouTube Data API ─────────────────────────────────────────
export async function scrapeYouTube(channelHandle: string): Promise<{
  subscriberCount: string | null
  videoCount:      number | null
  recentVideoTopics: string[]
  postingFreq:     string
} | null> {
  const key = process.env.YOUTUBE_DATA_API_KEY
  if (!key || !channelHandle) return null

  const clean = channelHandle.replace('@','').trim()
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${key}&q=${encodeURIComponent(clean)}&type=channel&part=snippet&maxResults=1`
    )
    const searchData = await searchRes.json()
    const channelId  = searchData.items?.[0]?.id?.channelId
    if (!channelId) return null

    const [channelRes, videosRes] = await Promise.all([
      fetch(`https://www.googleapis.com/youtube/v3/channels?key=${key}&id=${channelId}&part=statistics`),
      fetch(`https://www.googleapis.com/youtube/v3/search?key=${key}&channelId=${channelId}&order=date&type=video&part=snippet&maxResults=8`),
    ])

    const channelData = await channelRes.json()
    const videosData  = await videosRes.json()
    const stats       = channelData.items?.[0]?.statistics || {}
    const videos      = videosData.items || []

    return {
      subscriberCount: stats.subscriberCount ? Number(stats.subscriberCount).toLocaleString() : null,
      videoCount:      stats.videoCount ? parseInt(stats.videoCount) : null,
      recentVideoTopics: videos.slice(0,6).map((v: any) => v.snippet?.title || '').filter(Boolean),
      postingFreq:     videos.length >= 4 ? 'Regular (4+ videos found)' : 'Infrequent',
    }
  } catch { return null }
}

// ─── Gather all Enhanced data for one competitor ─────────────
export async function gatherCompetitorData(
  competitor: CompetitorProfile,
  modules:    string[],
): Promise<Record<string, any>> {
  const data: Record<string, any> = {}
  const needsInstagram = ['social_media_audit','content_strategy_decoder','brand_voice_positioning','audience_intelligence'].some(m => modules.includes(m))
  const needsWebsite   = ['website_content_audit','brand_voice_positioning'].some(m => modules.includes(m))
  const needsAds       = modules.includes('ad_intelligence')
  const needsYouTube   = modules.includes('content_strategy_decoder') && !!competitor.youtubeHandle

  const tasks: Promise<void>[] = []

  if (needsInstagram && competitor.instagramHandle) {
    tasks.push(scrapeInstagram(competitor.instagramHandle).then(d => { data.instagram = d }))
  }
  if (needsWebsite && competitor.websiteUrl) {
    tasks.push(scrapeWebsite(competitor.websiteUrl).then(d => { data.website = d }))
  }
  if (needsAds) {
    const searchTerm = competitor.instagramHandle?.replace('@','') || competitor.name
    tasks.push(scrapeMetaAds(searchTerm).then(d => { data.ads = d }))
  }
  if (needsYouTube) {
    tasks.push(scrapeYouTube(competitor.youtubeHandle!).then(d => { data.youtube = d }))
  }

  await Promise.allSettled(tasks)
  return data
}
