"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


// Fetch small byte ranges; retry only the failed segment. Fall back to a
// normal response if the host ignores Range on the initial request.
async function downloadExplorer(url: string, signal: AbortSignal, onProgress: (message: string) => void): Promise<ArrayBuffer> {
  const chunkSize = 256 * 1024;
  let offset = 0;
  let total = 0;
  let output: Uint8Array | undefined;
  do {
    let success = false;
    let lastError: unknown;
    for (let retry = 0; retry < 3; retry++) {
      if (signal.aborted) throw new Error("Download cancelled");
      const request = new AbortController();
      const cancel = () => request.abort();
      signal.addEventListener("abort", cancel, { once: true });
      const timer = window.setTimeout(cancel, 12000);
      try {
        onProgress(`Downloading ${Math.round(offset / 1024)} KB${total ? " / " + Math.round(total / 1024) + " KB" : ""} · attempt ${retry + 1}/3`);
        const end = total ? Math.min(total - 1, offset + chunkSize - 1) : offset + chunkSize - 1;
        const response = await fetch(url, { signal: request.signal, headers: { Range: `bytes=${offset}-${end}` } });
        if (response.status === 200 && offset === 0) {
          onProgress("Server returned full model · downloading");
          return await response.arrayBuffer();
        }
        if (response.status !== 206) throw new Error("Unexpected model response: " + response.status);
        const range = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers.get("Content-Range") || "");
        if (!range || Number(range[1]) !== offset || Number(range[2]) !== end && Number(range[2]) !== Number(range[3]) - 1) throw new Error("Invalid model range");
        const size = Number(range[3]);
        if (size < 12 || size > 100 * 1024 * 1024 || (total && total !== size)) throw new Error("Invalid model size");
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.length !== Number(range[2]) - offset + 1) throw new Error("Incomplete model segment");
        total = size;
        output ??= new Uint8Array(total);
        output.set(bytes, offset);
        offset += bytes.length;
        success = true;
        break;
      } catch (error) {
        lastError = request.signal.aborted && !signal.aborted ? new Error("Model request timed out") : error;
      } finally {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", cancel);
      }
    }
    if (!success) throw lastError;
  } while (offset < total);
  return output!.buffer as ArrayBuffer;
}

