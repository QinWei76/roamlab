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

const crewLabels: Record<
  CrewKey,
  string
> = {
  solo: "Solo",
  couple: "Couple",
  family: "Family",
  friends: "Friends",
};

export default function CrewPage() {
  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [trip, setTrip] =
    useState<TripKey>("weekend");

  const [selectedCrew, setSelectedCrew] =
    useState<CrewKey | null>(null);

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const vehicleValue =
      params.get("vehicle");

    const tripValue =
      params.get("trip");

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

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="crew-page">
        <div className="crew-loading" />
      </main>
    );
  }

  return (
    <main className="crew-page">
      <section className="crew-stage">

        <img
          src="/crew-desk.jpg"
          alt="RoamLab Crew planning desk"
          className="crew-bg"
          draggable={false}
        />

        {/* GLOBAL NAV */}
        <nav className="crew-nav">
          <div className="crew-nav-links">
            <Link href="/explore">EXPLORE</Link>
            <Link href="/plan">PLAN</Link>
            <Link href="/prepare">PREPARE</Link>
            <Link href="/safety">SAFETY</Link>
            <Link href="/learn">LEARN</Link>
            <Link href="/journal">JOURNAL</Link>
            <Link href="/stories">STORIES</Link>
            <Link href="/badges">BADGES</Link>
          </div>

          <Link
            href="/signin"
            className="crew-signin"
          >
            SIGN IN
          </Link>

          <Link
            href="/start-here"
            className="crew-start"
          >
            START YOUR WILD →
          </Link>
        </nav>

        {/* PLANNER PROGRESS */}
        <PlannerProgress
          currentStep={3}
          vehicle={vehicle}
          trip={trip}
        />

        {/* SOLO */}
        <button
          type="button"
          className={`crew-zone crew-solo ${
            selectedCrew === "solo"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setSelectedCrew("solo")
          }
          aria-label="Choose Solo"
        />

        {/* COUPLE */}
        <button
          type="button"
          className={`crew-zone crew-couple ${
            selectedCrew === "couple"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setSelectedCrew("couple")
          }
          aria-label="Choose Couple"
        />

        {/* FAMILY */}
        <button
          type="button"
          className={`crew-zone crew-family ${
            selectedCrew === "family"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setSelectedCrew("family")
          }
          aria-label="Choose Family"
        />

        {/* FRIENDS */}
        <button
          type="button"
          className={`crew-zone crew-friends ${
            selectedCrew === "friends"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setSelectedCrew("friends")
          }
          aria-label="Choose Friends"
        />

        {/* BACK */}
        <a
          href={`/ways-in/drive/setup?vehicle=${vehicle}`}
          className="crew-back"
        >
          ← TRIP STYLE
        </a>

        {/* SELECTED PANEL */}
        {selectedCrew && (
          <div className="crew-panel">

            <div className="crew-summary">
              <span>YOUR CREW</span>

              <strong>
                {crewLabels[selectedCrew]}
              </strong>

              <small>
                STEP 3 OF 5
              </small>
            </div>

            <a
              href={`/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${selectedCrew}`}
              className="crew-continue"
            >
              CONTINUE →
            </a>

          </div>
        )}

      </section>
    </main>
  );
}
