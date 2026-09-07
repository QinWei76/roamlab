"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type VehicleKey =
  | "suv"
  | "truck"
  | "van"
  | "crossover"
  | "city";

type TripKey =
  | "weekend"
  | "road-trip"
  | "basecamp"
  | "remote";

type CrewKey =
  | "solo"
  | "couple"
  | "family"
  | "friends";

type DurationKey =
  | "overnight"
  | "weekend"
  | "multi-day"
  | "extended";

type Priority =
  | "essential"
  | "recommended"
  | "optional";

type GearSystemKey =
  | "personal"
  | "vehicle"
  | "safety";

type GearItem = {
  name: string;
  priority: Priority;
};

const vehicleLabels: Record<VehicleKey, string> = {
  suv: "SUV",
  truck: "TRUCK",
  van: "VAN",
  crossover: "CROSSOVER / AWD",
  city: "2WD / CITY CAR",
};

const tripLabels: Record<TripKey, string> = {
  weekend: "WEEKEND ESCAPE",
  "road-trip": "ROAD TRIP",
  basecamp: "BASECAMP",
  remote: "REMOTE / OFF-GRID",
};

const crewLabels: Record<CrewKey, string> = {
  solo: "SOLO",
  couple: "COUPLE",
  family: "FAMILY",
  friends: "FRIENDS",
};

const durationLabels: Record<DurationKey, string> = {
  overnight: "1 NIGHT",
  weekend: "2–3 NIGHTS",
  "multi-day": "4–7 NIGHTS",
  extended: "8+ NIGHTS",
};

const systemTitles: Record<GearSystemKey, string> = {
  personal: "PERSONAL GEAR",
  vehicle: "VEHICLE & CAMP GEAR",
  safety: "SAFETY & EMERGENCY",
};

