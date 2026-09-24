"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getOrCreateCurrentWild,
  updateWildActivities,
  updateWildWayIn,
} from "@/lib/wildStore";

import type {
  WildActivity,
  WildWayIn,
} from "@/types/wild";

export default function WaysInPage() {
  const router = useRouter();

  function startWild(
    wayIn: WildWayIn,
    activities: WildActivity[]
  ) {
    /*
     * Every Way In starts / continues the SAME Current Wild.
     */
    getOrCreateCurrentWild("My Wild");

    /*
     * Save the selected entry mode.
     */
    updateWildWayIn(wayIn);

    /*
     * Seed the Wild with its primary activity.
     * More activities can be added later in the planning flow.
     */
    updateWildActivities(activities);

    /*
     * Budget belongs to the whole Wild, not to Drive / Hike /
     * Ride / Paddle, so every Way In goes through the same
     * Total Wild Budget step first.
     */
    router.push("/wild-plan/budget");
  }

  function startDriveWild() {
    startWild("drive", ["drive"]);
  }

  function startHikeWild() {
    startWild("hike", ["hike"]);
  }

  function startRideWild() {
    startWild("ride", ["bike"]);
  }

  function startPaddleWild() {
    startWild("paddle", ["paddle"]);
  }

  return (
    <main className="wv2-page">
      <section className="wv2-stage">
        {/* BACKGROUND */}
        <img
          src="/ways-in-desk.jpg"
          alt="RoamLab — Ways In"
          className="wv2-bg"
          draggable={false}
        />

        {/* TOP NAV */}
        <nav className="wv2-nav">
          <Link href="/" className="wv2-brand">
            ROAMLAB
          </Link>

          <div className="wv2-nav-links">
            <Link href="/explore">
              EXPLORE
            </Link>

            <Link href="/wild-plan">
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
            href="/ways-in"
            className="wv2-start"
          >
            START YOUR WILD →
          </Link>
        </nav>

        {/* DRIVE */}
        <button
          type="button"
          onClick={startDriveWild}
          className="wv2-zone wv2-drive"
          aria-label="Drive"
        />

        {/* HIKE */}
        <button
          type="button"
          onClick={startHikeWild}
          className="wv2-zone wv2-hike"
          aria-label="Hike"
        />

        {/* RIDE */}
        <button
          type="button"
          onClick={startRideWild}
          className="wv2-zone wv2-ride"
          aria-label="Ride"
        />

        {/* PADDLE */}
        <button
          type="button"
          onClick={startPaddleWild}
          className="wv2-zone wv2-paddle"
          aria-label="Paddle"
        />

        {/* NOT SURE */}
        <Link
          href="/wild-plan"
          className="wv2-zone wv2-unsure"
          aria-label="Not sure? Plan your Wild"
        />

        {/* LOGO HOTSPOT */}
        <Link
          href="/"
          className="wv2-logo"
          aria-label="RoamLab Home"
        />
      </section>
    </main>
  );
}
