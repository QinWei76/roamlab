import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wildHome">
      <section className="wildHero">
        {/* =========================================
            FINAL ROAMLAB MASTER IMAGE
            ========================================= */}

        <img
          src="/wild-desk.jpg"
          alt="RoamLab - Go Wild. Show It."
          className="wildHeroImage"
        />

        {/* =========================================
            OBJECT HOTSPOTS
            These are intentionally precise.
            They sit on top of the actual objects.
            ========================================= */}

        {/* -----------------------------------------
            BADGE
            ----------------------------------------- */}

        <Link
          href="/badges"
          aria-label="RoamLab Achievements"
          className="objectHotspot badgeObject"
        />

        {/* Badge label */}
        <Link
          href="/badges"
          aria-label="Achievements"
          className="labelHotspot badgeLabel"
        />

        {/* -----------------------------------------
            EXPLORE CARD
            ----------------------------------------- */}

        <Link
          href="/explore"
          aria-label="Explore"
          className="labelHotspot exploreLabel"
        />

        {/* -----------------------------------------
            VEHICLE
            ----------------------------------------- */}

        <Link
          href="/ways-in"
          aria-label="Ways In"
          className="objectHotspot vehicleObject"
        />

        {/* Vehicle label */}
        <Link
          href="/ways-in"
          aria-label="Ways In"
          className="labelHotspot vehicleLabel"
        />

        {/* -----------------------------------------
            POLAROID / WILD WALL
            ----------------------------------------- */}

        <Link
          href="/stories"
          aria-label="The Wild Wall"
          className="objectHotspot polaroidObject"
        />

        <Link
          href="/stories"
          aria-label="The Wild Wall"
          className="labelHotspot wildWallLabel"
        />

        {/* -----------------------------------------
            COMPASS / PLAN
            ----------------------------------------- */}

        <Link
          href="/plan"
          aria-label="Plan Your Wild"
          className="objectHotspot compassObject"
        />

        <Link
          href="/plan"
          aria-label="Plan Your Wild"
          className="labelHotspot planLabel"
        />

        {/* -----------------------------------------
            BACKPACK
            ----------------------------------------- */}

        <Link
          href="/prepare"
          aria-label="Prepare"
          className="objectHotspot backpackObject"
        />

        <Link
          href="/prepare"
          aria-label="Prepare"
          className="labelHotspot prepareLabel"
        />

        {/* -----------------------------------------
            FIRST AID
            ----------------------------------------- */}

        <Link
          href="/safety"
          aria-label="Safety"
          className="objectHotspot firstAidObject"
        />

        <Link
          href="/safety"
          aria-label="Safety"
          className="labelHotspot safetyLabel"
        />

        {/* -----------------------------------------
            FIELD GUIDE
            ----------------------------------------- */}

        <Link
          href="/learn"
          aria-label="Learn"
          className="objectHotspot fieldGuideObject"
        />

        <Link
          href="/learn"
          aria-label="Learn"
          className="labelHotspot learnLabel"
        />

        {/* -----------------------------------------
            JOURNAL
            ----------------------------------------- */}

        <Link
          href="/journal"
          aria-label="My Wild Journal"
          className="objectHotspot journalObject"
        />

        <Link
          href="/journal"
          aria-label="My Wild Journal"
          className="labelHotspot journalLabel"
        />

        {/* =========================================
            CENTER CTA
            ========================================= */}

        <Link
          href="/start-here"
          aria-label="Start Your Wild"
          className="centerCtaHotspot"
        />

        {/* =========================================
            TOP NAVIGATION
            ========================================= */}

        <Link
          href="/explore"
          aria-label="Explore"
          className="navHotspot navExplore"
        />

        <Link
          href="/plan"
          aria-label="Plan"
          className="navHotspot navPlan"
        />

        <Link
          href="/prepare"
          aria-label="Prepare"
          className="navHotspot navPrepare"
        />

        <Link
          href="/safety"
          aria-label="Safety"
          className="navHotspot navSafety"
        />

        <Link
          href="/learn"
          aria-label="Learn"
          className="navHotspot navLearn"
        />

        <Link
          href="/journal"
          aria-label="Journal"
          className="navHotspot navJournal"
        />

        <Link
          href="/stories"
          aria-label="Stories"
          className="navHotspot navStories"
        />

        <Link
          href="/badges"
          aria-label="Badges"
          className="navHotspot navBadges"
        />

        <Link
          href="/signin"
          aria-label="Sign In"
          className="navHotspot signInHotspot"
        />

        <Link
          href="/start-here"
          aria-label="Start Your Wild"
          className="navHotspot topStartHotspot"
        />
      </section>

      <style>{`
        /* =====================================================
           RESET
           ===================================================== */

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
        }

        .wildHome {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #0b0b0b;
          overflow-x: hidden;
        }

        /* =====================================================
           MASTER CANVAS
           
           IMPORTANT:
           Do NOT use background-size: cover.
           Do NOT use 100% 100%.
           
           The image itself controls the height.
           This preserves the original aspect ratio.
           ===================================================== */

        .wildHero {
          position: relative;
          width: 100%;
          overflow: hidden;
          line-height: 0;
          background: #111;
        }

        .wildHeroImage {
          display: block;
          width: 100%;
          height: auto;
          max-width: 100%;
          margin: 0;
          padding: 0;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
        }

        /* =====================================================
           BASE INTERACTION
           ===================================================== */

        .objectHotspot,
        .labelHotspot,
        .navHotspot,
        .centerCtaHotspot {
          position: absolute;
          z-index: 20;
          display: block;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          text-decoration: none;
        }

        /*
          Objects normally have NO visible border.
          Hover gives a very subtle orange glow.
        */

        .objectHotspot::after,
        .labelHotspot::after,
        .navHotspot::after,
        .centerCtaHotspot::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;

          border: 1px solid rgba(244, 156, 52, 0.65);

          box-shadow:
            0 0 14px rgba(244, 156, 52, 0.18),
            inset 0 0 12px rgba(244, 156, 52, 0.06);

          transition:
            opacity 180ms ease,
            box-shadow 180ms ease;
        }

        .objectHotspot:hover::after,
        .labelHotspot:hover::after,
        .navHotspot:hover::after,
        .centerCtaHotspot:hover::after {
          opacity: 1;
        }

        .objectHotspot:active,
        .labelHotspot:active,
        .navHotspot:active,
        .centerCtaHotspot:active {
          transform: scale(0.985);
        }

        /* =====================================================
           01 — BADGE
           
           Actual badge is roughly circular.
           ===================================================== */

        .badgeObject {
          left: 1.2%;
          top: 7.5%;
          width: 15.2%;
          height: 20.5%;

          border-radius: 50%;

          /*
            Makes the clickable area circular
            instead of a rectangular block.
          */
          clip-path: circle(48% at 50% 50%);
        }

        .badgeObject::after {
          border-radius: 50%;
        }

        /*
          Achievements black card
        */

        .badgeLabel {
          left: 15.9%;
          top: 11.4%;
          width: 13.7%;
          height: 7.8%;

          border-radius: 6px;
        }

        /* =====================================================
           02 — EXPLORE
           ===================================================== */

        .exploreLabel {
          left: 6.8%;
          top: 31.5%;
          width: 13.2%;
          height: 9.8%;

          border-radius: 7px;
        }

        /* =====================================================
           03 — VEHICLE
           
           Irregular polygon follows the SUV.
           ===================================================== */

        .vehicleObject {
          left: 15.8%;
          top: 34%;
          width: 16.2%;
          height: 18.2%;

          clip-path: polygon(
            4% 51%,
            13% 31%,
            31% 20%,
            48% 5%,
            73% 11%,
            94% 37%,
            99% 65%,
            84% 82%,
            58% 91%,
            31% 88%,
            11% 75%
          );
        }

        /*
          Ways In card
        */

        .vehicleLabel {
          left: 24.6%;
          top: 44%;
          width: 11%;
          height: 8.2%;

          border-radius: 7px;
        }

        /* =====================================================
           04 — POLAROID
           ===================================================== */

        .polaroidObject {
          left: 63.2%;
          top: 6%;
          width: 18.5%;
          height: 24%;

          clip-path: polygon(
            13% 4%,
            88% 0%,
            100% 14%,
            94% 92%,
            78% 100%,
            5% 89%,
            0% 25%
          );
        }

        .wildWallLabel {
          left: 79.5%;
          top: 16%;
          width: 12%;
          height: 8.5%;

          border-radius: 7px;
        }

        /* =====================================================
           05 — COMPASS
           ===================================================== */

        .compassObject {
          left: 60.2%;
          top: 28%;
          width: 13.8%;
          height: 22%;

          border-radius: 50%;
          clip-path: circle(48% at 50% 50%);
        }

        .planLabel {
          left: 74.5%;
          top: 38%;
          width: 14%;
          height: 8.8%;

          border-radius: 7px;
        }

        /* =====================================================
           06 — BACKPACK
           
           Large irregular area follows actual backpack.
           ===================================================== */

        .backpackObject {
          left: 4.5%;
          top: 51%;
          width: 32%;
          height: 43%;

          clip-path: polygon(
            18% 4%,
            36% 0%,
            57% 4%,
            76% 15%,
            90% 34%,
            96% 61%,
            89% 82%,
            73% 95%,
            43% 100%,
            20% 94%,
            7% 76%,
            3% 52%,
            6% 26%
          );
        }

        .prepareLabel {
          left: 23.5%;
          top: 60.5%;
          width: 12.7%;
          height: 8.5%;

          border-radius: 7px;
        }

        /* =====================================================
           07 — FIRST AID
           ===================================================== */

        .firstAidObject {
          left: 36.5%;
          top: 66%;
          width: 20%;
          height: 25%;

          clip-path: polygon(
            8% 19%,
            20% 8%,
            79% 5%,
            94% 18%,
            98% 68%,
            88% 91%,
            68% 98%,
            16% 91%,
            3% 68%,
            0% 36%
          );
        }

        .safetyLabel {
          left: 38%;
          top: 81.5%;
          width: 14%;
          height: 8%;

          border-radius: 7px;
        }

        /* =====================================================
           08 — FIELD GUIDE
           ===================================================== */

        .fieldGuideObject {
          left: 58%;
          top: 58%;
          width: 16%;
          height: 34%;

          clip-path: polygon(
            8% 5%,
            80% 0%,
            100% 8%,
            91% 92%,
            75% 100%,
            9% 95%,
            0% 20%
          );
        }

        .learnLabel {
          left: 59%;
          top: 81.5%;
          width: 13%;
          height: 8%;

          border-radius: 7px;
        }

        /* =====================================================
           09 — JOURNAL
           ===================================================== */

        .journalObject {
          left: 74%;
          top: 48%;
          width: 21.5%;
          height: 46%;

          clip-path: polygon(
            13% 0%,
            88% 4%,
            100% 18%,
            95% 91%,
            82% 100%,
            9% 96%,
            0% 82%,
            4% 17%
          );
        }

        .journalLabel {
          left: 78%;
          top: 81.5%;
          width: 14.2%;
          height: 8.5%;

          border-radius: 7px;
        }

        /* =====================================================
           CENTER CTA
           ===================================================== */

        .centerCtaHotspot {
          left: 38.2%;
          top: 55%;
          width: 23%;
          height: 9.8%;

          border-radius: 8px;
        }

        /* =====================================================
           TOP NAVIGATION
           ===================================================== */

        .navHotspot {
          top: 0;
          height: 7%;
          border-radius: 4px;
        }

        .navExplore {
          left: 18.2%;
          width: 6.2%;
        }

        .navPlan {
          left: 25.7%;
          width: 5%;
        }

        .navPrepare {
          left: 31.8%;
          width: 7%;
        }

        .navSafety {
          left: 39.4%;
          width: 6%;
        }

        .navLearn {
          left: 46.5%;
          width: 6%;
        }

        .navJournal {
          left: 53.1%;
          width: 7%;
        }

        .navStories {
          left: 61%;
          width: 6.5%;
        }

        .navBadges {
          left: 68.1%;
          width: 7%;
        }

        .signInHotspot {
          left: 74.5%;
          width: 9%;
        }

        .topStartHotspot {
          left: 84.3%;
          width: 14.8%;
          border-radius: 8px;
        }

        /* =====================================================
           MOBILE
           
           Keep image ratio.
           Don't distort the artwork.
           ===================================================== */

        @media (max-width: 768px) {
          .wildHome {
            overflow-x: auto;
          }

          .wildHero {
            width: 100%;
            min-width: 1000px;
          }

          /*
            On touch devices, remove hover glow.
            The actual object remains clickable.
          */

          .objectHotspot::after,
          .labelHotspot::after,
          .navHotspot::after,
          .centerCtaHotspot::after {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
