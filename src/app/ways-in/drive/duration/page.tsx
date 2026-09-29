"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PlannerProgress from "@/components/PlannerProgress";

import {
  getOrCreateCurrentWild,
  updateWildDuration,
  updateWildSchedule,
} from "@/lib/wildStore";

/* =========================================================
   TYPES
   ========================================================= */

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

type CalendarTarget =
  | "start"
  | "end"
  | null;

/* =========================================================
   DURATION DATA
   ========================================================= */

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

/* =========================================================
   DATE HELPERS
   ========================================================= */

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const MONTH_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const WEEKDAYS = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

function pad2(
  value: number
) {
  return String(value).padStart(
    2,
    "0"
  );
}

function makeDateKey(
  year: number,
  month: number,
  day: number
) {
  return (
    `${year}-` +
    `${pad2(month + 1)}-` +
    `${pad2(day)}`
  );
}

function parseDateKey(
  value: string
) {
  if (!value) {
    return null;
  }

  const parts =
    value.split("-").map(Number);

  if (
    parts.length !== 3 ||
    !Number.isFinite(parts[0]) ||
    !Number.isFinite(parts[1]) ||
    !Number.isFinite(parts[2])
  ) {
    return null;
  }

  return {
    year: parts[0],
    month: parts[1] - 1,
    day: parts[2],
  };
}

function dateToUtcDay(
  value: string
): number | null {
  const parsed =
    parseDateKey(value);

  if (!parsed) {
    return null;
  }

  return Date.UTC(
    parsed.year,
    parsed.month,
    parsed.day
  );
}

function calculateTripLength(
  startDate: string,
  endDate: string
) {
  const start =
    dateToUtcDay(startDate);

  const end =
    dateToUtcDay(endDate);

  if (
    start === null ||
    end === null ||
    end < start
  ) {
    return null;
  }

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  const nights = Math.round(
    (end - start) /
      millisecondsPerDay
  );

  return {
    days: nights + 1,
    nights,
  };
}

function formatDisplayDate(
  value: string
) {
  const parsed =
    parseDateKey(value);

  if (!parsed) {
    return "CHOOSE DATE";
  }

  return (
    `${MONTH_SHORT[parsed.month]} ` +
    `${parsed.day}, ` +
    `${parsed.year}`
  );
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
  if (
    duration === "overnight"
  ) {
    return nights === 1;
  }

  if (
    duration === "weekend"
  ) {
    return (
      nights >= 2 &&
      nights <= 3
    );
  }

  if (
    duration === "multi-day"
  ) {
    return (
      nights >= 4 &&
      nights <= 7
    );
  }

  return nights >= 8;
}

/* =========================================================
   PAGE
   ========================================================= */

