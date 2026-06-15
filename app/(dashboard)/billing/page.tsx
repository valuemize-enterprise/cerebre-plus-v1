'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/billing/page.tsx
// Billing & Subscription management — v2
// Plans: Free (₦0/70c/30d) · Starter (₦20K/yr) · Growth (₦80K/yr)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Coins, Check, X, Shield, Crown, Zap, Star,
  RefreshCw, Lock, Clock, Gift, ChevronDown, ChevronUp,
  MessageCircle, Users, TrendingUp, Newspaper, Headphones,
} from 'lucide-react'
import {
  PLANS, BULK_PACKS, PLAN_FEATURES, SME_CLUB,
  COIN_BASE_RATE, COIN_MIN_CUSTOM, calcCustomTopUp,
  canTopUp, isFreePlan, getDaysRemaining, getCoinRemainingPct,
  type PlanId,
} from '@/lib/coins/economy'
import { useUser } from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

// ── Design tokens ─────────────────────────────────────────────
const NAVY = '#0B1F3A'
const GOLD = '#E09818'
const GL = '#F5B830'
const TEAL = '#12D4B4'
const VOID = '#06080E'
const CORAL = '#E84830'
const DIM = 'rgba(205,217,236,0.55)'
const MUTED = 'rgba(205,217,236,0.35)'

declare global { interface Window { PaystackPop: any } }

// ─────────────────────────────────────────────────────────────
// PLAN ICONS
// ─────────────────────────────────────────────────────────────
const PLAN_ICON: Record<string, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  starter: <Star className="h-5 w-5" />,
  growth: <Crown className="h-5 w-5" />,
}

