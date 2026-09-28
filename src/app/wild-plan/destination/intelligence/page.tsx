"use client";

import { useRouter, useSearchParams } from "next/navigation";

function numberParam(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function DestinationIntelligencePage() {
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

            <div className="placeholderMap">
              <div className="crosshair">+</div>
              <div className="mapCaption">
                <span>TOPOGRAPHIC INTELLIGENCE</span>
                <strong>USGS MAP LAYER WILL LIVE HERE</strong>
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
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .24em;
          color: #bd8b58;
        }

        .backTop {
          justify-self: end;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .08em;
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
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .2em;
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
          flex: 0 0 190px;
          align-self: flex-start;
          padding: 13px 15px;
          border: 2px solid #8b542e;
          transform: rotate(1.5deg);
        }

        .statusStamp span, .statusStamp strong { display: block; }
        .statusStamp span { font-size: 7px; letter-spacing: .18em; }
        .statusStamp strong { margin-top: 5px; font-size: 11px; letter-spacing: .06em; }

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
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .12em;
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
          font-size: 13px;
          line-height: 1.6;
        }

        .placeholderMap {
          height: 330px;
          margin-top: 32px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(54,45,34,.32);
          background:
            linear-gradient(30deg, transparent 48%, rgba(71,84,67,.14) 49%, rgba(71,84,67,.14) 51%, transparent 52%) 0 0/54px 54px,
            linear-gradient(-30deg, transparent 48%, rgba(71,84,67,.11) 49%, rgba(71,84,67,.11) 51%, transparent 52%) 0 0/70px 70px,
            #cfc6af;
        }

        .crosshair {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 34px;
          color: #9a4d27;
        }

        .mapCaption {
          position: absolute;
          left: 16px;
          bottom: 15px;
          padding: 9px 11px;
          color: #eee5d5;
          background: rgba(36,31,25,.84);
        }

        .mapCaption span, .mapCaption strong { display: block; }
        .mapCaption span { font-size: 6px; letter-spacing: .14em; }
        .mapCaption strong { margin-top: 3px; font-size: 8px; letter-spacing: .08em; }

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
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
          cursor: pointer;
        }

        .sheetFooter {
          min-height: 46px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(61,50,38,.28);
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .14em;
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
          .placeholderMap { height: 260px; }
          .sheetFooter { gap: 16px; }
        }
      `}</style>
    </main>
  );
}
