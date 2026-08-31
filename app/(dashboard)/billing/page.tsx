'use client'
// /app/(dashboard)/billing/page.tsx — Billing & Coins
// Phase 1: Pay-as-you-go coins only. No plan tiers.
// Everyone gets 70 free coins on signup. Buy more any time.

import React, { useState, useEffect, useCallback } from 'react'
import { Coins, RefreshCw, Shield, Gift } from 'lucide-react'
import { BULK_PACKS, COIN_BASE_RATE, COIN_MIN_CUSTOM, calcCustomTopUp } from '@/lib/coins/economy'
import { useUser } from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const VOID  = '#06080E'
const CORAL = '#E84830'
const MUTED = 'rgba(205,217,236,0.35)'
const DIM   = 'rgba(205,217,236,0.55)'

declare global { interface Window { PaystackPop: any } }

// ─────────────────────────────────────────────────────────────
// Custom coin amount calculator
// ─────────────────────────────────────────────────────────────
function CoinCalculator({ onBuy, paying }: {
  onBuy: (qty: number, price: number) => void
  paying: boolean
}) {
  const [qty, setQty] = useState('')
  const num     = parseInt(qty) || 0
  const invalid = num > 0 && num < COIN_MIN_CUSTOM
  const calc    = num >= COIN_MIN_CUSTOM ? calcCustomTopUp(num) : null

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: 22 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 14 }}>
        Custom amount (minimum {COIN_MIN_CUSTOM} coins)
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${invalid ? CORAL + '60' : 'rgba(255,255,255,0.14)'}`, borderRadius: 10, padding: '10px 14px' }}>
            <Coins className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
            <input
              type="number" min={COIN_MIN_CUSTOM} step={1} value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder={`e.g. ${COIN_MIN_CUSTOM}`}
              style={{ background: 'none', border: 'none', outline: 'none', color: '#EBF2FC', fontSize: 16, fontWeight: 700, width: '100%', fontFamily: 'inherit' }}
            />
            <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap' as const }}>coins</span>
          </div>
          {invalid && (
            <p style={{ fontSize: 11, color: CORAL, marginTop: 4 }}>
              Minimum {COIN_MIN_CUSTOM} coins (₦{(COIN_MIN_CUSTOM * COIN_BASE_RATE).toLocaleString()})
            </p>
          )}
        </div>

        {calc && (
          <div style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 3 }}>₦{COIN_BASE_RATE.toLocaleString()}/coin</div>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 700, color: GL }}>{calc.priceLabel}</div>
          </div>
        )}

        <button
          onClick={() => calc && onBuy(calc.coins, calc.price)}
          disabled={!calc || paying}
          style={{
            background: calc ? `linear-gradient(135deg,${GOLD},${GL})` : 'rgba(255,255,255,0.04)',
            color: calc ? VOID : MUTED,
            fontWeight: 800, fontSize: 13, padding: '11px 20px',
            borderRadius: 10, border: 'none',
            cursor: !calc || paying ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
            opacity: paying ? 0.7 : 1,
          }}
        >
          {paying ? '⏳' : 'Buy Now'}
        </button>
      </div>

      {calc?.bulkAlternative && (
        <div style={{ marginTop: 12, background: `${GOLD}0E`, border: `1px solid ${GOLD}28`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Gift className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GL }} />
          <p style={{ fontSize: 12, color: 'rgba(205,217,236,0.72)', lineHeight: 1.45 }}>
            <strong style={{ color: GL }}>Better deal:</strong>{' '}
            {calc.bulkAlternative.coins} coins for {calc.bulkAlternative.priceLabel} — save ₦{calc.bulkAlternative.saving.toLocaleString()} ({calc.bulkAlternative.savingPct}% off)
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { user }  = useUser()
  const { toast } = useToast()

  const [coins,        setCoins]        = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [paying,       setPaying]       = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [coinR, txR] = await Promise.all([
          fetch('/api/coins/balance'),
          fetch('/api/coins/history?limit=10'),
        ])
        if (coinR.ok) setCoins((await coinR.json()).balance ?? 0)
        if (txR.ok)   setTransactions((await txR.json()).transactions ?? [])
      } catch {}
      setLoading(false)
    }
    load()
    // Load Paystack
    if (!document.getElementById('paystack-js')) {
      const s = document.createElement('script')
      s.id = 'paystack-js'
      s.src = 'https://js.paystack.co/v1/inline.js'
      document.head.appendChild(s)
    }
  }, [])

  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  // ── Paystack flow ──────────────────────────────────────────
  const initPaystack = useCallback(async (
    type: 'topup_bulk' | 'topup_custom',
    opts: Record<string, any>
  ) => {
    if (!user?.email) { toast({ type: 'warning', title: 'Log in required' }); return }

    const key = `${type}_${opts.packId ?? opts.coinQty}`
    setPaying(key)

    try {
      const res = await fetch('/api/billing/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...opts }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast({ type: 'error', title: 'Error', description: err.error })
        setPaying(null); return
      }

      const { reference, amount, coins: outCoins, metadata } = await res.json()

      if (!window.PaystackPop) {
        toast({ type: 'error', title: 'Payment not ready', description: 'Please try again in a moment.' })
        setPaying(null); return
      }

      window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: amount * 100,
        currency: 'NGN',
        ref: reference,
        metadata,
        callback: (response: { reference: string }) => {
          void (async () => {
            try {
              const verRes  = await fetch('/api/billing/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: response.reference, isTopUp: true, topUpCoins: outCoins }),
              })
              const verData = await verRes.json()
              if (verData.success) {
                toast({ type: 'success', title: `+${outCoins} coins added!`, description: 'Credited to your account.' })
                setTimeout(() => window.location.reload(), 1200)
              } else {
                toast({ type: 'error', title: 'Verification failed', description: 'Contact support if charged.' })
              }
            } catch (e: any) {
              toast({ type: 'error', title: 'Verification error', description: e.message })
            } finally { setPaying(null) }
          })()
        },
        onClose: () => setPaying(null),
      }).openIframe()

    } catch (e: any) {
      toast({ type: 'error', title: 'Payment failed', description: e.message })
      setPaying(null)
    }
  }, [user, toast, paystackKey])

  const handleBulk   = useCallback((pack: typeof BULK_PACKS[number]) =>
    initPaystack('topup_bulk', { packId: pack.id, amount: pack.price, coins: pack.coins }), [initPaystack])

  const handleCustom = useCallback((qty: number, price: number) =>
    initPaystack('topup_custom', { coinQty: qty, price }), [initPaystack])

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 26, fontWeight: 900, color: '#fff' }}>
          Billing & Coins
        </h1>
        <p style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>
          Top up Cerebre Coins and view your transaction history.
        </p>
      </div>

      {/* Coin balance card */}
      <div style={{ background: 'linear-gradient(135deg,rgba(224,152,24,0.1),rgba(18,212,180,0.05))', border: `1px solid ${GOLD}25`, borderRadius: 18, padding: '24px 28px', marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 8 }}>
            Your Coin Balance
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: "'Georgia',serif", fontSize: 52, fontWeight: 900, color: GL, lineHeight: 1 }}>
              {coins.toLocaleString()}
            </span>
            <span style={{ fontSize: 16, color: MUTED }}>coins</span>
          </div>
          <p style={{ fontSize: 13, color: DIM, marginTop: 6 }}>
            Coins never expire · No subscription needed
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Pay-as-you-go</p>
          <p style={{ fontSize: 13, color: TEAL, fontWeight: 700 }}>₦500 per coin · bulk packs below</p>
        </div>
      </div>

      {/* ── Bulk packs ─────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#EBF2FC', marginBottom: 6 }}>Buy Coins</h2>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
          Bulk packs give you a better rate than buying coin by coin. Pick the pack that fits your usage.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))', gap: 14, marginBottom: 20 }}>
          {BULK_PACKS.map(pack => (
            <div key={pack.id} style={{
              background: pack.badge ? 'linear-gradient(160deg,#130E00,#1C1600,#090F1E)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${pack.badge ? GOLD + '55' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: 16, padding: '20px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              {pack.badge && (
                <>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, background: `linear-gradient(135deg,${GOLD},${GL})`, color: VOID, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '1px' }}>
                    {pack.badge.toUpperCase()}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <Coins className="h-4 w-4" style={{ color: GL }} />
                <span style={{ fontFamily: "'Georgia',serif", fontSize: 34, fontWeight: 900, color: GL, lineHeight: 1 }}>
                  {pack.coins}
                </span>
              </div>
              <p style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>coins</p>

              <p style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 700, color: '#EBF2FC', marginBottom: 2 }}>
                {pack.priceLabel}
              </p>
              <p style={{ fontSize: 10.5, color: MUTED, textDecoration: 'line-through', marginBottom: 3 }}>
                ₦{pack.basePrice.toLocaleString()} base
              </p>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: TEAL, marginBottom: 3 }}>
                Save {pack.savingPct}%
              </p>
              <p style={{ fontSize: 10, color: MUTED, marginBottom: 16 }}>
                ₦{pack.perCoin}/coin
              </p>

              <button
                onClick={() => handleBulk(pack)}
                disabled={paying !== null}
                style={{
                  width: '100%', padding: '10px', borderRadius: 8,
                  background: `linear-gradient(135deg,${GOLD},${GL})`,
                  color: VOID, fontWeight: 800, fontSize: 13,
                  border: 'none', cursor: paying !== null ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: paying !== null ? 0.65 : 1,
                }}
              >
                {paying === `topup_bulk_${pack.id}` ? '⏳ Opening…' : `Buy ${pack.coins} coins →`}
              </button>
            </div>
          ))}
        </div>

        {/* Custom amount */}
        <CoinCalculator onBuy={handleCustom} paying={paying !== null} />
      </div>

      {/* ── Transaction history ─────────────────────────────── */}
      {transactions.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#EBF2FC', marginBottom: 14 }}>Transaction History</h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
            {transactions.map((tx, i) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: 12, borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div>
                  <p style={{ fontSize: 13.5, color: '#EBF2FC', fontWeight: 600 }}>
                    {tx.description || tx.type}
                  </p>
                  <p style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                    {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: tx.amount > 0 ? TEAL : 'rgba(205,217,236,0.4)', flexShrink: 0 }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} coins
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guarantee */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Shield className="h-8 w-8 shrink-0" style={{ color: GOLD }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EBF2FC' }}>30-Day Money-Back Guarantee</p>
          <p style={{ fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>
            Buy coins, use the tools, and if you don't believe it was worth every naira — WhatsApp us for a full refund. No forms. No questions asked.
          </p>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '2348000000000'}?text=Hi, I'd like a refund for my Cerebre Plus coin purchase`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#EBF2FC', fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8, whiteSpace: 'nowrap' as const, textDecoration: 'none' }}
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}