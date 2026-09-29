"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PlannerProgress from "@/components/PlannerProgress";

import {
  getOrCreateCurrentWild,
  updateWildDuration,
  updateWildSchedule,
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

type TimingChoice =
  | "exact"
  | "flexible"
  | "undecided";

const durationLabels: Record<
  DurationKey,
  {
    title: string;
    detail: string;
  }
> = {
  overnight: {
    title: "Overnight",
    detail: "1 Night",
  },

  weekend: {
    title: "Weekend",
    detail: "2–3 Nights",
  },

  "multi-day": {
    title: "Multi-Day",
    detail: "4–7 Nights",
  },

  extended: {
    title: "Extended",
    detail: "8+ Nights",
  },
};

/*
  Planning baselines.

  These are used only when exact
  calendar dates have not been set.
*/
const durationDefaults: Record<
  DurationKey,
  {
    days?: number;
    nights?: number;
  }
> = {
  overnight: {
    days: 2,
    nights: 1,
  },

  weekend: {
    days: 3,
    nights: 2,
  },

  "multi-day": {
    days: 7,
    nights: 6,
  },

  extended: {},
};

/*
  Parse YYYY-MM-DD as a local calendar date.

  This avoids timezone shifts when calculating
  the number of nights between two dates.
*/
function parseLocalDate(value: string) {
  if (!value) {
    return null;
  }

  const parts = value.split("-").map(Number);

  if (
    parts.length !== 3 ||
    !Number.isFinite(parts[0]) ||
    !Number.isFinite(parts[1]) ||
    !Number.isFinite(parts[2])
  ) {
    return null;
  }

  return new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  );
}

function calculateTripLength(
  startDate: string,
  endDate: string
) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!start || !end) {
    return null;
  }

  const milliseconds =
    end.getTime() - start.getTime();

  if (milliseconds < 0) {
    return null;
  }

  const nights = Math.round(
    milliseconds /
      (1000 * 60 * 60 * 24)
  );

  return {
    days: nights + 1,
    nights,
  };
}

function durationForNights(
  nights: number
): DurationKey {
  if (nights <= 1) {
    return "overnight";
  }

  if (nights <= 3) {
    return "weekend";
  }

  if (nights <= 7) {
    return "multi-day";
  }

  return "extended";
}

function durationMatchesNights(
  duration: DurationKey,
  nights: number
) {
  if (duration === "overnight") {
    return nights === 1;
  }

  if (duration === "weekend") {
    return nights >= 2 && nights <= 3;
  }

  if (duration === "multi-day") {
    return nights >= 4 && nights <= 7;
  }

  return nights >= 8;
}

