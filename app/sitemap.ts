// app/sitemap.ts — auto-generates /sitemap.xml
// Includes: static pages + blog articles + industry pages + tool pages.
// Adding a post to lib/blog/posts.ts automatically adds it here.
import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog/posts'
import { INDUSTRY_LIST } from '@/lib/tools/industries'
import { TOOL_REGISTRY } from '@/lib/tools/registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://app.cerebre.plus'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ]

  // Blog articles — high priority, they're the freshest content
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map(p => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  // Programmatic industry pages (once deployed)
  const industryPages: MetadataRoute.Sitemap = INDUSTRY_LIST.map(ind => ({
    url: `${base}/solutions/${ind.value.replace(/_/g, '-')}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Tool info pages (once deployed)
  const toolPages: MetadataRoute.Sitemap = TOOL_REGISTRY
    .filter(t => !(t as any).externalRoute)
    .map(t => ({
      url: `${base}/tools-info/${t.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...staticPages, ...blogPages, ...industryPages, ...toolPages]
}
