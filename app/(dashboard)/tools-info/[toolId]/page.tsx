import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TOOL_REGISTRY, getTool } from '@/lib/tools/registry'
import { INDUSTRY_LIST } from '@/lib/tools/industries'
import { getFieldSuggestions, type ProfileContext } from '@/lib/tools/form-suggestions'

export function generateStaticParams() {
  return TOOL_REGISTRY
    .filter(t => !(t as any).externalRoute)   // skip CI-module redirects
    .map(t => ({ toolId: t.id }))
}

export async function generateMetadata({ params }: { params: { toolId: string } }): Promise<Metadata> {
  const tool = getTool(params.toolId)
  if (!tool) return {}
  return {
    title: `${tool.name} — AI Tool for Nigerian Businesses (2026)`,
    description: `${tool.description} Built for Nigerian SMEs. Try free.`,
    alternates: { canonical: `https://www.cerebreplus.com/tools-info/${params.toolId}` },
  }
}

export default function ToolInfoPage({ params }: { params: { toolId: string } }) {
  const tool = getTool(params.toolId)
  if (!tool) notFound()

  // Pick 3 varied industries to show real, industry-specific example output —
  // this is what stops a tool page from reading like generic software copy.
  const sampleIndustries = [INDUSTRY_LIST[3], INDUSTRY_LIST[22], INDUSTRY_LIST[55]].filter(Boolean)

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px', color: '#EBF2FC' }}>
      <h1 style={{ fontSize: 30, fontWeight: 900 }}>{tool.icon} {tool.name} — AI Tool for Nigerian Businesses</h1>
      <p style={{ fontSize: 17, lineHeight: 1.6, margin: '16px 0' }}>
        {tool.description} Priced in naira, built for the way Nigerian businesses actually market —
        no agency, no delays, ready in seconds.
      </p>

      {/* Real per-industry output examples — pulled live, different every time this file runs */}
      <h2>How different businesses use {tool.name}</h2>
      {sampleIndustries.map(ind => {
        const profile: ProfileContext = { industry: ind.value, city: 'Lagos' }
        const example = getFieldSuggestions('target_audience', '', profile)[0]
        return example ? (
          <p key={ind.value}><b>{ind.label}:</b> {example}</p>
        ) : null
      })}

      <h2>Why Nigerian businesses use {tool.name}</h2>
      <ul>
        <li>Generates in seconds, tuned for Nigerian buyer psychology</li>
        <li>Priced in naira — no dollar-billed foreign SaaS subscription</li>
        <li>Works across {tool.laws.length ? tool.laws.length : 'multiple'} proven Nigerian marketing principles</li>
      </ul>

      <p style={{ marginTop: 30 }}>
        <Link href={`/tools/${tool.id}`} style={{ background: '#E09818', color: '#060C1A', padding: '14px 28px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
          Try {tool.name} free →
        </Link>
      </p>
    </main>
  )
}