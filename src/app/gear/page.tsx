import Image from "next/image";
import Link from "next/link";

const gearSystems = [
  {
    number: "01",
    title: "Sleeping",
    subtitle: "Build a better night outdoors.",
    description:
      "Tents, mattresses and complete sleeping systems for comfortable vehicle camping.",
    image: "/sleeping.jpg",
    href: "/gear/sleeping",
  },
  {
    number: "02",
    title: "Power",
    subtitle: "Stay powered wherever you camp.",
    description:
      "Portable power stations, batteries and charging systems for life off-grid.",
    image: "/power.jpg",
    href: "/gear/power",
  },
  {
    number: "03",
    title: "Cooking",
    subtitle: "Build a practical camp kitchen.",
    description:
      "Stoves, cooking gear and simple systems for making better meals outdoors.",
    image: "/cooking.jpg",
    href: "/gear/cooking",
  },
  {
    number: "04",
    title: "Storage",
    subtitle: "Keep your setup organized.",
    description:
      "Smart storage systems that help you carry more without creating chaos.",
    image: "/storage.jpg",
    href: "/gear/storage",
  },
  {
    number: "05",
    title: "Lighting",
    subtitle: "Light your camp properly.",
    description:
      "Lanterns, ambient lighting and practical systems for better nights outdoors.",
    image: "/lighting.jpg",
    href: "/gear/lighting",
  },
];

