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
   DISPLAY LABELS
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
   VALIDATION HELPERS
============================================================ */

function isVehicleKey(value: string | null): value is VehicleKey {
  return (
    value === "suv" ||
    value === "truck" ||
    value === "van" ||
    value === "crossover" ||
    value === "city"
  );
}

function isTripKey(value: string | null): value is TripKey {
  return (
    value === "weekend" ||
    value === "road-trip" ||
    value === "basecamp" ||
    value === "remote"
  );
}

function isCrewKey(value: string | null): value is CrewKey {
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
  /* ----------------------------------------------------------
     PLANNER STATE
  ---------------------------------------------------------- */

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

  /* ----------------------------------------------------------
     GEAR ROOM STATE
  ---------------------------------------------------------- */

  const [activeSystem, setActiveSystem] =
    useState<GearSystemKey | null>(null);

  const [selectedItems, setSelectedItems] =
    useState<Record<string, boolean>>({});

  const [systemBuilt, setSystemBuilt] =
    useState(false);

  /* ==========================================================
     READ USER CHOICES FROM URL
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
     BUILD CATEGORY RECOMMENDATIONS
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

    /* --------------------------------------------------------
       PERSONAL GEAR
    -------------------------------------------------------- */

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

    /* --------------------------------------------------------
       VEHICLE & CAMP GEAR
    -------------------------------------------------------- */

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

    /* --------------------------------------------------------
       SAFETY & EMERGENCY
    -------------------------------------------------------- */

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
     DEFAULT ALL CHECKLIST ITEMS TO SELECTED
  ========================================================== */

  useEffect(() => {
    const initialSelection: Record<
      string,
      boolean
    > = {};

    Object.values(gearSystem)
      .flat()
      .forEach((item) => {
        initialSelection[item.name] =
          true;
      });

    setSelectedItems(
      initialSelection
    );
  }, [gearSystem]);

  /* ==========================================================
     ESC KEY CLOSES MODAL
  ========================================================== */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setActiveSystem(null);
        setSystemBuilt(false);
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
     INTERACTIONS
  ========================================================== */

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

  const toggleItem = (
    itemName: string
  ) => {
    setSelectedItems(
      (current) => ({
        ...current,
        [itemName]:
          !(current[itemName] ?? true),
      })
    );

    setSystemBuilt(false);
  };

  const buildGearSystem = () => {
    setSystemBuilt(true);
  };

  /* ==========================================================
     DISPLAY VALUES
  ========================================================== */

  const peopleShort =
    String(people);

  const peopleLong =
    `${people} ${
      people === 1
        ? "PERSON"
        : "PEOPLE"
    }`;

  const currentItems =
    activeSystem
      ? gearSystem[activeSystem]
      : [];

  const selectedCount =
    currentItems.filter(
      (item) =>
        selectedItems[item.name] ??
        true
    ).length;

  const essentialCount =
    currentItems.filter(
      (item) =>
        item.priority ===
        "essential"
    ).length;

  const recommendedCount =
    currentItems.filter(
      (item) =>
        item.priority ===
        "recommended"
    ).length;

  const optionalCount =
    currentItems.filter(
      (item) =>
        item.priority ===
        "optional"
    ).length;

  /* ==========================================================
     WAIT UNTIL URL PARAMETERS ARE READ
  ========================================================== */

  if (!ready) {
    return (
      <main className="gearroom-page">
        <div className="gearroom-loading" />
      </main>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <main className="gearroom-page">
      <section className="gearroom-stage">

        {/* ====================================================
            BACKGROUND IMAGE

            ACTUAL FILE:
            public/gear-room-v2.jpg
        ==================================================== */}

        <img
          src="/gear-room-v2.jpg"
          alt="RoamLab Gear Room"
          className="gearroom-bg"
          draggable={false}
        />

        {/* ====================================================
            DYNAMIC TRIP SETUP

            These are the actual choices from:
            Vehicle
            Trip Style
            Crew
            People
            Duration
        ==================================================== */}

        <div className="gearroom-trip-fields">

          <div
            className="
              gearroom-trip-value
              gearroom-trip-vehicle
            "
          >
            {vehicleLabels[vehicle]}
          </div>

          <div
            className="
              gearroom-trip-value
              gearroom-trip-style
            "
          >
            {tripLabels[trip]}
          </div>

          <div
            className="
              gearroom-trip-value
              gearroom-trip-crew
            "
          >
            {crewLabels[crew]}
          </div>

          <div
            className="
              gearroom-trip-value
              gearroom-trip-people
            "
          >
            {peopleShort}
          </div>

          <div
            className="
              gearroom-trip-value
              gearroom-trip-duration
            "
          >
            {durationLabels[duration]}
          </div>

        </div>

        {/* ====================================================
            CLICKABLE AREA 1
            PERSONAL GEAR
        ==================================================== */}

        <button
          type="button"
          className="
            gearroom-zone
            gearroom-personal
          "
          onClick={() =>
            openChecklist(
              "personal"
            )
          }
          aria-label="Open Personal Gear Checklist"
        />

        {/* ====================================================
            CLICKABLE AREA 2
            VEHICLE & CAMP GEAR
        ==================================================== */}

        <button
          type="button"
          className="
            gearroom-zone
            gearroom-vehicle
          "
          onClick={() =>
            openChecklist(
              "vehicle"
            )
          }
          aria-label="Open Vehicle and Camp Gear Checklist"
        />

        {/* ====================================================
            CLICKABLE AREA 3
            SAFETY & EMERGENCY
        ==================================================== */}

        <button
          type="button"
          className="
            gearroom-zone
            gearroom-safety
          "
          onClick={() =>
            openChecklist(
              "safety"
            )
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
            BOTTOM PLANNER PROGRESS
        ==================================================== */}

        <div className="gearroom-progress">

          <div className="gearroom-progress-inner">

            {/* VEHICLE */}

            <Link
              href="/ways-in/drive"
              className="gearroom-step done"
            >
              <span>✓</span>
              VEHICLE
            </Link>

            <i />

            {/* TRIP STYLE */}

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

            {/* CREW */}

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

            {/* DURATION */}

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

            {/* GEAR */}

            <div className="gearroom-step current">
              <span>5</span>
              GEAR
            </div>

          </div>

        </div>

        {/* ====================================================
            CHECKLIST MODAL
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

              {/* ===============================================
                  CHECKLIST HEADER
              =============================================== */}

              <header className="gearroom-checklist-header">

                <div className="gearroom-checklist-brand">
                  ROAMLAB
                </div>

                <div className="gearroom-checklist-kicker">
                  EXPEDITION GEAR CHECKLIST
                </div>

                <h1>
                  {systemTitles[
                    activeSystem
                  ]}
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
                    {
                      tripLabels[
                        trip
                      ]
                    }
                  </span>

                  <i>•</i>

                  <span>
                    {
                      crewLabels[
                        crew
                      ]
                    }
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

              {/* ===============================================
                  CHECKLIST BODY
              =============================================== */}

              <div className="gearroom-checklist-body">

                <div className="gearroom-checklist-column-head">

                  <span>
                    INCLUDE
                  </span>

                  <span>
                    GEAR CATEGORY
                  </span>

                  <span>
                    PRIORITY
                  </span>

                </div>

                <div className="gearroom-checklist-items">

                  {currentItems.map(
                    (
                      item,
                      index
                    ) => {
                      const checked =
                        selectedItems[
                          item.name
                        ] ?? true;

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

                          {/* CHECKBOX */}

                          <span className="gearroom-check-box">
                            {checked
                              ? "✓"
                              : ""}
                          </span>

                          {/* CATEGORY NAME */}

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

                            {
                              item.name
                            }

                          </span>

                          {/* PRIORITY */}

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

              {/* ===============================================
                  SUMMARY
              =============================================== */}

              <div className="gearroom-checklist-summary">

                <div>
                  <strong>
                    {
                      selectedCount
                    }
                  </strong>

                  <span>
                    SELECTED
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      essentialCount
                    }
                  </strong>

                  <span>
                    ESSENTIAL
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      recommendedCount
                    }
                  </strong>

                  <span>
                    RECOMMENDED
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      optionalCount
                    }
                  </strong>

                  <span>
                    OPTIONAL
                  </span>
                </div>

              </div>

              {/* ===============================================
                  FOOTER
              =============================================== */}

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
                  onClick={
                    buildGearSystem
                  }
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
