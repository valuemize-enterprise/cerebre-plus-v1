'use client'
// ═══════════════════════════════════════════════════════════════
// /components/tools/outputs/ScriptGroupOutput.tsx
//
// Group 3 — Scripts
// Tools: video-script-forge, sales-script-writer,
//        carousel-script-builder, story-planner
//
// Visual modes:
//   video-script-forge      → TeleprompterView   (large text, scene cues, duration)
//   sales-script-writer     → DialogueView       (two-column rep / prospect conversation)
//   carousel-script-builder → CarouselSlideView  (horizontal slide cards with scene map)
//   story-planner           → StoryboardView     (9:16 vertical frames in sequence)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react'
import {
  Copy, Check, RefreshCw, Bookmark, BookmarkCheck, FileText, Play, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { ScriptOutput, ScriptScene } from '@/lib/tools/output-schemas'
import { DeepDiveProvider, DeepDiveTrigger, DeepDiveDrawer } from './DeepDiveDrawer'

// ── Tokens ─────────────────────────────────────────────────────
const D = {
  dark:'#060C1A', navy:'#0B1F3A', card:'#0D2040',
  gold:'#E09818', gl:'#F5B830',   teal:'#12D4B4',
  red:'#E55252',  green:'#22C55E', purple:'#8B7FFF', amber:'#F97316',
  blue:'#3B82F6', w:'#EBF2FC',
  dim:'rgba(205,217,236,.72)', muted:'rgba(205,217,236,.38)',
  faint:'rgba(255,255,255,.04)', bdr:'rgba(255,255,255,.08)',
}

// Scene label → colour
const SCENE_COLOR: Record<string, string> = {
  Hook:'#F5B830', Problem:'#E55252', Solution:'#12D4B4',
  Proof:'#22C55E', CTA:'#8B7FFF', Opener:'#F5B830',
  'Build-up':'#3B82F6', Climax:'#E55252', Close:'#8B7FFF',
  Slide:'#12D4B4', default:'rgba(205,217,236,.45)',
}
function sceneColor(label: string) {
  for (const [k, v] of Object.entries(SCENE_COLOR)) {
    if (label.toLowerCase().includes(k.toLowerCase())) return v
  }
  return SCENE_COLOR.default
}

function useCopy(text: string) {
  const [done, setDone] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setDone(true); setTimeout(() => setDone(false), 2000)
  }, [text])
  return { done, copy }
}

// ── Shared CopyBtn ─────────────────────────────────────────────
function CopyBtn({ text, label='Copy', color=D.muted }: { text:string; label?:string; color?:string }) {
  const { done, copy } = useCopy(text)
  return (
    <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:color, transition:'all .18s', minHeight:30 }}>
      {done?<Check size={11}/>:<Copy size={11}/>} {done?'Copied!':label}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// 1. TELEPROMPTER VIEW — VideoScriptForge
