import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS, getPost, getAllSlugs, getRelatedPosts, type ContentBlock } from '@/lib/blog/posts'

// ═══════════════════════════════════════════════════════════════
// /app/blog/[slug]/page.tsx — Article page
// SEO stack: BlogPosting + FAQPage + BreadcrumbList schema,
// semantic HTML5 (article/header/time/figure), next/image with alt,
// canonical, OG + Twitter cards, answer-first content structure.
// ═══════════════════════════════════════════════════════════════

const C = {
  deep: '#060C1A', navy: '#0B1F3A', card: '#0D2040',
  gold: '#E09818', gl: '#F5B830', teal: '#12D4B4',
  w: '#EBF2FC', dim: 'rgba(205,217,236,.8)', muted: 'rgba(205,217,236,.45)',
  bdr: 'rgba(255,255,255,.09)',
}

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug)
  if (!post) return {}
  const url = `https://app.cerebre.plus/blog/${post.slug}`
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article', url, title: post.metaTitle, description: post.metaDescription,
      publishedTime: post.publishedAt, modifiedTime: post.updatedAt,
      images: [{ url: `https://app.cerebre.plus${post.image}`, width: 1200, height: 630, alt: post.imageAlt }],
      siteName: 'Cerebre Plus',
    },
    twitter: {
      card: 'summary_large_image', title: post.metaTitle,
      description: post.metaDescription, images: [`https://app.cerebre.plus${post.image}`],
    },
  }
}

