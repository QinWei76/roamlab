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
  matchDestinations,
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
   *
   * This also acts as the preliminary shortlist size.
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
   * before preliminary matching and enrichment.
   */
  candidateCount: number;

  /**
   * Preliminary shortlist after controlled
   * activity enrichment.
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

const DEFAULT_ENRICHMENT_LIMIT = 20;
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
 * Preliminary Matching
 *      ↓
 * Candidate Shortlist
 *      ↓
 * Controlled Activity Enrichment
 *      ↓
 * Final Matching / Ranking
 *      ↓
 * Top Real Destination Matches
 *
 * Important:
 *
 * Preliminary matching uses the same matching engine
 * as final ranking.
 *
 * Before activity enrichment, candidates without
 * structured activity data may use textual activity
 * evidence as fallback.
 *
 * After enrichment, matching.ts automatically prefers
 * structured RIDB activity evidence.
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
   * Run preliminary matching before enrichment.
   *
   * At this stage most candidates do not yet have
   * structured RIDB activity data, so matching.ts
   * may use textual activity evidence as fallback.
   *
   * This gives us a relevance-based shortlist instead
   * of simply enriching the first candidates returned
   * by RIDB.
   */
  const preliminaryMatches =
    matchDestinations({
      intent,
      schedule,
      candidates:
        retrieval.candidates,
    });

  /**
   * STEP 3
   *
   * Select a controlled shortlist for structured
   * activity enrichment.
   */
  const enrichmentLimit =
    Math.max(
      0,
      Math.min(
        options?.enrichmentLimit ??
          DEFAULT_ENRICHMENT_LIMIT,
        preliminaryMatches.length
      )
    );

  const shortlist =
    preliminaryMatches
      .slice(
        0,
        enrichmentLimit
      )
      .map(
        ({
          matchScore: _matchScore,
          matchReasons: _matchReasons,
          whyItFits: _whyItFits,
          ...candidate
        }) => candidate
      );

  /**
   * STEP 4
   *
   * Enrich the shortlisted RIDB candidates with
   * verified structured activity data.
   *
   * Because the shortlist is already bounded,
   * enrichment.ts receives the complete shortlist.
   */
  const enrichedCandidates =
    await enrichDestinationCandidates(
      shortlist,
      {
        limit:
          shortlist.length,

        concurrency:
          options?.enrichmentConcurrency,
      }
    );

  /**
   * STEP 5
   *
   * Run final matching against the enriched shortlist.
   *
   * matching.ts will now use structured RIDB activity
   * evidence whenever enrichment succeeded.
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
