'use client'
// /app/(dashboard)/settings/page.tsx
import React, { useState, useEffect } from 'react'
import { useRouter }  from 'next/navigation'
import { motion }     from 'framer-motion'
import { Bell, MessageCircle, Mail, Shield, Trash2, LogOut, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useUser }   from '@/lib/hooks/useUser'
import { useToast }  from '@/components/ui/ModalToastSelect'

const NAVY = '#0B1F3A'

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${on ? 'bg-[#E09818]' : 'bg-white/20'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { user }  = useUser()
  const { toast } = useToast()
  const router    = useRouter()
  const supabase  = createBrowserClient()

  const [prefs, setPrefs] = useState({
    weekly_pulse_email:     true,
    weekly_pulse_whatsapp:  false,
    low_coins_notification:  true,
    milestone_notification:  true,
    marketing_emails:        true,
  })
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then((r) => r.json())
      .then((d) => d.preferences && setPrefs(d.preferences))
      .catch(() => {})
  }, [])

  const savePrefs = async () => {
    setSaving(true)
    const res = await fetch('/api/notifications/preferences', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(prefs),
    })
    setSaving(false)
    if (res.ok) toast({ type: 'success', title: 'Settings saved' })
    else        toast({ type: 'error',   title: 'Save failed' })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const deleteAccount = async () => {
    if (!confirm('This will permanently delete your account and all data. This cannot be undone. Continue?')) return
    setDeleting(true)
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      await supabase.auth.signOut()
      router.push('/demo')
    } else {
      toast({ type: 'error', title: 'Delete failed', description: 'Please contact support.' })
      setDeleting(false)
    }
  }

  const NOTIFICATION_SETTINGS = [
    { key: 'weekly_pulse_email',     icon: <Mail className="h-4 w-4" />,          label: 'Weekly Pulse via email',       desc: 'Your Monday marketing performance report' },
    { key: 'weekly_pulse_whatsapp',  icon: <MessageCircle className="h-4 w-4" />, label: 'Weekly Pulse via WhatsApp',    desc: 'Receive your weekly report on WhatsApp' },
    { key: 'low_coins_notification', icon: <Bell className="h-4 w-4" />,          label: 'Low coins warning',            desc: 'Notified when balance drops below 20 coins' },
    { key: 'milestone_notification', icon: <CheckCircle2 className="h-4 w-4" />,  label: 'Milestone celebrations',       desc: 'Celebrate your first generation, 10th, 50th…' },
    { key: 'marketing_emails',       icon: <Mail className="h-4 w-4" />,          label: 'Product updates & tips email', desc: 'Nigerian market insights and feature announcements' },
  ]

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: NAVY }}>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">

        <div>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="mt-1 text-sm text-white/40">Manage your account and notification preferences.</p>
        </div>

        {/* Account */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-white">Email address</p>
                <p className="text-xs text-white/40">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <button
              onClick={() => router.push('/profile')}
              className="flex w-full items-center justify-between py-2 text-sm text-white/70 hover:text-white"
            >
              Edit business profile <ChevronRightIcon />
            </button>
            <div className="h-px bg-white/5" />
            <button
              onClick={() => router.push('/billing')}
              className="flex w-full items-center justify-between py-2 text-sm text-white/70 hover:text-white"
            >
              Manage subscription & billing <ChevronRightIcon />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Notifications</h2>
          <div className="space-y-4">
            {NOTIFICATION_SETTINGS.map((s, i) => (
              <div key={s.key}>
                {i > 0 && <div className="h-px bg-white/5 mb-4" />}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-white/30">{s.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.label}</p>
                      <p className="text-xs text-white/40">{s.desc}</p>
                    </div>
                  </div>
                  <Toggle
                    on={prefs[s.key as keyof typeof prefs]}
                    onChange={(v) => setPrefs((p) => ({ ...p, [s.key]: v }))}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={savePrefs}
            disabled={saving}
            className="mt-5 w-full rounded-xl bg-[#E09818] py-3 text-sm font-bold text-[#0B1F3A] hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save notification settings'}
          </button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <h2 className="text-sm font-semibold text-red-400/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" /> Danger zone
          </h2>
          <div className="space-y-3">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" /> Sign out 
            </button>
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="flex w-full items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting account…' : 'Delete account permanently'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
