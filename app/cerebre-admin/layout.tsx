'use client'
// /app/cerebre-admin/layout.tsx
// Admin shell layout — handles session check, sidebar nav, and mobile menu.

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, Crown, Coins,
  Brain, ClipboardList, ShieldCheck, LogOut, Menu, X,
  ChevronRight, MessageSquare, Bell, Star,
} from 'lucide-react'
import { hasPermission, ROLE_LABELS, ROLE_COLORS, type AdminRole, type Permission } from '@/lib/admin/permissions'

const VOID  = '#06080E'
const NAVY  = '#0B1F3A'
const NAVY2 = '#0D2040'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const DIM   = 'rgba(205,217,236,0.6)'
const MUTED = 'rgba(205,217,236,0.35)'
const BORDER= 'rgba(255,255,255,0.07)'

const NAV = [
  { href:'/cerebre-admin/dashboard',  label:'Dashboard',   Icon:LayoutDashboard, perm:null },
  { href:'/cerebre-admin/users',       label:'Users',       Icon:Users,            perm:'view_users'       as Permission },
  { href:'/cerebre-admin/billing',     label:'Billing',     Icon:CreditCard,       perm:'view_billing'     as Permission },
  { href:'/cerebre-admin/sme-club',    label:'SME Club',    Icon:Crown,            perm:'view_sme_club'    as Permission },
  { href:'/cerebre-admin/coins',       label:'Coins',       Icon:Coins,            perm:'grant_coins'      as Permission },
  { href:'/cerebre-admin/ai-insights', label:'AI Insights', Icon:Brain,            perm:'view_ai_insights' as Permission },
  { href:'/cerebre-admin/ratings',     label:'Ratings',     Icon:Star,             perm:'view_ai_insights' as Permission },
  { href:'/cerebre-admin/messages',    label:'Messages',    Icon:MessageSquare,    perm:'send_user_email'  as Permission },
  { href:'/cerebre-admin/logs',        label:'Audit Log',   Icon:ClipboardList,    perm:'view_audit_log'   as Permission },
  { href:'/cerebre-admin/team',        label:'Admin Team',  Icon:ShieldCheck,      perm:'view_admin_team'  as Permission },
]

