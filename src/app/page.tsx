import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="roamHome">
      <section className="roamHomeHero">
        <Image
          src="/hero.jpg"
          alt="Vehicle camping system"
          fill
          priority
          className="roamHomeImage"
        />

        <div className="roamHomeOverlay" />

        {/* Header */}
        <header className="roamHomeHeader">
          <Link href="/" className="roamHomeLogo">
            ROAMLAB
          </Link>

          <nav className="roamHomeNav">
            <Link href="/">Home</Link>
            <Link href="/start-here">Start Here</Link>
            <Link href="/gear-builder">Gear Builder</Link>
            <Link href="/gear/sleeping">Gear Lab</Link>
          </nav>
        </header>

        {/* Hero */}
        <div className="roamHomeContent">
          <p className="roamHomeEyebrow">
            START HERE
          </p>

          <h1>
            Build Your First
            <br />
            Car Camping System
          </h1>

          <p className="roamHomeDescription">
            Start simple. Build smart. Create your complete vehicle system.
          </p>

          <Link
            href="/gear-builder"
            className="roamHomeButton"
          >
            Start Building →
          </Link>
        </div>
      </section>

      <style>{`
        .roamHome {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #f4f3ef;
        }

        .roamHomeHero {
          position: relative;
          min-height: 720px;
          height: 100vh;
          max-height: 900px;
          overflow: hidden;
          isolation: isolate;
        }

        .roamHomeImage {
          object-fit: cover;
          object-position: center;
          z-index: -2;
        }

        .roamHomeOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.65) 0%,
              rgba(0, 0, 0, 0.42) 45%,
              rgba(0, 0, 0, 0.18) 100%
            );
          z-index: -1;
        }

        .roamHomeHeader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 28px 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          z-index: 10;
        }

        .roamHomeLogo {
          color: #ffffff;
          text-decoration: none;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 3px;
          line-height: 1;
        }

        .roamHomeNav {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .roamHomeNav a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s ease;
        }

        .roamHomeNav a:hover {
          opacity: 0.65;
        }

        .roamHomeContent {
          position: relative;
          z-index: 2;
          width: min(680px, calc(100% - 120px));
          padding-top: 220px;
          margin-left: 68px;
          color: #ffffff;
        }

        .roamHomeEyebrow {
          margin: 0 0 22px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.7);
        }

        .roamHomeContent h1 {
          margin: 0;
          max-width: 650px;
          font-size: clamp(48px, 5vw, 72px);
          line-height: 1.06;
          letter-spacing: -2px;
          font-weight: 700;
          color: #ffffff;
        }

        .roamHomeDescription {
          margin: 28px 0 0;
          max-width: 540px;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.82);
        }

        .roamHomeButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 36px;
          padding: 15px 26px;
          border-radius: 999px;
          background: #ffffff;
          color: #17221e;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .roamHomeButton:hover {
          transform: translateY(-2px);
          background: #edf0eb;
        }

        @media (max-width: 768px) {
          .roamHomeHero {
            min-height: 680px;
          }

          .roamHomeHeader {
            padding: 24px;
          }

          .roamHomeNav {
            gap: 16px;
          }

          .roamHomeNav a {
            font-size: 12px;
          }

          .roamHomeContent {
            width: auto;
            margin: 0 24px;
            padding-top: 190px;
          }

          .roamHomeContent h1 {
            font-size: 48px;
            letter-spacing: -1.5px;
          }

          .roamHomeDescription {
            font-size: 16px;
          }
        }

        @media (max-width: 560px) {
          .roamHomeNav {
            display: none;
          }

          .roamHomeContent h1 {
            font-size: 42px;
          }
        }
      `}</style>
    </main>
  );
}
