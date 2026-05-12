// /app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { firstName, email, source } = await request.json() as {
      firstName: string
      email:     string
      source?:   string
    }

    if (!email || !firstName) {
      return NextResponse.json({ error: 'first_name and email required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Idempotent — upsert by email
    const { error } = await supabase.from('waitlist').upsert(
      { first_name: firstName, email: email.toLowerCase().trim(), source: source || 'waitlist' },
      { onConflict: 'email', ignoreDuplicates: true }
    )

    if (error) {
      console.error('[waitlist] insert error:', error)
      return NextResponse.json({ error: 'Could not save your spot' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[waitlist] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
