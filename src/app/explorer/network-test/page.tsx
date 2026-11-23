"use client";

import { useEffect, useState } from "react";

const URL = "/explorer-male-v2.glb";
type Report = { stage: string; detail: string };
export default function ExplorerNetworkTest() {
  const [report, setReport] = useState<Report>({ stage: "Preparing", detail: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    const run = async () => {
      const start = performance.now();
      let bytes = 0;
      try {
        setReport({ stage: "Requesting model", detail: URL });
        const response = await fetch(URL + "?network-test=" + attempt, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
        const expected = Number(response.headers.get("content-length")) || 0;
        const type = response.headers.get("content-type") || "unknown";
        if (!response.body) throw new Error("Readable response stream unavailable");
        reader = response.body.getReader();
        let lastUpdate = 0;
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          const now = performance.now();
          if (active && now - lastUpdate > 250) {
            lastUpdate = now;
            setReport({ stage: "Downloading", detail: (bytes / 1048576).toFixed(2) + " MB received" + (expected ? " / " + (expected / 1048576).toFixed(2) + " MB" : "") + " · " + ((now - start) / 1000).toFixed(1) + " s · " + type });
          }
        }
        if (active) setReport({ stage: "Download complete", detail: (bytes / 1048576).toFixed(2) + " MB in " + ((performance.now() - start) / 1000).toFixed(1) + " seconds. This test does not parse or render GLB." });
      } catch (e) {
        if (active) setReport({ stage: "Download failed", detail: String(e) + " · received " + (bytes / 1048576).toFixed(2) + " MB · elapsed " + ((performance.now() - start) / 1000).toFixed(1) + " s" });
      }
    };
    void run();
    return () => { active = false; controller.abort(); void reader?.cancel().catch(() => {}); };
  }, [attempt]);
  return <main style={{ minHeight: "100dvh", background: "#211a15", color: "#f1dfc6", padding: 24, fontFamily: "system-ui" }}>
    <div style={{ maxWidth: 680, margin: "auto" }}>
      <a href="/explorer/v2" style={{ color: "#d8aa76" }}>← Explorer V2</a>
      <h1>Explorer GLB network test</h1>
      <p>This page downloads only the male GLB. It does not load Three.js, render the character, or request the backpack.</p>
      <section role="status" aria-live="polite" style={{ border: "1px solid #80664a", borderRadius: 14, padding: 18, overflowWrap: "anywhere" }}>
        <h2 style={{ marginTop: 0 }}>{report.stage}</h2>
        <p>{report.detail}</p>
      </section>
      <button type="button" onClick={() => setAttempt(x => x + 1)} style={{ marginTop: 20, background: "#d8aa76", color: "#211a15", padding: "12px 18px", border: 0, borderRadius: 8 }}>Retry download</button>
      <p style={{ color: "#c9b6a1" }}>If this test also fails, investigate network/CDN delivery before changing the character viewer.</p>
    </div>
  </main>;
}