export default function GearLabPage() {
  return (
    <main className="gearLabPage">
      {/* HERO */}
      <section className="gearLabHero">
        <div className="gearLabHeroInner">
          <p className="gearLabEyebrow">ROAMLAB · GEAR LAB</p>

          <h1>
            Build Better
            <br />
            Camping Systems.
          </h1>

          <p className="gearLabHeroText">
            Explore the essential systems behind a comfortable,
            capable and well-organized vehicle camping setup.
          </p>

          <div className="gearLabScroll">
            <span>EXPLORE SYSTEMS</span>
            <span className="gearLabArrow">↓</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="gearLabIntro">
        <div className="gearLabIntroLabel">
          <span>THE SYSTEM APPROACH</span>
        </div>

        <div className="gearLabIntroContent">
          <h2>
            Great camping setups
            <br />
            are built in systems.
          </h2>

          <p>
            Instead of buying random gear, build your setup one system
            at a time. Start with what you actually need, understand how
            each piece works together, and upgrade when your adventures
            demand more.
          </p>
        </div>
      </section>

      {/* SYSTEMS */}
      <section className="gearSystemsSection">
        <div className="gearSystemsHeader">
          <p>EXPLORE THE LAB</p>
          <span>05 CORE SYSTEMS</span>
        </div>

        <div className="gearSystemsList">
          {gearSystems.map((system) => (
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
                  className="gearSystemImg"
                />
              </div>

              <div className="gearSystemInfo">
                <span className="gearSystemNumber">{system.number}</span>

                <div className="gearSystemText">
                  <h3>{system.title}</h3>

                  <h4>{system.subtitle}</h4>

                  <p>{system.description}</p>
                </div>

                <div className="gearSystemAction">
                  Explore
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gearLabCta">
        <div>
          <p>NOT SURE WHERE TO START?</p>

          <h2>
            Let RoamLab help build
            <br />
            your complete setup.
          </h2>
        </div>

        <Link href="/gear-builder" className="gearLabCtaButton">
          Try Gear Builder
          <span>→</span>
        </Link>
      </section>

      <style>{`
        .gearLabPage {
          width: 100%;
          background: #f3f2ee;
          color: #1b2924;
          overflow-x: hidden;
        }

        /* HERO */

        .gearLabHero {
          min-height: 650px;
          padding: 150px 7% 100px;
          display: flex;
          align-items: center;
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(107, 131, 112, 0.18),
              transparent 35%
            ),
            #17231f;
          color: white;
        }

        .gearLabHeroInner {
          max-width: 900px;
        }

        .gearLabEyebrow {
          margin: 0 0 28px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.55);
        }

        .gearLabHero h1 {
          margin: 0;
          font-size: clamp(58px, 8vw, 108px);
          line-height: 0.98;
          letter-spacing: -4px;
          font-weight: 700;
        }

        .gearLabHeroText {
          max-width: 560px;
          margin: 32px 0 0;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.68);
        }

        .gearLabScroll {
          margin-top: 70px;
          display: flex;
          align-items: center;
          gap: 18px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.55);
        }

        .gearLabArrow {
          font-size: 18px;
        }

        /* INTRO */

        .gearLabIntro {
          padding: 130px 7%;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 100px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .gearLabIntroLabel {
          padding-top: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #6b7d73;
        }

        .gearLabIntroContent h2 {
          margin: 0;
          font-size: clamp(42px, 5vw, 70px);
          line-height: 1.05;
          letter-spacing: -2.5px;
          font-weight: 600;
        }

        .gearLabIntroContent p {
          max-width: 620px;
          margin: 36px 0 0;
          font-size: 18px;
          line-height: 1.8;
          color: #65706b;
        }

        /* SYSTEMS */

        .gearSystemsSection {
          padding: 20px 7% 130px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .gearSystemsHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          border-bottom: 1px solid #d5d8d3;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #6c7771;
        }

        .gearSystemsHeader p {
          margin: 0;
        }

        .gearSystemsList {
          display: flex;
          flex-direction: column;
        }

        .gearSystemCard {
          display: grid;
          grid-template-columns: 42% 1fr;
          min-height: 360px;
          text-decoration: none;
          color: inherit;
          border-bottom: 1px solid #d5d8d3;
          transition: background 0.25s ease;
        }

        .gearSystemCard:hover {
          background: rgba(255, 255, 255, 0.45);
        }

        .gearSystemImage {
          position: relative;
          min-height: 360px;
          overflow: hidden;
        }

        .gearSystemImg {
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .gearSystemCard:hover .gearSystemImg {
          transform: scale(1.05);
        }

        .gearSystemInfo {
          padding: 55px 55px;
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 20px;
          align-items: start;
        }

        .gearSystemNumber {
          font-size: 11px;
          letter-spacing: 2px;
          color: #7b8781;
          padding-top: 8px;
        }

        .gearSystemText h3 {
          margin: 0;
          font-size: clamp(38px, 4vw, 58px);
          line-height: 1;
          letter-spacing: -2px;
          font-weight: 600;
        }

        .gearSystemText h4 {
          margin: 14px 0 0;
          font-size: 15px;
          font-weight: 500;
          color: #3d5148;
        }

        .gearSystemText p {
          max-width: 500px;
          margin: 22px 0 0;
          font-size: 15px;
          line-height: 1.7;
          color: #737c77;
        }

        .gearSystemAction {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #365246;
          white-space: nowrap;
        }

        .gearSystemAction span {
          font-size: 18px;
          transition: transform 0.2s ease;
        }

        .gearSystemCard:hover .gearSystemAction span {
          transform: translateX(5px);
        }

        /* CTA */

        .gearLabCta {
          margin: 0 7% 100px;
          padding: 80px;
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 50px;
          background: #20332b;
          color: white;
        }

        .gearLabCta p {
          margin: 0 0 18px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.5);
        }

        .gearLabCta h2 {
          margin: 0;
          font-size: clamp(32px, 4vw, 55px);
          line-height: 1.1;
          letter-spacing: -1.8px;
          font-weight: 500;
        }

        .gearLabCtaButton {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 17px 24px;
          background: white;
          color: #1c2c25;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          transition: transform 0.2s ease;
        }

        .gearLabCtaButton:hover {
          transform: translateY(-3px);
        }

        .gearLabCtaButton span {
          font-size: 18px;
        }

        /* MOBILE */

        @media (max-width: 900px) {
          .gearLabHero {
            min-height: 560px;
            padding: 120px 24px 80px;
          }

          .gearLabHero h1 {
            letter-spacing: -2.5px;
          }

          .gearLabIntro {
            padding: 80px 24px;
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .gearSystemsSection {
            padding: 20px 24px 80px;
          }

          .gearSystemCard {
            grid-template-columns: 1fr;
          }

          .gearSystemImage {
            min-height: 260px;
          }

          .gearSystemInfo {
            padding: 35px 0 45px;
            grid-template-columns: 45px 1fr;
          }

          .gearSystemAction {
            grid-column: 2;
          }

          .gearLabCta {
            margin: 0 24px 70px;
            padding: 45px 30px;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 560px) {
          .gearLabHero h1 {
            font-size: 54px;
          }

          .gearSystemText h3 {
            font-size: 42px;
          }

          .gearSystemsHeader span {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
