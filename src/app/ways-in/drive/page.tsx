"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DrivePage() {
  const router = useRouter();

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const chooseVehicle = (vehicle: string) => {
    setSelectedVehicle(vehicle);

    window.setTimeout(() => {
      router.push(`/ways-in/drive/setup?vehicle=${vehicle}`);
    }, 220);
  };

  return (
    <main className="drive-desk-page">
      <section className="drive-desk-stage">
        <img
          src="/drive-desk.jpg"
          alt="RoamLab Drive vehicle selection desk"
          className="drive-desk-image"
          draggable={false}
        />

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

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-suv ${
            selectedVehicle === "suv" ? "is-selected" : ""
          }`}
          onClick={() => chooseVehicle("suv")}
          aria-label="Choose SUV"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-truck ${
            selectedVehicle === "truck" ? "is-selected" : ""
          }`}
          onClick={() => chooseVehicle("truck")}
          aria-label="Choose Truck"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-van ${
            selectedVehicle === "van" ? "is-selected" : ""
          }`}
          onClick={() => chooseVehicle("van")}
          aria-label="Choose Van"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-crossover ${
            selectedVehicle === "crossover" ? "is-selected" : ""
          }`}
          onClick={() => chooseVehicle("crossover")}
          aria-label="Choose Crossover or AWD"
        />

        <button
          type="button"
          className={`drive-vehicle-zone drive-zone-city ${
            selectedVehicle === "city" ? "is-selected" : ""
          }`}
          onClick={() => chooseVehicle("city")}
          aria-label="Choose 2WD or City Car"
        />

        <Link
          href="/"
          className="drive-logo-hotspot"
          aria-label="Back to RoamLab home"
        />

        <Link href="/ways-in" className="drive-back-button">
          ← WAYS IN
        </Link>
      </section>
    </main>
  );
}
