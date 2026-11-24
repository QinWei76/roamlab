import * as THREE from "three";

export function createExplorerIdle(model: THREE.Object3D) {
  const settings: Record<string, [number, number, number, number]> = {
    spine: [0, 0.015, 1.5, 0],
    spine1: [0, 0.012, 1.5, 0.3],
    spine2: [2, 0.012, 0.7, 0],
    head: [1, 0.025, 0.48, 0],
    leftshoulder: [2, 0.009, 1.5, 0.4],
    rightshoulder: [2, -0.009, 1.5, 0.4],
  };
  const bones: { bone: THREE.Bone; rest: THREE.Quaternion; axis: THREE.Vector3; amplitude: number; frequency: number; phase: number }[] = [];
  model.traverse(node => {
    if (!(node instanceof THREE.Bone)) return;
    const name = node.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/^mixamorig[0-9]*/, "");
    if (!Object.prototype.hasOwnProperty.call(settings, name)) return;
    const [axis, amplitude, frequency, phase] = settings[name];
    bones.push({ bone: node, rest: node.quaternion.clone(), axis: new THREE.Vector3(axis === 0 ? 1 : 0, axis === 1 ? 1 : 0, axis === 2 ? 1 : 0), amplitude, frequency, phase });
  });
  const delta = new THREE.Quaternion();
  const start = performance.now();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  return {
    update() {
      const t = (performance.now() - start) / 1000;
      for (const item of bones) {
        const angle = reduced.matches ? 0 : Math.sin(t * item.frequency + item.phase) * item.amplitude * Math.min(1, t / 1.5);
        item.bone.quaternion.copy(item.rest).multiply(delta.setFromAxisAngle(item.axis, angle));
      }
    },
    reset() { for (const item of bones) item.bone.quaternion.copy(item.rest); },
  };
}
