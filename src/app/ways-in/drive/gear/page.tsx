"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type VehicleKey = "suv" | "truck" | "van" | "crossover" | "city";
type TripKey = "weekend" | "road-trip" | "basecamp" | "remote";
type CrewKey = "solo" | "couple" | "family" | "friends";
type DurationKey = "overnight" | "weekend" | "multi-day" | "extended";
type Priority = "essential" | "recommended" | "optional";
type GearSystemKey = "personal" | "vehicle" | "safety";
type GearItem = { name: string; priority: Priority };

const vehicleLabels: Record<VehicleKey, string> = { suv: "SUV", truck: "TRUCK", van: "VAN", crossover: "CROSSOVER / AWD", city: "2WD / CITY CAR" };
const tripLabels: Record<TripKey, string> = { weekend: "WEEKEND ESCAPE", "road-trip": "ROAD TRIP", basecamp: "BASECAMP", remote: "REMOTE / OFF-GRID" };
const crewLabels: Record<CrewKey, string> = { solo: "SOLO", couple: "COUPLE", family: "FAMILY", friends: "FRIENDS" };
const durationLabels: Record<DurationKey, string> = { overnight: "1 NIGHT", weekend: "2–3 NIGHTS", "multi-day": "4–7 NIGHTS", extended: "8+ NIGHTS" };
const systemTitles: Record<GearSystemKey, string> = { personal: "PERSONAL GEAR", vehicle: "VEHICLE & CAMP GEAR", safety: "SAFETY & EMERGENCY" };
const stepNumber: Record<GearSystemKey, number> = { personal: 1, vehicle: 2, safety: 3 };

const isVehicleKey = (v: string | null): v is VehicleKey => ["suv","truck","van","crossover","city"].includes(v || "");
const isTripKey = (v: string | null): v is TripKey => ["weekend","road-trip","basecamp","remote"].includes(v || "");
const isCrewKey = (v: string | null): v is CrewKey => ["solo","couple","family","friends"].includes(v || "");
const isDurationKey = (v: string | null): v is DurationKey => ["overnight","weekend","multi-day","extended"].includes(v || "");

