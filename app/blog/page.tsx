import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS } from '@/lib/blog/posts'

// ═══════════════════════════════════════════════════════════════
// /app/blog/page.tsx — Blog index
// Magazine-style: 1 featured hero + responsive card grid.
// Fully static (SSG), zero client JS needed for SEO-critical content.
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: 'Marketing Blog for Nigerian & African Businesses',
  description:
    'Practical marketing guides for Nigerian businesses: WhatsApp marketing, Instagram captions that sell, salary-week timing, real naira costs, and zero-budget growth strategies.',
  alternates: { canonical: 'https://app.cerebre.plus/blog' },
  openGraph: {
    title: 'Cerebre Plus Blog — Marketing Guides for African Businesses',
    description: 'Practical, no-fluff marketing guides written for how Nigerians actually buy.',
    url: 'https://app.cerebre.plus/blog',
    type: 'website',
  },
}

const C = {
  deep: '#060C1A', navy: '#0B1F3A', card: '#0D2040',
  gold: '#E09818', gl: '#F5B830', teal: '#12D4B4',
  w: '#EBF2FC', dim: 'rgba(205,217,236,.75)', muted: 'rgba(205,217,236,.45)',
  bdr: 'rgba(255,255,255,.09)',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogIndexPage() {
  const [featured, ...rest] = BLOG_POSTS

  // Blog + ItemList schema for the index page
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Cerebre Plus Blog',
    description: 'Marketing guides for Nigerian and African businesses.',
    url: 'https://app.cerebre.plus/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Cerebre Plus',
      logo: { '@type': 'ImageObject', url: 'https://app.cerebre.plus/icon-192.png' },
    },
    blogPost: BLOG_POSTS.map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://app.cerebre.plus/blog/${p.slug}`,
      datePublished: p.publishedAt,
      image: `https://app.cerebre.plus${p.image}`,
    })),
  }

  return (
    <main style={{ background: C.deep, minHeight: '100vh', color: C.w }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{
        background: `linear-gradient(160deg, ${C.navy}, ${C.deep})`,
        borderBottom: `1px solid ${C.bdr}`, padding: '56px 20px 48px', textAlign: 'center',
      }}>
        <p style={{
          display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '2.5px',
          textTransform: 'uppercase', color: C.gl, background: 'rgba(224,152,24,.1)',
          border: '1px solid rgba(224,152,24,.3)', padding: '6px 16px', borderRadius: 20, marginBottom: 18,
        }}>
          The Cerebre Plus Blog
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, lineHeight: 1.15, maxWidth: 760, margin: '0 auto 14px' }}>
          Marketing That Works for <span style={{ color: C.gold }}>African Businesses</span>
        </h1>
        <p style={{ fontSize: 16, color: C.dim, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          No fluff. No foreign playbooks. Practical guides written for how Nigerians actually buy — WhatsApp-first, trust-driven, and priced in naira.
        </p>
      </header>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* ── Featured post ──────────────────────────────────── */}
        <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <article style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 0, background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20,
            overflow: 'hidden', marginBottom: 48, cursor: 'pointer',
          }}>
            <div style={{ position: 'relative', minHeight: 280 }}>
              <Image
                src={featured.image} alt={featured.imageAlt} fill priority
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <span style={{
                position: 'absolute', top: 16, left: 16, fontSize: 11, fontWeight: 800,
                letterSpacing: '1px', textTransform: 'uppercase', color: '#060C1A',
                background: C.gl, padding: '5px 12px', borderRadius: 16,
              }}>
                ★ Featured
              </span>
            </div>
            <div style={{ padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: featured.categoryColor, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>
                {featured.category}
              </span>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 27px)', fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: 14.5, color: C.dim, lineHeight: 1.65, marginBottom: 18 }}>
                {featured.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: C.muted }}>
                <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                <span>·</span>
                <span>{featured.readMinutes} min read</span>
              </div>
            </div>
          </article>
        </Link>

        {/* ── Grid of remaining posts ────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: 24,
        }}>
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{
                background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 16,
                overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'transform .2s, border-color .2s',
              }}>
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                  <Image
                    src={post.image} alt={post.imageAlt} fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: post.categoryColor, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>
                    {post.category}
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.35, marginBottom: 10, flex: 1 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.6, marginBottom: 14 }}>
                    {post.excerpt.slice(0, 110)}…
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.muted, borderTop: `1px solid ${C.bdr}`, paddingTop: 12 }}>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <span>·</span>
                    <span>{post.readMinutes} min read</span>
                    <span style={{ marginLeft: 'auto', color: C.teal, fontWeight: 700 }}>Read →</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────── */}
        <div style={{
          marginTop: 56, padding: 'clamp(28px, 5vw, 44px)', borderRadius: 20, textAlign: 'center',
          background: `linear-gradient(135deg, rgba(224,152,24,.12), rgba(18,212,180,.08))`,
          border: '1px solid rgba(224,152,24,.25)',
        }}>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 900, marginBottom: 10 }}>
            Stop reading about marketing. Start generating it.
          </h2>
          <p style={{ fontSize: 15, color: C.dim, maxWidth: 480, margin: '0 auto 22px', lineHeight: 1.6 }}>
            Every strategy on this blog is built into Cerebre Plus — 40+ AI tools that create your captions, campaigns and calendars in seconds. In naira. Starting free.
          </p>
          <Link href="/signup" style={{
            display: 'inline-block', background: C.gold, color: C.deep, padding: '14px 34px',
            borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: 'none',
          }}>
            Try Cerebre Plus Free →
          </Link>
        </div>
      </div>
    </main>
  )
}
