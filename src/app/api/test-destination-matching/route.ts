import { NextResponse } from "next/server";

import {
  getRidbDestinationCandidates,
} from "@/lib/destination/ridb";

import {
  getTopDestinationMatches,
} from "@/lib/destination/matching";

import type {
  WildIntent,
} from "@/types/wild";

export async function GET() {
  try {
    /*
     * Temporary test intent.
     *
     * This does NOT modify Current Wild.
     * It exists only to verify the matching pipeline.
     */
    const intent: WildIntent = {
      destinationMode: "discover",

      activities: [
        "hike",
      ],

      environments: [
        "mountain",
      ],

      difficulty: "moderate",

      vibes: [
        "scenic",
      ],
    };

    /*
     * Fetch real recreation areas from RIDB.
     *
     * We deliberately request more than the final
     * number of matches so the matching engine has
     * candidates to rank.
     */
    const candidates =
      await getRidbDestinationCandidates({
        limit: 50,
      });

    const matches =
      getTopDestinationMatches(
        {
          intent,
          candidates,
        },
        5
      );

    return NextResponse.json({
      success: true,

      intent,

      candidateCount:
        candidates.length,

      matchCount:
        matches.length,

      matches: matches.map(
        (match) => ({
          source: match.source,
          sourceId: match.sourceId,

          name: match.name,

          latitude:
            match.latitude,

          longitude:
            match.longitude,

          distanceKm:
            match.distanceKm,

          matchScore:
            match.matchScore,

          matchReasons:
            match.matchReasons,

          whyItFits:
            match.whyItFits,

          description:
            match.description,
        })
      ),

      note:
        "V1 matching uses only evidence available in current RIDB candidate data. Difficulty, vibe and season are not yet scored.",
    });
  } catch (error) {
    console.error(
      "Destination matching test failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown destination matching error",
      },
      {
        status: 500,
      }
    );
  }
}
