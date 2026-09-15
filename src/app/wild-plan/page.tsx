"use client";

import { useRouter } from "next/navigation";

type PlanModule = {
  key:
    | "adventure"
    | "route"
    | "conditions"
    | "gear"
    | "safety"
    | "knowledge"
    | "cost"
    | "readiness";
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  status: string;
  progress: number;
  enabled: boolean;
};

const modules: PlanModule[] = [
  {
    key: "adventure",
    eyebrow: "01",
    title: "Adventure",
    description: "Where · When · Who · Ways In",
    detail: "Define the shape of your Wild.",
    status: "IN PROGRESS",
    progress: 45,
    enabled: false,
  },
  {
    key: "route",
    eyebrow: "02",
    title: "Route",
    description: "Route · Stops · Camps · Distance",
    detail: "Build the path before you take it.",
    status: "NOT STARTED",
    progress: 0,
    enabled: false,
  },
  {
    key: "conditions",
    eyebrow: "03",
    title: "Conditions",
    description: "Weather · Terrain · Temperature",
    detail: "Know what the environment may ask of you.",
    status: "NOT STARTED",
    progress: 0,
    enabled: false,
  },
  {
    key: "gear",
    eyebrow: "04",
    title: "Gear System",
    description: "Gear Room · Owned · Need · Checklist",
    detail: "Build the right system for this Wild.",
    status: "AVAILABLE",
    progress: 0,
    enabled: true,
  },
  {
    key: "safety",
    eyebrow: "05",
    title: "Safety",
    description: "Risk · First Aid · Emergency Plan",
    detail: "Prepare for what you hope never happens.",
    status: "COMING NEXT",
    progress: 0,
    enabled: false,
  },
  {
    key: "knowledge",
    eyebrow: "06",
    title: "Knowledge",
    description: "Skills · Local Rules · What To Know",
    detail: "Learn only what matters for this Wild.",
    status: "COMING NEXT",
    progress: 0,
    enabled: false,
  },
  {
    key: "cost",
    eyebrow: "07",
    title: "Cost",
    description: "Travel · Gear · Food · Camps · Fees",
    detail: "Plan the whole Wild — not just the gear.",
    status: "COMING NEXT",
    progress: 0,
    enabled: false,
  },
  {
    key: "readiness",
    eyebrow: "08",
    title: "Readiness",
    description: "Gear · Route · Safety · Knowledge · Budget",
    detail: "See what is ready and what still needs work.",
    status: "WAITING FOR PLAN",
    progress: 0,
    enabled: false,
  },
];

