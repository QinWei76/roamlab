import Link from "next/link";

export default function WaysInPage() {
  return (
    <main className="ways-desk-page">
      <section className="ways-desk-stage">
        <img
          src="/ways-in-desk.jpg"
          alt="RoamLab Ways In planning desk"
          className="ways-desk-image"
          draggable={false}
        />

        {/* DRIVE */}
        <Link
          href="/ways-in/drive"
          className="ways-hotspot ways-hotspot-drive"
          aria-label="Drive"
        />

        {/* HIKE */}
        <Link
          href="/ways-in/hike"
          className="ways-hotspot ways-hotspot-hike"
          aria-label="Hike"
        />

        {/* RIDE */}
        <Link
          href="/ways-in/ride"
          className="ways-hotspot ways-hotspot-ride"
          aria-label="Ride"
        />

        {/* PADDLE */}
        <Link
          href="/ways-in/paddle"
          className="ways-hotspot ways-hotspot-paddle"
          aria-label="Paddle"
        />

        {/* NOT SURE */}
        <Link
          href="/plan"
          className="ways-hotspot ways-hotspot-unsure"
          aria-label="Not sure? Start here"
        />

        {/* ROAMLAB LOGO / BACK HOME */}
        <Link
          href="/"
          className="ways-home-hotspot"
          aria-label="Back to RoamLab home"
        />
      </section>
    </main>
  );
}
