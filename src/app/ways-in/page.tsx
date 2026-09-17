"use client";

import Link from "next/link";
import {
  getOrCreateCurrentWild,
  updateWildActivities,
  updateWildWayIn,
} from "@/lib/wildStore";

type WayIn = "drive" | "hike" | "ride" | "paddle";

export default function WaysInPage() {
  const startWayIn = (wayIn: WayIn) => {
    getOrCreateCurrentWild("My Wild");

    updateWildWayIn(wayIn);
    updateWildActivities([wayIn]);
  };

  return (
    <main className="waysin-page">
      <section className="waysin-stage">
        <img
          src="/ways-in.jpg"
          alt="RoamLab — Ways In"
          className="waysin-bg"
          draggable={false}
        />

        {/* DRIVE */}
        <Link
          href="/ways-in/drive"
          className="waysin-zone waysin-drive"
          aria-label="Drive"
          onClick={() => startWayIn("drive")}
        />

        {/* HIKE */}
        <Link
          href="/ways-in/hike"
          className="waysin-zone waysin-hike"
          aria-label="Hike"
          onClick={() => startWayIn("hike")}
        />

        {/* RIDE */}
        <Link
          href="/ways-in/ride"
          className="waysin-zone waysin-ride"
          aria-label="Ride"
          onClick={() => startWayIn("ride")}
        />

        {/* PADDLE */}
        <Link
          href="/ways-in/paddle"
          className="waysin-zone waysin-paddle"
          aria-label="Paddle"
          onClick={() => startWayIn("paddle")}
        />

        {/* HOME */}
        <Link
          href="/"
          className="waysin-home"
          aria-label="Back to RoamLab Home"
        />
      </section>
    </main>
  );
}
