"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   LABELS
============================================================ */

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

/* ============================================================
   PARAM VALIDATION
============================================================ */

function isVehicleKey(
  value: string | null
): value is VehicleKey {
  return (
    value === "suv" ||
    value === "truck" ||
    value === "van" ||
    value === "crossover" ||
    value === "city"
  );
}

function isTripKey(
  value: string | null
): value is TripKey {
  return (
    value === "weekend" ||
    value === "road-trip" ||
    value === "basecamp" ||
    value === "remote"
  );
}

function isCrewKey(
  value: string | null
): value is CrewKey {
  return (
    value === "solo" ||
    value === "couple" ||
    value === "family" ||
    value === "friends"
  );
}

function isDurationKey(
  value: string | null
): value is DurationKey {
  return (
    value === "overnight" ||
    value === "weekend" ||
    value === "multi-day" ||
    value === "extended"
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function GearPage() {
  /* ==========================================================
     PLANNER DATA
  ========================================================== */

  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [trip, setTrip] =
    useState<TripKey>("weekend");

  const [crew, setCrew] =
    useState<CrewKey>("couple");

  const [people, setPeople] =
    useState<number>(2);

  const [duration, setDuration] =
    useState<DurationKey>("weekend");

  const [ready, setReady] =
    useState(false);

  /* ==========================================================
     CHECKLIST STATE
  ========================================================== */

  const [activeSystem, setActiveSystem] =
    useState<GearSystemKey | null>(null);

  const [selectedItems, setSelectedItems] =
    useState<Record<string, boolean>>({});

  /*
    Final combined Gear System modal
  */

  const [showFinalSystem, setShowFinalSystem] =
    useState(false);

  /* ==========================================================
     READ URL PARAMS
  ========================================================== */

  useEffect(() => {
    const params =
      new URLSearchParams(window.location.search);

    const vehicleParam =
      params.get("vehicle");

    const tripParam =
      params.get("trip");

    const crewParam =
      params.get("crew");

    const peopleParam =
      params.get("people");

    const durationParam =
      params.get("duration");

    if (isVehicleKey(vehicleParam)) {
      setVehicle(vehicleParam);
    }

    if (isTripKey(tripParam)) {
      setTrip(tripParam);
    }

    if (isCrewKey(crewParam)) {
      setCrew(crewParam);
    }

    if (isDurationKey(durationParam)) {
      setDuration(durationParam);
    }

    if (peopleParam) {
      const parsedPeople =
        Number(peopleParam);

      if (
        Number.isFinite(parsedPeople) &&
        parsedPeople > 0
      ) {
        setPeople(parsedPeople);
      }
    }

    setReady(true);
  }, []);

  /* ==========================================================
     GEAR LOGIC
  ========================================================== */

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

    /* PERSONAL */

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

    /* VEHICLE & CAMP */

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

    /* SAFETY */

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

  /* ==========================================================
     INITIAL SELECTION

     Initially all recommended categories are selected.
  ========================================================== */

  useEffect(() => {
    const initial: Record<string, boolean> = {};

    Object.values(gearSystem)
      .flat()
      .forEach((item) => {
        initial[item.name] = true;
      });

    setSelectedItems(initial);
  }, [gearSystem]);

  /* ==========================================================
     ESC CLOSE
  ========================================================== */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setActiveSystem(null);
        setShowFinalSystem(false);
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

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const openChecklist = (
    system: GearSystemKey
  ) => {
    setShowFinalSystem(false);
    setActiveSystem(system);
  };

  const closeChecklist = () => {
    setActiveSystem(null);
  };

  const toggleItem = (
    itemName: string
  ) => {
    setSelectedItems((current) => ({
      ...current,
      [itemName]:
        !(current[itemName] ?? true),
    }));
  };

  const buildGearSystem = () => {
    /*
      Close individual checklist and open
      combined final Gear System.
    */

    setActiveSystem(null);
    setShowFinalSystem(true);
  };

  const closeFinalSystem = () => {
    setShowFinalSystem(false);
  };

  /* ==========================================================
     HELPERS
  ========================================================== */

  const isSelected = (
    itemName: string
  ) =>
    selectedItems[itemName] ?? true;

  const selectedForSystem = (
    key: GearSystemKey
  ) =>
    gearSystem[key].filter(
      (item) =>
        isSelected(item.name)
    );

  /* ==========================================================
     CURRENT CHECKLIST
  ========================================================== */

  const currentItems =
    activeSystem
      ? gearSystem[activeSystem]
      : [];

  const currentSelectedCount =
    currentItems.filter(
      (item) =>
        isSelected(item.name)
    ).length;

  /* ==========================================================
     THREE CHECKLIST COUNTS
  ========================================================== */

  const personalSelected =
    selectedForSystem("personal");

  const vehicleSelected =
    selectedForSystem("vehicle");

  const safetySelected =
    selectedForSystem("safety");

  const personalCount =
    personalSelected.length;

  const vehicleCount =
    vehicleSelected.length;

  const safetyCount =
    safetySelected.length;

  const totalSelected =
    personalCount +
    vehicleCount +
    safetyCount;

  const totalAvailable =
    gearSystem.personal.length +
    gearSystem.vehicle.length +
    gearSystem.safety.length;

  /* ==========================================================
     FINAL SYSTEM ITEMS
  ========================================================== */

  const allSelectedItems = [
    ...personalSelected,
    ...vehicleSelected,
    ...safetySelected,
  ];

  const totalEssential =
    allSelectedItems.filter(
      (item) =>
        item.priority ===
        "essential"
    ).length;

  const totalRecommended =
    allSelectedItems.filter(
      (item) =>
        item.priority ===
        "recommended"
    ).length;

  const totalOptional =
    allSelectedItems.filter(
      (item) =>
        item.priority ===
        "optional"
    ).length;

  /* ==========================================================
     DISPLAY
  ========================================================== */

  const peopleShort =
    String(people);

  const peopleLong =
    `${people} ${
      people === 1
        ? "PERSON"
        : "PEOPLE"
    }`;

  if (!ready) {
    return (
      <main className="gearroom-page">
        <div className="gearroom-loading" />
      </main>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="gearroom-page">

      <section className="gearroom-stage">

        {/* ====================================================
            BACKGROUND
        ==================================================== */}

        <img
          src="/gear-room-v2.jpg"
          alt="RoamLab Gear Room"
          className="gearroom-bg"
          draggable={false}
        />

        {/* ====================================================
            TRIP SETUP — DYNAMIC DATA
        ==================================================== */}

        <div className="gearroom-trip-fields">

          <div className="gearroom-trip-value gearroom-trip-vehicle">
            {vehicleLabels[vehicle]}
          </div>

          <div className="gearroom-trip-value gearroom-trip-style">
            {tripLabels[trip]}
          </div>

          <div className="gearroom-trip-value gearroom-trip-crew">
            {crewLabels[crew]}
          </div>

          <div className="gearroom-trip-value gearroom-trip-people">
            {peopleShort}
          </div>

          <div className="gearroom-trip-value gearroom-trip-duration">
            {durationLabels[duration]}
          </div>

        </div>

        {/* ====================================================
            THREE GEAR HOTSPOTS
        ==================================================== */}

        <button
          type="button"
          className="gearroom-zone gearroom-personal"
          onClick={() =>
            openChecklist("personal")
          }
          aria-label="Open Personal Gear Checklist"
        />

        <button
          type="button"
          className="gearroom-zone gearroom-vehicle"
          onClick={() =>
            openChecklist("vehicle")
          }
          aria-label="Open Vehicle and Camp Gear Checklist"
        />

        <button
          type="button"
          className="gearroom-zone gearroom-safety"
          onClick={() =>
            openChecklist("safety")
          }
          aria-label="Open Safety and Emergency Checklist"
        />

        {/* ====================================================
            BACK TO DURATION
        ==================================================== */}

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

        {/* ====================================================
            BOTTOM PROGRESS
        ==================================================== */}

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

        {/* ====================================================
            INDIVIDUAL CHECKLIST MODAL
        ==================================================== */}

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

              {/* CLOSE */}

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
                    {peopleLong}
                  </span>

                  <i>•</i>

                  <span>
                    {durationLabels[duration]}
                  </span>

                </div>

              </header>

              {/* =================================================
                  CHECKLIST
              ================================================= */}

              <div className="gearroom-checklist-body">

                <div className="gearroom-checklist-column-head">

                  <span>INCLUDE</span>

                  <span>
                    GEAR CATEGORY
                  </span>

                  <span>PRIORITY</span>

                </div>

                <div className="gearroom-checklist-items">

                  {currentItems.map(
                    (
                      item,
                      index
                    ) => {
                      const checked =
                        isSelected(
                          item.name
                        );

                      return (
                        <button
                          type="button"
                          key={
                            item.name
                          }
                          className={`gearroom-checklist-row ${
                            checked
                              ? "is-checked"
                              : ""
                          }`}
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
                                index +
                                  1
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

              {/* =================================================
                  OVERALL SYSTEM PROGRESS

                  This is the important new section:
                  it shows all THREE checklists together.
              ================================================= */}

              <div className="gearroom-checklist-summary">

                <div>
                  <strong>
                    {personalCount}/
                    {
                      gearSystem
                        .personal
                        .length
                    }
                  </strong>

                  <span>
                    PERSONAL
                  </span>
                </div>

                <div>
                  <strong>
                    {vehicleCount}/
                    {
                      gearSystem
                        .vehicle
                        .length
                    }
                  </strong>

                  <span>
                    VEHICLE
                  </span>
                </div>

                <div>
                  <strong>
                    {safetyCount}/
                    {
                      gearSystem
                        .safety
                        .length
                    }
                  </strong>

                  <span>
                    SAFETY
                  </span>
                </div>

                <div>
                  <strong>
                    {totalSelected}/
                    {totalAvailable}
                  </strong>

                  <span>
                    TOTAL
                  </span>
                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="gearroom-checklist-footer">

                <div className="gearroom-checklist-note">

                  <strong>
                    {currentSelectedCount}
                  </strong>
                  {" "}
                  categories selected in this checklist.
                  Your final Gear System combines
                  Personal, Vehicle & Camp, and Safety.

                </div>

                <button
                  type="button"
                  className="gearroom-checklist-build"
                  onClick={
                    buildGearSystem
                  }
                >
                  BUILD MY GEAR SYSTEM →
                </button>

              </footer>

            </section>

          </div>
        )}

        {/* ====================================================
            FINAL COMBINED GEAR SYSTEM
        ==================================================== */}

        {showFinalSystem && (
          <div
            className="gearroom-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeFinalSystem();
              }
            }}
          >

            <section
              className="gearroom-checklist"
              role="dialog"
              aria-modal="true"
              aria-label="Your Gear System"
            >

              {/* CLOSE */}

              <button
                type="button"
                className="gearroom-checklist-close"
                onClick={
                  closeFinalSystem
                }
                aria-label="Close Gear System"
              >
                ×
              </button>

              {/* =================================================
                  FINAL HEADER
              ================================================= */}

              <header className="gearroom-checklist-header">

                <div className="gearroom-checklist-brand">
                  ROAMLAB
                </div>

                <div className="gearroom-checklist-kicker">
                  EXPEDITION GEAR SYSTEM
                </div>

                <h1>
                  YOUR GEAR SYSTEM
                </h1>

                <div className="gearroom-checklist-trip">

                  <span>
                    {
                      vehicleLabels[
                        vehicle
                      ]
                    }
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
                    {peopleLong}
                  </span>

                  <i>•</i>

                  <span>
                    {
                      durationLabels[
                        duration
                      ]
                    }
                  </span>

                </div>

              </header>

              {/* =================================================
                  FINAL SYSTEM BODY
              ================================================= */}

              <div className="gearroom-checklist-body">

                {/* ===============================================
                    PERSONAL GEAR
                =============================================== */}

                <div className="gearroom-checklist-column-head">

                  <span>
                    ✓
                  </span>

                  <span>
                    PERSONAL GEAR
                  </span>

                  <span>
                    {personalCount}/
                    {
                      gearSystem
                        .personal
                        .length
                    }
                  </span>

                </div>

                <div className="gearroom-checklist-items">

                  {personalSelected.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          `final-personal-${item.name}`
                        }
                        className="gearroom-checklist-row is-checked"
                      >

                        <span className="gearroom-check-box">
                          ✓
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

                      </div>
                    )
                  )}

                </div>

                {/* ===============================================
                    VEHICLE & CAMP
                =============================================== */}

                <div className="gearroom-checklist-column-head">

                  <span>
                    ✓
                  </span>

                  <span>
                    VEHICLE & CAMP GEAR
                  </span>

                  <span>
                    {vehicleCount}/
                    {
                      gearSystem
                        .vehicle
                        .length
                    }
                  </span>

                </div>

                <div className="gearroom-checklist-items">

                  {vehicleSelected.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          `final-vehicle-${item.name}`
                        }
                        className="gearroom-checklist-row is-checked"
                      >

                        <span className="gearroom-check-box">
                          ✓
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

                      </div>
                    )
                  )}

                </div>

                {/* ===============================================
                    SAFETY
                =============================================== */}

                <div className="gearroom-checklist-column-head">

                  <span>
                    ✓
                  </span>

                  <span>
                    SAFETY & EMERGENCY
                  </span>

                  <span>
                    {safetyCount}/
                    {
                      gearSystem
                        .safety
                        .length
                    }
                  </span>

                </div>

                <div className="gearroom-checklist-items">

                  {safetySelected.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          `final-safety-${item.name}`
                        }
                        className="gearroom-checklist-row is-checked"
                      >

                        <span className="gearroom-check-box">
                          ✓
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

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  FINAL TOTALS
              ================================================= */}

              <div className="gearroom-checklist-summary">

                <div>
                  <strong>
                    {totalSelected}
                  </strong>

                  <span>
                    CATEGORIES
                  </span>
                </div>

                <div>
                  <strong>
                    {totalEssential}
                  </strong>

                  <span>
                    ESSENTIAL
                  </span>
                </div>

                <div>
                  <strong>
                    {totalRecommended}
                  </strong>

                  <span>
                    RECOMMENDED
                  </span>
                </div>

                <div>
                  <strong>
                    {totalOptional}
                  </strong>

                  <span>
                    OPTIONAL
                  </span>
                </div>

              </div>

              {/* =================================================
                  FINAL FOOTER
              ================================================= */}

              <footer className="gearroom-checklist-footer">

                <div className="gearroom-checklist-note">

                  Your three expedition checklists
                  have been combined into one
                  complete Gear System.

                </div>

                <button
                  type="button"
                  className="gearroom-checklist-build is-built"
                  onClick={
                    closeFinalSystem
                  }
                >
                  ✓ GEAR SYSTEM BUILT
                </button>

              </footer>

            </section>

          </div>
        )}

      </section>

    </main>
  );
}
