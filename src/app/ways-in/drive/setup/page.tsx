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

const vehicles: Record<
  VehicleKey,
  {
    label: string;
    image: string;
  }
> = {
  suv: {
    label: "SUV",
    image: "/trip-style-suv.jpg",
  },

  truck: {
    label: "TRUCK",
    image: "/trip-style-truck.jpg",
  },

  van: {
    label: "VAN",
    image: "/trip-style-van.jpg",
  },

  crossover: {
    label: "CROSSOVER / AWD",
    image: "/trip-style-crossover.jpg",
  },

  city: {
    label: "2WD / CITY CAR",
    image: "/trip-style-city.jpg",
  },
};

export default function TripStylePage() {
  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [selectedTrip, setSelectedTrip] =
    useState<TripKey | null>(null);

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(window.location.search);

    const value =
      params.get("vehicle");

    if (
      value === "suv" ||
      value === "truck" ||
      value === "van" ||
      value === "crossover" ||
      value === "city"
    ) {
      setVehicle(value);
    }

    setReady(true);
  }, []);

  const currentVehicle =
    vehicles[vehicle];

  const chooseTrip = (trip: TripKey) => {
    setSelectedTrip(trip);

    window.setTimeout(() => {
      window.location.href =
        `/ways-in/drive/crew?vehicle=${vehicle}&trip=${trip}`;
    }, 180);
  };

  return (
    <main className="trip2-page">
      <section className="trip2-stage">

        {ready && (
          <img
            src={currentVehicle.image}
            alt={`${currentVehicle.label} trip style desk`}
            className="trip2-bg"
            draggable={false}
          />
        )}

        {/* GLOBAL NAV */}

        <nav className="trip2-nav">
          <div className="trip2-nav-links">

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
            className="trip2-signin"
          >
            SIGN IN
          </Link>

          <Link
            href="/start-here"
            className="trip2-start"
          >
            START YOUR WILD →
          </Link>
        </nav>

        {/* PLANNER PROGRESS */}

        <PlannerProgress
          currentStep={2}
          vehicle={vehicle}
        />

        {/* WEEKEND ESCAPE */}

        <button
          type="button"
          className={`trip2-zone trip2-weekend ${
            selectedTrip === "weekend"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseTrip("weekend")
          }
          aria-label="Choose Weekend Escape"
        />

        {/* ROAD TRIP */}

        <button
          type="button"
          className={`trip2-zone trip2-road ${
            selectedTrip === "road-trip"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseTrip("road-trip")
          }
          aria-label="Choose Road Trip"
        />

        {/* BASECAMP */}

        <button
          type="button"
          className={`trip2-zone trip2-basecamp ${
            selectedTrip === "basecamp"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseTrip("basecamp")
          }
          aria-label="Choose Basecamp"
        />

        {/* REMOTE / OFF-GRID */}

        <button
          type="button"
          className={`trip2-zone trip2-remote ${
            selectedTrip === "remote"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseTrip("remote")
          }
          aria-label="Choose Remote Off Grid"
        />

        {/* BACK */}

        <a
          href="/ways-in/drive"
          className="trip2-back"
        >
          ← VEHICLE
        </a>

      </section>
    </main>
  );
}
