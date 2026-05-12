'use client'
// /app/(dashboard)/billing/page.tsx
// Subscription management + Paystack checkout.
// Shows current plan, usage, and upgrade options.

import React, { useState, useEffect } from 'react'
import { useRouter }  from 'next/navigation'
import { motion }     from 'framer-motion'
import { Coins, Check, Zap, Shield, ArrowUpRight, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react'
import { PLANS, TOPUP_PACKS, getPlan, type PlanId } from '@/lib/coins/economy'
import { useUser }  from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

declare global {
  interface Window { PaystackPop: any }
}

// ─────────────────────────────────────────────────────────────
// PLAN FEATURE TABLE
// ─────────────────────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  free:       ['30 coins/month', '2-3 lightweight tools', 'Community support'],
  starter:    ['100 coins/month', 'All 40 tools', 'Email support', 'Brand vault'],
  growth:     ['250 coins/month', 'All 40 tools', '30-coin rollover', 'Priority support', 'Content recycler', 'Competitor intelligence'],
  premium:    ['650 coins/month', 'All 40 tools', '80-coin rollover', 'Priority support', 'Weekly pulse report', 'All power features'],
  enterprise: ['Unlimited coins', 'All 40 tools', 'Unlimited rollover', 'Dedicated support', 'Team members', 'Custom onboarding'],
}

