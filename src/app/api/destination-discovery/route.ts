import { NextResponse } from "next/server";

import type {
  WildIntent,
  WildSchedule,
} from "@/types/wild";

import {
  discoverDestinations,
} from "@/lib/destination/discovery";

export const dynamic = "force-dynamic";

/**
 * Request body sent by the Wild Destination page.
 *
 * The browser owns the Current Wild because V1 uses
 * localStorage. The client therefore sends only the
 * destination-discovery inputs required by the server.
 */
type DestinationDiscoveryRequest = {
  intent?: WildIntent;
  schedule?: WildSchedule;
};

/**
 * POST /api/destination-discovery
 *
 * Convert the current Wild Intent + Schedule into
 * ranked real destination recommendations.
 *
 * Pipeline:
 *
 * Wild Intent + Schedule
 *        ↓
 * RIDB candidate retrieval
 *        ↓
 * Preliminary matching
 *        ↓
 * Controlled activity enrichment
 *        ↓
 * Final matching
 *        ↓
 * Top destination recommendations
 */
export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as
        DestinationDiscoveryRequest;

    const {
      intent,
      schedule,
    } = body;

    /**
     * Discovery requires at least some intent.
     *
     * We deliberately do not invent preferences
     * on the server when the Wild has not captured
     * them yet.
     */
    if (!intent) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Wild intent is required for destination discovery.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await discoverDestinations({
        intent,
        schedule,

        options: {
          /**
           * Keep the production request controlled.
           *
           * Retrieval:
           * up to 15 RIDB results per query
           *
           * Candidate pool:
           * up to 40 unique destinations
           *
           * Enrichment:
           * top 20 preliminary matches
           *
           * Final:
           * top 5 destinations
           */
          perQueryLimit: 15,
          maxCandidates: 40,
          enrichmentLimit: 20,
          enrichmentConcurrency: 5,
          matchLimit: 5,
        },
      });

    return NextResponse.json({
      success: true,

      /**
       * Useful lightweight metadata for the UI
       * and future debugging.
       */
      candidateCount:
        result.candidateCount,

      matches:
        result.matches.map(
          (match) => ({
            source:
              match.source,

            sourceId:
              match.sourceId,

            name:
              match.name,

            description:
              match.description,

            latitude:
              match.latitude,

            longitude:
              match.longitude,

            /**
             * Normalized destination activities.
             */
            activities:
              match.activities,

            /**
             * Destination Evidence V2.
             *
             * Activity evidence:
             * structured RIDB activities are
             * recorded as verified evidence.
             *
             * Environment evidence:
             * conservative landscape signals
             * derived from provider destination
             * information.
             *
             * This evidence is intentionally kept
             * separate from matchScore.
             */
            evidence:
              match.evidence,

            /**
             * Straight-line geographic distance
             * calculated from the user's selected
             * starting point to the destination's
             * fixed coordinates.
             */
            distanceKm:
              match.distanceKm,

            /**
             * RoamLab ranking output.
             */
            matchScore:
              match.matchScore,

            matchReasons:
              match.matchReasons,

            /**
             * Legacy human-readable explanation.
             *
             * Kept for now while the Destination
             * UI transitions to structured Evidence
             * V2 presentation.
             */
            whyItFits:
              match.whyItFits,
          })
        ),
    });
  } catch (error) {
    console.error(
      "Destination discovery failed:",
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
