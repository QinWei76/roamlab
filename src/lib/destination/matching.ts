import type {
  WildActivity,
  WildIntent,
  WildSchedule,
} from "@/types/wild";

import type {
  DestinationCandidate,
  DestinationEnvironmentEvidence,
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
 * Normalize text so RIDB names/descriptions can
 * be searched consistently.
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
 * Environment evidence vocabulary.
 *
 * These signals are intentionally conservative.
 *
 * We only record low-ambiguity landscape signals
 * as derived evidence.
 *
 * Example:
 *
 * "mountain"
 * → safe mountain signal
 *
 * "canyon"
 * → NOT automatically treated as mountain/desert
 *
 * This prevents RoamLab from turning a loose
 * heuristic into an apparent factual claim.
 */
const ENVIRONMENT_EVIDENCE_KEYWORDS: Record<
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
    "ocean",
    "seashore",
  ],

  desert: [
    "desert",
    "dune",
    "dunes",
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
  ],
};

/**
 * Activity keywords are fallback evidence only.
 *
 * If a candidate has already been enriched with
 * RIDB structured activities, these keywords
 * are NOT used.
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
  return keywords.some(
    (keyword) =>
      text.includes(keyword)
  );
}

/**
 * Find the first explicit textual signal.
 *
 * We keep the actual matched signal so the
 * evidence layer can explain what caused the
 * environment classification.
 */
function findFirstKeyword(
  text: string,
  keywords: string[]
): string | undefined {
  return keywords.find(
    (keyword) =>
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
 * Calculate geographic distance from the
 * user's starting point.
 *
 * Candidates outside the selected travel
 * range are removed.
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
        latitude:
          origin.latitude,

        longitude:
          origin.longitude,
      },
      {
        latitude:
          candidate.latitude,

        longitude:
          candidate.longitude,
      }
    );

  const maxDistance =
    intent?.maxTravelDistanceKm;

  if (
    typeof maxDistance ===
      "number" &&
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

/**
 * Match requested environments against
 * explicit landscape signals found in the
 * provider's destination name / description.
 *
 * Environment evidence is DERIVED rather
 * than VERIFIED because RIDB currently does
 * not provide us with a structured environment
 * taxonomy equivalent to structured activities.
 */
function scoreEnvironment(
  candidate: DestinationCandidate,
  intent?: WildIntent
): {
  score: number;
  matched: boolean;
  evidence:
    DestinationEnvironmentEvidence[];
} {
  const environments =
    intent?.environments?.filter(
      (environment) =>
        environment !==
          "not-sure" &&
        environment !==
          "mixed"
    ) ?? [];

  if (
    environments.length === 0
  ) {
    return {
      score: 0,
      matched: false,
      evidence: [],
    };
  }

  const text =
    getCandidateText(candidate);

  let matches = 0;

  const evidence:
    DestinationEnvironmentEvidence[] =
      [];

  for (
    const environment of environments
  ) {
    const keywords =
      ENVIRONMENT_EVIDENCE_KEYWORDS[
        environment
      ];

    if (!keywords) {
      continue;
    }

    const signal =
      findFirstKeyword(
        text,
        keywords
      );

    if (!signal) {
      continue;
    }

    matches += 1;

    evidence.push({
      environment,
      type: "derived",
      source:
        candidate.source,
      signal,
    });
  }

  return {
    score:
      matches * 25,

    matched:
      matches > 0,

    evidence,
  };
}

/**
 * Match requested activities against verified
 * structured activity data when available.
 *
 * Important distinction:
 *
 * activities === undefined
 *
 * Candidate has not been enriched.
 * Textual fallback is allowed.
 *
 * activities === []
 *
 * Candidate WAS enriched but RIDB returned
 * no activity that maps to RoamLab.
 * Textual fallback is NOT allowed.
 *
 * activities.length > 0
 *
 * Use structured activity evidence only.
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
   * This intentionally includes [].
   */
  if (
    candidate.activities !==
    undefined
  ) {
    let matches = 0;

    for (
      const activity of
        requestedActivities
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
      score:
        matches * 30,

      matched:
        matches > 0,

      evidence:
        "structured",
    };
  }

  /**
   * No structured activity evidence
   * exists yet.
   *
   * Only now may RoamLab use textual
   * fallback evidence.
   */
  const text =
    getCandidateText(candidate);

  let matches = 0;

  for (
    const activity of
      requestedActivities
  ) {
    const keywords =
      ACTIVITY_KEYWORDS[
        activity
      ];

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
    score:
      matches * 30,

    matched:
      matches > 0,

    evidence:
      matches > 0
        ? "text"
        : "none",
  };
}

