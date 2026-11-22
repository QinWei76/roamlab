"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ExplorerViewer = dynamic(() => import("@/components/explorer/ExplorerViewer"), { ssr: false });

export default function ExplorerV2Page() {
  return <main style={{ minHeight: "100dvh", background: "#211a15", color: "#f1dfc6", padding: "18px 16px 42px", fontFamily: "Georgia, serif" }}>
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <Link href="/explorer/create" style={{ color: "#d8aa76" }}>← Explorer Studio</Link>
        <span style={{ font: "11px system-ui", letterSpacing: 2 }}>ROAMLAB · EXPLORER V2</span>
      </header>
      <h1 style={{ fontSize: "clamp(27px, 5vw, 42px)", margin: "0 0 8px" }}>Meet Your Explorer</h1>
      <p style={{ font: "14px/1.6 system-ui", color: "#c9b6a1", marginBottom: 16 }}>Drag to turn · Pinch to zoom · Male V2</p>
      <div style={{ height: "min(72dvh, 740px)", minHeight: 420, borderRadius: 18, border: "1px solid #6e5841", overflow: "hidden", background: "radial-gradient(ellipse at 50% 38%, #4d5146, #242a26 75%)" }}>
        <ExplorerViewer />
      </div>
      <p style={{ font: "13px/1.7 system-ui", color: "#bfae98" }}>Production component preview. Standard standing pose; animation and wearable assets will be connected after compatibility checks.</p>
    </div>
  </main>;
}
