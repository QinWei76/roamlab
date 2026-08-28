import Image from "next/image";
import Link from "next/link";

const vehicles = [
  {
    name: "SUV",
    desc: "Weekend adventures and flexible camping systems.",
    image: "/vehicle-suv.jpg",
  },
  {
    name: "Truck",
    desc: "More capability. More space. More gear.",
    image: "/vehicle-truck.jpg",
  },
  {
    name: "Van",
    desc: "Build a complete travel and living system.",
    image: "/vehicle-van.jpg",
  },
  {
    name: "EV",
    desc: "Modern electric outdoor adventures.",
    image: "/vehicle-ev.jpg",
  },
];

export default function GearBuilderPage() {
  return (
    <main className="builderPage">
      {/* HERO */}
      <section className="builderHero">
        <Image
          src="/gear-builder-hero.jpg"
          alt="Camping gear setup"
          fill
          priority
          className="builderImage"
        />

        <div className="builderOverlay" />

        <div className="builderContent">
          <p className="builderEyebrow">GEAR BUILDER</p>

          <h1>
            Build Your
            <br />
            Camping System
          </h1>

          <p className="builderDesc">
            Start with your vehicle.
            <br />
            We will help create your setup.
          </p>
        </div>
      </section>

      {/* VEHICLE SELECT */}
      <section className="vehicleSection">
        <div className="vehicleSectionInner">
          <div className="vehicleIntro">
            <p className="vehicleStep">STEP 01</p>

            <h2>What do you drive?</h2>

            <p>
              Your vehicle is the foundation of your camping system.
              Choose your setup to get started.
            </p>
          </div>

          <div className="vehicleGrid">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.name}
                href={`/gear-builder/setup?vehicle=${vehicle.name}`}
                className="vehicleCard"
              >
                <div className="vehicleCardImage">
                  <Image
                    src={vehicle.image}
                    alt={`${vehicle.name} camping setup`}
                    fill
                    className="vehicleImage"
                  />
                </div>

                <div className="vehicleCardContent">
                  <h3>{vehicle.name}</h3>

                  <p>{vehicle.desc}</p>

                  <span>
                    Choose <b>→</b>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .builderPage {
          width: 100%;
          background: #f3f2ee;
          color: #1d2925;
        }

        .builderHero {
          position: relative;
          min-height: 500px;
          height: 58vh;
          max-height: 680px;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .builderImage {
          object-fit: cover;
          object-position: center;
          z-index: 0;
        }

        .builderOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(12, 20, 18, 0.82) 0%,
              rgba(12, 20, 18, 0.55) 45%,
              rgba(12, 20, 18, 0.18) 100%
            );
          z-index: 1;
        }

        .builderContent {
          position: relative;
          z-index: 2;
          margin-left: 8%;
          color: white;
        }

        .builderEyebrow {
          margin: 0 0 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.7);
        }

        .builderContent h1 {
          margin: 0;
          font-size: clamp(48px, 6vw, 76px);
          line-height: 1.02;
          letter-spacing: -2px;
          font-weight: 700;
        }

        .builderDesc {
          margin-top: 28px;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255,255,255,0.8);
        }

        .vehicleSection {
          padding: 100px 60px 120px;
          background: #f3f2ee;
        }

        .vehicleSectionInner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .vehicleIntro {
          max-width: 620px;
          margin-bottom: 55px;
        }

        .vehicleStep {
          margin: 0 0 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #4c665d;
        }

        .vehicleIntro h2 {
          margin: 0;
          font-size: clamp(38px, 4vw, 56px);
          letter-spacing: -1.5px;
          line-height: 1.1;
        }

        .vehicleIntro p:last-child {
          margin: 20px 0 0;
          max-width: 520px;
          color: #68716d;
          font-size: 17px;
          line-height: 1.7;
        }

        .vehicleGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
        }

        .vehicleCard {
          display: block;
          overflow: hidden;
          background: white;
          border: 1px solid #d9ddd9;
          border-radius: 18px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .vehicleCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 45px rgba(20, 35, 29, 0.12);
        }

        .vehicleCardImage {
          position: relative;
          height: 300px;
          overflow: hidden;
        }

        .vehicleImage {
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .vehicleCard:hover .vehicleImage {
          transform: scale(1.04);
        }

        .vehicleCardContent {
          padding: 28px 32px 32px;
        }

        .vehicleCardContent h3 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.8px;
        }

        .vehicleCardContent p {
          margin: 14px 0 24px;
          color: #6b7470;
          font-size: 16px;
          line-height: 1.6;
          min-height: 52px;
        }

        .vehicleCardContent span {
          color: #345247;
          font-size: 14px;
          font-weight: 700;
        }

        .vehicleCardContent b {
          margin-left: 5px;
          font-size: 17px;
        }

        @media (max-width: 768px) {
          .builderHero {
            min-height: 480px;
          }

          .builderContent {
            margin-left: 24px;
            margin-right: 24px;
          }

          .vehicleSection {
            padding: 70px 24px 80px;
          }

          .vehicleGrid {
            grid-template-columns: 1fr;
          }

          .vehicleCardImage {
            height: 260px;
          }

          .vehicleCardContent {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}
