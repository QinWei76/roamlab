"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  getOrCreateCurrentWild,
  updateTotalWildBudget,
} from "@/lib/wildStore";

type VehicleKey =
  | "suv"
  | "truck"
  | "van"
  | "crossover"
  | "city";

type TripKey =
  | "weekend"
  | "road-trip"
  | "basecamp"
  | "remote";

type CrewKey =
  | "solo"
  | "couple"
  | "family"
  | "friends";

type DurationKey =
  | "overnight"
  | "weekend"
  | "multi-day"
  | "extended";

const isVehicleKey = (
  value: string | null
): value is VehicleKey =>
  [
    "suv",
    "truck",
    "van",
    "crossover",
    "city",
  ].includes(value || "");

const isTripKey = (
  value: string | null
): value is TripKey =>
  [
    "weekend",
    "road-trip",
    "basecamp",
    "remote",
  ].includes(value || "");

const isCrewKey = (
  value: string | null
): value is CrewKey =>
  [
    "solo",
    "couple",
    "family",
    "friends",
  ].includes(value || "");

const isDurationKey = (
  value: string | null
): value is DurationKey =>
  [
    "overnight",
    "weekend",
    "multi-day",
    "extended",
  ].includes(value || "");

export default function BudgetPage() {
  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [trip, setTrip] =
    useState<TripKey>("weekend");

  const [crew, setCrew] =
    useState<CrewKey>("couple");

  const [people, setPeople] =
    useState(2);

  const [duration, setDuration] =
    useState<DurationKey>("weekend");

  const [budget, setBudget] =
    useState("");

  const [currency, setCurrency] =
    useState("USD");

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const vehicleParam =
      params.get("vehicle");

    const tripParam =
      params.get("trip");

    const crewParam =
      params.get("crew");

    const peopleParam =
      Number(
        params.get("people")
      );

    const durationParam =
      params.get("duration");

    if (
      isVehicleKey(vehicleParam)
    ) {
      setVehicle(vehicleParam);
    }

    if (
      isTripKey(tripParam)
    ) {
      setTrip(tripParam);
    }

    if (
      isCrewKey(crewParam)
    ) {
      setCrew(crewParam);
    }

    if (
      Number.isFinite(
        peopleParam
      ) &&
      peopleParam > 0
    ) {
      setPeople(peopleParam);
    }

    if (
      isDurationKey(
        durationParam
      )
    ) {
      setDuration(
        durationParam
      );
    }

    setReady(true);
  }, []);

  const gearRoomUrl =
    `/ways-in/drive/gear` +
    `?vehicle=${vehicle}` +
    `&trip=${trip}` +
    `&crew=${crew}` +
    `&people=${people}` +
    `&duration=${duration}`;

  const durationUrl =
    `/ways-in/drive/duration` +
    `?vehicle=${vehicle}` +
    `&trip=${trip}` +
    `&crew=${crew}` +
    `&people=${people}`;

  const saveAndContinue = () => {
    const amount =
      Number(
        budget.replace(
          /,/g,
          ""
        )
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    getOrCreateCurrentWild(
      "My Wild"
    );

    updateTotalWildBudget(
      amount,
      currency
    );

    window.location.href =
      gearRoomUrl;
  };

  const continueWithoutBudget =
    () => {
      getOrCreateCurrentWild(
        "My Wild"
      );

      window.location.href =
        gearRoomUrl;
    };

  const formattedBudget =
    budget
      ? Number(
          budget.replace(
            /,/g,
            ""
          )
        ).toLocaleString(
          "en-US"
        )
      : "";

  if (!ready) {
    return (
      <main className="budget2-page">
        <div className="budget2-loading" />
      </main>
    );
  }

  return (
    <main className="budget2-page">
      <section className="budget2-stage">

        {/* =========================
            TEMP BACKGROUND

            Later replace:
            /duration-desk-v2.jpg

            with:
            /budget-desk-v2.jpg
        ========================= */}

        <img
          src="/duration-desk-v2.jpg"
          alt=""
          className="budget2-bg"
          draggable={false}
        />

        <div className="budget2-shade" />

        {/* =========================
            LOGO
        ========================= */}

        <Link
          href="/"
          className="budget2-logo"
          aria-label="RoamLab home"
        >
          <span className="budget2-logo-main">
            ROAMLAB
          </span>

          <span className="budget2-logo-sub">
            PLANS · GEAR · STORIES
          </span>
        </Link>

        {/* =========================
            GLOBAL NAV
        ========================= */}

        <nav className="budget2-nav">

          <div className="budget2-nav-links">

            <Link href="/explore">
              EXPLORE
            </Link>

            <Link href="/plan">
              PLAN
            </Link>

            <Link href="/prepare">
              PREPARE
            </Link>

            <Link href="/safety">
              SAFETY
            </Link>

            <Link href="/learn">
              LEARN
            </Link>

            <Link href="/journal">
              JOURNAL
            </Link>

            <Link href="/stories">
              STORIES
            </Link>

            <Link href="/badges">
              BADGES
            </Link>

          </div>

          <Link
            href="/signin"
            className="budget2-signin"
          >
            SIGN IN
          </Link>

          <Link
            href="/start-here"
            className="budget2-start"
          >
            START YOUR WILD →
          </Link>

        </nav>

        {/* =========================
            SMALL STEP LABEL
        ========================= */}

        <div className="budget2-step">
          DRIVE · STEP 5 OF 6
        </div>

        {/* =========================
            MAIN BUDGET CARD
        ========================= */}

        <section className="budget2-card">

          <div className="budget2-kicker">
            TOTAL WILD BUDGET
          </div>

          <h1>
            WHAT&apos;S YOUR
            <br />
            WILD BUDGET?
          </h1>

          <p className="budget2-lead">
            For the whole Wild —
            not just gear.
          </p>

          <p className="budget2-copy">
            Give RoamLab one total
            budget for this adventure.
            We&apos;ll use it as a
            planning reference across
            travel, gear, food,
            campsites, activities and
            the unexpected.
          </p>

          {/* BUDGET INPUT */}

          <div className="budget2-input">

            <span className="budget2-symbol">
              $
            </span>

            <input
              type="text"
              inputMode="numeric"
              placeholder="2,000"
              value={
                formattedBudget
              }
              onChange={(
                event
              ) => {
                const raw =
                  event.target.value
                    .replace(
                      /,/g,
                      ""
                    )
                    .replace(
                      /[^\d]/g,
                      ""
                    );

                setBudget(raw);
              }}
              aria-label="Total Wild Budget"
            />

            <select
              value={currency}
              onChange={(
                event
              ) =>
                setCurrency(
                  event.target
                    .value
                )
              }
              aria-label="Currency"
            >
              <option value="USD">
                USD
              </option>

              <option value="CAD">
                CAD
              </option>

              <option value="AUD">
                AUD
              </option>

              <option value="EUR">
                EUR
              </option>

              <option value="GBP">
                GBP
              </option>

            </select>

          </div>

          {/* COVERAGE */}

          <div className="budget2-rule" />

          <div className="budget2-covers-title">
            THIS BUDGET GUIDES
          </div>

          <div className="budget2-covers">

            <span>
              TRAVEL
            </span>

            <i>•</i>

            <span>
              GEAR
            </span>

            <i>•</i>

            <span>
              FOOD
            </span>

            <i>•</i>

            <span>
              CAMPSITES
            </span>

            <i>•</i>

            <span>
              PERMITS
            </span>

            <i>•</i>

            <span>
              ACTIVITIES
            </span>

            <i>•</i>

            <span>
              RESERVE
            </span>

          </div>

          <div className="budget2-note">
            <strong>
              ONE WILD.
              ONE TOTAL BUDGET.
            </strong>

            <span>
              A planning ceiling,
              not a spending target.
            </span>
          </div>

        </section>

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="budget2-actions">

          <button
            type="button"
            className="budget2-skip"
            onClick={
              continueWithoutBudget
            }
          >
            I DON&apos;T KNOW YET
          </button>

          <button
            type="button"
            className="budget2-continue"
            disabled={!budget}
            onClick={
              saveAndContinue
            }
          >
            SAVE BUDGET &
            CONTINUE →
          </button>

        </div>

        {/* =========================
            BACK
        ========================= */}

        <Link
          href={durationUrl}
          className="budget2-back"
        >
          ← DURATION
        </Link>

        {/* =========================
            BOTTOM PROGRESS
        ========================= */}

        <div className="budget2-progress">

          <Link
            href="/ways-in/drive"
            className="budget2-progress-step done"
          >
            <b>✓</b>
            VEHICLE
          </Link>

          <i />

          <Link
            href={
              `/ways-in/drive/setup` +
              `?vehicle=${vehicle}`
            }
            className="budget2-progress-step done"
          >
            <b>✓</b>
            TRIP STYLE
          </Link>

          <i />

          <Link
            href={
              `/ways-in/drive/crew` +
              `?vehicle=${vehicle}` +
              `&trip=${trip}`
            }
            className="budget2-progress-step done"
          >
            <b>✓</b>
            CREW
          </Link>

          <i />

          <Link
            href={durationUrl}
            className="budget2-progress-step done"
          >
            <b>✓</b>
            DURATION
          </Link>

          <i />

          <div className="budget2-progress-step current">
            <b>5</b>
            BUDGET
          </div>

          <i />

          <div className="budget2-progress-step future">
            <b>6</b>
            GEAR
          </div>

        </div>

      </section>

      <style jsx>{`

        .budget2-page {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          background: #080806;
          overflow: hidden;
          color: #f0e7d5;
        }

        .budget2-stage {
          position: relative;
          width: 100%;
          min-height: 100vh;
          isolation: isolate;
          overflow: hidden;
        }

        /* BACKGROUND */

        .budget2-bg {
          position: absolute;
          z-index: 0;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          user-select: none;
        }

        .budget2-shade {
          position: absolute;
          z-index: 1;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 50% 52%,
              rgba(
                0,
                0,
                0,
                0.05
              ) 0%,
              rgba(
                0,
                0,
                0,
                0.2
              ) 46%,
              rgba(
                0,
                0,
                0,
                0.62
              ) 100%
            );
        }

        /* LOGO */

        .budget2-logo {
          position: absolute;
          z-index: 20;
          left: 3.2%;
          top: 3.2%;
          color: #eee3cd;
          text-decoration: none;
          text-shadow:
            0 2px 8px
            rgba(
              0,
              0,
              0,
              0.7
            );
        }

        .budget2-logo-main {
          display: block;
          font-size: 17px;
          font-weight: 900;
          letter-spacing:
            0.13em;
        }

        .budget2-logo-sub {
          display: block;
          margin-top: 3px;
          font-size: 6px;
          letter-spacing:
            0.18em;
          opacity: 0.62;
        }

        /* NAV */

        .budget2-nav {
          position: absolute;
          z-index: 20;
          left: 20%;
          right: 2.8%;
          top: 3.4%;
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing:
            0.12em;
        }

        .budget2-nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-right: auto;
        }

        .budget2-nav a {
          color: #eee3cd;
          text-decoration: none;
          opacity: 0.76;
          transition:
            opacity 160ms ease,
            text-shadow 160ms ease;
        }

        .budget2-nav a:hover {
          opacity: 1;
          text-shadow:
            0 0 14px
            rgba(
              229,
              165,
              74,
              0.45
            );
        }

        .budget2-signin {
          white-space: nowrap;
        }

        .budget2-start {
          padding:
            10px 13px;
          border:
            1px solid
            rgba(
              229,
              165,
              74,
              0.55
            );
          white-space: nowrap;
        }

        /* STEP */

        .budget2-step {
          position: absolute;
          z-index: 10;
          left: 50%;
          top: 12%;
          transform:
            translateX(-50%);
          color:
            rgba(
              238,
              227,
              205,
              0.72
            );
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.2em;
          text-shadow:
            0 2px 8px
            rgba(
              0,
              0,
              0,
              0.8
            );
        }

        /* CARD */

        .budget2-card {
          position: absolute;
          z-index: 10;
          left: 50%;
          top: 48%;
          width:
            min(
              560px,
              52vw
            );
          transform:
            translate(
              -50%,
              -50%
            );
          box-sizing:
            border-box;
          padding:
            38px 46px 34px;

          background:
            linear-gradient(
              135deg,
              rgba(
                29,
                24,
                17,
                0.92
              ),
              rgba(
                12,
                10,
                7,
                0.95
              )
            );

          border:
            1px solid
            rgba(
              224,
              198,
              151,
              0.22
            );

          box-shadow:
            0 24px 70px
              rgba(
                0,
                0,
                0,
                0.58
              ),
            inset
              0 0 35px
              rgba(
                224,
                159,
                65,
                0.035
              );

          backdrop-filter:
            blur(8px);
        }

        .budget2-kicker {
          margin-bottom:
            12px;
          color: #dda04c;
          font-size: 9px;
          font-weight: 900;
          letter-spacing:
            0.18em;
        }

        .budget2-card h1 {
          margin: 0;
          color: #f0e7d5;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size:
            clamp(
              35px,
              4vw,
              54px
            );
          line-height: 0.94;
          letter-spacing:
            -0.035em;
          text-shadow:
            0 3px 16px
            rgba(
              0,
              0,
              0,
              0.5
            );
        }

        .budget2-lead {
          margin:
            18px 0 7px;
          color: #e8d7b8;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 14px;
          font-weight: 700;
        }

        .budget2-copy {
          max-width: 450px;
          margin: 0;
          color:
            rgba(
              236,
              225,
              204,
              0.66
            );
          font-size: 10px;
          line-height: 1.6;
        }

        /* INPUT */

        .budget2-input {
          display: grid;
          grid-template-columns:
            42px
            minmax(0, 1fr)
            80px;
          align-items: center;
          margin-top: 24px;
          background:
            rgba(
              4,
              4,
              3,
              0.48
            );
          border:
            1px solid
            rgba(
              225,
              196,
              145,
              0.34
            );
        }

        .budget2-symbol {
          text-align: center;
          color: #dda04c;
          font-family: Georgia;
          font-size: 25px;
        }

        .budget2-input input {
          width: 100%;
          min-width: 0;
          box-sizing:
            border-box;
          padding:
            15px 8px;
          border: 0;
          outline: 0;
          background:
            transparent;
          color: #f1e8d6;
          font-family: Georgia;
          font-size: 28px;
        }

        .budget2-input input::placeholder {
          color:
            rgba(
              241,
              232,
              214,
              0.35
            );
        }

        .budget2-input select {
          align-self: stretch;
          border: 0;
          border-left:
            1px solid
            rgba(
              225,
              196,
              145,
              0.22
            );
          outline: 0;
          background:
            rgba(
              0,
              0,
              0,
              0.25
            );
          color: #eadfc9;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        /* COVERAGE */

        .budget2-rule {
          height: 1px;
          margin: 23px 0 16px;
          background:
            rgba(
              225,
              196,
              145,
              0.16
            );
        }

        .budget2-covers-title {
          color:
            rgba(
              238,
              226,
              203,
              0.52
            );
          font-size: 7px;
          font-weight: 900;
          letter-spacing:
            0.17em;
        }

        .budget2-covers {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          color:
            rgba(
              240,
              230,
              211,
              0.74
            );
          font-size: 8px;
          font-weight: 800;
          letter-spacing:
            0.06em;
        }

        .budget2-covers i {
          color: #d99b45;
          font-style: normal;
          opacity: 0.7;
        }

        .budget2-note {
          display: flex;
          align-items:
            baseline;
          gap: 12px;
          margin-top: 18px;
          padding-left: 12px;
          border-left:
            2px solid
            #c88b3d;
        }

        .budget2-note strong {
          color: #e0b36f;
          font-size: 8px;
          letter-spacing:
            0.1em;
        }

        .budget2-note span {
          color:
            rgba(
              235,
              224,
              203,
              0.48
            );
          font-size: 8px;
        }

        /* ACTIONS */

        .budget2-actions {
          position: absolute;
          z-index: 20;
          left: 50%;
          bottom: 13%;
          transform:
            translateX(-50%);
          display: flex;
          gap: 12px;
        }

        .budget2-actions button {
          height: 43px;
          padding:
            0 25px;
          border-radius: 0;
          font-size: 8px;
          font-weight: 900;
          letter-spacing:
            0.11em;
          cursor: pointer;
          transition:
            box-shadow
              160ms ease,
            background
              160ms ease,
            opacity
              160ms ease;
        }

        .budget2-skip {
          min-width: 180px;
          border:
            1px solid
            rgba(
              235,
              220,
              192,
              0.38
            );
          background:
            rgba(
              5,
              5,
              4,
              0.7
            );
          color: #e9dfca;
        }

        .budget2-continue {
          min-width: 220px;
          border:
            1px solid
            #d99b45;
          background:
            rgba(
              203,
              139,
              55,
              0.9
            );
          color: #171108;
        }

        .budget2-continue:disabled {
          opacity: 0.34;
          cursor: not-allowed;
        }

        .budget2-actions
          button:not(
            :disabled
          ):hover {
          box-shadow:
            0 0 24px
            rgba(
              222,
              158,
              68,
              0.3
            );
        }

        /* BACK */

        .budget2-back {
          position: absolute;
          z-index: 20;
          left: 4%;
          bottom: 5.5%;
          color:
            rgba(
              239,
              228,
              207,
              0.66
            );
          text-decoration: none;
          font-size: 8px;
          font-weight: 800;
          letter-spacing:
            0.12em;
        }

        /* PROGRESS */

        .budget2-progress {
          position: absolute;
          z-index: 20;
          left: 50%;
          bottom: 4.5%;
          transform:
            translateX(-50%);
          display: flex;
          align-items: center;
          gap: 9px;
          white-space: nowrap;
        }

        .budget2-progress > i {
          display: block;
          width: 25px;
          height: 1px;
          background:
            rgba(
              235,
              222,
              197,
              0.22
            );
        }

        .budget2-progress-step {
          display: flex;
          align-items: center;
          gap: 6px;
          color:
            rgba(
              236,
              224,
              201,
              0.58
            );
          text-decoration: none;
          font-size: 7px;
          font-weight: 800;
          letter-spacing:
            0.08em;
        }

        .budget2-progress-step b {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border:
            1px solid
            rgba(
              231,
              213,
              180,
              0.34
            );
          font-size: 7px;
        }

        .budget2-progress-step.done b {
          color: #dda04b;
        }

        .budget2-progress-step.current {
          color: #e7b86f;
        }

        .budget2-progress-step.current b {
          border-color:
            #d99b45;
          background: #d99b45;
          color: #171108;
        }

        .budget2-progress-step.future {
          opacity: 0.36;
        }

        @media (
          max-width: 900px
        ) {
          .budget2-nav-links {
            display: none;
          }

          .budget2-nav {
            left: auto;
          }

          .budget2-card {
            width: 76vw;
          }

          .budget2-progress {
            display: none;
          }
        }

        @media (
          max-width: 620px
        ) {
          .budget2-card {
            width: 88vw;
            padding:
              30px 24px;
          }

          .budget2-card h1 {
            font-size: 38px;
          }

          .budget2-actions {
            width: 88%;
            flex-direction:
              column;
            bottom: 7%;
          }

          .budget2-actions button {
            width: 100%;
          }

          .budget2-back {
            display: none;
          }

          .budget2-step {
            top: 11%;
          }
        }

      `}</style>
    </main>
  );
}
