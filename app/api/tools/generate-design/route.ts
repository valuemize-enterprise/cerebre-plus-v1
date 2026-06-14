// /app/api/tools/generate-design/route.ts
// Design generation endpoint — handles both PREVIEW (free, no coins) and SAVE (deducts coins).
//
// Request body:
//   { toolId, formData, engine, format, preview: boolean }
//
// When preview=true:
//   - Generates at quality:low for speed
//   - Returns { previewDataUrl } — a base64 data URL shown client-side
//   - No coins deducted, no R2 upload, no history record
//
// When preview=false (default):
//   - Generates at quality:medium (standard) or high (premium)
//   - Uploads to R2, deducts coins, saves to design_generations
//   - Returns { imageUrls, coinCost, engine, generationId, brandApplied }

import { NextRequest, NextResponse }    from 'next/server'
import { createServerClient }           from '@/lib/supabase/server'
import { getBrandProfile, buildBrandInjection, snapshotBrand } from '@/lib/design/brand-dna'
import { generateImage }                from '@/lib/design/engines'
import { processDesignImage }           from '@/lib/design/image-processor'
import { getDesignTool, getDesignCoinCost } from '@/lib/tools/design-registry'
import type { DesignFormat }            from '@/lib/tools/design-registry'
import {
  socialPostPrompt, storyReelPrompt, youtubeThumbnailPrompt,
  quoteCardPrompt, promoCardPrompt, linkedinBannerPrompt,
  emailHeaderPrompt, flyerPrompt, festiveBannerPrompt, carouselSlidePrompt,
} from '@/lib/design/prompt-templates'

