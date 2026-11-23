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
  const backpackRef = useRef<THREE.Group | null>(null);
  const [backpackOn, setBackpackOn] = useState(false);
  const [backpackReady, setBackpackReady] = useState(false);
  const [status, setStatus] = useState("Loading Explorer...");
  const [loaded, setLoaded] = useState(false);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    let fitModel: (() => void) | null = null;
    let idleModel: THREE.Object3D | null = null;
    let idleBaseY = 0;
    let idleBaseScaleY = 1;
    const clock = new THREE.Clock();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
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
        if (idleModel && !reducedMotion?.matches && !document.hidden) {
          const t = clock.getElapsedTime();
          // Conservative root-level idle: no bone rotations or sleeve clipping.
          idleModel.position.y = idleBaseY + Math.sin(t * 1.15) * 0.004;
          idleModel.scale.y = idleBaseScaleY * (1 + Math.sin(t * 1.15) * 0.0015);
        }
        controls?.update();
        renderer?.render(scene, camera);
      };
      animate();
    } catch (error) {
      setStatus("3D unavailable: " + String(error));
      return () => { observer.disconnect(); renderer?.dispose(); renderer?.domElement.remove(); };
    }
    const loadingWatchdog = window.setTimeout(() => {
      if (!disposed && !idleModel) setStatus("Explorer is taking too long to load. Check connection or reload.");
    }, 15000);
    loader.load(modelUrl, gltf => {
      if (disposed) return;
      window.clearTimeout(loadingWatchdog);
      try {
      const model = gltf.scene;
      assets.push(model);
      track(model);
      scene.add(model);
      idleModel = model;
      idleBaseY = model.position.y;
      idleBaseScaleY = model.scale.y;
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
      // Backpack loading is independent from the main character readiness.
      // Load the actual Tripo backpack; size and place it relative to the body.
      const spine = model.getObjectByName("mixamorigSpine2") ??
        model.getObjectByName("mixamorigSpine1") ??
        model.getObjectByName("mixamorigSpine");
      if (spine) {
        loader.load("/explorer-backpack-v1.glb", part => {
          if (disposed) return;
          const pack = new THREE.Group();
          const object = part.scene;
          object.updateMatrixWorld(true);
          const rawBox = new THREE.Box3().setFromObject(object);
          const rawSize = rawBox.getSize(new THREE.Vector3());
          if (rawBox.isEmpty() || rawSize.y <= 0) {
            setStatus("Backpack model has no usable geometry");
            return;
          }
          const bodySize = bounds.getSize(new THREE.Vector3());
          const desiredHeight = bodySize.y * 0.29;
          const scale = desiredHeight / rawSize.y;
          object.scale.setScalar(scale);
          // Center the imported mesh at the attachment pivot.
          const rawCenter = rawBox.getCenter(new THREE.Vector3());
          object.position.copy(rawCenter.multiplyScalar(-scale));
          pack.add(object);
          // Position the pack behind the upper torso. Orientation can be
          // fine-tuned after checking the real asset from side/rear views.
          model.updateMatrixWorld(true);
          const target = bounds.getCenter(new THREE.Vector3());
          target.y += bodySize.y * 0.14;
          target.z -= bodySize.y * 0.12;
          pack.position.copy(spine.worldToLocal(target));
          spine.add(pack);
          pack.visible = backpackRef.current?.visible ?? false;
          backpackRef.current = pack;
          assets.push(pack);
          track(pack);
          setBackpackReady(true);
        }, undefined, error => {
          if (!disposed) setStatus("Could not load backpack: " + String(error));
        });
      } else {
        setBackpackReady(false);
        console.warn("Explorer spine bone not found for backpack attachment");
      }
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
      } catch (error) {
        console.error("Explorer initialization failed:", error);
        setStatus("Explorer setup failed: " + String(error));
        setLoaded(false);
      }
    }, progress => {
      if (!disposed && progress.total > 0) setStatus("Loading Explorer... " + Math.round(progress.loaded / progress.total * 100) + "%");
    }, error => {
      window.clearTimeout(loadingWatchdog);
      if (!disposed) setStatus("Could not load Explorer: " + String(error));
    });
    return () => {
      disposed = true;
      window.clearTimeout(loadingWatchdog);
      recenterRef.current = () => {};
      backpackRef.current = null;
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
  }, [modelUrl]);
  return <div className={className} style={{ position: "relative", width: "100%", height: "100%", minHeight: 320, touchAction: "none" }}>
    <div ref={hostRef} style={{ width: "100%", height: "100%" }} aria-label="Interactive 3D Explorer" />
    {loaded && backpackReady && <button type="button"
      onClick={() => { const next = !backpackOn; setBackpackOn(next); if (backpackRef.current) backpackRef.current.visible = next; }}
      style={{ position: "absolute", left: 12, bottom: 12, zIndex: 2, border: "1px solid #b99a73", background: "#241d18e8", color: "#f3dfc3", padding: "10px 12px", borderRadius: 10, font: "600 12px system-ui", cursor: "pointer" }}>
      {backpackOn ? "Remove Pack · 卸下" : "Wear Pack · 背包"}
    </button>}
    {loaded && <button type="button" onClick={() => recenterRef.current()}
      style={{ position: "absolute", right: 12, bottom: 12, zIndex: 2, border: "1px solid #b99a73", background: "#241d18e8", color: "#f3dfc3", padding: "10px 14px", borderRadius: 10, font: "600 13px system-ui", cursor: "pointer" }}>
      Reset View · 居中
    </button>}
    {!loaded && <div role="status" style={{ position: "absolute", left: 16, bottom: 16, color: "#ead8c0", fontSize: 13 }}>{status}</div>}
  </div>;
}
