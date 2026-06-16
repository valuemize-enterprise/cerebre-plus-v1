export default function Loading(){return(<><style>{`@keyframes pulse{0%,100%{opacity:.35}50%{opacity:.65}}.sk{background:rgba(255,255,255,0.07);border-radius:8px;animation:pulse 1.7s ease-in-out infinite}`}</style>
<div style={{maxWidth:940}}>
  <div className="sk" style={{height:13,width:"80px",marginBottom:20}}/>
  <div style={{display:"flex",gap:12,marginBottom:26}}><div className="sk" style={{height:30,width:"30",borderRadius:"50%"}}/><div className="sk" style={{height:22,width:"28%",animationDelay:"0.05s"}}/></div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
    <div>
      <div style={{background:"#0D2040",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:14,marginBottom:12}}><div style={{display:"flex",gap:8,marginBottom:0}}><div className="sk" style={{height:36,width:"48%"}}/><div className="sk" style={{height:36,width:"48%"}}/></div></div>
      <div style={{background:"#0D2040",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:18,marginBottom:0}}><div className="sk" style={{height:11,width:"38%"}}/><div className="sk" style={{height:36,width:"100%"}}/><div className="sk" style={{height:0,width:"0"}}/><div className="sk" style={{height:11,width:"38%",animationDelay:"0.07s"}}/><div className="sk" style={{height:36,width:"100%",animationDelay:"0.09s"}}/><div className="sk" style={{height:0,width:"0"}}/><div className="sk" style={{height:11,width:"38%",animationDelay:"0.14s"}}/><div className="sk" style={{height:36,width:"100%",animationDelay:"0.18s"}}/><div className="sk" style={{height:0,width:"0"}}/><div className="sk" style={{height:11,width:"38%",animationDelay:"0.21s"}}/><div className="sk" style={{height:36,width:"100%",animationDelay:"0.27s"}}/><div className="sk" style={{height:0,width:"0"}}/></div>
    </div>
    <div style={{background:"#0D2040",borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
      <div className="sk" style={{height:260,width:"100%",animationDelay:"0.20s",borderRadius:0}}/>
      <div style={{padding:14}}>
        <div style={{display:"flex",gap:8,marginBottom:0}}><div className="sk" style={{height:30,width:"48%",animationDelay:"0.30s"}}/><div className="sk" style={{height:30,width:"48%",animationDelay:"0.35s"}}/></div>
      </div>
    </div>
  </div>
</div></>)}