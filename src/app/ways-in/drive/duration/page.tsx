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
  }
> = {
  overnight: {
    title: "Overnight",
    detail: "1 Night",
  },
  weekend: {
    title: "Weekend",
    detail: "2–3 Nights",
  },
  "multi-day": {
    title: "Multi-Day",
    detail: "4–7 Nights",
  },
  extended: {
    title: "Extended",
    detail: "8+ Nights",
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
      <main className="duration2-page">
        <div className="duration2-loading" />
      </main>
    );
  }

  return (
    <main className="duration2-page">
      <section className="duration2-stage">

        {/* BACKGROUND */}
        <img
          src="/duration-desk-v2.jpg"
          alt="RoamLab duration planning desk"
          className="duration2-bg"
          draggable={false}
        />

        {/* REAL HTML LOGO */}
        <Link
          href="/"
          className="duration2-logo"
          aria-label="RoamLab home"
        >
          <span className="duration2-logo-main">
            ROAMLAB
          </span>

          <span className="duration2-logo-sub">
            PLANS · GEAR · STORIES
          </span>
        </Link>

        {/* GLOBAL NAV */}
        <nav className="duration2-nav">
          <div className="duration2-nav-links">
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
            className="duration2-signin"
          >
            SIGN IN
          </Link>

          <Link
            href="/start-here"
            className="duration2-start"
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

        {/* HOTSPOTS */}
        <button
          type="button"
          className={`duration2-zone duration2-overnight ${
            selectedDuration === "overnight"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration("overnight")
          }
          aria-label="Choose Overnight"
          aria-pressed={
            selectedDuration === "overnight"
          }
        />

        <button
          type="button"
          className={`duration2-zone duration2-weekend ${
            selectedDuration === "weekend"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration("weekend")
          }
          aria-label="Choose Weekend"
          aria-pressed={
            selectedDuration === "weekend"
          }
        />

        <button
          type="button"
          className={`duration2-zone duration2-multiday ${
            selectedDuration === "multi-day"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration("multi-day")
          }
          aria-label="Choose Multi-Day"
          aria-pressed={
            selectedDuration === "multi-day"
          }
        />

        <button
          type="button"
          className={`duration2-zone duration2-extended ${
            selectedDuration === "extended"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration("extended")
          }
          aria-label="Choose Extended"
          aria-pressed={
            selectedDuration === "extended"
          }
        />

        {/* BACK */}
        <Link
          href={`/ways-in/drive/crew?vehicle=${vehicle}&trip=${trip}`}
          className="duration2-back"
        >
          ← CREW
        </Link>

        {/* SELECTED PANEL */}
        {selectedDuration && (
          <div className="duration2-panel">

            <button
              type="button"
              className="duration2-panel-close"
              onClick={closeSelection}
              aria-label="Close duration selection"
            >
              ×
            </button>

            <div className="duration2-summary">
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

              <div className="duration2-summary-detail">
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
              className="duration2-continue"
            >
              CONTINUE →
            </Link>

          </div>
        )}

      </section>
    </main>
  );
}
