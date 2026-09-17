"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Wild } from "@/types/wild";

import {
  CURRENT_WILD_UPDATED_EVENT,
  getCurrentWild,
} from "@/lib/wildStore";


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

  number: string;
  title: string;
  description: string;
  detail: string;
  status: string;
  progress: number;
  enabled: boolean;
};


/* =========================================================
   DISPLAY HELPERS
   ========================================================= */

function formatValue(value?: string): string {
  if (!value) {
    return "Not set";
  }

  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}


function formatVehicle(
  type?: string
): string {
  if (!type) {
    return "Vehicle not selected";
  }

  switch (type) {
    case "suv":
      return "SUV";

    case "truck":
      return "Truck";

    case "van":
      return "Van";

    case "crossover":
      return "Crossover / AWD";

    case "city":
      return "2WD / City Car";

    default:
      return formatValue(type);
  }
}


function formatTripStyle(
  tripStyle?: string
): string {
  if (!tripStyle) {
    return "Trip style not selected";
  }

  switch (tripStyle) {
    case "weekend":
      return "Weekend Escape";

    case "road-trip":
      return "Road Trip";

    case "basecamp":
      return "Basecamp";

    case "remote":
      return "Remote / Off-Grid";

    default:
      return formatValue(tripStyle);
  }
}


function formatCrew(
  type?: string,
  people?: number
): string {
  if (!type) {
    return "Crew not selected";
  }

  const crewName =
    formatValue(type);

  if (!people) {
    return crewName;
  }

  return `${crewName} · ${
    people === 6 ? "6+" : people
  }`;
}


function formatDuration(
  durationType?: string
): string {
  if (!durationType) {
    return "Duration not selected";
  }

  switch (durationType) {
    case "overnight":
      return "Overnight";

    case "weekend":
      return "Weekend";

    case "multi-day":
      return "Multi-Day";

    case "extended":
      return "Extended";

    default:
      return formatValue(durationType);
  }
}


