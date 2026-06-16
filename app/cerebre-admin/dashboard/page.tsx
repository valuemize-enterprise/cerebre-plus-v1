'use client'
// /app/cerebre-admin/dashboard/page.tsx
// Role-aware dashboard. What you see depends on who you are.
// super_admin / admin  → full platform overview with all KPIs
// content_manager      → SME sessions, broadcasts, content stats
// support              → user growth, recent signups, support queue
// analyst              → read-only charts and conversion metrics

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, TrendingUp, Coins, BookOpen, MessageSquare,
  Star, Activity, AlertCircle, ChevronRight, RefreshCw,
  ShieldCheck, BarChart3, UserPlus, Crown, Brain,
} from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS, hasPermission, type AdminRole } from '@/lib/admin/permissions'

const VOID='#06080E', N2='#0D2040', GOLD='#E09818', GL='#F5B830'
const TEAL='#12D4B4', W='#EBF2FC', DIM='rgba(205,217,236,0.65)'
const MUTED='rgba(205,217,236,0.35)', B='rgba(255,255,255,0.08)', FAINT='rgba(255,255,255,0.04)'
const GREEN='#22C55E', RED='#EF4444'

// ── KPI card ───────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color=GL, href, loading }:{
  icon:React.ReactElement; label:string; value:string|number; sub?:string
  color?:string; href?:string; loading?:boolean
}) {
  const inner = (
    <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:14, padding:'18px 20px', position:'relative', overflow:'hidden', transition:'border-color .18s', cursor:href?'pointer':'default' }}>
      <div style={{ position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'50%', background:`${color}06`, transform:'translate(20px,-20px)' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        {React.cloneElement(icon, { size:16, style:{color, flexShrink:0} } as any)}
        <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>{label}</span>
        {href && <ChevronRight size={11} style={{ marginLeft:'auto', color:MUTED }}/>}
      </div>
      {loading ? (
        <div style={{ height:32, background:FAINT, borderRadius:6, animation:'dash-shimmer 1.5s ease-in-out infinite' }}/>
      ) : (
        <p style={{ fontFamily:"'Georgia',serif", fontSize:28, fontWeight:900, color:W, margin:'0 0 4px' }}>{value}</p>
      )}
      {sub && <p style={{ fontSize:12, color:MUTED, margin:0 }}>{sub}</p>}
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration:'none' }}>{inner}</Link> : inner
}