async function downloadStaticParts(signal: AbortSignal, onProgress: (message: string) => void, manifestUrl = "/explorer-parts/manifest.json"): Promise<ArrayBuffer> {
  const group = new AbortController();
  const cancel = () => group.abort();
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  async function get(url: string, expected?: number): Promise<ArrayBuffer> {
    let error: unknown;
    for (let i = 0; i < 3; i++) {
      if (group.signal.aborted) throw new Error("Download cancelled");
      const request = new AbortController();
      const stop = () => request.abort();
      group.signal.addEventListener("abort", stop, { once: true });
      const timer = window.setTimeout(stop, 15000);
      try {
        const response = await fetch(url, { signal: request.signal, cache: i ? "reload" : "default" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const bytes = await response.arrayBuffer();
        if (expected !== undefined && bytes.byteLength !== expected) throw new Error("Incomplete chunk");
        return bytes;
      } catch (e) { error = e; }
      finally { window.clearTimeout(timer); group.signal.removeEventListener("abort", stop); }
    }
    throw error;
  }
  try {
    onProgress("Preparing model parts");
    const manifest = JSON.parse(new TextDecoder().decode(await get(manifestUrl))) as { size: number; parts: { url: string; offset: number; size: number }[] };
    if (!Number.isSafeInteger(manifest.size) || manifest.size < 12 || manifest.size > 100 * 1024 * 1024 || !Array.isArray(manifest.parts)) throw new Error("Invalid model manifest");
    let end = 0;
    for (const part of manifest.parts) {
      if (part.offset !== end || !Number.isSafeInteger(part.size) || part.size <= 0 || !/^\/explorer-parts\/[a-f0-9]{16}\/\d+\.bin$/.test(part.url)) throw new Error("Invalid model part");
      end += part.size;
    }
    if (end !== manifest.size) throw new Error("Invalid model length");
    const output = new Uint8Array(manifest.size);
    let next = 0, received = 0;
    async function worker() {
      while (next < manifest.parts.length) {
        const part = manifest.parts[next++];
        const bytes = await get(part.url, part.size);
        output.set(new Uint8Array(bytes), part.offset);
        received += part.size;
        onProgress(`Downloading model · ${Math.round(received / manifest.size * 100)}% · ${Math.round(received / 1024)} KB`);
      }
    }
    await Promise.all(Array.from({ length: 3 }, () => worker()));
    const header = new DataView(output.buffer);
    if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(8, true) !== manifest.size) throw new Error("Invalid reconstructed GLB");
    return output.buffer;
  } finally {
    group.abort();
    signal.removeEventListener("abort", cancel);
  }
}

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
  const packAction = useRef<() => void>(() => {});
  const [packState, setPackState] = useState("Wear Pack");
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
    const downloadController = new AbortController();
    const slowTimer = window.setTimeout(() => { if (!disposed) setSlow(true); }, 12000);
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    let fitModel: (() => void) | null = null;
    let idle: { update: () => void; reset: () => void } | null = null;
    let idleTimer = 0;
    let pack: THREE.Object3D | null = null;
    let packBusy = false;
    let packWorn = false;
    setPackState("Wear Pack");
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
        if (idle) {
          try { idle.update(); } catch (error) {
            try { idle.reset(); } catch { /* keep renderer alive */ }
            idle = null;
            console.warn("Optional Explorer idle disabled", error);
          }
        }
        controls?.update();
        renderer?.render(scene, camera);
      };
      animate();
    } catch (error) {
      setStatus("3D unavailable: " + String(error));
      return () => { observer.disconnect(); renderer?.dispose(); renderer?.domElement.remove(); };
    }
    (modelUrl === "/explorer-male-v2.glb" ? downloadStaticParts(downloadController.signal, message => { if (!disposed) setStatus(message); }) : downloadExplorer(modelUrl, downloadController.signal, message => { if (!disposed) setStatus(message); })).then(buffer => {
      if (disposed) throw new Error("Download cancelled");
      setStatus("Download complete · parsing 3D");
      return loader.parseAsync(buffer, new URL(".", new URL(modelUrl, window.location.href)).href);
    }).then(gltf => {
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
      // Optional animation starts after the static model has had time to render.
      idleTimer = window.setTimeout(() => {
        if (disposed) return;
        void import("./ExplorerIdle").then(module => {
          if (!disposed) idle = module.createExplorerIdle(model);
        }).catch(error => console.warn("Optional Explorer idle unavailable", error));
      }, 800);
      packAction.current = () => {
        if (disposed || packBusy) return;
        if (pack) {
          packWorn = !packWorn;
          pack.visible = packWorn;
          setPackState(packWorn ? "Remove Pack" : "Wear Pack");
          return;
        }
        packBusy = true;
        setPackState("Loading Pack…");
        void (async () => {
          const buffer = await downloadStaticParts(downloadController.signal, message => {
            if (!disposed) setPackState(message.replace("Downloading model", "Loading pack"));
          }, "/explorer-parts/backpack.json");
          if (disposed) return;
          const result = await loader.parseAsync(buffer, new URL(".", window.location.href).origin + "/");
          const object = result.scene;
          track(object);
          if (disposed) {
            object.traverse(node => {
              const mesh = node as THREE.Mesh;
              mesh.geometry?.dispose();
              const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
              for (const mat of mats) { for (const value of Object.values(mat)) if (value instanceof THREE.Texture) value.dispose(); mat.dispose(); }
            });
            return;
          }
          let spine: THREE.Object3D | undefined;
          model.traverse(node => {
            if (node instanceof THREE.Bone && node.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/^mixamorig[0-9]*/, "") === "spine2") spine = node;
          });
          if (!spine) throw new Error("Upper spine bone not found");
          const group = new THREE.Group();
          group.add(object);
          const box = new THREE.Box3().setFromObject(object);
          const dimensions = box.getSize(new THREE.Vector3());
          if (box.isEmpty() || dimensions.y <= 0) throw new Error("Invalid backpack bounds");
          const midpoint = box.getCenter(new THREE.Vector3());
          object.position.sub(midpoint);
          group.scale.setScalar(size.y * 0.30 / dimensions.y);
          scene.add(group);
          group.position.set(center.x, bounds.min.y + size.y * 0.68, center.z - size.z * 0.40 - dimensions.z * group.scale.z * 0.35);
          group.updateMatrixWorld(true);
          (spine as THREE.Object3D).attach(group);
          pack = group;
          assets.push(group);
          packWorn = true;
          setPackState("Remove Pack");
        })().catch(error => {
          if (!disposed) setPackState("Retry Pack");
          console.warn("Optional backpack unavailable", error);
        }).finally(() => { packBusy = false; });
      };
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
    }).catch(error => { if (!disposed) { window.clearTimeout(slowTimer); setSlow(true); setStatus("3D model unavailable: " + String(error)); } });
    return () => {
      disposed = true;
      downloadController.abort();
      packAction.current = () => {};
      window.clearTimeout(idleTimer);
      idle = null;
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
    {loaded && <button type="button" onClick={() => packAction.current()} disabled={packState.startsWith("Loading")} style={{ position: "absolute", left: 12, top: 12, zIndex: 3, border: "1px solid #b99a73", background: "#241d18e8", color: "#f3dfc3", padding: "10px 14px", borderRadius: 10 }}>{packState}</button>}
    {loaded && <button type="button" onClick={() => recenterRef.current()}
      style={{ position: "absolute", right: 12, bottom: 12, zIndex: 2, border: "1px solid #b99a73", background: "#241d18e8", color: "#f3dfc3", padding: "10px 14px", borderRadius: 10, font: "600 13px system-ui", cursor: "pointer" }}>
      Reset View · 居中
    </button>}
    {!loaded && <div role="status" style={{ position: "absolute", left: 16, bottom: 16, color: "#ead8c0", fontSize: 13 }}>{status}</div>}
  </div>;
}
