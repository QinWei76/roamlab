import Image from "next/image";
import Link from "next/link";

const systems = [
  {
    number: "01",
    title: "First Setup",
    description: "Start with the essentials.",
    image: "/first-setup.jpg",
    href: "/gear-builder",
  },
  {
    number: "02",
    title: "Upgrade Gear",
    description: "Improve comfort and capability.",
    image: "/upgrade-gear.jpg",
    href: "/gear-builder",
  },
  {
    number: "03",
    title: "Complete System",
    description: "Build around your vehicle.",
    image: "/complete-system.jpg",
    href: "/gear-builder",
  },
];

export default function StartHerePage() {
  return (
    <main className="startHerePage">
      {/* ================= HERO ================= */}

      <section className="startHereHero">
        <Image
          src="/start-here-hero.jpg"
          alt="Vehicle camping setup"
          fill
          priority
          className="startHereHeroImage"
        />

        <div className="startHereOverlay" />

        <div className="startHereHeader">
          <Link href="/" className="startHereLogo">
            ROAMLAB
          </Link>

          <nav className="startHereNav">
            <Link href="/">Home</Link>
            <Link href="/start-here">Start Here</Link>
            <Link href="/gear-builder">Gear Builder</Link>
            <Link href="/gear/sleeping">Gear Lab</Link>
          </nav>
        </div>

        <div className="startHereHeroContent">
          <p className="startHereEyebrow">START HERE</p>

          <h1>
            Build Your First
            <br />
            Car Camping System
          </h1>

          <p>
            Start simple. Build smart. Create your complete vehicle system.
          </p>

          <Link
            href="/gear-builder"
            className="startHereHeroButton"
          >
            Start Building →
          </Link>
        </div>
      </section>

      {/* ================= INTRO ================= */}

      <section className="startHereIntro">
        <div className="startHereIntroLabel">
          THE ROAMLAB METHOD
        </div>

        <div className="startHereIntroContent">
          <h2>
            Build your camping setup
            <br />
            one layer at a time.
          </h2>

          <p>
            You do not need to buy everything at once.
            Start with the essentials, learn what works for you,
            and build your system as your adventures grow.
          </p>
        </div>
      </section>

      {/* ================= SYSTEM CARDS ================= */}

      <section className="startHereSystems">
        <div className="startHereSectionHeading">
          <p>BUILD YOUR SYSTEM</p>

          <h2>
            Start simple.
            <br />
            Grow when you need to.
          </h2>
        </div>

        <div className="startHereSystemGrid">
          {systems.map((system) => (
            <Link
              href={system.href}
              key={system.number}
              className="startHereSystemCard"
            >
              <div className="startHereSystemImage">
                <Image
                  src={system.image}
                  alt={system.title}
                  fill
                  className="startHereCardImage"
                />
              </div>

              <div className="startHereSystemContent">
                <span className="startHereSystemNumber">
                  {system.number}
                </span>

                <h3>{system.title}</h3>

                <p>{system.description}</p>

                <span className="startHereSystemLink">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= PHILOSOPHY ================= */}

      <section className="startHerePhilosophy">
        <div className="startHerePhilosophyImage">
          <Image
            src="/road-trip.jpg"
            alt="Road trip camping"
            fill
            className="startHerePhilosophyPhoto"
          />
        </div>

        <div className="startHerePhilosophyContent">
          <p>BUILD WITH PURPOSE</p>

          <h2>
            Your vehicle is
            <br />
            the foundation.
          </h2>

          <div className="startHerePhilosophyText">
            <p>
              A good camping setup is not about owning
              the most gear.
            </p>

            <p>
              It is about choosing the right equipment
              for your vehicle, your travel style,
              and the way you actually camp.
            </p>
          </div>

          <Link
            href="/gear-builder"
            className="startHereTextButton"
          >
            Build your system →
          </Link>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}

      <section className="startHereCTA">
        <div className="startHereCTABg">
          <Image
            src="/complete-system.jpg"
            alt="Complete camping system"
            fill
            className="startHereCTAImage"
          />
        </div>

        <div className="startHereCTAOverlay" />

        <div className="startHereCTAContent">
          <p>READY TO BUILD?</p>

          <h2>
            Build Your
            <br />
            Complete System
          </h2>

          <span>
            Start with your vehicle. Choose your gear.
            Create your setup.
          </span>

          <Link
            href="/gear-builder"
            className="startHereCTAButton"
          >
            Start Building →
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="startHereFooter">
        <div className="startHereFooterBrand">
          <h2>ROAMLAB</h2>

          <p>Build smarter vehicle camping systems.</p>

          <span>
            Practical guides, gear research and simple systems
            for better adventures on the road.
          </span>
        </div>

        <div className="startHereFooterColumn">
          <h4>EXPLORE</h4>

          <Link href="/start-here">Start Here</Link>
          <Link href="/gear-builder">Gear Builder</Link>
          <Link href="/gear/sleeping">Gear Lab</Link>
        </div>

        <div className="startHereFooterColumn">
          <h4>SYSTEMS</h4>

          <Link href="/gear/sleeping">Sleeping</Link>
          <Link href="/gear/power">Power</Link>
          <Link href="/gear/cooking">Cooking</Link>
          <Link href="/gear/storage">Storage</Link>
          <Link href="/gear/lighting">Lighting</Link>
        </div>

        <div className="startHereFooterColumn">
          <h4>LEGAL</h4>

          <Link href="/affiliate-disclosure">
            Affiliate Disclosure
          </Link>

          <Link href="/privacy">
            Privacy Policy
          </Link>

          <Link href="/terms">
            Terms of Use
          </Link>
        </div>
      </footer>

      <div className="startHereCopyright">
        © 2026 RoamLab. All rights reserved.
      </div>

      {/* ================= PAGE STYLES ================= */}

      <style>{`
        .startHerePage {
          width: 100%;
          overflow: hidden;
          background: #f3f2ed;
          color: #1d2925;
        }

        /* HERO */

        .startHereHero {
          position: relative;
          min-height: 760px;
          height: 100vh;
          max-height: 900px;
          overflow: hidden;
          color: white;
        }

        .startHereHeroImage {
          object-fit: cover;
          object-position: center;
          z-index: 0;
        }

        .startHereOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.7) 0%,
              rgba(0, 0, 0, 0.48) 45%,
              rgba(0, 0, 0, 0.12) 100%
            );
          z-index: 1;
        }

        .startHereHeader {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 5;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 30px 70px;
        }

        .startHereLogo {
          color: white;
          text-decoration: none;

          font-size: 25px;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .startHereNav {
          display: flex;
          gap: 38px;
        }

        .startHereNav a {
          color: rgba(255,255,255,0.92);
          text-decoration: none;

          font-size: 14px;
          font-weight: 600;
        }

        .startHereNav a:hover {
          opacity: 0.7;
        }

        .startHereHeroContent {
          position: relative;
          z-index: 2;

          max-width: 680px;

          padding-top: 240px;
          margin-left: 70px;
        }

        .startHereEyebrow {
          margin-bottom: 20px;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;

          color: rgba(255,255,255,0.7);
        }

        .startHereHeroContent h1 {
          margin: 0;

          font-size: clamp(48px, 5vw, 76px);
          line-height: 1.05;
          letter-spacing: -2px;

          color: white;
        }

        .startHereHeroContent > p:not(.startHereEyebrow) {
          margin-top: 26px;

          max-width: 540px;

          font-size: 18px;
          line-height: 1.6;

          color: rgba(255,255,255,0.85);
        }

        .startHereHeroButton {
          display: inline-flex;

          margin-top: 34px;

          padding: 16px 28px;

          background: white;
          color: #1c2a25;

          border-radius: 100px;

          text-decoration: none;

          font-size: 15px;
          font-weight: 700;

          transition: 0.2s;
        }

        .startHereHeroButton:hover {
          transform: translateY(-2px);
          background: #e8ece7;
        }


        /* INTRO */

        .startHereIntro {
          max-width: 1200px;

          margin: 0 auto;
          padding: 150px 50px;

          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 100px;
        }

        .startHereIntroLabel {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;

          color: #6b756f;
        }

        .startHereIntroContent h2 {
          margin: 0;

          font-size: clamp(36px, 4vw, 58px);
          line-height: 1.1;
          letter-spacing: -1.5px;
        }

        .startHereIntroContent p {
          max-width: 560px;

          margin-top: 30px;

          font-size: 18px;
          line-height: 1.7;

          color: #66706b;
        }


        /* SYSTEMS */

        .startHereSystems {
          padding: 120px 5%;

          background: #e9e8e2;
        }

        .startHereSectionHeading {
          max-width: 1200px;
          margin: 0 auto 65px;
        }

        .startHereSectionHeading p {
          margin: 0 0 18px;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;

          color: #6d7771;
        }

        .startHereSectionHeading h2 {
          margin: 0;

          font-size: clamp(36px, 4vw, 56px);
          line-height: 1.1;
          letter-spacing: -1.5px;
        }

        .startHereSystemGrid {
          max-width: 1200px;

          margin: 0 auto;

          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 28px;
        }

        .startHereSystemCard {
          display: block;

          background: white;

          text-decoration: none;
          color: inherit;

          border-radius: 4px;

          overflow: hidden;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .startHereSystemCard:hover {
          transform: translateY(-6px);

          box-shadow:
            0 20px 50px rgba(0,0,0,0.1);
        }

        .startHereSystemImage {
          position: relative;

          height: 270px;

          overflow: hidden;
        }

        .startHereCardImage {
          object-fit: cover;

          transition: transform 0.5s ease;
        }

        .startHereSystemCard:hover .startHereCardImage {
          transform: scale(1.05);
        }

        .startHereSystemContent {
          padding: 32px;
        }

        .startHereSystemNumber {
          display: block;

          margin-bottom: 18px;

          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;

          color: #7b847e;
        }

        .startHereSystemContent h3 {
          margin: 0;

          font-size: 30px;
          letter-spacing: -0.6px;
        }

        .startHereSystemContent p {
          margin: 16px 0 26px;

          font-size: 16px;
          line-height: 1.6;

          color: #66706b;
        }

        .startHereSystemLink {
          font-size: 14px;
          font-weight: 700;
        }


        /* PHILOSOPHY */

        .startHerePhilosophy {
          min-height: 720px;

          display: grid;
          grid-template-columns: 1fr 1fr;

          background: #18231f;
          color: white;
        }

        .startHerePhilosophyImage {
          position: relative;
          min-height: 620px;
        }

        .startHerePhilosophyPhoto {
          object-fit: cover;
        }

        .startHerePhilosophyContent {
          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 80px 10%;
        }

        .startHerePhilosophyContent > p {
          margin: 0 0 20px;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;

          color: rgba(255,255,255,0.55);
        }

        .startHerePhilosophyContent h2 {
          margin: 0;

          font-size: clamp(38px, 4vw, 60px);
          line-height: 1.1;
          letter-spacing: -1.5px;
        }

        .startHerePhilosophyText {
          margin-top: 35px;
        }

        .startHerePhilosophyText p {
          max-width: 470px;

          font-size: 17px;
          line-height: 1.7;

          color: rgba(255,255,255,0.68);
        }

        .startHereTextButton {
          display: inline-block;

          margin-top: 30px;

          color: white;

          text-decoration: none;

          font-size: 15px;
          font-weight: 700;
        }


        /* CTA */

        .startHereCTA {
          position: relative;

          min-height: 620px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          text-align: center;

          color: white;
        }

        .startHereCTABg {
          position: absolute;
          inset: 0;

          z-index: 0;
        }

        .startHereCTAImage {
          object-fit: cover;
        }

        .startHereCTAOverlay {
          position: absolute;
          inset: 0;

          background: rgba(10, 16, 13, 0.65);

          z-index: 1;
        }

        .startHereCTAContent {
          position: relative;
          z-index: 2;

          max-width: 700px;

          padding: 60px 25px;
        }

        .startHereCTAContent p {
          margin: 0 0 20px;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;

          color: rgba(255,255,255,0.65);
        }

        .startHereCTAContent h2 {
          margin: 0;

          font-size: clamp(48px, 5vw, 72px);
          line-height: 1.05;
          letter-spacing: -2px;
        }

        .startHereCTAContent > span {
          display: block;

          margin-top: 28px;

          font-size: 17px;
          line-height: 1.6;

          color: rgba(255,255,255,0.75);
        }

        .startHereCTAButton {
          display: inline-flex;

          margin-top: 35px;

          padding: 16px 30px;

          background: white;
          color: #17231e;

          border-radius: 100px;

          text-decoration: none;

          font-size: 15px;
          font-weight: 700;
        }


        /* FOOTER */

        .startHereFooter {
          display: grid;

          grid-template-columns: 2fr 1fr 1fr 1fr;

          gap: 70px;

          padding: 90px 5%;

          background: #14201b;

          color: white;
        }

        .startHereFooterBrand h2 {
          margin: 0;

          font-size: 25px;
          letter-spacing: 3px;
        }

        .startHereFooterBrand p {
          margin: 22px 0 15px;

          font-size: 17px;

          color: rgba(255,255,255,0.75);
        }

        .startHereFooterBrand span {
          display: block;

          max-width: 350px;

          font-size: 14px;
          line-height: 1.7;

          color: rgba(255,255,255,0.48);
        }

        .startHereFooterColumn {
          display: flex;
          flex-direction: column;

          gap: 14px;
        }

        .startHereFooterColumn h4 {
          margin: 0 0 12px;

          font-size: 11px;
          letter-spacing: 2px;

          color: rgba(255,255,255,0.45);
        }

        .startHereFooterColumn a {
          color: rgba(255,255,255,0.75);

          text-decoration: none;

          font-size: 14px;
        }

        .startHereFooterColumn a:hover {
          color: white;
        }

        .startHereCopyright {
          padding: 24px 5%;

          background: #101914;

          color: rgba(255,255,255,0.4);

          font-size: 13px;
        }


        /* MOBILE */

        @media (max-width: 900px) {

          .startHereHeader {
            padding: 25px 30px;
          }

          .startHereNav {
            gap: 18px;
          }

          .startHereIntro {
            grid-template-columns: 1fr;
            gap: 35px;

            padding: 100px 30px;
          }

          .startHereSystemGrid {
            grid-template-columns: 1fr;
          }

          .startHerePhilosophy {
            grid-template-columns: 1fr;
          }

          .startHerePhilosophyImage {
            min-height: 480px;
          }

          .startHereFooter {
            grid-template-columns: 1fr 1fr;
          }

        }

        @media (max-width: 600px) {

          .startHereHero {
            min-height: 700px;
          }

          .startHereHeader {
            padding: 22px;
          }

          .startHereNav {
            display: none;
          }

          .startHereHeroContent {
            margin-left: 24px;
            margin-right: 24px;

            padding-top: 210px;
          }

          .startHereHeroContent h1 {
            font-size: 48px;
          }

          .startHereSystems {
            padding: 85px 24px;
          }

          .startHereSystemImage {
            height: 230px;
          }

          .startHerePhilosophyContent {
            padding: 80px 30px;
          }

          .startHereFooter {
            grid-template-columns: 1fr;

            gap: 45px;

            padding: 70px 30px;
          }

        }
      `}</style>
    </main>
  );
}