export default function DurationPage() {
  const [
    vehicle,
    setVehicle,
  ] = useState<VehicleKey>("suv");

  const [
    trip,
    setTrip,
  ] = useState<TripKey>("weekend");

  const [
    crew,
    setCrew,
  ] = useState<CrewKey>("solo");

  const [
    people,
    setPeople,
  ] = useState<number>(1);

  const [
    selectedDuration,
    setSelectedDuration,
  ] =
    useState<DurationKey | null>(
      null
    );

  const [
    timingChoice,
    setTimingChoice,
  ] =
    useState<TimingChoice | null>(
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

  const [
    calendarTarget,
    setCalendarTarget,
  ] =
    useState<CalendarTarget>(
      null
    );

  const today = useMemo(
    () => new Date(),
    []
  );

  const [
    calendarYear,
    setCalendarYear,
  ] = useState(
    today.getFullYear()
  );

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState(
    today.getMonth()
  );

  const [
    ready,
    setReady,
  ] = useState(false);

  /* =======================================================
     READ QUERY
     ======================================================= */

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
      vehicleValue ===
        "crossover" ||
      vehicleValue === "city"
    ) {
      setVehicle(
        vehicleValue
      );
    }

    if (
      tripValue === "weekend" ||
      tripValue === "road-trip" ||
      tripValue === "basecamp" ||
      tripValue === "remote"
    ) {
      setTrip(
        tripValue
      );
    }

    if (
      crewValue === "solo" ||
      crewValue === "couple" ||
      crewValue === "family" ||
      crewValue === "friends"
    ) {
      setCrew(
        crewValue
      );
    }

    const parsedPeople =
      Number(
        peopleValue
      );

    if (
      Number.isFinite(
        parsedPeople
      ) &&
      parsedPeople > 0
    ) {
      setPeople(
        parsedPeople
      );
    }

    setReady(true);
  }, []);

  /* =======================================================
     DATE CALCULATION
     ======================================================= */

  const exactTripLength =
    useMemo(() => {
      if (
        !startDate ||
        !endDate
      ) {
        return null;
      }

      return calculateTripLength(
        startDate,
        endDate
      );
    }, [
      startDate,
      endDate,
    ]);

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
    }, [
      exactTripLength,
    ]);

  /* =======================================================
     CALENDAR CELLS
     ======================================================= */

  const calendarDays =
    useMemo(() => {
      const firstDay =
        new Date(
          calendarYear,
          calendarMonth,
          1
        ).getDay();

      const daysInMonth =
        new Date(
          calendarYear,
          calendarMonth + 1,
          0
        ).getDate();

      const cells: Array<
        number | null
      > = [];

      for (
        let i = 0;
        i < firstDay;
        i += 1
      ) {
        cells.push(null);
      }

      for (
        let day = 1;
        day <= daysInMonth;
        day += 1
      ) {
        cells.push(day);
      }

      while (
        cells.length % 7 !== 0
      ) {
        cells.push(null);
      }

      return cells;
    }, [
      calendarYear,
      calendarMonth,
    ]);

  /* =======================================================
     DURATION SELECTION
     ======================================================= */

  const chooseDuration = (
    duration: DurationKey
  ) => {
    setSelectedDuration(
      duration
    );

    setTimingChoice(null);

    setStartDate("");
    setEndDate("");

    setCalendarTarget(null);

    setDateError("");
  };

  const closeSelection =
    () => {
      setSelectedDuration(
        null
      );

      setTimingChoice(null);

      setStartDate("");
      setEndDate("");

      setCalendarTarget(
        null
      );

      setDateError("");
    };

  const chooseTiming = (
    timing: TimingChoice
  ) => {
    setTimingChoice(
      timing
    );

    setCalendarTarget(
      null
    );

    setDateError("");

    if (
      timing !== "exact"
    ) {
      setStartDate("");
      setEndDate("");
    }
  };

  /* =======================================================
     OPEN CALENDAR
     ======================================================= */

  const openCalendar = (
    target: Exclude<
      CalendarTarget,
      null
    >
  ) => {
    const value =
      target === "start"
        ? startDate
        : endDate;

    const fallback =
      target === "end" &&
      startDate
        ? startDate
        : "";

    const parsed =
      parseDateKey(
        value || fallback
      );

    if (parsed) {
      setCalendarYear(
        parsed.year
      );

      setCalendarMonth(
        parsed.month
      );
    } else {
      const now =
        new Date();

      setCalendarYear(
        now.getFullYear()
      );

      setCalendarMonth(
        now.getMonth()
      );
    }

    setCalendarTarget(
      target
    );

    setDateError("");
  };

  /* =======================================================
     CALENDAR NAVIGATION
     ======================================================= */

  const previousMonth =
    () => {
      if (
        calendarMonth === 0
      ) {
        setCalendarMonth(11);

        setCalendarYear(
          (year) =>
            year - 1
        );
      } else {
        setCalendarMonth(
          (month) =>
            month - 1
        );
      }
    };

  const nextMonth =
    () => {
      if (
        calendarMonth === 11
      ) {
        setCalendarMonth(0);

        setCalendarYear(
          (year) =>
            year + 1
        );
      } else {
        setCalendarMonth(
          (month) =>
            month + 1
        );
      }
    };

  /* =======================================================
     SELECT CALENDAR DAY
     ======================================================= */

  const selectCalendarDay = (
    day: number
  ) => {
    if (!calendarTarget) {
      return;
    }

    const value =
      makeDateKey(
        calendarYear,
        calendarMonth,
        day
      );

    if (
      calendarTarget ===
      "start"
    ) {
      setStartDate(
        value
      );

      /*
        If the new start date is
        later than the existing end date,
        clear END instead of creating an
        invalid trip.
      */

      if (
        endDate &&
        dateToUtcDay(
          endDate
        ) !== null &&
        dateToUtcDay(
          value
        ) !== null &&
        (dateToUtcDay(
          endDate
        ) as number) <
          (dateToUtcDay(
            value
          ) as number)
      ) {
        setEndDate("");
      }

      /*
        After choosing START,
        immediately move to END.
      */

      setCalendarTarget(
        "end"
      );

      setDateError("");

      return;
    }

    /*
      END
    */

    if (startDate) {
      const start =
        dateToUtcDay(
          startDate
        );

      const end =
        dateToUtcDay(
          value
        );

      if (
        start !== null &&
        end !== null &&
        end <= start
      ) {
        setDateError(
          "Choose an end date at least one night after your start date."
        );

        return;
      }
    }

    setEndDate(
      value
    );

    setCalendarTarget(
      null
    );

    setDateError("");
  };

  /* =======================================================
     USE DURATION SUGGESTION
     ======================================================= */

  const useTheseDates =
    () => {
      if (
        !suggestedDuration
      ) {
        return;
      }

      setSelectedDuration(
        suggestedDuration
      );

      setDateError("");
    };

  /* =======================================================
     CONTINUE
     ======================================================= */

  const continueToDestination =
    () => {
      if (
        !selectedDuration
      ) {
        return;
      }

      if (
        !timingChoice
      ) {
        setDateError(
          "Choose when you are going before continuing."
        );

        return;
      }

      getOrCreateCurrentWild(
        "My Wild"
      );

      /* ===================================================
         EXACT
         =================================================== */

      if (
        timingChoice ===
        "exact"
      ) {
        if (
          !startDate ||
          !endDate
        ) {
          setDateError(
            "Choose both your start date and end date."
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
            "Your end date must be after your start date."
          );

          return;
        }

        if (
          tripLength.nights < 1
        ) {
          setDateError(
            "Choose an end date at least one night after your start date."
          );

          return;
        }

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
            days:
              tripLength.days,

            nights:
              tripLength.nights,
          }
        );

        updateWildSchedule({
          startDate,

          endDate,

          timingMode:
            "exact",

          flexibleDates:
            false,
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

      /* ===================================================
         FLEXIBLE / UNDECIDED
         =================================================== */

      const defaults =
        durationDefaults[
          selectedDuration
        ];

      updateWildDuration(
        selectedDuration,
        defaults
      );

      if (
        timingChoice ===
        "flexible"
      ) {
        updateWildSchedule({
          startDate:
            undefined,

          endDate:
            undefined,

          timingMode:
            "flexible",

          flexibleDates:
            true,
        });
      } else {
        updateWildSchedule({
          startDate:
            undefined,

          endDate:
            undefined,

          timingMode:
            "undecided",

          flexibleDates:
            false,
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

  /* =======================================================
     LOADING
     ======================================================= */

  if (!ready) {
    return (
      <main className="duration2-page">
        <div className="duration2-loading" />
      </main>
    );
  }

  /* =======================================================
     UI
     ======================================================= */

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

        {/* LOGO */}

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

        {/* MULTI DAY */}

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
          <div
            className={`duration2-panel duration2-panel-schedule ${
              timingChoice ===
              "exact"
                ? "duration2-panel-dates-open"
                : ""
            }`}
          >

            {/* CLOSE */}

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

            {/* SUMMARY */}

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

            {/* WHEN */}

            <div className="duration2-when">

              <div className="duration2-when-label">
                WHEN ARE YOU GOING?
              </div>

              {/* TIMING */}

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

              {/* EXACT */}

              {timingChoice ===
                "exact" && (
                <div className="duration2-date-area">

                  <div className="duration2-date-fields">

                    {/* START */}

                    <div className="duration2-custom-date">

                      <span className="duration2-date-caption">
                        START
                      </span>

                      <button
                        type="button"
                        className={`duration2-date-trigger ${
                          calendarTarget ===
                          "start"
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          openCalendar(
                            "start"
                          )
                        }
                      >
                        <span>
                          {
                            formatDisplayDate(
                              startDate
                            )
                          }
                        </span>

                        <span className="duration2-calendar-icon">
                          ◫
                        </span>
                      </button>

                    </div>

                    <div className="duration2-date-arrow">
                      →
                    </div>

                    {/* END */}

                    <div className="duration2-custom-date">

                      <span className="duration2-date-caption">
                        END
                      </span>

                      <button
                        type="button"
                        className={`duration2-date-trigger ${
                          calendarTarget ===
                          "end"
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          openCalendar(
                            "end"
                          )
                        }
                      >
                        <span>
                          {
                            formatDisplayDate(
                              endDate
                            )
                          }
                        </span>

                        <span className="duration2-calendar-icon">
                          ◫
                        </span>
                      </button>

                    </div>

                  </div>

                  {/* DATE SUMMARY */}

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
                        {
                          exactTripLength.nights ===
                          1
                            ? "NIGHT"
                            : "NIGHTS"
                        }

                      </div>
                    )}

                  {/* CONFLICT */}

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
                          {
                            exactTripLength.nights ===
                            1
                              ? "NIGHT"
                              : "NIGHTS"
                          }
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
                              setCalendarTarget(
                                "start"
                              );

                              setDateError(
                                ""
                              );
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

        {/* =================================================
            CUSTOM CALENDAR
            ================================================= */}

        {selectedDuration &&
          timingChoice ===
            "exact" &&
          calendarTarget && (
            <div className="duration2-calendar-layer">

              <div className="duration2-calendar-paper">

                {/* CALENDAR HEADER */}

                <div className="duration2-calendar-top">

                  <div>
                    <span className="duration2-calendar-kicker">
                      {calendarTarget ===
                      "start"
                        ? "SELECT START DATE"
                        : "SELECT END DATE"}
                    </span>

                    <strong>
                      {
                        MONTH_NAMES[
                          calendarMonth
                        ]
                      }{" "}
                      {calendarYear}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="duration2-calendar-close"
                    onClick={() =>
                      setCalendarTarget(
                        null
                      )
                    }
                    aria-label="Close calendar"
                  >
                    ×
                  </button>

                </div>

                {/* MONTH NAV */}

                <div className="duration2-calendar-nav">

                  <button
                    type="button"
                    onClick={
                      previousMonth
                    }
                    aria-label="Previous month"
                  >
                    ←
                  </button>

                  <span>
                    {
                      MONTH_NAMES[
                        calendarMonth
                      ]
                    }{" "}
                    {calendarYear}
                  </span>

                  <button
                    type="button"
                    onClick={
                      nextMonth
                    }
                    aria-label="Next month"
                  >
                    →
                  </button>

                </div>

                {/* WEEKDAYS */}

                <div className="duration2-calendar-weekdays">

                  {WEEKDAYS.map(
                    (weekday) => (
                      <span
                        key={
                          weekday
                        }
                      >
                        {
                          weekday
                        }
                      </span>
                    )
                  )}

                </div>

                {/* DAYS */}

                <div className="duration2-calendar-grid">

                  {calendarDays.map(
                    (
                      day,
                      index
                    ) => {
                      if (
                        day === null
                      ) {
                        return (
                          <div
                            key={`blank-${index}`}
                            className="duration2-calendar-blank"
                          />
                        );
                      }

                      const key =
                        makeDateKey(
                          calendarYear,
                          calendarMonth,
                          day
                        );

                      const isStart =
                        key ===
                        startDate;

                      const isEnd =
                        key ===
                        endDate;

                      const startUtc =
                        dateToUtcDay(
                          startDate
                        );

                      const currentUtc =
                        dateToUtcDay(
                          key
                        );

                      const disabled =
                        calendarTarget ===
                          "end" &&
                        startUtc !==
                          null &&
                        currentUtc !==
                          null &&
                        currentUtc <=
                          startUtc;

                      const inRange =
                        startDate &&
                        endDate &&
                        dateToUtcDay(
                          key
                        ) !== null &&
                        dateToUtcDay(
                          startDate
                        ) !== null &&
                        dateToUtcDay(
                          endDate
                        ) !== null &&
                        (dateToUtcDay(
                          key
                        ) as number) >
                          (dateToUtcDay(
                            startDate
                          ) as number) &&
                        (dateToUtcDay(
                          key
                        ) as number) <
                          (dateToUtcDay(
                            endDate
                          ) as number);

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={
                            disabled
                          }
                          className={`duration2-calendar-day ${
                            isStart ||
                            isEnd
                              ? "selected"
                              : ""
                          } ${
                            inRange
                              ? "in-range"
                              : ""
                          }`}
                          onClick={() =>
                            selectCalendarDay(
                              day
                            )
                          }
                        >
                          {day}
                        </button>
                      );
                    }
                  )}

                </div>

                {/* FOOTER */}

                <div className="duration2-calendar-footer">

                  <div>
                    <span>
                      START
                    </span>

                    <strong>
                      {
                        formatDisplayDate(
                          startDate
                        )
                      }
                    </strong>
                  </div>

                  <div className="duration2-calendar-footer-arrow">
                    →
                  </div>

                  <div>
                    <span>
                      END
                    </span>

                    <strong>
                      {
                        formatDisplayDate(
                          endDate
                        )
                      }
                    </strong>
                  </div>

                </div>

              </div>

            </div>
          )}

      </section>

      {/* ===================================================
          LOCAL STYLES
          =================================================== */}

      <style jsx>{`

        /* =================================================
           SCHEDULE PANEL
           ================================================= */

        .duration2-panel-schedule {
          width:
            min(
              920px,
              calc(
                100vw - 48px
              )
            );

          max-width:
            920px;

          transition:
            bottom 180ms ease;
        }

        .duration2-panel-dates-open {
          bottom:
            104px !important;
        }

        /* =================================================
           WHEN
           ================================================= */

        .duration2-when {
          flex: 1;

          min-width: 0;

          padding:
            18px 22px;

          border-left:
            1px solid
            rgba(
              218,
              167,
              91,
              0.28
            );

          border-right:
            1px solid
            rgba(
              218,
              167,
              91,
              0.22
            );
        }

        .duration2-when-label {
          margin-bottom:
            10px;

          color:
            #e5c18a;

          font-family:
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            800;

          letter-spacing:
            0.16em;
        }

        /* =================================================
           TIMING
           ================================================= */

        .duration2-timing-options {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;
        }

        .duration2-timing-button {
          appearance:
            none;

          border:
            1px solid
            rgba(
              229,
              193,
              138,
              0.35
            );

          background:
            rgba(
              20,
              17,
              13,
              0.72
            );

          color:
            rgba(
              245,
              232,
              209,
              0.78
            );

          padding:
            9px 11px;

          cursor:
            pointer;

          font-family:
            Arial,
            sans-serif;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.1em;
        }

        .duration2-timing-button:hover {
          border-color:
            rgba(
              226,
              143,
              62,
              0.9
            );

          color:
            #fff2dc;
        }

        .duration2-timing-button.selected {
          border-color:
            #d77931;

          background:
            #a64f23;

          color:
            #fff7e9;
        }

        /* =================================================
           CUSTOM DATE FIELDS
           ================================================= */

        .duration2-date-area {
          margin-top:
            13px;
        }

        .duration2-date-fields {
          display: grid;

          grid-template-columns:
            1fr auto 1fr;

          gap: 10px;

          align-items: end;
        }

        .duration2-custom-date {
          display: flex;

          flex-direction:
            column;

          gap: 5px;
        }

        .duration2-date-caption {
          color:
            rgba(
              232,
              207,
              168,
              0.72
            );

          font-family:
            Arial,
            sans-serif;

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            0.15em;
        }

        .duration2-date-trigger {
          width: 100%;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 12px;

          box-sizing:
            border-box;

          appearance:
            none;

          border:
            1px solid
            rgba(
              224,
              183,
              119,
              0.4
            );

          background:
            rgba(
              15,
              13,
              10,
              0.82
            );

          color:
            #f3dfbe;

          padding:
            10px 12px;

          cursor:
            pointer;

          font-family:
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            800;

          letter-spacing:
            0.04em;

          text-align: left;
        }

        .duration2-date-trigger:hover,
        .duration2-date-trigger.active {
          border-color:
            #d77931;

          box-shadow:
            0 0 0 1px
            rgba(
              215,
              121,
              49,
              0.16
            );
        }

        .duration2-calendar-icon {
          color:
            #c77b3d;

          font-size:
            13px;
        }

        .duration2-date-arrow {
          padding-bottom:
            11px;

          color:
            rgba(
              220,
              166,
              92,
              0.65
            );

          font-size:
            14px;
        }

        .duration2-date-summary {
          margin-top:
            9px;

          color:
            #dca866;

          font-family:
            Arial,
            sans-serif;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.13em;
        }

        /* =================================================
           NOTES
           ================================================= */

        .duration2-timing-note {
          display: flex;

          flex-direction:
            column;

          gap: 4px;

          margin-top:
            12px;

          max-width:
            390px;
        }

        .duration2-timing-note strong {
          color:
            #e0ad6c;

          font-family:
            Arial,
            sans-serif;

          font-size:
            9px;

          letter-spacing:
            0.12em;
        }

        .duration2-timing-note span {
          color:
            rgba(
              239,
              222,
              194,
              0.64
            );

          font-family:
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1.45;
        }

        /* =================================================
           CONFLICT
           ================================================= */

        .duration2-conflict {
          margin-top:
            9px;

          padding:
            10px 12px;

          border:
            1px solid
            rgba(
              206,
              129,
              60,
              0.55
            );

          background:
            rgba(
              67,
              37,
              19,
              0.72
            );
        }

        .duration2-conflict-kicker {
          margin-bottom:
            4px;

          color:
            #d98945;

          font-family:
            Arial,
            sans-serif;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.15em;
        }

        .duration2-conflict strong {
          display: block;

          color:
            #f1d3a3;

          font-family:
            Arial,
            sans-serif;

          font-size:
            10px;

          letter-spacing:
            0.08em;
        }

        .duration2-conflict p {
          margin:
            5px 0 8px;

          color:
            rgba(
              241,
              221,
              188,
              0.7
            );

          font-family:
            Arial,
            sans-serif;

          font-size:
            9px;

          line-height:
            1.45;
        }

        .duration2-conflict-actions {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;
        }

        .duration2-conflict-actions button {
          appearance:
            none;

          border:
            1px solid
            rgba(
              225,
              169,
              93,
              0.45
            );

          background:
            rgba(
              18,
              15,
              11,
              0.58
            );

          color:
            #e8c38b;

          padding:
            7px 9px;

          cursor:
            pointer;

          font-family:
            Arial,
            sans-serif;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.1em;
        }

        .duration2-conflict-actions button:hover {
          border-color:
            #d77931;

          color:
            #fff2dc;
        }

        /* =================================================
           ERROR
           ================================================= */

        .duration2-error {
          margin-top:
            9px;

          color:
            #e4a06a;

          font-family:
            Arial,
            sans-serif;

          font-size:
            9px;

          font-weight:
            700;

          line-height:
            1.4;
        }

        /* =================================================
           CALENDAR LAYER
           ================================================= */

        .duration2-calendar-layer {
          position: fixed;

          z-index: 120;

          inset: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          padding:
            72px 24px 150px;

          box-sizing:
            border-box;

          background:
            rgba(
              8,
              7,
              5,
              0.48
            );

          backdrop-filter:
            blur(2px);
        }

        /* =================================================
           CALENDAR PAPER
           ================================================= */

        .duration2-calendar-paper {
          width:
            min(
              430px,
              calc(
                100vw - 40px
              )
            );

          box-sizing:
            border-box;

          padding:
            20px;

          border:
            1px solid
            rgba(
              91,
              62,
              34,
              0.55
            );

          background:
            linear-gradient(
              145deg,
              #e4cfaa,
              #cdb083
            );

          color:
            #352517;

          box-shadow:
            0 22px 60px
            rgba(
              0,
              0,
              0,
              0.48
            );

          transform:
            rotate(-0.45deg);

          position: relative;
        }

        .duration2-calendar-paper::before {
          content: "";

          position:
            absolute;

          inset: 6px;

          border:
            1px solid
            rgba(
              77,
              52,
              29,
              0.14
            );

          pointer-events:
            none;
        }

        /* =================================================
           CALENDAR TOP
           ================================================= */

        .duration2-calendar-top {
          position:
            relative;

          z-index: 1;

          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 20px;

          padding-bottom:
            14px;

          border-bottom:
            1px solid
            rgba(
              70,
              47,
              25,
              0.35
            );
        }

        .duration2-calendar-top > div {
          display: flex;

          flex-direction:
            column;

          gap: 4px;
        }

        .duration2-calendar-kicker {
          font-family:
            Arial,
            sans-serif;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.16em;

          color:
            #9a5229;
        }

        .duration2-calendar-top strong {
          font-family:
            Georgia,
            serif;

          font-size:
            19px;

          letter-spacing:
            0.04em;
        }

        .duration2-calendar-close {
          appearance:
            none;

          border: 0;

          background:
            transparent;

          color:
            #4b3320;

          cursor:
            pointer;

          font-size:
            23px;

          line-height: 1;
        }

        /* =================================================
           CALENDAR NAV
           ================================================= */

        .duration2-calendar-nav {
          position:
            relative;

          z-index: 1;

          display: grid;

          grid-template-columns:
            38px 1fr 38px;

          align-items:
            center;

          gap: 8px;

          margin-top:
            13px;
        }

        .duration2-calendar-nav span {
          text-align:
            center;

          font-family:
            Arial,
            sans-serif;

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            0.13em;
        }

        .duration2-calendar-nav button {
          appearance:
            none;

          width:
            34px;

          height:
            30px;

          border:
            1px solid
            rgba(
              69,
              46,
              24,
              0.35
            );

          background:
            rgba(
              255,
              246,
              225,
              0.28
            );

          color:
            #4d331f;

          cursor:
            pointer;

          font-weight:
            900;
        }

        /* =================================================
           WEEKDAYS
           ================================================= */

        .duration2-calendar-weekdays {
          position:
            relative;

          z-index: 1;

          display: grid;

          grid-template-columns:
            repeat(
              7,
              1fr
            );

          margin-top:
            15px;

          padding-bottom:
            7px;

          border-bottom:
            1px solid
            rgba(
              72,
              48,
              26,
              0.22
            );
        }

        .duration2-calendar-weekdays span {
          text-align:
            center;

          color:
            rgba(
              59,
              39,
              22,
              0.64
            );

          font-family:
            Arial,
            sans-serif;

          font-size:
            7px;

          font-weight:
            900;

          letter-spacing:
            0.05em;
        }

        /* =================================================
           CALENDAR GRID
           ================================================= */

        .duration2-calendar-grid {
          position:
            relative;

          z-index: 1;

          display: grid;

          grid-template-columns:
            repeat(
              7,
              1fr
            );

          gap: 3px;

          margin-top:
            7px;
        }

        .duration2-calendar-day,
        .duration2-calendar-blank {
          min-height:
            34px;
        }

        .duration2-calendar-day {
          appearance:
            none;

          border:
            1px solid
            transparent;

          background:
            transparent;

          color:
            #392617;

          cursor:
            pointer;

          font-family:
            Arial,
            sans-serif;

          font-size:
            10px;

          font-weight:
            800;
        }

        .duration2-calendar-day:hover:not(:disabled) {
          border-color:
            rgba(
              144,
              79,
              38,
              0.55
            );

          background:
            rgba(
              255,
              247,
              227,
              0.36
            );
        }

        .duration2-calendar-day.in-range {
          background:
            rgba(
              165,
              91,
              44,
              0.11
            );
        }

        .duration2-calendar-day.selected {
          border-color:
            #783b1d;

          background:
            #9c4f25;

          color:
            #fff1d6;

          box-shadow:
            inset 0 0 0 1px
            rgba(
              255,
              223,
              178,
              0.25
            );
        }

        .duration2-calendar-day:disabled {
          opacity:
            0.26;

          cursor:
            not-allowed;
        }

        /* =================================================
           CALENDAR FOOTER
           ================================================= */

        .duration2-calendar-footer {
          position:
            relative;

          z-index: 1;

          display: grid;

          grid-template-columns:
            1fr auto 1fr;

          gap: 12px;

          align-items:
            center;

          margin-top:
            14px;

          padding-top:
            12px;

          border-top:
            1px solid
            rgba(
              70,
              47,
              25,
              0.32
            );
        }

        .duration2-calendar-footer > div:not(
          .duration2-calendar-footer-arrow
        ) {
          display: flex;

          flex-direction:
            column;

          gap: 3px;
        }

        .duration2-calendar-footer span {
          color:
            rgba(
              67,
              44,
              24,
              0.58
            );

          font-family:
            Arial,
            sans-serif;

          font-size:
            7px;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }

        .duration2-calendar-footer strong {
          font-family:
            Arial,
            sans-serif;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.04em;
        }

        .duration2-calendar-footer-arrow {
          color:
            #96512a;

          font-size:
            15px;
        }

        /* =================================================
           MOBILE
           ================================================= */

        @media (
          max-width: 900px
        ) {
          .duration2-panel-schedule {
            width:
              calc(
                100vw - 28px
              );

            max-height:
              72vh;

            overflow-y:
              auto;
          }

          .duration2-panel-dates-open {
            bottom:
              80px !important;
          }

          .duration2-when {
            border-left: 0;

            border-right: 0;

            border-top:
              1px solid
              rgba(
                218,
                167,
                91,
                0.25
              );

            border-bottom:
              1px solid
              rgba(
                218,
                167,
                91,
                0.2
              );
          }

          .duration2-date-fields {
            grid-template-columns:
              1fr;
          }

          .duration2-date-arrow {
            display: none;
          }

          .duration2-calendar-layer {
            align-items:
              flex-start;

            overflow-y:
              auto;

            padding:
              40px 14px 120px;
          }

          .duration2-calendar-paper {
            width:
              min(
                430px,
                calc(
                  100vw - 28px
                )
              );
          }
        }

      `}</style>

    </main>
  );
}