// ─────────────────────────────────────────────────────────────
// COIN CALCULATOR  (Starter/Growth only)
// ─────────────────────────────────────────────────────────────
function CoinCalculator({ onBuy, paying }: {
  onBuy: (qty: number, price: number) => void
  paying: boolean
}) {
  const [qty, setQty] = useState<string>('')
  const numQty = parseInt(qty) || 0
  const invalid = numQty > 0 && numQty < COIN_MIN_CUSTOM
  const empty = numQty === 0
  const calc = !invalid && !empty ? calcCustomTopUp(numQty) : null

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: 22 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 14 }}>
        Custom amount
      </p>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        {/* Input */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${invalid ? CORAL + '60' : 'rgba(255,255,255,0.14)'}`, borderRadius: 10, padding: '10px 14px' }}>
            <Coins className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
            <input
              type="number" min={COIN_MIN_CUSTOM} step={1} value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="e.g. 25"
              style={{ background: 'none', border: 'none', outline: 'none', color: '#EBF2FC', fontSize: 16, fontWeight: 700, width: '100%', fontFamily: 'inherit' }}
            />
            <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap' }}>coins</span>
          </div>
          {invalid && (
            <p style={{ fontSize: 11, color: CORAL, marginTop: 4 }}>
              Minimum {COIN_MIN_CUSTOM} coins (₦{(COIN_MIN_CUSTOM * COIN_BASE_RATE).toLocaleString()})
            </p>
          )}
        </div>

        {/* Price */}
        {calc && (
          <div style={{ textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 3 }}>₦{COIN_BASE_RATE.toLocaleString()}/coin</div>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 700, color: GL }}>{calc.priceLabel}</div>
          </div>
        )}

        {/* Buy */}
        <button
          onClick={() => calc && onBuy(calc.coins, calc.price)}
          disabled={!calc || paying}
          style={{
            background: !calc ? 'rgba(255,255,255,0.04)' : `linear-gradient(135deg,${GOLD},${GL})`,
            color: !calc ? MUTED : VOID,
            fontWeight: 800, fontSize: 13, padding: '11px 20px',
            borderRadius: 10, border: 'none',
            cursor: !calc || paying ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
          }}
        >
          {paying ? '⏳' : 'Buy Now'}
        </button>
      </div>

      {/* Bulk suggestion */}
      {calc?.bulkAlternative && (
        <div style={{ marginTop: 12, background: `${GOLD}0E`, border: `1px solid ${GOLD}28`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Gift className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GL }} />
          <p style={{ fontSize: 12, color: 'rgba(205,217,236,0.72)', lineHeight: 1.45 }}>
            <strong style={{ color: GL }}>Better deal available:</strong>{' '}
            {calc.bulkAlternative.coins} coins for {calc.bulkAlternative.priceLabel} — save ₦{calc.bulkAlternative.saving.toLocaleString()} ({calc.bulkAlternative.savingPct}% off)
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PLAN CARD
// ─────────────────────────────────────────────────────────────
function PlanCard({ planId, isCurrent, daysLeft, onUpgrade, paying }: {
  planId: PlanId
  isCurrent: boolean
  daysLeft: number
  onUpgrade: (p: PlanId) => void
  paying: boolean
}) {
  const plan = PLANS[planId]
  const features = PLAN_FEATURES[planId]
  const featured = planId === 'growth'
  const [open, setOpen] = useState(true)

  const urgentFree = isCurrent && planId === 'free' && daysLeft <= 7

  return (
    <div style={{
      background: featured ? 'linear-gradient(160deg,#130E00,#1C1600,#090F1E)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isCurrent ? '#10B881' : featured ? GOLD + '55' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 20, overflow: 'hidden', position: 'relative',
      boxShadow: featured ? `0 0 60px ${GOLD}0A` : 'none',
    }}>
      {featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />}
      {isCurrent && (
        <div style={{ position: 'absolute', top: 12, right: 14, background: '#10B881', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '1px' }}>
          ✓ ACTIVE
        </div>
      )}

      <div style={{ padding: '26px 22px' }}>
        {/* Badge */}
        {plan.badge && (
          <div style={{ display: 'inline-block', marginBottom: 14, background: `linear-gradient(135deg,${GOLD},${GL})`, color: VOID, fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '1px' }}>
            {plan.badge}
          </div>
        )}

        {/* Name + icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ color: GOLD }}>{PLAN_ICON[planId]}</span>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 700, color: '#EBF2FC' }}>{plan.name}</span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 13, color: 'rgba(205,217,236,0.55)', lineHeight: 1.55, marginBottom: 16, fontStyle: 'italic' }}>
          {features.tagline}
        </p>

        {/* Price */}
        <div style={{ marginBottom: plan.monthlyEq ? 4 : 14 }}>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: planId === 'free' ? 40 : 46, fontWeight: 900, color: planId === 'free' ? TEAL : GL, lineHeight: 1 }}>
            {plan.priceLabel}
          </span>
          {plan.price > 0 && <span style={{ fontSize: 13, color: MUTED, marginLeft: 5 }}>/year</span>}
        </div>
        {plan.monthlyEq && (
          <p style={{ fontSize: 11.5, color: MUTED, marginBottom: 14, fontFamily: 'monospace' }}>
            = {plan.monthlyEq} equivalent
          </p>
        )}
        {planId === 'free' && (
          <p style={{ fontSize: 11.5, color: urgentFree ? CORAL : 'rgba(205,217,236,0.4)', marginBottom: 14, fontWeight: urgentFree ? 700 : 400 }}>
            {urgentFree ? `⚠ ${daysLeft} days left in your trial` : '30-day trial — no renewal'}
          </p>
        )}

        {/* Coins badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${GL}12`, border: `1px solid ${GL}28`, borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
          <span style={{ fontSize: 20 }}>🪙</span>
          <div>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: GL, lineHeight: 1 }}>{plan.coins}</div>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' as const }}>
              Cerebre Coins · {planId === 'free' ? '30 days' : 'Full year'}
            </div>
          </div>
          {planId === 'growth' && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: MUTED }}>Rolls over</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>up to 200</div>
            </div>
          )}
        </div>

        {/* "This plan is for..." */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 5 }}>This plan is for</p>
          <p style={{ fontSize: 13, color: 'rgba(205,217,236,0.72)', lineHeight: 1.5 }}>{features.forWho}</p>
        </div>

        {/* Highlights (gold, always visible) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {features.highlighted.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, fontWeight: 600, color: '#EBF2FC', alignItems: 'flex-start' }}>
              <span style={{ color: GL, fontSize: 12, marginTop: 2, flexShrink: 0 }}>★</span>{f}
            </div>
          ))}
        </div>

        {/* Full feature list toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: GL, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, marginBottom: open ? 12 : 0, fontFamily: 'inherit' }}
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? 'Hide full feature list' : 'See everything included'}
        </button>

        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
            {features.included.map((f, i) => {
              const isSME = f.startsWith('🌟')
              const isSup = f.startsWith('🚀')
              const indent = f.startsWith('   ') || f.includes('SME Club —')
              return (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: indent ? 12 : 13, color: isSME ? GL : isSup ? TEAL : 'rgba(205,217,236,0.72)', alignItems: 'flex-start', paddingLeft: indent ? 8 : 0 }}>
                  {!isSME && !isSup && <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: TEAL }} />}
                  {isSME && <span style={{ fontSize: 10, marginTop: 3, flexShrink: 0 }}>🌟</span>}
                  {isSup && <span style={{ fontSize: 10, marginTop: 3, flexShrink: 0 }}>🚀</span>}
                  <span>{f.replace(/^(🌟|🚀)\s*/, '').replace(/^   /, '')}</span>
                </div>
              )
            })}
            {features.notIncluded.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'rgba(205,217,236,0.3)', alignItems: 'flex-start' }}>
                <X className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'rgba(205,217,236,0.2)' }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => !isCurrent && planId !== 'free' && onUpgrade(planId)}
          disabled={isCurrent || planId === 'free' || paying}
          style={{
            width: '100%', padding: 14, borderRadius: 10,
            fontWeight: 800, fontSize: 14, cursor: isCurrent || planId === 'free' ? 'default' : 'pointer',
            border: 'none', fontFamily: 'inherit',
            background: isCurrent ? 'rgba(16,184,129,0.1)' : planId === 'free' ? 'rgba(255,255,255,0.04)' : featured ? `linear-gradient(135deg,${GOLD},${GL})` : 'rgba(255,255,255,0.07)',
            color: isCurrent ? '#10B881' : planId === 'free' ? MUTED : featured ? VOID : '#EBF2FC',
            opacity: paying ? .6 : 1,
          }}
        >
          {paying ? '⏳ Opening payment…' :
            isCurrent ? 'Your Current Plan' :
              planId === 'free' ? 'Activate Free Trial' :
                `Upgrade to ${plan.name} — ${plan.priceLabel}/yr →`}
        </button>

        {/* Days / renewal note */}
        {isCurrent && planId !== 'free' && daysLeft > 0 && (
          <p style={{ textAlign: 'center', fontSize: 11, color: MUTED, marginTop: 10 }}>
            {daysLeft} days remaining in your current year
          </p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SME CLUB SPOTLIGHT  (shows to non-Growth users)
// ─────────────────────────────────────────────────────────────
function SMEClubSpotlight({ onJoin, paying }: { onJoin: () => void; paying: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    '📱': <MessageCircle className="h-5 w-5" />,
    '👥': <Users className="h-5 w-5" />,
    '📰': <Newspaper className="h-5 w-5" />,
    '🚀': <Headphones className="h-5 w-5" />,
  }

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(200,136,10,0.1),rgba(11,168,144,0.06))', border: `1px solid ${GOLD}30`, borderRadius: 18, padding: 28, marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 38, flexShrink: 0 }}>🌟</div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 4 }}>
            Exclusive to Growth Plan
          </p>
          <h3 style={{ fontFamily: "'Georgia',serif", fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: '#EBF2FC', lineHeight: 1.1 }}>
            {SME_CLUB.headline}
          </h3>
        </div>
      </div>

      <p style={{ fontSize: 14, color: DIM, lineHeight: 1.75, marginBottom: 22, maxWidth: 680 }}>
        {SME_CLUB.description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 24 }}>
        {SME_CLUB.benefits.map(b => (
          <div key={b.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ color: GOLD }}>{icons[b.icon] ?? b.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#EBF2FC' }}>{b.title}</span>
            </div>
            <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>{b.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={onJoin}
          disabled={paying}
          style={{ background: `linear-gradient(135deg,${GOLD},${GL})`, color: VOID, fontWeight: 800, fontSize: 14, padding: '13px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: paying ? .6 : 1 }}
        >
          Join SME Club — ₦80,000/year →
        </button>
        <p style={{ fontSize: 12, color: MUTED }}>Includes 700 coins · All 40 tools · Full SME Club membership</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function BillingPage() {
  const params = useSearchParams()
  const { user } = useUser()
  const { toast } = useToast()

  const [subscription, setSubscription] = useState<any>(null)
  const [coins, setCoins] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [subR, coinR, txR] = await Promise.all([
          fetch('/api/billing/subscription'),
          fetch('/api/coins/balance'),
          fetch('/api/coins/history?limit=8'),
        ])
        if (subR.ok) setSubscription(await subR.json())
        if (coinR.ok) setCoins((await coinR.json()).balance)
        if (txR.ok) setTransactions((await txR.json()).transactions || [])
      } catch { }
      setLoading(false)
    }
    load()
    // Paystack script
    if (!document.getElementById('paystack-js')) {
      const s = document.createElement('script')
      s.id = 'paystack-js'; s.src = 'https://js.paystack.co/v1/inline.js'
      document.head.appendChild(s)
    }
  }, [])

  useEffect(() => {
    if (params.get('reason') === 'trial_expired') {
      toast({ type: 'warning', title: 'Free trial ended', description: 'Your 30-day trial has expired. Upgrade to keep your access.' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const planTier = (subscription?.plan_tier ?? 'free') as PlanId
  const daysLeft = getDaysRemaining(planTier === 'free' ? subscription?.free_expires_at : subscription?.current_period_end)
  const pct = getCoinRemainingPct(coins, planTier)
  const userCanTopUp = canTopUp(planTier) && subscription?.status === 'active'


  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  // ── Paystack ───────────────────────────────────────────────
  const initPaystack = useCallback(async (
    type: 'plan_upgrade' | 'topup_bulk' | 'topup_custom',
    opts: Record<string, any>
  ) => {
    if (!user?.email) {
      toast({ type: 'warning', title: 'Log in required' });
      return;
    }

    const key = type === 'plan_upgrade'
      ? opts.planId
      : `${type}_${opts.packId || opts.coinQty}`;
    setPaying(key);

    try {
      const res = await fetch('/api/billing/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...opts }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ type: 'error', title: 'Error', description: err.error });
        setPaying(null);
        return;
      }

      const { reference, amount, coins: outCoins, metadata } = await res.json();

      if (!window.PaystackPop) {
        toast({
          type: 'error',
          title: 'Payment not ready',
          description: 'Please wait a moment and try again.',
        });
        setPaying(null);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: amount * 100,
        currency: 'NGN',
        ref: reference,
        metadata,
        callback: (response: { reference: string }) => {
          void (async () => {
            try {
              const verRes = await fetch('/api/billing/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reference: response.reference,
                  planId: type === 'plan_upgrade' ? opts.planId : undefined,
                  isTopUp: type !== 'plan_upgrade',
                  topUpCoins: type !== 'plan_upgrade' ? outCoins : undefined,
                }),
              });

              const verData = await verRes.json();

              if (verData.success) {
                toast({
                  type: 'success',
                  title: type === 'plan_upgrade'
                    ? `🎉 Welcome to ${opts.planId}!`
                    : `+${outCoins} coins added!`,
                  description: type === 'plan_upgrade'
                    ? 'Your plan is now active.'
                    : 'Coins credited to your account.',
                });
                setTimeout(() => window.location.reload(), 1200);
              } else {
                toast({
                  type: 'error',
                  title: 'Verification failed',
                  description: 'Contact support if payment was deducted.',
                });
              }
            } catch (e: any) {
              toast({
                type: 'error',
                title: 'Verification error',
                description: e.message,
              });
            } finally {
              setPaying(null);
            }
          })();
        },
        onClose: () => setPaying(null),
      });

      handler.openIframe();

    } catch (e: any) {
      console.error('Payment error', e);
      toast({ type: 'error', title: 'Payment failed', description: e.message });
      setPaying(null);
    }
  }, [user, toast]);

  // ── Handlers — defined after initPaystack ──────────────────────
  const handleUpgrade = useCallback((planId: PlanId) =>
    initPaystack('plan_upgrade', { planId }), [initPaystack]);


  const handleBulk = useCallback((pack: typeof BULK_PACKS[number]) =>
    initPaystack('topup_bulk', {
      packId: pack.id,
      amount: pack.price,
      coins: pack.coins,
    }), [initPaystack]);

  const handleCustom = useCallback((qty: number, price: number) =>
    initPaystack('topup_custom', { coinQty: qty, price }), [initPaystack]);

  // ── Render ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: NAVY }}>
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 96, background: NAVY }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px clamp(16px,4%,32px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 26, fontWeight: 900, color: '#fff' }}>
            Billing & Subscription
          </h1>
          <p style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>
            Manage your plan, top up coins, and view payment history.
          </p>
        </div>

        {/* Trial-expired banner */}
        {params.get('reason') === 'trial_expired' && (
          <div style={{ marginBottom: 24, background: `${CORAL}10`, border: `1px solid ${CORAL}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Clock className="h-5 w-5 shrink-0 mt-0.5" style={{ color: CORAL }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#EBF2FC' }}>Your free trial has ended</p>
              <p style={{ fontSize: 13, color: DIM, marginTop: 3, lineHeight: 1.5 }}>
                Your 30-day trial is over. Upgrade to Starter or Growth below to get back in and keep all your saved outputs.
              </p>
            </div>
          </div>
        )}

        {/* Current plan status */}
        <div style={{ marginBottom: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 6 }}>Current Plan</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: GOLD }}>{PLAN_ICON[planTier]}</span>
                <span style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 700, color: '#EBF2FC', textTransform: 'capitalize' as const }}>
                  {PLANS[planTier]?.name}
                </span>
                {planTier !== 'free' && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: `${TEAL}15`, border: `1px solid ${TEAL}30`, color: TEAL, padding: '2px 10px', borderRadius: 20 }}>
                    ANNUAL
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: planTier === 'free' && daysLeft <= 7 ? CORAL : MUTED, marginTop: 6, fontWeight: planTier === 'free' && daysLeft <= 7 ? 700 : 400 }}>
                {planTier === 'free'
                  ? daysLeft > 0 ? `⚠ Trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Trial has ended'
                  : daysLeft > 0 ? `Renews in ${daysLeft} days` : 'Expired — please renew'}
              </p>
            </div>

            {/* Coin balance */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <Coins className="h-5 w-5" style={{ color: GL }} />
                <span style={{ fontFamily: "'Georgia',serif", fontSize: 32, fontWeight: 900, color: GL }}>{coins.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>coins remaining</p>
              <div style={{ width: 130, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginTop: 8, marginLeft: 'auto' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${GOLD},${GL})`, borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{pct}% of {PLANS[planTier].coins} coins remaining</p>
            </div>
          </div>
        </div>

        {/* SME Club spotlight — only for non-Growth users */}
        {planTier !== 'growth' && (
          <SMEClubSpotlight onJoin={() => handleUpgrade('growth')} paying={paying !== null} />
        )}

        {/* Plan cards */}
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#EBF2FC', marginBottom: 16 }}>Choose your plan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(268px,1fr))', gap: 14, marginBottom: 48 }}>
          {(['free', 'starter', 'growth'] as PlanId[]).map(pid => (
            <PlanCard
              key={pid}
              planId={pid}
              isCurrent={planTier === pid}
              daysLeft={planTier === pid ? daysLeft : 0}
              onUpgrade={handleUpgrade}
              paying={paying !== null}
            />
          ))}
        </div>

        {/* Coin Top-Up */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#EBF2FC' }}>Top-Up Coins</h2>
            {!userCanTopUp && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: MUTED, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                <Lock className="h-3 w-3" /> Starter or Growth required
              </span>
            )}
          </div>

          {!userCanTopUp ? (
            /* Locked */
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
              <Lock className="h-8 w-8 mx-auto mb-3" style={{ color: 'rgba(205,217,236,0.18)' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#EBF2FC', marginBottom: 8 }}>Coin top-ups are not available on the Free plan</p>
              <p style={{ fontSize: 13, color: MUTED, maxWidth: 400, margin: '0 auto 22px', lineHeight: 1.65 }}>
                Upgrade to Starter or Growth to buy additional coins any time you need them — from a minimum of 10 coins (₦5,000) up to 500 coins at bulk rates.
              </p>
              <button
                onClick={() => handleUpgrade('starter')}
                style={{ background: `linear-gradient(135deg,${GOLD},${GL})`, color: VOID, fontWeight: 800, fontSize: 14, padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Upgrade to Starter — ₦20,000/yr →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Info note */}
              <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}20`, borderRadius: 12, padding: '12px 16px', fontSize: 12.5, color: DIM, lineHeight: 1.5 }}>
                💡 <strong style={{ color: '#EBF2FC' }}>How top-ups work:</strong> Custom amounts are charged at ₦{COIN_BASE_RATE.toLocaleString()} per coin (minimum {COIN_MIN_CUSTOM} coins = ₦{(COIN_MIN_CUSTOM * COIN_BASE_RATE).toLocaleString()}). Bulk packs below offer progressively better rates — the more you buy, the less you pay per coin.
              </div>

              {/* Custom calculator */}
              <CoinCalculator onBuy={handleCustom} paying={paying !== null} />

              {/* Bulk packs */}
              <div>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 12 }}>
                  Bulk packs — save more when you buy more
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: 12 }}>
                  {BULK_PACKS.map(pack => (
                    <div key={pack.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '18px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                      {pack.badge && (
                        <div style={{ position: 'absolute', top: 8, right: 8, background: `${GOLD}18`, border: `1px solid ${GOLD}30`, color: GL, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
                          {pack.badge}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
                        <Coins className="h-4 w-4" style={{ color: GL }} />
                        <span style={{ fontFamily: "'Georgia',serif", fontSize: 30, fontWeight: 900, color: GL, lineHeight: 1 }}>{pack.coins}</span>
                      </div>
                      <p style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>coins</p>
                      <p style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 700, color: '#EBF2FC', marginBottom: 2 }}>{pack.priceLabel}</p>
                      <p style={{ fontSize: 10.5, color: MUTED, textDecoration: 'line-through', marginBottom: 4 }}>
                        ₦{pack.basePrice.toLocaleString()} at base rate
                      </p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Save {pack.savingPct}%</p>
                      <p style={{ fontSize: 10, color: MUTED, marginBottom: 14 }}>₦{pack.perCoin}/coin</p>
                      <button
                        onClick={() => handleBulk(pack)}
                        disabled={paying !== null}
                        style={{ width: '100%', padding: '10px', borderRadius: 8, background: `linear-gradient(135deg,${GOLD},${GL})`, color: VOID, fontWeight: 800, fontSize: 12.5, border: 'none', cursor: paying !== null ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: paying !== null ? .6 : 1 }}
                      >
                        {paying === pack.id ? '⏳' : 'Buy →'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#EBF2FC', marginBottom: 14 }}>Recent Transactions</h2>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
              {transactions.map((tx, i) => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: 12, borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 13.5, color: '#EBF2FC', fontWeight: 600 }}>{tx.description || tx.type}</p>
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
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Shield className="h-8 w-8 shrink-0" style={{ color: GOLD }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EBF2FC' }}>30-Day Money-Back Guarantee</p>
            <p style={{ fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>
              Subscribe, use the tools, and if you don't believe it was worth every naira within 30 days — WhatsApp us for a full refund. No forms. No questions asked.
            </p>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '2348000000000'}?text=Hi, I'd like a refund for my Cerebre Plus subscription`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#EBF2FC', fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8, whiteSpace: 'nowrap' as const }}
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  )
}
