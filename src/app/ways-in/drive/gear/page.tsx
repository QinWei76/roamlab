"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type VehicleKey = "suv" | "truck" | "van" | "crossover" | "city";
type TripKey = "weekend" | "road-trip" | "basecamp" | "remote";
type CrewKey = "solo" | "couple" | "family" | "friends";
type DurationKey = "overnight" | "weekend" | "multi-day" | "extended";
type Priority = "essential" | "recommended" | "optional";
type GearSystemKey = "personal" | "vehicle" | "safety";

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

const stepNumber: Record<GearSystemKey, number> = {
  personal: 1,
  vehicle: 2,
  safety: 3,
};

const systemOrder: GearSystemKey[] = [
  "personal",
  "vehicle",
  "safety",
];

const isVehicleKey = (value: string | null): value is VehicleKey =>
  ["suv", "truck", "van", "crossover", "city"].includes(value || "");

const isTripKey = (value: string | null): value is TripKey =>
  ["weekend", "road-trip", "basecamp", "remote"].includes(value || "");

const isCrewKey = (value: string | null): value is CrewKey =>
  ["solo", "couple", "family", "friends"].includes(value || "");

const isDurationKey = (
  value: string | null
): value is DurationKey =>
  ["overnight", "weekend", "multi-day", "extended"].includes(
    value || ""
  );

