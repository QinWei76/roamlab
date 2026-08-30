import Link from "next/link";

const hotspots = [
  {
    name: "Achievements",
    href: "/badges",
    className: "hotspotBadges",
  },
  {
    name: "Explore",
    href: "/explore",
    className: "hotspotExplore",
  },
  {
    name: "Ways In",
    href: "/ways-in",
    className: "hotspotWaysIn",
  },
  {
    name: "Plan Your Wild",
    href: "/plan",
    className: "hotspotPlan",
  },
  {
    name: "Prepare",
    href: "/prepare",
    className: "hotspotPrepare",
  },
  {
    name: "Safety",
    href: "/safety",
    className: "hotspotSafety",
  },
  {
    name: "Learn",
    href: "/learn",
    className: "hotspotLearn",
  },
  {
    name: "My Wild Journal",
    href: "/journal",
    className: "hotspotJournal",
  },
  {
    name: "The Wild Wall",
    href: "/stories",
    className: "hotspotStories",
  },
];

export default function HomePage() {
  return (
    <main className="wildHome">
      <section className="wildHero">
        {/* Approved final Wild Desk visual */}
        <div className="wildHeroImage" />

        {/* Invisible interactive areas */}
        {hotspots.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`hotspot ${item.className}`}
            aria-label={`Open ${item.name}`}
          />
        ))}

        {/* Header interactive areas */}
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
          href="/learn"
          className="navHotspot navLearn"
          aria-label="Learn"
        />

        <Link
          href="/stories"
          className="navHotspot navStories"
          aria-label="Stories"
        />

        <Link
          href="/signin"
          className="signInHotspot"
          aria-label="Sign in"
        />

        {/* Main CTA */}
        <Link
          href="/start-here"
          className="startWildHotspot"
          aria-label="Start your wild"
        />
      </section>

      <style>{`
        .wildHome {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #111;
        }

        .wildHero {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 700px;
          overflow: hidden;
          background: #111;
        }

        /*
          IMPORTANT:
          All text is already inside wild-desk.jpg.
          This layer contains only the final approved image.
        */

        .wildHeroImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image: url("/wild-desk.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* =========================
           INVISIBLE SYSTEM HOTSPOTS
           ========================= */

        .hotspot,
        .navHotspot,
        .signInHotspot,
        .startWildHotspot {
          position: absolute;
          z-index: 10;
          display: block;
          border-radius: 8px;
          cursor: pointer;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        /*
          Subtle hover feedback only.
          No visible text is added.
        */

        .hotspot::after,
        .navHotspot::after,
        .signInHotspot::after,
        .startWildHotspot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: rgba(255, 255, 255, 0);
          transition:
            background 0.2s ease,
            box-shadow 0.2s ease;
          pointer-events: none;
        }

        .hotspot:hover::after,
        .navHotspot:hover::after,
        .signInHotspot:hover::after,
        .startWildHotspot:hover::after {
          background: rgba(255, 153, 51, 0.08);
          box-shadow: 0 0 0 1px rgba(255, 153, 51, 0.25);
        }

        /* ACHIEVEMENTS */
        .hotspotBadges {
          left: 4%;
          top: 10%;
          width: 24%;
          height: 16%;
        }

        /* EXPLORE */
        .hotspotExplore {
          left: 4%;
          top: 25%;
          width: 22%;
          height: 18%;
        }

        /* WAYS IN / VEHICLE */
        .hotspotWaysIn {
          left: 16%;
          top: 31%;
          width: 22%;
          height: 27%;
        }

        /* PLAN */
        .hotspotPlan {
          left: 70%;
          top: 27%;
          width: 22%;
          height: 22%;
        }

        /* PREPARE / BACKPACK */
        .hotspotPrepare {
          left: 4%;
          bottom: 6%;
          width: 30%;
          height: 35%;
        }

        /* SAFETY / FIRST AID */
        .hotspotSafety {
          left: 34%;
          bottom: 5%;
          width: 22%;
          height: 24%;
        }

        /* LEARN / FIELD GUIDE */
        .hotspotLearn {
          right: 5%;
          bottom: 4%;
          width: 24%;
          height: 28%;
        }

        /* JOURNAL */
        .hotspotJournal {
          right: 13%;
          bottom: 8%;
          width: 27%;
          height: 42%;
        }

        /* WILD WALL / POLAROIDS */
        .hotspotStories {
          right: 7%;
          top: 7%;
          width: 27%;
          height: 25%;
        }

        /* =========================
           HEADER HOTSPOTS
           ========================= */

        .navExplore {
          left: 29%;
          top: 2%;
          width: 6%;
          height: 7%;
        }

        .navPlan {
          left: 36%;
          top: 2%;
          width: 5%;
          height: 7%;
        }

        .navPrepare {
          left: 43%;
          top: 2%;
          width: 7%;
          height: 7%;
        }

        .navLearn {
          left: 52%;
          top: 2%;
          width: 6%;
          height: 7%;
        }

        .navStories {
          left: 59%;
          top: 2%;
          width: 7%;
          height: 7%;
        }

        /* SIGN IN */
        .signInHotspot {
          right: 15%;
          top: 1.5%;
          width: 7%;
          height: 7%;
        }

        /* START YOUR WILD */
        .startWildHotspot {
          right: 2%;
          top: 1.5%;
          width: 14%;
          height: 8%;
          border-radius: 999px;
        }

        /* =========================
           MOBILE
           ========================= */

        @media (max-width: 768px) {
          .wildHero {
            min-height: 760px;
          }

          .wildHeroImage {
            background-position: center center;
          }
        }
      `}</style>
    </main>
  );
}