// ── R2 upload helper ──────────────────────────────────────────
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region:   'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function uploadToR2(buffer: Buffer, fileName: string): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket:      process.env.R2_BUCKET_NAME!,
    Key:         fileName,
    Body:        buffer,
    ContentType: 'image/png',
  }))

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`
}

// ── Coin deduction with fallback ──────────────────────────────
// Tries the RPC first; falls back to direct table update if the RPC doesn't exist.
async function deductCoins(
  supabase: any,
  userId:   string,
  amount:   number,
  toolId:   string,
  engine:   string,
  currentBalance: number
): Promise<void> {
  const { error: rpcErr } = await supabase.rpc('deduct_design_coins', {
    p_user_id: userId,
    p_amount:  amount,
    p_tool_id: toolId,
    p_engine:  engine,
  })

  if (rpcErr) {
    // RPC doesn't exist or failed — manual deduction
    console.warn('[generate-design] deduct_design_coins RPC failed, using fallback:', rpcErr.message)
    const newBalance = Math.max(0, currentBalance - amount)
    await Promise.allSettled([
      supabase.from('coin_balances')
        .update({ balance: newBalance })
        .eq('user_id', userId),
      supabase.from('coin_transactions').insert({
        user_id:     userId,
        amount:      -amount,
        type:        'deduction',
        tool_id:     toolId,
        description: `${toolId} design generation (${engine})`,
        created_at:  new Date().toISOString(),
      }),
    ])
  }
}

// ── Build prompt ──────────────────────────────────────────────
function buildDesignPrompt(
  toolId:   string,
  formData: Record<string, string>,
  brand:    Awaited<ReturnType<typeof getBrandProfile>>,
  variant:  number
): string {
  const injection = buildBrandInjection(brand)
  const variantNote = variant === 2
    ? '\n\nVARIANT 2: Use a distinctly different layout or composition from Variant 1 — same brand colours, different visual arrangement.'
    : ''

  let toolPrompt = ''
  switch (toolId) {
    case 'social-post-designer':     toolPrompt = socialPostPrompt(formData, brand);       break
    case 'story-reel-designer':      toolPrompt = storyReelPrompt(formData, brand);        break
    case 'youtube-thumbnail-maker':  toolPrompt = youtubeThumbnailPrompt(formData, brand); break
    case 'quote-card-creator':       toolPrompt = quoteCardPrompt(formData, brand);        break
    case 'promo-card-designer':      toolPrompt = promoCardPrompt(formData, brand);        break
    case 'linkedin-banner-designer': toolPrompt = linkedinBannerPrompt(formData, brand);   break
    case 'email-header-designer':    toolPrompt = emailHeaderPrompt(formData, brand);      break
    case 'flyer-designer':           toolPrompt = flyerPrompt(formData, brand);            break
    case 'festive-banner-designer':  toolPrompt = festiveBannerPrompt(formData, brand);    break
    default:                         toolPrompt = `Design a professional branded ${toolId.replace(/-/g,' ')} graphic.`
  }

  return `${injection}\n\n${toolPrompt}${variantNote}`
}

// ── Main handler ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const {
      toolId,
      formData   = {},
      engine     = 'standard',
      format,
      preview    = false,  // ← key: true = free preview, false = full save
    } = body as {
      toolId:   string
      formData: Record<string, string>
      engine:   'standard' | 'premium'
      format:   DesignFormat
      preview:  boolean
    }

    // ── Validate tool ─────────────────────────────────────────
    const tool = getDesignTool(toolId)
    if (!tool) return NextResponse.json({ error: 'Unknown design tool' }, { status: 400 })

    const coinCost = getDesignCoinCost(toolId, engine)

    // ── Coin balance check (always — even for preview, so UI can show error) ──
    const { data: balance } = await supabase
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!preview && (!balance || balance.balance < coinCost)) {
      return NextResponse.json({
        error:    'Insufficient coins',
        required: coinCost,
        current:  balance?.balance || 0,
      }, { status: 402 })
    }

    // ── Brand profile ─────────────────────────────────────────
    const brand = await getBrandProfile(user.id)

    // ─────────────────────────────────────────────────────────
    // PREVIEW MODE — fast, free, not stored
    // ─────────────────────────────────────────────────────────
    if (preview) {
      const targetFormat = (formData.format as DesignFormat) || format || tool.formats[0]
      const prompt  = buildDesignPrompt(toolId, formData, brand, 1)
      const raw     = await generateImage(prompt, targetFormat, engine) // quality:low
      const processed = await processDesignImage({
        imageUrl: raw, format: targetFormat, brand, addFooter: false, // no footer on preview
      })
      const dataUrl = `data:image/png;base64,${processed.toString('base64')}`

      return NextResponse.json({
        previewDataUrl: dataUrl,
        coinCost,
        engine,
        brandApplied: { primaryColor: brand.primaryColor, logoOverlaid: !!brand.logoUrl },
      })
    }

    // ─────────────────────────────────────────────────────────
    // CAROUSEL — generate slides individually
    // ─────────────────────────────────────────────────────────
    if (toolId === 'carousel-slide-maker') {
      const slideCount = Math.min(parseInt(formData.slide_count || '6'), 10)
      const lines      = (formData.slide_content || '').split('\n').filter(Boolean)
      const imageUrls: string[] = []

      for (let i = 0; i < slideCount; i++) {
        const slideText = lines[i] || `Slide ${i + 1}`
        const isCover   = i === 0
        const isCTA     = i === slideCount - 1
        const prompt    = `${buildBrandInjection(brand)}\n\n${carouselSlidePrompt(formData, brand, i + 1, slideText, isCover, isCTA)}`

        const raw       = await generateImage(prompt, 'square', engine)
        const processed = await processDesignImage({
          imageUrl: raw, format: 'square', brand, addFooter: isCTA,
        })
        const fileName = `designs/${user.id}/${toolId}/${Date.now()}_slide${i + 1}.png`
        const url      = await uploadToR2(processed, fileName)
        imageUrls.push(url)
      }

      await deductCoins(supabase, user.id, coinCost, toolId, engine, balance?.balance || 0)
      await supabase.from('design_generations' as any).insert({
        user_id: user.id, tool_id: toolId, tool_name: tool.name,
        format: 'square', engine, image_urls: imageUrls, coins_spent: coinCost,
        prompt_summary: formData.carousel_topic || '',
        brand_snapshot: snapshotBrand(brand),
      })

      return NextResponse.json({ imageUrls, coinCost, engine, slides: slideCount })
    }

    // ─────────────────────────────────────────────────────────
    // STANDARD TOOLS — generate 1 or 2 variants
    // ─────────────────────────────────────────────────────────
    const variantCount  = tool.variants || 1
    const targetFormat  = (formData.format as DesignFormat) || format || tool.formats[0]
    const imageUrls: string[] = []

    for (let v = 1; v <= variantCount; v++) {
      const prompt    = buildDesignPrompt(toolId, formData, brand, v)
      const raw       = await generateImage(prompt, targetFormat, engine)
      const processed = await processDesignImage({ imageUrl: raw, format: targetFormat, brand, addFooter: true })
      const fileName  = `designs/${user.id}/${toolId}/${Date.now()}_v${v}.png`
      const url       = await uploadToR2(processed, fileName)
      imageUrls.push(url)
    }

    // ── Deduct coins (with fallback) ──────────────────────────
    await deductCoins(supabase, user.id, coinCost, toolId, engine, balance?.balance || 0)

    // ── Save to history ───────────────────────────────────────
    const promptSummary =
      formData.post_topic || formData.headline || formData.story_message ||
      formData.greeting_msg || formData.email_title || formData.quote_text || ''

    const { data: generation } = await supabase
      .from('design_generations' as any)
      .insert({
        user_id:        user.id,
        tool_id:        toolId,
        tool_name:      tool.name,
        format:         targetFormat,
        engine,
        image_urls:     imageUrls,
        coins_spent:    coinCost,
        prompt_summary: promptSummary.slice(0, 200),
        brand_snapshot: snapshotBrand(brand),
      })
      .select('id')
      .single()

    return NextResponse.json({
      imageUrls,
      coinCost,
      engine,
      generationId:  generation?.id ?? null,
      brandApplied:  {
        primaryColor: brand.primaryColor,
        logoOverlaid: !!brand.logoUrl,
        footerApplied: true,
      },
    })

  } catch (err: any) {
    console.error('[generate-design]', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}

export const dynamic     = 'force-dynamic'
export const maxDuration = 120
