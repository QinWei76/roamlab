import Link from "next/link";

export default function WaysInPage() {
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
            <Link href="/plan">PLAN</Link>
            <Link href="/prepare">PREPARE</Link>
            <Link href="/safety">SAFETY</Link>
            <Link href="/learn">LEARN</Link>
            <Link href="/journal">JOURNAL</Link>
            <Link href="/stories">STORIES</Link>
            <Link href="/badges">BADGES</Link>
          </div>

          <Link href="/signin" className="wv2-signin">
            SIGN IN
          </Link>

          <Link href="/start-here" className="wv2-start">
            START YOUR WILD →
          </Link>
        </nav>

        {/* DRIVE */}
        <a
          href="/ways-in/drive"
          className="wv2-zone wv2-drive"
          aria-label="Drive"
        />

        {/* HIKE */}
        <a
          href="/ways-in/hike"
          className="wv2-zone wv2-hike"
          aria-label="Hike"
        />

        {/* RIDE */}
        <a
          href="/ways-in/ride"
          className="wv2-zone wv2-ride"
          aria-label="Ride"
        />

        {/* PADDLE */}
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
