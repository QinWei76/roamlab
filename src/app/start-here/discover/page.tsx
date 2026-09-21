"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getOrCreateCurrentWild,
  updateWildIntent,
  updateWildActivities,
  updateWildSchedule,
} from "@/lib/wildStore";
import type {
  WildActivity,
  WildDifficulty,
  WildEnvironment,
  WildVibe,
  WildTimingMode,
} from "@/types/wild";

const activityOptions: {
  value: WildActivity;
  label: string;
}[] = [
  { value: "hike", label: "HIKING" },
  { value: "camp", label: "CAMPING" },
  { value: "drive", label: "ROAD TRIP" },
  { value: "paddle", label: "PADDLING" },
];

const environmentOptions: {
  value: WildEnvironment;
  label: string;
}[] = [
  { value: "mountain", label: "MOUNTAIN" },
  { value: "forest", label: "FOREST" },
  { value: "coast", label: "COAST" },
  { value: "lake", label: "LAKE" },
  { value: "desert", label: "DESERT" },
  { value: "not-sure", label: "SURPRISE ME" },
];

const difficultyOptions: {
  value: WildDifficulty;
  label: string;
}[] = [
  { value: "easy", label: "EASY" },
  { value: "moderate", label: "MODERATE" },
  { value: "challenging", label: "CHALLENGING" },
  { value: "not-sure", label: "NOT SURE" },
];

const vibeOptions: {
  value: WildVibe;
  label: string;
}[] = [
  { value: "quiet", label: "QUIET" },
  { value: "scenic", label: "SCENIC" },
  { value: "remote", label: "REMOTE" },
  { value: "adventure", label: "ADVENTURE" },
  { value: "relaxed", label: "RELAXED" },
  { value: "not-sure", label: "OPEN TO IDEAS" },
];

