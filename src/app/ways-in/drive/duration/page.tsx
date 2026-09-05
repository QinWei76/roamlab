"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PlannerProgress from "@/components/PlannerProgress";

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

const durationLabels: Record<
  DurationKey,
  {
    title: string;
    detail: string;
    note: string;
  }
> = {
  overnight: {
    title: "OVERNIGHT",
    detail: "1 NIGHT",
    note: "A quick reset.",
  },
  weekend: {
    title: "WEEKEND",
    detail: "2–3 NIGHTS",
    note: "The classic getaway.",
  },
  "multi-day": {
    title: "MULTI-DAY",
    detail: "4–7 NIGHTS",
    note: "Go further.",
  },
  extended: {
    title: "EXTENDED",
    detail: "8+ NIGHTS",
    note: "Built for the long haul.",
  },
};

export default function DurationPage() {
  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [trip, setTrip] =
    useState<TripKey>("weekend");

  const [crew, setCrew] =
    useState<CrewKey>("solo");

  const [people, setPeople] =
    useState<number>(1);

  const [selectedDuration, setSelectedDuration] =
    useState<DurationKey | null>(null);

  const [ready, setReady] =
    useState(false);

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

    setReady(true);
  }, []);

  const chooseDuration = (
    duration: DurationKey
  ) => {
    setSelectedDuration(duration);
  };

  const closeSelection = () => {
    setSelectedDuration(null);
  };

  if (!ready) {
    return (
      <main className="duration-page">
        <div className="duration-loading" />
      </main>
    );
  }

  return (
    <main className="duration-page">
      <section className="duration-stage">

        {/* BACKGROUND */}
        <img
          src="/duration-desk.jpg"
          alt="RoamLab duration planning desk"
          className="duration-bg"
          draggable={false}
        />

        {/* HTML LOGO */}
        <Link
          href="/"
          className="duration-logo"
          aria-label="RoamLab home"
        >
          <span className="duration-logo-main">
            ROAMLAB
          </span>

          <span className="duration-logo-sub">
            PLANS · GEAR · STORIES
          </span>
        </Link>

        {/* GLOBAL NAV */}
        <nav className="duration-nav">
          <div className="duration-nav-links">
            <Link href="/explore">
              EXPLORE
            </Link>

            <Link href="/plan">
              PLAN
            </Link>

            <Link href="/prepare">
              PREPARE
            </Link>

            <Link href="/safety">
              SAFETY
            </Link>

            <Link href="/learn">
              LEARN
            </Link>

            <Link href="/journal">
              JOURNAL
            </Link>

            <Link href="/stories">
              STORIES
            </Link>

            <Link href="/badges">
              BADGES
            </Link>
          </div>

          <Link
            href="/signin"
            className="duration-signin"
          >
            SIGN IN
          </Link>

          <Link
            href="/start-here"
            className="duration-start"
          >
            START YOUR WILD →
          </Link>
        </nav>

        {/* PROGRESS */}
        <PlannerProgress
          currentStep={4}
          vehicle={vehicle}
          trip={trip}
        />

        {/* TITLE */}
        <div className="duration-heading">
          <h1>
            HOW LONG ARE YOU STAYING?
          </h1>

          <h2>
            CHOOSE YOUR DURATION.
          </h2>

          <p>
            We&apos;ll size your setup for
            the days ahead.
          </p>
        </div>

        {/* DURATION OPTIONS */}
        <div className="duration-options">

          <button
            type="button"
            className={`duration-card ${
              selectedDuration === "overnight"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              chooseDuration("overnight")
            }
          >
            <span className="duration-number">
              01
            </span>

            <strong>
              OVERNIGHT
            </strong>

            <span className="duration-detail">
              1 NIGHT
            </span>

            <small>
              A quick reset.
            </small>
          </button>

          <button
            type="button"
            className={`duration-card ${
              selectedDuration === "weekend"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              chooseDuration("weekend")
            }
          >
            <span className="duration-number">
              02
            </span>

            <strong>
              WEEKEND
            </strong>

            <span className="duration-detail">
              2–3 NIGHTS
            </span>

            <small>
              The classic getaway.
            </small>
          </button>

          <button
            type="button"
            className={`duration-card ${
              selectedDuration === "multi-day"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              chooseDuration("multi-day")
            }
          >
            <span className="duration-number">
              03
            </span>

            <strong>
              MULTI-DAY
            </strong>

            <span className="duration-detail">
              4–7 NIGHTS
            </span>

            <small>
              Go further.
            </small>
          </button>

          <button
            type="button"
            className={`duration-card ${
              selectedDuration === "extended"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              chooseDuration("extended")
            }
          >
            <span className="duration-number">
              04
            </span>

            <strong>
              EXTENDED
            </strong>

            <span className="duration-detail">
              8+ NIGHTS
            </span>

            <small>
              Built for the long haul.
            </small>
          </button>

        </div>

        {/* BACK */}
        <Link
          href={`/ways-in/drive/crew?vehicle=${vehicle}&trip=${trip}`}
          className="duration-back"
        >
          ← CREW
        </Link>

        {/* SELECTED PANEL */}
        {selectedDuration && (
          <div className="duration-panel">

            <button
              type="button"
              className="duration-panel-close"
              onClick={closeSelection}
              aria-label="Close duration selection"
            >
              ×
            </button>

            <div className="duration-summary">

              <span>
                YOUR DURATION
              </span>

              <strong>
                {
                  durationLabels[
                    selectedDuration
                  ].title
                }
              </strong>

              <div className="duration-summary-detail">
                {
                  durationLabels[
                    selectedDuration
                  ].detail
                }
              </div>

              <small>
                STEP 4 OF 5
              </small>

            </div>

            <Link
              href={`/ways-in/drive/gear?vehicle=${vehicle}&trip=${trip}&crew=${crew}&people=${people}&duration=${selectedDuration}`}
              className="duration-continue"
            >
              CONTINUE →
            </Link>

          </div>
        )}

      </section>
    </main>
  );
}
