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

const crewLabels: Record<CrewKey, string> = {
  solo: "Solo",
  couple: "Couple",
  family: "Family",
  friends: "Friends",
};

const peopleOptions: Record<CrewKey, number[]> = {
  solo: [1],
  couple: [2],
  family: [3, 4, 5, 6],
  friends: [2, 3, 4, 5, 6],
};

export default function CrewPage() {
  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [trip, setTrip] =
    useState<TripKey>("weekend");

  const [selectedCrew, setSelectedCrew] =
    useState<CrewKey | null>(null);

  const [people, setPeople] =
    useState<number | null>(null);

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(window.location.search);

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

  const chooseCrew = (crew: CrewKey) => {
    setSelectedCrew(crew);

    if (crew === "solo") {
      setPeople(1);
      return;
    }

    if (crew === "couple") {
      setPeople(2);
      return;
    }

    setPeople(null);
  };

  const closeSelection = () => {
    setSelectedCrew(null);
    setPeople(null);
  };

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
            chooseCrew("solo")
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
            chooseCrew("couple")
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
            chooseCrew("family")
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
            chooseCrew("friends")
          }
          aria-label="Choose Friends"
        />

        {/* BACK */}

        <Link
          href={`/ways-in/drive/setup?vehicle=${vehicle}`}
          className="crew-back"
        >
          ← TRIP STYLE
        </Link>

        {/* SELECTION PANEL */}

        {selectedCrew && (
          <div className="crew-panel">

            {/* CLOSE */}

            <button
              type="button"
              className="crew-panel-close"
              onClick={closeSelection}
              aria-label="Close crew selection"
            >
              ×
            </button>

            <div className="crew-summary">

              <span>YOUR CREW</span>

              <strong>
                {crewLabels[selectedCrew]}
              </strong>

              {/* SOLO / COUPLE */}

              {(selectedCrew === "solo" ||
                selectedCrew === "couple") && (
                <div className="crew-people-confirmed">
                  {people}{" "}
                  {people === 1
                    ? "PERSON"
                    : "PEOPLE"}
                </div>
              )}

              {/* FAMILY / FRIENDS */}

              {(selectedCrew === "family" ||
                selectedCrew === "friends") && (
                <div className="crew-people-picker">

                  <span className="crew-people-question">
                    HOW MANY PEOPLE?
                  </span>

                  <div className="crew-people-options">

                    {peopleOptions[
                      selectedCrew
                    ].map((count) => (
                      <button
                        key={count}
                        type="button"
                        className={`crew-people-button ${
                          people === count
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() =>
                          setPeople(count)
                        }
                      >
                        {count === 6
                          ? "6+"
                          : count}
                      </button>
                    ))}

                  </div>

                </div>
              )}

              <small>
                STEP 3 OF 5
              </small>

            </div>

            {/* CONTINUE */}

            {people !== null && (
              <Link
                href={`/ways-in/drive/duration?vehicle=${vehicle}&trip=${trip}&crew=${selectedCrew}&people=${people}`}
                className="crew-continue"
              >
                CONTINUE →
              </Link>
            )}

          </div>
        )}

      </section>
    </main>
  );
}
