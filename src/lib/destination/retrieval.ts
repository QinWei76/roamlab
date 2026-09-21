import type {
  WildActivity,
  WildEnvironment,
  WildIntent,
} from "@/types/wild";

import type {
  DestinationCandidate,
} from "@/lib/destination/types";

import {
  getRidbDestinationCandidates,
} from "@/lib/destination/ridb";

export type DestinationRetrievalOptions = {
  /**
   * Maximum number of RIDB results requested
   * for each retrieval query.
   */
  perQueryLimit?: number;

  /**
   * Maximum size of the final candidate pool
   * after merging and deduplication.
   */
  maxCandidates?: number;
};

export type DestinationRetrievalResult = {
  queries: string[];
  candidates: DestinationCandidate[];
};

const DEFAULT_PER_QUERY_LIMIT = 20;
const DEFAULT_MAX_CANDIDATES = 60;

/**
 * Retrieval vocabulary.
 *
 * These values are used only to FIND potentially
 * relevant real RIDB recreation areas.
 *
 * They are NOT treated as verified destination facts.
 *
 * Final matching still depends on structured evidence
 * and the matching engine.
 */
const ACTIVITY_RETRIEVAL_TERMS: Partial<
  Record<WildActivity, string[]>
> = {
  drive: [
    "scenic drive",
  ],

  camp: [
    "camping",
  ],

  hike: [
    "hiking",
    "trail",
  ],

  backpack: [
    "backpacking",
    "wilderness",
  ],

  bike: [
    "biking",
    "cycling",
  ],

  bikepack: [
    "bikepacking",
  ],

  kayak: [
    "kayaking",
  ],

  canoe: [
    "canoeing",
  ],

  paddle: [
    "paddling",
  ],

  climb: [
    "climbing",
  ],

  fish: [
    "fishing",
  ],

  "trail-run": [
    "trail running",
  ],

  ski: [
    "skiing",
  ],

  snowboard: [
    "snowboarding",
  ],

  snowshoe: [
    "snowshoeing",
  ],

  overland: [
    "off road",
  ],

  beach: [
    "beach",
  ],

  photography: [
    "photography",
    "scenic",
  ],

  wildlife: [
    "wildlife",
  ],

  "family-outdoors": [
    "family recreation",
  ],

  "dog-outdoors": [
    "dog",
  ],
};

const ENVIRONMENT_RETRIEVAL_TERMS: Partial<
  Record<WildEnvironment, string[]>
> = {
  mountain: [
    "mountain",
  ],

  forest: [
    "forest",
  ],

  coast: [
    "coast",
  ],

  desert: [
    "desert",
  ],

  lake: [
    "lake",
  ],

  river: [
    "river",
  ],

  grassland: [
    "grassland",
  ],

  snow: [
    "snow",
  ],
};

/**
 * Normalize a retrieval query so duplicate queries
 * can be removed reliably.
 */