function formatMoney(
  amount?: number,
  currency = "USD"
): string {
  if (
    amount === undefined ||
    !Number.isFinite(amount)
  ) {
    return "Budget not set";
  }

  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(
      "en-US"
    )}`;
  }
}


/* =========================================================
   ADVENTURE COMPLETION
   ========================================================= */

function calculateAdventureProgress(
  wild: Wild | null
): number {
  if (!wild) {
    return 0;
  }

  const adventure =
    wild.plan.adventure;

  const checks = [
    Boolean(adventure.wayIn),
    Boolean(adventure.vehicle?.type),
    Boolean(adventure.tripStyle),
    Boolean(adventure.crew?.type),
    Boolean(adventure.crew?.people),
    Boolean(
      adventure.schedule?.durationType
    ),
  ];

  const completed =
    checks.filter(Boolean).length;

  return Math.round(
    (completed / checks.length) * 100
  );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function WildPlanPage() {
  const router = useRouter();

  const [wild, setWild] =
    useState<Wild | null>(null);

  const [loaded, setLoaded] =
    useState(false);


  /* =======================================================
     LOAD CURRENT WILD

     Also listen for changes so the page can stay connected
     to the shared Current Wild store.
     ======================================================= */

  useEffect(() => {
    const loadWild = () => {
      setWild(getCurrentWild());
      setLoaded(true);
    };

    loadWild();

    window.addEventListener(
      CURRENT_WILD_UPDATED_EVENT,
      loadWild
    );

    window.addEventListener(
      "storage",
      loadWild
    );

    return () => {
      window.removeEventListener(
        CURRENT_WILD_UPDATED_EVENT,
        loadWild
      );

      window.removeEventListener(
        "storage",
        loadWild
      );
    };
  }, []);


  const adventure =
    wild?.plan.adventure;

  const adventureProgress =
    calculateAdventureProgress(wild);


  const adventureComplete =
    adventureProgress === 100;


  const gearSystem =
    wild?.plan.prepare?.gear;

  const gearItems =
    gearSystem?.items ?? [];

  const gearExists =
    gearItems.length > 0;

  const essentialGearCount =
    gearItems.filter(
      (item) =>
        item.priority === "essential"
    ).length;

  const recommendedGearCount =
    gearItems.filter(
      (item) =>
        item.priority === "recommended"
    ).length;

  const optionalGearCount =
    gearItems.filter(
      (item) =>
        item.priority === "optional"
    ).length;

  const cost =
    wild?.plan.cost;

  const totalWildBudget =
    cost?.totalWildBudget;

  const currency =
    cost?.currency ?? "USD";

  const totalBudgetExists =
    typeof totalWildBudget === "number" &&
    Number.isFinite(totalWildBudget) &&
    totalWildBudget > 0;


  const routeExists =
    Boolean(
      wild?.plan.route
    );


  const conditionsExist =
    Boolean(
      wild?.plan.conditions
    );


  const safetyExists =
    Boolean(
      wild?.plan.safety
    );


  const knowledgeExists =
    Boolean(
      wild?.plan.knowledge
    );


  const costExists =
    Boolean(cost);


  /* =======================================================
     PLAN MODULES
     ======================================================= */

  const modules: PlanModule[] = [
    {
      key: "adventure",

      number: "01",

      title: "Adventure",

      description:
        "Where · When · Who · Ways In",

      detail: wild
        ? `${formatValue(
            adventure?.wayIn
          )} · ${formatVehicle(
            adventure?.vehicle?.type
          )} · ${formatTripStyle(
            adventure?.tripStyle
          )}`
        : "Define the shape of your Wild.",

      status: adventureComplete
        ? "CONTEXT READY"
        : adventureProgress > 0
        ? "IN PROGRESS"
        : "NOT STARTED",

      progress: adventureProgress,

      enabled: true,
    },

    {
      key: "route",

      number: "02",

      title: "Route",

      description:
        "Route · Stops · Camps · Distance",

      detail: routeExists
        ? "Route information added to this Wild."
        : "Build the path before you take it.",

      status: routeExists
        ? "IN PROGRESS"
        : "NOT STARTED",

      progress: routeExists
        ? 25
        : 0,

      enabled: false,
    },

    {
      key: "conditions",

      number: "03",

      title: "Conditions",

      description:
        "Weather · Terrain · Temperature",

      detail: conditionsExist
        ? "Conditions have been added."
        : "Know what the environment may ask of you.",

      status: conditionsExist
        ? "IN PROGRESS"
        : "NOT STARTED",

      progress: conditionsExist
        ? 25
        : 0,

      enabled: false,
    },

    {
      key: "gear",

      number: "04",

      title: "Gear System",

      description:
        "Gear Room · Owned · Need · Checklist",

      detail: gearExists
        ? `${gearItems.length} categories · ${essentialGearCount} essential · ${recommendedGearCount} recommended · ${optionalGearCount} optional`
        : "Build the right system for this Wild.",

      status: gearExists
        ? "GEAR SYSTEM BUILT"
        : "AVAILABLE",

      progress: gearExists
        ? 100
        : 0,

      enabled: true,
    },

    {
      key: "safety",

      number: "05",

      title: "Safety",

      description:
        "Risk · First Aid · Emergency Plan",

      detail: safetyExists
        ? "Safety planning has started."
        : "Prepare for what you hope never happens.",

      status: safetyExists
        ? "IN PROGRESS"
        : "COMING NEXT",

      progress: safetyExists
        ? 25
        : 0,

      enabled: false,
    },

    {
      key: "knowledge",

      number: "06",

      title: "Knowledge",

      description:
        "Skills · Local Rules · What To Know",

      detail: knowledgeExists
        ? "Knowledge preparation has started."
        : "Learn only what matters for this Wild.",

      status: knowledgeExists
        ? "IN PROGRESS"
        : "COMING NEXT",

      progress: knowledgeExists
        ? 25
        : 0,

      enabled: false,
    },

    {
      key: "cost",

      number: "07",

      title: "Cost",

      description:
        "Travel · Gear · Food · Camps · Fees",

      detail: totalBudgetExists
        ? `${formatMoney(
            totalWildBudget,
            currency
          )} total Wild budget`
        : costExists
        ? "Budget planning has started."
        : "Plan the whole Wild — not just the gear.",

      status: totalBudgetExists
        ? "BUDGET SET"
        : costExists
        ? "IN PROGRESS"
        : "AVAILABLE",

      progress: totalBudgetExists
        ? 100
        : costExists
        ? 25
        : 0,

      enabled: true,
    },

    {
      key: "readiness",

      number: "08",

      title: "Readiness",

      description:
        "Gear · Route · Safety · Knowledge · Budget",

      detail:
        "RoamLab will combine every system into one departure check.",

      status:
        wild?.plan.readiness
          ? "IN PROGRESS"
          : "WAITING FOR PLAN",

      progress: 0,

      enabled: false,
    },
  ];


  /* =======================================================
     MODULE ACTIONS
     ======================================================= */

  function openModule(
    module: PlanModule
  ) {
    if (module.key === "adventure") {
      router.push("/ways-in");
      return;
    }

    if (module.key === "gear") {
      const params =
        new URLSearchParams();

      if (adventure?.vehicle?.type) {
        params.set(
          "vehicle",
          adventure.vehicle.type
        );
      }

      if (adventure?.tripStyle) {
        params.set(
          "trip",
          adventure.tripStyle
        );
      }

      if (adventure?.crew?.type) {
        params.set(
          "crew",
          adventure.crew.type
        );
      }

      if (adventure?.crew?.people) {
        params.set(
          "people",
          String(
            adventure.crew.people
          )
        );
      }

      if (
        adventure?.schedule
          ?.durationType
      ) {
        params.set(
          "duration",
          adventure.schedule
            .durationType
        );
      }

      const query =
        params.toString();

      router.push(
        query
          ? `/ways-in/drive/gear?${query}`
          : "/ways-in/drive/gear"
      );

      return;
    }

    if (module.key === "cost") {
      const params =
        new URLSearchParams();

      if (adventure?.vehicle?.type) {
        params.set(
          "vehicle",
          adventure.vehicle.type
        );
      }

      if (adventure?.tripStyle) {
        params.set(
          "trip",
          adventure.tripStyle
        );
      }

      if (adventure?.crew?.type) {
        params.set(
          "crew",
          adventure.crew.type
        );
      }

      if (adventure?.crew?.people) {
        params.set(
          "people",
          String(
            adventure.crew.people
          )
        );
      }

      if (
        adventure?.schedule
          ?.durationType
      ) {
        params.set(
          "duration",
          adventure.schedule
            .durationType
        );
      }

      const query =
        params.toString();

      router.push(
        query
          ? `/ways-in/drive/budget?${query}`
          : "/ways-in/drive/budget"
      );

      return;
    }
  }


  /* =======================================================
     LOADING
     ======================================================= */

  if (!loaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0d0e0b",
        }}
      />
    );
  }


  return (
    <main className="wildPlan">

      <div className="wildPlanBackground" />


      {/* ===================================================
          HEADER
         =================================================== */}

      <header className="wildPlanHeader">

        <button
          type="button"
          className="brand"
          onClick={() =>
            router.push("/")
          }
          aria-label="Go to RoamLab home"
        >
          ROAMLAB
        </button>


        <nav className="nav">

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
          >
            HOME
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/ways-in")
            }
          >
            WAYS IN
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/gear")
            }
          >
            GEAR LAB
          </button>

        </nav>

      </header>


      {/* ===================================================
          INTRO
         =================================================== */}

      <section className="wildPlanIntro">

        <div
          className="compassMark"
          aria-hidden="true"
        >
          <span className="compassRing">
            <span className="compassNeedle">
              ◆
            </span>
          </span>
        </div>


        <p className="eyebrow">
          YOUR WILD
        </p>


        <h1>
          {wild?.title ||
            "Your Wild Plan"}
        </h1>


        <p className="introCopy">
          Everything you need before
          you go wild.
        </p>


        <div className="wildIdentity">

          <span>
            {wild
              ? wild.status.toUpperCase()
              : "NO ACTIVE WILD"}
          </span>

          <span className="dot">
            •
          </span>

          <span>
            {wild
              ? "CURRENT WILD"
              : "START A WILD"}
          </span>

        </div>

      </section>


      {/* ===================================================
          NO CURRENT WILD
         =================================================== */}

      {!wild && (
        <section className="emptyWild">

          <p>
            NO ACTIVE WILD
          </p>

          <h2>
            Start with a way in.
          </h2>

          <span>
            Choose how you want to
            enter the outdoors and
            RoamLab will begin building
            your plan around it.
          </span>

          <button
            type="button"
            onClick={() =>
              router.push("/ways-in")
            }
          >
            START YOUR WILD →
          </button>

        </section>
      )}


      {/* ===================================================
          REAL CURRENT WILD CONTEXT
         =================================================== */}

      {wild && (
        <section className="wildContext">

          <div className="contextItem">
            <span>
              WAY IN
            </span>

            <strong>
              {formatValue(
                adventure?.wayIn
              )}
            </strong>
          </div>


          <div className="contextItem">
            <span>
              VEHICLE
            </span>

            <strong>
              {formatVehicle(
                adventure?.vehicle?.type
              )}
            </strong>
          </div>


          <div className="contextItem">
            <span>
              TRIP STYLE
            </span>

            <strong>
              {formatTripStyle(
                adventure?.tripStyle
              )}
            </strong>
          </div>


          <div className="contextItem">
            <span>
              CREW
            </span>

            <strong>
              {formatCrew(
                adventure?.crew?.type,
                adventure?.crew?.people
              )}
            </strong>
          </div>


          <div className="contextItem">
            <span>
              DURATION
            </span>

            <strong>
              {formatDuration(
                adventure?.schedule
                  ?.durationType
              )}
            </strong>
          </div>

        </section>
      )}


      {/* ===================================================
          PLAN SYSTEMS
         =================================================== */}

      <section
        className="planMap"
        aria-label="Your Wild Plan systems"
      >

        {modules.map((module) => (

          <button
            key={module.key}
            type="button"
            className={`planModule ${
              module.enabled
                ? "planModuleActive"
                : ""
            }`}
            onClick={() =>
              openModule(module)
            }
            disabled={
              !module.enabled
            }
          >

            <div className="moduleTop">

              <span className="moduleNumber">
                {module.number}
              </span>

              <span
                className={`moduleStatus ${
                  module.enabled
                    ? "moduleStatusActive"
                    : ""
                }`}
              >
                {module.status}
              </span>

            </div>


            <h2>
              {module.title}
            </h2>


            <p className="moduleDescription">
              {module.description}
            </p>


            <p className="moduleDetail">
              {module.detail}
            </p>


            <div className="progressTrack">

              <span
                className="progressFill"
                style={{
                  width: `${module.progress}%`,
                }}
              />

            </div>


            <div className="moduleBottom">

              <span>
                {module.progress}%
              </span>


              {module.key ===
                "adventure" &&
              module.enabled ? (
                <span className="openLabel">
                  EDIT ADVENTURE →
                </span>
              ) : module.key ===
                  "gear" &&
                module.enabled ? (
                <span className="openLabel">
                  {gearExists
                    ? "VIEW GEAR SYSTEM →"
                    : "OPEN GEAR ROOM →"}
                </span>
              ) : module.key ===
                  "cost" &&
                module.enabled ? (
                <span className="openLabel">
                  {totalBudgetExists
                    ? "EDIT BUDGET →"
                    : "SET BUDGET →"}
                </span>
              ) : (
                <span>
                  —
                </span>
              )}

            </div>

          </button>

        ))}

      </section>


      {/* ===================================================
          READINESS
         =================================================== */}

      <section className="readinessSummary">

        <div>

          <p className="summaryEyebrow">
            OVERALL READINESS
          </p>


          <h2>
            {adventureComplete
              ? "Your adventure context is ready."
              : "Keep building your Wild."}
          </h2>


          <p>
            Route, Gear, Safety,
            Knowledge and Cost will
            eventually combine into one
            complete departure readiness
            check.
          </p>

        </div>


        <div className="readinessNumber">

          <strong>
            {adventureProgress}
          </strong>

          <span>
            ADVENTURE %
          </span>

        </div>

      </section>


      {/* ===================================================
          FOOTER
         =================================================== */}

      <footer className="wildPlanFooter">

        <span>
          GO WILD.
        </span>

        <span className="footerLine" />

        <span>
          SHOW IT.
        </span>

      </footer>


      {/* ===================================================
          TEMPORARY FUNCTIONAL STYLES

          This is still the functional skeleton.
          Later we replace the dashboard look with the
          physical expedition desk / map scene.
         =================================================== */}

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
              rgba(
                255,
                255,
                255,
                0.018
              )
              1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(
                255,
                255,
                255,
                0.018
              )
              1px,
              transparent 1px
            );

          background-size:
            48px 48px;
        }


        .wildPlanHeader {
          position: relative;
          z-index: 5;

          height: 92px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );
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

          color:
            rgba(
              242,
              238,
              228,
              0.65
            );

          font-size: 11px;
          letter-spacing: 0.14em;

          cursor: pointer;
        }


        .nav button:hover {
          color: #ffffff;
        }


        .wildPlanIntro {
          position: relative;
          z-index: 2;

          max-width: 760px;

          margin:
            58px auto 34px;

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

          border:
            1px solid
            rgba(
              212,
              178,
              117,
              0.6
            );

          border-radius: 50%;

          display: grid;
          place-items: center;

          box-shadow:
            0 0 0 8px
              rgba(
                212,
                178,
                117,
                0.025
              ),
            0 0 40px
              rgba(
                212,
                178,
                117,
                0.08
              );
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

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              46px,
              6vw,
              78px
            );

          font-weight: 400;
          letter-spacing: -0.035em;
        }


        .introCopy {
          margin: 18px 0 0;

          color:
            rgba(
              242,
              238,
              228,
              0.64
            );

          font-size: 16px;
          line-height: 1.7;
        }


        .wildIdentity {
          display: flex;
          justify-content: center;
          gap: 10px;

          margin-top: 24px;

          color:
            rgba(
              242,
              238,
              228,
              0.4
            );

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }


        .dot {
          color: #a88755;
        }


        .wildContext {
          position: relative;
          z-index: 2;

          width:
            min(
              1180px,
              100%
            );

          margin:
            0 auto 18px;

          display: grid;

          grid-template-columns:
            repeat(
              5,
              minmax(0, 1fr)
            );

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );
        }


        .contextItem {
          padding:
            20px 18px;

          border-right:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
        }


        .contextItem:last-child {
          border-right: 0;
        }


        .contextItem span {
          display: block;

          margin-bottom: 8px;

          color:
            rgba(
              242,
              238,
              228,
              0.36
            );

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }


        .contextItem strong {
          display: block;

          color: #e9e2d3;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 15px;
          font-weight: 400;
        }


        .emptyWild {
          position: relative;
          z-index: 2;

          width:
            min(
              760px,
              100%
            );

          margin:
            0 auto 28px;

          padding: 38px;

          text-align: center;

          border:
            1px solid
            rgba(
              190,
              153,
              94,
              0.28
            );

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
        }


        .emptyWild p {
          margin: 0 0 10px;

          color: #b89966;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }


        .emptyWild h2 {
          margin: 0 0 12px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 30px;
          font-weight: 400;
        }


        .emptyWild span {
          display: block;

          max-width: 520px;

          margin:
            0 auto 24px;

          color:
            rgba(
              242,
              238,
              228,
              0.5
            );

          font-size: 12px;
          line-height: 1.7;
        }


        .emptyWild button {
          border:
            1px solid
            rgba(
              201,
              166,
              107,
              0.5
            );

          background:
            rgba(
              201,
              166,
              107,
              0.08
            );

          color: #d1ad70;

          padding:
            13px 18px;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;

          cursor: pointer;
        }


        .planMap {
          position: relative;
          z-index: 2;

          width:
            min(
              1180px,
              100%
            );

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 14px;
        }


        .planModule {
          min-height: 255px;

          padding: 24px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );

          border-radius: 2px;

          background:
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.045
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
            );

          color: inherit;
          text-align: left;

          opacity: 0.58;

          cursor: default;
        }


        .planModuleActive {
          opacity: 1;
          cursor: pointer;

          border-color:
            rgba(
              192,
              154,
              93,
              0.34
            );

          background:
            radial-gradient(
              circle at 18% 15%,
              rgba(
                193,
                153,
                89,
                0.1
              ),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.06
              ),
              rgba(
                255,
                255,
                255,
                0.018
              )
            );

          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }


        .planModuleActive:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(
              211,
              173,
              108,
              0.62
            );

          box-shadow:
            0 18px 50px
            rgba(
              0,
              0,
              0,
              0.28
            );
        }


        .moduleTop,
        .moduleBottom {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 16px;
        }


        .moduleNumber {
          color: #a98a58;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 14px;
        }


        .moduleStatus {
          color:
            rgba(
              242,
              238,
              228,
              0.38
            );

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }


        .moduleStatusActive {
          color: #c9a66b;
        }


        .planModule h2 {
          margin:
            38px 0 8px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 26px;
          font-weight: 400;
        }


        .moduleDescription {
          min-height: 34px;

          margin: 0;

          color:
            rgba(
              242,
              238,
              228,
              0.68
            );

          font-size: 12px;
          line-height: 1.5;
        }


        .moduleDetail {
          min-height: 42px;

          margin:
            18px 0 20px;

          color:
            rgba(
              242,
              238,
              228,
              0.4
            );

          font-size: 11px;
          line-height: 1.6;
        }


        .progressTrack {
          width: 100%;
          height: 2px;

          overflow: hidden;

          background:
            rgba(
              255,
              255,
              255,
              0.08
            );
        }


        .progressFill {
          display: block;

          height: 100%;

          background:
            #b7945d;
        }


        .moduleBottom {
          margin-top: 12px;

          color:
            rgba(
              242,
              238,
              228,
              0.4
            );

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

          width:
            min(
              1180px,
              100%
            );

          margin:
            18px auto 0;

          padding:
            34px 38px;

          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 40px;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );
        }


        .readinessSummary
        > div:first-child {
          max-width: 680px;
        }


        .readinessSummary h2 {
          margin:
            0 0 10px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 28px;
          font-weight: 400;
        }


        .readinessSummary
        p:not(.summaryEyebrow) {
          margin: 0;

          color:
            rgba(
              242,
              238,
              228,
              0.48
            );

          font-size: 12px;
          line-height: 1.7;
        }


        .readinessNumber {
          min-width: 120px;
          text-align: right;
        }


        .readinessNumber strong {
          display: block;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 52px;
          font-weight: 400;

          color: #b7955e;
        }


        .readinessNumber span {
          color:
            rgba(
              242,
              238,
              228,
              0.38
            );

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }


        .wildPlanFooter {
          position: relative;
          z-index: 2;

          width:
            min(
              1180px,
              100%
            );

          margin:
            46px auto 0;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 18px;

          color:
            rgba(
              242,
              238,
              228,
              0.28
            );

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
        }


        .footerLine {
          width: 48px;
          height: 1px;

          background:
            rgba(
              242,
              238,
              228,
              0.16
            );
        }


        @media (
          max-width: 980px
        ) {

          .wildPlan {
            padding-left: 28px;
            padding-right: 28px;
          }


          .wildContext {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }


          .contextItem {
            border-bottom:
              1px solid
              rgba(
                255,
                255,
                255,
                0.08
              );
          }


          .planMap {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

        }


        @media (
          max-width: 640px
        ) {

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


          .wildContext {
            grid-template-columns:
              1fr;
          }


          .contextItem {
            border-right: 0;
          }


          .planMap {
            grid-template-columns:
              1fr;
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
