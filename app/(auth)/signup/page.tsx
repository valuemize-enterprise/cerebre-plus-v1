'use client'
// /app/(auth)/signup/page.tsx — OTP-based signup

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const N='#0B1F3A',GOLD='#E09818',GL='#F5B830',TEAL='#12D4B4'
const W='#EBF2FC',MUTED='rgba(205,217,236,0.4)',B='rgba(255,255,255,0.08)',RED='#EF4444'

function Input({ label, type='text', value, onChange, placeholder, error, required, hint }: any) {
  const [showPw, setShowPw] = useState(false)
  const isPw = type === 'password'
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:7 }}>
        {label}{required && <span style={{ color:GOLD }}> *</span>}
      </label>
      <div style={{ position:'relative' }}>
        <input type={isPw && showPw ? 'text' : type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width:'100%', padding: isPw ? '11px 42px 11px 14px' : '11px 14px', background:'rgba(255,255,255,0.07)', border:`1.5px solid ${error ? RED+'60' : B}`, borderRadius:10, color:W, fontFamily:'inherit', fontSize:14, outline:'none', boxSizing:'border-box' as const }}/>
        {isPw && <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:MUTED, padding:0 }}>{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>}
      </div>
      {error && <p style={{ margin:'4px 0 0', fontSize:12, color:'#FCA5A5' }}>{error}</p>}
      {hint && !error && <p style={{ margin:'4px 0 0', fontSize:11.5, color:MUTED }}>{hint}</p>}
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const refCode = searchParams.get('ref')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bizName, setBizName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e: Record<string,string> = {}
    if (!name.trim()) e.name = 'Your name is required'
    if (!email.trim() || !email.includes('@')) e.email = 'Please enter a valid email'
    if (password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!bizName.trim()) e.bizName = 'Business name is required'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length) { setErrors(validation); return }
    setErrors({}); setApiError(''); setLoading(true)
    try {
      const metadata: Record<string, string> = { full_name: name.trim(), business_name: bizName.trim() }
      if (refCode) {
        metadata.referral_code = refCode
        sessionStorage.setItem('signup_ref', refCode)
      }
      const { error: signupErr } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(), password,
        options: { data: metadata },
      })
      if (signupErr) throw new Error(signupErr.message)
      sessionStorage.setItem('signup_name', name.trim())
      sessionStorage.setItem('signup_email', email.toLowerCase().trim())
      sessionStorage.setItem('signup_bizname', bizName.trim())
      const otpRes = await fetch('/api/auth/send-otp', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: email.toLowerCase().trim(), name: name.trim() }),
      })
      const otpData = await otpRes.json()
      if (!otpRes.ok) throw new Error(otpData.error || 'Failed to send verification code')
        
      const verifyParams = new URLSearchParams({ email: email.toLowerCase().trim() })
      if (refCode) verifyParams.set('ref', refCode)
      router.push(`/verify?${verifyParams.toString()}`)
    } catch (err: any) {
      const msg = err.message || 'Signup failed. Please try again.'
      if (msg.toLowerCase().includes('email')) setErrors(p => ({...p, email: msg}))
      else setApiError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080F1F', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 16px' }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <span style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:W, letterSpacing:2 }}>CEREBRE</span>
          <span style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:GL, letterSpacing:2 }}> PLUS</span>
          <p style={{ fontSize:13, color:MUTED, marginTop:6 }}>AI marketing platform for Nigerian businesses</p>
        </div>
        <div style={{ background:N, border:`1px solid ${B}`, borderRadius:18, padding:'32px 28px' }}>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:22, fontWeight:900, color:W, marginBottom:6 }}>Create your account</h1>
          <p style={{ fontSize:13.5, color:MUTED, marginBottom:24 }}>We'll send a 6-digit code to verify your email — no waiting for a link.</p>
          {apiError && <div style={{ padding:'12px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, marginBottom:16, fontSize:13, color:'#FCA5A5' }}>{apiError}</div>}
          <form onSubmit={handleSubmit}>
            <Input label="Your name" value={name} onChange={setName} placeholder="Amara Okonkwo" required error={errors.name}/>
            <Input label="Business name" value={bizName} onChange={setBizName} placeholder="Amara's Fashion House" required error={errors.bizName}/>
            <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="amara@yourcompany.com" required error={errors.email}/>
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" required error={errors.password} hint="8+ characters — you'll use this every time you log in."/>
            <button type="submit" disabled={loading} style={{ width:'100%', marginTop:8, padding:'14px', borderRadius:12, fontFamily:'inherit', fontWeight:800, fontSize:15, background: loading ? 'rgba(255,255,255,0.07)' : `linear-gradient(135deg,${GOLD},${GL})`, border:`1px solid ${loading ? B : GOLD+'50'}`, color: loading ? MUTED : '#071528', cursor: loading ? 'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
              {loading ? <><RefreshCw size={15} style={{ animation:'spin 1s linear infinite' }}/>Creating account…</> : 'Create account & get code →'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:13, color:MUTED, marginTop:18 }}>Already have an account?{' '}<Link href="/login" style={{ color:TEAL, fontWeight:700, textDecoration:'none' }}>Sign in</Link></p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
