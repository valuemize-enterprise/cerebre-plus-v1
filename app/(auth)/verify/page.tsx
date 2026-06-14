'use client'
// /app/(auth)/verify/page.tsx — OTP verification

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw, CheckCircle, Mail } from 'lucide-react'

const N='#0B1F3A',GL='#F5B830',TEAL='#12D4B4',W='#EBF2FC',MUTED='rgba(205,217,236,0.4)',B='rgba(255,255,255,0.08)',GOLD='#E09818'
const EXP=600

export default function VerifyPage() {
  const router=useRouter(), sp=useSearchParams()
  const email=sp.get('email') ?? (typeof window!=='undefined' ? sessionStorage.getItem('signup_email') : '') ?? ''
  const [digits,setDigits]=useState(['','','','','',''])
  const [loading,setLoading]=useState(false), [error,setError]=useState('')
  const [success,setSuccess]=useState(false), [resending,setResending]=useState(false)
  const [resent,setResent]=useState(false), [timeLeft,setTimeLeft]=useState(EXP)
  const refs=useRef<(HTMLInputElement|null)[]>([])

  useEffect(()=>{ if(timeLeft<=0)return; const t=setInterval(()=>setTimeLeft(s=>s-1),1000); return()=>clearInterval(t) },[timeLeft])

  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  const handleDigit=(i:number,v:string)=>{
    const c=v.replace(/\D/g,'').slice(-1), nd=[...digits]; nd[i]=c; setDigits(nd); setError('')
    if(c&&i<5) refs.current[i+1]?.focus()
    if(nd.every(d=>d!=='')&&c) verify(nd.join(''))
  }
  const handleKey=(i:number,e:React.KeyboardEvent)=>{ if(e.key==='Backspace'&&!digits[i]&&i>0) refs.current[i-1]?.focus() }
  const handlePaste=(e:React.ClipboardEvent)=>{ e.preventDefault(); const p=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6); if(p.length===6){setDigits(p.split(''));setError('');refs.current[5]?.focus();verify(p)} }

  const verify=async(code:string)=>{
    if(code.length!==6||loading||success)return
    setLoading(true);setError('')
    try{
      const res=await fetch('/api/auth/verify-otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,code})})
      const data=await res.json()
      if(!res.ok){setError(data.error||'Incorrect code.');setDigits(['','','','','','']);refs.current[0]?.focus();if(data.expired)setTimeLeft(0)}
      else{setSuccess(true);setTimeout(()=>router.push('/onboarding'),1500)}
    }catch{setError('Network error. Please try again.')}
    finally{setLoading(false)}
  }

  const resend=async()=>{
    if(resending||!email)return; setResending(true);setResent(false);setError('')
    try{
      const name=typeof window!=='undefined'?sessionStorage.getItem('signup_name')??'':''
      const res=await fetch('/api/auth/send-otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,name})})
      const data=await res.json()
      if(!res.ok){setError(data.error||'Failed to resend.');return}
      setResent(true);setTimeLeft(EXP);setDigits(['','','','','','']);refs.current[0]?.focus()
      setTimeout(()=>setResent(false),3000)
    }catch{setError('Failed to resend.')}finally{setResending(false)}
  }

  const masked=email.replace(/(.{2}).+(@.+)/,'$1***$2')

  return(
    <div style={{minHeight:'100vh',background:'#080F1F',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px 16px'}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <span style={{fontFamily:"'Georgia',serif",fontSize:22,fontWeight:900,color:W,letterSpacing:2}}>CEREBRE</span>
          <span style={{fontFamily:"'Georgia',serif",fontSize:22,fontWeight:900,color:GL,letterSpacing:2}}> PLUS</span>
        </div>
        {success?(
          <div style={{background:N,border:`1px solid rgba(34,197,94,0.3)`,borderRadius:18,padding:'40px 28px',textAlign:'center'}}>
            <CheckCircle size={48} style={{color:'#22C55E',margin:'0 auto 16px'}}/>
            <h2 style={{fontFamily:"'Georgia',serif",fontSize:22,fontWeight:900,color:W,marginBottom:8}}>Email verified!</h2>
            <p style={{fontSize:14,color:MUTED}}>Setting up your account…</p>
          </div>
        ):(
          <div style={{background:N,border:`1px solid ${B}`,borderRadius:18,padding:'32px 28px'}}>
            <div style={{width:52,height:52,borderRadius:14,background:`${TEAL}15`,border:`1px solid ${TEAL}30`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
              <Mail size={24} style={{color:TEAL}}/>
            </div>
            <h1 style={{fontFamily:"'Georgia',serif",fontSize:22,fontWeight:900,color:W,marginBottom:8}}>Check your email</h1>
            <p style={{fontSize:14,color:MUTED,marginBottom:24,lineHeight:1.65}}>
              We sent a 6-digit code to <strong style={{color:W}}>{masked||'your email'}</strong>. Enter it below.
            </p>
            <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:20}} onPaste={handlePaste}>
              {digits.map((d,i)=>(
                <input key={i} ref={el=>{refs.current[i]=el}} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e=>handleDigit(i,e.target.value)} onKeyDown={e=>handleKey(i,e)} disabled={loading||success}
                  style={{width:52,height:60,textAlign:'center',fontSize:26,fontWeight:900,fontFamily:"'Georgia',serif",background:d?`${GOLD}15`:'rgba(255,255,255,0.07)',border:`2px solid ${d?GOLD+'60':error?'#EF444450':B}`,borderRadius:12,color:d?GL:W,outline:'none',transition:'all .15s'}}
                />
              ))}
            </div>
            {loading&&<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:12,color:TEAL,fontSize:13}}><RefreshCw size={14} style={{animation:'spin 0.8s linear infinite'}}/>Verifying…</div>}
            {error&&<div style={{padding:'10px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:10,marginBottom:14,fontSize:13,color:'#FCA5A5',textAlign:'center'}}>{error}</div>}
            {resent&&<div style={{padding:'10px 14px',background:'rgba(18,212,180,0.1)',border:'1px solid rgba(18,212,180,0.25)',borderRadius:10,marginBottom:14,fontSize:13,color:TEAL,textAlign:'center'}}>✓ New code sent — check your inbox</div>}
            <div style={{textAlign:'center',marginTop:8}}>
              {timeLeft>0?<p style={{fontSize:13,color:MUTED}}>Expires in <span style={{color:timeLeft<60?'#EF4444':W,fontWeight:700,fontFamily:'monospace'}}>{fmt(timeLeft)}</span></p>:<p style={{fontSize:13,color:'#FCA5A5'}}>Code expired</p>}
              <button onClick={resend} disabled={resending||timeLeft>540} style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:10,background:'none',border:'none',cursor:resending||timeLeft>540?'not-allowed':'pointer',color:timeLeft>540?MUTED:TEAL,fontSize:13,fontWeight:700,fontFamily:'inherit',opacity:timeLeft>540?.5:1,padding:0}}>
                {resending?<><RefreshCw size={12} style={{animation:'spin 0.8s linear infinite'}}/>Sending…</>:<>↺ Resend code</>}
              </button>
            </div>
            <p style={{textAlign:'center',fontSize:12,color:MUTED,marginTop:20}}>Wrong email? <a href="/signup" style={{color:TEAL,textDecoration:'none',fontWeight:700}}>Go back</a></p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
