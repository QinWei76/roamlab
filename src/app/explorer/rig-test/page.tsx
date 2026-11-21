"use client";
import {createElement,useEffect,useRef,useState} from "react";
export default function RigTest(){
 const viewer=useRef<HTMLElement|null>(null);
 const [state,setState]=useState("Initializing viewer...");
 const [ready,setReady]=useState(false);
 const [rig,setRig]=useState(false);
 useEffect(()=>{
   let active=true;
   import("@google/model-viewer").then(()=>{if(active)setState("Loading Explorer V2 model...")}).catch(e=>{if(active)setState("3D viewer initialization failed: "+String(e))});
   return()=>{active=false};
 },[]);
 useEffect(()=>{
   const el=viewer.current;
   if(!el)return;
   const loaded=()=>{setReady(true);setState("Explorer V2 loaded successfully. Rotate and inspect the model below.")};
   const error=()=>{setReady(false);setState("Model loading failed. Check /explorer-male-v2.glb and Vercel deployment.")};
   el.addEventListener("load",loaded);el.addEventListener("error",error);
   return()=>{el.removeEventListener("load",loaded);el.removeEventListener("error",error)};
 },[]);
 return <main style={{minHeight:"100dvh",background:"#171b1a",color:"#f5ede0",padding:"20px 16px",fontFamily:"system-ui,sans-serif"}}>
 <div style={{maxWidth:960,margin:"0 auto"}}>
 <a href="/explorer" style={{color:"#d9ad7f"}}>← Explorer</a>
 <h1 style={{fontSize:26,marginBottom:8}}>Explorer V2 · Model & Rig Diagnostic</h1>
 <p style={{color:"#c9b9a7"}}>Direct model loading first. Animation test is isolated to avoid blocking the viewer.</p>
 <p role="status" style={{color:ready?"#b7e1b0":"#e6c38b",minHeight:24}}>{state}</p>
 <div style={{height:"min(67dvh,650px)",minHeight:360,border:"1px solid #64574b",borderRadius:12,overflow:"hidden",background:"radial-gradient(circle,#55594f,#242925)"}}>
 {createElement("model-viewer",{ref:viewer,src:"/explorer-male-v2.glb",alt:"Explorer male V2", "camera-controls":"","auto-rotate":"","environment-image":"neutral","shadow-intensity":"1",style:{width:"100%",height:"100%",display:"block"}})}
 </div>
 <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:16}}>
 <a href="/explorer-male-v2.glb" style={{color:"#e5bd91",padding:"10px 12px",border:"1px solid #655340",borderRadius:8}}>Direct GLB file</a>
 <button onClick={()=>setRig(v=>!v)} style={{padding:"10px 14px",borderRadius:8,background:"#a77849",color:"#161615",border:0,fontWeight:700}}>{rig?"Hide bone test":"Open experimental bone test"}</button>
 </div>
 {rig&&<div style={{padding:16,marginTop:14,border:"1px solid #5f5143",borderRadius:10}}><p>Bone animation requires a separate rig engine. The previous experimental engine is temporarily disabled because its external CDN may fail. First verify that the character renders above.</p><p>Once rendering is confirmed, we will add a bundled rig engine without external CDN dependencies.</p></div>}
 </div></main>
}