export default function WildDiscoveryPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [activity, setActivity] =
    useState<WildActivity | null>(null);

  const [environment, setEnvironment] =
    useState<WildEnvironment | null>(null);

  const [difficulty, setDifficulty] =
    useState<WildDifficulty | null>(null);

  const [vibe, setVibe] =
    useState<WildVibe | null>(null);

  const [startingFrom, setStartingFrom] =
    useState("");

  const [travelDistance, setTravelDistance] =
    useState("");

  const [timingMode, setTimingMode] =
    useState<WildTimingMode>("undecided");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  useEffect(() => {
    const wild = getOrCreateCurrentWild("My Wild");
    const intent = wild.plan.adventure.intent;
    const schedule = wild.plan.adventure.schedule;

    if (schedule?.timingMode) {
      setTimingMode(schedule.timingMode);
    } else if (schedule?.startDate || schedule?.endDate) {
      setTimingMode(
        schedule.flexibleDates ? "flexible" : "exact"
      );
    }

    if (schedule?.startDate) {
      setStartDate(schedule.startDate);
    }

    if (schedule?.endDate) {
      setEndDate(schedule.endDate);
    }

    if (!intent) return;

    if (intent.prompt) {
      setPrompt(intent.prompt);
    }

    if (intent.activities?.[0]) {
      setActivity(intent.activities[0]);
    }

    if (intent.environments?.[0]) {
      setEnvironment(intent.environments[0]);
    }

    if (intent.difficulty) {
      setDifficulty(intent.difficulty);
    }

    if (intent.vibes?.[0]) {
      setVibe(intent.vibes[0]);
    }

    if (intent.startingFrom?.name) {
      setStartingFrom(intent.startingFrom.name);
    }

    if (intent.maxTravelDistanceKm) {
      setTravelDistance(
        String(intent.maxTravelDistanceKm)
      );
    }
  }, []);

  function saveIntent() {
    getOrCreateCurrentWild("My Wild");

    const distance = Number(travelDistance);

    updateWildIntent({
      destinationMode: "discover",

      prompt:
        prompt.trim() || undefined,

      activities:
        activity ? [activity] : undefined,

      environments:
        environment ? [environment] : undefined,

      difficulty:
        difficulty || undefined,

      vibes:
        vibe ? [vibe] : undefined,

      startingFrom:
        startingFrom.trim()
          ? {
              name: startingFrom.trim(),
            }
          : undefined,

      maxTravelDistanceKm:
        travelDistance.trim() &&
        Number.isFinite(distance) &&
        distance > 0
          ? distance
          : undefined,
    });

    if (activity) {
      updateWildActivities([activity]);
    }

    updateWildSchedule({
      timingMode,
      startDate:
        timingMode === "undecided"
          ? undefined
          : startDate || undefined,
      endDate:
        timingMode === "undecided"
          ? undefined
          : endDate || undefined,
      flexibleDates:
        timingMode === "flexible",
    });

    router.push("/start-here/discover/matches");
  }

  return (
    <main className="discoverPage">
      <div className="discoverGlow discoverGlowOne" />
      <div className="discoverGlow discoverGlowTwo" />

      <header className="discoverHeader">
        <Link href="/" className="discoverLogo">
          ROAMLAB
        </Link>

        <div className="discoverHeaderRight">
          <span>WILD DISCOVERY</span>

          <Link href="/wild-plan">
            YOUR WILD PLAN
          </Link>
        </div>
      </header>

      <section className="discoverStage">
        <Link
          href="/start-here"
          className="discoverBack"
        >
          ← START YOUR WILD
        </Link>

        <div className="discoverHeading">
          <p>HELP ME FIND A WILD</p>

          <h1>
            What kind of Wild
            <br />
            are you looking for?
          </h1>

          <span>
            You do not need to know where yet.
            Tell us what sounds good.
          </span>
        </div>

        <div className="discoverPrompt">
          <label htmlFor="wildPrompt">
            DESCRIBE IT YOUR WAY
          </label>

          <textarea
            id="wildPrompt"
            value={prompt}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
            placeholder="Two days hiking in the mountains. Not too hard, somewhere quiet."
            rows={3}
          />

          <small>
            A sentence is enough. You can also use
            the options below.
          </small>
        </div>

        <section className="discoverSection">
          <div className="discoverSectionTitle">
            <span>01</span>

            <div>
              <p>WHAT DO YOU WANT TO DO?</p>
              <small>
                Choose one starting point.
              </small>
            </div>
          </div>

          <div className="discoverOptions">
            {activityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  activity === option.value
                    ? "discoverOption active"
                    : "discoverOption"
                }
                onClick={() =>
                  setActivity(
                    activity === option.value
                      ? null
                      : option.value
                  )
                }
              >
                {option.label}
              </button>
            ))}

            <button
  type="button"
  className={
    activity === "other"
      ? "discoverOption active"
      : "discoverOption"
  }
  onClick={() =>
    setActivity(
      activity === "other"
        ? null
        : "other"
    )
  }
>
  I&apos;M NOT SURE
