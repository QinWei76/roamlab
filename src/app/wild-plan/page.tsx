1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Wild } from "@/types/wild";
import { CURRENT_WILD_UPDATED_EVENT, getCurrentWild } from "@/lib/wildStore";

function titleCase(value?: string) {
  if (!value) return "Not set";
  return value.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
function money(value?: number, currency = "USD") {
  if (value === undefined || !Number.isFinite(value)) return "Not set";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch { return `${currency} ${value.toLocaleString("en-US")}`; }
}
function dateLabel(value?: string) {
  if (!value) return "";
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", year:"numeric" }).format(d).toUpperCase();
}
function vehicleLabel(value?: string) {
  const map: Record<string,string> = { suv:"SUV", truck:"Truck", van:"Van", crossover:"Crossover / AWD", city:"2WD / City Car", "4x4":"4×4", rv:"RV", motorcycle:"Motorcycle" };
  return value ? map[value] ?? titleCase(value) : "Not set";
}
function tripLabel(value?: string) {
  const map: Record<string,string> = { weekend:"Weekend Escape", "road-trip":"Road Trip", basecamp:"Basecamp", remote:"Remote / Off-Grid" };
  return value ? map[value] ?? titleCase(value) : "Not set";
}

export default function WildPlanPage() {
  const router = useRouter();
  const [wild, setWild] = useState<Wild | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = () => { setWild(getCurrentWild()); setLoaded(true); };
    load();
    window.addEventListener(CURRENT_WILD_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(CURRENT_WILD_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  if (!loaded) return <main style={{ minHeight:"100vh", background:"#100d09" }} />;

  if (!wild) {
    return (
      <main className="empty">
        <section>
          <p>ROAMLAB · WILD PLAN</p>
          <h1>No Wild on the table yet.</h1>
          <span>Choose a way in and RoamLab will begin building one shared plan around your journey.</span>
          <button onClick={() => router.push("/ways-in")}>START YOUR WILD →</button>
        </section>
        <style jsx>{`
          .empty{min-height:100vh;display:grid;place-items:center;padding:30px;background:linear-gradient(135deg,#2b2117,#100d09);color:#34291e}
          section{width:min(620px,100%);padding:54px;background:#d8c7a5;box-shadow:0 35px 90px #0008;transform:rotate(-.7deg)}
          p{font:800 10px sans-serif;letter-spacing:.22em} h1{font:400 44px Georgia,serif;margin:18px 0} span{line-height:1.7}
          button{display:block;margin-top:30px;border:0;padding:14px 18px;background:#9b4e25;color:#fff4df;font:800 10px sans-serif;letter-spacing:.12em;cursor:pointer}
        `}</style>
      </main>
    );
  }

  const a = wild.plan.adventure;
  const s = a.schedule;
  const destination = a.destination;
  const intent = a.intent;
  const route = wild.plan.route;
  const conditions = wild.plan.conditions;
  const gear = wild.plan.prepare?.gear;
  const cost = wild.plan.cost;
  const planning = wild.plan.planning;
  const readiness = wild.plan.readiness;
  const items = gear?.items ?? [];
  const owned = items.filter(i => i.ownershipStatus === "owned").length;
  const gap = items.filter(i => ["to-buy","borrow","rent"].includes(i.ownershipStatus)).length;
  const essential = items.filter(i => i.priority === "essential").length;
  const recommended = items.filter(i => i.priority === "recommended").length;
  const optional = items.filter(i => i.priority === "optional").length;
  const issues = (planning?.issues ?? []).filter(i => i.status === "open");
  const currency = cost?.currency ?? "USD";
  const projected = planning?.projectedWildCost ?? cost?.estimatedTotal;
  const remaining = cost?.remainingBudget ?? (typeof cost?.totalWildBudget === "number" && typeof projected === "number" ? cost.totalWildBudget - projected : undefined);

  const dateLine = s?.startDate && s?.endDate
    ? `${dateLabel(s.startDate)} — ${dateLabel(s.endDate)}`
    : s?.timingMode === "flexible" ? "FLEXIBLE DATES"
    : s?.timingMode === "undecided" ? "DATES UNDECIDED" : "DATES NOT SET";

  const routeLine = route
    ? [typeof route.distanceKm === "number" ? `${Math.round(route.distanceKm)} KM` : "", typeof route.estimatedHours === "number" ? `${route.estimatedHours.toFixed(1)} HRS` : ""].filter(Boolean).join(" · ") || "ROUTE IN PROGRESS"
    : "ROUTE NOT BUILT";

  const contextQuery = () => {
    const p = new URLSearchParams();
    if (a.vehicle?.type) p.set("vehicle", a.vehicle.type);
    if (a.tripStyle) p.set("trip", a.tripStyle);
    if (a.crew?.type) p.set("crew", a.crew.type);
    if (a.crew?.people) p.set("people", String(a.crew.people));
    if (s?.durationType) p.set("duration", s.durationType);
    return p.toString();
  };

  return (
    <main className="desk">
      <div className="grain"/>
      <header>
        <button className="brand" onClick={() => router.push("/")}>ROAMLAB</button>
        <nav>
          <button onClick={() => router.push("/ways-in")}>WAYS IN</button>
          <button onClick={() => router.push("/gear")}>GEAR LAB</button>
          <span>YOUR WILD PLAN</span>
        </nav>
      </header>

      <section className="hero">
        <div className="stamp">CURRENT WILD</div>
        <p>FIELD PLAN · {wild.status.toUpperCase()}</p>
        <h1>{destination?.name || wild.title || "My Wild"}</h1>
        <strong>{dateLine}</strong>
        <div className="meta">
          <span>{titleCase(a.wayIn)}</span><i>•</i>
          <span>{tripLabel(a.tripStyle)}</span><i>•</i>
          <span>{a.crew?.type ? `${titleCase(a.crew.type)} · ${a.crew.people}` : "Crew not set"}</span>
          {s?.days ? <><i>•</i><span>{s.days} DAYS · {s.nights ?? 0} NIGHTS</span></> : null}
        </div>
      </section>

      <section className="workspace">
        <article className="map paper">
          <label>01 · JOURNEY</label>
          <div className="mapTexture"/>
          <div className="thread"/>
          <span className="pin start">START</span><span className="pin wild">WILD</span>
          <div className="mapCopy">
            <small>DESTINATION</small>
            <h2>{destination?.name || "Choose your destination"}</h2>
            <p>{destination?.region || destination?.country ? [destination.region,destination.country].filter(Boolean).join(" · ") : "Your destination anchors the entire Wild."}</p>
          </div>
          <div className="mapFoot">
            <div><small>STARTING FROM</small><b>{intent?.startingFrom?.name || "Not set"}</b></div>
            <div><small>ROUTE</small><b>{routeLine}</b></div>
            <button onClick={() => router.push("/wild-plan/destination")}>EDIT DESTINATION →</button>
          </div>
        </article>

        <aside className="polaroid">
          <div className="photo"><span/><i/><b/></div>
          <small>WAY IN</small><h3>{titleCase(a.wayIn)}</h3><p>{vehicleLabel(a.vehicle?.type)}</p>
        </aside>

        <button className="weather note" onClick={() => router.push("/wild-plan/destination")}>
          <small>CONDITIONS</small><h3>{conditions?.weatherSummary || "Weather & terrain"}</h3>
          <p>{conditions ? [conditions.expectedMinTempC !== undefined ? `${conditions.expectedMinTempC}°C LOW`:"", conditions.expectedMaxTempC !== undefined ? `${conditions.expectedMaxTempC}°C HIGH`:"", conditions.terrain?.slice(0,2).join(" · ") || ""].filter(Boolean).join(" · ") || "Conditions added." : "Destination context and live intelligence."}</p>
        </button>
