"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "./explorer.css";

type Explorer = { base:"original-male"|"original-female"; id:string; name:string; body:"compact"|"classic"|"tall"; skin:string; hairStyle:"short"|"swept"|"curly"|"long"; hairColor:string; beard:"none"|"stubble"|"mustache"|"goatee"|"short"|"full"; beardColor:string; jacket:string; pants:string; pack:string };
const KEY="roamlab-digireal-explorer-v1";
const colors={skin:["#F1C7A4","#DDA47E","#B97855","#875238","#543628"],hair:["#28211F","#503629","#8F593A","#D9B66E","#B95D35","#B8B9BB","#EEE9DF","#6B8DAA"],jacket:["#C87836","#5B785E","#5C7189","#A65B4A","#D1B98D"],pants:["#4C5148","#5B493D","#697282","#B49B7A"],pack:["#61745C","#B47B45","#4E6575","#8C554B"]};
const initial:Explorer={base:"original-male",id:"",name:"My Explorer",body:"classic",skin:colors.skin[1],hairStyle:"swept",hairColor:colors.hair[1],beard:"none",beardColor:colors.hair[1],jacket:colors.jacket[0],pants:colors.pants[0],pack:colors.pack[0]};
function Swatches({values,value,onChange}:{values:string[];value:string;onChange:(v:string)=>void}){return <div className="ex-swatches">{values.map(c=><button type="button" key={c} title={c} aria-label={c} aria-pressed={value===c} onClick={()=>onChange(c)} style={{background:c}} className={value===c?"selected":""}/>)}</div>}
function ExplorerFigure({e}:{e:Explorer}){
 const h=e.body==="compact"?0.93:e.body==="tall"?1.08:1;
 return <svg className="ex-figure" viewBox="0 0 260 340" role="img" aria-label={e.name+" explorer preview"}>
 <ellipse cx="130" cy="316" rx="76" ry="11" fill="#1e170f" opacity=".28"/>
 <g transform={`translate(130 290) scale(1 ${h}) translate(-130 -290)`}>
 <path d="M92 213 L88 289 Q91 299 110 299 L125 299 L130 244 L137 299 L156 299 Q173 296 169 287 L166 213Z" fill={e.pants} stroke="#302d27" strokeWidth="4"/>
 <path d="M88 289 Q78 303 83 308 L123 308 L124 296 L104 291Z M137 296 L138 308 L179 308 Q182 300 166 289Z" fill="#43352c" stroke="#2b2421" strokeWidth="3"/>
 <rect x="163" y="152" width="31" height="91" rx="14" fill={e.pack} stroke="#403d2e" strokeWidth="4"/>
 <path d="M92 151 Q130 134 168 151 L180 229 Q131 244 80 229Z" fill={e.jacket} stroke="#593c2b" strokeWidth="4"/>
 <path d="M89 159 Q67 177 67 222 L79 229 L96 191 M171 159 Q190 175 192 222 L179 230 L164 190" fill={e.jacket} stroke="#593c2b" strokeWidth="4" strokeLinejoin="round"/>
 <path d="M68 221 Q66 242 77 242 Q87 241 81 223 M179 223 Q176 243 188 242 Q198 241 192 221" fill={e.skin} stroke="#855b46" strokeWidth="2"/>
 <path d="M125 161 L132 224" stroke="#5A4030" strokeWidth="3"/><circle cx="136" cy="189" r="3" fill="#E6C58E"/>
 <rect x="117" y="131" width="28" height="29" rx="10" fill={e.skin}/>
 <ellipse cx="130" cy="88" rx="53" ry="60" fill={e.skin} stroke="#95694e" strokeWidth="3"/>
 <path d={e.hairStyle==="short"?"M77 84 Q72 23 128 24 Q188 20 183 81 Q160 63 135 59 Q109 76 77 84Z":e.hairStyle==="swept"?"M76 91 Q66 25 130 20 Q186 18 183 84 Q169 55 146 53 Q116 82 76 91Z":e.hairStyle==="curly"?"M76 90 Q64 56 83 39 Q81 15 108 25 Q132 8 148 25 Q178 12 181 43 Q198 59 181 91 L170 66 Q126 75 90 69Z":"M77 82 Q68 20 128 21 Q190 18 182 86 L191 159 L170 157 L169 77 Q127 56 91 78 L91 156 L71 158Z"} fill={e.hairColor} stroke="#392c27" strokeWidth="3"/>
 <ellipse cx="110" cy="95" rx="4" ry="5" fill="#2b2523"/><ellipse cx="151" cy="95" rx="4" ry="5" fill="#2b2523"/>
 <path d="M130 97 L125 112 Q130 116 135 112" fill="none" stroke="#99684e" strokeWidth="2" strokeLinecap="round"/>
 {e.beard==="stubble"&&<path d="M93 119 Q99 147 130 146 Q161 146 168 119 Q130 136 93 119" fill={e.beardColor} opacity=".45"/>}
 {e.beard==="mustache"&&<path d="M130 123 Q112 115 103 126 Q117 133 130 126 Q144 133 157 126 Q148 115 130 123" fill={e.beardColor}/>}
 {e.beard==="goatee"&&<path d="M130 123 Q111 116 106 127 Q119 132 130 126 Q142 132 154 127 Q148 116 130 123 M117 136 Q130 164 143 136 Q130 144 117 136" fill={e.beardColor}/>}
 {e.beard==="short"&&<path d="M88 115 Q89 147 130 151 Q170 147 172 115 L161 127 Q130 144 99 127Z" fill={e.beardColor}/>}
 {e.beard==="full"&&<path d="M86 108 Q83 146 105 157 L130 170 L155 157 Q179 143 174 108 L162 125 Q130 142 98 125Z" fill={e.beardColor}/>}
 {e.beard==="none"&&<path d="M119 130 Q130 136 142 130" fill="none" stroke="#9a614c" strokeWidth="2" strokeLinecap="round"/>}
 </g></svg>;
}
export default function CreateExplorer(){
 const [e,setE]=useState<Explorer>(initial),[ready,setReady]=useState(false),[saved,setSaved]=useState(false);
 const [tab,setTab]=useState<"look"|"outfit"|"gear"|"details">("look");
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){setE({...initial,...JSON.parse(raw)})}}catch{}setReady(true)},[]);
 const update=(patch:Partial<Explorer>)=>{setE(v=>({...v,...patch}));setSaved(false)};
 const save=()=>{const data={...e,id:e.id||`explorer-${Date.now()}`};localStorage.setItem(KEY,JSON.stringify(data));setE(data);setSaved(true)};
 return <main className="ex-page"><div className="ex-shell">
 <header className="ex-header"><Link href="/digireal-preview">← DigiReal</Link><span>ROAMLAB · EXPLORER STUDIO</span></header>
 <div className="ex-heading"><p>CREATE YOUR EXPLORER</p><h1>Make your own legend.</h1><p>One explorer. Every adventure. Unmistakably yours.</p></div>
 <div className="ex-preview"><div className="ex-sun"/><div className="ex-mountains"/>{ready&&<ExplorerFigure e={e}/>}<span className="ex-preview-label">LIVE CHARACTER PREVIEW</span></div>
 <div className="ex-controls"><nav className="ex-tabs" aria-label="Explorer customization">{(["look","outfit","gear","details"] as const).map(t=><button type="button" key={t} aria-pressed={tab===t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</nav>
 {tab==="look"&&<><label className="ex-label">Explorer Base</label><div className="ex-options">{([{id:"original-male",label:"Original Male"},{id:"original-female",label:"Original Female"}] as const).map(v=><button key={v.id} className={e.base===v.id?"active":""} onClick={()=>update({base:v.id})}>{v.label}</button>)}</div><label className="ex-label">Body Type</label><div className="ex-options">{(["compact","classic","tall"] as const).map(v=><button key={v} className={e.body===v?"active":""} onClick={()=>update({body:v})}>{v}</button>)}</div>
 <label className="ex-label">Skin Tone</label><Swatches values={colors.skin} value={e.skin} onChange={skin=>update({skin})}/>
 <label className="ex-label">Hair Style</label><div className="ex-options">{(["short","swept","curly","long"] as const).map(v=><button key={v} className={e.hairStyle===v?"active":""} onClick={()=>update({hairStyle:v})}>{v}</button>)}</div>
 <label className="ex-label">Hair Color</label><Swatches values={colors.hair} value={e.hairColor} onChange={hairColor=>update({hairColor})}/>
 <label className="ex-label">Facial Hair</label><div className="ex-options">{(["none","stubble","mustache","goatee","short","full"] as const).map(v=><button key={v} className={e.beard===v?"active":""} onClick={()=>update({beard:v})}>{v}</button>)}</div>
 {e.beard!=="none"&&<><label className="ex-label">Beard Color</label><Swatches values={colors.hair} value={e.beardColor} onChange={beardColor=>update({beardColor})}/><button className="ex-link" onClick={()=>update({beardColor:e.hairColor})}>Match hair color</button></>}
 </>}
 {tab==="outfit"&&<><label className="ex-label">Jacket</label><Swatches values={colors.jacket} value={e.jacket} onChange={jacket=>update({jacket})}/>
 <label className="ex-label">Pants</label><Swatches values={colors.pants} value={e.pants} onChange={pants=>update({pants})}/>
 </>}
 {tab==="gear"&&<><label className="ex-label">Backpack</label><Swatches values={colors.pack} value={e.pack} onChange={pack=>update({pack})}/>
 </>}
 {tab==="details"&&<><label className="ex-label" htmlFor="explorer-name">Explorer Name</label><input id="explorer-name" maxLength={28} value={e.name} onChange={event=>update({name:event.target.value})}/></>}
 <button className="ex-save" onClick={save}>Save My Explorer</button>
 {saved&&<div className="ex-success" role="status">✓ Explorer saved on this device. <Link href="/adventure/create">Build Your Adventure →</Link></div>}
 <p className="ex-note">First interactive prototype: layered vector character. Character art is still a functional placeholder. Male and female base selection is stored, but the approved character artwork is not yet integrated.</p>
 </div></div></main>;
}
