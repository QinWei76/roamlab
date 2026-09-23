import { NextResponse } from "next/server";

import type {
  WildIntent,
  WildSchedule,
} from "@/types/wild";

import {
  discoverDestinations,
} from "@/lib/destination/discovery";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    /**
     * Temporary test Wild:
     *
     * User wants a mountain hiking trip.
     *
     * We intentionally keep difficulty / vibe here
     * even though the current matching engine does
     * not score them yet.
     */
    const intent: WildIntent = {
      destinationMode: "discover",

      activities: [
        "hike",
      ],

      environments: [
        "mountain",
      ],

      difficulty:
        "moderate",

      vibes: [
        "scenic",
      ],
    };

    /**
     * Schedule is already part of the discovery
     * pipeline, but current V1 matching does not
     * make unsupported seasonal claims from it.
     */
    const schedule: WildSchedule = {
      timingMode:
        "undecided",

      durationType:
        "weekend",

      days: 2,
      nights: 1,
    };

    const result =
      await discoverDestinations({
        intent,
        schedule,

        /**
         * Keep this test deliberately controlled.
         *
         * Retrieval:
         * up to 15 results per query
         *
         * Candidate pool:
         * up to 40 unique real areas
         *
         * Enrichment:
         * first 20 candidates
         * max 5 concurrent RIDB activity requests
         *
         * Final:
         * Top 5
         */
        options: {
          perQueryLimit: 15,
          maxCandidates: 40,
          enrichmentLimit: 20,
          enrichmentConcurrency: 5,
          matchLimit: 5,
        },
      });

    /**
     * Keep the test response readable.
     *
     * We do not return the entire candidate pool.
     * Instead we expose enough information to verify
     * retrieval, enrichment, evidence and matching.
     */
    return NextResponse.json({
      success: true,

      testIntent: {
        activities:
          intent.activities,

        environments:
          intent.environments,

        difficulty:
          intent.difficulty,

        vibes:
          intent.vibes,

        duration: {
          type:
            schedule.durationType,

          days:
            schedule.days,

          nights:
            schedule.nights,
        },
      },

      retrievalQueries:
        result.queries,

      candidateCount:
        result.candidateCount,

      matchCount:
        result.matches.length,

      matches:
        result.matches.map(
          (match) => ({
            source:
              match.source,

            sourceId:
              match.sourceId,

            name:
              match.name,

            latitude:
              match.latitude,

            longitude:
              match.longitude,

            /**
             * Normalized destination activities.
             *
             * [] means the candidate was enriched
             * but no RIDB activity mapped to a
             * RoamLab WildActivity.
             *
             * undefined means structured activity
             * enrichment was not available.
             */
            activities:
              match.activities,

            /**
             * Destination Evidence V2.
             *
             * This allows the test endpoint to
             * verify exactly WHY RoamLab considers
             * a destination relevant.
             *
             * Activity evidence should come from
             * structured RIDB enrichment whenever
             * available.
             *
             * Environment evidence is currently
             * conservative derived evidence from
             * explicit destination landscape text.
             */
            evidence:
              match.evidence,

            /**
             * Calculated geographic distance from
             * the selected starting point when an
             * origin is available.
             */
            distanceKm:
              match.distanceKm,

            matchScore:
              match.matchScore,

            matchReasons:
              match.matchReasons,

            whyItFits:
              match.whyItFits,
          })
        ),
    });
  } catch (error) {
    console.error(
      "Destination discovery test failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown destination discovery error",
      },
      {
        status: 500,
      }
    );
  }
}
