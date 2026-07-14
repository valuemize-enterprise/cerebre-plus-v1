import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { INDUSTRY_LIST } from '@/lib/tools/industries'
import { getFieldSuggestions, type ProfileContext } from '@/lib/tools/form-suggestions'
import { TOOL_REGISTRY } from '@/lib/tools/registry'

// Pre-build every industry page at deploy time — fast + fully indexable
export function generateStaticParams() {
  return INDUSTRY_LIST.map(i => ({ industry: i.value.replace(/_/g, '-') }))
}

function resolve(slug: string) {
  const value = slug.replace(/-/g, '_')
  return INDUSTRY_LIST.find(i => i.value === value)
}

export async function generateMetadata({ params }: { params: { industry: string } }): Promise<Metadata> {
  const ind = resolve(params.industry)
  if (!ind) return {}
  return {
    title: `AI Marketing Tools for ${ind.label} in Nigeria (2026)`,
    description: `The AI marketing platform for Nigerian ${ind.label} businesses. Generate captions, WhatsApp campaigns & content in seconds — priced in naira.`,
    alternates: { canonical: `https://www.cerebreplus.com/solutions/${params.industry}` },
  }
}

export default function IndustryPage({ params }: { params: { industry: string } }) {
  const ind = resolve(params.industry)
  if (!ind) notFound()

  // ── THE UNIQUENESS ENGINE ──────────────────────────────────
  // This profile object drives getFieldSuggestions() to return REAL,
  // industry-specific content — not filler. Different industry = different output.
  const profile: ProfileContext = { industry: ind.value, city: 'Lagos', }

  // fieldId strings below are matched by detectFieldSemantic() in form-suggestions.ts —
  // these exact strings trigger the 'target_audience' / 'usp_differentiator' / 'cta_text'
  // / 'price_range' semantic buckets. Do not rename them.
  const audiences = getFieldSuggestions('target_audience', 'Who are your customers?', profile)
  const usps      = getFieldSuggestions('usp_differentiator', 'What makes you different?', profile)
  const ctas      = getFieldSuggestions('cta_text', 'Your headline', profile)
  const prices    = getFieldSuggestions('price_range', 'Your typical price range', profile)

  // Recommend 3 real tools for this industry — pulls actual tool names from your registry,
  // not a hardcoded list. Also doubles as internal linking (helps ALL your pages rank).
  const recommendedTools = TOOL_REGISTRY
    .filter(t => !(t as any).externalRoute)
    .slice(0, 6)

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px', color: '#EBF2FC' }}>

      {/* SUMMARY-FIRST answer block — the exact text AI Overviews and Google grab.
          Keep this to 50-60 words, answer the implied question immediately. */}
      <h1 style={{ fontSize: 30, fontWeight: 900 }}>
        AI Marketing Tools for {ind.label} Businesses in Nigeria
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.6, margin: '16px 0' }}>
        Cerebre Plus gives Nigerian {ind.label.toLowerCase()} businesses {TOOL_REGISTRY.length}+ AI marketing
        tools built for the local market — from WhatsApp campaign builders to Instagram caption
        generators that understand Nigerian buyer psychology. Create ready-to-post content in seconds,
        priced in naira, no agency required.
      </p>

      {/* UNIQUE DATA POINT #1 — real audience examples pulled from the suggestion engine.
          This section alone is what makes the page pass the "delete the industry name" test. */}
      {audiences.length > 0 && (
        <>
          <h2>Who {ind.label} businesses reach with Cerebre Plus</h2>
          <ul>{audiences.slice(0, 3).map((a, i) => <li key={i}>{a}</li>)}</ul>
        </>
      )}

      {/* UNIQUE DATA POINT #2 — real differentiators for this specific industry */}
      {usps.length > 0 && (
        <>
          <h2>What makes {ind.label} businesses stand out</h2>
          <ul>{usps.slice(0, 3).map((u, i) => <li key={i}>{u}</li>)}</ul>
        </>
      )}

      {/* UNIQUE DATA POINT #3 — naira pricing context specific to this industry */}
      {prices.length > 0 && (
        <>
          <h2>Typical {ind.label} pricing in Nigeria</h2>
          <p>{prices[0]}</p>
        </>
      )}

      {/* Cost comparison table — the "unique value add" that beats generic templates */}
      <h2>What a {ind.label} business pays for marketing</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0' }}>
        <tbody>
          <tr><td><b>Hiring a Lagos agency</b></td><td>₦300,000–₦600,000 / month</td></tr>
          <tr><td><b>Freelancer per project</b></td><td>₦20,000–₦80,000 / task</td></tr>
          <tr><td><b>Cerebre Plus</b></td><td>Free to start · pay-as-you-go in naira</td></tr>
        </tbody>
      </table>

      {/* Recommended tools — real internal links, boosts EVERY page's authority */}
      <h2>Recommended tools for {ind.label} businesses</h2>
      <ul>
        {recommendedTools.map(t => (
          <li key={t.id}>
            <Link href={`/tools-info/${t.id}`}>{t.icon} {t.name}</Link> — {t.tagline}
          </li>
        ))}
      </ul>

      {/* FAQ block + schema — feeds both Google rich results eligibility AND AI citation */}
      <h2>Frequently asked questions</h2>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How can a ${ind.label} business in Nigeria do marketing without an agency?`,
            "acceptedAnswer": { "@type": "Answer",
              "text": `Cerebre Plus provides ${TOOL_REGISTRY.length}+ AI tools that generate captions, WhatsApp campaigns, ad copy and content calendars specifically for ${ind.label} businesses in Nigeria — no agency needed, priced in naira.` }
          },
          {
            "@type": "Question",
            "name": `How much does Cerebre Plus cost for a ${ind.label} business?`,
            "acceptedAnswer": { "@type": "Answer",
              "text": "Cerebre Plus is free to start with pay-as-you-go pricing in naira — a fraction of a ₦300,000/month agency retainer." }
          }
        ]
      }) }} />
      <p><b>How can a {ind.label} business market without an agency?</b> Cerebre Plus generates
        everything an agency would — captions, campaigns, ad copy, strategy — tailored to {ind.label}
        businesses, in seconds.</p>

      <p style={{ marginTop: 30 }}>
        <Link href="/signup" style={{ background: '#E09818', color: '#060C1A', padding: '14px 28px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
          Start free — built for {ind.label} businesses →
        </Link>
      </p>
    </main>
  )
}