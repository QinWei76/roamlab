"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getCurrentWild,
  updateWildDestination,
} from "@/lib/wildStore";

import type {
  Wild,
  WildDestination,
  WildEnvironment,
} from "@/types/wild";

/* =========================================================
   TEMPORARY MATCHING PREVIEW DATA

   IMPORTANT:
   These are interface / data-flow preview records.
   They are NOT live destination recommendations.

   Real destination retrieval will replace this layer later.
   ========================================================= */

type DestinationMatch = {
  id: string;

  destination: WildDestination;

  environment: WildEnvironment[];

  activities: string[];

  difficulty: string;

  vibe: string[];

  summary: string;

  reasons: string[];

  travelNote: string;

  conditionsNote: string;

  budgetNote: string;

  riskNote: string;
};

const previewMatches: DestinationMatch[] = [
  {
    id: "mountain-preview",

    destination: {
      name: "Mountain Wild",
      region: "Destination preview",
      environment: ["mountain", "forest"],
    },

    environment: ["mountain", "forest"],

    activities: [
      "hike",
      "camp",
      "backpack",
    ],

    difficulty: "moderate",

    vibe: [
      "quiet",
      "scenic",
      "remote",
      "adventure",
    ],

    summary:
      "A mountain-focused Wild with room for hiking, camp time and quieter terrain.",

    reasons: [
      "Strong fit for mountain and hiking intent.",
      "Can be shaped around a short multi-day Wild.",
      "Works well for quiet or scenic preferences.",
    ],

    travelNote:
      "Travel time will be calculated from your starting point.",

    conditionsNote:
      "Season, weather and elevation still need live destination data.",

    budgetNote:
      "Estimated Wild cost will be calculated after a real destination is selected.",

    riskNote:
      "Terrain, weather and remoteness risks require real route and conditions data.",
  },

  {
    id: "forest-preview",

    destination: {
      name: "Forest Wild",
      region: "Destination preview",
      environment: ["forest"],
    },

    environment: ["forest"],

    activities: [
      "hike",
      "camp",
      "photography",
    ],

    difficulty: "easy",

    vibe: [
      "quiet",
      "relaxed",
      "scenic",
    ],

    summary:
      "A slower forest-based Wild designed around easy access, walking and camp time.",

    reasons: [
      "Good fit for a quieter outdoor experience.",
      "Can support lower-difficulty hiking.",
      "Works well for camping and relaxed exploration.",
    ],

    travelNote:
      "Travel range will be checked against real destination coordinates later.",

    conditionsNote:
      "Rain, temperature and trail conditions require live data.",

    budgetNote:
      "Transport, camping and food costs will be calculated later.",

    riskNote:
      "Local trail, wildlife and weather risks are not yet evaluated.",
  },

  {
    id: "water-preview",

    destination: {
      name: "Water Wild",
      region: "Destination preview",
      environment: ["lake", "river"],
    },

    environment: [
      "lake",
      "river",
    ],

    activities: [
      "paddle",
      "camp",
      "hike",
    ],

    difficulty: "moderate",

    vibe: [
      "scenic",
      "adventure",
      "relaxed",
    ],

    summary:
      "A water-centered Wild that can combine paddling, camping and nearby trails.",

    reasons: [
      "Suitable when water access is part of the Wild.",
      "Can combine paddling with camp or hiking.",
      "Supports scenic and adventure-focused intent.",
    ],

    travelNote:
      "Drive time and launch access will require real map data.",

    conditionsNote:
      "Water conditions, wind and weather are not yet live.",

    budgetNote:
      "Rental, transport and campsite costs will be evaluated later.",

    riskNote:
      "Water safety and local access restrictions require verified data.",
  },
];

/* =========================================================
   SIMPLE PREVIEW RANKING

   This does NOT claim to be the final recommendation engine.

   It only uses the Wild Intent already stored by the user
   to order the preview cards in a sensible way.
   ========================================================= */