</button>
          </div>
        </section>

        <section className="discoverSection">
          <div className="discoverSectionTitle">
            <span>02</span>

            <div>
              <p>WHERE DOES IT FEEL LIKE?</p>
              <small>
                Pick the landscape in your head.
              </small>
            </div>
          </div>

          <div className="discoverOptions">
            {environmentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  environment === option.value
                    ? "discoverOption active"
                    : "discoverOption"
                }
                onClick={() =>
                  setEnvironment(
                    environment === option.value
                      ? null
                      : option.value
                  )
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="discoverSection">
          <div className="discoverSectionTitle">
            <span>03</span>

            <div>
              <p>HOW HARD?</p>
              <small>
                We will use this to avoid poor matches.
              </small>
            </div>
          </div>

          <div className="discoverOptions">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  difficulty === option.value
                    ? "discoverOption active"
                    : "discoverOption"
                }
                onClick={() =>
                  setDifficulty(
                    difficulty === option.value
                      ? null
                      : option.value
                  )
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="discoverSection">
          <div className="discoverSectionTitle">
            <span>04</span>

            <div>
              <p>WHAT KIND OF FEELING?</p>
              <small>
                What matters most this time?
              </small>
            </div>
          </div>

          <div className="discoverOptions">
            {vibeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  vibe === option.value
                    ? "discoverOption active"
                    : "discoverOption"
                }
                onClick={() =>
                  setVibe(
                    vibe === option.value
                      ? null
                      : option.value
                  )
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="discoverSection">
          <div className="discoverSectionTitle">
            <span>05</span>

            <div>
              <p>HOW FAR CAN WE LOOK?</p>
              <small>
                This keeps destination ideas realistic.
              </small>
            </div>
          </div>

          <div className="discoverTravelGrid">
            <div className="discoverField">
              <label htmlFor="startingFrom">
                STARTING FROM
              </label>

              <input
                id="startingFrom"
                type="text"
                value={startingFrom}
                onChange={(event) =>
                  setStartingFrom(
                    event.target.value
                  )
                }
                placeholder="e.g. San Francisco"
              />
            </div>

            <div className="discoverField">
              <label htmlFor="travelDistance">
                MAX TRAVEL DISTANCE
              </label>

              <div className="discoverDistanceInput">
                <input
                  id="travelDistance"
                  type="number"
                  min="1"
                  value={travelDistance}
                  onChange={(event) =>
                    setTravelDistance(
                      event.target.value
                    )
                  }
                  placeholder="300"
                />

                <span>KM</span>
              </div>
            </div>
          </div>
        </section>

        <section className="discoverSection">
          <div className="discoverSectionTitle">
            <span>06</span>

            <div>
              <p>WHEN DO YOU WANT TO GO?</p>
              <small>
                Timing helps us avoid Wilds that do not fit the season.
              </small>
            </div>
          </div>

          <div className="discoverOptions">
            <button
              type="button"
              className={
                timingMode === "exact"
                  ? "discoverOption active"
                  : "discoverOption"
              }
              onClick={() => setTimingMode("exact")}
            >
              EXACT DATES
            </button>

            <button
              type="button"
              className={
                timingMode === "flexible"
                  ? "discoverOption active"
                  : "discoverOption"
              }
              onClick={() => setTimingMode("flexible")}
            >
              FLEXIBLE
            </button>

            <button
              type="button"
              className={
                timingMode === "undecided"
                  ? "discoverOption active"
                  : "discoverOption"
              }
              onClick={() => {
                setTimingMode("undecided");
                setStartDate("");
                setEndDate("");
              }}
            >
              I&apos;M NOT SURE
            </button>
          </div>

          {timingMode !== "undecided" && (
            <div className="discoverTravelGrid discoverDateGrid">
              <div className="discoverField">
                <label htmlFor="startDate">
                  {timingMode === "exact"
                    ? "START DATE"
                    : "EARLIEST DATE"}
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />
              </div>

              <div className="discoverField">
                <label htmlFor="endDate">
                  {timingMode === "exact"
                    ? "END DATE"
                    : "LATEST DATE"}
                </label>

                <input
                  id="endDate"
                  type="date"
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                />
              </div>
            </div>
          )}

          {timingMode === "flexible" && (
            <p className="discoverTimingNote">
              Dates can stay open for now. We will use any range you add
              as a preference, not a fixed commitment.
            </p>
          )}

          {timingMode === "undecided" && (
            <p className="discoverTimingNote">
              No date needed yet. We can still start with the kind of
              Wild you want.
            </p>
          )}
        </section>

        <div className="discoverAction">
          <div>
            <p>DESTINATION</p>
            <strong>NOT DECIDED YET</strong>
          </div>

          <button
            type="button"
            onClick={saveIntent}
          >
            FIND MY WILD →
          </button>
        </div>

        <p className="discoverFootnote">
          Your answers become part of this Wild.
          You can change them later.
        </p>
      </section>

      <style>{`
        .discoverPage {
          position: relative;
          min-height: 100vh;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 76% 18%,
              rgba(121, 91, 48, 0.12),
              transparent 31%
            ),
            radial-gradient(
              circle at 12% 72%,
              rgba(77, 92, 67, 0.09),
              transparent 34%
            ),
            #111512;

          color: #eee8dc;
        }

        .discoverGlow {
          position: fixed;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(90px);
          opacity: 0.14;
        }

        .discoverGlowOne {
          width: 380px;
          height: 380px;
          top: -140px;
          right: 5%;
          background: #a5783f;
        }

        .discoverGlowTwo {
          width: 300px;
          height: 300px;
          left: -120px;
          bottom: 8%;
          background: #66795e;
        }

        .discoverHeader {
          position: relative;
          z-index: 3;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 30px 54px;

          border-bottom:
            1px solid rgba(232, 217, 190, 0.09);
        }

        .discoverLogo {
          color: #f3eee4;
          text-decoration: none;

          font-size: 23px;
          font-weight: 800;
          letter-spacing: 3.4px;
        }

        .discoverHeaderRight {
          display: flex;
          align-items: center;
          gap: 34px;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .discoverHeaderRight span {
          color: rgba(235, 221, 195, 0.36);
        }

        .discoverHeaderRight a {
          color: rgba(235, 221, 195, 0.7);
          text-decoration: none;
        }

        .discoverStage {
          position: relative;
          z-index: 2;

          width: min(1080px, calc(100% - 80px));

          margin: 0 auto;

          padding:
            55px 0
            100px;
        }

        .discoverBack {
          color: rgba(232, 218, 192, 0.45);
          text-decoration: none;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .discoverHeading {
          margin-top: 78px;
        }

        .discoverHeading > p {
          margin: 0 0 20px;

          color: #b7955c;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
        }

        .discoverHeading h1 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              48px,
              6vw,
              78px
            );

          font-weight: 400;
          line-height: 1.02;
          letter-spacing: -2.5px;
        }

        .discoverHeading > span {
          display: block;

          max-width: 530px;

          margin-top: 26px;

          color:
            rgba(
              235,
              229,
              216,
              0.57
            );

          font-size: 15px;
          line-height: 1.7;
        }

        .discoverPrompt {
          max-width: 820px;

          margin-top: 72px;

          padding: 28px 30px 25px;

          border:
            1px solid
            rgba(
              211,
              184,
              132,
              0.18
            );

          background:
            rgba(
              26,
              29,
              23,
              0.62
            );
        }

        .discoverPrompt label,
        .discoverField label {
          display: block;

          margin-bottom: 14px;

          color:
            rgba(
              224,
              202,
              161,
              0.55
            );

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2.2px;
        }

        .discoverPrompt textarea {
          width: 100%;

          resize: vertical;

          border: 0;
          outline: none;

          background: transparent;

          color: #f1ece1;

          font-family: inherit;
          font-size: 18px;
          line-height: 1.6;
        }

        .discoverPrompt textarea::placeholder,
        .discoverField input::placeholder {
          color:
            rgba(
              236,
              229,
              215,
              0.25
            );
        }

        .discoverPrompt small {
          display: block;

          margin-top: 15px;

          color:
            rgba(
              236,
              229,
              215,
              0.34
            );

          font-size: 11px;
        }

        .discoverSection {
          margin-top: 66px;

          padding-top: 34px;

          border-top:
            1px solid
            rgba(
              229,
              215,
              188,
              0.1
            );
        }

        .discoverSectionTitle {
          display: grid;

          grid-template-columns:
            38px 1fr;

          gap: 15px;
        }

        .discoverSectionTitle > span {
          padding-top: 2px;

          color:
            rgba(
              188,
              150,
              89,
              0.55
            );

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .discoverSectionTitle p {
          margin: 0;

          color: #eae3d7;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .discoverSectionTitle small {
          display: block;

          margin-top: 8px;

          color:
            rgba(
              235,
              228,
              214,
              0.38
            );

          font-size: 12px;
        }

        .discoverOptions {
          display: flex;
          flex-wrap: wrap;

          gap: 10px;

          margin-top: 25px;
          margin-left: 53px;
        }

        .discoverOption {
          min-width: 120px;

          padding: 13px 17px;

          border:
            1px solid
            rgba(
              224,
              205,
              170,
              0.15
            );

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );

          color:
            rgba(
              239,
              232,
              219,
              0.62
            );

          cursor: pointer;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;

          transition:
            0.18s ease;
        }

        .discoverOption:hover {
          border-color:
            rgba(
              205,
              168,
              102,
              0.45
            );

          color: #f4ede0;

          background:
            rgba(
              184,
              136,
              66,
              0.06
            );
        }

        .discoverOption.active {
          border-color:
            rgba(
              205,
              168,
              102,
              0.7
            );

          background:
            rgba(
              170,
              124,
              59,
              0.12
            );

          color: #f7ecda;

          box-shadow:
            0 0 24px
            rgba(
              169,
              119,
              51,
              0.07
            );
        }

        .discoverTravelGrid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 18px;

          max-width: 820px;

          margin-top: 25px;
          margin-left: 53px;
        }

        .discoverField {
          padding: 20px 22px;

          border:
            1px solid
            rgba(
              224,
              205,
              170,
              0.14
            );

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );
        }

        .discoverField input {
          width: 100%;

          border: 0;
          outline: none;

          background: transparent;

          color: #f0eadf;

          font-size: 15px;
        }

        .discoverDistanceInput {
          display: grid;

          grid-template-columns:
            1fr auto;

          gap: 15px;

          align-items: center;
        }

        .discoverDistanceInput span {
          color:
            rgba(
              231,
              215,
              185,
              0.42
            );

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .discoverDateGrid {
          margin-top: 22px;
        }

        .discoverField input[type="date"] {
          color-scheme: dark;
        }

        .discoverTimingNote {
          max-width: 820px;
          margin: 16px 0 0 53px;

          color:
            rgba(
              235,
              228,
              214,
              0.38
            );

          font-size: 11px;
          line-height: 1.6;
        }

        .discoverAction {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 30px;

          margin-top: 80px;

          padding-top: 35px;

          border-top:
            1px solid
            rgba(
              229,
              215,
              188,
              0.12
            );
        }

        .discoverAction p {
          margin: 0 0 8px;

          color:
            rgba(
              230,
              211,
              176,
              0.38
            );

          font-size: 8px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .discoverAction strong {
          color:
            rgba(
              239,
              231,
              217,
              0.72
            );

          font-size: 12px;
          letter-spacing: 1.5px;
        }

        .discoverAction button {
          padding: 16px 27px;

          border:
            1px solid
            rgba(
              214,
              180,
              117,
              0.55
            );

          background:
            rgba(
              181,
              132,
              63,
              0.13
            );

          color: #f5ead7;

          cursor: pointer;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;

          transition:
            0.18s ease;
        }

        .discoverAction button:hover {
          transform:
            translateY(-2px);

          background:
            rgba(
              181,
              132,
              63,
              0.22
            );

          box-shadow:
            0 0 30px
            rgba(
              181,
              132,
              63,
              0.08
            );
        }

        .discoverFootnote {
          margin-top: 18px;

          color:
            rgba(
              235,
              227,
              213,
              0.28
            );

          font-size: 10px;
        }

        @media (max-width: 760px) {
          .discoverHeader {
            padding: 24px;
          }

          .discoverHeaderRight span {
            display: none;
          }

          .discoverStage {
            width:
              calc(
                100% - 40px
              );

            padding-top: 40px;
          }

          .discoverHeading {
            margin-top: 55px;
          }

          .discoverHeading h1 {
            font-size:
              clamp(
                44px,
                13vw,
                62px
              );

            letter-spacing:
              -1.8px;
          }

          .discoverPrompt {
            margin-top: 55px;

            padding: 23px 20px;
          }

          .discoverOptions {
            margin-left: 0;
          }

          .discoverTravelGrid {
            grid-template-columns:
              1fr;

            margin-left: 0;
          }

          .discoverTimingNote {
            margin-left: 0;
          }

          .discoverAction {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .discoverAction button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
