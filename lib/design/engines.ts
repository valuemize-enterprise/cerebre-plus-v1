// /lib/design/engines.ts
// AI image generation engines.
// Standard: DALL-E 3 (OpenAI)
// Premium:  Gemini Imagen 3 (Google) — falls back to DALL-E 3 HD if key not set

import OpenAI from 'openai'
import { DALLE_SIZES, type DesignFormat } from '@/lib/tools/design-registry'

// ── OpenAI client ────────────────────────────────────────────
function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your Vercel environment variables.')
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// ── Generate with DALL-E 3 ───────────────────────────────────
export async function generateWithDALLE(
  prompt:   string,
  format:   DesignFormat,
  quality:  'standard' | 'hd' = 'standard'
): Promise<string> {
  const openai = getOpenAI()
  const size   = DALLE_SIZES[format] as '1024x1024' | '1792x1024' | '1024x1792'
  if (size === 'n/a' as any) throw new Error('DALL-E does not generate logos — use the logo engine')

 const response = await openai.images.generate({
  model: 'gpt-image-1',
  prompt,
  size: '1024x1024',
  quality: 'medium',
})

  console.log('size:', size, 'format:', format)
  const b64 = response.data?.[0]?.b64_json
if (!b64) throw new Error('gpt-image-1 returned no image data')
return `data:image/png;base64,${b64}`
}

// ── Generate with Gemini Imagen 3 ────────────────────────────
// Falls back to DALL-E 3 HD if GOOGLE_GENERATIVE_AI_API_KEY is not set.
export async function generateWithGemini(
  prompt: string,
  format: DesignFormat
): Promise<string> {
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!geminiKey) {
    // Graceful fallback: Premium uses DALL-E 3 HD until Gemini key is added
    console.log('[engines] Gemini key not set — using DALL-E 3 HD as Premium fallback')
    return generateWithDALLE(prompt, format, 'hd')
  }

  try {
    // Gemini Imagen 3 via Google AI SDK
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' })

    // Map format to Gemini aspect ratio
    const aspectRatioMap: Record<DesignFormat, string> = {
      square:     '1:1',
      portrait:   '3:4',
      landscape:  '4:3',
      story:      '9:16',
      thumbnail:  '16:9',
      banner:     '16:9',  // crop after
      a4portrait: '3:4',
      logo:       '1:1',
    }
    const aspectRatio = aspectRatioMap[format] || '1:1'

    // @ts-ignore — imagen API types may differ per SDK version
    const result = await model.generateImages({
      prompt: prompt.slice(0, 4000),
      numberOfImages:    1,
      aspectRatio,
      safetyFilterLevel: 'BLOCK_ONLY_HIGH',
    })

    // @ts-ignore
    const b64 = result?.images?.[0]?.image?.imageBytes
    if (!b64) throw new Error('Gemini returned no image data')

    // Convert base64 → data URL for downstream processing
    return `data:image/png;base64,${b64}`

  } catch (err) {
    // Fallback to DALL-E HD on any Gemini error
    console.error('[engines] Gemini error, falling back to DALL-E HD:', err)
    return generateWithDALLE(prompt, format, 'hd')
  }
}

// ── Main dispatch ────────────────────────────────────────────
export async function generateImage(
  prompt:  string,
  format:  DesignFormat,
  engine:  'standard' | 'premium'
): Promise<string> {
  return engine === 'premium'
    ? generateWithGemini(prompt, format)
    : generateWithDALLE(prompt, format, 'standard')
}
