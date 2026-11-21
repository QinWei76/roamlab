"use client";
import {createElement,useEffect,useRef,useState} from "react";
export default function RigTest(){
 const viewer=useRef<HTMLElement|null>(null);
 const [status,setStatus]=useState("Initializing 3D viewer...");
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{import("@google/model-viewer").catch(e=>setStatus("Viewer initialization failed: "+String(e)))},[]);
 useEffect(()=>{
 const el=viewer.current;if(!el)return;
 const ok=()=>{setLoaded(true);setStatus("Explorer V2 loaded. Drag to rotate; pinch to zoom.")};
 const fail=()=>{setLoaded(false);setStatus("GLB load failed. Open the direct GLB link below to check.")};
 el.addEventListener("load",ok);el.addEventListener("error",fail);
 return()=>{el.removeEventListener("load",ok);el.removeEventListener("error",fail)};
 },[]);
 return <main style={{minHeight:"100dvh",background:"#171b1a",color:"#f5ede0",padding:"18px 14px",fontFamily:"system-ui,sans-serif"}}>
 <div style={{maxWidth:960,margin:"0 auto"}}>
 <a href="/explorer" style={{color:"#d9ad7f"}}>← Explorer</a>
 <h1 style={{fontSize:24,marginBottom:6}}>Explorer V2 · Model Test</h1>
 <p style={{color:"#bdb3a7",fontSize:14}}>Mobile-friendly model verification. Bone motion controls will follow after rendering is confirmed.</p>
 <p role="status" style={{color:loaded?"#b8e2ae":"#e6c38b"}}>{status}</p>
 <div style={{height:"min(66dvh,640px)",minHeight:340,overflow:"hidden",borderRadius:12,border:"1px solid #615347",background:"#30352f"}}>
 {createElement("model-viewer",{ref:viewer,src:"/explorer-male-v2.glb",alt:"Explorer male V2","camera-controls":"","environment-image":"neutral","shadow-intensity":"1",style:{display:"block",width:"100%",height:"100%"}})}
 </div>
 <p style={{marginTop:16}}><a href="/explorer-male-v2.glb" style={{color:"#d9ad7f"}}>Open original GLB file</a> · <a href="/explorer/glb-diagnostic" style={{color:"#d9ad7f"}}>Known working GLB diagnostic</a></p>
 </div></main>;
}