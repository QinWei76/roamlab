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

const vehicleLabels: Record<
  VehicleKey,
  string
> = {
  suv: "SUV",
  truck: "TRUCK",
  van: "VAN",
  crossover: "CROSSOVER / AWD",
  city: "2WD / CITY CAR",
};

const tripLabels: Record<
  TripKey,
  string
> = {
  weekend: "WEEKEND ESCAPE",
  "road-trip": "ROAD TRIP",
  basecamp: "BASECAMP",
  remote: "REMOTE / OFF-GRID",
};

const crewLabels: Record<
  CrewKey,
  string
> = {
  solo: "SOLO",
  couple: "COUPLE",
  family: "FAMILY",
  friends: "FRIENDS",
};

const durationLabels: Record<
  DurationKey,
  string
> = {
  overnight: "1 NIGHT",
  weekend: "2–3 NIGHTS",
  "multi-day": "4–7 NIGHTS",
  extended: "8+ NIGHTS",
};

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

    const durationParam =
      params.get("duration");

    if (
      isVehicleKey(vehicleParam)
    ) {
      setVehicle(vehicleParam);
    }

    if (isTripKey(tripParam)) {
      setTrip(tripParam);
    }

    if (isCrewKey(crewParam)) {
      setCrew(crewParam);
    }

    if (
      isDurationKey(durationParam)
    ) {
      setDuration(durationParam);
    }

    const peopleParam = Number(
      params.get("people")
    );

    if (
      Number.isFinite(peopleParam) &&
      peopleParam > 0
    ) {
      setPeople(peopleParam);
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
    const amount = Number(
      budget.replace(/,/g, "")
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
          budget.replace(/,/g, "")
        ).toLocaleString("en-US")
      : "";

  if (!ready) {
    return (
      <main className="budget-page">
        <div className="budget-loading" />

        <style jsx>{`
          .budget-page {
            min-height: 100vh;
            background: #11100d;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="budget-page">
      <section className="budget-stage">

        {/* =========================
            TOP
        ========================= */}

        <header className="budget-top">
          <Link
            href="/"
            className="budget-logo"
          >
            ROAMLAB
          </Link>

          <div className="budget-context">
            <span>
              PLAN YOUR WILD
            </span>

            <strong>
              DRIVE
            </strong>
          </div>
        </header>

        {/* =========================
            LEFT PROGRESS
        ========================= */}

        <aside className="budget-progress">
          <div className="budget-progress-title">
            YOUR WILD
          </div>

          <div className="budget-step done">
            <span>✓</span>
            VEHICLE
          </div>

          <div className="budget-step done">
            <span>✓</span>
            TRIP STYLE
          </div>

          <div className="budget-step done">
            <span>✓</span>
            CREW
          </div>

          <div className="budget-step done">
            <span>✓</span>
            DURATION
          </div>

          <div className="budget-step current">
            <span>5</span>
            BUDGET
          </div>

          <div className="budget-step future">
            <span>6</span>
            GEAR ROOM
          </div>
        </aside>

        {/* =========================
            MAIN NOTEBOOK
        ========================= */}

        <section className="budget-book">

          <div className="budget-kicker">
            TOTAL WILD BUDGET
          </div>

          <h1>
            WHAT&apos;S YOUR
            <br />
            WILD BUDGET?
          </h1>

          <p className="budget-lead">
            For the whole Wild —
            not just gear.
          </p>

          <p className="budget-copy">
            Give RoamLab one total
            budget for this adventure.
            We&apos;ll use it as a
            planning constraint across
            travel, gear, food,
            campsites, activities and
            the unexpected.
          </p>

          {/* INPUT */}

          <div className="budget-input-wrap">
            <span className="budget-dollar">
              $
            </span>

            <input
              type="text"
              inputMode="numeric"
              placeholder="2,000"
              value={formattedBudget}
              onChange={(event) => {
                const raw =
                  event.target.value
                    .replace(/,/g, "")
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
              onChange={(event) =>
                setCurrency(
                  event.target.value
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

          {/* WHAT IT INCLUDES */}

          <div className="budget-includes">
            <div className="budget-small-title">
              WHAT THIS BUDGET COVERS
            </div>

            <div className="budget-categories">
              <span>TRANSPORT</span>
              <span>GEAR</span>
              <span>FOOD & WATER</span>
              <span>CAMPSITES</span>
              <span>PERMITS</span>
              <span>ACTIVITIES</span>
              <span>EMERGENCY</span>
            </div>
          </div>

          <div className="budget-principle">
            <strong>
              ONE WILD.
              ONE TOTAL BUDGET.
            </strong>

            <p>
              RoamLab will use this
              number throughout your
              Wild Plan. It&apos;s a
              ceiling to plan within —
              not a target to spend.
            </p>
          </div>
        </section>

        {/* =========================
            RIGHT CONTEXT
        ========================= */}

        <aside className="budget-summary">

          <div className="budget-summary-label">
            THIS WILD
          </div>

          <div className="budget-summary-row">
            <span>VEHICLE</span>
            <strong>
              {vehicleLabels[vehicle]}
            </strong>
          </div>

          <div className="budget-summary-row">
            <span>TRIP STYLE</span>
            <strong>
              {tripLabels[trip]}
            </strong>
          </div>

          <div className="budget-summary-row">
            <span>CREW</span>
            <strong>
              {crewLabels[crew]}
              {" · "}
              {people}
            </strong>
          </div>

          <div className="budget-summary-row">
            <span>DURATION</span>
            <strong>
              {
                durationLabels[
                  duration
                ]
              }
            </strong>
          </div>

          <div className="budget-summary-note">
            <strong>
              WHY ASK NOW?
            </strong>

            <p>
              Your budget becomes a
              reference point for the
              rest of this Wild —
              including gear choices,
              travel costs and later
              recommendations.
            </p>
          </div>
        </aside>

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="budget-actions">

          <button
            type="button"
            className="budget-skip"
            onClick={
              continueWithoutBudget
            }
          >
            I DON&apos;T KNOW YET
          </button>

          <button
            type="button"
            className="budget-continue"
            disabled={!budget}
            onClick={saveAndContinue}
          >
            SAVE BUDGET &
            CONTINUE →
          </button>

        </div>

        <Link
          href={durationUrl}
          className="budget-back"
        >
          ← DURATION
        </Link>

      </section>

      <style jsx>{`
        .budget-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% 18%,
              #40331f 0%,
              #201b13 34%,
              #11100d 76%
            );
          color: #e9dfcb;
          overflow-x: hidden;
        }

        .budget-stage {
          position: relative;
          min-height: 100vh;
          max-width: 1600px;
          margin: 0 auto;
          padding:
            30px 42px
            120px;
          box-sizing: border-box;
        }

        .budget-stage::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            repeating-linear-gradient(
              8deg,
              transparent 0,
              transparent 11px,
              rgba(
                255,
                255,
                255,
                0.025
              ) 12px
            );
        }

        .budget-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          padding-bottom: 24px;
          border-bottom:
            1px solid
            rgba(
              232,
              215,
              180,
              0.18
            );
        }

        .budget-logo {
          color: #f2eadb;
          text-decoration: none;
          font-weight: 900;
          font-size: 20px;
          letter-spacing: 0.13em;
        }

        .budget-context {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 10px;
          letter-spacing: 0.16em;
          opacity: 0.75;
        }

        .budget-context strong {
          color: #e3a14a;
        }

        .budget-progress {
          position: absolute;
          z-index: 2;
          left: 42px;
          top: 140px;
          width: 190px;
          padding:
            20px 18px;
          background:
            rgba(
              10,
              9,
              7,
              0.52
            );
          border:
            1px solid
            rgba(
              224,
              201,
              159,
              0.14
            );
          backdrop-filter:
            blur(8px);
        }

        .budget-progress-title {
          margin-bottom: 17px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .budget-step {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 0;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
          font-size: 10px;
          letter-spacing: 0.09em;
        }

        .budget-step span {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          flex: 0 0 24px;
          border-radius: 50%;
          border:
            1px solid
            rgba(
              231,
              216,
              187,
              0.35
            );
        }

        .budget-step.done {
          opacity: 0.68;
        }

        .budget-step.done span {
          color: #e3a14a;
        }

        .budget-step.current {
          color: #f0c377;
          font-weight: 900;
        }

        .budget-step.current span {
          background: #d99a42;
          color: #15110b;
          border-color:
            #d99a42;
        }

        .budget-step.future {
          opacity: 0.35;
        }

        .budget-book {
          position: relative;
          z-index: 2;
          width:
            min(
              620px,
              calc(
                100% - 520px
              )
            );
          min-height: 610px;
          margin:
            54px auto 0;
          padding:
            58px 64px;
          box-sizing: border-box;
          color: #211d17;
          background:
            linear-gradient(
              90deg,
              #d8c9a9 0%,
              #eee1c5 8%,
              #e9dcc0 50%,
              #dfcfad 100%
            );
          box-shadow:
            0 28px 80px
              rgba(
                0,
                0,
                0,
                0.48
              ),
            inset 0 0 70px
              rgba(
                91,
                64,
                30,
                0.13
              );
          transform:
            rotate(-0.35deg);
        }

        .budget-book::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.16;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent 0,
              transparent 27px,
              #6f6149 28px
            );
        }

        .budget-kicker,
        .budget-book h1,
        .budget-lead,
        .budget-copy,
        .budget-input-wrap,
        .budget-includes,
        .budget-principle {
          position: relative;
          z-index: 1;
        }

        .budget-kicker {
          color: #98611e;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.17em;
          margin-bottom: 14px;
        }

        .budget-book h1 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size:
            clamp(
              38px,
              4vw,
              60px
            );
          line-height: 0.94;
          letter-spacing:
            -0.035em;
        }

        .budget-lead {
          margin:
            22px 0 8px;
          font-size: 17px;
          font-weight: 800;
        }

        .budget-copy {
          max-width: 480px;
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
          opacity: 0.78;
        }

        .budget-input-wrap {
          display: grid;
          grid-template-columns:
            46px 1fr 90px;
          align-items: center;
          margin-top: 32px;
          border:
            1px solid
            rgba(
              35,
              29,
              20,
              0.55
            );
          background:
            rgba(
              255,
              250,
              235,
              0.34
            );
        }

        .budget-dollar {
          text-align: center;
          font-family: Georgia;
          font-size: 30px;
        }

        .budget-input-wrap input {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 18px 8px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #1e1a14;
          font-family: Georgia;
          font-size: 32px;
        }

        .budget-input-wrap select {
          height: 100%;
          border: 0;
          border-left:
            1px solid
            rgba(
              35,
              29,
              20,
              0.35
            );
          outline: 0;
          background: transparent;
          color: #211d17;
          font-weight: 800;
          cursor: pointer;
        }

        .budget-includes {
          margin-top: 25px;
          padding: 18px;
          background:
            rgba(
              93,
              71,
              37,
              0.08
            );
          border-top:
            1px solid
            rgba(
              55,
              43,
              25,
              0.17
            );
          border-bottom:
            1px solid
            rgba(
              55,
              43,
              25,
              0.17
            );
        }

        .budget-small-title {
          margin-bottom: 13px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .budget-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .budget-categories span {
          padding:
            7px 9px;
          border:
            1px solid
            rgba(
              50,
              40,
              25,
              0.18
            );
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .budget-principle {
          margin-top: 25px;
          padding-left: 15px;
          border-left:
            3px solid
            #b77a2d;
        }

        .budget-principle strong {
          font-size: 11px;
          letter-spacing: 0.1em;
        }

        .budget-principle p {
          margin:
            7px 0 0;
          font-size: 11px;
          line-height: 1.55;
          opacity: 0.68;
        }

        .budget-summary {
          position: absolute;
          z-index: 2;
          right: 42px;
          top: 140px;
          width: 220px;
          padding:
            22px 20px;
          background:
            rgba(
              12,
              10,
              7,
              0.58
            );
          border:
            1px solid
            rgba(
              224,
              201,
              159,
              0.14
            );
          backdrop-filter:
            blur(8px);
        }

        .budget-summary-label {
          padding-bottom: 13px;
          margin-bottom: 4px;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );
          color: #dfa04a;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .budget-summary-row {
          padding: 13px 0;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
        }

        .budget-summary-row span,
        .budget-summary-row strong {
          display: block;
        }

        .budget-summary-row span {
          margin-bottom: 5px;
          font-size: 8px;
          letter-spacing: 0.13em;
          opacity: 0.48;
        }

        .budget-summary-row strong {
          font-size: 10px;
          letter-spacing: 0.06em;
        }

        .budget-summary-note {
          margin-top: 18px;
          padding-top: 16px;
        }

        .budget-summary-note strong {
          color: #dfa04a;
          font-size: 9px;
          letter-spacing: 0.12em;
        }

        .budget-summary-note p {
          margin:
            8px 0 0;
          font-size: 10px;
          line-height: 1.6;
          opacity: 0.62;
        }

        .budget-actions {
          position: relative;
          z-index: 3;
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 34px;
        }

        .budget-actions button {
          min-width: 230px;
          padding:
            16px 24px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .budget-skip {
          border:
            1px solid
            rgba(
              233,
              223,
              203,
              0.45
            );
          background:
            rgba(
              0,
              0,
              0,
              0.2
            );
          color: #e9dfcb;
        }

        .budget-continue {
          border:
            1px solid #d99a42;
          background: #d99a42;
          color: #17120b;
        }

        .budget-continue:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }

        .budget-actions button:not(
            :disabled
          ):hover {
          box-shadow:
            0 0 24px
            rgba(
              221,
              158,
              70,
              0.2
            );
        }

        .budget-back {
          position: absolute;
          z-index: 3;
          left: 42px;
          bottom: 42px;
          color: #e9dfcb;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.11em;
          opacity: 0.65;
        }

        @media (
          max-width: 1050px
        ) {
          .budget-progress,
          .budget-summary {
            position: relative;
            left: auto;
            right: auto;
            top: auto;
            width: auto;
            margin-top: 24px;
          }

          .budget-book {
            width: 100%;
            margin-top: 24px;
          }

          .budget-stage {
            padding-bottom:
              110px;
          }
        }

        @media (
          max-width: 650px
        ) {
          .budget-stage {
            padding:
              20px 18px
              100px;
          }

          .budget-context {
            display: none;
          }

          .budget-book {
            padding:
              40px 26px;
          }

          .budget-book h1 {
            font-size: 40px;
          }

          .budget-actions {
            flex-direction: column;
          }

          .budget-actions button {
            width: 100%;
          }

          .budget-back {
            left: 18px;
            bottom: 34px;
          }
        }
      `}</style>
    </main>
  );
}
