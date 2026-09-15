"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getOrCreateCurrentWild,
  updateWildActivities,
  updateWildWayIn,
} from "@/lib/wildStore";


export default function WaysInPage() {
  const router = useRouter();


  /* =======================================================
     START A DRIVE WILD
     -------------------------------------------------------
     Ways In is one entry into a Wild.

     Clicking Drive:
     1. Gets or creates the Current Wild
     2. Sets Ways In = drive
     3. Adds Drive as an activity
     4. Continues into the existing Drive flow
     ======================================================= */

  function startDriveWild() {
    getOrCreateCurrentWild("My Wild");

    updateWildWayIn("drive");

    updateWildActivities(["drive"]);

    router.push("/ways-in/drive");
  }


  return (
    <main className="wv2-page">
      <section className="wv2-stage">
        <img
          src="/ways-in-desk.jpg"
          alt="RoamLab Ways In"
          className="wv2-bg"
          draggable={false}
        />

        {/* REAL NAV */}
        <nav className="wv2-nav">
          <div className="wv2-nav-links">
            <Link href="/explore">EXPLORE</Link>

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
            className="wv2-signin"
          >
            SIGN IN
          </Link>

          <Link
            href="/start-here"
            className="wv2-start"
          >
            START YOUR WILD →
          </Link>
        </nav>


        {/* =================================================
            DRIVE

            This is now connected to Current Wild.
            Visual hotspot remains unchanged.
           ================================================= */}

        <button
          type="button"
          onClick={startDriveWild}
          className="wv2-zone wv2-drive"
          aria-label="Drive"
        />


        {/* HIKE
            Not connected to Current Wild yet.
        */}

        <a
          href="/ways-in/hike"
          className="wv2-zone wv2-hike"
          aria-label="Hike"
        />


        {/* RIDE
            Not connected to Current Wild yet.
        */}

        <a
          href="/ways-in/ride"
          className="wv2-zone wv2-ride"
          aria-label="Ride"
        />


        {/* PADDLE
            Not connected to Current Wild yet.
        */}

        <a
          href="/ways-in/paddle"
          className="wv2-zone wv2-paddle"
          aria-label="Paddle"
        />


        {/* NOT SURE */}

        <a
          href="/plan"
          className="wv2-zone wv2-unsure"
          aria-label="Not sure? Start here"
        />


        {/* LOGO */}

        <a
          href="/"
          className="wv2-logo"
          aria-label="RoamLab home"
        />
      </section>
    </main>
  );
}
