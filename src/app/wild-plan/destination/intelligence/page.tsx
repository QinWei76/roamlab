"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function numberParam(value: string | null) {
  if (!value) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function formatDuration(minutes: number) {
  const rounded = Math.max(1, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (hours === 0) return `${mins} MIN`;
  if (mins === 0) return `${hours} HR`;

  return `${hours} HR ${mins} MIN`;
}

function DestinationIntelligenceContent() {
  const router = useRouter();
  const params = useSearchParams();

  const name =
    params.get("name") ||
    "Destination";

  const source =
    params.get("source") ||
    "RIDB";

  const sourceId =
    params.get("sourceId") ||
    "—";

  const latitude =
    numberParam(
      params.get("lat")
    );

  const longitude =
    numberParam(
      params.get("lon")
    );

  const distanceKm =
    numberParam(
      params.get("distance")
    );

  const matchScore =
    numberParam(
      params.get("score")
    );

  const returnMatch =
    params.get("returnMatch") ||
    "0";

  const originLabel =
    params.get("origin") ||
    "Starting point";

  const originLatitude =
    numberParam(
      params.get("originLat")
    );

  const originLongitude =
    numberParam(
      params.get("originLon")
    );

  const mapRef =
    useRef<any>(null);

  const [
    routeDistanceKm,
    setRouteDistanceKm,
  ] = useState<number | null>(
    null
  );

  const [
    routeDurationMin,
    setRouteDurationMin,
  ] = useState<number | null>(
    null
  );

  const [
    routeStatus,
    setRouteStatus,
  ] = useState<
    | "idle"
    | "loading"
    | "ready"
    | "unavailable"
  >("idle");

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null ||
      originLatitude === null ||
      originLongitude === null
    ) {
      setRouteStatus(
        "unavailable"
      );

      return;
    }

    let cancelled = false;

    setRouteStatus(
      "loading"
    );

    setRouteDistanceKm(
      null
    );

    setRouteDurationMin(
      null
    );

    async function loadRoute() {
      if (
        !document.querySelector(
          'link[data-roamlab-leaflet="true"]'
        )
      ) {
        const link =
          document.createElement(
            "link"
          );

        link.rel =
          "stylesheet";

        link.href =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

        link.setAttribute(
          "data-roamlab-leaflet",
          "true"
        );

        document.head.appendChild(
          link
        );
      }

      if (!(window as any).L) {
        await new Promise<void>(
          (
            resolve,
            reject
          ) => {
            const existing =
              document.querySelector(
                'script[data-roamlab-leaflet="true"]'
              ) as
                | HTMLScriptElement
                | null;

            if (existing) {
              if (
                (window as any).L
              ) {
                resolve();
              } else {
                existing.addEventListener(
                  "load",
                  () =>
                    resolve(),
                  {
                    once: true,
                  }
                );

                existing.addEventListener(
                  "error",
                  () =>
                    reject(
                      new Error(
                        "Leaflet failed to load"
                      )
                    ),
                  {
                    once: true,
                  }
                );
              }

              return;
            }

            const script =
              document.createElement(
                "script"
              );

            script.src =
              "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

            script.async =
              true;

            script.setAttribute(
              "data-roamlab-leaflet",
              "true"
            );

            script.onload =
              () =>
                resolve();

            script.onerror =
              () =>
                reject(
                  new Error(
                    "Leaflet failed to load"
                  )
                );

            document.body.appendChild(
              script
            );
          }
        );
      }

      const routeUrl =
        "https://router.project-osrm.org/route/v1/driving/" +
        `${originLongitude},${originLatitude};${longitude},${latitude}` +
        "?overview=full&geometries=geojson&steps=false&alternatives=false";

      const response =
        await fetch(
          routeUrl
        );

      if (!response.ok) {
        throw new Error(
          "Road route unavailable"
        );
      }

      const data =
        await response.json();

      const route =
        data?.routes?.[0];

      if (
        data?.code !== "Ok" ||
        !route ||
        !route.geometry ||
        typeof route.distance !==
          "number" ||
        typeof route.duration !==
          "number"
      ) {
        throw new Error(
          "Road route unavailable"
        );
      }

      if (cancelled) {
        return;
      }

      setRouteDistanceKm(
        route.distance / 1000
      );

      setRouteDurationMin(
        route.duration / 60
      );

      setRouteStatus(
        "ready"
      );

      const L =
        (window as any).L;

      const node =
        document.getElementById(
          "destination-intelligence-map"
        );

      if (!L || !node) {
        return;
      }

      if (mapRef.current) {
        mapRef.current.remove();

        mapRef.current =
          null;
      }

      const map =
        L.map(node, {
          zoomControl: true,
          attributionControl:
            true,
          minZoom: 3,
          maxZoom: 18,
        });

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          minZoom: 0,
          maxZoom: 19,
          attribution:
            "© OpenStreetMap contributors",
        }
      ).addTo(map);

      const routeLayer =
        L.geoJSON(
          route.geometry,
          {
            style: {
              color:
                "#a64f22",
              weight: 5,
              opacity: 0.9,
            },
          }
        ).addTo(map);

      L.circleMarker(
        [
          originLatitude,
          originLongitude,
        ],
        {
          radius: 7,
          color:
            "#f4ecdc",
          weight: 3,
          fillColor:
            "#2f4436",
          fillOpacity: 1,
        }
      )
        .bindTooltip(
          "START",
          {
            permanent:
              false,
            direction:
              "top",
          }
        )
        .addTo(map);

      L.circleMarker(
        [
          latitude,
          longitude,
        ],
        {
          radius: 8,
          color:
            "#f4ecdc",
          weight: 3,
          fillColor:
            "#a64f22",
          fillOpacity: 1,
        }
      )
        .bindTooltip(
          "DESTINATION",
          {
            permanent:
              false,
            direction:
              "top",
          }
        )
        .addTo(map);

      map.fitBounds(
        routeLayer.getBounds(),
        {
          padding: [
            38,
            38,
          ],
          maxZoom: 13,
        }
      );

      const routeControl =
        L.control({
          position:
            "topleft",
        });

      routeControl.onAdd =
        () => {
          const button =
            L.DomUtil.create(
              "button",
              "roamlabIntelligenceCenter"
            );

          button.type =
            "button";

          button.innerHTML =
            "FIT ROUTE";

          button.title =
            "Show the full route";

          L.DomEvent.disableClickPropagation(
            button
          );

          L.DomEvent.on(
            button,
            "click",
            () => {
              map.fitBounds(
                routeLayer.getBounds(),
                {
                  padding: [
                    38,
                    38,
                  ],
                  maxZoom:
                    13,
                }
              );
            }
          );

          return button;
        };

      routeControl.addTo(
        map
      );

      mapRef.current =
        map;

      window.setTimeout(
        () =>
          map.invalidateSize(),
        100
      );
    }

    loadRoute().catch(
      () => {
        if (!cancelled) {
          setRouteStatus(
            "unavailable"
          );
        }
      }
    );

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();

        mapRef.current =
          null;
      }
    };
  }, [
    latitude,
    longitude,
    originLatitude,
    originLongitude,
  ]);

  function backToBrief() {
    const back =
      new URLSearchParams();

    back.set(
      "returnMatch",
      returnMatch
    );

    router.push(
      `/wild-plan/destination?${back.toString()}`
    );
  }

  return (
    <main className="intelligencePage">
      <header className="globalHeader">
        <button
          type="button"
          className="brand"
          onClick={() =>
            router.push("/")
          }
        >
          ROAMLAB
        </button>

        <span className="headerTitle">
          DESTINATION
          INTELLIGENCE
        </span>

        <button
          type="button"
          className="backButton"
          onClick={
            backToBrief
          }
        >
          ← BACK TO
          DESTINATION BRIEF
        </button>
      </header>

      <div className="desk">
        <article className="paper">
          <section className="documentHeader">
            <div className="documentIdentity">
              <span className="kicker">
                ROAMLAB ·
                DESTINATION
                INTELLIGENCE
              </span>

              <h1>
                {name}
              </h1>

              <p>
                PRE-SELECTION
                DESTINATION
                RESEARCH ·
                DECISION SUPPORT
              </p>
            </div>

            <div className="researchStamp">
              <span>
                ROAMLAB
                FIELD DESK
              </span>

              <strong>
                RESEARCH
                MODE
              </strong>

              <em>
                NOT YET
                SELECTED
              </em>
            </div>
          </section>

          <section className="identityRow">
            <div>
              <span>
                SOURCE
              </span>

              <strong>
                {source.toUpperCase()}
              </strong>
            </div>

            <div>
              <span>
                REFERENCE
              </span>

              <strong>
                {sourceId}
              </strong>
            </div>

            <div>
              <span>
                LOCATION
              </span>

              <strong>
                {latitude !==
                  null &&
                longitude !==
                  null
                  ? `${latitude.toFixed(
                      3
                    )}°, ${longitude.toFixed(
                      3
                    )}°`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>
                GEOGRAPHIC
                DISTANCE
              </span>

              <strong>
                {distanceKm !==
                null
                  ? `${Math.round(
                      distanceKm
                    ).toLocaleString()} KM`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>
                INTERNAL
                MATCH
              </span>

              <strong>
                {matchScore !==
                null
                  ? Math.round(
                      matchScore
                    )
                  : "—"}
              </strong>
            </div>
          </section>

          <nav className="sectionNav">
            <button
              type="button"
              className="active"
            >
              OVERVIEW
            </button>

            <button
              type="button"
            >
              TOPOGRAPHY
            </button>

            <button
              type="button"
            >
              WEATHER
            </button>

            <button
              type="button"
            >
              TERRAIN &
              LAND COVER
            </button>

            <button
              type="button"
            >
              ACTIVITIES
            </button>

            <button
              type="button"
            >
              CAMPING &
              FACILITIES
            </button>

            <button
              type="button"
            >
              ACCESS &
              PERMITS
            </button>

            <button
              type="button"
            >
              SAFETY
            </button>

            <button
              type="button"
            >
              WILD FIT
            </button>
          </nav>

          <div className="contentGrid">
            <section className="mainColumn">
              <div className="sectionHeading">
                <span>
                  01 · OVERVIEW
                </span>

                <h2>
                  Destination
                  intelligence.
                </h2>
              </div>

              <p className="introCopy">
                This page is
                the research
                layer between
                destination
                discovery and
                final selection.
                Use it to
                understand how
                this place fits
                your Wild before
                committing it to
                the full plan.
              </p>

              <section className="routeAccessSection">
                <div className="routeAccessHeading">
                  <div>
                    <span>
                      ROUTE &
                      ACCESS
                    </span>

                    <h2>
                      How this
                      Wild begins.
                    </h2>
                  </div>

                  <div className="routeModeBadge">
                    DRIVE · ACCESS
                    FEASIBILITY
                  </div>
                </div>

                <div className="journeyStrip">
                  <div className="journeyPoint">
                    <span>
                      STARTING
                      FROM
                    </span>

                    <strong>
                      {originLabel}
                    </strong>
                  </div>

                  <div className="journeyLine">
                    <span>
                      DRIVE
                    </span>

                    <i />
                  </div>

                  <div className="journeyPoint destinationPoint">
                    <span>
                      DESTINATION
                    </span>

                    <strong>
                      {name}
                    </strong>
                  </div>
                </div>

                <div className="routeFacts">
                  <div>
                    <span>
                      ROAD
                      DISTANCE
                    </span>

                    <strong>
                      {routeStatus ===
                      "loading"
                        ? "CALCULATING…"
                        : routeDistanceKm !==
                            null
                          ? `${Math.round(
                              routeDistanceKm
                            ).toLocaleString()} KM`
                          : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      EST. DRIVE
                      TIME
                    </span>

                    <strong>
                      {routeDurationMin !==
                      null
                        ? formatDuration(
                            routeDurationMin
                          )
                        : routeStatus ===
                            "loading"
                          ? "CALCULATING…"
                          : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      ACCESS TYPE
                    </span>

                    <strong>
                      ROAD · DRIVE
                    </strong>
                  </div>
                </div>

                <div className="liveMapWrap">
                  {originLatitude !==
                    null &&
                  originLongitude !==
                    null &&
                  latitude !==
                    null &&
                  longitude !==
                    null ? (
                    <div
                      id="destination-intelligence-map"
                      className="liveMap"
                      aria-label={`Road route from ${originLabel} to ${name}`}
                    />
                  ) : (
                    <div className="mapUnavailable">
                      STARTING
                      POINT DATA
                      UNAVAILABLE
                    </div>
                  )}

                  {routeStatus ===
                    "loading" && (
                    <div className="routeLoading">
                      CALCULATING
                      ROAD
                      ACCESS…
                    </div>
                  )}

                  {routeStatus ===
                    "unavailable" && (
                    <div className="routeUnavailable">
                      ROAD ROUTE
                      COULD NOT BE
                      CALCULATED
                    </div>
                  )}

                  <div className="mapCaption">
                    <span>
                      ACCESS ROUTE
                    </span>

                    <strong>
                      OPENSTREETMAP
                      · OSRM
                    </strong>
                  </div>
                </div>

                <p className="routeNote">
                  ACCESS SNAPSHOT
                  · FASTEST ROAD
                  ROUTE ESTIMATE ·
                  FINAL ACCESS,
                  CONDITIONS AND
                  STOPS ARE PLANNED
                  AFTER DESTINATION
                  SELECTION.
                </p>
              </section>
            </section>

            <aside className="sideColumn">
              <section className="sideBlock decisionBlock">
                <span className="sideLabel">
                  DECISION STATUS
                </span>

                <h3>
                  Still
                  exploring.
                </h3>

                <p>
                  Viewing this
                  intelligence
                  page does not
                  set the
                  destination.
                  Return to the
                  Destination
                  Brief when
                  you are ready
                  to compare or
                  confirm.
                </p>
              </section>

              <section className="sideBlock">
                <span className="sideLabel">
                  CURRENT
                  DESTINATION
                </span>

                <strong className="sideDestination">
                  {name}
                </strong>

                <p>
                  Candidate #
                  {String(
                    Number(
                      returnMatch
                    ) + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </p>
              </section>

              <section className="sideBlock">
                <span className="sideLabel">
                  NEXT DATA
                  LAYERS
                </span>

                <div className="dataLayerList">
                  <span>
                    TOPOGRAPHY
                  </span>

                  <span>
                    WEATHER
                  </span>

                  <span>
                    TERRAIN &
                    LAND COVER
                  </span>

                  <span>
                    CAMPING &
                    FACILITIES
                  </span>

                  <span>
                    ACCESS &
                    PERMITS
                  </span>

                  <span>
                    SAFETY
                  </span>
                </div>
              </section>

              <section className="sideBlock returnBlock">
                <span className="sideLabel">
                  RETURN PATH
                </span>

                <p>
                  Your active
                  match remains
                  part of the
                  Destination
                  Brief
                  comparison.
                </p>

                <button
                  type="button"
                  onClick={
                    backToBrief
                  }
                >
                  BACK TO
                  DESTINATION
                  BRIEF →
                </button>
              </section>
            </aside>
          </div>

          <footer className="documentFooter">
            <div>
              <span>
                ROAMLAB
              </span>

              <strong>
                DESTINATION
                INTELLIGENCE
              </strong>
            </div>

            <p>
              RESEARCH BEFORE
              COMMITMENT ·
              CONFIRMATION
              HAPPENS IN THE
              DESTINATION BRIEF
            </p>
          </footer>
        </article>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #15130f;
        }

        body {
          overflow-x: hidden;
        }

        .leaflet-container {
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .roamlabIntelligenceCenter {
          width: auto !important;
          min-width: 74px;
          height: 30px;
          padding: 0 9px;
          border: 1px solid rgba(30, 27, 22, 0.45);
          border-radius: 2px;
          background: rgba(242, 234, 217, 0.94);
          color: #3d3328;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
          cursor: pointer;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .roamlabIntelligenceCenter:hover {
          background: #fffaf0;
        }
      `}</style>

      <style jsx>{`
        .intelligencePage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% 10%,
              rgba(
                115,
                83,
                50,
                0.16
              ),
              transparent
                38%
            ),
            linear-gradient(
              180deg,
              #171510
                0%,
              #0f0e0b
                100%
            );
          color: #2f2922;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .globalHeader {
          position: fixed;
          z-index: 100;
          top: 0;
          left: 0;
          right: 0;
          height: 58px;
          display: grid;
          grid-template-columns:
            1fr auto 1fr;
          align-items: center;
          padding:
            0 32px;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          background:
            rgba(
              13,
              13,
              11,
              0.95
            );
          backdrop-filter:
            blur(14px);
        }

        .brand,
        .backButton {
          border: 0;
          padding: 0;
          background:
            transparent;
          color: #eee5d5;
          cursor: pointer;
        }

        .brand {
          justify-self:
            start;
          font-size: 18px;
          font-weight: 900;
          letter-spacing:
            0.14em;
        }

        .headerTitle {
          color:
            rgba(
              238,
              229,
              213,
              0.64
            );
          font-size: 9px;
          font-weight: 800;
          letter-spacing:
            0.22em;
        }

        .backButton {
          justify-self:
            end;
          color: #d59a62;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.1em;
        }

        .desk {
          width: 100%;
          padding:
            104px 24px
            70px;
        }

        .paper {
          position: relative;
          width:
            min(
              1180px,
              calc(
                100vw -
                  48px
              )
            );
          margin: 0 auto;
          padding:
            42px 48px
            34px;
          background:
            linear-gradient(
              135deg,
              rgba(
                255,
                255,
                255,
                0.22
              ),
              transparent
                30%
            ),
            #e8dfcd;
          box-shadow:
            0 28px
              80px
              rgba(
                0,
                0,
                0,
                0.45
              ),
            inset 0 0
              90px
              rgba(
                91,
                69,
                43,
                0.08
              );
        }

        .paper::before {
          content: "";
          position:
            absolute;
          inset: 0;
          pointer-events:
            none;
          opacity: 0.28;
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(
                  75,
                  57,
                  38,
                  0.025
                )
                0,
              rgba(
                  75,
                  57,
                  38,
                  0.025
                )
                1px,
              transparent
                1px,
              transparent
                4px
            );
        }

        .documentHeader {
          position:
            relative;
          display: flex;
          justify-content:
            space-between;
          align-items:
            flex-start;
          gap: 32px;
          padding-bottom:
            28px;
          border-bottom:
            2px solid
            #393129;
        }

        .documentIdentity {
          max-width:
            780px;
        }

        .kicker {
          display: block;
          margin-bottom:
            12px;
          color: #8c542d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing:
            0.2em;
        }

        .documentIdentity h1 {
          max-width:
            760px;
          margin: 0;
          color: #2d261f;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size:
            clamp(
              34px,
              4.6vw,
              62px
            );
          font-weight: 500;
          line-height: 0.98;
          letter-spacing:
            -0.045em;
        }

        .documentIdentity p {
          margin:
            16px 0 0;
          color: #766756;
          font-size: 10px;
          font-weight: 800;
          letter-spacing:
            0.13em;
        }

        .researchStamp {
          position:
            relative;
          flex: 0 0
            164px;
          min-height:
            118px;
          display: flex;
          flex-direction:
            column;
          align-items:
            center;
          justify-content:
            center;
          gap: 5px;
          padding:
            15px 10px;
          border:
            3px double
            rgba(
              124,
              64,
              39,
              0.78
            );
          color: #7a402a;
          text-align:
            center;
          transform:
            rotate(
              -2deg
            );
          box-shadow:
            inset 0 0
              0 3px
              rgba(
                124,
                64,
                39,
                0.08
              );
          background:
            radial-gradient(
              circle at
                20% 30%,
              rgba(
                  123,
                  66,
                  41,
                  0.07
                )
                0 1px,
              transparent
                2px
            ),
            radial-gradient(
              circle at
                80% 70%,
              rgba(
                  123,
                  66,
                  41,
                  0.06
                )
                0 1px,
              transparent
                2px
            );
          background-size:
            13px 13px,
            17px 17px;
        }

        .researchStamp span {
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.18em;
        }

        .researchStamp strong {
          font-size: 18px;
          line-height: 1;
          letter-spacing:
            0.08em;
        }

        .researchStamp em {
          font-style:
            normal;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.13em;
        }

        .identityRow {
          position:
            relative;
          display: grid;
          grid-template-columns:
            repeat(
              5,
              1fr
            );
          border-bottom:
            1px solid
            rgba(
              57,
              49,
              41,
              0.3
            );
        }

        .identityRow > div {
          min-width: 0;
          padding:
            16px 14px
            15px 0;
          border-right:
            1px solid
            rgba(
              57,
              49,
              41,
              0.18
            );
        }

        .identityRow > div
          + div {
          padding-left:
            14px;
        }

        .identityRow > div:last-child {
          border-right:
            0;
        }

        .identityRow span {
          display: block;
          margin-bottom:
            5px;
          color: #8b7a67;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.12em;
        }

        .identityRow strong {
          display: block;
          overflow: hidden;
          color: #332a22;
          font-size: 13px;
          font-weight: 800;
          text-overflow:
            ellipsis;
          white-space:
            nowrap;
        }

        .sectionNav {
          position:
            relative;
          display: flex;
          gap: 0;
          overflow-x:
            auto;
          margin:
            0 -48px;
          padding:
            0 48px;
          border-bottom:
            1px solid
            rgba(
              57,
              49,
              41,
              0.25
            );
          scrollbar-width:
            none;
        }

        .sectionNav::-webkit-scrollbar {
          display: none;
        }

        .sectionNav button {
          flex: 0 0
            auto;
          height: 46px;
          border: 0;
          border-bottom:
            2px solid
            transparent;
          padding:
            0 14px;
          background:
            transparent;
          color: #82715f;
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.1em;
          cursor: default;
        }

        .sectionNav button:first-child {
          padding-left:
            0;
        }

        .sectionNav button.active {
          border-bottom-color:
            #8b542e;
          color: #6f3f22;
        }

        .contentGrid {
          position:
            relative;
          display: grid;
          grid-template-columns:
            minmax(
              0,
              1fr
            )
            290px;
          gap: 46px;
          padding-top:
            38px;
        }

        .mainColumn {
          min-width: 0;
        }

        .sectionHeading span {
          display: block;
          color: #8b542e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing:
            0.15em;
        }

        .sectionHeading h2 {
          margin:
            8px 0 0;
          color: #302820;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 32px;
          font-weight: 500;
          letter-spacing:
            -0.025em;
        }

        .introCopy {
          max-width:
            670px;
          margin:
            14px 0 0;
          color: #5d5144;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 15px;
          line-height: 1.7;
        }

        .routeAccessSection {
          margin-top:
            30px;
        }

        .routeAccessHeading {
          display: flex;
          align-items:
            flex-end;
          justify-content:
            space-between;
          gap: 20px;
          margin-bottom:
            18px;
        }

        .routeAccessHeading span {
          color: #8b542e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing:
            0.16em;
        }

        .routeAccessHeading h2 {
          margin:
            5px 0 0;
          color: #2d261f;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 24px;
          font-weight: 500;
        }

        .routeModeBadge {
          padding:
            8px 10px;
          border:
            1px solid
            rgba(
              139,
              84,
              46,
              0.35
            );
          color: #75462a;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.11em;
          white-space:
            nowrap;
        }

        .journeyStrip {
          display: grid;
          grid-template-columns:
            minmax(
              0,
              1fr
            )
            120px
            minmax(
              0,
              1fr
            );
          gap: 14px;
          align-items:
            center;
          padding:
            16px 0;
          border-top:
            1px solid
            rgba(
              65,
              52,
              39,
              0.22
            );
          border-bottom:
            1px solid
            rgba(
              65,
              52,
              39,
              0.22
            );
        }

        .journeyPoint span,
        .routeFacts span {
          display: block;
          color: #8b7a67;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.12em;
        }

        .journeyPoint strong {
          display: block;
          margin-top:
            5px;
          color: #332a22;
          font-size: 13px;
          line-height: 1.3;
        }

        .destinationPoint {
          text-align:
            right;
        }

        .journeyLine {
          display: flex;
          flex-direction:
            column;
          align-items:
            center;
          gap: 6px;
          color: #8b542e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.14em;
        }

        .journeyLine i {
          position:
            relative;
          display: block;
          width: 100%;
          height: 1px;
          background:
            #8b542e;
        }

        .journeyLine i::before,
        .journeyLine i::after {
          content: "";
          position:
            absolute;
          top: 50%;
          width: 7px;
          height: 7px;
          border-radius:
            50%;
          background:
            #8b542e;
          transform:
            translateY(
              -50%
            );
        }

        .journeyLine i::before {
          left: 0;
        }

        .journeyLine i::after {
          right: 0;
        }

        .routeFacts {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );
          border-bottom:
            1px solid
            rgba(
              65,
              52,
              39,
              0.22
            );
        }

        .routeFacts > div {
          padding:
            13px 14px
            13px 0;
          border-right:
            1px solid
            rgba(
              65,
              52,
              39,
              0.16
            );
        }

        .routeFacts > div
          + div {
          padding-left:
            14px;
        }

        .routeFacts > div:last-child {
          border-right:
            0;
        }

        .routeFacts strong {
          display: block;
          margin-top:
            5px;
          color: #332a22;
          font-size: 14px;
          letter-spacing:
            0.02em;
        }

        .liveMapWrap {
          position:
            relative;
          height: 360px;
          margin-top:
            18px;
          overflow: hidden;
          border:
            1px solid
            rgba(
              58,
              48,
              38,
              0.38
            );
          background:
            #c9c0ad;
        }

        .liveMap {
          width: 100%;
          height: 100%;
        }

        .mapUnavailable {
          width: 100%;
          height: 100%;
          display: flex;
          align-items:
            center;
          justify-content:
            center;
          background:
            linear-gradient(
              135deg,
              #c9c0ad,
              #b8ad98
            );
          color:
            rgba(
              57,
              48,
              38,
              0.72
            );
          font-size: 10px;
          font-weight: 900;
          letter-spacing:
            0.13em;
        }

        .routeLoading,
        .routeUnavailable {
          position:
            absolute;
          z-index: 450;
          top: 14px;
          right: 14px;
          padding:
            8px 10px;
          background:
            rgba(
              36,
              31,
              25,
              0.86
            );
          color: #eee5d5;
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.1em;
          pointer-events:
            none;
        }

        .routeUnavailable {
          background:
            rgba(
              111,
              63,
              34,
              0.9
            );
        }

        .mapCaption {
          position:
            absolute;
          z-index: 400;
          left: 12px;
          bottom: 12px;
          display: flex;
          align-items:
            center;
          gap: 8px;
          padding:
            7px 9px;
          background:
            rgba(
              237,
              228,
              210,
              0.92
            );
          box-shadow:
            0 3px 10px
            rgba(
              0,
              0,
              0,
              0.18
            );
          pointer-events:
            none;
        }

        .mapCaption span {
          color: #8b542e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.1em;
        }

        .mapCaption strong {
          color: #44382d;
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.06em;
        }

        .routeNote {
          margin:
            10px 0 0;
          color: #82715f;
          font-size: 9px;
          font-weight: 800;
          line-height: 1.5;
          letter-spacing:
            0.08em;
        }

        .sideColumn {
          border-left:
            1px solid
            rgba(
              57,
              49,
              41,
              0.25
            );
          padding-left:
            26px;
        }

        .sideBlock {
          padding:
            0 0 24px;
          margin-bottom:
            24px;
          border-bottom:
            1px solid
            rgba(
              57,
              49,
              41,
              0.2
            );
        }

        .sideLabel {
          display: block;
          margin-bottom:
            9px;
          color: #8b542e;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.14em;
        }

        .sideBlock h3 {
          margin:
            0 0 9px;
          color: #312920;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 23px;
          font-weight: 500;
        }

        .sideBlock p {
          margin: 0;
          color: #6c5e4e;
          font-size: 13px;
          line-height: 1.55;
        }

        .decisionBlock {
          padding:
            18px;
          border:
            1px solid
            rgba(
              109,
              63,
              35,
              0.3
            );
          background:
            rgba(
              121,
              79,
              43,
              0.055
            );
        }

        .sideDestination {
          display: block;
          margin-bottom:
            7px;
          color: #312920;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 17px;
          line-height: 1.3;
        }

        .dataLayerList {
          display: grid;
          gap: 7px;
        }

        .dataLayerList span {
          padding:
            7px 8px;
          border-left:
            2px solid
            rgba(
              139,
              84,
              46,
              0.55
            );
          background:
            rgba(
              255,
              255,
              255,
              0.14
            );
          color: #655545;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.08em;
        }

        .returnBlock button {
          width: 100%;
          margin-top:
            14px;
          border:
            1px solid
            #724327;
          padding:
            11px 12px;
          background:
            transparent;
          color: #724327;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.09em;
          cursor: pointer;
          transition:
            160ms ease;
        }

        .returnBlock button:hover {
          background:
            #724327;
          color: #f0e7d5;
        }

        .documentFooter {
          position:
            relative;
          display: flex;
          justify-content:
            space-between;
          align-items:
            flex-end;
          gap: 24px;
          margin-top:
            38px;
          padding-top:
            18px;
          border-top:
            2px solid
            #393129;
        }

        .documentFooter div {
          display: flex;
          flex-direction:
            column;
          gap: 3px;
        }

        .documentFooter span {
          color: #8b542e;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.15em;
        }

        .documentFooter strong {
          color: #332b23;
          font-size: 11px;
          letter-spacing:
            0.08em;
        }

        .documentFooter p {
          max-width:
            520px;
          margin: 0;
          color: #81715f;
          font-size: 8px;
          font-weight: 900;
          line-height: 1.5;
          text-align:
            right;
          letter-spacing:
            0.1em;
        }

        @media (
          max-width:
            900px
        ) {
          .globalHeader {
            grid-template-columns:
              1fr auto;
            padding:
              0 18px;
          }

          .headerTitle {
            display: none;
          }

          .desk {
            padding:
              82px 12px
              40px;
          }

          .paper {
            width: 100%;
            padding:
              30px 24px;
          }

          .sectionNav {
            margin:
              0 -24px;
            padding:
              0 24px;
          }

          .documentHeader {
            gap: 18px;
          }

          .researchStamp {
            flex-basis:
              138px;
          }

          .identityRow {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .contentGrid {
            grid-template-columns:
              1fr;
            gap: 34px;
          }

          .sideColumn {
            border-left:
              0;
            border-top:
              1px solid
              rgba(
                57,
                49,
                41,
                0.25
              );
            padding:
              28px 0 0;
          }
        }

        @media (
          max-width:
            640px
        ) {
          .globalHeader {
            height: 54px;
          }

          .brand {
            font-size: 15px;
          }

          .backButton {
            max-width:
              150px;
            font-size: 8px;
            text-align:
              right;
          }

          .paper {
            padding:
              24px 18px;
          }

          .documentHeader {
            flex-direction:
              column;
          }

          .researchStamp {
            align-self:
              flex-end;
            width: 150px;
            flex-basis:
              auto;
          }

          .identityRow {
            grid-template-columns:
              1fr;
          }

          .identityRow > div,
          .identityRow > div
            + div {
            padding:
              12px 0;
            border-right:
              0;
            border-bottom:
              1px solid
              rgba(
                57,
                49,
                41,
                0.14
              );
          }

          .sectionNav {
            margin:
              0 -18px;
            padding:
              0 18px;
          }

          .routeAccessHeading {
            align-items:
              flex-start;
            flex-direction:
              column;
          }

          .journeyStrip {
            grid-template-columns:
              1fr;
          }

          .journeyLine {
            align-items:
              flex-start;
          }

          .journeyLine i {
            width: 80px;
          }

          .destinationPoint {
            text-align:
              left;
          }

          .routeFacts {
            grid-template-columns:
              1fr;
          }

          .routeFacts > div {
            border-right:
              0;
            border-bottom:
              1px solid
              rgba(
                65,
                52,
                39,
                0.14
              );
            padding:
              12px 0;
          }

          .routeFacts > div
            + div {
            padding-left:
              0;
          }

          .liveMapWrap {
            height: 320px;
          }

          .documentFooter {
            align-items:
              flex-start;
            flex-direction:
              column;
          }

          .documentFooter p {
            text-align:
              left;
          }
        }
      `}</style>
    </main>
  );
}

function LoadingDestinationIntelligence() {
  return (
    <main
      style={{
        minHeight:
          "100vh",
        background:
          "#15130f",
      }}
    />
  );
}

export default function DestinationIntelligencePage() {
  return (
    <Suspense
      fallback={
        <LoadingDestinationIntelligence />
      }
    >
      <DestinationIntelligenceContent />
    </Suspense>
  );
}

// END OF FILE
