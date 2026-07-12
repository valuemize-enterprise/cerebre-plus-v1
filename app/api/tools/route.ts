// /app/api/tools/generate-logo/route.ts
// Logo Generator — uses Claude to write SVG code for a real vector logo.
// Outputs: icon.svg, wordmark.svg, combination.svg + PNG at 32/512/1500px

import { NextRequest, NextResponse } from 'next/server'
import Anthropic                     from '@anthropic-ai/sdk'
import { createServerClient }        from '@/lib/supabase/server'
import { getBrandProfile, snapshotBrand } from '@/lib/design/brand-dna'
import { getDesignCoinCost }         from '@/lib/tools/design-registry'
import { svgToPngSizes }             from '@/lib/design/image-processor'
import { logoSVGPrompt }             from '@/lib/design/prompt-templates'

// ── R2 upload ─────────────────────────────────────────────────
async function uploadToR2(content: Buffer | string, fileName: string, contentType: string): Promise<string> {
  const R2_ACCOUNT = process.env.R2_ACCOUNT_ID!
  const R2_BUCKET  = process.env.R2_BUCKET_NAME!
  const R2_TOKEN   = process.env.R2_API_TOKEN!
  const R2_PUBLIC  = process.env.R2_PUBLIC_URL!

  // fetch in this environment expects BodyInit (string | ArrayBuffer | Uint8Array | etc.)
  // Ensure body is a type accepted by fetch.
  const bodyData: string | ArrayBuffer | Uint8Array = typeof content === 'string'
    ? content
    : Buffer.isBuffer(content)
      ? new Uint8Array(content)
      : content

  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT}/r2/buckets/${R2_BUCKET}/objects/${fileName}`,
    { method: 'PUT', headers: { Authorization: `Bearer ${R2_TOKEN}`, 'Content-Type': contentType }, body: bodyData }
  )
  return `${R2_PUBLIC}/${fileName}`
}

// ── Parse SVG blocks from Claude response ─────────────────────
function parseSVGBlocks(text: string): { icon: string; wordmark: string; combination: string } {
  const extract = (comment: string): string => {
    const re  = new RegExp(`<!--\\s*${comment}\\s*-->\\s*(<svg[\\s\\S]*?</svg>)`, 'i')
    const m   = text.match(re)
    if (m) return m[1].trim()
    // Fallback: extract any SVG block in order
    const all = text.match(/<svg[\s\S]*?<\/svg>/gi) || []
    const idx = comment === 'ICON MARK' ? 0 : comment === 'WORDMARK' ? 1 : 2
    return all[idx] || ''
  }

  return {
    icon:        extract('ICON MARK'),
    wordmark:    extract('WORDMARK'),
    combination: extract('COMBINATION MARK'),
  }
}

// ── Main handler ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { formData, engine = 'standard' } = body as {
      formData: Record<string, string>
      engine:   'standard' | 'premium'
    }

    // ── Check coins ───────────────────────────────────────────
    const coinCost = getDesignCoinCost('logo-generator', engine)
    const { data: balance } = await supabase.from('coin_balances').select('balance').eq('user_id', user.id).single()
    if (!balance || balance.balance < coinCost) {
      return NextResponse.json({ error: 'Insufficient coins', required: coinCost }, { status: 402 })
    }

    // ── Get brand profile ─────────────────────────────────────
    const brand  = await getBrandProfile(user.id)
    const client = new Anthropic()

    // ── Ask Claude to generate SVG code ───────────────────────
    const prompt = logoSVGPrompt(formData, brand)
    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 4000,
      messages:   [{ role: 'user', content: prompt }],
    })

    const claudeText = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('\n')

    // ── Parse three SVG blocks ────────────────────────────────
    const svgs = parseSVGBlocks(claudeText)

    if (!svgs.icon && !svgs.wordmark) {
      return NextResponse.json({ error: 'Claude did not generate valid SVG output. Please try again.' }, { status: 500 })
    }

    // ── Upload SVG files to R2 ────────────────────────────────
    const ts     = Date.now()
    const prefix = `logos/${user.id}/${ts}`
    const urls: Record<string, string> = {}

    if (svgs.icon)        urls.icon_svg        = await uploadToR2(svgs.icon,        `${prefix}_icon.svg`,        'image/svg+xml')
    if (svgs.wordmark)    urls.wordmark_svg    = await uploadToR2(svgs.wordmark,    `${prefix}_wordmark.svg`,    'image/svg+xml')
    if (svgs.combination) urls.combination_svg = await uploadToR2(svgs.combination, `${prefix}_combination.svg`, 'image/svg+xml')

    // ── Convert combination (or icon) to PNG at 3 sizes ───────
    const svgForPng = svgs.combination || svgs.icon
    if (svgForPng) {
      const { png32, png512, png1500 } = await svgToPngSizes(svgForPng)
      urls.png_32   = await uploadToR2(png32,   `${prefix}_32.png`,   'image/png')
      urls.png_512  = await uploadToR2(png512,  `${prefix}_512.png`,  'image/png')
      urls.png_1500 = await uploadToR2(png1500, `${prefix}_1500.png`, 'image/png')
    }

    // ── Deduct coins ──────────────────────────────────────────
    await supabase.rpc('deduct_design_coins' as any, {
      p_user_id: user.id, p_amount: coinCost, p_tool_id: 'logo-generator', p_engine: engine,
    })

    // ── Save to history ───────────────────────────────────────
    const imageUrls = Object.values(urls).filter(u => u.endsWith('.png'))
    await supabase.from('design_generations' as any).insert({
      user_id:        user.id,
      tool_id:        'logo-generator',
      tool_name:      'Logo Generator',
      format:         'logo',
      engine,
      image_urls:     imageUrls,
      svg_content:    svgs.combination || svgs.icon,
      coins_spent:    coinCost,
      prompt_summary: formData.business_name,
      brand_snapshot: snapshotBrand(brand),
    })

    return NextResponse.json({
      urls,
      svgs: { icon: !!svgs.icon, wordmark: !!svgs.wordmark, combination: !!svgs.combination },
      coinCost,
      engine,
      note: 'All SVG files are true vector format — scalable to any size.',
    })

  } catch (err: any) {
    console.error('[generate-logo]', err)
    return NextResponse.json({ error: err.message || 'Logo generation failed' }, { status: 500 })
  }
}

export const dynamic     = 'force-dynamic'
export const maxDuration = 60
