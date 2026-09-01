import Link from "next/link";

export default function Home() {
  return (
    <main className="roam-page">
      <div className="roam-desk">

        {/* 最终定稿首页 */}
        <img
          src="/wild-desk.jpg"
          alt="RoamLab Wild Desk"
          className="roam-background"
          draggable={false}
        />

        {/* =========================
            INVISIBLE CLICK ZONES
            不显示边框，不改变原图
        ========================== */}

        {/* 徽章 */}
        <Link
          href="/badges"
          className="desk-zone zone-badge"
          aria-label="Achievements"
        >
          <span className="zone-tooltip">
            ACHIEVEMENTS
            <small>Earn badges. Track progress.</small>
          </span>
        </Link>

        {/* Explore */}
        <Link
          href="/explore"
          className="desk-zone zone-explore"
          aria-label="Explore"
        >
          <span className="zone-tooltip">
            EXPLORE
            <small>Find places. Discover wild.</small>
          </span>
        </Link>
         {/* Adventure Checklist */}
<Link
  href="/prepare"
  className="desk-zone zone-checklist"
  aria-label="Adventure Checklist"
>
  <span className="zone-tooltip">
    TRIP CHECKLIST
    <small>Check before you go.</small>
  </span>
</Link>
        {/* 越野车 */}
        <Link
          href="/ways-in"
          className="desk-zone zone-vehicle"
          aria-label="Ways In"
        >
          <span className="zone-tooltip">
            WAYS IN
            <small>How do you go wild?</small>
          </span>
        </Link>

        {/* 背包 */}
        <Link
          href="/prepare"
          className="desk-zone zone-backpack"
          aria-label="Prepare"
        >
          <span className="zone-tooltip">
            PREPARE
            <small>Pack smarter. Go lighter.</small>
          </span>
        </Link>

        {/* 急救包 */}
        <Link
          href="/safety"
          className="desk-zone zone-firstaid"
          aria-label="Safety"
        >
          <span className="zone-tooltip">
            SAFETY
            <small>Be ready. Stay safe.</small>
          </span>
        </Link>

        {/* Field Guide */}
        <Link
          href="/learn"
          className="desk-zone zone-guide"
          aria-label="Field Guide"
        >
          <span className="zone-tooltip">
            FIELD GUIDE
            <small>Skills, knowledge & guides.</small>
          </span>
        </Link>

        {/* My Wild Journal */}
        <Link
          href="/journal"
          className="desk-zone zone-journal"
          aria-label="My Wild Journal"
        >
          <span className="zone-tooltip">
            MY WILD JOURNAL
            <small>Your trips. Your story.</small>
          </span>
        </Link>

        {/* Wild Wall / Stories */}
        <Link
          href="/stories"
          className="desk-zone zone-stories"
          aria-label="The Wild Wall"
        >
          <span className="zone-tooltip">
            THE WILD WALL
            <small>Real people. Real wild.</small>
          </span>
        </Link>

        {/* Plan / Compass */}
        <Link
          href="/plan"
          className="desk-zone zone-plan"
          aria-label="Plan Your Wild"
        >
          <span className="zone-tooltip">
            PLAN YOUR WILD
            <small>Routes, weather, timing & more.</small>
          </span>
        </Link>

      </div>
    </main>
  );
}
