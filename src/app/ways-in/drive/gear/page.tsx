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

export default function GearPage() {
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

  const [systemBuilt, setSystemBuilt] =
    useState(false);

  const [activeSystem, setActiveSystem] =
    useState<GearSystemKey | null>(null);

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
        name: "Sleeping Setup",
        priority: "essential",
      },
      {
        name: "Power System",
        priority:
          isRemote || isLong
            ? "essential"
            : "recommended",
      },
      {
        name: "Cooking System",
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

  const buildSystem = () => {
    setSystemBuilt(true);
    setActiveSystem("personal");
  };

  if (!ready) {
    return (
      <main className="gearroom-page">
        <div className="gearroom-loading" />
      </main>
    );
  }

  const peopleLabel =
    `${people} ${people === 1 ? "PERSON" : "PEOPLE"}`;

  return (
    <main className="gearroom-page">
      <section className="gearroom-stage">

        <img
          src="/gear-room.jpg"
          alt="RoamLab Gear Room"
          className="gearroom-bg"
          draggable={false}
        />

        {/* TOP DYNAMIC TRIP DATA */}
        <div className="gearroom-trip-overlay">
          <div className="gearroom-trip-line">
            <span>{vehicleLabels[vehicle]}</span>
            <i>·</i>
            <span>{tripLabels[trip]}</span>
            <i>·</i>
            <span>{crewLabels[crew]}</span>
            <i>·</i>
            <span>{peopleLabel}</span>
            <i>·</i>
            <span>{durationLabels[duration]}</span>
          </div>
        </div>

        {/* BUILD BUTTON — RIGHT SIDE */}
        {!systemBuilt && (
          <button
            type="button"
            className="gearroom-build-fixed"
            onClick={buildSystem}
          >
            BUILD MY GEAR SYSTEM →
          </button>
        )}

        {systemBuilt && (
          <div className="gearroom-ready">
            ✓ GEAR SYSTEM READY
          </div>
        )}

        {/* THREE GEAR AREAS */}
        <button
          type="button"
          className={`gearroom-zone gearroom-personal ${
            activeSystem === "personal"
              ? "selected"
              : ""
          } ${
            systemBuilt
              ? "enabled"
              : "disabled"
          }`}
          onClick={() => {
            if (systemBuilt) {
              setActiveSystem("personal");
            }
          }}
          aria-label="Personal Gear"
        />

        <button
          type="button"
          className={`gearroom-zone gearroom-vehicle ${
            activeSystem === "vehicle"
              ? "selected"
              : ""
          } ${
            systemBuilt
              ? "enabled"
              : "disabled"
          }`}
          onClick={() => {
            if (systemBuilt) {
              setActiveSystem("vehicle");
            }
          }}
          aria-label="Vehicle and Camp Gear"
        />

        <button
          type="button"
          className={`gearroom-zone gearroom-safety ${
            activeSystem === "safety"
              ? "selected"
              : ""
          } ${
            systemBuilt
              ? "enabled"
              : "disabled"
          }`}
          onClick={() => {
            if (systemBuilt) {
              setActiveSystem("safety");
            }
          }}
          aria-label="Safety and Emergency Gear"
        />

        {/* RESULT PANEL */}
        {systemBuilt && activeSystem && (
          <div className="gearroom-drawer">

            <button
              type="button"
              className="gearroom-drawer-close"
              onClick={() =>
                setActiveSystem(null)
              }
              aria-label="Close gear list"
            >
              ×
            </button>

            <span className="gearroom-drawer-eyebrow">
              YOUR GEAR SYSTEM
            </span>

            <h2>
              {activeSystem === "personal" &&
                "PERSONAL GEAR"}

              {activeSystem === "vehicle" &&
                "VEHICLE & CAMP GEAR"}

              {activeSystem === "safety" &&
                "SAFETY & EMERGENCY"}
            </h2>

            <div className="gearroom-list">
              {gearSystem[activeSystem].map(
                (item) => (
                  <div
                    key={item.name}
                    className="gearroom-list-item"
                  >
                    <span>
                      {item.name}
                    </span>

                    <strong
                      className={`gear-priority ${item.priority}`}
                    >
                      {item.priority.toUpperCase()}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* BACK */}
        <Link
          href={`/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${crew}&people=${people}`}
          className="gearroom-back"
        >
          ← DURATION
        </Link>

        {/* BOTTOM PROGRESS */}
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

      </section>
    </main>
  );
}
