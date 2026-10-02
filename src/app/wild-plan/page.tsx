"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Wild } from "@/types/wild";
import {
  CURRENT_WILD_UPDATED_EVENT,
  getCurrentWild,
} from "@/lib/wildStore";

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

  const date = new Date(
    `${value}T12:00:00`
  );

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
  const labels: Record<
    string,
    string
  > = {
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
    : "Not set";
}

function tripLabel(value?: string) {
  const labels: Record<
    string,
    string
  > = {
    weekend: "Weekend Escape",
    "road-trip": "Road Trip",
    basecamp: "Basecamp",
    remote: "Remote / Off-Grid",
  };

  return value
    ? labels[value] ?? titleCase(value)
    : "Not set";
}

export default function WildPlanPage() {
  const router = useRouter();

  const [wild, setWild] =
    useState<Wild | null>(null);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const load = () => {
      setWild(getCurrentWild());
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

  if (!loaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#100d09",
        }}
      />
    );
  }

  if (!wild) {
    return (
      <main className="empty">
        <section>
          <p>
            ROAMLAB · WILD PLAN
          </p>

          <h1>
            No Wild on the table yet.
          </h1>

          <span>
            Choose a way in and
            RoamLab will begin building
            one shared plan around your
            journey.
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

        <style jsx>{`
          .empty {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 30px;
            background:
              linear-gradient(
                135deg,
                #2b2117,
                #100d09
              );
            color: #34291e;
          }

          section {
            width: min(620px, 100%);
            padding: 54px;
            background: #d8c7a5;
            box-shadow:
              0 35px 90px
              rgba(0, 0, 0, 0.53);
            transform: rotate(-0.7deg);
          }

          p {
            font: 800 10px sans-serif;
            letter-spacing: 0.22em;
          }

          h1 {
            font: 400 44px
              Georgia,
              serif;
            margin: 18px 0;
          }

          span {
            line-height: 1.7;
          }

          button {
            display: block;
            margin-top: 30px;
            border: 0;
            padding: 14px 18px;
            background: #9b4e25;
            color: #fff4df;
            font: 800 10px sans-serif;
            letter-spacing: 0.12em;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

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

  const readiness =
    wild.plan.readiness;

  const items =
    gear?.items ?? [];

  const owned =
    items.filter(
      (item) =>
        item.ownershipStatus ===
        "owned"
    ).length;

  const gap =
    items.filter((item) =>
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
      planning?.issues ?? []
    ).filter(
      (issue) =>
        issue.status === "open"
    );

  const currency =
    cost?.currency ?? "USD";

  const projected =
    planning?.projectedWildCost ??
    cost?.estimatedTotal;

  const remaining =
    cost?.remainingBudget ??
    (
      typeof cost?.totalWildBudget ===
        "number" &&
      typeof projected === "number"
        ? cost.totalWildBudget -
          projected
        : undefined
    );

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

  const routeLine = route
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

  function openGear() {
    const query =
      contextQuery();

    router.push(
      query
        ? `/ways-in/drive/gear?${query}`
        : "/ways-in/drive/gear"
    );
  }

  function openBudget() {
    const query =
      contextQuery();

    router.push(
      query
        ? `/ways-in/drive/budget?${query}`
        : "/ways-in/drive/budget"
    );
  }

  return (
    <main className="desk">

      <div className="grain" />

      {/* =========================
          HEADER
         ========================= */}

      <header>

        <button
          type="button"
          className="brand"
          onClick={() =>
            router.push("/")
          }
        >
          ROAMLAB
        </button>

        <nav>

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

          <span>
            YOUR WILD PLAN
          </span>

        </nav>

      </header>


      {/* =========================
          HERO
         ========================= */}

      <section className="hero">

        <div className="stamp">
          CURRENT WILD
        </div>

        <p>
          FIELD PLAN ·{" "}
          {wild.status.toUpperCase()}
        </p>

        <h1>
          {destination?.name ||
            wild.title ||
            "My Wild"}
        </h1>

        <strong>
          {dateLine}
        </strong>

        <div className="meta">

          <span>
            {titleCase(
              adventure.wayIn
            )}
          </span>

          <i>•</i>

          <span>
            {tripLabel(
              adventure.tripStyle
            )}
          </span>

          <i>•</i>

          <span>
            {adventure.crew?.type
              ? `${titleCase(
                  adventure.crew.type
                )} · ${
                  adventure.crew.people
                }`
              : "Crew not set"}
          </span>

          {schedule?.days ? (
            <>
              <i>•</i>

              <span>
                {schedule.days} DAYS ·{" "}
                {schedule.nights ?? 0}{" "}
                NIGHTS
              </span>
            </>
          ) : null}

        </div>

      </section>


      {/* =========================
          DESK WORKSPACE
         ========================= */}

      <section className="workspace">


        {/* JOURNEY MAP */}

        <article className="map paper">

          <label>
            01 · JOURNEY
          </label>

          <div className="mapTexture" />

          <div className="thread" />

          <span className="pin start">
            START
          </span>

          <span className="pin wild">
            WILD
          </span>

          <div className="mapCopy">

            <small>
              DESTINATION
            </small>

            <h2>
              {destination?.name ||
                "Choose your destination"}
            </h2>

            <p>
              {destination?.region ||
              destination?.country
                ? [
                    destination.region,
                    destination.country,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Your destination anchors the entire Wild."}
            </p>

          </div>


          <div className="mapFoot">

            <div>

              <small>
                STARTING FROM
              </small>

              <b>
                {intent
                  ?.startingFrom
                  ?.name ||
                  "Not set"}
              </b>

            </div>


            <div>

              <small>
                ROUTE
              </small>

              <b>
                {routeLine}
              </b>

            </div>


            <button
              type="button"
              onClick={() =>
                router.push(
                  "/wild-plan/destination"
                )
              }
            >
              EDIT DESTINATION →
            </button>

          </div>

        </article>


        {/* POLAROID */}

        <aside className="polaroid">

          <div className="photo">

            <span />

            <i />

            <b />

          </div>

          <small>
            WAY IN
          </small>

          <h3>
            {titleCase(
              adventure.wayIn
            )}
          </h3>

          <p>
            {vehicleLabel(
              adventure.vehicle?.type
            )}
          </p>

        </aside>


        {/* CONDITIONS NOTE */}

        <button
          type="button"
          className="weather note"
          onClick={() =>
            router.push(
              "/wild-plan/destination"
            )
          }
        >

          <small>
            CONDITIONS
          </small>

          <h3>
            {conditions
              ?.weatherSummary ||
              "Weather & terrain"}
          </h3>

          <p>
            {conditions
              ? [
                  conditions
                    .expectedMinTempC !==
                  undefined
                    ? `${conditions.expectedMinTempC}°C LOW`
                    : "",

                  conditions
                    .expectedMaxTempC !==
                  undefined
                    ? `${conditions.expectedMaxTempC}°C HIGH`
                    : "",

                  conditions.terrain
                    ?.slice(0, 2)
                    .join(" · ") ||
                    "",
                ]
                  .filter(Boolean)
                  .join(" · ") ||
                "Conditions added."
              : "Destination context and live intelligence."}
          </p>

        </button>


        {/* ROUTE */}

        <button
          type="button"
          className="route paper note"
          onClick={() =>
            router.push(
              "/wild-plan/route"
            )
          }
        >

          <small>
            02 · ROUTE & ACCESS
          </small>

          <h3>
            {route
              ? "Route on file"
              : "Build the way there"}
          </h3>

          <p>
            {routeLine}
          </p>

          <em>
            {route
              ? "EDIT ROUTE →"
              : "BUILD ROUTE →"}
          </em>

        </button>


        {/* GEAR */}

        <article className="gear paper">

          <label>
            03 · PREPARE
          </label>


          <div className="gearHead">

            <div>

              <small>
                GEAR SYSTEM
              </small>

              <h2>
                {items.length
                  ? `${items.length} gear items`
                  : "Build your field system"}
              </h2>

            </div>


            <button
              type="button"
              onClick={openGear}
            >
              {items.length
                ? "OPEN GEAR ROOM →"
                : "BUILD GEAR SYSTEM →"}
            </button>

          </div>


          <div className="gearGrid">

            <div>
              <span>
                ESSENTIAL
              </span>
              <b>{essential}</b>
            </div>

            <div>
              <span>
                RECOMMENDED
              </span>
              <b>{recommended}</b>
            </div>

            <div>
              <span>
                OPTIONAL
              </span>
              <b>{optional}</b>
            </div>

            <div>
              <span>
                ALREADY OWNED
              </span>
              <b>{owned}</b>
            </div>

            <div>
              <span>
                GEAR GAP
              </span>
              <b>{gap}</b>
            </div>

          </div>


          <p className="caption">
            Owned gear stays out of
            new-spend pressure. Buy,
            borrow and rent items
            remain part of the gear
            gap.
          </p>

        </article>


        {/* BUDGET */}

        <button
          type="button"
          className="budget note"
          onClick={openBudget}
        >

          <small>
            WILD BUDGET
          </small>

          <h3>
            {cost?.budgetStatus ===
            "unknown"
              ? "NOT SET YET"
              : money(
                  cost
                    ?.totalWildBudget,
                  currency
                )}
          </h3>


          <div>

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


          <div>

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


        {/* PLAN CHECK */}

        <article className="check paper">

          <label>
            04 · PLAN CHECK
          </label>

          <h2>
            {issues.length
              ? `${issues.length} ${
                  issues.length === 1
                    ? "thing needs"
                    : "things need"
                } attention.`
              : planning
              ? "No open planning issues."
              : "Plan check is waiting for more systems."}
          </h2>


          {issues.length ? (

            <div className="issues">

              {issues
                .slice(0, 3)
                .map((issue) => (

                  <div
                    className="issue"
                    key={issue.id}
                  >

                    <small>
                      {issue.severity.toUpperCase()}
                    </small>

                    <b>
                      {issue.title}
                    </b>

                    <p>
                      {issue.explanation}
                    </p>

                  </div>

                ))}

            </div>

          ) : (

            <p className="caption">
              RoamLab can compare
              budget, gear, crew,
              duration, destination,
              logistics and safety
              without changing your
              decisions for you.
            </p>

          )}

        </article>


        {/* READINESS */}

        <article className="readiness">

          <div>

            <small>
              05 · DEPARTURE READINESS
            </small>

            <h2>
              {readiness
                ? readiness
                    .overallPercent >=
                  100
                  ? "Ready to go wild."
                  : "Keep preparing."
                : "Plan in progress."}
            </h2>

            <p>
              Readiness combines the
              systems that matter
              before departure — not
              just the adventure
              setup.
            </p>

          </div>


          <div className="areas">

            {(
              [
                [
                  "ROUTE",
                  readiness?.route,
                ],
                [
                  "GEAR",
                  readiness?.gear,
                ],
                [
                  "SAFETY",
                  readiness?.safety,
                ],
                [
                  "KNOWLEDGE",
                  readiness
                    ?.knowledge,
                ],
                [
                  "LOGISTICS",
                  readiness
                    ?.logistics,
                ],
                [
                  "BUDGET",
                  readiness?.budget,
                ],
              ] as const
            ).map(
              ([label, area]) => (

                <div key={label}>

                  <span>
                    {label}
                  </span>

                  <b>
                    {area
                      ? `${area.percent}%`
                      : "—"}
                  </b>

                  <small>
                    {area
                      ? titleCase(
                          area.status
                        )
                      : "Not checked"}
                  </small>

                </div>

              )
            )}

          </div>


          <div className="score">

            <b>
              {readiness
                ? readiness
                    .overallPercent
                : "—"}
            </b>

            <span>
              {readiness
                ? "READY %"
                : "NOT CALCULATED"}
            </span>

          </div>

        </article>

      </section>


      {/* =========================
          FOOTER
         ========================= */}

      <footer>

        <span>
          PLAN IT.
        </span>

        <i />

        <span>
          GO WILD.
        </span>

        <i />

        <span>
          SHOW IT.
        </span>

      </footer>


      <style jsx>{`

        :global(body) {
          margin: 0;
          background: #100d09;
        }


        button {
          font: inherit;
        }


        .desk {
          position: relative;
          min-height: 100vh;
          overflow: hidden;

          padding:
            0 44px 58px;

          color: #eee4d0;

          background:
            radial-gradient(
              circle at 16% 9%,
              rgba(
                210,
                151,
                83,
                0.12
              ),
              transparent 25%
            ),
            radial-gradient(
              circle at 82% 26%,
              rgba(
                111,
                62,
                47,
                0.14
              ),
              transparent 30%
            ),
            repeating-linear-gradient(
              90deg,
              rgba(
                255,
                255,
                255,
                0.008
              )
              0 1px,
              transparent
              1px 84px
            ),
            linear-gradient(
              110deg,
              #2a1d13,
              #1b140f 46%,
              #100d09
            );
        }


        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;

          opacity: 0.2;

          background-image:
            radial-gradient(
              rgba(
                255,
                255,
                255,
                0.06
              )
              0.6px,
              transparent 0.7px
            ),
            radial-gradient(
              rgba(
                0,
                0,
                0,
                0.2
              )
              0.6px,
              transparent 0.7px
            );

          background-size:
            8px 8px;

          background-position:
            0 0,
            5px 5px;
        }


        header {
          position: relative;
          z-index: 20;

          height: 68px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          border-bottom:
            1px solid
            rgba(
              235,
              215,
              180,
              0.14
            );
        }


        header button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }


        .brand {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }


        nav {
          display: flex;
          align-items: center;
          gap: 26px;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }


        nav button {
          color:
            rgba(
              238,
              228,
              208,
              0.6
            );
        }


        nav button:hover {
          color: #ffffff;
        }


        nav span {
          color: #c78a50;
        }


        .hero {
          position: relative;
          z-index: 3;

          width:
            min(
              1160px,
              100%
            );

          margin:
            44px auto 28px;

          text-align: center;
        }


        .hero > p {
          margin:
            0 0 12px;

          color: #c88e55;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.25em;
        }


        .hero h1 {
          max-width: 900px;

          margin: 0 auto;

          font:
            400
            clamp(
              42px,
              5.5vw,
              74px
            ) /
            0.98
            Georgia,
            serif;

          letter-spacing:
            -0.035em;
        }


        .hero > strong {
          display: block;

          margin-top: 18px;

          color: #d8c4a2;

          font:
            400 14px
            Georgia,
            serif;

          letter-spacing: 0.08em;
        }


        .stamp {
          position: absolute;

          right: 3%;
          top: 22px;

          padding:
            7px 10px;

          transform:
            rotate(5deg);

          border:
            2px solid
            rgba(
              181,
              91,
              49,
              0.58
            );

          color:
            rgba(
              199,
              105,
              60,
              0.75
            );

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }


        .meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 9px;

          margin-top: 15px;

          color:
            rgba(
              238,
              228,
              208,
              0.48
            );

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }


        .meta i {
          color: #a96137;
          font-style: normal;
        }


        .workspace {
          position: relative;
          z-index: 3;

          width:
            min(
              1180px,
              100%
            );

          min-height: 1540px;

          margin: auto;
        }


        .paper {
          color: #3a3025;

          background:
            linear-gradient(
              rgba(
                255,
                255,
                255,
                0.12
              ),
              rgba(
                0,
                0,
                0,
                0.025
              )
            ),
            #d7c7a7;

          box-shadow:
            0 20px 50px
            rgba(
              0,
              0,
              0,
              0.38
            );
        }


        .paper > label,
        .note > small,
        .readiness
        > div:first-child
        > small {
          color: #8b5739;

          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }


        /* JOURNEY MAP */

        .map {
          position: absolute;

          left: 4%;
          top: 20px;

          width: 68%;
          height: 465px;

          padding: 28px;

          transform:
            rotate(-1.2deg);

          overflow: hidden;
        }


        .mapTexture {
          position: absolute;
          inset: 0;

          opacity: 0.26;

          background-image:
            linear-gradient(
              rgba(
                83,
                76,
                71,
                0.22
              )
              1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(
                83,
                76,
                71,
                0.22
              )
              1px,
              transparent 1px
            ),
            radial-gradient(
              ellipse at 30% 45%,
              transparent
              0 18%,
              rgba(
                85,
                94,
                71,
                0.35
              )
              18.3%
              18.7%,
              transparent
              19% 25%,
              rgba(
                85,
                94,
                71,
                0.28
              )
              25.3%
              25.7%,
              transparent
              26%
            );

          background-size:
            34px 34px,
            34px 34px,
            430px 280px;
        }


        .thread {
          position: absolute;

          width: 52%;
          height: 105px;

          left: 22%;
          top: 205px;

          border-top:
            3px dashed
            rgba(
              147,
              72,
              39,
              0.72
            );

          border-radius: 50%;

          transform:
            rotate(-7deg);
        }


        .pin {
          position: absolute;
          z-index: 2;

          padding-top: 19px;

          color: #70432d;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }


        .pin::before {
          content: "";

          position: absolute;

          top: 0;
          left: 50%;

          width: 11px;
          height: 11px;

          transform:
            translateX(-50%)
            rotate(45deg);

          background: #a64f2b;
        }


        .start {
          left: 19%;
          top: 238px;
        }


        .wild {
          right: 20%;
          top: 184px;
        }


        .mapCopy {
          position: relative;
          z-index: 3;

          width: 55%;

          margin-top: 34px;

          padding:
            22px 24px;

          background:
            rgba(
              220,
              205,
              172,
              0.82
            );

          border-left:
            3px solid
            #9d5431;
        }


        .mapCopy small,
        .gearHead small {
          color: #875237;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }


        .mapCopy h2,
        .gear h2,
        .check h2,
        .readiness h2 {
          margin:
            8px 0 0;

          font:
            400 29px /
            1.05
            Georgia,
            serif;
        }


        .mapCopy p {
          color:
            rgba(
              58,
              48,
              37,
              0.66
            );

          font-size: 11px;
          line-height: 1.55;
        }


        .mapFoot {
          position: absolute;
          z-index: 3;

          left: 28px;
          right: 28px;
          bottom: 25px;

          display: grid;

          grid-template-columns:
            1fr 1fr auto;

          gap: 20px;

          align-items: end;

          border-top:
            1px solid
            rgba(
              58,
              48,
              37,
              0.24
            );

          padding-top: 14px;
        }


        .mapFoot small {
          display: block;

          margin-bottom: 5px;

          color:
            rgba(
              58,
              48,
              37,
              0.5
            );

          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }


        .mapFoot b {
          font:
            400 13px
            Georgia,
            serif;
        }


        .mapFoot button,
        .gearHead button {
          border: 0;
          background: transparent;

          color: #8c4828;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;

          cursor: pointer;
        }


        /* POLAROID */

        .polaroid {
          position: absolute;

          right: 3%;
          top: 65px;

          z-index: 5;

          width: 245px;

          padding:
            13px
            13px
            25px;

          transform:
            rotate(5.5deg);

          color: #3c3024;
          background: #e1d6bf;

          box-shadow:
            0 22px 45px
            rgba(
              0,
              0,
              0,
              0.44
            );
        }


        .photo {
          position: relative;

          height: 205px;

          overflow: hidden;

          background:
            linear-gradient(
              #b88c68
              0 45%,
              #6f765b
              45%
            );
        }


        .photo span,
        .photo i {
          position: absolute;

          bottom: -60px;

          width: 260px;
          height: 190px;

          transform:
            rotate(45deg);

          background: #4e5645;
        }


        .photo span {
          left: -70px;
        }


        .photo i {
          right: -110px;

          background: #3f4739;
        }


        .photo b {
          position: absolute;

          width: 52px;
          height: 52px;

          right: 30px;
          top: 30px;

          border-radius: 50%;

          background:
            rgba(
              238,
              194,
              121,
              0.72
            );

          box-shadow:
            0 0 40px
            rgba(
              238,
              194,
              121,
              0.45
            );
        }


        .polaroid small {
          display: block;

          margin-top: 18px;

          color: #995534;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }


        .polaroid h3 {
          margin:
            5px 0;

          font:
            400 24px
            Georgia,
            serif;
        }


        .polaroid p {
          margin: 0;

          color:
            rgba(
              60,
              48,
              36,
              0.58
            );

          font-size: 10px;
        }


        /* NOTES */

        .note {
          border: 0;

          text-align: left;

          cursor: pointer;

          transition:
            transform
            180ms ease;
        }


        .note:hover {
          transform:
            translateY(-3px)
            rotate(0deg);
        }


        .note h3 {
          margin:
            12px 0 0;

          font:
            400 22px
            Georgia,
            serif;
        }


        .note p {
          font-size: 10px;
          line-height: 1.55;
        }


        .note em {
          display: block;

          margin-top: 18px;

          color: #8d4929;

          font-size: 8px;
          font-style: normal;
          font-weight: 900;
          letter-spacing: 0.1em;
        }


        .weather {
          position: absolute;

          right: 7%;
          top: 420px;

          z-index: 6;

          width: 260px;
          min-height: 145px;

          padding: 23px;

          transform:
            rotate(2.3deg);

          color: #443522;

          background: #c9b36f;

          box-shadow:
            0 16px 35px
            rgba(
              0,
              0,
              0,
              0.38
            );
        }


        .route {
          position: absolute;

          left: 8%;
          top: 520px;

          width: 300px;
          min-height: 145px;

          padding: 24px;

          transform:
            rotate(1.5deg);
        }


        /* GEAR */

        .gear {
          position: absolute;

          left: 31%;
          top: 590px;

          z-index: 4;

          width: 59%;
          min-height: 355px;

          padding:
            30px 34px;

          transform:
            rotate(-0.7deg);
        }


        .gearHead {
          display: flex;

          align-items: end;
          justify-content:
            space-between;

          gap: 25px;

          margin-top: 22px;

          padding-bottom: 20px;

          border-bottom:
            1px solid
            rgba(
              58,
              48,
              37,
              0.25
            );
        }


        .gearGrid {
          display: grid;

          grid-template-columns:
            repeat(
              5,
              1fr
            );

          margin-top: 26px;

          border-top:
            1px solid
            rgba(
              58,
              48,
              37,
              0.18
            );

          border-bottom:
            1px solid
            rgba(
              58,
              48,
              37,
              0.18
            );
        }


        .gearGrid div {
          padding:
            18px 10px;

          border-right:
            1px solid
            rgba(
              58,
              48,
              37,
              0.15
            );

          text-align: center;
        }


        .gearGrid div:last-child {
          border-right: 0;
        }


        .gearGrid span {
          display: block;

          min-height: 22px;

          color:
            rgba(
              58,
              48,
              37,
              0.54
            );

          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }


        .gearGrid b {
          display: block;

          margin-top: 7px;

          font:
            400 29px
            Georgia,
            serif;
        }


        .caption {
          margin-top: 22px;

          color:
            rgba(
              58,
              48,
              37,
              0.58
            );

          font-size: 10px;
          line-height: 1.65;
        }


        /* BUDGET */

        .budget {
          position: absolute;

          left: 5%;
          top: 820px;

          z-index: 7;

          width: 250px;

          padding: 26px;

          transform:
            rotate(-3deg);

          color: #45351f;

          background: #d1b967;

          box-shadow:
            0 18px 40px
            rgba(
              0,
              0,
              0,
              0.38
            );
        }


        .budget > div {
          display: flex;

          justify-content:
            space-between;

          gap: 15px;

          margin-top: 17px;

          padding-top: 10px;

          border-top:
            1px solid
            rgba(
              69,
              53,
              31,
              0.2
            );
        }


        .budget span {
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }


        .budget b {
          font:
            400 13px
            Georgia,
            serif;
        }


        /* PLAN CHECK */

        .check {
          position: absolute;

          right: 5%;
          top: 1000px;

          width: 58%;
          min-height: 300px;

          padding:
            30px 34px;

          transform:
            rotate(1deg);
        }


        .check h2 {
          margin-top: 18px;
        }


        .issues {
          margin-top: 24px;
        }


        .issue {
          display: grid;

          grid-template-columns:
            78px 1fr;

          gap:
            5px 14px;

          padding:
            13px 0;

          border-top:
            1px solid
            rgba(
              58,
              48,
              37,
              0.18
            );
        }


        .issue small {
          grid-row:
            1 / span 2;

          color: #9d4d2a;

          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }


        .issue b {
          font:
            400 14px
            Georgia,
            serif;
        }


        .issue p {
          margin: 0;

          color:
            rgba(
              58,
              48,
              37,
              0.62
            );

          font-size: 10px;
          line-height: 1.55;
        }


        /* READINESS */

        .readiness {
          position: absolute;

          left: 4%;
          right: 4%;
          top: 1325px;

          min-height: 230px;

          display: grid;

          grid-template-columns:
            1.5fr
            2.3fr
            0.7fr;

          gap: 34px;

          align-items: center;

          padding:
            34px 38px;

          border:
            1px solid
            rgba(
              220,
              196,
              157,
              0.2
            );

          color: #e7d9bf;

          background:
            rgba(
              20,
              17,
              13,
              0.74
            );

          box-shadow:
            0 22px 55px
            rgba(
              0,
              0,
              0,
              0.3
            );
        }


        .readiness h2 {
          color: #eee4d0;
        }


        .readiness p {
          color:
            rgba(
              231,
              217,
              191,
              0.48
            );

          font-size: 10px;
          line-height: 1.6;
        }


        .areas {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              1fr
            );

          gap: 1px;

          background:
            rgba(
              231,
              217,
              191,
              0.12
            );
        }


        .areas div {
          min-height: 72px;

          padding: 13px;

          background: #17130f;
        }


        .areas span,
        .areas small {
          display: block;

          color:
            rgba(
              231,
              217,
              191,
              0.43
            );

          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }


        .areas b {
          display: block;

          margin:
            7px 0 4px;

          color: #c38a54;

          font:
            400 18px
            Georgia,
            serif;
        }


        .score {
          text-align: center;
        }


        .score > b {
          display: block;

          color: #c99158;

          font:
            400 54px
            Georgia,
            serif;
        }


        .score span {
          color:
            rgba(
              231,
              217,
              191,
              0.4
            );

          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }


        /* FOOTER */

        footer {
          position: relative;
          z-index: 3;

          width:
            min(
              1100px,
              100%
            );

          margin:
            60px auto 0;

          display: flex;

          justify-content: center;
          align-items: center;

          gap: 18px;

          color:
            rgba(
              238,
              228,
              208,
              0.3
            );

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.2em;
        }


        footer i {
          width: 42px;
          height: 1px;

          background:
            rgba(
              238,
              228,
              208,
              0.16
            );
        }


        /* TABLET */

        @media (
          max-width: 920px
        ) {

          .desk {
            padding-left: 24px;
            padding-right: 24px;
          }


          .workspace {
            min-height: auto;

            display: flex;
            flex-direction: column;

            gap: 18px;
          }


          .map,
          .polaroid,
          .weather,
          .route,
          .gear,
          .budget,
          .check,
          .readiness {
            position: relative;

            inset: auto;

            width: auto;
            height: auto;

            min-height: 0;

            transform: none;
          }


          .map {
            min-height: 430px;
          }


          .polaroid {
            width:
              min(
                300px,
                calc(
                  100% - 26px
                )
              );

            align-self: flex-end;
          }


          .gearGrid {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }


          .readiness {
            grid-template-columns:
              1fr;
          }


          .score {
            text-align: left;
          }

        }


        /* MOBILE */

        @media (
          max-width: 620px
        ) {

          .desk {
            padding-left: 15px;
            padding-right: 15px;
          }


          header {
            height: 62px;
          }


          nav {
            gap: 12px;
          }


          nav button:first-child {
            display: none;
          }


          .stamp {
            display: none;
          }


          .hero h1 {
            font-size: 40px;
          }


          .map,
          .gear,
          .check,
          .readiness {
            padding:
              24px 20px;
          }


          .mapCopy {
            width: auto;
          }


          .mapFoot {
            grid-template-columns:
              1fr;

            gap: 10px;
          }


          .map {
            min-height: 540px;
          }


          .gearGrid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }


          .gearHead {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .areas {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

        }

      `}</style>

    </main>
  );
}
