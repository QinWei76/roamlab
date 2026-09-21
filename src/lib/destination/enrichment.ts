import type {
  DestinationCandidate,
} from "@/lib/destination/types";

import {
  getRidbRecAreaActivities,
} from "@/lib/destination/ridb";

import {
  getWildActivitiesFromRidb,
} from "@/lib/destination/activityMapping";

export type EnrichmentOptions = {
  /**
   * Maximum number of candidates that may trigger
   * additional RIDB activity requests.
   *
   * This prevents a large candidate pool from
   * accidentally creating hundreds of API calls.
   */
  limit?: number;

  /**
   * Number of RIDB activity requests allowed to run
   * at the same time.
   */
  concurrency?: number;
};

const DEFAULT_ENRICHMENT_LIMIT = 20;
const DEFAULT_CONCURRENCY = 5;

/**
 * Enrich one RIDB candidate with verified
 * structured activity data.
 *
 * Non-RIDB candidates are returned unchanged.
 *
 * If RIDB activity enrichment fails, the candidate
 * is still preserved. Destination discovery should
 * not fail completely because one enrichment request
 * failed.
 */
export async function enrichDestinationCandidate(
  candidate: DestinationCandidate
): Promise<DestinationCandidate> {
  if (candidate.source !== "ridb") {
    return candidate;
  }

  try {
    const ridbActivities =
      await getRidbRecAreaActivities(
        candidate.sourceId
      );

    const activities =
      getWildActivitiesFromRidb(
        ridbActivities
      );

    return {
      ...candidate,
      activities,
    };
  } catch (error) {
    console.error(
      `RIDB activity enrichment failed for ${candidate.sourceId}:`,
      error
    );

    return candidate;
  }
}

/**
 * Small concurrency-controlled worker.
 *
 * We deliberately avoid firing every RIDB request
 * at once with a large Promise.all().
 */
async function enrichBatch(
  candidates: DestinationCandidate[],
  concurrency: number
): Promise<DestinationCandidate[]> {
  const results:
    DestinationCandidate[] =
    new Array(candidates.length);

  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex =
        nextIndex;

      nextIndex += 1;

      if (
        currentIndex >=
        candidates.length
      ) {
        return;
      }

      results[currentIndex] =
        await enrichDestinationCandidate(
          candidates[currentIndex]
        );
    }
  }

  const workerCount =
    Math.min(
      concurrency,
      candidates.length
    );

  await Promise.all(
    Array.from(
      {
        length: workerCount,
      },
      () => worker()
    )
  );

  return results;
}

/**
 * Enrich a controlled subset of destination
 * candidates with verified RIDB activities.
 *
 * Candidates outside the enrichment limit remain
 * in the result unchanged.
 *
 * Order is preserved.
 */
export async function enrichDestinationCandidates(
  candidates: DestinationCandidate[],
  options?: EnrichmentOptions
): Promise<DestinationCandidate[]> {
  if (candidates.length === 0) {
    return [];
  }

  const limit =
    Math.max(
      0,
      Math.min(
        options?.limit ??
          DEFAULT_ENRICHMENT_LIMIT,
        candidates.length
      )
    );

  const concurrency =
    Math.max(
      1,
      Math.min(
        options?.concurrency ??
          DEFAULT_CONCURRENCY,
        10
      )
    );

  if (limit === 0) {
    return candidates;
  }

  const candidatesToEnrich =
    candidates.slice(
      0,
      limit
    );

  const remainingCandidates =
    candidates.slice(
      limit
    );

  const enriched =
    await enrichBatch(
      candidatesToEnrich,
      concurrency
    );

  return [
    ...enriched,
    ...remainingCandidates,
  ];
}
