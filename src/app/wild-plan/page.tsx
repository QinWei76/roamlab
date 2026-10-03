"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Wild } from "@/types/wild";

import {
  CURRENT_WILD_UPDATED_EVENT,
  getCurrentWild,
} from "@/lib/wildStore";


/* =========================================================
   HELPERS
   ========================================================= */

function titleCase(value?: string) {
  if (!value) return "Not set";

  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}


function money(
  value?: number,
  currency = "USD"
) {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "Not set";
  }

  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(value);
  } catch {
    return `${currency} ${value.toLocaleString(
      "en-US"
    )}`;
  }
}


function dateLabel(value?: string) {
  if (!value) return "";

  const date =
    new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  )
    .format(date)
    .toUpperCase();
}


function vehicleLabel(value?: string) {
  const labels: Record<string, string> = {
    suv: "SUV",
    truck: "Truck",
    van: "Van",
    crossover: "Crossover / AWD",
    city: "2WD / City Car",
    "4x4": "4×4",
    rv: "RV",
    motorcycle: "Motorcycle",
  };

  return value
    ? labels[value] ?? titleCase(value)
    : "Vehicle not set";
}


function tripLabel(value?: string) {
  const labels: Record<string, string> = {
    weekend: "Weekend Escape",
    "road-trip": "Road Trip",
    basecamp: "Basecamp",
    remote: "Remote / Off-Grid",
  };

  return value
    ? labels[value] ?? titleCase(value)
    : "Trip style not set";
}


/* =========================================================
   PAGE
   ========================================================= */

