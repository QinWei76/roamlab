"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Phase = "Starting" | "Downloading" | "Parsing" | "Rendering" | "Rendered" | "Failed";
export default function ExplorerPipelineTest() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("Starting");
  const [detail, setDetail] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const controller = new AbortController();
    let cancelled = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let raf = 0;
    const t0 = performance.now();
    const elapsed = () => ((performance.now() - t0) / 1000).toFixed(1) + "s";
    const fail = (error: unknown, stage: string) => {
      if (cancelled) return;
      setPhase("Failed");
      setDetail(stage + ": " + String(error) + " · " + elapsed());
    };
    const run = async () => {
      let received = 0;
      try {
        setPhase("Downloading");
        setDetail("Requesting original Male V2 GLB");
        const response = await fetch("/explorer-male-v2.glb?pipeline=" + attempt, {
          signal: controller.signal, cache: "no-store"
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const total = Number(response.headers.get("content-length")) || 0;
        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let last = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          if (cancelled) return;
          if (performance.now() - last > 250) {
            last = performance.now();
            setDetail((received / 1048576).toFixed(2) + " MB" + (total ? " / " + (total / 1048576).toFixed(2) + " MB" : "") + " · " + elapsed());
          }
        }
        if (total && received !== total) throw new Error("Incomplete download: " + received + "/" + total);
        if (cancelled) return;
        const buffer = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
        setPhase("Parsing");
        setDetail("Downloaded " + (received / 1048576).toFixed(2) + " MB in " + elapsed() + ". Parsing GLB...");
        const gltf = await new GLTFLoader().parseAsync(buffer.buffer, "/");
        if (cancelled) return;
        setPhase("Rendering");
        setDetail("Parsed successfully. Initializing WebGL...");
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#313a34");
        scene.add(new THREE.HemisphereLight(0xffffff, 0x665b4e, 2));
        const sun = new THREE.DirectionalLight(0xffffff, 2);
        sun.position.set(2, 4, 5);
        scene.add(sun);
        const model = gltf.scene;
        scene.add(model);
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        if (box.isEmpty()) throw new Error("GLB has empty model bounds");
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 1000);
        const dist = Math.max(size.y / (2 * Math.tan(35 * Math.PI / 360)) * 1.3, size.x * 3, 2);
        camera.position.set(center.x, center.y, center.z + dist);
        camera.lookAt(center);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setSize(width, height);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        host.appendChild(renderer.domElement);
        renderer.render(scene, camera);
        setPhase("Rendered");
        setDetail("GLB downloaded, parsed and rendered · " + elapsed() + " · " + gltf.scene.children.length + " root objects");
        const loop = () => {
          if (cancelled || !renderer) return;
          raf = requestAnimationFrame(loop);
          renderer.render(scene, camera);
        };
        loop();
      } catch (error) { fail(error, received ? "After receiving " + (received / 1048576).toFixed(2) + " MB" : "Fetch"); }
    };
    void run();
    return () => {
      cancelled = true;
      controller.abort();
      cancelAnimationFrame(raf);
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [attempt]);
  return <main style={{ minHeight: "100dvh", background: "#211a15", color: "#f1dfc6", padding: 20, fontFamily: "system-ui" }}>
    <div style={{ maxWidth: 700, margin: "auto" }}>
      <a href="/explorer/v2" style={{ color: "#d8aa76" }}>← Explorer V2</a>
      <h1>Explorer pipeline test</h1>
      <p>Original Male V2 only. No backpack, Idle, or OrbitControls.</p>
      <section role="status" aria-live="polite" style={{ border: "1px solid #80664a", borderRadius: 12, padding: 16, overflowWrap: "anywhere" }}>
        <h2 style={{ marginTop: 0 }}>{phase}</h2><p>{detail}</p>
      </section>
      <div ref={hostRef} style={{ width: "100%", height: "60dvh", minHeight: 340, marginTop: 16, border: "1px solid #80664a", borderRadius: 12, overflow: "hidden" }} />
      <button type="button" onClick={() => setAttempt(x => x + 1)} style={{ marginTop: 16, background: "#d8aa76", border: 0, borderRadius: 8, padding: "12px 18px", color: "#211a15" }}>Retry pipeline</button>
    </div>
  </main>;
}