// ═══════════════════════════════════════════════════════════════
function TeleprompterView({ output }: { output: ScriptOutput }) {
  const { hook, structure } = output.essentials ?? {}
  const duration            = output.duration_estimate ?? ''
  const [activeScene, setActiveScene] = useState<number|null>(null)

  return (
    <div>
      {/* Duration + type bar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'9px 14px', background:D.faint, borderRadius:9, border:`1px solid ${D.bdr}` }}>
        <Play size={14} style={{ color:D.gl, flexShrink:0 }}/>
        <span style={{ fontSize:13, fontWeight:700, color:D.gl }}>{output.script_type ?? 'Video'}</span>
        {duration && <>
          <span style={{ color:D.bdr }}>·</span>
          <span style={{ fontSize:13, color:D.muted }}>Est. {duration}</span>
        </>}
        <div style={{ flex:1, height:3, borderRadius:2, background:D.bdr, overflow:'hidden', margin:'0 4px' }}>
          <div style={{ width:'0%', height:'100%', background:D.teal, borderRadius:2 }}/>
        </div>
      </div>

      {/* Hook — large teleprompter text */}
      {hook && (
        <div style={{ marginBottom:14, padding:'16px 18px', borderRadius:12, background:`linear-gradient(135deg,rgba(245,184,48,.06),${D.card})`, border:`1.5px solid rgba(245,184,48,.3)` }}>
          <p style={{ fontSize:10, fontWeight:700, color:D.gl, letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 8px' }}>Opening hook</p>
          <p style={{ fontSize:17, fontWeight:700, color:D.w, lineHeight:1.6, margin:'0 0 10px', fontFamily:"'Georgia',serif" }}>{hook}</p>
          <CopyBtn text={hook} label="Copy hook" color={D.gl}/>
        </div>
      )}

      {/* Scene structure */}
      {(structure ?? []).length > 0 && (
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Scene breakdown</p>
          {(structure ?? []).map((scene, i) => {
            const color  = sceneColor(scene.label)
            const isOpen = activeScene === i
            return (
              <div key={i} style={{ marginBottom:8, borderRadius:10, border:`1.5px solid ${isOpen?color+'45':D.bdr}`, overflow:'hidden', transition:'all .18s' }}>
                <button onClick={() => setActiveScene(isOpen?null:i)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:isOpen?`${color}08`:D.faint, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                  <div style={{ minWidth:42, padding:'2px 8px', borderRadius:6, background:`${color}18`, border:`1px solid ${color}30`, textAlign:'center', flexShrink:0 }}>
                    <span style={{ fontSize:10, fontWeight:800, color, display:'block', letterSpacing:'.5px' }}>{scene.duration ?? ''}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${color}18`, color, flexShrink:0 }}>{scene.label}</span>
                  <p style={{ flex:1, fontSize:13, color:isOpen?D.dim:D.muted, margin:0, lineHeight:1.4, textAlign:'left', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{scene.direction}</p>
                  {isOpen?<ChevronUp size={13} style={{ color:D.muted, flexShrink:0 }}/>:<ChevronDown size={13} style={{ color:D.muted, flexShrink:0 }}/>}
                </button>
                {isOpen && (
                  <div style={{ padding:'10px 14px', borderTop:`1px solid ${color}20` }}>
                    <p style={{ fontSize:14, color:D.dim, lineHeight:1.75, margin:'0 0 10px' }}>{scene.direction}</p>
                    {scene.spoken && <p style={{ fontSize:13.5, color:D.w, fontStyle:'italic', lineHeight:1.7, margin:'0 0 10px', padding:'10px 14px', background:'rgba(255,255,255,.05)', borderRadius:8, border:`1px solid ${D.bdr}` }}>"{scene.spoken}"</p>}
                    <CopyBtn text={scene.spoken || scene.direction} label="Copy scene"/>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 2. DIALOGUE VIEW — SalesScriptWriter
// ═══════════════════════════════════════════════════════════════
function DialogueView({ output }: { output: ScriptOutput }) {
  const { hook, structure } = output.essentials ?? {}
  const { done, copy } = useCopy(hook ?? '')

  return (
    <div>
      {/* Opening line */}
      {hook && (
        <div style={{ marginBottom:14, padding:'14px 16px', borderRadius:12, background:D.faint, border:`1px solid ${D.bdr}` }}>
          <p style={{ fontSize:10, fontWeight:700, color:D.muted, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 6px' }}>Opening line</p>
          <p style={{ fontSize:15, fontWeight:700, color:D.w, lineHeight:1.55, margin:'0 0 10px', fontStyle:'italic' }}>"{hook}"</p>
          <CopyBtn text={hook} label="Copy opener" color={D.gl}/>
        </div>
      )}

      {/* Column headers */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        <div style={{ padding:'6px 12px', borderRadius:7, background:'rgba(18,212,180,.08)', border:'1px solid rgba(18,212,180,.22)', textAlign:'center' }}>
          <span style={{ fontSize:10, fontWeight:800, color:D.teal, letterSpacing:'1px', textTransform:'uppercase' }}>What you say</span>
        </div>
        <div style={{ padding:'6px 12px', borderRadius:7, background:'rgba(229,82,82,.06)', border:'1px solid rgba(229,82,82,.18)', textAlign:'center' }}>
          <span style={{ fontSize:10, fontWeight:800, color:D.red, letterSpacing:'1px', textTransform:'uppercase' }}>Prospect response</span>
        </div>
      </div>

      {/* Dialogue rows */}
      {(structure ?? []).map((scene, i) => {
        const color = sceneColor(scene.label)
        // Split direction into rep-line / objection
        const parts   = scene.direction.split(/[|\/]|vs\./i).map(p => p.trim()).filter(Boolean)
        const repLine  = parts[0] ?? scene.direction
        const prospect = parts[1] ?? ''
        return (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            {/* Rep side */}
            <div style={{ padding:'12px 13px', borderRadius:10, background:'rgba(18,212,180,.05)', border:`1px solid rgba(18,212,180,.2)`, position:'relative' }}>
              <span style={{ fontSize:10, fontWeight:700, color:color, display:'block', marginBottom:5, letterSpacing:'.5px' }}>{scene.label}</span>
              <p style={{ fontSize:13, color:D.dim, lineHeight:1.65, margin:'0 0 8px' }}>{repLine}</p>
              <CopyBtn text={repLine}/>
            </div>
            {/* Prospect / objection side */}
            <div style={{ padding:'12px 13px', borderRadius:10, background:'rgba(229,82,82,.04)', border:`1px solid rgba(229,82,82,.15)` }}>
              <span style={{ fontSize:10, fontWeight:700, color:D.red, display:'block', marginBottom:5, letterSpacing:'.5px' }}>Likely response</span>
              {prospect
                ? <p style={{ fontSize:13, color:D.dim, lineHeight:1.65, margin:'0 0 8px', fontStyle:'italic' }}>"{prospect}"</p>
                : <p style={{ fontSize:12, color:D.muted, lineHeight:1.65, margin:'0 0 8px' }}>See Deep Dive for objection handling</p>}
              {scene.duration && <span style={{ fontSize:10.5, color:D.muted }}>{scene.duration}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 3. CAROUSEL SLIDE VIEW — CarouselScriptBuilder
// ═══════════════════════════════════════════════════════════════
function CarouselSlideView({ output }: { output: ScriptOutput }) {
  const { hook, structure } = output.essentials ?? {}
  const [activeSlide, setActiveSlide] = useState(0)
  const scenes = structure ?? []

  const activeScene = scenes[activeSlide]
  const color = activeScene ? sceneColor(activeScene.label) : D.teal
  const { done, copy } = useCopy(activeScene?.direction ?? '')

  return (
    <div>
      {/* Hook / slide 1 callout */}
      {hook && (
        <div style={{ marginBottom:14, padding:'11px 14px', borderRadius:10, background:'rgba(18,212,180,.06)', border:'1px solid rgba(18,212,180,.2)', display:'flex', gap:9, alignItems:'flex-start' }}>
          <span style={{ fontSize:14, flexShrink:0 }}>🎠</span>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:D.teal, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 3px' }}>Hook slide</p>
            <p style={{ fontSize:13.5, fontWeight:700, color:D.w, margin:0, lineHeight:1.4 }}>{hook}</p>
          </div>
        </div>
      )}

      {/* Slide navigation dots */}
      {scenes.length > 0 && (
        <div style={{ display:'flex', gap:5, marginBottom:12, flexWrap:'wrap' }}>
          {scenes.map((s, i) => (
            <button key={i} onClick={() => setActiveSlide(i)} style={{
              padding:'4px 10px', borderRadius:20, cursor:'pointer', fontFamily:'inherit',
              fontSize:11, fontWeight:700, border:`1px solid ${i===activeSlide?sceneColor(s.label)+'55':D.bdr}`,
              background: i===activeSlide?`${sceneColor(s.label)}14`:D.faint,
              color: i===activeSlide?sceneColor(s.label):D.muted, transition:'all .15s',
            }}>
              {i+1}
            </button>
          ))}
        </div>
      )}

      {/* Active slide card — 1:1 mockup */}
      {activeScene && (
        <div style={{ borderRadius:14, border:`2px solid ${color}40`, overflow:'hidden', marginBottom:12, background:`linear-gradient(135deg,${color}08,${D.card})` }}>
          {/* Slide number */}
          <div style={{ padding:'8px 14px', borderBottom:`1px solid ${color}20`, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:10, fontWeight:800, color:color, letterSpacing:'1.5px', textTransform:'uppercase' }}>Slide {activeSlide+1} of {scenes.length}</span>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${color}18`, color }}>
              {activeScene.label}
            </span>
            {activeScene.duration && <span style={{ fontSize:10.5, color:D.muted, marginLeft:'auto' }}>{activeScene.duration}</span>}
          </div>
          {/* Slide content area */}
          <div style={{ padding:'20px 18px', minHeight:140, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center' }}>
            <p style={{ fontSize:16, fontWeight:700, color:D.w, lineHeight:1.5, margin:'0 0 12px', maxWidth:300 }}>
              {activeScene.direction}
            </p>
            {activeScene.spoken && (
              <p style={{ fontSize:12.5, color:D.muted, fontStyle:'italic', margin:0 }}>{activeScene.spoken}</p>
            )}
          </div>
          {/* Slide footer */}
          <div style={{ padding:'10px 14px', borderTop:`1px solid ${color}18`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setActiveSlide(Math.max(0,activeSlide-1))} disabled={activeSlide===0} style={{ padding:'5px 10px', borderRadius:6, cursor:activeSlide===0?'not-allowed':'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:activeSlide===0?D.bdr:D.muted, opacity:activeSlide===0?.4:1 }}>← Prev</button>
              <button onClick={() => setActiveSlide(Math.min(scenes.length-1,activeSlide+1))} disabled={activeSlide===scenes.length-1} style={{ padding:'5px 10px', borderRadius:6, cursor:activeSlide===scenes.length-1?'not-allowed':'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:activeSlide===scenes.length-1?D.bdr:D.muted, opacity:activeSlide===scenes.length-1?.4:1 }}>Next →</button>
            </div>
            <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, border:`1px solid ${done?'rgba(18,212,180,.4)':D.bdr}`, background:done?'rgba(18,212,180,.1)':D.faint, color:done?D.teal:D.muted }}>
              {done?<><Check size={11}/>Copied</>:<><Copy size={11}/>Copy slide</>}
            </button>
          </div>
        </div>
      )}

      {/* All slides mini list */}
      <div style={{ background:D.faint, borderRadius:10, border:`1px solid ${D.bdr}`, overflow:'hidden' }}>
        <p style={{ fontSize:10.5, fontWeight:700, color:D.muted, letterSpacing:'1px', textTransform:'uppercase', padding:'8px 14px', borderBottom:`1px solid ${D.bdr}`, margin:0 }}>All {scenes.length} slides</p>
        {scenes.map((s, i) => (
          <div key={i} onClick={() => setActiveSlide(i)} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 14px', borderTop:i>0?`1px solid ${D.bdr}`:'none', cursor:'pointer', background:i===activeSlide?`${sceneColor(s.label)}08`:'transparent', transition:'background .15s' }}>
            <span style={{ minWidth:18, fontSize:11, fontWeight:800, color:sceneColor(s.label) }}>{i+1}</span>
            <span style={{ fontSize:11, padding:'1px 7px', borderRadius:20, background:`${sceneColor(s.label)}14`, color:sceneColor(s.label), fontWeight:700, flexShrink:0 }}>{s.label}</span>
            <p style={{ fontSize:12.5, color:D.muted, margin:0, flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{s.direction}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 4. STORYBOARD VIEW — StoryPlanner
// ═══════════════════════════════════════════════════════════════
function StoryboardView({ output }: { output: ScriptOutput }) {
  const { hook, structure } = output.essentials ?? {}
  const [selected, setSelected] = useState<number|null>(null)

  // Story-specific emojis per scene
  const STORY_ICONS: Record<string, string> = {
    Hook:'🪝', Problem:'😟', Solution:'💡', Reveal:'✨', CTA:'👆', Tease:'🤫', Build:'🔨'
  }
  function storyIcon(label: string) {
    for (const [k, v] of Object.entries(STORY_ICONS)) {
      if (label.toLowerCase().includes(k.toLowerCase())) return v
    }
    return '📱'
  }

  return (
    <div>
      {hook && (
        <div style={{ marginBottom:14, padding:'11px 14px', borderRadius:10, background:'rgba(245,184,48,.06)', border:'1px solid rgba(245,184,48,.22)', display:'flex', gap:9 }}>
          <span style={{ fontSize:16, flexShrink:0 }}>📖</span>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:D.gl, letterSpacing:'1.2px', textTransform:'uppercase', margin:'0 0 3px' }}>Story concept</p>
            <p style={{ fontSize:13.5, color:D.w, lineHeight:1.5, margin:0 }}>{hook}</p>
          </div>
        </div>
      )}

      {/* Story frames grid — 9:16 aspect ratio cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:14 }}>
        {(structure ?? []).map((scene, i) => {
          const color   = sceneColor(scene.label)
          const isOpen  = selected === i
          return (
            <div key={i} onClick={() => setSelected(isOpen?null:i)} style={{ cursor:'pointer', transition:'all .18s' }}>
              {/* 9:16 ratio frame */}
              <div style={{
                borderRadius:10, border:`2px solid ${isOpen?color+'60':D.bdr}`,
                background: isOpen?`${color}10`:D.faint,
                aspectRatio:'9/16', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', padding:'6px', textAlign:'center',
                transition:'all .18s', overflow:'hidden',
              }}>
                <span style={{ fontSize:20, marginBottom:4 }}>{storyIcon(scene.label)}</span>
                <span style={{ fontSize:9, fontWeight:800, color, textTransform:'uppercase', letterSpacing:'.5px', lineHeight:1.2 }}>{scene.label}</span>
                {scene.duration && <span style={{ fontSize:8, color:D.muted, marginTop:3 }}>{scene.duration}</span>}
              </div>
              <p style={{ fontSize:10.5, fontWeight:700, color:isOpen?color:D.muted, textAlign:'center', margin:'4px 0 0' }}>Frame {i+1}</p>
            </div>
          )
        })}
      </div>

      {/* Expanded frame detail */}
      {selected !== null && (structure ?? [])[selected] && (
        <FrameDetail scene={(structure ?? [])[selected]} index={selected}/>
      )}
    </div>
  )
}

function FrameDetail({ scene, index }: { scene: ScriptScene; index: number }) {
  const color = sceneColor(scene.label)
  const { done, copy } = useCopy(scene.direction)
  return (
    <div style={{ padding:'14px', borderRadius:12, background:`${color}07`, border:`1.5px solid ${color}35` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:800, color, padding:'2px 9px', borderRadius:20, background:`${color}18`, border:`1px solid ${color}30` }}>Frame {index+1} · {scene.label}</span>
        {scene.duration && <span style={{ fontSize:11, color:D.muted }}>{scene.duration}</span>}
      </div>
      <p style={{ fontSize:14, color:D.dim, lineHeight:1.75, margin:'0 0 10px' }}>{scene.direction}</p>
      {scene.spoken && <p style={{ fontSize:13.5, color:D.w, fontStyle:'italic', lineHeight:1.65, margin:'0 0 10px', padding:'10px 12px', background:'rgba(255,255,255,.05)', borderRadius:8, border:`1px solid ${D.bdr}` }}>"{scene.spoken}"</p>}
      <CopyBtn text={scene.spoken || scene.direction} label="Copy frame direction" color={color}/>
    </div>
  )
}

// ── Router ─────────────────────────────────────────────────────
function renderMode(toolId: string, output: ScriptOutput) {
  switch (toolId) {
    case 'sales-script-writer':     return <DialogueView      output={output}/>
    case 'carousel-script-builder': return <CarouselSlideView output={output}/>
    case 'story-planner':           return <StoryboardView    output={output}/>
    default:                        return <TeleprompterView  output={output}/>
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const TOOL_LABELS: Record<string,string> = {
  'video-script-forge':'🎬 VideoScriptForge',
  'sales-script-writer':'💼 SalesScriptWriter',
  'carousel-script-builder':'🎠 CarouselScriptBuilder',
  'story-planner':'📱 StoryPlanner',
}

export interface ScriptGroupOutputProps {
  outputJson:    ScriptOutput
  generationId:  string
  toolId:        string
  coinsSpent:    number
  deepDiveCost:  number
  onRegenerate?: () => void
  isSaved?:      boolean
  onSave?:       () => void
}

export function ScriptGroupOutput({
  outputJson, generationId, toolId, coinsSpent, deepDiveCost,
  onRegenerate, isSaved, onSave,
}: ScriptGroupOutputProps) {
  const headline = outputJson.headline ?? 'Script generated'
  const duration = outputJson.duration_estimate ?? ''
  const scenes   = outputJson.essentials?.structure ?? []

  const allText = [
    headline,
    outputJson.essentials?.hook ?? '',
    ...scenes.map((s,i) => `[${s.label}] ${s.duration??''}\n${s.direction}${s.spoken?'\n"'+s.spoken+'"':''}`),
  ].filter(Boolean).join('\n\n')

  const { done: allDone, copy: copyAll } = useCopy(allText)

  const exportScript = () => {
    const blob = new Blob([allText], { type:'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${toolId}-script.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DeepDiveProvider generationId={generationId} toolId={toolId} deepDiveCost={deepDiveCost} initialDeepDive={outputJson.deep_dive as any}>
      <style>{`
        @media(max-width:600px){
          .sg-actions{flex-direction:column!important}
          .sg-actions>button{width:100%!important}
          .sg-carousel-grid{grid-template-columns:repeat(3,1fr)!important}
          .sg-story-grid{grid-template-columns:repeat(3,1fr)!important}
          .sg-dialogue{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:`1px solid ${D.bdr}`, flexWrap:'wrap', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(139,127,255,.1)', border:'1px solid rgba(139,127,255,.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🎬</div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:D.w, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>{headline}</p>
              <p style={{ fontSize:11, color:D.muted, margin:0 }}>{TOOL_LABELS[toolId]||toolId} · {scenes.length} scenes{duration?' · '+duration:''} · {coinsSpent}⊙</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            {onSave && (
              <button onClick={onSave} style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isSaved?'rgba(224,152,24,.4)':D.bdr}`, background:isSaved?'rgba(224,152,24,.1)':D.faint, color:isSaved?D.gl:D.muted, cursor:'pointer' }}>
                {isSaved?<BookmarkCheck size={14}/>:<Bookmark size={14}/>}
              </button>
            )}
            {onRegenerate && (
              <button onClick={onRegenerate} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600, minHeight:34 }}>
                <RefreshCw size={12}/>Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
          {renderMode(toolId, outputJson)}
          <div style={{ marginTop:18 }}>
            <DeepDiveTrigger/>
          </div>
        </div>

        {/* Footer */}
        <div className="sg-actions" style={{ padding:'10px 14px', borderTop:`1px solid ${D.bdr}`, display:'flex', gap:8, flexShrink:0, background:'rgba(6,12,26,.97)', backdropFilter:'blur(14px)' }}>
          <button onClick={exportScript} style={{ display:'flex', alignItems:'center', gap:5, padding:'10px 14px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:700, border:`1px solid ${D.bdr}`, background:D.faint, color:D.muted, minHeight:44 }}>
            <FileText size={14}/> Export
          </button>
          <button onClick={copyAll} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontSize:13.5, fontWeight:800, border:`1px solid ${allDone?'rgba(18,212,180,.4)':'rgba(139,127,255,.35)'}`, background:allDone?'rgba(18,212,180,.14)':'rgba(139,127,255,.1)', color:allDone?D.teal:D.purple, transition:'all .18s', minHeight:44 }}>
            {allDone?<><Check size={14}/>Script copied!</>:<><Copy size={14}/>Copy full script</>}
          </button>
        </div>

        <DeepDiveDrawer headline={headline}/>
      </div>
    </DeepDiveProvider>
  )
}
