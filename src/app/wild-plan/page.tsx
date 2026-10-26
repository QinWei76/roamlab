"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Wild } from "@/types/wild";

import {
  CURRENT_WILD_UPDATED_EVENT,
  getCurrentWild,
} from "@/lib/wildStore";


/* =====================================================
   TYPES
   ===================================================== */

type Point = {
  latitude: number;
  longitude: number;
};


/* =====================================================
   HELPERS
   ===================================================== */

function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") {
    return false;
  }

  const point = value as Partial<Point>;

  return (
    typeof point.latitude === "number" &&
    Number.isFinite(point.latitude) &&
    typeof point.longitude === "number" &&
    Number.isFinite(point.longitude)
  );
}


function titleCase(value?: string) {
  if (!value) {
    return "Not set";
  }

  return value
    .split("-")
    .map(
      (item) =>
        item.charAt(0).toUpperCase() +
        item.slice(1)
    )
    .join(" ");
}


function money(
  value?: number,
  currency = "USD"
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "NOT SET";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }
  ).format(value);
}


function tripStyleLabel(value?: string) {
  const map: Record<string, string> = {
    weekend: "Weekend Escape",
    basecamp: "Basecamp",
    remote: "Remote",
    "road-trip": "Road Trip",
    roadtrip: "Road Trip",
  };

  return value
    ? map[value] ?? titleCase(value)
    : "STYLE NOT SET";
}


/* =====================================================
   JOURNEY MAP
   ===================================================== */

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
  const [routePoints, setRoutePoints] =
    useState<Point[]>([]);

  const [liveDistance, setLiveDistance] =
    useState<number>();

  const [liveHours, setLiveHours] =
    useState<number>();

  const [status, setStatus] =
    useState<
      "idle" |
      "loading" |
      "ready" |
      "error"
    >("idle");


  const ready =
    isPoint(origin) &&
    isPoint(destination);


  useEffect(() => {
    let cancelled = false;

    if (
      !isPoint(origin) ||
      !isPoint(destination)
    ) {
      setRoutePoints([]);
      setLiveDistance(undefined);
      setLiveHours(undefined);
      setStatus("idle");

      return () => {
        cancelled = true;
      };
    }

    const start = origin;
    const end = destination;

    async function loadRoute() {
      setStatus("loading");
      setRoutePoints([]);
      setLiveDistance(undefined);
      setLiveHours(undefined);

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start.longitude},${start.latitude};` +
          `${end.longitude},${end.latitude}` +
          `?overview=full&geometries=geojson`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Route request failed"
          );
        }

        const data =
          await response.json();

        const route =
          data?.routes?.[0];

        if (
          !route ||
          !Array.isArray(
            route?.geometry?.coordinates
          )
        ) {
          throw new Error(
            "Route geometry unavailable"
          );
        }

        const points: Point[] = [];

        for (
          const coordinate of
          route.geometry.coordinates
        ) {
          if (
            Array.isArray(coordinate) &&
            coordinate.length >= 2 &&
            typeof coordinate[0] === "number" &&
            typeof coordinate[1] === "number" &&
            Number.isFinite(coordinate[0]) &&
            Number.isFinite(coordinate[1])
          ) {
            points.push({
              longitude: coordinate[0],
              latitude: coordinate[1],
            });
          }
        }

        if (points.length < 2) {
          throw new Error(
            "Invalid route geometry"
          );
        }

        if (cancelled) {
          return;
        }

        setRoutePoints(points);

        setLiveDistance(
          typeof route.distance === "number"
            ? route.distance / 1000
            : undefined
        );

        setLiveHours(
          typeof route.duration === "number"
            ? route.duration / 3600
            : undefined
        );

        setStatus("ready");
      } catch (error) {
        console.error(
          "Wild Plan route error:",
          error
        );

        if (!cancelled) {
          setRoutePoints([]);
          setLiveDistance(undefined);
          setLiveHours(undefined);
          setStatus("error");
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
  ]);


  const distance =
    liveDistance ??
    savedDistanceKm;

  const hours =
    liveHours ??
    savedHours;

  const routeText = [
    typeof distance === "number"
      ? `${Math.round(distance)} KM`
      : "",
    typeof hours === "number"
      ? `${hours.toFixed(1)} HRS`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");


  const points =
    ready &&
    routePoints.length > 1
      ? routePoints
      : [];


  const latitudes =
    points.map(
      (point) => point.latitude
    );

  const longitudes =
    points.map(
      (point) => point.longitude
    );


  const minLat =
    latitudes.length
      ? Math.min(...latitudes)
      : 0;

  const maxLat =
    latitudes.length
      ? Math.max(...latitudes)
      : 1;

  const minLon =
    longitudes.length
      ? Math.min(...longitudes)
      : 0;

  const maxLon =
    longitudes.length
      ? Math.max(...longitudes)
      : 1;


  const latSpan =
    Math.max(
      maxLat - minLat,
      0.0001
    );

  const lonSpan =
    Math.max(
      maxLon - minLon,
      0.0001
    );


  const VIEW_W = 1000;
  const VIEW_H = 620;

  /*
    Route safe area.

    The right side is deliberately reserved
    so the route does not run underneath the
    destination Polaroid.
  */

  const SAFE_LEFT = 150;
  const SAFE_RIGHT = 245;
  const SAFE_TOP = 120;
  const SAFE_BOTTOM = 120;

  const mapWidth =
    VIEW_W -
    SAFE_LEFT -
    SAFE_RIGHT;

  const mapHeight =
    VIEW_H -
    SAFE_TOP -
    SAFE_BOTTOM;

  const scale =
    Math.min(
      mapWidth / lonSpan,
      mapHeight / latSpan
    );

  const routeWidth =
    lonSpan * scale;

  const routeHeight =
    latSpan * scale;

  const offsetX =
    SAFE_LEFT +
    (mapWidth - routeWidth) / 2;

  const offsetY =
    SAFE_TOP +
    (mapHeight - routeHeight) / 2;


  function project(point: Point) {
    return {
      x:
        offsetX +
        (
          point.longitude -
          minLon
        ) *
          scale,

      y:
        offsetY +
        (
          maxLat -
          point.latitude
        ) *
          scale,
    };
  }


  const projected =
    points.map(project);

  const pathD =
    projected
      .map(
        (point, index) =>
          `${
            index === 0 ? "M" : "L"
          } ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
      )
      .join(" ");

  const start =
    projected[0];

  const end =
    projected[
      projected.length - 1
    ];


  return (
    <article className="journey">
      <div className="route-paper">
        {pathD && (
          <svg
            className="journey-svg"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d={pathD}
              fill="none"
              stroke="#ead9ba"
              strokeWidth="9"
              opacity=".35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d={pathD}
              fill="none"
              stroke="#82392c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {start && (
              <circle
                cx={start.x}
                cy={start.y}
                r="8"
                fill="#9a4933"
              />
            )}

            {end && (
              <circle
                cx={end.x}
                cy={end.y}
                r="9"
                fill="#7d3025"
              />
            )}
          </svg>
        )}

        <button
          type="button"
          className="journey-hit"
          onClick={onEdit}
          aria-label={
            `Edit journey from ${originName} to ${destinationName}`
          }
        />

        <div className="route-distance">
          {!ready
            ? "SET ROUTE"
            : status === "loading"
              ? "DRAWING..."
              : status === "error"
                ? "ROUTE UNAVAILABLE"
                : routeText ||
                  "JOURNEY"}
        </div>
      </div>
    </article>
  );
}


