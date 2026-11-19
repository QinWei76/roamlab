"use client";

import { createElement, useEffect, useRef, useState } from "react";

const MODEL = "/roamlab_explorer_male_fullbody_blockout_v01.glb";

export default function MaleTestPage() {
  const [status, setStatus] = useState("Preparing 3D viewer...");
  const [rotate, setRotate] = useState(false);
  const [view, setView] = useState<"front" | "side" | "back">("front");
  const viewer = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      import("@google/model-viewer"),
      fetch(MODEL, { method: "HEAD", cache: "no-store" }).then(r => {
        if (!r.ok) throw new Error("GLB not found (HTTP " + r.status + ")");
      }),
    ]).then(() => { if (active) setStatus("Loading full-body model..."); })
      .catch(e => { if (active) setStatus("Error: " + String(e)); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const el = viewer.current;
    if (!el) return;
    const onLoad = () => setStatus("Ready · Full-body blockout");
    const onError = () => setStatus("Error · Model could not be rendered");
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    return () => { el.removeEventListener("load", onLoad); el.removeEventListener("error", onError); };
  }, []);

  useEffect(() => {
    const el = viewer.current as (HTMLElement & { cameraOrbit?: string; jumpCameraToGoal?: () => void }) | null;
    if (!el) return;
    el.cameraOrbit = view === "front" ? "0deg 80deg auto" : view === "side" ? "90deg 80deg auto" : "180deg 80deg auto";
    el.jumpCameraToGoal?.();
  }, [view]);

  const buttonStyle = (selected: boolean): React.CSSProperties => ({
    padding: "12px 14px", borderRadius: 10, border: selected ? "2px solid #eeb27a" : "1px solid #88674d",
    color: "#f7e7d3", background: selected ? "#7a4a2d" : "#3c2c23", cursor: "pointer", fontWeight: 600,
  });

  return (
    <main style={{ minHeight: "100dvh", padding: "22px 16px 36px", color: "#f3e4d1", background: "radial-gradient(ellipse at 50% 25%, #604938 0%, #271e19 65%, #171310 100%)", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontSize: 12, letterSpacing: 3, color: "#e5b785" }}>ROAMLAB · EXPLORER LAB</p>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", margin: "10px 0" }}>Male Explorer · Full-body Test</h1>
        <p style={{ lineHeight: 1.6, color: "#d6c2aa" }}>Geometry-only prototype · Corrected upright orientation · Not final character art</p>
        <div style={{ marginTop: 18, height: "min(68vh, 630px)", minHeight: 350, borderRadius: 18, overflow: "hidden", border: "1px solid #785c46", background: "radial-gradient(circle, #786550, #392d24 70%)" }}>
          {createElement("model-viewer", {
            ref: viewer, src: MODEL, alt: "RoamLab full-body male explorer blockout",
            "camera-controls": "", "orientation": "-90deg 0deg 0deg", "auto-rotate": rotate ? "" : undefined, "auto-rotate-delay": "0",
            "shadow-intensity": "1", "environment-image": "neutral",
            "camera-orbit": "0deg 80deg auto", "field-of-view": "30deg",
            style: { width: "100%", height: "100%", display: "block" }
          })}
        </div>
        <p role="status" style={{ fontSize: 13, color: "#e2bd90", minHeight: 20 }}>{status}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 9 }}>
          {(["front", "side", "back"] as const).map(v => <button key={v} type="button" onClick={() => { setRotate(false); setView(v); }} style={buttonStyle(view === v && !rotate)}>{v === "front" ? "Front" : v === "side" ? "Side" : "Back"}</button>)}
        </div>
        <button type="button" onClick={() => setRotate(v => !v)} style={{ ...buttonStyle(rotate), marginTop: 10, width: "100%" }}>{rotate ? "Pause rotation" : "Auto rotate"}</button>
        <p style={{ fontSize: 12, lineHeight: 1.7, color: "#c6b4a1", marginTop: 18 }}>Drag to rotate · Pinch to zoom. This is an early blockout model, not the approved final character. This page does not change the existing Explorer or face-test pages.</p>
      </div>
    </main>
  );
}
