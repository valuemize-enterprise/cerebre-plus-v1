'use client'
// /app/(dashboard)/settings/page.tsx
// Notification preferences + account danger zone.
// Preferences are stored in profiles.notification_preferences (JSONB).

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Mail, MessageCircle, Trophy, TrendingUp, Users, LogOut, Trash2, Shield, Zap } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useUser }  from '@/lib/hooks/useUser'
import { useToast } from '@/components/ui/ModalToastSelect'

// ── Design tokens ─────────────────────────────────────────────
const NAVY  = '#0B1F3A'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const CORAL = '#E84830'
const DIM   = 'rgba(205,217,236,0.6)'
const MUTED = 'rgba(205,217,236,0.35)'

// ── Default preferences ───────────────────────────────────────
const DEFAULT_PREFS = {
  weekly_pulse_email:      true,
  weekly_pulse_whatsapp:   false,
  low_coins_warning:       true,
  milestone_notifications: true,
  referral_updates:        true,
  sme_club_updates:        true,    // Growth plan users only
  marketing_emails:        true,
}

type Prefs = typeof DEFAULT_PREFS

// ─────────────────────────────────────────────────────────────
// TOGGLE COMPONENT
// ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      style={{
        position: 'relative', display: 'inline-flex', height: 24, width: 44,
        alignItems: 'center', borderRadius: 12, border: 'none',
        background: disabled ? 'rgba(255,255,255,0.1)' : on ? GOLD : 'rgba(255,255,255,0.18)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
        transition: 'background .2s', flexShrink: 0,
      }}
    >
      <span style={{ position: 'absolute', left: on ? 22 : 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, body, confirmLabel, confirmColor, onConfirm, onCancel, confirmInput }: {
  open:          boolean
  title:         string
  body:          string
  confirmLabel:  string
  confirmColor:  string
  onConfirm:     () => void
  onCancel:      () => void
  confirmInput?: string     // if set, user must type this text to confirm
}) {
  const [inputVal, setInputVal] = useState('')
  const canConfirm = !confirmInput || inputVal === confirmInput

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D2040', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '28px 26px', maxWidth: 400, width: '100%' }}>
        <h3 style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 700, color: '#EBF2FC', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: DIM, lineHeight: 1.6, marginBottom: 20 }}>{body}</p>
        {confirmInput && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>
              Type <strong style={{ color: '#EBF2FC' }}>{confirmInput}</strong> to confirm:
            </p>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={confirmInput}
              style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '10px 14px', color: '#EBF2FC', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#EBF2FC', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!canConfirm} style={{ flex: 1, padding: '11px', borderRadius: 10, background: canConfirm ? confirmColor : 'rgba(255,255,255,0.06)', border: 'none', color: canConfirm ? '#fff' : MUTED, fontWeight: 800, fontSize: 14, cursor: canConfirm ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all .2s' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, profile } = useUser()
  const { toast }  = useToast()
  const router     = useRouter()
  const supabase   = createBrowserClient()
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [prefs,       setPrefs]       = useState<Prefs>(DEFAULT_PREFS)
  const [saving,      setSaving]      = useState(false)
  const [showSignOut, setShowSignOut] = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)
  const [deleting,    setDeleting]    = useState(false)

  const isGrowth = (profile as any)?.subscription_tier === 'growth'

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.preferences && setPrefs({ ...DEFAULT_PREFS, ...d.preferences }))
      .catch(() => {})
  }, [])

  // Auto-save on pref change (debounced 800ms)
  const savePrefs = useCallback(async (updated: Prefs) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      try {
        const res = await fetch('/api/notifications/preferences', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
        if (res.ok) toast({ type: 'success', title: 'Preferences saved' })
        else        toast({ type: 'error',   title: 'Failed to save' })
      } finally {
        setSaving(false)
      }
    }, 800)
  }, [toast])

  const toggle = (key: keyof Prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    savePrefs(updated)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (res.ok) {
        await supabase.auth.signOut()
        router.push('/login?deleted=true')
      } else {
        toast({ type: 'error', title: 'Could not delete account', description: 'Please contact support via WhatsApp.' })
      }
    } finally {
      setDeleting(false)
      setShowDelete(false)
    }
  }

  const NOTIFICATION_GROUPS = [
    {
      group: 'Performance & Reports',
      icon: <TrendingUp className="h-4 w-4" />,
      items: [
        {
          key:  'weekly_pulse_email'   as keyof Prefs,
          icon: <Mail className="h-4 w-4" />,
          title: 'Weekly Pulse (email)',
          desc:  'Your weekly marketing performance summary, every Monday morning.',
        },
        {
          key:  'weekly_pulse_whatsapp' as keyof Prefs,
          icon: <MessageCircle className="h-4 w-4" />,
          title: 'Weekly Pulse (WhatsApp)',
          desc:  'Same summary sent to your WhatsApp. Toggle off if email is enough.',
        },
      ],
    },
    {
      group: 'Account Alerts',
      icon: <Bell className="h-4 w-4" />,
      items: [
        {
          key:  'low_coins_warning'     as keyof Prefs,
          icon: <Zap className="h-4 w-4" />,
          title: 'Low coins warning',
          desc:  'Get a heads-up when your coin balance drops below 20% of your plan allocation.',
        },
        {
          key:  'milestone_notifications' as keyof Prefs,
          icon: <Trophy className="h-4 w-4" />,
          title: 'Milestone notifications',
          desc:  'Celebrate wins — first strategy, 10 generations, first referral.',
        },
        {
          key:  'referral_updates'      as keyof Prefs,
          icon: <Users className="h-4 w-4" />,
          title: 'Referral updates',
          desc:  'Be notified when someone you referred converts to a paying subscriber.',
        },
      ],
    },
    {
      group: 'SME Club & Community',
      icon: <Shield className="h-4 w-4" />,
      growthOnly: true,
      items: [
        {
          key:  'sme_club_updates'      as keyof Prefs,
          icon: <MessageCircle className="h-4 w-4" />,
          title: 'SME Club updates',
          desc:  'New masterclass drops, community highlights, and Insider newsletter.',
          growthOnly: true,
        },
      ],
    },
    {
      group: 'Marketing',
      icon: <Mail className="h-4 w-4" />,
      items: [
        {
          key:  'marketing_emails'      as keyof Prefs,
          icon: <Mail className="h-4 w-4" />,
          title: 'Marketing emails',
          desc:  'New tool announcements, tips, and platform updates. No spam — ever.',
        },
      ],
    },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 96, background: NAVY }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px clamp(16px,4%,32px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: '#fff' }}>Settings</h1>
            {saving && <span style={{ fontSize: 12, color: MUTED }}>Saving…</span>}
          </div>
          <p style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>
            Control your notification preferences and account settings.
          </p>
        </div>

        {/* Notification groups */}
        {NOTIFICATION_GROUPS.map(group => {
          const locked = group.growthOnly && !isGrowth
          return (
            <div key={group.group} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
              {/* Group header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: GL }}>{group.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#EBF2FC' }}>{group.group}</span>
                {locked && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: `${GOLD}18`, border: `1px solid ${GOLD}28`, color: GL, padding: '2px 8px', borderRadius: 20 }}>
                    Growth plan only
                  </span>
                )}
              </div>
              {/* Items */}
              {group.items.map((item, i) => {
                const isLocked = (item as any).growthOnly && !isGrowth
                return (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', opacity: isLocked ? .5 : 1 }}>
                    <span style={{ color: MUTED, marginTop: 2 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EBF2FC', marginBottom: 3 }}>{item.title}</p>
                      <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>{item.desc}</p>
                      {isLocked && <p style={{ fontSize: 11.5, color: GL, marginTop: 5 }}>Upgrade to Growth to enable this →</p>}
                    </div>
                    <Toggle on={prefs[item.key]} onChange={() => !isLocked && toggle(item.key)} disabled={isLocked} />
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Danger zone */}
        <div style={{ marginTop: 32, background: 'rgba(232,72,48,0.04)', border: '1px solid rgba(232,72,48,0.18)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(232,72,48,0.12)', background: 'rgba(232,72,48,0.04)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: CORAL }}>Danger zone</p>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Sign out */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EBF2FC', marginBottom: 3 }}>Sign out</p>
                <p style={{ fontSize: 12.5, color: MUTED }}>Log out of Cerebre Plus on this device.</p>
              </div>
              <button
                onClick={() => setShowSignOut(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#EBF2FC', fontWeight: 700, fontSize: 13, padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>

            <div style={{ height: 1, background: 'rgba(232,72,48,0.12)' }} />

            {/* Delete account */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: CORAL, marginBottom: 3 }}>Delete account</p>
                <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>
                  Permanently deletes your account, all outputs, and subscription data. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDelete(true)}
                disabled={deleting}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(232,72,48,0.1)', border: '1px solid rgba(232,72,48,0.28)', color: CORAL, fontWeight: 700, fontSize: 13, padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: deleting ? .6 : 1 }}
              >
                <Trash2 className="h-4 w-4" /> Delete account
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={showSignOut}
        title="Sign out of Cerebre Plus?"
        body="You'll need to log in again to access your dashboard and tools. Your data is safe."
        confirmLabel="Sign out"
        confirmColor="#4A5568"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOut(false)}
      />
      <ConfirmDialog
        open={showDelete}
        title="Delete your account permanently?"
        body="This will delete all your data, history, saved outputs, referrals, and cancel your subscription. This action cannot be reversed."
        confirmLabel={deleting ? 'Deleting…' : 'Yes, delete everything'}
        confirmColor={CORAL}
        confirmInput="DELETE"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
