"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Rig = { shoulder: THREE.Bone; forearm: THREE.Bone | null; original: Map<string, THREE.Quaternion> };
type Pose = "original" | "raise" | "bend";
const button: React.CSSProperties = { padding: "13px 16px", borderRadius: 10, background: "#805334", color: "#fff5e9", border: "1px solid #c18b56", fontSize: 15, fontWeight: 600, touchAction: "manipulation" };

export default function RigTest() {
  const stage = useRef<HTMLDivElement>(null);
  const rigRef = useRef<Rig | null>(null);
  const poseRef = useRef<(pose: Pose) => void>(() => {});
  const [status, setStatus] = useState("Preparing 3D engine...");
  const [bones, setBones] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [pose, setPose] = useState<Pose>("original");

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
      poseRef.current = (next: Pose) => {
        const rig = rigRef.current;
        if (!rig) return;
        for (const bone of found) {
          const q = rig.original.get(bone.uuid);
          if (q) bone.quaternion.copy(q);
        }
        if (next !== "original") {
          // Local Z rotation is intentionally small for the first deformation test.
          rig.shoulder.rotateZ(-0.45);
          if (next === "bend" && rig.forearm) rig.forearm.rotateZ(-0.5);
        }
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

  const changePose = (next: Pose) => { poseRef.current(next); setPose(next); };
  return <main style={{ minHeight: "100dvh", background: "#171b1a", color: "#f5ede0", padding: "18px 14px", fontFamily: "system-ui,sans-serif" }}>
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <a href="/explorer/glb-diagnostic" style={{ color: "#d7aa7d" }}>← Working GLB Diagnostic</a>
      <h1 style={{ fontSize: 25, margin: "18px 0 8px" }}>Explorer V2 · Bone Motion Test</h1>
      <p style={{ color: "#c8b7a5", lineHeight: 1.6 }}>Male V2 · Three.js skeleton control · drag to rotate · pinch to zoom</p>
      <p role="status" style={{ color: ready ? "#b9dfa7" : "#eac08e", minHeight: 44, lineHeight: 1.5, overflowWrap: "anywhere" }}>{status}</p>
      <div ref={stage} style={{ height: "min(62dvh,600px)", minHeight: 340, border: "1px solid #64584a", borderRadius: 14, overflow: "hidden", touchAction: "none" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        <button disabled={!ready} onClick={() => changePose("original")} style={{ ...button, opacity: ready ? 1 : 0.45, background: pose === "original" ? "#ae7545" : "#805334" }}>Original Pose</button>
        <button disabled={!ready} onClick={() => changePose("raise")} style={{ ...button, opacity: ready ? 1 : 0.45, background: pose === "raise" ? "#ae7545" : "#805334" }}>Raise Right Arm</button>
        <button disabled={!ready} onClick={() => changePose("bend")} style={{ ...button, opacity: ready ? 1 : 0.45, background: pose === "bend" ? "#ae7545" : "#805334" }}>Bend Right Elbow</button>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: "#c3b7a8" }}>Experimental local bone rotations, not a finished animation. Check the shoulder, sleeve and elbow for distortion. The direction of rotation may need calibration.</p>
      <details style={{ fontSize: 12, color: "#bdb2a4", overflowWrap: "anywhere" }}><summary>Detected bone names ({bones.length})</summary><p>{bones.join(", ") || "Waiting for model..."}</p></details>
    </div>
  </main>;
}
