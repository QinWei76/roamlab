import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wildHome">
      <section className="wildHero">
        {/* Final RoamLab homepage image */}
        <img
          src="/wild-desk.jpg"
          alt="RoamLab"
          className="wildHeroImage"
        />

        {/* =========================
            INTERACTIVE HOTSPOTS
           ========================= */}

        <Link
          href="/badges"
          className="hotspot hotspotBadges"
          aria-label="Achievements"
        />

        <Link
          href="/explore"
          className="hotspot hotspotExplore"
          aria-label="Explore"
        />

        <Link
          href="/ways-in"
          className="hotspot hotspotWaysIn"
          aria-label="Ways In"
        />

        <Link
          href="/plan"
          className="hotspot hotspotPlan"
          aria-label="Plan Your Wild"
        />

        <Link
          href="/prepare"
          className="hotspot hotspotPrepare"
          aria-label="Prepare"
        />

        <Link
          href="/safety"
          className="hotspot hotspotSafety"
          aria-label="Safety"
        />

        <Link
          href="/learn"
          className="hotspot hotspotLearn"
          aria-label="Learn"
        />

        <Link
          href="/journal"
          className="hotspot hotspotJournal"
          aria-label="My Wild Journal"
        />

        <Link
          href="/stories"
          className="hotspot hotspotStories"
          aria-label="The Wild Wall"
        />

        {/* =========================
            NAVIGATION HOTSPOTS
           ========================= */}

        <Link
          href="/explore"
          className="navHotspot navExplore"
          aria-label="Explore"
        />

        <Link
          href="/plan"
          className="navHotspot navPlan"
          aria-label="Plan"
        />

        <Link
          href="/prepare"
          className="navHotspot navPrepare"
          aria-label="Prepare"
        />

        <Link
          href="/safety"
          className="navHotspot navSafety"
          aria-label="Safety"
        />

        <Link
          href="/learn"
          className="navHotspot navLearn"
          aria-label="Learn"
        />

        <Link
          href="/journal"
          className="navHotspot navJournal"
          aria-label="Journal"
        />

        <Link
          href="/stories"
          className="navHotspot navStories"
          aria-label="Stories"
        />

        <Link
          href="/badges"
          className="navHotspot navBadges"
          aria-label="Badges"
        />

        <Link
          href="/signin"
          className="navHotspot signInHotspot"
          aria-label="Sign In"
        />

        <Link
          href="/start-here"
          className="navHotspot startWildHotspot"
          aria-label="Start Your Wild"
        />

        {/* Center CTA */}

        <Link
          href="/start-here"
          className="navHotspot centerStartHotspot"
          aria-label="Start Your Wild"
        />
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .wildHome {
          width: 100%;
          margin: 0;
          padding: 0;
          background: #0b0b0b;
          overflow-x: hidden;
        }

        /*
          MASTER CANVAS

          The image determines the height.

          This means:
          - no stretching
          - no cropping
          - no distortion
        */

        .wildHero {
          position: relative;
          width: 100%;
          line-height: 0;
          overflow: hidden;
          background: #111;
        }

        .wildHeroImage {
          display: block;
          width: 100%;
          height: auto;
          margin: 0;
          padding: 0;

          /*
            Critical:
            preserve original image ratio
          */

          object-fit: contain;
        }

        /*
          =========================
          HOTSPOT BASE
          =========================
        */

        .hotspot,
        .navHotspot {
          position: absolute;
          z-index: 10;
          display: block;
          cursor: pointer;
          border-radius: 8px;
          -webkit-tap-highlight-color: transparent;
        }

        /*
          Better interaction feedback

          Invisible normally.
          Soft orange glow on hover.
        */

        .hotspot::after,
        .navHotspot::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          opacity: 0;
          pointer-events: none;

          border: 1px solid rgba(241, 151, 57, 0.5);

          box-shadow:
            0 0 14px rgba(241, 151, 57, 0.18),
            inset 0 0 14px rgba(241, 151, 57, 0.08);

          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        .hotspot:hover::after,
        .navHotspot:hover::after {
          opacity: 1;
          transform: scale(1.02);
        }

        .hotspot:active,
        .navHotspot:active {
          transform: scale(0.98);
        }

        /*
          =========================
          OBJECT HOTSPOTS
          =========================
        */

        /* Badge */

        .hotspotBadges {
          left: 1%;
          top: 8%;
          width: 18%;
          height: 18%;
        }

        /* Explore */

        .hotspotExplore {
          left: 5%;
          top: 27%;
          width: 16%;
          height: 16%;
        }

        /* Vehicle / Ways In */

        .hotspotWaysIn {
          left: 15%;
          top: 32%;
          width: 20%;
          height: 23%;
        }

        /* Plan */

        .hotspotPlan {
          left: 71%;
          top: 29%;
          width: 18%;
          height: 18%;
        }

        /* Backpack */

        .hotspotPrepare {
          left: 4%;
          top: 52%;
          width: 30%;
          height: 42%;
        }

        /* First Aid */

        .hotspotSafety {
          left: 36%;
          top: 67%;
          width: 22%;
          height: 26%;
        }

        /* Field Guide */

        .hotspotLearn {
          left: 57%;
          top: 63%;
          width: 18%;
          height: 30%;
        }

        /* Journal */

        .hotspotJournal {
          left: 74%;
          top: 48%;
          width: 22%;
          height: 45%;
        }

        /* Wild Wall */

        .hotspotStories {
          left: 62%;
          top: 7%;
          width: 25%;
          height: 25%;
        }

        /*
          =========================
          TOP NAVIGATION
          =========================
        */

        .navExplore {
          left: 18%;
          top: 0;
          width: 6%;
          height: 8%;
        }

        .navPlan {
          left: 25%;
          top: 0;
          width: 5%;
          height: 8%;
        }

        .navPrepare {
          left: 31%;
          top: 0;
          width: 7%;
          height: 8%;
        }

        .navSafety {
          left: 39%;
          top: 0;
          width: 6%;
          height: 8%;
        }

        .navLearn {
          left: 46%;
          top: 0;
          width: 6%;
          height: 8%;
        }

        .navJournal {
          left: 53%;
          top: 0;
          width: 7%;
          height: 8%;
        }

        .navStories {
          left: 61%;
          top: 0;
          width: 6%;
          height: 8%;
        }

        .navBadges {
          left: 68%;
          top: 0;
          width: 7%;
          height: 8%;
        }

        /* Sign In */

        .signInHotspot {
          left: 74%;
          top: 0;
          width: 9%;
          height: 8%;
        }

        /* Top Start Your Wild */

        .startWildHotspot {
          left: 84%;
          top: 0;
          width: 15%;
          height: 8%;
          border-radius: 999px;
        }

        /* Center CTA */

        .centerStartHotspot {
          left: 38%;
          top: 54%;
          width: 24%;
          height: 11%;
          border-radius: 10px;
        }

        /*
          =========================
          MOBILE
          =========================
        */

        @media (max-width: 768px) {

          .wildHero {
            min-width: 900px;
          }

          .wildHome {
            overflow-x: auto;
          }

          .hotspot::after,
          .navHotspot::after {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
