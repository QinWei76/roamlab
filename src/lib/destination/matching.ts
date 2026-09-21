import type {
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
 * Basic keyword vocabulary.
 *
 * Important:
 * These keywords are used only as textual evidence
 * from real RIDB names/descriptions.
 *
 * They do NOT invent destination attributes.
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

const ACTIVITY_KEYWORDS: Record<
  string,
  string[]
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

function scoreActivities(
  candidate: DestinationCandidate,
  intent?: WildIntent
): {
  score: number;
  matched: boolean;
} {
  const activities =
    intent?.activities?.filter(
      (activity) =>
        activity !== "other"
    ) ?? [];

  if (activities.length === 0) {
    return {
      score: 0,
      matched: false,
    };
  }

  const text =
    getCandidateText(candidate);

  let matches = 0;

  for (const activity of activities) {
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
  };
}

function buildWhyItFits(
  candidate: DestinationCandidate,
  reasons: DestinationMatchReason[]
): string {
  const messages: string[] = [];

  if (reasons.includes("activity")) {
    messages.push(
      "Its recreation information aligns with your activity."
    );
  }

  if (reasons.includes("environment")) {
    messages.push(
      "Its landscape information matches the environment you are looking for."
    );
  }

  if (
    reasons.includes("distance") &&
    typeof candidate.distanceKm === "number"
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
 * because our current RIDB candidate data does not yet
 * contain enough verified information for those claims.
 */
export function matchDestinations(
  input: DestinationMatchInput
): DestinationMatch[] {
  const {
    intent,
    candidates,
  } = input;

  const matches: DestinationMatch[] = [];

  for (const originalCandidate of candidates) {
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

    score += activityResult.score;

    if (activityResult.matched) {
      reasons.push("activity");
    }

    const environmentResult =
      scoreEnvironment(
        candidate,
        intent
      );

    score += environmentResult.score;

    if (environmentResult.matched) {
      reasons.push("environment");
    }

    if (
      typeof candidate.distanceKm ===
      "number"
    ) {
      reasons.push("distance");

      /*
       * Small ranking preference for closer
       * candidates.
       *
       * Distance is not allowed to dominate
       * activity/environment relevance.
       */
      if (candidate.distanceKm <= 50) {
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

    const matchReasons =
      Array.from(
        new Set(reasons)
      );

    matches.push({
      ...candidate,

      matchScore: score,

      matchReasons,

      whyItFits:
        buildWhyItFits(
          candidate,
          matchReasons
        ),
    });
  }

  return matches.sort((a, b) => {
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
      typeof a.distanceKm === "number" &&
      typeof b.distanceKm === "number"
    ) {
      return (
        a.distanceKm -
        b.distanceKm
      );
    }

    return a.name.localeCompare(
      b.name
    );
  });
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
      Math.min(limit, 10)
    );

  return matchDestinations(input)
    .slice(0, safeLimit);
}
