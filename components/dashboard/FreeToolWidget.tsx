'use client'
// /components/dashboard/FreeToolWidget.tsx
// One-time animated widget. Recommends 6 tools personalised to the user.
// User picks one, runs it free, widget disappears permanently.

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, X, Check } from 'lucide-react'

const GOLD='#E09818',GL='#F5B830',W='#EBF2FC',N2='#0D2040'
const MUTED='rgba(205,217,236,0.38)',B='rgba(255,255,255,0.08)',FAINT='rgba(255,255,255,0.04)',GREEN='#22C55E'

interface ToolRec {
  tool_id:string; label:string; emoji:string; coin_value:number
  tagline:string; href:string; why_for_you:string
}

function ToolCard({ rec, selected, onSelect }: { rec:ToolRec; selected:boolean; onSelect:()=>void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={onSelect} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        position:'relative', cursor:'pointer', borderRadius:14, padding:'14px 16px', transition:'all .2s',
        background: selected ? 'linear-gradient(135deg,rgba(224,152,24,0.13),rgba(245,184,48,0.07))' : hovered ? 'rgba(255,255,255,0.06)' : N2,
        border:`1.5px solid ${selected?GOLD+'60':hovered?B:'rgba(255,255,255,0.05)'}`,
        transform: selected||hovered ? 'translateY(-1px)' : 'none',
        boxShadow: selected ? '0 4px 20px rgba(224,152,24,0.15)' : hovered ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
      }}>
      {selected && (
        <div style={{position:'absolute',top:-9,right:12,padding:'2px 9px',borderRadius:10,background:GOLD,fontSize:10,fontWeight:800,color:'#071528',letterSpacing:'0.5px'}}>✦ SELECTED</div>
      )}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <span style={{fontSize:24}}>{rec.emoji}</span>
        <div style={{display:'flex',alignItems:'center',gap:5,padding:'3px 8px',borderRadius:10,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)'}}>
          <span style={{fontSize:10,color:MUTED,textDecoration:'line-through'}}>{rec.coin_value} coins</span>
          <span style={{fontSize:10,fontWeight:800,color:GREEN}}>FREE</span>
        </div>
      </div>
      <p style={{fontSize:13.5,fontWeight:700,color:selected?GL:W,margin:'0 0 5px',fontFamily:"'Georgia',serif",lineHeight:1.3,transition:'color .2s'}}>{rec.label}</p>
      <p style={{fontSize:12,color:selected?'rgba(245,184,48,0.75)':MUTED,margin:0,lineHeight:1.55,transition:'color .2s'}}>{rec.why_for_you}</p>
      {selected && <Link href={`${rec.href}?free=1`} onClick={e=>e.stopPropagation()} style={{display:'flex',alignItems:'center',gap:4,marginTop:10,fontSize:11.5,fontWeight:700,color:GOLD,textDecoration:'none'}}><Check size={11} style={{color:GOLD}}/>Ready to run</Link>}
    </div>
  )
}

export function FreeToolWidget() {
  const [recs,setRecs]=useState<ToolRec[]>([])
  const [loading,setLoading]=useState(true)
  const [alreadyUsed,setAlreadyUsed]=useState(false)
  const [dismissed,setDismissed]=useState(false)
  const [selected,setSelected]=useState<string|null>(null)
  const [visible,setVisible]=useState(false)

  useEffect(()=>{
    if(sessionStorage.getItem('ftw_dismissed')==='1'){setDismissed(true);setLoading(false);return}
    fetch('/api/auth/free-tool-recs').then(r=>r.json()).then(data=>{
      if(data.alreadyUsed){setAlreadyUsed(true)}
      else if(data.recommendations?.length){setRecs(data.recommendations);setTimeout(()=>setVisible(true),80)}
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[])

  const dismiss=()=>{sessionStorage.setItem('ftw_dismissed','1');setDismissed(true)}

  if(loading||alreadyUsed||dismissed||recs.length===0)return null
  const selectedRec=recs.find(r=>r.tool_id===selected)

  return(
    <>
      <style>{`
        @keyframes ftwIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes ftwGlow{0%,100%{border-color:rgba(224,152,24,0.3)}50%{border-color:rgba(245,184,48,0.55);box-shadow:0 0 0 4px rgba(224,152,24,0.06)}}
        @keyframes ftwPulse{0%,100%{box-shadow:0 0 0 0 rgba(224,152,24,0.35)}50%{box-shadow:0 0 0 10px rgba(224,152,24,0)}}
      `}</style>
      <div style={{marginBottom:24,borderRadius:18,border:'1.5px solid rgba(224,152,24,0.3)',background:'linear-gradient(135deg,rgba(224,152,24,0.05),rgba(18,212,180,0.03))',padding:'20px 22px 22px',position:'relative',opacity:visible?1:0,animation:visible?'ftwIn .5s cubic-bezier(.16,1,.3,1) forwards, ftwGlow 3.5s ease-in-out infinite':'none'}}>
        <button onClick={dismiss} style={{position:'absolute',top:14,right:14,background:'none',border:'none',cursor:'pointer',color:MUTED,padding:4,borderRadius:6,lineHeight:0}}><X size={15}/></button>
        <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:18}}>
          <div style={{width:42,height:42,borderRadius:12,background:`${GOLD}18`,border:`1.5px solid ${GOLD}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Sparkles size={18} style={{color:GOLD}}/>
          </div>
          <div>
            <p style={{fontSize:16,fontWeight:900,color:W,margin:'0 0 4px',fontFamily:"'Georgia',serif"}}>Run your first tool free ✦</p>
            <p style={{fontSize:13,color:MUTED,margin:0,lineHeight:1.5,maxWidth:480}}>We picked these 6 tools based on your goals and challenges. Select one and run it now — no coins needed.</p>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10,marginBottom:18}}>
          {recs.map(rec=><ToolCard key={rec.tool_id} rec={rec} selected={selected===rec.tool_id} onSelect={()=>setSelected(p=>p===rec.tool_id?null:rec.tool_id)}/>)}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          {selected&&selectedRec?(
            <Link href={`${selectedRec.href}?free=1`} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 28px',borderRadius:12,background:`linear-gradient(135deg,${GOLD},${GL})`,color:'#071528',fontWeight:800,fontSize:14.5,textDecoration:'none',animation:'ftwPulse 2s ease-in-out infinite',flexShrink:0}}>
              <Sparkles size={15}/>Run {selectedRec.label} free<ArrowRight size={14}/>
            </Link>
          ):(
            <button disabled style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 28px',borderRadius:12,background:FAINT,border:`1px solid ${B}`,color:MUTED,fontWeight:800,fontSize:14.5,cursor:'not-allowed',fontFamily:'inherit'}}>
              <Sparkles size={15}/>Select a tool above
            </button>
          )}
          <button onClick={dismiss} style={{background:'none',border:'none',cursor:'pointer',color:MUTED,fontSize:13,fontFamily:'inherit',padding:'4px 8px',textDecoration:'underline',textDecorationColor:'rgba(205,217,236,0.2)'}}>I'll explore on my own</button>
        </div>
        {selected&&selectedRec&&<p style={{fontSize:11.5,color:'rgba(34,197,94,0.65)',marginTop:10,marginBottom:0}}>✦ Normally costs {selectedRec.coin_value} coins — running free for your first tool.</p>}
      </div>
    </>
  )
}
