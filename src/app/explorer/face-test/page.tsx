"use client";

import { createElement, useEffect, useRef, useState } from "react";

type Face = "Round" | "Classic" | "Square" | "Slim";
const faces: Face[] = ["Round", "Classic", "Square", "Slim"];
const MODEL = "/roamlab_explorer_face_morph_v01.glb";

function setFaceWeights(source: ArrayBuffer, face: Face): Blob {
  const bytes = new Uint8Array(source.slice(0));
  const view = new DataView(bytes.buffer);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) throw new Error("Not a glTF 2.0 GLB");
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== 0x4e4f534a) throw new Error("GLB JSON chunk missing");
  const start = 20;
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(start, start + jsonLength)));
  const index = faces.indexOf(face);
  const weights = faces.map((_, i) => Number(i === index));
  let found = false;
  for (const mesh of json.meshes ?? []) {
    if (mesh.primitives?.some((p: { targets?: unknown[] }) => p.targets?.length === 4)) {
      mesh.weights = weights;
      found = true;
    }
  }
  if (!found) throw new Error("Four morph targets were not found");
  for (const node of json.nodes ?? []) {
    if (typeof node.mesh === "number" && json.meshes[node.mesh]?.weights?.length === 4) {
      node.weights = weights;
    }
  }
  const encoded = new TextEncoder().encode(JSON.stringify(json));
  const padded = (encoded.length + 3) & ~3;
  const oldBinaryStart = start + jsonLength;
  const remainder = bytes.subarray(oldBinaryStart);
  const output = new Uint8Array(start + padded + remainder.length);
  output.set(bytes.subarray(0, start), 0);
  output.set(encoded, start);
  output.fill(0x20, start + encoded.length, start + padded);
  output.set(remainder, start + padded);
  const header = new DataView(output.buffer);
  header.setUint32(8, output.length, true);
  header.setUint32(12, padded, true);
  return new Blob([output], { type: "model/gltf-binary" });
}

export default function FaceTestPage() {
  const [face, setFace] = useState<Face>("Classic");
  const [src, setSrc] = useState<string>("");
  const [status, setStatus] = useState("Loading 3D viewer...");
  const buffer = useRef<ArrayBuffer | null>(null);
  const viewer = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("@google/model-viewer"), fetch(MODEL).then(async r => {
      if (!r.ok) throw new Error("GLB HTTP " + r.status);
      return r.arrayBuffer();
    })]).then(([, data]) => {
      if (cancelled) return;
      buffer.current = data;
      setStatus("Preparing face geometry...");
    }).catch(e => { if (!cancelled) setStatus("Error: " + String(e)); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!buffer.current) return;
    let url: string;
    try {
      url = URL.createObjectURL(setFaceWeights(buffer.current, face));
      setSrc(url);
      setStatus("Rendering " + face + "...");
    } catch (e) { setStatus("Error: " + String(e)); return; }
    return () => URL.revokeObjectURL(url);
  }, [face, status === "Preparing face geometry..."]);

  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    const loaded = () => setStatus("Ready · " + face);
    const failed = () => setStatus("Model rendering failed");
    element.addEventListener("load", loaded);
    element.addEventListener("error", failed);
    return () => { element.removeEventListener("load", loaded); element.removeEventListener("error", failed); };
  }, [src, face]);

  return (
    <main style={{ minHeight: "100dvh", padding: "24px 16px", background: "radial-gradient(ellipse at 50% 25%, #594535 0%, #251d18 65%, #171310 100%)", color: "#f3e4d1", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ fontSize: 12, letterSpacing: 3, color: "#e3b17d" }}>ROAMLAB · EXPLORER LAB</p>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", margin: "10px 0" }}>Face Shape Test</h1>
        <p style={{ color: "#d6c2aa", lineHeight: 1.6 }}>Technical prototype · Four morph targets · Nose changes with face shape</p>
        <div style={{ marginTop: 18, border: "1px solid #745943", borderRadius: 18, overflow: "hidden", background: "radial-gradient(circle, #7c6751, #382c23 65%, #251d18)", height: "min(62vh, 540px)", minHeight: 320 }}>
          {createElement("model-viewer", {
            ref: viewer, src: src || undefined, alt: "RoamLab face morph technical prototype",
            "camera-controls": "", "auto-rotate": "", "shadow-intensity": "1",
            "environment-image": "neutral", "camera-orbit": "0deg 80deg auto",
            style: { width: "100%", height: "100%", display: "block" }
          })}
        </div>
        <p role="status" style={{ fontSize: 13, color: "#dfbb8e", minHeight: 20 }}>{status}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10, marginTop: 12 }}>
          {faces.map(f => <button key={f} onClick={() => setFace(f)} aria-pressed={face === f} style={{ padding: "14px 12px", borderRadius: 12, cursor: "pointer", border: face === f ? "2px solid #f0b778" : "1px solid #80624a", color: "#f8e7d1", background: face === f ? "#82502f" : "#403025", fontSize: 15, fontWeight: 600 }}>{f}</button>)}
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "#bfae9c", marginTop: 20 }}>Drag to rotate · Pinch or scroll to zoom. Each selection applies actual GLB morph weights and reloads the test model. This is a low-fidelity geometry test, not the approved final character.</p>
      </div>
    </main>
  );
}
