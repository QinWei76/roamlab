"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function numberParam(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function DestinationIntelligenceContent() {
  const router = useRouter();
  const params = useSearchParams();

  const name = params.get("name") || "Destination Intelligence";
  const source = params.get("source") || "RIDB";
  const sourceId = params.get("sourceId") || "";
  const latitude = numberParam(params.get("lat"));
  const longitude = numberParam(params.get("lon"));
  const distanceKm = numberParam(params.get("distance"));
  const matchScore = numberParam(params.get("score"));
  const returnMatch = params.get("returnMatch") || "0";
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    let cancelled = false;

    const loadLeaflet = async () => {
      if (!document.querySelector('link[data-roamlab-leaflet="true"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.setAttribute("data-roamlab-leaflet", "true");
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(
            'script[data-roamlab-leaflet="true"]'
          ) as HTMLScriptElement | null;

          if (existing) {
            if ((window as any).L) {
              resolve();
            } else {
              existing.addEventListener("load", () => resolve(), { once: true });
              existing.addEventListener(
                "error",
                () => reject(new Error("Leaflet failed to load")),
                { once: true }
              );
            }
            return;
          }

          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.setAttribute("data-roamlab-leaflet", "true");
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Leaflet failed to load"));
          document.body.appendChild(script);
        });
      }

      if (cancelled) return;

      const L = (window as any).L;
      const node = document.getElementById("destination-intelligence-map");
      if (!L || !node) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(node, {
        zoomControl: true,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 16,
      }).setView([latitude, longitude], 12);

      L.tileLayer(
        "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
        {
          minZoom: 0,
          maxZoom: 16,
          maxNativeZoom: 16,
          tileSize: 256,
          noWrap: true,
        }
      ).addTo(map);

      L.circleMarker([latitude, longitude], {
        radius: 7,
        color: "#f4ecdc",
        weight: 3,
        fillColor: "#a64f22",
        fillOpacity: 1,
      }).addTo(map);

      const centerControl = L.control({ position: "topleft" });
      centerControl.onAdd = () => {
        const button = L.DomUtil.create(
          "button",
          "roamlabIntelligenceCenter"
        );
        button.type = "button";
        button.innerHTML = "CENTER";
        button.title = "Return to destination";
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, "click", () => {
          map.setView([latitude, longitude], 12, { animate: true });
        });
        return button;
      };
      centerControl.addTo(map);

      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 100);
    };

    loadLeaflet().catch(() => {});

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude]);

  const backToBrief = () => {
    const back = new URLSearchParams();
    back.set("returnMatch", returnMatch);
    router.push(`/wild-plan/destination?${back.toString()}`);
  };

  return (
    <main className="page">
      <div className="deskTexture" />

      <header className="globalHeader">
        <button type="button" className="brand" onClick={backToBrief}>
          ROAMLAB
        </button>

        <div className="eyebrow">DESTINATION INTELLIGENCE</div>

        <button type="button" className="backTop" onClick={backToBrief}>
          ← BACK TO DESTINATION BRIEF
        </button>
      </header>

      <section className="sheet">
        <div className="sheetTop">
          <div>
            <div className="kicker">ROAMLAB · DESTINATION INTELLIGENCE</div>
            <h1>{name}</h1>
            <p>
              Deep destination research before you commit this place to your Wild.
            </p>
          </div>

          <div className="statusStamp">
            <span>RESEARCH MODE</span>
            <strong>NOT YET SELECTED</strong>
          </div>
        </div>

        <div className="identityRow">
          <div>
            <span>SOURCE</span>
            <strong>{source}</strong>
          </div>
          <div>
            <span>REFERENCE</span>
            <strong>{sourceId || "—"}</strong>
          </div>
          <div>
            <span>LOCATION</span>
            <strong>
              {latitude !== null && longitude !== null
                ? `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`
                : "—"}
            </strong>
          </div>
          <div>
            <span>DISTANCE</span>
            <strong>
              {distanceKm !== null ? `${Math.round(distanceKm)} KM` : "—"}
            </strong>
          </div>
          <div>
            <span>INTERNAL MATCH</span>
            <strong>{matchScore !== null ? Math.round(matchScore) : "—"}</strong>
          </div>
        </div>

        <nav className="sectionNav" aria-label="Destination intelligence sections">
          <span className="active">OVERVIEW</span>
          <span>TOPOGRAPHY</span>
          <span>WEATHER</span>
          <span>TERRAIN & LAND COVER</span>
          <span>ACTIVITIES</span>
          <span>CAMPING & FACILITIES</span>
          <span>ACCESS & PERMITS</span>
          <span>SAFETY</span>
          <span>WILD FIT</span>
        </nav>

        <div className="contentGrid">
          <section className="primaryPanel">
            <div className="sectionLabel">01 · OVERVIEW</div>
            <h2>Destination field intelligence</h2>
            <p className="lead">
              This page is the research layer between the Destination Brief and
              the final destination decision.
            </p>

            <div className="liveMapWrap">
              {latitude !== null && longitude !== null ? (
                <div
                  id="destination-intelligence-map"
                  className="liveMap"
                  aria-label={`USGS topographic map of ${name}`}
                />
              ) : (
                <div className="mapUnavailable">
                  LOCATION DATA UNAVAILABLE
                </div>
              )}

              <div className="mapCaption">
                <span>TOPOGRAPHIC INTELLIGENCE</span>
                <strong>USGS · THE NATIONAL MAP</strong>
              </div>
            </div>
          </section>

          <aside className="sideColumn">
            <section className="note">
              <div className="sectionLabel">DECISION STATUS</div>
              <h3>Still exploring</h3>
              <p>
                Viewing this page does not set {name} as your destination.
              </p>
            </section>

            <section className="note">
              <div className="sectionLabel">NEXT DATA LAYERS</div>
              <p>
                Weather, terrain, land cover, activities, facilities, access,
                permits and safety will be added here region by region.
              </p>
            </section>

            <section className="note dark">
              <div className="sectionLabel">RETURN PATH</div>
              <p>
                Go back to the same Destination Brief, keep comparing the five
                matches, then confirm only when you are ready.
              </p>
              <button type="button" onClick={backToBrief}>
                ← BACK TO BRIEF
              </button>
            </section>
          </aside>
        </div>

        <footer className="sheetFooter">
          <span>PRE-DEPARTURE RESEARCH DOCUMENT</span>
          <span>ROAMLAB · WILD PLAN</span>
        </footer>
      </section>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        :global(html, body) { margin: 0; min-height: 100%; background: #17130f; }
        :global(body) { color: #30291f; }

        .page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          padding: 82px 5vw 58px;
          background:
            radial-gradient(circle at 22% 18%, rgba(178,118,57,.16), transparent 28%),
            radial-gradient(circle at 80% 72%, rgba(110,66,31,.20), transparent 30%),
            linear-gradient(135deg, #21170f, #100d0a 60%, #1c120c);
          font-family: Arial, Helvetica, sans-serif;
        }

        .deskTexture {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .18;
          background:
            repeating-linear-gradient(93deg, transparent 0 42px, rgba(255,255,255,.035) 43px, transparent 44px 91px);
        }

        .globalHeader {
          position: fixed;
          z-index: 20;
          top: 0;
          left: 0;
          right: 0;
          height: 58px;
          padding: 0 4vw;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          color: #f0e6d4;
          background: rgba(13,10,8,.88);
          border-bottom: 1px solid rgba(226,184,120,.16);
          backdrop-filter: blur(10px);
        }

        .brand, .backTop {
          border: 0;
          background: none;
          color: inherit;
          cursor: pointer;
        }

        .brand {
          justify-self: start;
          padding: 0;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: .18em;
        }

        .eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .20em;
          color: #bd8b58;
        }

        .backTop {
          justify-self: end;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .07em;
        }

        .sheet {
          position: relative;
          z-index: 2;
          width: min(1240px, 92vw);
          margin: 0 auto;
          background: #e7deca;
          box-shadow: 0 30px 80px rgba(0,0,0,.46);
          border: 1px solid rgba(255,255,255,.22);
        }

        .sheetTop {
          min-height: 190px;
          padding: 42px 48px 32px;
          display: flex;
          justify-content: space-between;
          gap: 30px;
          border-bottom: 1px solid rgba(61,50,38,.28);
        }

        .kicker, .sectionLabel {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
          color: #8b542e;
        }

        h1 {
          max-width: 780px;
          margin: 12px 0 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(36px, 5vw, 70px);
          line-height: .94;
          font-weight: 700;
          letter-spacing: -.035em;
        }

        .sheetTop p {
          max-width: 610px;
          margin: 15px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          line-height: 1.5;
          color: #655a4d;
        }

        .statusStamp {
          position: relative;
          flex: 0 0 210px;
          align-self: flex-start;
          padding: 15px 18px 14px;
          border: 2px solid rgba(139,84,46,.86);
          color: #7f4829;
          transform: rotate(-2deg);
          box-shadow:
            inset 0 0 0 3px #e7deca,
            inset 0 0 0 4px rgba(139,84,46,.48);
          opacity: .94;
        }

        .statusStamp::before {
          content: "";
          position: absolute;
          inset: -3px;
          pointer-events: none;
          background:
            radial-gradient(circle at 12% 25%, rgba(231,222,202,.75) 0 1px, transparent 2px),
            radial-gradient(circle at 78% 72%, rgba(231,222,202,.62) 0 1.5px, transparent 2.5px),
            radial-gradient(circle at 48% 15%, rgba(231,222,202,.5) 0 1px, transparent 2px);
          background-size: 17px 19px, 23px 21px, 29px 27px;
          mix-blend-mode: screen;
        }

        .statusStamp::after {
          content: "ROAMLAB FIELD DESK";
          display: block;
          margin-top: 9px;
          padding-top: 7px;
          border-top: 1px solid rgba(139,84,46,.48);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .16em;
        }

        .statusStamp span, .statusStamp strong { display: block; position: relative; }
        .statusStamp span { font-size: 10px; font-weight: 900; letter-spacing: .16em; }
        .statusStamp strong { margin-top: 6px; font-size: 14px; line-height: 1.05; letter-spacing: .06em; }

        .identityRow {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border-bottom: 1px solid rgba(61,50,38,.28);
        }

        .identityRow > div {
          min-height: 70px;
          padding: 17px 18px;
          border-right: 1px solid rgba(61,50,38,.18);
        }

        .identityRow span, .identityRow strong { display: block; }
        .identityRow span { font-size: 7px; font-weight: 900; letter-spacing: .15em; color: #8b7a67; }
        .identityRow strong { margin-top: 7px; font-size: 10px; letter-spacing: .04em; overflow-wrap: anywhere; }

        .sectionNav {
          padding: 15px 24px;
          display: flex;
          gap: 22px;
          overflow-x: auto;
          white-space: nowrap;
          border-bottom: 1px solid rgba(61,50,38,.28);
          background: #d9cfba;
        }

        .sectionNav span {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .10em;
          color: #7c7062;
        }

        .sectionNav .active { color: #8b542e; }

        .contentGrid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(260px, .8fr);
          min-height: 540px;
        }

        .primaryPanel { padding: 42px 46px; border-right: 1px solid rgba(61,50,38,.28); }
        .primaryPanel h2 {
          margin: 10px 0 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
        }

        .lead {
          max-width: 650px;
          margin: 0;
          color: #6e6255;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
          line-height: 1.65;
        }

        .liveMapWrap {
          height: 360px;
          margin-top: 32px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(54,45,34,.32);
          background: #cfc6af;
        }

        .liveMap {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          background: #cfc6af;
        }

        .mapUnavailable {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #7b6c5d;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .mapCaption {
          position: absolute;
          z-index: 500;
          left: 16px;
          bottom: 15px;
          padding: 10px 12px;
          color: #eee5d5;
          background: rgba(36,31,25,.88);
          pointer-events: none;
        }

        .mapCaption span, .mapCaption strong { display: block; }
        .mapCaption span { font-size: 8px; letter-spacing: .14em; }
        .mapCaption strong { margin-top: 4px; font-size: 10px; letter-spacing: .08em; }

        .liveMap :global(.leaflet-control-zoom) {
          border: 0 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,.22) !important;
        }

        .liveMap :global(.leaflet-control-zoom a) {
          color: #2d261e !important;
          background: rgba(239,232,216,.96) !important;
          border-bottom-color: rgba(72,59,43,.18) !important;
        }

        .liveMap :global(.roamlabIntelligenceCenter) {
          min-width: 58px;
          height: 28px;
          margin-top: 8px;
          padding: 0 9px;
          border: 1px solid rgba(65,53,39,.32);
          background: rgba(239,232,216,.96);
          color: #3a3025;
          cursor: pointer;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
          box-shadow: 0 2px 8px rgba(0,0,0,.18);
        }

        .sideColumn { display: grid; grid-template-rows: repeat(3, 1fr); }
        .note { padding: 30px 28px; border-bottom: 1px solid rgba(61,50,38,.22); }
        .note h3 { margin: 10px 0; font-family: Georgia, "Times New Roman", serif; font-size: 21px; }
        .note p { margin: 10px 0 0; font-family: Georgia, "Times New Roman", serif; font-size: 12px; line-height: 1.6; color: #665a4d; }
        .note.dark { color: #eee5d5; background: #29231c; }
        .note.dark p { color: #c9bdab; }
        .note.dark .sectionLabel { color: #c88b55; }
        .note button {
          margin-top: 22px;
          padding: 10px 0;
          border: 0;
          border-bottom: 1px solid #c88b55;
          background: none;
          color: #e8d9c3;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .08em;
          cursor: pointer;
        }

        .sheetFooter {
          min-height: 46px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(61,50,38,.28);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
          color: #7b6c5d;
        }

        @media (max-width: 800px) {
          .globalHeader { grid-template-columns: 1fr 1fr; }
          .eyebrow { display: none; }
          .page { padding: 72px 14px 32px; }
          .sheet { width: 100%; }
          .sheetTop { padding: 30px 24px; display: block; }
          .statusStamp { width: 180px; margin-top: 24px; }
          .identityRow { grid-template-columns: 1fr 1fr; }
          .contentGrid { grid-template-columns: 1fr; }
          .primaryPanel { padding: 30px 24px; border-right: 0; }
          .liveMapWrap { height: 300px; }
          .sheetFooter { gap: 16px; }
        }
      `}</style>
    </main>
  );
}


export default function DestinationIntelligencePage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#17130f",
            color: "#e7deca",
            fontFamily: "Arial, Helvetica, sans-serif",
            letterSpacing: "0.14em",
            fontSize: "11px",
          }}
        >
          LOADING DESTINATION INTELLIGENCE…
        </main>
      }
    >
      <DestinationIntelligenceContent />
    </Suspense>
  );
}
