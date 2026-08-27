// /app/api/webhooks/paystack/route.ts
// PHASE 1 UPDATE: Coin top-up only. Subscription events removed.
// Handles: charge.success (coin top-up), charge.failed.
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { invalidateBalance } from '@/lib/performance/cache'
import { sendEmail } from '@/lib/email'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(body)
    .digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body) as { event: string; data: Record<string, any> }
  const supabase = createAdminClient()

  // Log all events for audit trail
  try {
    await supabase.from('notifications').insert({
      user_id: 'system',
      type:    `paystack_${event.event}`,
      payload: event.data,
      is_read: true,
    })
  } catch (_) {} // Non-blocking

  try {
    switch (event.event) {

      // ── Coin top-up payment succeeded ──────────────────────
      case 'charge.success': {
        const { metadata, reference } = event.data
        const userId       = metadata?.user_id
        const isTopUp      = metadata?.is_top_up === true
        const topUpCoins   = metadata?.top_up_coins

        if (!userId || !isTopUp || !topUpCoins) break

        // Idempotency: webhook may fire multiple times
        const { data: existing } = await supabase
          .from('coin_transactions')
          .select('id')
          .eq('description', `paystack:${reference}`)
          .single()

        if (existing) break // already processed by verify-payment

        const { error: creditErr } = await supabase.rpc('credit_coins', {
          p_user_id:     userId,
          p_amount:      topUpCoins,
          p_type:        'topup',
          p_description: `paystack:${reference}`,
        })

        if (creditErr) {
          console.error('[paystack-webhook] credit_coins failed:', creditErr)
          break
        }

        await invalidateBalance(userId)

        await supabase.from('notifications').insert({
          user_id: userId,
          type:    'coins_added',
          payload: { coins: topUpCoins, reference },
          is_read: false,
        })
        break
      }

      // ── Payment failed ──────────────────────────────────────
      case 'charge.failed': {
        const userId    = event.data.metadata?.user_id
        const userEmail = event.data.metadata?.user_email
        if (userId) {
          await supabase.from('notifications').insert({
            user_id: userId,
            type:    'payment_failed',
            payload: { reference: event.data.reference },
            is_read: false,
          })
          if (userEmail) {
            const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing`
            await sendEmail({
              to:       userEmail,
              template: 'payment_failed',
              data:     { retryUrl },
            }).catch(() => {})
          }
        }
        break
      }

      // Subscription events (subscription.disable, etc.) are ignored in Phase 1
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[paystack-webhook] error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
