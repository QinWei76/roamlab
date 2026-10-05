"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Wild } from "@/types/wild";

import {
  CURRENT_WILD_UPDATED_EVENT,
  getCurrentWild,
} from "@/lib/wildStore";

declare global {
  interface Window {
    L?: any;
  }
}

type Point = {
  latitude: number;
  longitude: number;
};

function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") return false;

  const p = value as Partial<Point>;

  return (
    typeof p.latitude === "number" &&
    Number.isFinite(p.latitude) &&
    typeof p.longitude === "number" &&
    Number.isFinite(p.longitude)
  );
}

function titleCase(value?: string) {
  if (!value) return "Not set";

  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

function tripLabel(value?: string) {
  const labels: Record<string, string> = {
    weekend: "Weekend Escape",
    "road-trip": "Road Trip",
    basecamp: "Basecamp",
    remote: "Remote / Off-Grid",
  };

  return value
    ? labels[value] ?? titleCase(value)
    : "Trip style not set";
}

function money(
  value?: number,
  currency = "USD"
) {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "Not set";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString(
      "en-US"
    )}`;
  }
}

function dateLabel(value?: string) {
  if (!value) return "";

  const date = new Date(
    `${value}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

/* =========================================================
   LEAFLET LOADER
   ========================================================= */

function ensureLeaflet(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error(
        "Leaflet requires the browser."
      )
    );
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (
    !document.getElementById(
      "roamlab-leaflet-css"
    )
  ) {
    const css =
      document.createElement("link");

    css.id = "roamlab-leaflet-css";
    css.rel = "stylesheet";

    css.href =
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

    document.head.appendChild(css);
  }

  return new Promise<any>(
    (resolve, reject) => {
      const existing =
        document.getElementById(
          "roamlab-leaflet-js"
        ) as HTMLScriptElement | null;

      if (existing) {
        const waitForLeaflet = () => {
          if (window.L) {
            resolve(window.L);
            return;
          }

          window.setTimeout(
            waitForLeaflet,
            50
          );
        };

        waitForLeaflet();
        return;
      }

      const script =
        document.createElement("script");

      script.id =
        "roamlab-leaflet-js";

      script.src =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

      script.async = true;

      script.onload = () => {
        if (window.L) {
          resolve(window.L);
        } else {
          reject(
            new Error(
              "Leaflet unavailable."
            )
          );
        }
      };

      script.onerror = () => {
        reject(
          new Error(
            "Leaflet failed to load."
          )
        );
      };

      document.body.appendChild(
        script
      );
    }
  );
}

/* =========================================================
   DYNAMIC JOURNEY MAP
   ========================================================= */

