// /app/api/billing/cancel/route.ts
import { NextResponse }       from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('paystack_subscription_code')
    .eq('user_id', user.id)
    .single()

  // Cancel on Paystack if we have a subscription code
  if (sub?.paystack_subscription_code) {
    await fetch(`https://api.paystack.co/subscription/disable`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code: sub.paystack_subscription_code, token: '' }),
    }).catch(() => {}) // Non-blocking
  }

  // Mark as cancelled locally (still active until period end)
  await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
