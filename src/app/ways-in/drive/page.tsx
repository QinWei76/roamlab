"use client";

import Link from "next/link";
import { useState } from "react";

const vehicles = [
  {
    id: "suv",
    label: "SUV",
  },
  {
    id: "truck",
    label: "Truck",
  },
  {
    id: "van",
    label: "Van",
  },
  {
    id: "crossover",
    label: "Crossover / AWD",
  },
  {
    id: "city",
    label: "2WD / City Car",
  },
];

export default function DrivePage() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  return (
    <main className="drive-desk-page">
      <section className="drive-desk-stage">
        <img
          src="/drive-desk.jpg"
          alt="RoamLab Drive vehicle selection desk"
          className="drive-desk-image"
          draggable={false}
        />

        {/* =====================================================
            REAL TOP NAVIGATION
        ====================================================== */}

        <nav className="drive-real-nav">
          <div className="drive-real-links">
            <Link href="/explore">EXPLORE</Link>
            <Link href="/plan">PLAN</Link>
            <Link href="/prepare">PREPARE</Link>
            <Link href="/safety">SAFETY</Link>
            <Link href="/learn">LEARN</Link>
            <Link href="/journal">JOURNAL</Link>
            <Link href="/stories">STORIES</Link>
            <Link href="/badges">BADGES</Link>
          </div>

          <Link href="/signin" className="drive-real-signin">
            SIGN IN
          </Link>

          <Link href="/start-here" className="drive-real-start">
            START YOUR WILD →
          </Link>
        </nav>

        {/* =====================================================
            VEHICLE HOTSPOTS
        ====================================================== */}

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-suv ${
            selectedVehicle === "suv" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedVehicle("suv")}
          aria-label="Select SUV"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-truck ${
            selectedVehicle === "truck" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedVehicle("truck")}
          aria-label="Select Truck"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-van ${
            selectedVehicle === "van" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedVehicle("van")}
          aria-label="Select Van"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-crossover ${
            selectedVehicle === "crossover" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedVehicle("crossover")}
          aria-label="Select Crossover or AWD"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-city ${
            selectedVehicle === "city" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedVehicle("city")}
          aria-label="Select 2WD or City Car"
        />

        {/* =====================================================
            LOGO → HOME
        ====================================================== */}

        <Link
          href="/"
          className="drive-logo-hotspot"
          aria-label="Back to RoamLab home"
        />

        {/* =====================================================
            BACK TO WAYS IN
        ====================================================== */}

        <Link
          href="/ways-in"
          className="drive-back-button"
        >
          ← WAYS IN
        </Link>

        {/* =====================================================
            SELECTION PANEL
        ====================================================== */}

        {selectedVehicle && (
          <div className="drive-selection-panel">
            <div>
              <span>YOUR VEHICLE</span>

              <strong>
                {
                  vehicles.find(
                    (vehicle) => vehicle.id === selectedVehicle
                  )?.label
                }
              </strong>
            </div>

            <Link
              href={`/ways-in/drive/setup?vehicle=${selectedVehicle}`}
              className="drive-continue-button"
            >
              CONTINUE →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
