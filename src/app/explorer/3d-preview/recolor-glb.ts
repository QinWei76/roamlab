import type { } from "react";

/** Recolors vertex-color primitives in the RoamLab prototype GLB without changing its geometry.
 * This is deliberately limited to the known prototype palette, not arbitrary third-party GLBs.
 */
export type ExplorerPalette = {
  skin: string; hairColor: string; jacket: string; pants: string; pack: string;
};
const originals: { key: keyof ExplorerPalette; rgb: [number,number,number] }[] = [
  { key: "skin", rgb: [228,169,117] },
  { key: "hairColor", rgb: [80,54,35] },
  { key: "jacket", rgb: [202,102,31] },
  { key: "pants", rgb: [59,50,41] },
  { key: "pack", rgb: [77,87,62] }
];
function rgb(hex: string): [number,number,number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function same(a: number[], b: number[]) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
export function recolorExplorerGlb(source: ArrayBuffer, palette: ExplorerPalette): Blob {
  const bytes = new Uint8Array(source.slice(0));
  const view = new DataView(bytes.buffer);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) {
    throw new Error("Unsupported GLB format");
  }
  let offset = 12;
  let json: {
    meshes: {primitives: {attributes: {COLOR_0?:number}}[]}[];
    accessors: {bufferView?:number;byteOffset?:number;componentType:number;count:number;type:string;normalized?:boolean}[];
    bufferViews: {byteOffset?:number;byteStride?:number;byteLength:number}[];
  } | undefined;
  let binStart = -1;
  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    if (dataStart + length > bytes.length) throw new Error("Invalid GLB chunk");
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(bytes.subarray(dataStart, dataStart + length)));
    if (type === 0x004e4942) binStart = dataStart;
    offset = dataStart + length;
  }
  if (!json || binStart < 0) throw new Error("GLB missing JSON or BIN");
  const done = new Set<number>();
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) {
    const index = primitive.attributes.COLOR_0;
    if (index === undefined || done.has(index)) continue;
    done.add(index);
    const accessor = json.accessors[index];
    if (accessor.bufferView === undefined || accessor.componentType !== 5121 || accessor.type !== "VEC4") continue;
    const bufferView = json.bufferViews[accessor.bufferView];
    const stride = bufferView.byteStride ?? 4;
    const base = binStart + (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    if (base < binStart || base + (accessor.count - 1) * stride + 4 > bytes.length) throw new Error("Invalid color buffer");
    const current = Array.from(bytes.subarray(base, base + 3));
    const match = originals.find(item => same(current, item.rgb));
    if (!match) continue;
    const target = rgb(palette[match.key]);
    for (let i = 0; i < accessor.count; i++) {
      const at = base + i * stride;
      if (same(Array.from(bytes.subarray(at, at + 3)), match.rgb)) {
        bytes[at] = target[0]; bytes[at + 1] = target[1]; bytes[at + 2] = target[2];
      }
    }
  }
  return new Blob([bytes], {type: "model/gltf-binary"});
}