export default function GearPage() {
  const [vehicle, setVehicle] = useState<VehicleKey>("suv");
  const [trip, setTrip] = useState<TripKey>("weekend");
  const [crew, setCrew] = useState<CrewKey>("couple");
  const [people, setPeople] = useState(2);
  const [duration, setDuration] = useState<DurationKey>("weekend");
  const [ready, setReady] = useState(false);
  const [activeSystem, setActiveSystem] = useState<GearSystemKey | null>(null);
  const [reviewed, setReviewed] = useState<Record<GearSystemKey, boolean>>({ personal: false, vehicle: false, safety: false });
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [showFinalSystem, setShowFinalSystem] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const v = p.get("vehicle"), t = p.get("trip"), c = p.get("crew"), d = p.get("duration");
    if (isVehicleKey(v)) setVehicle(v);
    if (isTripKey(t)) setTrip(t);
    if (isCrewKey(c)) setCrew(c);
    if (isDurationKey(d)) setDuration(d);
    const n = Number(p.get("people"));
    if (Number.isFinite(n) && n > 0) setPeople(n);
    setReady(true);
  }, []);

  const gearSystem = useMemo(() => {
    const isRemote = trip === "remote";
    const isLong = duration === "multi-day" || duration === "extended";
    const isLargeCrew = people >= 4;
    const isCityCar = vehicle === "city";
    const personal: GearItem[] = [
      { name: "Sleeping System", priority: "essential" },
      { name: "Clothing Layers", priority: "essential" },
      { name: "Personal Lighting", priority: isRemote ? "essential" : "recommended" },
      { name: "Water & Hydration", priority: "essential" },
      { name: "Hygiene Kit", priority: isLong ? "essential" : "recommended" },
      { name: "Personal Essentials", priority: "essential" },
    ];
    const vehicleGear: GearItem[] = [
      { name: "Vehicle Sleeping Setup", priority: "essential" },
      { name: "Power", priority: isRemote || isLong ? "essential" : "recommended" },
      { name: "Cooking", priority: duration === "overnight" ? "recommended" : "essential" },
      { name: "Food Storage", priority: isLong || isLargeCrew ? "essential" : "recommended" },
      { name: "Water Storage", priority: isRemote || isLong || isLargeCrew ? "essential" : "recommended" },
      { name: "Camp Lighting", priority: "recommended" },
      { name: "Storage & Organization", priority: isCityCar ? "essential" : "recommended" },
      { name: "Shelter", priority: trip === "basecamp" ? "essential" : "recommended" },
      { name: "Camp Furniture", priority: trip === "basecamp" ? "recommended" : "optional" },
    ];
    const safety: GearItem[] = [
      { name: "First Aid", priority: "essential" },
      { name: "Fire Safety", priority: "essential" },
      { name: "Tire & Repair", priority: "essential" },
      { name: "Vehicle Recovery", priority: isRemote ? "essential" : "recommended" },
      { name: "Jump Start / Backup Power", priority: "recommended" },
      { name: "Navigation", priority: isRemote ? "essential" : "recommended" },
      { name: "Emergency Communication", priority: isRemote ? "essential" : "optional" },
      { name: "Emergency Water & Food", priority: isRemote || isLong ? "essential" : "recommended" },
    ];
    return { personal, vehicle: vehicleGear, safety };
  }, [vehicle, trip, people, duration]);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    Object.values(gearSystem).flat().forEach(item => { initial[item.name] = true; });
    setSelectedItems(initial);
  }, [gearSystem]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setActiveSystem(null); setShowFinalSystem(false); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const canOpen = (key: GearSystemKey) => key === "personal" || (key === "vehicle" && reviewed.personal) || (key === "safety" && reviewed.vehicle);
  const openChecklist = (key: GearSystemKey) => { if (canOpen(key)) { setShowFinalSystem(false); setActiveSystem(key); } };
  const toggleItem = (name: string) => setSelectedItems(s => ({ ...s, [name]: !(s[name] ?? true) }));
  const isSelected = (name: string) => selectedItems[name] ?? true;
  const selectedFor = (key: GearSystemKey) => gearSystem[key].filter(i => isSelected(i.name));
  const counts = { personal: selectedFor("personal").length, vehicle: selectedFor("vehicle").length, safety: selectedFor("safety").length };
  const totalAvailable = gearSystem.personal.length + gearSystem.vehicle.length + gearSystem.safety.length;
  const totalSelected = counts.personal + counts.vehicle + counts.safety;
  const allSelected = [...selectedFor("personal"), ...selectedFor("vehicle"), ...selectedFor("safety")];
  const priorityCount = (p: Priority) => allSelected.filter(i => i.priority === p).length;

  const advance = () => {
    if (!activeSystem) return;
    setReviewed(r => ({ ...r, [activeSystem]: true }));
    if (activeSystem === "personal") setActiveSystem("vehicle");
    else if (activeSystem === "vehicle") setActiveSystem("safety");
    else { setActiveSystem(null); setShowFinalSystem(true); }
  };

  const tripSummary = <div className="gearroom-checklist-trip"><span>{vehicleLabels[vehicle]}</span><i>•</i><span>{tripLabels[trip]}</span><i>•</i><span>{crewLabels[crew]}</span><i>•</i><span>{people} {people === 1 ? "PERSON" : "PEOPLE"}</span><i>•</i><span>{durationLabels[duration]}</span></div>;

  const renderRows = (key: GearSystemKey, interactive = true) => selectedFor(key).map((item, index) => (
    <div key={`${key}-${item.name}`} className="gearroom-checklist-row is-checked">
      <span className="gearroom-check-box">✓</span>
      <span className="gearroom-check-name"><small>{String(index + 1).padStart(2, "0")}</small>{item.name}</span>
      <strong className={`gearroom-priority ${item.priority}`}>{item.priority.toUpperCase()}</strong>
    </div>
  ));

  if (!ready) return <main className="gearroom-page"><div className="gearroom-loading" /></main>;

  const currentItems = activeSystem ? gearSystem[activeSystem] : [];
  const nextLabel = activeSystem === "personal" ? "NEXT: VEHICLE & CAMP →" : activeSystem === "vehicle" ? "NEXT: SAFETY & EMERGENCY →" : "BUILD MY GEAR SYSTEM →";

  return <main className="gearroom-page"><section className="gearroom-stage">
    <img src="/gear-room-v2.jpg" alt="RoamLab Gear Room" className="gearroom-bg" draggable={false} />

    <div className="gearroom-trip-fields">
      <div className="gearroom-trip-value gearroom-trip-vehicle">{vehicleLabels[vehicle]}</div>
      <div className="gearroom-trip-value gearroom-trip-style">{tripLabels[trip]}</div>
      <div className="gearroom-trip-value gearroom-trip-crew">{crewLabels[crew]}</div>
      <div className="gearroom-trip-value gearroom-trip-people">{people}</div>
      <div className="gearroom-trip-value gearroom-trip-duration">{durationLabels[duration]}</div>
    </div>

    <button type="button" className="gearroom-zone gearroom-personal" onClick={() => openChecklist("personal")} aria-label="Open Personal Gear Checklist" />
    <button type="button" className="gearroom-zone gearroom-vehicle" onClick={() => openChecklist("vehicle")} aria-label="Open Vehicle and Camp Gear Checklist" />
    <button type="button" className="gearroom-zone gearroom-safety" onClick={() => openChecklist("safety")} aria-label="Open Safety and Emergency Checklist" />

    <Link className="gearroom-back" href={`/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${crew}&people=${people}`}>← DURATION</Link>
    <div className="gearroom-progress"><div className="gearroom-progress-inner">
      <Link href="/ways-in/drive" className="gearroom-step done"><span>✓</span>VEHICLE</Link><i />
      <Link href={`/ways-in/drive/setup?vehicle=${vehicle}`} className="gearroom-step done"><span>✓</span>TRIP STYLE</Link><i />
      <Link href={`/ways-in/drive/crew?vehicle=${vehicle}&trip=${trip}`} className="gearroom-step done"><span>✓</span>CREW</Link><i />
      <Link href={`/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${crew}&people=${people}`} className="gearroom-step done"><span>✓</span>DURATION</Link><i />
      <div className="gearroom-step current"><span>5</span>GEAR</div>
    </div></div>

    {activeSystem && <div className="gearroom-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setActiveSystem(null); }}>
      <section className="gearroom-checklist" role="dialog" aria-modal="true">
        <button type="button" className="gearroom-checklist-close" onClick={() => setActiveSystem(null)} aria-label="Close checklist">×</button>
        <header className="gearroom-checklist-header">
          <div className="gearroom-checklist-brand">ROAMLAB</div>
          <div className="gearroom-checklist-kicker">EXPEDITION GEAR CHECKLIST · STEP {stepNumber[activeSystem]} OF 3</div>
          <h1>{systemTitles[activeSystem]}</h1>{tripSummary}
        </header>
        <div className="gearroom-checklist-body">
          <div className="gearroom-checklist-column-head"><span>INCLUDE</span><span>GEAR CATEGORY</span><span>PRIORITY</span></div>
          <div className="gearroom-checklist-items">{currentItems.map((item, index) => {
            const checked = isSelected(item.name);
            return <button type="button" key={item.name} className={`gearroom-checklist-row ${checked ? "is-checked" : ""}`} onClick={() => toggleItem(item.name)}>
              <span className="gearroom-check-box">{checked ? "✓" : ""}</span>
              <span className="gearroom-check-name"><small>{String(index + 1).padStart(2, "0")}</small>{item.name}</span>
              <strong className={`gearroom-priority ${item.priority}`}>{item.priority.toUpperCase()}</strong>
            </button>;
          })}</div>
        </div>
        <div className="gearroom-checklist-summary">
          <div><strong>{counts.personal}/{gearSystem.personal.length}</strong><span>PERSONAL</span></div>
          <div><strong>{counts.vehicle}/{gearSystem.vehicle.length}</strong><span>VEHICLE</span></div>
          <div><strong>{counts.safety}/{gearSystem.safety.length}</strong><span>SAFETY</span></div>
          <div><strong>{totalSelected}/{totalAvailable}</strong><span>TOTAL</span></div>
        </div>
        <footer className="gearroom-checklist-footer">
          <div className="gearroom-checklist-note">STEP {stepNumber[activeSystem]} OF 3 · Review the categories for this part of your trip system, then continue.</div>
          <button type="button" className="gearroom-checklist-build" onClick={advance}>{nextLabel}</button>
        </footer>
      </section>
    </div>}

    {showFinalSystem && <div className="gearroom-modal-backdrop gearroom-final-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowFinalSystem(false); }}>
      <section className="gearroom-checklist gearroom-final-system" role="dialog" aria-modal="true" aria-label="Your Gear System">
        <button type="button" className="gearroom-checklist-close" onClick={() => setShowFinalSystem(false)} aria-label="Close Gear System">×</button>
        <header className="gearroom-checklist-header"><div className="gearroom-checklist-brand">ROAMLAB</div><div className="gearroom-checklist-kicker">EXPEDITION GEAR SYSTEM</div><h1>YOUR GEAR SYSTEM</h1>{tripSummary}</header>
        <div className="gearroom-checklist-body gearroom-final-body">
          {(["personal","vehicle","safety"] as GearSystemKey[]).map(key => <section className="gearroom-final-section" key={key}>
            <div className="gearroom-final-section-head"><strong>{systemTitles[key]}</strong><span>{selectedFor(key).length} / {gearSystem[key].length}</span></div>
            <div className="gearroom-checklist-items">{renderRows(key, false)}</div>
          </section>)}
        </div>
        <div className="gearroom-checklist-summary">
          <div><strong>{totalSelected}</strong><span>CATEGORIES</span></div>
          <div><strong>{priorityCount("essential")}</strong><span>ESSENTIAL</span></div>
          <div><strong>{priorityCount("recommended")}</strong><span>RECOMMENDED</span></div>
          <div><strong>{priorityCount("optional")}</strong><span>OPTIONAL</span></div>
        </div>
        <footer className="gearroom-checklist-footer"><div className="gearroom-checklist-note">Your three expedition checklists are now combined into one complete Gear System.</div><button type="button" className="gearroom-checklist-build is-built" onClick={() => setShowFinalSystem(false)}>✓ GEAR SYSTEM BUILT</button></footer>
      </section>
    </div>}
  </section></main>;
}
