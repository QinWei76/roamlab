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

  function startDriveWild() {
    getOrCreateCurrentWild("My Wild");

    updateWildWayIn("drive");
    updateWildActivities(["drive"]);

    router.push("/ways-in/drive");
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
            <Link href="/explore">EXPLORE</Link>

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
          className="wv2-zone wv2-hike"
          aria-label="Hike"
        />

        {/* RIDE */}
        <button
          type="button"
          className="wv2-zone wv2-ride"
          aria-label="Ride"
        />

        {/* PADDLE */}
        <button
          type="button"
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