function NavItem({ href, label, Icon, active }: { href:string; label:string; Icon:any; active:boolean }) {
  return (
    <Link href={href} style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'9px 14px', borderRadius:10,
      background: active ? `${GOLD}15` : 'transparent',
      border: `1px solid ${active ? GOLD+'30' : 'transparent'}`,
      color:  active ? GL : DIM,
      fontWeight: active ? 700 : 500,
      fontSize:13, textDecoration:'none', transition:'all .18s',
    }}>
      <Icon size={16} style={{ flexShrink:0 }}/>
      {label}
      {active && <ChevronRight size={12} style={{ marginLeft:'auto', opacity:.6 }}/>}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [admin,       setAdmin]       = useState<any>(null)
  const [loading,     setLoading]     = useState(true)
  const [sideOpen,    setSideOpen]    = useState(false)
  const [loggingOut,  setLoggingOut]  = useState(false)
  const [authError,   setAuthError]   = useState(false)

  // Skip session check on login page
  const isLoginPage = pathname === '/cerebre-admin/login'

  useEffect(() => {
    if (isLoginPage) { setLoading(false); return }

    fetch('/api/admin/auth', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) {
          router.replace('/cerebre-admin/login')
          return
        }
        setAdmin(d)
        setLoading(false)
      })
      .catch(() => {
        setAuthError(true)
        setLoading(false)
        router.replace('/cerebre-admin/login')
      })
  }, [router, isLoginPage])

  const signOut = async () => {
    setLoggingOut(true)
    await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' }).catch(() => {})
    router.push('/cerebre-admin/login')
  }

  // Login page — render without shell
  if (isLoginPage) return <>{children}</>

  // Loading skeleton
  if (loading) return (
    <div style={{ minHeight:'100vh', background:VOID, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:`2.5px solid ${GOLD}`, borderTopColor:'transparent', borderRadius:'50%', animation:'admin-spin 0.8s linear infinite', margin:'0 auto 14px' }}/>
        <p style={{ fontSize:13, color:MUTED }}>Checking your session…</p>
      </div>
      <style>{`@keyframes admin-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Auth error state
  if (authError) return (
    <div style={{ minHeight:'100vh', background:VOID, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:MUTED, fontSize:13 }}>Redirecting to login…</p>
    </div>
  )

  const role          = admin?.role as AdminRole
  const visibleNav    = NAV.filter(n => !n.perm || hasPermission(role, n.perm))

  return (
    <div style={{ minHeight:'100vh', background:VOID, display:'flex' }}>
      <style>{`
        @keyframes admin-spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .admin-sidebar{transform:translateX(-100%)!important}
          .admin-sidebar.open{transform:none!important}
          .admin-main{margin-left:0!important}
          .admin-hamburger{display:flex!important}
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${sideOpen ? ' open' : ''}`}
        style={{
          position:'fixed', top:0, left:0, width:224, height:'100vh',
          background:NAVY2, borderRight:`1px solid ${BORDER}`,
          display:'flex', flexDirection:'column',
          zIndex:800, transition:'transform .25s',
        }}
      >
        {/* Logo */}
        <div style={{ padding:'20px 18px', borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:17, fontWeight:900, color:'#fff', marginBottom:2 }}>
            Cerebre <span style={{ color:GOLD }}>Plus</span>
          </div>
          <div style={{ fontSize:9, color:MUTED, letterSpacing:'2px', textTransform:'uppercase' }}>Admin Console</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
          {visibleNav.map(n => (
            <NavItem key={n.href} href={n.href} label={n.label} Icon={n.Icon} active={pathname.startsWith(n.href)}/>
          ))}
        </nav>

        {/* Admin badge */}
        <div style={{ padding:'14px 12px', borderTop:`1px solid ${BORDER}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{
              width:36, height:36, borderRadius:'50%',
              background:`${GOLD}20`, border:`1px solid ${GOLD}30`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Georgia',serif", fontWeight:900, color:GL, fontSize:14, flexShrink:0,
            }}>
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:12.5, fontWeight:700, color:'#EBF2FC', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{admin?.name}</p>
              {role && (
                <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:20, background:`${ROLE_COLORS[role]}18`, color:ROLE_COLORS[role] }}>
                  {ROLE_LABELS[role]}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={signOut}
            disabled={loggingOut}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:8,
              padding:'9px 12px', borderRadius:8,
              background:'rgba(255,255,255,0.04)', border:`1px solid ${BORDER}`,
              color:MUTED, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            }}
          >
            <LogOut size={14}/>{loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div onClick={() => setSideOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:799 }}/>
      )}

      {/* Main */}
      <main
        className="admin-main"
        style={{ marginLeft:224, flex:1, minHeight:'100vh', display:'flex', flexDirection:'column' }}
      >
        {/* Top bar */}
        <div style={{
          height:56, background:NAVY2, borderBottom:`1px solid ${BORDER}`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 20px', position:'sticky', top:0, zIndex:100,
        }}>
          {/* Hamburger — hidden on desktop, shown via CSS on mobile */}
          <button
            className="admin-hamburger"
            onClick={() => setSideOpen(!sideOpen)}
            style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:DIM, padding:4 }}
          >
            {sideOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>

          <div style={{ fontSize:12.5, color:MUTED }}>
            {new Date().toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:MUTED }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E' }}/>
              System online
            </div>
            {/* Quick link to messages */}
            <Link href="/cerebre-admin/messages" title="Messages" style={{ color:MUTED, display:'flex', alignItems:'center' }}>
              <MessageSquare size={16}/>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, padding:'clamp(16px,3%,28px)' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
