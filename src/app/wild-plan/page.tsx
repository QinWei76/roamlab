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

type Point = { latitude: number; longitude: number };

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
  return value.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
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
  if (value === undefined || !Number.isFinite(value)) return "Not set";
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
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d).toUpperCase();
}

function ensureLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.L) return Promise.resolve(window.L);

  if (!document.getElementById("roamlab-leaflet-css")) {
    const css = document.createElement("link");
    css.id = "roamlab-leaflet-css";
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
  }

  return new Promise((resolve, reject) => {
    const old = document.getElementById("roamlab-leaflet-js") as HTMLScriptElement | null;
    if (old) {
      const wait = () => window.L ? resolve(window.L) : window.setTimeout(wait, 50);
      wait();
      return;
    }
    const js = document.createElement("script");
    js.id = "roamlab-leaflet-js";
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.async = true;
    js.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet unavailable"));
    js.onerror = () => reject(new Error("Leaflet failed to load"));
    document.body.appendChild(js);
  });
}

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
  const node = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [geometry, setGeometry] = useState<[number, number][]>([]);
  const [liveDistance, setLiveDistance] = useState<number>();
  const [liveHours, setLiveHours] = useState<number>();
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const ready = isPoint(origin) && isPoint(destination);

  useEffect(() => {
    let cancelled = false;

    if (!ready) {
      setGeometry([]);
      setStatus("idle");
      return;
    }

    const start = origin;
    const end = destination;

    async function route() {
      setStatus("loading");
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
          `?overview=full&geometries=geojson&steps=false&alternatives=false`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("OSRM route failed");
        const data = await response.json();
        const first = data?.routes?.[0];
        if (!first?.geometry?.coordinates) throw new Error("No route geometry");

        const line: [number, number][] = first.geometry.coordinates.map(
          (p: [number, number]) => [p[1], p[0]]
        );

        if (!cancelled) {
          setGeometry(line);
          setLiveDistance(typeof first.distance === "number" ? first.distance / 1000 : undefined);
          setLiveHours(typeof first.duration === "number" ? first.duration / 3600 : undefined);
          setStatus("ready");
        }
      } catch (error) {
        console.error("Journey route failed:", error);
        if (!cancelled) setStatus("error");
      }
    }

    route();
    return () => { cancelled = true; };
  }, [
    ready,
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (!node.current || !ready) return;

    const start = origin;
    const end = destination;

    async function draw() {
      try {
        const L = await ensureLeaflet();
        if (cancelled || !node.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(node.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
        });
        mapRef.current = map;

        L.tileLayer(
          "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 16 }
        ).addTo(map);

        const startIcon = L.divIcon({
          className: "rl-icon",
          html: '<span class="rl-pin rl-start"></span>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const endIcon = L.divIcon({
          className: "rl-icon",
          html: '<span class="rl-pin rl-end"></span>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([start.latitude, start.longitude], { icon: startIcon }).addTo(map);
        L.marker([end.latitude, end.longitude], { icon: endIcon }).addTo(map);

        const line = geometry.length > 1
          ? geometry
          : [
              [start.latitude, start.longitude],
              [end.latitude, end.longitude],
            ];

        L.polyline(line, {
          color: "#963b2a",
          weight: 4,
          opacity: 0.92,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        const bounds = L.latLngBounds([
          [start.latitude, start.longitude],
          [end.latitude, end.longitude],
          ...geometry,
        ]);

        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 10 });
        window.setTimeout(() => !cancelled && map.invalidateSize(), 100);
      } catch (error) {
        console.error("Journey map failed:", error);
      }
    }

    draw();

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

  const distance = liveDistance ?? savedDistanceKm;
  const hours = liveHours ?? savedHours;
  const routeText = [
    typeof distance === "number" ? `${Math.round(distance)} KM` : "",
    typeof hours === "number" ? `${hours.toFixed(1)} HRS` : "",
  ].filter(Boolean).join(" · ");

  return (
    <article className="journey">
      <div className="map-paper">
        {ready ? (
          <div ref={node} className="live-map" />
        ) : (
          <div className="map-empty">
            <small>JOURNEY MAP</small>
            <strong>Waiting for map coordinates.</strong>
            <p>Set a starting point and destination to bring this map to life.</p>
          </div>
        )}

        <div className="map-wash" />
        <div className="fold fold1" />
        <div className="fold fold2" />

        <button className="map-label start-label" onClick={onEdit}>
          <small>START</small>
          <b>{originName}</b>
        </button>

        <button className="map-label wild-label" onClick={onEdit}>
          <small>WILD</small>
          <b>{destinationName}</b>
        </button>

        <div className="route-note">
          {status === "loading"
            ? "DRAWING ACCESS ROUTE..."
            : status === "error"
              ? routeText || "ROUTE UNAVAILABLE"
              : routeText || "ROUTE IN PROGRESS"}
        </div>

        <button className="edit-map" onClick={onEdit}>EDIT JOURNEY →</button>
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
    return <main style={{ minHeight: "100vh", background: "#100b07" }} />;
  }

  if (!wild) {
    return (
      <main className="empty">
        <section>
          <small>ROAMLAB · WILD PLAN</small>
          <h1>Nothing on the table yet.</h1>
          <p>Choose your way in and begin building your next Wild.</p>
          <button onClick={() => router.push("/ways-in")}>START YOUR WILD →</button>
        </section>
        <style jsx>{`
          .empty { min-height:100vh; display:grid; place-items:center; padding:30px; background:linear-gradient(rgba(10,7,4,.2),rgba(10,7,4,.6)),url("/wild-plan-test.jpg") center/cover; color:#35291e; }
          section { width:min(560px,90vw); padding:50px; background:rgba(221,207,177,.94); box-shadow:0 30px 90px #0009; transform:rotate(-1deg); }
          small { font:800 10px Arial; letter-spacing:.2em; }
          h1 { font:400 44px Georgia; margin:18px 0 12px; }
          p { font:16px/1.6 Georgia; }
          button { margin-top:20px; padding:13px 17px; border:0; background:#93432a; color:#fff1dc; cursor:pointer; font:800 10px Arial; letter-spacing:.12em; }
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

  const essential = items.filter((x) => x.priority === "essential").length;
  const recommended = items.filter((x) => x.priority === "recommended").length;
  const optional = items.filter((x) => x.priority === "optional").length;
  const owned = items.filter((x) => x.ownershipStatus === "owned").length;
  const gap = items.filter((x) =>
    ["to-buy", "borrow", "rent"].includes(x.ownershipStatus)
  ).length;

  const issues = (planning?.issues ?? []).filter((x) => x.status === "open");
  const currency = cost?.currency ?? "USD";
  const projected = planning?.projectedWildCost ?? cost?.estimatedTotal;
  const remaining =
    cost?.remainingBudget ??
    (typeof cost?.totalWildBudget === "number" && typeof projected === "number"
      ? cost.totalWildBudget - projected
      : undefined);

  const dateLine =
    schedule?.startDate && schedule?.endDate
      ? `${dateLabel(schedule.startDate)} — ${dateLabel(schedule.endDate)}`
      : schedule?.timingMode === "flexible"
        ? "FLEXIBLE DATES"
        : schedule?.timingMode === "undecided"
          ? "DATES UNDECIDED"
          : "DATES NOT SET";

  const originName = intent?.startingFrom?.name ?? "Starting point not set";
  const destinationName = destination?.name ?? "Choose your destination";
  const origin = isPoint(intent?.startingFrom?.coordinates)
    ? intent.startingFrom.coordinates
    : undefined;
  const dest = isPoint(destination?.coordinates)
    ? destination.coordinates
    : undefined;

  function contextQuery() {
    const p = new URLSearchParams();
    if (a.vehicle?.type) p.set("vehicle", a.vehicle.type);
    if (a.tripStyle) p.set("trip", a.tripStyle);
    if (a.crew?.type) p.set("crew", a.crew.type);
    if (a.crew?.people) p.set("people", String(a.crew.people));
    if (schedule?.durationType) p.set("duration", schedule.durationType);
    return p.toString();
  }

  const readiness = wild.plan.readiness?.overallPercent;
  const progress =
    typeof readiness === "number"
      ? Math.max(0, Math.min(100, readiness))
      : items.length ? 58 : 24;

  return (
    <main className="page">
      <header>
        <button className="brand" onClick={() => router.push("/")}>ROAMLAB</button>
        <nav>
          <button onClick={() => router.push("/ways-in")}>EXPLORE</button>
          <button onClick={() => router.push("/gear")}>GEAR LAB</button>
          <span>WILD PLAN</span>
        </nav>
      </header>

      <section className="stage">
        <img src="/wild-plan-test.jpg" className="master" alt="" />
        <div className="shade" />

        <article className="current overlay">
          <small>CURRENT WILD</small>
          <h1>{destinationName}</h1>
          <p>{titleCase(a.wayIn)} · {tripLabel(a.tripStyle)}</p>
          <p>{a.crew?.people ? `${a.crew.people} ${a.crew.people === 1 ? "Person" : "People"}` : "Crew not set"}</p>
          <p>{schedule?.days ? `${schedule.days} Days · ${schedule.nights ?? 0} Nights` : dateLine}</p>
        </article>

       <div
  style={{
    position: "absolute",
    left: "25%",
    top: "16%",
    width: "46%",
    height: "47%",
    zIndex: 9999,
    boxSizing: "border-box",
    border: "8px solid red",
    background: "#17100c",
    color: "white",
    padding: "22px",
    fontFamily: "Arial, Helvetica, sans-serif",
  }}
>
  <div
    style={{
      fontSize: "22px",
      fontWeight: 900,
      marginBottom: "16px",
    }}
  >
    JOURNEY MAP DIAGNOSTIC
  </div>

  <div style={{ fontSize: "14px", lineHeight: 1.8 }}>
    <div>
      START COORDINATES:{" "}
      <strong>
        {origin
          ? `OK — ${origin.latitude}, ${origin.longitude}`
          : "MISSING"}
      </strong>
    </div>

    <div>
      DESTINATION COORDINATES:{" "}
      <strong>
        {dest
          ? `OK — ${dest.latitude}, ${dest.longitude}`
          : "MISSING"}
      </strong>
    </div>

    <div>
      MAP READY:{" "}
      <strong>{origin && dest ? "YES" : "NO"}</strong>
    </div>

    <div>
      SAVED ROUTE:{" "}
      <strong>{route ? "PRESENT" : "NOT PRESENT"}</strong>
    </div>

    <div>
      SAVED DISTANCE:{" "}
      <strong>
        {typeof route?.distanceKm === "number"
          ? `${Math.round(route.distanceKm)} KM`
          : "NOT SET"}
      </strong>
    </div>

    <div>
      SAVED HOURS:{" "}
      <strong>
        {typeof route?.estimatedHours === "number"
          ? `${route.estimatedHours.toFixed(1)} HRS`
          : "NOT SET"}
      </strong>
    </div>
  </div>
</div>
        <button className="destination overlay" onClick={() => router.push("/wild-plan/destination")}>
          <small>DESTINATION</small>
          <strong>{destinationName}</strong>
          <span>VIEW / CHANGE →</span>
        </button>

        <button className="conditions overlay" onClick={() => router.push("/wild-plan/destination")}>
          <small>CONDITIONS</small>
          <strong>{conditions?.weatherSummary || "Weather & terrain"}</strong>
          <span>OPEN INTELLIGENCE →</span>
        </button>

        <button className="budget overlay" onClick={() => {
          const q = contextQuery();
          router.push(q ? `/ways-in/drive/budget?${q}` : "/ways-in/drive/budget");
        }}>
          <small>BUDGET</small>
          <strong>{cost?.budgetStatus === "unknown" ? "NOT SET" : money(cost?.totalWildBudget, currency)}</strong>
          <p><span>Projected</span><b>{money(projected, currency)}</b></p>
          <p><span>Remaining</span><b>{money(remaining, currency)}</b></p>
          <em>EDIT BUDGET →</em>
        </button>

        <article className="plan overlay">
          <small>PLAN CHECK</small>
          <ul>
            <li><i className={route ? "done" : ""}>{route ? "✓" : "□"}</i>Route & access</li>
            <li><i className={items.length ? "done" : ""}>{items.length ? "✓" : "□"}</i>Gear readiness</li>
            <li><i className={typeof cost?.totalWildBudget === "number" ? "done" : ""}>{typeof cost?.totalWildBudget === "number" ? "✓" : "□"}</i>Budget check</li>
            <li><i className={conditions ? "done" : ""}>{conditions ? "✓" : "□"}</i>Weather & terrain</li>
          </ul>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <p>{issues.length ? `${issues.length} ${issues.length === 1 ? "thing needs" : "things need"} attention.` : planning ? "Your plan is looking clear." : "Checking your plan..."}</p>
        </article>

        <article className="gear overlay">
          <small>GEAR SYSTEM</small>
          <p><span>Essential</span><b>{essential}</b></p>
          <p><span>Recommended</span><b>{recommended}</b></p>
          <p><span>Optional</span><b>{optional}</b></p>
          <p><span>Already owned</span><b>{owned}</b></p>
          <p className="gap"><span>Gear gap</span><b>{gap}</b></p>
          <button onClick={() => {
            const q = contextQuery();
            router.push(q ? `/ways-in/drive/gear?${q}` : "/ways-in/drive/gear");
          }}>OPEN GEAR ROOM →</button>
        </article>
      </section>

      <style jsx global>{`
        html, body { margin:0; background:#100b07; }
        .leaflet-container { background:#b8aa80; }
        .live-map .leaflet-tile-pane { filter:sepia(.5) saturate(.58) contrast(.9) brightness(.94); }
        .live-map .leaflet-control-container { display:none; }
        .rl-icon { background:transparent!important; border:0!important; }
        .rl-pin { display:block; width:14px; height:14px; border:3px solid #ead8b8; border-radius:50%; background:#963b2a; box-shadow:0 2px 5px #2c1b12aa,0 0 0 4px #963b2a33; }
        .rl-end { width:17px; height:17px; background:#7f2e23; }
      `}</style>

      <style jsx>{`
        button { font:inherit; }
        .page { min-height:100vh; overflow-x:hidden; background:#100b07; color:#f2e7d4; font-family:Arial,Helvetica,sans-serif; }
        header { position:relative; z-index:100; height:82px; display:flex; align-items:center; justify-content:space-between; padding:0 5vw; background:linear-gradient(#0c0805fa,#0c0805d5); border-bottom:1px solid #fff0da18; }
        header button { border:0; background:transparent; color:#f7ecd8bd; cursor:pointer; }
        .brand { color:#fff5e5!important; font-size:18px!important; font-weight:800!important; letter-spacing:.22em!important; }
        nav { display:flex; gap:42px; align-items:center; font-size:10px; font-weight:800; letter-spacing:.2em; }
        nav span { color:#e1a15f; }

        .stage { position:relative; width:min(1536px,100vw); aspect-ratio:3/2; margin:0 auto; overflow:hidden; isolation:isolate; background:#1c120a; }
        .master { position:absolute; z-index:0; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; user-select:none; }
        .shade { position:absolute; z-index:1; inset:0; pointer-events:none; background:radial-gradient(circle at 48% 40%,transparent 0 43%,#0b070414 72%,#0b07043b 100%); }
        .overlay { position:absolute; z-index:30; color:#34291f; text-align:left; }
        .overlay small { color:#74442f; font-size:clamp(7px,.68vw,10px); font-weight:900; letter-spacing:.18em; }

        .current { left:9.2%; top:13%; width:18%; transform:rotate(-3deg); pointer-events:none; }
        .current h1 { margin:8% 0; font:400 clamp(15px,1.55vw,25px)/1.03 Georgia,serif; }
        .current p { margin:4.5% 0; font:400 clamp(9px,.88vw,14px)/1.3 Georgia,serif; }

        .journey { position:absolute; z-index:18; left:25.4%; top:15.2%; width:45.2%; height:47.8%; transform:rotate(-1.2deg); filter:drop-shadow(0 18px 22px #0006); }
        .map-paper { position:relative; width:100%; height:100%; overflow:hidden; background:#c8bc91; clip-path:polygon(1% 1.5%,24% .4%,49% 1.3%,73% .5%,99% 1.7%,98.7% 98%,74% 99.2%,49% 98.3%,24% 99.3%,.5% 98%); }
        .live-map { position:absolute; z-index:1; inset:0; }
        .map-empty { position:absolute; z-index:1; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12%; text-align:center; color:#493c2c; background:#c9bc91; }
        .map-empty strong { margin-top:14px; font:400 clamp(18px,2vw,30px) Georgia,serif; }
        .map-empty p { max-width:360px; font:400 13px/1.6 Georgia,serif; }
        .map-wash { position:absolute; z-index:3; inset:0; pointer-events:none; background:linear-gradient(112deg,#fff4d029,transparent 35%,#513f2816 70%,#ebd8a91a),#ccbe911f; box-shadow:inset 0 0 45px #48362238; mix-blend-mode:multiply; }
        .fold { position:absolute; z-index:4; top:0; bottom:0; width:1px; pointer-events:none; background:#4b3d2a2e; box-shadow:2px 0 5px #fff5d31f,-2px 0 6px #46372614; }
        .fold1 { left:34%; } .fold2 { left:68%; }

        .map-label { position:absolute; z-index:8; max-width:29%; padding:7px 9px; border:0; color:#31261d; background:#e2d5b0d9; box-shadow:0 4px 10px #37271824; cursor:pointer; text-align:left; }
        .start-label { left:5%; bottom:7%; transform:rotate(-2deg); }
        .wild-label { right:4%; top:7%; transform:rotate(1deg); }
        .map-label small { display:block; margin-bottom:3px; color:#963c2a; font-size:clamp(6px,.5vw,8px); font-weight:900; letter-spacing:.18em; }
        .map-label b { display:block; font:600 clamp(8px,.8vw,13px)/1.12 Georgia,serif; }
        .route-note { position:absolute; z-index:8; left:50%; bottom:5%; transform:translateX(-50%) rotate(-2deg); padding:5px 9px; white-space:nowrap; color:#49372a; background:#decfa7d9; font:700 clamp(7px,.72vw,11px) Georgia,serif; }
        .edit-map { position:absolute; z-index:9; right:3%; bottom:3%; border:0; background:transparent; color:#8b402d; cursor:pointer; font-size:clamp(6px,.55vw,9px); font-weight:900; letter-spacing:.12em; }

        .destination { right:8.7%; top:25.5%; width:16%; padding:5% 1.4% 1.2%; border:0; background:transparent; cursor:pointer; transform:rotate(5deg); }
        .destination strong { display:block; margin-top:4%; font:italic 400 clamp(10px,.9vw,15px)/1.15 Georgia,serif; }
        .destination span,.conditions span { display:block; margin-top:5%; color:#87422f; font-size:clamp(6px,.52vw,8px); font-weight:900; letter-spacing:.08em; }

        .conditions { right:5.3%; top:45%; width:15.8%; min-height:13%; padding:1.2% 1.5%; border:0; background:#cfb6641f; cursor:pointer; transform:rotate(1.5deg); }
        .conditions strong { display:block; margin-top:8%; font:400 clamp(11px,1vw,16px)/1.2 Georgia,serif; }

        .budget { left:7.5%; bottom:7.2%; width:17.2%; min-height:20%; padding:1.6% 1.7%; border:0; background:#d3c29712; cursor:pointer; transform:rotate(-2deg); }
        .budget > strong { display:block; width:max-content; margin:8% 0; padding:3% 5%; background:#d3b557c7; font:500 clamp(16px,1.7vw,27px) "Comic Sans MS",cursive; }
        .budget p { display:flex; justify-content:space-between; gap:10px; margin:5% 0; font:400 clamp(8px,.72vw,11px) Georgia,serif; }
        .budget em { display:block; margin-top:8%; color:#86412d; font-size:clamp(6px,.52vw,8px); font-style:normal; font-weight:900; letter-spacing:.08em; }

        .plan { left:33.2%; bottom:4.5%; width:29%; height:20%; padding:1.5% 2%; transform:rotate(.8deg); pointer-events:none; }
        .plan ul { margin:6% 0 0; padding:0; list-style:none; }
        .plan li { display:flex; gap:8px; align-items:center; margin:3% 0; font:400 clamp(8px,.72vw,12px) "Comic Sans MS",cursive; }
        .plan i { width:14px; font-style:normal; } .plan .done { color:#315340; }
        .progress { position:absolute; left:55%; top:25%; width:37%; height:8px; overflow:hidden; border:1px solid #50412fcc; border-radius:999px; }
        .progress span { display:block; height:100%; background:#6e8179; }
        .plan > p { position:absolute; left:55%; top:39%; width:38%; margin:0; font:italic 400 clamp(8px,.75vw,12px)/1.4 Georgia,serif; }

        .gear { right:5%; bottom:5.7%; width:17%; min-height:22%; padding:1.4% 1.6%; transform:rotate(2.5deg); }
        .gear > p { display:flex; justify-content:space-between; margin:5% 0; padding-bottom:3%; border-bottom:1px solid #3f31252a; font:400 clamp(8px,.75vw,12px) Georgia,serif; }
        .gear > p b { font-size:clamp(11px,1.1vw,17px); font-weight:400; }
        .gap b { padding:1px 6px; color:#8e3d2a; background:#a7442e29; }
        .gear button { width:100%; margin-top:5%; padding:4%; border:1px solid #47382ab8; background:transparent; color:#3a3025; cursor:pointer; font-size:clamp(6px,.55vw,9px); font-weight:900; letter-spacing:.08em; }


        /* =========================================================
           TEMP — JOURNEY MAP VISIBILITY TEST
           Only for proving the central live map.
           ========================================================= */
        .journey {
          position:absolute!important;
          left:25%!important;
          top:16%!important;
          width:46%!important;
          height:47%!important;
          z-index:50!important;
          transform:none!important;
          filter:none!important;
          background:#efe4c7!important;
          opacity:1!important;
          overflow:hidden!important;
          border:4px solid #ff2a00!important;
          box-sizing:border-box!important;
        }

        .map-paper {
          position:relative!important;
          width:100%!important;
          height:100%!important;
          opacity:1!important;
          background:#efe4c7!important;
          overflow:hidden!important;
          clip-path:none!important;
        }

        .live-map {
          position:absolute!important;
          inset:0!important;
          width:100%!important;
          height:100%!important;
          display:block!important;
          opacity:1!important;
          z-index:10!important;
          filter:none!important;
          mix-blend-mode:normal!important;
          background:#d8cfb6!important;
        }

        .map-wash,
        .fold {
          display:none!important;
        }

        .map-empty {
          z-index:10!important;
          opacity:1!important;
        }

        .map-label,
        .route-note,
        .edit-map {
          z-index:30!important;
        }

        @media(max-width:900px) {
          header { padding:0 24px; }
          nav { gap:20px; }
          .stage { width:1180px; max-width:none; left:50%; transform:translateX(-50%); }
        }
        @media(max-width:680px) {
          header { height:68px; }
          .brand { font-size:14px!important; }
          nav button { display:none; }
          nav { font-size:8px; }
          .stage { width:1050px; }
        }
      `}</style>
    </main>
  );
}