export default function BillingPage() {
  const router      = useRouter()
  const { toast }   = useToast()
  const { user, profile } = useUser()

  const [subscription, setSubscription] = useState<any>(null)
  const [coins,        setCoins]        = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [paying,       setPaying]       = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, coinRes, txRes] = await Promise.all([
          fetch('/api/billing/subscription'),
          fetch('/api/coins/balance'),
          fetch('/api/coins/history?limit=5'),
        ])
        if (subRes.ok) setSubscription(await subRes.json())
        if (coinRes.ok) setCoins((await coinRes.json()).balance)
        if (txRes.ok)   setTransactions((await txRes.json()).transactions || [])
      } catch {}
      setLoading(false)
    }
    load()

    // Load Paystack script
    if (!document.getElementById('paystack-script')) {
      const script = document.createElement('script')
      script.id  = 'paystack-script'
      script.src = 'https://js.paystack.co/v1/inline.js'
      document.head.appendChild(script)
    }
  }, [])

  const currentPlanId = (subscription?.plan_tier || 'free') as PlanId
  const currentPlan   = getPlan(currentPlanId)

  const initializePaystack = async (planId: string, amount: number, isTopUp = false, topUpCoins?: number) => {
    if (!user?.email) {
      toast({ type: 'warning', title: 'Login required', description: 'Please log in to continue.' })
      return
    }

    setPaying(planId)

    try {
      // Create payment intent on server
      const res = await fetch('/api/billing/create-payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId, isTopUp, topUpCoins }),
      })
      const { reference, metadata } = await res.json()

      if (!window.PaystackPop) {
        toast({ type: 'error', title: 'Payment not ready', description: 'Please wait a moment and try again.' })
        return
      }

      const handler = window.PaystackPop.setup({
        key:       process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email:     user.email,
        amount:    amount * 100,  // Paystack amount in kobo
        currency:  'NGN',
        ref:       reference,
        metadata,
        callback: (response: { reference: string }) => {
          // Verify on server
          fetch('/api/billing/verify-payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ reference: response.reference, planId, isTopUp, topUpCoins }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.success) {
                toast({
                  type: 'success',
                  title: isTopUp ? `+${topUpCoins} coins added!` : `Upgraded to ${planId}!`,
                  description: isTopUp ? 'Coins have been added to your balance.' : 'Your plan is now active.',
                })
                router.refresh()
              }
            })
        },
        onClose: () => setPaying(null),
      })

      handler.openIframe()
    } catch (err: any) {
      toast({ type: 'error', title: 'Payment failed', description: err.message })
      setPaying(null)
    }
  }

  const cancelSubscription = async () => {
    if (!confirm('Cancel your subscription? You\'ll keep your current coins until the end of the billing period.')) return
    const res = await fetch('/api/billing/cancel', { method: 'POST' })
    if (res.ok) {
      toast({ type: 'success', title: 'Subscription cancelled', description: 'You\'ll have access until your billing period ends.' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
        <RefreshCw className="h-8 w-8 text-white/20 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: NAVY }}>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">

        {/* ── Header ─────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-black text-white">Billing & Subscription</h1>
          <p className="mt-1 text-sm text-white/40">Manage your plan, top up coins, and view payment history.</p>
        </div>

        {/* ── Current plan ─────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Current plan</p>
              <p className="mt-1 text-2xl font-black text-white capitalize">{currentPlan.name}</p>
              <p className="mt-0.5 text-sm text-white/50">{currentPlan.priceLabel}/month</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <Coins className="h-5 w-5 text-[#E09818]" />
                <span className="text-2xl font-black text-[#E09818]">
                  {currentPlan.coins === Infinity ? '∞' : coins.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-white/30 mt-0.5">coins remaining</p>
            </div>
          </div>

          {subscription?.current_period_end && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <Shield className="h-4 w-4 text-white/30 shrink-0" />
              <p className="text-xs text-white/50">
                {subscription.status === 'active' ? 'Renews' : 'Access until'}{' '}
                {new Date(subscription.current_period_end).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {subscription.status === 'active' && currentPlanId !== 'free' && (
                <button onClick={cancelSubscription} className="ml-auto text-xs text-red-400/60 hover:text-red-400">
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Upgrade plans ────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Plans</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['starter', 'growth', 'premium'] as PlanId[]).map((planId) => {
              const plan    = PLANS[planId]
              const isCurrent = planId === currentPlanId
              const isPopular = planId === 'growth'

              return (
                <motion.div
                  key={planId}
                  className={`relative rounded-2xl border p-5 ${
                    isCurrent
                      ? 'border-[#E09818]/50 bg-[#E09818]/5'
                      : isPopular
                        ? 'border-white/20 bg-white/5'
                        : 'border-white/10 bg-white/3'
                  }`}
                >
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-2 left-4 rounded-full bg-[#E09818] px-3 py-0.5 text-[10px] font-black text-[#0B1F3A]">
                      MOST POPULAR
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-2 right-4 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold text-white">
                      CURRENT
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-base font-black text-white capitalize">{plan.name}</p>
                      <p className="text-[#E09818] font-bold">{plan.priceLabel}/mo</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">{plan.coins}</p>
                      <p className="text-xs text-white/30">coins</p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {PLAN_FEATURES[planId]?.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isCurrent && initializePaystack(planId, plan.price)}
                    disabled={isCurrent || paying === planId}
                    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
                      isCurrent
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : isPopular
                          ? 'bg-[#E09818] text-[#0B1F3A] hover:opacity-90'
                          : 'border border-white/10 text-white/70 hover:bg-white/10'
                    } disabled:opacity-50`}
                  >
                    {paying === planId ? 'Opening payment…' : isCurrent ? 'Current plan' : `Upgrade to ${plan.name}`}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Top-up packs ─────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Top-Up Packs <span className="text-white/25 font-normal">(buy extra coins any time)</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TOPUP_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => initializePaystack(pack.id, pack.price, true, pack.coins)}
                disabled={paying === pack.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center hover:border-[#E09818]/40 hover:bg-[#E09818]/5 transition-all active:scale-[0.97]"
              >
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-[#E09818] mb-1">
                  <Coins className="h-5 w-5" />
                  {pack.coins.toLocaleString()}
                </div>
                <p className="text-sm font-bold text-white">{pack.priceLabel}</p>
                <p className="text-[10px] text-white/30 mt-0.5">₦{(pack.price / pack.coins).toFixed(1)}/coin</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent transactions ────────────────── */}
        {transactions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recent Transactions</h2>
              <button
                onClick={() => router.push('/coins')}
                className="text-xs text-[#E09818] hover:opacity-80"
              >
                View all →
              </button>
            </div>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              {transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-white/5' : ''}`}
                >
                  <div>
                    <p className="text-sm text-white">{tx.description || tx.type}</p>
                    <p className="text-xs text-white/30">
                      {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white/50'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} coins
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Enterprise CTA ─────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Need Enterprise?</p>
            <p className="text-xs text-white/40 mt-0.5">Unlimited coins, team members, custom onboarding — ₦180,000/month</p>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=Hi, I'm interested in Cerebre Plus Enterprise`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            Contact us <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

      </div>
    </div>
  )
}
