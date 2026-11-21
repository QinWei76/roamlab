"use client";
import Link from "next/link";
export default function RigTest() {
 return <main style={{minHeight:"100vh",background:"#171b1a",color:"#f5ede0",padding:"32px 18px",fontFamily:"system-ui,sans-serif"}}>
 <div style={{maxWidth:760,margin:"0 auto"}}>
 <Link href="/explorer" style={{color:"#d6aa78"}}>← Explorer</Link>
 <h1 style={{fontSize:28,marginTop:24}}>Explorer V2 · Rig Test</h1>
 <p style={{lineHeight:1.8}}>The test route is now published. The V2 model has not yet been uploaded to the RoamLab public assets, so an automatic bone-animation test is not available on this page.</p>
 <p style={{lineHeight:1.8}}>You can inspect your Tripo model in the existing GLB diagnostic page. Choose <b>Choose local GLB</b> and select <code>explorer-male-v2.glb</code> from your device.</p>
 <Link href="/explorer/glb-diagnostic" style={{display:"inline-block",padding:"14px 18px",background:"#ae7545",color:"#171b1a",borderRadius:10,textDecoration:"none",fontWeight:700}}>Open GLB diagnostic →</Link>
 <p style={{color:"#c6b7a4",marginTop:24,lineHeight:1.8}}>Next: upload explorer-male-v2.glb to the repository public folder, then add actual skeleton pose controls and waving animation to this route.</p>
 </div></main>;
}