function normalizeQuery(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Add a query only when it is meaningful and has
 * not already been added.
 */
function addQuery(
  queries: string[],
  seen: Set<string>,
  value?: string
): void {
  if (!value) {
    return;
  }

  const normalized =
    normalizeQuery(value);

  if (!normalized) {
    return;
  }

  const key =
    normalized.toLowerCase();

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  queries.push(normalized);
}

/**
 * Build a small set of retrieval queries from
 * Wild Intent.
 *
 * Important:
 *
 * Retrieval queries improve candidate recall.
 * They do NOT prove that a destination actually
 * supports an activity or environment.
 */
export function buildDestinationRetrievalQueries(
  intent?: WildIntent
): string[] {
  const queries: string[] = [];
  const seen =
    new Set<string>();

  if (!intent) {
    return queries;
  }

  const activities =
    intent.activities?.filter(
      (activity) =>
        activity !== "other"
    ) ?? [];

  const environments =
    intent.environments?.filter(
      (environment) =>
        environment !== "not-sure" &&
        environment !== "mixed"
    ) ?? [];

  /**
   * First create combined queries.
   *
   * Example:
   *
   * mountain + hiking
   * → "mountain hiking"
   *
   * This usually produces a more relevant initial
   * candidate set than broad generic searches alone.
   */
  for (const environment of environments) {
    const environmentTerms =
      ENVIRONMENT_RETRIEVAL_TERMS[
        environment
      ] ?? [];

    for (const activity of activities) {
      const activityTerms =
        ACTIVITY_RETRIEVAL_TERMS[
          activity
        ] ?? [];

      const environmentTerm =
        environmentTerms[0];

      const activityTerm =
        activityTerms[0];

      if (
        environmentTerm &&
        activityTerm
      ) {
        addQuery(
          queries,
          seen,
          `${environmentTerm} ${activityTerm}`
        );
      }
    }
  }

  /**
   * Then add activity queries.
   *
   * These broaden recall when a combined query is
   * too narrow.
   */
  for (const activity of activities) {
    const terms =
      ACTIVITY_RETRIEVAL_TERMS[
        activity
      ] ?? [];

    for (const term of terms) {
      addQuery(
        queries,
        seen,
        term
      );
    }
  }

  /**
   * Then add environment queries.
   */
  for (const environment of environments) {
    const terms =
      ENVIRONMENT_RETRIEVAL_TERMS[
        environment
      ] ?? [];

    for (const term of terms) {
      addQuery(
        queries,
        seen,
        term
      );
    }
  }

  /**
   * User free-text intent can also help retrieval.
   *
   * It remains retrieval evidence only.
   */
  addQuery(
    queries,
    seen,
    intent.prompt
  );

  /**
   * Keep the MVP query set deliberately small.
   *
   * We do not want one Wild Intent to generate
   * dozens of RIDB requests.
   */
  return queries.slice(0, 6);
}

/**
 * Stable identity for deduplicating candidates
 * returned by multiple retrieval queries.
 */
function getCandidateKey(
  candidate: DestinationCandidate
): string {
  return [
    candidate.source,
    candidate.sourceId,
  ].join(":");
}

/**
 * Merge candidate groups while preserving the order
 * in which destinations were first discovered.
 */
function mergeCandidateGroups(
  groups: DestinationCandidate[][],
  maxCandidates: number
): DestinationCandidate[] {
  const candidates:
    DestinationCandidate[] = [];

  const seen =
    new Set<string>();

  for (const group of groups) {
    for (const candidate of group) {
      const key =
        getCandidateKey(
          candidate
        );

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      candidates.push(
        candidate
      );

      if (
        candidates.length >=
        maxCandidates
      ) {
        return candidates;
      }
    }
  }

  return candidates;
}

/**
 * Retrieve a relevant pool of real RIDB destination
 * candidates for a Wild Intent.
 *
 * This function does NOT:
 *
 * - score destinations
 * - claim activity support
 * - claim environment support
 * - enrich structured activities
 * - choose final matches
 *
 * Its only job is candidate retrieval.
 */
export async function retrieveDestinationCandidates(
  intent?: WildIntent,
  options?: DestinationRetrievalOptions
): Promise<DestinationRetrievalResult> {
  const perQueryLimit =
    Math.max(
      1,
      Math.min(
        options?.perQueryLimit ??
          DEFAULT_PER_QUERY_LIMIT,
        50
      )
    );

  const maxCandidates =
    Math.max(
      1,
      Math.min(
        options?.maxCandidates ??
          DEFAULT_MAX_CANDIDATES,
        100
      )
    );

  const queries =
    buildDestinationRetrievalQueries(
      intent
    );

  /**
   * If the Intent does not yet contain enough
   * information to build a useful query, fall back
   * to a small generic RIDB candidate set.
   *
   * This keeps the pipeline functional without
   * pretending that the results are personalized.
   */
  if (queries.length === 0) {
    const candidates =
      await getRidbDestinationCandidates({
        limit: Math.min(
          perQueryLimit,
          maxCandidates
        ),
      });

    return {
      queries: [],
      candidates:
        candidates.slice(
          0,
          maxCandidates
        ),
    };
  }

  /**
   * Retrieval queries are independent, so they may
   * run concurrently.
   *
   * buildDestinationRetrievalQueries() caps this at
   * six requests.
   */
  const groups =
    await Promise.all(
      queries.map(
        async (query) => {
          try {
            return await getRidbDestinationCandidates({
              query,
              limit:
                perQueryLimit,
            });
          } catch (error) {
            console.error(
              `RIDB destination retrieval failed for query "${query}":`,
              error
            );

            return [];
          }
        }
      )
    );

  const candidates =
    mergeCandidateGroups(
      groups,
      maxCandidates
    );

  return {
    queries,
    candidates,
  };
}