export default function WildPlanPage() {

  const router = useRouter();

  const [
    wild,
    setWild
  ] =
    useState<Wild | null>(null);

  const [
    loaded,
    setLoaded
  ] =
    useState(false);


  /* =======================================================
     LOAD CURRENT WILD
     ======================================================= */

  useEffect(() => {

    const load = () => {

      setWild(
        getCurrentWild()
      );

      setLoaded(true);

    };


    load();


    window.addEventListener(
      CURRENT_WILD_UPDATED_EVENT,
      load
    );

    window.addEventListener(
      "storage",
      load
    );


    return () => {

      window.removeEventListener(
        CURRENT_WILD_UPDATED_EVENT,
        load
      );

      window.removeEventListener(
        "storage",
        load
      );

    };

  }, []);


  /* =======================================================
     LOADING
     ======================================================= */

  if (!loaded) {

    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#130e09",
        }}
      />
    );

  }


  /* =======================================================
     EMPTY WILD
     ======================================================= */

  if (!wild) {

    return (

      <main className="empty">

        <section className="empty-paper">

          <span>
            ROAMLAB · WILD PLAN
          </span>

          <h1>
            Nothing on the table yet.
          </h1>

          <p>
            Choose your way in and begin
            building your next Wild.
          </p>

          <button
            onClick={() =>
              router.push("/ways-in")
            }
          >
            START YOUR WILD →
          </button>

        </section>


        <style jsx>{`

          .empty {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 30px;

            background:
              linear-gradient(
                rgba(12, 8, 5, .25),
                rgba(12, 8, 5, .72)
              ),
              url("/ways-in-desk.jpg")
              center / cover fixed;

            color: #34291e;
          }

          .empty-paper {
            width: min(620px, 100%);
            padding: 54px;

            background:
              #d9c9a8;

            box-shadow:
              0 35px 100px rgba(0,0,0,.6);

            transform:
              rotate(-1deg);
          }

          .empty span {
            font:
              800 10px Arial,
              sans-serif;

            letter-spacing:
              .22em;
          }

          .empty h1 {
            margin:
              18px 0 12px;

            font:
              400 46px/1
              Georgia,
              serif;
          }

          .empty p {
            line-height: 1.7;
          }

          .empty button {
            margin-top: 28px;

            padding:
              14px 18px;

            border: 0;

            background:
              #994a27;

            color:
              #fff2dc;

            cursor: pointer;

            font:
              800 10px Arial,
              sans-serif;

            letter-spacing:
              .12em;
          }

        `}</style>

      </main>

    );

  }


  /* =======================================================
     CURRENT WILD DATA
     ======================================================= */

  const adventure =
    wild.plan.adventure;

  const schedule =
    adventure.schedule;

  const destination =
    adventure.destination;

  const intent =
    adventure.intent;

  const route =
    wild.plan.route;

  const conditions =
    wild.plan.conditions;

  const gear =
    wild.plan.prepare?.gear;

  const cost =
    wild.plan.cost;

  const planning =
    wild.plan.planning;


  const items =
    gear?.items ?? [];


  const owned =
    items.filter(
      (item) =>
        item.ownershipStatus ===
        "owned"
    ).length;


  const gap =
    items.filter(
      (item) =>
        [
          "to-buy",
          "borrow",
          "rent",
        ].includes(
          item.ownershipStatus
        )
    ).length;


  const essential =
    items.filter(
      (item) =>
        item.priority ===
        "essential"
    ).length;


  const recommended =
    items.filter(
      (item) =>
        item.priority ===
        "recommended"
    ).length;


  const optional =
    items.filter(
      (item) =>
        item.priority ===
        "optional"
    ).length;


  const issues =
    (
      planning?.issues ??
      []
    ).filter(
      (issue) =>
        issue.status === "open"
    );


  const currency =
    cost?.currency ??
    "USD";


  const projected =
    planning?.projectedWildCost ??
    cost?.estimatedTotal;


  const remaining =
    cost?.remainingBudget ??
    (
      typeof cost?.totalWildBudget ===
        "number" &&
      typeof projected ===
        "number"

        ? cost.totalWildBudget -
          projected

        : undefined
    );


  /* =======================================================
     LABELS
     ======================================================= */

  const dateLine =

    schedule?.startDate &&
    schedule?.endDate

      ? `${dateLabel(
          schedule.startDate
        )} — ${dateLabel(
          schedule.endDate
        )}`

      : schedule?.timingMode ===
        "flexible"

        ? "FLEXIBLE DATES"

      : schedule?.timingMode ===
        "undecided"

        ? "DATES UNDECIDED"

      : "DATES NOT SET";


  const routeLine =
    route

      ? [

          typeof route.distanceKm ===
          "number"

            ? `${Math.round(
                route.distanceKm
              )} KM`

            : "",


          typeof route.estimatedHours ===
          "number"

            ? `${route.estimatedHours.toFixed(
                1
              )} HRS`

            : "",

        ]
          .filter(Boolean)
          .join(" · ") ||

        "ROUTE IN PROGRESS"

      : "ROUTE NOT BUILT";


  const originName =
    intent?.startingFrom?.name ??
    "Starting point not set";


  const destinationName =
    destination?.name ??
    "Choose your destination";


  const people =
    adventure.crew?.people ??
    0;


  /* =======================================================
     CONTEXT QUERY
     ======================================================= */

  function contextQuery() {

    const params =
      new URLSearchParams();


    if (
      adventure.vehicle?.type
    ) {
      params.set(
        "vehicle",
        adventure.vehicle.type
      );
    }


    if (
      adventure.tripStyle
    ) {
      params.set(
        "trip",
        adventure.tripStyle
      );
    }


    if (
      adventure.crew?.type
    ) {
      params.set(
        "crew",
        adventure.crew.type
      );
    }


    if (
      adventure.crew?.people
    ) {
      params.set(
        "people",
        String(
          adventure.crew.people
        )
      );
    }


    if (
      schedule?.durationType
    ) {
      params.set(
        "duration",
        schedule.durationType
      );
    }


    return params.toString();

  }


  /* =======================================================
     PAGE
     ======================================================= */

  return (

    <main className="wild-desk">

      <div className="cinematic-light" />
      <div className="desk-vignette" />


      {/* ===================================================
          GLOBAL NAV
          =================================================== */}

      <header className="wild-nav">

        <button
          className="brand"
          onClick={() =>
            router.push("/")
          }
        >
          ROAMLAB
        </button>


        <nav>

          <button
            onClick={() =>
              router.push(
                "/ways-in"
              )
            }
          >
            EXPLORE
          </button>

          <button
            onClick={() =>
              router.push(
                "/gear"
              )
            }
          >
            GEAR LAB
          </button>

          <span>
            WILD PLAN
          </span>

        </nav>

      </header>



      {/* ===================================================
          DESK WORLD
          =================================================== */}

      <section className="table">


        {/* LANTERN GLOW */}

        <div
          className="lantern"
          aria-hidden="true"
        >
          <div className="lantern-top" />
          <div className="lantern-glass" />
          <div className="lantern-base" />
        </div>



        {/* CURRENT WILD PAPER */}

        <article className="current-wild paper">

          <small className="paper-label">
            CURRENT WILD
          </small>

          <div className="rule" />

          <h1>
            {destinationName}
          </h1>


          <div className="wild-facts">

            <p>
              <span>⌁</span>

              {titleCase(
                adventure.wayIn
              )}

              {" · "}

              {tripLabel(
                adventure.tripStyle
              )}
            </p>


            <p>
              <span>♙</span>

              {people
                ? `${people} ${
                    people === 1
                      ? "Person"
                      : "People"
                  }`
                : "Crew not set"}
            </p>


            <p>
              <span>▣</span>

              {schedule?.days
                ? `${schedule.days} Days · ${
                    schedule.nights ?? 0
                  } Nights`
                : dateLine}
            </p>

          </div>


          <p className="field-note">
            Your Wild is taking shape.
            Keep the plan practical,
            flexible and ready for the
            road.
          </p>

        </article>



        {/* DESTINATION PHOTO */}

        <button
          className="destination-photo polaroid"
          onClick={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        >

          <div className="photo-window destination-image" />

          <span>
            {destinationName}
          </span>

        </button>



        {/* MAIN MAP */}

        <article className="map-sheet">

          <div className="map-fold fold-one" />
          <div className="map-fold fold-two" />

          <div className="map-grid" />

          <div className="topo topo-one" />
          <div className="topo topo-two" />
          <div className="topo topo-three" />


          <div className="map-duration">

            {schedule?.days ? (
              <>
                <strong>
                  {schedule.days} DAYS
                </strong>

                <strong>
                  {schedule.nights ?? 0}
                  {" "}NIGHTS
                </strong>
              </>
            ) : (
              <strong>
                {dateLine}
              </strong>
            )}

          </div>


          <div className="route-path">

            <div className="route-segment a" />
            <div className="route-segment b" />
            <div className="route-segment c" />

          </div>


          <div className="map-point origin">

            <i />

            <small>
              START
            </small>

            <b>
              {originName}
            </b>

          </div>


          <div className="map-point destination">

            <i />

            <small>
              WILD
            </small>

            <b>
              {destinationName}
            </b>

          </div>


          <div className="distance-note">

            {routeLine}

          </div>


          <button
            className="map-edit"
            onClick={() =>
              router.push(
                "/wild-plan/destination"
              )
            }
          >
            EDIT JOURNEY →
          </button>

        </article>



        {/* VEHICLE / WAY IN POLAROID */}

        <article className="vehicle-polaroid polaroid">

          <div className="photo-window vehicle-image" />

          <span>
            Our Ride
          </span>

          <small>
            {vehicleLabel(
              adventure.vehicle?.type
            )}
          </small>

        </article>



        {/* KEYS */}

        <div
          className="keys"
          aria-hidden="true"
        >
          <div className="key-ring" />
          <div className="key-fob">
            <span>R</span>
          </div>
          <div className="metal-key" />
        </div>



        {/* COMPASS */}

        <div
          className="compass"
          aria-hidden="true"
        >
          <div className="compass-inner">
            <span>N</span>
            <i />
          </div>
        </div>



        {/* CONDITIONS NOTE */}

        <button
          className="conditions sticky"
          onClick={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        >

          <div className="sticky-title">

            <span>
              CONDITIONS
            </span>

            <b>
              ☼
            </b>

          </div>


          <div className="condition-line">

            <strong>
              Weather
            </strong>

            <span>
              Check details →
            </span>

          </div>


          <div className="condition-line">

            <strong>
              Terrain
            </strong>

            <span>
              View analysis →
            </span>

          </div>


          {conditions?.weatherSummary ? (

            <p>
              {conditions.weatherSummary}
            </p>

          ) : null}

        </button>



        {/* BUDGET NOTEBOOK */}

        <button
          className="budget-book notebook"
          onClick={() => {

            const query =
              contextQuery();

            router.push(
              query
                ? `/ways-in/drive/budget?${query}`
                : "/ways-in/drive/budget"
            );

          }}
        >

          <span className="book-title">
            BUDGET
          </span>


          <div className="budget-number">

            {cost?.budgetStatus ===
            "unknown"

              ? "NOT SET"

              : money(
                  cost?.totalWildBudget,
                  currency
                )}

          </div>


          <div className="budget-row">

            <span>
              PROJECTED
            </span>

            <b>
              {money(
                projected,
                currency
              )}
            </b>

          </div>


          <div className="budget-row">

            <span>
              REMAINING
            </span>

            <b>
              {money(
                remaining,
                currency
              )}
            </b>

          </div>


          <em>
            EDIT BUDGET →
          </em>

        </button>



        {/* PLAN CHECK NOTEBOOK */}

        <article className="plan-book">

          <div className="binding" />


          <div className="book-page left-page">

            <span className="book-section">
              PLAN CHECK
            </span>


            <ul>

              <li>
                <i className="checked">
                  ✓
                </i>

                Route & access
              </li>


              <li>
                <i
                  className={
                    items.length
                      ? "checked"
                      : ""
                  }
                >
                  {items.length
                    ? "✓"
                    : "□"}
                </i>

                Gear readiness
              </li>


              <li>
                <i
                  className={
                    cost?.totalWildBudget
                      ? "checked"
                      : ""
                  }
                >
                  {cost?.totalWildBudget
                    ? "✓"
                    : "□"}
                </i>

                Budget check
              </li>


              <li>
                <i>
                  □
                </i>

                Weather & terrain
              </li>


              <li>
                <i>
                  □
                </i>

                Potential risks
              </li>


              <li>
                <i>
                  □
                </i>

                Final recommendation
              </li>

            </ul>

          </div>


          <div className="book-page right-page">

            <span className="hand-note">

              {issues.length

                ? `${issues.length} ${
                    issues.length === 1
                      ? "thing needs"
                      : "things need"
                  } attention.`

                : planning

                  ? "Your plan is looking clear."

                  : "Checking your plan..."}

            </span>


            <div className="progress-line">

              <span
                style={{
                  width:
                    items.length
                      ? "58%"
                      : "24%",
                }}
              />

            </div>


            {issues.length ? (

              <div className="issue-note">

                <strong>
                  {issues[0].title}
                </strong>

                <p>
                  {issues[0].explanation}
                </p>

              </div>

            ) : (

              <div className="mountain-sketch">

                <i className="mountain m1" />
                <i className="mountain m2" />
                <i className="mountain m3" />

              </div>

            )}

          </div>


          <div
            className="pen"
            aria-hidden="true"
          />

        </article>



        {/* GEAR SHEET */}

        <article className="gear-sheet">

          <span className="gear-title">
            △ &nbsp; GEAR SYSTEM
          </span>


          <div className="gear-rule" />


          <div className="gear-row">

            <span>
              ☑ &nbsp; Essential
            </span>

            <b>
              {essential}
            </b>

          </div>


          <div className="gear-row">

            <span>
              ☑ &nbsp; Recommended
            </span>

            <b>
              {recommended}
            </b>

          </div>


          <div className="gear-row">

            <span>
              ☑ &nbsp; Optional
            </span>

            <b>
              {optional}
            </b>

          </div>


          <div className="gear-row">

            <span>
              □ &nbsp; Already owned
            </span>

            <b>
              {owned}
            </b>

          </div>


          <div className="gear-gap">

            <span>
              ☑ &nbsp; Gear gap
            </span>

            <b>
              {gap}
            </b>

          </div>


          <button
            onClick={() => {

              const query =
                contextQuery();

              router.push(
                query
                  ? `/ways-in/drive/gear?${query}`
                  : "/ways-in/drive/gear"
              );

            }}
          >
            OPEN GEAR ROOM →
          </button>

        </article>



        {/* PENCIL */}

        <div
          className="pencil"
          aria-hidden="true"
        />


      </section>



      <style jsx>{`

        :global(html) {
          background: #100b07;
        }

        :global(body) {
          margin: 0;
          background: #100b07;
        }

        button {
          font: inherit;
        }


        /* =================================================
           WORLD
           ================================================= */

        .wild-desk {
          position: relative;

          min-height: 100vh;

          overflow-x: hidden;

          color:
            #f2e7d4;

          background:
            linear-gradient(
              rgba(15, 9, 5, .25),
              rgba(10, 6, 4, .46)
            ),
            url("/ways-in-desk.jpg")
            center top / cover fixed;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        .wild-desk::before {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            repeating-linear-gradient(
              90deg,
              transparent 0,
              transparent 118px,
              rgba(255,255,255,.018)
              119px,
              transparent 120px
            );

          mix-blend-mode:
            soft-light;
        }


        .cinematic-light {
          position: absolute;

          left: -180px;
          top: -200px;

          width: 850px;
          height: 850px;

          pointer-events: none;

          background:
            radial-gradient(
              circle,
              rgba(255,172,78,.32),
              rgba(255,133,44,.12) 30%,
              transparent 68%
            );

          filter:
            blur(8px);
        }


        .desk-vignette {
          position: absolute;
          inset: 0;

          pointer-events: none;

          box-shadow:
            inset 0 0 220px
            rgba(0,0,0,.72);
        }


        /* =================================================
           NAV
           ================================================= */

        .wild-nav {
          position: relative;
          z-index: 100;

          height: 86px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          padding:
            0 5vw;

          border-bottom:
            1px solid
            rgba(255,240,218,.11);
        }


        .wild-nav button {
          border: 0;
          background: transparent;

          color:
            rgba(247,236,216,.74);

          cursor: pointer;
        }


        .brand {
          color:
            #fff5e5 !important;

          font-size:
            18px !important;

          font-weight:
            800 !important;

          letter-spacing:
            .22em !important;
        }


        .wild-nav nav {
          display: flex;
          gap: 42px;
          align-items: center;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            .2em;
        }


        .wild-nav nav span {
          color:
            #e1a15f;
        }


        /* =================================================
           DESK
           ================================================= */

        .table {
          position: relative;

          z-index: 5;

          width:
            min(1500px, 96vw);

          height:
            980px;

          margin:
            0 auto;

          transform-origin:
            top center;
        }


        /* =================================================
           PAPER
           ================================================= */

        .paper {
          color:
            #34271c;

          background:
            linear-gradient(
              115deg,
              rgba(255,255,255,.15),
              transparent 40%
            ),
            #d8c3a0;

          box-shadow:
            0 25px 55px
            rgba(0,0,0,.55);
        }


        .paper-label {
          color:
            #7d482d;

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            .2em;
        }


        .rule {
          height: 1px;

          margin:
            14px 0 20px;

          background:
            rgba(70,45,28,.26);
        }


        /* =================================================
           CURRENT WILD
           ================================================= */

        .current-wild {
          position: absolute;

          z-index: 20;

          left: 7%;
          top: 62px;

          width: 290px;

          padding:
            30px 32px 34px;

          transform:
            rotate(-4deg);
        }


        .current-wild h1 {
          margin:
            0 0 24px;

          font:
            400 30px/1.03
            Georgia,
            serif;
        }


        .wild-facts p {
          display: flex;
          gap: 12px;
          align-items: center;

          margin:
            12px 0;

          font:
            400 14px/1.4
            Georgia,
            serif;
        }


        .wild-facts p span {
          width: 20px;

          color:
            #7d482d;
        }


        .field-note {
          margin:
            24px 0 0;

          color:
            #574332;

          font:
            italic 15px/1.55
            Georgia,
            serif;

          transform:
            rotate(-1deg);
        }


        /* =================================================
           MAIN MAP
           ================================================= */

        .map-sheet {
          position: absolute;

          z-index: 10;

          left: 25%;
          top: 100px;

          width: 690px;
          height: 490px;

          overflow: hidden;

          transform:
            rotate(-1.4deg);

          color:
            #2f3529;

          background:
            linear-gradient(
              rgba(205,196,159,.78),
              rgba(194,183,145,.8)
            ),
            url("/destination-brief-v2.jpg")
            center / cover;

          background-blend-mode:
            screen;

          box-shadow:
            0 28px 65px
            rgba(0,0,0,.58);
        }


        .map-sheet::after {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            rgba(214,202,164,.58);
        }


        .map-grid {
          position: absolute;
          z-index: 2;
          inset: 0;

          opacity: .25;

          background-image:
            linear-gradient(
              rgba(72,81,58,.28)
              1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(72,81,58,.28)
              1px,
              transparent 1px
            );

          background-size:
            38px 38px;
        }


        .map-fold {
          position: absolute;
          z-index: 3;

          background:
            rgba(85,68,44,.15);

          box-shadow:
            0 0 18px
            rgba(70,55,35,.13);
        }


        .fold-one {
          top: 0;
          bottom: 0;
          left: 34%;

          width: 1px;
        }


        .fold-two {
          top: 0;
          bottom: 0;
          left: 68%;

          width: 1px;
        }


        .topo {
          position: absolute;
          z-index: 3;

          width: 190px;
          height: 100px;

          border:
            2px solid
            rgba(73,83,57,.19);

          border-radius:
            50%;
        }


        .topo::before,
        .topo::after {
          content: "";

          position: absolute;

          border:
            2px solid
            rgba(73,83,57,.18);

          border-radius:
            50%;
        }


        .topo::before {
          inset: 12px 20px;
        }


        .topo::after {
          inset: 27px 45px;
        }


        .topo-one {
          left: 30px;
          top: 55px;
        }


        .topo-two {
          right: 60px;
          top: 35px;

          transform:
            rotate(18deg);
        }


        .topo-three {
          right: 160px;
          bottom: 35px;

          transform:
            rotate(-12deg);
        }


        .map-duration {
          position: absolute;

          z-index: 8;

          left: 46%;
          top: 100px;

          display: flex;
          flex-direction: column;

          color:
            #27231e;

          transform:
            rotate(-6deg);

          font:
            700 25px/1.05
            "Comic Sans MS",
            cursive;
        }


        .route-path {
          position: absolute;

          z-index: 7;

          left: 150px;
          right: 130px;
          top: 280px;

          height: 100px;
        }


        .route-segment {
          position: absolute;

          height: 4px;

          border-radius:
            999px;

          background:
            #a7442e;

          box-shadow:
            0 1px 0
            rgba(255,255,255,.2);
        }


        .route-segment.a {
          left: 0;
          top: 50px;

          width: 150px;

          transform:
            rotate(-8deg);
        }


        .route-segment.b {
          left: 143px;
          top: 39px;

          width: 150px;

          transform:
            rotate(4deg);
        }


        .route-segment.c {
          left: 286px;
          top: 29px;

          width: 125px;

          transform:
            rotate(-13deg);
        }


        .map-point {
          position: absolute;

          z-index: 9;

          color:
            #34281e;
        }


        .map-point i {
          display: block;

          width: 16px;
          height: 16px;

          margin-bottom: 7px;

          border-radius:
            50%;

          background:
            #a7442e;

          box-shadow:
            0 0 0 4px
            rgba(167,68,46,.14);
        }


        .map-point small {
          display: block;

          color:
            #9b402a;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            .18em;
        }


        .map-point b {
          display: block;

          max-width:
            170px;

          margin-top: 4px;

          font:
            600 17px/1.1
            "Comic Sans MS",
            cursive;
        }


        .origin {
          left: 100px;
          bottom: 62px;
        }


        .destination {
          right: 40px;
          top: 220px;
        }


        .distance-note {
          position: absolute;

          z-index: 9;

          left: 45%;
          bottom: 60px;

          color:
            #43372b;

          transform:
            rotate(-4deg);

          font:
            600 15px
            "Comic Sans MS",
            cursive;
        }


        .map-edit {
          position: absolute;

          z-index: 12;

          right: 25px;
          bottom: 18px;

          border: 0;

          background:
            transparent;

          color:
            #8d452c;

          cursor: pointer;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            .12em;
        }


        /* =================================================
           POLAROIDS
           ================================================= */

        .polaroid {
          border: 0;

          color:
            #382c21;

          background:
            #e4d7bd;

          box-shadow:
            0 22px 50px
            rgba(0,0,0,.58);
        }


        .photo-window {
          width: 100%;

          background-size:
            cover;

          background-position:
            center;
        }


        .destination-photo {
          position: absolute;

          z-index: 30;

          right: 8%;
          top: 48px;

          width: 260px;

          padding:
            12px 12px 23px;

          transform:
            rotate(6deg);

          cursor: pointer;
        }


        .destination-image {
          height: 190px;

          background-image:
            url("/destination-brief-v2.jpg");
        }


        .destination-photo span {
          display: block;

          margin-top: 14px;

          text-align: center;

          font:
            italic 15px/1.2
            Georgia,
            serif;
        }


        .vehicle-polaroid {
          position: absolute;

          z-index: 32;

          left: 3%;
          top: 450px;

          width: 220px;

          padding:
            11px 11px 22px;

          transform:
            rotate(8deg);
        }


        .vehicle-image {
          height: 145px;

          background-image:
            url("/drive-desk.jpg");
        }


        .vehicle-polaroid span {
          display: block;

          margin-top: 12px;

          font:
            italic 16px
            Georgia,
            serif;
        }


        .vehicle-polaroid small {
          display: block;

          margin-top: 5px;

          color:
            #705844;

          font-size:
            9px;

          letter-spacing:
            .12em;
        }


        /* =================================================
           CONDITIONS
           ================================================= */

        .sticky {
          border: 0;

          color:
            #3d301f;

          background:
            #cfb664;

          box-shadow:
            0 18px 42px
            rgba(0,0,0,.5);

          cursor: pointer;
        }


        .conditions {
          position: absolute;

          z-index: 35;

          right: 3%;
          top: 360px;

          width: 270px;

          padding:
            25px 28px;

          transform:
            rotate(2deg);

          text-align: left;
        }


        .sticky-title {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          margin-bottom: 17px;

          color:
            #7f4a31;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            .18em;
        }


        .sticky-title b {
          color:
            #40301f;

          font-size:
            24px;
        }


        .condition-line {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          padding:
            12px 0;

          border-top:
            1px solid
            rgba(60,45,25,.18);
        }


        .condition-line strong {
          font:
            400 20px
            Georgia,
            serif;
        }


        .condition-line span {
          font-size:
            9px;
        }


        .conditions p {
          margin:
            12px 0 0;

          color:
            #59442c;

          font:
            italic 11px/1.5
            Georgia,
            serif;
        }


        /* =================================================
           BUDGET NOTEBOOK
           ================================================= */

        .notebook {
          border: 0;

          color:
            #392c20;

          cursor: pointer;

          background:
            repeating-linear-gradient(
              0deg,
              transparent 0 30px,
              rgba(81,64,43,.13)
              31px
            ),
            #cbb88e;

          box-shadow:
            0 24px 55px
            rgba(0,0,0,.58);
        }


        .budget-book {
          position: absolute;

          z-index: 25;

          left: 4%;
          bottom: 5px;

          width: 340px;
          height: 285px;

          padding:
            30px 34px;

          transform:
            rotate(-2deg);

          text-align: left;
        }


        .book-title {
          color:
            #55412d;

          font:
            700 20px
            "Comic Sans MS",
            cursive;
        }


        .budget-number {
          width: max-content;

          margin:
            22px 0 15px;

          padding:
            10px 18px;

          background:
            #d9bd62;

          transform:
            rotate(-2deg);

          font:
            500 35px
            "Comic Sans MS",
            cursive;

          box-shadow:
            0 7px 15px
            rgba(0,0,0,.12);
        }


        .budget-row {
          display: flex;

          justify-content:
            space-between;

          padding:
            10px 0;

          border-bottom:
            1px solid
            rgba(63,48,32,.2);
        }


        .budget-row span {
          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            .12em;
        }


        .budget-row b {
          font:
            400 12px
            Georgia,
            serif;
        }


        .budget-book em {
          display: block;

          margin-top:
            15px;

          color:
            #8e482c;

          font-size:
            8px;

          font-style:
            normal;

          font-weight:
            900;

          letter-spacing:
            .12em;
        }


        /* =================================================
           PLAN BOOK
           ================================================= */

        .plan-book {
          position: absolute;

          z-index: 28;

          left: 31%;
          bottom: -35px;

          width: 610px;
          height: 300px;

          display: grid;

          grid-template-columns:
            1fr 1fr;

          color:
            #3c3025;

          background:
            #d5c5a7;

          box-shadow:
            0 30px 70px
            rgba(0,0,0,.65);

          transform:
            rotate(1deg);

          border-radius:
            7px 10px 10px 7px;
        }


        .binding {
          position: absolute;

          z-index: 5;

          top: 0;
          bottom: 0;
          left: 50%;

          width: 2px;

          background:
            rgba(65,48,32,.2);

          box-shadow:
            0 0 12px
            rgba(0,0,0,.25);
        }


        .book-page {
          position: relative;

          padding:
            35px 38px;

          background:
            repeating-linear-gradient(
              0deg,
              transparent 0 27px,
              rgba(71,62,48,.11)
              28px
            );
        }


        .book-section {
          color:
            #5c4633;

          font:
            700 17px
            "Comic Sans MS",
            cursive;
        }


        .left-page ul {
          margin:
            24px 0 0;

          padding: 0;

          list-style: none;
        }


        .left-page li {
          display: flex;

          gap: 11px;

          align-items: center;

          margin:
            13px 0;

          font:
            400 13px
            "Comic Sans MS",
            cursive;
        }


        .left-page li i {
          width: 16px;

          font-style:
            normal;
        }


        .checked {
          color:
            #315340;
        }


        .hand-note {
          display: block;

          margin-top:
            5px;

          transform:
            rotate(-2deg);

          font:
            italic 15px/1.4
            Georgia,
            serif;
        }


        .progress-line {
          width: 200px;
          height: 12px;

          margin-top:
            24px;

          overflow: hidden;

          border:
            1px solid
            #625240;

          border-radius:
            999px;
        }


        .progress-line span {
          display: block;

          height: 100%;

          background:
            repeating-linear-gradient(
              -45deg,
              #617d7a 0 5px,
              #839795 5px 8px
            );
        }


        .issue-note {
          margin-top:
            26px;

          padding:
            16px;

          background:
            rgba(181,117,74,.13);
        }


        .issue-note strong {
          font:
            400 15px
            Georgia,
            serif;
        }


        .issue-note p {
          margin:
            8px 0 0;

          font-size:
            10px;

          line-height:
            1.5;
        }


        .mountain-sketch {
          position: absolute;

          left: 50px;
          right: 50px;
          bottom: 45px;

          height: 80px;

          opacity: .32;
        }


        .mountain {
          position: absolute;

          bottom: 0;

          width: 80px;
          height: 80px;

          border-left:
            2px solid #514536;

          border-top:
            2px solid #514536;

          transform:
            rotate(45deg)
            skew(-8deg,-8deg);
        }


        .m1 {
          left: 20px;
        }


        .m2 {
          left: 85px;

          width: 100px;
          height: 100px;
        }


        .m3 {
          right: 5px;

          width: 65px;
          height: 65px;
        }


        .pen {
          position: absolute;

          z-index: 20;

          right: 18px;
          bottom: -28px;

          width: 9px;
          height: 210px;

          border-radius:
            6px;

          background:
            linear-gradient(
              90deg,
              #171512,
              #4b4339,
              #171512
            );

          transform:
            rotate(19deg);

          box-shadow:
            4px 6px 10px
            rgba(0,0,0,.35);
        }


        /* =================================================
           GEAR SHEET
           ================================================= */

        .gear-sheet {
          position: absolute;

          z-index: 33;

          right: 2%;
          bottom: -10px;

          width: 280px;

          padding:
            28px 28px 30px;

          color:
            #3a3025;

          background:
            linear-gradient(
              rgba(255,255,255,.12),
              transparent
            ),
            #d9ccb1;

          box-shadow:
            0 24px 55px
            rgba(0,0,0,.58);

          transform:
            rotate(3deg);
        }


        .gear-sheet::before {
          content: "";

          position: absolute;

          top: -4px;
          left: 0;
          right: 0;

          height: 10px;

          background:
            repeating-linear-gradient(
              135deg,
              transparent 0 7px,
              #d9ccb1 7px 14px
            );
        }


        .gear-title {
          font:
            700 15px
            Georgia,
            serif;

          letter-spacing:
            .12em;
        }


        .gear-rule {
          height: 1px;

          margin:
            19px 0 10px;

          background:
            rgba(57,47,36,.25);
        }


        .gear-row,
        .gear-gap {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          padding:
            10px 0;

          border-bottom:
            1px solid
            rgba(57,47,36,.14);

          font:
            400 13px
            Georgia,
            serif;
        }


        .gear-row b,
        .gear-gap b {
          font-size:
            19px;

          font-weight:
            400;
        }


        .gear-gap {
          margin-top:
            5px;
        }


        .gear-gap b {
          padding:
            2px 8px;

          background:
            rgba(167,68,46,.18);

          color:
            #8f3e2a;
        }


        .gear-sheet button {
          width: 100%;

          margin-top:
            18px;

          padding:
            11px;

          border:
            1px solid
            #584535;

          background:
            transparent;

          color:
            #3a3025;

          cursor: pointer;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            .12em;
        }


        /* =================================================
           OBJECTS
           ================================================= */

        .keys {
          position: absolute;

          z-index: 40;

          left: 1%;
          top: 380px;

          width: 90px;
          height: 150px;

          transform:
            rotate(10deg);
        }


        .key-ring {
          position: absolute;

          left: 25px;
          top: 0;

          width: 42px;
          height: 42px;

          border:
            4px solid #8e8577;

          border-radius:
            50%;
        }


        .key-fob {
          position: absolute;

          left: 22px;
          top: 42px;

          width: 46px;
          height: 70px;

          display: grid;
          place-items: center;

          border-radius:
            14px 14px 19px 19px;

          color:
            #aaa;

          background:
            linear-gradient(
              120deg,
              #292723,
              #0f0f0e
            );

          box-shadow:
            8px 10px 18px
            rgba(0,0,0,.5);
        }


        .key-fob span {
          display: grid;
          place-items: center;

          width: 22px;
          height: 22px;

          border:
            1px solid #777;

          border-radius:
            50%;

          font-size:
            10px;
        }


        .metal-key {
          position: absolute;

          left: 55px;
          top: 84px;

          width: 13px;
          height: 68px;

          background:
            linear-gradient(
              90deg,
              #817c71,
              #c1bbaa,
              #6d685f
            );

          transform:
            rotate(-18deg);
        }


        .compass {
          position: absolute;

          z-index: 42;

          right: 5%;
          top: 250px;

          width: 80px;
          height: 80px;

          display: grid;
          place-items: center;

          border:
            5px solid #25211b;

          border-radius:
            50%;

          background:
            radial-gradient(
              circle,
              #c9b889,
              #6c5d45 70%,
              #1d1a16 72%
            );

          box-shadow:
            8px 14px 25px
            rgba(0,0,0,.5);
        }


        .compass-inner {
          position: relative;

          width: 56px;
          height: 56px;

          border:
            1px solid
            #332c23;

          border-radius:
            50%;
        }


        .compass-inner span {
          position: absolute;

          top: 4px;
          left: 50%;

          transform:
            translateX(-50%);

          font-size:
            9px;

          font-weight:
            900;
        }


        .compass-inner i {
          position: absolute;

          left: 25px;
          top: 13px;

          width: 6px;
          height: 33px;

          background:
            linear-gradient(
              #9d3f2b 0 50%,
              #2e332b 50%
            );

          clip-path:
            polygon(
              50% 0,
              100% 50%,
              50% 100%,
              0 50%
            );

          transform:
            rotate(24deg);
        }


        .pencil {
          position: absolute;

          z-index: 22;

          left: 25%;
          bottom: 15px;

          width: 220px;
          height: 9px;

          background:
            linear-gradient(
              #c28d42,
              #e1b665,
              #a87534
            );

          transform:
            rotate(-16deg);

          box-shadow:
            3px 5px 8px
            rgba(0,0,0,.35);
        }


        .pencil::after {
          content: "";

          position: absolute;

          right: -18px;
          top: 0;

          border-top:
            4.5px solid transparent;

          border-bottom:
            4.5px solid transparent;

          border-left:
            18px solid #d6b98d;
        }


        /* =================================================
           LANTERN
           ================================================= */

        .lantern {
          position: absolute;

          z-index: 50;

          left: -55px;
          top: -55px;

          width: 150px;
          height: 230px;

          pointer-events: none;
        }


        .lantern-glass {
          position: absolute;

          left: 36px;
          top: 55px;

          width: 76px;
          height: 105px;

          border:
            6px solid
            #33281c;

          border-radius:
            30px 30px 20px 20px;

          background:
            radial-gradient(
              circle at 50% 65%,
              #ffd083,
              #d67728 30%,
              rgba(89,49,19,.25)
              65%
            );

          box-shadow:
            0 0 85px
            rgba(255,151,58,.7);
        }


        .lantern-top {
          position: absolute;

          left: 45px;
          top: 34px;

          width: 60px;
          height: 28px;

          border-radius:
            50% 50% 0 0;

          background:
            #2a2219;
        }


        .lantern-base {
          position: absolute;

          left: 29px;
          top: 160px;

          width: 90px;
          height: 34px;

          border-radius:
            5px 5px 18px 18px;

          background:
            #292119;
        }


        /* =================================================
           RESPONSIVE
           ================================================= */

        @media (
          max-width: 1180px
        ) {

          .table {
            width: 1180px;

            transform:
              scale(.82);

            margin-top:
              -20px;

            margin-left:
              50%;

            left:
              -590px;

            margin-bottom:
              -160px;
          }

        }


        @media (
          max-width: 900px
        ) {

          .wild-nav {
            padding:
              0 24px;
          }


          .wild-nav nav {
            gap: 20px;
          }


          .table {
            transform:
              scale(.68);

            margin-bottom:
              -300px;
          }

        }


        @media (
          max-width: 680px
        ) {

          .wild-nav {
            height: 68px;
          }


          .brand {
            font-size:
              14px !important;
          }


          .wild-nav nav button {
            display: none;
          }


          .wild-nav nav {
            font-size:
              8px;
          }


          .table {
            transform:
              scale(.52);

            margin-top:
              -80px;

            margin-bottom:
              -440px;
          }

        }

      `}</style>

    </main>

  );

}
