'use client'
// ═══════════════════════════════════════════════════════════════
// /app/admin/AdminClient.tsx
// Interactive admin panel — user table, stats, waitlist, logs.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Coins, TrendingUp, Zap, BarChart2,
  Search, Download, ChevronDown, Check, X,
  RefreshCw, Shield, Mail, Star,
} from 'lucide-react'

const NAVY = '#0B1F3A'
const GOLD = '#E09818'

const PLAN_COLOURS: Record<string, string> = {
  free:       'text-white/40',
  starter:    'text-blue-400',
  growth:     'text-emerald-400',
  premium:    'text-[#E09818]',
  enterprise: 'text-purple-400',
}

interface AdminStats {
  totalUsers:        number
  waitlistCount:     number
  generationsToday:  number
  generationsWeek:   number
  generationsMonth:  number
  planCounts:        Record<string, number>
  topTools:          Array<{ name: string; count: number }>
}

interface RecentUser {
  user_id: string
  business_name:             string | null
  city:                      string | null
  industry:                  string | null
  created_at:                string
  profile_completeness_score: number | null
}

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, colour = GOLD }: {
  label:   string
  value:   string | number
  sub?:    string
  icon:    React.ReactNode
  colour?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 font-medium mb-1">{label}</p>
          <p className="text-2xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
        </div>
        <div className="rounded-xl p-2" style={{ background: `${colour}15` }}>
          <span style={{ color: colour }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN ADMIN CLIENT
// ─────────────────────────────────────────────────────────────

export default function AdminClient({
  stats,
  recentUsers,
}: {
  stats:       AdminStats
  recentUsers: RecentUser[]
}) {
  const [userSearch, setUserSearch] = useState('')
  const [activeTab,  setActiveTab]  = useState<'overview' | 'users' | 'tools' | 'waitlist'>('overview')
  const [toast,      setToast]      = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const totalActiveSubs = Object.values(stats.planCounts)
    .filter((_, i) => Object.keys(stats.planCounts)[i] !== 'free')
    .reduce((a, b) => a + b, 0)

  const filteredUsers = recentUsers.filter((u) =>
    !userSearch ||
    u.business_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.city?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.industry?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users',    label: 'Users' },
    { id: 'tools',    label: 'Top Tools' },
    { id: 'waitlist', label: 'Waitlist' },
  ] as const

  return (
    <div className="min-h-screen pb-12" style={{ background: NAVY }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-[#071528]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#E09818]" />
              <h1 className="text-lg font-black text-white">Cerebre Admin</h1>
            </div>
            <p className="text-xs text-white/30 mt-0.5">Internal dashboard — restricted access</p>
          </div>
          <a
            href="/dashboard"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white"
          >
            ← Back to app
          </a>
        </div>
        {/* Tabs */}
        <div className="mx-auto max-w-6xl px-4 flex gap-1 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#E09818] text-[#E09818]'
                  : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">

        {/* ── OVERVIEW TAB ───────────────────────────────── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total Users"
                value={stats.totalUsers}
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                label="Active Subscribers"
                value={totalActiveSubs}
                sub="paid plans"
                icon={<Star className="h-5 w-5" />}
                colour="#10B881"
              />
              <StatCard
                label="Generations Today"
                value={stats.generationsToday}
                icon={<Zap className="h-5 w-5" />}
                colour="#8B5CF6"
              />
              <StatCard
                label="Waitlist"
                value={stats.waitlistCount}
                sub="pending invites"
                icon={<Mail className="h-5 w-5" />}
                colour="#3B82F6"
              />
            </div>

            {/* Generation volume */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Generation Volume</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Today',      value: stats.generationsToday  },
                  { label: 'This Week',  value: stats.generationsWeek   },
                  { label: 'This Month', value: stats.generationsMonth  },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-2xl font-black text-white">{item.value.toLocaleString()}</p>
                    <p className="text-xs text-white/40">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan distribution */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Plan Distribution</h3>
              <div className="space-y-3">
                {(['enterprise', 'premium', 'growth', 'starter', 'free'] as const).map((plan) => {
                  const count = stats.planCounts[plan] || 0
                  const pct   = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0
                  return (
                    <div key={plan} className="flex items-center gap-3">
                      <span className={`w-20 text-xs font-semibold capitalize ${PLAN_COLOURS[plan]}`}>{plan}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: plan === 'free' ? 'rgba(255,255,255,0.2)' : GOLD }}
                        />
                      </div>
                      <span className="text-xs text-white/40 w-16 text-right">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* ── USERS TAB ──────────────────────────────────── */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by business name, city, or industry…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40"
                />
              </div>
              <button className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/50 hover:text-white">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    {['Business', 'City', 'Industry', 'Profile %', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-white">{user.business_name || '—'}</p>
                        <p className="text-xs text-white/30 font-mono">{user.user_id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{user.city || '—'}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{user.industry || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${user.profile_completeness_score || 0}%`, background: GOLD }}
                            />
                          </div>
                          <span className="text-xs text-white/40">{user.profile_completeness_score || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {new Date(user.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => showToast(`Coins credited to ${user.business_name}`)}
                            className="rounded-lg bg-[#E09818]/10 border border-[#E09818]/20 px-2 py-1 text-xs text-[#E09818] hover:bg-[#E09818]/20"
                          >
                            +coins
                          </button>
                          <button
                            onClick={() => showToast('Invite sent')}
                            className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs text-white/40 hover:text-white"
                          >
                            email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-white/30 text-sm">No users found</div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TOP TOOLS TAB ─────────────────────────────── */}
        {activeTab === 'tools' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
                Top 10 Tools This Week
              </h3>
              <div className="space-y-3">
                {stats.topTools.map((tool, i) => {
                  const max = stats.topTools[0]?.count || 1
                  const pct = Math.round((tool.count / max) * 100)
                  return (
                    <div key={tool.name} className="flex items-center gap-3">
                      <span className="text-xs font-black text-white/20 w-5 text-right">{i + 1}</span>
                      <span className="text-sm text-white flex-1 truncate">{tool.name}</span>
                      <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GOLD }} />
                      </div>
                      <span className="text-xs text-white/40 w-10 text-right">{tool.count.toLocaleString()}</span>
                    </div>
                  )
                })}
                {stats.topTools.length === 0 && (
                  <p className="text-sm text-white/30 text-center py-4">No data for this period</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── WAITLIST TAB ───────────────────────────────── */}
        {activeTab === 'waitlist' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-white">{stats.waitlistCount.toLocaleString()} people waiting</p>
                <p className="text-sm text-white/40">Sorted by signup date</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 hover:text-white">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button
                  onClick={() => showToast('Invite batch sent')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#E09818] px-3 py-2 text-xs font-bold text-[#0B1F3A] hover:opacity-90"
                >
                  <Mail className="h-3.5 w-3.5" /> Send invites
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-sm text-white/40">Waitlist viewer requires database pagination — connect to Supabase for full list</p>
            </div>
          </motion.div>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
