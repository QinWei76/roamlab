import type {
  WildActivity,
  WildIntent,
  WildSchedule,
} from "@/types/wild";

import type {
  DestinationCandidate,
  DestinationMatchReason,
} from "@/lib/destination/types";

import {
  calculateRoundedDistanceKm,
} from "@/lib/destination/geo";

export type DestinationMatchInput = {
  intent?: WildIntent;
  schedule?: WildSchedule;
  candidates: DestinationCandidate[];
};

export type DestinationMatch =
  DestinationCandidate & {
    matchScore: number;
    matchReasons: DestinationMatchReason[];
    whyItFits: string;
  };

type ActivityEvidence =
  | "structured"
  | "text"
  | "none";

/**
 * Normalize text so RIDB names/descriptions can be
 * searched consistently.
 */
function normalizeText(
  value?: string
): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Environment matching still uses textual evidence.
 *
 * We do not yet have a verified structured
 * environment source equivalent to RIDB activities.
 */
const ENVIRONMENT_KEYWORDS: Record<
  string,
  string[]
> = {
  mountain: [
    "mountain",
    "mountains",
    "alpine",
    "peak",
    "summit",
    "ridge",
  ],

  forest: [
    "forest",
    "woodland",
    "woods",
    "timber",
  ],

  coast: [
    "coast",
    "coastal",
    "beach",
    "ocean",
    "seashore",
    "shore",
  ],

  desert: [
    "desert",
    "dune",
    "dunes",
    "canyon",
  ],

  lake: [
    "lake",
    "reservoir",
  ],

  river: [
    "river",
    "creek",
    "stream",
  ],

  grassland: [
    "grassland",
    "prairie",
    "meadow",
  ],

  snow: [
    "snow",
    "snowfield",
    "winter",
  ],
};

/**
 * Activity keywords are fallback evidence only.
 *
 * If a candidate has been enriched with RIDB
 * structured activities, these keywords are NOT used.
 */
const ACTIVITY_KEYWORDS: Partial<
  Record<WildActivity, string[]>
> = {
  drive: [
    "scenic drive",
    "auto tour",
    "road",
  ],

  camp: [
    "camp",
    "camping",
    "campground",
  ],

  hike: [
    "hike",
    "hiking",
    "trail",
    "walking",
  ],

  backpack: [
    "backpack",
    "backpacking",
    "wilderness",
  ],

  bike: [
    "bike",
    "biking",
    "bicycle",
    "cycling",
  ],

  bikepack: [
    "bikepacking",
    "cycling",
  ],

  kayak: [
    "kayak",
    "kayaking",
  ],

  canoe: [
    "canoe",
    "canoeing",
  ],

  paddle: [
    "paddle",
    "paddling",
  ],

  climb: [
    "climb",
    "climbing",
  ],

  fish: [
    "fish",
    "fishing",
    "angling",
  ],

  "trail-run": [
    "trail running",
    "running",
  ],

  ski: [
    "ski",
    "skiing",
  ],

  snowboard: [
    "snowboard",
    "snowboarding",
  ],

  snowshoe: [
    "snowshoe",
    "snowshoeing",
  ],

  overland: [
    "off-road",
    "off road",
    "backcountry",
    "overland",
  ],

  beach: [
    "beach",
    "shore",
    "coast",
  ],

  photography: [
    "photography",
    "scenic",
    "viewpoint",
    "overlook",
  ],

  wildlife: [
    "wildlife",
    "bird",
    "habitat",
    "refuge",
  ],

  "family-outdoors": [
    "family",
    "visitor center",
    "picnic",
  ],

  "dog-outdoors": [
    "dog",
    "pet",
  ],
};

function containsAnyKeyword(
  text: string,
  keywords: string[]
): boolean {
  return keywords.some((keyword) =>
    text.includes(keyword)
  );
}

