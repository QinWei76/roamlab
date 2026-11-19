"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Explorer = {
  base: "original-male" | "original-female";
  skin: string; hairColor: string; jacket: string; pants: string; pack: string;
  hairStyle: string; beard: string; beardColor: string; body: string;
  name: string; id: string;
};
const KEY = "roamlab-digireal-explorer-v1";
const defaults: Explorer = { base: "original-male", skin: "#DDA47E", hairColor: "#503629", jacket: "#C87836", pants: "#4C5148", pack: "#61745C", hairStyle: "swept", beard: "none", beardColor: "#503629", body: "classic", name: "My Explorer", id: "" };
const palette: Record<string,string[]> = {
  skin: ["#F1C7A4","#DDA47E","#B97855","#875238","#543628"],
  hairColor: ["#28211F","#503629","#8F593A","#D9B66E","#B95D35","#B8B9BB"],
  jacket: ["#C87836","#5B785E","#5C7189","#A65B4A","#D1B98D"],
  pants: ["#4C5148","#5B493D","#697282","#B49B7A"],
  pack: ["#61745C","#B47B45","#4E6575","#8C554B"]
};
const asset = (base: Explorer["base"]) => `/explorer/models/${base}.glb`;

export default function Explorer3DPreview() {
  const [explorer, setExplorer] = useState<Explorer>(defaults);
  const [status, setStatus] = useState<"checking" | "missing" | "ready">("checking");
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"Look" | "Outfit" | "Gear" | "Details">("Look");
  const modelPath = asset(explorer.base);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setExplorer({ ...defaults, ...JSON.parse(raw) });
    } catch { /* use defaults */ }
  }, []);
  useEffect(() => {
    let active = true;
    setStatus("checking");
    fetch(modelPath, { method: "HEAD", cache: "no-store" })
      .then(r => { if (active) setStatus(r.ok ? "ready" : "missing"); })
      .catch(() => { if (active) setStatus("missing"); });
    return () => { active = false; };
  }, [modelPath]);
  const change = (patch: Partial<Explorer>) => { setExplorer(e => ({ ...e, ...patch })); setSaved(false); };
  const save = () => {
    try {
      const next = { ...explorer, id: explorer.id || "explorer-" + Date.now() };
      localStorage.setItem(KEY, JSON.stringify(next));
      setExplorer(next); setSaved(true);
    } catch { setSaved(false); }
  };
  const option = (label: string, value: string, selected: boolean, onClick: () => void) =>
    <button key={value} type="button" onClick={onClick} aria-pressed={selected} style={{ border: selected ? "2px solid #efac65" : "1px solid #71523b", background: selected ? "#63412a" : "#33271f", color: "#f3ddc3", padding: "10px 12px", borderRadius: 9, cursor: "pointer" }}>{label}</button>;
  const swatches = (key: keyof Explorer, label: string) =>
    <div style={{ marginTop: 16 }}><div style={{ marginBottom: 9, fontSize: 13 }}>{label}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{palette[key].map(color =>
      <button key={color} type="button" aria-label={label + " " + color} aria-pressed={explorer[key] === color} onClick={() => change({ [key]: color })} style={{ width: 38, height: 38, borderRadius: "50%", background: color, border: explorer[key] === color ? "3px solid #f5d3a2" : "2px solid #645043", outline: explorer[key] === color ? "2px solid #b87c46" : "none", cursor: "pointer" }} />)}</div></div>;
  return (
    <main style={{ minHeight: "100vh", background: "#211a15", color: "#f2dfc3", padding: "20px 16px 60px", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <Link href="/explorer/create" style={{ color: "#e5b67e", textDecoration: "none" }}>← Explorer Studio</Link>
          <span style={{ font: "10px Arial, sans-serif", letterSpacing: 2 }}>ROAMLAB · 3D LAB</span>
        </header>
        <div style={{ textAlign: "center" }}>
          <div style={{ font: "11px Arial, sans-serif", letterSpacing: 3, color: "#e3a45f" }}>CHARACTER CUSTOMIZATION TEST</div>
          <h1 style={{ fontSize: 32, margin: "12px 0" }}>Create Your Explorer</h1>
          <p style={{ font: "13px/1.6 Arial, sans-serif", color: "#d3baa0" }}>Choose your character and customize the details.</p>
        </div>
        <section style={{ marginTop: 18, border: "1px solid #77543b", borderRadius: 16, overflow: "hidden", background: "radial-gradient(circle at 50% 35%, #8d694b, #29251e 70%)", minHeight: 330, display: "grid", placeItems: "center" }}>
          {status === "ready" ? (
            <iframe key={modelPath} title="Interactive 3D explorer model viewer" srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}model-viewer{width:100%;height:100%;--poster-color:transparent}</style><script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script></head><body><model-viewer src="${modelPath}" camera-controls auto-rotate shadow-intensity="1" exposure="1.15" alt="RoamLab 3D explorer"></model-viewer></body></html>`} style={{ width: "100%", height: 370, border: 0 }} />
          ) : <div style={{ padding: 26, textAlign: "center" }}>
            <div style={{ fontSize: 38 }}>◇</div>
            <h2 style={{ fontSize: 22, fontWeight: "normal" }}>{status === "checking" ? "Checking character model…" : "3D model in production"}</h2>
            <p style={{ font: "13px/1.7 Arial, sans-serif", color: "#dbc7b1" }}>Your selections can be saved now. The approved 3D character model is not uploaded yet, so the preview cannot show these changes.</p>
          </div>}
        </section>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {(["Look","Outfit","Gear","Details"] as const).map(t => <button type="button" key={t} onClick={() => setTab(t)} aria-pressed={tab === t} style={{ flex: 1, padding: "12px 2px", border: 0, borderBottom: tab === t ? "3px solid #e7a25e" : "2px solid #5d4635", background: "transparent", color: tab === t ? "#ffcf97" : "#d3baa0", cursor: "pointer", fontSize: 13 }}>{t}</button>)}
        </div>
        <section style={{ padding: "18px 4px", font: "14px Arial, sans-serif", minHeight: 175 }}>
          {tab === "Look" && <>
            <p>Explorer base</p><div style={{ display: "flex", gap: 10 }}>
              {option("Male", "male", explorer.base === "original-male", () => change({ base: "original-male" }))}
              {option("Female", "female", explorer.base === "original-female", () => change({ base: "original-female" }))}
            </div>
            {swatches("skin", "Skin tone")}
            <p>Hair style</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["short","swept","curly","long"].map(v => option(v, v, explorer.hairStyle === v, () => change({ hairStyle: v })))}</div>
            {swatches("hairColor", "Hair color")}
            <p>Beard</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["none","stubble","mustache","goatee","short","full"].map(v => option(v, v, explorer.beard === v, () => change({ beard: v })))}</div>
          </>}
          {tab === "Outfit" && <>{swatches("jacket", "Jacket color")}{swatches("pants", "Pants color")}</>}
          {tab === "Gear" && swatches("pack", "Backpack color")}
          {tab === "Details" && <><label htmlFor="explorer-name">Explorer name</label><input id="explorer-name" value={explorer.name} maxLength={50} onChange={e => change({ name: e.target.value })} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 12, padding: 14, borderRadius: 9, border: "1px solid #785a40", background: "#382a20", color: "#fff" }}/></>}
        </section>
        <button type="button" onClick={save} style={{ width: "100%", padding: 16, background: "#c67b3f", border: 0, borderRadius: 10, color: "#20170f", fontWeight: 700, cursor: "pointer" }}>{saved ? "Explorer Saved ✓" : "Save Explorer Choices"}</button>
        <p style={{ color: "#c6aa8c", font: "12px/1.6 Arial, sans-serif" }}>Prototype: selection and local saving work. Real-time 3D part replacement will be enabled when compatible character assets are ready.</p>
      </div>
    </main>
  );
}