// ── Content block renderer ─────────────────────────────────────
function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'p':
      return <p style={{ fontSize: 16.5, lineHeight: 1.85, color: C.dim, marginBottom: 20 }}>{block.text}</p>

    case 'h2':
      return <h2 style={{ fontSize: 'clamp(20px, 3vw, 25px)', fontWeight: 800, color: C.w, margin: '36px 0 14px', lineHeight: 1.3 }}>{block.text}</h2>

    case 'h3':
      return <h3 style={{ fontSize: 18, fontWeight: 700, color: C.gl, margin: '26px 0 10px' }}>{block.text}</h3>

    case 'ul':
      return (
        <ul style={{ margin: '0 0 20px 4px', listStyle: 'none' }}>
          {block.items?.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 15.5, lineHeight: 1.7, color: C.dim }}>
              <span style={{ color: C.teal, fontWeight: 900, flexShrink: 0 }}>—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol style={{ margin: '0 0 20px 0', listStyle: 'none', counterReset: 'step' }}>
          {block.items?.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, fontSize: 15.5, lineHeight: 1.7, color: C.dim }}>
              <span style={{
                width: 26, height: 26, borderRadius: 8, background: 'rgba(224,152,24,.15)',
                border: '1px solid rgba(224,152,24,.35)', color: C.gl, fontWeight: 800, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
              }}>{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )

    case 'quote':
      return (
        <blockquote style={{
          margin: '24px 0', padding: '18px 22px', background: 'rgba(18,212,180,.06)',
          borderLeft: `4px solid ${C.teal}`, borderRadius: '0 12px 12px 0',
          fontSize: 15.5, lineHeight: 1.75, color: C.w, fontStyle: 'italic',
        }}>
          {block.text}
        </blockquote>
      )

    case 'table':
      return (
        <div style={{ overflowX: 'auto', margin: '20px 0', borderRadius: 12, border: `1px solid ${C.bdr}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 480 }}>
            <thead>
              <tr>
                {block.rows?.[0]?.map((cell, i) => (
                  <th key={i} style={{ background: 'rgba(224,152,24,.12)', color: C.gl, padding: '12px 14px', textAlign: 'left', fontWeight: 700, borderBottom: `1px solid ${C.bdr}` }}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows?.slice(1).map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={{ padding: '11px 14px', color: c === 0 ? C.w : C.dim, fontWeight: c === 0 ? 600 : 400, borderBottom: `1px solid ${C.bdr}` }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'cta':
      return (
        <div style={{
          margin: '36px 0 12px', padding: 'clamp(22px, 4vw, 32px)', borderRadius: 16, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(224,152,24,.13), rgba(18,212,180,.08))',
          border: '1px solid rgba(224,152,24,.3)',
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.w, marginBottom: 18, lineHeight: 1.6 }}>{block.text}</p>
          <Link href={block.ctaHref || '/signup'} style={{
            display: 'inline-block', background: C.gold, color: C.deep, padding: '13px 30px',
            borderRadius: 11, fontWeight: 800, fontSize: 14.5, textDecoration: 'none',
          }}>
            {block.ctaLabel || 'Try Cerebre Plus Free'} →
          </Link>
        </div>
      )

    default:
      return null
  }
}

// ── Page ───────────────────────────────────────────────────────
export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const url = `https://app.cerebre.plus/blog/${post.slug}`
  const related = getRelatedPosts(post.slug, 3)

  // Full schema stack: BlogPosting + FAQPage + BreadcrumbList
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.metaDescription,
        image: `https://app.cerebre.plus${post.image}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        wordCount: post.content.reduce((n, b) => n + (b.text?.split(' ').length || 0) + (b.items?.join(' ').split(' ').length || 0), 0),
        author: { '@type': 'Organization', name: post.author, url: 'https://app.cerebre.plus' },
        publisher: {
          '@type': 'Organization', name: 'Cerebre Plus',
          logo: { '@type': 'ImageObject', url: 'https://app.cerebre.plus/icon-192.png' },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: 'en-NG',
        keywords: post.keywords.join(', '),
      },
      {
        '@type': 'FAQPage',
        mainEntity: post.faq.map(f => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://app.cerebre.plus' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://app.cerebre.plus/blog' },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return (
    <main style={{ background: C.deep, minHeight: '100vh', color: C.w }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <article>
        {/* ── Article header ──────────────────────────────────── */}
        <header style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 0' }}>
          {/* Breadcrumb (visible) */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
            <Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/blog" style={{ color: C.teal, textDecoration: 'none' }}>Blog</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: C.dim }}>{post.category}</span>
          </nav>

          <span style={{ fontSize: 12, fontWeight: 800, color: post.categoryColor, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            {post.category}
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 38px)', fontWeight: 900, lineHeight: 1.2, margin: '12px 0 18px' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 13.5, color: C.muted, marginBottom: 28 }}>
            <span style={{
              width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#E09818,#F5B830)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: C.deep, fontSize: 14,
            }}>C</span>
            <span style={{ color: C.w, fontWeight: 600 }}>{post.author}</span>
            <span>·</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            <span>·</span>
            <span>{post.readMinutes} min read</span>
          </div>
        </header>

        {/* ── Hero image ──────────────────────────────────────── */}
        <figure style={{ maxWidth: 900, margin: '0 auto 36px', padding: '0 20px' }}>
          <div style={{ position: 'relative', aspectRatio: '1200/630', borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.bdr}` }}>
            <Image
              src={post.image} alt={post.imageAlt} fill priority
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 940px) 100vw, 900px"
            />
          </div>
        </figure>

        {/* ── Body ────────────────────────────────────────────── */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
          {post.content.map((block, i) => <Block key={i} block={block} />)}

          {/* ── FAQ section (visible + matches schema) ────────── */}
          <section style={{ marginTop: 44 }}>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 25px)', fontWeight: 800, marginBottom: 18 }}>
              Frequently Asked Questions
            </h2>
            {post.faq.map((f, i) => (
              <details key={i} style={{
                background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12,
                padding: '16px 18px', marginBottom: 10, cursor: 'pointer',
              }}>
                <summary style={{ fontSize: 15.5, fontWeight: 700, color: C.w, lineHeight: 1.5 }}>
                  {f.q}
                </summary>
                <p style={{ fontSize: 14.5, color: C.dim, lineHeight: 1.7, marginTop: 12 }}>{f.a}</p>
              </details>
            ))}
          </section>

          {/* ── Share row ───────────────────────────────────────── */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
            margin: '36px 0', paddingTop: 24, borderTop: `1px solid ${C.bdr}`,
          }}>
            <span style={{ fontSize: 13.5, color: C.muted, fontWeight: 600 }}>Share this guide:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + url)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ background: 'rgba(37,211,102,.12)', border: '1px solid rgba(37,211,102,.35)', color: '#25D366', padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${C.bdr}`, color: C.w, padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
            >
              X (Twitter)
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.35)', color: '#60A5FA', padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
            >
              Facebook
            </a>
          </div>
        </div>

        {/* ── Related posts ─────────────────────────────────────── */}
        <aside style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 20px 70px' }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 20 }}>Keep reading</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20 }}>
            {related.map(r => (
              <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 14, overflow: 'hidden', height: '100%' }}>
                  <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                    <Image src={r.image} alt={r.imageAlt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, 33vw" />
                  </div>
                  <div style={{ padding: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: r.categoryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{r.category}</span>
                    <h3 style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.4, margin: '8px 0' }}>{r.title}</h3>
                    <span style={{ fontSize: 12.5, color: C.teal, fontWeight: 700 }}>Read →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </aside>
      </article>
    </main>
  )
}
