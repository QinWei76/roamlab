import type {
  WildIntent,
  WildSchedule,
} from "@/types/wild";

import type {
  DestinationCandidate,
} from "@/lib/destination/types";

import type {
  DestinationMatch,
} from "@/lib/destination/matching";

import {
  retrieveDestinationCandidates,
} from "@/lib/destination/retrieval";

import {
  enrichDestinationCandidates,
} from "@/lib/destination/enrichment";

import {
  getTopDestinationMatches,
} from "@/lib/destination/matching";

export type DestinationDiscoveryOptions = {
  /**
   * Number of results requested from RIDB
   * for each retrieval query.
   */
  perQueryLimit?: number;

  /**
   * Maximum size of the merged retrieval pool.
   */
  maxCandidates?: number;

  /**
   * Maximum number of candidates that receive
   * structured RIDB activity enrichment.
   */
  enrichmentLimit?: number;

  /**
   * Maximum number of enrichment requests running
   * at the same time.
   */
  enrichmentConcurrency?: number;

  /**
   * Number of final destination matches returned.
   */
  matchLimit?: number;
};

export type DestinationDiscoveryInput = {
  intent?: WildIntent;
  schedule?: WildSchedule;
  options?: DestinationDiscoveryOptions;
};

export type DestinationDiscoveryResult = {
  /**
   * Queries used to retrieve the real RIDB
   * candidate pool.
   */
  queries: string[];

  /**
   * Number of unique real candidates retrieved
   * before enrichment and ranking.
   */
  candidateCount: number;

  /**
   * Candidate pool after controlled enrichment.
   *
   * Kept here for testing/debugging. The final UI
   * normally only needs matches.
   */
  candidates: DestinationCandidate[];

  /**
   * Final ranked destination recommendations.
   */
  matches: DestinationMatch[];
};

const DEFAULT_MATCH_LIMIT = 5;

/**
 * Complete RoamLab destination discovery pipeline.
 *
 * Wild Intent
 *      ↓
 * Candidate Retrieval
 *      ↓
 * Real RIDB Recreation Areas
 *      ↓
 * Controlled Activity Enrichment
 *      ↓
 * RoamLab Matching / Ranking
 *      ↓
 * Top Real Destination Matches
 */
export async function discoverDestinations(
  input: DestinationDiscoveryInput
): Promise<DestinationDiscoveryResult> {
  const {
    intent,
    schedule,
    options,
  } = input;

  /**
   * STEP 1
   *
   * Retrieve a relevant pool of real destination
   * candidates from RIDB.
   */
  const retrieval =
    await retrieveDestinationCandidates(
      intent,
      {
        perQueryLimit:
          options?.perQueryLimit,

        maxCandidates:
          options?.maxCandidates,
      }
    );

  /**
   * STEP 2
   *
   * Enrich a controlled subset with verified
   * structured RIDB activities.
   *
   * We deliberately do not enrich an unlimited
   * candidate pool.
   */
  const enrichedCandidates =
    await enrichDestinationCandidates(
      retrieval.candidates,
      {
        limit:
          options?.enrichmentLimit,

        concurrency:
          options?.enrichmentConcurrency,
      }
    );

  /**
   * STEP 3
   *
   * Rank candidates against the Wild Intent.
   *
   * matching.ts decides whether structured activity
   * evidence or textual fallback may be used.
   */
  const matchLimit =
    Math.max(
      1,
      Math.min(
        options?.matchLimit ??
          DEFAULT_MATCH_LIMIT,
        10
      )
    );

  const matches =
    getTopDestinationMatches(
      {
        intent,
        schedule,
        candidates:
          enrichedCandidates,
      },
      matchLimit
    );

  return {
    queries:
      retrieval.queries,

    candidateCount:
      retrieval.candidates.length,

    candidates:
      enrichedCandidates,

    matches,
  };
}