function JourneyMap({
  origin,
  destination,
  originName,
  destinationName,
  savedDistanceKm,
  savedHours,
  onEdit,
}: {
  origin?: Point;
  destination?: Point;

  originName: string;
  destinationName: string;

  savedDistanceKm?: number;
  savedHours?: number;

  onEdit: () => void;
}) {
  const mapNodeRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<any>(null);

  const [
    geometry,
    setGeometry,
  ] = useState<
    [number, number][]
  >([]);

  const [
    liveDistance,
    setLiveDistance,
  ] = useState<number>();

  const [
    liveHours,
    setLiveHours,
  ] = useState<number>();

  const [
    status,
    setStatus,
  ] = useState<
    | "idle"
    | "loading"
    | "ready"
    | "error"
  >("idle");

  const ready =
    isPoint(origin) &&
    isPoint(destination);

  /* -------------------------------------------------------
     LOAD REAL ACCESS ROUTE FROM OSRM
     ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    if (!ready) {
      setGeometry([]);
      setStatus("idle");
      return;
    }

    const start = origin;
    const end = destination;

    async function loadRoute() {
      setStatus("loading");

      try {
        const url =
          "https://router.project-osrm.org/route/v1/driving/" +
          `${start.longitude},${start.latitude};` +
          `${end.longitude},${end.latitude}` +
          "?overview=full" +
          "&geometries=geojson" +
          "&steps=false" +
          "&alternatives=false";

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "OSRM route request failed."
          );
        }

        const data =
          await response.json();

        const first =
          data?.routes?.[0];

        if (
          !first?.geometry?.coordinates
        ) {
          throw new Error(
            "No route geometry returned."
          );
        }

        const routeGeometry:
          [number, number][] =
          first.geometry.coordinates.map(
            (
              point:
                [number, number]
            ) => [
              point[1],
              point[0],
            ]
          );

        if (!cancelled) {
          setGeometry(
            routeGeometry
          );

          setLiveDistance(
            typeof first.distance ===
              "number"
              ? first.distance / 1000
              : undefined
          );

          setLiveHours(
            typeof first.duration ===
              "number"
              ? first.duration / 3600
              : undefined
          );

          setStatus("ready");
        }
      } catch (error) {
        console.error(
          "Wild Plan route loading failed:",
          error
        );

        if (!cancelled) {
          setGeometry([]);
          setStatus("error");
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    ready,
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
  ]);

  /* -------------------------------------------------------
     BUILD LEAFLET MAP
     ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    if (
      !mapNodeRef.current ||
      !ready
    ) {
      return;
    }

    const start = origin;
    const end = destination;

    async function drawMap() {
      try {
        const L =
          await ensureLeaflet();

        if (
          cancelled ||
          !mapNodeRef.current
        ) {
          return;
        }

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(
          mapNodeRef.current,
          {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
          }
        );

        mapRef.current = map;

        /*
          USGS Topographic Map

          We deliberately keep the real map
          underneath a warm paper treatment
          so it belongs to the expedition desk.
        */

        L.tileLayer(
          "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 16,
          }
        ).addTo(map);

        const startIcon =
          L.divIcon({
            className:
              "roamlab-map-icon",

            html:
              '<span class="roamlab-pin roamlab-pin-start"></span>',

            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });

        const wildIcon =
          L.divIcon({
            className:
              "roamlab-map-icon",

            html:
              '<span class="roamlab-pin roamlab-pin-wild"></span>',

            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

        L.marker(
          [
            start.latitude,
            start.longitude,
          ],
          {
            icon: startIcon,
          }
        ).addTo(map);

        L.marker(
          [
            end.latitude,
            end.longitude,
          ],
          {
            icon: wildIcon,
          }
        ).addTo(map);

        const routePoints =
          geometry.length > 1
            ? geometry
            : [
                [
                  start.latitude,
                  start.longitude,
                ],
                [
                  end.latitude,
                  end.longitude,
                ],
              ];

        L.polyline(
          routePoints,
          {
            color: "#963b2a",
            weight: 4,
            opacity: 0.92,
            lineCap: "round",
            lineJoin: "round",
          }
        ).addTo(map);

        const bounds =
          L.latLngBounds([
            [
              start.latitude,
              start.longitude,
            ],

            [
              end.latitude,
              end.longitude,
            ],

            ...geometry,
          ]);

        map.fitBounds(
          bounds,
          {
            padding: [55, 55],
            maxZoom: 10,
          }
        );

        window.setTimeout(
          () => {
            if (!cancelled) {
              map.invalidateSize();
            }
          },
          100
        );
      } catch (error) {
        console.error(
          "Wild Plan map loading failed:",
          error
        );
      }
    }

    drawMap();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    ready,
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
    geometry,
  ]);

  const distance =
    liveDistance ??
    savedDistanceKm;

  const hours =
    liveHours ??
    savedHours;

  const routeText = [
    typeof distance === "number"
      ? `${Math.round(
          distance
        )} KM`
      : "",

    typeof hours === "number"
      ? `${hours.toFixed(
          1
        )} HRS`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="journey-map">

      <div className="journey-map-paper">

        {ready ? (
          <div
            ref={mapNodeRef}
            className="journey-map-live"
          />
        ) : (
          <div className="journey-map-empty">

            <span>
              JOURNEY MAP
            </span>

            <strong>
              Waiting for map
              coordinates.
            </strong>

            <p>
              Set a starting point
              and destination to
              bring this paper map
              to life.
            </p>

          </div>
        )}

        <div
          className="paper-wash"
        />

        <div
          className="paper-fold fold-a"
        />

        <div
          className="paper-fold fold-b"
        />

        <button
          type="button"
          className="journey-start"
          onClick={onEdit}
        >
          <small>
            START
          </small>

          <b>
            {originName}
          </b>
        </button>

        <button
          type="button"
          className="journey-wild"
          onClick={onEdit}
        >
          <small>
            WILD
          </small>

          <b>
            {destinationName}
          </b>
        </button>

        <div className="journey-distance">

          {status === "loading"
            ? "DRAWING ACCESS ROUTE..."

            : status === "error"
              ? routeText ||
                "ROUTE UNAVAILABLE"

              : routeText ||
                "ROUTE IN PROGRESS"}

        </div>

        <button
          type="button"
          className="journey-edit"
          onClick={onEdit}
        >
          EDIT JOURNEY →
        </button>

      </div>

    </article>
  );
}

/* =========================================================
   WILD PLAN PAGE
   ========================================================= */

