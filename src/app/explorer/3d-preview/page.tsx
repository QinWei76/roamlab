"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MODEL_PATH = "/explorer/models/explorer-master.glb";

export default function Explorer3DPreview() {
  const [status, setStatus] = useState<"checking" | "missing" | "ready">("checking");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(MODEL_PATH, { method: "HEAD", cache: "no-store" })
      .then((response) => { if (active) setStatus(response.ok ? "ready" : "missing"); })
      .catch(() => { if (active) setStatus("missing"); });
    return () => { active = false; };
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#211a15", color: "#f2dfc3", padding: "20px 16px 60px", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/explorer/create" style={{ color: "#e5b67e", textDecoration: "none" }}>← Explorer Studio</Link>
          <span style={{ font: "10px Arial, sans-serif", letterSpacing: 2 }}>ROAMLAB · 3D LAB</span>
        </header>
        <div style={{ textAlign: "center" }}>
          <div style={{ font: "11px Arial, sans-serif", letterSpacing: 3, color: "#e3a45f" }}>3D CHARACTER TEST</div>
          <h1 style={{ fontSize: 34, margin: "12px 0" }}>Explorer Master</h1>
          <p style={{ font: "13px/1.6 Arial, sans-serif", color: "#d3baa0" }}>Independent 3D viewer · Approved character artwork only</p>
        </div>
        <section style={{ marginTop: 24, border: "1px solid #77543b", borderRadius: 16, overflow: "hidden", background: "radial-gradient(circle at 50% 35%, #8d694b, #29251e 70%)", minHeight: 410, display: "grid", placeItems: "center", position: "relative" }}>
          {status === "ready" && !loadError ? (
            <iframe title="Interactive 3D explorer model viewer" srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}model-viewer{width:100%;height:100%;--poster-color:transparent}</style><script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script></head><body><model-viewer src="${MODEL_PATH}" camera-controls auto-rotate shadow-intensity="1" exposure="1.15" interaction-prompt="auto" alt="3D RoamLab explorer"></model-viewer></body></html>`} style={{ width: "100%", height: 440, border: 0 }} onError={() => setLoadError(true)} />
          ) : (
            <div style={{ padding: 30, textAlign: "center" }}>
              <div style={{ fontSize: 46, marginBottom: 18 }}>◇</div>
              <h2 style={{ fontSize: 22, fontWeight: "normal" }}>{status === "checking" ? "Checking model assets…" : "Awaiting approved 3D character"}</h2>
              <p style={{ font: "13px/1.7 Arial, sans-serif", color: "#dbc7b1" }}>The viewer is prepared. No substitute character is shown because the approved male and female GLB models have not been produced yet.</p>
            </div>
          )}
        </section>
        <div style={{ marginTop: 20, padding: 18, border: "1px solid #59432e", borderRadius: 12, background: "#30261f", font: "13px/1.8 Arial, sans-serif" }}>
          <strong>3D readiness</strong>
          <p>Model asset: {status === "ready" ? "Found" : status === "checking" ? "Checking…" : "Not uploaded"}</p>
          <p>Expected first asset: <code style={{ overflowWrap: "anywhere" }}>{MODEL_PATH}</code></p>
          <p>Controls after model upload: drag to rotate, pinch to zoom.</p>
          <p style={{ color: "#d0aa7e" }}>This is a technical preview, not the final character creator.</p>
        </div>
      </div>
    </main>
  );
}
