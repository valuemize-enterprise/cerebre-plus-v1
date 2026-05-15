// /app/api/profile/upload-logo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const MAX_SIZE = 2 * 1024 * 1024  // 2MB
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

// Cloudflare R2 via S3-compatible API
const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()

    console.log(formData)
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed. Use PNG, JPG, WebP or SVG.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum 2MB.' }, { status: 400 })
  }

  const ext      = file.type.split('/')[1].replace('svg+xml', 'svg')
  const key      = `logos/${user.id}/${Date.now()}.${ext}`
  const bytes    = await file.arrayBuffer()
  const buffer   = Buffer.from(bytes)

  // If R2 is not configured, fall back to Supabase Storage
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(key, buffer, { contentType: file.type, upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.path)
    return NextResponse.json({ url: urlData.publicUrl })
  }

  // Upload to R2
  try {
    await r2.send(new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME!,
      Key:         key,
      Body:        buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000',
    }))

    const url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`}/${key}`
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('[upload-logo] R2 error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