export default function WildPlanPage() {
  const router = useRouter();

  function openModule(module: PlanModule) {
    if (module.key === "gear") {
      /*
       * First working connection.
       *
       * For now this opens the existing Drive Gear Room.
       * Later the active Wild will provide the context
       * instead of relying only on URL parameters.
       */
      router.push("/ways-in/drive/gear");
      return;
    }
  }

  return (
    <main className="wildPlan">
      <div className="wildPlanBackground" />

      <header className="wildPlanHeader">
        <button
          className="brand"
          onClick={() => router.push("/")}
          aria-label="Go to RoamLab home"
        >
          ROAMLAB
        </button>

        <nav className="nav">
          <button onClick={() => router.push("/")}>HOME</button>
          <button onClick={() => router.push("/ways-in")}>WAYS IN</button>
          <button onClick={() => router.push("/gear")}>GEAR LAB</button>
        </nav>
      </header>

      <section className="wildPlanIntro">
        <div className="compassMark" aria-hidden="true">
          <span className="compassRing">
            <span className="compassNeedle">◆</span>
          </span>
        </div>

        <p className="eyebrow">YOUR WILD</p>

        <h1>Your Wild Plan</h1>

        <p className="introCopy">
          Everything you need before you go wild.
        </p>

        <div className="wildIdentity">
          <span>PLANNING</span>
          <span className="dot">•</span>
          <span>WILD DRAFT</span>
        </div>
      </section>

      <section className="planMap" aria-label="Your Wild Plan systems">
        {modules.map((module) => (
          <button
            key={module.key}
            className={`planModule ${
              module.enabled ? "planModuleActive" : ""
            }`}
            onClick={() => openModule(module)}
            disabled={!module.enabled}
          >
            <div className="moduleTop">
              <span className="moduleNumber">{module.eyebrow}</span>
              <span
                className={`moduleStatus ${
                  module.enabled ? "moduleStatusActive" : ""
                }`}
              >
                {module.status}
              </span>
            </div>

            <h2>{module.title}</h2>

            <p className="moduleDescription">
              {module.description}
            </p>

            <p className="moduleDetail">
              {module.detail}
            </p>

            <div className="progressTrack">
              <span
                className="progressFill"
                style={{ width: `${module.progress}%` }}
              />
            </div>

            <div className="moduleBottom">
              <span>{module.progress}%</span>

              {module.enabled ? (
                <span className="openLabel">
                  OPEN GEAR ROOM →
                </span>
              ) : (
                <span>—</span>
              )}
            </div>
          </button>
        ))}
      </section>

      <section className="readinessSummary">
        <div>
          <p className="summaryEyebrow">OVERALL READINESS</p>
          <h2>Start building your Wild.</h2>
          <p>
            As Route, Gear, Safety, Knowledge and Cost come together,
            RoamLab will calculate how ready this adventure really is.
          </p>
        </div>

        <div className="readinessNumber">
          <strong>—</strong>
          <span>READY</span>
        </div>
      </section>

      <footer className="wildPlanFooter">
        <span>GO WILD.</span>
        <span className="footerLine" />
        <span>SHOW IT.</span>
      </footer>

      <style jsx>{`
        .wildPlan {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 18%,
              rgba(151, 119, 69, 0.14),
              transparent 34%
            ),
            linear-gradient(
              180deg,
              #171611 0%,
              #0e0f0c 52%,
              #090a08 100%
            );
          color: #f2eee4;
          padding: 0 56px 56px;
        }

        .wildPlanBackground {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 82%
          );
        }

        .wildPlanHeader {
          position: relative;
          z-index: 5;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        button {
          font: inherit;
        }

        .brand {
          border: 0;
          background: transparent;
          color: #f4f0e7;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.18em;
          cursor: pointer;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav button {
          border: 0;
          background: transparent;
          color: rgba(242, 238, 228, 0.65);
          font-size: 11px;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition:
            color 160ms ease,
            opacity 160ms ease;
        }

        .nav button:hover {
          color: #ffffff;
        }

        .wildPlanIntro {
          position: relative;
          z-index: 2;
          max-width: 760px;
          margin: 68px auto 58px;
          text-align: center;
        }

        .compassMark {
          display: flex;
          justify-content: center;
          margin-bottom: 22px;
        }

        .compassRing {
          width: 62px;
          height: 62px;
          border: 1px solid rgba(212, 178, 117, 0.6);
          border-radius: 50%;
          display: grid;
          place-items: center;
          box-shadow:
            0 0 0 8px rgba(212, 178, 117, 0.025),
            0 0 40px rgba(212, 178, 117, 0.08);
        }

        .compassNeedle {
          color: #c8a66c;
          font-size: 25px;
          transform: rotate(45deg);
        }

        .eyebrow,
        .summaryEyebrow {
          margin: 0 0 12px;
          color: #b89966;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
        }

        .wildPlanIntro h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(46px, 6vw, 78px);
          font-weight: 400;
          letter-spacing: -0.035em;
        }

        .introCopy {
          margin: 18px 0 0;
          color: rgba(242, 238, 228, 0.64);
          font-size: 16px;
          line-height: 1.7;
        }

        .wildIdentity {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
          color: rgba(242, 238, 228, 0.4);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .dot {
          color: #a88755;
        }

        .planMap {
          position: relative;
          z-index: 2;
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .planModule {
          min-height: 255px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 2px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.015)
            );
          color: inherit;
          text-align: left;
          opacity: 0.58;
          cursor: default;
        }

        .planModuleActive {
          opacity: 1;
          cursor: pointer;
          border-color: rgba(192, 154, 93, 0.34);
          background:
            radial-gradient(
              circle at 18% 15%,
              rgba(193, 153, 89, 0.1),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.018)
            );
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .planModuleActive:hover {
          transform: translateY(-3px);
          border-color: rgba(211, 173, 108, 0.62);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
        }

        .moduleTop,
        .moduleBottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .moduleNumber {
          color: #a98a58;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
        }

        .moduleStatus {
          color: rgba(242, 238, 228, 0.38);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .moduleStatusActive {
          color: #c9a66b;
        }

        .planModule h2 {
          margin: 38px 0 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 400;
        }

        .moduleDescription {
          min-height: 34px;
          margin: 0;
          color: rgba(242, 238, 228, 0.68);
          font-size: 12px;
          line-height: 1.5;
        }

        .moduleDetail {
          min-height: 42px;
          margin: 18px 0 20px;
          color: rgba(242, 238, 228, 0.4);
          font-size: 11px;
          line-height: 1.6;
        }

        .progressTrack {
          width: 100%;
          height: 2px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
        }

        .progressFill {
          display: block;
          height: 100%;
          background: #b7945d;
        }

        .moduleBottom {
          margin-top: 12px;
          color: rgba(242, 238, 228, 0.4);
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .openLabel {
          color: #d1ad70;
          font-weight: 700;
        }

        .readinessSummary {
          position: relative;
          z-index: 2;
          width: min(1180px, 100%);
          margin: 18px auto 0;
          padding: 34px 38px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .readinessSummary > div:first-child {
          max-width: 680px;
        }

        .readinessSummary h2 {
          margin: 0 0 10px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
          font-weight: 400;
        }

        .readinessSummary p:not(.summaryEyebrow) {
          margin: 0;
          color: rgba(242, 238, 228, 0.48);
          font-size: 12px;
          line-height: 1.7;
        }

        .readinessNumber {
          min-width: 120px;
          text-align: right;
        }

        .readinessNumber strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 52px;
          font-weight: 400;
          color: #b7955e;
        }

        .readinessNumber span {
          color: rgba(242, 238, 228, 0.38);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .wildPlanFooter {
          position: relative;
          z-index: 2;
          width: min(1180px, 100%);
          margin: 46px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: rgba(242, 238, 228, 0.28);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
        }

        .footerLine {
          width: 48px;
          height: 1px;
          background: rgba(242, 238, 228, 0.16);
        }

        @media (max-width: 980px) {
          .wildPlan {
            padding-left: 28px;
            padding-right: 28px;
          }

          .planMap {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .wildPlan {
            padding-left: 18px;
            padding-right: 18px;
          }

          .wildPlanHeader {
            height: 76px;
          }

          .nav {
            gap: 14px;
          }

          .nav button:nth-child(2) {
            display: none;
          }

          .wildPlanIntro {
            margin-top: 48px;
          }

          .planMap {
            grid-template-columns: 1fr;
          }

          .planModule {
            min-height: 225px;
          }

          .readinessSummary {
            padding-left: 0;
            padding-right: 0;
          }
        }
      `}</style>
    </main>
  );
}
