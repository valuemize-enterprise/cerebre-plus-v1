'use client'
// /app/cerebre-admin/team/page.tsx
// Admin team management — Super Admin can add members, assign roles, customise
// permissions, suspend access, and view a full capability matrix.

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ShieldCheck, UserPlus, RefreshCw, X, Check, ChevronDown,
  Mail, Clock, Activity, Eye, EyeOff, Shield, AlertTriangle,
  Search, Filter, MoreVertical, User, Zap,
} from 'lucide-react'
import {
  ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS, ROLE_USE_CASES,
  CAPABILITY_MATRIX, ROLE_PERMISSIONS,
  type AdminRole, type Permission,
} from '@/lib/admin/permissions'


type AdminRoleWithSuperAdmin = AdminRole | 'super_admin'

// ── Tokens ─────────────────────────────────────────────────────
const VOID = '#06080E', N2 = '#0D2040', GOLD = '#E09818', GL = '#F5B830'
const TEAL = '#12D4B4', W = '#EBF2FC', DIM = 'rgba(205,217,236,0.65)'
const MUTED = 'rgba(205,217,236,0.35)', B = 'rgba(255,255,255,0.08)'
const FAINT = 'rgba(255,255,255,0.04)', GREEN = '#22C55E', RED = '#EF4444'

const ALL_ROLES: AdminRoleWithSuperAdmin[] = ['super_admin', 'admin', 'content_manager', 'support', 'analyst']