export default function WildPlanPage() {
  const router = useRouter();

  const [
    wild,
    setWild,
  ] = useState<Wild | null>(
    null
  );

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  useEffect(() => {
    const load = () => {
      setWild(
        getCurrentWild()
      );

      setLoaded(true);
    };

    load();

    window.addEventListener(
      CURRENT_WILD_UPDATED_EVENT,
      load
    );

    window.addEventListener(
      "storage",
      load
    );

    return () => {
      window.removeEventListener(
        CURRENT_WILD_UPDATED_EVENT,
        load
      );

      window.removeEventListener(
        "storage",
        load
      );
    };
  }, []);

  if (!loaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#100b07",
        }}
      />
    );
  }

  if (!wild) {
    return (
      <main className="empty-wild">

        <section className="empty-paper">

          <small>
            ROAMLAB · WILD PLAN
          </small>

          <h1>
            Nothing on the table yet.
          </h1>

          <p>
            Choose your way in and
            begin building your next
            Wild.
          </p>

          <button
            onClick={() =>
              router.push(
                "/ways-in"
              )
            }
          >
            START YOUR WILD →
          </button>

        </section>

        <style jsx>{`

          .empty-wild {
            min-height: 100vh;

            display: grid;
            place-items: center;

            padding: 30px;

            color: #35291e;

            background:
              linear-gradient(
                rgba(10,7,4,.2),
                rgba(10,7,4,.6)
              ),
              url("/wild-plan-test.jpg")
              center / cover;
          }

          .empty-paper {
            width:
              min(560px, 90vw);

            padding:
              50px;

            background:
              rgba(
                221,
                207,
                177,
                .94
              );

            box-shadow:
              0 30px 90px
              rgba(0,0,0,.6);

            transform:
              rotate(-1deg);
          }

          .empty-paper small {
            font:
              800 10px
              Arial,
              sans-serif;

            letter-spacing:
              .2em;
          }

          .empty-paper h1 {
            margin:
              18px 0 12px;

            font:
              400 44px
              Georgia,
              serif;
          }

          .empty-paper p {
            font:
              16px/1.6
              Georgia,
              serif;
          }

          .empty-paper button {
            margin-top:
              20px;

            padding:
              13px 17px;

            border: 0;

            background:
              #93432a;

            color:
              #fff1dc;

            cursor:
              pointer;

            font:
              800 10px
              Arial,
              sans-serif;

            letter-spacing:
              .12em;
          }

        `}</style>

      </main>
    );
  }
    const adventure =
    wild.plan.adventure;

  const schedule =
    adventure.schedule;

  const destination =
    adventure.destination;

  const intent =
    adventure.intent;

  const route =
    wild.plan.route;

  const conditions =
    wild.plan.conditions;

  const gear =
    wild.plan.prepare?.gear;

  const cost =
    wild.plan.cost;

  const planning =
    wild.plan.planning;

  const items =
    gear?.items ?? [];

  /* =======================================================
     GEAR COUNTS
     ======================================================= */

  const essential =
    items.filter(
      (item) =>
        item.priority ===
        "essential"
    ).length;

  const recommended =
    items.filter(
      (item) =>
        item.priority ===
        "recommended"
    ).length;

  const optional =
    items.filter(
      (item) =>
        item.priority ===
        "optional"
    ).length;

  const owned =
    items.filter(
      (item) =>
        item.ownershipStatus ===
        "owned"
    ).length;

  const gap =
    items.filter(
      (item) =>
        [
          "to-buy",
          "borrow",
          "rent",
        ].includes(
          item.ownershipStatus
        )
    ).length;

  /* =======================================================
     PLAN / BUDGET
     ======================================================= */

  const issues =
    (
      planning?.issues ?? []
    ).filter(
      (issue) =>
        issue.status === "open"
    );

  const currency =
    cost?.currency ?? "USD";

  const projected =
    planning?.projectedWildCost ??
    cost?.estimatedTotal;

  const remaining =
    cost?.remainingBudget ??
    (
      typeof cost?.totalWildBudget ===
        "number" &&
      typeof projected ===
        "number"

        ? cost.totalWildBudget -
          projected

        : undefined
    );

  /* =======================================================
     SCHEDULE
     ======================================================= */

  const dateLine =
    schedule?.startDate &&
    schedule?.endDate

      ? `${dateLabel(
          schedule.startDate
        )} — ${dateLabel(
          schedule.endDate
        )}`

      : schedule?.timingMode ===
          "flexible"

        ? "FLEXIBLE DATES"

        : schedule?.timingMode ===
            "undecided"

          ? "DATES UNDECIDED"

          : "DATES NOT SET";

  /* =======================================================
     JOURNEY DATA
     ======================================================= */

  const originName =
    intent?.startingFrom?.name ??
    "Starting point not set";

  const destinationName =
    destination?.name ??
    "Choose your destination";

  const people =
    adventure.crew?.people ?? 0;

  const originCoordinates =
    isPoint(
      intent?.startingFrom
        ?.coordinates
    )

      ? intent.startingFrom
          .coordinates

      : undefined;

  const destinationCoordinates =
    isPoint(
      destination?.coordinates
    )

      ? destination.coordinates

      : undefined;

  /* =======================================================
     KEEP EXISTING CONTEXT WHEN EDITING
     ======================================================= */

  function contextQuery() {
    const params =
      new URLSearchParams();

    if (
      adventure.vehicle?.type
    ) {
      params.set(
        "vehicle",
        adventure.vehicle.type
      );
    }

    if (
      adventure.tripStyle
    ) {
      params.set(
        "trip",
        adventure.tripStyle
      );
    }

    if (
      adventure.crew?.type
    ) {
      params.set(
        "crew",
        adventure.crew.type
      );
    }

    if (
      adventure.crew?.people
    ) {
      params.set(
        "people",
        String(
          adventure.crew.people
        )
      );
    }

    if (
      schedule?.durationType
    ) {
      params.set(
        "duration",
        schedule.durationType
      );
    }

    return params.toString();
  }

  /* =======================================================
     PLAN CHECK PROGRESS
     ======================================================= */

  const readinessPercent =
    wild.plan.readiness
      ?.overallPercent;

  const planProgress =
    typeof readinessPercent ===
      "number"

      ? Math.max(
          0,
          Math.min(
            100,
            readinessPercent
          )
        )

      : items.length
        ? 58
        : 24;

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <main className="wild-desk">

      {/* ================================================
          GLOBAL NAVIGATION
          ================================================ */}

      <header className="wild-nav">

        <button
          className="brand"
          onClick={() =>
            router.push("/")
          }
        >
          ROAMLAB
        </button>

        <nav>

          <button
            onClick={() =>
              router.push(
                "/ways-in"
              )
            }
          >
            EXPLORE
          </button>

          <button
            onClick={() =>
              router.push(
                "/gear"
              )
            }
          >
            GEAR LAB
          </button>

          <span>
            WILD PLAN
          </span>

        </nav>

      </header>

      {/* ================================================
          PHOTOREALISTIC DESK MASTER
          ================================================ */}

      <section className="desk-stage">

        <img
          className="desk-master"
          src="/wild-plan-test.jpg"
          alt=""
          aria-hidden="true"
        />

        <div
          className="desk-shade"
          aria-hidden="true"
        />

        {/* ==============================================
            CURRENT WILD
            ============================================== */}

        <article
          className="
            overlay
            current-wild-overlay
          "
        >

          <small>
            CURRENT WILD
          </small>

          <h1>
            {destinationName}
          </h1>

          <p>
            {titleCase(
              adventure.wayIn
            )}
            {" · "}
            {tripLabel(
              adventure.tripStyle
            )}
          </p>

          <p>
            {people
              ? `${people} ${
                  people === 1
                    ? "Person"
                    : "People"
                }`

              : "Crew not set"}
          </p>

          <p>
            {schedule?.days
              ? `${schedule.days} Days · ${
                  schedule.nights ??
                  0
                } Nights`

              : dateLine}
          </p>

        </article>

        {/* ==============================================
            REAL DYNAMIC JOURNEY MAP
            ============================================== */}

        <JourneyMap
          origin={
            originCoordinates
          }

          destination={
            destinationCoordinates
          }

          originName={
            originName
          }

          destinationName={
            destinationName
          }

          savedDistanceKm={
            route?.distanceKm
          }

          savedHours={
            route?.estimatedHours
          }

          onEdit={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        />

        {/* ==============================================
            DESTINATION POLAROID HOT ZONE
            ============================================== */}

        <button
          type="button"

          className="
            overlay
            destination-overlay
          "

          onClick={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        >

          <small>
            DESTINATION
          </small>

          <strong>
            {destinationName}
          </strong>

          <span>
            VIEW / CHANGE →
          </span>

        </button>

        {/* ==============================================
            CONDITIONS NOTE
            ============================================== */}

        <button
          type="button"

          className="
            overlay
            conditions-overlay
          "

          onClick={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        >

          <small>
            CONDITIONS
          </small>

          <strong>
            {conditions
              ?.weatherSummary ||
              "Weather & terrain"}
          </strong>

          <span>
            OPEN INTELLIGENCE →
          </span>

        </button>

        {/* ==============================================
            BUDGET NOTEBOOK
            ============================================== */}

        <button
          type="button"

          className="
            overlay
            budget-overlay
          "

          onClick={() => {

            const query =
              contextQuery();

            router.push(
              query
                ? `/ways-in/drive/budget?${query}`
                : "/ways-in/drive/budget"
            );

          }}
        >

          <small>
            BUDGET
          </small>

          <strong>
            {cost?.budgetStatus ===
            "unknown"

              ? "NOT SET"

              : money(
                  cost?.totalWildBudget,
                  currency
                )}
          </strong>

          <p>

            <span>
              Projected
            </span>

            <b>
              {money(
                projected,
                currency
              )}
            </b>

          </p>

          <p>

            <span>
              Remaining
            </span>

            <b>
              {money(
                remaining,
                currency
              )}
            </b>

          </p>

          <em>
            EDIT BUDGET →
          </em>

        </button>

        {/* ==============================================
            PLAN CHECK NOTEBOOK
            ============================================== */}

        <article
          className="
            overlay
            plan-overlay
          "
        >

          <small>
            PLAN CHECK
          </small>

          <ul>

            <li>

              <i
                className={
                  route
                    ? "done"
                    : ""
                }
              >
                {route
                  ? "✓"
                  : "□"}
              </i>

              Route & access

            </li>

            <li>

              <i
                className={
                  items.length
                    ? "done"
                    : ""
                }
              >
                {items.length
                  ? "✓"
                  : "□"}
              </i>

              Gear readiness

            </li>

            <li>

              <i
                className={
                  typeof cost
                    ?.totalWildBudget ===
                    "number"

                    ? "done"
                    : ""
                }
              >
                {typeof cost
                  ?.totalWildBudget ===
                  "number"

                  ? "✓"
                  : "□"}
              </i>

              Budget check

            </li>

            <li>

              <i
                className={
                  conditions
                    ? "done"
                    : ""
                }
              >
                {conditions
                  ? "✓"
                  : "□"}
              </i>

              Weather & terrain

            </li>

          </ul>

          <div
            className="
              plan-progress
            "
          >

            <span
              style={{
                width:
                  `${planProgress}%`,
              }}
            />

          </div>

          <p>

            {issues.length

              ? `${issues.length} ${
                  issues.length === 1
                    ? "thing needs"
                    : "things need"
                } attention.`

              : planning

                ? "Your plan is looking clear."

                : "Checking your plan..."}

          </p>

        </article>

        {/* ==============================================
            GEAR SYSTEM
            ============================================== */}

        <article
          className="
            overlay
            gear-overlay
          "
        >

          <small>
            GEAR SYSTEM
          </small>

          <p>

            <span>
              Essential
            </span>

            <b>
              {essential}
            </b>

          </p>

          <p>

            <span>
              Recommended
            </span>

            <b>
              {recommended}
            </b>

          </p>

          <p>

            <span>
              Optional
            </span>

            <b>
              {optional}
            </b>

          </p>

          <p>

            <span>
              Already owned
            </span>

            <b>
              {owned}
            </b>

          </p>

          <p className="gear-gap">

            <span>
              Gear gap
            </span>

            <b>
              {gap}
            </b>

          </p>

          <button
            type="button"

            onClick={() => {

              const query =
                contextQuery();

              router.push(
                query
                  ? `/ways-in/drive/gear?${query}`
                  : "/ways-in/drive/gear"
              );

            }}
          >
            OPEN GEAR ROOM →
          </button>

        </article>

      </section>

      {/* ================================================
          LEAFLET GLOBAL STYLES
          ================================================ */}

      <style jsx global>{`

        html,
        body {
          margin: 0;
          background:
            #100b07;
        }

        .leaflet-container {
          background:
            #b9ad86;

          font-family:
            Georgia,
            serif;
        }

        .journey-map-live
        .leaflet-tile-pane {
          filter:
            sepia(.48)
            saturate(.58)
            contrast(.9)
            brightness(.94);
        }

        .journey-map-live
        .leaflet-control-container {
          display:
            none;
        }

        .roamlab-map-icon {
          background:
            transparent !important;

          border:
            0 !important;
        }

        .roamlab-pin {
          display:
            block;

          width:
            14px;

          height:
            14px;

          border:
            3px solid
            rgba(
              244,
              225,
              188,
              .9
            );

          border-radius:
            50%;

          background:
            #923a29;

          box-shadow:
            0 2px 5px
            rgba(
              45,
              28,
              18,
              .45
            ),
            0 0 0 4px
            rgba(
              146,
              58,
              41,
              .2
            );
        }

        .roamlab-pin-wild {
          width:
            17px;

          height:
            17px;

          background:
            #7f2e23;
        }

      `}</style>
            {/* ================================================
          DESK + OVERLAY STYLES
          ================================================ */}

      <style jsx>{`

        button {
          font:
            inherit;
        }

        /* =================================================
           PAGE
           ================================================= */

        .wild-desk {
          min-height:
            100vh;

          overflow-x:
            hidden;

          color:
            #f2e7d4;

          background:
            #100b07;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* =================================================
           NAVIGATION
           ================================================= */

        .wild-nav {
          position:
            relative;

          z-index:
            100;

          height:
            82px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            0 5vw;

          background:
            linear-gradient(
              180deg,
              rgba(
                12,
                8,
                5,
                .98
              ),
              rgba(
                12,
                8,
                5,
                .84
              )
            );

          border-bottom:
            1px solid
            rgba(
              255,
              240,
              218,
              .1
            );
        }

        .wild-nav button {
          border:
            0;

          background:
            transparent;

          color:
            rgba(
              247,
              236,
              216,
              .74
            );

          cursor:
            pointer;
        }

        .brand {
          color:
            #fff5e5 !important;

          font-size:
            18px !important;

          font-weight:
            800 !important;

          letter-spacing:
            .22em !important;
        }

        .wild-nav nav {
          display:
            flex;

          gap:
            42px;

          align-items:
            center;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            .2em;
        }

        .wild-nav nav span {
          color:
            #e1a15f;
        }

        /* =================================================
           MASTER DESK

           IMPORTANT:
           This is the uploaded photorealistic mother image.
           The image determines the physical world.
           React only supplies changing Wild data.
           ================================================= */

        .desk-stage {
          position:
            relative;

          width:
            min(
              1536px,
              100vw
            );

          aspect-ratio:
            3 / 2;

          margin:
            0 auto;

          overflow:
            hidden;

          isolation:
            isolate;

          background:
            #1c120a;
        }

        .desk-master {
          position:
            absolute;

          z-index:
            0;

          inset:
            0;

          width:
            100%;

          height:
            100%;

          object-fit:
            cover;

          user-select:
            none;

          pointer-events:
            none;
        }

        .desk-shade {
          position:
            absolute;

          z-index:
            1;

          inset:
            0;

          pointer-events:
            none;

          background:
            radial-gradient(
              circle
              at 48% 40%,

              transparent
              0 42%,

              rgba(
                11,
                7,
                4,
                .08
              )
              70%,

              rgba(
                11,
                7,
                4,
                .28
              )
              100%
            );

          box-shadow:
            inset
            0 0 100px
            rgba(
              0,
              0,
              0,
              .25
            );
        }

        /* =================================================
           SHARED DYNAMIC OVERLAYS
           ================================================= */

        .overlay {
          position:
            absolute;

          z-index:
            30;

          color:
            #34291f;

          text-align:
            left;
        }

        .overlay small {
          color:
            #74442f;

          font-size:
            clamp(
              7px,
              .68vw,
              10px
            );

          font-weight:
            900;

          letter-spacing:
            .18em;
        }

        /* =================================================
           CURRENT WILD NOTE
           ================================================= */

        .current-wild-overlay {
          left:
            9.2%;

          top:
            13%;

          width:
            18%;

          transform:
            rotate(-3deg);

          pointer-events:
            none;
        }

        .current-wild-overlay h1 {
          margin:
            8% 0;

          font:
            400
            clamp(
              15px,
              1.55vw,
              25px
            )
            / 1.03
            Georgia,
            serif;
        }

        .current-wild-overlay p {
          margin:
            4.5% 0;

          font:
            400
            clamp(
              9px,
              .88vw,
              14px
            )
            / 1.3
            Georgia,
            serif;
        }

        /* =================================================
           DYNAMIC JOURNEY MAP

           This is no longer a CSS fake map.
           Leaflet occupies the paper surface.
           ================================================= */

        .journey-map {
          position:
            absolute;

          z-index:
            18;

          left:
            25.4%;

          top:
            15.2%;

          width:
            45.2%;

          height:
            47.8%;

          transform:
            rotate(-1.2deg);

          filter:
            drop-shadow(
              0 18px 22px
              rgba(
                0,
                0,
                0,
                .34
              )
            );
        }

        .journey-map-paper {
          position:
            relative;

          width:
            100%;

          height:
            100%;

          overflow:
            hidden;

          background:
            #c8bc91;

          clip-path:
            polygon(
              1% 1.5%,
              24% .4%,
              49% 1.3%,
              73% .5%,
              99% 1.7%,
              98.7% 98%,
              74% 99.2%,
              49% 98.3%,
              24% 99.3%,
              .5% 98%
            );
        }

        .journey-map-live {
          position:
            absolute;

          z-index:
            1;

          inset:
            0;
        }

        /* =================================================
           MAP EMPTY STATE
           ================================================= */

        .journey-map-empty {
          position:
            absolute;

          z-index:
            1;

          inset:
            0;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          padding:
            12%;

          text-align:
            center;

          color:
            #493c2c;

          background:
            linear-gradient(
              rgba(
                211,
                199,
                158,
                .72
              ),
              rgba(
                196,
                183,
                143,
                .82
              )
            ),
            repeating-linear-gradient(
              0deg,
              transparent
              0 34px,

              rgba(
                76,
                78,
                57,
                .12
              )
              35px
            );
        }

        .journey-map-empty span {
          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            .2em;
        }

        .journey-map-empty strong {
          margin-top:
            14px;

          font:
            400
            clamp(
              18px,
              2vw,
              30px
            )
            Georgia,
            serif;
        }

        .journey-map-empty p {
          max-width:
            360px;

          font:
            400 13px/1.6
            Georgia,
            serif;
        }

        /* =================================================
           OLD PAPER TREATMENT
           ================================================= */

        .paper-wash {
          position:
            absolute;

          z-index:
            3;

          inset:
            0;

          pointer-events:
            none;

          background:
            linear-gradient(
              112deg,

              rgba(
                255,
                244,
                208,
                .16
              ),

              transparent
              35%,

              rgba(
                81,
                63,
                40,
                .08
              )
              70%,

              rgba(
                235,
                216,
                169,
                .1
              )
            ),

            rgba(
              204,
              190,
              145,
              .12
            );

          box-shadow:
            inset
            0 0 45px
            rgba(
              72,
              54,
              34,
              .22
            );

          mix-blend-mode:
            multiply;
        }

        .paper-fold {
          position:
            absolute;

          z-index:
            4;

          top:
            0;

          bottom:
            0;

          width:
            1px;

          pointer-events:
            none;

          background:
            rgba(
              75,
              61,
              42,
              .18
            );

          box-shadow:
            2px 0 5px
            rgba(
              255,
              245,
              211,
              .12
            ),

            -2px 0 6px
            rgba(
              70,
              55,
              38,
              .08
            );
        }

        .fold-a {
          left:
            34%;
        }

        .fold-b {
          left:
            68%;
        }

        /* =================================================
           START / WILD MAP LABELS
           ================================================= */

        .journey-start,
        .journey-wild {
          position:
            absolute;

          z-index:
            8;

          max-width:
            29%;

          padding:
            7px 9px;

          border:
            0;

          border-radius:
            2px;

          color:
            #31261d;

          background:
            rgba(
              226,
              213,
              176,
              .82
            );

          box-shadow:
            0 4px 10px
            rgba(
              55,
              39,
              24,
              .14
            );

          cursor:
            pointer;

          text-align:
            left;

          backdrop-filter:
            blur(1px);
        }

        .journey-start {
          left:
            5%;

          bottom:
            7%;

          transform:
            rotate(-2deg);
        }

        .journey-wild {
          right:
            4%;

          top:
            7%;

          transform:
            rotate(1deg);
        }

        .journey-start small,
        .journey-wild small {
          display:
            block;

          margin-bottom:
            3px;

          color:
            #963c2a;

          font-size:
            clamp(
              6px,
              .5vw,
              8px
            );

          font-weight:
            900;

          letter-spacing:
            .18em;
        }

        .journey-start b,
        .journey-wild b {
          display:
            block;

          font:
            600
            clamp(
              8px,
              .8vw,
              13px
            )
            / 1.12
            Georgia,
            serif;
        }

        /* =================================================
           ROUTE NOTE
           ================================================= */

        .journey-distance {
          position:
            absolute;

          z-index:
            8;

          left:
            50%;

          bottom:
            5%;

          transform:
            translateX(-50%)
            rotate(-2deg);

          padding:
            5px 9px;

          white-space:
            nowrap;

          color:
            #49372a;

          background:
            rgba(
              222,
              207,
              167,
              .8
            );

          font:
            700
            clamp(
              7px,
              .72vw,
              11px
            )
            Georgia,
            serif;
        }

        .journey-edit {
          position:
            absolute;

          z-index:
            9;

          right:
            3%;

          bottom:
            3%;

          border:
            0;

          background:
            transparent;

          color:
            #8b402d;

          cursor:
            pointer;

          font-size:
            clamp(
              6px,
              .55vw,
              9px
            );

          font-weight:
            900;

          letter-spacing:
            .12em;
        }

        /* =================================================
           DESTINATION POLAROID HOT ZONE
           ================================================= */

        .destination-overlay {
          right:
            8.7%;

          top:
            25.5%;

          width:
            16%;

          padding:
            5% 1.4% 1.2%;

          border:
            0;

          background:
            transparent;

          cursor:
            pointer;

          transform:
            rotate(5deg);
        }

        .destination-overlay strong {
          display:
            block;

          margin-top:
            4%;

          font:
            italic 400
            clamp(
              10px,
              .9vw,
              15px
            )
            / 1.15
            Georgia,
            serif;
        }

        .destination-overlay span {
          display:
            block;

          margin-top:
            5%;

          color:
            #87422f;

          font-size:
            clamp(
              6px,
              .52vw,
              8px
            );

          font-weight:
            900;

          letter-spacing:
            .08em;
        }

        /* =================================================
           CONDITIONS NOTE
           ================================================= */

        .conditions-overlay {
          right:
            5.3%;

          top:
            45%;

          width:
            15.8%;

          min-height:
            13%;

          padding:
            1.2% 1.5%;

          border:
            0;

          background:
            rgba(
              207,
              182,
              100,
              .12
            );

          cursor:
            pointer;

          transform:
            rotate(1.5deg);
        }

        .conditions-overlay strong {
          display:
            block;

          margin-top:
            8%;

          font:
            400
            clamp(
              11px,
              1vw,
              16px
            )
            / 1.2
            Georgia,
            serif;
        }

        .conditions-overlay span {
          display:
            block;

          margin-top:
            9%;

          color:
            #7f412e;

          font-size:
            clamp(
              6px,
              .52vw,
              8px
            );

          font-weight:
            900;

          letter-spacing:
            .08em;
        }

        /* =================================================
           BUDGET NOTEBOOK
           ================================================= */

        .budget-overlay {
          left:
            7.5%;

          bottom:
            7.2%;

          width:
            17.2%;

          min-height:
            20%;

          padding:
            1.6% 1.7%;

          border:
            0;

          background:
            rgba(
              211,
              194,
              151,
              .08
            );

          cursor:
            pointer;

          transform:
            rotate(-2deg);
        }

        .budget-overlay > strong {
          display:
            block;

          width:
            max-content;

          margin:
            8% 0;

          padding:
            3% 5%;

          background:
            rgba(
              211,
              181,
              87,
              .78
            );

          font:
            500
            clamp(
              16px,
              1.7vw,
              27px
            )
            "Comic Sans MS",
            cursive;
        }

        .budget-overlay p {
          display:
            flex;

          justify-content:
            space-between;

          gap:
            10px;

          margin:
            5% 0;

          font:
            400
            clamp(
              8px,
              .72vw,
              11px
            )
            Georgia,
            serif;
        }

        .budget-overlay em {
          display:
            block;

          margin-top:
            8%;

          color:
            #86412d;

          font-size:
            clamp(
              6px,
              .52vw,
              8px
            );

          font-style:
            normal;

          font-weight:
            900;

          letter-spacing:
            .08em;
        }

        /* =================================================
           PLAN CHECK NOTEBOOK
           ================================================= */

        .plan-overlay {
          left:
            33.2%;

          bottom:
            4.5%;

          width:
            29%;

          height:
            20%;

          padding:
            1.5% 2%;

          transform:
            rotate(.8deg);

          pointer-events:
            none;
        }

        .plan-overlay ul {
          margin:
            6% 0 0;

          padding:
            0;

          list-style:
            none;
        }

        .plan-overlay li {
          display:
            flex;

          gap:
            8px;

          align-items:
            center;

          margin:
            3% 0;

          font:
            400
            clamp(
              8px,
              .72vw,
              12px
            )
            "Comic Sans MS",
            cursive;
        }

        .plan-overlay i {
          width:
            14px;

          font-style:
            normal;
        }

        .plan-overlay .done {
          color:
            #315340;
        }

        .plan-progress {
          position:
            absolute;

          left:
            55%;

          top:
            25%;

          width:
            37%;

          height:
            8px;

          overflow:
            hidden;

          border:
            1px solid
            rgba(
              80,
              65,
              47,
              .8
            );

          border-radius:
            999px;
        }

        .plan-progress span {
          display:
            block;

          height:
            100%;

          background:
            #6e8179;
        }

        .plan-overlay > p {
          position:
            absolute;

          left:
            55%;

          top:
            39%;

          width:
            38%;

          margin:
            0;

          font:
            italic 400
            clamp(
              8px,
              .75vw,
              12px
            )
            / 1.4
            Georgia,
            serif;
        }

        /* =================================================
           GEAR SYSTEM
           ================================================= */

        .gear-overlay {
          right:
            5%;

          bottom:
            5.7%;

          width:
            17%;

          min-height:
            22%;

          padding:
            1.4% 1.6%;

          transform:
            rotate(2.5deg);
        }

        .gear-overlay > p {
          display:
            flex;

          justify-content:
            space-between;

          margin:
            5% 0;

          padding-bottom:
            3%;

          border-bottom:
            1px solid
            rgba(
              63,
              49,
              37,
              .16
            );

          font:
            400
            clamp(
              8px,
              .75vw,
              12px
            )
            Georgia,
            serif;
        }

        .gear-overlay > p b {
          font-size:
            clamp(
              11px,
              1.1vw,
              17px
            );

          font-weight:
            400;
        }

        .gear-overlay
        .gear-gap b {
          padding:
            1px 6px;

          color:
            #8e3d2a;

          background:
            rgba(
              167,
              68,
              46,
              .16
            );
        }

        .gear-overlay button {
          width:
            100%;

          margin-top:
            5%;

          padding:
            4%;

          border:
            1px solid
            rgba(
              71,
              56,
              42,
              .72
            );

          background:
            transparent;

          color:
            #3a3025;

          cursor:
            pointer;

          font-size:
            clamp(
              6px,
              .55vw,
              9px
            );

          font-weight:
            900;

          letter-spacing:
            .08em;
        }

        /* =================================================
           RESPONSIVE
           ================================================= */

        @media (
          max-width: 900px
        ) {

          .wild-nav {
            padding:
              0 24px;
          }

          .wild-nav nav {
            gap:
              20px;
          }

          /*
            Preserve the physical desk composition.
            We crop rather than allowing all the
            objects to collapse into a SaaS stack.
          */

          .desk-stage {
            width:
              1180px;

            max-width:
              none;

            left:
              50%;

            transform:
              translateX(-50%);
          }

        }

        @media (
          max-width: 680px
        ) {

          .wild-nav {
            height:
              68px;
          }

          .brand {
            font-size:
              14px !important;
          }

          .wild-nav nav button {
            display:
              none;
          }

          .wild-nav nav {
            font-size:
              8px;
          }

          .desk-stage {
            width:
              1050px;
          }

        }

      `}</style>

    </main>
  );
}
