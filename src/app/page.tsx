import Link from "next/link";

export default function HomePage() {
  return (
    <main className="roam-page">
      <section className="roam-desk">

        {/* =====================================================
            FINAL ROAMLAB MASTER HERO
        ===================================================== */}

        <img
          src="/wild-desk.jpg"
          alt="RoamLab — Go Wild. Show It."
          className="roam-background"
          draggable={false}
        />


        {/* =====================================================
            DESK SYSTEMS
        ===================================================== */}


        {/* BADGE + ACHIEVEMENTS */}

        <Link
          href="/badges"
          className="desk-zone zone-badge"
          aria-label="Achievements"
        />


        {/* EXPLORE */}

        <Link
          href="/explore"
          className="desk-zone zone-explore"
          aria-label="Explore"
        />


        {/* ADVENTURE CHECKLIST */}

        <Link
          href="/prepare"
          className="desk-zone zone-checklist"
          aria-label="Adventure Checklist"
        />


        {/* VEHICLE + WAYS IN */}

        <Link
          href="/ways-in"
          className="desk-zone zone-vehicle"
          aria-label="Ways In"
        />


        {/* BACKPACK + PREPARE */}

        <Link
          href="/prepare"
          className="desk-zone zone-backpack"
          aria-label="Prepare"
        />


        {/* FIRST AID + SAFETY */}

        <Link
          href="/safety"
          className="desk-zone zone-firstaid"
          aria-label="Safety"
        />


        {/* FIELD GUIDE + LEARN */}

        <Link
          href="/learn"
          className="desk-zone zone-guide"
          aria-label="Learn"
        />


        {/* JOURNAL + MY WILD JOURNAL */}

        <Link
          href="/journal"
          className="desk-zone zone-journal"
          aria-label="My Wild Journal"
        />


        {/* POLAROID + THE WILD WALL */}

        <Link
          href="/stories"
          className="desk-zone zone-stories"
          aria-label="The Wild Wall"
        />


        {/* COMPASS + PLAN YOUR WILD */}

        <Link
          href="/plan"
          className="desk-zone zone-plan"
          aria-label="Plan Your Wild"
        />


        {/* =====================================================
            TOP NAVIGATION
        ===================================================== */}

        <Link
          href="/explore"
          className="top-zone top-explore"
          aria-label="Explore"
        />

        <Link
          href="/plan"
          className="top-zone top-plan"
          aria-label="Plan"
        />

        <Link
          href="/prepare"
          className="top-zone top-prepare"
          aria-label="Prepare"
        />

        <Link
          href="/safety"
          className="top-zone top-safety"
          aria-label="Safety"
        />

        <Link
          href="/learn"
          className="top-zone top-learn"
          aria-label="Learn"
        />

        <Link
          href="/journal"
          className="top-zone top-journal"
          aria-label="Journal"
        />

        <Link
          href="/stories"
          className="top-zone top-stories"
          aria-label="Stories"
        />

        <Link
          href="/badges"
          className="top-zone top-badges"
          aria-label="Badges"
        />


        {/* SIGN IN */}

        <Link
          href="/signin"
          className="top-zone top-signin"
          aria-label="Sign In"
        />


        {/* TOP RIGHT CTA */}

        <Link
          href="/start-here"
          className="top-zone top-start"
          aria-label="Start Your Wild"
        />


        {/* =====================================================
            CENTER START YOUR WILD
        ===================================================== */}

        <Link
          href="/start-here"
          className="center-start-zone"
          aria-label="Start Your Wild"
        />

      </section>
    </main>
  );
}
