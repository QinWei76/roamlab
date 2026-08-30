import Image from "next/image";
import Link from "next/link";

const hotspots = [
  {
    name: "Explore",
    href: "/explore",
    className: "hotspotExplore",
    label: "EXPLORE",
  },
  {
    name: "Ways In",
    href: "/ways-in",
    className: "hotspotWaysIn",
    label: "WAYS IN",
  },
  {
    name: "Plan Your Wild",
    href: "/plan",
    className: "hotspotPlan",
    label: "PLAN YOUR WILD",
  },
  {
    name: "Prepare",
    href: "/prepare",
    className: "hotspotPrepare",
    label: "PREPARE",
  },
  {
    name: "Safety",
    href: "/safety",
    className: "hotspotSafety",
    label: "SAFETY",
  },
  {
    name: "Learn",
    href: "/learn",
    className: "hotspotLearn",
    label: "LEARN",
  },
  {
    name: "My Wild Journal",
    href: "/journal",
    className: "hotspotJournal",
    label: "MY WILD JOURNAL",
  },
  {
    name: "The Wild Wall",
    href: "/stories",
    className: "hotspotStories",
    label: "THE WILD WALL",
  },
  {
    name: "Achievements",
    href: "/badges",
    className: "hotspotBadges",
    label: "ACHIEVEMENTS",
  },
];

