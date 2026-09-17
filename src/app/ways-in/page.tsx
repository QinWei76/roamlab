"use client";

import Link from "next/link";
import {
  getOrCreateCurrentWild,
  updateWildActivities,
  updateWildWayIn,
} from "@/lib/wildStore";

export default function WaysInPage() {
  const startDrive = () => {
    getOrCreateCurrentWild("My Wild");
    updateWildWayIn("drive");
    updateWildActivities(["drive"]);
  };

  return (
    <main className="waysin-page">
      <section className="waysin-stage">
        {/* BACKGROUND */}
        <img
          src="/ways-in-desk.jpg"
          alt="RoamLab Ways In"
          className="waysin-background"
          draggable={false}
        />

        {/* ==============================
            DRIVE
        ============================== */}
        <Link
          href="/ways-in/drive"
          className="waysin-hotspot waysin-drive"
          aria-label="Drive"
          onClick={startDrive}
        />

        {/* ==============================
            HIKE
        ============================== */}
        <Link
          href="/ways-in/hike"
          className="waysin-hotspot waysin-hike"
          aria-label="Hike"
        />

        {/* ==============================
            RIDE
        ============================== */}
        <Link
          href="/ways-in/ride"
          className="waysin-hotspot waysin-ride"
          aria-label="Ride"
        />

        {/* ==============================
            PADDLE
        ============================== */}
        <Link
          href="/ways-in/paddle"
          className="waysin-hotspot waysin-paddle"
          aria-label="Paddle"
        />

        {/* HOME / ROAMLAB LOGO */}
        <Link
          href="/"
          className="waysin-home"
          aria-label="RoamLab Home"
        />

        <style jsx global>{`
          .waysin-page {
            width: 100%;
            min-height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #090a08;
          }

          .waysin-stage {
            position: relative;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background: #090a08;
          }

          .waysin-background {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            user-select: none;
            pointer-events: none;
          }

          .waysin-hotspot,
          .waysin-home {
            position: absolute;
            z-index: 10;
            display: block;
            cursor: pointer;
            border-radius: 18px;
            transition:
              background 180ms ease,
              box-shadow 180ms ease,
              transform 180ms ease;
          }

          .waysin-hotspot:hover {
            background: rgba(214, 163, 91, 0.035);
            box-shadow:
              0 0 28px rgba(214, 163, 91, 0.08),
              inset 0 0 24px rgba(214, 163, 91, 0.025);
            transform: translateY(-1px);
          }

          /*
           * Four physical-object interaction zones.
           * Broad invisible hotspots are intentional.
           */

          .waysin-drive {
            left: 4%;
            top: 27%;
            width: 22%;
            height: 53%;
          }

          .waysin-hike {
            left: 27%;
            top: 27%;
            width: 22%;
            height: 53%;
          }

          .waysin-ride {
            left: 51%;
            top: 27%;
            width: 22%;
            height: 53%;
          }

          .waysin-paddle {
            left: 74%;
            top: 27%;
            width: 22%;
            height: 53%;
          }

          .waysin-home {
            left: 1.5%;
            top: 1.5%;
            width: 14%;
            height: 9%;
          }

          @media (max-width: 900px) {
            .waysin-background {
              object-position: center;
            }

            .waysin-drive,
            .waysin-hike,
            .waysin-ride,
            .waysin-paddle {
              top: 24%;
              height: 58%;
            }
          }
        `}</style>
      </section>
    </main>
  );
}
