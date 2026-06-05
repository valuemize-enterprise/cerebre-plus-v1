'use client'
// /app/cerebre-admin/login/page.tsx
// Admin login — invite-only, no self-registration link shown.

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'

const VOID = '#06080E'; const GOLD = '#E09818'; const GL = '#F5B830'
const TEAL = '#12D4B4'; const CORAL = '#E84830'
const DIM  = 'rgba(205,217,236,0.6)'; const MUTED = 'rgba(205,217,236,0.35)'

export default function AdminLogin() {
  const router = useRouter()
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [attempts,  setAttempts]  = useState(0)

  const locked = attempts >= 5

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAttempts(a => a + 1)
        setError(data.error || 'Invalid credentials')
      } else {
        router.push('/cerebre-admin/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:VOID, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative' }}>
      {/* Subtle grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(19,30,56,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(19,30,56,.2) 1px,transparent 1px)`, backgroundSize:'56px 56px', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:400, position:'relative', zIndex:2 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:`${GOLD}20`, border:`1px solid ${GOLD}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={22} style={{ color:GOLD }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:"'Georgia',serif", fontSize:18, fontWeight:900, color:'#fff', lineHeight:1 }}>
                Cerebre <span style={{ color:GOLD }}>Plus</span>
              </div>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:'2px', textTransform:'uppercase' }}>Admin Console</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'#0B1F3A', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'36px 30px', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:'#EBF2FC', marginBottom:6 }}>Admin sign in</h1>
          <p style={{ fontSize:13, color:MUTED, marginBottom:28, lineHeight:1.5 }}>
            Authorised personnel only. This page is not publicly accessible.
          </p>

          {/* Lockout warning */}
          {locked && (
            <div style={{ background:`${CORAL}10`, border:`1px solid ${CORAL}28`, borderRadius:10, padding:'12px 14px', marginBottom:20, display:'flex', gap:10 }}>
              <AlertCircle size={16} style={{ color:CORAL, flexShrink:0, marginTop:1 }} />
              <p style={{ fontSize:13, color:'rgba(232,72,48,0.9)', lineHeight:1.5 }}>
                Too many failed attempts. Access is locked for 30 minutes. Contact your super admin if you need to reset.
              </p>
            </div>
          )}

          {/* Attempt warning */}
          {attempts > 0 && attempts < 5 && (
            <div style={{ background:'rgba(255,165,0,0.08)', border:'1px solid rgba(255,165,0,0.22)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, color:'rgba(255,165,0,0.85)' }}>
              {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:7 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="admin@cerebreplus.com"
                disabled={locked || loading}
                style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.14)', borderRadius:10, padding:'11px 14px', color:'#EBF2FC', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••••••"
                  disabled={locked || loading}
                  style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.14)', borderRadius:10, padding:'11px 42px 11px 14px', color:'#EBF2FC', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:MUTED, display:'flex', alignItems:'center' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display:'flex', gap:8, background:`${CORAL}08`, border:`1px solid ${CORAL}22`, borderRadius:8, padding:'10px 12px' }}>
                <AlertCircle size={15} style={{ color:CORAL, flexShrink:0, marginTop:1 }} />
                <p style={{ fontSize:13, color:'rgba(232,72,48,0.88)', margin:0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading || locked}
              style={{ background: locked ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${GOLD},${GL})`, color: locked ? MUTED : VOID, fontWeight:800, fontSize:15, padding:'14px', borderRadius:10, border:'none', cursor: locked ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginTop:4 }}
            >
              {loading ? 'Signing in…' : 'Sign in to admin console'}
            </button>
          </form>

          <p style={{ fontSize:11.5, color:MUTED, textAlign:'center', marginTop:20, lineHeight:1.5 }}>
            Invitation-only access. If you need access, contact your super admin.
          </p>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'rgba(205,217,236,0.2)', marginTop:20 }}>
          This session will expire after 2 hours of inactivity.
        </p>
      </div>
    </div>
  )
}
