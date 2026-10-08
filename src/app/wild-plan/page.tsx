"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Wild } from "@/types/wild";
import {
  CURRENT_WILD_UPDATED_EVENT,
  getCurrentWild,
} from "@/lib/wildStore";

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
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
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

function money(value?: number, currency = "USD") {
  if (value === undefined || !Number.isFinite(value)) {
    return "Not set";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-US")}`;
  }
}

function dateLabel(value?: string) {
  if (!value) return "";

  const d = new Date(`${value}T12:00:00`);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
}

/* =========================================================
   JOURNEY MAP

   Physical map:
   /public/wild-plan-master.jpg

   Dynamic layer:
   - OSRM real driving route
   - start point
   - destination point
   - distance
   - driving time

   No Leaflet tiles.
   No digital map rectangle.
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
  const [routePoints, setRoutePoints] = useState<Point[]>([]);
  const [liveDistance, setLiveDistance] = useState<number>();
  const [liveHours, setLiveHours] = useState<number>();

  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const ready = isPoint(origin) && isPoint(destination);

  useEffect(() => {
    let cancelled = false;

    if (!ready) {
      setRoutePoints([]);
      setStatus("idle");
      return;
    }

    const start = origin;
    const end = destination;

    async function loadRoute() {
      setStatus("loading");

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start.longitude},${start.latitude};` +
          `${end.longitude},${end.latitude}` +
          `?overview=full&geometries=geojson&steps=false&alternatives=false`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("OSRM route failed");
        }

        const data = await response.json();
        const first = data?.routes?.[0];

        if (!first?.geometry?.coordinates?.length) {
          throw new Error("No route geometry");
        }

        const points: Point[] = first.geometry.coordinates.map(
          (p: [number, number]) => ({
            longitude: p[0],
            latitude: p[1],
          })
        );

        if (cancelled) return;

        setRoutePoints(points);

        setLiveDistance(
          typeof first.distance === "number"
            ? first.distance / 1000
            : undefined
        );

        setLiveHours(
          typeof first.duration === "number"
            ? first.duration / 3600
            : undefined
        );

        setStatus("ready");
      } catch (error) {
        console.error("Journey route failed:", error);

        if (!cancelled) {
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

  const distance = liveDistance ?? savedDistanceKm;
  const hours = liveHours ?? savedHours;

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

  const points = ready
    ? routePoints.length > 1
      ? routePoints
      : [origin, destination].filter(isPoint)
    : [];

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);

  const minLat = lats.length ? Math.min(...lats) : 0;
  const maxLat = lats.length ? Math.max(...lats) : 1;

  const minLon = lons.length ? Math.min(...lons) : 0;
  const maxLon = lons.length ? Math.max(...lons) : 1;

  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lonSpan = Math.max(maxLon - minLon, 0.0001);

  const W = 1000;
  const H = 620;

  const PX = 105;
  const PY = 88;

  const IW = W - PX * 2;
  const IH = H - PY * 2;

  const project = (p: Point) => ({
    x: PX + ((p.longitude - minLon) / lonSpan) * IW,
    y: PY + ((maxLat - p.latitude) / latSpan) * IH,
  });

  const projected = points.map(project);

  const pathD = projected
    .map(
      (p, i) =>
        `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    )
    .join(" ");

  const sp =
    ready && origin
      ? project(origin)
      : undefined;

  const ep =
    ready && destination
      ? project(destination)
      : undefined;

  return (
    <article className="journey">
      <div className="route-paper">
        {ready && (
          <svg
            className="journey-svg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {pathD && (
              <>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#e6d5b7"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity=".34"
                />

                <path
                  d={pathD}
                  fill="none"
                  stroke="#7f382c"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity=".82"
                />
              </>
            )}

            {sp && (
              <>
                <circle
                  cx={sp.x}
                  cy={sp.y}
                  r="10"
                  fill="#e7d7b5"
                />

                <circle
                  cx={sp.x}
                  cy={sp.y}
                  r="5.5"
                  fill="#93432f"
                />
              </>
            )}

            {ep && (
              <>
                <circle
                  cx={ep.x}
                  cy={ep.y}
                  r="11"
                  fill="#e7d7b5"
                />

                <circle
                  cx={ep.x}
                  cy={ep.y}
                  r="6"
                  fill="#7f2f24"
                />
              </>
            )}
          </svg>
        )}

        <button
          className="journey-hit"
          onClick={onEdit}
          aria-label={`Edit journey from ${originName} to ${destinationName}`}
        />

        <div className="route-distance">
          {status === "loading"
            ? "DRAWING ROUTE..."
            : status === "error"
              ? routeText || "ROUTE UNAVAILABLE"
              : routeText || "JOURNEY ROUTE"}
        </div>
      </div>
    </article>
  );
}

export default function WildPlanPage() {
  const router = useRouter();

  const [wild, setWild] = useState<Wild | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = () => {
      setWild(getCurrentWild());
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
      <main className="empty">
        <section>
          <small>ROAMLAB · WILD PLAN</small>

          <h1>
            Nothing on the table yet.
          </h1>

          <p>
            Choose your way in and begin
            building your next Wild.
          </p>

          <button
            onClick={() =>
              router.push("/ways-in")
            }
          >
            START YOUR WILD →
          </button>
        </section>

        <style jsx>{`
          .empty {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 30px;

            background:
              linear-gradient(
                rgba(10, 7, 4, 0.2),
                rgba(10, 7, 4, 0.6)
              ),
              url("/wild-plan-master.jpg")
                center / cover;

            color: #35291e;
          }

          section {
            width: min(560px, 90vw);
            padding: 50px;

            background:
              rgba(221, 207, 177, 0.94);

            box-shadow:
              0 30px 90px #0009;

            transform: rotate(-1deg);
          }

          small {
            font: 800 10px Arial;
            letter-spacing: 0.2em;
          }

          h1 {
            font: 400 44px Georgia;
            margin: 18px 0 12px;
          }

          p {
            font: 16px/1.6 Georgia;
          }

          button {
            margin-top: 20px;
            padding: 13px 17px;

            border: 0;

            background: #93432a;
            color: #fff1dc;

            cursor: pointer;

            font: 800 10px Arial;
            letter-spacing: 0.12em;
          }
        `}</style>
      </main>
    );
  }

  const a = wild.plan.adventure;

  const schedule = a.schedule;
  const destination = a.destination;
  const intent = a.intent;

  const route = wild.plan.route;
  const conditions = wild.plan.conditions;

  const gear = wild.plan.prepare?.gear;

  const cost = wild.plan.cost;
  const planning = wild.plan.planning;

  const items = gear?.items ?? [];

  const essential =
    items.filter(
      (x) => x.priority === "essential"
    ).length;

  const recommended =
    items.filter(
      (x) => x.priority === "recommended"
    ).length;

  const optional =
    items.filter(
      (x) => x.priority === "optional"
    ).length;

  const owned =
    items.filter(
      (x) => x.ownershipStatus === "owned"
    ).length;

  const gap =
    items.filter((x) =>
      ["to-buy", "borrow", "rent"].includes(
        x.ownershipStatus
      )
    ).length;

  const issues =
    (planning?.issues ?? []).filter(
      (x) => x.status === "open"
    );

  const currency =
    cost?.currency ?? "USD";

  const projected =
    planning?.projectedWildCost ??
    cost?.estimatedTotal;

  const remaining =
    cost?.remainingBudget ??
    (
      typeof cost?.totalWildBudget === "number" &&
      typeof projected === "number"
        ? cost.totalWildBudget - projected
        : undefined
    );

  const dateLine =
    schedule?.startDate &&
    schedule?.endDate
      ? `${dateLabel(
          schedule.startDate
        )} — ${dateLabel(
          schedule.endDate
        )}`
      : schedule?.timingMode === "flexible"
        ? "FLEXIBLE DATES"
        : schedule?.timingMode === "undecided"
          ? "DATES UNDECIDED"
          : "DATES NOT SET";

  const originName =
    intent?.startingFrom?.name ??
    "Starting point not set";

  const destinationName =
    destination?.name ??
    "Choose your destination";

  const origin =
    isPoint(
      intent?.startingFrom?.coordinates
    )
      ? intent.startingFrom.coordinates
      : undefined;

  const dest =
    isPoint(destination?.coordinates)
      ? destination.coordinates
      : undefined;

  function contextQuery() {
    const p = new URLSearchParams();

    if (a.vehicle?.type) {
      p.set(
        "vehicle",
        a.vehicle.type
      );
    }

    if (a.tripStyle) {
      p.set(
        "trip",
        a.tripStyle
      );
    }

    if (a.crew?.type) {
      p.set(
        "crew",
        a.crew.type
      );
    }

    if (a.crew?.people) {
      p.set(
        "people",
        String(a.crew.people)
      );
    }

    if (schedule?.durationType) {
      p.set(
        "duration",
        schedule.durationType
      );
    }

    return p.toString();
  }

  const readiness =
    wild.plan.readiness?.overallPercent;

  const progress =
    typeof readiness === "number"
      ? Math.max(
          0,
          Math.min(100, readiness)
        )
      : items.length
        ? 58
        : 24;

  return (
    <main className="page">
      <header>
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
              router.push("/ways-in")
            }
          >
            EXPLORE
          </button>

          <button
            onClick={() =>
              router.push("/gear")
            }
          >
            GEAR LAB
          </button>

          <span>
            WILD PLAN
          </span>
        </nav>
      </header>

      <section className="stage">
        <img
          src="/wild-plan-master.jpg"
          className="master"
          alt=""
        />

        <div className="shade" />

        <article className="current overlay">
          <small>
            CURRENT WILD
          </small>

          <h1>
            {destinationName}
          </h1>

          <p>
            {titleCase(a.wayIn)}
            {" · "}
            {tripLabel(a.tripStyle)}
          </p>

          <p>
            {a.crew?.people
              ? `${a.crew.people} ${
                  a.crew.people === 1
                    ? "Person"
                    : "People"
                }`
              : "Crew not set"}
          </p>

          <p>
            {schedule?.days
              ? `${schedule.days} Days · ${
                  schedule.nights ?? 0
                } Nights`
              : dateLine}
          </p>
        </article>

        <JourneyMap
          origin={origin}
          destination={dest}
          originName={originName}
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

        <button
          className="destination overlay"
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

        <button
          className="conditions overlay"
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
            {conditions?.weatherSummary ||
              "Weather & terrain"}
          </strong>

          <span>
            OPEN INTELLIGENCE →
          </span>
        </button>

        <button
          className="budget overlay"
          onClick={() => {
            const q =
              contextQuery();

            router.push(
              q
                ? `/ways-in/drive/budget?${q}`
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

        <article className="plan overlay">
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
                  typeof cost?.totalWildBudget ===
                  "number"
                    ? "done"
                    : ""
                }
              >
                {typeof cost?.totalWildBudget ===
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

          <div className="progress">
            <span
              style={{
                width: `${progress}%`,
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

        <article className="gear overlay">
          <small>
            GEAR SYSTEM
          </small>

          <p>
            <span>
              Essential
            </span>
            <b>{essential}</b>
          </p>

          <p>
            <span>
              Recommended
            </span>
            <b>{recommended}</b>
          </p>

          <p>
            <span>
              Optional
            </span>
            <b>{optional}</b>
          </p>

          <p>
            <span>
              Already owned
            </span>
            <b>{owned}</b>
          </p>

          <p className="gap">
            <span>
              Gear gap
            </span>
            <b>{gap}</b>
          </p>

          <button
            onClick={() => {
              const q =
                contextQuery();

              router.push(
                q
                  ? `/ways-in/drive/gear?${q}`
                  : "/ways-in/drive/gear"
              );
            }}
          >
            OPEN GEAR ROOM →
          </button>
        </article>
      </section>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          background: #100b07;
        }
      `}</style>

      <style jsx global>{`
        button {
          font: inherit;
        }

        .page {
          min-height: 100vh;
          overflow-x: hidden;
          background: #100b07;
          color: #f2e7d4;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        header {
          position: relative;
          z-index: 100;

          height: 82px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 5vw;

          background:
            linear-gradient(
              #0c0805fa,
              #0c0805d5
            );

          border-bottom:
            1px solid #fff0da18;
        }

        header button {
          border: 0;
          background: transparent;
          color: #f7ecd8bd;
          cursor: pointer;
        }

        .brand {
          color:
            #fff5e5 !important;

          font-size:
            18px !important;

          font-weight:
            800 !important;

          letter-spacing:
            0.22em !important;
        }

        nav {
          display: flex;
          gap: 42px;
          align-items: center;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        nav span {
          color: #e1a15f;
        }

        /* ==========================================
           MASTER STAGE

           IMPORTANT:
           wild-plan-master.jpg = 1672 × 941.

           This stage now uses the exact same ratio.
           From this point onward all overlay positions
           can be locked relative to the mother image.
           ========================================== */

        .stage {
          position: relative;

          width: min(
            1536px,
            100vw
          );

          aspect-ratio: 1672 / 941;

          margin: 0 auto;

          overflow: hidden;

          isolation: isolate;

          background: #1c120a;
        }

        .master {
          position: absolute;

          z-index: 0;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          pointer-events: none;
          user-select: none;
        }

        .shade {
          position: absolute;

          z-index: 1;

          inset: 0;

          pointer-events: none;

          background:
            radial-gradient(
              circle at 48% 40%,
              transparent 0 43%,
              #0b070414 72%,
              #0b07043b 100%
            );
        }

        .overlay {
          position: absolute;
          z-index: 30;
          color: #34291f;
          text-align: left;
        }

        .overlay small {
          color: #74442f;

          font-size:
            clamp(
              7px,
              0.68vw,
              10px
            );

          font-weight: 900;

          letter-spacing:
            0.18em;
        }

        .current {
          left: 9.2%;
          top: 13%;

          width: 18%;

          transform:
            rotate(-3deg);

          pointer-events: none;
        }

        .current h1 {
          margin: 8% 0;

          font:
            400
            clamp(
              15px,
              1.55vw,
              25px
            ) /
            1.03
            Georgia,
            serif;
        }

        .current p {
          margin: 4.5% 0;

          font:
            400
            clamp(
              9px,
              0.88vw,
              14px
            ) /
            1.3
            Georgia,
            serif;
        }

        /* ==========================================
           JOURNEY

           Fixed physical area.
           We will calibrate its exact coordinates
           after the corrected master ratio is visible.
           ========================================== */

        .journey {
          position: absolute;

          z-index: 18;

          left: 27.2%;
          top: 17.7%;

          width: 42.2%;
          height: 43.3%;

          transform:
            rotate(-1deg);

          pointer-events: none;
        }

        .route-paper {
          position: relative;

          width: 100%;
          height: 100%;

          overflow: hidden;

          pointer-events: none;
        }

        .journey-svg {
          position: absolute;

          z-index: 4;

          inset: 0;

          width: 100%;
          height: 100%;

          pointer-events: none;

          mix-blend-mode: multiply;

          opacity: 0.9;

          filter:
            drop-shadow(
              0
              0.5px
              0.7px
              #4a2d1b26
            );
        }

        .journey-hit {
          position: absolute;

          z-index: 7;

          inset: 4%;

          border: 0;

          background: transparent;

          cursor: pointer;

          pointer-events: auto;
        }

        .route-distance {
          position: absolute;

          z-index: 8;

          left: 50%;
          bottom: 3.2%;

          transform:
            translateX(-50%)
            rotate(-1deg);

          padding: 3px 7px;

          white-space: nowrap;

          color: #5b4030;

          background:
            rgba(
              222,
              207,
              167,
              0.58
            );

          border: 0;

          box-shadow: none;

          font:
            700
            clamp(
              6px,
              0.58vw,
              9px
            )
            Georgia,
            serif;

          letter-spacing:
            0.03em;

          pointer-events: none;
        }

        .destination {
          right: 8.7%;
          top: 25.5%;

          width: 16%;

          padding:
            5%
            1.4%
            1.2%;

          border: 0;

          background: transparent;

          cursor: pointer;

          transform:
            rotate(5deg);
        }

        .destination strong {
          display: block;

          margin-top: 4%;

          font:
            italic
            400
            clamp(
              10px,
              0.9vw,
              15px
            ) /
            1.15
            Georgia,
            serif;
        }

        .destination span,
        .conditions span {
          display: block;

          margin-top: 5%;

          color: #87422f;

          font-size:
            clamp(
              6px,
              0.52vw,
              8px
            );

          font-weight: 900;

          letter-spacing:
            0.08em;
        }

        .conditions {
          right: 5.3%;
          top: 45%;

          width: 15.8%;
          min-height: 13%;

          padding:
            1.2%
            1.5%;

          border: 0;

          background:
            #cfb6641f;

          cursor: pointer;

          transform:
            rotate(1.5deg);
        }

        .conditions strong {
          display: block;

          margin-top: 8%;

          font:
            400
            clamp(
              11px,
              1vw,
              16px
            ) /
            1.2
            Georgia,
            serif;
        }

        .budget {
          left: 7.5%;
          bottom: 7.2%;

          width: 17.2%;
          min-height: 20%;

          padding:
            1.6%
            1.7%;

          border: 0;

          background:
            #d3c29712;

          cursor: pointer;

          transform:
            rotate(-2deg);
        }

        .budget > strong {
          display: block;

          width: max-content;

          margin: 8% 0;

          padding: 3% 5%;

          background:
            #d3b557c7;

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

        .budget p {
          display: flex;

          justify-content:
            space-between;

          gap: 10px;

          margin: 5% 0;

          font:
            400
            clamp(
              8px,
              0.72vw,
              11px
            )
            Georgia,
            serif;
        }

        .budget em {
          display: block;

          margin-top: 8%;

          color: #86412d;

          font-size:
            clamp(
              6px,
              0.52vw,
              8px
            );

          font-style: normal;
          font-weight: 900;

          letter-spacing:
            0.08em;
        }

        .plan {
          left: 33.2%;
          bottom: 4.5%;

          width: 29%;
          height: 20%;

          padding:
            1.5%
            2%;

          transform:
            rotate(0.8deg);

          pointer-events: none;
        }

        .plan ul {
          margin: 6% 0 0;
          padding: 0;
          list-style: none;
        }

        .plan li {
          display: flex;
          gap: 8px;
          align-items: center;

          margin: 3% 0;

          font:
            400
            clamp(
              8px,
              0.72vw,
              12px
            )
            "Comic Sans MS",
            cursive;
        }

        .plan i {
          width: 14px;
          font-style: normal;
        }

        .plan .done {
          color: #315340;
        }

        .progress {
          position: absolute;

          left: 55%;
          top: 25%;

          width: 37%;
          height: 8px;

          overflow: hidden;

          border:
            1px solid
            #50412fcc;

          border-radius: 999px;
        }

        .progress span {
          display: block;

          height: 100%;

          background: #6e8179;
        }

        .plan > p {
          position: absolute;

          left: 55%;
          top: 39%;

          width: 38%;

          margin: 0;

          font:
            italic
            400
            clamp(
              8px,
              0.75vw,
              12px
            ) /
            1.4
            Georgia,
            serif;
        }

        .gear {
          right: 5%;
          bottom: 5.7%;

          width: 17%;
          min-height: 22%;

          padding:
            1.4%
            1.6%;

          transform:
            rotate(2.5deg);
        }

        .gear > p {
          display: flex;

          justify-content:
            space-between;

          margin: 5% 0;

          padding-bottom: 3%;

          border-bottom:
            1px solid
            #3f31252a;

          font:
            400
            clamp(
              8px,
              0.75vw,
              12px
            )
            Georgia,
            serif;
        }

        .gear > p b {
          font-size:
            clamp(
              11px,
              1.1vw,
              17px
            );

          font-weight: 400;
        }

        .gap b {
          padding: 1px 6px;

          color: #8e3d2a;

          background: #a7442e29;
        }

        .gear button {
          width: 100%;

          margin-top: 5%;

          padding: 4%;

          border:
            1px solid
            #47382ab8;

          background: transparent;

          color: #3a3025;

          cursor: pointer;

          font-size:
            clamp(
              6px,
              0.55vw,
              9px
            );

          font-weight: 900;

          letter-spacing:
            0.08em;
        }

        @media (max-width: 900px) {
          header {
            padding: 0 24px;
          }

          nav {
            gap: 20px;
          }

          .stage {
            width: 1180px;
            max-width: none;

            left: 50%;

            transform:
              translateX(-50%);
          }
        }

        @media (max-width: 680px) {
          header {
            height: 68px;
          }

          .brand {
            font-size:
              14px !important;
          }

          nav button {
            display: none;
          }

          nav {
            font-size: 8px;
          }

          .stage {
            width: 1050px;
          }
        }
      `}</style>
    </main>
  );
}