/* =====================================================
   WILD PLAN PAGE
   ===================================================== */

export default function WildPlanPage() {
  const router =
    useRouter();

  const [wild, setWild] =
    useState<Wild | null>(null);

  const [loaded, setLoaded] =
    useState(false);


  useEffect(() => {
    function loadWild() {
      const current =
        getCurrentWild();

      setWild(current);
      setLoaded(true);
    }

    loadWild();

    window.addEventListener(
      CURRENT_WILD_UPDATED_EVENT,
      loadWild
    );

    window.addEventListener(
      "storage",
      loadWild
    );

    return () => {
      window.removeEventListener(
        CURRENT_WILD_UPDATED_EVENT,
        loadWild
      );

      window.removeEventListener(
        "storage",
        loadWild
      );
    };
  }, []);


  if (!loaded) {
    return null;
  }


  if (!wild || !wild.plan || !wild.plan.adventure) {
    return (
      <main className="empty-state">
        <div className="empty-inner">
          <h1>
            No Wild Plan Yet
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/ways-in"
              )
            }
          >
            START YOUR WILD →
          </button>
        </div>

        <style jsx>{`
          .empty-state {
            min-height: 100vh;
            display: grid;
            place-items: center;
            margin: 0;
            padding: 0;
            background: #100b07;
            color: #f4e5cf;
            text-align: center;
          }

          .empty-inner h1 {
            margin: 0 0 24px;
            font-family: Georgia, serif;
            font-weight: 400;
          }

          .empty-inner button {
            padding: 12px 20px;
            border: 0;
            background: #874631;
            color: white;
            cursor: pointer;
            font-weight: 800;
            letter-spacing: 0.08em;
          }
        `}</style>
      </main>
    );
  }


  const adventure =
    wild.plan.adventure;

  const destination =
    adventure.destination;

  const intent =
    adventure.intent;

  const schedule =
    adventure.schedule;

  const route =
    wild.plan.route;

  const conditions =
    wild.plan.conditions;

  const cost =
    wild.plan.cost;

  const gear =
    wild.plan.prepare?.gear;

  const items =
    gear?.items ?? [];


  const origin =
    isPoint(
      intent?.startingFrom?.coordinates
    )
      ? intent.startingFrom.coordinates
      : undefined;

  const destinationPoint =
    isPoint(
      destination?.coordinates
    )
      ? destination.coordinates
      : undefined;


  const budget =
    cost?.totalWildBudget;

  const projected =
    cost?.estimatedTotal;

  const remaining =
    typeof cost?.remainingBudget ===
    "number"
      ? cost.remainingBudget
      : typeof budget === "number" &&
          typeof projected === "number"
        ? budget - projected
        : undefined;

  const currency =
    "USD";


  const people =
    adventure.crew?.people
      ? `${adventure.crew.people} PEOPLE`
      : "CREW NOT SET";

  const duration =
    schedule?.days
      ? `${schedule.days} DAYS · ${
          schedule.nights ?? 0
        } NIGHTS`
      : "DURATION NOT SET";

  const vehicle =
    adventure.vehicle?.type
      ? titleCase(
          adventure.vehicle.type
        )
      : "VEHICLE NOT SET";

  const style =
    adventure.tripStyle
      ? tripStyleLabel(
          adventure.tripStyle
        )
      : "STYLE NOT SET";

  const wayIn =
    adventure.wayIn
      ? titleCase(
          adventure.wayIn
        )
      : "WAY IN NOT SET";


  const essentialCount =
    items.filter(
      (item) =>
        item.priority ===
        "essential"
    ).length;

  const recommendedCount =
    items.filter(
      (item) =>
        item.priority ===
        "recommended"
    ).length;


  return (
    <main className="wild-page">
      {/* =================================================
          SINGLE MASTER STAGE

          Mother image = physical world
          React       = dynamic information
          SVG         = real route
          ================================================= */}

      <section className="wild-stage">
        <img
          src="/wild-plan-master.jpg"
          className="wild-master"
          alt=""
        />


        {/* =================================================
            FLOATING NAV

            Absolute. It does NOT push the mother image down.
            ================================================= */}

        <header className="wild-nav">
          <button
            type="button"
            className="wild-logo"
            onClick={() =>
              router.push("/")
            }
          >
            ROAMLAB
          </button>

          <nav>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/ways-in"
                )
              }
            >
              EXPLORE
            </button>

            <button
              type="button"
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


        {/* =================================================
            A — CURRENT WILD
            ================================================= */}

         <article className="current-card">
  <strong className="current-title">
    YOUR NEXT WILD
  </strong>

  <span className="current-location">
    {destination?.name ?? "DESTINATION NOT SET"}
  </span>

  <span className="current-drive">
    {[
      adventure.wayIn
        ? titleCase(adventure.wayIn)
        : null,

      adventure.vehicle?.type
        ? titleCase(adventure.vehicle.type)
        : null,

      adventure.tripStyle
        ? tripStyleLabel(adventure.tripStyle)
        : null,
    ]
      .filter(Boolean)
      .join(" · ") || "TRAVEL SETUP NOT SET"}
  </span>

  <span className="current-crew">
    {people}
  </span>

  <span className="current-duration">
    {duration}
  </span>
