// app/robots.ts — Next.js generates /robots.txt automatically from this
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.cerebreplus.com'
  return {
    rules: [
      {
        // Everyone — including Googlebot — can crawl public pages
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/cerebre-admin', '/onboarding', '/settings', '/billing'],
      },
      {
        // Explicitly welcome AI crawlers — this is how you get cited in ChatGPT/Gemini/Perplexity
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bingbot'],
        allow: '/',
        disallow: ['/dashboard', '/api/', '/cerebre-admin'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}