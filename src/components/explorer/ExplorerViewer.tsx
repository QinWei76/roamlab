"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ExplorerAttachment = {
  id: string;
  url: string;
  bone: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

type Props = { modelUrl?: string; attachments?: ExplorerAttachment[]; className?: string };
export default function ExplorerViewer({ modelUrl = "/explorer-male-v2.glb", attachments = [], className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const recenterRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState("Loading Explorer...");
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    const slowTimer = window.setTimeout(() => { if (!disposed) setSlow(true); }, 12000);
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    let fitModel: (() => void) | null = null;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x65615b, 2.3));
    const key = new THREE.DirectionalLight(0xffeed7, 2.8);
    key.position.set(3, 5, 5);
    scene.add(key);
    const resize = () => {
      if (!renderer) return;
      const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      fitModel?.();
    };
    const observer = new ResizeObserver(resize);
    const loader = new GLTFLoader();
    const assets: THREE.Object3D[] = [];
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    const track = (root: THREE.Object3D) => root.traverse(node => {
      const mesh = node as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      mats.forEach(mat => {
        materials.add(mat);
        for (const value of Object.values(mat)) if (value instanceof THREE.Texture) textures.add(value);
      });
    });
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // setSize(..., false) updates drawing-buffer dimensions only. Without
      // explicit CSS sizing the canvas overflows its mobile viewport.
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      host.appendChild(renderer.domElement);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.touches.ONE = THREE.TOUCH.ROTATE;
      controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
      controls.minDistance = 0.8;
      controls.maxDistance = 12;
      observer.observe(host);
      resize();
      const animate = () => {
        if (disposed) return;
        raf = requestAnimationFrame(animate);
        controls?.update();
        renderer?.render(scene, camera);
      };
      animate();
    } catch (error) {
      setStatus("3D unavailable: " + String(error));
      return () => { observer.disconnect(); renderer?.dispose(); renderer?.domElement.remove(); };
    }
    loader.load(modelUrl, gltf => {
      if (disposed) return;
      const model = gltf.scene;
      assets.push(model);
      track(model);
      scene.add(model);
      // Compute framing from rendered meshes only. Skeleton helpers and GLB
      // hierarchy transforms can make a whole-scene box badly off-center.
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3();
      model.traverse(node => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh || !mesh.visible) return;
        if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
          const skinned = mesh as THREE.SkinnedMesh;
          skinned.computeBoundingBox();
          if (skinned.boundingBox) {
            bounds.union(skinned.boundingBox.clone().applyMatrix4(skinned.matrixWorld));
          }
        } else if (mesh.geometry) {
          mesh.geometry.computeBoundingBox();
          if (mesh.geometry.boundingBox) {
            bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
          }
        }
      });
      if (bounds.isEmpty()) bounds.setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      fitModel = () => {
        const verticalFov = THREE.MathUtils.degToRad(camera.fov);
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
        const heightDistance = size.y / (2 * Math.tan(verticalFov / 2));
        const widthDistance = Math.max(size.x, size.z) / (2 * Math.tan(horizontalFov / 2));
        const distance = Math.max(2, size.y * 1.8, Math.max(heightDistance, widthDistance) * 1.3 + size.z / 2);
        controls!.target.copy(center);
        camera.position.set(center.x, center.y, center.z + distance);
        camera.lookAt(center);
        controls!.minDistance = Math.max(0.1, distance * 0.35);
        controls!.maxDistance = Math.max(12, distance * 3);
        controls!.update();
        controls!.saveState();
      };
      recenterRef.current = () => fitModel?.();
      fitModel();
      window.clearTimeout(slowTimer);
      setSlow(false);
      setLoaded(true);
      setStatus("");
      // Attachment interface is intentionally separate from body posing.
      // A GLB attachment must be authored to fit the target bone.
      for (const item of attachmentsRef.current) {
        const bone = model.getObjectByName(item.bone);
        if (!bone) { console.warn("Explorer attachment bone not found:", item.bone); continue; }
        loader.load(item.url, part => {
          if (disposed) return;
          const object = part.scene;
          object.position.set(...(item.position ?? [0, 0, 0]));
          object.rotation.set(...(item.rotation ?? [0, 0, 0]));
          object.scale.set(...(item.scale ?? [1, 1, 1]));
          bone.add(object);
          assets.push(object);
          track(object);
        }, undefined, error => console.warn("Explorer attachment failed:", item.id, error));
      }
    }, undefined, error => { if (!disposed) { window.clearTimeout(slowTimer); setSlow(true); setStatus("3D model unavailable: " + String(error)); } });
    return () => {
      disposed = true;
      window.clearTimeout(slowTimer);
      recenterRef.current = () => {};
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls?.dispose();
      assets.forEach(item => item.removeFromParent());
      geometries.forEach(item => item.dispose());
      materials.forEach(item => item.dispose());
      textures.forEach(item => item.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [modelUrl, attempt]);
  return <div className={className} style={{ position: "relative", width: "100%", height: "100%", minHeight: 320, touchAction: "none" }}>
    <div ref={hostRef} style={{ width: "100%", height: "100%" }} aria-label="Interactive 3D Explorer" />
    {!loaded && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, pointerEvents: "none", color: "#f1dfc6" }} aria-label="Explorer preview while 3D loads">
      <svg width="130" height="260" viewBox="0 0 130 260" aria-hidden="true" style={{ opacity: 0.85, filter: "drop-shadow(0 14px 18px #0007)" }}>
        <circle cx="65" cy="29" r="22" fill="#bda98c" />
        <path d="M39 57 Q65 46 91 57 L106 136 L84 147 L82 116 L78 164 L94 247 L70 250 L61 175 L51 250 L28 247 L46 162 L47 115 L37 147 L16 136Z" fill="#6e806e" stroke="#d1b999" strokeWidth="2" />
        <path d="M42 61 L65 83 L88 61 M47 120 L83 120" stroke="#c8ad83" strokeWidth="3" fill="none" />
      </svg>
      <span style={{ font: "600 13px system-ui", letterSpacing: 1 }}>EXPLORER PREVIEW</span>
      <span style={{ font: "12px system-ui", opacity: 0.8 }}>{slow ? "3D is taking longer than expected" : "Preparing interactive 3D…"}</span>
    </div>}
    {!loaded && slow && <button type="button" onClick={() => { setLoaded(false); setSlow(false); setStatus("Retrying 3D…"); setAttempt(v => v + 1); }} style={{ position: "absolute", right: 12, top: 12, zIndex: 3, border: "1px solid #b99a73", background: "#241d18e8", color: "#f3dfc3", padding: "10px 14px", borderRadius: 10, cursor: "pointer" }}>Retry 3D</button>}
    {loaded && <button type="button" onClick={() => recenterRef.current()}
      style={{ position: "absolute", right: 12, bottom: 12, zIndex: 2, border: "1px solid #b99a73", background: "#241d18e8", color: "#f3dfc3", padding: "10px 14px", borderRadius: 10, font: "600 13px system-ui", cursor: "pointer" }}>
      Reset View · 居中
    </button>}
    {!loaded && <div role="status" style={{ position: "absolute", left: 16, bottom: 16, color: "#ead8c0", fontSize: 13 }}>{status}</div>}
  </div>;
}
