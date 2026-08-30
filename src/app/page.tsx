import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wildHome">
      <section className="wildHero">
        {/* Final approved RoamLab Wild Desk visual */}
        <div className="wildHeroImage" />

        {/* =========================
            MAIN VISUAL HOTSPOTS
           ========================= */}

        {/* ACHIEVEMENTS */}
        <Link
          href="/badges"
          className="hotspot hotspotBadges"
          aria-label="Achievements"
        />

        {/* EXPLORE */}
        <Link
          href="/explore"
          className="hotspot hotspotExplore"
          aria-label="Explore"
        />

        {/* WAYS IN / VEHICLE */}
        <Link
          href="/ways-in"
          className="hotspot hotspotWaysIn"
          aria-label="Ways In"
        />

        {/* PLAN YOUR WILD */}
        <Link
          href="/plan"
          className="hotspot hotspotPlan"
          aria-label="Plan Your Wild"
        />

        {/* PREPARE */}
        <Link
          href="/prepare"
          className="hotspot hotspotPrepare"
          aria-label="Prepare"
        />

        {/* SAFETY */}
        <Link
          href="/safety"
          className="hotspot hotspotSafety"
          aria-label="Safety"
        />

        {/* LEARN */}
        <Link
          href="/learn"
          className="hotspot hotspotLearn"
          aria-label="Learn"
        />

        {/* MY WILD JOURNAL */}
        <Link
          href="/journal"
          className="hotspot hotspotJournal"
          aria-label="My Wild Journal"
        />

        {/* THE WILD WALL */}
        <Link
          href="/stories"
          className="hotspot hotspotStories"
          aria-label="The Wild Wall"
        />

        {/* =========================
            HEADER HOTSPOTS
           ========================= */}

        {/* EXPLORE NAV */}
        <Link
          href="/explore"
          className="navHotspot navExplore"
          aria-label="Explore"
        />

        {/* PLAN NAV */}
        <Link
          href="/plan"
          className="navHotspot navPlan"
          aria-label="Plan"
        />

        {/* PREPARE NAV */}
        <Link
          href="/prepare"
          className="navHotspot navPrepare"
          aria-label="Prepare"
        />

        {/* LEARN NAV */}
        <Link
          href="/learn"
          className="navHotspot navLearn"
          aria-label="Learn"
        />

        {/* STORIES NAV */}
        <Link
          href="/stories"
          className="navHotspot navStories"
          aria-label="Stories"
        />

        {/* SIGN IN */}
        <Link
          href="/signin"
          className="navHotspot signInHotspot"
          aria-label="Sign In"
        />

        {/* START YOUR WILD */}
        <Link
          href="/start-here"
          className="navHotspot startWildHotspot"
          aria-label="Start Your Wild"
        />

        {/* CENTER CTA */}
        <Link
          href="/start-here"
          className="navHotspot centerStartHotspot"
          aria-label="Start Your Wild"
        />
      </section>

      <style>{`
        /* =========================
           BASE
           ========================= */

        .wildHome {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #0d0d0d;
          overflow-x: hidden;
        }

        /*
          IMPORTANT:

          This is a 16:9 master canvas.

          We use aspect-ratio instead of
          background-size: cover.

          This prevents the browser from
          cutting off the badge, backpack,
          journal, or bottom edge.
        */

        .wildHero {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          min-height: 0;
          overflow: hidden;
          background: #111;
        }

        .wildHeroImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image: url("/wild-desk.jpg");

          /*
            Show the COMPLETE final image.
            No cropping.
          */

          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;

          z-index: 1;
        }

        /* =========================
           HOTSPOT BASE
           ========================= */

        .hotspot,
        .navHotspot {
          position: absolute;
          z-index: 10;
          display: block;
          cursor: pointer;
          border-radius: 10px;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        /*
          Very subtle interaction.

          We don't add text.
          We don't change the design.

          Only a small orange glow
          tells the user this area
          is interactive.
        */

        .hotspot::after,
        .navHotspot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .hotspot:hover::after,
        .navHotspot:hover::after {
          opacity: 1;
          box-shadow:
            inset 0 0 0 1px rgba(238, 145, 47, 0.45),
            0 0 24px rgba(238, 145, 47, 0.18);
        }

        .hotspot:hover,
        .navHotspot:hover {
          transform: scale(1.01);
        }

        .hotspot:active,
        .navHotspot:active {
          transform: scale(0.98);
        }

        /* =========================
           DESKTOP HOTSPOTS
           Based on the 16:9 canvas
           ========================= */

        /* ACHIEVEMENTS / TOP LEFT */

        .hotspotBadges {
          left: 14%;
          top: 12%;
          width: 16%;
          height: 12%;
        }

        /* EXPLORE */

        .hotspotExplore {
          left: 6%;
          top: 25%;
          width: 15%;
          height: 16%;
        }

        /* WAYS IN / VEHICLE */

        .hotspotWaysIn {
          left: 15%;
          top: 35%;
          width: 22%;
          height: 22%;
        }

        /* PLAN YOUR WILD */

        .hotspotPlan {
          left: 72%;
          top: 30%;
          width: 18%;
          height: 18%;
        }

        /* PREPARE / BACKPACK */

        .hotspotPrepare {
          left: 5%;
          top: 53%;
          width: 27%;
          height: 38%;
        }

        /* SAFETY / FIRST AID */

        .hotspotSafety {
          left: 37%;
          top: 68%;
          width: 20%;
          height: 24%;
        }

        /* LEARN / FIELD GUIDE */

        .hotspotLearn {
          left: 58%;
          top: 70%;
          width: 20%;
          height: 24%;
        }

        /* MY WILD JOURNAL */

        .hotspotJournal {
          left: 73%;
          top: 52%;
          width: 22%;
          height: 42%;
        }

        /* THE WILD WALL / POLAROIDS */

        .hotspotStories {
          left: 63%;
          top: 7%;
          width: 27%;
          height: 23%;
        }

        /* =========================
           HEADER HOTSPOTS
           ========================= */

        .navExplore {
          left: 32%;
          top: 2%;
          width: 6%;
          height: 7%;
        }

        .navPlan {
          left: 39%;
          top: 2%;
          width: 5%;
          height: 7%;
        }

        .navPrepare {
          left: 45%;
          top: 2%;
          width: 7%;
          height: 7%;
        }

        .navLearn {
          left: 53%;
          top: 2%;
          width: 6%;
          height: 7%;
        }

        .navStories {
          left: 60%;
          top: 2%;
          width: 7%;
          height: 7%;
        }

        /* SIGN IN */

        .signInHotspot {
          left: 78%;
          top: 1%;
          width: 7%;
          height: 8%;
        }

        /* TOP RIGHT START BUTTON */

        .startWildHotspot {
          left: 85%;
          top: 1%;
          width: 14%;
          height: 9%;
          border-radius: 999px;
        }

        /* CENTER START BUTTON */

        .centerStartHotspot {
          left: 39%;
          top: 55%;
          width: 22%;
          height: 10%;
          border-radius: 12px;
        }

        /* =========================
           RESPONSIVE
           ========================= */

        /*
          Desktop:
          Preserve the complete 16:9 artwork.
        */

        @media (min-width: 769px) {
          .wildHero {
            max-height: 100vh;
          }
        }

        /*
          Mobile:
          Keep the entire artwork visible.
          The hero becomes taller naturally
          according to the 16:9 ratio.
        */

        @media (max-width: 768px) {

          .wildHero {
            width: 100%;
            aspect-ratio: 16 / 9;
          }

          /*
            Make hotspots easier to tap
          */

          .hotspot,
          .navHotspot {
            min-width: 28px;
            min-height: 28px;
          }
        }
      `}</style>
    </main>
  );
}
