import type {
  WildActivity,
} from "@/types/wild";

import type {
  RidbActivity,
} from "@/lib/destination/ridb";

export type MappedRidbActivity = {
  ridbId: string;
  ridbName: string;
  wildActivity?: WildActivity;
};

/**
 * RIDB uses its own activity vocabulary.
 *
 * RoamLab must not assume that every RIDB
 * activity has an equivalent WildActivity.
 *
 * If there is no reliable equivalent,
 * leave it unmapped.
 */
const RIDB_TO_WILD_ACTIVITY: Record<
  string,
  WildActivity | undefined
> = {
  HIKING: "hike",

  BIKING: "bike",

  CAMPING: "camp",

  BACKPACKING: "backpack",

  KAYAKING: "kayak",

  CANOEING: "canoe",

  PADDLING: "paddle",

  CLIMBING: "climb",

  FISHING: "fish",

  "TRAIL RUNNING": "trail-run",

  SKIING: "ski",

  SNOWBOARDING: "snowboard",

  SNOWSHOEING: "snowshoe",

  PHOTOGRAPHY: "photography",

  "WILDLIFE VIEWING": "wildlife",

  BIRDING: "wildlife",

  BEACHCOMBING: "beach",
};

function normalizeRidbActivityName(
  name: string
): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

/**
 * Convert one RIDB activity into a mapping record.
 *
 * We always preserve the original RIDB fact,
 * even when RoamLab has no matching activity type.
 */
export function mapRidbActivity(
  activity: RidbActivity
): MappedRidbActivity {
  const normalizedName =
    normalizeRidbActivityName(
      activity.name
    );

  return {
    ridbId: activity.id,

    ridbName: activity.name,

    wildActivity:
      RIDB_TO_WILD_ACTIVITY[
        normalizedName
      ],
  };
}

/**
 * Convert a list of RIDB activities while
 * preserving both mapped and unmapped facts.
 */
export function mapRidbActivities(
  activities: RidbActivity[]
): MappedRidbActivity[] {
  return activities.map(
    mapRidbActivity
  );
}

/**
 * Return only RoamLab activities that are
 * supported by verified RIDB activity data.
 *
 * Duplicates are removed.
 *
 * Example:
 *
 * WILDLIFE VIEWING -> wildlife
 * BIRDING          -> wildlife
 *
 * becomes:
 *
 * ["wildlife"]
 */
export function getWildActivitiesFromRidb(
  activities: RidbActivity[]
): WildActivity[] {
  const mapped =
    mapRidbActivities(
      activities
    );

  const wildActivities =
    mapped
      .map(
        (activity) =>
          activity.wildActivity
      )
      .filter(
        (
          activity
        ): activity is WildActivity =>
          activity !== undefined
      );

  return Array.from(
    new Set(wildActivities)
  );
}

/**
 * Check whether verified RIDB activity data
 * supports a specific RoamLab activity.
 */
export function ridbSupportsWildActivity(
  activities: RidbActivity[],
  wildActivity: WildActivity
): boolean {
  return getWildActivitiesFromRidb(
    activities
  ).includes(
    wildActivity
  );
}
