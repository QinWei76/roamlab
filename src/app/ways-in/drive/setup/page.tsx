"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

const vehicleData: Record<
  VehicleKey,
  {
    label: string;
    image: string;
  }
> = {
  suv: {
    label: "SUV",
    image: "/vehicle-model-suv.png",
  },

  truck: {
    label: "TRUCK",
    image: "/vehicle-model-truck.png",
  },

  van: {
    label: "VAN",
    image: "/vehicle-model-van.png",
  },

  crossover: {
    label: "CROSSOVER / AWD",
    image: "/vehicle-model-crossover.png",
  },

  city: {
    label: "2WD / CITY CAR",
    image: "/vehicle-model-city.png",
  },
};

const tripStyles: {
  id: TripKey;
  label: string;
}[] = [
  {
    id: "weekend",
    label: "Weekend Escape",
  },
  {
    id: "road-trip",
    label: "Road Trip",
  },
  {
    id: "basecamp",
    label: "Basecamp",
  },
  {
    id: "remote",
    label: "Remote / Off-Grid",
  },
];

export default function TripStylePage() {
  const [vehicle, setVehicle] = useState<VehicleKey>("suv");
  const [selectedTrip, setSelectedTrip] = useState<TripKey | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const vehicleParam = params.get("vehicle");

    if (
      vehicleParam === "suv" ||
      vehicleParam === "truck" ||
      vehicleParam === "van" ||
      vehicleParam === "crossover" ||
      vehicleParam === "city"
    ) {
      setVehicle(vehicleParam);
    }

    setReady(true);
  }, []);

  const currentVehicle = vehicleData[vehicle];

  const selectedTripLabel =
    tripStyles.find((trip) => trip.id === selectedTrip)?.label ?? "";

  return (
    <main className="trip-desk-page">
      <section className="trip-desk-stage">
        <img
          src="/trip-style-desk-v2.jpg"
          alt="RoamLab Trip Style Planning Desk"
          className="trip-desk-image"
          draggable={false}
        />

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

        {ready && (
          <div className="trip-selected-vehicle-wrap">
            <img
              key={currentVehicle.image}
              src={currentVehicle.image}
              alt={currentVehicle.label}
              className="trip-selected-vehicle-image"
              draggable={false}
            />

            <div className="trip-selected-vehicle-tag">
              <span>VEHICLE</span>
              <strong>{currentVehicle.label} ✓</strong>
            </div>
          </div>
        )}

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
          className={`trip-style-zone trip-zone-basecamp ${
            selectedTrip === "basecamp" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedTrip("basecamp")}
          aria-label="Select Basecamp"
        />

        <button
          type="button"
          className={`trip-style-zone trip-zone-remote ${
            selectedTrip === "remote" ? "is-selected" : ""
          }`}
          onClick={() => setSelectedTrip("remote")}
          aria-label="Select Remote Off-Grid"
        />

        <Link
          href="/"
          className="trip-logo-hotspot"
          aria-label="Back to RoamLab home"
        />

        <Link href="/ways-in/drive" className="trip-back-button">
          ← VEHICLE
        </Link>

        {selectedTrip && (
          <div className="trip-selection-panel">
            <div className="trip-selection-summary">
              <span>YOUR PLAN</span>

              <strong>{selectedTripLabel}</strong>

              <small>
                {currentVehicle.label} · STEP 2 OF 5
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