// ── Role badge ─────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role as AdminRole] || MUTED
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${c}18`, color: c, whiteSpace: 'nowrap' }}>
      {ROLE_LABELS[role as AdminRole] || role}
    </span>
  )
}

// ── Status badge ───────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: active ? GREEN : RED }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? GREEN : RED }} />
      {active ? 'Active' : 'Suspended'}
    </span>
  )
}

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({ name, role }: { name: string; role: string }) {
  const c = ROLE_COLORS[role as AdminRole] || MUTED
  return (
    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${c}20`, border: `1.5px solid ${c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Georgia',serif", fontWeight: 900, color: c, fontSize: 15, flexShrink: 0 }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

// ── Capability matrix modal ────────────────────────────────────
function CapabilityMatrixModal({ onClose }: { onClose: () => void }) {
  const categories = [...new Set(CAPABILITY_MATRIX.map(c => c.category))]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 18, width: '100%', maxWidth: 920, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${B}` }}>
          <div>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 18, fontWeight: 900, color: W, margin: 0 }}>Role Capability Matrix</h2>
            <p style={{ fontSize: 12.5, color: MUTED, margin: '4px 0 0' }}>What each role can see and do inside the admin console</p>
          </div>
          <button onClick={onClose} style={{ background: FAINT, border: `1px solid ${B}`, borderRadius: 8, cursor: 'pointer', color: MUTED, padding: 8, lineHeight: 0 }}><X size={16} /></button>
        </div>

        {/* Table */}
        <div style={{ overflowY: 'auto', padding: '0 22px 22px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 12px 8px 0', width: 240 }}>
                  Capability
                </th>
                {ALL_ROLES.map(r => (
                  <th key={r} style={{ textAlign: 'center', padding: '8px 8px', minWidth: 80 }}>
                    <RoleBadge role={r} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <React.Fragment key={cat}>
                  <tr>
                    <td colSpan={ALL_ROLES.length + 1} style={{ padding: '14px 0 6px', fontSize: 10.5, fontWeight: 800, color: TEAL, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                      {cat}
                    </td>
                  </tr>
                  {CAPABILITY_MATRIX.filter(c => c.category === cat).map(cap => (
                    <tr key={cap.permission} style={{ borderBottom: `1px solid ${FAINT}` }}>
                      <td style={{ padding: '9px 12px 9px 0', fontSize: 12.5, color: DIM }}>{cap.capability}</td>
                      {ALL_ROLES.map(r => {
                        const has = ROLE_PERMISSIONS[r]?.includes(cap.permission as Permission)
                        return (
                          <td key={r} style={{ textAlign: 'center', padding: '9px 8px' }}>
                            {has
                              ? <Check size={15} style={{ color: GREEN }} />
                              : <X size={14} style={{ color: 'rgba(239,68,68,0.35)' }} />
                            }
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Add member modal ───────────────────────────────────────────
function AddMemberModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<AdminRole>('support')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'confirm'>('form')

  const roleColor = ROLE_COLORS[role]

  const submit = async () => {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', email: email.trim(), name: name.trim(), role }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invite failed')
      onSuccess(data.message || `${email} added as ${ROLE_LABELS[role]}`)
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 18, width: '100%', maxWidth: 560, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${B}` }}>
          <div>
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 18, fontWeight: 900, color: W, margin: 0 }}>Add Admin Team Member</h2>
            <p style={{ fontSize: 12, color: MUTED, margin: '4px 0 0' }}>The person must already have a Cerebre Plus account</p>
          </div>
          <button onClick={onClose} style={{ background: FAINT, border: `1px solid ${B}`, borderRadius: 8, cursor: 'pointer', color: MUTED, padding: 8, lineHeight: 0 }}><X size={16} /></button>
        </div>

        <div style={{ padding: '22px' }}>
          {/* Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Full name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amara Okafor"
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${B}`, borderRadius: 10, color: W, fontFamily: 'inherit', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Email address *</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="amara@cerebre.com" type="email"
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${B}`, borderRadius: 10, color: W, fontFamily: 'inherit', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Role selector */}
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Assign role *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {([...
              ALL_ROLES.filter(r => r !== 'super_admin'),
              'super_admin'
            ] as AdminRole[]).map(r => {
              const selected = role === r
              const c = ROLE_COLORS[r]
              const isSuperAdmin = r === 'super_admin'
              return (
                <button key={r} onClick={() => setRole(r)} type="button"
                  style={{ padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${selected ? c + '60' : B}`, background: selected ? `${c}10` : FAINT, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selected ? <Check size={14} style={{ color: c }} /> : <div style={{ width: 14 }} />}
                      <RoleBadge role={r} />
                      {isSuperAdmin && <span style={{ fontSize: 9.5, color: RED, fontWeight: 700, letterSpacing: '0.5px' }}>⚠ Full access</span>}
                    </div>
                    <p style={{ fontSize: 10.5, color: MUTED, margin: 0 }}>
                      {ROLE_USE_CASES[r]?.slice(0, 2).join(' · ')}
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: selected ? DIM : MUTED, margin: '0 0 0 22px', lineHeight: 1.5 }}>
                    {ROLE_DESCRIPTIONS[r]}
                  </p>
                </button>
              )
            })}
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, fontSize: 13, color: '#FCA5A5', marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: 10, background: FAINT, border: `1px solid ${B}`, color: MUTED, fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={submit} disabled={!email.trim() || !name.trim() || saving}
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 10, fontFamily: 'inherit', fontWeight: 800, fontSize: 13.5, cursor: (!email.trim() || !name.trim() || saving) ? 'not-allowed' : 'pointer', background: (!email.trim() || !name.trim() || saving) ? FAINT : `${roleColor}20`, border: `1px solid ${(!email.trim() || !name.trim() || saving) ? B : roleColor + '50'}`, color: (!email.trim() || !name.trim() || saving) ? MUTED : roleColor }}>
              {saving ? <><RefreshCw size={13} style={{ animation: 'admin-spin 0.8s linear infinite' }} />Adding…</> : <><UserPlus size={14} />Add {ROLE_LABELS[role]}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Member action menu ─────────────────────────────────────────
function MemberMenu({ member, currentAdminId, onAction }: { member: any; currentAdminId: string; onAction: (action: string, data: any) => void }) {
  const [open, setOpen] = useState(false)
  const [selRole, setSelRole] = useState<AdminRole>(member.role)
  const [view, setView] = useState<'main' | 'role'>('main')
  const isSelf = member.id === currentAdminId

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(!open); setView('main') }}
        style={{ background: FAINT, border: `1px solid ${B}`, borderRadius: 8, cursor: 'pointer', color: MUTED, padding: '6px 8px', lineHeight: 0 }}>
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
          <div style={{ position: 'absolute', right: 0, top: 36, width: 220, background: '#0F1E38', border: `1px solid ${B}`, borderRadius: 12, zIndex: 99, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {view === 'main' && (
              <>
                <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${B}` }}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: W, margin: 0 }}>{member.name}</p>
                  <p style={{ fontSize: 10.5, color: MUTED, margin: '2px 0 0' }}>{member.email}</p>
                </div>
                {[
                  { label: 'View activity', icon: <Activity size={13} />, action: 'view_activity' },
                  { label: 'Change role', icon: <Shield size={13} />, action: 'change_role', disabled: isSelf },
                  { label: 'Send email', icon: <Mail size={13} />, action: 'email' },
                  null,
                  member.is_active
                    ? { label: 'Suspend access', icon: <EyeOff size={13} />, action: 'deactivate', color: RED, disabled: isSelf }
                    : { label: 'Restore access', icon: <Eye size={13} />, action: 'reactivate', color: GREEN },
                ].map((item, i) =>
                  item === null ? (
                    <div key={i} style={{ borderTop: `1px solid ${B}` }} />
                  ) : (
                    <button key={i} disabled={item.disabled}
                      onClick={() => { if (item.action === 'change_role') { setView('role'); return } setOpen(false); onAction(item.action, { memberId: member.id }) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', color: item.disabled ? MUTED : (item.color || DIM), fontSize: 12.5, fontFamily: 'inherit', cursor: item.disabled ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: item.disabled ? 0.5 : 1 }}>
                      {item.icon} {item.label}
                    </button>
                  )
                )}
              </>
            )}

            {view === 'role' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${B}`, cursor: 'pointer' }} onClick={() => setView('main')}>
                  <X size={12} style={{ color: MUTED }} /><span style={{ fontSize: 11.5, color: MUTED }}>Back</span>
                </div>
                <p style={{ fontSize: 11, color: MUTED, padding: '8px 14px 4px', margin: 0 }}>Select new role:</p>
                {ALL_ROLES.map(r => (
                  <button key={r} onClick={() => { setOpen(false); onAction('change_role', { memberId: member.id, role: r }) }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: r === member.role ? `${ROLE_COLORS[r]}12` : 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <RoleBadge role={r} />
                    {r === member.role && <Check size={12} style={{ color: ROLE_COLORS[r] }} />}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Member card ────────────────────────────────────────────────
function MemberCard({ member, currentAdminId, onAction }: { member: any; currentAdminId: string; onAction: (action: string, data: any) => void }) {
  const lastLogin = member.last_login
    ? new Date(member.last_login).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
    : 'Never'

  return (
    <div style={{ background: member.is_active ? N2 : 'rgba(239,68,68,0.04)', border: `1px solid ${member.is_active ? B : 'rgba(239,68,68,0.15)'}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar name={member.name} role={member.role} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: W, margin: 0 }}>{member.name}</p>
            {member.is_self && <span style={{ fontSize: 9.5, color: TEAL, fontWeight: 700, border: `1px solid ${TEAL}40`, padding: '1px 7px', borderRadius: 10 }}>You</span>}
            <RoleBadge role={member.role} />
            <StatusBadge active={member.is_active} />
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, margin: '0 0 8px' }}>{member.email}</p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />Last login: {lastLogin}
            </span>
            <span style={{ fontSize: 11.5, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Activity size={11} />{member.actions_30d} actions (30d)
            </span>
            <span style={{ fontSize: 11.5, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={11} />Added by {member.invited_by_name}
            </span>
          </div>
        </div>

        <MemberMenu member={member} currentAdminId={currentAdminId} onAction={onAction} />
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function AdminTeamPage() {
  const [team, setTeam] = useState<any[]>([])
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all')
  const [search, setSearch] = useState('')

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  const loadTeam = useCallback(async () => {
    setLoading(true)
    try {
      const [teamRes, meRes] = await Promise.all([
        fetch('/api/admin/team', { credentials: 'include' }),
        fetch('/api/admin/auth', { credentials: 'include' }),
      ])
      const teamData = await teamRes.json()
      const meData = await meRes.json()
      setTeam(teamData.team || [])
      setCurrentAdmin(meData)
    } catch { notify('Failed to load team', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadTeam() }, [loadTeam])

  const handleAction = async (action: string, data: any) => {
    if (action === 'view_activity') { notify('Activity log coming soon', 'success'); return }
    if (action === 'email') { notify('Use the Messages page to email this user', 'success'); return }

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_id: data.memberId, role: data.role }),
        credentials: 'include',
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Action failed')
      notify(result.message || 'Done')
      loadTeam()
    } catch (e: any) {
      notify(e.message, 'error')
    }
  }

  // Filtered team
  const filtered = useMemo(() => team.filter(m => {
    if (filter === 'active' && !m.is_active) return false
    if (filter === 'suspended' && m.is_active) return false
    if (roleFilter !== 'all' && m.role !== roleFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [team, filter, roleFilter, search])

  // Stats
  const active = team.filter(m => m.is_active).length
  const suspended = team.filter(m => !m.is_active).length

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <style>{`@keyframes admin-spin{to{transform:rotate(360deg)}}`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 300, padding: '12px 18px', borderRadius: 12, background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, color: toast.type === 'success' ? GREEN : RED, fontSize: 13.5, fontWeight: 600, maxWidth: 380, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onSuccess={msg => { notify(msg); setShowAdd(false); loadTeam() }} />}
      {showMatrix && <CapabilityMatrixModal onClose={() => setShowMatrix(false)} />}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: W, margin: '0 0 5px' }}>Admin Team</h1>
          <p style={{ fontSize: 13.5, color: MUTED, margin: 0 }}>Manage who has access to this console and what they can do</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowMatrix(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: FAINT, border: `1px solid ${B}`, color: MUTED, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Zap size={13} />Role guide
          </button>
          <button onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: `${GOLD}18`, border: `1px solid ${GOLD}45`, color: GL, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <UserPlus size={14} />Add member
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total admins', value: team.length, color: GL },
          { label: 'Active', value: active, color: GREEN },
          { label: 'Suspended', value: suspended, color: RED },
          { label: 'Roles in use', value: new Set(team.map(m => m.role)).size, color: TEAL },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: N2, border: `1px solid ${B}`, borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 900, color, margin: '0 0 4px', fontFamily: "'Georgia',serif" }}>{value}</p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${B}`, borderRadius: 10, color: W, fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Status filter */}
        {(['all', 'active', 'suspended'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 14px', borderRadius: 20, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: filter === f ? `${GOLD}15` : FAINT, border: `1px solid ${filter === f ? GOLD + '40' : B}`, color: filter === f ? GL : MUTED }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        {/* Role filter */}
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
          style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${B}`, borderRadius: 10, color: MUTED, fontFamily: 'inherit', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="all">All roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>

        <button onClick={loadTeam} style={{ padding: '8px 12px', background: FAINT, border: `1px solid ${B}`, borderRadius: 10, cursor: 'pointer', color: MUTED, lineHeight: 0 }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Role breakdown pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {ALL_ROLES.map(r => {
          const count = team.filter(m => m.role === r).length
          if (!count) return null
          return (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: `${ROLE_COLORS[r]}12`, border: `1px solid ${ROLE_COLORS[r]}30` }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: ROLE_COLORS[r] }}>{count}×</span>
              <RoleBadge role={r} />
            </div>
          )
        })}
      </div>

      {/* Team list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'admin-spin .8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: MUTED, fontSize: 13 }}>
          {search || filter !== 'all' || roleFilter !== 'all' ? 'No members match your filters.' : 'No admin team members yet. Add the first one above.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(m => (
            <MemberCard key={m.id} member={m} currentAdminId={currentAdmin?.adminId || ''} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
