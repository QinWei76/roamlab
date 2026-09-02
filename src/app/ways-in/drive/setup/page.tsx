"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const tripStyles = [
  {
    id: "weekend",
    label: "Weekend Escape",
  },
  {
    id: "road-trip",
    label: "Road Trip",
  },
  {
    id: "remote",
    label: "Remote / Off-Grid",
  },
  {
    id: "road-hike",
    label: "Road + Hike",
  },
];

const vehicleLabels: Record<string, string> = {
  suv: "SUV",
  truck: "TRUCK",
  van: "VAN",
  crossover: "CROSSOVER / AWD",
  city: "2WD / CITY CAR",
};

export default function TripStylePage() {
  const [vehicle, setVehicle] = useState("suv");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicleParam = params.get("vehicle");

    if (vehicleParam && vehicleLabels[vehicleParam]) {
      setVehicle(vehicleParam);
    }
  }, []);

  const selectedTripLabel =
    tripStyles.find((trip) => trip.id === selectedTrip)?.label ?? "";

  return (
    <main className="trip-desk-page">
      <section className="trip-desk-stage">
        {/* MASTER IMAGE */}

        <img
          src="/trip-style-desk.jpg"
          alt="RoamLab Trip Style Planning Desk"
          className="trip-desk-image"
          draggable={false}
        />

        {/* =====================================================
            REAL NAVIGATION
        ====================================================== */}

        <nav className="trip-real-nav">
          <div className="trip-real-links">
            <Link href="/explore">EXPLORE</Link>
            <Link href="/plan">PLAN</Link>
            <Link href="/prepare">PREPARE</Link>
            <Link href="/safety">SAFETY</Link>
            <Link href="/learn">LEARN</Link>
            <Link href="/journal">JOURNAL</Link>
            <Link href="/stories">STORIES</Link>
            <Link href="/badges">BADGES</Link>
          </div>

          <Link href="/signin" className="trip-real-signin">
            SIGN IN
          </Link>

          <Link href="/start-here" className="trip-real-start">
            START YOUR WILD →
          </Link>
        </nav>

        {/* =====================================================
            CURRENT VEHICLE
        ====================================================== */}

        <div className="trip-current-vehicle">
          <span>VEHICLE</span>
          <strong>{vehicleLabels[vehicle]} ✓</strong>
        </div>

        {/* =====================================================
            TRIP STYLE HOTSPOTS
        ====================================================== */}

        <button
          type="button"
          className={`trip-style-zone trip-zone-weekend ${
            selectedTrip === "weekend" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedTrip("weekend")}
          aria-label="Select Weekend Escape"
        />

        <button
          type="button"
          className={`trip-style-zone trip-zone-road ${
            selectedTrip === "road-trip" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedTrip("road-trip")}
          aria-label="Select Road Trip"
        />

        <button
          type="button"
          className={`trip-style-zone trip-zone-remote ${
            selectedTrip === "remote" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedTrip("remote")}
          aria-label="Select Remote Off-Grid"
        />

        <button
          type="button"
          className={`trip-style-zone trip-zone-hike ${
            selectedTrip === "road-hike" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedTrip("road-hike")}
          aria-label="Select Road and Hike"
        />

        {/* =====================================================
            LOGO → HOME
        ====================================================== */}

        <Link
          href="/"
          className="trip-logo-hotspot"
          aria-label="Back to RoamLab home"
        />

        {/* =====================================================
            BACK
        ====================================================== */}

        <Link
          href="/ways-in/drive"
          className="trip-back-button"
        >
          ← VEHICLE
        </Link>

        {/* =====================================================
            CONTINUE
        ====================================================== */}

        {selectedTrip && (
          <div className="trip-selection-panel">
            <div className="trip-selection-summary">
              <span>YOUR PLAN</span>

              <strong>{selectedTripLabel}</strong>

              <small>
                {vehicleLabels[vehicle]} · STEP 2 OF 5
              </small>
            </div>

            <Link
              href={`/ways-in/drive/crew?vehicle=${vehicle}&trip=${selectedTrip}`}
              className="trip-continue-button"
            >
              CONTINUE →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
