import type {
  WildActivity,
} from "@/types/wild";

export type DestinationSource =
  | "ridb"
  | "nps"
  | "other";

export type DestinationMatchReason =
  | "activity"
  | "environment"
  | "distance"
  | "difficulty"
  | "vibe"
  | "season";

export interface DestinationCandidate {
  /**
   * Stable external source identity.
   */
  source: DestinationSource;
  sourceId: string;

  /**
   * Core destination identity.
   */
  name: string;
  description?: string;

  /**
   * Geographic data.
   */
  latitude: number;
  longitude: number;

  /**
   * Distance from the user's starting point.
   * Filled later by the matching engine.
   */
  distanceKm?: number;

  /**
   * Verified destination activities.
   *
   * External provider activity vocabularies
   * must be mapped into RoamLab WildActivity
   * values before being stored here.
   */
  activities?: WildActivity[];

  /**
   * Destination environments.
   *
   * This remains string[] for now because
   * we do not yet have a verified structured
   * environment source equivalent to RIDB
   * structured activities.
   */
  environments?: string[];

  /**
   * Useful factual metadata.
   */
  feeDescription?: string;
  reservationUrl?: string;
  mapUrl?: string;

  /**
   * RoamLab matching layer.
   */
  matchScore?: number;
  matchReasons?: DestinationMatchReason[];

  /**
   * Human-readable explanation shown later
   * in Destination Matches.
   */
  whyItFits?: string;
}
