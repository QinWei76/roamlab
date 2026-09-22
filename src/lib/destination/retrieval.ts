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

import {
  calculateRoundedDistanceKm,
  isValidGeoPoint,
} from "@/lib/destination/geo";

export type DestinationRetrievalOptions = {
  /**
   * Maximum number of RIDB results requested
   * for each retrieval page.
   */
  perQueryLimit?: number;

  /**
   * Maximum size of the final candidate pool.
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
 * When we know where the Wild starts,
 * search deeper into RIDB before applying
 * RoamLab's geographic filter.
 *
 * RIDB currently allows at most 50 results
 * per request in our provider wrapper.
 */
const GEO_PAGE_SIZE = 50;

/**
 * Number of RIDB pages checked for each
 * retrieval query when geographic intent
 * is available.
 *
 * 3 pages × 50 = up to 150 raw records
 * per query before deduplication.
 */
const GEO_PAGE_COUNT = 3;

const ACTIVITY_RETRIEVAL_TERMS: Partial<
  Record<WildActivity, string[]>
> = {
  drive: ["scenic drive"],
  camp: ["camping"],
  hike: ["hiking", "trail"],
  backpack: [
    "backpacking",
    "wilderness",
  ],
  bike: ["biking", "cycling"],
  bikepack: ["bikepacking"],
  kayak: ["kayaking"],
  canoe: ["canoeing"],
  paddle: ["paddling"],
  climb: ["climbing"],
  fish: ["fishing"],
  "trail-run": ["trail running"],
  ski: ["skiing"],
  snowboard: ["snowboarding"],
  snowshoe: ["snowshoeing"],
  overland: ["off road"],
  beach: ["beach"],
  photography: [
    "photography",
    "scenic",
  ],
  wildlife: ["wildlife"],
  "family-outdoors": [
    "family recreation",
  ],
  "dog-outdoors": ["dog"],
};

const ENVIRONMENT_RETRIEVAL_TERMS: Partial<
  Record<WildEnvironment, string[]>
> = {
  mountain: ["mountain"],
  forest: ["forest"],
  coast: ["coast"],
  desert: ["desert"],
  lake: ["lake"],
  river: ["river"],
  grassland: ["grassland"],
  snow: ["snow"],
};

function normalizeQuery(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

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

export function buildDestinationRetrievalQueries(
  intent?: WildIntent
): string[] {
  const queries: string[] = [];
  const seen = new Set<string>();

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
   * Most specific queries first.
   *
   * Example:
   * mountain + hiking
   * → "mountain hiking"
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

  addQuery(
    queries,
    seen,
    intent.prompt
  );

  return queries.slice(0, 6);
}

function getCandidateKey(
  candidate: DestinationCandidate
): string {
  return [
    candidate.source,
    candidate.sourceId,
  ].join(":");
}

/**
 * Deduplicate without truncating.
 *
 * Geographic retrieval needs to see the
 * complete retrieved pool before deciding
 * which candidates should survive.
 */
function deduplicateCandidateGroups(
  groups: DestinationCandidate[][]
): DestinationCandidate[] {
  const candidates:
    DestinationCandidate[] = [];

  const seen = new Set<string>();

  for (const group of groups) {
    for (const candidate of group) {
      const key =
        getCandidateKey(candidate);

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      candidates.push(candidate);
    }
  }

  return candidates;
}

/**
 * Determine whether this Wild has enough
 * geographic information for retrieval-time
 * distance filtering.
 */
function hasGeographicIntent(
  intent?: WildIntent
): boolean {
  const coordinates =
    intent?.startingFrom?.coordinates;

  const maxDistance =
    intent?.maxTravelDistanceKm;

  if (
    !coordinates ||
    typeof maxDistance !== "number" ||
    !Number.isFinite(maxDistance) ||
    maxDistance < 0
  ) {
    return false;
  }

  return isValidGeoPoint({
    latitude:
      coordinates.latitude,
    longitude:
      coordinates.longitude,
  });
}

/**
 * Keep only candidates inside the user's
 * geographic range.
 *
 * This is retrieval filtering only.
 *
 * matching.ts still performs the final
 * authoritative distance check.
 */
function filterCandidatesByDistance(
  candidates: DestinationCandidate[],
  intent: WildIntent
): DestinationCandidate[] {
  const origin =
    intent.startingFrom?.coordinates;

  const maxDistance =
    intent.maxTravelDistanceKm;

  if (
    !origin ||
    typeof maxDistance !== "number"
  ) {
    return candidates;
  }

  const filteredCandidates:
    DestinationCandidate[] = [];

  for (const candidate of candidates) {
    const destination = {
      latitude: candidate.latitude,
      longitude: candidate.longitude,
    };

    if (
      !isValidGeoPoint(destination)
    ) {
      continue;
    }

    const distanceKm =
      calculateRoundedDistanceKm(
        {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
        destination
      );

    if (
      distanceKm > maxDistance
    ) {
      continue;
    }

    filteredCandidates.push({
      ...candidate,
      distanceKm,
    });
  }

  filteredCandidates.sort(
    (a, b) =>
      (a.distanceKm ??
        Number.POSITIVE_INFINITY) -
      (b.distanceKm ??
        Number.POSITIVE_INFINITY)
  );

  return filteredCandidates;
}
/**
 * Retrieve several pages for one RIDB query.
 *
 * We only do this when Starting From + Travel
 * Range are available.
 */
async function retrieveGeoAwareQuery(
  query: string
): Promise<DestinationCandidate[]> {
  const pages =
    await Promise.all(
      Array.from(
        {
          length: GEO_PAGE_COUNT,
        },
        (_, index) => {
          return getRidbDestinationCandidates({
            query,
            limit: GEO_PAGE_SIZE,
            offset:
              index *
              GEO_PAGE_SIZE,
          });
        }
      )
    );

  return deduplicateCandidateGroups(
    pages
  );
}

/**
 * Retrieve a relevant pool of real RIDB
 * destination candidates.
 *
 * When Starting From + Travel Range exist,
 * retrieval searches deeper and applies
 * geographic filtering BEFORE the expensive
 * activity enrichment stage.
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

  const useGeoRetrieval =
    hasGeographicIntent(intent);

  /**
   * Generic fallback when there is not yet
   * enough Intent to build retrieval queries.
   */
  if (queries.length === 0) {
    const candidates =
      await getRidbDestinationCandidates({
        limit: Math.min(
          useGeoRetrieval
            ? GEO_PAGE_SIZE
            : perQueryLimit,
          50
        ),
      });

    const filtered =
      useGeoRetrieval && intent
        ? filterCandidatesByDistance(
            candidates,
            intent
          )
        : candidates;

    return {
      queries: [],
      candidates:
        filtered.slice(
          0,
          maxCandidates
        ),
    };
  }

  /**
   * Geographic mode:
   *
   * Search deeper into each query before
   * applying the user's travel radius.
   *
   * Standard mode:
   *
   * Preserve the lighter V1 retrieval path.
   */
  const groups =
    await Promise.all(
      queries.map(
        async (query) => {
          try {
            if (useGeoRetrieval) {
              return await retrieveGeoAwareQuery(
                query
              );
            }

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

  const deduplicated =
    deduplicateCandidateGroups(
      groups
    );

  const geographicallyFiltered =
    useGeoRetrieval && intent
      ? filterCandidatesByDistance(
          deduplicated,
          intent
        )
      : deduplicated;

  return {
    queries,

    candidates:
      geographicallyFiltered.slice(
        0,
        maxCandidates
      ),
  };
}
