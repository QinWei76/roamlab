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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function tripLabel(value?: string) {
  const labels: Record<string, string> = {
    weekend: "Weekend Escape",
    "road-trip": "Road Trip",
    basecamp: "Basecamp",
    remote: "Remote / Off-Grid",
  };

  return value ? labels[value] ?? titleCase(value) : "Trip style not set";
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
  const [liveDistance, setLiveDistance] = useState<number | undefined>();
  const [liveHours, setLiveHours] = useState<number | undefined>();
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const ready = isPoint(origin) && isPoint(destination);

  useEffect(() => {
    let cancelled = false;

    if (!isPoint(origin) || !isPoint(destination)) {
      setRoutePoints([]);
      setLiveDistance(undefined);
      setLiveHours(undefined);
      setStatus("idle");

      return () => {
        cancelled = true;
      };
    }

    const start: Point = origin;
    const end: Point = destination;

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

        const points: Point[] = first.geometry.coordinates
          .map((p: unknown) => {
            if (
              !Array.isArray(p) ||
              p.length < 2 ||
              typeof p[0] !== "number" ||
              typeof p[1] !== "number" ||
              !Number.isFinite(p[0]) ||
              !Number.isFinite(p[1])
            ) {
              return null;
            }

            return {
              longitude: p[0],
              latitude: p[1],
            };
          })
          .filter((p: Point | null): p is Point => p !== null);

        if (points.length < 2) {
          throw new Error("Route geometry is invalid");
        }

        if (cancelled) return;

        setRoutePoints(points);

        setLiveDistance(
          typeof first.distance === "number" && Number.isFinite(first.distance)
            ? first.distance / 1000
            : undefined
        );

        setLiveHours(
          typeof first.duration === "number" && Number.isFinite(first.duration)
            ? first.duration / 3600
            : undefined
        );

        setStatus("ready");
      } catch (error) {
        console.error("Journey route failed:", error);

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

  const distance = liveDistance ?? savedDistanceKm;
  const hours = liveHours ?? savedHours;

  const routeText = [
    typeof distance === "number" && Number.isFinite(distance)
      ? `${Math.round(distance)} KM`
      : "",
    typeof hours === "number" && Number.isFinite(hours)
      ? `${hours.toFixed(1)} HRS`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const points = ready && routePoints.length > 1 ? routePoints : [];

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);

  const minLat = lats.length > 0 ? Math.min(...lats) : 0;
  const maxLat = lats.length > 0 ? Math.max(...lats) : 1;
  const minLon = lons.length > 0 ? Math.min(...lons) : 0;
  const maxLon = lons.length > 0 ? Math.max(...lons) : 1;

  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lonSpan = Math.max(maxLon - minLon, 0.0001);

  const W = 1000;
  const H = 620;

  const SAFE_LEFT = 145;
  const SAFE_RIGHT = 175;
  const SAFE_TOP = 145;
  const SAFE_BOTTOM = 120;

  const safeWidth = W - SAFE_LEFT - SAFE_RIGHT;
  const safeHeight = H - SAFE_TOP - SAFE_BOTTOM;

  const xScale = safeWidth / lonSpan;
  const yScale = safeHeight / latSpan;
  const scale = Math.min(xScale, yScale);

  const renderedWidth = lonSpan * scale;
  const renderedHeight = latSpan * scale;

  const offsetX = SAFE_LEFT + (safeWidth - renderedWidth) / 2 - 18;
  const offsetY = SAFE_TOP + (safeHeight - renderedHeight) / 2 + 10;

  function project(p: Point) {
    return {
      x: offsetX + (p.longitude - minLon) * scale,
      y: offsetY + (maxLat - p.latitude) * scale,
    };
  }

  const projected = points.map(project);

  const pathD = projected
    .map((p, index) => {
      const command = index === 0 ? "M" : "L";

      return `${command} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");

  const startProjected =
    projected.length > 1 ? projected[0] : undefined;

  const endProjected =
    projected.length > 1 ? projected[projected.length - 1] : undefined;

  return (
    <article className="journey">
      <div className="route-paper">
        {ready && routePoints.length > 1 && pathD && (
          <svg
            className="journey-svg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <path
              d={pathD}
              fill="none"
              stroke="#e7d7b8"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".32"
            />

            <path
              d={pathD}
              fill="none"
              stroke="#80382b"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".82"
            />

            {startProjected && (
              <>
                <circle
                  cx={startProjected.x}
                  cy={startProjected.y}
                  r="10"
                  fill="#e7d7b5"
                />

                <circle
                  cx={startProjected.x}
                  cy={startProjected.y}
                  r="5.5"
                  fill="#93432f"
                />

                <text
                  x={startProjected.x + 14}
                  y={startProjected.y + 4}
                  className="route-marker-text"
                >
                  START
                </text>
              </>
            )}

            {endProjected && (
              <>
                <circle
                  cx={endProjected.x}
                  cy={endProjected.y}
                  r="11"
                  fill="#e7d7b5"
                />

                <circle
                  cx={endProjected.x}
                  cy={endProjected.y}
                  r="6"
                  fill="#7f2f24"
                />

                <text
                  x={endProjected.x - 14}
                  y={endProjected.y - 14}
                  textAnchor="end"
                  className="route-marker-text route-marker-wild"
                >
                  WILD
                </text>
              </>
            )}
          </svg>
        )}

        <button
          type="button"
          className="journey-hit"
          onClick={onEdit}
          aria-label={`Edit journey from ${originName} to ${destinationName}`}
        />

        <div className="route-distance">
          {!ready
            ? "SET START + DESTINATION"
            : status === "loading"
              ? "DRAWING ROUTE..."
              : status === "error"
                ? "ROUTE UNAVAILABLE"
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

    window.addEventListener(CURRENT_WILD_UPDATED_EVENT, load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener(CURRENT_WILD_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
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

          <h1>Nothing on the table yet.</h1>

          <p>
            Choose your way in and begin building your next Wild.
          </p>

          <button onClick={() => router.push("/ways-in")}>
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
              url("/wild-plan-master.jpg") center / cover;
            color: #35291e;
          }

          section {
            width: min(560px, 90vw);
            padding: 50px;
            background: rgba(221, 207, 177, 0.94);
            box-shadow: 0 30px 90px #0009;
            transform: rotate(-1deg);
          }

          small {
            font: 800 10px Arial;
            letter-spacing: 0.2em;
          }

          h1 {
            margin: 18px 0 12px;
            font: 400 44px Georgia, serif;
          }

          p {
            font: 16px/1.6 Georgia, serif;
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

  const adventure = wild.plan.adventure;
  const schedule = adventure.schedule;
  const destination = adventure.destination;
  const intent = adventure.intent;
  const route = wild.plan.route;
  const conditions = wild.plan.conditions;
  const gear = wild.plan.prepare?.gear;
  const cost = wild.plan.cost;
  const planning = wild.plan.planning;

  const items = gear?.items ?? [];

  const essential = items.filter(
    (item) => item.priority === "essential"
  ).length;

  const recommended = items.filter(
    (item) => item.priority === "recommended"
  ).length;

  const optional = items.filter(
    (item) => item.priority === "optional"
  ).length;

  const owned = items.filter(
    (item) => item.ownershipStatus === "owned"
  ).length;

  const gap = items.filter((item) =>
    ["to-buy", "borrow", "rent"].includes(item.ownershipStatus)
  ).length;

  const issues = (planning?.issues ?? []).filter(
    (issue) => issue.status === "open"
  );

  const currency = cost?.currency ?? "USD";

  const projected =
    planning?.projectedWildCost ??
    cost?.estimatedTotal;

  const remaining =
    cost?.remainingBudget ??
    (typeof cost?.totalWildBudget === "number" &&
    typeof projected === "number"
      ? cost.totalWildBudget - projected
      : undefined);

  const dateLine =
    schedule?.startDate && schedule?.endDate
      ? `${dateLabel(schedule.startDate)} — ${dateLabel(
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

  const origin = isPoint(intent?.startingFrom?.coordinates)
    ? intent.startingFrom.coordinates
    : undefined;

  const dest = isPoint(destination?.coordinates)
    ? destination.coordinates
    : undefined;

  function contextQuery() {
    const params = new URLSearchParams();

    if (adventure.vehicle?.type) {
      params.set("vehicle", adventure.vehicle.type);
    }

    if (adventure.tripStyle) {
      params.set("trip", adventure.tripStyle);
    }

    if (adventure.crew?.type) {
      params.set("crew", adventure.crew.type);
    }

    if (adventure.crew?.people) {
      params.set("people", String(adventure.crew.people));
    }

    if (schedule?.durationType) {
      params.set("duration", schedule.durationType);
    }

    return params.toString();
  }

  const readiness = wild.plan.readiness?.overallPercent;

  const progress =
    typeof readiness === "number"
      ? Math.max(0, Math.min(100, readiness))
      : items.length
        ? 58
        : 24;

  const peopleLabel = adventure.crew?.people
    ? `${adventure.crew.people} ${
        adventure.crew.people === 1 ? "PERSON" : "PEOPLE"
      }`
    : "CREW NOT SET";

  const durationLabel = schedule?.days
    ? `${schedule.days} DAYS · ${schedule.nights ?? 0} NIGHTS`
    : dateLine;

  const vehicleLabel = adventure.vehicle?.type
    ? titleCase(adventure.vehicle.type)
    : "VEHICLE NOT SET";

  const wayInLabel = adventure.wayIn
    ? titleCase(adventure.wayIn)
    : "WAY IN NOT SET";

  const tripStyleLabel = adventure.tripStyle
    ? tripLabel(adventure.tripStyle)
    : "STYLE NOT SET";

  return (
    <main className="page">
      {/* ===================================================
          IMPORTANT:
          STAGE NOW STARTS AT PAGE Y = 0.

          HEADER LIVES INSIDE STAGE.
          IT DOES NOT CREATE ITS OWN ROW.
          =================================================== */}

      <section className="stage">
        <img
          src="/wild-plan-master.jpg"
          className="master"
          alt=""
        />

        <div className="top-readable-gradient" />
        <div className="edge-shade" />

        {/* NAVIGATION OVER THE MOTHER IMAGE */}

        <header className="floating-nav">
          <button
            className="brand"
            onClick={() => router.push("/")}
          >
            ROAMLAB
          </button>

          <nav>
            <button onClick={() => router.push("/ways-in")}>
              EXPLORE
            </button>

            <button onClick={() => router.push("/gear")}>
              GEAR LAB
            </button>

            <span>WILD PLAN</span>
          </nav>
        </header>

        {/* CURRENT WILD */}

        <article
          className="current-zone"
          aria-label="Current Wild"
        >
          <div className="current-destination">
            {destinationName}
          </div>

          <div className="current-way-in">
            {wayInLabel}
          </div>

          <div className="current-vehicle">
            {vehicleLabel}
          </div>

          <div className="current-style">
            {tripStyleLabel}
          </div>

          <div className="current-crew">
            {peopleLabel}
          </div>

          <div className="current-duration">
            {durationLabel}
          </div>
        </article>

        {/* REAL JOURNEY ROUTE */}

        <JourneyMap
          origin={origin}
          destination={dest}
          originName={originName}
          destinationName={destinationName}
          savedDistanceKm={route?.distanceKm}
          savedHours={route?.estimatedHours}
          onEdit={() =>
            router.push("/wild-plan/destination")
          }
        />

        {/* DESTINATION POLAROID */}

        <button
          type="button"
          className="destination-caption"
          onClick={() =>
            router.push("/wild-plan/destination")
          }
        >
          <strong>{destinationName}</strong>
          <span>DESTINATION →</span>
        </button>

        {/* CONDITIONS */}

        <button
          type="button"
          className="conditions-zone"
          onClick={() =>
            router.push("/wild-plan/destination")
          }
        >
          <span className="condition-weather">
            {conditions?.weatherSummary ?? "WEATHER"}
          </span>

          <span className="condition-terrain">
            TERRAIN
          </span>

          <span className="condition-link">
            INTELLIGENCE →
          </span>
        </button>

        {/* BUDGET */}

        <button
          type="button"
          className="budget-zone"
          onClick={() => {
            const query = contextQuery();

            router.push(
              query
                ? `/ways-in/drive/budget?${query}`
                : "/ways-in/drive/budget"
            );
          }}
        >
          <span className="budget-total">
            {cost?.budgetStatus === "unknown"
              ? "NOT SET"
              : money(cost?.totalWildBudget, currency)}
          </span>

          <span className="budget-projected">
            {money(projected, currency)}
          </span>

          <span className="budget-remaining">
            {money(remaining, currency)}
          </span>

          <span className="budget-edit">
            EDIT →
          </span>
        </button>

        {/* PLAN CHECK */}

        <article className="plan-zone">
          <span
            className={`plan-check plan-route ${
              route ? "complete" : ""
            }`}
          >
            {route ? "✓" : "□"}
          </span>

          <span
            className={`plan-check plan-gear ${
              items.length ? "complete" : ""
            }`}
          >
            {items.length ? "✓" : "□"}
          </span>

          <span
            className={`plan-check plan-budget ${
              typeof cost?.totalWildBudget === "number"
                ? "complete"
                : ""
            }`}
          >
            {typeof cost?.totalWildBudget === "number"
              ? "✓"
              : "□"}
          </span>

          <span
            className={`plan-check plan-conditions ${
              conditions ? "complete" : ""
            }`}
          >
            {conditions ? "✓" : "□"}
          </span>

          <span className="plan-route-label">
            Route
          </span>

          <span className="plan-gear-label">
            Gear
          </span>

          <span className="plan-budget-label">
            Budget
          </span>

          <span className="plan-conditions-label">
            Conditions
          </span>

          <div className="plan-progress">
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="plan-message">
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

        {/* GEAR */}

        <article className="gear-zone">
          <span className="gear-essential">
            {essential}
          </span>

          <span className="gear-recommended">
            {recommended}
          </span>

          <span className="gear-optional">
            {optional}
          </span>

          <span className="gear-owned">
            {owned}
          </span>

          <span className="gear-gap">
            {gap}
          </span>

          <button
            type="button"
            className="gear-open"
            onClick={() => {
              const query = contextQuery();

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

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #100b07;
        }

        * {
          box-sizing: border-box;
        }

        button {
          font: inherit;
        }

        .page {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background: #100b07;
          color: #f2e7d4;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ==================================================
           MASTER STAGE

           CRITICAL FIX:
           stage begins at page top.
           There is no header row above it.
           ================================================== */

        .stage {
          position: relative;

          width: min(1536px, 100vw);

          aspect-ratio: 1672 / 941;

          margin: 0 auto;

          overflow: hidden;

          isolation: isolate;

          background: #1c120a;
        }

        .master {
          position: absolute;

          z-index: 1;

          inset: 0;

          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          pointer-events: none;
          user-select: none;
        }

        .top-readable-gradient {
          position: absolute;

          z-index: 2;

          top: 0;
          left: 0;
          right: 0;

          height: 12%;

          pointer-events: none;

          background: linear-gradient(
            to bottom,
            rgba(9, 6, 4, 0.46) 0%,
            rgba(9, 6, 4, 0.13) 58%,
            transparent 100%
          );
        }

        .edge-shade {
          position: absolute;

          z-index: 3;

          inset: 0;

          pointer-events: none;

          background: radial-gradient(
            ellipse at 49% 44%,
            transparent 0%,
            transparent 54%,
            rgba(8, 5, 3, 0.08) 76%,
            rgba(8, 5, 3, 0.26) 100%
          );
        }

        /* ==================================================
           FLOATING NAV

           INSIDE .stage.
           No document height.
           No solid background.
           ================================================== */

        .floating-nav {
          position: absolute;

          z-index: 100;

          top: 0;
          left: 0;

          width: 100%;

          height: clamp(
            62px,
            6.8vw,
            92px
          );

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding:
            0
            clamp(
              28px,
              4.7vw,
              72px
            );

          background: transparent;

          border: 0;

          pointer-events: none;
        }

        .floating-nav button,
        .floating-nav nav,
        .floating-nav span {
          pointer-events: auto;
        }

        .floating-nav button {
          border: 0;

          background: transparent;

          cursor: pointer;
        }

        .brand {
          margin: 0;
          padding: 0;

          color: #fff5e6;

          text-shadow:
            0 2px 10px rgba(0, 0, 0, 0.7),
            0 1px 2px rgba(0, 0, 0, 0.8);

          font-size: clamp(
            14px,
            1.25vw,
            19px
          );

          font-weight: 900;

          letter-spacing: 0.22em;
        }

        .floating-nav nav {
          display: flex;

          align-items: center;

          gap: clamp(
            20px,
            3vw,
            46px
          );

          font-size: clamp(
            8px,
            0.7vw,
            11px
          );

          font-weight: 900;

          letter-spacing: 0.18em;
        }

        .floating-nav nav button {
          margin: 0;

          padding: 8px 0;

          color: rgba(
            255,
            244,
            226,
            0.9
          );

          text-shadow:
            0 2px 9px rgba(0, 0, 0, 0.8);
        }

        .floating-nav nav button:hover {
          color: #fff8ec;
        }

        .floating-nav nav span {
          color: #e9ad6b;

          text-shadow:
            0 2px 9px rgba(0, 0, 0, 0.8);
        }

        /* ==================================================
           CURRENT WILD
           ================================================== */

        .current-zone {
          position: absolute;

          z-index: 30;

          left: 8.9%;
          top: 15.3%;

          width: 17.3%;
          height: 27.5%;

          color: #3d3025;

          transform: rotate(-2.8deg);

          pointer-events: none;
        }

        .current-zone > div {
          position: absolute;

          left: 22%;

          width: 72%;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          color: #403228;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size: clamp(
            7px,
            0.72vw,
            11px
          );

          line-height: 1;

          letter-spacing: 0.01em;
        }

        .current-destination {
          top: 14%;

          left: 10% !important;

          width: 86% !important;

          color: #563527 !important;

          font-family:
            Georgia,
            serif !important;

          font-size: clamp(
            10px,
            1.05vw,
            17px
          ) !important;

          font-style: italic;

          font-weight: 600;
        }

        .current-way-in {
          top: 38%;
        }

        .current-vehicle {
          top: 50%;
        }

        .current-style {
          top: 62%;
        }

        .current-crew {
          top: 74%;
        }

        .current-duration {
          top: 86%;
        }

        /* ==================================================
           JOURNEY
           ================================================== */

        .journey {
          position: absolute;

          z-index: 18;

          left: 28.2%;
          top: 20.5%;

          width: 40.5%;
          height: 39.5%;

          transform: rotate(-0.8deg);

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

          display: block;

          width: 100%;
          height: 100%;

          overflow: visible;

          pointer-events: none;

          mix-blend-mode: multiply;

          filter: drop-shadow(
            0 0.5px 0.7px
              rgba(61, 35, 21, 0.2)
          );
        }

        .route-marker-text {
          fill: #51372b;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 17px;

          font-weight: 900;

          letter-spacing: 2px;

          paint-order: stroke;

          stroke: #e8d9bc;

          stroke-width: 4px;

          stroke-linejoin: round;
        }

        .route-marker-wild {
          fill: #713729;
        }

        .journey-hit {
          position: absolute;

          z-index: 8;

          inset: 10%;

          margin: 0;
          padding: 0;

          border: 0;

          background: transparent;

          cursor: pointer;

          pointer-events: auto;
        }

        .route-distance {
          position: absolute;

          z-index: 9;

          left: 50%;
          bottom: 2.5%;

          transform:
            translateX(-50%)
            rotate(-0.8deg);

          padding: 3px 8px;

          white-space: nowrap;

          color: #553c2e;

          background: rgba(
            224,
            210,
            176,
            0.66
          );

          border-radius: 2px;

          font:
            700
            clamp(
              6px,
              0.56vw,
              9px
            )
            Georgia,
            serif;

          letter-spacing: 0.04em;

          pointer-events: none;
        }

        /* ==================================================
           DESTINATION
           ================================================== */

        .destination-caption {
          position: absolute;

          z-index: 31;

          left: 69.3%;
          top: 30.6%;

          width: 13.8%;
          height: 8.4%;

          margin: 0;

          padding:
            1.2%
            1.1%;

          overflow: hidden;

          border: 0;

          background: transparent;

          color: #44342a;

          text-align: center;

          cursor: pointer;

          transform: rotate(5deg);
        }

        .destination-caption strong {
          display: block;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          color: #4d3528;

          font:
            italic
            600
            clamp(
              7px,
              0.72vw,
              11px
            )
            Georgia,
            serif;
        }

        .destination-caption span {
          display: block;

          margin-top: 4%;

          color: #8a4934;

          font-size: clamp(
            5px,
            0.46vw,
            7px
          );

          font-weight: 900;

          letter-spacing: 0.1em;
        }

        /* ==================================================
           CONDITIONS
           ================================================== */

        .conditions-zone {
          position: absolute;

          z-index: 31;

          right: 5.8%;
          top: 46.3%;

          width: 15%;
          height: 14.5%;

          margin: 0;
          padding: 0;

          border: 0;

          background: transparent;

          color: #433426;

          cursor: pointer;

          transform: rotate(1.2deg);
        }

        .conditions-zone span {
          position: absolute;

          display: block;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;
        }

        .condition-weather {
          left: 28%;
          top: 26%;

          width: 65%;

          color: #48392d;

          text-align: left;

          font-size: clamp(
            7px,
            0.68vw,
            10px
          );
        }

        .condition-terrain {
          left: 28%;
          top: 55%;

          width: 56%;

          color: #48392d;

          text-align: left;

          font-size: clamp(
            7px,
            0.68vw,
            10px
          );
        }

        .condition-link {
          right: 7%;
          bottom: 5%;

          color: #874631;

          font-family:
            Arial,
            Helvetica,
            sans-serif !important;

          font-size: clamp(
            5px,
            0.45vw,
            7px
          ) !important;

          font-weight: 900;

          letter-spacing: 0.08em;
        }

        /* ==================================================
           BUDGET
           ================================================== */

        .budget-zone {
          position: absolute;

          z-index: 31;

          left: 7.6%;
          bottom: 6.2%;

          width: 17.4%;
          height: 22.5%;

          margin: 0;
          padding: 0;

          border: 0;

          background: transparent;

          color: #3f3126;

          cursor: pointer;

          transform: rotate(-1.7deg);
        }

        .budget-zone > span {
          position: absolute;

          display: block;
        }

        .budget-total {
          left: 27%;
          top: 24%;

          width: 61%;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          color: #453526;

          text-align: center;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size: clamp(
            13px,
            1.45vw,
            23px
          );

          font-weight: 600;

          line-height: 1;
        }

        .budget-projected {
          left: 52%;
          top: 57%;

          width: 37%;

          overflow: hidden;

          white-space: nowrap;

          color: #443529;

          text-align: right;

          font:
            600
            clamp(
              7px,
              0.72vw,
              11px
            )
            Georgia,
            serif;
        }

        .budget-remaining {
          left: 52%;
          top: 72%;

          width: 37%;

          overflow: hidden;

          white-space: nowrap;

          color: #443529;

          text-align: right;

          font:
            600
            clamp(
              7px,
              0.72vw,
              11px
            )
            Georgia,
            serif;
        }

        .budget-edit {
          right: 9%;
          bottom: 5%;

          color: #8a4934;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: clamp(
            5px,
            0.45vw,
            7px
          );

          font-weight: 900;

          letter-spacing: 0.09em;
        }

        /* ==================================================
           PLAN CHECK
           ================================================== */

        .plan-zone {
          position: absolute;

          z-index: 31;

          left: 33%;
          bottom: 4.4%;

          width: 29.3%;
          height: 21.5%;

          color: #3e3329;

          transform: rotate(0.6deg);

          pointer-events: none;
        }

        .plan-check {
          position: absolute;

          left: 8%;

          width: 7%;

          color: #59483a;

          text-align: center;

          font-family: Georgia, serif;

          font-size: clamp(
            9px,
            0.9vw,
            14px
          );

          line-height: 1;
        }

        .plan-check.complete {
          color: #315544;
        }

        .plan-route {
          top: 30%;
        }

        .plan-gear {
          top: 46%;
        }

        .plan-budget {
          top: 62%;
        }

        .plan-conditions {
          top: 78%;
        }

        .plan-route-label,
        .plan-gear-label,
        .plan-budget-label,
        .plan-conditions-label {
          position: absolute;

          left: 17%;

          width: 29%;

          overflow: hidden;

          white-space: nowrap;

          color: #46382d;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size: clamp(
            7px,
            0.66vw,
            10px
          );

          line-height: 1;
        }

        .plan-route-label {
          top: 30%;
        }

        .plan-gear-label {
          top: 46%;
        }

        .plan-budget-label {
          top: 62%;
        }

        .plan-conditions-label {
          top: 78%;
        }

        .plan-progress {
          position: absolute;

          left: 56%;
          top: 34%;

          width: 35%;
          height: 6%;

          overflow: hidden;

          border:
            1px solid
            rgba(66, 53, 42, 0.62);

          border-radius: 999px;

          background: rgba(
            75,
            60,
            47,
            0.08
          );
        }

        .plan-progress > span {
          display: block;

          height: 100%;

          border-radius: inherit;

          background: #667c70;
        }

        .plan-message {
          position: absolute;

          left: 56%;
          top: 49%;

          width: 36%;

          margin: 0;

          color: #493a2f;

          font:
            italic
            400
            clamp(
              7px,
              0.66vw,
              10px
            ) /
            1.35
            Georgia,
            serif;
        }

        /* ==================================================
           GEAR
           ================================================== */

        .gear-zone {
          position: absolute;

          z-index: 31;

          right: 5.1%;
          bottom: 5.5%;

          width: 17.1%;
          height: 22.5%;

          color: #3e3228;

          transform: rotate(2.3deg);
        }

        .gear-zone > span {
          position: absolute;

          right: 13%;

          width: 22%;

          color: #423429;

          text-align: center;

          font-family:
            "Comic Sans MS",
            "Bradley Hand",
            cursive;

          font-size: clamp(
            9px,
            0.9vw,
            14px
          );

          font-weight: 600;

          line-height: 1;
        }

        .gear-essential {
          top: 26%;
        }

        .gear-recommended {
          top: 39%;
        }

        .gear-optional {
          top: 52%;
        }

        .gear-owned {
          top: 65%;
        }

        .gear-gap {
          top: 78%;

          color: #8a3e2d !important;
        }

        .gear-open {
          position: absolute;

          left: 18%;
          bottom: 2%;

          width: 67%;

          margin: 0;

          padding: 2.5% 3%;

          border: 0;

          background: transparent;

          color: #824531;

          cursor: pointer;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: clamp(
            5px,
            0.45vw,
            7px
          );

          font-weight: 900;

          letter-spacing: 0.08em;

          text-align: center;
        }

        /* ==================================================
           INTERACTION
           ================================================== */

        .destination-caption:hover,
        .conditions-zone:hover,
        .budget-zone:hover,
        .gear-open:hover {
          filter: brightness(1.06);
        }

        .destination-caption:focus-visible,
        .conditions-zone:focus-visible,
        .budget-zone:focus-visible,
        .gear-open:focus-visible,
        .journey-hit:focus-visible,
        .floating-nav button:focus-visible {
          outline: 2px solid
            rgba(235, 180, 111, 0.85);

          outline-offset: 3px;
        }

        /* ==================================================
           RESPONSIVE

           Keep the physical desk composition locked.
           ================================================== */

        @media (max-width: 900px) {
          .stage {
            width: 1180px;

            max-width: none;

            left: 50%;

            transform: translateX(-50%);
          }

          .floating-nav {
            width: 100%;

            padding: 0 48px;
          }

          .floating-nav nav {
            gap: 26px;
          }
        }

        @media (max-width: 680px) {
          .stage {
            width: 1050px;
          }

          .floating-nav {
            width: 100%;

            height: 66px;

            padding: 0 40px;
          }

          .brand {
            font-size: 14px;
          }

          .floating-nav nav button {
            display: none;
          }

          .floating-nav nav {
            font-size: 8px;
          }
        }
      `}</style>
    </main>
  );
}
