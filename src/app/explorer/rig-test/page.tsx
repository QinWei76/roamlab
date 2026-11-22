"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Rig = { shoulder: THREE.Bone; forearm: THREE.Bone | null; original: Map<string, THREE.Quaternion> };
type Angles = { forward: number; side: number; elbow: number };
const button: React.CSSProperties = { padding: "13px 16px", borderRadius: 10, background: "#805334", color: "#fff5e9", border: "1px solid #c18b56", fontSize: 15, fontWeight: 600, touchAction: "manipulation" };

export default function RigTest() {
  const stage = useRef<HTMLDivElement>(null);
  const rigRef = useRef<Rig | null>(null);
  const applyRef = useRef<(angles: Angles) => void>(() => {});
  const [status, setStatus] = useState("Preparing 3D engine...");
  const [bones, setBones] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [angles, setAngles] = useState<Angles>({ forward: 0, side: 0, elbow: 0 });

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    let disposed = false;
    let frame = 0;
    let controls: OrbitControls | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#333a35");
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
    camera.position.set(0, 1.4, 4);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x62605c, 2.5));
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(3, 6, 5);
    scene.add(sun);
    const updateSize = () => {
      if (!renderer) return;
      const w = Math.max(host.clientWidth, 1), h = Math.max(host.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(updateSize);
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      host.appendChild(renderer.domElement);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.minDistance = 0.5;
      controls.maxDistance = 25;
      observer.observe(host);
      updateSize();
      const draw = () => {
        if (disposed) return;
        frame = requestAnimationFrame(draw);
        controls?.update();
        renderer?.render(scene, camera);
      };
      draw();
    } catch (error) {
      setStatus("3D engine failed: " + String(error));
      return () => { observer.disconnect(); renderer?.dispose(); };
    }
    setStatus("Downloading Male V2 (5.2 MB) — one model request only...");
    new GLTFLoader().load("/explorer-male-v2.glb", gltf => {
      if (disposed) return;
      scene.add(gltf.scene);
      const bounds = new THREE.Box3().setFromObject(gltf.scene);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      controls!.target.copy(center);
      camera.position.set(center.x, center.y + size.y * 0.08, center.z + Math.max(size.y * 1.6, 2));
      camera.lookAt(center);
      controls!.update();
      const found: THREE.Bone[] = [];
      gltf.scene.traverse(node => { if ((node as THREE.Bone).isBone) found.push(node as THREE.Bone); });
      const normalized = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const right = found.filter(b => /right|mixamorigr/.test(normalized(b.name)));
      const rightArm = right.find(b => /rightarm$|rightupperarm$/.test(normalized(b.name)))
        || right.find(b => /rightarm/.test(normalized(b.name)) && !/fore|lower|twist|hand/.test(normalized(b.name)));
      const rightForearm = right.find(b => /rightforearm|rightlowerarm/.test(normalized(b.name))) || null;
      setBones(found.map(b => b.name));
      if (!rightArm) {
        setStatus("Model loaded (" + found.length + " bones), but right upper-arm bone was not recognized. See bone names below.");
        return;
      }
      const original = new Map(found.map(b => [b.uuid, b.quaternion.clone()]));
      rigRef.current = { shoulder: rightArm, forearm: rightForearm, original };
      applyRef.current = (next: Angles) => {
        const rig = rigRef.current;
        if (!rig) return;
        for (const bone of found) {
          const q = rig.original.get(bone.uuid);
          if (q) bone.quaternion.copy(q);
        }
        const radians = Math.PI / 180;
        // Forward uses the previously verified local Z direction.
        rig.shoulder.rotateZ(-next.forward * radians);
        // Side is a separate experimental local-axis calibration.
        rig.shoulder.rotateX(next.side * radians);
        if (rig.forearm) rig.forearm.rotateZ(-next.elbow * radians);
        rig.shoulder.updateWorldMatrix(true, true);
      };
      setReady(true);
      setStatus("Loaded " + found.length + " bones. Right arm: " + rightArm.name + ". Test a pose below.");
    }, undefined, error => {
      if (!disposed) setStatus("Model download or parse failed: " + String(error));
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls?.dispose();
      rigRef.current = null;
      scene.traverse(object => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
        materials.forEach(material => material.dispose());
      });
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  const changeAngle = (key: keyof Angles, value: number) => {
    setAngles(previous => {
      const next = { ...previous, [key]: value };
      applyRef.current(next);
      return next;
    });
  };
  const reset = () => {
    const next = { forward: 0, side: 0, elbow: 0 };
    applyRef.current(next);
    setAngles(next);
  };
  const slider = (key: keyof Angles, label: string, max: number, note: string) =>
    <label key={key} style={{ display: "block", padding: "12px 0", borderBottom: "1px solid #49453e" }}>
      <span style={{ display: "flex", justifyContent: "space-between", gap: 12, fontWeight: 600 }}>
        <span>{label}</span><span style={{ color: "#f1bc84", fontVariantNumeric: "tabular-nums" }}>{angles[key]}°</span>
      </span>
      <input type="range" min={0} max={max} step={5} value={angles[key]} disabled={!ready}
        onChange={event => changeAngle(key, Number(event.target.value))}
        style={{ width: "100%", height: 36, accentColor: "#c18b56", touchAction: "pan-x" }} />
      <span style={{ fontSize: 12, color: "#c3b7a8" }}>{note}</span>
    </label>;
  return <main style={{ minHeight: "100dvh", background: "#171b1a", color: "#f5ede0", padding: "18px 14px", fontFamily: "system-ui,sans-serif" }}>
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <a href="/explorer/glb-diagnostic" style={{ color: "#d7aa7d" }}>← Working GLB Diagnostic</a>
      <h1 style={{ fontSize: 25, margin: "18px 0 8px" }}>Explorer V2 · Bone Motion Test</h1>
      <p style={{ color: "#c8b7a5", lineHeight: 1.6 }}>Male V2 · Three.js skeleton control · drag to rotate · pinch to zoom</p>
      <p role="status" style={{ color: ready ? "#b9dfa7" : "#eac08e", minHeight: 44, lineHeight: 1.5, overflowWrap: "anywhere" }}>{status}</p>
      <div ref={stage} style={{ height: "min(62dvh,600px)", minHeight: 340, border: "1px solid #64584a", borderRadius: 14, overflow: "hidden", touchAction: "none" }} />
      <section style={{ marginTop: 16, padding: "14px 16px", border: "1px solid #64584a", borderRadius: 14 }}>
        <h2 style={{ fontSize: 19, margin: "0 0 8px" }}>Right Arm · Angle Calibration</h2>
        {slider("forward", "Forward Raise · 前举", 120, "Verified forward direction; increase gradually and check the shoulder.")}
        {slider("side", "Side Raise · 侧举", 90, "Experimental axis; check from front and side.")}
        {slider("elbow", "Elbow Bend · 屈肘", 135, rigRef.current?.forearm ? "Check sleeve and elbow deformation." : "Waiting for forearm bone.")}
        <button type="button" disabled={!ready} onClick={reset}
          style={{ ...button, marginTop: 14, opacity: ready ? 1 : 0.45 }}>Reset All · 恢复初始姿势</button>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#c3b7a8" }}>
          Adjust slowly. These are experimental local-bone angles, not anatomical measurements.
          If the arm twists unnaturally, reset and report the angle. No animation or GLB changes are saved.
        </p>
      </section>
      <details style={{ fontSize: 12, color: "#bdb2a4", overflowWrap: "anywhere" }}><summary>Detected bone names ({bones.length})</summary><p>{bones.join(", ") || "Waiting for model..."}</p></details>
    </div>
  </main>;
}