export default function DurationPage() {
  const [vehicle, setVehicle] =
    useState<VehicleKey>("suv");

  const [trip, setTrip] =
    useState<TripKey>("weekend");

  const [crew, setCrew] =
    useState<CrewKey>("solo");

  const [people, setPeople] =
    useState<number>(1);

  const [
    selectedDuration,
    setSelectedDuration,
  ] = useState<DurationKey | null>(
    null
  );

  const [
    timingChoice,
    setTimingChoice,
  ] = useState<TimingChoice | null>(
    null
  );

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    dateError,
    setDateError,
  ] = useState("");

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const vehicleValue =
      params.get("vehicle");

    const tripValue =
      params.get("trip");

    const crewValue =
      params.get("crew");

    const peopleValue =
      params.get("people");

    if (
      vehicleValue === "suv" ||
      vehicleValue === "truck" ||
      vehicleValue === "van" ||
      vehicleValue === "crossover" ||
      vehicleValue === "city"
    ) {
      setVehicle(vehicleValue);
    }

    if (
      tripValue === "weekend" ||
      tripValue === "road-trip" ||
      tripValue === "basecamp" ||
      tripValue === "remote"
    ) {
      setTrip(tripValue);
    }

    if (
      crewValue === "solo" ||
      crewValue === "couple" ||
      crewValue === "family" ||
      crewValue === "friends"
    ) {
      setCrew(crewValue);
    }

    const parsedPeople =
      Number(peopleValue);

    if (
      Number.isFinite(parsedPeople) &&
      parsedPeople > 0
    ) {
      setPeople(parsedPeople);
    }

    setReady(true);
  }, []);

  const exactTripLength =
    useMemo(() => {
      if (!startDate || !endDate) {
        return null;
      }

      return calculateTripLength(
        startDate,
        endDate
      );
    }, [startDate, endDate]);

  const durationConflict =
    useMemo(() => {
      if (
        timingChoice !== "exact" ||
        !selectedDuration ||
        !exactTripLength ||
        exactTripLength.nights < 1
      ) {
        return false;
      }

      return !durationMatchesNights(
        selectedDuration,
        exactTripLength.nights
      );
    }, [
      timingChoice,
      selectedDuration,
      exactTripLength,
    ]);

  const suggestedDuration =
    useMemo(() => {
      if (
        !exactTripLength ||
        exactTripLength.nights < 1
      ) {
        return null;
      }

      return durationForNights(
        exactTripLength.nights
      );
    }, [exactTripLength]);

  const chooseDuration = (
    duration: DurationKey
  ) => {
    setSelectedDuration(duration);
    setTimingChoice(null);
    setStartDate("");
    setEndDate("");
    setDateError("");
  };

  const closeSelection = () => {
    setSelectedDuration(null);
    setTimingChoice(null);
    setStartDate("");
    setEndDate("");
    setDateError("");
  };

  const chooseTiming = (
    timing: TimingChoice
  ) => {
    setTimingChoice(timing);
    setDateError("");

    if (timing !== "exact") {
      setStartDate("");
      setEndDate("");
    }
  };

  /*
    If the exact dates do not match the
    previously selected duration category,
    let the real dates become the source
    of truth and update the duration.
  */
  const useTheseDates = () => {
    if (!suggestedDuration) {
      return;
    }

    setSelectedDuration(
      suggestedDuration
    );

    setDateError("");
  };

  const continueToDestination = () => {
    if (!selectedDuration) {
      return;
    }

    if (!timingChoice) {
      setDateError(
        "Choose when you are going before continuing."
      );
      return;
    }

    getOrCreateCurrentWild(
      "My Wild"
    );

    /*
      EXACT DATES
    */
    if (timingChoice === "exact") {
      if (!startDate || !endDate) {
        setDateError(
          "Add both your start date and end date."
        );
        return;
      }

      const tripLength =
        calculateTripLength(
          startDate,
          endDate
        );

      if (!tripLength) {
        setDateError(
          "Your end date must be on or after your start date."
        );
        return;
      }

      if (tripLength.nights < 1) {
        setDateError(
          "Choose an end date at least one night after your start date."
        );
        return;
      }

      /*
        Do not silently change the user's
        duration category.

        The conflict panel asks them to
        explicitly accept the dates first.
      */
      if (
        !durationMatchesNights(
          selectedDuration,
          tripLength.nights
        )
      ) {
        setDateError(
          "Your dates do not match the duration you selected. Use the duration check below before continuing."
        );
        return;
      }

      updateWildDuration(
        selectedDuration,
        {
          days: tripLength.days,
          nights: tripLength.nights,
        }
      );

      updateWildSchedule({
        startDate,
        endDate,
        timingMode: "exact",
        flexibleDates: false,
      });

      window.location.href =
        `/wild-plan/destination` +
        `?vehicle=${vehicle}` +
        `&trip=${trip}` +
        `&crew=${crew}` +
        `&people=${people}` +
        `&duration=${selectedDuration}`;

      return;
    }

    /*
      FLEXIBLE / UNDECIDED

      No exact calendar dates exist,
      so keep the planning baseline.
    */
    const defaults =
      durationDefaults[
        selectedDuration
      ];

    updateWildDuration(
      selectedDuration,
      defaults
    );

    if (
      timingChoice === "flexible"
    ) {
      updateWildSchedule({
        startDate: undefined,
        endDate: undefined,
        timingMode: "flexible",
        flexibleDates: true,
      });
    } else {
      updateWildSchedule({
        startDate: undefined,
        endDate: undefined,
        timingMode: "undecided",
        flexibleDates: false,
      });
    }

    window.location.href =
      `/wild-plan/destination` +
      `?vehicle=${vehicle}` +
      `&trip=${trip}` +
      `&crew=${crew}` +
      `&people=${people}` +
      `&duration=${selectedDuration}`;
  };

  if (!ready) {
    return (
      <main className="duration2-page">
        <div className="duration2-loading" />
      </main>
    );
  }

  return (
    <main className="duration2-page">
      <section className="duration2-stage">

        {/* BACKGROUND */}

        <img
          src="/duration-desk-v2.jpg"
          alt="RoamLab duration planning desk"
          className="duration2-bg"
          draggable={false}
        />

        {/* REAL HTML LOGO */}

        <Link
          href="/"
          className="duration2-logo"
          aria-label="RoamLab home"
        >
          <span className="duration2-logo-main">
            ROAMLAB
          </span>

          <span className="duration2-logo-sub">
            PLANS · GEAR · STORIES
          </span>
        </Link>

        {/* GLOBAL NAV */}

        <nav className="duration2-nav">
          <div className="duration2-nav-links">

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
            className="duration2-signin"
          >
            SIGN IN
          </Link>

          <Link
            href="/start-here"
            className="duration2-start"
          >
            START YOUR WILD →
          </Link>
        </nav>

        {/* PROGRESS */}

        <PlannerProgress
          currentStep={4}
          vehicle={vehicle}
          trip={trip}
        />

        {/* OVERNIGHT */}

        <button
          type="button"
          className={`duration2-zone duration2-overnight ${
            selectedDuration ===
            "overnight"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration(
              "overnight"
            )
          }
          aria-label="Choose Overnight"
          aria-pressed={
            selectedDuration ===
            "overnight"
          }
        />

        {/* WEEKEND */}

        <button
          type="button"
          className={`duration2-zone duration2-weekend ${
            selectedDuration ===
            "weekend"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration(
              "weekend"
            )
          }
          aria-label="Choose Weekend"
          aria-pressed={
            selectedDuration ===
            "weekend"
          }
        />

        {/* MULTI-DAY */}

        <button
          type="button"
          className={`duration2-zone duration2-multiday ${
            selectedDuration ===
            "multi-day"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration(
              "multi-day"
            )
          }
          aria-label="Choose Multi-Day"
          aria-pressed={
            selectedDuration ===
            "multi-day"
          }
        />

        {/* EXTENDED */}

        <button
          type="button"
          className={`duration2-zone duration2-extended ${
            selectedDuration ===
            "extended"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            chooseDuration(
              "extended"
            )
          }
          aria-label="Choose Extended"
          aria-pressed={
            selectedDuration ===
            "extended"
          }
        />

        {/* BACK */}

        <Link
          href={
            `/ways-in/drive/crew` +
            `?vehicle=${vehicle}` +
            `&trip=${trip}`
          }
          className="duration2-back"
        >
          ← CREW
        </Link>

        {/* SELECTED PANEL */}

        {selectedDuration && (
          <div className="duration2-panel duration2-panel-schedule">

            <button
              type="button"
              className="duration2-panel-close"
              onClick={
                closeSelection
              }
              aria-label="Close duration selection"
            >
              ×
            </button>

            {/* DURATION SUMMARY */}

            <div className="duration2-summary">
              <span>
                YOUR DURATION
              </span>

              <strong>
                {
                  durationLabels[
                    selectedDuration
                  ].title
                }
              </strong>

              <div className="duration2-summary-detail">
                {
                  durationLabels[
                    selectedDuration
                  ].detail
                }
              </div>

              <small>
                STEP 4 OF 6
              </small>
            </div>

            {/* WHEN ARE YOU GOING */}

            <div className="duration2-when">

              <div className="duration2-when-label">
                WHEN ARE YOU GOING?
              </div>

              <div className="duration2-timing-options">

                <button
                  type="button"
                  className={`duration2-timing-button ${
                    timingChoice ===
                    "exact"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    chooseTiming(
                      "exact"
                    )
                  }
                >
                  I KNOW MY DATES
                </button>

                <button
                  type="button"
                  className={`duration2-timing-button ${
                    timingChoice ===
                    "flexible"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    chooseTiming(
                      "flexible"
                    )
                  }
                >
                  FLEXIBLE
                </button>

                <button
                  type="button"
                  className={`duration2-timing-button ${
                    timingChoice ===
                    "undecided"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    chooseTiming(
                      "undecided"
                    )
                  }
                >
                  I DON&apos;T KNOW YET
                </button>

              </div>

              {/* EXACT DATE INPUT */}

              {timingChoice ===
                "exact" && (
                <div className="duration2-date-area">

                  <label className="duration2-date-field">
                    <span>
                      START
                    </span>

                    <input
                      type="date"
                      value={
                        startDate
                      }
                      onChange={(event) => {
                        setStartDate(
                          event.target.value
                        );
                        setDateError("");
                      }}
                    />
                  </label>

                  <div className="duration2-date-arrow">
                    →
                  </div>

                  <label className="duration2-date-field">
                    <span>
                      END
                    </span>

                    <input
                      type="date"
                      value={
                        endDate
                      }
                      min={
                        startDate ||
                        undefined
                      }
                      onChange={(event) => {
                        setEndDate(
                          event.target.value
                        );
                        setDateError("");
                      }}
                    />
                  </label>

                  {exactTripLength &&
                    exactTripLength.nights >=
                      1 &&
                    !durationConflict && (
                      <div className="duration2-date-summary">
                        {
                          exactTripLength.days
                        }{" "}
                        DAYS ·{" "}
                        {
                          exactTripLength.nights
                        }{" "}
                        {exactTripLength.nights ===
                        1
                          ? "NIGHT"
                          : "NIGHTS"}
                      </div>
                    )}

                  {/* DURATION CONFLICT */}

                  {durationConflict &&
                    exactTripLength &&
                    suggestedDuration && (
                      <div className="duration2-conflict">

                        <div className="duration2-conflict-kicker">
                          DURATION CHECK
                        </div>

                        <strong>
                          YOUR DATES SPAN{" "}
                          {
                            exactTripLength.nights
                          }{" "}
                          {exactTripLength.nights ===
                          1
                            ? "NIGHT"
                            : "NIGHTS"}
                        </strong>

                        <p>
                          That does not match your{" "}
                          {
                            durationLabels[
                              selectedDuration
                            ].title
                          }{" "}
                          plan. These dates fit{" "}
                          {
                            durationLabels[
                              suggestedDuration
                            ].title
                          }.
                        </p>

                        <div className="duration2-conflict-actions">

                          <button
                            type="button"
                            onClick={
                              useTheseDates
                            }
                          >
                            USE THESE DATES
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDateError("");
                            }}
                          >
                            CHANGE DATES
                          </button>

                        </div>

                      </div>
                    )}

                </div>
              )}

              {/* FLEXIBLE */}

              {timingChoice ===
                "flexible" && (
                <div className="duration2-timing-note">

                  <strong>
                    DATES ARE FLEXIBLE
                  </strong>

                  <span>
                    We&apos;ll use your selected duration as the planning baseline. You can set exact dates later.
                  </span>

                </div>
              )}

              {/* UNDECIDED */}

              {timingChoice ===
                "undecided" && (
                <div className="duration2-timing-note">

                  <strong>
                    NO DATE YET
                  </strong>

                  <span>
                    Keep planning now. Weather will be treated as destination research until your trip dates are set.
                  </span>

                </div>
              )}

              {/* ERROR */}

              {dateError && (
                <div className="duration2-error">
                  {dateError}
                </div>
              )}

            </div>

            {/* CONTINUE */}

            <button
              type="button"
              className="duration2-continue"
              onClick={
                continueToDestination
              }
            >
              CONTINUE →
            </button>

          </div>
        )}

      </section>

      <style jsx>{`
        /*
          These styles extend the existing
          Duration visual system.

          The original cinematic background,
          hotspots, navigation and progress
          remain controlled by the existing
          duration2-* styles.
        */

        .duration2-panel-schedule {
          width: min(920px, calc(100vw - 48px));
          max-width: 920px;
        }

        .duration2-when {
          flex: 1;
          min-width: 0;
          padding: 18px 22px;
          border-left: 1px solid rgba(218, 167, 91, 0.28);
          border-right: 1px solid rgba(218, 167, 91, 0.22);
        }

        .duration2-when-label {
          margin-bottom: 10px;
          color: #e5c18a;
          font-family: Arial, sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .duration2-timing-options {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .duration2-timing-button {
          appearance: none;
          border: 1px solid rgba(229, 193, 138, 0.35);
          background: rgba(20, 17, 13, 0.72);
          color: rgba(245, 232, 209, 0.78);
          padding: 9px 11px;
          cursor: pointer;
          font-family: Arial, sans-serif;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          transition:
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease;
        }

        .duration2-timing-button:hover {
          border-color: rgba(226, 143, 62, 0.9);
          color: #fff2dc;
        }

        .duration2-timing-button.selected {
          border-color: #d77931;
          background: #a64f23;
          color: #fff7e9;
        }

        .duration2-date-area {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 10px;
          align-items: end;
          margin-top: 13px;
        }

        .duration2-date-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .duration2-date-field span {
          color: rgba(232, 207, 168, 0.72);
          font-family: Arial, sans-serif;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .duration2-date-field input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(224, 183, 119, 0.4);
          outline: none;
          background: rgba(15, 13, 10, 0.82);
          color: #f3dfbe;
          padding: 9px 10px;
          color-scheme: dark;
          font-family: Arial, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .duration2-date-field input:focus {
          border-color: #d77931;
          box-shadow: 0 0 0 1px rgba(215, 121, 49, 0.2);
        }

        .duration2-date-arrow {
          padding-bottom: 10px;
          color: rgba(220, 166, 92, 0.65);
          font-size: 14px;
        }

        .duration2-date-summary {
          grid-column: 1 / -1;
          margin-top: 1px;
          color: #dca866;
          font-family: Arial, sans-serif;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .duration2-timing-note {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 12px;
          max-width: 390px;
        }

        .duration2-timing-note strong {
          color: #e0ad6c;
          font-family: Arial, sans-serif;
          font-size: 9px;
          letter-spacing: 0.12em;
        }

        .duration2-timing-note span {
          color: rgba(239, 222, 194, 0.64);
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.45;
        }

        .duration2-conflict {
          grid-column: 1 / -1;
          margin-top: 3px;
          padding: 10px 12px;
          border: 1px solid rgba(206, 129, 60, 0.55);
          background: rgba(67, 37, 19, 0.72);
        }

        .duration2-conflict-kicker {
          margin-bottom: 4px;
          color: #d98945;
          font-family: Arial, sans-serif;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .duration2-conflict strong {
          display: block;
          color: #f1d3a3;
          font-family: Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 0.08em;
        }

        .duration2-conflict p {
          margin: 5px 0 8px;
          color: rgba(241, 221, 188, 0.7);
          font-family: Arial, sans-serif;
          font-size: 9px;
          line-height: 1.45;
        }

        .duration2-conflict-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .duration2-conflict-actions button {
          appearance: none;
          border: 1px solid rgba(225, 169, 93, 0.45);
          background: rgba(18, 15, 11, 0.58);
          color: #e8c38b;
          padding: 7px 9px;
          cursor: pointer;
          font-family: Arial, sans-serif;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .duration2-conflict-actions button:hover {
          border-color: #d77931;
          color: #fff2dc;
        }

        .duration2-error {
          margin-top: 10px;
          color: #e4a06a;
          font-family: Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .duration2-panel-schedule {
            width: calc(100vw - 28px);
            max-height: 72vh;
            overflow-y: auto;
          }

          .duration2-when {
            border-left: 0;
            border-right: 0;
            border-top: 1px solid rgba(218, 167, 91, 0.25);
            border-bottom: 1px solid rgba(218, 167, 91, 0.2);
          }

          .duration2-date-area {
            grid-template-columns: 1fr;
          }

          .duration2-date-arrow {
            display: none;
          }
        }
      `}</style>

    </main>
  );
}
