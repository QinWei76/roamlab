"use client";

import Link from "next/link";
import { useState } from "react";

type Vehicle =
  | "suv"
  | "truck"
  | "van"
  | "crossover"
  | "city";

export default function DrivePage() {
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const chooseVehicle = (vehicle: Vehicle) => {
    setSelected(vehicle);

    window.setTimeout(() => {
      window.location.href =
        `/ways-in/drive/setup?vehicle=${vehicle}`;
    }, 180);
  };

  return (
    <main className="drv2-page">
      <section className="drv2-stage">
        <img
          src="/drive-desk.jpg"
          alt="RoamLab vehicle selection"
          className="drv2-bg"
          draggable={false}
        />

        {/* REAL NAV */}
        <nav className="drv2-nav">
          <div className="drv2-nav-links">
            <Link href="/explore">EXPLORE</Link>
            <Link href="/plan">PLAN</Link>
            <Link href="/prepare">PREPARE</Link>
            <Link href="/safety">SAFETY</Link>
            <Link href="/learn">LEARN</Link>
            <Link href="/journal">JOURNAL</Link>
            <Link href="/stories">STORIES</Link>
            <Link href="/badges">BADGES</Link>
          </div>

          <Link href="/signin" className="drv2-signin">
            SIGN IN
          </Link>

          <Link href="/start-here" className="drv2-start">
            START YOUR WILD →
          </Link>
        </nav>

        {/* SUV */}
        <button
          type="button"
          className={`drv2-zone drv2-suv ${
            selected === "suv" ? "selected" : ""
          }`}
          onClick={() => chooseVehicle("suv")}
          aria-label="Choose SUV"
        />

        {/* TRUCK */}
        <button
          type="button"
          className={`drv2-zone drv2-truck ${
            selected === "truck" ? "selected" : ""
          }`}
          onClick={() => chooseVehicle("truck")}
          aria-label="Choose Truck"
        />

        {/* VAN */}
        <button
          type="button"
          className={`drv2-zone drv2-van ${
            selected === "van" ? "selected" : ""
          }`}
          onClick={() => chooseVehicle("van")}
          aria-label="Choose Van"
        />

        {/* CROSSOVER */}
        <button
          type="button"
          className={`drv2-zone drv2-crossover ${
            selected === "crossover" ? "selected" : ""
          }`}
          onClick={() => chooseVehicle("crossover")}
          aria-label="Choose Crossover AWD"
        />

        {/* CITY */}
        <button
          type="button"
          className={`drv2-zone drv2-city ${
            selected === "city" ? "selected" : ""
          }`}
          onClick={() => chooseVehicle("city")}
          aria-label="Choose City Car"
        />

        {/* LOGO */}
        <a
          href="/"
          className="drv2-logo"
          aria-label="RoamLab home"
        />

        {/* BACK */}
        <a
          href="/ways-in"
          className="drv2-back"
        >
          ← WAYS IN
        </a>
      </section>
    </main>
  );
}
