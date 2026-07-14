import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { INDUSTRY_LIST } from '@/lib/tools/industries'
import { getTool, TOOL_REGISTRY } from '@/lib/tools/registry'
import { getFieldSuggestions, type ProfileContext } from '@/lib/tools/form-suggestions'

// ⚠️ ONLY enable generateStaticParams below once Type A + B are confirmed healthy.
// Start with a curated subset — your TOP 15 industries × TOP 10 tools = 150 pages —
// not the full matrix, even at this stage.
const TOP_INDUSTRIES = ['hair_salon','restaurant_eatery','real_estate_agency','tailoring_bespoke','skincare_cosmetics' /* …add up to 15 */]
const TOP_TOOL_IDS   = ['whatsapp-campaign-builder','caption-craft','content-calendar' /* …add up to 10 */]

export function generateStaticParams() {
  const params: { industry: string; toolId: string }[] = []
  for (const indVal of TOP_INDUSTRIES) {
    for (const toolId of TOP_TOOL_IDS) {
      params.push({ industry: indVal.replace(/_/g, '-'), toolId })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: { industry: string; toolId: string } }): Promise<Metadata> {
  const ind  = INDUSTRY_LIST.find(i => i.value === params.industry.replace(/-/g, '_'))
  const tool = getTool(params.toolId)
  if (!ind || !tool) return {}
  return {
    title: `${tool.name} for ${ind.label} Businesses in Nigeria`,
    description: `${tool.name}, tuned for ${ind.label.toLowerCase()} businesses. ${tool.description}`,
    alternates: { canonical: `https://www.cerebreplus.com/solutions/${params.industry}/${params.toolId}` },
  }
}

export default function ComboPage({ params }: { params: { industry: string; toolId: string } }) {
  const ind  = INDUSTRY_LIST.find(i => i.value === params.industry.replace(/-/g, '_'))
  const tool = getTool(params.toolId)
  if (!ind || !tool) notFound()

  const profile: ProfileContext = { industry: ind.value, city: 'Lagos' }
  const audience = getFieldSuggestions('target_audience', '', profile)[0]
  const usp      = getFieldSuggestions('usp_differentiator', '', profile)[0]

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px', color: '#EBF2FC' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>{tool.icon} {tool.name} for {ind.label} Businesses in Nigeria</h1>
      <p style={{ fontSize: 16.5, lineHeight: 1.6, margin: '16px 0' }}>
        {tool.name} is built into Cerebre Plus specifically for {ind.label.toLowerCase()} businesses in
        Nigeria. {tool.description}
      </p>

      {audience && <p><b>Who this reaches:</b> {audience}</p>}
      {usp      && <p><b>Why it works for {ind.label.toLowerCase()} businesses:</b> {usp}</p>}

      <p style={{ marginTop: 30 }}>
        <Link href={`/tools/${tool.id}`} style={{ background: '#E09818', color: '#060C1A', padding: '14px 28px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
          Try {tool.name} free →
        </Link>
      </p>
    </main>
  )
}