export default function HomePage() {
  return (
    <main className="wildHome">
      <section className="wildHero">
        <Image
          src="/wild-desk.jpg"
          alt="RoamLab Wild Desk"
          fill
          priority
          className="wildHeroImage"
          sizes="100vw"
        />

        {/* Header */}
        <header className="wildHeader">
          <Link href="/" className="wildLogo">
            ROAMLAB
          </Link>

          <nav className="wildNav">
            <Link href="/explore">EXPLORE</Link>
            <Link href="/plan">PLAN</Link>
            <Link href="/prepare">PREPARE</Link>
            <Link href="/learn">LEARN</Link>
            <Link href="/stories">STORIES</Link>
          </nav>

          <div className="wildHeaderActions">
            <Link href="/signin" className="signIn">
              SIGN IN
            </Link>

            <Link href="/start-here" className="startWildButton">
              START YOUR WILD →
            </Link>
          </div>
        </header>

        {/* Main CTA */}
        <div className="wildHeroContent">
          <p className="wildEyebrow">ROAMLAB FIELD SYSTEM</p>

          <h1>
            GO WILD.
            <br />
            SHOW IT.
          </h1>

          <p className="wildSubline">
            The rest is on us.
          </p>

          <p className="wildDescription">
            Plan smarter. Prepare better.
            <br />
            Go further. Share cooler.
          </p>

          <Link href="/start-here" className="wildMainButton">
            START YOUR WILD →
          </Link>
        </div>

        {/* Interactive hotspots */}
        <div className="wildHotspots">
          {hotspots.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`wildHotspot ${item.className}`}
              aria-label={`Open ${item.name}`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="scrollHint">
          <span />
          SCROLL TO EXPLORE
        </div>
      </section>

      <style>{`
        .wildHome {
          width: 100%;
          min-height: 100vh;
          background: #111312;
        }

        .wildHero {
          position: relative;
          width: 100%;
          min-height: 100vh;
          height: 100svh;
          overflow: hidden;
          isolation: isolate;
          background: #171916;
        }

        .wildHeroImage {
          object-fit: cover;
          object-position: center;
          z-index: -2;
        }

        .wildHero::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(0,0,0,.16),
              transparent 42%,
              rgba(0,0,0,.10)
            );
        }

        /* HEADER */

        .wildHeader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 28px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          z-index: 20;
          box-sizing: border-box;
        }

        .wildLogo {
          color: #fff;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 4px;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
        }

        .wildNav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .wildNav a {
          color: rgba(255,255,255,.88);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-decoration: none;
          transition: opacity .2s ease;
        }

        .wildNav a:hover {
          opacity: .55;
        }

        .wildHeaderActions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .signIn {
          color: white;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-decoration: none;
          white-space: nowrap;
        }

        .startWildButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          background: #e8dfd0;
          color: #1a1a18;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-decoration: none;
          white-space: nowrap;
          transition: transform .2s ease;
        }

        .startWildButton:hover {
          transform: translateY(-2px);
        }

        /* HERO COPY */

        .wildHeroContent {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(620px, calc(100% - 40px));
          text-align: center;
          color: #fff;
          z-index: 5;
          pointer-events: none;
        }

        .wildEyebrow {
          margin: 0 0 18px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 4px;
          color: rgba(255,255,255,.65);
        }

        .wildHeroContent h1 {
          margin: 0;
          font-size: clamp(64px, 8vw, 118px);
          line-height: .82;
          font-weight: 900;
          letter-spacing: -5px;
          color: #fff;
          text-shadow: 0 8px 30px rgba(0,0,0,.22);
        }

        .wildSubline {
          margin: 26px 0 0;
          font-size: 18px;
          font-weight: 600;
          color: rgba(255,255,255,.92);
        }

        .wildDescription {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.7;
          letter-spacing: .3px;
          color: rgba(255,255,255,.72);
        }

        .wildMainButton {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 28px;
          padding: 14px 22px;
          border-radius: 999px;
          background: rgba(17,19,18,.88);
          border: 1px solid rgba(255,255,255,.22);
          color: #fff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          backdrop-filter: blur(12px);
          transition:
            transform .2s ease,
            background .2s ease;
        }

        .wildMainButton:hover {
          transform: translateY(-3px);
          background: rgba(0,0,0,.95);
        }

        /* HOTSPOTS */

        .wildHotspot {
          position: absolute;
          z-index: 10;
        }

        .wildHotspot span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          border-radius: 4px;
          background: rgba(15,17,16,.76);
          border: 1px solid rgba(255,255,255,.14);
          color: rgba(255,255,255,.95);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 30px rgba(0,0,0,.18);
          transition:
            transform .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .wildHotspot:hover span {
          transform: translateY(-3px) scale(1.03);
          background: rgba(217,107,53,.92);
          box-shadow: 0 12px 35px rgba(0,0,0,.32);
        }

        /* IMPORTANT:
           These positions are the first desktop pass.
           We will fine-tune them after seeing the deployed page.
        */

        .hotspotExplore {
          left: 8%;
          top: 30%;
          width: 20%;
          height: 24%;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .hotspotWaysIn {
          left: 22%;
          top: 52%;
          width: 18%;
          height: 22%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .hotspotPlan {
          right: 8%;
          top: 38%;
          width: 20%;
          height: 25%;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
        }

        .hotspotPrepare {
          left: 7%;
          bottom: 10%;
          width: 21%;
          height: 22%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }

        .hotspotSafety {
          left: 31%;
          bottom: 8%;
          width: 15%;
          height: 18%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .hotspotLearn {
          right: 8%;
          bottom: 12%;
          width: 20%;
          height: 20%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .hotspotJournal {
          right: 24%;
          bottom: 8%;
          width: 18%;
          height: 21%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .hotspotStories {
          right: 6%;
          top: 16%;
          width: 18%;
          height: 22%;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
        }

        .hotspotBadges {
          left: 8%;
          top: 15%;
          width: 17%;
          height: 16%;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
        }

        /* SCROLL */

        .scrollHint {
          position: absolute;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 9px;
          color: rgba(255,255,255,.62);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          z-index: 8;
        }

        .scrollHint span {
          width: 30px;
          height: 1px;
          background: rgba(255,255,255,.55);
        }

        /* TABLET */

        @media (max-width: 1000px) {
          .wildHeader {
            padding: 24px;
          }

          .wildNav {
            display: none;
          }

          .wildHeroContent h1 {
            letter-spacing: -3px;
          }
        }

        /* MOBILE */

        @media (max-width: 640px) {
          .wildHero {
            min-height: 760px;
          }

          .wildHeader {
            padding: 20px;
          }

          .wildLogo {
            font-size: 18px;
            letter-spacing: 3px;
          }

          .signIn {
            display: none;
          }

          .startWildButton {
            min-height: 36px;
            padding: 0 13px;
            font-size: 9px;
          }

          .wildHeroContent {
            top: 49%;
          }

          .wildEyebrow {
            font-size: 8px;
            letter-spacing: 2.5px;
          }

          .wildHeroContent h1 {
            font-size: clamp(52px, 16vw, 74px);
            letter-spacing: -3px;
          }

          .wildSubline {
            font-size: 15px;
          }

          .wildDescription {
            font-size: 11px;
          }

          .wildHotspot span {
            padding: 7px 9px;
            font-size: 7px;
            letter-spacing: 1px;
          }

          .hotspotExplore {
            left: 4%;
            top: 24%;
          }

          .hotspotWaysIn {
            left: 18%;
            top: 54%;
          }

          .hotspotPlan {
            right: 3%;
            top: 32%;
          }

          .hotspotPrepare {
            left: 3%;
            bottom: 15%;
          }

          .hotspotSafety {
            left: 34%;
            bottom: 10%;
          }

          .hotspotLearn {
            right: 3%;
            bottom: 17%;
          }

          .hotspotJournal {
            right: 20%;
            bottom: 9%;
          }

          .hotspotStories {
            right: 2%;
            top: 17%;
          }

          .hotspotBadges {
            left: 4%;
            top: 13%;
          }
        }
      `}</style>
    </main>
  );
}
