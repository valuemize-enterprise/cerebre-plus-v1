'use client'
// /app/(dashboard)/referral/page.tsx
// Referral programme — earn 100 coins per converted referral.
import React, { useState, useEffect } from 'react'
import { motion }   from 'framer-motion'
import { Copy, Check, Share2, Users, Coins, MessageCircle, Gift, Trophy } from 'lucide-react'
import { useUser }  from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

const NAVY    = '#0B1F3A'
const GOLD    = '#E09818'
const REWARD  = 100

export default function ReferralPage() {
  const { user, profile } = useUser()
  const { toast }  = useToast()
  const [referralData, setReferralData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    fetch('/api/referral')
      .then((r) => r.json())
      .then((d) => { setReferralData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const referralLink = referralData?.link || `${process.env.NEXT_PUBLIC_APP_URL}/waitlist?ref=${user?.id?.slice(0, 8)}`

  const copy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast({ type: 'success', title: 'Link copied!', description: 'Share it with your network.' })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `I've been using Cerebre Plus — Africa's AI marketing platform — and it's changed how I do my marketing.\n\nGet started free here: ${referralLink}\n\nWhen you subscribe, I earn coins too 😄`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: NAVY }}>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">

        <div>
          <h1 className="text-2xl font-black text-white">Referral Programme</h1>
          <p className="mt-1 text-sm text-white/40">
            Earn {REWARD} Cerebre Coins for every person you refer who subscribes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Referrals sent',     value: referralData?.total || 0,     icon: <Users className="h-4 w-4" /> },
            { label: 'Converted',          value: referralData?.converted || 0,  icon: <Trophy className="h-4 w-4" /> },
            { label: 'Coins earned',       value: (referralData?.converted || 0) * REWARD, icon: <Coins className="h-4 w-4" /> },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="flex justify-center mb-1" style={{ color: GOLD }}>{s.icon}</div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className="rounded-2xl border border-[#E09818]/20 bg-[#E09818]/5 p-5">
          <p className="text-sm font-semibold text-[#E09818] mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4" /> Your referral link
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="flex-1 text-sm text-white/70 truncate">{referralLink}</p>
            <button
              onClick={copy}
              className={`shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#E09818]/20 text-[#E09818] hover:bg-[#E09818]/30'
              }`}
            >
              {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 py-3 text-sm font-bold text-[#25D366] hover:bg-[#25D366]/25"
            >
              <MessageCircle className="h-4 w-4" /> Share on WhatsApp
            </button>
            <button
              onClick={copy}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/60 hover:bg-white/5"
            >
              <Share2 className="h-4 w-4" /> Copy link
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">How it works</h3>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Share your referral link via WhatsApp, Instagram, or email' },
              { step: '2', text: 'Your contact signs up and subscribes to any paid plan' },
              { step: '3', text: `You automatically receive ${REWARD} Cerebre Coins — no action needed` },
              { step: '4', text: 'No limit on referrals — refer 10 people, earn 1,000 coins' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-[#0B1F3A]" style={{ background: GOLD }}>
                  {item.step}
                </div>
                <p className="text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent referrals */}
        {(referralData?.referrals || []).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Your referrals</h3>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              {referralData.referrals.map((r: any, i: number) => (
                <div key={r.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                  <div>
                    <p className="text-sm text-white">{r.referred_email}</p>
                    <p className="text-xs text-white/30">{new Date(r.created_at).toLocaleDateString('en-NG')}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.status === 'converted' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/30'
                  }`}>
                    {r.status === 'converted' ? `+${REWARD} coins` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