// ── Activity row ───────────────────────────────────────────────
function ActivityRow({ icon, text, time, color=GL }: { icon:React.ReactElement; text:string; time:string; color?:string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom:`1px solid ${FAINT}` }}>
      <div style={{ width:28, height:28, borderRadius:8, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
        {React.cloneElement(icon, { size:13, style:{color} } as any)}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:12.5, color:DIM, margin:'0 0 2px', lineHeight:1.4 }}>{text}</p>
        <p style={{ fontSize:11, color:MUTED, margin:0 }}>{time}</p>
      </div>
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────
function SectionCard({ title, children, action }: { title:string; children:React.ReactNode; action?:{label:string;href:string} }) {
  return (
    <div style={{ background:N2, border:`1px solid ${B}`, borderRadius:14, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:`1px solid ${B}` }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:W, margin:0 }}>{title}</h3>
        {action && (
          <Link href={action.href} style={{ fontSize:12, color:TEAL, textDecoration:'none', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
            {action.label} <ChevronRight size={12}/>
          </Link>
        )}
      </div>
      <div style={{ padding:'14px 18px' }}>{children}</div>
    </div>
  )
}

// ── Role access summary (shown to every admin) ────────────────
function MyAccessCard({ role }: { role: AdminRole }) {
  const color = ROLE_COLORS[role] || GL
  const perms = [
    { label:'Users',      perm:'view_users'        as const, icon:<Users size={12}/> },
    { label:'Billing',    perm:'view_billing'      as const, icon:<TrendingUp size={12}/> },
    { label:'Coins',      perm:'grant_coins'       as const, icon:<Coins size={12}/> },
    { label:'SME Club',   perm:'view_sme_club'     as const, icon:<Crown size={12}/> },
    { label:'Messages',   perm:'view_messages'     as const, icon:<MessageSquare size={12}/> },
    { label:'Analytics',  perm:'view_ai_insights'  as const, icon:<Brain size={12}/> },
    { label:'Audit Log',  perm:'view_audit_log'    as const, icon:<Activity size={12}/> },
    { label:'Admin Team', perm:'view_admin_team'   as const, icon:<ShieldCheck size={12}/> },
  ]
  return (
    <div style={{ background:N2, border:`1px solid ${color}30`, borderLeft:`3px solid ${color}`, borderRadius:14, padding:'18px 20px', marginBottom:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:`${color}18`, border:`1px solid ${color}35`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ShieldCheck size={16} style={{ color }}/>
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:W, margin:0 }}>
            You are logged in as <span style={{ color }}>&#x202F;{ROLE_LABELS[role]}</span>
          </p>
          <p style={{ fontSize:11.5, color:MUTED, margin:'2px 0 0' }}>{ROLE_DESCRIPTIONS[role]}</p>
        </div>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {perms.map(({ label, perm, icon }) => {
          const can = hasPermission(role, perm)
          return (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:can?`${GREEN}10`:`${RED}08`, border:`1px solid ${can?GREEN+'25':RED+'15'}`, color:can?GREEN:MUTED }}>
              {icon}<span style={{ fontSize:11, fontWeight:600 }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main dashboard ─────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [admin,   setAdmin]   = useState<any>(null)
  const [stats,   setStats]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/auth',      { credentials:'include' }).then(r=>r.json()),
      fetch('/api/admin/dashboard', { credentials:'include' }).then(r=>r.json()),
    ]).then(([me, dash]) => {
      setAdmin(me)
      setStats(dash)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const role   = admin?.role as AdminRole
  const isFull = role === 'super_admin' || role === 'admin'
  const isContent  = role === 'content_manager'
  const isSupport  = role === 'support'
  const isAnalyst  = role === 'analyst'

  const s = stats || {}

  return (
    <div style={{ maxWidth:1100 }}>
      <style>{`
        @keyframes dash-shimmer { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes admin-spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:W, margin:'0 0 4px' }}>
            Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, {admin?.name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p style={{ fontSize:13.5, color:MUTED, margin:0 }}>
            {new Date().toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} · Cerebre Plus Admin Console
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:GREEN }}/>
          <span style={{ fontSize:12, color:GREEN, fontWeight:600 }}>All systems operational</span>
        </div>
      </div>

      {/* Role access summary */}
      {role && <MyAccessCard role={role}/>}

      {/* ── SUPER ADMIN / ADMIN VIEW ──────────────────────────── */}
      {isFull && (
        <>
          {/* KPI row 1 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
            <KpiCard icon={<Users/>}      label="Total users"       value={loading?'…':s.totalUsers||0}        sub={`+${s.newUsersToday||0} today`}   href="/cerebre-admin/users"       loading={loading}/>
            <KpiCard icon={<TrendingUp/>} label="MRR"               value={loading?'…':`₦${(s.mrr||0).toLocaleString()}`} sub="Monthly recurring revenue"                                    loading={loading} color={GREEN}/>
            <KpiCard icon={<Coins/>}      label="Coins issued"      value={loading?'…':(s.coinsIssued30d||0).toLocaleString()} sub="Last 30 days"  href="/cerebre-admin/coins"      loading={loading} color={GL}/>
            <KpiCard icon={<Activity/>}   label="Generations today" value={loading?'…':s.generationsToday||0}  sub="Tool runs"                        href="/cerebre-admin/ai-insights" loading={loading} color={TEAL}/>
          </div>

          {/* KPI row 2 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:24 }}>
            <KpiCard icon={<BookOpen/>}   label="SME sessions"      value={loading?'…':s.smeSessionsTotal||0}  sub={`${s.smeCompletions||0} completions`} href="/cerebre-admin/sme-club"  loading={loading} color="#E1306C"/>
            <KpiCard icon={<Star/>}       label="Satisfaction"      value={loading?'…':`${s.satisfactionPct||0}%`} sub="Tool output rating"           href="/cerebre-admin/ratings"    loading={loading} color={GL}/>
            <KpiCard icon={<UserPlus/>}   label="New signups"       value={loading?'…':s.newUsers7d||0}         sub="Last 7 days"                                                        loading={loading} color={TEAL}/>
            <KpiCard icon={<MessageSquare/>} label="Messages sent"  value={loading?'…':s.messagesSent30d||0}   sub="Last 30 days"                     href="/cerebre-admin/messages"   loading={loading} color="#8B7FFF"/>
          </div>

          {/* Two-column layout */}
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}>
            <SectionCard title="Recent platform activity" action={{ label:'View audit log', href:'/cerebre-admin/logs' }}>
              {loading ? (
                [1,2,3,4].map(i => <div key={i} style={{ height:40, background:FAINT, borderRadius:6, marginBottom:8, animation:'dash-shimmer 1.5s ease-in-out infinite' }}/>)
              ) : s.recentActivity?.length ? (
                s.recentActivity.slice(0,5).map((a:any, i:number) => (
                  <ActivityRow key={i} icon={<Activity/>} text={a.action} time={new Date(a.created_at).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})} color={GL}/>
                ))
              ) : (
                <p style={{ fontSize:13, color:MUTED, textAlign:'center', padding:'16px 0' }}>No recent activity</p>
              )}
            </SectionCard>

            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <SectionCard title="Tool usage today" action={{ label:'View insights', href:'/cerebre-admin/ai-insights' }}>
                {(s.topTools||[]).slice(0,4).map((t:any) => (
                  <div key={t.tool_id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${FAINT}` }}>
                    <span style={{ fontSize:12.5, color:DIM }}>{t.tool_name}</span>
                    <span style={{ fontSize:12.5, fontWeight:700, color:GL }}>{t.count}×</span>
                  </div>
                ))}
                {!s.topTools?.length && !loading && <p style={{ fontSize:12.5, color:MUTED, margin:0 }}>No data yet today</p>}
              </SectionCard>

              <SectionCard title="Admin team" action={{ label:'Manage team', href:'/cerebre-admin/team' }}>
                {(s.adminTeamSummary||[]).slice(0,3).map((a:any) => (
                  <div key={a.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:`${ROLE_COLORS[a.role as AdminRole]||GL}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:ROLE_COLORS[a.role as AdminRole]||GL, flexShrink:0 }}>
                      {a.name?.[0]?.toUpperCase()||'A'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12.5, color:W, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name}</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:`${ROLE_COLORS[a.role as AdminRole]||GL}15`, color:ROLE_COLORS[a.role as AdminRole]||GL }}>
                      {ROLE_LABELS[a.role as AdminRole]||a.role}
                    </span>
                  </div>
                ))}
                {!s.adminTeamSummary?.length && !loading && <p style={{ fontSize:12.5, color:MUTED, margin:0 }}>No team data</p>}
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {/* ── CONTENT MANAGER VIEW ──────────────────────────────── */}
      {isContent && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:24 }}>
            <KpiCard icon={<BookOpen/>}   label="SME sessions"      value={loading?'…':s.smeSessionsTotal||0}  sub="Total published"       href="/cerebre-admin/sme-club" loading={loading} color="#E1306C"/>
            <KpiCard icon={<Users/>}      label="Growth members"    value={loading?'…':s.growthMembers||0}     sub="Access to SME Club"                                    loading={loading} color={TEAL}/>
            <KpiCard icon={<Star/>}       label="Satisfaction"      value={loading?'…':`${s.satisfactionPct||0}%`} sub="Tool output rating"  href="/cerebre-admin/ratings" loading={loading} color={GL}/>
            <KpiCard icon={<MessageSquare/>} label="Broadcasts sent" value={loading?'…':s.messagesSent30d||0}  sub="Last 30 days"          href="/cerebre-admin/messages" loading={loading} color="#8B7FFF"/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <SectionCard title="Recent SME sessions" action={{ label:'Manage sessions', href:'/cerebre-admin/sme-club' }}>
              {(s.recentSmeSessions||[]).slice(0,5).map((sess:any) => (
                <div key={sess.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${FAINT}` }}>
                  <div>
                    <p style={{ fontSize:12.5, color:W, margin:'0 0 2px' }}>{sess.title}</p>
                    <p style={{ fontSize:11, color:MUTED, margin:0 }}>{sess.completions||0} completions</p>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:sess.is_published?'rgba(34,197,94,0.12)':'rgba(255,255,255,0.06)', color:sess.is_published?GREEN:MUTED }}>
                    {sess.is_published?'Live':'Draft'}
                  </span>
                </div>
              ))}
              {!s.recentSmeSessions?.length && !loading && <p style={{ fontSize:12.5, color:MUTED }}>No sessions yet</p>}
            </SectionCard>
            <SectionCard title="Quick actions">
              {[
                { label:'Create new SME session', href:'/cerebre-admin/sme-club', icon:<Crown size={14}/>, color:'#E1306C' },
                { label:'Send broadcast message', href:'/cerebre-admin/messages', icon:<MessageSquare size={14}/>, color:'#8B7FFF' },
                { label:'View ratings & feedback', href:'/cerebre-admin/ratings', icon:<Star size={14}/>, color:GL },
                { label:'View AI Insights',        href:'/cerebre-admin/ai-insights', icon:<Brain size={14}/>, color:TEAL },
              ].map(({ label, href, icon, color }) => (
                <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:FAINT, border:`1px solid ${B}`, marginBottom:8, textDecoration:'none', transition:'background .15s' }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color }}>{icon}</div>
                  <span style={{ fontSize:13, color:DIM, fontWeight:500 }}>{label}</span>
                  <ChevronRight size={12} style={{ marginLeft:'auto', color:MUTED }}/>
                </Link>
              ))}
            </SectionCard>
          </div>
        </>
      )}

      {/* ── SUPPORT VIEW ─────────────────────────────────────────── */}
      {isSupport && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:24 }}>
            <KpiCard icon={<Users/>}    label="Total users"    value={loading?'…':s.totalUsers||0}       sub="Registered accounts"   href="/cerebre-admin/users" loading={loading}/>
            <KpiCard icon={<UserPlus/>} label="New today"      value={loading?'…':s.newUsersToday||0}    sub="Signups today"                                        loading={loading} color={TEAL}/>
            <KpiCard icon={<Coins/>}    label="Coins granted"  value={loading?'…':s.coinsGranted30d||0}  sub="By support last 30d"                                  loading={loading} color={GL}/>
            <KpiCard icon={<Star/>}     label="Satisfaction"   value={loading?'…':`${s.satisfactionPct||0}%`} sub="User ratings"     href="/cerebre-admin/ratings" loading={loading} color={GREEN}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}>
            <SectionCard title="Recent signups" action={{ label:'All users', href:'/cerebre-admin/users' }}>
              {(s.recentSignups||[]).slice(0,5).map((u:any) => (
                <div key={u.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`1px solid ${FAINT}` }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:`${TEAL}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:TEAL, flexShrink:0 }}>
                    {u.business_name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12.5, color:W, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.business_name||u.email}</p>
                    <p style={{ fontSize:11, color:MUTED, margin:'1px 0 0' }}>{u.industry||'No industry'} · {u.city||'No city'}</p>
                  </div>
                  <span style={{ fontSize:10.5, color:MUTED }}>{new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</span>
                </div>
              ))}
              {!s.recentSignups?.length && !loading && <p style={{ fontSize:12.5, color:MUTED }}>No recent signups</p>}
            </SectionCard>
            <SectionCard title="Support quick actions">
              {[
                { label:'Find a user', href:'/cerebre-admin/users', icon:<Users size={14}/>, color:TEAL },
                { label:'Grant coins manually', href:'/cerebre-admin/coins', icon:<Coins size={14}/>, color:GL },
                { label:'Send a message', href:'/cerebre-admin/messages', icon:<MessageSquare size={14}/>, color:'#8B7FFF' },
                { label:'View SME Club', href:'/cerebre-admin/sme-club', icon:<Crown size={14}/>, color:'#E1306C' },
              ].map(({ label, href, icon, color }) => (
                <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:FAINT, border:`1px solid ${B}`, marginBottom:8, textDecoration:'none' }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color }}>{icon}</div>
                  <span style={{ fontSize:13, color:DIM }}>{label}</span>
                  <ChevronRight size={12} style={{ marginLeft:'auto', color:MUTED }}/>
                </Link>
              ))}
            </SectionCard>
          </div>
        </>
      )}

      {/* ── ANALYST VIEW ─────────────────────────────────────────── */}
      {isAnalyst && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:24 }}>
            <KpiCard icon={<Users/>}      label="Total users"        value={loading?'…':s.totalUsers||0}             sub="Registered accounts"             loading={loading}/>
            <KpiCard icon={<TrendingUp/>} label="MRR"                value={loading?'…':`₦${(s.mrr||0).toLocaleString()}`} sub="Monthly recurring revenue" loading={loading} color={GREEN}/>
            <KpiCard icon={<Activity/>}   label="Generations (30d)"  value={loading?'…':(s.generations30d||0).toLocaleString()} sub="Total tool runs"          loading={loading} color={TEAL}/>
            <KpiCard icon={<Star/>}       label="Satisfaction"       value={loading?'…':`${s.satisfactionPct||0}%`} sub="User ratings"                      loading={loading} color={GL}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}>
            <SectionCard title="Platform metrics" action={{ label:'Full insights', href:'/cerebre-admin/ai-insights' }}>
              {[
                { label:'Free → Paid conversion rate', value:`${s.conversionRate||0}%`, color:GREEN },
                { label:'Avg coins per user',          value:(s.avgCoinsPerUser||0).toFixed(0),  color:GL },
                { label:'Tool completions today',       value:s.generationsToday||0,   color:TEAL },
                { label:'New signups this week',        value:s.newUsers7d||0,          color:'#8B7FFF' },
                { label:'Growth plan subscribers',      value:s.growthMembers||0,       color:'#E1306C' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid ${FAINT}` }}>
                  <span style={{ fontSize:12.5, color:DIM }}>{label}</span>
                  <span style={{ fontSize:14, fontWeight:800, color }}>{value}</span>
                </div>
              ))}
            </SectionCard>
            <SectionCard title="Analytics links">
              {[
                { label:'AI Insights dashboard',  href:'/cerebre-admin/ai-insights', icon:<Brain size={14}/>,     color:TEAL },
                { label:'User ratings & feedback', href:'/cerebre-admin/ratings',    icon:<Star size={14}/>,      color:GL },
                { label:'Revenue & billing',       href:'/cerebre-admin/billing',    icon:<TrendingUp size={14}/>,color:GREEN },
                { label:'Audit log',               href:'/cerebre-admin/logs',       icon:<Activity size={14}/>,  color:MUTED },
              ].map(({ label, href, icon, color }) => (
                <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:FAINT, border:`1px solid ${B}`, marginBottom:8, textDecoration:'none' }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color }}>{icon}</div>
                  <span style={{ fontSize:13, color:DIM }}>{label}</span>
                  <ChevronRight size={12} style={{ marginLeft:'auto', color:MUTED }}/>
                </Link>
              ))}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}