export default function GearPage() {
  const [vehicle, setVehicle] = useState<VehicleKey>("suv");
  const [trip, setTrip] = useState<TripKey>("weekend");
  const [crew, setCrew] = useState<CrewKey>("couple");
  const [people, setPeople] = useState(2);
  const [duration, setDuration] =
    useState<DurationKey>("weekend");

  const [ready, setReady] = useState(false);

  const [activeSystem, setActiveSystem] =
    useState<GearSystemKey | null>(null);

  const [reviewed, setReviewed] = useState<
    Record<GearSystemKey, boolean>
  >({
    personal: false,
    vehicle: false,
    safety: false,
  });

  const [selectedItems, setSelectedItems] = useState<
    Record<string, boolean>
  >({});

  const [showFinalSystem, setShowFinalSystem] =
    useState(false);

  /* =====================================================
     READ URL PARAMETERS
  ===================================================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const vehicleParam = params.get("vehicle");
    const tripParam = params.get("trip");
    const crewParam = params.get("crew");
    const durationParam = params.get("duration");

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

    const peopleParam = Number(params.get("people"));

    if (Number.isFinite(peopleParam) && peopleParam > 0) {
      setPeople(peopleParam);
    }

    setReady(true);
  }, []);

  /* =====================================================
     BUILD GEAR RECOMMENDATIONS
  ===================================================== */

  const gearSystem = useMemo(() => {
    const isRemote = trip === "remote";

    const isLong =
      duration === "multi-day" ||
      duration === "extended";

    const isLargeCrew = people >= 4;

    const isCityCar = vehicle === "city";

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
          isRemote || isLong || isLargeCrew
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
  }, [vehicle, trip, people, duration]);

  /* =====================================================
     INITIAL SELECTED STATE
  ===================================================== */

  useEffect(() => {
    const initial: Record<string, boolean> = {};

    Object.values(gearSystem)
      .flat()
      .forEach((item) => {
        initial[item.name] = true;
      });

    setSelectedItems(initial);
  }, [gearSystem]);

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSystem(null);
        setShowFinalSystem(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =====================================================
     CHECKLIST HELPERS
  ===================================================== */

  const openChecklist = (key: GearSystemKey) => {
    setShowFinalSystem(false);
    setActiveSystem(key);
  };

  const closeChecklist = () => {
    setActiveSystem(null);
  };

  const toggleItem = (name: string) => {
    setSelectedItems((previous) => ({
      ...previous,
      [name]: !(previous[name] ?? true),
    }));
  };

  const isSelected = (name: string) =>
    selectedItems[name] ?? true;

  const selectedFor = (key: GearSystemKey) =>
    gearSystem[key].filter((item) =>
      isSelected(item.name)
    );

  const counts = {
    personal: selectedFor("personal").length,
    vehicle: selectedFor("vehicle").length,
    safety: selectedFor("safety").length,
  };

  const totalAvailable =
    gearSystem.personal.length +
    gearSystem.vehicle.length +
    gearSystem.safety.length;

  const totalSelected =
    counts.personal +
    counts.vehicle +
    counts.safety;

  const allSelected = [
    ...selectedFor("personal"),
    ...selectedFor("vehicle"),
    ...selectedFor("safety"),
  ];

  const priorityCount = (priority: Priority) =>
    allSelected.filter(
      (item) => item.priority === priority
    ).length;

  const allReviewed =
    reviewed.personal &&
    reviewed.vehicle &&
    reviewed.safety;

  /* =====================================================
     REVIEW LOGIC

     IMPORTANT:
     Checklist never opens final summary automatically.
  ===================================================== */

  const reviewAndContinue = () => {
    if (!activeSystem) return;

    const current = activeSystem;

    const wasAlreadyReviewed =
      reviewed[current];

    const nextReviewed = {
      ...reviewed,
      [current]: true,
    };

    setReviewed(nextReviewed);

    /*
      Repeat visit:
      save changes and return to Gear Room.
    */

    if (wasAlreadyReviewed) {
      setActiveSystem(null);
      return;
    }

    /*
      First-time guided flow.
      Find the next checklist that has not
      yet been reviewed.
    */

    if (!nextReviewed.personal) {
      setActiveSystem("personal");
      return;
    }

    if (!nextReviewed.vehicle) {
      setActiveSystem("vehicle");
      return;
    }

    if (!nextReviewed.safety) {
      setActiveSystem("safety");
      return;
    }

    /*
      All three have now been reviewed.
      Return to Gear Room.

      DO NOT open final system automatically.
    */

    setActiveSystem(null);
  };

  /* =====================================================
     ACTION LABEL
  ===================================================== */

  const getActionLabel = () => {
    if (!activeSystem) {
      return "";
    }

    if (reviewed[activeSystem]) {
      return "SAVE CHANGES & RETURN →";
    }

    const nextReviewed = {
      ...reviewed,
      [activeSystem]: true,
    };

    if (!nextReviewed.personal) {
      return "REVIEW PERSONAL GEAR →";
    }

    if (!nextReviewed.vehicle) {
      return "NEXT: VEHICLE & CAMP →";
    }

    if (!nextReviewed.safety) {
      return "NEXT: SAFETY & EMERGENCY →";
    }

    return "SAVE & RETURN TO GEAR ROOM →";
  };

  /* =====================================================
     FINAL SYSTEM

     ONLY this action opens the summary.
  ===================================================== */

  const buildGearSystem = () => {
    if (!allReviewed) {
      return;
    }

    setActiveSystem(null);
    setShowFinalSystem(true);
  };

  /* =====================================================
     TRIP SUMMARY
  ===================================================== */

  const tripSummary = (
    <div className="gearroom-checklist-trip">
      <span>{vehicleLabels[vehicle]}</span>

      <i>•</i>

      <span>{tripLabels[trip]}</span>

      <i>•</i>

      <span>{crewLabels[crew]}</span>

      <i>•</i>

      <span>
        {people}{" "}
        {people === 1 ? "PERSON" : "PEOPLE"}
      </span>

      <i>•</i>

      <span>{durationLabels[duration]}</span>
    </div>
  );

  /* =====================================================
     FINAL SUMMARY ROWS
  ===================================================== */

  const renderFinalRows = (
    key: GearSystemKey
  ) => {
    const items = selectedFor(key);

    if (items.length === 0) {
      return (
        <div
          style={{
            padding: "20px 8px",
            opacity: 0.55,
            fontSize: "12px",
            letterSpacing: ".08em",
          }}
        >
          NO CATEGORIES SELECTED
        </div>
      );
    }

    return items.map((item, index) => (
      <div
        key={`${key}-${item.name}`}
        className="gearroom-checklist-row is-checked"
      >
        <span className="gearroom-check-box">
          ✓
        </span>

        <span className="gearroom-check-name">
          <small>
            {String(index + 1).padStart(
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
    ));
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (!ready) {
    return (
      <main className="gearroom-page">
        <div className="gearroom-loading" />
      </main>
    );
  }

  const currentItems = activeSystem
    ? gearSystem[activeSystem]
    : [];

  const actionLabel = getActionLabel();

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="gearroom-page">
      <section className="gearroom-stage">

        {/* ===============================================
            BACKGROUND
        =============================================== */}

        <img
          src="/gear-room-v2.jpg"
          alt="RoamLab Gear Room"
          className="gearroom-bg"
          draggable={false}
        />

        {/* ===============================================
            TRIP SETUP VALUES
        =============================================== */}

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
            {people}
          </div>

          <div className="gearroom-trip-value gearroom-trip-duration">
            {durationLabels[duration]}
          </div>

        </div>

        {/* ===============================================
            GEAR ROOM HOTSPOTS

            ALWAYS CLICKABLE
        =============================================== */}

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

        {/* ===============================================
            BUILD BUTTON
        =============================================== */}

        {allReviewed &&
          !activeSystem &&
          !showFinalSystem && (
            <div
              style={{
                position: "absolute",
                zIndex: 40,
                left: "50%",
                bottom: "11%",
                transform:
                  "translateX(-50%)",
                pointerEvents: "auto",
              }}
            >
              <button
                type="button"
                className="gearroom-checklist-build"
                onClick={buildGearSystem}
              >
                BUILD MY GEAR SYSTEM →
              </button>
            </div>
          )}

        {/* ===============================================
            BACK
        =============================================== */}

        <Link
          className="gearroom-back"
          href={`/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${crew}&people=${people}`}
        >
          ← DURATION
        </Link>

        {/* ===============================================
            BOTTOM PROGRESS
        =============================================== */}

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
              href={`/ways-in/drive/setup?vehicle=${vehicle}`}
              className="gearroom-step done"
            >
              <span>✓</span>
              TRIP STYLE
            </Link>

            <i />

            <Link
              href={`/ways-in/drive/crew?vehicle=${vehicle}&trip=${trip}`}
              className="gearroom-step done"
            >
              <span>✓</span>
              CREW
            </Link>

            <i />

            <Link
              href={`/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${crew}&people=${people}`}
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

        {/* ===============================================
            CHECKLIST MODAL
        =============================================== */}

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
                  {" · "}
                  STEP{" "}
                  {stepNumber[activeSystem]} OF 3

                  {reviewed[activeSystem]
                    ? " · REVIEWED"
                    : ""}
                </div>

                <h1>
                  {systemTitles[activeSystem]}
                </h1>

                {tripSummary}

              </header>

              {/* BODY */}

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
                    (item, index) => {
                      const checked =
                        isSelected(item.name);

                      return (
                        <button
                          type="button"
                          key={item.name}
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

              {/* STATUS */}

              <div className="gearroom-checklist-summary">

                <div>
                  <strong>
                    {counts.personal}/
                    {gearSystem.personal.length}
                  </strong>

                  <span>
                    {reviewed.personal
                      ? "✓ PERSONAL"
                      : "PERSONAL"}
                  </span>
                </div>

                <div>
                  <strong>
                    {counts.vehicle}/
                    {gearSystem.vehicle.length}
                  </strong>

                  <span>
                    {reviewed.vehicle
                      ? "✓ VEHICLE"
                      : "VEHICLE"}
                  </span>
                </div>

                <div>
                  <strong>
                    {counts.safety}/
                    {gearSystem.safety.length}
                  </strong>

                  <span>
                    {reviewed.safety
                      ? "✓ SAFETY"
                      : "SAFETY"}
                  </span>
                </div>

                <div>
                  <strong>
                    {totalSelected}/
                    {totalAvailable}
                  </strong>

                  <span>
                    {allReviewed
                      ? "✓ READY"
                      : "TOTAL"}
                  </span>
                </div>

              </div>

              {/* FOOTER */}

              <footer className="gearroom-checklist-footer">

                <div className="gearroom-checklist-note">

                  {reviewed[activeSystem]
                    ? "This checklist has already been reviewed. Make any changes you need, then save and return to the Gear Room."
                    : "Review the categories for this part of your trip system. You can return and edit this checklist at any time."}

                </div>

                <button
                  type="button"
                  className="gearroom-checklist-build"
                  onClick={reviewAndContinue}
                >
                  {actionLabel}
                </button>

              </footer>

            </section>
          </div>
        )}

        {/* ===============================================
            FINAL GEAR SYSTEM
        =============================================== */}

        {showFinalSystem && (
          <div
            className="gearroom-modal-backdrop gearroom-final-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowFinalSystem(false);
              }
            }}
          >
            <section
              className="gearroom-checklist gearroom-final-system"
              role="dialog"
              aria-modal="true"
              aria-label="Your Gear System"
            >

              {/* CLOSE */}

              <button
                type="button"
                className="gearroom-checklist-close"
                onClick={() =>
                  setShowFinalSystem(false)
                }
                aria-label="Close Gear System"
              >
                ×
              </button>

              {/* FINAL HEADER */}

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

                {tripSummary}

              </header>

              {/* =========================================
                  ONE CONTINUOUS SCROLL AREA

                  Sections + summary all live inside here.
              ========================================= */}

              <div className="gearroom-checklist-body gearroom-final-body">

                {/* TOP SYSTEM OVERVIEW */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "8px",
                    marginBottom: "18px",
                  }}
                >

                  {systemOrder.map((key) => (
                    <div
                      key={`overview-${key}`}
                      style={{
                        border:
                          "1px solid rgba(222,205,173,.14)",
                        padding:
                          "10px 12px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          opacity: 0.58,
                          letterSpacing:
                            ".12em",
                          marginBottom:
                            "4px",
                        }}
                      >
                        0{stepNumber[key]}
                      </div>

                      <strong
                        style={{
                          display: "block",
                          fontSize: "11px",
                          letterSpacing:
                            ".08em",
                        }}
                      >
                        {systemTitles[key]}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "5px",
                          fontSize: "11px",
                          opacity: 0.68,
                        }}
                      >
                        {selectedFor(key).length}
                        {" / "}
                        {gearSystem[key].length}
                      </span>

                    </div>
                  ))}

                </div>

                {/* =======================================
                    THREE SYSTEMS
                ======================================= */}

                {systemOrder.map((key) => (
                  <section
                    className="gearroom-final-section"
                    key={key}
                  >

                    <div className="gearroom-final-section-head">

                      <strong>
                        {String(
                          stepNumber[key]
                        ).padStart(2, "0")}
                        {" "}
                        {systemTitles[key]}
                      </strong>

                      <span>
                        {selectedFor(key).length}
                        {" / "}
                        {gearSystem[key].length}
                        {" SELECTED"}
                      </span>

                    </div>

                    <div className="gearroom-checklist-items">
                      {renderFinalRows(key)}
                    </div>

                  </section>
                ))}

                {/* =======================================
                    SUMMARY

                    IMPORTANT:
                    This is now AFTER all 3 sections.
                ======================================= */}

                <section
                  style={{
                    marginTop: "24px",
                    paddingTop: "18px",
                    borderTop:
                      "1px solid rgba(222,205,173,.22)",
                  }}
                >

                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 900,
                      letterSpacing: ".12em",
                      marginBottom: "12px",
                      color: "#e0a04a",
                    }}
                  >
                    GEAR SYSTEM SUMMARY
                  </div>

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
                        {priorityCount(
                          "essential"
                        )}
                      </strong>

                      <span>
                        ESSENTIAL
                      </span>
                    </div>

                    <div>
                      <strong>
                        {priorityCount(
                          "recommended"
                        )}
                      </strong>

                      <span>
                        RECOMMENDED
                      </span>
                    </div>

                    <div>
                      <strong>
                        {priorityCount(
                          "optional"
                        )}
                      </strong>

                      <span>
                        OPTIONAL
                      </span>
                    </div>

                  </div>

                  <div
                    style={{
                      padding:
                        "15px 4px 6px",
                      fontSize: "12px",
                      lineHeight: 1.6,
                      opacity: 0.7,
                    }}
                  >
                    Your three expedition
                    checklists are combined
                    into one complete Gear
                    System for this trip.
                  </div>

                </section>

              </div>

              {/* =========================================
                  FINAL FOOTER

                  No duplicate stats here.
              ========================================= */}

              <footer className="gearroom-checklist-footer">

                <div className="gearroom-checklist-note">
                  Gear System complete. You can close this view and return to the Gear Room at any time to update your selections.
                </div>

                <button
                  type="button"
                  className="gearroom-checklist-build is-built"
                  onClick={() =>
                    setShowFinalSystem(false)
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
