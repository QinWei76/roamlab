const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.join(__dirname, "..", "public");
const data = fs.readFileSync(path.join(root, "explorer-male-v2.glb"));
const version = crypto.createHash("sha256").update(data).digest("hex").slice(0, 16);
const dir = path.join(root, "explorer-parts", version);
fs.mkdirSync(dir, { recursive: true });
const parts = [];
for (let offset = 0; offset < data.length; offset += 256 * 1024) {
  const bytes = data.subarray(offset, offset + 256 * 1024);
  const name = String(parts.length).padStart(3, "0") + ".bin";
  fs.writeFileSync(path.join(dir, name), bytes);
  parts.push({ url: "/explorer-parts/" + version + "/" + name, offset, size: bytes.length });
}
fs.writeFileSync(path.join(root, "explorer-parts", "manifest.json"), JSON.stringify({ size: data.length, parts }));
console.log("Explorer parts:", parts.length, "bytes:", data.length);

// Keep the character manifest unchanged; equipment has its own manifest.
const pack = fs.readFileSync(path.join(root, "explorer-backpack-v1.glb"));
const packVersion = crypto.createHash("sha256").update(pack).digest("hex").slice(0, 16);
const packDir = path.join(root, "explorer-parts", packVersion);
fs.mkdirSync(packDir, { recursive: true });
const packParts = [];
for (let offset = 0; offset < pack.length; offset += 256 * 1024) {
  const bytes = pack.subarray(offset, offset + 256 * 1024);
  const name = String(packParts.length).padStart(3, "0") + ".bin";
  fs.writeFileSync(path.join(packDir, name), bytes);
  packParts.push({ url: "/explorer-parts/" + packVersion + "/" + name, offset, size: bytes.length });
}
fs.writeFileSync(path.join(root, "explorer-parts", "backpack.json"), JSON.stringify({ size: pack.length, parts: packParts }));