function getCandidateText(
  candidate: DestinationCandidate
): string {
  return normalizeText(
    [
      candidate.name,
      candidate.description,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

/**
 * Add distance when the user's origin already has
 * real coordinates.
 *
 * If coordinates are unavailable, distance is simply
 * not used. Matching must still continue.
 */
function applyDistance(
  candidate: DestinationCandidate,
  intent?: WildIntent
): DestinationCandidate | null {
  const origin =
    intent?.startingFrom?.coordinates;

  if (!origin) {
    return candidate;
  }

  const distanceKm =
    calculateRoundedDistanceKm(
      {
        latitude: origin.latitude,
        longitude: origin.longitude,
      },
      {
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      }
    );

  const maxDistance =
    intent?.maxTravelDistanceKm;

  if (
    typeof maxDistance === "number" &&
    maxDistance >= 0 &&
    distanceKm > maxDistance
  ) {
    return null;
  }

  return {
    ...candidate,
    distanceKm,
  };
}

function scoreEnvironment(
  candidate: DestinationCandidate,
  intent?: WildIntent
): {
  score: number;
  matched: boolean;
} {
  const environments =
    intent?.environments?.filter(
      (environment) =>
        environment !== "not-sure" &&
        environment !== "mixed"
    ) ?? [];

  if (environments.length === 0) {
    return {
      score: 0,
      matched: false,
    };
  }

  const text =
    getCandidateText(candidate);

  let matches = 0;

  for (const environment of environments) {
    const keywords =
      ENVIRONMENT_KEYWORDS[environment];

    if (
      keywords &&
      containsAnyKeyword(
        text,
        keywords
      )
    ) {
      matches += 1;
    }
  }

  return {
    score: matches * 25,
    matched: matches > 0,
  };
}

/**
 * Match requested activities against verified
 * structured activity data when available.
 *
 * Important distinction:
 *
 * activities === undefined
 * → candidate has not been enriched
 * → textual fallback is allowed
 *
 * activities === []
 * → candidate has been enriched but RIDB returned
 *   no activity that maps to RoamLab
 * → textual fallback is NOT allowed
 *
 * activities.length > 0
 * → use structured activity evidence only
 */
function scoreActivities(
  candidate: DestinationCandidate,
  intent?: WildIntent
): {
  score: number;
  matched: boolean;
  evidence: ActivityEvidence;
} {
  const requestedActivities =
    intent?.activities?.filter(
      (activity) =>
        activity !== "other"
    ) ?? [];

  if (
    requestedActivities.length === 0
  ) {
    return {
      score: 0,
      matched: false,
      evidence: "none",
    };
  }

  /**
   * Structured evidence exists.
   *
   * This includes an empty array.
   */
  if (
    candidate.activities !== undefined
  ) {
    let matches = 0;

    for (
      const activity of requestedActivities
    ) {
      if (
        candidate.activities.includes(
          activity
        )
      ) {
        matches += 1;
      }
    }

    return {
      score: matches * 30,
      matched: matches > 0,
      evidence: "structured",
    };
  }

  /**
   * No structured activity evidence exists yet.
   *
   * Only now do we fall back to textual evidence.
   */
  const text =
    getCandidateText(candidate);

  let matches = 0;

  for (
    const activity of requestedActivities
  ) {
    const keywords =
      ACTIVITY_KEYWORDS[activity];

    if (
      keywords &&
      containsAnyKeyword(
        text,
        keywords
      )
    ) {
      matches += 1;
    }
  }

  return {
    score: matches * 30,
    matched: matches > 0,
    evidence:
      matches > 0
        ? "text"
        : "none",
  };
}

function buildWhyItFits(
  candidate: DestinationCandidate,
  reasons: DestinationMatchReason[],
  activityEvidence: ActivityEvidence
): string {
  const messages: string[] = [];

  if (reasons.includes("activity")) {
    if (
      activityEvidence ===
      "structured"
    ) {
      messages.push(
        "Verified recreation activity data matches what you want to do."
      );
    } else {
      messages.push(
        "Its recreation information suggests a match for your activity."
      );
    }
  }

  if (
    reasons.includes(
      "environment"
    )
  ) {
    messages.push(
      "Its landscape information matches the environment you are looking for."
    );
  }

  if (
    reasons.includes("distance") &&
    typeof candidate.distanceKm ===
      "number"
  ) {
    messages.push(
      `It is about ${candidate.distanceKm} km from your starting point.`
    );
  }

  if (messages.length === 0) {
    return (
      "This is a real recreation area candidate. " +
      "More destination data is needed before RoamLab can explain a stronger match."
    );
  }

  return messages.join(" ");
}

/**
 * Match real destination candidates against a Wild Intent.
 *
 * V1 intentionally does NOT score:
 *
 * - difficulty
 * - vibe
 * - season
 * - exact date suitability
 *
 * because our current destination data does not yet
 * contain enough verified information for those claims.
 */
export function matchDestinations(
  input: DestinationMatchInput
): DestinationMatch[] {
  const {
    intent,
    candidates,
  } = input;

  const matches:
    DestinationMatch[] = [];

  for (
    const originalCandidate of candidates
  ) {
    const candidate =
      applyDistance(
        originalCandidate,
        intent
      );

    if (!candidate) {
      continue;
    }

    let score = 0;

    const reasons:
      DestinationMatchReason[] = [];

    const activityResult =
      scoreActivities(
        candidate,
        intent
      );

    score +=
      activityResult.score;

    if (
      activityResult.matched
    ) {
      reasons.push(
        "activity"
      );
    }

    const environmentResult =
      scoreEnvironment(
        candidate,
        intent
      );

    score +=
      environmentResult.score;

    if (
      environmentResult.matched
    ) {
      reasons.push(
        "environment"
      );
    }

    if (
      typeof candidate.distanceKm ===
        "number"
    ) {
      reasons.push("distance");

      const maxDistance =
        intent?.maxTravelDistanceKm;

      /**
       * Travel practicality score.
       *
       * When the user has selected a travel range,
       * distance is scored relative to that range.
       *
       * Example with a 500 km range:
       *
       * 0 km   → +15
       * 100 km → +12
       * 250 km → about +8
       * 400 km → +3
       * 500 km → +0
       *
       * Activity and environment remain the
       * primary relevance signals.
       */
      if (
        typeof maxDistance === "number" &&
        maxDistance > 0
      ) {
        const distanceRatio =
          Math.min(
            candidate.distanceKm /
              maxDistance,
            1
          );

        const distanceScore =
          Math.round(
            (1 - distanceRatio) * 15
          );

        score += distanceScore;
      } else {
        /**
         * No user-selected travel range.
         *
         * Keep the original small proximity
         * preference as a fallback.
         */
        if (
          candidate.distanceKm <= 50
        ) {
          score += 10;
        } else if (
          candidate.distanceKm <= 150
        ) {
          score += 7;
        } else if (
          candidate.distanceKm <= 300
        ) {
          score += 4;
        } else {
          score += 1;
        }
      }
    }

    const matchReasons =
      Array.from(
        new Set(reasons)
      );

    matches.push({
      ...candidate,

      matchScore:
        score,

      matchReasons,

      whyItFits:
        buildWhyItFits(
          candidate,
          matchReasons,
          activityResult.evidence
        ),
    });
  }

  return matches.sort(
    (a, b) => {
      if (
        b.matchScore !==
        a.matchScore
      ) {
        return (
          b.matchScore -
          a.matchScore
        );
      }

      if (
        typeof a.distanceKm ===
          "number" &&
        typeof b.distanceKm ===
          "number"
      ) {
        return (
          a.distanceKm -
          b.distanceKm
        );
      }

      return a.name.localeCompare(
        b.name
      );
    }
  );
}

/**
 * Convenience helper for the destination discovery UI.
 */
export function getTopDestinationMatches(
  input: DestinationMatchInput,
  limit = 5
): DestinationMatch[] {
  const safeLimit =
    Math.max(
      1,
      Math.min(
        limit,
        10
      )
    );

  return matchDestinations(
    input
  ).slice(
    0,
    safeLimit
  );
}
