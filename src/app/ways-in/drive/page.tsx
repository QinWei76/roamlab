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

        <nav className="ways-real-nav">
          <div className="ways-real-links">
            <Link href="/explore">EXPLORE</Link>
            <Link href="/plan">PLAN</Link>
            <Link href="/prepare">PREPARE</Link>
            <Link href="/safety">SAFETY</Link>
            <Link href="/learn">LEARN</Link>
            <Link href="/journal">JOURNAL</Link>
            <Link href="/stories">STORIES</Link>
            <Link href="/badges">BADGES</Link>
          </div>

          <Link href="/signin" className="ways-real-signin">
            SIGN IN
          </Link>

          <Link href="/start-here" className="ways-real-start">
            START YOUR WILD →
          </Link>
        </nav>

        <Link
          href="/ways-in/drive"
          className="ways-drive-final"
          aria-label="Choose Drive"
        />

        <Link
          href="/ways-in/hike"
          className="ways-hotspot ways-hotspot-hike"
          aria-label="Choose Hike"
        />

        <Link
          href="/ways-in/ride"
          className="ways-hotspot ways-hotspot-ride"
          aria-label="Choose Ride"
        />

        <Link
          href="/ways-in/paddle"
          className="ways-hotspot ways-hotspot-paddle"
          aria-label="Choose Paddle"
        />

        <Link
          href="/plan"
          className="ways-hotspot ways-hotspot-unsure"
          aria-label="Not sure? Start here"
        />

        <Link
          href="/"
          className="ways-logo-hotspot"
          aria-label="Back to RoamLab home"
        />
      </section>
    </main>
  );
}