</article>


{/* =================================================
    B — JOURNEY
    ================================================= */}

        {/* =================================================
            B — JOURNEY
            ================================================= */}

        <JourneyMap
          origin={origin}
          destination={
            destinationPoint
          }
          originName={
            intent?.startingFrom?.name ??
            "START"
          }
          destinationName={
            destination?.name ??
            "DESTINATION"
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


        {/* =================================================
            C — DESTINATION POLAROID
            ================================================= */}

        <button
          type="button"
          className="destination-note"
          onClick={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        >
          <strong>
            {destination?.name ??
              "DESTINATION"}
          </strong>

          <small>
            OPEN →
          </small>
        </button>


        {/* =================================================
            D — CONDITIONS
            ================================================= */}

        <button
          type="button"
          className="conditions-note"
          onClick={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        >
          <span>
            CONDITIONS
          </span>

          <span>
            WEATHER
          </span>

          <span>
            TERRAIN
          </span>

          <small>
            INTELLIGENCE →
          </small>
        </button>


        {/* =================================================
            F — BUDGET
            ================================================= */}

        <button
          type="button"
          className="budget-note"
          onClick={() =>
            router.push(
              "/ways-in/drive/budget"
            )
          }
        >
          <strong>
            {money(
              budget,
              currency
            )}
          </strong>

          <span className="budget-projected">
            {money(
              projected,
              currency
            )}
          </span>

          <span className="budget-remaining">
            {money(
              remaining,
              currency
            )}
          </span>
        </button>


        {/* =================================================
            G — PLAN CHECK
            ================================================= */}

        <article className="plan-note">
          <span className="plan-route">
            {route ? "✓" : "□"} Route
          </span>

          <span className="plan-gear">
            {items.length
              ? "✓"
              : "□"}{" "}
            Gear
          </span>

          <span className="plan-budget">
            {typeof budget === "number"
              ? "✓"
              : "□"}{" "}
            Budget
          </span>

          <span className="plan-conditions">
            {conditions
              ? "✓"
              : "□"}{" "}
            Conditions
          </span>
        </article>


        {/* =================================================
            E — GEAR SYSTEM
            ================================================= */}

        <article className="gear-note">
          <span className="gear-essential">
            Essential:{" "}
            {essentialCount}
          </span>

          <span className="gear-recommended">
            Recommended:{" "}
            {recommendedCount}
          </span>

          <span className="gear-total">
            Total: {items.length}
          </span>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/gear"
              )
            }
          >
            OPEN GEAR ROOM →
          </button>
        </article>
      </section>


      <style jsx>{`
        /* =====================================================
           PAGE

           No page padding.
           No separate header row.
           No centered max-width container.
           ===================================================== */

        .wild-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: #090704;
        }


        /* =====================================================
           MASTER STAGE

           Everything uses this exact coordinate system.
           ===================================================== */

        
.wild-stage {
  position: relative;
  width: 100%;
  max-width: none;
  aspect-ratio: 1672 / 941;
  margin: 0;
  padding: 0;
  overflow: hidden;
  isolation: isolate;
  background: #181009;
}

.wild-master {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  object-fit: cover;
  object-position: center center;
  pointer-events: none;
  user-select: none;
}


        /* =====================================================
           NAV

           Transparent overlay.
           It occupies ZERO layout height.
           ===================================================== */

        .wild-nav {
          position: absolute;

          z-index: 100;

          top: 0;
          left: 0;

          width: 100%;
          height: 8.5%;

          box-sizing: border-box;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 5.5%;

          background: transparent;

          pointer-events: none;
        }


        .wild-logo,
        .wild-nav nav {
          pointer-events: auto;
        }


        .wild-logo {
          margin: 0;
          padding: 0;

          border: 0;
          background: transparent;

          color: #fff2df;

          cursor: pointer;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              13px,
              1.15vw,
              20px
            );

          font-weight: 900;

          letter-spacing: 0.22em;

          text-shadow:
            0 2px 8px rgba(
              0,
              0,
              0,
              0.9
            );
        }


        .wild-nav nav {
          display: flex;
          align-items: center;

          gap:
            clamp(
              18px,
              2.5vw,
              42px
            );

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              7px,
              0.68vw,
              11px
            );

          font-weight: 900;

          letter-spacing: 0.18em;
        }


        .wild-nav nav button {
          margin: 0;
          padding: 0;

          border: 0;
          background: transparent;

          color: #f7ead7;

          cursor: pointer;

          font: inherit;

          letter-spacing: inherit;

          text-shadow:
            0 2px 8px
            rgba(
              0,
              0,
              0,
              0.95
            );
        }


        .wild-nav nav span {
          color: #e7b276;

          text-shadow:
            0 2px 8px
            rgba(
              0,
              0,
              0,
              0.95
            );
        }


        /* =====================================================
           CURRENT WILD

           Every line is fixed.
           No document-flow positioning.
           ===================================================== */

        
/* =====================================================
   CURRENT WILD

   Fixed to the physical Current Wild paper.
   ===================================================== */

.current-card {
  position: absolute;
  z-index: 30;

  /*
   * Locked to the physical CURRENT WILD sheet.
   */
  left: 9.2%;
  top: 17.2%;

  width: 18%;
  height: 27%;

  transform: rotate(-2deg);

  color: #3d3025;
  pointer-events: none;
}

.current-card strong,
.current-card span {
  position: absolute;
  display: block;

  box-sizing: border-box;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}


/* =====================================================
   TITLE
   ===================================================== */

.current-title {
  top: 5%;
  left: 5%;

  width: 90%;

  color: #563527;

  font-family:
    Georgia,
    serif;

  font-size:
    clamp(
      9px,
      0.88vw,
      15px
    );

  font-style: italic;
  font-weight: 700;

  line-height: 1.1;
}


/* =====================================================
   ROW 1 — DESTINATION

   Physical row beside the map-pin icon.
   ===================================================== */

.current-location {
  top: 32%;
  left: 30%;

  width: 57%;

  color: #44342a;

  font-family:
    "Comic Sans MS",
    "Bradley Hand",
    cursive;

  font-size:
    clamp(
      6px,
      0.56vw,
      9px
    );

  font-weight: 700;

  line-height: 1.1;
}


/* =====================================================
   ROW 2 — WAY IN · VEHICLE · STYLE

   Physical row beside the vehicle icon.
   ===================================================== */

.current-drive {
  top: 51%;
  left: 30%;

  width: 57%;

  color: #44342a;

  font-family:
    "Comic Sans MS",
    "Bradley Hand",
    cursive;

  font-size:
    clamp(
      5px,
      0.50vw,
      8px
    );

  font-weight: 700;

  line-height: 1.1;
}


/* Crew is secondary information inside row 2. */

.current-crew {
  top: 59%;
  left: 30%;

  width: 57%;

  color: rgba(
    68,
    52,
    42,
    0.72
  );

  font-family:
    "Comic Sans MS",
    "Bradley Hand",
    cursive;

  font-size:
    clamp(
      5px,
      0.43vw,
      7px
    );

  font-weight: 700;

  line-height: 1.1;
}


/* =====================================================
   ROW 3 — DURATION

   Physical row beside the calendar icon.
   ===================================================== */

.current-duration {
  top: 76%;
  left: 30%;

  width: 57%;

  color: #44342a;

  font-family:
    "Comic Sans MS",
    "Bradley Hand",
    cursive;

  font-size:
    clamp(
      6px,
      0.56vw,
      9px
    );

  font-weight: 700;

  line-height: 1.1;
}
/* =====================================================
   JOURNEY

   Restricted to the physical map.
   Right edge deliberately stops before Polaroid.
   ===================================================== */


        /* =====================================================
           JOURNEY

           Restricted to the physical map.
           Right edge deliberately stops before Polaroid.
           ===================================================== */

        .journey {
  position: absolute;
  z-index: 20;
  left: 25.5%;
  top: 24%;
  width: 42%;
  height: 37%;
  transform: none;
  pointer-events: none;
}

.route-paper {
  position: relative;
  width: 100%;
  height: 100%;
}

.journey-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  clip-path: inset(0 27% 0 0);
  filter: drop-shadow(0 1px 1px rgba(255, 240, 215, 0.25));
}
        .journey-hit {
          position: absolute;

          inset: 0;

          z-index: 3;

          border: 0;

          background: transparent;

          cursor: pointer;

          pointer-events: auto;
        }


        .route-distance {
          position: absolute;

          z-index: 4;

          left: 46%;
          bottom: 1%;

          transform:
            translateX(-50%);

          padding:
            3px 8px;

          background:
            rgba(
              232,
              210,
              169,
              0.72
            );

          color: #573b2d;

          box-shadow:
            0 2px 4px
            rgba(
              0,
              0,
              0,
              0.15
            );

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              6px,
              0.52vw,
              9px
            );

          font-weight: 900;

          letter-spacing: 0.08em;

          white-space: nowrap;

          pointer-events: none;
        }


        /* =====================================================
           DESTINATION POLAROID
           ===================================================== */

        .destination-note {
          position: absolute;

          z-index: 40;

          left: 59.8%;
          top: 34.2%;

          width: 14.8%;
          height: 7%;

          margin: 0;
          padding: 0;

          border: 0;

          background: transparent;

          cursor: pointer;

          transform:
            rotate(3.5deg);

          color: #49352a;

          text-align: center;
        }


        .destination-note strong {
          display: block;

          width: 100%;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(
              7px,
              0.66vw,
              11px
            );

          font-style: italic;
        }


        .destination-note small {
          display: block;

          margin-top: 4%;

          color: #8a4934;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              5px,
              0.42vw,
              7px
            );

          font-weight: 900;

          letter-spacing: 0.08em;
        }


        /* =====================================================
           CONDITIONS
           ===================================================== */

        .conditions-note {
          position: absolute;

          z-index: 40;

          right: 6.4%;
          top: 46.2%;

          width: 15.2%;
          height: 16%;

          margin: 0;
          padding: 0;

          border: 0;

          background: transparent;

          cursor: pointer;

          transform:
            rotate(1.5deg);

          color: #45362b;

          text-align: left;
        }


        .conditions-note span,
        .conditions-note small {
          position: absolute;

          left: 28%;

          width: 67%;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;
        }


        .conditions-note span {
          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size:
            clamp(
              6px,
              0.57vw,
              10px
            );

          font-weight: 700;
        }


        .conditions-note span:nth-of-type(1) {
          top: 24%;
        }


        .conditions-note span:nth-of-type(2) {
          top: 45%;
        }


        .conditions-note span:nth-of-type(3) {
          top: 64%;
        }


        .conditions-note small {
          bottom: 4%;

          color: #874631;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              5px,
              0.42vw,
              7px
            );

          font-weight: 900;

          letter-spacing: 0.07em;
        }


        /* =====================================================
           BUDGET
           ===================================================== */

        .budget-note {
          position: absolute;

          z-index: 40;

          left: 7.3%;
          bottom: 6%;

          width: 17.5%;
          height: 21.5%;

          margin: 0;
          padding: 0;

          border: 0;

          background: transparent;

          cursor: pointer;

          transform:
            rotate(-1.8deg);

          color: #423226;
        }


        .budget-note strong,
        .budget-note span {
          position: absolute;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;
        }


        .budget-note strong {
          left: 25%;
          top: 24%;

          width: 63%;

          text-align: center;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size:
            clamp(
              11px,
              1.15vw,
              20px
            );

          font-weight: 700;
        }


        .budget-note span {
          right: 10%;

          width: 50%;

          text-align: right;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(
              6px,
              0.54vw,
              9px
            );
        }


        .budget-projected {
          top: 55%;
        }


        .budget-remaining {
          top: 72%;
        }


        /* =====================================================
           PLAN CHECK
           ===================================================== */

        .plan-note {
          position: absolute;

          z-index: 40;

          left: 33%;
          bottom: 5%;

          width: 29.5%;
          height: 20.5%;

          transform:
            rotate(0.5deg);

          color: #423429;

          pointer-events: none;
        }


        .plan-note span {
          position: absolute;

          left: 12%;

          width: 78%;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size:
            clamp(
              6px,
              0.62vw,
              11px
            );

          font-weight: 700;
        }


        .plan-route {
          top: 27%;
        }


        .plan-gear {
          top: 44%;
        }


        .plan-budget {
          top: 61%;
        }


        .plan-conditions {
          top: 78%;
        }


        /* =====================================================
           GEAR
           ===================================================== */

        .gear-note {
          position: absolute;

          z-index: 40;

          right: 5.1%;
          bottom: 5.5%;

          width: 17.2%;
          height: 22%;

          transform:
            rotate(2deg);

          color: #423429;
        }


        .gear-note span {
          position: absolute;

          left: 30%;

          width: 65%;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size:
            clamp(
              6px,
              0.58vw,
              10px
            );

          font-weight: 700;
        }


        .gear-essential {
          top: 32%;
        }


        .gear-recommended {
          top: 49%;
        }


        .gear-total {
          top: 66%;
        }


        .gear-note button {
          position: absolute;

          left: 25%;
          bottom: 3%;

          width: 68%;

          margin: 0;
          padding: 0;

          border: 0;

          background: transparent;

          color: #874631;

          cursor: pointer;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              5px,
              0.42vw,
              7px
            );

          font-weight: 900;

          letter-spacing: 0.08em;
        }


        /* =====================================================
           RESPONSIVE

           Same mother-image coordinate system.
           We scale the whole composition rather than
           rearranging individual physical objects.
           ===================================================== */

        @media (max-width: 900px) {
          .wild-stage {
            width: 1180px;
            max-width: none;

            margin-left: 50%;

            transform:
              translateX(-50%);
          }

          .wild-nav {
            padding:
              0 48px;
          }
        }


        @media (max-width: 680px) {
          .wild-stage {
            width: 1050px;
          }

          .wild-nav {
            padding:
              0 40px;
          }

          .wild-nav nav button {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