/**
 * Human-readable explanation.
 *
 * This remains intentionally conservative.
 * The richer evidence UI will later use the
 * structured evidence object directly.
 */
function buildWhyItFits(
  candidate: DestinationCandidate,
  reasons: DestinationMatchReason[],
  activityEvidence: ActivityEvidence
): string {
  const messages: string[] = [];

  if (
    reasons.includes(
      "activity"
    )
  ) {
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
    reasons.includes(
      "distance"
    ) &&
    typeof candidate.distanceKm ===
      "number"
  ) {
    messages.push(
      `It is about ${candidate.distanceKm} km from your starting point.`
    );
  }

  if (
    messages.length === 0
  ) {
    return (
      "This is a real recreation area candidate. " +
      "More destination data is needed before RoamLab can explain a stronger match."
    );
  }

  return messages.join(" ");
}

/**
 * Match real destination candidates
 * against a Wild Intent.
 *
 * V1 intentionally does NOT score:
 *
 * - difficulty
 * - vibe
 * - season
 * - exact date suitability
 *
 * because our current destination data
 * does not yet contain enough verified
 * information for those claims.
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
    const originalCandidate of
      candidates
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
      DestinationMatchReason[] =
        [];

    /**
     * ACTIVITY
     */
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

    /**
     * ENVIRONMENT
     */
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

    /**
     * DISTANCE
     */
    if (
      typeof candidate.distanceKm ===
        "number"
    ) {
      reasons.push(
        "distance"
      );

      const maxDistance =
        intent
          ?.maxTravelDistanceKm;

      /**
       * Travel practicality score.
       *
       * When the user has selected a travel
       * range, score distance relative to
       * that range.
       *
       * Example with 500 km:
       *
       * 0 km   → +15
       * 100 km → +12
       * 250 km → about +8
       * 400 km → +3
       * 500 km → +0
       *
       * Activity and environment remain
       * the primary relevance signals.
       */
      if (
        typeof maxDistance ===
          "number" &&
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
            (1 - distanceRatio) *
              15
          );

        score +=
          distanceScore;
      } else {
        /**
         * No user-selected travel range.
         *
         * Keep the original small generic
         * proximity preference.
         */
        if (
          candidate.distanceKm <=
          50
        ) {
          score += 10;
        } else if (
          candidate.distanceKm <=
          150
        ) {
          score += 7;
        } else if (
          candidate.distanceKm <=
          300
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

    /**
     * Merge evidence rather than replacing it.
     *
     * Activity evidence was already created
     * during RIDB enrichment.
     *
     * Environment evidence is created here
     * from conservative textual signals.
     */
    const evidence = {
      ...candidate.evidence,

      environments:
        environmentResult.evidence,
    };

    matches.push({
      ...candidate,

      evidence,

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
      /**
       * Primary:
       * overall relevance score.
       */
      if (
        b.matchScore !==
        a.matchScore
      ) {
        return (
          b.matchScore -
          a.matchScore
        );
      }

      /**
       * Secondary:
       * closer destination.
       */
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

      /**
       * Stable final fallback.
       */
      return a.name.localeCompare(
        b.name
      );
    }
  );
}

/**
 * Convenience helper for the
 * destination discovery UI.
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
