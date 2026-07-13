// app/sitemap.ts — auto-generates /sitemap.xml including every programmatic page
import type { MetadataRoute } from 'next'
import { INDUSTRY_LIST } from '@/lib/tools/industries'
import { TOOL_REGISTRY } from '@/lib/tools/registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.cerebreplus.com'
  const now = new Date()

  // 1. Static high-value pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ]

  // 2. One SEO page per industry: /solutions/[industry]
  const industryPages: MetadataRoute.Sitemap = INDUSTRY_LIST.map(ind => ({
    url: `${base}/solutions/${ind.value.replace(/_/g, '-')}`,
    lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8,
  }))

  // 3. One SEO page per tool: /tools-info/[toolId]
  const toolPages: MetadataRoute.Sitemap = TOOL_REGISTRY
    .filter(t => !(t as any).externalRoute)
    .map(t => ({
      url: `${base}/tools-info/${t.id}`,
      lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7,
    }))

  return [...staticPages, ...industryPages, ...toolPages]
}