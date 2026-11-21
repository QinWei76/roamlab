"use client";

import { createElement, useEffect, useRef, useState } from "react";

type View = "front" | "right" | "back" | "left";
type MaterialMode = "original" | "clay";

export default function GlbDiagnostic() {
  const viewerRef = useRef<HTMLElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [src, setSrc] = useState("/explorer-male-v2.glb");
  const [character, setCharacter] = useState<"female" | "male" | "local">("local");
  const [filename, setFilename] = useState("explorer-male-v2.glb");
  const [status, setStatus] = useState("Loading Explorer V2 from RoamLab...");
  const [view, setView] = useState<View>("front");
  const [mode, setMode] = useState<MaterialMode>("original");
  const [loaded, setLoaded] = useState(false);
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    import("@google/model-viewer").catch((err) => setStatus("Viewer initialization failed: " + String(err)));
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); };
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onLoad = () => { setLoaded(true); setStatus("Loaded. Compare original and clay views."); };
    const onError = () => { setLoaded(false); setStatus("Could not load this model. Check whether the matching GLB has been uploaded to GitHub public."); };
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    return () => { el.removeEventListener("load", onLoad); el.removeEventListener("error", onError); };
  }, [src]);

  useEffect(() => {
    const el = viewerRef.current as (HTMLElement & { cameraOrbit?: string; jumpCameraToGoal?: () => void }) | null;
    if (!el || !loaded) return;
    const azimuth: Record<View, string> = { front: "0deg", right: "90deg", back: "180deg", left: "270deg" };
    el.cameraOrbit = azimuth[view] + " 80deg auto";
    el.jumpCameraToGoal?.();
  }, [view, loaded]);

  useEffect(() => {
    const el = viewerRef.current as (HTMLElement & { model?: { materials?: Array<{ pbrMetallicRoughness?: { baseColorTexture?: { texture?: unknown; setTexture?: (texture: unknown) => void }; setBaseColorFactor?: (factor: number[] | string) => void } }> } }) | null;
    if (!el?.model?.materials || !loaded) return;
    try {
      for (const material of el.model.materials) {
        const pbr = material.pbrMetallicRoughness;
        if (!pbr) continue;
        const tex = pbr.baseColorTexture;
        if (tex && !(tex as any).__roamlabOriginalCaptured) {
          (tex as any).__roamlabOriginalCaptured = true;
          (tex as any).__roamlabOriginalTexture = tex.texture ?? null;
        }
        if (mode === "clay") {
          tex?.setTexture?.(null);
          pbr.setBaseColorFactor?.([0.78, 0.78, 0.76, 1]);
        } else {
          tex?.setTexture?.((tex as any)?.__roamlabOriginalTexture ?? null);
          pbr.setBaseColorFactor?.([1, 1, 1, 1]);
        }
      }
    } catch (error) { setStatus("Material switch unavailable for this model: " + String(error)); }
  }, [mode, loaded]);

  const pickFile = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".glb")) { setStatus("Please choose a .glb file."); return; }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setLoaded(false); setMode("original"); setView("front"); setCharacter("local"); setSrc(url);
    setFilename(file.name);
    setStatus("Loading " + file.name + " (" + (file.size / 1048576).toFixed(1) + " MB)...");
  };

  const chooseCharacter = (gender: "female" | "male") => {
    setLoaded(false); setMode("original"); setView("front"); setSpin(false); setCharacter(gender);
    setFilename(`explorer-${gender}-github.glb`);
    setStatus(`Loading ${gender} Explorer from RoamLab...`);
    setSrc(`/explorer-${gender}-github.glb`);
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 14px", borderRadius: 9, border: "1px solid " + (active ? "#e8a15e" : "#625448"),
    background: active ? "#6c4327" : "#282622", color: "#f5ede0", cursor: "pointer", fontSize: 14
  });

  return (
    <main style={{ minHeight: "100dvh", background: "#171b1a", color: "#f5ede0", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <a href="/explorer" style={{ color: "#d4ad82", textDecoration: "none", fontSize: 13 }}>← Explorer</a>
        <h1 style={{ fontSize: 25, margin: "15px 0 6px" }}>RoamLab · Explorer V2 Diagnostic</h1>
        <p style={{ color: "#bdb3a7", lineHeight: 1.6, marginTop: 0 }}>Models load automatically from RoamLab. You can also inspect a local GLB file without uploading it.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 14 }}><button onClick={() => chooseCharacter("female")} style={buttonStyle(character === "female")}>Female Explorer</button><button onClick={() => chooseCharacter("male")} style={buttonStyle(character === "male")}>Male Explorer</button></div>
        <label style={{ display: "inline-block", padding: "12px 17px", background: "#ae7545", borderRadius: 9, cursor: "pointer", fontWeight: 650, color: "#181714" }}>
          Choose local GLB (optional)
          <input type="file" accept=".glb,model/gltf-binary" onChange={(e) => pickFile(e.target.files?.[0])} style={{ display: "none" }} />
        </label>
        <p role="status" style={{ color: "#d3c3ad", fontSize: 13, minHeight: 20 }}>{status}</p>
        <div style={{ position: "relative", width: "100%", height: "min(64vh, 650px)", minHeight: 360, border: "1px solid #514a40", borderRadius: 14, overflow: "hidden", background: "radial-gradient(circle at 50% 42%, #6b665d 0%, #353733 52%, #1c211f 100%)" }}>
          {src ? createElement("model-viewer", {
            key: src, ref: viewerRef, src, alt: filename || "GLB character model",
            "camera-controls": "", "auto-rotate": spin ? "" : undefined,
            "auto-rotate-delay": "0", "environment-image": "neutral",
            "shadow-intensity": "1", "camera-orbit": "0deg 80deg auto",
            "field-of-view": "30deg", style: { width: "100%", height: "100%", display: "block" }
          }) : <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#bdb3a7", textAlign: "center", padding: 24 }}>Choose your male or female GLB above to inspect it here.</div>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {(["front", "right", "back", "left"] as View[]).map((v) => <button key={v} disabled={!loaded} onClick={() => { setSpin(false); setView(v); }} style={buttonStyle(view === v)}>{v[0].toUpperCase() + v.slice(1)}</button>)}
          <button disabled={!loaded} onClick={() => setSpin((s) => !s)} style={buttonStyle(spin)}>{spin ? "Stop rotation" : "Auto rotate"}</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button disabled={!loaded} onClick={() => setMode("original")} style={buttonStyle(mode === "original")}>Original texture</button>
          <button disabled={!loaded} onClick={() => setMode("clay")} style={buttonStyle(mode === "clay")}>Clay / no color texture</button>
        </div>
        <p style={{ fontSize: 13, color: "#bdb3a7", lineHeight: 1.7, marginTop: 18 }}>Test: inspect the face and jacket with Original texture, then switch to Clay. If defects remain in Clay, geometry may be damaged. If they disappear, texture mapping is a likely cause. Clay mode removes base-color texture only; normal/other material maps may remain. The front view is relative to the GLB coordinate system and may not match the character's actual face direction.</p>
      </div>
    </main>
  );
}
