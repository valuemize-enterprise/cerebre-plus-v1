// /lib/design/image-processor.ts
// Post-processing layer that enforces brand consistency on every generated image.
// Runs AFTER DALL-E / Gemini generation.
//
// Three operations:
//   1. Crop to exact format dimensions
//   2. Add branded footer strip (exact brand hex color guaranteed)
//   3. Composite user logo onto the image

import sharp from 'sharp'
import type { BrandProfile } from '@/lib/design/brand-dna'
import type { DesignFormat } from '@/lib/tools/design-registry'

// ── Target dimensions per format ─────────────────────────────
const FORMAT_DIMS: Record<DesignFormat, { w: number; h: number }> = {
  square:     { w: 1080, h: 1080 },
  portrait:   { w: 1080, h: 1350 },  // 4:5
  landscape:  { w: 1080, h:  566 },  // 1.91:1
  story:      { w: 1080, h: 1920 },  // 9:16
  thumbnail:  { w: 1280, h:  720 },  // 16:9
  banner:     { w: 1584, h:  396 },  // LinkedIn banner
  a4portrait: { w: 1240, h: 1754 },  // A4 at 150dpi
  logo:       { w:  500, h:  500 },  // square logo canvas
}

// ── Fetch image to buffer ─────────────────────────────────────
async function fetchToBuffer(urlOrDataUrl: string): Promise<Buffer> {
  if (urlOrDataUrl.startsWith('data:')) {
    // base64 data URL from Gemini
    const b64 = urlOrDataUrl.split(',')[1]
    return Buffer.from(b64, 'base64')
  }
  const res = await fetch(urlOrDataUrl)
  return Buffer.from(await res.arrayBuffer())
}

// ── Hex to RGBA ───────────────────────────────────────────────
function hexToRgba(hex: string): { r: number; g: number; b: number; alpha: number } {
  const h = hex.replace('#', '')
  return {
    r:     parseInt(h.slice(0, 2), 16),
    g:     parseInt(h.slice(2, 4), 16),
    b:     parseInt(h.slice(4, 6), 16),
    alpha: 1,
  }
}

// ── Create branded footer strip as SVG overlay ───────────────
function createBrandedFooter(
  width:   number,
  height:  number,
  brand:   BrandProfile,
  stripH:  number = 60
): Buffer {
  const { r, g, b } = hexToRgba(brand.primaryColor)
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="${height - stripH}" width="${width}" height="${stripH}"
        fill="rgb(${r},${g},${b})" rx="0"/>
      <text
        x="${width / 2}" y="${height - stripH + stripH * 0.65}"
        font-family="Arial, sans-serif"
        font-size="${Math.round(stripH * 0.3)}px"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >${brand.businessName}</text>
    </svg>`
  return Buffer.from(svg)
}

// ── Main post-processing function ────────────────────────────
export async function processDesignImage(params: {
  imageUrl:  string
  format:    DesignFormat
  brand:     BrandProfile
  addFooter: boolean
}): Promise<Buffer> {
  const { imageUrl, format, brand, addFooter } = params
  const dims   = FORMAT_DIMS[format] || FORMAT_DIMS.square
  const raw    = await fetchToBuffer(imageUrl)

  // ── Step 1: Resize + crop to exact format dimensions ───────
  let pipeline = sharp(raw)
    .resize(dims.w, dims.h, { fit: 'cover', position: 'centre' })

  // ── Step 2: Add branded footer strip ───────────────────────
  if (addFooter) {
    const footerH  = Math.round(dims.h * 0.07)  // 7% of height
    const footerSvg= createBrandedFooter(dims.w, dims.h, brand, footerH)
    pipeline = pipeline.composite([{
      input: footerSvg,
      top:   0,
      left:  0,
    }])
  }

  // ── Step 3: Overlay user logo (if available) ───────────────
  if (brand.logoUrl) {
    try {
      const logoBuffer = await fetchToBuffer(brand.logoUrl)
      const logoSize   = Math.round(dims.w * 0.12)  // 12% of image width

      const resizedLogo = await sharp(logoBuffer)
        .resize(logoSize, logoSize, { fit: 'inside', withoutEnlargement: true })
        .toBuffer()

      // Position: bottom-right with 16px margin (above footer strip)
      const footerH   = addFooter ? Math.round(dims.h * 0.07) : 0
      const margin    = 16
      const logoTop   = dims.h - footerH - logoSize - margin
      const logoLeft  = dims.w - logoSize - margin

      if (logoTop > 0) {
        pipeline = pipeline.composite([{
          input: resizedLogo,
          top:   Math.max(0, logoTop),
          left:  Math.max(0, logoLeft),
          blend: 'over',
        }])
      }
    } catch (err) {
      // Logo overlay failed — continue without it, don't break generation
      console.error('[image-processor] Logo overlay failed:', err)
    }
  }

  return pipeline.png({ quality: 90 }).toBuffer()
}

// ── Process SVG logo → multi-size PNG ────────────────────────
export async function svgToPngSizes(svgString: string): Promise<{
  png32:   Buffer   // favicon
  png512:  Buffer   // web use
  png1500: Buffer   // print
}> {
  const svgBuf = Buffer.from(svgString)
  const [png32, png512, png1500] = await Promise.all([
    sharp(svgBuf).resize(32,   32).png().toBuffer(),
    sharp(svgBuf).resize(512,  512).png().toBuffer(),
    sharp(svgBuf).resize(1500, 1500, { fit: 'inside' }).png().toBuffer(),
  ])
  return { png32, png512, png1500 }
}
