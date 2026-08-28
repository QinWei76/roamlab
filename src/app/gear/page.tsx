import Image from "next/image";
import Link from "next/link";

const systems = [
  {
    number: "01",
    title: "Sleeping",
    description:
      "Build a comfortable sleep system for better nights on the road.",
    image: "/sleeping.jpg",
    href: "/gear/sleeping",
  },
  {
    number: "02",
    title: "Power",
    description:
      "Keep your devices, lights and essentials running anywhere.",
    image: "/power.jpg",
    href: "/gear/power",
  },
  {
    number: "03",
    title: "Cooking",
    description:
      "Create a simple and practical camp kitchen for every trip.",
    image: "/cooking.jpg",
    href: "/gear/cooking",
  },
  {
    number: "04",
    title: "Storage",
    description:
      "Organize your gear so your vehicle works better as a system.",
    image: "/storage.jpg",
    href: "/gear/storage",
  },
  {
    number: "05",
    title: "Lighting",
    description:
      "Build a reliable lighting setup for camp, vehicle and night use.",
    image: "/lighting.jpg",
    href: "/gear/lighting",
  },
];

export default function GearLabPage() {
  return (
    <main className="gearLabPage">
      {/* HERO */}
      <section className="gearLabHero">
        <Image
          src="/complete-system.jpg"
          alt="Complete vehicle camping system"
          fill
          priority
          className="gearLabHeroImage"
        />

        <div className="gearLabOverlay" />

        {/* HEADER */}
        <header className="gearLabHeader">
          <Link href="/" className="gearLabLogo">
            ROAMLAB
          </Link>

          <nav className="gearLabNav">
            <Link href="/">Home</Link>
            <Link href="/start-here">Start Here</Link>
            <Link href="/gear-builder">Gear Builder</Link>
            <Link href="/gear">Gear Lab</Link>
          </nav>
        </header>

        {/* HERO CONTENT */}
        <div className="gearLabHeroContent">
          <p className="gearLabEyebrow">
            ROAMLAB · GEAR LAB
          </p>

          <h1>
            Build Better
            <br />
            Camping
            <br />
            Systems.
          </h1>

          <p className="gearLabDescription">
            Explore the essential systems behind a comfortable,
            capable and well-organized vehicle camping setup.
          </p>

          <a
            href="#systems"
            className="gearLabExploreButton"
          >
            Explore Systems ↓
          </a>
        </div>
      </section>

      {/* SYSTEMS */}
      <section
        id="systems"
        className="gearSystemsSection"
      >
        <div className="gearSystemsIntro">
          <p className="gearSystemsEyebrow">
            THE SYSTEM
          </p>

          <h2>
            Every great setup
            <br />
            starts with the essentials.
          </h2>

          <p>
            Build your camping system one layer at a time.
            Start with what matters most, then upgrade as
            your adventures grow.
          </p>
        </div>

        <div className="gearSystemsGrid">
          {systems.map((system) => (
            <Link
              key={system.title}
              href={system.href}
              className="gearSystemCard"
            >
              <div className="gearSystemImage">
                <Image
                  src={system.image}
                  alt={system.title}
                  fill
                  className="gearSystemImageContent"
                />

                <div className="gearSystemImageOverlay" />

                <span className="gearSystemNumber">
                  {system.number}
                </span>
              </div>

              <div className="gearSystemContent">
                <h3>{system.title}</h3>

                <p>{system.description}</p>

                <span className="gearSystemLink">
                  Explore System →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="gearLabCTA">
        <div>
          <p className="gearLabCTAEyebrow">
            READY TO BUILD?
          </p>

          <h2>
            Build Your
            <br />
            Complete System.
          </h2>

          <p>
            Start with your vehicle. Choose your camping style.
            Build the gear system that fits your adventures.
          </p>

          <Link
            href="/gear-builder"
            className="gearLabCTAButton"
          >
            Start Building →
          </Link>
        </div>
      </section>

      <style>{`
        .gearLabPage {
          width: 100%;
          overflow-x: hidden;
          background: #f4f3ef;
          color: #202a26;
        }

        /* HERO */

        .gearLabHero {
          position: relative;
          min-height: 760px;
          height: 100vh;
          max-height: 950px;
          overflow: hidden;
          isolation: isolate;
        }

        .gearLabHeroImage {
          object-fit: cover;
          object-position: center;
          z-index: -2;
        }

        .gearLabOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(8, 17, 14, 0.88) 0%,
              rgba(8, 17, 14, 0.65) 40%,
              rgba(8, 17, 14, 0.22) 75%,
              rgba(8, 17, 14, 0.08) 100%
            );
          z-index: -1;
        }

        /* HEADER */

        .gearLabHeader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 30px 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          z-index: 10;
        }

        .gearLabLogo {
          color: #ffffff;
          text-decoration: none;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .gearLabNav {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .gearLabNav a {
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s ease;
        }

        .gearLabNav a:hover {
          opacity: 0.65;
        }

        /* HERO CONTENT */

        .gearLabHeroContent {
          position: relative;
          z-index: 2;
          width: min(680px, calc(100% - 120px));
          margin-left: 68px;
          padding-top: 220px;
          color: #ffffff;
        }

        .gearLabEyebrow {
          margin: 0 0 28px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          color: rgba(255, 255, 255, 0.62);
        }

        .gearLabHeroContent h1 {
          margin: 0;
          font-size: clamp(58px, 6vw, 92px);
          line-height: 0.98;
          letter-spacing: -4px;
          font-weight: 750;
          color: #ffffff;
        }

        .gearLabDescription {
          margin: 34px 0 0;
          max-width: 560px;
          font-size: 18px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.78);
        }

        .gearLabExploreButton {
          display: inline-flex;
          align-items: center;
          margin-top: 38px;
          padding: 15px 26px;
          border-radius: 999px;
          background: #ffffff;
          color: #17221e;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .gearLabExploreButton:hover {
          transform: translateY(-2px);
          background: #e8ece7;
        }

        /* SYSTEM INTRO */

        .gearSystemsSection {
          padding: 120px 68px;
          background: #f4f3ef;
        }

        .gearSystemsIntro {
          max-width: 760px;
          margin-bottom: 70px;
        }

        .gearSystemsEyebrow {
          margin: 0 0 22px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #65736c;
        }

        .gearSystemsIntro h2 {
          margin: 0;
          font-size: clamp(42px, 5vw, 68px);
          line-height: 1.05;
          letter-spacing: -2px;
          color: #202a26;
        }

        .gearSystemsIntro > p:last-child {
          margin: 30px 0 0;
          max-width: 620px;
          font-size: 17px;
          line-height: 1.7;
          color: #65736c;
        }

        /* SYSTEM GRID */

        .gearSystemsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .gearSystemCard {
          display: block;
          overflow: hidden;
          border-radius: 4px;
          background: #ffffff;
          color: inherit;
          text-decoration: none;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .gearSystemCard:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.1);
        }

        .gearSystemImage {
          position: relative;
          height: 280px;
          overflow: hidden;
          background: #1b2621;
        }

        .gearSystemImageContent {
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gearSystemCard:hover .gearSystemImageContent {
          transform: scale(1.05);
        }

        .gearSystemImageOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.05),
              rgba(0, 0, 0, 0.35)
            );
        }

        .gearSystemNumber {
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #ffffff;
        }

        .gearSystemContent {
          padding: 30px;
        }

        .gearSystemContent h3 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.8px;
          color: #202a26;
        }

        .gearSystemContent p {
          margin: 16px 0 24px;
          min-height: 54px;
          font-size: 15px;
          line-height: 1.6;
          color: #65736c;
        }

        .gearSystemLink {
          font-size: 14px;
          font-weight: 700;
          color: #28473c;
        }

        /* LAST TWO CARDS */

        .gearSystemCard:nth-child(4) {
          grid-column: span 1;
        }

        .gearSystemCard:nth-child(5) {
          grid-column: span 1;
        }

        /* CTA */

        .gearLabCTA {
          padding: 130px 68px;
          background: #15231e;
          color: #ffffff;
        }

        .gearLabCTA > div {
          max-width: 760px;
        }

        .gearLabCTAEyebrow {
          margin: 0 0 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.45);
        }

        .gearLabCTA h2 {
          margin: 0;
          font-size: clamp(48px, 6vw, 76px);
          line-height: 1.03;
          letter-spacing: -3px;
        }

        .gearLabCTA p {
          margin: 28px 0 0;
          max-width: 620px;
          font-size: 17px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.65);
        }

        .gearLabCTAButton {
          display: inline-flex;
          margin-top: 36px;
          padding: 16px 28px;
          border-radius: 999px;
          background: #ffffff;
          color: #17221e;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          transition: transform 0.2s ease;
        }

        .gearLabCTAButton:hover {
          transform: translateY(-2px);
        }

        /* TABLET */

        @media (max-width: 1000px) {
          .gearSystemsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* MOBILE */

        @media (max-width: 768px) {
          .gearLabHero {
            min-height: 700px;
          }

          .gearLabHeader {
            padding: 24px;
          }

          .gearLabNav {
            gap: 16px;
          }

          .gearLabNav a {
            font-size: 12px;
          }

          .gearLabHeroContent {
            width: auto;
            margin: 0 24px;
            padding-top: 200px;
          }

          .gearLabHeroContent h1 {
            font-size: 58px;
            letter-spacing: -2.5px;
          }

          .gearLabDescription {
            font-size: 16px;
          }

          .gearSystemsSection {
            padding: 80px 24px;
          }

          .gearSystemsGrid {
            grid-template-columns: 1fr;
          }

          .gearLabCTA {
            padding: 90px 24px;
          }
        }

        @media (max-width: 560px) {
          .gearLabNav {
            display: none;
          }

          .gearLabHeroContent h1 {
            font-size: 50px;
          }
        }
      `}</style>
    </main>
  );
}