function scoreMatch(
  match: DestinationMatch,
  wild: Wild
): number {
  const intent =
    wild.plan.adventure.intent;

  if (!intent) return 0;

  let score = 0;

  const activity =
    intent.activities?.[0];

  const environment =
    intent.environments?.[0];

  const vibe =
    intent.vibes?.[0];

  if (
    activity &&
    activity !== "other" &&
    match.activities.includes(activity)
  ) {
    score += 4;
  }

  if (
    environment &&
    environment !== "not-sure" &&
    match.environment.includes(environment)
  ) {
    score += 4;
  }

  if (
    intent.difficulty &&
    intent.difficulty !== "not-sure" &&
    match.difficulty === intent.difficulty
  ) {
    score += 2;
  }

  if (
    vibe &&
    vibe !== "not-sure" &&
    match.vibe.includes(vibe)
  ) {
    score += 2;
  }

  return score;
}

function formatValue(
  value?: string
): string {
  if (!value) {
    return "Not set";
  }

  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function WildMatchesPage() {
  const router = useRouter();

  const [wild, setWild] =
    useState<Wild | null>(null);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  useEffect(() => {
    const current =
      getCurrentWild();

    setWild(current);
  }, []);

  const rankedMatches =
    useMemo(() => {
      if (!wild) {
        return previewMatches;
      }

      return [...previewMatches]
        .map((match) => ({
          ...match,
          previewScore:
            scoreMatch(
              match,
              wild
            ),
        }))
        .sort(
          (a, b) =>
            b.previewScore -
            a.previewScore
        );
    }, [wild]);

  function selectDestination(
    match: DestinationMatch
  ) {
    setSelectedId(match.id);

    /*
     * TEMPORARY:
     * This proves that a selected destination
     * can be written into the SAME Current Wild.
     *
     * Once live destination retrieval exists,
     * this exact save path can remain.
     */

    updateWildDestination(
      match.destination
    );

    router.push("/wild-plan");
  }

  if (!wild) {
    return (
      <main className="matchesPage">
        <header className="matchesHeader">
          <Link
            href="/"
            className="matchesLogo"
          >
            ROAMLAB
          </Link>
        </header>

        <section className="matchesEmpty">
          <p>NO WILD INTENT FOUND</p>

          <h1>
            Start with what
            <br />
            you want to do.
          </h1>

          <Link href="/start-here/discover">
            BUILD MY WILD →
          </Link>
        </section>

        <PageStyles />
      </main>
    );
  }

  const intent =
    wild.plan.adventure.intent;

  const activity =
    intent?.activities?.[0];

  const environment =
    intent?.environments?.[0];

  const vibe =
    intent?.vibes?.[0];

  return (
    <main className="matchesPage">
      <div className="matchesGlow matchesGlowOne" />
      <div className="matchesGlow matchesGlowTwo" />

      <header className="matchesHeader">
        <Link
          href="/"
          className="matchesLogo"
        >
          ROAMLAB
        </Link>

        <div className="matchesHeaderRight">
          <span>
            DESTINATION DISCOVERY
          </span>

          <Link href="/wild-plan">
            YOUR WILD PLAN
          </Link>
        </div>
      </header>

      <section className="matchesStage">
        <Link
          href="/start-here/discover"
          className="matchesBack"
        >
          ← EDIT WILD INTENT
        </Link>

        <div className="matchesHero">
          <p className="matchesEyebrow">
            MATCHING PREVIEW
          </p>

          <h1>
            Wilds that fit
            <br />
            what you described.
          </h1>

          <p className="matchesLead">
            This preview is testing the
            RoamLab matching flow.
            Live destinations, travel,
            weather and trail data come next.
          </p>
        </div>

        <section className="intentSummary">
          <div className="intentSummaryTop">
            <div>
              <span>
                YOUR WILD INTENT
              </span>

              <strong>
                {intent?.prompt ||
                  "Build from my selected preferences."}
              </strong>
            </div>

            <Link href="/start-here/discover">
              EDIT →
            </Link>
          </div>

          <div className="intentFacts">
            <div>
              <span>ACTIVITY</span>
              <strong>
                {formatValue(
                  activity === "other"
                    ? "not sure"
                    : activity
                )}
              </strong>
            </div>

            <div>
              <span>ENVIRONMENT</span>
              <strong>
                {formatValue(
                  environment
                )}
              </strong>
            </div>

            <div>
              <span>DIFFICULTY</span>
              <strong>
                {formatValue(
                  intent?.difficulty
                )}
              </strong>
            </div>

            <div>
              <span>VIBE</span>
              <strong>
                {formatValue(vibe)}
              </strong>
            </div>

            <div>
              <span>
                STARTING FROM
              </span>

              <strong>
                {intent
                  ?.startingFrom
                  ?.name ||
                  "Not set"}
              </strong>
            </div>

            <div>
              <span>
                TRAVEL RANGE
              </span>

              <strong>
                {intent
                  ?.maxTravelDistanceKm
                  ? `${intent.maxTravelDistanceKm} km`
                  : "Not set"}
              </strong>
            </div>
          </div>
        </section>

        <div className="matchesSectionHeading">
          <div>
            <span>DESTINATION MATCHES</span>

            <h2>
              Three directions
              for this Wild.
            </h2>
          </div>

          <p>
            Preview candidates only —
            not live destination recommendations.
          </p>
        </div>

        <section className="matchesList">
          {rankedMatches.map(
            (match, index) => (
              <article
                className="matchCard"
                key={match.id}
              >
                <div className="matchRank">
                  0{index + 1}
                </div>

                <div className="matchMain">
                  <div className="matchTitleRow">
                    <div>
                      <p>
                        {
                          match.destination
                            .region
                        }
                      </p>

                      <h2>
                        {
                          match.destination
                            .name
                        }
                      </h2>
                    </div>

                    <span className="previewBadge">
                      PREVIEW
                    </span>
                  </div>

                  <p className="matchSummary">
                    {match.summary}
                  </p>

                  <div className="matchTags">
                    {match.environment.map(
                      (item) => (
                        <span key={item}>
                          {formatValue(
                            item
                          )}
                        </span>
                      )
                    )}

                    <span>
                      {formatValue(
                        match.difficulty
                      )}
                    </span>
                  </div>

                  <div className="matchWhy">
                    <span>
                      WHY IT FITS
                    </span>

                    {match.reasons.map(
                      (reason) => (
                        <p key={reason}>
                          {reason}
                        </p>
                      )
                    )}
                  </div>

                  <div className="matchFacts">
                    <div>
                      <span>TRAVEL</span>
                      <p>
                        {
                          match.travelNote
                        }
                      </p>
                    </div>

                    <div>
                      <span>
                        CONDITIONS
                      </span>
                      <p>
                        {
                          match.conditionsNote
                        }
                      </p>
                    </div>

                    <div>
                      <span>
                        WILD COST
                      </span>
                      <p>
                        {
                          match.budgetNote
                        }
                      </p>
                    </div>

                    <div>
                      <span>
                        KEY RISKS
                      </span>
                      <p>
                        {
                          match.riskNote
                        }
                      </p>
                    </div>
                  </div>

                  <div className="matchAction">
                    <div>
                      <span>
                        DESTINATION STATUS
                      </span>

                      <strong>
                        PREVIEW ONLY
                      </strong>
                    </div>

                    <button
                      type="button"
                      disabled={
                        selectedId !== null
                      }
                      onClick={() =>
                        selectDestination(
                          match
                        )
                      }
                    >
                      {selectedId ===
                      match.id
                        ? "ADDING TO MY WILD..."
                        : "USE THIS PREVIEW →"}
                    </button>
                  </div>
                </div>
              </article>
            )
          )}
        </section>

        <section className="liveDataNotice">
          <span>
            NEXT LAYER
          </span>

          <h2>
            Real destination intelligence.
          </h2>

          <p>
            The final matching engine will
            replace these preview records with
            real places and verified context:
            location, travel distance, season,
            weather, terrain, access, rules,
            cost and safety.
          </p>
        </section>
      </section>

      <PageStyles />
    </main>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

function PageStyles() {
  return (
    <style>{`
      .matchesPage {
        position: relative;
        min-height: 100vh;
        overflow: hidden;

        background:
          radial-gradient(
            circle at 78% 14%,
            rgba(132, 94, 45, 0.12),
            transparent 31%
          ),
          radial-gradient(
            circle at 9% 58%,
            rgba(70, 90, 65, 0.08),
            transparent 30%
          ),
          #111512;

        color: #eee8dc;
      }

      .matchesGlow {
        position: fixed;
        pointer-events: none;
        border-radius: 999px;
        filter: blur(100px);
        opacity: 0.12;
      }

      .matchesGlowOne {
        width: 400px;
        height: 400px;
        top: -170px;
        right: 4%;
        background: #a5743b;
      }

      .matchesGlowTwo {
        width: 300px;
        height: 300px;
        bottom: 4%;
        left: -130px;
        background: #66785e;
      }

      .matchesHeader {
        position: relative;
        z-index: 3;

        display: flex;
        align-items: center;
        justify-content:
          space-between;

        padding: 30px 54px;

        border-bottom:
          1px solid
          rgba(
            232,
            217,
            190,
            0.09
          );
      }

      .matchesLogo {
        color: #f3eee4;
        text-decoration: none;

        font-size: 23px;
        font-weight: 800;
        letter-spacing: 3.4px;
      }

      .matchesHeaderRight {
        display: flex;
        align-items: center;
        gap: 34px;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .matchesHeaderRight span {
        color:
          rgba(
            235,
            221,
            195,
            0.36
          );
      }

      .matchesHeaderRight a {
        color:
          rgba(
            235,
            221,
            195,
            0.7
          );

        text-decoration: none;
      }

      .matchesStage {
        position: relative;
        z-index: 2;

        width:
          min(
            1120px,
            calc(100% - 80px)
          );

        margin: 0 auto;

        padding:
          55px 0
          120px;
      }

      .matchesBack {
        color:
          rgba(
            232,
            218,
            192,
            0.45
          );

        text-decoration: none;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .matchesHero {
        margin-top: 78px;
      }

      .matchesEyebrow {
        margin: 0 0 20px;

        color: #b7955c;

        font-size: 10px;
        font-weight: 700;
        letter-spacing: 3px;
      }

      .matchesHero h1 {
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

      .matchesLead {
        max-width: 590px;

        margin: 26px 0 0;

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

      .intentSummary {
        margin-top: 72px;

        border:
          1px solid
          rgba(
            214,
            187,
            137,
            0.16
          );

        background:
          rgba(
            27,
            30,
            24,
            0.6
          );
      }

      .intentSummaryTop {
        display: flex;
        align-items: flex-start;
        justify-content:
          space-between;

        gap: 30px;

        padding: 28px 30px;

        border-bottom:
          1px solid
          rgba(
            225,
            211,
            184,
            0.08
          );
      }

      .intentSummaryTop div {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .intentSummaryTop span,
      .intentFacts span,
      .matchFacts span,
      .matchWhy > span,
      .matchAction span {
        color:
          rgba(
            218,
            193,
            146,
            0.5
          );

        font-size: 8px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .intentSummaryTop strong {
        max-width: 700px;

        color: #eee7da;

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 19px;
        font-weight: 400;
        line-height: 1.5;
      }

      .intentSummaryTop a {
        color:
          rgba(
            234,
            216,
            182,
            0.6
          );

        text-decoration: none;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      .intentFacts {
        display: grid;

        grid-template-columns:
          repeat(
            3,
            minmax(0, 1fr)
          );
      }

      .intentFacts > div {
        min-height: 90px;

        padding: 22px 28px;

        border-right:
          1px solid
          rgba(
            225,
            211,
            184,
            0.07
          );

        border-bottom:
          1px solid
          rgba(
            225,
            211,
            184,
            0.07
          );
      }

      .intentFacts strong {
        display: block;

        margin-top: 10px;

        color:
          rgba(
            239,
            232,
            219,
            0.78
          );

        font-size: 12px;
        font-weight: 600;
      }

      .matchesSectionHeading {
        display: flex;
        align-items: flex-end;
        justify-content:
          space-between;

        gap: 50px;

        margin-top: 95px;
        margin-bottom: 30px;
      }

      .matchesSectionHeading span {
        color: #a98651;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2.4px;
      }

      .matchesSectionHeading h2 {
        margin: 13px 0 0;

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size:
          clamp(
            34px,
            4vw,
            48px
          );

        font-weight: 400;
        line-height: 1.08;
      }

      .matchesSectionHeading > p {
        max-width: 320px;

        margin: 0;

        color:
          rgba(
            235,
            227,
            213,
            0.36
          );

        font-size: 11px;
        line-height: 1.6;
        text-align: right;
      }

      .matchesList {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .matchCard {
        display: grid;

        grid-template-columns:
          74px 1fr;

        border:
          1px solid
          rgba(
            216,
            193,
            150,
            0.15
          );

        background:
          rgba(
            24,
            27,
            22,
            0.58
          );

        transition:
          border-color
          0.18s ease;
      }

      .matchCard:hover {
        border-color:
          rgba(
            207,
            170,
            104,
            0.36
          );
      }

      .matchRank {
        padding-top: 31px;

        border-right:
          1px solid
          rgba(
            216,
            193,
            150,
            0.09
          );

        color:
          rgba(
            199,
            158,
            91,
            0.46
          );

        text-align: center;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .matchMain {
        padding: 30px 32px 32px;
      }

      .matchTitleRow {
        display: flex;
        align-items: flex-start;
        justify-content:
          space-between;

        gap: 25px;
      }

      .matchTitleRow p {
        margin: 0 0 8px;

        color:
          rgba(
            228,
            208,
            170,
            0.43
          );

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.6px;
        text-transform: uppercase;
      }

      .matchTitleRow h2 {
        margin: 0;

        color: #f0e9dc;

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 34px;
        font-weight: 400;
      }

      .previewBadge {
        padding: 7px 9px;

        border:
          1px solid
          rgba(
            194,
            151,
            83,
            0.26
          );

        color:
          rgba(
            214,
            177,
            116,
            0.62
          );

        font-size: 7px;
        font-weight: 700;
        letter-spacing: 1.6px;
      }

      .matchSummary {
        max-width: 700px;

        margin: 20px 0 0;

        color:
          rgba(
            236,
            229,
            215,
            0.57
          );

        font-size: 14px;
        line-height: 1.7;
      }

      .matchTags {
        display: flex;
        flex-wrap: wrap;

        gap: 8px;

        margin-top: 20px;
      }

      .matchTags span {
        padding: 7px 10px;

        border:
          1px solid
          rgba(
            220,
            199,
            160,
            0.13
          );

        color:
          rgba(
            235,
            223,
            202,
            0.5
          );

        font-size: 8px;
        font-weight: 700;
        letter-spacing: 1.2px;
        text-transform: uppercase;
      }

      .matchWhy {
        margin-top: 30px;

        padding-top: 24px;

        border-top:
          1px solid
          rgba(
            225,
            211,
            184,
            0.07
          );
      }

      .matchWhy p {
        position: relative;

        margin:
          12px 0 0;

        padding-left: 15px;

        color:
          rgba(
            237,
            230,
            217,
            0.52
          );

        font-size: 12px;
        line-height: 1.55;
      }

      .matchWhy p::before {
        content: "—";

        position: absolute;
        left: 0;

        color:
          rgba(
            198,
            155,
            87,
            0.45
          );
      }

      .matchFacts {
        display: grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );

        gap: 1px;

        margin-top: 28px;

        background:
          rgba(
            224,
            206,
            173,
            0.06
          );
      }

      .matchFacts > div {
        min-height: 100px;

        padding: 19px 20px;

        background:
          rgba(
            16,
            19,
            15,
            0.86
          );
      }

      .matchFacts p {
        margin: 10px 0 0;

        color:
          rgba(
            236,
            229,
            216,
            0.46
          );

        font-size: 11px;
        line-height: 1.55;
      }

      .matchAction {
        display: flex;
        align-items: center;
        justify-content:
          space-between;

        gap: 25px;

        margin-top: 27px;
      }

      .matchAction > div {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .matchAction strong {
        color:
          rgba(
            235,
            224,
            204,
            0.64
          );

        font-size: 10px;
        letter-spacing: 1.3px;
      }

      .matchAction button {
        padding: 14px 20px;

        border:
          1px solid
          rgba(
            208,
            170,
            103,
            0.46
          );

        background:
          rgba(
            177,
            128,
            59,
            0.11
          );

        color: #f3e8d4;

        cursor: pointer;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.6px;

        transition:
          0.18s ease;
      }

      .matchAction button:hover {
        transform:
          translateY(-2px);

        background:
          rgba(
            177,
            128,
            59,
            0.2
          );

        box-shadow:
          0 0 28px
          rgba(
            177,
            128,
            59,
            0.07
          );
      }

      .matchAction button:disabled {
        cursor: default;
        opacity: 0.55;
        transform: none;
      }

      .liveDataNotice {
        max-width: 700px;

        margin-top: 90px;

        padding-top: 35px;

        border-top:
          1px solid
          rgba(
            225,
            211,
            184,
            0.1
          );
      }

      .liveDataNotice span {
        color: #a98651;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2.4px;
      }

      .liveDataNotice h2 {
        margin: 14px 0 0;

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 34px;
        font-weight: 400;
      }

      .liveDataNotice p {
        margin: 18px 0 0;

        color:
          rgba(
            235,
            227,
            213,
            0.42
          );

        font-size: 13px;
        line-height: 1.7;
      }

      .matchesEmpty {
        width:
          min(
            850px,
            calc(100% - 50px)
          );

        margin: 0 auto;

        padding: 18vh 0;
      }

      .matchesEmpty p {
        color: #a98651;

        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2.4px;
      }

      .matchesEmpty h1 {
        margin: 18px 0 35px;

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size:
          clamp(
            46px,
            6vw,
            74px
          );

        font-weight: 400;
        line-height: 1.04;
      }

      .matchesEmpty a {
        color: #e7d2aa;

        text-decoration: none;

        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      @media (
        max-width: 760px
      ) {
        .matchesHeader {
          padding: 24px;
        }

        .matchesHeaderRight span {
          display: none;
        }

        .matchesStage {
          width:
            calc(
              100% - 40px
            );

          padding-top: 40px;
        }

        .matchesHero {
          margin-top: 55px;
        }

        .matchesHero h1 {
          font-size:
            clamp(
              44px,
              13vw,
              62px
            );

          letter-spacing:
            -1.8px;
        }

        .intentSummary {
          margin-top: 55px;
        }

        .intentSummaryTop {
          flex-direction: column;
        }

        .intentFacts {
          grid-template-columns:
            1fr 1fr;
        }

        .matchesSectionHeading {
          align-items:
            flex-start;

          flex-direction:
            column;
        }

        .matchesSectionHeading > p {
          text-align: left;
        }

        .matchCard {
          grid-template-columns:
            42px 1fr;
        }

        .matchMain {
          padding:
            25px 20px
            27px;
        }

        .matchTitleRow h2 {
          font-size: 29px;
        }

        .matchFacts {
          grid-template-columns:
            1fr;
        }

        .matchAction {
          align-items:
            flex-start;

          flex-direction:
            column;
        }

        .matchAction button {
          width: 100%;
        }
      }
    `}</style>
  );
}