export default function GearPage() {
  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [trip, setTrip] =
    useState<TripKey>("weekend");

  const [crew, setCrew] =
    useState<CrewKey>("couple");

  const [people, setPeople] =
    useState(2);

  const [duration, setDuration] =
    useState<DurationKey>("weekend");

  const [ready, setReady] =
    useState(false);

  const [activeSystem, setActiveSystem] =
    useState<GearSystemKey | null>(null);

  const [selectedItems, setSelectedItems] =
    useState<Record<string, boolean>>({});

  const [systemBuilt, setSystemBuilt] =
    useState(false);

  /* =========================================================
     READ USER PLANNER CHOICES
  ========================================================= */

  useEffect(() => {
    const params =
      new URLSearchParams(window.location.search);

    const vehicleValue =
      params.get("vehicle");

    const tripValue =
      params.get("trip");

    const crewValue =
      params.get("crew");

    const peopleValue =
      params.get("people");

    const durationValue =
      params.get("duration");

    if (
      vehicleValue === "suv" ||
      vehicleValue === "truck" ||
      vehicleValue === "van" ||
      vehicleValue === "crossover" ||
      vehicleValue === "city"
    ) {
      setVehicle(vehicleValue);
    }

    if (
      tripValue === "weekend" ||
      tripValue === "road-trip" ||
      tripValue === "basecamp" ||
      tripValue === "remote"
    ) {
      setTrip(tripValue);
    }

    if (
      crewValue === "solo" ||
      crewValue === "couple" ||
      crewValue === "family" ||
      crewValue === "friends"
    ) {
      setCrew(crewValue);
    }

    const parsedPeople =
      Number(peopleValue);

    if (
      Number.isFinite(parsedPeople) &&
      parsedPeople > 0
    ) {
      setPeople(parsedPeople);
    }

    if (
      durationValue === "overnight" ||
      durationValue === "weekend" ||
      durationValue === "multi-day" ||
      durationValue === "extended"
    ) {
      setDuration(durationValue);
    }

    setReady(true);
  }, []);

  /* =========================================================
     GEAR RECOMMENDATION LOGIC
  ========================================================= */

  const gearSystem = useMemo(() => {
    const isRemote =
      trip === "remote";

    const isLong =
      duration === "multi-day" ||
      duration === "extended";

    const isLargeCrew =
      people >= 4;

    const isCityCar =
      vehicle === "city";

    const personal: GearItem[] = [
      {
        name: "Sleeping System",
        priority: "essential",
      },
      {
        name: "Clothing Layers",
        priority: "essential",
      },
      {
        name: "Personal Lighting",
        priority: isRemote
          ? "essential"
          : "recommended",
      },
      {
        name: "Water & Hydration",
        priority: "essential",
      },
      {
        name: "Hygiene Kit",
        priority: isLong
          ? "essential"
          : "recommended",
      },
      {
        name: "Personal Essentials",
        priority: "essential",
      },
    ];

    const vehicleGear: GearItem[] = [
      {
        name: "Vehicle Sleeping Setup",
        priority: "essential",
      },
      {
        name: "Power",
        priority:
          isRemote || isLong
            ? "essential"
            : "recommended",
      },
      {
        name: "Cooking",
        priority:
          duration === "overnight"
            ? "recommended"
            : "essential",
      },
      {
        name: "Food Storage",
        priority:
          isLong || isLargeCrew
            ? "essential"
            : "recommended",
      },
      {
        name: "Water Storage",
        priority:
          isRemote ||
          isLong ||
          isLargeCrew
            ? "essential"
            : "recommended",
      },
      {
        name: "Camp Lighting",
        priority: "recommended",
      },
      {
        name: "Storage & Organization",
        priority: isCityCar
          ? "essential"
          : "recommended",
      },
      {
        name: "Shelter",
        priority:
          trip === "basecamp"
            ? "essential"
            : "recommended",
      },
      {
        name: "Camp Furniture",
        priority:
          trip === "basecamp"
            ? "recommended"
            : "optional",
      },
    ];

    const safety: GearItem[] = [
      {
        name: "First Aid",
        priority: "essential",
      },
      {
        name: "Fire Safety",
        priority: "essential",
      },
      {
        name: "Tire & Repair",
        priority: "essential",
      },
      {
        name: "Vehicle Recovery",
        priority: isRemote
          ? "essential"
          : "recommended",
      },
      {
        name: "Jump Start / Backup Power",
        priority: "recommended",
      },
      {
        name: "Navigation",
        priority: isRemote
          ? "essential"
          : "recommended",
      },
      {
        name: "Emergency Communication",
        priority: isRemote
          ? "essential"
          : "optional",
      },
      {
        name: "Emergency Water & Food",
        priority:
          isRemote || isLong
            ? "essential"
            : "recommended",
      },
    ];

    return {
      personal,
      vehicle: vehicleGear,
      safety,
    };
  }, [
    vehicle,
    trip,
    people,
    duration,
  ]);

  /* =========================================================
     DEFAULT CHECKLIST STATE
  ========================================================= */

  useEffect(() => {
    const initialSelection: Record<
      string,
      boolean
    > = {};

    Object.values(gearSystem)
      .flat()
      .forEach((item) => {
        initialSelection[item.name] = true;
      });

    setSelectedItems(initialSelection);
  }, [gearSystem]);

  /* ESC closes checklist */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setActiveSystem(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const toggleItem = (
    itemName: string
  ) => {
    setSelectedItems((current) => ({
      ...current,
      [itemName]:
        !current[itemName],
    }));

    setSystemBuilt(false);
  };

  const openChecklist = (
    system: GearSystemKey
  ) => {
    setActiveSystem(system);
    setSystemBuilt(false);
  };

  const closeChecklist = () => {
    setActiveSystem(null);
    setSystemBuilt(false);
  };

  const buildGearSystem = () => {
    setSystemBuilt(true);
  };

  const peopleLabel =
    `${people}`;

  const peopleLongLabel =
    `${people} ${
      people === 1
        ? "PERSON"
        : "PEOPLE"
    }`;

  const currentItems =
    activeSystem
      ? gearSystem[activeSystem]
      : [];

  const currentSelectedCount =
    currentItems.filter(
      (item) =>
        selectedItems[item.name]
    ).length;

  const essentialCount =
    currentItems.filter(
      (item) =>
        item.priority === "essential"
    ).length;

  const recommendedCount =
    currentItems.filter(
      (item) =>
        item.priority === "recommended"
    ).length;

  const optionalCount =
    currentItems.filter(
      (item) =>
        item.priority === "optional"
    ).length;

  if (!ready) {
    return (
      <main className="gearroom-page">
        <div className="gearroom-loading" />
      </main>
    );
  }

  return (
    <main className="gearroom-page">

      <section className="gearroom-stage">

        {/* =====================================================
            NEW BACKGROUND IMAGE
        ===================================================== */}

        <img
          src="/gear-room-v2.jpg"
          alt="RoamLab Gear Room"
          className="gearroom-bg"
          draggable={false}
        />

        {/* =====================================================
            DYNAMIC TRIP SETUP

            These five values sit inside the five blank boxes
            baked into gear-room-v2.jpg.

            No second summary line.
        ===================================================== */}

        <div
          style={{
            position: "absolute",
            zIndex: 14,
            top: "14.2%",
            left: "15.9%",
            width: "52.4%",
            height: "6.7%",
            pointerEvents: "none",
          }}
        >

          {/* VEHICLE */}

          <div
            style={{
              position: "absolute",
              left: "0%",
              top: 0,
              width: "18%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "34px",
            }}
          >
            <span
              style={{
                color: "#f1eadf",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: ".04em",
                textShadow:
                  "0 2px 6px rgba(0,0,0,.95)",
                whiteSpace: "nowrap",
              }}
            >
              {vehicleLabels[vehicle]}
            </span>
          </div>

          {/* TRIP STYLE */}

          <div
            style={{
              position: "absolute",
              left: "18%",
              top: 0,
              width: "25%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "36px",
            }}
          >
            <span
              style={{
                color: "#f1eadf",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: ".025em",
                textShadow:
                  "0 2px 6px rgba(0,0,0,.95)",
                whiteSpace: "nowrap",
              }}
            >
              {tripLabels[trip]}
            </span>
          </div>

          {/* CREW */}

          <div
            style={{
              position: "absolute",
              left: "43%",
              top: 0,
              width: "18%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "32px",
            }}
          >
            <span
              style={{
                color: "#f1eadf",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: ".04em",
                textShadow:
                  "0 2px 6px rgba(0,0,0,.95)",
                whiteSpace: "nowrap",
              }}
            >
              {crewLabels[crew]}
            </span>
          </div>

          {/* PEOPLE */}

          <div
            style={{
              position: "absolute",
              left: "61%",
              top: 0,
              width: "18%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "26px",
            }}
          >
            <span
              style={{
                color: "#f1eadf",
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: ".04em",
                textShadow:
                  "0 2px 6px rgba(0,0,0,.95)",
                whiteSpace: "nowrap",
              }}
            >
              {peopleLabel}
            </span>
          </div>

          {/* DURATION */}

          <div
            style={{
              position: "absolute",
              left: "79%",
              top: 0,
              width: "21%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "28px",
            }}
          >
            <span
              style={{
                color: "#f1eadf",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: ".03em",
                textShadow:
                  "0 2px 6px rgba(0,0,0,.95)",
                whiteSpace: "nowrap",
              }}
            >
              {durationLabels[duration]}
            </span>
          </div>

        </div>

        {/* =====================================================
            THREE GEAR AREAS
        ===================================================== */}

        <button
          type="button"
          className={`gearroom-zone gearroom-personal ${
            activeSystem === "personal"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            openChecklist("personal")
          }
          aria-label="Open Personal Gear Checklist"
        />

        <button
          type="button"
          className={`gearroom-zone gearroom-vehicle ${
            activeSystem === "vehicle"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            openChecklist("vehicle")
          }
          aria-label="Open Vehicle and Camp Gear Checklist"
        />

        <button
          type="button"
          className={`gearroom-zone gearroom-safety ${
            activeSystem === "safety"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            openChecklist("safety")
          }
          aria-label="Open Safety and Emergency Checklist"
        />

        {/* =====================================================
            BACK
        ===================================================== */}

        <Link
          className="gearroom-back"
          href={
            `/ways-in/drive/duration` +
            `?vehicle=${vehicle}` +
            `&trip=${trip}` +
            `&crew=${crew}` +
            `&people=${people}`
          }
        >
          ← DURATION
        </Link>

        {/* =====================================================
            BOTTOM PROGRESS
        ===================================================== */}

        <div className="gearroom-progress">

          <div className="gearroom-progress-inner">

            <Link
              href="/ways-in/drive"
              className="gearroom-step done"
            >
              <span>✓</span>
              VEHICLE
            </Link>

            <i />

            <Link
              href={
                `/ways-in/drive/setup` +
                `?vehicle=${vehicle}`
              }
              className="gearroom-step done"
            >
              <span>✓</span>
              TRIP STYLE
            </Link>

            <i />

            <Link
              href={
                `/ways-in/drive/crew` +
                `?vehicle=${vehicle}` +
                `&trip=${trip}`
              }
              className="gearroom-step done"
            >
              <span>✓</span>
              CREW
            </Link>

            <i />

            <Link
              href={
                `/ways-in/drive/duration` +
                `?vehicle=${vehicle}` +
                `&trip=${trip}` +
                `&crew=${crew}` +
                `&people=${people}`
              }
              className="gearroom-step done"
            >
              <span>✓</span>
              DURATION
            </Link>

            <i />

            <div className="gearroom-step current">
              <span>5</span>
              GEAR
            </div>

          </div>

        </div>

        {/* =====================================================
            PROFESSIONAL CHECKLIST MODAL
        ===================================================== */}

        {activeSystem && (
          <div
            className="gearroom-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeChecklist();
              }
            }}
          >

            <section
              className="gearroom-checklist"
              role="dialog"
              aria-modal="true"
              aria-label={`${systemTitles[activeSystem]} checklist`}
            >

              <button
                type="button"
                className="gearroom-checklist-close"
                onClick={closeChecklist}
                aria-label="Close checklist"
              >
                ×
              </button>

              {/* HEADER */}

              <header className="gearroom-checklist-header">

                <div className="gearroom-checklist-brand">
                  ROAMLAB
                </div>

                <div className="gearroom-checklist-kicker">
                  EXPEDITION GEAR CHECKLIST
                </div>

                <h1>
                  {systemTitles[activeSystem]}
                </h1>

                <div className="gearroom-checklist-trip">

                  <span>
                    {vehicleLabels[vehicle]}
                  </span>

                  <i>•</i>

                  <span>
                    {tripLabels[trip]}
                  </span>

                  <i>•</i>

                  <span>
                    {crewLabels[crew]}
                  </span>

                  <i>•</i>

                  <span>
                    {peopleLongLabel}
                  </span>

                  <i>•</i>

                  <span>
                    {durationLabels[duration]}
                  </span>

                </div>

              </header>

              {/* LIST */}

              <div className="gearroom-checklist-body">

                <div className="gearroom-checklist-column-head">

                  <span>INCLUDE</span>
                  <span>GEAR CATEGORY</span>
                  <span>PRIORITY</span>

                </div>

                <div className="gearroom-checklist-items">

                  {currentItems.map(
                    (item, index) => {

                      const checked =
                        selectedItems[item.name] ??
                        true;

                      return (
                        <button
                          type="button"
                          className={`gearroom-checklist-row ${
                            checked
                              ? "is-checked"
                              : ""
                          }`}
                          key={item.name}
                          onClick={() =>
                            toggleItem(
                              item.name
                            )
                          }
                        >

                          <span className="gearroom-check-box">
                            {checked
                              ? "✓"
                              : ""}
                          </span>

                          <span className="gearroom-check-name">

                            <small>
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </small>

                            {item.name}

                          </span>

                          <strong
                            className={`gearroom-priority ${item.priority}`}
                          >
                            {item.priority.toUpperCase()}
                          </strong>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* SUMMARY */}

              <div className="gearroom-checklist-summary">

                <div>
                  <strong>
                    {currentSelectedCount}
                  </strong>
                  <span>
                    SELECTED
                  </span>
                </div>

                <div>
                  <strong>
                    {essentialCount}
                  </strong>
                  <span>
                    ESSENTIAL
                  </span>
                </div>

                <div>
                  <strong>
                    {recommendedCount}
                  </strong>
                  <span>
                    RECOMMENDED
                  </span>
                </div>

                <div>
                  <strong>
                    {optionalCount}
                  </strong>
                  <span>
                    OPTIONAL
                  </span>
                </div>

              </div>

              {/* FOOTER */}

              <footer className="gearroom-checklist-footer">

                <div className="gearroom-checklist-note">
                  Review the categories for your trip,
                  then build your complete gear system.
                </div>

                <button
                  type="button"
                  className={`gearroom-checklist-build ${
                    systemBuilt
                      ? "is-built"
                      : ""
                  }`}
                  onClick={buildGearSystem}
                >
                  {systemBuilt
                    ? "✓ GEAR SYSTEM BUILT"
                    : "BUILD MY GEAR SYSTEM →"}
                </button>

              </footer>

            </section>

          </div>
        )}

      </section>

    </main>
  );
}
